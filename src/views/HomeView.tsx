import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Coins,
  MessageCircle,
  Zap,
  Scale,
  LogIn,
  Gamepad2,
  PhoneCall,
  Briefcase,
  Camera,
  Crown,
  Grid,
  Calculator,
  HelpCircle,
  Info,
  FileText,
  X,
  Settings,
  Compass,
  UserPlus,
  Keyboard,
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
  isAdmin?: boolean;
  referralSponsor?: PublicSponsorPreview | null;
  isLoginModalOpen?: boolean;
  onSelectTab: (tab: string) => void;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  onOpenLegalModal?: () => void;
  onSelectServiceCode?: (code: string) => void;
  onOpenLogin?: () => void;
  onOpenAdminLogin?: () => void;
  onOpenJoinPopup?: () => void;
  onOpenNewVisitorPopup?: () => void;
  onOpenKnowIncome?: () => void;
  onOpenKnowGaming?: () => void;
  onOpenTypingAcademy?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  currentUser,
  isAdmin = false,
  referralSponsor,
  isLoginModalOpen = false,
  onSelectTab,
  onSelectServiceForRegistration,
  onOpenLegalModal,
  onSelectServiceCode,
  onOpenLogin,
  onOpenAdminLogin,
  onOpenJoinPopup,
  onOpenNewVisitorPopup,
  onOpenKnowIncome,
  onOpenKnowGaming,
  onOpenTypingAcademy,
}) => {
  const [calcTier, setCalcTier] = useState<number>(100);
  const [calcReferrals, setCalcReferrals] = useState<number>(10);

  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false);

  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [contactUsOpen, setContactUsOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [privacyTermsOpen, setPrivacyTermsOpen] = useState(false);
  const [privacyTab, setPrivacyTab] = useState<'privacy' | 'terms' | 'disclaimer'>('privacy');

  const [sliderPhotos, setSliderPhotos] = useState<HomeSliderPhoto[]>([]);
  const [sliderPopupOpen, setSliderPopupOpen] = useState<boolean>(false);

  useEffect(() => {
    api.getHomeSliderPhotos().then(photos => {
      setSliderPhotos(photos);
      if (photos && photos.length > 0 && currentUser && !isLoginModalOpen) {
        setSliderPopupOpen(true);
      }
    });
  }, [currentUser?.userId, isLoginModalOpen]);

  const isGamer = currentUser?.accountType === 'gamer';
  const planTheme = getPlanVisualTheme(currentUser?.chosenServiceCode, currentUser?.accountType);

  const estimatedDirectReward = calcTier * 0.5 * calcReferrals;
  const totalProjected = estimatedDirectReward + calcTier * 1.5 * 30;

  const moreItems: MoreOptionItem[] = [
    ...(onOpenNewVisitorPopup
      ? [
          {
            id: 'visitor-guide',
            label: 'New Visitor Guide Popup',
            subLabel: 'प्लान, गेमिंग, SWI व स्पॉन्सर रिजल्ट देखें',
            icon: <Compass className="w-4 h-4 text-[#2874f0]" />,
            badge: 'Guide',
            onClick: () => onOpenNewVisitorPopup(),
          },
        ]
      : []),
    ...(onOpenKnowIncome
      ? [
          {
            id: 'know-income',
            label: isGamer ? 'Upgrade Same ID to Earning' : 'Income System Guide Popup',
            subLabel: isGamer ? 'उसी ID पर ₹10+ से कमाई शुरू करें' : 'सभी 10 प्लान व UPI निकासी की जानकारी',
            icon: <Briefcase className="w-4 h-4 text-[#fb641b]" />,
            onClick: () => onOpenKnowIncome(),
          },
        ]
      : []),
    ...(onOpenKnowGaming
      ? [
          {
            id: 'know-gaming',
            label: 'Gaming & Voice Club Popup',
            subLabel: '16+ गेम्स, वॉइस स्टेज व रिवॉर्ड्स',
            icon: <Gamepad2 className="w-4 h-4 text-indigo-700" />,
            onClick: () => onOpenKnowGaming(),
          },
        ]
      : []),
    ...(onOpenTypingAcademy
      ? [
          {
            id: 'typing-academy',
            label: 'ESP Typing Academy',
            subLabel: '15 पाठ, 60s WPM टेस्ट व फिंगर गाइड',
            icon: <Keyboard className="w-4 h-4 text-[#2874f0]" />,
            badge: 'Skill Lab',
            onClick: () => onOpenTypingAcademy(),
          },
        ]
      : []),
    {
      id: 'all-plans',
      label: 'All 10 Services Explorer',
      subLabel: 'EMO, MMO, MOM, SWI 3.3% App, NWI',
      icon: <Zap className="w-4 h-4 text-[#fb641b]" />,
      badge: '10 Plans',
      onClick: () => setServicesModalOpen(true),
    },
    {
      id: 'calc',
      label: 'Income Calculator Popup',
      subLabel: 'प्लान व रेफरल कमाई की तुरंत गणना करें',
      icon: <Calculator className="w-4 h-4" />,
      onClick: () => setCalculatorModalOpen(true),
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
      id: 'helpline',
      label: '24x7 Helpline Popup',
      subLabel: 'तुरंत ग्राहक सहायता प्राप्त करें',
      icon: <PhoneCall className="w-4 h-4 text-[#2874f0]" />,
      onClick: () => setHelplineModalOpen(true),
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
    <div className="min-h-[calc(100dvh-6.5rem)] flex flex-col justify-center py-4 sm:py-8 w-full max-w-5xl mx-auto overflow-x-hidden font-sans">
      {/* ======================================================================== */}
      {/* LOGGED-OUT CLEAN GATEWAY: ONLY LOGIN · REG/JOIN · ADMIN · VISITOR · MORE */}
      {/* ======================================================================== */}
      {!currentUser && (
        <section className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className="bg-gradient-to-br from-[#2874f0] via-[#1d5ed6] to-[#0f3f9c] text-white p-6 sm:p-10 text-center space-y-5">
            {referralSponsor ? (
              <p className="text-xs sm:text-sm font-bold text-[#ffe500]">
                ✓ Verified Referral Link · Sponsor: {referralSponsor.sponsorName} ({referralSponsor.sponsorId})
              </p>
            ) : (
              <p className="text-xs sm:text-sm font-semibold text-blue-100">
                Official Portal · Earning &amp; Gaming Hub
              </p>
            )}

            <h1 className="font-display text-fluid-hero font-black tracking-tight text-white [text-wrap:balance]">
              EARNING SYSTEM PLATFORM
            </h1>

            <p className="text-fluid-body text-blue-100 max-w-xl mx-auto leading-relaxed">
              नीचे दिए मुख्य विकल्पों में से चुनें — आपके चयन का पूरा परिणाम तुरंत पॉपअप में खुलेगा।
            </p>

            {/* ONLY THE 5 REQUESTED PRIMARY BUTTONS */}
            <div className="pt-2 grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => onOpenLogin?.()}
                className="btn-3d px-4 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#2874f0] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenJoinPopup ? onOpenJoinPopup() : onSelectTab('register'))}
                className="btn-3d px-4 py-3.5 rounded-xl bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 shrink-0" />
                <span>Reg / Join</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAdmin) onSelectTab('admin');
                  else onOpenAdminLogin?.();
                }}
                className="btn-3d px-4 py-3.5 rounded-xl bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Admin Control</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenNewVisitorPopup ? onOpenNewVisitorPopup() : onOpenKnowIncome?.())}
                className="btn-3d px-4 py-3.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>New Visitor</span>
              </button>

              <button
                type="button"
                onClick={() => setMoreModalOpen(true)}
                className="btn-3d px-4 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/35 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer min-[420px]:col-span-2 lg:col-span-1"
              >
                <Grid className="w-4 h-4 text-[#ffe500] shrink-0" />
                <span>⋯ More</span>
              </button>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#f8fafc] border-t border-slate-200 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
            <span>10 Earning Services (₹10+)</span>
            <span aria-hidden="true">·</span>
            <span>Free Gaming Club (₹0)</span>
            <span aria-hidden="true">·</span>
            <span>Same-ID Upgrade Verified in Admin</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setMoreModalOpen(true)}
              className="text-[#2874f0] font-bold hover:underline cursor-pointer"
            >
              System Menu खोलें →
            </button>
          </div>
        </section>
      )}

      {/* ======================================================================== */}
      {/* LOGGED-IN USER CLEAN PORTAL: PERSONALIZED BY FREE GAMING VS PLAN THEME   */}
      {/* ======================================================================== */}
      {currentUser && isGamer && (
        <section className="rounded-2xl overflow-hidden border border-indigo-200 shadow-sm bg-white">
          <div className="bg-gradient-to-r from-[#6d28d9] via-[#4f46e5] to-[#2563eb] text-white p-6 sm:p-9 space-y-4">
            <p className="text-xs font-bold text-[#ffe500]">
              Free Gaming Player · ID: {currentUser.userId} · Coins: {(currentUser.coins || 0).toLocaleString()}
            </p>
            <h1 className="font-display text-fluid-hero font-black leading-tight">
              नमस्ते {currentUser.fullName.split(' ')[0]}! आपका Gaming Portal तैयार है
            </h1>
            <p className="text-fluid-body text-indigo-100 max-w-2xl">
              गेम्स व वॉइस रूम खेलें या अपनी इसी ID ({currentUser.userId}) से ₹10+ Income Plan पर अपग्रेड करें। बाकी सभी टूल्स System Menu (`More`) में उपलब्ध हैं।
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onSelectTab('gaming-room')}
                className="btn-3d px-5 py-3 rounded-xl bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Gaming Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => (onOpenKnowIncome ? onOpenKnowIncome() : onSelectTab('dashboard'))}
                className="btn-3d px-4 py-3 rounded-xl bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>Upgrade Same ID (₹10+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) onSelectTab('admin');
                  else onOpenAdminLogin?.();
                }}
                className="btn-3d px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Control</span>
              </button>
              <button
                type="button"
                onClick={() => setMoreModalOpen(true)}
                className="btn-3d px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Grid className="w-4 h-4 text-[#ffe500]" />
                <span>⋯ More</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {currentUser && !isGamer && (
        <section className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div className={`bg-gradient-to-r ${planTheme.heroGradient} text-white p-6 sm:p-9 space-y-4`}>
            <p className="text-xs font-bold text-[#ffe500]">
              {planTheme.tierBadge} · ID: {currentUser.userId} · Wallet: ₹{currentUser.balance}
            </p>
            <h1 className="font-display text-fluid-hero font-black leading-tight">
              {planTheme.headline}
            </h1>
            <p className="text-fluid-body text-white/90 max-w-2xl">
              {planTheme.hindiSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className="btn-3d px-5 py-3 rounded-xl bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>My {currentUser.chosenServiceCode || 'EMO'} Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => (onOpenKnowGaming ? onOpenKnowGaming() : onSelectTab('gaming-room'))}
                className="btn-3d px-4 py-3 rounded-xl bg-white hover:bg-blue-50 text-[#2874f0] font-black text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play Gaming (Same ID)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isAdmin) onSelectTab('admin');
                  else onOpenAdminLogin?.();
                }}
                className="btn-3d px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Control</span>
              </button>
              <button
                type="button"
                onClick={() => setMoreModalOpen(true)}
                className="btn-3d px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Grid className="w-4 h-4 text-[#ffe500]" />
                <span>⋯ More</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Calculator Popup Modal (Opened from More / System Menu) */}
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
                  <span className="text-[#2874f0] tabular-nums">{calcReferrals} Members</span>
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

      {/* System Menu / More Popup */}
      <MoreOptionsPopupModal
        isOpen={moreModalOpen}
        onClose={() => setMoreModalOpen(false)}
        title="System Menu · More"
        subtitle="सभी अतिरिक्त सेवाएं, प्लान्स, गेमिंग व सहायता केंद्र"
        items={moreItems}
      />

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
