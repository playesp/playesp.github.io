import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  Coins,
  RotateCw,
  X,
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { api } from '../../services/api.ts';

export interface SpinRewardSector {
  id: number;
  title: string;
  hindiTitle: string;
  label: string;
  icon: string;
  type: 'coins' | 'charms' | 'xp' | 'combo';
  coins: number;
  charms: number;
  xp: number;
  color: string;
  textColor: string;
  borderColor: string;
  badge?: string;
}

export const LUCKY_SPIN_SECTORS: SpinRewardSector[] = [
  {
    id: 0,
    title: '100 Coins',
    hindiTitle: '100 कॉइन्स',
    label: '🪙 +100 Coins',
    icon: '🪙',
    type: 'coins',
    coins: 100,
    charms: 0,
    xp: 20,
    color: '#059669',
    textColor: '#a7f3d0',
    borderColor: '#34d399',
    badge: '2X RETURN',
  },
  {
    id: 1,
    title: '50 Charms',
    hindiTitle: '50 चार्म्स',
    label: '✨ +50 Charms',
    icon: '✨',
    type: 'charms',
    coins: 0,
    charms: 50,
    xp: 30,
    color: '#be185d',
    textColor: '#fbcfe8',
    borderColor: '#f472b6',
    badge: 'CHARM BOOST',
  },
  {
    id: 2,
    title: '150 XP',
    hindiTitle: '150 एक्सपी',
    label: '⚡ +150 XP',
    icon: '⚡',
    type: 'xp',
    coins: 0,
    charms: 10,
    xp: 150,
    color: '#0284c7',
    textColor: '#bae6fd',
    borderColor: '#38bdf8',
    badge: 'FAST LEVEL',
  },
  {
    id: 3,
    title: '300 Coins Jackpot',
    hindiTitle: '300 कॉइन्स जैकपॉट',
    label: '👑 +300 Coins',
    icon: '👑',
    type: 'coins',
    coins: 300,
    charms: 50,
    xp: 100,
    color: '#d97706',
    textColor: '#fef3c7',
    borderColor: '#fbbf24',
    badge: 'MEGA WIN',
  },
  {
    id: 4,
    title: 'Lucky Combo',
    hindiTitle: 'लकी कॉम्बो',
    label: '💎 50c + 25 Charms',
    icon: '💎',
    type: 'combo',
    coins: 50,
    charms: 25,
    xp: 25,
    color: '#7c3aed',
    textColor: '#ddd6fe',
    borderColor: '#a78bfa',
    badge: 'COMBO PACK',
  },
  {
    id: 5,
    title: '250 XP Surge',
    hindiTitle: '250 एक्सपी सर्ज',
    label: '⚡ +250 XP',
    icon: '⚡',
    type: 'xp',
    coins: 0,
    charms: 15,
    xp: 250,
    color: '#2563eb',
    textColor: '#bfdbfe',
    borderColor: '#60a5fa',
    badge: 'LEVEL UP',
  },
  {
    id: 6,
    title: '500 Coins Super Jackpot',
    hindiTitle: '500 कॉइन्स महा-जैकपॉट',
    label: '🌟 +500 Coins',
    icon: '🌟',
    type: 'coins',
    coins: 500,
    charms: 100,
    xp: 200,
    color: '#b45309',
    textColor: '#fef08a',
    borderColor: '#facc15',
    badge: 'SUPER JACKPOT',
  },
  {
    id: 7,
    title: 'Mystery Box',
    hindiTitle: 'मिस्ट्री गिफ्ट',
    label: '🎁 80c + 30 Charms',
    icon: '🎁',
    type: 'combo',
    coins: 80,
    charms: 30,
    xp: 50,
    color: '#9333ea',
    textColor: '#f5d0fe',
    borderColor: '#c084fc',
    badge: 'SECRET GIFT',
  },
];

const SPIN_COST = 50;
const COOLDOWN_HOURS = 24;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

interface DailyLuckySpinProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
  onOpenBuyCoins?: () => void;
}

export const DailyLuckySpin: React.FC<DailyLuckySpinProps> = ({
  user,
  onUpdateUser,
  onClose,
  isModal = false,
  onOpenBuyCoins,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [lastSpinDate, setLastSpinDate] = useState<number | null>(() => {
    try {
      const userPropTime = user.lastDailySpin ? new Date(user.lastDailySpin).getTime() : null;
      return userPropTime && !isNaN(userPropTime) ? userPropTime : null;
    } catch {
      return null;
    }
  });

  const [remainingTimeSec, setRemainingTimeSec] = useState<number>(0);
  const [winningSector, setWinningSector] = useState<SpinRewardSector | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentAngleRef = useRef<number>(0);

  useEffect(() => {
    if (user.lastDailySpin) {
      const parsed = new Date(user.lastDailySpin).getTime();
      if (!isNaN(parsed)) setLastSpinDate(parsed);
    }
  }, [user.lastDailySpin]);

  const playSound = (type: 'tick' | 'win' | 'click' | 'deny') => {
    try {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioClass) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioClass();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'win') {
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.start();
        osc.stop(now + 0.7);
      } else if (type === 'deny') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch {}
  };

  useEffect(() => {
    const updateCooldown = () => {
      if (!lastSpinDate) {
        setRemainingTimeSec(0);
        return;
      }
      const leftMs = COOLDOWN_MS - (Date.now() - lastSpinDate);
      setRemainingTimeSec(leftMs > 0 ? Math.ceil(leftMs / 1000) : 0);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastSpinDate]);

  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
  };

  const isCooldownActive = remainingTimeSec > 0;
  const userCoins = user.coins || 0;
  const canAfford = userCoins >= SPIN_COST;

  const handleSpinWheel = async () => {
    if (isSpinning) return;

    if (isCooldownActive) {
      playSound('deny');
      setStatusFeedback(`⏳ 24 घंटे का कूलडाउन सक्रिय है! अगला स्पिन ${formatCountdown(remainingTimeSec)} बाद उपलब्ध होगा।`);
      return;
    }

    if (!canAfford) {
      playSound('deny');
      setStatusFeedback(`❌ सिक्के कम हैं! स्पिन करने के लिए ${SPIN_COST} कॉइन्स चाहिए (आपके पास: ${userCoins})।`);
      return;
    }

    playSound('click');
    setIsSpinning(true);
    setStatusFeedback(null);
    setWinningSector(null);

    // Validate and commit spin server-side BEFORE animating wheel
    let serverRes: any = null;
    try {
      serverRes = await api.dailyLuckySpin(user.userId);
    } catch (err: any) {
      setIsSpinning(false);
      playSound('deny');
      setStatusFeedback(`❌ ${err?.message || 'स्पिन असफल रहा (अपर्याप्त कॉइन्स या कूलडाउन)।'}`);
      return;
    }

    const targetIndex =
      typeof serverRes?.sectorIndex === 'number' &&
      serverRes.sectorIndex >= 0 &&
      serverRes.sectorIndex < LUCKY_SPIN_SECTORS.length
        ? serverRes.sectorIndex
        : 0;

    const chosenSector = LUCKY_SPIN_SECTORS[targetIndex];
    const sectorAngle = 360 / 8;
    const targetOffset = 360 - targetIndex * sectorAngle - sectorAngle / 2;
    const fullRotations = 360 * 6;
    const currentRot = currentAngleRef.current;
    const nextRotation =
      currentRot + fullRotations + ((targetOffset - (currentRot % 360) + 360) % 360);

    currentAngleRef.current = nextRotation;
    setRotationAngle(nextRotation);

    let tickCount = 0;
    const tickInterval = setInterval(() => {
      playSound('tick');
      tickCount++;
      if (tickCount >= 32) clearInterval(tickInterval);
    }, 65);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinningSector(chosenSector);
      playSound('win');
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });

      setLastSpinDate(Date.now());
      if (serverRes?.user) {
        onUpdateUser(serverRes.user);
      }
      setShowWinModal(true);
    }, 4200);
  };

  const content = (
    <div className="bg-white border border-slate-200 rounded-md w-full max-w-lg mx-auto shadow-2xl relative overflow-hidden text-[#212121] animate-fadeIn">
      {/* Header */}
      <div className="bg-[#2874f0] px-5 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-sm bg-white/15 flex items-center justify-center text-xl">
            🎰
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-base sm:text-lg text-white tracking-wide">
                डेली लकी स्पिन (Daily Lucky Spin)
              </h3>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121]">
                50 COINS
              </span>
            </div>
            <p className="text-[11px] text-blue-100">
              50 असली कॉइन्स लगाकर व्हील घुमाएं — गेम टास्क भी पूरा होगा!
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-sm bg-white/15 hover:bg-white/25 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200 text-center">
            <span className="text-[10px] text-[#878787] block font-semibold">कॉइन बैलेंस</span>
            <span className="text-xs sm:text-sm font-black text-amber-600 flex items-center justify-center gap-1 mt-0.5">
              <span>🪙</span>
              <span>{userCoins.toLocaleString()}</span>
            </span>
          </div>

          <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200 text-center">
            <span className="text-[10px] text-[#878787] block font-semibold">स्पिन लागत</span>
            <span className="text-xs sm:text-sm font-black text-[#2874f0] flex items-center justify-center gap-1 mt-0.5">
              <span>🪙</span>
              <span>{SPIN_COST} Coins</span>
            </span>
          </div>

          <div className="bg-[#f9fafb] p-2.5 rounded-sm border border-slate-200 text-center">
            <span className="text-[10px] text-[#878787] block font-semibold">उपलब्धता</span>
            <span
              className={`text-[10px] font-black flex items-center justify-center gap-1 mt-1 ${
                isCooldownActive ? 'text-rose-600' : 'text-[#388e3c]'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{isCooldownActive ? 'कूलडाउन' : 'तैयार है'}</span>
            </span>
          </div>
        </div>

        {statusFeedback && (
          <div className="mt-3 p-2.5 rounded-sm bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold text-center animate-fadeIn">
            {statusFeedback}
          </div>
        )}

        {/* WHEEL CONTAINER */}
        <div className="my-5 flex flex-col items-center justify-center relative bg-[#f5f8ff] rounded-md border border-blue-100 py-5">
          <div className="relative z-30 -mb-4 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#fb641b] filter drop-shadow-md" />
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 shadow -mt-4" />
          </div>

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 shadow-lg border-4 border-amber-200">
            <div
              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning
                  ? 'transform 4.2s cubic-bezier(0.12, 0.8, 0.22, 1.0)'
                  : 'none',
              }}
            >
              <svg viewBox="0 0 300 300" className="w-full h-full">
                <defs>
                  {LUCKY_SPIN_SECTORS.map((sector) => (
                    <linearGradient
                      key={`grad-${sector.id}`}
                      id={`grad-${sector.id}`}
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor={sector.color} />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  ))}
                </defs>

                {LUCKY_SPIN_SECTORS.map((sector, idx) => {
                  const angle = 45;
                  const startAngle = idx * angle;
                  const endAngle = startAngle + angle;
                  const radStart = (Math.PI / 180) * (startAngle - 90);
                  const radEnd = (Math.PI / 180) * (endAngle - 90);
                  const x1 = 150 + 150 * Math.cos(radStart);
                  const y1 = 150 + 150 * Math.sin(radStart);
                  const x2 = 150 + 150 * Math.cos(radEnd);
                  const y2 = 150 + 150 * Math.sin(radEnd);
                  const d = `M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;

                  return (
                    <g key={sector.id}>
                      <path
                        d={d}
                        fill={`url(#grad-${sector.id})`}
                        stroke={sector.borderColor}
                        strokeWidth="1.5"
                      />
                      <g transform={`rotate(${startAngle + 22.5}, 150, 150)`}>
                        <text
                          x="150"
                          y="55"
                          fill={sector.textColor}
                          fontSize="12"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          {sector.icon} {sector.title}
                        </text>
                        <text
                          x="150"
                          y="72"
                          fill="#fef08a"
                          fontSize="8.5"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {sector.badge}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#ffe500] shadow-lg border-2 border-white flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-black text-[#212121] leading-none">ESP</span>
                  <span className="text-[8px] font-black uppercase text-[#2874f0] tracking-tighter mt-0.5">
                    LUCKY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION SECTION */}
        <div className="space-y-3">
          {isCooldownActive ? (
            <div className="bg-rose-50 p-4 rounded-sm border border-rose-200 text-center">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-black text-rose-700">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>24 घंटे का कूलडाउन सक्रिय</span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-black text-[#212121] my-1">
                {formatCountdown(remainingTimeSec)}
              </div>
              <p className="text-[11px] text-[#878787]">
                यह स्पिन 24 घंटे में 1 बार 50 कॉइन्स के साथ घुमाया जा सकता है।
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || !canAfford}
                className={`w-full py-3.5 rounded-sm font-black text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-sm ${
                  !canAfford
                    ? 'bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed'
                    : isSpinning
                    ? 'bg-amber-400 text-[#212121] animate-pulse'
                    : 'bg-[#fb641b] hover:bg-[#e8550f] text-white cursor-pointer'
                }`}
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>
                  {isSpinning
                    ? 'व्हील घूम रहा है...'
                    : !canAfford
                    ? `अपर्याप्त कॉइन्स - 50 कॉइन्स चाहिए (आपके पास: ${userCoins})`
                    : `🎰 व्हील घुमाएं - 50 कॉइन्स (SPIN FOR 50 COINS)`}
                </span>
              </button>

              {!canAfford && (
                <div className="bg-rose-50 border border-rose-200 rounded-sm p-3 text-center space-y-2">
                  <p className="text-[11px] text-rose-700 font-semibold">
                    ⚠️ आपके पास केवल {userCoins} कॉइन्स हैं। असली टास्क पूरे करें (+5c) या कॉइन्स खरीदें।
                  </p>
                  {onOpenBuyCoins && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose?.();
                        onOpenBuyCoins();
                      }}
                      className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e8550f] text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>🪙 Buy Coins (कॉइन्स खरीदें)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-slate-200">
            <div className="text-[10px] text-[#878787] font-bold mb-2 flex items-center justify-between">
              <span>संभावित पुरस्कार सूची (SERVER VERIFIED):</span>
              <span className="text-[#388e3c] font-mono">50 Coins Entry</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {LUCKY_SPIN_SECTORS.map((s) => (
                <div
                  key={s.id}
                  className="bg-[#f9fafb] p-1.5 rounded-sm border border-slate-200 text-center flex items-center space-x-1.5"
                >
                  <span className="text-base">{s.icon}</span>
                  <div className="text-left overflow-hidden">
                    <div className="text-[10px] font-bold text-[#212121] truncate">{s.title}</div>
                    <div className="text-[8px] text-[#2874f0] font-mono truncate">{s.badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showWinModal && winningSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full text-center shadow-2xl text-[#212121]">
            <div className="w-16 h-16 rounded-full bg-[#ffe500] mx-auto flex items-center justify-center text-3xl shadow-md mb-3">
              🎉
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-[#388e3c]">
              बधाई हो!
            </div>
            <h2 className="text-xl font-black text-[#212121] mt-1">{winningSector.title}</h2>
            <p className="text-xs text-[#2874f0] font-bold mt-0.5">{winningSector.hindiTitle}</p>

            <div className="my-4 p-3 bg-[#f9fafb] rounded-sm border border-slate-200 space-y-1.5">
              {winningSector.coins > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-amber-700">
                  <span>🪙 कॉइन्स क्रेडिट:</span>
                  <span className="text-sm font-black">+{winningSector.coins} Coins</span>
                </div>
              )}
              {winningSector.charms > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-pink-700">
                  <span>✨ चार्म्स बोनस:</span>
                  <span className="text-sm font-black">+{winningSector.charms} Charms</span>
                </div>
              )}
              {winningSector.xp > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-[#2874f0]">
                  <span>⚡ EXP बूस्ट:</span>
                  <span className="text-sm font-black">+{winningSector.xp} XP</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowWinModal(false)}
              className="w-full py-3 rounded-sm bg-[#388e3c] hover:bg-[#2e7d32] text-white font-black text-xs shadow-sm transition cursor-pointer"
            >
              जारी रखें ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
        {content}
      </div>
    );
  }

  return content;
};
