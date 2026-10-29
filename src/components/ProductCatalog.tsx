'use client';

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ShokupanIcon } from './BakeryLineIcons';
import { Sparkles, Layers, Search } from 'lucide-react';

interface ProductCatalogProps {
  initialProducts: any[];
  categories: any[];
  user: any;
  storeSetting?: any;
  bankAccounts?: any[];
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
  const [user, setUser] = useState(initialUser);

  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory =
      selectedCategory === 'ALL' || product.categoryId === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="space-y-6">
      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* iOS-style Segmented Category Pills */}
        <div className="bg-[#F5EBE1] p-1.5 rounded-full inline-flex items-center gap-1 overflow-x-auto max-w-full shadow-inner scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              selectedCategory === 'ALL'
                ? 'bg-white text-[#5D4037] shadow-sm transform scale-102'
                : 'text-[#8D6E63] hover:text-[#5D4037]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#E5989B]" />
            <span>ทั้งหมด ({initialProducts.length})</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
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

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => (
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
    </section>
  );
}
