import React from 'react';

export type FrameVariant = 
  | 'royal-dragon-crown' 
  | 'cosmic-neon' 
  | 'vip-gold' 
  | 'wolf-night' 
  | 'judge-justice' 
  | 'pro-player'
  | 'rookie'
  | 'clan-leader'
  | 'standard'
  | string;

interface AvatarFrameProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  frameType?: FrameVariant;
  level?: number;
  showCrown?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = ({
  src,
  alt = 'User Avatar',
  size = 'md',
  frameType = 'standard',
  level,
  showCrown = false,
  isSpeaking = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-10 h-10', img: 'w-8 h-8', crown: '-top-3 w-5 h-5', badge: 'text-[8px] -bottom-1' },
    md: { container: 'w-14 h-14', img: 'w-11 h-11', crown: '-top-4 w-7 h-7', badge: 'text-[9px] -bottom-1.5' },
    lg: { container: 'w-20 h-20', img: 'w-16 h-16', crown: '-top-5 w-9 h-9', badge: 'text-[10px] -bottom-2' },
    xl: { container: 'w-24 h-24', img: 'w-20 h-20', crown: '-top-6 w-11 h-11', badge: 'text-xs -bottom-2' },
    '2xl': { container: 'w-32 h-32', img: 'w-26 h-26', crown: '-top-8 w-14 h-14', badge: 'text-xs -bottom-2.5' },
  };

  const currentSize = sizeMap[size];
  const isSharmaJiRoyal = frameType === 'royal-dragon-crown' || frameType === 'clan-leader' || showCrown;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${currentSize.container} ${className}`}>
      
      {/* 1. Deluxe Sharma Ji / Royal Crown Top Jewel */}
      {isSharmaJiRoyal && (
        <div className={`absolute z-30 transform -translate-x-1/2 left-1/2 pointer-events-none drop-shadow-[0_4px_12px_rgba(234,179,8,0.9)] animate-bounce ${currentSize.crown}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="royalGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="30%" stopColor="#facc15" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id="rubyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff4b4b" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
            </defs>
            {/* 3D Imperial WePlay Crown */}
            <path
              d="M15,80 L85,80 L80,50 L65,70 L50,30 L35,70 L20,50 Z"
              fill="url(#royalGoldGrad)"
              stroke="#713f12"
              strokeWidth="2.5"
            />
            {/* Jewels on Crown Peaks */}
            <circle cx="50" cy="27" r="6" fill="url(#rubyGlow)" stroke="#fff" strokeWidth="1" />
            <circle cx="20" cy="47" r="4.5" fill="#38bdf8" stroke="#fff" strokeWidth="1" />
            <circle cx="80" cy="47" r="4.5" fill="#38bdf8" stroke="#fff" strokeWidth="1" />
            <circle cx="50" cy="65" r="4" fill="#a855f7" />
          </svg>
        </div>
      )}

      {/* 2. Pro Player Electric Lightning Jewel */}
      {frameType === 'pro-player' && (
        <div className="absolute -top-3 z-20 pointer-events-none px-1.5 py-0.2 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-[10px] font-black text-white shadow-[0_0_12px_rgba(6,182,212,0.9)] border border-cyan-300 animate-pulse">
          ⚡ PRO
        </div>
      )}

      {/* 3. Rookie Starter Badge */}
      {frameType === 'rookie' && (
        <div className="absolute -top-3 z-20 pointer-events-none px-1.5 py-0.2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 text-[9px] font-black text-white shadow-md border border-emerald-300">
          🔰 ROOKIE
        </div>
      )}

      {/* 4. Wolf Night Frame Horns / Moon Claws */}
      {frameType === 'wolf-night' && (
        <div className="absolute -top-3 w-8 h-4 z-20 pointer-events-none flex justify-between px-1">
          <div className="w-2.5 h-3.5 bg-gradient-to-t from-purple-600 to-indigo-300 rounded-t-full transform -rotate-12 shadow-md shadow-purple-500/50" />
          <div className="w-2.5 h-3.5 bg-gradient-to-t from-purple-600 to-indigo-300 rounded-t-full transform rotate-12 shadow-md shadow-purple-500/50" />
        </div>
      )}

      {/* 5. Judge Justice Top Scales Emblem */}
      {frameType === 'judge-justice' && (
        <div className="absolute -top-3.5 z-20 pointer-events-none px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 text-[10px] font-black text-slate-950 shadow-lg border border-yellow-200">
          ⚖️
        </div>
      )}

      {/* 6. Frame Outer Animated Rings */}
      {isSharmaJiRoyal ? (
        <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-spin-slow">
          <div className="w-full h-full rounded-full border-2 border-dashed border-amber-200/80" />
        </div>
      ) : frameType === 'pro-player' ? (
        <div className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-400 shadow-[0_0_18px_rgba(6,182,212,0.8)] animate-pulse">
          <div className="w-full h-full rounded-full border border-cyan-200/70" />
        </div>
      ) : frameType === 'rookie' ? (
        <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-emerald-400 via-teal-500 to-amber-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          <div className="w-full h-full rounded-full border border-emerald-200/50" />
        </div>
      ) : frameType === 'wolf-night' ? (
        <div className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 shadow-[0_0_16px_rgba(168,85,247,0.5)]">
          <div className="w-full h-full rounded-full border border-purple-300/40" />
        </div>
      ) : frameType === 'judge-justice' ? (
        <div className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-blue-500 shadow-[0_0_16px_rgba(234,179,8,0.5)]">
          <div className="w-full h-full rounded-full border border-yellow-300/60" />
        </div>
      ) : frameType === 'cosmic-neon' ? (
        <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 via-cyan-400 to-violet-500 shadow-[0_0_14px_rgba(6,182,212,0.5)] animate-pulse" />
      ) : frameType === 'vip-gold' ? (
        <div className="absolute inset-0 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
      ) : (
        <div className="absolute inset-0 rounded-full p-[1.5px] bg-slate-300" />
      )}

      {/* 5. Speaking Voice Wave Pulse */}
      {isSpeaking && (
        <div className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping opacity-75 pointer-events-none" />
      )}

      {/* 6. Avatar Image */}
      <div className={`relative z-10 rounded-full overflow-hidden bg-[#f5f8ff] border-2 ${
        isSharmaJiRoyal ? 'border-amber-300 shadow-inner' : 'border-slate-200'
      } ${currentSize.img}`}>
        <img
          src={src || 'https://api.dicebear.com/7.x/bottts/svg?seed=ESPPlayer'}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* 7. Level / Crown Badge */}
      {typeof level === 'number' && (
        <span
          className={`absolute z-30 font-black px-1.5 py-0.2 rounded-full shadow-lg ${currentSize.badge} ${
            level >= 90
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border border-yellow-200'
              : level >= 50
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
          }`}
        >
          {level >= 90 ? `👑 ${level}` : `Lv.${level}`}
        </span>
      )}
    </div>
  );
};
