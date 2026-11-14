import React, { useState } from 'react';
import { 
  Shield, Trophy, Flame, Zap, Coins, Users, Crown, 
  ArrowUpDown, Check, ChevronRight, Star, Sparkles, Award
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';

export interface ClanRecord {
  id: string;
  rank: number;
  name: string;
  emblem: string;
  tag: string;
  leaderName: string;
  leaderAvatar: string;
  memberCount: number;
  maxMembers: number;
  totalEarnings: number; // in INR
  collectiveXp: number;
  clanLevel: number;
  motto: string;
  weeklyDividendPercent: number;
  isOfficial?: boolean;
}

export const TOP_5_CLANS: ClanRecord[] = [
  {
    id: 'clan-royal-warriors',
    rank: 1,
    name: 'Royal Warriors ESP',
    emblem: '🛡️',
    tag: 'ROYAL',
    leaderName: 'Santosh Kumar (Founder)',
    leaderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    memberCount: 49,
    maxMembers: 50,
    totalEarnings: 485000,
    collectiveXp: 382500,
    clanLevel: 15,
    motto: 'Together We Conquer & Earn Limitless',
    weeklyDividendPercent: 15,
    isOfficial: true,
  },
  {
    id: 'clan-grand-emperors',
    rank: 2,
    name: 'Grand Emperor Kings',
    emblem: '👑',
    tag: 'EMPEROR',
    leaderName: 'Sharma Ji VIP Legend',
    leaderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyal',
    memberCount: 48,
    maxMembers: 50,
    totalEarnings: 420500,
    collectiveXp: 341200,
    clanLevel: 14,
    motto: 'Legends Never Rest, Only Collect Charms',
    weeklyDividendPercent: 14,
  },
  {
    id: 'clan-cyber-strikers',
    rank: 3,
    name: 'Cyber Neon Strikers',
    emblem: '⚡',
    tag: 'CYBER',
    leaderName: 'Dev Rathore',
    leaderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior',
    memberCount: 46,
    maxMembers: 50,
    totalEarnings: 360000,
    collectiveXp: 298800,
    clanLevel: 12,
    motto: 'Speed, High Voltage Strategy & Passive Wealth',
    weeklyDividendPercent: 12,
  },
  {
    id: 'clan-phoenix-rising',
    rank: 4,
    name: 'Phoenix Rising India',
    emblem: '🔥',
    tag: 'PHOENIX',
    leaderName: 'Priya Sharma (VIP Host)',
    leaderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EmpressESP',
    memberCount: 45,
    maxMembers: 50,
    totalEarnings: 315000,
    collectiveXp: 265000,
    clanLevel: 11,
    motto: 'Rise From the Flames, Inspire & Earn',
    weeklyDividendPercent: 10,
  },
  {
    id: 'clan-golden-tigers',
    rank: 5,
    name: 'Golden Tiger Syndicate',
    emblem: '🐯',
    tag: 'TIGER',
    leaderName: 'Rajesh Verma',
    leaderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoldenTiger',
    memberCount: 42,
    maxMembers: 50,
    totalEarnings: 275000,
    collectiveXp: 230400,
    clanLevel: 10,
    motto: 'Roar of 10-Service Financial Independence',
    weeklyDividendPercent: 10,
  },
];

interface TopClansDataTableProps {
  currentUser: UserProfile;
  onSelectClan?: (clan: ClanRecord) => void;
  compact?: boolean;
}

export const TopClansDataTable: React.FC<TopClansDataTableProps> = ({
  currentUser,
  onSelectClan,
  compact = false,
}) => {
  const [sortBy, setSortBy] = useState<'earnings' | 'xp'>('earnings');
  const [appliedClanId, setAppliedClanId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [selectedClanModal, setSelectedClanModal] = useState<ClanRecord | null>(null);

  const sortedClans = [...TOP_5_CLANS].sort((a, b) => {
    if (sortBy === 'earnings') {
      return b.totalEarnings - a.totalEarnings;
    }
    return b.collectiveXp - a.collectiveXp;
  });

  const handleApplyToClan = (clan: ClanRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser.clanName === clan.name) {
      setFeedbackToast(`आप पहले से ही "${clan.name}" के सक्रिय सदस्य हैं!`);
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }
    setAppliedClanId(clan.id);
    setFeedbackToast(`आवेदन भेजा गया! ${clan.leaderName} को आपका रिक्वेस्ट प्रेषित हो चुका है।`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-2xs relative overflow-hidden text-[#212121]">
      {/* Header with Title and Sorting Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] flex items-center justify-center text-xl shadow-2xs">
              🏆
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#212121] flex items-center gap-2 flex-wrap">
                <span>Top 5 Clans Leaderboard</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#f5f8ff] text-[#2874f0] border border-blue-200">
                  Hall of Fame
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                शीर्ष 5 क्लैन की कुल टीम कमाई और कलेक्टिव गेमिंग XP का आधिकारिक डाटा
              </p>
            </div>
          </div>
        </div>

        {/* Sort Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setSortBy('earnings')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              sortBy === 'earnings'
                ? 'bg-[#388e3c] text-white font-black shadow-2xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Total Earnings</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy('xp')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              sortBy === 'xp'
                ? 'bg-[#2874f0] text-white font-black shadow-2xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Collective XP</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="my-3 px-4 py-2.5 rounded-sm bg-[#f5f8ff] border border-blue-200 text-[#2874f0] text-xs font-bold text-center animate-fadeIn">
          {feedbackToast}
        </div>
      )}

      {/* Clans Data Table Component */}
      <div className="mt-4 overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="border-b border-slate-200 bg-[#f9fafb] text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              <th className="py-3 px-3 w-16 text-center">Rank</th>
              <th className="py-3 px-3">Clan & Motto</th>
              <th className="py-3 px-3">Leader</th>
              <th className="py-3 px-3 text-center">Members</th>
              <th className="py-3 px-3 text-right">
                <span className={sortBy === 'earnings' ? 'text-[#388e3c] font-black' : ''}>
                  Total Earnings (₹)
                </span>
              </th>
              <th className="py-3 px-3 text-right">
                <span className={sortBy === 'xp' ? 'text-[#2874f0] font-black' : ''}>
                  Collective XP
                </span>
              </th>
              <th className="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {sortedClans.map((clan, index) => {
              const displayRank = index + 1;
              const isFirst = displayRank === 1;
              const isSecond = displayRank === 2;
              const isThird = displayRank === 3;
              const isMyClan = currentUser.clanName === clan.name;

              return (
                <tr
                  key={clan.id}
                  onClick={() => {
                    setSelectedClanModal(clan);
                    if (onSelectClan) onSelectClan(clan);
                  }}
                  className={`group transition cursor-pointer ${
                    isMyClan
                      ? 'bg-[#f5f8ff] hover:bg-blue-50'
                      : 'hover:bg-[#f9fafb]'
                  }`}
                >
                  {/* Rank Column with Badges */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex items-center justify-center">
                      {isFirst ? (
                        <div className="w-8 h-8 rounded-full bg-[#ffe500] text-[#212121] font-black flex items-center justify-center text-xs shadow-xs border border-amber-400">
                          👑 1
                        </div>
                      ) : isSecond ? (
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-[#212121] font-black flex items-center justify-center text-xs shadow-2xs border border-slate-300">
                          🥈 2
                        </div>
                      ) : isThird ? (
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-black flex items-center justify-center text-xs shadow-2xs border border-amber-300">
                          🥉 3
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-sm bg-[#f1f3f6] text-slate-600 font-mono font-bold flex items-center justify-center text-xs border border-slate-300">
                          #{displayRank}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Clan Name & Emblem */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md bg-[#f5f8ff] border border-blue-200 flex items-center justify-center text-2xl shrink-0">
                        {clan.emblem}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-black text-[#212121] text-sm group-hover:text-[#2874f0] transition">
                            {clan.name}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-xs font-mono font-bold bg-[#f5f8ff] text-[#2874f0] border border-blue-200">
                            Lv.{clan.clanLevel}
                          </span>
                          {isMyClan && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-xs font-bold bg-[#388e3c] text-white">
                              Your Clan
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 truncate max-w-[200px]">
                          {clan.motto}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Leader */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center space-x-2">
                      <img
                        src={clan.leaderAvatar}
                        alt={clan.leaderName}
                        className="w-6 h-6 rounded-full border border-slate-300 object-cover bg-[#f1f3f6]"
                      />
                      <span className="text-[#212121] font-medium text-xs truncate max-w-[120px]">
                        {clan.leaderName}
                      </span>
                    </div>
                  </td>

                  {/* Member Capacity */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-[#212121] text-xs">
                        {clan.memberCount} / {clan.maxMembers}
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-[#2874f0] h-full rounded-full"
                          style={{ width: `${(clan.memberCount / clan.maxMembers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Total Member Earnings */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-mono font-black text-sm text-[#388e3c]">
                      ₹{clan.totalEarnings.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-amber-700 font-bold">
                      +{clan.weeklyDividendPercent}% Dividend
                    </div>
                  </td>

                  {/* Collective Clan XP */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="font-mono font-black text-sm text-[#2874f0] flex items-center justify-end space-x-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>{clan.collectiveXp.toLocaleString()} XP</span>
                    </div>
                    <div className="text-[10px] text-slate-500">Total Score</div>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                    {isMyClan ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#388e3c] bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Joined</span>
                      </span>
                    ) : appliedClanId === clan.id ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-sm border border-amber-200">
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleApplyToClan(clan, e)}
                        className="px-3 py-1 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white shadow-2xs transition cursor-pointer"
                      >
                        Join
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Clan Perks Banner */}
      <div className="mt-5 p-3.5 rounded-md bg-[#f5f8ff] border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-white border border-blue-200 text-[#2874f0] flex items-center justify-center text-lg">
            💎
          </div>
          <div>
            <span className="font-black text-[#212121]">Clan Benefits:</span>
            <span className="text-slate-600 ml-1.5">
              Top 3 clans receive an extra 15% Weekly Coin Dividend on all voice room gifts and game wins!
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-[11px] text-[#fb641b] font-bold">Season #4 Ends in: 4d 18h</span>
        </div>
      </div>

      {/* Clan Details Modal */}
      {selectedClanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-md p-6 border border-slate-200 shadow-xl space-y-4 text-[#212121]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{selectedClanModal.emblem}</span>
                <div>
                  <h4 className="text-lg font-black text-[#212121]">{selectedClanModal.name}</h4>
                  <p className="text-xs text-[#2874f0] font-semibold">Level {selectedClanModal.clanLevel} • Rank #{selectedClanModal.rank}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClanModal(null)}
                className="w-8 h-8 rounded-full bg-[#f1f3f6] text-[#212121] hover:bg-slate-200 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f9fafb] p-3 rounded-md border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Clan Leader:</span>
                <span className="font-bold text-[#212121]">{selectedClanModal.leaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Team Earnings:</span>
                <span className="font-bold text-[#388e3c]">₹{selectedClanModal.totalEarnings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Collective Gaming XP:</span>
                <span className="font-bold text-[#2874f0]">{selectedClanModal.collectiveXp.toLocaleString()} XP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Weekly Dividend:</span>
                <span className="font-bold text-amber-700">+{selectedClanModal.weeklyDividendPercent}% Bonus Coins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Members Capacity:</span>
                <span className="font-bold text-[#212121]">{selectedClanModal.memberCount} / {selectedClanModal.maxMembers} Active</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 italic text-center">
              "{selectedClanModal.motto}"
            </div>

            <button
              type="button"
              onClick={(e) => {
                handleApplyToClan(selectedClanModal, e);
                setSelectedClanModal(null);
              }}
              className="w-full py-2.5 rounded-sm font-black text-xs text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-xs cursor-pointer"
            >
              {currentUser.clanName === selectedClanModal.name ? 'Already a Member' : 'Apply to Join Clan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
