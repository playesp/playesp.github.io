import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, RotateCcw, Volume2, VolumeX, HelpCircle, 
  Sparkles, CheckCircle, AlertCircle, ArrowLeft, Play, FastForward, Award
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { UserProfile } from '../../types/index.ts';

interface BingoGameProps {
  user: UserProfile;
  onCoinsUpdated: (newCoins: number) => void;
  onClose?: () => void;
  onOpenBuyCoins?: () => void;
}

interface BingoCardCell {
  num: number | 'FREE';
  marked: boolean;
  isCenter?: boolean;
}

export const BingoGame: React.FC<BingoGameProps> = ({ user, onCoinsUpdated, onClose, onOpenBuyCoins }) => {
  const [bet, setBet] = useState<number>((user.coins || 0) >= 20 ? 20 : 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentCall, setCurrentCall] = useState<number | null>(null);
  const [bingoGrid, setBingoGrid] = useState<BingoCardCell[][]>([]);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [totalWon, setTotalWon] = useState<number>(0);
  const [message, setMessage] = useState<string>('अपनी शर्त चुनें और "Start Bingo Tambola" दबाएं!');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoCall, setAutoCall] = useState<boolean>(true);
  const [isCalling, setIsCalling] = useState<boolean>(false);

  const drawTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio tones using Web Audio API
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
      // AudioContext unavailable
    }
  };

  // Generate real 5x5 Bingo Card (B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75)
  const generateBingoCard = (): BingoCardCell[][] => {
    const getRandomUnique = (min: number, max: number, count: number): number[] => {
      const pool: number[] = [];
      for (let i = min; i <= max; i++) pool.push(i);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).sort((a, b) => a - b);
    };

    const b = getRandomUnique(1, 15, 5);
    const i = getRandomUnique(16, 30, 5);
    const n = getRandomUnique(31, 45, 5);
    const g = getRandomUnique(46, 60, 5);
    const o = getRandomUnique(61, 75, 5);

    const grid: BingoCardCell[][] = [];
    for (let r = 0; r < 5; r++) {
      const row: BingoCardCell[] = [];
      row.push({ num: b[r], marked: false });
      row.push({ num: i[r], marked: false });
      if (r === 2) {
        // Free space
        row.push({ num: 'FREE', marked: true, isCenter: true });
      } else {
        row.push({ num: n[r], marked: false });
      }
      row.push({ num: g[r], marked: false });
      row.push({ num: o[r], marked: false });
      grid.push(row);
    }
    return grid;
  };

  useEffect(() => {
    // Generate initial preview card
    setBingoGrid(generateBingoCard());
    return () => {
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    };
  }, []);

  // Auto draw numbers when playing
  useEffect(() => {
    if (!isPlaying || gameOver || !autoCall) {
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
      return;
    }

    drawTimerRef.current = setInterval(() => {
      drawNextBall();
    }, 2800);

    return () => {
      if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    };
  }, [isPlaying, gameOver, autoCall, calledNumbers]);

  const startGame = async () => {
    if (bet > 0 && (user.coins || 0) < bet) {
      setMessage(`पर्याप्त कॉइन्स नहीं हैं! इस शर्त के लिए ${bet} कॉइन्स चाहिए या "🆓 Free" चुनें।`);
      return;
    }

    if (bet > 0) {
      try {
        const uId = user.userId || (user as any).id;
        const res = await api.playCoinsGame(uId, 'bingo', bet);
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

    const newGrid = generateBingoCard();
    setBingoGrid(newGrid);
    setCalledNumbers([]);
    setCurrentCall(null);
    setCompletedLines([]);
    setTotalWon(0);
    setGameOver(false);
    setIsPlaying(true);
    setMessage('🔢 गेम शुरू हो गया! नंबर कॉल हो रहे हैं, अपने कार्ड पर मैचिंग नंबर टैप करें!');
    playSound(440, 'triangle', 0.2);

    // Immediately draw first number
    setTimeout(() => {
      drawNextBall([]);
    }, 600);
  };

  const drawNextBall = (currentList?: number[]) => {
    const list = currentList ?? calledNumbers;
    if (list.length >= 75) {
      endGame(false, 'सभी 75 नंबर कॉल हो चुके हैं!');
      return;
    }

    // Pick a number 1..75 not in list
    const uncalled: number[] = [];
    for (let i = 1; i <= 75; i++) {
      if (!list.includes(i)) uncalled.push(i);
    }
    const nextNum = uncalled[Math.floor(Math.random() * uncalled.length)];
    
    setIsCalling(true);
    playSound(520, 'sine', 0.12);
    setTimeout(() => {
      setCurrentCall(nextNum);
      setCalledNumbers(prev => [...prev, nextNum]);
      setIsCalling(false);
    }, 300);
  };

  const markCell = (r: number, c: number) => {
    if (!isPlaying || gameOver) return;
    const cell = bingoGrid[r][c];
    if (cell.num === 'FREE') return;

    if (!calledNumbers.includes(cell.num as number)) {
      playSound(200, 'sawtooth', 0.15);
      setMessage(`❌ नंबर ${cell.num} अभी तक कॉल नहीं हुआ है! केवल पुकारे गए नंबर मार्क करें।`);
      return;
    }

    if (cell.marked) return;

    // Mark it
    const newGrid = bingoGrid.map((row, ri) =>
      row.map((col, ci) => {
        if (ri === r && ci === c) {
          return { ...col, marked: true };
        }
        return col;
      })
    );

    setBingoGrid(newGrid);
    playSound(660, 'sine', 0.15);
    checkBingoPatterns(newGrid);
  };

  const checkBingoPatterns = (grid: BingoCardCell[][]) => {
    const newCompleted: string[] = [];

    // Check Rows (5)
    for (let r = 0; r < 5; r++) {
      if (grid[r].every(c => c.marked)) {
        newCompleted.push(`Row ${r + 1}`);
      }
    }

    // Check Columns (5)
    for (let c = 0; c < 5; c++) {
      let colMarked = true;
      for (let r = 0; r < 5; r++) {
        if (!grid[r][c].marked) {
          colMarked = false;
          break;
        }
      }
      if (colMarked) newCompleted.push(`Col ${c + 1}`);
    }

    // Check Diagonals (2)
    let d1 = true;
    let d2 = true;
    for (let i = 0; i < 5; i++) {
      if (!grid[i][i].marked) d1 = false;
      if (!grid[i][4 - i].marked) d2 = false;
    }
    if (d1) newCompleted.push('Diag TopLeft-BottomRight');
    if (d2) newCompleted.push('Diag TopRight-BottomLeft');

    // Check 4 Corners
    if (grid[0][0].marked && grid[0][4].marked && grid[4][0].marked && grid[4][4].marked) {
      newCompleted.push('4 Corners');
    }

    // Check Full House
    const isFullHouse = grid.every(row => row.every(cell => cell.marked));
    if (isFullHouse) {
      newCompleted.push('Full House');
    }

    // Check newly earned lines
    const newlyEarned = newCompleted.filter(line => !completedLines.includes(line));

    if (newlyEarned.length > 0) {
      setCompletedLines(newCompleted);
      playSound(880, 'triangle', 0.3);

      // Reward based on lines
      let wonAmount = 0;
      if (bet === 0) {
        wonAmount = newlyEarned.includes('Full House') ? 14 : 10;
      } else if (newlyEarned.includes('Full House')) {
        wonAmount += Math.floor(bet * 5); // 5x Full house!
      } else {
        wonAmount += Math.floor(bet * 1.5 * newlyEarned.length);
      }

      setTotalWon(prev => prev + wonAmount);
      setMessage(`🎉 शाबाश! आपने ${newlyEarned.join(', ')} पूरा किया! +${wonAmount} कॉइन्स मिले!`);

      // Credit winnings
      creditWin(wonAmount);

      if (isFullHouse) {
        endGame(true, '🏆 अविश्वसनीय! FULL HOUSE BINGO! आप बंपर विनर बन गए!');
      }
    }
  };

  const creditWin = async (amount: number) => {
    try {
      const uId = user.userId || (user as any).id;
      if (bet === 0) {
        const res = await api.playFreeSkillMatch(uId, 'bingo', 'win', amount);
        if (res.success && res.currentCoins !== undefined) {
          onCoinsUpdated(res.currentCoins);
          setMessage(res.message || `🎉 Bingo जीत! +${res.coinsEarned} कॉइन्स मिले!`);
        }
      } else {
        const res = await api.claimGameWin(uId, 'bingo', amount);
        if (res.success) {
          onCoinsUpdated(res.currentCoins);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const endGame = (won: boolean, msg: string) => {
    setIsPlaying(false);
    setGameOver(true);
    if (drawTimerRef.current) clearInterval(drawTimerRef.current);
    setMessage(msg);
    const uId = user.userId || (user as any).id;
    if (uId) {
      api.recordTaskAction(uId, 'game_played', 1).catch(() => {});
    }
  };

  const claimEarlyCashout = () => {
    endGame(totalWon > 0, `गेम समाप्त! आपने कुल +${totalWon} कॉइन्स हासिल किए!`);
  };

  const getBallColumn = (num: number): string => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  };

  const getColumnColor = (col: string): string => {
    switch (col) {
      case 'B': return 'from-red-500 to-rose-600 text-white';
      case 'I': return 'from-amber-500 to-yellow-600 text-white';
      case 'N': return 'from-emerald-500 to-teal-600 text-white';
      case 'G': return 'from-blue-500 to-cyan-600 text-white';
      case 'O': return 'from-purple-500 to-fuchsia-600 text-white';
      default: return 'from-gray-500 to-slate-600 text-white';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-xl text-[#212121] max-w-2xl mx-auto overflow-hidden">
      {/* Top Header */}
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
                BINGO TAMBOLA LIVE
              </span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-black bg-[#ffe500] text-[#212121]">
                REAL GAME
              </span>
            </div>
            <p className="text-[11px] text-blue-100">ऑनलाइन तंबोला लकी कार्ड गेम - लाइन मैच करें और कॉइन जीतें!</p>
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
            <span>नियम (Help)</span>
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
            <span className="text-[10px] uppercase font-bold text-[#878787] block">कॉल हुए नंबर</span>
            <span className="text-base font-extrabold text-[#2874f0]">{calledNumbers.length} / 75</span>
          </div>
          <div className="bg-[#f9fafb] rounded-sm p-2.5 text-center border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-[#878787] block">कुल जीत</span>
            <span className="text-base font-extrabold text-[#388e3c]">+{totalWon} 🪙</span>
          </div>
        </div>

        {/* Ball Caller Showcase */}
        <div className="bg-[#f5f8ff] rounded-sm p-3 mb-4 border border-blue-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {currentCall ? (
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getColumnColor(getBallColumn(currentCall))} shadow-md flex flex-col items-center justify-center font-black animate-bounce`}>
                  <span className="text-[10px] tracking-wider opacity-90">{getBallColumn(currentCall)}</span>
                  <span className="text-xl leading-none">{currentCall}</span>
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-[#878787] font-bold text-sm">
                  WAIT
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-[#2874f0]">
                {isPlaying ? (isCalling ? '🎰 बॉल घूम रही है...' : `वर्तमान पुकारा गया नंबर: ${currentCall ? `${getBallColumn(currentCall)}-${currentCall}` : '-'}`) : 'गेम स्टैंडबाय पर है'}
              </div>
              <div className="text-[11px] text-[#878787] mt-0.5">
                हाल के नंबर:{' '}
                {calledNumbers.slice(-5).reverse().map((n, i) => (
                  <span key={i} className="inline-block px-1.5 py-0.5 rounded-sm bg-white text-[#212121] font-bold text-[10px] mx-0.5 border border-slate-300">
                    {getBallColumn(n)}-{n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {isPlaying && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => drawNextBall()}
                disabled={isCalling}
                className="px-3 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1 shadow-xs transition cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>नेक्स्ट बॉल</span>
              </button>
            </div>
          )}
        </div>

        {/* Status banner */}
        <div className="bg-amber-50 rounded-sm px-3 py-2 text-xs text-center text-amber-900 font-semibold mb-3 border border-amber-200">
          {message}
        </div>

        {/* 5x5 Bingo Card */}
        <div className="bg-[#f1f3f6] p-3 rounded-sm border border-slate-200">
          {/* Card Header Letters: B I N G O */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-2 text-center font-black text-sm sm:text-base">
            <div className="py-1 rounded-sm bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs">B</div>
            <div className="py-1 rounded-sm bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs">I</div>
            <div className="py-1 rounded-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">N</div>
            <div className="py-1 rounded-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xs">G</div>
            <div className="py-1 rounded-sm bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs">O</div>
          </div>

          {/* 5x5 Matrix */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {bingoGrid.map((row, r) =>
              row.map((cell, c) => {
                const isCalled = cell.num !== 'FREE' && calledNumbers.includes(cell.num as number);
                const isMarked = cell.marked;

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => markCell(r, c)}
                    disabled={!isPlaying || gameOver || cell.isCenter}
                    className={`h-12 sm:h-14 rounded-sm flex flex-col items-center justify-center font-black transition transform active:scale-95 border cursor-pointer ${
                      cell.isCenter
                        ? 'bg-[#fb641b] text-white border-orange-600 shadow-sm animate-pulse'
                        : isMarked
                        ? 'bg-[#388e3c] text-white border-emerald-700 shadow-sm'
                        : isCalled
                        ? 'bg-[#ffe500] text-[#212121] border-amber-500 animate-pulse'
                        : 'bg-white hover:bg-[#f5f8ff] text-[#212121] border-slate-200'
                    }`}
                  >
                    {cell.num === 'FREE' ? (
                      <>
                        <Sparkles className="w-4 h-4 mb-0.5 text-yellow-200" />
                        <span className="text-[10px] tracking-widest font-black">FREE</span>
                      </>
                    ) : (
                      <>
                        <span className="text-base sm:text-lg">{cell.num}</span>
                        {isMarked && (
                          <CheckCircle className="w-3 h-3 text-emerald-100 -mt-0.5" />
                        )}
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Completed Patterns tags */}
        {completedLines.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#878787]">कम्प्लीटेड पैटर्न्स:</span>
            {completedLines.map((line, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-sm text-[11px] font-bold bg-emerald-50 text-[#388e3c] border border-emerald-200 flex items-center space-x-1">
                <Award className="w-3 h-3" />
                <span>{line}</span>
              </span>
            ))}
          </div>
        )}

        {/* Game Controls */}
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
                  {onOpenBuyCoins ? (
                    <button
                      onClick={onOpenBuyCoins}
                      className="w-full py-3 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white font-black text-sm flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
                    >
                      <span>🪙 Buy Coins (कॉइन्स खरीदें)</span>
                    </button>
                  ) : null}
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
                      ? 'START FREE BINGO (जीतें +10 से +20 कॉइन्स!)'
                      : `START BINGO TAMBOLA (शर्त: ${bet} कॉइन्स)`}
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoCall(!autoCall)}
                className={`flex-1 py-3 rounded-sm font-bold text-xs sm:text-sm border transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  autoCall
                    ? 'bg-[#2874f0] text-white border-[#2874f0]'
                    : 'bg-[#f9fafb] text-[#212121] border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{autoCall ? '⏸️ ऑटो कॉल रोकें' : '▶️ ऑटो कॉल चालू करें'}</span>
              </button>

              <button
                onClick={claimEarlyCashout}
                className="px-4 py-3 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
              >
                <Trophy className="w-4 h-4" />
                <span>कैशआउट ({totalWon} कॉइन्स)</span>
              </button>
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
                <h3 className="text-base font-black">Bingo Tambola - खेलने का तरीका</h3>
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
                <p className="font-bold text-[#2874f0]">1. कार्ड का फॉर्मेट (Card Columns):</p>
                <p>• <strong>B</strong>: 1 से 15 तक संख्याएं</p>
                <p>• <strong>I</strong>: 16 से 30 तक संख्याएं</p>
                <p>• <strong>N</strong>: 31 से 45 (बीच वाला FREE स्लॉट हमेशा मार्क रहता है)</p>
                <p>• <strong>G</strong>: 46 से 60 तक संख्याएं</p>
                <p>• <strong>O</strong>: 61 से 75 तक संख्याएं</p>
              </div>

              <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-1">
                <p className="font-bold text-[#388e3c]">2. नंबर डैब (Marking):</p>
                <p>जब भी बॉल मशीन से कोई नंबर कॉल होता है, अपने 5x5 कार्ड में उस नंबर को खोजकर टैप करें। सही नंबर तुरंत ग्रीन मार्क हो जाएगा।</p>
              </div>

              <div className="p-3 rounded-sm bg-[#f9fafb] border border-slate-200 space-y-1">
                <p className="font-bold text-[#2874f0]">3. जीतने के नियम और पेआउट (Payout Table):</p>
                <p>• <strong>कोई भी पंक्ति (Row)</strong>: 1.5x शर्त कॉइन्स</p>
                <p>• <strong>कोई भी कॉलम (Col)</strong>: 1.5x शर्त कॉइन्स</p>
                <p>• <strong>दोनों विकर्ण (Diagonals)</strong>: 1.5x शर्त कॉइन्स</p>
                <p>• <strong>चार कोने (4 Corners)</strong>: 1.5x शर्त कॉइन्स</p>
                <p>• <strong>🏆 फुल हाउस (Full House - सभी 24 नंबर)</strong>: 5x बंपर कॉइन्स!</p>
              </div>

              <div className="p-3 rounded-sm bg-amber-50 border border-amber-200 text-amber-900">
                💡 <strong>टिप:</strong> आप गेम के बीच में कभी भी "कैशआउट" दबाकर अब तक जीते हुए कॉइन्स सुरक्षित अपने वॉलेट में ला सकते हैं!
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
