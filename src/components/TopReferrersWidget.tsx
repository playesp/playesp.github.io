import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Share2, Users, Crown, Award } from 'lucide-react';
import type { TopReferrerEntry, UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

interface TopReferrersWidgetProps {
  currentUser: UserProfile;
  onShareLink?: () => void;
}

function getNetworkTier(conversions: number): {
  title: string;
  nextGoal: number | null;
  colorClass: string;
} {
  if (conversions >= 25) {
    return { title: 'Diamond Legend', nextGoal: null, colorClass: 'text-indigo-700' };
  }
  if (conversions >= 10) {
    return { title: 'Elite Ambassador', nextGoal: 25, colorClass: 'text-[#fb641b]' };
  }
  if (conversions >= 5) {
    return { title: 'Growth Captain', nextGoal: 10, colorClass: 'text-[#2874f0]' };
  }
  if (conversions >= 3) {
    return { title: 'Team Builder', nextGoal: 5, colorClass: 'text-[#388e3c]' };
  }
  if (conversions >= 1) {
    return { title: 'Network Scout', nextGoal: 3, colorClass: 'text-amber-700' };
  }
  return { title: 'Starter', nextGoal: 1, colorClass: 'text-slate-500' };
}

export const TopReferrersWidget: React.FC<TopReferrersWidgetProps> = ({
  currentUser,
  onShareLink,
}) => {
  const [topReferrers, setTopReferrers] = useState<TopReferrerEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<TopReferrerEntry | null>(null);
  const [totalRankedUsers, setTotalRankedUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTopReferrers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getTopReferrers(currentUser.userId);
      if (res?.success && Array.isArray(res.topReferrers)) {
        setTopReferrers(res.topReferrers.slice(0, 5));
        setCurrentUserRank(res.currentUserRank || null);
        setTotalRankedUsers(res.totalRankedUsers || res.topReferrers.length);
      } else {
        setTopReferrers([]);
      }
    } catch {
      setTopReferrers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser.userId]);

  useEffect(() => {
    loadTopReferrers();
  }, [loadTopReferrers, currentUser.referralEarnings]);

  const myConversions = currentUserRank?.convertedReferrals ?? 0;
  const myTier = getNetworkTier(myConversions);
  const fifthPlaceConversions =
    topReferrers.length >= 5 ? topReferrers[4].convertedReferrals : 1;
  const conversionsToTop5 = Math.max(1, fifthPlaceConversions - myConversions + 1);
  const tierProgressPct = myTier.nextGoal
    ? Math.min(100, Math.round((myConversions / myTier.nextGoal) * 100))
    : 100;

  return (
    <section
      aria-label="Top Referrers Leaderboard"
      className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2 flex-wrap">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center font-black shadow-xs shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Top 5 Referrers
            </h3>
            <p className="text-xs text-slate-600">
              Ranked by verified referral conversions &amp; network growth milestones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadTopReferrers}
          disabled={loading}
          className="px-3 py-1.5 min-h-[36px] rounded-sm bg-[#f1f3f6] hover:bg-slate-200 border border-slate-300 text-xs font-bold text-[#212121] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Top 5 Rows */}
      {loading && topReferrers.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          Loading Top 5 Referrers...
        </div>
      ) : topReferrers.length === 0 ? (
        <div className="py-8 px-4 text-center bg-[#f9fafb] rounded-md border border-slate-200 space-y-2">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            No referral conversions recorded yet. Invite your first member to claim #1 on the Top Referrers board.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {topReferrers.map((entry) => {
            const isMe = entry.userId.toLowerCase() === currentUser.userId.toLowerCase();
            const tier = getNetworkTier(entry.convertedReferrals);

            return (
              <div
                key={entry.userId}
                className={`py-3 px-2 sm:px-3 flex items-center justify-between gap-3 rounded-sm transition-colors ${
                  isMe ? 'bg-[#f5f8ff]' : 'hover:bg-[#f9fafb]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Medal */}
                  <div className="w-7 text-center shrink-0">
                    {entry.rank === 1 ? (
                      <span
                        title="Rank #1"
                        className="w-7 h-7 rounded-full bg-[#ffe500] text-[#212121] font-black text-xs inline-flex items-center justify-center border border-amber-300 shadow-2xs"
                      >
                        1
                      </span>
                    ) : entry.rank === 2 ? (
                      <span
                        title="Rank #2"
                        className="w-6 h-6 rounded-full bg-slate-200 text-[#212121] font-black text-[11px] inline-flex items-center justify-center border border-slate-300"
                      >
                        2
                      </span>
                    ) : entry.rank === 3 ? (
                      <span
                        title="Rank #3"
                        className="w-6 h-6 rounded-full bg-[#fb641b] text-white font-black text-[11px] inline-flex items-center justify-center"
                      >
                        3
                      </span>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-500 tabular-nums">
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[#2874f0]/10 border border-slate-200 flex items-center justify-center text-xs font-extrabold text-[#2874f0] overflow-hidden shrink-0">
                    {entry.avatar ? (
                      <img
                        src={entry.avatar}
                        alt={entry.fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      entry.fullName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Member Identity + Unboxed Metadata */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#212121] truncate max-w-[140px] sm:max-w-[200px]">
                        {entry.fullName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-extrabold text-[#2874f0]">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate tabular-nums">
                      <span className={`font-bold ${tier.colorClass}`}>{tier.title}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">
                        {entry.username ? `@${entry.username}` : entry.userId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.conversionRate.toFixed(0)}% conv.</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Score & Earnings */}
                <div className="text-right shrink-0 tabular-nums">
                  <div className="text-xs sm:text-sm font-black text-[#212121] font-mono">
                    {entry.convertedReferrals}{' '}
                    <span className="font-sans font-semibold text-slate-600 text-[11px]">
                      {entry.convertedReferrals === 1 ? 'conversion' : 'conversions'}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-[#388e3c]">
                    ₹{entry.referralEarnings.toLocaleString()} earned
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gamification Rank & Tier Milestone Tracker */}
      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Award className="w-4 h-4 text-[#fb641b] shrink-0" />
            <span className="text-slate-700 tabular-nums">
              Your Rank:{' '}
              <strong className="text-[#212121]">
                {currentUserRank ? `#${currentUserRank.rank} of ${totalRankedUsers}` : 'Unranked'}
              </strong>{' '}
              · Tier: <strong className={myTier.colorClass}>{myTier.title}</strong>
              {currentUserRank && currentUserRank.rank > 5 && (
                <span> · {conversionsToTop5} more conversions to enter Top 5</span>
              )}
            </span>
          </div>

          {onShareLink && (
            <button
              type="button"
              onClick={onShareLink}
              className="px-3.5 py-2 min-h-[36px] rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Invite &amp; Climb Rank</span>
            </button>
          )}
        </div>

        {/* Tier Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
            <span>
              {myTier.nextGoal
                ? `Next Tier Milestone: ${myConversions} / ${myTier.nextGoal} conversions`
                : 'Highest Referral Tier Achieved (Diamond Legend)'}
            </span>
            <span className="font-mono font-bold text-[#2874f0]">{tierProgressPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#2874f0] via-[#fb641b] to-[#388e3c] transition-all duration-500"
              style={{ width: `${Math.max(4, tierProgressPct)}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
