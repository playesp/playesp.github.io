import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  DoorOpen,
  Star,
  Gamepad2,
  Radio,
  MessageCircle,
  Compass,
  Menu,
  Sparkles,
  Flame,
  Shield,
  Zap,
  Trophy,
  CheckCircle2,
  Briefcase,
  Layers,
  X,
  CreditCard,
  Crown,
  Gift,
  UserCheck,
  Target,
  ChevronRight,
  Coins,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import type { UserProfile, DailyGameHubData } from '../../types/index.ts';
import { sound8D } from '../../services/sound8d.ts';
import { api } from '../../services/api.ts';
import { getFrameByVariant, getVipConfig } from '../../config/economy.ts';
import { COIN_UTILITY_BOOSTERS } from '../../config/dailyGameIntel.ts';
import type { GameKey } from './InteractiveGameArenaModal.tsx';

interface WePlayHomeLobbyProps {
  user: UserProfile;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onOpenRanking: () => void;
  onOpenTasks: () => void;
  onOpenFriends: () => void;
  onOpenVoiceRoom: () => void;
  onOpenGame: (gameKey: GameKey) => void;
  onOpenWeeklyRewards?: () => void;
  onOpenRecharge: () => void;
  onOpenProfile?: () => void;
  onOpenChats?: () => void;
  onOpenAvatarCustomizer?: () => void;
  onOpenDailyMissions?: () => void;
  onOpenDailySpin?: () => void;
  onOpenGiftCards?: () => void;
  onOpenEarningSetup?: () => void;
  onOpenServicesSetup?: () => void;
  onOpenClans?: () => void;
}

const OrnateGameCard: React.FC<{
  title: string;
  gradient: string;
  onClick: () => void;
  characterImg: React.ReactNode;
  isFullWidth?: boolean;
  extraBadge?: React.ReactNode;
}> = ({ title, gradient, onClick, characterImg, isFullWidth = false, extraBadge }) => {
  return (
    <div
      onClick={() => {
        sound8D.play8DChime(520, 'click');
        onClick();
      }}
      className={`relative rounded-3xl p-0.5 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98] cursor-pointer overflow-visible group select-none ${
        isFullWidth ? 'w-full h-24 sm:h-28' : 'w-full h-22 sm:h-24'
      }`}
    >
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#d4af37] p-[2.5px] shadow-sm">
        <div
          className={`w-full h-full rounded-[20px] bg-gradient-to-r ${gradient} flex items-center justify-between px-4 sm:px-5 relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-[20px] pointer-events-none" />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-full bg-[#ffd700]/70" />

          <div className="relative z-10 space-y-1 max-w-[68%]">
            <h3
              className={`font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide font-sans leading-tight ${
                isFullWidth ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
              }`}
            >
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-black/25 text-[9px] font-bold text-emerald-200 tracking-wide whitespace-nowrap">
                🆓 FREE + COIN
              </span>
              {extraBadge}
            </div>
          </div>

          <div className="relative z-10 shrink-0 transform group-hover:scale-110 transition duration-300">
            {characterImg}
          </div>
        </div>
      </div>

      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
    </div>
  );
};

export const WePlayHomeLobby: React.FC<WePlayHomeLobbyProps> = ({
  user,
  onUpdateUser,
  onOpenRanking,
  onOpenTasks,
  onOpenFriends,
  onOpenVoiceRoom,
  onOpenGame,
  onOpenWeeklyRewards,
  onOpenRecharge,
  onOpenProfile,
  onOpenChats,
  onOpenAvatarCustomizer,
  onOpenDailyMissions,
  onOpenDailySpin,
  onOpenGiftCards,
  onOpenEarningSetup,
  onOpenServicesSetup,
  onOpenClans,
}) => {
  const frameItem = getFrameByVariant(user.frameType || 'standard');
  const vipCfg = getVipConfig(user.vipTier);

  const [hub, setHub] = useState<DailyGameHubData | null>(null);
  const [loadingHub, setLoadingHub] = useState(false);
  const [claimingCheckIn, setClaimingCheckIn] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
    message: string;
  } | null>(null);
  const [buyingBoosterId, setBuyingBoosterId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMeMenuModal, setShowMeMenuModal] = useState(false);

  const discoverSectionRef = useRef<HTMLDivElement | null>(null);

  const loadDailyHub = useCallback(async () => {
    if (!user?.userId) return;
    setLoadingHub(true);
    try {
      const data = await api.getDailyGameHub(user.userId);
      setHub(data);
    } catch {
      // Keep UI resilient if transient error occurs
    } finally {
      setLoadingHub(false);
    }
  }, [user?.userId]);

  useEffect(() => {
    loadDailyHub();
  }, [loadDailyHub, user.coins, user.totalGamesPlayed, user.lastDailyCheckInDate, user.dailyQuizDate]);

  const showTimedBanner = (type: 'success' | 'error', text: string) => {
    setActionBanner({ type, text });
    setTimeout(() => {
      setActionBanner((prev) => (prev?.text === text ? null : prev));
    }, 5500);
  };

  const handleClaimCheckIn = async () => {
    if (claimingCheckIn || !hub?.checkIn.canClaimToday) return;
    setClaimingCheckIn(true);
    try {
      const res = await api.claimDailyCheckIn(user.userId, true);
      if (res.hub) setHub(res.hub);
      if (res.user && onUpdateUser) onUpdateUser(res.user);
      sound8D.play8DChime(640, 'win');
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.5 } });
      showTimedBanner('success', res.message || `🎉 +${res.coinsEarned} Coins प्राप्त हुए!`);
    } catch (err: any) {
      showTimedBanner('error', err?.message || 'चेक-इन क्लेम करने में त्रुटि हुई');
    } finally {
      setClaimingCheckIn(false);
    }
  };

  const handleAnswerQuiz = async (idx: number) => {
    if (submittingQuiz || hub?.quiz.alreadyAnswered) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.answerDailyQuiz(user.userId, idx);
      if (res.hub) setHub(res.hub);
      if (res.user && onUpdateUser) onUpdateUser(res.user);
      setQuizFeedback({
        selectedIndex: idx,
        correctIndex: res.correctIndex,
        isCorrect: res.isCorrect,
        explanation: res.explanation,
        message: res.message,
      });
      if (res.isCorrect) {
        sound8D.play8DChime(660, 'win');
        confetti({ particleCount: 65, spread: 55, origin: { y: 0.6 } });
      } else {
        sound8D.play8DChime(400, 'click');
      }
      showTimedBanner('success', res.message);
    } catch (err: any) {
      showTimedBanner('error', err?.message || 'क्विज़ सबमिट नहीं हो सका');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleBuyBooster = async (boosterId: 'booster_2x_24h' | 'streak_shield') => {
    if (buyingBoosterId) return;
    setBuyingBoosterId(boosterId);
    try {
      const res = await api.buyCoinBooster(user.userId, boosterId);
      if (res.hub) setHub(res.hub);
      if (res.user && onUpdateUser) onUpdateUser(res.user);
      sound8D.play8DChime(600, 'win');
      confetti({ particleCount: 55, spread: 50, origin: { y: 0.7 } });
      showTimedBanner('success', res.message);
    } catch (err: any) {
      showTimedBanner('error', err?.message || 'कॉइन बूस्टर खरीदने में समस्या');
    } finally {
      setBuyingBoosterId(null);
    }
  };

  const coinBoosterActive = Boolean(
    hub?.freePlay.coinBoosterActive ||
      (user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now())
  );
  const streakShieldsCount = hub?.checkIn.streakShields ?? user.streakShields ?? 0;

  return (
    <div className="w-full min-h-screen bg-[#fcfdff] text-slate-800 pb-28 pt-2 px-3 sm:px-5 max-w-3xl mx-auto select-none font-sans relative">
      {/* 1. TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-0.5">
        <div className="flex items-center space-x-2.5">
          <div
            onClick={onOpenProfile || onOpenAvatarCustomizer}
            className="relative cursor-pointer transition transform hover:scale-105 shrink-0"
            title={user.username ? `@${user.username} — प्रोफाइल देखें व एडिट करें` : 'अपनी प्रोफाइल व यूनिक @Username सेट करें'}
          >
            <div
              className={`w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr ${frameItem.glowColor} shadow-md flex items-center justify-center`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt="My Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] shadow">
              {vipCfg ? vipCfg.icon : frameItem.icon}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={onOpenRecharge}
                className="flex items-center space-x-1.5 bg-white border border-slate-200/90 hover:border-amber-400 rounded-full px-2.5 py-1 shadow-xs transition cursor-pointer group shrink-0"
              >
                <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-[10px] text-amber-950 font-black">
                  🪙
                </span>
                <span className="font-black text-xs text-slate-800 tracking-tight tabular-nums">
                  {(user.coins ?? 0).toLocaleString()}
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black group-hover:rotate-90 transition">
                  +
                </span>
              </button>

              {coinBoosterActive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold whitespace-nowrap">
                  <Zap className="w-3 h-3 text-amber-600" />
                  2x LIVE
                </span>
              )}
              {streakShieldsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-extrabold whitespace-nowrap">
                  <Shield className="w-3 h-3 text-cyan-600" />
                  x{streakShieldsCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
              <span className="font-bold text-slate-800 truncate max-w-[130px]">{user.fullName}</span>
              {user.username && <span className="text-[#2874f0] font-bold">@{user.username}</span>}
              <span className="text-slate-400">· Lv.{user.gameLevel || 1}</span>
            </div>
          </div>
        </div>

        {/* Right Quick Triggers */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {onOpenDailyMissions && (
            <button
              type="button"
              onClick={onOpenDailyMissions}
              className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
              title="डेली मिशन"
            >
              <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs group-hover:bg-amber-100 transition">
                <Target className="w-4 h-4 text-[#fb641b]" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">Missions</span>
            </button>
          )}

          {onOpenDailySpin && (
            <button
              type="button"
              onClick={onOpenDailySpin}
              className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
              title="डेली लकी स्पिन"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shadow-xs group-hover:bg-purple-100 transition">
                <span className="text-sm">🎡</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">Spin</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenWeeklyRewards || onOpenTasks}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
            title="माइलस्टोन चेस्ट व टास्क"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-50 border border-cyan-200 flex items-center justify-center shadow-xs group-hover:bg-cyan-100 transition">
              <Star className="w-4 h-4 fill-cyan-500 text-cyan-500" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 mt-0.5">Tasks</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMeMenuModal(true)}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
            title="प्रोफाइल व मेन्यू (Earning Setup भी यहीं)"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-[#2874f0] transition">
              <Menu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-0.5">Menu</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {actionBanner && (
        <div
          className={`mt-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-fadeIn ${
            actionBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{actionBanner.text}</span>
          <button
            type="button"
            onClick={() => setActionBanner(null)}
            className="p-0.5 text-slate-500 hover:text-slate-800 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. 7-DAY ESCALATING DAILY CHECK-IN STREAK */}
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#1e1b4b] text-white p-4 shadow-md border border-slate-700/80">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h2 className="text-sm sm:text-base font-black tracking-tight">
                7-Day Coin Streak · Day {hub?.checkIn.nextDayNumber || ((user.loginStreak || 0) % 7) + 1}
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              रोज़ गेम ज़ोन में आएं — Day 7 पर सीधा <span className="text-amber-300 font-bold">+50 Coins Mega Chest!</span>
            </p>
          </div>

          <button
            type="button"
            disabled={claimingCheckIn || !hub?.checkIn.canClaimToday}
            onClick={handleClaimCheckIn}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shrink-0 whitespace-nowrap shadow-sm ${
              hub?.checkIn.canClaimToday
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950'
                : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 cursor-default'
            }`}
          >
            {claimingCheckIn
              ? 'क्लेम हो रहा है...'
              : hub?.checkIn.canClaimToday
              ? `🎁 Claim Day ${hub.checkIn.nextDayNumber} (+${
                  hub.checkIn.schedule.find((s) => s.isToday)?.coins || 5
                }🪙)`
              : '✅ आज का क्लेम पूरा'}
          </button>
        </div>

        {hub?.checkIn.streakAtRisk && hub.checkIn.canClaimToday && (
          <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            {streakShieldsCount > 0
              ? `आपकी ${hub.checkIn.currentStreak}-दिन की स्ट्रीक रिस्क पर है — क्लेम करने पर आपका 🛡️ Streak Shield इसे बचा लेगा!`
              : 'कल मिस हो गया था — आज फिर से Day 1 शुरू करें या भविष्य के लिए नीचे से Streak Shield (20🪙) अनलॉक करें!'}
          </div>
        )}

        <div className="grid grid-cols-7 gap-1.5">
          {(hub?.checkIn.schedule || []).map((slot) => (
            <div
              key={slot.day}
              className={`rounded-xl p-1.5 sm:p-2 text-center border transition ${
                slot.isToday
                  ? 'bg-amber-400/20 border-amber-400 text-white shadow-sm'
                  : slot.claimed
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <div className="text-[9px] font-bold uppercase opacity-80">D{slot.day}</div>
              <div className="text-xs sm:text-sm font-black mt-0.5 tabular-nums">
                {slot.day === 7 ? '🏆' : '🪙'}
                {slot.coins}
              </div>
              <div className="text-[9px] mt-0.5 font-semibold">
                {slot.claimed ? '✓' : slot.isToday ? 'TODAY' : `+${slot.xp}xp`}
              </div>
            </div>
          ))}
          {!hub && loadingHub && (
            <div className="col-span-7 text-center py-3 text-xs text-slate-400">
              डेली स्ट्रीक लोड हो रही है...
            </div>
          )}
        </div>
      </div>

      {/* 3. TODAY'S 2x SPOTLIGHT GAME & FREE-TO-EARN MATCH BANNER */}
      {hub && (
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-[#2874f0] via-[#1d4ed8] to-[#0284c7] text-white p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[#ffe500] text-[#212121] text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                🔥 आज का स्पॉटलाइट गेम
              </span>
              <span className="px-2 py-0.5 rounded bg-white/15 text-white text-[10px] font-bold whitespace-nowrap tabular-nums">
                🆓 Free Coin Rounds: {hub.freePlay.remaining}/{hub.freePlay.dailyLimit} बचे
              </span>
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl">{hub.spotlightGame.icon}</span>
              <div>
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  {hub.spotlightGame.hindiTitle} ({hub.spotlightGame.title})
                </h3>
                <p className="text-xs text-blue-100 font-semibold">
                  0 कॉइन्स में खेलें! आज इस गेम पर {hub.spotlightGame.bonusLabel} मिल रहा है।
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenGame(hub.spotlightGame.key as GameKey)}
            className="px-4 py-2.5 rounded-xl bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-black text-xs sm:text-sm shadow-md transition cursor-pointer shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>अभी फ्री खेलें</span>
          </button>
        </div>
      )}

      {/* 4. DAILY FRESH INFORMATION & TRIVIA QUIZ ("आज का नया ज्ञान व डेली क्विज़") */}
      {hub && (
        <div
          ref={discoverSectionRef}
          className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          {/* Left: Today's Fresh Knowledge Card */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2874f0] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                  <BookOpen className="w-3.5 h-3.5" />
                  {hub.intel.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{hub.today}</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#212121] leading-snug">
                {hub.intel.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                {hub.intel.fact}
              </p>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-950 font-semibold flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{hub.intel.proTip}</span>
            </div>
          </div>

          {/* Right: Daily Fresh Quiz (+10 Coins + 25 EXP) */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  आज का डेली क्विज़ · {hub.quiz.topic}
                </span>
                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md whitespace-nowrap tabular-nums">
                  +{coinBoosterActive ? hub.quiz.coinReward * 2 : hub.quiz.coinReward}🪙 · +{hub.quiz.xpReward} EXP
                </span>
              </div>

              <p className="text-xs sm:text-sm font-black text-[#212121] leading-snug">
                {hub.quiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-3">
                {hub.quiz.options.map((opt, idx) => {
                  const isAnswered = hub.quiz.alreadyAnswered || quizFeedback !== null;
                  const isCorrectOpt = quizFeedback?.correctIndex === idx;
                  const isWrongSelected =
                    quizFeedback && quizFeedback.selectedIndex === idx && !quizFeedback.isCorrect;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={submittingQuiz || isAnswered}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={`text-left px-2.5 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                        isCorrectOpt
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : isWrongSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-800'
                          : isAnswered
                          ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-default'
                          : 'bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-[#2874f0] text-[#212121]'
                      }`}
                    >
                      <span className="font-mono mr-1.5 text-[10px] opacity-60">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 text-[11px] font-semibold">
              {quizFeedback ? (
                <div
                  className={`p-2 rounded-lg border ${
                    quizFeedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  {quizFeedback.explanation}
                </div>
              ) : hub.quiz.alreadyAnswered ? (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>आज का क्विज़ पूरा हो चुका है — कल ठीक 12 बजे नया सवाल व नया ज्ञान मिलेगा!</span>
                </div>
              ) : (
                <div className="text-slate-500">
                  सही जवाब पर सीधा +{coinBoosterActive ? hub.quiz.coinReward * 2 : hub.quiz.coinReward} Coins! गलत जवाब पर भी +2 Coins प्रयास बोनस।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. THREE CIRCULAR ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-4 py-4 px-2 text-center">
        <button
          type="button"
          onClick={onOpenRanking}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-b from-[#b388ff] to-[#7c4dff] shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#9c27b0] via-[#7b1fa2] to-[#ba68c8] flex items-center justify-center text-white shadow-inner">
              <span className="text-2xl filter drop-shadow">🏆</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-2">Ranking</span>
        </button>

        <button
          type="button"
          onClick={onOpenTasks}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-b from-[#40c4ff] to-[#0091ea] shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0288d1] via-[#03a9f4] to-[#4fc3f7] flex items-center justify-center text-white shadow-inner relative">
              <span className="text-2xl filter drop-shadow">📋</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-2">Tasks (+5c)</span>
        </button>

        <button
          type="button"
          onClick={onOpenFriends}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-b from-[#ff5252] to-[#d50000] shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#c2185b] via-[#e91e63] to-[#ad1457] flex items-center justify-center text-white shadow-inner">
              <span className="text-2xl filter drop-shadow">👥</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-2">Friends</span>
        </button>
      </div>

      {/* 6. GAMES HEADER & QUICK PLAY */}
      <div className="space-y-2 mt-1 px-1">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Games</h2>
            <p className="text-[11px] text-slate-500 font-semibold">
              हर गेम में Free Skill Match से Coins जीतें · Pro Table से 2.5x बढ़ाएं
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenVoiceRoom}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-xs font-bold text-slate-700 hover:text-[#2874f0] transition cursor-pointer whitespace-nowrap"
          >
            <DoorOpen className="w-4 h-4" />
            <span>Voice Room</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 overflow-x-auto no-scrollbar py-0.5">
          <span className="shrink-0 font-medium">Quick Play :</span>
          <button
            onClick={() => onOpenGame('cards')}
            className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-lime-100 text-lime-800 font-bold hover:bg-lime-200 transition cursor-pointer"
          >
            <span>🃏</span>
            <span>Oh My Card</span>
          </button>
          <button
            onClick={() => onOpenGame('bingo')}
            className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 transition cursor-pointer"
          >
            <span>🎱</span>
            <span>Bingo</span>
          </button>
          <button
            onClick={() => onOpenGame('ludo')}
            className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold hover:bg-indigo-200 transition cursor-pointer"
          >
            <span>🎲</span>
            <span>Ludo 3D</span>
          </button>
          <button
            onClick={() => onOpenGame('hide_seek')}
            className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-bold hover:bg-cyan-200 transition cursor-pointer"
          >
            <span>👀</span>
            <span>Hide And Seek</span>
          </button>
        </div>
      </div>

      {/* 7. ORNATE GAME CARDS */}
      <div className="space-y-3 mt-3">
        <OrnateGameCard
          title="Who's the Spy"
          gradient="from-[#38bdf8] via-[#0ea5e9] to-[#0284c7]"
          isFullWidth={true}
          onClick={() => onOpenGame('spy')}
          characterImg={
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-4xl sm:text-5xl drop-shadow-md">
                🕵️‍♂️
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Trickster's Cafe"
            gradient="from-[#a34434] via-[#8c3525] to-[#6e2215]"
            onClick={() => onOpenGame('trickster')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🐊</div>}
          />
          <OrnateGameCard
            title="Hide And Seek"
            gradient="from-[#22d3ee] via-[#06b6d4] to-[#0891b2]"
            onClick={() => onOpenGame('hide_seek')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">👀</div>}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Space Werewolf"
            gradient="from-[#a855f7] via-[#9333ea] to-[#7e22ce]"
            onClick={() => onOpenGame('werewolf')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🐺</div>}
          />
          <OrnateGameCard
            title="Oh My Card"
            gradient="from-[#a3e635] via-[#84cc16] to-[#65a30d]"
            onClick={() => onOpenGame('cards')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🃏</div>}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Ludo"
            gradient="from-[#c084fc] via-[#a855f7] to-[#7c3aed]"
            onClick={() => onOpenGame('ludo')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🎲</div>}
          />
          <OrnateGameCard
            title="Guess My Drawing"
            gradient="from-[#4ade80] via-[#22c55e] to-[#16a34a]"
            onClick={() => onOpenGame('drawing')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">✏️</div>}
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Bingo"
            gradient="from-[#818cf8] via-[#6366f1] to-[#4f46e5]"
            onClick={() => onOpenGame('bingo')}
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🎱</div>}
          />
          <OrnateGameCard
            title="Mic Grab"
            gradient="from-[#f43f5e] via-[#e11d48] to-[#be123c]"
            onClick={() => onOpenGame('mic_grab')}
            extraBadge={
              <span className="text-[9px] bg-white/20 text-white font-mono px-1 rounded">
                LIVE STAGE
              </span>
            }
            characterImg={<div className="w-12 h-12 flex items-center justify-center text-3xl">🎙️</div>}
          />
        </div>
      </div>

      {/* 8. COIN POWER-UPS & UTILITY SHOP ("कॉइन्स क्यों ज़रूरी हैं?") */}
      <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-[#212121] flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Coin Power-Ups & Store (कॉइन्स का उपयोग)</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              जीते हुए Coins से 2x Booster, Streak Shield, VIP Crown, Room Wallpapers और Gift Cards अनलॉक करें!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRecharge}
            className="px-3 py-1.5 rounded-lg bg-[#fb641b] hover:bg-[#e8550f] text-white text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            + Buy Coins
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COIN_UTILITY_BOOSTERS.map((booster) => {
            const isBoosterActive = booster.id === 'booster_2x_24h' && coinBoosterActive;
            const canAfford = (user.coins || 0) >= booster.coinPrice;
            return (
              <div
                key={booster.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#212121]">
                      {booster.hindiName}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 whitespace-nowrap">
                      {booster.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {booster.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-black text-amber-700 tabular-nums">
                    🪙 {booster.coinPrice} Coins
                  </span>
                  <button
                    type="button"
                    disabled={buyingBoosterId === booster.id || isBoosterActive}
                    onClick={() => handleBuyBooster(booster.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer whitespace-nowrap ${
                      isBoosterActive
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : canAfford
                        ? 'bg-[#2874f0] hover:bg-[#1c62d6] text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    {buyingBoosterId === booster.id
                      ? 'प्रोसेस...'
                      : isBoosterActive
                      ? '⚡ अभी सक्रिय'
                      : booster.id === 'streak_shield' && streakShieldsCount > 0
                      ? `Buy Another (पास: ${streakShieldsCount})`
                      : canAfford
                      ? 'Activate Now'
                      : `Need ${booster.coinPrice}🪙`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Utility Quick Access Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenDailySpin || onOpenTasks}
            className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition cursor-pointer"
          >
            <div className="text-base">🎡</div>
            <div className="text-xs font-black text-purple-950 mt-0.5">Lucky Spin</div>
            <div className="text-[10px] font-semibold text-purple-700">50🪙 → Up to 500🪙</div>
          </button>

          <button
            type="button"
            onClick={onOpenAvatarCustomizer || onOpenProfile}
            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition cursor-pointer"
          >
            <div className="text-base">👑</div>
            <div className="text-xs font-black text-amber-950 mt-0.5">VIP & Frames</div>
            <div className="text-[10px] font-semibold text-amber-800">2x EXP + रॉयल फ्रेम</div>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceRoom}
            className="p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition cursor-pointer"
          >
            <div className="text-base">🖼️</div>
            <div className="text-xs font-black text-sky-950 mt-0.5">Room Themes</div>
            <div className="text-[10px] font-semibold text-sky-800">वॉइस रूम व स्टेज गिफ्ट</div>
          </button>

          <button
            type="button"
            onClick={onOpenGiftCards || onOpenRecharge}
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition cursor-pointer"
          >
            <div className="text-base">🎁</div>
            <div className="text-xs font-black text-emerald-950 mt-0.5">Gift Vouchers</div>
            <div className="text-[10px] font-semibold text-emerald-800">Amazon · Play वाउचर</div>
          </button>
        </div>
      </div>

      {/* 9. LIVE TOP DAILY PLAYERS LEADERBOARD */}
      {hub && hub.topDailyPlayers.length > 0 && (
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black text-[#212121] flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Top Active Gamers (रियल खिलाड़ी)</span>
            </h3>
            <button
              type="button"
              onClick={onOpenRanking}
              className="text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Ranking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {hub.topDailyPlayers.map((player, index) => (
              <div
                key={player.userId}
                onClick={onOpenRanking}
                className="py-2 flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg px-1.5 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      index === 0
                        ? 'bg-amber-400 text-amber-950'
                        : index === 1
                        ? 'bg-slate-200 text-slate-800'
                        : index === 2
                        ? 'bg-orange-200 text-orange-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <img
                    src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.userId}`}
                    alt={player.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#212121] truncate">{player.fullName}</div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {player.username ? `@${player.username}` : player.userId} · Lv.{player.gameLevel}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-amber-700 tabular-nums">
                    🪙 {player.coins.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500 tabular-nums">
                    {player.totalGamesWon} Wins
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-4 shadow-2xl flex items-center justify-around max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center cursor-pointer text-[#2874f0] font-black transition"
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-black mt-0.5">Games</span>
        </button>

        <button
          type="button"
          onClick={onOpenVoiceRoom}
          className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-slate-900 transition"
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Voice Room</span>
        </button>

        <button
          type="button"
          onClick={onOpenChats || onOpenFriends}
          className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-slate-900 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Chats</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (discoverSectionRef.current) {
              discoverSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              (onOpenWeeklyRewards || onOpenRanking)();
            }
          }}
          className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-slate-900 transition"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Daily Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMeMenuModal(true)}
          className="flex flex-col items-center cursor-pointer text-slate-500 hover:text-[#2874f0] transition"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Me / Menu</span>
        </button>
      </div>

      {/* 11. GAMER "ME & MENU" MODAL (Includes clean optional Earning Setup Menu Links) */}
      {showMeMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-slate-900 to-[#1e3a8a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt={user.fullName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <div className="font-black text-sm">{user.fullName}</div>
                  <div className="text-[11px] text-blue-200 font-semibold">
                    {user.username ? `@${user.username} · ` : ''}
                    {user.userId}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMeMenuModal(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Quick Player Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-800">Coins</div>
                  <div className="text-sm font-black text-amber-950 tabular-nums">
                    🪙 {(user.coins || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] font-bold text-blue-800">Level / EXP</div>
                  <div className="text-sm font-black text-blue-950 tabular-nums">
                    Lv.{user.gameLevel || 1} ({user.gameXp || 0})
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="text-[10px] font-bold text-rose-800">Room ID</div>
                  <div className="text-xs font-black text-rose-950 truncate">
                    {user.roomAddress || user.personalRoomId || 'Auto'}
                  </div>
                </div>
              </div>

              {/* Game Setup Actions */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  Game Setup & Profile
                </div>

                {onOpenProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenProfile();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-4 h-4 text-[#2874f0]" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">My Profile, @Username & Cover Crop</div>
                        <div className="text-[10px] text-slate-500">फोटो क्रॉप, यूनिक यूज़रनेम व फ्रेंड्स देखें</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenAvatarCustomizer && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenAvatarCustomizer();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">Avatar Frames & VIP Pass</div>
                        <div className="text-[10px] text-slate-500">फ्रेम, VIP बैज और 2x EXP बूस्ट अनलॉक करें</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMeMenuModal(false);
                    onOpenRecharge();
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#388e3c]" />
                    <div>
                      <div className="text-xs font-black text-[#212121]">Buy Coins (UPI + Screenshot)</div>
                      <div className="text-[10px] text-slate-500">यूपीआई पेमेंट व स्क्रीनशॉट से तुरंत कॉइन रिक्वेस्ट</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {onOpenGiftCards && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenGiftCards();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">Digital Gift Card Vouchers</div>
                        <div className="text-[10px] text-slate-500">Coins से Amazon, Flipkart व Google Play वाउचर पाएं</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenClans && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenClans();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">Clans & Guild Rankings</div>
                        <div className="text-[10px] text-slate-500">क्लैन जॉइन करें व टीम रैंकिंग में ऊपर आएं</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Earning Setup Optional Menu Section */}
              {(onOpenEarningSetup || onOpenServicesSetup) && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 px-1">
                    💼 Earning Setup (Optional Menu)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {onOpenEarningSetup && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMeMenuModal(false);
                          onOpenEarningSetup();
                        }}
                        className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left cursor-pointer transition"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-700 mb-1" />
                        <div className="text-xs font-black text-emerald-950">Earning Dashboard</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">SWI · NWI · रेफरल</div>
                      </button>
                    )}

                    {onOpenServicesSetup && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMeMenuModal(false);
                          onOpenServicesSetup();
                        }}
                        className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left cursor-pointer transition"
                      >
                        <Layers className="w-4 h-4 text-[#2874f0] mb-1" />
                        <div className="text-xs font-black text-blue-950">10 Earning Plans</div>
                        <div className="text-[10px] text-blue-700 font-semibold">EMO · MMO · NWI</div>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
