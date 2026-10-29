'use client';

import React from 'react';

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
      <div className="bg-white/95 border border-[#FFD9CE] rounded-[2rem] px-8 py-6 shadow-[0_16px_40px_rgba(141,110,99,0.2)] flex flex-col items-center gap-3.5 max-w-xs w-full text-center">
        {/* Cat Mascot Image */}
        <div className="w-16 h-16 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cat-mascot.png"
            alt="น้องแมว"
            className="w-full h-full object-contain select-none animate-pulse"
          />
        </div>

        {/* Minimalist flowing 3 wave dots - small & uniform soft light brown */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#BCAAA4] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#BCAAA4] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#BCAAA4] animate-bounce" />
        </div>

        <div>
          <p className="text-sm font-black text-[#5D4037]">{message}</p>
          <p className="text-[11px] text-[#8D6E63] font-medium mt-0.5">{subMessage}</p>
        </div>
      </div>
    </div>
  );
}
