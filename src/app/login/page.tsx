'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/actions/authActions';
import { AvatarWithFrame } from '@/components/AvatarWithFrame';
import { LogIn, Key, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res = await loginAction(formData);
    setLoading(false);

    if (res.success) {
      router.push(redirectUrl);
      router.refresh();
    } else {
      setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="miki-card p-6 sm:p-8 bg-white border border-[#E8DCCF] shadow-[0_8px_30px_rgba(255,182,193,0.2)] space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5 text-[#FFB4A2]" /> ชื่อผู้ใช้ (Username)
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full miki-input text-xs font-bold"
            placeholder="ระบุชื่อผู้ใช้..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-[#FFB4A2]" /> รหัสผ่าน (Password)
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full miki-input text-xs font-bold"
            placeholder="ระบุรหัสผ่าน..."
          />
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] flex items-center gap-2 text-xs text-[#E11D48] font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
        </button>
      </form>

      {/* Quick Test Logins */}
      <div className="pt-4 border-t border-[#E8DCCF] space-y-2">
        <span className="text-[11px] font-bold text-[#8D6E63] block text-center">
          บัญชีทดสอบระบบ (คลิกเดียวเข้าสู่ระบบ):
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('agent_miki', 'miki123')}
            className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#FFD9CE] text-[11px] text-center font-bold text-[#E5989B] hover:bg-[#FFEFE8] transition-colors"
          >
            ตัวแทน: agent_miki (มี 500฿)
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'mikiadmin123')}
            className="p-2.5 rounded-xl bg-[#FFF8F3] border border-[#FFCDB2] text-[11px] text-center font-bold text-[#5D4037] hover:bg-[#FFEFE8] transition-colors"
          >
            แอดมิน: admin (Master)
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <span className="text-xs text-[#8D6E63]">ยังไม่มีบัญชีสมาชิก? </span>
        <Link
          href="/register"
          className="text-xs font-bold text-[#FFB4A2] hover:underline"
        >
          สมัครสมาชิกที่นี่
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link href="/" className="inline-block">
          <AvatarWithFrame size="lg" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#5D4037]">
            เข้าสู่ระบบตัวแทน / ลูกค้า
          </h2>
          <p className="text-xs text-[#8D6E63] font-medium mt-1">
            เข้าสู่ระบบเพื่อกดรับบัญชีแอปพรีเมียมและเติมเครดิต
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<div className="p-8 text-center text-xs text-[#8D6E63]">กำลังโหลด...</div>}>
          <LoginForm />
        </Suspense>

        <div className="text-center mt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#8D6E63] hover:text-[#5D4037]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
