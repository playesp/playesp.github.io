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
  Bot,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { UserProfile, PlatformSettings, VoiceRoomSeat, RoomGift, ClanInfo, CoinRechargeRequest, WePlayBot } from '../types/index.ts';
import { api } from '../services/api.ts';
import { SnakeRushGame } from '../components/games/SnakeRushGame.tsx';
import { BingoGame } from '../components/games/BingoGame.tsx';
import { OhMyCardGame } from '../components/games/OhMyCardGame.tsx';
import { PlayerInfoModal, type RealPlayerProfile } from '../components/PlayerInfoModal.tsx';
import { AvatarFrame, type FrameVariant } from '../components/AvatarFrame.tsx';
import { WePlayBotHubModal } from '../components/games/WePlayBotHubModal.tsx';
import { WerewolfGameModal } from '../components/games/WerewolfGameModal.tsx';
import { VoiceEffectSelector, VOICE_EFFECTS, type VoiceEffectType } from '../components/VoiceEffectSelector.tsx';
import { DailyLuckySpin } from '../components/games/DailyLuckySpin.tsx';
import { WhoIsTheSpyGameModal } from '../components/games/WhoIsTheSpyGameModal.tsx';
import { VoiceRoomMediaStage } from '../components/VoiceRoomMediaStage.tsx';
import { LeaderboardWidget, type LeaderboardUser } from '../components/games/LeaderboardWidget.tsx';
import { DailyFortuneSpinModal } from '../components/games/DailyFortuneSpinModal.tsx';
import { TimedMysteryChestModal } from '../components/games/TimedMysteryChestModal.tsx';
import { WePlayAppGiftModal, ALL_APP_GIFTS, type AppGiftItem } from '../components/games/WePlayAppGiftModal.tsx';
import { DailyTasksAndLoginModal } from '../components/games/DailyTasksAndLoginModal.tsx';
import { AdvanceRoomStoreModal, ADVANCE_ROOM_THEMES, type AdvanceRoomTheme } from '../components/games/AdvanceRoomStoreModal.tsx';
import { WePlayHomeLobby } from '../components/games/WePlayHomeLobby.tsx';
import { TopClansDataTable, type ClanRecord } from '../components/TopClansDataTable.tsx';
import { DailyMissionsModal } from '../components/DailyMissionsModal.tsx';
import { AvatarCustomizerModal } from '../components/AvatarCustomizerModal.tsx';
import { DigitalGiftCardsModal } from '../components/DigitalGiftCardsModal.tsx';
import { DailyLoginRewardsModal } from '../components/DailyLoginRewardsModal.tsx';
import { DailyLoginRewards } from '../services/DailyLoginRewardsService.ts';
import { EspChatModal } from '../components/EspChatModal.tsx';
import { InteractiveGameArenaModal, type GameKey } from '../components/games/InteractiveGameArenaModal.tsx';
import { CreditCard as CreditCardIcon } from 'lucide-react';
import { showToast } from '../services/toast.ts';

interface GamingRoomViewProps {
  user: UserProfile;
  settings?: PlatformSettings;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenCardModal?: (tab?: string) => void;
  onOpenWithdrawal?: () => void;
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

const RECHARGE_PACKS = [
  { id: 'p1', coins: 100, amount: 10, bonus: 10, tag: 'Starter' },
  { id: 'p2', coins: 550, amount: 50, bonus: 50, tag: 'Popular' },
  { id: 'p3', coins: 1200, amount: 100, bonus: 200, tag: 'Best Value' },
  { id: 'p4', coins: 3500, amount: 250, bonus: 500, tag: 'Pro Pack' },
  { id: 'p5', coins: 7500, amount: 500, bonus: 1000, tag: 'VIP Pack' },
  { id: 'p6', coins: 15000, amount: 1000, bonus: 2500, tag: 'King Pack' },
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
}) => {
  // Navigation tabs within ESP Gaming Room (Default: 'games' - WePlay Home Image 1)
  const [activeTab, setActiveTab] = useState<'voice_room' | 'games' | 'recharge_convert' | 'clan_friends' | 'rewards_tasks'>('games');

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
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<RealPlayerProfile | null>(null);

  // Real Voice Room Host (ESP Founder Santosh Kumar)
  const [voiceRoomHost, setVoiceRoomHost] = useState<{
    userId: string;
    userName: string;
    gameLevel: number;
    charms: number;
    userAvatar: string;
    isSpeaking: boolean;
    roleTitle: string;
  }>({
    userId: 'EMO-MOM-MMO',
    userName: 'SANTOSH KUMAR',
    gameLevel: 25,
    charms: 12500,
    userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    isSpeaking: true,
    roleTitle: 'ESP Founder & Room Host',
  });

  // Selected seat for interaction popup
  const [selectedSeatAction, setSelectedSeatAction] = useState<VoiceRoomSeat | null>(null);

  // Stage mini-game overlay
  const [showStageGameOverlay, setShowStageGameOverlay] = useState(false);

  // WePlay AI Bot Ecosystem State
  const [showBotHubModal, setShowBotHubModal] = useState(false);
  const [showWerewolfModal, setShowWerewolfModal] = useState(false);
  const [showSpyGameModal, setShowSpyGameModal] = useState(false);
  const [availableBots, setAvailableBots] = useState<WePlayBot[]>([]);
  const [sharmaJiLegend, setSharmaJiLegend] = useState<any>(null);
  const [botVoiceTts, setBotVoiceTts] = useState(true);
  const [selectedSeatForBot, setSelectedSeatForBot] = useState<number | null>(null);

  // Simulated Voice Effect State
  const [selectedVoiceEffect, setSelectedVoiceEffect] = useState<VoiceEffectType>(() => {
    try {
      return (localStorage.getItem('esp_voice_effect') as VoiceEffectType) || 'normal';
    } catch {
      return 'normal';
    }
  });
  const [showVoiceEffectModal, setShowVoiceEffectModal] = useState(false);
  const [pendingJoinSeatIndex, setPendingJoinSeatIndex] = useState<number | null>(null);
  const [showEffectTrayInline, setShowEffectTrayInline] = useState(false);

  // Soundboard feedback
  const [soundEffectToast, setSoundEffectToast] = useState<string | null>(null);

  // New Feature States
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showFortuneSpinModal, setShowFortuneSpinModal] = useState(false);
  const [showTimedChestModal, setShowTimedChestModal] = useState(false);
  const [showAppGiftModal, setShowAppGiftModal] = useState(false);
  const [showDailyTasksModal, setShowDailyTasksModal] = useState(false);
  const [showRoomStoreModal, setShowRoomStoreModal] = useState(false);
  const [showTopClansModal, setShowTopClansModal] = useState(false);
  const [showDailyMissionsModal, setShowDailyMissionsModal] = useState(false);
  const [showAvatarCustomizerModal, setShowAvatarCustomizerModal] = useState(false);
  const [showDigitalGiftCardsModal, setShowDigitalGiftCardsModal] = useState(false);
  
  // Real Time Weekly Rewards Modal State (defaults to true if canClaimToday)
  const [showWeeklyRewardsModal, setShowWeeklyRewardsModal] = useState<boolean>(() => {
    return DailyLoginRewards.checkStatus(user).canClaimToday;
  });

  // ESP CHAT Modal State (Facebook-style Social Friend & Chat Network)
  const [showEspChatModal, setShowEspChatModal] = useState(false);

  // 8D Interactive Game Arena Modal State
  const [activeInteractiveGame, setActiveInteractiveGame] = useState<GameKey | null>(null);

  const [seatingTimerSeconds, setSeatingTimerSeconds] = useState(0);
  const [seatingRewardNotice, setSeatingRewardNotice] = useState<string | null>(null);

  // Real-time Voice Room Seating Reward (+5 coins every 60 seconds on mic)
  useEffect(() => {
    if (mySeatIndex === null) {
      setSeatingTimerSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      setSeatingTimerSeconds(prev => {
        const next = prev + 1;
        if (next >= 60) {
          api.claimSeatReward(user.userId, 1).then(res => {
            if (res && res.success && res.coinsEarned) {
              setSeatingRewardNotice(`🎉 माइक सीट रिवॉर्ड: +${res.coinsEarned} कॉइन्स मिले!`);
              setTimeout(() => setSeatingRewardNotice(null), 4000);
              onUpdateUser({
                ...user,
                coins: (user.coins || 0) + res.coinsEarned,
              });
            }
          }).catch(console.error);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mySeatIndex, user.userId]);

  // Real Players vs Solo Bot System
  const [multiplayerMode, setMultiplayerMode] = useState<'real_players' | 'solo_bot'>('real_players');

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

  const toggleMultiplayerMode = async () => {
    if (multiplayerMode === 'real_players') {
      setMultiplayerMode('solo_bot');
      await handleSummonAllBots();
      setSoundEffectToast('🤖 सोलो बॉट मोड सक्रिय! शर्मा जी व ESP PLAY बॉट्स आपके साथ खेलेंगे।');
      setTimeout(() => setSoundEffectToast(null), 3500);
    } else {
      setMultiplayerMode('real_players');
      // Clear bot seats, keeping only current user seat
      setSeats(prev => prev.map(s => {
        if (s.userId && s.userId.toLowerCase() === (user.userId || '').toLowerCase()) return s;
        return {
          seatNumber: s.seatNumber,
          seatNumberLabel: String(s.seatNumber),
          isMuted: false,
          isSpeaking: false,
          charms: 0,
        };
      }));
      setSoundEffectToast('👥 रियल प्लेयर्स मोड सक्रिय! अब केवल असली ऑनलाइन मेंबर्स बैठेंगे।');
      setTimeout(() => setSoundEffectToast(null), 3500);
    }
  };

  // Room Chat stream (Real live server chat with real voice audio notes)
  const [roomChatMessages, setRoomChatMessages] = useState<Array<{ id: string; sender: string; text: string; isGift?: boolean; time: string; senderRoll?: string; audioDataUrl?: string; audioDuration?: number; isVoiceNote?: boolean }>>([]);
  const [chatInput, setChatInput] = useState('');

  // ==============================================================
  // MULTI-ROOM VOICE STATE (Har user ka khud ka voice room)
  // ==============================================================
  const [currentRoomId, setCurrentRoomId] = useState<string>('room-founder');
  const [activeRoomTitle, setActiveRoomTitle] = useState<string>('ESP Royal Voice Stage #1 (Official Stage)');
  const [activeRoomTopic, setActiveRoomTopic] = useState<string>('Daily ₹500 - ₹2000 Earnings with 10 ESP Services & Games');
  const [activeRoomCategory, setActiveRoomCategory] = useState<string>('earning');
  const [activeRoomAddress, setActiveRoomAddress] = useState<string>('ESP-ROOM-FOUNDER-01');
  const [activeRoomHostId, setActiveRoomHostId] = useState<string>('EMO-MOM-MMO');
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [showRoomsModal, setShowRoomsModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showHostSettingsModal, setShowHostSettingsModal] = useState(false);
  const [editTopicInput, setEditTopicInput] = useState('');
  
  // New Room Creation Form
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState<'earning' | 'gaming' | 'chitchat' | 'clan' | 'help'>('earning');
  const [newRoomIsPrivate, setNewRoomIsPrivate] = useState(false);
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomActionFeedback, setRoomActionFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<{ gift: RoomGift; sender: string; target: string } | null>(null);
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

  const registerGiftCombo = (baseCharms: number, giftName: string) => {
    const now = Date.now();
    const timeSinceLast = now - lastGiftTimeRef.current;
    lastGiftTimeRef.current = now;

    let newCombo = 1;
    if (timeSinceLast < 12000 && lastGiftTimeRef.current !== 0 && giftComboCount > 0) {
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
      }, 4500);
    }

    if (comboResetTimerRef.current) clearTimeout(comboResetTimerRef.current);
    comboResetTimerRef.current = setTimeout(() => {
      setGiftComboCount(0);
      setGiftComboMultiplier(1);
      setGiftComboBonusCharms(0);
    }, 12000);

    return { newCombo, multiplier, bonusCharms, totalCharmsAwarded };
  };

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

  // Convert to Cash State
  const [convertCoinsInput, setConvertCoinsInput] = useState<number>(100);
  const [convertStatusMessage, setConvertStatusMessage] = useState<string | null>(null);

  // Real Recharge State
  const [selectedPack, setSelectedPack] = useState(RECHARGE_PACKS[1]);
  const [rechargeUtr, setRechargeUtr] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);
  const [rechargeError, setRechargeError] = useState<string | null>(null);
  const [isRecharging, setIsRecharging] = useState(false);
  const [userRecharges, setUserRecharges] = useState<CoinRechargeRequest[]>([]);
  const [copiedUpi, setCopiedUpi] = useState(false);

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

  // Text-To-Speech (TTS) Reader for room messages with simulated voice effect
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');
      const utter = new SpeechSynthesisUtterance(clean);
      const activeEffect = VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect);
      utter.rate = activeEffect ? activeEffect.ttsRate : 1.0;
      utter.pitch = activeEffect ? activeEffect.ttsPitch : 1.0;
      window.speechSynthesis.speak(utter);
    }
  };

  // Fetch Real Voice Room State & Community Rooms
  const loadVoiceRoomData = async (targetRoomId = currentRoomId) => {
    try {
      const res = await api.getVoiceRoomState(targetRoomId);
      if (res && res.success) {
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
          setActiveRoomTitle(res.room.title || 'ESP Voice Stage');
          setActiveRoomTopic(res.room.topic || 'General Strategy');
          setActiveRoomCategory(res.room.category || 'earning');
          setActiveRoomAddress(res.room.roomAddress || `ESP-ROOM-${res.room.hostUserId || user.userId}`);
          setActiveRoomHostId(res.room.hostUserId);
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
      }
    } catch (e) {
      console.warn('Voice room state load error', e);
    }
  };

  const loadAvailableRooms = async () => {
    try {
      const res = await api.getVoiceRooms();
      if (res && res.success && Array.isArray(res.rooms)) {
        setAvailableRooms(res.rooms);
      }
    } catch (e) {
      console.warn('Failed to load voice rooms list', e);
    }
  };

  const loadBots = async () => {
    try {
      const res = await api.getBots();
      if (res && res.success) {
        setAvailableBots(res.bots || []);
        if (res.sharmaJiLegend) {
          setSharmaJiLegend(res.sharmaJiLegend);
        }
      }
    } catch (e) {
      console.warn('Failed to load bots', e);
    }
  };

  const handleInviteBotToSeat = async (botId: string, seatIdx?: number) => {
    try {
      const res = await api.inviteBotToSeat(botId, seatIdx, currentRoomId);
      if (res && res.success) {
        setSeats(res.seats);
        if (res.chatMessages) setRoomChatMessages(res.chatMessages);
        playSynthesizedChime('win');
        setSoundEffectToast(res.message);
        setTimeout(() => setSoundEffectToast(null), 4000);
        if (botVoiceTts && res.message) {
          speakMessage(res.message);
        }
      } else {
        setSoundEffectToast(res?.message || 'सीट उपलब्ध नहीं है।');
        setTimeout(() => setSoundEffectToast(null), 3000);
      }
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'बॉट को सीट पर नहीं बैठाया जा सका');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  const handleSummonAllBots = async () => {
    try {
      const res = await api.summonAllBots(currentRoomId);
      if (res && res.success) {
        setSeats(res.seats);
        if (res.chatMessages) setRoomChatMessages(res.chatMessages);
        playSynthesizedChime('win');
        confetti({ particleCount: 120, spread: 80 });
        setSoundEffectToast(res.message);
        setTimeout(() => setSoundEffectToast(null), 4500);
        if (botVoiceTts) {
          speakMessage('सभी ESP PLAY बॉट्स व शर्मा जी स्टेज पर आ चुके हैं!');
        }
      }
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'बॉट्स को बुलाने में समस्या आई');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  const handleBotAction = async (botCode: string, actionType?: string) => {
    try {
      const res = await api.interactWithBot(botCode, user.userId, actionType, currentRoomId);
      if (res && res.success) {
        if (res.chatMessages) setRoomChatMessages(res.chatMessages);
        if (res.userCoins !== undefined) {
          onUpdateUser({
            ...user,
            coins: res.userCoins,
            charms: res.userCharms !== undefined ? res.userCharms : user.charms,
          });
        }
        playSynthesizedChime('win');
        if (res.message && botVoiceTts) {
          speakMessage(res.message.text);
        }
        if (res.coinsAwarded > 0) {
          setSoundEffectToast(`🎉 ${res.message.sender} ने आपको +${res.coinsAwarded} कॉइन्स रिवॉर्ड दिए!`);
          setTimeout(() => setSoundEffectToast(null), 4000);
        }
      }
    } catch (err: any) {
      console.warn('Bot action error', err);
    }
  };

  const loadRealPlayers = async () => {
    try {
      const players = await api.getRealCommunityPlayers();
      if (Array.isArray(players) && players.length > 0) {
        setRealPlayers(players);
        setAudienceCount(Math.max(players.length, 1));
      }
    } catch (e) {
      console.warn('Real players load error', e);
    }
  };

  useEffect(() => {
    loadVoiceRoomData(currentRoomId);
    loadAvailableRooms();
    loadRealPlayers();
    loadBots();
    const timer = setInterval(() => {
      loadVoiceRoomData(currentRoomId);
      loadAvailableRooms();
      loadRealPlayers();
    }, 4000);
    return () => clearInterval(timer);
  }, [user.userId, currentRoomId]);

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

  // Real Mic & Speaker Loopback Test (Check voice in headphones/speakers with selected voice effect)
  const testSpeakerAndMic = async () => {
    const ok = await enableMicrophone();
    if (!ok || !micStreamRef.current) return;

    try {
      setIsLoopbackTesting(true);
      const activeEffect = VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect);
      setLoopbackNotice(`🔊 आवाज़ टेस्ट (${activeEffect?.icon} ${activeEffect?.name}): माइक में बोलें, आपके स्पीकर/हेडफोन में ${activeEffect?.hindiName} सुनाई देगी...`);
      const ctx = audioCtxRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      const source = ctx.createMediaStreamSource(micStreamRef.current);
      const mainGain = ctx.createGain();
      mainGain.gain.value = 0.85;

      // Apply real audio DSP chain according to selected simulated voice effect
      let endNode: AudioNode = source;

      if (selectedVoiceEffect === 'robot') {
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 850;
        bandpass.Q.value = 3.5;
        source.connect(bandpass);
        endNode = bandpass;
      } else if (selectedVoiceEffect === 'deep') {
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 460;
        lowpass.Q.value = 2.0;

        const bassBoost = ctx.createBiquadFilter();
        bassBoost.type = 'lowshelf';
        bassBoost.frequency.value = 160;
        bassBoost.gain.value = 11;

        source.connect(lowpass);
        lowpass.connect(bassBoost);
        endNode = bassBoost;
      } else if (selectedVoiceEffect === 'chipmunk') {
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 1200;
        highpass.Q.value = 1.8;

        const trebleBoost = ctx.createBiquadFilter();
        trebleBoost.type = 'highshelf';
        trebleBoost.frequency.value = 3200;
        trebleBoost.gain.value = 9;

        source.connect(highpass);
        highpass.connect(trebleBoost);
        endNode = trebleBoost;
      } else if (selectedVoiceEffect === 'radio') {
        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1750;
        bandpass.Q.value = 3.8;
        source.connect(bandpass);
        endNode = bandpass;
      } else if (selectedVoiceEffect === 'echo') {
        const delay = ctx.createDelay();
        delay.delayTime.value = 0.22;

        const feedback = ctx.createGain();
        feedback.gain.value = 0.45;

        const echoMix = ctx.createGain();
        source.connect(echoMix);
        source.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(echoMix);
        endNode = echoMix;
      }

      endNode.connect(mainGain);
      mainGain.connect(ctx.destination);

      setTimeout(() => {
        try {
          mainGain.disconnect();
        } catch {}
        setIsLoopbackTesting(false);
        setLoopbackNotice(`✅ टेस्ट पूरा: आपका माइक व ${activeEffect?.name} इफ़ेक्ट 100% सही काम कर रहा है!`);
        setTimeout(() => setLoopbackNotice(null), 3500);
      }, 5000);
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
          const activeEffect = VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect);
          const res = await api.sendVoiceAudioClip(
            user.userId,
            base64Audio,
            duration,
            currentRoomId,
            activeEffect ? { id: activeEffect.id, name: activeEffect.name, icon: activeEffect.icon } : undefined
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
        hostLevel: user.gameLevel || 5,
        hostCharms: user.charms || 150,
      });

      if (res && res.success && res.roomId) {
        setShowCreateRoomModal(false);
        setNewRoomTitle('');
        setNewRoomTopic('');
        setNewRoomPasscode('');
        setRoomActionFeedback(null);
        setCurrentRoomId(res.roomId);
        await loadVoiceRoomData(res.roomId);
        await loadAvailableRooms();
        playSynthesizedChime('win');
        confetti({ particleCount: 100, spread: 70 });
        setSoundEffectToast(`🎉 आपका नया वॉइस रूम "${title}" लाइव हो गया है! आप सीट #1 पर स्टेज होस्ट हैं।`);
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

  const handleSwitchRoom = (roomId: string) => {
    playSynthesizedChime('click');
    setCurrentRoomId(roomId);
    setShowRoomsModal(false);
    loadVoiceRoomData(roomId);
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

  // Host Controls: Mute or Kick a Seat
  const handleHostMuteSeat = async (seatIdx: number, mute: boolean) => {
    try {
      const activeHostId = user.userId || user.id || 'ESP-GUEST-01';
      const res = await api.manageVoiceSeatHostAction({
        roomId: currentRoomId,
        hostUserId: activeHostId,
        action: mute ? 'mute' : 'unmute',
        seatIndex: seatIdx,
      });
      if (res && res.seats) {
        setSeats(res.seats);
      }
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'एक्शन नहीं लिया जा सका');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  const handleHostKickSeat = async (seatIdx: number) => {
    try {
      const activeHostId = user.userId || user.id || 'ESP-GUEST-01';
      const res = await api.manageVoiceSeatHostAction({
        roomId: currentRoomId,
        hostUserId: activeHostId,
        action: 'kick',
        seatIndex: seatIdx,
      });
      if (res && res.seats) {
        setSeats(res.seats);
      }
      playSynthesizedChime('click');
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'सीट खाली नहीं की जा सकी');
      setTimeout(() => setSoundEffectToast(null), 3000);
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

  // Open Real Player Digital Profile Modal
  const handleOpenPlayerModal = async (userId: string, fallback?: Partial<RealPlayerProfile>) => {
    try {
      const res = await api.getPlayerProfile(userId);
      if (res && res.success && res.profile) {
        setSelectedPlayerProfile(res.profile);
        return;
      }
    } catch (e) {
      console.warn('Error fetching real player profile', e);
    }
    if (fallback) {
      setSelectedPlayerProfile(fallback as RealPlayerProfile);
    }
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

  // Real Room Chat Send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');
    try {
      const res = await api.sendVoiceRoomChat(user.userId, text, false, currentRoomId);
      if (res && res.success && res.chatMessages) {
        setRoomChatMessages(res.chatMessages);
      }
    } catch (err) {
      console.warn('Failed to send chat', err);
    }
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
        totalCharmsAwarded
      );

      playSynthesizedChime(newCombo >= 2 ? 'win' : 'gift');

      // Trigger full visual animation
      setActiveGiftAnimation({
        gift: {
          ...selectedGift,
          charmValue: totalCharmsAwarded,
        },
        sender: user.fullName,
        target: finalTarget,
      });

      const comboText = newCombo >= 2 ? `🔥 [COMBO x${newCombo}! ${multiplier}x] (+${bonusCharms} BONUS CHARMS!)` : '';
      setGiftAnnouncement(`🎁 [LIVE GIFTING] ${user.fullName} ने ${finalTarget} को ${selectedGift.name} (${selectedGift.icon}) भेंट किया! (+${totalCharmsAwarded} Charms ✨) ${comboText}`);

      confetti({
        particleCount: newCombo >= 2 ? 220 : 150,
        spread: newCombo >= 2 ? 100 : 90,
        origin: { y: 0.6 }
      });

      // Update user coins and charms with combo bonus
      onUpdateUser({
        ...user,
        coins: res.coins,
        charms: (user.charms || 0) + totalCharmsAwarded,
      });

      // Add to room chat with combo tags
      setRoomChatMessages(prev => [
        ...prev,
        {
          id: `gift-${Date.now()}`,
          sender: newCombo >= 2 ? `🔥 COMBO x${newCombo}` : 'LUXURY GIFT',
          isGift: true,
          text: `🎁 [LIVE GIFT] ${user.fullName} gifted ${selectedGift.name} ${selectedGift.icon} to ${finalTarget}! (+${totalCharmsAwarded} Charms ✨ ${comboText})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      setShowGiftModal(false);
      setSelectedSeatAction(null);

      setTimeout(() => {
        setActiveGiftAnimation(null);
        setGiftAnnouncement(null);
      }, 5500);
    } catch (err: any) {
      setSoundEffectToast(err?.message || 'गिफ्ट भेजने में समस्या आई।');
      setTimeout(() => setSoundEffectToast(null), 3000);
    }
  };

  // Play Coin Game Action (Spin / Dice / Coin Flip)
  const handlePlayGame = async (gameOverride?: string, choiceOverride?: string) => {
    if (isGameSpinning) return;
    if ((user.coins || 0) < betAmount) {
      setSoundEffectToast(`सिक्के कम हैं! कृपया रिचार्ज करें या 7-डे लॉगिन रिवॉर्ड क्लेम करें।`);
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

  // Convert Coins to Cash
  const handleConvertCoins = async () => {
    if ((user.coins || 0) < convertCoinsInput) {
      showToast('सिक्के कम हैं!', 'warning');
      return;
    }

    try {
      const res = await api.convertCoins(user.userId, convertCoinsInput);
      setConvertStatusMessage(res.message);
      playSynthesizedChime('win');
      onUpdateUser({
        ...user,
        coins: res.coins,
        balance: res.balance,
      });
      setTimeout(() => setConvertStatusMessage(null), 4000);
    } catch (err: any) {
      showToast(err?.message || 'कन्वर्शन में त्रुटि हुई', 'error');
    }
  };

  // Fetch User's Coin Recharges
  const loadUserRecharges = async () => {
    try {
      const res = await api.getUserCoinRecharges(user.userId);
      if (res.success && res.recharges) {
        setUserRecharges(res.recharges);
      }
    } catch (e) {
      console.warn('Failed to fetch user recharges', e);
    }
  };

  useEffect(() => {
    loadUserRecharges();
  }, [user.userId]);

  // Real UPI Recharge Coins
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

    setIsRecharging(true);
    try {
      const res = await api.rechargeCoins(
        user.userId,
        selectedPack.coins,
        selectedPack.amount,
        cleanUtr,
        selectedPack.bonus,
        selectedPack.id
      );

      setRechargeSuccess(
        `✅ आपका रिचार्ज अनुरोध दर्ज कर लिया गया है (UTR: ${cleanUtr})! एडमिन खाते में 12-अंक UTR सत्यापन के बाद 10-15 मिनट में आपके प्रोफाइल में +${selectedPack.coins + selectedPack.bonus} सिक्के क्रेडिट कर दिए जाएंगे।`
      );
      setRechargeUtr('');
      playSynthesizedChime('win');
      loadUserRecharges();
    } catch (err: any) {
      setRechargeError(err?.message || 'रिचार्ज सबमिट करने में समस्या आई।');
    } finally {
      setIsRecharging(false);
    }
  };

  // Claim 7-Day Login Reward
  const handleClaimLoginReward = async (day: number) => {
    try {
      const res = await api.claimLoginReward(user.userId, day);
      confetti({ particleCount: 80, spread: 60 });
      playSynthesizedChime('win');
      showToast(res.message, 'reward');
      onUpdateUser({
        ...user,
        coins: res.coins,
        claimedDays: res.claimedDays,
        loginStreak: res.loginStreak,
      });
    } catch (err: any) {
      showToast(err?.message || 'रिवॉर्ड क्लेम नहीं हो सका', 'error');
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
    <div className={`w-full flex flex-col items-center pb-24 relative overflow-x-hidden ${activeTab === 'games' ? 'bg-[#fcfdff] text-[#212121]' : 'bg-[#f1f3f6] text-[#212121]'}`}>
      
      {/* ============================================================== */}
      {/* 1. FULL-SCREEN SPECTACULAR LIVE GIFTING VISUAL EFFECTS         */}
      {/* ============================================================== */}
      {activeGiftAnimation && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn overflow-hidden">
          
          {/* Custom Visual Effect based on Gift Animation Type */}
          {activeGiftAnimation.gift.animationType === 'rose' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-8xl animate-bounce filter drop-shadow-[0_0_30px_rgba(244,63,94,0.9)]">
                🌹
              </div>
              <div className="absolute top-1/4 text-6xl animate-ping">💖</div>
              <div className="absolute bottom-1/4 text-5xl animate-pulse">🌸</div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'chocolate' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-8xl animate-pulse filter drop-shadow-[0_0_30px_rgba(217,119,6,0.9)]">
                🍫
              </div>
              <div className="absolute text-5xl top-1/3 animate-bounce">🍬</div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'ring' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full border-4 border-cyan-400 animate-spin opacity-60" />
              <div className="text-8xl animate-bounce filter drop-shadow-[0_0_40px_rgba(6,182,212,1)]">
                💍
              </div>
              <div className="absolute text-4xl animate-ping">✨</div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'car' && (
            <div className="w-full flex items-center justify-center overflow-hidden">
              <div className="text-9xl transform -translate-x-10 animate-bounce filter drop-shadow-[0_0_40px_rgba(239,68,68,1)]">
                🏎️ 💨
              </div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'rocket' && (
            <div className="flex flex-col items-center animate-bounce">
              <div className="text-9xl filter drop-shadow-[0_0_50px_rgba(99,102,241,1)]">
                🚀
              </div>
              <div className="text-4xl animate-pulse mt-1">🔥 💨</div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'crown' && (
            <div className="flex flex-col items-center">
              <div className="text-9xl animate-bounce filter drop-shadow-[0_0_50px_rgba(245,158,11,1)]">
                👑
              </div>
              <div className="text-4xl animate-ping mt-2">⭐ ⭐ ⭐</div>
            </div>
          )}

          {activeGiftAnimation.gift.animationType === 'castle' && (
            <div className="flex flex-col items-center">
              <div className="text-9xl animate-pulse filter drop-shadow-[0_0_60px_rgba(168,85,247,1)]">
                🏰
              </div>
              <div className="text-4xl animate-bounce mt-2">🎆 🎆 🎆</div>
            </div>
          )}

          {/* Banner Details */}
          <div className="mt-8 text-center bg-black/80 px-8 py-4 rounded-3xl border-2 border-amber-400/80 shadow-2xl">
            <div className="text-xs font-black uppercase tracking-widest text-amber-300">
              👑 LIVE LUXURY GIFT CELEBRATION 👑
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-1">
              {activeGiftAnimation.gift.name} {activeGiftAnimation.gift.icon}
            </h2>
            <p className="text-sm font-bold text-cyan-300 mt-1">
              From <span className="text-white font-black">{activeGiftAnimation.sender}</span> to{' '}
              <span className="text-amber-300 font-black">{activeGiftAnimation.target}</span>
            </p>
            <div className="mt-2 text-xs font-mono font-bold text-pink-300 bg-pink-950/60 px-3 py-1 rounded-full border border-pink-500/40 inline-block">
              ✨ +{activeGiftAnimation.gift.charmValue} Charms Added!
            </div>
          </div>
        </div>
      )}

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

      {/* Persistent Combo Indicator while streak is active */}
      {giftComboCount >= 2 && !giftComboBanner && (
        <div className="fixed bottom-24 right-4 z-40 bg-gradient-to-r from-rose-600 to-amber-600 border border-yellow-400/80 px-3.5 py-1.5 rounded-full shadow-lg flex items-center space-x-2 animate-pulse pointer-events-none">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-black text-white tracking-wide">
            COMBO x{giftComboCount} ({giftComboMultiplier}x CHARMS ACTIVE)
          </span>
        </div>
      )}



      {/* Top Gaming Profile Ribbon - Only shown when NOT in WePlay Home Games view */}
      {activeTab !== 'games' && (
        <div className="w-full bg-white border-b border-slate-200 px-4 py-3 relative z-10 shadow-xs text-[#212121]">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* User Address & Gaming Identity with Equipped Status Frame */}
            <div className="flex items-center space-x-3">
              <div
                className="relative cursor-pointer group"
                onClick={() => setShowAvatarCustomizerModal(true)}
                title="Click to Customize Avatar & Status Frame"
              >
                <AvatarFrame
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                  alt={user.fullName}
                  size="md"
                  frameType={(user.frameType as any) || 'pro-player'}
                  level={user.gameLevel || 5}
                  showCrown={user.frameType === 'clan-leader' || user.frameType === 'royal-dragon-crown'}
                />
                <span className="absolute -top-1 -right-1 text-[10px] bg-[#2874f0] rounded-full w-4 h-4 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition shadow">
                  ✏️
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-[#212121] text-sm tracking-wide">
                    {user.fullName}
                  </span>
                  <span className="bg-[#f5f8ff] text-[#2874f0] border border-blue-200 font-mono text-[10px] px-2 py-0.5 rounded-sm font-bold">
                    💼 ESP: {user.userId}
                  </span>
                  <span className="bg-amber-50 text-[#fb641b] border border-amber-200 font-mono text-[10px] px-2 py-0.5 rounded-sm font-bold">
                    🎮 GAME: {user.gamingId || `GAME-${user.userId.replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '887749'}`}
                  </span>
                  {user.vipTitle && (
                    <span className="text-[9px] px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] font-bold">
                      {user.vipTitle}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#878787] flex items-center space-x-2 mt-0.5">
                  <span className="text-[#2874f0] font-mono font-medium">🏠 {user.roomAddress || `ESP-ROOM-${user.userId}`}</span>
                  <span>•</span>
                  <span className="text-[#388e3c] font-semibold">{user.clanName || 'Royal Warriors ESP'}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Feature Triggers */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowDailyMissionsModal(true)}
                className="px-2.5 py-1.5 rounded-sm text-xs font-bold bg-[#f5f8ff] hover:bg-blue-100 border border-blue-200 text-[#2874f0] flex items-center space-x-1.5 transition cursor-pointer"
                title="Open Daily Missions"
              >
                <span>🎯</span>
                <span className="hidden sm:inline">Missions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('clan_friends');
                  setShowTopClansModal(true);
                }}
                className="px-2.5 py-1.5 rounded-sm text-xs font-bold bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 flex items-center space-x-1.5 transition cursor-pointer"
                title="View Top 5 Clans"
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Clans</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAvatarCustomizerModal(true)}
                className="px-2.5 py-1.5 rounded-sm text-xs font-bold bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center space-x-1.5 transition cursor-pointer"
                title="Customize Avatar & Frame"
              >
                <span>🎨</span>
                <span className="hidden sm:inline">Avatar</span>
              </button>

              <div className="bg-[#f9fafb] px-3 py-1.5 rounded-sm border border-slate-200 flex items-center space-x-1.5">
                <span className="text-base">🪙</span>
                <div>
                  <div className="text-[9px] text-[#878787] font-semibold">Coins</div>
                  <div className="text-xs font-bold text-[#212121] tabular-nums">
                    {(user.coins || 5000).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-[#f9fafb] px-3 py-1.5 rounded-sm border border-slate-200 flex items-center space-x-1.5">
                <span className="text-base">✨</span>
                <div>
                  <div className="text-[9px] text-[#878787] font-semibold">Charms</div>
                  <div className="text-xs font-bold text-[#fb641b] tabular-nums">
                    {user.charms || 150}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200 flex items-center space-x-1.5">
                <span className="text-base font-bold text-[#388e3c]">₹</span>
                <div>
                  <div className="text-[9px] text-[#388e3c] font-semibold">Cash</div>
                  <div className="text-xs font-bold text-[#388e3c] tabular-nums">
                    ₹{(user.balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('recharge_convert')}
                className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Recharge</span>
              </button>

              {/* Native Full Screen Toggle */}
              <button
                onClick={toggleFullScreen}
                className="px-3 py-1.5 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1c62d6] text-white transition cursor-pointer shadow-xs flex items-center space-x-1.5"
                title={isFullscreen ? 'नॉर्मल स्क्रीन करें' : 'फ़ुल स्क्रीन (Full Screen) करें'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Full Screen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Subtabs - Only shown when NOT in WePlay Home Games view */}
      {activeTab !== 'games' && (
        <div className="w-full max-w-6xl px-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              onClick={() => setActiveTab('games')}
              className="py-3 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              <div className="text-left">
                <div>ESP PLAY Home</div>
                <div className="text-[9px] font-normal opacity-90">लॉबी स्क्रीन</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('voice_room')}
              className={`py-3 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all border cursor-pointer ${
                activeTab === 'voice_room'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-[#f5f8ff]'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'voice_room' ? 'text-[#ffe500]' : 'text-[#2874f0]'}`} />
              <div className="text-left">
                <div>Voice Room</div>
                <div className="text-[9px] font-normal opacity-80">लाइव वॉइस स्टेज</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('recharge_convert')}
              className={`py-3 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all border cursor-pointer ${
                activeTab === 'recharge_convert'
                  ? 'bg-[#388e3c] border-[#388e3c] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-emerald-50'
              }`}
            >
              <ArrowRightLeft className={`w-4 h-4 ${activeTab === 'recharge_convert' ? 'text-white' : 'text-[#388e3c]'}`} />
              <div className="text-left">
                <div>Recharge & Convert</div>
                <div className="text-[9px] font-normal opacity-80">सिक्के खरीदें / बदलें</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('clan_friends')}
              className={`py-3 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all border cursor-pointer ${
                activeTab === 'clan_friends'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-[#f5f8ff]'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'clan_friends' ? 'text-[#ffe500]' : 'text-purple-600'}`} />
              <div className="text-left">
                <div>Family & Friends</div>
                <div className="text-[9px] font-normal opacity-80">क्लैन व दोस्त</div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('rewards_tasks')}
              className={`py-3 px-3 rounded-md font-bold text-xs flex items-center justify-center space-x-2 transition-all border cursor-pointer ${
                activeTab === 'rewards_tasks'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-[#212121] hover:bg-amber-50'
              }`}
            >
              <Calendar className={`w-4 h-4 ${activeTab === 'rewards_tasks' ? 'text-[#ffe500]' : 'text-[#fb641b]'}`} />
              <div className="text-left">
                <div>7-Day Login & Tasks</div>
                <div className="text-[9px] font-normal opacity-80">डेली रिवॉर्ड्स</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-6xl px-4 mt-4">
        {/* ============================================================== */}
        {/* TAB 1: WEPLAY-STYLE VOICE ROOM STAGE (FULL INTERACTIVE SETUP)  */}
        {/* ============================================================== */}
        {activeTab === 'voice_room' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeIn">
            {/* Left 2 Cols: Main Voice Stage & Mic Grid */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Voice Room Stage Banner with Custom Advance Wallpaper & Flipkart Light Default */}
              <div 
                style={roomBgTheme?.bgImageUrl ? { backgroundImage: `url(${roomBgTheme.bgImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                className={`rounded-xl p-4 sm:p-5 border shadow-sm relative overflow-hidden transition-all duration-300 ${
                  !isDarkStageBg
                    ? 'bg-white border-slate-200 text-[#212121]'
                    : !roomBgTheme?.bgImageUrl
                    ? `border-blue-400/50 bg-gradient-to-br ${roomBgTheme?.bgGradient || 'from-[#031336] via-[#092257] to-[#040d21]'} text-white`
                    : 'border-blue-400/50 bg-slate-950/80 bg-blend-darken text-white'
                }`}
              >
                {/* Divine Celestial Krishna Aura if Active */}
                {roomBgTheme?.isDivine && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
                    <div className="absolute top-2 right-4 text-7xl opacity-30 animate-pulse">🦚</div>
                    <div className="absolute bottom-4 left-6 text-5xl opacity-25">🪈</div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1 right-3 text-[9px] text-cyan-200/60 font-mono tracking-widest uppercase">
                      श्री कृष्ण दिव्य पैवेलियन • Celestial Divine Stage
                    </div>
                  </div>
                )}
                
                {/* Multi-Room Top Switcher Bar */}
                <div className="mb-3 pb-3 border-b border-blue-200 flex flex-wrap items-center justify-between gap-2 bg-[#f5f8ff]/95 backdrop-blur-xs p-2.5 rounded-md relative z-10 text-[#212121]">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => {
                        loadAvailableRooms();
                        setShowRoomsModal(true);
                      }}
                      className="bg-[#2874f0] hover:bg-[#1c62d6] text-white px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <Radio className="w-3.5 h-3.5 text-[#ffe500]" />
                      <span>🔄 रूम्स ({availableRooms.length})</span>
                    </button>

                    <button
                      onClick={() => setShowCreateRoomModal(true)}
                      className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>➕ रूम बनाएं</span>
                    </button>

                    <button
                      onClick={() => setShowRoomStoreModal(true)}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
                      title="रूम का बैकग्राउंड बदलें"
                    >
                      <span>🖼️ बैकग्राउंड</span>
                    </button>

                    <button
                      onClick={toggleMultiplayerMode}
                      className={`px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs ${
                        multiplayerMode === 'real_players'
                          ? 'bg-[#388e3c] hover:bg-emerald-700 text-white'
                          : 'bg-[#2874f0] hover:bg-[#1c62d6] text-white'
                      }`}
                      title="रियल प्लेयर्स vs सोलो बॉट मोड बदलें"
                    >
                      <span>{multiplayerMode === 'real_players' ? '👥 रियल प्लेयर्स' : '🤖 सोलो बॉट'}</span>
                    </button>

                    <button
                      onClick={() => setShowTimedChestModal(true)}
                      className="bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer transition"
                      title="8 Timed Mystery Boxes"
                    >
                      <span>🎁 8 बॉक्सेज</span>
                    </button>

                    <button
                      onClick={() => setShowFortuneSpinModal(true)}
                      className="bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold px-2.5 py-1.5 rounded-sm text-xs flex items-center space-x-1 shadow-xs cursor-pointer transition"
                      title="24H Daily Fortune Wheel"
                    >
                      <span>🎡 24H स्पिन</span>
                    </button>

                    <button
                      onClick={() => setShowLeaderboardModal(true)}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 font-bold px-2.5 py-1.5 rounded-sm text-xs flex items-center space-x-1 cursor-pointer transition"
                      title="Top 10 Earners & Gaming Players"
                    >
                      <Trophy className="w-3.5 h-3.5 text-[#fb641b]" />
                      <span>रैंकिंग</span>
                    </button>

                    <button
                      onClick={() => {
                        setPendingJoinSeatIndex(null);
                        setShowVoiceEffectModal(true);
                      }}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 px-2.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
                      title="माइक आवाज़ इफ़ेक्ट"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>{VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.icon} आवाज़</span>
                    </button>

                    <button
                      onClick={toggleFullScreen}
                      className="bg-white hover:bg-slate-50 text-[#2874f0] border border-blue-200 font-bold px-2.5 py-1.5 rounded-sm text-xs flex items-center space-x-1 transition cursor-pointer"
                      title={isFullscreen ? 'नॉर्मल स्क्रीन करें' : 'फुल स्क्रीन करें'}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      <span>{isFullscreen ? 'नॉर्मल' : '⛶ फुल'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-mono text-[#2874f0] bg-white px-2.5 py-1 rounded-sm border border-blue-200 font-bold flex items-center space-x-1">
                      <span>🏠 {activeRoomAddress}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(activeRoomAddress);
                          setSoundEffectToast('📋 रूम एड्रेस कॉपी हुआ!');
                          setTimeout(() => setSoundEffectToast(null), 2000);
                        }}
                        className="text-[#2874f0] hover:text-[#1c62d6] ml-1 cursor-pointer"
                        title="Copy Room ID"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </span>

                    {activeRoomHostId === user.userId && (
                      <button
                        onClick={() => {
                          setEditTopicInput(activeRoomTopic);
                          setShowHostSettingsModal(true);
                        }}
                        className="px-2.5 py-1 rounded-sm bg-amber-50 text-[#fb641b] border border-amber-300 text-[11px] font-bold flex items-center space-x-1 hover:bg-amber-100 cursor-pointer"
                      >
                        <Settings className="w-3 h-3" />
                        <span>होस्ट सेटिंग्स</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stage Header Info */}
                <div className={`flex flex-wrap items-center justify-between pb-3 border-b gap-2 relative z-10 ${isDarkStageBg ? 'border-white/15' : 'border-slate-200'}`}>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-[#388e3c] animate-pulse shrink-0" />
                    <div>
                      <h2 className={`text-base sm:text-lg font-bold flex items-center space-x-2 ${isDarkStageBg ? 'text-white' : 'text-[#212121]'}`}>
                        <span className="tracking-wide">
                          {activeRoomTitle}
                        </span>
                        <span className="bg-[#ffe500] text-[#212121] text-[10px] font-bold px-2 py-0.5 rounded-sm">
                          {activeRoomHostId === user.userId ? '👑 आपका रूम' : 'LIVE ON AIR'}
                        </span>
                      </h2>
                      <p className={`text-xs flex flex-wrap items-center gap-1.5 mt-0.5 ${isDarkStageBg ? 'text-slate-200' : 'text-[#878787]'}`}>
                        <span className="bg-[#2874f0] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                          ESP STAGE
                        </span>
                        <span className="font-medium">Topic: "{activeRoomTopic}"</span>
                      </p>
                    </div>
                  </div>

                  {/* Room Viewers Counter & Actions */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                    <button
                      onClick={() => setShowAudienceModal(true)}
                      className="flex items-center space-x-1.5 text-xs text-[#2874f0] bg-[#f5f8ff] hover:bg-blue-100 px-3 py-1.5 rounded-sm border border-blue-200 cursor-pointer transition font-bold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{audienceCount} Online</span>
                    </button>

                    <button
                      onClick={() => setShowStageGameOverlay(!showStageGameOverlay)}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 px-3 py-1.5 text-xs font-bold rounded-sm flex items-center space-x-1 cursor-pointer transition"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>Stage Games</span>
                    </button>

                    <button
                      onClick={() => setShowBotHubModal(true)}
                      className="bg-white hover:bg-slate-50 text-[#212121] border border-slate-300 px-3 py-1.5 text-xs font-bold rounded-sm flex items-center space-x-1 cursor-pointer transition"
                    >
                      <Bot className="w-3.5 h-3.5 text-[#fb641b]" />
                      <span>ESP PLAY बॉट्स</span>
                    </button>

                    <button
                      onClick={() => setShowDailySpinModal(true)}
                      className="bg-[#ffe500] hover:bg-yellow-300 text-[#212121] px-3 py-1.5 text-xs font-bold rounded-sm flex items-center space-x-1 cursor-pointer transition shadow-xs"
                      title="डेली लकी स्पिन"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-[#212121]" />
                      <span>🎰 लकी स्पिन</span>
                    </button>

                    <button
                      onClick={() => setShowGiftModal(true)}
                      className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-3.5 py-1.5 text-xs font-bold rounded-sm flex items-center space-x-1 cursor-pointer transition shadow-xs"
                    >
                      <Gift className="w-3.5 h-3.5 text-white" />
                      <span>Send Gift</span>
                    </button>
                  </div>
                </div>

                {/* ESP PLAY Solo Bot Ecosystem Help Banner */}
                <div className="mt-3 p-3 rounded-md bg-[#f5f8ff]/95 border border-blue-200 flex flex-wrap items-center justify-between gap-2 relative z-10 text-[#212121]">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-sm bg-[#2874f0]/10 text-[#2874f0]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#212121] flex items-center gap-1.5">
                        <span>🤖 ESP PLAY AI बॉट्स व साथी (अकेले हैं? बॉट्स बुलाएं)</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] font-black">Lvl 99 शर्मा जी 👑</span>
                      </div>
                      <p className="text-[11px] text-[#878787]">
                        न्यायाधीश, भेड़िया बॉट, वी भाई, वी चैट और शर्मा जी के साथ खेलें व बातें करें
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={handleSummonAllBots}
                      className="px-2.5 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer"
                      title="एक क्लिक में सारे बॉट्स को खाली सीटों पर बैठाएं"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>⚡ सभी बॉट्स बैठाएं</span>
                    </button>

                    <button
                      onClick={() => setShowBotHubModal(true)}
                      className="px-2.5 py-1.5 rounded-sm bg-white hover:bg-slate-50 border border-slate-300 text-[#212121] font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>📖 बॉट शक्तियां</span>
                    </button>

                    <button
                      onClick={() => setShowWerewolfModal(true)}
                      className="px-2.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <span>🐺 भेड़िया गेम</span>
                    </button>

                    <button
                      onClick={() => setShowSpyGameModal(true)}
                      className="px-2.5 py-1.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <span>🕵️ जासूस कौन?</span>
                    </button>
                  </div>
                </div>

                {/* WePlay Multimedia Stage Player */}
                <div className="mt-3.5 relative z-10">
                  <VoiceRoomMediaStage
                    isHost={activeRoomHostId === user.userId}
                    onOpenSpyGame={() => setShowSpyGameModal(true)}
                    onOpenWerewolfGame={() => setShowWerewolfModal(true)}
                    onOpenDailySpin={() => setShowDailySpinModal(true)}
                    onOpenStageGameOverlay={() => setShowStageGameOverlay(true)}
                    onSoundboardEffect={playSoundEffect}
                  />
                </div>

                {/* Stage Mini-Game Dropdown Overlay */}
                {showStageGameOverlay && (
                  <div className="mt-3 bg-[#f9fafb] p-4 rounded-md border border-slate-200 shadow-sm animate-fadeIn relative z-10 text-[#212121]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center space-x-2 text-xs font-bold text-[#212121]">
                        <Gamepad2 className="w-4 h-4 text-[#fb641b]" />
                        <span>STAGE MINI-GAME BATTLE (स्टेज पर गेम खेलें)</span>
                      </div>
                      <button onClick={() => setShowStageGameOverlay(false)} className="text-slate-500 hover:text-[#212121] cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                      <button
                        onClick={() => setShowSpyGameModal(true)}
                        className="bg-[#2874f0] hover:bg-[#1c62d6] p-2.5 rounded-sm text-center text-xs font-bold text-white cursor-pointer"
                      >
                        <div>🕵️ जासूस कौन?</div>
                        <div className="text-[9px] text-blue-100">Who is the Spy</div>
                      </button>

                      <button
                        onClick={() => handlePlayGame('Lucky Dice', 'seven')}
                        disabled={isGameSpinning}
                        className="bg-[#fb641b] hover:bg-[#e8550f] p-2.5 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🎲 Lucky 7 Dice</div>
                        <div className="text-[9px] text-orange-100">50 Coins • 5x Win</div>
                      </button>

                      <button
                        onClick={() => handlePlayGame('Spin & Win')}
                        disabled={isGameSpinning}
                        className="bg-[#2874f0] hover:bg-[#1c62d6] p-2.5 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🎡 Instant Spin</div>
                        <div className="text-[9px] text-blue-100">50 Coins • Up to 10x</div>
                      </button>

                      <button
                        onClick={() => handlePlayGame('Coin Flip', 'heads')}
                        disabled={isGameSpinning}
                        className="bg-[#388e3c] hover:bg-emerald-700 p-2.5 rounded-sm text-center text-xs font-bold text-white disabled:opacity-50 cursor-pointer"
                      >
                        <div>🪙 Heads Flip</div>
                        <div className="text-[9px] text-emerald-100">50 Coins • 2x Win</div>
                      </button>
                    </div>

                    {gameResultToast && (
                      <div className={`mt-2 p-2 rounded-sm text-xs font-bold text-center border ${gameResultToast.isWin ? 'bg-emerald-50 text-[#388e3c] border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                        {gameResultToast.message}
                      </div>
                    )}
                  </div>
                )}

                {/* Host Seat (Center Spotlight) */}
                <div className="mt-4 flex flex-col items-center relative z-10">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => {
                      handleOpenPlayerModal(voiceRoomHost.userId, {
                        userId: voiceRoomHost.userId,
                        fullName: voiceRoomHost.userName,
                        gameLevel: voiceRoomHost.gameLevel,
                        charms: voiceRoomHost.charms,
                        avatar: voiceRoomHost.userAvatar,
                        roleTitle: voiceRoomHost.roleTitle || 'ESP Founder & Room Host',
                        chosenServiceName: 'ESP FOUNDER & HOST (ALL 10 SERVICES)',
                        status: 'approved',
                        clanName: 'ESP Royals',
                        clanRole: 'Founder & Host',
                        roomAddress: 'ESP-ROOM-FOUNDER-01',
                        coins: 999999,
                      });
                    }}
                  >
                    <AvatarFrame
                      src={voiceRoomHost.userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP"}
                      alt="Room Host"
                      size="xl"
                      frameType="vip-gold"
                      level={voiceRoomHost.gameLevel || 25}
                      showCrown={voiceRoomHost.gameLevel >= 90}
                      isSpeaking={hostSpeaking}
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffe500] text-[#212121] text-[9px] font-black px-2.5 py-0.5 rounded-sm shadow flex items-center space-x-1 z-30 border border-amber-400">
                      <Crown className="w-3 h-3" />
                      <span>ROOM HOST</span>
                    </div>

                    {/* Speaking Soundwaves */}
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-white px-2.5 py-0.5 rounded-full border border-[#2874f0] shadow-xs z-30">
                      <div className="w-1 h-3 bg-[#2874f0] rounded-full animate-bounce" />
                      <div className="w-1 h-4 bg-[#fb641b] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-2 bg-[#388e3c] rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span className="text-[9px] text-[#2874f0] font-bold ml-1">Speaking</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center cursor-pointer" onClick={() => {
                    handleOpenPlayerModal(voiceRoomHost.userId, {
                      userId: voiceRoomHost.userId,
                      fullName: voiceRoomHost.userName,
                      gameLevel: voiceRoomHost.gameLevel,
                      charms: voiceRoomHost.charms,
                      avatar: voiceRoomHost.userAvatar,
                      roleTitle: voiceRoomHost.roleTitle || 'ESP Founder & Room Host',
                    });
                  }}>
                    <div className={`font-bold text-sm flex items-center justify-center space-x-1 ${isDarkStageBg ? 'text-white' : 'text-[#212121]'}`}>
                      <span>{voiceRoomHost.userName}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#388e3c]" />
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${isDarkStageBg ? 'text-[#ffe500]' : 'text-[#2874f0]'}`}>
                      ID: {voiceRoomHost.userId} • {voiceRoomHost.charms?.toLocaleString()} Charms ✨
                    </div>
                  </div>
                </div>

                {/* 8 Speaker Mic Seats Grid */}
                <div className={`mt-6 pt-4 border-t relative z-10 ${isDarkStageBg ? 'border-white/20' : 'border-slate-200'}`}>
                  <div className={`text-[11px] font-bold mb-3 flex flex-wrap items-center justify-between gap-2 ${isDarkStageBg ? 'text-white' : 'text-[#212121]'}`}>
                    <span>SPEAKER MIC SEATS (8 सीटें - ग्रैब करें या बात करें):</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setPendingJoinSeatIndex(null);
                          setShowVoiceEffectModal(true);
                        }}
                        className="text-[10px] text-[#2874f0] hover:bg-blue-100 font-bold flex items-center gap-1 bg-[#f5f8ff] px-2.5 py-1 rounded-sm border border-blue-200 cursor-pointer"
                        title="वॉइस इफ़ेक्ट बदलें"
                      >
                        <span>{VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.icon || '🎭'}</span>
                        <span>इफ़ेक्ट: {VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.name}</span>
                      </button>
                      {mySeatIndex !== null && (
                        <button
                          onClick={handleLeaveSeat}
                          className="text-[10px] text-rose-600 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-sm border border-rose-200 font-bold cursor-pointer"
                        >
                          Leave My Mic (सीट छोड़ें)
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {seats.map((seat, idx) => {
                      const isOccupied = Boolean(seat.userId);
                      const isMe = mySeatIndex === idx;
                      const isSharmaJiSeat = seat.userId === 'SHARMA-JI-VIP' || (seat.gameLevel || 0) >= 90;
                      const frameType: FrameVariant = isSharmaJiSeat 
                        ? 'royal-dragon-crown' 
                        : seat.userId === 'BOT-JUDGE' 
                        ? 'judge-justice'
                        : seat.userId === 'BOT-WOLF'
                        ? 'wolf-night'
                        : seat.userId === 'BOT-CHAT'
                        ? 'cosmic-neon'
                        : seat.userId === 'BOT-BHAI'
                        ? 'vip-gold'
                        : 'standard';

                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center p-2.5 rounded-md border transition-all ${
                            isOccupied
                              ? isSharmaJiSeat 
                                ? 'bg-amber-50/95 border-amber-400 shadow-xs cursor-pointer text-[#212121]'
                                : 'bg-[#f5f8ff]/95 border-blue-200 shadow-xs hover:border-[#2874f0] cursor-pointer text-[#212121]'
                              : 'bg-[#f9fafb]/95 border-dashed border-slate-300 hover:border-[#2874f0] cursor-pointer text-slate-600'
                          }`}
                          onClick={() => {
                            if (!isOccupied) {
                              setPendingJoinSeatIndex(idx);
                              setShowVoiceEffectModal(true);
                            } else if (seat.userId) {
                              handleOpenPlayerModal(seat.userId, {
                                userId: seat.userId,
                                fullName: seat.userName,
                                gameLevel: seat.gameLevel,
                                charms: seat.charms,
                                avatar: seat.userAvatar,
                              });
                            }
                          }}
                        >
                          {isOccupied ? (
                            <>
                              <div className="relative">
                                <AvatarFrame
                                  src={seat.userAvatar}
                                  alt={seat.userName}
                                  size="md"
                                  frameType={frameType}
                                  level={seat.gameLevel || 1}
                                  showCrown={isSharmaJiSeat}
                                  isSpeaking={seat.isSpeaking}
                                />
                                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white border border-slate-300 text-[10px] z-30 shadow-xs">
                                  {seat.isMuted ? <MicOff className="w-3 h-3 text-rose-600" /> : <Mic className="w-3 h-3 text-[#388e3c]" />}
                                </span>
                              </div>
                              <span className={`text-[11px] font-bold mt-1.5 truncate max-w-[80px] ${
                                isSharmaJiSeat ? 'text-[#fb641b] font-black' : 'text-[#212121]'
                              }`}>
                                {isMe ? 'You' : seat.userName}
                              </span>
                              {seat.userRollNumber && (
                                <span className="text-[8px] font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded-sm border border-amber-300">
                                  {seat.userRollNumber}
                                </span>
                              )}
                              <span className="text-[9px] text-[#2874f0] font-mono font-bold">
                                Lvl {seat.gameLevel}
                              </span>
                              {isMe && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-[#2874f0] text-white flex items-center gap-0.5 mt-0.5">
                                  <span>{VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.icon || '🎙️'}</span>
                                  <span className="uppercase">{VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.badge || 'ORIGINAL'}</span>
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="py-2 flex flex-col items-center text-[#878787] hover:text-[#2874f0]">
                              <div className="w-10 h-10 rounded-full border border-dashed border-slate-400 bg-white flex items-center justify-center">
                                <Mic className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-semibold mt-1 text-[#212121]">Seat {idx + 1}</span>
                              <span className="text-[9px] text-[#2874f0] font-bold">सीट ग्रैब करें</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Bot Interactive Bar */}
                <div className="mt-4 p-2.5 rounded-md bg-[#f5f8ff]/95 border border-blue-200 flex flex-wrap items-center justify-between gap-2 relative z-10 text-[#212121]">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#212121]">
                    <Sparkles className="w-3.5 h-3.5 text-[#fb641b]" />
                    <span>बॉट्स से लाइव एक्शन:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleBotAction('judge')}
                      className="px-2.5 py-1 rounded-sm bg-white hover:bg-amber-50 border border-amber-300 text-amber-800 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>⚖️ न्यायाधीश (+50c)</span>
                    </button>

                    <button
                      onClick={() => handleBotAction('we_bhai')}
                      className="px-2.5 py-1 rounded-sm bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#388e3c] font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>🤝 वी भाई (+100c)</span>
                    </button>

                    <button
                      onClick={() => handleBotAction('we_chat')}
                      className="px-2.5 py-1 rounded-sm bg-pink-50 hover:bg-pink-100 border border-pink-300 text-pink-700 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                    >
                      <span>💬 वी चैट शायरी</span>
                    </button>

                    <button
                      onClick={() => handleBotAction('sharma_ji')}
                      className="px-2.5 py-1 rounded-sm bg-[#ffe500] hover:bg-yellow-300 text-[#212121] border border-amber-400 font-bold text-[11px] flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <span>👑 शर्मा जी (+200c)</span>
                    </button>
                  </div>
                </div>

                {/* REAL MICROPHONE HARDWARE CONTROLS & LIVE VOICE STREAMING */}
                <div className="mt-4 p-3.5 bg-[#f9fafb]/95 rounded-md border border-slate-200 flex flex-col gap-3 relative z-10 text-[#212121]">
                  {/* Top Status & Controls Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      {micPermission !== 'granted' ? (
                        <button
                          onClick={enableMicrophone}
                          className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-3.5 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Mic className="w-4 h-4 text-white" />
                          <span>🎙️ माइक चालू करें (Enable Microphone)</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center space-x-1 text-xs font-bold text-[#388e3c] bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-[#388e3c] animate-pulse" />
                            <span>माइक चालू है ({micLevel}%)</span>
                          </span>

                          <button
                            onClick={handleTogglePhysicalMute}
                            className={`px-2.5 py-1 rounded-sm text-xs font-bold flex items-center space-x-1 border cursor-pointer ${
                              isMicMuted
                                ? 'bg-rose-50 text-rose-700 border-rose-300'
                                : 'bg-white text-[#212121] border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {isMicMuted ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-[#388e3c]" />}
                            <span>{isMicMuted ? 'Muted' : 'Mic On'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={testSpeakerAndMic}
                        disabled={isLoopbackTesting}
                        className={`px-3 py-1.5 rounded-sm text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                          isLoopbackTesting
                            ? 'bg-[#ffe500] text-[#212121] font-black'
                            : 'bg-[#2874f0] hover:bg-[#1c62d6] text-white'
                        }`}
                        title="Check if you can hear your voice in device speaker"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{isLoopbackTesting ? '🔊 आवाज़ आ रही है...' : '🔊 आवाज़ चेक करें'}</span>
                      </button>

                      <button
                        onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                        className={`px-2.5 py-1.5 rounded-sm text-[11px] font-bold flex items-center space-x-1 border cursor-pointer ${
                          autoPlayAudio
                            ? 'bg-emerald-50 text-[#388e3c] border-emerald-300'
                            : 'bg-white text-[#878787] border-slate-300'
                        }`}
                        title="Auto-play voice audio sent by others"
                      >
                        {autoPlayAudio ? <Volume2 className="w-3 h-3 text-[#388e3c]" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
                        <span>{autoPlayAudio ? 'स्पीकर: चालू' : 'स्पीकर: बंद'}</span>
                      </button>

                      <button
                        onClick={() => setShowEffectTrayInline(!showEffectTrayInline)}
                        className={`px-2.5 py-1.5 rounded-sm text-[11px] font-bold flex items-center space-x-1 border transition cursor-pointer ${
                          showEffectTrayInline
                            ? 'bg-[#2874f0] text-white border-[#2874f0]'
                            : 'bg-white text-[#212121] border-slate-300 hover:bg-slate-50'
                        }`}
                        title="वॉइस इफ़ेक्ट पैनल खोलें / बदलें"
                      >
                        <Sparkles className="w-3 h-3 text-[#fb641b]" />
                        <span>{VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.icon || '🎭'} {VOICE_EFFECTS.find(v => v.id === selectedVoiceEffect)?.name}</span>
                        <Sliders className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                  </div>

                  {/* Real Physical Voice Level Bar & Walkie-Talkie Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                      <span className="text-[10px] text-[#878787] font-bold whitespace-nowrap">माइक लेवल:</span>
                      <div className="flex-1 h-3 bg-slate-200 rounded-full border border-slate-300 overflow-hidden p-0.5 flex items-center">
                        <div
                          className={`h-full rounded-full transition-all duration-75 ${
                            micLevel > 50
                              ? 'bg-gradient-to-r from-[#388e3c] via-amber-500 to-rose-500'
                              : micLevel > 15
                              ? 'bg-[#388e3c]'
                              : 'bg-slate-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(4, micLevel))}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono tabular-nums text-[#2874f0] w-8 text-right font-bold">{micLevel}%</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onMouseDown={startWalkieTalkie}
                        onMouseUp={stopWalkieTalkie}
                        onTouchStart={startWalkieTalkie}
                        onTouchEnd={stopWalkieTalkie}
                        className={`px-4 py-2 rounded-sm font-bold text-xs flex items-center space-x-2 transition-all select-none shadow-xs cursor-pointer ${
                          isRecordingVoice
                            ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300'
                            : 'bg-[#fb641b] hover:bg-[#e8550f] text-white'
                        }`}
                      >
                        <Disc className={`w-4 h-4 ${isRecordingVoice ? 'text-white animate-spin' : 'text-[#ffe500]'}`} />
                        <span>
                          {isRecordingVoice
                            ? `🔴 रिकॉर्ड हो रहा है (${recordDuration}s) - छोड़ते ही आवाज़ जाएगी`
                            : '🎙️ दबाकर बोलें (Push to Talk & Broadcast)'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {loopbackNotice && (
                    <div className="p-2 rounded-sm bg-amber-50 text-amber-800 border border-amber-300 text-xs text-center font-bold animate-fadeIn">
                      {loopbackNotice}
                    </div>
                  )}

                  {/* Inline Voice Effect Drawer / Tray */}
                  {showEffectTrayInline && (
                    <div className="pt-2 border-t border-slate-200 animate-fadeIn">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-[#2874f0] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#fb641b]" />
                          <span>वॉइस इफ़ेक्ट चुनें (Select Voice Modifier):</span>
                        </span>
                        <button
                          onClick={() => setShowEffectTrayInline(false)}
                          className="text-[10px] text-[#878787] hover:text-[#212121] font-bold cursor-pointer"
                        >
                          ✕ छिपाएं
                        </button>
                      </div>
                      <VoiceEffectSelector
                        currentEffect={selectedVoiceEffect}
                        onSelectEffect={(effect) => {
                          setSelectedVoiceEffect(effect);
                          try {
                            localStorage.setItem('esp_voice_effect', effect);
                          } catch {}
                          const cfg = VOICE_EFFECTS.find(v => v.id === effect);
                          setSoundEffectToast(`🎭 आवाज़ इफ़ेक्ट सेट: ${cfg?.icon} ${cfg?.name} (${cfg?.hindiName})`);
                          setTimeout(() => setSoundEffectToast(null), 3000);
                        }}
                        isModal={false}
                      />
                    </div>
                  )}
                </div>

                {/* Quick Voice Talk Preset Phrases */}
                <div className="mt-3 relative z-10">
                  <div className={`text-[10px] font-bold mb-1.5 flex items-center space-x-1 ${isDarkStageBg ? 'text-slate-200' : 'text-[#878787]'}`}>
                    <Volume1 className="w-3 h-3 text-[#2874f0]" />
                    <span>QUICK VOICE TALK PHRASES (एक क्लिक में बात करें):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TALK_PHRASES.map((phrase, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendQuickPhrase(phrase)}
                        className="px-2.5 py-1 rounded-sm bg-[#f1f3f6] hover:bg-blue-50 text-[#212121] border border-slate-300 text-[10px] font-semibold transition cursor-pointer"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Soundboard Bar */}
                <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 relative z-10 ${isDarkStageBg ? 'border-white/20' : 'border-slate-200'}`}>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold ${isDarkStageBg ? 'text-slate-200' : 'text-[#878787]'}`}>Soundboard:</span>
                    <button onClick={() => playSoundEffect('👏', 'Applause')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Clap">👏</button>
                    <button onClick={() => playSoundEffect('🥂', 'Cheers')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Cheers">🥂</button>
                    <button onClick={() => playSoundEffect('🎺', 'Fanfare')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Trumpet">🎺</button>
                    <button onClick={() => playSoundEffect('😂', 'Laugh')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Laugh">😂</button>
                    <button onClick={() => playSoundEffect('🏆', 'Victory')} className="p-1.5 bg-[#f1f3f6] hover:bg-blue-50 rounded-sm text-sm border border-slate-300 cursor-pointer" title="Trophy">🏆</button>
                  </div>
                </div>

                {soundEffectToast && (
                  <div className="absolute top-4 right-4 bg-[#2874f0] text-white font-bold text-xs px-3 py-1.5 rounded-sm shadow-lg animate-bounce z-30">
                    {soundEffectToast}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Live Room Chat Stream with Text-to-Speech */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col h-[540px] text-[#212121]">
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
              <form onSubmit={handleSendChat} className="pt-2 border-t border-slate-200 flex items-center space-x-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Send cheer, question, or talk..."
                  className="flex-1 bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-[#212121] placeholder-slate-400 focus:outline-none focus:border-[#2874f0]"
                />
                
                <button
                  type="button"
                  onMouseDown={startWalkieTalkie}
                  onMouseUp={stopWalkieTalkie}
                  onTouchStart={startWalkieTalkie}
                  onTouchEnd={stopWalkieTalkie}
                  className={`p-2 rounded-sm border transition cursor-pointer ${
                    isRecordingVoice ? 'bg-rose-600 border-rose-600 text-white animate-pulse' : 'bg-[#f1f3f6] border-slate-300 text-[#212121] hover:bg-slate-200'
                  }`}
                  title="दबाकर आवाज़ भेजें (Hold to send voice)"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="bg-[#2874f0] hover:bg-[#1c62d6] p-2 rounded-sm text-white cursor-pointer"
                  title="Send text"
                >
                  <Send className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAppGiftModal(true)}
                  className="p-2 rounded-sm bg-[#ffe500] hover:bg-yellow-300 text-[#212121] font-bold shadow-xs transition cursor-pointer"
                  title="ESP PLAY ऐप गिफ्ट्स भेजें"
                >
                  <Gift className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDigitalGiftCardsModal(true)}
                  className="p-2 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                  title="डिजिटल गिफ्ट कार्ड वाउचर स्टोर"
                >
                  <CreditCardIcon className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: COINS GAMES (REAL ONLINE GAMES + WEPLAY HOME LOBBY)     */}
        {/* ============================================================== */}
        {activeTab === 'games' && (
          <div className="space-y-6 animate-fadeIn w-full max-w-5xl mx-auto">
            {/* WEPLAY HOME LOBBY (100% MATCHING USER SCREENSHOT) */}
            <WePlayHomeLobby
              user={user}
              onOpenRanking={() => setShowLeaderboardModal(true)}
              onOpenTasks={() => setShowDailyTasksModal(true)}
              onOpenFriends={() => setShowEspChatModal(true)}
              onOpenVoiceRoom={() => setActiveTab('voice_room')}
              onOpenGame={(gameKey) => setActiveInteractiveGame(gameKey)}
              onOpenWeeklyRewards={() => setShowWeeklyRewardsModal(true)}
              onOpenRecharge={() => setActiveTab('recharge_convert')}
              onOpenProfile={() => setShowAvatarCustomizerModal(true)}
              onOpenChats={() => setShowEspChatModal(true)}
              onOpenAvatarCustomizer={() => setShowAvatarCustomizerModal(true)}
              onOpenDailyMissions={() => setShowDailyMissionsModal(true)}
              onOpenClans={() => {
                setActiveTab('clan_friends');
                setShowTopClansModal(true);
              }}
            />

            {/* Individual Game Arenas Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-white rounded-md border border-slate-200 shadow-xs">
              <button
                onClick={() => setSelectedGame('snake')}
                className={`px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  selectedGame === 'snake'
                    ? 'bg-[#388e3c] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <span>🐍 स्नेक रश (Snake 2D)</span>
              </button>

              <button
                onClick={() => setSelectedGame('bingo')}
                className={`px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  selectedGame === 'bingo'
                    ? 'bg-[#fb641b] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <span>🔢 बिंगो तंबोला (Bingo Live)</span>
              </button>

              <button
                onClick={() => setSelectedGame('cards')}
                className={`px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  selectedGame === 'cards'
                    ? 'bg-[#2874f0] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <span>🃏 ओ माय कार्ड (Card Duel)</span>
              </button>

              <button
                onClick={() => setSelectedGame('daily_spin')}
                className={`px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                  selectedGame === 'daily_spin'
                    ? 'bg-[#ffe500] text-[#212121] font-black shadow-xs border border-amber-400'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>🎰 डेली लकी स्पिन (24h VIP)</span>
              </button>

              <button
                onClick={() => setSelectedGame('spin')}
                className={`px-3 py-2 rounded-sm font-bold text-xs flex items-center space-x-1 transition cursor-pointer ${
                  selectedGame === 'spin'
                    ? 'bg-[#2874f0] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>लकी व्हील</span>
              </button>

              <button
                onClick={() => setSelectedGame('dice')}
                className={`px-3 py-2 rounded-sm font-bold text-xs flex items-center space-x-1 transition cursor-pointer ${
                  selectedGame === 'dice'
                    ? 'bg-[#2874f0] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <Dices className="w-3.5 h-3.5" />
                <span>हाई-लो डाइस</span>
              </button>

              <button
                onClick={() => setSelectedGame('coin_flip')}
                className={`px-3 py-2 rounded-sm font-bold text-xs flex items-center space-x-1 transition cursor-pointer ${
                  selectedGame === 'coin_flip'
                    ? 'bg-[#388e3c] text-white shadow-xs'
                    : 'bg-[#f1f3f6] text-[#212121] hover:bg-blue-50'
                }`}
              >
                <CircleDot className="w-3.5 h-3.5" />
                <span>कॉइन टॉस</span>
              </button>

              <button
                onClick={() => setShowWerewolfModal(true)}
                className="px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition bg-[#2874f0] hover:bg-[#1c62d6] text-white shadow-xs cursor-pointer"
              >
                <span>🐺 भेड़िया (Werewolf ESP PLAY)</span>
              </button>

              <button
                onClick={() => setShowSpyGameModal(true)}
                className="px-3.5 py-2 rounded-sm font-bold text-xs flex items-center space-x-1.5 transition bg-[#fb641b] hover:bg-[#e8550f] text-white shadow-xs cursor-pointer"
              >
                <span>🕵️ जासूस कौन? (Who is Spy)</span>
              </button>
            </div>

            {/* REAL GAME 1: SNAKE RUSH 2D CANVAS */}
            {selectedGame === 'snake' && (
              <SnakeRushGame
                user={user}
                onCoinsUpdated={(newCoins: number) => onUpdateUser({ ...user, coins: newCoins })}
              />
            )}

            {/* REAL GAME 2: BINGO TAMBOLA LIVE */}
            {selectedGame === 'bingo' && (
              <BingoGame
                user={user}
                onCoinsUpdated={(newCoins: number) => onUpdateUser({ ...user, coins: newCoins })}
              />
            )}

            {/* REAL GAME 3: OH MY CARD HI-LO DUEL */}
            {selectedGame === 'cards' && (
              <OhMyCardGame
                user={user}
                onCoinsUpdated={(newCoins: number) => onUpdateUser({ ...user, coins: newCoins })}
              />
            )}

            {/* REAL GAME 4: DAILY LUCKY SPIN 24H WHEEL */}
            {selectedGame === 'daily_spin' && (
              <DailyLuckySpin
                user={user}
                onUpdateUser={onUpdateUser}
              />
            )}

            {/* MINI GAMES: SPIN, DICE, COIN FLIP */}
            {(selectedGame === 'spin' || selectedGame === 'dice' || selectedGame === 'coin_flip') && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-[#212121]">
                {/* Game Result Toast Banner */}
                {gameResultToast && (
                  <div className={`w-full max-w-md mb-4 p-3 rounded-md text-center font-bold text-sm border animate-fadeIn ${
                    gameResultToast.isWin
                      ? 'bg-emerald-50 text-[#388e3c] border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {gameResultToast.message}
                  </div>
                )}

                {/* GAME: SPIN & WIN */}
                {selectedGame === 'spin' && (
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64 my-4">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 text-2xl filter drop-shadow">
                        🔻
                      </div>

                      <div
                        style={{
                          transform: `rotate(${spinRotation}deg)`,
                          transition: isGameSpinning ? 'transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
                        }}
                        className="w-full h-full rounded-full border-4 border-[#ffe500] shadow-xl relative overflow-hidden bg-gradient-to-tr from-[#2874f0] via-indigo-700 to-purple-700 flex items-center justify-center"
                      >
                        <div className="absolute text-xs font-black text-[#ffe500] top-2">10x 👑</div>
                        <div className="absolute text-xs font-black text-rose-300 right-3">0x ❌</div>
                        <div className="absolute text-xs font-black text-emerald-300 bottom-2">5x 💎</div>
                        <div className="absolute text-xs font-black text-cyan-200 left-3">2x ⚡</div>
                        <div className="absolute text-[10px] font-bold text-yellow-200 top-10 right-8">1.5x</div>
                        <div className="absolute text-[10px] font-bold text-rose-300 bottom-10 right-8">0x</div>
                        <div className="absolute text-[10px] font-bold text-cyan-200 bottom-10 left-8">3x</div>
                        <div className="absolute text-[10px] font-bold text-rose-300 top-10 left-8">0x</div>

                        <div className="w-16 h-16 rounded-full bg-[#ffe500] shadow-lg flex items-center justify-center font-black text-xs text-[#212121] border-2 border-white">
                          ESP
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GAME: LUCKY DICE */}
                {selectedGame === 'dice' && (
                  <div className="flex flex-col items-center my-4">
                    <div className="flex items-center space-x-4 sm:space-x-6 my-4">
                      <div className={`w-20 h-20 rounded-xl bg-[#f9fafb] text-[#212121] font-black text-4xl shadow-md flex items-center justify-center border-2 border-[#2874f0] ${isGameSpinning ? 'animate-spin' : ''}`}>
                        {diceValues[0]}
                      </div>
                      <span className="text-2xl font-black text-[#2874f0]">+</span>
                      <div className={`w-20 h-20 rounded-xl bg-[#f9fafb] text-[#212121] font-black text-4xl shadow-md flex items-center justify-center border-2 border-[#2874f0] ${isGameSpinning ? 'animate-spin' : ''}`}>
                        {diceValues[1]}
                      </div>
                      <span className="text-2xl font-black text-[#2874f0]">=</span>
                      <div className="w-20 h-20 rounded-xl bg-[#ffe500] text-[#212121] font-black text-3xl shadow-md flex items-center justify-center border-2 border-amber-400">
                        {diceValues[0] + diceValues[1]}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 w-full max-w-sm">
                      <button
                        onClick={() => setDiceChoice('low')}
                        className={`p-2.5 rounded-sm text-xs font-bold border transition cursor-pointer ${
                          diceChoice === 'low'
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0] shadow-xs'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        <div>Low (2 - 6)</div>
                        <div className="text-[10px] text-[#388e3c]">Pays 2x</div>
                      </button>

                      <button
                        onClick={() => setDiceChoice('seven')}
                        className={`p-2.5 rounded-sm text-xs font-bold border transition cursor-pointer ${
                          diceChoice === 'seven'
                            ? 'bg-amber-50 border-[#fb641b] text-[#fb641b] shadow-xs'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        <div>Lucky 7 ⭐</div>
                        <div className="text-[10px] text-[#fb641b]">Pays 5x</div>
                      </button>

                      <button
                        onClick={() => setDiceChoice('high')}
                        className={`p-2.5 rounded-sm text-xs font-bold border transition cursor-pointer ${
                          diceChoice === 'high'
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0] shadow-xs'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        <div>High (8 - 12)</div>
                        <div className="text-[10px] text-[#388e3c]">Pays 2x</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* GAME: COIN FLIP */}
                {selectedGame === 'coin_flip' && (
                  <div className="flex flex-col items-center my-4">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-tr from-[#ffe500] via-amber-400 to-amber-500 border-4 border-amber-200 shadow-lg flex items-center justify-center font-black text-2xl text-[#212121] my-4 ${isGameSpinning ? 'animate-bounce' : ''}`}>
                      {coinResultState === 'heads' ? 'HEADS 👑' : 'TAILS 🪙'}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2 w-full max-w-xs">
                      <button
                        onClick={() => setCoinChoice('heads')}
                        className={`p-3 rounded-sm font-bold text-xs border transition cursor-pointer ${
                          coinChoice === 'heads'
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0]'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        HEADS (2x)
                      </button>

                      <button
                        onClick={() => setCoinChoice('tails')}
                        className={`p-3 rounded-sm font-bold text-xs border transition cursor-pointer ${
                          coinChoice === 'tails'
                            ? 'bg-[#f5f8ff] border-[#2874f0] text-[#2874f0]'
                            : 'bg-[#f9fafb] border-slate-200 text-[#212121]'
                        }`}
                      >
                        TAILS (2x)
                      </button>
                    </div>
                  </div>
                )}

                {/* Bet Amount Selector */}
                <div className="mt-4 w-full max-w-md bg-[#f9fafb] p-3.5 rounded-md border border-slate-200">
                  <div className="text-xs font-semibold text-[#212121] mb-2 flex items-center justify-between">
                    <span>Bet Amount (दांव के सिक्के):</span>
                    <span className="text-[#fb641b] font-mono tabular-nums font-bold">🪙 {betAmount} Coins</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 50, 100, 500].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`py-1.5 rounded-sm font-bold text-xs transition cursor-pointer border ${
                          betAmount === amt
                            ? 'bg-[#2874f0] border-[#2874f0] text-white shadow-xs'
                            : 'bg-white border-slate-300 text-[#212121] hover:bg-blue-50'
                        }`}
                      >
                        🪙 {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Play Action Button */}
                <button
                  onClick={() => handlePlayGame()}
                  disabled={isGameSpinning}
                  className="mt-5 bg-[#fb641b] hover:bg-[#e8550f] text-white py-3 px-8 rounded-sm font-bold text-sm tracking-wide flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isGameSpinning ? 'Playing...' : `PLAY FOR ${betAmount} COINS 🚀`}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: RECHARGE COINS & CONVERT TO REAL CASH                   */}
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
                    {RECHARGE_PACKS.map(pack => (
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
                          <span>+{pack.bonus}</span>
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
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <button
                    onClick={handleRechargeCoins}
                    disabled={isRecharging}
                    className="w-full bg-[#fb641b] hover:bg-[#e8550f] py-3 rounded-sm font-bold text-xs sm:text-sm text-white disabled:opacity-50 flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition"
                  >
                    <span>{isRecharging ? 'सत्यापन अनुरोध भेजा जा रहा है...' : `₹${selectedPack.amount} का UTR सबमिट करें (+${selectedPack.coins + selectedPack.bonus} कॉइन्स)`}</span>
                  </button>
                  <p className="text-[10px] text-center text-[#878787] mt-2">
                    🔒 एडमिन द्वारा बैंक खाते में UTR सत्यापन के बाद सिक्के आपके प्रोफाइल में क्रेडिट होंगे।
                  </p>
                </div>
              </div>

              {/* Right Box: Convert Coins to Real Cash (₹) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-[#212121]">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-[#212121]">
                        Coins Convert to Real Cash (नकद निकासी)
                      </h3>
                      <p className="text-[11px] text-[#388e3c] font-semibold">
                        एक्सचेंज रेट: 100 Coins = ₹10 Withdrawable INR Cash
                      </p>
                    </div>
                  </div>

                  {convertStatusMessage && (
                    <div className="mb-3 p-2.5 rounded-md bg-emerald-50 text-[#388e3c] border border-emerald-200 text-xs font-bold text-center">
                      {convertStatusMessage}
                    </div>
                  )}

                  <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 mt-3 text-center">
                    <div className="text-xs text-[#878787] font-medium">उपलब्ध रिडीमेबल कॉइन्स:</div>
                    <div className="text-2xl font-black text-[#fb641b] mt-1 tabular-nums">
                      🪙 {(user.coins || 0).toLocaleString()} Coins
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-[#212121] block mb-1 font-semibold">
                        कैश में बदलने हेतु कॉइन्स दर्ज करें:
                      </label>
                      <input
                        type="number"
                        step={50}
                        min={100}
                        max={user.coins || 5000}
                        value={convertCoinsInput}
                        onChange={e => setConvertCoinsInput(Math.max(100, Number(e.target.value)))}
                        className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-[#212121] font-mono text-center font-bold text-lg focus:outline-none focus:border-[#2874f0]"
                      />
                    </div>

                    <div className="mt-3 p-3 bg-emerald-50 rounded-md border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="text-[#212121] font-medium">वॉलेट में प्राप्त होने वाली राशि:</span>
                      <strong className="text-[#388e3c] text-base font-black tabular-nums">
                        ₹{Math.floor(convertCoinsInput / 10)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                  <button
                    onClick={handleConvertCoins}
                    className="w-full bg-[#388e3c] hover:bg-emerald-700 py-3 rounded-sm font-bold text-xs sm:text-sm text-white cursor-pointer shadow-sm transition"
                  >
                    CONVERT {convertCoinsInput} COINS TO ₹{Math.floor(convertCoinsInput / 10)} CASH
                  </button>

                  {onOpenWithdrawal && (
                    <button
                      onClick={onOpenWithdrawal}
                      className="w-full py-2 text-xs font-bold text-[#2874f0] hover:underline text-center cursor-pointer"
                    >
                      Go to Direct UPI Withdrawal Dashboard ➔
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
              {/* Clan / Family Profile */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-[#212121]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-md bg-[#2874f0] text-white flex items-center justify-center text-2xl shadow-xs">
                      🛡️
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#212121]">
                        {user.clanName || 'Royal Warriors ESP'}
                      </h3>
                      <p className="text-[11px] text-[#2874f0] font-medium">
                        Family Clan • Level 12 • Power: 85,400
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-sm bg-[#ffe500] text-[#212121] text-[10px] font-bold">
                    {user.clanRole || 'Elder Member'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-[#f9fafb] p-2.5 rounded-md border border-slate-200">
                    <div className="text-[10px] text-[#878787]">Clan Members</div>
                    <div className="text-sm font-black text-[#212121] mt-0.5 tabular-nums">48 / 50 Active</div>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-md border border-amber-200">
                    <div className="text-[10px] text-[#878787]">Weekly Dividend</div>
                    <div className="text-sm font-black text-[#fb641b] mt-0.5 tabular-nums">+15% Coins Boost</div>
                  </div>
                </div>

                <div className="mt-4 bg-[#f5f8ff] p-3 rounded-md border border-blue-200 text-xs text-[#212121]">
                  <div className="font-bold text-[#2874f0] mb-1">Clan Perks & Privileges:</div>
                  <ul className="space-y-1 text-[11px] list-disc list-inside text-[#878787]">
                    <li>Special Royal Mic Seat Ring in Voice Stage</li>
                    <li>Exclusive 10% discount on Luxury Gift shop</li>
                    <li>Daily Clan Chest claimable every 24 hours</li>
                  </ul>
                </div>
              </div>

              {/* Friends System */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between text-[#212121]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[#2874f0]" />
                      <h3 className="font-bold text-sm text-[#212121]">ESP Gaming Friends</h3>
                    </div>
                    <span className="text-[10px] text-[#388e3c] font-bold">
                      {realPlayers.length > 0 ? `${realPlayers.length} Registered` : 'Live Online'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {realPlayers.filter(f => f.userId !== user.userId).length === 0 ? (
                      <div className="bg-[#f9fafb] p-4 rounded-md border border-slate-200 text-center text-xs text-[#878787]">
                        <p className="font-bold text-[#212121] mb-1">🤝 अभी कोई अन्य टीम मेंबर पंजीकृत नहीं है</p>
                        <p className="text-[11px] text-[#878787]">
                          नीचे दिए गए बटन से अपने दोस्तों और डाउनलाइन को WhatsApp पर आमंत्रित करें। प्रत्येक सफल जॉइनिंग पर तुरंत 500 Coins + कमीशन प्राप्त करें!
                        </p>
                      </div>
                    ) : (
                      [...realPlayers]
                        .filter(f => f.userId !== user.userId)
                        .sort((a, b) => (b.gameLevel || 1) - (a.gameLevel || 1) || (b.charms || 0) - (a.charms || 0))
                        .slice(0, 15)
                        .map((f, idx) => {
                          const isSharmaJi = f.userId === 'SHARMA-JI-VIP' || (f.gameLevel || 0) >= 90;
                          return (
                            <div
                              key={f.userId || idx}
                              className={`p-2.5 rounded-md border flex items-center justify-between transition cursor-pointer ${
                                isSharmaJi
                                  ? 'bg-amber-50 border-amber-400 shadow-xs'
                                  : 'bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200'
                              }`}
                              onClick={() => handleOpenPlayerModal(f.userId, f)}
                            >
                              <div className="flex items-center space-x-2.5">
                                <AvatarFrame
                                  src={f.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${f.userId}`}
                                  alt={f.fullName}
                                  size="sm"
                                  frameType={isSharmaJi ? 'royal-dragon-crown' : 'vip-gold'}
                                  level={f.gameLevel || 1}
                                  showCrown={isSharmaJi}
                                />
                                <div>
                                  <div className="font-bold text-xs flex items-center space-x-1.5">
                                    <span className={isSharmaJi ? 'text-[#fb641b] font-black' : 'text-[#212121]'}>
                                      {f.fullName}
                                    </span>
                                    {isSharmaJi && (
                                      <span className="text-[8px] px-1.5 py-0.5 rounded-sm bg-[#ffe500] text-[#212121] font-black">
                                        CROWN 👑
                                      </span>
                                    )}
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
                                  setShowGiftModal(true);
                                  setGiftTarget(f.fullName);
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
                      const text = `Add me on ESP GAMING TIME! My Room ID is ${user.roomAddress || `ESP-ROOM-${user.userId}`}: ${window.location.origin}/?ref=${user.userId}`;
                      navigator.clipboard.writeText(text);
                      setSoundEffectToast('📋 इनविटेशन लिंक कॉपी हो गया!');
                      setTimeout(() => setSoundEffectToast(null), 2500);
                    }}
                    className="w-full bg-[#388e3c] hover:bg-emerald-700 text-white py-2.5 rounded-sm font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Invite Friends on WhatsApp (+500 Coins)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: 7-DAY LOGIN REWARDS & DAILY TASKS                       */}
        {/* ============================================================== */}
        {activeTab === 'rewards_tasks' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Daily Lucky Spin Hero Banner */}
            <div className="bg-[#f5f8ff] rounded-xl p-5 border border-blue-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-[#212121]">
              <div className="flex items-center space-x-3.5">
                <div className="w-14 h-14 rounded-md bg-[#ffe500] flex items-center justify-center text-3xl shadow-xs border border-amber-300">
                  🎰
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base sm:text-lg text-[#212121]">
                      डेली लकी स्पिन (24H Daily Lucky Spin)
                    </h3>
                    <span className="px-2 py-0.5 rounded-sm bg-[#2874f0] text-white text-[10px] font-bold">
                      50 Coins
                    </span>
                  </div>
                  <p className="text-xs text-[#878787] mt-0.5">
                    हर 24 घंटे में 50 कॉइन्स खर्च करें और जीतें 500 कॉइन्स, 50 चार्म्स या 250 एक्सपी तक का जैकपॉट!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDailySpinModal(true)}
                  className="bg-[#fb641b] hover:bg-[#e8550f] text-white px-5 py-2.5 rounded-sm font-bold text-xs flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>अभी स्पिन करें ➔</span>
                </button>
              </div>
            </div>

            {/* 7-Day Login Calendar */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-[#212121]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#2874f0]" />
                  <h3 className="font-bold text-sm text-[#212121]">
                    7-Day Login Streak Reward Calendar
                  </h3>
                </div>
                <div className="text-xs font-bold text-[#fb641b]">
                  Current Streak: {user.loginStreak || 1} Days 🔥
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { day: 1, coins: 50, icon: '🪙' },
                  { day: 2, coins: 100, icon: '🪙' },
                  { day: 3, coins: 150, icon: '⚡' },
                  { day: 4, coins: 200, icon: '🪙' },
                  { day: 5, coins: 350, icon: '💎' },
                  { day: 6, coins: 500, icon: '👑' },
                  { day: 7, coins: 1000, icon: '🎁', isMega: true },
                ].map(r => {
                  const isClaimed = (user.claimedDays || []).includes(r.day);
                  const isCurrent = (user.loginStreak || 1) >= r.day && !isClaimed;

                  return (
                    <div
                      key={r.day}
                      className={`p-3 rounded-md border text-center flex flex-col items-center justify-between transition ${
                        isClaimed
                          ? 'bg-emerald-50 border-emerald-300 text-[#388e3c]'
                          : isCurrent
                          ? 'bg-amber-50 border-[#fb641b] text-[#212121] shadow-xs ring-1 ring-amber-300'
                          : 'bg-[#f9fafb] border-slate-200 text-[#878787]'
                      }`}
                    >
                      <div className="text-[10px] font-bold">Day {r.day}</div>
                      <div className="text-2xl my-1">{r.icon}</div>
                      <div className="text-xs font-black tabular-nums text-[#212121]">+{r.coins} Coins</div>

                      {isClaimed ? (
                        <span className="mt-2 text-[9px] font-bold text-[#388e3c] flex items-center space-x-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Claimed</span>
                        </span>
                      ) : isCurrent ? (
                        <button
                          onClick={() => handleClaimLoginReward(r.day)}
                          className="mt-2 bg-[#fb641b] hover:bg-[#e8550f] text-white py-1 px-2.5 rounded-sm text-[9px] font-bold cursor-pointer"
                        >
                          CLAIM NOW
                        </button>
                      ) : (
                        <span className="mt-2 text-[9px] text-slate-500">Locked</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Tasks List */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-[#212121]">
              <h3 className="font-bold text-sm text-[#212121] mb-3 flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-[#fb641b]" />
                <span>Daily Coins Tasks (टास्क पूरा करें और सिक्के कमाएं)</span>
              </h3>

              <div className="space-y-2">
                {[
                  { title: 'Listen in Voice Room for 5 minutes', reward: '+50 Coins', done: true },
                  { title: 'Play 3 Coin Games (Spin, Dice, Coin Flip)', reward: '+100 Coins', done: true },
                  { title: 'Send 1 Luxury Gift to Host or Friends', reward: '+150 Coins', done: false },
                  { title: 'Invite 1 Friend to ESP GAMING TIME', reward: '+500 Coins & ₹50 Cash', done: false },
                ].map((task, idx) => (
                  <div key={idx} className="bg-[#f9fafb] p-3 rounded-md border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#212121]">{task.title}</div>
                      <div className="text-[#fb641b] text-[10px] font-bold mt-0.5">{task.reward}</div>
                    </div>
                    {task.done ? (
                      <span className="px-2.5 py-1 rounded-sm bg-emerald-50 text-[#388e3c] border border-emerald-200 text-[10px] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          showToast('टास्क सक्रिय! कार्य पूरा करने के बाद रिवॉर्ड अपने आप जुड़ जाएगा।', 'info');
                        }}
                        className="bg-[#2874f0] hover:bg-[#1c62d6] px-3 py-1 rounded-sm text-[10px] font-bold text-white cursor-pointer"
                      >
                        Start Task
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
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
                  <div className="font-black text-pink-600">{selectedSeatAction.charms || 150} ✨</div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    setShowGiftModal(true);
                    setGiftTarget(selectedSeatAction.userName || 'Member');
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
                  onChange={e => setGiftTarget(e.target.value)}
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

                <button
                  onClick={() => handleSendGift()}
                  className="bg-[#fb641b] hover:bg-[#e8550f] py-2.5 px-6 rounded-sm font-black text-xs text-white shadow-sm transition cursor-pointer"
                >
                  SEND {selectedGift?.name.toUpperCase()} 🎁
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Player Digital Profile Dashboard Modal */}
      {selectedPlayerProfile && (
        <PlayerInfoModal
          player={selectedPlayerProfile}
          onClose={() => setSelectedPlayerProfile(null)}
          onSendGift={(p) => {
            setSelectedPlayerProfile(null);
            setGiftTarget(p.fullName);
            setShowGiftModal(true);
          }}
        />
      )}

      {/* 1. Create New Voice Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-xl">
                  🎙️
                </div>
                <div>
                  <h3 className="text-base font-black">अपना वॉइस रूम बनाएं</h3>
                  <p className="text-[11px] text-blue-100">आप इस रूम के होस्ट (Owner) होंगे</p>
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
              <p className="text-xs text-[#878787] mb-4">
                आप टॉपिक निर्धारित कर सकते हैं और दोस्तों को आमंत्रित कर सकते हैं।
              </p>

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
                        className={`p-2.5 rounded-sm border text-left transition cursor-pointer ${
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

      {/* 2. All Community Voice Rooms Modal */}
      {showRoomsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-xl">
                  🌐
                </div>
                <div>
                  <h3 className="text-base font-black">सभी लाइव कम्युनिटी वॉइस रूम्स</h3>
                  <p className="text-[11px] text-blue-100">
                    उपलब्ध रूम्स में जाएं या दोस्तों के साथ अपना रूम शुरू करें
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

            <div className="p-5 flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-3">
                <div className="text-xs font-bold text-[#2874f0]">
                  कुल एक्टिव रूम्स: {availableRooms.length}
                </div>
                <button
                  onClick={() => {
                    setShowRoomsModal(false);
                    setShowCreateRoomModal(true);
                  }}
                  className="bg-[#fb641b] hover:bg-[#e8550f] px-3.5 py-1.5 rounded-sm text-xs font-black text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  अपना नया रूम बनाएं
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 pr-1 flex-1">
                {availableRooms.map((room) => {
                  const isCurrent = room.id === currentRoomId;
                  const occupiedCount = room.seats ? room.seats.filter((s: any) => s.userId).length : 0;
                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-sm border transition ${
                        isCurrent
                          ? 'bg-[#f5f8ff] border-[#2874f0] shadow-xs'
                          : 'bg-[#f9fafb] border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={room.hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${room.hostUserId}`}
                            alt={room.hostName}
                            className="w-12 h-12 rounded-sm bg-white border border-slate-200 object-cover flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-[#212121]">{room.title}</span>
                              <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-black bg-blue-50 text-[#2874f0] border border-blue-200 uppercase">
                                {room.category}
                              </span>
                              {room.isPrivate && (
                                <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-[#ffe500] text-[#212121] flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" /> लॉक
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[9px] font-bold text-[#388e3c]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#388e3c] animate-ping" /> LIVE
                              </span>
                            </div>

                            <div className="text-[11px] text-[#878787] mt-1 line-clamp-1">
                              {room.topic || 'No topic set'}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#878787] flex-wrap">
                              <span>👑 होस्ट: <strong className="text-[#212121]">{room.hostName}</strong></span>
                              <span>👥 {room.listenersCount || 1} श्रोता</span>
                              <span>🎙️ {occupiedCount}/8 सीट्स भरी</span>
                              <span className="text-slate-400 font-mono text-[9px]">ID: {room.roomAddress}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {isCurrent ? (
                            <div className="px-4 py-2 rounded-sm bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-black flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> वर्तमान रूम
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSwitchRoom(room.id)}
                              className="w-full sm:w-auto px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              जॉइन करें ➔
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

              {/* Manage Seats */}
              <div className="p-4 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-[#212121]">
                  🎙️ सीट्स प्रबंधन (Mute & Kick Members)
                </div>
                <div className="space-y-2">
                  {seats.map((seat) => (
                    <div
                      key={seat.seatNumber}
                      className="flex items-center justify-between p-2.5 rounded-sm bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-[#f5f8ff] border border-blue-100 flex items-center justify-center text-[10px] font-black text-[#2874f0]">
                          #{seat.seatNumber + 1}
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
                          <div className="text-[#878787] italic">सीट खाली है</div>
                        )}
                      </div>

                      {seat.userId && seat.userId !== user.userId && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleHostMuteSeat(seat.seatNumber, !seat.isMuted)}
                            className={`px-2.5 py-1 rounded-sm text-[10px] font-bold border transition cursor-pointer ${
                              seat.isMuted
                                ? 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
                                : 'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            {seat.isMuted ? 'अनम्यूट करें' : 'म्यूट करें'}
                          </button>
                          <button
                            onClick={() => handleHostKickSeat(seat.seatNumber)}
                            className="px-2.5 py-1 rounded-sm text-[10px] font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                          >
                            सीट से हटाएं
                          </button>
                        </div>
                      )}
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

      {/* 4. WePlay AI Bot Hub & Sharma Ji Spotlight Modal */}
      {showBotHubModal && (
        <WePlayBotHubModal
          user={user}
          bots={availableBots}
          onClose={() => setShowBotHubModal(false)}
          onInviteBotToSeat={(botId) => {
            handleInviteBotToSeat(botId, selectedSeatForBot ?? undefined);
            setSelectedSeatForBot(null);
            setShowBotHubModal(false);
          }}
          onSummonAllBots={() => {
            handleSummonAllBots();
            setShowBotHubModal(false);
          }}
          onBotAction={(code, type) => handleBotAction(code, type)}
          onOpenWerewolfGame={() => {
            setShowBotHubModal(false);
            setShowWerewolfModal(true);
          }}
          onOpenSharmaJiProfile={() => {
            setShowBotHubModal(false);
            handleOpenPlayerModal('SHARMA-JI-VIP', {
              userId: 'SHARMA-JI-VIP',
              fullName: '👑 Sharma Ji (शर्मा जी)',
              gameLevel: 99,
              charms: 98765,
              roleTitle: '👑 ESP PLAY Grand Emperor (सर्वोच्च महाराजा)',
              coins: 999999,
              roomAddress: 'ESP-ROOM-SHARMAJI-ROYAL',
              houseName: '👑 शर्मा जी का राजमहल (Sharma Ji Royal Palace)',
              clanName: '👑 Sharma Ji Royals',
              clanRole: 'Leader',
            });
          }}
        />
      )}

      {/* 5. WePlay Werewolf Game Modal */}
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

      {/* 6. Simulated Voice Effect Selector Modal (Pre-join & Room Setting) */}
      {showVoiceEffectModal && (
        <VoiceEffectSelector
          currentEffect={selectedVoiceEffect}
          onSelectEffect={(effect) => {
            setSelectedVoiceEffect(effect);
            try {
              localStorage.setItem('esp_voice_effect', effect);
            } catch {}
            const cfg = VOICE_EFFECTS.find(v => v.id === effect);
            setSoundEffectToast(`🎭 आवाज़ इफ़ेक्ट सेट: ${cfg?.icon} ${cfg?.name} (${cfg?.hindiName})`);
            setTimeout(() => setSoundEffectToast(null), 3000);
          }}
          isModal={true}
          seatIndexToJoin={pendingJoinSeatIndex}
          onClose={() => {
            setShowVoiceEffectModal(false);
            setPendingJoinSeatIndex(null);
          }}
          onConfirmJoinSeat={async () => {
            const targetSeat = pendingJoinSeatIndex;
            setShowVoiceEffectModal(false);
            setPendingJoinSeatIndex(null);
            if (targetSeat !== null) {
              await handleTakeSeat(targetSeat);
            }
          }}
        />
      )}

      {/* 7. Daily Lucky Spin Modal */}
      {showDailySpinModal && (
        <DailyLuckySpin
          user={user}
          onUpdateUser={onUpdateUser}
          isModal={true}
          onClose={() => setShowDailySpinModal(false)}
        />
      )}

      {/* 8. Who is the Spy (जासूस कौन है?) WePlay Game Modal */}
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
                setSelectedPlayerProfile({
                  userId: p.userId,
                  fullName: p.fullName,
                  avatar: p.avatar,
                  frameType: p.frameType,
                  gameLevel: p.gameLevel,
                  charms: p.charms,
                  clanName: p.clanName,
                  roleTitle: p.badge || 'Player',
                });
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
          onClose={() => setShowFortuneSpinModal(false)}
        />
      )}

      {/* 11. 8 Timed Mystery Boxes (Rewards Center) Modal */}
      {showTimedChestModal && (
        <TimedMysteryChestModal
          user={user}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowTimedChestModal(false)}
        />
      )}

      {/* 12. WePlay App Gift Sheet (5 to 50 Lakh coins, Diwali specials, combo and coins-back) */}
      {showAppGiftModal && (
        <WePlayAppGiftModal
          user={user}
          seats={seats}
          onClose={() => setShowAppGiftModal(false)}
          onSendGift={(gift, count, target, coinsBack) => {
            const cost = gift.coinCost * count;
            const baseCharms = gift.charmValue * count;
            const { newCombo, multiplier, bonusCharms, totalCharmsAwarded } = registerGiftCombo(
              baseCharms,
              gift.hindiName
            );
            const updatedCoins = (user.coins || 0) - cost + coinsBack;
            const updatedCharms = (user.charms || 0) + totalCharmsAwarded;
            onUpdateUser({
              ...user,
              coins: Math.max(0, updatedCoins),
              charms: updatedCharms,
            });
            setShowAppGiftModal(false);
            setActiveGiftAnimation({
              gift: {
                id: gift.id,
                name: gift.name,
                hindiName: gift.hindiName,
                icon: gift.icon,
                coinCost: gift.coinCost,
                charmValue: totalCharmsAwarded,
                animationType: gift.animationType as any,
                gradient: gift.gradient,
              },
              sender: user.fullName,
              target,
            });
            const comboText = newCombo >= 2 ? `🔥 [COMBO x${newCombo}! ${multiplier}x Multiplier] (+${bonusCharms} Extra Charms!)` : '';
            setGiftAnnouncement(`🎁 ${user.fullName} ने ${target} को ${count}x ${gift.hindiName} भेजा! (+${totalCharmsAwarded}✨ Charms) ${comboText} ${coinsBack > 0 ? `[💰 ${coinsBack} Coins वापस मिले!]` : ''}`);
            playSynthesizedChime(newCombo >= 2 ? 'win' : 'gift');
            confetti({
              particleCount: newCombo >= 2 ? 220 : 140,
              spread: 100,
              origin: { y: 0.6 }
            });
            setRoomChatMessages(prev => [
              ...prev,
              {
                id: `gift-${Date.now()}`,
                sender: newCombo >= 2 ? `🔥 COMBO x${newCombo}` : 'APP GIFT',
                isGift: true,
                text: `🎁 ${user.fullName} sent ${count}x ${gift.name} ${gift.icon} to ${target}! (+${totalCharmsAwarded} Charms ${comboText})`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setTimeout(() => {
              setActiveGiftAnimation(null);
              setGiftAnnouncement(null);
            }, 4500);
          }}
        />
      )}

      {/* 13. Daily Tasks & 7-Day Login Calendar Modal */}
      {showDailyTasksModal && (
        <DailyTasksAndLoginModal
          user={user}
          onUpdateUser={onUpdateUser}
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
        />
      )}

      {/* 16. Avatar & Status Frame Customizer Modal */}
      {showAvatarCustomizerModal && (
        <AvatarCustomizerModal
          user={user}
          isOpen={showAvatarCustomizerModal}
          onClose={() => setShowAvatarCustomizerModal(false)}
          onSaveAvatar={handleSaveAvatarCustomization}
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
      />

      {/* 19. Real-Time Weekly Rewards Modal with Missed Day logic */}
      <DailyLoginRewardsModal
        user={user}
        isOpen={showWeeklyRewardsModal}
        onClose={() => setShowWeeklyRewardsModal(false)}
        onClaim={(updatedUser, reward) => {
          onUpdateUser(updatedUser);
          api.setStoredUser(updatedUser);
          setSoundEffectToast(`🎉 +${reward.coins} कॉइन्स मिले!`);
          setTimeout(() => setSoundEffectToast(null), 3000);
        }}
      />

      {/* 20. ESP CHAT Modal (Facebook-style Social Friend Making & 1-on-1 Chat) */}
      <EspChatModal
        currentUser={user}
        isOpen={showEspChatModal}
        onClose={() => setShowEspChatModal(false)}
      />

      {/* 21. Interactive 8D Gaming Arena Modal (Who's the Spy, Ludo, Space Werewolf, etc.) */}
      {activeInteractiveGame && (
        <InteractiveGameArenaModal
          gameKey={activeInteractiveGame}
          currentUser={user}
          isOpen={Boolean(activeInteractiveGame)}
          onClose={() => setActiveInteractiveGame(null)}
          onUpdateCoins={(newCoins) => {
            const updated = { ...user, coins: newCoins };
            onUpdateUser(updated);
            api.setStoredUser(updated);
          }}
        />
      )}

      {/* Floating Seating Reward Toast Notice */}
      {seatingRewardNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-4 py-2 rounded-2xl shadow-2xl border-2 border-emerald-300 animate-bounce text-xs sm:text-sm flex items-center gap-2">
          <span>{seatingRewardNotice}</span>
        </div>
      )}
    </div>
  );
};
