import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Building,
  Megaphone,
  Ticket,
  Heart,
  Crown,
  Flame,
  Award,
  Layers,
  Zap,
  CheckCircle2,
  ExternalLink,
  Printer,
  ChevronRight
} from 'lucide-react';
import type { UserProfile, PlatformSettings, ServiceType } from '../types/index.ts';

interface MultiCardShowcaseProps {
  user: UserProfile;
  settings?: PlatformSettings;
  defaultCard?: 'service_pattern' | 'sponsor' | 'promotion' | 'business_setup' | 'ads_visitor' | 'moment';
}

const SERVICE_PATTERNS: Record<ServiceType, {
  name: string;
  hindiName: string;
  gradient: string;
  accentColor: string;
  borderGlow: string;
  patternType: string;
  badge: string;
  motto: string;
}> = {
  EMO: {
    name: 'Earn Money Online',
    hindiName: 'अर्न मनी ऑनलाइन',
    gradient: 'from-[#0b132b] via-[#1c2541] to-[#00A3E0]',
    accentColor: '#00A3E0',
    borderGlow: 'border-cyan-400/40 shadow-cyan-500/20',
    patternType: 'Cyber Hex Matrix',
    badge: '⚡ EMO PRO',
    motto: 'Daily AI Micro-Tasks & Instant Payout'
  },
  MMO: {
    name: 'Make Money Online',
    hindiName: 'मेक मनी ऑनलाइन',
    gradient: 'from-[#1a0b2e] via-[#2d124d] to-[#9d4edd]',
    accentColor: '#c77dff',
    borderGlow: 'border-purple-400/40 shadow-purple-500/20',
    patternType: 'Quantum Neural Pulse',
    badge: '🔮 MMO ELITE',
    motto: 'Digital Content Creation & Royalties'
  },
  MOM: {
    name: 'Make Online Money',
    hindiName: 'मेक ऑनलाइन मनी',
    gradient: 'from-[#051923] via-[#003554] to-[#006494]',
    accentColor: '#00a6fb',
    borderGlow: 'border-sky-400/40 shadow-sky-500/20',
    patternType: 'Sapphire Wave Lattice',
    badge: '💎 MOM PRIME',
    motto: 'Automated E-Commerce & Micro Store'
  },
  OES: {
    name: 'Online Earning System',
    hindiName: 'ऑनलाइन अर्निंग सिस्टम',
    gradient: 'from-[#191919] via-[#2d3142] to-[#4f5d75]',
    accentColor: '#ef8354',
    borderGlow: 'border-amber-400/40 shadow-amber-500/20',
    patternType: 'Titanium Circuit Grid',
    badge: '⚙️ OES SYSTEM',
    motto: 'Systematic Workflows & Hourly Yield'
  },
  MMS: {
    name: 'Money Making System',
    hindiName: 'मनी मेकिंग सिस्टम',
    gradient: 'from-[#00251a] via-[#004d40] to-[#00897b]',
    accentColor: '#26a69a',
    borderGlow: 'border-emerald-400/40 shadow-emerald-500/20',
    patternType: 'Emerald Matrix Flow',
    badge: '🌿 MMS MASTER',
    motto: 'High Efficiency Passive Growth Pipeline'
  },
  NWI: {
    name: 'Non Working Income',
    hindiName: 'नॉन वर्किंग इनकम (Auto Pool)',
    gradient: 'from-[#2b1810] via-[#542d18] to-[#d4af37]',
    accentColor: '#FFD700',
    borderGlow: 'border-yellow-400/50 shadow-yellow-500/30',
    patternType: 'Royal Gold Starlight',
    badge: '👑 NWI AUTO-POOL',
    motto: 'Community Shared Pool & Lifetime Yield'
  },
  SWI: {
    name: 'Self Working Income',
    hindiName: 'सेल्फ वर्किंग इनकम',
    gradient: 'from-[#001f3f] via-[#003366] to-[#0074d9]',
    accentColor: '#7fdbff',
    borderGlow: 'border-blue-400/40 shadow-blue-500/20',
    patternType: 'Hyper Stream Vector',
    badge: '🚀 SWI DIRECT',
    motto: 'Individual High Performance Tasks'
  },
  TWI: {
    name: 'Team Working Income',
    hindiName: 'टीम वर्किंग इनकम',
    gradient: 'from-[#3a0ca3] via-[#4361ee] to-[#4cc9f0]',
    accentColor: '#4cc9f0',
    borderGlow: 'border-indigo-400/40 shadow-indigo-500/20',
    patternType: 'Synergy Node Constellation',
    badge: '🛡️ TWI ALLIANCE',
    motto: 'Multi-Tier Team Leverage & Override'
  },
  PROMOTE: {
    name: 'Promote & Earn',
    hindiName: 'प्रमोट एंड अर्न',
    gradient: 'from-[#370617] via-[#6a040f] to-[#dc2f02]',
    accentColor: '#ffba08',
    borderGlow: 'border-rose-400/40 shadow-rose-500/20',
    patternType: 'Crimson Viral Wave',
    badge: '📢 PROMOTER VIP',
    motto: 'Social Media Viral Brand Campaigns'
  },
  REFER: {
    name: 'Refer & Earn',
    hindiName: 'रेफर एंड अर्न (50% Commission)',
    gradient: 'from-[#132a13] via-[#31572c] to-[#4f772d]',
    accentColor: '#90a955',
    borderGlow: 'border-green-400/40 shadow-green-500/20',
    patternType: 'Diamond Network Web',
    badge: '🤝 REFERRAL KING',
    motto: 'Direct Sponsor Commission up to 50%'
  }
};

export const MultiCardShowcase: React.FC<MultiCardShowcaseProps> = ({
  user,
  settings,
  defaultCard = 'service_pattern'
}) => {
  const [activeCardTab, setActiveCardTab] = useState<'service_pattern' | 'sponsor' | 'promotion' | 'business_setup' | 'ads_visitor' | 'moment'>(defaultCard);
  const [selectedService, setSelectedService] = useState<ServiceType>((user.chosenServiceCode as ServiceType) || 'EMO');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedRoll, setCopiedRoll] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likesCount, setLikesCount] = useState(148);
  const [hasLiked, setHasLiked] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${user.userId}`
    : `https://esp.platform/?ref=${user.userId}`;

  useEffect(() => {
    QRCode.toDataURL(referralUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#070b1e',
        light: '#ffffff',
      },
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [referralUrl]);

  const handleCopyRoll = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedRoll(true);
    setTimeout(() => setCopiedRoll(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = (customText?: string) => {
    const text = encodeURIComponent(
      customText ||
      `🔥 *ESP GAMING ROOM - VERIFIED MEMBER PASS*\n\n` +
      `👤 *Name:* ${user.fullName}\n` +
      `🆔 *Roll No / Sponsor ID:* ${user.userId}\n` +
      `🎮 *Room Address:* ${user.roomAddress || `ESP-ROOM-${user.userId}`}\n` +
      `💰 *Plan:* ${user.chosenServiceName || 'ESP Service Plan'} (₹${user.joiningFee})\n` +
      `🪙 *Coins Balance:* ${user.coins || 5000} Coins | Level ${user.gameLevel || 1}\n\n` +
      `👇 Join ESP GAMING ROOM under my direct sponsor link:\n${referralUrl}\n\n` +
      `Support UPI: ${settings?.adminUpiId || '8877490845@SPICEPAY'}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const cardTabs = [
    { id: 'service_pattern', label: '10 Service ID', hindi: '10 सर्विस पैटर्न कार्ड', icon: Layers, color: 'text-[#2874f0]' },
    { id: 'sponsor', label: 'Sponsor ID', hindi: 'स्पॉन्सर आईडी कार्ड', icon: Crown, color: 'text-amber-600' },
    { id: 'promotion', label: 'Promotion Card', hindi: 'प्रमोशन कार्ड', icon: Megaphone, color: 'text-rose-600' },
    { id: 'business_setup', label: 'Business Card', hindi: 'बिज़नेस सेटअप कार्ड', icon: Building, color: 'text-[#388e3c]' },
    { id: 'ads_visitor', label: 'Ads & Visitor Pass', hindi: 'ऐड्स व विजिटर पास', icon: Ticket, color: 'text-[#fb641b]' },
    { id: 'moment', label: 'Moment Card', hindi: 'मोमेंट कार्ड', icon: Heart, color: 'text-pink-600' },
  ];

  const currentPattern = SERVICE_PATTERNS[selectedService] || SERVICE_PATTERNS.EMO;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Tabs Header Carousel */}
      <div className="w-full overflow-x-auto pb-3 pt-1 no-scrollbar">
        <div className="flex items-center gap-2 min-w-max px-1">
          {cardTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeCardTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCardTab(tab.id as any)}
                className={`relative px-4 py-2 rounded-md font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#2874f0] text-white border border-[#1c62d6] shadow-sm'
                    : 'bg-white text-[#212121] border border-slate-200 hover:border-[#2874f0] hover:bg-[#f5f8ff]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffe500]' : tab.color}`} />
                <div className="text-left leading-tight">
                  <div className="font-bold">{tab.label}</div>
                  <div className={`text-[9px] ${isActive ? 'text-blue-100' : 'text-[#878787]'}`}>{tab.hindi}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Card Viewport Container */}
      <div className="w-full max-w-lg mt-2">
        {/* ============================================================== */}
        {/* CARD 1: SERVICE PATTERN ID CARD (10 DISTINCT PATTERNS)         */}
        {/* ============================================================== */}
        {activeCardTab === 'service_pattern' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            {/* Pattern Switcher Pills */}
            <div className="w-full mb-3 bg-white p-3 rounded-md border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-[#212121] mb-2 flex items-center justify-between px-0.5">
                <span className="flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2874f0]" />
                  <span>Choose Service Pattern Style (10 प्रकार के पैटर्न):</span>
                </span>
                <span className="text-[10px] text-[#2874f0] font-mono font-bold">Current: {selectedService}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Object.keys(SERVICE_PATTERNS) as ServiceType[]).map(code => (
                  <button
                    key={code}
                    onClick={() => setSelectedService(code)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      selectedService === code
                        ? 'bg-[#2874f0] text-white shadow-xs'
                        : 'bg-[#f1f3f6] text-[#212121] hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* The 3D Service ID Card */}
            <div
              ref={cardContainerRef}
              className={`w-full rounded-3xl p-6 bg-gradient-to-br ${currentPattern.gradient} border-2 ${currentPattern.borderGlow} shadow-2xl text-white relative overflow-hidden transition-all duration-300`}
            >
              {/* Futuristic Holographic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none transform -skew-x-12 animate-pulse" />
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

              {/* Card Top Brand & Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-white/15 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black text-sm shadow-lg shadow-cyan-500/40 text-[#070b1e]">
                    ESP
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide text-white flex items-center space-x-1">
                      <span>ESP GAMING ROOM</span>
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    </h3>
                    <p className="text-[9px] text-cyan-200/80 uppercase tracking-wider">
                      {currentPattern.patternType}
                    </p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white flex items-center space-x-1">
                  <span>{currentPattern.badge}</span>
                </div>
              </div>

              {/* Card Body Profile & Details */}
              <div className="mt-4 flex items-start space-x-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5 shadow-xl">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                      alt={user.fullName}
                      className="w-full h-full rounded-2xl object-cover bg-[#090d24]"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white flex items-center space-x-0.5 shadow">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
                    Official Member
                  </div>
                  <h4 className="text-lg font-black text-white truncate leading-tight">
                    {user.fullName}
                  </h4>
                  <div className="mt-1 flex items-center space-x-2 text-xs">
                    <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md border border-white/10 text-cyan-300 font-bold">
                      {user.userId}
                    </span>
                    <button
                      onClick={handleCopyRoll}
                      className="p-1 hover:bg-white/20 rounded transition text-slate-300"
                      title="Copy Roll Number"
                    >
                      {copiedRoll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-200 line-clamp-1">
                    🎯 <span className="font-semibold text-white">{currentPattern.name}</span> ({currentPattern.hindiName})
                  </div>
                </div>
              </div>

              {/* Service Metrics Box */}
              <div className="mt-4 grid grid-cols-3 gap-2 bg-black/40 backdrop-blur-md rounded-2xl p-2.5 border border-white/10 relative z-10 text-center">
                <div>
                  <div className="text-[9px] text-slate-400">Gaming Room</div>
                  <div className="text-xs font-mono font-bold text-cyan-300 truncate">
                    {user.roomAddress || `ESP-${user.userId}`}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Game Coins</div>
                  <div className="text-xs font-bold text-amber-300">
                    🪙 {(user.coins || 5000).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Game Level</div>
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-center space-x-0.5">
                    <Crown className="w-3 h-3" />
                    <span>Lvl {user.gameLevel || 5}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Security Hologram & QR Code */}
              <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between relative z-10">
                <div className="text-left">
                  <div className="text-[8px] text-slate-300 uppercase tracking-wider">Motto & Principle</div>
                  <div className="text-[10px] font-semibold text-white max-w-[210px] leading-tight">
                    "{currentPattern.motto}"
                  </div>
                  <div className="mt-1 text-[8px] text-cyan-200/70">
                    Sponsor: {user.sponsorId} ({user.sponsorName})
                  </div>
                </div>

                {qrCodeUrl && (
                  <div className="p-1 bg-white rounded-xl shadow-lg flex flex-col items-center">
                    <img src={qrCodeUrl} alt="Join QR" className="w-14 h-14" />
                    <span className="text-[7px] text-[#070b1e] font-black uppercase mt-0.5">Scan to Join</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CARD 2: SPONSOR ID CARD (GOLD EMBOSSED VIP)                    */}
        {/* ============================================================== */}
        {activeCardTab === 'sponsor' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#1b1500] via-[#2d2204] to-[#120e00] border-2 border-amber-400/60 shadow-2xl shadow-amber-500/20 text-white relative overflow-hidden">
              {/* Gold Glare */}
              <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-bl from-amber-400/20 via-transparent to-transparent pointer-events-none" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-yellow-600/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center font-black text-sm text-[#1a1200] shadow-lg shadow-amber-500/30">
                    👑
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide text-amber-200">
                      OFFICIAL SPONSOR PASS
                    </h3>
                    <p className="text-[9px] text-amber-400/80 uppercase">
                      ESP Certified Direct Sponsor
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black flex items-center space-x-1">
                  <span>50% REFERRAL TIER</span>
                </div>
              </div>

              {/* Sponsor Profile & Details */}
              <div className="mt-5 flex items-center space-x-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/30">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                      alt={user.fullName}
                      className="w-full h-full rounded-2xl object-cover bg-[#161203]"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Sponsor Name
                  </div>
                  <h4 className="text-xl font-black text-amber-100 truncate">
                    {user.fullName}
                  </h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/40 shadow-inner">
                      {user.userId}
                    </span>
                    <button
                      onClick={handleCopyRoll}
                      className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded flex items-center space-x-1"
                    >
                      {copiedRoll ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedRoll ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-amber-200/80">
                    Sponsor Code: <span className="font-bold text-white">{user.userId}</span>
                  </p>
                </div>
              </div>

              {/* Referral Bonus Perks */}
              <div className="mt-5 bg-black/60 rounded-2xl p-3 border border-amber-500/30 relative z-10">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="border-r border-amber-500/20 pr-2">
                    <div className="text-[9px] text-amber-300/80">Direct Referral Reward</div>
                    <div className="text-base font-black text-amber-300">₹40 - ₹500 / Member</div>
                  </div>
                  <div className="pl-2">
                    <div className="text-[9px] text-amber-300/80">Coins Gifting Bonus</div>
                    <div className="text-base font-black text-yellow-400">+500 Coins / Join</div>
                  </div>
                </div>
              </div>

              {/* QR and Share link */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between relative z-10">
                <div className="flex-1 pr-3">
                  <div className="text-[9px] text-amber-300/80">Direct Referral Web Link:</div>
                  <div className="text-[11px] font-mono text-slate-300 truncate bg-amber-950/50 p-1.5 rounded-lg border border-amber-500/20 mt-1">
                    {referralUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="mt-2 btn-3d-gold px-3 py-1 text-[11px] font-bold rounded-lg flex items-center space-x-1.5"
                  >
                    {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                  </button>
                </div>

                {qrCodeUrl && (
                  <div className="p-1 bg-white rounded-xl shadow-lg shadow-amber-500/20">
                    <img src={qrCodeUrl} alt="Sponsor QR" className="w-16 h-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CARD 3: PROMOTION CARD (VIRAL SOCIAL BANNER)                   */}
        {/* ============================================================== */}
        {activeCardTab === 'promotion' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#1a000d] via-[#33001a] to-[#4a0026] border-2 border-rose-500/50 shadow-2xl shadow-rose-500/20 text-white relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-rose-400/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center font-bold text-sm shadow-md">
                    📢
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-rose-200">
                      ESP VIRAL PROMOTION POSTER
                    </h3>
                    <p className="text-[9px] text-rose-300/80">Social Media Earning Opportunity</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-[10px] font-black text-rose-300">
                  START ₹10 ONLY
                </div>
              </div>

              {/* Poster Slogan */}
              <div className="mt-4 text-center relative z-10">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-[#070b1e] font-black text-xs uppercase tracking-wider mb-2 shadow-md">
                  🚀 Work From Home & Daily Earning
                </div>
                <h2 className="text-xl font-black text-white leading-tight">
                  घर बैठे मोबाइल से प्रतिदिन कमाएं ₹500 - ₹2,000!
                </h2>
                <p className="mt-1.5 text-xs text-rose-200 leading-relaxed">
                  Join 10 Earning Services + ESP PLAY Gaming Room with Daily Voice Stage, Lucky Spins & Instant UPI Payouts!
                </p>
              </div>

              {/* Sponsor Host Banner */}
              <div className="mt-4 bg-black/50 rounded-2xl p-3 border border-rose-400/20 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                    alt={user.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-rose-400/40"
                  />
                  <div>
                    <div className="text-[10px] text-rose-300 font-semibold">Hosted by Team Leader</div>
                    <div className="font-black text-sm text-white">{user.fullName}</div>
                    <div className="text-[10px] font-mono text-cyan-300 font-bold">
                      Sponsor Roll No: {user.userId}
                    </div>
                  </div>
                </div>
                {qrCodeUrl && (
                  <div className="p-1 bg-white rounded-xl">
                    <img src={qrCodeUrl} alt="Join QR" className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* CTA Action Bar */}
              <div className="mt-4 pt-3 border-t border-rose-400/20 flex items-center justify-between relative z-10">
                <div className="text-[10px] text-slate-300">
                  ✅ 100% Verified UPI Transfer<br />
                  ✅ No Experience Needed
                </div>
                <button
                  onClick={() => handleShareWhatsApp()}
                  className="btn-3d-emerald px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CARD 4: BUSINESS SETUP CARD (MERCHANT & FREELANCER SPEC)       */}
        {/* ============================================================== */}
        {activeCardTab === 'business_setup' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#021b14] via-[#052e22] to-[#01140e] border-2 border-emerald-400/50 shadow-2xl shadow-emerald-500/20 text-white relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-400/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-sm text-[#01140e] shadow-md">
                    💼
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-emerald-200">
                      ESP BUSINESS CREDENTIALS
                    </h3>
                    <p className="text-[9px] text-emerald-300/80">Freelance Partner & Merchant Pass</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-black text-emerald-300 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>NPCI / UPI COMPLIANT</span>
                </div>
              </div>

              {/* Business Profile Details */}
              <div className="mt-4 grid grid-cols-2 gap-3 relative z-10 text-xs">
                <div className="bg-black/50 p-3 rounded-2xl border border-emerald-500/20">
                  <div className="text-[10px] text-slate-400">Business Associate</div>
                  <div className="font-black text-sm text-white truncate">{user.fullName}</div>
                  <div className="text-[10px] font-mono text-emerald-300 font-bold mt-0.5">
                    ID: {user.userId}
                  </div>
                </div>
                <div className="bg-black/50 p-3 rounded-2xl border border-emerald-500/20">
                  <div className="text-[10px] text-slate-400">Business House / Office</div>
                  <div className="font-bold text-xs text-white truncate">
                    {user.houseName || `House of ${user.fullName.split(' ')[0]}`}
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                    {user.roomAddress || `ESP-ROOM-${user.userId}`}
                  </div>
                </div>
              </div>

              {/* Payment Settlement Information */}
              <div className="mt-3 bg-black/60 rounded-2xl p-3.5 border border-emerald-500/20 relative z-10">
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Authorized UPI Settlement Endpoint</span>
                  <span className="text-emerald-300 font-mono text-[9px]">DIRECT TRANSFER</span>
                </div>
                <div className="text-sm font-mono font-bold text-white bg-[#021b14] p-2 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                  <span className="truncate">{user.paymentAddress || user.payoutUpiId || 'Not Configured'}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-sans">
                    UPI Active
                  </span>
                </div>
                <div className="mt-2 text-[10px] text-slate-300 flex items-center justify-between">
                  <span>Minimum Settlement: ₹{settings?.minWithdrawal || 50}</span>
                  <span>Instant 24x7 Payout</span>
                </div>
              </div>

              {/* QR and Compliance seal */}
              <div className="mt-4 pt-3 border-t border-emerald-400/20 flex items-center justify-between relative z-10">
                <div>
                  <div className="text-[10px] font-semibold text-emerald-200">
                    Earning System Platform (ESP)
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Official Headquarter: {settings?.contactAddress || 'ESP Headquarters, Bihar, India'}
                  </div>
                </div>
                {qrCodeUrl && (
                  <div className="p-1 bg-white rounded-xl">
                    <img src={qrCodeUrl} alt="Business QR" className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CARD 5: ADS & VISITOR PASS CARD                                */}
        {/* ============================================================== */}
        {activeCardTab === 'ads_visitor' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#0d132b] via-[#151d42] to-[#080d21] border-2 border-indigo-400/50 shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-400/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-sm shadow-md">
                    🎟️
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-indigo-200">
                      VIP VISITOR & ADS PASS
                    </h3>
                    <p className="text-[9px] text-indigo-300/80">Room Access & Traffic Analytics</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-black text-indigo-300 font-mono">
                  PASS #ESP-{Math.abs(user.userId.split('').reduce((a, b) => a + b.charCodeAt(0), 1000))}
                </div>
              </div>

              {/* Barcode Hologram Header */}
              <div className="mt-4 bg-white p-2 rounded-xl text-center relative z-10 shadow-lg">
                <div className="font-mono text-black font-black tracking-[0.3em] text-xs">
                  ||| | | |||| | ||| |||| | ||||| ||| ||| |
                </div>
                <div className="text-[9px] text-slate-800 font-mono font-bold">
                  AUTH CODE: {user.userId} • VERIFIED ENTRY
                </div>
              </div>

              {/* Visitor Stats Grid */}
              <div className="mt-4 grid grid-cols-3 gap-2 text-center relative z-10">
                <div className="bg-black/50 p-2.5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[9px] text-slate-400">Total Profile Visits</div>
                  <div className="text-sm font-black text-cyan-300">
                    {(user.visitorCount || 342) + 25}
                  </div>
                </div>
                <div className="bg-black/50 p-2.5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[9px] text-slate-400">Ads Impressions</div>
                  <div className="text-sm font-black text-purple-300">
                    1,280
                  </div>
                </div>
                <div className="bg-black/50 p-2.5 rounded-2xl border border-indigo-500/20">
                  <div className="text-[9px] text-slate-400">Pass Status</div>
                  <div className="text-xs font-black text-emerald-400">
                    ACTIVE VIP
                  </div>
                </div>
              </div>

              {/* Room Address Details */}
              <div className="mt-3 bg-black/60 rounded-2xl p-3 border border-indigo-500/20 relative z-10 flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-slate-400">Voice Room Direct Entrance:</div>
                  <div className="font-mono text-xs font-bold text-indigo-300 mt-0.5">
                    {user.roomAddress || `ESP-ROOM-${user.userId}`}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/30 text-indigo-200 text-[10px] font-bold">
                  Open 24/7
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-400/20 flex items-center justify-between relative z-10 text-[9px] text-slate-400">
                <span>Passholder: <strong className="text-white">{user.fullName}</strong></span>
                <span>Security Stamp: Verified by IOIS / ESP</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CARD 6: MOMENT CARD (SOCIAL HIGHLIGHT & GAMING TROPHY)         */}
        {/* ============================================================== */}
        {activeCardTab === 'moment' && (
          <div className="flex flex-col items-center w-full animate-fadeIn">
            <div className="w-full rounded-3xl p-6 bg-gradient-to-br from-[#1a0a2a] via-[#2d1245] to-[#12071f] border-2 border-pink-500/50 shadow-2xl shadow-pink-500/20 text-white relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-pink-400/20 relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center font-black text-sm shadow-md">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-pink-200">
                      DAILY MOMENT HIGHLIGHT
                    </h3>
                    <p className="text-[9px] text-pink-300/80">Social Status & Achievements</p>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-[10px] font-black text-pink-300 flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>HOT MOMENT</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="mt-4 flex items-center space-x-3 relative z-10">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-pink-400/40"
                />
                <div>
                  <div className="font-black text-base text-white">{user.fullName}</div>
                  <div className="text-[10px] text-pink-300 flex items-center space-x-1">
                    <span>Lvl {user.gameLevel || 5}</span>
                    <span>•</span>
                    <span>Clan: {user.clanName || 'Royal Warriors ESP'}</span>
                  </div>
                </div>
              </div>

              {/* Highlight Achievement Content */}
              <div className="mt-4 bg-black/60 rounded-2xl p-4 border border-pink-500/20 relative z-10">
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  "🎉 आज ESP GAMING ROOM में स्पिन एंड विन में शानदार जीत दर्ज की! 10 अर्निंग सर्विसेज के साथ हर दिन नई ग्रोथ मिल रही है। सभी दोस्त वॉइस रूम पर आएं और साथ मिलकर एंजॉय करें!"
                </p>
                <div className="mt-3 flex items-center space-x-3 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    #ESPGaming
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    #DailyEarnings
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    #VoiceStage
                  </span>
                </div>
              </div>

              {/* Interactive Likes & Charms Bar */}
              <div className="mt-4 pt-3 border-t border-pink-400/20 flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (!hasLiked) {
                        setLikesCount(prev => prev + 1);
                        setHasLiked(true);
                      }
                    }}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      hasLiked
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-pink-300'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount} Likes</span>
                  </button>

                  <div className="flex items-center space-x-1 text-xs text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{user.charms || 150} Charms</span>
                  </div>
                </div>

                <button
                  onClick={() => handleShareWhatsApp()}
                  className="btn-3d-cyan px-3 py-1.5 text-xs font-bold rounded-xl flex items-center space-x-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Action Tools: Print, Share WhatsApp, Copy Roll No */}
        <div className="mt-4 w-full grid grid-cols-3 gap-2">
          <button
            onClick={handleCopyRoll}
            className="bg-white hover:bg-[#f5f8ff] text-[#212121] border border-slate-300 py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
          >
            {copiedRoll ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5 text-[#2874f0]" />}
            <span>{copiedRoll ? 'Copied' : 'Roll No'}</span>
          </button>

          <button
            onClick={() => handleShareWhatsApp()}
            className="bg-[#388e3c] hover:bg-emerald-700 text-white py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-[#fb641b] hover:bg-[#e8550f] text-white py-2.5 px-3 rounded text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
