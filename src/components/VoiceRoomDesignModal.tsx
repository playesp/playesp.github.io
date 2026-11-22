import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  Upload,
  Check,
  Copy,
  UserPlus,
  Search,
  Lock,
  Unlock,
  Mic,
  MicOff,
  Sparkles,
  Share2,
  Crown,
  Crop,
  Youtube,
  Loader2,
} from 'lucide-react';
import type {
  UserProfile,
  CustomVoiceRoom,
  VoiceRoomSeat,
  VoiceRoomStageLayout,
} from '../types/index.ts';
import {
  VOICE_WALLPAPER_PRESETS,
  STAGE_LAYOUT_OPTIONS,
} from '../config/voiceWallpapers.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';
import { FacebookPhotoCropModal } from './FacebookPhotoCropModal.tsx';
import { isVipFancyRoomNumber } from '../config/giftCatalog.ts';

interface VoiceRoomDesignModalProps {
  isOpen: boolean;
  initialTab?: 'design' | 'invite' | 'seats';
  currentUser: UserProfile;
  room: Partial<CustomVoiceRoom> & {
    id: string;
    title: string;
    topic: string;
    category?: string;
    roomAddress: string;
    hostUserId: string;
  };
  seats: VoiceRoomSeat[];
  onClose: () => void;
  onDesignSaved: (payload: any) => void;
  onHostSeatAction: (
    action: 'mute' | 'unmute' | 'kick' | 'lock_seat' | 'unlock_seat',
    seatIdx: number
  ) => Promise<void> | void;
}

export const VoiceRoomDesignModal: React.FC<VoiceRoomDesignModalProps> = ({
  isOpen,
  initialTab = 'design',
  currentUser,
  room,
  seats,
  onClose,
  onDesignSaved,
  onHostSeatAction,
}) => {
  const isOwner =
    room.hostUserId === currentUser.userId ||
    currentUser.userId === 'EMO-MOM-MMO';

  const [activeTab, setActiveTab] = useState<'design' | 'invite' | 'seats'>(
    initialTab
  );
  const [title, setTitle] = useState(room.title || '');
  const [topic, setTopic] = useState(room.topic || '');
  const [category, setCategory] = useState<string>(room.category || 'earning');
  const [wallpaperId, setWallpaperId] = useState<string>(
    room.wallpaperId || 'castle_night'
  );
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState<string>(
    room.customWallpaperUrl || ''
  );
  const [stageLayout, setStageLayout] = useState<VoiceRoomStageLayout>(
    room.stageLayout || 'classic_8'
  );
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState<string>(
    room.youtubeVideoUrl || ''
  );
  const [isPrivate, setIsPrivate] = useState<boolean>(Boolean(room.isPrivate));
  const [passcode, setPasscode] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Cropper for uploaded custom wallpaper
  const [cropWallpaperSrc, setCropWallpaperSrc] = useState<string>('');

  // Invite friends search
  const [inviteQuery, setInviteQuery] = useState('');
  const [playerResults, setPlayerResults] = useState<any[]>([]);
  const [searchingPlayers, setSearchingPlayers] = useState(false);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<'id' | 'link' | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(initialTab);
    setTitle(room.title || '');
    setTopic(room.topic || '');
    setCategory(room.category || 'earning');
    setWallpaperId(room.wallpaperId || 'castle_night');
    setCustomWallpaperUrl(room.customWallpaperUrl || '');
    setStageLayout(room.stageLayout || 'classic_8');
    setYoutubeVideoUrl(room.youtubeVideoUrl || '');
    setIsPrivate(Boolean(room.isPrivate));
  }, [isOpen, initialTab, room.id]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'invite') return;
    let active = true;
    const loadPlayers = async () => {
      setSearchingPlayers(true);
      try {
        const res = await api.searchUsersByUsername(
          inviteQuery.trim(),
          currentUser.userId
        );
        if (active && res?.success && Array.isArray(res.users)) {
          setPlayerResults(
            res.users.filter((u: any) => u.userId !== currentUser.userId)
          );
        }
      } catch {
        // Fallback ignore
      } finally {
        if (active) setSearchingPlayers(false);
      }
    };
    const timer = setTimeout(loadPlayers, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, activeTab, inviteQuery, currentUser.userId]);

  if (!isOpen) return null;

  const shareRoomUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?room=${encodeURIComponent(
          room.roomAddress
        )}&ref=${encodeURIComponent(currentUser.userId)}`
      : '';

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      showToast('केवल रूम के मालिक ही रूम डिज़ाइन बदल सकते हैं।', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await api.updateVoiceRoomDesign(room.id, {
        userId: currentUser.userId,
        title: title.trim() || `${currentUser.fullName}'s Voice Room`,
        topic: topic.trim(),
        category,
        wallpaperId: customWallpaperUrl ? 'custom_upload' : wallpaperId,
        customWallpaperUrl,
        stageLayout,
        youtubeVideoUrl: youtubeVideoUrl.trim(),
        isPrivate,
        passcode: passcode.trim(),
      });
      if (res?.success) {
        onDesignSaved(res);
        showToast(res.message || '🎨 रूम डिज़ाइन अपडेट हो गया!', 'success');
        onClose();
      } else {
        showToast(res?.message || 'डिज़ाइन सेव नहीं हो सका', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'नेटवर्क त्रुटि', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadCustomWallpaperFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropWallpaperSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendInvite = async (targetUserId: string, name: string) => {
    try {
      const res = await api.inviteToVoiceRoom(
        room.id,
        currentUser.userId,
        [targetUserId]
      );
      if (res?.success) {
        setInvitedIds((prev) => new Set(prev).add(targetUserId));
        showToast(
          `📩 ${name} को रूम ID ${room.roomAddress} का इनवाइट भेजा गया!`,
          'success'
        );
      }
    } catch {
      showToast('इनवाइट भेजने में समस्या आई', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black truncate">
                {room.isPersonalFixed
                  ? 'मेरा पर्सनल फिक्स्ड वॉइस रूम'
                  : room.title}
              </h3>
              <p className="text-[11px] text-sky-200 font-mono tabular-nums flex items-center gap-1.5 flex-wrap">
                <span>
                  Permanent Room ID: <strong>{room.roomAddress}</strong> (Unique Numeric ID)
                </span>
                {(room.isVipRoom || isVipFancyRoomNumber(room.roomAddress)) && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-sans font-black">
                    👑 {room.vipRoomLabel || 'VIP ROOM'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition ${
              activeTab === 'design'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Wallpaper & Design</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition ${
              activeTab === 'invite'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Friends</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seats')}
            className={`py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition ${
              activeTab === 'seats'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Seats & Locks</span>
          </button>
        </div>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: DESIGN & WALLPAPER STUDIO */}
          {activeTab === 'design' && (
            <form onSubmit={handleSaveDesign} className="space-y-4">
              {!isOwner && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  ℹ️ आप इस रूम के विज़िटर हैं — केवल रूम मालिक ({room.hostName}) ही वॉलपेपर या सेटिंग्स बदल सकते हैं।
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    रूम का नाम (Room Name)
                  </label>
                  <input
                    type="text"
                    value={title}
                    disabled={!isOwner}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Royal Voice Room"
                    className="w-full border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-xs outline-none disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    टॉपिक / स्वागत संदेश (Topic)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    disabled={!isOwner}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Friends chill, games & music"
                    className="w-full border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-xs outline-none disabled:bg-slate-100"
                  />
                </div>
              </div>

              {/* Stage Layout Picker (4 ESP PLAY Layouts) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  🎭 स्टेज लेआउट चुनें (ESP PLAY Stage Layout)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGE_LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={!isOwner}
                      onClick={() => setStageLayout(opt.id)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer disabled:opacity-60 ${
                        stageLayout === opt.id
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-black">
                        <span>
                          {opt.icon} {opt.title}
                        </span>
                        {stageLayout === opt.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {opt.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Watch Party YouTube URL input */}
              {stageLayout === 'watch_party' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 mb-1 flex items-center gap-1">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube Video URL (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={youtubeVideoUrl}
                    disabled={!isOwner}
                    onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full border border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-xs outline-none"
                  />
                </div>
              )}

              {/* Built-in HD Wallpapers + Custom Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    🖼️ रूम वॉलपेपर चुनें या खुद अपलोड करें (Custom Wallpaper)
                  </label>
                  {isOwner && (
                    <label className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Wallpaper</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadCustomWallpaperFile}
                      />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {VOICE_WALLPAPER_PRESETS.map((wp) => {
                    const selected = !customWallpaperUrl && wallpaperId === wp.id;
                    return (
                      <div
                        key={wp.id}
                        onClick={() => {
                          if (!isOwner) return;
                          setCustomWallpaperUrl('');
                          setWallpaperId(wp.id);
                          setStageLayout(wp.recommendedLayout);
                        }}
                        className={`rounded-xl overflow-hidden border-2 cursor-pointer transition relative aspect-[3/4] ${
                          selected
                            ? 'border-blue-600 ring-2 ring-blue-300 scale-[1.02]'
                            : 'border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        {wp.imageUrl && (
                          <img
                            src={wp.imageUrl}
                            alt={wp.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                          <div className="text-[10px] font-black leading-tight">
                            {wp.name}
                          </div>
                          <div className="text-[8px] opacity-80">{wp.badge}</div>
                        </div>
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom Uploaded Wallpaper Preview */}
                {customWallpaperUrl && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={customWallpaperUrl}
                        alt="Custom Wallpaper"
                        className="w-14 h-20 rounded-lg object-cover border border-indigo-300 shadow"
                      />
                      <div>
                        <div className="text-xs font-black text-indigo-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>कस्टम अपलोड किया गया वॉलपेपर सक्रिय</span>
                        </div>
                        <div className="text-[10px] text-indigo-700 mt-0.5">
                          रूम में आपके द्वारा चुना गया फोटो बैकग्राउंड दिखेगा
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCropWallpaperSrc(customWallpaperUrl)}
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-indigo-300 text-indigo-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Crop</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomWallpaperUrl('');
                            setWallpaperId('castle_night');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Privacy Passcode */}
              {isOwner && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span>🔒 प्राइवेट पासवर्ड रूम (Private Room Lock)</span>
                  </label>
                  {isPrivate && (
                    <input
                      type="text"
                      maxLength={8}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="4-6 अंकों का रूम पासकोड दर्ज करें"
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs outline-none"
                    />
                  )}
                </div>
              )}

              {isOwner && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>🎨 रूम डिज़ाइन सेव करें</span>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: INVITE FRIENDS & SYMBOL-FREE ROOM ID SHARE */}
          {activeTab === 'invite' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-sky-50 border border-blue-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      🔑 आपका सिंबल-रहित यूनिक रूम ID (Unique Room Number)
                    </div>
                    <div className="text-lg font-mono font-black text-blue-700 tracking-wider mt-0.5">
                      {room.roomAddress}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(room.roomAddress).catch(() => {});
                        setCopiedCode('id');
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === 'id' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy ID</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(
                            `🎙️ मेरे ESP Voice Room "${room.title}" में जुड़ें!\nRoom ID: ${room.roomAddress}\nDirect Link: ${shareRoomUrl}`
                          )
                          .catch(() => {});
                        setCopiedCode('link');
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copiedCode === 'link' ? 'Copied!' : 'Copy Invite Link'}</span>
                    </button>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-slate-600 bg-white/80 rounded-lg px-2.5 py-1.5 border border-blue-100 break-all">
                  {shareRoomUrl}
                </div>
              </div>

              {/* Search Players to Send In-App Room Invite */}
              <div className="space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inviteQuery}
                    onChange={(e) => setInviteQuery(e.target.value)}
                    placeholder="दोस्तों को नाम, @username या User ID से खोजें..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 focus:border-blue-500 rounded-lg text-xs outline-none"
                  />
                </div>

                {searchingPlayers ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    खोज रहे हैं...
                  </div>
                ) : playerResults.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    कोई खिलाड़ी नहीं मिला। अपना Room ID ({room.roomAddress}) कॉपी कर के शेयर करें।
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {playerResults.map((p) => {
                      const alreadyInvited = invitedIds.has(p.userId);
                      return (
                        <div
                          key={p.userId}
                          className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={
                                p.avatar ||
                                `https://api.dicebear.com/7.x/bottts/svg?seed=${p.userId}`
                              }
                              alt={p.fullName}
                              className="w-9 h-9 rounded-full object-cover border border-slate-300"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {p.fullName}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {p.username ? `@${p.username} • ` : ''}
                                {p.userId}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={alreadyInvited}
                              onClick={() => handleSendInvite(p.userId, p.fullName)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                                alreadyInvited
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {alreadyInvited ? '✓ Invited' : 'Invite'}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const roomPass = (room as any).passcode || passcode.trim() || '';
                                  await api.sendDirectMessage({
                                    fromUserId: currentUser.userId,
                                    toUserId: p.userId,
                                    inviteType: 'locked_room',
                                    roomAddress: room.roomAddress || '',
                                    roomTitle: room.title || 'Private Voice Room',
                                    passcode: roomPass,
                                    text: roomPass
                                      ? `🔒 मेरे पर्सनल लॉक वॉइस रूम "${room.title}" (#${room.roomAddress}) में जुड़ें! पासकोड: ${roomPass}`
                                      : `🏠 मेरे पर्सनल वॉइस रूम "${room.title}" (#${room.roomAddress}) में जुड़ें!`,
                                  });
                                  setInvitedIds((prev) => new Set(prev).add(p.userId));
                                  showToast(`🔒 ${p.fullName} को DM लॉक रूम इनवाइट भेज दिया गया!`, 'success');
                                } catch {
                                  showToast('DM इनवाइट भेजने में त्रुटि', 'error');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                              title="1-on-1 DM में पासकोड सहित रूम इनवाइट भेजें"
                            >
                              🔒 DM Invite
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SEAT LOCKS & HOST CONTROLS */}
          {activeTab === 'seats' && (
            <div className="space-y-2.5">
              <div className="text-xs text-slate-600 mb-2">
                {isOwner
                  ? 'रूम मालिक किसी भी खाली सीट को 🔒 लॉक/अनलॉक कर सकते हैं या माइक म्यूट/किक कर सकते हैं:'
                  : 'सीट स्टेटस:'}
              </div>
              {seats.map((seat, idx) => {
                const isOccupied = Boolean(seat.userId);
                const isLocked = Boolean(seat.isLocked) && !isOccupied;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900">
                          {isOccupied
                            ? seat.userName
                            : isLocked
                            ? '🔒 Locked Seat'
                            : 'Empty Seat'}
                        </div>
                        {isOccupied && (
                          <div className="text-[10px] text-slate-500">
                            {seat.isMuted ? '🔇 Muted' : '🎙️ Live on Mic'}
                          </div>
                        )}
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1.5">
                        {isOccupied ? (
                          seat.userId !== currentUser.userId && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  onHostSeatAction(
                                    seat.isMuted ? 'unmute' : 'mute',
                                    idx
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                              >
                                {seat.isMuted ? (
                                  <Mic className="w-3 h-3" />
                                ) : (
                                  <MicOff className="w-3 h-3" />
                                )}
                                <span>{seat.isMuted ? 'Unmute' : 'Mute'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onHostSeatAction('kick', idx)}
                                className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold text-[10px] cursor-pointer"
                              >
                                Kick
                              </button>
                            </>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onHostSeatAction(
                                isLocked ? 'unlock_seat' : 'lock_seat',
                                idx
                              )
                            }
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                              isLocked
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                            }`}
                          >
                            {isLocked ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Unlock</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Lock</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Optional Facebook-Style Cropper for Custom Uploaded Room Wallpaper */}
      {cropWallpaperSrc && (
        <FacebookPhotoCropModal
          isOpen={true}
          imageSrc={cropWallpaperSrc}
          kind="cover"
          title="रूम वॉलपेपर क्रॉप व एडजस्ट करें"
          onCancel={() => setCropWallpaperSrc('')}
          onConfirm={(croppedDataUrl: string) => {
            setCustomWallpaperUrl(croppedDataUrl);
            setWallpaperId('custom_upload');
            setCropWallpaperSrc('');
          }}
        />
      )}
    </div>
  );
};
