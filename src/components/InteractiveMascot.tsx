'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, ChevronUp, Heart } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

const CUTE_MESSAGES = [
  'ยินดีต้อนรับสู่ Miki Store ค่า~',
  'ปุ๋ม! นุ่มฟูดุ๊กดิ๊กจังเลย~',
  'แวะเลือกดูแอพพรีเมียมราคาประหยัดได้เลยน้า~',
  'มีข้อสงสัยสอบถามแอดมินได้ตลอด 24 ชม. เลยนะคะ~',
  'ขอบคุณที่แวะมาทักทายหนูน้า~',
  'กดที่ตัวหนูเพื่อหมุนติ้วๆ เล่นได้อีกนะคะ!',
  'ขอให้วันนี้เป็นวันที่สดใสและมีความสุขน้า~',
];

export default function InteractiveMascot() {
  const [col, setCol] = useState(2); // 0..4 (2 is center)
  const [row, setRow] = useState(2); // 0..4 (2 is center)
  const [isSpinning, setIsSpinning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showControls, setShowControls] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastMouseMoveRef = useRef<number>(Date.now());
  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const savedMin = localStorage.getItem('miki_mascot_minimized');
      if (savedMin === 'true') {
        setIsMinimized(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Mouse tracking logic (Look at cursor)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMouseMoveRef.current = Date.now();
      if (isSpinning || isMinimized) return;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - mascotCenterX;
      const dy = e.clientY - mascotCenterY;

      // Map dx, dy into col (0..4) and row (0..4)
      let targetCol = 2;
      if (dx < -220) targetCol = 0;
      else if (dx < -70) targetCol = 1;
      else if (dx > 220) targetCol = 4;
      else if (dx > 70) targetCol = 3;

      let targetRow = 2;
      if (dy < -220) targetRow = 0;
      else if (dy < -70) targetRow = 1;
      else if (dy > 220) targetRow = 4;
      else if (dy > 70) targetRow = 3;

      setCol(targetCol);
      setRow(targetRow);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isSpinning, isMinimized]);

  // Idle animation loop (wiggling / glancing around when idle)
  useEffect(() => {
    if (isMinimized) return;

    const interval = setInterval(() => {
      if (isSpinning) return;
      const idleTime = Date.now() - lastMouseMoveRef.current;
      if (idleTime > 2500) {
        const rand = Math.random();
        if (rand < 0.3) {
          setCol(1);
          setRow(2);
          setTimeout(() => { setCol(2); }, 600);
        } else if (rand < 0.6) {
          setCol(3);
          setRow(2);
          setTimeout(() => { setCol(2); }, 600);
        } else if (rand < 0.8) {
          setCol(2);
          setRow(1);
          setTimeout(() => { setCol(2); setRow(2); }, 500);
        } else {
          setCol(2);
          setRow(2);
        }
      }
    }, 1800);

    return () => clearInterval(interval);
  }, [isSpinning, isMinimized]);

  // Click interaction: spin 360, hop, spawn particles & play pop sound
  const handleClick = useCallback(() => {
    playBubblePop();

    // Trigger bounce
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 450);

    // Trigger 360-degree spin
    if (!isSpinning) {
      setIsSpinning(true);
      const spinFrames = [
        { c: 2, r: 2 },
        { c: 3, r: 2 },
        { c: 4, r: 2 },
        { c: 4, r: 0 },
        { c: 2, r: 0 },
        { c: 0, r: 0 },
        { c: 0, r: 2 },
        { c: 1, r: 2 },
        { c: 2, r: 2 },
      ];

      spinFrames.forEach((frame, idx) => {
        setTimeout(() => {
          setCol(frame.c);
          setRow(frame.r);
          if (idx === spinFrames.length - 1) {
            setIsSpinning(false);
          }
        }, idx * 75);
      });
    }

    // Spawn floating particles
    const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + (Math.random() - 0.5) * 30,
      y: 35 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 60,
      vy: -50 - Math.random() * 40,
      color: ['#FFB4A2', '#E5989B', '#B5838D', '#FFD166', '#A0C4FF'][Math.floor(Math.random() * 5)],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 900);

    // Show random warm message
    const randomMsg = CUTE_MESSAGES[Math.floor(Math.random() * CUTE_MESSAGES.length)];
    setMessage(randomMsg);
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
    }, 4500);
  }, [isSpinning]);

  // Toggle Minimized
  const toggleMinimize = (min: boolean) => {
    playBubblePop();
    setIsMinimized(min);
    try {
      localStorage.setItem('miki_mascot_minimized', min ? 'true' : 'false');
    } catch {
      // Ignore
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => toggleMinimize(false)}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#5D4037] text-[#FDFBF7] rounded-full shadow-lg hover:bg-[#4E342E] transition-all hover:scale-105 border border-[#8D6E63]/30 text-xs font-medium cursor-pointer"
          title="เปิดน้องกระต่ายดุ๊กดิ๊ก"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFB4A2] animate-pulse" />
          <span>น้องกระต่าย</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex flex-col items-start select-none"
    >
      {/* Speech Bubble */}
      {message && (
        <div className="mb-2 max-w-[210px] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl rounded-bl-none shadow-xl border border-[#5D4037]/10 text-xs font-medium text-[#5D4037] animate-in fade-in slide-in-from-bottom-2 duration-200 relative">
          <p className="leading-relaxed">{message}</p>
          <div className="absolute -bottom-2 left-3 w-3 h-3 bg-white rotate-45 border-r border-b border-[#5D4037]/10" />
        </div>
      )}

      {/* Control Button (Close/Minimize on hover) */}
      <div
        className={`flex items-center gap-1.5 mb-1 transition-all duration-200 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <button
          onClick={() => toggleMinimize(true)}
          className="p-1 bg-white/90 backdrop-blur-sm rounded-full text-[#5D4037]/70 hover:text-[#5D4037] shadow-sm border border-[#5D4037]/10 hover:bg-gray-100 cursor-pointer transition-colors"
          title="ย่อลง"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Mascot Avatar Container */}
      <div className="relative group">
        {/* Floating Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none transition-all duration-700 ease-out z-50"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              transform: `translate(${p.vx}px, ${p.vy}px) scale(0)`,
              opacity: 0,
            }}
          >
            <Heart className="w-3.5 h-3.5" style={{ color: p.color, fill: p.color }} />
          </div>
        ))}

        {/* Mascot Frame */}
        <div
          onClick={handleClick}
          className={`relative cursor-pointer transition-transform duration-150 ${
            isBouncing ? '-translate-y-3 scale-110' : 'hover:scale-105 active:scale-95'
          }`}
          style={{ width: '84px', height: '84px' }}
        >
          {/* Subtle soft shadow under mascot */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-12 h-2.5 bg-[#5D4037]/10 rounded-full blur-[2px]" />

          {/* Sprite frame (Retina 800x800 atlas scaled down to 420x420, 84px per cell) */}
          <div
            style={{
              width: '84px',
              height: '84px',
              backgroundImage: 'url(/mascot_bunny_sprites.png)',
              backgroundSize: '420px 420px',
              backgroundPosition: `-${col * 84}px -${row * 84}px`,
              imageRendering: 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
}
