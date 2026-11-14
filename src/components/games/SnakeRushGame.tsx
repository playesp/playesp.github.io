import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Trophy,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { showToast } from '../../services/toast.ts';

interface SnakeRushGameProps {
  user: UserProfile;
  onCoinsUpdated?: (newCoins: number) => void;
  onGameComplete?: (result: 'win' | 'loss', coinsWon: number, bet: number) => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Point {
  x: number;
  y: number;
}

export const SnakeRushGame: React.FC<SnakeRushGameProps> = ({ user, onCoinsUpdated, onGameComplete }) => {
  const [bet, setBet] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(140);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Target score to achieve win
  const TARGET_WIN_SCORE = 80;

  // Snake grid: 20x20
  const GRID_SIZE = 20;
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [goldenCoin, setGoldenCoin] = useState<Point | null>({ x: 14, y: 8 });
  const directionRef = useRef<Direction>('UP');
  const nextDirectionRef = useRef<Direction>('UP');
  const gameLoopRef = useRef<any>(null);

  const generateFood = (currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  const startGame = async () => {
    if ((user.coins || 0) < bet) {
      showToast(`सिक्के कम हैं! खेल शुरू करने के लिए ${bet} कॉइन्स की आवश्यकता है।`, 'warning');
      return;
    }

    try {
      const uId = user.userId || (user as any).id;
      const res = await api.playCoinsGame(uId, 'snake', bet);
      if (onCoinsUpdated && res.currentCoins !== undefined) {
        onCoinsUpdated(res.currentCoins);
      }
    } catch (e) {
      console.warn('Game start notice', e);
    }

    const initSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initSnake);
    setFood(generateFood(initSnake));
    setGoldenCoin({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
    directionRef.current = 'UP';
    nextDirectionRef.current = 'UP';
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setIsPlaying(true);
  };

  const changeDirection = (newDir: Direction) => {
    const current = directionRef.current;
    if (newDir === 'UP' && current !== 'DOWN') nextDirectionRef.current = 'UP';
    if (newDir === 'DOWN' && current !== 'UP') nextDirectionRef.current = 'DOWN';
    if (newDir === 'LEFT' && current !== 'RIGHT') nextDirectionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && current !== 'LEFT') nextDirectionRef.current = 'RIGHT';
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        changeDirection('UP');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        changeDirection('DOWN');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        changeDirection('LEFT');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        changeDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Main game tick loop
  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        directionRef.current = nextDirectionRef.current;
        const head = { ...prevSnake[0] };

        if (directionRef.current === 'UP') head.y -= 1;
        if (directionRef.current === 'DOWN') head.y += 1;
        if (directionRef.current === 'LEFT') head.x -= 1;
        if (directionRef.current === 'RIGHT') head.x += 1;

        // Check Wall Collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          handleCrash();
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some((seg, idx) => idx > 0 && seg.x === head.x && seg.y === head.y)) {
          handleCrash();
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check Food Collision
        let ateFood = false;
        if (head.x === food.x && head.y === food.y) {
          setScore(s => {
            const nextScore = s + 10;
            if (nextScore >= TARGET_WIN_SCORE && !gameWon) {
              handleWin();
            }
            return nextScore;
          });
          setFood(generateFood(newSnake));
          ateFood = true;
        }

        // Check Golden Coin Collision
        if (goldenCoin && head.x === goldenCoin.x && head.y === goldenCoin.y) {
          setScore(s => {
            const nextScore = s + 25;
            if (nextScore >= TARGET_WIN_SCORE && !gameWon) {
              handleWin();
            }
            return nextScore;
          });
          setGoldenCoin(null);
          ateFood = true;
        }

        if (!ateFood) {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 120);

    return () => clearInterval(gameLoopRef.current);
  }, [isPlaying, food, goldenCoin, gameWon]);

  const handleCrash = () => {
    clearInterval(gameLoopRef.current);
    setIsPlaying(false);
    setGameOver(true);
    if (onGameComplete) onGameComplete('loss', 0, bet);
  };

  const handleWin = async () => {
    clearInterval(gameLoopRef.current);
    setIsPlaying(false);
    setGameWon(true);
    const winAmount = Math.round(bet * 2.5);
    confetti({ particleCount: 120, spread: 80 });

    try {
      const uId = user.userId || (user as any).id;
      const res = await api.claimGameWin(uId, 'snake', winAmount);
      if (onCoinsUpdated && res.currentCoins !== undefined) {
        onCoinsUpdated(res.currentCoins);
      }
    } catch (e) {
      console.warn('Game win notice', e);
    }

    if (onGameComplete) onGameComplete('win', winAmount, bet);
  };

  return (
    <div className="w-full flex flex-col items-center max-w-lg mx-auto bg-white rounded-md border border-slate-200 shadow-xl relative text-[#212121] overflow-hidden">
      {/* Game Header */}
      <div className="w-full bg-[#2874f0] px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🐍</span>
          <div>
            <h3 className="font-black text-sm text-white tracking-wide flex items-center space-x-1.5">
              <span>SNAKE RUSH (साँप का खेल)</span>
              <span className="text-[9px] bg-[#ffe500] text-[#212121] px-1.5 py-0.5 rounded-sm font-mono font-black">LIVE REAL</span>
            </h3>
            <p className="text-[10px] text-blue-100">
              लक्ष्य: {TARGET_WIN_SCORE} स्कोर बनाएं और 2.5x कॉइन्स जीतें!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="px-2.5 py-1.5 rounded-sm bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer transition"
          title="नियम एवं सहायता"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#ffe500]" />
          <span className="text-[10px]">मदद</span>
        </button>
      </div>

      <div className="w-full p-4 flex flex-col items-center">
        {/* Rules / Help Popup */}
        {showHelp && (
          <div className="w-full mb-3 p-3.5 bg-[#f5f8ff] rounded-sm border border-blue-200 text-xs text-[#212121] animate-fadeIn space-y-2">
            <div className="flex items-center justify-between font-black text-[#2874f0]">
              <span>📖 साँप खेल के नियम (How to Play):</span>
              <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-[#212121] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-[#212121] leading-relaxed">
              <li><strong>कंट्रोल:</strong> कीबोर्ड पर <strong>Arrow Keys</strong> (Up, Down, Left, Right) या नीचे दिए गए <strong>टच डी-पैड</strong> का इस्तेमाल करें।</li>
              <li><strong>भोजन:</strong> लाल सेब (🍎) खाने पर <strong>+10 अंक</strong> और गोल्डन कॉइन (🪙) पर <strong>+25 अंक</strong> मिलते हैं।</li>
              <li><strong>जीत (WIN):</strong> जैसे ही आपका स्कोर <strong>{TARGET_WIN_SCORE}</strong> पहुंचेगा, आप तुरंत <strong>2.5x कॉइन्स ({bet * 2.5} Coins)</strong> जीत जाएंगे!</li>
              <li><strong>हार (LOSS):</strong> दीवार या साँप के अपने शरीर से टकराने पर गेम ओवर हो जाएगा।</li>
            </ul>
          </div>
        )}

        {/* Live Game Scoreboard */}
        <div className="w-full grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="bg-[#f9fafb] p-2 rounded-sm border border-slate-200">
            <div className="text-[9px] text-[#878787] font-bold">Current Score</div>
            <div className="text-lg font-black text-[#388e3c] font-mono">{score} / {TARGET_WIN_SCORE}</div>
          </div>
          <div className="bg-[#f9fafb] p-2 rounded-sm border border-slate-200">
            <div className="text-[9px] text-[#878787] font-bold">Staked Coins</div>
            <div className="text-lg font-black text-amber-600 font-mono">🪙 {bet}</div>
          </div>
          <div className="bg-[#f9fafb] p-2 rounded-sm border border-slate-200">
            <div className="text-[9px] text-[#878787] font-bold">Win Prize</div>
            <div className="text-lg font-black text-[#2874f0] font-mono">🪙 {Math.round(bet * 2.5)}</div>
          </div>
        </div>

        {/* 2D Canvas Play Area */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-emerald-50 rounded-md border-2 border-[#388e3c] shadow-inner overflow-hidden flex items-center justify-center">
          {/* Render Grid Items */}
          <div className="w-full h-full grid grid-cols-20 grid-rows-20 relative">
            {/* Snake segments */}
            {snake.map((seg, idx) => (
              <div
                key={idx}
                className={`absolute rounded-sm transition-all duration-75 ${
                  idx === 0
                    ? 'bg-[#2874f0] z-10 shadow-sm border border-white'
                    : 'bg-[#388e3c] border border-emerald-200'
                }`}
                style={{
                  width: '5%',
                  height: '5%',
                  left: `${seg.x * 5}%`,
                  top: `${seg.y * 5}%`,
                }}
              />
            ))}

            {/* Regular Food 🍎 */}
            <div
              className="absolute flex items-center justify-center text-xs animate-pulse"
              style={{
                width: '5%',
                height: '5%',
                left: `${food.x * 5}%`,
                top: `${food.y * 5}%`,
              }}
            >
              🍎
            </div>

            {/* Golden Coin Bonus 🪙 */}
            {goldenCoin && (
              <div
                className="absolute flex items-center justify-center text-xs animate-bounce"
                style={{
                  width: '5%',
                  height: '5%',
                  left: `${goldenCoin.x * 5}%`,
                  top: `${goldenCoin.y * 5}%`,
                }}
              >
                🪙
              </div>
            )}
          </div>

          {/* Start / Game Over Screen Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 text-center z-20">
              {gameWon ? (
                <div className="animate-fadeIn">
                  <div className="text-5xl mb-2">🏆</div>
                  <h3 className="text-xl font-black text-[#388e3c]">शानदार जीत! (YOU WON)</h3>
                  <p className="text-xs text-[#212121] font-bold mt-1">
                    +{Math.round(bet * 2.5)} Coins आपके खाते में जोड़े गए!
                  </p>
                </div>
              ) : gameOver ? (
                <div className="animate-fadeIn">
                  <div className="text-5xl mb-2">💥</div>
                  <h3 className="text-xl font-black text-rose-600">गेम ओवर (COLLISION)</h3>
                  <p className="text-xs text-[#878787] mt-1">
                    दीवार या शरीर से टकरा गए (-{bet} Coins)
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-5xl mb-2">🐍</div>
                  <h3 className="text-lg font-black text-[#212121]">SNAKE RUSH BATTLE</h3>
                  <p className="text-xs text-[#878787] mt-1">
                    सेब खाएं, स्कोर बनाएं और 2.5x कॉइन्स जीतें!
                  </p>
                </div>
              )}

              {/* Bet Picker before playing */}
              <div className="flex items-center space-x-2 my-3">
                {[20, 50, 100, 200].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setBet(amt)}
                    className={`px-2.5 py-1 rounded-sm text-xs font-bold border transition cursor-pointer ${
                      bet === amt ? 'bg-[#ffe500] text-[#212121] border-amber-400 font-black' : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🪙 {amt}
                  </button>
                ))}
              </div>

              <button
                onClick={startGame}
                className="bg-[#fb641b] hover:bg-[#e8550f] px-6 py-2.5 rounded-sm font-black text-xs text-white flex items-center space-x-2 shadow-sm cursor-pointer transition"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{gameOver || gameWon ? 'PLAY AGAIN' : `START FOR ${bet} COINS`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Tactile Touch D-Pad for Mobile Players */}
        <div className="mt-4 flex flex-col items-center">
          <div className="text-[10px] text-[#878787] font-bold mb-1">TOUCH CONTROLS (मोबाइल डी-पैड):</div>
          <div className="grid grid-cols-3 gap-1.5 w-44">
            <div />
            <button
              onClick={() => changeDirection('UP')}
              className="bg-[#2874f0] hover:bg-[#1c62d6] p-3 rounded-sm flex items-center justify-center text-white shadow-xs active:scale-95 cursor-pointer"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />

            <button
              onClick={() => changeDirection('LEFT')}
              className="bg-[#2874f0] hover:bg-[#1c62d6] p-3 rounded-sm flex items-center justify-center text-white shadow-xs active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDirection('DOWN')}
              className="bg-[#2874f0] hover:bg-[#1c62d6] p-3 rounded-sm flex items-center justify-center text-white shadow-xs active:scale-95 cursor-pointer"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => changeDirection('RIGHT')}
              className="bg-[#2874f0] hover:bg-[#1c62d6] p-3 rounded-sm flex items-center justify-center text-white shadow-xs active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
