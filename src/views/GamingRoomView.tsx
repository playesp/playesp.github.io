import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Coins,
  Sparkles,
  Trophy,
  Users,
  UserPlus,
  Send,
  Gift,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  Flame,
  Award,
  Crown,
  Share2,
  Shield,
  Zap,
  RotateCw,
  Dices,
  CircleDot,
  Radio,
  PlusCircle,
  Clock,
  Heart,
  Smile,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  X,
  Play,
  Pause,
  Hand,
  Volume1,
  Copy,
  Check,
  Settings,
  Lock,
  Disc,
  Sliders,
  Maximize2,
  Minimize2,
  Search,
  LogIn,
  Star,
  Image as ImageIcon,
  Upload,
  Trash2,
  Eye,
} from 'lucide-react';
import type {
  UserProfile,
  PlatformSettings,
  VoiceRoomSeat,
  RoomGift,
  ClanInfo,
  CoinRechargeRequest,
  CustomVoiceRoom,
  VoiceRoomStageLayout,
  VoiceChatMessage,
} from '../types/index.ts';
import { api } from '../services/api.ts';
import { SnakeRushGame } from '../components/games/SnakeRushGame.tsx';
import { BingoGame } from '../components/games/BingoGame.tsx';
import { OhMyCardGame } from '../components/games/OhMyCardGame.tsx';
import type { RealPlayerProfile } from '../components/PlayerInfoModal.tsx';
import { UserProfileSheetModal, type RichProfileData } from '../components/UserProfileSheetModal.tsx';
import { AvatarFrame, type FrameVariant } from '../components/AvatarFrame.tsx';
import { WerewolfGameModal } from '../components/games/WerewolfGameModal.tsx';
import { DailyLuckySpin } from '../components/games/DailyLuckySpin.tsx';
import { WhoIsTheSpyGameModal } from '../components/games/WhoIsTheSpyGameModal.tsx';
import { VoiceRoomMediaStage } from '../components/VoiceRoomMediaStage.tsx';
import { VoiceRoomStageCanvas } from '../components/VoiceRoomStageCanvas.tsx';
import { VoiceRoomDesignModal } from '../components/VoiceRoomDesignModal.tsx';
import { VOICE_WALLPAPER_PRESETS, STAGE_LAYOUT_OPTIONS } from '../config/voiceWallpapers.ts';
import { LeaderboardWidget, type LeaderboardUser } from '../components/games/LeaderboardWidget.tsx';
import { DailyFortuneSpinModal } from '../components/games/DailyFortuneSpinModal.tsx';
import { TimedMysteryChestModal } from '../components/games/TimedMysteryChestModal.tsx';
import {
  WePlayAppGiftModal,
  ALL_APP_GIFTS,
  type AppGiftItem,
  type GiftComboSettings,
} from '../components/games/WePlayAppGiftModal.tsx';
import { DailyTasksAndLoginModal } from '../components/games/DailyTasksAndLoginModal.tsx';
import { AdvanceRoomStoreModal, ADVANCE_ROOM_THEMES, type AdvanceRoomTheme } from '../components/games/AdvanceRoomStoreModal.tsx';
import { WePlayHomeLobby } from '../components/games/WePlayHomeLobby.tsx';
import { TopClansDataTable, type ClanRecord } from '../components/TopClansDataTable.tsx';
import { DailyMissionsModal } from '../components/DailyMissionsModal.tsx';
import { AvatarCustomizerModal } from '../components/AvatarCustomizerModal.tsx';
import { DigitalGiftCardsModal } from '../components/DigitalGiftCardsModal.tsx';
import { DailyTasks } from '../components/DailyTasks.tsx';
import { EspChatModal } from '../components/EspChatModal.tsx';
import { InteractiveGameArenaModal, type GameKey } from '../components/games/InteractiveGameArenaModal.tsx';
import { COIN_RECHARGE_PACKS } from '../config/economy.ts';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { showToast } from '../services/toast.ts';
import { isVipFancyRoomNumber } from '../config/giftCatalog.ts';
import { GiftAnimationOverlay, type ActiveGiftAnimation } from '../components/GiftAnimationOverlay.tsx';
import { RelationshipBondsModal } from '../components/RelationshipBondsModal.tsx';
import { EspFamilyHubModal } from '../components/EspFamilyHubModal.tsx';
import { EspEventsAndMyHomeModal } from '../components/EspEventsAndMyHomeModal.tsx';
import { GiftWallModal, type GiftWallEntry } from '../components/GiftWallModal.tsx';
import { VOICE_ROOM_TIERS, getVoiceRoomTierSpec, type VoiceRoomTierId } from '../config/espSocialCatalog.ts';
import type { RoomAtmosphereEffect, RoomPacketDrop } from '../types/index.ts';
import { sound8D } from '../services/sound8d.ts';

interface GamingRoomViewProps {
  user: UserProfile;
  settings?: PlatformSettings;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenCardModal?: (tab?: string) => void;
  onOpenWithdrawal?: () => void;
  onOpenEarningSetup?: () => void;
  onOpenServicesSetup?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  initialSubTab?: 'overview' | 'ludo' | 'dice_arena' | 'card_luck' | 'gift_store' | 'vip_frames' | 'leaderboard' | 'recharge_convert' | 'voice_room' | 'games' | 'clan_friends' | 'rewards_tasks';
  initialRoomId?: string;
  subTabPulse?: number;
  onSubTabChange?: (subTab: 'games' | 'voice_room' | 'recharge_convert' | 'clan_friends' | 'rewards_tasks') => void;
  onOpenMomentsFeed?: () => void;
}

const LUXURY_GIFTS: RoomGift[] = [
  { id: 'g1', name: 'Royal Rose', hindiName: 'शाही गुलाब', icon: '🌹', coinCost: 10, charmValue: 20, animationType: 'rose', gradient: 'from-rose-500 to-pink-600' },
  { id: 'g2', name: 'Sweet Chocolate', hindiName: 'स्वीट चॉकलेट', icon: '🍫', coinCost: 30, charmValue: 60, animationType: 'chocolate', gradient: 'from-amber-700 to-amber-900' },
  { id: 'g3', name: 'Diamond Ring', hindiName: 'डायमंड रिंग', icon: '💍', coinCost: 100, charmValue: 250, animationType: 'ring', gradient: 'from-cyan-400 to-blue-600' },
  { id: 'g4', name: 'Super Ferrari', hindiName: 'रेड फरारी', icon: '🏎️', coinCost: 500, charmValue: 1200, animationType: 'car', gradient: 'from-red-600 to-rose-700' },
  { id: 'g5', name: 'Moon Rocket', hindiName: 'स्पेस रॉकेट', icon: '🚀', coinCost: 1000, charmValue: 2500, animationType: 'rocket', gradient: 'from-indigo-600 to-purple-800' },
  { id: 'g6', name: 'Emperor Crown', hindiName: 'शाही ताज', icon: '👑', coinCost: 2500, charmValue: 6500, animationType: 'crown', gradient: 'from-amber-400 to-yellow-600' },
  { id: 'g7', name: 'Magic Castle', hindiName: 'जादुई महल', icon: '🏰', coinCost: 5000, charmValue: 15000, animationType: 'castle', gradient: 'from-purple-600 to-pink-700' },
];

const PRESET_TALK_PHRASES = [
  '🎙️ नमस्ते दोस्तों! वॉइस कैसी आ रही है?',
  '💰 10 सर्विसेज से बहुत अच्छी कमाई हो रही है!',
  '🎲 चलो मिलकर स्टेज पर डाइस गेम खेलते हैं!',
  '👑 Santosh sir, voice ekdam clear hai!',
  '✨ Congrats on the huge win bro!',
  '🌹 Sending gifts to everyone in the room!'
];

export const GamingRoomView: React.FC<GamingRoomViewProps> = ({
  user,
  settings,
  onUpdateUser,
  onOpenCardModal,
  onOpenWithdrawal,
  onOpenEarningSetup,
  onOpenServicesSetup,
  isAdmin,
  onOpenAdmin,
  onLogout,
  initialSubTab = 'overview',
  initialRoomId,
  subTabPulse = 0,
  onSubTabChange,
  onOpenMomentsFeed,
}) => {
  // Navigation tabs within ESP Gaming Room (Default: 'games', or 'voice_room' when deep-linked)
  const [activeTab, setActiveTab] = useState<'voice_room' | 'games' | 'recharge_convert' | 'clan_friends' | 'rewards_tasks'>(
    initialRoomId
      ? 'voice_room'
      : initialSubTab === 'recharge_convert'
      ? 'recharge_convert'
      : initialSubTab === 'voice_room'
      ? 'voice_room'
      : initialSubTab === 'clan_friends'
      ? 'clan_friends'
      : initialSubTab === 'rewards_tasks'
      ? 'rewards_tasks'
      : 'games'
  );

  // Voice Room State
  const [hostSpeaking, setHostSpeaking] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [mySeatIndex, setMySeatIndex] = useState<number | null>(null);

  // 8 Speaker Seats (Real Registered Users or Empty)
  const [seats, setSeats] = useState<VoiceRoomSeat[]>(
    Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }))
  );

  // Real Audience State & Registered Players List
  const [audienceCount, setAudienceCount] = useState<number>(1);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [realPlayers, setRealPlayers] = useState<RealPlayerProfile[]>([]);
  const [profileSheetState, setProfileSheetState] = useState<{
    isOpen: boolean;
    targetUserId?: string;
    initialProfile?: Partial<RichProfileData> | null;
    initialMode?: 'view' | 'edit' | 'search';
  }>({ isOpen: false });

  // Real Voice Room Host
  const [voiceRoomHost, setVoiceRoomHost] = useState<{
    userId: string;
    userName: string;
    username?: string;
    gameLevel: number;
    charms: number;
    userAvatar: string;
    isSpeaking: boolean;
    roleTitle: string;
  }>({
    userId: 'EMO-MOM-MMO',
    userName: 'SANTOSH KUMAR',
    gameLevel: 1,
    charms: 0,
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    isSpeaking: true,
    roleTitle: 'ESP Founder & Room Host',
  });

  // Selected seat for interaction popup
  const [selectedSeatAction, setSelectedSeatAction] = useState<VoiceRoomSeat | null>(null);

  // Stage mini-game overlay
  const [showStageGameOverlay, setShowStageGameOverlay] = useState(false);

  // Stage Mini-Games Modals (Real Players Only)
  const [showWerewolfModal, setShowWerewolfModal] = useState(false);
  const [showSpyGameModal, setShowSpyGameModal] = useState(false);

  // Soundboard feedback
  const [soundEffectToast, setSoundEffectToast] = useState<string | null>(null);

  // Pre-Send Combo Settings + Post-Send Interactive Rapid Combo Button State
  const [comboSettings, setComboSettings] = useState<GiftComboSettings>({
    showRapidButton: true,
    windowSeconds: 12,
    soundEnabled: true,
  });
  const [rapidComboTarget, setRapidComboTarget] = useState<{
    gift: AppGiftItem;
    count: number;
    targetName: string;
    targetUserId?: string;
    comboStreak: number;
    expiresAt: number;
    windowMs: number;
    remainingMs: number;
  } | null>(null);
  const [rapidComboBusy, setRapidComboBusy] = useState(false);

  // New Feature States
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showFortuneSpinModal, setShowFortuneSpinModal] = useState(false);
  const [showTimedChestModal, setShowTimedChestModal] = useState(false);
  const [showAppGiftModal, setShowAppGiftModal] = useState(false);
  const [appGiftPreset, setAppGiftPreset] = useState<{
    giftId?: string;
    targetName?: string;
    targetUserId?: string;
    category?: 'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic' | 'packets';
  } | null>(null);
  const [showDailyTasksModal, setShowDailyTasksModal] = useState(false);
  const [dailyTasksModalInitialTab, setDailyTasksModalInitialTab] = useState<'tasks' | 'login'>('tasks');
  const [showRoomStoreModal, setShowRoomStoreModal] = useState(false);
  const [showTopClansModal, setShowTopClansModal] = useState(false);
  const [showDailyMissionsModal, setShowDailyMissionsModal] = useState(false);
  const [showAvatarCustomizerModal, setShowAvatarCustomizerModal] = useState(false);
  const [showDigitalGiftCardsModal, setShowDigitalGiftCardsModal] = useState(false);
  
  // ESP CHAT Modal State (Facebook-style Social Friend & Chat Network)
  const [showEspChatModal, setShowEspChatModal] = useState(false);

  // 8D Interactive Game Arena Modal State
  const [activeInteractiveGame, setActiveInteractiveGame] = useState<GameKey | null>(null);
  const [activeBoardGameModal, setActiveBoardGameModal] = useState<'bingo' | 'cards' | 'snake' | null>(null);

  useEffect(() => {
    onSubTabChange?.(activeTab);
  }, [activeTab, onSubTabChange]);

  useEffect(() => {
    if (!initialSubTab || initialSubTab === 'overview') {
      return;
    }
    if (initialSubTab === 'games') {
      setActiveTab('games');
    } else if (initialSubTab === 'recharge_convert') {
      setActiveTab('recharge_convert');
    } else if (initialSubTab === 'voice_room') {
      setActiveTab('voice_room');
    } else if (initialSubTab === 'clan_friends') {
      setActiveTab('clan_friends');
    } else if (initialSubTab === 'rewards_tasks') {
      setActiveTab('rewards_tasks');
    } else if (initialSubTab === 'vip_frames') {
      setShowAvatarCustomizerModal(true);
    } else if (initialSubTab === 'gift_store') {
      setShowDigitalGiftCardsModal(true);
    } else if (initialSubTab === 'leaderboard') {
      setShowLeaderboardModal(true);
    } else if (initialSubTab === 'dice_arena') {
      setActiveTab('games');
      setSelectedGame('dice');
    } else if (initialSubTab === 'card_luck') {
      setActiveTab('games');
      setSelectedGame('cards');
    } else if (initialSubTab === 'ludo') {
      setActiveTab('games');
      setActiveInteractiveGame('ludo');
    }
  }, [initialSubTab, subTabPulse]);

  // Room Background Wallpaper Theme (Default: Classic Light Marketplace Room)
  const [roomBgTheme, setRoomBgTheme] = useState<AdvanceRoomTheme>(() => {
    try {
      const stored = localStorage.getItem(`esp_room_theme_${user.userId}`);
      if (stored) {
        const found = ADVANCE_ROOM_THEMES.find(t => t.id === stored);
        if (found) return found;
      }
    } catch {}
    return ADVANCE_ROOM_THEMES[0];
  });

  // Fullscreen toggle capability for native app feeling
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Invite Real Friends Helper (Numeric Room ID + Direct Room URL)
  const handleInviteRealFriends = () => {
    const cleanCode = (activeRoomAddress || user.roomAddress || '1111').replace(/\D/g, '') || '1111';
    const shareUrl = `${window.location.origin}/?room=${encodeURIComponent(cleanCode)}&ref=${encodeURIComponent(user.userId)}`;
    navigator.clipboard.writeText(
      `🎙️ मेरे ESP Voice Room "${activeRoomTitle}" में जुड़ें!\nRoom ID: ${cleanCode}\nDirect Join Link: ${shareUrl}`
    ).catch(() => {});
    setSoundEffectToast(`📋 रूम ID (${cleanCode}) व लिंक कॉपी हो गया!`);
    setTimeout(() => setSoundEffectToast(null), 3500);
  };

  // Room Chat stream (Real live server chat with real voice audio notes)
  const [roomChatMessages, setRoomChatMessages] = useState<VoiceChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // ==============================================================
  // MULTI-ROOM & PERSONAL FIXED VOICE ROOM STATE
  // ==============================================================
  const cleanUserRoomFallback =
    (user.roomAddress || user.personalRoomId || '10001').replace(/\D/g, '') || '10001';

  const [currentRoomId, setCurrentRoomId] = useState<string>(`room-personal-${user.userId}`);
  const [activeRoomDetail, setActiveRoomDetail] = useState<CustomVoiceRoom | null>(null);
  const [activeRoomTitle, setActiveRoomTitle] = useState<string>(`${user.fullName}'s Voice Room`);
  const [activeRoomTopic, setActiveRoomTopic] = useState<string>('Welcome to my personal voice stage! Join, chat & play.');
  const [activeRoomCategory, setActiveRoomCategory] = useState<string>('earning');
  const [activeRoomAddress, setActiveRoomAddress] = useState<string>(cleanUserRoomFallback);
  const [activeRoomHostId, setActiveRoomHostId] = useState<string>(user.userId);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [roomsSearchQuery, setRoomsSearchQuery] = useState('');
  const [roomsFilterTab, setRoomsFilterTab] = useState<'all' | 'vip' | 'my_room' | 'followed'>('all');
  const [designModalState, setDesignModalState] = useState<{
    isOpen: boolean;
    tab: 'design' | 'invite' | 'seats';
  }>({ isOpen: false, tab: 'design' });
  const [privatePasscodePrompt, setPrivatePasscodePrompt] = useState<{
    room: any;
    passcode: string;
    error?: string;
  } | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showHostSettingsModal, setShowHostSettingsModal] = useState(false);
  const [editTopicInput, setEditTopicInput] = useState('');
  const roomBootstrappedRef = useRef<string>('');
  
  // New Room Creation Form
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<'earning' | 'gaming' | 'chitchat' | 'clan' | 'help'>('earning');
  const [newRoomWallpaperId, setNewRoomWallpaperId] = useState<string>('castle_night');
  const [newRoomStageLayout, setNewRoomStageLayout] = useState<VoiceRoomStageLayout>('classic_8');
  const [newRoomTier, setNewRoomTier] = useState<VoiceRoomTierId>('normal');
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomActionFeedback, setRoomActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showRelationshipsModal, setShowRelationshipsModal] = useState(false);
  const [showFamilyHubModal, setShowFamilyHubModal] = useState(false);
  const [eventsMyHomeState, setEventsMyHomeState] = useState<{ open: boolean; tab: 'my_home' | 'events' }>({
    open: false,
    tab: 'my_home',
  });
  const [showOwnGiftWallModal, setShowOwnGiftWallModal] = useState(false);

  // ==============================================================
  // REAL MICROPHONE HARDWARE & LIVE AUDIO STREAMING STATE
  // ==============================================================
  const [micPermission, setMicPermission] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');
  const [micLevel, setMicLevel] = useState<number>(0); // 0 to 100 from real physical mic!
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [isLoopbackTesting, setIsLoopbackTesting] = useState(false);
  const [loopbackNotice, setLoopbackNotice] = useState<string | null>(null);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [currentlyPlayingAudioId, setCurrentlyPlayingAudioId] = useState<string | null>(null);

  // Audio Refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const playedAudioIdsRef = useRef<Set<string>>(new Set());

  // Gift shop modal & Live Gifting Full-screen Effect
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedGift, setSelectedGift] = useState<RoomGift | null>(LUXURY_GIFTS[0]);
  const [giftTarget, setGiftTarget] = useState<string>('Entire Room (सभी को)');
  const [giftTargetUserId, setGiftTargetUserId] = useState<string | undefined>(undefined);
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<ActiveGiftAnimation | null>(null);
  const [giftAnnouncement, setGiftAnnouncement] = useState<string | null>(null);

  // Gift Combo System State (Sending gifts within 12s window triggers combo multiplier and bonus charm points)
  const [giftComboCount, setGiftComboCount] = useState<number>(0);
  const [giftComboMultiplier, setGiftComboMultiplier] = useState<number>(1);
  const [giftComboBonusCharms, setGiftComboBonusCharms] = useState<number>(0);
  const [giftComboBanner, setGiftComboBanner] = useState<{
    combo: number;
    multiplier: number;
    bonusCharms: number;
    giftName: string;
    totalCharmsEarned: number;
  } | null>(null);
  const lastGiftTimeRef = useRef<number>(0);
  const comboResetTimerRef = useRef<any>(null);

  const registerGiftCombo = (baseCharms: number, giftName: string, windowSecondsOverride?: number) => {
    const windowMs = (windowSecondsOverride || comboSettings.windowSeconds || 12) * 1000;
    const now = Date.now();
    const timeSinceLast = now - lastGiftTimeRef.current;
    lastGiftTimeRef.current = now;

    let newCombo = 1;
    if (timeSinceLast < windowMs && lastGiftTimeRef.current !== 0 && giftComboCount > 0) {
      newCombo = giftComboCount + 1;
    } else {
      newCombo = 1;
    }

    let multiplier = 1;
    if (newCombo >= 2) {
      multiplier = Math.min(3.5, Number((1 + (newCombo - 1) * 0.25).toFixed(2)));
    }

    const bonusCharms = Math.round(baseCharms * (multiplier - 1));
    const totalCharmsAwarded = baseCharms + bonusCharms;

    setGiftComboCount(newCombo);
    setGiftComboMultiplier(multiplier);
    setGiftComboBonusCharms(bonusCharms);

    if (newCombo >= 2) {
      setGiftComboBanner({
        combo: newCombo,
        multiplier,
        bonusCharms,
        giftName,
        totalCharmsEarned: totalCharmsAwarded,
      });

      setTimeout(() => {
        setGiftComboBanner(prev => (prev?.combo === newCombo ? null : prev));
      }, 4000);
    }

    if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current);
    comboResetTimerRef.current = setTimeout(() => {
      setGiftComboCount(0);
      setGiftComboMultiplier(1);
      setGiftComboBonusCharms(0);
    }, windowMs);

    return { newCombo, multiplier, bonusCharms, totalCharmsAwarded, windowMs };
  };

  useEffect(() => {
    if (!rapidComboTarget) return;
    const timer = setInterval(() => {
      const left = rapidComboTarget.expiresAt - Date.now();
      if (left <= 0) {
        setRapidComboTarget(null);
      } else {
        setRapidComboTarget(prev => (prev ? { ...prev, remainingMs: left } : null));
      }
    }, 100);
    return () => clearInterval(timer);
  }, [rapidComboTarget?.expiresAt]);

  // Coins Game State
  const [selectedGame, setSelectedGame] = useState<'snake' | 'bingo' | 'cards' | 'daily_spin' | 'spin' | 'dice' | 'coin_flip'>('daily_spin');
  const [showDailySpinModal, setShowDailySpinModal] = useState(false);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isGameSpinning, setIsGameSpinning] = useState(false);
  const [gameResultToast, setGameResultToast] = useState<{ message: string; isWin: boolean; coins: number } | null>(null);

  // Spin Wheel State
  const [spinRotation, setSpinRotation] = useState(0);

  // Dice State
  const [diceChoice, setDiceChoice] = useState<'low' | 'seven' | 'high'>('high');
  const [diceValues, setDiceValues] = useState<[number, number]>([3, 4]);

  // Coin Flip State
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');
  const [coinResultState, setCoinResultState] = useState<'heads' | 'tails'>('heads');

  // Real Recharge State
  const [selectedPack, setSelectedPack] = useState(COIN_RECHARGE_PACKS[1] || COIN_RECHARGE_PACKS[0]);
  const [rechargeUtr, setRechargeUtr] = useState('');
  const [rechargeScreenshot, setRechargeScreenshot] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);
  const [userRecharges, setUserRecharges] = useState<CoinRechargeRequest[]>([]);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [previewRechargeShot, setPreviewRechargeShot] = useState<string | null>(null);

  // Web Audio Synthesizer for rich audio feedback
  const playSynthesizedChime = (type: 'win' | 'gift' | 'click' | 'applause') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'gift') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch {
      // AudioContext not available or blocked
    }
  };

  // Natural Real Voice TTS Reader (no artificial pitch/rate modulation)
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    }
  };

  // Apply fetched voice room payload cleanly
  const applyVoiceRoomPayload = (res: any) => {
    if (!res || !res.success) return;
    if (res.seats) {
      setSeats(res.seats);
      const currentUid = (user.userId || user.id || '').toLowerCase();
      const myIdx = res.seats.findIndex((s: any) => s.userId && s.userId.toLowerCase() === currentUid);
      setMySeatIndex(myIdx !== -1 ? myIdx : null);
    }
    if (res.host) {
      setVoiceRoomHost(res.host);
    }
    if (res.room) {
      setActiveRoomDetail(res.room);
      if (res.room.id) setCurrentRoomId(res.room.id);
      setActiveRoomTitle(res.room.title || 'ESP Voice Stage');
      setActiveRoomTopic(res.room.topic || 'General Strategy');
      setActiveRoomCategory(res.room.category || 'earning');
      const cleanAddr = (res.room.roomAddress || cleanUserRoomFallback).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      setActiveRoomAddress(cleanAddr);
      setActiveRoomHostId(res.room.hostUserId);

      // Sync owner's symbol-free roomAddress if newly generated
      if (
        res.room.hostUserId === user.userId &&
        res.room.isPersonalFixed &&
        cleanAddr &&
        user.roomAddress !== cleanAddr
      ) {
        onUpdateUser({ ...user, roomAddress: cleanAddr, personalRoomId: cleanAddr });
      }
    }
    if (res.chatMessages) {
      setRoomChatMessages(res.chatMessages);

      // Auto-play new incoming voice audio if enabled and not sent by current user
      if (autoPlayAudio) {
        res.chatMessages.forEach((msg: any) => {
          if (
            msg.isVoiceNote &&
            msg.audioDataUrl &&
            !playedAudioIdsRef.current.has(msg.id) &&
            msg.senderId !== user.userId
          ) {
            playedAudioIdsRef.current.add(msg.id);
            try {
              const snd = new Audio(msg.audioDataUrl);
              setCurrentlyPlayingAudioId(msg.id);
              snd.onended = () => setCurrentlyPlayingAudioId(null);
              snd.onerror = () => setCurrentlyPlayingAudioId(null);
              snd.play().catch(() => {});
            } catch {}
          }
        });
      }
    }
    if (typeof res.audienceCount === 'number') {
      setAudienceCount(res.audienceCount);
    }
  };

  // Fetch Real Voice Room State & Community Rooms
  const loadVoiceRoomData = async (targetRoomId = currentRoomId) => {
    try {
      const res = await api.getVoiceRoomState(targetRoomId, user.userId);
      applyVoiceRoomPayload(res);
    } catch (e) {
      console.warn('Voice room state load error', e);
    }
  };

  const loadMyPersonalRoom = async (switchToVoiceTab = true) => {
    try {
      const res = await api.getMyPersonalVoiceRoom(user.userId, user.userId);
      if (res?.success && res.room) {
        applyVoiceRoomPayload(res);
        if (switchToVoiceTab) setActiveTab('voice_room');
      }
    } catch (e) {
      console.warn('Personal room load error', e);
    }
  };

  const openRoomByLookup = async (query: string, switchToVoiceTab = true) => {
    const cleanQ = query.trim();
    if (!cleanQ) return;
    try {
      const res = await api.lookupVoiceRoom(cleanQ, user.userId);
      if (res?.success && res.room) {
        if (res.room.isPrivate && res.room.hostUserId !== user.userId) {
          const alreadyIn = Array.isArray(res.room.audience) && res.room.audience.includes(user.userId);
          if (!alreadyIn) {
            setPrivatePasscodePrompt({ room: res.room, passcode: '' });
            return;
          }
        }
        applyVoiceRoomPayload(res);
        if (switchToVoiceTab) setActiveTab('voice_room');
        setShowRoomsModal(false);
        showToast(`🎙️ रूम "${res.room.title}" (${res.room.roomAddress}) खुल गया!`, 'success');
      } else {
        showToast(res?.message || `❌ रूम "${cleanQ}" नहीं मिला`, 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'रूम खोजने में त्रुटि आई', 'error');
    }
  };

  const loadAvailableRooms = async (searchQ = '') => {
    try {
      const res = await api.getVoiceRooms(user.userId, searchQ);
      if (res && res.success && Array.isArray(res.rooms)) {
        setAvailableRooms(res.rooms);
      }
    } catch (e) {
      console.warn('Failed to load voice rooms list', e);
    }
  };

  const loadRealPlayers = async () => {
    try {
      const players = await api.getRealCommunityPlayers();
      if (Array.isArray(players) && players.length > 0) {
        setRealPlayers(players);
      }
    } catch (e) {
      console.warn('Real players load error', e);
    }
  };

  // Bootstrap initial fixed personal room OR deep-linked ?room= code once per user
  useEffect(() => {
    const bootKey = `${user.userId}:${initialRoomId || ''}`;
    if (roomBootstrappedRef.current === bootKey) return;
    roomBootstrappedRef.current = bootKey;

    if (initialRoomId) {
      openRoomByLookup(initialRoomId, true);
    } else {
      loadMyPersonalRoom(false);
    }
  }, [user.userId, initialRoomId]);

  useEffect(() => {
    loadVoiceRoomData(currentRoomId);
    loadAvailableRooms(roomsSearchQuery);
    loadRealPlayers();
    const timer = setInterval(() => {
      loadVoiceRoomData(currentRoomId);
      loadAvailableRooms(roomsSearchQuery);
      loadRealPlayers();
    }, 4500);
    return () => clearInterval(timer);
  }, [user.userId, currentRoomId, roomsSearchQuery]);

  // Speaking wave simulation for other active speakers
  useEffect(() => {
    const interval = setInterval(() => {
      setSeats(prev =>
        prev.map((s, idx) => {
          if (s.userId && !s.isMuted) {
            // For my own seat, speak state is driven by real physical microphone level!
            if (mySeatIndex === idx) {
              return { ...s, isSpeaking: micLevel > 15 };
            }
            return { ...s, isSpeaking: Math.random() > 0.4 };
          }
          return s;
        })
      );
      if (activeRoomHostId === user.userId) {
        setHostSpeaking(micLevel > 15);
      } else {
        setHostSpeaking(Math.random() > 0.3);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [mySeatIndex, micLevel, activeRoomHostId, user.userId]);

  // ==============================================================
  // REAL PHYSICAL MICROPHONE HARDWARE INTEGRATION
  // ==============================================================

  const enableMicrophone = async (): Promise<boolean> => {
    if (micStreamRef.current && micPermission === 'granted') return true;
    setMicPermission('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      setMicPermission('granted');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Continuous volume meter loop
        const pcmData = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(pcmData);
          let sum = 0;
          for (let i = 0; i < pcmData.length; i++) {
            sum += pcmData[i];
          }
          const avg = sum / pcmData.length;
          const vol = Math.min(100, Math.round((avg / 128) * 100));
          setMicLevel(vol);

          if (vol > 15 && !isMicMuted) {
            setIsSpeakingNow(true);
          } else if (vol <= 10) {
            setIsSpeakingNow(false);
          }

          requestAnimationFrame(updateLevel);
        };
        requestAnimationFrame(updateLevel);
      }

      playSynthesizedChime('win');
      setSoundEffectToast('🎙️ माइक्रोफोन सफलतापूर्वक कनेक्ट हुआ!');
      setTimeout(() => setSoundEffectToast(null), 3000);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission error', err);
      setMicPermission('denied');
      setSoundEffectToast('⚠️ माइक की अनुमति नहीं मिल सकी! कृपया ब्राउज़र सेटिंग्स में माइक्रोफोन परमिशन "Allow" करें।');
      setTimeout(() => setSoundEffectToast(null), 5000);
      return false;
    }
  };

  // Toggle Physical Mic Mute
  const handleTogglePhysicalMute = () => {
    if (micStreamRef.current) {
      const tracks = micStreamRef.current.getAudioTracks();
      tracks.forEach(t => {
        t.enabled = !isMicMuted ? false : true;
      });
    }
    setIsMicMuted(prev => !prev);
  };

  // Real Natural Mic & Speaker Loopback Test (Strictly Natural Voice — No Fake Voice Changers)
  const testSpeakerAndMic = async () => {
    const ok = await enableMicrophone();
    if (!ok || !micStreamRef.current) return;

    try {
      setIsLoopbackTesting(true);
      setLoopbackNotice('🔊 असली माइक टेस्ट: माइक में बोलें, आपकी स्वाभाविक आवाज़ सीधे सुनाई देगी...');
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const source = ctx.createMediaStreamSource(micStreamRef.current);
      const mainGain = ctx.createGain();
      mainGain.gain.value = 0.85;
      source.connect(mainGain);
      mainGain.connect(ctx.destination);

      setTimeout(() => {
        try {
          mainGain.disconnect();
        } catch {}
        setIsLoopbackTesting(false);
        setLoopbackNotice('✅ असली माइक टेस्ट 100% सफल: आपकी रियल आवाज़ साफ़ आ रही है!');
        setTimeout(() => setLoopbackNotice(null), 3500);
      }, 4500);
    } catch (e) {
      console.warn('Loopback test error', e);
      setIsLoopbackTesting(false);
    }
  };

  // Real Walkie-Talkie & Voice Message Recording
  const startWalkieTalkie = async () => {
    const ok = await enableMicrophone();
    if (!ok || !micStreamRef.current) return;

    try {
      audioChunksRef.current = [];
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(micStreamRef.current, { mimeType }) : new MediaRecorder(micStreamRef.current);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
      setIsRecordingVoice(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.warn('Failed to start MediaRecorder', e);
    }
  };

  const stopWalkieTalkie = () => {
    if (!mediaRecorderRef.current || !isRecordingVoice) return;
    clearInterval(recordTimerRef.current);

    const recorder = mediaRecorderRef.current;
    recorder.onstop = () => {
      setIsRecordingVoice(false);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const duration = Math.max(1, recordDuration);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        try {
          const res = await api.sendVoiceAudioClip(
            user.userId,
            base64Audio,
            duration,
            currentRoomId
          );
          if (res && res.chatMessages) {
            setRoomChatMessages(res.chatMessages);
          }
          playSynthesizedChime('win');
          confetti({ particleCount: 50, spread: 50 });
        } catch (err) {
          console.warn('Failed to broadcast voice note', err);
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    try {
      recorder.stop();
    } catch {
      setIsRecordingVoice(false);
    }
  };

  // Play a specific voice note clip
  const playAudioClip = (audioUrl: string, id: string) => {
    try {
      if (currentlyPlayingAudioId === id) {
        setCurrentlyPlayingAudioId(null);
        return;
      }
      setCurrentlyPlayingAudioId(id);
      const snd = new Audio(audioUrl);
      snd.onended = () => setCurrentlyPlayingAudioId(null);
      snd.onerror = () => setCurrentlyPlayingAudioId(null);
      snd.play();
    } catch (e) {
      console.warn('Audio play error', e);
      setCurrentlyPlayingAudioId(null);
    }
  };

  // ==============================================================
  // MULTI-ROOM ACTIONS (Create Room, Switch Room, Host Settings)
  // ==============================================================

  const handleCreateCustomRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newRoomTitle.trim();
    if (!title) {
      setRoomActionFeedback({ message: 'कृपया रूम का नाम दर्ज करें।', type: 'error' });
      return;
    }

    setIsCreatingRoom(true);
    setRoomActionFeedback(null);
    try {
      const activeUserId = user.userId || user.id || 'ESP-GUEST-01';
      const res = await api.createVoiceRoom({
        userId: activeUserId,
        title: title,
        topic: newRoomTopic.trim() || 'General Community Discussion',
        category: newRoomCategory,
        isPrivate: newRoomIsPrivate,
        passcode: newRoomPasscode,
        hostName: user.fullName || 'ESP Host',
        hostAvatar: user.avatar,
        hostLevel: user.gameLevel || 1,
        hostCharms: user.charms || 0,
        wallpaperId: newRoomWallpaperId,
        stageLayout: newRoomStageLayout,
        roomTier: newRoomTier,
      });

      if (res && res.success && res.roomId) {
        if (res.user) {
          onUpdateUser(res.user);
        }
        setShowCreateRoomModal(false);
        setNewRoomTitle('');
        setNewRoomTopic('');
        setNewRoomPasscode('');
        setNewRoomTier('normal');
        setRoomActionFeedback(null);
        setCurrentRoomId(res.roomId);
        await loadVoiceRoomData(res.roomId);
        await loadAvailableRooms(roomsSearchQuery);
        playSynthesizedChime('win');
        confetti({ particleCount: 100, spread: 70 });
        setSoundEffectToast(
          `🎉 आपका वॉइस रूम "${title}" (ID: ${res.room?.roomAddress || ''}) लाइव हो गया!`
        );
        setTimeout(() => setSoundEffectToast(null), 6000);
      } else {
        setRoomActionFeedback({
          message: res?.message || 'कमरा बनाने में समस्या आई। पुनः प्रयास करें।',
          type: 'error',
        });
      }
    } catch (err: any) {
      setRoomActionFeedback({
        message: err?.message || 'नेटवर्क समस्या के कारण कमरा नहीं बन सका।',
        type: 'error',
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Upgrade Voice Room Tier (Normal -> Silver / Gold / Diamond Advance Room)
  const handleUpgradeRoomTier = async (tierId: VoiceRoomTierId) => {
    try {
      const res = await api.upgradeVoiceRoomTier(currentRoomId, user.userId, tierId);
      if (!res?.success) {
        showToast(res?.message || 'रूम अपग्रेड नहीं हो सका', 'error');
        if (res?.message?.toLowerCase().includes('coin')) {
          setActiveTab('recharge_convert');
        }
        return;
      }
      if (res.user) onUpdateUser(res.user);
      if (res.room) setActiveRoomDetail(res.room);
      await loadVoiceRoomData(currentRoomId);
      playSynthesizedChime('win');
      confetti({ particleCount: 110, spread: 80 });
      showToast(res.message || '👑 Advance Room Tier अनलॉक हो गया!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'रूम अपग्रेड त्रुटि', 'error');
    }
  };

  // Live PK Battle Controls inside Voice Room
  const handleStartPk = async () => {
    try {
      const res = await api.startVoiceRoomPk(currentRoomId, user.userId);
      if (!res?.success) {
        showToast(res?.message || 'PK शुरू नहीं हो सका', 'error');
        return;
      }
      if (res.room) setActiveRoomDetail(res.room);
      await loadVoiceRoomData(currentRoomId);
      playSynthesizedChime('win');
      showToast(res.message || '⚔️ Live PK Battle शुरू हो गया!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'PK शुरू करने में त्रुटि', 'error');
    }
  };

  const handleVotePk = async (side: 'red' | 'blue', coins = 10) => {
    if ((user.coins || 0) < coins) {
      showToast(`PK वोट के लिए ${coins} Coins चाहिए — कृपया कॉइन्स खरीदें!`, 'error');
      setActiveTab('recharge_convert');
      return;
    }
    try {
      const res = await api.voteVoiceRoomPk(currentRoomId, user.userId, side, coins);
      if (!res?.success) {
        showToast(res?.message || 'PK वोट नहीं जुड़ सका', 'error');
        return;
      }
      if (res.user) onUpdateUser(res.user);
      if (res.room) setActiveRoomDetail(res.room);
      playSynthesizedChime('gift');
      showToast(res.message || '⚡ PK Boost जुड़ा!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'PK वोट त्रुटि', 'error');
    }
  };

  const handleEndPk = async () => {
    try {
      const res = await api.endVoiceRoomPk(currentRoomId, user.userId);
      if (!res?.success) {
        showToast(res?.message || 'PK समाप्त नहीं हो सका', 'error');
        return;
      }
      if (res.room) setActiveRoomDetail(res.room);
      await loadVoiceRoomData(currentRoomId);
      confetti({ particleCount: 90, spread: 70 });
      showToast(res.message || '🏁 PK Battle समाप्त!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'PK समाप्त करने में त्रुटि', 'error');
    }
  };

  // Room Atmosphere Effects + Red & Blue Packet Rain + Rapid Gift Combo Handler
  const handleSetRoomEffect = async (effect: RoomAtmosphereEffect) => {
    try {
      const res = await api.setVoiceRoomEffect(currentRoomId, user.userId, effect);
      if (res?.roomPayload) applyVoiceRoomPayload(res.roomPayload);
      sound8D.play8DChime(660, 'win');
      showToast(`✨ रूम इफ़ेक्ट सेट हुआ: ${effect.toUpperCase()}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'रूम इफ़ेक्ट अपडेट नहीं हो सका', 'error');
    }
  };

  const handleDropPacket = async (
    packetType: 'red' | 'blue',
    totalCoins: number,
    maxClaims: number,
    message: string
  ) => {
    try {
      const res = await api.dropVoiceRoomPacket(currentRoomId, {
        userId: user.userId,
        packetType,
        totalCoins,
        maxClaims,
        message,
      });
      if (!res?.success) {
        showToast(res?.message || 'पैकेट बारिश शुरू नहीं हो सकी', 'error');
        if (res?.message?.toLowerCase().includes('coin')) setActiveTab('recharge_convert');
        return;
      }
      if (res.user) onUpdateUser(res.user);
      if (res.roomPayload) applyVoiceRoomPayload(res.roomPayload);
      sound8D.playGiftSound(packetType === 'blue' ? 'blue_packet' : 'red_packet', 2);
      confetti({ particleCount: 110, spread: 90 });
      showToast(res.message || '🧧 पैकेट बारिश शुरू हो गई!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'पैकेट बारिश में त्रुटि', 'error');
    }
  };

  const handleClaimPacket = async (packet: RoomPacketDrop) => {
    try {
      const res = await api.claimVoiceRoomPacket(currentRoomId, user.userId, packet.id);
      if (!res?.success) {
        showToast(res?.message || 'पैकेट क्लेम नहीं हो सका', 'info');
        return;
      }
      if (res.user) onUpdateUser(res.user);
      if (res.roomPayload) applyVoiceRoomPayload(res.roomPayload);
      sound8D.playGiftSound(packet.packetType === 'blue' ? 'blue_packet' : 'red_packet', 3);
      confetti({ particleCount: 80, spread: 70 });
      showToast(res.message || `🎉 +${res.coinsWon} Coins मिले!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'पैकेट लूटने में त्रुटि', 'error');
    }
  };

  const executeGiftSend = async (
    gift: AppGiftItem,
    count: number,
    target: string,
    explicitTargetUserId?: string,
    settingsUsed: GiftComboSettings = comboSettings
  ) => {
    const cost = gift.coinCost * count;
    if ((user.coins || 0) < cost) {
      showToast(`पर्याप्त कॉइन्स नहीं हैं (${cost} Coins चाहिए)!`, 'error');
      setRapidComboTarget(null);
      setActiveTab('recharge_convert');
      return;
    }

    const baseCharms = gift.charmValue * count;
    const { newCombo, multiplier, bonusCharms, totalCharmsAwarded, windowMs } = registerGiftCombo(
      baseCharms,
      gift.hindiName,
      settingsUsed.windowSeconds
    );
    try {
      const res = await api.sendRoomGift(
        user.userId,
        target,
        gift.id,
        `${count}x ${gift.name}`,
        cost,
        totalCharmsAwarded,
        gift.icon,
        explicitTargetUserId,
        count,
        { context: 'voice_room', roomId: currentRoomId }
      );
      const updatedCoins = res?.coins ?? Math.max(0, (user.coins || 0) - cost);
      onUpdateUser({
        ...user,
        coins: updatedCoins,
        charms: (user.charms || 0) + Math.round(totalCharmsAwarded * 0.2),
      });
      if (res?.roomPayload) {
        applyVoiceRoomPayload(res.roomPayload);
      }
      if (settingsUsed.soundEnabled) {
        sound8D.playGiftSound(gift.id || gift.animationType, newCombo);
      }
      setActiveGiftAnimation({
        id: `appgift-${Date.now()}`,
        senderName: user.fullName,
        senderAvatar: user.avatar,
        recipientName: target,
        giftIcon: gift.icon,
        giftName: gift.name,
        quantity: count,
        coinCost: cost,
        comboCount: newCombo,
        contextLabel: `Voice Room #${activeRoomAddress}`,
      });

      const comboText = newCombo >= 2 ? `🔥 [COMBO x${newCombo}! ${multiplier}x] (+${bonusCharms} Bonus!)` : '';
      setGiftAnnouncement(`🎁 ${user.fullName} ने ${target} को ${count}x ${gift.hindiName} भेजा! (+${totalCharmsAwarded}✨) ${comboText}`);

      if (settingsUsed.showRapidButton) {
        setRapidComboTarget({
          gift,
          count,
          targetName: target,
          targetUserId: explicitTargetUserId,
          comboStreak: newCombo,
          expiresAt: Date.now() + windowMs,
          windowMs,
          remainingMs: windowMs,
        });
      }
      setTimeout(() => setGiftAnnouncement(null), 4500);
    } catch (err: any) {
      showToast(err?.message || 'गिफ्ट भेजने में समस्या आई।', 'error');
      setRapidComboTarget(null);
      setActiveTab('recharge_convert');
    }
  };

  const handleLaunchGameByKey = (gameKey: string) => {
    if (gameKey === 'spy') {
      setShowSpyGameModal(true);
    } else if (gameKey === 'werewolf') {
      setShowWerewolfModal(true);
    } else if (gameKey === 'spin') {
      setShowFortuneSpinModal(true);
    } else if (gameKey === 'bingo' || gameKey === 'cards' || gameKey === 'snake') {
      setActiveBoardGameModal(gameKey);
    } else {
      setActiveInteractiveGame(gameKey as GameKey);
    }
  };

  const handleJoinAndSwitchRoom = async (roomObj: any, passcode?: string) => {
    if (!roomObj?.id) return;
    const isLockedForMe =
      roomObj.isPrivate &&
      roomObj.hostUserId !== user.userId &&
      !(Array.isArray(roomObj.audience) && roomObj.audience.includes(user.userId));

    if (isLockedForMe && !passcode) {
      setPrivatePasscodePrompt({ room: roomObj, passcode: '' });
      return;
    }

    try {
      const res = await api.joinVoiceRoom(roomObj.id, user.userId, passcode);
      if (res && res.success) {
        setPrivatePasscodePrompt(null);
        playSynthesizedChime('click');
        setCurrentRoomId(roomObj.id);
        setShowRoomsModal(false);
        applyVoiceRoomPayload(res);
        setActiveTab('voice_room');
        showToast(`✅ आप "${res.room?.title || roomObj.title}" में शामिल हो गए!`, 'success');
      } else if (privatePasscodePrompt) {
        setPrivatePasscodePrompt({ ...privatePasscodePrompt, error: res?.message || 'गलत पासकोड' });
      } else {
        showToast(res?.message || 'रूम जॉइन नहीं हो सका', 'error');
      }
    } catch (err: any) {
      if (privatePasscodePrompt) {
        setPrivatePasscodePrompt({ ...privatePasscodePrompt, error: err?.message || 'पासकोड त्रुटि' });
      } else {
        showToast(err?.message || 'रूम जॉइन करने में समस्या आई', 'error');
      }
    }
  };

  const handleSwitchRoom = (roomId: string) => {
    const found = availableRooms.find((r) => r.id === roomId);
    if (found) {
      handleJoinAndSwitchRoom(found);
      return;
    }
    playSynthesizedChime('click');
    setCurrentRoomId(roomId);
    setShowRoomsModal(false);
    loadVoiceRoomData(roomId);
  };

  const handleJoinCurrentRoom = async () => {
    if (!activeRoomDetail && !currentRoomId) return;
    if (
      activeRoomDetail?.isPrivate &&
      activeRoomDetail.hostUserId !== user.userId &&
      !(Array.isArray(activeRoomDetail.audience) && activeRoomDetail.audience.includes(user.userId))
    ) {
      setPrivatePasscodePrompt({ room: activeRoomDetail, passcode: '' });
      return;
    }
    try {
      const res = await api.joinVoiceRoom(currentRoomId, user.userId);
      if (res?.success) {
        applyVoiceRoomPayload(res);
        playSynthesizedChime('win');
        showToast(`✅ आप रूम (${activeRoomAddress}) में जुड़ गए हैं!`, 'success');
      } else {
        showToast(res?.message || 'रूम जॉइन नहीं हो सका', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'रूम जॉइन करने में त्रुटि', 'error');
    }
  };

  const handleToggleFollowRoom = async (targetRoomId = currentRoomId) => {
    try {
      const res = await api.toggleFollowVoiceRoom(targetRoomId, user.userId);
      if (res?.success) {
        if (targetRoomId === currentRoomId) {
          setActiveRoomDetail((prev) =>
            prev
              ? {
                  ...prev,
                  isFollowed: res.isFollowed,
                  followersCount: res.followersCount,
                }
              : prev
          );
        }
        setAvailableRooms((prev) =>
          prev.map((r) =>
            r.id === targetRoomId
              ? { ...r, isFollowed: res.isFollowed, followersCount: res.followersCount }
              : r
          )
        );
        if (Array.isArray(res.followedRooms)) {
          onUpdateUser({ ...user, followedRooms: res.followedRooms });
        }
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'फॉलो अपडेट नहीं हो सका', 'error');
    }
  };

  // Host Controls: Update Topic
  const handleHostUpdateTopic = async () => {
    if (!editTopicInput.trim()) return;
    try {
      await api.manageVoiceSeatHostAction({
        roomId: currentRoomId,
        hostUserId: user.userId,
        action: 'update_topic',
        newTopic: editTopicInput.trim(),
      });
      setActiveRoomTopic(editTopicInput.trim());
      setShowHostSettingsModal(false);
      setEditTopicInput('');
      playSynthesizedChime('click');
      setSoundEffectToast(`🎙️ टॉपिक अपडेट हुआ: "${editTopicInput.trim()}"`);
      setTimeout(() => setSoundEffectToast(null), 4000);
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'टॉपिक अपडेट नहीं हो सका');
      setTimeout(() => setSoundEffectToast(null), 4000);
    }
  };

  // Unified Host Seat Action (mute, unmute, kick, lock_seat, unlock_seat) — always 0-based index!
  const handleHostSeatAction = async (
    action: 'mute' | 'unmute' | 'kick' | 'lock_seat' | 'unlock_seat',
    seatIdx: number
  ) => {
    try {
      const activeHostId = user.userId || user.id || 'ESP-GUEST-01';
      const res = await api.manageVoiceSeatHostAction({
        roomId: currentRoomId,
        hostUserId: activeHostId,
        action,
        seatIndex: seatIdx,
      });
      if (res && res.seats) {
        setSeats(res.seats);
      }
      if (res?.room) {
        setActiveRoomDetail(res.room);
      }
      playSynthesizedChime('click');
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'एक्शन नहीं लिया जा सका');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  const handleHostMuteSeat = (seatIdx: number, mute: boolean) =>
    handleHostSeatAction(mute ? 'mute' : 'unmute', seatIdx);

  const handleHostKickSeat = (seatIdx: number) =>
    handleHostSeatAction('kick', seatIdx);

  const handleSetYouTubeVideo = async (youtubeUrl: string) => {
    try {
      const res = await api.updateVoiceRoomDesign(currentRoomId, {
        userId: user.userId,
        stageLayout: 'watch_party',
        youtubeVideoUrl: youtubeUrl,
      });
      if (res?.success) {
        applyVoiceRoomPayload(res);
        showToast('📺 YouTube Watch Party रूम में अपडेट हो गई!', 'success');
      } else {
        showToast(res?.message || 'YouTube लिंक अपडेट नहीं हो सका', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'वीडियो सेट करने में त्रुटि', 'error');
    }
  };

  // Sound effects action
  const playSoundEffect = (emoji: string, label: string) => {
    playSynthesizedChime('applause');
    setSoundEffectToast(`${emoji} ${label}`);
    setTimeout(() => setSoundEffectToast(null), 2500);

    const activeUserId = user.userId || user.id || 'ESP-GUEST-01';
    api.sendVoiceRoomChat(activeUserId, `played sound effect: ${emoji} ${label}`, false, currentRoomId).then(res => {
      if (res && res.chatMessages) {
        setRoomChatMessages(res.chatMessages);
      }
    }).catch(() => {});
  };

  // Open ESP PLAY-style User Profile Sheet Modal (Real Profile, Cover, Moments, Gift Wall, @Username, Add Friend)
  const openUserProfileSheet = (
    targetId?: string,
    fallback?: Partial<RichProfileData> | null,
    mode: 'view' | 'edit' | 'search' = 'view'
  ) => {
    setProfileSheetState({
      isOpen: true,
      targetUserId: targetId || user.userId,
      initialProfile: fallback || null,
      initialMode: mode,
    });
  };

  // Open Real Player Digital Profile Modal
  const handleOpenPlayerModal = (userId: string, fallback?: Partial<RealPlayerProfile>) => {
    openUserProfileSheet(userId, (fallback as Partial<RichProfileData>) || null, 'view');
  };

  // Real Seat Grab Action
  const handleTakeSeat = async (seatIdx: number) => {
    playSynthesizedChime('click');
    try {
      const activeUserId = user.userId || user.id || 'ESP-GUEST-01';
      const res = await api.takeVoiceSeat(activeUserId, seatIdx, currentRoomId);
      if (res && res.success && res.seats) {
        setSeats(res.seats);
        setMySeatIndex(seatIdx);
        setIsSpeakingNow(true);
        if (res.chatMessages) {
          setRoomChatMessages(res.chatMessages);
        }
        // Auto-prompt to enable microphone if not yet enabled
        if (micPermission !== 'granted') {
          enableMicrophone();
        }
      } else if (res && !res.success) {
        setSoundEffectToast(res.message || 'सीट उपलब्ध नहीं है।');
        setTimeout(() => setSoundEffectToast(null), 3000);
      }
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'सीट लेने में समस्या आई।');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  const handleLeaveSeat = async () => {
    if (mySeatIndex === null) return;
    playSynthesizedChime('click');
    try {
      const res = await api.leaveVoiceSeat(user.userId, currentRoomId);
      if (res && res.success && res.seats) {
        setSeats(res.seats);
        setMySeatIndex(null);
        setIsSpeakingNow(false);
        if (res.chatMessages) {
          setRoomChatMessages(res.chatMessages);
        }
      }
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'सीट छोड़ने में समस्या आई।');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  // Quick Preset Speech Phrase Action
  const handleSendQuickPhrase = async (phrase: string) => {
    playSynthesizedChime('click');
    speakMessage(phrase);
    try {
      const res = await api.sendVoiceRoomChat(user.userId, phrase, false, currentRoomId);
      if (res && res.success && res.chatMessages) {
        setRoomChatMessages(res.chatMessages);
      }
    } catch (err) {
      console.warn('Failed to send phrase', err);
    }
  };

  // Real Room Chat Send (shared by form & VoiceRoomStageCanvas)
  const handleSendChatText = async (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    try {
      const res = await api.sendVoiceRoomChat(user.userId, text, false, currentRoomId);
      if (res && res.success && res.chatMessages) {
        setRoomChatMessages(res.chatMessages);
      }
    } catch (err) {
      console.warn('Failed to send chat', err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    await handleSendChatText(text);
  };

  // Send Luxury Gift Action with Full-Screen Spectacular Visual Effect
  const handleSendGift = async (targetOverride?: string) => {
    if (!selectedGift) return;
    const finalTarget = targetOverride || giftTarget;

    if ((user.coins || 0) < selectedGift.coinCost) {
      setSoundEffectToast(`पर्याप्त सिक्के नहीं हैं! इस गिफ्ट के लिए ${selectedGift.coinCost} सिक्के चाहिए। कृपया रिचार्ज करें।`);
      setTimeout(() => setSoundEffectToast(null), 4000);
      setActiveTab('recharge_convert');
      setShowGiftModal(false);
      setSelectedSeatAction(null);
      return;
    }

    try {
      // Register Gift Combo and calculate combo multiplier bonus
      const { newCombo, multiplier, bonusCharms, totalCharmsAwarded } = registerGiftCombo(
        selectedGift.charmValue,
        selectedGift.name
      );

      const res = await api.sendRoomGift(
        user.userId,
        finalTarget,
        selectedGift.id,
        selectedGift.name,
        selectedGift.coinCost,
        totalCharmsAwarded,
        selectedGift.icon,
        giftTargetUserId,
        1,
        { context: 'voice_room', roomId: currentRoomId }
      );

      playSynthesizedChime(newCombo >= 2 ? 'win' : 'gift');

      if (res?.roomPayload) {
        applyVoiceRoomPayload(res.roomPayload);
      }

      // Trigger full visual animation
      setActiveGiftAnimation({
        id: `gift-${Date.now()}`,
        senderName: user.fullName,
        senderAvatar: user.avatar,
        recipientName: finalTarget,
        giftIcon: selectedGift.icon,
        giftName: selectedGift.name,
        quantity: 1,
        coinCost: selectedGift.coinCost,
        contextLabel: `Voice Room #${activeRoomAddress}`,
      });

      const comboText = newCombo >= 2 ? `🔥 [COMBO x${newCombo}! ${multiplier}x] (+${bonusCharms} BONUS CHARMS!)` : '';
      setGiftAnnouncement(`🎁 [LIVE GIFTING] ${user.fullName} ने ${finalTarget} को ${selectedGift.name} (${selectedGift.icon}) भेंट किया! (+${totalCharmsAwarded} Charms ✨) ${comboText}`);

      // Update user coins and charms with combo bonus
      onUpdateUser({
        ...user,
        coins: res.coins,
        charms: (user.charms || 0) + totalCharmsAwarded,
      });

      // Add to room chat if server didn't already append
      if (!res?.roomPayload) {
        setRoomChatMessages(prev => [
          ...prev,
          {
            id: `gift-${Date.now()}`,
            senderId: user.userId,
            sender: newCombo >= 2 ? `🔥 COMBO x${newCombo}` : 'LUXURY GIFT',
            isGift: true,
            text: `🎁 [LIVE GIFT] ${user.fullName} gifted ${selectedGift.name} ${selectedGift.icon} to ${finalTarget}! (+${totalCharmsAwarded} Charms ✨ ${comboText})`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

      setShowGiftModal(false);
      setSelectedSeatAction(null);

      setTimeout(() => {
        setGiftAnnouncement(null);
      }, 5000);
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'गिफ्ट भेजने में समस्या आई।');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  // Play Coin Game Action (Spin / Dice / Coin Flip)
  const handlePlayGame = async (gameOverride?: string, choiceOverride?: string) => {
    if (isGameSpinning) return;
    if ((user.coins || 0) < betAmount) {
      setSoundEffectToast(`सिक्के कम हैं! असली टास्क (+5 Coins) पूरे करें या कॉइन्स खरीदें।`);
      setTimeout(() => setSoundEffectToast(null), 3500);
      setActiveTab('recharge_convert');
      return;
    }

    setIsGameSpinning(true);
    setGameResultToast(null);

    let gameTitle = gameOverride || (selectedGame === 'dice' ? 'Lucky Dice' : selectedGame === 'coin_flip' ? 'Coin Flip' : 'Spin & Win');
    let choiceVal = choiceOverride || (selectedGame === 'dice' ? diceChoice : selectedGame === 'coin_flip' ? coinChoice : undefined);

    if (gameTitle === 'Spin & Win') {
      const extraDegree = 360 * 5 + Math.floor(Math.random() * 360);
      setSpinRotation(prev => prev + extraDegree);
    }

    try {
      await new Promise(r => setTimeout(r, 1200));

      const res = await api.playCoinGame(user.userId, gameTitle, betAmount, choiceVal);

      if (res.diceValues) {
        setDiceValues(res.diceValues);
      }
      if (res.coinResult) {
        setCoinResultState(res.coinResult);
      }

      const isWin = res.result === 'win';
      if (isWin) {
        playSynthesizedChime('win');
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.7 }
        });
      }

      setGameResultToast({
        message: res.message,
        isWin,
        coins: Math.abs(res.netChange),
      });

      onUpdateUser({
        ...user,
        coins: res.newBalance,
        gameXp: res.gameXp,
        gameLevel: res.gameLevel,
      });

      // Broadcast game result in stage chat
      setRoomChatMessages(prev => [
        ...prev,
        {
          id: `game-${Date.now()}`,
          senderId: user.userId,
          sender: 'GAME ARENA',
          text: `🎲 ${user.fullName} played ${gameTitle} (${betAmount} Coins) -> Result: ${isWin ? `WIN (+${res.winAmount} 🪙)` : 'LOSS'}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      showToast(err?.message || 'गेम खेलने में समस्या आई।', 'error');
    } finally {
      setIsGameSpinning(false);
    }
  };

  // Fetch User's Coin Recharges
  const loadUserRecharges = async () => {
    try {
      const res: any = await api.getUserCoinRecharges(user.userId);
      const list = Array.isArray(res) ? res : (res?.recharges || []);
      setUserRecharges(list);
    } catch (e) {
      console.warn('Failed to fetch user recharges', e);
    }
  };

  useEffect(() => {
    loadUserRecharges();
  }, [user.userId]);

  const handleRechargeScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRechargeError(null);
    if (file.size > 8 * 1024 * 1024) {
      setRechargeError('स्क्रीनशॉट का साइज़ 8MB से कम होना चाहिए।');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const rawDataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 960;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            setRechargeScreenshot(canvas.toDataURL('image/jpeg', 0.78));
          } else {
            setRechargeScreenshot(rawDataUrl);
          }
        } catch {
          setRechargeScreenshot(rawDataUrl);
        }
      };
      img.onerror = () => setRechargeScreenshot(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Real UPI Recharge Coins (12-Digit UTR + Payment Screenshot Required)
  const handleRechargeCoins = async () => {
    setRechargeError(null);
    setRechargeSuccess(null);
    const cleanUtr = (rechargeUtr || '').trim();

    if (!cleanUtr) {
      setRechargeError('कृपया UPI भुगतान के बाद बैंक या ऐप से प्राप्त 12-अंकों का UPI UTR / Ref No दर्ज करें।');
      return;
    }

    if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setRechargeError('कृपया सही 12-अंकों का UPI UTR (12 Digits Reference Number) दर्ज करें।');
      return;
    }

    if (!rechargeScreenshot || rechargeScreenshot.trim().length < 20) {
      setRechargeError('कृपया UPI भुगतान के बाद पेमेंट स्क्रीनशॉट (Payment Screenshot) जरूर अपलोड करें।');
      return;
    }

    setIsRecharging(true);
    try {
      await api.rechargeCoins(
        user.userId,
        selectedPack.coins,
        selectedPack.amount,
        cleanUtr,
        selectedPack.bonus,
        selectedPack.id,
        rechargeScreenshot
      );

      setRechargeSuccess(
        `✅ आपका रिचार्ज अनुरोध दर्ज कर लिया गया है (UTR: ${cleanUtr}) व पेमेंट स्क्रीनशॉट एडमिन पैनल में भेज दिया गया है! सत्यापन के बाद आपके प्रोफाइल में +${selectedPack.coins + selectedPack.bonus} सिक्के क्रेडिट कर दिए जाएंगे।`
      );
      setRechargeUtr('');
      setRechargeScreenshot('');
      playSynthesizedChime('win');
      loadUserRecharges();
    } catch (err: any) {
      setRechargeError(err?.message || 'रिचार्ज सबमिट करने में समस्या आई।');
    } finally {
      setIsRecharging(false);
    }
  };

  // Avatar & Status Frame Customizer Save Handler
  const handleSaveAvatarCustomization = (
    avatarUrl: string, 
    frameType: string, 
    statusTitle: string,
    newName?: string,
    newBio?: string
  ) => {
    const updatedUser = {
      ...user,
      avatar: avatarUrl,
      frameType: frameType as any,
      vipTitle: statusTitle,
      fullName: newName?.trim() || user.fullName,
      bio: newBio?.trim() || user.bio,
    };
    onUpdateUser(updatedUser);
    api.setStoredUser(updatedUser);
    api.updateUserProfile(user.userId, {
      fullName: updatedUser.fullName,
      bio: updatedUser.bio,
    }).catch(console.warn);
    try {
      localStorage.setItem(`esp_avatar_${user.userId}`, avatarUrl);
      localStorage.setItem(`esp_frame_${user.userId}`, frameType);
      localStorage.setItem(`esp_viptitle_${user.userId}`, statusTitle);
    } catch {}
    playSynthesizedChime('win');
    confetti({ particleCount: 100, spread: 70 });
    setSoundEffectToast(`✨ नया अवतार और प्रोफाइल डिटेल्स सफलतापूर्वक सेव हुई!`);
    setTimeout(() => setSoundEffectToast(null), 3500);
  };

  // Daily Missions Action Runner
  const handlePerformDailyMissionAction = (actionKey: 'moments' | 'idcard' | 'voice' | 'spin' | 'gift' | 'clans') => {
    if (actionKey === 'moments') {
      setSoundEffectToast('📸 मोमेंट्स फीड खुल गया है!');
      setTimeout(() => setSoundEffectToast(null), 3000);
    } else if (actionKey === 'idcard') {
      if (onOpenCardModal) {
        onOpenCardModal();
      } else {
        setSoundEffectToast('🪪 ID कार्ड खोला जा रहा है...');
        setTimeout(() => setSoundEffectToast(null), 3000);
      }
    } else if (actionKey === 'voice') {
      setActiveTab('voice_room');
      setShowDailyMissionsModal(false);
      setSoundEffectToast('🎙️ वॉइस रूम स्टेज में आपका स्वागत है!');
      setTimeout(() => setSoundEffectToast(null), 3000);
    } else if (actionKey === 'spin') {
      setShowFortuneSpinModal(true);
      setShowDailyMissionsModal(false);
    } else if (actionKey === 'gift') {
      setShowAppGiftModal(true);
      setShowDailyMissionsModal(false);
    } else if (actionKey === 'clans') {
      setActiveTab('clan_friends');
      setShowTopClansModal(true);
      setShowDailyMissionsModal(false);
    }
  };

  const isDarkStageBg =
    Boolean(roomBgTheme?.bgImageUrl) ||
    (roomBgTheme?.id !== 'default_dark' && roomBgTheme?.id !== 'default');

  return (
    <div className={`w-full flex flex-col items-center relative overflow-x-hidden pb-28 ${activeTab === 'games' ? 'bg-[#f8fbff] text-[#212121]' : 'bg-[#f1f3f6] text-[#212121]'}`}>
      
      {/* ============================================================== */}
      {/* 1. FULL-SCREEN SPECTACULAR LIVE GIFTING VISUAL EFFECTS         */}
      {/* ============================================================== */}
      <GiftAnimationOverlay
        animation={activeGiftAnimation}
        onComplete={() => setActiveGiftAnimation(null)}
      />

      {/* Floating Dynamic Gift Combo Badge & Multiplier Overlay */}
      {giftComboBanner && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-none animate-bounce">
          <div className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 border-2 border-yellow-300 shadow-[0_0_40px_rgba(245,158,11,0.85)] text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl animate-spin">🔥</span>
              <span className="text-xl sm:text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">
                GIFT COMBO x{giftComboBanner.combo}!
              </span>
              <span className="text-2xl animate-spin">🔥</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-yellow-200 mt-0.5">
              +{giftComboBanner.bonusCharms} BONUS CHARM POINTS ({giftComboBanner.multiplier}x Multiplier!)
            </p>
            <div className="mt-1 text-[11px] font-mono font-bold text-white/90">
              Total Charms Awarded: +{giftComboBanner.totalCharmsEarned} ✨
            </div>
          </div>
        </div>
      )}

      {/* Post-Send Interactive Rapid-Tap Combo Button (appears after sending a gift when enabled) */}
      {rapidComboTarget && (
        <div className="fixed bottom-24 right-4 z-[65] flex flex-col items-end gap-1.5">
          <button
            type="button"
            disabled={rapidComboBusy}
            onClick={async () => {
              if (rapidComboBusy) return;
              setRapidComboBusy(true);
              try {
                await executeGiftSend(
                  rapidComboTarget.gift,
                  rapidComboTarget.count,
                  rapidComboTarget.targetName,
                  rapidComboTarget.targetUserId,
                  comboSettings
                );
              } finally {
                setRapidComboBusy(false);
              }
            }}
            className="group relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-600 via-amber-500 to-orange-600 border-4 border-yellow-300 shadow-[0_0_35px_rgba(245,158,11,0.85)] text-white flex flex-col items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition"
          >
            <span className="text-2xl leading-none drop-shadow">{rapidComboTarget.gift.icon}</span>
            <span className="text-xs font-black tracking-tight mt-0.5">
              COMBO x{rapidComboTarget.comboStreak + 1}
            </span>
            <span className="text-[9px] font-mono font-bold text-yellow-100">
              🪙 {rapidComboTarget.gift.coinCost * rapidComboTarget.count}c · {Math.ceil(rapidComboTarget.remainingMs / 1000)}s
            </span>
          </button>
          <button
            type="button"
            onClick={() => setRapidComboTarget(null)}
            className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold cursor-pointer border border-white/20"
          >
            Close Combo ✕
          </button>
        </div>
      )}



      {/* Top Gaming Profile Ribbon - Only shown when NOT in ESP PLAY Home Games view */}
      {activeTab !== 'games' && (
        <div className="w-full bg-white border-b border-slate-200 px-3 sm:px-4 py-2.5 sm:py-3 relative z-10 shadow-xs text-[#212121]">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
            {/* User Address & Gaming Identity with Equipped Status Frame */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
              <div
                className="relative cursor-pointer group shrink-0"
                onClick={() => openUserProfileSheet(user.userId, user as Partial<RichProfileData>, 'view')}
                title="Click to View & Edit ESP PLAY Profile, Cover Photo & Unique @Username"
              >
                <AvatarFrame
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt={user.fullName}
                  size="md"
                  frameType={(user.frameType as any) || 'standard'}
                  level={user.gameLevel || 1}
                  showCrown={user.frameType === 'clan-leader' || user.frameType === 'royal-dragon-crown' || user.frameType === 'mythic-crimson'}
                />
                <span className="absolute -top-1 -right-1 text-[10px] bg-[#2874f0] rounded-full w-4 h-4 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition shadow">
                  ✏️
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    onClick={() => openUserProfileSheet(user.userId, user as Partial<RichProfileData>, 'view')}
                    className="font-bold text-[#212121] text-sm tracking-wide cursor-pointer hover:text-[#2874f0] transition truncate max-w-full"
                  >
                    {user.fullName}
                  </span>
                  {user.username && (
                    <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono text-[10px] px-1.5 sm:px-2 py-0.5 rounded-sm font-bold whitespace-nowrap">
                      @{user.username}
                    </span>
                  )}
                  {user.accountType !== 'gamer' && (
                    <span className="bg-[#f5f8ff] text-[#2874f0] border border-blue-200 font-mono text-[10px] px-1.5 sm:px-2 py-0.5 rounded-sm font-bold whitespace-nowrap">
                      💼 ESP: {user.userId}
                    </span>
                  )}
                  <span className="bg-amber-50 text-[#fb641b] border border-amber-200 font-mono text-[10px] px-1.5 sm:px-2 py-0.5 rounded-sm font-bold whitespace-nowrap">
                    🎮 GAME: {user.gamingId || `ESPGT${user.userId.replace(/[^a-zA-Z0-9]/g, '').slice(-4) || '01'}`}
                  </span>
                  {user.vipTitle && (
                    <span className="text-[9px] px-1.5 sm:px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] font-bold whitespace-nowrap">
                      {user.vipTitle}
                    </span>
                  )}
                </div>
                <div className="text-[10.5px] sm:text-[11px] text-[#878787] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => loadMyPersonalRoom(true)}
                    className="text-[#2874f0] hover:underline font-mono font-bold cursor-pointer whitespace-nowrap"
                    title="अपने फिक्स्ड पर्सनल वॉइस रूम में जाएं"
                  >
                    🏠 {cleanUserRoomFallback}
                  </button>
                  <span>•</span>
                  <span className="text-[#388e3c] font-semibold truncate">{user.clanName || 'Royal Warriors ESP'}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Feature Triggers (Always legible across mobile & desktop) */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setShowDailyMissionsModal(true)}
                className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] flex items-center space-x-1 transition cursor-pointer whitespace-nowrap"
                title="Open Daily Missions"
              >
                <span>🎯</span>
                <span>Missions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('clan_friends');
                  setShowTopClansModal(true);
                }}
                className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 flex items-center space-x-1 transition cursor-pointer whitespace-nowrap"
                title="View Top 5 Clans"
              >
                <span>🛡️</span>
                <span>Clans</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarCustomizerModal(true)}
                className="px-2 sm:px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center space-x-1 transition cursor-pointer whitespace-nowrap"
                title="Customize Avatar & Frame"
              >
                <span>🎨</span>
                <span>Avatar</span>
              </button>

              <div className="bg-[#f9fafb] px-2.5 py-1 rounded-md border border-slate-200 flex items-center space-x-1.5 min-h-[34px]">
                <span className="text-sm sm:text-base">🪙</span>
                <div className="leading-tight">
                  <div className="text-[8.5px] text-[#878787] font-semibold">Coins</div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#212121] tabular-nums">
                    {(user.coins || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-[#f9fafb] px-2.5 py-1 rounded-md border border-slate-200 flex items-center space-x-1.5 min-h-[34px]">
                <span className="text-sm sm:text-base">✨</span>
                <div className="leading-tight">
                  <div className="text-[8.5px] text-[#878787] font-semibold">Charms</div>
                  <div className="text-[11px] sm:text-xs font-bold text-[#fb641b] tabular-nums">
                    {user.charms || 0}
                  </div>
                </div>
              </div>

              {user.accountType !== 'gamer' && (
                <div className="bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center space-x-1.5 min-h-[34px]">
                  <span className="text-sm sm:text-base font-bold text-[#388e3c]">₹</span>
                  <div className="leading-tight">
                    <div className="text-[8.5px] text-[#388e3c] font-semibold">Cash</div>
                    <div className="text-[11px] sm:text-xs font-bold text-[#388e3c] tabular-nums">
                      ₹{(user.balance || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTab('recharge_convert')}
                className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 sm:px-3 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Recharge</span>
              </button>

              {/* Native Full Screen Toggle */}
              <button
                onClick={toggleFullScreen}
                className="px-2.5 sm:px-3 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold bg-[#2874f0] hover:bg-[#1c62d6] text-white transition cursor-pointer shadow-xs flex items-center space-x-1 whitespace-nowrap"
                title={isFullscreen ? 'नॉर्मल स्क्रीन करें' : 'फ़ुल स्क्रीन (Full Screen) करें'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 shrink-0" /> : <Maximize2 className="w-3.5 h-3.5 shrink-0" />}
                <span>{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Subtabs - Only shown when NOT in ESP PLAY Home Games view */}
      {activeTab !== 'games' && (
        <div className="w-full max-w-6xl px-2.5 sm:px-4 mt-3 sm:mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              onClick={() => setActiveTab('games')}
              className="col-span-2 md:col-span-1 py-2.5 px-3 min-h-[46px] rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-white shrink-0" />
              <div className="text-left min-w-0">
                <div className="whitespace-nowrap">ESP PLAY Home</div>
                <div className="text-[9px] font-normal opacity-90 truncate">लॉबी स्क्रीन</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('voice_room')}
              className={`py-2.5 px-2.5 sm:px-3 min-h-[46px] rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all border cursor-pointer ${
                activeTab === 'voice_room'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-[#f5f8ff]'
              }`}
            >
              <Radio className={`w-4 h-4 shrink-0 ${activeTab === 'voice_room' ? 'text-[#ffe500]' : 'text-[#2874f0]'}`} />
              <div className="text-left min-w-0">
                <div className="truncate">Voice Room</div>
                <div className="text-[9px] font-normal opacity-80 truncate">लाइव वॉइस स्टेज</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('recharge_convert')}
              className={`py-2.5 px-2.5 sm:px-3 min-h-[46px] rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all border cursor-pointer ${
                activeTab === 'recharge_convert'
                  ? 'bg-[#388e3c] border-[#388e3c] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-emerald-50'
              }`}
            >
              <ArrowRightLeft className={`w-4 h-4 shrink-0 ${activeTab === 'recharge_convert' ? 'text-white' : 'text-[#388e3c]'}`} />
              <div className="text-left min-w-0">
                <div className="truncate">Buy Coins (UPI)</div>
                <div className="text-[9px] font-normal opacity-80 truncate">असली कॉइन्स खरीदें</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('clan_friends')}
              className={`py-2.5 px-2.5 sm:px-3 min-h-[46px] rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all border cursor-pointer ${
                activeTab === 'clan_friends'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-[#f5f8ff]'
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 ${activeTab === 'clan_friends' ? 'text-[#ffe500]' : 'text-purple-600'}`} />
              <div className="text-left min-w-0">
                <div className="truncate">Family &amp; Friends</div>
                <div className="text-[9px] font-normal opacity-80 truncate">फैमिली, बॉन्ड व दोस्त</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('rewards_tasks')}
              className={`py-2.5 px-2.5 sm:px-3 min-h-[46px] rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all border cursor-pointer ${
                activeTab === 'rewards_tasks'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-amber-50'
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'rewards_tasks' ? 'text-[#ffe500]' : 'text-[#fb641b]'}`} />
              <div className="text-left min-w-0">
                <div className="truncate">Real Tasks (+5 🪙)</div>
                <div className="text-[9px] font-normal opacity-80 truncate">रियल टास्क व EXP</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-6xl px-2.5 sm:px-4 mt-3 sm:mt-4">
        {/* ============================================================== */}
        {/* TAB 1: ESP PLAY PERSONAL FIXED VOICE ROOM STAGE                */}
        {/* ============================================================== */}
        {activeTab === 'voice_room' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
            {/* Left 2 Cols: ESP PLAY Personal Fixed Voice Stage Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <VoiceRoomStageCanvas
                  currentUser={user}
                  room={{
                    ...(activeRoomDetail || {}),
                    id: currentRoomId,
                    title: activeRoomTitle,
                    topic: activeRoomTopic,
                    roomAddress: activeRoomAddress,
                    hostUserId: activeRoomHostId,
                  }}
                  host={voiceRoomHost}
                  seats={seats}
                  chatMessages={roomChatMessages}
                  audienceCount={audienceCount}
                  mySeatIndex={mySeatIndex}
                  hasJoinedRoom={
                    activeRoomHostId === user.userId ||
                    mySeatIndex !== null ||
                    Boolean(activeRoomDetail?.audience?.includes(user.userId))
                  }
                  micPermission={micPermission}
                  micLevel={micLevel}
                  isMicMuted={isMicMuted}
                  isRecordingVoice={isRecordingVoice}
                  recordDuration={recordDuration}
                  autoPlayAudio={autoPlayAudio}
                  currentlyPlayingAudioId={currentlyPlayingAudioId}
                  quickPhrases={PRESET_TALK_PHRASES}
                  onOpenRoomsDirectory={() => {
                    loadAvailableRooms(roomsSearchQuery);
                    setShowRoomsModal(true);
                  }}
                  onJumpToMyPersonalRoom={() => loadMyPersonalRoom(true)}
                  onJoinRoom={handleJoinCurrentRoom}
                  onToggleFollowRoom={() => handleToggleFollowRoom(currentRoomId)}
                  onOpenAudience={() => setShowAudienceModal(true)}
                  onOpenDesignModal={(tab = 'design') =>
                    setDesignModalState({ isOpen: true, tab })
                  }
                  onSeatClick={(seat, idx) => {
                    if (!seat.userId) {
                      if (seat.isLocked) {
                        if (activeRoomHostId === user.userId || user.userId === 'EMO-MOM-MMO') {
                          handleHostSeatAction('unlock_seat', idx);
                        } else {
                          showToast('🔒 यह सीट रूम मालिक द्वारा लॉक की गई है।', 'warning');
                        }
                        return;
                      }
                      // Directly grab seat & request genuine live mic permission (No fake voice changers)
                      handleTakeSeat(idx);
                    } else {
                      handleOpenPlayerModal(seat.userId, {
                        userId: seat.userId,
                        fullName: seat.userName,
                        gameLevel: seat.gameLevel,
                        charms: seat.charms,
                        avatar: seat.userAvatar,
                      });
                    }
                  }}
                  onHostToggleSeatLock={(idx, lock) =>
                    handleHostSeatAction(lock ? 'lock_seat' : 'unlock_seat', idx)
                  }
                  onLeaveSeat={handleLeaveSeat}
                  onOpenOwnerProfile={() =>
                    handleOpenPlayerModal(voiceRoomHost.userId, {
                      userId: voiceRoomHost.userId,
                      fullName: voiceRoomHost.userName,
                      gameLevel: voiceRoomHost.gameLevel,
                      charms: voiceRoomHost.charms,
                      avatar: voiceRoomHost.userAvatar,
                      roleTitle: voiceRoomHost.roleTitle || 'Room Host',
                      roomAddress: activeRoomAddress,
                    })
                  }
                  onToggleAutoPlayAudio={() => setAutoPlayAudio((p) => !p)}
                  onEnableMic={enableMicrophone}
                  onTogglePhysicalMute={handleTogglePhysicalMute}
                  onStartWalkieTalkie={startWalkieTalkie}
                  onStopWalkieTalkie={stopWalkieTalkie}
                  onSendChatText={handleSendChatText}
                  onPlayAudioClip={playAudioClip}
                  onOpenGiftModal={() => {
                    setAppGiftPreset(null);
                    setShowAppGiftModal(true);
                  }}
                  onOpenPacketRainModal={() => {
                    setAppGiftPreset({ category: 'packets' });
                    setShowAppGiftModal(true);
                  }}
                  onClaimPacket={handleClaimPacket}
                  onSetRoomEffect={handleSetRoomEffect}
                  onSetYouTubeVideo={handleSetYouTubeVideo}
                  onCopyFeedback={(msg) => showToast(msg, 'success')}
                  onStartPk={handleStartPk}
                  onVotePk={handleVotePk}
                  onEndPk={handleEndPk}
                  onUpgradeRoomTier={handleUpgradeRoomTier}
                  onOpenRelationships={() => setShowRelationshipsModal(true)}
                  onOpenFamily={() => setShowFamilyHubModal(true)}
                  onQuickOpenMiniGame={() => setShowStageGameOverlay(true)}
                />

                {soundEffectToast && (
                  <div className="absolute top-16 right-4 bg-[#2874f0] text-white font-bold text-xs px-3 py-1.5 rounded-sm shadow-lg animate-bounce z-30">
                    {soundEffectToast}
                  </div>
                )}
              </div>

              {/* Compact Stage Utilities, Soundboard & Mini-Games Strip */}
              <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200 shadow-xs space-y-3 text-[#212121]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setShowCreateRoomModal(true)}
                      className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>नया रूम बनाएं</span>
                    </button>
                    <button
                      onClick={() => setShowStageGameOverlay(!showStageGameOverlay)}
                      className="bg-[#f5f8ff] hover:bg-blue-100 text-[#2874f0] border border-blue-200 px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Stage Games</span>
                    </button>
                    <button
                      onClick={() => setShowWerewolfModal(true)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      🐺 भेड़िया गेम
                    </button>
                    <button
                      onClick={() => setShowSpyGameModal(true)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-[#388e3c] border border-emerald-200 px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      🕵️ जासूस कौन?
                    </button>
                    <button
                      onClick={() => setShowTimedChestModal(true)}
                      className="bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      🎁 8 बॉक्सेज
                    </button>
                    <button
                      onClick={() => setShowFortuneSpinModal(true)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      🎡 24H स्पिन
                    </button>
                    <button
                      onClick={() => setShowLeaderboardModal(true)}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#fb641b] shrink-0" />
                      <span>रैंकिंग</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={testSpeakerAndMic}
                      disabled={isLoopbackTesting}
                      className="px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-[11px] font-bold bg-[#2874f0] hover:bg-[#1c62d6] text-white cursor-pointer whitespace-nowrap"
                    >
                      {isLoopbackTesting ? '🔊 टेस्टिंग...' : '🔊 माइक चेक'}
                    </button>
                    <button
                      onClick={toggleFullScreen}
                      className="px-2.5 py-1.5 min-h-[34px] rounded-md text-[10.5px] sm:text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-[#212121] border border-slate-300 cursor-pointer whitespace-nowrap"
                    >
                      {isFullscreen ? 'नॉर्मल' : '⛶ फुल'}
                    </button>
                  </div>
                </div>

                {loopbackNotice && (
                  <div className="p-2 rounded-sm bg-amber-50 text-amber-800 border border-amber-300 text-xs text-center font-bold">
                    {loopbackNotice}
                  </div>
                )}

                {showStageGameOverlay && (
                  <div className="bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 animate-fadeIn">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs font-bold text-[#212121]">
                        🎮 STAGE MINI-GAME BATTLE (स्टेज पर गेम खेलें)
                      </span>
                      <button
                        onClick={() => setShowStageGameOverlay(false)}
                        className="text-slate-500 hover:text-[#212121] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
                      <button
                        onClick={() => setShowSpyGameModal(true)}
                        className="bg-[#2874f0] hover:bg-[#1c62d6] p-2 rounded-sm text-center text-xs font-bold text-white cursor-pointer"
                      >
                        <div>🕵️ जासूस कौन?</div>
                        <div className="text-[9px] text-blue-100">Who is the Spy</div>
                      </button>
                      <button
                        onClick={() => handlePlayGame('Lucky Dice', 'seven')}
                        disabled={isGameSpinning}
                        className="bg-[#fb641b] hover:bg-[#e8550f] p-2 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🎲 Lucky 7 Dice</div>
                        <div className="text-[9px] text-orange-100">50 Coins • 5x Win</div>
                      </button>
                      <button
                        onClick={() => handlePlayGame('Spin & Win')}
                        disabled={isGameSpinning}
                        className="bg-[#2874f0] hover:bg-[#1c62d6] p-2 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🎡 Instant Spin</div>
                        <div className="text-[9px] text-blue-100">50 Coins • Up to 10x</div>
                      </button>
                      <button
                        onClick={() => handlePlayGame('Coin Flip', 'heads')}
                        disabled={isGameSpinning}
                        className="bg-[#388e3c] hover:bg-emerald-700 p-2 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🪙 Heads Flip</div>
                        <div className="text-[9px] text-emerald-100">50 Coins • 2x Win</div>
                      </button>
                    </div>
                  </div>
                )}

                <VoiceRoomMediaStage
                  isHost={activeRoomHostId === user.userId}
                  onOpenSpyGame={() => setShowSpyGameModal(true)}
                  onOpenWerewolfGame={() => setShowWerewolfModal(true)}
                  onOpenDailySpin={() => setShowDailySpinModal(true)}
                  onOpenStageGameOverlay={() => setShowStageGameOverlay(true)}
                  onSoundboardEffect={playSoundEffect}
                />

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-bold text-[#878787]">Soundboard:</span>
                    <button onClick={() => playSoundEffect('👏', 'Applause')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Clap">👏</button>
                    <button onClick={() => playSoundEffect('🥂', 'Cheers')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Cheers">🥂</button>
                    <button onClick={() => playSoundEffect('🎺', 'Fanfare')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Trumpet">🎺</button>
                    <button onClick={() => playSoundEffect('😂', 'Laugh')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Laugh">😂</button>
                    <button onClick={() => playSoundEffect('🏆', 'Victory')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Trophy">🏆</button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDesignModalState({ isOpen: true, tab: 'invite' })}
                      className="px-2.5 py-1 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>इनवाइट फ्रेंड्स</span>
                    </button>
                    {(activeRoomHostId === user.userId || user.userId === 'EMO-MOM-MMO') && (
                      <button
                        onClick={() => setDesignModalState({ isOpen: true, tab: 'design' })}
                        className="px-2.5 py-1 rounded-sm bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3 h-3" />
                        <span>कस्टम वॉलपेपर व सेटअप</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Live Room Chat Stream with Text-to-Speech */}
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm flex flex-col h-[380px] sm:h-[460px] lg:h-[540px] text-[#212121]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-[#2874f0]" />
                  <span className="font-bold text-sm text-[#212121]">Live Stage Chat</span>
                </div>
                <span className="text-[10px] text-[#878787] font-medium">Real-time • 🔊 TTS</span>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 scrollbar-none">
                {roomChatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-md text-xs relative group border ${
                      msg.isGift
                        ? 'bg-amber-50 border-amber-300 text-[#212121]'
                        : msg.sender === 'SYSTEM' || msg.sender === 'STAGE'
                        ? 'bg-[#f5f8ff] text-[#2874f0] border-blue-200'
                        : 'bg-[#f9fafb] text-[#212121] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold text-[#2874f0] flex items-center space-x-1">
                        <span>{msg.sender}</span>
                        {msg.isVoiceNote && <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-sm font-mono font-bold">VOICE</span>}
                      </span>
                      <div className="flex items-center space-x-1">
                        {!msg.isVoiceNote && (
                          <button
                            onClick={() => speakMessage(msg.text)}
                            className="opacity-70 hover:opacity-100 p-0.5 text-slate-500 hover:text-[#2874f0] cursor-pointer"
                            title="Listen to message via TTS"
                          >
                            <Volume2 className="w-3 h-3 text-[#2874f0]" />
                          </button>
                        )}
                        <span className="text-[#878787] font-mono text-[9px]">{msg.time}</span>
                      </div>
                    </div>

                    {msg.isVoiceNote && msg.audioDataUrl ? (
                      <div className="mt-1.5 flex items-center space-x-2.5 bg-[#f5f8ff] p-2 rounded-md border border-blue-200">
                        <button
                          type="button"
                          onClick={() => playAudioClip(msg.audioDataUrl!, msg.id)}
                          className={`p-2 rounded-sm flex items-center justify-center transition-all cursor-pointer ${
                            currentlyPlayingAudioId === msg.id
                              ? 'bg-[#ffe500] text-[#212121] font-bold animate-pulse'
                              : 'bg-[#2874f0] text-white'
                          }`}
                          title="Play Voice Audio"
                        >
                          {currentlyPlayingAudioId === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-[#212121]">🎙️ Live Voice Message</span>
                            <span className="text-[#878787] font-mono">{msg.audioDuration || 3}s</span>
                          </div>
                          <div className="flex items-center space-x-1 h-3 mt-1">
                            {[...Array(14)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  currentlyPlayingAudioId === msg.id
                                    ? 'bg-[#2874f0] animate-pulse'
                                    : 'bg-slate-300'
                                }`}
                                style={{
                                  height: currentlyPlayingAudioId === msg.id ? `${((i * 6) % 12) + 4}px` : '4px',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="leading-relaxed text-[#212121]">{msg.text}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar with Quick Voice Note Hold Button */}
              <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-200 flex items-center gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Send cheer, question, or talk..."
                  className="flex-1 min-w-0 bg-white border border-slate-300 rounded-md px-2.5 sm:px-3 py-2 text-xs text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
                />
                
                <button
                  type="button"
                  onMouseDown={startWalkieTalkie}
                  onMouseUp={stopWalkieTalkie}
                  onTouchStart={startWalkieTalkie}
                  onTouchEnd={stopWalkieTalkie}
                  className={`p-2 rounded-md border transition cursor-pointer shrink-0 ${
                    isRecordingVoice ? 'bg-rose-600 border-rose-600 text-white animate-pulse' : 'bg-[#f1f3f6] border-slate-300 text-[#212121] hover:bg-slate-200'
                  }`}
                  title="दबाकर आवाज़ भेजें (Hold to send voice)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="bg-[#2874f0] hover:bg-[#1c62d6] p-2 rounded-md text-white cursor-pointer shrink-0"
                  title="Send text"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAppGiftModal(true)}
                  className="p-2 rounded-md bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-bold shadow-xs transition cursor-pointer shrink-0"
                  title="ESP PLAY ऐप गिफ्ट्स भेजें"
                >
                  <Gift className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDigitalGiftCardsModal(true)}
                  className="p-2 rounded-md bg-[#388e3c] hover:bg-emerald-700 text-white font-bold shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
                  title="डिजिटल गिफ्ट कार्ड वाउचर स्टोर"
                >
                  <CreditCardIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ESP PLAY HOME LOBBY (Clean Match to Reference Screen)   */}
        {/* ============================================================== */}
        {activeTab === 'games' && (
          <div className="animate-fadeIn w-full max-w-3xl mx-auto">
            <WePlayHomeLobby
              user={user}
              onUpdateUser={onUpdateUser}
              onOpenRanking={() => setShowLeaderboardModal(true)}
              onOpenTasks={() => {
                setDailyTasksModalInitialTab('tasks');
                setShowDailyTasksModal(true);
              }}
              onOpenFriends={() => setShowEspChatModal(true)}
              onOpenVoiceRoom={() => setActiveTab('voice_room')}
              onOpenGame={(gameKey) => handleLaunchGameByKey(gameKey)}
              onOpenWeeklyRewards={() => {
                setDailyTasksModalInitialTab('login');
                setShowDailyTasksModal(true);
              }}
              onOpenRecharge={() => setActiveTab('recharge_convert')}
              onOpenProfile={() => openUserProfileSheet(user.userId, user as Partial<RichProfileData>, 'view')}
              onOpenChats={() => setShowEspChatModal(true)}
              onOpenAvatarCustomizer={() => setShowAvatarCustomizerModal(true)}
              onOpenDailyMissions={() => setShowDailyMissionsModal(true)}
              onOpenDailySpin={() => setShowFortuneSpinModal(true)}
              onOpenGiftCards={() => setShowDigitalGiftCardsModal(true)}
              onOpenEarningSetup={onOpenEarningSetup}
              onOpenServicesSetup={onOpenServicesSetup}
              onOpenClans={() => {
                setActiveTab('clan_friends');
                setShowTopClansModal(true);
              }}
              onOpenRelationships={() => setShowRelationshipsModal(true)}
              onOpenFamily={() => setShowFamilyHubModal(true)}
              onOpenMyHome={() => setEventsMyHomeState({ open: true, tab: 'my_home' })}
              onOpenEvents={() => setEventsMyHomeState({ open: true, tab: 'events' })}
              onOpenGiftWall={() => setShowOwnGiftWallModal(true)}
              isAdmin={isAdmin}
              onOpenAdmin={onOpenAdmin}
              onLogout={onLogout}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: REAL UPI COINS RECHARGE & COINS USAGE POLICY            */}
        {/* ============================================================== */}
        {activeTab === 'recharge_convert' && (
          <div className="space-y-6 animate-fadeIn w-full max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Box: Real UPI Coin Recharge Pack & Payment Submission */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-[#212121]">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#212121]">
                        Real UPI Coin Buy (लाइव पेमेंट रिचार्ज)
                      </h3>
                      <p className="text-[11px] text-[#2874f0] font-medium">
                        100% सुरक्षित • UPI ID व QR से भुगतान करें • एडमिन सत्यापन के बाद क्रेडिट
                      </p>
                    </div>
                  </div>

                  {rechargeSuccess && (
                    <div className="mb-3 p-3 rounded-md bg-emerald-50 text-[#388e3c] border border-emerald-200 text-xs font-bold leading-relaxed">
                      {rechargeSuccess}
                    </div>
                  )}

                  {rechargeError && (
                    <div className="mb-3 p-3 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                      {rechargeError}
                    </div>
                  )}

                  {/* Pack Selector */}
                  <label className="text-xs font-bold text-[#212121] block mb-1.5">1. कॉइन पैक चुनें:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COIN_RECHARGE_PACKS.map(pack => (
                      <button
                        key={pack.id}
                        onClick={() => setSelectedPack(pack)}
                        className={`p-2.5 rounded-md border text-left transition-all cursor-pointer ${
                          selectedPack.id === pack.id
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0] shadow-xs ring-1 ring-[#2874f0]/20'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold text-[#fb641b]">
                          <span>{pack.tag}</span>
                          {pack.bonus > 0 && <span>+{pack.bonus}</span>}
                        </div>
                        <div className="text-sm font-black text-[#212121] mt-0.5 tabular-nums">
                          🪙 {(pack.coins + pack.bonus).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-bold text-[#388e3c] mt-0.5 tabular-nums">
                          ₹{pack.amount}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Real UPI QR & Payment Info */}
                  <div className="mt-4 bg-[#f9fafb] p-3.5 rounded-md border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#878787] font-medium">चयनित पैक:</span>
                      <span className="text-[#fb641b] font-bold tabular-nums">
                        🪙 {selectedPack.coins + selectedPack.bonus} कॉइन्स (₹{selectedPack.amount})
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-200">
                      <div className="p-2 bg-white rounded-md border border-slate-200 shadow-xs shrink-0">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                            `upi://pay?pa=${settings?.adminUpiId || '8877490845@SPICEPAY'}&pn=${encodeURIComponent(
                              settings?.adminPayeeName || 'VIKAS KUMAR'
                            )}&am=${selectedPack.amount}&cu=INR&tn=ESP_COIN_${user.userId}`
                          )}`}
                          alt="UPI QR Code"
                          className="w-24 h-24 object-contain"
                        />
                      </div>

                      <div className="space-y-1.5 flex-1 w-full text-xs">
                        <div>
                          <span className="text-[10px] text-[#878787] uppercase font-semibold block">Official UPI ID:</span>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="font-mono font-bold text-[#2874f0] bg-white px-2 py-1 rounded-sm border border-slate-300 text-xs">
                              {settings?.adminUpiId || '8877490845@SPICEPAY'}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(settings?.adminUpiId || '8877490845@SPICEPAY');
                                setCopiedUpi(true);
                                setTimeout(() => setCopiedUpi(false), 2000);
                              }}
                              className="p-1.5 rounded-sm bg-white hover:bg-slate-100 text-[#212121] border border-slate-300 text-[10px] flex items-center space-x-1 cursor-pointer"
                              title="कॉपी करें"
                            >
                              {copiedUpi ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#878787] uppercase font-semibold block">Payee Name:</span>
                          <span className="font-bold text-[#212121] text-xs">{settings?.adminPayeeName || 'VIKAS KUMAR'}</span>
                        </div>

                        <p className="text-[10px] text-[#878787] leading-tight">
                          💡 Google Pay, PhonePe, Paytm या SpicePay से QR स्कैन करके ₹{selectedPack.amount} का भुगतान करें।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: 12-Digit UTR Input */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#212121]">
                        2. भुगतान के बाद 12-अंक UPI Ref / UTR No. दर्ज करें:
                      </label>
                      <span className="text-[10px] font-mono text-[#878787]">
                        {rechargeUtr.length}/12
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={12}
                      value={rechargeUtr}
                      onChange={e => setRechargeUtr(e.target.value.replace(/\D/g, ''))}
                      placeholder="उदा. 430582948210 (12 अंक)"
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2.5 text-[#212121] font-mono font-bold text-center tracking-widest text-sm focus:outline-none focus:border-[#2874f0]"
                    />
                  </div>

                  {/* Step 3: Payment Screenshot Upload (Required) */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#212121]">
                        3. पेमेंट स्क्रीनशॉट अपलोड करें (Payment Screenshot):
                      </label>
                      <span className={`text-[10px] font-bold ${rechargeScreenshot ? 'text-[#388e3c]' : 'text-[#fb641b]'}`}>
                        {rechargeScreenshot ? '✓ अपलोड हो गया' : 'अनिवार्य *'}
                      </span>
                    </div>

                    {rechargeScreenshot ? (
                      <div className="bg-[#f9fafb] border border-emerald-300 rounded-md p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={rechargeScreenshot}
                            alt="Payment Screenshot Preview"
                            onClick={() => setPreviewRechargeShot(rechargeScreenshot)}
                            className="w-16 h-16 rounded-sm object-cover border border-slate-300 bg-white cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#388e3c]">पेमेंट स्क्रीनशॉट संलग्न ✓</p>
                            <p className="text-[10px] text-slate-600 truncate">एडमिन सत्यापन के लिए तैयार (बड़ा देखने के लिए क्लिक करें)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <label className="px-2.5 py-1.5 rounded-sm bg-white hover:bg-slate-100 border border-slate-300 text-[11px] font-bold text-[#2874f0] cursor-pointer">
                            बदलें
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleRechargeScreenshotUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setRechargeScreenshot('')}
                            className="p-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 hover:border-[#2874f0] bg-[#f9fafb] hover:bg-[#f5f8ff] rounded-md p-4 text-center cursor-pointer transition">
                        <Upload className="w-5 h-5 text-[#2874f0]" />
                        <span className="text-xs font-bold text-[#212121]">
                          पेमेंट स्क्रीनशॉट चुनें (PhonePe / GPay / Paytm)
                        </span>
                        <span className="text-[10px] text-[#878787]">
                          JPG, PNG या WEBP • अधिकतम 8MB (UTR + स्क्रीनशॉट दोनों आवश्यक)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRechargeScreenshotUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <button
                    onClick={handleRechargeCoins}
                    disabled={isRecharging}
                    className="w-full bg-[#fb641b] hover:bg-[#e8550f] py-3 rounded-sm font-bold text-xs sm:text-sm text-white disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition"
                  >
                    <span>
                      {isRecharging
                        ? 'सत्यापन अनुरोध भेजा जा रहा है...'
                        : `₹${selectedPack.amount} का UTR व स्क्रीनशॉट सबमिट करें (+${selectedPack.coins + selectedPack.bonus} कॉइन्स)`}
                    </span>
                  </button>
                  <p className="text-[10px] text-center text-[#878787] mt-2">
                    🔒 एडमिन पैनल में UTR व पेमेंट स्क्रीनशॉट सत्यापन के बाद सिक्के आपके प्रोफाइल में क्रेडिट होंगे।
                  </p>
                </div>
              </div>

              {/* Right Box: Coins Usage Policy (No Cash Conversion) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-[#212121]">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#212121]">
                        ESP Coins Wallet &amp; Usage Rules
                      </h3>
                      <p className="text-[11px] text-[#2874f0] font-semibold">
                        असली कॉइन्स केवल प्लेटफॉर्म फीचर्स, VIP व फ्रेम्स के लिए हैं
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 mt-3 text-center">
                    <div className="text-xs text-[#878787] font-medium">आपका वर्तमान कॉइन बैलेंस:</div>
                    <div className="text-2xl font-black text-[#fb641b] mt-1 tabular-nums">
                      🪙 {(user.coins || 0).toLocaleString()} Coins
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2">
                      असली कार्य/टास्क पूरे करके <strong>+5 Coins &amp; EXP</strong> पाएं या बाईं ओर से UPI पेमेंट द्वारा कॉइन्स खरीदें।
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="p-2.5 rounded-sm bg-[#f5f8ff] border border-blue-100 flex items-center justify-between">
                      <span className="font-semibold text-[#212121]">👑 VIP मेंबरशिप &amp; प्रीमियम फ्रेम्स</span>
                      <span className="text-[#2874f0] font-bold">Coins से अनलॉक</span>
                    </div>
                    <div className="p-2.5 rounded-sm bg-[#f5f8ff] border border-blue-100 flex items-center justify-between">
                      <span className="font-semibold text-[#212121]">🎁 वॉइस स्टेज गिफ्ट्स &amp; डिजिटल कार्ड</span>
                      <span className="text-[#fb641b] font-bold">Coins से भेजें</span>
                    </div>
                    <div className="p-2.5 rounded-sm bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <span className="font-semibold text-[#212121]">💵 असली नकद निकासी (INR)</span>
                      <span className="text-[#388e3c] font-bold">केवल प्लान/रेफरल वॉलेट से</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <div className="text-[11px] text-[#878787] bg-amber-50 border border-amber-200 rounded-sm p-2.5 font-medium">
                    ℹ️ Coins को INR Cash में बदलने का विकल्प बंद है। असली INR नकद कमाई (Referral, NWI Auto-Pool, SWI) के लिए Dashboard Withdrawal का उपयोग करें।
                  </div>
                  {onOpenWithdrawal && (
                    <button
                      onClick={onOpenWithdrawal}
                      className="w-full py-2.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-xs font-bold text-white text-center cursor-pointer transition shadow-xs"
                    >
                      Go to Direct UPI Cash Wallet Dashboard ➔
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* User's Coin Recharge Orders History Table */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 text-[#212121]">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#2874f0]" />
                  <h4 className="text-sm font-bold text-[#212121]">आपके कॉइन रिचार्ज अनुरोध (My Recharge History)</h4>
                </div>
                <button
                  onClick={loadUserRecharges}
                  className="text-xs font-bold text-[#2874f0] hover:underline transition cursor-pointer"
                >
                  🔄 रीफ्रेश
                </button>
              </div>

              {userRecharges.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#878787]">
                  अभी तक कोई रिचार्ज अनुरोध नहीं किया गया है। ऊपर दिए गए पैक चुनकर UPI से रिचार्ज करें।
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f9fafb] border-b border-slate-200 text-[#878787] uppercase text-[10px]">
                        <th className="py-2.5 px-3">दिनांक</th>
                        <th className="py-2.5 px-3">पैक</th>
                        <th className="py-2.5 px-3">राशि</th>
                        <th className="py-2.5 px-3">कॉइन्स</th>
                        <th className="py-2.5 px-3">12-अंक UTR</th>
                        <th className="py-2.5 px-3">स्क्रीनशॉट</th>
                        <th className="py-2.5 px-3 text-right">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {userRecharges.map(item => (
                        <tr key={item.id} className="hover:bg-[#f5f8ff]">
                          <td className="py-2.5 px-3 text-[#878787] whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#212121]">
                            {item.packId.toUpperCase()}
                          </td>
                          <td className="py-2.5 px-3 font-black text-[#388e3c] tabular-nums">
                            ₹{item.amount}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#fb641b] tabular-nums">
                            🪙 {(item.coins + item.bonusCoins).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#212121] select-all">
                            {item.paymentUtr}
                          </td>
                          <td className="py-2.5 px-3">
                            {item.paymentScreenshot ? (
                              <button
                                type="button"
                                onClick={() => setPreviewRechargeShot(item.paymentScreenshot!)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] font-bold text-[10px] cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>देखें</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-sm inline-block border ${
                                item.status === 'approved'
                                  ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                                  : item.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {item.status === 'approved' ? '✓ स्वीकृत (क्रेडिटेड)' : item.status === 'rejected' ? '✗ अस्वीकृत' : '⏳ एडमिन सत्यापन पेंडिंग'}
                            </span>
                            {item.rejectionReason && (
                              <div className="text-[10px] text-rose-600 mt-0.5">{item.rejectionReason}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {previewRechargeShot && (
              <div
                onClick={() => setPreviewRechargeShot(null)}
                className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
              >
                <div
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-lg p-4 max-w-lg w-full shadow-2xl space-y-3 border border-slate-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-sm font-bold text-[#212121]">पेमेंट स्क्रीनशॉट प्रीव्यू</span>
                    <button
                      type="button"
                      onClick={() => setPreviewRechargeShot(null)}
                      className="p-1 rounded-sm bg-[#f1f3f6] text-slate-600 hover:text-[#212121] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <img
                    src={previewRechargeShot}
                    alt="Payment Screenshot"
                    className="w-full max-h-[70vh] object-contain rounded-sm border border-slate-200 bg-[#f9fafb]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: FAMILY (CLAN) & FRIENDS SYSTEM                          */}
        {/* ============================================================== */}
        {activeTab === 'clan_friends' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top 5 Clans Leaderboard Data Table Component */}
            <TopClansDataTable
              currentUser={user}
              onSelectClan={(clan) => {
                setSoundEffectToast(`🛡️ ${clan.name} (Rank #${clan.rank}) चयनित हुआ!`);
                setTimeout(() => setSoundEffectToast(null), 3000);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Clan / Family Profile (Real User Clan State) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-[#212121]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-md bg-[#2874f0] text-white flex items-center justify-center text-2xl shadow-xs">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#212121]">
                        {user.clanName || 'कोई क्लैन नहीं जुड़ा (No Clan Joined)'}
                      </h3>
                      <p className="text-[11px] text-[#2874f0] font-medium">
                        {user.clanName ? `Active Family Member • Level ${user.gameLevel || 1}` : 'ऊपर दी गई रियल क्लैन तालिका से जुड़ें'}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-sm bg-[#ffe500] text-[#212121] text-[10px] font-bold">
                    {user.clanRole || (user.clanName ? 'Member' : 'Free Agent')}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#f9fafb] p-2.5 rounded-md border border-slate-200">
                    <div className="text-[10px] text-[#878787]">आपका रैंक</div>
                    <div className="text-sm font-black text-[#212121] mt-0.5 tabular-nums">
                      Lvl {user.gameLevel || 1} ({user.gameXp || 0} EXP)
                    </div>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
                    <div className="text-[10px] text-[#878787]">कुल कॉइन्स व चार्म्स</div>
                    <div className="text-sm font-black text-[#fb641b] mt-0.5 tabular-nums">
                      🪙 {(user.coins || 0).toLocaleString()} • ✨ {user.charms || 0}
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-[#f5f8ff] p-3 rounded-md border border-blue-200 text-xs text-[#212121] space-y-2.5">
                  <div className="font-bold text-[#2874f0]">ESP PLAY Family Coins, Live Chat &amp; Relationship Suite:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFamilyHubModal(true)}
                      className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95"
                    >
                      <span>🏰 ESP Family Hub (Chat &amp; Coins)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRelationshipsModal(true)}
                      className="px-3 py-2 rounded-md bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer hover:opacity-95"
                    >
                      <span>💍 Relationship &amp; CP Tags</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Friends System */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-[#212121]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#2874f0]" />
                      <h3 className="font-bold text-sm text-[#212121]">ESP Gaming Friends</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openUserProfileSheet(user.userId, user as Partial<RichProfileData>, 'search')}
                        className="bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 px-2.5 py-1 rounded-sm text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>🔍 Search @Username</span>
                      </button>
                      <span className="text-[10px] text-[#388e3c] font-bold">
                        {realPlayers.length > 0 ? `${realPlayers.length} Registered` : 'Live Online'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {realPlayers.filter(f => f.userId !== user.userId).length === 0 ? (
                      <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 text-center text-xs text-[#878787]">
                        <p className="font-bold text-[#212121] mb-1">🤝 अभी कोई अन्य टीम मेंबर पंजीकृत नहीं है</p>
                        <p className="text-[11px] text-[#878787]">
                          नीचे दिए गए बटन से अपने दोस्तों को रेफरल लिंक से आमंत्रित करें। सक्रिय प्लान नियमों के अनुसार रियल रेफरल कमीशन प्राप्त करें।
                        </p>
                      </div>
                    ) : (
                      [...realPlayers]
                        .filter(f => f.userId !== user.userId)
                        .sort((a, b) => (b.gameLevel || 1) - (a.gameLevel || 1) || (b.charms || 0) - (a.charms || 0))
                        .slice(0, 15)
                        .map((f, idx) => {
                          return (
                            <div
                              key={f.userId || idx}
                              className="p-2.5 rounded-md border flex items-center justify-between transition cursor-pointer bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200"
                              onClick={() => handleOpenPlayerModal(f.userId, f)}
                            >
                              <div className="flex items-center space-x-2.5">
                                <AvatarFrame
                                  src={f.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.userId}`}
                                  alt={f.fullName}
                                  size="sm"
                                  frameType={(f.frameType as FrameVariant) || 'standard'}
                                  level={f.gameLevel || 1}
                                  showCrown={f.vipTier === 'diamond' || f.frameType === 'mythic-crimson'}
                                />
                                <div>
                                  <div className="font-bold text-xs flex items-center space-x-1.5">
                                    <span className="text-[#212121]">
                                      {f.fullName}
                                    </span>
                                  </div>
                                  <div className="text-[9px] flex items-center space-x-1">
                                    <span className="text-[#fb641b] font-mono font-bold tabular-nums">✨ {(f.charms || 0).toLocaleString()} Charms</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-[#2874f0] font-medium">{f.chosenServiceName || 'ESP Member'}</span>
                                  </div>
                                </div>
                              </div>

                            <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  handleOpenPlayerModal(f.userId, f);
                                }}
                                className="bg-[#2874f0] hover:bg-[#1c62d6] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm cursor-pointer"
                              >
                                Profile
                              </button>
                              <button
                                onClick={() => {
                                  setGiftTarget(f.fullName);
                                  setGiftTargetUserId(f.userId);
                                  setShowGiftModal(true);
                                }}
                                className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <Gift className="w-3 h-3" />
                                <span>Gift</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      const text = `Join ESP GAMING TIME! My Fixed Voice Room ID is ${cleanUserRoomFallback}: ${window.location.origin}/?room=${cleanUserRoomFallback}&ref=${user.userId}`;
                      navigator.clipboard.writeText(text);
                      setSoundEffectToast('📋 इनविटेशन लिंक कॉपी हो गया!');
                      setTimeout(() => setSoundEffectToast(null), 2500);
                    }}
                    className="w-full bg-[#388e3c] hover:bg-emerald-700 text-white py-2.5 rounded-sm font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>दोस्तों को रेफरल लिंक शेयर करें</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: REAL VERIFIED TASKS (+5 COINS + EXP ONLY AFTER WORK)     */}
        {/* ============================================================== */}
        {activeTab === 'rewards_tasks' && (
          <div className="space-y-4 animate-fadeIn">
            <DailyTasks
              user={user}
              onUpdateUser={onUpdateUser}
              onNavigateToGames={() => setActiveTab('games')}
              onNavigateToVoiceRoom={() => setActiveTab('voice_room')}
              onNavigateTab={(actionTab) => {
                if (actionTab === 'profile') {
                  setShowAvatarCustomizerModal(true);
                } else if (actionTab === 'voice_room' || actionTab === 'voice-room') {
                  setActiveTab('voice_room');
                } else {
                  setActiveTab('games');
                }
              }}
              onOpenBuyCoins={() => setActiveTab('recharge_convert')}
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SEAT MEMBER ACTION CARD MODAL (Interact with any seat holder)  */}
      {/* ============================================================== */}
      {selectedSeatAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden w-full max-w-sm shadow-2xl relative text-center text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-3 flex items-center justify-between text-white">
              <span className="text-xs font-black uppercase tracking-wider">Stage Speaker Profile</span>
              <button
                onClick={() => setSelectedSeatAction(null)}
                className="p-1.5 text-white hover:bg-white/20 rounded-sm transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="w-20 h-20 rounded-full mx-auto p-1 bg-gradient-to-tr from-[#2874f0] to-[#ffe500] shadow-md">
                <img
                  src={selectedSeatAction.userAvatar}
                  alt={selectedSeatAction.userName}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>

              <h3 className="font-extrabold text-base text-[#212121] mt-3">{selectedSeatAction.userName}</h3>
              <div className="text-xs font-mono text-[#2874f0] font-bold mt-0.5">
                Roll No: {selectedSeatAction.userId || 'ESP Member'}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200">
                  <div className="text-[10px] text-[#878787] font-bold">Game Level</div>
                  <div className="font-black text-[#fb641b]">Level {selectedSeatAction.gameLevel || 1}</div>
                </div>
                <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200">
                  <div className="text-[10px] text-[#878787] font-bold">Charms</div>
                  <div className="font-black text-pink-600">{selectedSeatAction.charms || 0} ✨</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    setGiftTarget(selectedSeatAction.userName || 'Member');
                    setGiftTargetUserId(selectedSeatAction.userId);
                    setShowGiftModal(true);
                    setSelectedSeatAction(null);
                  }}
                  className="w-full bg-[#fb641b] hover:bg-[#e8550f] py-2.5 rounded-sm font-black text-xs text-white flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Send Luxury Gift to {selectedSeatAction.userName}</span>
                </button>

                <button
                  onClick={() => {
                    handleSendQuickPhrase(`👏 @${selectedSeatAction.userName} cheering for you on stage!`);
                    setSelectedSeatAction(null);
                  }}
                  className="w-full bg-[#2874f0] hover:bg-[#1c62d6] py-2.5 rounded-sm font-bold text-xs text-white flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer"
                >
                  <span>👏 Cheer & Shoutout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ROOM AUDIENCE DRAWER / MODAL (View all members in room)        */}
      {/* ============================================================== */}
      {showAudienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md w-full max-w-md shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden text-[#212121]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#ffe500]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">Voice Room Audience</h3>
                  <p className="text-[10px] text-blue-100">{audienceCount} active members in room</p>
                </div>
              </div>
              <button
                onClick={() => setShowAudienceModal(false)}
                className="p-1.5 text-white rounded-sm bg-white/15 hover:bg-white/25 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-none bg-[#f1f3f6]">
              {/* Host Card */}
              <div
                className="bg-white hover:bg-[#f5f8ff] p-2.5 rounded-sm border border-amber-300 flex items-center justify-between text-xs cursor-pointer transition shadow-2xs"
                onClick={() => {
                  setShowAudienceModal(false);
                  handleOpenPlayerModal(voiceRoomHost.userId, {
                    userId: voiceRoomHost.userId,
                    fullName: voiceRoomHost.userName,
                    gameLevel: voiceRoomHost.gameLevel,
                    charms: voiceRoomHost.charms,
                    avatar: voiceRoomHost.userAvatar,
                    roleTitle: voiceRoomHost.roleTitle || 'ESP Founder & Room Host',
                    status: 'approved',
                    chosenServiceName: 'ESP FOUNDER & HOST (ALL 10 SERVICES)',
                  });
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <img
                    src={voiceRoomHost.userAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP'}
                    alt={voiceRoomHost.userName}
                    className="w-9 h-9 rounded-full object-cover bg-[#f5f8ff] border-2 border-amber-400"
                  />
                  <div>
                    <div className="font-bold text-[#212121] flex items-center space-x-1">
                      <span>{voiceRoomHost.userName}</span>
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded-xs font-mono font-bold">Lvl {voiceRoomHost.gameLevel}</span>
                    </div>
                    <div className="text-[10px] text-[#fb641b] font-semibold">
                      {voiceRoomHost.roleTitle || 'ESP Founder & Host'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setShowAudienceModal(false);
                      handleOpenPlayerModal(voiceRoomHost.userId, {
                        userId: voiceRoomHost.userId,
                        fullName: voiceRoomHost.userName,
                        gameLevel: voiceRoomHost.gameLevel,
                        charms: voiceRoomHost.charms,
                        avatar: voiceRoomHost.userAvatar,
                        roleTitle: voiceRoomHost.roleTitle || 'ESP Founder & Room Host',
                        status: 'approved',
                      });
                    }}
                    className="bg-[#2874f0] hover:bg-[#1c62d6] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm cursor-pointer"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowGiftModal(true);
                      setGiftTarget(voiceRoomHost.userName);
                      setShowAudienceModal(false);
                    }}
                    className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <Gift className="w-3 h-3" />
                    <span>Gift</span>
                  </button>
                </div>
              </div>

              {/* Real Registered Players */}
              {realPlayers.map((mbr) => (
                <div
                  key={mbr.userId}
                  className="bg-white hover:bg-[#f5f8ff] p-2.5 rounded-sm border border-slate-200 flex items-center justify-between text-xs transition cursor-pointer shadow-2xs"
                  onClick={() => {
                    setShowAudienceModal(false);
                    handleOpenPlayerModal(mbr.userId, mbr);
                  }}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={mbr.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${mbr.userId}`}
                      alt={mbr.fullName}
                      className="w-9 h-9 rounded-full object-cover bg-[#f5f8ff] border border-blue-200"
                    />
                    <div>
                      <div className="font-bold text-[#212121] flex items-center space-x-1">
                        <span>{mbr.fullName}</span>
                        <span className="text-[9px] text-[#2874f0] bg-blue-50 border border-blue-200 px-1 rounded-xs font-mono font-bold">Lvl {mbr.gameLevel || 1}</span>
                      </div>
                      <div className="text-[10px] text-[#878787] flex items-center space-x-1">
                        <span className="font-mono text-[#2874f0]">{mbr.userId}</span>
                        <span>•</span>
                        <span className="text-[#388e3c] font-semibold">{mbr.chosenServiceName || 'ESP Member'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setShowAudienceModal(false);
                        handleOpenPlayerModal(mbr.userId, mbr);
                      }}
                      className="bg-[#2874f0] hover:bg-[#1c62d6] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowGiftModal(true);
                        setGiftTarget(mbr.fullName);
                        setShowAudienceModal(false);
                      }}
                      className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 py-1 text-[10px] font-bold rounded-sm flex items-center space-x-1 cursor-pointer"
                    >
                      <Gift className="w-3 h-3" />
                      <span>Gift</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* LUXURY GIFT SHOP MODAL                                         */}
      {/* ============================================================== */}
      {showGiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg shadow-2xl relative overflow-hidden text-[#212121]">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-[#ffe500]" />
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    ESP Luxury Gift Shop
                  </h3>
                  <p className="text-[10px] text-blue-100">
                    Send Animated Gifts with Full-Screen Live Celebration Effects
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="p-1.5 text-white rounded-sm bg-white/15 hover:bg-white/25 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {/* Target Selector */}
              <div>
                <label className="text-xs text-[#212121] block mb-1 font-bold">
                  Send Gift To:
                </label>
                <input
                  type="text"
                  value={giftTarget}
                  onChange={e => {
                    setGiftTarget(e.target.value);
                    setGiftTargetUserId(undefined);
                  }}
                  className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] outline-none"
                />
              </div>

              {/* Gifts Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4 max-h-60 overflow-y-auto scrollbar-none p-1">
                {LUXURY_GIFTS.map(gift => (
                  <button
                    key={gift.id}
                    onClick={() => setSelectedGift(gift)}
                    className={`p-2.5 rounded-sm border text-center transition cursor-pointer ${
                      selectedGift?.id === gift.id
                        ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0] shadow-sm'
                        : 'bg-[#f9fafb] border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl my-1">{gift.icon}</div>
                    <div className="text-[11px] font-bold text-[#212121] truncate">{gift.name}</div>
                    <div className="text-[10px] font-black text-[#fb641b] mt-0.5">🪙 {gift.coinCost}</div>
                    <div className="text-[8px] font-bold text-pink-600">+{gift.charmValue} ✨</div>
                  </button>
                ))}
              </div>

              {/* Send Action */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#878787] font-bold">Total Cost:</div>
                  <div className="text-sm font-black text-[#fb641b]">
                    🪙 {selectedGift?.coinCost} Coins
                  </div>
                </div>

                {(user.coins || 0) >= (selectedGift?.coinCost || 0) ? (
                  <button
                    onClick={() => handleSendGift()}
                    className="bg-[#fb641b] hover:bg-[#e8550f] py-2.5 px-6 rounded-sm font-black text-xs text-white shadow-sm transition cursor-pointer"
                  >
                    SEND {selectedGift?.name.toUpperCase()} 🎁
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowGiftModal(false);
                      setActiveTab('recharge_convert');
                    }}
                    className="bg-[#fb641b] hover:bg-[#e8550f] py-2.5 px-5 rounded-sm font-black text-xs text-white shadow-sm transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>🪙 Buy Coins ({selectedGift?.coinCost}c चाहिए)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESP PLAY Rich Profile Sheet Modal (Profile Setup, Unique @Username, Cover, Moments, Gift Wall, Add Friend) */}
      <UserProfileSheetModal
        isOpen={profileSheetState.isOpen}
        onClose={() => setProfileSheetState(prev => ({ ...prev, isOpen: false }))}
        currentUser={user}
        targetUserId={profileSheetState.targetUserId}
        initialProfile={profileSheetState.initialProfile}
        initialMode={profileSheetState.initialMode || 'view'}
        onUpdateUser={onUpdateUser}
        onSendGift={(p, initialGiftId) => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          setGiftTarget(p.fullName);
          setGiftTargetUserId(p.userId);
          setAppGiftPreset({
            giftId: initialGiftId,
            targetName: p.fullName,
            targetUserId: p.userId,
          });
          setShowAppGiftModal(true);
        }}
        onOpenAvatarCustomizer={() => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          setShowAvatarCustomizerModal(true);
        }}
        onOpenMoments={() => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          if (onOpenMomentsFeed) {
            onOpenMomentsFeed();
          } else {
            setShowEspChatModal(true);
          }
        }}
        onVisitVoiceRoom={(roomAddressOrUserId) => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          openRoomByLookup(roomAddressOrUserId, true);
        }}
        onOpenRelationships={() => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          setShowRelationshipsModal(true);
        }}
        onOpenFamily={() => {
          setProfileSheetState(prev => ({ ...prev, isOpen: false }));
          setShowFamilyHubModal(true);
        }}
      />

      {/* Voice Room Design, Custom Wallpaper Upload & Invite Modal */}
      <VoiceRoomDesignModal
        isOpen={designModalState.isOpen}
        initialTab={designModalState.tab}
        currentUser={user}
        room={{
          ...(activeRoomDetail || {}),
          id: currentRoomId,
          title: activeRoomTitle,
          topic: activeRoomTopic,
          category: activeRoomCategory as any,
          roomAddress: activeRoomAddress,
          hostUserId: activeRoomHostId,
        }}
        seats={seats}
        onClose={() => setDesignModalState((p) => ({ ...p, isOpen: false }))}
        onDesignSaved={(res) => {
          applyVoiceRoomPayload(res);
          loadAvailableRooms(roomsSearchQuery);
        }}
        onHostSeatAction={handleHostSeatAction}
      />

      {/* Private Room Passcode Prompt Modal (Replaces window.prompt) */}
      {privatePasscodePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-3 text-[#212121]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#fb641b]" />
                <span>प्राइवेट रूम पासकोड</span>
              </h3>
              <button
                onClick={() => setPrivatePasscodePrompt(null)}
                className="p-1 rounded hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              रूम <strong>{privatePasscodePrompt.room?.title}</strong> (ID: <span className="font-mono font-bold">{privatePasscodePrompt.room?.roomAddress}</span>) में शामिल होने के लिए पासकोड दर्ज करें:
            </p>
            <input
              type="password"
              autoFocus
              value={privatePasscodePrompt.passcode}
              onChange={(e) =>
                setPrivatePasscodePrompt({ ...privatePasscodePrompt, passcode: e.target.value, error: undefined })
              }
              placeholder="पासकोड लिखें..."
              className="w-full border border-slate-300 focus:border-[#2874f0] rounded-lg px-3 py-2 text-xs font-mono outline-none"
            />
            {privatePasscodePrompt.error && (
              <p className="text-xs font-bold text-rose-600">⚠️ {privatePasscodePrompt.error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPrivatePasscodePrompt(null)}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-xs font-bold cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() =>
                  handleJoinAndSwitchRoom(privatePasscodePrompt.room, privatePasscodePrompt.passcode)
                }
                className="flex-1 py-2 rounded-lg bg-[#2874f0] text-white text-xs font-black cursor-pointer"
              >
                अनलॉक व जॉइन करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Create New Voice Room Modal (With Custom Wallpaper & Stage Layout Picker) */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full shadow-2xl relative max-h-[92vh] overflow-y-auto text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-xl">
                  🎙️
                </div>
                <div>
                  <h3 className="text-base font-black">नया एडवांस वॉइस रूम बनाएं</h3>
                  <p className="text-[11px] text-blue-100">बिना Symbol वाला यूनिक Room ID अपने आप मिलेगा</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateRoomModal(false);
                  setRoomActionFeedback(null);
                }}
                className="text-white/80 hover:text-white p-1.5 rounded-sm hover:bg-white/15 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <form onSubmit={handleCreateCustomRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    रूम का नाम (Room Title) *
                  </label>
                  <input
                    type="text"
                    value={newRoomTitle}
                    onChange={(e) => setNewRoomTitle(e.target.value)}
                    placeholder="उदा: राहुल का गेमिंग और अर्निंग अड्डा"
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2.5 text-xs text-[#212121] placeholder-slate-400 outline-none transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    चर्चा का विषय (Topic / Tagline)
                  </label>
                  <input
                    type="text"
                    value={newRoomTopic}
                    onChange={(e) => setNewRoomTopic(e.target.value)}
                    placeholder="उदा: आज शाम 7 बजे मेगा स्नेक टूर्नामेंट व अर्निंग टिप्स"
                    className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2.5 text-xs text-[#212121] placeholder-slate-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    वॉलपेपर थीम चुनें (Wallpaper Design)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {VOICE_WALLPAPER_PRESETS.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        onClick={() => setNewRoomWallpaperId(wp.id)}
                        className={`rounded-md overflow-hidden border-2 text-left transition cursor-pointer ${
                          newRoomWallpaperId === wp.id
                            ? 'border-[#2874f0] ring-2 ring-blue-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <img src={wp.imageUrl} alt={wp.name} className="w-full h-14 object-cover" />
                        <div className="p-1 text-[9px] font-bold truncate text-center bg-white">
                          {wp.badge} {wp.name.split(' ')[0]}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Normal (Free) vs Advance Premium Voice Room Tier Selector */}
                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1.5">
                    रूम प्लान चुनें (Normal Free बनाम Advance Premium Coins Room)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VOICE_ROOM_TIERS.map((tier) => {
                      const selected = newRoomTier === tier.id;
                      const affordable = tier.coinPrice === 0 || (user.coins || 0) >= tier.coinPrice;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setNewRoomTier(tier.id)}
                          className={`p-2.5 rounded-md border text-left transition cursor-pointer ${
                            selected
                              ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-blue-300'
                              : 'bg-[#f9fafb] border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-[#212121]">
                              {tier.badgeIcon} {tier.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black tabular-nums ${
                                tier.coinPrice === 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : affordable
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {tier.coinPrice === 0 ? 'FREE (0🪙)' : `🪙 ${tier.coinPrice}`}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            {tier.hindiName} · PK {tier.pkBoostMultiplier}x
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    स्टेज लेआउट चुनें (Stage Layout)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {STAGE_LAYOUT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewRoomStageLayout(opt.id)}
                        className={`p-2 rounded-sm border text-left transition cursor-pointer ${
                          newRoomStageLayout === opt.id
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0]'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {opt.icon} {opt.title}
                        </div>
                        <div className="text-[9px] text-[#878787]">{opt.hindiTitle}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#212121] mb-1">
                    रूम श्रेणी (Category)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'earning', label: '💰 कमाई (Earning)', desc: 'सर्विसेज व अर्निंग' },
                      { id: 'gaming', label: '🎮 गेमिंग (Gaming)', desc: 'स्नेक, बिंगो, डाइस' },
                      { id: 'chitchat', label: '☕ गपशप (Chit-Chat)', desc: 'दोस्ती व बातचीत' },
                      { id: 'clan', label: '🛡️ क्लैन (Family/Clan)', desc: 'टीम व फैमिली' },
                      { id: 'help', label: '💡 सहायता (Help)', desc: 'सपोर्ट व गाइड' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewRoomCategory(cat.id as any)}
                        className={`p-2 rounded-sm border text-left transition cursor-pointer ${
                          newRoomCategory === cat.id
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0] shadow-xs'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{cat.label}</div>
                        <div className="text-[10px] text-[#878787]">{cat.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#f9fafb] border border-slate-200 rounded-sm space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newRoomIsPrivate}
                      onChange={(e) => setNewRoomIsPrivate(e.target.checked)}
                      className="accent-[#2874f0] w-4 h-4 rounded"
                    />
                    <span className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#2874f0]" /> प्राइवेट रूम (पासवर्ड से सुरक्षित करें)
                    </span>
                  </label>
                  {newRoomIsPrivate && (
                    <input
                      type="password"
                      maxLength={6}
                      value={newRoomPasscode}
                      onChange={(e) => setNewRoomPasscode(e.target.value)}
                      placeholder="4-6 अंकों का पासकोड दर्ज करें"
                      className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-1.5 text-xs text-[#212121] placeholder-slate-400 outline-none"
                    />
                  )}
                </div>

                {roomActionFeedback && (
                  <div
                    className={`p-3 rounded-sm text-xs font-bold border flex items-center gap-2 ${
                      roomActionFeedback.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
                    }`}
                  >
                    <span>{roomActionFeedback.type === 'error' ? '⚠️' : '✅'}</span>
                    <span>{roomActionFeedback.message}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateRoomModal(false);
                      setRoomActionFeedback(null);
                    }}
                    className="flex-1 py-2.5 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#212121] transition cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingRoom}
                    className="flex-1 py-2.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-xs font-black text-white shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isCreatingRoom ? 'कमरा बन रहा है...' : 'कमरा शुरू करें 🚀'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. All Community Voice Rooms Directory Modal (Search by Room ID, Filter, Join & Follow) */}
      {showRoomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-xl">
                  🌐
                </div>
                <div>
                  <h3 className="text-base font-black">सभी लाइव वॉइस रूम्स व रूम ID खोज</h3>
                  <p className="text-[11px] text-blue-100">
                    यूनिक काउंटिंग व VIP Room ID (जैसे 1111, 2222, 10001) से रूम खोजें, फॉलो करें और जॉइन करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoomsModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-sm hover:bg-white/15 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 flex-1 flex flex-col overflow-hidden space-y-3">
              {/* Search Bar + Go to Room ID */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roomsSearchQuery}
                    onChange={(e) => setRoomsSearchQuery(e.target.value)}
                    placeholder="VIP Room ID (जैसे 1111, 1234), Room ID (10001) या नाम खोजें..."
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-sm pl-9 pr-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
                {roomsSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => openRoomByLookup(roomsSearchQuery, true)}
                    className="px-3.5 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-black cursor-pointer shrink-0"
                  >
                    🔍 ID से खोलें
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowRoomsModal(false);
                    setShowCreateRoomModal(true);
                  }}
                  className="bg-[#fb641b] hover:bg-[#e8550f] px-3.5 py-2 rounded-sm text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  नया रूम बनाएं
                </button>
              </div>

              {/* Directory Filter Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'all', label: `🌐 सभी रूम्स (${availableRooms.length})` },
                    {
                      id: 'vip',
                      label: `👑 VIP रूम्स (${availableRooms.filter(r => r.isVipRoom || isVipFancyRoomNumber(r.roomAddress)).length})`,
                    },
                    { id: 'my_room', label: '🏠 मेरा फिक्स्ड रूम' },
                    { id: 'followed', label: '⭐ फॉलोड रूम्स' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRoomsFilterTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-bold border transition cursor-pointer ${
                        roomsFilterTab === tab.id
                          ? 'bg-[#2874f0] text-white border-[#2874f0]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowRoomsModal(false);
                    loadMyPersonalRoom(true);
                  }}
                  className="text-xs font-black text-indigo-700 hover:underline cursor-pointer font-mono tabular-nums"
                >
                  🏠 मेरा रूम ({cleanUserRoomFallback}) ➔
                </button>
              </div>

              <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
                {availableRooms
                  .filter((room) => {
                    if (roomsFilterTab === 'vip') {
                      return Boolean(room.isVipRoom || isVipFancyRoomNumber(room.roomAddress));
                    }
                    if (roomsFilterTab === 'my_room') {
                      return room.hostUserId === user.userId;
                    }
                    if (roomsFilterTab === 'followed') {
                      return Boolean(room.isFollowed);
                    }
                    return true;
                  })
                  .map((room) => {
                    const isCurrent = room.id === currentRoomId;
                    const occupiedCount = room.seats ? room.seats.filter((s: any) => s.userId).length : 0;
                    const isVipRoom = Boolean(room.isVipRoom || isVipFancyRoomNumber(room.roomAddress));
                    const wpThumb =
                      room.customWallpaperUrl ||
                      VOICE_WALLPAPER_PRESETS.find((w) => w.id === room.wallpaperId)?.imageUrl;
                    return (
                      <div
                        key={room.id}
                        className={`p-3.5 rounded-md border transition ${
                          isCurrent
                            ? 'bg-[#f5f8ff] border-[#2874f0] shadow-xs'
                            : isVipRoom
                            ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                            : 'bg-[#f9fafb] border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="relative w-12 h-12 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-900">
                              {wpThumb && (
                                <img
                                  src={wpThumb}
                                  alt={room.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-55"
                                />
                              )}
                              <img
                                src={room.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${room.hostUserId}`}
                                alt={room.hostName}
                                className="relative z-10 w-8 h-8 rounded-full border border-white object-cover m-auto mt-2"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-[#212121]">{room.title}</span>
                                {isVipRoom && (
                                  <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-amber-400 shadow-2xs">
                                    👑 {room.vipRoomLabel || 'VIP ROOM'}
                                  </span>
                                )}
                                {room.isPersonalFixed && (
                                  <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-black bg-indigo-600 text-white">
                                    FIXED
                                  </span>
                                )}
                                <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-black border font-mono tabular-nums ${
                                  isVipRoom
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-blue-50 text-[#2874f0] border-blue-200'
                                }`}>
                                  ID:{room.roomAddress}
                                </span>
                                {room.isPrivate && (
                                  <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-[#ffe500] text-[#212121] flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> लॉक
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-[#878787] mt-0.5 line-clamp-1">
                                {room.topic || 'No topic set'}
                              </div>

                              <div className="flex items-center gap-2.5 mt-1 text-[10px] text-[#878787] flex-wrap">
                                <span>👑 {room.hostName}</span>
                                <span>👥 {room.listenersCount || 1} Online</span>
                                <span>⭐ {room.followersCount || 0} Follow</span>
                                <span>🎙️ {occupiedCount}/8</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {room.hostUserId !== user.userId && (
                              <button
                                type="button"
                                onClick={() => handleToggleFollowRoom(room.id)}
                                className={`px-2.5 py-2 rounded-sm text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                                  room.isFollowed
                                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <Star className="w-3 h-3" />
                                <span>{room.isFollowed ? 'Following' : 'Follow'}</span>
                              </button>
                            )}

                            {isCurrent ? (
                              <div className="px-3.5 py-2 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-black flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> लाइव रूम
                              </div>
                            ) : (
                              <button
                                onClick={() => handleJoinAndSwitchRoom(room)}
                                className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>Join Room</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Room Host Settings Modal */}
      {showHostSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">होस्ट कंट्रोल्स एवं सेटिंग्स</h3>
                  <p className="text-[11px] text-blue-100 font-bold">
                    कमरा: {activeRoomTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHostSettingsModal(false)}
                className="text-white/80 hover:text-white p-1.5 rounded-sm hover:bg-white/15 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Change Topic */}
              <div className="p-4 rounded-sm bg-[#f9fafb] border border-slate-200 mb-4 space-y-3">
                <div className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                  📝 चर्चा का विषय बदलें (Update Topic)
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editTopicInput}
                    onChange={(e) => setEditTopicInput(e.target.value)}
                    placeholder={activeRoomTopic || 'नया टॉपिक दर्ज करें'}
                    className="flex-1 bg-white border border-slate-300 focus:border-[#2874f0] rounded-sm px-3 py-2 text-xs text-[#212121] placeholder-slate-400 outline-none"
                  />
                  <button
                    onClick={handleHostUpdateTopic}
                    className="bg-[#2874f0] hover:bg-[#1c62d6] px-4 py-2 rounded-sm text-xs font-black text-white shadow-xs transition cursor-pointer"
                  >
                    सेव करें
                  </button>
                </div>
              </div>

              {/* Manage Seats (0-based seatIdx) */}
              <div className="p-4 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#212121]">
                  🎙️ सीट्स प्रबंधन (Mute, Lock & Kick Members)
                </div>
                <div className="space-y-2">
                  {seats.map((seat, idx) => (
                    <div
                      key={seat.seatNumber}
                      className="flex items-center justify-between p-2.5 rounded-sm bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#f5f8ff] border border-blue-100 flex items-center justify-center text-[10px] font-black text-[#2874f0]">
                          #{idx + 1}
                        </div>
                        {seat.userId ? (
                          <div>
                            <div className="font-bold text-[#212121] flex items-center gap-1.5">
                              {seat.userName}
                              {seat.userId === user.userId && (
                                <span className="text-[9px] text-[#2874f0]">(आप)</span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#878787]">
                              {seat.isMuted ? '🔇 म्यूटेड' : '🎙️ अनम्यूटेड'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#878787] italic">
                            {seat.isLocked ? '🔒 सीट लॉक है' : 'सीट खाली है'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {seat.userId && seat.userId !== user.userId && (
                          <>
                            <button
                              onClick={() => handleHostMuteSeat(idx, !seat.isMuted)}
                              className={`px-2 py-1 rounded-sm text-[10px] font-bold border transition cursor-pointer ${
                                seat.isMuted
                                  ? 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
                                  : 'bg-amber-50 border-amber-200 text-amber-800'
                              }`}
                            >
                              {seat.isMuted ? 'अनम्यूट' : 'म्यूट'}
                            </button>
                            <button
                              onClick={() => handleHostKickSeat(idx)}
                              className="px-2 py-1 rounded-sm text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                            >
                              हटाएं
                            </button>
                          </>
                        )}
                        {!seat.userId && (
                          <button
                            onClick={() =>
                              handleHostSeatAction(seat.isLocked ? 'unlock_seat' : 'lock_seat', idx)
                            }
                            className="px-2 py-1 rounded-sm text-[10px] font-bold bg-slate-100 border border-slate-300 text-slate-700 cursor-pointer"
                          >
                            {seat.isLocked ? 'अनलॉक करें' : 'लॉक करें'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-right">
                <button
                  onClick={() => setShowHostSettingsModal(false)}
                  className="px-5 py-2 rounded-sm bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#212121] transition cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ESP PLAY Werewolf Game Modal */}
      {showWerewolfModal && (
        <WerewolfGameModal
          user={user}
          onClose={() => setShowWerewolfModal(false)}
          onUpdateUserCoins={(newCoins, newCharms) => {
            onUpdateUser({
              ...user,
              coins: newCoins,
              charms: newCharms,
            });
          }}
        />
      )}

      {/* Real live voice only — fake voice effect modal removed */}

      {/* 7. Daily Lucky Spin Modal */}
      {showDailySpinModal && (
        <DailyLuckySpin
          user={user}
          onUpdateUser={onUpdateUser}
          isModal={true}
          onOpenBuyCoins={() => {
            setShowDailySpinModal(false);
            setActiveTab('recharge_convert');
          }}
          onClose={() => setShowDailySpinModal(false)}
        />
      )}

      {/* 8. Who is the Spy (जासूस कौन है?) ESP PLAY Game Modal */}
      {showSpyGameModal && (
        <WhoIsTheSpyGameModal
          user={user}
          onClose={() => setShowSpyGameModal(false)}
          onUpdateUserCoins={(newCoins, newCharms) => {
            onUpdateUser({
              ...user,
              coins: newCoins,
              charms: newCharms,
            });
          }}
        />
      )}

      {/* 9. Top Earners & Gaming Players Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl relative my-8">
            <button
              type="button"
              onClick={() => setShowLeaderboardModal(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#212121] flex items-center justify-center border border-slate-200 shadow-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <LeaderboardWidget
              currentUser={user}
              onOpenPlayerProfile={(p) => {
                openUserProfileSheet(
                  p.userId,
                  {
                    userId: p.userId,
                    fullName: p.fullName,
                    avatar: p.avatar,
                    frameType: p.frameType,
                    gameLevel: p.gameLevel,
                    charms: p.charms,
                    clanName: p.clanName,
                  },
                  'view'
                );
              }}
            />
          </div>
        </div>
      )}

      {/* 10. Daily Fortune Spin (24H Reward & Exclusive Badges) Modal */}
      {showFortuneSpinModal && (
        <DailyFortuneSpinModal
          user={user}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowFortuneSpinModal(false);
            setActiveTab('recharge_convert');
          }}
          onClose={() => setShowFortuneSpinModal(false)}
        />
      )}

      {/* 11. Real Verified Task Milestone Boxes Modal */}
      {showTimedChestModal && (
        <TimedMysteryChestModal
          user={user}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowTimedChestModal(false);
            setActiveTab('recharge_convert');
          }}
          onClose={() => setShowTimedChestModal(false)}
        />
      )}

      {/* 12. ESP PLAY Luxury Gift Sheet (Sound FX, Combo Setup, Packet Rain & Real Coins) */}
      {showAppGiftModal && (
        <WePlayAppGiftModal
          user={user}
          seats={seats}
          initialGiftId={appGiftPreset?.giftId}
          initialTargetName={appGiftPreset?.targetName}
          initialTargetUserId={appGiftPreset?.targetUserId}
          initialCategory={appGiftPreset?.category}
          comboSettings={comboSettings}
          onUpdateComboSettings={(next) => setComboSettings(next)}
          onDropPacket={handleDropPacket}
          onClose={() => {
            setShowAppGiftModal(false);
            setAppGiftPreset(null);
          }}
          onOpenBuyCoins={() => {
            setShowAppGiftModal(false);
            setAppGiftPreset(null);
            setActiveTab('recharge_convert');
          }}
          onSendGift={async (gift, count, target, _coinsBackWon, explicitTargetUserId, settingsUsed) => {
            const resolvedTargetUserId = explicitTargetUserId || appGiftPreset?.targetUserId;
            setShowAppGiftModal(false);
            setAppGiftPreset(null);
            await executeGiftSend(gift, count, target, resolvedTargetUserId, settingsUsed || comboSettings);
          }}
        />
      )}

      {/* 13. Real Verified Tasks (Daily / Growth / Family) & Weekly Rewards Modal */}
      {showDailyTasksModal && (
        <DailyTasksAndLoginModal
          user={user}
          initialTab={dailyTasksModalInitialTab}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowDailyTasksModal(false);
            setActiveTab('recharge_convert');
          }}
          onNavigateTab={(actionTab) => {
            setShowDailyTasksModal(false);
            if (actionTab.startsWith('game:')) {
              handleLaunchGameByKey(actionTab.replace('game:', ''));
            } else if (actionTab === 'profile') {
              setShowAvatarCustomizerModal(true);
            } else if (actionTab === 'voice_room' || actionTab === 'voice-room') {
              setActiveTab('voice_room');
            } else if (actionTab === 'moments') {
              onOpenMomentsFeed?.();
            } else if (actionTab === 'friends' || actionTab === 'chat') {
              setShowEspChatModal(true);
            } else if (actionTab === 'relationships') {
              setShowRelationshipsModal(true);
            } else if (actionTab === 'gift') {
              setShowAppGiftModal(true);
            } else if (actionTab === 'family') {
              setShowFamilyHubModal(true);
            } else if (actionTab === 'clans') {
              setActiveTab('clan_friends');
              setShowTopClansModal(true);
            } else {
              setActiveTab('games');
            }
          }}
          onClose={() => setShowDailyTasksModal(false)}
        />
      )}

      {/* 14. Advance Room Store & Wallpaper Customizer Modal */}
      {showRoomStoreModal && (
        <AdvanceRoomStoreModal
          user={user}
          currentRoomBgTheme={roomBgTheme.id}
          onSelectRoomBgTheme={(theme) => {
            setRoomBgTheme(theme);
            try {
              localStorage.setItem(`esp_room_theme_${user.userId}`, theme.id);
            } catch {}
            setShowRoomStoreModal(false);
            setSoundEffectToast(`🖼️ '${theme.hindiName}' बैकग्राउंड रूम पर लागू हुआ!`);
            setTimeout(() => setSoundEffectToast(null), 3000);
          }}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowRoomStoreModal(false);
            setActiveTab('recharge_convert');
          }}
          onClose={() => setShowRoomStoreModal(false)}
        />
      )}

      {/* 15. Daily Missions System Modal */}
      {showDailyMissionsModal && (
        <DailyMissionsModal
          user={user}
          isOpen={showDailyMissionsModal}
          onClose={() => setShowDailyMissionsModal(false)}
          onUpdateUser={onUpdateUser}
          onPerformAction={handlePerformDailyMissionAction}
          onOpenBuyCoins={() => {
            setShowDailyMissionsModal(false);
            setActiveTab('recharge_convert');
          }}
        />
      )}

      {/* 16. Avatar & Status Frame Customizer & VIP Pass Store Modal */}
      {showAvatarCustomizerModal && (
        <AvatarCustomizerModal
          user={user}
          isOpen={showAvatarCustomizerModal}
          onClose={() => setShowAvatarCustomizerModal(false)}
          onSaveAvatar={handleSaveAvatarCustomization}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowAvatarCustomizerModal(false);
            setActiveTab('recharge_convert');
          }}
        />
      )}

      {/* 17. Top 5 Clans Modal (Quick Pop-up Trigger) */}
      {showTopClansModal && activeTab !== 'clan_friends' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-4xl relative my-6">
            <button
              type="button"
              onClick={() => setShowTopClansModal(false)}
              className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#212121] flex items-center justify-center border border-slate-200 shadow-lg cursor-pointer"
            >
              ✕
            </button>
            <TopClansDataTable
              currentUser={user}
              onUpdateUser={onUpdateUser}
              onSelectClan={(clan) => {
                setSoundEffectToast(`🛡️ ${clan.name} (Rank #${clan.rank}) चयनित हुआ!`);
                setTimeout(() => setSoundEffectToast(null), 3000);
              }}
            />
          </div>
        </div>
      )}

      {/* 18. Digital Gift Cards & Vouchers Modal (Amazon, Flipkart, Google Play, UPI Cash) */}
      <DigitalGiftCardsModal
        isOpen={showDigitalGiftCardsModal}
        user={user}
        onClose={() => setShowDigitalGiftCardsModal(false)}
        onUpdateUser={onUpdateUser}
        onOpenBuyCoins={() => {
          setShowDigitalGiftCardsModal(false);
          setActiveTab('recharge_convert');
        }}
      />

      {/* 19. ESP CHAT Modal (1-on-1 DM, Game Invites & Personal Locked Room Invites) */}
      <EspChatModal
        currentUser={user}
        isOpen={showEspChatModal}
        onClose={() => setShowEspChatModal(false)}
        onUpdateUser={onUpdateUser}
        onAcceptGameInvite={(gameKey) => handleLaunchGameByKey(gameKey)}
        onAcceptRoomInvite={async (roomAddress, passcode) => {
          try {
            const lookup = await api.lookupVoiceRoom(roomAddress, user.userId);
            if (lookup?.success && lookup.room) {
              await handleJoinAndSwitchRoom(lookup.room, passcode);
            } else {
              showToast(`रूम #${roomAddress} नहीं मिला`, 'error');
            }
          } catch {
            showToast('रूम जॉइन करने में त्रुटि', 'error');
          }
        }}
      />

      {/* 20. Interactive 8D Gaming Arena Modal (Liar's Party, Crazy Alpaca, Pool, Mic Grab, Ludo, Drawing, Hide & Seek) */}
      {activeInteractiveGame && (
        <InteractiveGameArenaModal
          gameKey={activeInteractiveGame}
          currentUser={user}
          isOpen={Boolean(activeInteractiveGame)}
          onClose={() => setActiveInteractiveGame(null)}
          onOpenBuyCoins={() => {
            setActiveInteractiveGame(null);
            setActiveTab('recharge_convert');
          }}
          onUpdateCoins={(newCoins) => {
            const latest = api.getStoredUser();
            const updated =
              latest && latest.userId === user.userId
                ? { ...latest, coins: newCoins }
                : { ...user, coins: newCoins };
            onUpdateUser(updated);
            api.setStoredUser(updated);
          }}
        />
      )}

      {/* 20B. Dedicated Real Playable Modals for Bingo Live, Oh My Card, and Snake Rush */}
      {activeBoardGameModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
              <div className="font-black text-sm">
                {activeBoardGameModal === 'bingo'
                  ? '🎱 Bingo Live Tambola'
                  : activeBoardGameModal === 'cards'
                  ? '🃏 Oh My Card Duel'
                  : '🐍 Snake Rush 2D'}
              </div>
              <button
                type="button"
                onClick={() => setActiveBoardGameModal(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-[84vh] overflow-y-auto">
              {activeBoardGameModal === 'bingo' && (
                <BingoGame
                  user={user}
                  onCoinsUpdated={(newCoins: number) => {
                    const latest = api.getStoredUser();
                    onUpdateUser(latest && latest.userId === user.userId ? { ...latest, coins: newCoins } : { ...user, coins: newCoins });
                  }}
                  onOpenBuyCoins={() => {
                    setActiveBoardGameModal(null);
                    setActiveTab('recharge_convert');
                  }}
                />
              )}
              {activeBoardGameModal === 'cards' && (
                <OhMyCardGame
                  user={user}
                  onCoinsUpdated={(newCoins: number) => {
                    const latest = api.getStoredUser();
                    onUpdateUser(latest && latest.userId === user.userId ? { ...latest, coins: newCoins } : { ...user, coins: newCoins });
                  }}
                  onOpenBuyCoins={() => {
                    setActiveBoardGameModal(null);
                    setActiveTab('recharge_convert');
                  }}
                />
              )}
              {activeBoardGameModal === 'snake' && (
                <SnakeRushGame
                  user={user}
                  onCoinsUpdated={(newCoins: number) => {
                    const latest = api.getStoredUser();
                    onUpdateUser(latest && latest.userId === user.userId ? { ...latest, coins: newCoins } : { ...user, coins: newCoins });
                  }}
                  onOpenBuyCoins={() => {
                    setActiveBoardGameModal(null);
                    setActiveTab('recharge_convert');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 21. Two-Player Relationship Tags & CP Token Store Modal */}
      {showRelationshipsModal && (
        <RelationshipBondsModal
          user={user}
          onClose={() => setShowRelationshipsModal(false)}
          onUserUpdated={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowRelationshipsModal(false);
            setActiveTab('recharge_convert');
          }}
        />
      )}

      {/* 22. ESP PLAY Family Hub (Create, Join, Invite, Family Coins & Live Family Chat + Gift Effects) */}
      {showFamilyHubModal && (
        <EspFamilyHubModal
          user={user}
          onClose={() => setShowFamilyHubModal(false)}
          onUserUpdated={onUpdateUser}
          onTriggerGiftAnimation={(anim) => setActiveGiftAnimation(anim)}
          onOpenBuyCoins={() => {
            setShowFamilyHubModal(false);
            setActiveTab('recharge_convert');
          }}
        />
      )}

      {/* 23. My Home Showcase & Events Center Modal */}
      {eventsMyHomeState.open && (
        <EspEventsAndMyHomeModal
          user={user}
          initialTab={eventsMyHomeState.tab}
          onClose={() => setEventsMyHomeState(prev => ({ ...prev, open: false }))}
          onUserUpdated={onUpdateUser}
          onOpenRelationships={() => {
            setEventsMyHomeState(prev => ({ ...prev, open: false }));
            setShowRelationshipsModal(true);
          }}
          onOpenFamily={() => {
            setEventsMyHomeState(prev => ({ ...prev, open: false }));
            setShowFamilyHubModal(true);
          }}
          onOpenGiftWall={() => {
            setEventsMyHomeState(prev => ({ ...prev, open: false }));
            setShowOwnGiftWallModal(true);
          }}
          onJoinMyRoom={() => {
            setEventsMyHomeState(prev => ({ ...prev, open: false }));
            loadMyPersonalRoom(true);
          }}
        />
      )}

      {/* 24. Personal Gift Wall & Full Gift History Modal */}
      {showOwnGiftWallModal && (
        <GiftWallModal
          isOpen={showOwnGiftWallModal}
          recipientUserId={user.userId}
          recipientName={user.fullName}
          recipientAvatar={user.avatar}
          recipientRoomAddress={user.roomAddress || cleanUserRoomFallback}
          isVipRoom={Boolean(user.isVipRoom || isVipFancyRoomNumber(user.roomAddress))}
          giftWall={Object.values(user.receivedGifts || {}) as GiftWallEntry[]}
          isOwnProfile={true}
          onClose={() => setShowOwnGiftWallModal(false)}
          onSendCatalogGift={(gift) => {
            setShowOwnGiftWallModal(false);
            setAppGiftPreset({ giftId: gift.id, targetName: user.fullName, targetUserId: user.userId });
            setShowAppGiftModal(true);
          }}
        />
      )}
    </div>
  );
};
