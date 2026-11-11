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

      {/* Unified Profile & Achievements Card */}
      <div className="miki-card p-6 sm:p-7 bg-white border border-[#E8DCCF] rounded-[2rem] shadow-xs space-y-6">
        {/* Profile Details (Top) */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Speech Bubble above avatar */}
          <div className="relative inline-flex items-center gap-1.5 bg-[#FFF8F3] px-4 py-1.5 rounded-full border border-[#FFD9CE] text-xs text-[#8D6E63] font-medium shadow-2xs mb-1">
            <span className="font-bold text-[#E5989B]">...</span>
            <span>
              {agentStats?.monthlyOrdersCount
                ? `เดือนนี้สร้างยอดขายไปแล้ว ${agentStats.monthlyOrdersCount} ออเดอร์`
                : 'พร้อมรับออเดอร์และสร้างยอดขายแล้วค่ะ'}
            </span>
            {/* Bubble Tail pointing down towards avatar */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFF8F3] border-r border-b border-[#FFD9CE] rotate-45" />
          </div>

          {/* Avatar */}
          <div className="py-1">
            <AvatarWithFrame
              src={avatarUrl || null}
              alt={profileName || user.username}
              size="xl"
            />
          </div>

          {/* User Details */}
          <div>
            <h2 className="text-xl font-black text-[#5D4037]">
              {profileName || 'ชื่อตัวแทนของคุณ'}
            </h2>
            <p className="text-xs font-bold text-[#8D6E63] font-mono mt-0.5">
              @{user.username} • {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ตัวแทนจำหน่าย'}
            </p>
            {salesChannel && (
              <p className="text-xs text-[#8D6E63] font-medium mt-1">
                ช่องทางขาย: {salesChannel}
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F5EBE1]" />

        {/* Achievements Section (Bottom) */}
        {agentStats && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#5D4037]">
                  Achievements
                </h3>
                <p className="text-xs text-[#8D6E63] font-medium">
                  {agentStats.monthName}
                </p>
              </div>

              {agentStats.monthlyRank ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8F3] text-[#5D4037] border border-[#FFD9CE]">
                  อันดับที่ {agentStats.monthlyRank} / {agentStats.totalActiveAgents} คน
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8F3] text-[#8D6E63] border border-[#E8DCCF]">
                  ยังไม่มีอันดับ
                </span>
              )}
            </div>

            {/* 3 Stats Grid (Themed Bakery Colors: #5D4037, #8D6E63, #E5989B) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* เครดิตปัจจุบัน */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FFD9CE] space-y-2">
                <span className="text-xs font-bold text-[#8D6E63] block">
                  เครดิตปัจจุบัน
                </span>
                <span className="text-2xl font-black text-[#5D4037] tracking-tight block">
                  ฿{agentStats.creditBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <Link
                  href="/"
                  className="text-[11px] font-bold text-[#E5989B] hover:text-[#D67D81] flex items-center gap-1 pt-1 border-t border-[#F5EBE1]"
                >
                  <span>ไปหน้าหลัก / เติมเงิน</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* ยอดขายเดือนนี้ */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FFD9CE] space-y-2">
                <span className="text-xs font-bold text-[#8D6E63] block">
                  ขายได้ในเดือนนี้
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#5D4037]">
                    {agentStats.monthlyOrdersCount}
                  </span>
                  <span className="text-xs font-bold text-[#8D6E63]">ออเดอร์</span>
                </div>
                <span className="text-[11px] text-[#8D6E63] block pt-1 border-t border-[#F5EBE1]">
                  ยอดซื้อรวม ฿{agentStats.monthlySalesAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* อันดับในตัวแทน */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#FFD9CE] space-y-2">
                <span className="text-xs font-bold text-[#8D6E63] block">
                  อันดับในตัวแทน
                </span>
                {agentStats.monthlyRank ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-[#5D4037]">
                      #{agentStats.monthlyRank}
                    </span>
                    <span className="text-xs font-bold text-[#8D6E63]">
                      จาก {agentStats.totalActiveAgents} คน
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-[#8D6E63] block">
                    ยังไม่มีอันดับ
                  </span>
                )}
                <span className="text-[11px] text-[#8D6E63] block pt-1 border-t border-[#F5EBE1]">
                  {agentStats.monthlyRank ? 'อันดับประจำเดือนนี้' : 'เปิดออเดอร์แรกเพื่อจัดอันดับ'}
                </span>
              </div>
            </div>
          </div>
        )}
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
