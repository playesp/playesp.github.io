import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Keyboard,
  Star,
  RotateCcw,
  ArrowRight,
  Volume2,
  VolumeX,
  Trophy,
  Timer,
  Flame,
  Sparkles,
  CheckCircle2,
  Sliders,
  Hand,
  BookOpen,
  Zap,
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { api } from '../../services/api.ts';

interface EspTypingAcademyProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  onUpdateUser?: (updated: UserProfile) => void;
}

interface TypingLesson {
  id: number;
  tier: 'Home Row' | 'Top Row' | 'Bottom Row' | 'Mastery';
  title: string;
  hindiTitle: string;
  targetWpm: number;
  focusKeys: string[];
  text: string;
}

interface LessonProgressRecord {
  bestWpm: number;
  bestAccuracy: number;
  stars: number; // 0..5
}

type AcademyMode = 'lessons' | 'speed_test' | 'custom';

const TYPING_LESSONS: TypingLesson[] = [
  {
    id: 1,
    tier: 'Home Row',
    title: '1. F & J Anchor Keys',
    hindiTitle: 'तर्जनी उंगली (Index Finger) अभ्यास',
    targetWpm: 16,
    focusKeys: ['f', 'j'],
    text: 'fff jjj fjf jfj ffjj jjff fjfj jfjf fff jjj fjf jfj ffj jjf fjfj',
  },
  {
    id: 2,
    tier: 'Home Row',
    title: '2. D & K Balance',
    hindiTitle: 'मध्यमा उंगली (Middle Finger) अभ्यास',
    targetWpm: 18,
    focusKeys: ['d', 'k', 'f', 'j'],
    text: 'ddd kkk dkd kdk df jk fd kj dfjk kjdf ddd kkk dfd jkj fdkj jkfd',
  },
  {
    id: 3,
    tier: 'Home Row',
    title: '3. S & L Rhythm',
    hindiTitle: 'अनामिका उंगली (Ring Finger) अभ्यास',
    targetWpm: 20,
    focusKeys: ['s', 'l', 'd', 'k', 'f', 'j'],
    text: 'sss lll sls lsl sldk jfls ask lad fall salad flask skill ask fall',
  },
  {
    id: 4,
    tier: 'Home Row',
    title: '4. A & ; Full Anchor',
    hindiTitle: 'छोटी उंगली (Pinky Finger) होम रो',
    targetWpm: 22,
    focusKeys: ['a', ';', 's', 'l', 'd', 'k', 'f', 'j'],
    text: 'aaa ;;; asdf jkl; dad sad lad ask all falls salad; a sad lad asks;',
  },
  {
    id: 5,
    tier: 'Home Row',
    title: '5. G & H Center Reach',
    hindiTitle: 'सेंटर होम कीज़ (G व H) स्ट्रेच',
    targetWpm: 24,
    focusKeys: ['g', 'h'],
    text: 'fgf jhj glad half hash dash flash hall gash flag shall jag glass glad',
  },
  {
    id: 6,
    tier: 'Home Row',
    title: '6. Home Row Mastery',
    hindiTitle: 'संपूर्ण होम-रो फ्लुएंसी टेस्ट',
    targetWpm: 28,
    focusKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
    text: 'a glad lad had a half glass; dash fast all falls shall pass as flags',
  },
  {
    id: 7,
    tier: 'Top Row',
    title: '7. E & I Vowels',
    hindiTitle: 'टॉप रो स्वर (E व I) अभ्यास',
    targetWpm: 26,
    focusKeys: ['e', 'i'],
    text: 'ded kik see kid life side like feel file slide deal idle field lead',
  },
  {
    id: 8,
    tier: 'Top Row',
    title: '8. R & U Swift Reach',
    hindiTitle: 'ऊपरी मध्य कीज़ (R व U)',
    targetWpm: 28,
    focusKeys: ['r', 'u'],
    text: 'frf juj fur sure rule full fire user true rush fluid dusk reuse jar',
  },
  {
    id: 9,
    tier: 'Top Row',
    title: '9. T & Y Center Bridge',
    hindiTitle: 'टी व वाई (T व Y) ब्रिज टाइपिंग',
    targetWpm: 30,
    focusKeys: ['t', 'y'],
    text: 'ftf jyj try yet stay style true day ray dust test trusty steady yard',
  },
  {
    id: 10,
    tier: 'Top Row',
    title: '10. W & O Edge Keys',
    hindiTitle: 'डब्ल्यू व ओ (W व O) रिंग रीच',
    targetWpm: 30,
    focusKeys: ['w', 'o'],
    text: 'sws lol wow flow slow wood work gold world follow grow yellow goal',
  },
  {
    id: 11,
    tier: 'Top Row',
    title: '11. Q & P Complete Top Row',
    hindiTitle: 'क्यू व पी (Q व P) टॉप-रो पूर्णता',
    targetWpm: 32,
    focusKeys: ['q', 'p'],
    text: 'aqa ;p; quit play quick power equip top quality spark apply rapid step',
  },
  {
    id: 12,
    tier: 'Bottom Row',
    title: '12. C V B N M Mix',
    hindiTitle: 'निचली पंक्ति (C V B N M) अभ्यास',
    targetWpm: 32,
    focusKeys: ['c', 'v', 'b', 'n', 'm'],
    text: 'calm vibe best name move become active balance nimble value climb',
  },
  {
    id: 13,
    tier: 'Bottom Row',
    title: '13. Z X & Punctuation',
    hindiTitle: 'पूर्ण कीबोर्ड Z X व विराम चिन्ह',
    targetWpm: 34,
    focusKeys: ['z', 'x', ',', '.', '/'],
    text: 'zero next zone, exact mix/fix. buzz extra zoom, quick fox jumps lazy.',
  },
  {
    id: 14,
    tier: 'Mastery',
    title: '14. Shift Capitals & Flow',
    hindiTitle: 'शिफ्ट की (Capitals) प्रो अभ्यास',
    targetWpm: 36,
    focusKeys: ['Shift'],
    text: 'Earn Daily Skill Points on ESP Platform. Practice Smart Typing Today!',
  },
  {
    id: 15,
    tier: 'Mastery',
    title: '15. Numbers 0-9 & Symbols',
    hindiTitle: 'नंबर्स (0-9) व स्पेशल सिंबल्स',
    targetWpm: 38,
    focusKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    text: 'Plan 10, 50, 100 & 300! Room #10001 active 24x7 with 99.5% accuracy.',
  },
];

const SPEED_TEST_PARAGRAPHS: string[] = [
  'Consistent daily typing practice builds smooth muscle memory across every finger on the keyboard. Keep your eyes focused ahead of the cursor, maintain relaxed wrists, and prioritize accuracy over raw rush so your words per minute rise naturally every week.',
  'Digital skills open real career doors across freelancing, remote office workflows, coding, and creator studios. Master the home row anchors first, trust touch placement for top and bottom rows, and watch your speed climb past fifty words per minute.',
  'Great communication blends clarity with rhythm. When your hands glide effortlessly over keys without glancing down, ideas flow directly onto the screen with calm precision, zero hesitation, and steady accuracy under pressure.',
];

type FingerId =
  | 'L-Pinky'
  | 'L-Ring'
  | 'L-Middle'
  | 'L-Index'
  | 'Thumb'
  | 'R-Index'
  | 'R-Middle'
  | 'R-Ring'
  | 'R-Pinky';

const FINGER_STYLE: Record<FingerId, { bg: string; border: string; label: string }> = {
  'L-Pinky': { bg: 'bg-rose-100 text-rose-900', border: 'border-rose-300', label: 'Left Pinky' },
  'L-Ring': { bg: 'bg-orange-100 text-orange-900', border: 'border-orange-300', label: 'Left Ring' },
  'L-Middle': { bg: 'bg-amber-100 text-amber-900', border: 'border-amber-300', label: 'Left Middle' },
  'L-Index': { bg: 'bg-emerald-100 text-emerald-900', border: 'border-emerald-300', label: 'Left Index' },
  Thumb: { bg: 'bg-sky-100 text-sky-900', border: 'border-sky-300', label: 'Thumb (Space)' },
  'R-Index': { bg: 'bg-cyan-100 text-cyan-900', border: 'border-cyan-300', label: 'Right Index' },
  'R-Middle': { bg: 'bg-blue-100 text-blue-900', border: 'border-blue-300', label: 'Right Middle' },
  'R-Ring': { bg: 'bg-indigo-100 text-indigo-900', border: 'border-indigo-300', label: 'Right Ring' },
  'R-Pinky': { bg: 'bg-purple-100 text-purple-900', border: 'border-purple-300', label: 'Right Pinky' },
};

interface KeyDef {
  label: string;
  shiftLabel?: string;
  code: string;
  finger: FingerId;
  flex?: number;
}

const KEYBOARD_ROWS: KeyDef[][] = [
  [
    { label: '1', shiftLabel: '!', code: '1', finger: 'L-Pinky' },
    { label: '2', shiftLabel: '@', code: '2', finger: 'L-Ring' },
    { label: '3', shiftLabel: '#', code: '3', finger: 'L-Middle' },
    { label: '4', shiftLabel: '$', code: '4', finger: 'L-Index' },
    { label: '5', shiftLabel: '%', code: '5', finger: 'L-Index' },
    { label: '6', shiftLabel: '^', code: '6', finger: 'R-Index' },
    { label: '7', shiftLabel: '&', code: '7', finger: 'R-Index' },
    { label: '8', shiftLabel: '*', code: '8', finger: 'R-Middle' },
    { label: '9', shiftLabel: '(', code: '9', finger: 'R-Ring' },
    { label: '0', shiftLabel: ')', code: '0', finger: 'R-Pinky' },
    { label: '-', shiftLabel: '_', code: '-', finger: 'R-Pinky' },
    { label: '⌫', code: 'Backspace', finger: 'R-Pinky', flex: 1.5 },
  ],
  [
    { label: 'q', code: 'q', finger: 'L-Pinky' },
    { label: 'w', code: 'w', finger: 'L-Ring' },
    { label: 'e', code: 'e', finger: 'L-Middle' },
    { label: 'r', code: 'r', finger: 'L-Index' },
    { label: 't', code: 't', finger: 'L-Index' },
    { label: 'y', code: 'y', finger: 'R-Index' },
    { label: 'u', code: 'u', finger: 'R-Index' },
    { label: 'i', code: 'i', finger: 'R-Middle' },
    { label: 'o', code: 'o', finger: 'R-Ring' },
    { label: 'p', code: 'p', finger: 'R-Pinky' },
  ],
  [
    { label: 'a', code: 'a', finger: 'L-Pinky' },
    { label: 's', code: 's', finger: 'L-Ring' },
    { label: 'd', code: 'd', finger: 'L-Middle' },
    { label: 'f', code: 'f', finger: 'L-Index' },
    { label: 'g', code: 'g', finger: 'L-Index' },
    { label: 'h', code: 'h', finger: 'R-Index' },
    { label: 'j', code: 'j', finger: 'R-Index' },
    { label: 'k', code: 'k', finger: 'R-Middle' },
    { label: 'l', code: 'l', finger: 'R-Ring' },
    { label: ';', shiftLabel: ':', code: ';', finger: 'R-Pinky' },
  ],
  [
    { label: '⇧ Shift', code: 'Shift', finger: 'L-Pinky', flex: 1.5 },
    { label: 'z', code: 'z', finger: 'L-Pinky' },
    { label: 'x', code: 'x', finger: 'L-Ring' },
    { label: 'c', code: 'c', finger: 'L-Middle' },
    { label: 'v', code: 'v', finger: 'L-Index' },
    { label: 'b', code: 'b', finger: 'L-Index' },
    { label: 'n', code: 'n', finger: 'R-Index' },
    { label: 'm', code: 'm', finger: 'R-Index' },
    { label: ',', shiftLabel: '<', code: ',', finger: 'R-Middle' },
    { label: '.', shiftLabel: '>', code: '.', finger: 'R-Ring' },
    { label: '/', shiftLabel: '?', code: '/', finger: 'R-Pinky' },
  ],
  [{ label: 'SPACE BAR', code: ' ', finger: 'Thumb', flex: 1 }],
];

const SHIFT_MAP: Record<string, string> = {
  '!': '1',
  '@': '2',
  '#': '3',
  '$': '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  ':': ';',
  '<': ',',
  '>': '.',
  '?': '/',
};

function findKeyDefForChar(ch: string): KeyDef | undefined {
  if (!ch) return undefined;
  if (ch === ' ') return KEYBOARD_ROWS[4][0];
  const lower = ch.toLowerCase();
  const mappedCode = SHIFT_MAP[ch] || lower;
  for (const row of KEYBOARD_ROWS) {
    for (const k of row) {
      if (k.code === mappedCode || k.label === lower || k.shiftLabel === ch) {
        return k;
      }
    }
  }
  return undefined;
}

function playMechanicalTone(ok: boolean) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = ok ? 'triangle' : 'sawtooth';
    osc.frequency.setValueAtTime(ok ? 560 : 190, ctx.currentTime);
    gain.gain.setValueAtTime(ok ? 0.05 : 0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (ok ? 0.045 : 0.1));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (ok ? 0.05 : 0.11));
    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 180);
  } catch {
    // ignore audio block
  }
}

export const EspTypingAcademy: React.FC<EspTypingAcademyProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const storageKey = `esp_typing_progress_${user?.userId || 'guest'}`;

  const [progressMap, setProgressMap] = useState<Record<number, LessonProgressRecord>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [mode, setMode] = useState<AcademyMode>('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [showLessonDrawer, setShowLessonDrawer] = useState<boolean>(false);
  const [showFingerGuide, setShowFingerGuide] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [customDraft, setCustomDraft] = useState<string>(
    'Practice fast, calm and accurate typing every day on ESP Typing Academy!'
  );
  const [speedTestIdx, setSpeedTestIdx] = useState<number>(0);

  // Typing Session State
  const [typedChars, setTypedChars] = useState<string>('');
  const [errorCount, setErrorCount] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [lastMistakeChar, setLastMistakeChar] = useState<string | null>(null);
  const [virtualShift, setVirtualShift] = useState<boolean>(false);
  const [rewardFeedback, setRewardFeedback] = useState<string>('');

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const activeLesson =
    TYPING_LESSONS.find((l) => l.id === selectedLessonId) || TYPING_LESSONS[0];

  const targetText =
    mode === 'lessons'
      ? activeLesson.text
      : mode === 'speed_test'
      ? SPEED_TEST_PARAGRAPHS[speedTestIdx % SPEED_TEST_PARAGRAPHS.length]
      : (customDraft.trim() || 'Type your custom text here to begin practice!');

  const targetGoalWpm = mode === 'lessons' ? activeLesson.targetWpm : 35;

  // Reload stored stars when user changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setProgressMap(raw ? JSON.parse(raw) : {});
    } catch {
      setProgressMap({});
    }
  }, [storageKey]);

  const resetDrill = useCallback(() => {
    setTypedChars('');
    setErrorCount(0);
    setTotalKeystrokes(0);
    setStreak(0);
    setStartedAt(null);
    setElapsedSec(0);
    setIsCompleted(false);
    setLastMistakeChar(null);
    setRewardFeedback('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetDrill();
      window.setTimeout(() => hiddenInputRef.current?.focus(), 80);
    }
  }, [isOpen, selectedLessonId, mode, speedTestIdx, resetDrill]);

  // Live timer (supports open stopwatch + 60s countdown in speed_test mode)
  useEffect(() => {
    if (!isOpen || !startedAt || isCompleted) return;
    const id = window.setInterval(() => {
      const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
      setElapsedSec(secs);
      if (mode === 'speed_test' && secs >= 60) {
        setIsCompleted(true);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [isOpen, startedAt, isCompleted, mode]);

  const currentIdx = typedChars.length;
  const expectedChar = targetText[currentIdx] || '';
  const correctCharsCount = typedChars
    .split('')
    .filter((ch, idx) => ch === targetText[idx]).length;

  const liveSeconds = Math.max(1, elapsedSec || (startedAt ? (Date.now() - startedAt) / 1000 : 1));
  const netWpm = startedAt ? Math.max(0, Math.round(correctCharsCount / 5 / (liveSeconds / 60))) : 0;
  const accuracy =
    totalKeystrokes > 0
      ? Math.max(0, Math.min(100, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100)))
      : 100;

  const calculateStars = (wpm: number, acc: number) => {
    if (acc < 60) return 1;
    let s = 1;
    if (acc >= 80) s = 2;
    if (acc >= 88 && wpm >= Math.round(targetGoalWpm * 0.65)) s = 3;
    if (acc >= 94 && wpm >= Math.round(targetGoalWpm * 0.9)) s = 4;
    if (acc >= 97 && wpm >= targetGoalWpm) s = 5;
    return s;
  };

  // Persist completion & award ESP Coins if user is logged in
  useEffect(() => {
    if (!isCompleted || totalKeystrokes === 0) return;

    const earnedStars = calculateStars(netWpm, accuracy);
    if (earnedStars >= 3) {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {}
    }

    if (mode === 'lessons') {
      setProgressMap((prev) => {
        const existing = prev[activeLesson.id] || { bestWpm: 0, bestAccuracy: 0, stars: 0 };
        const nextMap = {
          ...prev,
          [activeLesson.id]: {
            bestWpm: Math.max(existing.bestWpm, netWpm),
            bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
            stars: Math.max(existing.stars, earnedStars),
          },
        };
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextMap));
        } catch {}
        return nextMap;
      });
    }

    if (user?.userId) {
      const outcome = earnedStars >= 2 ? 'win' : 'loss';
      api
        .playFreeSkillMatch(user.userId, 'ESP Typing Academy', outcome, netWpm)
        .then((res) => {
          if (res?.currentCoins !== undefined && onUpdateUser) {
            onUpdateUser({ ...user, coins: res.currentCoins });
          }
          if (res?.message) {
            setRewardFeedback(res.message);
          } else {
            setRewardFeedback(`+${res?.coinsEarned || 10} Coins & +${res?.xpEarned || 10} EXP अर्जित!`);
          }
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const processInputChar = useCallback(
    (charInput: string) => {
      if (isCompleted || showLessonDrawer) return;

      if (charInput === 'Backspace') {
        if (typedChars.length > 0) {
          setTypedChars((prev) => prev.slice(0, -1));
          setLastMistakeChar(null);
        }
        return;
      }

      if (charInput.length !== 1) return;

      const now = Date.now();
      if (!startedAt) setStartedAt(now);

      const nextIndex = typedChars.length;
      const targetCh = targetText[nextIndex];
      if (!targetCh) return;

      const isCorrect = charInput === targetCh;
      setTotalKeystrokes((prev) => prev + 1);

      if (isCorrect) {
        if (soundEnabled) playMechanicalTone(true);
        setStreak((prev) => prev + 1);
        setLastMistakeChar(null);
      } else {
        if (soundEnabled) playMechanicalTone(false);
        setErrorCount((prev) => prev + 1);
        setStreak(0);
        setLastMistakeChar(targetCh === ' ' ? 'SPACE' : targetCh);
      }

      const nextTyped = typedChars + charInput;
      setTypedChars(nextTyped);

      if (nextTyped.length >= targetText.length) {
        setElapsedSec(Math.max(1, Math.floor((now - (startedAt || now)) / 1000)));
        setIsCompleted(true);
      }
    },
    [isCompleted, showLessonDrawer, typedChars, startedAt, targetText, soundEnabled]
  );

  // Physical Keyboard Listener when modal open and not editing custom textarea
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'TEXTAREA') return;
      if (tag === 'INPUT' && e.target !== hiddenInputRef.current) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        processInputChar('Backspace');
        return;
      }
      if (e.key.length === 1) {
        e.preventDefault();
        processInputChar(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, processInputChar]);

  if (!isOpen) return null;

  const totalStarsEarned = Object.values(progressMap).reduce((s, r) => s + (r.stars || 0), 0);
  const completedLessonsCount = Object.values(progressMap).filter((r) => r.stars > 0).length;
  const expectedKeyDef = findKeyDefForChar(expectedChar);
  const needsShift =
    expectedChar.length === 1 &&
    (/[A-Z]/.test(expectedChar) || Boolean(SHIFT_MAP[expectedChar]));
  const progressPct = targetText.length
    ? Math.min(100, Math.round((typedChars.length / targetText.length) * 100))
    : 0;
  const starsFinal = calculateStars(netWpm, accuracy);

  const remainingSpeedSeconds = mode === 'speed_test' ? Math.max(0, 60 - elapsedSec) : elapsedSec;

  return (
    <div className="fixed inset-0 z-[96] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-4 animate-fadeIn">
      <div className="esp-popup-card max-w-4xl bg-white border border-slate-200 overflow-hidden flex flex-col text-[#212121]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e3a8a] to-[#2874f0] text-white px-3.5 py-3 sm:px-5 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#ffe500] text-[#0f172a] flex items-center justify-center shadow shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black leading-tight truncate">
                  ESP Typing Academy
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-400 text-[#0f172a] text-[10px] font-black uppercase">
                  15 Lessons · Pro WPM
                </span>
              </div>
              <p className="text-[10.5px] sm:text-xs text-blue-100 truncate">
                {completedLessonsCount}/15 Lessons · ⭐ {totalStarsEarned}/75 Stars
                {user ? ` · +ESP Coins Reward Active` : ' · Free Skill Lab'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowFingerGuide((v) => !v)}
              className={`btn-3d px-2.5 py-1.5 rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer ${
                showFingerGuide ? 'bg-[#ffe500] text-[#212121]' : 'bg-white/15 text-white'
              }`}
              title="Finger Placement Color Guide"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fingers</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((v) => !v)}
              className="btn-3d p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              title="Toggle Key Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-3d p-1.5 rounded-lg bg-white/15 hover:bg-rose-500 text-white cursor-pointer"
              aria-label="Close ESP Typing Academy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Bar */}
        <div className="px-3 sm:px-5 py-2 bg-[#f8fafc] border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setMode('lessons');
                setShowLessonDrawer(false);
              }}
              className={`btn-3d px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black flex items-center gap-1 cursor-pointer ${
                mode === 'lessons' ? 'bg-[#2874f0] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lessons (1–15)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('speed_test');
                setShowLessonDrawer(false);
              }}
              className={`btn-3d px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black flex items-center gap-1 cursor-pointer ${
                mode === 'speed_test' ? 'bg-[#fb641b] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>60s WPM Test</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('custom');
                setShowLessonDrawer(false);
              }}
              className={`btn-3d px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black flex items-center gap-1 cursor-pointer ${
                mode === 'custom' ? 'bg-[#059669] text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Text</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {mode === 'lessons' && (
              <button
                type="button"
                onClick={() => setShowLessonDrawer((v) => !v)}
                className="btn-3d px-2.5 py-1.5 rounded-lg bg-[#ffe500] text-[#212121] text-[11px] font-black cursor-pointer"
              >
                {showLessonDrawer ? 'Back to Stage' : `Lesson #${activeLesson.id} Menu ▾`}
              </button>
            )}
            {mode === 'speed_test' && (
              <button
                type="button"
                onClick={() => setSpeedTestIdx((i) => (i + 1) % SPEED_TEST_PARAGRAPHS.length)}
                className="btn-3d px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-[#2874f0] text-[11px] font-black cursor-pointer"
              >
                Next Passage
              </button>
            )}
            <button
              type="button"
              onClick={resetDrill}
              className="btn-3d px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-black flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Scrollable Stage Body */}
        <div className="esp-auto-stage flex-1 overflow-y-auto space-y-3 bg-white">
          {/* Lesson Map Grid View */}
          {showLessonDrawer ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#212121]">
                  ESP Guided Typing Course (सभी 15 चरण)
                </h3>
                <span className="text-[11px] font-bold text-[#2874f0]">
                  किसी भी पाठ पर क्लिक करके अभ्यास शुरू करें
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {TYPING_LESSONS.map((lesson) => {
                  const rec = progressMap[lesson.id];
                  const active = lesson.id === activeLesson.id;
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        setSelectedLessonId(lesson.id);
                        setShowLessonDrawer(false);
                      }}
                      className={`btn-3d p-3 rounded-xl border text-left cursor-pointer flex flex-col justify-between gap-1.5 ${
                        active
                          ? 'bg-[#eff6ff] border-[#2874f0] ring-2 ring-blue-200'
                          : 'bg-white border-slate-200 hover:border-[#2874f0]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-black text-slate-700">
                          {lesson.tier}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                (rec?.stars || 0) >= s
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#212121]">{lesson.title}</p>
                        <p className="text-[10.5px] text-slate-500">{lesson.hindiTitle}</p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 pt-1 border-t border-slate-100 tabular-nums">
                        <span>Goal: {lesson.targetWpm} WPM</span>
                        {rec?.bestWpm ? (
                          <span className="text-emerald-700">
                            Best: {rec.bestWpm} WPM ({rec.bestAccuracy}%)
                          </span>
                        ) : (
                          <span className="text-[#2874f0]">Start →</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Custom Draft Editor when in Custom Mode */}
              {mode === 'custom' && !startedAt && (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <label className="text-[11px] font-black text-emerald-950 block">
                    अपना कस्टम अभ्यास टेक्स्ट लिखें या पेस्ट करें:
                  </label>
                  <textarea
                    rows={2}
                    value={customDraft}
                    onChange={(e) => {
                      setCustomDraft(e.target.value);
                      resetDrill();
                    }}
                    className="w-full rounded-lg border border-emerald-300 bg-white p-2 text-xs font-mono outline-none focus:border-[#2874f0]"
                    placeholder="Type or paste custom drill paragraph..."
                  />
                </div>
              )}

              {/* Live Metrics Telemetry Bar */}
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 text-center">
                <div className="p-2 rounded-xl bg-[#eff6ff] border border-blue-200">
                  <div className="text-[9.5px] sm:text-[10px] font-black uppercase text-blue-700">
                    Speed (WPM)
                  </div>
                  <div className="text-base sm:text-xl font-black text-[#1e3a8a] tabular-nums">
                    {netWpm}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[9.5px] sm:text-[10px] font-black uppercase text-emerald-700">
                    Accuracy
                  </div>
                  <div className="text-base sm:text-xl font-black text-emerald-900 tabular-nums">
                    {accuracy}%
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[9.5px] sm:text-[10px] font-black uppercase text-amber-800 flex items-center justify-center gap-0.5">
                    <Flame className="w-3 h-3 text-[#fb641b]" />
                    <span>Streak</span>
                  </div>
                  <div className="text-base sm:text-xl font-black text-[#fb641b] tabular-nums">
                    {streak}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="text-[9.5px] sm:text-[10px] font-black uppercase text-slate-600">
                    {mode === 'speed_test' ? 'Left (60s)' : 'Time'}
                  </div>
                  <div className="text-base sm:text-xl font-black text-slate-900 tabular-nums">
                    {remainingSpeedSeconds}s
                  </div>
                </div>
              </div>

              {/* 5-Star Target Progress Strip */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600">
                  <span className="truncate">
                    {mode === 'lessons'
                      ? `${activeLesson.title} · ${activeLesson.hindiTitle}`
                      : mode === 'speed_test'
                      ? '60-Second Certified WPM Sprint'
                      : 'Custom Text Accuracy & Flow Drill'}
                  </span>
                  <span className="shrink-0 tabular-nums text-[#2874f0]">
                    {progressPct}% · Goal {targetGoalWpm} WPM
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2874f0] via-[#06b6d4] to-[#10b981] transition-all duration-150"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Active Completion Summary OR Live Typing Prompt Box */}
              {isCompleted ? (
                <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 sm:p-5 text-center space-y-3">
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${
                          starsFinal >= s
                            ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-black text-[#0f172a]">
                      {starsFinal >= 4
                        ? '🎉 शानदार! Pro Speed & Accuracy!'
                        : starsFinal >= 2
                        ? '✅ बढ़िया अभ्यास पूरा हुआ!'
                        : '💪 अच्छा प्रयास — फिर कोशिश करें!'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Speed: <strong>{netWpm} WPM</strong> · Accuracy: <strong>{accuracy}%</strong> · Mistakes:{' '}
                      <strong>{errorCount}</strong>
                    </p>
                  </div>

                  {rewardFeedback && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffe500] text-[#212121] text-xs font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{rewardFeedback}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={resetDrill}
                      className="btn-3d px-4 py-2 rounded-xl bg-white border border-slate-300 text-[#212121] text-xs font-black flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Lesson</span>
                    </button>

                    {mode === 'lessons' && activeLesson.id < TYPING_LESSONS.length && (
                      <button
                        type="button"
                        onClick={() => setSelectedLessonId(activeLesson.id + 1)}
                        className="btn-3d px-5 py-2 rounded-xl bg-[#2874f0] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Next Lesson #{activeLesson.id + 1}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {mode === 'speed_test' && (
                      <button
                        type="button"
                        onClick={() => setSpeedTestIdx((i) => (i + 1) % SPEED_TEST_PARAGRAPHS.length)}
                        className="btn-3d px-5 py-2 rounded-xl bg-[#fb641b] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>New Speed Sprint</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Character-by-Character Typing Canvas */}
                  <div
                    onClick={() => hiddenInputRef.current?.focus()}
                    className="relative rounded-2xl border-2 border-slate-200 focus-within:border-[#2874f0] bg-[#fcfdff] p-3 sm:p-4 shadow-inner cursor-text select-none"
                  >
                    {/* Explicit Feedback Cue Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        {lastMistakeChar ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                            ✕ Fix Key: "{lastMistakeChar}" दबाएं
                          </span>
                        ) : startedAt ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>✓ Accurate Flow</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-[#2874f0] border border-blue-200 inline-flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            <span>सीधे टाइप करें या नीचे कीबोर्ड पर टैप करें</span>
                          </span>
                        )}
                      </div>

                      {expectedKeyDef && showFingerGuide && (
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-black ${
                            FINGER_STYLE[expectedKeyDef.finger].bg
                          } ${FINGER_STYLE[expectedKeyDef.finger].border}`}
                        >
                          Finger: {FINGER_STYLE[expectedKeyDef.finger].label}
                          {needsShift ? ' + Shift' : ''}
                        </span>
                      )}
                    </div>

                    {/* Rendered Monospace Text */}
                    <div className="font-mono text-[clamp(0.95rem,2.7vw,1.35rem)] leading-[1.8] tracking-wide break-words whitespace-pre-wrap">
                      {targetText.split('').map((ch, idx) => {
                        const isTyped = idx < typedChars.length;
                        const isCurrent = idx === typedChars.length;
                        const isMatch = isTyped && typedChars[idx] === ch;

                        let cls = 'text-slate-400';
                        if (isTyped) {
                          cls = isMatch
                            ? 'text-emerald-700 bg-emerald-100/80 rounded-[3px]'
                            : 'text-rose-700 bg-rose-200/90 underline decoration-rose-600 rounded-[3px]';
                        } else if (isCurrent) {
                          cls =
                            'bg-[#2874f0] text-white rounded-[4px] px-[2px] border-b-2 border-[#ffe500] animate-pulse';
                        }

                        return (
                          <span key={idx} className={cls}>
                            {ch}
                          </span>
                        );
                      })}
                    </div>

                    {/* Mobile / Screen-Reader Native Soft-Keyboard Trap */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        ref={hiddenInputRef}
                        type="text"
                        value=""
                        aria-label="Mobile and screen typing input"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="📱 मोबाइल कीबोर्ड खोलने के लिए यहाँ टैप करें..."
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v) {
                            for (const c of v) {
                              processInputChar(c);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace') {
                            e.preventDefault();
                            processInputChar('Backspace');
                          }
                        }}
                        className="w-full sm:w-auto flex-1 bg-slate-100/90 border border-slate-200 focus:border-[#2874f0] rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  {/* Responsive Interactive On-Screen QWERTY Keyboard (Scales on 320px+ mobile to desktop) */}
                  <div className="rounded-2xl bg-slate-100 border border-slate-200 p-1.5 sm:p-3 space-y-1.5 select-none">
                    {KEYBOARD_ROWS.map((row, rIdx) => (
                      <div key={rIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
                        {row.map((keyDef) => {
                          const targetMatch =
                            expectedKeyDef?.code === keyDef.code ||
                            (needsShift && keyDef.code === 'Shift');
                          const fingerTheme = FINGER_STYLE[keyDef.finger];

                          const displayChar =
                            keyDef.code === 'Shift' ||
                            keyDef.code === 'Backspace' ||
                            keyDef.code === ' '
                              ? keyDef.label
                              : virtualShift
                              ? keyDef.shiftLabel || keyDef.label.toUpperCase()
                              : keyDef.label;

                          return (
                            <button
                              key={keyDef.code + rIdx}
                              type="button"
                              onClick={() => {
                                if (keyDef.code === 'Shift') {
                                  setVirtualShift((s) => !s);
                                  return;
                                }
                                if (keyDef.code === 'Backspace') {
                                  processInputChar('Backspace');
                                  return;
                                }
                                if (keyDef.code === ' ') {
                                  processInputChar(' ');
                                  return;
                                }
                                const out = virtualShift
                                  ? keyDef.shiftLabel || keyDef.label.toUpperCase()
                                  : keyDef.label;
                                processInputChar(out);
                                if (virtualShift) setVirtualShift(false);
                              }}
                              style={{ flex: keyDef.flex || 1 }}
                              className={`h-8 sm:h-10 rounded-lg border font-mono font-black text-[clamp(0.625rem,2.1vw,0.85rem)] flex flex-col items-center justify-center transition cursor-pointer min-w-0 px-0.5 ${
                                targetMatch
                                  ? 'bg-[#2874f0] text-white border-[#1553b8] ring-2 ring-[#ffe500] scale-[1.04] z-10'
                                  : showFingerGuide
                                  ? `${fingerTheme.bg} ${fingerTheme.border}`
                                  : 'bg-white text-slate-800 border-slate-300'
                              }`}
                            >
                              <span className="truncate">{displayChar}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer Info Strip */}
        <div className="px-3.5 sm:px-5 py-2 bg-[#f8fafc] border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10.5px] sm:text-xs text-slate-600">
          <span className="flex items-center gap-1 font-bold text-[#2874f0]">
            <Trophy className="w-3.5 h-3.5 text-[#fb641b]" />
            <span>ESP Typing Academy · Auto-Save Stars &amp; Best WPM</span>
          </span>
          <span className="font-semibold">
            {user ? `ID: ${user.userId} (Skill Rewards Synced)` : 'Guest Practice Mode · Login for Coin Rewards'}
          </span>
        </div>
      </div>
    </div>
  );
};
