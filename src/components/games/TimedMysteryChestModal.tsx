import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, Lock, Coins, Zap, RefreshCw, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { CHEST_MILESTONES, getXpProgressInLevel } from '../../config/economy.ts';
import { api } from '../../services/api.ts';

interface TimedMysteryChestModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
  onOpenBuyCoins?: () => void;
}

export const TimedMysteryChestModal: React.FC<TimedMysteryChestModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  onOpenBuyCoins,
}) => {
  const [selectedChestId, setSelectedChestId] = useState<string>(CHEST_MILESTONES[0].id);
  const [tasksCompletedCount, setTasksCompletedCount] = useState<number>(0);
  const [claimedChestIds, setClaimedChestIds] = useState<string[]>([]);
  const [isOpeningAnimation, setIsOpeningAnimation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [openedRewardPackage, setOpenedRewardPackage] = useState<{
    coins: number;
    xp: number;
    label: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getTasksStatus(user.userId);
      if (data?.success) {
        const claimedTasksLen = Array.isArray(data.tasks)
          ? data.tasks.filter((t) => t.isClaimed).length
          : 0;
        setTasksCompletedCount(Math.max(data.tasksCompletedCount || 0, claimedTasksLen));
        setClaimedChestIds(data.claimedChestMilestones || []);
        if (data.user) onUpdateUser(data.user);
      }
    } catch {
      // safe default
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const activeChest =
    CHEST_MILESTONES.find((c) => c.id === selectedChestId) || CHEST_MILESTONES[0];
  const isBoxOpened = claimedChestIds.includes(activeChest.id);
  const isBoxReadyToClaim =
    !isBoxOpened && tasksCompletedCount >= activeChest.requiredTasksCompleted;

  const xpInfo = getXpProgressInLevel(user.gameXp || 0);

  const handleOpenChest = async () => {
    if (isOpeningAnimation || isBoxOpened || !isBoxReadyToClaim) return;
    setIsOpeningAnimation(true);
    setFeedback(null);

    try {
      const res = await api.claimTaskMilestoneChest(user.userId, activeChest.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        setOpenedRewardPackage({
          coins: res.coinsAwarded || activeChest.coinReward,
          xp: res.xpAwarded || activeChest.xpReward,
          label: activeChest.hindiLabel,
        });
        await loadStatus();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      } else {
        setFeedback(res.message || 'चेस्ट अभी अनलॉक नहीं है।');
      }
    } catch (err: any) {
      setFeedback(err?.message || 'चेस्ट खोलने में त्रुटि।');
    } finally {
      setIsOpeningAnimation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-[#ffe500] px-2.5 py-0.5 rounded-sm text-xs font-black text-[#212121]">
              <span>🪙</span>
              <span className="font-mono">{user.coins || 0}</span>
            </div>
            <div className="flex items-center space-x-1 bg-white/15 px-2.5 py-0.5 rounded-sm border border-white/25 text-xs font-black text-white">
              <Zap className="w-3 h-3" />
              <span className="font-mono">{user.gameXp || 0} EXP</span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-black tracking-wide text-white">
              Task Milestone Chests
            </span>
            <button
              type="button"
              onClick={loadStatus}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
          {/* Player Level & Real Verified Progress */}
          <div className="flex items-center space-x-3 bg-[#f5f8ff] p-2.5 rounded-sm border border-blue-100">
            <div className="w-9 h-9 rounded-full bg-[#2874f0] p-0.5 shrink-0">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                alt={user.fullName}
                className="w-full h-full rounded-full bg-white object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-black text-[#212121] truncate">{user.fullName}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm bg-[#2874f0] text-white">
                  Lv {xpInfo.level}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#388e3c] rounded-full transition-all duration-500"
                  style={{ width: `${xpInfo.percent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#2874f0]">
              {tasksCompletedCount}/6
            </span>
          </div>

          {/* 4 Verified Task Milestone Tabs */}
          <div className="mt-3 grid grid-cols-4 gap-1.5">
            {CHEST_MILESTONES.map((c) => {
              const isOpened = claimedChestIds.includes(c.id);
              const isSelected = selectedChestId === c.id;
              const isReady = !isOpened && tasksCompletedCount >= c.requiredTasksCompleted;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedChestId(c.id);
                    setOpenedRewardPackage(null);
                  }}
                  className={`px-2 py-1.5 rounded-sm font-black text-[11px] flex items-center justify-center space-x-1 transition cursor-pointer border ${
                    isSelected
                      ? 'bg-[#2874f0] text-white border-[#2874f0] shadow-xs'
                      : isOpened
                      ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                      : isReady
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <span>{isOpened ? '✅' : c.icon}</span>
                  <span>{c.requiredTasksCompleted}T</span>
                </button>
              );
            })}
          </div>

          {/* Chest Display */}
          <div className="flex flex-col items-center justify-center my-4 py-4 rounded-md bg-[#f5f8ff] border border-blue-100">
            <div
              onClick={handleOpenChest}
              className={`w-44 h-28 relative bg-gradient-to-b from-[#b45309] via-[#92400e] to-[#78350f] rounded-2xl border-4 border-amber-300 shadow-lg flex flex-col items-center justify-center ${
                isBoxReadyToClaim ? 'cursor-pointer hover:scale-105 transition' : ''
              } ${isOpeningAnimation ? 'animate-bounce' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-amber-300 border-2 border-amber-600 flex items-center justify-center font-black text-amber-950 text-sm">
                {isBoxOpened ? '✓' : isBoxReadyToClaim ? '🔓' : '🔒'}
              </div>
              {isBoxReadyToClaim && (
                <span className="mt-1 px-2 py-0.5 rounded-sm bg-[#388e3c] text-white font-black text-[10px]">
                  READY!
                </span>
              )}
            </div>

            <h4 className="text-base font-black text-[#212121] mt-3">{activeChest.label}</h4>
            <p className="text-xs text-[#2874f0] font-bold">{activeChest.hindiLabel}</p>
          </div>

          {/* Fixed Verified Rewards Summary */}
          <div className="bg-[#f9fafb] p-3 rounded-sm border border-slate-200 mb-3 flex items-center justify-around text-center">
            <div>
              <div className="text-lg">🪙</div>
              <div className="text-xs font-black text-[#fb641b]">+{activeChest.coinReward} Coins</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-lg">⚡</div>
              <div className="text-xs font-black text-[#2874f0]">+{activeChest.xpReward} EXP</div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-lg">🛡️</div>
              <div className="text-[11px] font-bold text-[#388e3c] flex items-center gap-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Real Verified
              </div>
            </div>
          </div>

          {feedback && (
            <div className="mb-3 p-2.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              {feedback}
            </div>
          )}

          {openedRewardPackage && (
            <div className="mb-3 p-3 rounded-sm bg-emerald-50 border border-emerald-300 text-center animate-fadeIn">
              <h5 className="text-xs font-black text-[#388e3c]">
                🎉 {openedRewardPackage.label} से मिला:
              </h5>
              <div className="flex items-center justify-center gap-4 mt-1 text-xs font-bold">
                <span className="text-[#fb641b]">🪙 +{openedRewardPackage.coins} Coins</span>
                <span className="text-[#2874f0]">⚡ +{openedRewardPackage.xp} EXP</span>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="space-y-2">
            {isBoxOpened ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-sm font-black text-sm bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>यह माइलस्टोन चेस्ट क्लेम हो चुका है</span>
              </button>
            ) : isBoxReadyToClaim ? (
              <button
                type="button"
                onClick={handleOpenChest}
                disabled={isOpeningAnimation}
                className="w-full py-3 rounded-sm font-black text-sm text-white bg-[#388e3c] hover:bg-[#2e7d32] transition shadow-sm cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{isOpeningAnimation ? 'खुल रहा है...' : 'चेस्ट खोलें (+5 Coins + EXP)'}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-sm font-black text-xs bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  अनलॉक करने के लिए {activeChest.requiredTasksCompleted} वेरीफाइड टास्क पूरे करें (अभी: {tasksCompletedCount})
                </span>
              </button>
            )}

            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuyCoins();
                }}
                className="w-full py-2 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>🪙 Buy Coins (कॉइन्स खरीदें)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
