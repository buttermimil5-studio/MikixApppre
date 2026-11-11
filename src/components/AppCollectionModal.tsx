'use client';

import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface AppCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  products: any[];
  user: any;
  onSelectProduct: (product: any) => void;
}

export function AppCollectionModal({
  isOpen,
  onClose,
  appName,
  products,
  user,
  onSelectProduct,
}: AppCollectionModalProps) {
  if (!isOpen) return null;

  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-[#FFFDF8] rounded-[2rem] border-2 border-[#FFD9CE] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#FFF5F2] to-[#FFF9F5] border-b border-[#FFD9CE] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#FFD9CE] bg-white shadow-2xs flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={products[0]?.imageUrl}
                alt={appName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-[#5D4037]">
                  {appName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#E5989B] border border-[#FFD9CE] shadow-2xs">
                  {products.length} แพ็กเกจให้เลือก
                </span>
              </div>
              <p className="text-xs text-[#8D6E63] font-medium mt-0.5">
                เลือกแบบและระยะเวลาที่ต้องการใช้งานเพื่อสั่งซื้อ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8DCCF] flex items-center justify-center text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FFF0EB] transition-colors shadow-2xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Packages List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {products.map((p) => {
            const isAvailable = p.availableSlotsCount > 0;
            return (
              <div
                key={p.id}
                onClick={() => {
                  if (isAvailable) {
                    onSelectProduct(p);
                  }
                }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                  isAvailable
                    ? 'bg-white border-[#FFD9CE] hover:border-[#E5989B] hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-[#FFFBF7]/60 border-[#E8DCCF] opacity-70 cursor-not-allowed'
                }`}
              >
                {/* Left: Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-[#5D4037] group-hover:text-[#E5989B] transition-colors">
                      {p.name}
                    </span>
                    {p.isBestseller && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF5722] text-white">
                        <Flame className="w-2.5 h-2.5 fill-white text-white" />
                        ขายดี
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs text-[#8D6E63]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FFF5F2] text-[#6D4C41] border border-[#FFD9CE] font-bold text-[11px]">
                      <Clock className="w-3 h-3 text-[#FFB4A2]" />
                      {p.durationDays} วัน
                    </span>

                    {p.sharingTypeNote && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#5D4037]/10 text-[#5D4037] font-extrabold text-[11px]">
                        {p.sharingTypeNote}
                      </span>
                    )}

                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 text-[#2E7D32] font-bold text-[11px] bg-[#E8F5E9] px-2 py-0.5 rounded-md border border-[#C8E6C9]">
                        <CheckCircle2 className="w-3 h-3" />
                        พร้อมส่ง {p.availableSlotsCount} สิทธิ์
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#D84315] font-bold text-[11px] bg-[#FFF0EB] px-2 py-0.5 rounded-md border border-[#FFCCBC]">
                        <AlertCircle className="w-3 h-3" />
                        หมดชั่วคราว
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Price & Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5EBE1]">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#8D6E63] font-bold block">
                      {isAgent ? 'ราคาส่งตัวแทน' : 'ราคา'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#5D4037] group-hover:text-[#E5989B] transition-colors">
                      ฿{p.price.toFixed(2)}
                    </span>
                    {isAgent && p.retailPrice && (
                      <span className="text-[10px] text-[#8D6E63] line-through block -mt-1">
                        ปลีก ฿{p.retailPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                      isAvailable
                        ? 'bg-[#FFB4A2] text-white hover:bg-[#E5989B] group-hover:scale-102 cursor-pointer'
                        : 'bg-[#E8DCCF] text-[#8D6E63] cursor-not-allowed'
                    }`}
                  >
                    <span>{isAvailable ? 'สั่งซื้อแพ็กเกจนี้' : 'หมดชั่วคราว'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
