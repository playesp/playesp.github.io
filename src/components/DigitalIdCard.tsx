import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  Share2, 
  Award, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock, 
  Clock, 
  RotateCw,
  QrCode,
  Sparkles,
  ExternalLink,
  UserCheck,
  Building2,
  FileBadge
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';

interface DigitalIdCardProps {
  user: UserProfile;
  settings?: PlatformSettings;
  compact?: boolean;
  isVisitorPreview?: boolean;
  allowFlip?: boolean;
}

type CardTheme = 'emerald' | 'gold' | 'sapphire' | 'ruby';

const THEMES: Record<CardTheme, {
  name: string;
  bgGradient: string;
  borderClass: string;
  accentText: string;
  hologram: string;
  badgeBg: string;
  glow: string;
}> = {
  emerald: {
    name: 'Emerald Executive',
    bgGradient: 'from-[#031d16] via-[#062c22] to-[#01140e]',
    borderClass: 'border-emerald-400/50',
    accentText: 'text-emerald-400',
    hologram: 'from-emerald-400 via-amber-300 to-teal-400',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    glow: '0 20px 40px -15px rgba(16, 185, 129, 0.35)',
  },
  gold: {
    name: 'Imperial Gold VIP',
    bgGradient: 'from-[#221803] via-[#3a2907] to-[#160f02]',
    borderClass: 'border-amber-400/60',
    accentText: 'text-amber-400',
    hologram: 'from-amber-300 via-yellow-200 to-amber-500',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    glow: '0 20px 40px -15px rgba(245, 158, 11, 0.35)',
  },
  sapphire: {
    name: 'Cyber Sapphire',
    bgGradient: 'from-[#05162e] via-[#092248] to-[#020b17]',
    borderClass: 'border-cyan-400/60',
    accentText: 'text-cyan-400',
    hologram: 'from-cyan-400 via-sky-300 to-indigo-400',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    glow: '0 20px 40px -15px rgba(6, 182, 212, 0.35)',
  },
  ruby: {
    name: 'Royal Ruby Prestige',
    bgGradient: 'from-[#280512] via-[#3d091d] to-[#17020a]',
    borderClass: 'border-rose-400/60',
    accentText: 'text-rose-400',
    hologram: 'from-rose-400 via-pink-300 to-amber-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    glow: '0 20px 40px -15px rgba(244, 63, 94, 0.35)',
  },
};

export const DigitalIdCard: React.FC<DigitalIdCardProps> = ({ 
  user, 
  settings, 
  compact = false,
  isVisitorPreview = false,
  allowFlip = true
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedId, setCopiedId] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [theme, setTheme] = useState<CardTheme>('emerald');
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isApproved = user.status === 'active';
  const isPending = user.status === 'pending';
  const isRejected = user.status === 'rejected';

  const referralUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${user.userId}`
    : `https://ioisplatform.github.io/?ref=${user.userId}`;

  // Always generate genuine QR code for the user's referral link
  useEffect(() => {
    QRCode.toDataURL(referralUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#050b14',
        light: '#ffffff',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [referralUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySponsorId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getWhatsAppShareUrl = () => {
    const text = encodeURIComponent(
      `💼 *EARNING SYSTEM PLATFORM (ESP) - VERIFIED DIGITAL ID CARD*\n\n` +
      `👤 *Member Name:* ${user.fullName}\n` +
      `🆔 *ESP Referral Code / Roll No:* ${user.userId}\n` +
      `🎯 *Joined Service:* ${user.chosenServiceName || user.chosenServiceCode} (₹${user.joiningFee})\n` +
      `🎮 *ESP Gaming ID:* ${user.gamingId || `GAME-${user.userId}`}\n` +
      `✅ *Official Status:* Verified ESP Member\n\n` +
      `👇 मेरे डायरेक्ट रेफरल लिंक से अभी जुड़ें और प्रतिदिन ₹500 - ₹2,000 कमाएं:\n` +
      `${referralUrl}\n\n` +
      `🌐 ऑफिशियल पोर्टल: https://ioisplatform.github.io/\n` +
      `📧 सपोर्ट ईमेल: ${settings?.supportEmail || 'ioisplatform@gmail.com'}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  // High-Resolution Client-Side Canvas Export to PNG
  const handleDownloadImage = () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsExporting(false);
        return;
      }

      // ID Card 85.6mm x 53.98mm ratio -> 900x560 High DPI
      const width = 900;
      const height = 560;
      canvas.width = width;
      canvas.height = height;

      // Draw Background Gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      if (theme === 'gold') {
        grad.addColorStop(0, '#1c1303');
        grad.addColorStop(0.5, '#2e1f06');
        grad.addColorStop(1, '#0e0a02');
      } else if (theme === 'sapphire') {
        grad.addColorStop(0, '#031429');
        grad.addColorStop(0.5, '#07244a');
        grad.addColorStop(1, '#020b17');
      } else if (theme === 'ruby') {
        grad.addColorStop(0, '#260410');
        grad.addColorStop(0.5, '#3b081a');
        grad.addColorStop(1, '#140108');
      } else {
        grad.addColorStop(0, '#021812');
        grad.addColorStop(0.5, '#052b1f');
        grad.addColorStop(1, '#01100b');
      }
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, width, height, 32);
      ctx.fill();

      // Outer Border Glow
      ctx.strokeStyle = theme === 'gold' ? '#fbbf24' : theme === 'sapphire' ? '#38bdf8' : theme === 'ruby' ? '#f43f5e' : '#34d399';
      ctx.lineWidth = 4;
      ctx.roundRect(4, 4, width - 8, height - 8, 28);
      ctx.stroke();

      // Hologram Strip at Top
      const holoGrad = ctx.createLinearGradient(0, 0, width, 0);
      holoGrad.addColorStop(0, '#f59e0b');
      holoGrad.addColorStop(0.25, '#10b981');
      holoGrad.addColorStop(0.5, '#06b6d4');
      holoGrad.addColorStop(0.75, '#ec4899');
      holoGrad.addColorStop(1, '#eab308');
      ctx.fillStyle = holoGrad;
      ctx.fillRect(10, 10, width - 20, 8);

      // Header Brand
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('EARNING SYSTEM PLATFORM (ESP)', 36, 52);

      ctx.fillStyle = theme === 'gold' ? '#fde047' : '#6ee7b7';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('GOVT. RECOGNIZED DIGITAL STUDY & EARNING SYSTEM', 36, 72);

      // Official Verified Badge
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(width - 240, 32, 204, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#022c22';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText('✓ VERIFIED DIGITAL ID', width - 224, 54);

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(36, 92);
      ctx.lineTo(width - 36, 92);
      ctx.stroke();

      // Avatar box
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(36, 115, 140, 170, 20);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.roundRect(36, 115, 140, 170, 20);
      ctx.stroke();

      // Initial Circle inside photo box
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(106, 190, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 38px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user.fullName.charAt(0).toUpperCase() || 'E', 106, 204);
      ctx.textAlign = 'left';

      // Photo Box Tag
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('ESP MEMBER', 65, 265);

      // User Full Name
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('MEMBER FULL NAME', 200, 128);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.fillText(user.fullName, 200, 158);

      // Roll No / Referral Code
      ctx.fillStyle = '#042f2e';
      ctx.beginPath();
      ctx.roundRect(200, 172, 330, 52, 12);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.roundRect(200, 172, 330, 52, 12);
      ctx.stroke();

      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ESP ROLL NO / REFERRAL CODE', 212, 190);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(user.userId, 212, 214);

      // Service Joined & Fee
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('SERVICE JOINED WITH', 200, 246);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px system-ui, sans-serif';
      const svcText = `${user.chosenServiceName || user.chosenServiceCode} (Fee: ₹${user.joiningFee})`;
      ctx.fillText(svcText.length > 40 ? svcText.substring(0, 38) + '...' : svcText, 200, 270);

      // Gaming ID
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('ESP GAMING ID', 200, 298);
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(user.gamingId || `ESPGT${user.userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4) || '01'}`, 200, 320);

      // Sponsor Box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.roundRect(36, 345, 520, 54, 12);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.fillText('UPLINE SPONSOR', 50, 365);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(`${user.sponsorName || 'SANTOSH KUMAR'} (ID: ${user.sponsorId || 'EMO-MOM-MMO'})`, 50, 386);

      // Official QR Code on Right
      if (qrDataUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          // White square container for QR
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(width - 240, 115, 204, 204, 16);
          ctx.fill();
          ctx.drawImage(qrImg, width - 232, 123, 188, 188);

          // QR Label below
          ctx.fillStyle = '#e2e8f0';
          ctx.font = 'bold 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SCAN TO JOIN & VERIFY', width - 138, 338);
          ctx.fillStyle = '#38bdf8';
          ctx.font = '10px monospace';
          ctx.fillText('https://ioisplatform.github.io/', width - 138, 355);
          ctx.textAlign = 'left';

          // Bottom Bar & Signatory
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.moveTo(36, 420);
          ctx.lineTo(width - 36, 420);
          ctx.stroke();

          // Portal URL Bottom Left
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('OFFICIAL PORTAL:', 36, 452);
          ctx.fillStyle = '#34d399';
          ctx.font = 'bold 14px monospace';
          ctx.fillText('https://ioisplatform.github.io/', 160, 452);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px system-ui, sans-serif';
          ctx.fillText('Lifetime Verified Digital Credential • Student & Member Friendly', 36, 475);
          ctx.fillText(`Issued: ${user.joiningDate || new Date().toISOString().split('T')[0]} • Status: ACTIVE VERIFIED`, 36, 495);

          // Authorized Signatory Right
          ctx.fillStyle = '#fde047';
          ctx.font = 'italic bold 20px Georgia, serif';
          ctx.textAlign = 'right';
          ctx.fillText('Santosh Kumar', width - 40, 465);
          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 10px system-ui, sans-serif';
          ctx.fillText('AUTHORIZED SIGNATORY • ESP FOUNDER', width - 40, 485);
          ctx.textAlign = 'left';

          // Download Trigger
          const link = document.createElement('a');
          link.download = `ESP_Digital_ID_${user.userId}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          setIsExporting(false);
        };
        qrImg.src = qrDataUrl;
      } else {
        setIsExporting(false);
      }
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
    }
  };

  const currentTheme = THEMES[theme];

  return (
    <div className="flex flex-col items-center w-full max-w-[500px] mx-auto">
      {/* Theme Picker & Flip Toggle Bar (Only if not compact) */}
      {!compact && (
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-[#f9fafb] p-2.5 rounded-md border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-[#2874f0]" />
            <span className="text-[#212121] font-bold text-[11px]">कार्ड थीम:</span>
            <div className="flex items-center space-x-1">
              {(['emerald', 'gold', 'sapphire', 'ruby'] as CardTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                    t === 'emerald' ? 'bg-emerald-600' :
                    t === 'gold' ? 'bg-amber-500' :
                    t === 'sapphire' ? 'bg-[#2874f0]' : 'bg-rose-600'
                  } ${theme === t ? 'scale-110 border-[#212121] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  title={THEMES[t].name}
                />
              ))}
            </div>
          </div>

          {allowFlip && (
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-sm bg-white hover:bg-[#f5f8ff] text-[#2874f0] font-bold text-[11px] border border-slate-300 transition cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>{isFlipped ? 'सामने देखें (Front)' : 'पीछे देखें (Back)'}</span>
            </button>
          )}
        </div>
      )}

      {/* Notice if Visitor Preview */}
      {isVisitorPreview && (
        <div className="mb-2.5 flex items-center space-x-1.5 text-[11px] bg-[#f5f8ff] border border-blue-200 text-[#212121] font-semibold px-3 py-1.5 rounded-sm shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-[#2874f0]" />
          <span>स्पॉन्सर आईडी कार्ड प्रिव्यू (View-Only Mode)</span>
        </div>
      )}

      {/* Notice if Pending Approval */}
      {!isVisitorPreview && !isApproved && (
        <div className="mb-3 w-full p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5 shadow-2xs">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">सत्यापन प्रक्रिया जारी (Payment Verification)</p>
            <p className="text-[11px] text-amber-800 leading-snug">
              आपका रोल नंबर <strong>{user.userId}</strong> सफलतापूर्वक जनरेट हो चुका है। एडमिन सत्यापन के बाद भी आपका कार्ड पूर्णतः मान्य रहेगा।
            </p>
          </div>
        </div>
      )}

      {/* The 3D Digital ID Card Container */}
      <div
        ref={cardRef}
        id="esp-id-card-printable"
        className={`w-full rounded-3xl overflow-hidden shadow-2xl border bg-gradient-to-br ${currentTheme.bgGradient} ${currentTheme.borderClass} text-white relative transition-all duration-500 ${
          compact ? 'p-4' : 'p-5 sm:p-6'
        }`}
        style={{
          boxShadow: currentTheme.glow,
        }}
      >
        {/* Holographic Top Banner Strip */}
        <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${currentTheme.hologram} animate-pulse`} />

        {/* SIDE 1: FRONT OF THE CARD */}
        {!isFlipped ? (
          <div>
            {/* Header: Platform Branding & Verified Badge */}
            <div className="flex items-start justify-between border-b border-white/10 pb-3 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-white/20">
                  <ShieldCheck className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-amber-300">
                      EARNING SYSTEM PLATFORM
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-semibold tracking-wide flex items-center gap-1">
                    <span>DIGITAL ID CARD (ESP)</span>
                    <span className="text-emerald-400 font-bold">• OFFICIAL</span>
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${currentTheme.badgeBg}`}>
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                  VERIFIED
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                  ID: {user.userId}
                </span>
              </div>
            </div>

            {/* Smart EMV Gold Chip & ISO Hologram Simulation */}
            <div className="flex items-center justify-between px-1 mb-3">
              {/* EMV Microchip */}
              <div className="w-11 h-8 rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border border-yellow-200/60 shadow-inner flex flex-col justify-between p-1 opacity-90">
                <div className="flex justify-between h-1.5 border-b border-yellow-800/40" />
                <div className="flex justify-between h-1.5 border-b border-yellow-800/40" />
                <div className="flex justify-between h-1.5" />
              </div>

              {/* Holographic Seal */}
              <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400/20 via-cyan-400/20 to-purple-400/20 border border-white/20 text-[9px] font-black text-amber-200 flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>ESP GENUINE PASS</span>
              </div>
            </div>

            {/* Member Profile Details & Photo */}
            <div className="flex items-start gap-3.5 mb-3.5">
              {/* Photo / Avatar Box */}
              <div className="relative shrink-0">
                <div className="w-20 h-24 rounded-2xl bg-slate-900 border-2 border-amber-400/80 p-1 shadow-xl overflow-hidden flex flex-col items-center justify-center text-slate-200 bg-gradient-to-b from-slate-800 to-slate-950">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md border-2 border-white/40">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[8px] font-black mt-1.5 text-amber-300 uppercase tracking-wider">
                    ESP MEMBER
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg ring-2 ring-slate-900">
                  <UserCheck className="w-3 h-3" />
                </div>
              </div>

              {/* Text Information */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    सदस्य का नाम (Member Full Name)
                  </p>
                  <h3 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                    {user.fullName}
                  </h3>
                </div>

                {/* Unique ESP Referral Code / Roll No */}
                <div className="bg-black/50 p-2 rounded-xl border border-amber-400/30 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span>💼 ESP REFERRAL CODE / ROLL NO</span>
                    </p>
                    <p className="font-mono font-black text-amber-300 text-sm sm:text-base tracking-wider">
                      {user.userId}
                    </p>
                  </div>
                  <button
                    onClick={handleCopySponsorId}
                    className="p-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition cursor-pointer"
                    title="Copy Referral Code"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Dual ID: Service Plan Joined & Gaming ID */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                    <span className="text-[8px] text-slate-400 block font-bold">JOINED SERVICE</span>
                    <span className="text-cyan-300 font-bold truncate block">
                      {user.chosenServiceName || user.chosenServiceCode}
                    </span>
                    <span className="text-[9px] text-amber-300 font-mono font-bold">
                      Fee: ₹{user.joiningFee}
                    </span>
                  </div>
                  <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
                    <span className="text-[8px] text-slate-400 block font-bold">ESP GAMING ID</span>
                    <span className="text-purple-300 font-mono font-bold truncate block">
                      {user.gamingId || `ESPGT${user.userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4) || '01'}`}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">
                      ESP PLAY Access
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sponsor Details Ribbon */}
            <div className="bg-black/40 rounded-xl p-2 border border-white/10 mb-3 grid grid-cols-2 gap-2 text-[9px]">
              <div>
                <span className="text-slate-400 block text-[8px] font-bold">UPLINE SPONSOR NAME</span>
                <span className="font-bold text-slate-200 truncate block">
                  {user.sponsorName || 'SANTOSH KUMAR'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[8px] font-bold">SPONSOR ID</span>
                <span className="font-mono font-bold text-amber-400 truncate block">
                  {user.sponsorId || 'EMO-MOM-MMO'}
                </span>
              </div>
            </div>

            {/* QR Code & Authority Signatures */}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <div className="flex items-center space-x-2.5">
                {qrDataUrl ? (
                  <div className="bg-white p-1 rounded-xl shadow-lg ring-1 ring-black/10">
                    <img src={qrDataUrl} alt="ESP Referral QR Code" className="w-14 h-14" />
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="text-[8px] text-slate-300 leading-tight space-y-0.5">
                  <p className="font-extrabold text-white text-[9px] flex items-center gap-1">
                    <span>Scan to Join / Verify</span>
                    <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                  </p>
                  <p className="text-slate-400">Official Referral QR Code</p>
                  <p className="text-amber-400 font-mono font-bold">{user.userId}</p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="h-6 flex items-center justify-end">
                  <span className="font-serif italic text-amber-300 text-sm font-bold tracking-wider">
                    Santosh Kumar
                  </span>
                </div>
                <div className="w-24 h-[1px] bg-white/20 my-0.5" />
                <p className="text-[8px] text-slate-300 uppercase font-bold">Authorized Signatory</p>
                <p className="text-[7px] text-emerald-400 font-bold">EARNING SYSTEM PLATFORM</p>
              </div>
            </div>
          </div>
        ) : (
          /* SIDE 2: BACK OF THE CARD (FLIP VIEW) */
          <div className="space-y-3 py-1">
            {/* Magnetic Stripe Bar */}
            <div className="w-full h-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-white/20 rounded-md flex items-center px-4">
              <div className="w-full h-1 bg-gradient-to-r from-amber-400/40 via-cyan-400/40 to-emerald-400/40" />
            </div>

            {/* Official Terms & Conditions */}
            <div className="bg-black/40 rounded-2xl p-3 border border-white/10 space-y-2 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-400 text-xs flex items-center gap-1">
                  <FileBadge className="w-3.5 h-3.5" />
                  ESP MEMBERSHIP TERMS & PRIVILEGES
                </span>
                <span className="text-[8px] text-slate-400 font-mono">NON-TRANSFERABLE</span>
              </div>
              <ul className="text-slate-300 space-y-1 text-[9px] list-disc list-inside leading-relaxed">
                <li>यह कार्ड Earning System Platform (ESP) के अधिकृत सदस्य का डिजिटल पहचान पत्र है।</li>
                <li>यह 10 प्रमुख अर्निंग सर्विसेज (EMO, MMO, MOM, OES, MMS, NWI, आदि) पर आजीवन मान्य है।</li>
                <li>रेफरल कोड <span className="font-mono text-amber-300 font-bold">{user.userId}</span> से टीम बनाकर कमीशन कमाया जा सकता है।</li>
                <li>ESP Gaming Time में भाग लेने हेतु Gaming ID <span className="font-mono text-purple-300 font-bold">{user.gamingId || 'ESPGTSK01'}</span> का प्रयोग करें।</li>
              </ul>
            </div>

            {/* Member Address & Support Details */}
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-bold">MEMBER ADDRESS</span>
                <p className="text-slate-200 mt-0.5 line-clamp-2">
                  {user.fullAddress || 'Registered on ESP Online Portal'}
                </p>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                <span className="text-slate-400 block font-bold">OFFICIAL PORTAL</span>
                <a
                  href="https://ioisplatform.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 underline font-mono block mt-0.5 truncate"
                >
                  ioisplatform.github.io
                </a>
                <span className="text-slate-400 block mt-1">Email: {settings?.supportEmail || 'ioisplatform@gmail.com'}</span>
              </div>
            </div>

            {/* Barcode Graphic */}
            <div className="bg-white p-2 rounded-xl flex flex-col items-center justify-center text-slate-950">
              <div className="flex items-center justify-center space-x-1 h-6 w-full">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-900 h-full"
                    style={{
                      width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1)}px`,
                      opacity: i % 5 === 0 ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono text-[9px] font-bold tracking-widest mt-1 text-slate-800">
                {user.userId} • ESP-OFFICIAL-VERIFIED
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Panel */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 w-full">
          {isVisitorPreview ? (
            <button
              onClick={handleCopySponsorId}
              className="inline-flex items-center px-4 py-2.5 rounded-sm text-xs font-black text-[#212121] bg-[#ffe500] hover:bg-yellow-300 transition shadow-xs cursor-pointer"
            >
              {copiedId ? <Check className="w-4 h-4 mr-1 text-[#388e3c]" /> : <Copy className="w-4 h-4 mr-1" />}
              <span>{copiedId ? 'Sponsor ID Copied!' : `Copy Sponsor ID (${user.userId})`}</span>
            </button>
          ) : (
            <>
              {/* Download HD Card as PNG */}
              <button
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2.5 rounded-sm text-xs font-black text-white bg-[#2874f0] hover:bg-[#1e60d5] transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-1.5" />
                <span>{isExporting ? 'डाउनलोड हो रहा है...' : 'डाउनलोड डिजिटल ID (PNG)'}</span>
              </button>

              {/* Share to WhatsApp */}
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3.5 py-2.5 rounded-sm text-xs font-bold text-white bg-[#388e3c] hover:bg-emerald-700 transition shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 mr-1.5" />
                <span>व्हाट्सएप पर शेयर करें</span>
              </a>

              {/* Print / PDF */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3.5 py-2.5 rounded-sm text-xs font-bold text-[#212121] bg-[#f1f3f6] hover:bg-slate-200 transition border border-slate-300 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" />
                <span>प्रिंट / PDF</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
