import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  Check,
  Lock,
  RefreshCw,
  Coins,
  Zap,
  Flame,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import type { UserProfile, RealTaskStatus, DailyGameHubData, LiveTimeMeta } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { sound8D } from '../../services/sound8d.ts';
import { CHEST_MILESTONES, REAL_TASKS_CATALOG } from '../../config/economy.ts';

interface DailyTasksAndLoginModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
  initialTab?: 'tasks' | 'login' | 'chests';
  onNavigateTab?: (actionTab: string) => void;
  onOpenBuyCoins?: () => void;
  autoTriggeredReason?: 'login' | 'midnight' | 'manual';
}

function formatCountdown(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function computeIstDisplayFromOffset(offsetMs: number) {
  const serverNowMs = Date.now() + offsetMs;
  const istDateObj = new Date(serverNowMs + 5.5 * 60 * 60 * 1000);
  const istDate = istDateObj.toISOString().slice(0, 10);
  const hh = istDateObj.getUTCHours();
  const mm = istDateObj.getUTCMinutes();
  const ss = istDateObj.getUTCSeconds();
  const istTimeLabel = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} IST`;
  const secondsLeft = Math.max(0, 86400 - (hh * 3600 + mm * 60 + ss));
  return { istDate, istTimeLabel, secondsLeft };
}

export const DailyTasksAndLoginModal: React.FC<DailyTasksAndLoginModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  initialTab = 'login',
  onNavigateTab,
  onOpenBuyCoins,
  autoTriggeredReason = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'streak' | 'tasks' | 'chests'>(
    initialTab === 'chests' ? 'chests' : initialTab === 'tasks' ? 'tasks' : 'streak'
  );
  const [tasks, setTasks] = useState<RealTaskStatus[]>(() =>
    REAL_TASKS_CATALOG.map((item) => ({
      ...item,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    }))
  );
  const [hub, setHub] = useState<DailyGameHubData | null>(null);
  const [timeMeta, setTimeMeta] = useState<LiveTimeMeta | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [liveIstClockLabel, setLiveIstClockLabel] = useState<string>('Syncing IST...');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [claimedChests, setClaimedChests] = useState<string[]>([]);
  const [tasksCompletedCount, setTasksCompletedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [liveTimeRes, tasksRes, hubRes] = await Promise.all([
        api.getLiveServerTime().catch(() => null),
        api.getTasksStatus(user.userId),
        api.getDailyGameHub(user.userId),
      ]);
      const resolvedMeta: LiveTimeMeta | null =
        liveTimeRes?.timeMeta || hubRes?.timeMeta || tasksRes?.timeMeta || null;
      if (resolvedMeta) {
        setTimeMeta(resolvedMeta);
        if (resolvedMeta.serverIso) {
          const offset = new Date(resolvedMeta.serverIso).getTime() - Date.now();
          if (Number.isFinite(offset)) {
            setServerOffsetMs(offset);
          }
        }
        setLiveIstClockLabel(resolvedMeta.istTimeLabel);
        setSecondsLeft(resolvedMeta.secondsUntilMidnight);
      }
      if (tasksRes?.success && Array.isArray(tasksRes.tasks)) {
        setTasks(tasksRes.tasks);
        setTasksCompletedCount(tasksRes.tasksCompletedCount || 0);
        setClaimedChests(tasksRes.claimedChestMilestones || []);
        if (tasksRes.user) onUpdateUser(tasksRes.user);
      }
      if (hubRes) {
        setHub(hubRes);
      }
    } catch {
      // keep existing state on transient glitch
    } finally {
      setLoading(false);
    }
  }, [user.userId, onUpdateUser]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time 1-second server-offset IST clock & midnight 12:00 AM IST countdown
  useEffect(() => {
    if (!timeMeta) return;
    let lastObservedIstDate = timeMeta.istDate;
    const timer = setInterval(() => {
      const snap = computeIstDisplayFromOffset(serverOffsetMs);
      setLiveIstClockLabel(snap.istTimeLabel);
      setSecondsLeft(snap.secondsLeft);
      if (snap.istDate !== lastObservedIstDate) {
        lastObservedIstDate = snap.istDate;
        loadAll();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeMeta?.istDate, serverOffsetMs, loadAll]);

  const handleClaimCheckIn = async (useShield = false) => {
    if (!hub?.checkIn.canClaimToday || busyId) return;
    setBusyId(useShield ? 'checkin-shield' : 'checkin');
    setNotice(null);
    try {
      const res = await api.claimDailyCheckIn(user.userId, useShield);
      if (res.hub) setHub(res.hub);
      if (res.user) onUpdateUser(res.user);
      sound8D.playGiftSound('packet', 2);
      confetti({ particleCount: 95, spread: 75, origin: { y: 0.55 } });
      setNotice(
        res.message ||
          `🎉 Day ${res.hub?.checkIn.nextDayNumber || 1} क्लेम पूरा! +${res.coinsEarned || 5} Coins मिले!`
      );
    } catch (err: any) {
      setNotice(err?.message || 'चेक-इन क्लेम करने में त्रुटि हुई।');
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimTask = async (task: RealTaskStatus) => {
    if (!task.isCompleted || task.isClaimed || busyId) return;
    setBusyId(task.id);
    setNotice(null);
    try {
      const res = await api.claimVerifiedTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadAll();
        sound8D.play8DChime(660, 'win');
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
        await loadAll();
        sound8D.playGiftSound('rocket', 1);
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#1d4ed8] via-[#2874f0] to-[#0284c7] text-white border-b border-blue-600">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#ffe500] text-slate-900 flex items-center justify-center shrink-0 shadow">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  Weekly Reward Claims (Day 1–7)
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-emerald-400/25 border border-emerald-300/60 text-[9px] font-black text-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  LIVE API
                </span>
              </div>
              <p className="text-[10px] text-blue-100 font-semibold flex items-center gap-1 mt-0.5 tabular-nums flex-wrap">
                <Clock className="w-3 h-3 text-[#ffe500] shrink-0" />
                <span>
                  {liveIstClockLabel} · {timeMeta?.istDate || 'Today'} · 12 AM रिसेट:{' '}
                  {secondsLeft !== null ? formatCountdown(secondsLeft) : 'Syncing...'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={loadAll}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              title="Live Time Sync Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close Weekly Reward Claims"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {autoTriggeredReason === 'midnight' && (
            <div className="mb-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold text-center">
              🌙 रात 12:00 AM (Live API IST) पूरे हो चुके हैं — आज का नया Weekly Reward अनलॉक हो गया है!
            </div>
          )}
          {notice && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {notice}
            </div>
          )}

          {/* 3-Tab Switcher */}
          <div className="grid grid-cols-3 gap-1.5 mb-4 bg-[#f1f3f6] p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('streak')}
              className={`py-2 px-2 rounded-md font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'streak'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Day 1–7</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-2 rounded-md font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'tasks'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>📋 Tasks (+5c)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chests')}
              className={`py-2 px-2 rounded-md font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'chests'
                  ? 'bg-[#2874f0] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>🎁 Chests</span>
            </button>
          </div>

          {/* TAB 1: STRICT CONSECUTIVE 7-DAY STREAK (12:00 AM IST LIVE) */}
          {activeTab === 'streak' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-black flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span>
                        Day {hub?.checkIn.nextDayNumber || 1} Reward
                        {hub?.checkIn.currentStreak ? ` · Streak: ${hub.checkIn.currentStreak} दिन` : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      आज Day 1 → कल Day 2 → परसों Day 3 (मिस करने पर फिर Day 1 से शुरू होगा)
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(busyId) || !hub?.checkIn.canClaimToday}
                    onClick={() => handleClaimCheckIn(false)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-black transition cursor-pointer shrink-0 whitespace-nowrap ${
                      hub?.checkIn.canClaimToday
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow'
                        : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 cursor-default'
                    }`}
                  >
                    {busyId === 'checkin'
                      ? 'क्लेम...'
                      : hub?.checkIn.canClaimToday
                      ? `🎁 Claim Day ${hub.checkIn.nextDayNumber}`
                      : '✅ आज क्लेम हो गया'}
                  </button>
                </div>

                {hub?.checkIn.streakMissedReset && hub.checkIn.canClaimToday && (
                  <div className="px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-400/40 text-[11px] text-rose-100 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
                      <span>
                        पिछला दिन मिस हो जाने के कारण स्ट्रीक रीसेट हो गई है — आज फिर से Day 1 क्लेम करें!
                      </span>
                    </div>
                    {(hub.checkIn.streakShields || 0) > 0 && (
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => handleClaimCheckIn(true)}
                        className="px-2.5 py-1 rounded-md bg-sky-400 hover:bg-sky-300 text-slate-950 text-[10px] font-black shrink-0 cursor-pointer"
                      >
                        {busyId === 'checkin-shield'
                          ? '...'
                          : `🛡️ Use Shield (${hub.checkIn.streakShields})`}
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-7 gap-1.5">
                  {(hub?.checkIn.schedule || []).map((slot) => (
                    <div
                      key={slot.day}
                      className={`rounded-lg p-1.5 text-center border ${
                        slot.isToday
                          ? 'bg-amber-400/25 border-amber-400 text-white shadow-sm ring-1 ring-amber-300'
                          : slot.claimed
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                          : 'bg-white/5 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="text-[9px] font-bold">D{slot.day}</div>
                      <div className="text-xs font-black mt-0.5 tabular-nums">
                        {slot.day === 7 ? '🏆' : '🪙'}
                        {slot.coins}
                      </div>
                      <div className="text-[8px] font-bold mt-0.5">
                        {slot.claimed ? '✓' : slot.isToday ? 'TODAY' : `+${slot.xp}xp`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-blue-50/70 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between gap-2">
                <span>रात 12:00 बजे (Live Server API Time) पर अगला दिन ऑटो-अनलॉक होता है।</span>
                <span className="font-mono font-bold text-[#2874f0] shrink-0 tabular-nums">
                  {liveIstClockLabel}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY REAL TASKS (RESET AT 12:00 AM IST) */}
          {activeTab === 'tasks' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-[#f9fafb] border border-slate-200 flex items-center justify-between hover:border-blue-300 transition"
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
                      <span className="px-3 py-1 rounded-md bg-emerald-50 text-[#388e3c] text-[11px] font-bold border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3" /> क्लेम हुआ
                      </span>
                    ) : task.isCompleted ? (
                      <button
                        type="button"
                        disabled={busyId === task.id}
                        onClick={() => handleClaimTask(task)}
                        className="px-3 py-1.5 rounded-md font-black text-xs bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs transition cursor-pointer"
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
                        className="px-3 py-1 rounded-md bg-[#f5f8ff] text-[#2874f0] text-[11px] font-bold border border-blue-200 hover:bg-blue-50 cursor-pointer"
                      >
                        पूरा करें &rarr;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: MILESTONE CHESTS */}
          {activeTab === 'chests' && (
            <div className="space-y-3">
              <p className="text-xs text-[#878787]">
                आज के <strong className="text-[#212121]">असली टास्क्स (1, 3, 5, 6)</strong> पूरा करने पर ही चेस्ट अनलॉक होते हैं — रोज़ रात 12:00 बजे नया चक्र!
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {CHEST_MILESTONES.map((chest) => {
                  const isClaimed = claimedChests.includes(chest.id);
                  const isReady = !isClaimed && claimedCount >= chest.requiredTasksCompleted;
                  return (
                    <div
                      key={chest.id}
                      className={`p-3 rounded-lg border flex flex-col justify-between text-center ${
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
                          <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-[#388e3c] text-[10px] font-bold">
                            ✅ Claimed
                          </span>
                        ) : isReady ? (
                          <button
                            type="button"
                            disabled={busyId === chest.id}
                            onClick={() => handleClaimChest(chest.id)}
                            className="w-full py-1.5 rounded-md bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black cursor-pointer"
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
                className="px-3 py-1.5 rounded-md bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-xs cursor-pointer flex items-center gap-1"
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
