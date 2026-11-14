import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Sparkles, Check, Coins, Shield, Crown, 
  Image as ImageIcon, RefreshCw, AlertCircle, Zap
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';

export interface AdvanceRoomTheme {
  id: string;
  name: string;
  hindiName: string;
  coinPrice: number;
  bgImageUrl?: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  badge: string;
  isDivine?: boolean;
}

export const ADVANCE_ROOM_THEMES: AdvanceRoomTheme[] = [
  {
    id: 'default_dark',
    name: 'Classic Light Marketplace Room',
    hindiName: 'क्लासिक लाइट फ्लिपकार्ट रूम (Default)',
    coinPrice: 0,
    bgGradient: 'from-[#ffffff] via-[#f5f8ff] to-[#eef4ff]',
    accentColor: '#2874f0',
    description: 'क्लीन व्हाइट एवं रॉयल ब्लू वॉइस रूम डिफ़ॉल्ट लेआउट',
    badge: 'FREE DEFAULT',
  },
  {
    id: 'krishna_divine',
    name: 'Shri Krishna Celestial Divine Pavilion',
    hindiName: '🦚 श्री कृष्ण दिव्य पैवेलियन (Celestial Divine)',
    coinPrice: 10000,
    bgGradient: 'from-[#031336] via-[#092257] to-[#040d21]',
    accentColor: '#38bdf8',
    description: 'भगवान श्री कृष्ण की दिव्य बांसुरी, मोरपंख आभा, जगमगाते तारों से सजी अलौकिक नीलिमा',
    badge: 'DIVINE CELESTIAL',
    isDivine: true,
  },
  {
    id: 'weplay_royal_purple',
    name: 'ESP PLAY Royal Purple Hall',
    hindiName: '👑 ईएसपी प्ले रॉयल पर्पल हॉल',
    coinPrice: 20000,
    bgGradient: 'from-purple-950/90 via-indigo-950/90 to-fuchsia-950/90',
    accentColor: '#c084fc',
    description: 'ईएसपी प्ले स्टाइल लग्ज़री पर्पल पार्टी स्टेज व लेजर लाइट्स',
    badge: 'PARTY ROYAL',
  },
  {
    id: 'maharaja_palace',
    name: 'Maharaja Imperial Gold Palace',
    hindiName: '🏰 महाराजा इंपीरियल गोल्ड पैलेस',
    coinPrice: 50000,
    bgGradient: 'from-amber-950/90 via-yellow-950/80 to-stone-950',
    accentColor: '#fbbf24',
    description: 'शाही झूमर, स्वर्ण सिंहासन एवं रेड कार्पेट वीआईपी लुक',
    badge: 'IMPERIAL GOLD',
  },
  {
    id: 'diamond_arena',
    name: 'Diamond Emperor Arena',
    hindiName: '💎 डायमंड एम्परर एरिना (Supreme)',
    coinPrice: 100000,
    bgGradient: 'from-cyan-950/90 via-blue-950/90 to-slate-950',
    accentColor: '#22d3ee',
    description: 'शर्मा जी लेवल 99 सुप्रीम डायमंड हॉल विद एनिमेटेड स्टेज',
    badge: 'SUPREME ARENA',
  },
];

interface AdvanceRoomStoreModalProps {
  user: UserProfile;
  currentRoomBgTheme: string;
  onSelectRoomBgTheme: (theme: AdvanceRoomTheme) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
}

export const AdvanceRoomStoreModal: React.FC<AdvanceRoomStoreModalProps> = ({
  user,
  currentRoomBgTheme,
  onSelectRoomBgTheme,
  onUpdateUser,
  onClose,
}) => {
  const [unlockedRoomIds, setUnlockedRoomIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`esp_unlocked_rooms_${user.userId}`);
      return stored ? JSON.parse(stored) : ['default_dark', 'krishna_divine'];
    } catch {
      return ['default_dark', 'krishna_divine'];
    }
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleBuyRoom = (theme: AdvanceRoomTheme) => {
    if (unlockedRoomIds.includes(theme.id)) {
      // Already unlocked, activate it
      onSelectRoomBgTheme(theme);
      setFeedback(`🎉 '${theme.hindiName}' रूम बैकग्राउंड सक्रिय कर दिया गया!`);
      return;
    }

    if ((user.coins || 0) < theme.coinPrice) {
      setFeedback(`❌ इस रूम को खरीदने के लिए ${theme.coinPrice.toLocaleString()} कॉइन्स चाहिए। आपके पास ${user.coins || 0} कॉइन्स हैं।`);
      return;
    }

    // Deduct coins and unlock
    const newCoins = (user.coins || 0) - theme.coinPrice;
    const newUnlocked = [...unlockedRoomIds, theme.id];
    setUnlockedRoomIds(newUnlocked);
    try {
      localStorage.setItem(`esp_unlocked_rooms_${user.userId}`, JSON.stringify(newUnlocked));
    } catch {}

    onUpdateUser({
      ...user,
      coins: newCoins,
    });

    onSelectRoomBgTheme(theme);
    setFeedback(`🎉 बधाई हो! आपने '${theme.hindiName}' खरीद लिया और यह रूम पर लागू हो गया!`);

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const handleRemoveBackground = () => {
    const defaultTheme = ADVANCE_ROOM_THEMES[0];
    onSelectRoomBgTheme(defaultTheme);
    setFeedback('डिफ़ॉल्ट बैकग्राउंड रीसेट कर दिया गया!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-md border border-slate-200 shadow-2xl overflow-hidden text-[#212121]">
        
        {/* Flipkart Blue Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              एडवांस रूम स्टोर (Advance Room Buy & Wallpaper)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          {/* Info Banner */}
          <div className="mb-3 p-3 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-between text-xs">
            <span className="text-[#212121] font-medium">
              कॉइन बैलेंस: <strong className="text-[#fb641b] font-mono tabular-nums text-sm">🪙 {(user.coins || 0).toLocaleString()}</strong>
            </span>
            <button
              type="button"
              onClick={handleRemoveBackground}
              className="px-2.5 py-1.5 rounded-sm bg-white hover:bg-slate-100 text-[#2874f0] text-[11px] font-bold border border-blue-200 cursor-pointer flex items-center space-x-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>डिफ़ॉल्ट लाइट थीम (Reset)</span>
            </button>
          </div>

          {feedback && (
            <div className="mb-3 p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {feedback}
            </div>
          )}

          {/* Room Themes Grid */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {ADVANCE_ROOM_THEMES.map((theme) => {
              const isUnlocked = unlockedRoomIds.includes(theme.id) || theme.coinPrice === 0;
              const isCurrent = currentRoomBgTheme === theme.id;
              const canAfford = (user.coins || 0) >= theme.coinPrice;

              return (
                <div
                  key={theme.id}
                  className={`p-3.5 rounded-md border transition relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-[#388e3c] bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 bg-[#f9fafb] hover:border-[#2874f0]'
                  }`}
                >
                  {/* Visual Thumbnail & Details */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-16 h-16 rounded-md border border-slate-300 overflow-hidden shrink-0 relative bg-white">
                      {theme.bgImageUrl ? (
                        <img
                          src={theme.bgImageUrl}
                          alt={theme.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}>
                          {theme.isDivine ? (
                            <span className="text-xl">🦚</span>
                          ) : theme.id === 'default_dark' ? (
                            <span className="text-xl">✨</span>
                          ) : null}
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute inset-0 bg-[#388e3c]/80 flex items-center justify-center text-white font-black text-[10px]">
                          ACTIVE
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#212121] truncate">
                          {theme.hindiName}
                        </h4>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] shrink-0">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#878787] mt-0.5 line-clamp-1">
                        {theme.description}
                      </p>
                      <div className="mt-1 flex items-center space-x-2 text-xs font-mono tabular-nums font-bold">
                        {theme.coinPrice === 0 ? (
                          <span className="text-[#388e3c]">FREE</span>
                        ) : (
                          <span className="text-[#fb641b] flex items-center gap-1">
                            🪙 {theme.coinPrice.toLocaleString()} Coins
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0 flex items-center justify-end">
                    {isCurrent ? (
                      <span className="px-3.5 py-1.5 rounded-sm bg-emerald-50 text-[#388e3c] font-bold text-xs border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> सक्रिय है (Active)
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleBuyRoom(theme)}
                        className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        लागू करें (Activate)
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyRoom(theme)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-sm font-bold text-xs transition cursor-pointer ${
                          canAfford
                            ? 'bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '🪙 खरीदें व लगाएं' : 'कॉइन्स कम हैं'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#878787] text-center mt-3">
            💡 कॉइन्स गेम खेलकर, टास्क पूरा करके, या शॉप से खरीदकर प्राप्त किए जा सकते हैं।
          </p>
        </div>
      </div>
    </div>
  );
};
