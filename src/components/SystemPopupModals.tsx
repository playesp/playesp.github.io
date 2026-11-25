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
  Search,
  Calculator,
  Crown,
  Compass,
  UserCheck,
  Smartphone,
  Layers,
} from 'lucide-react';
import type {
  PlatformSettings,
  ServiceItem,
  UserProfile,
  PublicSponsorPreview,
} from '../types/index.ts';
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
        <div className="bg-gradient-to-r from-[#2874f0] via-[#1d5ed6] to-[#0f3f9c] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              {isGamer ? 'Same-ID Gaming ➔ Earning Upgrade' : 'ESP Earning Platform Guide'}
            </span>
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

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-[#212121]">
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#212121]">अपना Earning Service Plan चुनें:</span>
              <button
                type="button"
                onClick={() => setShowAllDetails(prev => !prev)}
                className="btn-3d px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-[#2874f0] text-[11px] font-bold cursor-pointer"
              >
                {showAllDetails ? 'कम विवरण दिखाएं' : '⋯ More Plans (All 10)'}
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
                    ⋯ More
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              ESP PLAY Gaming &amp; Voice Club
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
                <p className="font-black text-[#212121]">16+ Active Party &amp; Skill Games</p>
                <p className="text-[11px] text-slate-600">Word Bomb, Liar's Dice, Trickster's Cafe, Ludo 3D, Pool &amp; ESP Typing।</p>
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

/* ============================================================================ */
/* REG / JOIN SELECTION-TO-RESULT POPUP                                         */
/* ============================================================================ */
interface JoinSelectionPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: ServiceItem[];
  referralSponsor?: PublicSponsorPreview | null;
  onProceedRegister: (mode: 'business' | 'gamer', serviceCode?: string, fee?: number, sponsorId?: string) => void;
  onOpenMoreMenu?: () => void;
}

export const JoinSelectionPopupModal: React.FC<JoinSelectionPopupModalProps> = ({
  isOpen,
  onClose,
  services,
  referralSponsor,
  onProceedRegister,
  onOpenMoreMenu,
}) => {
  const [joinBranch, setJoinBranch] = useState<'gaming' | 'income'>('gaming');
  const [selectedCode, setSelectedCode] = useState<string>('EMO');
  const [selectedFee, setSelectedFee] = useState<number>(10);

  if (!isOpen) return null;

  const activeService = services.find(s => s.code === selectedCode) || services[0];

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#6d28d9] via-[#2874f0] to-[#fb641b] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              आप प्लेटफ़ॉर्म पर किस लिए आए हैं?
            </span>
            <h2 className="text-fluid-title font-black mt-1 leading-tight">
              अपना उद्देश्य चुनें — तुरंत रिजल्ट देखें
            </h2>
            {referralSponsor && (
              <p className="text-[11px] text-amber-100 mt-0.5 font-semibold">
                Verified Sponsor: {referralSponsor.sponsorName} ({referralSponsor.sponsorId})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d p-2 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-[#212121]">
          {/* Step 1: Primary Purpose Choice (Free Gaming FIRST, Income SECOND) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setJoinBranch('gaming')}
              className={`btn-3d p-3.5 rounded-xl border text-left cursor-pointer ${
                joinBranch === 'gaming'
                  ? 'bg-[#6d28d9] text-white border-[#4c1d95]'
                  : 'bg-slate-50 text-[#212121] border-slate-200 hover:border-indigo-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <Gamepad2 className="w-5 h-5" />
                <span className={`text-[11px] font-black ${joinBranch === 'gaming' ? 'text-[#ffe500]' : 'text-indigo-700'}`}>
                  ₹0 Free · तुरंत Active
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black mt-2">1. Free Gaming Pass</p>
              <p className={`text-[10.5px] mt-0.5 ${joinBranch === 'gaming' ? 'text-indigo-100' : 'text-slate-500'}`}>
                गेम्स, वॉइस क्लब व Same-ID अपग्रेड
              </p>
            </button>

            <button
              type="button"
              onClick={() => setJoinBranch('income')}
              className={`btn-3d p-3.5 rounded-xl border text-left cursor-pointer ${
                joinBranch === 'income'
                  ? 'bg-[#2874f0] text-white border-[#1553b8]'
                  : 'bg-slate-50 text-[#212121] border-slate-200 hover:border-[#2874f0]'
              }`}
            >
              <div className="flex items-center justify-between">
                <Briefcase className="w-5 h-5" />
                <span className={`text-[11px] font-black ${joinBranch === 'income' ? 'text-[#ffe500]' : 'text-[#388e3c]'}`}>
                  ₹10+ · Admin वेरिफाइड
                </span>
              </div>
              <p className="text-xs sm:text-sm font-black mt-2">2. Earning Member Reg</p>
              <p className={`text-[10.5px] mt-0.5 ${joinBranch === 'income' ? 'text-blue-100' : 'text-slate-500'}`}>
                10 प्लान + 50% रेफरल + ID कार्ड
              </p>
            </button>
          </div>

          {/* Step 2: Dynamic Result Based on Selection */}
          {joinBranch === 'income' ? (
            <div className="space-y-3 rounded-xl border border-blue-200 bg-[#f8fbff] p-3.5">
              <p className="text-xs font-black text-[#2874f0]">
                अपना Earning Service Plan चुनें (क्लिक करने पर रिजल्ट अपडेट होगा):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {services.slice(0, 10).map(srv => {
                  const active = srv.code === selectedCode;
                  const firstFee = srv.joiningFeeTiers?.[0] || srv.defaultFee || 10;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSelectedCode(srv.code);
                        setSelectedFee(firstFee);
                      }}
                      className={`btn-3d p-2 rounded-lg text-left border cursor-pointer ${
                        active
                          ? 'bg-[#2874f0] text-white border-[#1553b8]'
                          : 'bg-white text-[#212121] border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-black">
                        <span>{srv.code}</span>
                        <span className={active ? 'text-[#ffe500]' : 'text-[#388e3c]'}>₹{firstFee}+</span>
                      </div>
                      <p className={`text-[10px] truncate ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                        {srv.referralBonusPercent}% Ref
                      </p>
                    </button>
                  );
                })}
              </div>

              {activeService && (
                <div className="bg-white rounded-lg border border-blue-100 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-[#212121]">{activeService.name}</h4>
                      <p className="text-[11px] text-slate-600">{activeService.hindiDescription || activeService.description}</p>
                    </div>
                    <span className="text-xs font-black text-[#388e3c] tabular-nums">
                      Est: {activeService.dailyEarningEst}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeService.joiningFeeTiers || [10, 50, 100]).map(fee => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() => setSelectedFee(fee)}
                        className={`btn-3d px-3 py-1 rounded text-xs font-black cursor-pointer ${
                          selectedFee === fee
                            ? 'bg-[#fb641b] text-white'
                            : 'bg-slate-100 text-[#212121]'
                        }`}
                      >
                        ₹{fee}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedRegister('business', selectedCode, selectedFee, referralSponsor?.sponsorId);
                }}
                className="btn-3d w-full py-3 px-4 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                <span>{selectedCode} (₹{selectedFee}) रजिस्ट्रेशन फॉर्म खोलें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3.5">
              <div className="flex items-start gap-2.5">
                <Gamepad2 className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black text-indigo-950 text-sm">
                    100% Free Gaming Club Pass (₹0 शुल्क)
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    तुरंत अपनी अनोखी Gaming ID, 8-सीट लाइव वॉइस रूम, लूडो/बिंगो गेम्स और डेली स्ट्रीक कॉइन्स पाएं। भविष्य में जब चाहें इसी ID को ₹10+ अर्निंग प्लान में अपग्रेड करें।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedRegister('gamer', 'GAMING', 0, referralSponsor?.sponsorId);
                }}
                className="btn-3d w-full py-3 px-4 rounded-lg bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-black text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Free Gaming Account बनाएं</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {onOpenMoreMenu && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMoreMenu();
                }}
                className="btn-3d px-3 py-1.5 rounded bg-slate-100 text-[#2874f0] text-xs font-bold cursor-pointer"
              >
                ⋯ More System Options
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================ */
/* NEW VISITOR SELECTION-TO-RESULT POPUP                                        */
/* ============================================================================ */
interface NewVisitorSelectionPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
  services: ServiceItem[];
  referralSponsor?: PublicSponsorPreview | null;
  onSelectRegister: (mode: 'business' | 'gamer', serviceCode?: string, fee?: number, sponsorId?: string) => void;
  onOpenTab: (tab: string) => void;
  onOpenMoreMenu: () => void;
}

type VisitorTopicId = 'income' | 'gaming' | 'swi' | 'nwi' | 'calc' | 'sponsor';

export const NewVisitorSelectionPopupModal: React.FC<NewVisitorSelectionPopupModalProps> = ({
  isOpen,
  onClose,
  settings,
  services,
  referralSponsor,
  onSelectRegister,
  onOpenTab,
  onOpenMoreMenu,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<VisitorTopicId>(referralSponsor ? 'sponsor' : 'income');
  const [calcTier, setCalcTier] = useState<number>(100);
  const [calcRefs, setCalcRefs] = useState<number>(10);
  const [sponsorInput, setSponsorInput] = useState<string>(referralSponsor?.sponsorId || '');
  const [sponsorLoading, setSponsorLoading] = useState<boolean>(false);
  const [verifiedSponsor, setVerifiedSponsor] = useState<PublicSponsorPreview | null>(referralSponsor || null);
  const [sponsorError, setSponsorError] = useState<string>('');

  useEffect(() => {
    if (referralSponsor) {
      setVerifiedSponsor(referralSponsor);
      setSponsorInput(referralSponsor.sponsorId);
    }
  }, [referralSponsor]);

  if (!isOpen) return null;

  const estimatedDirect = calcTier * 0.5 * calcRefs;
  const estimatedMonthly = estimatedDirect + calcTier * 1.5 * 30;

  const handleLookupSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = sponsorInput.trim().replace(/^@+/, '');
    if (!clean) return;
    setSponsorLoading(true);
    setSponsorError('');
    try {
      const res = await api.getPublicSponsorPreview(clean);
      if (res && res.valid) {
        setVerifiedSponsor(res);
      } else {
        setVerifiedSponsor(null);
        setSponsorError('यह Sponsor ID / Username रिकॉर्ड में नहीं मिला।');
      }
    } catch {
      setSponsorError('स्पॉन्सर चेक करने में समस्या हुई।');
    } finally {
      setSponsorLoading(false);
    }
  };

  const topics: Array<{ id: VisitorTopicId; label: string; icon: React.ReactNode }> = [
    { id: 'income', label: '10 Earning Plans', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'gaming', label: 'Free Gaming', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'swi', label: 'SWI 3.3% App', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'nwi', label: 'NWI 3-Level', icon: <Crown className="w-3.5 h-3.5" /> },
    { id: 'calc', label: 'Calculator', icon: <Calculator className="w-3.5 h-3.5" /> },
    { id: 'sponsor', label: 'Verify Sponsor', icon: <UserCheck className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-[#2874f0] to-[#0f3f9c] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
              <Compass className="w-3 h-3" />
              <span>New Visitor Guide · Select Option</span>
            </span>
            <h2 className="text-fluid-title font-black mt-1 leading-tight">
              अपना विषय चुनें — तुरंत रिजल्ट पॉपअप में देखें
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-3d p-2 rounded-full bg-white/15 hover:bg-white/25 text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-[#212121]">
          {/* Topic Selector Pills (Interactive Selection Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {topics.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTopic(t.id)}
                className={`btn-3d px-3 py-2.5 rounded-lg text-xs font-black flex items-center gap-2 cursor-pointer ${
                  selectedTopic === t.id
                    ? 'bg-[#2874f0] text-white'
                    : 'bg-slate-100 text-[#212121] hover:bg-blue-50'
                }`}
              >
                {t.icon}
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Selection Result Area */}
          {selectedTopic === 'income' && (
            <div className="rounded-xl border border-blue-200 bg-[#f8fbff] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-black text-[#212121]">ESP 10 अर्निंग प्लान्स (मात्र ₹10 से शुरू)</h3>
                <span className="text-xs font-black text-[#388e3c]">40%–70% Referral</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {services.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectRegister('business', s.code, s.defaultFee, verifiedSponsor?.sponsorId);
                    }}
                    className="btn-3d p-2 rounded-lg bg-white border border-slate-200 hover:border-[#2874f0] text-left cursor-pointer"
                  >
                    <strong className="text-[#2874f0] block">{s.code}</strong>
                    <span className="text-[11px] font-bold text-[#388e3c]">₹{s.defaultFee}+ Join</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                नामांकन करते ही आपका Digital ID Card बनता है। ₹50 होते ही सीधे UPI ({settings.adminPayeeName} वेरिफाइड चैनल) से पेआउट मिलता है।
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRegister('business', 'EMO', 10, verifiedSponsor?.sponsorId);
                  }}
                  className="btn-3d flex-1 py-2.5 px-4 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
                >
                  ₹10+ से अभी Income Join करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTab('services');
                  }}
                  className="btn-3d py-2.5 px-3.5 rounded-lg bg-white border border-slate-300 text-[#2874f0] font-bold text-xs cursor-pointer"
                >
                  सभी 10 प्लान देखें
                </button>
              </div>
            </div>
          )}

          {selectedTopic === 'gaming' && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-3">
              <h3 className="text-sm font-black text-indigo-950">ESP Free Gaming &amp; Voice Club (₹0 Free)</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                बिना किसी शुल्क के वॉइस रूम, लूडो 3D, स्पेस वेयरवोल्फ, बिंगो व डेली स्ट्रीक रिवॉर्ड्स का आनंद लें। जब भी कमाई शुरू करना चाहें, आपकी इसी ID पर Admin वेरिफिकेशन से ₹10+ प्लान सक्रिय हो जाएगा।
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectRegister('gamer', 'GAMING', 0, verifiedSponsor?.sponsorId);
                }}
                className="btn-3d w-full py-2.5 px-4 rounded-lg bg-[#6d28d9] text-white font-black text-xs cursor-pointer"
              >
                Free Gaming Pass अभी बनाएं
              </button>
            </div>
          )}

          {selectedTopic === 'swi' && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-orange-950">SWI — 3.3% स्पेशल रिचार्ज ऐप (₹300)</h3>
                <span className="text-xs font-black text-[#fb641b]">₹150 Sponsor Bonus</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                SWI ₹300 एक्टिवेट करने व एडमिन सत्यापन के बाद आपके डैशबोर्ड में 3.3% मोबाइल/DTH रिचार्ज ऐप लिंक प्राप्त होता है तथा प्रत्येक SWI रेफरल पर सीधे ₹150 (50%) कमीशन मिलता है।
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectRegister('business', 'SWI', 300, verifiedSponsor?.sponsorId);
                }}
                className="btn-3d w-full py-2.5 px-4 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
              >
                SWI ₹300 प्लान से जॉइन करें
              </button>
            </div>
          )}

          {selectedTopic === 'nwi' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-3">
              <h3 className="text-sm font-black text-emerald-950">NWI — 3-Level नॉन-वर्किंग ऑटो ट्री (₹200+)</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                ऑटो-स्पिलओवर ट्री के तहत Level 1 (10%), Level 2 (15%) और Level 3 (25%) तक वास्तविक डाउनलाइन बोनस प्राप्त करें।
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRegister('business', 'NWI', 200, verifiedSponsor?.sponsorId);
                  }}
                  className="btn-3d flex-1 py-2.5 px-4 rounded-lg bg-[#388e3c] text-white font-black text-xs cursor-pointer"
                >
                  NWI ₹200+ जॉइन करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTab('nwi');
                  }}
                  className="btn-3d py-2.5 px-3.5 rounded-lg bg-white border border-slate-300 text-emerald-800 font-bold text-xs cursor-pointer"
                >
                  NWI पेज देखें
                </button>
              </div>
            </div>
          )}

          {selectedTopic === 'calc' && (
            <div className="rounded-xl border border-blue-200 bg-[#f8fbff] p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 300].map(fee => (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => setCalcTier(fee)}
                    className={`btn-3d py-2 rounded text-xs font-black cursor-pointer ${
                      calcTier === fee ? 'bg-[#2874f0] text-white' : 'bg-white border border-slate-300 text-[#212121]'
                    }`}
                  >
                    ₹{fee}
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>डायरेक्ट रेफरल्स:</span>
                  <span className="text-[#2874f0] tabular-nums">{calcRefs} Members</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={50}
                  value={calcRefs}
                  onChange={e => setCalcRefs(Number(e.target.value))}
                  className="w-full accent-[#2874f0] cursor-pointer"
                />
              </div>
              <div className="p-3 rounded-lg bg-white border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block font-semibold">अनुमानित मासिक कमाई</span>
                  <strong className="text-xl font-black text-[#212121] tabular-nums">
                    ₹{Math.round(estimatedMonthly).toLocaleString('en-IN')}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectRegister('business', 'EMO', calcTier, verifiedSponsor?.sponsorId);
                  }}
                  className="btn-3d px-4 py-2 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
                >
                  ₹{calcTier} से शुरू करें
                </button>
              </div>
            </div>
          )}

          {selectedTopic === 'sponsor' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
              <form onSubmit={handleLookupSponsor} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={sponsorInput}
                  onChange={e => setSponsorInput(e.target.value)}
                  placeholder="Sponsor ID या @username लिखें (उदा. EMO-MOM-MMO)"
                  className="flex-1 bg-white border border-slate-300 focus:border-[#2874f0] rounded-lg px-3 py-2 text-xs font-mono outline-none"
                />
                <button
                  type="submit"
                  disabled={sponsorLoading}
                  className="btn-3d px-4 py-2 rounded-lg bg-[#2874f0] text-white font-black text-xs cursor-pointer disabled:opacity-50"
                >
                  {sponsorLoading ? 'जांच हो रही है...' : 'Verify Sponsor'}
                </button>
              </form>
              {sponsorError && <p className="text-xs font-bold text-rose-600">{sponsorError}</p>}
              {verifiedSponsor && (
                <div className="bg-white rounded-lg border border-emerald-300 p-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black text-[#388e3c] uppercase">✓ Verified Sponsor</span>
                    <p className="text-sm font-black text-[#212121]">{verifiedSponsor.sponsorName}</p>
                    <p className="text-xs font-mono text-[#2874f0]">ID: {verifiedSponsor.sponsorId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectRegister('business', 'EMO', 10, verifiedSponsor.sponsorId);
                    }}
                    className="btn-3d px-4 py-2 rounded-lg bg-[#fb641b] text-white font-black text-xs cursor-pointer"
                  >
                    इनके साथ Join करें
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-500">अन्य सभी टूल्स व हेल्प के लिए System Menu खोलें</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMoreMenu();
              }}
              className="btn-3d px-3 py-1.5 rounded bg-slate-100 text-[#2874f0] font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>⋯ More / System Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================ */
/* MORE / SYSTEM MENU POPUP WITH BUILT-IN SEARCH                                */
/* ============================================================================ */
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
  title = 'System Menu & More',
  subtitle = 'सभी सिस्टम टूल्स, प्लान्स व सहायता केंद्र यहाँ उपलब्ध हैं',
  items,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const clean = query.trim().toLowerCase();
  const filteredItems = clean
    ? items.filter(
        it =>
          it.label.toLowerCase().includes(clean) ||
          (it.subLabel || '').toLowerCase().includes(clean)
      )
    : items;

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-xl bg-white border border-slate-200 overflow-hidden flex flex-col rounded-t-2xl sm:rounded-2xl">
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

        {/* Built-in Quick Search inside System Menu Popup (keeps top header ultra clean) */}
        <div className="px-3.5 sm:px-4 pt-3 pb-1 bg-white">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="सिस्टम मेन्यू खोजें (SWI, NWI, Games, Legal, Helpline...)"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 border border-slate-200 focus:border-[#2874f0] focus:bg-white text-xs text-[#212121] outline-none"
            />
          </div>
        </div>

        <div className="p-3.5 sm:p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[65dvh]">
          {filteredItems.map(item => (
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
          {filteredItems.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-500">
              कोई विकल्प नहीं मिला — दूसरा शब्द लिखें
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================ */
/* ATTRACTIVE WELCOME PLATFORM POPUP MODAL FOR NEW HOME VISITORS                */
/* ============================================================================ */
interface WelcomePlatformPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlatformSettings;
  referralSponsor?: PublicSponsorPreview | null;
  onChooseRegister: (mode: 'gamer' | 'business', serviceCode?: string, fee?: number, sponsorId?: string) => void;
  onOpenLogin: () => void;
  onOpenVisitorGuide: () => void;
}

export const WelcomePlatformPopupModal: React.FC<WelcomePlatformPopupModalProps> = ({
  isOpen,
  onClose,
  settings,
  referralSponsor,
  onChooseRegister,
  onOpenLogin,
  onOpenVisitorGuide,
}) => {
  if (!isOpen) return null;

  const headline =
    settings.welcomePopupHeadline?.trim() ||
    'ESP Earning & Gaming World में आपका स्वागत है!';
  const note =
    settings.welcomePopupNote?.trim() ||
    'अपनी पसंद चुनें: ₹0 में तुरंत Free Gaming खेलें या ₹10+ Earning Plan से डेली UPI इनकम शुरू करें!';

  return (
    <div className="fixed inset-0 z-[98] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-2xl bg-white border border-slate-200 overflow-hidden flex flex-col">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-[#2874f0] via-[#1d5ed6] to-[#6d28d9] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close welcome popup"
            className="btn-3d absolute right-3.5 top-3.5 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="pr-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Earning System Platform (ESP)</span>
              </span>
              {referralSponsor && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-400/20 border border-emerald-200/40 text-emerald-100 text-[10px] font-bold">
                  ✓ Sponsor: {referralSponsor.sponsorName} ({referralSponsor.sponsorId})
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-2xl font-black leading-tight text-white [text-wrap:balance]">
              {headline}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {note}
            </p>
          </div>
        </div>

        {/* Platform Features Overview */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-[#212121]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#6d28d9] text-white flex items-center justify-center shrink-0">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-indigo-950">Free Gaming Club (₹0 · तुरंत Active)</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  16+ मल्टीप्लेयर व स्किल गेम्स, 8-सीट लाइव वॉइस क्लब, टाइपिंग एकेडमी व डेली स्ट्रीक कॉइन्स।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f5f8ff] border border-blue-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2874f0] text-white flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-[#212121]">10 Earning Services (₹10+ से शुरू)</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  EMO, MMO, SWI 3.3% स्पेशल रिचार्ज ऐप व NWI 3-Level ऑटो ट्री — 40%–70% रेफरल बोनस।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#388e3c] text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-emerald-950">Verified Digital ID &amp; Same-ID अपग्रेड</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  एडमिन वेरिफिकेशन के बाद डिजिटल ID कार्ड, व फ्री गेमिंग से उसी ID पर कमाई में अपग्रेड।
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fb641b] text-white flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-black text-amber-950">Direct UPI पेआउट &amp; 4-Device Sync</p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  न्यूनतम ₹50 होते ही PhonePe/GPay/Paytm निकासी + मोबाइल व लैपटॉप पर सुरक्षित लॉगिन।
                </p>
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
            <p className="text-xs font-black text-[#212121] text-center">
              अभी शुरू करने के लिए अपना विकल्प चुनें:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChooseRegister('gamer', 'GAMING', 0, referralSponsor?.sponsorId);
                }}
                className="btn-3d py-3 px-4 rounded-xl bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span>🎮 ESP Game Join (₹0 Free)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onChooseRegister('business', 'EMO', 10, referralSponsor?.sponsorId);
                }}
                className="btn-3d py-3 px-4 rounded-xl bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>💼 ESP Income Reg (₹10+)</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="btn-3d px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[#2874f0] font-bold cursor-pointer"
              >
                🔑 पहले से खाता है? Login करें
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVisitorGuide();
                }}
                className="btn-3d px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-[#212121] font-bold cursor-pointer"
              >
                📘 प्लान व कमाई गाइड देखें
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
