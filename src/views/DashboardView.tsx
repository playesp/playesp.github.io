import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  Coins, 
  Users, 
  Award, 
  Share2, 
  Copy, 
  Check, 
  ArrowUpRight, 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  Download, 
  TrendingUp, 
  CreditCard,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  LogOut,
  RefreshCw,
  Lock,
  Eye,
  Settings,
  Camera,
  Upload,
  History,
  Mail,
  Phone,
  Gift,
  Clock,
  Search,
  Filter,
  Receipt,
  Trophy,
  Zap,
  Flame,
  ChevronRight,
  Calendar,
  User as UserIcon,
  MessageSquare,
  FileText,
  BadgeAlert,
  Briefcase,
  Gamepad2,
  Crop
} from 'lucide-react';
import type { 
  UserProfile, 
  PlatformSettings, 
  ReferralRecord, 
  WalletTransaction, 
  NotificationItem, 
  PayoutRequest,
  UserSession,
  CoinTransactionRecord,
  UserComplaint,
  NwiTreeRecord
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { MultiCardShowcase } from '../components/MultiCardShowcase.tsx';
import { PromotionalPoster } from '../components/PromotionalPoster.tsx';
import { DailyStreakCounter } from '../components/DailyStreakCounter.tsx';
import { DailyTasks } from '../components/DailyTasks.tsx';
import { ReferralGrowthChart } from '../components/ReferralGrowthChart.tsx';
import { ReferralAnalytics } from '../components/ReferralAnalytics.tsx';
import { TopReferrersWidget } from '../components/TopReferrersWidget.tsx';
import { DailyTopEarners } from '../components/DailyTopEarners.tsx';
import { TransactionHistory } from '../components/TransactionHistory.tsx';
import { FRAME_CATALOG, VIP_TIERS } from '../config/economy.ts';
import { showToast } from '../services/toast.ts';
import { auth, signInWithGoogle, syncUserToFirestore } from '../services/firebase.ts';
import { UserProfileSheetModal, type RichProfileData } from '../components/UserProfileSheetModal.tsx';
import { FacebookPhotoCropModal } from '../components/FacebookPhotoCropModal.tsx';


export type DashboardTabType =
  | 'overview'
  | 'idcard'
  | 'poster'
  | 'referrals'
  | 'nwi_tree'
  | 'wallet'
  | 'transactions'
  | 'coins_ledger'
  | 'complaints'
  | 'profile'
  | 'devices';

interface DashboardViewProps {
  user: UserProfile;
  settings: PlatformSettings;
  initialSubTab?: DashboardTabType;
  onSubTabChange?: (tab: DashboardTabType) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenBuyCoins?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  settings,
  initialSubTab,
  onSubTabChange,
  onUpdateUser,
  onNavigateToTab,
  onOpenBuyCoins,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTabType>(initialSubTab || 'overview');
  const [idCardViewMode, setIdCardViewMode] = useState<'primary' | 'multicard'>('primary');
  
  // NWI 3-Level Auto Tree State
  const [nwiTree, setNwiTree] = useState<NwiTreeRecord | null>(null);
  const [loadingNwi, setLoadingNwi] = useState(false);
  const [claimingNwi, setClaimingNwi] = useState(false);
  const [nwiFeedback, setNwiFeedback] = useState<string | null>(null);
  const [activatingNwiTier, setActivatingNwiTier] = useState(false);

  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);

  // Self Plan Upgrade (₹100+) State
  const [upgradeServiceCode, setUpgradeServiceCode] = useState<string>(user.chosenServiceCode || 'SWI');
  const [upgradeFee, setUpgradeFee] = useState<string>(user.chosenServiceCode === 'SWI' ? '300' : '100');
  const [upgradeUtr, setUpgradeUtr] = useState<string>('');
  const [upgradeSubmitting, setUpgradeSubmitting] = useState<boolean>(false);
  const [upgradeMsg, setUpgradeMsg] = useState<{ text: string; error: boolean } | null>(null);
  const [copiedSwiLink, setCopiedSwiLink] = useState<boolean>(false);

  // Coins Ledger State
  const [coinTransactions, setCoinTransactions] = useState<CoinTransactionRecord[]>([]);
  const [loadingCoinsHistory, setLoadingCoinsHistory] = useState(false);
  const [coinFilter, setCoinFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Help & Complaints State
  const [complaints, setComplaints] = useState<UserComplaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<'payment' | 'coins' | 'account' | 'game' | 'other'>('payment');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintNotice, setComplaintNotice] = useState<{ text: string; error: boolean } | null>(null);

  // Direct avatar & cover photo crop/upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [photoCropState, setPhotoCropState] = useState<{
    open: boolean;
    kind: 'avatar' | 'cover';
    src: string;
  }>({ open: false, kind: 'avatar', src: '' });
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('50');
  const [withdrawUpi, setWithdrawUpi] = useState<string>(user.payoutUpiId || user.paymentAddress || '');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  // Multi-device session management state
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [terminatingAll, setTerminatingAll] = useState(false);
  const [sessionActionMessage, setSessionActionMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Telegram-style Profile Form state with all editable fields
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName || '',
    username: user.username || '',
    location: user.location || '',
    phone: user.phone || '',
    email: user.email || '',
    avatar: user.avatar || '',
    bio: user.bio || '',
    gender: user.gender || 'male',
    fullAddress: user.fullAddress || '',
    paymentAddress: user.paymentAddress || '',
    payoutUpiId: user.payoutUpiId || user.paymentAddress || '',
    accountType: (user.accountType === 'gamer' ? 'gamer' : 'business') as 'business' | 'gamer',
    password: '',
    privacySettings: {
      showPhone: Boolean(user.privacySettings?.showPhone),
      showEmail: Boolean(user.privacySettings?.showEmail),
      showAddress: Boolean(user.privacySettings?.showAddress),
    },
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [usernameCheck, setUsernameCheck] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });
  const [profileSheetOpen, setProfileSheetOpen] = useState<{
    open: boolean;
    mode: 'view' | 'edit' | 'search';
  }>({ open: false, mode: 'view' });

  // Level-Up Confetti & Celebratory Animation state
  const prevLevelRef = useRef<number>(user.gameLevel || 1);
  const [levelUpModal, setLevelUpModal] = useState<{ oldLevel: number; newLevel: number } | null>(null);

  // Referral breakdown search & filter state
  const [referralFilter, setReferralFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [referralSearch, setReferralSearch] = useState('');

  // Payout History search, filter, and digital receipt modal state
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [payoutSearch, setPayoutSearch] = useState('');
  const [copiedTxnId, setCopiedTxnId] = useState<string | null>(null);
  const [selectedPayoutReceipt, setSelectedPayoutReceipt] = useState<PayoutRequest | null>(null);
  const [receiptCopied, setReceiptCopied] = useState(false);

  // Level-Up celebration watcher: triggers confetti animation when reaching a new game level
  useEffect(() => {
    const currentLvl = user.gameLevel || 1;
    if (currentLvl > prevLevelRef.current) {
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 60,
          origin: { x: 0.1, y: 0.7 },
          colors: ['#ffd700', '#ff69b4', '#00ffcc'],
        });
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 60,
          origin: { x: 0.9, y: 0.7 },
          colors: ['#ffd700', '#ff69b4', '#00ffcc'],
        });
      }, 250);
      setLevelUpModal({ oldLevel: prevLevelRef.current, newLevel: currentLvl });
    }
    prevLevelRef.current = currentLvl;
  }, [user.gameLevel]);

  useEffect(() => {
    if (initialSubTab && initialSubTab !== activeTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    onSubTabChange?.(activeTab);
  }, [activeTab]);

  useEffect(() => {
    setProfileForm(prev => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      username: user.username || '',
      location: user.location || '',
      phone: user.phone || prev.phone,
      email: user.email || prev.email,
      avatar: user.avatar || '',
      bio: user.bio || '',
      gender: user.gender || 'male',
      fullAddress: user.fullAddress || '',
      paymentAddress: user.paymentAddress || '',
      payoutUpiId: user.payoutUpiId || user.paymentAddress || '',
      accountType: (user.accountType === 'gamer' ? 'gamer' : 'business') as 'business' | 'gamer',
    }));
  }, [user.userId, user.accountType, user.fullName, user.username, user.location, user.avatar, user.bio, user.payoutUpiId]);

  // Debounced live uniqueness check for @username in Dashboard Profile form
  useEffect(() => {
    const cleaned = profileForm.username.trim().replace(/^@+/, '').toLowerCase();
    if (!cleaned) {
      setUsernameCheck({ status: 'idle', message: '' });
      return;
    }
    if (!/^[a-z0-9]{3,24}$/.test(cleaned)) {
      setUsernameCheck({
        status: 'invalid',
        message: 'कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें।',
      });
      return;
    }
    if (cleaned === (user.username || '').toLowerCase()) {
      setUsernameCheck({ status: 'available', message: `@${cleaned} आपका सक्रिय यूनिक यूज़रनेम है।` });
      return;
    }
    let cancelled = false;
    setUsernameCheck({ status: 'checking', message: 'उपलब्धता जांची जा रही है...' });
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsernameAvailability(cleaned, user.userId);
        if (cancelled) return;
        if (res.available) {
          setUsernameCheck({ status: 'available', message: `@${res.normalized || cleaned} उपलब्ध है!` });
        } else {
          setUsernameCheck({
            status: 'taken',
            message: res.message || `@${cleaned} पहले से दूसरे यूज़र के पास है!`,
          });
        }
      } catch {
        if (!cancelled) setUsernameCheck({ status: 'idle', message: '' });
      }
    }, 320);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [profileForm.username, user.username, user.userId]);



  // Dual ID Architecture (ESP Earning ID vs ESP Gaming Time ID - No Symbols)
  const gamingId = user.gamingId || `ESPGT${user.userId.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '01'}`;
  const [copiedEspId, setCopiedEspId] = useState(false);
  const [copiedGamingId, setCopiedGamingId] = useState(false);
  const [dashboardHubMode, setDashboardHubMode] = useState<'earning' | 'gaming'>('earning');

  const handleCopyEspId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedEspId(true);
    setTimeout(() => setCopiedEspId(false), 2000);
  };

  const handleCopyGamingId = () => {
    navigator.clipboard.writeText(gamingId);
    setCopiedGamingId(true);
    setTimeout(() => setCopiedGamingId(false), 2000);
  };

  // Display genuine referrals list from backend DB (zero fake fallback entries)
  const displayReferrals: ReferralRecord[] = useMemo(() => {
    return referrals || [];
  }, [referrals]);

  // Filtered referrals based on search and status
  const filteredReferrals = useMemo(() => {
    return displayReferrals.filter(ref => {
      const matchesFilter =
        referralFilter === 'all'
          ? true
          : referralFilter === 'active'
          ? ref.status === 'credited'
          : ref.status === 'pending';
      const q = (referralSearch || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (ref.downlineName || '').toLowerCase().includes(q) ||
        (ref.downlineUserId || '').toLowerCase().includes(q) ||
        (ref.serviceCode || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [displayReferrals, referralFilter, referralSearch]);

  // Display genuine payout history from backend DB
  const displayPayouts: PayoutRequest[] = useMemo(() => {
    return payouts || [];
  }, [payouts]);

  // Filtered payouts based on search and status
  const filteredPayouts = useMemo(() => {
    return displayPayouts.filter(po => {
      const matchesFilter = payoutFilter === 'all' ? true : po.status === payoutFilter;
      const q = (payoutSearch || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (po.payoutAddress || '').toLowerCase().includes(q) ||
        (po.transactionRef || '').toLowerCase().includes(q) ||
        (po.id || '').toLowerCase().includes(q) ||
        String(po.amount || '').includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [displayPayouts, payoutFilter, payoutSearch]);

  const handleCopyTxnId = (txnId: string) => {
    navigator.clipboard.writeText(txnId);
    setCopiedTxnId(txnId);
    setTimeout(() => setCopiedTxnId(null), 2000);
  };

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${user.userId}`
    : `https://esp.platform/?ref=${user.userId}`;

  const loadDashboardData = async () => {
    try {
      const data = await api.getUserDashboard(user.userId);
      if (data) {
        if (data.user) onUpdateUser(data.user);
        if (data.referrals) setReferrals(data.referrals);
        if (data.transactions) setTransactions(data.transactions);
        if (data.notifications) setNotifications(data.notifications);
        if (data.payouts) setPayouts(data.payouts);
      }
    } catch (e) {
      console.warn('Failed to refresh dashboard data', e);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadDashboardData();
    setTimeout(() => setIsSyncing(false), 500);
  };

  const handleRefreshPayouts = async () => {
    setPayoutsLoading(true);
    await loadDashboardData();
    setTimeout(() => setPayoutsLoading(false), 500);
  };

  const loadCoinsHistory = async () => {
    setLoadingCoinsHistory(true);
    try {
      const res = await api.getCoinHistory(user.userId);
      setCoinTransactions(Array.isArray(res) ? res : (res as any)?.transactions || []);
    } catch (e) {
      console.warn('Failed to load coin history', e);
    } finally {
      setLoadingCoinsHistory(false);
    }
  };

  const loadComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const list = await api.getUserComplaints(user.userId);
      setComplaints(list || []);
    } catch (e) {
      console.warn('Failed to load user complaints', e);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const loadNwiTree = async () => {
    setLoadingNwi(true);
    try {
      const res = await api.getNwiTree(user.userId);
      if (res && res.tree) {
        setNwiTree(res.tree);
      }
    } catch (e) {
      console.warn('Failed to load NWI tree', e);
    } finally {
      setLoadingNwi(false);
    }
  };

  const handleClaimNwi = async () => {
    if (!nwiTree || nwiTree.pendingToClaim <= 0) return;
    setClaimingNwi(true);
    setNwiFeedback(null);
    try {
      const res = await api.claimNwiReward(user.userId);
      if (res.success) {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        setNwiFeedback(`🎉 ₹${res.claimedAmount} तुरंत आपके वॉलेट में क्रेडिट हो गया!`);
        await loadDashboardData();
        await loadNwiTree();
      } else {
        setNwiFeedback(res.message || 'रिवॉर्ड क्लेम विफल रहा।');
      }
    } catch (e: any) {
      setNwiFeedback(e.message || 'रिवॉर्ड क्लेम विफल रहा।');
    } finally {
      setClaimingNwi(false);
    }
  };

  const handleActivateNwiTier = async (tierFee: number) => {
    setActivatingNwiTier(true);
    setNwiFeedback(null);
    try {
      const res = await api.activateNwi(user.userId, tierFee);
      if (res.success) {
        confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
        setNwiFeedback(`🎉 NWI ₹${tierFee} टियर सफलतापूर्वक सक्रिय हो गया!`);
        await loadDashboardData();
        await loadNwiTree();
      } else {
        setNwiFeedback(res.message || 'सक्रियता विफल रही।');
      }
    } catch (e: any) {
      setNwiFeedback(e.message || 'सक्रियता विफल रही।');
    } finally {
      setActivatingNwiTier(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'nwi_tree') {
      loadNwiTree();
    }
  }, [activeTab, user.userId]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDescription.trim()) {
      setComplaintNotice({ text: 'कृपया विषय और शिकायत का विवरण दर्ज करें।', error: true });
      return;
    }
    setSubmittingComplaint(true);
    setComplaintNotice(null);
    try {
      const res = await api.submitComplaint({
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone || '',
        category: complaintCategory,
        subject: complaintSubject.trim(),
        description: complaintDescription.trim(),
      });
      if (res.success) {
        setComplaintNotice({ text: res.message || 'शिकायत सफलतापूर्वक दर्ज की गई!', error: false });
        setComplaintSubject('');
        setComplaintDescription('');
        await loadComplaints();
      } else {
        setComplaintNotice({ text: res.message || 'शिकायत दर्ज करने में विफल।', error: true });
      }
    } catch (err: any) {
      setComplaintNotice({ text: err?.message || 'शिकायत दर्ज करने में त्रुटि आई।', error: true });
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleDirectAvatarUpload = (file: File, kind: 'avatar' | 'cover' = 'avatar') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => showToast('फोटो पढ़ने में समस्या आई।', 'error');
    reader.onloadend = () => {
      if (typeof reader.result === 'string' && reader.result) {
        setPhotoCropState({
          open: true,
          kind,
          src: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDashboardPhotoCrop = async (croppedDataUrl: string) => {
    const { kind } = photoCropState;
    setPhotoCropState(prev => ({ ...prev, open: false }));
    setUploadingAvatar(true);
    try {
      if (kind === 'cover') {
        const updated = await api.updateUserProfile(user.userId, { coverPhoto: croppedDataUrl });
        onUpdateUser(updated);
        syncUserToFirestore(updated, true).catch(() => {});
        showToast('🖼️ कवर फोटो एडजस्ट व सेव हो गई!', 'success');
      } else {
        const res = await api.uploadUserAvatar(user.userId, croppedDataUrl);
        if (res.success) {
          const updated = res.user || { ...user, avatar: croppedDataUrl };
          showToast('प्रोफाइल फोटो क्रॉप व अपडेट हो गई!', 'success');
          onUpdateUser(updated);
          syncUserToFirestore(updated, true).catch(() => {});
          setProfileForm(prev => ({ ...prev, avatar: croppedDataUrl }));
        } else {
          showToast(res.message || 'फोटो अपलोड करने में विफल', 'error');
        }
      }
    } catch (err: any) {
      showToast(err?.message || 'फोटो अपलोड में त्रुटि आई', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadCoinsHistory();
    loadComplaints();
    // Real-time synchronization across multiple devices:
    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, [user.userId]);

  const handleTerminateSession = async (sessionId?: string, allOthers = false) => {
    if (allOthers) {
      setTerminatingAll(true);
    } else if (sessionId) {
      setTerminatingSessionId(sessionId);
    }
    setSessionActionMessage(null);

    try {
      const res = await api.terminateSession(user.userId, sessionId, allOthers);
      if (res.success) {
        setSessionActionMessage(res.message);
        await loadDashboardData();
      }
    } catch (err: any) {
      setSessionActionMessage(err.message || 'कार्रवाई असफल रही');
    } finally {
      setTerminatingAll(false);
      setTerminatingSessionId(null);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareReferralLink = async () => {
    // 1. Copy link automatically with sponsor ID
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast(`Referral link copied! (Sponsor ID: ${user.userId})`, 'success');
    } catch (e) {
      console.warn('Clipboard write failed:', e);
    }

    // 2. Open device native share sheet
    const shareData = {
      title: 'Join Earning System Platform (ESP)',
      text: `💼 Join ESP under my direct sponsorship (ID: ${user.userId}) and start daily online earnings!\nMember: ${user.fullName}\nPlan: ${user.chosenServiceName || 'EMO'}\nLink:`,
      url: referralUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Referral link shared successfully!', 'success');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share error:', err);
        }
      }
    }
  };

  const whatsappInviteUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `🔥 *EARNING SYSTEM PLATFORM (ESP) - WORK FROM HOME JOB* 🔥\n\n` +
    `नमस्ते! मैंने EARNING SYSTEM PLATFORM (ESP) जॉइन किया है जहाँ सोशल मीडिया और डिजिटल सर्विसेज की मदद से घर बैठे प्रतिदिन कमाए जा सकते हैं।\n\n` +
    `✅ शुरुआत सिर्फ ₹10 से\n` +
    `✅ EMO, MMO, MOM & नॉन-वर्किंग ऑटो पूल इनकम\n` +
    `✅ तुरंत UPI में पेमेंट (Google Pay / PhonePe)\n` +
    `✅ वेरिफाइड मेंबर डिजिटल ID कार्ड\n\n` +
    `👉 *मेरे स्पॉन्सर लिंक से अभी जॉइन करें:*\n` +
    `${referralUrl}\n\n` +
    `👤 *Sponsor Name:* ${user.fullName}\n` +
    `🆔 *Sponsor Roll No:* ${user.userId}`
  )}`;

  const activeFrameInfo = FRAME_CATALOG.find(f => f.variant === (user.frameType || 'standard')) || FRAME_CATALOG[0];
  const activeVipInfo = VIP_TIERS.find(v => v.id === user.vipTier);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawMessage(null);

    const amt = Number(withdrawAmount);
    if (isNaN(amt) || amt < settings.minWithdrawal) {
      setWithdrawMessage({ text: `न्यूनतम निकासी राशि ₹${settings.minWithdrawal} है।`, error: true });
      setWithdrawLoading(false);
      return;
    }

    if (amt > user.balance) {
      setWithdrawMessage({ text: `अपर्याप्त बैलेंस! आपका वर्तमान बैलेंस ₹${user.balance} है।`, error: true });
      setWithdrawLoading(false);
      return;
    }

    try {
      const res = await api.requestWithdrawal(user.userId, amt, withdrawUpi);
      if (res.success) {
        setWithdrawMessage({ text: 'पेआउट अनुरोध सफलतापूर्वक सबमिट कर दिया गया है!', error: false });
        loadDashboardData();
      } else {
        setWithdrawMessage({ text: res.message || 'Withdrawal failed', error: true });
      }
    } catch (err: any) {
      setWithdrawMessage({ text: err.message || 'Server error during withdrawal', error: true });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.username.trim() && (usernameCheck.status === 'taken' || usernameCheck.status === 'invalid')) {
      setProfileMessage(usernameCheck.message || 'कृपया एक यूनिक और मान्य @username चुनें।');
      return;
    }
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const cleanHandle = profileForm.username.trim().replace(/^@+/, '').toLowerCase();
      const updated = await api.updateUserProfile(user.userId, {
        ...profileForm,
        username: cleanHandle || undefined,
      });
      onUpdateUser(updated);
      setProfileMessage('प्रोफाइल, यूनिक @username और प्राइवेसी सेटिंग्स सफलतापूर्वक अपडेट हो गई हैं!');
    } catch (err: any) {
      setProfileMessage(err.message || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCloudSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (!auth.currentUser) {
        await signInWithGoogle();
      }
      await syncUserToFirestore(user, false);
      showToast('☁️ प्रोफाइल व वॉलेट रिकॉर्ड सफलतापूर्वक Firestore Cloud पर सिंक हो गया!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Cloud Sync के लिए Google सत्यापन पूरा करें।', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeMsg(null);
    const feeNum = Number(upgradeFee);
    if (!feeNum || feeNum < 100) {
      setUpgradeMsg({ text: 'न्यूनतम प्लान अपग्रेड राशि ₹100 है।', error: true });
      return;
    }
    if (!upgradeUtr.trim() || upgradeUtr.trim().length < 6) {
      setUpgradeMsg({ text: 'कृपया मान्य 12-अंकों का UPI UTR / Ref नंबर दर्ज करें।', error: true });
      return;
    }
    setUpgradeSubmitting(true);
    try {
      const res = await api.submitPlanUpgrade(user.userId, upgradeServiceCode, feeNum, upgradeUtr.trim());
      if (res.success) {
        setUpgradeMsg({ text: res.message || 'प्लान अपग्रेड अनुरोध एडमिन सत्यापन के लिए भेज दिया गया है!', error: false });
        setUpgradeUtr('');
        showToast('प्लान अपग्रेड अनुरोध सबमिट हो गया!', 'success');
      } else {
        setUpgradeMsg({ text: res.message || 'अनुरोध विफल रहा।', error: true });
      }
    } catch (err: any) {
      setUpgradeMsg({ text: err.message || 'त्रुटि हुई', error: true });
    } finally {
      setUpgradeSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 py-4 pb-20 w-full overflow-x-hidden">
      {/* ===================== FLIPKART TOP MEMBER HEADER ===================== */}
      <div className="bg-[#2874f0] rounded-md p-4 sm:p-6 text-white shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-[#ffe500] bg-white flex items-center justify-center text-[#2874f0] font-black text-2xl sm:text-3xl shadow-xs overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <label
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#ffe500] hover:bg-yellow-300 text-[#212121] shadow cursor-pointer transition border-2 border-[#2874f0]"
                title="फोटो अपलोड करें (Profile Photo Upload)"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleDirectAvatarUpload(file, 'avatar');
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <div className="space-y-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{user.fullName}</h1>
                {user.username && (
                  <span className="bg-cyan-400/20 text-[#ffe500] border border-cyan-300/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded">
                    @{user.username}
                  </span>
                )}
                <span className="bg-[#388e3c] text-white text-[10px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED MEMBER
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-2.5 py-0.5 rounded border border-white/30 flex items-center gap-1 cursor-pointer transition"
                  title="प्रोफाइल टाइप बदलें या विवरण अपडेट करें"
                >
                  {user.accountType === 'gamer' ? (
                    <>
                      <Gamepad2 className="w-3 h-3 text-[#ffe500]" />
                      <span>🎮 Gaming Profile</span>
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-3 h-3 text-[#ffe500]" />
                      <span>💼 Business Profile</span>
                    </>
                  )}
                  <span className="underline ml-1 text-[#ffe500]">Edit</span>
                </button>
              </div>
              <p className="text-xs text-blue-100">
                Plan: <strong className="text-[#ffe500]">{user.chosenServiceName} (₹{user.joiningFee})</strong> | Joined: {user.joiningDate}
              </p>
              <p className="text-[11px] text-blue-100">
                EARNING SYSTEM PLATFORM (ESP) • ESP GAMING TIME
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 sm:gap-2">
            {user.accountType === 'gamer' && onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('gaming-room')}
                className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Back to Game Setup</span>
              </button>
            )}
            <button
              onClick={() => onOpenBuyCoins?.()}
              className="bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              title="रियल UPI से कॉइन्स खरीदें"
            >
              <span>🪙 {(user.coins || 0).toLocaleString()} • Buy Coins</span>
            </button>

            <button
              onClick={handleShareReferralLink}
              className="bg-[#fb641b] hover:bg-[#e5530d] text-white px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>Share Link</span>
            </button>

            <button
              onClick={() => setProfileSheetOpen({ open: true, mode: 'view' })}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              title="कवर फोटो, यूनिक @Username और सोशल प्रोफाइल खोलें"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#ffe500] shrink-0" />
              <span>ESP PLAY Profile</span>
            </button>

            <button
              onClick={() => onNavigateToTab?.('gaming-room')}
              className="bg-white text-[#2874f0] hover:bg-blue-50 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>🎮 GAMING TIME</span>
            </button>

            <button
              onClick={() => setActiveTab('idcard')}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5 text-[#ffe500] shrink-0" />
              <span>My ID Card</span>
            </button>

            <a
              href={whatsappInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#388e3c] hover:bg-emerald-700 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={handleCloudSync}
              disabled={isSyncing}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/25 px-2.5 sm:px-3 py-1.5 sm:py-2 min-h-[36px] rounded-sm text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
              title="Google से Firestore Cloud पर डेटा सिंक करें"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#ffe500] shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Cloud Sync'}</span>
            </button>
          </div>
        </div>

        {/* Dual ID Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/20">
          <div className="bg-white rounded-md p-3.5 text-[#212121] flex flex-col justify-between space-y-2 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    ESP ID
                  </span>
                  <span className="text-[11px] font-bold text-[#388e3c]">Earning &amp; Sponsor ID</span>
                </div>
                <p className="text-lg sm:text-xl font-black font-mono text-[#212121] tracking-wider pt-1 select-all break-all">
                  {user.userId}
                </p>
              </div>
              <button
                onClick={handleCopyEspId}
                className="px-2.5 py-1.5 rounded text-xs font-bold bg-[#f5f8ff] hover:bg-blue-50 text-[#2874f0] border border-blue-200 transition flex items-center space-x-1 cursor-pointer shrink-0"
              >
                {copiedEspId ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEspId ? 'Copied!' : 'Copy ESP ID'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              10 अर्निंग सर्विसेज, स्पॉन्सर रेफरल लिंक, डाउनलाइन टीम और बैंक/UPI पेआउट के लिए उपयोगी।
            </p>
          </div>

          <div className="bg-white rounded-md p-3.5 text-[#212121] flex flex-col justify-between space-y-2 shadow-2xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <span className="bg-[#2874f0] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    GAMING ID
                  </span>
                  <span className="text-[11px] font-bold text-[#2874f0]">ESP Gaming Time &amp; Club</span>
                </div>
                <p className="text-lg sm:text-xl font-black font-mono text-[#2874f0] tracking-wider pt-1 select-all break-all">
                  {gamingId}
                </p>
              </div>
              <button
                onClick={handleCopyGamingId}
                className="px-2.5 py-1.5 rounded text-xs font-bold bg-[#f5f8ff] hover:bg-blue-50 text-[#2874f0] border border-blue-200 transition flex items-center space-x-1 cursor-pointer shrink-0"
              >
                {copiedGamingId ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedGamingId ? 'Copied!' : 'Copy Gaming ID'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-600">
              ESP PLAY वॉइस स्टेज सीट, कॉइन गेम्स (लूडो, डाइस, कार्ड), गिफ्ट्स और चार्म्स के लिए उपयोगी।
            </p>
          </div>
        </div>

        {/* Dual Hub Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="bg-white/15 p-1 rounded flex flex-wrap items-center gap-1">
            <button
              onClick={() => { setDashboardHubMode('earning'); setActiveTab('overview'); }}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                dashboardHubMode === 'earning' ? 'bg-white text-[#2874f0] shadow-xs' : 'text-white hover:bg-white/10'
              }`}
            >
              🎓 ESP Student Hub
            </button>
            <button
              onClick={() => { setDashboardHubMode('gaming'); onNavigateToTab?.('gaming-room'); }}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                dashboardHubMode === 'gaming' ? 'bg-white text-[#2874f0] shadow-xs' : 'text-white hover:bg-white/10'
              }`}
            >
              🎮 ESP Gaming Time
            </button>
          </div>

          <a
            href="https://ioisplatform.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-3.5 py-1.5 rounded-sm text-xs font-extrabold transition shadow-xs inline-flex items-center space-x-1 cursor-pointer"
          >
            <span>🌐 ऑफिशियल पोर्टल</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Available Balance</span>
            <Coins className="w-4 h-4 text-[#388e3c]" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-[#388e3c] font-mono tabular-nums">₹{user.balance}</p>
          <button
            onClick={() => setActiveTab('wallet')}
            className="text-[11px] font-bold text-[#2874f0] hover:underline flex items-center space-x-1 pt-0.5 cursor-pointer"
          >
            <span>Withdraw to UPI</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Earnings</span>
            <TrendingUp className="w-4 h-4 text-[#2874f0]" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-[#212121] font-mono tabular-nums">₹{user.totalEarnings}</p>
          <p className="text-[11px] text-slate-500">Accumulated Income</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Referral Income</span>
            <Users className="w-4 h-4 text-[#fb641b]" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-[#2874f0] font-mono tabular-nums">₹{user.referralEarnings}</p>
          <p className="text-[11px] text-slate-500">{referrals.length} active members</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Total Withdrawn</span>
            <CheckCircle2 className="w-4 h-4 text-[#388e3c]" />
          </div>
          <p className="text-xl sm:text-3xl font-black text-[#212121] font-mono tabular-nums">₹{user.totalWithdrawn}</p>
          <p className="text-[11px] text-slate-500">Paid to UPI</p>
        </div>
      </div>

      {/* Referral Link Quick Action Bar (Works with BOTH User ID & Unique @Username) */}
      <div className="bg-white border border-slate-200 rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="space-y-1 text-center sm:text-left min-w-0 w-full sm:w-auto">
          <p className="text-[11px] font-bold text-[#2874f0] uppercase tracking-wider">
            YOUR SPONSOR REFERRAL LINKS (ID &amp; USERNAME दोनों से काम करता है)
          </p>
          <p className="font-mono text-xs text-[#212121] truncate select-all break-all max-w-full sm:max-w-md">
            {referralUrl}
          </p>
          {user.username && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[11px]">
              <span className="font-mono text-emerald-700 font-bold select-all break-all">
                {typeof window !== 'undefined' ? `${window.location.origin}/?ref=${user.username}` : `https://esp.platform/?ref=${user.username}`}
              </span>
              <button
                type="button"
                onClick={() => {
                  const uUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${user.username}` : `https://esp.platform/?ref=${user.username}`;
                  navigator.clipboard.writeText(uUrl);
                  showToast(`✅ Username Referral Link (@${user.username}) कॉपी हो गया!`, 'success');
                }}
                className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold cursor-pointer"
              >
                Copy @Link
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
          <button
            onClick={handleShareReferralLink}
            className="bg-[#fb641b] hover:bg-[#e5530d] px-3.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1.5 cursor-pointer text-white shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="bg-[#f9fafb] hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer text-[#212121]"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="bg-emerald-50 text-[#388e3c] border border-emerald-200 px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer font-mono"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="truncate max-w-[130px]">ESP: {user.userId}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-md p-1.5 sm:p-2 flex overflow-x-auto gap-1.5 text-[11px] sm:text-xs font-bold no-scrollbar shadow-2xs">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'idcard', label: 'My Verified ID Card' },
          { id: 'poster', label: 'Promo Posters' },
          { id: 'referrals', label: `My Team (${referrals.length})` },
          { id: 'nwi_tree', label: 'NWI 3-Level टीम' },
          { id: 'wallet', label: 'Wallet & Payouts' },
          { id: 'transactions', label: 'Transaction History (UTR)' },
          { id: 'coins_ledger', label: 'Coins Audit History' },
          { id: 'complaints', label: `Help & Complaints (${complaints.length})` },
          { id: 'profile', label: 'Profile & Privacy' },
          { id: 'devices', label: `Devices (${user.activeSessions?.length || 1}/4)` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 min-h-[36px] rounded transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#2874f0] text-white font-extrabold shadow-2xs'
                : 'text-slate-600 hover:text-[#212121] hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== TAB 1: OVERVIEW ===================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-extrabold text-[#212121] flex items-center gap-1.5 uppercase">
                <Award className="w-4 h-4 text-[#2874f0]" />
                <span>Official Digital ID Card</span>
              </h3>
              <DigitalIdCard user={user} settings={settings} compact={true} isVisitorPreview={false} />
              <button
                onClick={() => setActiveTab('idcard')}
                className="w-full py-2 rounded-sm text-xs font-bold text-[#2874f0] bg-[#f5f8ff] hover:bg-blue-50 transition border border-blue-200 text-center block cursor-pointer"
              >
                Full View &amp; Download ID Card
              </button>
            </div>

            {/* Real Coins, VIP Pass & Quality Frame Status Card */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-[#ffe500] text-[#212121] flex items-center justify-center font-black">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#212121]">Coins, VIP &amp; Frame Status</h3>
                    <p className="text-[11px] text-slate-500">100% Real Server Wallet</p>
                  </div>
                </div>
                <span className="font-mono font-black text-sm text-[#fb641b]">
                  🪙 {(user.coins || 0).toLocaleString()}
                </span>
              </div>

              <div className="bg-[#f9fafb] border border-slate-200 rounded p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">VIP Membership:</span>
                  <span className="font-bold text-[#2874f0]">
                    {activeVipInfo ? `${activeVipInfo.icon} ${activeVipInfo.name}` : 'No VIP (Free Tier)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Equipped Frame:</span>
                  <span className="font-bold text-[#212121]">
                    {activeFrameInfo.icon} {activeFrameInfo.name} ({activeFrameInfo.quality})
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 leading-relaxed">
                  नए खिलाड़ी हमेशा <strong>0 कॉइन्स</strong> से शुरू करते हैं। प्रत्येक रियल टास्क पूरा करने पर <strong>+5 कॉइन्स व EXP</strong> मिलते हैं। VIP और प्रीमियम फ्रेम्स कॉइन्स से अनलॉक होते हैं।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onOpenBuyCoins?.()}
                  className="py-2 px-2.5 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-xs cursor-pointer text-center"
                >
                  🪙 Buy Coins
                </button>
                <button
                  onClick={() => onNavigateToTab?.('gaming-room')}
                  className="py-2 px-2.5 rounded-sm text-xs font-bold text-[#2874f0] bg-[#f5f8ff] hover:bg-blue-50 border border-blue-200 transition cursor-pointer text-center"
                >
                  💎 VIP &amp; Frames
                </button>
              </div>
            </div>

            {/* Game Level & XP Card */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-blue-50 text-[#2874f0] flex items-center justify-center border border-blue-200">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#212121]">Game Level &amp; XP</h3>
                    <p className="text-[11px] text-slate-500">Level {user.gameLevel || 1} Member</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#2874f0] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                  LVL {user.gameLevel || 1}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Current XP: <strong className="text-[#212121]">{user.gameXp || 0} XP</strong></span>
                  <span>Next: <strong className="text-[#388e3c]">{((user.gameLevel || 1) * 200)} XP</strong></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-[#2874f0] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(4, (((user.gameXp || 0) % 200) / 200) * 100))}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <p className="text-[11px] text-slate-500">
                  केवल वेरिफाइड रियल टास्क (+5 Coins व EXP) पूर्ण करने पर EXP और लेवल बढ़ता है
                </p>
                <button
                  onClick={() => setActiveTab('coins_ledger')}
                  className="px-2.5 py-1 text-[11px] font-bold text-[#2874f0] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition shrink-0 cursor-pointer"
                >
                  Coins Ledger
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {/* Visual Daily Streak Counter (Consecutive Days + 7-Day Mystery Gift Progress) */}
            <DailyStreakCounter
              user={user}
              onUpdateUser={onUpdateUser}
              onOpenGames={() => onNavigateToTab?.('gaming-room')}
            />

            {/* Real Server-Verified Tasks & Challenges (+5 Coins & EXP on completion) */}
            <DailyTasks
              user={user}
              onUpdateUser={onUpdateUser}
              onNavigateToGames={() => onNavigateToTab?.('gaming-room')}
              onNavigateToVoiceRoom={() => onNavigateToTab?.('gaming-room')}
              onNavigateTab={(actionTab) => {
                if (actionTab === 'profile') setActiveTab('profile');
                else if (actionTab === 'moments') onNavigateToTab?.('moments');
                else if (actionTab === 'chat-club') onNavigateToTab?.('chat-club');
                else onNavigateToTab?.('gaming-room');
              }}
              onOpenBuyCoins={onOpenBuyCoins}
            />

            {/* Daily Top Earners Leaderboard */}
            <DailyTopEarners currentUser={user} />

            {/* Top 5 Referrers Leaderboard Widget */}
            <TopReferrersWidget currentUser={user} onShareLink={handleShareReferralLink} />

            {/* Detailed Referral Analytics & Historical Earnings */}
            <ReferralAnalytics
              user={user}
              referrals={displayReferrals}
              transactions={transactions}
              referralUrl={referralUrl}
              onShareLink={handleShareReferralLink}
            />

            {/* Referral Growth Chart */}
            <ReferralGrowthChart referrals={displayReferrals} sponsorUserId={user.userId} />

            {/* Live Notifications */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold text-[#212121] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#2874f0]" />
                  <span>Real-time Reward &amp; System Notifications</span>
                </h3>
                <span className="text-[10px] text-[#388e3c] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  Live Feed
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">कोई नई सूचना नहीं है।</p>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className="bg-[#f9fafb] p-3 rounded border border-slate-200 flex items-start space-x-2.5 text-xs"
                    >
                      <Sparkles className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-[#212121]">{notif.title}</p>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-slate-400">{new Date(notif.date).toLocaleString('hi-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured SWI 3.3% Special Recharge App Card */}
            {(user.chosenServiceCode === 'SWI' || user.swiAppLink) && (
              <div className="bg-white border border-blue-200 rounded-md p-4 sm:p-5 space-y-3 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded bg-[#2874f0] text-white flex items-center justify-center font-black">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#212121]">
                        {settings.swiSpecialAppName || 'Special 3.3% Commission Recharge App'} (SWI ₹300)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        हर मोबाइल रिचार्ज पर पक्का 3.3% कमीशन + रेफर पर 50% (₹150) सीधा लाभ
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${
                    user.swiAppLink
                      ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {user.swiAppLink ? 'APP LINK UNLOCKED' : 'VERIFICATION PENDING'}
                  </span>
                </div>

                {user.swiAppLink ? (
                  <div className="bg-[#f5f8ff] border border-blue-200 rounded p-3 space-y-2.5">
                    {user.swiAppNote && (
                      <p className="text-xs text-[#212121] leading-relaxed">{user.swiAppNote}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={user.swiAppLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-blue-700 transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open / Download 3.3% Recharge App</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(user.swiAppLink || '');
                          setCopiedSwiLink(true);
                          setTimeout(() => setCopiedSwiLink(false), 2000);
                        }}
                        className="px-3 py-2 rounded-sm text-xs font-bold text-[#2874f0] bg-white hover:bg-blue-50 border border-blue-200 cursor-pointer flex items-center gap-1"
                      >
                        {copiedSwiLink ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSwiLink ? 'Copied!' : 'Copy App Link'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded border border-amber-200">
                    आपका SWI (₹300) प्लान एडमिन द्वारा वेरिफाई होते ही 3.3% कमीशन स्पेशल रिचार्ज ऐप का लिंक सीधे यहीं दिखाई देगा।
                  </p>
                )}
              </div>
            )}

            {/* Self Plan Upgrade / Switch Card (₹100+) */}
            <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#212121] flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#fb641b]" />
                    <span>प्लान अपग्रेड / स्विच करें (Plan Upgrade ₹100+)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    किसी भी समय ₹100 या अधिक भुगतान करके SWI (₹300 3.3% App), MOM, OES, TWI या किसी भी प्लान में अपग्रेड करें।
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2.5 py-1 rounded">
                  50% Sponsor Upgrade Bonus
                </span>
              </div>

              {upgradeMsg && (
                <div className={`p-2.5 rounded text-xs font-bold ${
                  upgradeMsg.error
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-[#388e3c]'
                }`}>
                  {upgradeMsg.text}
                </div>
              )}

              <form onSubmit={handleUpgradeSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end">
                <div>
                  <label className="text-[11px] font-bold text-[#212121] block mb-1">नया प्लान चुनें:</label>
                  <select
                    value={upgradeServiceCode}
                    onChange={e => {
                      const code = e.target.value;
                      setUpgradeServiceCode(code);
                      if (code === 'SWI') setUpgradeFee('300');
                      else if (code === 'OES') setUpgradeFee('500');
                      else if (code === 'NWI') setUpgradeFee('200');
                      else if (Number(upgradeFee) < 100) setUpgradeFee('100');
                    }}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] font-bold outline-none"
                  >
                    <option value="SWI">7. SWI (₹300 - 3.3% Special App)</option>
                    <option value="TWI">8. TWI (All-Plan Team ₹300)</option>
                    <option value="EMO">1. EMO (Fast ₹100 - ₹1000)</option>
                    <option value="MMO">2. MMO (55% Promo ₹100+)</option>
                    <option value="MOM">3. MOM (70% Digital Kit ₹100+)</option>
                    <option value="OES">4. OES (5-Level ₹500+)</option>
                    <option value="MMS">5. MMS (5-Branch ₹100+)</option>
                    <option value="NWI">6. NWI (3-Level ₹200+)</option>
                    <option value="PROMOTE">9. PROMOTE (Business/Shubhkamna ₹100+)</option>
                    <option value="REFER">10. REFER (Sponsor Upgrade ₹100+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#212121] block mb-1">राशि ₹ (Min ₹100):</label>
                  <input
                    type="number"
                    min={100}
                    value={upgradeFee}
                    onChange={e => setUpgradeFee(e.target.value)}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] font-mono font-bold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#212121] block mb-1">
                    UPI ({settings.adminUpiId}) UTR डालें:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="12-अंक UTR नंबर"
                      value={upgradeUtr}
                      onChange={e => setUpgradeUtr(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs text-[#212121] font-mono outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={upgradeSubmitting}
                      className="px-3.5 py-2 rounded-sm text-xs font-bold bg-[#fb641b] hover:bg-[#e5530d] text-white transition shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {upgradeSubmitting ? '...' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Promo CTA */}
            <div className="bg-[#f5f8ff] rounded-md p-4 sm:p-5 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-xs sm:text-sm font-extrabold text-[#212121]">खुद का बिज़नेस बैनर, सर्विस पोस्टर व शुभकामना कार्ड बनाएं</h4>
                <p className="text-xs text-slate-600">
                  ESP प्लेटफॉर्म डिटेल्स व QR कोड के साथ अपने व्यापार, दुकान या पर्व शुभकामना के HD पोस्टर 1-क्लिक में डाउनलोड करें।
                </p>
              </div>
              <button
                onClick={() => setActiveTab('poster')}
                className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-blue-700 transition shrink-0 cursor-pointer"
              >
                Create Posters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: MY DIGITAL ID CARD ===================== */}
      {activeTab === 'idcard' && (
        <div className="space-y-5 flex flex-col items-center w-full">
          {/* Submode Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-1.5 rounded-md border border-slate-200 shadow-2xs">
            <button
              onClick={() => setIdCardViewMode('primary')}
              className={`px-4 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                idCardViewMode === 'primary'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#212121]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>वेरिफाइड डिजिटल ID कार्ड (Primary 3D Card)</span>
            </button>
            <button
              onClick={() => setIdCardViewMode('multicard')}
              className={`px-4 py-2 rounded-sm text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                idCardViewMode === 'multicard'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#212121]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>6-इन-1 मल्टी-कार्ड शोकेस (Showcase Passes)</span>
            </button>
          </div>

          {idCardViewMode === 'primary' ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#212121]">
                  ESP आधिकारिक वेरिफाइड डिजिटल पहचान पत्र
                </h3>
                <p className="text-xs text-slate-600">
                  आपका आधिकारिक रोल नंबर, लाइव रेफरल क्यूआर कोड, जुड़ी हुई सर्विस व डिजिटल हस्ताक्षर।
                </p>
              </div>
              <DigitalIdCard user={user} settings={settings} compact={false} />
            </div>
          ) : (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="text-center max-w-xl mx-auto space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-[#212121]">ESP Official Digital ID & Showcase Passes (6-in-1)</h3>
                <p className="text-xs text-slate-600">
                  10 सर्विस पैटर्न आईडी कार्ड, स्पॉन्सर आईडी, प्रमोशन कार्ड, बिज़नेस कार्ड, ऐड्स व विजिटर पास, और मोमेंट कार्ड।
                </p>
              </div>
              <MultiCardShowcase user={user} settings={settings} />
            </div>
          )}
        </div>
      )}


      {/* ===================== TAB 3: PROMOTIONAL POSTERS ===================== */}
      {activeTab === 'poster' && (
        <PromotionalPoster user={user} settings={settings} />
      )}

      {/* ===================== TAB 4: REFERRAL TEAM ===================== */}
      {activeTab === 'referrals' && (
        <div className="space-y-5">
          {/* Detailed Referral Analytics & Historical Earnings */}
          <ReferralAnalytics
            user={user}
            referrals={displayReferrals}
            transactions={transactions}
            referralUrl={referralUrl}
            onShareLink={handleShareReferralLink}
          />

          {/* Top 5 Referrers Leaderboard Widget */}
          <TopReferrersWidget currentUser={user} onShareLink={handleShareReferralLink} />

          {/* 30-Day Referral Growth Visualization */}
          <ReferralGrowthChart referrals={displayReferrals} sponsorUserId={user.userId} />

          {/* Detailed Referral Breakdown Section */}
          <div className="bg-white rounded-md p-4 sm:p-6 border border-slate-200 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#2874f0]" />
                  <span>Detailed Referral Breakdown & Contribution List</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  आपके स्पॉन्सर कोड (<strong className="font-mono text-[#2874f0]">{user.userId}</strong>) से जुड़े प्रत्येक सदस्य का स्टेटस (Active/Pending) और कुल आय योगदान
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={whatsappInviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-sm text-xs font-bold text-white bg-[#388e3c] hover:bg-emerald-700 transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Invite via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Referral KPI Summary Pills */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-[#f9fafb] rounded-md p-3 border border-slate-200 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Downlines</p>
                <p className="text-lg sm:text-xl font-black text-[#212121]">{displayReferrals.length}</p>
                <p className="text-[10px] text-slate-500">Referred Members</p>
              </div>

              <div className="bg-emerald-50/70 rounded-md p-3 border border-emerald-200 space-y-1">
                <p className="text-[10px] text-[#388e3c] uppercase font-bold">Active (Credited)</p>
                <p className="text-lg sm:text-xl font-black text-[#388e3c]">
                  {displayReferrals.filter(r => r.status === 'credited').length}
                </p>
                <p className="text-[10px] text-emerald-700">Approved & Generating Income</p>
              </div>

              <div className="bg-amber-50/70 rounded-md p-3 border border-amber-200 space-y-1">
                <p className="text-[10px] text-amber-700 uppercase font-bold">Pending Approval</p>
                <p className="text-lg sm:text-xl font-black text-amber-600">
                  {displayReferrals.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-[10px] text-amber-700">Payment Under Verification</p>
              </div>

              <div className="bg-[#f5f8ff] rounded-md p-3 border border-blue-200 space-y-1">
                <p className="text-[10px] text-[#2874f0] uppercase font-bold">Total Contribution</p>
                <p className="text-lg sm:text-xl font-black text-[#2874f0]">
                  +₹{displayReferrals.filter(r => r.status === 'credited').reduce((sum, r) => sum + (r.commissionAmount || 0), 0)}
                </p>
                <p className="text-[10px] text-slate-600">Earned From Downlines</p>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              {/* Status Filter Buttons */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setReferralFilter('all')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    referralFilter === 'all'
                      ? 'bg-[#2874f0] text-white shadow-xs'
                      : 'bg-[#f1f3f6] text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  All ({displayReferrals.length})
                </button>
                <button
                  onClick={() => setReferralFilter('active')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    referralFilter === 'active'
                      ? 'bg-[#388e3c] text-white shadow-xs'
                      : 'bg-emerald-50 text-[#388e3c] hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${referralFilter === 'active' ? 'bg-white' : 'bg-[#388e3c]'}`} />
                  Active ({displayReferrals.filter(r => r.status === 'credited').length})
                </button>
                <button
                  onClick={() => setReferralFilter('pending')}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    referralFilter === 'pending'
                      ? 'bg-[#fb641b] text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${referralFilter === 'pending' ? 'bg-white' : 'bg-amber-500'}`} />
                  Pending ({displayReferrals.filter(r => r.status === 'pending').length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="सदस्य का नाम, रोल नं. खोजें..."
                  value={referralSearch}
                  onChange={e => setReferralSearch(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded pl-9 pr-3 py-1.5 text-xs text-[#212121] outline-none"
                />
              </div>
            </div>

            {/* Referral Breakdown Table */}
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-10 space-y-3 bg-[#f9fafb] rounded-md border border-slate-200">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">कोई डाउनलाइन सदस्य नहीं मिला।</p>
                {referralSearch && (
                  <button
                    onClick={() => { setReferralSearch(''); setReferralFilter('all'); }}
                    className="text-xs text-[#2874f0] underline font-bold cursor-pointer"
                  >
                    फ़िल्टर साफ़ करें
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-slate-200 text-slate-600 uppercase text-[10px]">
                      <th className="py-3 px-3.5 font-bold">Member Details</th>
                      <th className="py-3 px-3.5 font-bold">Roll Number</th>
                      <th className="py-3 px-3.5 font-bold">Plan Enrolled</th>
                      <th className="py-3 px-3.5 font-bold">Joining Fee</th>
                      <th className="py-3 px-3.5 font-bold">Status</th>
                      <th className="py-3 px-3.5 font-bold">Earnings Contribution</th>
                      <th className="py-3 px-3.5 font-bold">Date Joined</th>
                      <th className="py-3 px-3.5 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredReferrals.map(ref => {
                      const isActive = ref.status === 'credited';
                      return (
                        <tr key={ref.id} className="hover:bg-[#f5f8ff] transition">
                          <td className="py-3 px-3.5">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#2874f0]/10 border border-[#2874f0]/20 flex items-center justify-center text-xs font-bold text-[#2874f0] shrink-0">
                                {ref.downlineName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#212121] text-xs">{ref.downlineName}</p>
                                <p className="text-[10px] text-slate-500">
                                  {ref.downlinePhone ? `+91 ${ref.downlinePhone}` : 'Verified Downline'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3.5">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[#2874f0] font-bold bg-[#f5f8ff] px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                                {ref.downlineUserId}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-3.5 text-[#212121] font-medium">
                            {ref.serviceCode}
                          </td>

                          <td className="py-3 px-3.5 font-mono text-slate-700 font-semibold">
                            ₹{ref.joiningFee}
                          </td>

                          <td className="py-3 px-3.5">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-[#388e3c] px-2.5 py-1 rounded-sm border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c] animate-pulse" />
                                ACTIVE (CREDITED)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-sm border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                PENDING APPROVAL
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            {isActive ? (
                              <div className="flex items-center space-x-1 font-black text-[#388e3c] font-mono text-xs">
                                <span>+₹{ref.commissionAmount || 40}.00</span>
                                <span className="text-[9px] bg-emerald-50 text-[#388e3c] px-1 py-0.5 rounded border border-emerald-200 font-sans">
                                  COMMISSION
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                ₹0.00 (Pending)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3.5 text-[11px] text-slate-600 whitespace-nowrap">
                            {ref.date}
                          </td>

                          <td className="py-3 px-3.5 text-center">
                            <a
                              href={`https://api.whatsapp.com/send?phone=91${ref.downlinePhone || ''}&text=${encodeURIComponent(
                                `नमस्ते ${ref.downlineName}! मैं आपका ESP स्पॉन्सर (${user.fullName}) हूँ। किसी भी सहायता के लिए संपर्क करें!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-2.5 py-1 rounded-sm text-[10px] font-bold text-[#388e3c] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                              title="Chat on WhatsApp"
                            >
                              Message
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 4.5: NWI 3-LEVEL REAL DOWNLINE PASSIVE TREE ===================== */}
      {activeTab === 'nwi_tree' && (
        <div className="space-y-6">
          {/* Top Hero Card */}
          <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-2xs relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#ffe500] text-[#212121] text-[10px] font-extrabold px-2.5 py-0.5 rounded-sm uppercase tracking-wider">
                      👑 Real Level Team Non-Working
                    </span>
                    <span className="bg-emerald-50 text-[#388e3c] border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      3-लेवल पैसिव इनकम (10% + 15% + 25%)
                    </span>
                    <span className="bg-[#f5f8ff] text-[#2874f0] border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      टियर: ₹{nwiTree?.tierFee || 200}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold text-[#212121] flex items-center gap-2">
                    <span>👑 NWI 3-Level वास्तविक टीम व पैसिव इनकम</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    यहाँ कोई नकली या सिस्टम-जनरेटेड बॉट टीम नहीं होती। आपके नीचे बनने वाली वास्तविक Level-1 (10%), Level-2 (15%) और Level-3 (25%) टीम के हर सदस्य से आपको पैसिव नॉन-वर्किंग इनकम मिलती है।
                  </p>
                </div>

                {/* Instant Claim Button */}
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3.5 sm:p-4 text-center space-y-2 shrink-0 min-w-[200px]">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    अनक्लेम्ड पैसिव कमाई
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-[#388e3c]">
                    ₹{nwiTree?.pendingToClaim || 0}
                  </p>
                  <button
                    onClick={handleClaimNwi}
                    disabled={claimingNwi || !nwiTree || nwiTree.pendingToClaim <= 0}
                    className={`w-full py-2.5 px-4 rounded-sm text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                      nwiTree && nwiTree.pendingToClaim > 0
                        ? 'bg-[#fb641b] hover:bg-[#e5530d] text-white active:scale-95'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {claimingNwi ? (
                      <span>ट्रांसफर हो रहा है...</span>
                    ) : (
                      <span>💰 वॉलेट में क्लेम करें</span>
                    )}
                  </button>
                </div>
              </div>

              {nwiFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-[#388e3c] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#388e3c]" />
                  <span>{nwiFeedback}</span>
                </div>
              )}

              {/* Statistics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">सक्रिय टियर</p>
                  <p className="text-base sm:text-lg font-black text-[#212121]">₹{nwiTree?.tierFee || 200}</p>
                  <p className="text-[10px] text-slate-500">रियल लेवल मैट्रिक्स</p>
                </div>
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">कुल टीम (3-लेवल)</p>
                  <p className="text-base sm:text-lg font-black text-[#2874f0]">
                    {(nwiTree?.level1Members.length || 0) + (nwiTree?.level2Members.length || 0) + (nwiTree?.level3Members.length || 0)} मेंबर्स
                  </p>
                  <p className="text-[10px] text-slate-500">100% वास्तविक डाउनलाइन</p>
                </div>
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-md p-3">
                  <p className="text-[10px] text-[#388e3c] font-bold uppercase">कुल अर्जित पैसिव</p>
                  <p className="text-base sm:text-lg font-black text-[#388e3c]">₹{nwiTree?.totalPassiveEarned || 0}</p>
                  <p className="text-[10px] text-emerald-700">क्लेम योग्य + क्लेम्ड</p>
                </div>
                <div className="bg-[#f5f8ff] border border-blue-200 rounded-md p-3">
                  <p className="text-[10px] text-[#2874f0] font-bold uppercase">स्पॉन्सर रोल नं.</p>
                  <p className="text-sm sm:text-base font-black font-mono text-[#212121] truncate">{user.userId}</p>
                  <p className="text-[10px] text-slate-500">यूनिक टीम कोड</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Level Matrix Visual Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1 */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-[#fb641b] rounded-md p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121]">
                  🥇 LEVEL 1
                </span>
                <span className="text-xs font-bold text-[#fb641b]">10% कमीशन</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-[#212121]">{nwiTree?.level1Members.length || 0} मेंबर्स</span>
                <span className="text-xs font-bold text-[#388e3c]">₹{nwiTree?.level1Income || 0} प्राप्त</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                आपके सीधे रेफरल से जुड़े वास्तविक Level-1 मेंबर्स पर 10% लेवल इनकम।
              </p>
            </div>

            {/* Level 2 */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-[#2874f0] rounded-md p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-[#2874f0] text-white">
                  🥈 LEVEL 2
                </span>
                <span className="text-xs font-bold text-[#2874f0]">15% कमीशन</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-[#212121]">{nwiTree?.level2Members.length || 0} मेंबर्स</span>
                <span className="text-xs font-bold text-[#388e3c]">₹{nwiTree?.level2Income || 0} प्राप्त</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Level-1 मेंबर्स के नीचे बनी टीम से बिना अतिरिक्त काम के 15% पैसिव आय।
              </p>
            </div>

            {/* Level 3 */}
            <div className="bg-white border border-slate-200 border-t-4 border-t-[#388e3c] rounded-md p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-[#388e3c] text-white">
                  🥉 LEVEL 3
                </span>
                <span className="text-xs font-bold text-[#388e3c]">25% कमीशन</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-black text-[#212121]">{nwiTree?.level3Members.length || 0} मेंबर्स</span>
                <span className="text-xs font-bold text-[#388e3c]">₹{nwiTree?.level3Income || 0} प्राप्त</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Level-2 मेंबर्स के नीचे बनी टीम से 25% सबसे बड़ा नॉन-वर्किंग शेयर।
              </p>
            </div>
          </div>

          {/* Members Downline Roster */}
          <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center justify-between">
              <span>👥 आपकी वास्तविक 3-लेवल टीम (Real Downline)</span>
              <button
                onClick={loadNwiTree}
                className="text-xs text-[#2874f0] hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingNwi ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश</span>
              </button>
            </h3>

            {loadingNwi ? (
              <div className="py-8 text-center text-xs text-slate-600">
                3-लेवल टीम लोड हो रही है...
              </div>
            ) : ((nwiTree?.level1Members.length || 0) + (nwiTree?.level2Members.length || 0) + (nwiTree?.level3Members.length || 0)) === 0 ? (
              <div className="py-8 text-center bg-[#f9fafb] border border-slate-200 rounded-md space-y-3 px-4">
                <Users className="w-9 h-9 text-[#2874f0] mx-auto opacity-80" />
                <p className="text-xs sm:text-sm font-bold text-[#212121]">
                  अभी आपके नीचे कोई वास्तविक टीम मेंबर नहीं जुड़ा है।
                </p>
                <p className="text-[11px] text-slate-600 max-w-md mx-auto">
                  अपना स्पॉन्सर लिंक शेयर करें — जैसे ही आपके नीचे Level-1, Level-2 और Level-3 की टीम बनेगी, 10%, 15% और 25% पैसिव इनकम यहाँ अपने आप जुड़ती जाएगी।
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-sm text-xs font-bold bg-[#fb641b] hover:bg-[#e5530d] text-white cursor-pointer shadow-xs"
                >
                  {copiedLink ? 'लिंक कॉपी हो गया ✓' : '🔗 अपना स्पॉन्सर लिंक कॉपी करें'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Level 1 List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#212121] border-b border-slate-200 pb-1">
                    <span>🥇 लेवल 1 मेंबर्स ({nwiTree?.level1Members.length || 0})</span>
                    <span className="text-[10px] text-slate-500">10% प्रति मेंबर</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {nwiTree?.level1Members.map((m, idx) => (
                      <div key={idx} className="bg-[#f9fafb] p-2.5 rounded-md border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={m.avatar} alt={m.fullName} className="w-8 h-8 rounded-full border border-slate-300" />
                          <div>
                            <p className="text-xs font-bold text-[#212121] truncate max-w-[110px]">{m.fullName}</p>
                            <p className="text-[10px] text-slate-500">{m.userId}</p>
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-[#388e3c]">+₹{m.rewardEarned}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level 2 List */}
                {(nwiTree?.level2Members.length || 0) > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#2874f0] border-b border-slate-200 pb-1">
                      <span>🥈 लेवल 2 मेंबर्स ({nwiTree?.level2Members.length || 0})</span>
                      <span className="text-[10px] text-slate-500">15% प्रति मेंबर</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {nwiTree?.level2Members.map((m, idx) => (
                        <div key={idx} className="bg-[#f5f8ff] p-2.5 rounded-md border border-blue-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={m.avatar} alt={m.fullName} className="w-8 h-8 rounded-full border border-blue-300" />
                            <div>
                              <p className="text-xs font-bold text-[#212121] truncate max-w-[110px]">{m.fullName}</p>
                              <p className="text-[10px] text-slate-500">{m.userId}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-[#388e3c]">+₹{m.rewardEarned}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Level 3 List */}
                {(nwiTree?.level3Members.length || 0) > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#388e3c] border-b border-slate-200 pb-1">
                      <span>🥉 लेवल 3 मेंबर्स ({nwiTree?.level3Members.length || 0})</span>
                      <span className="text-[10px] text-slate-500">25% प्रति मेंबर</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                      {nwiTree?.level3Members.map((m, idx) => (
                        <div key={idx} className="bg-emerald-50/70 p-2.5 rounded-md border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={m.avatar} alt={m.fullName} className="w-8 h-8 rounded-full border border-emerald-300" />
                            <div>
                              <p className="text-xs font-bold text-[#212121] truncate max-w-[110px]">{m.fullName}</p>
                              <p className="text-[10px] text-slate-500">{m.userId}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-[#388e3c]">+₹{m.rewardEarned}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upgrade / Change NWI Tier Options */}
          <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-3 shadow-2xs">
            <h3 className="text-sm font-bold text-[#212121] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2874f0]" />
              <span>NWI टियर चयन / कैलकुलेशन (3-लेवल पैसिव दर)</span>
            </h3>
            <p className="text-xs text-slate-600">
              आप जो भी टियर चुनते हैं, आपके नीचे जुड़ने वाले मेंबर्स के टियर पर 10%, 15% और 25% का 3-लेवल कमीशन प्राप्त होता है:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[200, 500, 1000, 2000].map(fee => (
                <button
                  key={fee}
                  onClick={() => handleActivateNwiTier(fee)}
                  disabled={activatingNwiTier || nwiTree?.tierFee === fee}
                  className={`p-2.5 rounded-sm border text-center transition cursor-pointer ${
                    nwiTree?.tierFee === fee
                      ? 'bg-[#2874f0] text-white border-[#2874f0] font-bold shadow-xs'
                      : 'bg-[#f9fafb] hover:bg-[#f5f8ff] text-[#212121] border-slate-200 hover:border-[#2874f0]'
                  }`}
                >
                  <p className="text-xs font-black">₹{fee}</p>
                  <p className="text-[10px] opacity-85">{nwiTree?.tierFee === fee ? 'सक्रिय' : 'चुनें'}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: WALLET & PAYOUTS ===================== */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-4 shadow-2xs">
            <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2874f0]" />
              <span>UPI Withdrawal Request</span>
            </h3>

            <div className="bg-[#f5f8ff] p-3.5 rounded-md border border-blue-200 space-y-1">
              <p className="text-[10px] text-slate-600 uppercase font-bold">Available for Withdrawal</p>
              <p className="text-2xl font-black text-[#388e3c]">₹{user.balance}</p>
              <p className="text-[10px] text-slate-600">न्यूनतम निकासी सीमा: ₹{settings.minWithdrawal}</p>
              <p className="text-[10px] text-slate-500 pt-0.5 leading-snug">
                निकासी अनुरोध सबमिट करते ही राशि वॉलेट से एस्क्रो में लॉक हो जाती है; एडमिन द्वारा अस्वीकृत करने पर राशि स्वतः वॉलेट में वापस जोड़ दी जाएगी।
              </p>
            </div>

            {withdrawMessage && (
              <div
                className={`p-3 rounded-md text-xs font-medium ${
                  withdrawMessage.error
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-[#388e3c]'
                }`}
              >
                {withdrawMessage.text}
              </div>
            )}

            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Withdrawal Amount (राशि ₹)
                </label>
                <input
                  type="number"
                  min={settings.minWithdrawal}
                  max={user.balance}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payout UPI ID (उदा. yourname@okaxis)
                </label>
                <input
                  type="text"
                  value={withdrawUpi}
                  onChange={e => setWithdrawUpi(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={withdrawLoading || user.balance < settings.minWithdrawal}
                className="w-full py-2.5 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {withdrawLoading ? 'Processing...' : `Request ₹${withdrawAmount} UPI Transfer`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {/* Dedicated Transaction History Component */}
            <TransactionHistory
              payouts={payouts}
              user={user}
              onRefresh={handleRefreshPayouts}
              isLoading={payoutsLoading}
            />

            {/* Wallet Passbook */}
            <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-3 shadow-2xs">
              <h3 className="text-xs sm:text-sm font-bold text-[#212121]">Wallet Passbook</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {transactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-md bg-[#f9fafb] border border-slate-200 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#212121]">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(tx.date).toLocaleString('hi-IN')}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm ${
                        tx.amount > 0 ? 'text-[#388e3c]' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+₹${tx.amount}` : `₹${tx.amount}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: TRANSACTION HISTORY & UTR TRACKER ===================== */}
      {activeTab === 'transactions' && (
        <div className="space-y-5">
          <TransactionHistory
            payouts={payouts}
            user={user}
            onRefresh={handleRefreshPayouts}
            isLoading={payoutsLoading}
          />
        </div>
      )}

      {/* ===================== TAB: COINS AUDIT & REAL-TIME HISTORY LEDGER ===================== */}
      {activeTab === 'coins_ledger' && (
        <div className="space-y-5 w-full overflow-x-hidden animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-[#ffe500] flex items-center justify-center text-[#212121] shadow-xs font-black">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2 flex-wrap">
                    <span>कॉइन्स लेजर व ऑडिट हिस्ट्री (Coins Ledger)</span>
                    <span className="text-[10px] bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-sm font-bold">
                      Real-time DB Stored
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    हर कॉइन का पूरा रिकॉर्ड: कब, कहाँ से, कितना मिला या खर्च हुआ (कोई फेक डेटा नहीं)
                  </p>
                </div>
              </div>
              <button
                onClick={loadCoinsHistory}
                disabled={loadingCoinsHistory}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] rounded-sm text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCoinsHistory ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश लेजर</span>
              </button>
            </div>

            {/* Quick Balance Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-1">
              <div className="bg-[#f9fafb] border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">वर्तमान कॉइन्स बैलेंस</span>
                <span className="text-base sm:text-xl font-black text-[#fb641b] font-mono">
                  {(user.coins || 0).toLocaleString()} ESP Coins
                </span>
              </div>
              <div className="bg-[#f5f8ff] border border-blue-200 p-3 rounded-md">
                <span className="text-[10px] text-[#2874f0] font-bold uppercase tracking-wider block">दर्ज कुल ट्रांजेक्शन</span>
                <span className="text-base sm:text-xl font-black text-[#2874f0] font-mono">
                  {coinTransactions.length} एंट्रीज
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 border border-emerald-200 p-3 rounded-md flex flex-col justify-center">
                <span className="text-[10px] text-[#388e3c] font-bold uppercase tracking-wider block">वेरिफाइड टास्क रिवॉर्ड दर</span>
                <span className="text-xs sm:text-sm font-black text-[#212121]">
                  +5 कॉइन्स + EXP प्रति पूर्ण टास्क
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
              {[
                { id: 'all', label: 'सभी ट्रांजेक्शन (All)' },
                { id: 'credit', label: 'क्रेडिट (+ मिले कॉइन्स)' },
                { id: 'debit', label: 'डेबिट (- खर्च/गिफ्ट)' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCoinFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    coinFilter === f.id
                      ? 'bg-[#2874f0] text-white shadow-xs'
                      : 'bg-[#f1f3f6] text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {loadingCoinsHistory ? (
              <div className="text-center py-12 text-slate-600 text-xs bg-white rounded-md border border-slate-200">
                कॉइन्स लेजर लोड हो रहा है...
              </div>
            ) : coinTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-xs bg-white rounded-md border border-slate-200 space-y-2">
                <Coins className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="font-bold text-[#212121]">अभी तक कोई कॉइन ट्रांजेक्शन दर्ज नहीं हुआ है।</p>
                <p className="text-[11px] text-slate-500">रियल टास्क पूरे करें (+5 कॉइन्स व EXP पाएं), या UPI से कॉइन्स खरीदें!</p>
              </div>
            ) : (
              coinTransactions
                .filter(tx => {
                  if (coinFilter === 'all') return true;
                  return tx.type === coinFilter;
                })
                .map(tx => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <div
                      key={tx.id}
                      className="bg-white hover:bg-[#f5f8ff] border border-slate-200 hover:border-blue-300 transition rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-md flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                            isCredit
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-[#212121]">
                              {tx.description}
                            </span>
                            <span className="text-[10px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-2 py-0.5 rounded-sm font-mono font-semibold">
                              {tx.categoryLabel || tx.category}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(tx.timestamp).toLocaleString('hi-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-500">ID: {tx.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span
                            className={`text-sm sm:text-base font-black font-mono block ${
                              isCredit ? 'text-[#388e3c]' : 'text-rose-600'
                            }`}
                          >
                            {isCredit ? `+${tx.amount.toLocaleString()}` : `-${tx.amount.toLocaleString()}`}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            बैलेंस: {tx.balanceBefore} ➔ {tx.balanceAfter}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB: HELP & COMPLAINTS PORTAL ===================== */}
      {activeTab === 'complaints' && (
        <div className="space-y-6 w-full overflow-x-hidden animate-fadeIn">
          {/* Ticket Submission Form */}
          <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#2874f0]" />
                  <span>सहायता व शिकायत दर्ज करें (Help & Complaint Ticket)</span>
                </h3>
                <p className="text-xs text-slate-600">
                  हर शिकायत डेटाबेस में सुरक्षित दर्ज होती है। संतोष कुमार (एडमिन) तुरंत समाधान करेंगे।
                </p>
              </div>
              <span className="text-[11px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-3 py-1 rounded-sm font-bold self-start sm:self-auto">
                24x7 सपोर्ट
              </span>
            </div>

            {complaintNotice && (
              <div
                className={`p-3 rounded-md text-xs flex items-center gap-2 font-medium ${
                  complaintNotice.error
                    ? 'bg-rose-50 border border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border border-emerald-200 text-[#388e3c]'
                }`}
              >
                {complaintNotice.error ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#388e3c]" />
                )}
                <span>{complaintNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    शिकायत की श्रेणी (Category)
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={e => setComplaintCategory(e.target.value as any)}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded px-3.5 py-2.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0] transition"
                  >
                    <option value="payment">पेमेंट / UTR वेरिफिकेशन (Payment & UTR)</option>
                    <option value="coins">कॉइन्स मिसिंग या कटौती (Coins Issue)</option>
                    <option value="account">अकाउंट / प्रोफाइल / लॉगिन (Account)</option>
                    <option value="game">गेमप्ले व वॉइस रूम (Game & Room)</option>
                    <option value="other">अन्य सहायता (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    शिकायत का विषय (Subject)
                  </label>
                  <input
                    type="text"
                    value={complaintSubject}
                    onChange={e => setComplaintSubject(e.target.value)}
                    placeholder="उदा. UTR 90884511204 पेंडिंग है या कॉइन्स नहीं जुड़े"
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded px-3.5 py-2.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0] transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  विस्तृत विवरण (Description)
                </label>
                <textarea
                  rows={3}
                  value={complaintDescription}
                  onChange={e => setComplaintDescription(e.target.value)}
                  placeholder="कृपया समस्या की पूरी जानकारी, तारीख, ट्रांजेक्शन नंबर इत्यादि विस्तार से लिखें..."
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded px-3.5 py-2.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0] transition"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="px-6 py-2.5 bg-[#fb641b] hover:bg-[#e5530d] text-white font-bold text-xs rounded-sm shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {submittingComplaint ? 'टिकट दर्ज हो रहा है...' : 'टिकट सबमिट करें (Submit Ticket)'}
                </button>
              </div>
            </form>
          </div>

          {/* User's Previous Complaints List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#212121] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2874f0]" />
                <span>आपकी दर्ज शिकायतें ({complaints.length})</span>
              </h4>
              <button
                onClick={loadComplaints}
                disabled={loadingComplaints}
                className="text-xs text-[#2874f0] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loadingComplaints ? 'animate-spin' : ''}`} />
                <span>रिफ्रेश</span>
              </button>
            </div>

            {loadingComplaints ? (
              <div className="text-center py-8 text-xs text-slate-600 bg-white rounded-md border border-slate-200">
                शिकायतें लोड हो रही हैं...
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-600 bg-white rounded-md border border-slate-200">
                आपने अभी तक कोई शिकायत दर्ज नहीं की है।
              </div>
            ) : (
              complaints.map(item => {
                const isResolved = item.status === 'resolved';
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2874f0] bg-[#f5f8ff] border border-blue-200 px-2 py-0.5 rounded-sm">
                          #{item.id}
                        </span>
                        <span className="text-xs font-bold text-[#212121]">{item.subject}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-sm ${
                          isResolved
                            ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isResolved ? 'समाधान हो चुका (Resolved)' : 'प्रक्रियाधीन (Pending)'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 break-words">{item.description}</p>
                    <span className="text-[10px] text-slate-500 block">
                      दर्ज किया गया: {new Date(item.createdAt).toLocaleString('hi-IN')}
                    </span>

                    {/* Admin Response Box */}
                    {item.adminResponse && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-md space-y-1 mt-2">
                        <div className="flex items-center justify-between text-xs font-bold text-[#388e3c]">
                          <span>एडमिन उत्तर (Santosh Kumar):</span>
                          {item.resolvedAt && (
                            <span className="text-[10px] text-slate-500 font-normal">
                              {new Date(item.resolvedAt).toLocaleString('hi-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#212121] break-words">{item.adminResponse}</p>
                        {item.refundCoins && item.refundCoins > 0 && (
                          <span className="inline-block text-[11px] font-bold text-amber-800 bg-[#ffe500]/50 border border-amber-300 px-2 py-0.5 rounded-sm mt-1">
                            +{item.refundCoins} कॉइन्स रिफंड क्रेडिट किए गए
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 6: PROFILE & TELEGRAM-STYLE AVATAR ===================== */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl bg-white rounded-md p-5 sm:p-7 border border-slate-200 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#212121] flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#2874f0]" />
                <span>Member Profile & Security</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                यूनिट आईडी व स्पॉन्सर आईडी को छोड़कर आप अपनी सभी जानकारियां कभी भी एडिट कर सकते हैं।
              </p>
            </div>
            <span className="text-[11px] bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-3 py-1 rounded-sm font-bold w-fit">
              Verified Member Profile
            </span>
          </div>

          {profileMessage && (
            <div className="p-3.5 rounded-md text-xs bg-emerald-50 border border-emerald-200 text-[#388e3c] font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#388e3c]" />
              <span>{profileMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Circular Avatar Upload Section */}
            <div className="bg-[#f9fafb] p-5 rounded-md border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-blue-100 p-1 bg-[#2874f0] shadow-sm overflow-hidden flex items-center justify-center">
                  {profileForm.avatar ? (
                    <img 
                      src={profileForm.avatar} 
                      alt={profileForm.fullName} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#2874f0] font-black text-3xl">
                      {profileForm.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Camera upload overlay badge */}
                <label 
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#2874f0] hover:bg-blue-700 text-white shadow-md cursor-pointer transition transform hover:scale-110 active:scale-95 border-2 border-white"
                  title="Upload Profile Photo"
                >
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleDirectAvatarUpload(file, 'avatar');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-bold text-[#212121]">{profileForm.fullName || user.fullName}</h4>
                  <span className="font-mono text-xs bg-[#f5f8ff] text-[#2874f0] border border-blue-200 px-2 py-0.5 rounded-sm font-bold">
                    {user.userId}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  फोटो बदलने या एडजस्ट/क्रॉप करने के लिए कैमरे के आइकन या नीचे दिए गए बटन्स का उपयोग करें:
                </p>

                {/* Quick Avatar Presets + Crop & Cover Actions */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {[
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
                  ].map((presetUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, avatar: presetUrl }))}
                      className="w-8 h-8 rounded-full border-2 border-slate-300 hover:border-[#2874f0] overflow-hidden cursor-pointer transition hover:scale-105"
                      title={`Preset Avatar ${idx + 1}`}
                    >
                      <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {profileForm.avatar && (
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoCropState({
                          open: true,
                          kind: 'avatar',
                          src: profileForm.avatar,
                        })
                      }
                      className="px-2.5 py-1 rounded-sm bg-[#e7f3ff] hover:bg-blue-100 text-[#1877f2] border border-blue-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Crop Profile Pic</span>
                    </button>
                  )}
                  <label className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                    <Camera className="w-3 h-3 text-[#1877f2]" />
                    <span>{user.coverPhoto ? 'Change / Crop Cover' : 'Add Cover Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleDirectAvatarUpload(file, 'cover');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {user.coverPhoto && (
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoCropState({
                          open: true,
                          kind: 'cover',
                          src: user.coverPhoto!,
                        })
                      }
                      className="px-2.5 py-1 rounded-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Adjust Cover</span>
                    </button>
                  )}
                  {profileForm.avatar && (
                    <button
                      type="button"
                      onClick={() => setProfileForm(prev => ({ ...prev, avatar: '' }))}
                      className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer pl-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Read-Only Locked Fields (User ID, Personal Room ID & Sponsor ID) */}
            <div className="bg-[#f5f8ff] p-4 rounded-md border border-blue-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#2874f0]" />
                  <h4 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
                    सुरक्षित अपरिवर्तनीय विवरण (Strictly Non-Editable &amp; Non-Duplicable IDs)
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-sm">
                  ZERO DUPLICATE GUARANTEE
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                सुरक्षा एवं यूनिक पहचान नियमों के तहत आपका Personal User ID, Personal Room ID और Sponsor ID लाइफटाइम स्थायी (Locked) रहते हैं — इन्हें न कोई बदल सकता है और न ही किसी अन्य यूज़र को डुप्लीकेट मिल सकते हैं:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    पर्सनल यूज़र आईडी (Personal User ID) 🔒
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.userId}
                      disabled
                      readOnly
                      className="w-full bg-white border border-slate-300 rounded px-3.5 py-2 pr-16 text-xs text-[#2874f0] font-mono font-bold cursor-not-allowed"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm border border-amber-200">
                      LOCKED
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    पर्सनल रूम आईडी (Personal Room ID) 🔒
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={`#${user.personalRoomId || user.roomAddress || 'UNIQUE'}`}
                      disabled
                      readOnly
                      className="w-full bg-white border border-slate-300 rounded px-3.5 py-2 pr-16 text-xs text-purple-700 font-mono font-bold cursor-not-allowed"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] bg-purple-50 text-purple-800 font-bold px-1.5 py-0.5 rounded-sm border border-purple-200">
                      LOCKED
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    स्पॉन्सर आईडी (Sponsor ID) 🔒
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={user.sponsorId}
                      disabled
                      readOnly
                      className="w-full bg-white border border-slate-300 rounded px-3.5 py-2 pr-16 text-xs text-[#388e3c] font-mono font-bold cursor-not-allowed"
                    />
                    <span className="absolute right-2.5 top-2 text-[10px] bg-emerald-50 text-[#388e3c] font-bold px-1.5 py-0.5 rounded-sm border border-emerald-200">
                      LOCKED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Type Mode Selection (Business vs Gaming Profile) */}
            <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2.5">
              <div>
                <h4 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
                  आप किस प्रकार की प्रोफाइल रखना चाहते हैं? (Profile Type Preference)
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  अपनी पसंद के अनुसार Business &amp; Earning या Gaming &amp; Voice Club प्रोफाइल मोड चुनें और नीचे सेव करें:
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProfileForm(prev => ({ ...prev, accountType: 'business' }))}
                  className={`p-3 rounded-md border-2 text-left transition cursor-pointer ${
                    profileForm.accountType === 'business'
                      ? 'border-[#2874f0] bg-[#f5f8ff] shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#212121] flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-[#2874f0]" />
                      <span>💼 Business &amp; Earning Profile</span>
                    </span>
                    {profileForm.accountType === 'business' && (
                      <CheckCircle2 className="w-4 h-4 text-[#2874f0]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    10 अर्निंग प्लान, रेफरल इनकम, NWI टीम व डायरेक्ट UPI निकासी डैशबोर्ड।
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setProfileForm(prev => ({ ...prev, accountType: 'gamer' }))}
                  className={`p-3 rounded-md border-2 text-left transition cursor-pointer ${
                    profileForm.accountType === 'gamer'
                      ? 'border-[#fb641b] bg-orange-50/70 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#212121] flex items-center gap-1.5">
                      <Gamepad2 className="w-4 h-4 text-[#fb641b]" />
                      <span>🎮 Gaming &amp; Voice Club Profile</span>
                    </span>
                    {profileForm.accountType === 'gamer' && (
                      <CheckCircle2 className="w-4 h-4 text-[#fb641b]" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    लाइव वॉइस स्टेज, मल्टीप्लेयर गेम्स, VIP व फ्रेम्स स्टोर और असली टास्क।
                  </p>
                </button>
              </div>
            </div>

            {/* Editable Details Fields */}
            <div className="space-y-4">
              {/* Unique @Username + ESP PLAY Cover Profile Bar */}
              <div className="bg-cyan-50/60 border border-cyan-200 rounded-md p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-cyan-950 block">
                      यूनिक यूज़रनेम (Unique @Username — एक ही नाम से 2 यूज़र नहीं हो सकते)
                    </label>
                    <p className="text-[11px] text-cyan-800">
                      दूसरे लोग आपको इस @username से सर्च करके Add Friend कर सकते हैं।
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProfileSheetOpen({ open: true, mode: 'search' })}
                      className="px-2.5 py-1.5 rounded bg-white border border-cyan-300 text-cyan-900 text-[11px] font-bold hover:bg-cyan-100 transition cursor-pointer"
                    >
                      🔍 Search Friends (@)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileSheetOpen({ open: true, mode: 'edit' })}
                      className="px-2.5 py-1.5 rounded bg-[#2874f0] text-white text-[11px] font-bold hover:bg-blue-700 transition cursor-pointer"
                    >
                      🖼️ Cover &amp; ESP PLAY Sheet
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-cyan-700">@</span>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                      })
                    }
                    placeholder="उदा. rahul01 (बिना किसी symbol के)"
                    maxLength={24}
                    className="w-full bg-white border border-cyan-300 focus:border-[#2874f0] rounded pl-7 pr-3.5 py-2 text-xs text-[#212121] font-mono outline-none"
                  />
                </div>
                {usernameCheck.message && (
                  <p
                    className={`text-[11px] font-bold ${
                      usernameCheck.status === 'available'
                        ? 'text-emerald-700'
                        : usernameCheck.status === 'checking'
                        ? 'text-slate-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {usernameCheck.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    पूरा नाम (Display Name) *
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    नाम एक जैसा हो सकता है, पर आपका @Username और User ID हमेशा यूनिक रहेगा।
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    मोबाइल / व्हाट्सएप नंबर (Phone) *
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ईमेल पता (Email Address) *
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    लिंग (Gender)
                  </label>
                  <select
                    value={profileForm.gender}
                    onChange={e => setProfileForm({ ...profileForm, gender: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  बायो / स्टेटस (Bio / Status)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ESP Verified Member | Earning & Sharing"
                  value={profileForm.bio}
                  onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    शहर / देश (Location Badge)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Delhi, India"
                    value={profileForm.location}
                    onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    पूरा पता (Full Address with Pin Code)
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullAddress}
                    onChange={e => setProfileForm({ ...profileForm, fullAddress: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Payout UPI ID (सीधे बैंक में निकासी हेतु)
                  </label>
                  <input
                    type="text"
                    value={profileForm.payoutUpiId}
                    onChange={e => setProfileForm({ ...profileForm, payoutUpiId: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    नया लॉगिन पासवर्ड (New Password)
                  </label>
                  <input
                    type="password"
                    placeholder="खाली छोड़ें अगर नहीं बदलना"
                    value={profileForm.password}
                    onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                    className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded px-3.5 py-2 text-xs text-[#212121] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Controls Requested by User */}
            <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-[#2874f0]" />
                <h4 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
                  Public Sponsor View Privacy Settings
                </h4>
              </div>
              <p className="text-[11px] text-slate-600">
                जब कोई नया व्यक्ति आपके रेफरल लिंक पर क्लिक करता है, तो डिफ़ॉल्ट रूप से आपकी व्यक्तिगत जानकारी (फोन नंबर, ईमेल) छिपी (Masked) रहती है:
              </p>

              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={profileForm.privacySettings.showPhone}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        privacySettings: {
                          ...profileForm.privacySettings,
                          showPhone: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#2874f0]"
                  />
                  <span>मेरे रेफरल पेज पर मेरा पूरा फोन नंबर दिखाएं (Default: Masked ******3210)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={profileForm.privacySettings.showEmail}
                    onChange={e =>
                      setProfileForm({
                        ...profileForm,
                        privacySettings: {
                          ...profileForm.privacySettings,
                          showEmail: e.target.checked,
                        },
                      })
                    }
                    className="accent-[#2874f0]"
                  />
                  <span>मेरे रेफरल पेज पर मेरा ईमेल दिखाएं (Default: Masked r***@gmail.com)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="px-6 py-2.5 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition cursor-pointer shadow-xs"
            >
              {profileSaving ? 'Saving Changes...' : 'Save All Profile Updates (सेव करें)'}
            </button>
          </form>

          {/* ===================== USER EDIT HISTORY & AUDIT LOG TABLE ===================== */}
          <div className="bg-[#f9fafb] p-5 rounded-md border border-slate-200 space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-[#2874f0]" />
                <h4 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
                  Profile Edit History & Audit Log (पारदर्शी ऑडिट रिकॉर्ड)
                </h4>
              </div>
              <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-sm font-mono">
                {user.editHistory?.length || 0} Edit(s) Recorded
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              आपके द्वारा किए गए सभी प्रोफाइल बदलाव (नाम, फोन, पता, UPI ID, पासवर्ड) सिस्टम में सुरक्षित दर्ज रहते हैं:
            </p>

            {(!user.editHistory || user.editHistory.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center bg-white rounded-md border border-slate-200">
                अभी तक कोई बदलाव नहीं किया गया है (मूल रजिस्ट्रेशन डेटा सक्रिय है)।
              </p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-md border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                      <th className="py-2 px-3">Date & Time</th>
                      <th className="py-2 px-3">Field</th>
                      <th className="py-2 px-3">Old Value</th>
                      <th className="py-2 px-3">New Value</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {user.editHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#f5f8ff]">
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {new Date(item.date).toLocaleString('hi-IN')}
                        </td>
                        <td className="py-2 px-3 font-bold text-[#212121] uppercase text-[10px]">
                          {item.field}
                        </td>
                        <td className="py-2 px-3 text-rose-600 font-mono text-[11px]">
                          {item.oldValue || '—'}
                        </td>
                        <td className="py-2 px-3 text-[#388e3c] font-mono text-[11px] font-bold">
                          {item.newValue || '—'}
                        </td>
                        <td className="py-2 px-3">
                          <span className="bg-emerald-50 text-[#388e3c] border border-emerald-200 text-[9px] px-2 py-0.5 rounded-sm font-bold">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ===================== TAB 7: MULTI-DEVICE LOGIN & SESSIONS ===================== */}
      {activeTab === 'devices' && (
        <div className="space-y-5">
          <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#f5f8ff] text-[#2874f0] flex items-center justify-center border border-blue-200">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-[#212121]">Multi-Device Login Management (4-Device Sync)</h3>
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-sm border ${
                    (user.activeSessions?.length || 1) >= 4
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                  }`}>
                    {user.activeSessions?.length || 1} / 4 Devices Active
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  आप एक साथ अधिकतम 4 मोबाइल/लैपटॉप/टैबलेट पर लॉगिन रह सकते हैं। किसी भी दूसरे डिवाइस में लॉगिन करने पर आपका पूरा डेटा (Coins, Balance, Room, Last Screen) बिल्कुल वैसा ही मिलेगा — लॉगआउट करने पर कोई भी डेटा डिलीट नहीं होता।
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-3 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 transition border border-slate-300 flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#2874f0]' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync All Devices'}</span>
                </button>

                {(user.activeSessions?.length || 0) > 1 && (
                  <button
                    onClick={() => handleTerminateSession(undefined, true)}
                    disabled={terminatingAll}
                    className="px-3.5 py-2 rounded-sm text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{terminatingAll ? 'Logging out...' : 'Log Out All Other Devices'}</span>
                  </button>
                )}
              </div>
            </div>

            {sessionActionMessage && (
              <div className="p-3 rounded-md text-xs bg-emerald-50 border border-emerald-200 text-[#388e3c] font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{sessionActionMessage}</span>
              </div>
            )}

            {/* Explanatory Multi-Device Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#388e3c] text-xs font-bold">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>4-Device Concurrent Slots</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  4 अलग-अलग मोबाइल, लैपटॉप या टैबलेट में एक साथ लॉगिन-लॉगआउट करें; 5वां डिवाइस आने पर पुराना स्लॉट चुनने का विकल्प मिलता है।
                </p>
              </div>

              <div className="bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#fb641b] text-xs font-bold">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Exact Workspace Resume</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  आप जहाँ काम छोड़कर जाएंगे, दूसरे डिवाइस में लॉगिन करते ही वही टैब, कॉइन्स, वॉलेट और रूम ID वापस मिलेगा।
                </p>
              </div>

              <div className="bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#2874f0] text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero Data Deletion</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  रिमोट लॉगआउट करने से केवल उस डिवाइस की एंट्री बंद होती है — आपका User ID, Room ID, Coins और डेटा 100% सुरक्षित रहता है।
                </p>
              </div>
            </div>
          </div>

          {/* Active Devices List */}
          <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-sm font-bold text-[#212121] flex items-center justify-between">
              <span>Currently Logged-in Devices ({user.activeSessions?.length || 1} / 4 Max)</span>
              <span className="text-[11px] font-normal text-slate-500">
                लॉगिन समय एवं अंतिम गतिविधि
              </span>
            </h4>

            <div className="space-y-3">
              {(user.activeSessions && user.activeSessions.length > 0 ? user.activeSessions : [
                {
                  sessionId: 'default-current',
                  token: '',
                  deviceType: 'desktop' as const,
                  deviceName: 'Current Browser / Device',
                  browser: 'Web Browser',
                  os: 'Operating System',
                  ipAddress: '127.0.0.1',
                  loginTime: user.lastLogin || user.createdAt,
                  lastActive: new Date().toISOString(),
                  isCurrent: true,
                }
              ]).map((sess, idx) => {
                const isCurrent = Boolean(sess.isCurrent || (idx === 0 && !user.activeSessions?.some(s => s.isCurrent)));
                return (
                  <div
                    key={sess.sessionId}
                    className={`p-4 rounded-md border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-[#f9fafb] border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start sm:items-center space-x-3.5">
                      <div
                        className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-100 text-[#388e3c] border border-emerald-200'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {sess.deviceType === 'mobile' ? (
                          <Smartphone className="w-5 h-5" />
                        ) : sess.deviceType === 'tablet' ? (
                          <Tablet className="w-5 h-5" />
                        ) : (
                          <Laptop className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-[#212121] text-xs sm:text-sm">{sess.deviceName}</p>
                          {isCurrent ? (
                            <span className="bg-emerald-100 text-[#388e3c] text-[10px] font-bold px-2 py-0.5 rounded-sm border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c] animate-pulse" />
                              THIS DEVICE (यह डिवाइस)
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-sm">
                              Connected Device
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-600">
                          OS: <span className="text-[#212121] font-medium">{sess.os}</span> | Browser:{' '}
                          <span className="text-[#212121] font-medium">{sess.browser}</span>
                          {sess.ipAddress ? ` | IP: ${sess.ipAddress}` : ''}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-0.5">
                          <span>Logged in: {new Date(sess.loginTime).toLocaleString('hi-IN')}</span>
                          <span>•</span>
                          <span className="text-[#388e3c] font-medium">
                            Last Active: {new Date(sess.lastActive).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleTerminateSession(sess.sessionId, false)}
                        disabled={terminatingSessionId === sess.sessionId}
                        className="px-3 py-1.5 rounded-sm text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition border border-rose-200 flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>
                          {terminatingSessionId === sess.sessionId ? 'Logging out...' : 'Log Out This Device'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Level-Up Celebratory Animation Modal */}
      {levelUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="w-20 h-20 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center font-black text-3xl shadow-md">
                👑
              </div>
              <span className="absolute -bottom-1 -right-1 bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm border border-white shadow">
                NEW!
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-widest text-[#2874f0] uppercase bg-[#f5f8ff] px-3 py-1 rounded-sm border border-blue-200">
                🎉 LEVEL UP REACHED! 🎉
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#212121] pt-1">
                Level {levelUpModal.newLevel} Achieved!
              </h2>
              <p className="text-xs text-slate-600">
                शानदार प्रगति! रियल टास्क EXP से आप Level <strong className="text-slate-700">{levelUpModal.oldLevel}</strong> से{' '}
                <strong className="text-[#fb641b]">Level {levelUpModal.newLevel}</strong> पर पहुँच गए हैं।
              </p>
            </div>

            <button
              onClick={() => setLevelUpModal(null)}
              className="w-full py-3 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-xs cursor-pointer flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>शानदार! जारी रखें (Continue)</span>
            </button>
          </div>
        </div>
      )}

      {/* Digital Payout Receipt Slip Modal */}
      {selectedPayoutReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[#2874f0]" />
                <h3 className="text-sm font-bold text-[#212121]">ESP Official Settlement Slip</h3>
              </div>
              <button
                onClick={() => setSelectedPayoutReceipt(null)}
                className="text-slate-600 hover:text-[#212121] text-xs font-bold px-2.5 py-1 bg-[#f1f3f6] hover:bg-slate-200 rounded-sm cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-3">
              <div className="text-center pb-2 border-b border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Payment Settlement Amount</p>
                <p className="text-2xl font-black text-[#388e3c] font-mono mt-0.5">
                  ₹{selectedPayoutReceipt.amount}.00
                </p>
                <span
                  className={`inline-block mt-1 text-[9px] font-bold px-2.5 py-0.5 rounded-sm ${
                    selectedPayoutReceipt.status === 'approved'
                      ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                      : selectedPayoutReceipt.status === 'pending'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {selectedPayoutReceipt.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Transaction UTR Ref:</span>
                  <strong className="text-[#2874f0] font-mono">
                    {selectedPayoutReceipt.transactionRef || `TXN-${selectedPayoutReceipt.id}`}
                  </strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Beneficiary UPI ID:</span>
                  <strong className="text-[#212121] font-mono">{selectedPayoutReceipt.payoutAddress}</strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Member Name:</span>
                  <strong className="text-[#212121]">{selectedPayoutReceipt.userName}</strong>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Request Date & Time:</span>
                  <span className="text-slate-700">{selectedPayoutReceipt.requestDate}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Settlement Processed:</span>
                  <span className="text-slate-700">
                    {selectedPayoutReceipt.processedDate || (selectedPayoutReceipt.status === 'pending' ? 'Processing with Bank' : '-')}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>Settled By:</span>
                  <span className="text-[#2874f0] font-semibold">{settings.adminPayeeName} (ESP Pay)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `ESP Payout Slip\nTxn ID: ${selectedPayoutReceipt.transactionRef || selectedPayoutReceipt.id}\nAmount: ₹${selectedPayoutReceipt.amount}\nUPI: ${selectedPayoutReceipt.payoutAddress}\nStatus: ${selectedPayoutReceipt.status}`
                  );
                  setReceiptCopied(true);
                  setTimeout(() => setReceiptCopied(false), 2000);
                }}
                className="flex-1 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 transition border border-slate-300 cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                {receiptCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#388e3c]" />
                    <span className="text-[#388e3c]">Copied!</span>
                  </>
                ) : (
                  <span>Copy Receipt</span>
                )}
              </button>

              <button
                onClick={() => setSelectedPayoutReceipt(null)}
                className="flex-1 py-2 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-blue-700 transition cursor-pointer text-center"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <UserProfileSheetModal
        isOpen={profileSheetOpen.open}
        onClose={() => setProfileSheetOpen(prev => ({ ...prev, open: false }))}
        currentUser={user}
        targetUserId={user.userId}
        initialProfile={user as Partial<RichProfileData>}
        initialMode={profileSheetOpen.mode}
        onUpdateUser={onUpdateUser}
        onOpenMoments={() => onNavigateToTab?.('gaming-room')}
      />

      <FacebookPhotoCropModal
        isOpen={photoCropState.open}
        imageSrc={photoCropState.src}
        kind={photoCropState.kind}
        onCancel={() => setPhotoCropState(prev => ({ ...prev, open: false }))}
        onConfirm={handleConfirmDashboardPhotoCrop}
        onChangeFile={(newFile) => handleDirectAvatarUpload(newFile, photoCropState.kind)}
      />
    </div>
  );
};
