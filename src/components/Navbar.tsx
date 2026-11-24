import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  User,
  LogOut,
  Lock,
  Menu,
  X,
  Award,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Camera,
  MessageCircle,
  Layers,
  Phone,
  Gamepad2,
  Crown,
  Home,
  Scale,
  Bell,
  Briefcase,
  Radio,
  Settings,
  Grid,
  Coins,
} from 'lucide-react';
import type { UserProfile, PlatformSettings, PublicSponsorPreview } from '../types/index.ts';
import { ServicesPopUpModal } from './ServicesPopUpModal.tsx';
import { HelplineModal } from './HelplineModal.tsx';
import { MoreOptionsPopupModal, type MoreOptionItem } from './SystemPopupModals.tsx';

interface NavbarProps {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  settings: PlatformSettings;
  currentTab: string;
  referralSponsor?: PublicSponsorPreview | null;
  onSelectTab: (tab: string) => void;
  onSelectServiceCode?: (code: string) => void;
  onOpenLogin: () => void;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
  onShowIdCard: () => void;
  onOpenLegalModal?: () => void;
  onOpenKnowIncome?: () => void;
  onOpenKnowGaming?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  settings,
  currentTab,
  referralSponsor,
  onSelectTab,
  onSelectServiceCode,
  onOpenLogin,
  onOpenAdminLogin,
  onLogout,
  onShowIdCard,
  onOpenLegalModal,
  onOpenKnowIncome,
  onOpenKnowGaming,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [morePopupOpen, setMorePopupOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileEarningMenuOpen, setMobileEarningMenuOpen] = useState(false);

  const isGamerOnly = currentUser?.accountType === 'gamer';
  const modePillLabel = currentUser
    ? isGamerOnly
      ? '🎮 Free Gaming'
      : `💼 ${currentUser.chosenServiceCode || 'EMO'} Plan`
    : referralSponsor
    ? `🤝 Ref: ${referralSponsor.sponsorName.split(' ')[0]}`
    : '✨ New Visitor';

  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const morePopupItems: MoreOptionItem[] = [
    {
      id: 'more-services',
      label: 'All 10 Earning Plans',
      subLabel: 'EMO, MMO, SWI 3.3% App, NWI ₹10+',
      icon: <Layers className="w-4 h-4" />,
      badge: '10 Plans',
      onClick: () => setServicesModalOpen(true),
    },
    {
      id: 'more-nwi',
      label: 'NWI 3-Level Passive',
      subLabel: 'L1: 10% · L2: 15% · L3: 25% Auto Tree',
      icon: <Crown className="w-4 h-4 text-[#fb641b]" />,
      onClick: () => onSelectTab('nwi'),
    },
    {
      id: 'more-moments',
      label: 'Moments Feed',
      subLabel: 'डेली स्टेटस व फोटो कम्युनिटी',
      icon: <Camera className="w-4 h-4" />,
      onClick: () => onSelectTab('moments'),
    },
    {
      id: 'more-chat',
      label: 'ESP Chat Club',
      subLabel: 'चैनल, ग्रुप और फ्रेंड्स चैट',
      icon: <MessageCircle className="w-4 h-4 text-[#388e3c]" />,
      onClick: () => onSelectTab('chat-club'),
    },
    ...(currentUser
      ? [
          {
            id: 'more-idcard',
            label: 'Digital ID Card',
            subLabel: `ID: ${currentUser.userId}`,
            icon: <Award className="w-4 h-4 text-[#fb641b]" />,
            onClick: () => onShowIdCard(),
          },
        ]
      : []),
    {
      id: 'more-notices',
      label: 'Notice Board',
      subLabel: 'आधिकारिक सूचना व अपडेट्स',
      icon: <Bell className="w-4 h-4" />,
      onClick: () => setNoticeModalOpen(true),
    },
    {
      id: 'more-helpline',
      label: '24x7 Helpline',
      subLabel: 'WhatsApp व कस्टमर सपोर्ट',
      icon: <Phone className="w-4 h-4 text-[#388e3c]" />,
      onClick: () => setHelplineModalOpen(true),
    },
    ...(onOpenLegalModal
      ? [
          {
            id: 'more-legal',
            label: 'Legal & Compliance',
            subLabel: 'सरकारी नियम व पारदर्शिता रिपोर्ट',
            icon: <Scale className="w-4 h-4" />,
            onClick: () => onOpenLegalModal(),
          },
        ]
      : []),
    {
      id: 'more-portal',
      label: 'Official Portal (GitHub)',
      subLabel: 'playesp.github.io लाइव वेब लिंक',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: () => {
        window.location.href = 'https://playesp.github.io/';
      },
    },
    {
      id: 'more-admin',
      label: isAdmin ? 'Open Admin Panel' : 'Admin Control Login',
      subLabel: 'वेरिफिकेशन व टोटल कंट्रोल सिस्टम',
      icon: <Lock className="w-4 h-4 text-[#fb641b]" />,
      onClick: () => {
        if (isAdmin) onSelectTab('admin');
        else onOpenAdminLogin();
      },
    },
  ];

  const tenServicesList = [
    { code: 'EMO', title: 'EARN MONEY ONLINE (EMO)', subtitle: '50% Direct / 55% Fast · ₹10+', fee: '₹10+', keywords: 'emo earn money online normal fast ₹10' },
    { code: 'MMO', title: 'MAKE MONEY ONLINE (MMO)', subtitle: '55% Direct Commission · ₹50+', fee: '₹50+', keywords: 'mmo make money online ₹50' },
    { code: 'MOM', title: 'MAKE ONLINE MONEY (MOM)', subtitle: '70% Direct Commission · ₹100+', fee: '₹100+', keywords: 'mom make online money 70% ₹100' },
    { code: 'OES', title: 'ONLINE EARNING SYSTEM (OES)', subtitle: '70% 5-Level Matrix · ₹500+', fee: '₹500+', keywords: 'oes online earning system 5 level ₹500' },
    { code: 'MMS', title: 'MONEY MAKING SYSTEM (MMS)', subtitle: '50% Direct + 20% Levels · ₹100+', fee: '₹100+', keywords: 'mms money making system ₹100' },
    { code: 'NWI', title: 'NON WORKING INCOME (NWI)', subtitle: 'Real 3-Level Passive (10% · 15% · 25%)', fee: '₹200+', keywords: 'nwi non working passive 3 level ₹200' },
    { code: 'SWI', title: 'SELF WORKING INCOME (SWI)', subtitle: '3.3% Special Recharge App · 50% (₹150)', fee: '₹300', keywords: 'swi 3.3% recharge app ₹300' },
    { code: 'TWI', title: 'TEAM WORKING INCOME (TWI)', subtitle: 'All-Plan Team & Any-to-Any Refer', fee: '₹100+', keywords: 'twi twis team working cross plan ₹300' },
    { code: 'PROMOTE', title: 'PROMOTE & EARN', subtitle: 'Own Business Poster & Shubhkamna', fee: '₹50+', keywords: 'promote business banner poster shubhkamna ₹50' },
    { code: 'REFER', title: 'REFER & EARN', subtitle: 'Universal Sponsor Code & ₹100+ Upgrade', fee: '₹10+', keywords: 'refer sponsor code upgrade ₹10 ₹100' },
  ];

  const searchableShortcuts = [
    { type: 'tab', tab: 'gaming-room', title: 'ESP PLAY Gaming Room (Voice, Family & Games)', subtitle: '8-Seat Stage, PK, Family, CP & Coins', keywords: 'gaming game ludo bingo voice room play family cp' },
    { type: 'tab', tab: 'nwi', title: 'NWI 3-Level Passive Dashboard', subtitle: 'Track real 3-level downline & claim bonus', keywords: 'nwi tree passive level team' },
    { type: 'tab', tab: 'chat-club', title: 'ESP Chat Club', subtitle: 'Channels, Friends & Group Chat', keywords: 'chat club friends message' },
    { type: 'tab', tab: 'moments', title: 'Moments Daily Status', subtitle: 'Share photos & updates', keywords: 'moments status photos feed' },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchedServices = normalizedQuery
    ? tenServicesList.filter(
        s =>
          s.code.toLowerCase().includes(normalizedQuery) ||
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.subtitle.toLowerCase().includes(normalizedQuery) ||
          s.keywords.includes(normalizedQuery)
      )
    : tenServicesList.slice(0, 5);

  const matchedShortcuts = normalizedQuery
    ? searchableShortcuts.filter(
        s =>
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.subtitle.toLowerCase().includes(normalizedQuery) ||
          s.keywords.includes(normalizedQuery)
      )
    : [];

  const liveNotices = [
    {
      id: 1,
      tag: 'NEW ADMISSION',
      title: 'मात्र ₹10 से प्रवेश प्रारंभ',
      text: 'ESP के सभी 10 अर्निंग कोर्सेज में एडमिशन शुरू। नामांकन पर तुरंत वेरिफाइड डिजिटल आईडी कार्ड प्राप्त करें।',
      actionLabel: 'प्रवेश लें (₹10+)',
      actionTab: 'register',
    },
    {
      id: 2,
      tag: 'SWI 3.3% APP',
      title: 'SWI 3.3% स्पेशल रिचार्ज ऐप (₹300)',
      text: 'SWI प्लान (₹300) पर 50% (₹150) रेफरल कमीशन तथा एडमिन सत्यापन के बाद 3.3% रिचार्ज ऐप लिंक डैशबोर्ड में मिलता है।',
      actionLabel: 'SWI प्लान देखें',
      actionTab: 'service:SWI',
    },
    {
      id: 3,
      tag: 'INSTANT PAYOUT',
      title: 'डायरेक्ट UPI निकासी (न्यूनतम ₹50)',
      text: `अपनी कमाई सीधे PhonePe, GPay या Paytm में सुरक्षित प्राप्त करें। आधिकारिक UPI: ${settings.adminUpiId}`,
      actionLabel: 'मुख्य पृष्ठ देखें',
      actionTab: 'home',
    },
    {
      id: 4,
      tag: 'COMMUNITY',
      title: 'ESP चैटिंग क्लब व मोमेंट्स',
      text: 'मेंबर्स के साथ चैट करने व दैनिक स्टेटस साझा करने के लिए चैट क्लब और मोमेंट्स सक्रिय हैं।',
      actionLabel: 'चैट क्लब खोलें',
      actionTab: 'chat-club',
    },
  ];

  const handleSelectService = (code: string) => {
    if (onSelectServiceCode) onSelectServiceCode(code);
    onSelectTab('service-detail');
    setSearchFocused(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
  };

  const handleNoticeAction = (action: string) => {
    if (action.startsWith('service:')) {
      handleSelectService(action.replace('service:', ''));
      return;
    }
    if (action === 'services') {
      setServicesModalOpen(true);
    } else if (action === 'register' && currentUser) {
      onSelectTab('dashboard');
    } else {
      onSelectTab(action);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchedServices.length > 0) {
      handleSelectService(matchedServices[0].code);
    } else if (matchedShortcuts.length > 0) {
      onSelectTab(matchedShortcuts[0].tab);
      setSearchFocused(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm font-sans">
      {/* ===================== FLIPKART SIGNATURE ROYAL BLUE TOP BAR ===================== */}
      <div className="bg-[#2874f0] text-white">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Flipkart-Style Brand Wordmark + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 rounded text-white hover:bg-white/10 cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => onSelectTab(currentUser ? (isGamerOnly ? 'gaming-room' : 'dashboard') : 'home')}
              className="flex flex-col items-start text-left cursor-pointer group shrink-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base min-[380px]:text-lg sm:text-xl font-extrabold italic tracking-tight text-white whitespace-nowrap">
                  {isGamerOnly ? 'ESP Gaming' : 'ESP Platform'}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black whitespace-nowrap">
                  {modePillLabel}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] italic text-blue-100 leading-none flex items-center gap-1 whitespace-nowrap">
                <span>{isGamerOnly ? 'Gaming Club' : 'Explore'}</span>
                <span className="text-[#ffe500] font-bold">{isGamerOnly ? '🎮 Live' : 'Plus ★'}</span>
              </span>
            </button>
          </div>

          {/* Center: Live Marketplace Search Bar */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder={
                  isGamerOnly
                    ? 'Search Games, Voice Rooms, @Usernames, Daily Tasks...'
                    : 'Search 10 Services, SWI 3.3% App, NWI Passive, Games...'
                }
                className="w-full h-9 pl-4 pr-10 bg-white text-[#212121] placeholder-[#878787] text-xs sm:text-sm rounded-xs shadow-xs focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-0 top-0 h-9 px-3 text-[#2874f0] hover:text-[#1c62d6] cursor-pointer flex items-center justify-center"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {searchFocused && (
              <div className="absolute left-0 right-0 top-10 bg-white border border-slate-200 rounded-sm shadow-xl z-50 overflow-hidden text-[#212121]">
                <div className="px-3 py-1.5 bg-[#f5f7fa] border-b border-slate-200 text-[11px] font-semibold text-[#878787]">
                  {normalizedQuery ? 'Matching Services & Features' : 'Popular Services on ESP'}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {matchedServices.map(srv => (
                    <button
                      key={srv.code}
                      type="button"
                      onClick={() => handleSelectService(srv.code)}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-[#f5f8ff] flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#212121] truncate">{srv.title}</p>
                        <p className="text-[11px] text-[#878787] truncate">{srv.subtitle}</p>
                      </div>
                      <span className="text-xs font-bold text-[#388e3c] tabular-nums shrink-0">{srv.fee}</span>
                    </button>
                  ))}
                  {matchedShortcuts.map(item => (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.tab);
                        setSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-[#f5f8ff] flex items-center justify-between gap-2 cursor-pointer transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#2874f0] truncate">{item.title}</p>
                        <p className="text-[11px] text-[#878787] truncate">{item.subtitle}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#2874f0] shrink-0" />
                    </button>
                  ))}
                  {matchedServices.length === 0 && matchedShortcuts.length === 0 && (
                    <div className="p-4 text-xs text-center text-[#878787]">
                      कोई परिणाम नहीं मिला — "SWI", "NWI", "MOM", या "Games" खोजें
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Clean Single-Line Nav Actions */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            {currentUser ? (
              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="bg-white text-[#2874f0] hover:bg-blue-50 px-2.5 sm:px-4 py-1.5 rounded-xs text-[11px] min-[380px]:text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 shadow-xs cursor-pointer whitespace-nowrap min-h-[34px]"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="max-w-[78px] min-[380px]:max-w-[96px] sm:max-w-[140px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-[min(17rem,calc(100vw-1.25rem))] bg-white border border-slate-200 rounded-sm shadow-xl z-50 text-[#212121] overflow-hidden">
                    <div className="p-3 bg-[#f5f7fa] border-b border-slate-200 space-y-1">
                      <p className="text-xs font-bold text-[#212121] truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-[#878787] font-mono">
                        {isGamerOnly
                          ? `${currentUser.username ? `@${currentUser.username} · ` : ''}GAME: ${currentUser.gamingId || currentUser.userId}`
                          : `ID: ${currentUser.userId} · ₹${currentUser.balance}`}
                      </p>
                      <p className="text-[11px] text-[#388e3c] font-semibold tabular-nums">
                        🪙 Coins: {(currentUser.coins || 0).toLocaleString()} · Lv.{currentUser.gameLevel || 1}
                      </p>
                    </div>
                    <div className="py-1 text-xs">
                      <button
                        type="button"
                        onClick={() => { onSelectTab('gaming-room'); setAccountMenuOpen(false); }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-semibold cursor-pointer"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 text-[#fb641b]" />
                        <span>{isGamerOnly ? 'Game Setup & Lobby' : 'ESP Gaming Time'}</span>
                      </button>

                      {isGamerOnly && (
                        <button
                          type="button"
                          onClick={() => { onSelectTab('gaming-voice'); setAccountMenuOpen(false); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <Radio className="w-3.5 h-3.5 text-[#2874f0]" />
                          <span>My Personal Voice Room</span>
                        </button>
                      )}

                      {isGamerOnly ? (
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#878787]">
                            Earning Setup (Menu)
                          </div>
                          <button
                            type="button"
                            onClick={() => { onSelectTab('dashboard'); setAccountMenuOpen(false); }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-[#2874f0]" />
                            <span>Earning Dashboard (Wallet &amp; Team)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setServicesModalOpen(true); setAccountMenuOpen(false); }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Layers className="w-3.5 h-3.5 text-[#388e3c]" />
                            <span>10 Earning Plans &amp; Services</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { onSelectTab('nwi'); setAccountMenuOpen(false); }}
                            className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5 text-[#fb641b]" />
                            <span>NWI 3-Level Passive Income</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { onSelectTab('dashboard'); setAccountMenuOpen(false); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-[#2874f0]" />
                          <span>My Dashboard</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => { onShowIdCard(); setAccountMenuOpen(false); }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-[#2874f0]" />
                        <span>Digital ID Card</span>
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => { onSelectTab('admin'); setAccountMenuOpen(false); }}
                          className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-semibold text-[#fb641b] cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Admin Panel</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { onLogout(); setAccountMenuOpen(false); }}
                        className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-semibold border-t border-slate-100 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="btn-3d bg-white text-[#2874f0] hover:bg-blue-50 px-3 sm:px-5 py-1.5 rounded-xs text-[11px] min-[380px]:text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap min-h-[34px]"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onSelectTab('register')}
                  className="btn-3d inline-flex items-center gap-1 bg-[#ffe500] hover:bg-yellow-300 px-2.5 sm:px-4 py-1.5 rounded-xs text-[11px] min-[380px]:text-xs sm:text-sm font-black text-[#212121] cursor-pointer whitespace-nowrap min-h-[34px]"
                >
                  <span>Join ₹10+</span>
                </button>
              </div>
            )}

            {/* Clean More Options Popup Button (Shows all extra tools neatly inside a Popup!) */}
            <button
              type="button"
              onClick={() => setMorePopupOpen(true)}
              className="btn-3d inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white border border-white/25 text-[11px] min-[380px]:text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap min-h-[34px] shrink-0"
              title="सभी अतिरिक्त विकल्प (More Options Popup)"
            >
              <Grid className="w-3.5 h-3.5 text-[#ffe500] shrink-0" />
              <span>More</span>
            </button>

            {/* Control Button with Settings Icon */}
            <button
              type="button"
              onClick={() => {
                if (isAdmin) onSelectTab('admin');
                else onOpenAdminLogin();
              }}
              aria-label="Admin Control System"
              title={isAdmin ? 'Open Admin Total Control System' : 'Admin Control Login'}
              className="btn-3d inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white border border-orange-300 text-[11px] min-[380px]:text-xs sm:text-sm font-extrabold cursor-pointer whitespace-nowrap min-h-[34px] shrink-0"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden min-[380px]:inline">Control</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-3 pb-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search services, SWI 3.3% App, NWI, Games..."
              className="w-full h-9 pl-3.5 pr-9 bg-white text-[#212121] placeholder-[#878787] text-xs rounded-xs focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-0 top-0 h-9 px-3 text-[#2874f0] flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ===================== CLEAN ESSENTIAL BAR (MAX 4-5 KEY BUTTONS + MORE POPUP) ===================== */}
      <nav
        aria-label="Essential quick actions"
        className="bg-white border-b border-slate-200 px-2 sm:px-6 overflow-x-auto no-scrollbar"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-max py-1.5">
          {isGamerOnly ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('gaming-room')}
                className={`btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentTab === 'gaming-room'
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-slate-50 text-[#212121] hover:text-[#2874f0]'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Games Lobby</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('gaming-voice')}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-slate-50 text-[#212121] hover:text-[#2874f0] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Radio className="w-3.5 h-3.5 text-[#fb641b]" />
                <span>Voice Room</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenKnowIncome ? onOpenKnowIncome() : onSelectTab('dashboard'))}
                className="btn-3d px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 bg-[#fb641b] text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Know Income &amp; Upgrade Same ID</span>
              </button>

              <button
                type="button"
                onClick={() => setMorePopupOpen(true)}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-blue-50 text-[#2874f0] border border-blue-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>⋯ More</span>
              </button>
            </>
          ) : currentUser ? (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('dashboard')}
                className={`btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentTab === 'dashboard'
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-slate-50 text-[#212121] hover:text-[#2874f0]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>My Dashboard ({currentUser.chosenServiceCode || 'EMO'})</span>
              </button>

              <button
                type="button"
                onClick={() => setServicesModalOpen(true)}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-slate-50 text-[#212121] hover:text-[#2874f0] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Layers className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>10 Plans Popup</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenKnowGaming ? onOpenKnowGaming() : onSelectTab('gaming-room'))}
                className="btn-3d px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-[#2874f0] text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#ffe500]" />
                <span>Know &amp; Play Gaming (Same ID)</span>
              </button>

              <button
                type="button"
                onClick={() => setMorePopupOpen(true)}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-blue-50 text-[#2874f0] border border-blue-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>⋯ More Tools</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className={`btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  currentTab === 'home'
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-slate-50 text-[#212121] hover:text-[#2874f0]'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenKnowIncome ? onOpenKnowIncome() : setServicesModalOpen(true))}
                className="btn-3d px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1.5 bg-[#fb641b] text-white cursor-pointer whitespace-nowrap shrink-0"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Income Plans (₹10+)</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenKnowGaming ? onOpenKnowGaming() : onSelectTab('gaming-room'))}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Free Gaming System</span>
              </button>

              <button
                type="button"
                onClick={() => setMorePopupOpen(true)}
                className="btn-3d px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 bg-blue-50 text-[#2874f0] border border-blue-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>⋯ More</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ===================== MOBILE DRAWER MENU ===================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-3 sm:px-4 pt-3 pb-5 space-y-3 text-[#212121] max-h-[80dvh] overflow-y-auto shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-[#878787] uppercase">
              {isGamerOnly ? '🎮 Gaming & Menu' : 'ESP Menu'}
            </span>
            {currentUser && (
              <span className="text-xs font-bold text-[#388e3c] tabular-nums">
                {isGamerOnly
                  ? `🪙 ${(currentUser.coins || 0).toLocaleString()} Coins`
                  : `Wallet: ₹${currentUser.balance}`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {isGamerOnly ? (
              <>
                <button
                  type="button"
                  onClick={() => { onSelectTab('gaming-room'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-[#fb641b]" />
                  <span>Games Lobby</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('gaming-voice'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-[#2874f0]" />
                  <span>Voice Room</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('chat-club'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#388e3c]" />
                  <span>Chat Club</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('moments'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#2874f0]" />
                  <span>Moments</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#2874f0]" />
                  <span>Home</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('nwi'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-[#fb641b]" />
                  <span>NWI 3-Level</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('gaming-room'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4 text-[#2874f0]" />
                  <span>ESP Gaming</span>
                </button>

                <button
                  type="button"
                  onClick={() => { onSelectTab('chat-club'); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 rounded-sm bg-[#f5f7fa] hover:bg-blue-50 text-xs font-semibold text-left flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#388e3c]" />
                  <span>Chat Club</span>
                </button>
              </>
            )}
          </div>

          {isGamerOnly ? (
            <div className="border border-blue-200 bg-[#f5f8ff] rounded-sm p-3 space-y-2">
              <button
                type="button"
                onClick={() => setMobileEarningMenuOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#2874f0] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>💼 Earning Setup (10 Plans · Dashboard)</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileEarningMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileEarningMenuOpen && (
                <div className="pt-2 border-t border-blue-100 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { onSelectTab('dashboard'); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-2.5 rounded-sm bg-white border border-blue-200 text-xs font-bold text-[#2874f0] text-left cursor-pointer"
                  >
                    💼 Earning Dashboard &amp; Wallet ({currentUser?.userId})
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSelectTab('nwi'); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-2.5 rounded-sm bg-white border border-slate-200 text-xs font-semibold text-[#212121] text-left cursor-pointer"
                  >
                    👑 NWI 3-Level Passive Income
                  </button>
                  <button
                    type="button"
                    onClick={() => { setServicesModalOpen(true); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-2.5 rounded-sm bg-white border border-slate-200 text-xs font-semibold text-[#212121] text-left cursor-pointer"
                  >
                    📊 View All 10 Earning Services
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSelectTab('home'); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-2.5 rounded-sm bg-white border border-slate-200 text-xs font-semibold text-[#212121] text-left cursor-pointer"
                  >
                    🏠 ESP Main Portal Home
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-sm p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#212121]">
                <span>10 Earning Services</span>
                <button
                  type="button"
                  onClick={() => { setServicesModalOpen(true); setMobileMenuOpen(false); }}
                  className="text-xs text-[#2874f0] font-semibold hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {tenServicesList.map(srv => (
                  <button
                    key={srv.code}
                    type="button"
                    onClick={() => handleSelectService(srv.code)}
                    className="w-full py-2 text-left text-xs flex items-center justify-between hover:text-[#2874f0] cursor-pointer"
                  >
                    <span className="font-medium truncate pr-2">{srv.title}</span>
                    <span className="font-bold text-[#388e3c] tabular-nums shrink-0">{srv.fee}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentUser ? (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => { onSelectTab(isGamerOnly ? 'gaming-room' : 'dashboard'); setMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-sm text-xs font-bold bg-[#2874f0] text-white cursor-pointer"
              >
                {isGamerOnly
                  ? `🎮 Open Game Setup (${currentUser.gamingId || currentUser.userId})`
                  : `Open Dashboard (${currentUser.userId})`}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { onShowIdCard(); setMobileMenuOpen(false); }}
                  className="py-2 rounded-sm text-xs font-semibold border border-slate-300 text-[#212121] cursor-pointer"
                >
                  Digital ID Card
                </button>
                <button
                  type="button"
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="py-2 rounded-sm text-xs font-semibold border border-rose-200 text-rose-600 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                className="py-2.5 rounded-sm text-xs font-bold bg-[#2874f0] text-white cursor-pointer"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => { onSelectTab('register'); setMobileMenuOpen(false); }}
                className="py-2.5 rounded-sm text-xs font-bold bg-[#fb641b] text-white cursor-pointer"
              >
                Join ₹10+
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-[#878787]">
            <button
              type="button"
              onClick={() => { setNoticeModalOpen(true); setMobileMenuOpen(false); }}
              className="hover:text-[#2874f0] font-medium cursor-pointer"
            >
              Notices
            </button>
            <button
              type="button"
              onClick={() => { setHelplineModalOpen(true); setMobileMenuOpen(false); }}
              className="hover:text-[#2874f0] font-medium cursor-pointer"
            >
              Helpline
            </button>
            <button
              type="button"
              onClick={() => {
                if (isAdmin) onSelectTab('admin');
                else onOpenAdminLogin();
                setMobileMenuOpen(false);
              }}
              className="hover:text-[#fb641b] font-medium cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>
      )}

      {/* ===================== CLEAN NOTICE BOARD MODAL ===================== */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col relative text-[#212121]">
            <button
              type="button"
              onClick={() => setNoticeModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-[#878787] hover:text-[#212121] rounded-full hover:bg-slate-100 cursor-pointer"
              aria-label="Close notice board"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-10 border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-[#2874f0] uppercase tracking-wide">
                ESP Official Updates
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#212121]">
                आधिकारिक सूचना पट्ट (Notice Board)
              </h2>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {liveNotices.map(n => (
                <div
                  key={n.id}
                  className="p-4 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#388e3c] uppercase">
                      {n.tag}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeModalOpen(false);
                        handleNoticeAction(n.actionTab);
                      }}
                      className="bg-[#2874f0] hover:bg-[#1c62d6] text-white font-semibold text-xs px-3 py-1.5 rounded-xs transition cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>{n.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-[#212121]">{n.title}</h3>
                  <p className="text-xs text-[#555555] leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setNoticeModalOpen(false)}
                className="px-5 py-2 rounded-xs font-semibold text-[#212121] bg-slate-100 hover:bg-slate-200 transition cursor-pointer text-xs"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      <ServicesPopUpModal
        isOpen={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        currentUser={currentUser}
        onSelectServiceForRegistration={() => {
          onSelectTab('register');
        }}
        onSelectServiceCode={onSelectServiceCode}
      />

      <HelplineModal
        isOpen={helplineModalOpen}
        onClose={() => setHelplineModalOpen(false)}
        settings={settings}
      />

      <MoreOptionsPopupModal
        isOpen={morePopupOpen}
        onClose={() => setMorePopupOpen(false)}
        title="ESP Portal · More Options"
        subtitle={modePillLabel}
        items={morePopupItems}
      />
    </header>
  );
};
