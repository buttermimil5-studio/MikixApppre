'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/lib/actions/authActions';
import { AvatarWithFrame } from '@/components/AvatarWithFrame';
import { RegisterCatModal } from '@/components/RegisterCatModal';
import { Sparkles, Key, User as UserIcon, Share2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileName, setProfileName] = useState('');
  const [salesChannel, setSalesChannel] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setRegisteredName(profileName.trim() || username.trim());
    setIsSuccess(false);
    setShowModal(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('profileName', profileName);
    formData.append('salesChannel', salesChannel);

    const res = await registerAction(formData);
    setLoading(false);

    if (res.success) {
      if (res.user?.profileName) {
        setRegisteredName(res.user.profileName);
      }
      setIsSuccess(true);
    } else {
      setShowModal(false);
      setError(res.error || 'สมัครสมาชิกไม่สำเร็จ');
    }
  };

  const handleProceed = () => {
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Cat Modal for Loading & Success */}
      <RegisterCatModal
        isOpen={showModal}
        isSuccess={isSuccess}
        memberName={registeredName}
        onProceed={handleProceed}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3 text-center">
        <Link href="/" className="inline-block">
          <AvatarWithFrame size="lg" />
        </Link>
        <div>
          <h2 className="text-2xl font-black text-[#5D4037]">
            สมัครสมาชิกตัวแทนจำหน่าย
          </h2>
          <p className="text-xs text-[#8D6E63] font-medium mt-1">
            สมัครตัวแทนวันนี้ รับสิทธิ์ซื้อแอปพรีเมียมราคาส่งทันที จัดส่งอัตโนมัติ 24 ชม.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="miki-card p-6 sm:p-8 bg-white border border-[#E8DCCF] shadow-[0_8px_30px_rgba(255,182,193,0.2)] space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-[#FFB4A2]" /> ชื่อผู้ใช้ (Username) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full miki-input text-xs font-bold"
                placeholder="ภาษาอังกฤษหรือตัวเลข (3 ตัวขึ้นไป)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-[#FFB4A2]" /> รหัสผ่าน (Password) *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full miki-input text-xs font-bold"
                placeholder="รหัสผ่าน 6 ตัวขึ้นไป"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-[#FFB4A2]" /> ชื่อที่แสดงในโปรไฟล์
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full miki-input text-xs font-bold"
                placeholder="เช่น ตัวแทนแอปพรี น้องมิคิ"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-[#FFB4A2]" /> ช่องทางการขาย (ถ้ามี)
              </label>
              <input
                type="text"
                value={salesChannel}
                onChange={(e) => setSalesChannel(e.target.value)}
                className="w-full miki-input text-xs font-medium"
                placeholder="เช่น IG: @app.premium, LINE: @agent01"
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
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'กำลังลงทะเบียน...' : 'ยืนยันการสมัครสมาชิก'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-[#8D6E63]">มีบัญชีสมาชิกอยู่แล้ว? </span>
            <Link
              href="/login"
              className="text-xs font-bold text-[#FFB4A2] hover:underline"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>

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
