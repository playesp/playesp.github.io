import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { X, Trophy, Gift, Check, Lock, RefreshCw, Coins, Zap } from 'lucide-react';
import type { UserProfile, RealTaskStatus } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { CHEST_MILESTONES, REAL_TASKS_CATALOG } from '../../config/economy.ts';

interface DailyTasksAndLoginModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
  initialTab?: 'tasks' | 'login' | 'chests';
  onNavigateTab?: (actionTab: string) => void;
  onOpenBuyCoins?: () => void;
}

export const DailyTasksAndLoginModal: React.FC<DailyTasksAndLoginModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  initialTab = 'tasks',
  onNavigateTab,
  onOpenBuyCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'chests'>(
    initialTab === 'login' || initialTab === 'chests' ? 'chests' : 'tasks'
  );
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
  const [notice, setNotice] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
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
      // safe default
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
    setNotice(null);
    try {
      const res = await api.claimVerifiedTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setNotice(
          `🎉 टास्क वेरीफाइड! 🪙 +${res.coinsAwarded || 5} Coins व ⚡ +${res.xpAwarded || task.xpReward} EXP जुड़े!`
        );
      } else {
        setNotice(res.message || 'टास्क अभी पूरा नहीं हुआ।');
      }
    } catch (err: any) {
      setNotice(err?.message || 'त्रुटि हुई।');
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimChest = async (chestId: string) => {
    if (busyId) return;
    setBusyId(chestId);
    setNotice(null);
    try {
      const res = await api.claimTaskMilestoneChest(user.userId, chestId);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadTasks();
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.55 } });
        setNotice(
          `🎁 चेस्ट खुला! 🪙 +${res.coinsAwarded || 5} Coins व ⚡ +${res.xpAwarded || 0} EXP मिले!`
        );
      } else {
        setNotice(res.message || 'चेस्ट अभी लॉक है।');
      }
    } catch (err: any) {
      setNotice(err?.message || 'चेस्ट क्लेम विफल।');
    } finally {
      setBusyId(null);
    }
  };

  const claimedCount = Math.max(tasksCompletedCount, tasks.filter((t) => t.isClaimed).length);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-md border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-[#ffe500]" />
            <h3 className="text-base font-black text-white">
              असली टास्क एवं माइलस्टोन चेस्ट (+5 Coins + EXP)
            </h3>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={loadTasks}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              title="Refresh"
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
          {notice && (
            <div className="mb-3 p-2.5 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {notice}
            </div>
          )}

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 gap-2 mb-4 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-3 rounded-sm font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'tasks'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>📋 असली टास्क्स (Real Tasks)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chests')}
              className={`py-2 px-3 rounded-sm font-black text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activeTab === 'chests'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>🎁 टास्क चेस्ट (Milestone Chests)</span>
            </button>
          </div>

          {activeTab === 'tasks' && (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 flex items-center justify-between hover:border-blue-300 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-[#212121] truncate">
                        {task.hindiTitle}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                        <span className="text-[#fb641b] font-mono font-bold">
                          🪙 +{task.coinReward} Coins
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#2874f0] font-mono font-bold">
                          ⚡ +{task.xpReward} EXP
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 font-mono">
                          {task.currentProgress}/{task.targetCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {task.isClaimed ? (
                      <span className="px-3 py-1 rounded-sm bg-emerald-50 text-[#388e3c] text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> क्लेम हुआ
                      </span>
                    ) : task.isCompleted ? (
                      <button
                        type="button"
                        disabled={busyId === task.id}
                        onClick={() => handleClaimTask(task)}
                        className="px-3 py-1.5 rounded-sm font-black text-xs bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs transition cursor-pointer"
                      >
                        {busyId === task.id ? '...' : `क्लेम +${task.coinReward}c`}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab?.(task.actionTab);
                        }}
                        className="px-3 py-1 rounded-sm bg-[#f5f8ff] text-[#2874f0] text-[11px] font-bold border border-blue-200 hover:bg-blue-50 cursor-pointer"
                      >
                        पूरा करें &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'chests' && (
            <div className="space-y-3">
              <p className="text-xs text-[#878787]">
                बिना किसी फेक फ्री-लॉगिन बोनस के, केवल <strong className="text-[#212121]">असली टास्क्स (1, 3, 5, 6)</strong> पूरा करने पर ही चेस्ट अनलॉक होते हैं!
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {CHEST_MILESTONES.map((chest) => {
                  const isClaimed = claimedChests.includes(chest.id);
                  const isReady = !isClaimed && claimedCount >= chest.requiredTasksCompleted;
                  return (
                    <div
                      key={chest.id}
                      className={`p-3 rounded-sm border flex flex-col justify-between text-center ${
                        isClaimed
                          ? 'bg-emerald-50 border-emerald-200'
                          : isReady
                          ? 'bg-amber-50 border-amber-300'
                          : 'bg-[#f9fafb] border-slate-200'
                      }`}
                    >
                      <div className="text-2xl">{chest.icon}</div>
                      <div className="text-xs font-black text-[#212121] mt-1">
                        {chest.hindiLabel}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold mt-1">
                        <span className="text-[#fb641b]">🪙 +{chest.coinReward}c</span>
                        <span className="text-[#2874f0]">⚡ +{chest.xpReward} EXP</span>
                      </div>
                      <div className="mt-2">
                        {isClaimed ? (
                          <span className="inline-block px-2.5 py-1 rounded-sm bg-emerald-100 text-[#388e3c] text-[10px] font-bold">
                            ✅ Claimed
                          </span>
                        ) : isReady ? (
                          <button
                            type="button"
                            disabled={busyId === chest.id}
                            onClick={() => handleClaimChest(chest.id)}
                            className="w-full py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black cursor-pointer"
                          >
                            {busyId === chest.id ? '...' : 'चेस्ट खोलें (+5c)'}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                            <Lock className="w-3 h-3" /> {claimedCount}/{chest.requiredTasksCompleted} Tasks
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-[#878787]">
            <span>
              कॉइन बैलेंस: <strong className="text-[#fb641b]">🪙 {user.coins || 0}</strong>
            </span>
            {onOpenBuyCoins ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBuyCoins();
                }}
                className="px-3 py-1 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-xs cursor-pointer flex items-center gap-1"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Buy Coins</span>
              </button>
            ) : (
              <span className="flex items-center gap-1 text-[#2874f0] font-bold">
                <Zap className="w-3.5 h-3.5" /> EXP: {user.gameXp || 0}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
