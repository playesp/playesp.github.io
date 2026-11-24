import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Trophy,
  Check,
  RefreshCw,
  Clock,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import type {
  UserProfile,
  RealTaskStatus,
  ActivenessChestStatus,
  GrowthTaskStatus,
  FamilyTaskStatus,
  DailyGameHubData,
  LiveTimeMeta,
} from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { sound8D } from '../../services/sound8d.ts';
import {
  ACTIVENESS_CHESTS_CATALOG,
  GROWTH_TASKS_CATALOG,
  FAMILY_TASKS_CATALOG,
  REAL_TASKS_CATALOG,
} from '../../config/economy.ts';
import { SEVEN_DAY_CHECKIN_REWARDS, getIstDateString } from '../../config/dailyGameIntel.ts';

interface DailyTasksAndLoginModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose: () => void;
  initialTab?: 'tasks' | 'growth' | 'family' | 'login' | 'chests';
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

/** Compact Inline Reward Icons matching the Daily/Growth Task Rows */
const TaskCoinBadgeSvg: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="10.5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="7.5" fill="#f59e0b" />
    <path
      d="M12 6.8 L13.4 10.6 L17.2 12 L13.4 13.4 L12 17.2 L10.6 13.4 L6.8 12 L10.6 10.6 Z"
      fill="#fffbeb"
    />
  </svg>
);

const TaskHeartActivenessSvg: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path
      d="M12 21s-7.5-4.7-9.6-9C.6 8.3 2.7 4 6.7 4c2.1 0 3.9 1.1 5.3 2.8C13.4 5.1 15.2 4 17.3 4c4 0 6.1 4.3 4.3 8-2.1 4.3-9.6 9-9.6 9z"
      fill="#ef4444"
    />
    <path
      d="M5.5 12h3l1.7-2.8 2.4 5 1.8-2.2H18.5"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TaskExpHexSvg: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <polygon
      points="12,2 21,7 21,17 12,22 3,17 3,7"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="1.2"
    />
    <text
      x="12"
      y="14.5"
      textAnchor="middle"
      fontSize="6.8"
      fontWeight="900"
      fill="#ffffff"
      fontFamily="sans-serif"
    >
      EXP
    </text>
  </svg>
);

/** 4-Tier Treasure Chest SVG for Activeness Track (10, 40, 70, 100) */
const ActivenessChestSvg: React.FC<{
  tierColor: 'green' | 'blue' | 'gold' | 'royal';
  isUnlocked: boolean;
  isClaimed: boolean;
}> = ({ tierColor, isUnlocked, isClaimed }) => {
  const palette = {
    green: { lid: '#a3e635', body: '#65a30d', trim: '#fde047', clasp: '#fef08a' },
    blue: { lid: '#bfdbfe', body: '#60a5fa', trim: '#e2e8f0', clasp: '#fde047' },
    gold: { lid: '#fde047', body: '#eab308', trim: '#fb923c', clasp: '#fffbeb' },
    royal: { lid: '#a855f7', body: '#7e22ce', trim: '#facc15', clasp: '#fef08a' },
  }[tierColor];

  return (
    <svg
      viewBox="0 0 48 44"
      className={`w-10 h-9 sm:w-11 sm:h-10 transition-transform ${
        isUnlocked && !isClaimed ? 'scale-110 drop-shadow-[0_4px_8px_rgba(255,255,255,0.55)]' : 'drop-shadow-sm'
      } ${isClaimed ? 'opacity-80' : ''}`}
      aria-hidden="true"
    >
      {/* Chest Base */}
      <rect x="7" y="20" width="34" height="19" rx="4" fill={palette.body} stroke="#ffffff" strokeWidth="1.4" />
      {/* Gold/Silver Trim Bands */}
      <rect x="13" y="20" width="4" height="19" fill={palette.trim} opacity="0.92" />
      <rect x="31" y="20" width="4" height="19" fill={palette.trim} opacity="0.92" />
      {/* Chest Lid (slightly tilted open when unlocked or claimed) */}
      <g transform={isClaimed || isUnlocked ? 'translate(0, -2) rotate(-6 24 20)' : ''}>
        <path
          d="M6 21 C6 11, 42 11, 42 21 Z"
          fill={palette.lid}
          stroke="#ffffff"
          strokeWidth="1.4"
        />
        <rect x="13" y="13" width="4" height="8" rx="1" fill={palette.trim} />
        <rect x="31" y="13" width="4" height="8" rx="1" fill={palette.trim} />
      </g>
      {/* Center Lock Clasp */}
      <rect x="20.5" y="18" width="7" height="8" rx="2" fill={palette.clasp} stroke="#ca8a04" strokeWidth="1" />
      <circle cx="24" cy="22" r="1.4" fill="#854d0e" />
    </svg>
  );
};

export const DailyTasksAndLoginModal: React.FC<DailyTasksAndLoginModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  initialTab = 'login',
  onNavigateTab,
  autoTriggeredReason = 'manual',
}) => {
  const [activeTab, setActiveTab] = useState<'streak' | 'tasks' | 'growth' | 'family'>(
    initialTab === 'growth'
      ? 'growth'
      : initialTab === 'family'
      ? 'family'
      : initialTab === 'tasks' || initialTab === 'chests'
      ? 'tasks'
      : 'streak'
  );
  const [tasks, setTasks] = useState<RealTaskStatus[]>(() =>
    REAL_TASKS_CATALOG.map((item) => ({
      ...item,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: false,
    }))
  );
  const [todayActiveness, setTodayActiveness] = useState<number>(Number(user.todayActiveness || 0));
  const [activenessChests, setActivenessChests] = useState<ActivenessChestStatus[]>(() =>
    ACTIVENESS_CHESTS_CATALOG.map((c) => ({
      ...c,
      isUnlocked: Number(user.todayActiveness || 0) >= c.threshold,
      isClaimed: (user.claimedActivenessChests || []).includes(c.threshold),
    }))
  );
  const [growthTasks, setGrowthTasks] = useState<GrowthTaskStatus[]>(() =>
    GROWTH_TASKS_CATALOG.map((g) => ({
      ...g,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: (user.claimedGrowthTaskIds || []).includes(g.id),
    }))
  );
  const [familyTasks, setFamilyTasks] = useState<FamilyTaskStatus[]>(() =>
    FAMILY_TASKS_CATALOG.map((f) => ({
      ...f,
      currentProgress: 0,
      isCompleted: false,
      isClaimed: (user.claimedFamilyTaskIds || []).includes(f.id),
    }))
  );
  const [hub, setHub] = useState<DailyGameHubData | null>(null);
  const [timeMeta, setTimeMeta] = useState<LiveTimeMeta | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [liveIstClockLabel, setLiveIstClockLabel] = useState<string>('Syncing IST...');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
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
        if (typeof tasksRes.todayActiveness === 'number') {
          setTodayActiveness(tasksRes.todayActiveness);
        }
        if (Array.isArray(tasksRes.activenessChests)) {
          setActivenessChests(tasksRes.activenessChests);
        }
        if (Array.isArray(tasksRes.growthTasks)) {
          setGrowthTasks(tasksRes.growthTasks);
        }
        if (Array.isArray(tasksRes.familyTasks)) {
          setFamilyTasks(tasksRes.familyTasks);
        }
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
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, zIndex: 9999 });
        setNotice(
          `Claimed "${task.title}"! +${res.coinsAwarded || task.coinReward} Coins, +${
            res.activenessEarned || task.activenessReward || 15
          } Activeness & +${res.xpAwarded || task.xpReward} EXP`
        );
      } else {
        setNotice(res.message || 'Complete this task first.');
      }
    } catch (err: any) {
      setNotice(err?.message || 'Unable to claim reward right now.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimActivenessChest = async (chest: ActivenessChestStatus) => {
    if (busyId) return;
    if (!chest.isUnlocked) {
      setNotice(
        `Reach ${chest.threshold} Today's Activeness to unlock ${chest.label} (Current: ${todayActiveness}).`
      );
      return;
    }
    if (chest.isClaimed) return;
    setBusyId(`act-chest-${chest.threshold}`);
    setNotice(null);
    try {
      const res = await api.claimActivenessChest(user.userId, chest.threshold);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadAll();
        sound8D.playGiftSound('rocket', 1);
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.5 }, zIndex: 9999 });
        setNotice(
          `${chest.label} Opened! +${res.coinsEarned || chest.coinReward} Coins & +${
            res.xpEarned || chest.xpReward
          } EXP`
        );
      } else {
        setNotice(res.message || 'Chest is locked.');
      }
    } catch (err: any) {
      setNotice(err?.message || 'Unable to open chest.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimGrowth = async (task: GrowthTaskStatus) => {
    if (!task.isCompleted || task.isClaimed || busyId) return;
    setBusyId(task.id);
    setNotice(null);
    try {
      const res = await api.claimGrowthTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadAll();
        sound8D.play8DChime(680, 'win');
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
        setNotice(
          `Growth Unlocked "${task.title}": +${res.coinsEarned || task.coinReward} Coins & +${
            res.xpEarned || task.xpReward
          } EXP`
        );
      } else {
        setNotice(res.message || 'Complete this milestone first.');
      }
    } catch (err: any) {
      setNotice(err?.message || 'Unable to claim milestone.');
    } finally {
      setBusyId(null);
    }
  };

  const handleClaimFamily = async (task: FamilyTaskStatus) => {
    if (!task.isCompleted || task.isClaimed || busyId) return;
    setBusyId(task.id);
    setNotice(null);
    try {
      const res = await api.claimFamilyTask(user.userId, task.id);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        await loadAll();
        sound8D.play8DChime(660, 'win');
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 }, zIndex: 9999 });
        setNotice(
          `Family Task Claimed: +${res.coinsEarned || task.coinReward} Coins & +${
            res.activenessEarned || task.activenessReward
          } Activeness!`
        );
      } else {
        setNotice(res.message || 'Complete this family task first.');
      }
    } catch (err: any) {
      setNotice(err?.message || 'Unable to claim family task.');
    } finally {
      setBusyId(null);
    }
  };

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

  // ==================== DAILY / GROWTH / FAMILY TASK SYSTEM VIEW ====================
  const activenessPct = Math.min(100, Math.max(0, todayActiveness));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-stretch sm:items-center justify-center sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-[460px] h-full sm:h-[min(90dvh,780px)] bg-white sm:rounded-[28px] shadow-2xl border-0 sm:border sm:border-slate-200 flex flex-col overflow-hidden text-slate-900">
        {/* Vibrant Fresh Green Gradient Header (Matches Reference Mobile Task Screen) */}
        <div className="relative bg-gradient-to-b from-[#5eb953] via-[#7bd363] to-[#9be170] text-white shrink-0">
          {/* Top Navigation Row: Back Arrow | Daily / Growth / Family Tabs | Weekly Shortcut & Refresh */}
          <div className="flex items-center justify-between px-2 sm:px-3 pt-2.5 pb-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-11 h-11 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-1 min-w-0">
              {(
                [
                  { id: 'tasks', label: 'Daily' },
                  { id: 'growth', label: 'Growth' },
                  { id: 'family', label: 'Family' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setNotice(null);
                      setActiveTab(tab.id);
                    }}
                    className={`relative py-2 px-1.5 min-h-[40px] text-sm sm:text-[15px] transition whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive ? 'font-extrabold text-white' : 'font-semibold text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-full bg-white shadow-2xs" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('streak')}
                title="Weekly Rewards"
                className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={loadAll}
                title="Refresh Tasks"
                className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center text-white transition cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Daily Activeness Chest Track (Shown on Daily Tab) */}
          {activeTab === 'tasks' && (
            <div className="px-4 sm:px-5 pt-1 pb-5 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-white/95 font-semibold tabular-nums">
                <span>
                  Today&apos;s Activeness{' '}
                  <strong className="font-extrabold text-white text-sm">{todayActiveness}</strong>
                </span>
                <span className="text-[11px] text-white/90 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Refresh at 00:00</span>
                </span>
              </div>

              {/* 4-Station Activeness Treasure Chest Bar (10 / 40 / 70 / 100) */}
              <div className="relative pt-1 pb-1">
                {/* Horizontal Track Bar positioned behind the chest centers */}
                <div className="absolute left-[12.5%] right-[12.5%] top-[21px] h-1.5 rounded-full bg-[#4ea643]/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#fef08a] via-[#fde047] to-[#ffffff] rounded-full transition-all duration-500"
                    style={{ width: `${activenessPct}%` }}
                  />
                </div>

                <div className="relative z-10 grid grid-cols-4 gap-1 text-center">
                  {activenessChests.map((chest) => {
                    const ready = chest.isUnlocked && !chest.isClaimed;
                    return (
                      <button
                        key={chest.threshold}
                        type="button"
                        disabled={busyId === `act-chest-${chest.threshold}`}
                        onClick={() => handleClaimActivenessChest(chest)}
                        title={
                          chest.isClaimed
                            ? `${chest.label} Claimed`
                            : ready
                            ? `Open ${chest.label} (+${chest.coinReward} Coins)`
                            : `Need ${chest.threshold} Activeness`
                        }
                        className="flex flex-col items-center justify-center group cursor-pointer focus-visible:outline-none"
                      >
                        <div className="relative">
                          <ActivenessChestSvg
                            tierColor={chest.tierColor}
                            isUnlocked={chest.isUnlocked}
                            isClaimed={chest.isClaimed}
                          />
                          {ready && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#ff7a18] text-white text-[9px] font-black shadow animate-bounce">
                              Open
                            </span>
                          )}
                          {chest.isClaimed && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center shadow">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`mt-1 text-xs font-extrabold tabular-nums ${
                            chest.isUnlocked ? 'text-white' : 'text-[#245e20]'
                          }`}
                        >
                          {chest.threshold}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Family Status Strip (Shown on Family Tab) */}
          {activeTab === 'family' && (
            <div className="px-4 sm:px-5 pt-1 pb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-white truncate">
                    {user.clanName || user.familyId
                      ? `Family / Clan: ${user.clanName || user.familyId}`
                      : 'No Family Joined Yet'}
                  </div>
                  <div className="text-[11px] text-white/90 tabular-nums">
                    Today&apos;s Activeness: {todayActiveness} · Complete tasks to level up together
                  </div>
                </div>
              </div>
              {!(user.clanName || user.familyId) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateTab?.('family');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white text-[#3d9435] font-extrabold text-xs shrink-0 cursor-pointer hover:bg-emerald-50 transition"
                >
                  Join Now
                </button>
              )}
            </div>
          )}

          {/* Soft Curved Bottom Edge Transition into White Task List */}
          <div className="h-3.5 bg-white rounded-t-[20px]" />
        </div>

        {/* Inline Feedback Notice Banner */}
        {notice && (
          <div className="mx-4 mb-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center shrink-0">
            {notice}
          </div>
        )}

        {/* Scrollable White Task List Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-4 divide-y divide-slate-100">
          {/* TAB 1: DAILY TASKS */}
          {activeTab === 'tasks' &&
            tasks.map((task) => {
              const showProgress = task.targetCount > 1;
              return (
                <div
                  key={task.id}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[15px] font-semibold text-slate-900 leading-snug truncate">
                      {task.title}
                      {showProgress ? ` (${task.currentProgress}/${task.targetCount})` : ''}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3.5 mt-2 text-xs font-bold text-slate-600 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <TaskCoinBadgeSvg />
                        <span>x{task.coinReward}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TaskHeartActivenessSvg />
                        <span>x{task.activenessReward || 15}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <TaskExpHexSvg />
                        <span>x{task.xpReward}</span>
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {task.isClaimed ? (
                      <span className="inline-flex items-center justify-center gap-1 min-w-[74px] px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Done</span>
                      </span>
                    ) : task.isCompleted ? (
                      <button
                        type="button"
                        disabled={busyId === task.id}
                        onClick={() => handleClaimTask(task)}
                        className="min-w-[78px] px-4 py-2 min-h-[36px] rounded-full bg-gradient-to-r from-[#ff9f2e] to-[#fb641b] hover:from-[#f98d1a] hover:to-[#e5530d] text-white font-bold text-xs shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-60 whitespace-nowrap"
                      >
                        {busyId === task.id ? '...' : 'Claim'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab?.(task.actionTab);
                        }}
                        className="min-w-[74px] px-5 py-2 min-h-[36px] rounded-full bg-[#57ba47] hover:bg-[#49a33b] text-white font-bold text-xs sm:text-[13px] shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
                      >
                        Go
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* TAB 2: GROWTH MILESTONE TASKS (Matches Phone #3 in Reference) */}
          {activeTab === 'growth' &&
            growthTasks.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-[15px] font-semibold text-slate-900 leading-snug truncate">
                    {task.title}
                    {task.targetCount > 1 ? ` (${task.currentProgress}/${task.targetCount})` : ''}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3.5 mt-2 text-xs font-bold text-slate-600 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <TaskCoinBadgeSvg />
                      <span>x{task.coinReward}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TaskExpHexSvg />
                      <span>x{task.xpReward}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isClaimed ? (
                    <span className="inline-flex items-center justify-center gap-1 min-w-[74px] px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Done</span>
                    </span>
                  ) : task.isCompleted ? (
                    <button
                      type="button"
                      disabled={busyId === task.id}
                      onClick={() => handleClaimGrowth(task)}
                      className="min-w-[78px] px-4 py-2 min-h-[36px] rounded-full bg-gradient-to-r from-[#ff9f2e] to-[#fb641b] hover:from-[#f98d1a] hover:to-[#e5530d] text-white font-bold text-xs shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-60 whitespace-nowrap"
                    >
                      {busyId === task.id ? '...' : 'Claim'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab?.(task.actionTab);
                      }}
                      className="min-w-[74px] px-5 py-2 min-h-[36px] rounded-full bg-[#57ba47] hover:bg-[#49a33b] text-white font-bold text-xs sm:text-[13px] shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
                    >
                      Go
                    </button>
                  )}
                </div>
              </div>
            ))}

          {/* TAB 3: FAMILY TASKS */}
          {activeTab === 'family' &&
            familyTasks.map((task) => (
              <div
                key={task.id}
                className="py-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-[15px] font-semibold text-slate-900 leading-snug truncate">
                    {task.title}
                    {task.targetCount > 1 ? ` (${task.currentProgress}/${task.targetCount})` : ''}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {task.description}
                  </p>
                  <div className="flex items-center gap-3.5 mt-2 text-xs font-bold text-slate-600 tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <TaskCoinBadgeSvg />
                      <span>x{task.coinReward}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TaskHeartActivenessSvg />
                      <span>x{task.activenessReward}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TaskExpHexSvg />
                      <span>x{task.xpReward}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {task.isClaimed ? (
                    <span className="inline-flex items-center justify-center gap-1 min-w-[74px] px-3.5 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Done</span>
                    </span>
                  ) : task.isCompleted ? (
                    <button
                      type="button"
                      disabled={busyId === task.id}
                      onClick={() => handleClaimFamily(task)}
                      className="min-w-[78px] px-4 py-2 min-h-[36px] rounded-full bg-gradient-to-r from-[#ff9f2e] to-[#fb641b] hover:from-[#f98d1a] hover:to-[#e5530d] text-white font-bold text-xs shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-60 whitespace-nowrap"
                    >
                      {busyId === task.id ? '...' : 'Claim'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateTab?.(task.actionTab);
                      }}
                      className="min-w-[74px] px-5 py-2 min-h-[36px] rounded-full bg-[#57ba47] hover:bg-[#49a33b] text-white font-bold text-xs sm:text-[13px] shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap"
                    >
                      Go
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* Clean Bottom Status Footer */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 shrink-0 tabular-nums">
          <span>
            Coins: <strong className="text-amber-600 font-extrabold">{(user.coins || 0).toLocaleString()}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>EXP: <strong className="text-[#2874f0] font-extrabold">{user.gameXp || 0}</strong></span>
          </span>
          <span className="text-[11px] text-slate-500">
            {liveIstClockLabel} · Reset {secondsLeft !== null ? formatCountdown(secondsLeft) : '--:--:--'}
          </span>
        </div>
      </div>
    </div>
  );
};
