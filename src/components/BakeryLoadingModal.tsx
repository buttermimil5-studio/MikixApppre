'use client';

import React from 'react';
import { ShokupanIcon } from './BakeryLineIcons';

interface BakeryLoadingModalProps {
  message?: string;
  subMessage?: string;
}

export function BakeryLoadingModal({
  message = 'กำลังโหลดข้อมูล...',
  subMessage = 'กรุณารอสักครู่นะคะ~',
}: BakeryLoadingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/25 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 border border-[#FFD9CE] rounded-[2rem] px-8 py-7 shadow-[0_16px_40px_rgba(141,110,99,0.2)] flex flex-col items-center gap-4 max-w-xs w-full text-center">
        {/* Cute Bakery Shokupan Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-center shadow-xs">
          <ShokupanIcon className="w-8 h-8 animate-pulse" />
        </div>

        {/* Minimalist flowing 3 dots */}
        <div className="flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB4A2] animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#E5989B] animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#B5838D] animate-bounce"></span>
        </div>

        <div>
          <p className="text-sm font-black text-[#5D4037]">{message}</p>
          <p className="text-[11px] text-[#8D6E63] font-medium mt-0.5">{subMessage}</p>
        </div>
      </div>
    </div>
  );
}
