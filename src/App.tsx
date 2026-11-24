/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { UserProfile, PlatformSettings, ServiceItem } from './types/index.ts';
import { api } from './services/api.ts';
import { syncUserToFirestore } from './services/firebase.ts';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { AdminLoginModal } from './components/AdminLoginModal.tsx';
import { IdCardModal } from './components/IdCardModal.tsx';
import { LegalComplianceModal } from './components/LegalComplianceModal.tsx';
import { PostLoginProfileModal } from './components/PostLoginProfileModal.tsx';
import { AiChatbot } from './components/AiChatbot.tsx';
import { HomeView } from './views/HomeView.tsx';
import { ServicesView } from './views/ServicesView.tsx';
import { ServiceDetailView } from './views/ServiceDetailView.tsx';
import { MomentsView } from './views/MomentsView.tsx';
import { ChatClubView } from './views/ChatClubView.tsx';
import { RegisterView } from './views/RegisterView.tsx';
import { DashboardView, type DashboardTabType } from './views/DashboardView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { GamingRoomView } from './views/GamingRoomView.tsx';
import { NwiSystemView } from './views/NwiSystemView.tsx';
import { MePageView } from './views/MePageView.tsx';
import { DailyTasksAndLoginModal } from './components/games/DailyTasksAndLoginModal.tsx';
import { LockedFooterNav, type GamingSubTabType } from './components/LockedFooterNav.tsx';
import { 
  Sparkles,
  Gamepad2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';
import { showToast, type ToastMessage } from './services/toast.ts';


export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => api.getStoredUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => api.getStoredAdmin());
  const [adminPassword, setAdminPassword] = useState<string>(() => api.getStoredAdminPass());
  
  // If user is already logged in, start on dashboard (or voice room if ?room= deep-link is present)
  const [initialRoomCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (params.get('room') || '').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    return '';
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const stored = api.getStoredUser();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room') && stored) return 'gaming-room';
    }
    const savedTab = stored?.workspaceState?.lastTab;
    const validUserTabs = new Set(['home', 'services', 'service-detail', 'moments', 'chat-club', 'gaming-room', 'nwi', 'dashboard', 'me']);
    if (stored && savedTab && validUserTabs.has(savedTab)) {
      return savedTab;
    }
    if (stored?.accountType === 'gamer') return 'gaming-room';
    return stored ? 'dashboard' : 'home';
  });
  
  const [settings, setSettings] = useState<PlatformSettings>({
    ownerName: 'SANTOSH KUMAR',
    ownerSponsorId: 'EMO-MOM-MMO',
    adminUpiId: '8877490845@SPICEPAY',
    adminPayeeName: 'VIKAS KUMAR',
    adminQrCodeUrl: '',
    contactAddress: 'ESP Headquarters, Bihar, India',
    supportPhone: '+91 8877490845',
    supportEmail: 'ioisplatform@gmail.com',
    whatsappNumber: '8877490845',
    minWithdrawal: 50,
    defaultReferralCommissionRate: 0.40,
    blogReferenceUrl: 'https://emofi100.blogspot.com/2024/03/earning-service-platform-esp.html?m=1',
    joiningFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScqqyR1CDev8HEmpKaSzvRd1hcIERIIOP1qYWL1NaPV_9L-rg/viewform?usp=sf_link',
    bannerNotice: '🎉 Welcome to Earning System Platform (ESP)! Join starting at ₹10 & receive your Verified Member Digital ID Card!',
  });
  
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('EMO');
  const [initialServiceCode, setInitialServiceCode] = useState<string>('EMO');
  const [initialFee, setInitialFee] = useState<number>(10);
  const [initialSponsorId, setInitialSponsorId] = useState<string>('');

  // Modals & Routing Preferences
  const [loginDestination, setLoginDestination] = useState<'platform' | 'gaming-room'>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'gaming-room';
    }
    return 'platform';
  });
  const [gamingInitialSubTab, setGamingInitialSubTab] = useState<
    'overview' | 'ludo' | 'dice_arena' | 'card_luck' | 'gift_store' | 'vip_frames' | 'leaderboard' | 'recharge_convert' | 'voice_room' | 'games' | 'clan_friends' | 'rewards_tasks'
  >(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'voice_room';
    }
    const saved = api.getStoredUser()?.workspaceState?.lastGamingSubTab;
    return (saved as any) || 'overview';
  });
  const [activeGamingSubTab, setActiveGamingSubTab] = useState<GamingSubTabType>(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('room')) {
      return 'voice_room';
    }
    const saved = api.getStoredUser()?.workspaceState?.lastGamingSubTab;
    return (saved as GamingSubTabType) || 'games';
  });
  const [dashboardInitialSubTab, setDashboardInitialSubTab] = useState<DashboardTabType>(() => {
    const saved = api.getStoredUser()?.workspaceState?.lastDashboardTab as DashboardTabType | undefined;
    const valid: DashboardTabType[] = [
      'overview', 'idcard', 'poster', 'referrals', 'nwi_tree',
      'wallet', 'transactions', 'coins_ledger', 'complaints', 'profile', 'devices',
    ];
    return saved && valid.includes(saved) ? saved : 'overview';
  });
  const [gamingNavPulse, setGamingNavPulse] = useState(0);
  const [initialRegMode, setInitialRegMode] = useState<'business' | 'gamer'>('business');
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('ref')) return false;
    }
    return !api.getStoredUser();
  });
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [showPostLoginProfileModal, setShowPostLoginProfileModal] = useState(false);
  const [showWeeklyRewardPopup, setShowWeeklyRewardPopup] = useState(false);
  const [weeklyPopupReason, setWeeklyPopupReason] = useState<'login' | 'midnight' | 'manual'>('login');
  const weeklyLiveIstDateRef = React.useRef<string>('');
  const [remoteLogoutNotice, setRemoteLogoutNotice] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    // Listen to global toast events
    const handleToastEvent = (e: Event) => {
      const custom = e as CustomEvent<ToastMessage>;
      if (custom.detail) {
        const newToast = custom.detail;
        setToasts(prev => [newToast, ...prev.slice(0, 4)]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, newToast.duration || 3500);
      }
    };
    window.addEventListener('esp-toast', handleToastEvent);

    // Check ?ref=ESPGTRK01 / EMORKESP01 / username in URL query
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref');
      if (refParam) {
        const cleanRef = refParam.trim().replace(/^@+/, '');
        setInitialSponsorId(cleanRef);
        // Track unique session referral link click for conversion rate analytics
        const clickGuardKey = `esp_ref_click_tracked_${cleanRef.toLowerCase()}`;
        try {
          if (!sessionStorage.getItem(clickGuardKey)) {
            sessionStorage.setItem(clickGuardKey, '1');
            api.trackReferralClick(cleanRef).catch(() => {});
          }
        } catch {
          api.trackReferralClick(cleanRef).catch(() => {});
        }
        // Only redirect to register if user is not already logged in
        if (!api.getStoredUser()) {
          setCurrentTab('register');
        }
      }
    }

    api.getSettings().then(setSettings);
    api.getServices().then(setServices);
    api.syncLocalBackupsToCloudBridge().catch(() => {});

    // Global 3D click enlarge + glow pulse for every button across desktop & mobile
    const handleGlobalButtonPulse = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button, [role="button"], .btn-3d') as HTMLElement | null;
      if (!btn || (btn as HTMLButtonElement).disabled || btn.getAttribute('aria-disabled') === 'true') {
        return;
      }
      btn.classList.remove('esp-btn-glow-active');
      void btn.offsetWidth;
      btn.classList.add('esp-btn-glow-active');
      window.setTimeout(() => {
        btn.classList.remove('esp-btn-glow-active');
      }, 300);
    };
    document.addEventListener('pointerdown', handleGlobalButtonPulse, { passive: true });

    // Multi-Device synchronization on mount and when returning to browser tab
    const verifyCurrentSession = async () => {
      const stored = api.getStoredUser();
      if (!stored) return;
      try {
        const check = await api.verifySession(stored.userId);
        if (check.valid && check.user) {
          setCurrentUser(check.user);
        } else if (check.sessionTerminated) {
          setCurrentUser(null);
          api.setStoredUser(null);
          setCurrentTab('home');
          setRemoteLogoutNotice(check.message || 'आपका यह डिवाइस किसी अन्य डिवाइस से रिमोटली लॉगआउट कर दिया गया है।');
        }
      } catch (e) {
        console.warn('Session sync note:', e);
      }
    };

    verifyCurrentSession();

    const handleFocus = () => {
      verifyCurrentSession();
    };
    window.addEventListener('focus', handleFocus);
    const sessionPoll = setInterval(verifyCurrentSession, 20000);
    return () => {
      clearInterval(sessionPoll);
      document.removeEventListener('pointerdown', handleGlobalButtonPulse);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('esp-toast', handleToastEvent);
    };
  }, []);

  // Multi-Device Admin session polling (detects remote admin logout from any other admin device)
  useEffect(() => {
    if (!isAdmin) return;
    const checkAdmin = async () => {
      try {
        const res = await api.verifyAdminSession();
        if (res && res.sessionTerminated) {
          setIsAdmin(false);
          setAdminPassword('');
          api.setStoredAdmin(false);
          setCurrentTab('home');
          setRemoteLogoutNotice(res.message || 'यह Admin डिवाइस किसी अन्य Admin डिवाइस से रिमोटली लॉगआउट कर दिया गया है।');
        }
      } catch {
        // ignore transient errors
      }
    };
    checkAdmin();
    const adminPoll = setInterval(checkAdmin, 25000);
    return () => clearInterval(adminPoll);
  }, [isAdmin]);

  // Persist user's active screen/tab to server so logging in on another device resumes exact workspace
  useEffect(() => {
    if (!currentUser?.userId) return;
    if (currentTab === 'admin' || currentTab === 'register') return;
    const timer = setTimeout(() => {
      const ws = {
        lastTab: currentTab,
        lastGamingSubTab: activeGamingSubTab,
        lastDashboardTab: dashboardInitialSubTab,
        lastRoomAddress: currentUser.roomAddress || currentUser.personalRoomId || '',
        updatedAt: new Date().toISOString(),
      };
      api.saveWorkspaceState(currentUser.userId, ws);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentUser?.userId, currentTab, activeGamingSubTab, dashboardInitialSubTab]);

  // Presence & Online Session Heartbeat ("कब से कब तक ऑन रहा" & "कितना दिन गेम खेला" Tracking)
  useEffect(() => {
    if (!currentUser?.userId) return;

    let activeSessionId = '';
    const dev = api.detectClientDevice ? api.detectClientDevice() : { deviceType: 'mobile', deviceName: 'Mobile Device', browser: 'Browser', os: 'Mobile' };

    const sendHeartbeatPulse = async () => {
      try {
        const res = await api.sendHeartbeat({
          userId: currentUser.userId,
          sessionId: activeSessionId || undefined,
          deviceType: dev.deviceType,
          deviceName: dev.deviceName,
          browser: dev.browser,
          os: dev.os,
        });
        if (res && res.sessionId) {
          activeSessionId = res.sessionId;
        }
      } catch (err) {
        // Silent fail for transient network glitches
      }
    };

    // Initial heartbeat on login/mount
    sendHeartbeatPulse();

    // Pulse every 45 seconds
    const interval = setInterval(sendHeartbeatPulse, 45000);

    const handleBeforeUnload = () => {
      if (currentUser?.userId) {
        api.endSession(currentUser.userId, activeSessionId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (currentUser?.userId) {
        api.endSession(currentUser.userId, activeSessionId);
      }
    };
  }, [currentUser?.userId]);

  useEffect(() => {
    if (currentUser?.userId) {
      syncUserToFirestore(currentUser, true).catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.userId || loginModalOpen || showPostLoginProfileModal || currentTab === 'admin') {
      return;
    }
    let cancelled = false;
    let midnightTimeout: ReturnType<typeof setTimeout> | null = null;

    const checkLiveWeeklyRewardPopup = async (triggerSource: 'login' | 'midnight') => {
      try {
        const [liveTimeRes, hubData] = await Promise.all([
          api.getLiveServerTime().catch(() => null),
          api.getDailyGameHub(currentUser.userId).catch(() => null),
        ]);
        if (cancelled) return;
        const meta = liveTimeRes?.timeMeta || hubData?.timeMeta;
        const liveIstDate = meta?.istDate || hubData?.today || '';
        if (liveIstDate) {
          weeklyLiveIstDateRef.current = liveIstDate;
        }

        const claimedStorageKey = `esp_weekly_claimed_date_${currentUser.userId}`;
        const dismissKey = `esp_weekly_popup_dismissed_${currentUser.userId}`;
        const claimedLocallyDate = (() => {
          try {
            return localStorage.getItem(claimedStorageKey) || '';
          } catch {
            return '';
          }
        })();
        const dismissedDate = (() => {
          try {
            return sessionStorage.getItem(dismissKey) || '';
          } catch {
            return '';
          }
        })();

        const serverCanClaim = Boolean(hubData?.checkIn?.canClaimToday);
        const alreadyClaimedUser = Boolean(
          liveIstDate && currentUser.lastDailyCheckInDate === liveIstDate
        );
        const alreadyClaimedLocal = Boolean(
          liveIstDate && claimedLocallyDate === liveIstDate
        );

        // Sync local durable lock if server already recorded today's claim
        if (!serverCanClaim && liveIstDate) {
          try {
            localStorage.setItem(claimedStorageKey, liveIstDate);
          } catch {}
        }

        const canClaimToday =
          serverCanClaim && !alreadyClaimedUser && !alreadyClaimedLocal;

        if (!canClaimToday) {
          setShowWeeklyRewardPopup(false);
        } else if (
          triggerSource === 'midnight' ||
          !liveIstDate ||
          dismissedDate !== liveIstDate
        ) {
          setWeeklyPopupReason(triggerSource);
          setShowWeeklyRewardPopup(true);
          if (triggerSource === 'midnight') {
            showToast(
              `🌙 12:00 AM IST Live! Day ${hubData?.checkIn?.nextDayNumber || 1} Weekly Reward अनलॉक हो गया है!`,
              'reward',
              'Weekly Reward Unlocked'
            );
          }
        }

        if (meta?.secondsUntilMidnight && meta.secondsUntilMidnight > 0) {
          if (midnightTimeout) clearTimeout(midnightTimeout);
          const waitMs = Math.min(24 * 60 * 60 * 1000, meta.secondsUntilMidnight * 1000 + 1200);
          midnightTimeout = setTimeout(() => {
            if (!cancelled) {
              checkLiveWeeklyRewardPopup('midnight');
            }
          }, waitMs);
        }
      } catch {
        // silent fail on network hiccup
      }
    };

    checkLiveWeeklyRewardPopup('login');

    // Poll live server IST clock every 30s so crossing 12:00:00 AM IST unlocks cleanly
    const liveClockPoll = setInterval(async () => {
      try {
        const timeRes = await api.getLiveServerTime();
        const latestIstDate = timeRes?.timeMeta?.istDate;
        if (
          !cancelled &&
          latestIstDate &&
          weeklyLiveIstDateRef.current &&
          latestIstDate !== weeklyLiveIstDateRef.current
        ) {
          checkLiveWeeklyRewardPopup('midnight');
        }
      } catch {}
    }, 30000);

    return () => {
      cancelled = true;
      if (midnightTimeout) clearTimeout(midnightTimeout);
      clearInterval(liveClockPoll);
    };
  }, [currentUser?.userId, loginModalOpen, showPostLoginProfileModal, currentTab === 'admin']);

  const handleUserLogin = (user: UserProfile, destination?: 'platform' | 'gaming-room', promptProfileChoice = false) => {
    try {
      sessionStorage.removeItem(`esp_weekly_popup_dismissed_${user.userId}`);
    } catch {}
    api.setStoredUser(user);
    showToast(`नमस्ते ${user.fullName}, ESP पोर्टल में आपका स्वागत है!`, 'success');
    setCurrentUser(user);
    setRemoteLogoutNotice(null);

    const savedWs = user.workspaceState;
    const validDashboardTabs: DashboardTabType[] = [
      'overview', 'idcard', 'poster', 'referrals', 'nwi_tree',
      'wallet', 'transactions', 'coins_ledger', 'complaints', 'profile', 'devices',
    ];
    if (savedWs?.lastDashboardTab && validDashboardTabs.includes(savedWs.lastDashboardTab as DashboardTabType)) {
      setDashboardInitialSubTab(savedWs.lastDashboardTab as DashboardTabType);
    } else {
      setDashboardInitialSubTab('overview');
    }

    const isGamerAccount = user.accountType === 'gamer';
    const validUserTabs = new Set(['home', 'services', 'service-detail', 'moments', 'chat-club', 'gaming-room', 'nwi', 'dashboard', 'me']);

    if (initialRoomCode) {
      setGamingInitialSubTab('voice_room');
      setActiveGamingSubTab('voice_room');
      setCurrentTab('gaming-room');
    } else if (destination === 'gaming-room') {
      const gTab = (savedWs?.lastGamingSubTab as any) || 'games';
      setGamingInitialSubTab(gTab);
      setActiveGamingSubTab(gTab);
      setCurrentTab('gaming-room');
    } else if (savedWs?.lastTab && validUserTabs.has(savedWs.lastTab)) {
      if (savedWs.lastGamingSubTab) {
        setGamingInitialSubTab(savedWs.lastGamingSubTab as any);
        setActiveGamingSubTab(savedWs.lastGamingSubTab as any);
      }
      setCurrentTab(savedWs.lastTab);
    } else if (isGamerAccount) {
      setGamingInitialSubTab('games');
      setActiveGamingSubTab('games');
      setCurrentTab('gaming-room');
    } else {
      setCurrentTab('dashboard');
    }
    if (promptProfileChoice && !isGamerAccount && destination !== 'gaming-room' && !savedWs?.lastTab) {
      setShowPostLoginProfileModal(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserLogout = () => {
    const uid = currentUser?.userId;
    const ws = uid
      ? {
          lastTab: currentTab,
          lastGamingSubTab: activeGamingSubTab,
          lastDashboardTab: dashboardInitialSubTab,
          lastRoomAddress: currentUser?.roomAddress || currentUser?.personalRoomId || '',
        }
      : undefined;
    void api.logout(uid, ws);
    setShowWeeklyRewardPopup(false);
    setCurrentUser(null);
    setCurrentTab('home');
  };

  const handleAdminLogin = (password: string, adminToken?: string) => {
    setIsAdmin(true);
    setAdminPassword(password);
    api.setStoredAdmin(true, password, adminToken);
    setCurrentTab('admin');
  };

  const handleAdminLogout = () => {
    void api.adminLogout();
    setIsAdmin(false);
    setAdminPassword('');
    setCurrentTab('home');
  };

  const handleSelectServiceForRegistration = (serviceCode: string, fee: number) => {
    if (currentUser) {
      setCurrentTab('dashboard');
      return;
    }
    setInitialServiceCode(serviceCode);
    setInitialFee(fee);
    setInitialRegMode('business');
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBuyCoins = () => {
    if (!currentUser) {
      showToast('⚠️ कॉइन्स खरीदने के लिए कृपया पहले लॉगिन करें!', 'error', 'लॉगिन आवश्यक');
      setLoginDestination('gaming-room');
      setLoginModalOpen(true);
      return;
    }
    setGamingInitialSubTab('recharge_convert');
    setActiveGamingSubTab('recharge_convert');
    setGamingNavPulse(p => p + 1);
    setCurrentTab('gaming-room');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMeMenu = () => {
    if (!currentUser) {
      setLoginDestination('gaming-room');
      setLoginModalOpen(true);
      return;
    }
    setCurrentTab('me');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    // बिना लॉगिन किए यूजर गेम में ENTRY नहीं ले सकता
    if (!currentUser && (tab === 'gaming-room' || tab === 'gaming-voice' || tab === 'gaming-tasks')) {
      showToast('⚠️ गेम्स और वॉइस रूम में प्रवेश के लिए कृपया पहले लॉगिन करें!', 'error', 'लॉगिन आवश्यक');
      setLoginDestination('gaming-room');
      setLoginModalOpen(true);
      return;
    }
    if (tab === 'gaming-room') {
      setGamingInitialSubTab('games');
      setActiveGamingSubTab('games');
      setGamingNavPulse(p => p + 1);
    } else if (tab === 'gaming-voice') {
      setGamingInitialSubTab('voice_room');
      setActiveGamingSubTab('voice_room');
      setGamingNavPulse(p => p + 1);
      setCurrentTab('gaming-room');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    } else if (tab === 'gaming-tasks') {
      setGamingInitialSubTab('rewards_tasks');
      setActiveGamingSubTab('rewards_tasks');
      setGamingNavPulse(p => p + 1);
      setCurrentTab('gaming-room');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // If logged in, block navigating to 'register'
    if (currentUser && tab === 'register') {
      setCurrentTab(currentUser.accountType === 'gamer' ? 'gaming-room' : 'dashboard');
    } else {
      setCurrentTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCleanGameLobby = currentUser?.accountType === 'gamer' && (currentTab === 'gaming-room' || currentTab === 'me');

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-[#212121] flex flex-col font-sans selection:bg-[#2874f0] selection:text-white w-full overflow-x-hidden">
      {/* Flipkart-Themed Clean Marketplace Navigation Header (Hidden for gamer users on Gaming Room to keep screenshot-exact clean header) */}
      {!isCleanGameLobby && (
        <Navbar
          currentUser={currentUser}
          isAdmin={isAdmin}
          settings={settings}
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          onSelectServiceCode={code => setSelectedServiceCode(code)}
          onOpenLogin={() => setLoginModalOpen(true)}
          onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
          onLogout={handleUserLogout}
          onShowIdCard={() => setIdCardModalOpen(true)}
          onOpenLegalModal={() => setLegalModalOpen(true)}
        />
      )}

      {/* Remote Logout Alert Banner */}
      {remoteLogoutNotice && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 text-center text-xs text-amber-950 font-semibold flex items-center justify-center gap-2">
          <span>{remoteLogoutNotice}</span>
          <button
            onClick={() => setRemoteLogoutNotice(null)}
            className="ml-3 font-bold underline text-[#2874f0] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content View Container (always padded above locked bottom footer) */}
      <main className={isCleanGameLobby ? 'flex-1 w-full overflow-x-hidden pb-6' : 'flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 overflow-x-hidden pb-28'}>
        {currentTab === 'home' && (
          <HomeView
            settings={settings}
            services={services}
            currentUser={currentUser}
            isLoginModalOpen={loginModalOpen}
            onSelectTab={handleTabChange}
            onSelectServiceForRegistration={handleSelectServiceForRegistration}
            onOpenLegalModal={() => setLegalModalOpen(true)}
            onSelectServiceCode={setSelectedServiceCode}
            onUpdateUser={setCurrentUser}
            onOpenLogin={() => {
              setLoginDestination('platform');
              setLoginModalOpen(true);
            }}
          />
        )}

        {currentTab === 'services' && (
          <ServicesView
            services={services}
            currentUser={currentUser}
            onSelectServiceForRegistration={handleSelectServiceForRegistration}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onSelectServiceCode={code => {
              setSelectedServiceCode(code);
              setCurrentTab('service-detail');
            }}
            onSelectTab={handleTabChange}
            onOpenLegalModal={() => setLegalModalOpen(true)}
          />
        )}

        {/* 10 Dedicated Services Detail Page with exact requested titles & referral calc */}
        {currentTab === 'service-detail' && (
          <ServiceDetailView
            selectedServiceCode={selectedServiceCode}
            onSelectServiceCode={code => setSelectedServiceCode(code)}
            onSelectServiceForRegistration={handleSelectServiceForRegistration}
            currentUser={currentUser}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            settings={settings}
            onOpenLegalModal={() => setLegalModalOpen(true)}
          />
        )}

        {/* Moments Feed: Daily Status & Photos with Likes, Comments, WhatsApp Share */}
        {currentTab === 'moments' && (
          <MomentsView
            currentUser={currentUser}
            settings={settings}
            onOpenLogin={() => setLoginModalOpen(true)}
            onSelectTab={handleTabChange}
          />
        )}

        {/* WhatsApp-Style Chatting Club: Channels, Groups, Contacts & Invite */}
        {currentTab === 'chat-club' && (
          <ChatClubView
            currentUser={currentUser}
            settings={settings}
            onOpenLogin={() => setLoginModalOpen(true)}
            onSelectTab={handleTabChange}
          />
        )}

        {currentTab === 'register' && !currentUser && (
          <RegisterView
            settings={settings}
            services={services}
            initialServiceCode={initialServiceCode}
            initialFee={initialFee}
            initialSponsorId={initialSponsorId}
            initialRegistrationType={initialRegMode}
            onSuccessRegistration={(user, accountType) => {
              handleUserLogin(user, accountType === 'gamer' ? 'gaming-room' : 'platform');
            }}
            onSelectTab={handleTabChange}
          />
        )}

        {currentTab === 'register' && currentUser && (
          <div className="bg-white border border-slate-200 rounded-md max-w-lg mx-auto my-12 p-8 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-[#212121]">You are already registered and logged in</h2>
            <p className="text-xs text-[#666666]">
              Welcome back, {currentUser.fullName} ({currentUser.userId}). View your services and referrals in your dashboard.
            </p>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="px-6 py-2.5 rounded-sm font-semibold text-xs text-white bg-[#2874f0] hover:bg-[#1c62d6] transition cursor-pointer"
            >
              Go to My Dashboard
            </button>
          </div>
        )}

        {/* ESP GAMING ROOM */}
        {currentTab === 'gaming-room' && (
          currentUser ? (
            <GamingRoomView
              user={currentUser}
              settings={settings}
              initialSubTab={gamingInitialSubTab}
              initialRoomId={initialRoomCode || undefined}
              subTabPulse={gamingNavPulse}
              onSubTabChange={setActiveGamingSubTab}
              isAdmin={isAdmin}
              onOpenAdmin={() => setCurrentTab('admin')}
              onLogout={handleUserLogout}
              onUpdateUser={updated => {
                setCurrentUser(updated);
                api.setStoredUser(updated);
              }}
              onOpenCardModal={() => setIdCardModalOpen(true)}
              onOpenWithdrawal={() => setCurrentTab('dashboard')}
              onOpenEarningSetup={() => handleTabChange('dashboard')}
              onOpenServicesSetup={() => handleTabChange('services')}
              onOpenMomentsFeed={() => handleTabChange('moments')}
            />
          ) : (
            <div className="bg-white border border-slate-200 max-w-lg mx-auto my-10 p-6 sm:p-8 rounded-md text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-md bg-[#2874f0] text-white flex items-center justify-center text-3xl shadow-xs">
                <Gamepad2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-[#2874f0] uppercase tracking-wide">
                  ESP Gaming Time · Member Access
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  गेम्स में प्रवेश के लिए लॉगिन करें
                </h2>
                <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-sm mx-auto">
                  ESP PLAY वॉइस रूम, लूडो, डाइस और कॉइन गेम्स खेलने के लिए अपने रजिस्टर्ड खाते में लॉगिन करें या नया मुफ्त गेमर पास बनाएं।
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="flex-1 py-3 px-5 rounded-sm text-xs sm:text-sm font-bold text-white bg-[#2874f0] hover:bg-[#1c62d6] shadow-xs cursor-pointer"
                >
                  Login Now
                </button>
                <button
                  onClick={() => setCurrentTab('register')}
                  className="flex-1 py-3 px-5 rounded-sm text-xs sm:text-sm font-bold text-white bg-[#fb641b] hover:bg-[#e8550f] shadow-xs cursor-pointer"
                >
                  Join Free / ₹10+
                </button>
              </div>

              <button
                onClick={() => setCurrentTab('home')}
                className="text-xs font-semibold text-[#2874f0] hover:underline transition cursor-pointer"
              >
                ← होम पेज पर वापस जाएं
              </button>
            </div>
          )
        )}

        {/* NWI (Non-Working Income) 3-Level Auto Spillover Passive Income View */}
        {currentTab === 'nwi' && (
          <NwiSystemView
            currentUser={currentUser}
            settings={settings}
            onOpenLogin={() => setLoginModalOpen(true)}
            onSelectTab={handleTabChange}
            onSelectServiceForRegistration={handleSelectServiceForRegistration}
            onUpdateUser={updated => {
              setCurrentUser(updated);
              api.setStoredUser(updated);
            }}
          />
        )}

        {currentTab === 'dashboard' && currentUser && (
          <DashboardView
            user={currentUser}
            settings={settings}
            initialSubTab={dashboardInitialSubTab}
            onSubTabChange={setDashboardInitialSubTab}
            onUpdateUser={updated => {
              setCurrentUser(updated);
              api.setStoredUser(updated);
            }}
            onNavigateToTab={tab => handleTabChange(tab)}
            onOpenBuyCoins={handleOpenBuyCoins}
          />
        )}

        {currentTab === 'dashboard' && !currentUser && (
          <div className="bg-white border border-slate-200 rounded-md max-w-md mx-auto my-14 p-8 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-[#212121]">Member Login Required</h2>
            <p className="text-xs text-[#666666]">
              Please sign in with your ESP ID or mobile number to access your dashboard.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-6 py-2.5 rounded-sm font-semibold text-xs text-white bg-[#2874f0] hover:bg-[#1c62d6] transition cursor-pointer"
            >
              Open Login
            </button>
          </div>
        )}

        {currentTab === 'me' && currentUser && (
          <MePageView
            user={currentUser}
            settings={settings}
            isAdmin={isAdmin}
            onUpdateUser={updated => {
              setCurrentUser(updated);
              api.setStoredUser(updated);
            }}
            onSelectTab={handleTabChange}
            onOpenRecharge={handleOpenBuyCoins}
            onOpenWeeklyRewards={() => {
              setWeeklyPopupReason('manual');
              setShowWeeklyRewardPopup(true);
            }}
            onShowIdCard={() => setIdCardModalOpen(true)}
            onOpenAdmin={() => setCurrentTab('admin')}
            onLogout={handleUserLogout}
          />
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminView
            adminPassword={adminPassword}
            settings={settings}
            onUpdateSettings={setSettings}
            onLogoutAdmin={handleAdminLogout}
          />
        )}

        {currentTab === 'admin' && !isAdmin && (
          <div className="bg-white border border-slate-200 rounded-md max-w-md mx-auto my-14 p-8 text-center space-y-4 shadow-xs">
            <h2 className="text-xl font-bold text-[#212121]">Admin Authentication Required</h2>
            <button
              onClick={() => setAdminLoginModalOpen(true)}
              className="px-6 py-2.5 rounded-sm font-semibold text-xs text-white bg-[#2874f0] hover:bg-[#1c62d6] transition cursor-pointer"
            >
              Enter Admin Password
            </button>
          </div>
        )}
      </main>

      {/* Global Locked Bottom Navigation Footer (Always visible across every page & device; active icon is enlarged & glowing) */}
      <LockedFooterNav
        currentTab={currentTab}
        gamingSubTab={activeGamingSubTab}
        currentUser={currentUser}
        isAdmin={isAdmin}
        onSelectTab={handleTabChange}
        onOpenMeMenu={handleOpenMeMenu}
      />


      {/* Footer (Hidden inside clean gamer lobby) */}
      {!isCleanGameLobby && (
        <Footer
          settings={settings}
          currentUser={currentUser}
          onSelectTab={handleTabChange}
          onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
          onOpenLegalModal={() => setLegalModalOpen(true)}
        />
      )}

      {/* Modals */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        initialDestination={loginDestination}
        onLoginSuccess={(u, dest) => handleUserLogin(u, dest, true)}
        onSwitchToRegister={mode => {
          setLoginModalOpen(false);
          setInitialRegMode(mode);
          setCurrentTab('register');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onAdminLoginSuccess={handleAdminLogin}
      />

      <IdCardModal
        isOpen={idCardModalOpen}
        onClose={() => setIdCardModalOpen(false)}
        user={currentUser}
        settings={settings}
      />

      <LegalComplianceModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
      />

      <PostLoginProfileModal
        isOpen={showPostLoginProfileModal}
        user={currentUser}
        onClose={() => setShowPostLoginProfileModal(false)}
        onUpdated={(updatedUser, goToTab) => {
          setCurrentUser(updatedUser);
          api.setStoredUser(updatedUser);
          setShowPostLoginProfileModal(false);
          if (goToTab) {
            setCurrentTab(goToTab);
          }
        }}
      />

      {showWeeklyRewardPopup && currentUser && (
        <DailyTasksAndLoginModal
          user={currentUser}
          initialTab="login"
          autoTriggeredReason={weeklyPopupReason}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            api.setStoredUser(updatedUser);
          }}
          onOpenBuyCoins={handleOpenBuyCoins}
          onNavigateTab={(actionTab) => {
            try {
              if (weeklyLiveIstDateRef.current) {
                sessionStorage.setItem(
                  `esp_weekly_popup_dismissed_${currentUser.userId}`,
                  weeklyLiveIstDateRef.current
                );
              }
            } catch {}
            setShowWeeklyRewardPopup(false);
            if (actionTab === 'voice_room' || actionTab === 'voice-room') {
              handleTabChange('gaming-voice');
            } else {
              handleTabChange('gaming-room');
            }
          }}
          onClose={() => {
            try {
              if (weeklyLiveIstDateRef.current) {
                sessionStorage.setItem(
                  `esp_weekly_popup_dismissed_${currentUser.userId}`,
                  weeklyLiveIstDateRef.current
                );
              }
            } catch {}
            setShowWeeklyRewardPopup(false);
          }}
        />
      )}

      {/* Clean Flipkart Toast Notification System */}
      <div
        aria-live="polite"
        className="fixed top-16 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-none space-y-2"
      >
        {toasts.map(toast => {
          const isReward = toast.type === 'reward';
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-sm shadow-xl bg-white border animate-slide-in-right ${
                isReward
                  ? 'border-amber-400 text-[#212121]'
                  : isSuccess
                  ? 'border-emerald-500 text-[#212121]'
                  : isError
                  ? 'border-rose-500 text-[#212121]'
                  : isWarning
                  ? 'border-amber-500 text-[#212121]'
                  : 'border-[#2874f0] text-[#212121]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isReward ? (
                  <div className="w-7 h-7 rounded-sm bg-[#ffe500] text-[#212121] flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-[#388e3c]" />
                ) : isError ? (
                  <XCircle className="w-5 h-5 text-rose-600" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                ) : (
                  <Info className="w-5 h-5 text-[#2874f0]" />
                )}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h5 className="font-bold text-xs text-[#212121] truncate">
                    {toast.title}
                  </h5>
                )}
                <p className="text-xs font-medium text-[#555555] leading-snug break-words">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="shrink-0 p-1 text-[#878787] hover:text-[#212121] rounded transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* 24x7 Live AI Chatbot for IOIS & ESP Platform */}
      <AiChatbot />
    </div>
  );
}
