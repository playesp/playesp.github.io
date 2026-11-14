import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, Check, AlertCircle, Sparkles, Gift } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { DailyLoginRewards, type TieredReward, type LoginRewardStatus, type RealTimeDayReward } from '../services/DailyLoginRewardsService.ts';

interface DailyLoginRewardsModalProps {
  user?: UserProfile | null;
  status?: LoginRewardStatus;
  isOpen?: boolean;
  onClose: () => void;
  onClaim?: (updatedUser: UserProfile, reward: TieredReward) => void;
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
}

// Pixel-accurate golden coin with 4-point star in center
const GoldenStarCoin: React.FC<{ size?: number; glow?: boolean }> = ({ size = 32, glow = false }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={`mx-auto ${glow ? 'filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.7)] animate-pulse' : 'drop-shadow-xs'}`}
  >
    <circle cx="24" cy="24" r="22" fill="url(#coinGradOuter)" stroke="#EAB308" strokeWidth="1.5" />
    <circle cx="24" cy="24" r="17.5" fill="url(#coinGradInner)" stroke="#FEF08A" strokeWidth="1.2" />
    <path
      d="M24 12.5L26.8 21.2L35.5 24L26.8 26.8L24 35.5L21.2 26.8L12.5 24L21.2 21.2L24 12.5Z"
      fill="#FFFBEB"
      stroke="#F59E0B"
      strokeWidth="0.8"
    />
    <circle cx="24" cy="24" r="2" fill="#D97706" />
    <defs>
      <linearGradient id="coinGradOuter" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDE68A" />
        <stop offset="0.45" stopColor="#F59E0B" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
      <linearGradient id="coinGradInner" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFBEB" />
        <stop offset="0.6" stopColor="#FBBF24" />
        <stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
    </defs>
  </svg>
);

// High-fidelity Mascot Artwork with floating balloons, gift box and gold coins
const MascotArtwork: React.FC = () => (
  <div className="relative w-full flex flex-col items-center justify-end -mb-3 sm:-mb-4 z-20 pointer-events-none select-none">
    {/* Floating Balloons on the Right */}
    <div className="absolute right-6 sm:right-12 -top-3 flex items-center space-x-1 animate-bounce duration-1000">
      {/* Pink Balloon */}
      <div className="w-6 h-8 sm:w-7 sm:h-9 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 shadow-md transform -rotate-12 relative flex items-start justify-start p-1">
        <div className="w-1.5 h-2 rounded-full bg-white/70" />
        <div className="w-0.5 h-5 bg-slate-300 absolute -bottom-4 left-3" />
      </div>
      {/* Cyan Balloon */}
      <div className="w-6 h-8 sm:w-7 sm:h-9 rounded-full bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 shadow-md transform rotate-12 relative -mt-2 flex items-start justify-start p-1">
        <div className="w-1.5 h-2 rounded-full bg-white/70" />
        <div className="w-0.5 h-5 bg-slate-300 absolute -bottom-4 left-3" />
      </div>
    </div>

    {/* Floating Wrapped Gift on Left */}
    <div className="absolute left-6 sm:left-12 -top-2 animate-pulse">
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 border border-white/80 shadow-md flex items-center justify-center text-sm sm:text-base transform -rotate-12">
        🎁
      </div>
    </div>

    {/* Adorable Cyan Blob Mascot */}
    <div className="relative flex flex-col items-center">
      <div className="w-20 h-15 sm:w-24 sm:h-18 bg-gradient-to-b from-[#6ee7ff] via-[#38bdf8] to-[#0ea5e9] rounded-t-[38px] rounded-b-[24px] shadow-lg flex flex-col items-center justify-between p-1 relative border-2 border-white/80">
        {/* Ears */}
        <div className="w-3 h-3 rounded-full bg-[#38bdf8] absolute -top-1 left-3.5 border border-white/70" />
        <div className="w-3 h-3 rounded-full bg-[#38bdf8] absolute -top-1 right-3.5 border border-white/70" />

        {/* Waving Paws */}
        <div className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] absolute top-5 -left-1.5 border border-white/80 shadow-xs transform -rotate-15" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] absolute top-5 -right-1.5 border border-white/80 shadow-xs transform rotate-15" />

        {/* Eyes & Cheeks */}
        <div className="flex items-center space-x-3.5 pt-1">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 flex items-start justify-start p-0.5">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="w-2 h-1 rounded-full bg-pink-400 -bottom-0.5 -left-0.5 absolute" />
          </div>
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 flex items-start justify-start p-0.5">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <div className="w-2 h-1 rounded-full bg-pink-400 -bottom-0.5 -right-0.5 absolute" />
          </div>
        </div>

        {/* Cute Smile */}
        <div className="w-3 h-1.5 border-b-2 border-slate-900 rounded-full -mt-0.5" />

        {/* Belly white oval */}
        <div className="w-9 h-5 rounded-full bg-white/85 shadow-2xs mb-0.5" />
      </div>

      {/* Gold coin stacks around feet */}
      <div className="flex items-center -space-x-1.5 -mt-2 z-10">
        <div className="w-5 h-2 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-600 shadow-2xs" />
        <div className="w-6 h-2.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-600 shadow-2xs -translate-y-0.5" />
        <div className="w-5 h-2 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-600 shadow-2xs" />
      </div>
    </div>
  </div>
);

export const DailyLoginRewardsModal: React.FC<DailyLoginRewardsModalProps> = ({
  user,
  isOpen = true,
  onClose,
  onClaim,
  onOpenLogin,
  onOpenRegister,
}) => {
  const [currentStatus, setCurrentStatus] = useState<LoginRewardStatus | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<TieredReward | null>(null);

  useEffect(() => {
    if (user) {
      const s = DailyLoginRewards.checkStatus(user);
      setCurrentStatus(s);
    }
  }, [user]);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }

    try {
      setClaiming(true);
      const res = DailyLoginRewards.claimReward(user);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setClaimSuccess(res.reward);
      setCurrentStatus(DailyLoginRewards.checkStatus(res.updatedUser));
      if (onClaim) {
        onClaim(res.updatedUser, res.reward);
      }
    } catch (err: any) {
      console.warn(err);
    } finally {
      setClaiming(false);
    }
  };

  const daysList: RealTimeDayReward[] = currentStatus?.days || [];
  const row1 = daysList.slice(0, 4); // Days 1 to 4
  const row2 = daysList.slice(4, 7); // Days 5 to 7

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      
      {/* Container with exact relative width & arched headers */}
      <div className="relative w-full max-w-[390px] sm:max-w-[420px] my-auto select-none">
        
        {/* ============================================================== */}
        {/* TOP ARCHED BANNER: "THEN COLLECT THESE"                        */}
        {/* ============================================================== */}
        <div className="w-full text-center mb-1 relative z-20">
          <p className="font-black text-xl sm:text-2xl text-white tracking-wider uppercase font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center space-x-1.5">
            <span className="text-amber-300">✨</span>
            <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 bg-clip-text text-transparent">
              THEN COLLECT THESE
            </span>
            <span className="text-amber-300">✨</span>
          </p>
        </div>

        {/* Mascot & Balloons */}
        <MascotArtwork />

        {/* ============================================================== */}
        {/* MAIN DIALOGUE CARD CONTAINER                                   */}
        {/* ============================================================== */}
        <div className="relative bg-gradient-to-b from-[#ffffff] via-[#fffdfa] to-[#fbf7ee] rounded-[32px] sm:rounded-[36px] p-4 sm:p-5 pt-8 sm:pt-9 shadow-2xl border-4 border-[#fff3d4] text-slate-800">
          
          {/* Top-Right Circular Close "X" Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition transform hover:scale-110 active:scale-95 shadow-md cursor-pointer z-30"
            title="पॉप-अप बंद करें"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* ============================================================== */}
          {/* ORANGE-GOLD RIBBON: "Weekly Rewards"                           */}
          {/* ============================================================== */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-[82%] sm:w-[80%] z-20">
            <div className="relative w-full h-11 sm:h-12 bg-gradient-to-r from-[#ff8c42] via-[#ff7824] to-[#f35b04] rounded-full shadow-[0_4px_12px_rgba(243,91,4,0.4)] border-2 border-white flex items-center justify-center">
              {/* Left Ribbon Notch */}
              <div className="absolute -left-2 top-2 w-3 h-7 bg-[#d9480f] rounded-l-md -z-10 transform -skew-y-12" />
              {/* Right Ribbon Notch */}
              <div className="absolute -right-2 top-2 w-3 h-7 bg-[#d9480f] rounded-r-md -z-10 transform skew-y-12" />

              <span className="text-white font-black text-base sm:text-lg tracking-wide uppercase drop-shadow-sm font-sans flex items-center space-x-1.5">
                <span>🎁</span>
                <span>Weekly Rewards</span>
              </span>
            </div>
          </div>

          {/* Green Doodle Stars */}
          <div className="absolute top-8 left-6 text-emerald-400 text-lg opacity-80 pointer-events-none">⭐</div>
          <div className="absolute top-10 right-10 text-emerald-400 text-sm opacity-80 pointer-events-none">⭐</div>

          {/* Missed Day Alert Banner (if applicable) */}
          {currentStatus?.hasMissedDays && (
            <div className="mt-2 mb-2 p-2 bg-amber-50 border border-amber-300 rounded-xl flex items-center space-x-2 text-[11px] text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>आपने कुछ दिन मिस (Miss) कर दिए, लेकिन आप आज का रिवॉर्ड क्लेम कर सकते हैं!</span>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7-DAY REWARDS GRID (Row 1: 4 cards, Row 2: 3 cards)            */}
          {/* ============================================================== */}
          <div className="space-y-2.5 mt-2">
            
            {/* ROW 1: Days 1 to 4 */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {row1.map((item) => {
                const isTodayCanClaim = item.status === 'today_can_claim';
                const isClaimed = item.status === 'claimed' || item.status === 'today_claimed';
                const isMissed = item.status === 'missed';

                return (
                  <div
                    key={item.day}
                    className={`relative rounded-2xl p-2 sm:p-2.5 text-center flex flex-col justify-between transition transform shadow-xs ${
                      isTodayCanClaim
                        ? 'bg-gradient-to-b from-[#ff8c42] to-[#f35b04] text-white shadow-md shadow-orange-500/30 ring-2 ring-[#ff8c42] scale-102'
                        : isClaimed
                        ? 'bg-[#f4f7f6] border border-emerald-300 text-slate-700'
                        : isMissed
                        ? 'bg-rose-50/80 border border-dashed border-rose-300 text-rose-800'
                        : 'bg-[#f8f9fa] border border-slate-200 text-slate-600'
                    }`}
                  >
                    {/* Day Title & Real-Time Date */}
                    <div>
                      <p className={`text-[10px] sm:text-[11px] font-black uppercase ${isTodayCanClaim ? 'text-white' : 'text-slate-500'}`}>
                        Day {item.day}
                      </p>
                      <p className={`text-[9px] font-bold ${isTodayCanClaim ? 'text-orange-100' : isMissed ? 'text-rose-500' : 'text-slate-400'}`}>
                        {item.displayDate}
                      </p>
                    </div>

                    {/* Star Coin Artwork */}
                    <div className="my-1.5">
                      <GoldenStarCoin size={26} glow={isTodayCanClaim} />
                    </div>

                    {/* Coins Count or Status */}
                    <div>
                      {isMissed ? (
                        <span className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                          Missed (मिस)
                        </span>
                      ) : isClaimed ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                          <Check className="w-3 h-3 mr-0.5" /> क्लेम ✓
                        </span>
                      ) : (
                        <p className={`text-xs font-black ${isTodayCanClaim ? 'text-white drop-shadow-xs' : 'text-slate-700'}`}>
                          {item.coins} +
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ROW 2: Days 5 to 7 */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {row2.map((item) => {
                const isTodayCanClaim = item.status === 'today_can_claim';
                const isClaimed = item.status === 'claimed' || item.status === 'today_claimed';
                const isMissed = item.status === 'missed';
                const isMystery = item.isMysteryGift;

                return (
                  <div
                    key={item.day}
                    className={`relative rounded-2xl p-2.5 sm:p-3 text-center flex flex-col justify-between transition transform shadow-xs ${
                      isMystery
                        ? isTodayCanClaim
                          ? 'bg-gradient-to-b from-[#ff8c42] to-[#f35b04] text-white shadow-md ring-2 ring-amber-300 scale-102'
                          : 'bg-gradient-to-b from-[#fff6ea] to-[#fff1d6] border-2 border-dashed border-amber-300 text-slate-800'
                        : isTodayCanClaim
                        ? 'bg-gradient-to-b from-[#ff8c42] to-[#f35b04] text-white shadow-md shadow-orange-500/30 ring-2 ring-[#ff8c42] scale-102'
                        : isClaimed
                        ? 'bg-[#f4f7f6] border border-emerald-300 text-slate-700'
                        : isMissed
                        ? 'bg-rose-50/80 border border-dashed border-rose-300 text-rose-800'
                        : 'bg-[#f8f9fa] border border-slate-200 text-slate-600'
                    }`}
                  >
                    <div>
                      <p className={`text-[10px] sm:text-[11px] font-black uppercase ${isTodayCanClaim ? 'text-white' : 'text-slate-500'}`}>
                        Day {item.day}
                      </p>
                      <p className={`text-[9px] font-bold ${isTodayCanClaim ? 'text-orange-100' : isMissed ? 'text-rose-500' : 'text-slate-400'}`}>
                        {item.displayDate}
                      </p>
                    </div>

                    {/* Artwork: Star Coin or Mystery Gift */}
                    <div className="my-1.5">
                      {isMystery ? (
                        <div className="relative w-9 h-9 mx-auto flex items-center justify-center animate-bounce">
                          {/* 3D Cyan Gift Box Artwork */}
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 border border-white shadow-sm flex items-center justify-center text-lg transform -rotate-6">
                            🎁
                          </div>
                          {/* Yellow Ribbons */}
                          <div className="absolute -top-1 -right-1 text-xs">✨</div>
                        </div>
                      ) : (
                        <GoldenStarCoin size={26} glow={isTodayCanClaim} />
                      )}
                    </div>

                    <div>
                      {isMissed ? (
                        <span className="inline-block text-[9px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                          Missed (मिस)
                        </span>
                      ) : isClaimed ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                          <Check className="w-3 h-3 mr-0.5" /> क्लेम ✓
                        </span>
                      ) : isMystery ? (
                        <p className={`text-[10px] font-black leading-tight ${isTodayCanClaim ? 'text-white' : 'text-amber-800'}`}>
                          Mystery Gift 🎁
                        </p>
                      ) : (
                        <p className={`text-xs font-black ${isTodayCanClaim ? 'text-white drop-shadow-xs' : 'text-slate-700'}`}>
                          {item.coins} +
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* MAIN PROMINENT CLAIM BUTTON                                    */}
          {/* ============================================================== */}
          <div className="mt-4 pt-1">
            {user ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming || !currentStatus?.canClaimToday}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wide uppercase transition-all duration-300 shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                  currentStatus?.canClaimToday
                    ? 'bg-gradient-to-r from-[#ff8c42] via-[#ff7824] to-[#f35b04] hover:from-[#ff9e5e] hover:to-[#ff6d14] text-white shadow-orange-500/40 transform hover:scale-[1.02] active:scale-95'
                    : 'bg-emerald-600 text-white opacity-95 cursor-default'
                }`}
              >
                {claiming ? (
                  <span>क्लेम हो रहा है...</span>
                ) : currentStatus?.canClaimToday ? (
                  <>
                    <span>⚡ Claim Day {currentStatus.todayDayNumber} (+{currentStatus.todayReward.coins} Coins)</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Claimed Today ✓ (कल अगला रिवॉर्ड मिलेगा)</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full py-3 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-[#ff8c42] to-[#f35b04] text-white shadow-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition"
                >
                  🔐 लॉगिन करके क्लेम करें
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  नया खाता बनाएं?{' '}
                  <span onClick={onOpenRegister} className="text-orange-600 font-bold underline cursor-pointer">
                    रजिस्टर करें (₹10)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Reward Success Toast */}
          {claimSuccess && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center animate-fadeIn">
              <p className="text-xs font-black text-emerald-800">
                🎉 बधाई हो! +{claimSuccess.coins} कॉइन्स आपके खाते में जुड़ गए हैं!
              </p>
            </div>
          )}

        </div>

        {/* ============================================================== */}
        {/* BOTTOM ARCHED TEXT: "PLAYING REGULARLY INCENTIVE"              */}
        {/* ============================================================== */}
        <div className="w-full text-center mt-2 relative z-20">
          <p className="font-black text-sm sm:text-base text-emerald-300 tracking-wider uppercase font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            PLAYING REGULARLY INCENTIVE
          </p>
        </div>

      </div>

    </div>
  );
};
