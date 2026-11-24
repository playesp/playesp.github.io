import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  Briefcase,
  Gamepad2,
  Coins,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  Sparkles,
  ArrowRight,
  Mic,
  Gift,
  Trophy,
  Grid,
  ChevronRight,
  Lock,
} from 'lucide-react';
import type { PlatformSettings, ServiceItem, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

interface KnowIncomeAndUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  settings: PlatformSettings;
  services: ServiceItem[];
  onUpgradeSubmitted?: (message: string) => void;
  onVisitorJoinPlan?: (serviceCode: string, fee: number) => void;
  onOpenMorePlans?: () => void;
}

export const KnowIncomeAndUpgradeModal: React.FC<KnowIncomeAndUpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  services,
  onUpgradeSubmitted,
  onVisitorJoinPlan,
  onOpenMorePlans,
}) => {
  const isGamer = user?.accountType === 'gamer';
  const [selectedCode, setSelectedCode] = useState<string>('EMO');
  const [selectedFee, setSelectedFee] = useState<number>(10);
  const [paymentUtr, setPaymentUtr] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAllDetails, setShowAllDetails] = useState(false);

  const selectedService =
    services.find(s => s.code === selectedCode) ||
    services[0] || {
      id: 'emo',
      code: 'EMO',
      name: 'EARN MONEY ONLINE (EMO)',
      hindiName: 'अर्न मनी ऑनलाइन',
      description: 'Direct sponsor income & daily rewards starting ₹10.',
      hindiDescription: '₹10 से शुरुआत और 50% तक डायरेक्ट रेफरल बोनस।',
      category: 'direct' as const,
      joiningFeeTiers: [10, 50, 100],
      defaultFee: 10,
      dailyEarningEst: '₹200 – ₹1,500/दिन',
      referralBonusPercent: 50,
      icon: '⚡',
      features: ['Digital ID Card', 'Direct UPI Payout', '50% Sponsor Bonus'],
      active: true,
    };

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    const upiStr = `upi://pay?pa=${encodeURIComponent(settings.adminUpiId)}&pn=${encodeURIComponent(
      settings.adminPayeeName || 'ESP PLATFORM'
    )}&am=${selectedFee}&cu=INR&tn=${encodeURIComponent(
      `ESP ${user?.userId || 'NEW'} ${selectedCode}`
    )}`;
    QRCode.toDataURL(upiStr, { width: 200, margin: 1 })
      .then(url => setQrDataUrl(url))
      .catch(() => {});
  }, [isOpen, selectedFee, selectedCode, settings.adminUpiId, settings.adminPayeeName, user?.userId]);

  if (!isOpen) return null;

  const handleSelectPlan = (srv: ServiceItem) => {
    setSelectedCode(srv.code);
    const fee = srv.joiningFeeTiers?.[0] || srv.defaultFee || 10;
    setSelectedFee(fee);
    setFeedback(null);
  };

  const handleScreenshotUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPaymentScreenshot(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSameIdUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFeedback(null);
    const cleanUtr = paymentUtr.trim();
    if (cleanUtr.length < 6) {
      setFeedback({ type: 'error', text: 'कृपया सही 12-अंकों का UPI UTR नंबर दर्ज करें।' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.submitPlanUpgrade(user.userId, selectedCode, selectedFee, cleanUtr, {
        paymentScreenshot: paymentScreenshot || undefined,
        upgradeType: isGamer ? 'gamer_to_business' : 'plan_upgrade',
      });
      if (res.success) {
        try {
          confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        } catch {}
        setFeedback({
          type: 'success',
          text:
            res.message ||
            `🎉 आपकी वही ID (${user.userId}) पर ${selectedCode} (₹${selectedFee}) अपग्रेड अनुरोध एडमिन वेरिफिकेशन के लिए भेज दिया गया है!`,
        });
        setPaymentUtr('');
        setPaymentScreenshot('');
        onUpgradeSubmitted?.(res.message);
      } else {
        setFeedback({ type: 'error', text: res.message || 'अनुरोध सबमिट नहीं हो सका।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'सर्वर त्रुटि हुई।' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2874f0] via-[#1d5ed6] to-[#0f3f9c] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              <Sparkles className="w-3 h-3" />
              <span>{isGamer ? 'Same-ID Gaming ➔ Earning Upgrade' : 'ESP Earning Platform Guide'}</span>
            </div>
            <h2 className="text-fluid-title font-black mt-1 leading-tight">
              {isGamer
                ? 'एक ही ID से Gaming + Income दोनों शुरू करें!'
                : 'ESP Earning Platform कैसे काम करता है?'}
            </h2>
            <p className="text-[11px] sm:text-xs text-blue-100 mt-0.5">
              {user
                ? `आपकी ID (${user.userId}) वही रहेगी — नया अकाउंट बनाने की कोई जरूरत नहीं!`
                : 'मात्र ₹10 से जुड़ें, रेफर करें और सीधे UPI में कमाई पाएं।'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d p-2 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-[#212121]">
          {/* Same-ID Lock Guarantee */}
          {user && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-3 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#388e3c] shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-black text-emerald-950">
                  100% Same-ID Guarantee (कोई अलग ID नहीं बनेगी!)
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  आपकी मौजूदा <strong>ESP ID: {user.userId}</strong>, <strong>Gaming ID: {user.gamingId || 'Locked'}</strong> और{' '}
                  <strong>Room ID: {user.personalRoomId || user.roomAddress || 'Locked'}</strong> वही रहेंगी। एडमिन वेरिफिकेशन होते ही इसी ID पर अर्निंग डैशबोर्ड खुल जाएगा।
                </p>
              </div>
            </div>
          )}

          {/* 3 Simple Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-[#f5f8ff] border border-blue-200 space-y-1">
              <span className="font-black text-[#2874f0]">1. प्लान चुनें (₹10+)</span>
              <p className="text-[11px] text-slate-600">EMO ₹10 से लेकर SWI ₹300 (3.3% App) या NWI ₹200 चुनें।</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
              <span className="font-black text-[#fb641b]">2. रेफर &amp; टीम आय</span>
              <p className="text-[11px] text-slate-600">हर डायरेक्ट जॉइनिंग पर 40%–50% तुरंत वॉलेट में पाएं।</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="font-black text-[#388e3c]">3. डायरेक्ट UPI पेआउट</span>
              <p className="text-[11px] text-slate-600">न्यूनतम ₹50 होते ही PhonePe / GPay / Paytm में निकासी।</p>
            </div>
          </div>

          {/* Plan Selector Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#212121]">अपना Earning Service Plan चुनें:</span>
              <button
                type="button"
                onClick={() => setShowAllDetails(prev => !prev)}
                className="btn-3d px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-[#2874f0] text-[11px] font-bold cursor-pointer"
              >
                {showAllDetails ? 'कम विवरण दिखाएं' : '⋯ More Plan Details'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {services.slice(0, showAllDetails ? 10 : 5).map(srv => {
                const active = srv.code === selectedCode;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => handleSelectPlan(srv)}
                    className={`btn-3d p-2.5 rounded-lg text-left border cursor-pointer ${
                      active
                        ? 'bg-[#2874f0] text-white border-[#1553b8]'
                        : 'bg-white text-[#212121] border-slate-200 hover:border-[#2874f0]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>{srv.code}</span>
                      <span className={active ? 'text-[#ffe500]' : 'text-[#388e3c]'}>
                        ₹{srv.joiningFeeTiers?.[0] || srv.defaultFee}+
                      </span>
                    </div>
                    <p className={`text-[10px] mt-0.5 truncate ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                      {srv.referralBonusPercent}% Bonus
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Plan Info Box */}
          <div className="rounded-lg border border-blue-200 bg-[#f8fbff] p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-[#212121]">
                  {selectedService.name} ({selectedService.code})
                </h4>
                <p className="text-[11px] text-slate-600">{selectedService.hindiDescription || selectedService.description}</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#ffe500] text-[#212121] font-black text-xs tabular-nums">
                Est: {selectedService.dailyEarningEst}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(selectedService.joiningFeeTiers || [10, 50, 100]).map(fee => (
                <button
                  key={fee}
                  type="button"
                  onClick={() => setSelectedFee(fee)}
                  className={`btn-3d px-3 py-1 rounded text-xs font-black cursor-pointer ${
                    selectedFee === fee
                      ? 'bg-[#fb641b] text-white'
                      : 'bg-white border border-slate-300 text-[#212121]'
                  }`}
                >
                  ₹{fee} चुनें
                </button>
              ))}
            </div>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-lg text-xs font-bold border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Action Section: Logged-in Gamer/Member -> Direct Same-ID Upgrade Form | Visitor -> Join Plan */}
          {user ? (
            <form onSubmit={handleSameIdUpgradeSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Admin UPI QR"
                    className="w-28 h-28 rounded-lg border border-slate-300 bg-white p-1 shrink-0"
                  />
                )}
                <div className="flex-1 space-y-1.5 text-xs w-full">
                  <p className="font-black text-[#212121]">
                    स्टेप: UPI पर <span className="text-[#fb641b]">₹{selectedFee}</span> भेजें और UTR सबमिट करें
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded px-2.5 py-1.5">
                    <span className="font-mono font-bold text-[#2874f0] truncate">{settings.adminUpiId}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.adminUpiId).catch(() => {});
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="btn-3d px-2 py-1 rounded bg-blue-50 text-[#2874f0] text-[10px] font-black cursor-pointer shrink-0 inline-flex items-center gap-1"
                    >
                      {copiedUpi ? <Check className="w-3 h-3 text-[#388e3c]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                    </button>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Payee: <strong>{settings.adminPayeeName}</strong> · सत्यापन Admin Panel में होगा।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#212121] block mb-1">
                    12-अंकों का UPI UTR / Ref नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentUtr}
                    onChange={e => setPaymentUtr(e.target.value)}
                    placeholder="उदा. 412345678901"
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded px-3 py-2 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#212121] block mb-1">
                    पेमेंट स्क्रीनशॉट (वैकल्पिक)
                  </label>
                  <label className="w-full bg-white border border-dashed border-slate-300 hover:border-[#2874f0] rounded px-3 py-2 text-xs font-semibold text-slate-600 flex items-center justify-between cursor-pointer">
                    <span className="truncate">
                      {paymentScreenshot ? '✅ स्क्रीनशॉट अपलोड हो गया' : 'Screenshot चुनें'}
                    </span>
                    <Upload className="w-3.5 h-3.5 text-[#2874f0] shrink-0" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleScreenshotUpload(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-3d flex-1 min-w-[200px] py-2.5 px-4 rounded-md bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'सबमिट हो रहा है...'
                      : `Same ID (${user.userId}) से ${selectedCode} ₹${selectedFee} अपग्रेड भेजें`}
                  </span>
                </button>
                {onOpenMorePlans && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMorePlans();
                    }}
                    className="btn-3d px-3 py-2.5 rounded-md bg-white border border-slate-300 text-[#2874f0] text-xs font-bold cursor-pointer"
                  >
                    ⋯ More Options
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVisitorJoinPlan?.(selectedCode, selectedFee);
                }}
                className="btn-3d flex-1 py-3 px-4 rounded-md bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>{selectedCode} (₹{selectedFee}) के साथ अभी जॉइन करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {onOpenMorePlans && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMorePlans();
                  }}
                  className="btn-3d px-3.5 py-3 rounded-md bg-slate-100 text-[#2874f0] text-xs font-bold cursor-pointer"
                >
                  ⋯ More
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface KnowGamingSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onEnterGamingRoom: () => void;
  onOpenBuyCoins?: () => void;
  onOpenMore?: () => void;
}

export const KnowGamingSystemModal: React.FC<KnowGamingSystemModalProps> = ({
  isOpen,
  onClose,
  user,
  onEnterGamingRoom,
  onOpenBuyCoins,
  onOpenMore,
}) => {
  const [showExtraInfo, setShowExtraInfo] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-xl bg-white border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#6d28d9] via-[#4f46e5] to-[#2563eb] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              <Gamepad2 className="w-3 h-3" />
              <span>ESP PLAY Gaming &amp; Voice Club</span>
            </span>
            <h2 className="text-fluid-title font-black mt-1">
              आपकी यही ID पहले से Gaming के लिए तैयार है!
            </h2>
            <p className="text-[11px] sm:text-xs text-indigo-100">
              {user
                ? `अलग से Gaming ID नहीं बनानी — आपकी ID ${user.userId} और Gaming ID ${user.gamingId || 'Auto'} सिंक हैं!`
                : 'लॉबी, लाइव वॉइस स्टेज, लूडो 3D और डेली कॉइन रिवॉर्ड्स की पूरी जानकारी।'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-[#212121]">
          {user && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-[10px] font-bold text-slate-500 block">Gaming ID</span>
                <strong className="font-mono text-[#2874f0] text-[11px] break-all">
                  {user.gamingId || `ESPGT${user.userId.slice(-4)}`}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-slate-500 block">Coins</span>
                <strong className="font-mono text-[#fb641b] text-sm">
                  🪙 {(user.coins || 0).toLocaleString()}
                </strong>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200">
                <span className="text-[10px] font-bold text-slate-500 block">Personal Room</span>
                <strong className="font-mono text-purple-700 text-sm">
                  #{user.personalRoomId || user.roomAddress || '10001'}
                </strong>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-[#f8fbff] flex items-start gap-2.5">
              <Mic className="w-4 h-4 text-[#2874f0] shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#212121]">8-Seat Live Voice Room</p>
                <p className="text-[11px] text-slate-600">आपका स्थायी रूम नंबर, गिफ्ट कॉम्बो व PK बैटल सिस्टम।</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-amber-50/70 flex items-start gap-2.5">
              <Trophy className="w-4 h-4 text-[#fb641b] shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#212121]">12+ Interactive Games</p>
                <p className="text-[11px] text-slate-600">Ludo 3D, Space Werewolf, Bingo, Spin &amp; Card Arena।</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-emerald-50/70 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#388e3c] shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#212121]">Weekly Rewards &amp; +5 Tasks</p>
                <p className="text-[11px] text-slate-600">रात 12 बजे (IST) लाइव API रिसेट — डेली स्ट्रीक रिवॉर्ड्स।</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-purple-50/70 flex items-start gap-2.5">
              <Gift className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-[#212121]">Digital Gift Card Store</p>
                <p className="text-[11px] text-slate-600">कॉइन्स से VIP फ्रेम्स, फैमिली गिफ्ट और वाउचर अनलॉक करें।</p>
              </div>
            </div>
          </div>

          {showExtraInfo && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-700 space-y-1">
              <p className="font-black text-[#212121]">नियम व पारदर्शिता:</p>
              <p>• कॉइन्स केवल इन-ऐप गेम्स, VIP पास, रूम थीम और गिफ्ट्स के लिए हैं (रियल ₹ कैश बैलेंस अलग रहता है)।</p>
              <p>• आपकी अर्निंग और गेमिंग प्रोफाइल दोनों एक ही पासवर्ड व 4-डिवाइस सेशन सुरक्षा से सुरक्षित हैं।</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEnterGamingRoom();
              }}
              className="btn-3d flex-1 min-w-[180px] py-2.5 px-4 rounded-md bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>अभी Gaming Room खोलें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuyCoins();
                }}
                className="btn-3d py-2.5 px-3.5 rounded-md bg-[#ffe500] text-[#212121] font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-4 h-4" />
                <span>Buy Coins</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => (onOpenMore ? (onClose(), onOpenMore()) : setShowExtraInfo(v => !v))}
              className="btn-3d py-2.5 px-3 rounded-md bg-slate-100 text-[#2874f0] font-bold text-xs cursor-pointer"
            >
              ⋯ More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface MoreOptionItem {
  id: string;
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
}

interface MoreOptionsPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  items: MoreOptionItem[];
}

export const MoreOptionsPopupModal: React.FC<MoreOptionsPopupModalProps> = ({
  isOpen,
  onClose,
  title = 'More Options & Extra Tools',
  subtitle = 'अतिरिक्त सुविधाएं और सहायता केंद्र यहाँ एक जगह उपलब्ध हैं',
  items,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-lg bg-white border border-slate-200 overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl">
        <div className="bg-gradient-to-r from-[#2874f0] to-[#1a56db] text-white p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#ffe500] text-[#212121] flex items-center justify-center shrink-0">
              <Grid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate">{title}</h3>
              <p className="text-[11px] text-blue-100 truncate">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className="btn-3d p-3 rounded-xl bg-slate-50 hover:bg-[#f5f8ff] border border-slate-200 hover:border-[#2874f0] flex items-center justify-between gap-2.5 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#2874f0]">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#212121] truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[9px] font-black shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {item.subLabel && (
                    <p className="text-[10.5px] text-slate-500 truncate">{item.subLabel}</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
