import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { X, Sparkles, Check, RefreshCw, Lock } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import {
  ADVANCE_ROOM_THEMES,
  type AdvanceRoomTheme,
} from '../../config/economy.ts';
import { api } from '../../services/api.ts';

export type { AdvanceRoomTheme };
export { ADVANCE_ROOM_THEMES };

interface AdvanceRoomStoreModalProps {
  user: UserProfile;
  currentRoomBgTheme: string;
  onSelectRoomBgTheme: (theme: AdvanceRoomTheme) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenBuyCoins?: () => void;
  onClose: () => void;
}

export const AdvanceRoomStoreModal: React.FC<AdvanceRoomStoreModalProps> = ({
  user,
  currentRoomBgTheme,
  onSelectRoomBgTheme,
  onUpdateUser,
  onOpenBuyCoins,
  onClose,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const unlockedRoomIds = Array.isArray(user.unlockedRooms) && user.unlockedRooms.length > 0
    ? user.unlockedRooms
    : ['default_dark'];
  const userCoins = user.coins || 0;

  const handleBuyOrActivateRoom = async (theme: AdvanceRoomTheme) => {
    setFeedback(null);
    const isOwned = theme.coinPrice === 0 || unlockedRoomIds.includes(theme.id);

    if (isOwned) {
      onSelectRoomBgTheme(theme);
      try {
        await api.saveServerState(user.userId, { roomTheme: theme.id });
      } catch {}
      setFeedback({ type: 'success', text: `🎉 '${theme.hindiName}' रूम बैकग्राउंड सक्रिय कर दिया गया!` });
      return;
    }

    if (userCoins < theme.coinPrice) {
      setFeedback({
        type: 'error',
        text: `🪙 इस रूम थीम के लिए ${theme.coinPrice} कॉइन्स चाहिए। आपके पास ${userCoins} कॉइन्स हैं!`,
      });
      return;
    }

    setBusyId(theme.id);
    try {
      const res = await api.buyRoomTheme(user.userId, theme.id);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message || 'रूम थीम खरीदने में त्रुटि आई' });
        return;
      }
      if (res.user) onUpdateUser(res.user);
      onSelectRoomBgTheme(theme);
      setFeedback({ type: 'success', text: `🎉 '${theme.hindiName}' (${theme.coinPrice} Coins) खरीदा व लागू किया गया!` });
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'रूम थीम खरीदने में त्रुटि' });
    } finally {
      setBusyId(null);
    }
  };

  const handleResetDefault = async () => {
    const defaultTheme = ADVANCE_ROOM_THEMES[0];
    onSelectRoomBgTheme(defaultTheme);
    try {
      await api.saveServerState(user.userId, { roomTheme: 'default_dark' });
    } catch {}
    setFeedback({ type: 'success', text: 'डिफ़ॉल्ट लाइट थीम सक्रिय कर दी गई!' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-md border border-slate-200 shadow-2xl overflow-hidden text-[#212121]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              रूम थीम स्टोर (Coins Room Store)
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
          <div className="mb-3 p-3 rounded-md bg-[#f5f8ff] border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#212121] font-medium">
              कॉइन बैलेंस: <strong className="text-[#fb641b] font-mono tabular-nums text-sm">🪙 {userCoins.toLocaleString()}</strong>
            </span>
            <div className="flex items-center gap-2">
              {onOpenBuyCoins && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBuyCoins();
                  }}
                  className="px-2.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-[11px] font-black cursor-pointer"
                >
                  🪙 Buy Coins
                </button>
              )}
              <button
                type="button"
                onClick={handleResetDefault}
                className="px-2.5 py-1.5 rounded-sm bg-white hover:bg-slate-100 text-[#2874f0] text-[11px] font-bold border border-blue-200 cursor-pointer flex items-center space-x-1 transition"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Default</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`mb-3 p-2.5 rounded-md border text-xs font-bold text-center ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Room Themes List */}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {ADVANCE_ROOM_THEMES.map((theme) => {
              const isUnlocked = unlockedRoomIds.includes(theme.id) || theme.coinPrice === 0;
              const isCurrent = currentRoomBgTheme === theme.id;
              const canAfford = userCoins >= theme.coinPrice;

              return (
                <div
                  key={theme.id}
                  className={`p-3.5 rounded-md border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-[#388e3c] bg-emerald-50/70 shadow-xs'
                      : 'border-slate-200 bg-[#f9fafb] hover:border-[#2874f0]'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-md border border-slate-300 overflow-hidden shrink-0 relative bg-white">
                      <div className={`w-full h-full bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}>
                        {theme.isDivine ? <span className="text-xl">🦚</span> : <span className="text-xl">✨</span>}
                      </div>
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
                      <div className="mt-1 text-xs font-mono font-bold">
                        {theme.coinPrice === 0 ? (
                          <span className="text-[#388e3c]">FREE</span>
                        ) : (
                          <span className="text-[#fb641b]">🪙 {theme.coinPrice} Coins</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end gap-2">
                    {isCurrent ? (
                      <span className="px-3.5 py-1.5 rounded-sm bg-emerald-50 text-[#388e3c] font-bold text-xs border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleBuyOrActivateRoom(theme)}
                        className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        लागू करें
                      </button>
                    ) : canAfford ? (
                      <button
                        type="button"
                        disabled={busyId === theme.id}
                        onClick={() => handleBuyOrActivateRoom(theme)}
                        className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs transition cursor-pointer shadow-xs"
                      >
                        {busyId === theme.id ? 'Buying...' : `🪙 Buy (${theme.coinPrice}c)`}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                          <Lock className="w-3 h-3" /> Need {theme.coinPrice - userCoins}c
                        </span>
                        {onOpenBuyCoins && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenBuyCoins();
                            }}
                            className="px-3 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white text-[11px] font-black cursor-pointer"
                          >
                            Buy Coins
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
