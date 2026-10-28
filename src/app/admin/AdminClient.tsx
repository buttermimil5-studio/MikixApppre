'use client';

import React, { useState } from 'react';
import {
  getAdminDashboardStats,
  adjustUserCreditAction,
  addStockAccountAction,
  recycleStockAccountAction,
  toggleProductActiveAction,
  saveProductAction,
  updateStoreSettingsAction,
  approveManualTopupAction,
} from '@/lib/actions/adminActions';
import {
  BarChart3,
  Package,
  Layers,
  Users,
  CreditCard,
  Settings,
  History,
  TrendingUp,
  Clock,
  AlertTriangle,
  RotateCcw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  Check,
  X,
  ShoppingBag,
} from 'lucide-react';

interface AdminClientProps {
  initialStats: any;
  initialStocks: any[];
  initialProducts: any[];
  initialUsers: any[];
  initialTopups: any[];
  initialSettings: any;
  initialAuditLogs: any[];
  categories: any[];
  initialOrders?: any[];
}

export function AdminClient({
  initialStats,
  initialStocks,
  initialProducts,
  initialUsers,
  initialTopups,
  initialSettings,
  initialAuditLogs,
  categories,
  initialOrders = [],
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'STOCKS' | 'PRODUCTS' | 'USERS' | 'SLIPS' | 'SETTINGS' | 'LOGS'
  >('DASHBOARD');

  const [stats, setStats] = useState(initialStats);
  const [stocks, setStocks] = useState(initialStocks);
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(initialUsers);
  const [topups, setTopups] = useState(initialTopups);
  const [settings, setSettings] = useState(initialSettings);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // Modals & form states
  const [creditModalUser, setCreditModalUser] = useState<any | null>(null);
  const [creditType, setCreditType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [creditReason, setCreditReason] = useState<string>('');
  const [creditLoading, setCreditLoading] = useState(false);

  const [recycleStock, setRecycleStock] = useState<any | null>(null);
  const [recycleNewPassword, setRecycleNewPassword] = useState<string>('');
  const [recycleLoading, setRecycleLoading] = useState(false);

  const [newStockModal, setNewStockModal] = useState(false);
  const [newStockProduct, setNewStockProduct] = useState(products[0]?.id || '');
  const [newStockEmail, setNewStockEmail] = useState('');
  const [newStockPassword, setNewStockPassword] = useState('');
  const [newStockNotes, setNewStockNotes] = useState('');
  const [newStockSlotCount, setNewStockSlotCount] = useState<number>(1);
  const [newStockLoading, setNewStockLoading] = useState(false);

  const [editProductModal, setEditProductModal] = useState<any | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(89);
  const [prodDuration, setProdDuration] = useState(30);
  const [prodCategory, setProdCategory] = useState(categories[0]?.id || '');
  const [prodImage, setProdImage] = useState('');
  const [prodRules, setProdRules] = useState('');
  const [prodGuide, setProdGuide] = useState('');
  const [prodOtp, setProdOtp] = useState(false);
  const [prodLineOa, setProdLineOa] = useState('');
  const [prodLoading, setProdLoading] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    storeName: settings?.storeName || '',
    storeTag: settings?.storeTag || '森のベーカリー',
    storeSubtitle: settings?.storeSubtitle || '',
    bannerUrl: settings?.bannerUrl || '',
    logoUrl: settings?.logoUrl || '',
    mascotUrl: settings?.mascotUrl || '',
    mascotGreeting: settings?.mascotGreeting || '',
    announcementNote: settings?.announcementNote || '',
    contactLine: settings?.contactLine || '',
    contactFacebook: settings?.contactFacebook || '',
    contactInstagram: settings?.contactInstagram || '',
    isOpen: settings?.isOpen ?? true,
    closedNotice: settings?.closedNotice || '',
    bankName: settings?.bankName || '',
    bankAccountName: settings?.bankAccountName || '',
    bankAccountNumber: settings?.bankAccountNumber || '',
    promptPayNumber: settings?.promptPayNumber || '',
    bankQrUrl: settings?.bankQrUrl || '',
    slip2goApiKey: settings?.slip2goApiKey || '',
    slip2goSecretKey: settings?.slip2goSecretKey || '',
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const tabs = [
    { id: 'DASHBOARD', label: 'แดชบอร์ดสรุป', icon: BarChart3 },
    { id: 'ORDERS', label: 'ตัดสต็อก & คำสั่งซื้อ', icon: ShoppingBag },
    { id: 'STOCKS', label: 'สต็อก & คิวเปลี่ยนรหัส', icon: Package },
    { id: 'PRODUCTS', label: 'สินค้า & หมวดหมู่', icon: Layers },
    { id: 'USERS', label: 'สมาชิก & ปรับเครดิต', icon: Users },
    { id: 'SLIPS', label: 'ตรวจสอบสลิป', icon: CreditCard },
    { id: 'SETTINGS', label: 'ตั้งค่าร้านค้า', icon: Settings },
    { id: 'LOGS', label: 'ประวัติ Audit Logs', icon: History },
  ];

  const handleAdjustCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalUser) return;
    const finalDelta = creditType === 'ADD' ? Math.abs(creditAmount) : -Math.abs(creditAmount);
    setCreditLoading(true);

    const res = await adjustUserCreditAction(creditModalUser.id, finalDelta, creditReason);
    setCreditLoading(false);

    if (res.success && res.user) {
      setUsers(users.map((u) => (u.id === res.user.id ? { ...u, creditBalance: res.user.creditBalance } : u)));
      setCreditModalUser(null);
      setCreditReason('');
    } else {
      alert(res.error || 'ปรับเครดิตไม่สำเร็จ');
    }
  };

  const handleRecycleAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recycleStock) return;
    setRecycleLoading(true);

    const res = await recycleStockAccountAction(recycleStock.id, recycleNewPassword);
    setRecycleLoading(false);

    if (res.success) {
      setStocks(
        stocks.map((s) =>
          s.id === recycleStock.id
            ? {
                ...s,
                status: 'ACTIVE',
                slots: s.slots.map((sl: any) => ({ ...sl, status: 'AVAILABLE', assignedUser: null })),
              }
            : s
        )
      );
      setRecycleStock(null);
      setRecycleNewPassword('');
    } else {
      alert(res.error || 'นำกลับเข้าสต็อกไม่สำเร็จ');
    }
  };

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewStockLoading(true);

    const slots = Array.from({ length: newStockSlotCount }, (_, i) => ({
      slotName: newStockSlotCount > 1 ? `จอ ${i + 1}` : 'เต็มจอ / 1 สิทธิ์',
    }));

    const res = await addStockAccountAction({
      productId: newStockProduct,
      email: newStockEmail,
      password: newStockPassword,
      notes: newStockNotes,
      slots,
    });
    setNewStockLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert('เพิ่มสต็อกไม่สำเร็จ');
    }
  };

  const handleToggleProduct = async (id: string, current: boolean) => {
    await toggleProductActiveAction(id, !current);
    setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !current } : p)));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdLoading(true);

    const res = await saveProductAction({
      id: editProductModal?.id,
      name: prodName,
      price: prodPrice,
      durationDays: prodDuration,
      categoryId: prodCategory,
      imageUrl: prodImage,
      rules: prodRules,
      usageGuide: prodGuide,
      otpEnabled: prodOtp,
      lineOaUrl: prodLineOa || undefined,
      isActive: editProductModal ? editProductModal.isActive : true,
    });
    setProdLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert('บันทึกสินค้าไม่สำเร็จ');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsSaved(false);

    const res = await updateStoreSettingsAction(settingsForm);
    setSettingsLoading(false);

    if (res.success) {
      setSettings(res.settings);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } else {
      alert('บันทึกการตั้งค่าไม่สำเร็จ');
    }
  };

  const handleApproveSlip = async (txId: string, approved: boolean) => {
    const res = await approveManualTopupAction(txId, approved);
    if (res.success) {
      setTopups(
        topups.map((t) =>
          t.id === txId ? { ...t, status: approved ? 'SUCCESS' : 'REJECTED', verifiedBy: 'ADMIN_MANUAL' } : t
        )
      );
    } else {
      alert(res.error || 'ไม่สามารถดำเนินการได้');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DCCF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#5D4037] flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-[#FFB4A2]" />
            <span>หลังบ้านผู้ดูแลระบบ (Admin Center)</span>
          </h1>
          <p className="text-xs text-[#8D6E63] font-medium">
            จัดการยอดขาย สต็อกบัญชี สมาชิก สลิป Slip2Go และการตั้งค่าร้านค้าทั้งหมด
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#FFB4A2] text-white shadow-xs'
                  : 'bg-white text-[#6D4C41] border border-[#E8DCCF] hover:border-[#FFCDB2]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Sales Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="miki-card p-5 bg-[#FFF8F3] border-[#FFD9CE] space-y-1">
              <span className="text-xs font-bold text-[#8D6E63]">ยอดขายวันนี้</span>
              <div className="text-2xl font-black text-[#E5989B]">
                {stats.sales.daily.amount.toLocaleString()} ฿
              </div>
              <span className="text-[11px] text-[#6D4C41] font-medium">
                {stats.sales.daily.count} คำสั่งซื้อ
              </span>
            </div>

            <div className="miki-card p-5 bg-white border-[#E8DCCF] space-y-1">
              <span className="text-xs font-bold text-[#8D6E63]">ยอดขายเดือนนี้</span>
              <div className="text-2xl font-black text-[#5D4037]">
                {stats.sales.monthly.amount.toLocaleString()} ฿
              </div>
              <span className="text-[11px] text-[#8D6E63] font-medium">
                {stats.sales.monthly.count} คำสั่งซื้อ
              </span>
            </div>

            <div className="miki-card p-5 bg-white border-[#E8DCCF] space-y-1">
              <span className="text-xs font-bold text-[#8D6E63]">ยอดขายปีนี้</span>
              <div className="text-2xl font-black text-[#5D4037]">
                {stats.sales.yearly.amount.toLocaleString()} ฿
              </div>
              <span className="text-[11px] text-[#8D6E63] font-medium">
                {stats.sales.yearly.count} คำสั่งซื้อ
              </span>
            </div>

            <div className="miki-card p-5 bg-[#ECFDF5] border-[#A7F3D0] space-y-1">
              <span className="text-xs font-bold text-[#059669]">ยอดเติมเครดิตสะสม</span>
              <div className="text-2xl font-black text-[#059669]">
                {stats.sales.totalTopup.toLocaleString()} ฿
              </div>
              <span className="text-[11px] text-[#059669]/80 font-medium">
                ผ่าน Slip2Go และแอดมิน
              </span>
            </div>
          </div>

          {/* Subscriptions Monitor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="miki-card p-4 bg-white border-[#E8DCCF] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#8D6E63] font-bold">บัญชีกำลังใช้งาน (Active)</p>
                <p className="text-xl font-black text-[#059669]">{stats.subscriptions.active} บัญชี</p>
              </div>
              <Clock className="w-7 h-7 text-[#059669]/30" />
            </div>

            <div className="miki-card p-4 bg-[#FFFDF5] border-[#FDE68A] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#D97706] font-bold">ใกล้หมดอายุใน 24 ชม.</p>
                <p className="text-xl font-black text-[#D97706]">{stats.subscriptions.expiringSoon} บัญชี</p>
              </div>
              <AlertTriangle className="w-7 h-7 text-[#D97706]/30" />
            </div>

            <div className="miki-card p-4 bg-[#FFF1F2] border-[#FECDD3] flex items-center justify-between">
              <div>
                <p className="text-xs text-[#E11D48] font-bold">คิวรอเปลี่ยนรหัส (Servicing)</p>
                <p className="text-xl font-black text-[#E11D48]">{stats.subscriptions.servicingQueue} บัญชี</p>
              </div>
              <RotateCcw className="w-7 h-7 text-[#E11D48]/30" />
            </div>
          </div>

          {/* Bestselling Products */}
          <div className="miki-card p-6 bg-white border-[#E8DCCF] space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-[#5D4037] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FFB4A2]" />
              <span>สินค้าขายดีที่สุด (Top Bestsellers)</span>
            </h3>
            <div className="divide-y divide-[#E8DCCF]/60">
              {stats.bestsellers.map((item: any, idx: number) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-[#5D4037] text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#8D6E63]">{item.price} บาท</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE]">
                      ขายแล้ว {item.orderCount} ครั้ง
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ORDERS & STOCK CUT HISTORY */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#5D4037]">ประวัติการตัดสต็อก & รายการคำสั่งซื้อ</h2>
              <p className="text-xs text-[#8D6E63]">
                ตรวจสอบบัญชีที่ถูกตัดให้ลูกค้า ดูอีเมล รหัสผ่าน จอที่ได้รับ และผู้ซื้อทั้งหมด
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE]">
              ทั้งหมด {orders.length} รายการ
            </span>
          </div>

          <div className="miki-card p-6 bg-white border border-[#E8DCCF] overflow-x-auto">
            {orders.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8DCCF] text-[#8D6E63] font-bold">
                    <th className="pb-3">เลขออเดอร์</th>
                    <th className="pb-3">สินค้า</th>
                    <th className="pb-3">ผู้ซื้อ</th>
                    <th className="pb-3">จอ / PIN</th>
                    <th className="pb-3">อีเมลบัญชี</th>
                    <th className="pb-3">รหัสผ่าน</th>
                    <th className="pb-3">วันที่ซื้อ / หมดอายุ</th>
                    <th className="pb-3 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCF]/50 font-medium">
                  {orders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#FFFDF7] transition-colors">
                      <td className="py-3 font-mono font-bold text-[#5D4037]">{ord.orderNumber}</td>
                      <td className="py-3 font-bold text-[#5D4037]">{ord.productName}</td>
                      <td className="py-3">
                        <span className="font-bold text-[#6D4C41]">@{ord.buyerUsername}</span>
                        {ord.buyerProfileName && (
                          <span className="block text-[11px] text-[#8D6E63]">{ord.buyerProfileName}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
                          {ord.slotName}
                        </span>
                        {ord.slotPin && (
                          <span className="block text-[10px] text-[#8D6E63] font-mono mt-0.5">PIN: {ord.slotPin}</span>
                        )}
                      </td>
                      <td className="py-3 font-mono font-bold text-[#5D4037] select-all">{ord.email}</td>
                      <td className="py-3 font-mono font-bold text-[#E5989B] select-all">{ord.password}</td>
                      <td className="py-3 text-[11px] text-[#8D6E63]">
                        <div>ซื้อ: {new Date(ord.purchasedAt).toLocaleDateString('th-TH')}</div>
                        <div>หมด: {new Date(ord.expiresAt).toLocaleDateString('th-TH')}</div>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            ord.status === 'ACTIVE'
                              ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                              : 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-[#8D6E63] space-y-2">
                <p className="font-bold text-sm">ยังไม่มีรายการสั่งซื้อและตัดสต็อกในระบบ</p>
                <p className="text-xs">เมื่อลูกค้าหรือตัวแทนกดรับบัญชี ข้อมูลการตัดสต็อกจะปรากฏที่นี่</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: STOCKS & SERVICING QUEUE */}
      {activeTab === 'STOCKS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#5D4037]">จัดการสต็อกบัญชีและสิทธิ์</h2>
              <p className="text-xs text-[#8D6E63]">
                เพิ่มบัญชีใหม่ แยกจอ/โปรไฟล์ และนำบัญชีที่หมดอายุกลับเข้าสต็อกหลังเปลี่ยนรหัสผ่าน
              </p>
            </div>
            <button
              onClick={() => setNewStockModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มบัญชีเข้าสต็อก</span>
            </button>
          </div>

          {/* Servicing Queue Alert Box */}
          {stocks.filter((s) => s.status === 'SERVICING').length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] space-y-2">
              <p className="font-extrabold text-sm text-[#E11D48] flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                มีบัญชีที่หมดอายุแล้ว รอนำกลับเข้าสต็อก (Servicing Queue)
              </p>
              <p className="text-xs text-[#6D4C41]">
                ขั้นตอน: แอดมินเข้าไปเปลี่ยนรหัสผ่านในแอปจริง (เช่น Netflix) จากนั้นกดปุ่ม "เปลี่ยนรหัสและ Recycle" เพื่อกรอกรหัสใหม่และเปิดขายต่อทันที
              </p>
            </div>
          )}

          {/* Stocks Table */}
          <div className="space-y-4">
            {stocks.map((stock) => {
              const isServicing = stock.status === 'SERVICING';

              return (
                <div
                  key={stock.id}
                  className={`miki-card p-5 bg-white space-y-3 border ${
                    isServicing ? 'border-[#FFCDB2] bg-[#FFFBFB]' : 'border-[#E8DCCF]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCCF] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#5D4037]">{stock.productName}</span>
                        {isServicing ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                            รอเปลี่ยนรหัส (SERVICING)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                            พร้อมขาย ({stock.slots.filter((sl: any) => sl.status === 'AVAILABLE').length}/{stock.totalSlots} สิทธิ์)
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-[#8D6E63] mt-0.5">
                        อีเมล: <span className="font-bold text-[#5D4037]">{stock.email}</span>
                        {stock.notes && ` • หมายเหตุ: ${stock.notes}`}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setRecycleStock(stock);
                        setRecycleNewPassword('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFEFE8]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>เปลี่ยนรหัส & Recycle</span>
                    </button>
                  </div>

                  {/* Profile Slots List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                    {stock.slots.map((slot: any) => (
                      <div
                        key={slot.id}
                        className={`p-2.5 rounded-xl border text-xs font-medium ${
                          slot.status === 'AVAILABLE'
                            ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
                            : slot.status === 'ASSIGNED'
                            ? 'bg-[#FDFBF7] border-[#FFD9CE] text-[#6D4C41]'
                            : 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{slot.slotName}</span>
                          <span className="text-[10px] uppercase">{slot.status}</span>
                        </div>
                        {slot.slotPin && (
                          <div className="text-[10px] text-[#8D6E63] mt-0.5">PIN: {slot.slotPin}</div>
                        )}
                        {slot.assignedUser && (
                          <div className="text-[10px] text-[#8D6E63] mt-0.5 truncate">
                            ผู้ซื้อ: @{slot.assignedUser} ({slot.orderNumber})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCTS & CATEGORIES */}
      {activeTab === 'PRODUCTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#5D4037]">จัดการสินค้าและหมวดหมู่</h2>
              <p className="text-xs text-[#8D6E63]">เปิด–ปิดการขาย แก้ไขราคา กฎ และวิธีใช้งาน</p>
            </div>
            <button
              onClick={() => {
                setEditProductModal({ isNew: true });
                setProdName('');
                setProdPrice(89);
                setProdDuration(30);
                setProdImage('');
                setProdRules('');
                setProdGuide('');
                setProdOtp(false);
                setProdLineOa('');
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างสินค้าใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="miki-card p-4 bg-white border border-[#E8DCCF] space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E8DCCF] flex-shrink-0 bg-[#FFF5F7]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#5D4037] leading-snug">{p.name}</h3>
                    <p className="text-xs text-[#8D6E63]">{p.category?.name} • {p.durationDays} วัน</p>
                    <p className="text-sm font-black text-[#E5989B] mt-1">{p.price} ฿</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCF]">
                  <button
                    onClick={() => handleToggleProduct(p.id, p.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      p.isActive
                        ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                        : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                    }`}
                  >
                    {p.isActive ? 'เปิดขาย (Active)' : 'ปิดขาย (Disabled)'}
                  </button>

                  <button
                    onClick={() => {
                      setEditProductModal(p);
                      setProdName(p.name);
                      setProdPrice(p.price);
                      setProdDuration(p.durationDays);
                      setProdCategory(p.categoryId);
                      setProdImage(p.imageUrl);
                      setProdRules(p.rules);
                      setProdGuide(p.usageGuide);
                      setProdOtp(p.otpEnabled);
                      setProdLineOa(p.lineOaUrl || '');
                    }}
                    className="text-xs font-bold text-[#FFB4A2] hover:underline"
                  >
                    แก้ไขรายละเอียด
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & CREDIT ADJUSTMENT */}
      {activeTab === 'USERS' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#5D4037]">จัดการสมาชิกและเครดิต</h2>
            <p className="text-xs text-[#8D6E63]">
              ปรับเพิ่ม/หักเครดิตตัวแทน พร้อมระบบบันทึกเหตุผลใน Audit Log
            </p>
          </div>

          <div className="miki-card p-6 bg-white border border-[#E8DCCF] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[#8D6E63] font-bold">
                  <th className="pb-3">ชื่อผู้ใช้ / โปรไฟล์</th>
                  <th className="pb-3">สิทธิ์</th>
                  <th className="pb-3">ช่องทางขาย</th>
                  <th className="pb-3">เครดิตคงเหลือ</th>
                  <th className="pb-3">จำนวนออเดอร์</th>
                  <th className="pb-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/60">
                {users.map((u) => (
                  <tr key={u.id} className="font-medium text-[#5D4037]">
                    <td className="py-3">
                      <div className="font-bold text-sm">{u.profileName || u.username}</div>
                      <div className="text-[11px] text-[#8D6E63]">@{u.username}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-[#6D4C41]">{u.salesChannel || '-'}</td>
                    <td className="py-3 font-black text-[#E5989B] text-sm">
                      {u.creditBalance.toLocaleString()} ฿
                    </td>
                    <td className="py-3 font-bold">{u._count.orders} รายการ</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setCreditModalUser(u);
                          setCreditType('ADD');
                          setCreditAmount(100);
                          setCreditReason('');
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFEFE8]"
                      >
                        เติม / หักเครดิต
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SLIPS */}
      {activeTab === 'SLIPS' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#5D4037]">ตรวจสอบสลิปและผลตรวจ Slip2Go</h2>
            <p className="text-xs text-[#8D6E63]">
              รายการสลิปที่ตรวจผ่าน Slip2Go API และรายการที่ต้องอนุมัติด้วยตนเอง
            </p>
          </div>

          <div className="miki-card p-6 bg-white border border-[#E8DCCF] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCF] text-[#8D6E63] font-bold">
                  <th className="pb-3">รหัสธุรกรรม</th>
                  <th className="pb-3">ผู้ใช้งาน</th>
                  <th className="pb-3">ยอดเงิน</th>
                  <th className="pb-3">รหัสอ้างอิง (transRef)</th>
                  <th className="pb-3">ระบบตรวจ</th>
                  <th className="pb-3">สถานะ</th>
                  <th className="pb-3">เวลา</th>
                  <th className="pb-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCF]/60">
                {topups.map((t) => (
                  <tr key={t.id} className="font-medium text-[#5D4037]">
                    <td className="py-3 font-mono">{t.txNumber}</td>
                    <td className="py-3 font-bold">@{t.user?.username}</td>
                    <td className="py-3 font-black text-[#059669]">+{t.amount.toLocaleString()} ฿</td>
                    <td className="py-3 font-mono text-[11px] text-[#8D6E63]">{t.transRef || '-'}</td>
                    <td className="py-3 font-bold text-[11px] text-[#FFB4A2]">{t.verifiedBy}</td>
                    <td className="py-3">
                      {t.status === 'SUCCESS' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                          สำเร็จ
                        </span>
                      )}
                      {t.status === 'PENDING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                          รอตรวจสอบ
                        </span>
                      )}
                      {t.status === 'REJECTED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                          ปฏิเสธ
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-[#8D6E63]">{new Date(t.createdAt).toLocaleString('th-TH')}</td>
                    <td className="py-3 text-right">
                      {t.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveSlip(t.id, true)}
                            className="p-1.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"
                            title="อนุมัติ"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApproveSlip(t.id, false)}
                            className="p-1.5 rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]"
                            title="ปฏิเสธ"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: STORE SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <form onSubmit={handleSaveSettings} className="miki-card p-6 bg-white border border-[#E8DCCF] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
            <div>
              <h2 className="text-lg font-black text-[#5D4037]">ตั้งค่าข้อมูลร้านค้าและการเงิน</h2>
              <p className="text-xs text-[#8D6E63]">ปรับแต่งปก ข้อความประกาศ ช่องทางรับเงิน และ Slip2Go</p>
            </div>
            {settingsSaved && (
              <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                บันทึกเรียบร้อยแล้ว!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Storefront Info */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ชื่อร้านค้าหน้าร้าน</label>
              <input
                type="text"
                value={settingsForm.storeName}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                className="w-full miki-input text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ป้ายแท็กสโลแกน (เช่น 森のベーカリー)</label>
              <input
                type="text"
                value={settingsForm.storeTag}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeTag: e.target.value })}
                className="w-full miki-input text-xs"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#5D4037]">คำอธิบายร้านค้าหน้าร้าน (Subtitle)</label>
              <input
                type="text"
                value={settingsForm.storeSubtitle}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeSubtitle: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="แอปพรีเมียมราคาส่ง จัดส่งอัตโนมัติ 24 ชม..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ลิงก์ภาพหน้าปก (Banner URL)</label>
              <input
                type="text"
                value={settingsForm.bannerUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ลิงก์โลโก้ร้าน (Logo URL)</label>
              <input
                type="text"
                value={settingsForm.logoUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="https://..."
              />
            </div>

            {/* Mascot Settings */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ลิงก์ภาพมาสคอต PNG เต็มตัว (Mascot URL)</label>
              <input
                type="text"
                value={settingsForm.mascotUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, mascotUrl: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="https://... (ภาพ PNG โปร่งใส ไม่ต้องเป็นวงกลม)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ข้อความคำพูดมาสคอต (บับเบิลพิมพ์)</label>
              <input
                type="text"
                value={settingsForm.mascotGreeting}
                onChange={(e) => setSettingsForm({ ...settingsForm, mascotGreeting: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="ยินดีต้อนรับสู่ Miki App Store นะคะ!..."
              />
            </div>

            {/* Store Open / Closed Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">สถานะเปิด–ปิดร้าน</label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSettingsForm({ ...settingsForm, isOpen: !settingsForm.isOpen })}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
                    settingsForm.isOpen
                      ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                      : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                  }`}
                >
                  {settingsForm.isOpen ? 'เปิดให้บริการ (Open)' : 'ปิดร้านค้าชั่วคราว (Closed)'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ข้อความแจ้งเตือนเมื่อร้านปิด</label>
              <input
                type="text"
                value={settingsForm.closedNotice}
                onChange={(e) => setSettingsForm({ ...settingsForm, closedNotice: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="ร้านปิดปรับปรุงชั่วคราว..."
              />
            </div>

            {/* Contact Channels */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">LINE Official Account หรือ LINE ID</label>
              <input
                type="text"
                value={settingsForm.contactLine}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactLine: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="@mikistore หรือ ลิงก์ LINE"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">Facebook Page</label>
              <input
                type="text"
                value={settingsForm.contactFacebook}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactFacebook: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="ชื่อเพจ หรือ ลิงก์ Facebook"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">Instagram</label>
              <input
                type="text"
                value={settingsForm.contactInstagram}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactInstagram: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="ชื่อไอจี หรือ ลิงก์ Instagram"
              />
            </div>

            {/* Bank Info & Payment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ชื่อธนาคาร</label>
              <input
                type="text"
                value={settingsForm.bankName}
                onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                className="w-full miki-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">ชื่อบัญชีธนาคาร</label>
              <input
                type="text"
                value={settingsForm.bankAccountName}
                onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountName: e.target.value })}
                className="w-full miki-input text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">เลขที่บัญชี</label>
              <input
                type="text"
                value={settingsForm.bankAccountNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, bankAccountNumber: e.target.value })}
                className="w-full miki-input text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">เบอร์พร้อมเพย์ / วอลเล็ท (สแกนจ่ายได้จริง)</label>
              <input
                type="text"
                value={settingsForm.promptPayNumber}
                onChange={(e) => setSettingsForm({ ...settingsForm, promptPayNumber: e.target.value })}
                className="w-full miki-input text-xs font-mono font-bold"
                placeholder="0899999999 หรือ เลขบัตร 13 หลัก"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-[#5D4037]">
                ลิงก์รูปภาพ QR บัญชีธนาคารปกติ (Bank QR URL สำหรับการ์ดกดพลิก)
              </label>
              <input
                type="text"
                value={settingsForm.bankQrUrl}
                onChange={(e) => setSettingsForm({ ...settingsForm, bankQrUrl: e.target.value })}
                className="w-full miki-input text-xs"
                placeholder="https://... (ภาพ QR บัญชีที่ผู้ซื้อกดพลิกดูได้)"
              />
            </div>

            {/* Slip2Go Keys */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">Slip2Go API Key</label>
              <input
                type="password"
                value={settingsForm.slip2goApiKey}
                onChange={(e) => setSettingsForm({ ...settingsForm, slip2goApiKey: e.target.value })}
                placeholder="เว้นว่างไว้หากใช้ระบบ Simulator"
                className="w-full miki-input text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5D4037]">Slip2Go Secret Key</label>
              <input
                type="password"
                value={settingsForm.slip2goSecretKey}
                onChange={(e) => setSettingsForm({ ...settingsForm, slip2goSecretKey: e.target.value })}
                placeholder="เว้นว่างไว้หากใช้ระบบ Simulator"
                className="w-full miki-input text-xs font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={settingsLoading}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
          >
            {settingsLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าร้านค้า'}
          </button>
        </form>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="miki-card p-6 bg-white border border-[#E8DCCF] space-y-4">
          <h2 className="text-lg font-black text-[#5D4037]">ประวัติการแก้ไขข้อมูลของแอดมิน (Audit Logs)</h2>
          <div className="divide-y divide-[#E8DCCF]/60 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between text-[#8D6E63]">
                  <span className="font-bold text-[#E5989B] font-mono px-2 py-0.5 bg-[#FFF8F3] rounded-md">
                    {log.action}
                  </span>
                  <span>{new Date(log.createdAt).toLocaleString('th-TH')}</span>
                </div>
                <p className="text-[#6D4C41] font-medium">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADJUST USER CREDIT */}
      {creditModalUser && (() => {
        const delta = creditType === 'ADD' ? Math.abs(creditAmount) : -Math.abs(creditAmount);
        const projectedBalance = Math.max(0, creditModalUser.creditBalance + delta);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/30 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] p-6 space-y-4">
              <h3 className="font-extrabold text-base text-[#5D4037]">
                ปรับเครดิตให้: @{creditModalUser.username}
              </h3>

              {/* Type Switcher: ADD or DEDUCT */}
              <div className="grid grid-cols-2 gap-2 bg-[#F5EBE1] p-1 rounded-full">
                <button
                  type="button"
                  onClick={() => setCreditType('ADD')}
                  className={`py-2 rounded-full text-xs font-bold transition-all ${
                    creditType === 'ADD'
                      ? 'bg-[#E8F5E9] text-[#2E7D32] shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  + เพิ่มเครดิต
                </button>
                <button
                  type="button"
                  onClick={() => setCreditType('DEDUCT')}
                  className={`py-2 rounded-full text-xs font-bold transition-all ${
                    creditType === 'DEDUCT'
                      ? 'bg-[#FFF0EB] text-[#D84315] shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  - ลด / หักเครดิต
                </button>
              </div>

              {/* Live Calculation Preview Card */}
              <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FFD9CE] space-y-1.5 text-xs">
                <div className="flex justify-between text-[#8D6E63]">
                  <span>เครดิตปัจจุบัน:</span>
                  <span className="font-bold">{creditModalUser.creditBalance.toLocaleString()} ฿</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>ยอดที่ปรับ:</span>
                  <span className={creditType === 'ADD' ? 'text-[#2E7D32]' : 'text-[#D84315]'}>
                    {creditType === 'ADD' ? '+' : '-'}{Math.abs(creditAmount).toLocaleString()} ฿
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#E8DCCF] pt-1.5 font-black text-sm text-[#5D4037]">
                  <span>คงเหลือหลังปรับ:</span>
                  <span className="text-[#E5989B]">{projectedBalance.toLocaleString()} ฿</span>
                </div>
              </div>

              <form onSubmit={handleAdjustCredit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">
                    จำนวนเงิน (บาท) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Math.abs(parseFloat(e.target.value) || 0))}
                    className="w-full miki-input text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">เหตุผลการปรับ (จำเป็นเพื่อ Audit Log) *</label>
                  <textarea
                    rows={2}
                    required
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="เช่น เติมเงินมือถือตกหล่น, ปรับลดเนื่องจากยกเลิกคำสั่งซื้อ..."
                    className="w-full miki-input text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={creditLoading}
                    className={`flex-1 py-2.5 rounded-full text-xs font-bold text-white shadow-xs transition-all ${
                      creditType === 'ADD'
                        ? 'bg-[#2E7D32] hover:bg-[#1B5E20]'
                        : 'bg-[#D84315] hover:bg-[#BF360C]'
                    }`}
                  >
                    {creditLoading ? 'กำลังบันทึก...' : `ยืนยัน${creditType === 'ADD' ? 'เพิ่ม' : 'หัก'}เครดิต`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditModalUser(null)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* MODAL: RECYCLE EXPIRED ACCOUNT */}
      {recycleStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-[#FFB4A2]" />
              <span>นำบัญชีกลับเข้าสต็อก (Recycle)</span>
            </h3>
            <p className="text-xs text-[#8D6E63]">
              บัญชี: <span className="font-bold text-[#5D4037]">{recycleStock.email}</span> ({recycleStock.productName})
            </p>

            <form onSubmit={handleRecycleAccount} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">
                  รหัสผ่านใหม่ (ที่แอดมินเปลี่ยนในแอปจริงแล้ว) *
                </label>
                <input
                  type="text"
                  required
                  value={recycleNewPassword}
                  onChange={(e) => setRecycleNewPassword(e.target.value)}
                  placeholder="ระบุรหัสผ่านใหม่..."
                  className="w-full miki-input text-xs font-mono font-bold"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] text-[11px] text-[#6D4C41]">
                เมื่อกดยืนยัน ระบบจะเข้ารหัสผ่านใหม่ด้วย AES-256-GCM และรีเซ็ตสถานะจอทั้งหมดให้กลับมาเป็นพร้อมขาย (AVAILABLE) อัตโนมัติ
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={recycleLoading}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                >
                  {recycleLoading ? 'กำลังอัปเดต...' : 'ยืนยันและนำเข้าสต็อก'}
                </button>
                <button
                  type="button"
                  onClick={() => setRecycleStock(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW STOCK ACCOUNT */}
      {newStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/30 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#FFB4A2]" />
              <span>เพิ่มสต็อกบัญชีใหม่ (เข้ารหัส AES-256-GCM)</span>
            </h3>

            <form onSubmit={handleCreateStock} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">เลือกสินค้า</label>
                <select
                  value={newStockProduct}
                  onChange={(e) => setNewStockProduct(e.target.value)}
                  className="w-full miki-input text-xs font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">อีเมลบัญชี *</label>
                  <input
                    type="email"
                    required
                    value={newStockEmail}
                    onChange={(e) => setNewStockEmail(e.target.value)}
                    className="w-full miki-input text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">รหัสผ่าน *</label>
                  <input
                    type="text"
                    required
                    value={newStockPassword}
                    onChange={(e) => setNewStockPassword(e.target.value)}
                    className="w-full miki-input text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">
                  จำนวนจอ / สิทธิ์ที่ขายได้ (เช่น Netflix = 4, เมลเดี่ยว = 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={newStockSlotCount}
                  onChange={(e) => setNewStockSlotCount(parseInt(e.target.value) || 1)}
                  className="w-full miki-input text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">หมายเหตุช่วยจำ (แอดมินเห็นเท่านั้น)</label>
                <input
                  type="text"
                  value={newStockNotes}
                  onChange={(e) => setNewStockNotes(e.target.value)}
                  placeholder="เช่น Family เมลหลัก ตัดรอบวันที่ 10"
                  className="w-full miki-input text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={newStockLoading}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                >
                  {newStockLoading ? 'กำลังบันทึก...' : 'บันทึกเข้าสต็อก'}
                </button>
                <button
                  type="button"
                  onClick={() => setNewStockModal(false)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#5D4037]/30 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8DCCF] shadow-[0_16px_40px_rgba(141,110,99,0.25)] p-6 space-y-4 my-8">
            <h3 className="font-extrabold text-base text-[#5D4037]">
              {editProductModal.isNew ? 'เพิ่มสินค้าใหม่' : `แก้ไขสินค้า: ${editProductModal.name}`}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full miki-input text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ราคา (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(parseFloat(e.target.value) || 0)}
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">อายุการใช้งาน (วัน) *</label>
                  <input
                    type="number"
                    required
                    value={prodDuration}
                    onChange={(e) => setProdDuration(parseInt(e.target.value) || 30)}
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">หมวดหมู่</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full miki-input text-xs font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">รูปภาพสินค้า (URL) *</label>
                <input
                  type="url"
                  required
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full miki-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">กฎระเบียบการใช้งาน</label>
                <textarea
                  rows={2}
                  value={prodRules}
                  onChange={(e) => setProdRules(e.target.value)}
                  className="w-full miki-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">วิธีเข้าใช้งาน (คู่มือ)</label>
                <textarea
                  rows={2}
                  value={prodGuide}
                  onChange={(e) => setProdGuide(e.target.value)}
                  className="w-full miki-input text-xs"
                />
              </div>

              {/* OTP Options */}
              <div className="p-3 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[#5D4037]">
                  <input
                    type="checkbox"
                    checked={prodOtp}
                    onChange={(e) => setProdOtp(e.target.checked)}
                    className="rounded text-[#FFB4A2]"
                  />
                  <span>เปิดใช้งานปุ่มขอรหัส OTP ผ่าน LINE Official Account</span>
                </label>

                {prodOtp && (
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-[#8D6E63]">ลิงก์ LINE Official Account</label>
                    <input
                      type="url"
                      value={prodLineOa}
                      onChange={(e) => setProdLineOa(e.target.value)}
                      placeholder="https://line.me/R/ti/p/@miki.store"
                      className="w-full miki-input text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={prodLoading}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                >
                  {prodLoading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProductModal(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
