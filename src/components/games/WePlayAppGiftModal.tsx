import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Gift, Send, Coins } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { ALL_GIFTS_CATALOG, type GiftCatalogItem } from '../../config/giftCatalog.ts';

export type AppGiftItem = GiftCatalogItem;
export const ALL_APP_GIFTS: AppGiftItem[] = ALL_GIFTS_CATALOG;

export const COMBO_MULTIPLIERS = [1, 10, 66, 99, 188, 520, 1314];

interface WePlayAppGiftModalProps {
  user: UserProfile;
  seats: Array<{ seatNumber: number; userName?: string; userAvatar?: string; userId?: string }>;
  initialGiftId?: string;
  initialTargetName?: string;
  initialTargetUserId?: string;
  onClose: () => void;
  onSendGift: (
    gift: AppGiftItem,
    comboCount: number,
    targetName: string,
    coinsBackWon: number,
    targetUserId?: string
  ) => void;
  onOpenBuyCoins?: () => void;
}

export const WePlayAppGiftModal: React.FC<WePlayAppGiftModalProps> = ({
  user,
  seats,
  initialGiftId,
  initialTargetName,
  initialTargetUserId,
  onClose,
  onSendGift,
  onOpenBuyCoins,
}) => {
  const initialGiftObj = ALL_APP_GIFTS.find((g) => g.id === initialGiftId);
  const [activeCategory, setActiveCategory] = useState<'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic'>(
    initialGiftObj?.category || 'popular'
  );
  const [selectedGiftId, setSelectedGiftId] = useState<string>(initialGiftObj?.id || 'pop_1');
  const [comboCount, setComboCount] = useState<number>(1);
  const [targetRecipient, setTargetRecipient] = useState<string>(
    initialTargetName || 'Entire Room (सभी को)'
  );
  const [targetUserIdState, setTargetUserIdState] = useState<string | undefined>(initialTargetUserId);

  useEffect(() => {
    if (initialGiftId) {
      const g = ALL_APP_GIFTS.find((item) => item.id === initialGiftId);
      if (g) {
        setActiveCategory(g.category);
        setSelectedGiftId(g.id);
      }
    }
    if (initialTargetName) {
      setTargetRecipient(initialTargetName);
      setTargetUserIdState(initialTargetUserId);
    }
  }, [initialGiftId, initialTargetName, initialTargetUserId]);

  const selectedGift = ALL_APP_GIFTS.find((g) => g.id === selectedGiftId) || ALL_APP_GIFTS[0];
  const totalCost = selectedGift.coinCost * comboCount;
  const totalCharms = selectedGift.charmValue * comboCount;
  const userCoins = user.coins || 0;
  const canAfford = userCoins >= totalCost;

  const categoryGifts = ALL_APP_GIFTS.filter((g) => g.category === activeCategory);

  const handleSend = () => {
    if (!canAfford) return;
    onSendGift(selectedGift, comboCount, targetRecipient, 0, targetUserIdState);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-t-xl sm:rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-base font-black text-white">गिफ्ट स्टोर (ESP Gift Store)</h3>
            <span className="text-[10px] font-black bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-sm uppercase">
              5+ Coins
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-[#ffe500] px-2.5 py-0.5 rounded-sm text-xs font-black text-[#212121]">
              <span>🪙</span>
              <span>{userCoins.toLocaleString()}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {/* Recipient Selector */}
          <div className="flex items-center space-x-2 mb-3 overflow-x-auto pb-1 text-xs">
            <span className="text-[#878787] font-bold text-[11px] shrink-0">भेजें (To):</span>
            {initialTargetName && !seats.some((s) => s.userId === initialTargetUserId) && (
              <button
                type="button"
                onClick={() => {
                  setTargetRecipient(initialTargetName);
                  setTargetUserIdState(initialTargetUserId);
                }}
                className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                  targetRecipient === initialTargetName
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                }`}
              >
                👤 {initialTargetName}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setTargetRecipient('Entire Room (सभी को)');
                setTargetUserIdState(undefined);
              }}
              className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                targetRecipient === 'Entire Room (सभी को)'
                  ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                  : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
              }`}
            >
              🌟 Entire Room (सभी को)
            </button>
            {seats
              .filter((s) => s.userName)
              .map((s) => (
                <button
                  key={s.seatNumber}
                  type="button"
                  onClick={() => {
                    setTargetRecipient(`${s.userName} (Seat #${s.seatNumber})`);
                    setTargetUserIdState(s.userId);
                  }}
                  className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                    targetRecipient.includes(`Seat #${s.seatNumber}`) || (s.userId && targetUserIdState === s.userId)
                      ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                      : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                  }`}
                >
                  Seat #{s.seatNumber}: {s.userName}
                </button>
              ))}
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-5 gap-1 my-2 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveCategory('popular')}
              className={`py-1.5 px-1 rounded-sm font-black text-[11px] truncate transition cursor-pointer text-center ${
                activeCategory === 'popular'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              🔥 लोकप्रिय
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('diwali')}
              className={`py-1.5 px-1 rounded-sm font-black text-[11px] truncate transition cursor-pointer text-center ${
                activeCategory === 'diwali'
                  ? 'bg-[#fb641b] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              🪔 दिवाली
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('romance')}
              className={`py-1.5 px-1 rounded-sm font-black text-[11px] truncate transition cursor-pointer text-center ${
                activeCategory === 'romance'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              💖 रोमांस
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('luxury')}
              className={`py-1.5 px-1 rounded-sm font-black text-[11px] truncate transition cursor-pointer text-center ${
                activeCategory === 'luxury'
                  ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              👑 लक्ज़री
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('mythic')}
              className={`py-1.5 px-1 rounded-sm font-black text-[11px] truncate transition cursor-pointer text-center ${
                activeCategory === 'mythic'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              💎 मिथिक VIP
            </button>
          </div>

          {/* Gifts Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 my-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
            {categoryGifts.map((gift) => {
              const isSelected = selectedGiftId === gift.id;
              return (
                <div
                  key={gift.id}
                  onClick={() => setSelectedGiftId(gift.id)}
                  className={`relative p-2.5 rounded-sm border transition cursor-pointer flex flex-col items-center justify-between text-center ${
                    isSelected
                      ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0] shadow-sm'
                      : 'bg-[#f9fafb] hover:bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {gift.isNew && (
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded-sm bg-[#fb641b] text-white">
                      NEW
                    </span>
                  )}
                  <div className="text-3xl my-1">{gift.icon}</div>
                  <p className="text-xs font-black text-[#212121] truncate max-w-full">
                    {gift.hindiName}
                  </p>
                  <div className="mt-1 flex items-center space-x-1 text-[11px] font-mono font-black text-[#fb641b]">
                    <span>🪙</span>
                    <span>{gift.coinCost.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-pink-600 font-bold">
                    ✨ +{gift.charmValue.toLocaleString()} Charms
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combo & Send */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-1 overflow-x-auto max-w-full pb-1">
              <span className="text-[11px] text-[#878787] shrink-0 font-bold mr-1">कॉम्बो:</span>
              {COMBO_MULTIPLIERS.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setComboCount(num)}
                  className={`px-2 py-1 rounded-sm text-xs font-black transition cursor-pointer shrink-0 border ${
                    comboCount === num
                      ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                      : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                  }`}
                >
                  x{num}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="text-right shrink-0 pr-1">
                <div className="text-xs font-mono font-black text-[#fb641b]">
                  🪙 {totalCost.toLocaleString()}
                </div>
                <div className="text-[10px] text-pink-600 font-bold">
                  ✨ +{totalCharms.toLocaleString()} Charms
                </div>
              </div>

              {canAfford ? (
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-sm font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer bg-[#fb641b] hover:bg-[#e8550f] text-white"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>गिफ्ट भेजें (Send x{comboCount})</span>
                </button>
              ) : onOpenBuyCoins ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBuyCoins();
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-sm font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer bg-[#fb641b] hover:bg-[#e8550f] text-white"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>🪙 Buy Coins ({totalCost}c चाहिए)</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-sm font-black text-xs bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed"
                >
                  कॉइन्स कम हैं!
                </button>
              )}
            </div>
          </div>

          <p className="text-[10px] text-[#878787] text-center mt-2.5">
            💡 रियल नियम: गिफ्ट भेजने पर आपके असली कॉइन्स कटते हैं, चार्म्स जुड़ते हैं और <strong>Send 1 Gift (+5 Coins + EXP)</strong> टास्क पूरा होता है!
          </p>
        </div>
      </div>
    </div>
  );
};
