import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart3, Copy, Check, MousePointerClick, Share2, TrendingUp } from 'lucide-react';
import type { ReferralRecord, UserProfile, WalletTransaction } from '../types/index.ts';

interface ReferralAnalyticsProps {
  user: UserProfile;
  referrals: ReferralRecord[];
  transactions: WalletTransaction[];
  referralUrl: string;
  onShareLink?: () => void;
}

type TimeRange = '7d' | '30d' | 'all';

export const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({
  user,
  referrals,
  transactions,
  referralUrl,
  onShareLink,
}) => {
  const [range, setRange] = useState<TimeRange>('30d');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const analytics = useMemo(() => {
    const registeredCount = referrals.length;
    const creditedRefs = referrals.filter((r) => r.status === 'credited');
    const pendingRefs = referrals.filter((r) => r.status === 'pending');

    const rawClicks = Number(user.referralClicks || 0);
    // Ensure denominator reflects real clicks while staying >= registered referrals if legacy signups entered sponsor ID directly
    const totalClicks = Math.max(rawClicks, registeredCount);

    const conversionRate =
      totalClicks > 0 ? Math.min(100, (registeredCount / totalClicks) * 100) : 0;
    const activeConversionRate =
      totalClicks > 0 ? Math.min(100, (creditedRefs.length / totalClicks) * 100) : 0;

    const creditedRefSum = creditedRefs.reduce(
      (sum, r) => sum + Number(r.commissionAmount || 0),
      0
    );
    const pendingPipelineAmount = pendingRefs.reduce(
      (sum, r) => sum + Number(r.commissionAmount || 0),
      0
    );
    const referralTxns = transactions.filter((t) => t.type === 'referral_credit');
    const txnSum = referralTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const historicalEarnings = Math.max(
      Number(user.referralEarnings || 0),
      creditedRefSum,
      txnSum
    );

    const avgPerConverted =
      creditedRefs.length > 0 ? Math.round(historicalEarnings / creditedRefs.length) : 0;

    return {
      registeredCount,
      creditedCount: creditedRefs.length,
      pendingCount: pendingRefs.length,
      rawClicks,
      totalClicks,
      conversionRate,
      activeConversionRate,
      historicalEarnings,
      pendingPipelineAmount,
      avgPerConverted,
      referralTxns,
    };
  }, [referrals, transactions, user.referralClicks, user.referralEarnings]);

  // Build historical referral earnings & conversion chart points
  const chartData = useMemo(() => {
    const dayEarningsMap: Record<string, { earnings: number; conversions: number; clicks: number }> = {};

    // 1. Seed clicks from recorded referralClickHistory
    (user.referralClickHistory || []).forEach((item) => {
      const key = (item.date || '').slice(0, 10);
      if (!key) return;
      if (!dayEarningsMap[key]) dayEarningsMap[key] = { earnings: 0, conversions: 0, clicks: 0 };
      dayEarningsMap[key].clicks += Number(item.count || 0);
    });

    // 2. Seed referral records (date + commission)
    referrals.forEach((r) => {
      const key = (r.date || '').slice(0, 10);
      if (!key) return;
      if (!dayEarningsMap[key]) dayEarningsMap[key] = { earnings: 0, conversions: 0, clicks: 0 };
      dayEarningsMap[key].conversions += 1;
      if (r.status === 'credited') {
        dayEarningsMap[key].earnings += Number(r.commissionAmount || 0);
      }
      if (dayEarningsMap[key].clicks < dayEarningsMap[key].conversions) {
        dayEarningsMap[key].clicks = dayEarningsMap[key].conversions;
      }
    });

    // 3. Reconcile any referral_credit wallet transactions whose dates aren't covered by ReferralRecord
    const refDatesWithCredit = new Set(
      referrals.filter((r) => r.status === 'credited').map((r) => (r.date || '').slice(0, 10))
    );
    analytics.referralTxns.forEach((t) => {
      const key = (t.date || '').slice(0, 10);
      if (!key) return;
      if (!dayEarningsMap[key]) dayEarningsMap[key] = { earnings: 0, conversions: 0, clicks: 0 };
      if (!refDatesWithCredit.has(key)) {
        dayEarningsMap[key].earnings += Number(t.amount || 0);
      }
    });

    if (range === 'all') {
      const monthMap = new Map<string, { label: string; earnings: number; conversions: number; clicks: number }>();
      Object.entries(dayEarningsMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([isoDate, vals]) => {
          const monthKey = isoDate.slice(0, 7); // YYYY-MM
          const dt = new Date(`${monthKey}-01T00:00:00`);
          const label = Number.isNaN(dt.getTime())
            ? monthKey
            : dt.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          const ex = monthMap.get(monthKey) || { label, earnings: 0, conversions: 0, clicks: 0 };
          ex.earnings += vals.earnings;
          ex.conversions += vals.conversions;
          ex.clicks += vals.clicks;
          monthMap.set(monthKey, ex);
        });
      return Array.from(monthMap.values());
    }

    const numDays = range === '7d' ? 7 : 30;
    const now = new Date();
    const series: Array<{ label: string; earnings: number; conversions: number; clicks: number }> = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      const vals = dayEarningsMap[iso] || { earnings: 0, conversions: 0, clicks: 0 };
      series.push({
        label,
        earnings: vals.earnings,
        conversions: vals.conversions,
        clicks: vals.clicks,
      });
    }
    return series;
  }, [referrals, analytics.referralTxns, user.referralClickHistory, range]);

  // Historical earnings chronological ledger (newest first with running cumulative balance)
  const earningsLedger = useMemo(() => {
    const entries: Array<{
      id: string;
      date: string;
      memberName: string;
      memberId: string;
      serviceCode: string;
      status: 'credited' | 'pending' | 'rejected';
      amount: number;
    }> = referrals.map((r) => ({
      id: r.id,
      date: (r.date || '').slice(0, 10),
      memberName: r.downlineName,
      memberId: r.downlineUserId,
      serviceCode: r.serviceCode,
      status: r.status,
      amount: Number(r.commissionAmount || 0),
    }));

    entries.sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    const withCumulative = entries.map((e) => {
      if (e.status === 'credited') running += e.amount;
      return { ...e, cumulative: running };
    });
    return withCumulative.reverse().slice(0, 8);
  }, [referrals]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const hasAnyActivity =
    analytics.totalClicks > 0 || analytics.registeredCount > 0 || analytics.historicalEarnings > 0;

  return (
    <section
      aria-label="Referral Analytics"
      className="bg-white rounded-md p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5"
    >
      {/* Header + Timeframe Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2874f0] shrink-0" />
            <h3 className="text-sm sm:text-base font-extrabold text-[#212121] tracking-tight">
              Referral Analytics &amp; Historical Earnings
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            Conversion Rate = Registered Referrals / Total Link Clicks · Tracked live across your sponsor link
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#f1f3f6] rounded-md border border-slate-200 shrink-0 self-start sm:self-auto">
          {(
            [
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setRange(item.id)}
              className={`px-3 py-1.5 min-h-[34px] rounded text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                range === item.id
                  ? 'bg-white text-[#2874f0] shadow-2xs'
                  : 'text-slate-600 hover:text-[#212121]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Column Flat Metrics Grid with Hairline Dividers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Conversion Rate</p>
          <p className="text-2xl sm:text-3xl font-black text-[#2874f0] font-mono tabular-nums">
            {analytics.conversionRate.toFixed(1)}%
          </p>
          <p className="text-[11px] text-slate-500 tabular-nums">
            {analytics.registeredCount} registered / {analytics.totalClicks} clicks
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Total Link Clicks</p>
          <p className="text-2xl sm:text-3xl font-black text-[#212121] font-mono tabular-nums">
            {analytics.totalClicks.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 tabular-nums">
            {analytics.rawClicks > 0
              ? `${analytics.rawClicks} tracked ?ref= visits`
              : 'Via sponsor ID & referral URL'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Registered Referrals</p>
          <p className="text-2xl sm:text-3xl font-black text-[#212121] font-mono tabular-nums">
            {analytics.registeredCount}
          </p>
          <p className="text-[11px] text-slate-600 tabular-nums">
            <span className="text-[#388e3c] font-bold">{analytics.creditedCount} credited</span>
            <span aria-hidden="true"> · </span>
            <span className="text-amber-700 font-semibold">{analytics.pendingCount} pending</span>
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500">Historical Referral Earnings</p>
          <p className="text-2xl sm:text-3xl font-black text-[#388e3c] font-mono tabular-nums">
            ₹{analytics.historicalEarnings.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 tabular-nums">
            {analytics.pendingPipelineAmount > 0
              ? `+₹${analytics.pendingPipelineAmount} pending approval`
              : analytics.avgPerConverted > 0
              ? `Avg ₹${analytics.avgPerConverted} / conversion`
              : 'Credited directly to wallet'}
          </p>
        </div>
      </div>

      {/* Conversion Funnel Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-[#212121]">
            Click-to-Conversion Funnel
          </span>
          <span className="font-mono font-bold text-[#388e3c] tabular-nums">
            Paid Conversion: {analytics.activeConversionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-[#388e3c] h-full transition-all duration-500"
            style={{ width: `${analytics.activeConversionRate}%` }}
            title={`Credited: ${analytics.creditedCount}`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{
              width: `${Math.max(0, analytics.conversionRate - analytics.activeConversionRate)}%`,
            }}
            title={`Pending: ${analytics.pendingCount}`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 tabular-nums">
          <span>Total Clicks: {analytics.totalClicks} (100%)</span>
          <span>·</span>
          <span className="text-[#388e3c] font-semibold">
            Credited Conversions: {analytics.creditedCount}
          </span>
          <span>·</span>
          <span className="text-amber-700 font-semibold">
            Pending Review: {analytics.pendingCount}
          </span>
        </div>
      </div>

      {/* Historical Referral Earnings Chart OR Clean Empty State */}
      {!hasAnyActivity ? (
        <div className="py-8 px-4 text-center bg-[#f9fafb] rounded-md border border-slate-200 space-y-3">
          <MousePointerClick className="w-9 h-9 text-[#2874f0] mx-auto" />
          <div className="space-y-1 max-w-md mx-auto">
            <p className="text-sm font-bold text-[#212121]">
              No referral clicks or earnings recorded yet
            </p>
            <p className="text-xs text-slate-600">
              Share your sponsor referral link to start tracking visitor clicks, conversion rate, and historical referral income here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyUrl}
              className="px-4 py-2 min-h-[40px] rounded-sm bg-[#2874f0] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Referral Link Copied' : 'Copy Referral Link'}</span>
            </button>
            {onShareLink && (
              <button
                type="button"
                onClick={onShareLink}
                className="px-4 py-2 min-h-[40px] rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#212121] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#388e3c]" />
              <span>Historical Referral Earnings (₹)</span>
            </span>
            <span className="text-slate-500 tabular-nums">
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Monthly overview'}
            </span>
          </div>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={range === '30d' ? 4 : 0}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-slate-200 p-2.5 rounded-md shadow-lg text-xs space-y-1">
                          <p className="font-bold text-[#212121]">{d.label}</p>
                          <p className="font-mono font-bold text-[#388e3c] tabular-nums">
                            Earnings: ₹{d.earnings}
                          </p>
                          <p className="font-mono text-[#2874f0] tabular-nums">
                            Registered: {d.conversions} · Clicks: {d.clicks}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="earnings"
                  fill="#2874f0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Referral Earnings Log Table */}
          {earningsLedger.length > 0 && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-[#212121]">
                Recent Historical Referral Earnings
              </h4>
              <div className="overflow-x-auto rounded border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#f9fafb] border-b border-slate-200 text-[10px] text-slate-600 uppercase">
                      <th className="py-2.5 px-3 font-bold">Date</th>
                      <th className="py-2.5 px-3 font-bold">Referred Member</th>
                      <th className="py-2.5 px-3 font-bold">Plan</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                      <th className="py-2.5 px-3 font-bold text-right">Commission</th>
                      <th className="py-2.5 px-3 font-bold text-right">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {earningsLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-[#f5f8ff] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                          {row.date || '-'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#212121] truncate max-w-[160px]">
                          {row.memberName}{' '}
                          <span className="font-mono text-[10px] text-slate-500">
                            ({row.memberId})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{row.serviceCode}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[11px] font-bold ${
                              row.status === 'credited'
                                ? 'text-[#388e3c]'
                                : row.status === 'rejected'
                                ? 'text-rose-600'
                                : 'text-amber-700'
                            }`}
                          >
                            {row.status === 'credited'
                              ? 'Credited'
                              : row.status === 'rejected'
                              ? 'Rejected'
                              : 'Pending'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#388e3c] tabular-nums whitespace-nowrap">
                          +₹{row.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#212121] tabular-nums whitespace-nowrap">
                          ₹{row.cumulative.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
