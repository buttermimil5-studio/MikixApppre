'use client';

import React, { useState } from 'react';
import { submitTopupSlipAction } from '@/lib/actions/topupActions';
import { generatePromptPayPayload } from '@/lib/promptpay';
import {
  Wallet,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building,
  Clock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

interface BankAccountItem {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  promptPayNumber?: string | null;
  qrCodeUrl?: string | null;
  isPromptPay: boolean;
  isActive: boolean;
}

interface TopupClientProps {
  user: any;
  storeSetting: any;
  bankAccounts?: BankAccountItem[];
  recentTopups: any[];
}

export function TopupClient({
  user,
  storeSetting,
  bankAccounts = [],
  recentTopups: initialTopups,
}: TopupClientProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [selectedBankId, setSelectedBankId] = useState<string>(
    bankAccounts.length > 0 ? bankAccounts[0].id : 'default'
  );
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [transRef, setTransRef] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);
  const [topups, setTopups] = useState(initialTopups);
  const [currentBalance, setCurrentBalance] = useState(user.creditBalance);
  const [isFlipped, setIsFlipped] = useState(false);

  const presetAmounts = [50, 89, 100, 200, 300, 500, 1000];

  const handleSelectAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num)) setAmount(num);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeBank = bankAccounts.length > 0
    ? (bankAccounts.find((b) => b.id === selectedBankId) || bankAccounts[0])
    : null;

  const currentBankName = activeBank ? activeBank.bankName : (storeSetting?.bankName || 'ธนาคารกสิกรไทย');
  const currentAccountName = activeBank ? activeBank.accountName : (storeSetting?.bankAccountName || 'มิคิ สโตร์');
  const currentAccountNumber = activeBank ? activeBank.accountNumber : (storeSetting?.bankAccountNumber || '000-0-00000-0');
  const currentPromptPay = activeBank
    ? (activeBank.promptPayNumber || (activeBank.isPromptPay ? activeBank.accountNumber : null))
    : (storeSetting?.promptPayNumber || '0899999999');
  const currentQrUrl = activeBank?.qrCodeUrl || storeSetting?.bankQrUrl;

  const handleCopyAccount = () => {
    if (currentAccountNumber) {
      navigator.clipboard.writeText(currentAccountNumber.replace(/-/g, ''));
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setResult({ success: false, error: 'กรุณาระบุจำนวนเงินที่ถูกต้อง' });
      return;
    }

    if (!slipFile && !transRef) {
      setResult({ success: false, error: 'กรุณาอัปโหลดสลิปการโอนเงิน หรือระบุรหัสอ้างอิงสลิป' });
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('amount', amount.toString());
    if (slipFile) formData.append('slip', slipFile);
    if (transRef) formData.append('transRef', transRef);

    const res = await submitTopupSlipAction(formData);
    setLoading(false);

    if (res.success) {
      setResult({ success: true, message: res.message });
      if (res.newBalance !== undefined) {
        setCurrentBalance(res.newBalance);
      }
      setTopups([
        {
          id: 'temp-' + Date.now(),
          txNumber: res.txNumber || 'TX-NEW',
          amount: amount,
          transRef: res.transRef,
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
          verifiedBy: 'SLIP2GO',
        },
        ...topups,
      ]);
      setSlipFile(null);
      setSlipPreview(null);
      setTransRef('');
    } else {
      setResult({ success: false, error: res.error });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#FFF8F3] text-[#FFB4A2] mb-1">
          <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#5D4037]">
          เติมเครดิตเข้าบัญชี
        </h1>
        <p className="text-xs sm:text-sm text-[#8D6E63] font-medium">
          สแกนจ่ายผ่าน QR Code หรือโอนเข้าบัญชี แล้วอัปโหลดสลิป ระบบ Slip2Go ตรวจยอดและเติมเครดิตให้อัตโนมัติ
        </p>
      </div>

      {/* Current Balance Bar */}
      <div className="miki-card p-4 flex items-center justify-between bg-white border border-[#E8DCCF]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#FFB4A2]" />
          <span className="text-xs sm:text-sm font-bold text-[#5D4037]">
            เครดิตปัจจุบันของคุณ:
          </span>
        </div>
        <div className="text-lg sm:text-xl font-black text-[#E5989B]">
          {currentBalance.toLocaleString()} บาท
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Bank Account & PromptPay QR */}
        <div className="miki-card p-6 space-y-5 bg-white border border-[#E8DCCF]">
          <h2 className="font-extrabold text-sm sm:text-base text-[#5D4037] flex items-center justify-between border-b border-[#E8DCCF] pb-3">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FFB4A2]" />
              <span>ช่องทางการชำระเงิน</span>
            </span>
            {bankAccounts.length > 1 && (
              <span className="text-[11px] font-normal text-[#8D6E63]">
                มีให้เลือก {bankAccounts.length} บัญชี
              </span>
            )}
          </h2>

          {/* Multiple Bank Selection Pills (if admin added bank accounts) */}
          {bankAccounts.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#8D6E63]">เลือกบัญชีรับโอนเงิน:</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
                {bankAccounts.map((b) => {
                  const isSelected = (activeBank?.id === b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBankId(b.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border shadow-xs ${
                        isSelected
                          ? 'bg-[#5D4037] text-white border-[#5D4037] scale-102'
                          : 'bg-white text-[#5D4037] border-[#FFD9CE] hover:bg-[#FFF8F3]'
                      }`}
                    >
                      {b.bankName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bank Info Card */}
          <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#FFD9CE] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8D6E63]">ธนาคาร / ช่องทาง</span>
              <span className="text-xs font-black text-[#5D4037]">
                {currentBankName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8D6E63]">ชื่อบัญชี</span>
              <span className="text-xs font-black text-[#5D4037]">
                {currentAccountName}
              </span>
            </div>

            <div className="space-y-1 pt-1 border-t border-[#E8DCCF]">
              <span className="text-xs font-bold text-[#8D6E63]">เลขที่บัญชี</span>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#FFD9CE] text-sm font-mono font-bold text-[#5D4037]">
                <span>{currentAccountNumber}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 rounded-lg hover:bg-[#FFF8F3] text-[#E5989B] transition-colors"
                  title="คัดลอกเลขบัญชี"
                >
                  {copiedBank ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {currentPromptPay && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-bold text-[#8D6E63]">พร้อมเพย์ / วอลเล็ท:</span>
                <span className="font-mono font-extrabold text-[#5D4037]">
                  {currentPromptPay}
                </span>
              </div>
            )}
          </div>

          {/* 3D Flip Card: Side 1 = Real PromptPay QR, Side 2 = Static Bank QR */}
          {(() => {
            const promptPayTarget = currentPromptPay || '0899999999';
            const promptPayPayload = generatePromptPayPayload(
              promptPayTarget,
              amount > 0 ? amount : undefined
            );
            const promptPayQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              promptPayPayload
            )}`;

            return (
              <div className="relative">
                {!isFlipped ? (
                  /* FRONT SIDE: Real EMVCo PromptPay QR */
                  <div className="p-4 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] text-center space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#E5989B] flex items-center gap-1.5">
                        <QrCode className="w-4 h-4" />
                        <span>QR PromptPay (สแกนจ่ายได้จริง)</span>
                      </span>
                      {currentQrUrl && (
                        <button
                          type="button"
                          onClick={() => setIsFlipped(true)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#6D4C41] border border-[#FFD9CE] hover:bg-[#FFFDF5] shadow-xs active:scale-95 transition-all"
                        >
                          <RotateCcw className="w-3 h-3 text-[#FFB4A2]" />
                          <span>ดู QR ธนาคาร</span>
                        </button>
                      )}
                    </div>

                    <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-[#FFD9CE] shadow-xs flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={promptPayQrUrl}
                        alt="PromptPay QR Code"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="text-[#8D6E63] font-medium">
                        พร้อมเพย์: {promptPayTarget}
                      </span>
                      <span className="font-extrabold text-[#E5989B]">{amount} บาท</span>
                    </div>
                  </div>
                ) : (
                  /* BACK SIDE: Static Bank Account QR */
                  <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#FFD9CE] text-center space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5D4037] flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-[#FFB4A2]" />
                        <span>QR บัญชีธนาคารปกติ</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFlipped(false)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#6D4C41] border border-[#FFD9CE] hover:bg-[#FFF8F3] shadow-xs active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-3 h-3 text-[#E5989B]" />
                        <span>กลับไป PromptPay</span>
                      </button>
                    </div>

                    <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-[#FFD9CE] shadow-xs flex items-center justify-center overflow-hidden">
                      {currentQrUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentQrUrl}
                          alt="Bank Account QR Code"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4 space-y-2">
                          <Building className="w-8 h-8 mx-auto text-[#FFB4A2]" />
                          <p className="text-[11px] text-[#8D6E63] font-medium leading-relaxed">
                            ยังไม่มีภาพ QR บัญชีธนาคารปกติในระบบ สามารถโอนผ่านเลขบัญชีด้านบนได้เลยค่ะ
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between px-2 text-xs">
                      <span className="text-[#8D6E63] font-medium">{currentBankName}</span>
                      <span className="font-mono font-bold text-[#5D4037]">
                        {currentAccountNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Right Column: Amount Selector & Slip Upload Form */}
        <div className="miki-card p-6 space-y-5 bg-white border border-[#E8DCCF]">
          <h2 className="font-extrabold text-sm sm:text-base text-[#5D4037] flex items-center gap-2 border-b border-[#E8DCCF] pb-3">
            <Upload className="w-4 h-4 text-[#FFB4A2]" />
            <span>ระบุยอดเงิน & อัปโหลดสลิป</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#5D4037]">เลือกจำนวนเงินที่ต้องการเติม</label>
              <div className="grid grid-cols-4 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectAmount(preset)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      amount === preset
                        ? 'bg-[#FFB4A2] text-white shadow-xs'
                        : 'bg-[#FDFBF7] text-[#5D4037] border border-[#E8DCCF] hover:bg-[#FFEFE8]'
                    }`}
                  >
                    {preset} ฿
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">หรือระบุจำนวนเงินเอง (บาท)</label>
              <input
                type="number"
                min="1"
                step="any"
                value={customAmount}
                onChange={handleCustomChange}
                className="w-full miki-input text-xs font-bold"
                placeholder="ระบุยอดเงิน..."
              />
            </div>

            {/* Slip Upload Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ภาพสลิปการโอนเงิน (ตรวจด้วย Slip2Go)</label>
              <div className="relative border-2 border-dashed border-[#FFCDB2] rounded-2xl p-4 text-center bg-[#FFF8FA] hover:bg-[#FFF8F3] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {slipPreview ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slipPreview}
                      alt="Slip preview"
                      className="max-h-36 mx-auto rounded-xl border border-[#FFD9CE] object-contain"
                    />
                    <p className="text-xs text-[#059669] font-bold">เลือกภาพสลิปแล้ว (คลิกเพื่อเปลี่ยนรูป)</p>
                  </div>
                ) : (
                  <div className="space-y-1 py-3">
                    <Upload className="w-6 h-6 text-[#FFB4A2] mx-auto" />
                    <p className="text-xs font-bold text-[#5D4037]">คลิกเพื่ออัปโหลดสลิป หรือลากไฟล์มาวาง</p>
                    <p className="text-[10px] text-[#8D6E63]">รองรับไฟล์ JPG, PNG</p>
                  </div>
                )}
              </div>
            </div>

            {/* Optional transRef field */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#8D6E63]">
                รหัสอ้างอิงสลิป (transRef) - ตัวเลือกเสริมสำหรับทดสอบระบบป้องกันสลิปซ้ำ:
              </label>
              <input
                type="text"
                value={transRef}
                onChange={(e) => setTransRef(e.target.value)}
                placeholder="เว้นว่างไว้เพื่อดึงอัตโนมัติ"
                className="w-full text-xs font-mono p-2 rounded-xl bg-white border border-[#FFD9CE] text-[#5D4037]"
              />
            </div>

            {/* Result / Error Alerts */}
            {result && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  result.success
                    ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                    : 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{result.message || result.error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-xs sm:text-sm font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <span>กำลังส่งสลิปให้ Slip2Go ตรวจสอบ...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>ยืนยันการเติมเงิน {amount} บาท</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Topup History Table */}
      <div className="miki-card p-6 space-y-4 bg-white border border-[#E8DCCF]">
        <h3 className="font-extrabold text-sm sm:text-base text-[#5D4037] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FFB4A2]" />
          <span>ประวัติการเติมเครดิตล่าสุด</span>
        </h3>

        {topups.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[#8D6E63] font-bold">
                  <th className="pb-2.5">รหัสธุรกรรม</th>
                  <th className="pb-2.5">จำนวนเงิน</th>
                  <th className="pb-2.5">รหัสอ้างอิง (transRef)</th>
                  <th className="pb-2.5">ระบบตรวจ</th>
                  <th className="pb-2.5">สถานะ</th>
                  <th className="pb-2.5">วันที่และเวลา</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/60">
                {topups.map((tx) => (
                  <tr key={tx.id} className="font-medium text-[#5D4037]">
                    <td className="py-3 font-mono">{tx.txNumber}</td>
                    <td className="py-3 font-black text-[#059669]">+{tx.amount.toLocaleString()} ฿</td>
                    <td className="py-3 font-mono text-[11px] text-[#8D6E63]">{tx.transRef || '-'}</td>
                    <td className="py-3 font-bold text-[11px] text-[#FFB4A2]">{tx.verifiedBy || 'SLIP2GO'}</td>
                    <td className="py-3">
                      {tx.status === 'SUCCESS' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                          สำเร็จ
                        </span>
                      )}
                      {tx.status === 'PENDING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                          รอตรวจสอบ
                        </span>
                      )}
                      {tx.status === 'REJECTED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                          ปฏิเสธ
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-[#8D6E63]">
                      {new Date(tx.createdAt).toLocaleString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#8D6E63] text-center py-4">ยังไม่มีประวัติการเติมเงิน</p>
        )}
      </div>
    </div>
  );
}
