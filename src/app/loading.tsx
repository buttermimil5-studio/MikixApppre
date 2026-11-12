import React from 'react';

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="h-1 bg-gradient-to-r from-[#FFB4A2] via-[#E5989B] to-[#FFB4A2] animate-pulse w-full shadow-xs" />
      <div className="flex justify-center mt-3">
        <div className="bg-white/95 border border-[#FFD9CE] rounded-full px-4 py-1.5 shadow-md flex items-center gap-2 text-xs font-bold text-[#5D4037] animate-in fade-in slide-in-from-top-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-[#FFB4A2] animate-ping" />
          <span>กำลังโหลดข้อมูล...</span>
        </div>
      </div>
    </div>
  );
}
