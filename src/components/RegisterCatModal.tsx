'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Heart, Star } from 'lucide-react';

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
  const [progress, setProgress] = useState(12);
  const [countdown, setCountdown] = useState(5);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusMessages = useMemo(
    () => [
      '🐾 กำลังเตรียมโต๊ะทำงานและสมุดบัญชีตัวแทน...',
      '🧁 กำลังอบขนมต้อนรับและเปิดรหัสสมาชิก...',
      '🎀 กำลังประทับตราสิทธิ์ราคาส่งตัวแทนตลอดชีพ...',
      '✨ ใกล้เสร็จแล้วน้า อย่าเพิ่งปิดหน้าต่างนะคับ...',
    ],
    []
  );

  // Wavy text characters broken down safely for Thai graphemes
  const wavyText = 'น้องแมวกำลังสมัครสมาชิกให้น้า รอสักครู่คับ';
  const wavyGraphemes = useMemo(() => {
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      try {
        const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(wavyText)).map((s) => s.segment);
      } catch {
        // fallback
      }
    }
    // Fallback split
    return wavyText.split('');
  }, [wavyText]);

  // Loading progress simulation
  useEffect(() => {
    if (!isOpen) {
      setProgress(12);
      setStatusIndex(0);
      setCountdown(5);
      return;
    }

    if (isSuccess) {
      setProgress(100);
      return;
    }

    // Progress increments smoothly up to 92%
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        // gradually slow down as it approaches 92
        const remaining = 92 - prev;
        const jump = Math.max(1, Math.floor(remaining * 0.12));
        return prev + jump;
      });
    }, 280);

    // Rotate cute bakery status tips
    const statusTimer = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);

    return () => {
      clearInterval(progressTimer);
      clearInterval(statusTimer);
    };
  }, [isOpen, isSuccess, statusMessages.length]);

  // Countdown timer on success
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFDF9] border-2 border-[#FFD9CE] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(255,180,162,0.4)] text-center overflow-hidden">
        
        {/* Soft decorative background circles */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFE3D8]/50 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFF0EB]/80 rounded-full blur-xl pointer-events-none" />

        {!isSuccess ? (
          /* ================= LOADING STATE ================= */
          <div className="space-y-5 relative z-10">
            {/* Animated Cat Mascot */}
            <div className="relative w-44 h-40 mx-auto flex items-center justify-center">
              {/* Floating Sparkles & Treats */}
              <div className="absolute -top-1 -left-2 text-xl animate-bounce" style={{ animationDuration: '2s' }}>
                ✨
              </div>
              <div className="absolute top-2 -right-2 text-lg animate-bounce" style={{ animationDuration: '2.4s', animationDelay: '0.4s' }}>
                🍰
              </div>
              <div className="absolute bottom-4 -left-3 text-lg animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.2s' }}>
                🥐
              </div>
              <div className="absolute bottom-6 -right-2 text-xl animate-pulse text-[#FFB4A2]">
                🌸
              </div>

              {/* Animated Kawaii Cat SVG */}
              <svg
                viewBox="0 0 200 180"
                className="w-full h-full animate-cat-bob drop-shadow-[0_6px_14px_rgba(141,110,99,0.18)]"
              >
                {/* Tail with wagging animation */}
                <g className="animate-cat-tail">
                  <path
                    d="M 145 130 C 175 125, 185 85, 165 75 C 150 68, 148 90, 142 115"
                    fill="none"
                    stroke="#FFD9CE"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 145 130 C 175 125, 185 85, 165 75 C 150 68, 148 90, 142 115"
                    fill="none"
                    stroke="#5D4037"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* Cat Chubby Body */}
                <ellipse cx="100" cy="125" rx="52" ry="42" fill="#FFF8F3" stroke="#5D4037" strokeWidth="2.5" />
                {/* Belly highlight */}
                <ellipse cx="100" cy="130" rx="36" ry="28" fill="#FFFFFF" />

                {/* Left Ear with twitch */}
                <g className="animate-cat-ear-left">
                  <polygon points="56,65 76,24 96,52" fill="#FFF8F3" stroke="#5D4037" strokeWidth="2.5" strokeLinejoin="round" />
                  <polygon points="62,60 76,33 90,52" fill="#FFB4A2" />
                </g>

                {/* Right Ear with twitch */}
                <g className="animate-cat-ear-right">
                  <polygon points="104,52 124,24 144,65" fill="#FFF8F3" stroke="#5D4037" strokeWidth="2.5" strokeLinejoin="round" />
                  <polygon points="110,52 124,33 138,60" fill="#FFB4A2" />
                </g>

                {/* Cat Head */}
                <ellipse cx="100" cy="80" rx="46" ry="38" fill="#FFF8F3" stroke="#5D4037" strokeWidth="2.5" />

                {/* Little Baker Chef Hat */}
                <g transform="translate(85, 15)">
                  {/* Hat base */}
                  <rect x="5" y="28" width="20" height="7" rx="3" fill="#FFFDF5" stroke="#5D4037" strokeWidth="1.8" />
                  {/* Hat puffs */}
                  <path
                    d="M 4 28 C -3 18, 5 8, 15 11 C 18 5, 27 5, 30 12 C 37 9, 43 18, 36 28 Z"
                    fill="#FFFFFF"
                    stroke="#5D4037"
                    strokeWidth="1.8"
                  />
                  {/* Tiny pink strawberry emblem */}
                  <circle cx="15" cy="20" r="3.5" fill="#FF8A8A" />
                  <polygon points="14,16 16,16 15,14" fill="#81C784" />
                </g>

                {/* Rosy Cheeks */}
                <ellipse cx="72" cy="88" rx="8" ry="5" fill="#FFA28D" opacity="0.65" />
                <ellipse cx="128" cy="88" rx="8" ry="5" fill="#FFA28D" opacity="0.65" />

                {/* Happy Squinting Eyes (Anime / Kawaii curve) */}
                <path d="M 72 78 Q 79 70 86 78" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
                <path d="M 114 78 Q 121 70 128 78" fill="none" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />

                {/* Little Brown Nose */}
                <polygon points="98,84 102,84 100,87" fill="#5D4037" />

                {/* Cute Cat Mouth 'ω' */}
                <path
                  d="M 94 88 Q 100 93 100 89 Q 100 93 106 88"
                  fill="none"
                  stroke="#5D4037"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                {/* Whiskers */}
                {/* Left */}
                <line x1="58" y1="82" x2="42" y2="78" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="57" y1="88" x2="40" y2="89" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" />
                {/* Right */}
                <line x1="142" y1="82" x2="158" y2="78" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="143" y1="88" x2="160" y2="89" stroke="#8D6E63" strokeWidth="1.8" strokeLinecap="round" />

                {/* Little Tapping Paws */}
                <g className="animate-cat-paw-left">
                  <ellipse cx="80" cy="136" rx="10" ry="8" fill="#FFFFFF" stroke="#5D4037" strokeWidth="2.2" />
                  <circle cx="76" cy="138" r="1.5" fill="#FFB4A2" />
                  <circle cx="80" cy="139" r="1.5" fill="#FFB4A2" />
                  <circle cx="84" cy="138" r="1.5" fill="#FFB4A2" />
                </g>
                <g className="animate-cat-paw-right">
                  <ellipse cx="120" cy="136" rx="10" ry="8" fill="#FFFFFF" stroke="#5D4037" strokeWidth="2.2" />
                  <circle cx="116" cy="138" r="1.5" fill="#FFB4A2" />
                  <circle cx="120" cy="139" r="1.5" fill="#FFB4A2" />
                  <circle cx="124" cy="138" r="1.5" fill="#FFB4A2" />
                </g>
              </svg>
            </div>

            {/* Wavy Bouncing Thai Text */}
            <div className="py-1">
              <h3 className="text-base sm:text-lg font-black text-[#5D4037] leading-relaxed select-none inline-flex flex-wrap justify-center items-center">
                {wavyGraphemes.map((char, idx) => (
                  <span
                    key={idx}
                    className="animate-wavy-bounce inline-block"
                    style={{
                      animationDelay: `${idx * 0.06}s`,
                      marginRight: char === ' ' ? '0.35rem' : '0.015rem',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h3>
            </div>

            {/* Download / Progress Bar */}
            <div className="space-y-2 pt-1">
              <div className="relative w-full h-5 bg-[#FFF0EB] border border-[#FFD9CE] rounded-full overflow-hidden p-0.5 shadow-inner">
                {/* Candy Striped Progress Fill */}
                <div
                  className="h-full bg-gradient-to-r from-[#FFB4A2] via-[#FFA28D] to-[#E5989B] rounded-full candy-striped transition-all duration-300 ease-out flex items-center justify-end pr-1.5"
                  style={{ width: `${progress}%` }}
                >
                  <span className="text-[10px] font-black text-white drop-shadow-sm select-none">
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Dynamic Status message below bar */}
              <div className="h-5 flex items-center justify-center">
                <p className="text-xs font-bold text-[#8D6E63] transition-all duration-300">
                  {statusMessages[statusIndex]}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ================= SUCCESS CELEBRATION STATE ================= */
          <div className="space-y-5 relative z-10 animate-in zoom-in-95 duration-300">
            {/* Confetti & Sparkles Decorative Header */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FFF0EB] rounded-full animate-ping opacity-25" />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFD9CE] to-[#FFF0EB] border-2 border-[#FFB4A2] flex items-center justify-center shadow-lg">
                <span className="text-4xl animate-bounce">🎉</span>
              </div>
              <div className="absolute -top-1 -right-1 text-2xl animate-spin" style={{ animationDuration: '6s' }}>
                ✨
              </div>
              <div className="absolute -bottom-1 -left-1 text-xl animate-pulse text-[#FF8A8A]">
                💖
              </div>
            </div>

            {/* Main Welcome Headline with User Name */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] border border-[#FFD9CE] text-[#5D4037] text-xs font-black">
                <Sparkles className="w-3.5 h-3.5 text-[#FFB4A2]" />
                <span>สมัครตัวแทนสำเร็จแล้ว!</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#5D4037] leading-snug">
                ยินดีต้อนรับ{' '}
                <span className="text-[#E5989B] underline decoration-[#FFD9CE] decoration-wavy decoration-2">
                  {memberName || 'สมาชิกใหม่'}
                </span>
                <br />
                เข้าสู่ครอบครัวตัวแทนของมิกิ
              </h2>

              <p className="text-sm sm:text-base font-bold text-[#8D6E63] bg-[#FFF8F3] py-2 px-4 rounded-2xl border border-[#FFD9CE]/60 inline-block">
                🐾 ตั้งใจทำงานแล้วมารับรางวัลกับมิกินะคะ 🎁✨
              </p>
            </div>

            {/* Perks Cards */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <div className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DCCF] flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] flex items-center justify-center flex-shrink-0 text-sm">
                  🏷️
                </div>
                <div>
                  <div className="text-[11px] font-black text-[#5D4037]">ราคาส่งทันที</div>
                  <div className="text-[10px] text-[#8D6E63]">ซื้อได้ในราคาส่งทุกแอป</div>
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DCCF] flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] flex items-center justify-center flex-shrink-0 text-sm">
                  ⚡
                </div>
                <div>
                  <div className="text-[11px] font-black text-[#5D4037]">จัดส่งอัตโนมัติ</div>
                  <div className="text-[10px] text-[#8D6E63]">รับแอปรวดเร็ว 24 ชม.</div>
                </div>
              </div>
            </div>

            {/* Action Button & Countdown */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={onProceed}
                className="w-full py-3.5 rounded-full text-sm font-black bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 transition-all shadow-[0_4px_16px_rgba(255,180,162,0.4)] flex items-center justify-center gap-2"
              >
                <span>เข้าสู่หน้าร้าน เริ่มช้อปราคาส่งทันที</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-[#A1887F] font-bold">
                (กำลังนำคุณไปที่หน้าร้านโดยอัตโนมัติใน {countdown} วินาที...)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterCatModal;
