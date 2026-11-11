'use client';

import React, { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { AppCollectionCard } from './AppCollectionCard';
import { AppCollectionModal } from './AppCollectionModal';
import { ProductModal } from './ProductModal';
import { ShokupanIcon } from './BakeryLineIcons';
import { Layers, Search, Flame, LayoutGrid, Grid } from 'lucide-react';

interface ProductCatalogProps {
  initialProducts: any[];
  categories: any[];
  user: any;
  storeSetting?: any;
  bankAccounts?: any[];
}

function getAppGroupName(product: any): string {
  const name = product.name?.trim() || '';
  const lower = name.toLowerCase();

  if (lower.includes('netflix') || lower.includes('เนตฟลิก') || lower.includes('เน็ตฟลิก')) return 'Netflix';
  if (lower.includes('youtube') || lower.includes('ยูทูป')) return 'YouTube';
  if (lower.includes('spotify') || lower.includes('สปอติฟาย')) return 'Spotify';
  if (lower.includes('disney') || lower.includes('ดิสนีย์')) return 'Disney+';
  if (lower.includes('canva') || lower.includes('แคนวา')) return 'Canva';
  if (lower.includes('viu') || lower.includes('วิว')) return 'Viu';
  if (lower.includes('wetv')) return 'WeTV';
  if (lower.includes('iqiyi') || lower.includes('อ้ายฉีอี้')) return 'iQIYI';
  if (lower.includes('prime') || lower.includes('ไพรม์')) return 'Prime Video';
  if (lower.includes('hbo')) return 'HBO GO';
  if (lower.includes('bilibili')) return 'Bilibili';
  if (lower.includes('true id') || lower.includes('trueid')) return 'TrueID';
  if (lower.includes('3plus') || lower.includes('ch3')) return '3Plus';

  return product.name;
}

export function ProductCatalog({
  initialProducts,
  categories,
  user: initialUser,
  storeSetting,
  bankAccounts = [],
}: ProductCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'GROUPED' | 'FLAT'>('GROUPED');
  const [user, setUser] = useState(initialUser);

  // Modal states for App Collection & Direct Purchase
  const [selectedCollection, setSelectedCollection] = useState<{
    appName: string;
    categoryName?: string;
    products: any[];
  } | null>(null);

  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  const bestsellerCount = initialProducts.filter((p) => p.isBestseller).length;

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'BESTSELLER'
          ? Boolean(product.isBestseller)
          : product.categoryId === selectedCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  // Group products when in GROUPED mode
  const groupedItems = useMemo(() => {
    if (viewMode === 'FLAT') return [];

    const map = new Map<string, any[]>();
    for (const p of filteredProducts) {
      const groupKey = getAppGroupName(p);
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(p);
    }

    const items: Array<{
      type: 'COLLECTION' | 'SINGLE';
      appName: string;
      categoryName?: string;
      products: any[];
      product?: any;
    }> = [];

    map.forEach((prods, appName) => {
      if (prods.length > 1) {
        items.push({
          type: 'COLLECTION',
          appName,
          categoryName: prods[0]?.category?.name,
          products: prods,
        });
      } else {
        items.push({
          type: 'SINGLE',
          appName,
          categoryName: prods[0]?.category?.name,
          products: prods,
          product: prods[0],
        });
      }
    });

    return items;
  }, [filteredProducts, viewMode]);

  return (
    <section className="space-y-6">
      {/* Category Tabs, Search Bar & View Mode Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* iOS-style Segmented Category Pills */}
          <div className="bg-[#F5EBE1] p-1.5 rounded-full inline-flex items-center gap-1 overflow-x-auto max-w-full shadow-inner scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-white text-[#5D4037] shadow-sm transform scale-102'
                  : 'text-[#8D6E63] hover:text-[#5D4037]'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#E5989B]" />
              <span>ทั้งหมด ({initialProducts.length})</span>
            </button>

            <button
              onClick={() => setSelectedCategory('BESTSELLER')}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === 'BESTSELLER'
                  ? 'bg-[#FF5722] text-white shadow-sm transform scale-102'
                  : 'text-[#8D6E63] hover:text-[#D84315]'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${selectedCategory === 'BESTSELLER' ? 'text-white fill-white' : 'text-[#FF5722]'}`} />
              <span>สินค้าขายดี {bestsellerCount > 0 ? `(${bestsellerCount})` : ''}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-[#5D4037] shadow-sm transform scale-102'
                    : 'text-[#8D6E63] hover:text-[#5D4037]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Search Input (High border-radius pill) */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อแอปพรีเมียม..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-[#E8DCCF] text-xs font-medium text-[#5D4037] placeholder-[#A1887F] focus:outline-none focus:border-[#FFB4A2] shadow-xs transition-colors"
            />
          </div>
        </div>

        {/* View Mode Switch Bar (จัดกลุ่มตามแอป vs แสดงแยกทุกแพ็กเกจ) */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-[#8D6E63]">
            {viewMode === 'GROUPED'
              ? `แสดงแบบรวมกลุ่มแอป (${groupedItems.length} รายการ)`
              : `แสดงแยกทุกแพ็กเกจ (${filteredProducts.length} รายการ)`}
          </span>

          <div className="inline-flex items-center gap-1 bg-[#F5EBE1] p-1 rounded-full border border-[#E8DCCF]">
            <button
              onClick={() => setViewMode('GROUPED')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'GROUPED'
                  ? 'bg-white text-[#5D4037] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#5D4037]'
              }`}
              title="จัดกลุ่มแอปที่มีหลายแพ็กเกจ (เช่น กดเข้าเน็ตฟลิกซ์เพื่อเลือกแพ็กเกจ)"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#E5989B]" />
              <span>จัดกลุ่มตามแอป</span>
            </button>

            <button
              onClick={() => setViewMode('FLAT')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'FLAT'
                  ? 'bg-white text-[#5D4037] shadow-xs'
                  : 'text-[#8D6E63] hover:text-[#5D4037]'
              }`}
              title="แสดงสินค้าและแพ็กเกจทั้งหมดแบบเรียงเดี่ยว"
            >
              <Grid className="w-3.5 h-3.5 text-[#8D6E63]" />
              <span>แยกทุกแพ็กเกจ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {viewMode === 'GROUPED'
            ? groupedItems.map((item) => {
                if (item.type === 'COLLECTION') {
                  return (
                    <AppCollectionCard
                      key={`col-${item.appName}`}
                      appName={item.appName}
                      categoryName={item.categoryName}
                      products={item.products}
                      user={user}
                      onClick={() => {
                        setSelectedCollection({
                          appName: item.appName,
                          categoryName: item.categoryName,
                          products: item.products,
                        });
                      }}
                    />
                  );
                }

                return (
                  <ProductCard
                    key={item.product.id}
                    product={item.product}
                    user={user}
                    storeSetting={storeSetting}
                    bankAccounts={bankAccounts}
                    onBalanceUpdate={(newBalance) => {
                      if (user) {
                        setUser({ ...user, creditBalance: newBalance });
                      }
                    }}
                  />
                );
              })
            : filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  user={user}
                  storeSetting={storeSetting}
                  bankAccounts={bankAccounts}
                  onBalanceUpdate={(newBalance) => {
                    if (user) {
                      setUser({ ...user, creditBalance: newBalance });
                    }
                  }}
                />
              ))}
        </div>
      ) : (
        <div className="text-center py-16 miki-card bg-white p-8 space-y-3 border border-[#E8DCCF]">
          <div className="w-16 h-16 rounded-full bg-[#FFF8E7] border border-[#FFD9CE] flex items-center justify-center mx-auto shadow-xs">
            <ShokupanIcon className="w-10 h-10" />
          </div>
          <p className="font-black text-base text-[#5D4037]">ยังไม่พบสินค้าในหมวดหมู่นี้</p>
          <p className="text-xs text-[#8D6E63]">กรุณาลองเลือกหมวดหมู่อื่น หรือค้นหาด้วยชื่อแอปอื่น</p>
        </div>
      )}

      {/* App Collection Modal (Pop up to choose package e.g. Netflix 1 Day, 30 Days) */}
      {selectedCollection && (
        <AppCollectionModal
          isOpen={Boolean(selectedCollection)}
          appName={selectedCollection.appName}
          products={selectedCollection.products}
          user={user}
          onClose={() => setSelectedCollection(null)}
          onSelectProduct={(product) => {
            setSelectedCollection(null);
            setSelectedProductForModal(product);
          }}
        />
      )}

      {/* Direct Purchase Modal opened from Collection */}
      {selectedProductForModal && (
        <ProductModal
          isOpen={Boolean(selectedProductForModal)}
          product={selectedProductForModal}
          user={user}
          storeSetting={storeSetting}
          bankAccounts={bankAccounts}
          onClose={() => setSelectedProductForModal(null)}
          onPurchaseSuccess={(newBalance) => {
            if (user) {
              setUser({ ...user, creditBalance: newBalance });
            }
          }}
        />
      )}
    </section>
  );
}
