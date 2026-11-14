import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Gift, Sparkles, Send, Coins, Flame, Heart, 
  Crown, Zap, Award, Star, Check, AlertCircle, RefreshCw 
} from 'lucide-react';
import type { UserProfile, RoomGift } from '../../types/index.ts';

export interface AppGiftItem {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  coinCost: number;
  charmValue: number; // Exactly coins / 5
  category: 'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic';
  animationType: string;
  gradient: string;
  isNew?: boolean;
}

export const ALL_APP_GIFTS: AppGiftItem[] = [
  // DIWALI SPECIAL GIFTS (100, 220, 520, 5200, 9999)
  {
    id: 'diwali_1',
    name: 'Shubh Diya',
    hindiName: '🪔 शुभ दीप (Diya)',
    icon: '🪔',
    coinCost: 100,
    charmValue: 20, // 100 / 5
    category: 'diwali',
    animationType: 'diwali_diya',
    gradient: 'from-amber-500 to-orange-600',
    isNew: true,
  },
  {
    id: 'diwali_2',
    name: 'Phuljhadi Sparkler',
    hindiName: '🎇 फुलझड़ी (Sparkler)',
    icon: '🎇',
    coinCost: 220,
    charmValue: 44, // 220 / 5
    category: 'diwali',
    animationType: 'sparkler',
    gradient: 'from-yellow-400 to-red-500',
    isNew: true,
  },
  {
    id: 'diwali_3',
    name: 'Rangoli Chakri',
    hindiName: '🎆 रंगोली चकरी (Spinner)',
    icon: '🎆',
    coinCost: 520,
    charmValue: 104, // 520 / 5
    category: 'diwali',
    animationType: 'chakri',
    gradient: 'from-pink-500 to-purple-600',
    isNew: true,
  },
  {
    id: 'diwali_4',
    name: 'Sky Rocket Dhamaka',
    hindiName: '🚀 स्काई रॉकेट धमाका',
    icon: '🚀',
    coinCost: 5200,
    charmValue: 1040, // 5200 / 5
    category: 'diwali',
    animationType: 'rocket_dhamaka',
    gradient: 'from-indigo-600 to-purple-800',
    isNew: true,
  },
  {
    id: 'diwali_5',
    name: '10,000 Lad Ladi Firecrackers',
    hindiName: '💥 10,000 लड़ लड़ी पटाखा',
    icon: '💥',
    coinCost: 9999,
    charmValue: 1999, // 9999 / 5 = 1999
    category: 'diwali',
    animationType: 'firecracker_symphony',
    gradient: 'from-red-600 via-yellow-500 to-amber-600',
    isNew: true,
  },

  // POPULAR (5 to 300 COINS)
  {
    id: 'pop_1',
    name: 'Sweet Candy',
    hindiName: '🍬 टॉफ़ी (Candy)',
    icon: '🍬',
    coinCost: 5,
    charmValue: 1, // 5 / 5 = 1 charm
    category: 'popular',
    animationType: 'candy',
    gradient: 'from-pink-400 to-rose-500',
  },
  {
    id: 'pop_2',
    name: 'Red Rose',
    hindiName: '🌹 लाल गुलाब',
    icon: '🌹',
    coinCost: 10,
    charmValue: 2, // 10 / 5 = 2 charms
    category: 'popular',
    animationType: 'rose',
    gradient: 'from-rose-500 to-red-600',
  },
  {
    id: 'pop_3',
    name: 'Masala Chai',
    hindiName: '☕ गरमा-गरम चाय',
    icon: '☕',
    coinCost: 25,
    charmValue: 5, // 25 / 5 = 5 charms
    category: 'popular',
    animationType: 'tea',
    gradient: 'from-amber-600 to-yellow-700',
  },
  {
    id: 'pop_4',
    name: 'Choco Delight',
    hindiName: '🍫 स्वीट चॉकलेट',
    icon: '🍫',
    coinCost: 50,
    charmValue: 10, // 50 / 5 = 10 charms
    category: 'popular',
    animationType: 'chocolate',
    gradient: 'from-amber-800 to-amber-950',
  },
  {
    id: 'pop_5',
    name: 'Diamond Ring',
    hindiName: '💍 डायमंड रिंग',
    icon: '💍',
    coinCost: 150,
    charmValue: 30, // 150 / 5
    category: 'popular',
    animationType: 'ring',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'pop_6',
    name: 'Celebration Cake',
    hindiName: '🎂 पार्टी केक',
    icon: '🎂',
    coinCost: 300,
    charmValue: 60, // 300 / 5
    category: 'popular',
    animationType: 'cake',
    gradient: 'from-purple-500 to-indigo-600',
  },

  // ROMANCE
  {
    id: 'rom_1',
    name: 'Love Letter',
    hindiName: '💌 प्रेम पत्र',
    icon: '💌',
    coinCost: 80,
    charmValue: 16,
    category: 'romance',
    animationType: 'letter',
    gradient: 'from-rose-400 to-pink-500',
  },
  {
    id: 'rom_2',
    name: 'Teddy Bear',
    hindiName: '🧸 टेडी बियर',
    icon: '🧸',
    coinCost: 250,
    charmValue: 50,
    category: 'romance',
    animationType: 'teddy',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'rom_3',
    name: 'Love Birds',
    hindiName: '🕊️ लव बर्ड्स',
    icon: '🕊️',
    coinCost: 600,
    charmValue: 120,
    category: 'romance',
    animationType: 'birds',
    gradient: 'from-sky-400 to-indigo-500',
  },
  {
    id: 'rom_4',
    name: 'Romantic Tiara',
    hindiName: '👑 प्रिंसेस टियारा',
    icon: '👑',
    coinCost: 1200,
    charmValue: 240,
    category: 'romance',
    animationType: 'tiara',
    gradient: 'from-pink-500 to-rose-600',
  },

  // LUXURY (1000 to 100,000)
  {
    id: 'lux_1',
    name: 'Super Ferrari',
    hindiName: '🏎️ रेड फरारी स्पोर्ट्स',
    icon: '🏎️',
    coinCost: 1000,
    charmValue: 200,
    category: 'luxury',
    animationType: 'ferrari',
    gradient: 'from-red-600 to-rose-700',
  },
  {
    id: 'lux_2',
    name: 'Emperor Crown',
    hindiName: '👑 शाही ताज (Crown)',
    icon: '👑',
    coinCost: 2500,
    charmValue: 500,
    category: 'luxury',
    animationType: 'crown',
    gradient: 'from-amber-400 to-yellow-600',
  },
  {
    id: 'lux_3',
    name: 'Magic Castle',
    hindiName: '🏰 जादुई महल',
    icon: '🏰',
    coinCost: 7500,
    charmValue: 1500,
    category: 'luxury',
    animationType: 'castle',
    gradient: 'from-purple-600 to-pink-700',
  },
  {
    id: 'lux_4',
    name: 'Private Helicopter',
    hindiName: '🚁 वीआईपी हेलिकॉप्टर',
    icon: '🚁',
    coinCost: 25000,
    charmValue: 5000,
    category: 'luxury',
    animationType: 'helicopter',
    gradient: 'from-cyan-500 to-blue-700',
  },
  {
    id: 'lux_5',
    name: 'Mega Luxury Yacht',
    hindiName: '🛳️ सुपर लक्ज़री क्रूज़ यॉट',
    icon: '🛳️',
    coinCost: 100000,
    charmValue: 20000,
    category: 'luxury',
    animationType: 'yacht',
    gradient: 'from-blue-600 to-indigo-900',
  },

  // GRAND MYTHIC (500,000 to 5,000,000 COINS)
  {
    id: 'myth_1',
    name: 'Golden Mythic Dragon',
    hindiName: '🐉 स्वर्णिम आकाश ड्रैगन',
    icon: '🐉',
    coinCost: 500000,
    charmValue: 100000, // 500,000 / 5 = 100,000 charms
    category: 'mythic',
    animationType: 'golden_dragon',
    gradient: 'from-yellow-400 via-amber-500 to-red-600',
    isNew: true,
  },
  {
    id: 'myth_2',
    name: 'Cosmic Galaxy Kingdom',
    hindiName: '🪐 ब्रह्मांडीय गैलेक्सी साम्राज्य',
    icon: '🪐',
    coinCost: 1000000,
    charmValue: 200000, // 1,000,000 / 5 = 200,000 charms
    category: 'mythic',
    animationType: 'cosmic_galaxy',
    gradient: 'from-purple-700 via-indigo-600 to-pink-600',
    isNew: true,
  },
  {
    id: 'myth_3',
    name: '👑 Sharma Ji Supreme Emperor Throne',
    hindiName: '👑 शर्मा जी सुप्रीम सम्राट सिंहासन (50 Lakh)',
    icon: '👑',
    coinCost: 5000000,
    charmValue: 1000000, // 5,000,000 / 5 = 1,000,000 charms
    category: 'mythic',
    animationType: 'sharma_ji_throne',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    isNew: true,
  },
];

export const COMBO_MULTIPLIERS = [1, 10, 66, 99, 188, 520, 1314];

interface WePlayAppGiftModalProps {
  user: UserProfile;
  seats: Array<{ seatNumber: number; userName?: string; userAvatar?: string; userId?: string }>;
  onClose: () => void;
  onSendGift: (gift: AppGiftItem, comboCount: number, targetName: string, coinsBackWon: number) => void;
}

export const WePlayAppGiftModal: React.FC<WePlayAppGiftModalProps> = ({
  user,
  seats,
  onClose,
  onSendGift,
}) => {
  const [activeCategory, setActiveCategory] = useState<'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic'>('diwali');
  const [selectedGiftId, setSelectedGiftId] = useState<string>('diwali_1');
  const [comboCount, setComboCount] = useState<number>(1);
  const [targetRecipient, setTargetRecipient] = useState<string>('Entire Room (सभी को)');
  const [coinsBackNotice, setCoinsBackNotice] = useState<string | null>(null);

  const selectedGift = ALL_APP_GIFTS.find(g => g.id === selectedGiftId) || ALL_APP_GIFTS[0];
  const totalCost = selectedGift.coinCost * comboCount;
  const totalCharms = selectedGift.charmValue * comboCount;
  const userCoins = user.coins || 0;
  const canAfford = userCoins >= totalCost;

  // Filtered gifts list
  const categoryGifts = ALL_APP_GIFTS.filter(g => g.category === activeCategory);

  const handleSend = () => {
    if (!canAfford) return;

    // Calculate Coins-Back / Lucky Return:
    // "minimum 100 gold ke gift par 1 se 99 gold return milege"
    let coinsBack = 0;
    if (selectedGift.coinCost >= 100) {
      // 1 to 99 coins return
      coinsBack = Math.floor(Math.random() * 99) + 1;
    }

    if (coinsBack > 0) {
      setCoinsBackNotice(`💰 लकी कॉइन्स बैक: आपको तुरंत 🪙 ${coinsBack} कॉइन्स वापस मिले!`);
    }

    onSendGift(selectedGift, comboCount, targetRecipient, coinsBack);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* App-like Bottom Sheet / Modal */}
      <div className="w-full max-w-xl bg-white rounded-t-xl sm:rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Gift className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-base font-black text-white">
              गिफ्ट स्टोर (ESP PLAY App Gifts)
            </h3>
            <span className="text-[10px] font-black bg-[#ffe500] text-[#212121] px-2 py-0.5 rounded-sm uppercase">
              5 - 50L Coins
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
          {/* Target Recipient Selector */}
          <div className="flex items-center space-x-2 mb-3 overflow-x-auto pb-1 text-xs">
            <span className="text-[#878787] font-bold text-[11px] shrink-0">भेजें (To):</span>
            <button
              type="button"
              onClick={() => setTargetRecipient('Entire Room (सभी को)')}
              className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                targetRecipient === 'Entire Room (सभी को)'
                  ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                  : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
              }`}
            >
              🌟 Entire Room (सभी को)
            </button>
            <button
              type="button"
              onClick={() => setTargetRecipient('Host Santosh Kumar')}
              className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                targetRecipient === 'Host Santosh Kumar'
                  ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                  : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
              }`}
            >
              👑 Host Santosh Ji
            </button>
            {seats.filter(s => s.userName).map((s) => (
              <button
                key={s.seatNumber}
                type="button"
                onClick={() => setTargetRecipient(`${s.userName} (Seat #${s.seatNumber})`)}
                className={`px-3 py-1 rounded-sm font-bold shrink-0 transition cursor-pointer text-xs border ${
                  targetRecipient.includes(`Seat #${s.seatNumber}`)
                    ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                    : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                }`}
              >
                Seat #{s.seatNumber}: {s.userName}
              </button>
            ))}
          </div>

          {/* Category Tabs (Diwali, Popular, Romance, Luxury, Mythic) */}
          <div className="grid grid-cols-5 gap-1 my-2 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200">
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

          {/* Gifts Grid Container */}
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
                    <span className="absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.2 rounded-sm bg-[#fb641b] text-white shadow-2xs">
                      NEW
                    </span>
                  )}

                  <div className="text-3xl my-1">
                    {gift.icon}
                  </div>

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

          {/* Coins Back Announcement */}
          {coinsBackNotice && (
            <div className="my-2 p-2 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center animate-fadeIn">
              {coinsBackNotice}
            </div>
          )}

          {/* Combo Selector & Action Bar */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Combo Multiplier buttons */}
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

            {/* Send Button with Total Cost */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="text-right shrink-0 pr-1">
                <div className="text-xs font-mono font-black text-[#fb641b]">
                  🪙 {totalCost.toLocaleString()}
                </div>
                <div className="text-[10px] text-pink-600 font-bold">
                  ✨ +{totalCharms.toLocaleString()} Charms
                </div>
              </div>

              <button
                type="button"
                disabled={!canAfford}
                onClick={handleSend}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-sm font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm cursor-pointer ${
                  canAfford
                    ? 'bg-[#fb641b] hover:bg-[#e8550f] text-white'
                    : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{canAfford ? `गिफ्ट भेजें (Send x${comboCount})` : 'कॉइन्स कम हैं!'}</span>
              </button>
            </div>
          </div>

          {/* Rule note: 5 coins = 1 charm & 100+ coins = 1-99 coins back */}
          <p className="text-[10px] text-[#878787] text-center mt-2.5">
            💡 नियम: प्रत्येक 5 कॉइन्स के गिफ्ट पर 1 चार्म मिलता है। 100+ कॉइन्स के गिफ्ट पर 1 से 99 कॉइन्स लकी रिटर्न तुरंत प्राप्त होते हैं!
          </p>
        </div>
      </div>
    </div>
  );
};
