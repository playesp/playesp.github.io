import React, { useState, useRef, useEffect } from 'react';
import {
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
  Scale,
  Bell,
  Briefcase,
  Radio,
  Settings,
  Grid,
  Compass,
  LogIn,
  UserPlus,
  Keyboard,
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';
import { ServicesPopUpModal } from './ServicesPopUpModal.tsx';
import { HelplineModal } from './HelplineModal.tsx';
import { MoreOptionsPopupModal, type MoreOptionItem } from './SystemPopupModals.tsx';

interface NavbarProps {
  currentUser: UserProfile | null;
  isAdmin: boolean;
  settings: PlatformSettings;
  onSelectTab: (tab: string) => void;
  onSelectServiceCode?: (code: string) => void;
  onOpenLogin: () => void;
  onOpenJoinPopup?: () => void;
  onOpenNewVisitorPopup?: () => void;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
  onShowIdCard: () => void;
  onOpenLegalModal?: () => void;
  onOpenKnowIncome?: () => void;
  onOpenKnowGaming?: () => void;
  onOpenTypingAcademy?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isAdmin,
  settings,
  onSelectTab,
  onSelectServiceCode,
  onOpenLogin,
  onOpenJoinPopup,
  onOpenNewVisitorPopup,
  onOpenAdminLogin,
  onLogout,
  onShowIdCard,
  onOpenLegalModal,
  onOpenKnowIncome,
  onOpenKnowGaming,
  onOpenTypingAcademy,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [morePopupOpen, setMorePopupOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [helplineModalOpen, setHelplineModalOpen] = useState(false);

  const isGamerOnly = currentUser?.accountType === 'gamer';
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const morePopupItems: MoreOptionItem[] = [
    ...(onOpenNewVisitorPopup
      ? [
          {
            id: 'more-visitor',
            label: 'New Visitor Guide',
            subLabel: 'विकल्प चुनकर तुरंत रिजल्ट पॉपअप देखें',
            icon: <Compass className="w-4 h-4 text-[#2874f0]" />,
            badge: 'Guide',
            onClick: () => onOpenNewVisitorPopup(),
          },
        ]
      : []),
    ...(onOpenKnowIncome
      ? [
          {
            id: 'more-know-income',
            label: isGamerOnly ? 'Know Income & Upgrade Same ID' : 'Income System Popup',
            subLabel: isGamerOnly ? 'बिना दूसरी ID बनाए ₹10+ से कमाई शुरू करें' : '10 प्लान्स, 50% बोनस व UPI पेआउट',
            icon: <Briefcase className="w-4 h-4 text-[#fb641b]" />,
            onClick: () => onOpenKnowIncome(),
          },
        ]
      : []),
    ...(onOpenKnowGaming
      ? [
          {
            id: 'more-know-gaming',
            label: 'Gaming & Voice Club Popup',
            subLabel: '16+ गेम्स, 8-सीट वॉइस रूम व रिवॉर्ड्स',
            icon: <Gamepad2 className="w-4 h-4 text-indigo-600" />,
            onClick: () => onOpenKnowGaming(),
          },
        ]
      : []),
    ...(onOpenTypingAcademy
      ? [
          {
            id: 'more-typing-academy',
            label: 'ESP Typing Academy',
            subLabel: '15 पाठ, WPM स्पीड टेस्ट व फिंगर गाइड',
            icon: <Keyboard className="w-4 h-4 text-[#2874f0]" />,
            badge: 'Skill Lab',
            onClick: () => onOpenTypingAcademy(),
          },
        ]
      : []),
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
      label: isAdmin ? 'Open Admin Control' : 'Admin Control Login',
      subLabel: 'वेरिफिकेशन व टोटल कंट्रोल सिस्टम',
      icon: <Lock className="w-4 h-4 text-[#fb641b]" />,
      onClick: () => {
        if (isAdmin) onSelectTab('admin');
        else onOpenAdminLogin();
      },
    },
  ];

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
  ];

  const handleNoticeAction = (action: string) => {
    if (action.startsWith('service:')) {
      if (onSelectServiceCode) onSelectServiceCode(action.replace('service:', ''));
      onSelectTab('service-detail');
      return;
    }
    if (action === 'register' && currentUser) {
      onSelectTab('dashboard');
    } else {
      onSelectTab(action);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#2874f0] text-white shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: Clean Single-Line Brand Wordmark */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-white hover:bg-white/10 cursor-pointer shrink-0"
            aria-label="System Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab(currentUser ? (isGamerOnly ? 'gaming-room' : 'dashboard') : 'home')}
            className="font-display text-base min-[380px]:text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isGamerOnly ? 'ESP Gaming' : 'ESP Platform'}
          </button>
        </div>

        {/* Zone 2 & 3: Clean Essential Actions ONLY (Login · Reg/Join · New Visitor · Admin Control · More) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {currentUser ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="btn-3d bg-white text-[#2874f0] hover:bg-blue-50 px-2.5 sm:px-4 py-1.5 rounded-sm text-[11px] sm:text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap min-h-[34px]"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="max-w-[80px] sm:max-w-[140px] truncate">{currentUser.fullName.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              </button>

              {accountMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-[min(17rem,calc(100vw-1.25rem))] bg-white border border-slate-200 rounded-md shadow-xl z-50 text-[#212121] overflow-hidden">
                  <div className="p-3 bg-[#f5f7fa] border-b border-slate-200 space-y-1">
                    <p className="text-xs font-bold text-[#212121] truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[#878787] font-mono">
                      {isGamerOnly
                        ? `GAME: ${currentUser.gamingId || currentUser.userId}`
                        : `${currentUser.chosenServiceCode || 'EMO'} · ${currentUser.userId} · ₹${currentUser.balance}`}
                    </p>
                  </div>
                  <div className="py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab(isGamerOnly ? 'gaming-room' : 'dashboard');
                        setAccountMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      {isGamerOnly ? <Gamepad2 className="w-3.5 h-3.5 text-[#fb641b]" /> : <Briefcase className="w-3.5 h-3.5 text-[#2874f0]" />}
                      <span>{isGamerOnly ? 'Gaming Lobby' : 'My Dashboard'}</span>
                    </button>

                    {isGamerOnly && onOpenKnowIncome && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenKnowIncome();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-semibold text-[#fb641b] cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Upgrade Same ID (₹10+)</span>
                      </button>
                    )}

                    {!isGamerOnly && onOpenKnowGaming && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenKnowGaming();
                          setAccountMenuOpen(false);
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-semibold text-indigo-700 cursor-pointer"
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>Play Gaming (Same ID)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onShowIdCard();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#f5f8ff] flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>Digital ID Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setAccountMenuOpen(false);
                      }}
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
            <>
              <button
                type="button"
                onClick={onOpenLogin}
                className="btn-3d bg-white text-[#2874f0] hover:bg-blue-50 px-2.5 sm:px-4 py-1.5 rounded-sm text-[11px] sm:text-xs font-black cursor-pointer whitespace-nowrap min-h-[34px] inline-flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                <span>Login</span>
              </button>

              <button
                type="button"
                onClick={() => (onOpenJoinPopup ? onOpenJoinPopup() : onSelectTab('register'))}
                className="btn-3d bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-2.5 sm:px-4 py-1.5 rounded-sm text-[11px] sm:text-xs font-black cursor-pointer whitespace-nowrap min-h-[34px] inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
                <span>Reg / Join</span>
              </button>

              {onOpenNewVisitorPopup && (
                <button
                  type="button"
                  onClick={onOpenNewVisitorPopup}
                  className="btn-3d hidden md:inline-flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white border border-white/25 px-3 py-1.5 rounded-sm text-xs font-bold cursor-pointer whitespace-nowrap min-h-[34px]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#ffe500]" />
                  <span>New Visitor</span>
                </button>
              )}
            </>
          )}

          {/* Admin Control */}
          <button
            type="button"
            onClick={() => {
              if (isAdmin) onSelectTab('admin');
              else onOpenAdminLogin();
            }}
            aria-label="Admin Control"
            className="btn-3d inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white border border-orange-300 text-[11px] sm:text-xs font-black cursor-pointer whitespace-nowrap min-h-[34px] shrink-0"
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden min-[400px]:inline">Admin Control</span>
            <span className="min-[400px]:hidden">Control</span>
          </button>

          {/* More (System Menu Popup) */}
          <button
            type="button"
            onClick={() => setMorePopupOpen(true)}
            className="btn-3d inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white border border-white/25 text-[11px] sm:text-xs font-black cursor-pointer whitespace-nowrap min-h-[34px] shrink-0"
          >
            <Grid className="w-3.5 h-3.5 text-[#ffe500] shrink-0" />
            <span>More</span>
          </button>
        </div>
      </div>

      {/* Compact Mobile System Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-3 py-3 text-[#212121] space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            {!currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="btn-3d py-2 px-3 rounded bg-[#2874f0] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenJoinPopup) onOpenJoinPopup();
                    else onSelectTab('register');
                  }}
                  className="btn-3d py-2 px-3 rounded bg-[#ffe500] text-[#212121] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Reg / Join</span>
                </button>
                {onOpenNewVisitorPopup && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenNewVisitorPopup();
                    }}
                    className="btn-3d py-2 px-3 rounded bg-blue-50 text-[#2874f0] border border-blue-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>New Visitor</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSelectTab(isGamerOnly ? 'gaming-room' : 'dashboard');
                }}
                className="btn-3d py-2 px-3 rounded bg-[#2874f0] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isGamerOnly ? 'Open Gaming Room' : 'Open Dashboard'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setMorePopupOpen(true);
              }}
              className="btn-3d py-2 px-3 rounded bg-slate-100 text-[#212121] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>⋯ System Menu</span>
            </button>
          </div>
        </div>
      )}

      {/* Notice Board Modal */}
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
                <div key={n.id} className="p-4 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-[#388e3c] uppercase">{n.tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNoticeModalOpen(false);
                        handleNoticeAction(n.actionTab);
                      }}
                      className="btn-3d bg-[#2874f0] hover:bg-[#1c62d6] text-white font-semibold text-xs px-3 py-1.5 rounded-xs transition cursor-pointer inline-flex items-center gap-1"
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
          </div>
        </div>
      )}

      <ServicesPopUpModal
        isOpen={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        currentUser={currentUser}
        onSelectServiceForRegistration={() => onSelectTab('register')}
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
        title="System Menu · More"
        subtitle="सभी सिस्टम फीचर्स, प्लान्स, चैट व सहायता केंद्र"
        items={morePopupItems}
      />
    </header>
  );
};
