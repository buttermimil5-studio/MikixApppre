'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { decryptCredentials, decryptStockCredentials } from '@/lib/crypto';

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
    purchasedAt: string;
    expiresAt: string;
    otpEnabled: boolean;
    lineOaUrl?: string | null;
    rules: string;
    usageGuide: string;
  };
  remainingBalance?: number;
}

import { calculateSlotExpiry } from '@/lib/cutoff';

/**
 * Atomic purchase transaction engine
 * 1. Checks store status & user credit balance
 * 2. Locks and deducts credit
 * 3. Allocates available stock slot
 * 4. Calculates expiration timestamp from exact purchase time
 * 5. Returns decrypted credentials immediately and safely
 */
export async function purchaseProductAction(productId: string): Promise<PurchaseResult> {
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

    // 3. Fast pre-check for user balance
    if (user.creditBalance < product.price) {
      return {
        success: false,
        error: `เครดิตของคุณไม่เพียงพอ (ต้องการ ${product.price} เครดิต แต่คุณมี ${user.creditBalance} เครดิต) กรุณาเติมเงินก่อนทำรายการ`,
      };
    }

    // 4. ATOMIC PRISMA TRANSACTION
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Re-verify balance with the freshest record inside transaction
      const freshUser = await tx.user.findUnique({
        where: { id: user.id },
      });

      if (!freshUser || freshUser.creditBalance < product.price) {
        throw new Error('INSUFFICIENT_CREDIT');
      }

      // Find an available slot for this product
      // We look for slots that are AVAILABLE within ACTIVE stocks
      const availableSlot = await tx.accountProfileSlot.findFirst({
        where: {
          status: 'AVAILABLE',
          accountStock: {
            productId: product.id,
            status: { in: ['ACTIVE', 'FULL'] },
          },
        },
        include: {
          accountStock: true,
        },
        orderBy: {
          createdAt: 'asc', // FIFO stock allocation
        },
      });

      if (!availableSlot) {
        throw new Error('OUT_OF_STOCK');
      }

      // Deduct credit
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          creditBalance: { decrement: product.price },
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
          amountPaid: product.price,
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
        email,
        password,
        remainingBalance: updatedUser.creditBalance,
      };
    });

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
        purchasedAt: transactionResult.order.purchasedAt.toISOString(),
        expiresAt: transactionResult.order.expiresAt.toISOString(),
        otpEnabled: product.otpEnabled,
        lineOaUrl: product.lineOaUrl,
        rules: product.rules,
        usageGuide: product.usageGuide,
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

    // Update any expired orders first
    const now = new Date();
    const expiredOrders = await prisma.order.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        expiresAt: { lte: now },
      },
      include: {
        profileSlot: true,
      },
    });

    for (const exp of expiredOrders) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: exp.id },
          data: { status: 'EXPIRED' },
        }),
        prisma.accountProfileSlot.update({
          where: { id: exp.profileSlotId },
          data: { status: 'EXPIRED' },
        }),
        prisma.accountStock.update({
          where: { id: exp.profileSlot.accountStockId },
          data: { status: 'SERVICING' }, // Move stock to Servicing for admin password rotation
        }),
      ]);
    }

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
        email,
        password,
        purchasedAt: o.purchasedAt.toISOString(),
        expiresAt: o.expiresAt.toISOString(),
        status: o.status,
        otpEnabled: o.product.otpEnabled,
        lineOaUrl: o.product.lineOaUrl,
        rules: o.product.rules,
        usageGuide: o.product.usageGuide,
      };
    });

    return { success: true, orders: formatted };
  } catch (error) {
    console.error('Get orders error:', error);
    return { success: false, orders: [] };
  }
}
