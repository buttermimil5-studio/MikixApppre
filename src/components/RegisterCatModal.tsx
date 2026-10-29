'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface RegisterCatModalProps {
  isOpen: boolean;
  isSuccess: boolean;
  memberName: string;
  onProceed: () => void;
}

export function RegisterCatModal({
  isOpen,
  isSuccess,
  memberName,
  onProceed,
}: RegisterCatModalProps) {
  const [countdown, setCountdown] = useState(4);
  const [msgIndex, setMsgIndex] = useState(0);

  const messages = useMemo(
    () => [
      'น้องแมวกำลังสมัครสมาชิกให้น้า',
      'กำลังเตรียมข้อมูลตัวแทน',
      'รอสักครู่นะคะ',
    ],
    []
  );

  // Rotate speech bubble messages smoothly
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2400);

    return () => clearInterval(timer);
  }, [isOpen, isSuccess, messages.length]);

  // Countdown when success
  useEffect(() => {
    if (!isSuccess || !isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSuccess, isOpen, onProceed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/25 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white border border-[#E8DCCF] rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(141,110,99,0.12)] text-center">
        {!isSuccess ? (
          /* ================= LOADING STATE ================= */
          <div className="flex flex-col items-center space-y-4">
            {/* Speech Bubble */}
            <div className="relative bg-[#FFF8F3] border border-[#FFD9CE] rounded-2xl px-4 py-3 shadow-xs max-w-[260px]">
              <div className="text-xs sm:text-sm font-bold text-[#5D4037] flex items-center justify-center min-h-[24px]">
                <span className="transition-opacity duration-200">
                  {messages[msgIndex]}
                </span>
                {/* Typing dots */}
                <span className="inline-flex items-center gap-1 ml-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB4A2] animate-typing-dot-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB4A2] animate-typing-dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB4A2] animate-typing-dot-3" />
                </span>
              </div>

              {/* Speech bubble arrow pointing down towards the cat */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#FFF8F3] border-b border-r border-[#FFD9CE] rotate-45" />
            </div>

            {/* Cat Mascot Image */}
            <div className="w-32 h-32 flex items-center justify-center pt-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cat-mascot.png"
                alt="น้องแมวมิกิ"
                className="w-28 h-auto object-contain select-none"
              />
            </div>

            <p className="text-[11px] text-[#A1887F] font-medium pt-1">
              ระบบกำลังเชื่อมต่อและบันทึกข้อมูลตัวแทน
            </p>
          </div>
        ) : (
          /* ================= SUCCESS STATE ================= */
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Cat Mascot Image */}
            <div className="w-28 h-28 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cat-mascot.png"
                alt="น้องแมวมิกิ"
                className="w-24 h-auto object-contain select-none"
              />
            </div>

            {/* Speech bubble welcome */}
            <div className="relative bg-[#FFF8F3] border border-[#FFD9CE] rounded-2xl p-4 shadow-xs w-full text-center space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[#5D4037] leading-snug">
                ยินดีต้อนรับ <span className="text-[#FF8A8A] font-black">{memberName || 'ตัวแทนใหม่'}</span>
                <br />
                เข้าสู่ครอบครัวตัวแทนของมิกิ
              </h3>
              <p className="text-xs font-medium text-[#8D6E63]">
                ตั้งใจทำงานแล้วมารับรางวัลกับมิกินะคะ
              </p>
            </div>

            {/* Clean proceed button */}
            <div className="w-full pt-1 space-y-2">
              <button
                type="button"
                onClick={onProceed}
                className="w-full py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-98 transition-all shadow-xs"
              >
                เข้าสู่หน้าร้าน
              </button>
              <p className="text-[11px] text-[#A1887F] font-medium">
                (กำลังนำคุณไปที่หน้าร้านใน {countdown} วินาที)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterCatModal;
