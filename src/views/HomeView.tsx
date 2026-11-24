import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Coins,
  Users,
  Award,
  MessageCircle,
  Smartphone,
  Zap,
  Scale,
  LogIn,
  Gamepad2,
  Share2,
  PhoneCall,
  Briefcase,
  Camera,
  Gift,
  Star,
  Crown,
  Grid,
  Calculator,
  HelpCircle,
  Info,
  FileText,
  X,
  Sparkles,
  Lock,
} from 'lucide-react';
import type {
  PlatformSettings,
  ServiceItem,
  UserProfile,
  HomeSliderPhoto,
  PublicSponsorPreview,
} from '../types/index.ts';
import { ServicesPopUpModal } from '../components/ServicesPopUpModal.tsx';
import { HelplineModal } from '../components/HelplineModal.tsx';
import { HomeSliderPopupModal } from '../components/HomeSliderPopupModal.tsx';
import { AboutUsModal } from '../components/AboutUsModal.tsx';
import { ContactUsModal } from '../components/ContactUsModal.tsx';
import { FaqModal } from '../components/FaqModal.tsx';
import { PrivacyTermsModal } from '../components/PrivacyTermsModal.tsx';
import { MoreOptionsPopupModal, type MoreOptionItem } from '../components/SystemPopupModals.tsx';
import { getPlanVisualTheme } from '../config/planThemes.ts';
import { api } from '../services/api.ts';

interface HomeViewProps {
  settings: PlatformSettings;
  services: ServiceItem[];
  currentUser?: UserProfile | null;
  referralSponsor?: PublicSponsorPreview | null;
  isLoginModalOpen?: boolean;
  onSelectTab: (tab: string) => void;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  onOpenLegalModal?: () => void;
  onSelectServiceCode?: (code: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onOpenLogin?: () => void;
  onOpenKnowIncome?: () => void;
  onOpenKnowGaming?: () => void;
  onRegisterWithMode?: (mode: 'business' | 'gamer', code?: string, fee?: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  services,
  currentUser,
  referralSponsor,
  isLoginModalOpen = false,
  onSelectTab,
  onSelectServiceForRegistration,
  onOpenLegalModal,
  onSelectServiceCode,
  onOpenLogin,
  onOpenKnowIncome,
  onOpenKnowGaming,
  onRegisterWithMode,
}) => {
  const [calcTier, setCalcTier] = useState<number>(100);
  const [calcReferrals, setCalcReferrals] = useState<number>(10);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [showAllServices, setShowAllServices] = useState<boolean>(false);

  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);
  const [servicePreviewPopup, setServicePreviewPopup] = useState<ServiceItem | null>(null);

  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [privacyTermsOpen, setPrivacyTermsOpen] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<'privacy' | 'terms' | 'disclaimer'>('privacy');

  const [sliderPhotos, setSliderPhotos] = useState<HomeSliderPhoto[]>([]);
  const [sliderPopupOpen, setSliderPopupOpen] = useState<boolean>(false);
  const [realOnlineCount, setRealOnlineCount] = useState<number>(1);

  useEffect(() => {
    api.getHomeSliderPhotos().then(photos => {
      setSliderPhotos(photos);
      if (photos && photos.length > 0 && currentUser && !isLoginModalOpen) {
        setSliderPopupOpen(true);
      }
    });

    const fetchRealCount = async () => {
      try {
        const data = await api.getRealOnlineCount();
        if (data.success) {
          setRealOnlineCount(data.realCount);
        }
      } catch {}
    };
    fetchRealCount();
    const interval = setInterval(fetchRealCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.userId, isLoginModalOpen]);

  const isGamer = currentUser?.accountType === 'gamer';
  const planTheme = getPlanVisualTheme(currentUser?.chosenServiceCode, currentUser?.accountType);

  const estimatedDirectReward = calcTier * 0.5 * calcReferrals;
  const estimatedTaskMonthly = calcTier * 1.5 * 30;
  const totalProjected = estimatedDirectReward + estimatedTaskMonthly;

  const filteredServices = services.filter(s => {
    if (catalogFilter === 'all') return true;
    return s.category === catalogFilter;
  });
  const visibleServices = showAllServices ? filteredServices : filteredServices.slice(0, 6);

  const moreItems: MoreOptionItem[] = [
    {
      id: 'calc',
      label: 'Income Calculator Popup',
      subLabel: 'प्लान व रेफरल कमाई की तुरंत गणना करें',
      icon: <Calculator className="w-4 h-4" />,
      badge: 'Live',
      onClick: () => setCalculatorModalOpen(true),
    },
    {
      id: 'all-plans',
      label: 'All 10 Services Explorer',
      subLabel: 'EMO, MMO, MOM, SWI 3.3% App, NWI',
      icon: <Zap className="w-4 h-4 text-[#fb641b]" />,
      onClick: () => setServicesModalOpen(true),
    },
    {
      id: 'nwi',
      label: 'NWI 3-Level Passive Income',
      subLabel: 'L1: 10% · L2: 15% · L3: 25% ऑटो टीम',
      icon: <Crown className="w-4 h-4 text-emerald-600" />,
      onClick: () => onSelectTab('nwi'),
    },
    {
      id: 'moments',
      label: 'Moments & Status Feed',
      subLabel: 'सदस्यों की लाइव पोस्ट व स्टेटस देखें',
      icon: <Camera className="w-4 h-4" />,
      onClick: () => onSelectTab('moments'),
    },
    {
      id: 'chat-club',
      label: 'ESP Chatting Club',
      subLabel: 'चैनल, ग्रुप और डायरेक्ट फ्रेंड्स चैट',
      icon: <MessageCircle className="w-4 h-4 text-[#388e3c]" />,
      onClick: () => onSelectTab('chat-club'),
    },
    {
      id: 'faq',
      label: 'FAQ (सवाल-जवाब)',
      subLabel: 'प्लान, पेआउट और नियम की जानकारी',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: () => setFaqOpen(true),
    },
    {
      id: 'about',
      label: 'About ESP Platform',
      subLabel: 'कंपनी, विज़न और फाउंडर विवरण',
      icon: <Info className="w-4 h-4" />,
      onClick: () => setAboutUsOpen(true),
    },
    {
      id: 'contact',
      label: 'Contact & 24x7 Support',
      subLabel: 'ईमेल, WhatsApp व Telegram हेल्पडेस्क',
      icon: <PhoneCall className="w-4 h-4 text-[#388e3c]" />,
      onClick: () => setContactUsOpen(true),
    },
    {
      id: 'privacy',
      label: 'Privacy Policy & Terms',
      subLabel: 'डेटा सुरक्षा व सेवा शर्तें',
      icon: <FileText className="w-4 h-4" />,
      onClick: () => {
        setPrivacyTab('privacy');
        setPrivacyTermsOpen(true);
      },
    },
    ...(onOpenLegalModal
      ? [
          {
            id: 'legal',
            label: 'Legal Compliance Audit',
            subLabel: 'Direct Selling Rules 2021 रिपोर्ट',
            icon: <Scale className="w-4 h-4 text-[#2874f0]" />,
            onClick: () => onOpenLegalModal(),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 py-3 sm:py-4 pb-16 w-full max-w-7xl mx-auto overflow-x-hidden font-sans">
      {/* ======================================================================== */}
      {/* TAILORED HERO EXPERIENCE (4 DISTINCT MODES: NO CONFUSION, CLEAN POPUPS)  */}
      {/* ======================================================================== */}

      {/* MODE 1: LOGGED-IN FREE GAMING USER */}
      {currentUser && isGamer && (
        <section className="rounded-xl overflow-hidden border border-indigo-200 shadow-sm bg-white">
          <div className="bg-gradient-to-r from-[#6d28d9] via-[#4f46e5] to-[#2563eb] text-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffe500] text-[#212121] text-[11px] font-black uppercase">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Free Gaming Player · {currentUser.userId}</span>
              </div>
              <h1 className="font-display text-fluid-hero font-black leading-tight">
                नमस्ते {currentUser.fullName.split(' ')[0]}! आपका Gaming Club तैयार है
              </h1>
              <p className="text-fluid-body text-indigo-100 leading-relaxed max-w-xl">
                लाइव 8-सीट वॉइस रूम, 12+ गेम्स खेलें — और जब चाहें <strong>अपनी इसी ID ({currentUser.userId})</strong> को बिना नई ID बनाए Income Plan में अपग्रेड करें!
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('gaming-room')}
                  className="btn-3d px-5 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Enter Gaming Room</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (onOpenKnowIncome ? onOpenKnowIncome() : onSelectTab('dashboard'))}
                  className="btn-3d px-4 py-3 rounded-lg bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>Know Income &amp; Upgrade Same ID</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMoreModalOpen(true)}
                  className="btn-3d px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-4 h-4 text-[#ffe500]" />
                  <span>⋯ More</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white text-[#212121] rounded-xl p-4 sm:p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-indigo-700 uppercase">Your Live Gaming Profile</span>
                <span className="text-xs font-bold text-[#388e3c]">● {realOnlineCount} Online</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Coins</span>
                  <strong className="text-sm font-black text-[#fb641b]">🪙 {(currentUser.coins || 0).toLocaleString()}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Level</span>
                  <strong className="text-sm font-black text-[#2874f0]">Lv.{currentUser.gameLevel || 1}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Room ID</span>
                  <strong className="text-xs font-black text-purple-700">#{currentUser.personalRoomId || currentUser.roomAddress || 'Room'}</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                💡 एक ही पासवर्ड, एक ही <strong>{currentUser.userId}</strong> — कमाई शुरू करने पर आपका Gaming डेटा 100% सुरक्षित रहेगा।
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MODE 2: LOGGED-IN INCOME MEMBER (PLAN-SPECIFIC THEME) */}
      {currentUser && !isGamer && (
        <section className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className={`bg-gradient-to-r ${planTheme.heroGradient} text-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center`}>
            <div className="lg:col-span-7 space-y-4">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-black uppercase ${planTheme.badgeClass}`}>
                <span>{planTheme.icon}</span>
                <span>{planTheme.tierBadge}</span>
              </div>
              <h1 className="font-display text-fluid-hero font-black leading-tight">
                {planTheme.headline}
              </h1>
              <p className="text-fluid-body text-white/90 leading-relaxed max-w-xl">
                {planTheme.hindiSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('dashboard')}
                  className="btn-3d px-5 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Open My {currentUser.chosenServiceCode || 'EMO'} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (onOpenKnowGaming ? onOpenKnowGaming() : onSelectTab('gaming-room'))}
                  className="btn-3d px-4 py-3 rounded-lg bg-white hover:bg-blue-50 text-[#2874f0] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Know &amp; Play Gaming (Same ID)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMoreModalOpen(true)}
                  className="btn-3d px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-4 h-4 text-[#ffe500]" />
                  <span>⋯ More</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white text-[#212121] rounded-xl p-4 sm:p-5 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-[#2874f0] uppercase">Member Account Summary</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#388e3c] text-[10px] font-black border border-emerald-200">
                  ● {currentUser.status.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Wallet ₹</span>
                  <strong className="text-sm font-black text-[#388e3c] tabular-nums">₹{currentUser.balance}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Earned ₹</span>
                  <strong className="text-sm font-black text-[#2874f0] tabular-nums">₹{currentUser.totalEarnings}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-slate-500 block">Gaming Coins</span>
                  <strong className="text-sm font-black text-[#fb641b] tabular-nums">🪙 {(currentUser.coins || 0).toLocaleString()}</strong>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">{planTheme.highlightMetricLabel}:</span>
                <strong className={planTheme.accentText}>{planTheme.highlightMetricValue}</strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODE 3: REFERRAL LINK VISITOR (?ref= SPONSOR INVITE EXPERIENCE) */}
      {!currentUser && referralSponsor && (
        <section className="rounded-xl overflow-hidden border-2 border-[#ffe500] shadow-md bg-white">
          <div className="bg-gradient-to-r from-[#1e3a8a] via-[#2874f0] to-[#0284c7] text-white p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffe500] text-[#212121] text-[11px] font-black uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VIP Sponsor Invitation · Direct Referral Link</span>
              </div>
              <h1 className="font-display text-fluid-hero font-black leading-tight">
                {referralSponsor.sponsorName} ने आपको ESP में आमंत्रित किया है!
              </h1>
              <p className="text-fluid-body text-blue-100 leading-relaxed max-w-xl">
                आपके स्पॉन्सर (<strong>{referralSponsor.sponsorId}</strong>) के अंतर्गत <strong>₹10+ से Earning Plan</strong> या <strong>100% Free Gaming Account</strong> चुनें — दोनों आगे चलकर एक ही ID से अपग्रेड हो सकते हैं।
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => (onRegisterWithMode ? onRegisterWithMode('business', 'EMO', 10) : onSelectTab('register'))}
                  className="btn-3d px-5 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Join Income Under {referralSponsor.sponsorName.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (onRegisterWithMode ? onRegisterWithMode('gamer') : onSelectTab('register'))}
                  className="btn-3d px-4 py-3 rounded-lg bg-white hover:bg-blue-50 text-[#2874f0] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Join Free Gaming Pass</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMoreModalOpen(true)}
                  className="btn-3d px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-4 h-4 text-[#ffe500]" />
                  <span>⋯ More</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white text-[#212121] rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2874f0] to-indigo-700 text-white font-black text-xl flex items-center justify-center overflow-hidden shrink-0">
                  {referralSponsor.avatar ? (
                    <img src={referralSponsor.avatar} alt={referralSponsor.sponsorName} className="w-full h-full object-cover" />
                  ) : (
                    referralSponsor.sponsorName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-[#388e3c] uppercase block">✓ Verified Sponsor</span>
                  <h3 className="font-black text-base text-[#212121] truncate">{referralSponsor.sponsorName}</h3>
                  <p className="text-xs font-mono text-[#2874f0] truncate">
                    ID: {referralSponsor.sponsorId}
                    {referralSponsor.sponsorUsername ? ` · @${referralSponsor.sponsorUsername}` : ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Active Plan</span>
                  <strong className="text-[#2874f0] font-black">{referralSponsor.chosenServiceCode}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Level</span>
                  <strong className="text-[#fb641b] font-black">Lv.{referralSponsor.gameLevel || 1}</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenKnowIncome?.()}
                className="btn-3d w-full py-2.5 rounded-lg bg-[#ffe500] text-[#212121] font-black text-xs cursor-pointer"
              >
                ✨ सभी 10 Earning Plans Popup में देखें
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MODE 4: NEW VISITOR (CLEAN, ATTRCTIVE, ESSENTIAL-BUTTONS ONLY) */}
      {!currentUser && !referralSponsor && (
        <section className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="bg-gradient-to-r from-[#2874f0] to-[#1a56db] text-white p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ffe500] text-[#212121] text-[11px] font-black uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ESP Official · Legal &amp; Direct Selling Compliant</span>
              </div>
              <h1 className="font-display text-fluid-hero font-black text-white leading-tight [text-wrap:balance]">
                EARNING SYSTEM PLATFORM (ESP)
              </h1>
              <p className="text-fluid-body text-blue-100 leading-relaxed max-w-xl">
                सिर्फ जरूरी विकल्प सामने, बाकी सब एक क्लिक पॉपअप में — मात्र ₹10 से अर्निंग शुरू करें या मुफ्त Gaming Club जॉइन करें।
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => (onRegisterWithMode ? onRegisterWithMode('business', 'EMO', 10) : onSelectTab('register'))}
                  className="btn-3d px-5 py-3 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Join Income Plan (₹10+)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => (onRegisterWithMode ? onRegisterWithMode('gamer') : onSelectTab('register'))}
                  className="btn-3d px-4 py-3 rounded-lg bg-white hover:bg-blue-50 text-[#2874f0] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Free Gaming Pass</span>
                </button>
                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="btn-3d px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 text-white border border-white/35 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Member Login</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMoreModalOpen(true)}
                  className="btn-3d px-4 py-3 rounded-lg bg-[#ffe500] text-[#212121] font-black text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Grid className="w-4 h-4" />
                  <span>⋯ More</span>
                </button>
              </div>
            </div>

            {/* Right Clean Single-ID Trust Card */}
            <div className="lg:col-span-5 bg-white text-[#212121] rounded-xl p-4 sm:p-5 shadow-md space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-[#2874f0] uppercase">1 ID · Both Systems Sync</span>
                <span className="text-xs font-bold text-[#388e3c] tabular-nums">● {realOnlineCount} Online Now</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenKnowIncome?.()}
                className="btn-3d w-full p-3 rounded-lg bg-[#f5f8ff] hover:bg-blue-100/70 border border-blue-200 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-[#388e3c] flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-[#212121]">Income System Popup जानें</p>
                    <p className="text-slate-600">10 प्लान्स, 50% रेफरल और ₹50 UPI पेआउट</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#2874f0] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => onOpenKnowGaming?.()}
                className="btn-3d w-full p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-black text-[#212121]">Gaming &amp; Voice Club जानें</p>
                    <p className="text-slate-600">12+ गेम्स, रूम, डेली स्ट्रीक &amp; Same-ID अपग्रेड</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-700 shrink-0" />
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  Founder: <strong className="text-[#212121]">{settings.ownerName}</strong> ({settings.ownerSponsorId})
                </span>
                <span className="inline-flex items-center gap-1 text-[#388e3c] font-bold">
                  <Lock className="w-3 h-3" /> Single-ID Safe
                </span>
              </div>
            </div>
          </div>

          {/* 4-Metric Trust Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white text-xs">
            <div className="p-3.5 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#388e3c] shrink-0" />
              <div>
                <p className="font-bold text-[#212121]">100% Legal &amp; Safe</p>
                <p className="text-[11px] text-[#878787]">Direct Selling Rules 2021</p>
              </div>
            </div>
            <div className="p-3.5 flex items-center gap-3">
              <Coins className="w-5 h-5 text-[#fb641b] shrink-0" />
              <div>
                <p className="font-bold text-[#212121] tabular-nums">Starts ₹10 Only</p>
                <p className="text-[11px] text-[#878787]">No Hidden Charges</p>
              </div>
            </div>
            <div className="p-3.5 flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-[#2874f0] shrink-0" />
              <div>
                <p className="font-bold text-[#212121]">SWI 3.3% Recharge App</p>
                <p className="text-[11px] text-[#878787]">₹300 Plan · 50% Ref</p>
              </div>
            </div>
            <div className="p-3.5 flex items-center gap-3">
              <Users className="w-5 h-5 text-[#388e3c] shrink-0" />
              <div>
                <p className="font-bold text-[#212121]">Same-ID Cross Upgrade</p>
                <p className="text-[11px] text-[#878787]">Admin Verified Only</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================================== */}
      {/* CLEAN ESSENTIAL QUICK POPUP BAR (ONLY 4 CORE BUTTONS + MORE POPUP)       */}
      {/* ======================================================================== */}
      <section className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => (onOpenKnowIncome ? onOpenKnowIncome() : setServicesModalOpen(true))}
            className="btn-3d p-3 rounded-lg bg-[#f5f8ff] border border-blue-200 text-left flex items-center gap-2.5 cursor-pointer"
          >
            <Briefcase className="w-5 h-5 text-[#fb641b] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-[#212121] block truncate">
                {isGamer ? 'Upgrade Same ID' : 'Income Plans Popup'}
              </span>
              <span className="text-[10.5px] text-slate-600 block truncate">10 Plans · ₹10+</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => (onOpenKnowGaming ? onOpenKnowGaming() : onSelectTab('gaming-room'))}
            className="btn-3d p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-left flex items-center gap-2.5 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5 text-indigo-700 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-[#212121] block truncate">Gaming System Popup</span>
              <span className="text-[10.5px] text-slate-600 block truncate">Games &amp; Voice Stage</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCalculatorModalOpen(true)}
            className="btn-3d p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-left flex items-center gap-2.5 cursor-pointer"
          >
            <Calculator className="w-5 h-5 text-[#388e3c] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-[#212121] block truncate">Income Calculator</span>
              <span className="text-[10.5px] text-slate-600 block truncate">कमाई कैलकुलेटर पॉपअप</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMoreModalOpen(true)}
            className="btn-3d p-3 rounded-lg bg-[#ffe500] border border-amber-300 text-left flex items-center gap-2.5 cursor-pointer"
          >
            <Grid className="w-5 h-5 text-[#212121] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-[#212121] block truncate">⋯ More Options</span>
              <span className="text-[10.5px] text-slate-800 block truncate">FAQ, NWI, Chat &amp; Legal</span>
            </div>
          </button>
        </div>
      </section>

      {/* ======================================================================== */}
      {/* CLEAN CLICK-TO-POPUP 10 SERVICES CATALOG (COMPACT GRID + MORE BUTTON)    */}
      {/* ======================================================================== */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-fluid-title font-black text-[#212121]">
              ESP Service Plans (किसी भी प्लान पर क्लिक करें)
            </h2>
            <p className="text-xs text-[#878787]">
              हर कार्ड पर क्लिक करने पर उसका पूरा सिस्टम पॉपअप में खुलेगा
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'task', label: 'App/Task' },
              { id: 'direct', label: 'Direct' },
              { id: 'passive', label: 'NWI' },
              { id: 'team', label: 'Team' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCatalogFilter(tab.id)}
                className={`btn-3d px-3 py-1.5 rounded text-xs font-bold cursor-pointer ${
                  catalogFilter === tab.id
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-[#f9fafb]">
          {visibleServices.map((srv, idx) => (
            <button
              key={srv.id}
              type="button"
              onClick={() => setServicePreviewPopup(srv)}
              className="btn-3d bg-white rounded-xl p-4 border border-slate-200 hover:border-[#2874f0] text-left flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full text-xs">
                <span className="font-bold text-[#878787]">
                  0{idx + 1} · {srv.code}
                </span>
                <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-[10.5px] font-black px-2 py-0.5 rounded tabular-nums">
                  <span>{srv.referralBonusPercent}% Bonus</span>
                  <Star className="w-2.5 h-2.5 fill-white" />
                </span>
              </div>
              <div>
                <h3 className="font-black text-[#212121] text-sm leading-snug">{srv.name}</h3>
                <p className="text-xs text-[#2874f0] font-semibold mt-0.5">{srv.hindiName}</p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {srv.hindiDescription || srv.description}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                <span className="text-base font-black text-[#212121] tabular-nums">
                  ₹{srv.defaultFee}+
                </span>
                <span className="text-xs font-black text-[#fb641b] inline-flex items-center gap-1">
                  <span>Open Popup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {filteredServices.length > 6 && (
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllServices(prev => !prev)}
              className="btn-3d px-4 py-2 rounded-lg bg-[#f5f8ff] text-[#2874f0] border border-blue-200 text-xs font-black cursor-pointer"
            >
              {showAllServices ? 'कम प्लान दिखाएं' : `⋯ More Plans देखें (${filteredServices.length} Total)`}
            </button>
            <button
              type="button"
              onClick={() => setMoreModalOpen(true)}
              className="btn-3d px-4 py-2 rounded-lg bg-slate-100 text-[#212121] text-xs font-bold cursor-pointer"
            >
              ⋯ More Tools
            </button>
          </div>
        )}
      </section>

      {/* ======================================================================== */}
      {/* DEDICATED POPUP MODALS FOR SERVICE DETAIL, CALCULATOR & MORE OPTIONS     */}
      {/* ======================================================================== */}
      {servicePreviewPopup && (
        <div className="fixed inset-0 z-[95] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="esp-popup-card max-w-lg bg-white border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#2874f0] to-[#1d4ed8] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
                  {servicePreviewPopup.code} · {servicePreviewPopup.referralBonusPercent}% Sponsor Commission
                </span>
                <h3 className="text-fluid-title font-black mt-1">{servicePreviewPopup.name}</h3>
                <p className="text-xs text-blue-100">{servicePreviewPopup.hindiName}</p>
              </div>
              <button
                type="button"
                onClick={() => setServicePreviewPopup(null)}
                className="btn-3d p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-3 text-[#212121] overflow-y-auto">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {servicePreviewPopup.hindiDescription || servicePreviewPopup.description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Fee Tiers</span>
                  <strong className="text-[#2874f0]">₹{servicePreviewPopup.joiningFeeTiers.join(', ₹')}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Est. Potential</span>
                  <strong className="text-[#388e3c]">{servicePreviewPopup.dailyEarningEst}</strong>
                </div>
              </div>
              {servicePreviewPopup.features?.length > 0 && (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {servicePreviewPopup.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#388e3c] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setServicePreviewPopup(null);
                      onOpenKnowIncome?.();
                    }}
                    className="btn-3d flex-1 py-2.5 px-4 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
                  >
                    Same ID से {servicePreviewPopup.code} अपग्रेड करें
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const srv = servicePreviewPopup;
                      setServicePreviewPopup(null);
                      onSelectServiceForRegistration(srv.code, srv.defaultFee);
                    }}
                    className="btn-3d flex-1 py-2.5 px-4 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
                  >
                    {servicePreviewPopup.code} (₹{servicePreviewPopup.defaultFee}+) जॉइन करें
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const code = servicePreviewPopup.code;
                    setServicePreviewPopup(null);
                    onSelectServiceCode?.(code);
                    onSelectTab('service-detail');
                  }}
                  className="btn-3d py-2.5 px-3.5 rounded-lg bg-slate-100 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  ⋯ Full Page Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {calculatorModalOpen && (
        <div className="fixed inset-0 z-[95] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="esp-popup-card max-w-md bg-white border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-[#2874f0] to-[#1e40af] text-white p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-[#ffe500] uppercase">Income Estimator Popup</span>
                <h3 className="text-base font-black">संभावित मासिक कमाई कैलकुलेटर</h3>
              </div>
              <button
                type="button"
                onClick={() => setCalculatorModalOpen(false)}
                className="btn-3d p-1.5 rounded-full bg-white/15 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-5 space-y-4 text-[#212121]">
              <div>
                <label className="text-xs font-bold block mb-1.5">प्लान टियर चुनें:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 300].map(fee => (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => setCalcTier(fee)}
                      className={`btn-3d py-2 rounded text-xs font-black border cursor-pointer ${
                        calcTier === fee
                          ? 'bg-[#2874f0] text-white border-[#2874f0]'
                          : 'bg-white text-[#212121] border-slate-300'
                      }`}
                    >
                      ₹{fee}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>डायरेक्ट रेफरल्स:</span>
                  <span className="text-[#2874f0]">{calcReferrals} Members</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="1"
                  value={calcReferrals}
                  onChange={e => setCalcReferrals(Number(e.target.value))}
                  className="w-full accent-[#2874f0] cursor-pointer"
                />
              </div>
              <div className="bg-[#f5f8ff] border border-blue-200 rounded-lg p-3.5 space-y-1">
                <p className="text-[11px] font-bold text-[#878787] uppercase">अनुमानित मासिक कमाई</p>
                <p className="text-2xl font-black text-[#212121] tabular-nums">
                  ₹{Math.round(totalProjected).toLocaleString('en-IN')}
                </p>
                <div className="flex justify-between text-xs text-slate-600 pt-1 border-t border-blue-100">
                  <span>डायरेक्ट बोनस: <strong className="text-[#388e3c]">₹{Math.round(estimatedDirectReward)}</strong></span>
                  <span>~₹{Math.round(totalProjected / 30)}/दिन</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCalculatorModalOpen(false);
                  if (currentUser) onOpenKnowIncome?.();
                  else onSelectServiceForRegistration('EMO', calcTier);
                }}
                className="btn-3d w-full py-2.5 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
              >
                {currentUser ? 'Same ID से अपग्रेड खोलें' : `₹${calcTier} प्लान से अभी जुड़ें`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overflow Tools & Info Modal */}
      <MoreOptionsPopupModal
        isOpen={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        title="ESP · More Options & Information"
        subtitle="सभी अतिरिक्त सेवाएं, नियम व हेल्पडेस्क"
        items={moreItems}
      />

      {/* Shared Supporting Popups */}
      <ServicesPopUpModal
        isOpen={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        currentUser={currentUser}
        onSelectServiceForRegistration={(code, fee) => {
          if (onSelectServiceCode) onSelectServiceCode(code);
          onSelectServiceForRegistration(code, fee);
          onSelectTab('register');
        }}
        onSelectServiceCode={onSelectServiceCode}
      />

      <HelplineModal
        isOpen={helplineModalOpen}
        onClose={() => setHelplineModalOpen(false)}
        settings={settings}
      />

      <HomeSliderPopupModal
        photos={sliderPhotos}
        isOpen={sliderPopupOpen}
        onClose={() => setSliderPopupOpen(false)}
      />

      <AboutUsModal
        isOpen={aboutUsOpen}
        onClose={() => setAboutUsOpen(false)}
        settings={settings}
      />

      <ContactUsModal
        isOpen={contactUsOpen}
        onClose={() => setContactUsOpen(false)}
        settings={settings}
        currentUser={currentUser}
      />

      <FaqModal
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
      />

      <PrivacyTermsModal
        isOpen={privacyTermsOpen}
        onClose={() => setPrivacyTermsOpen(false)}
        initialTab={privacyTab}
      />
    </div>
  );
};
