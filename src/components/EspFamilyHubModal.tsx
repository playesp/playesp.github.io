import React, { useEffect, useState } from 'react';
import { X, Users, Coins, Send, Gift, UserPlus, LogOut, Plus, Shield } from 'lucide-react';
import type { UserProfile, EspFamily } from '../types/index.ts';
import { FAMILY_EMBLEMS } from '../config/espSocialCatalog.ts';
import { api } from '../services/api.ts';
import { WePlayAppGiftModal, type AppGiftItem } from './games/WePlayAppGiftModal.tsx';
import type { ActiveGiftAnimation } from './GiftAnimationOverlay.tsx';

interface EspFamilyHubModalProps {
  user: UserProfile;
  onClose: () => void;
  onUserUpdated: (user: UserProfile) => void;
  onTriggerGiftAnimation?: (anim: ActiveGiftAnimation) => void;
  onOpenBuyCoins?: () => void;
}

export const EspFamilyHubModal: React.FC<EspFamilyHubModalProps> = ({
  user,
  onClose,
  onUserUpdated,
  onTriggerGiftAnimation,
  onOpenBuyCoins,
}) => {
  const [families, setFamilies] = useState<EspFamily[]>([]);
  const [myFamily, setMyFamily] = useState<EspFamily | null>(null);
  const [activeTab, setActiveTab] = useState<'my_family' | 'directory' | 'create'>(
    user.familyId ? 'my_family' : 'directory'
  );
  const [chatText, setChatText] = useState('');
  const [inviteTarget, setInviteTarget] = useState('');
  const [donateAmt, setDonateAmt] = useState(50);
  const [createForm, setCreateForm] = useState({
    name: '',
    emblem: '👑',
    motto: 'एक साथ खेलें, एक साथ जीतें — ESP PLAY Family!',
  });
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadFamilies = async () => {
    const res = await api.getFamilies();
    if (res.success && Array.isArray(res.families)) {
      setFamilies(res.families);
      if (user.familyId) {
        const mine = res.families.find(f => f.id === user.familyId) || null;
        setMyFamily(mine);
      } else {
        setMyFamily(null);
      }
    }
  };

  useEffect(() => {
    loadFamilies();
  }, [user.familyId]);

  // Live poll Family Chat when inside My Family tab
  useEffect(() => {
    if (!myFamily?.id || activeTab !== 'my_family') return;
    const t = setInterval(async () => {
      try {
        const res = await api.getFamilyDetail(myFamily.id);
        if (res.success && res.family) setMyFamily(res.family);
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [myFamily?.id, activeTab]);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.createFamily(user.userId, createForm.name, createForm.emblem, createForm.motto, true);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.message || 'Family creation failed' });
      } else {
        if (res.user) onUserUpdated(res.user);
        if (res.family) setMyFamily(res.family);
        await loadFamilies();
        setActiveTab('my_family');
        setFeedback({ type: 'ok', text: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async (famId: string) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.joinFamily(famId, user.userId);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.message || 'Join failed' });
      } else {
        if (res.user) onUserUpdated(res.user);
        if (res.family) setMyFamily(res.family);
        await loadFamilies();
        setActiveTab('my_family');
        setFeedback({ type: 'ok', text: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveFamily = async () => {
    if (!myFamily) return;
    setLoading(true);
    try {
      const res = await api.leaveFamily(myFamily.id, user.userId);
      if (res.user) onUserUpdated(res.user);
      setMyFamily(null);
      await loadFamilies();
      setActiveTab('directory');
      setFeedback({ type: 'ok', text: res.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDonateCoins = async (amount: number) => {
    if (!myFamily) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api.donateFamilyCoins(myFamily.id, user.userId, amount);
      if (!res.success) {
        setFeedback({ type: 'err', text: res.message });
      } else {
        if (res.user) onUserUpdated(res.user);
        if (res.family) setMyFamily(res.family);
        setFeedback({ type: 'ok', text: res.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myFamily || !inviteTarget.trim()) return;
    setLoading(true);
    try {
      const res = await api.inviteToFamily(myFamily.id, user.userId, inviteTarget.trim());
      setFeedback({ type: res.success ? 'ok' : 'err', text: res.message });
      if (res.success) setInviteTarget('');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myFamily || !chatText.trim()) return;
    const text = chatText.trim();
    setChatText('');
    const res = await api.sendFamilyChat(myFamily.id, user.userId, text);
    if (res.family) setMyFamily(res.family);
    if (res.user) onUserUpdated(res.user);
  };

  const handleFamilyGiftSend = async (
    gift: AppGiftItem,
    comboCount: number,
    targetName: string,
    _coinsBack: number,
    targetUserId?: string
  ) => {
    if (!myFamily) return;
    try {
      const totalCost = gift.coinCost * comboCount;
      const totalCharms = gift.charmValue * comboCount;
      const res = await api.sendRoomGift(
        user.userId,
        targetName === 'Entire Room (सभी को)' ? `${myFamily.name} Family` : targetName,
        gift.id,
        gift.name,
        totalCost,
        totalCharms,
        gift.icon,
        targetUserId,
        comboCount,
        { context: 'family_chat', familyId: myFamily.id }
      );
      if (res.user) onUserUpdated(res.user);
      setShowGiftModal(false);
      const detail = await api.getFamilyDetail(myFamily.id);
      if (detail.success && detail.family) setMyFamily(detail.family);
      onTriggerGiftAnimation?.({
        id: `fanim-${Date.now()}`,
        senderName: user.fullName,
        senderAvatar: user.avatar,
        recipientName: targetName === 'Entire Room (सभी को)' ? `${myFamily.name} Family` : targetName,
        giftIcon: gift.icon,
        giftName: gift.name,
        quantity: comboCount,
        coinCost: totalCost,
        contextLabel: `${myFamily.emblem} ${myFamily.name} Family Chat Gift`,
      });
    } catch (e: any) {
      setFeedback({ type: 'err', text: e?.message || 'Gift failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden text-white my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-xl shrink-0">
              {myFamily ? myFamily.emblem : '🏰'}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-white truncate">
                {myFamily ? `${myFamily.name} · Family Chat & Treasury` : 'ESP PLAY Family Center'}
              </h2>
              <p className="text-xs text-emerald-100 truncate">
                {myFamily
                  ? `Family ID: ${myFamily.familyCode} · Level ${myFamily.level} · Family Coins: ${myFamily.familyCoins.toLocaleString('en-IN')}`
                  : 'अपनी ESP Family बनाएं, जॉइन करें, Family Coins जमा करें व गिफ्ट इफेक्ट्स भेजें'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-black/30 border border-amber-400/40 text-xs font-mono tabular-nums font-bold text-amber-300">
              🪙 {(user.coins || 0).toLocaleString('en-IN')}
            </span>
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={onOpenBuyCoins}
                className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
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
        <div className="px-5 py-2.5 bg-slate-950/75 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {myFamily && (
            <button
              type="button"
              onClick={() => setActiveTab('my_family')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'my_family'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {myFamily.emblem} My Family Chat & Coins
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🌍 All Families ({families.length})
          </button>
          {!myFamily && (
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 ${
                activeTab === 'create'
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Plus size={13} /> Create Family (200 Coins)
            </button>
          )}
        </div>

        {feedback && (
          <div
            className={`mx-5 mt-3 px-4 py-2 rounded-xl text-xs font-semibold border ${
              feedback.type === 'ok'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="p-5 max-h-[72vh] overflow-y-auto">
          {activeTab === 'my_family' && myFamily && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left 5 Cols: Treasury, Invite & Roster */}
              <div className="lg:col-span-5 space-y-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/70 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">🪙 Family Coins खजाना</span>
                    <span className="text-xs font-mono text-amber-300 font-black">Lv.{myFamily.level}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/80">
                      <p className="text-[11px] text-slate-400">Family Coins</p>
                      <p className="text-lg font-black text-amber-300 font-mono tabular-nums">
                        {myFamily.familyCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80">
                      <p className="text-[11px] text-slate-400">Family Charms</p>
                      <p className="text-lg font-black text-pink-300 font-mono tabular-nums">
                        {myFamily.familyCharms.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[20, 50, 100, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        disabled={loading}
                        onClick={() => handleDonateCoins(amt)}
                        className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 border border-amber-400/40 text-amber-200 text-[11px] font-black font-mono tabular-nums cursor-pointer transition-colors"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={10}
                      value={donateAmt}
                      onChange={e => setDonateAmt(Math.max(10, Number(e.target.value) || 10))}
                      className="w-24 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                    />
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDonateCoins(donateAmt)}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Coins size={13} /> Donate Coins
                    </button>
                  </div>
                </div>

                {/* Invite Friends */}
                <form onSubmit={handleInviteMember} className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-2">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UserPlus size={14} className="text-cyan-400" /> दोस्तों को Family में Invite करें
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteTarget}
                      onChange={e => setInviteTarget(e.target.value)}
                      placeholder="User ID या @username"
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                    >
                      Invite
                    </button>
                  </div>
                </form>

                {/* Members */}
                <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Users size={13} /> Members ({myFamily.members.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleLeaveFamily}
                      className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={12} /> Leave
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {myFamily.members.map(m => (
                      <div key={m.userId} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${m.userId}`}
                            alt={m.fullName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="truncate font-semibold text-slate-100">{m.fullName}</span>
                          {m.role === 'Founder' && <Shield size={11} className="text-amber-400 shrink-0" />}
                        </div>
                        <span className="text-[11px] font-mono text-amber-300 tabular-nums shrink-0">
                          🪙 {m.contributedCoins}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Live Family Chat + Gift Effects */}
              <div className="lg:col-span-7 flex flex-col h-[460px] rounded-2xl bg-slate-950/90 border border-slate-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">💬 {myFamily.name} Family Chat</span>
                  <button
                    type="button"
                    onClick={() => setShowGiftModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-amber-500 text-white text-xs font-black flex items-center gap-1 shadow cursor-pointer"
                  >
                    <Gift size={13} /> Send Family Gift
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                  {myFamily.chatMessages.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-10">
                      फैमिली चैट में पहली बातचीत या गिफ्ट इफेक्ट भेजें!
                    </p>
                  ) : (
                    myFamily.chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs ${
                          msg.isGift
                            ? 'bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-400/50 text-amber-100'
                            : msg.senderId === 'SYSTEM'
                              ? 'bg-slate-800/60 text-cyan-200 border border-slate-700/60'
                              : msg.senderId === user.userId
                                ? 'bg-emerald-900/50 border border-emerald-700/50 text-white ml-6'
                                : 'bg-slate-800/90 border border-slate-700 text-slate-100 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-bold text-[11px] text-amber-300">
                            {msg.senderName}
                            {msg.senderRole && msg.senderRole !== 'Member' ? ` · ${msg.senderRole}` : ''}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">
                          {msg.isGift && msg.giftIcon ? <span className="text-base mr-1">{msg.giftIcon}</span> : null}
                          {msg.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendChat} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGiftModal(true)}
                    className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white cursor-pointer shrink-0"
                    title="Send Gift in Family Chat"
                  >
                    <Gift size={16} />
                  </button>
                  <input
                    type="text"
                    value={chatText}
                    onChange={e => setChatText(e.target.value)}
                    placeholder="फैमिली में संदेश लिखें..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Send size={13} /> Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'directory' && (
            <div className="space-y-4">
              {families.length === 0 ? (
                <div className="p-10 rounded-2xl bg-slate-800/60 border border-slate-700 text-center space-y-3">
                  <div className="text-4xl">🏰</div>
                  <h3 className="text-base font-black text-white">पहली ESP PLAY Family बनाएं!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    अभी कोई फैमिली रजिस्टर्ड नहीं है। केवल 200 Coins चार्टर शुल्क से अपनी फैमिली बनाएं, दोस्तों को जोड़ें, Family Coins बढ़ाएं और लाइव फैमिली गिफ्ट भेजें।
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('create')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black cursor-pointer"
                  >
                    + अपनी ESP Family बनाएं
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {families.map(f => {
                    const isMine = user.familyId === f.id;
                    return (
                      <div key={f.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl shrink-0">
                              {f.emblem}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-white truncate">{f.name}</h4>
                              <p className="text-[11px] text-slate-400 font-mono">
                                ID: {f.familyCode} · Lv.{f.level} · {f.members.length} Members
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-black text-amber-300 tabular-nums shrink-0">
                            🪙 {f.familyCoins.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{f.motto}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/70">
                          <span className="text-[11px] text-slate-400">Founder: {f.founderName}</span>
                          {isMine ? (
                            <button
                              type="button"
                              onClick={() => setActiveTab('my_family')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-black cursor-pointer"
                            >
                              Open Chat
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={loading || Boolean(user.familyId)}
                              onClick={() => handleJoinFamily(f.id)}
                              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold cursor-pointer"
                            >
                              {user.familyId ? 'Leave Current First' : 'Join Family'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <form onSubmit={handleCreateFamily} className="max-w-lg mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Family Emblem (प्रतीक चुनें)</label>
                <div className="flex flex-wrap gap-2">
                  {FAMILY_EMBLEMS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setCreateForm(f => ({ ...f, emblem: em }))}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border cursor-pointer ${
                        createForm.emblem === em
                          ? 'bg-emerald-500/25 border-emerald-400 scale-105'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Family Name (कम से कम 3 अक्षर)</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="जैसे Royal Champions ESP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Family Motto</label>
                <input
                  type="text"
                  value={createForm.motto}
                  onChange={e => setCreateForm(f => ({ ...f, motto: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200 flex items-center justify-between">
                <span>Family Charter निर्माण शुल्क (स्वतः Family Treasury में जुड़ेंगे):</span>
                <strong className="font-mono">🪙 200 Coins</strong>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-sm cursor-pointer"
              >
                {loading ? 'Creating Family...' : '🏰 200 Coins से ESP Family बनाएं'}
              </button>
            </form>
          )}
        </div>
      </div>

      {showGiftModal && myFamily && (
        <WePlayAppGiftModal
          user={user}
          seats={myFamily.members.map((m, idx) => ({
            seatNumber: idx + 1,
            userId: m.userId,
            userName: m.fullName,
            userAvatar: m.avatar,
          }))}
          initialTargetName={`${myFamily.name} Family`}
          onClose={() => setShowGiftModal(false)}
          onSendGift={handleFamilyGiftSend}
          onOpenBuyCoins={onOpenBuyCoins}
        />
      )}
    </div>
  );
};
