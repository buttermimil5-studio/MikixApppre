'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  purchaseProductAction,
  requestOtpAction,
  guestPurchaseWithSlipAction,
  PurchaseResult,
} from '@/lib/actions/purchaseActions';
import { generatePromptPayPayload } from '@/lib/promptpay';
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
  Monitor,
  ShieldCheck,
  Tv,
  ArrowLeft,
  Sparkles,
  QrCode,
  Upload,
  Building,
} from 'lucide-react';

interface ProductModalProps {
  product: any;
  user: any;
  storeSetting?: any;
  bankAccounts?: any[];
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: (newBalance: number) => void;
}

export function ProductModal({
  product,
  user,
  storeSetting,
  bankAccounts = [],
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

  // Guest Direct Checkout States
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestSlipFile, setGuestSlipFile] = useState<File | null>(null);
  const [guestSlipPreview, setGuestSlipPreview] = useState<string | null>(null);
  const [guestTransRef, setGuestTransRef] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [copiedBankInfo, setCopiedBankInfo] = useState(false);

  const isAgent = user?.role === 'AGENT' || user?.role === 'ADMIN';
  const effectivePrice = isAgent ? product.price : (product.retailPrice || product.price);
  const retailPrice = product.retailPrice || product.price;

  // Active bank calculation
  const activeBank = bankAccounts.length > 0
    ? (bankAccounts.find((b) => b.isPromptPay || b.promptPayNumber) || bankAccounts[0])
    : null;

  const promptPayTarget =
    activeBank?.promptPayNumber ||
    (activeBank?.isPromptPay ? activeBank?.accountNumber : null) ||
    storeSetting?.promptPayNumber ||
    '0899999999';

  const bankName = activeBank ? activeBank.bankName : (storeSetting?.bankName || 'พร้อมเพย์ / ธนาคาร');
  const accountName = activeBank ? activeBank.accountName : (storeSetting?.bankAccountName || 'มิคิ สโตร์');
  const accountNumber = activeBank ? activeBank.accountNumber : (storeSetting?.bankAccountNumber || promptPayTarget);

  // Generate PromptPay Payload & QR Code URL
  const promptPayPayload = generatePromptPayPayload(promptPayTarget, retailPrice);
  const promptPayQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    promptPayPayload
  )}`;

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleGuestSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGuestSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGuestSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuestPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestSlipFile && !guestTransRef.trim()) {
      setGuestError('กรุณาแนบรูปภาพสลิปการโอนเงินเพื่อตรวจสอบ');
      return;
    }

    setGuestLoading(true);
    setGuestError(null);

    const formData = new FormData();
    if (guestSlipFile) formData.append('slip', guestSlipFile);
    if (guestTransRef.trim()) formData.append('transRef', guestTransRef.trim());

    const res = await guestPurchaseWithSlipAction(product.id, formData);
    setGuestLoading(false);

    if (res.success && res.order) {
      setOrderResult(res.order);
      setIsGuestMode(false);
    } else {
      setGuestError(res.error || 'การสั่งซื้อไม่สำเร็จ กรุณาตรวจสอบสลิปและลองใหม่อีกครั้ง');
    }
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
      `[ ข้อมูลเข้าใช้งานแอปพรีเมียม - ${data.productName} ]`,
      data.orderNumber ? `เลขออเดอร์: ${data.orderNumber}` : '',
      `อีเมล: ${data.email}`,
      `รหัสผ่าน: ${data.password}`,
      `จอ / โปรไฟล์ที่ได้รับ: ${data.slotName}`,
      data.slotPin ? `รหัส PIN ประจำจอ: ${data.slotPin}` : 'รหัส PIN: ไม่ต้องใช้ PIN (เข้าใช้งานได้ทันที)',
      data.expiresAt ? `วันหมดอายุ: ${new Date(data.expiresAt).toLocaleString('th-TH')}` : '',
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
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/40 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] flex flex-col max-h-[90vh] my-auto overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
              {product.category?.name || 'แอปพรีเมียม'}
            </span>
            {product.sharingTypeNote && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] flex items-center gap-1 shadow-2xs">
                <Monitor className="w-3 h-3 text-[#E5989B]" />
                {product.sharingTypeNote}
              </span>
            )}
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
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
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFDF5] border border-dashed border-[#FFD9CE] space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#F5EBE1] pb-2.5">
                  <span className="text-xs font-extrabold text-[#5D4037] flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#E5989B]" />
                    ข้อมูลเข้าใช้งานของคุณ (森のチケット)
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
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#E5989B] shadow-2xs">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8D6E63] font-bold block">
                          จอ / โปรไฟล์ที่คุณได้รับ:
                        </span>
                        <span className="text-sm sm:text-base font-black text-[#5D4037]">
                          {orderResult.slotName}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(orderResult.slotName, 'slotName')}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FFD9CE] text-[11px] font-bold text-[#E5989B] hover:bg-[#FFF0EB] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      title="คัดลอกชื่อจอ"
                    >
                      {copiedField === 'slotName' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'slotName' ? 'คัดลอกแล้ว' : 'คัดลอกชื่อจอ'}</span>
                    </button>
                  </div>

                  {/* PIN Display */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#FFD9CE]/60">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#D97706] shadow-2xs">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8D6E63] font-bold block">
                          รหัส PIN หน้าจอ:
                        </span>
                        {orderResult.slotPin ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-base font-mono font-black text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded-lg border border-[#FDE68A] tracking-wider">
                              {orderResult.slotPin}
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
                    {orderResult.slotPin && (
                      <button
                        type="button"
                        onClick={() => handleCopy(orderResult.slotPin!, 'pin')}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#FFD9CE] text-[11px] font-bold text-[#B45309] hover:bg-[#FEF3C7] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                        title="คัดลอก PIN"
                      >
                        {copiedField === 'pin' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedField === 'pin' ? 'คัดลอกแล้ว' : 'คัดลอก PIN'}</span>
                      </button>
                    )}
                  </div>
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

              {orderResult.isGuest && (
                <div className="p-3.5 rounded-2xl bg-[#FFF0EB] border border-[#FFCCBC] space-y-1 text-center">
                  <p className="text-xs font-bold text-[#D84315] flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>คำเตือน: โปรดกดคัดลอกข้อมูลหรือแคปหน้าจอไว้ทันที</span>
                  </p>
                  <p className="text-[11px] text-[#8D6E63]">
                    เนื่องจากท่านสั่งซื้อแบบลูกค้าทั่วไป (ไม่ได้เข้าสู่ระบบ) ระบบจะไม่สามารถแสดงรหัสนี้ซ้ำได้หลังจากปิดหน้าต่างนี้
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {orderResult.isGuest ? (
                  <Link
                    href="/register"
                    className="w-full py-3 rounded-full text-center text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 transition-all shadow-xs"
                  >
                    สมัครตัวแทนเพื่อบันทึกประวัติ & รับราคาส่ง
                  </Link>
                ) : (
                  <Link
                    href="/orders"
                    className="w-full py-3 rounded-full text-center text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 transition-all shadow-xs"
                  >
                    ดูรายการในประวัติการซื้อ
                  </Link>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-full text-center text-xs font-bold bg-white text-[#5D4037] border border-[#E8DCCF] hover:bg-[#FFF8F3] active:scale-95 transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          ) : isGuestMode ? (
            /* Guest Checkout View: PromptPay QR + Slip Upload */
            <div className="space-y-4">
              {/* Header with Back button */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F5EBE1]">
                <button
                  type="button"
                  onClick={() => {
                    setIsGuestMode(false);
                    setGuestError(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#8D6E63] hover:text-[#5D4037] px-2.5 py-1 rounded-full hover:bg-[#FFF8F3] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>ย้อนกลับ</span>
                </button>
                <span className="text-xs font-bold text-[#E5989B] bg-[#FFF0EB] px-3 py-0.5 rounded-full border border-[#FFD9CE]">
                  ชำระเงินราคาปลีก (ไม่ต้องสมัคร)
                </span>
              </div>

              {/* Product & Price Summary Card */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#FFD9CE] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E8DCCF] flex-shrink-0 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-[#5D4037] line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#8D6E63] font-medium">ระยะเวลา {product.durationDays} วัน</span>
                      {product.sharingTypeNote && (
                        <span className="text-[10px] font-bold text-[#E5989B] bg-[#FFF0EB] px-2 py-0.2 rounded-full border border-[#FFD9CE]">
                          {product.sharingTypeNote}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8D6E63] block">ยอดที่ต้องชำระ:</span>
                  <span className="text-base sm:text-lg font-black text-[#E5989B]">
                    {retailPrice.toLocaleString()} ฿
                  </span>
                </div>
              </div>

              {/* QR PromptPay & Bank Info Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#FFFDF5] to-[#FFF9F5] border border-[#FFD9CE] space-y-3 shadow-2xs">
                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] text-[#E5989B] text-xs font-bold border border-[#FFD9CE]">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>สแกน QR PromptPay ยอด {retailPrice.toLocaleString()} บาท</span>
                  </div>
                  <p className="text-[11px] text-[#8D6E63]">
                    เปิดแอปธนาคารแล้วสแกน QR Code ด้านล่าง ยอดเงินจะถูกระบุอัตโนมัติ
                  </p>
                </div>

                {/* QR Code Image */}
                <div className="flex justify-center py-1">
                  <div className="p-2.5 bg-white rounded-2xl border border-[#FFD9CE] shadow-sm inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={promptPayQrUrl}
                      alt="PromptPay QR"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain mx-auto"
                    />
                  </div>
                </div>

                {/* Bank Account Details with Copy */}
                <div className="p-3 bg-white rounded-xl border border-[#E8DCCF] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8D6E63]">ธนาคาร / ช่องทาง:</span>
                    <span className="font-bold text-[#5D4037]">{bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8D6E63]">ชื่อบัญชี:</span>
                    <span className="font-bold text-[#5D4037]">{accountName}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#F5EBE1]">
                    <span className="text-[#8D6E63]">เลขบัญชี / พร้อมเพย์:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#E5989B] select-all">{accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(accountNumber.replace(/-/g, ''));
                          setCopiedBankInfo(true);
                          setTimeout(() => setCopiedBankInfo(false), 2000);
                        }}
                        className="p-1 rounded-md hover:bg-[#FFF0EB] text-[#E5989B] transition-colors"
                        title="คัดลอกเลขบัญชี"
                      >
                        {copiedBankInfo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form: Upload Slip & Submit */}
              <form onSubmit={handleGuestPurchase} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#5D4037] flex items-center justify-between">
                    <span>แนบสลิปโอนเงิน (ระบบตรวจอัตโนมัติ) *</span>
                    <span className="text-[10px] text-[#2E7D32] font-semibold">ตรวจไวใน 3 วินาที</span>
                  </label>
                  
                  <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-[#FFD9CE] rounded-2xl cursor-pointer bg-[#FFFDF7] hover:bg-[#FFF5F2] transition-colors">
                    {guestSlipPreview ? (
                      <div className="space-y-2 text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={guestSlipPreview}
                          alt="Preview"
                          className="max-h-36 mx-auto rounded-lg object-contain border border-[#FFD9CE]"
                        />
                        <span className="text-[11px] font-bold text-[#E5989B] block">คลิกเพื่อเปลี่ยนรูปสลิป</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
                        <div className="w-9 h-9 rounded-full bg-[#FFF0EB] flex items-center justify-center text-[#E5989B] mb-1">
                          <Upload className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-[#5D4037]">แตะเพื่ออัปโหลดรูปภาพสลิป</p>
                        <p className="text-[10px] text-[#8D6E63]">รองรับไฟล์ JPG, PNG หรือ WebP จากแอปธนาคาร</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGuestSlipChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Optional transRef */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#8D6E63]">
                    รหัสอ้างอิงสลิป (ระบุหากสลิปไม่มี QR Code หรือระบบอ่านไม่ผ่าน)
                  </label>
                  <input
                    type="text"
                    value={guestTransRef}
                    onChange={(e) => setGuestTransRef(e.target.value)}
                    placeholder="เช่น 2024102912345678"
                    className="w-full miki-input text-xs font-mono"
                  />
                </div>

                {/* Error Banner */}
                {guestError && (
                  <div className="p-3 rounded-2xl bg-[#FFF0EB] border border-[#FFCCBC] flex items-center gap-2 text-xs text-[#D84315] font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{guestError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={guestLoading || (!guestSlipFile && !guestTransRef.trim())}
                  className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {guestLoading ? (
                    <span>กำลังตรวจสอบสลิปและส่งมอบบัญชี...</span>
                  ) : (
                    <span>ยืนยันและตรวจสอบสลิป (รับบัญชีทันที)</span>
                  )}
                </button>

                <p className="text-center text-[10px] text-[#8D6E63]">
                  ระบบจะตรวจสอบยอดเงิน {retailPrice.toLocaleString()} บาท และส่งมอบข้อมูลเข้าใช้งานให้ทันทีหลังสลิปผ่าน
                </p>
              </form>
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
                  <div className="mt-1 space-y-1">
                    {isAgent ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#E5989B]">
                            {product.price.toLocaleString()} ฿
                          </span>
                          <span className="text-[10px] text-[#2E7D32] font-extrabold bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#C8E6C9]">
                            ราคาส่งตัวแทน
                          </span>
                          <span className="text-xs text-[#8D6E63] font-medium">
                            / {product.durationDays} วัน
                          </span>
                        </div>
                        {product.retailPrice && product.retailPrice > product.price && (
                          <p className="text-[11px] text-[#8D6E63] mt-0.5">
                            ราคาปลีกทั่วไป: <span className="line-through">{product.retailPrice.toLocaleString()} ฿</span> (ประหยัด {(product.retailPrice - product.price).toLocaleString()} ฿)
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-[#5D4037]">
                            {(product.retailPrice || product.price).toLocaleString()} ฿
                          </span>
                          <span className="text-xs text-[#8D6E63] font-medium">
                            / {product.durationDays} วัน (ราคาปกติ)
                          </span>
                        </div>
                        {product.retailPrice && product.retailPrice > product.price && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-1 rounded-full bg-[#FFF0EB] border border-[#FFD9CE] text-[11px] font-bold text-[#E5989B]">
                            <span>⚡ สมัครตัวแทน เหลือเพียง {product.price.toLocaleString()} ฿</span>
                            <span className="text-[#8D6E63] font-normal">(ประหยัด {(product.retailPrice - product.price).toLocaleString()} ฿)</span>
                          </div>
                        )}
                      </div>
                    )}
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

              {/* Screen / Slot & PIN Type Badge */}
              <div className="p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FFD9CE] flex items-center gap-2.5 text-xs">
                {product.hasProfilePin || product.defaultSlotCount > 1 ? (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#E5989B] flex-shrink-0 shadow-2xs">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-[#6D4C41] flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-extrabold text-[#5D4037]">
                          สิทธิ์แบบแบ่งจอส่วนตัว (พร้อมรหัส PIN เข้าจอ)
                        </span>
                        {product.sharingTypeNote && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white text-[#D84315] border border-[#FFCCBC] shadow-2xs">
                            {product.sharingTypeNote}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8D6E63] leading-relaxed block mt-0.5">
                        ระบบจัดสรรคิวจอที่ว่างและรหัส PIN ให้คุณอัตโนมัติทันทีหลังกดซื้อ (ไม่ต้องเลือกจอเอง)
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-center text-[#2E7D32] flex-shrink-0 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-[#2E7D32] flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-extrabold text-[#1B5E20]">
                          บัญชีเต็มสิทธิ์ส่วนตัว (เมลร้าน/เมลส่วนตัว)
                        </span>
                        {product.sharingTypeNote && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white text-[#1B5E20] border border-[#C8E6C9] shadow-2xs">
                            {product.sharingTypeNote}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#2E7D32]/80 leading-relaxed block mt-0.5">
                        เข้าใช้งานได้ทันที ระบบส่งมอบข้อมูลบัญชีให้อัตโนมัติหลังกดซื้อ
                      </span>
                    </div>
                  </>
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
                  <>
                    <div className="flex items-center justify-between text-xs font-bold text-[#5D4037]">
                      <span>เครดิตคงเหลือของคุณ:</span>
                      <span className="text-[#E5989B] font-black text-sm">
                        {user.creditBalance.toLocaleString()} บาท
                      </span>
                    </div>

                    {user.creditBalance < effectivePrice ? (
                      <Link
                        href="/topup"
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] transition-all"
                      >
                        <Wallet className="w-4 h-4" />
                        <span>เครดิตไม่เพียงพอ (ต้องการ {effectivePrice.toLocaleString()} ฿) คลิกเติมเงิน</span>
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
                          <span>
                            ยืนยันการกดซื้อ (หัก {effectivePrice.toLocaleString()} เครดิต
                            {isAgent ? ' - ราคาส่งตัวแทน' : ''})
                          </span>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setIsGuestMode(true)}
                      disabled={product.availableSlotsCount <= 0}
                      className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4 text-[#D97706]" />
                      <span>
                        {product.availableSlotsCount <= 0
                          ? 'สินค้าหมดชั่วคราว'
                          : `⚡ ซื้อด่วนในราคาปกติ (${retailPrice.toLocaleString()} ฿) ไม่ต้องสมัครสมาชิก`}
                      </span>
                    </button>

                    <Link
                      href="/register"
                      className="w-full py-2.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] transition-all flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>สมัครตัวแทนเพื่อรับราคาส่ง ({product.price.toLocaleString()} ฿)</span>
                    </Link>

                    <Link
                      href="/login?redirect=/"
                      className="w-full py-2 text-center text-[11px] font-bold text-[#8D6E63] hover:text-[#5D4037] transition-colors block"
                    >
                      มีบัญชีตัวแทนอยู่แล้ว? เข้าสู่ระบบ
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
