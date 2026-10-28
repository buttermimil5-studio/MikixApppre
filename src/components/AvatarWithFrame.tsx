'use client';

import React from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  frameTheme?: string;
  frameAccessory?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarWithFrame({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
}: AvatarProps) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full border-2 border-[#E8DCCF] bg-[#FFF8F3] overflow-hidden shadow-xs ${currentSize} ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#FFF8F3] text-[#8D6E63] font-black text-sm">
          {alt?.charAt(0)?.toUpperCase() || 'M'}
        </div>
      )}
    </div>
  );
}

export default AvatarWithFrame;

