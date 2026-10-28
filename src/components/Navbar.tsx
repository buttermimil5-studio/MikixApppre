'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AvatarWithFrame } from './AvatarWithFrame';
import { logoutAction } from '@/lib/actions/authActions';
import {
  Store,
  Wallet,
  Clock,
  ShieldCheck,
  LogOut,
  LogIn,
  Sparkles,
  User as UserIcon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ShokupanIcon } from './BakeryLineIcons';
import { toggleSound, isSoundEnabled } from '@/lib/soundEffects';

interface NavbarProps {
  initialUser: any;
  storeSetting: any;
}

export function Navbar({ initialUser, storeSetting }: NavbarProps) {
  const [user, setUser] = useState(initialUser);
  const [soundOn, setSoundOn] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(initialUser);
    setSoundOn(isSoundEnabled());
  }, [initialUser]);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'หน้าร้าน', icon: Store },
    { href: '/topup', label: 'เติมเครดิต', icon: Wallet },
    { href: '/orders', label: 'ประวัติการซื้อ', icon: Clock },
    ...(user?.role === 'ADMIN' ? [{ href: '/admin', label: 'หลังบ้านแอดมิน', icon: ShieldCheck }] : []),
    ...(user ? [{ href: '/profile', label: 'โปรไฟล์', icon: UserIcon }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-[#E8DCCF] shadow-[0_2px_12px_rgba(141,110,99,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo & Store Title */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
              <div className="relative flex-shrink-0">
                <AvatarWithFrame
                  src={storeSetting?.logoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                  alt={storeSetting?.storeName || 'Store Logo'}
                  size="sm"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm sm:text-base text-[#5D4037] tracking-tight group-hover:text-[#E5989B] transition-colors whitespace-nowrap">
                    {storeSetting?.storeName || 'Miki App Bakery'}
                  </span>
                  {storeSetting?.storeTag && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] whitespace-nowrap">
                      {storeSetting.storeTag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8D6E63] font-medium hidden md:block whitespace-nowrap">
                  {storeSetting?.storeSubtitle || 'อบความสุขสดใหม่ • ศูนย์รวมแอปพรีเมียมราคาส่ง 24 ชม.'}
                </p>
              </div>
            </Link>

            {/* User Account / Auth Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {/* Credit Balance Badge */}
                  <Link
                    href="/topup"
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-[#FFF8F3] border border-[#FFD9CE] text-[#5D4037] font-bold text-xs hover:bg-[#FFEFE8] transition-all shadow-xs whitespace-nowrap flex-shrink-0"
                    title="คลิกเพื่อเติมเครดิต"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#E5989B] flex-shrink-0" />
                    <span className="hidden sm:inline">เครดิต:</span>
                    <span className="text-[#E5989B] font-black">{user.creditBalance.toLocaleString()} ฿</span>
                  </Link>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-full hover:bg-[#FFF8F3] transition-all whitespace-nowrap flex-shrink-0"
                  >
                    <AvatarWithFrame
                      src={user.avatarUrl}
                      alt={user.profileName || user.username}
                      size="sm"
                    />
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold text-[#5D4037] leading-tight truncate max-w-[110px]">
                        {user.profileName || user.username}
                      </p>
                      <p className="text-[10px] text-[#8D6E63] font-medium uppercase">{user.role}</p>
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 rounded-full text-[#8D6E63] hover:text-[#D84315] hover:bg-[#FFF0EB] transition-colors flex-shrink-0"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs text-[#6D4C41] hover:text-[#5D4037] hover:bg-[#FFF8F3] transition-colors whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>เข้าสู่ระบบ</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs bg-[#FFB4A2] text-[#4E342E] shadow-xs hover:bg-[#FFA28D] active:scale-95 transition-all whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>สมัครสมาชิก</span>
                  </Link>
                </div>
              )}

              {/* Sound Toggle Button */}
              <button
                onClick={handleSoundToggle}
                className="p-1.5 sm:p-2 rounded-full text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FFF0EB] border border-[#E8DCCF]/60 transition-colors flex-shrink-0"
                title={soundOn ? 'ปิดเสียงกดปุ่ม' : 'เปิดเสียงกดปุ่ม (ปุ๋มปุ๋ม)'}
                aria-label="สลับเสียงกดปุ่ม"
              >
                {soundOn ? (
                  <Volume2 className="w-4 h-4 text-[#D97706]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#BCAAA4]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* iOS-Style Floating Bottom Dock Navigation */}
      <nav
        aria-label="เมนูหลัก"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-white/95 backdrop-blur-md border border-[#E8DCCF] shadow-[0_8px_32px_rgba(93,64,55,0.14)] flex items-center gap-1 sm:gap-2 max-w-[96vw] overflow-x-auto"
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-[#FFB4A2] text-[#4E342E] shadow-xs scale-102'
                  : 'text-[#6D4C41] hover:text-[#5D4037] hover:bg-[#FFF8F3]'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#4E342E]' : 'text-[#8D6E63]'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
