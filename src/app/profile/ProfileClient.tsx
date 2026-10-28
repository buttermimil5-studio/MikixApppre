'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface ProfileClientProps {
  user: any;
}

export function ProfileClient({ user }: ProfileClientProps) {
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
