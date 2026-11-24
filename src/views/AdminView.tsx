import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Coins, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Upload, 
  Save, 
  Settings, 
  FileText, 
  Eye, 
  Search, 
  ExternalLink,
  CreditCard,
  History,
  UserCheck,
  Clock,
  Filter,
  Image,
  Sparkles,
  Gift,
  X,
  Bell,
  MessageSquare,
  Crown,
  Hash,
  RefreshCw,
  Laptop,
  Smartphone,
  Tablet,
  LogOut
} from 'lucide-react';
import type { PlatformSettings, ServiceItem, UserProfile, PayoutRequest, CoinRechargeRequest, HomeSliderPhoto, PlanUpgradeRequest, GiftCardRedemption, ContactMessage, NotificationItem, LiveTimeMeta, AdminSession, UserSession } from '../types/index.ts';
import { api } from '../services/api.ts';
import { DigitalIdCard } from '../components/DigitalIdCard.tsx';
import { showToast } from '../services/toast.ts';
import { auth, ADMIN_GOOGLE_EMAIL, signInWithGoogle, syncAdminDatasetToFirestore } from '../services/firebase.ts';
import { CURATED_VIP_ROOM_NUMBERS, isVipFancyRoomNumber } from '../config/giftCatalog.ts';

interface AdminViewProps {
  adminPassword: string;
  settings: PlatformSettings;
  onUpdateSettings: (newSettings: PlatformSettings) => void;
  onLogoutAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  adminPassword,
  settings,
  onUpdateSettings,
  onLogoutAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'members' | 'players_builder' | 'services' | 'payouts' | 'coin_recharges' | 'give_coins' | 'messages' | 'gift_cards' | 'vip_rooms' | 'weekly_clock' | 'multi_device' | 'settings' | 'audits' | 'slider_photos'>('members');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [coinRecharges, setCoinRecharges] = useState<CoinRechargeRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>([]);
  const [previewScreenshot, setPreviewScreenshot] = useState<{
    url: string;
    recharge?: CoinRechargeRequest;
    title: string;
  } | null>(null);
  const [rechargeProcessingId, setRechargeProcessingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  
  const [selectedAuditUser, setSelectedAuditUser] = useState<any | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [viewingIdCardUser, setViewingIdCardUser] = useState<UserProfile | null>(null);

  // SWI 3.3% App Link Share & Plan Upgrades States
  const [planUpgrades, setPlanUpgrades] = useState<PlanUpgradeRequest[]>([]);
  const [upgradeProcessingId, setUpgradeProcessingId] = useState<string | null>(null);
  const [swiModalUser, setSwiModalUser] = useState<UserProfile | null>(null);
  const [swiAppUrlInput, setSwiAppUrlInput] = useState('');
  const [swiAppNoteInput, setSwiAppNoteInput] = useState('');
  const [swiSharing, setSwiSharing] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<PlatformSettings>(settings);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<string | null>(null);

  // Service Modal state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    code: '',
    name: '',
    hindiName: '',
    description: '',
    hindiDescription: '',
    category: 'direct' as const,
    defaultFee: 50,
    dailyEarningEst: '₹25 - ₹250 / day',
    referralBonusPercent: 40,
  });

  // 7-Photo Slider & Home Popup Manager States (Max 7 photos)
  const [sliderPhotos, setSliderPhotos] = useState<HomeSliderPhoto[]>([]);
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideLink, setNewSlideLink] = useState('');
  const [sliderSaving, setSliderSaving] = useState(false);

  // Gift Card Redemptions (Admin Voucher Fulfillment)
  const [giftCardRedemptions, setGiftCardRedemptions] = useState<GiftCardRedemption[]>([]);
  const [giftCardProcessingId, setGiftCardProcessingId] = useState<string | null>(null);
  const [cloudSyncing, setCloudSyncing] = useState(false);

  // VIP Numeric Room ID Management State
  const [vipSearchQuery, setVipSearchQuery] = useState('');
  const [vipSelectedUserId, setVipSelectedUserId] = useState('');
  const [vipRoomNumberInput, setVipRoomNumberInput] = useState('');
  const [vipRoomLabelInput, setVipRoomLabelInput] = useState('VIP Royal');
  const [vipCheckResult, setVipCheckResult] = useState<{
    available: boolean;
    normalized: string;
    valid: boolean;
    isFancyVip?: boolean;
    conflictOwner?: string | null;
    message?: string;
  } | null>(null);
  const [vipChecking, setVipChecking] = useState(false);
  const [vipSaving, setVipSaving] = useState(false);

  // Admin Direct Coin Grant / Adjust by User ID State
  const [coinGrantIdentifier, setCoinGrantIdentifier] = useState('');
  const [coinGrantAmount, setCoinGrantAmount] = useState('100');
  const [coinGrantMode, setCoinGrantMode] = useState<'credit' | 'debit'>('credit');
  const [coinGrantReason, setCoinGrantReason] = useState('Admin Coin Reward / Balance Top-Up');
  const [coinGrantBusy, setCoinGrantBusy] = useState(false);
  const [coinGrantResult, setCoinGrantResult] = useState<{ ok: boolean; text: string } | null>(null);

  // Admin Real Player Creator + Individual Password / Level / VIP Editor State
  const [newPlayerForm, setNewPlayerForm] = useState({
    fullName: '',
    username: '',
    phone: '',
    password: '',
    coins: '500',
    charms: '120',
    gameLevel: '5',
    vipTier: 'gold' as 'none' | 'silver' | 'gold' | 'diamond',
    frameType: 'vip-gold',
    roomNumber: '',
    clanName: 'Royal Warriors ESP',
    bio: '',
  });
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [playerSearchQuery, setPlayerSearchQuery] = useState('');
  const [editingPlayerModal, setEditingPlayerModal] = useState<{
    user: UserProfile;
    fullName: string;
    username: string;
    phone: string;
    password: string;
    coins: string;
    charms: string;
    gameLevel: string;
    vipTier: 'none' | 'silver' | 'gold' | 'diamond';
    frameType: string;
    clanName: string;
  } | null>(null);
  const [savingPlayerEdit, setSavingPlayerEdit] = useState(false);

  // Reusable React Confirmation & Input Modal (replaces browser confirm/prompt)
  const [actionModal, setActionModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant: 'approve' | 'reject';
    needsInput?: boolean;
    inputLabel?: string;
    inputPlaceholder?: string;
    inputRequired?: boolean;
    secondaryInputLabel?: string;
    secondaryInputPlaceholder?: string;
    onConfirm: (inputVal: string, secondaryVal: string) => Promise<void>;
  } | null>(null);
  const [actionModalInput, setActionModalInput] = useState('');
  const [actionModalSecondary, setActionModalSecondary] = useState('');
  const [actionModalBusy, setActionModalBusy] = useState(false);

  // Admin Live 12 AM IST Clock & Weekly Rewards Monitor State
  const [adminTimeStats, setAdminTimeStats] = useState<{
    today: string;
    timeMeta: LiveTimeMeta;
    schedule: Array<{ day: number; coins: number; xp: number; label: string }>;
    claimedTodayCount: number;
    activeStreaksCount: number;
    claimedTodayUsers: Array<{
      userId: string;
      fullName: string;
      username?: string;
      loginStreak: number;
      lastDailyCheckInDate: string;
      coins: number;
    }>;
  } | null>(null);
  const [adminClockOffsetMs, setAdminClockOffsetMs] = useState(0);
  const [adminLiveIstClock, setAdminLiveIstClock] = useState('Syncing...');
  const [adminResetCountdown, setAdminResetCountdown] = useState('--:--:--');
  const [resyncingTime, setResyncingTime] = useState(false);
  const [resetClaimUserInput, setResetClaimUserInput] = useState('');
  const [resetPreserveStreak, setResetPreserveStreak] = useState(true);
  const [resettingClaimBusy, setResettingClaimBusy] = useState(false);

  // Multi-Device Admin & Member Sessions + Identity Uniqueness Audit State
  const [multiDeviceData, setMultiDeviceData] = useState<{
    maxDevices: number;
    adminSessions: AdminSession[];
    userSessions: Array<{
      userId: string;
      fullName: string;
      username?: string;
      personalRoomId?: string;
      sponsorId?: string;
      role: string;
      activeCount: number;
      maxDevices: number;
      sessions: UserSession[];
    }>;
    identityAudit: {
      totalUsers: number;
      uniqueUserIds: number;
      uniqueRoomIds: number;
      uniqueUsernames: number;
      duplicateUserIds: string[];
      duplicateRoomIds: string[];
      duplicateUsernames: string[];
      integrityHealthy: boolean;
    };
  } | null>(null);
  const [loadingMultiDevice, setLoadingMultiDevice] = useState(false);
  const [terminatingDeviceKey, setTerminatingDeviceKey] = useState<string | null>(null);
  const [multiDeviceSearch, setMultiDeviceSearch] = useState('');

  const loadMultiDeviceSessions = async () => {
    setLoadingMultiDevice(true);
    try {
      const res = await api.getAdminSessions(adminPassword);
      if (res?.success) {
        setMultiDeviceData(res);
      }
    } catch (err: any) {
      showToast(err?.message || 'Multi-device sessions लोड करने में त्रुटि आई', 'error');
    } finally {
      setLoadingMultiDevice(false);
    }
  };

  const handleTerminateAdminDevice = async (sessionId?: string, terminateAllOthers = false) => {
    const key = terminateAllOthers ? 'admin-all' : `admin-${sessionId}`;
    setTerminatingDeviceKey(key);
    try {
      const res = await api.terminateAdminSession(adminPassword, sessionId, terminateAllOthers);
      if (res?.success) {
        showToast(res.message || 'Admin device session logged out!', 'success');
        await loadMultiDeviceSessions();
      }
    } catch (err: any) {
      showToast(err?.message || 'Admin session logout failed', 'error');
    } finally {
      setTerminatingDeviceKey(null);
    }
  };

  const handleAdminTerminateUserDevice = async (userId: string, sessionId?: string, terminateAll = false) => {
    const key = terminateAll ? `user-all-${userId}` : `user-${userId}-${sessionId}`;
    setTerminatingDeviceKey(key);
    try {
      const res = await api.adminTerminateUserSession(adminPassword, userId, sessionId, terminateAll);
      if (res?.success) {
        showToast(res.message || 'Member device logged out safely (0 data deleted)!', 'success');
        await loadMultiDeviceSessions();
      }
    } catch (err: any) {
      showToast(err?.message || 'Member session logout failed', 'error');
    } finally {
      setTerminatingDeviceKey(null);
    }
  };

  const loadAdminTimeStats = async () => {
    try {
      const res = await api.getAdminTimeWeeklyStats(adminPassword);
      if (res?.success && res.timeMeta) {
        setAdminTimeStats(res);
        if (res.timeMeta.serverIso) {
          const off = new Date(res.timeMeta.serverIso).getTime() - Date.now();
          if (Number.isFinite(off)) setAdminClockOffsetMs(off);
        }
      }
    } catch {}
  };

  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now() + adminClockOffsetMs;
      const istObj = new Date(nowMs + 5.5 * 60 * 60 * 1000);
      const hh = istObj.getUTCHours();
      const mm = istObj.getUTCMinutes();
      const ss = istObj.getUTCSeconds();
      setAdminLiveIstClock(
        `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} IST`
      );
      const secLeft = Math.max(0, 86400 - (hh * 3600 + mm * 60 + ss));
      const ch = Math.floor(secLeft / 3600);
      const cm = Math.floor((secLeft % 3600) / 60);
      const cs = secLeft % 60;
      setAdminResetCountdown(
        `${String(ch).padStart(2, '0')}:${String(cm).padStart(2, '0')}:${String(cs).padStart(2, '0')}`
      );
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [adminClockOffsetMs]);

  const handleResyncAdminTime = async () => {
    setResyncingTime(true);
    try {
      const res = await api.resyncAdminLiveTime(adminPassword);
      if (res?.success && res.timeMeta) {
        const off = new Date(res.timeMeta.serverIso).getTime() - Date.now();
        if (Number.isFinite(off)) setAdminClockOffsetMs(off);
        showToast(res.message || 'Live API Clock Synced!', 'success');
        await loadAdminTimeStats();
      } else {
        showToast(res?.message || 'Clock sync failed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Clock sync failed', 'error');
    } finally {
      setResyncingTime(false);
    }
  };

  const handleResetUserWeeklyClaim = async (targetIdentifier?: string) => {
    const idToReset = (targetIdentifier ?? resetClaimUserInput).trim();
    if (!idToReset) {
      showToast('कृपया User ID या @username दर्ज करें', 'error');
      return;
    }
    setResettingClaimBusy(true);
    try {
      const res = await api.resetUserDailyClaim(adminPassword, idToReset, resetPreserveStreak);
      if (res?.success) {
        showToast(res.message || 'Weekly Claim Lock Reset!', 'success');
        try {
          if (res.user?.userId) {
            localStorage.removeItem(`esp_weekly_claimed_date_${res.user.userId}`);
            sessionStorage.removeItem(`esp_weekly_popup_dismissed_${res.user.userId}`);
          }
        } catch {}
        if (!targetIdentifier) setResetClaimUserInput('');
        await Promise.all([loadAdminTimeStats(), loadAdminData()]);
      } else {
        showToast(res?.message || 'Reset failed', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Reset failed', 'error');
    } finally {
      setResettingClaimBusy(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminOverview(adminPassword);
      if (data.success) {
        setStats(data.stats);
        setUsers(data.users || []);
        setServices(data.services || []);
        setPayouts(data.payouts || []);
        if (Array.isArray(data.coinRecharges)) {
          setCoinRecharges(data.coinRecharges);
        }
        if (Array.isArray(data.contactMessages)) {
          setContactMessages(data.contactMessages);
        }
        if (Array.isArray(data.adminNotifications)) {
          setAdminNotifications(data.adminNotifications);
        }
        if (data.settings) {
          setSettingsForm(data.settings);
          onUpdateSettings(data.settings);
        }
      }

      // Load coin recharge requests (supports both Array return & { success, recharges } return)
      try {
        const rcData: any = await api.getCoinRecharges(adminPassword);
        const rcList = Array.isArray(rcData)
          ? rcData
          : (rcData?.recharges || rcData?.coinRecharges || []);
        setCoinRecharges(rcList);
      } catch (err) {
        console.error('Failed to load coin recharges', err);
      }

      // Load contact messages & coin alert messages
      try {
        const msgList = await api.getAdminContactMessages(adminPassword);
        if (Array.isArray(msgList)) {
          setContactMessages(msgList);
        }
      } catch (err) {
        console.error('Failed to load admin contact messages', err);
      }

      // Load slider photos
      try {
        const sp = await api.getHomeSliderPhotos();
        setSliderPhotos(sp);
      } catch (err) {
        console.error('Failed to load slider photos', err);
      }

      // Load Plan Upgrade Requests (₹100+)
      try {
        const upgData = await api.getPlanUpgrades(adminPassword);
        if (upgData.success) {
          setPlanUpgrades(upgData.upgrades || []);
        }
      } catch (err) {
        console.error('Failed to load plan upgrades', err);
      }

      // Load Gift Card Redemptions
      try {
        const gcList = await api.getGiftCardRedemptions(undefined, adminPassword);
        setGiftCardRedemptions(gcList || []);
      } catch (err) {
        console.error('Failed to load gift card redemptions', err);
      }

      // Load Live 12 AM IST Clock & Weekly Rewards Stats
      loadAdminTimeStats();
    } catch {
      showToast('एडमिन सुरक्षा सत्यापन विफल रहा।', 'error');
      onLogoutAdmin();
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCloudSync = async () => {
    if (cloudSyncing) return;
    setCloudSyncing(true);
    try {
      let fbUser = auth.currentUser;
      if (!fbUser || fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
        fbUser = await signInWithGoogle();
      }
      if (fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
        showToast(`कृपया एडमिन ईमेल (${ADMIN_GOOGLE_EMAIL}) से Google साइन-इन करें।`, 'error');
        return;
      }
      const res = await syncAdminDatasetToFirestore({
        users,
        payouts,
        giftCards: giftCardRedemptions,
      });
      showToast(
        `☁️ Firestore सिंक पूर्ण: ${res.syncedUsers} Members, ${res.syncedPayouts} Payouts, ${res.syncedGiftCards} Gift Cards!`,
        'success'
      );
    } catch (err: any) {
      showToast(err?.message || 'Firestore Admin Sync विफल रहा', 'error');
    } finally {
      setCloudSyncing(false);
    }
  };

  const handleAddSliderPhoto = async () => {
    if (!newSlideUrl.trim()) {
      showToast('कृपया फोटो का इमेज लिंक या अपलोड करें', 'error');
      return;
    }
    if (sliderPhotos.length >= 7) {
      showToast('अधिकतम 7 फोटो ही अपलोड कर सकते हैं', 'error');
      return;
    }
    const newPhoto: HomeSliderPhoto = {
      id: `SLIDE-${Date.now()}`,
      imageUrl: newSlideUrl.trim(),
      title: newSlideTitle.trim() || undefined,
      subtitle: newSlideSubtitle.trim() || undefined,
      linkUrl: newSlideLink.trim() || undefined,
      active: true,
      order: sliderPhotos.length + 1,
      createdAt: new Date().toISOString(),
    };
    const updated = [...sliderPhotos, newPhoto];
    setSliderSaving(true);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
        setNewSlideUrl('');
        setNewSlideTitle('');
        setNewSlideSubtitle('');
        setNewSlideLink('');
        showToast('स्लाइडर फोटो सफलतापूर्वक जोड़ी गई!', 'success');
      }
    } catch {
      showToast('फोटो सेव करने में त्रुटि हुई', 'error');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleRemoveSliderPhoto = async (id: string) => {
    const updated = sliderPhotos.filter(p => p.id !== id);
    setSliderSaving(true);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
        showToast('फोटो हटा दी गई!', 'success');
      }
    } catch {
      showToast('त्रुटि हुई', 'error');
    } finally {
      setSliderSaving(false);
    }
  };

  const handleToggleSliderPhoto = async (id: string) => {
    const updated = sliderPhotos.map(p => p.id === id ? { ...p, active: !p.active } : p);
    try {
      const res = await api.saveHomeSliderPhotos(adminPassword, updated);
      if (res.success) {
        setSliderPhotos(res.photos);
      }
    } catch {}
  };

  const openActionModal = (config: NonNullable<typeof actionModal>) => {
    setActionModalInput('');
    setActionModalSecondary('');
    setActionModal(config);
  };

  const handleApproveRecharge = (id: string) => {
    openActionModal({
      title: 'कॉइन रिचार्ज स्वीकृत करें',
      description:
        'क्या आप पुष्टि करते हैं कि इस 12-अंक UPI UTR का बैंक खाते में सत्यापन हो गया है? स्वीकृति के बाद यूजर के प्रोफाइल में तुरंत कॉइन्स क्रेडिट हो जाएंगे।',
      confirmLabel: 'हाँ, कॉइन्स क्रेडिट करें',
      variant: 'approve',
      onConfirm: async () => {
        setRechargeProcessingId(id);
        try {
          const res = await api.approveCoinRecharge(id, adminPassword);
          if (res.success) {
            showToast('सफलता: कॉइन रिचार्ज स्वीकृत! यूजर के वॉलेट में कॉइन्स क्रेडिट कर दिए गए हैं।', 'success');
            setCoinRecharges(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
            loadAdminData();
          } else {
            showToast(res.message || res.error || 'स्वीकृति विफल रही', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'त्रुटि आई', 'error');
        } finally {
          setRechargeProcessingId(null);
        }
      },
    });
  };

  const handleRejectRecharge = (id: string) => {
    openActionModal({
      title: 'कॉइन रिचार्ज अस्वीकृत करें',
      description: 'यदि यह UTR अमान्य है या पेमेंट प्राप्त नहीं हुआ है, तो कारण दर्ज कर अनुरोध अस्वीकृत करें।',
      confirmLabel: 'अनुरोध अस्वीकृत करें',
      variant: 'reject',
      needsInput: true,
      inputLabel: 'अस्वीकृति का कारण',
      inputPlaceholder: 'उदा. गलत UTR नंबर / बैंक खाते में पेमेंट प्राप्त नहीं हुआ',
      inputRequired: false,
      onConfirm: async (reason) => {
        setRechargeProcessingId(id);
        try {
          const res = await api.rejectCoinRecharge(
            id,
            reason.trim() || 'गलत UTR अथवा पेमेंट बैंक खाते में प्राप्त नहीं हुआ',
            adminPassword
          );
          if (res.success) {
            showToast('कॉइन रिचार्ज अनुरोध अस्वीकृत कर दिया गया।', 'info');
            setCoinRecharges(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
            loadAdminData();
          } else {
            showToast(res.message || res.error || 'अस्वीकृति विफल रही', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'त्रुटि आई', 'error');
        } finally {
          setRechargeProcessingId(null);
        }
      },
    });
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'vip_rooms') return;
    if (!vipSelectedUserId && users.length > 0) {
      setVipSelectedUserId(users[0].userId);
    }
  }, [activeTab, users, vipSelectedUserId]);

  useEffect(() => {
    if (activeTab !== 'vip_rooms') return;
    const cleanDigits = vipRoomNumberInput.replace(/\D/g, '');
    if (!cleanDigits) {
      setVipCheckResult(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setVipChecking(true);
      try {
        const res = await api.checkVipRoomAvailability(
          adminPassword,
          cleanDigits,
          vipSelectedUserId || undefined
        );
        if (!cancelled && res) {
          setVipCheckResult({
            available: Boolean(res.available),
            normalized: res.normalized || cleanDigits,
            valid: res.valid !== false,
            isFancyVip: res.isFancyVip,
            conflictOwner: res.conflictOwner || null,
            message: res.message,
          });
        }
      } catch {
        if (!cancelled) setVipCheckResult(null);
      } finally {
        if (!cancelled) setVipChecking(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeTab, vipRoomNumberInput, vipSelectedUserId, adminPassword]);

  useEffect(() => {
    loadMultiDeviceSessions();
  }, []);

  useEffect(() => {
    if (activeTab === 'multi_device') {
      loadMultiDeviceSessions();
    }
  }, [activeTab]);

  const handleAssignVipRoom = async () => {
    if (!vipSelectedUserId) {
      showToast('कृपया पहले किसी सदस्य का चयन करें', 'error');
      return;
    }
    const targetUser = users.find(u => u.userId === vipSelectedUserId);
    // Once assigned, Personal Room ID is strictly locked & non-editable. Use existing roomAddress!
    const lockedRoomDigits = (targetUser?.roomAddress || vipRoomNumberInput).replace(/\D/g, '');
    if (lockedRoomDigits.length < 3 || lockedRoomDigits.length > 10) {
      showToast('VIP Room ID केवल 3 से 10 अंकों का नंबर होना चाहिए (जैसे 1111, 2222, 1234)', 'error');
      return;
    }
    setVipSaving(true);
    try {
      const res = await api.assignVipRoomNumber(
        adminPassword,
        vipSelectedUserId,
        lockedRoomDigits,
        true,
        vipRoomLabelInput.trim() || 'VIP Royal'
      );
      if (res?.success) {
        showToast(res.message || `👑 Room #${lockedRoomDigits} पर VIP बैज अपडेट हो गया!`, 'success');
        const updatedUser = res.user;
        if (updatedUser) {
          setUsers(prev => prev.map(u => (u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u)));
        }
        await loadAdminData();
      } else {
        showToast(res?.message || 'VIP बैज अपडेट करने में त्रुटि आई', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'पर्सनल रूम आईडी लॉक है — केवल VIP बैज अपडेट संभव है', 'error');
    } finally {
      setVipSaving(false);
    }
  };

  const handleAdminAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = coinGrantIdentifier.trim();
    const numericAmt = Math.floor(Number(coinGrantAmount) || 0);
    if (!cleanId) {
      setCoinGrantResult({ ok: false, text: 'कृपया User ID या @username दर्ज करें या लिस्ट से मेंबर चुनें।' });
      return;
    }
    if (numericAmt <= 0) {
      setCoinGrantResult({ ok: false, text: 'कृपया 1 या उससे अधिक Coins संख्या दर्ज करें।' });
      return;
    }
    setCoinGrantBusy(true);
    setCoinGrantResult(null);
    try {
      const res = await api.adminAdjustUserCoins(
        adminPassword,
        cleanId,
        numericAmt,
        coinGrantMode,
        coinGrantReason.trim() || 'Admin Coin Adjustment'
      );
      if (!res?.success) {
        const msg = res?.message || 'Coins अपडेट नहीं हो सके';
        setCoinGrantResult({ ok: false, text: msg });
        showToast(msg, 'error');
        return;
      }
      const updatedUser = res.user;
      if (updatedUser) {
        setUsers(prev => prev.map(u => (u.userId === updatedUser.userId ? { ...u, ...updatedUser } : u)));
      } else {
        await loadAdminData();
      }
      const msg = res.message || `✅ Coins सफलतापूर्वक अपडेट हुए (${res.balanceBefore ?? ''} -> ${res.balanceAfter ?? ''})`;
      setCoinGrantResult({ ok: true, text: msg });
      showToast(msg, 'success');
    } catch (err: any) {
      const msg = err?.message || 'Coins एडजस्ट करने में त्रुटि आई';
      setCoinGrantResult({ ok: false, text: msg });
      showToast(msg, 'error');
    } finally {
      setCoinGrantBusy(false);
    }
  };

  const handleCreateRealPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerForm.fullName.trim() || !newPlayerForm.phone.trim() || newPlayerForm.password.trim().length < 3) {
      showToast('प्लेयर नाम, मोबाइल नंबर और कम से कम 3 अक्षर का पासवर्ड लिखें!', 'error');
      return;
    }
    setCreatingPlayer(true);
    try {
      const res = await api.adminCreatePlayer(adminPassword, {
        fullName: newPlayerForm.fullName.trim(),
        username: newPlayerForm.username.trim() || undefined,
        phone: newPlayerForm.phone.trim(),
        password: newPlayerForm.password.trim(),
        coins: Number(newPlayerForm.coins) || 0,
        charms: Number(newPlayerForm.charms) || 0,
        gameLevel: Number(newPlayerForm.gameLevel) || 1,
        vipTier: newPlayerForm.vipTier,
        frameType: newPlayerForm.frameType,
        roomNumber: newPlayerForm.roomNumber.trim() || undefined,
        clanName: newPlayerForm.clanName.trim() || 'Royal Warriors ESP',
        bio: newPlayerForm.bio.trim() || undefined,
      });
      if (res?.success && res.user) {
        showToast(res.message || 'नया खिलाड़ी सफलतापूर्वक बन गया!', 'success');
        setUsers(prev => [res.user!, ...prev]);
        setNewPlayerForm({
          fullName: '',
          username: '',
          phone: '',
          password: '',
          coins: '500',
          charms: '120',
          gameLevel: '5',
          vipTier: 'gold',
          frameType: 'vip-gold',
          roomNumber: '',
          clanName: 'Royal Warriors ESP',
          bio: '',
        });
        await loadAdminData();
      } else {
        showToast(res?.message || 'खिलाड़ी बनाने में विफल', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'नेटवर्क त्रुटि', 'error');
    } finally {
      setCreatingPlayer(false);
    }
  };

  const handleSaveEditedPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayerModal) return;
    setSavingPlayerEdit(true);
    try {
      const res = await api.editUserDetails(editingPlayerModal.user.userId, adminPassword, {
        fullName: editingPlayerModal.fullName.trim(),
        username: editingPlayerModal.username.trim(),
        phone: editingPlayerModal.phone.trim(),
        password: editingPlayerModal.password.trim() || undefined,
        coins: Number(editingPlayerModal.coins),
        charms: Number(editingPlayerModal.charms),
        gameLevel: Number(editingPlayerModal.gameLevel),
        vipTier: editingPlayerModal.vipTier,
        frameType: editingPlayerModal.frameType,
        clanName: editingPlayerModal.clanName.trim(),
      });
      if (res?.success) {
        showToast(res.message || 'प्लेयर डिटेल्स व पासवर्ड अपडेट हो गए!', 'success');
        setEditingPlayerModal(null);
        await loadAdminData();
      } else {
        showToast(res?.message || 'अपडेट विफल रहा', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'त्रुटि हुई', 'error');
    } finally {
      setSavingPlayerEdit(false);
    }
  };

  const handleResetVipRoom = (targetUser: UserProfile) => {
    openActionModal({
      title: 'Standard Sequential Room ID पर रीसेट करें',
      description: `क्या आप ${targetUser.fullName} (${targetUser.userId}) का VIP Room ID (${targetUser.roomAddress}) हटाकर सामान्य काउंटिंग ID (10001+) पर रीसेट करना चाहते हैं?`,
      confirmLabel: 'हाँ, Count ID पर रीसेट करें',
      variant: 'reject',
      onConfirm: async () => {
        setVipSaving(true);
        try {
          const res = await api.resetVipRoomNumber(adminPassword, targetUser.userId);
          if (res?.success) {
            const nextRoomId = res.user?.roomAddress || res.room?.roomAddress || '';
            showToast(res.message || `रूम ID रीसेट हो गया: ${nextRoomId}`, 'info');
            if (targetUser.userId === vipSelectedUserId && nextRoomId) {
              setVipRoomNumberInput(nextRoomId);
            }
            await loadAdminData();
          } else {
            showToast(res?.message || 'रीसेट विफल रहा', 'error');
          }
        } catch (err: any) {
          showToast(err?.message || 'रीसेट करने में त्रुटि आई', 'error');
        } finally {
          setVipSaving(false);
        }
      },
    });
  };

  const handleOpenUserAudit = async (userId: string) => {
    setAuditLoading(true);
    try {
      const data = await api.getUserFullAudit(userId, adminPassword);
      if (data.success) {
        setSelectedAuditUser(data);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to load user audit', 'error');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, newStatus: 'active' | 'rejected') => {
    try {
      const res = await api.updateUserStatus(userId, newStatus, adminPassword);
      if (res.success) {
        setUsers(users.map(u => (u.userId === userId ? { ...u, status: newStatus, ...(res.user || {}) } : u)));
        if (selectedAuditUser && selectedAuditUser.user.userId === userId) {
          setSelectedAuditUser({
            ...selectedAuditUser,
            user: { ...selectedAuditUser.user, status: newStatus, ...(res.user || {}) },
          });
        }
        // Refresh overview stats
        api.getAdminOverview(adminPassword).then(d => {
          if (d.success) setStats(d.stats);
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to update user status', 'error');
    }
  };

  const handleOpenSwiShareModal = (u: UserProfile) => {
    setSwiModalUser(u);
    setSwiAppUrlInput(u.swiAppLink || settingsForm.swiSpecialAppLink || '');
    setSwiAppNoteInput(
      u.swiAppNote ||
        'आपका SWI 3.3% स्पेशल रिचार्ज ऐप लिंक सक्रिय हो गया है! ऊपर दिए लिंक से ऐप इंस्टॉल करें और हर रिचार्ज पर 3.3% कमीशन पाएं।'
    );
  };

  const handleShareSwiAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swiModalUser || !swiAppUrlInput.trim()) return;
    setSwiSharing(true);
    try {
      const res = await api.shareSwiAppLink(
        swiModalUser.userId,
        swiAppUrlInput.trim(),
        swiAppNoteInput.trim(),
        adminPassword
      );
      if (res.success) {
        showToast(`${swiModalUser.fullName} को 3.3% App Link डैशबोर्ड पर भेज दिया गया!`, 'success');
        setUsers(prev =>
          prev.map(u => (u.userId === swiModalUser.userId ? { ...u, ...(res.user || {}), swiAppLink: swiAppUrlInput.trim() } : u))
        );
        setSwiModalUser(null);
      } else {
        showToast(res.message || 'App Link शेयर करने में विफल', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि हुई', 'error');
    } finally {
      setSwiSharing(false);
    }
  };

  const handleApprovePlanUpgrade = (upgradeId: string, status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'स्वीकृत (Approve)' : 'अस्वीकृत (Reject)';
    openActionModal({
      title: `प्लान अपग्रेड ${label} करें`,
      description: `क्या आप इस प्लान अपग्रेड अनुरोध को ${label} करना चाहते हैं?`,
      confirmLabel: label,
      variant: status === 'approved' ? 'approve' : 'reject',
      onConfirm: async () => {
        setUpgradeProcessingId(upgradeId);
        try {
          const res = await api.approvePlanUpgrade(upgradeId, status, adminPassword);
          if (res.success) {
            showToast(
              status === 'approved' ? 'प्लान अपग्रेड स्वीकृत हो गया व स्पॉन्सर बोनस क्रेडिट हो गया!' : 'अपग्रेड अनुरोध रद्द किया गया।',
              'success'
            );
            setPlanUpgrades(prev => prev.map(u => (u.id === upgradeId ? { ...u, status } : u)));
            loadAdminData();
          } else {
            showToast(res.message || 'कार्रवाई विफल रही', 'error');
          }
        } catch (err: any) {
          showToast(err.message || 'त्रुटि हुई', 'error');
        } finally {
          setUpgradeProcessingId(null);
        }
      },
    });
  };

  const handleApprovePayout = (payoutId: string) => {
    openActionModal({
      title: 'UPI निकासी भुगतान स्वीकृत करें',
      description: 'यूजर के UPI खाते में राशि भेजने के बाद बैंक / UPI UTR रेफरेंस नंबर दर्ज करें।',
      confirmLabel: 'Mark Paid (Approve)',
      variant: 'approve',
      needsInput: true,
      inputLabel: 'Bank / UPI Transaction UTR Reference *',
      inputPlaceholder: 'उदा. 412345678901',
      inputRequired: true,
      onConfirm: async (ref) => {
        try {
          const res = await api.approvePayout(payoutId, ref.trim(), adminPassword);
          if (res.success) {
            showToast('पेआउट सफलतापूर्वक स्वीकृत व सेटल किया गया!', 'success');
            setPayouts(payouts.map(p => (p.id === payoutId ? { ...p, status: 'approved', transactionRef: ref.trim() } : p)));
            loadAdminData();
          } else {
            showToast(res.message || 'Failed to approve payout', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'Failed to approve payout', 'error');
        }
      },
    });
  };

  const handleRejectPayout = (payoutId: string, amount: number, userName: string) => {
    openActionModal({
      title: 'निकासी अस्वीकृत कर राशि वॉलेट में वापस करें',
      description: `${userName} का ₹${amount} निकासी अनुरोध अस्वीकृत करने पर एस्क्रो में लॉक ₹${amount} स्वतः यूजर के उपलब्ध वॉलेट बैलेंस में रिफंड हो जाएगा।`,
      confirmLabel: 'Reject & Refund Balance',
      variant: 'reject',
      needsInput: true,
      inputLabel: 'अस्वीकृति का कारण',
      inputPlaceholder: 'उदा. गलत UPI ID / खाता सत्यापन विफल',
      inputRequired: false,
      onConfirm: async (reason) => {
        try {
          const res = await api.rejectPayout(
            payoutId,
            reason.trim() || 'अमान्य UPI पता अथवा एडमिन द्वारा रद्द',
            adminPassword
          );
          if (res.success) {
            showToast(`निकासी अस्वीकृत व ₹${amount} यूजर वॉलेट में रिफंड कर दिया गया!`, 'info');
            setPayouts(payouts.map(p => (p.id === payoutId ? { ...p, status: 'rejected', rejectionReason: reason.trim() } : p)));
            loadAdminData();
          } else {
            showToast(res.message || 'अस्वीकृति विफल रही', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'अस्वीकृति विफल रही', 'error');
        }
      },
    });
  };

  const handleFulfillGiftCard = (gc: GiftCardRedemption) => {
    openActionModal({
      title: `वाउचर कोड जारी करें (${gc.brand})`,
      description: `${gc.userName} (${gc.userId}) ने ₹${gc.denomination} (${gc.coinsSpent} Coins) का रिडेम्पशन अनुरोध किया है। रियल डिजिटल वाउचर कोड दर्ज करें।`,
      confirmLabel: 'वाउचर कोड भेजें (Fulfill)',
      variant: 'approve',
      needsInput: true,
      inputLabel: 'Official Digital Voucher / Redeem Code *',
      inputPlaceholder: 'उदा. AMZN-XXXX-YYYY-ZZZZ',
      inputRequired: true,
      secondaryInputLabel: 'Voucher PIN (यदि लागू हो, वैकल्पिक)',
      secondaryInputPlaceholder: '6-digit PIN (optional)',
      onConfirm: async (voucherCode, voucherPin) => {
        setGiftCardProcessingId(gc.id);
        try {
          const res = await api.fulfillGiftCardRedemption(gc.id, voucherCode.trim(), adminPassword, voucherPin.trim());
          if (res.success) {
            showToast('डिजिटल वाउचर कोड सफलतापूर्वक यूजर को डिलीवर हो गया!', 'success');
            setGiftCardRedemptions(prev =>
              prev.map(item =>
                item.id === gc.id
                  ? { ...item, status: 'fulfilled', voucherCode: voucherCode.trim(), voucherPin: voucherPin.trim() || undefined }
                  : item
              )
            );
          } else {
            showToast(res.message || 'वाउचर जारी करने में विफल', 'error');
          }
        } catch (e: any) {
          showToast(e.message || 'त्रुटि हुई', 'error');
        } finally {
          setGiftCardProcessingId(null);
        }
      },
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg(null);
    try {
      const updated = await api.updateSettings(settingsForm, adminPassword);
      onUpdateSettings(updated);
      setSettingsMsg('Platform settings, UPI details & QR updated successfully!');
    } catch (err: any) {
      setSettingsMsg(err.message || 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addService(newServiceForm, adminPassword);
      if (res.success) {
        setServices(res.services);
        setShowAddService(false);
        setNewServiceForm({
          code: '',
          name: '',
          hindiName: '',
          description: '',
          hindiDescription: '',
          category: 'direct',
          defaultFee: 50,
          dailyEarningEst: '₹25 - ₹250 / day',
          referralBonusPercent: 40,
        });
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to add service', 'error');
    }
  };

  const handleDeleteService = (serviceId: string, name: string) => {
    openActionModal({
      title: 'सर्विस प्लान हटाएं',
      description: `क्या आप वाकई "${name}" सर्विस प्लान को कैटलॉग से हटाना चाहते हैं?`,
      confirmLabel: 'Remove Service',
      variant: 'reject',
      onConfirm: async () => {
        try {
          const res = await api.deleteService(serviceId, adminPassword);
          if (res.success) {
            setServices(res.services);
            showToast('सर्विस हटाई गई', 'info');
          }
        } catch (e: any) {
          showToast(e.message || 'Failed to delete service', 'error');
        }
      },
    });
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettingsForm(prev => ({ ...prev, adminQrCodeUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = users.filter(u => {
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    const q = (searchMember || '').toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.userId || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.paymentUtr || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 py-5 pb-20 w-full overflow-x-hidden">
      {/* Admin Header */}
      <div className="bg-[#2874f0] rounded-md p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-white/15 text-[#ffe500] flex items-center justify-center border border-white/25 shrink-0">
            <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-xl font-bold text-white">ESP Master Admin Panel</h1>
              <span className="text-[10px] bg-[#ffe500] text-[#212121] font-bold px-2 py-0.5 rounded-sm">
                SECURE
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              User approvals, UTR proof verification, service manager &amp; permanent database
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAdminCloudSync}
            disabled={cloudSyncing}
            className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#ffe500] hover:bg-yellow-300 transition cursor-pointer shadow-2xs disabled:opacity-60"
          >
            {cloudSyncing ? '☁️ Syncing Cloud...' : '☁️ Sync Cloud (Firestore)'}
          </button>
          <button
            onClick={onLogoutAdmin}
            className="px-4 py-2 rounded-sm text-xs font-bold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 transition cursor-pointer shadow-2xs"
          >
            Exit Admin Mode
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Registrations</p>
            <p className="text-xl sm:text-2xl font-bold text-[#212121]">{stats.totalUsers}</p>
            <p className="text-[11px] text-[#388e3c] font-semibold mt-0.5">{stats.activeUsers} Approved Members</p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-md border border-amber-200 shadow-2xs">
            <p className="text-[10px] text-amber-800 uppercase font-bold">Pending Review</p>
            <p className="text-xl sm:text-2xl font-bold text-[#fb641b]">{stats.pendingUsers}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Need UTR approval</p>
          </div>
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total Volume</p>
            <p className="text-xl sm:text-2xl font-bold text-[#388e3c]">₹{stats.totalVolume}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">From approved members</p>
          </div>
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Active Services</p>
            <p className="text-xl sm:text-2xl font-bold text-[#2874f0]">{services.length}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Catalog</p>
          </div>
        </div>
      )}

      {/* Live Coin Recharge & Admin Alert Banner */}
      {coinRecharges.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-400 rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fb641b] text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#212121]">
                🪙 {coinRecharges.filter(r => r.status === 'pending').length} नया कॉइन रिचार्ज अनुरोध पेंडिंग है!
              </p>
              {(() => {
                const latestPending = coinRecharges.find(r => r.status === 'pending');
                if (!latestPending) return null;
                return (
                  <p className="text-[11px] text-amber-900 mt-0.5">
                    ताज़ा संदेश: <strong>{latestPending.userName}</strong> ({latestPending.userId}) ने <strong>₹{latestPending.amount}</strong> (+{latestPending.coins + latestPending.bonusCoins} Coins) • UTR: <span className="font-mono font-bold">{latestPending.paymentUtr}</span>
                  </p>
                );
              })()}
            </div>
          </div>
          <button
            onClick={() => setActiveTab('coin_recharges')}
            className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
          >
            UTR व स्क्रीनशॉट देखें ➔
          </button>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="bg-white border border-slate-200 rounded-md p-2 flex overflow-x-auto gap-1.5 text-xs font-bold no-scrollbar shadow-2xs">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'members'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          Members Verification &amp; Audit ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('players_builder')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'players_builder'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>🎮 Real Players &amp; Passwords ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'services'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          Services (Add / Remove)
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'payouts'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          UPI Payouts ({payouts.filter(p => p.status === 'pending').length} Pending)
        </button>

        <button
          onClick={() => setActiveTab('coin_recharges')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'coin_recharges'
              ? 'bg-[#2874f0] text-white'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          <span>🪙 कॉइन रिचार्ज ऑर्डर्स ({coinRecharges.filter(r => r.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('give_coins')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'give_coins'
              ? 'bg-[#388e3c] text-white'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>🪙 Give Coins (User ID)</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'messages'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>📩 Messages &amp; Alerts ({contactMessages.filter(m => m.status === 'unread').length + adminNotifications.filter(n => !n.read).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          UPI Gateway &amp; QR Settings
        </button>

        <button
          onClick={() => {
            setActiveTab('weekly_clock');
            loadAdminTimeStats();
          }}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'weekly_clock'
              ? 'bg-[#fb641b] text-white'
              : 'text-orange-800 bg-orange-50 hover:bg-orange-100 border border-orange-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏰ 12 AM Clock &amp; Weekly Rewards</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'audits'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>User Profile Audits &amp; Modification Logs ({users.filter(u => u.editHistory && u.editHistory.length > 0).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gift_cards')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'gift_cards'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>🎁 Gift Cards ({giftCardRedemptions.filter(g => g.status === 'pending_fulfillment').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('vip_rooms')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'vip_rooms'
              ? 'bg-[#2874f0] text-white'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Crown className="w-3.5 h-3.5" />
          <span>👑 VIP Room IDs ({users.filter(u => u.isVipRoom || isVipFancyRoomNumber(u.roomAddress)).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('multi_device')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'multi_device'
              ? 'bg-[#2874f0] text-white'
              : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>🖥️ Multi-Device Control ({multiDeviceData?.adminSessions.length || 1}/4)</span>
        </button>

        <button
          onClick={() => setActiveTab('slider_photos')}
          className={`px-3.5 py-2 rounded-sm transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'slider_photos'
              ? 'bg-[#2874f0] text-white'
              : 'text-[#212121] hover:bg-[#f1f3f6]'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          <span>🖼️ होम पॉपअप 7-फोटो स्लाइडर ({sliderPhotos.length}/7)</span>
        </button>
      </div>

      {/* ===================== TAB 1B: REAL PLAYERS & PASSWORD CREDENTIALS BUILDER ===================== */}
      {activeTab === 'players_builder' && (() => {
        const pq = playerSearchQuery.toLowerCase().trim();
        const filteredPlayers = users.filter(
          u =>
            !pq ||
            u.fullName.toLowerCase().includes(pq) ||
            u.userId.toLowerCase().includes(pq) ||
            (u.username || '').toLowerCase().includes(pq) ||
            (u.phone || '').includes(pq) ||
            (u.roomAddress || '').includes(pq)
        );
        return (
          <div className="space-y-5">
            {/* Create Real Player Card */}
            <form
              onSubmit={handleCreateRealPlayer}
              className="bg-white border border-indigo-200 rounded-md p-5 shadow-2xs space-y-4 text-[#212121]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-indigo-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>नया रियल खिलाड़ी बनाएं (Individual ID, Password, Level &amp; VIP Effect)</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    यहां से बने हर खिलाड़ी की अलग असली ID, अलग पासवर्ड (लॉगिन योग्य), अलग Level व VIP इफ़ेक्ट होगा जो लाइव लीडरबोर्ड और रूम में दिखेगा।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">खिलाड़ी का नाम *</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.fullName}
                    onChange={e => setNewPlayerForm(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="उदा. Aarav Rajput"
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">@Username (Symbol-free)</label>
                  <input
                    type="text"
                    value={newPlayerForm.username}
                    onChange={e => setNewPlayerForm(p => ({ ...p, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() }))}
                    placeholder="उदा. aaravpro07"
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.phone}
                    onChange={e => setNewPlayerForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit Mobile"
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">व्यक्तिगत पासवर्ड (Login Pass) *</label>
                  <input
                    type="text"
                    required
                    value={newPlayerForm.password}
                    onChange={e => setNewPlayerForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="उदा. aarav@7788"
                    className="w-full bg-amber-50 border border-amber-300 rounded-sm px-3 py-2 font-mono font-bold outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रारंभिक Coins (🪙)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlayerForm.coins}
                    onChange={e => setNewPlayerForm(p => ({ ...p, coins: e.target.value }))}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रारंभिक Charms (✨)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPlayerForm.charms}
                    onChange={e => setNewPlayerForm(p => ({ ...p, charms: e.target.value }))}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Game Level (1–99)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newPlayerForm.gameLevel}
                    onChange={e => setNewPlayerForm(p => ({ ...p, gameLevel: e.target.value }))}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">VIP Tier इफ़ेक्ट</label>
                  <select
                    value={newPlayerForm.vipTier}
                    onChange={e => {
                      const vt = e.target.value as 'none' | 'silver' | 'gold' | 'diamond';
                      setNewPlayerForm(p => ({
                        ...p,
                        vipTier: vt,
                        frameType:
                          vt === 'diamond'
                            ? 'royal-dragon-crown'
                            : vt === 'gold'
                            ? 'vip-gold'
                            : vt === 'silver'
                            ? 'cyber-diamond'
                            : 'standard',
                      }));
                    }}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-bold outline-none"
                  >
                    <option value="none">Standard (No VIP)</option>
                    <option value="silver">🛡️ Silver VIP</option>
                    <option value="gold">👑 Gold VIP</option>
                    <option value="diamond">💎 Diamond Royal VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Avatar Frame Effect</label>
                  <select
                    value={newPlayerForm.frameType}
                    onChange={e => setNewPlayerForm(p => ({ ...p, frameType: e.target.value }))}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 outline-none"
                  >
                    <option value="standard">Standard Ring</option>
                    <option value="vip-gold">👑 VIP Gold Glow</option>
                    <option value="cyber-diamond">💠 Cyber Diamond</option>
                    <option value="royal-dragon-crown">🐉 Royal Dragon Crown</option>
                    <option value="mythic-crimson">🔥 Mythic Crimson</option>
                    <option value="clan-leader">🛡️ Clan Leader Emblem</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Numeric / VIP Room ID (Optional)</label>
                  <input
                    type="text"
                    value={newPlayerForm.roomNumber}
                    onChange={e => setNewPlayerForm(p => ({ ...p, roomNumber: e.target.value.replace(/\D/g, '') }))}
                    placeholder="उदा. 2222 या खाली छोड़ें"
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Family / Clan Name</label>
                  <input
                    type="text"
                    value={newPlayerForm.clanName}
                    onChange={e => setNewPlayerForm(p => ({ ...p, clanName: e.target.value }))}
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-2 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={creatingPlayer}
                    className="w-full py-2.5 px-4 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow cursor-pointer disabled:opacity-50"
                  >
                    {creatingPlayer ? 'खिलाड़ी बन रहा है...' : '➕ नया खिलाड़ी व पासवर्ड बनाएं'}
                  </button>
                </div>
              </div>
            </form>

            {/* All Players Password, Level, VIP & Stats Table */}
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="text-sm font-black text-[#212121]">
                  रजिस्टर्ड खिलाड़ी व लॉगिन पासवर्ड सूची ({filteredPlayers.length})
                </h4>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={playerSearchQuery}
                    onChange={e => setPlayerSearchQuery(e.target.value)}
                    placeholder="नाम, @username, मोबाइल या ID खोजें..."
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm pl-9 pr-3 py-1.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#f9fafb] text-[10px] uppercase text-slate-600">
                      <th className="py-2.5 px-3">Player &amp; @Username</th>
                      <th className="py-2.5 px-3">User ID &amp; Phone</th>
                      <th className="py-2.5 px-3">Password</th>
                      <th className="py-2.5 px-3">Level &amp; VIP Effect</th>
                      <th className="py-2.5 px-3">Coins &amp; Charms</th>
                      <th className="py-2.5 px-3">Room #</th>
                      <th className="py-2.5 px-3 text-right">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredPlayers.map(u => (
                      <tr key={u.userId} className="hover:bg-indigo-50/40">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`}
                              alt={u.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-300"
                            />
                            <div>
                              <div className="font-bold text-[#212121]">{u.fullName}</div>
                              <div className="text-[10px] font-mono text-indigo-600">
                                @{u.username || 'user'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px]">
                          <div className="font-bold text-[#2874f0] select-all">{u.userId}</div>
                          <div className="text-slate-600 select-all">{u.phone}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-900 select-all">
                          <span className="px-2 py-0.5 rounded-sm bg-amber-50 border border-amber-200">
                            {u.password || '—'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded-sm bg-blue-50 text-[#2874f0] border border-blue-200 font-black text-[10px]">
                              Lv.{u.gameLevel || 1}
                            </span>
                            {u.vipTier && u.vipTier !== 'none' ? (
                              <span className="px-1.5 py-0.5 rounded-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] uppercase">
                                {u.vipTier === 'diamond' ? '💎 DIAMOND' : u.vipTier === 'gold' ? '👑 GOLD' : '🛡️ SILVER'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-bold text-[#fb641b]">🪙 {(u.coins || 0).toLocaleString()}</div>
                          <div className="text-[10px] text-pink-600">✨ {(u.charms || 0).toLocaleString()}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          #{u.roomAddress || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingPlayerModal({
                                user: u,
                                fullName: u.fullName,
                                username: u.username || '',
                                phone: u.phone || '',
                                password: u.password || '',
                                coins: String(u.coins || 0),
                                charms: String(u.charms || 0),
                                gameLevel: String(u.gameLevel || 1),
                                vipTier: (u.vipTier as any) || 'none',
                                frameType: u.frameType || 'standard',
                                clanName: u.clanName || 'Royal Warriors ESP',
                              })
                            }
                            className="px-2.5 py-1 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================== TAB 1: MEMBERS AUDIT ===================== */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-md border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member, Roll No, UTR..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm pl-9 pr-3.5 py-2 text-xs text-[#212121] outline-none focus:border-[#2874f0]"
              />
            </div>

            {/* Quick Status Filter Buttons */}
            <div className="flex items-center flex-wrap gap-1 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'all' ? 'bg-[#2874f0] text-white' : 'text-slate-600 hover:text-[#212121]'
                }`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'pending' ? 'bg-[#fb641b] text-white' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                Pending ({users.filter(u => u.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'active' ? 'bg-[#388e3c] text-white' : 'text-[#388e3c] hover:bg-emerald-50'
                }`}
              >
                Approved ({users.filter(u => u.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  statusFilter === 'rejected' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                Rejected
              </button>
            </div>
          </div>

          <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Member Name</th>
                    <th className="py-2.5 px-3">Plan &amp; Fee</th>
                    <th className="py-2.5 px-3">UTR Reference</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Approve / Reject Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#2874f0]">{u.userId}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#212121] block">{u.fullName}</span>
                        <span className="text-[11px] text-slate-500">{u.phone}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[#388e3c] font-bold">{u.chosenServiceCode}</span>
                        <span className="text-slate-600 ml-1">(₹{u.joiningFee})</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#212121] select-all font-semibold">
                        {u.paymentUtr}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : u.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end flex-wrap gap-1.5">
                          {u.status !== 'active' && (
                            <button
                              onClick={() => handleToggleUserStatus(u.userId, 'active')}
                              className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white transition cursor-pointer shadow-2xs"
                              title="Approve Member & Unlock ID Card"
                            >
                              Approve
                            </button>
                          )}
                          {u.status === 'active' && (
                            <button
                              onClick={() => handleOpenSwiShareModal(u)}
                              className={`px-2 py-1 rounded-sm text-[10px] font-bold transition cursor-pointer flex items-center space-x-1 border ${
                                u.swiAppLink
                                  ? 'bg-blue-50 text-[#2874f0] border-blue-200 hover:bg-blue-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              }`}
                              title="Share 3.3% SWI Special App Link directly to user's Dashboard"
                            >
                              <span>{u.swiAppLink ? '📲 Link Sent ✓' : '📲 3.3% App Link'}</span>
                            </button>
                          )}
                          {u.status !== 'rejected' && (
                            <button
                              onClick={() => handleToggleUserStatus(u.userId, 'rejected')}
                              className="px-2 py-1 rounded-sm text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                              title="Reject Fake / Invalid Proof"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenUserAudit(u.userId)}
                            className="px-2 py-1 rounded-sm text-[10px] font-bold bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 transition cursor-pointer"
                          >
                            Audit
                          </button>
                          <button
                            onClick={() => setViewingIdCardUser(u)}
                            className="px-2 py-1 rounded-sm text-[10px] font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer flex items-center space-x-1"
                            title="View Verified Digital ID Card"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>ID Card</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Plan Upgrade Verification Section (₹100+ Self Upgrades) */}
          {planUpgrades.length > 0 && (
            <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-[#212121] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2874f0]" />
                    <span>प्लान अपग्रेड अनुरोध (Plan Upgrades ₹100+)</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Approve करने पर यूजर का नया प्लान सक्रिय होगा और स्पॉन्सर को 50% अपग्रेड कमीशन मिलेगा। SWI (₹300+) में डिफ़ॉल्ट 3.3% ऐप लिंक स्वतः जुड़ जाएगा।
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-sm bg-blue-50 text-[#2874f0] border border-blue-200">
                  {planUpgrades.filter(p => p.status === 'pending').length} Pending
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                      <th className="py-2 px-2">Member</th>
                      <th className="py-2 px-2">Plan Switch</th>
                      <th className="py-2 px-2">Fee</th>
                      <th className="py-2 px-2">UTR</th>
                      <th className="py-2 px-2">Status</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {planUpgrades.map(upg => (
                      <tr key={upg.id} className="hover:bg-[#f5f8ff]">
                        <td className="py-2 px-2">
                          <span className="font-bold text-[#212121] block">{upg.userName}</span>
                          <span className="font-mono text-[10px] text-[#2874f0] font-semibold">{upg.userId}</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-slate-600">{upg.fromServiceCode} (₹{upg.fromFee})</span>
                          <span className="mx-1 text-[#fb641b] font-bold">&rarr;</span>
                          <strong className="text-[#388e3c]">{upg.targetServiceCode} (₹{upg.upgradeFee})</strong>
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-[#212121]">₹{upg.upgradeFee}</td>
                        <td className="py-2 px-2 font-mono text-[#212121] select-all">{upg.paymentUtr}</td>
                        <td className="py-2 px-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                            upg.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : upg.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {upg.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          {upg.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleApprovePlanUpgrade(upg.id, 'approved')}
                                disabled={upgradeProcessingId === upg.id}
                                className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white cursor-pointer disabled:opacity-50"
                              >
                                Approve Upgrade
                              </button>
                              <button
                                onClick={() => handleApprovePlanUpgrade(upg.id, 'rejected')}
                                disabled={upgradeProcessingId === upg.id}
                                className="px-2 py-1 rounded-sm text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Full User Audit & Form Data Modal */}
          {selectedAuditUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#388e3c]" />
                      <span>
                        User Verification &amp; Audit: {selectedAuditUser.user.fullName} ({selectedAuditUser.user.userId})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Sponsor: {selectedAuditUser.user.sponsorName} ({selectedAuditUser.user.sponsorId})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAuditUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Data Originally Submitted */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-[#2874f0] uppercase text-[10px] tracking-wider">
                    1. Form Data Originally Submitted by User
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[#212121]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Name:</span>
                      <strong>{selectedAuditUser.user.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mobile / WhatsApp:</span>
                      <strong>{selectedAuditUser.user.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Email:</span>
                      <span>{selectedAuditUser.user.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Address:</span>
                      <span>{selectedAuditUser.user.fullAddress || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payment UPI Address:</span>
                      <span className="font-mono text-[#388e3c] font-semibold">{selectedAuditUser.user.paymentAddress}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Payment UTR / Ref Number:</span>
                      <span className="font-mono text-[#fb641b] font-bold select-all text-sm">
                        {selectedAuditUser.user.paymentUtr}
                      </span>
                    </div>
                  </div>

                  {selectedAuditUser.user.paymentScreenshot && (
                    <div className="pt-2">
                      <span className="text-slate-500 block text-[10px] mb-1">Attached Screenshot Proof:</span>
                      <img
                        src={selectedAuditUser.user.paymentScreenshot}
                        alt="Proof"
                        className="max-h-52 rounded-md border border-slate-300 object-contain bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* 2. User Profile Modification History (Audit Trail) */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#2874f0] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>2. User Profile Modification History ({selectedAuditUser.user.editHistory?.length || 0} Changes)</span>
                    </h4>
                  </div>

                  {(!selectedAuditUser.user.editHistory || selectedAuditUser.user.editHistory.length === 0) ? (
                    <p className="text-slate-500 text-[11px]">
                      यूजर ने अभी तक प्रोफाइल में कोई बदलाव नहीं किया है (मूल रजिस्ट्रेशन डेटा सक्रिय है)।
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 text-[9px] uppercase">
                            <th className="py-1.5 px-2">Timestamp</th>
                            <th className="py-1.5 px-2">Field</th>
                            <th className="py-1.5 px-2">Old Value</th>
                            <th className="py-1.5 px-2">New Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono">
                          {selectedAuditUser.user.editHistory.map((h: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white">
                              <td className="py-1 px-2 text-slate-500 text-[10px]">
                                {new Date(h.date).toLocaleString('hi-IN')}
                              </td>
                              <td className="py-1 px-2 text-[#212121] font-sans font-bold uppercase text-[10px]">
                                {h.field}
                              </td>
                              <td className="py-1 px-2 text-rose-700 text-[10px]">
                                {h.oldValue || '—'}
                              </td>
                              <td className="py-1 px-2 text-[#388e3c] font-bold text-[10px]">
                                {h.newValue || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Downlines of this User */}
                <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2 text-xs">
                  <h4 className="font-bold text-[#388e3c] uppercase text-[10px] tracking-wider">
                    3. Downline Referrals Created by this User ({selectedAuditUser.downline.length} Members)
                  </h4>
                  {selectedAuditUser.downline.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No downline members joined under this user yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-600 text-[9px]">
                            <th>Member Name</th>
                            <th>Roll No</th>
                            <th>Plan</th>
                            <th>Commission</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {selectedAuditUser.downline.map((dl: any) => (
                            <tr key={dl.id}>
                              <td className="py-1 font-semibold text-[#212121]">{dl.downlineName}</td>
                              <td className="py-1 font-mono text-[#2874f0] font-semibold">{dl.downlineUserId}</td>
                              <td className="py-1 text-slate-600">₹{dl.joiningFee}</td>
                              <td className="py-1 font-bold text-[#388e3c]">+₹{dl.commissionAmount}</td>
                              <td className="py-1 text-slate-500">{dl.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Status Update Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-slate-200">
                  <div className="text-xs">
                    <span className="text-slate-500">Current Status: </span>
                    <strong className={`uppercase ${
                      selectedAuditUser.user.status === 'active' ? 'text-[#388e3c]' : 'text-[#fb641b]'
                    }`}>
                      {selectedAuditUser.user.status}
                    </strong>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(selectedAuditUser.user.userId, 'rejected')}
                      className="px-3.5 py-2 rounded-sm text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                    >
                      Reject Account
                    </button>
                    <button
                      onClick={() => handleToggleUserStatus(selectedAuditUser.user.userId, 'active')}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#388e3c] hover:bg-[#2e7d32] cursor-pointer shadow-2xs"
                    >
                      Approve &amp; Unlock Digital ID Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admin Digital ID Card Viewer Modal */}
          {viewingIdCardUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
              <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 max-w-xl w-full shadow-xl relative space-y-4 max-h-[95vh] overflow-y-auto text-[#212121]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#2874f0]" />
                      <span>वेरिफाइड डिजिटल आईडी कार्ड (Member Digital ID)</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Member: <strong className="text-[#212121]">{viewingIdCardUser.fullName}</strong> • Roll No: <span className="font-mono text-[#2874f0] font-semibold">{viewingIdCardUser.userId}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingIdCardUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] transition cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="py-1 flex justify-center w-full">
                  <DigitalIdCard user={viewingIdCardUser} settings={settings} />
                </div>
              </div>
            </div>
          )}

          {/* Share 3.3% SWI Special Recharge App Link Modal */}
          {swiModalUser && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#212121] flex items-center gap-2">
                      <span>📲 3.3% Special Recharge App Link शेयर करें</span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Member: <strong className="text-[#212121]">{swiModalUser.fullName}</strong> ({swiModalUser.userId}) • {swiModalUser.chosenServiceCode} ₹{swiModalUser.joiningFee}
                    </p>
                  </div>
                  <button
                    onClick={() => setSwiModalUser(null)}
                    className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleShareSwiAppSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#212121] block mb-1">
                      3.3% Commission App Download / APK / Web Link <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://play.google.com/... या https://your-recharge-app.link"
                      value={swiAppUrlInput}
                      onChange={e => setSwiAppUrlInput(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#212121] block mb-1">
                      डैशबोर्ड संदेश / निर्देश (User Note)
                    </label>
                    <textarea
                      rows={3}
                      value={swiAppNoteInput}
                      onChange={e => setSwiAppNoteInput(e.target.value)}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSwiModalUser(null)}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={swiSharing}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {swiSharing ? 'Sending...' : '📲 Send App Link to Dashboard'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 2: SERVICES ===================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center justify-between shadow-2xs">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#212121]">ESP Services Catalog</h3>
              <p className="text-xs text-slate-600">Add, edit, or remove services from the platform.</p>
            </div>
            <button
              onClick={() => setShowAddService(true)}
              className="px-3.5 py-2 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition flex items-center space-x-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map(srv => (
              <div
                key={srv.id}
                className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#2874f0] text-xs bg-blue-50 px-2 py-0.5 rounded-sm border border-blue-200">
                      {srv.code}
                    </span>
                    <button
                      onClick={() => handleDeleteService(srv.id, srv.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition cursor-pointer"
                      title="Remove Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-[#212121] text-base mt-1.5">{srv.name}</h4>
                  <p className="text-xs text-[#fb641b] font-semibold">{srv.hindiName}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{srv.description}</p>
                </div>

                <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Tiers:</span>
                    <span className="font-bold text-[#212121]">₹{srv.joiningFeeTiers.join(', ₹')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Commission:</span>
                    <span className="text-[#388e3c] font-bold">{srv.referralBonusPercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddService && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full space-y-4 shadow-xl text-[#212121]">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-base font-bold text-[#212121]">Add New ESP Service</h3>
                  <button onClick={() => setShowAddService(false)} className="p-1.5 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleAddServiceSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Code</label>
                      <input
                        type="text"
                        value={newServiceForm.code}
                        onChange={e => setNewServiceForm({ ...newServiceForm, code: e.target.value.toUpperCase() })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] font-mono outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Service Name</label>
                      <input
                        type="text"
                        value={newServiceForm.name}
                        onChange={e => setNewServiceForm({ ...newServiceForm, name: e.target.value })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#212121] block mb-1">Hindi Title</label>
                    <input
                      type="text"
                      value={newServiceForm.hindiName}
                      onChange={e => setNewServiceForm({ ...newServiceForm, hindiName: e.target.value })}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#212121] block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newServiceForm.description}
                      onChange={e => setNewServiceForm({ ...newServiceForm, description: e.target.value })}
                      className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Default Fee (₹)</label>
                      <input
                        type="number"
                        value={newServiceForm.defaultFee}
                        onChange={e => setNewServiceForm({ ...newServiceForm, defaultFee: Number(e.target.value) })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#212121] block mb-1">Referral %</label>
                      <input
                        type="number"
                        value={newServiceForm.referralBonusPercent}
                        onChange={e => setNewServiceForm({ ...newServiceForm, referralBonusPercent: Number(e.target.value) })}
                        className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowAddService(false)}
                      className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1e60d5] cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 3: PAYOUTS ===================== */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-sm sm:text-base font-bold text-[#212121]">Member UPI Withdrawal Requests</h3>

          {payouts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">कोई निकासी अनुरोध नहीं है।</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Payout UPI ID</th>
                    <th className="py-2.5 px-3">Request Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {payouts.map(po => (
                    <tr key={po.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-2.5 px-3 font-bold text-[#212121]">{po.userName}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#2874f0]">{po.userId}</td>
                      <td className="py-2.5 px-3 font-bold text-[#388e3c]">₹{po.amount}</td>
                      <td className="py-2.5 px-3 font-mono text-[#212121] select-all">{po.payoutAddress}</td>
                      <td className="py-2.5 px-3 text-slate-600">{po.requestDate}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                            po.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : po.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                        {po.transactionRef && (
                          <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                            UTR: {po.transactionRef}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {po.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprovePayout(po.id)}
                              className="px-2.5 py-1 rounded-sm text-xs font-bold bg-[#388e3c] text-white hover:bg-[#2e7d32] cursor-pointer"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => handleRejectPayout(po.id, po.amount, po.userName)}
                              className="px-2.5 py-1 rounded-sm text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              Reject &amp; Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {po.status === 'approved' ? 'Settled ✓' : 'Refunded to Wallet'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: COIN RECHARGE ORDERS ===================== */}
      {activeTab === 'coin_recharges' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-[#212121] flex items-center space-x-2">
                <span className="text-xl">🪙</span>
                <span>रियल UPI कॉइन रिचार्ज सत्यापन (Live Coin Orders)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                यूजर द्वारा UPI ID (<span className="text-[#2874f0] font-mono font-bold">8877490845@SPICEPAY</span>) पर किए गए पेमेंट के 12-अंक UTR की जांच करें और स्वीकृत करें।
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
            >
              🔄 रीफ्रेश लिस्ट
            </button>
          </div>

          {coinRecharges.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Coins className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">कोई कॉइन रिचार्ज अनुरोध नहीं मिला।</p>
              <p className="text-xs text-slate-500">जब भी कोई यूजर UPI से कॉइन पैक खरीदेगा और UTR डालेगा, उसका अनुरोध यहाँ आएगा।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">समय / दिनांक</th>
                    <th className="py-2.5 px-3">मेंबर नाम व रोल नं.</th>
                    <th className="py-2.5 px-3">पैक</th>
                    <th className="py-2.5 px-3">रुपये (₹)</th>
                    <th className="py-2.5 px-3">कुल कॉइन्स</th>
                    <th className="py-2.5 px-3">12-अंक UPI UTR</th>
                    <th className="py-2.5 px-3">पेमेंट स्क्रीनशॉट</th>
                    <th className="py-2.5 px-3">स्थिति</th>
                    <th className="py-2.5 px-3 text-right">एडमिन एक्शन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {coinRecharges.map(rc => (
                    <tr key={rc.id} className={rc.status === 'pending' ? 'bg-amber-50/40 hover:bg-amber-50/80' : 'hover:bg-[#f5f8ff]'}>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <div className="font-mono text-[11px]">{rc.createdAt ? new Date(rc.createdAt).toLocaleDateString('hi-IN') : '-'}</div>
                        <div className="text-[10px] text-slate-500">{rc.createdAt ? new Date(rc.createdAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#212121]">{rc.userName}</div>
                        <div className="font-mono text-[11px] text-[#2874f0] font-semibold">ID: {rc.userId}</div>
                        {rc.userPhone && <div className="text-[10px] text-slate-500">📞 {rc.userPhone}</div>}
                      </td>
                      <td className="py-3 px-3 font-semibold text-amber-800">
                        {rc.packId || 'Coin Pack'}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#388e3c] text-sm">
                        ₹{rc.amount}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-amber-700 text-sm flex items-center space-x-1">
                          <span>🪙 {rc.coins.toLocaleString()}</span>
                        </div>
                        {rc.bonusCoins > 0 && (
                          <div className="text-[10px] font-bold text-[#388e3c]">+{rc.bonusCoins} Bonus</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#212121] select-all">
                        <span className="px-2 py-1 rounded-sm bg-[#f9fafb] border border-slate-300 block text-center text-xs tracking-wider">
                          {rc.paymentUtr}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {rc.paymentScreenshot ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewScreenshot({
                                url: rc.paymentScreenshot!,
                                recharge: rc,
                                title: `${rc.userName} (${rc.userId}) • ₹${rc.amount} • UTR: ${rc.paymentUtr}`,
                              })
                            }
                            className="group flex items-center gap-2 p-1 rounded-sm border border-slate-300 bg-white hover:border-[#2874f0] transition cursor-pointer"
                          >
                            <img
                              src={rc.paymentScreenshot}
                              alt="Payment Proof"
                              className="w-11 h-11 object-cover rounded-xs bg-slate-100"
                            />
                            <span className="text-[10px] font-bold text-[#2874f0] pr-1 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              देखें
                            </span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">स्क्रीनशॉट नहीं</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-sm inline-block uppercase ${
                            rc.status === 'approved'
                              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                              : rc.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                          }`}
                        >
                          {rc.status === 'approved' ? '✓ स्वीकृत' : rc.status === 'rejected' ? '✗ अस्वीकृत' : '⏳ पेंडिंग'}
                        </span>
                        {rc.rejectionReason && (
                          <div className="text-[10px] text-rose-600 mt-1 max-w-[150px] truncate" title={rc.rejectionReason}>
                            कारण: {rc.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {rc.status === 'pending' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              disabled={rechargeProcessingId === rc.id}
                              onClick={() => handleApproveRecharge(rc.id)}
                              className="px-3 py-1.5 rounded-sm text-xs font-bold bg-[#388e3c] hover:bg-[#2e7d32] disabled:opacity-50 text-white shadow-2xs transition cursor-pointer flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>स्वीकृत करें (+कॉइन जोड़ें)</span>
                            </button>
                            <button
                              disabled={rechargeProcessingId === rc.id}
                              onClick={() => handleRejectRecharge(rc.id)}
                              className="px-2.5 py-1.5 rounded-sm text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer flex items-center space-x-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>रद्द</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {rc.status === 'approved' ? 'सफलतापूर्वक क्रेडिटेड' : 'खारिज'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: GIVE / ADJUST COINS BY USER ID ===================== */}
      {activeTab === 'give_coins' && (() => {
        const cleanQuery = coinGrantIdentifier.trim().toLowerCase().replace(/^@/, '');
        const matchedUser = cleanQuery
          ? users.find(
              u =>
                u.userId.toLowerCase() === cleanQuery ||
                (u.username || '').toLowerCase() === cleanQuery
            ) ||
            users.find(
              u =>
                u.userId.toLowerCase().includes(cleanQuery) ||
                u.fullName.toLowerCase().includes(cleanQuery) ||
                (u.username || '').toLowerCase().includes(cleanQuery)
            )
          : null;

        return (
          <div className="bg-white rounded-md p-5 border border-slate-200 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  <span>Direct Coins Credit / Debit by User ID (एडमिन कॉइन आवंटन)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  किसी भी यूजर का User ID (जैसे ESPGTRK01, EMO-MOM-MMO) या @username चुनकर तुरंत कॉइन्स जोड़ें या घटाएं।
                </p>
              </div>
              <button
                type="button"
                onClick={loadAdminData}
                className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
              >
                🔄 रीफ्रेश मेंबर्स
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 7 Cols: Adjustment Form */}
              <form onSubmit={handleAdminAdjustCoins} className="lg:col-span-7 bg-[#f9fafb] border border-slate-200 rounded-md p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    1. जल्दी से मेंबर चुनें (Quick Select User)
                  </label>
                  <select
                    value={matchedUser?.userId || ''}
                    onChange={e => {
                      if (e.target.value) {
                        setCoinGrantIdentifier(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-xs font-semibold text-[#212121] outline-none focus:border-[#2874f0]"
                  >
                    <option value="">-- मेंबर चुनें या नीचे User ID टाइप करें --</option>
                    {users.map(u => (
                      <option key={u.userId} value={u.userId}>
                        {u.fullName} ({u.userId}{u.username ? ` · @${u.username}` : ''}) — 🪙 {(u.coins || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    2. User ID या @Username दर्ज करें *
                  </label>
                  <input
                    type="text"
                    value={coinGrantIdentifier}
                    onChange={e => setCoinGrantIdentifier(e.target.value)}
                    placeholder="उदा: ESPGTRK01 या @rahul"
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-xs font-mono font-bold text-[#212121] outline-none focus:border-[#2874f0]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCoinGrantMode('credit')}
                    className={`py-2.5 rounded-sm text-xs font-black border transition cursor-pointer ${
                      coinGrantMode === 'credit'
                        ? 'bg-[#388e3c] border-[#388e3c] text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    ➕ Credit Coins (जोड़ें)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoinGrantMode('debit')}
                    className={`py-2.5 rounded-sm text-xs font-black border transition cursor-pointer ${
                      coinGrantMode === 'debit'
                        ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-rose-50'
                    }`}
                  >
                    ➖ Debit Coins (घटाएं)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    3. Coins संख्या (Amount) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000000}
                    value={coinGrantAmount}
                    onChange={e => setCoinGrantAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-sm font-mono font-black text-[#212121] outline-none focus:border-[#2874f0]"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[50, 100, 250, 500, 1000, 2500, 5000].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCoinGrantAmount(String(preset))}
                        className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border cursor-pointer transition ${
                          Number(coinGrantAmount) === preset
                            ? 'bg-[#2874f0] border-[#2874f0] text-white'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        🪙 {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    4. कारण / नोट (User Notification में दिखेगा)
                  </label>
                  <input
                    type="text"
                    value={coinGrantReason}
                    onChange={e => setCoinGrantReason(e.target.value)}
                    placeholder="उदा: Tournament Winner Bonus / VIP Gift"
                    className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-xs text-[#212121] outline-none focus:border-[#2874f0]"
                  />
                </div>

                {coinGrantResult && (
                  <div
                    className={`p-3 rounded-sm border text-xs font-bold ${
                      coinGrantResult.ok
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {coinGrantResult.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={coinGrantBusy}
                  className={`w-full py-2.5 rounded-sm text-xs font-black text-white shadow-sm transition cursor-pointer disabled:opacity-50 ${
                    coinGrantMode === 'credit'
                      ? 'bg-[#388e3c] hover:bg-[#2e7d32]'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {coinGrantBusy
                    ? 'अपडेट हो रहा है...'
                    : coinGrantMode === 'credit'
                    ? `🪙 +${Number(coinGrantAmount || 0).toLocaleString()} Coins तुरंत क्रेडिट करें`
                    : `🪙 -${Number(coinGrantAmount || 0).toLocaleString()} Coins तुरंत डेबिट करें`}
                </button>
              </form>

              {/* Right 5 Cols: Live Matched Player Preview & Quick Directory */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-4">
                  <div className="text-xs font-bold text-[#212121] mb-2">
                    चयनित यूजर प्रीव्यू (Live Balance)
                  </div>
                  {matchedUser ? (
                    <div className="bg-white border border-slate-200 rounded-md p-3.5 space-y-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={matchedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${matchedUser.userId}`}
                          alt={matchedUser.fullName}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-black text-[#212121] truncate">{matchedUser.fullName}</div>
                          <div className="text-[11px] font-mono text-[#2874f0] truncate">
                            {matchedUser.userId} {matchedUser.username ? `• @${matchedUser.username}` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-100">
                        <div className="p-2 rounded bg-amber-50 border border-amber-200">
                          <div className="text-[10px] text-amber-800 font-bold">वर्तमान Coins</div>
                          <div className="text-sm font-black text-amber-900 tabular-nums">
                            🪙 {(matchedUser.coins || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-2 rounded bg-blue-50 border border-blue-200">
                          <div className="text-[10px] text-blue-800 font-bold">अपडेट के बाद</div>
                          <div className="text-sm font-black text-blue-900 tabular-nums">
                            🪙{' '}
                            {coinGrantMode === 'credit'
                              ? ((matchedUser.coins || 0) + Math.max(0, Math.floor(Number(coinGrantAmount) || 0))).toLocaleString()
                              : Math.max(0, (matchedUser.coins || 0) - Math.max(0, Math.floor(Number(coinGrantAmount) || 0))).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 bg-white border border-dashed border-slate-300 rounded-md p-4 text-center">
                      सदस्य का लाइव कॉइन बैलेंस देखने के लिए बाईं ओर से मेंबर चुनें या User ID लिखें।
                    </div>
                  )}
                </div>

                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <div className="text-[11px] font-bold text-slate-600 mb-2">
                    रजिस्टर्ड यूजर्स (क्लिक करके चुनें)
                  </div>
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-200 bg-white rounded border border-slate-200">
                    {users.slice(0, 20).map(u => (
                      <button
                        key={u.userId}
                        type="button"
                        onClick={() => setCoinGrantIdentifier(u.userId)}
                        className="w-full px-3 py-2 text-left hover:bg-[#f5f8ff] flex items-center justify-between gap-2 text-xs cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="font-bold text-[#212121] truncate">{u.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">{u.userId}</div>
                        </div>
                        <span className="font-black text-amber-700 font-mono shrink-0 tabular-nums">
                          🪙 {(u.coins || 0).toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================== TAB: ADMIN MESSAGES & ALERTS ===================== */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#2874f0]" />
                <span>Admin Inbox: कॉइन अलर्ट्स व यूजर संदेश (Messages &amp; Alerts)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                जब भी कोई यूजर कॉइन रिचार्ज अनुरोध या संपर्क संदेश भेजेगा, वह यहाँ तुरंत दिखाई देगा।
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
            >
              🔄 रीफ्रेश संदेश
            </button>
          </div>

          {adminNotifications.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#2874f0] uppercase tracking-wider">
                🔔 लाइव पेमेंट व कॉइन अलर्ट्स ({adminNotifications.length})
              </h4>
              <div className="space-y-2">
                {adminNotifications.map(n => (
                  <div
                    key={n.id}
                    className="p-3 rounded-sm bg-[#f5f8ff] border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#212121]">{n.title}</div>
                      <div className="text-xs text-slate-700 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(n.date).toLocaleString('hi-IN')}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('coin_recharges')}
                      className="px-3 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      कॉइन ऑर्डर खोलें ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              📩 सभी इनबॉक्स व संपर्क संदेश ({contactMessages.length})
            </h4>
            {contactMessages.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 border border-slate-200 rounded-md bg-[#f9fafb]">
                कोई संदेश अभी तक प्राप्त नहीं हुआ है।
              </div>
            ) : (
              <div className="space-y-2.5">
                {contactMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-md border ${
                      msg.status === 'unread' ? 'bg-amber-50/50 border-amber-300' : 'bg-[#f9fafb] border-slate-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-[#212121]">{msg.subject}</div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase ${
                          msg.status === 'unread'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{msg.message}</p>
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                      <span>
                        <strong>{msg.name}</strong> {msg.phone ? `• 📞 ${msg.phone}` : ''} • {msg.email}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {new Date(msg.createdAt).toLocaleString('hi-IN')}
                        </span>
                        {msg.id.startsWith('CNT-CR-') && (
                          <button
                            onClick={() => setActiveTab('coin_recharges')}
                            className="px-2.5 py-1 rounded-sm bg-[#fb641b] text-white text-[10px] font-bold cursor-pointer"
                          >
                            स्क्रीनशॉट व UTR देखें
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 4: SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-5 shadow-2xs">
          <div>
            <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2874f0]" />
              <span>Platform UPI Gateway, QR &amp; Contact Settings</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              यही UPI ID और QR कोड नए मेंबर्स को रजिस्ट्रेशन और पेमेंट के लिए दिखाई देगा।
            </p>
          </div>

          {settingsMsg && (
            <div className="p-3 rounded-sm text-xs bg-emerald-50 border border-emerald-200 text-[#388e3c] font-semibold">
              {settingsMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  Official Admin UPI ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.adminUpiId}
                  onChange={e => setSettingsForm({ ...settingsForm, adminUpiId: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#388e3c] font-mono font-bold outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#212121] block mb-1">
                  Admin Payee Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={settingsForm.adminPayeeName}
                  onChange={e => setSettingsForm({ ...settingsForm, adminPayeeName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Owner / Founder Name
                </label>
                <input
                  type="text"
                  value={settingsForm.ownerName}
                  onChange={e => setSettingsForm({ ...settingsForm, ownerName: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Owner Default Sponsor ID
                </label>
                <input
                  type="text"
                  value={settingsForm.ownerSponsorId}
                  onChange={e => setSettingsForm({ ...settingsForm, ownerSponsorId: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Support WhatsApp Number (10 अंक)
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={e => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#212121] block mb-1">
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={settingsForm.supportEmail}
                  onChange={e => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                  className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#212121] block mb-1">
                Official Contact Address
              </label>
              <input
                type="text"
                value={settingsForm.contactAddress}
                onChange={e => setSettingsForm({ ...settingsForm, contactAddress: e.target.value })}
                className="w-full bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
              />
            </div>

            {/* Global Default 3.3% SWI Special Recharge App Link Settings */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#2874f0]">
                  📲 SWI (₹300) 3.3% Commission Special App — Default Link Setup
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  जब भी कोई SWI ₹300 यूजर वेरिफाई (Approve) होगा, तो यह डिफ़ॉल्ट ऐप लिंक स्वतः उसके डैशबोर्ड पर जुड़ जाएगा (आप प्रति-यूजर भी अलग लिंक भेज सकते हैं)।
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Special App Name
                  </label>
                  <input
                    type="text"
                    placeholder="ESP 3.3% Special Recharge App"
                    value={settingsForm.swiSpecialAppName || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, swiSpecialAppName: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#212121] block mb-1">
                    Default 3.3% App Link URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://play.google.com/... या APK लिंक"
                    value={settingsForm.swiSpecialAppLink || ''}
                    onChange={e => setSettingsForm({ ...settingsForm, swiSpecialAppLink: e.target.value })}
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#2874f0] font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Admin QR Code Upload */}
            <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-2.5">
              <label className="text-xs font-bold text-[#212121] block">
                Custom Admin UPI QR Code Image (वैकल्पिक)
              </label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 bg-white border border-dashed border-slate-400 hover:border-[#2874f0] rounded-sm px-3.5 py-2 text-xs text-[#212121] font-semibold cursor-pointer">
                  <Upload className="w-4 h-4 text-[#2874f0]" />
                  <span>Upload QR Image</span>
                  <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                </label>
                {settingsForm.adminQrCodeUrl && (
                  <span className="text-[11px] font-bold text-[#388e3c]">Custom QR Attached ✓</span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className="px-5 py-2.5 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-2xs cursor-pointer"
            >
              {settingsSaving ? 'Saving Settings...' : 'Save & Publish Gateway Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ===================== TAB 4B: LIVE 12 AM IST CLOCK & WEEKLY REWARDS MONITOR ===================== */}
      {activeTab === 'weekly_clock' && (
        <div className="space-y-4">
          {/* Live IST API Clock Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-md p-5 sm:p-6 text-white border border-slate-700 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SERVER API TIME
                  </span>
                  <span className="text-[11px] text-slate-300 font-semibold">
                    {adminTimeStats?.timeMeta?.syncSource || 'Server IST UTC+05:30'}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300 tabular-nums">
                    {adminLiveIstClock}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    IST Date: <strong className="text-white">{adminTimeStats?.today || 'Today'}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 tabular-nums">
                  🌙 Exact 12:00:00 AM IST Midnight Reset Countdown:{' '}
                  <strong className="text-orange-300 font-mono">{adminResetCountdown}</strong>
                  {typeof adminTimeStats?.timeMeta?.clockSkewMs === 'number' && (
                    <span className="ml-2 text-[11px] text-slate-400">
                      (Network Offset: {adminTimeStats.timeMeta.clockSkewMs}ms)
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                disabled={resyncingTime}
                onClick={handleResyncAdminTime}
                className="px-4 py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black flex items-center gap-2 cursor-pointer shrink-0 shadow transition disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${resyncingTime ? 'animate-spin' : ''}`} />
                <span>{resyncingTime ? 'Syncing Live Clock...' : 'Sync Live API Time Now'}</span>
              </button>
            </div>
          </div>

          {/* Weekly Rewards Schedule & Reset Controls Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 7-Day Weekly Rewards Table */}
            <div className="bg-white rounded-md p-5 border border-slate-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#212121]">
                  🎁 Active Weekly Rewards Schedule (Day 1–7)
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                  {adminTimeStats?.claimedTodayCount ?? 0} Claimed Today
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(adminTimeStats?.schedule || []).map((slot) => (
                  <div
                    key={slot.day}
                    className={`p-2.5 rounded-md border text-center ${
                      slot.day === 7
                        ? 'col-span-2 bg-orange-50 border-orange-200'
                        : 'bg-[#f8f9fb] border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-slate-500">Day {slot.day}</div>
                    <div className="text-sm font-black text-[#fb641b] mt-0.5">
                      {slot.day === 7 ? `🎁 Mystery (${slot.coins}c)` : `🪙 ${slot.coins}`}
                    </div>
                    <div className="text-[10px] font-semibold text-blue-600">+{slot.xp} EXP</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                नियम: एक बार Claim करने के बाद उसी IST तारीख में Pop-up दोबारा नहीं खुलेगा — केवल रात 12:00 AM IST पर नया दिन अनलॉक होगा।
              </p>
            </div>

            {/* Reset User Weekly Claim Lock (Admin Testing & Support) */}
            <div className="bg-white rounded-md p-5 border border-slate-200 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-[#212121]">
                🔓 Reset Member Weekly Claim Lock (Support / Test 12 AM Pop-up)
              </h3>
              <p className="text-xs text-slate-600">
                अगर किसी खिलाड़ी का आज का Claim लॉक रीसेट करना हो या नया Weekly Reward Pop-up टेस्ट करना हो, तो यहाँ से तुरंत अनलॉक करें।
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={resetClaimUserInput}
                  onChange={e => setResetClaimUserInput(e.target.value)}
                  placeholder="User ID या @username लिखें (e.g. ESP-101)"
                  className="flex-1 bg-[#f9fafb] border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs font-mono outline-none"
                />
                <button
                  type="button"
                  disabled={resettingClaimBusy}
                  onClick={() => handleResetUserWeeklyClaim()}
                  className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0 disabled:opacity-60"
                >
                  {resettingClaimBusy ? 'Resetting...' : 'Unlock Pop-up'}
                </button>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={resetPreserveStreak}
                  onChange={e => setResetPreserveStreak(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>Keep current Day Streak progression (Uncheck = Reset back to Day 1)</span>
              </label>

              {/* Today's Claimants List */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  आज Claim कर चुके खिलाड़ी ({adminTimeStats?.claimedTodayUsers?.length || 0})
                </div>
                {!adminTimeStats?.claimedTodayUsers?.length ? (
                  <p className="text-xs text-slate-400">आज अभी तक किसी ने Weekly Reward Claim नहीं किया है।</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {adminTimeStats.claimedTodayUsers.map((c) => (
                      <div
                        key={c.userId}
                        className="flex items-center justify-between px-3 py-1.5 rounded-sm bg-[#f9fafb] border border-slate-200 text-xs"
                      >
                        <div className="min-w-0 truncate">
                          <span className="font-bold text-[#212121]">{c.fullName}</span>{' '}
                          <span className="font-mono text-[11px] text-slate-500">({c.userId})</span>
                          <span className="ml-2 text-[10px] font-bold text-orange-600">
                            Day {((Math.max(1, c.loginStreak) - 1) % 7) + 1}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResetUserWeeklyClaim(c.userId)}
                          className="px-2 py-1 rounded-sm bg-white hover:bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold cursor-pointer shrink-0 ml-2"
                        >
                          Reset Lock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: USER PROFILE AUDITS & MODIFICATION LOGS ===================== */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#212121] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2874f0]" />
                  <span>User Profile Audits &amp; Modification Tracking (एडिट लॉग्स)</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  एडमिन के लिए संपूर्ण डैशबोर्ड: जब भी कोई यूजर अपना नाम, फोन, ईमेल, पता, UPI ID या पासवर्ड बदलता है, उसकी हर गतिविधि यहाँ समय के साथ सुरक्षित रहती है।
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className="bg-blue-50 text-[#2874f0] border border-blue-200 px-3 py-1 rounded-sm text-xs font-mono font-bold">
                  {users.reduce((acc, u) => acc + (u.editHistory?.length || 0), 0)} Total Edits Tracked
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Users Registered</span>
                <p className="text-xl font-bold text-[#212121]">{users.length}</p>
                <p className="text-[11px] text-[#388e3c] font-semibold">All member profiles secured</p>
              </div>

              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Users with Modified Profiles</span>
                <p className="text-xl font-bold text-[#2874f0]">
                  {users.filter(u => u.editHistory && u.editHistory.length > 0).length}
                </p>
                <p className="text-[11px] text-slate-500">Changed details post-registration</p>
              </div>

              <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Immutable Protected Fields</span>
                <p className="text-xl font-bold text-[#fb641b]">Roll No &amp; Sponsor ID</p>
                <p className="text-[11px] text-[#388e3c] font-semibold">100% Permanently Locked</p>
              </div>
            </div>
          </div>

          {/* Members Modification Table */}
          <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
            <h4 className="text-sm font-bold text-[#212121] flex items-center justify-between">
              <span>Members Who Updated Their Profile Details</span>
              <span className="text-xs text-slate-500">पारदर्शी ऑडिट रिकॉर्ड</span>
            </h4>

            {users.filter(u => u.editHistory && u.editHistory.length > 0).length === 0 ? (
              <div className="text-center py-10 bg-[#f9fafb] rounded-md border border-slate-200 space-y-2">
                <p className="text-xs text-slate-600">
                  अभी तक किसी भी यूजर ने अपना प्रोफाइल एडिट नहीं किया है।
                </p>
                <p className="text-[11px] text-slate-500">
                  जैसे ही कोई सदस्य नाम, फोन, पता या UPI बदलेगा, उसका पूरा इतिहास यहाँ तुरंत दिखेगा।
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users
                  .filter(u => u.editHistory && u.editHistory.length > 0)
                  .map(member => (
                    <div 
                      key={member.userId}
                      className="bg-[#f9fafb] p-4 sm:p-5 rounded-md border border-slate-200 hover:border-[#2874f0] transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2874f0] flex items-center justify-center font-bold text-base border border-blue-200 overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.fullName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              member.fullName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-[#212121] text-sm">{member.fullName}</h5>
                              <span className="font-mono text-xs bg-white text-[#2874f0] border border-slate-200 px-2 py-0.5 rounded-sm font-bold">
                                {member.userId}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600">
                              Phone: {member.phone} | Payout UPI: <span className="text-[#388e3c] font-mono font-semibold">{member.payoutUpiId || member.paymentAddress}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-50 text-[#2874f0] border border-blue-200 px-2.5 py-1 rounded-sm font-bold">
                            {member.editHistory?.length} Edit(s)
                          </span>
                          <button
                            onClick={() => handleOpenUserAudit(member.userId)}
                            className="px-3 py-1 rounded-sm text-xs font-bold text-white bg-[#2874f0] hover:bg-[#1e60d5] transition cursor-pointer"
                          >
                            View Full Audit
                          </button>
                        </div>
                      </div>

                      {/* Modification Events List for this member */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                              <th className="py-1.5 px-3">Date &amp; Time</th>
                              <th className="py-1.5 px-3">Field Modified</th>
                              <th className="py-1.5 px-3">Previous Value (Old)</th>
                              <th className="py-1.5 px-3">Updated Value (New)</th>
                              <th className="py-1.5 px-3">Audit State</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {member.editHistory?.map((edit, idx) => (
                              <tr key={idx} className="hover:bg-white">
                                <td className="py-2 px-3 text-slate-600 text-[11px]">
                                  {new Date(edit.date).toLocaleString('hi-IN')}
                                </td>
                                <td className="py-2 px-3 font-bold text-[#2874f0] uppercase text-[10px]">
                                  {edit.field}
                                </td>
                                <td className="py-2 px-3 text-rose-700 font-mono text-[11px]">
                                  {edit.oldValue || '—'}
                                </td>
                                <td className="py-2 px-3 text-[#388e3c] font-mono text-[11px] font-bold">
                                  {edit.newValue || '—'}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-[10px] bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-sm font-bold">
                                    Audited ✓
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 7: 7-PHOTO HOME POPUP SLIDER ===================== */}
      {activeTab === 'slider_photos' && (
        <div className="space-y-4">
          {/* Explanation Header */}
          <div className="p-4 sm:p-5 rounded-md bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#2874f0] bg-blue-50 px-2.5 py-0.5 rounded-sm border border-blue-200">
                Home Page Popup Manager • अधिकतम 7 फोटो
              </span>
              <h3 className="text-base sm:text-xl font-bold text-[#212121]">
                होम पेज 7-फोटो पॉपअप स्लाइडर सिस्टम
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                यहाँ आप अधिकतम 7 तस्वीरें अपलोड कर सकते हैं। यूजर जब भी होम पेज पर आएगा, उसके सामने उसी साइज का शानदार ज़ूम-इन/आउट पॉपअप आएगा। यदि कोई फोटो एक्टिव नहीं होगी तो कोई पॉपअप नहीं आएगा।
              </p>
            </div>

            <div className="text-right shrink-0 bg-[#f9fafb] px-4 py-2 rounded-md border border-slate-200">
              <span className="text-2xl font-bold text-[#2874f0] font-mono">
                {sliderPhotos.length} / 7
              </span>
              <p className="text-[10px] text-slate-500 font-semibold">कुल सक्रिय स्लाइड्स</p>
            </div>
          </div>

          {/* Add New Photo Card */}
          {sliderPhotos.length < 7 && (
            <div className="p-4 sm:p-5 rounded-md bg-white border border-slate-200 space-y-4 shadow-2xs">
              <h4 className="font-bold text-xs sm:text-sm text-[#2874f0] flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>नई स्लाइड फोटो जोड़ें (Add Slide #{sliderPhotos.length + 1})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    इमेज लिंक / URL (या नीचे से फाइल चुनें) *
                  </label>
                  <input
                    type="url"
                    value={newSlideUrl}
                    onChange={e => setNewSlideUrl(e.target.value)}
                    placeholder="https://... (JPG, PNG, WebP)"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                  
                  {/* File Upload Alternative */}
                  <div className="mt-2 flex items-center space-x-2">
                    <label className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] text-xs font-bold border border-slate-300 cursor-pointer flex items-center space-x-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>गैलरी / कैमरा से फोटो अपलोड करें</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              showToast('फोटो का साइज 5MB से कम होना चाहिए', 'error');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) setNewSlideUrl(ev.target.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    शीर्षक / टाइटल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={newSlideTitle}
                    onChange={e => setNewSlideTitle(e.target.value)}
                    placeholder="e.g. 🎉 स्पेशल ऑफर या नया लूडो टूर्नामेंट"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    विवरण / सब-टाइटल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    value={newSlideSubtitle}
                    onChange={e => setNewSlideSubtitle(e.target.value)}
                    placeholder="e.g. आज ही खेलें और जीतें 10,000 कॉइन्स"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    क्लिक करने पर खुलने वाला लिंक (वैकल्पिक)
                  </label>
                  <input
                    type="url"
                    value={newSlideLink}
                    onChange={e => setNewSlideLink(e.target.value)}
                    placeholder="https://... या खाली छोड़ें"
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-[#212121] text-xs focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              {/* Preview if URL set */}
              {newSlideUrl && (
                <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 flex items-center space-x-3">
                  <img
                    src={newSlideUrl}
                    alt="Preview"
                    className="w-20 h-16 object-contain rounded-sm bg-white border border-slate-200 shrink-0"
                  />
                  <div className="text-xs text-slate-600">
                    <p className="font-bold text-[#212121]">{newSlideTitle || 'शीर्षक नहीं'}</p>
                    <p className="text-[11px] text-slate-500">{newSlideSubtitle || 'सब-टाइटल नहीं'}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddSliderPhoto}
                  disabled={sliderSaving || !newSlideUrl.trim()}
                  className="px-6 py-2.5 rounded-sm font-bold text-xs bg-[#fb641b] hover:bg-[#e5530d] text-white shadow-2xs flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{sliderSaving ? 'जोड़ रहे हैं...' : 'स्लाइड फोटो सेव करें'}</span>
                </button>
              </div>
            </div>
          )}

          {/* List of Uploaded Slides */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs sm:text-sm text-[#212121]">
              वर्तमान अपलोड की गई स्लाइड्स ({sliderPhotos.length})
            </h4>

            {sliderPhotos.length === 0 ? (
              <div className="p-8 rounded-md bg-white border border-slate-200 text-center text-slate-500 space-y-2 shadow-2xs">
                <Image className="w-10 h-10 mx-auto text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">अभी कोई स्लाइड फोटो अपलोड नहीं की गई है।</p>
                <p className="text-[11px] text-slate-500">
                  (जब तक फोटो अपलोड नहीं होगी, होम पेज पर कोई पॉपअप नहीं दिखेगा)
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {sliderPhotos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="p-3.5 rounded-md bg-white border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="space-y-2">
                      <div className="relative w-full h-36 bg-[#f9fafb] rounded-sm overflow-hidden flex items-center justify-center border border-slate-200">
                        <img
                          src={photo.imageUrl}
                          alt={photo.title || 'Slide'}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute top-2 left-2 bg-[#2874f0] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-bold text-xs text-[#212121] truncate">
                          {photo.title || `स्लाइड #${idx + 1}`}
                        </h5>
                        {photo.subtitle && (
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {photo.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <button
                        onClick={() => handleToggleSliderPhoto(photo.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-sm transition cursor-pointer ${
                          photo.active 
                            ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200' 
                            : 'bg-[#f1f3f6] text-slate-600 border border-slate-200'
                        }`}
                      >
                        {photo.active ? 'एक्टिव ✓' : 'निष्क्रिय ✗'}
                      </button>

                      <button
                        onClick={() => handleRemoveSliderPhoto(photo.id)}
                        className="p-1.5 rounded-sm text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB 8: REAL GIFT CARD REDEMPTIONS ===================== */}
      {activeTab === 'gift_cards' && (
        <div className="bg-white rounded-md p-5 border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-[#212121] flex items-center space-x-2">
                <Gift className="w-5 h-5 text-[#2874f0]" />
                <span>डिजिटल गिफ्ट कार्ड रिडेम्पशन फुलफिलमेंट (Real Voucher Orders)</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                यूजर द्वारा कॉइन्स खर्च कर अनुरोध किए गए वाउचर्स के लिए रियल ऑफिशियल रिडीम कोड जारी करें।
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
            >
              🔄 रीफ्रेश लिस्ट
            </button>
          </div>

          {giftCardRedemptions.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Gift className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-600">अभी तक कोई गिफ्ट कार्ड रिडेम्पशन अनुरोध नहीं मिला है।</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Brand / Value</th>
                    <th className="py-2.5 px-3">Coins Spent</th>
                    <th className="py-2.5 px-3">Status / Voucher Code</th>
                    <th className="py-2.5 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {giftCardRedemptions.map(gc => (
                    <tr key={gc.id} className="hover:bg-[#f5f8ff]">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">{gc.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#212121]">{gc.userName}</div>
                        <div className="font-mono text-[11px] text-[#2874f0] font-semibold">{gc.userId}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#212121] block">{gc.brand}</span>
                        <span className="text-[11px] text-[#388e3c] font-bold">₹{gc.denomination} • {gc.title}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">
                        🪙 {gc.coinsSpent.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        {gc.status === 'fulfilled' ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-[#388e3c] border border-emerald-200 inline-block">
                              FULFILLED ✓
                            </span>
                            <p className="font-mono font-bold text-[#212121] text-[11px] select-all">
                              Code: {gc.voucherCode}
                            </p>
                          </div>
                        ) : gc.status === 'rejected' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">
                            REJECTED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                            PENDING VOUCHER
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {gc.status === 'pending_fulfillment' ? (
                          <button
                            disabled={giftCardProcessingId === gc.id}
                            onClick={() => handleFulfillGiftCard(gc)}
                            className="px-3 py-1.5 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white transition cursor-pointer disabled:opacity-50"
                          >
                            वाउचर कोड जारी करें
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-semibold">Delivered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 9: VIP ROOM IDs & COUNT SYSTEM ===================== */}
      {activeTab === 'vip_rooms' && (() => {
        const standardNumbers = users
          .map(u => Number(u.roomAddress))
          .filter(n => Number.isFinite(n) && n >= 10001 && n <= 999999);
        const nextAutoCountId = String(Math.max(10000, ...standardNumbers) + 1);
        const vipAssignedCount = users.filter(u => u.isVipRoom || isVipFancyRoomNumber(u.roomAddress)).length;
        const selectedUser = users.find(u => u.userId === vipSelectedUserId) || null;
        const takenRoomMap = new Map<string, UserProfile>();
        users.forEach(u => {
          if (u.roomAddress) {
            takenRoomMap.set(String(u.roomAddress).replace(/\D/g, ''), u);
          }
        });
        const filteredRoomUsers = users.filter(u => {
          const q = vipSearchQuery.trim().toLowerCase();
          if (!q) return true;
          return (
            u.fullName.toLowerCase().includes(q) ||
            u.userId.toLowerCase().includes(q) ||
            (u.username || '').toLowerCase().includes(q) ||
            (u.roomAddress || '').toLowerCase().includes(q) ||
            (u.vipRoomLabel || '').toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-4">
            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">कुल सक्रिय पर्सनल रूम्स</span>
                <div className="text-2xl font-black text-[#212121] mt-1 font-mono tabular-nums">
                  {users.length}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">प्रत्येक यूजर का यूनिक न्यूमेरिक रूम नंबर</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-md p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-amber-700 uppercase">VIP रूम IDs (1111, 2222, 1234...)</span>
                <div className="text-2xl font-black text-amber-600 mt-1 font-mono tabular-nums">
                  👑 {vipAssignedCount}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">फैंसी 3-4 अंक VIP नंबर सीधे सर्च में शीर्ष पर</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-md p-4 shadow-2xs">
                <span className="text-[11px] font-bold text-[#2874f0] uppercase">अगला ऑटो काउंट रूम ID</span>
                <div className="text-2xl font-black text-[#2874f0] mt-1 font-mono tabular-nums">
                  #{nextAutoCountId}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">नए यूजर को क्रमानुसार (10001, 10002...) आवंटित</p>
              </div>
            </div>

            {/* VIP Badge & Locked Personal Room Panel */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>VIP Badge &amp; Immutable Personal Room Registry</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    सुरक्षा नियम: प्रत्येक यूज़र का Personal Room ID एक बार बनने के बाद लाइफटाइम लॉक (Non-Editable &amp; Non-Duplicable) रहता है। यहाँ आप किसी भी सदस्य के फिक्स्ड रूम नंबर पर VIP Royal / King / Diamond बैज लेबल अपडेट कर सकते हैं। नया कस्टम VIP नंबर केवल नए खिलाड़ी बनाते समय सेट करें।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminData}
                  className="px-3 py-1.5 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-xs font-bold text-[#212121] border border-slate-300 transition self-start sm:self-auto cursor-pointer"
                >
                  🔄 रीफ्रेश लिस्ट
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left 5 cols: Select Member */}
                <div className="lg:col-span-5 space-y-3 bg-[#f9fafb] border border-slate-200 rounded-md p-4">
                  <div>
                    <label className="block text-xs font-bold text-[#212121] mb-1">
                      1. सदस्य चुनें (Select Member)
                    </label>
                    <select
                      value={vipSelectedUserId}
                      onChange={e => {
                        const uid = e.target.value;
                        setVipSelectedUserId(uid);
                        const u = users.find(x => x.userId === uid);
                        if (u) {
                          setVipRoomNumberInput(u.roomAddress || '');
                          setVipRoomLabelInput(u.vipRoomLabel || 'VIP Royal');
                        }
                      }}
                      className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-xs font-semibold text-[#212121] outline-none focus:border-[#2874f0]"
                    >
                      {users.map(u => (
                        <option key={u.userId} value={u.userId}>
                          {u.fullName} ({u.userId}) — Room #{u.roomAddress || 'N/A'} {u.isVipRoom ? '[VIP]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUser && (
                    <div className="bg-white border border-slate-200 rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={selectedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.userId}`}
                            alt={selectedUser.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-black text-[#212121] truncate">
                              {selectedUser.fullName}
                            </div>
                            <div className="text-[11px] font-mono text-[#2874f0] truncate">
                              {selectedUser.userId} {selectedUser.username ? `• @${selectedUser.username}` : ''}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black font-mono tabular-nums shrink-0 ${
                          selectedUser.isVipRoom || isVipFancyRoomNumber(selectedUser.roomAddress)
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          #{selectedUser.roomAddress || '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1.5 border-t border-slate-100">
                        <span>वर्तमान स्टेटस:</span>
                        <span className="font-bold text-[#212121]">
                          {selectedUser.isVipRoom
                            ? `👑 ${selectedUser.vipRoomLabel || 'VIP Room'}`
                            : 'Standard Sequential Room'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right 7 cols: Locked Room Number + VIP Badge */}
                <div className="lg:col-span-7 space-y-3 bg-[#f9fafb] border border-slate-200 rounded-md p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#212121] mb-1">
                        2. Personal Room Number 🔒 (पूरी तरह लॉक)
                      </label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          inputMode="numeric"
                          readOnly={Boolean(selectedUser?.roomAddress)}
                          disabled={Boolean(selectedUser?.roomAddress)}
                          value={selectedUser?.roomAddress || vipRoomNumberInput}
                          onChange={e => {
                            if (!selectedUser?.roomAddress) {
                              setVipRoomNumberInput(e.target.value.replace(/\D/g, '').slice(0, 10));
                            }
                          }}
                          placeholder="Auto Unique Room ID"
                          className={`w-full pl-9 pr-20 py-2 rounded-sm border text-sm font-mono tabular-nums font-black outline-none ${
                            selectedUser?.roomAddress
                              ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed'
                              : 'bg-white border-slate-300 text-[#212121] focus:border-[#2874f0]'
                          }`}
                        />
                        {selectedUser?.roomAddress && (
                          <span className="absolute right-2.5 top-2 text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-sm border border-amber-300">
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#212121] mb-1">
                        3. VIP बैज लेबल (Badge Title on Locked Room)
                      </label>
                      <select
                        value={vipRoomLabelInput}
                        onChange={e => setVipRoomLabelInput(e.target.value)}
                        className="w-full px-3 py-2 rounded-sm bg-white border border-slate-300 text-xs font-bold text-[#212121] outline-none focus:border-[#2874f0]"
                      >
                        <option value="VIP Royal">👑 VIP Royal</option>
                        <option value="VIP King">👑 VIP King</option>
                        <option value="VIP Queen">👑 VIP Queen</option>
                        <option value="VIP Diamond">💎 VIP Diamond</option>
                        <option value="VIP Supreme">⚡ VIP Supreme</option>
                        <option value="VIP Room">⭐ VIP Room</option>
                      </select>
                    </div>
                  </div>

                  {/* Permanent Lock Explanation Banner */}
                  <div className="px-3 py-2 rounded-sm border bg-blue-50 border-blue-200 text-blue-900 text-[11px] font-semibold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#2874f0] shrink-0" />
                    <span>
                      {selectedUser?.roomAddress
                        ? `Room ID #${selectedUser.roomAddress} स्थायी रूप से लॉक है (Non-Editable & Zero Duplicate)। आप इसके ऊपर केवल VIP बैज सक्रिय/अपडेट कर सकते हैं।`
                        : 'इस सदस्य को एक यूनिक रूम नंबर असाइन किया जाएगा।'}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={vipSaving || !vipSelectedUserId}
                      onClick={handleAssignVipRoom}
                      className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white text-xs font-black transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-300" />
                      <span>{vipSaving ? 'सेव हो रहा है...' : '👑 लॉक रूम पर VIP बैज अपडेट करें'}</span>
                    </button>

                    <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      Immutable Room ID Policy Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members & Room Numbers Table */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-[#212121]">
                  सभी सदस्यों के यूनिक न्यूमेरिक रूम IDs ({filteredRoomUsers.length})
                </h4>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={vipSearchQuery}
                    onChange={e => setVipSearchQuery(e.target.value)}
                    placeholder="Room ID (1111, 10001), @username या नाम..."
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm pl-9 pr-3 py-1.5 text-xs text-[#212121] outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600 uppercase text-[10px] bg-[#f9fafb]">
                      <th className="py-2.5 px-3">Member / @Username</th>
                      <th className="py-2.5 px-3">User ID</th>
                      <th className="py-2.5 px-3">Account / Plan</th>
                      <th className="py-2.5 px-3">Locked Room #</th>
                      <th className="py-2.5 px-3">Tier / Badge</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRoomUsers.map(u => {
                      const isVip = Boolean(u.isVipRoom || isVipFancyRoomNumber(u.roomAddress));
                      return (
                        <tr key={u.userId} className="hover:bg-[#f5f8ff]">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#212121]">{u.fullName}</div>
                            {u.username && (
                              <div className="text-[11px] font-mono text-slate-500">@{u.username}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#2874f0]">
                            {u.userId}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] font-semibold text-slate-700">
                              {u.chosenServiceName || u.chosenServiceCode || 'Member'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm font-mono tabular-nums font-black text-xs border ${
                              isVip
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-blue-50 text-[#2874f0] border-blue-200'
                            }`}>
                              <Lock className="w-3 h-3 opacity-70" />
                              #{u.roomAddress || '—'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            {isVip ? (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                👑 {u.vipRoomLabel || 'VIP ROOM'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold bg-slate-100 text-slate-600">
                                Standard Count
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setVipSelectedUserId(u.userId);
                                setVipRoomNumberInput(u.roomAddress || '');
                                setVipRoomLabelInput(u.vipRoomLabel || 'VIP Royal');
                              }}
                              className="px-2.5 py-1 rounded-sm bg-[#f1f3f6] hover:bg-blue-50 text-[#2874f0] border border-slate-300 text-[11px] font-bold cursor-pointer"
                            >
                              Update VIP Badge
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================== TAB 10: MULTI-DEVICE ADMIN & MEMBER CONTROL (MAX 4 DEVICES) ===================== */}
      {activeTab === 'multi_device' && (() => {
        const currentAdminTok = api.getStoredAdminToken();
        const audit = multiDeviceData?.identityAudit;
        const adminSessList = multiDeviceData?.adminSessions || [];
        const userSessList = (multiDeviceData?.userSessions || []).filter(entry => {
          const q = multiDeviceSearch.trim().toLowerCase();
          if (!q) return true;
          return (
            entry.fullName.toLowerCase().includes(q) ||
            entry.userId.toLowerCase().includes(q) ||
            (entry.username || '').toLowerCase().includes(q) ||
            (entry.personalRoomId || '').toLowerCase().includes(q) ||
            (entry.sponsorId || '').toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-5">
            {/* 1. Identity Uniqueness Audit & Zero-Deletion Shield */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#212121] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#388e3c]" />
                    <span>Identity Integrity &amp; Zero-Duplicate Verification Audit</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    प्रत्येक यूज़र का Personal User ID, Personal Room ID, Sponsor ID और @Username लाइफटाइम नॉन-एडिटेबल व 100% यूनिक रहता है। किसी भी यूज़र का डेटा कभी डिलीट या मिसिंग नहीं होता।
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadMultiDeviceSessions}
                  disabled={loadingMultiDevice}
                  className="px-3.5 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingMultiDevice ? 'animate-spin' : ''}`} />
                  <span>{loadingMultiDevice ? 'Syncing...' : 'Refresh Sessions & Audit'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Total Users</p>
                  <p className="text-xl font-black text-[#212121] font-mono">{audit?.totalUsers ?? users.length}</p>
                </div>
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Unique User IDs</p>
                  <p className="text-xl font-black text-[#2874f0] font-mono">{audit?.uniqueUserIds ?? users.length}</p>
                </div>
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Unique Room IDs</p>
                  <p className="text-xl font-black text-purple-700 font-mono">{audit?.uniqueRoomIds ?? users.length}</p>
                </div>
                <div className="bg-[#f9fafb] border border-slate-200 rounded-md p-3">
                  <p className="text-[10px] font-bold uppercase text-slate-500">Unique @Usernames</p>
                  <p className="text-xl font-black text-indigo-700 font-mono">{audit?.uniqueUsernames ?? users.length}</p>
                </div>
                <div className={`rounded-md p-3 border col-span-2 lg:col-span-1 ${
                  audit?.integrityHealthy !== false
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <p className="text-[10px] font-bold uppercase">Duplicate Check</p>
                  <p className="text-sm font-black mt-1">
                    {audit?.integrityHealthy !== false ? '✓ 0 Duplicates Healthy' : '⚠ Duplicate Detected'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Admin Panel Multi-Device Active Sessions (Max 4 Admin Devices) */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-[#212121]">
                      Admin Panel Connected Devices
                    </h4>
                    <span className={`px-2.5 py-0.5 rounded-sm text-[11px] font-black border ${
                      adminSessList.length >= 4
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                    }`}>
                      {adminSessList.length} / {multiDeviceData?.maxDevices || 4} Admin Slots Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    आप एक साथ अधिकतम 4 मोबाइल/कंप्यूटर पर Admin Panel लॉगिन कर सकते हैं और किसी भी अन्य Admin डिवाइस को यहाँ से 1-क्लिक रिमोट लॉगआउट कर सकते हैं।
                  </p>
                </div>

                {adminSessList.length > 1 && (
                  <button
                    type="button"
                    disabled={terminatingDeviceKey === 'admin-all'}
                    onClick={() => handleTerminateAdminDevice(undefined, true)}
                    className="px-3.5 py-2 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{terminatingDeviceKey === 'admin-all' ? 'Logging out...' : 'Log Out Other Admin Devices'}</span>
                  </button>
                )}
              </div>

              {adminSessList.length === 0 ? (
                <div className="p-4 rounded-md bg-[#f9fafb] border border-slate-200 text-xs text-slate-600 text-center">
                  सक्रिय Admin डिवाइस सत्र लोड हो रहे हैं...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {adminSessList.map(sess => {
                    const isThisDevice = Boolean(currentAdminTok && sess.token === currentAdminTok);
                    return (
                      <div
                        key={sess.sessionId}
                        className={`p-3.5 rounded-md border flex items-center justify-between gap-3 ${
                          isThisDevice
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-[#f9fafb] border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                            isThisDevice
                              ? 'bg-emerald-100 text-[#388e3c] border border-emerald-200'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}>
                            {sess.deviceType === 'mobile' ? (
                              <Smartphone className="w-5 h-5" />
                            ) : sess.deviceType === 'tablet' ? (
                              <Tablet className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-xs text-[#212121] truncate">{sess.deviceName}</span>
                              {isThisDevice && (
                                <span className="bg-emerald-100 text-[#388e3c] text-[9px] font-black px-1.5 py-0.5 rounded-sm border border-emerald-200">
                                  THIS ADMIN DEVICE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">
                              {sess.os} • {sess.browser} {sess.ipAddress ? `• IP: ${sess.ipAddress}` : ''}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Login: {new Date(sess.loginTime).toLocaleString('hi-IN')}
                            </p>
                          </div>
                        </div>

                        {!isThisDevice && (
                          <button
                            type="button"
                            disabled={terminatingDeviceKey === `admin-${sess.sessionId}`}
                            onClick={() => handleTerminateAdminDevice(sess.sessionId, false)}
                            className="px-2.5 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Logout</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Member Multi-Device Active Sessions (Max 4 Slots Per User) */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#212121]">
                    All Member Multi-Device Sessions (Max 4 Devices / User)
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    किसी भी सदस्य का डिवाइस लॉगआउट करने से उसका कोई भी खाता डेटा (Coins, Balance, Room ID, Sponsor ID) डिलीट नहीं होता — केवल उस डिवाइस से लॉगआउट होता है।
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={multiDeviceSearch}
                    onChange={e => setMultiDeviceSearch(e.target.value)}
                    placeholder="User ID, Room ID, @username या नाम..."
                    className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm pl-9 pr-3 py-1.5 text-xs text-[#212121] outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {userSessList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6 bg-[#f9fafb] rounded border border-slate-200">
                    कोई मिलान सदस्य नहीं मिला।
                  </p>
                ) : (
                  userSessList.map(entry => (
                    <div
                      key={entry.userId}
                      className="border border-slate-200 rounded-md p-4 bg-[#f9fafb] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-xs sm:text-sm text-[#212121]">
                              {entry.fullName}
                            </span>
                            {entry.username && (
                              <span className="text-[11px] font-mono text-[#2874f0] font-bold">
                                @{entry.username}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-black border ${
                              entry.activeCount >= 4
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : entry.activeCount > 0
                                ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {entry.activeCount} / {entry.maxDevices || 4} Devices
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600">
                            <span>User ID: <strong className="text-[#2874f0]">{entry.userId}</strong></span>
                            <span>•</span>
                            <span>Room ID: <strong className="text-purple-700">#{entry.personalRoomId || '—'}</strong></span>
                            <span>•</span>
                            <span>Sponsor: <strong className="text-emerald-700">{entry.sponsorId || 'ROOT'}</strong></span>
                          </div>
                        </div>

                        {entry.activeCount > 0 && (
                          <button
                            type="button"
                            disabled={terminatingDeviceKey === `user-all-${entry.userId}`}
                            onClick={() => handleAdminTerminateUserDevice(entry.userId, undefined, true)}
                            className="px-3 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>
                              {terminatingDeviceKey === `user-all-${entry.userId}` ? 'Logging out...' : 'Logout All Devices'}
                            </span>
                          </button>
                        )}
                      </div>

                      {entry.sessions.length === 0 ? (
                        <p className="text-[11px] text-slate-500 bg-white px-3 py-2 rounded border border-slate-200">
                          वर्तमान में कोई सक्रिय डिवाइस लॉगिन नहीं है (सारा डेटा 100% सुरक्षित है)।
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {entry.sessions.map(s => (
                            <div
                              key={s.sessionId}
                              className="bg-white border border-slate-200 rounded-sm p-2.5 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {s.deviceType === 'mobile' ? (
                                  <Smartphone className="w-4 h-4 text-[#2874f0] shrink-0" />
                                ) : s.deviceType === 'tablet' ? (
                                  <Tablet className="w-4 h-4 text-[#2874f0] shrink-0" />
                                ) : (
                                  <Laptop className="w-4 h-4 text-[#2874f0] shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-[11px] font-bold text-[#212121] truncate">{s.deviceName}</p>
                                  <p className="text-[10px] text-slate-500 truncate">
                                    {s.os} • {s.browser} • {new Date(s.lastActive).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={terminatingDeviceKey === `user-${entry.userId}-${s.sessionId}`}
                                onClick={() => handleAdminTerminateUserDevice(entry.userId, s.sessionId, false)}
                                className="px-2 py-1 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold cursor-pointer shrink-0 disabled:opacity-50"
                              >
                                Logout
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===================== REUSABLE INLINE ADMIN ACTION MODAL ===================== */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-[#212121]">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <h3 className={`text-sm sm:text-base font-bold ${actionModal.variant === 'reject' ? 'text-rose-700' : 'text-[#2874f0]'}`}>
                {actionModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="p-1 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{actionModal.description}</p>

            {actionModal.needsInput && (
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[#212121] mb-1">
                    {actionModal.inputLabel}
                  </label>
                  <input
                    type="text"
                    value={actionModalInput}
                    onChange={e => setActionModalInput(e.target.value)}
                    placeholder={actionModal.inputPlaceholder}
                    className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-xs text-[#212121] font-mono outline-none focus:border-[#2874f0]"
                  />
                </div>
                {actionModal.secondaryInputLabel && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#212121] mb-1">
                      {actionModal.secondaryInputLabel}
                    </label>
                    <input
                      type="text"
                      value={actionModalSecondary}
                      onChange={e => setActionModalSecondary(e.target.value)}
                      placeholder={actionModal.secondaryInputPlaceholder}
                      className="w-full px-3 py-2 rounded-sm bg-[#f9fafb] border border-slate-300 text-xs text-[#212121] font-mono outline-none focus:border-[#2874f0]"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                disabled={actionModalBusy}
                className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                disabled={actionModalBusy || (actionModal.needsInput && actionModal.inputRequired && !actionModalInput.trim())}
                onClick={async () => {
                  setActionModalBusy(true);
                  try {
                    await actionModal.onConfirm(actionModalInput, actionModalSecondary);
                    setActionModal(null);
                  } finally {
                    setActionModalBusy(false);
                  }
                }}
                className={`px-4 py-2 rounded-sm text-xs font-bold text-white cursor-pointer disabled:opacity-50 ${
                  actionModal.variant === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#388e3c] hover:bg-[#2e7d32]'
                }`}
              >
                {actionModalBusy ? 'Processing...' : actionModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== PAYMENT SCREENSHOT LIGHTBOX MODAL ===================== */}
      {previewScreenshot && (
        <div
          onClick={() => setPreviewScreenshot(null)}
          className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 max-w-xl w-full shadow-2xl space-y-3 text-[#212121]"
          >
            <div className="flex items-start justify-between border-b border-slate-200 pb-2.5 gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#212121]">पेमेंट स्क्रीनशॉट सत्यापन</h3>
                <p className="text-xs text-[#2874f0] font-semibold mt-0.5">{previewScreenshot.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewScreenshot(null)}
                className="p-1 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#f9fafb] border border-slate-200 rounded-sm p-2 flex items-center justify-center">
              <img
                src={previewScreenshot.url}
                alt="Payment Proof Full Preview"
                className="max-h-[65vh] w-auto object-contain rounded-xs"
              />
            </div>

            {previewScreenshot.recharge && previewScreenshot.recharge.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    const targetId = previewScreenshot.recharge!.id;
                    setPreviewScreenshot(null);
                    handleRejectRecharge(targetId);
                  }}
                  className="px-3 py-2 rounded-sm text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = previewScreenshot.recharge!.id;
                    setPreviewScreenshot(null);
                    handleApproveRecharge(targetId);
                  }}
                  className="px-4 py-2 rounded-sm text-xs font-bold bg-[#388e3c] hover:bg-[#2e7d32] text-white cursor-pointer"
                >
                  ✓ स्वीकृत करें (+{(previewScreenshot.recharge.coins + previewScreenshot.recharge.bonusCoins).toLocaleString()} Coins)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== EDIT PLAYER PASSWORD, LEVEL & VIP MODAL ===================== */}
      {editingPlayerModal && (
        <div
          onClick={() => setEditingPlayerModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onClick={e => e.stopPropagation()}
            onSubmit={handleSaveEditedPlayer}
            className="bg-white border border-slate-200 rounded-md p-5 max-w-lg w-full shadow-2xl space-y-3 text-[#212121] text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <h3 className="text-sm font-black text-indigo-900">
                  ✏️ Edit Player Credentials &amp; VIP Effect
                </h3>
                <p className="text-[11px] font-mono text-slate-500">
                  User ID, Room ID व Sponsor ID स्थायी रूप से लॉक हैं (Zero Duplicate)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlayerModal(null)}
                className="p-1 rounded-sm bg-[#f1f3f6] text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Strictly Locked Immutable Identities */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 rounded-sm p-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-[#2874f0]" /> User ID (LOCKED)
                </label>
                <div className="font-mono font-black text-[#2874f0] text-[11px] truncate">
                  {editingPlayerModal.user.userId}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-purple-700" /> Room ID (LOCKED)
                </label>
                <div className="font-mono font-black text-purple-700 text-[11px] truncate">
                  #{editingPlayerModal.user.personalRoomId || editingPlayerModal.user.roomAddress || 'UNIQUE'}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-emerald-700" /> Sponsor ID (LOCKED)
                </label>
                <div className="font-mono font-black text-emerald-700 text-[11px] truncate">
                  {editingPlayerModal.user.sponsorId || 'ROOT'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingPlayerModal.fullName}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, fullName: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">@Username</label>
                <input
                  type="text"
                  value={editingPlayerModal.username}
                  onChange={e =>
                    setEditingPlayerModal(p => p && ({ ...p, username: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() }))
                  }
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Mobile</label>
                <input
                  type="text"
                  value={editingPlayerModal.phone}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, phone: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Login Password</label>
                <input
                  type="text"
                  value={editingPlayerModal.password}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, password: e.target.value }))}
                  className="w-full bg-amber-50 border border-amber-300 rounded-sm px-3 py-1.5 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Coins (🪙)</label>
                <input
                  type="number"
                  value={editingPlayerModal.coins}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, coins: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Charms (✨)</label>
                <input
                  type="number"
                  value={editingPlayerModal.charms}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, charms: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Game Level</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={editingPlayerModal.gameLevel}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, gameLevel: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">VIP Tier</label>
                <select
                  value={editingPlayerModal.vipTier}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, vipTier: e.target.value as any }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5 font-bold"
                >
                  <option value="none">Standard (No VIP)</option>
                  <option value="silver">🛡️ Silver VIP</option>
                  <option value="gold">👑 Gold VIP</option>
                  <option value="diamond">💎 Diamond Royal VIP</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Avatar Frame</label>
                <select
                  value={editingPlayerModal.frameType}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, frameType: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5"
                >
                  <option value="standard">Standard Ring</option>
                  <option value="vip-gold">👑 VIP Gold Glow</option>
                  <option value="cyber-diamond">💠 Cyber Diamond</option>
                  <option value="royal-dragon-crown">🐉 Royal Dragon Crown</option>
                  <option value="mythic-crimson">🔥 Mythic Crimson</option>
                  <option value="clan-leader">🛡️ Clan Leader Emblem</option>
                </select>
              </div>
              <div>
                <label className="block font-bold mb-1">Clan / Family</label>
                <input
                  type="text"
                  value={editingPlayerModal.clanName}
                  onChange={e => setEditingPlayerModal(p => p && ({ ...p, clanName: e.target.value }))}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded-sm px-3 py-1.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingPlayerModal(null)}
                className="px-3.5 py-2 rounded-sm bg-[#f1f3f6] font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={savingPlayerEdit}
                className="px-4 py-2 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black cursor-pointer disabled:opacity-50"
              >
                {savingPlayerEdit ? 'सेव हो रहा है...' : '💾 Save Credentials'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
