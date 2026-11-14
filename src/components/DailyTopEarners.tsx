import React, { useState } from 'react';
import { Trophy, TrendingUp, Sparkles, Crown, Zap, Flame, Award, ChevronRight } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

export interface DailyTopEarnerRecord {
  rank: number;
  name: string;
  userId: string;
  avatar: string;
  servicePlan: string;
  dailyEarnings: number;
  streakDays: number;
  badge: string;
  tagColor: string;
  isOwner?: boolean;
}

export const MOCK_DAILY_TOP_EARNERS: DailyTopEarnerRecord[] = [
  {
    rank: 1,
    name: 'SANTOSH KUMAR',
    userId: 'EMO-MOM-MMO',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    servicePlan: 'EMO Master (₹100)',
    dailyEarnings: 3850,
    streakDays: 45,
    badge: '👑 Founder & #1 Earner',
    tagColor: 'from-amber-400 to-yellow-500',
    isOwner: true,
  },
  {
    rank: 2,
    name: 'SHARMA JI VIP',
    userId: 'SHARMA-JI-VIP',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyal',
    servicePlan: 'MMS Legend (₹100)',
    dailyEarnings: 2920,
    streakDays: 32,
    badge: '🔥 Emperor Grand Master',
    tagColor: 'from-slate-300 to-slate-400',
  },
  {
    rank: 3,
    name: 'PRIYA SHARMA',
    userId: 'ESP10PS02',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EmpressESP',
    servicePlan: 'Promote & Earn (₹50)',
    dailyEarnings: 2150,
    streakDays: 28,
    badge: '⚡ Phoenix Host Leader',
    tagColor: 'from-amber-600 to-amber-700',
  },
  {
    rank: 4,
    name: 'DEV RATHORE',
    userId: 'ESP10DR03',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior',
    servicePlan: 'TWI Team Work (₹100)',
    dailyEarnings: 1680,
    streakDays: 19,
    badge: '💎 Cyber Top Striker',
    tagColor: 'from-cyan-500 to-blue-600',
  },
  {
    rank: 5,
    name: 'VIKAS KUMAR',
    userId: 'ESP10VK04',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpeedRacer',
    servicePlan: 'Refer & Earn (₹100)',
    dailyEarnings: 1340,
    streakDays: 14,
    badge: '⭐ Senior Promoter',
    tagColor: 'from-emerald-500 to-teal-600',
  },
];

interface DailyTopEarnersProps {
  currentUser: UserProfile;
}

export const DailyTopEarners: React.FC<DailyTopEarnersProps> = ({ currentUser }) => {
  const [activePeriod, setActivePeriod] = useState<'today' | 'week'>('today');

  const earners = MOCK_DAILY_TOP_EARNERS.map(e => ({
    ...e,
    dailyEarnings: activePeriod === 'week' ? e.dailyEarnings * 5.5 : e.dailyEarnings,
  }));

  return (
    <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2 flex-wrap">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-md bg-[#ffe500] flex items-center justify-center text-[#212121] font-black shadow-xs">
            🏆
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#212121] flex items-center gap-1.5 flex-wrap">
              <span>Daily Top Earners Leaderboard</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#f5f8ff] text-[#2874f0] border border-blue-200 font-bold">
                Live Top 5
              </span>
            </h3>
            <p className="text-[10px] text-slate-600">
              आज के शीर्ष कमाई करने वाले मेंबर्स की लाइव रैंकिंग
            </p>
          </div>
        </div>

        {/* Toggle Period */}
        <div className="flex items-center bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActivePeriod('today')}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
              activePeriod === 'today'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod('week')}
            className={`px-2.5 py-1 rounded-sm text-[11px] font-bold transition cursor-pointer ${
              activePeriod === 'week'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Top 5 Earners List */}
      <div className="space-y-2">
        {earners.map((earner) => {
          const isMe = earner.userId.toLowerCase() === currentUser.userId.toLowerCase();

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
              {/* Left: Rank & Avatar & Info */}
              <div className="flex items-center space-x-3">
                {/* Rank Badge */}
                <div className="w-7 text-center shrink-0">
                  {earner.rank === 1 ? (
                    <span className="w-7 h-7 rounded-full bg-[#ffe500] text-[#212121] font-black text-xs flex items-center justify-center shadow-xs border border-amber-300">
                      👑 1
                    </span>
                  ) : earner.rank === 2 ? (
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-[#212121] font-black text-[11px] flex items-center justify-center border border-slate-300">
                      🥈 2
                    </span>
                  ) : earner.rank === 3 ? (
                    <span className="w-6 h-6 rounded-full bg-[#fb641b] text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                      🥉 3
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-slate-500">
                      #{earner.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <img
                  src={earner.avatar}
                  alt={earner.name}
                  className="w-9 h-9 rounded-full object-cover bg-white border border-slate-300 shrink-0"
                />

                {/* Info */}
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-[#212121] truncate max-w-[140px] sm:max-w-[200px]">
                      {earner.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-sm font-bold bg-emerald-100 text-[#388e3c] border border-emerald-200">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                    <span className="font-mono text-[#2874f0] font-semibold">{earner.userId}</span>
                    <span>•</span>
                    <span className="truncate max-w-[120px]">{earner.servicePlan}</span>
                  </div>
                </div>
              </div>

              {/* Right: Daily Earnings */}
              <div className="text-right shrink-0">
                <div className="font-mono font-black text-sm text-[#388e3c]">
                  ₹{Math.round(earner.dailyEarnings).toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] font-bold text-[#fb641b] flex items-center justify-end space-x-1 mt-0.5">
                  <Flame className="w-3 h-3 text-[#fb641b] shrink-0" />
                  <span>{earner.streakDays}d Streak</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Footer / User Position */}
      <div className="bg-[#f5f8ff] p-3 rounded-md border border-blue-200 flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#2874f0] shrink-0" />
          <span className="text-slate-700">
            आपकी स्थिति: <strong className="text-[#212121]">Rank #8</strong> • टॉप 5 में आने के लिए ₹320 और कमाएं
          </span>
        </div>
        <span className="text-[10px] text-[#388e3c] font-bold bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200 shrink-0">
          Daily Reset 12 AM
        </span>
      </div>
    </div>
  );
};
