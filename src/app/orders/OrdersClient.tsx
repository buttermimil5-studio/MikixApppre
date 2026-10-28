'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { requestOtpAction } from '@/lib/actions/purchaseActions';
import {
  Clock,
  Key,
  Mail,
  Copy,
  Check,
  MessageCircle,
  UserCheck,
  ShieldAlert,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Monitor,
} from 'lucide-react';

interface OrdersClientProps {
  orders: any[];
}

export function OrdersClient({ orders }: OrdersClientProps) {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedGuides, setExpandedGuides] = useState<{ [id: string]: boolean }>({});
  const [otpLoadingId, setOtpLoadingId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCustomerCard = (order: any) => {
    const text = [
      `[ ข้อมูลเข้าใช้งานแอปพรีเมียม - ${order.productName} ]`,
      order.orderNumber ? `เลขออเดอร์: ${order.orderNumber}` : '',
      `อีเมล: ${order.email}`,
      `รหัสผ่าน: ${order.password}`,
      `จอ / โปรไฟล์ที่ได้รับ: ${order.slotName}`,
      order.slotPin ? `รหัส PIN ประจำจอ: ${order.slotPin}` : 'รหัส PIN: ไม่ต้องใช้ PIN (เข้าใช้งานได้ทันที)',
      order.expiresAt ? `วันหมดอายุ: ${new Date(order.expiresAt).toLocaleString('th-TH')}` : '',
      '',
      `[ กฎและข้อกำหนดการใช้งาน ]`,
      order.rules || 'ไม่มีกฎเพิ่มเติม',
      '',
      `[ วิธีเข้าใช้งาน ]`,
      order.usageGuide || 'ล็อกอินเข้าใช้งานตามข้อมูลด้านบน',
    ]
      .filter((line) => line !== '')
      .join('\n');

    handleCopy(text, `${order.id}-customer-card`);
  };

  const toggleGuide = (orderId: string) => {
    setExpandedGuides((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleRequestOtp = async (orderId: string) => {
    setOtpLoadingId(orderId);
    const res = await requestOtpAction(orderId);
    setOtpLoadingId(null);

    if (res.success) {
      if (res.lineUrl) {
        window.open(res.lineUrl, '_blank');
      }
    } else {
      alert(res.error || 'ไม่สามารถขอ OTP ได้');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') return o.status === 'ACTIVE';
    if (filter === 'EXPIRED') return o.status === 'EXPIRED';
    return true;
  });

  const getRemainingTimeText = (expiresAtStr: string, status: string) => {
    if (status === 'EXPIRED') return 'หมดอายุแล้ว';

    const now = new Date().getTime();
    const expiry = new Date(expiresAtStr).getTime();
    const diff = expiry - now;

    if (diff <= 0) return 'หมดอายุแล้ว';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `เหลืออีก ${days} วัน ${hours} ชม.`;
    return `เหลืออีก ${hours} ชม. ${minutes} นาที`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#5D4037]">
            ประวัติการซื้อและบัญชีของคุณ
          </h1>
          <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
            ดูข้อมูลอีเมล รหัสผ่าน โปรไฟล์ที่ได้รับ และกดขอรหัส OTP สำหรับแอปที่ต้องใช้
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-[#FFB4A2] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DCCF]'
            }`}
          >
            ทั้งหมด ({orders.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-[#FFB4A2] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DCCF]'
            }`}
          >
            กำลังใช้งาน ({orders.filter((o) => o.status === 'ACTIVE').length})
          </button>
          <button
            onClick={() => setFilter('EXPIRED')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'EXPIRED'
                ? 'bg-[#FFB4A2] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DCCF]'
            }`}
          >
            หมดอายุ ({orders.filter((o) => o.status === 'EXPIRED').length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isActive = order.status === 'ACTIVE';
            const remaining = getRemainingTimeText(order.expiresAt, order.status);
            const isGuideOpen = !!expandedGuides[order.id];

            return (
              <div
                key={order.id}
                className={`miki-card p-5 sm:p-6 bg-white space-y-4 transition-all ${
                  isActive ? 'border-[#FFD9CE]' : 'border-[#E8DCCF] opacity-80'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCCF] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E8DCCF] bg-[#FFF5F7] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.imageUrl}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm sm:text-base text-[#5D4037]">
                        {order.productName}
                      </h2>
                      <p className="text-xs text-[#8D6E63] font-mono">
                        ออเดอร์: {order.orderNumber} • ซื้อเมื่อ:{' '}
                        {new Date(order.purchasedAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>

                  {/* Status & Expiry Badge */}
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                        <Clock className="w-3.5 h-3.5" />
                        {remaining}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                        หมดอายุแล้ว
                      </span>
                    )}
                  </div>
                </div>

                {/* Account Credentials Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF8] border border-[#FFD9CE] space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5D4037] border-b border-[#F5EBE1] pb-2">
                    <span className="flex items-center gap-1.5 font-extrabold">
                      <Key className="w-4 h-4 text-[#E5989B]" />
                      ข้อมูลบัญชีที่ได้รับ
                    </span>
                    <span className="text-[11px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#C8E6C9]">
                      พร้อมใช้งาน
                    </span>
                  </div>

                  {/* Highlighted Screen & PIN Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF5F2] to-[#FFF9F5] border border-[#FFD9CE] space-y-2.5">
                    {/* Screen Name */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#E5989B] shadow-2xs">
                          <Monitor className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8D6E63] font-bold block">จอ / โปรไฟล์ที่ได้รับ:</span>
                          <span className="text-sm font-extrabold text-[#5D4037]">{order.slotName}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.slotName, `${order.id}-slot`)}
                        className="px-2.5 py-1 rounded-xl bg-white border border-[#FFD9CE] text-[11px] font-bold text-[#E5989B] hover:bg-[#FFF0EB] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                        title="คัดลอกชื่อจอ"
                      >
                        {copiedId === `${order.id}-slot` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === `${order.id}-slot` ? 'คัดลอกแล้ว' : 'คัดลอกชื่อจอ'}</span>
                      </button>
                    </div>

                    {/* PIN Display */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#FFD9CE]/60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#D97706] shadow-2xs">
                          <Key className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8D6E63] font-bold block">รหัส PIN หน้าจอ:</span>
                          {order.slotPin ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-sm font-mono font-black text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-md border border-[#FDE68A] tracking-wider">
                                {order.slotPin}
                              </span>
                              <span className="text-[10px] text-[#B45309] font-medium">(PIN เข้าโปรไฟล์)</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-[#059669]">
                              ไม่ต้องใช้ PIN (กดเข้าโปรไฟล์ได้ทันที)
                            </span>
                          )}
                        </div>
                      </div>
                      {order.slotPin && (
                        <button
                          type="button"
                          onClick={() => handleCopy(order.slotPin, `${order.id}-pin`)}
                          className="px-2.5 py-1 rounded-xl bg-white border border-[#FFD9CE] text-[11px] font-bold text-[#B45309] hover:bg-[#FEF3C7] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                          title="คัดลอก PIN"
                        >
                          {copiedId === `${order.id}-pin` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === `${order.id}-pin` ? 'คัดลอกแล้ว' : 'คัดลอก PIN'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Email */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#8D6E63] flex items-center gap-1">
                        <Mail className="w-3 h-3" /> อีเมล:
                      </span>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#FFD9CE] text-xs font-mono font-bold text-[#5D4037]">
                        <span className="truncate">{order.email}</span>
                        {isActive && (
                          <button
                            onClick={() => handleCopy(order.email, `${order.id}-email`)}
                            className="ml-2 p-1 rounded-lg hover:bg-[#FFF8F3] text-[#E5989B]"
                            title="คัดลอกอีเมล"
                          >
                            {copiedId === `${order.id}-email` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-[#8D6E63] flex items-center gap-1">
                        <Key className="w-3 h-3" /> รหัสผ่าน:
                      </span>
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#FFD9CE] text-xs font-mono font-bold text-[#5D4037]">
                        <span className="truncate">{order.password}</span>
                        {isActive && (
                          <button
                            onClick={() => handleCopy(order.password, `${order.id}-pass`)}
                            className="ml-2 p-1 rounded-lg hover:bg-[#FFF8F3] text-[#E5989B]"
                            title="คัดลอกรหัสผ่าน"
                          >
                            {copiedId === `${order.id}-pass` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#FFD9CE]/60">
                    <div className="text-[11px] text-[#8D6E63]">
                      หมดอายุในวันที่:{' '}
                      <span className="font-bold text-[#5D4037]">
                        {new Date(order.expiresAt).toLocaleString('th-TH')}
                      </span>
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => handleCopyCustomerCard(order)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] active:scale-95 transition-all shadow-xs"
                      >
                        {copiedId === `${order.id}-customer-card` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">คัดลอกข้อมูลส่งลูกค้าแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกข้อมูลส่งลูกค้า (One-Click Copy)</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions: Request OTP button & Guide Toggle */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  {order.otpEnabled && isActive ? (
                    <button
                      onClick={() => handleRequestOtp(order.id)}
                      disabled={otpLoadingId === order.id}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>
                        {otpLoadingId === order.id
                          ? 'กำลังส่งคำขอ...'
                          : 'ขอ OTP ผ่าน LINE Official Account'}
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-[#8D6E63] font-medium">
                      {!order.otpEnabled ? 'สินค้านี้ไม่ต้องขอ OTP' : 'หมดอายุแล้ว'}
                    </span>
                  )}

                  <button
                    onClick={() => toggleGuide(order.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#6D4C41] hover:text-[#FFB4A2] transition-colors"
                  >
                    <span>{isGuideOpen ? 'ซ่อนคู่มือและกฎ' : 'ดูกฎและวิธีใช้งาน'}</span>
                    {isGuideOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Collapsible Rules & Usage Guide */}
                {isGuideOpen && (
                  <div className="p-4 rounded-2xl bg-[#FFFDFD] border border-[#E8DCCF] space-y-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-[#E11D48] flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          กฎระเบียบการใช้งาน:
                        </p>
                        {order.rules && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.rules, `${order.id}-rules`)}
                            className="flex items-center gap-1 text-[11px] text-[#8D6E63] hover:text-[#5D4037] px-2 py-0.5 rounded-md hover:bg-[#FFF8F3] transition-colors"
                          >
                            {copiedId === `${order.id}-rules` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === `${order.id}-rules` ? 'คัดลอกแล้ว' : 'คัดลอกกฎ'}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[#6D4C41] whitespace-pre-line leading-relaxed font-medium pl-5">
                        {order.rules || 'ไม่มีข้อกำหนดเพิ่มเติม'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-[#5D4037] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#FFB4A2]" />
                          วิธีเข้าใช้งาน:
                        </p>
                        {order.usageGuide && (
                          <button
                            type="button"
                            onClick={() => handleCopy(order.usageGuide, `${order.id}-guide`)}
                            className="flex items-center gap-1 text-[11px] text-[#8D6E63] hover:text-[#5D4037] px-2 py-0.5 rounded-md hover:bg-[#FFF8F3] transition-colors"
                          >
                            {copiedId === `${order.id}-guide` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === `${order.id}-guide` ? 'คัดลอกแล้ว' : 'คัดลอกวิธีใช้'}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[#6D4C41] whitespace-pre-line leading-relaxed font-medium pl-5">
                        {order.usageGuide || 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ได้รับ'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 miki-card bg-white p-8 space-y-3 border border-[#E8DCCF]">
          <div className="w-12 h-12 rounded-full bg-[#FFF8F3] text-[#FFB4A2] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <p className="font-bold text-[#5D4037]">ยังไม่มีประวัติการซื้อในหมวดหมู่นี้</p>
          <p className="text-xs text-[#8D6E63]">คุณสามารถเลือกดูและกดซื้อแอปพรีเมียมได้ที่หน้าร้าน</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] mt-2 shadow-xs"
          >
            ไปที่หน้าร้าน
          </Link>
        </div>
      )}
    </div>
  );
}
