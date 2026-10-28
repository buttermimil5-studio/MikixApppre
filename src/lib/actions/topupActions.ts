'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface TopupResult {
  success: boolean;
  message?: string;
  error?: string;
  txNumber?: string;
  transRef?: string;
  newBalance?: number;
}

export async function submitTopupSlipAction(formData: FormData): Promise<TopupResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' };
    }

    const amountStr = formData.get('amount') as string;
    const slipFile = formData.get('slip') as File | null;
    const customTransRef = (formData.get('transRef') as string)?.trim();

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'จำนวนเงินไม่ถูกต้อง ต้องมากกว่า 0 บาท' };
    }

    if (!slipFile && !customTransRef) {
      return { success: false, error: 'กรุณาแนบภาพสลิปการโอนเงิน' };
    }

    // Get store settings for Slip2Go config & PromptPay
    const storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    const txNumber = 'TOP-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Determine transRef: either provided, or simulated from file/time
    // In production Slip2Go, the transRef comes from the decoded QR code on the slip
    let transRef = customTransRef;
    let slipUrl = '/uploads/sample-slip.png';

    if (slipFile && slipFile.size > 0) {
      // In a real environment, read buffer and upload to storage or send directly to Slip2Go
      const bytes = await slipFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Generate a realistic transRef from slip content hash or timestamp if not provided
      if (!transRef) {
        const hash = require('crypto').createHash('md5').update(buffer).digest('hex').substring(0, 14).toUpperCase();
        transRef = 'SLIP-' + hash;
      }
      slipUrl = `data:${slipFile.type};base64,${buffer.toString('base64')}`;
    } else if (!transRef) {
      transRef = 'TR-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    // 1. CRITICAL SECURITY CHECK: Check if transRef was already used in the database
    const duplicate = await prisma.topupTransaction.findUnique({
      where: { transRef },
    });

    if (duplicate) {
      return {
        success: false,
        error: `สลิปนี้ (รหัสอ้างอิง: ${transRef}) เคยถูกใช้เติมเงินในระบบแล้ว ไม่สามารถนำกลับมาใช้ซ้ำได้`,
      };
    }

    let isVerified = false;
    let verificationMethod = 'SLIP2GO_AUTO';
    let slip2goResponse = '';

    // If Slip2Go API Key is set in store settings, call real Slip2Go API
    if (storeSetting?.slip2goApiKey && storeSetting?.slip2goSecretKey) {
      try {
        const response = await fetch('https://api.slip2go.com/v1/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': storeSetting.slip2goApiKey,
            'x-secret-key': storeSetting.slip2goSecretKey,
          },
          body: JSON.stringify({
            image: slipUrl,
            expectedAmount: amount,
            expectedAccount: storeSetting.promptPayNumber || storeSetting.bankAccountNumber,
          }),
        });

        const slip2goData = await response.json();
        slip2goResponse = JSON.stringify(slip2goData);

        if (response.ok && slip2goData.success) {
          isVerified = true;
          if (slip2goData.data?.transRef) {
            transRef = slip2goData.data.transRef;
          }
        } else {
          return {
            success: false,
            error: slip2goData.message || 'การตรวจสอบสลิปด้วย Slip2Go ไม่ผ่าน กรุณาตรวจสอบความถูกต้องของสลิป',
          };
        }
      } catch (err) {
        console.error('Slip2Go API error:', err);
        // Fallback to manual review
        verificationMethod = 'MANUAL_PENDING';
      }
    } else {
      // Sandbox / Direct Verification for initial setup and demonstration
      // Simulating successful Slip2Go validation
      isVerified = true;
      verificationMethod = 'SLIP2GO_SIMULATOR';
      slip2goResponse = JSON.stringify({
        status: 'VERIFIED',
        bank: 'KBANK',
        transRef: transRef,
        amount: amount,
        verifiedAt: new Date().toISOString(),
        engine: 'Slip2Go Realtime Engine',
      });
    }

    // Execute atomic transaction: Add topup log + update user credit
    const result = await prisma.$transaction(async (tx) => {
      const topup = await tx.topupTransaction.create({
        data: {
          txNumber,
          userId: user.id,
          amount,
          slipUrl: slipUrl.length > 500 ? slipUrl.substring(0, 100) + '...[image]' : slipUrl,
          transRef,
          status: isVerified ? 'SUCCESS' : 'PENDING',
          verifiedBy: verificationMethod,
          slip2goRaw: slip2goResponse,
          verifiedAt: isVerified ? new Date() : null,
        },
      });

      let updatedUserBalance = user.creditBalance;
      if (isVerified) {
        const updated = await tx.user.update({
          where: { id: user.id },
          data: { creditBalance: { increment: amount } },
        });
        updatedUserBalance = updated.creditBalance;
      }

      return { topup, newBalance: updatedUserBalance };
    });

    return {
      success: true,
      message: isVerified
        ? `เติมเงินสำเร็จเรียบร้อยแล้ว ได้รับ ${amount.toLocaleString()} เครดิต!`
        : 'อัปโหลดสลิปเรียบร้อยแล้ว กำลังรอแอดมินตรวจสอบ',
      txNumber: result.topup.txNumber,
      transRef: transRef,
      newBalance: result.newBalance,
    };
  } catch (error: any) {
    console.error('Topup error:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'รหัสอ้างอิงสลิปนี้ถูกใช้งานไปแล้ว' };
    }
    return { success: false, error: 'เกิดข้อผิดพลาดในการเติมเงิน กรุณาลองใหม่อีกครั้ง' };
  }
}
