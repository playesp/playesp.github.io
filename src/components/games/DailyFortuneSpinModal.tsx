import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Trophy, Clock, Coins, Zap, Heart, 
  RotateCw, Gift, Crown, AlertCircle, CheckCircle2, X, Award, Flame, Star
} from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';

export interface FortuneSector {
  id: number;
  title: string;
  hindiTitle: string;
  icon: string;
  type: 'coins' | 'charms' | 'badge' | 'combo';
  coins: number;
  charms: number;
  badgeName?: string;
  badgeIcon?: string;
  color: string;
  textColor: string;
  tag: string;
}

export const FORTUNE_SECTORS: FortuneSector[] = [
  {
    id: 0,
    title: '1,000 Coins Jackpot',
    hindiTitle: '1,000 कॉइन्स महा-जैकपॉट',
    icon: '🪙',
    type: 'coins',
    coins: 1000,
    charms: 0,
    color: '#d97706',
    textColor: '#fef3c7',
    tag: '1000 COINS',
  },
  {
    id: 1,
    title: 'Fortune Crown Badge',
    hindiTitle: '👑 लकी क्राउन बैज',
    icon: '👑',
    type: 'badge',
    coins: 100,
    charms: 50,
    badgeName: '👑 Fortune Crown Master',
    badgeIcon: '👑',
    color: '#9333ea',
    textColor: '#f3e8ff',
    tag: 'EXCLUSIVE BADGE',
  },
  {
    id: 2,
    title: '200 Charms Surge',
    hindiTitle: '200 चार्म्स सर्ज',
    icon: '✨',
    type: 'charms',
    coins: 50,
    charms: 200,
    color: '#db2777',
    textColor: '#fce7f3',
    tag: 'CHARM BOOST',
  },
  {
    id: 3,
    title: '250 Coins Win',
    hindiTitle: '250 कॉइन्स जीत',
    icon: '💰',
    type: 'coins',
    coins: 250,
    charms: 20,
    color: '#059669',
    textColor: '#d1fae5',
    tag: 'INSTANT CASH',
  },
  {
    id: 4,
    title: 'Golden Roller Badge',
    hindiTitle: '⭐ गोल्डन रोलर बैज',
    icon: '⭐',
    type: 'badge',
    coins: 150,
    charms: 60,
    badgeName: '⭐ Golden Roller VIP',
    badgeIcon: '⭐',
    color: '#ca8a04',
    textColor: '#fef08a',
    tag: 'EXCLUSIVE BADGE',
  },
  {
    id: 5,
    title: '500 Coins Fortune',
    hindiTitle: '500 कॉइन्स फॉर्च्यून',
    icon: '🪙',
    type: 'coins',
    coins: 500,
    charms: 50,
    color: '#0284c7',
    textColor: '#e0f2fe',
    tag: '500 COINS',
  },
  {
    id: 6,
    title: 'Diamond Champion Badge',
    hindiTitle: '💎 डायमंड चैंपियन बैज',
    icon: '💎',
    type: 'badge',
    coins: 200,
    charms: 100,
    badgeName: '💎 Diamond Champion',
    badgeIcon: '💎',
    color: '#4f46e5',
    textColor: '#e0e7ff',
    tag: 'EXCLUSIVE BADGE',
  },
  {
    id: 7,
    title: 'Mega Combo Box',
    hindiTitle: '🎁 महा कॉम्बो गिफ्ट',
    icon: '🎁',
    type: 'combo',
    coins: 350,
    charms: 120,
    badgeName: '🔥 Lucky Streak',
    color: '#dc2626',
    textColor: '#fee2e2',
    tag: 'COMBO JACKPOT',
  },
];

interface DailyFortuneSpinModalProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const DailyFortuneSpinModal: React.FC<DailyFortuneSpinModalProps> = ({
  user,
  onUpdateUser,
  onClose,
  isModal = true,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonSector, setWonSector] = useState<FortuneSector | null>(null);
  const [timeRemainingText, setTimeRemainingText] = useState<string>('उपलब्ध है!');
  const [canSpinFree, setCanSpinFree] = useState<boolean>(true);
  const [lastSpinTime, setLastSpinTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const checkTimer = () => {
      try {
        const stored = localStorage.getItem(`esp_daily_fortune_${user.userId}`);
        const last = stored ? parseInt(stored, 10) : 0;
        setLastSpinTime(last);

        const now = Date.now();
        const diff = now - last;
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (diff < TWENTY_FOUR_HOURS) {
          setCanSpinFree(false);
          const remainingMs = TWENTY_FOUR_HOURS - diff;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
          setTimeRemainingText(`${hours}घं ${mins}मि ${secs}से`);
        } else {
          setCanSpinFree(true);
          setTimeRemainingText('मुफ़्त स्पिन तैयार है!');
        }
      } catch {
        setCanSpinFree(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [user.userId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const numSectors = FORTUNE_SECTORS.length;
    const arc = (2 * Math.PI) / numSectors;

    ctx.clearRect(0, 0, size, size);

    // Bezel
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    for (let i = 0; i < 24; i++) {
      const angle = (i * 2 * Math.PI) / 24;
      const sx = center + (radius + 4) * Math.cos(angle);
      const sy = center + (radius + 4) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#f59e0b';
      ctx.fill();
    }
    ctx.restore();

    // Sectors
    FORTUNE_SECTORS.forEach((sec, i) => {
      const angle = i * arc;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = sec.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff33';
      ctx.stroke();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`${sec.icon} ${sec.tag}`, radius - 16, 5);
      ctx.restore();

      ctx.restore();
    });

    // Center Hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'black 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FORTUNE', center, center - 6);
    ctx.fillText('SPIN', center, center + 7);
    ctx.restore();
  }, []);

  const handleSpin = (isPaidExtra = false) => {
    if (isSpinning) return;
    setErrorMessage(null);

    if (!canSpinFree && !isPaidExtra) {
      setErrorMessage(`24 घंटे का मुफ़्त स्पिन अभी लॉक है (${timeRemainingText})। आप 50 कॉइन्स देकर अतिरिक्त स्पिन कर सकते हैं!`);
      return;
    }

    if (isPaidExtra && (user.coins || 0) < 50) {
      setErrorMessage('आपके पास अतिरिक्त स्पिन के लिए 50 कॉइन्स नहीं हैं!');
      return;
    }

    setIsSpinning(true);
    setWonSector(null);

    let currentCoins = user.coins || 0;
    if (isPaidExtra) {
      currentCoins -= 50;
    }

    const winningIndex = Math.floor(Math.random() * FORTUNE_SECTORS.length);
    const winning = FORTUNE_SECTORS[winningIndex];

    const numSectors = FORTUNE_SECTORS.length;
    const sectorAngle = 360 / numSectors;
    const targetSectorCenter = winningIndex * sectorAngle + sectorAngle / 2;
    const stopAngle = 270 - targetSectorCenter;
    const totalRotation = wheelRotation + (360 * 6) + (stopAngle - (wheelRotation % 360));

    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonSector(winning);

      if (!isPaidExtra) {
        const now = Date.now();
        localStorage.setItem(`esp_daily_fortune_${user.userId}`, now.toString());
        setLastSpinTime(now);
        setCanSpinFree(false);
      }

      const updatedCoins = currentCoins + winning.coins;
      const updatedCharms = (user.charms || 0) + winning.charms;
      const updatedXp = (user.gameXp || 0) + 50;

      onUpdateUser({
        ...user,
        coins: updatedCoins,
        charms: updatedCharms,
        gameXp: updatedXp,
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 4000);
  };

  const modalContent = (
    <div className="bg-white rounded-md border border-slate-200 shadow-2xl text-[#212121] max-w-lg w-full mx-auto relative overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#2874f0] text-white border-b border-blue-600 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center font-black shadow-sm">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
              <span>डेली फॉर्च्यून व्हील</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#ffe500] text-[#212121]">
                24H REWARD
              </span>
            </h3>
            <p className="text-[11px] text-blue-100 font-medium">
              हर 24 घंटे में 1 मुफ़्त स्पिन करें और जीतें 1,000 कॉइन्स, चार्म्स व एक्सक्लूसिव बैज!
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-sm bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {errorMessage && (
          <div className="mb-4 p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Wheel Area */}
        <div className="flex flex-col items-center justify-center my-4 py-4 rounded-md bg-[#f5f8ff] border border-blue-100 relative">
          <div className="absolute top-1 z-30 flex flex-col items-center">
            <div className="text-3xl filter drop-shadow-md animate-pulse">
              🔻
            </div>
          </div>

          <div
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
            className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full shadow-lg"
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="w-full h-full rounded-full"
            />
          </div>
        </div>

        {wonSector && (
          <div className="mb-4 p-4 rounded-sm bg-emerald-50 border border-emerald-300 text-center animate-fadeIn shadow-sm">
            <div className="text-2xl mb-1">{wonSector.icon}</div>
            <h4 className="text-sm font-black text-[#388e3c] uppercase tracking-wide">
              बधाई हो! आपने जीता: {wonSector.hindiTitle}
            </h4>
            <div className="flex items-center justify-center space-x-4 mt-2 text-xs font-bold text-[#212121]">
              {wonSector.coins > 0 && (
                <span className="text-[#fb641b] flex items-center gap-1">
                  🪙 +{wonSector.coins} कॉइन्स
                </span>
              )}
              {wonSector.charms > 0 && (
                <span className="text-pink-600 flex items-center gap-1">
                  ✨ +{wonSector.charms} चार्म्स
                </span>
              )}
              {wonSector.badgeName && (
                <span className="text-[#2874f0] flex items-center gap-1">
                  🏆 {wonSector.badgeName}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {canSpinFree ? (
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleSpin(false)}
              className="w-full py-3.5 px-6 rounded-sm font-black text-sm text-white bg-[#fb641b] hover:bg-[#e8550f] transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'व्हील घूम रहा है...' : '🎁 मुफ़्त 24H स्पिन घुमाएं (Free Spin)'}</span>
            </button>
          ) : (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-sm bg-[#f9fafb] border border-slate-200 text-xs">
                <span className="text-[#878787] font-semibold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2874f0]" />
                  अगला मुफ़्त स्पिन:
                </span>
                <span className="font-mono font-black text-[#fb641b]">{timeRemainingText}</span>
              </div>

              <button
                type="button"
                disabled={isSpinning || (user.coins || 0) < 50}
                onClick={() => handleSpin(true)}
                className="w-full py-3 px-6 rounded-sm font-black text-xs text-white bg-[#2874f0] hover:bg-[#1c62d6] transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <Coins className="w-4 h-4 text-[#ffe500]" />
                <span>50 कॉइन्स में एक्स्ट्रा स्पिन करें (Instant Spin)</span>
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-[#878787] bg-[#f9fafb] border border-slate-200 rounded-sm px-3 py-2">
            <span>आपका कॉइन बैलेंस: <strong className="text-[#fb641b]">🪙 {user.coins || 0}</strong></span>
            <span>चार्म्स: <strong className="text-pink-600">✨ {user.charms || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return modalContent;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      {modalContent}
    </div>
  );
};
