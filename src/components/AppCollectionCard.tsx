'use client';

import React from 'react';
import { Layers, ChevronRight, CheckCircle2, AlertCircle, Flame, Clock } from 'lucide-react';

interface AppCollectionCardProps {
  appName: string;
  categoryName?: string;
  products: any[];
  user: any;
  onClick: () => void;
}

export function AppCollectionCard({
  appName,
  categoryName,
  products,
  user,
  onClick,
}: AppCollectionCardProps) {
  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';

  // Find lowest price
  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);

  // Total available slots
  const totalSlots = products.reduce((sum, p) => sum + (p.availableSlotsCount || 0), 0);
  const isAvailable = totalSlots > 0;

  // Has any bestseller
  const hasBestseller = products.some((p) => p.isBestseller);

  // Unique durations
  const durations = Array.from(new Set(products.map((p) => p.durationDays))).sort((a, b) => a - b);

  const mainImage = products[0]?.imageUrl || '';

  return (
    <div
      onClick={onClick}
      className="miki-card p-5 flex flex-col justify-between group bg-white border-2 border-[#FFD9CE]/70 rounded-[1.75rem] shadow-[0_4px_16px_rgba(141,110,99,0.06)] hover:shadow-[0_10px_28px_rgba(255,180,162,0.24)] hover:-translate-y-1 hover:border-[#FFB4A2] transition-all duration-200 cursor-pointer relative overflow-hidden"
    >
      <div>
        {/* Top Image & Badges */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DCCF] bg-[#FFF8F3] mb-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mainImage}
            alt={appName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Left Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {hasBestseller && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white shadow-xs">
                <Flame className="w-3 h-3 text-white fill-white" />
                ยอดนิยม
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#6D4C41] border border-[#FFD9CE] shadow-xs">
              {categoryName || 'แอปพรีเมียม'}
            </span>
          </div>

          {/* Top Right: Package count pill */}
          <div className="absolute top-2.5 right-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#5D4037]/90 text-white backdrop-blur-xs border border-white/20 shadow-xs">
              <Layers className="w-3 h-3 text-[#FFB4A2]" />
              {products.length} แพ็กเกจ
            </span>
          </div>

          {/* Bottom Duration tags bar */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center gap-1 overflow-hidden">
            {durations.map((d) => (
              <span
                key={d}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 text-[#5D4037] border border-[#E8DCCF] shadow-2xs backdrop-blur-xs"
              >
                {d} วัน
              </span>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-black text-base sm:text-lg text-[#5D4037] group-hover:text-[#E5989B] transition-colors leading-tight">
            {appName}
          </h3>
          <span className="text-[10px] font-bold text-[#E5989B] bg-[#FFF0EB] px-2 py-0.5 rounded-full border border-[#FFD9CE] flex-shrink-0">
            รวมทุกแบบ
          </span>
        </div>

        {/* Stock Status Bar */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 text-[#2E7D32] text-[11px] font-bold bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
              <CheckCircle2 className="w-3 h-3" />
              พร้อมส่งรวม {totalSlots} สิทธิ์
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#D84315] text-[11px] font-bold bg-[#FFF0EB] px-2.5 py-0.5 rounded-full border border-[#FFCCBC]">
              <AlertCircle className="w-3 h-3" />
              หมดชั่วคราว
            </span>
          )}

          <span className="text-[11px] font-medium text-[#8D6E63]">
            กดเพื่อดูรายการ
          </span>
        </div>
      </div>

      {/* Footer: Price & Action */}
      <div className="mt-4 pt-3.5 border-t border-[#F5EBE1] flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#8D6E63] font-bold block">
            {isAgent ? 'ราคาส่งเริ่มต้น' : 'ราคาเริ่มต้น'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xs font-bold text-[#8D6E63]">เริ่มต้น</span>
            <span className="text-lg font-black text-[#5D4037] group-hover:text-[#E5989B] transition-colors">
              ฿{minPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFF5F2] text-[#E5989B] border border-[#FFD9CE] group-hover:bg-[#FFB4A2] group-hover:text-white transition-all flex items-center gap-1 shadow-2xs group-hover:scale-102"
        >
          <span>เลือกแพ็กเกจ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
