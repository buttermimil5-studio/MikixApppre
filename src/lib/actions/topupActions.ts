'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

interface TopupResult {
  success: boolean;
  message?: string;
  error?: string;
  txNumber?: string;
  transRef?: string;
  newBalance?: number;
}

// Embedded Slip2Go Secret Key locked server-side
const EMBEDDED_SLIP2GO_SECRET_KEY = '0ENX+v4FPCdJoiIWAnOIkAisDfArZuIXmMThG5klPT0=';
const SLIP2GO_API_URL = 'https://connect.slip2go.com/api/verify-slip/qr-base64/info';

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

    const txNumber = 'TOP-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    let transRef = customTransRef;
    let slipUrl = '/uploads/sample-slip.png';
    let base64Data = '';

    if (slipFile && slipFile.size > 0) {
      const bytes = await slipFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save slip image to disk for admin auditing and viewing
      try {
        const fileExt = slipFile.type?.includes('jpeg') ? 'jpg' : slipFile.type?.includes('webp') ? 'webp' : 'png';
        const fileName = `${txNumber}.${fileExt}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slips');
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);
        slipUrl = `/uploads/slips/${fileName}`;
      } catch (saveErr) {
        console.error('Failed to save slip to disk:', saveErr);
      }

      const mimeType = slipFile.type || 'image/jpeg';
      base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    let isVerified = false;
    let verificationMethod = 'SLIP2GO_AUTO';
    let slip2goResponse = '';

    const secretKey = process.env.SLIP2GO_SECRET_KEY || EMBEDDED_SLIP2GO_SECRET_KEY;

    if (base64Data) {
      try {
        const response = await fetch(SLIP2GO_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secretKey}`,
          },
          body: JSON.stringify({
            payload: {
              imageBase64: base64Data,
            },
          }),
        });

        const slip2goData = await response.json();
        slip2goResponse = JSON.stringify(slip2goData);

        if (response.ok && (slip2goData.code === '200000' || slip2goData.code === '200200')) {
          // Valid slip from bank network
          isVerified = true;
          if (slip2goData.data?.transRef) {
            transRef = slip2goData.data.transRef;
          }

          // Check if transferred amount matches expected amount
          if (typeof slip2goData.data?.amount === 'number') {
            const verifiedAmount = slip2goData.data.amount;
            if (Math.abs(verifiedAmount - amount) > 0.01) {
              return {
                success: false,
                error: `ยอดเงินในสลิป (${verifiedAmount.toLocaleString()} บาท) ไม่ตรงกับยอดเงินที่ระบุ (${amount.toLocaleString()} บาท)`,
              };
            }
          }
        } else if (slip2goData.code === '200500') {
          // Explicit fraud / fake / unrecognized slip
          return {
            success: false,
            error: 'ระบบตรวจสอบไม่พบข้อมูลสลิปนี้ หรือสลิปไม่ถูกต้องตามฐานข้อมูลธนาคาร กรุณาใช้สลิปโอนเงินจริง',
          };
        } else if (slip2goData.code === '200501') {
          // Duplicate slip detected by Slip2Go
          return {
            success: false,
            error: 'สลิปนี้ถูกใช้งานไปแล้วในระบบ Slip2Go ไม่สามารถนำกลับมาใช้ซ้ำได้',
          };
        } else {
          // Other validation issues (e.g. unreadable image or wrong format)
          return {
            success: false,
            error: slip2goData.message || 'การตรวจสอบสลิปไม่ผ่าน กรุณาตรวจสอบรูปภาพสลิปให้คมชัดและลองอีกครั้ง',
          };
        }
      } catch (err: any) {
        console.error('Slip2Go connection error:', err);
        // Fallback to manual review if Slip2Go is unreachable
        isVerified = false;
        verificationMethod = 'MANUAL_PENDING';
      }
    } else {
      // No image uploaded, only custom transRef provided: manual admin verification
      isVerified = false;
      verificationMethod = 'MANUAL_PENDING';
    }

    // Determine final transRef
    if (!transRef) {
      transRef = 'TR-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    }

    // Duplicate check in our local database
    const duplicate = await prisma.topupTransaction.findUnique({
      where: { transRef },
    });

    if (duplicate) {
      return {
        success: false,
        error: `สลิปนี้ (รหัสอ้างอิง: ${transRef}) เคยถูกใช้เติมเงินในระบบแล้ว ไม่สามารถนำกลับมาใช้ซ้ำได้`,
      };
    }

    // Atomic transaction: create topup transaction record and update user balance if verified
    const result = await prisma.$transaction(async (tx) => {
      const topup = await tx.topupTransaction.create({
        data: {
          txNumber,
          userId: user.id,
          amount,
          slipUrl,
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
        : 'อัปโหลดสลิปเรียบร้อยแล้ว เนื่องจากอยู่ในคิวตรวจสอบ ทางแอดมินจะอนุมัติยอดเงินให้โดยเร็ว',
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
