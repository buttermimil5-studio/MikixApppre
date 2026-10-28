import React from 'react';

// Delicate, charming pastel SVG icons (Strictly Zero Emojis)
export function BunnyIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <path d="M16 22 C14 11 15 4 19 4 C23 4 21 11 19 22 Z" fill="#FFFFFF" stroke="#FFB6C1" strokeWidth="1.5" />
      <path d="M17 18 C16 11 16.5 6 19 6 C21.5 6 20 11 18.5 18 Z" fill="#FFE4EC" />
      <path d="M32 22 C34 11 33 4 29 4 C25 4 27 11 29 22 Z" fill="#FFFFFF" stroke="#FFB6C1" strokeWidth="1.5" />
      <path d="M31 18 C32 11 31.5 6 29 6 C26.5 6 28 11 29.5 18 Z" fill="#FFE4EC" />
      {/* Head */}
      <circle cx="24" cy="30" r="14" fill="#FFFFFF" stroke="#FFB6C1" strokeWidth="1.5" />
      {/* Cheeks */}
      <ellipse cx="16" cy="32" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="32" cy="32" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.6" />
      {/* Eyes */}
      <circle cx="19" cy="28" r="1.5" fill="#5A4747" />
      <circle cx="29" cy="28" r="1.5" fill="#5A4747" />
      {/* Nose & Mouth */}
      <path d="M23 31 Q24 32 25 31" stroke="#FF8FA3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BearIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="13" cy="18" r="6" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.5" />
      <circle cx="13" cy="18" r="3.5" fill="#EFEBE9" />
      <circle cx="35" cy="18" r="6" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.5" />
      <circle cx="35" cy="18" r="3.5" fill="#EFEBE9" />
      {/* Head */}
      <circle cx="24" cy="29" r="14" fill="#D7CCC8" stroke="#BCAAA4" strokeWidth="1.5" />
      {/* Snout */}
      <ellipse cx="24" cy="32" rx="6" ry="4.5" fill="#EFEBE9" />
      {/* Cheeks */}
      <ellipse cx="16" cy="31" rx="2.2" ry="1.4" fill="#FFB6C1" opacity="0.7" />
      <ellipse cx="32" cy="31" rx="2.2" ry="1.4" fill="#FFB6C1" opacity="0.7" />
      {/* Eyes */}
      <circle cx="18" cy="27" r="1.5" fill="#4E342E" />
      <circle cx="30" cy="27" r="1.5" fill="#4E342E" />
      {/* Nose */}
      <ellipse cx="24" cy="30.5" rx="1.8" ry="1.2" fill="#5D4037" />
    </svg>
  );
}

export function BowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left loop */}
      <path d="M18 18 C11 12 6 14 7 19 C8 24 13 22 18 18 Z" fill="#FF8FA3" stroke="#FF5C85" strokeWidth="1" />
      {/* Right loop */}
      <path d="M18 18 C25 12 30 14 29 19 C28 24 23 22 18 18 Z" fill="#FF8FA3" stroke="#FF5C85" strokeWidth="1" />
      {/* Ribbons */}
      <path d="M16 20 L11 28 L15 26 L17 21" fill="#FF8FA3" />
      <path d="M20 20 L25 28 L21 26 L19 21" fill="#FF8FA3" />
      {/* Center knot */}
      <circle cx="18" cy="18" r="3" fill="#FFB3C6" stroke="#FF5C85" strokeWidth="1" />
    </svg>
  );
}

export function CherryIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 23 C15 15 19 9 24 7" stroke="#7CB342" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M23 23 C22 16 21 11 24 7" stroke="#7CB342" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M24 7 C27 5 30 7 28 10 C25 11 24 9 24 7 Z" fill="#9CCC65" />
      <circle cx="13" cy="23" r="5" fill="#FF477E" />
      <circle cx="11.5" cy="21" r="1.2" fill="#FFFFFF" opacity="0.7" />
      <circle cx="23" cy="23" r="5" fill="#FF477E" />
      <circle cx="21.5" cy="21" r="1.2" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

export function CreamIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6 C17 9 15 11 13 13 C9 17 9 21 12 25 C14 27 22 27 24 25 C27 21 27 17 23 13 C21 11 19 9 18 6 Z"
        fill="#FFFDF5"
        stroke="#FFD6E0"
        strokeWidth="1.2"
      />
      <path d="M18 10 C16 15 16 20 18 25" stroke="#FFE4EC" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 16 C16 18 20 21 22 20" stroke="#FFE4EC" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="7" r="4.5" fill="#FF7597" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M12 11.5 V21" stroke="#FF7597" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function WashiTape({ className = "w-16 h-4" }: { className?: string }) {
  return (
    <div className={`bg-[#FFD6E0]/70 backdrop-blur-xs rounded-xs border-y border-[#FFB6C1]/40 transform -rotate-2 ${className}`} />
  );
}

export function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}
