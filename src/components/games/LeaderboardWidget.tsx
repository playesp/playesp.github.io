import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Zap, Coins, RefreshCw } from 'lucide-react';
import type { UserProfile } from '../../types/index.ts';
import { AvatarFrame, type FrameVariant } from '../AvatarFrame.tsx';
import { api } from '../../services/api.ts';

export interface LeaderboardUser {
  id: string;
  rank: number;
  userId: string;
  fullName: string;
  avatar: string;
  frameType: FrameVariant;
  vipTier?: string;
  gameLevel: number;
  gameXp: number;
  coins: number;
  charms: number;
  clanName?: string;
  badge?: string;
  isCurrentUser?: boolean;
}

interface LeaderboardWidgetProps {
  currentUser: UserProfile;
  onOpenPlayerProfile?: (user: LeaderboardUser) => void;
  className?: string;
}

export const LeaderboardWidget: React.FC<LeaderboardWidgetProps> = ({
  currentUser,
  onOpenPlayerProfile,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'coins' | 'players'>('coins');
  const [players, setPlayers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getRealLeaderboard();
      if (res?.success && Array.isArray(res.topEarners)) {
        const mapped: LeaderboardUser[] = res.topEarners.map((u, idx) => ({
          id: u.userId,
          rank: idx + 1,
          userId: u.userId,
          fullName: u.fullName || u.userId,
          avatar:
            u.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.userId)}`,
          frameType: (u.frameType as FrameVariant) || 'standard',
          vipTier: u.vipTier,
          gameLevel: u.gameLevel || 1,
          gameXp: (u.gameLevel || 1) * 100,
          coins: u.coins || 0,
          charms: u.charms || 0,
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
    loadLeaderboard();
  }, [currentUser.userId]);

  const sortedList = [...players]
    .sort((a, b) =>
      activeTab === 'coins'
        ? b.coins - a.coins || b.charms - a.charms
        : b.gameLevel - a.gameLevel || b.charms - a.charms
    )
    .map((p, idx) => ({ ...p, rank: idx + 1 }));

  const podiumTop3 = sortedList.slice(0, 3);
  const remainingList = sortedList.slice(3, 10);

  return (
    <div
      className={`bg-white rounded-md border border-slate-200 shadow-lg text-[#212121] overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 bg-[#2874f0] text-white border-b border-blue-600">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-[#ffe500]" />
            <h3 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
              <span>लीडरबोर्ड रैंकिंग (Live Real Players)</span>
            </h3>
          </div>
          <p className="text-xs text-blue-100 mt-0.5">
            केवल वास्तविक रजिस्टर्ड खिलाड़ियों की असली Coins, Level और Charms रैंकिंग
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-blue-700/60 p-1 rounded-sm border border-blue-400/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('coins')}
              className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1.5 transition cursor-pointer ${
                activeTab === 'coins'
                  ? 'bg-[#ffe500] text-[#212121] shadow-xs'
                  : 'text-blue-100 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Coins</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('players')}
              className={`px-3 py-1.5 rounded-sm font-black text-xs flex items-center space-x-1.5 transition cursor-pointer ${
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
            onClick={loadLeaderboard}
            className="p-2 rounded-sm bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {loading && sortedList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            लीडरबोर्ड डेटा लोड हो रहा है...
          </div>
        ) : sortedList.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-[#f9fafb] rounded-md border border-slate-200">
            अभी कोई खिलाड़ी डेटा उपलब्ध नहीं है।
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 pt-6 pb-4 px-2 rounded-md bg-[#f5f8ff] border border-blue-100 items-end">
              {podiumTop3[1] ? (
                <div
                  onClick={() => onOpenPlayerProfile?.(podiumTop3[1])}
                  className="flex flex-col items-center order-1 cursor-pointer"
                >
                  <div className="text-xl mb-1">🥈</div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[1].avatar}
                      frameType={podiumTop3[1].frameType}
                      vipTier={podiumTop3[1].vipTier}
                      size="md"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-600 border border-white text-[10px] font-black text-white shadow">
                      #2
                    </div>
                  </div>
                  <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[90px] sm:max-w-[130px]">
                    {podiumTop3[1].fullName}
                  </p>
                  <span className="text-[10px] text-[#878787] font-semibold">
                    Lv {podiumTop3[1].gameLevel}
                  </span>
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
                  className="flex flex-col items-center order-2 relative cursor-pointer"
                >
                  <div className="mb-1">
                    <Crown className="w-7 h-7 text-amber-500" />
                  </div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[0].avatar}
                      frameType={podiumTop3[0].frameType}
                      vipTier={podiumTop3[0].vipTier}
                      size="lg"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#fb641b] text-white font-black text-xs shadow border border-white">
                      #1
                    </div>
                  </div>
                  <p className="font-black text-sm text-[#212121] text-center mt-3.5 truncate max-w-[110px] sm:max-w-[150px]">
                    {podiumTop3[0].fullName}
                  </p>
                  <span className="text-[10px] text-[#fb641b] font-bold">
                    Lv {podiumTop3[0].gameLevel}
                  </span>
                  <div className="mt-1 px-3 py-1 rounded-sm bg-[#ffe500] border border-amber-400 text-xs font-mono font-black text-[#212121] shadow-xs">
                    {activeTab === 'coins'
                      ? `🪙 ${podiumTop3[0].coins.toLocaleString()}`
                      : `Lv.${podiumTop3[0].gameLevel} • ✨ ${podiumTop3[0].charms}`}
                  </div>
                </div>
              )}

              {podiumTop3[2] ? (
                <div
                  onClick={() => onOpenPlayerProfile?.(podiumTop3[2])}
                  className="flex flex-col items-center order-3 cursor-pointer"
                >
                  <div className="text-xl mb-1">🥉</div>
                  <div className="relative">
                    <AvatarFrame
                      src={podiumTop3[2].avatar}
                      frameType={podiumTop3[2].frameType}
                      vipTier={podiumTop3[2].vipTier}
                      size="md"
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-700 border border-white text-[10px] font-black text-white shadow">
                      #3
                    </div>
                  </div>
                  <p className="font-black text-xs text-[#212121] text-center mt-3 truncate max-w-[90px] sm:max-w-[130px]">
                    {podiumTop3[2].fullName}
                  </p>
                  <span className="text-[10px] text-[#878787] font-semibold">
                    Lv {podiumTop3[2].gameLevel}
                  </span>
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

            {/* Ranks 4+ */}
            {remainingList.length > 0 && (
              <div className="space-y-2">
                {remainingList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenPlayerProfile?.(item)}
                    className={`p-2.5 sm:p-3 rounded-sm border transition flex items-center justify-between cursor-pointer ${
                      item.isCurrentUser
                        ? 'bg-emerald-50 border-[#388e3c] ring-1 ring-emerald-200 shadow-xs'
                        : 'bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-7 text-center font-black text-sm text-[#878787]">
                        #{item.rank}
                      </span>
                      <AvatarFrame
                        src={item.avatar}
                        frameType={item.frameType}
                        vipTier={item.vipTier}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs sm:text-sm font-black text-[#212121] truncate">
                            {item.fullName}
                          </p>
                          {item.isCurrentUser && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm bg-[#388e3c] text-white uppercase shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-[#878787]">
                          <span className="text-[#2874f0] font-bold">Lv {item.gameLevel}</span>
                          <span>•</span>
                          <span className="text-pink-600 font-medium">
                            ✨ {item.charms.toLocaleString()} Charms
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="font-mono font-black text-xs sm:text-sm text-[#fb641b]">
                        🪙 {item.coins.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-[#878787]">Coins</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
