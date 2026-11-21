import React, { useState, useEffect } from 'react';
import { Coins, Zap, Check, RefreshCw } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { api } from '../services/api.ts';

export interface ClanRecord {
  id: string;
  rank: number;
  name: string;
  emblem: string;
  leaderName: string;
  memberCount: number;
  totalLevel: number;
  totalCharms: number;
}

interface TopClansDataTableProps {
  currentUser: UserProfile;
  onSelectClan?: (clan: ClanRecord) => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  compact?: boolean;
}

export const TopClansDataTable: React.FC<TopClansDataTableProps> = ({
  currentUser,
  onSelectClan,
  onUpdateUser,
}) => {
  const [sortBy, setSortBy] = useState<'charms' | 'level'>('charms');
  const [clans, setClans] = useState<ClanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningClan, setJoiningClan] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [selectedClanModal, setSelectedClanModal] = useState<ClanRecord | null>(null);

  const loadClans = async () => {
    setLoading(true);
    try {
      const res = await api.getRealClans();
      if (res?.success && Array.isArray(res.clans)) {
        const mapped: ClanRecord[] = res.clans.map((c, idx) => ({
          id: `clan-${idx}-${c.name}`,
          rank: idx + 1,
          name: c.name,
          emblem: idx === 0 ? '👑' : idx === 1 ? '🛡️' : '⚡',
          leaderName: c.leaderName || 'Founder',
          memberCount: c.membersCount || 0,
          totalLevel: c.totalLevel || 0,
          totalCharms: c.totalCharms || 0,
        }));
        setClans(mapped);
      } else {
        setClans([]);
      }
    } catch {
      setClans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClans();
  }, []);

  const sortedClans = [...clans].sort((a, b) => {
    if (sortBy === 'charms') return b.totalCharms - a.totalCharms;
    return b.totalLevel - a.totalLevel;
  });

  const handleJoinClan = async (clan: ClanRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser.clanName === clan.name) {
      setFeedbackToast(`आप पहले से ही "${clan.name}" के सदस्य हैं!`);
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }
    setJoiningClan(clan.id);
    try {
      const res = await api.updateUserProfile(currentUser.userId, { clanName: clan.name });
      if (res?.success && res.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
      setFeedbackToast(`✅ आप सफलतापूर्वक "${clan.name}" क्लैन में शामिल हो गए!`);
      await loadClans();
    } catch (err: any) {
      setFeedbackToast(err?.message || 'क्लैन जॉइन करने में समस्या हुई।');
    } finally {
      setJoiningClan(null);
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-2xs relative overflow-hidden text-[#212121]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-md bg-[#ffe500] flex items-center justify-center text-xl shadow-2xs">
            🛡️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#212121] flex items-center gap-2 flex-wrap">
              <span>Live Real Community Clans</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#f5f8ff] text-[#2874f0] border border-blue-200">
                100% REAL MEMBERS
              </span>
            </h3>
            <p className="text-[11px] text-slate-600">
              असली सदस्यों से बने कम्युनिटी क्लैन और उनके वास्तविक चार्म्स व लेवल
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-[#f1f3f6] p-1 rounded-sm border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setSortBy('charms')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              sortBy === 'charms'
                ? 'bg-[#388e3c] text-white font-black shadow-2xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Total Charms</span>
          </button>

          <button
            type="button"
            onClick={() => setSortBy('level')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              sortBy === 'level'
                ? 'bg-[#2874f0] text-white font-black shadow-2xs'
                : 'text-slate-600 hover:text-[#212121]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Combined Level</span>
          </button>

          <button
            type="button"
            onClick={loadClans}
            className="p-1.5 rounded-sm bg-white border border-slate-300 text-slate-600 hover:text-[#2874f0] cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedbackToast && (
        <div className="my-3 px-4 py-2.5 rounded-sm bg-[#f5f8ff] border border-blue-200 text-[#2874f0] text-xs font-bold text-center animate-fadeIn">
          {feedbackToast}
        </div>
      )}

      {loading && sortedClans.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500">क्लैन लिस्ट लोड हो रही है...</div>
      ) : sortedClans.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 bg-[#f9fafb] rounded-md border border-slate-200 mt-4">
          अभी कोई क्लैन डेटा उपलब्ध नहीं है। प्रोफाइल सेक्शन से अपना क्लैन चुनें!
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f9fafb] text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                <th className="py-3 px-3 w-16 text-center">Rank</th>
                <th className="py-3 px-3">Clan Name</th>
                <th className="py-3 px-3">Top Member</th>
                <th className="py-3 px-3 text-center">Real Members</th>
                <th className="py-3 px-3 text-right">Total Charms</th>
                <th className="py-3 px-3 text-right">Total Level</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {sortedClans.map((clan, index) => {
                const displayRank = index + 1;
                const isMyClan = currentUser.clanName === clan.name;
                return (
                  <tr
                    key={clan.id}
                    onClick={() => {
                      setSelectedClanModal(clan);
                      onSelectClan?.(clan);
                    }}
                    className={`group transition cursor-pointer ${
                      isMyClan ? 'bg-[#f5f8ff] hover:bg-blue-50' : 'hover:bg-[#f9fafb]'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-black">#{displayRank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{clan.emblem}</span>
                        <span className="font-black text-[#212121]">{clan.name}</span>
                        {isMyClan && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-xs font-bold bg-[#388e3c] text-white">
                            Your Clan
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{clan.leaderName}</td>
                    <td className="py-3 px-3 text-center font-bold">{clan.memberCount}</td>
                    <td className="py-3 px-3 text-right font-mono font-black text-pink-600">
                      ✨ {clan.totalCharms.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-[#2874f0]">
                      Lv.{clan.totalLevel.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {isMyClan ? (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#388e3c] bg-emerald-50 px-2.5 py-1 rounded-sm border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>Joined</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={joiningClan === clan.id}
                          onClick={(e) => handleJoinClan(clan, e)}
                          className="px-3 py-1 rounded-sm text-xs font-bold bg-[#2874f0] hover:bg-[#1e60d5] text-white shadow-2xs transition cursor-pointer"
                        >
                          {joiningClan === clan.id ? '...' : 'Join'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedClanModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-md p-6 border border-slate-200 shadow-xl space-y-4 text-[#212121]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedClanModal.emblem}</span>
                <div>
                  <h4 className="text-lg font-black text-[#212121]">{selectedClanModal.name}</h4>
                  <p className="text-xs text-[#2874f0] font-semibold">
                    Real Members: {selectedClanModal.memberCount}
                  </p>
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
                <span className="text-slate-600">Top Member:</span>
                <span className="font-bold">{selectedClanModal.leaderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Real Members Count:</span>
                <span className="font-bold">{selectedClanModal.memberCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Combined Charms:</span>
                <span className="font-bold text-pink-600">
                  ✨ {selectedClanModal.totalCharms.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Combined Levels:</span>
                <span className="font-bold text-[#2874f0]">
                  Lv.{selectedClanModal.totalLevel.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                handleJoinClan(selectedClanModal, e);
                setSelectedClanModal(null);
              }}
              className="w-full py-2.5 rounded-sm font-black text-xs text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-xs cursor-pointer"
            >
              {currentUser.clanName === selectedClanModal.name ? 'Already Joined' : 'Join Clan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
