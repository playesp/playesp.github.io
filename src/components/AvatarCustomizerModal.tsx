import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X, Check, Sparkles, Crown, Coins, Lock, ShoppingBag, ShieldCheck, Zap, UserCheck, Crop
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { AvatarFrame, type FrameVariant } from './AvatarFrame.tsx';
import { FacebookPhotoCropModal } from './FacebookPhotoCropModal.tsx';
import {
  FRAME_CATALOG,
  VIP_TIERS,
  getFrameByVariant,
  getVipConfig,
  type FrameCatalogItem,
  type VipTierConfig,
} from '../config/economy.ts';
import { api } from '../services/api.ts';

export interface PredefinedAvatar {
  id: string;
  name: string;
  category: string;
  url: string;
  tag: string;
}

export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  {
    id: 'cyber-bot',
    name: 'Cyber Neon Bot',
    category: 'Gamer',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior',
    tag: '⚡ Gamer',
  },
  {
    id: 'crown-king',
    name: 'Royal Crown Gamer',
    category: 'VIP',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoyalCrownESP',
    tag: '👑 Royal',
  },
  {
    id: 'krishna-divine',
    name: 'Celestial Flute',
    category: 'Divine',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=KrishnaDivineESP',
    tag: '🪈 Divine',
  },
  {
    id: 'spy-master',
    name: "Spy Detective",
    category: 'Game',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpyMasterESP',
    tag: '🕵️ Spy',
  },
  {
    id: 'werewolf-alpha',
    name: 'Werewolf Alpha',
    category: 'Game',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlphaWerewolf',
    tag: '🐺 Wolf',
  },
  {
    id: 'royal-queen',
    name: 'Royal Empress',
    category: 'VIP',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EmpressESP',
    tag: '👸 Queen',
  },
  {
    id: 'speed-racer',
    name: 'Turbo Racer',
    category: 'Arcade',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpeedRacer',
    tag: '🏎️ Turbo',
  },
  {
    id: 'espplay-gamer',
    name: 'ESP Master Gamer',
    category: 'Gamer',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EspPlayMaster',
    tag: '🎮 Pro',
  },
];

interface AvatarCustomizerModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar?: (avatarUrl: string, frameType: string, statusTitle: string, newName?: string, newBio?: string) => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onOpenBuyCoins?: () => void;
  initialTab?: 'profile' | 'frames' | 'vip';
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveAvatar,
  onUpdateUser,
  onOpenBuyCoins,
  initialTab = 'frames',
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'frames' | 'vip'>(initialTab);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    user.avatar || PREDEFINED_AVATARS[0].url
  );
  const [previewFrame, setPreviewFrame] = useState<FrameVariant>(
    (user.frameType as FrameVariant) || 'standard'
  );
  const [editUsername, setEditUsername] = useState<string>(user.fullName || '');
  const [editBio, setEditBio] = useState<string>(user.bio || '');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cropModalSrc, setCropModalSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatarUrl(user.avatar || PREDEFINED_AVATARS[0].url);
      setPreviewFrame((user.frameType as FrameVariant) || 'standard');
      setEditUsername(user.fullName || '');
      setEditBio(user.bio || '');
      setActiveTab(initialTab);
      setFeedback(null);
    }
  }, [isOpen, user.userId, initialTab]);

  if (!isOpen) return null;

  const userCoins = user.coins || 0;
  const unlockedFrames = Array.isArray(user.unlockedFrames) && user.unlockedFrames.length > 0
    ? user.unlockedFrames
    : ['standard'];
  const previewFrameObj = getFrameByVariant(previewFrame);
  const activeVipCfg = getVipConfig(user.vipTier);

  const openAvatarCropFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result) {
        setCropModalSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    openAvatarCropFromFile(file);
    e.target.value = '';
  };

  const handleSaveProfile = async () => {
    setBusyId('save-profile');
    setFeedback(null);
    try {
      const updated = await api.updateUserProfile(user.userId, {
        avatar: selectedAvatarUrl,
        fullName: editUsername.trim() || user.fullName,
        bio: editBio.trim(),
      });
      await api.recordTaskAction(user.userId, 'profile_completed', 1).catch(() => {});
      const refreshed = await api.getTasksStatus(user.userId).catch(() => null);
      const finalUser = refreshed?.user || updated;
      if (onUpdateUser) onUpdateUser(finalUser);
      if (onSaveAvatar) {
        onSaveAvatar(
          finalUser.avatar || selectedAvatarUrl,
          finalUser.frameType || 'standard',
          finalUser.vipTitle || '',
          finalUser.fullName,
          finalUser.bio
        );
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setFeedback({ type: 'success', text: '✅ अवतार व प्रोफाइल सेव हुई! प्रोफाइल टास्क भी अपडेट हो गया।' });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'प्रोफाइल सेव करने में त्रुटि आई' });
    } finally {
      setBusyId(null);
    }
  };

  const handleBuyOrEquipFrame = async (frame: FrameCatalogItem) => {
    setFeedback(null);
    setPreviewFrame(frame.variant);
    const isOwned = frame.coinPrice === 0 || unlockedFrames.includes(frame.variant);

    if (isOwned) {
      if (user.frameType === frame.variant) {
        setFeedback({ type: 'success', text: `यह फ्रेम (${frame.name}) पहले से सक्रिय है!` });
        return;
      }
      setBusyId(frame.id);
      try {
        const res = await api.equipAvatarFrame(user.userId, frame.variant);
        if (!res.success) {
          setFeedback({ type: 'error', text: res.message || 'फ्रेम लगाने में त्रुटि आई' });
          return;
        }
        if (res.user && onUpdateUser) onUpdateUser(res.user);
        setFeedback({ type: 'success', text: `✨ ${frame.hindiName} आपकी प्रोफाइल पर सेट हो गया!` });
      } catch (err: any) {
        setFeedback({ type: 'error', text: err?.message || 'फ्रेम बदलने में त्रुटि' });
      } finally {
        setBusyId(null);
      }
      return;
    }

    // Locked frame: user must pay real coins
    if (userCoins < frame.coinPrice) {
      setFeedback({
        type: 'error',
        text: `🪙 "${frame.name}" (${frame.quality}) खरीदने के लिए ${frame.coinPrice} कॉइन्स चाहिए। आपके पास ${userCoins} कॉइन्स हैं — पहले कॉइन्स खरीदें या टास्क पूरे करें।`,
      });
      return;
    }

    setBusyId(frame.id);
    try {
      const res = await api.buyAvatarFrame(user.userId, frame.variant);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message || 'फ्रेम खरीदने में त्रुटि आई' });
        return;
      }
      if (res.user && onUpdateUser) onUpdateUser(res.user);
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      setFeedback({ type: 'success', text: `🎉 ${frame.hindiName} (${frame.coinPrice} Coins) खरीदा व सक्रिय किया गया!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'फ्रेम खरीदने में त्रुटि' });
    } finally {
      setBusyId(null);
    }
  };

  const handleBuyVip = async (tier: VipTierConfig) => {
    setFeedback(null);
    if (user.vipTier === tier.id) {
      setFeedback({ type: 'success', text: `आपके पास पहले से ${tier.name} सक्रिय है!` });
      return;
    }
    if (userCoins < tier.coinPrice) {
      setFeedback({
        type: 'error',
        text: `🪙 ${tier.name} खरीदने के लिए ${tier.coinPrice} कॉइन्स चाहिए। आपके पास ${userCoins} कॉइन्स हैं!`,
      });
      return;
    }
    setBusyId(tier.id);
    try {
      const res = await api.buyVipTier(user.userId, tier.id);
      if (!res.success) {
        setFeedback({ type: 'error', text: res.message || 'VIP खरीदने में त्रुटि आई' });
        return;
      }
      if (res.user && onUpdateUser) onUpdateUser(res.user);
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
      setFeedback({ type: 'success', text: `👑 बधाई हो! ${tier.hindiName} (${tier.coinPrice} Coins) सक्रिय हो गया!` });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'VIP खरीदने में त्रुटि' });
    } finally {
      setBusyId(null);
    }
  };

  const triggerBuyCoins = () => {
    onClose();
    onOpenBuyCoins?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden relative my-4 text-[#212121]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-blue-600 bg-[#2874f0] text-white flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center text-xl shadow-xs font-black">
              🎨
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>Avatar, Quality Frames & VIP Store</span>
              </h3>
              <p className="text-[11px] text-blue-100">
                फ्रेम क्वालिटी व VIP पास कॉइन्स से खरीदें — बिना पर्याप्त कॉइन्स के फ्रेम/VIP नहीं खुलेगा
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <div className="bg-[#ffe500] text-[#212121] px-2.5 py-1 rounded-sm text-xs font-black flex items-center gap-1">
              <span>🪙</span>
              <span className="font-mono">{userCoins.toLocaleString()}</span>
            </div>
            {onOpenBuyCoins && (
              <button
                type="button"
                onClick={triggerBuyCoins}
                className="bg-[#fb641b] hover:bg-[#e5530d] text-white px-2.5 py-1 rounded-sm text-xs font-black cursor-pointer"
              >
                + Buy Coins
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Preview Strip */}
        <div className="px-5 py-4 border-b border-slate-200 bg-[#f5f8ff] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AvatarFrame
              src={selectedAvatarUrl}
              alt={editUsername || user.fullName}
              size="lg"
              frameType={previewFrame}
              vipTier={user.vipTier}
              level={user.gameLevel || 1}
              showCrown={previewFrame === 'clan-leader' || previewFrame === 'royal-dragon-crown'}
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-[#212121]">{editUsername || user.fullName}</h4>
                <span className="text-[10px] font-mono text-[#2874f0] bg-white px-2 py-0.5 rounded-xs border border-blue-200 font-bold">
                  {user.userId}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#ffe500] text-[#212121]">
                  {previewFrameObj.titleBadge} • {previewFrameObj.quality}
                </span>
                {activeVipCfg && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-xs bg-gradient-to-r ${activeVipCfg.colorClass} text-white`}>
                    {activeVipCfg.badgeText}
                  </span>
                )}
                <span className="text-[11px] text-[#2874f0] font-mono font-bold">
                  Lv.{user.gameLevel || 1} • {(user.gameXp || 0)} EXP
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {previewFrameObj.variant !== user.frameType && !unlockedFrames.includes(previewFrameObj.variant) && previewFrameObj.coinPrice > 0
                  ? `🔒 Preview Only — Unlock करने के लिए 🪙 ${previewFrameObj.coinPrice} Coins लगेंगे`
                  : `सक्रिय फ्रेम: ${getFrameByVariant(user.frameType).hindiName}`}
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-[#f9fafb]">
          <button
            type="button"
            onClick={() => setActiveTab('frames')}
            className={`py-2.5 text-xs font-black border-b-2 transition cursor-pointer ${
              activeTab === 'frames'
                ? 'border-[#2874f0] text-[#2874f0] bg-white'
                : 'border-transparent text-slate-600 hover:text-[#212121]'
            }`}
          >
            🖼️ Quality Frames ({FRAME_CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vip')}
            className={`py-2.5 text-xs font-black border-b-2 transition cursor-pointer ${
              activeTab === 'vip'
                ? 'border-[#fb641b] text-[#fb641b] bg-white'
                : 'border-transparent text-slate-600 hover:text-[#212121]'
            }`}
          >
            👑 VIP Pass Buy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 text-xs font-black border-b-2 transition cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#388e3c] text-[#388e3c] bg-white'
                : 'border-transparent text-slate-600 hover:text-[#212121]'
            }`}
          >
            👤 Avatar & Profile
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mx-5 mt-3 px-4 py-2.5 rounded-md border text-xs font-bold flex flex-wrap items-center justify-between gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-[#388e3c]'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span>{feedback.text}</span>
            {feedback.type === 'error' && onOpenBuyCoins && (
              <button
                type="button"
                onClick={triggerBuyCoins}
                className="px-3 py-1 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-[11px] font-black cursor-pointer shrink-0"
              >
                🪙 Buy Coins (कॉइन्स खरीदें)
              </button>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 max-h-[380px] overflow-y-auto bg-white">
          {/* TAB 1: QUALITY-TIERED FRAME STORE */}
          {activeTab === 'frames' && (
            <div className="space-y-2.5">
              {FRAME_CATALOG.map((frame) => {
                const isOwned = frame.coinPrice === 0 || unlockedFrames.includes(frame.variant);
                const isEquipped = (user.frameType || 'standard') === frame.variant;
                const canAfford = userCoins >= frame.coinPrice;

                return (
                  <div
                    key={frame.id}
                    onClick={() => setPreviewFrame(frame.variant)}
                    className={`p-3 rounded-md border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-50/70 border-[#388e3c]'
                        : previewFrame === frame.variant
                        ? 'bg-[#f5f8ff] border-[#2874f0]'
                        : 'bg-[#f9fafb] border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-md bg-white border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {frame.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-[#212121]">{frame.name}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-xs border ${frame.qualityBadgeColor}`}>
                            {frame.quality}
                          </span>
                          {isOwned && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-xs bg-emerald-100 text-[#388e3c]">
                              OWNED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">{frame.description}</p>
                        <div className="text-[11px] font-mono font-black mt-0.5 text-[#fb641b]">
                          {frame.coinPrice === 0 ? 'FREE STARTER' : `🪙 ${frame.coinPrice} Coins`}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      {isEquipped ? (
                        <span className="px-3 py-1.5 rounded-sm bg-emerald-100 text-[#388e3c] border border-emerald-300 text-xs font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : isOwned ? (
                        <button
                          type="button"
                          disabled={busyId === frame.id}
                          onClick={() => handleBuyOrEquipFrame(frame)}
                          className="px-3.5 py-1.5 rounded-sm bg-[#2874f0] hover:bg-[#1c62d6] text-white text-xs font-black cursor-pointer disabled:opacity-50"
                        >
                          {busyId === frame.id ? 'Saving...' : 'Equip Frame'}
                        </button>
                      ) : canAfford ? (
                        <button
                          type="button"
                          disabled={busyId === frame.id}
                          onClick={() => handleBuyOrEquipFrame(frame)}
                          className="px-3.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{busyId === frame.id ? 'Buying...' : `Buy (${frame.coinPrice}c)`}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Need {frame.coinPrice - userCoins}c
                          </span>
                          {onOpenBuyCoins && (
                            <button
                              type="button"
                              onClick={triggerBuyCoins}
                              className="px-2.5 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-[11px] font-black cursor-pointer"
                            >
                              🪙 Buy Coins
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: VIP PASS BUY SYSTEM */}
          {activeTab === 'vip' && (
            <div className="space-y-3">
              {VIP_TIERS.map((tier) => {
                const isActive = user.vipTier === tier.id;
                const canAfford = userCoins >= tier.coinPrice;

                return (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-md border transition ${
                      isActive ? 'bg-amber-50 border-amber-400' : 'bg-[#f9fafb] border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl">{tier.icon}</span>
                          <h4 className="text-sm font-black text-[#212121]">{tier.hindiName}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-xs bg-gradient-to-r ${tier.colorClass} text-white`}>
                            {tier.badgeText}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1 text-[11px] text-slate-600 list-disc list-inside">
                          {tier.perks.map((p, idx) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-sm font-mono font-black text-[#fb641b]">
                          🪙 {tier.coinPrice} Coins
                        </span>
                        {isActive ? (
                          <span className="px-3 py-1.5 rounded-sm bg-emerald-100 text-[#388e3c] border border-emerald-300 text-xs font-black">
                            ✅ Active VIP
                          </span>
                        ) : canAfford ? (
                          <button
                            type="button"
                            disabled={busyId === tier.id}
                            onClick={() => handleBuyVip(tier)}
                            className="px-4 py-2 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black cursor-pointer disabled:opacity-50"
                          >
                            {busyId === tier.id ? 'Activating...' : `Buy VIP (${tier.coinPrice} Coins)`}
                          </button>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] text-rose-600 font-bold">
                              🔒 {tier.coinPrice - userCoins} और कॉइन्स चाहिए
                            </span>
                            {onOpenBuyCoins && (
                              <button
                                type="button"
                                onClick={triggerBuyCoins}
                                className="px-3 py-1.5 rounded-sm bg-[#fb641b] hover:bg-[#e5530d] text-white text-xs font-black cursor-pointer"
                              >
                                🪙 Buy Coins
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: AVATAR & PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-[#f5f8ff] p-3 rounded-md border border-dashed border-[#2874f0] flex flex-col sm:flex-row items-center justify-center gap-2">
                <input
                  type="file"
                  id="customAvatarUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="customAvatarUpload"
                  className="w-full sm:flex-1 py-2 px-3 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-black text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>📷 फोटो अपलोड व क्रॉप करें (Upload Profile Pic)</span>
                </label>
                {selectedAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setCropModalSrc(selectedAvatarUrl)}
                    className="w-full sm:w-auto px-3 py-2 rounded-sm bg-white hover:bg-blue-50 text-[#1877f2] border border-[#2874f0] font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Crop / Adjust</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#f9fafb] p-3 rounded-md border border-slate-200">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">यूजरनेम / नाम</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-1">बायो / स्टेटस लाइन</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="उदा. ESP Verified Player"
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>

              <div>
                <h5 className="text-xs font-black text-[#2874f0] mb-2">अवतार आइकन चुनें (Free Avatars):</h5>
                <div className="grid grid-cols-4 gap-2">
                  {PREDEFINED_AVATARS.map((avatar) => {
                    const isSelected = selectedAvatarUrl === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarUrl(avatar.url)}
                        className={`p-2 rounded-md border transition flex flex-col items-center cursor-pointer ${
                          isSelected ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0]' : 'bg-white border-slate-200 hover:bg-[#f9fafb]'
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-11 h-11 rounded-md object-cover bg-[#f1f3f6]" />
                        <span className="text-[9px] font-bold text-[#212121] truncate w-full text-center mt-1">
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                disabled={busyId === 'save-profile'}
                onClick={handleSaveProfile}
                className="w-full py-2.5 rounded-sm bg-[#388e3c] hover:bg-emerald-700 text-white font-black text-xs cursor-pointer disabled:opacity-50"
              >
                {busyId === 'save-profile' ? 'Saving Profile...' : '💾 Save Avatar & Profile Details'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-[#f9fafb] flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-600">
            💡 टास्क पूरा करने पर +5 कॉइन्स व EXP मिलते हैं — या तुरंत UPI से कॉइन्स खरीदें।
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-sm text-xs font-bold text-[#212121] bg-white hover:bg-slate-100 border border-slate-300 transition cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>

      <FacebookPhotoCropModal
        isOpen={Boolean(cropModalSrc)}
        imageSrc={cropModalSrc || ''}
        kind="avatar"
        onCancel={() => setCropModalSrc(null)}
        onConfirm={(croppedDataUrl) => {
          setSelectedAvatarUrl(croppedDataUrl);
          setCropModalSrc(null);
          setFeedback({ type: 'success', text: '✂️ फोटो क्रॉप हो गई! अब नीचे "Save Avatar & Profile Details" दबाएं।' });
        }}
        onChangeFile={openAvatarCropFromFile}
      />
    </div>
  );
};
