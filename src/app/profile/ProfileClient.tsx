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
  Trophy,
  Wallet,
  TrendingUp,
  Sparkles,
  ShoppingBag,
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
          ตั้งค่าโปรไฟล์ตัวแทน
        </h1>
        <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
          ปรับแต่งชื่อ ช่องทางขาย และรูปภาพโปรไฟล์ของคุณ
        </p>
      </div>

      {/* Agent Motivation & Performance Dashboard */}
      {agentStats && (
        <div className="miki-card p-5 sm:p-6 bg-gradient-to-br from-[#FFFDFB] via-[#FFF6F3] to-[#FFF0EC] border-2 border-[#FFD9CE] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#FFD9CE]/70 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FFE4DC] text-[#D97706] flex items-center justify-center shadow-2xs">
                <Trophy className="w-5 h-5 text-[#D97706]" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-[#5D4037]">
                  ผลงานและความสำเร็จของตัวแทน
                </h3>
                <p className="text-[11px] text-[#8D6E63] font-medium">
                  ประจำเดือน{agentStats.monthName}
                </p>
              </div>
            </div>

            {/* Rank Badge */}
            {agentStats.monthlyRank ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#FFD9CE] shadow-2xs">
                <span className="text-base leading-none">
                  {agentStats.monthlyRank === 1 ? '🥇' : agentStats.monthlyRank === 2 ? '🥈' : agentStats.monthlyRank === 3 ? '🥉' : '🎖️'}
                </span>
                <span className="text-xs font-black text-[#5D4037]">
                  อันดับที่ {agentStats.monthlyRank}
                </span>
                <span className="text-[10px] text-[#8D6E63]">
                  / {agentStats.totalActiveAgents} คน
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-[#8D6E63] bg-white px-3 py-1 rounded-full border border-[#E8DCCF]">
                ยังไม่มีอันดับในเดือนนี้
              </span>
            )}
          </div>

          {/* Grid: Credit, Monthly Orders, Agent Ranking */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. เครดิตคงเหลือปัจจุบัน */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFD9CE] shadow-2xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-[#8D6E63] flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#E5989B]" /> เครดิตปัจจุบัน
              </span>
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#5D4037] tracking-tight block">
                  ฿{agentStats.creditBalance.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-[#2E7D32] font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-md inline-block mt-1 border border-[#C8E6C9]">
                  พร้อมกดซื้อของได้ทันที
                </span>
              </div>
              <Link
                href="/"
                className="text-[11px] font-bold text-[#E5989B] hover:text-[#D67D81] flex items-center gap-1 pt-1 border-t border-[#F5EBE1]"
              >
                <span>ไปหน้าหลัก / เติมเครดิต</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 2. ออเดอร์ที่ขายได้ในเดือนนี้ */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFD9CE] shadow-2xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-[#8D6E63] flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#3B82F6]" /> ขายได้ในเดือนนี้
              </span>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#3B82F6]">
                    {agentStats.monthlyOrdersCount}
                  </span>
                  <span className="text-xs font-bold text-[#8D6E63]">ออเดอร์</span>
                </div>
                <span className="text-[10px] font-medium text-[#8D6E63] block mt-1">
                  ยอดขายรวม ฿{agentStats.monthlySalesAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-[10px] text-[#3B82F6] font-bold bg-[#EFF6FF] px-2 py-0.5 rounded-md inline-block border border-[#BFDBFE]">
                {agentStats.monthlyOrdersCount >= 10 ? '🔥 ตัวแทนยอดขยัน' : '✨ เริ่มสะสมยอดขาย'}
              </span>
            </div>

            {/* 3. ลำดับที่ในตัวแทนด้วยกัน */}
            <div className="bg-white p-4 rounded-2xl border border-[#FFD9CE] shadow-2xs flex flex-col justify-between space-y-2">
              <span className="text-[11px] font-bold text-[#8D6E63] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" /> อันดับในตัวแทน
              </span>
              <div>
                {agentStats.monthlyRank ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-[#10B981]">
                        #{agentStats.monthlyRank}
                      </span>
                      <span className="text-xs font-bold text-[#8D6E63]">
                        จาก {agentStats.totalActiveAgents} คน
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#059669] block mt-1">
                      {agentStats.monthlyRank === 1
                        ? '👑 ท็อปเซลล์อันดับ 1 ของร้าน!'
                        : agentStats.monthlyRank <= 3
                        ? '🌟 ติดโผท็อป 3 สุดยอดตัวแทน!'
                        : '💪 กำลังไต่อันดับ สู้ๆ นะคะ!'}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-[#8D6E63] block">
                      ยังไม่มีอันดับ
                    </span>
                    <span className="text-[10px] text-[#8D6E63] block mt-1">
                      เปิดออเดอร์แรกเพื่อติดชาร์ต!
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#059669] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded-md inline-block border border-[#A7F3D0]">
                อัปเดตแบบเรียลไทม์
              </span>
            </div>
          </div>

          {/* Cheerful Motivation Message */}
          <div className="p-3.5 rounded-2xl bg-white/90 border border-[#FFD9CE] flex items-center gap-2.5 text-xs text-[#6D4C41]">
            <Sparkles className="w-4 h-4 text-[#D97706] flex-shrink-0" />
            <p className="font-medium leading-relaxed">
              {agentStats.monthlyOrdersCount > 0
                ? `ยินดีด้วยค่ะคุณ ${profileName || user.username}! เดือนนี้สร้างยอดขายไปแล้ว ${agentStats.monthlyOrdersCount} ออเดอร์ อยู่ในอันดับที่ ${agentStats.monthlyRank || 1} ของตัวแทน ขอให้ยอดปังๆ ยิ่งขึ้นไปอีกนะคะ 💕`
                : `สวัสดีค่ะคุณ ${profileName || user.username}! เริ่มต้นเดือนใหม่ด้วยการหาลูกค้าและเปิดออเดอร์กันเถอะ ทุกออเดอร์ช่วยดันอันดับตัวแทนให้สูงขึ้น สู้ๆ นะคะ 💖`}
            </p>
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="miki-card p-6 text-center space-y-3 bg-white border border-[#E8DCCF] shadow-xs">
        <span className="text-[11px] font-bold text-[#E5989B] uppercase tracking-wider block">
          พรีวิวโปรไฟล์ของคุณ (Live Preview)
        </span>

        <div className="flex justify-center py-2">
          <AvatarWithFrame
            src={avatarUrl || null}
            alt={profileName || user.username}
            size="xl"
          />
        </div>

        <div>
          <h2 className="text-lg font-black text-[#5D4037]">
            {profileName || 'ชื่อตัวแทนของคุณ'}
          </h2>
          <p className="text-xs font-bold text-[#FFB4A2] font-mono">
            @{user.username} • {user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ตัวแทนจำหน่าย'}
          </p>
          {salesChannel && (
            <p className="text-xs text-[#6D4C41] font-medium mt-1">
              ช่องทางขาย: {salesChannel}
            </p>
          )}
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
                  className="w-6 h-6 rounded-full overflow-hidden border border-[#FFD9CE] hover:scale-110 transition-transform"
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
                ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
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
          className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
        </button>
      </form>
    </div>
  );
}
