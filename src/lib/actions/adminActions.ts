'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  encryptCredentials,
  decryptCredentials,
  encryptStockCredentials,
  decryptStockCredentials,
} from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED: สิทธิ์สำหรับผู้ดูแลระบบเท่านั้น');
  }
  return user;
}

// 1. Dashboard Metrics (Daily, Monthly, Yearly Sales & Bestsellers)
export async function getAdminDashboardStats() {
  await requireAdmin();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Daily sales
  const dailySales = await prisma.order.aggregate({
    _sum: { amountPaid: true },
    _count: { id: true },
    where: { purchasedAt: { gte: startOfDay } },
  });

  // Monthly sales
  const monthlySales = await prisma.order.aggregate({
    _sum: { amountPaid: true },
    _count: { id: true },
    where: { purchasedAt: { gte: startOfMonth } },
  });

  // Yearly sales
  const yearlySales = await prisma.order.aggregate({
    _sum: { amountPaid: true },
    _count: { id: true },
    where: { purchasedAt: { gte: startOfYear } },
  });

  // Total Topup
  const totalTopup = await prisma.topupTransaction.aggregate({
    _sum: { amount: true },
    where: { status: 'SUCCESS' },
  });

  // Active & Expiring soon subscriptions
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const activeOrdersCount = await prisma.order.count({
    where: { status: 'ACTIVE' },
  });

  const expiringSoonCount = await prisma.order.count({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: in24Hours, gte: now },
    },
  });

  const expiredCount = await prisma.order.count({
    where: { status: 'EXPIRED' },
  });

  const servicingStockCount = await prisma.accountStock.count({
    where: { status: 'SERVICING' },
  });

  // Bestsellers
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: { orders: true },
      },
    },
    orderBy: {
      orders: {
        _count: 'desc',
      },
    },
    take: 5,
  });

  return {
    sales: {
      daily: { amount: dailySales._sum.amountPaid || 0, count: dailySales._count.id },
      monthly: { amount: monthlySales._sum.amountPaid || 0, count: monthlySales._count.id },
      yearly: { amount: yearlySales._sum.amountPaid || 0, count: yearlySales._count.id },
      totalTopup: totalTopup._sum.amount || 0,
    },
    subscriptions: {
      active: activeOrdersCount,
      expiringSoon: expiringSoonCount,
      expired: expiredCount,
      servicingQueue: servicingStockCount,
    },
    bestsellers: products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      orderCount: p._count.orders,
    })),
  };
}

// 2. User & Credit Management with Audit Logs
export async function getAdminUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    include: {
      _count: {
        select: { orders: true, topups: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function adjustUserCreditAction(userId: string, delta: number, reason: string) {
  const admin = await requireAdmin();

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'จำเป็นต้องระบุเหตุผลในการปรับเครดิตทุกครั้ง' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' };

  if (user.creditBalance + delta < 0) {
    return { success: false, error: 'ไม่สามารถหักเครดิตจนติดลบได้' };
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { creditBalance: { increment: delta } },
    });

    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: 'CREDIT_ADJUST',
        details: `แอดมิน ${admin.username} ปรับเครดิตให้ ${user.username} (${user.profileName}) จำนวน ${
          delta >= 0 ? '+' : ''
        }${delta} บาท (ยอดเดิม: ${user.creditBalance} -> ใหม่: ${updated.creditBalance}) เหตุผล: ${reason}`,
      },
    });

    return updated;
  });

  return { success: true, user: updatedUser };
}

// 3. Stock Management & Servicing Queue (Recycle expired accounts)
export async function getAdminStocks() {
  await requireAdmin();

  const stocks = await prisma.accountStock.findMany({
    include: {
      product: true,
      profileSlots: {
        include: {
          order: {
            include: { user: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return stocks.map((s) => {
    const creds = decryptStockCredentials(s);
    return {
      id: s.id,
      productName: s.product.name,
      productId: s.productId,
      email: creds.email,
      password: creds.password,
      notes: s.notes,
      totalSlots: s.totalSlots,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
      slots: s.profileSlots.map((slot) => ({
        id: slot.id,
        slotName: slot.slotName,
        slotPin: slot.slotPin,
        status: slot.status,
        assignedUser: slot.order?.user?.username || null,
        orderNumber: slot.order?.orderNumber || null,
        expiresAt: slot.order?.expiresAt?.toISOString() || null,
      })),
    };
  });
}

export async function addStockAccountAction(data: {
  productId: string;
  email: string;
  password: string;
  notes?: string;
  slots: { slotName: string; slotPin?: string }[];
}) {
  const admin = await requireAdmin();

  const enc = encryptStockCredentials(data.email.trim(), data.password.trim());

  const stock = await prisma.accountStock.create({
    data: {
      productId: data.productId,
      encryptedEmail: enc.encryptedEmail,
      encryptedPassword: enc.encryptedPassword,
      iv: enc.iv,
      tag: enc.tag,
      passwordIv: enc.passwordIv,
      passwordTag: enc.passwordTag,
      notes: data.notes || '',
      totalSlots: data.slots.length,
      status: 'ACTIVE',
      profileSlots: {
        create: data.slots.map((s) => ({
          slotName: s.slotName || 'จอ 1',
          slotPin: s.slotPin || null,
          status: 'AVAILABLE',
        })),
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'STOCK_ADD',
      details: `แอดมิน ${admin.username} เพิ่มสต็อกบัญชีใหม่สำหรับสินค้ารหัส ${data.productId} จำนวน ${data.slots.length} สิทธิ์`,
    },
  });

  return { success: true, stockId: stock.id };
}

/**
 * RECYCLE ACCOUNT: When an account expires, the admin changes the password in the app (e.g. Netflix)
 * and inputs the new password here. The account is reset to AVAILABLE and back to stock!
 */
export async function recycleStockAccountAction(stockId: string, newPassword: string) {
  const admin = await requireAdmin();

  if (!newPassword || newPassword.trim().length === 0) {
    return { success: false, error: 'กรุณาระบุรหัสผ่านใหม่ที่เปลี่ยนในแอปแล้ว' };
  }

  const passEnc = encryptCredentials(newPassword.trim());

  await prisma.$transaction(async (tx) => {
    // 1. Update account password and set status to ACTIVE
    await tx.accountStock.update({
      where: { id: stockId },
      data: {
        encryptedPassword: passEnc.encrypted,
        passwordIv: passEnc.iv,
        passwordTag: passEnc.tag,
        status: 'ACTIVE',
      },
    });

    // 2. Reset expired/assigned profile slots back to AVAILABLE
    await tx.accountProfileSlot.updateMany({
      where: { accountStockId: stockId },
      data: { status: 'AVAILABLE' },
    });

    // 3. Log audit
    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: 'STOCK_RECYCLE',
        details: `แอดมิน ${admin.username} เปลี่ยนรหัสผ่านใหม่และนำบัญชีสต็อก ${stockId} กลับเข้าสู่สต็อก (พร้อมขาย)`,
      },
    });
  });

  return { success: true };
}

// 4. Products & Categories Management
export async function getAdminProducts() {
  await requireAdmin();
  return prisma.product.findMany({
    include: {
      category: true,
      _count: {
        select: {
          orders: true,
          accountStocks: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleProductActiveAction(productId: string, isActive: boolean) {
  const admin = await requireAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'PRODUCT_STATUS_TOGGLE',
      details: `แอดมิน ${admin.username} ${isActive ? 'เปิด' : 'ปิด'} การขายสินค้า ${productId}`,
    },
  });
  return { success: true };
}

export async function saveProductAction(data: {
  id?: string;
  categoryId: string;
  name: string;
  imageUrl: string;
  price: number;
  durationDays: number;
  rules: string;
  usageGuide: string;
  otpEnabled: boolean;
  lineOaUrl?: string;
  isActive: boolean;
}) {
  const admin = await requireAdmin();

  if (data.id) {
    const updated = await prisma.product.update({
      where: { id: data.id },
      data: {
        categoryId: data.categoryId,
        name: data.name,
        imageUrl: data.imageUrl,
        price: data.price,
        durationDays: data.durationDays,
        rules: data.rules,
        usageGuide: data.usageGuide,
        otpEnabled: data.otpEnabled,
        lineOaUrl: data.lineOaUrl,
        isActive: data.isActive,
      },
    });
    return { success: true, product: updated };
  } else {
    const created = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        imageUrl: data.imageUrl,
        price: data.price,
        durationDays: data.durationDays,
        rules: data.rules,
        usageGuide: data.usageGuide,
        otpEnabled: data.otpEnabled,
        lineOaUrl: data.lineOaUrl,
        isActive: data.isActive,
      },
    });
    return { success: true, product: created };
  }
}

// 5. Store Settings Management
export async function getStoreSettings() {
  return prisma.storeSetting.findUnique({
    where: { id: 'default' },
  });
}

export async function updateStoreSettingsAction(data: Partial<{
  storeName: string;
  storeTag: string;
  storeSubtitle: string;
  bannerUrl: string;
  logoUrl: string;
  mascotUrl: string;
  mascotGreeting: string;
  announcementNote: string;
  contactLine: string;
  contactFacebook: string;
  contactInstagram: string;
  isOpen: boolean;
  closedNotice: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptPayNumber: string;
  bankQrUrl: string;
  slip2goApiKey: string;
  slip2goSecretKey: string;
}>) {
  const admin = await requireAdmin();

  const updated = await prisma.storeSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      ...data,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'STORE_SETTINGS_UPDATE',
      details: `แอดมิน ${admin.username} อัปเดตการตั้งค่าร้านค้า`,
    },
  });

  return { success: true, settings: updated };
}

// 6. Orders & Stock Cut Management (Who bought what account/email/pass/screen)
export async function getAdminOrders() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: {
      user: true,
      product: true,
      profileSlot: {
        include: {
          accountStock: true,
        },
      },
    },
    orderBy: { purchasedAt: 'desc' },
  });

  return orders.map((o) => {
    const creds = decryptStockCredentials(o.profileSlot.accountStock);
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      productId: o.productId,
      productName: o.product.name,
      amountPaid: o.amountPaid,
      purchasedAt: o.purchasedAt.toISOString(),
      expiresAt: o.expiresAt.toISOString(),
      status: o.status,
      buyerUsername: o.user.username,
      buyerProfileName: o.user.profileName,
      slotName: o.profileSlot.slotName,
      slotPin: o.profileSlot.slotPin,
      email: creds.email,
      password: creds.password,
    };
  });
}

// 6. Slip Verification Management
export async function getAdminTopupTransactions() {
  await requireAdmin();
  return prisma.topupTransaction.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function approveManualTopupAction(txId: string, approved: boolean, note?: string) {
  const admin = await requireAdmin();

  const txRecord = await prisma.topupTransaction.findUnique({
    where: { id: txId },
    include: { user: true },
  });

  if (!txRecord || txRecord.status !== 'PENDING') {
    return { success: false, error: 'รายการนี้ได้รับการตรวจสอบแล้วหรือไม่พบในระบบ' };
  }

  await prisma.$transaction(async (tx) => {
    if (approved) {
      await tx.topupTransaction.update({
        where: { id: txId },
        data: {
          status: 'SUCCESS',
          verifiedBy: 'ADMIN_MANUAL',
          adminNote: note || 'แอดมินอนุมัติสลิปด้วยตนเอง',
          verifiedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: txRecord.userId },
        data: { creditBalance: { increment: txRecord.amount } },
      });
    } else {
      await tx.topupTransaction.update({
        where: { id: txId },
        data: {
          status: 'REJECTED',
          verifiedBy: 'ADMIN_MANUAL',
          adminNote: note || 'แอดมินปฏิเสธสลิปนี้',
          verifiedAt: new Date(),
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: admin.id,
        action: approved ? 'SLIP_APPROVE' : 'SLIP_REJECT',
        details: `แอดมิน ${admin.username} ${approved ? 'อนุมัติ' : 'ปฏิเสธ'} สลิป ${txRecord.txNumber} ยอด ${txRecord.amount} บาท ของ ${txRecord.user.username}`,
      },
    });
  });

  return { success: true };
}

// 7. Audit Logs
export async function getAdminAuditLogs() {
  await requireAdmin();
  return prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
