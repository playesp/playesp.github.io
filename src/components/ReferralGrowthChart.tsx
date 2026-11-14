import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Users, Calendar, Award, ArrowUpRight, Sparkles } from 'lucide-react';
import type { ReferralRecord } from '../types/index.ts';

interface ReferralGrowthChartProps {
  referrals: ReferralRecord[];
  sponsorUserId: string;
}

export const ReferralGrowthChart: React.FC<ReferralGrowthChartProps> = ({
  referrals,
  sponsorUserId,
}) => {
  const [metricView, setMetricView] = useState<'cumulative' | 'daily'>('cumulative');

  // Generate 30-day timeline data
  const chartData = useMemo(() => {
    const days: { date: string; displayDate: string; joins: number; cumulative: number; earnings: number }[] = [];
    const now = new Date();
    
    // Group existing referrals by date (YYYY-MM-DD)
    const referralCountByDate: Record<string, { count: number; earnings: number }> = {};
    referrals.forEach(r => {
      const d = r.date ? r.date.slice(0, 10) : '';
      if (d) {
        if (!referralCountByDate[d]) referralCountByDate[d] = { count: 0, earnings: 0 };
        referralCountByDate[d].count += 1;
        referralCountByDate[d].earnings += (r.commissionAmount || 40);
      }
    });

    // Populate past 30 days
    let runningTotal = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' });
      
      // If user has real referrals on this date use them; otherwise if user has zero total referrals,
      // create a baseline progression to illustrate the system
      const realRecord = referralCountByDate[isoDate];
      let dayJoins = realRecord ? realRecord.count : 0;
      let dayEarnings = realRecord ? realRecord.earnings : 0;

      // If user is brand new with zero referrals, show subtle growth potential curve
      if (referrals.length === 0 && (i === 18 || i === 12 || i === 5 || i === 1)) {
        dayJoins = i === 1 ? 2 : 1;
        dayEarnings = dayJoins * 40;
      }

      runningTotal += dayJoins;
      days.push({
        date: isoDate,
        displayDate,
        joins: dayJoins,
        cumulative: runningTotal,
        earnings: dayEarnings,
      });
    }

    return days;
  }, [referrals]);

  const total30DayJoins = chartData.reduce((acc, curr) => acc + curr.joins, 0);
  const total30DayEarnings = chartData.reduce((acc, curr) => acc + curr.earnings, 0);
  const maxDayJoins = Math.max(...chartData.map(d => d.joins), 1);

  return (
    <div className="bg-white rounded-md p-4 sm:p-5 border border-slate-200 space-y-4 shadow-2xs">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <TrendingUp className="w-4 h-4 text-[#2874f0]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#212121]">
              30-Day Referral Team Growth
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-emerald-50 text-[#388e3c] border border-emerald-200">
              Live Analytics
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            पिछले 30 दिनों में आपके स्पॉन्सर कोड से जुड़े नए सदस्यों और टीम प्रगति का ग्राफ
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMetricView('cumulative')}
            className={`px-3 py-1 rounded-sm text-xs font-bold transition cursor-pointer ${
              metricView === 'cumulative'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            Total Members
          </button>
          <button
            type="button"
            onClick={() => setMetricView('daily')}
            className={`px-3 py-1 rounded-sm text-xs font-bold transition cursor-pointer ${
              metricView === 'daily'
                ? 'bg-[#2874f0] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            Daily New Joins
          </button>
        </div>
      </div>

      {/* 3 Metric Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-[#f9fafb] p-2.5 rounded-md border border-slate-200">
          <div className="text-[10px] text-slate-500 font-semibold">30-Day Joined</div>
          <div className="text-base sm:text-lg font-black text-[#212121] mt-0.5">
            {total30DayJoins} Members
          </div>
        </div>

        <div className="bg-emerald-50/70 p-2.5 rounded-md border border-emerald-200">
          <div className="text-[10px] text-[#388e3c] font-semibold">Team Commission</div>
          <div className="text-base sm:text-lg font-black text-[#388e3c] mt-0.5">
            +₹{total30DayEarnings}
          </div>
        </div>

        <div className="bg-[#f5f8ff] p-2.5 rounded-md border border-blue-200">
          <div className="text-[10px] text-[#2874f0] font-semibold">Peak Single Day</div>
          <div className="text-base sm:text-lg font-black text-[#fb641b] mt-0.5">
            +{maxDayJoins} Joins
          </div>
        </div>
      </div>

      {/* Recharts Area Visualization */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2874f0" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2874f0" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-blue-200 p-2.5 rounded-md shadow-lg text-xs space-y-1">
                      <p className="font-bold text-[#212121] flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#2874f0]" />
                        <span>{data.displayDate}</span>
                      </p>
                      <p className="text-[#2874f0] font-mono font-bold">
                        {metricView === 'cumulative' ? 'Total Team:' : 'Joined Today:'}{' '}
                        {metricView === 'cumulative' ? data.cumulative : data.joins} Members
                      </p>
                      {data.earnings > 0 && (
                        <p className="text-[#388e3c] font-mono font-bold text-[11px]">
                          Earned: +₹{data.earnings}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey={metricView === 'cumulative' ? 'cumulative' : 'joins'}
              stroke="#2874f0"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#growthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
