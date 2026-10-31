'use client';

import React, { useState, useEffect } from 'react';
import {
  getAdminDashboardStats,
  getAdminStocks,
  getAdminProducts,
  getAdminUsers,
  getAdminTopupTransactions,
  getAdminAuditLogs,
  getAdminOrders,
  getBankAccounts,
  getStoreContacts,
  getAdminMusicTracks,
  adjustUserCreditAction,
  addStockAccountAction,
  updateStockAccountAction,
  updateStockSlotsAction,
  recycleStockAccountAction,
  toggleProductActiveAction,
  toggleProductBestsellerAction,
  saveProductAction,
  updateStoreSettingsAction,
  approveManualTopupAction,
  saveStoreContactAction,
  deleteStoreContactAction,
  saveBankAccountAction,
  deleteBankAccountAction,
  toggleBankAccountAction,
  deleteStockAccountAction,
  deleteProductAction,
  deleteAdminOrderAction,
  saveMusicTrackAction,
  deleteMusicTrackAction,
  toggleMusicTrackAction,
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
  Building,
  Calendar,
  Edit3,
  Trash2,
  ExternalLink,
  Monitor,
  Tv,
  Smartphone,
  Music,
  Disc3,
  Play,
  Pause,
  Volume2,
  Video,
  Search,
  Flame,
  Copy,
} from 'lucide-react';
import { BakeryLoadingModal } from '@/components/BakeryLoadingModal';
import { isYouTubeUrl, extractYouTubeVideoId } from '@/lib/youtube';

interface AdminClientProps {
  initialStats: any;
  initialStocks?: any[];
  initialProducts?: any[];
  initialUsers?: any[];
  initialTopups?: any[];
  initialSettings: any;
  initialAuditLogs?: any[];
  categories: any[];
  initialOrders?: any[];
  initialBankAccounts?: any[];
  initialContacts?: any[];
  initialMusicTracks?: any[];
}

export function AdminClient({
  initialStats,
  initialStocks = [],
  initialProducts = [],
  initialUsers = [],
  initialTopups = [],
  initialSettings,
  initialAuditLogs = [],
  categories,
  initialOrders = [],
  initialBankAccounts = [],
  initialContacts = [],
  initialMusicTracks = [],
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<
    'DASHBOARD' | 'ORDERS' | 'STOCKS' | 'PRODUCTS' | 'USERS' | 'SLIPS' | 'BANK_ACCOUNTS' | 'MUSIC' | 'SETTINGS' | 'LOGS'
  >('DASHBOARD');

  const [stats, setStats] = useState(initialStats);
  const [stocks, setStocks] = useState(initialStocks);
  const [orders, setOrders] = useState(initialOrders);
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(initialUsers);
  const [topups, setTopups] = useState(initialTopups);
  const [settings, setSettings] = useState(initialSettings);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [contacts, setContacts] = useState(initialContacts);
  const [musicTracks, setMusicTracks] = useState(initialMusicTracks);

  // Lazy tab loading states
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(
    () =>
      new Set([
        'DASHBOARD',
        ...(initialStocks.length > 0 ? ['STOCKS'] : []),
        ...(initialOrders.length > 0 ? ['ORDERS'] : []),
        ...(initialProducts.length > 0 ? ['PRODUCTS'] : []),
        ...(initialUsers.length > 0 ? ['USERS'] : []),
        ...(initialTopups.length > 0 ? ['SLIPS'] : []),
        ...(initialAuditLogs.length > 0 ? ['LOGS'] : []),
        ...(initialBankAccounts.length > 0 ? ['BANK_ACCOUNTS'] : []),
        ...(initialContacts.length > 0 ? ['SETTINGS'] : []),
        ...(initialMusicTracks.length > 0 ? ['MUSIC'] : []),
      ])
  );
  const [tabLoading, setTabLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('กำลังโหลดข้อมูล...');

  // Search & Pagination states
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SERVICING' | 'FULL'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'>('ALL');
  const [visibleStocksCount, setVisibleStocksCount] = useState(10);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
  const [visibleUsersCount, setVisibleUsersCount] = useState(10);
  const [visibleTopupsCount, setVisibleTopupsCount] = useState(10);
  const [visibleLogsCount, setVisibleLogsCount] = useState(15);

  // Dashboard Accounts Quick Modal state
  const [dashboardModalType, setDashboardModalType] = useState<'ACTIVE' | 'EXPIRING_SOON' | 'SERVICING' | null>(null);
  const [dashboardModalSearch, setDashboardModalSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  const formatRemainingTime = (expiresAt: string | Date) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) {
      return { text: 'หมดอายุแล้ว', isExpired: true, isUrgent: true };
    }
    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return {
        text: `เหลืออีก ${days} วัน ${hours} ชม.`,
        isExpired: false,
        isUrgent: days <= 1,
      };
    }
    return {
      text: `เหลืออีก ${hours} ชม. ${minutes} นาที`,
      isExpired: false,
      isUrgent: true,
    };
  };

  const switchDashboardModalType = async (type: 'ACTIVE' | 'EXPIRING_SOON' | 'SERVICING') => {
    setDashboardModalType(type);
    setDashboardModalSearch('');

    if (type === 'SERVICING') {
      if (!loadedTabs.has('STOCKS') || stocks.length === 0) {
        setTabLoading(true);
        setLoadingMessage('กำลังโหลดคลังสต็อกบัญชีและสินค้า...');
        try {
          const [stk, prods] = await Promise.all([
            getAdminStocks(),
            products.length === 0 ? getAdminProducts() : Promise.resolve(products),
          ]);
          setStocks(stk);
          if (products.length === 0) setProducts(prods);
          setLoadedTabs((prev) => new Set(prev).add('STOCKS'));
        } catch (err) {
          console.error(err);
        } finally {
          setTabLoading(false);
        }
      }
    } else {
      if (!loadedTabs.has('ORDERS') || orders.length === 0) {
        setTabLoading(true);
        setLoadingMessage('กำลังโหลดรายการคำสั่งซื้อและการตัดสต็อก...');
        try {
          const ords = await getAdminOrders();
          setOrders(ords);
          setLoadedTabs((prev) => new Set(prev).add('ORDERS'));
        } catch (err) {
          console.error(err);
        } finally {
          setTabLoading(false);
        }
      }
    }
  };

  const handleTabClick = async (tabId: string) => {
    setActiveTab(tabId as any);

    if (loadedTabs.has(tabId)) {
      return;
    }

    setTabLoading(true);
    try {
      if (tabId === 'STOCKS') {
        setLoadingMessage('กำลังโหลดคลังสต็อกบัญชีและสินค้า...');
        const [stk, prods] = await Promise.all([
          getAdminStocks(),
          products.length === 0 ? getAdminProducts() : Promise.resolve(products),
        ]);
        setStocks(stk);
        if (products.length === 0) setProducts(prods);
      } else if (tabId === 'ORDERS') {
        setLoadingMessage('กำลังโหลดรายการคำสั่งซื้อและการตัดสต็อก...');
        const ords = await getAdminOrders();
        setOrders(ords);
      } else if (tabId === 'PRODUCTS') {
        setLoadingMessage('กำลังโหลดรายการสินค้าและหมวดหมู่...');
        const prods = await getAdminProducts();
        setProducts(prods);
      } else if (tabId === 'USERS') {
        setLoadingMessage('กำลังโหลดรายชื่อสมาชิกและเครดิต...');
        const usrs = await getAdminUsers();
        setUsers(usrs);
      } else if (tabId === 'SLIPS') {
        setLoadingMessage('กำลังโหลดรายการตรวจสอบสลิป...');
        const tps = await getAdminTopupTransactions();
        setTopups(tps);
      } else if (tabId === 'BANK_ACCOUNTS') {
        setLoadingMessage('กำลังโหลดบัญชีธนาคาร...');
        const bks = await getBankAccounts();
        setBankAccounts(bks);
      } else if (tabId === 'MUSIC') {
        setLoadingMessage('กำลังโหลดเพลย์ลิสต์เพลงคาเฟ่...');
        const msc = await getAdminMusicTracks();
        setMusicTracks(msc);
      } else if (tabId === 'SETTINGS') {
        setLoadingMessage('กำลังโหลดข้อมูลช่องทางติดต่อร้าน...');
        const cts = await getStoreContacts();
        setContacts(cts);
      } else if (tabId === 'LOGS') {
        setLoadingMessage('กำลังโหลดบันทึกประวัติ Audit Logs...');
        const lgs = await getAdminAuditLogs();
        setAuditLogs(lgs);
      }
      setLoadedTabs((prev) => new Set(prev).add(tabId));
    } catch (err) {
      console.error('Failed to load tab:', err);
    } finally {
      setTabLoading(false);
    }
  };


  // Modals & form states
  const [creditModalUser, setCreditModalUser] = useState<any | null>(null);
  const [creditType, setCreditType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [creditAmount, setCreditAmount] = useState<number>(100);
  const [creditReason, setCreditReason] = useState<string>('');
  const [creditLoading, setCreditLoading] = useState(false);

  const [recycleStock, setRecycleStock] = useState<any | null>(null);
  const [recycleNewPassword, setRecycleNewPassword] = useState<string>('');
  const [recycleLoading, setRecycleLoading] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [newStockModal, setNewStockModal] = useState(false);
  const [newStockProduct, setNewStockProduct] = useState(products[0]?.id || '');

  useEffect(() => {
    if (!newStockProduct && products.length > 0) {
      setNewStockProduct(products[0].id);
    }
  }, [products, newStockProduct]);
  const [newStockEmail, setNewStockEmail] = useState('');
  const [newStockPassword, setNewStockPassword] = useState('');
  const [newStockNotes, setNewStockNotes] = useState('');
  const [newStockSlotCount, setNewStockSlotCount] = useState<number | string>(1);
  const [newStockRegisteredAt, setNewStockRegisteredAt] = useState<string>(todayStr);
  const [newStockBillingDate, setNewStockBillingDate] = useState<string>(nextMonthStr);
  const [newStockPaymentMethod, setNewStockPaymentMethod] = useState<string>('TrueMoney Wallet');
  const [newStockAutoRenew, setNewStockAutoRenew] = useState<boolean>(true);
  const [newStockLoading, setNewStockLoading] = useState(false);
  const [showSlotDetailConfig, setShowSlotDetailConfig] = useState(false);
  const [newStockDefaultDevice, setNewStockDefaultDevice] = useState('MOBILE');

  // Edit stock billing modal
  const [editBillingStock, setEditBillingStock] = useState<any | null>(null);
  const [editRegisteredAt, setEditRegisteredAt] = useState('');
  const [editBillingDate, setEditBillingDate] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('TrueMoney Wallet');
  const [editAutoRenew, setEditAutoRenew] = useState(true);
  const [editStockNotes, setEditStockNotes] = useState('');
  const [editBillingLoading, setEditBillingLoading] = useState(false);

  // Slots with custom names, PINs, device type, and status for new stock
  const [newStockSlots, setNewStockSlots] = useState<
    {
      slotName: string;
      slotPin: string;
      deviceType: string;
      productId: string;
      status: string;
    }[]
  >([
    { slotName: 'เต็มจอ / 1 สิทธิ์', slotPin: '', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
  ]);

  // Edit slots & PINs for existing stock modal
  const [editSlotsStock, setEditSlotsStock] = useState<any | null>(null);
  const [editSlotsData, setEditSlotsData] = useState<
    { id: string; slotName: string; slotPin: string; deviceType: string; productId: string; status: string }[]
  >([]);
  const [editSlotsLoading, setEditSlotsLoading] = useState(false);

  const [editProductModal, setEditProductModal] = useState<any | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState<number | string>(89);
  const [prodRetailPrice, setProdRetailPrice] = useState<number | string>(129);
  const [prodDuration, setProdDuration] = useState<number | string>(30);
  const [prodCategory, setProdCategory] = useState(categories[0]?.id || '');
  const [prodImage, setProdImage] = useState('');
  const [prodRules, setProdRules] = useState('');
  const [prodGuide, setProdGuide] = useState('');
  const [prodOtp, setProdOtp] = useState(false);
  const [prodLineOa, setProdLineOa] = useState('');
  const [prodCutoffType, setProdCutoffType] = useState<string>('ROUND_UP_HOUR');
  const [prodHasProfilePin, setProdHasProfilePin] = useState(false);
  const [prodDefaultSlotCount, setProdDefaultSlotCount] = useState<number | string>(1);
  const [prodSharingTypeNote, setProdSharingTypeNote] = useState('');
  const [prodAddonEnabled, setProdAddonEnabled] = useState(false);
  const [prodAddonName, setProdAddonName] = useState('รับประกันเคลม');
  const [prodAddonPrice, setProdAddonPrice] = useState<number | string>(5);
  const [prodIsBestseller, setProdIsBestseller] = useState(false);
  const [prodLoading, setProdLoading] = useState(false);

  // Bank Account Modal
  const [bankModal, setBankModal] = useState<any | null>(null);
  const [bankName, setBankName] = useState('ธนาคารกสิกรไทย');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankPromptPay, setBankPromptPay] = useState('');
  const [bankQrUrl, setBankQrUrl] = useState('');
  const [bankIsPromptPay, setBankIsPromptPay] = useState(false);
  const [bankIsActive, setBankIsActive] = useState(true);
  const [bankLoading, setBankLoading] = useState(false);

  // Store Contact Modal
  const [contactModal, setContactModal] = useState<any | null>(null);
  const [contactTitle, setContactTitle] = useState('LINE Official');
  const [contactUrl, setContactUrl] = useState('');
  const [contactHandle, setContactHandle] = useState('');
  const [contactIcon, setContactIcon] = useState('MessageCircle');
  const [contactLoading, setContactLoading] = useState(false);

  // Music Management Modal & States
  const [musicModal, setMusicModal] = useState<any | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('Miki Cafe Studio');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicIsActive, setMusicIsActive] = useState(true);
  const [musicSortOrder, setMusicSortOrder] = useState(0);
  const [musicLoading, setMusicLoading] = useState(false);
  const [previewTrackId, setPreviewTrackId] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

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
    { id: 'BANK_ACCOUNTS', label: 'บัญชีธนาคาร', icon: Building },
    { id: 'MUSIC', label: 'เพลงคาเฟ่', icon: Music },
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

  const initSlotsForProduct = (prod: any) => {
    if (!prod) return;
    const count = Math.max(1, prod.defaultSlotCount || 1);
    setNewStockSlotCount(count);

    const isTvProduct = prod.name.toLowerCase().includes('tv') || prod.name.includes('ทีวี');
    setNewStockDefaultDevice(isTvProduct ? 'TV' : 'MOBILE');
    setShowSlotDetailConfig(false);

    const slots = [];
    for (let i = 0; i < count; i++) {
      if (count === 1) {
        slots.push({
          slotName: isTvProduct ? 'จอ 1 (ทีวี)' : (prod.hasProfilePin ? 'จอ 1' : 'เต็มจอ / 1 สิทธิ์'),
          slotPin: '',
          deviceType: isTvProduct ? 'TV' : 'MOBILE',
          productId: '',
          status: 'AVAILABLE',
        });
      } else {
        slots.push({
          slotName: isTvProduct ? `จอ ${i + 1} (ทีวี)` : `จอ ${i + 1} (มือถือ/แท็บเล็ต)`,
          slotPin: '',
          deviceType: isTvProduct ? 'TV' : 'MOBILE',
          productId: '',
          status: 'AVAILABLE',
        });
      }
    }
    setNewStockSlots(slots);
  };

  const applySingleSlotPreset = () => {
    const currentProd = products.find((p) => p.id === newStockProduct);
    const isTv = currentProd && (currentProd.name.toLowerCase().includes('tv') || currentProd.name.includes('ทีวี'));
    setNewStockSlotCount(1);
    setNewStockDefaultDevice(isTv ? 'TV' : 'MOBILE');
    setNewStockSlots([
      {
        slotName: isTv ? 'จอ 1 (ทีวี)' : (currentProd?.hasProfilePin ? 'จอ 1' : 'เต็มจอ / 1 สิทธิ์'),
        slotPin: '',
        deviceType: isTv ? 'TV' : 'MOBILE',
        productId: '',
        status: 'AVAILABLE',
      },
    ]);
  };

  const applyTripleMobilePreset = () => {
    setNewStockSlotCount(3);
    setNewStockDefaultDevice('MOBILE');
    setNewStockSlots([
      { slotName: 'จอ 1 (มือถือ/แท็บเล็ต)', slotPin: '', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
      { slotName: 'จอ 2 (มือถือ/แท็บเล็ต)', slotPin: '', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
      { slotName: 'จอ 3 (มือถือ/แท็บเล็ต)', slotPin: '', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
    ]);
  };

  const applyNetflixPreset = () => {
    setNewStockSlotCount(4);
    setShowSlotDetailConfig(true);
    setNewStockDefaultDevice('MOBILE');
    // Find matching TV product if current selected product is a mobile Netflix product
    const currentProd = products.find((p) => p.id === newStockProduct);
    let tvProductId = '';
    if (currentProd && currentProd.name.toLowerCase().includes('netflix')) {
      const is7Day = currentProd.name.includes('7');
      const is1Day = currentProd.name.includes('1');
      const matchingTv = products.find(
        (p) =>
          p.id !== currentProd.id &&
          p.name.toLowerCase().includes('netflix') &&
          p.name.toLowerCase().includes('tv') &&
          ((is7Day && p.name.includes('7')) || (is1Day && p.name.includes('1')))
      );
      if (matchingTv) tvProductId = matchingTv.id;
    }

    setNewStockSlots([
      { slotName: 'จอ 1 (มือถือ/แท็บเล็ต)', slotPin: '1234', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
      { slotName: 'จอ 2 (มือถือ/แท็บเล็ต)', slotPin: '2345', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
      { slotName: 'จอ 3 (มือถือ/แท็บเล็ต)', slotPin: '3456', deviceType: 'MOBILE', productId: '', status: 'AVAILABLE' },
      { slotName: 'จอ 4 (ทีวี/Smart TV)', slotPin: '4567', deviceType: 'TV', productId: tvProductId, status: 'AVAILABLE' },
    ]);
  };

  const handleSlotCountChange = (countVal: number | string) => {
    setNewStockSlotCount(countVal);
    const parsed = parseInt(String(countVal), 10);
    if (isNaN(parsed) || parsed < 1) return;
    const n = Math.min(50, parsed);
    const currentProd = products.find((p) => p.id === newStockProduct);
    const isTvProduct = currentProd && (currentProd.name.toLowerCase().includes('tv') || currentProd.name.includes('ทีวี'));

    setNewStockSlots((prev) => {
      const next = [];
      for (let i = 0; i < n; i++) {
        next.push({
          slotName: prev[i]?.slotName || (n > 1 ? `จอ ${i + 1}` : (isTvProduct ? 'จอ 1 (ทีวี)' : 'เต็มจอ / 1 สิทธิ์')),
          slotPin: prev[i]?.slotPin || '',
          deviceType: prev[i]?.deviceType || (isTvProduct ? 'TV' : newStockDefaultDevice),
          productId: prev[i]?.productId || '',
          status: prev[i]?.status || 'AVAILABLE',
        });
      }
      return next;
    });
  };

  const handleCreateStock = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetProductId = newStockProduct || products[0]?.id;
    if (!targetProductId) {
      alert('ไม่พบสินค้าที่เลือก กรุณาสร้างสินค้าในแท็บ "สินค้า & หมวดหมู่" ก่อนทำการเพิ่มสต็อก');
      return;
    }

    if (!newStockEmail.trim()) {
      alert('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์บัญชี');
      return;
    }

    if (!newStockPassword.trim()) {
      alert('กรุณากรอกรหัสผ่านบัญชี');
      return;
    }

    setNewStockLoading(true);

    const count = Number(newStockSlotCount) || 1;
    const isTv = newStockDefaultDevice === 'TV';

    const slots = showSlotDetailConfig
      ? newStockSlots.map((s, idx) => ({
          slotName: s.slotName.trim() || `จอ ${idx + 1}`,
          slotPin: s.slotPin.trim() || undefined,
          deviceType: s.deviceType || newStockDefaultDevice,
          productId: s.productId.trim() || null,
          status: s.status || 'AVAILABLE',
        }))
      : Array.from({ length: count }, (_, idx) => ({
          slotName: isTv
            ? (count === 1 ? 'จอ 1 (ทีวี)' : `จอ ${idx + 1} (ทีวี)`)
            : (count === 1 ? 'เต็มจอ / 1 สิทธิ์' : `จอ ${idx + 1}`),
          slotPin: undefined,
          deviceType: newStockDefaultDevice,
          productId: null,
          status: 'AVAILABLE',
        }));

    const res = await addStockAccountAction({
      productId: targetProductId,
      email: newStockEmail.trim(),
      password: newStockPassword.trim(),
      notes: newStockNotes,
      registeredAt: newStockRegisteredAt || null,
      billingDate: newStockBillingDate || null,
      paymentMethod: newStockPaymentMethod,
      autoRenew: newStockAutoRenew,
      slots,
    });
    setNewStockLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error || 'เพิ่มสต็อกไม่สำเร็จ');
    }
  };

  const handleSaveEditSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSlotsStock) return;
    setEditSlotsLoading(true);

    const res = await updateStockSlotsAction(editSlotsStock.id, editSlotsData);
    setEditSlotsLoading(false);

    if (res.success) {
      setStocks(
        stocks.map((s) =>
          s.id === editSlotsStock.id
            ? {
                ...s,
                slots: s.slots.map((sl: any) => {
                  const found = editSlotsData.find((d) => d.id === sl.id);
                  return found
                    ? {
                        ...sl,
                        slotName: found.slotName,
                        slotPin: found.slotPin.trim() || null,
                        deviceType: found.deviceType,
                        productId: found.productId || null,
                        status: found.status,
                      }
                    : sl;
                }),
              }
            : s
        )
      );
      setEditSlotsStock(null);
    } else {
      alert('อัปเดตข้อมูลจอ/PIN ไม่สำเร็จ');
    }
  };

  const handleUpdateStockBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBillingStock) return;
    setEditBillingLoading(true);

    const res = await updateStockAccountAction({
      id: editBillingStock.id,
      notes: editStockNotes,
      registeredAt: editRegisteredAt || null,
      billingDate: editBillingDate || null,
      paymentMethod: editPaymentMethod,
      autoRenew: editAutoRenew,
    });
    setEditBillingLoading(false);

    if (res.success) {
      setStocks(
        stocks.map((s) =>
          s.id === editBillingStock.id
            ? {
                ...s,
                notes: editStockNotes,
                registeredAt: editRegisteredAt ? new Date(editRegisteredAt).toISOString() : null,
                billingDate: editBillingDate ? new Date(editBillingDate).toISOString() : null,
                paymentMethod: editPaymentMethod,
                autoRenew: editAutoRenew,
              }
            : s
        )
      );
      setEditBillingStock(null);
    } else {
      alert('อัปเดตข้อมูลรอบบิลไม่สำเร็จ');
    }
  };

  const handleToggleProduct = async (id: string, current: boolean) => {
    await toggleProductActiveAction(id, !current);
    setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !current } : p)));
  };

  const handleToggleBestseller = async (id: string, current: boolean) => {
    await toggleProductBestsellerAction(id, !current);
    setProducts(products.map((p) => (p.id === id ? { ...p, isBestseller: !current } : p)));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdLoading(true);

    const res = await saveProductAction({
      id: editProductModal?.id,
      name: prodName,
      price: Number(prodPrice) || 0,
      retailPrice: prodRetailPrice ? Number(prodRetailPrice) : null,
      durationDays: Number(prodDuration) || 30,
      categoryId: prodCategory,
      imageUrl: prodImage,
      rules: prodRules,
      usageGuide: prodGuide,
      otpEnabled: prodOtp,
      lineOaUrl: prodLineOa || undefined,
      cutoffType: prodCutoffType || 'ROUND_UP_HOUR',
      hasProfilePin: prodHasProfilePin,
      defaultSlotCount: Number(prodDefaultSlotCount) || 1,
      sharingTypeNote: prodSharingTypeNote,
      addonEnabled: prodAddonEnabled,
      addonName: prodAddonName.trim() || 'รับประกันเคลม',
      addonPrice: Number(prodAddonPrice) || 0,
      isBestseller: prodIsBestseller,
      isActive: editProductModal ? editProductModal.isActive : true,
    });
    setProdLoading(false);

    if (res.success) {
      window.location.reload();
    } else {
      alert('บันทึกสินค้าไม่สำเร็จ');
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${productName}"?\n\nคำเตือน: บัญชีสต็อก สิทธิ์จอ และข้อมูลคำสั่งซื้อที่ผูกกับสินค้านี้จะถูกลบออกจากระบบอย่างถาวร`
      )
    ) {
      return;
    }
    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== productId));
      setStocks(stocks.filter((s) => s.productId !== productId));
      setEditProductModal(null);
    } else {
      alert(res.error || 'ลบสินค้าไม่สำเร็จ');
    }
  };

  const handleDeleteStock = async (stockId: string, email: string) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีสต็อก "${email}" ออกจากระบบ?\n\nคำเตือน: ข้อมูลสิทธิ์จอและรายการคำสั่งซื้อที่ผูกกับสต็อกนี้จะถูกลบทั้งหมด`
      )
    ) {
      return;
    }
    const res = await deleteStockAccountAction(stockId);
    if (res.success) {
      setStocks(stocks.filter((s) => s.id !== stockId));
    } else {
      alert(res.error || 'ลบสต็อกไม่สำเร็จ');
    }
  };

  const handleDeleteOrder = async (order: any) => {
    const isConfirm = confirm(
      `คุณต้องการลบคำสั่งซื้อเลขที่ "${order.orderNumber}" หรือไม่?\n\n` +
        `- สินค้า: ${order.productName} (${order.slotName})\n` +
        `- ยอดขายจะถูกหักลบออกจากสถิติแดชบอร์ด: -${order.amountPaid} ฿\n` +
        `- สิทธิ์จอ ${order.slotName} จะถูกคืนสถานะว่าง (พร้อมนำไปขายต่อได้ทันที)\n\n` +
        `กด [ ตกลง / OK ] เพื่อดำเนินการลบ`
    );
    if (!isConfirm) return;

    let refund = false;
    if (order.amountPaid > 0 && order.buyerUsername) {
      refund = confirm(
        `ต้องการคืนเครดิตเงินจำนวน ${order.amountPaid} ฿ ให้ผู้ซื้อ @${order.buyerUsername} ด้วยหรือไม่?\n\n` +
          `- กด [ OK ] เพื่อ "คืนเครดิตเงิน" ให้ผู้ซื้อ\n` +
          `- กด [ Cancel ] เพื่อ "ไม่คืนเครดิต" (กรณีเป็นออเดอร์เทสต์หรือยกเลิกโดยไม่คืนเงิน)`
      );
    }

    const res = await deleteAdminOrderAction(order.id, refund);
    if (res.success) {
      // 1. Remove order from orders state
      setOrders(orders.filter((o) => o.id !== order.id));

      // 2. Adjust sales stats in real-time
      setStats((prev: any) => ({
        ...prev,
        sales: {
          daily: {
            amount: Math.max(0, (prev.sales?.daily?.amount || 0) - order.amountPaid),
            count: Math.max(0, (prev.sales?.daily?.count || 1) - 1),
          },
          monthly: {
            amount: Math.max(0, (prev.sales?.monthly?.amount || 0) - order.amountPaid),
            count: Math.max(0, (prev.sales?.monthly?.count || 1) - 1),
          },
          yearly: {
            amount: Math.max(0, (prev.sales?.yearly?.amount || 0) - order.amountPaid),
            count: Math.max(0, (prev.sales?.yearly?.count || 1) - 1),
          },
        },
      }));

      // 3. Update stock slots in state if found
      setStocks((prevStocks) =>
        prevStocks.map((stk) => ({
          ...stk,
          slots: stk.slots.map((sl: any) =>
            sl.slotName === order.slotName && stk.email === order.email
              ? { ...sl, status: 'AVAILABLE' }
              : sl
          ),
        }))
      );

      // 4. Update user balance if refunded
      if (refund) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.username === order.buyerUsername
              ? { ...u, creditBalance: u.creditBalance + order.amountPaid }
              : u
          )
        );
      }
    } else {
      alert(res.error || 'ลบคำสั่งซื้อไม่สำเร็จ');
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankLoading(true);

    const res = await saveBankAccountAction({
      id: bankModal?.isNew ? undefined : bankModal?.id,
      bankName,
      accountName: bankAccountName,
      accountNumber: bankAccountNumber,
      promptPayNumber: bankPromptPay || null,
      qrCodeUrl: bankQrUrl || null,
      isPromptPay: bankIsPromptPay,
      isActive: bankIsActive,
    });
    setBankLoading(false);

    if (res.success && res.account) {
      if (bankModal?.isNew) {
        setBankAccounts([...bankAccounts, res.account]);
      } else {
        setBankAccounts(bankAccounts.map((b) => (b.id === res.account.id ? res.account : b)));
      }
      setBankModal(null);
    } else {
      alert('บันทึกบัญชีธนาคารไม่สำเร็จ');
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (!confirm('ต้องการลบบัญชีธนาคารนี้ใช่หรือไม่?')) return;
    const res = await deleteBankAccountAction(id);
    if (res.success) {
      setBankAccounts(bankAccounts.filter((b) => b.id !== id));
    }
  };

  const handleToggleBankAccount = async (id: string, current: boolean) => {
    await toggleBankAccountAction(id, !current);
    setBankAccounts(bankAccounts.map((b) => (b.id === id ? { ...b, isActive: !current } : b)));
  };

  const handleSaveStoreContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);

    const res = await saveStoreContactAction({
      id: contactModal?.isNew ? undefined : contactModal?.id,
      title: contactTitle,
      url: contactUrl,
      handle: contactHandle,
      iconName: contactIcon,
    });
    setContactLoading(false);

    if (res.success && res.contact) {
      if (contactModal?.isNew) {
        setContacts([...contacts, res.contact]);
      } else {
        setContacts(contacts.map((c) => (c.id === res.contact.id ? res.contact : c)));
      }
      setContactModal(null);
    } else {
      alert('บันทึกช่องทางติดต่อไม่สำเร็จ');
    }
  };

  const handleDeleteStoreContact = async (id: string) => {
    if (!confirm('ต้องการลบช่องทางติดต่อนี้ใช่หรือไม่?')) return;
    const res = await deleteStoreContactAction(id);
    if (res.success) {
      setContacts(contacts.filter((c) => c.id !== id));
    }
  };

  const handleTogglePreviewAudio = (track: any) => {
    if (previewTrackId === track.id) {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
      }
      setPreviewTrackId(null);
    } else {
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
      }
      if (isYouTubeUrl(track.url)) {
        // Toggle inline YouTube preview
        setPreviewTrackId(track.id);
      } else {
        try {
          const audio = new Audio(track.url);
          audio.play().then(() => {
            setPreviewAudio(audio);
            setPreviewTrackId(track.id);
          }).catch((err) => {
            alert('ไม่สามารถเปิดเล่นไฟล์เสียงนี้ได้ กรุณาตรวจสอบ URL: ' + err.message);
            setPreviewTrackId(null);
            setPreviewAudio(null);
          });
          audio.onended = () => {
            setPreviewTrackId(null);
            setPreviewAudio(null);
          };
        } catch (err: any) {
          alert('เกิดข้อผิดพลาดในการโหลดไฟล์เสียง: ' + err.message);
        }
      }
    }
  };

  const handleSaveMusicTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setMusicLoading(true);
    const res = await saveMusicTrackAction({
      id: musicModal?.isNew ? undefined : musicModal?.id,
      title: musicTitle,
      artist: musicArtist,
      url: musicUrl,
      isActive: musicIsActive,
      sortOrder: musicSortOrder,
    });
    setMusicLoading(false);

    if (res.success) {
      if (musicModal?.isNew) {
        setMusicTracks([
          ...musicTracks,
          {
            id: 'track-' + Date.now(),
            title: musicTitle,
            artist: musicArtist,
            url: musicUrl,
            isActive: musicIsActive,
            sortOrder: musicSortOrder,
          },
        ]);
      } else {
        setMusicTracks(
          musicTracks.map((m) =>
            m.id === musicModal.id
              ? { ...m, title: musicTitle, artist: musicArtist, url: musicUrl, isActive: musicIsActive, sortOrder: musicSortOrder }
              : m
          )
        );
      }
      setMusicModal(null);
    } else {
      alert(res.error || 'บันทึกเพลงไม่สำเร็จ');
    }
  };

  const handleDeleteMusicTrack = async (trackId: string, title: string) => {
    if (!confirm(`ต้องการลบเพลง "${title}" ใช่หรือไม่?`)) return;
    if (previewTrackId === trackId && previewAudio) {
      previewAudio.pause();
      setPreviewAudio(null);
      setPreviewTrackId(null);
    }
    const res = await deleteMusicTrackAction(trackId);
    if (res.success) {
      setMusicTracks(musicTracks.filter((m) => m.id !== trackId));
    } else {
      alert(res.error || 'ไม่สามารถลบเพลงได้');
    }
  };

  const handleToggleMusicTrack = async (trackId: string, current: boolean) => {
    const res = await toggleMusicTrackAction(trackId, !current);
    if (res.success) {
      setMusicTracks(musicTracks.map((m) => (m.id === trackId ? { ...m, isActive: !current } : m)));
    } else {
      alert(res.error || 'ไม่สามารถเปลี่ยนสถานะเพลงได้');
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

  const filteredStocks = stocks.filter((stock) => {
    if (stockStatusFilter !== 'ALL') {
      if (stockStatusFilter === 'ACTIVE' && stock.status !== 'ACTIVE') return false;
      if (stockStatusFilter === 'SERVICING' && stock.status !== 'SERVICING') return false;
      if (stockStatusFilter === 'FULL' && stock.status !== 'FULL') return false;
    }
    if (!stockSearchQuery.trim()) return true;
    const q = stockSearchQuery.trim().toLowerCase();
    return (
      stock.email.toLowerCase().includes(q) ||
      stock.productName.toLowerCase().includes(q) ||
      (stock.notes && stock.notes.toLowerCase().includes(q)) ||
      stock.slots.some(
        (sl: any) =>
          sl.slotName.toLowerCase().includes(q) ||
          (sl.assignedUser && sl.assignedUser.toLowerCase().includes(q))
      )
    );
  });

  const filteredOrders = orders.filter((ord: any) => {
    if (orderStatusFilter !== 'ALL') {
      if (orderStatusFilter === 'ACTIVE' && ord.status !== 'ACTIVE') return false;
      if (orderStatusFilter === 'EXPIRED' && ord.status !== 'EXPIRED') return false;
      if (orderStatusFilter === 'EXPIRING_SOON') {
        const exp = new Date(ord.expiresAt).getTime();
        const now = Date.now();
        const in24h = now + 24 * 60 * 60 * 1000;
        if (ord.status !== 'ACTIVE' || exp > in24h) return false;
      }
    }
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.trim().toLowerCase();
    return (
      ord.orderNumber.toLowerCase().includes(q) ||
      ord.productName.toLowerCase().includes(q) ||
      ord.email.toLowerCase().includes(q) ||
      ord.buyerUsername.toLowerCase().includes(q) ||
      (ord.buyerProfileName && ord.buyerProfileName.toLowerCase().includes(q)) ||
      ord.slotName.toLowerCase().includes(q)
    );
  });

  const displayedStocks = filteredStocks.slice(0, visibleStocksCount);
  const displayedOrders = filteredOrders.slice(0, visibleOrdersCount);
  const displayedUsers = users.slice(0, visibleUsersCount);
  const displayedTopups = topups.slice(0, visibleTopupsCount);
  const displayedLogs = auditLogs.slice(0, visibleLogsCount);

  return (
    <div className="space-y-6 relative">
      {/* Minimalist Frosted Loading Modal for On-Demand Tab Fetching */}
      {tabLoading && <BakeryLoadingModal message={loadingMessage} />}

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
              onClick={() => handleTabClick(tab.id)}
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
            <button
              type="button"
              onClick={() => switchDashboardModalType('ACTIVE')}
              className="miki-card p-4.5 bg-white border-[#E8DCCF] hover:border-[#059669] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
                  <p className="text-xs text-[#8D6E63] font-bold">บัญชีกำลังใช้งาน (Active)</p>
                </div>
                <p className="text-2xl font-black text-[#059669] mt-1">{stats.subscriptions.active} บัญชี</p>
                <span className="text-[11px] text-[#059669] font-medium group-hover:underline flex items-center gap-1 mt-1">
                  คลิกดูรายชื่อบัญชี ➔
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-[#059669]" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => switchDashboardModalType('EXPIRING_SOON')}
              className="miki-card p-4.5 bg-[#FFFDF5] border-[#FDE68A] hover:border-[#D97706] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
                  <p className="text-xs text-[#D97706] font-bold">ใกล้หมดอายุใน 24 ชม.</p>
                </div>
                <p className="text-2xl font-black text-[#D97706] mt-1">{stats.subscriptions.expiringSoon} บัญชี</p>
                <span className="text-[11px] text-[#D97706] font-medium group-hover:underline flex items-center gap-1 mt-1">
                  คลิกดูรายชื่อบัญชี ➔
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-[#D97706]" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => switchDashboardModalType('SERVICING')}
              className="miki-card p-4.5 bg-[#FFF1F2] border-[#FECDD3] hover:border-[#E11D48] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                  <p className="text-xs text-[#E11D48] font-bold">คิวรอเปลี่ยนรหัส (Servicing)</p>
                </div>
                <p className="text-2xl font-black text-[#E11D48] mt-1">{stats.subscriptions.servicingQueue} บัญชี</p>
                <span className="text-[11px] text-[#E11D48] font-medium group-hover:underline flex items-center gap-1 mt-1">
                  คลิกดูรายชื่อบัญชี ➔
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] border border-[#FECDD3] flex items-center justify-center group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6 text-[#E11D48]" />
              </div>
            </button>
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

          {/* Order Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFDF7] p-3 rounded-2xl border border-[#E8DCCF]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter('ALL');
                  setVisibleOrdersCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  orderStatusFilter === 'ALL'
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8F3]'
                }`}
              >
                ทั้งหมด ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter('ACTIVE');
                  setVisibleOrdersCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  orderStatusFilter === 'ACTIVE'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-white text-[#059669] border border-[#A7F3D0] hover:bg-[#ECFDF5]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>กำลังใช้งาน ({orders.filter((o: any) => o.status === 'ACTIVE').length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter('EXPIRING_SOON');
                  setVisibleOrdersCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  orderStatusFilter === 'EXPIRING_SOON'
                    ? 'bg-[#D97706] text-white shadow-xs'
                    : 'bg-white text-[#D97706] border border-[#FDE68A] hover:bg-[#FFFDF5]'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>ใกล้หมดอายุ 24 ชม.</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderStatusFilter('EXPIRED');
                  setVisibleOrdersCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  orderStatusFilter === 'EXPIRED'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8F3]'
                }`}
              >
                หมดอายุแล้ว ({orders.filter((o: any) => o.status === 'EXPIRED').length})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => {
                  setOrderSearchQuery(e.target.value);
                  setVisibleOrdersCount(10);
                }}
                placeholder="ค้นหาเลขออเดอร์, อีเมล, ผู้ซื้อ..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-[#E8DCCF] text-xs font-medium text-[#5D4037] placeholder-[#A1887F] focus:outline-none focus:border-[#FFB4A2] shadow-xs"
              />
              {orderSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearchQuery('');
                    setVisibleOrdersCount(10);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#FFF0EB] text-[#8D6E63]"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
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
                    <th className="pb-3">อีเมล / เบอร์โทร</th>
                    <th className="pb-3">รหัสผ่าน</th>
                    <th className="pb-3">วันที่ซื้อ / หมดอายุ</th>
                    <th className="pb-3 text-right">ยอดขาย</th>
                    <th className="pb-3 text-center">สถานะ</th>
                    <th className="pb-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DCCF]/50 font-medium">
                  {displayedOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-[#FFFDF7] transition-colors">
                      <td className="py-3 font-mono font-bold text-[#5D4037]">{ord.orderNumber}</td>
                      <td className="py-3 font-bold text-[#5D4037]">
                        <div>{ord.productName}</div>
                        {ord.hasAddon && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            แอดออน: {ord.addonName || 'รับประกันเคลม'} (+{ord.addonPrice} ฿)
                          </span>
                        )}
                      </td>
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
                      <td className="py-3 text-right font-bold text-[#E5989B]">
                        {ord.amountPaid.toLocaleString()} ฿
                      </td>
                      <td className="py-3 text-center">
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
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteOrder(ord)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] hover:bg-[#FFE4E6] transition-colors shadow-2xs"
                          title="ลบคำสั่งซื้อและหักลดยอดขาย"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>ลบ</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-[#8D6E63] space-y-2">
                <p className="font-bold text-sm">
                  {orderSearchQuery || orderStatusFilter !== 'ALL'
                    ? 'ไม่พบรายการคำสั่งซื้อที่ตรงกับตัวกรอง'
                    : 'ยังไม่มีรายการสั่งซื้อและตัดสต็อกในระบบ'}
                </p>
                <p className="text-xs">
                  {orderSearchQuery || orderStatusFilter !== 'ALL'
                    ? 'ลองเปลี่ยนตัวกรองสถานะ หรือล้างคำค้นหา'
                    : 'เมื่อลูกค้าหรือตัวแทนกดรับบัญชี ข้อมูลการตัดสต็อกจะปรากฏที่นี่'}
                </p>
              </div>
            )}

            {/* Pagination See More Button */}
            {filteredOrders.length > displayedOrders.length && (
              <div className="text-center pt-4 border-t border-[#F5EBE1]">
                <button
                  type="button"
                  onClick={() => setVisibleOrdersCount((prev) => prev + 10)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3] hover:border-[#FFB4A2] shadow-xs active:scale-95 transition-all"
                >
                  <span>ดูคำสั่งซื้อเพิ่มเติม (+10 รายการ)</span>
                  <span className="text-[10px] text-[#8D6E63] font-normal">
                    (แสดง {displayedOrders.length} จาก {filteredOrders.length} รายการ)
                  </span>
                </button>
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
              onClick={() => {
                const targetProd = products.find((p) => p.id === newStockProduct) || products[0];
                if (targetProd) {
                  setNewStockProduct(targetProd.id);
                  initSlotsForProduct(targetProd);
                }
                setNewStockModal(true);
              }}
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

          {/* Email & Account Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FFFDF7] p-3 rounded-2xl border border-[#E8DCCF]">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setStockStatusFilter('ALL');
                  setVisibleStocksCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  stockStatusFilter === 'ALL'
                    ? 'bg-[#5D4037] text-white shadow-xs'
                    : 'bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8F3]'
                }`}
              >
                ทั้งหมด ({stocks.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockStatusFilter('ACTIVE');
                  setVisibleStocksCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  stockStatusFilter === 'ACTIVE'
                    ? 'bg-[#059669] text-white shadow-xs'
                    : 'bg-white text-[#059669] border border-[#A7F3D0] hover:bg-[#ECFDF5]'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>พร้อมขาย ({stocks.filter((s: any) => s.status === 'ACTIVE').length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockStatusFilter('SERVICING');
                  setVisibleStocksCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                  stockStatusFilter === 'SERVICING'
                    ? 'bg-[#E11D48] text-white shadow-xs'
                    : 'bg-white text-[#E11D48] border border-[#FECDD3] hover:bg-[#FFF1F2]'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>รอเปลี่ยนรหัส ({stocks.filter((s: any) => s.status === 'SERVICING').length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStockStatusFilter('FULL');
                  setVisibleStocksCount(10);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  stockStatusFilter === 'FULL'
                    ? 'bg-[#8D6E63] text-white shadow-xs'
                    : 'bg-white text-[#8D6E63] border border-[#E8DCCF] hover:bg-[#FFF8F3]'
                }`}
              >
                เต็มแล้ว ({stocks.filter((s: any) => s.status === 'FULL').length})
              </button>
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stockSearchQuery}
                onChange={(e) => {
                  setStockSearchQuery(e.target.value);
                  setVisibleStocksCount(10);
                }}
                placeholder="ค้นหาอีเมล, เบอร์โทรศัพท์, ชื่อแอป, หมายเหตุ..."
                className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-[#E8DCCF] text-xs font-medium text-[#5D4037] placeholder-[#A1887F] focus:outline-none focus:border-[#FFB4A2] shadow-xs"
              />
              {stockSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setStockSearchQuery('');
                    setVisibleStocksCount(10);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#FFF0EB] text-[#8D6E63]"
                  title="ล้างคำค้นหา"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stocks Table */}
          <div className="space-y-4">
            {displayedStocks.map((stock) => {
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
                        {stock.email && !stock.email.includes('@') && /^[0-9+\s-]+$/.test(stock.email) ? 'เบอร์โทร:' : 'บัญชี / อีเมล:'}{' '}
                        <span className="font-bold text-[#5D4037]">{stock.email}</span>
                        {stock.notes && ` • หมายเหตุ: ${stock.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
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

                      <button
                        onClick={() => handleDeleteStock(stock.id, stock.email)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] hover:bg-[#FFE4E6] transition-colors shadow-2xs"
                        title="ลบบัญชีสต็อกนี้ออกจากระบบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ลบสต็อก</span>
                      </button>
                    </div>
                  </div>

                  {/* App Subscription & Billing Info Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {stock.registeredAt && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF8F3] text-[#6D4C41] border border-[#FFD9CE]">
                        <Calendar className="w-3.5 h-3.5 text-[#E5989B]" />
                        <span>สมัครเมื่อ: {new Date(stock.registeredAt).toLocaleDateString('th-TH')}</span>
                      </span>
                    )}

                    {stock.billingDate && (() => {
                      const bDate = new Date(stock.billingDate);
                      const isPast = bDate.getTime() < Date.now();
                      const isSoon = bDate.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                            isPast
                              ? 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] font-bold'
                              : isSoon
                              ? 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] font-bold'
                              : 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            รอบตัดเงินแอพ: {bDate.toLocaleDateString('th-TH')}{' '}
                            {isPast ? '(ถึงกำหนดแล้ว!)' : isSoon ? '(ใกล้ถึงกำหนด)' : ''}
                          </span>
                        </span>
                      );
                    })()}

                    {stock.paymentMethod && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF5] text-[#854D0E] border border-[#FEF08A] font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-[#CA8A04]" />
                        <span>
                          ตัดเงินผ่าน: <strong>{stock.paymentMethod}</strong>
                        </span>
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        stock.autoRenew
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                      }`}
                    >
                      {stock.autoRenew ? 'ตัดเงินอัตโนมัติ' : 'ไม่ตัดอัตโนมัติ'}
                    </span>

                    {/* Whole-Account Cutoff Time (When the last screen/slot expires) */}
                    {isServicing ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] font-black shadow-xs">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>หมดอายุรอบใช้งานแล้ว • รอเปลี่ยนรหัส & Recycle</span>
                      </span>
                    ) : stock.accountCutoffTime ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2] font-black shadow-xs">
                        <Clock className="w-3.5 h-3.5 text-[#D84315]" />
                        <span>
                          เวลาตัดรอบทั้งบัญชี:{' '}
                          {new Date(stock.accountCutoffTime).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          น. (เมื่อจอสุดท้ายหมดอายุ)
                        </span>
                      </span>
                    ) : null}

                    {/* Quick edit slots & PINs button */}
                    <button
                      onClick={() => {
                        setEditSlotsStock(stock);
                        setEditSlotsData(
                          stock.slots.map((sl: any) => ({
                            id: sl.id,
                            slotName: sl.slotName,
                            slotPin: sl.slotPin || '',
                            deviceType: sl.deviceType || 'MOBILE',
                            productId: sl.productId || '',
                            status: sl.status || 'AVAILABLE',
                          }))
                        );
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FFF8F3] border border-[#E8DCCF] transition-colors"
                    >
                      <Key className="w-3 h-3 text-[#FFB4A2]" />
                      <span>แก้ไขชื่อจอ & PIN</span>
                    </button>

                    {/* Quick edit billing button */}
                    <button
                      onClick={() => {
                        setEditBillingStock(stock);
                        setEditRegisteredAt(stock.registeredAt ? stock.registeredAt.slice(0, 10) : '');
                        setEditBillingDate(stock.billingDate ? stock.billingDate.slice(0, 10) : '');
                        setEditPaymentMethod(stock.paymentMethod || 'TrueMoney Wallet');
                        setEditAutoRenew(stock.autoRenew !== false);
                        setEditStockNotes(stock.notes || '');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FFF8F3] border border-[#E8DCCF] transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-[#FFB4A2]" />
                      <span>แก้ไขรอบบิล/ช่องทางชำระ</span>
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
                            : slot.status === 'LOCKED'
                            ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'
                            : 'bg-[#FFF1F2] border-[#FECDD3] text-[#E11D48]'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1">
                            {slot.deviceType === 'TV' ? (
                              <Tv className="w-3 h-3 text-[#D97706]" />
                            ) : (
                              <Smartphone className="w-3 h-3 text-[#0284C7]" />
                            )}
                            <span className="truncate">{slot.slotName}</span>
                          </span>
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-white/80 border border-current">
                            {slot.status === 'LOCKED'
                              ? 'ล็อกไว้'
                              : slot.status === 'AVAILABLE'
                              ? 'ว่าง'
                              : slot.status === 'EXPIRED'
                              ? 'หมดอายุ'
                              : slot.status === 'ASSIGNED'
                              ? 'ใช้งานอยู่'
                              : slot.status}
                          </span>
                        </div>
                        {slot.slotPin ? (
                          <div className="text-[10px] text-[#8D6E63] font-mono font-bold mt-1">
                            PIN: <span className="text-[#5D4037]">{slot.slotPin}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#9CA3AF] mt-1">ไม่มี PIN</div>
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

          {/* Empty States */}
          {stocks.length === 0 && (
            <div className="text-center py-12 miki-card bg-white border border-[#E8DCCF] text-[#8D6E63] space-y-2">
              <p className="font-bold text-sm">ยังไม่มีสต็อกบัญชีในระบบ</p>
              <p className="text-xs">กดปุ่ม "เพิ่มบัญชีเข้าสต็อก" ด้านบนเพื่อเริ่มลงสต็อก</p>
            </div>
          )}

          {stocks.length > 0 && filteredStocks.length === 0 && (
            <div className="text-center py-12 miki-card bg-white border border-[#E8DCCF] text-[#8D6E63] space-y-2">
              <p className="font-bold text-sm">ไม่พบบัญชีสต็อกที่ตรงกับ "{stockSearchQuery}"</p>
              <p className="text-xs">ลองพิมพ์คำค้นหาด้วยอีเมล หรือชื่อแอปอื่น</p>
            </div>
          )}

          {/* Pagination See More Button */}
          {filteredStocks.length > displayedStocks.length && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleStocksCount((prev) => prev + 10)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3] hover:border-[#FFB4A2] shadow-xs active:scale-95 transition-all"
              >
                <span>ดูสต็อกเพิ่มเติม (+10 บัญชี)</span>
                <span className="text-[10px] text-[#8D6E63] font-normal">
                  (แสดง {displayedStocks.length} จากทั้งหมด {filteredStocks.length} บัญชี)
                </span>
              </button>
            </div>
          )}
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
                setProdRetailPrice(129);
                setProdDuration(30);
                setProdImage('');
                setProdRules('');
                setProdGuide('');
                setProdOtp(false);
                setProdLineOa('');
                setProdCutoffType('ROUND_UP_HOUR');
                setProdHasProfilePin(false);
                setProdDefaultSlotCount(1);
                setProdSharingTypeNote('');
                setProdAddonEnabled(false);
                setProdAddonName('รับประกันเคลม');
                setProdAddonPrice(5);
                setProdIsBestseller(false);
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-[#5D4037] leading-snug truncate">{p.name}</h3>
                    <p className="text-xs text-[#8D6E63]">{p.category?.name} • {p.durationDays} วัน</p>
                    <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-black text-[#E5989B]">ส่ง: {p.price} ฿</span>
                      {p.retailPrice && (
                        <span className="text-xs text-[#8D6E63] font-bold">
                          ปลีก: {p.retailPrice} ฿
                        </span>
                      )}
                    </div>
                    <div className="pt-1 flex flex-wrap gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8F3] text-[#6D4C41] border border-[#FFD9CE]">
                        ตัดรอบ: {p.cutoffType === 'MIDNIGHT' ? 'เที่ยงคืน (23:59)' : p.cutoffType === 'EXACT_TIME' ? 'เวลาตรง 24 ชม.' : 'ปัดขึ้นชั่วโมง'}
                      </span>
                      {p.hasProfilePin ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] flex items-center gap-1">
                          <Key className="w-2.5 h-2.5" />
                          มี PIN ({p.defaultSlotCount || 1} จอ)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EBE1] text-[#8D6E63]">
                          เต็มสิทธิ์ (1 จอ)
                        </span>
                      )}
                      {p.sharingTypeNote && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF8F3] text-[#D84315] border border-[#FFD9CE]">
                          {p.sharingTypeNote}
                        </span>
                      )}
                      {p.addonEnabled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] flex items-center gap-1">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          แอดออน: {p.addonName} (+{p.addonPrice}฿)
                        </span>
                      )}
                      {p.isBestseller && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white flex items-center gap-1 shadow-2xs">
                          <Flame className="w-2.5 h-2.5 fill-white" />
                          หมุดขายดี
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCF] flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
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
                      type="button"
                      onClick={() => handleToggleBestseller(p.id, p.isBestseller)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${
                        p.isBestseller
                          ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-2xs'
                          : 'bg-white hover:bg-[#FFF0EB] text-[#8D6E63] border-[#FFD9CE]'
                      }`}
                      title={p.isBestseller ? 'คลิกเพื่อยกเลิกการปักหมุดขายดี' : 'คลิกเพื่อปักหมุดเป็นสินค้าขายดี'}
                    >
                      <Flame className={`w-3 h-3 ${p.isBestseller ? 'text-white fill-white' : 'text-[#FF5722]'}`} />
                      <span>{p.isBestseller ? 'หมุดขายดี' : 'ปักหมุด'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditProductModal(p);
                        setProdName(p.name);
                        setProdPrice(p.price);
                        setProdRetailPrice(p.retailPrice ?? '');
                        setProdDuration(p.durationDays);
                        setProdCategory(p.categoryId);
                        setProdImage(p.imageUrl);
                        setProdRules(p.rules);
                        setProdGuide(p.usageGuide);
                        setProdOtp(p.otpEnabled);
                        setProdLineOa(p.lineOaUrl || '');
                        setProdCutoffType(p.cutoffType || 'ROUND_UP_HOUR');
                        setProdHasProfilePin(p.hasProfilePin ?? false);
                        setProdDefaultSlotCount(p.defaultSlotCount ?? 1);
                        setProdSharingTypeNote(p.sharingTypeNote || '');
                        setProdAddonEnabled(p.addonEnabled ?? false);
                        setProdAddonName(p.addonName || 'รับประกันเคลม');
                        setProdAddonPrice(p.addonPrice ?? 5);
                        setProdIsBestseller(p.isBestseller ?? false);
                      }}
                      className="text-xs font-bold text-[#FFB4A2] hover:underline"
                    >
                      แก้ไขรายละเอียด
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-1 rounded-md text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                      title="ลบสินค้านี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                {displayedUsers.map((u) => (
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

            {/* Pagination See More Button */}
            {users.length > displayedUsers.length && (
              <div className="text-center pt-4 border-t border-[#F5EBE1]">
                <button
                  type="button"
                  onClick={() => setVisibleUsersCount((prev) => prev + 10)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3] hover:border-[#FFB4A2] shadow-xs active:scale-95 transition-all"
                >
                  <span>ดูสมาชิกเพิ่มเติม (+10 ท่าน)</span>
                  <span className="text-[10px] text-[#8D6E63] font-normal">
                    (แสดง {displayedUsers.length} จาก {users.length} สมาชิก)
                  </span>
                </button>
              </div>
            )}
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
                {displayedTopups.map((t) => (
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

            {/* Pagination See More Button */}
            {topups.length > displayedTopups.length && (
              <div className="text-center pt-4 border-t border-[#F5EBE1]">
                <button
                  type="button"
                  onClick={() => setVisibleTopupsCount((prev) => prev + 10)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3] hover:border-[#FFB4A2] shadow-xs active:scale-95 transition-all"
                >
                  <span>ดูรายการสลิปเพิ่มเติม (+10 รายการ)</span>
                  <span className="text-[10px] text-[#8D6E63] font-normal">
                    (แสดง {displayedTopups.length} จาก {topups.length} รายการ)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: BANK ACCOUNTS MANAGEMENT */}
      {activeTab === 'BANK_ACCOUNTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#5D4037]">จัดการบัญชีธนาคาร & ช่องทางชำระเงิน</h2>
              <p className="text-xs text-[#8D6E63]">
                เพิ่มบัญชีธนาคาร พร้อมเพย์ หรือวอลเล็ทได้ไม่จำกัด เพื่อให้ลูกค้าเลือกโอนเงินในหน้าเติมเครดิต
              </p>
            </div>
            <button
              onClick={() => {
                setBankModal({ isNew: true });
                setBankName('ธนาคารกสิกรไทย');
                setBankAccountName('');
                setBankAccountNumber('');
                setBankPromptPay('');
                setBankQrUrl('');
                setBankIsPromptPay(false);
                setBankIsActive(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มบัญชีใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="miki-card p-5 bg-white border border-[#E8DCCF] space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-center text-[#E5989B]">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-[#5D4037]">{b.bankName}</h3>
                      <p className="text-xs text-[#8D6E63]">{b.accountName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleBankAccount(b.id, b.isActive)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      b.isActive
                        ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                        : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                    }`}
                  >
                    {b.isActive ? 'เปิดรับเงิน' : 'ปิดใช้งาน'}
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#FFD9CE] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#8D6E63] font-sans">เลขที่บัญชี:</span>
                    <span className="font-bold text-[#5D4037]">{b.accountNumber}</span>
                  </div>
                  {b.promptPayNumber && (
                    <div className="flex justify-between">
                      <span className="text-[#8D6E63] font-sans">พร้อมเพย์:</span>
                      <span className="font-bold text-[#E5989B]">{b.promptPayNumber}</span>
                    </div>
                  )}
                  {b.qrCodeUrl && (
                    <div className="pt-2 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={b.qrCodeUrl}
                        alt="QR Code"
                        className="w-24 h-24 mx-auto object-contain rounded-lg border border-[#FFD9CE]"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E8DCCF]">
                  <button
                    onClick={() => {
                      setBankModal(b);
                      setBankName(b.bankName);
                      setBankAccountName(b.accountName);
                      setBankAccountNumber(b.accountNumber);
                      setBankPromptPay(b.promptPayNumber || '');
                      setBankQrUrl(b.qrCodeUrl || '');
                      setBankIsPromptPay(b.isPromptPay || false);
                      setBankIsActive(b.isActive !== false);
                    }}
                    className="p-1.5 rounded-full hover:bg-[#FFF8F3] text-[#8D6E63] hover:text-[#5D4037]"
                    title="แก้ไขบัญชี"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBankAccount(b.id)}
                    className="p-1.5 rounded-full hover:bg-[#FFF1F2] text-[#8D6E63] hover:text-[#E11D48]"
                    title="ลบบัญชี"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {bankAccounts.length === 0 && (
              <div className="col-span-full text-center py-12 miki-card bg-white border border-[#E8DCCF] text-[#8D6E63] space-y-2">
                <Building className="w-8 h-8 mx-auto text-[#FFB4A2]" />
                <p className="font-bold text-sm">ยังไม่มีบัญชีธนาคารที่เพิ่มเอง</p>
                <p className="text-xs">กดปุ่ม "เพิ่มบัญชีใหม่" เพื่อใส่บัญชีกสิกร, ไทยพาณิชย์, พร้อมเพย์ หรือวอลเล็ท</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: MUSIC MANAGEMENT */}
      {activeTab === 'MUSIC' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-[1.75rem] border border-[#E8DCCF] shadow-xs">
            <div>
              <h2 className="text-lg font-black text-[#5D4037] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#E5989B]" />
                <span>จัดการเพลงบรรเลงคาเฟ่ (BGM)</span>
              </h2>
              <p className="text-xs text-[#8D6E63] mt-0.5 font-medium">
                ปรับแต่งเพลงบรรเลงที่จะเปิดเล่นในเครื่องเล่นเพลงหน้าร้าน เพิ่มเพลงจากไฟล์เสียง mp3 หรือ audio stream ได้อิสระ
              </p>
            </div>
            <button
              onClick={() => {
                setMusicModal({ isNew: true });
                setMusicTitle('');
                setMusicArtist('Miki Cafe Studio');
                setMusicUrl('');
                setMusicIsActive(true);
                setMusicSortOrder(musicTracks.length);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-all shadow-xs active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเพลงใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicTracks.map((track) => {
              const isCurrentlyPreviewing = previewTrackId === track.id;
              const isYT = isYouTubeUrl(track.url);
              const ytVideoId = extractYouTubeVideoId(track.url);
              return (
                <div
                  key={track.id}
                  className="miki-card p-5 bg-white border border-[#E8DCCF] space-y-4 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-10 h-10 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-center text-[#E5989B] shadow-2xs ${
                            isCurrentlyPreviewing ? 'animate-spin' : ''
                          }`}
                        >
                          <Disc3 className="w-5 h-5 text-[#D97706]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-sm text-[#5D4037] line-clamp-1">{track.title}</h3>
                            {isYT ? (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center gap-0.5 flex-shrink-0">
                                <Video className="w-2.5 h-2.5" />
                                <span>YouTube</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex-shrink-0">
                                MP3
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#8D6E63]">{track.artist || 'Miki Cafe Studio'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleMusicTrack(track.id, track.isActive)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors flex-shrink-0 ${
                          track.isActive
                            ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                            : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                        }`}
                      >
                        {track.isActive ? 'เปิดใช้งาน' : 'ปิดการเล่น'}
                      </button>
                    </div>

                    {/* Preview Play/Pause button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePreviewAudio(track)}
                      className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                        isCurrentlyPreviewing
                          ? isYT
                            ? 'bg-[#DC2626] text-white border-[#B91C1C]'
                            : 'bg-[#D97706] text-white border-[#B45309]'
                          : 'bg-[#FFF8F3] text-[#5D4037] border-[#FFD9CE] hover:bg-[#FFE8D6]'
                      }`}
                    >
                      {isCurrentlyPreviewing ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{isYT ? 'ปิดตัวอย่าง YouTube' : 'หยุดฟังตัวอย่าง'}</span>
                        </>
                      ) : (
                        <>
                          {isYT ? (
                            <Video className="w-3.5 h-3.5 text-[#DC2626]" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-[#D97706]" />
                          )}
                          <span>{isYT ? 'กดดูตัวอย่าง YouTube (Video & Sound)' : 'กดฟังตัวอย่างเสียง (Audio Preview)'}</span>
                        </>
                      )}
                    </button>

                    {/* Inline YouTube preview player */}
                    {isYT && isCurrentlyPreviewing && ytVideoId && (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-[#FFD9CE] shadow-sm bg-black animate-in fade-in duration-200">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=1&enablejsapi=1`}
                          title={track.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}

                    {/* Audio URL snippet */}
                    <div className="p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E8DCCF] text-[11px] font-mono text-[#8D6E63] truncate">
                      <span className="font-sans font-bold text-[#5D4037] block text-[10px]">
                        {isYT ? 'ลิงก์ YouTube:' : 'ลิงก์ไฟล์เสียง:'}
                      </span>
                      <span className="truncate block" title={track.url}>{track.url}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DCCF]">
                    <span className="text-[10px] font-bold text-[#8D6E63]">
                      ลำดับ: {track.sortOrder ?? 0}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setMusicModal(track);
                          setMusicTitle(track.title);
                          setMusicArtist(track.artist || 'Miki Cafe Studio');
                          setMusicUrl(track.url);
                          setMusicIsActive(track.isActive !== false);
                          setMusicSortOrder(track.sortOrder ?? 0);
                        }}
                        className="p-1.5 rounded-full hover:bg-[#FFF8F3] text-[#8D6E63] hover:text-[#5D4037] transition-colors"
                        title="แก้ไขเพลง"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMusicTrack(track.id, track.title)}
                        className="p-1.5 rounded-full hover:bg-[#FFF1F2] text-[#8D6E63] hover:text-[#E11D48] transition-colors"
                        title="ลบเพลง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {musicTracks.length === 0 && (
              <div className="col-span-full text-center py-12 miki-card bg-white border border-[#E8DCCF] text-[#8D6E63] space-y-2">
                <Music className="w-8 h-8 mx-auto text-[#FFB4A2]" />
                <p className="font-bold text-sm">ยังไม่มีรายการเพลงในระบบ</p>
                <p className="text-xs">กดปุ่ม "เพิ่มเพลงใหม่" เพื่อใส่เพลงบรรเลงคาเฟ่ที่คุณชื่นชอบ</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: STORE SETTINGS */}

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

            {/* Dynamic Contact Channels Management */}
            <div className="md:col-span-2 pt-4 border-t border-[#E8DCCF] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-sm text-[#5D4037]">ช่องทางการติดต่อร้านค้า (Dynamic Contacts)</h3>
                  <p className="text-xs text-[#8D6E63]">
                    เพิ่มช่องทางติดต่อได้ไม่จำกัด (LINE, Facebook, Instagram, TikTok, Discord ฯลฯ) เมื่อลูกค้ากดจะเปิดลิ้งค์ไปหน้านั้นๆ ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setContactModal({ isNew: true });
                    setContactTitle('LINE Official');
                    setContactUrl('https://line.me');
                    setContactHandle('@');
                    setContactIcon('MessageCircle');
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF8F3] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFEFE8] shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มช่องทางติดต่อ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#FFD9CE] flex items-center justify-between shadow-xs"
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#5D4037]">
                        <span>{c.title}</span>
                      </div>
                      <p className="text-[11px] text-[#8D6E63] truncate">{c.handle}</p>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#E5989B] hover:underline truncate max-w-full"
                      >
                        <span className="truncate">{c.url}</span>
                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setContactModal(c);
                          setContactTitle(c.title);
                          setContactUrl(c.url);
                          setContactHandle(c.handle);
                          setContactIcon(c.iconName || 'MessageCircle');
                        }}
                        className="p-1 rounded-lg text-[#8D6E63] hover:text-[#5D4037]"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStoreContact(c.id)}
                        className="p-1 rounded-lg text-[#8D6E63] hover:text-[#E11D48]"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {contacts.length === 0 && (
                  <div className="col-span-full p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DCCF] text-center text-xs text-[#8D6E63]">
                    ยังไม่มีช่องทางติดต่อไดนามิก กดปุ่ม <strong>[+ เพิ่มช่องทางติดต่อ]</strong> ด้านบนเพื่อเพิ่มได้เลย
                  </div>
                )}
              </div>
            </div>

            {/* Bank Accounts Notice Box */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#FFD9CE] flex items-center justify-center text-[#E5989B] shrink-0 shadow-2xs">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#5D4037]">การจัดการบัญชีธนาคาร & พร้อมเพย์</h4>
                  <p className="text-[11px] text-[#8D6E63]">
                    ระบบได้แยกการจัดการบัญชีธนาคารไว้ที่แท็บ <strong>"บัญชีธนาคาร"</strong> เพื่อรองรับหลายบัญชีและ QR Code แยกตามบัญชี
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleTabClick('BANK_ACCOUNTS')}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
              >
                ไปยังแท็บบัญชีธนาคาร →
              </button>
            </div>

            {/* Embedded Slip2Go System Status */}
            <div className="md:col-span-2 p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#166534]">ระบบตรวจสลิปอัตโนมัติ Slip2Go (Active)</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]">
                    เชื่อมต่อคีย์ความปลอดภัยระดับเซิร์ฟเวอร์แล้ว
                  </span>
                </div>
                <p className="text-[11px] text-[#166534]/80 leading-relaxed">
                  ระบบตรวจสอบสลิปโอนเงินผ่านระบบ Slip2Go เชื่อมต่อกับธนาคารโดยตรงแบบ Real-time พร้อมตัดยอดเครดิตให้อัตโนมัติ ป้องกันสลิปปลอมและสลิปใช้ซ้ำ 100% ถูกฝังคีย์ระบบความปลอดภัยระดับเซิร์ฟเวอร์เรียบร้อยแล้ว ไม่ต้องตั้งค่าในหน้านี้เพื่อป้องกันข้อผิดพลาด
                </p>
              </div>
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
            {displayedLogs.map((log) => (
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

          {/* Pagination See More Button */}
          {auditLogs.length > displayedLogs.length && (
            <div className="text-center pt-2 border-t border-[#F5EBE1]">
              <button
                type="button"
                onClick={() => setVisibleLogsCount((prev) => prev + 15)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3] hover:border-[#FFB4A2] shadow-xs active:scale-95 transition-all"
              >
                <span>ดูบันทึกเพิ่มเติม (+15 บันทึก)</span>
                <span className="text-[10px] text-[#8D6E63] font-normal">
                  (แสดง {displayedLogs.length} จาก {auditLogs.length} บันทึก)
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADJUST USER CREDIT */}
      {creditModalUser && (() => {
        const delta = creditType === 'ADD' ? Math.abs(creditAmount) : -Math.abs(creditAmount);
        const projectedBalance = Math.max(0, creditModalUser.creditBalance + delta);

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
              {/* Sticky Header */}
              <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
                <h3 className="font-extrabold text-base text-[#5D4037]">
                  ปรับเครดิตให้: @{creditModalUser.username}
                </h3>
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
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
          </div>
        );
      })()}

      {/* MODAL: RECYCLE EXPIRED ACCOUNT */}
      {recycleStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#FFB4A2]" />
                <span>นำบัญชีกลับเข้าสต็อก (Recycle)</span>
              </h3>
              <button
                type="button"
                onClick={() => setRecycleStock(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
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
        </div>
      )}

      {/* MODAL: ADD NEW STOCK ACCOUNT */}
      {newStockModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FFB4A2]" />
                <span>เพิ่มสต็อกบัญชีใหม่ (เข้ารหัส AES-256-GCM)</span>
              </h3>
              <button
                type="button"
                onClick={() => setNewStockModal(false)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStock} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">เลือกสินค้า *</label>
                  {products.length > 0 ? (
                    <select
                      value={newStockProduct || products[0]?.id || ''}
                      onChange={(e) => {
                        const prodId = e.target.value;
                        setNewStockProduct(prodId);
                        const prod = products.find((p) => p.id === prodId);
                        if (prod) {
                          initSlotsForProduct(prod);
                        }
                      }}
                      className="w-full miki-input text-xs font-bold"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.hasProfilePin ? `(แบ่ง ${p.defaultSlotCount || 1} จอ + PIN)` : '(เต็มสิทธิ์)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-xs text-[#E11D48] font-bold">
                      ยังไม่มีรายการสินค้าในระบบ กรุณาไปที่แท็บ "สินค้า & หมวดหมู่" เพื่อสร้างสินค้าก่อนเพิ่มสต็อก
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D4037]">อีเมล / เบอร์โทรศัพท์บัญชี *</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น user@gmail.com หรือ 0812345678"
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

                {/* Slot Capacity & Device Type Section */}
                <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E8DCCF] space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-[#5D4037] block">
                        จำนวนสิทธิ์ / จอที่ขายได้ในบัญชีนี้ *
                      </label>
                      <span className="text-[11px] text-[#8D6E63]">
                        ระบุจำนวนสิทธิ์ได้อิสระ (เช่น 1, 3, 4, 5, 6 จอ หรือตามที่ต้องการขาย)
                      </span>
                    </div>

                    {/* Quick Count Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleSlotCountChange(num)}
                          className={`w-8 h-8 rounded-xl text-xs font-black transition-all active:scale-95 border ${
                            Number(newStockSlotCount) === num
                              ? 'bg-[#FFB4A2] text-[#4E342E] border-[#FFA28D] shadow-xs'
                              : 'bg-white text-[#8D6E63] border-[#E8DCCF] hover:bg-[#FFF8F3]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8D6E63]">
                        ระบุจำนวนเอง (สิทธิ์)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={newStockSlotCount}
                        onChange={(e) => handleSlotCountChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        onBlur={() => {
                          if (!newStockSlotCount || Number(newStockSlotCount) < 1) {
                            handleSlotCountChange(1);
                          }
                        }}
                        className="w-full miki-input text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8D6E63]">
                        ประเภทอุปกรณ์หลักของสิทธิ์ชุดนี้
                      </label>
                      <select
                        value={newStockDefaultDevice}
                        onChange={(e) => {
                          const dev = e.target.value;
                          setNewStockDefaultDevice(dev);
                          const updated = newStockSlots.map((s) => ({ ...s, deviceType: dev }));
                          setNewStockSlots(updated);
                        }}
                        className="w-full miki-input text-xs font-bold"
                      >
                        <option value="MOBILE">มือถือ/แท็บเล็ต (Mobile/Tablet) — เช่น 4 จอมือถือล้วน, 5 จอมือถือ</option>
                        <option value="ALL">ทุกอุปกรณ์ (All Devices) — ใช้ได้ทั้งมือถือ คอม ทีวี</option>
                        <option value="TV">สมาร์ททีวี (Smart TV) — สำหรับขายเฉพาะจอทีวี</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggle for Custom Screen Names & PINs */}
                  <div className="pt-2 border-t border-[#F5EBE1]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={showSlotDetailConfig}
                        onChange={(e) => setShowSlotDetailConfig(e.target.checked)}
                        className="w-4 h-4 rounded text-[#E5989B] border-[#FFD9CE] focus:ring-0"
                      />
                      <span className="text-xs font-bold text-[#5D4037]">
                        กำหนดชื่อจอ / รหัส PIN รายจอแบบละเอียด (เปิดเฉพาะเมื่อแอปต้องใช้ PIN หรือต้องการแยกจอทีวี)
                      </span>
                    </label>

                    {/* Mode A: Fast/No-PIN Mode (Default) */}
                    {!showSlotDetailConfig ? (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-[#15803D] font-bold">
                          <Check className="w-4 h-4 flex-shrink-0 text-[#15803D]" />
                          <span>
                            โหมดขายด่วน: ระบบจะสร้าง {newStockSlotCount} สิทธิ์ (
                            {newStockDefaultDevice === 'TV'
                              ? 'สมาร์ททีวี'
                              : newStockDefaultDevice === 'ALL'
                              ? 'ทุกอุปกรณ์'
                              : 'มือถือ/แท็บเล็ต'}
                            ) ให้อัตโนมัติ โดยไม่ต้องเสียเวลากรอก PIN หรือชื่อจอ
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Mode B: Detailed Screen & PIN Configuration */
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#8D6E63] flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-[#FFB4A2]" />
                            <span>แก้ไขชื่อจอ, PIN, หรือแยกสินค้าเฉพาะจอ</span>
                          </span>

                          <button
                            type="button"
                            onClick={applyNetflixPreset}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF0EB] text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFE8E0] active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                          >
                            <Tv className="w-3 h-3" />
                            <span>พรีเซ็ต Netflix รวม (3 มือถือ + 1 ทีวี)</span>
                          </button>
                        </div>

                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {newStockSlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-2xl bg-white border border-[#FFD9CE] shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs font-bold text-[#5D4037]">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-6 h-6 rounded-lg bg-[#FFF0EB] text-[#E5989B] flex items-center justify-center text-[11px] font-extrabold">
                                    {idx + 1}
                                  </span>
                                  <span>จอที่ {idx + 1}</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={slot.deviceType || newStockDefaultDevice}
                                    onChange={(e) => {
                                      const updated = [...newStockSlots];
                                      updated[idx].deviceType = e.target.value;
                                      setNewStockSlots(updated);
                                    }}
                                    className="text-[10px] font-bold py-1 px-2 rounded-lg border border-[#FFD9CE] bg-[#FFF8F3] text-[#6D4C41]"
                                  >
                                    <option value="MOBILE">มือถือ/แท็บเล็ต (Mobile)</option>
                                    <option value="TV">สมาร์ททีวี (Smart TV)</option>
                                    <option value="ALL">ทุกอุปกรณ์ (All)</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...newStockSlots];
                                      updated[idx].status = updated[idx].status === 'LOCKED' ? 'AVAILABLE' : 'LOCKED';
                                      setNewStockSlots(updated);
                                    }}
                                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                                      slot.status === 'LOCKED'
                                        ? 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                                        : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                                    }`}
                                  >
                                    {slot.status === 'LOCKED' ? 'ล็อกไว้ (ไม่ขาย)' : 'พร้อมขาย'}
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[#8D6E63]">ชื่อจอ / โปรไฟล์</label>
                                  <input
                                    type="text"
                                    value={slot.slotName}
                                    onChange={(e) => {
                                      const updated = [...newStockSlots];
                                      updated[idx].slotName = e.target.value;
                                      setNewStockSlots(updated);
                                    }}
                                    placeholder="เช่น จอ 1 (มือถือ/แท็บเล็ต)"
                                    className="w-full miki-input text-xs py-1.5"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-[#8D6E63]">รหัส PIN (ถ้ามี)</label>
                                  <input
                                    type="text"
                                    value={slot.slotPin}
                                    onChange={(e) => {
                                      const updated = [...newStockSlots];
                                      updated[idx].slotPin = e.target.value;
                                      setNewStockSlots(updated);
                                    }}
                                    placeholder="PIN เช่น 1234 (หรือเว้นว่าง)"
                                    className="w-full miki-input text-xs py-1.5 font-mono font-bold"
                                  />
                                </div>
                              </div>

                              {/* Target product binding (e.g. cross-selling TV slot vs Mobile) */}
                              <div className="space-y-1 mt-1.5">
                                <label className="text-[10px] font-bold text-[#8D6E63]">
                                  ผูกกับสินค้าเฉพาะจอ (กรณีแยกขาย เช่น จอ 4 แยกขายเป็น TV)
                                </label>
                                <select
                                  value={slot.productId || ''}
                                  onChange={(e) => {
                                    const updated = [...newStockSlots];
                                    updated[idx].productId = e.target.value;
                                    setNewStockSlots(updated);
                                  }}
                                  className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-[#FFD9CE] bg-white text-[#5D4037] font-medium"
                                >
                                  <option value="">
                                    ตามสินค้าหลักที่เลือก ({products.find((p) => p.id === newStockProduct)?.name || 'สินค้าหลัก'})
                                  </option>
                                  {products
                                    .filter((p) => p.id !== newStockProduct)
                                    .map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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

                {/* App Subscription & Billing Info Inputs */}
                <div className="p-3.5 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE] space-y-3">
                  <div className="font-bold text-xs text-[#5D4037] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FFB4A2]" />
                    <span>ข้อมูลการสมัครและรอบบิลของแอพจริง</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8D6E63]">วันที่เริ่มสมัครแอพ</label>
                      <input
                        type="date"
                        value={newStockRegisteredAt}
                        onChange={(e) => setNewStockRegisteredAt(e.target.value)}
                        className="w-full miki-input text-xs font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#8D6E63]">วันที่แอพตัดเงินรอบถัดไป</label>
                      <input
                        type="date"
                        value={newStockBillingDate}
                        onChange={(e) => setNewStockBillingDate(e.target.value)}
                        className="w-full miki-input text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8D6E63]">ช่องทางที่แอพตัดเงิน</label>
                    <div className="flex gap-2">
                      <select
                        value={
                          ['TrueMoney Wallet', 'บัตรเดบิต KBank', 'บัตรเดบิต SCB', 'บัตรเครดิต', 'AIS Billing'].includes(
                            newStockPaymentMethod
                          )
                            ? newStockPaymentMethod
                            : 'CUSTOM'
                        }
                        onChange={(e) => {
                          if (e.target.value !== 'CUSTOM') setNewStockPaymentMethod(e.target.value);
                          else setNewStockPaymentMethod('');
                        }}
                        className="miki-input text-xs font-bold w-1/2"
                      >
                        <option value="TrueMoney Wallet">TrueMoney Wallet</option>
                        <option value="บัตรเดบิต KBank">บัตรเดบิต KBank</option>
                        <option value="บัตรเดบิต SCB">บัตรเดบิต SCB</option>
                        <option value="บัตรเครดิต">บัตรเครดิต</option>
                        <option value="AIS Billing">AIS Billing</option>
                        <option value="CUSTOM">อื่น ๆ (พิมพ์เอง)</option>
                      </select>
                      <input
                        type="text"
                        value={newStockPaymentMethod}
                        onChange={(e) => setNewStockPaymentMethod(e.target.value)}
                        placeholder="ระบุช่องทางตัดเงิน..."
                        className="w-1/2 miki-input text-xs font-bold"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-[#5D4037] pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStockAutoRenew}
                      onChange={(e) => setNewStockAutoRenew(e.target.checked)}
                      className="rounded text-[#FFB4A2]"
                    />
                    <span>แอพนี้เปิดระบบต่ออายุอัตโนมัติ (Auto-Renew)</span>
                  </label>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#F5EBE1] flex justify-end gap-2 flex-shrink-0 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setNewStockModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={newStockLoading}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
                >
                  {newStockLoading ? 'กำลังบันทึก...' : 'บันทึกเข้าสต็อก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FFB4A2]" />
                <span>{editProductModal.isNew ? 'เพิ่มสินค้าใหม่' : `แก้ไขสินค้า: ${editProductModal.name}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditProductModal(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#2E7D32]">ราคาส่งตัวแทน (บาท) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      onBlur={() => {
                        if (prodPrice === '' || Number(prodPrice) < 0) {
                          setProdPrice(0);
                        }
                      }}
                      className="w-full miki-input text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D4037]">ราคาปลีกคนไม่สมัคร (บาท)</label>
                    <input
                      type="number"
                      value={prodRetailPrice}
                      onChange={(e) => setProdRetailPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="เช่น 129"
                      className="w-full miki-input text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#5D4037]">อายุการใช้งาน (วัน) *</label>
                    <input
                      type="number"
                      required
                      value={prodDuration}
                      onChange={(e) => setProdDuration(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      onBlur={() => {
                        if (!prodDuration || Number(prodDuration) < 1) {
                          setProdDuration(30);
                        }
                      }}
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

                {/* Screen & PIN Profile Settings (Requested Feature) */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FFD9CE] space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#5D4037]">
                    <Key className="w-4 h-4 text-[#E5989B]" />
                    <span>การตั้งค่าระบบจอและ PIN (Screen & Profile PIN)</span>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={prodHasProfilePin}
                      onChange={(e) => setProdHasProfilePin(e.target.checked)}
                      className="rounded text-[#E5989B] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#5D4037] block">
                        สินค้านี้เป็นแบบแบ่งจอ และมีรหัส PIN ประจำจอ (เช่น Netflix, Disney+)
                      </span>
                      <span className="text-[11px] text-[#8D6E63] leading-relaxed block">
                        ระบบจะแสดงป้าย [แยกจอเดี่ยว + PIN] ให้ลูกค้าทราบ และจะเปิดช่องกรอกชื่อจอและ PIN ให้อัตโนมัติในตอนเพิ่มสต็อก
                      </span>
                    </div>
                  </label>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-bold text-[#8D6E63]">
                      จำนวนจอมาตรฐานต่อ 1 บัญชี (เช่น Netflix = 4 จอ, บัญชีทั่วไป = 1 จอ)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={prodDefaultSlotCount}
                      onChange={(e) => setProdDefaultSlotCount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      onBlur={() => {
                        if (!prodDefaultSlotCount || Number(prodDefaultSlotCount) < 1) {
                          setProdDefaultSlotCount(1);
                        }
                      }}
                      className="w-full miki-input text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#FFD9CE]/60">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#8D6E63]">
                        ข้อความประเภทการหาร (แสดงที่หน้าลูกค้าซื้อ)
                      </label>
                      <span className="text-[10px] text-[#A1887F]">เว้นว่างได้</span>
                    </div>
                    <input
                      type="text"
                      value={prodSharingTypeNote}
                      onChange={(e) => setProdSharingTypeNote(e.target.value)}
                      placeholder="เช่น หาร 4 จอไม่ชน, หาร 5 จอชน, จอไม่ชน (ส่วนตัว)"
                      className="w-full miki-input text-xs font-bold"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-[#A1887F]">เลือกข้อความด่วน:</span>
                      {[
                        'หาร 4 จอไม่ชน',
                        'หาร 5 จอชน',
                        'จอไม่ชน 100%',
                        'จอชน (หารเกิน)',
                        'แอคเดี่ยวส่วนตัว',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setProdSharingTypeNote(preset)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white hover:bg-[#FFE8D6] text-[#6D4C41] border border-[#FFD9CE] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                      {prodSharingTypeNote && (
                        <button
                          type="button"
                          onClick={() => setProdSharingTypeNote('')}
                          className="text-[10px] text-[#E11D48] hover:underline ml-1"
                        >
                          ล้างข้อความ
                        </button>
                      )}
                    </div>
                  </div>
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

                {/* Cutoff Type Selection */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FFD9CE] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#5D4037]">
                    <Clock className="w-4 h-4 text-[#D84315]" />
                    <span>รูปแบบการตัดรอบบัญชี (Cutoff Rule)</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <input
                        type="radio"
                        name="cutoffType"
                        value="ROUND_UP_HOUR"
                        checked={prodCutoffType === 'ROUND_UP_HOUR'}
                        onChange={(e) => setProdCutoffType(e.target.value)}
                        className="text-[#E5989B]"
                      />
                      <div>
                        <span className="font-bold text-[#5D4037]">ปัดเศษขึ้นชั่วโมงถัดไป (เช่น 15:23 ปัดเป็น 16:00 น.)</span>
                        <p className="text-[11px] text-[#8D6E63]">สะดวกต่อการจัดคิวเปลี่ยนรหัสผ่านแอคเคาท์</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <input
                        type="radio"
                        name="cutoffType"
                        value="MIDNIGHT"
                        checked={prodCutoffType === 'MIDNIGHT'}
                        onChange={(e) => setProdCutoffType(e.target.value)}
                        className="text-[#E5989B]"
                      />
                      <div>
                        <span className="font-bold text-[#5D4037]">ตัดรอบเที่ยงคืน (Midnight Cutoff - 23:59:59 น.)</span>
                        <p className="text-[11px] text-[#8D6E63]">สำหรับบัญชีเน็ตฟิกหรือแอพที่ตัดตามรอบวันสิ้นสุดเที่ยงคืน</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl hover:bg-white/80 transition-colors">
                      <input
                        type="radio"
                        name="cutoffType"
                        value="EXACT_TIME"
                        checked={prodCutoffType === 'EXACT_TIME'}
                        onChange={(e) => setProdCutoffType(e.target.value)}
                        className="text-[#E5989B]"
                      />
                      <div>
                        <span className="font-bold text-[#5D4037]">เวลาตรงเป๊ะ (Exact 24 ชั่วโมงต่อวัน)</span>
                        <p className="text-[11px] text-[#8D6E63]">นับตามเวลาสั่งซื้อตรงตัว</p>
                      </div>
                    </label>
                  </div>
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

                {/* Add-on Settings (Requested: บริการเสริม เช่น บวกเพิ่ม 5 เครดิต รับเคลม) */}
                <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border border-[#FFD9CE] space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#5D4037]">
                    <ShieldCheck className="w-4 h-4 text-[#E5989B]" />
                    <span>บริการเสริม / แอดออน (Add-on เช่น รับประกันเคลม)</span>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={prodAddonEnabled}
                      onChange={(e) => setProdAddonEnabled(e.target.checked)}
                      className="rounded text-[#E5989B] mt-0.5"
                    />
                    <div>
                      <span className="font-bold text-[#5D4037] block">
                        เปิดให้ลูกค้าเลือกซื้อบริการเสริม / แอดออนสำหรับสินค้านี้
                      </span>
                      <span className="text-[11px] text-[#8D6E63] leading-relaxed block">
                        ลูกค้าสามารถกดปุ่มเลือกบริการเสริมเพื่อบวกเครดิตเพิ่มได้ เช่น รับประกันเคลมจอ 24 ชม.
                      </span>
                    </div>
                  </label>

                  {prodAddonEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#FFD9CE]/60">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#8D6E63]">
                          ชื่อบริการเสริม (แสดงที่ปุ่มกดของลูกค้า)
                        </label>
                        <input
                          type="text"
                          value={prodAddonName}
                          onChange={(e) => setProdAddonName(e.target.value)}
                          placeholder="เช่น รับประกันเคลม, ดูแลตลอดการใช้งาน"
                          className="w-full miki-input text-xs font-bold"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-[#A1887F]">พรีเซ็ตด่วน:</span>
                          {['รับประกันเคลม', 'ประกันจอชน/จอเต็ม', 'ดูแลด่วน 24 ชม.'].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setProdAddonName(preset)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white hover:bg-[#FFE8D6] text-[#6D4C41] border border-[#FFD9CE] transition-colors"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#8D6E63]">
                          ราคาบวกเพิ่ม (เครดิต / บาท)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={prodAddonPrice}
                          onChange={(e) => setProdAddonPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                          className="w-full miki-input text-xs font-bold"
                        />
                        <span className="text-[10px] text-[#8D6E63] block">
                          เมื่อลูกค้ากดเลือก จะบวกราคาเพิ่ม {prodAddonPrice || 0} เครดิต
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bestseller Pin Setting (หมุดสินค้าขายดี) */}
                <div className="p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FFD9CE] space-y-1.5">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={prodIsBestseller}
                      onChange={(e) => setProdIsBestseller(e.target.checked)}
                      className="rounded text-[#FF5722]"
                    />
                    <div className="flex items-center gap-1.5 font-bold text-[#5D4037]">
                      <Flame className={`w-4 h-4 ${prodIsBestseller ? 'text-[#FF5722] fill-[#FF5722]' : 'text-[#8D6E63]'}`} />
                      <span>ปักหมุดเป็น "สินค้าขายดี" (Bestseller)</span>
                    </div>
                  </label>
                  <p className="text-[11px] text-[#8D6E63] pl-6 leading-relaxed">
                    สินค้าที่ปักหมุดจะมีป้าย "ขายดี" กำกับ, แสดงในปุ่มตัวกรอง "สินค้าขายดี" ของลูกค้า และจะขึ้นแสดงเป็นอันดับแรกในหน้าร้าน
                  </p>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#F5EBE1] flex items-center justify-between gap-2 flex-shrink-0 sticky bottom-0 z-10">
                {!editProductModal.isNew ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(editProductModal.id, prodName)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3] hover:bg-[#FFE4E6] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบสินค้านี้</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditProductModal(null)}
                    className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={prodLoading}
                    className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
                  >
                    {prodLoading ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STOCK BILLING & SUBSCRIPTION */}
      {editBillingStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#FFB4A2]" />
                <span>แก้ไขรอบบิลและช่องทางตัดเงิน</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditBillingStock(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-[#8D6E63]">
                บัญชี: <span className="font-bold text-[#5D4037]">{editBillingStock.email}</span> ({editBillingStock.productName})
              </p>

              <form onSubmit={handleUpdateStockBilling} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8D6E63]">วันที่เริ่มสมัครแอพ</label>
                    <input
                      type="date"
                      value={editRegisteredAt}
                      onChange={(e) => setEditRegisteredAt(e.target.value)}
                      className="w-full miki-input text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#8D6E63]">วันที่แอพตัดเงินรอบถัดไป</label>
                    <input
                      type="date"
                      value={editBillingDate}
                      onChange={(e) => setEditBillingDate(e.target.value)}
                      className="w-full miki-input text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8D6E63]">ช่องทางที่แอพตัดเงิน</label>
                  <div className="flex gap-2">
                    <select
                      value={
                        ['TrueMoney Wallet', 'บัตรเดบิต KBank', 'บัตรเดบิต SCB', 'บัตรเครดิต', 'AIS Billing'].includes(
                          editPaymentMethod
                        )
                      ? editPaymentMethod
                      : 'CUSTOM'
                    }
                    onChange={(e) => {
                      if (e.target.value !== 'CUSTOM') setEditPaymentMethod(e.target.value);
                      else setEditPaymentMethod('');
                    }}
                    className="miki-input text-xs font-bold w-1/2"
                  >
                    <option value="TrueMoney Wallet">TrueMoney Wallet</option>
                    <option value="บัตรเดบิต KBank">บัตรเดบิต KBank</option>
                    <option value="บัตรเดบิต SCB">บัตรเดบิต SCB</option>
                    <option value="บัตรเครดิต">บัตรเครดิต</option>
                    <option value="AIS Billing">AIS Billing</option>
                    <option value="CUSTOM">อื่น ๆ (พิมพ์เอง)</option>
                  </select>
                  <input
                    type="text"
                    value={editPaymentMethod}
                    onChange={(e) => setEditPaymentMethod(e.target.value)}
                    placeholder="ระบุช่องทางตัดเงิน..."
                    className="w-1/2 miki-input text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D4037]">หมายเหตุ</label>
                <input
                  type="text"
                  value={editStockNotes}
                  onChange={(e) => setEditStockNotes(e.target.value)}
                  className="w-full miki-input text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-[#5D4037] pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editAutoRenew}
                  onChange={(e) => setEditAutoRenew(e.target.checked)}
                  className="rounded text-[#FFB4A2]"
                />
                <span>ต่ออายุอัตโนมัติ (Auto-Renew)</span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={editBillingLoading}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                >
                  {editBillingLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditBillingStock(null)}
                  className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* MODAL: ADD / EDIT BANK ACCOUNT */}
      {bankModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FFB4A2]" />
                <span>{bankModal.isNew ? 'เพิ่มบัญชีธนาคารใหม่' : `แก้ไขบัญชี: ${bankModal.bankName}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setBankModal(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form onSubmit={handleSaveBankAccount} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ชื่อธนาคาร / ช่องทาง *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="เช่น ธนาคารกสิกรไทย, ธนาคารไทยพาณิชย์, พร้อมเพย์, TrueMoney Wallet"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ชื่อบัญชี *</label>
                  <input
                    type="text"
                    required
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    placeholder="เช่น มิคิ สโตร์"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">เลขที่บัญชี *</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="เช่น 123-4-56789-0"
                    className="w-full miki-input text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">เบอร์พร้อมเพย์ / วอลเล็ท (สแกนจ่ายได้จริง)</label>
                  <input
                    type="text"
                    value={bankPromptPay}
                    onChange={(e) => setBankPromptPay(e.target.value)}
                    placeholder="เช่น 0899999999 หรือ เลขบัตรประชาชน"
                    className="w-full miki-input text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ลิงก์รูปภาพ QR Code (ถ้ามี)</label>
                  <input
                    type="url"
                    value={bankQrUrl}
                    onChange={(e) => setBankQrUrl(e.target.value)}
                    placeholder="https://... (URL รูปภาพ QR บัญชีธนาคาร)"
                    className="w-full miki-input text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 font-bold text-[#5D4037] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankIsActive}
                      onChange={(e) => setBankIsActive(e.target.checked)}
                      className="rounded text-[#FFB4A2]"
                    />
                    <span>เปิดใช้งานให้ลูกค้าเห็นในหน้าเติมเงิน</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={bankLoading}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                  >
                    {bankLoading ? 'กำลังบันทึก...' : 'บันทึกบัญชี'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBankModal(null)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STORE CONTACT */}
      {contactModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037]">
                {contactModal.isNew ? 'เพิ่มช่องทางติดต่อใหม่' : `แก้ไข: ${contactModal.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setContactModal(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form onSubmit={handleSaveStoreContact} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ชื่อช่องทาง *</label>
                  <input
                    type="text"
                    required
                    value={contactTitle}
                    onChange={(e) => setContactTitle(e.target.value)}
                    placeholder="เช่น LINE Official, Facebook, Instagram, TikTok, Discord"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ลิงก์ปลายทาง (URL) *</label>
                  <input
                    type="url"
                    required
                    value={contactUrl}
                    onChange={(e) => setContactUrl(e.target.value)}
                    placeholder="เช่น https://line.me/R/ti/p/@miki หรือ https://facebook.com/..."
                    className="w-full miki-input text-xs"
                  />
                  <p className="text-[10px] text-[#8D6E63]">เมื่อลูกค้าคลิกจะเปิดไปยังหน้านี้ในแท็บใหม่</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ข้อความแสดง (Handle / ID) *</label>
                  <input
                    type="text"
                    required
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder="เช่น @mikistore หรือ miki.bakery"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ไอคอน</label>
                  <select
                    value={contactIcon}
                    onChange={(e) => setContactIcon(e.target.value)}
                    className="w-full miki-input text-xs font-bold"
                  >
                    <option value="MessageCircle">LINE / แชท (MessageCircle)</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Music2">TikTok</option>
                    <option value="Send">Telegram / ข้อความ</option>
                    <option value="Phone">เบอร์โทรศัพท์</option>
                    <option value="Mail">อีเมล</option>
                    <option value="Globe">เว็บไซต์ (Globe)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B]"
                  >
                    {contactLoading ? 'กำลังบันทึก...' : 'บันทึกช่องทางติดต่อ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactModal(null)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE]"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MUSIC TRACK */}
      {musicModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Music className="w-5 h-5 text-[#E5989B]" />
                <span>{musicModal.isNew ? 'เพิ่มเพลงใหม่' : `แก้ไขเพลง: ${musicTitle}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setMusicModal(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSaveMusicTrack} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ชื่อเพลง (Song Title) *</label>
                  <input
                    type="text"
                    required
                    value={musicTitle}
                    onChange={(e) => setMusicTitle(e.target.value)}
                    placeholder="เช่น Cozy Afternoon, Lo-fi Study Track"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ศิลปิน / ช่อง (Artist)</label>
                  <input
                    type="text"
                    value={musicArtist}
                    onChange={(e) => setMusicArtist(e.target.value)}
                    placeholder="เช่น Miki Cafe Studio, Pixabay Music"
                    className="w-full miki-input text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ลิงก์เพลง (วางลิงก์ YouTube หรือไฟล์ MP3) *</label>
                  <input
                    type="text"
                    required
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                    placeholder="วางลิงก์ YouTube (เช่น https://youtu.be/... หรือ https://www.youtube.com/watch?v=...) หรือไฟล์ MP3"
                    className="w-full miki-input text-xs font-mono"
                  />
                  {isYouTubeUrl(musicUrl) ? (
                    <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2 text-xs font-bold text-[#DC2626]">
                      <Video className="w-4 h-4 flex-shrink-0" />
                      <span>
                        ตรวจพบวิดีโอ YouTube (ID: {extractYouTubeVideoId(musicUrl)}) • ระบบจะเล่นเสียงให้อัตโนมัติ
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8D6E63]">
                      รองรับลิงก์ YouTube ทุกรูปแบบ (วิดีโอเพลง, ช่อง Live 24 ชม., Shorts) หรือลิงก์ไฟล์เสียงตรง .mp3
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5D4037]">ลำดับการเล่น (Sort Order)</label>
                  <input
                    type="number"
                    value={musicSortOrder}
                    onChange={(e) => setMusicSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full miki-input text-xs font-mono font-bold"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 font-bold text-[#5D4037] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={musicIsActive}
                      onChange={(e) => setMusicIsActive(e.target.checked)}
                      className="rounded text-[#FFB4A2]"
                    />
                    <span>เปิดใช้งานเพลงนี้ในเครื่องเล่นเพลงหน้าร้าน</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={musicLoading}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-[#4E342E] hover:bg-[#FFA28D] transition-all shadow-xs active:scale-95"
                  >
                    {musicLoading ? 'กำลังบันทึก...' : 'บันทึกเพลง'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMusicModal(null)}
                    className="flex-1 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* MODAL: EDIT SLOTS & PINS FOR EXISTING STOCK */}
      {editSlotsStock && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#FFB4A2]" />
                <span>แก้ไขชื่อจอ, PIN, และประเภทอุปกรณ์</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditSlotsStock(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSlots} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[#FFF8F3] border border-[#FFD9CE]">
                  <div className="text-xs text-[#8D6E63]">
                    บัญชี: <span className="font-bold text-[#5D4037]">{editSlotsStock.email}</span>
                    <span className="ml-1 text-[11px] text-[#A0887E]">({editSlotsStock.productName})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditSlotsData((prev) =>
                        prev.map((slot, idx) => ({
                          ...slot,
                          slotName:
                            idx === 3 ? 'จอ 4 (ทีวี/TV)' : `จอ ${idx + 1} (มือถือ/แท็บเล็ต)`,
                          deviceType: idx === 3 ? 'TV' : 'MOBILE',
                        }))
                      );
                    }}
                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#E5989B] border border-[#FFD9CE] hover:bg-[#FFF0EB] shadow-2xs flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Tv className="w-3 h-3" />
                    <span>ใช้พรีเซ็ต Netflix (จอ 1-3 มือถือ + จอ 4 ทีวี)</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {editSlotsData.map((slot, idx) => (
                    <div
                      key={slot.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#E8DCCF] shadow-2xs space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#FFF0EB] text-[#E5989B] flex items-center justify-center text-[11px] font-extrabold">
                            {idx + 1}
                          </span>
                          <span className="text-[#5D4037]">จอที่ {idx + 1}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Device Type */}
                          <select
                            value={slot.deviceType || 'MOBILE'}
                            onChange={(e) => {
                              const updated = [...editSlotsData];
                              updated[idx].deviceType = e.target.value;
                              setEditSlotsData(updated);
                            }}
                            className="text-[11px] font-bold py-1 px-2.5 rounded-lg border border-[#FFD9CE] bg-[#FFF8F3] text-[#6D4C41]"
                          >
                            <option value="MOBILE">มือถือ/แท็บเล็ต (Mobile)</option>
                            <option value="TV">สมาร์ททีวี (Smart TV)</option>
                            <option value="ALL">ทุกอุปกรณ์ (All Devices)</option>
                          </select>

                          {/* Status Selector */}
                          <select
                            value={slot.status || 'AVAILABLE'}
                            onChange={(e) => {
                              const updated = [...editSlotsData];
                              updated[idx].status = e.target.value;
                              setEditSlotsData(updated);
                            }}
                            className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition-all ${
                              slot.status === 'AVAILABLE'
                                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                                : slot.status === 'ASSIGNED'
                                ? 'bg-[#FFF8F3] text-[#D97706] border-[#FDE68A]'
                                : 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                            }`}
                          >
                            <option value="AVAILABLE">พร้อมขาย (Available)</option>
                            <option value="LOCKED">ล็อกไว้ / ไม่ขาย (Locked)</option>
                            <option value="ASSIGNED">มีคนซื้อแล้ว (Assigned)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#8D6E63]">ชื่อจอ / โปรไฟล์ *</label>
                          <input
                            type="text"
                            required
                            value={slot.slotName}
                            onChange={(e) => {
                              const updated = [...editSlotsData];
                              updated[idx].slotName = e.target.value;
                              setEditSlotsData(updated);
                            }}
                            placeholder="เช่น จอ 1 (มือถือ) หรือ Profile 1"
                            className="w-full miki-input text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#8D6E63]">รหัส PIN ประจำจอ</label>
                          <input
                            type="text"
                            value={slot.slotPin}
                            onChange={(e) => {
                              const updated = [...editSlotsData];
                              updated[idx].slotPin = e.target.value;
                              setEditSlotsData(updated);
                            }}
                            placeholder="เช่น 1234 หรือเว้นว่าง"
                            className="w-full miki-input text-xs font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Product Mapping Dropdown */}
                      <div className="space-y-1 pt-0.5">
                        <label className="text-[10px] font-bold text-[#8D6E63]">
                          สินค้าที่ผูกกับจอนี้ (เลือกเมื่อต้องการแยกขายข้ามแพ็กเกจ เช่น แยกขายเฉพาะจอทีวี)
                        </label>
                        <select
                          value={slot.productId || ''}
                          onChange={(e) => {
                            const updated = [...editSlotsData];
                            updated[idx].productId = e.target.value;
                            setEditSlotsData(updated);
                          }}
                          className="w-full miki-input text-[11px] font-medium"
                        >
                          <option value="">ตามสินค้าหลักของบัญชีนี้ ({editSlotsStock.productName})</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.price} ฿)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#F5EBE1] flex justify-end gap-2 flex-shrink-0 sticky bottom-0 z-10">
                <button
                  type="button"
                  onClick={() => setEditSlotsStock(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editSlotsLoading}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-xs"
                >
                  {editSlotsLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขข้อมูลจอ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DASHBOARD QUICK VIEW ACCOUNTS */}
      {dashboardModalType && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-[#5D4037]/50 backdrop-blur-xs flex min-h-full items-start sm:items-center justify-center">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#E8DCCF] shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Sticky Header */}
            <div className="px-6 py-4 bg-[#FFF8F3] border-b border-[#FFD9CE] flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    dashboardModalType === 'ACTIVE'
                      ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                      : dashboardModalType === 'EXPIRING_SOON'
                      ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                      : 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]'
                  }`}
                >
                  {dashboardModalType === 'ACTIVE' && <Clock className="w-5 h-5" />}
                  {dashboardModalType === 'EXPIRING_SOON' && <AlertTriangle className="w-5 h-5" />}
                  {dashboardModalType === 'SERVICING' && <RotateCcw className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#5D4037] flex items-center gap-2">
                    <span>
                      {dashboardModalType === 'ACTIVE' && 'บัญชีกำลังใช้งาน (Active)'}
                      {dashboardModalType === 'EXPIRING_SOON' && 'บัญชีใกล้หมดอายุใน 24 ชม.'}
                      {dashboardModalType === 'SERVICING' && 'คิวรอเปลี่ยนรหัสผ่าน (Servicing)'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        dashboardModalType === 'ACTIVE'
                          ? 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                          : dashboardModalType === 'EXPIRING_SOON'
                          ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]'
                          : 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]'
                      }`}
                    >
                      {dashboardModalType === 'ACTIVE' && `${stats.subscriptions.active} บัญชี`}
                      {dashboardModalType === 'EXPIRING_SOON' && `${stats.subscriptions.expiringSoon} บัญชี`}
                      {dashboardModalType === 'SERVICING' && `${stats.subscriptions.servicingQueue} บัญชี`}
                    </span>
                  </h3>
                  <p className="text-xs text-[#8D6E63] mt-0.5">
                    {dashboardModalType === 'ACTIVE' && 'รายการบัญชีและจอที่ลูกค้ากำลังใช้งานอยู่ในปัจจุบัน'}
                    {dashboardModalType === 'EXPIRING_SOON' && 'รายการบัญชีและจอที่กำลังจะหมดอายุในอีก 24 ชั่วโมง'}
                    {dashboardModalType === 'SERVICING' && 'บัญชีที่หมดอายุแล้ว รอนำไปเปลี่ยนรหัสผ่านเพื่อนำกลับมาขายต่อ'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDashboardModalType(null)}
                className="p-1.5 rounded-full hover:bg-white text-[#8D6E63] hover:text-[#5D4037] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Switcher Tabs & Search Inside Modal */}
            <div className="p-4 bg-[#FAF7F2] border-b border-[#F5EBE1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#E8DCCF]">
                <button
                  type="button"
                  onClick={() => switchDashboardModalType('ACTIVE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dashboardModalType === 'ACTIVE'
                      ? 'bg-[#059669] text-white shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>กำลังใช้งาน ({stats.subscriptions.active})</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchDashboardModalType('EXPIRING_SOON')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dashboardModalType === 'EXPIRING_SOON'
                      ? 'bg-[#D97706] text-white shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ใกล้หมดอายุ ({stats.subscriptions.expiringSoon})</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchDashboardModalType('SERVICING')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dashboardModalType === 'SERVICING'
                      ? 'bg-[#E11D48] text-white shadow-xs'
                      : 'text-[#8D6E63] hover:text-[#5D4037]'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>รอเปลี่ยนรหัส ({stats.subscriptions.servicingQueue})</span>
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#A1887F] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dashboardModalSearch}
                  onChange={(e) => setDashboardModalSearch(e.target.value)}
                  placeholder="ค้นหาอีเมล, ผู้ซื้อ, ชื่อแอป..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-full bg-white border border-[#E8DCCF] text-xs font-medium text-[#5D4037] placeholder-[#A1887F] focus:outline-none focus:border-[#FFB4A2]"
                />
                {dashboardModalSearch && (
                  <button
                    type="button"
                    onClick={() => setDashboardModalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D6E63] hover:text-[#5D4037]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body / Items List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {/* SERVICING LIST */}
              {dashboardModalType === 'SERVICING' && (() => {
                const q = dashboardModalSearch.trim().toLowerCase();
                const servicingList = stocks
                  .filter((s) => s.status === 'SERVICING')
                  .filter((s) => {
                    if (!q) return true;
                    return (
                      s.email.toLowerCase().includes(q) ||
                      s.productName.toLowerCase().includes(q) ||
                      (s.notes && s.notes.toLowerCase().includes(q))
                    );
                  });

                if (servicingList.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-sm text-[#5D4037]">
                        {q ? `ไม่พบบัญชีรอเปลี่ยนรหัสที่ตรงกับ "${dashboardModalSearch}"` : 'ยอดเยี่ยม! ไม่มีบัญชีค้างในคิวรอเปลี่ยนรหัส'}
                      </p>
                      <p className="text-xs text-[#8D6E63]">
                        บัญชีสต็อกทั้งหมดได้รับการอัปเดตและพร้อมจำหน่ายตามปกติ
                      </p>
                    </div>
                  );
                }

                return servicingList.map((stock) => (
                  <div
                    key={stock.id}
                    className="p-4 rounded-2xl bg-[#FFFBFB] border border-[#FFD9CE] space-y-3 hover:border-[#FFB4A2] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#FFD9CE]/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#5D4037]">{stock.productName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                          รอเปลี่ยนรหัสผ่าน
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDashboardModalType(null);
                          setRecycleStock(stock);
                          setRecycleNewPassword('');
                        }}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-2xs active:scale-95 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>เปลี่ยนรหัส & Recycle นำเข้าสต็อก</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#8D6E63] block">อีเมล / เบอร์โทร:</span>
                          <span className="font-mono font-bold text-[#5D4037] select-all">{stock.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(stock.email, `serv-email-${stock.id}`)}
                          className="p-1 rounded-lg hover:bg-[#FFF0EB] text-[#8D6E63]"
                          title="คัดลอกอีเมล"
                        >
                          {copiedId === `serv-email-${stock.id}` ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-[#E8DCCF] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#8D6E63] block">รหัสผ่านปัจจุบัน:</span>
                          <span className="font-mono font-bold text-[#E5989B] select-all">{stock.password}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(stock.password, `serv-pwd-${stock.id}`)}
                          className="p-1 rounded-lg hover:bg-[#FFF0EB] text-[#8D6E63]"
                          title="คัดลอกรหัสผ่าน"
                        >
                          {copiedId === `serv-pwd-${stock.id}` ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {stock.notes && (
                      <p className="text-[11px] text-[#8D6E63] bg-white/70 px-3 py-1.5 rounded-xl border border-[#E8DCCF]/60">
                        <span className="font-bold">หมายเหตุ:</span> {stock.notes}
                      </p>
                    )}
                  </div>
                ));
              })()}

              {/* ACTIVE OR EXPIRING_SOON LIST */}
              {(dashboardModalType === 'ACTIVE' || dashboardModalType === 'EXPIRING_SOON') && (() => {
                const q = dashboardModalSearch.trim().toLowerCase();
                const now = Date.now();
                const in24h = now + 24 * 60 * 60 * 1000;

                const filtered = orders.filter((ord: any) => {
                  if (dashboardModalType === 'EXPIRING_SOON') {
                    const exp = new Date(ord.expiresAt).getTime();
                    if (ord.status !== 'ACTIVE' || exp > in24h) return false;
                  } else {
                    if (ord.status !== 'ACTIVE') return false;
                  }

                  if (!q) return true;
                  return (
                    ord.orderNumber.toLowerCase().includes(q) ||
                    ord.productName.toLowerCase().includes(q) ||
                    ord.email.toLowerCase().includes(q) ||
                    ord.buyerUsername.toLowerCase().includes(q) ||
                    (ord.buyerProfileName && ord.buyerProfileName.toLowerCase().includes(q)) ||
                    ord.slotName.toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-3xl bg-[#FFF8F3] border border-[#FFD9CE] flex items-center justify-center text-[#E5989B]">
                        <ShoppingBag className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-sm text-[#5D4037]">
                        {q ? `ไม่พบรายการที่ตรงกับ "${dashboardModalSearch}"` : 'ไม่พบบัญชีในหมวดหมู่นี้'}
                      </p>
                      <p className="text-xs text-[#8D6E63]">
                        {dashboardModalType === 'EXPIRING_SOON'
                          ? 'ไม่มีบัญชีที่กำลังจะหมดอายุในอีก 24 ชั่วโมงข้างหน้า'
                          : 'ยังไม่มีคำสั่งซื้อที่อยู่ในสถานะใช้งาน'}
                      </p>
                    </div>
                  );
                }

                return filtered.map((ord: any) => {
                  const rem = formatRemainingTime(ord.expiresAt);

                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-white border border-[#E8DCCF] space-y-3 hover:border-[#FFB4A2] transition-colors shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DCCF]/60 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#8D6E63]">#{ord.orderNumber}</span>
                          <span className="font-extrabold text-sm text-[#5D4037]">{ord.productName}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE8D6] text-[#6D4C41] border border-[#FFCDB2]">
                            {ord.slotName}
                          </span>
                          {ord.slotPin && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
                              PIN: {ord.slotPin}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                              rem.isUrgent
                                ? 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]'
                                : 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{rem.text}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#E8DCCF] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#8D6E63] block">อีเมล / บัญชี:</span>
                            <span className="font-mono font-bold text-[#5D4037] select-all">{ord.email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(ord.email, `ord-email-${ord.id}`)}
                            className="p-1 rounded-lg hover:bg-[#FFF0EB] text-[#8D6E63]"
                            title="คัดลอกอีเมล"
                          >
                            {copiedId === `ord-email-${ord.id}` ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#8D6E63]" />}
                          </button>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#FFFDF7] border border-[#E8DCCF] flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#8D6E63] block">รหัสผ่าน:</span>
                            <span className="font-mono font-bold text-[#E5989B] select-all">{ord.password}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyText(ord.password, `ord-pwd-${ord.id}`)}
                            className="p-1 rounded-lg hover:bg-[#FFF0EB] text-[#8D6E63]"
                            title="คัดลอกรหัสผ่าน"
                          >
                            {copiedId === `ord-pwd-${ord.id}` ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5 text-[#8D6E63]" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8D6E63] pt-1">
                        <div>
                          ผู้ซื้อ: <span className="font-bold text-[#5D4037]">@{ord.buyerUsername}</span>
                          {ord.buyerProfileName && ` (${ord.buyerProfileName})`}
                          {' • '}
                          ยอดเงิน: <span className="font-bold text-[#E5989B]">{ord.amountPaid} ฿</span>
                        </div>
                        <div>
                          หมดอายุ:{' '}
                          <span className="font-bold text-[#5D4037]">
                            {new Date(ord.expiresAt).toLocaleString('th-TH', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Sticky Footer */}
            <div className="px-6 py-3.5 bg-[#FAF7F2] border-t border-[#F5EBE1] flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 sticky bottom-0 z-10">
              <span className="text-xs text-[#8D6E63] font-medium">
                {dashboardModalType === 'SERVICING'
                  ? `แสดงบัญชีรอเปลี่ยนรหัสทั้งหมด ${stocks.filter((s) => s.status === 'SERVICING').length} รายการ`
                  : dashboardModalType === 'EXPIRING_SOON'
                  ? `แสดงบัญชีใกล้หมดอายุ ${stats.subscriptions.expiringSoon} รายการ`
                  : `แสดงบัญชีกำลังใช้งาน ${stats.subscriptions.active} รายการ`}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {dashboardModalType === 'SERVICING' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDashboardModalType(null);
                      handleTabClick('STOCKS');
                      setStockStatusFilter('SERVICING');
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                  >
                    <span>ไปที่หน้าสต็อกทั้งหมด</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDashboardModalType(null);
                      handleTabClick('ORDERS');
                      setOrderStatusFilter(dashboardModalType === 'EXPIRING_SOON' ? 'EXPIRING_SOON' : 'ACTIVE');
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-[#5D4037] border border-[#FFD9CE] hover:bg-[#FFF8F3]"
                  >
                    <span>ไปที่หน้าคำสั่งซื้อทั้งหมด</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDashboardModalType(null)}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#FFB4A2] text-white hover:bg-[#E5989B] shadow-2xs"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
