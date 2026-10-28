'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShokupanIcon,
  CroissantIcon,
  CoffeeCupIcon,
  PeachTartIcon,
  CaneleIcon,
  WheatStalkIcon,
  BaguetteIcon,
} from '@/components/BakeryLineIcons';
import {
  Clock,
  MapPin,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Phone,
  Sparkles,
  Heart,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface BakeryItem {
  id: string;
  name: string;
  jpName: string;
  category: 'BREAD' | 'PASTRY' | 'CAKE' | 'DRINK';
  price: number;
  description: string;
  bakeTime: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

const BAKERY_MENU: BakeryItem[] = [
  {
    id: 'b1',
    name: 'โชกุปังนมสดฮอกไกโด (Hokkaido Milk Shokupan)',
    jpName: '北海道ミルク生食パン',
    category: 'BREAD',
    price: 145,
    description: 'ขนมปังปอนด์ญี่ปุ่นก้อนนุ่มพิเศษ ใช้นมฮอกไกโดแท้ 100% เหนียวนุ่ม หอมกลิ่นเนยและน้ำผึ้งธรรมชาติ',
    bakeTime: 'อบสดรอบ 07:30 และ 13:00 น.',
    icon: ShokupanIcon,
    tags: ['ยอดนิยม', 'นุ่มพิเศษ'],
  },
  {
    id: 'b2',
    name: 'ครัวซองต์เนยสดแท้ฝรั่งเศส (French Butter Croissant)',
    jpName: '発酵バタークロワッサン',
    category: 'PASTRY',
    price: 85,
    description: 'รีดชั้นแป้ง 24 ชั้นด้วยเนยหมัก AOP ฝรั่งเศสแท้ กรอบฟูด้านนอก นุ่มชุ่มเนยด้านใน',
    bakeTime: 'อบสดทุก 2 ชั่วโมง',
    icon: CroissantIcon,
    tags: ['กรอบนอกนุ่มใน'],
  },
  {
    id: 'b3',
    name: 'ทาร์ตพีชสดคัสตาร์ดครีม (Sweet Peach Custard Tart)',
    jpName: '白桃とバニラのタルト',
    category: 'CAKE',
    price: 135,
    description: 'แป้งทาร์ตกรุบกรอบ สอดไส้คัสตาร์ดมาดากัสการ์วานิลลา ท็อปด้วยเนื้อลูกพีชสดฉ่ำหวานละมุน',
    bakeTime: 'จำกัด 30 ชิ้นต่อวัน',
    icon: PeachTartIcon,
    tags: ['แนะนำประจำฤดูกาล'],
  },
  {
    id: 'b4',
    name: 'คานาเล่วานิลลาคาราเมล (Bordeaux Vanilla Canele)',
    jpName: 'クラシック・カヌレ',
    category: 'PASTRY',
    price: 75,
    description: 'ขนมอบโบราณ เปลือกนอกเคลือบน้ำตาลไหม้กรอบกรุบ ด้านในนุ่มหนึบคล้ายคัสตาร์ดหอมรัมและวานิลลา',
    bakeTime: 'พร้อมเสิร์ฟทั้งวัน',
    icon: CaneleIcon,
    tags: ['กรอบกรุบหนึบ'],
  },
  {
    id: 'b5',
    name: 'บาแก็ตต์ซาวร์โดว์ฝรั่งเศส (Artisan Sourdough Baguette)',
    jpName: '自家製酵母バゲット',
    category: 'BREAD',
    price: 80,
    description: 'หมักด้วยยีสต์ธรรมชาติ 18 ชั่วโมง เปลือกกรอบบาง เนื้อเหนียวนุ่ม มีโพรงอากาศสวยงามตามสูตรดั้งเดิม',
    bakeTime: 'อบสดรอบเช้า 08:00 น.',
    icon: BaguetteIcon,
    tags: ['ยีสต์ธรรมชาติ'],
  },
  {
    id: 'b6',
    name: 'กาแฟดริปมือฮันนีโพรเซส (Specialty Drip Coffee)',
    jpName: 'ハンドドリップ珈琲',
    category: 'DRINK',
    price: 95,
    description: 'เมล็ดกาแฟอาราบิกาคั่วกลางจากเชียงราย กลิ่นหอมฟลอรัลและผลไม้พีช ดริปสดแก้วต่อแก้ว',
    bakeTime: 'ชงสดรายแก้ว',
    icon: CoffeeCupIcon,
    tags: ['ชงสด'],
  },
  {
    id: 'b7',
    name: 'อุจิมัทฉะลาเต้นมสด (Kyoto Uji Matcha Latte)',
    jpName: '京都宇治抹茶ラテ',
    category: 'DRINK',
    price: 110,
    description: 'ผงมัทฉะเกรดพิธีการนำเข้าจากเมืองอุจิ เกียวโต ตีสดชงผสมกับนมสดฮอกไกโดหวานน้อย กลมกล่อม',
    bakeTime: 'ชงสดรายแก้ว',
    icon: CoffeeCupIcon,
    tags: ['มัทฉะแท้เกียวโต'],
  },
  {
    id: 'b8',
    name: 'พีชสปาร์คกลิ้งบลอสซั่ม (Peach Blossom Sparkling)',
    jpName: '白桃ブロッサムソーダ',
    category: 'DRINK',
    price: 85,
    description: 'น้ำพีชสกัดธรรมชาติผสมโซดาซ่าสดชื่น ท็อปด้วยเจลลี่พีชโฮมเมดและใบมินต์สด',
    bakeTime: 'เครื่องดื่มสดชื่น',
    icon: CoffeeCupIcon,
    tags: ['สดชื่น'],
  },
];

export function CafeClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const filteredItems = BAKERY_MENU.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[id] > 1) {
        next[id] -= 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = BAKERY_MENU.find((b) => b.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSuccess(true);
    setCart({});
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5D4037] font-sans antialiased selection:bg-[#FFCDB2] selection:text-[#5D4037]">
      {/* 1. iOS Frosted Header */}
      <header className="sticky top-0 z-40 bg-[#FFFDF5]/85 backdrop-blur-md border-b border-[#E8DCCF] shadow-[0_2px_12px_rgba(141,110,99,0.06)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#FFE8D6] border border-[#FFCDB2] flex items-center justify-center shadow-xs">
              <ShokupanIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl text-[#5D4037] tracking-tight">
                  Mori Bakery & Cafe
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                  อบสดพร้อมเสิร์ฟ
                </span>
              </div>
              <p className="text-[11px] text-[#8D6E63] font-medium hidden sm:block">
                森のベーカリー • ขนมปังโฮมเมดสไตล์ญี่ปุ่นแท้
              </p>
            </div>
          </div>

          {/* Navigation links & Cart Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8E7] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับหน้าร้านแอปพรี</span>
            </Link>

            {/* iOS Cart Pill Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-all active:scale-95 shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ตะกร้าขนม</span>
              {totalItemsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#5D4037] text-white">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-12">
        {/* 2. Hero Section - Warm Japanese Cafe Atmosphere */}
        <section className="relative rounded-[2.5rem] bg-[#FFF8F3] border border-[#FFD9CE] p-6 sm:p-12 overflow-hidden shadow-[0_8px_30px_rgba(255,180,162,0.15)]">
          {/* Subtle background wheat watermark icons */}
          <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
            <WheatStalkIcon className="w-48 h-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
                <WheatStalkIcon className="w-3.5 h-3.5 text-[#E5989B]" />
                <span>いらっしゃいませ • HOMEMADE BAKERY & CAFE</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#5D4037] leading-[1.2] tracking-tight">
                อบความสุขสดใหม่... <br className="hidden sm:inline" />
                <span className="text-[#E5989B]">หอมกรุ่นจากเตา</span>ทุกเช้า
              </h1>

              <p className="text-xs sm:text-sm text-[#8D6E63] font-medium leading-relaxed max-w-xl">
                ขนมปังและเพสตรี้สไตล์ญี่ปุ่นแท้ นวดแป้งด้วยมือ หมักยีสต์ธรรมชาติข้ามคืน 18 ชั่วโมง คัดสรรเนยสดแท้ฝรั่งเศส และนมสดฮอกไกโด อบสดใหม่วันต่อวัน ไร้สารกันเสีย
              </p>

              {/* Action Buttons with high border-radius */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('menu-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-all active:scale-95 shadow-sm"
                >
                  เลือกดูเมนูอบสดวันนี้
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold bg-white text-[#5D4037] border border-[#FFCDB2] hover:bg-[#FFFDF5] transition-all active:scale-95 shadow-xs"
                >
                  สั่งล่วงหน้า & เดลิเวอรี
                </button>
              </div>

              {/* Cafe Highlights Chips */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 text-[11px] text-[#8D6E63] font-medium">
                <span className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full border border-[#E8DCCF]">
                  <Clock className="w-3.5 h-3.5 text-[#FFB4A2]" />
                  เปิดบริการ: 07:30 - 18:00 น. (ปิดวันจันทร์)
                </span>
                <span className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-full border border-[#E8DCCF]">
                  <MapPin className="w-3.5 h-3.5 text-[#FFB4A2]" />
                  อารีย์ ซอย 4 (มีที่จอดรถ)
                </span>
              </div>
            </div>

            {/* Right Illustration Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm aspect-square rounded-[2rem] bg-white border border-[#FFD9CE] p-6 shadow-[0_8px_24px_rgba(255,180,162,0.2)] flex flex-col items-center justify-center text-center space-y-4">
                {/* Floating bakery illustration badge */}
                <div className="w-28 h-28 rounded-full bg-[#FFF8E7] border-2 border-[#FFE8D6] flex items-center justify-center shadow-inner">
                  <ShokupanIcon className="w-18 h-18 transform hover:scale-110 transition-transform duration-300" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#FFB4A2] font-black">
                    TODAY'S SPECIAL RECOMMENDATION
                  </span>
                  <h3 className="text-lg font-black text-[#5D4037]">
                    โชกุปังนมสด & ทาร์ตพีชคัสตาร์ด
                  </h3>
                  <p className="text-xs text-[#8D6E63] max-w-xs font-medium">
                    อบสดใหม่รอบบ่าย พร้อมเสิร์ฟคู่กับกาแฟดริปมือหรือมัทฉะเกียวโต
                  </p>
                </div>

                {/* Cute Bakery Line icons row */}
                <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#F5EBE1] w-full">
                  <CroissantIcon className="w-6 h-6 opacity-85 hover:scale-115 transition-transform" />
                  <PeachTartIcon className="w-6 h-6 opacity-85 hover:scale-115 transition-transform" />
                  <CaneleIcon className="w-6 h-6 opacity-85 hover:scale-115 transition-transform" />
                  <CoffeeCupIcon className="w-6 h-6 opacity-85 hover:scale-115 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. iOS Segmented Control Category Filter */}
        <section id="menu-section" className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#5D4037] tracking-tight">
              เมนูเบเกอรี่และเครื่องดื่มอบสด
            </h2>
            <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
              เลือกชมรายการขนมอบโฮมเมดและเครื่องดื่มสูตรพิเศษของทางร้าน
            </p>
          </div>

          {/* iOS-Style Segmented Control Pills */}
          <div className="flex justify-center">
            <div className="bg-[#F5EBE1] p-1.5 rounded-full inline-flex items-center gap-1 overflow-x-auto max-w-full shadow-inner scrollbar-none">
              {[
                { id: 'ALL', label: 'ทั้งหมด (All)' },
                { id: 'BREAD', label: 'ขนมปังญี่ปุ่น' },
                { id: 'PASTRY', label: 'ครัวซองต์ & พาย' },
                { id: 'CAKE', label: 'เค้ก & ทาร์ต' },
                { id: 'DRINK', label: 'เครื่องดื่มคาเฟ่' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === tab.id
                      ? 'bg-white text-[#5D4037] shadow-sm transform scale-102'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Bakery Menu Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const inCartQty = cart[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="rounded-3xl bg-white border border-[#E8DCCF] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(141,110,99,0.06)] hover:shadow-[0_8px_24px_rgba(255,180,162,0.18)] hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div>
                    {/* Item Illustration Header */}
                    <div className="aspect-[4/3] rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE]/60 flex items-center justify-center p-4 relative mb-3 group-hover:bg-[#FFF0EB] transition-colors">
                      <Icon className="w-16 h-16 transform group-hover:scale-110 transition-transform duration-300" />

                      {/* Tag pill */}
                      {item.tags[0] && (
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#E5989B] border border-[#FFCDB2] shadow-xs">
                          {item.tags[0]}
                        </span>
                      )}
                    </div>

                    {/* Japanese name subtitle */}
                    <p className="text-[10px] text-[#A1887F] font-bold tracking-wider mb-0.5">
                      {item.jpName}
                    </p>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm sm:text-base text-[#5D4037] leading-snug line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#8D6E63] font-medium leading-relaxed mt-1.5 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Bake Time Notice */}
                    <div className="flex items-center gap-1 text-[10px] text-[#A1887F] mt-2 font-medium">
                      <Clock className="w-3 h-3 text-[#FFB4A2]" />
                      <span>{item.bakeTime}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart Controls */}
                  <div className="mt-4 pt-3 border-t border-[#F5EBE1] flex items-center justify-between">
                    <span className="text-lg font-black text-[#E5989B]">
                      {item.price} ฿
                    </span>

                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-[#FFF0EB] p-1 rounded-full border border-[#FFCDB2]">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-6 h-6 rounded-full bg-white text-[#5D4037] flex items-center justify-center hover:bg-[#FFE8D6] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-[#5D4037] px-1.5">
                          {inCartQty}
                        </span>
                        <button
                          onClick={() => addToCart(item.id)}
                          className="w-6 h-6 rounded-full bg-[#FFB4A2] text-[#4E342E] flex items-center justify-center hover:bg-[#FFA28D] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 transition-all shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                        <span>สั่งขนม</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. The Mori Promise (ความตั้งใจสไตล์โฮมเมดญี่ปุ่น) */}
        <section className="rounded-[2.5rem] bg-[#FFFDF5] border border-[#E8DCCF] p-8 sm:p-12 space-y-8">
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <span className="text-[11px] font-bold text-[#E5989B] tracking-widest uppercase">
              OUR HOMEMADE PHILOSOPHY
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#5D4037]">
              ความใส่ใจ 3 ประการในทุกเตาอบ
            </h2>
            <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
              เพราะเราเชื่อว่าขนมปังที่ดีที่สุด เริ่มต้นจากวัตถุดิบที่บริสุทธิ์และเวลาที่ทะนุถนอม
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#E8DCCF] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF8E7] flex items-center justify-center">
                <ShokupanIcon className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-[#5D4037]">นมสดฮอกไกโดแท้ 100%</h3>
              <p className="text-xs text-[#8D6E63] font-medium leading-relaxed">
                ใช้นมสดคัดพิเศษนำเข้าจากเกาะฮอกไกโด ไม่ผสมนมผง ให้เนื้อสัมผัสเหนียวนุ่มและกลิ่นหอมละมุนอย่างเป็นธรรมชาติ
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DCCF] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF8E7] flex items-center justify-center">
                <WheatStalkIcon className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-[#5D4037]">หมักยีสต์ธรรมชาติ 18 ชม.</h3>
              <p className="text-xs text-[#8D6E63] font-medium leading-relaxed">
                ใช้กระบวนการ Slow Fermentation หมักช้าในอุณหภูมิควบคุม เพื่อให้แป้งย่อยง่าย ทานแล้วสบายท้อง ไร้สารเร่ง
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8DCCF] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF8E7] flex items-center justify-center">
                <CroissantIcon className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-base text-[#5D4037]">เนยหมัก AOP ไร้ไขมันทรานส์</h3>
              <p className="text-xs text-[#8D6E63] font-medium leading-relaxed">
                เลือกใช้เนยสดแท้เกรดพรีเมียมจากแคว้นนอร์มังดี ปราศจากมาการีน ไร้ไขมันทรานส์ 100% ปลอดภัยต่อสุขภาพทุกคนในบ้าน
              </p>
            </div>
          </div>
        </section>

        {/* 6. Japanese Cafe Atmosphere & Visiting Info */}
        <section className="rounded-[2.5rem] bg-[#FFE8D6]/60 border border-[#FFCDB2] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-bold text-[#E5989B] tracking-wider uppercase">
              VISIT OUR COZY BAKERY
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#5D4037]">
              แวะมานั่งจิบกาแฟและรับไออุ่นจากเตาอบได้ทุกวัน
            </h3>
            <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
              ร้านตกแต่งด้วยไม้โอ๊คอบอุ่น สไตล์มินิมอลญี่ปุ่น มีที่นั่งทั้งแบบเคาน์เตอร์บาร์และโต๊ะริมสวน
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="tel:021234567"
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFCDB2] flex items-center gap-1.5 hover:bg-[#FFFDF5] shadow-xs active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-[#FFB4A2]" />
              <span>02-123-4567</span>
            </a>
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] shadow-xs active:scale-95 transition-all"
            >
              สั่งเดลิเวอรีทันที
            </button>
          </div>
        </section>
      </main>

      {/* 7. Floating iOS Sticky Cart Bar (Appears when items are in cart) */}
      {totalItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-[#5D4037]/95 backdrop-blur-md text-white p-3.5 px-5 rounded-full shadow-[0_8px_30px_rgba(93,64,55,0.35)] border border-[#8D6E63] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#FFB4A2] text-[#4E342E] flex items-center justify-center font-black text-xs">
                {totalItemsCount}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">ตะกร้าขนมอบของคุณ</p>
                <p className="text-[11px] text-[#FFE8D6] font-medium">{totalPrice} บาท</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-colors flex items-center gap-1 active:scale-95"
            >
              <span>ดูตะกร้า / สั่งซื้อ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 8. iOS Bottom Sheet / Order Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#4E342E]/40 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] border border-[#FFD9CE] shadow-[0_16px_40px_rgba(141,110,99,0.25)] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FFB4A2]" />
                <h3 className="font-black text-base text-[#5D4037]">ตะกร้าขนมอบโฮมเมด</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {orderSuccess ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#5D4037]">ได้รับคำสั่งซื้อเรียบร้อยแล้ว</h4>
                    <p className="text-xs text-[#8D6E63] font-medium mt-1">
                      ขอบคุณที่อุดหนุน Mori Bakery & Cafe ทางร้านกำลังจัดเตรียมขนมปังอบสดใหม่ให้คุณ
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setOrderSuccess(false);
                      setIsCartOpen(false);
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D]"
                  >
                    กลับสู่หน้าเมนู
                  </button>
                </div>
              ) : totalItemsCount === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <ShokupanIcon className="w-12 h-12 mx-auto opacity-50" />
                  <p className="font-bold text-sm text-[#5D4037]">ยังไม่มีขนมในตะกร้า</p>
                  <p className="text-xs text-[#8D6E63]">เลือกขนมปัง ครัวซองต์ หรือเครื่องดื่มเพื่อเริ่มสั่งซื้อ</p>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  {/* Items List */}
                  <div className="divide-y divide-[#F5EBE1] max-h-48 overflow-y-auto pr-1">
                    {Object.entries(cart).map(([id, qty]) => {
                      const item = BAKERY_MENU.find((b) => b.id === id);
                      if (!item) return null;

                      return (
                        <div key={id} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-[#5D4037]">{item.name}</p>
                            <p className="text-[11px] text-[#A1887F]">{item.price} ฿ × {qty}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#E5989B]">{item.price * qty} ฿</span>
                            <div className="flex items-center gap-1 bg-[#FFF8F3] p-0.5 rounded-full border border-[#FFD9CE]">
                              <button
                                type="button"
                                onClick={() => removeFromCart(id)}
                                className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#5D4037]"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[11px] font-bold px-1">{qty}</span>
                              <button
                                type="button"
                                onClick={() => addToCart(id)}
                                className="w-5 h-5 rounded-full bg-[#FFB4A2] flex items-center justify-center text-[#4E342E]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Total Bar */}
                  <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-between text-sm font-black">
                    <span className="text-[#5D4037]">ยอดรวมทั้งหมด:</span>
                    <span className="text-[#E5989B] text-base">{totalPrice} บาท</span>
                  </div>

                  {/* Customer Information Form */}
                  <div className="space-y-2.5 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D4037]">ชื่อผู้รับ / ผู้จอง *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="เช่น คุณมิคิ"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF5] border border-[#E8DCCF] text-xs font-medium focus:outline-none focus:border-[#FFB4A2]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#5D4037]">เบอร์โทรศัพท์ติดต่อ *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#FFFDF5] border border-[#E8DCCF] text-xs font-medium focus:outline-none focus:border-[#FFB4A2]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-all active:scale-95 shadow-sm"
                  >
                    ยืนยันคำสั่งซื้อ ({totalPrice} บาท)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. Cute Japanese Cafe Footer */}
      <footer className="mt-16 border-t border-[#E8DCCF] bg-[#FFFDF5] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShokupanIcon className="w-5 h-5" />
            <span className="font-black text-sm text-[#5D4037]">Mori Bakery & Cafe (森のベーカリー)</span>
          </div>
          <p className="text-xs text-[#8D6E63]">
            อบสดใหม่ด้วยใจในทุกๆ เช้า • คัดสรรวัตถุดิบแท้สไตล์ญี่ปุ่น
          </p>
          <div className="pt-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8E7] transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่ระบบเว็บกดแอปพรี</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
