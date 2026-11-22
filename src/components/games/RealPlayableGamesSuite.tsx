import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Dices,
  RotateCcw,
  Play,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export interface PlayableEngineProps {
  mode: 'free' | 'pro';
  betCoins: number;
  winCoins: number;
  userName: string;
  onStartMatch: () => Promise<boolean>; // Deduct wager if Pro, verify match ready
  onFinishMatch: (outcome: 'win' | 'loss', score: number, summaryText: string) => void;
  disabled?: boolean;
}

/* ============================================================================
   1. LIAR'S PARTY — Real 4-Player Bluff Card & "CALL LIAR!" Table Game
   ============================================================================ */
type CardRank = 'A' | 'K' | 'Q' | 'JOKER';
interface BluffCard {
  id: string;
  rank: CardRank;
}
const TARGET_RANKS: Array<Exclude<CardRank, 'JOKER'>> = ['A', 'K', 'Q'];

function buildDeckHand(count = 5): BluffCard[] {
  const pool: CardRank[] = ['A', 'A', 'K', 'K', 'Q', 'Q', 'JOKER'];
  return Array.from({ length: count }, (_, idx) => ({
    id: `c-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
    rank: pool[Math.floor(Math.random() * pool.length)],
  }));
}

export const LiarsPartyEngine: React.FC<PlayableEngineProps> = ({
  mode,
  winCoins,
  userName,
  onStartMatch,
  onFinishMatch,
}) => {
  const [started, setStarted] = useState(false);
  const [targetRank, setTargetRank] = useState<Exclude<CardRank, 'JOKER'>>('A');
  const [myHand, setMyHand] = useState<BluffCard[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [myHearts, setMyHearts] = useState(3);
  const [rivalHearts, setRivalHearts] = useState(3);
  const [rivalCardsCount, setRivalCardsCount] = useState(5);
  const [lastPlay, setLastPlay] = useState<{
    player: 'you' | 'rival';
    claimedCount: number;
    actualCards: BluffCard[];
  } | null>(null);
  const [turn, setTurn] = useState<'you' | 'rival'>('you');
  const [log, setLog] = useState<string>('राउंड शुरू करें — Target Rank के पत्ते चलें या Bluff करें!');
  const [matchEnded, setMatchEnded] = useState(false);

  const startTable = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    const rank = TARGET_RANKS[Math.floor(Math.random() * TARGET_RANKS.length)];
    setTargetRank(rank);
    setMyHand(buildDeckHand(5));
    setSelectedIds([]);
    setMyHearts(3);
    setRivalHearts(3);
    setRivalCardsCount(5);
    setLastPlay(null);
    setTurn('you');
    setMatchEnded(false);
    setStarted(true);
    setLog(`🎯 इस टेबल का असली रैंक है "${rank}"! सही पत्ते या चालाक Bluff चलें!`);
  };

  const endGame = (didWin: boolean, summary: string) => {
    setMatchEnded(true);
    setLog(summary);
    onFinishMatch(didWin ? 'win' : 'loss', didWin ? 100 : 30, summary);
  };

  const toggleSelect = (id: string) => {
    if (turn !== 'you' || matchEnded) return;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handlePlayCards = () => {
    if (turn !== 'you' || selectedIds.length === 0 || matchEnded) return;
    const played = myHand.filter((c) => selectedIds.includes(c.id));
    const remaining = myHand.filter((c) => !selectedIds.includes(c.id));
    setMyHand(remaining);
    setSelectedIds([]);

    if (remaining.length === 0) {
      endGame(true, `🎉 आपने अपने सभी पत्ते खत्म किए और Liar's Party जीत लिया! (+${mode === 'pro' ? winCoins : 'Free'} Coins)`);
      return;
    }

    const playObj = { player: 'you' as const, claimedCount: played.length, actualCards: played };
    setLastPlay(playObj);
    setTurn('rival');
    setLog(`आपने ${played.length}x "${targetRank}" टेबल पर रखे... राइवल सोच रहा है!`);

    setTimeout(() => {
      // Rival decides either to Call Liar (30% chance or 55% if you played 3 cards) or Play cards
      const callChance = played.length >= 3 ? 0.55 : 0.28;
      if (Math.random() < callChance) {
        const isTruth = played.every((c) => c.rank === targetRank || c.rank === 'JOKER');
        if (!isTruth) {
          const nextHearts = myHearts - 1;
          setMyHearts(nextHearts);
          const msg = `💥 राइवल ने आपको BLUFF करते पकड़ लिया! (-1 ❤️)`;
          if (nextHearts <= 0) {
            endGame(false, `${msg} आपके दिल खत्म हो गए!`);
            return;
          }
          setMyHand((h) => [...h, ...buildDeckHand(2)]);
          setTargetRank(TARGET_RANKS[Math.floor(Math.random() * TARGET_RANKS.length)]);
          setLastPlay(null);
          setTurn('you');
          setLog(msg + ' नया राउंड शुरू!');
        } else {
          const nextRivalH = rivalHearts - 1;
          setRivalHearts(nextRivalH);
          const msg = `✅ राइवल ने गलत "LIAR!" बोला — आपके पत्ते असली थे! राइवल को -1 ❤️`;
          if (nextRivalH <= 0) {
            endGame(true, `🏆 ${msg} आपने टेबल जीत ली!`);
            return;
          }
          setTargetRank(TARGET_RANKS[Math.floor(Math.random() * TARGET_RANKS.length)]);
          setLastPlay(null);
          setTurn('you');
          setLog(msg + ' आपकी बारी!');
        }
        return;
      }

      // Rival plays 1 or 2 cards (sometimes bluffing!)
      const count = Math.min(rivalCardsCount, Math.random() < 0.7 ? 1 : 2);
      const isRivalBluff = Math.random() < 0.45;
      const rivalCards: BluffCard[] = Array.from({ length: count }, (_, idx) => ({
        id: `rc-${Date.now()}-${idx}`,
        rank: isRivalBluff
          ? TARGET_RANKS.find((r) => r !== targetRank) || 'Q'
          : Math.random() < 0.25
          ? 'JOKER'
          : targetRank,
      }));
      const nextRivalCards = Math.max(0, rivalCardsCount - count);
      setRivalCardsCount(nextRivalCards);
      setLastPlay({ player: 'rival', claimedCount: count, actualCards: rivalCards });
      if (nextRivalCards === 0 && !isRivalBluff) {
        endGame(false, `राइवल ने बिना पकड़े सभी पत्ते खत्म कर दिए! अगली बार "CALL LIAR!" दबाएं!`);
        return;
      }
      setTurn('you');
      setLog(`राइवल ने ${count}x "${targetRank}" फेंके! सच मानकर पत्ते चलें या "CALL LIAR!" दबाएं!`);
    }, 850);
  };

  const handleCallLiar = () => {
    if (!lastPlay || lastPlay.player !== 'rival' || turn !== 'you' || matchEnded) return;
    const isTruth = lastPlay.actualCards.every((c) => c.rank === targetRank || c.rank === 'JOKER');
    const revealedStr = lastPlay.actualCards.map((c) => c.rank).join(', ');
    if (!isTruth) {
      const nextRivalH = rivalHearts - 1;
      setRivalHearts(nextRivalH);
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.65 } });
      if (nextRivalH <= 0) {
        endGame(true, `🎉 पकड़ा गया! उसके पत्ते [${revealedStr}] थे (झूठा Bluff)! आपने Liar's Party जीत लिया!`);
        return;
      }
      setRivalCardsCount((c) => c + 2);
      setTargetRank(TARGET_RANKS[Math.floor(Math.random() * TARGET_RANKS.length)]);
      setLastPlay(null);
      setLog(`🔥 सही कॉल! राइवल के पत्ते [${revealedStr}] थे — उसे -1 ❤️ लगा!`);
    } else {
      const nextH = myHearts - 1;
      setMyHearts(nextH);
      if (nextH <= 0) {
        endGame(false, `❌ ओह! राइवल के पत्ते [${revealedStr}] सच थे — आपके ❤️ खत्म!`);
        return;
      }
      setMyHand((h) => [...h, ...buildDeckHand(1)]);
      setTargetRank(TARGET_RANKS[Math.floor(Math.random() * TARGET_RANKS.length)]);
      setLastPlay(null);
      setLog(`😬 राइवल के पत्ते [${revealedStr}] सच निकले! आपको -1 ❤️ लगा।`);
    }
  };

  if (!started) {
    return (
      <div className="space-y-3 text-center">
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#6e2215] to-[#3f120b] text-white space-y-1.5">
          <div className="text-3xl">🎭🃏</div>
          <h4 className="text-sm font-black">Liar&apos;s Party — Real Bluff Card Table</h4>
          <p className="text-[11px] text-amber-100">
            Target Rank के पत्ते चलें या चालाकी से Bluff करें — राइवल झूठ बोले तो &quot;CALL LIAR!&quot; दबाकर उसे आउट करें!
          </p>
        </div>
        <button
          type="button"
          onClick={startTable}
          className="w-full py-3 rounded-xl bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-sm cursor-pointer shadow"
        >
          ▶ Start Liar&apos;s Party ({mode === 'pro' ? 'Pro Match' : 'Free Skill Match'})
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 text-left">
      <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl px-3.5 py-2.5 text-xs">
        <div>
          <span className="text-slate-400">राइवल ❤️:</span>{' '}
          <span className="text-rose-400 font-black">{'❤️'.repeat(Math.max(0, rivalHearts))}</span>
          <span className="text-[10px] text-slate-300 ml-2">({rivalCardsCount} पत्ते)</span>
        </div>
        <div className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-black">
          TARGET: {targetRank}
        </div>
        <div>
          <span className="text-slate-400">{userName.split(' ')[0]}:</span>{' '}
          <span className="text-emerald-400 font-black">{'❤️'.repeat(Math.max(0, myHearts))}</span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 text-center">
        {log}
      </div>

      {lastPlay && lastPlay.player === 'rival' && !matchEnded && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-rose-900">
            राइवल दावा: {lastPlay.claimedCount}x &quot;{targetRank}&quot;
          </span>
          <button
            type="button"
            onClick={handleCallLiar}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow"
          >
            🚨 CALL LIAR!
          </button>
        </div>
      )}

      <div>
        <div className="text-[11px] font-bold text-slate-500 mb-1.5">
          आपके पत्ते ({myHand.length}) — 1 से 3 पत्ते चुनकर चलें (JOKER हर रैंक में असली है):
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {myHand.map((card) => {
            const picked = selectedIds.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                disabled={turn !== 'you' || matchEnded}
                onClick={() => toggleSelect(card.id)}
                className={`w-14 h-20 rounded-xl border-2 font-black text-base flex flex-col items-center justify-center transition cursor-pointer ${
                  picked
                    ? '-translate-y-2 border-[#fb641b] bg-orange-50 text-[#fb641b] shadow-md'
                    : card.rank === 'JOKER'
                    ? 'border-purple-400 bg-purple-50 text-purple-800'
                    : card.rank === targetRank
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                    : 'border-slate-300 bg-white text-slate-800'
                }`}
              >
                <span>{card.rank === 'JOKER' ? '🃏' : card.rank}</span>
                <span className="text-[9px] font-bold opacity-75">
                  {card.rank === targetRank || card.rank === 'JOKER' ? 'VALID' : 'BLUFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!matchEnded ? (
        <button
          type="button"
          disabled={turn !== 'you' || selectedIds.length === 0}
          onClick={handlePlayCards}
          className="w-full py-2.5 rounded-xl bg-[#2874f0] hover:bg-[#1c62d6] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-xs cursor-pointer"
        >
          {turn !== 'you'
            ? 'राइवल की चाल चल रही है...'
            : `🃏 Play ${selectedIds.length || 0} Card(s) as "${targetRank}"`}
        </button>
      ) : (
        <button
          type="button"
          onClick={startTable}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" /> फिर से खेलें
        </button>
      )}
    </div>
  );
};

/* ============================================================================
   2. CRAZY ALPACA — Real 60 FPS Canvas Lane-Dodge & Coin Catcher
   ============================================================================ */
export const CrazyAlpacaEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [ended, setEnded] = useState(false);

  const laneRef = useRef(1); // 0, 1, 2
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const runningRef = useRef(false);

  const TARGET_SCORE = 120;

  const startGame = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    laneRef.current = 1;
    scoreRef.current = 0;
    livesRef.current = 3;
    runningRef.current = true;
    setScore(0);
    setLives(3);
    setEnded(false);
    setRunning(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') laneRef.current = Math.max(0, laneRef.current - 1);
      if (e.key === 'ArrowRight' || e.key === 'd') laneRef.current = Math.min(2, laneRef.current + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!running || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lanesX = [55, 150, 245];
    let items: Array<{ lane: number; y: number; type: 'coin' | 'apple' | 'rock' }> = [];
    let frame = 0;
    let rafId = 0;

    const tick = () => {
      if (!runningRef.current) return;
      frame++;
      if (frame % 26 === 0) {
        const lane = Math.floor(Math.random() * 3);
        const r = Math.random();
        const type = r < 0.42 ? 'coin' : r < 0.65 ? 'apple' : 'rock';
        items.push({ lane, y: -20, type });
      }

      const speed = 3.2 + Math.min(3.5, scoreRef.current / 45);
      items.forEach((it) => {
        it.y += speed;
      });

      const playerY = 235;
      const nextItems: typeof items = [];
      for (const it of items) {
        if (it.y > 290) continue;
        if (Math.abs(it.y - playerY) < 24 && it.lane === laneRef.current) {
          if (it.type === 'coin' || it.type === 'apple') {
            scoreRef.current += it.type === 'coin' ? 15 : 10;
            setScore(scoreRef.current);
            if (scoreRef.current >= TARGET_SCORE) {
              runningRef.current = false;
              setRunning(false);
              setEnded(true);
              onFinishMatch('win', scoreRef.current, `🦙 शानदार! Crazy Alpaca ने ${scoreRef.current} स्कोर बनाकर जीत हासिल की!`);
              return;
            }
          } else {
            livesRef.current -= 1;
            setLives(livesRef.current);
            if (livesRef.current <= 0) {
              runningRef.current = false;
              setRunning(false);
              setEnded(true);
              onFinishMatch('loss', scoreRef.current, `💥 चट्टान से टकरा गए! स्कोर: ${scoreRef.current}/${TARGET_SCORE}`);
              return;
            }
          }
          continue;
        }
        nextItems.push(it);
      }
      items = nextItems;

      // Render Canvas
      ctx.fillStyle = '#ecfccb';
      ctx.fillRect(0, 0, 300, 280);
      ctx.strokeStyle = '#bef264';
      ctx.lineWidth = 2;
      [100, 200].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 280);
        ctx.stroke();
      });

      ctx.font = '26px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const it of items) {
        const icon = it.type === 'coin' ? '🪙' : it.type === 'apple' ? '🍎' : '🪨';
        ctx.fillText(icon, lanesX[it.lane], it.y);
      }

      // Draw Alpaca
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(lanesX[laneRef.current], playerY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '28px sans-serif';
      ctx.fillText('🦙', lanesX[laneRef.current], playerY);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [running, onFinishMatch]);

  return (
    <div className="w-full flex flex-col items-center space-y-2.5">
      <div className="w-full max-w-[300px] flex items-center justify-between text-xs font-black bg-lime-100 text-lime-950 px-3 py-1.5 rounded-lg border border-lime-300">
        <span>🎯 {score}/{TARGET_SCORE}</span>
        <span>{'❤️'.repeat(Math.max(0, lives))}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={300}
        height={280}
        className="rounded-xl border-2 border-lime-500 shadow-inner bg-[#ecfccb]"
      />

      {running ? (
        <div className="flex items-center gap-3 w-full max-w-[300px]">
          <button
            type="button"
            onClick={() => (laneRef.current = Math.max(0, laneRef.current - 1))}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" /> Left
          </button>
          <button
            type="button"
            onClick={() => (laneRef.current = Math.min(2, laneRef.current + 1))}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            Right <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startGame}
          className="w-full max-w-[300px] py-3 rounded-xl bg-[#65a30d] hover:bg-[#4d7c0f] text-white font-black text-sm cursor-pointer shadow flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>{ended ? 'फिर से दौड़ें (Play Again)' : '🦙 Start Crazy Alpaca Run'}</span>
        </button>
      )}
    </div>
  );
};

/* ============================================================================
   3. POOL 8-BALL — Real HTML5 Canvas 2D Physics Billiards Table
   ============================================================================ */
interface BallObj {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  potted: boolean;
}

export const PoolPhysicsEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [started, setStarted] = useState(false);
  const [shotsLeft, setShotsLeft] = useState(7);
  const [pottedCount, setPottedCount] = useState(0);
  const [aimAngle, setAimAngle] = useState(0);
  const [power, setPower] = useState(75);
  const [ballsMoving, setBallsMoving] = useState(false);

  const ballsRef = useRef<BallObj[]>([]);
  const movingRef = useRef(false);
  const shotsRef = useRef(7);
  const pottedRef = useRef(0);

  const initBalls = (): BallObj[] => [
    { id: 0, x: 75, y: 110, vx: 0, vy: 0, color: '#ffffff', potted: false },
    { id: 1, x: 210, y: 110, vx: 0, vy: 0, color: '#facc15', potted: false },
    { id: 2, x: 230, y: 97, vx: 0, vy: 0, color: '#2563eb', potted: false },
    { id: 3, x: 230, y: 123, vx: 0, vy: 0, color: '#ef4444', potted: false },
    { id: 8, x: 250, y: 110, vx: 0, vy: 0, color: '#111827', potted: false },
  ];

  const startTable = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    ballsRef.current = initBalls();
    shotsRef.current = 7;
    pottedRef.current = 0;
    movingRef.current = false;
    setShotsLeft(7);
    setPottedCount(0);
    setAimAngle(0);
    setBallsMoving(false);
    setStarted(true);
  };

  const pockets = [
    { x: 14, y: 14 },
    { x: 160, y: 10 },
    { x: 306, y: 14 },
    { x: 14, y: 206 },
    { x: 160, y: 210 },
    { x: 306, y: 206 },
  ];

  const drawTable = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Felt & wood rails
    ctx.fillStyle = '#5c2d16';
    ctx.fillRect(0, 0, 320, 220);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(12, 12, 296, 196);

    // Pockets
    ctx.fillStyle = '#09090b';
    pockets.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fill();
    });

    const balls = ballsRef.current;
    const cue = balls[0];

    // Aim guide line when stationary
    if (cue && !cue.potted && !movingRef.current && started) {
      const rad = (aimAngle * Math.PI) / 180;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cue.x, cue.y);
      ctx.lineTo(cue.x + Math.cos(rad) * 85, cue.y + Math.sin(rad) * 85);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw balls
    balls.forEach((b) => {
      if (b.potted) return;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (b.id > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(b.id), b.x, b.y);
      }
    });
  }, [aimAngle, started]);

  useEffect(() => {
    drawTable();
  }, [drawTable, shotsLeft, pottedCount]);

  const shootCue = () => {
    if (!started || movingRef.current || shotsRef.current <= 0) return;
    const cue = ballsRef.current[0];
    if (!cue) return;
    if (cue.potted) {
      cue.potted = false;
      cue.x = 75;
      cue.y = 110;
    }

    const rad = (aimAngle * Math.PI) / 180;
    const spd = (power / 100) * 11 + 2;
    cue.vx = Math.cos(rad) * spd;
    cue.vy = Math.sin(rad) * spd;
    shotsRef.current -= 1;
    setShotsLeft(shotsRef.current);
    movingRef.current = true;
    setBallsMoving(true);

    const stepPhysics = () => {
      const balls = ballsRef.current;
      let anyMoving = false;
      for (const b of balls) {
        if (b.potted) continue;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.975;
        b.vy *= 0.975;
        if (Math.hypot(b.vx, b.vy) < 0.08) {
          b.vx = 0;
          b.vy = 0;
        } else {
          anyMoving = true;
        }
        // Cushion bounce
        if (b.x < 21) { b.x = 21; b.vx *= -0.88; }
        if (b.x > 299) { b.x = 299; b.vx *= -0.88; }
        if (b.y < 21) { b.y = 21; b.vy *= -0.88; }
        if (b.y > 199) { b.y = 199; b.vy *= -0.88; }

        // Pocket check
        for (const p of pockets) {
          if (Math.hypot(b.x - p.x, b.y - p.y) < 13) {
            b.potted = true;
            b.vx = 0;
            b.vy = 0;
            if (b.id > 0) {
              pottedRef.current += 1;
              setPottedCount(pottedRef.current);
            }
          }
        }
      }

      // Ball-to-ball elastic collisions
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          if (a.potted || b.potted) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < 18) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = 18 - dist;
            a.x -= nx * (overlap / 2);
            a.y -= ny * (overlap / 2);
            b.x += nx * (overlap / 2);
            b.y += ny * (overlap / 2);
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dot = dvx * nx + dvy * ny;
            if (dot > 0) {
              a.vx -= dot * nx * 0.92;
              a.vy -= dot * ny * 0.92;
              b.vx += dot * nx * 0.92;
              b.vy += dot * ny * 0.92;
            }
          }
        }
      }

      drawTable();
      if (anyMoving) {
        requestAnimationFrame(stepPhysics);
      } else {
        movingRef.current = false;
        setBallsMoving(false);
        if (pottedRef.current >= 2) {
          setStarted(false);
          onFinishMatch('win', pottedRef.current * 40, `🎱 कमाल शॉट! आपने ${pottedRef.current} गेंदें पॉकेट करके Pool 8-Ball जीता!`);
        } else if (shotsRef.current <= 0) {
          setStarted(false);
          onFinishMatch('loss', pottedRef.current * 25, `🎱 शॉट्स समाप्त! आपने ${pottedRef.current}/2 टारगेट गेंदें पॉकेट कीं।`);
        }
      }
    };

    requestAnimationFrame(stepPhysics);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-2.5">
      <div className="w-full max-w-[320px] flex items-center justify-between text-xs font-black bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-950">
        <span>🎱 Potted: {pottedCount}/2 (Win Target)</span>
        <span>शॉट्स बचे: {shotsLeft}</span>
      </div>

      <canvas
        ref={canvasRef}
        width={320}
        height={220}
        onClick={(e) => {
          if (!started || movingRef.current || !canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * 320;
          const py = ((e.clientY - rect.top) / rect.height) * 220;
          const cue = ballsRef.current[0];
          if (cue) {
            setAimAngle(Math.round((Math.atan2(py - cue.y, px - cue.x) * 180) / Math.PI));
          }
        }}
        className="rounded-xl border-2 border-[#5c2d16] shadow-md cursor-crosshair"
      />

      {started ? (
        <div className="w-full max-w-[320px] space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 w-12">Aim:</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={aimAngle}
              onChange={(e) => setAimAngle(Number(e.target.value))}
              className="flex-1 accent-[#2874f0]"
            />
            <span className="font-mono font-bold w-10 text-right">{aimAngle}°</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-600 w-12">Power:</span>
            <input
              type="range"
              min={25}
              max={100}
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              className="flex-1 accent-[#fb641b]"
            />
            <span className="font-mono font-bold w-10 text-right">{power}%</span>
          </div>
          <button
            type="button"
            disabled={ballsMoving}
            onClick={shootCue}
            className="w-full py-2.5 rounded-xl bg-[#fb641b] hover:bg-[#e5530d] disabled:bg-slate-300 text-white font-black text-sm cursor-pointer shadow"
          >
            {ballsMoving ? 'बॉल चल रही हैं...' : '🎯 STRIKE CUE BALL!'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={startTable}
          className="w-full max-w-[320px] py-3 rounded-xl bg-[#15803d] hover:bg-emerald-700 text-white font-black text-sm cursor-pointer shadow"
        >
          🎱 Start Pool 8-Ball Match
        </button>
      )}
    </div>
  );
};

/* ============================================================================
   4. MIC GRAB — Live Beat-Timing & Song Lyrics Grab Arena
   ============================================================================ */
const MIC_SONGS = [
  { line: 'तुझमें रब दिखता है यारा मैं ___ करूँ...', missing: 'क्या', options: ['क्या', 'कब', 'कहाँ', 'कैसे'] },
  { line: 'अपना टाइम आएगा, तू नंगा ही तो ___ है...', missing: 'आया', options: ['गया', 'आया', 'बैठा', 'सोया'] },
  { line: 'दिल चाहता है कभी ना बीते ___ दिन...', missing: 'चमकीले', options: ['सुनहरे', 'चमकीले', 'सुहाने', 'निराले'] },
];

export const MicGrabEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const [started, setStarted] = useState(false);
  const [roundIdx, setRoundIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [grabbedBeat, setGrabbedBeat] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const dirRef = useRef(1);

  const startShow = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    setRoundIdx(0);
    setCursorPos(10);
    setGrabbedBeat(false);
    setScore(0);
    setFeedback('🎙️ हरी Beat Zone (38–62%) के अंदर "GRAB MIC!" दबाएं!');
    setStarted(true);
  };

  useEffect(() => {
    if (!started || grabbedBeat) return;
    const t = setInterval(() => {
      setCursorPos((p) => {
        const next = p + dirRef.current * 4;
        if (next >= 96) { dirRef.current = -1; return 96; }
        if (next <= 4) { dirRef.current = 1; return 4; }
        return next;
      });
    }, 30);
    return () => clearInterval(t);
  }, [started, grabbedBeat]);

  const handleGrabMic = () => {
    if (!started || grabbedBeat) return;
    const hitPerfect = cursorPos >= 36 && cursorPos <= 64;
    const pts = hitPerfect ? 40 : 15;
    setScore((s) => s + pts);
    setGrabbedBeat(true);
    setFeedback(
      hitPerfect
        ? '🔥 PERFECT BEAT GRAB (+40)! अब सही गाना पूरा करें!'
        : '⚡ थोड़ा जल्दी/देर (+15)! अब सही शब्द चुनें!'
    );
  };

  const handlePickLyric = (word: string) => {
    const song = MIC_SONGS[roundIdx];
    const correct = word === song.missing;
    const nextScore = score + (correct ? 35 : 0);
    setScore(nextScore);

    if (roundIdx + 1 >= MIC_SONGS.length) {
      setStarted(false);
      const won = nextScore >= 130;
      onFinishMatch(
        won ? 'win' : 'loss',
        nextScore,
        won
          ? `🎙️ सुपरस्टार परफॉर्मेंस! स्कोर ${nextScore}/225 — Mic Grab Party जीत ली!`
          : `🎤 अच्छा प्रयास! स्कोर ${nextScore}/225 (जीत के लिए 130+ चाहिए)`
      );
      return;
    }

    setRoundIdx((r) => r + 1);
    setGrabbedBeat(false);
    setFeedback(
      correct ? '✅ सही बोल (+35)! अगले राउंड के लिए Mic Grab करें!' : `❌ सही शब्द "${song.missing}" था! अगला राउंड तैयार!`
    );
  };

  if (!started) {
    return (
      <div className="space-y-3 text-center">
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-600 to-pink-700 text-white space-y-1">
          <div className="text-3xl">🎙️🎶</div>
          <h4 className="text-sm font-black">Mic Grab Party — Live Beat &amp; Lyrics</h4>
          <p className="text-[11px] text-rose-100">
            चलती बीट पर सही समय में Mic Grab करें और गानों की सही लाइन पूरी करके 130+ स्कोर से जीतें!
          </p>
        </div>
        <button
          type="button"
          onClick={startShow}
          className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm cursor-pointer shadow"
        >
          🎤 Start Mic Grab Show
        </button>
      </div>
    );
  }

  const currentSong = MIC_SONGS[roundIdx];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-black bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-rose-900">
        <span>Round {roundIdx + 1}/3</span>
        <span>Score: {score} (Win: 130+)</span>
      </div>

      <div className="p-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold text-center">
        {feedback}
      </div>

      {!grabbedBeat ? (
        <div className="space-y-3">
          <div className="relative h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            <div className="absolute top-0 bottom-0 left-[36%] right-[36%] bg-emerald-400/60 border-x-2 border-emerald-600" />
            <div
              className="absolute top-0.5 bottom-0.5 w-3 -ml-1.5 rounded-full bg-rose-600 shadow"
              style={{ left: `${cursorPos}%` }}
            />
          </div>
          <button
            type="button"
            onClick={handleGrabMic}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-sm cursor-pointer shadow active:scale-95"
          >
            🎤 GRAB THE MIC NOW!
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm font-black text-slate-900 text-center">
            &ldquo;{currentSong.line}&rdquo;
          </div>
          <div className="grid grid-cols-2 gap-2">
            {currentSong.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handlePickLyric(opt)}
                className="py-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-300 hover:border-[#2874f0] font-black text-xs text-slate-900 cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   5. LUDO 3D RACE — Interactive Token Race vs Rival (Real Dice + Captures)
   ============================================================================ */
export const LudoBoardEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const [started, setStarted] = useState(false);
  const [myPos, setMyPos] = useState<[number, number]>([0, 0]); // 0=base, 1..20=track
  const [botPos, setBotPos] = useState<[number, number]>([0, 0]);
  const [dice, setDice] = useState<number>(6);
  const [turn, setTurn] = useState<'you' | 'bot'>('you');
  const [rolledThisTurn, setRolledThisTurn] = useState(false);
  const [msg, setMsg] = useState('🎲 पासा घुमाएं (1-20 तक दोनों टोकन पहुंचाएं!)');

  const GOAL = 20;

  const startRace = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    setMyPos([1, 0]);
    setBotPos([1, 0]);
    setDice(6);
    setTurn('you');
    setRolledThisTurn(false);
    setStarted(true);
    setMsg('🎲 अपनी चाल चलें! दोनों टोकन 20 पर पहुंचाकर जीतें!');
  };

  const botMove = (curBot: [number, number], curMy: [number, number]) => {
    setTimeout(() => {
      const r = Math.floor(Math.random() * 6) + 1;
      const idx = curBot[0] < GOAL ? 0 : 1;
      const nextBot: [number, number] = [...curBot] as [number, number];
      nextBot[idx] = Math.min(GOAL, nextBot[idx] + r);
      setBotPos(nextBot);
      if (nextBot[0] >= GOAL && nextBot[1] >= GOAL) {
        setStarted(false);
        onFinishMatch('loss', (curMy[0] + curMy[1]) * 2, `🎲 राइवल (${r}) के दोनों टोकन पहले घर पहुंच गए!`);
        return;
      }
      setTurn('you');
      setRolledThisTurn(false);
      setMsg(`राइवल ने ${r} चला। अब आपकी बारी — Roll Dice दबाएं!`);
    }, 600);
  };

  const rollMyDice = () => {
    if (!started || turn !== 'you' || rolledThisTurn) return;
    const r = Math.floor(Math.random() * 6) + 1;
    setDice(r);
    setRolledThisTurn(true);
    setMsg(`🎲 आपका ${r} आया! नीचे जिस टोकन को आगे बढ़ाना है उसे टैप करें!`);
  };

  const moveToken = (tokIdx: 0 | 1) => {
    if (!started || turn !== 'you' || !rolledThisTurn) return;
    if (myPos[tokIdx] >= GOAL) return;
    const nextMy: [number, number] = [...myPos] as [number, number];
    nextMy[tokIdx] = Math.min(GOAL, nextMy[tokIdx] + dice);

    // Check capture on track (positions 2..18)
    let nextBot: [number, number] = [...botPos] as [number, number];
    let captured = false;
    if (nextMy[tokIdx] > 1 && nextMy[tokIdx] < GOAL) {
      [0, 1].forEach((bi) => {
        if (nextBot[bi] === nextMy[tokIdx]) {
          nextBot[bi] = 0;
          captured = true;
        }
      });
    }
    setMyPos(nextMy);
    setBotPos(nextBot);

    if (nextMy[0] >= GOAL && nextMy[1] >= GOAL) {
      setStarted(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      onFinishMatch('win', 150, `🏆 लूडो किंग जीत! आपके दोनों टोकन घर (20/20) पहुंच गए!`);
      return;
    }

    if (dice === 6 || captured) {
      setRolledThisTurn(false);
      setMsg(captured ? '💥 राइवल का टोकन कट गया — बोनस रोल!' : '🎲 6 आया — एक और बोनस रोल करें!');
    } else {
      setTurn('bot');
      setRolledThisTurn(false);
      setMsg(`आपने टोकन #${tokIdx + 1} को ${nextMy[tokIdx]}/20 पर रखा... राइवल की बारी!`);
      botMove(nextBot, nextMy);
    }
  };

  if (!started) {
    return (
      <button
        type="button"
        onClick={startRace}
        className="w-full py-3.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-black text-sm cursor-pointer shadow"
      >
        🎲 Start Real Ludo Race
      </button>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-xs font-bold text-purple-950 text-center">
        {msg}
      </div>

      {/* Visual Track */}
      <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
        {[0, 1].map((idx) => (
          <div key={`my-${idx}`} className="space-y-1">
            <div className="flex justify-between text-[11px] font-black text-rose-700">
              <span>🔴 आपका टोकन #{idx + 1}</span>
              <span>{myPos[idx]}/{GOAL}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-orange-500 transition-all"
                style={{ width: `${(myPos[idx] / GOAL) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {[0, 1].map((idx) => (
          <div key={`bot-${idx}`} className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-blue-700">
              <span>🔵 राइवल टोकन #{idx + 1}</span>
              <span>{botPos[idx]}/{GOAL}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(botPos[idx] / GOAL) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {!rolledThisTurn ? (
        <button
          type="button"
          disabled={turn !== 'you'}
          onClick={rollMyDice}
          className="w-full py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] disabled:bg-slate-300 text-white font-black text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Dices className="w-5 h-5" />
          <span>{turn === 'you' ? 'Roll Ludo Dice' : 'राइवल की चाल...'}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              type="button"
              disabled={myPos[idx] >= GOAL}
              onClick={() => moveToken(idx as 0 | 1)}
              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white font-black text-xs cursor-pointer shadow"
            >
              🔴 टोकन #{idx + 1} (+{dice})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   6. GUESS MY DRAWING — Animated Canvas Sketch Recognition + Free Draw Studio
   ============================================================================ */
const SKETCH_PUZZLES = [
  { word: 'सूरज (Sun)', options: ['सूरज (Sun)', 'फूल (Flower)', 'घड़ी (Clock)', 'पहिया (Wheel)'], shape: 'sun' },
  { word: 'घर (House)', options: ['कार (Car)', 'घर (House)', 'ताला (Lock)', 'नाव (Boat)'], shape: 'house' },
  { word: 'पेड़ (Tree)', options: ['पहाड़ (Mountain)', 'छतरी (Umbrella)', 'पेड़ (Tree)', 'चाँद (Moon)'], shape: 'tree' },
];

export const DrawingGuessEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [started, setStarted] = useState(false);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [score, setScore] = useState(0);

  const startRound = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    setPuzzleIdx(0);
    setScore(0);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 280, 170);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 280, 170);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const shape = SKETCH_PUZZLES[puzzleIdx].shape;

    if (shape === 'sun') {
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(140, 85, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(140 + Math.cos(a) * 40, 85 + Math.sin(a) * 40);
        ctx.lineTo(140 + Math.cos(a) * 58, 85 + Math.sin(a) * 58);
        ctx.stroke();
      }
    } else if (shape === 'house') {
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(85, 80);
      ctx.lineTo(140, 32);
      ctx.lineTo(195, 80);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = '#2563eb';
      ctx.strokeRect(98, 80, 84, 65);
      ctx.strokeRect(128, 108, 24, 37);
    } else {
      ctx.strokeStyle = '#78350f';
      ctx.fillStyle = '#92400e';
      ctx.fillRect(130, 95, 20, 52);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(140, 72, 36, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [started, puzzleIdx]);

  const handleGuess = (opt: string) => {
    const p = SKETCH_PUZZLES[puzzleIdx];
    const nextScore = score + (opt === p.word ? 50 : 0);
    setScore(nextScore);
    if (puzzleIdx + 1 >= SKETCH_PUZZLES.length) {
      setStarted(false);
      onFinishMatch(nextScore >= 100 ? 'win' : 'loss', nextScore, `✏️ आपने ${nextScore}/150 स्कोर के साथ Guess My Drawing पूरा किया!`);
      return;
    }
    setPuzzleIdx((x) => x + 1);
  };

  if (!started) {
    return (
      <button
        type="button"
        onClick={startRound}
        className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm cursor-pointer shadow"
      >
        ✏️ Start Guess My Drawing Challenge
      </button>
    );
  }

  const cur = SKETCH_PUZZLES[puzzleIdx];
  return (
    <div className="w-full flex flex-col items-center space-y-2.5">
      <div className="text-xs font-black text-emerald-900">
        चित्र #{puzzleIdx + 1}/3 · स्कोर: {score}
      </div>
      <canvas ref={canvasRef} width={280} height={170} className="rounded-xl border-2 border-emerald-400" />
      <div className="grid grid-cols-2 gap-2 w-full">
        {cur.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleGuess(opt)}
            className="py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-300 font-bold text-xs cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   7. HIDE AND SEEK — 6-Room Mansion Stealth & Radar Search
   ============================================================================ */
const HIDING_ROOMS = ['📚 लाइब्रेरी', '🛋️ सोफ़ा हॉल', '🍳 किचन', '🪴 बालकनी', '🛏️ बेडरूम', '🕰️ एटिक'];

export const HideSeekEngine: React.FC<PlayableEngineProps> = ({
  onStartMatch,
  onFinishMatch,
}) => {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [survived, setSurvived] = useState(0);
  const [feedback, setFeedback] = useState('किसी सुरक्षित कमरे में छिपें — Seeker 2 कमरे सर्च करेगा!');

  const startSeek = async () => {
    const ok = await onStartMatch();
    if (!ok) return;
    setRound(1);
    setSurvived(0);
    setFeedback('3 में से कम से कम 2 राउंड बचकर निकलें!');
    setStarted(true);
  };

  const pickRoom = (idx: number) => {
    const shuffled = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
    const seekerChecks = shuffled.slice(0, 2);
    const caught = seekerChecks.includes(idx);
    const nextSurvived = caught ? survived : survived + 1;
    setSurvived(nextSurvived);

    if (round >= 3) {
      setStarted(false);
      onFinishMatch(
        nextSurvived >= 2 ? 'win' : 'loss',
        nextSurvived * 45,
        nextSurvived >= 2
          ? `👀 कमाल! आप 3 में से ${nextSurvived} राउंड सुरक्षित छिपे रहे!`
          : `👀 Seeker ने पकड़ लिया (${nextSurvived}/3 बचे)!`
      );
      return;
    }

    setFeedback(
      caught
        ? `😱 Seeker ने ${HIDING_ROOMS[idx]} चेक किया! राउंड ${round + 1} में जगह बदलें!`
        : `✅ बच गए! Seeker ने ${HIDING_ROOMS[seekerChecks[0]]} चेक किया। राउंड ${round + 1}!`
    );
    setRound((r) => r + 1);
  };

  if (!started) {
    return (
      <button
        type="button"
        onClick={startSeek}
        className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-sm cursor-pointer shadow"
      >
        👀 Start Hide And Seek (3 Rounds)
      </button>
    );
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between text-xs font-black bg-cyan-50 border border-cyan-200 px-3 py-2 rounded-lg text-cyan-950">
        <span>राउंड {round}/3</span>
        <span>सुरक्षित: {survived}</span>
      </div>
      <div className="text-xs font-bold text-slate-700 text-center">{feedback}</div>
      <div className="grid grid-cols-2 gap-2">
        {HIDING_ROOMS.map((rm, idx) => (
          <button
            key={rm}
            type="button"
            onClick={() => pickRoom(idx)}
            className="py-3 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 hover:border-cyan-500 text-xs font-black text-slate-800 cursor-pointer transition"
          >
            {rm}
          </button>
        ))}
      </div>
    </div>
  );
};
