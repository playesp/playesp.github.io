import React, { useState } from 'react';
import { X, HeartHandshake, ShoppingBag, Send, Check, Trash2, Coins, Search, Sparkles } from 'lucide-react';
import type { UserProfile, RelationshipBond } from '../types/index.ts';
import { RELATIONSHIP_TOKENS, getRelationshipTokenSpec } from '../config/espSocialCatalog.ts';
import { api } from '../services/api.ts';

interface RelationshipBondsModalProps {
  user: UserProfile;
  initialTargetIdentifier?: string;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onOpenBuyCoins?: () => void;
}

export const RelationshipBondsModal: React.FC<RelationshipBondsModalProps> = ({
  user,
  initialTargetIdentifier = '',
  onClose,
  onUserUpdated,
  onOpenBuyCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'bonds' | 'store' | 'connect'>(
    initialTargetIdentifier ? 'connect' : 'bonds'
  );
  const [selectedTokenId, setSelectedTokenId] = useState<string>('rel_bestie');
  const [targetIdentifier, setTargetIdentifier] = useState<string>(initialTargetIdentifier);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const ownedTokens = user.ownedRelationshipTokens || [];
  const allBonds: RelationshipBond[] = user.activeRelationships || [];
  const acceptedBonds = allBonds.filter(b => b.status === 'accepted');
  const incomingRequests = allBonds.filter(b => b.status === 'pending_incoming');
  const outgoingRequests = allBonds.filter(b => b.status === 'pending_outgoing');

  const handleBuyToken = async (tokenId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.buyRelationshipToken(user.userId, tokenId);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.message || 'टोकन खरीद असफल' });
      } else {
        if (res.user) onUserUpdated(res.user);
        setFeedback({ type: 'ok', text: res.message });
      }
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Error purchasing token' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPlayers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.searchUsersByUsername(searchQuery.trim(), user.userId);
      if (res.success && Array.isArray(res.users)) {
        setSearchResults(res.users.filter((u: any) => u.userId !== user.userId));
      }
    } catch {
      setSearchResults([]);
    }
  };

  const handleSendBondRequest = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!targetIdentifier.trim()) {
      setFeedback({ type: 'err', text: 'कृपया पार्टनर प्लेयर का User ID या @username दर्ज करें।' });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.requestRelationshipBond(user.userId, targetIdentifier.trim(), selectedTokenId);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.message || 'प्रस्ताव नहीं भेजा जा सका' });
      } else {
        if (res.user) onUserUpdated(res.user);
        setFeedback({ type: 'ok', text: res.message });
        setTargetIdentifier('');
        setActiveTab('bonds');
      }
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Error sending request' });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bondId: string, action: 'accept' | 'reject') => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.respondRelationshipBond(user.userId, bondId, action);
      if (res.user) onUserUpdated(res.user);
      setFeedback({ type: res.success ? 'ok' : 'err', text: res.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bondId: string) => {
    setLoading(true);
    try {
      const res = await api.removeRelationshipBond(user.userId, bondId);
      if (res.user) onUserUpdated(res.user);
      setFeedback({ type: 'ok', text: res.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-fuchsia-700 to-purple-800 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-xl shrink-0">
              💍
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black tracking-tight text-white truncate">
                ESP PLAY Relationship & CP Bonds
              </h2>
              <p className="text-xs text-rose-100 truncate">
                दो खिलाड़ियों के बीच प्रीमियम रिलेशनशिप टैग (Bestie, Bro, Sis, Mentor, Soulmate, Royal CP)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-black/30 border border-amber-400/40 text-xs font-mono tabular-nums font-bold text-amber-300 flex items-center gap-1.5">
              <Coins size={14} />
              <span>{(user.coins || 0).toLocaleString('en-IN')}</span>
            </div>
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={onOpenBuyCoins}
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer whitespace-nowrap"
              >
                + Buy
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Strip */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'bonds', label: `💞 My Bonds (${acceptedBonds.length})`, badge: incomingRequests.length },
            { id: 'store', label: `🛍️ Token Store (${ownedTokens.length} Owned)` },
            { id: 'connect', label: '💌 Send Bond Request' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setFeedback(null);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black tabular-nums">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mx-5 mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold border ${
              feedback.type === 'ok'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Tab Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {activeTab === 'bonds' && (
            <div className="space-y-5">
              {/* Incoming Proposals */}
              {incomingRequests.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2.5">
                    आए हुए रिलेशनशिप प्रस्ताव ({incomingRequests.length})
                  </h3>
                  <div className="space-y-2.5">
                    {incomingRequests.map(req => {
                      const spec = getRelationshipTokenSpec(req.tokenId);
                      return (
                        <div
                          key={req.id}
                          className="p-3.5 rounded-xl bg-slate-800/80 border border-amber-400/40 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={req.partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${req.partnerUserId}`}
                              alt={req.partnerName}
                              className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
                            />
                            <div>
                              <p className="text-sm font-bold text-white">
                                {req.partnerName}{' '}
                                <span className="text-xs text-slate-400 font-mono">
                                  ({req.partnerUsername ? `@${req.partnerUsername}` : req.partnerUserId})
                                </span>
                              </p>
                              <p className="text-xs text-amber-200 mt-0.5">
                                {spec.badgeIcon} {spec.hindiName} प्रस्ताव भेजा है
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleRespond(req.id, 'accept')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleRespond(req.id, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Active Accepted Bonds */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HeartHandshake size={16} className="text-rose-400" />
                    सक्रिय रिलेशनशिप व CP टैग ({acceptedBonds.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('connect')}
                    className="text-xs font-bold text-cyan-300 hover:text-cyan-200 cursor-pointer"
                  >
                    + नया टैग जोड़ें
                  </button>
                </div>

                {acceptedBonds.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/80 text-center space-y-3">
                    <div className="text-4xl">💞</div>
                    <p className="text-sm font-bold text-slate-200">अभी कोई सक्रिय रिलेशनशिप या CP टैग नहीं जुड़ा है</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Token Store से Bestie, Bro, Sis, Mentor, Soulmate या Royal CP टोकन चुनें और अपने खास दोस्त को टैग भेजें!
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('store')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black cursor-pointer"
                      >
                        🛍️ टोकन स्टोर देखें
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('connect')}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                      >
                        💌 टैग भेजें
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {acceptedBonds.map(bond => {
                      const spec = getRelationshipTokenSpec(bond.tokenId);
                      return (
                        <div
                          key={bond.id}
                          className={`rounded-2xl p-4 bg-gradient-to-br ${spec.gradient} text-white shadow-lg relative overflow-hidden`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-black tracking-wide uppercase bg-black/25 px-2.5 py-1 rounded-md">
                              {spec.badgeIcon} {spec.tagName}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemove(bond.id)}
                              className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white/80 cursor-pointer"
                              title="Remove bond"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`}
                              alt={user.fullName}
                              className="w-11 h-11 rounded-full object-cover border-2 border-white/80"
                            />
                            <span className="text-xl">{spec.badgeIcon}</span>
                            <img
                              src={bond.partnerAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${bond.partnerUserId}`}
                              alt={bond.partnerName}
                              className="w-11 h-11 rounded-full object-cover border-2 border-white/80"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-black truncate">{bond.partnerName}</p>
                              <p className="text-[11px] text-white/85 font-mono truncate">
                                {bond.partnerUsername ? `@${bond.partnerUsername}` : bond.partnerUserId}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-mono tabular-nums text-white/90">
                            <span>✨ Intimacy: {bond.intimacyPoints.toLocaleString('en-IN')}</span>
                            <span>{new Date(bond.createdAt).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Outgoing Pending */}
              {outgoingRequests.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-2">
                    भेजे गए प्रस्ताव (स्वीकृति प्रतीक्षित — {outgoingRequests.length})
                  </p>
                  <div className="space-y-2">
                    {outgoingRequests.map(out => (
                      <div key={out.id} className="px-3.5 py-2.5 rounded-xl bg-slate-800/60 flex items-center justify-between text-xs">
                        <span>
                          {out.badgeIcon} <strong>{out.tagName}</strong> ➔ {out.partnerName} ({out.partnerUserId})
                        </span>
                        <span className="text-amber-300 font-semibold">Pending</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-300">
                  हर रिलेशनशिप टैग का अलग टोकन व कॉइन मूल्य है। एक बार टोकन खरीदकर या सीधे प्रस्ताव भेजते समय उपयोग करें।
                </p>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  Owned Tokens: {ownedTokens.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {RELATIONSHIP_TOKENS.map(token => {
                  const ownedQty = ownedTokens.filter(id => id === token.id).length;
                  return (
                    <div
                      key={token.id}
                      className="rounded-2xl bg-slate-800/90 border border-slate-700 overflow-hidden flex flex-col justify-between"
                    >
                      <div className={`bg-gradient-to-r ${token.gradient} p-3.5 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{token.badgeIcon}</span>
                          <div>
                            <h4 className="text-sm font-black text-white">{token.tagName}</h4>
                            <p className="text-[11px] text-white/90">{token.hindiName}</p>
                          </div>
                        </div>
                        {ownedQty > 0 && (
                          <span className="px-2 py-0.5 rounded bg-black/35 text-[10px] font-bold text-white tabular-nums">
                            x{ownedQty} Owned
                          </span>
                        )}
                      </div>

                      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-300 leading-relaxed">{token.perks}</p>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/70">
                          <span className="text-sm font-black text-amber-300 font-mono tabular-nums">
                            🪙 {token.coinPrice}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleBuyToken(token.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                            >
                              <ShoppingBag size={12} /> Buy
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTokenId(token.id);
                                setActiveTab('connect');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                            >
                              Use
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'connect' && (
            <form onSubmit={handleSendBondRequest} className="space-y-4">
              {/* Token Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  1. रिलेशनशिप टोकन चुनें (Token Type)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {RELATIONSHIP_TOKENS.map(token => {
                    const ownedQty = ownedTokens.filter(id => id === token.id).length;
                    const active = selectedTokenId === token.id;
                    return (
                      <button
                        key={token.id}
                        type="button"
                        onClick={() => setSelectedTokenId(token.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          active
                            ? `bg-gradient-to-br ${token.gradient} border-white text-white shadow-lg`
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{token.badgeIcon}</span>
                          <span className="text-[11px] font-mono font-bold tabular-nums">
                            {ownedQty > 0 ? `Owned (${ownedQty})` : `${token.coinPrice}c`}
                          </span>
                        </div>
                        <p className="text-xs font-black mt-1">{token.tagName}</p>
                        <p className="text-[10px] opacity-85 truncate">{token.hindiName}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Player Search Helper */}
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700 space-y-2.5">
                <label className="block text-xs font-bold text-slate-300">
                  2. पार्टनर प्लेयर खोजें या User ID / @username लिखें
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="नाम, User ID या @username से खोजें..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSearchPlayers}
                    className="px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Search size={13} /> Search
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto divide-y divide-slate-700/60 bg-slate-900/90 rounded-lg border border-slate-700">
                    {searchResults.slice(0, 6).map(p => (
                      <button
                        key={p.userId}
                        type="button"
                        onClick={() => setTargetIdentifier(p.userId)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img src={p.avatar} alt={p.fullName} className="w-7 h-7 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {p.userId} {p.username ? `· @${p.username}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-cyan-300">Select</span>
                      </button>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={targetIdentifier}
                  onChange={e => setTargetIdentifier(e.target.value)}
                  placeholder="Selected User ID (जैसे ESPGTRK01) या @username"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-purple-500/50 text-sm text-white font-mono focus:border-purple-400 outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-300">
                  {ownedTokens.includes(selectedTokenId) ? (
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <Sparkles size={13} /> आपके बैग में 1 टोकन मौजूद है (0 Coins कटेंगे)
                    </span>
                  ) : (
                    <span className="font-mono">
                      शुल्क:{' '}
                      <strong className="text-amber-300">
                        {getRelationshipTokenSpec(selectedTokenId).coinPrice} Coins
                      </strong>
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-600 to-purple-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Send size={14} /> {loading ? 'Sending...' : 'प्रस्ताव भेजें'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
