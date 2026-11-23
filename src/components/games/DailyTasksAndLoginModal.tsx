import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  Check,
  Lock,
  RefreshCw,
  Coins,
  Zap,
  Clock,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import type { UserProfile, RealTaskStatus, DailyGameHubData, LiveTimeMeta } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { sound8D } from '../../services/sound8d.ts';
import { CHEST_MILESTONES, REAL_TASKS_CATALOG } from '../../config/economy.ts';
import { SEVEN_DAY_CHECKIN_REWARDS, getIstDateString } from '../../config/dailyGameIntel.ts';

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
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

/** Crisp Golden Coin SVG with 4-point star emblem matching the Weekly Rewards card */
const StarGoldCoinSvg: React.FC<{ active?: boolean }> = ({ active = false }) => (
  <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_2px_4px_rgba(245,158,11,0.35)]" aria-hidden="true">
    <defs>
      <linearGradient id={active ? 'coinOuterActive' : 'coinOuter'} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffe566" />
        <stop offset="55%" stopColor="#ffbe18" />
        <stop offset="100%" stopColor="#f58b00" />
      </linearGradient>
      <linearGradient id={active ? 'coinInnerActive' : 'coinInner'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffc83b" />
        <stop offset="100%" stopColor="#ff9800" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="17.5" fill={`url(#${active ? 'coinOuterActive' : 'coinOuter'})`} stroke="#fff3b0" strokeWidth="1.4" />
    <circle cx="20" cy="20" r="13.2" fill={`url(#${active ? 'coinInnerActive' : 'coinInner'})`} stroke="#ffe98f" strokeWidth="1" />
    <path
      d="M20 11.2 C21.2 16.5, 23.5 18.8, 28.8 20 C23.5 21.2, 21.2 23.5, 20 28.8 C18.8 23.5, 16.5 21.2, 11.2 20 C16.5 18.8, 18.8 16.5, 20 11.2 Z"
      fill="#fffef2"
    />
  </svg>
);

/** Crisp Mystery Gift Box SVG for Day 7 & Top Header */
const MysteryGiftBoxSvg: React.FC<{ sizeClass?: string }> = ({ sizeClass = 'w-12 h-12' }) => (
  <svg viewBox="0 0 64 64" className={sizeClass} aria-hidden="true">
    <defs>
      <linearGradient id="giftBoxBody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#58d5ff" />
        <stop offset="100%" stopColor="#1ca8f5" />
      </linearGradient>
      <linearGradient id="giftBoxLid" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6be0ff" />
        <stop offset="100%" stopColor="#28b8ff" />
      </linearGradient>
      <linearGradient id="giftRibbon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffd748" />
        <stop offset="100%" stopColor="#ff9b19" />
      </linearGradient>
    </defs>
    {/* Pink gift wrap wing left */}
    <path d="M12 31 L20 26 L20 48 L12 43 Z" fill="#ff82b8" opacity="0.9" />
    {/* Box body */}
    <rect x="16" y="25" width="34" height="27" rx="5" fill="url(#giftBoxBody)" />
    {/* Vertical golden ribbon */}
    <rect x="29" y="25" width="8" height="27" fill="url(#giftRibbon)" />
    {/* Box lid */}
    <rect x="13" y="18" width="40" height="10" rx="4" fill="url(#giftBoxLid)" stroke="#ffffff" strokeWidth="1" />
    <rect x="29" y="18" width="8" height="10" fill="url(#giftRibbon)" />
    {/* Top bow */}
    <path d="M33 18 C25 8, 17 12, 24 18 Z" fill="#ffc933" stroke="#ff9800" strokeWidth="1" />
    <path d="M33 18 C41 8, 49 12, 42 18 Z" fill="#ffd95a" stroke="#ff9800" strokeWidth="1" />
    <circle cx="33" cy="18" r="3.2" fill="#ffe67d" />
    {/* Sparkles */}
    <path d="M11 16 L12.5 19.5 L16 21 L12.5 22.5 L11 26 L9.5 22.5 L6 21 L9.5 19.5 Z" fill="#ffd447" />
    <circle cx="53" cy="15" r="2.2" fill="#ffd447" />
    <circle cx="55" cy="36" r="1.8" fill="#ff7eb8" />
  </svg>
);

/** Cute ESP PLAY Blue Mascot Peeking Over Top White Dome + Gift + Balloons */
const EspPlayMascotTopArtwork: React.FC = () => (
  <div className="relative w-full h-[88px] flex items-end justify-center pointer-events-none select-none z-20 -mb-5">
    <svg viewBox="0 0 340 105" className="w-[310px] sm:w-[340px] h-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="mascotBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#35d0ff" />
          <stop offset="100%" stopColor="#099be8" />
        </linearGradient>
        <linearGradient id="pinkBalloon" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ff9bc9" />
          <stop offset="100%" stopColor="#ff4d94" />
        </linearGradient>
        <linearGradient id="blueBalloon" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#72ceff" />
          <stop offset="100%" stopColor="#268eff" />
        </linearGradient>
      </defs>

      {/* Curved White Dome Mound Peeking Behind Mascot */}
      <path d="M62 100 C74 52, 266 52, 278 100 Z" fill="#ffffff" />

      {/* Left Pink/Yellow Wrapped Gift Box */}
      <g transform="translate(86, 20) rotate(-18)">
        <rect x="0" y="9" width="28" height="22" rx="4" fill="#ffdf70" stroke="#ffb300" strokeWidth="1" />
        <rect x="11" y="9" width="6" height="22" fill="#ff5e99" />
        <rect x="-2" y="4" width="32" height="7" rx="3" fill="#ffe991" />
        <rect x="11" y="4" width="6" height="7" fill="#ff5e99" />
        <path d="M14 4 C8 -3, 3 0, 9 4 Z" fill="#ff5e99" />
        <path d="M14 4 C20 -3, 25 0, 19 4 Z" fill="#ff7eb0" />
      </g>

      {/* Tiny sparkle stars around gift */}
      <path d="M74 26 L75.5 29 L78.5 30.5 L75.5 32 L74 35 L72.5 32 L69.5 30.5 L72.5 29 Z" fill="#ffe066" />
      <circle cx="132" cy="14" r="2.2" fill="#ffe066" />

      {/* Right Balloons + Strings */}
      <path d="M232 60 Q229 76 226 90" stroke="#cbd5e1" strokeWidth="1.4" fill="none" />
      <path d="M250 67 Q246 80 241 90" stroke="#cbd5e1" strokeWidth="1.4" fill="none" />
      <ellipse cx="232" cy="39" rx="14" ry="17" transform="rotate(-8 232 39)" fill="url(#pinkBalloon)" />
      <ellipse cx="227" cy="32" rx="3.5" ry="5.5" transform="rotate(-18 227 32)" fill="#ffffff" opacity="0.45" />
      <ellipse cx="252" cy="50" rx="12.5" ry="15.5" transform="rotate(10 252 50)" fill="url(#blueBalloon)" />
      <ellipse cx="248" cy="44" rx="3" ry="4.5" transform="rotate(-10 248 44)" fill="#ffffff" opacity="0.45" />

      {/* Center Cute Blue ESP PLAY Mascot */}
      <g transform="translate(170, 56)">
        {/* Cute waving left arm */}
        <path d="M-26 8 C-38 2, -44 -5, -39 -12 C-34 -16, -26 -9, -22 -2 Z" fill="url(#mascotBlue)" />
        {/* Head/Body */}
        <ellipse cx="0" cy="4" rx="32" ry="28" fill="url(#mascotBlue)" />
        {/* Little hair tuft */}
        <path d="M-4 -23 Q0 -33 7 -22 Z" fill="#2cc8ff" />
        {/* Belly highlight */}
        <ellipse cx="0" cy="14" rx="18" ry="11" fill="#e6f8ff" opacity="0.92" />
        {/* Rosy cheeks */}
        <ellipse cx="-18" cy="4" rx="5" ry="3.2" fill="#ff8ab8" opacity="0.7" />
        <ellipse cx="18" cy="4" rx="5" ry="3.2" fill="#ff8ab8" opacity="0.7" />
        {/* Big glossy eyes */}
        <circle cx="-12" cy="-4" r="7.5" fill="#ffffff" />
        <circle cx="12" cy="-4" r="7.5" fill="#ffffff" />
        <circle cx="-11" cy="-4" r="5" fill="#1e293b" />
        <circle cx="11" cy="-4" r="5" fill="#1e293b" />
        <circle cx="-13" cy="-6" r="2" fill="#ffffff" />
        <circle cx="9" cy="-6" r="2" fill="#ffffff" />
        {/* Cute happy mouth */}
        <path d="M-6 2 Q0 10 6 2 Z" fill="#ff5a8d" />
      </g>

      {/* Gold Coins nestled at base left & right */}
      <g transform="translate(103, 66)">
        <circle cx="10" cy="12" r="10" fill="#ffbe18" stroke="#fff3b0" strokeWidth="1.5" />
        <circle cx="24" cy="15" r="8.5" fill="#ffa400" stroke="#fff3b0" strokeWidth="1.5" />
      </g>
      <g transform="translate(206, 67)">
        <circle cx="10" cy="14" r="9" fill="#ffbe18" stroke="#fff3b0" strokeWidth="1.5" />
        <circle cx="23" cy="11" r="10.5" fill="#ffa800" stroke="#fff3b0" strokeWidth="1.5" />
      </g>
    </svg>
  </div>
);

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
  const [justClaimedReward, setJustClaimedReward] = useState<{
    day: number;
    coins: number;
    xp: number;
  } | null>(null);
  const celebrationTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const autoCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      celebrationTimeoutsRef.current.forEach((t) => clearTimeout(t));
      celebrationTimeoutsRef.current = [];
      if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
    };
  }, []);

  const fireWeeklyRewardConfetti = useCallback((claimedDay: number) => {
    celebrationTimeoutsRef.current.forEach((t) => clearTimeout(t));
    celebrationTimeoutsRef.current = [];

    const festiveColors = ['#fbbf24', '#ff7a18', '#35d0ff', '#10b981', '#ec4899', '#ffffff'];

    confetti({
      particleCount: claimedDay >= 7 ? 140 : 100,
      spread: 85,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.52 },
      colors: festiveColors,
      zIndex: 9999,
    });

    const cannonTimer = setTimeout(() => {
      confetti({
        particleCount: 55,
        angle: 60,
        spread: 60,
        startVelocity: 42,
        origin: { x: 0.12, y: 0.65 },
        colors: festiveColors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 55,
        angle: 120,
        spread: 60,
        startVelocity: 42,
        origin: { x: 0.88, y: 0.65 },
        colors: festiveColors,
        zIndex: 9999,
      });
    }, 180);
    celebrationTimeoutsRef.current.push(cannonTimer);

    if (claimedDay >= 5) {
      const finaleTimer = setTimeout(() => {
        confetti({
          particleCount: claimedDay === 7 ? 120 : 70,
          spread: 110,
          startVelocity: 38,
          scalar: 1.15,
          origin: { x: 0.5, y: 0.38 },
          colors: ['#ffe500', '#fbbf24', '#fb641b', '#38bdf8', '#a855f7'],
          zIndex: 9999,
        });
      }, 420);
      celebrationTimeoutsRef.current.push(finaleTimer);
    }
  }, []);

  const persistDailyClaimLock = useCallback(
    (istDate: string) => {
      if (!istDate) return;
      try {
        localStorage.setItem(`esp_weekly_claimed_date_${user.userId}`, istDate);
        sessionStorage.setItem(`esp_weekly_popup_dismissed_${user.userId}`, istDate);
      } catch {}
    },
    [user.userId]
  );

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
        // Sync durable lock if server says already claimed today
        const resolvedDate = resolvedMeta?.istDate || hubRes.today;
        if (!hubRes.checkIn.canClaimToday && resolvedDate) {
          persistDailyClaimLock(resolvedDate);
        }
      }
    } catch {
      // keep existing fallback state cleanly
    } finally {
      setLoading(false);
    }
  }, [user.userId, onUpdateUser, persistDailyClaimLock]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time 1-second server-offset IST clock & midnight 12:00 AM IST auto-unlock
  useEffect(() => {
    let lastObservedIstDate = timeMeta?.istDate || getIstDateString();
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

  const activeIstDate = timeMeta?.istDate || hub?.today || getIstDateString(Date.now() + serverOffsetMs);

  // Determine whether today's Weekly Reward is still claimable (both server hub + local durable lock)
  const localClaimedDate = (() => {
    try {
      return localStorage.getItem(`esp_weekly_claimed_date_${user.userId}`) || '';
    } catch {
      return '';
    }
  })();
  const canClaimToday =
    hub !== null
      ? Boolean(hub.checkIn.canClaimToday) && localClaimedDate !== activeIstDate && user.lastDailyCheckInDate !== activeIstDate
      : localClaimedDate !== activeIstDate && user.lastDailyCheckInDate !== activeIstDate;

  const handleClaimCheckIn = async (useShield = false) => {
    if (!canClaimToday || busyId) return;
    setBusyId(useShield ? 'checkin-shield' : 'checkin');
    setNotice(null);
    try {
      const res = await api.claimDailyCheckIn(user.userId, useShield);
      const claimedIstDate = res.hub?.timeMeta?.istDate || res.hub?.today || activeIstDate;
      persistDailyClaimLock(claimedIstDate);

      if (res.hub) setHub(res.hub);
      if (res.user) {
        onUpdateUser({
          ...res.user,
          lastDailyCheckInDate: res.user.lastDailyCheckInDate || claimedIstDate,
        });
      } else {
        onUpdateUser({
          ...user,
          lastDailyCheckInDate: claimedIstDate,
        });
      }

      const claimedDay = res.newStreak
        ? ((res.newStreak - 1) % 7) + 1
        : res.hub?.checkIn.nextDayNumber || hub?.checkIn.nextDayNumber || 1;
      const earnedCoins = Number(res.coinsEarned || SEVEN_DAY_CHECKIN_REWARDS[claimedDay - 1]?.coins || 15);
      const earnedXp = Number(res.xpEarned || SEVEN_DAY_CHECKIN_REWARDS[claimedDay - 1]?.xp || 20);
      sound8D.playGiftSound('packet', Math.min(3, Math.max(1, Math.ceil(claimedDay / 3))));
      fireWeeklyRewardConfetti(claimedDay);
      setJustClaimedReward({ day: claimedDay, coins: earnedCoins, xp: earnedXp });
      setNotice(`Day ${claimedDay} Claimed! +${earnedCoins} Coins & +${earnedXp} EXP`);

      // When popped automatically at login/midnight, dismiss cleanly after celebratory confetti so it won't bother user again until 12 AM IST
      if (autoTriggeredReason !== 'manual') {
        if (autoCloseTimeoutRef.current) clearTimeout(autoCloseTimeoutRef.current);
        autoCloseTimeoutRef.current = setTimeout(() => {
          onClose();
        }, 2300);
      }
    } catch (err: any) {
      const msg = String(err?.message || 'चेक-इन क्लेम करने में त्रुटि हुई।');
      if (msg.includes('पहले ही क्लेम')) {
        persistDailyClaimLock(activeIstDate);
        await loadAll();
      }
      setNotice(msg);
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
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 }, zIndex: 9999 });
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
        confetti({ particleCount: 100, spread: 75, origin: { y: 0.55 }, zIndex: 9999 });
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

  // Build reliable 7-day schedule even while initial API request is settling
  const fallbackStreak = Math.max(0, Number(user.loginStreak || 0));
  const schedule =
    hub?.checkIn.schedule && hub.checkIn.schedule.length === 7
      ? hub.checkIn.schedule
      : SEVEN_DAY_CHECKIN_REWARDS.map((item) => {
          const completed = canClaimToday
            ? fallbackStreak % 7
            : Math.max(1, ((fallbackStreak - 1) % 7) + 1);
          return {
            ...item,
            claimed: item.day <= completed,
            isToday: canClaimToday && item.day === (fallbackStreak % 7) + 1,
          };
        });

  const row1Slots = schedule.slice(0, 4); // Day 1 - Day 4
  const day5Slot = schedule[4];
  const day6Slot = schedule[5];
  const day7Slot = schedule[6];

  // ==================== EXACT WEEKLY REWARDS POPUP VIEW ====================
  if (activeTab === 'streak') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/68 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] mt-14 sm:mt-10">
          {/* Circular Close Button Outside Top-Right Corner (Matches Reference) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Weekly Rewards"
            className="absolute -top-4 right-0 sm:-right-2 z-40 w-10 h-10 rounded-full bg-slate-900/55 hover:bg-slate-900/80 border-2 border-white/85 text-white flex items-center justify-center shadow-lg transition cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Cute ESP PLAY Blue Mascot + Gift + Balloons Header */}
          <EspPlayMascotTopArtwork />

          {/* 3D Curved Orange-Peach "Weekly Rewards" Ribbon Banner */}
          <div className="relative z-30 mx-auto w-[94%] -mb-5">
            {/* Left Folded Ribbon Tail */}
            <div
              className="hidden sm:block absolute left-[-10px] top-3 w-4 h-7 bg-[#e05b24] -z-10"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 40% 50%)' }}
            />
            {/* Right Folded Ribbon Tail */}
            <div
              className="hidden sm:block absolute right-[-10px] top-3 w-4 h-7 bg-[#e05b24] -z-10"
              style={{ clipPath: 'polygon(0 0, 100% 0, 60% 50%, 100% 100%, 0 100%)' }}
            />
            <div className="relative py-2.5 px-6 rounded-2xl bg-gradient-to-b from-[#ff9e61] via-[#ff8347] to-[#f4692c] shadow-[0_6px_16px_rgba(244,105,44,0.35)] border border-[#ffb987] text-center">
              <div className="absolute inset-x-4 top-0.5 h-1 rounded-full bg-white/30" />
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-[0_1px_2px_rgba(154,52,18,0.45)]">
                Weekly Rewards
              </h3>
            </div>
          </div>

          {/* Crisp Rounded White Main Card */}
          <div className="relative z-10 bg-white rounded-[28px] px-3.5 sm:px-4 pt-9 pb-4 shadow-[0_24px_60px_rgba(15,23,42,0.48)] border-2 border-orange-100/80 text-slate-900">
            {/* Subtle Midnight / Claim Toast Banner Inside Card */}
            {autoTriggeredReason === 'midnight' && !justClaimedReward && (
              <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold text-center">
                🌙 12:00 AM IST Reset — Day {hub?.checkIn.nextDayNumber || 1} Reward Unlocked!
              </div>
            )}

            {justClaimedReward && (
              <div className="mb-2.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black text-center flex items-center justify-center gap-1.5 animate-fadeIn">
                <span>🎉</span>
                <span>
                  Day {justClaimedReward.day} Claimed! +{justClaimedReward.coins} Coins &amp; +{justClaimedReward.xp} EXP
                </span>
              </div>
            )}

            {notice && !justClaimedReward && (
              <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold text-center">
                {notice}
              </div>
            )}

            {/* Row 1: Day 1 - Day 4 */}
            <div className="grid grid-cols-4 gap-2">
              {row1Slots.map((slot) => {
                const isActive = slot.isToday && canClaimToday;
                const isDone = slot.claimed || (justClaimedReward?.day === slot.day);
                return (
                  <div
                    key={slot.day}
                    className={`relative rounded-2xl py-2.5 px-1.5 flex flex-col items-center justify-between min-h-[104px] transition ${
                      isActive
                        ? 'bg-gradient-to-b from-[#ffb452] via-[#ff9231] to-[#fc7114] text-white shadow-[0_6px_14px_rgba(252,113,20,0.32)]'
                        : isDone
                        ? 'bg-[#fff7ed] border border-amber-200 text-amber-800'
                        : 'bg-[#f7f8fb] border border-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone && !isActive && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    {isActive && (
                      <>
                        <span className="absolute left-1.5 top-10 text-white/90 text-[10px] leading-none">✦</span>
                        <span className="absolute right-1.5 bottom-7 text-white/90 text-[9px] leading-none">✦</span>
                      </>
                    )}
                    <span
                      className={`text-[11px] font-bold ${
                        isActive ? 'text-white' : isDone ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      Day {slot.day}
                    </span>
                    <div className="my-1">
                      <StarGoldCoinSvg active={isActive} />
                    </div>
                    <span
                      className={`text-sm font-black tabular-nums leading-none ${
                        isActive ? 'text-white' : isDone ? 'text-emerald-700' : 'text-[#f97316]'
                      }`}
                    >
                      {slot.coins}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Row 2: Day 5, Day 6, Day 7 (col-span-2 Mystery Gift) */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[day5Slot, day6Slot].map((slot) => {
                if (!slot) return null;
                const isActive = slot.isToday && canClaimToday;
                const isDone = slot.claimed || (justClaimedReward?.day === slot.day);
                return (
                  <div
                    key={slot.day}
                    className={`relative rounded-2xl py-2.5 px-1.5 flex flex-col items-center justify-between min-h-[104px] transition ${
                      isActive
                        ? 'bg-gradient-to-b from-[#ffb452] via-[#ff9231] to-[#fc7114] text-white shadow-[0_6px_14px_rgba(252,113,20,0.32)]'
                        : isDone
                        ? 'bg-[#fff7ed] border border-amber-200 text-amber-800'
                        : 'bg-[#f7f8fb] border border-slate-100 text-slate-500'
                    }`}
                  >
                    {isDone && !isActive && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold ${
                        isActive ? 'text-white' : isDone ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      Day {slot.day}
                    </span>
                    <div className="my-1">
                      <StarGoldCoinSvg active={isActive} />
                    </div>
                    <span
                      className={`text-sm font-black tabular-nums leading-none ${
                        isActive ? 'text-white' : isDone ? 'text-emerald-700' : 'text-[#f97316]'
                      }`}
                    >
                      {slot.coins}
                    </span>
                  </div>
                );
              })}

              {/* Day 7 Mystery Gift Tile (2 Columns Wide) */}
              {day7Slot && (
                <div
                  className={`relative col-span-2 rounded-2xl py-2.5 px-3 flex flex-col justify-between min-h-[104px] transition ${
                    day7Slot.isToday && canClaimToday
                      ? 'bg-gradient-to-b from-[#ffb452] via-[#ff9231] to-[#fc7114] text-white shadow-[0_6px_14px_rgba(252,113,20,0.32)]'
                      : day7Slot.claimed || justClaimedReward?.day === 7
                      ? 'bg-[#fff7ed] border border-amber-200 text-amber-800'
                      : 'bg-[#f7f8fb] border border-slate-100 text-slate-500'
                  }`}
                >
                  {(day7Slot.claimed || justClaimedReward?.day === 7) && !(day7Slot.isToday && canClaimToday) && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <div
                    className={`text-center text-[11px] font-bold ${
                      day7Slot.isToday && canClaimToday
                        ? 'text-white'
                        : day7Slot.claimed || justClaimedReward?.day === 7
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    Day 7
                  </div>
                  <div className="flex items-center justify-center gap-2 my-auto pb-1">
                    <MysteryGiftBoxSvg sizeClass="w-11 h-11 sm:w-12 sm:h-12 shrink-0" />
                    <span
                      className={`text-xs sm:text-sm font-extrabold leading-tight ${
                        day7Slot.isToday && canClaimToday
                          ? 'text-white'
                          : day7Slot.claimed || justClaimedReward?.day === 7
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {day7Slot.claimed || justClaimedReward?.day === 7 ? 'Claimed ✓' : 'Mystery Gift'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Wide Rounded Pill "Claim" CTA Button */}
            <div className="mt-4">
              {canClaimToday ? (
                <button
                  type="button"
                  disabled={Boolean(busyId) || loading}
                  onClick={() => handleClaimCheckIn(false)}
                  className="w-full max-w-[270px] mx-auto block py-3 rounded-full bg-gradient-to-b from-[#ffb347] via-[#ff912b] to-[#fc7416] hover:from-[#ffa534] hover:to-[#ea660a] text-white font-black text-base tracking-wide shadow-[0_6px_18px_rgba(252,116,22,0.38)] active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
                >
                  {busyId === 'checkin' ? 'Claiming...' : 'Claim'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full max-w-[270px] mx-auto block py-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm cursor-default"
                >
                  Claimed Today ✓
                </button>
              )}

              {/* Optional Streak Shield Rescue Button when streak broke & shields available */}
              {hub?.checkIn.streakMissedReset && canClaimToday && (hub.checkIn.streakShields || 0) > 0 && (
                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={() => handleClaimCheckIn(true)}
                  className="mt-2 mx-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-700 text-[11px] font-bold cursor-pointer transition"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>
                    {busyId === 'checkin-shield'
                      ? 'Saving Streak...'
                      : `Use Streak Shield (${hub.checkIn.streakShields}) to Continue`}
                  </span>
                </button>
              )}
            </div>

            {/* Quiet Live 12 AM IST Clock Strip + Tasks & Chests Link */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1 tabular-nums truncate">
                <Clock className="w-3 h-3 text-orange-400 shrink-0" />
                <span className="truncate">
                  {liveIstClockLabel} · 12 AM: {secondsLeft !== null ? formatCountdown(secondsLeft) : '--:--:--'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('tasks')}
                className="shrink-0 font-bold text-[#2874f0] hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer pl-2 py-1"
              >
                <span>Tasks &amp; Chests</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TASKS & MILESTONE CHESTS VIEW ====================
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl text-[#212121] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#ff912b] via-[#fc7416] to-[#e85d04] text-white">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('streak')}
              className="w-9 h-9 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center shrink-0 transition cursor-pointer"
              title="Back to Weekly Rewards"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                  ESP PLAY Tasks &amp; Chests
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-white/20 text-[9px] font-black text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  12 AM IST
                </span>
              </div>
              <p className="text-[10px] text-orange-50 font-semibold flex items-center gap-1 mt-0.5 tabular-nums flex-wrap">
                <Clock className="w-3 h-3 shrink-0" />
                <span>
                  {liveIstClockLabel} · Reset in {secondsLeft !== null ? formatCountdown(secondsLeft) : 'Syncing...'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={loadAll}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              title="Refresh Live Time"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {notice && (
            <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center">
              {notice}
            </div>
          )}

          {/* 3-Tab Switcher */}
          <div className="grid grid-cols-3 gap-1.5 mb-4 bg-[#f1f3f6] p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('streak')}
              className="py-2 px-2 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 text-[#878787] hover:text-[#212121]"
            >
              <Trophy className="w-3.5 h-3.5 text-orange-500" />
              <span>Weekly</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className={`py-2 px-2 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'tasks'
                  ? 'bg-[#fc7416] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>📋 Tasks (+5c)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('chests')}
              className={`py-2 px-2 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'chests'
                  ? 'bg-[#fc7416] text-white shadow-xs'
                  : 'text-[#878787] hover:text-[#212121]'
              }`}
            >
              <span>🎁 Chests</span>
            </button>
          </div>

          {activeTab === 'tasks' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg bg-[#f9fafb] border border-slate-200 flex items-center justify-between hover:border-orange-300 transition"
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
