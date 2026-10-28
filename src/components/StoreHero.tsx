'use client';

import React, { useState, useEffect } from 'react';
import { FacebookIcon, InstagramIcon } from './CuteIcons';
import { ShokupanIcon, CroissantIcon, WheatStalkIcon } from './BakeryLineIcons';
import { MessageCircle } from 'lucide-react';

interface StoreHeroProps {
  storeSetting: any;
}

export function StoreHero({ storeSetting }: StoreHeroProps) {
  const hasContact = storeSetting?.contactLine || storeSetting?.contactFacebook || storeSetting?.contactInstagram;
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Store Cover Banner Only (Spacious, No Profile Avatar inside) */}
      <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-[#E8DCCF] bg-[#FFF8F3] shadow-[0_4px_24px_rgba(141,110,99,0.08)]">
        <div className="h-48 sm:h-64 md:h-72 w-full relative overflow-hidden">
          {storeSetting?.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={storeSetting.bannerUrl}
              alt="Store Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-[#FFF8E7] via-[#FFF0EB] to-[#FFE8D6] relative">
              {/* Subtle watermark line art bread background doodles */}
              <div className="absolute left-8 top-6 opacity-20 pointer-events-none">
                <WheatStalkIcon className="w-28 h-28" />
              </div>
              <div className="absolute right-12 bottom-4 opacity-20 pointer-events-none">
                <CroissantIcon className="w-28 h-28" />
              </div>
              <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/80 backdrop-blur-xs border border-[#FFD9CE] text-[#8D6E63] text-xs sm:text-sm font-bold shadow-xs">
                <WheatStalkIcon className="w-4 h-4 text-[#FFB4A2]" />
                <span>いらっしゃいませ • อบความสุขสดใหม่จากเตาทุกวัน</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Store Info & Single Open/Closed Status Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 sm:px-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#5D4037] tracking-tight">
              {storeSetting?.storeName || 'Miki App Bakery'}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
              {storeSetting?.storeTag || '森のベーカリー'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8D6E63] font-medium max-w-xl">
            {storeSetting?.storeSubtitle ||
              'แอปพรีเมียมราคาส่ง จัดส่งอัตโนมัติ 24 ชม. เสิร์ฟความคุ้มค่าหอมกรุ่นเหมือนขนมปังอบใหม่'}
          </p>
        </div>

        {/* The ONLY Open/Closed Indicator on the page */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          {storeSetting?.isOpen ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] font-bold text-xs sm:text-sm shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] animate-pulse" />
              <span>เปิดเตาพร้อมส่ง (OPEN)</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0EB] text-[#D84315] border border-[#FFCCBC] font-bold text-xs sm:text-sm shadow-xs"
              title={storeSetting?.closedNotice || 'ร้านค้าปิดทำการชั่วคราว'}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#D84315]" />
              <span>ปิดเตาชั่วคราว (CLOSED)</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Full-body Mascot with Animated Speech Bubble (Replaces Announcement Note) */}
      <div className="px-2 sm:px-4 pt-1">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-5 max-w-3xl">
          {/* Mascot character image without circular frame */}
          <div className="relative flex-shrink-0 flex flex-col items-center">
            {storeSetting?.mascotUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={storeSetting.mascotUrl}
                alt="Store Mascot"
                className="h-32 sm:h-36 md:h-40 object-contain drop-shadow-[0_8px_16px_rgba(141,110,99,0.15)] transition-transform duration-300 hover:scale-105 select-none"
              />
            ) : (
              <div className="relative flex flex-col items-center group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <ShokupanIcon className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md" />
                </div>
              </div>
            )}
            <div className="w-16 sm:w-20 h-2 rounded-full bg-[#5D4037]/10 blur-[2px] mt-0.5" />
          </div>

          {/* Animated Speech Bubble */}
          <div className="flex-1 w-full sm:mb-4">
            <div className="relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#FFD9CE] shadow-[0_4px_20px_rgba(255,180,162,0.12)]">
              {/* Speech bubble tail pointer pointing to mascot */}
              <div className="hidden sm:block absolute -left-2.5 bottom-6 w-3 h-3 bg-white border-l border-b border-[#FFD9CE] rotate-45 transform" />
              <div className="sm:hidden absolute -top-1.5 left-8 w-3 h-3 bg-white border-l border-t border-[#FFD9CE] rotate-45 transform" />

              {/* Typing indicator state -> Smoothly pops into speech text */}
              {isTyping ? (
                <div className="flex items-center gap-1.5 py-1 px-2 text-[#E5989B]">
                  <span className="w-2 h-2 rounded-full bg-[#FFB4A2] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFB4A2] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#FFB4A2] animate-bounce" />
                </div>
              ) : (
                <div className="space-y-1 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#E5989B] tracking-wide">
                      มิคิจังประจำร้าน (Store Mascot)
                    </span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#6D4C41] leading-relaxed whitespace-pre-line">
                    {storeSetting?.mascotGreeting ||
                      'ยินดีต้อนรับสู่ Miki App Store นะคะ! มีแอปพรีเมียมพร้อมส่ง 24 ชม. ทักหาแอดมินได้ตลอดเลยน้า~'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dedicated Contact Channels Row */}
      {hasContact && (
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-[#E8DCCF] shadow-[0_4px_16px_rgba(141,110,99,0.06)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF8E7] border border-[#FFD9CE] flex items-center justify-center text-[#8D6E63] flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-[#FFB4A2]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-[#5D4037]">ช่องทางการติดต่อร้านค้า</h3>
              <p className="text-[11px] sm:text-xs text-[#8D6E63] font-medium">สอบถามข้อมูลเพิ่มเติม สั่งซื้อ หรือแจ้งปัญหาการใช้งาน</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
            {storeSetting?.contactLine && (
              <a
                href={
                  storeSetting.contactLine.startsWith('http')
                    ? storeSetting.contactLine
                    : `https://line.me/R/ti/p/${storeSetting.contactLine}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] hover:bg-[#C8E6C9] transition-all active:scale-95 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>LINE: {storeSetting.contactLine}</span>
              </a>
            )}

            {storeSetting?.contactFacebook && (
              <a
                href={
                  storeSetting.contactFacebook.startsWith('http')
                    ? storeSetting.contactFacebook
                    : `https://facebook.com/${storeSetting.contactFacebook}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-all active:scale-95 shadow-xs"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Facebook: {storeSetting.contactFacebook}</span>
              </a>
            )}

            {storeSetting?.contactInstagram && (
              <a
                href={
                  storeSetting.contactInstagram.startsWith('http')
                    ? storeSetting.contactInstagram
                    : `https://instagram.com/${storeSetting.contactInstagram}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] transition-all active:scale-95 shadow-xs"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram: {storeSetting.contactInstagram}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
