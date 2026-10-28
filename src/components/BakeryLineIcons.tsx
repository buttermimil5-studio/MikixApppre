import React from 'react';

// Delicate, charming line-art Japanese bakery illustrations (Strictly Zero Emojis)
export function ShokupanIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bread Crust top dome */}
      <path
        d="M16 28 C16 16 24 14 32 14 C40 14 48 16 48 28 L48 48 C48 52 44 54 40 54 L24 54 C20 54 16 52 16 48 Z"
        fill="#FFF8E7"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Top Brown Crust Shadow */}
      <path
        d="M16.5 27 C16.5 17 24 15.5 32 15.5 C40 15.5 47.5 17 47.5 27 C45 29 41 30 32 30 C23 30 19 29 16.5 27 Z"
        fill="#D7CCC8"
        stroke="#8D6E63"
        strokeWidth="1.5"
      />
      {/* Melting Butter on top */}
      <rect x="27" y="24" width="10" height="7" rx="2" fill="#FFE082" stroke="#8D6E63" strokeWidth="1.5" />
      {/* Cute sleeping face */}
      <path d="M25 38 Q27 40 29 38" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M35 38 Q37 40 39 38" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="23" cy="41" rx="2.5" ry="1.5" fill="#FFB4A2" />
      <ellipse cx="41" cy="41" rx="2.5" ry="1.5" fill="#FFB4A2" />
      {/* Smile */}
      <path d="M30 43 Q32 45 34 43" stroke="#8D6E63" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CroissantIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crescent body */}
      <path
        d="M12 38 C14 26 24 18 38 18 C46 18 52 24 50 32 C48 40 40 46 28 46 C18 46 12 42 12 38 Z"
        fill="#FFE8D6"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Croissant segments */}
      <path d="M26 21 C28 29 27 39 22 45" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 21 C39 28 38 38 33 45" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 26 C46 32 44 40 41 43" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      {/* Rosy blush */}
      <circle cx="28" cy="35" r="2" fill="#FFB4A2" />
    </svg>
  );
}

export function CoffeeCupIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup Body */}
      <path
        d="M18 24 L20 46 C20 51 25 54 32 54 C39 54 44 51 44 46 L46 24 Z"
        fill="#FFFDF5"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cup Handle */}
      <path
        d="M45 28 C51 28 53 36 49 42 C47 44 44 45 43 45"
        fill="none"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Saucer */}
      <path d="M14 54 C14 54 22 58 32 58 C42 58 50 54 50 54" stroke="#8D6E63" strokeWidth="2.5" strokeLinecap="round" />
      {/* Latte Heart Art */}
      <ellipse cx="32" cy="24" rx="14" ry="4" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="1.5" />
      <path d="M32 24 C30 22 28 23 29 25 C30 26 32 27 32 27 C32 27 34 26 35 25 C36 23 34 22 32 24 Z" fill="#FFFDF5" />
      {/* Steam lines */}
      <path d="M26 18 C25 14 27 12 26 8" stroke="#FFB4A2" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 17 C31 13 33 11 32 7" stroke="#FFB4A2" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 18 C37 14 39 12 38 8" stroke="#FFB4A2" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PeachTartIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tart crust base */}
      <path
        d="M14 38 L18 52 C18 54 22 56 32 56 C42 56 46 54 46 52 L50 38 Z"
        fill="#FFE8D6"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Fluted rim */}
      <path
        d="M13 38 Q17 35 21 38 Q25 35 29 38 Q33 35 37 38 Q41 35 45 38 Q49 35 51 38"
        stroke="#8D6E63"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#D7CCC8"
      />
      {/* Peach slices layered */}
      <path
        d="M24 22 C22 28 26 36 32 36 C38 36 42 28 40 22 C38 16 32 16 32 16 C32 16 26 16 24 22 Z"
        fill="#FFCDB2"
        stroke="#8D6E63"
        strokeWidth="2"
      />
      <circle cx="32" cy="27" r="3" fill="#FFB4A2" />
      {/* Mint Leaf */}
      <path d="M32 16 C36 12 40 13 41 15 C41 18 38 19 32 16 Z" fill="#A7D7C5" stroke="#6D4C41" strokeWidth="1.2" />
    </svg>
  );
}

export function CaneleIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Canele body */}
      <path
        d="M20 26 L18 48 C18 51 22 54 32 54 C42 54 46 51 46 48 L44 26 Z"
        fill="#6D4C41"
        stroke="#4E342E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Fluted top crown */}
      <ellipse cx="32" cy="26" rx="12" ry="4" fill="#8D6E63" stroke="#4E342E" strokeWidth="2" />
      <ellipse cx="32" cy="26" rx="4" ry="2" fill="#4E342E" />
      {/* Vertical flutes */}
      <path d="M24 28 L23 49" stroke="#4E342E" strokeWidth="1.5" />
      <path d="M29 30 L29 52" stroke="#4E342E" strokeWidth="1.5" />
      <path d="M35 30 L35 52" stroke="#4E342E" strokeWidth="1.5" />
      <path d="M40 28 L41 49" stroke="#4E342E" strokeWidth="1.5" />
      {/* Caramel gloss shine */}
      <path d="M22 34 Q24 38 22 42" stroke="#D7CCC8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function WheatStalkIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 44 V12" stroke="#BCAAA4" strokeWidth="2" strokeLinecap="round" />
      {/* Wheat Grains */}
      <ellipse cx="20" cy="20" rx="3" ry="5" transform="rotate(-30 20 20)" fill="#FFE8D6" stroke="#8D6E63" strokeWidth="1.5" />
      <ellipse cx="28" cy="20" rx="3" ry="5" transform="rotate(30 28 20)" fill="#FFE8D6" stroke="#8D6E63" strokeWidth="1.5" />
      <ellipse cx="20" cy="28" rx="3" ry="5" transform="rotate(-30 20 28)" fill="#FFE8D6" stroke="#8D6E63" strokeWidth="1.5" />
      <ellipse cx="28" cy="28" rx="3" ry="5" transform="rotate(30 28 28)" fill="#FFE8D6" stroke="#8D6E63" strokeWidth="1.5" />
      <ellipse cx="24" cy="12" rx="3" ry="5" fill="#FFE8D6" stroke="#8D6E63" strokeWidth="1.5" />
    </svg>
  );
}

export function BaguetteIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 48 C10 44 14 36 28 26 C42 16 50 12 54 16 C58 20 54 28 40 38 C26 48 16 52 12 48 Z"
        fill="#FFE8D6"
        stroke="#8D6E63"
        strokeWidth="2.5"
      />
      {/* Slashes */}
      <path d="M24 38 L28 34" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 32 L36 28" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 26 L44 22" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
