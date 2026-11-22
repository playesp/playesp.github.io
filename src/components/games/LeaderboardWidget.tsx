import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Zap, Coins, RefreshCw, Flame, Calendar, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { AvatarFrame, type FrameVariant } from '../AvatarFrame.tsx';
import { api } from '../../services/api.ts';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly';

export interface LeaderboardUser {
  id: string;
  rank: number;
  userId: string;
  username?: string;
  fullName: string;
  avatar: string;
  frameType: FrameVariant;
  vipTier?: string;
  vipTitle?: string;
  gameLevel: number;
  gameXp: number;
  coins: number;
  charms: number;
  roomAddress?: string;
  isVipRoom?: boolean;
  isOnline?: boolean;
  periodScore?: number;
  periodCoins?: number;
  periodGames?: number;
  periodCharms?: number;
  clanName?: string;
  badge?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardWidgetProps {
  currentUser: UserProfile;
  onOpenPlayerProfile?: (user: LeaderboardUser) => void;
  className?: string;
}

const VIP_STYLE_MAP: Record<string, { badge: string; rowClass: string; textClass: string }> = {
  diamond: {
    badge: '💎 DIAMOND VIP',
    rowClass: 'bg-gradient-to-r from-cyan-50 via-indigo-50 to-purple-50 border-indigo-300 shadow-sm ring-1 ring-cyan-200/70',
    textClass: 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white',
  },
  gold: {
    badge: '👑 GOLD VIP',
    rowClass: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300 shadow-sm',
    textClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  },
  silver: {
    badge: '🛡️ SILVER VIP',
    rowClass: 'bg-gradient-to-r from-slate-50 to-sky-50 border-sky-300',
    textClass: 'bg-slate-600 text-white',
  },
};

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  currentUser,
  onOpenPlayerProfile,
  className = '',
}) => {
  const [period, setPeriod] = useState<LeaderboardPeriod>('daily');
  const [activeTab, setActiveTab] = useState<'coins' | 'players'>('coins');
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async (targetPeriod: LeaderboardPeriod = period) => {
    setLoading(true);
    try {
      const res = await api.getRealLeaderboard(targetPeriod);
      const list = Array.isArray((res as any)?.leaderboard)
        ? (res as any).leaderboard
        : Array.isArray(res?.topEarners)
        ? res.topEarners
        : [];
      if (res?.success && list.length > 0) {
        const mapped: LeaderboardUser[] = list.map((u: any, idx: number) => ({
          id: u.userId,
          rank: idx + 1,
          userId: u.userId,
          username: u.username || '',
          fullName: u.fullName || u.userId,
          avatar:
            u.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.userId)}`,
          frameType: (u.frameType as FrameVariant) || 'standard',
          vipTier: u.vipTier || 'none',
          vipTitle: u.vipTitle || '',
          gameLevel: u.gameLevel || 1,
          gameXp: u.gameXp || (u.gameLevel || 1) * 150,
          coins: u.coins || 0,
          charms: u.charms || 0,
          roomAddress: u.roomAddress || '',
          isVipRoom: Boolean(u.isVipRoom),
          isOnline: Boolean(u.isOnline),
          periodScore: u.periodScore || 0,
          periodCoins: u.periodCoins || 0,
          periodGames: u.periodGames || 0,
          periodCharms: u.periodCharms || 0,
          isCurrentUser:
            (u.userId || '').toLowerCase() === (currentUser.userId || '').toLowerCase(),
        }));
        setPlayers(mapped);
      } else {
        setPlayers([]);
      }
    } catch {
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(period);
  }, [currentUser.userId, period]);

  const sortedList = [...players]
    .sort((a, b) => {
      if (activeTab === 'coins') {
        return (
          (b.periodScore || 0) - (a.periodScore || 0) ||
          b.coins - a.coins ||
          b.charms - a.charms
        );
      }
      return (
        b.gameLevel - a.gameLevel ||
        b.charms - a.charms ||
        (b.periodScore || 0) - (a.periodScore || 0)
      );
    })
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  const podiumTop3 = sortedList.slice(0, 3);
  const remainingList = sortedList.slice(3, 25);

  const periodHeading =
    period === 'daily'
      ? 'आज की लाइव रैंकिंग (Daily Top)'
      : period === 'weekly'
      ? 'इस सप्ताह की रैंकिंग (Weekly Top)'
      : 'इस महीने की रैंकिंग (Monthly Top)';

  const renderVipPill = (vipTier?: string) => {
    if (!vipTier || vipTier === 'none') return null;
    const style = VIP_STYLE_MAP[vipTier];
    if (!style) return null;
    return (
      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide shrink-0 shadow-2xs ${style.textClass}`}>
        {style.badge}
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-2xl text-[#212121] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#1d4ed8] via-[#2874f0] to-[#4f46e5] text-white border-b border-blue-600 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-[#ffe500] drop-shadow" />
              <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                ESP PLAY लाइव रैंकिंग
              </h3>
              <span className="text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-sm uppercase">
                LIVE MEMBERS
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">{periodHeading}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-950/30 p-1 rounded-md border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('coins')}
                className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1 transition cursor-pointer ${
                  activeTab === 'coins'
                    ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Coins & Score</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('players')}
                className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1 transition cursor-pointer ${
                  activeTab === 'players'
                    ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Level & Charms</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => loadLeaderboard(period)}
              className="p-2 rounded-md bg-white/15 hover:bg-white/25 text-white cursor-pointer"
              title="Refresh Live Ranking"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Daily / Weekly / Monthly Period Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/30 p-1 rounded-lg border border-white/15">
          {[
            { id: 'daily' as const, label: '🔥 Daily (दैनिक)', icon: Flame },
            { id: 'weekly' as const, label: '📅 Weekly (साप्ताहिक)', icon: Calendar },
            { id: 'monthly' as const, label: '👑 Monthly (मासिक)', icon: Sparkles },
          ].map((tab) => {
            const active = period === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPeriod(tab.id)}
                className={`py-2 px-2 rounded-md text-[11px] sm:text-xs font-black transition cursor-pointer ${
                  active
                    ? 'bg-white text-[#1d4ed8] shadow-sm'
                    : 'text-blue-100 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6 max-h-[72vh] overflow-y-auto">
        {loading && sortedList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            लाइव रैंकिंग डेटा लोड हो रहा है...
          </div>
        ) : sortedList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-[#f9fafb] rounded-md border border-slate-200">
            अभी कोई खिलाड़ी डेटा उपलब्ध नहीं है।
          </div>
        ) : (
          <>
            {/* Top 3 Podium with VIP Glow & Crown Effects */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 pt-6 pb-4 px-2 rounded-xl bg-gradient-to-b from-indigo-50 via-[#f5f8ff] to-white border border-blue-100 items-end">
              {podiumTop3[1] ? (
                <div
                  onClick={() => onOpenPlayerProfile?.(podiumTop3[1])}
                  className="flex flex-col items-center order-1 cursor-pointer group"
                >
                  <div className="text-xl mb-1">🥈</div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[1].avatar}
                      frameType={podiumTop3[1].frameType}
                      vipTier={podiumTop3[1].vipTier}
                      size="md"
                      showCrown={podiumTop3[1].vipTier === 'diamond' || podiumTop3[1].vipTier === 'gold'}
                    />
                    {podiumTop3[1].isOnline && (
                      <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-700 border border-white text-[10px] font-black text-white shadow">
                      #2
                    </div>
                  </div>
                  <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[95px] sm:max-w-[140px] group-hover:text-[#2874f0]">
                    {podiumTop3[1].fullName}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
                    <span className="text-[10px] text-[#2874f0] font-bold">
                      Lv.{podiumTop3[1].gameLevel}
                    </span>
                    {renderVipPill(podiumTop3[1].vipTier)}
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-[11px] font-mono font-black text-[#2874f0]">
                    {activeTab === 'coins'
                      ? `🪙 ${podiumTop3[1].coins.toLocaleString()}`
                      : `Lv.${podiumTop3[1].gameLevel} • ✨ ${podiumTop3[1].charms}`}
                  </div>
                </div>
              ) : (
                <div className="order-1" />
              )}

              {podiumTop3[0] && (
                <div
                  onClick={() => onOpenPlayerProfile?.(podiumTop3[0])}
                  className="flex flex-col items-center order-2 relative cursor-pointer group"
                >
                  <div className="mb-1 animate-bounce">
                    <Crown className="w-7 h-7 text-amber-500 drop-shadow" />
                  </div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[0].avatar}
                      frameType={podiumTop3[0].frameType}
                      vipTier={podiumTop3[0].vipTier}
                      size="lg"
                      showCrown={true}
                    />
                    {podiumTop3[0].isOnline && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#fb641b] to-amber-500 text-white font-black text-xs shadow border border-white">
                      #1
                    </div>
                  </div>
                  <p className="font-black text-sm text-[#212121] text-center mt-3.5 truncate max-w-[110px] sm:max-w-[155px] group-hover:text-[#2874f0]">
                    {podiumTop3[0].fullName}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
                    <span className="text-[10px] text-[#fb641b] font-black">
                      Lv.{podiumTop3[0].gameLevel}
                    </span>
                    {renderVipPill(podiumTop3[0].vipTier)}
                  </div>
                  <div className="mt-1 px-3 py-1 rounded-sm bg-gradient-to-r from-[#ffe500] to-amber-300 border border-amber-400 text-xs font-mono font-black text-[#212121] shadow-xs">
                    {activeTab === 'coins'
                      ? `🪙 ${podiumTop3[0].coins.toLocaleString()}`
                      : `Lv.${podiumTop3[0].gameLevel} • ✨ ${podiumTop3[0].charms}`}
                  </div>
                </div>
              )}

              {podiumTop3[2] ? (
                <div
                  onClick={() => onOpenPlayerProfile?.(podiumTop3[2])}
                  className="flex flex-col items-center order-3 cursor-pointer group"
                >
                  <div className="text-xl mb-1">🥉</div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[2].avatar}
                      frameType={podiumTop3[2].frameType}
                      vipTier={podiumTop3[2].vipTier}
                      size="md"
                      showCrown={podiumTop3[2].vipTier === 'diamond' || podiumTop3[2].vipTier === 'gold'}
                    />
                    {podiumTop3[2].isOnline && (
                      <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 border border-white text-[10px] font-black text-white shadow">
                      #3
                    </div>
                  </div>
                  <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[95px] sm:max-w-[140px] group-hover:text-[#2874f0]">
                    {podiumTop3[2].fullName}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-0.5">
                    <span className="text-[10px] text-amber-700 font-bold">
                      Lv.{podiumTop3[2].gameLevel}
                    </span>
                    {renderVipPill(podiumTop3[2].vipTier)}
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-sm bg-white border border-amber-200 text-[11px] font-mono font-black text-amber-700">
                    {activeTab === 'coins'
                      ? `🪙 ${podiumTop3[2].coins.toLocaleString()}`
                      : `Lv.${podiumTop3[2].gameLevel} • ✨ ${podiumTop3[2].charms}`}
                  </div>
                </div>
              ) : (
                <div className="order-3" />
              )}
            </div>

            {/* Ranks 4+ with VIP Glow Row Effects */}
            {remainingList.length > 0 && (
              <div className="space-y-2">
                {remainingList.map((item) => {
                  const vipConf = item.vipTier ? VIP_STYLE_MAP[item.vipTier] : undefined;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenPlayerProfile?.(item)}
                      className={`p-2.5 sm:p-3 rounded-lg border transition flex items-center justify-between cursor-pointer ${
                        item.isCurrentUser
                          ? 'bg-emerald-50 border-[#388e3c] ring-1 ring-emerald-200 shadow-xs'
                          : vipConf
                          ? vipConf.rowClass
                          : 'bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="w-7 text-center font-black text-sm text-[#878787] tabular-nums">
                          #{item.rank}
                        </span>
                        <div className="relative">
                          <AvatarFrame
                            src={item.avatar}
                            frameType={item.frameType}
                            vipTier={item.vipTier}
                            size="sm"
                            showCrown={item.vipTier === 'diamond' || item.vipTier === 'gold'}
                          />
                          {item.isOnline && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <p className="text-xs sm:text-sm font-black text-[#212121] truncate">
                              {item.fullName}
                            </p>
                            {item.username && (
                              <span className="text-[10px] font-mono text-slate-500">
                                @{item.username}
                              </span>
                            )}
                            {renderVipPill(item.vipTier)}
                            {item.isCurrentUser && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-[#388e3c] text-white uppercase shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center flex-wrap gap-2 text-[10px] text-[#878787] mt-0.5">
                            <span className="text-[#2874f0] font-black">Lv.{item.gameLevel}</span>
                            <span>•</span>
                            <span className="text-pink-600 font-bold">
                              ✨ {item.charms.toLocaleString()} Charms
                            </span>
                            {item.roomAddress && (
                              <>
                                <span>•</span>
                                <span className={`font-mono font-bold ${item.isVipRoom ? 'text-amber-700' : 'text-slate-600'}`}>
                                  {item.isVipRoom ? '👑' : '🏠'} #{item.roomAddress}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <div className="font-mono font-black text-xs sm:text-sm text-[#fb641b] tabular-nums">
                          {activeTab === 'coins'
                            ? `🪙 ${item.coins.toLocaleString()}`
                            : `✨ ${item.charms.toLocaleString()}`}
                        </div>
                        <span className="text-[10px] text-[#878787] font-semibold">
                          {activeTab === 'coins' ? 'Coins' : `Lv.${item.gameLevel}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
