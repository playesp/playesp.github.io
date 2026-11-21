import React, { useState, useEffect } from 'react';
import {
  Gift, X, Copy, Check, Sparkles, Coins, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GiftCardVoucher, GiftCardRedemption, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DigitalGiftCardsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenBuyCoins?: () => void;
}

export const DigitalGiftCardsModal: React.FC<DigitalGiftCardsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onOpenBuyCoins,
}) => {
  const [vouchers, setVouchers] = useState<GiftCardVoucher[]>([]);
  const [myRedemptions, setMyRedemptions] = useState<GiftCardRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, user.userId]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [cards, redemptions] = await Promise.all([
        api.getGiftCards(),
        api.getGiftCardRedemptions(user.userId),
      ]);
      setVouchers(Array.isArray(cards) ? cards : []);
      setMyRedemptions(Array.isArray(redemptions) ? redemptions : []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'गिफ्ट कार्ड लोड करने में समस्या आई');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucher: GiftCardVoucher) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if ((user.coins || 0) < voucher.coinsRequired) {
      setErrorMsg(`अपर्याप्त कॉइन्स! इस ${voucher.title} के लिए ${voucher.coinsRequired.toLocaleString()} कॉइन्स चाहिए। आपके पास ${user.coins || 0} कॉइन्स हैं।`);
      return;
    }

    setRedeemingId(voucher.id);
    try {
      const res = await api.redeemGiftCard(user.userId, voucher.id);
      if (res.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        if (res.user) {
          onUpdateUser(res.user);
        }
        setSuccessMsg(res.message || 'गिफ्ट कार्ड अनुरोध सबमिट हुआ! एडमिन सत्यापन के बाद असली वाउचर कोड यहाँ दिखेगा।');
        await loadData();
      } else {
        setErrorMsg(res.message || 'रिडीम असफल रहा');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'रिडीम करने में त्रुटि आई');
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const filteredVouchers = vouchers.filter((v) => {
    if (filterBrand === 'all') return true;
    return (v.brand || '').toLowerCase().includes((filterBrand || '').toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#212121]">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#2874f0] text-white px-5 py-3.5 border-b border-blue-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                डिजिटल गिफ्ट कार्ड स्टोर (Admin Fulfilled)
              </h3>
              <p className="text-xs text-blue-100">
                अर्जित कॉइन्स से वाउचर अनुरोध करें — एडमिन वेरिफिकेशन के बाद असली वाउचर कोड मिलेगा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-sm text-white bg-white/15 hover:bg-white/25 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-[#f1f3f6]">
          {/* User Balance Badge */}
          <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 p-3 rounded-md gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              <span className="text-xs text-slate-600 font-semibold">उपलब्ध कॉइन्स:</span>
              <span className="text-sm font-black text-[#2874f0] font-mono">
                {(user.coins || 0).toLocaleString()} Coins
              </span>
            </div>
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuyCoins();
                }}
                className="text-xs font-black px-3 py-1 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white cursor-pointer"
              >
                🪙 Buy Coins (कॉइन्स खरीदें)
              </button>
            )}
          </div>

          {/* Filter Brand Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'सभी कार्ड्स' },
              { id: 'amazon', label: 'Amazon' },
              { id: 'flipkart', label: 'Flipkart' },
              { id: 'google', label: 'Google Play' },
              { id: 'upi', label: 'UPI Cash' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterBrand(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterBrand === tab.id
                    ? 'bg-[#2874f0] text-white shadow-2xs'
                    : 'bg-white text-[#212121] border border-slate-300 hover:bg-[#f5f8ff]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-md flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
              {onOpenBuyCoins && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBuyCoins();
                  }}
                  className="px-2.5 py-1 rounded-sm bg-[#fb641b] text-white font-black text-[11px] shrink-0 cursor-pointer"
                >
                  Buy Coins
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs p-3 rounded-md flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Vouchers Catalog */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-white rounded-md border border-slate-200">
                गिफ्ट कार्ड कैटलॉग लोड हो रहा है...
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-white rounded-md border border-slate-200">
                कोई गिफ्ट कार्ड उपलब्ध नहीं है।
              </div>
            ) : (
              filteredVouchers.map((card) => {
                const canAfford = (user.coins || 0) >= card.coinsRequired;

                return (
                  <div
                    key={card.id}
                    className="bg-white border border-slate-200 hover:border-[#2874f0] transition rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                        {(card.brand || '').toLowerCase().includes('amazon')
                          ? '🛒'
                          : (card.brand || '').toLowerCase().includes('flipkart')
                          ? '🛍️'
                          : (card.brand || '').toLowerCase().includes('google')
                          ? '🎮'
                          : '💸'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#212121]">{card.title}</h4>
                          <span className="text-[10px] font-black bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-xs font-mono">
                            ₹{card.denomination || card.valueInRupees}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{card.description}</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {card.coinsRequired.toLocaleString()} Coins
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                      {canAfford ? (
                        <button
                          onClick={() => handleRedeem(card)}
                          disabled={redeemingId === card.id}
                          className="w-full sm:w-auto px-4 py-2 rounded-sm text-xs font-black bg-[#fb641b] hover:bg-[#e5530d] text-white transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {redeemingId === card.id
                              ? 'प्रक्रिया में...'
                              : `रिडीम अनुरोध (${card.coinsRequired}c)`}
                          </span>
                        </button>
                      ) : (
                        onOpenBuyCoins ? (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenBuyCoins();
                            }}
                            className="w-full sm:w-auto px-3.5 py-2 rounded-sm text-xs font-black bg-[#2874f0] hover:bg-[#1c62d6] text-white cursor-pointer"
                          >
                            🪙 Buy {card.coinsRequired - (user.coins || 0)} Coins
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">
                            {card.coinsRequired - (user.coins || 0)} और कॉइन्स चाहिए
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* My Redemption History */}
          {myRedemptions.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-black text-[#2874f0] uppercase">
                मेरे गिफ्ट कार्ड अनुरोध ({myRedemptions.length})
              </h4>
              {myRedemptions.map((r) => (
                <div key={r.id} className="bg-white border border-slate-200 rounded-md p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-[#212121]">
                        {r.title} (₹{r.denomination})
                      </p>
                      <p className="text-[10px] text-slate-500">
                        🪙 {r.coinsSpent} Coins • {new Date(r.requestedAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-xs border ${
                        r.status === 'fulfilled'
                          ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {r.status === 'fulfilled' ? '✅ Fulfilled' : '⏳ Pending Admin'}
                    </span>
                  </div>
                  {r.status === 'fulfilled' && r.voucherCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-sm p-2 text-xs">
                      <span className="font-mono font-black text-[#388e3c]">
                        Code: {r.voucherCode} {r.voucherPin ? `| PIN: ${r.voucherPin}` : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(r.voucherCode || '', r.id)}
                        className="px-2 py-1 rounded-xs bg-white border border-emerald-300 text-[#388e3c] font-bold text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        {copiedId === r.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === r.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-sm border border-amber-200">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>एडमिन द्वारा असली वाउचर कोड जारी होने की प्रतीक्षा है।</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center py-3 px-4 bg-white border-t border-slate-200 text-[11px] text-slate-600 shrink-0">
          🔒 कोई फर्जी या पहले से हार्डकोड कोड नहीं — एडमिन सत्यापन के बाद असली वाउचर जारी होता है।
        </div>
      </div>
    </div>
  );
};
