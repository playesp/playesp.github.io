import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  X, 
  Copy, 
  Check, 
  Sparkles, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ShoppingBag,
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GiftCardVoucher, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

interface DigitalGiftCardsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
}

export const DigitalGiftCardsModal: React.FC<DigitalGiftCardsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
}) => {
  const [vouchers, setVouchers] = useState<GiftCardVoucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<GiftCardVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filterBrand, setFilterBrand] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadVouchers();
    }
  }, [isOpen]);

  const loadVouchers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getGiftCards();
      setVouchers(Array.isArray(res) ? res : (res as any)?.vouchers || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'गिफ्ट कार्ड लोड करने में समस्या आई');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (voucher: GiftCardVoucher) => {
    setErrorMsg(null);
    if ((user.coins || 0) < voucher.coinsRequired) {
      setErrorMsg(`अपर्याप्त कॉइन्स! इस ${voucher.title} के लिए ${voucher.coinsRequired.toLocaleString()} कॉइन्स चाहिए। आपके पास ${user.coins || 0} कॉइन्स हैं।`);
      return;
    }

    setRedeemingId(voucher.id);
    try {
      const res = await api.redeemGiftCard(user.userId, voucher.id);
      if (res.success && res.voucher) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSelectedVoucher(res.voucher);
        if (res.user) {
          onUpdateUser(res.user);
        } else {
          onUpdateUser({
            ...user,
            coins: (user.coins || 0) - voucher.coinsRequired
          });
        }
        await loadVouchers();
      } else {
        setErrorMsg(res.message || 'रिडीम असफल रहा');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'रिडीम करने में त्रुटि आई');
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'pin') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  if (!isOpen) return null;

  const filteredVouchers = vouchers.filter(v => {
    if (filterBrand === 'all') return true;
    return v.brand.toLowerCase() === filterBrand.toLowerCase();
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
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                डिजिटल गिफ्ट कार्ड स्टोर
                <span className="text-[10px] bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-xs font-black">
                  असली वाउचर कोड व पिन
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                वर्चुअल गिफ्ट नहीं, असली शॉपिंग व कैश गिफ्ट कार्ड (Amazon, Flipkart, Google Play, UPI)
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
                {(user.coins || 0).toLocaleString()} ESP Coins
              </span>
            </div>
            <span className="text-[11px] text-[#2874f0] bg-[#f5f8ff] border border-blue-200 px-2.5 py-1 rounded-sm font-semibold">
              माइक पर बैठने से हर मिनट +5 कॉइन्स मिलते हैं
            </span>
          </div>

          {/* Filter Brand Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'सभी कार्ड्स' },
              { id: 'amazon', label: 'Amazon' },
              { id: 'flipkart', label: 'Flipkart' },
              { id: 'google_play', label: 'Google Play' },
              { id: 'upi_cash', label: 'UPI Cash' },
            ].map(tab => (
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
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Modal content: Selected Redeemed Voucher Result */}
          {selectedVoucher && (
            <div className="bg-emerald-50 border-2 border-[#388e3c] p-4 rounded-md space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#388e3c] font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>गिफ्ट कार्ड सफलतापूर्वक प्राप्त हुआ!</span>
                </div>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="text-xs text-[#2874f0] hover:underline font-bold cursor-pointer"
                >
                  दूसरा देखें
                </button>
              </div>
              <div className="p-3 bg-white rounded-sm border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">वाउचर:</span>
                  <span className="text-xs font-black text-[#212121]">{selectedVoucher.title} (₹{selectedVoucher.denomination || selectedVoucher.valueInRupees})</span>
                </div>
                <div className="flex items-center justify-between bg-[#f9fafb] p-2 rounded-sm border border-slate-200">
                  <span className="text-xs text-slate-600">वाउचर कोड:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#388e3c] tracking-wider">
                      {selectedVoucher.voucherCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedVoucher.voucherCode || '', 'code')}
                      className="p-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-xs text-[#212121] cursor-pointer"
                      title="कॉपी करें"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {selectedVoucher.voucherPin && (
                  <div className="flex items-center justify-between bg-[#f9fafb] p-2 rounded-sm border border-slate-200">
                    <span className="text-xs text-slate-600">सिक्योरिटी पिन (PIN):</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#2874f0] tracking-wider">
                        {selectedVoucher.voucherPin}
                      </span>
                      <button
                        onClick={() => copyToClipboard(selectedVoucher.voucherPin || '', 'pin')}
                        className="p-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-xs text-[#212121] cursor-pointer"
                        title="पिन कॉपी करें"
                      >
                        {copiedPin ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-slate-600 pt-1">
                  निर्देश: {selectedVoucher.instructions || 'इस कोड को संबंधित ऐप/वेबसाइट पर "Add Gift Card" में दर्ज करें।'}
                </p>
              </div>
            </div>
          )}

          {/* Vouchers List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-white rounded-md border border-slate-200">
                गिफ्ट कार्ड वाउचर लोड हो रहे हैं...
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs bg-white rounded-md border border-slate-200">
                कोई वाउचर उपलब्ध नहीं है।
              </div>
            ) : (
              filteredVouchers.map(card => {
                const canAfford = (user.coins || 0) >= card.coinsRequired;
                const isClaimed = card.status === 'claimed' && card.redeemedBy === user.userId;

                return (
                  <div
                    key={card.id}
                    className="bg-white border border-slate-200 hover:border-[#2874f0] transition rounded-md p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                        {card.brand.toLowerCase().includes('amazon') ? '🛒' :
                         card.brand.toLowerCase().includes('flipkart') ? '🛍️' :
                         card.brand.toLowerCase().includes('google') ? '🎮' : '💸'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-[#212121]">{card.title}</h4>
                          <span className="text-[10px] font-black bg-emerald-50 text-[#388e3c] border border-emerald-200 px-2 py-0.5 rounded-xs font-mono">
                            ₹{card.denomination || card.valueInRupees} Value
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

                    <div className="w-full sm:w-auto flex items-center justify-end">
                      {isClaimed ? (
                        <button
                          onClick={() => setSelectedVoucher(card)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#2874f0] hover:bg-[#1e60d5] text-white rounded-sm text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          कोड देखें
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRedeem(card)}
                          disabled={!canAfford || redeemingId === card.id}
                          className={`w-full sm:w-auto px-4 py-2 rounded-sm text-xs font-black transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                            canAfford
                              ? 'bg-[#fb641b] hover:bg-[#e5530d] text-white active:scale-95'
                              : 'bg-[#f1f3f6] text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          {redeemingId === card.id ? (
                            'रिडीम हो रहा है...'
                          ) : canAfford ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              रिडीम करें (₹{card.denomination || card.valueInRupees})
                            </>
                          ) : (
                            `${card.coinsRequired - (user.coins || 0)} और कॉइन्स चाहिए`
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center py-3 px-4 bg-white border-t border-slate-200 text-[11px] text-slate-600 shrink-0">
          🔒 सभी गिफ्ट कार्ड्स 100% वेरिफाइड एवं तुरंत डिजिटल कोड व पिन के साथ मिलते हैं।
        </div>
      </div>
    </div>
  );
};
