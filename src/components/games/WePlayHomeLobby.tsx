import React, { useState } from 'react';
import { 
  Trophy, 
  ClipboardList, 
  Users, 
  DoorOpen, 
  Star, 
  Gamepad2, 
  Radio, 
  MessageCircle, 
  Compass, 
  User, 
  Plus,
  Flame,
  Award
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { sound8D } from '../../services/sound8d.ts';
import type { GameKey } from './InteractiveGameArenaModal.tsx';

interface WePlayHomeLobbyProps {
  user: UserProfile;
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
  onOpenClans?: () => void;
}

// Ornate notched golden bracket ribbon frame for the game buttons matching user's screenshot
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
      {/* Golden Metallic Border Frame with Notched Edges */}
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-r from-[#ffd700] via-[#ffe066] to-[#d4af37] p-[2.5px] shadow-sm">
        {/* Inner Colorful Gradient Surface */}
        <div className={`w-full h-full rounded-[20px] bg-gradient-to-r ${gradient} flex items-center justify-between px-4 sm:px-5 relative overflow-hidden`}>
          
          {/* Subtle 3D glossy highlight at top */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/15 rounded-t-[20px] pointer-events-none" />

          {/* Left Decorative Ornamental Bracket */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-full bg-[#ffd700]/70" />

          {/* Title & Badge */}
          <div className="relative z-10 space-y-0.5 max-w-[65%]">
            <h3 className={`font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide font-sans ${
              isFullWidth ? 'text-lg sm:text-2xl' : 'text-sm sm:text-base'
            }`}>
              {title}
            </h3>
            {extraBadge}
          </div>

          {/* Right: 3D Character Illustration (peeking out) */}
          <div className="relative z-10 shrink-0 transform group-hover:scale-110 transition duration-300">
            {characterImg}
          </div>

        </div>
      </div>

      {/* Golden Corner Accents */}
      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ffd700] border border-white shadow-2xs pointer-events-none" />
    </div>
  );
};

export const WePlayHomeLobby: React.FC<WePlayHomeLobbyProps> = ({
  user,
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
}) => {
  return (
    <div className="w-full min-h-screen bg-[#fcfdff] text-slate-800 pb-28 pt-2 px-3 sm:px-4 max-w-md mx-auto select-none font-sans relative">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER (PROFILE AVATAR WITH FIRE RING, COINS, ROAR)     */}
      {/* ============================================================== */}
      <div className="flex items-center justify-between py-1.5 px-0.5">
        
        {/* Left: Fiery Avatar Ring & Coin Capsule */}
        <div className="flex items-center space-x-2.5">
          {/* Avatar with Burning Golden/Red Flame Ring */}
          <div
            onClick={onOpenAvatarCustomizer || onOpenProfile}
            className="relative cursor-pointer transition transform hover:scale-105"
            title="प्रोफाइल फोटो बदलें / कस्टमाइज़ करें"
          >
            {/* Fiery Frame Ring */}
            <div className="w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-amber-300">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt="My Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Flame Icon Badge */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 flex items-center justify-center text-[10px] text-white shadow">
              🔥
            </span>
          </div>

          {/* Golden Coin Capsule: 🪙 4 + */}
          <button
            type="button"
            onClick={onOpenRecharge}
            className="flex items-center space-x-1.5 bg-white border border-slate-200/90 hover:border-amber-400 rounded-full px-2.5 py-1 shadow-xs transition cursor-pointer group"
          >
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-[10px] text-amber-950 font-black shadow-2xs">
              🪙
            </div>
            <span className="font-black text-xs text-slate-800 font-sans tracking-tight">
              {(user.coins ?? 4).toLocaleString()}
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] font-black group-hover:rotate-90 transition">
              +
            </span>
          </button>
        </div>

        {/* Right: Roar & Events Star */}
        <div className="flex items-center space-x-3.5">
          {/* Roar Trophy Icon */}
          <button
            type="button"
            onClick={onOpenWeeklyRewards || onOpenTasks}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
            title="वीकली रिवॉर्ड्स"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-50 border border-purple-200 flex items-center justify-center shadow-xs group-hover:bg-purple-200 transition">
              <span className="text-sm">👑</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-0.5">Roar</span>
          </button>

          {/* Events Star Icon */}
          <button
            type="button"
            onClick={onOpenTasks}
            className="flex flex-col items-center cursor-pointer transition hover:scale-105 group"
            title="इवेंट्स व टास्क"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-100 to-sky-50 border border-cyan-200 flex items-center justify-center shadow-xs group-hover:bg-cyan-200 transition">
              <Star className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-0.5">Events</span>
          </button>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. THREE CIRCULAR ACTION BUTTONS (RANKING, TASKS, FRIENDS)     */}
      {/* ============================================================== */}
      <div className="grid grid-cols-3 gap-4 py-4 px-2 text-center">
        
        {/* 1. Ranking */}
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

        {/* 2. Tasks with Red Dot */}
        <button
          type="button"
          onClick={onOpenTasks}
          className="flex flex-col items-center cursor-pointer group transition"
        >
          <div className="relative w-16 h-16 rounded-full p-1 bg-gradient-to-b from-[#40c4ff] to-[#0091ea] shadow-md group-hover:scale-105 transition flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#0288d1] via-[#03a9f4] to-[#4fc3f7] flex items-center justify-center text-white shadow-inner relative">
              <span className="text-2xl filter drop-shadow">📋</span>
              <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white shadow" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 mt-2">Tasks</span>
        </button>

        {/* 3. Friends (Nightclub/Red Glow circle) */}
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

      {/* ============================================================== */}
      {/* 3. GAMES HEADER & RECENTLY PLAYED                              */}
      {/* ============================================================== */}
      <div className="space-y-2 mt-1 px-1">
        
        {/* Games Title & Game Room Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
            Games
          </h2>
          <button
            type="button"
            onClick={onOpenVoiceRoom}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-cyan-600 transition cursor-pointer"
          >
            <DoorOpen className="w-4 h-4 text-slate-700" />
            <span>Game Room</span>
          </button>
        </div>

        {/* Recently played bar */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 overflow-x-auto no-scrollbar py-0.5">
          <span className="shrink-0 font-medium">Recently played :</span>
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
            onClick={() => onOpenGame('hide_seek')}
            className="shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 font-bold hover:bg-cyan-200 transition cursor-pointer"
          >
            <span>👀</span>
            <span>Hide And Seek</span>
          </button>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. MAIN ORNATE GAME CARDS (EXACT MATCHING SCREENSHOT)          */}
      {/* ============================================================== */}
      <div className="space-y-3 mt-3">
        
        {/* 1. TOP FULL-WIDTH BANNER: WHO'S THE SPY (Sky Blue + Detective) */}
        <OrnateGameCard
          title="Who's the Spy"
          gradient="from-[#38bdf8] via-[#0ea5e9] to-[#0284c7]"
          isFullWidth={true}
          onClick={() => onOpenGame('spy')}
          characterImg={
            <div className="relative flex items-center justify-center">
              {/* 3D Detective Character in Fedora Hat & Trenchcoat */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center text-4xl sm:text-5xl drop-shadow-md">
                🕵️‍♂️
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-200/20 absolute -top-1 -right-1 pointer-events-none" />
            </div>
          }
        />

        {/* 2. PAIR 1: TRICKSTER'S CAFE (Bronze) & HIDE AND SEEK (Teal) */}
        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Trickster's Cafe"
            gradient="from-[#a34434] via-[#8c3525] to-[#6e2215]"
            onClick={() => onOpenGame('trickster')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🐊
              </div>
            }
          />

          <OrnateGameCard
            title="Hide And Seek"
            gradient="from-[#22d3ee] via-[#06b6d4] to-[#0891b2]"
            onClick={() => onOpenGame('hide_seek')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                👀
              </div>
            }
          />
        </div>

        {/* 3. PAIR 2: SPACE WEREWOLF (Purple) & OH MY CARD (Lime Green) */}
        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Space Werewolf"
            gradient="from-[#a855f7] via-[#9333ea] to-[#7e22ce]"
            onClick={() => onOpenGame('werewolf')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🐺
              </div>
            }
          />

          <OrnateGameCard
            title="Oh My Card"
            gradient="from-[#a3e635] via-[#84cc16] to-[#65a30d]"
            onClick={() => onOpenGame('cards')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🃏
              </div>
            }
          />
        </div>

        {/* 4. PAIR 3: LUDO (Violet) & GUESS MY DRAWING (Green) */}
        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Ludo"
            gradient="from-[#c084fc] via-[#a855f7] to-[#7c3aed]"
            onClick={() => onOpenGame('ludo')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🎲
              </div>
            }
          />

          <OrnateGameCard
            title="Guess My Drawing"
            gradient="from-[#4ade80] via-[#22c55e] to-[#16a34a]"
            onClick={() => onOpenGame('drawing')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                ✏️
              </div>
            }
          />
        </div>

        {/* 5. PAIR 4: BINGO (Lavender) & MIC GRAB (Hot Pink) */}
        <div className="grid grid-cols-2 gap-2.5">
          <OrnateGameCard
            title="Bingo"
            gradient="from-[#818cf8] via-[#6366f1] to-[#4f46e5]"
            onClick={() => onOpenGame('bingo')}
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🎱
              </div>
            }
          />

          <OrnateGameCard
            title="Mic Grab"
            gradient="from-[#f43f5e] via-[#e11d48] to-[#be123c]"
            onClick={() => onOpenGame('mic_grab')}
            extraBadge={
              <span className="text-[9px] bg-white/20 text-white font-mono px-1 rounded block">
                106:32:29
              </span>
            }
            characterImg={
              <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                🎙️
              </div>
            }
          />
        </div>

      </div>

      {/* ============================================================== */}
      {/* 5. WEPLAY BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT)          */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-4 shadow-2xl flex items-center justify-around max-w-md mx-auto">
        
        {/* Tab 1: WePlay (Active - Cyan) */}
        <button
          type="button"
          className="flex flex-col items-center cursor-pointer text-cyan-500 font-black transition"
        >
          <Gamepad2 className="w-5 h-5 fill-cyan-400 text-cyan-500" />
          <span className="text-[10px] font-black mt-0.5">WePlay</span>
        </button>

        {/* Tab 2: Voice Room */}
        <button
          type="button"
          onClick={onOpenVoiceRoom}
          className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-slate-800 transition"
        >
          <Radio className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Voice Room</span>
        </button>

        {/* Tab 3: Chats (ESP CHAT with Badge '1') */}
        <button
          type="button"
          onClick={onOpenChats || onOpenFriends}
          className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-slate-800 transition relative"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white">
              1
            </span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Chats</span>
        </button>

        {/* Tab 4: Discover with Badge '2' */}
        <button
          type="button"
          onClick={onOpenWeeklyRewards || onOpenRanking}
          className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-slate-800 transition relative"
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white">
              2
            </span>
          </div>
          <span className="text-[10px] font-bold mt-0.5">Discover</span>
        </button>

        {/* Tab 5: Me with Red Dot */}
        <button
          type="button"
          onClick={onOpenProfile || onOpenAvatarCustomizer}
          className="flex flex-col items-center cursor-pointer text-slate-400 hover:text-slate-800 transition relative"
        >
          <div className="relative">
            <User className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 border border-white" />
          </div>
          <span className="text-[10px] font-bold mt-0.5">Me</span>
        </button>

      </div>

    </div>
  );
};
