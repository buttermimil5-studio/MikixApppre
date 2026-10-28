'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { purchaseProductAction, requestOtpAction, PurchaseResult } from '@/lib/actions/purchaseActions';
import {
  X,
  Clock,
  ShieldAlert,
  BookOpen,
  Copy,
  Check,
  MessageCircle,
  Key,
  Mail,
  UserCheck,
  Wallet,
  AlertCircle,
} from 'lucide-react';

interface ProductModalProps {
  product: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (newBalance: number) => void;
}

export function ProductModal({
  product,
  user,
  isOpen,
  onClose,
  onPurchaseSuccess,
}: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<PurchaseResult['order'] | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyCustomerCard = (data: {
    productName: string;
    orderNumber?: string;
    email: string;
    password: string;
    slotName: string;
    slotPin?: string | null;
    expiresAt?: string;
    rules?: string;
    usageGuide?: string;
  }) => {
    const text = [
      `[ ข้อมูลบัญชีแอปพรีเมียม - ${data.productName} ]`,
      data.orderNumber ? `เลขออเดอร์: ${data.orderNumber}` : '',
      `อีเมล: ${data.email}`,
      `รหัสผ่าน: ${data.password}`,
      `จอ/โปรไฟล์: ${data.slotName}`,
      data.slotPin ? `PIN: ${data.slotPin}` : '',
      data.expiresAt ? `หมดอายุ: ${new Date(data.expiresAt).toLocaleDateString('th-TH')}` : '',
      '',
      `[ กฎและข้อกำหนดการใช้งาน ]`,
      data.rules || 'ไม่มีกฎเพิ่มเติม',
      '',
      `[ วิธีเข้าใช้งาน ]`,
      data.usageGuide || 'ล็อกอินเข้าใช้งานตามข้อมูลด้านบน',
    ]
      .filter((line) => line !== '')
      .join('\n');

    handleCopy(text, 'customer-all');
  };

  const handlePurchase = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError(null);

    const res = await purchaseProductAction(product.id);
    setLoading(false);

    if (res.success && res.order) {
      setOrderResult(res.order);
      if (res.remainingBalance !== undefined && onPurchaseSuccess) {
        onPurchaseSuccess(res.remainingBalance);
      }
    } else {
      setError(res.error || 'การสั่งซื้อไม่สำเร็จ');
    }
  };

  const handleRequestOtp = async (orderId: string) => {
    setOtpLoading(true);
    setOtpMessage(null);
    const res = await requestOtpAction(orderId);
    setOtpLoading(false);

    if (res.success) {
      setOtpMessage(res.message || 'ส่งคำขอแล้ว');
      if (res.lineUrl) {
        window.open(res.lineUrl, '_blank');
      }
    } else {
      alert(res.error || 'ไม่สามารถขอ OTP ได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
              {product.category?.name || 'แอปพรีเมียม'}
            </span>
            <span className="text-xs font-bold text-[#8D6E63] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FFB4A2]" />
              {product.durationDays} วัน
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* If Purchase Succeeded: Instant Credentials Reveal */}
          {orderResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-center space-y-1">
                <p className="font-extrabold text-[#2E7D32] text-base">สั่งซื้อสำเร็จแล้ว!</p>
                <p className="text-xs text-[#2E7D32]/80 font-medium">
                  เลขออเดอร์: {orderResult.orderNumber}
                </p>
              </div>

              {/* Account Credentials Vault Card (Styled like a warm bakery slip) */}
              <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-dashed border-[#FFD9CE] space-y-3">
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-2">
                  <span className="text-xs font-extrabold text-[#5D4037] flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#E5989B]" />
                    ข้อมูลเข้าใช้งานของคุณ (森のチケット)
                  </span>
                  <span className="text-[11px] font-bold text-[#E5989B]">
                    {orderResult.slotName}
                  </span>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <span className="text-xs text-[#8D6E63] font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    อีเมล:
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8DCCF] text-xs font-mono font-bold text-[#5D4037]">
                    <span className="truncate select-all">{orderResult.email}</span>
                    <button
                      onClick={() => handleCopy(orderResult.email, 'email')}
                      className="ml-2 p-1 rounded-lg hover:bg-[#FFF0EB] text-[#E5989B]"
                      title="คัดลอกอีเมล"
                    >
                      {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <span className="text-xs text-[#8D6E63] font-medium flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" />
                    รหัสผ่าน:
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8DCCF] text-xs font-mono font-bold text-[#5D4037]">
                    <span className="truncate select-all">{orderResult.password}</span>
                    <button
                      onClick={() => handleCopy(orderResult.password, 'password')}
                      className="ml-2 p-1 rounded-lg hover:bg-[#FFF0EB] text-[#E5989B]"
                      title="คัดลอกรหัสผ่าน"
                    >
                      {copiedField === 'password' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Profile Slot & PIN if exists */}
                {orderResult.slotPin && (
                  <div className="space-y-1">
                    <span className="text-xs text-[#8D6E63] font-medium flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      รหัส PIN ประจำโปรไฟล์:
                    </span>
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E8DCCF] text-xs font-mono font-bold text-[#5D4037]">
                      <span>{orderResult.slotPin}</span>
                      <button
                        onClick={() => handleCopy(orderResult.slotPin!, 'pin')}
                        className="ml-2 p-1 rounded-lg hover:bg-[#FFF0EB] text-[#E5989B]"
                      >
                        {copiedField === 'pin' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Expiry Timestamp */}
                <div className="pt-1 text-[11px] text-[#8D6E63] text-center font-medium">
                  หมดอายุในวันที่:{' '}
                  <span className="font-bold text-[#5D4037]">
                    {new Date(orderResult.expiresAt).toLocaleString('th-TH')}
                  </span>
                </div>

                {/* One-Click Copy All for Customer */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyCustomerCard({
                        productName: orderResult.productName,
                        orderNumber: orderResult.orderNumber,
                        email: orderResult.email,
                        password: orderResult.password,
                        slotName: orderResult.slotName,
                        slotPin: orderResult.slotPin,
                        expiresAt: orderResult.expiresAt,
                        rules: orderResult.rules || product.rules,
                        usageGuide: orderResult.usageGuide || product.usageGuide,
                      })
                    }
                    className="w-full py-2.5 px-4 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    {copiedField === 'customer-all' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">คัดลอกข้อมูลทั้งหมดส่งลูกค้าแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>คัดลอกข้อมูลทั้งหมดส่งลูกค้า (One-Click Copy)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* OTP Request Button if supported */}
              {orderResult.otpEnabled && (
                <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      ระบบขอ OTP อัตโนมัติ
                    </span>
                  </div>
                  <p className="text-xs text-[#3B82F6]">
                    หากแอปต้องการรหัสยืนยัน OTP สามารถกดปุ่มนี้เพื่อเปิด LINE Official Account และรับ OTP ได้ทันที
                  </p>
                  <button
                    onClick={() => handleRequestOtp(orderResult.id)}
                    disabled={otpLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold bg-[#10B981] text-white hover:bg-[#059669] shadow-xs active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{otpLoading ? 'กำลังส่งคำขอ...' : 'ขอ OTP ผ่าน LINE Official Account'}</span>
                  </button>
                  {otpMessage && <p className="text-xs text-center text-[#059669] font-bold">{otpMessage}</p>}
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href="/orders"
                  className="w-full py-3 rounded-full text-center text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 transition-all shadow-xs"
                >
                  ดูรายการในประวัติการซื้อ
                </Link>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-full text-center text-xs font-bold bg-white text-[#5D4037] border border-[#E8DCCF] hover:bg-[#FFF8F3] active:scale-95 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : (
            /* Product Details & Purchase Trigger View */
            <>
              {/* Product Info Header */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#E8DCCF] flex-shrink-0 bg-[#FFF8F3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-[#5D4037] leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-[#E5989B]">
                      {product.price.toLocaleString()} ฿
                    </span>
                    <span className="text-xs text-[#8D6E63] font-medium">
                      / {product.durationDays} วัน
                    </span>
                  </div>
                </div>
              </div>

              {/* Available Stock Indicator */}
              <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-between text-xs font-bold">
                <span className="text-[#6D4C41]">สถานะสต็อกปัจจุบัน:</span>
                {product.availableSlotsCount > 0 ? (
                  <span className="text-[#2E7D32] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
                    พร้อมส่ง {product.availableSlotsCount} สิทธิ์
                  </span>
                ) : (
                  <span className="text-[#D84315] bg-[#FFF0EB] px-3 py-1 rounded-full border border-[#FFCCBC]">
                    สินค้าหมดชั่วคราว
                  </span>
                )}
              </div>

              {/* OTP Support Badge */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#E8DCCF] flex items-center gap-2 text-xs">
                <MessageCircle className="w-4 h-4 text-[#FFB4A2] flex-shrink-0" />
                <span className="text-[#8D6E63] font-medium">
                  {product.otpEnabled
                    ? 'สินค้านี้รองรับการขอรหัส OTP ผ่าน LINE Official Account'
                    : 'เข้าใช้งานได้ทันที ไม่จำเป็นต้องขอ OTP'}
                </span>
              </div>

              {/* Rules */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#D84315]">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>กฎและข้อกำหนดการใช้งาน</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(product.rules, 'rules')}
                    className="flex items-center gap-1 text-[11px] text-[#8D6E63] hover:text-[#5D4037] px-2 py-0.5 rounded-md hover:bg-[#FFF8F3] transition-colors"
                  >
                    {copiedField === 'rules' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedField === 'rules' ? 'คัดลอกแล้ว' : 'คัดลอกกฎ'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-[#FFF0EB]/50 rounded-2xl border border-[#FFD9CE] text-xs text-[#6D4C41] whitespace-pre-line leading-relaxed font-medium">
                  {product.rules || 'ไม่มีกฎระเบียบเพิ่มเติม'}
                </div>
              </div>

              {/* Usage Guide */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#5D4037]">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#E5989B]" />
                    <span>คู่มือและวิธีเข้าใช้งาน</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(product.usageGuide, 'guide')}
                    className="flex items-center gap-1 text-[11px] text-[#8D6E63] hover:text-[#5D4037] px-2 py-0.5 rounded-md hover:bg-[#FFF8F3] transition-colors"
                  >
                    {copiedField === 'guide' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedField === 'guide' ? 'คัดลอกแล้ว' : 'คัดลอกวิธีใช้'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-[#FFFDF5] rounded-2xl border border-[#E8DCCF] text-xs text-[#8D6E63] whitespace-pre-line leading-relaxed font-medium">
                  {product.usageGuide || 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ได้รับ'}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-2xl bg-[#FFF0EB] border border-[#FFCCBC] flex items-center gap-2 text-xs text-[#D84315] font-bold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* User Balance & Purchase Action */}
              <div className="pt-2 border-t border-[#F5EBE1] space-y-3">
                {user ? (
                  <div className="flex items-center justify-between text-xs font-bold text-[#5D4037]">
                    <span>เครดิตคงเหลือของคุณ:</span>
                    <span className="text-[#E5989B] font-black text-sm">
                      {user.creditBalance.toLocaleString()} บาท
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#FFF8F3] text-xs text-center font-bold text-[#6D4C41]">
                    คุณยังไม่ได้เข้าสู่ระบบ กรุณาเข้าสู่ระบบก่อนกดซื้อ
                  </div>
                )}

                {user && user.creditBalance < product.price ? (
                  <Link
                    href="/topup"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>เครดิตไม่เพียงพอ (คลิกที่นี่เพื่อเติมเงิน)</span>
                  </Link>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={loading || product.availableSlotsCount <= 0}
                    className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading ? (
                      <span>กำลังจัดเตรียมและดึงบัญชี...</span>
                    ) : product.availableSlotsCount <= 0 ? (
                      <span>สินค้าหมดชั่วคราว</span>
                    ) : (
                      <span>ยืนยันการกดซื้อ (หัก {product.price.toLocaleString()} เครดิต)</span>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
