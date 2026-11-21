import React, { useState } from 'react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, HelpCircle, 
  Sparkles, CheckCircle, AlertCircle, ArrowLeft, Play, Flame, ArrowUp, ArrowDown
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { UserProfile } from '../../types/index.ts';

interface OhMyCardGameProps {
  user: UserProfile;
  onCoinsUpdated: (newCoins: number) => void;
  onClose?: () => void;
  onOpenBuyCoins?: () => void;
}

type CardSuit = '♠' | '♥' | '♦' | '♣';
type CardColor = 'red' | 'black';

interface PlayingCard {
  suit: CardSuit;
  value: number; // 2 to 14 (14 = Ace)
  label: string;
  color: CardColor;
}

const SUITS: CardSuit[] = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: 2, label: '2' },
  { val: 3, label: '3' },
  { val: 4, label: '4' },
  { val: 5, label: '5' },
  { val: 6, label: '6' },
  { val: 7, label: '7' },
  { val: 8, label: '8' },
  { val: 9, label: '9' },
  { val: 10, label: '10' },
  { val: 11, label: 'J' },
  { val: 12, label: 'Q' },
  { val: 13, label: 'K' },
  { val: 14, label: 'A' },
];

export const OhMyCardGame: React.FC<OhMyCardGameProps> = ({ user, onCoinsUpdated, onClose, onOpenBuyCoins }) => {
  const [bet, setBet] = useState<number>((user.coins || 0) >= 20 ? 20 : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<PlayingCard>({
    suit: '♠',
    value: 10,
    label: '10',
    color: 'black'
  });
  const [nextCard, setNextCard] = useState<PlayingCard | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [potentialWinnings, setPotentialWinnings] = useState<number>(0);
  const [history, setHistory] = useState<PlayingCard[]>([]);
  const [message, setMessage] = useState<string>('शर्त चुनें और कार्ड का अनुमान लगाएं!');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sound synthesis
  const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignored
    }
  };

  const drawRandomCard = (): PlayingCard => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const vObj = VALUES[Math.floor(Math.random() * VALUES.length)];
    const color: CardColor = (suit === '♥' || suit === '♦') ? 'red' : 'black';
    return {
      suit,
      value: vObj.val,
      label: vObj.label,
      color,
    };
  };

  const startGame = async () => {
    if (bet > 0 && (user.coins || 0) < bet) {
      setMessage(`पर्याप्त कॉइन्स नहीं हैं! कम से कम ${bet} कॉइन्स चाहिए या "🆓 Free" चुनें।`);
      return;
    }

    if (bet > 0) {
      try {
        const uId = user.userId || (user as any).id;
        const res = await api.playCoinsGame(uId, 'cards', bet);
        if (!res.success) {
          setMessage(res.error || res.message || 'गेम शुरू करने में त्रुटि');
          return;
        }
        onCoinsUpdated(res.currentCoins);
      } catch {
        setMessage('सर्वर से संपर्क करने में असमर्थ');
        return;
      }
    }

    const firstCard = drawRandomCard();
    setCurrentCard(firstCard);
    setNextCard(null);
    setStreak(0);
    setMultiplier(1.0);
    setPotentialWinnings(bet === 0 ? 5 : bet);
    setHistory([firstCard]);
    setIsPlaying(true);
    setMessage('🃏 अगला कार्ड Higher (ऊंचा) होगा या Lower (नीचा)? या Red / Black? अनुमान लगाएं!');
    playSound(440, 'triangle', 0.2);
  };

  const makeGuess = async (guessType: 'higher' | 'lower' | 'red' | 'black' | 'royal') => {
    if (!isPlaying || isFlipping) return;

    setIsFlipping(true);
    playSound(520, 'sine', 0.1);

    // Draw card
    const drawn = drawRandomCard();
    setNextCard(drawn);

    setTimeout(async () => {
      let isWin = false;
      let multiStep = 1.8;

      if (guessType === 'higher') {
        isWin = drawn.value >= currentCard.value;
        multiStep = currentCard.value < 7 ? 1.4 : 2.2;
      } else if (guessType === 'lower') {
        isWin = drawn.value <= currentCard.value;
        multiStep = currentCard.value > 9 ? 1.4 : 2.2;
      } else if (guessType === 'red') {
        isWin = drawn.color === 'red';
        multiStep = 1.95;
      } else if (guessType === 'black') {
        isWin = drawn.color === 'black';
        multiStep = 1.95;
      } else if (guessType === 'royal') {
        isWin = drawn.value >= 11; // J, Q, K, A
        multiStep = 3.2;
      }

      if (isWin) {
        const newStreak = streak + 1;
        const newMulti = Number((multiplier * multiStep).toFixed(2));
        const baseStake = bet === 0 ? 5 : bet;
        const newPotential = bet === 0 ? Math.min(20, 5 + newStreak * 3) : Math.floor(baseStake * newMulti);

        setStreak(newStreak);
        setMultiplier(newMulti);
        setPotentialWinnings(newPotential);
        setCurrentCard(drawn);
        setNextCard(null);
        setHistory(prev => [drawn, ...prev.slice(0, 5)]);
        setIsFlipping(false);

        playSound(700, 'triangle', 0.25);
        setMessage(`🎯 सही अनुमान! Streak x${newStreak}! संभावित जीत: ${newPotential} कॉइन्स. आगे खेलें या Cash Out करें!`);
      } else {
        setIsFlipping(false);
        setIsPlaying(false);
        playSound(220, 'sawtooth', 0.3);
        const uId = user.userId || (user as any).id;
        if (uId) {
          if (bet === 0) {
            try {
              const res = await api.playFreeSkillMatch(uId, 'cards', 'loss', streak);
              if (res.currentCoins !== undefined) onCoinsUpdated(res.currentCoins);
              setMessage(`❌ कार्ड था ${drawn.label}${drawn.suit}. प्रयास बोनस +${res.coinsEarned || 0} कॉइन्स जुड़े!`);
              return;
            } catch {}
          } else {
            api.recordTaskAction(uId, 'game_played', 1).catch(() => {});
          }
        }
        setMessage(`❌ गलत अनुमान! कार्ड था ${drawn.label}${drawn.suit}. आपकी बाजी समाप्त हुई। फिर से प्रयास करें!`);
      }
    }, 700);
  };

  const handleCashout = async () => {
    if (!isPlaying || streak === 0) return;

    try {
      const uId = user.userId || (user as any).id;
      if (bet === 0) {
        const res = await api.playFreeSkillMatch(uId, 'cards', 'win', streak);
        if (res.success) {
          onCoinsUpdated(res.currentCoins);
          playSound(880, 'triangle', 0.4);
          setMessage(res.message || `🏆 शानदार स्ट्रीक x${streak}! +${res.coinsEarned} कॉइन्स जुड़े!`);
          setIsPlaying(false);
        }
      } else {
        const res = await api.claimGameWin(uId, 'cards', potentialWinnings);
        if (res.success) {
          onCoinsUpdated(res.currentCoins);
          playSound(880, 'triangle', 0.4);
          setMessage(`🏆 शानदार जीत! आपने ${potentialWinnings} कॉइन्स सफलतापूर्वक कैश आउट कर लिए!`);
          setIsPlaying(false);
          if (uId) api.recordTaskAction(uId, 'game_played', 1).catch(() => {});
        }
      }
    } catch {
      setMessage('कैशआउट में त्रुटि आई');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xl text-[#212121] max-w-xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-[#2874f0] px-4 sm:px-6 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-sm bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-black text-white">
                OH MY CARD 🃏
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-black bg-[#ffe500] text-[#212121]">
                HI-LO DUEL
              </span>
            </div>
            <p className="text-[11px] text-blue-100">52 पत्तों का लाइव प्रेडिक्शन गेम - स्ट्रीक बनाएं और कैशआउट करें!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className="p-2 rounded-sm bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            title="साउंड चालू / बंद"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#ffe500]" /> : <VolumeX className="w-4 h-4 text-white/60" />}
          </button>
          <button 
            onClick={() => setShowHelp(true)} 
            className="flex items-center space-x-1 px-3 py-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>नियम</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-[#f9fafb] rounded-sm p-2.5 text-center border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-[#878787] block">आपके कॉइन्स</span>
            <span className="text-base font-extrabold text-amber-600">🪙 {(user.coins || 0).toLocaleString()}</span>
          </div>
          <div className="bg-[#f9fafb] rounded-sm p-2.5 text-center border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-[#878787] block">विन स्ट्रीक</span>
            <span className="text-base font-extrabold text-[#fb641b] flex items-center justify-center space-x-1">
              <Flame className="w-4 h-4 text-[#fb641b] animate-bounce" />
              <span>x{streak}</span>
            </span>
          </div>
          <div className="bg-[#f9fafb] rounded-sm p-2.5 text-center border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-[#878787] block">संभावित कैशआउट</span>
            <span className="text-base font-extrabold text-[#388e3c]">+{potentialWinnings} 🪙</span>
          </div>
        </div>

        {/* Game Card Arena */}
        <div className="bg-[#f5f8ff] p-6 rounded-md border border-blue-100 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden">
          <div className="flex items-center justify-center space-x-6 relative z-10">
            {/* Active / Current Card */}
            <div className="relative group perspective">
              <div className={`w-32 h-48 rounded-md p-3 flex flex-col justify-between shadow-lg transition-all duration-500 transform ${
                isFlipping ? 'rotate-y-180 scale-95 opacity-60' : 'scale-100 hover:scale-105'
              } ${
                currentCard.color === 'red'
                  ? 'bg-white border-2 border-rose-300 text-red-600'
                  : 'bg-white border-2 border-slate-300 text-[#212121]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black">{currentCard.label}</span>
                  <span className="text-2xl font-bold">{currentCard.suit}</span>
                </div>
                <div className="text-center my-auto">
                  <span className="text-5xl font-black">{currentCard.suit}</span>
                </div>
                <div className="flex items-center justify-between rotate-180">
                  <span className="text-2xl font-black">{currentCard.label}</span>
                  <span className="text-2xl font-bold">{currentCard.suit}</span>
                </div>
              </div>
              <span className="text-[11px] font-extrabold uppercase text-[#878787] block text-center mt-2 tracking-wider">
                वर्तमान पत्ता
              </span>
            </div>

            {/* Next Card Deck Slot */}
            <div className="relative">
              <div className="w-32 h-48 rounded-md p-3 flex flex-col items-center justify-center shadow-sm border-2 border-dashed border-[#2874f0]/40 bg-white text-[#2874f0]">
                {nextCard ? (
                  <div className={`w-full h-full rounded-sm p-2 flex flex-col justify-between ${
                    nextCard.color === 'red'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-slate-50 text-[#212121]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black">{nextCard.label}</span>
                      <span className="text-xl font-bold">{nextCard.suit}</span>
                    </div>
                    <div className="text-center my-auto">
                      <span className="text-4xl font-black">{nextCard.suit}</span>
                    </div>
                    <div className="flex items-center justify-between rotate-180">
                      <span className="text-xl font-black">{nextCard.label}</span>
                      <span className="text-xl font-bold">{nextCard.suit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <div className="text-3xl">🎴</div>
                    <span className="text-xs font-bold text-[#212121]">अगला पत्ता</span>
                    <span className="text-[10px] text-[#2874f0] font-semibold block">
                      {isPlaying ? 'गैस करें!' : 'वेटिंग'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-extrabold uppercase text-[#878787] block text-center mt-2 tracking-wider">
                डेक
              </span>
            </div>
          </div>

          {/* Message notification */}
          <div className="mt-4 px-4 py-2 rounded-sm bg-white border border-slate-200 text-xs text-center text-[#212121] font-semibold max-w-md w-full shadow-2xs">
            {message}
          </div>
        </div>

        {/* Card History */}
        {history.length > 1 && (
          <div className="mt-3 flex items-center space-x-2 overflow-x-auto py-1">
            <span className="text-[11px] text-[#878787] font-bold shrink-0">इतिहास:</span>
            {history.map((c, i) => (
              <span 
                key={i} 
                className={`px-2 py-0.5 rounded-sm text-xs font-bold shrink-0 border ${
                  c.color === 'red' 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : 'bg-[#f9fafb] border-slate-300 text-[#212121]'
                }`}
              >
                {c.label}{c.suit}
              </span>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          {!isPlaying ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#212121] mb-1.5 block">एंट्री मोड चुनें (Free Earn या Coin Bet):</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[0, 20, 50, 100, 200].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBet(amt)}
                      className={`py-2 rounded-sm text-xs font-bold border transition cursor-pointer ${
                        bet === amt
                          ? amt === 0
                            ? 'bg-[#388e3c] text-white border-emerald-600 shadow-xs'
                            : 'bg-[#ffe500] text-[#212121] border-amber-400 shadow-xs'
                          : 'bg-[#f9fafb] hover:bg-slate-100 text-[#212121] border-slate-200'
                      }`}
                    >
                      {amt === 0 ? '🆓 Free' : `🪙 ${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              {bet > 0 && (user.coins || 0) < bet ? (
                <div className="space-y-2">
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-sm text-xs font-bold text-rose-700 text-center">
                    इस शर्त के लिए {bet} कॉइन्स चाहिए — या ऊपर "🆓 Free" चुनें!
                  </div>
                  {onOpenBuyCoins && (
                    <button
                      onClick={onOpenBuyCoins}
                      className="w-full py-3 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
                    >
                      <span>🪙 Buy Coins (कॉइन्स खरीदें)</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={startGame}
                  className={`w-full py-3.5 rounded-sm ${
                    bet === 0 ? 'bg-[#388e3c] hover:bg-emerald-700' : 'bg-[#fb641b] hover:bg-[#e8550f]'
                  } text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-sm transition transform active:scale-98 cursor-pointer`}
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>
                    {bet === 0
                      ? 'START FREE CARD DUEL (जीतें +10 से +20 कॉइन्स!)'
                      : `START OH MY CARD (शर्त: ${bet} कॉइन्स)`}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Hi-Lo Guess buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => makeGuess('higher')}
                  disabled={isFlipping}
                  className="py-3.5 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4 stroke-[3]" />
                  <span>HIGHER (बड़ा पत्ता)</span>
                </button>

                <button
                  onClick={() => makeGuess('lower')}
                  disabled={isFlipping}
                  className="py-3.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 shadow-sm transition transform active:scale-95 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 stroke-[3]" />
                  <span>LOWER (छोटा पत्ता)</span>
                </button>
              </div>

              {/* Color & Royal Guess */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => makeGuess('red')}
                  disabled={isFlipping}
                  className="py-2.5 rounded-sm bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition cursor-pointer"
                >
                  <span>♦♥ RED (लाल)</span>
                </button>
                <button
                  onClick={() => makeGuess('black')}
                  disabled={isFlipping}
                  className="py-2.5 rounded-sm bg-[#212121] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-xs transition cursor-pointer"
                >
                  <span>♠♣ BLACK (काला)</span>
                </button>
                <button
                  onClick={() => makeGuess('royal')}
                  disabled={isFlipping}
                  className="py-2.5 rounded-sm bg-[#ffe500] hover:bg-amber-400 text-[#212121] font-black text-xs flex items-center justify-center space-x-1 shadow-xs transition cursor-pointer"
                >
                  <span>👑 ROYAL (3.2x)</span>
                </button>
              </div>

              {/* Cashout Button */}
              {streak > 0 && (
                <button
                  onClick={handleCashout}
                  className="w-full py-3 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-sm transition transform active:scale-98 animate-pulse cursor-pointer"
                >
                  <Trophy className="w-5 h-5" />
                  <span>CASHOUT EARNINGS (+{potentialWinnings} कॉइन्स सुरक्षित लें)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rules / Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full shadow-2xl overflow-hidden text-[#212121]">
            <div className="bg-[#2874f0] px-5 py-3.5 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#ffe500]" />
                <h3 className="text-base font-black">Oh My Card - खेलने के नियम</h3>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="text-white/80 hover:text-white font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-[#212121] leading-relaxed max-h-[70vh] overflow-y-auto">
              <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-1">
                <p className="font-bold text-rose-600">1. कार्ड की रैंकिंग (Card Values):</p>
                <p>2 सबसे छोटा पत्ता है, फिर 3, 4, 5... 10, J(11), Q(12), K(13), और <strong>Ace (A=14)</strong> सबसे बड़ा पत्ता होता है।</p>
              </div>

              <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-1">
                <p className="font-bold text-[#388e3c]">2. अनुमान के विकल्प (Options):</p>
                <p>• <strong>HIGHER</strong>: अगला पत्ता वर्तमान पत्ते से बड़ा या बराबर होगा।</p>
                <p>• <strong>LOWER</strong>: अगला पत्ता वर्तमान पत्ते से छोटा या बराबर होगा।</p>
                <p>• <strong>RED / BLACK</strong>: अगला पत्ता लाल (पान/ईंट) या काला (हुकुम/चिड़ी) होगा (1.95x)।</p>
                <p>• <strong>ROYAL</strong>: अगला पत्ता राजा, रानी, गुलाम या इक्का (J, Q, K, A) होगा (3.2x)।</p>
              </div>

              <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-1">
                <p className="font-bold text-[#2874f0]">3. विन स्ट्रीक और कैशआउट:</p>
                <p>हर सही अनुमान पर आपका मल्टीप्लायर बढ़ता जाता है! आप कभी भी <strong>"CASHOUT"</strong> दबाकर जीते हुए कॉइन्स तुरंत अपने वॉलेट में सुरक्षित जमा कर सकते हैं। गलत अनुमान होने पर उस राउंड की बाजी समाप्त हो जाती है।</p>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full py-3 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                समझ गया, खेलना शुरू करें!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
