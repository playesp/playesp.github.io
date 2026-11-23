import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DoorOpen,
  Star,
  Sparkles,
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
  ChevronRight,
  BookOpen,
  Lightbulb,
  Heart,
  Home,
  LogOut,
  ShieldAlert,
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
  onOpenRelationships?: () => void;
  onOpenFamily?: () => void;
  onOpenMyHome?: () => void;
  onOpenEvents?: () => void;
  onOpenGiftWall?: () => void;
  onLogout?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

const GameGridCard: React.FC<{
  title: string;
  gradient: string;
  onClick: () => void;
  characterVisual: React.ReactNode;
  isFullWidth?: boolean;
  cornerTag?: string;
  cornerTagClass?: string;
  subLabel?: string;
}> = ({
  title,
  gradient,
  onClick,
  characterVisual,
  isFullWidth = false,
  cornerTag,
  cornerTagClass = 'bg-[#ffe500] text-[#212121]',
  subLabel,
}) => {
  return (
    <button
      type="button"
      onClick={() => {
        sound8D.play8DChime(520, 'click');
        onClick();
      }}
      className={`relative w-full rounded-2xl bg-gradient-to-r ${gradient} shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 overflow-hidden flex items-center justify-between text-left cursor-pointer group ${
        isFullWidth
          ? 'h-[82px] min-[380px]:h-[92px] sm:h-[106px] px-4 sm:px-5'
          : 'h-[78px] min-[380px]:h-[86px] sm:h-[96px] px-2.5 min-[380px]:px-3.5'
      }`}
    >
      {/* Top glossy sheen */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-white/12 pointer-events-none" />

      {/* Optional top-left corner tag (Popular / New) */}
      {cornerTag && (
        <span
          className={`absolute top-0 left-0 px-2 sm:px-2.5 py-0.5 rounded-br-xl text-[9px] min-[380px]:text-[10px] font-black tracking-wide shadow-xs z-20 whitespace-nowrap ${cornerTagClass}`}
        >
          {cornerTag}
        </span>
      )}

      <div className={`relative z-10 min-w-0 max-w-[68%] pr-1 ${cornerTag ? 'pt-2.5' : ''}`}>
        <h3
          className={`font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] leading-tight ${
            isFullWidth
              ? 'text-[clamp(1.05rem,3.6vw,1.35rem)]'
              : 'text-[clamp(0.8125rem,2.9vw,1.02rem)]'
          }`}
        >
          {title}
        </h3>
        {subLabel && (
          <div className="mt-1 inline-block px-1.5 sm:px-2 py-0.5 rounded bg-black/25 text-[9.5px] sm:text-[10px] font-bold text-white/95 tabular-nums whitespace-nowrap">
            {subLabel}
          </div>
        )}
      </div>

      <div className="relative z-10 shrink-0 transform scale-90 min-[380px]:scale-100 group-hover:scale-110 transition duration-200">
        {characterVisual}
      </div>
    </button>
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
  onOpenGiftCards,
  onOpenEarningSetup,
  onOpenServicesSetup,
  onOpenClans,
  onOpenRelationships,
  onOpenFamily,
  onOpenMyHome,
  onOpenEvents,
  onOpenGiftWall,
  onLogout,
  isAdmin,
  onOpenAdmin,
}) => {
  const frameItem = getFrameByVariant(user.frameType || 'standard');
  const vipCfg = getVipConfig(user.vipTier);

  const [hub, setHub] = useState<DailyGameHubData | null>(null);
  const [hasPendingTasks, setHasPendingTasks] = useState(false);
  const [showMeMenuModal, setShowMeMenuModal] = useState(false);
  const [showDailyIntelModal, setShowDailyIntelModal] = useState(false);
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

  const loadDailyState = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const [hubData, tasksData] = await Promise.all([
        api.getDailyGameHub(user.userId).catch(() => null),
        api.getTasksStatus(user.userId).catch(() => null),
      ]);
      if (hubData) setHub(hubData);
      const canClaimCheckIn = Boolean(hubData?.checkIn?.canClaimToday);
      const claimableTask = Boolean(
        tasksData?.tasks?.some((t: any) => t.isCompleted && !t.isClaimed)
      );
      setHasPendingTasks(canClaimCheckIn || claimableTask);
    } catch {
      // keep silent
    }
  }, [user?.userId]);

  useEffect(() => {
    loadDailyState();
  }, [loadDailyState, user.coins, user.totalGamesPlayed, user.lastDailyCheckInDate, user.dailyQuizDate]);

  useEffect(() => {
    const handleOpenMe = () => setShowMeMenuModal(true);
    window.addEventListener('esp-open-me-menu', handleOpenMe);
    return () => window.removeEventListener('esp-open-me-menu', handleOpenMe);
  }, []);

  const showTimedBanner = (type: 'success' | 'error', text: string) => {
    setActionBanner({ type, text });
    setTimeout(() => {
      setActionBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
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
        confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
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
    <div className="w-full min-h-screen bg-gradient-to-b from-[#eff7ff] via-[#f8fbff] to-[#ffffff] text-slate-900 pb-28 pt-2 px-2.5 min-[380px]:px-3.5 sm:px-5 max-w-2xl lg:max-w-3xl mx-auto select-none font-sans relative">
      {/* 1. EXACT SCREENSHOT HEADER ROW: Avatar + Coin Pill on Left | Bonds & Events on Right */}
      <div className="flex items-center justify-between gap-2 py-2">
        <div className="flex items-center gap-2 min-[380px]:gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenProfile || onOpenAvatarCustomizer}
            className="relative cursor-pointer transition hover:scale-105 shrink-0"
            title={user.username ? `@${user.username}` : user.fullName}
          >
            <div
              className={`w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-12 sm:h-12 rounded-full p-[2px] bg-gradient-to-tr ${frameItem.glowColor} shadow-sm flex items-center justify-center`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white border border-white">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {vipCfg && (
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[9px] shadow">
                {vipCfg.icon}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenRecharge}
            className="flex items-center space-x-1.5 bg-white border border-slate-200 hover:border-amber-400 rounded-full px-2.5 min-[380px]:px-3 py-1 sm:py-1.5 shadow-xs transition cursor-pointer group shrink-0"
          >
            <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-[10px]">
              🪙
            </span>
            <span className="font-black text-xs sm:text-sm text-slate-900 tabular-nums">
              {(user.coins ?? 0).toLocaleString()}
            </span>
            <span className="text-amber-500 font-black text-sm leading-none group-hover:scale-125 transition">
              +
            </span>
          </button>
        </div>

        {/* Right 2 Quick Icons: Bonds + Events */}
        <div className="flex items-center gap-3 min-[380px]:gap-4 pr-0.5 shrink-0">
          <button
            type="button"
            onClick={onOpenRelationships || onOpenFamily || onOpenMyHome}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105 relative"
            title="Bonds & ESP Family"
          >
            <div className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-100 to-indigo-100 border border-indigo-200 flex items-center justify-center shadow-xs text-base min-[380px]:text-lg">
              💞
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5 whitespace-nowrap">Bonds</span>
          </button>

          <button
            type="button"
            onClick={onOpenEvents || onOpenWeeklyRewards}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105"
            title="ESP Events Center"
          >
            <div className="w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
              <Star className="w-4 h-4 min-[380px]:w-5 min-[380px]:h-5 fill-emerald-500 text-emerald-500" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 mt-0.5 whitespace-nowrap">Events</span>
          </button>
        </div>
      </div>

      {/* 2. EXACT 3 CIRCULAR QUICK BUTTONS: Ranking | Tasks | Friends */}
      <div className="grid grid-cols-3 gap-2 min-[380px]:gap-4 py-2.5 sm:py-3 px-2 min-[380px]:px-4 text-center">
        <button
          type="button"
          onClick={onOpenRanking}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black border-2 border-amber-400 shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <span className="text-xl min-[380px]:text-2xl">🏆</span>
            <span className="absolute -top-1.5 -left-1 text-xs min-[380px]:text-sm">👑</span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1.5 whitespace-nowrap">Ranking</span>
        </button>

        <button
          type="button"
          onClick={onOpenTasks}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-purple-600 border-2 border-white shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <span className="text-xl min-[380px]:text-2xl">🎟️</span>
            {hasPendingTasks && (
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
            )}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1.5 whitespace-nowrap">Tasks</span>
        </button>

        <button
          type="button"
          onClick={onOpenFriends}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-orange-400 via-amber-400 to-orange-500 border-2 border-white shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <span className="text-xl min-[380px]:text-2xl">🧑‍🤝‍🧑</span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 mt-1.5 whitespace-nowrap">Friends</span>
        </button>
      </div>

      {/* 3. GAMES SECTION HEADER: "Games" + "Game Rooms" */}
      <div className="flex items-center justify-between pt-2 pb-2.5 px-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Games</h2>
        <button
          type="button"
          onClick={onOpenVoiceRoom}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#2874f0] text-[11px] sm:text-xs font-bold text-slate-700 hover:text-[#2874f0] shadow-xs transition cursor-pointer whitespace-nowrap min-h-[34px]"
        >
          <DoorOpen className="w-4 h-4" />
          <span>Game Rooms</span>
        </button>
      </div>

      {/* 4. SYMMETRICALLY LINED-UP GAMES GRID (EXACT SCREENSHOT LAYOUT) */}
      <div className="space-y-2.5">
        {/* Full Width 1: Who's the Spy */}
        <GameGridCard
          title="Who's the Spy"
          gradient="from-[#2563eb] via-[#1d4ed8] to-[#0284c7]"
          isFullWidth={true}
          onClick={() => onOpenGame('spy')}
          characterVisual={<div className="text-5xl sm:text-6xl drop-shadow-md">🕵️‍♂️</div>}
        />

        {/* Full Width 2: Liar's Party */}
        <GameGridCard
          title="Liar's Party"
          gradient="from-[#6d281d] via-[#531c13] to-[#36110b]"
          isFullWidth={true}
          onClick={() => onOpenGame('liars_party')}
          characterVisual={<div className="text-5xl sm:text-6xl drop-shadow-md">🎭</div>}
        />

        {/* 2-Col Row 1: Crazy Alpaca (Popular) | Space Werewolf */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Crazy Alpaca"
            gradient="from-[#a3e635] via-[#84cc16] to-[#65a30d]"
            cornerTag="🔥 Popular"
            onClick={() => onOpenGame('crazy_alpaca')}
            characterVisual={<div className="text-4xl drop-shadow">🦙</div>}
          />
          <GameGridCard
            title="Space Werewolf"
            gradient="from-[#60a5fa] via-[#3b82f6] to-[#2563eb]"
            onClick={() => onOpenGame('werewolf')}
            characterVisual={<div className="text-4xl drop-shadow">🐺</div>}
          />
        </div>

        {/* 2-Col Row 2: Bingo (New) | Mic Grab */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Bingo"
            gradient="from-[#818cf8] via-[#6366f1] to-[#4f46e5]"
            cornerTag="New"
            cornerTagClass="bg-amber-300 text-slate-900"
            onClick={() => onOpenGame('bingo')}
            characterVisual={<div className="text-4xl drop-shadow">🎱</div>}
          />
          <GameGridCard
            title="Mic Grab"
            gradient="from-[#f472b6] via-[#ec4899] to-[#db2777]"
            subLabel="Live Stage"
            onClick={() => onOpenGame('mic_grab')}
            characterVisual={<div className="text-4xl drop-shadow">🎙️</div>}
          />
        </div>

        {/* 2-Col Row 3: Pool | Spin */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Pool"
            gradient="from-[#785546] via-[#5d4037] to-[#4e342e]"
            onClick={() => onOpenGame('pool')}
            characterVisual={<div className="text-4xl drop-shadow">🎱</div>}
          />
          <GameGridCard
            title="Spin"
            gradient="from-[#8b5cf6] via-[#7c3aed] to-[#5b21b6]"
            onClick={() => onOpenGame('spin')}
            characterVisual={<div className="text-4xl drop-shadow">🎡</div>}
          />
        </div>

        {/* 2-Col Row 4: Ludo 3D | Oh My Card */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Ludo 3D"
            gradient="from-[#a855f7] via-[#9333ea] to-[#7e22ce]"
            onClick={() => onOpenGame('ludo')}
            characterVisual={<div className="text-4xl drop-shadow">🎲</div>}
          />
          <GameGridCard
            title="Oh My Card"
            gradient="from-[#4ade80] via-[#22c55e] to-[#16a34a]"
            onClick={() => onOpenGame('cards')}
            characterVisual={<div className="text-4xl drop-shadow">🃏</div>}
          />
        </div>

        {/* 2-Col Row 5: Snake Rush | Guess Drawing */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Snake Rush"
            gradient="from-[#34d399] via-[#10b981] to-[#059669]"
            onClick={() => onOpenGame('snake')}
            characterVisual={<div className="text-4xl drop-shadow">🐍</div>}
          />
          <GameGridCard
            title="Guess Drawing"
            gradient="from-[#22d3ee] via-[#06b6d4] to-[#0891b2]"
            onClick={() => onOpenGame('drawing')}
            characterVisual={<div className="text-4xl drop-shadow">✏️</div>}
          />
        </div>

        {/* 2-Col Row 6: Hide And Seek | Trickster's Cafe */}
        <div className="grid grid-cols-2 gap-2.5">
          <GameGridCard
            title="Hide & Seek"
            gradient="from-[#38bdf8] via-[#0ea5e9] to-[#0369a1]"
            onClick={() => onOpenGame('hide_seek')}
            characterVisual={<div className="text-4xl drop-shadow">👀</div>}
          />
          <GameGridCard
            title="Trickster's Cafe"
            gradient="from-[#b91c1c] via-[#991b1b] to-[#7f1d1d]"
            onClick={() => onOpenGame('trickster')}
            characterVisual={<div className="text-4xl drop-shadow">🐊</div>}
          />
        </div>
      </div>

      {/* Bottom navigation is provided globally by LockedFooterNav so footer stays locked across every page */}

      {/* 6. "ME" DRAWER MODAL (All Profile, VIP, Gift Wall, Daily Quiz, Coin Boosters, Optional Earning Setup & Logout) */}
      {showMeMenuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90dvh] flex flex-col">
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

            <div className="p-4 space-y-3.5 overflow-y-auto">
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

              {/* Weekly Reward Claims (Day 1–7 Live API Time) Trigger */}
              <button
                type="button"
                onClick={() => {
                  setShowMeMenuModal(false);
                  (onOpenWeeklyRewards || onOpenTasks)();
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-300 flex items-center justify-between text-left cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <Gift className="w-4 h-4 text-[#fb641b]" />
                  <div>
                    <div className="text-xs font-black text-[#212121] flex items-center gap-1.5">
                      <span>Weekly Reward Claims (Day 1–7)</span>
                      {hub?.checkIn?.canClaimToday && (
                        <span className="px-1.5 py-0.5 rounded bg-[#fb641b] text-white text-[9px] font-black animate-pulse">
                          CLAIM DAY {hub.checkIn.nextDayNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-600">
                      Live Server IST Time · {hub?.timeMeta?.istTimeLabel || '12:00 AM Reset'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600" />
              </button>

              {/* Daily Fresh Knowledge & Coin Power-Ups Trigger */}
              <button
                type="button"
                onClick={() => {
                  setShowMeMenuModal(false);
                  setShowDailyIntelModal(true);
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-amber-50 hover:from-indigo-100 hover:to-amber-100 border border-indigo-200 flex items-center justify-between text-left cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#2874f0]" />
                  <div>
                    <div className="text-xs font-black text-[#212121]">Daily Fresh Knowledge, Quiz (+10🪙) &amp; Boosters</div>
                    <div className="text-[10px] text-slate-600">हर दिन नया ज्ञान, डेली क्विज़ और 2x Coin Boosters</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Game Setup Actions */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1">
                  Account, Rooms &amp; Social
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
                        <div className="text-xs font-black text-[#212121]">My Profile, @Username &amp; Cover Crop</div>
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
                        <div className="text-xs font-black text-[#212121]">Avatar Frames &amp; VIP Pass</div>
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
                      <div className="text-xs font-black text-[#212121]">Buy Coins (UTR + Screenshot)</div>
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
                        <div className="text-[10px] text-slate-500">Coins से Amazon, Flipkart व Play वाउचर पाएं</div>
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
                        <div className="text-xs font-black text-[#212121]">Clans &amp; Guild Rankings</div>
                        <div className="text-[10px] text-slate-500">क्लैन जॉइन करें व टीम रैंकिंग में ऊपर आएं</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenRelationships && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenRelationships();
                    }}
                    className="w-full p-3 rounded-xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-rose-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">Relationship &amp; CP Tags (199c–1299c)</div>
                        <div className="text-[10px] text-slate-500">Bestie, Bro, Sis, Mentor, Soulmate &amp; CP टोकन</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenFamily && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenFamily();
                    }}
                    className="w-full p-3 rounded-xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">ESP Family Hub (Coins, Chat &amp; Gifts)</div>
                        <div className="text-[10px] text-slate-500">फैमिली बनाएं, जॉइन करें व लाइव चैट में गिफ्ट भेजें</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenMyHome && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenMyHome();
                    }}
                    className="w-full p-3 rounded-xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Home className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">My Home &amp; Events Center</div>
                        <div className="text-[10px] text-slate-500">प्रोफाइल शोकेस, बॉन्ड्स, इवेंट माइलस्टोन</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {onOpenGiftWall && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeMenuModal(false);
                      onOpenGiftWall();
                    }}
                    className="w-full p-3 rounded-xl bg-cyan-50/70 hover:bg-cyan-100 border border-cyan-200 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <div>
                        <div className="text-xs font-black text-[#212121]">Gift Wall &amp; Full Gift History</div>
                        <div className="text-[10px] text-slate-500">भेजे और मिले सभी लग्ज़री गिफ्ट्स का पूरा रिकॉर्ड</div>
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

              {/* Admin Panel & Logout */}
              {(isAdmin || onLogout) && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  {isAdmin && onOpenAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMeMenuModal(false);
                        onOpenAdmin();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-[#ffe500] hover:bg-yellow-300 text-slate-900 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMeMenuModal(false);
                        onLogout();
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. DAILY FRESH KNOWLEDGE, QUIZ & COIN BOOSTERS MODAL (Accessible cleanly from Me Menu) */}
      {showDailyIntelModal && hub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90dvh] flex flex-col">
            <div className="bg-gradient-to-r from-[#2874f0] to-[#1e40af] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black">आज का नया ज्ञान, क्विज़ &amp; Coin Boosters</h3>
                <p className="text-[11px] text-blue-100">रात 12:00 बजे (IST) हर दिन नया ज्ञान व सवाल अपडेट होता है</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDailyIntelModal(false)}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              {actionBanner && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-bold ${
                    actionBanner.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {actionBanner.text}
                </div>
              )}

              {/* Daily Intel Card */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-[#2874f0]">{hub.intel.category}</span>
                  <span className="text-slate-400 font-bold tabular-nums">{hub.today}</span>
                </div>
                <h4 className="text-sm font-black text-[#212121]">{hub.intel.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{hub.intel.fact}</p>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-semibold flex items-start gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{hub.intel.proTip}</span>
                </div>
              </div>

              {/* Daily Quiz */}
              <div className="rounded-xl bg-white border border-slate-200 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-800">✨ डेली क्विज़ · {hub.quiz.topic}</span>
                  <span className="text-[11px] font-black text-emerald-700 tabular-nums">
                    +{coinBoosterActive ? hub.quiz.coinReward * 2 : hub.quiz.coinReward}🪙
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-black text-[#212121]">{hub.quiz.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {hub.quiz.options.map((opt, idx) => {
                    const isAnswered = hub.quiz.alreadyAnswered || quizFeedback !== null;
                    const isCorrectOpt = quizFeedback?.correctIndex === idx;
                    const isWrong = quizFeedback && quizFeedback.selectedIndex === idx && !quizFeedback.isCorrect;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={submittingQuiz || isAnswered}
                        onClick={() => handleAnswerQuiz(idx)}
                        className={`text-left px-3 py-2 rounded-lg border text-xs font-bold cursor-pointer ${
                          isCorrectOpt
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                            : isWrong
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : isAnswered
                            ? 'bg-slate-50 border-slate-200 text-slate-400'
                            : 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-[#212121]'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </button>
                    );
                  })}
                </div>
                {(quizFeedback || hub.quiz.alreadyAnswered) && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{quizFeedback?.explanation || 'आज का क्विज़ पूरा हो चुका है!'}</span>
                  </div>
                )}
              </div>

              {/* Coin Utility Boosters */}
              <div className="space-y-2">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Coin Power-Ups</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COIN_UTILITY_BOOSTERS.map((booster) => {
                    const isBoosterActive = booster.id === 'booster_2x_24h' && coinBoosterActive;
                    const canAfford = (user.coins || 0) >= booster.coinPrice;
                    return (
                      <div key={booster.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <div className="text-xs font-black text-slate-900">{booster.hindiName}</div>
                        <p className="text-[11px] text-slate-600">{booster.description}</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-amber-700">🪙 {booster.coinPrice}</span>
                          <button
                            type="button"
                            disabled={buyingBoosterId === booster.id || isBoosterActive}
                            onClick={() => handleBuyBooster(booster.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-black cursor-pointer ${
                              isBoosterActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : canAfford
                                ? 'bg-[#2874f0] text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isBoosterActive
                              ? '⚡ Active'
                              : booster.id === 'streak_shield' && streakShieldsCount > 0
                              ? `x${streakShieldsCount} Owned (+Buy)`
                              : 'Activate'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
