'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { decryptCredentials, decryptStockCredentials } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

export interface PurchaseResult {
  success: boolean;
  error?: string;
  order?: {
    id: string;
    orderNumber: string;
    productName: string;
    email: string;
    password: string;
    slotName: string;
    slotPin?: string | null;
    deviceType?: string | null;
    purchasedAt: string;
    expiresAt: string;
    otpEnabled: boolean;
    lineOaUrl?: string | null;
    rules: string;
    usageGuide: string;
    hasAddon?: boolean;
    addonName?: string | null;
    addonPrice?: number;
    isGuest?: boolean;
  };
  remainingBalance?: number;
}

import { calculateSlotExpiry } from '@/lib/cutoff';
import { syncExpiredOrdersAndStocks } from './adminActions';


/**
 * Atomic purchase transaction engine
 * 1. Checks store status & user credit balance
 * 2. Locks and deducts credit
 * 3. Allocates available stock slot
 * 4. Calculates expiration timestamp from exact purchase time
 * 5. Returns decrypted credentials immediately and safely
 */
export async function purchaseProductAction(
  productId: string,
  includeAddon?: boolean
): Promise<PurchaseResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนทำรายการสั่งซื้อ' };
    }

    // 1. Check Store Setting
    const storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (storeSetting && !storeSetting.isOpen) {
      return {
        success: false,
        error: storeSetting.closedNotice || 'ขณะนี้ร้านค้าปิดทำการชั่วคราว ไม่สามารถสั่งซื้อได้',
      };
    }

    // 2. Fetch Product Details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return { success: false, error: 'สินค้านี้ไม่พร้อมจำหน่าย หรือถูกปิดการขายชั่วคราว' };
    }

    // Determine price based on user role (AGENT/ADMIN get wholesale price, others get retail price)
    const basePrice =
      user.role === 'AGENT' || user.role === 'ADMIN'
        ? product.price
        : product.retailPrice || product.price;

    const addonPrice = (includeAddon && product.addonEnabled) ? (product.addonPrice || 0) : 0;
    const effectivePrice = basePrice + addonPrice;

    // 3. Fast pre-check for user balance
    if (user.creditBalance < effectivePrice) {
      return {
        success: false,
        error: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${effectivePrice} เครดิต แต่คุณมี ${user.creditBalance} เครดิต) กรุณาเติมเงินก่อนทำรายการ`,
      };
    }

    // 4. ATOMIC PRISMA TRANSACTION
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Re-verify balance with the freshest record inside transaction
      const freshUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!freshUser || freshUser.creditBalance < effectivePrice) {
        throw new Error('INSUFFICIENT_CREDIT');
      }

      // Find an available slot for this product
      // We look for slots that are AVAILABLE within ACTIVE stocks
      // Supports both direct productId link on slot and fallback to accountStock.productId
      const availableSlot = await tx.accountProfileSlot.findFirst({
        where: {
          status: 'AVAILABLE',
          OR: [
            { productId: product.id },
            {
              productId: null,
              accountStock: {
                productId: product.id,
              },
            },
          ],
          accountStock: {
            status: { in: ['ACTIVE', 'FULL'] },
          },
        },
        include: {
          accountStock: true,
        },
        orderBy: [
          { accountStock: { createdAt: 'asc' } },
          { createdAt: 'asc' },
        ],
      });

      if (!availableSlot) {
        throw new Error('OUT_OF_STOCK');
      }

      // Deduct credit
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditBalance: { decrement: effectivePrice },
        },
      });

      // Mark slot as ASSIGNED
      await tx.accountProfileSlot.update({
        where: { id: availableSlot.id },
        data: {
          status: 'ASSIGNED',
        },
      });

      // Check remaining available slots in this stock
      const remainingSlots = await tx.accountProfileSlot.count({
        where: {
          accountStockId: availableSlot.accountStockId,
          status: 'AVAILABLE',
        },
      });

      if (remainingSlots === 0) {
        await tx.accountStock.update({
          where: { id: availableSlot.accountStockId },
          data: { status: 'FULL' },
        });
      }

      // Calculate expiration using cutoff rule
      const purchasedAt = new Date();
      const expiresAt = calculateSlotExpiry(purchasedAt, product.durationDays, product.cutoffType || 'ROUND_UP_HOUR');

      // Generate human-friendly unique order number: ORD-YYYYMMDD-XXXX
      const datePart = purchasedAt.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${datePart}-${randPart}`;

      // Create Order Record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          productId: product.id,
          profileSlotId: availableSlot.id,
          amountPaid: effectivePrice,
          hasAddon: Boolean(includeAddon && product.addonEnabled),
          addonName: (includeAddon && product.addonEnabled) ? (product.addonName || 'รับประกันเคลม') : null,
          addonPrice: addonPrice,
          purchasedAt,
          expiresAt,
          status: 'ACTIVE',
        },
      });

      // Decrypt credentials
      const { email, password } = decryptStockCredentials(availableSlot.accountStock);

      return {
        order: newOrder,
        slotName: availableSlot.slotName,
        slotPin: availableSlot.slotPin,
        deviceType: availableSlot.deviceType || 'MOBILE',
        email,
        password,
        remainingBalance: updatedUser.creditBalance,
      };
    });

    revalidatePath('/');

    return {
      success: true,
      remainingBalance: transactionResult.remainingBalance,
      order: {
        id: transactionResult.order.id,
        orderNumber: transactionResult.order.orderNumber,
        productName: product.name,
        email: transactionResult.email,
        password: transactionResult.password,
        slotName: transactionResult.slotName,
        slotPin: transactionResult.slotPin,
        deviceType: transactionResult.deviceType,
        purchasedAt: transactionResult.order.purchasedAt.toISOString(),
        expiresAt: transactionResult.order.expiresAt.toISOString(),
        otpEnabled: product.otpEnabled,
        lineOaUrl: product.lineOaUrl,
        rules: product.rules,
        usageGuide: product.usageGuide,
        hasAddon: transactionResult.order.hasAddon,
        addonName: transactionResult.order.addonName,
        addonPrice: transactionResult.order.addonPrice,
      },
    };
  } catch (error: any) {
    console.error('Purchase error:', error);
    if (error.message === 'INSUFFICIENT_CREDIT') {
      return { success: false, error: 'เครดิตของคุณไม่เพียงพอ กรุณาเติมเงิน' };
    }
    if (error.message === 'OUT_OF_STOCK') {
      return { success: false, error: 'ขออภัย ขณะนี้สินค้ารายการนี้หมดสต็อกชั่วคราว แอดมินกำลังเติมสต็อก' };
    }
    return { success: false, error: 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง' };
  }
}

/**
 * Request OTP trigger for products with OTP support
 */
export async function requestOtpAction(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'กรุณาเข้าสู่ระบบ' };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order || order.userId !== user.id) {
      return { success: false, error: 'ไม่พบรายการคำสั่งซื้อนี้' };
    }

    if (!order.product.otpEnabled) {
      return { success: false, error: 'สินค้านี้ไม่รองรับการขอ OTP' };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        otpCount: { increment: 1 },
        otpRequestedAt: new Date(),
      },
    });

    const lineUrl = order.product.lineOaUrl || 'https://line.me';
    return {
      success: true,
      message: 'ระบบบันทึกคำขอ OTP เรียบร้อยแล้ว กำลังนำท่านไปยัง LINE Official Account เพื่อรับรหัส',
      lineUrl,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error('OTP request error:', error);
    return { success: false, error: 'ไม่สามารถส่งคำขอ OTP ได้' };
  }
}

/**
 * Fetch all user orders with decrypted credentials
 */
export async function getUserOrdersAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, orders: [] };

    // Sync expired orders and stocks across the store
    await syncExpiredOrdersAndStocks();

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        product: true,
        profileSlot: {
          include: {
            accountStock: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    const formatted = orders.map((o) => {
      let email = '[รหัสหมดอายุ]';
      let password = '[รหัสหมดอายุ]';

      // Only decrypt if ACTIVE or for viewing history
      try {
        const creds = decryptStockCredentials(o.profileSlot.accountStock);
        email = creds.email;
        password = creds.password;
      } catch (e) {
        console.error(e);
      }

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        productName: o.product.name,
        imageUrl: o.product.imageUrl,
        amountPaid: o.amountPaid,
        slotName: o.profileSlot.slotName,
        slotPin: o.profileSlot.slotPin,
        deviceType: o.profileSlot.deviceType || 'MOBILE',
        email,
        password,
        purchasedAt: o.purchasedAt.toISOString(),
        expiresAt: o.expiresAt.toISOString(),
        status: o.status,
        otpEnabled: o.product.otpEnabled,
        lineOaUrl: o.product.lineOaUrl,
        rules: o.product.rules,
        usageGuide: o.product.usageGuide,
        hasAddon: o.hasAddon,
        addonName: o.addonName,
        addonPrice: o.addonPrice,
      };
    });

    return { success: true, orders: formatted };
  } catch (error) {
    console.error('Get orders error:', error);
    return { success: false, orders: [] };
  }
}

// Embedded Slip2Go Secret Key fallback
const EMBEDDED_SLIP2GO_SECRET_KEY = '0ENX+v4FPCdJoiIWAnOIkAisDfArZuIXmMThG5klPT0=';
const SLIP2GO_API_URL = 'https://connect.slip2go.com/api/verify-slip/qr-base64/info';

/**
 * Guest Direct Checkout engine
 * 1. Checks store status & product availability
 * 2. Pre-checks available stock slot
 * 3. Verifies transfer slip via Slip2Go API
 * 4. Checks duplicate transRef
 * 5. Uses or creates system guest user 'guest_retail'
 * 6. Atomically allocates slot, creates order & topup transaction records
 * 7. Returns decrypted credentials instantly on screen
 */
export async function guestPurchaseWithSlipAction(
  productId: string,
  formData: FormData
): Promise<PurchaseResult> {
  try {
    // 1. Check Store Setting
    const storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (storeSetting && !storeSetting.isOpen) {
      return {
        success: false,
        error: storeSetting.closedNotice || 'ขณะนี้ร้านค้าปิดทำการชั่วคราว ไม่สามารถสั่งซื้อได้',
      };
    }

    // 2. Fetch Product Details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return { success: false, error: 'สินค้านี้ไม่พร้อมจำหน่าย หรือถูกปิดการขายชั่วคราว' };
    }

    const includeAddon = formData.get('includeAddon') === 'true';
    const addonPrice = (includeAddon && product.addonEnabled) ? (product.addonPrice || 0) : 0;
    const requiredPrice = (product.retailPrice || product.price) + addonPrice;

    // 3. Fast pre-check for stock availability
    const availableSlotCheck = await prisma.accountProfileSlot.findFirst({
      where: {
        status: 'AVAILABLE',
        OR: [
          { productId: product.id },
          {
            productId: null,
            accountStock: {
              productId: product.id,
            },
          },
        ],
        accountStock: {
          status: { in: ['ACTIVE', 'FULL'] },
        },
      },
    });

    if (!availableSlotCheck) {
      return {
        success: false,
        error: 'ขออภัย ขณะนี้สินค้ารายการนี้หมดสต็อกชั่วคราว กรุณาติดต่อแอดมินหรือรอเติมสต็อก',
      };
    }

    // 4. Handle Slip File & Verification
    const slipFile = formData.get('slip') as File | null;
    const customTransRef = (formData.get('transRef') as string)?.trim();

    if (!slipFile && !customTransRef) {
      return { success: false, error: 'กรุณาแนบภาพสลิปการโอนเงินเพื่อตรวจสอบ' };
    }

    const txNumber = 'GUEST-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    let transRef = customTransRef;
    let slipUrl = '/uploads/sample-slip.png';
    let base64Data = '';

    if (slipFile && slipFile.size > 0) {
      const bytes = await slipFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

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

    const secretKey = storeSetting?.slip2goSecretKey || process.env.SLIP2GO_SECRET_KEY || EMBEDDED_SLIP2GO_SECRET_KEY;

    if (!base64Data) {
      return { success: false, error: 'กรุณาอัปโหลดรูปภาพสลิปที่ชัดเจนเพื่อตรวจสอบการโอนเงิน' };
    }

    // Call Slip2Go API
    let slip2goResponse = '';
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
        if (slip2goData.data?.transRef) {
          transRef = slip2goData.data.transRef;
        }

        if (typeof slip2goData.data?.amount === 'number') {
          const verifiedAmount = slip2goData.data.amount;
          if (verifiedAmount < requiredPrice - 0.01) {
            return {
              success: false,
              error: `ยอดเงินในสลิป (${verifiedAmount.toLocaleString()} บาท) ไม่ตรงกับราคาสินค้า (${requiredPrice.toLocaleString()} บาท)`,
            };
          }
        }
      } else if (slip2goData.code === '200500') {
        return {
          success: false,
          error: 'ระบบตรวจสอบไม่พบข้อมูลสลิปนี้ หรือสลิปไม่ถูกต้องตามฐานข้อมูลธนาคาร กรุณาใช้สลิปโอนเงินจริง',
        };
      } else if (slip2goData.code === '200501') {
        return {
          success: false,
          error: 'สลิปนี้ถูกใช้งานไปแล้วในระบบ Slip2Go ไม่สามารถนำกลับมาใช้ซ้ำได้',
        };
      } else {
        return {
          success: false,
          error: slip2goData.message || 'การตรวจสอบสลิปไม่ผ่าน กรุณาตรวจสอบรูปภาพสลิปให้คมชัดและลองอีกครั้ง',
        };
      }
    } catch (apiErr) {
      console.error('Slip2Go connection error in guest purchase:', apiErr);
      return {
        success: false,
        error: 'ระบบตรวจสอบสลิปขัดข้องชั่วคราว กรุณาติดต่อแอดมินเพื่อรับบัญชี',
      };
    }

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
        error: `สลิปนี้ (รหัสอ้างอิง: ${transRef}) เคยถูกใช้ในระบบแล้ว ไม่สามารถนำกลับมาใช้ซ้ำได้`,
      };
    }

    // 5. Ensure System Guest User exists
    let guestUser = await prisma.user.findUnique({
      where: { username: 'guest_retail' },
    });
    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          username: 'guest_retail',
          passwordHash: 'GUEST_NO_LOGIN_HASH',
          role: 'CUSTOMER',
          profileName: 'ลูกค้าหน้าร้าน (Guest)',
          creditBalance: 0.0,
        },
      });
    }

    // 6. ATOMIC TRANSACTION: Allocate slot, create Order and Topup record
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Find and lock available slot
      const availableSlot = await tx.accountProfileSlot.findFirst({
        where: {
          status: 'AVAILABLE',
          OR: [
            { productId: product.id },
            {
              productId: null,
              accountStock: {
                productId: product.id,
              },
            },
          ],
          accountStock: {
            status: { in: ['ACTIVE', 'FULL'] },
          },
        },
        include: {
          accountStock: true,
        },
        orderBy: [
          { accountStock: { createdAt: 'asc' } },
          { createdAt: 'asc' },
        ],
      });

      if (!availableSlot) {
        throw new Error('OUT_OF_STOCK');
      }

      // Mark slot as ASSIGNED
      await tx.accountProfileSlot.update({
        where: { id: availableSlot.id },
        data: { status: 'ASSIGNED' },
      });

      // Check remaining slots in stock
      const remainingSlots = await tx.accountProfileSlot.count({
        where: {
          accountStockId: availableSlot.accountStockId,
          status: 'AVAILABLE',
        },
      });

      if (remainingSlots === 0) {
        await tx.accountStock.update({
          where: { id: availableSlot.accountStockId },
          data: { status: 'FULL' },
        });
      }

      // Record topup transaction for financial auditing
      await tx.topupTransaction.create({
        data: {
          txNumber,
          userId: guestUser.id,
          amount: requiredPrice,
          slipUrl,
          transRef,
          status: 'SUCCESS',
          verifiedBy: 'SLIP2GO_GUEST',
          slip2goRaw: slip2goResponse,
          adminNote: `สั่งซื้อด่วนราคาปลีก: ${product.name}`,
          verifiedAt: new Date(),
        },
      });

      // Expiry calculation
      const purchasedAt = new Date();
      const expiresAt = calculateSlotExpiry(
        purchasedAt,
        product.durationDays,
        product.cutoffType || 'ROUND_UP_HOUR'
      );

      const datePart = purchasedAt.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-GUEST-${datePart}-${randPart}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: guestUser.id,
          productId: product.id,
          profileSlotId: availableSlot.id,
          amountPaid: requiredPrice,
          hasAddon: Boolean(includeAddon && product.addonEnabled),
          addonName: (includeAddon && product.addonEnabled) ? (product.addonName || 'รับประกันเคลม') : null,
          addonPrice: addonPrice,
          purchasedAt,
          expiresAt,
          status: 'ACTIVE',
        },
      });

      // Decrypt credentials
      const { email, password } = decryptStockCredentials(availableSlot.accountStock);

      return {
        order: newOrder,
        slotName: availableSlot.slotName,
        slotPin: availableSlot.slotPin,
        deviceType: availableSlot.deviceType || 'MOBILE',
        email,
        password,
      };
    });

    revalidatePath('/');

    return {
      success: true,
      order: {
        id: transactionResult.order.id,
        orderNumber: transactionResult.order.orderNumber,
        productName: product.name,
        email: transactionResult.email,
        password: transactionResult.password,
        slotName: transactionResult.slotName,
        slotPin: transactionResult.slotPin,
        deviceType: transactionResult.deviceType,
        purchasedAt: transactionResult.order.purchasedAt.toISOString(),
        expiresAt: transactionResult.order.expiresAt.toISOString(),
        otpEnabled: product.otpEnabled,
        lineOaUrl: product.lineOaUrl,
        rules: product.rules,
        usageGuide: product.usageGuide,
        hasAddon: transactionResult.order.hasAddon,
        addonName: transactionResult.order.addonName,
        addonPrice: transactionResult.order.addonPrice,
        isGuest: true,
      },
    };
  } catch (error: any) {
    console.error('Guest purchase error:', error);
    if (error.message === 'OUT_OF_STOCK') {
      return { success: false, error: 'ขออภัย ขณะนี้สินค้ารายการนี้หมดสต็อกชั่วคราว' };
    }
    return { success: false, error: 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง' };
  }
}

