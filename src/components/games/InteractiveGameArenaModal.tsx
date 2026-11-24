import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Coins,
  Users,
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { sound8D } from '../../services/sound8d.ts';
import {
  LiarsPartyEngine,
  CrazyAlpacaEngine,
  PoolPhysicsEngine,
  MicGrabEngine,
  LudoBoardEngine,
  DrawingGuessEngine,
  HideSeekEngine,
  TrickstersCafeEngine,
  WordBombEngine,
  LiarsDiceEngine,
  type PlayableEngineProps,
} from './RealPlayableGamesSuite.tsx';

export type GameKey =
  | 'spy'
  | 'liars_party'
  | 'trickster'
  | 'crazy_alpaca'
  | 'hide_seek'
  | 'werewolf'
  | 'cards'
  | 'ludo'
  | 'drawing'
  | 'bingo'
  | 'mic_grab'
  | 'pool'
  | 'spin'
  | 'snake'
  | 'word_bomb'
  | 'liars_dice';

export interface GameMetadata {
  key: GameKey;
  name: string;
  hindiName: string;
  badge: string;
  gradient: string;
  icon: string;
  minBet: number;
  winCoins: number;
  maxPlayers: number;
}

export const GAMES_METADATA: Record<GameKey, GameMetadata> = {
  spy: {
    key: 'spy',
    name: "Who's the Spy",
    hindiName: "हू इज द स्पाई (जासूस ढूंढो)",
    badge: 'Deduction',
    gradient: 'from-[#00b4d8] to-[#0077b6]',
    icon: '🕵️‍♂️',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 6,
  },
  liars_party: {
    key: 'liars_party',
    name: "Liar's Party",
    hindiName: "लायर्स पार्टी (रियल ब्लफ कार्ड गेम)",
    badge: 'Bluff Cards',
    gradient: 'from-[#7f2626] to-[#451010]',
    icon: '🎭',
    minBet: 25,
    winCoins: 65,
    maxPlayers: 5,
  },
  trickster: {
    key: 'trickster',
    name: "Trickster's Cafe",
    hindiName: "ट्रिकस्टर्स कैफे (ब्लफ व कार्ड्स)",
    badge: 'Bluff & Order',
    gradient: 'from-[#7f2626] to-[#451010]',
    icon: '🐊',
    minBet: 25,
    winCoins: 60,
    maxPlayers: 5,
  },
  crazy_alpaca: {
    key: 'crazy_alpaca',
    name: 'Crazy Alpaca',
    hindiName: 'क्रेज़ी अल्पाका (रियल लेन रनर)',
    badge: 'Arcade 60fps',
    gradient: 'from-[#84cc16] to-[#4d7c0f]',
    icon: '🦙',
    minBet: 15,
    winCoins: 45,
    maxPlayers: 4,
  },
  hide_seek: {
    key: 'hide_seek',
    name: 'Hide And Seek',
    hindiName: 'हाइड एंड सीक (छुपन-छुपाई)',
    badge: 'Stealth',
    gradient: 'from-[#0ea5e9] to-[#0284c7]',
    icon: '👀',
    minBet: 15,
    winCoins: 40,
    maxPlayers: 6,
  },
  werewolf: {
    key: 'werewolf',
    name: 'Space Werewolf',
    hindiName: 'स्पेस वेयरवोल्फ (अंतरिक्ष भेड़िया)',
    badge: 'Night Vote',
    gradient: 'from-[#6b21a8] to-[#3b0764]',
    icon: '🐺',
    minBet: 30,
    winCoins: 75,
    maxPlayers: 8,
  },
  cards: {
    key: 'cards',
    name: 'Oh My Card',
    hindiName: 'ओह माय कार्ड (कार्ड क्लैश)',
    badge: 'Card Duel',
    gradient: 'from-[#84cc16] to-[#4d7c0f]',
    icon: '🃏',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 4,
  },
  ludo: {
    key: 'ludo',
    name: 'Ludo 3D',
    hindiName: 'लूडो 3D किंग (रियल ट्रैक रेस)',
    badge: 'Board Race',
    gradient: 'from-[#7c3aed] to-[#4c1d95]',
    icon: '🎲',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 4,
  },
  drawing: {
    key: 'drawing',
    name: 'Guess Drawing',
    hindiName: 'गेस माय ड्राइंग (चित्र पहचानो)',
    badge: 'Sketch Quiz',
    gradient: 'from-[#22c55e] to-[#15803d]',
    icon: '✏️',
    minBet: 10,
    winCoins: 30,
    maxPlayers: 6,
  },
  bingo: {
    key: 'bingo',
    name: 'Bingo Live',
    hindiName: 'बिंगो लाइव तंबोला',
    badge: 'Lucky Grid',
    gradient: 'from-[#6366f1] to-[#3730a3]',
    icon: '🎱',
    minBet: 25,
    winCoins: 60,
    maxPlayers: 8,
  },
  mic_grab: {
    key: 'mic_grab',
    name: 'Mic Grab',
    hindiName: 'माइक ग्रैब पार्टी (बीट व लिरिक्स)',
    badge: 'Music Beat',
    gradient: 'from-[#e11d48] to-[#9f1239]',
    icon: '🎙️',
    minBet: 15,
    winCoins: 45,
    maxPlayers: 8,
  },
  pool: {
    key: 'pool',
    name: 'Pool',
    hindiName: 'पूल 8-बॉल (रियल 2D फिजिक्स)',
    badge: '2D Physics',
    gradient: 'from-[#7c4a32] to-[#3e2214]',
    icon: '🎱',
    minBet: 25,
    winCoins: 65,
    maxPlayers: 2,
  },
  spin: {
    key: 'spin',
    name: 'Spin',
    hindiName: 'डेली फॉर्च्यून स्पिन',
    badge: 'Fortune',
    gradient: 'from-[#8b5cf6] to-[#4f46e5]',
    icon: '🎡',
    minBet: 50,
    winCoins: 250,
    maxPlayers: 1,
  },
  snake: {
    key: 'snake',
    name: 'Snake Rush',
    hindiName: 'स्नेक रश 2D',
    badge: 'Arcade',
    gradient: 'from-[#10b981] to-[#047857]',
    icon: '🐍',
    minBet: 10,
    winCoins: 35,
    maxPlayers: 4,
  },
  word_bomb: {
    key: 'word_bomb',
    name: 'Word Bomb',
    hindiName: 'वर्ड बॉम्ब (टिकिंग सिलेबल रेस)',
    badge: 'Speed Word',
    gradient: 'from-[#e11d48] to-[#9f1239]',
    icon: '💣',
    minBet: 15,
    winCoins: 45,
    maxPlayers: 6,
  },
  liars_dice: {
    key: 'liars_dice',
    name: "Liar's Dice",
    hindiName: "लायर्स डाइस (पासा ब्लफ)",
    badge: 'Dice Bluff',
    gradient: 'from-[#b45309] to-[#78350f]',
    icon: '🎲',
    minBet: 25,
    winCoins: 65,
    maxPlayers: 4,
  },
};

interface InteractiveGameArenaModalProps {
  gameKey: GameKey;
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCoins: (newCoins: number) => void;
  onOpenBuyCoins?: () => void;
}

export const InteractiveGameArenaModal: React.FC<InteractiveGameArenaModalProps> = ({
  gameKey,
  currentUser,
  isOpen,
  onClose,
  onUpdateCoins,
  onOpenBuyCoins,
}) => {
  const game = GAMES_METADATA[gameKey] || GAMES_METADATA.liars_party;
  const [isAudio8D, setIsAudio8D] = useState(true);
  const [mode, setMode] = useState<'free' | 'pro'>('free');
  const [resultBanner, setResultBanner] = useState<{ type: 'win' | 'loss' | 'error'; text: string } | null>(null);
  const [communityMembers, setCommunityMembers] = useState<Array<{ userId: string; fullName: string; avatar?: string }>>([]);

  useEffect(() => {
    setResultBanner(null);
  }, [gameKey, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    api.getRealCommunityPlayers()
      .then((list) => {
        if (Array.isArray(list)) {
          const others = list.filter((p: any) => p.userId !== currentUser.userId);
          setCommunityMembers(others.slice(0, 3));
        }
      })
      .catch(() => {});
  }, [isOpen, currentUser.userId]);

  useEffect(() => {
    if (isOpen) {
      sound8D.setMuted(!isAudio8D);
      sound8D.play8DChime(440, 'click');
      sound8D.start8DAmbient();
    }
    return () => {
      sound8D.stop8DAmbient();
    };
  }, [isOpen, isAudio8D]);

  if (!isOpen) return null;

  const userCoins = currentUser.coins || 0;
  const canAffordPro = userCoins >= game.minBet;
  const uId = currentUser.userId || (currentUser as any).id;

  const players = [
    {
      name: currentUser.fullName,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.userId}`,
      isMe: true,
    },
    ...[0, 1, 2].map((slotIdx) => {
      const real = communityMembers[slotIdx];
      return real
        ? {
            name: real.fullName,
            avatar: real.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${real.userId}`,
            isMe: false,
          }
        : {
            name: `Player #${slotIdx + 2}`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=EspSeat${slotIdx + 2}`,
            isMe: false,
          };
    }),
  ];

  const handleStartMatch = async (): Promise<boolean> => {
    setResultBanner(null);
    if (mode === 'pro') {
      if (!canAffordPro) {
        setResultBanner({
          type: 'error',
          text: `Pro Table के लिए ${game.minBet} Coins चाहिए। ऊपर "Free Skill Match" चुनें या Buy Coins करें!`,
        });
        return false;
      }
      try {
        const wagerRes = await api.playCoinsGame(uId, game.name, game.minBet);
        if (!wagerRes.success) {
          setResultBanner({ type: 'error', text: wagerRes.error || wagerRes.message || 'पर्याप्त कॉइन्स नहीं हैं' });
          return false;
        }
        if (wagerRes.currentCoins !== undefined) {
          onUpdateCoins(wagerRes.currentCoins);
        }
      } catch (err: any) {
        setResultBanner({ type: 'error', text: err?.message || 'Pro टेबल शुरू करने में त्रुटि' });
        return false;
      }
    }
    sound8D.play8DChime(460, 'click');
    return true;
  };

  const handleFinishMatch = async (outcome: 'win' | 'loss', score: number, summaryText: string) => {
    api.recordTaskAction(uId, 'game_played', 1).catch(() => {});

    if (mode === 'free') {
      try {
        const res = await api.playFreeSkillMatch(uId, game.name, outcome, score);
        if (res.currentCoins !== undefined) {
          onUpdateCoins(res.currentCoins);
        }
        if (outcome === 'win') {
          sound8D.play8DChime(600, 'win');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else {
          sound8D.play8DChime(390, 'click');
        }
        setResultBanner({
          type: outcome,
          text: `${summaryText} (${res.message || `+${res.coinsEarned || 0} Coins · +${res.xpEarned || 0} EXP`})`,
        });
      } catch {
        setResultBanner({ type: outcome, text: summaryText });
      }
      return;
    }

    if (outcome === 'win') {
      try {
        const winRes = await api.claimGameWin(uId, game.name, game.winCoins);
        if (winRes.success && winRes.currentCoins !== undefined) {
          onUpdateCoins(winRes.currentCoins);
        }
        sound8D.play8DChime(620, 'win');
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
        setResultBanner({
          type: 'win',
          text: `${summaryText} · +${game.winCoins} Coins आपके वॉलेट में जुड़ गए!`,
        });
      } catch {
        setResultBanner({ type: 'win', text: summaryText });
      }
    } else {
      sound8D.play8DChime(340, 'click');
      setResultBanner({
        type: 'loss',
        text: `${summaryText} (-${game.minBet} Coins · Daily Task +1 अपडेट हुआ)`,
      });
    }
  };

  const engineProps: PlayableEngineProps = {
    mode,
    betCoins: game.minBet,
    winCoins: game.winCoins,
    userName: currentUser.fullName,
    onStartMatch: handleStartMatch,
    onFinishMatch: handleFinishMatch,
  };

  const renderGameEngine = () => {
    switch (gameKey) {
      case 'liars_party':
        return <LiarsPartyEngine {...engineProps} />;
      case 'trickster':
        return <TrickstersCafeEngine {...engineProps} />;
      case 'word_bomb':
        return <WordBombEngine {...engineProps} />;
      case 'liars_dice':
        return <LiarsDiceEngine {...engineProps} />;
      case 'crazy_alpaca':
        return <CrazyAlpacaEngine {...engineProps} />;
      case 'pool':
        return <PoolPhysicsEngine {...engineProps} />;
      case 'mic_grab':
        return <MicGrabEngine {...engineProps} />;
      case 'ludo':
        return <LudoBoardEngine {...engineProps} />;
      case 'drawing':
        return <DrawingGuessEngine {...engineProps} />;
      case 'hide_seek':
      default:
        return <HideSeekEngine {...engineProps} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn">
      <div className="esp-popup-card relative max-w-xl bg-white border border-slate-200 overflow-hidden flex flex-col text-[#212121]">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${game.gradient} border-b border-white/20 flex items-center justify-between text-white`}>
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">{game.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{game.name}</h3>
                <span className="text-[10px] bg-[#ffe500] text-[#212121] font-black px-2 py-0.5 rounded uppercase">
                  {game.badge}
                </span>
              </div>
              <p className="text-[11px] text-white/90">{game.hindiName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const next = !isAudio8D;
                setIsAudio8D(next);
                sound8D.setMuted(!next);
              }}
              className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                isAudio8D ? 'bg-[#ffe500] text-[#212121]' : 'bg-white/15 text-white'
              }`}
              title="8D Audio Toggle"
            >
              {isAudio8D ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] font-black">8D</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Players Ring */}
        <div className="px-4 py-2.5 bg-[#f5f8ff] border-b border-blue-100">
          <div className="flex items-center justify-around">
            {players.map((p, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-0.5">
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className={`w-9 h-9 rounded-full border-2 bg-white ${
                      p.isMe ? 'border-[#fb641b]' : 'border-[#2874f0]'
                    } object-cover`}
                  />
                  {p.isMe && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-[#fb641b] text-white font-black px-1 rounded">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#212121] truncate max-w-[68px]">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Toggle + Real Game Engine */}
        <div className="esp-auto-stage flex-1 overflow-y-auto space-y-3 bg-white">
          {/* Free vs Pro Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('free')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                mode === 'free'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-xs font-black">🆓 Free Skill Match</div>
              <div className="text-[10px] font-semibold">0 Coins · जीतें +10–20 Coins</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('pro')}
              className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                mode === 'pro'
                  ? 'bg-amber-50 border-[#fb641b] text-amber-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-xs font-black">🪙 Pro Table ({game.minBet}c)</div>
              <div className="text-[10px] font-semibold">जीत पर सीधे +{game.winCoins} Coins</div>
            </button>
          </div>

          {mode === 'pro' && !canAffordPro && (
            <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-bold text-amber-900">
              <span>Pro Table के लिए {game.minBet} Coins चाहिए (Free Match से जीतें या Buy करें)</span>
              {onOpenBuyCoins && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBuyCoins();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold shrink-0 cursor-pointer"
                >
                  + Buy Coins
                </button>
              )}
            </div>
          )}

          {resultBanner && (
            <div
              className={`p-3 rounded-xl border text-xs font-black text-center ${
                resultBanner.type === 'win'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : resultBanner.type === 'error'
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {resultBanner.text}
            </div>
          )}

          {/* Real Interactive Game Component */}
          <div className="pt-1">{renderGameEngine()}</div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#f9fafb] border-t border-slate-200 flex items-center justify-between text-xs text-[#878787]">
          <span className="flex items-center gap-1.5 text-[#fb641b] font-bold">
            <Coins className="w-4 h-4" />
            <span>कॉइन्स: {userCoins.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 text-[#2874f0] font-bold">
            <Users className="w-4 h-4" />
            <span>Live Table: 4/{game.maxPlayers}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
