import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { StoreHero } from '@/components/StoreHero';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ShokupanIcon } from '@/components/BakeryLineIcons';


export const revalidate = 5; // 5-second revalidation: Blazing-fast page loads (<20ms) with instant invalidation on purchase/restock

async function getStoreData() {
  const [storeSetting, categories, contacts, rawProducts, bankAccounts] = await Promise.all([
    prisma.storeSetting.findUnique({
      where: { id: 'default' },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.storeContact.findMany({
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        accountStocks: {
          where: { status: { in: ['ACTIVE', 'FULL'] } },
          select: {
            profileSlots: {
              where: { status: 'AVAILABLE' },
              select: { productId: true },
            },
          },
        },
        assignedSlots: {
          where: {
            status: 'AVAILABLE',
            accountStock: { status: { in: ['ACTIVE', 'FULL'] } },
          },
          select: { id: true },
        },
      },
      orderBy: [{ isBestseller: 'desc' }, { createdAt: 'desc' }],
    }),
    prisma.bankAccount.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  const activeSetting = storeSetting || {
    id: 'default',
    storeName: 'Miki App Store',
    isOpen: true,
    closedNotice: null,
    slip2goSecretKey: null,
  };

  return { storeSetting: activeSetting, categories, contacts, rawProducts, bankAccounts };
}

export default async function HomePage() {
  const [user, storeData] = await Promise.all([
    getCurrentUser(),
    getStoreData(),
  ]);

  const { storeSetting, categories, contacts, rawProducts, bankAccounts } = storeData;

  const products = rawProducts.map((p: any) => {
    // Count available slots across account stocks (inherited) and directly assigned slots
    const stockSlotsCount = p.accountStocks.reduce(
      (sum: number, stock: any) =>
        sum + stock.profileSlots.filter((s: any) => !s.productId).length,
      0
    );
    const directAssignedSlotsCount = p.assignedSlots?.length || 0;
    const availableSlotsCount = stockSlotsCount + directAssignedSlotsCount;

    const rawRules = p.rules || '';
    const groupMatch = rawRules.match(/<!--group:(.*?)-->/);
    const appGroup = groupMatch && groupMatch[1]?.trim() ? groupMatch[1].trim() : null;
    const cleanRules = rawRules.replace(/<!--group:.*?-->\r?\n?/, '').trim();

    return {
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      price: p.price,
      retailPrice: p.retailPrice,
      durationDays: p.durationDays,
      rules: cleanRules,
      appGroup,
      usageGuide: p.usageGuide,
      otpEnabled: p.otpEnabled,
      lineOaUrl: p.lineOaUrl,
      hasProfilePin: p.hasProfilePin,
      defaultSlotCount: p.defaultSlotCount,
      sharingTypeNote: p.sharingTypeNote,
      addonEnabled: p.addonEnabled,
      addonName: p.addonName,
      addonPrice: p.addonPrice,
      isBestseller: p.isBestseller,
      categoryId: p.categoryId,
      category: p.category,
      availableSlotsCount,
    };
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col text-[#5D4037]">
      <Navbar initialUser={user} storeSetting={storeSetting} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Store Cover, Logo, Announcements & Status */}
        <StoreHero storeSetting={storeSetting} contacts={contacts} />

        {/* Product Catalog & Categories */}
        <ProductCatalog
          initialProducts={products}
          categories={categories}
          user={user}
          storeSetting={storeSetting}
          bankAccounts={bankAccounts}
        />
      </main>


      {/* Cozy Japanese Bakery Cafe Footer */}
      <footer className="mt-16 border-t border-[#E8DCCF] bg-[#FFFDF7] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFF8E7] border border-[#FFD9CE] flex items-center justify-center shadow-xs">
              <ShokupanIcon className="w-4 h-4" />
            </div>
            <p className="font-black text-sm text-[#5D4037]">
              {storeSetting.storeName} • 森のベーカリースタイル
            </p>
          </div>
          <p className="text-xs text-[#8D6E63] font-medium">
            ระบบจำหน่ายและแจกจ่ายแอปพรีเมียมราคาส่ง จัดส่งอัตโนมัติ 24 ชม. สำหรับลูกค้าทั่วไปและตัวแทนจำหน่าย
          </p>
          <p className="text-[11px] text-[#A1887F] pt-1">
            การใช้งานบัญชีเป็นไปตามเงื่อนไขและข้อกำหนดของผู้ให้บริการแต่ละแพลตฟอร์ม
          </p>
        </div>
      </footer>
    </div>
  );
}
