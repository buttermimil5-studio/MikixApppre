'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AvatarWithFrame } from '@/components/AvatarWithFrame';
import { updateProfileAction } from '@/lib/actions/authActions';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
} from 'lucide-react';

interface AgentStats {
  creditBalance: number;
  totalOrdersCount?: number;
  monthlyOrdersCount: number;
  monthlySalesAmount: number;
  monthlyRank: number | null;
  totalActiveAgents: number;
  monthName: string;
}

interface ProfileClientProps {
  user: any;
  agentStats?: AgentStats;
}

export function ProfileClient({ user, agentStats }: ProfileClientProps) {
  const router = useRouter();
  const [profileName, setProfileName] = useState(user.profileName || '');
  const [salesChannel, setSalesChannel] = useState(user.salesChannel || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const res = await updateProfileAction({
      profileName,
      salesChannel,
      frameTheme: 'DEFAULT',
      frameAccessory: 'NONE',
      avatarUrl: avatarUrl.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: res.error || 'เกิดข้อผิดพลาดในการบันทึก' });
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#5D4037]">
          My profile
        </h1>
        <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
          จัดการข้อมูลส่วนตัวและสถิติการขายของคุณ
        </p>
      </div>

      {/* Unified Profile & Achievements Card (Avatar on Left, Speech Bubble on Right) */}
      <div className="miki-card p-6 sm:p-7 bg-white border border-[#E8DCCF] rounded-[2rem] shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          {/* Avatar & Profile Info (Left) */}
          <div className="flex flex-col items-center text-center flex-shrink-0 sm:w-44">
            <AvatarWithFrame
              src={avatarUrl || null}
              alt={profileName || user.username}
              size="xl"
            />
            <h2 className="text-base sm:text-lg font-black text-[#5D4037] mt-2">
              {profileName || 'ชื่อตัวแทนของคุณ'}
            </h2>
            <p className="text-xs font-bold text-[#8D6E63] font-mono mt-0.5">
              @{user.username} • {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ตัวแทนจำหน่าย'}
            </p>
            {salesChannel && (
              <p className="text-[11px] text-[#8D6E63] font-medium mt-1">
                ช่องทาง: {salesChannel}
              </p>
            )}
          </div>

          {/* Animated Speech Bubble (Right) - Exactly like StoreHero & Picture */}
          <div className="flex-1 w-full">
            <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#FFD9CE] shadow-[0_4px_20px_rgba(255,180,162,0.12)]">
              {/* Speech bubble tail pointer pointing to avatar on left */}
              <div className="hidden sm:block absolute -left-2.5 top-8 w-3 h-3 bg-white border-l border-b border-[#FFD9CE] rotate-45 transform" />
              {/* Mobile tail pointing up to avatar */}
              <div className="sm:hidden absolute -top-1.5 left-8 w-3 h-3 bg-white border-l border-t border-[#FFD9CE] rotate-45 transform" />

              {/* Speech Bubble Header */}
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F5EBE1]">
                <span className="text-[11px] font-bold text-[#E5989B] tracking-wide">
                  Achievements ({agentStats?.monthName || 'ประจำเดือน'})
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5989B]" />
              </div>

              {/* 3 Items: 1. อันดับ 2. ออเดอร์ 3. เครดิต */}
              <div className="space-y-2.5 text-xs sm:text-sm font-medium text-[#6D4C41]">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#5D4037]">1. อันดับ:</span>
                  <span className="font-bold text-[#5D4037]">
                    {agentStats?.monthlyRank
                      ? `อันดับที่ ${agentStats.monthlyRank} (จาก ${agentStats.totalActiveAgents} คน)`
                      : 'ยังไม่มีอันดับในเดือนนี้'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#5D4037]">2. ออเดอร์:</span>
                  <div className="text-right">
                    <span className="font-bold text-[#5D4037]">
                      ทั้งหมด {agentStats?.totalOrdersCount ?? 0} รายการ
                    </span>
                    <span className="block text-[11px] text-[#8D6E63] font-normal">
                      (เดือนนี้ {agentStats?.monthlyOrdersCount || 0} รายการ)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#F5EBE1]">
                  <span className="font-bold text-[#5D4037]">3. เครดิต:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#5D4037]">
                      ฿{(agentStats?.creditBalance || 0).toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <Link
                      href="/"
                      className="text-[11px] font-bold text-[#E5989B] hover:text-[#D67D81] underline flex items-center gap-0.5"
                    >
                      <span>ไปหน้าเติมเงิน</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="miki-card p-6 space-y-6 bg-white border border-[#E8DCCF]">
        {/* Basic Info Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5 text-[#FFB4A2]" /> ชื่อโปรไฟล์ที่แสดง
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full miki-input text-xs font-bold"
              placeholder="เช่น ตัวแทนมิคิจัง"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-[#FFB4A2]" /> ช่องทางขายของคุณ (สำหรับตัวแทน)
            </label>
            <input
              type="text"
              value={salesChannel}
              onChange={(e) => setSalesChannel(e.target.value)}
              className="w-full miki-input text-xs font-medium"
              placeholder="เช่น IG: @miki.store | LINE: @agent01"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5D4037] flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-[#FFB4A2]" /> ลิงก์รูปโปรไฟล์ (URL)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full miki-input text-xs font-medium"
              placeholder="https://example.com/avatar.jpg"
            />

            {/* Quick avatar samples */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[10px] text-[#8D6E63] font-medium">รูปตัวอย่าง:</span>
              {sampleAvatars.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className="w-6 h-6 rounded-full overflow-hidden border border-[#FFD9CE] hover:scale-110 transition-transform cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Sample ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]'
                : 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
        </button>
      </form>
    </div>
  );
}
