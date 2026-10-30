'use client';

import React, { useState } from 'react';
import { ProductModal } from './ProductModal';
import { Clock, MessageCircle, ShoppingBag, CheckCircle2, AlertCircle, Flame } from 'lucide-react';

interface ProductCardProps {
  product: any;
  user: any;
  storeSetting?: any;
  bankAccounts?: any[];
  onBalanceUpdate?: (newBalance: number) => void;
}

export function ProductCard({
  product,
  user,
  storeSetting,
  bankAccounts = [],
  onBalanceUpdate,
}: ProductCardProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const isAvailable = product.availableSlotsCount > 0;
  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <>
      <div className="miki-card p-5 flex flex-col justify-between group bg-white border border-[#E8DCCF] rounded-[1.75rem] shadow-[0_4px_16px_rgba(141,110,99,0.06)] hover:shadow-[0_8px_24px_rgba(255,180,162,0.18)] hover:-translate-y-1 transition-all duration-200">
        <div>
          {/* Top image & badges */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DCCF] bg-[#FFF8F3] mb-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
            />

            {/* Category & Bestseller Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              {product.isBestseller && (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white shadow-xs">
                  <Flame className="w-3 h-3 text-white fill-white" />
                  ขายดี
                </span>
              )}
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#6D4C41] border border-[#FFD9CE] shadow-xs">
                {product.category?.name || 'แอปพรีเมียม'}
              </span>
            </div>

            {/* Duration Badge */}
            <div className="absolute top-2.5 right-2.5">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#5D4037] border border-[#E8DCCF] shadow-xs">
                <Clock className="w-3 h-3 text-[#FFB4A2]" />
                {product.durationDays} วัน
              </span>
            </div>

            {/* Sharing Type Badge (e.g. หาร 4 จอไม่ชน, หาร 5 จอชน) */}
            {product.sharingTypeNote && (
              <div className="absolute bottom-2.5 left-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#5D4037]/90 text-[#FFF8F3] backdrop-blur-xs border border-white/20 shadow-xs">
                  {product.sharingTypeNote}
                </span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-black text-sm sm:text-base text-[#5D4037] line-clamp-2 min-h-[2.5rem] group-hover:text-[#E5989B] transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Stock & Feature info */}
          <div className="mt-2.5 flex items-center justify-between text-xs">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 text-[#2E7D32] text-[11px] font-bold bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                <CheckCircle2 className="w-3 h-3" />
                พร้อมส่ง {product.availableSlotsCount} สิทธิ์
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#D84315] text-[11px] font-bold bg-[#FFF0EB] px-2.5 py-0.5 rounded-full border border-[#FFCCBC]">
                <AlertCircle className="w-3 h-3" />
                หมดชั่วคราว
              </span>
            )}

            {product.otpEnabled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                <MessageCircle className="w-3 h-3" />
                ขอ OTP ได้
              </span>
            )}
          </div>
        </div>

        {/* Footer: Price & Purchase Action */}
        <div className="mt-4 pt-3.5 border-t border-[#F5EBE1] flex items-center justify-between">
          <div>
            {isAgent ? (
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[#2E7D32] font-extrabold bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                    ราคาส่งตัวแทน
                  </span>
                  {product.retailPrice && product.retailPrice > product.price && (
                    <span className="text-[11px] text-[#A1887F] line-through">
                      {product.retailPrice.toLocaleString()} ฿
                    </span>
                  )}
                </div>
                <span className="text-lg sm:text-xl font-black text-[#E5989B]">
                  {product.price.toLocaleString()} ฿
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#8D6E63] font-medium">ราคาปกติ</span>
                  {product.retailPrice && product.retailPrice > product.price && (
                    <span className="text-[10px] font-bold text-[#E5989B] bg-[#FFF0EB] px-1.5 py-0.2 rounded-md">
                      สมัครตัวแทน {product.price.toLocaleString()} ฿
                    </span>
                  )}
                </div>
                <span className="text-lg sm:text-xl font-black text-[#5D4037]">
                  {(product.retailPrice || product.price).toLocaleString()} ฿
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isAvailable
                ? 'bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] shadow-xs'
                : 'bg-white text-[#5D4037] border border-[#E8DCCF] hover:bg-[#FFF8F3]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'กดรับบัญชี' : 'ดูรายละเอียด'}</span>
          </button>
        </div>
      </div>

      <ProductModal
        product={product}
        user={user}
        storeSetting={storeSetting}
        bankAccounts={bankAccounts}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPurchaseSuccess={onBalanceUpdate}
      />
    </>
  );
}
