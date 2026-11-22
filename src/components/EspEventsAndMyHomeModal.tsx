import React, { useEffect, useState } from 'react';
import { X, Trophy, Home, Gift, HeartHandshake, Users, Radio, Crown, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { getRelationshipTokenSpec } from '../config/espSocialCatalog.ts';
import { getFrameByVariant, getVipConfig } from '../config/economy.ts';
import { api } from '../services/api.ts';

interface EspEventsAndMyHomeModalProps {
  user: UserProfile;
  initialTab?: 'my_home' | 'events';
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onOpenRelationships?: () => void;
  onOpenFamily?: () => void;
  onOpenGiftWall?: () => void;
  onJoinMyRoom?: () => void;
}

export const EspEventsAndMyHomeModal: React.FC<EspEventsAndMyHomeModalProps> = ({
  user,
  initialTab = 'my_home',
  onClose,
  onUserUpdated,
  onOpenRelationships,
  onOpenFamily,
  onOpenGiftWall,
  onJoinMyRoom,
}) => {
  const [activeTab, setActiveTab] = useState<'my_home' | 'events'>(initialTab);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const vip = getVipConfig(user.vipTier);
  const frame = getFrameByVariant(user.frameType);
  const acceptedBonds = (user.activeRelationships || []).filter(b => b.status === 'accepted');
  const receivedGiftCount = Object.values(user.receivedGifts || {}).reduce((s, g) => s + (g.count || 0), 0);

  const loadEvents = async () => {
    try {
      const res = await api.getEventsCenter(user.userId);
      if (res.success && Array.isArray(res.events)) {
        setEvents(res.events);
      }
    } catch {}
  };

  useEffect(() => {
    loadEvents();
  }, [user.userId, user.totalCoinsSpent, user.totalGamesWon, user.familyCoinsContributed]);

  const handleClaimEvent = async (eventId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.claimEventReward(user.userId, eventId);
      if (res.user) onUserUpdated(res.user);
      setFeedback(res.message);
      await loadEvents();
    } catch (e: any) {
      setFeedback(e?.message || 'Claim failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-4">
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-fuchsia-700 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-xl">
              {activeTab === 'my_home' ? '🏡' : '🎪'}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {activeTab === 'my_home' ? 'ESP PLAY My Home & Showcase' : 'ESP PLAY Events Center'}
              </h2>
              <p className="text-xs text-purple-100">
                पर्सनल हाउस, VIP फ्रेम, CP/रिलेशनशिप, फैमिली व सीज़नल इवेंट इनाम
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-2.5 bg-slate-950/75 border-b border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('my_home')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'my_home' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Home size={14} /> My Home Showcase
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'events' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Trophy size={14} /> Events Center ({events.filter(e => e.isCompleted && !e.isClaimed).length} Ready)
          </button>
        </div>

        {feedback && (
          <div className="mx-5 mt-4 px-4 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-semibold">
            {feedback}
          </div>
        )}

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'my_home' ? (
            <>
              {/* Hero Estate Card */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-800 via-indigo-950/70 to-purple-950/80 border border-indigo-400/30 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                    alt={user.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-lg"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white truncate">
                      {user.houseName || `${user.fullName} Gaming House`}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 font-mono">
                      ID: {user.userId} {user.username ? `· @${user.username}` : ''} · Room #{user.roomAddress || '10001'}
                    </p>
                    <p className="text-xs text-amber-300 font-semibold mt-1">
                      {vip?.icon || '🎮'} {vip?.name || 'Standard Member'} · 🖼️ {frame.name} · Lv.{user.gameLevel || 1}
                    </p>
                  </div>
                </div>
                {onJoinMyRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onJoinMyRoom();
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio size={14} /> Enter My Room #{user.roomAddress || '10001'}
                  </button>
                )}
              </div>

              {/* 4 Showcase Modules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <HeartHandshake size={14} /> Relationship & CP Bonds
                    </span>
                    <span className="text-xs font-mono font-black text-white tabular-nums">{acceptedBonds.length}</span>
                  </div>
                  {acceptedBonds.length > 0 ? (
                    <div className="space-y-1.5">
                      {acceptedBonds.slice(0, 2).map(b => {
                        const spec = getRelationshipTokenSpec(b.tokenId);
                        return (
                          <div key={b.id} className="text-xs text-slate-200 flex items-center justify-between">
                            <span>
                              {spec.badgeIcon} {spec.tagName} with <strong>{b.partnerName}</strong>
                            </span>
                            <span className="text-[11px] font-mono text-amber-300">{b.intimacyPoints} pts</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">कोई CP या Dost टैग अभी जुड़ा नहीं है।</p>
                  )}
                  {onOpenRelationships && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRelationships();
                      }}
                      className="text-xs font-bold text-rose-300 hover:text-rose-200 cursor-pointer"
                    >
                      Manage Bonds & Tokens ➔
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Users size={14} /> My ESP Family
                    </span>
                    <span className="text-xs font-mono text-emerald-200">{user.familyRole || 'Member'}</span>
                  </div>
                  <p className="text-sm font-black text-white">{user.clanName || 'Royal Warriors ESP'}</p>
                  <p className="text-xs text-slate-400 font-mono tabular-nums">
                    Contributed: 🪙 {(user.familyCoinsContributed || 0).toLocaleString('en-IN')} Coins
                  </p>
                  {onOpenFamily && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFamily();
                      }}
                      className="text-xs font-bold text-emerald-300 hover:text-emerald-200 cursor-pointer"
                    >
                      Open Family & Chat ➔
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Gift size={14} /> Gift Wall & Charms
                    </span>
                    <span className="text-xs font-mono font-black text-amber-200 tabular-nums">{receivedGiftCount} Gifts</span>
                  </div>
                  <p className="text-sm font-black text-white font-mono tabular-nums">
                    ✨ {(user.charms || 0).toLocaleString('en-IN')} Total Charms
                  </p>
                  {onOpenGiftWall && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenGiftWall();
                      }}
                      className="text-xs font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                    >
                      View Gift Wall & History ➔
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Crown size={14} /> Gaming Career
                    </span>
                    <span className="text-xs font-mono text-cyan-200 tabular-nums">Lv.{user.gameLevel || 1}</span>
                  </div>
                  <p className="text-xs text-slate-200 font-mono tabular-nums">
                    Games Won: {user.totalGamesWon || 0} / {user.totalGamesPlayed || 0} · Coins: {(user.coins || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Unlocked Room Tiers: {(user.unlockedRoomTiers || ['normal']).join(', ')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3.5">
              {events.map(ev => {
                const pct = Math.min(100, Math.round(((ev.currentProgress || 0) / Math.max(1, ev.targetValue)) * 100));
                return (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-800/85 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ev.accentGradient} flex items-center justify-center text-2xl shrink-0 shadow`}>
                        {ev.badgeIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-white">{ev.hindiTitle}</h4>
                        <p className="text-xs text-slate-300 mt-0.5">{ev.description}</p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex-1 h-2 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${ev.accentGradient}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono tabular-nums text-slate-300 shrink-0">
                            {ev.currentProgress}/{ev.targetValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-xs font-mono font-black text-amber-300 tabular-nums">
                        +{ev.coinReward} 🪙 · +{ev.xpReward} EXP
                      </span>
                      {ev.isClaimed ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 size={13} /> Claimed
                        </span>
                      ) : ev.isCompleted ? (
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleClaimEvent(ev.id)}
                          className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black cursor-pointer"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 text-xs font-semibold">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
