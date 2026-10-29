import React from 'react';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { StoreHero } from '@/components/StoreHero';
import { ProductCatalog } from '@/components/ProductCatalog';
import { ShokupanIcon } from '@/components/BakeryLineIcons';


import { unstable_cache } from 'next/cache';

const getCachedStoreData = unstable_cache(
  async () => {
    let storeSetting = await prisma.storeSetting.findUnique({
      where: { id: 'default' },
    });

    if (!storeSetting) {
      storeSetting = await prisma.storeSetting.create({
        data: {
          id: 'default',
          storeName: 'Miki App Store',
        },
      });
    }

    const [categories, contacts, rawProducts] = await Promise.all([
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
              id: true,
              profileSlots: {
                where: { status: 'AVAILABLE' },
                select: { id: true, productId: true },
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
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { storeSetting, categories, contacts, rawProducts };
  },
  ['home_store_catalog'],
  { revalidate: 30, tags: ['store_data', 'products'] }
);

export default async function HomePage() {
  const [user, storeData] = await Promise.all([
    getCurrentUser(),
    getCachedStoreData(),
  ]);

  const { storeSetting, categories, contacts, rawProducts } = storeData;

  const products = rawProducts.map((p: any) => {
    // Count available slots across account stocks and directly assigned slots
    const stockSlotsCount = p.accountStocks.reduce(
      (sum: number, stock: any) =>
        sum + stock.profileSlots.filter((s: any) => !s.productId || s.productId === p.id).length,
      0
    );
    const directAssignedSlotsCount = p.assignedSlots?.length || 0;
    const availableSlotsCount = stockSlotsCount + directAssignedSlotsCount;

    return {
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      price: p.price,
      retailPrice: p.retailPrice,
      durationDays: p.durationDays,
      rules: p.rules,
      usageGuide: p.usageGuide,
      otpEnabled: p.otpEnabled,
      lineOaUrl: p.lineOaUrl,
      hasProfilePin: p.hasProfilePin,
      defaultSlotCount: p.defaultSlotCount,
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
