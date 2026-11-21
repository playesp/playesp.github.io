import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Check,
  Trophy,
  RefreshCw,
  Lock,
  Coins,
  Zap,
} from 'lucide-react';
import type { UserProfile, RealTaskStatus } from '../types/index.ts';
import { api } from '../services/api.ts';
import { CHEST_MILESTONES, REAL_TASKS_CATALOG } from '../config/economy.ts';

interface DailyTasksProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onNavigateToGames?: () => void;
  onNavigateToVoiceRoom?: () => void;
  onNavigateTab?: (actionTab: string) => void;
  onOpenBuyCoins?: () => void;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({
  user,
  onUpdateUser,
  onNavigateToGames,
  onNavigateToVoiceRoom,
  onNavigateTab,
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
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getTasksStatus(user.userId);
      if (data?.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setTasksCompletedCount(data.tasksCompletedCount || 0);
        setClaimedChests(data.claimedChestMilestones || []);
        if (data.user) {
          onUpdateUser(data.user);
        }
      }
    } catch {
      // keep safe initial state
    } finally {
      setLoading(false);
    }
  }, [user.userId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleClaimTask = async (task: RealTaskStatus) => {
    if (!task.isCompleted || task.isClaimed || busyId) return;
    setBusyId(task.id);
    setFeedback(null);
    try {
      const res = await api.claimVerifiedTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        setFeedback({
          type: 'success',
          text: `🎉 टास्क वेरीफाइड! 🪙 +${res.coinsAwarded || 5} Coins और ⚡ +${res.xpAwarded || task.xpReward} EXP आपके वॉलेट में जुड़ गए!`,
        });
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } else {
        setFeedback({ type: 'error', text: res.message || 'टास्क अभी पूरा नहीं हुआ है।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'टास्क क्लेम करने में त्रुटि हुई।' });
    } finally {
      setBusyId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleClaimChest = async (chestId: string) => {
    if (busyId) return;
    setBusyId(chestId);
    setFeedback(null);
    try {
      const res = await api.claimTaskMilestoneChest(user.userId, chestId);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        setFeedback({
          type: 'success',
          text: `🎁 माइलस्टोन चेस्ट अनलॉक! 🪙 +${res.coinsAwarded || 5} Coins और ⚡ +${res.xpAwarded || 0} EXP मिले!`,
        });
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 } });
      } else {
        setFeedback({ type: 'error', text: res.message || 'चेस्ट अभी अनलॉक नहीं है।' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'चेस्ट खोलने में समस्या।' });
    } finally {
      setBusyId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDoTask = (task: RealTaskStatus) => {
    if (onNavigateTab) {
      onNavigateTab(task.actionTab);
      return;
    }
    if (task.actionTab === 'games_arena') onNavigateToGames?.();
    else onNavigateToVoiceRoom?.();
  };

  const claimedTaskCount = tasks.filter((t) => t.isClaimed).length;
  const completedTaskCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-[#ffe500] flex items-center justify-center text-[#212121] font-black shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-[#212121]">
                Real Daily Tasks (+5 Coins & EXP)
              </h3>
              <span className="bg-[#ffe500] text-[#212121] font-extrabold text-[9px] px-2 py-0.5 rounded-sm">
                SERVER VERIFIED
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              जब आप असली गतिविधि पूरी करेंगे तभी प्रत्येक टास्क से <strong>+5 कॉइन्स</strong> व <strong>EXP</strong> मिलेंगे।
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="flex items-center space-x-3 bg-[#f9fafb] px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Completed</span>
              <span className="font-black text-[#388e3c]">{completedTaskCount}/{tasks.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block font-sans">Earned</span>
              <span className="font-black text-[#fb641b]">🪙 {claimedTaskCount * 5}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="p-2 rounded-md border border-slate-200 bg-[#f9fafb] hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="ताज़ा करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {onOpenBuyCoins && (
            <button
              type="button"
              onClick={onOpenBuyCoins}
              className="px-3 py-2 rounded-md bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black transition cursor-pointer flex items-center space-x-1 shadow-2xs"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Buy Coins</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-md border text-xs font-bold text-center animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Milestone Chests Bar */}
      <div className="bg-[#f5f8ff] border border-blue-200 rounded-md p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-[#212121]">
            🎁 टास्क माइलस्टोन चेस्ट (प्रत्येक अनलॉक पर +5 कॉइन्स + EXP)
          </span>
          <span className="text-[11px] font-mono font-bold text-[#2874f0]">
            Claimed: {Math.max(tasksCompletedCount, claimedTaskCount)}/6 Tasks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHEST_MILESTONES.map((chest) => {
            const isChestClaimed = claimedChests.includes(chest.id);
            const activeCount = Math.max(tasksCompletedCount, claimedTaskCount);
            const canUnlock = !isChestClaimed && activeCount >= chest.requiredTasksCompleted;

            return (
              <div
                key={chest.id}
                className={`p-2.5 rounded-sm border text-center flex flex-col items-center justify-between transition ${
                  isChestClaimed
                    ? 'bg-emerald-50 border-emerald-200'
                    : canUnlock
                    ? 'bg-amber-50 border-amber-400 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="text-xl">{chest.icon}</div>
                <div className="text-[11px] font-black text-[#212121] mt-0.5">{chest.label}</div>
                <div className="text-[10px] text-slate-500">
                  {chest.requiredTasksCompleted} Tasks • 🪙 +5 • ⚡ +{chest.xpReward}
                </div>
                {isChestClaimed ? (
                  <span className="mt-1.5 text-[10px] font-bold text-[#388e3c] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Claimed
                  </span>
                ) : canUnlock ? (
                  <button
                    type="button"
                    disabled={busyId === chest.id}
                    onClick={() => handleClaimChest(chest.id)}
                    className="mt-1.5 w-full py-1 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-[10px] font-black cursor-pointer"
                  >
                    {busyId === chest.id ? '...' : 'Claim +5c'}
                  </button>
                ) : (
                  <span className="mt-1.5 text-[10px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Task Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tasks.map((task) => {
          const progressPercent = Math.min(
            100,
            Math.round(((task.currentProgress || 0) / Math.max(1, task.targetCount)) * 100)
          );

          return (
            <div
              key={task.id}
              className={`p-4 rounded-md border transition-all relative overflow-hidden flex flex-col justify-between ${
                task.isClaimed
                  ? 'bg-[#f9fafb] border-slate-200 opacity-85'
                  : task.isCompleted
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-xl shrink-0">
                    {task.icon}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#212121]">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-600">{task.hindiTitle}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{task.description}</p>
                  </div>
                </div>

                {/* Fixed +5 Coins + EXP reward badge */}
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm bg-[#ffe500]/60 text-[#212121] border border-amber-300 font-mono text-xs font-black">
                    <span>🪙</span>
                    <span>+{task.coinReward}</span>
                  </span>
                  <span className="flex items-center justify-end gap-0.5 text-[10px] text-[#2874f0] font-mono font-bold mt-1">
                    <Zap className="w-3 h-3" />
                    <span>+{task.xpReward} EXP</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar & Action */}
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-600">
                    <span>
                      प्रगति: {task.currentProgress}/{task.targetCount}
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        task.isCompleted ? 'bg-[#388e3c]' : 'bg-[#2874f0]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isClaimed ? (
                    <span className="px-3 py-1.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5 text-[#388e3c]" />
                      <span>Claimed</span>
                    </span>
                  ) : task.isCompleted ? (
                    <button
                      type="button"
                      disabled={busyId === task.id}
                      onClick={() => handleClaimTask(task)}
                      className="px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-xs font-bold text-white flex items-center space-x-1 shadow-xs transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{busyId === task.id ? '...' : `Claim +${task.coinReward}c`}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDoTask(task)}
                      className="px-3 py-1.5 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 text-[#2874f0] border border-blue-200 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                    >
                      <span>{task.actionLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
