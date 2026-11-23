import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Crown,
  ShoppingBag,
  Sparkles,
  Heart,
  Home,
  Trophy,
  Eye,
  UserPlus,
  Briefcase,
  Headphones,
  Settings,
  Copy,
  Check,
  QrCode,
  Camera,
  X,
  Gift,
  Shield,
  ShieldAlert,
  LogOut,
  Layers,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';
import type { UserProfile, PlatformSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { syncUserToFirestore } from '../services/firebase.ts';
import { showToast } from '../services/toast.ts';
import { getVipConfig } from '../config/economy.ts';
import { FacebookPhotoCropModal } from '../components/FacebookPhotoCropModal.tsx';
import { AvatarCustomizerModal } from '../components/AvatarCustomizerModal.tsx';
import { RelationshipBondsModal } from '../components/RelationshipBondsModal.tsx';
import { EspFamilyHubModal } from '../components/EspFamilyHubModal.tsx';
import { EspEventsAndMyHomeModal } from '../components/EspEventsAndMyHomeModal.tsx';
import { GiftWallModal, type GiftWallEntry } from '../components/GiftWallModal.tsx';
import { isVipFancyRoomNumber } from '../config/giftCatalog.ts';
import { UserProfileSheetModal } from '../components/UserProfileSheetModal.tsx';
import { CharmTierEmblem, CharmTierChartModal } from '../components/CharmTierBadge.tsx';
import { resolveCharmTier } from '../config/charmTiers.ts';

interface MePageViewProps {
  user: UserProfile;
  settings: PlatformSettings;
  isAdmin: boolean;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSelectTab: (tab: string) => void;
  onOpenRecharge: () => void;
  onOpenWeeklyRewards: () => void;
  onShowIdCard: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

type EditFieldKey =
  | 'nickname'
  | 'username'
  | 'gender'
  | 'birthday'
  | 'region'
  | 'signature'
  | 'priceTag'
  | 'title'
  | null;

export const MePageView: React.FC<MePageViewProps> = ({
  user,
  settings,
  isAdmin,
  onUpdateUser,
  onSelectTab,
  onOpenRecharge,
  onOpenWeeklyRewards,
  onShowIdCard,
  onOpenAdmin,
  onLogout,
}) => {
  const [viewMode, setViewMode] = useState<'me' | 'edit-profile'>('me');
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [myMomentsCount, setMyMomentsCount] = useState<number>(0);

  // Sub-modals for menu rows & 4 top shortcuts
  const [activeSheet, setActiveSheet] = useState<
    'stats' | 'visitors' | 'invite' | 'contributions' | 'support' | 'settings' | null
  >(null);
  const [avatarVipModalTab, setAvatarVipModalTab] = useState<'vip' | 'frames' | null>(null);
  const [showRelationshipsModal, setShowRelationshipsModal] = useState(false);
  const [showFamilyHubModal, setShowFamilyHubModal] = useState(false);
  const [showMyHomeModal, setShowMyHomeModal] = useState(false);
  const [showGiftWallModal, setShowGiftWallModal] = useState(false);
  const [showRichProfileModal, setShowRichProfileModal] = useState(false);
  const [showCharmChartModal, setShowCharmChartModal] = useState(false);

  // Edit Profile field editor & crop state
  const [editingField, setEditingField] = useState<EditFieldKey>(null);
  const [fieldValue, setFieldValue] = useState('');
  const [savingField, setSavingField] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getPlayerProfile(user.userId, user.userId)
      .then((res) => {
        if (active && res?.success && res.profile) {
          setMyMomentsCount(res.profile.momentsCount ?? res.profile.moments?.length ?? 0);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user.userId]);

  const avatarSrc =
    user.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.userId)}`;
  const level = user.gameLevel || 1;
  const currentXp = user.gameXp || 0;
  const xpIntoLevel = currentXp % 60;
  const xpPercent = Math.min(100, Math.round((xpIntoLevel / 60) * 100));
  const vipCfg = getVipConfig(user.vipTier);

  const giftEntries: GiftWallEntry[] = Object.values(user.receivedGifts || {}).map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    count: g.count,
    coinCost: g.coinCost,
    charmValue: g.charmValue,
  }));

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(user.userId);
    setCopiedId(true);
    showToast(`✅ User ID ${user.userId} कॉपी हो गया!`, 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyInviteLink = (useUsername = false) => {
    const refVal = useUsername && user.username ? user.username : user.userId;
    const url = `${window.location.origin}/?ref=${refVal}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('✅ इनवाइट लिंक कॉपी हो गया!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const persistProfileUpdates = async (updates: Partial<UserProfile>, successMsg: string) => {
    setSavingField(true);
    try {
      const updated = await api.updateUserProfile(user.userId, updates);
      onUpdateUser(updated);
      syncUserToFirestore(updated, true).catch(() => {});
      showToast(successMsg, 'success');
      setEditingField(null);
    } catch (err: any) {
      showToast(err?.message || 'प्रोफाइल अपडेट करने में समस्या आई', 'error');
    } finally {
      setSavingField(false);
    }
  };

  const openFieldEditor = (field: EditFieldKey) => {
    setEditingField(field);
    switch (field) {
      case 'nickname':
        setFieldValue(user.fullName || '');
        break;
      case 'username':
        setFieldValue(user.username || '');
        break;
      case 'gender':
        setFieldValue(user.gender || 'male');
        break;
      case 'birthday':
        setFieldValue(user.birthday || '2000-01-01');
        break;
      case 'region':
        setFieldValue(user.location || 'India');
        break;
      case 'signature':
        setFieldValue(user.bio || '');
        break;
      case 'priceTag':
        setFieldValue(user.priceTag || '1 Ticket');
        break;
      case 'title':
        setFieldValue(user.vipTitle || vipCfg?.name || 'ESP Player');
        break;
      default:
        setFieldValue('');
    }
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;
    const val = fieldValue.trim();

    if (editingField === 'nickname') {
      if (!val) {
        showToast('कृपया नाम दर्ज करें', 'warning');
        return;
      }
      await persistProfileUpdates({ fullName: val }, '✅ Nickname अपडेट हो गया!');
    } else if (editingField === 'username') {
      const clean = val.replace(/^@+/, '').toLowerCase();
      if (clean && !/^[a-z0-9]{3,24}$/.test(clean)) {
        showToast('केवल 3-24 अक्षर (a-z, 0-9) बिना symbol लिखें', 'warning');
        return;
      }
      await persistProfileUpdates({ username: clean }, '✅ @Username अपडेट हो गया!');
    } else if (editingField === 'gender') {
      await persistProfileUpdates({ gender: val || 'male' }, '✅ Gender अपडेट हो गया!');
    } else if (editingField === 'birthday') {
      await persistProfileUpdates({ birthday: val }, '✅ Birthday अपडेट हो गई!');
    } else if (editingField === 'region') {
      await persistProfileUpdates({ location: val || 'India' }, '✅ Region अपडेट हो गया!');
    } else if (editingField === 'signature') {
      await persistProfileUpdates({ bio: val }, '✅ Signature अपडेट हो गया!');
    } else if (editingField === 'priceTag') {
      await persistProfileUpdates({ priceTag: val || '1 Ticket' }, '✅ Price Tag अपडेट हो गया!');
    } else if (editingField === 'title') {
      await persistProfileUpdates({ vipTitle: val }, '✅ Title अपडेट हो गया!');
    }
  };

  const handleToggleEspShowOnHome = async () => {
    const nextVal = !(user.showEspShowOnHome ?? true);
    await persistProfileUpdates(
      { showEspShowOnHome: nextVal },
      nextVal ? '✅ ESP Show होमपेज पर चालू किया गया' : 'ESP Show होमपेज से छुपाया गया'
    );
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCropSrc(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ===================== SCREEN 2: EDIT PROFILE (Exact Screenshot Style) =====================
  if (viewMode === 'edit-profile') {
    const genderLabel =
      user.gender === 'female' ? 'Female' : user.gender === 'other' ? 'Other' : 'Male';

    return (
      <div className="max-w-xl lg:max-w-2xl mx-auto w-full min-h-[82dvh] bg-[#f8fafc] pb-28">
        {/* Sticky Clean White Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMode('me')}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
            title="Back to Me"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-black text-slate-900">Edit Profile</h1>
          <button
            type="button"
            onClick={() => setShowRichProfileModal(true)}
            className="text-[11px] font-bold text-[#2874f0] hover:underline cursor-pointer"
          >
            Preview
          </button>
        </div>

        {/* Section 1: Avatar, Nickname, User ID (Click to Copy!), QR Contact Card */}
        <div className="bg-white mt-2 border-y border-slate-200/80 divide-y divide-slate-100">
          {/* Avatar Row */}
          <label className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition">
            <span className="text-sm font-semibold text-slate-800">Avatar</span>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={avatarSrc}
                  alt={user.fullName}
                  className="w-11 h-11 rounded-full object-cover border border-rose-200 bg-rose-50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#2874f0] text-white flex items-center justify-center shadow">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
          </label>

          {/* Nickname Row */}
          <button
            type="button"
            onClick={() => openFieldEditor('nickname')}
            className="w-full px-3.5 sm:px-4 py-3 min-h-[48px] flex items-center justify-between gap-2 hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-xs sm:text-sm font-semibold text-slate-800 shrink-0">Nickname</span>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 font-medium min-w-0 justify-end">
              <span className="truncate max-w-[145px] min-[380px]:max-w-[180px] text-slate-700 font-bold">{user.fullName}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </button>

          {/* User ID Row (Click to Copy User ID!) */}
          <button
            type="button"
            onClick={handleCopyUserId}
            className="w-full px-3.5 sm:px-4 py-3 min-h-[48px] flex items-center justify-between gap-2 hover:bg-amber-50/60 cursor-pointer transition text-left"
            title="Click to copy User ID"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-nowrap">User ID</span>
              <span className="text-[9.5px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 whitespace-nowrap shrink-0">
                Tap to Copy
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-mono font-bold text-slate-600 shrink-0">
              <span className="truncate max-w-[115px] min-[380px]:max-w-[160px]">{user.userId}</span>
              {copiedId ? (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-sans font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                  <Check className="w-3 h-3" /> Copied
                </span>
              ) : (
                <Copy className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </div>
          </button>

          {/* @Username Handle Row */}
          <button
            type="button"
            onClick={() => openFieldEditor('username')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">@Username</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="font-mono font-bold text-[#2874f0]">
                {user.username ? `@${user.username}` : 'Set handle'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          {/* QR Code Contact Card Row */}
          <button
            type="button"
            onClick={onShowIdCard}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">QR Code Contact Card</span>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-slate-600" />
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>

        {/* Section 2: Gender, Birthday, Region, Signature */}
        <div className="bg-white mt-2.5 border-y border-slate-200/80 divide-y divide-slate-100">
          <button
            type="button"
            onClick={() => openFieldEditor('gender')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Gender</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{genderLabel}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => openFieldEditor('birthday')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Birthday</span>
            <div className="flex items-center gap-2 text-sm text-slate-500 tabular-nums">
              <span>{user.birthday || '2000-01-01'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => openFieldEditor('region')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Region</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>🇮🇳 {user.location || 'India'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => openFieldEditor('signature')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Signature</span>
            <div className="flex items-center gap-2 text-sm text-slate-500 max-w-[200px]">
              <span className="truncate">{user.bio || 'Add signature'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </button>
        </div>

        {/* Section 3: Show ESP Show on homepage Toggle, Price Tag, Title */}
        <div className="bg-white mt-2.5 border-y border-slate-200/80 divide-y divide-slate-100">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Show ESP Show on your homepage
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={user.showEspShowOnHome ?? true}
              onClick={handleToggleEspShowOnHome}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                user.showEspShowOnHome ?? true ? 'bg-[#2874f0] justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-sm block" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => openFieldEditor('priceTag')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Price Tag</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{user.priceTag || '1 Ticket'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => openFieldEditor('title')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition text-left"
          >
            <span className="text-sm font-semibold text-slate-800">Title</span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{user.vipTitle || vipCfg?.name || 'ESP Player'}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>

        {/* Inline Modal Editor for Selected Field */}
        {editingField && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <form
              onSubmit={handleSaveField}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 capitalize">
                  Edit {editingField === 'priceTag' ? 'Price Tag' : editingField}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editingField === 'gender' ? (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold outline-none focus:border-[#2874f0]"
                >
                  <option value="male">Male (पुरुष ♂)</option>
                  <option value="female">Female (महिला ♀)</option>
                  <option value="other">Other (अन्य)</option>
                </select>
              ) : editingField === 'birthday' ? (
                <input
                  type="date"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold outline-none focus:border-[#2874f0]"
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={fieldValue}
                  onChange={(e) =>
                    setFieldValue(
                      editingField === 'username'
                        ? e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 24)
                        : e.target.value
                    )
                  }
                  placeholder={`Enter ${editingField}...`}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-[#2874f0]"
                />
              )}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingField}
                  className="px-5 py-2 rounded-xl bg-[#2874f0] hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {savingField && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {cropSrc && (
          <FacebookPhotoCropModal
            isOpen={Boolean(cropSrc)}
            imageSrc={cropSrc}
            kind="avatar"
            onCancel={() => setCropSrc(null)}
            onConfirm={async (cropped) => {
              setCropSrc(null);
              await persistProfileUpdates({ avatar: cropped }, '✅ Avatar फोटो अपडेट हो गई!');
            }}
            onChangeFile={(file) => {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') setCropSrc(reader.result);
              };
              reader.readAsDataURL(file);
            }}
          />
        )}

        <UserProfileSheetModal
          isOpen={showRichProfileModal}
          onClose={() => setShowRichProfileModal(false)}
          currentUser={user}
          onUpdateUser={onUpdateUser}
          onOpenMoments={() => {
            setShowRichProfileModal(false);
            onSelectTab('moments');
          }}
        />
      </div>
    );
  }

  // ===================== SCREEN 1: "ME" PAGE (Exact Screenshot Layout) =====================
  return (
    <div className="max-w-xl lg:max-w-2xl mx-auto w-full pb-28 space-y-3">
      {/* SOFT PASTEL PINK-TO-WHITE HEADER CARD */}
      <div className="bg-gradient-to-b from-[#ffd9e4] via-[#ffedf2] to-white px-3 min-[380px]:px-4 pt-4 sm:pt-5 pb-4 sm:rounded-b-3xl shadow-2xs border-b border-rose-100 space-y-4 sm:space-y-5">
        {/* Clickable Profile Banner Row -> Opens Edit Profile (Screen 2) */}
        <button
          type="button"
          onClick={() => setViewMode('edit-profile')}
          className="w-full flex items-center justify-between gap-2.5 sm:gap-3 text-left group cursor-pointer rounded-2xl p-1.5 -mx-1 hover:bg-white/50 transition"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-14 h-14 min-[380px]:w-16 min-[380px]:h-16 rounded-2xl bg-[#ffb3c6] border-2 border-white shadow-sm overflow-hidden shrink-0">
              <img
                src={avatarSrc}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base min-[380px]:text-lg font-black text-slate-900 truncate max-w-full">
                  {user.fullName}
                </span>
                {(() => {
                  const charmInfo = resolveCharmTier(user.charms || 0);
                  return (
                    <CharmTierEmblem
                      category={charmInfo.current.category}
                      tier={charmInfo.current.tier}
                      size="xs"
                    />
                  );
                })()}
                {user.username && (
                  <span className="text-[10px] min-[380px]:text-[11px] font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded-full border border-rose-200 whitespace-nowrap">
                    @{user.username}
                  </span>
                )}
              </div>

              {/* Level + EXP Progress Bar (Exact Screenshot Look: Lv.1 [====] 0/60) */}
              <div className="flex items-center gap-2 max-w-[230px]">
                <span className="text-[11px] font-black text-slate-700 shrink-0 tabular-nums">
                  Lv.{level}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/90 border border-rose-200/70 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all"
                    style={{ width: `${Math.max(6, xpPercent)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 shrink-0 tabular-nums">
                  {xpIntoLevel}/60
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] font-bold text-slate-500">
                <span className="font-mono">ID: {user.userId}</span>
                <span>•</span>
                <span className="tabular-nums">🪙 {(user.coins || 0).toLocaleString()}</span>
                <span>•</span>
                <span className="tabular-nums">Room: {user.roomAddress || '10001'}</span>
              </div>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-0.5 transition shrink-0" />
        </button>

        {/* 4 SHORTCUT ICONS ROW: VIP, Shop, ESP Show, Love Home */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 pt-1 text-center">
          <button
            type="button"
            onClick={() => setAvatarVipModalTab('vip')}
            className="relative flex flex-col items-center gap-1.5 py-1.5 rounded-2xl hover:bg-white/70 transition cursor-pointer group min-w-0"
          >
            <span className="absolute -top-1 right-0.5 sm:right-2 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black shadow-2xs whitespace-nowrap">
              {user.vipTier && user.vipTier !== 'none' ? user.vipTier.toUpperCase() : 'VIP Pass'}
            </span>
            <div className="w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition">
              <Crown className="w-5 h-5 drop-shadow-xs" />
            </div>
            <span className="text-[10px] min-[380px]:text-[11px] font-bold text-slate-800 whitespace-nowrap">VIP</span>
          </button>

          <button
            type="button"
            onClick={onOpenRecharge}
            className="flex flex-col items-center gap-1.5 py-1.5 rounded-2xl hover:bg-white/70 transition cursor-pointer group min-w-0"
          >
            <div className="w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-pink-600 text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5 drop-shadow-xs" />
            </div>
            <span className="text-[10px] min-[380px]:text-[11px] font-bold text-slate-800 whitespace-nowrap">Shop</span>
          </button>

          <button
            type="button"
            onClick={() => setAvatarVipModalTab('frames')}
            className="flex flex-col items-center gap-1.5 py-1.5 rounded-2xl hover:bg-white/70 transition cursor-pointer group min-w-0"
          >
            <div className="w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5 drop-shadow-xs" />
            </div>
            <span className="text-[10px] min-[380px]:text-[11px] font-bold text-slate-800 whitespace-nowrap">ESP Show</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMyHomeModal(true)}
            className="flex flex-col items-center gap-1.5 py-1.5 rounded-2xl hover:bg-white/70 transition cursor-pointer group min-w-0"
          >
            <div className="w-10 h-10 min-[380px]:w-11 min-[380px]:h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-pink-600 text-white shadow-sm flex items-center justify-center group-hover:scale-105 transition">
              <Heart className="w-5 h-5 fill-white/90 drop-shadow-xs" />
            </div>
            <span className="text-[10px] min-[380px]:text-[11px] font-bold text-slate-800 whitespace-nowrap">Love Home</span>
          </button>
        </div>
      </div>

      {/* WHITE MENU LIST CARD (Exact 7 Rows from Screenshot) */}
      <div className="mx-3 bg-white rounded-2xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {/* 1. Moments */}
        <button
          type="button"
          onClick={() => onSelectTab('moments')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Home className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Moments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
              {myMomentsCount} Posts
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 2. Stats */}
        <button
          type="button"
          onClick={() => setActiveSheet('stats')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Trophy className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Stats</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-amber-600 tabular-nums">
              Lv.{level} · {user.totalGamesPlayed || 0} Games
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 3. Visitors */}
        <button
          type="button"
          onClick={() => setActiveSheet('visitors')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Eye className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Visitors</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
              {user.visitorCount || 0} Views · {(user.friendsList || []).length} Friends
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 4. Invite Friends */}
        <button
          type="button"
          onClick={() => setActiveSheet('invite')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <UserPlus className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Invite Friends</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-orange-500">Earn 🎁</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 5. Contributions */}
        <button
          type="button"
          onClick={() => setActiveSheet('contributions')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Briefcase className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Contributions</span>
          </div>
          <div className="flex items-center gap-2">
            {(() => {
              const charmInfo = resolveCharmTier(user.charms || 0);
              return (
                <span
                  className={`inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r ${charmInfo.current.pillGradient} text-white tabular-nums shadow-2xs`}
                >
                  <CharmTierEmblem
                    category={charmInfo.current.category}
                    tier={charmInfo.current.tier}
                    size="xs"
                  />
                  <span>{charmInfo.charms.toLocaleString('en-IN')}</span>
                </span>
              );
            })()}
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 6. Customer Service */}
        <button
          type="button"
          onClick={() => setActiveSheet('support')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Headphones className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Customer Service</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 7. Settings */}
        <button
          type="button"
          onClick={() => setActiveSheet('settings')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <Settings className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">Settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Quick Social Cards Row below Menu (Weekly Rewards, Relationships, Family, Gift Wall) */}
      <div className="mx-3 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onOpenWeeklyRewards}
          className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center gap-2.5 text-left cursor-pointer hover:brightness-98 transition"
        >
          <Gift className="w-5 h-5 text-[#fb641b] shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">Weekly Rewards</div>
            <div className="text-[10px] text-amber-800 font-semibold">Day 1–7 Live IST</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowRelationshipsModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 flex items-center gap-2.5 text-left cursor-pointer hover:brightness-98 transition"
        >
          <Heart className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">CP &amp; Bonds</div>
            <div className="text-[10px] text-rose-700 font-semibold">Bestie · Soulmate</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowFamilyHubModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-center gap-2.5 text-left cursor-pointer hover:brightness-98 transition"
        >
          <Shield className="w-5 h-5 text-purple-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">ESP Family Hub</div>
            <div className="text-[10px] text-purple-700 font-semibold">Family Chat &amp; Gifts</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setShowGiftWallModal(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-cyan-50 to-sky-50 border border-cyan-200 flex items-center gap-2.5 text-left cursor-pointer hover:brightness-98 transition"
        >
          <Sparkles className="w-5 h-5 text-cyan-600 shrink-0" />
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 truncate">Gift Wall</div>
            <div className="text-[10px] text-cyan-700 font-semibold">
              {giftEntries.reduce((s, g) => s + g.count, 0)} Lit Gifts
            </div>
          </div>
        </button>
      </div>

      {/* ===================== DETAIL SHEETS FOR ME MENU ITEMS ===================== */}
      {activeSheet && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[88dvh] flex flex-col">
            <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {activeSheet === 'stats' && '🏆 Player Stats & Level'}
                {activeSheet === 'visitors' && '👀 Profile Visitors & Friends'}
                {activeSheet === 'invite' && '🎁 Invite Friends & Earn'}
                {activeSheet === 'contributions' && '💼 Contributions & Rewards'}
                {activeSheet === 'support' && '🎧 ESP Customer Service'}
                {activeSheet === 'settings' && '⚙️ Account Settings'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSheet(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-sm">
              {activeSheet === 'stats' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                      <div className="text-[11px] font-bold text-amber-800">Coins Balance</div>
                      <div className="text-lg font-black text-amber-950 tabular-nums">
                        🪙 {(user.coins || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="text-[11px] font-bold text-blue-800">Level / EXP</div>
                      <div className="text-lg font-black text-blue-950 tabular-nums">
                        Lv.{level} ({currentXp})
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-pink-50 border border-pink-200">
                      <div className="text-[11px] font-bold text-pink-800">Charms</div>
                      <div className="text-lg font-black text-pink-950 tabular-nums">
                        ✨ {(user.charms || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="text-[11px] font-bold text-emerald-800">Games Played</div>
                      <div className="text-lg font-black text-emerald-950 tabular-nums">
                        🎮 {user.totalGamesPlayed || 0}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      onSelectTab('gaming-room');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2874f0] text-white text-xs font-black cursor-pointer"
                  >
                    🎮 Games &amp; Ranking देखें
                  </button>
                </div>
              )}

              {activeSheet === 'visitors' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-500">Total Profile Views</div>
                      <div className="text-xl font-black text-slate-900 tabular-nums">
                        👀 {user.visitorCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-500">Added Friends</div>
                      <div className="text-xl font-black text-[#2874f0] tabular-nums">
                        🤝 {(user.friendsList || []).length}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      setShowRichProfileModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2874f0] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Open Full Profile &amp; @Username Search</span>
                  </button>
                </div>
              )}

              {activeSheet === 'invite' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    अपने दोस्तों को ESP PLAY पर इनवाइट करें और रेफरल बोनस व टीम रिवॉर्ड पाएं।
                  </p>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="text-[11px] font-bold text-amber-900">Your Referral ID:</div>
                    <div className="font-mono text-sm font-black text-slate-900">{user.userId}</div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyInviteLink(false)}
                        className="flex-1 py-2 rounded-xl bg-[#fb641b] text-white text-xs font-black flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? 'Copied!' : 'Copy Invite Link'}</span>
                      </button>
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                          `🎮 Join ESP PLAY Voice Rooms & Games with my Invite ID (${user.userId}): ${window.location.origin}/?ref=${user.userId}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#388e3c] text-white text-xs font-black flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeSheet === 'contributions' && (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900">Family Contributions</span>
                    <span className="text-sm font-black text-purple-950 tabular-nums">
                      🪙 {(user.familyCoinsContributed || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">Login Streak</span>
                    <span className="text-sm font-black text-amber-950 tabular-nums">
                      🔥 {user.loginStreak || 0} Days
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      setShowFamilyHubModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black cursor-pointer"
                  >
                    Open ESP Family Hub
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      setShowCharmChartModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#2874f0] to-indigo-600 text-white text-xs font-black cursor-pointer"
                  >
                    ⭐ View Charm Star, Diamond &amp; Crown Ranks
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      onOpenWeeklyRewards();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#fb641b] text-white text-xs font-black cursor-pointer"
                  >
                    Open Weekly Reward Claims (Day 1–7)
                  </button>
                </div>
              )}

              {activeSheet === 'support' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5 text-xs">
                    <div className="font-black text-slate-900">ESP PLAY Official Helpdesk</div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>{settings.supportPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Mail className="w-3.5 h-3.5 text-[#2874f0]" />
                      <span>{settings.supportEmail}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      onSelectTab('chat-club');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#2874f0] text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open ESP Help &amp; Chat Club</span>
                  </button>
                </div>
              )}

              {activeSheet === 'settings' && (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSheet(null);
                      setViewMode('edit-profile');
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-xs font-black cursor-pointer"
                  >
                    <span>Edit Profile &amp; Copy User ID</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                      💼 Earning Setup (Optional Menu)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSheet(null);
                          onSelectTab('dashboard');
                        }}
                        className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left cursor-pointer"
                      >
                        <Briefcase className="w-4 h-4 text-emerald-700 mb-1" />
                        <div className="text-xs font-black text-emerald-950">Earning Dashboard</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">SWI · NWI · रेफरल</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSheet(null);
                          onSelectTab('services');
                        }}
                        className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-[#2874f0] mb-1" />
                        <div className="text-xs font-black text-blue-950">10 Earning Plans</div>
                        <div className="text-[10px] text-blue-700 font-semibold">EMO · MMO · NWI</div>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSheet(null);
                          onOpenAdmin();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-[#ffe500] hover:bg-yellow-300 text-slate-900 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Panel</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSheet(null);
                        onLogout();
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Feature Modals triggered directly from Me Page */}
      {avatarVipModalTab && (
        <AvatarCustomizerModal
          isOpen={Boolean(avatarVipModalTab)}
          user={user}
          initialTab={avatarVipModalTab}
          onClose={() => setAvatarVipModalTab(null)}
          onUpdateUser={onUpdateUser}
          onOpenBuyCoins={() => {
            setAvatarVipModalTab(null);
            onOpenRecharge();
          }}
        />
      )}

      {showRelationshipsModal && (
        <RelationshipBondsModal
          user={user}
          onClose={() => setShowRelationshipsModal(false)}
          onUserUpdated={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowRelationshipsModal(false);
            onOpenRecharge();
          }}
        />
      )}

      {showFamilyHubModal && (
        <EspFamilyHubModal
          user={user}
          onClose={() => setShowFamilyHubModal(false)}
          onUserUpdated={onUpdateUser}
          onOpenBuyCoins={() => {
            setShowFamilyHubModal(false);
            onOpenRecharge();
          }}
        />
      )}

      {showMyHomeModal && (
        <EspEventsAndMyHomeModal
          user={user}
          initialTab="my_home"
          onClose={() => setShowMyHomeModal(false)}
          onUserUpdated={onUpdateUser}
          onOpenRelationships={() => {
            setShowMyHomeModal(false);
            setShowRelationshipsModal(true);
          }}
          onOpenFamily={() => {
            setShowMyHomeModal(false);
            setShowFamilyHubModal(true);
          }}
          onOpenGiftWall={() => {
            setShowMyHomeModal(false);
            setShowGiftWallModal(true);
          }}
        />
      )}

      <GiftWallModal
        isOpen={showGiftWallModal}
        recipientUserId={user.userId}
        recipientName={user.fullName}
        recipientAvatar={avatarSrc}
        recipientRoomAddress={user.roomAddress || '10001'}
        isVipRoom={Boolean(user.isVipRoom || isVipFancyRoomNumber(user.roomAddress))}
        giftWall={giftEntries}
        isOwnProfile
        onClose={() => setShowGiftWallModal(false)}
      />

      <UserProfileSheetModal
        isOpen={showRichProfileModal}
        onClose={() => setShowRichProfileModal(false)}
        currentUser={user}
        onUpdateUser={onUpdateUser}
        onOpenMoments={() => {
          setShowRichProfileModal(false);
          onSelectTab('moments');
        }}
      />

      <CharmTierChartModal
        isOpen={showCharmChartModal}
        charms={user.charms || 0}
        playerName={user.fullName}
        onClose={() => setShowCharmChartModal(false)}
      />
    </div>
  );
};
