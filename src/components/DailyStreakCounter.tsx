import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Check, Gift, Clock, ShieldAlert, ArrowRight } from 'lucide-react';
import type { UserProfile, DailyGameHubData, LiveTimeMeta } from '../types/index.ts';
import { api } from '../services/api.ts';
import { sound8D } from '../services/sound8d.ts';
import {
  SEVEN_DAY_CHECKIN_REWARDS,
  getIstDateString,
  getYesterdayDateString,
} from '../config/dailyGameIntel.ts';

interface DailyStreakCounterProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenGames?: () => void;
}

function formatCountdown(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  user,
  onUpdateUser,
  onOpenGames,
}) => {
  const [hub, setHub] = useState<DailyGameHubData | null>(null);
  const [serverOffsetMs, setServerOffsetMs] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadStreakHub = useCallback(async () => {
    try {
      const [timeRes, hubRes] = await Promise.all([
        api.getLiveServerTime().catch(() => null),
        api.getDailyGameHub(user.userId).catch(() => null),
      ]);
      const meta: LiveTimeMeta | undefined = timeRes?.timeMeta || hubRes?.timeMeta;
      if (meta?.serverIso) {
        const offset = new Date(meta.serverIso).getTime() - Date.now();
        if (Number.isFinite(offset)) {
          setServerOffsetMs(offset);
        }
        setSecondsLeft(meta.secondsUntilMidnight);
      }
      if (hubRes) {
        setHub(hubRes);
      }
    } catch {
      // Fall back gracefully to user profile streak fields
    }
  }, [user.userId]);

  useEffect(() => {
    loadStreakHub();
  }, [loadStreakHub, user.lastDailyCheckInDate, user.loginStreak]);

  // Live 1-second IST countdown to 12:00:00 AM reset
  useEffect(() => {
    let lastIstDate = hub?.today || getIstDateString(Date.now() + serverOffsetMs);
    const tick = () => {
      const nowMs = Date.now() + serverOffsetMs;
      const istObj = new Date(nowMs + 5.5 * 60 * 60 * 1000);
      const currentIstDate = istObj.toISOString().slice(0, 10);
      const elapsed =
        istObj.getUTCHours() * 3600 + istObj.getUTCMinutes() * 60 + istObj.getUTCSeconds();
      setSecondsLeft(Math.max(0, 86400 - elapsed));
      if (currentIstDate !== lastIstDate) {
        lastIstDate = currentIstDate;
        loadStreakHub();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [hub?.today, serverOffsetMs, loadStreakHub]);

  // Derived streak summary with immediate fallback before API completes
  const streakView = useMemo(() => {
    if (hub?.checkIn) {
      return {
        currentStreak: hub.checkIn.currentStreak,
        canClaimToday: hub.checkIn.canClaimToday,
        nextDayNumber: hub.checkIn.nextDayNumber,
        streakMissedReset: hub.checkIn.streakMissedReset,
        streakShields: hub.checkIn.streakShields,
        schedule: hub.checkIn.schedule,
        istDate: hub.today,
      };
    }

    const today = getIstDateString(Date.now() + serverOffsetMs);
    const yesterday = getYesterdayDateString(today);
    const lastCheckIn = user.lastDailyCheckInDate || '';
    const claimedToday = lastCheckIn === today;
    const rawStreak = Number(user.loginStreak || 0);
    const isConsecutive = Boolean(lastCheckIn && lastCheckIn === yesterday && rawStreak > 0);
    const streakMissedReset = Boolean(lastCheckIn && !claimedToday && !isConsecutive && rawStreak > 0);
    const currentStreak = claimedToday || isConsecutive ? rawStreak : 0;
    const nextDayNumber = claimedToday
      ? Math.max(1, ((currentStreak - 1) % 7) + 1)
      : (currentStreak % 7) + 1;
    const completedDaysInCycle = claimedToday
      ? ((currentStreak - 1) % 7) + 1
      : currentStreak % 7;

    const schedule = SEVEN_DAY_CHECKIN_REWARDS.map((item) => ({
      ...item,
      claimed: !streakMissedReset && item.day <= completedDaysInCycle,
      isToday: !claimedToday && item.day === nextDayNumber,
    }));

    return {
      currentStreak,
      canClaimToday: !claimedToday,
      nextDayNumber,
      streakMissedReset,
      streakShields: Number(user.streakShields || 0),
      schedule,
      istDate: today,
    };
  }, [hub, user.lastDailyCheckInDate, user.loginStreak, user.streakShields, serverOffsetMs]);

  const handleClaimToday = async (useShield = false) => {
    if (!streakView.canClaimToday || claiming) return;
    setClaiming(true);
    setFeedback(null);
    try {
      const res = await api.claimDailyCheckIn(user.userId, useShield);
      const claimedIstDate = res.hub?.timeMeta?.istDate || res.hub?.today || streakView.istDate;
      try {
        localStorage.setItem(`esp_weekly_claimed_date_${user.userId}`, claimedIstDate);
        sessionStorage.setItem(`esp_weekly_popup_dismissed_${user.userId}`, claimedIstDate);
      } catch {}

      if (res.hub) setHub(res.hub);
      if (res.user) {
        onUpdateUser({
          ...res.user,
          lastDailyCheckInDate: res.user.lastDailyCheckInDate || claimedIstDate,
        });
      }

      const claimedDay = res.newStreak ? ((res.newStreak - 1) % 7) + 1 : streakView.nextDayNumber;
      const earnedCoins = Number(res.coinsEarned || SEVEN_DAY_CHECKIN_REWARDS[claimedDay - 1]?.coins || 15);
      const earnedXp = Number(res.xpEarned || SEVEN_DAY_CHECKIN_REWARDS[claimedDay - 1]?.xp || 20);

      sound8D.playGiftSound('packet', Math.min(3, Math.max(1, Math.ceil(claimedDay / 3))));
      confetti({
        particleCount: claimedDay === 7 ? 130 : 85,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#fb641b', '#2874f0', '#10b981'],
        zIndex: 9999,
      });

      setFeedback({
        type: 'success',
        text: `Day ${claimedDay} claimed: +${earnedCoins} Coins and +${earnedXp} EXP added.`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Unable to claim today’s reward right now.',
      });
      await loadStreakHub();
    } finally {
      setClaiming(false);
    }
  };

  const todayRewardSlot =
    streakView.schedule.find((s) => s.day === streakView.nextDayNumber) ||
    SEVEN_DAY_CHECKIN_REWARDS[0];
  const cycleDayProgress = streakView.canClaimToday
    ? streakView.currentStreak % 7
    : ((Math.max(1, streakView.currentStreak) - 1) % 7) + 1;
  const daysToMysteryGift = Math.max(0, 7 - cycleDayProgress);
  const progressPercent = Math.round((cycleDayProgress / 7) * 100);
  const totalDaysPlayed = Math.max(
    Number(user.totalDaysPlayed || 0),
    streakView.currentStreak
  );

  return (
    <section
      aria-label="Daily Streak Counter"
      className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5"
    >
      {/* Top Row: Primary Streak Figure + Direct Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Flame Visual Counter Crest */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center shrink-0 transition-colors ${
              streakView.currentStreak > 0
                ? 'bg-gradient-to-b from-[#ffb452] to-[#fc7114] text-white shadow-xs'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <Flame
              className={`w-5 h-5 ${
                streakView.currentStreak > 0 ? 'text-white fill-white/90' : 'text-slate-400'
              }`}
            />
            <span className="text-lg sm:text-xl font-black leading-none mt-0.5 tabular-nums">
              {streakView.currentStreak}
            </span>
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-[#212121] tracking-tight">
                Daily Streak Counter
              </h3>
              <span className="text-xs font-bold text-[#fc7114] tabular-nums">
                {streakView.currentStreak === 1
                  ? '1 consecutive day'
                  : `${streakView.currentStreak} consecutive days`}
              </span>
            </div>

            {/* Unboxed Clean Metadata Line */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 tabular-nums">
              <span>
                Cycle Day {cycleDayProgress}/7
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {totalDaysPlayed} total active {totalDaysPlayed === 1 ? 'day' : 'days'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>
                  12 AM reset in {secondsLeft !== null ? formatCountdown(secondsLeft) : '--:--:--'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Single Focal CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {streakView.canClaimToday ? (
            <button
              type="button"
              disabled={claiming}
              onClick={() => handleClaimToday(false)}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-md bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs sm:text-sm font-black shadow-xs transition cursor-pointer disabled:opacity-60 whitespace-nowrap flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4 shrink-0" />
              <span>
                {claiming
                  ? 'Claiming...'
                  : `Claim Day ${streakView.nextDayNumber} (+${todayRewardSlot.coins} Coins)`}
              </span>
            </button>
          ) : (
            <div className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap">
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Today&apos;s Reward Claimed</span>
            </div>
          )}
        </div>
      </div>

      {/* Optional Streak Shield Rescue Callout (only when streak broke and user holds shields) */}
      {streakView.streakMissedReset && streakView.canClaimToday && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {streakView.streakShields > 0
                ? `You missed a day — use 1 of your ${streakView.streakShields} Streak Shields to preserve your streak instead of restarting at Day 1.`
                : 'A previous day was missed, so claiming today starts a fresh Day 1 streak.'}
            </span>
          </div>
          {streakView.streakShields > 0 && (
            <button
              type="button"
              disabled={claiming}
              onClick={() => handleClaimToday(true)}
              className="px-3.5 py-2 min-h-[36px] rounded-md bg-[#2874f0] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0 whitespace-nowrap"
            >
              {claiming ? 'Restoring...' : `Use Shield (${streakView.streakShields})`}
            </button>
          )}
        </div>
      )}

      {feedback && (
        <div
          className={`px-3.5 py-2.5 rounded-md text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* 7-Day Visual Streak Progression Bar & Nodes */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-[#212121]">
            {daysToMysteryGift === 0
              ? '7-Day Cycle Complete — Mystery Gift unlocked!'
              : daysToMysteryGift === 1
              ? '1 more day to unlock the Day 7 Mystery Gift (100 Coins + 150 EXP)'
              : `${daysToMysteryGift} days remaining to unlock Day 7 Mystery Gift`}
          </span>
          <span className="font-mono font-bold text-[#2874f0] tabular-nums">{progressPercent}%</span>
        </div>

        {/* Continuous Progress Track */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffb452] via-[#fc7114] to-[#388e3c] transition-all duration-500"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        {/* 7-Day Stepper Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {streakView.schedule.map((slot) => {
            const isToday = slot.isToday && streakView.canClaimToday;
            const isClaimed = slot.claimed;
            const isMystery = slot.day === 7;

            return (
              <div
                key={slot.day}
                className={`rounded-md py-2 px-1 text-center flex flex-col items-center justify-between min-h-[76px] transition ${
                  isToday
                    ? 'bg-gradient-to-b from-[#ffb452] to-[#fc7114] text-white shadow-xs ring-2 ring-orange-200'
                    : isClaimed
                    ? 'bg-emerald-50 text-[#388e3c] border border-emerald-200'
                    : isMystery
                    ? 'bg-amber-50/70 text-amber-800 border border-amber-200'
                    : 'bg-[#f8f9fb] text-slate-500 border border-slate-200/80'
                }`}
              >
                <span
                  className={`text-[10px] sm:text-[11px] font-bold ${
                    isToday
                      ? 'text-white'
                      : isClaimed
                      ? 'text-[#388e3c]'
                      : isMystery
                      ? 'text-amber-800'
                      : 'text-slate-500'
                  }`}
                >
                  D{slot.day}
                </span>

                <div className="my-1 flex items-center justify-center">
                  {isClaimed ? (
                    <span className="w-5 h-5 rounded-full bg-[#388e3c] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : isMystery ? (
                    <Gift
                      className={`w-4 h-4 ${isToday ? 'text-white' : 'text-[#fb641b]'}`}
                    />
                  ) : (
                    <Flame
                      className={`w-4 h-4 ${
                        isToday ? 'text-white fill-white/80' : 'text-amber-500'
                      }`}
                    />
                  )}
                </div>

                <span
                  className={`text-[11px] font-extrabold tabular-nums leading-none ${
                    isToday
                      ? 'text-white'
                      : isClaimed
                      ? 'text-[#388e3c]'
                      : 'text-[#212121]'
                  }`}
                >
                  {isMystery ? '100c' : `${slot.coins}c`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quiet Footer Link */}
        {onOpenGames && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>
              {streakView.currentStreak === 0
                ? 'Log in and claim daily at 12:00 AM IST to build your streak.'
                : 'Keep claiming before 12:00 AM IST tomorrow to protect your streak.'}
            </span>
            <button
              type="button"
              onClick={onOpenGames}
              className="text-[#2874f0] hover:underline font-bold inline-flex items-center gap-0.5 cursor-pointer shrink-0 ml-2"
            >
              <span>Gaming Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
