import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Check, Sparkles, Crown, Shield, Zap, Star, 
  Award, Eye, RefreshCw, Palette, UserCheck
} from 'lucide-react';
import type { UserProfile } from '../types/index.ts';
import { AvatarFrame, type FrameVariant } from './AvatarFrame.tsx';

export interface PredefinedAvatar {
  id: string;
  name: string;
  category: string;
  url: string;
  tag: string;
}

export interface StatusFrameOption {
  id: string;
  variant: FrameVariant;
  name: string;
  hindiName: string;
  titleBadge: string;
  description: string;
  glowColor: string;
  icon: string;
}

export const PREDEFINED_AVATARS: PredefinedAvatar[] = [
  {
    id: 'cyber-bot',
    name: 'Cyber Neon Bot',
    category: 'Gamer',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberWarrior',
    tag: '⚡ Popular',
  },
  {
    id: 'sharma-ji-royal',
    name: 'Sharma Ji Legend',
    category: 'VIP',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyal',
    tag: '👑 Royal',
  },
  {
    id: 'krishna-divine',
    name: 'Shri Krishna Celestial',
    category: 'Divine',
    url: '/assets/aistudio/Screenshot_2026-10-21-07-12-08-923_lockscreen_b87ed8b4.jpg',
    tag: '🪈 Divine',
  },
  {
    id: 'spy-master',
    name: "Who's The Spy Detective",
    category: 'Game',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpyMasterESP',
    tag: '🕵️ Secret',
  },
  {
    id: 'werewolf-alpha',
    name: 'Space Werewolf Alpha',
    category: 'Game',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlphaWerewolf',
    tag: '🐺 Werewolf',
  },
  {
    id: 'royal-queen',
    name: 'Royal Empress VIP',
    category: 'VIP',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EmpressESP',
    tag: '👸 Empress',
  },
  {
    id: 'speed-racer',
    name: 'Ferrari Racer Boy',
    category: 'Luxury',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SpeedRacer',
    tag: '🏎️ Fast',
  },
  {
    id: 'crypto-whale',
    name: 'Crypto Diamond Whale',
    category: 'Earning',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CryptoWhale',
    tag: '💎 Earning',
  },
  {
    id: 'golden-tiger',
    name: 'Golden Clan Tiger',
    category: 'Clan',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoldenTiger',
    tag: '🐯 Fierce',
  },
  {
    id: 'espplay-gamer',
    name: 'ESP PLAY Master Gamer',
    category: 'Gamer',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=EspPlayMaster',
    tag: '🎮 Master',
  },
];

export const STATUS_FRAMES: StatusFrameOption[] = [
  {
    id: 'frame-pro-player',
    variant: 'pro-player',
    name: 'Pro Player',
    hindiName: 'प्रो प्लेयर फ्रेम',
    titleBadge: '⚡ PRO PLAYER',
    description: 'इलेक्ट्रिक ब्लू नियॉन आभामंडल और लाइटनिंग एम्बलम',
    glowColor: 'from-cyan-500 to-blue-600',
    icon: '⚡',
  },
  {
    id: 'frame-rookie',
    variant: 'rookie',
    name: 'Rookie',
    hindiName: 'रूकी फ्रेम',
    titleBadge: '🔰 ROOKIE',
    description: 'स्टार्टर एमराल्ड रिंग और रूकी स्टार बैज',
    glowColor: 'from-emerald-500 to-teal-600',
    icon: '🔰',
  },
  {
    id: 'frame-clan-leader',
    variant: 'clan-leader',
    name: 'Clan Leader',
    hindiName: 'क्लैन लीडर फ्रेम',
    titleBadge: '👑 CLAN LEADER',
    description: 'शाही 3D गोल्ड ड्रैगन क्राउन और रूबी रत्न',
    glowColor: 'from-amber-400 to-yellow-500',
    icon: '👑',
  },
  {
    id: 'frame-grand-champion',
    variant: 'cosmic-neon',
    name: 'Grand Champion',
    hindiName: 'ग्रैंड चैंपियन फ्रेम',
    titleBadge: '🏆 GRAND CHAMPION',
    description: 'होलोग्राफिक रेनबो प्रिज़्म और कॉस्मिक पल्स',
    glowColor: 'from-pink-500 via-cyan-400 to-violet-500',
    icon: '🏆',
  },
  {
    id: 'frame-vip-gold',
    variant: 'vip-gold',
    name: 'VIP High Roller',
    hindiName: 'VIP हाई रोलर फ्रेम',
    titleBadge: '💎 VIP HIGH ROLLER',
    description: '24K सॉलिड गोल्ड बुलियन फ्रेम और डायमंड स्पार्कल',
    glowColor: 'from-amber-400 to-yellow-600',
    icon: '💎',
  },
  {
    id: 'frame-wolf-night',
    variant: 'wolf-night',
    name: 'Night Wolf Alpha',
    hindiName: 'नाइट वोल्फ फ्रेम',
    titleBadge: '🐺 NIGHT WOLF',
    description: 'डार्क एमेथिस्ट लूनर हॉर्न और पर्पल स्पेक्ट्रल फ्लेम',
    glowColor: 'from-purple-600 to-indigo-600',
    icon: '🐺',
  },
  {
    id: 'frame-judge',
    variant: 'judge-justice',
    name: 'Judge of Justice',
    hindiName: 'जज जस्टिस फ्रेम',
    titleBadge: '⚖️ JUDGE JUSTICE',
    description: 'गोल्डन स्केल एम्बलम और निष्पक्ष न्याय बॉर्डर',
    glowColor: 'from-yellow-500 to-amber-700',
    icon: '⚖️',
  },
  {
    id: 'frame-standard',
    variant: 'standard',
    name: 'Standard Classic',
    hindiName: 'क्लासिक फ्रेम',
    titleBadge: '⭐ MEMBER',
    description: 'सरल क्लासिक स्टील बॉर्डर',
    glowColor: 'from-slate-600 to-slate-800',
    icon: '💠',
  },
];

interface AvatarCustomizerModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (avatarUrl: string, frameType: string, statusTitle: string, newName?: string, newBio?: string) => void;
}

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    user.avatar || PREDEFINED_AVATARS[0].url
  );
  const [selectedFrame, setSelectedFrame] = useState<FrameVariant>(
    (user.frameType as FrameVariant) || 'pro-player'
  );
  const [selectedTitle, setSelectedTitle] = useState<string>(
    user.vipTitle || 'Pro Player'
  );
  const [editUsername, setEditUsername] = useState<string>(user.fullName || '');
  const [editBio, setEditBio] = useState<string>(user.bio || 'ESP प्रो गेमर');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentFrameObj = STATUS_FRAMES.find(f => f.variant === selectedFrame) || STATUS_FRAMES[0];

  const handleSelectFrame = (f: StatusFrameOption) => {
    setSelectedFrame(f.variant);
    setSelectedTitle(f.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatarUrl(reader.result);
        setFeedback('📷 आपकी फोटो सफलतापूर्वक लोड हुई!');
        setTimeout(() => setFeedback(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndEquip = () => {
    onSaveAvatar(selectedAvatarUrl, selectedFrame, selectedTitle, editUsername, editBio);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    setFeedback('✨ नया अवतार और प्रोफाइल डिटेल्स सफलतापूर्वक सेव हुई!');
    setTimeout(() => {
      setFeedback(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden relative my-6 text-[#212121]">
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-blue-600 bg-[#2874f0] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md bg-[#ffe500] text-[#212121] flex items-center justify-center text-xl shadow-xs font-black">
              🎨
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 flex-wrap">
                <span>Avatar & Status Frame Customizer</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-xs bg-[#ffe500] text-[#212121]">
                  Live Preview
                </span>
              </h3>
              <p className="text-[11px] text-blue-100">
                अपना पसंदीदा गेमिंग आइकन और स्टेटस फ्रेम चुनें (जैसे Pro Player, Rookie, Clan Leader)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mx-5 mt-3 px-4 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-[#388e3c] text-xs font-bold text-center animate-fadeIn">
            {feedback}
          </div>
        )}

        {/* Live Preview Center Showcase */}
        <div className="p-5 border-b border-slate-200 bg-[#f5f8ff] flex flex-col items-center justify-center text-center">
          <div className="relative p-4 rounded-md bg-white border border-blue-200 shadow-xs flex flex-col items-center">
            
            {/* Real-time Rendered Avatar with Frame */}
            <div className="my-2">
              <AvatarFrame
                src={selectedAvatarUrl}
                alt={editUsername || user.fullName}
                size="2xl"
                frameType={selectedFrame}
                level={user.gameLevel || 12}
                showCrown={selectedFrame === 'clan-leader' || selectedFrame === 'royal-dragon-crown'}
              />
            </div>

            {/* Profile Info in Preview */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-center space-x-2">
                <h4 className="text-base font-black text-[#212121]">{editUsername || user.fullName}</h4>
                <span className="text-[10px] font-mono text-[#2874f0] bg-[#f5f8ff] px-2 py-0.5 rounded-xs border border-blue-200 font-bold">
                  {user.userId}
                </span>
              </div>

              {/* Status Badge Tag */}
              <div className="flex items-center justify-center space-x-1.5 pt-0.5">
                <span className="text-xs font-black px-3 py-0.5 rounded-xs bg-[#ffe500] text-[#212121] shadow-2xs">
                  {currentFrameObj.titleBadge}
                </span>
                <span className="text-[11px] text-[#2874f0] font-mono font-bold">
                  Lv.{user.gameLevel || 12} • {(user.charms || 0).toLocaleString()} ✨ Charms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Selection Area */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[360px] overflow-y-auto no-scrollbar bg-white">
          
          {/* Section 1: Pre-defined Avatar Icons */}
          <div className="space-y-3">
            {/* Custom Photo Upload From Device */}
            <div className="bg-[#f5f8ff] p-3 rounded-md border border-dashed border-[#2874f0] flex flex-col items-center justify-center space-y-2">
              <input
                type="file"
                id="customAvatarUpload"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="customAvatarUpload"
                className="w-full py-2.5 px-3 rounded-sm bg-[#2874f0] hover:bg-[#1e60d5] text-white font-black text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
              >
                <span>📷 अपनी खुद की फोटो लगाएं (Upload Profile Pic)</span>
              </label>
              <p className="text-[10px] text-slate-600 text-center">
                गैलरी या कैमरा से रियल फोटो चुनें, तुरंत फ्रेम में सेट होगी
              </p>
            </div>

            {/* Profile Details Edit (Name & Bio) */}
            <div className="space-y-2 bg-[#f9fafb] p-3 rounded-md border border-slate-200">
              <h5 className="text-[11px] font-black uppercase text-[#2874f0] flex items-center gap-1.5">
                <span>✏️</span>
                <span>प्रोफाइल नाम व बायो एडिट करें</span>
              </h5>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-0.5">यूजरनेम / नाम</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-bold block mb-0.5">बायो / स्टेटस लाइन</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="जैसे: प्रो गेमर | लूडो किंग | ESP स्टार"
                    className="w-full bg-white border border-slate-300 rounded-sm px-2.5 py-1.5 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pb-1 border-b border-slate-200 pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2874f0] flex items-center space-x-1.5">
                <span>1. Select Avatar Icon</span>
              </h4>
              <span className="text-[10px] text-slate-500">{PREDEFINED_AVATARS.length} Options</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {PREDEFINED_AVATARS.map(avatar => {
                const isSelected = selectedAvatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarUrl(avatar.url)}
                    className={`p-2 rounded-md border transition-all flex flex-col items-center relative cursor-pointer group ${
                      isSelected
                        ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0] shadow-xs scale-[1.03]'
                        : 'bg-white hover:bg-[#f9fafb] border-slate-200'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#2874f0] text-white font-black flex items-center justify-center text-[10px] shadow-xs z-20">
                        ✓
                      </span>
                    )}
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-12 h-12 rounded-md object-cover bg-[#f1f3f6] border border-slate-200 group-hover:scale-105 transition"
                    />
                    <span className="text-[9px] font-bold text-[#212121] text-center mt-1 truncate w-full">
                      {avatar.name}
                    </span>
                    <span className="text-[8px] text-[#2874f0] font-mono mt-0.5 font-semibold">
                      {avatar.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Status Frames (Pro Player, Rookie, Clan Leader, etc.) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#fb641b] flex items-center space-x-1.5">
                <span>2. Select Status Frame</span>
              </h4>
              <span className="text-[10px] text-slate-500">{STATUS_FRAMES.length} Frames</span>
            </div>

            <div className="space-y-2">
              {STATUS_FRAMES.map(frame => {
                const isSelected = selectedFrame === frame.variant;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => handleSelectFrame(frame)}
                    className={`w-full p-2.5 rounded-md border transition-all flex items-center justify-between text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#f5f8ff] border-[#2874f0] ring-1 ring-[#2874f0] shadow-2xs'
                        : 'bg-white hover:bg-[#f9fafb] border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-md bg-[#f1f3f6] border border-slate-200 flex items-center justify-center text-xl shrink-0">
                        {frame.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-[#212121]">{frame.name}</span>
                          <span className="text-[10px] text-slate-500">({frame.hindiName})</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-tight mt-0.5">
                          {frame.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                          ✓
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-[#f9fafb] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-white hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAndEquip}
            className="px-6 py-2.5 rounded-sm font-black text-xs text-white bg-[#fb641b] hover:bg-[#e5530d] shadow-sm transition cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Save & Equip Avatar Look</span>
          </button>
        </div>

      </div>
    </div>
  );
};
