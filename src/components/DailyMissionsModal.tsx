import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Coins,
  Zap,
  ChevronRight,
  Check,
  RefreshCw,
  Lock,
} from 'lucide-react';
import type { UserProfile, RealTaskStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { CHEST_MILESTONES, REAL_TASKS_CATALOG } from '../config/economy.ts';

interface DailyMissionsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onPerformAction: (
    actionKey: 'moments' | 'idcard' | 'voice' | 'spin' | 'gift' | 'clans'
  ) => void;
  onOpenBuyCoins?: () => void;
}

function mapTaskToActionKey(
  actionTab: string
): 'moments' | 'idcard' | 'voice' | 'spin' | 'gift' | 'clans' {
  switch (actionTab) {
    case 'moments':
      return 'moments';
    case 'profile':
      return 'idcard';
    case 'games_arena':
      return 'spin';
    case 'voice_room':
    default:
      return 'voice';
  }
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser,
  onPerformAction,
  onOpenBuyCoins,
}) => {
  const [tasks, setTasks] = useState<RealTaskStatus[]>(() =>
    REAL_TASKS_CATALOG.map((item) => ({
      ...item,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    }))
  );
  const [claimedChests, setClaimedChests] = useState<string[]>([]);
  const [tasksCompletedCount, setTasksCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    try {
      const data = await api.getTasksStatus(user.userId);
      if (data?.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setTasksCompletedCount(data.tasksCompletedCount || 0);
        setClaimedChests(data.claimedChestMilestones || []);
        if (data.user) onUpdateUser(data.user);
      }
    } catch {
      // ignore fetch transient failure
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen, loadTasks]);

  if (!isOpen) return null;

  const claimedCount = tasks.filter((t) => t.isClaimed).length;
  const activeCount = Math.max(tasksCompletedCount, claimedCount);
  const nextChest =
    CHEST_MILESTONES.find((c) => !claimedChests.includes(c.id)) ||
    CHEST_MILESTONES[CHEST_MILESTONES.length - 1];
  const isNextChestReady =
    nextChest &&
    !claimedChests.includes(nextChest.id) &&
    activeCount >= nextChest.requiredTasksCompleted;

  const handleGoDo = (task: RealTaskStatus) => {
    const key =
      task.eventType === 'gift_sent' ? 'gift' : mapTaskToActionKey(task.actionTab);
    onClose();
    onPerformAction(key);
  };

  const handleClaimReward = async (task: RealTaskStatus) => {
    if (!task.isCompleted || task.isClaimed || busyId) return;
    setBusyId(task.id);
    try {
      const res = await api.claimVerifiedTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setFeedback(
          `🎉 वेरीफाइड! 🪙 +${res.coinsAwarded || 5} Coins और ⚡ +${res.xpAwarded || task.xpReward} EXP जुड़ गए!`
        );
      } else {
        setFeedback(res.message || 'टास्क अभी पूरा नहीं हुआ है।');
      }
    } catch (err: any) {
      setFeedback(err?.message || 'त्रुटि हुई।');
    } finally {
      setBusyId(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  const handleClaimChest = async () => {
    if (!isNextChestReady || !nextChest || busyId) return;
    setBusyId(nextChest.id);
    try {
      const res = await api.claimTaskMilestoneChest(user.userId, nextChest.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
        setFeedback(
          `🎁 ${nextChest.label} खुला! 🪙 +${res.coinsAwarded || 5} Coins और ⚡ +${res.xpAwarded || nextChest.xpReward} EXP मिले!`
        );
      } else {
        setFeedback(res.message || 'चेस्ट अभी अनलॉक नहीं है।');
      }
    } catch (err: any) {
      setFeedback(err?.message || 'त्रुटि हुई।');
    } finally {
      setBusyId(null);
      setTimeout(() => setFeedback(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden relative my-6 text-[#212121]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-blue-600 bg-[#2874f0] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center text-xl shadow-xs font-black">
              🎯
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>Real Verified Missions</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#ffe500] text-[#212121]">
                  +5 Coins + EXP Only
                </span>
              </h3>
              <p className="text-[11px] text-blue-100">
                पहले असली टास्क पूरा करें — तभी सर्वर से कॉइन्स और EXP जुड़ेंगे।
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={loadTasks}
              className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center animate-fadeIn">
            {feedback}
          </div>
        )}

        {/* Progress & Milestone Chest */}
        <div className="p-5 border-b border-slate-200 bg-[#f5f8ff]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-[#212121] flex items-center space-x-1.5">
              <span>Verified Tasks Progress</span>
              <span className="text-[#2874f0] font-mono font-black">
                ({claimedCount} / {tasks.length} Claimed)
              </span>
            </span>
            <span className="text-[11px] text-[#388e3c] font-black">
              {Math.round((claimedCount / Math.max(1, tasks.length)) * 100)}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#2874f0] h-full rounded-full transition-all duration-500"
              style={{
                width: `${(claimedCount / Math.max(1, tasks.length)) * 100}%`,
              }}
            />
          </div>

          {nextChest && (
            <div className="mt-4 p-3 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{nextChest.icon}</div>
                <div>
                  <div className="text-xs font-black text-[#212121] flex items-center space-x-1.5 flex-wrap">
                    <span>{nextChest.hindiLabel}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#ffe500] text-[#212121] font-black">
                      🪙 +{nextChest.coinReward} Coins + ⚡ +{nextChest.xpReward} EXP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {claimedChests.includes(nextChest.id)
                      ? 'सभी माइलस्टोन चेस्ट क्लेम हो चुके हैं!'
                      : isNextChestReady
                      ? 'चेस्ट अनलॉक हो चुका है! क्लेम बटन दबाएं।'
                      : `अनलॉक करने के लिए ${Math.max(0, nextChest.requiredTasksCompleted - activeCount)} और वेरीफाइड टास्क पूरे करें`}
                  </p>
                </div>
              </div>

              <div>
                {claimedChests.includes(nextChest.id) ? (
                  <span className="px-3 py-1.5 rounded-sm bg-emerald-50 text-[#388e3c] text-xs font-bold border border-emerald-200">
                    Claimed ✅
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleClaimChest}
                    disabled={!isNextChestReady || busyId === nextChest.id}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-black transition shadow-2xs ${
                      isNextChestReady
                        ? 'bg-[#fb641b] hover:bg-[#e5530d] text-white cursor-pointer'
                        : 'bg-white text-slate-400 border border-slate-200 cursor-not-allowed'
                    }`}
                  >
                    {isNextChestReady ? 'Claim +5c' : <Lock className="w-3.5 h-3.5 inline" />}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Verified Missions List */}
        <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto no-scrollbar bg-[#f1f3f6]">
          {tasks.map((task) => {
            const pct = Math.min(
              100,
              Math.round(((task.currentProgress || 0) / Math.max(1, task.targetCount)) * 100)
            );
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-md border transition-all flex items-center justify-between gap-3 shadow-2xs ${
                  task.isClaimed
                    ? 'bg-[#f9fafb] border-slate-200 opacity-75'
                    : task.isCompleted
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white hover:border-[#2874f0] border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                    {task.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-xs font-black text-[#212121]">{task.title}</h4>
                      <span className="text-[10px] text-slate-500">
                        ({task.currentProgress}/{task.targetCount})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1">
                      {task.hindiTitle}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-xs border border-amber-200 flex items-center space-x-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        <span>+{task.coinReward} Coins</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#2874f0] bg-[#f5f8ff] px-2 py-0.5 rounded-xs border border-blue-200 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-[#2874f0]" />
                        <span>+{task.xpReward} EXP</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{pct}%</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isClaimed ? (
                    <div className="flex items-center space-x-1 text-[#388e3c] font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200">
                      <Check className="w-3.5 h-3.5" />
                      <span>Claimed</span>
                    </div>
                  ) : task.isCompleted ? (
                    <button
                      type="button"
                      disabled={busyId === task.id}
                      onClick={() => handleClaimReward(task)}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-black bg-[#388e3c] hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                    >
                      {busyId === task.id ? '...' : `Claim +${task.coinReward}c`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGoDo(task)}
                      className="px-3.5 py-1.5 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white shadow-2xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <span>{task.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-600 gap-2">
          <span>
            🪙 कॉइन बैलेंस: <strong className="text-[#fb641b]">{user.coins || 0}</strong>
          </span>
          <div className="flex items-center space-x-2">
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuyCoins();
                }}
                className="px-3 py-1 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-black cursor-pointer"
              >
                🪙 Buy Coins
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 text-[#212121] border border-slate-300 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
