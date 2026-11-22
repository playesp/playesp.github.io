import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X } from 'lucide-react';
import type { RoomPacketDrop } from '../types/index.ts';

export interface ActiveGiftAnimation {
  id: string;
  senderName: string;
  senderAvatar?: string;
  recipientName: string;
  giftIcon: string;
  giftName: string;
  quantity: number;
  coinCost: number;
  comboCount?: number;
  contextLabel?: string;
}

interface GiftAnimationOverlayProps {
  animation: ActiveGiftAnimation | null;
  onComplete: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({ animation, onComplete }) => {
  useEffect(() => {
    if (!animation) return;
    const isLuxury = animation.coinCost >= 100 || animation.quantity >= 10 || (animation.comboCount || 1) >= 3;
    try {
      confetti({
        particleCount: isLuxury ? 130 : 75,
        spread: isLuxury ? 110 : 75,
        origin: { y: 0.55 },
        colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#fde047'],
      });
      if (isLuxury) {
        setTimeout(() => {
          confetti({
            particleCount: 65,
            angle: 60,
            spread: 60,
            origin: { x: 0.15, y: 0.65 },
          });
          confetti({
            particleCount: 65,
            angle: 120,
            spread: 60,
            origin: { x: 0.85, y: 0.65 },
          });
        }, 280);
      }
    } catch {
      // ignore confetti error in headless environments
    }

    const timer = setTimeout(() => {
      onComplete();
    }, isLuxury ? 3400 : 2500);
    return () => clearTimeout(timer);
  }, [animation, onComplete]);

  if (!animation) return null;

  const isLuxury = animation.coinCost >= 100 || animation.quantity >= 10;
  const combo = animation.comboCount || 1;

  return (
    <div
      className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center p-4"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto relative max-w-md w-full rounded-2xl overflow-hidden border shadow-2xl p-6 text-center transition-all duration-300 ${
          isLuxury
            ? 'bg-gradient-to-br from-purple-950/95 via-fuchsia-950/95 to-amber-950/95 border-amber-400/80 shadow-amber-500/40'
            : 'bg-gradient-to-br from-slate-900/95 via-indigo-950/95 to-purple-950/95 border-cyan-400/70 shadow-cyan-500/30'
        } backdrop-blur-md text-white animate-bounce`}
        style={{ animationDuration: '1.6s', animationIterationCount: 1 }}
      >
        <button
          type="button"
          onClick={onComplete}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 cursor-pointer"
          aria-label="Close gift banner"
        >
          <X size={14} />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2">
          {animation.contextLabel && (
            <div className="text-[11px] font-bold tracking-wider uppercase text-amber-300 flex items-center gap-1">
              <Sparkles size={13} />
              <span>{animation.contextLabel}</span>
            </div>
          )}
          {combo >= 2 && (
            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-black shadow">
              🔥 COMBO x{combo}
            </span>
          )}
        </div>

        <div className="relative mx-auto w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-tr from-amber-400/25 via-pink-500/25 to-purple-500/25 border border-amber-300/60 shadow-inner mb-3">
          <span className="text-6xl drop-shadow-lg select-none">{animation.giftIcon}</span>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm tabular-nums shadow-lg border border-amber-200/70">
            x{animation.quantity}
          </span>
        </div>

        <h3 className="text-xl font-black tracking-tight text-white">
          {animation.giftName}
        </h3>
        <p className="text-sm text-cyan-200 font-semibold mt-1">
          <span className="text-amber-300 font-bold">{animation.senderName}</span>
          {' '}➔{' '}
          <span className="text-pink-300 font-bold">{animation.recipientName}</span>
        </p>

        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-center gap-3 text-xs text-slate-200 font-mono tabular-nums">
          <span>🪙 {animation.coinCost.toLocaleString('en-IN')} Coins</span>
          <span className="text-white/30">·</span>
          <span className="text-amber-300 font-bold">✨ ESP PLAY Gift Effect</span>
        </div>
      </div>
    </div>
  );
};

interface PacketRainOverlayProps {
  packets: RoomPacketDrop[];
  currentUserId: string;
  onClaimPacket: (packet: RoomPacketDrop) => void;
}

const FALL_COLUMNS = [8, 20, 34, 48, 62, 76, 88];

export const PacketRainOverlay: React.FC<PacketRainOverlayProps> = ({
  packets,
  currentUserId,
  onClaimPacket,
}) => {
  const claimablePackets = (packets || []).filter(
    (p) =>
      p.remainingCoins > 0 &&
      p.claimedBy.length < p.maxClaims &&
      !p.claimedBy.some((c) => c.userId === currentUserId)
  );

  if (claimablePackets.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <style>{`
        @keyframes espPacketFall {
          0% { transform: translateY(-48px) rotate(-6deg); opacity: 0; }
          12% { opacity: 1; }
          50% { transform: translateY(150px) rotate(6deg); }
          88% { opacity: 1; }
          100% { transform: translateY(340px) rotate(-5deg); opacity: 0; }
        }
      `}</style>

      {/* Top Quick Tap Loot Banners */}
      <div className="pointer-events-auto absolute top-14 left-1/2 -translate-x-1/2 z-30 flex flex-wrap justify-center gap-1.5 max-w-[95%]">
        {claimablePackets.slice(0, 2).map((pkt) => {
          const isBlue = pkt.packetType === 'blue';
          return (
            <button
              key={`bar-${pkt.id}`}
              type="button"
              onClick={() => onClaimPacket(pkt)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-black text-white shadow-xl border flex items-center gap-1.5 cursor-pointer animate-bounce transition ${
                isBlue
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 border-cyan-200 shadow-cyan-500/40'
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 border-yellow-300 shadow-rose-500/40'
              }`}
            >
              <span className="text-sm">{isBlue ? '💠' : '🧧'}</span>
              <span>
                {pkt.senderName.split(' ')[0]}: {pkt.remainingCoins} 🪙 लूटें! ({pkt.maxClaims - pkt.claimedBy.length} left)
              </span>
            </button>
          );
        })}
      </div>

      {/* Animated Falling Clickable Packets across the Stage */}
      {claimablePackets.slice(0, 2).flatMap((pkt, pIdx) => {
        const isBlue = pkt.packetType === 'blue';
        return FALL_COLUMNS.map((leftPct, colIdx) => (
          <button
            key={`${pkt.id}-${colIdx}`}
            type="button"
            onClick={() => onClaimPacket(pkt)}
            title={`टैप करके ${isBlue ? 'नीला VIP पैकेट' : 'लाल पैकेट'} लूटें!`}
            style={{
              left: `${(leftPct + pIdx * 5) % 92}%`,
              top: '18px',
              animation: `espPacketFall ${3.2 + (colIdx % 3) * 0.75}s linear ${(colIdx * 0.45) + pIdx * 0.3}s infinite`,
            }}
            className={`pointer-events-auto absolute w-10 h-12 rounded-lg flex flex-col items-center justify-center shadow-lg border cursor-pointer hover:scale-110 transition ${
              isBlue
                ? 'bg-gradient-to-b from-cyan-400 to-blue-700 border-cyan-200 text-white'
                : 'bg-gradient-to-b from-rose-500 to-red-700 border-yellow-300 text-yellow-200'
            }`}
          >
            <span className="text-lg leading-none">{isBlue ? '💠' : '🧧'}</span>
            <span className="text-[8px] font-black tracking-tight mt-0.5">OPEN</span>
          </button>
        ));
      })}
    </div>
  );
};
