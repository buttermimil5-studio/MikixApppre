'use client';

import { useEffect } from 'react';
import { playBubblePop } from '@/lib/soundEffects';

export function SoundEffectProvider() {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, [role="button"], input[type="submit"], .clickable-pop');
      if (clickable) {
        playBubblePop();
      }
    };

    window.addEventListener('click', handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return null;
}
