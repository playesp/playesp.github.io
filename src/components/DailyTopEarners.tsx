import React, { useState, useEffect } from 'react';
import { Trophy, Sparkles, RefreshCw } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';
import { getVipConfig } from '../config/economy.ts';

export interface DailyTopEarnerRecord {
  rank: number;
  name: string;
  userId: string;
  avatar: string;
  servicePlan: string;
  coins: number;
  charms: number;
  gameLevel: number;
  vipTier?: string;
}

interface DailyTopEarnersProps {
  currentUser: UserProfile;
}

export const DailyTopEarners: React.FC<DailyTopEarnersProps> = ({ currentUser }) => {
  const [earners, setEarners] = useState<DailyTopEarnerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.getRealLeaderboard();
      if (res?.success && Array.isArray(res.topEarners)) {
        const mapped: DailyTopEarnerRecord[] = res.topEarners.slice(0, 5).map((u, idx) => ({
          rank: idx + 1,
          name: u.fullName || u.userId,
          userId: u.userId,
          avatar:
            u.avatar ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.userId)}`,
          servicePlan: u.chosenServiceCode || 'ESP',
          coins: u.coins || 0,
          charms: u.charms || 0,
          gameLevel: u.gameLevel || 1,
          vipTier: u.vipTier,
        }));
        setEarners(mapped);
      } else {
        setEarners([]);
      }
    } catch {
      setEarners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const myIndex = earners.findIndex(
    (e) => (e.userId || '').toLowerCase() === (currentUser?.userId || '').toLowerCase()
  );

  return (
    <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2 flex-wrap">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-[#ffe500] flex items-center justify-center text-[#212121] font-black shadow-xs">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#212121] flex items-center gap-1.5 flex-wrap">
              <span>Live Top Players Leaderboard</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f5f8ff] text-[#2874f0] border border-blue-200 font-bold">
                100% REAL DATA
              </span>
            </h3>
            <p className="text-[10px] text-slate-600">
              प्लेटफ़ॉर्म के वास्तविक सक्रिय सदस्यों की लाइव रैंकिंग (Coins, Level & Charms)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadLeaderboard}
          disabled={loading}
          className="px-2.5 py-1 rounded-sm bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 text-[11px] font-bold text-[#212121] flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Real Players List */}
      {loading && earners.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">लाइव रैंकिंग लोड हो रही है...</div>
      ) : earners.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 bg-[#f9fafb] rounded-md border border-slate-200">
          अभी कोई सक्रिय रैंकिंग डेटा उपलब्ध नहीं है। रियल टास्क पूरे करके सबसे पहले शीर्ष स्थान पाएं!
        </div>
      ) : (
        <div className="space-y-2">
          {earners.map((earner) => {
            const isMe =
              (earner.userId || '').toLowerCase() === (currentUser?.userId || '').toLowerCase();
            const vipCfg = getVipConfig(earner.vipTier);

            return (
              <div
                key={earner.userId}
                className={`p-3 rounded-md border transition flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-emerald-50 border-emerald-300'
                    : earner.rank === 1
                    ? 'bg-amber-50/60 border-amber-300'
                    : 'bg-[#f9fafb] hover:bg-[#f5f8ff] border-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 text-center shrink-0">
                    {earner.rank === 1 ? (
                      <span className="w-7 h-7 rounded-full bg-[#ffe500] text-[#212121] font-black text-xs flex items-center justify-center shadow-xs border border-amber-300">
                        1
                      </span>
                    ) : earner.rank === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-[#212121] font-black text-[11px] flex items-center justify-center border border-slate-300">
                        2
                      </span>
                    ) : earner.rank === 3 ? (
                      <span className="w-6 h-6 rounded-full bg-[#fb641b] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-500">
                        #{earner.rank}
                      </span>
                    )}
                  </div>

                  <img
                    src={earner.avatar}
                    alt={earner.name}
                    className="w-9 h-9 rounded-full object-cover bg-white border border-slate-300 shrink-0"
                  />

                  <div>
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[#212121] truncate max-w-[140px] sm:max-w-[200px]">
                        {earner.name}
                      </span>
                      {vipCfg && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-black bg-amber-100 text-amber-800 border border-amber-300">
                          {vipCfg.badgeText}
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-emerald-100 text-[#388e3c] border border-emerald-200">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-mono text-[#2874f0] font-semibold">
                        {earner.userId}
                      </span>
                      <span>•</span>
                      <span>Lv {earner.gameLevel}</span>
                      <span>•</span>
                      <span>Plan: {earner.servicePlan}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-sm text-[#fb641b]">
                    🪙 {earner.coins.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-bold text-pink-600 mt-0.5">
                    ✨ {earner.charms.toLocaleString()} Charms
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User Summary Footer */}
      <div className="bg-[#f5f8ff] p-3 rounded-md border border-blue-200 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#2874f0] shrink-0" />
          <span className="text-slate-700">
            आपकी स्थिति:{' '}
            <strong className="text-[#212121]">
              {myIndex >= 0 ? `Top #${myIndex + 1}` : 'Top 5 से बाहर'}
            </strong>{' '}
            • कॉइन्स: <strong className="text-[#fb641b]">🪙 {currentUser.coins || 0}</strong> • लेवल:{' '}
            <strong className="text-[#2874f0]">Lv {currentUser.gameLevel || 1}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
