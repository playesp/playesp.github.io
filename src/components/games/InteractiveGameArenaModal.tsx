import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Play, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Coins, 
  Users, 
  Dices, 
  Mic, 
  MicOff, 
  Send, 
  Trophy, 
  Radio, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  RotateCw,
  Gift
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { sound8D } from '../../services/sound8d.ts';

export type GameKey = 
  | 'spy' 
  | 'trickster' 
  | 'hide_seek' 
  | 'werewolf' 
  | 'cards' 
  | 'ludo' 
  | 'drawing' 
  | 'bingo' 
  | 'mic_grab';

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
    badge: 'Deduction 🕵️‍♂️',
    gradient: 'from-[#00b4d8] to-[#0077b6]',
    icon: '🕵️‍♂️',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 6
  },
  trickster: {
    key: 'trickster',
    name: "Trickster's Cafe",
    hindiName: "ट्रिकस्टर्स कैफे (ब्लफ और कार्ड्स)",
    badge: 'Bluff & Order 🐊',
    gradient: 'from-[#7f2626] to-[#451010]',
    icon: '🐊',
    minBet: 25,
    winCoins: 60,
    maxPlayers: 5
  },
  hide_seek: {
    key: 'hide_seek',
    name: "Hide And Seek",
    hindiName: "हाइड एंड सीक (छुपन-छुपाई)",
    badge: 'Camouflage 🔍',
    gradient: 'from-[#0ea5e9] to-[#0284c7]',
    icon: '👀',
    minBet: 15,
    winCoins: 40,
    maxPlayers: 6
  },
  werewolf: {
    key: 'werewolf',
    name: "Space Werewolf",
    hindiName: "स्पेस वेयरवोल्फ (अंतरिक्ष भेड़िया)",
    badge: 'Night Vote 🐺',
    gradient: 'from-[#6b21a8] to-[#3b0764]',
    icon: '🐺',
    minBet: 30,
    winCoins: 75,
    maxPlayers: 8
  },
  cards: {
    key: 'cards',
    name: "Oh My Card",
    hindiName: "ओह माय कार्ड (यूएनओ क्लैश)",
    badge: 'High-Low Clash 🃏',
    gradient: 'from-[#84cc16] to-[#4d7c0f]',
    icon: '🃏',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 4
  },
  ludo: {
    key: 'ludo',
    name: "Ludo 3D King",
    hindiName: "लूडो 3D किंग (डाइस रोल)",
    badge: 'Classic Board 🎲',
    gradient: 'from-[#7c3aed] to-[#4c1d95]',
    icon: '🎲',
    minBet: 20,
    winCoins: 50,
    maxPlayers: 4
  },
  drawing: {
    key: 'drawing',
    name: "Guess My Drawing",
    hindiName: "गेस माय ड्राइंग (चित्र पहचानो)",
    badge: 'Draw & Guess 🎨',
    gradient: 'from-[#22c55e] to-[#15803d]',
    icon: '✏️',
    minBet: 10,
    winCoins: 25,
    maxPlayers: 6
  },
  bingo: {
    key: 'bingo',
    name: "Bingo Live Tambola",
    hindiName: "बिंगो लाइव तंबोला",
    badge: 'Lucky 8 Ball 🎱',
    gradient: 'from-[#6366f1] to-[#3730a3]',
    icon: '🎱',
    minBet: 25,
    winCoins: 60,
    maxPlayers: 8
  },
  mic_grab: {
    key: 'mic_grab',
    name: "Mic Grab Party",
    hindiName: "माइक ग्रैब पार्टी (सिंग एंड विन)",
    badge: 'Live Voice 🎙️',
    gradient: 'from-[#e11d48] to-[#9f1239]',
    icon: '🎙️',
    minBet: 10,
    winCoins: 25,
    maxPlayers: 8
  }
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
  const game = GAMES_METADATA[gameKey];
  const [isAudio8D, setIsAudio8D] = useState(true);
  const [diceNumber, setDiceNumber] = useState<number>(6);
  const [winnerNotice, setWinnerNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [rollingDice, setRollingDice] = useState(false);

  const [communityMembers, setCommunityMembers] = useState<Array<{ userId: string; fullName: string; avatar?: string }>>([]);

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

  const players = [
    {
      name: currentUser.fullName,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.userId}`,
      isMe: true,
      isSpeaking: false,
    },
    ...[0, 1, 2].map((slotIdx) => {
      const real = communityMembers[slotIdx];
      return real
        ? {
            name: real.fullName,
            avatar: real.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${real.userId}`,
            isMe: false,
            isSpeaking: false,
          }
        : {
            name: `Seat #${slotIdx + 2} (Open)`,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=OpenSeat${slotIdx + 2}`,
            isMe: false,
            isSpeaking: false,
          };
    }),
  ];

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
  const canAfford = userCoins >= game.minBet;

  // Free Skill Match (0 Coins Entry -> Win +10 to +20 Coins + EXP)
  const handleFreeSkillPlay = async () => {
    setErrorNotice(null);
    setWinnerNotice(null);
    setRollingDice(true);
    sound8D.play8DChime(360, 'roll');

    const uId = currentUser.userId || (currentUser as any).id;
    setTimeout(async () => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceNumber(rolled);
      const outcome: 'win' | 'loss' = rolled >= 3 ? 'win' : 'loss';
      try {
        const res = await api.playFreeSkillMatch(uId, gameKey, outcome, rolled * 15);
        setRollingDice(false);
        if (res.currentCoins !== undefined) {
          onUpdateCoins(res.currentCoins);
        }
        if (outcome === 'win') {
          sound8D.play8DChime(580, 'win');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } else {
          sound8D.play8DChime(440, 'click');
        }
        setWinnerNotice(res.message || `रोल: ${rolled}! +${res.coinsEarned || 0} कॉइन्स और +${res.xpEarned || 0} EXP मिले!`);
      } catch (err: any) {
        setRollingDice(false);
        setErrorNotice(err?.message || 'फ्री मैच सेव करने में त्रुटि');
      }
    }, 650);
  };

  // Real server-verified wager & win action
  const handleAction = async () => {
    setErrorNotice(null);
    setWinnerNotice(null);

    if (!canAfford) {
      setErrorNotice(`प्रो टेबल के लिए ${game.minBet} Coins चाहिए। नीचे "Free Skill Match" खेलकर मुफ्त कॉइन्स जीतें!`);
      return;
    }

    setRollingDice(true);
    sound8D.play8DChime(320, 'roll');

    const uId = currentUser.userId || (currentUser as any).id;
    try {
      const wagerRes = await api.playCoinsGame(uId, gameKey, game.minBet);
      if (!wagerRes.success) {
        setRollingDice(false);
        setErrorNotice(wagerRes.error || wagerRes.message || 'पर्याप्त कॉइन्स नहीं हैं');
        return;
      }
      if (wagerRes.currentCoins !== undefined) {
        onUpdateCoins(wagerRes.currentCoins);
      }
    } catch (err: any) {
      setRollingDice(false);
      setErrorNotice(err?.message || 'गेम शुरू करने में सर्वर त्रुटि');
      return;
    }

    setTimeout(async () => {
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceNumber(rolled);
      setRollingDice(false);

      // Record real task progress for playing a game
      api.recordTaskAction(uId, 'game_played', 1).catch(() => {});

      if (rolled >= 5) {
        try {
          const winRes = await api.claimGameWin(uId, gameKey, game.winCoins);
          if (winRes.success && winRes.currentCoins !== undefined) {
            onUpdateCoins(winRes.currentCoins);
          }
          sound8D.play8DChime(580, 'win');
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          setWinnerNotice(`🎉 शानदार जीत (रोल: ${rolled})! +${game.winCoins} कॉइन्स आपके वॉलेट में क्रेडिट हो गए!`);
        } catch {
          setWinnerNotice(`डाइस: ${rolled}! जीत सत्यापित करने में समस्या आई।`);
        }
      } else {
        sound8D.play8DChime(440, 'click');
        setWinnerNotice(`डाइस: ${rolled}! इस राउंड में जीत नहीं हुई (-${game.minBet} Coins)। टास्क प्रोग्रेस +1 दर्ज हो गया!`);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      
      {/* Game Window */}
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden flex flex-col text-[#212121] max-h-[92vh]">
        
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${game.gradient} border-b border-white/20 flex items-center justify-between text-white`}>
          <div className="flex items-center space-x-2.5">
            <span className="text-3xl">{game.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-sm">
                  {game.name}
                </h3>
                <span className="text-[9px] bg-[#ffe500] text-[#212121] font-black px-2 py-0.5 rounded-sm uppercase">
                  {game.badge}
                </span>
              </div>
              <p className="text-[11px] text-white/90">{game.hindiName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* 8D Audio Toggle */}
            <button
              onClick={() => {
                const next = !isAudio8D;
                setIsAudio8D(next);
                sound8D.setMuted(!next);
              }}
              className={`p-1.5 rounded-sm text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                isAudio8D ? 'bg-[#ffe500] text-[#212121] shadow-xs' : 'bg-white/15 text-white'
              }`}
              title="8D ऑडियो टॉगल करें"
            >
              {isAudio8D ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] font-black">8D {isAudio8D ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Players Seats Ring */}
        <div className="p-4 bg-[#f5f8ff] border-b border-blue-100">
          <div className="flex items-center justify-around">
            {players.map((p, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-1">
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className={`w-12 h-12 rounded-full border-2 bg-white ${p.isMe ? 'border-[#fb641b] ring-2 ring-orange-200' : 'border-[#2874f0]'} object-cover shadow-xs`}
                  />
                  {p.isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#388e3c] border-2 border-white animate-ping" />
                  )}
                  {p.isMe && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-[#fb641b] text-white font-black px-1 rounded-sm uppercase">
                      YOU
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-[#212121] truncate max-w-[70px]">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Play Arena */}
        <div className="p-5 flex-1 flex flex-col items-center justify-center text-center space-y-4 bg-white overflow-y-auto">
          
          {/* Main 3D Interactive Element */}
          <div className="relative w-36 h-36 rounded-md bg-[#f5f8ff] border-2 border-[#2874f0]/40 shadow-md flex flex-col items-center justify-center p-3 group">
            {rollingDice ? (
              <Dices className="w-16 h-16 text-[#fb641b] animate-spin" />
            ) : (
              <div className="text-center space-y-1">
                <span className="text-5xl">{game.icon}</span>
                <p className="text-xs font-black text-[#2874f0]">
                  {gameKey === 'ludo' ? `डाइस: ${diceNumber}` : `प्रो टेबल: ${game.minBet} Coins`}
                </p>
              </div>
            )}
          </div>

          {winnerNotice && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-xs font-black text-[#388e3c]">
              {winnerNotice}
            </div>
          )}

          {errorNotice && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-sm text-xs font-bold text-rose-700">
              {errorNotice}
            </div>
          )}

          {/* Action Triggers: Free Skill Match + Pro Coin Table */}
          <div className="w-full max-w-sm space-y-2.5">
            <button
              type="button"
              onClick={handleFreeSkillPlay}
              disabled={rollingDice}
              className="w-full py-3 px-5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-black text-sm shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {rollingDice
                ? 'राउंड चल रहा है...'
                : '🆓 Free Skill Match (0 Coins · जीतें +10 से +20 Coins!)'}
            </button>

            {canAfford ? (
              <button
                type="button"
                onClick={handleAction}
                disabled={rollingDice}
                className="w-full py-2.5 px-5 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-black text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {rollingDice
                  ? 'प्रो टेबल चल रही है...'
                  : `🎲 Pro Table: ${game.minBet} कॉइन्स लगाएं & जीतें +${game.winCoins}`}
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-sm text-[11px] font-bold text-amber-900">
                <span>प्रो टेबल ({game.minBet}c) के लिए ऊपर Free Match खेलें या Buy करें</span>
                {onOpenBuyCoins && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenBuyCoins();
                    }}
                    className="px-2.5 py-1 rounded-xs bg-[#2874f0] hover:bg-[#1c62d6] text-white font-bold shrink-0 cursor-pointer"
                  >
                    + Buy Coins
                  </button>
                )}
              </div>
            )}
            <p className="text-[10px] text-[#878787]">
              हर रियल राउंड (Free या Pro) पर Coins + EXP मिलते हैं और Daily Task +1 अपडेट होता है!
            </p>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-3 bg-[#f9fafb] border-t border-slate-200 flex items-center justify-between text-xs text-[#878787]">
          <span className="flex items-center gap-1.5 text-[#fb641b] font-bold">
            <Coins className="w-4 h-4" />
            <span>आपके कॉइन्स: {userCoins.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 text-[#2874f0] font-bold">
            <Users className="w-4 h-4" />
            <span>लाइव रूम: 4/{game.maxPlayers}</span>
          </span>
        </div>

      </div>

    </div>
  );
};
