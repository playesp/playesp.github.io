import React, { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Check,
  Copy,
  Users,
  MoreHorizontal,
  Lock,
  Unlock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Gift,
  Smile,
  Send,
  Image as ImageIcon,
  UserPlus,
  Sparkles,
  Play,
  Pause,
  Youtube,
  Music,
  Heart,
  Crown,
  Disc,
  Radio,
  LogIn,
} from 'lucide-react';
import type {
  UserProfile,
  CustomVoiceRoom,
  VoiceRoomSeat,
  VoiceChatMessage,
  VoiceRoomStageLayout,
} from '../types/index.ts';
import {
  resolveWallpaperBackdrop,
  extractYouTubeEmbedUrl,
} from '../config/voiceWallpapers.ts';
import { AvatarFrame, type FrameVariant } from './AvatarFrame.tsx';
import { VOICE_EFFECTS, type VoiceEffectType } from './VoiceEffectSelector.tsx';
import { isVipFancyRoomNumber } from '../config/giftCatalog.ts';

interface VoiceRoomHostInfo {
  userId: string;
  userName: string;
  username?: string;
  gameLevel: number;
  charms: number;
  userAvatar: string;
  isSpeaking: boolean;
  roleTitle?: string;
}

interface VoiceRoomStageCanvasProps {
  currentUser: UserProfile;
  room: Partial<CustomVoiceRoom> & {
    id: string;
    title: string;
    topic: string;
    roomAddress: string;
    hostUserId: string;
  };
  host: VoiceRoomHostInfo;
  seats: VoiceRoomSeat[];
  chatMessages: VoiceChatMessage[];
  audienceCount: number;
  mySeatIndex: number | null;
  hasJoinedRoom: boolean;
  micPermission: 'idle' | 'requesting' | 'granted' | 'denied';
  micLevel: number;
  isMicMuted: boolean;
  isRecordingVoice: boolean;
  recordDuration: number;
  autoPlayAudio: boolean;
  currentlyPlayingAudioId: string | null;
  selectedVoiceEffect: VoiceEffectType;
  quickPhrases: string[];
  onOpenRoomsDirectory: () => void;
  onJumpToMyPersonalRoom: () => void;
  onJoinRoom: () => void;
  onToggleFollowRoom: () => void;
  onOpenAudience: () => void;
  onOpenDesignModal: (initialTab?: 'design' | 'invite' | 'seats') => void;
  onSeatClick: (seat: VoiceRoomSeat, idx: number) => void;
  onHostToggleSeatLock: (idx: number, lock: boolean) => void;
  onLeaveSeat: () => void;
  onOpenOwnerProfile: () => void;
  onToggleAutoPlayAudio: () => void;
  onEnableMic: () => void;
  onTogglePhysicalMute: () => void;
  onStartWalkieTalkie: () => void;
  onStopWalkieTalkie: () => void;
  onSendChatText: (text: string) => Promise<void> | void;
  onPlayAudioClip: (url: string, id: string) => void;
  onOpenGiftModal: () => void;
  onOpenVoiceEffectModal: () => void;
  onSetYouTubeVideo: (url: string) => Promise<void> | void;
  onCopyFeedback: (msg: string) => void;
}

const HEART_INTERACT_TABS = ['Interact', 'Select', 'Reveal', 'Confess'] as const;

export const VoiceRoomStageCanvas: React.FC<VoiceRoomStageCanvasProps> = ({
  currentUser,
  room,
  host,
  seats,
  chatMessages,
  audienceCount,
  mySeatIndex,
  hasJoinedRoom,
  micPermission,
  micLevel,
  isMicMuted,
  isRecordingVoice,
  recordDuration,
  autoPlayAudio,
  currentlyPlayingAudioId,
  selectedVoiceEffect,
  quickPhrases,
  onOpenRoomsDirectory,
  onJumpToMyPersonalRoom,
  onJoinRoom,
  onToggleFollowRoom,
  onOpenAudience,
  onOpenDesignModal,
  onSeatClick,
  onHostToggleSeatLock,
  onLeaveSeat,
  onOpenOwnerProfile,
  onToggleAutoPlayAudio,
  onEnableMic,
  onTogglePhysicalMute,
  onStartWalkieTalkie,
  onStopWalkieTalkie,
  onSendChatText,
  onPlayAudioClip,
  onOpenGiftModal,
  onOpenVoiceEffectModal,
  onSetYouTubeVideo,
  onCopyFeedback,
}) => {
  const [chatText, setChatText] = useState('');
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [heartModeTab, setHeartModeTab] = useState<string>('Interact');
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState(room.youtubeVideoUrl || '');
  const [savingYoutube, setSavingYoutube] = useState(false);
  const [ambientMusicOn, setAmbientMusicOn] = useState(false);

  const isOwner =
    room.hostUserId === currentUser.userId ||
    currentUser.userId === 'EMO-MOM-MMO';
  const isMyFixedPersonalRoom =
    Boolean(room.isPersonalFixed) && room.hostUserId === currentUser.userId;

  const layout: VoiceRoomStageLayout = room.stageLayout || 'classic_8';
  const backdrop = resolveWallpaperBackdrop(
    room.wallpaperId || 'castle_night',
    room.customWallpaperUrl
  );
  const isLightBackdrop = backdrop.isLight && !room.customWallpaperUrl;

  const youtubeEmbed = extractYouTubeEmbedUrl(room.youtubeVideoUrl);
  const topContributors = Array.isArray(room.topContributors)
    ? room.topContributors.slice(0, 3)
    : [];

  const handleCopyRoomId = () => {
    const code = room.roomAddress || '1111';
    navigator.clipboard?.writeText(code).catch(() => {});
    onCopyFeedback(`📋 रूम ID "${code}" कॉपी हो गया!`);
  };

  const handleSubmitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = chatText.trim();
    if (!clean) return;
    setChatText('');
    await onSendChatText(clean);
  };

  const renderSeatCircle = (
    seat: VoiceRoomSeat,
    idx: number,
    compact = false
  ) => {
    const isOccupied = Boolean(seat.userId);
    const isLocked = Boolean(seat.isLocked) && !isOccupied;
    const isMe = mySeatIndex === idx;
    const sizeCls = compact ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-14 h-14 sm:w-16 sm:h-16';

    return (
      <div
        key={idx}
        className="flex flex-col items-center gap-1 select-none group relative"
      >
        <div
          onClick={() => {
            if (isLocked && isOwner) {
              onHostToggleSeatLock(idx, false);
            } else {
              onSeatClick(seat, idx);
            }
          }}
          className={`${sizeCls} rounded-full relative flex items-center justify-center transition-transform duration-200 hover:scale-105 cursor-pointer ${
            isOccupied
              ? 'ring-2 ring-pink-300/80 bg-slate-900/50 shadow-lg'
              : isLocked
              ? isLightBackdrop
                ? 'bg-white/60 border border-blue-200 text-slate-500 backdrop-blur-xs'
                : 'bg-white/15 border border-white/25 text-white/90 backdrop-blur-xs'
              : isLightBackdrop
              ? 'bg-white/75 border border-blue-200 hover:border-blue-500 text-blue-600 backdrop-blur-xs shadow-xs'
              : 'bg-white/15 border border-white/30 hover:border-cyan-300 text-white/90 backdrop-blur-xs'
          }`}
        >
          {isOccupied ? (
            <>
              <img
                src={
                  seat.userAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${seat.userId}`
                }
                alt={seat.userName || 'Speaker'}
                className="w-full h-full rounded-full object-cover"
              />
              {seat.isSpeaking && !seat.isMuted && (
                <span className="absolute -inset-1 rounded-full border-2 border-cyan-300/80 animate-ping pointer-events-none" />
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border border-white flex items-center justify-center shadow ${
                  seat.isMuted ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-white'
                }`}
              >
                {seat.isMuted ? (
                  <MicOff className="w-2.5 h-2.5" />
                ) : (
                  <Mic className="w-2.5 h-2.5" />
                )}
              </span>
              <span className="absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center border border-white/80">
                {idx + 1}
              </span>
            </>
          ) : isLocked ? (
            <div className="flex flex-col items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Plus className="w-4 h-4" />
              <span className="text-[9px] font-bold opacity-80 leading-none">
                {idx + 1}
              </span>
            </div>
          )}

          {/* Owner quick lock/unlock chip on empty seat */}
          {isOwner && !isOccupied && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onHostToggleSeatLock(idx, !isLocked);
              }}
              title={isLocked ? 'Unlock seat' : 'Lock seat'}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center border border-white/40 opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
            >
              {isLocked ? (
                <Unlock className="w-2.5 h-2.5 text-emerald-300" />
              ) : (
                <Lock className="w-2.5 h-2.5 text-amber-300" />
              )}
            </button>
          )}
        </div>

        <div
          className={`text-[10px] font-bold truncate max-w-[70px] text-center ${
            isLightBackdrop ? 'text-slate-800' : 'text-white drop-shadow'
          }`}
        >
          {isOccupied
            ? isMe
              ? 'You'
              : seat.userName?.split(' ')[0] || 'Guest'
            : isLocked
            ? 'Locked'
            : `Seat ${idx + 1}`}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden relative shadow-xl border transition-all duration-300 min-h-[650px] flex flex-col justify-between ${
        isLightBackdrop
          ? 'border-blue-200 text-slate-900'
          : 'border-indigo-500/35 text-white'
      }`}
    >
      {/* 1. ATMOSPHERIC WALLPAPER BACKGROUND LAYER */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${backdrop.gradientClass}`}
      />
      {backdrop.imageUrl && (
        <img
          src={backdrop.imageUrl}
          alt={room.title}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      )}
      {/* Measured Contrast Scrim */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLightBackdrop
            ? 'bg-gradient-to-b from-white/45 via-sky-50/25 to-indigo-950/65'
            : 'bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/85'
        }`}
      />

      {/* 2. TOP BAR (Matching WePlay Voice Room Header) */}
      <div className="relative z-10 px-3 sm:px-4 pt-3 pb-2 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Back/Rooms + Room Pill + Follow + */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={onOpenRoomsDirectory}
              className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-md border border-white/15 shrink-0 cursor-pointer transition"
              title="सभी वॉइस रूम्स देखें / स्विच करें"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md border border-white/15 rounded-full pl-1.5 pr-1.5 py-1 min-w-0 max-w-full">
              <img
                src={host.userAvatar}
                alt={host.userName}
                onClick={onOpenOwnerProfile}
                className="w-7 h-7 rounded-full object-cover border border-amber-300 shrink-0 cursor-pointer"
              />
              <div className="min-w-0 pr-1">
                <div className="text-xs font-extrabold text-white truncate max-w-[140px] sm:max-w-[210px]">
                  {room.title}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-sky-200 font-mono tabular-nums">
                  <button
                    type="button"
                    onClick={handleCopyRoomId}
                    className="flex items-center gap-1 hover:text-white cursor-pointer"
                    title="Copy Numeric Room ID"
                  >
                    <span>ID:{room.roomAddress}</span>
                    <Copy className="w-2.5 h-2.5" />
                  </button>
                  {(room.isVipRoom || isVipFancyRoomNumber(room.roomAddress)) && (
                    <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[8px] font-sans font-black shadow-xs">
                      👑 {room.vipRoomLabel || 'VIP'}
                    </span>
                  )}
                  {room.isPersonalFixed && (
                    <span className="px-1 py-0.2 rounded bg-amber-400/25 text-amber-200 text-[8px] font-sans font-bold">
                      FIXED
                    </span>
                  )}
                </div>
              </div>

              {/* Follow + / Following ✓ Button */}
              <button
                type="button"
                onClick={onToggleFollowRoom}
                className={`h-7 px-2.5 rounded-full text-[11px] font-black flex items-center gap-1 shrink-0 transition cursor-pointer ${
                  room.isFollowed
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm'
                }`}
                title={room.isFollowed ? 'Unfollow room' : 'Follow this room'}
              >
                {room.isFollowed ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Follow</span>
                  </>
                )}
                {(room.followersCount || 0) > 0 && (
                  <span className="text-[9px] opacity-85 font-mono">
                    {room.followersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Right: Supporter Ranks + Online Counter + Join + Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Supporter Mini Avatars */}
            {topContributors.length > 0 && (
              <div className="hidden sm:flex items-center -space-x-1.5 mr-1">
                {topContributors.map((c, cIdx) => (
                  <div key={c.userId} className="relative">
                    <img
                      src={
                        c.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${c.userId}`
                      }
                      alt={c.fullName}
                      className={`w-7 h-7 rounded-full object-cover border-2 ${
                        cIdx === 0
                          ? 'border-amber-400'
                          : cIdx === 1
                          ? 'border-slate-300'
                          : 'border-amber-700'
                      }`}
                    />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/75 text-amber-300 text-[7px] font-bold px-1 rounded-full">
                      {c.coins > 999 ? `${(c.coins / 1000).toFixed(1)}k` : c.coins}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onOpenAudience}
              className="px-2.5 py-1 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
              title="रूम में मौजूद सदस्य देखें"
            >
              <Users className="w-3 h-3 text-cyan-300" />
              <span>online: {audienceCount}</span>
            </button>

            {!hasJoinedRoom && (
              <button
                type="button"
                onClick={onJoinRoom}
                className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow-md cursor-pointer transition"
              >
                <LogIn className="w-3 h-3" />
                <span>Join Room</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenDesignModal(isOwner ? 'design' : 'invite')}
              className="w-8 h-8 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md border border-white/15 text-white flex items-center justify-center cursor-pointer transition"
              title="रूम सेटिंग्स, वॉलपेपर व इनवाइट"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Quick Room Navigation & Personal Room Shortcut */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            {!isMyFixedPersonalRoom && (
              <button
                type="button"
                onClick={onJumpToMyPersonalRoom}
                className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center gap-1 shadow-xs cursor-pointer transition"
              >
                <Crown className="w-3 h-3" />
                <span>मेरा फिक्स्ड रूम खोलें</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenRoomsDirectory}
              className="px-2.5 py-1 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-md text-white border border-white/15 font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Radio className="w-3 h-3 text-cyan-300" />
              <span>Rooms / Search ID</span>
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => onOpenDesignModal('design')}
                className="px-2.5 py-1 rounded-full bg-indigo-600/80 hover:bg-indigo-500 backdrop-blur-md text-white border border-indigo-300/40 font-bold flex items-center gap-1 cursor-pointer transition"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Wallpaper & Setup</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenDesignModal('invite')}
              className="px-2.5 py-1 rounded-full bg-emerald-500/85 hover:bg-emerald-500 backdrop-blur-md text-white border border-emerald-300/40 font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <UserPlus className="w-3 h-3" />
              <span>Invite</span>
            </button>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-black/35 backdrop-blur-md border border-white/10 text-[10px] text-white/90 truncate max-w-[260px]">
            Topic: {room.topic}
          </div>
        </div>
      </div>

      {/* 3. CENTER STAGE AREA (4 SWITCHABLE LAYOUTS MATCHING MOCKUP) */}
      <div className="relative z-10 px-3 sm:px-6 py-2 flex-1 flex flex-col justify-center">
        {/* LAYOUT 1: CLASSIC 8-SEAT CASTLE STAGE */}
        {layout === 'classic_8' && (
          <div className="space-y-4">
            {/* Owner Top-Center Spotlight */}
            <div className="flex flex-col items-center">
              <div
                onClick={onOpenOwnerProfile}
                className="relative cursor-pointer group"
              >
                <AvatarFrame
                  src={host.userAvatar}
                  alt={host.userName}
                  size="lg"
                  frameType="cosmic-neon"
                  level={host.gameLevel || 1}
                  showCrown={true}
                  isSpeaking={host.isSpeaking}
                />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[9px] font-black shadow border border-white z-20">
                  Owner
                </span>
              </div>
              <div className="mt-2.5 text-xs font-extrabold text-white drop-shadow">
                {host.userName}
              </div>
            </div>

            {/* 2x4 Circular Mic Seats Grid */}
            <div className="grid grid-cols-4 gap-x-2 gap-y-3 max-w-md mx-auto w-full pt-1">
              {seats.slice(0, 8).map((s, idx) => renderSeatCircle(s, idx))}
            </div>
          </div>
        )}

        {/* LAYOUT 2: PURPLE HEART STAGE (Interactive Tabs + Heart Ring) */}
        {layout === 'heart_stage' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div
                onClick={onOpenOwnerProfile}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={host.userAvatar}
                    alt={host.userName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 shadow"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">
                    Owner
                  </span>
                </div>
                <div>
                  <div className="text-[11px] text-purple-200 font-bold">
                    Waiting for guests
                  </div>
                  <div className="text-xs font-extrabold text-white">
                    {host.userName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-black/30 p-1 rounded-full backdrop-blur-md border border-white/15">
                {HEART_INTERACT_TABS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setHeartModeTab(t);
                      onSendChatText(`💜 [${t} Stage Mode activated]`);
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      heartModeTab === t
                        ? 'bg-white text-purple-900 shadow'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing Center Heart Stage flanked by 8 seats */}
            <div className="relative max-w-md mx-auto w-full py-2">
              <div className="grid grid-cols-4 gap-2 items-center">
                <div className="space-y-3 flex flex-col items-center">
                  {seats[0] && renderSeatCircle(seats[0], 0, true)}
                  {seats[4] && renderSeatCircle(seats[4], 4, true)}
                </div>

                <div className="col-span-2 flex flex-col items-center justify-center space-y-3">
                  <div className="flex items-center justify-center gap-4 w-full">
                    {seats[1] && renderSeatCircle(seats[1], 1, true)}
                    {seats[2] && renderSeatCircle(seats[2], 2, true)}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-fuchsia-500/30 border border-pink-300/60 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.6)]">
                    <Heart className="w-7 h-7 text-pink-200 fill-pink-400 animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase mt-0.5">
                      {heartModeTab}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4 w-full">
                    {seats[5] && renderSeatCircle(seats[5], 5, true)}
                    {seats[6] && renderSeatCircle(seats[6], 6, true)}
                  </div>
                </div>

                <div className="space-y-3 flex flex-col items-center">
                  {seats[3] && renderSeatCircle(seats[3], 3, true)}
                  {seats[7] && renderSeatCircle(seats[7], 7, true)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 3: ROYAL EVENT / MC HALL */}
        {layout === 'event_hall' && (
          <div className="space-y-3 max-w-md mx-auto w-full">
            <div className="bg-sky-500/40 backdrop-blur-md border border-white/50 rounded-xl p-2.5 text-center text-white shadow relative">
              <div className="font-black text-sm tracking-wide">{room.title}</div>
              <div className="text-[10px] font-mono opacity-95">
                ID: {room.roomAddress} | online: {audienceCount} &gt;
              </div>
              <button
                type="button"
                onClick={() => setAmbientMusicOn(!ambientMusicOn)}
                className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition ${
                  ambientMusicOn
                    ? 'bg-amber-400 text-slate-950 animate-spin'
                    : 'bg-black/30 text-white'
                }`}
                title="Event Music"
              >
                <Music className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Spotlight MC + Owner + Heart Charms Counter */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div
                  onClick={onOpenOwnerProfile}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <img
                    src={host.userAvatar}
                    alt={host.userName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow"
                  />
                  <span className="mt-0.5 px-2 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">
                    Owner
                  </span>
                </div>
                {seats[0] && renderSeatCircle(seats[0], 0, true)}
                {seats[1] && renderSeatCircle(seats[1], 1, true)}
              </div>

              <div className="px-3 py-1 rounded-full bg-pink-500/85 text-white text-[11px] font-black flex items-center gap-1 shadow">
                <Heart className="w-3.5 h-3.5 fill-white" />
                <span>{((room.roomCharms || host.charms || 0) + 100).toLocaleString()}</span>
              </div>
            </div>

            {/* Dual-Column Event Seats */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {seats.slice(2, 8).map((s, i) => renderSeatCircle(s, i + 2, true))}
            </div>
          </div>
        )}

        {/* LAYOUT 4: WATCH PARTY (YouTube Video Together + 2 Seat Rows) */}
        {layout === 'watch_party' && (
          <div className="space-y-3 max-w-lg mx-auto w-full">
            <div className="rounded-xl bg-slate-950/85 border border-white/20 overflow-hidden shadow-lg">
              {youtubeEmbed ? (
                <div className="relative">
                  <div className="aspect-video w-full">
                    <iframe
                      src={youtubeEmbed}
                      title="Watch Together YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeInput(room.youtubeVideoUrl || '');
                        setShowYoutubeModal(true);
                      }}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[10px] font-bold border border-white/20 cursor-pointer"
                    >
                      Change video
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-6 px-4 text-center space-y-2.5">
                  <div className="inline-flex items-center justify-center w-9 h-7 rounded-md bg-rose-600 text-white shadow">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-200 max-w-xs mx-auto leading-relaxed">
                    Choose a YouTube video to watch and chat with friends in the whole room
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeInput(room.youtubeVideoUrl || '');
                      setShowYoutubeModal(true);
                    }}
                    className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-cyan-200 text-xs font-bold border border-white/20 cursor-pointer transition"
                  >
                    Add video
                  </button>
                </div>
              )}
            </div>

            {/* Compact Seats Grid below Video */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 items-start">
              {/* Owner Mini Tile */}
              <div
                onClick={onOpenOwnerProfile}
                className="flex flex-col items-center gap-1 cursor-pointer"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full relative ring-2 ring-amber-400">
                  <img
                    src={host.userAvatar}
                    alt={host.userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-amber-400 text-slate-950 text-[8px] font-black">
                    Host
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white truncate max-w-[65px]">
                  {host.userName.split(' ')[0]}
                </span>
              </div>
              {seats.slice(0, 8).map((s, idx) => renderSeatCircle(s, idx, true))}
            </div>
          </div>
        )}
      </div>

      {/* 4. FLOATING TRANSLUCENT CHAT FEED & BOTTOM CONTROLS */}
      <div className="relative z-10 px-3 sm:px-4 pb-3 pt-1 space-y-2">
        {/* Mic / Leave Seat quick status bar */}
        {(mySeatIndex !== null || micPermission === 'granted' || isRecordingVoice) && (
          <div className="flex items-center justify-between gap-2 bg-black/45 backdrop-blur-md border border-white/15 rounded-xl px-3 py-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              {micPermission === 'granted' && (
                <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mic {micLevel}%</span>
                </span>
              )}
              <button
                type="button"
                onClick={onOpenVoiceEffectModal}
                className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold cursor-pointer"
              >
                {VOICE_EFFECTS.find((v) => v.id === selectedVoiceEffect)?.icon}{' '}
                {VOICE_EFFECTS.find((v) => v.id === selectedVoiceEffect)?.name}
              </button>
            </div>
            {mySeatIndex !== null && (
              <button
                type="button"
                onClick={onLeaveSeat}
                className="px-2.5 py-0.5 rounded-full bg-rose-500/85 hover:bg-rose-500 text-white text-[10px] font-bold cursor-pointer"
              >
                Leave Seat #{mySeatIndex + 1}
              </button>
            )}
          </div>
        )}

        {/* Translucent Floating Chat Stream */}
        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-none">
          {chatMessages.slice(-18).map((msg) => {
            const isSystem = msg.senderId === 'SYSTEM' || msg.sender === 'System';
            return (
              <div
                key={msg.id}
                className={`w-fit max-w-[92%] rounded-xl px-3 py-1.5 text-xs backdrop-blur-md border ${
                  msg.isGift
                    ? 'bg-amber-500/80 border-amber-300/60 text-white font-semibold'
                    : isSystem
                    ? 'bg-black/45 border-amber-300/20 text-amber-200'
                    : 'bg-black/45 border-white/10 text-white'
                }`}
              >
                {msg.isVoiceNote && msg.audioDataUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{msg.sender}:</span>
                    <button
                      type="button"
                      onClick={() => onPlayAudioClip(msg.audioDataUrl!, msg.id)}
                      className="px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {currentlyPlayingAudioId === msg.id ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      <span>Voice ({msg.audioDuration || 3}s)</span>
                    </button>
                  </div>
                ) : isSystem ? (
                  <span>{msg.text}</span>
                ) : (
                  <div>
                    <span className="inline-block px-1.5 py-0.2 mr-1.5 rounded bg-indigo-500/80 text-white text-[9px] font-black align-middle">
                      V1
                    </span>
                    <span className="font-bold text-cyan-200 mr-1">
                      {msg.sender}:
                    </span>
                    <span className="text-white/95">{msg.text}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Emoji / Phrases Tray */}
        {showEmojiTray && (
          <div className="bg-slate-950/90 backdrop-blur-md border border-white/20 rounded-xl p-2 flex flex-wrap gap-1.5">
            {quickPhrases.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={async () => {
                  setShowEmojiTray(false);
                  await onSendChatText(p);
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Thumb-Zone Action Dock */}
        <form
          onSubmit={handleSubmitChat}
          className="flex items-center gap-1.5 sm:gap-2 pt-1"
        >
          <button
            type="button"
            onClick={onToggleAutoPlayAudio}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border shrink-0 cursor-pointer transition ${
              autoPlayAudio
                ? 'bg-black/45 border-white/20 text-white'
                : 'bg-rose-600/80 border-rose-300 text-white'
            }`}
            title={autoPlayAudio ? 'स्पीकर चालू है' : 'स्पीकर म्यूट है'}
          >
            {autoPlayAudio ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (micPermission !== 'granted') {
                onEnableMic();
              } else {
                onTogglePhysicalMute();
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border shrink-0 cursor-pointer transition ${
              micPermission === 'granted' && !isMicMuted
                ? 'bg-emerald-500 border-emerald-300 text-white'
                : 'bg-black/45 border-white/20 text-white'
            }`}
            title={
              micPermission !== 'granted'
                ? 'माइक चालू करें'
                : isMicMuted
                ? 'Unmute Mic'
                : 'Mute Mic'
            }
          >
            {isMicMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Push to Talk Walkie-Talkie */}
          <button
            type="button"
            onMouseDown={onStartWalkieTalkie}
            onMouseUp={onStopWalkieTalkie}
            onTouchStart={onStartWalkieTalkie}
            onTouchEnd={onStopWalkieTalkie}
            className={`h-9 px-2.5 rounded-full flex items-center gap-1 backdrop-blur-md border shrink-0 cursor-pointer text-[11px] font-bold select-none ${
              isRecordingVoice
                ? 'bg-rose-600 border-rose-300 text-white animate-pulse'
                : 'bg-black/45 border-white/20 text-amber-300 hover:bg-black/60'
            }`}
            title="दबाकर वॉइस मैसेज भेजें"
          >
            <Disc className={`w-3.5 h-3.5 ${isRecordingVoice ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isRecordingVoice ? `${recordDuration}s` : 'Hold Talk'}
            </span>
          </button>

          {/* Chat Input */}
          <div className="flex-1 flex items-center bg-black/45 backdrop-blur-md border border-white/20 rounded-full px-3 h-9 min-w-0">
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Say hi..."
              className="flex-1 bg-transparent text-xs text-white placeholder-white/60 outline-none min-w-0"
            />
            {chatText.trim() && (
              <button
                type="submit"
                className="text-cyan-300 hover:text-white ml-1 cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowEmojiTray(!showEmojiTray)}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer"
            title="Quick Phrases"
          >
            <Smile className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenGiftModal}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 flex items-center justify-center shrink-0 shadow cursor-pointer"
            title="Send Gift"
          >
            <Gift className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onOpenDesignModal(isOwner ? 'design' : 'invite')}
            className="w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shrink-0 cursor-pointer"
            title="Wallpaper, Design & Invite"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </button>
        </form>
      </div>

      {/* Add YouTube Video Modal for Watch Party */}
      {showYoutubeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm">
                <Youtube className="w-5 h-5 text-rose-600" />
                <span>YouTube Video Watch Together</span>
              </div>
              <button
                type="button"
                onClick={() => setShowYoutubeModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              कोई भी YouTube वीडियो लिंक या Video ID पेस्ट करें ताकि रूम के सभी दोस्त एक साथ देख सकें:
            </p>
            <input
              type="text"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-xs outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowYoutubeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingYoutube}
                onClick={async () => {
                  setSavingYoutube(true);
                  try {
                    await onSetYouTubeVideo(youtubeInput.trim());
                    setShowYoutubeModal(false);
                  } finally {
                    setSavingYoutube(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer"
              >
                {savingYoutube ? 'Saving...' : 'Play in Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
