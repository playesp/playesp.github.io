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
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
} from 'lucide-react';
import type { PlatformSettings, ServiceItem, UserProfile, HomeSliderPhoto } from '../types/index.ts';
import { ServicesPopUpModal } from '../components/ServicesPopUpModal.tsx';
import { HelplineModal } from '../components/HelplineModal.tsx';
import { HomeSliderPopupModal } from '../components/HomeSliderPopupModal.tsx';
import { AboutUsModal } from '../components/AboutUsModal.tsx';
import { ContactUsModal } from '../components/ContactUsModal.tsx';
import { FaqModal } from '../components/FaqModal.tsx';
import { PrivacyTermsModal } from '../components/PrivacyTermsModal.tsx';
import { api } from '../services/api.ts';

interface HomeViewProps {
  settings: PlatformSettings;
  services: ServiceItem[];
  currentUser?: UserProfile | null;
  isLoginModalOpen?: boolean;
  onSelectTab: (tab: string) => void;
  onSelectServiceForRegistration: (serviceCode: string, fee: number) => void;
  onOpenLegalModal?: () => void;
  onSelectServiceCode?: (code: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onOpenLogin?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  services,
  currentUser,
  isLoginModalOpen = false,
  onSelectTab,
  onSelectServiceForRegistration,
  onOpenLegalModal,
  onSelectServiceCode,
  onUpdateUser,
  onOpenLogin,
}) => {
  const [calcTier, setCalcTier] = useState<number>(100);
  const [calcReferrals, setCalcReferrals] = useState<number>(10);
  const [catalogFilter, setCatalogFilter] = useState<string>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);

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

  const estimatedDirectReward = calcTier * 0.5 * calcReferrals;
  const estimatedTaskMonthly = calcTier * 1.5 * 30;
  const totalProjected = estimatedDirectReward + estimatedTaskMonthly;

  const whatsappDirectUrl = `https://api.whatsapp.com/send?phone=91${settings.whatsappNumber}&text=${encodeURIComponent(
    'नमस्ते Santosh Ji / Vikas Ji, मैं ESP प्लेटफॉर्म से जुड़ना चाहता हूँ।'
  )}`;

  const FAQ_LIST = [
    {
      q: 'EARNING SYSTEM PLATFORM (ESP) क्या है और यह कैसे कार्य करता है?',
      a: 'ESP एक डिजिटल अर्निंग एवं गेमिंग प्लेटफॉर्म है जहाँ सदस्य 10 पारदर्शी सर्विसेज (EMO, MMO, MOM, OES, MMS, NWI, SWI 3.3% ऐप, TWI, PROMOTE, REFER) और ESP Gaming Room के माध्यम से घर बैठे आय कमा सकते हैं।'
    },
    {
      q: 'शुरुआत करने के लिए न्यूनतम जॉइनिंग चार्ज कितना है?',
      a: 'ESP में बिजनेस/अर्निंग जॉइनिंग मात्र ₹10 से शुरू होती है और गेमर पास 100% मुफ्त है।'
    },
    {
      q: 'SWI 3.3% रिचार्ज ऐप प्लान और NWI 3-लेवल इनकम कैसे काम करते हैं?',
      a: 'SWI (₹300) प्लान में 50% (₹150) रेफरल कमीशन और सत्यापन के बाद एडमिन द्वारा 3.3% स्पेशल रिचार्ज ऐप लिंक डैशबोर्ड में मिलता है। NWI में आपके नीचे बनने वाली वास्तविक 3-लेवल टीम से L1: 10%, L2: 15% और L3: 25% पैसिव इनकम प्राप्त होती है।'
    },
    {
      q: 'भुगतान (Payout) और डिजिटल आईडी कार्ड कैसे मिलता है?',
      a: 'कमाई सीधे आपकी UPI ID (PhonePe, GPay, Paytm) में भेजी जाती है (न्यूनतम ₹50)। पंजीकरण होते ही रोल नंबर और डिजिटल आईडी कार्ड तुरंत जारी हो जाता है।'
    },
  ];

  const getOfficialListName = (code: string, idx: number) => {
    switch (code) {
      case 'EMO': return 'EARN MONEY ONLINE (EMO)';
      case 'MMO': return 'MAKE MONEY ONLINE (MMO)';
      case 'MOM': return 'MAKE ONLINE MONEY (MOM)';
      case 'OES': return 'ONLINE EARNING SYSTEM (OES)';
      case 'MMS': return 'MONEY MAKING SYSTEM (MMS)';
      case 'NWI': return 'NON WORKING INCOME (NWI)';
      case 'SWI': return 'SELF WORKING INCOME (SWI)';
      case 'TWI': return 'TEAM WORKING INCOME (TWI)';
      case 'PROMOTE': return 'PROMOTE & EARN';
      case 'REFER': return 'REFER & EARN';
      default: return `${idx + 1}. ${code}`;
    }
  };

  const filteredServices = services.filter(s => {
    if (catalogFilter === 'all') return true;
    return s.category === catalogFilter;
  });

  return (
    <div className="space-y-4 py-4 pb-16 w-full max-w-7xl mx-auto overflow-x-hidden font-sans">
      {/* ============================================================== */}
      {/* 1. FLIPKART HERO BANNER CARD                                   */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-[#2874f0] to-[#1a56db] text-white p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Campaign Headline & Primary Actions */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#ffe500] uppercase tracking-wide">
                ESP Official Portal · Legal & Direct Selling Compliant
              </p>
              <h1 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight [text-wrap:balance]">
                EARNING SYSTEM PLATFORM (ESP)
              </h1>
              <p className="text-xs sm:text-base text-blue-100 leading-relaxed max-w-xl">
                10 पारदर्शी अर्निंग सर्विसेज, स्व-बिज़नेस पोस्टर स्टूडियो, 3.3% स्पेशल रिचार्ज ऐप, रियल 3-लेवल NWI पैसिव इनकम और लाइव ESP Gaming Time।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTab('dashboard')}
                    className="px-6 py-3 rounded-xs bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <span>Open My Dashboard ({currentUser.userId})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('gaming-room')}
                    className="px-6 py-3 rounded-xs bg-white hover:bg-blue-50 text-[#2874f0] font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Play ESP Gaming Time</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelectTab('register')}
                    className="px-6 py-3 rounded-xs bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Join Business Plan (₹10+)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectTab('register')}
                    className="px-5 py-3 rounded-xs bg-white hover:bg-blue-50 text-[#2874f0] font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm cursor-pointer transition"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Free Gamer Pass (0 Coins Start)</span>
                  </button>
                  {onOpenLogin && (
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="px-4 py-3 rounded-xs border border-white/40 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Member Login</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Crisp White Marketplace Trust Panel */}
          <div className="lg:col-span-5 bg-white text-[#212121] rounded-sm p-4 sm:p-5 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-[#2874f0] uppercase">Dual Access System</span>
                <span className="text-xs font-semibold text-[#388e3c] tabular-nums">
                  {realOnlineCount} Online Now
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-emerald-50 text-[#388e3c] flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#212121]">ESP ID · Earning & Sponsor</p>
                  <p className="text-[#666666]">10 सर्विसेज, रेफरल टीम और डायरेक्ट UPI निकासी (Min ₹50)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-blue-50 text-[#2874f0] flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#212121]">GAMING ID · ESP PLAY Room</p>
                  <p className="text-[#666666]">8-सीट वॉइस स्टेज, लूडो, डाइस और कॉइन रिवॉर्ड्स</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-[#666666] gap-2">
              <span className="truncate">
                Founder: <strong className="text-[#212121]">{settings.ownerName}</strong> ({settings.ownerSponsorId})
              </span>
              <a
                href="https://ioisplatform.github.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2874f0] hover:underline font-semibold inline-flex items-center gap-1 shrink-0"
              >
                <span>Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Clean 4-Metric Trust Strip directly beneath Hero */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-white text-xs">
          <div className="p-3.5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#388e3c] shrink-0" />
            <div>
              <p className="font-bold text-[#212121]">100% Legal & Transparent</p>
              <p className="text-[11px] text-[#878787]">Direct Selling Rules 2021</p>
            </div>
          </div>
          <div className="p-3.5 flex items-center gap-3">
            <Coins className="w-5 h-5 text-[#fb641b] shrink-0" />
            <div>
              <p className="font-bold text-[#212121] tabular-nums">Starts ₹10 Only</p>
              <p className="text-[11px] text-[#878787]">Verified Digital ID Card</p>
            </div>
          </div>
          <div className="p-3.5 flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[#2874f0] shrink-0" />
            <div>
              <p className="font-bold text-[#212121]">SWI 3.3% Recharge App</p>
              <p className="text-[11px] text-[#878787] tabular-nums">₹300 Plan · 50% (₹150) Ref</p>
            </div>
          </div>
          <div className="p-3.5 flex items-center gap-3">
            <Users className="w-5 h-5 text-[#388e3c] shrink-0" />
            <div>
              <p className="font-bold text-[#212121] tabular-nums">Direct UPI Min ₹50</p>
              <p className="text-[11px] text-[#878787]">PhonePe / GPay / Paytm</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. QUICK ACTION SHELF (FLIPKART CLEAN ICON TILES)              */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <h2 className="text-sm sm:text-base font-bold text-[#212121]">Quick Access Desk</h2>
          <span className="text-xs text-[#878787]">1-Tap Navigation</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab(currentUser ? 'dashboard' : 'register')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-5 h-5 text-[#fb641b]" />
            <span className="text-xs font-bold text-[#212121]">Join ₹10+</span>
            <span className="text-[10px] text-[#878787]">3-Step Form</span>
          </button>

          <button
            type="button"
            onClick={() => setServicesModalOpen(true)}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-5 h-5 text-[#2874f0]" />
            <span className="text-xs font-bold text-[#212121]">10 Services</span>
            <span className="text-[10px] text-[#878787]">Full Plans</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('nwi')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Crown className="w-5 h-5 text-[#fb641b]" />
            <span className="text-xs font-bold text-[#212121]">NWI Passive</span>
            <span className="text-[10px] text-[#878787]">3-Level Real</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('gaming-room')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Gamepad2 className="w-5 h-5 text-[#2874f0]" />
            <span className="text-xs font-bold text-[#212121]">Gaming Time</span>
            <span className="text-[10px] text-[#878787]">Voice & Games</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('chat-club')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 text-[#388e3c]" />
            <span className="text-xs font-bold text-[#212121]">ESP Chat</span>
            <span className="text-[10px] text-[#878787]">Friends Club</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('moments')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-5 h-5 text-[#2874f0]" />
            <span className="text-xs font-bold text-[#212121]">Moments</span>
            <span className="text-[10px] text-[#878787]">Daily Status</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab(currentUser ? 'dashboard' : 'register')}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-5 h-5 text-[#388e3c]" />
            <span className="text-xs font-bold text-[#212121]">Digital ID</span>
            <span className="text-[10px] text-[#878787]">Verified Card</span>
          </button>

          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] transition text-center flex flex-col items-center gap-1.5"
          >
            <PhoneCall className="w-5 h-5 text-[#388e3c]" />
            <span className="text-xs font-bold text-[#212121]">Helpline</span>
            <span className="text-[10px] text-[#878787]">24x7 Support</span>
          </a>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ALL 10 SERVICES MARKETPLACE CATALOG (FLIPKART PRODUCT GRID) */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#212121]">
              All 10 ESP Earning Services
            </h2>
            <p className="text-xs text-[#878787]">
              स्पष्ट कमीशन, वास्तविक कार्य व लॉस-प्रूफ प्लान चार्ट
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All (10)' },
              { id: 'task', label: 'Tasks & App' },
              { id: 'direct', label: 'Promote & Refer' },
              { id: 'passive', label: 'Passive NWI' },
              { id: 'team', label: 'Team Work' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCatalogFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold transition cursor-pointer ${
                  catalogFilter === tab.id
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onSelectTab('services')}
              className="px-4 py-1.5 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-semibold cursor-pointer"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#f9fafb]">
          {filteredServices.map((srv, idx) => (
            <div
              key={srv.id}
              className="bg-white rounded-sm p-4 sm:p-5 border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Clean Metadata Line (Zero-Pill Discipline) */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#878787] font-semibold">
                    0{idx + 1} · {srv.code}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#388e3c] text-white text-[11px] font-bold px-2 py-0.5 rounded-xs tabular-nums">
                    <span>{srv.referralBonusPercent}% Comm</span>
                    <Star className="w-2.5 h-2.5 fill-white" />
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-[#212121] text-sm sm:text-base leading-snug">
                    {getOfficialListName(srv.code, idx)}
                  </h3>
                  <p className="text-xs text-[#2874f0] font-semibold mt-0.5">{srv.hindiName}</p>
                </div>

                <p className="text-xs text-[#555555] leading-relaxed line-clamp-3">
                  {srv.hindiDescription || srv.description}
                </p>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-[#212121] tabular-nums">
                      ₹{srv.defaultFee}
                    </span>
                    <span className="text-[11px] font-semibold text-[#388e3c] tabular-nums">
                      {srv.dailyEarningEst}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#878787] tabular-nums">
                    Tiers: ₹{srv.joiningFeeTiers.slice(0, 4).join(', ₹')}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectServiceCode) onSelectServiceCode(srv.code);
                    onSelectTab('service-detail');
                  }}
                  className="flex-1 py-2 px-3 rounded-xs text-xs font-semibold text-[#2874f0] bg-white hover:bg-[#f5f8ff] border border-slate-300 transition cursor-pointer"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={() => onSelectServiceForRegistration(srv.code, srv.defaultFee)}
                  className="flex-1 py-2 px-3 rounded-xs text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e8550f] transition cursor-pointer"
                >
                  Start ₹{srv.defaultFee}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. NWI REAL 3-LEVEL INCOME + TRANSPARENT CALCULATOR SHELF      */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: NWI 3-Level Passive Structure */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2 border-b border-slate-200 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#fb641b] uppercase">
                NWI 3-Level Real Downline Passive
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('nwi')}
                className="text-xs font-semibold text-[#2874f0] hover:underline cursor-pointer"
              >
                Open NWI Tree →
              </button>
            </div>
            <h3 className="text-lg font-bold text-[#212121]">
              रियल 3-लेवल डाउनलाइन पैसिव नॉन-वर्किंग इनकम
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              सिस्टम कोई नकली बॉट नहीं जोड़ता — आपके नीचे जुड़ने वाली वास्तविक 3-लेवल टीम से बिना अतिरिक्त काम किए 10%, 15% व 25% पैसिव इनकम सीधे वॉलेट में मिलती है।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-sm bg-[#f5f7fa] border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-[#878787]">LEVEL 1 · REAL TEAM</p>
              <p className="text-xl font-bold text-[#212121] tabular-nums">10%</p>
              <p className="text-xs text-[#388e3c] font-semibold tabular-nums">₹60 (3 members @ ₹200)</p>
            </div>

            <div className="p-3.5 rounded-sm bg-[#f5f7fa] border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-[#878787]">LEVEL 2 · PASSIVE</p>
              <p className="text-xl font-bold text-[#212121] tabular-nums">15%</p>
              <p className="text-xs text-[#2874f0] font-semibold tabular-nums">₹270 (9 members @ ₹200)</p>
            </div>

            <div className="p-3.5 rounded-sm bg-[#f5f7fa] border border-slate-200 space-y-1">
              <p className="text-[11px] font-bold text-[#878787]">LEVEL 3 · PASSIVE</p>
              <p className="text-xl font-bold text-[#212121] tabular-nums">25%</p>
              <p className="text-xs text-[#fb641b] font-semibold tabular-nums">₹1,350 (27 members @ ₹200)</p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#555555]">
            <span>3×3 उदाहरण (₹200 टियर): कुल ₹1,680+ सीधे वॉलेट क्लेम</span>
            <button
              type="button"
              onClick={() => onSelectTab('nwi')}
              className="px-4 py-2 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white font-semibold cursor-pointer"
            >
              Check My NWI Tree
            </button>
          </div>
        </div>

        {/* Right: Transparent Income Estimator */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-[#2874f0] uppercase">Income Estimator</span>
            <h3 className="text-lg font-bold text-[#212121]">संभावित मासिक कमाई कैलकुलेटर</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#555555] block mb-1.5">
                प्लान टियर चुनें (Plan Fee):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 300].map(fee => (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => setCalcTier(fee)}
                    className={`py-2 rounded-xs text-xs font-bold border transition cursor-pointer tabular-nums ${
                      calcTier === fee
                        ? 'bg-[#2874f0] text-white border-[#2874f0]'
                        : 'bg-white text-[#212121] border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    ₹{fee}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#555555] mb-1">
                <span>डायरेक्ट रेफरल्स की संख्या:</span>
                <span className="text-[#2874f0] font-bold tabular-nums">{calcReferrals} Members</span>
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

            <div className="bg-[#f5f8ff] border border-blue-200 rounded-sm p-3.5 space-y-1.5">
              <p className="text-[11px] font-semibold text-[#878787] uppercase">अनुमानित कुल मासिक आय</p>
              <p className="text-2xl font-bold text-[#212121] tabular-nums">
                ₹{Math.round(totalProjected).toLocaleString('en-IN')}
              </p>
              <div className="flex justify-between text-xs text-[#555555] pt-1 border-t border-blue-100 tabular-nums">
                <span>डायरेक्ट बोनस: <strong className="text-[#388e3c]">₹{Math.round(estimatedDirectReward)}</strong></span>
                <span>लगभग ₹{Math.round(totalProjected / 30)}/दिन</span>
              </div>
            </div>

            {!currentUser && (
              <button
                type="button"
                onClick={() => onSelectServiceForRegistration('EMO', calcTier)}
                className="w-full py-2.5 rounded-xs font-bold text-xs text-white bg-[#fb641b] hover:bg-[#e8550f] transition cursor-pointer"
              >
                ₹{calcTier} प्लान से अभी शुरू करें
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. INVITE FRIENDS + TRUST DIRECTORY + FAQ                      */}
      {/* ============================================================== */}
      <section className="bg-white border border-slate-200 rounded-sm p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#212121]">
              Information, Legal Compliance & Help Center
            </h3>
            <p className="text-xs text-[#878787]">
              सरकारी नियम, गोपनीयता नीति, सवाल-जवाब एवं सपोर्ट
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onOpenLegalModal && (
              <button
                type="button"
                onClick={onOpenLegalModal}
                className="px-3.5 py-1.5 rounded-xs text-xs font-semibold bg-[#f5f8ff] text-[#2874f0] border border-blue-200 hover:bg-blue-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Legal Audit Report</span>
              </button>
            )}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                '🎉 ESP (Earning System Platform) जॉइन करें — 10 सर्विसेज (₹10 से) और लाइव गेम्स: https://ioisplatform.github.io/'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xs text-xs font-semibold bg-[#388e3c] hover:bg-[#2e7d32] text-white inline-flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setAboutUsOpen(true)}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] text-left transition cursor-pointer"
          >
            <p className="font-bold text-xs text-[#212121]">About Us</p>
            <p className="text-[11px] text-[#878787] mt-0.5">कंपनी व विज़न</p>
          </button>

          <button
            type="button"
            onClick={() => setContactUsOpen(true)}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] text-left transition cursor-pointer"
          >
            <p className="font-bold text-xs text-[#212121]">Contact Us</p>
            <p className="text-[11px] text-[#878787] mt-0.5">ईमेल व Telegram</p>
          </button>

          <button
            type="button"
            onClick={() => { setPrivacyTab('privacy'); setPrivacyTermsOpen(true); }}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] text-left transition cursor-pointer"
          >
            <p className="font-bold text-xs text-[#212121]">Privacy Policy</p>
            <p className="text-[11px] text-[#878787] mt-0.5">डेटा सुरक्षा</p>
          </button>

          <button
            type="button"
            onClick={() => { setPrivacyTab('terms'); setPrivacyTermsOpen(true); }}
            className="p-3 rounded-sm border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff] text-left transition cursor-pointer"
          >
            <p className="font-bold text-xs text-[#212121]">Terms & Disclaimer</p>
            <p className="text-[11px] text-[#878787] mt-0.5">नियम व शर्तें</p>
          </button>
        </div>

        {/* Clean Accordion FAQ */}
        <div className="pt-2 divide-y divide-slate-200 border border-slate-200 rounded-sm">
          {FAQ_LIST.map((faq, i) => (
            <div key={i} className="bg-white">
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                className="w-full text-left px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#212121] hover:text-[#2874f0] transition cursor-pointer gap-2"
              >
                <span>{faq.q}</span>
                {openFaqIndex === i ? (
                  <ChevronUp className="w-4 h-4 text-[#2874f0] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#878787] shrink-0" />
                )}
              </button>
              {openFaqIndex === i && (
                <div className="px-4 pb-3.5 text-xs text-[#555555] leading-relaxed bg-[#f9fafb] border-t border-slate-100 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
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

      {/* Stationary Flipkart-Styled Verified Tasks Trigger */}
      <button
        type="button"
        onClick={() => onSelectTab(currentUser ? 'dashboard' : 'register')}
        className="fixed bottom-20 lg:bottom-6 right-4 z-30 bg-[#fb641b] hover:bg-[#e8550f] text-white px-4 py-2.5 rounded-sm shadow-lg flex items-center gap-2 cursor-pointer text-xs font-bold transition"
        title="Verified Daily Tasks (+5 Coins & EXP)"
      >
        <Gift className="w-4 h-4" />
        <span className="hidden sm:inline">Tasks (+5 Coins)</span>
      </button>

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
