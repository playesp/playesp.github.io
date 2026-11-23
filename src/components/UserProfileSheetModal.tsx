import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Search,
  Copy,
  Check,
  UserPlus,
  UserCheck,
  Gift,
  Camera,
  Sparkles,
  Crown,
  MapPin,
  Edit3,
  ShieldCheck,
  Loader2,
  X,
  Image as ImageIcon,
  ChevronRight,
  Users,
  Crop,
  Radio,
  HeartHandshake,
  Trash2,
  Plus,
  MapPin as MapPinIcon,
} from 'lucide-react';
import { getRelationshipTokenSpec } from '../config/espSocialCatalog.ts';
import type { UserProfile, Moment } from '../types/index.ts';
import { api } from '../services/api.ts';
import { syncUserToFirestore } from '../services/firebase.ts';
import { showToast } from '../services/toast.ts';
import { AvatarFrame, type FrameVariant } from './AvatarFrame.tsx';
import { getFrameByVariant, getVipConfig } from '../config/economy.ts';
import { FacebookPhotoCropModal } from './FacebookPhotoCropModal.tsx';
import { GiftWallModal, type GiftWallEntry } from './GiftWallModal.tsx';
import { FacebookMomentComposerModal } from './FacebookMomentComposerModal.tsx';
import { MomentPostContent } from './MomentPostContent.tsx';
import { getMomentTextClasses } from '../config/momentStyles.ts';
import { CharmTierEmblem, CharmTierChartModal } from './CharmTierBadge.tsx';
import { resolveCharmTier } from '../config/charmTiers.ts';
import {
  ALL_GIFTS_CATALOG,
  isVipFancyRoomNumber,
  resolveCanonicalGiftId,
} from '../config/giftCatalog.ts';

export interface RichProfileData {
  userId: string;
  gamingId?: string;
  username?: string;
  fullName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  gender?: string;
  location?: string;
  accountType?: 'business' | 'gamer';
  payoutUpiId?: string;
  chosenServiceCode?: string;
  chosenServiceName?: string;
  coins?: number;
  charms?: number;
  gameLevel?: number;
  gameXp?: number;
  vipTier?: 'none' | 'silver' | 'gold' | 'diamond' | string;
  vipTitle?: string;
  frameType?: string;
  clanName?: string;
  clanRole?: string;
  roomAddress?: string;
  isVipRoom?: boolean;
  vipRoomLabel?: string;
  friendsCount?: number;
  friendsList?: string[];
  isFriend?: boolean;
  isOnline?: boolean;
  role?: string;
  moments?: Moment[];
  momentsCount?: number;
  giftWall?: GiftWallEntry[];
  totalGiftsLit?: number;
  activeRelationships?: Array<{
    id: string;
    tokenId: string;
    tagName: string;
    badgeIcon: string;
    partnerUserId: string;
    partnerName: string;
    partnerAvatar?: string;
    intimacyPoints: number;
    status: string;
  }>;
  familySummary?: {
    id: string;
    name: string;
    emblem: string;
    familyCode: string;
    level: number;
    familyCoins: number;
  } | null;
}

interface UserProfileSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  targetUserId?: string; // defaults to currentUser.userId
  initialProfile?: Partial<RichProfileData> | null;
  initialMode?: 'view' | 'edit' | 'search';
  onUpdateUser: (updatedUser: UserProfile) => void;
  onSendGift?: (profile: RichProfileData, initialGiftId?: string) => void;
  onOpenAvatarCustomizer?: () => void;
  onOpenMoments?: () => void;
  onVisitVoiceRoom?: (roomAddressOrUserId: string) => void;
  onOpenRelationships?: (targetIdentifier?: string) => void;
  onOpenFamily?: () => void;
}

export const UserProfileSheetModal: React.FC<UserProfileSheetModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUserId,
  initialProfile,
  initialMode = 'view',
  onUpdateUser,
  onSendGift,
  onOpenAvatarCustomizer,
  onOpenMoments,
  onVisitVoiceRoom,
  onOpenRelationships,
  onOpenFamily,
}) => {
  const [viewedUserId, setViewedUserId] = useState<string>(targetUserId || currentUser.userId);
  const [mode, setMode] = useState<'view' | 'edit' | 'search'>(initialMode);
  const [profile, setProfile] = useState<RichProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [copiedKey, setCopiedKey] = useState<'id' | 'username' | null>(null);
  const [friendBusy, setFriendBusy] = useState(false);
  const [previewMoment, setPreviewMoment] = useState<Moment | null>(null);
  const [showMomentComposer, setShowMomentComposer] = useState(false);
  const [confirmDeleteMomentId, setConfirmDeleteMomentId] = useState<string | null>(null);
  const [deletingMomentId, setDeletingMomentId] = useState<string | null>(null);
  const [showGiftWallModal, setShowGiftWallModal] = useState(false);
  const [showCharmChartModal, setShowCharmChartModal] = useState(false);

  // Edit profile form state
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editGender, setEditGender] = useState('male');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editCoverPhoto, setEditCoverPhoto] = useState('');
  const [editAccountType, setEditAccountType] = useState<'business' | 'gamer'>('gamer');
  const [editUpi, setEditUpi] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    valid: boolean;
    available: boolean;
    normalized: string;
    message: string;
  } | null>(null);

  // @Username Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RichProfileData[]>([]);
  const [searching, setSearching] = useState(false);

  // Facebook-style Photo Crop & Reposition modal state
  const [cropModalState, setCropModalState] = useState<{
    open: boolean;
    kind: 'avatar' | 'cover';
    src: string;
    autoSave: boolean;
  }>({ open: false, kind: 'avatar', src: '', autoSave: false });

  const loadRichProfile = useCallback(
    async (uid: string, fallback?: Partial<RichProfileData> | null) => {
      setLoadingProfile(true);
      try {
        const res = await api.getPlayerProfile(uid, currentUser.userId);
        if (res?.success && res.profile) {
          setProfile(res.profile);
          return;
        }
      } catch {
        // Fallback below
      } finally {
        setLoadingProfile(false);
      }
      if (fallback) {
        setProfile({
          userId: fallback.userId || uid,
          fullName: fallback.fullName || 'ESP Member',
          ...fallback,
        });
      } else if (uid === currentUser.userId) {
        setProfile(currentUser);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!isOpen) return;
    const uid = targetUserId || initialProfile?.userId || currentUser.userId;
    setViewedUserId(uid);
    setMode(initialMode);
    setEditError(null);
    setPreviewMoment(null);
    loadRichProfile(uid, initialProfile || (uid === currentUser.userId ? currentUser : null));
  }, [isOpen, targetUserId, initialMode, currentUser.userId]);

  const isOwnProfile =
    (profile?.userId || viewedUserId).toLowerCase() === currentUser.userId.toLowerCase();

  // Populate edit form whenever entering edit mode
  useEffect(() => {
    if (mode === 'edit') {
      const src = isOwnProfile ? { ...currentUser, ...profile } : currentUser;
      setEditFullName(src.fullName || '');
      setEditUsername(src.username || '');
      setEditLocation(src.location || 'India');
      setEditGender(src.gender || 'male');
      setEditBio(src.bio || '');
      setEditAvatar(src.avatar || '');
      setEditCoverPhoto(src.coverPhoto || '');
      setEditAccountType(src.accountType === 'business' ? 'business' : 'gamer');
      setEditUpi(src.payoutUpiId || '');
      setEditError(null);
    }
  }, [mode, isOwnProfile, currentUser, profile]);

  // Debounced live @username uniqueness check
  useEffect(() => {
    if (mode !== 'edit') return;
    const raw = editUsername.trim().replace(/^@+/, '');
    if (!raw) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus(prev => ({
      checking: true,
      valid: prev?.valid ?? true,
      available: prev?.available ?? false,
      normalized: raw.toLowerCase(),
      message: 'उपलब्धता जाँची जा रही है...',
    }));
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsernameAvailability(raw, currentUser.userId);
        setUsernameStatus({
          checking: false,
          valid: res.valid,
          available: res.available,
          normalized: res.normalized,
          message: res.message,
        });
      } catch {
        setUsernameStatus(null);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [editUsername, mode, currentUser.userId]);

  // Load search results
  const runSearch = useCallback(
    async (q: string) => {
      setSearching(true);
      try {
        const res = await api.searchUsersByUsername(q, currentUser.userId);
        if (res?.success && Array.isArray(res.users)) {
          setSearchResults(res.users);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [currentUser.userId]
  );

  useEffect(() => {
    if (mode !== 'search') return;
    const timer = setTimeout(() => {
      runSearch(searchQuery);
    }, 220);
    return () => clearTimeout(timer);
  }, [searchQuery, mode, runSearch]);

  if (!isOpen) return null;

  const displayData: RichProfileData = profile || {
    userId: viewedUserId,
    fullName: initialProfile?.fullName || currentUser.fullName,
    avatar: initialProfile?.avatar || currentUser.avatar,
  };

  const frameItem = getFrameByVariant(displayData.frameType || 'standard');
  const vipCfg = getVipConfig(displayData.vipTier);
  const displayAvatar =
    displayData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayData.userId)}`;
  const targetOwnerId = (displayData.userId || viewedUserId || '').toLowerCase();
  const momentsList = (Array.isArray(displayData.moments) ? displayData.moments : []).filter(
    (m) =>
      m.userId?.toLowerCase() === targetOwnerId ||
      m.userRollNumber?.toLowerCase() === targetOwnerId
  );
  const giftWall = Array.isArray(displayData.giftWall) ? displayData.giftWall : [];
  const totalGiftsLit = displayData.totalGiftsLit ?? giftWall.reduce((s, g) => s + (g.count || 0), 0);
  const friendsCount =
    displayData.friendsCount ??
    (Array.isArray(displayData.friendsList) ? displayData.friendsList.length : 0);
  const isFriend = Boolean(
    displayData.isFriend ??
      (Array.isArray(currentUser.friendsList) && currentUser.friendsList.includes(displayData.userId))
  );

  const handleCopy = (value: string, key: 'id' | 'username') => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    showToast(key === 'username' ? `✅ ${value} कॉपी किया गया!` : `✅ ID ${value} कॉपी की गई!`, 'success');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleToggleFriend = async (targetId: string) => {
    if (friendBusy || targetId === currentUser.userId) return;
    setFriendBusy(true);
    try {
      const res = await api.toggleFriend(currentUser.userId, targetId);
      if (res.success) {
        if (res.user) onUpdateUser(res.user);
        setProfile(prev =>
          prev && prev.userId === targetId
            ? {
                ...prev,
                isFriend: res.isFriend,
                friendsCount: res.targetFriendsCount ?? prev.friendsCount,
              }
            : prev
        );
        setSearchResults(prev =>
          prev.map(u =>
            u.userId === targetId
              ? {
                  ...u,
                  isFriend: res.isFriend,
                  friendsCount: res.targetFriendsCount ?? u.friendsCount,
                }
              : u
          )
        );
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'फ्रेंड अपडेट करने में त्रुटि आई', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'फ्रेंड जोड़ने में समस्या आई', 'error');
    } finally {
      setFriendBusy(false);
    }
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (deletingMomentId) return;
    setDeletingMomentId(momentId);
    try {
      await api.deleteMoment(momentId, currentUser.userId);
      setProfile((prev) => {
        if (!prev) return prev;
        const remaining = (prev.moments || []).filter((m) => m.id !== momentId);
        return {
          ...prev,
          moments: remaining,
          momentsCount: remaining.length,
        };
      });
      if (previewMoment?.id === momentId) {
        setPreviewMoment(null);
      }
      setConfirmDeleteMomentId(null);
      showToast('🗑️ मोमेंट सफलतापूर्वक डिलीट हो गया!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'मोमेंट डिलीट करने में समस्या आई', 'error');
    } finally {
      setDeletingMomentId(null);
    }
  };

  const openCropFromFile = (
    file: File,
    kind: 'avatar' | 'cover',
    autoSave = false
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => {
      showToast('फोटो लोड नहीं हो सकी। कृपया दूसरी फोटो चुनें।', 'error');
    };
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result) {
        setCropModalState({
          open: true,
          kind,
          src: reader.result,
          autoSave,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const openCropFromExisting = (
    src: string,
    kind: 'avatar' | 'cover',
    autoSave = false
  ) => {
    if (!src) {
      showToast('पहले कोई फोटो चुनें या अपलोड करें।', 'error');
      return;
    }
    setCropModalState({
      open: true,
      kind,
      src,
      autoSave,
    });
  };

  const handleConfirmCroppedPhoto = async (croppedDataUrl: string) => {
    const { kind, autoSave } = cropModalState;
    setCropModalState(prev => ({ ...prev, open: false }));

    if (autoSave) {
      setSavingProfile(true);
      try {
        const payload =
          kind === 'cover' ? { coverPhoto: croppedDataUrl } : { avatar: croppedDataUrl };
        const updated = await api.updateUserProfile(currentUser.userId, payload);
        onUpdateUser(updated);
        syncUserToFirestore(updated, true).catch(() => {});
        await loadRichProfile(updated.userId, updated);
        showToast(
          kind === 'cover'
            ? '✅ कवर फोटो एडजस्ट व सेव हो गई!'
            : '✅ प्रोफाइल फोटो क्रॉप व सेव हो गई!',
          'success'
        );
      } catch (err: any) {
        showToast(err?.message || 'फोटो सेव करने में त्रुटि आई।', 'error');
      } finally {
        setSavingProfile(false);
      }
      return;
    }

    if (kind === 'cover') {
      setEditCoverPhoto(croppedDataUrl);
      showToast('🖼️ कवर फोटो एडजस्ट हो गई — Save Profile दबाएं!', 'success');
    } else {
      setEditAvatar(croppedDataUrl);
      showToast('📷 प्रोफाइल फोटो क्रॉप हो गई — Save Profile दबाएं!', 'success');
    }
  };

  const handleSaveProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editFullName.trim()) {
      setEditError('कृपया अपना डिस्प्ले नाम दर्ज करें।');
      return;
    }
    const cleanHandle = editUsername.trim().replace(/^@+/, '').toLowerCase();
    if (cleanHandle) {
      if (!/^[a-z0-9]{3,24}$/.test(cleanHandle)) {
        setEditError('यूनिक यूज़रनेम में कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें।');
        return;
      }
      if (usernameStatus && (!usernameStatus.valid || !usernameStatus.available)) {
        setEditError(usernameStatus.message || 'यह @username उपलब्ध नहीं है। कृपया दूसरा चुनें।');
        return;
      }
    }

    setSavingProfile(true);
    try {
      const updated = await api.updateUserProfile(currentUser.userId, {
        fullName: editFullName.trim(),
        username: cleanHandle || undefined,
        location: editLocation.trim() || 'India',
        gender: editGender,
        bio: editBio.trim(),
        avatar: editAvatar,
        coverPhoto: editCoverPhoto,
        accountType: editAccountType,
        payoutUpiId: editUpi.trim(),
        paymentAddress: editUpi.trim() || currentUser.paymentAddress,
      });
      onUpdateUser(updated);
      syncUserToFirestore(updated, true).catch(() => {});
      await loadRichProfile(updated.userId, updated);
      setMode('view');
      showToast('✅ प्रोफाइल और यूनिक @Username सफलतापूर्वक सेव हो गया!', 'success');
    } catch (err: any) {
      setEditError(err?.message || 'प्रोफाइल सेव करने में त्रुटि आई।');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-xs sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-[#212121]">
        {/* ================= MODE 1: ESP PLAY RICH PROFILE SHEET ================= */}
        {mode === 'view' && (
          <>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
              {/* TOP COVER PHOTO HERO */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden select-none">
                {displayData.coverPhoto ? (
                  <img
                    src={displayData.coverPhoto}
                    alt={`${displayData.fullName} Cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950">
                    <img
                      src={displayAvatar}
                      alt={displayData.fullName}
                      className="w-full h-full object-cover opacity-55 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/45 pointer-events-none" />

                {/* Floating Top Controls (< Back, Search, ... Edit) */}
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
                  <button
                    type="button"
                    onClick={() => {
                      if (viewedUserId !== currentUser.userId && !targetUserId) {
                        setViewedUserId(currentUser.userId);
                        loadRichProfile(currentUser.userId, currentUser);
                      } else {
                        onClose();
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white flex items-center justify-center transition cursor-pointer"
                    title="वापस जाएं"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('search')}
                      className="h-9 px-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="@Username से दोस्त खोजें"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Find @</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (isOwnProfile) {
                          setMode('edit');
                        } else {
                          handleCopy(
                            displayData.username ? `@${displayData.username}` : displayData.userId,
                            displayData.username ? 'username' : 'id'
                          );
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white flex items-center justify-center transition cursor-pointer"
                      title={isOwnProfile ? 'Edit Profile & @Username' : 'Copy Profile ID'}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Overlapping framed Avatar + Facebook-style Quick Cover & Avatar Crop Controls */}
                <div className="absolute bottom-10 left-4 right-4 flex items-end justify-between gap-2 z-10 pointer-events-none">
                  <div className="pointer-events-auto relative">
                    <AvatarFrame
                      src={displayAvatar}
                      alt={displayData.fullName}
                      size="lg"
                      frameType={(displayData.frameType as FrameVariant) || 'standard'}
                      vipTier={displayData.vipTier}
                      level={displayData.gameLevel || 1}
                      showCrown={
                        displayData.frameType === 'clan-leader' ||
                        displayData.frameType === 'royal-dragon-crown'
                      }
                    />
                    {isOwnProfile && (
                      <label
                        title="प्रोफाइल फोटो बदलें व क्रॉप करें"
                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 shadow-md flex items-center justify-center cursor-pointer transition"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#1877f2]" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) openCropFromFile(f, 'avatar', true);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
                      {displayData.coverPhoto && (
                        <button
                          type="button"
                          onClick={() => openCropFromExisting(displayData.coverPhoto!, 'cover', true)}
                          className="px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold flex items-center gap-1 border border-white/25 backdrop-blur-xs cursor-pointer transition"
                          title="कवर फोटो की पोज़िशन एडजस्ट करें"
                        >
                          <Crop className="w-3 h-3" />
                          <span>Adjust Cover</span>
                        </button>
                      )}
                      <label className="px-2.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold flex items-center gap-1 border border-white/25 backdrop-blur-xs cursor-pointer transition">
                        <Camera className="w-3 h-3" />
                        <span>{displayData.coverPhoto ? 'Cover' : 'Add Cover'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) openCropFromFile(f, 'cover', true);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('edit')}
                        className="px-2.5 py-1.5 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-[10px] font-bold flex items-center gap-1 border border-white/25 shadow cursor-pointer transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* OVERLAPPING WHITE ROUNDED SHEET */}
              <div className="relative -mt-6 rounded-t-[26px] bg-white px-5 pt-5 space-y-4">
                {loadingProfile && !profile && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2874f0]" />
                    <span>प्रोफाइल लोड हो रही है...</span>
                  </div>
                )}

                {/* Row 1: Display Name + Charm Emblem + @username + Location */}
                <div className="flex items-start justify-between gap-2 pb-1">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight truncate">
                        {displayData.fullName}
                      </h2>
                      {(() => {
                        const charmInfo = resolveCharmTier(displayData.charms || 0);
                        return (
                          <button
                            type="button"
                            onClick={() => setShowCharmChartModal(true)}
                            className="inline-flex items-center justify-center p-0.5 rounded-md hover:scale-110 transition cursor-pointer shrink-0"
                            title={`${charmInfo.current.label} (${charmInfo.charms.toLocaleString('en-IN')} Charms) — Click for Charm Ranks`}
                          >
                            <CharmTierEmblem
                              category={charmInfo.current.category}
                              tier={charmInfo.current.tier}
                              size="sm"
                            />
                          </button>
                        );
                      })()}
                    </div>

                    {/* @Username Handle Pill */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {displayData.username ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(`@${displayData.username}`, 'username')}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-extrabold cursor-pointer transition"
                        >
                          <span>@{displayData.username}</span>
                          {copiedKey === 'username' ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-70" />
                          )}
                        </button>
                      ) : isOwnProfile ? (
                        <button
                          type="button"
                          onClick={() => setMode('edit')}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold cursor-pointer transition"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>+ सेट करें अपना यूनिक @username</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">No @username set</span>
                      )}
                    </div>
                  </div>

                  {/* Location / Online Status */}
                  <div className="text-right shrink-0 space-y-1">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{displayData.location || 'India'}</span>
                    </div>
                    <div className="text-[10px] font-bold">
                      {displayData.isOnline ? (
                        <span className="text-emerald-600">● Online Now</span>
                      ) : (
                        <span className="text-slate-400">Registered Player</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Gender + Level + Coins + Charm Star/Diamond/Crown Pill + Club */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black text-white shadow-xs border border-white/30 ${
                        displayData.gender === 'female'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                          : 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7]'
                      }`}
                    >
                      <span>{displayData.gender === 'female' ? '♀' : '♂'}</span>
                      <span className="tabular-nums">Lv.{displayData.gameLevel || 1}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-xs border border-amber-200">
                      <span>🪙</span>
                      <span className="tabular-nums">{(displayData.coins || 0).toLocaleString()}</span>
                    </span>

                    {(() => {
                      const charmInfo = resolveCharmTier(displayData.charms || 0);
                      return (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowCharmChartModal(true)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setShowCharmChartModal(true);
                            }
                          }}
                          title="ESP Charm Tier — Tap to view Star, Diamond & Crown Ranks"
                          className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r ${charmInfo.current.pillGradient} ${charmInfo.current.textColor} border ${charmInfo.current.pillBorder} shadow-sm cursor-pointer hover:brightness-110 transition`}
                        >
                          <CharmTierEmblem
                            category={charmInfo.current.category}
                            tier={charmInfo.current.tier}
                            size="xs"
                          />
                          <span className="tabular-nums tracking-tight">
                            {charmInfo.charms.toLocaleString('en-IN')}
                          </span>
                        </span>
                      );
                    })()}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                    <span>🇮🇳</span>
                    <span>{displayData.clanName || 'ESP Club'}</span>
                  </span>
                </div>

                {/* Row 3: ID Copy, Symbol-Free Room ID & Friends Counter */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-semibold text-slate-600">
                        ID: {displayData.userId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(displayData.userId, 'id')}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                        title="Copy ID"
                      >
                        {copiedKey === 'id' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold tabular-nums border ${
                        displayData.isVipRoom || isVipFancyRoomNumber(displayData.roomAddress)
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      <span>{displayData.isVipRoom || isVipFancyRoomNumber(displayData.roomAddress) ? '👑' : '🎙️'}</span>
                      <span>
                        {displayData.isVipRoom || isVipFancyRoomNumber(displayData.roomAddress) ? 'VIP ROOM:' : 'ROOM:'}{' '}
                        {displayData.roomAddress || '10001'}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-sky-500" />
                    <span>{friendsCount} Friends</span>
                  </div>
                </div>

                {/* Direct Dual Referral Links (User ID & @Username) */}
                {isOwnProfile && typeof window !== 'undefined' && (
                  <div className="flex flex-wrap items-center gap-1.5 bg-sky-50/70 border border-sky-200 rounded-xl px-3 py-2 text-[10px]">
                    <span className="font-bold text-sky-900">🔗 Invite Link:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(`${window.location.origin}/?ref=${displayData.userId}`, 'id')
                      }
                      className="px-2 py-0.5 rounded-full bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 font-mono font-bold cursor-pointer"
                    >
                      Copy ID Link ({displayData.userId})
                    </button>
                    {displayData.username && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(`${window.location.origin}/?ref=${displayData.username}`, 'username')
                        }
                        className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono font-bold cursor-pointer"
                      >
                        Copy @{displayData.username} Link
                      </button>
                    )}
                  </div>
                )}

                {/* Bio */}
                {displayData.bio && (
                  <p className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    {displayData.bio}
                  </p>
                )}

                {/* Row 4: Real VIP & Honor Badges */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {vipCfg && (
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black text-white bg-gradient-to-r ${vipCfg.colorClass} shadow-xs`}
                    >
                      <span>{vipCfg.icon}</span>
                      <span>{vipCfg.name}</span>
                    </span>
                  )}
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 shadow-2xs">
                    <span>{frameItem.icon}</span>
                    <span>{frameItem.name}</span>
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-amber-300 shadow-2xs">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{displayData.chosenServiceCode || 'ESP'} Member</span>
                  </span>
                </div>

                {/* Row 4B: Active Relationship / CP Bonds & ESP Family Crest */}
                {((displayData.activeRelationships && displayData.activeRelationships.length > 0) || displayData.familySummary || onOpenRelationships || onOpenFamily) && (
                  <div className="space-y-2 pt-1">
                    {displayData.activeRelationships && displayData.activeRelationships.filter(b => b.status === 'accepted').length > 0 && (
                      <div className="space-y-1.5">
                        {displayData.activeRelationships
                          .filter(b => b.status === 'accepted')
                          .slice(0, 2)
                          .map((bond) => {
                            const spec = getRelationshipTokenSpec(bond.tokenId);
                            return (
                              <div
                                key={bond.id}
                                className={`rounded-xl px-3 py-2 bg-gradient-to-r ${spec.gradient} text-white flex items-center justify-between gap-2 shadow-xs`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-lg shrink-0">{spec.badgeIcon}</span>
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-black truncate">
                                      {spec.tagName} · with {bond.partnerName}
                                    </p>
                                    <p className="text-[10px] text-white/85 font-mono tabular-nums">
                                      Intimacy: {(bond.intimacyPoints || 0).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                </div>
                                {bond.partnerAvatar && (
                                  <img
                                    src={bond.partnerAvatar}
                                    alt={bond.partnerName}
                                    className="w-7 h-7 rounded-full object-cover border border-white/80 shrink-0"
                                  />
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {displayData.familySummary && (
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenFamily) {
                              onClose();
                              onOpenFamily();
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold cursor-pointer hover:bg-emerald-100"
                        >
                          <span>{displayData.familySummary.emblem}</span>
                          <span>{displayData.familySummary.name} · Lv.{displayData.familySummary.level}</span>
                        </button>
                      )}
                      {onOpenRelationships && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenRelationships(isOwnProfile ? '' : displayData.userId);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold cursor-pointer hover:bg-rose-100"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" />
                          <span>{isOwnProfile ? 'Manage Relationship & CP Tags' : `Send Bond Tag to ${displayData.fullName.split(' ')[0]}`}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Row 5: MOMENTS SECTION (Strictly Own Moments Count + Facebook Style + Delete) */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between gap-2 bg-slate-50/90 border border-slate-200/80 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-slate-900">Moments</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/25 text-[11px] font-black tabular-nums">
                        <span>{momentsList.length}</span>
                        <span>{isOwnProfile ? 'खुद के पोस्ट' : 'Posts'}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => setShowMomentComposer(true)}
                          className="px-2.5 py-1 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-[11px] font-black flex items-center gap-1 shadow-2xs cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Post</span>
                        </button>
                      )}
                      {isOwnProfile && onOpenMoments && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenMoments();
                          }}
                          className="text-xs font-bold text-slate-600 hover:text-[#2874f0] flex items-center gap-0.5 cursor-pointer pl-1"
                        >
                          <span>Feed</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {momentsList.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 text-center text-xs text-slate-500 space-y-2">
                      <ImageIcon className="w-5 h-5 mx-auto text-slate-400" />
                      <p>
                        {isOwnProfile
                          ? 'आपने अभी तक अपना कोई Moment पोस्ट नहीं किया है (0 Posts)'
                          : 'इस यूज़र ने अभी कोई Moment पोस्ट नहीं किया है'}
                      </p>
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => setShowMomentComposer(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-[11px] font-black cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>पहला ESP STYLE मोमेंट डालें</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {momentsList.map((m) => {
                        const isConfirming = confirmDeleteMomentId === m.id;
                        const { theme, textClassName, effectStyle } = getMomentTextClasses(m.postStyle);
                        return (
                          <div
                            key={m.id}
                            className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDeleteMomentId(null);
                                setPreviewMoment(m);
                              }}
                              className="w-full h-full cursor-pointer block text-left"
                            >
                              {m.imageUrl ? (
                                <img
                                  src={m.imageUrl}
                                  alt={m.caption || 'Moment'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              ) : (
                                <div
                                  className={`w-full h-full p-2 flex items-center justify-center ${
                                    theme.isColoredCard
                                      ? theme.cardClass
                                      : 'bg-gradient-to-br from-sky-50 to-indigo-100 text-slate-800'
                                  }`}
                                >
                                  <span
                                    style={effectStyle}
                                    className={`line-clamp-4 text-[10px] leading-tight text-center ${textClassName}`}
                                  >
                                    {m.caption}
                                  </span>
                                </div>
                              )}
                            </button>

                            {isOwnProfile && !isConfirming && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteMomentId(m.id);
                                }}
                                title="मोमेंट डिलीट करें"
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center shadow cursor-pointer transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}

                            {isOwnProfile && isConfirming && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center p-1.5 gap-1.5 text-white z-10"
                              >
                                <span className="text-[10px] font-black text-center">डिलीट करें?</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={deletingMomentId === m.id}
                                    onClick={() => handleDeleteMoment(m.id)}
                                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-[10px] font-black cursor-pointer disabled:opacity-50"
                                  >
                                    {deletingMomentId === m.id ? '...' : 'हाँ'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteMomentId(null)}
                                    className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[10px] font-bold cursor-pointer"
                                  >
                                    नहीं
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Row 6: GIFT WALL SECTION (Interactive Full Catalog + Lit Counter) */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">Gift Wall</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 tabular-nums">
                        {
                          new Set(
                            giftWall.map((g) => resolveCanonicalGiftId(g.id, g.name))
                          ).size
                        }
                        /{ALL_GIFTS_CATALOG.length} Lit
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGiftWallModal(true)}
                      className="text-xs font-bold text-[#2874f0] hover:underline flex items-center gap-0.5 cursor-pointer tabular-nums"
                    >
                      <span>Lit {totalGiftsLit} gifts ›</span>
                    </button>
                  </div>

                  {giftWall.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowGiftWallModal(true)}
                      className="w-full bg-slate-50 hover:bg-sky-50/60 border border-dashed border-slate-300 rounded-2xl p-3.5 text-center transition cursor-pointer"
                    >
                      <div className="grid grid-cols-5 gap-2 mb-2 opacity-60">
                        {ALL_GIFTS_CATALOG.slice(0, 5).map((g) => (
                          <div
                            key={g.id}
                            className="bg-white border border-slate-200 rounded-xl py-2 flex flex-col items-center grayscale"
                          >
                            <span className="text-xl leading-none">{g.icon}</span>
                            <span className="text-[9px] font-bold text-slate-400 mt-1">x0</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-[#2874f0]">
                        {isOwnProfile
                          ? '🎁 Full Gift Wall देखें (23 Gifts Collection) ›'
                          : `🎁 ${displayData.fullName} की Gift Wall रोशन करने के लिए टैप करें ›`}
                      </span>
                    </button>
                  ) : (
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {giftWall.slice(0, 5).map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setShowGiftWallModal(true)}
                          className="bg-gradient-to-b from-amber-50/70 to-white border border-amber-200 hover:border-[#2874f0] rounded-xl py-2 px-1 flex flex-col items-center cursor-pointer transition shadow-2xs"
                          title={g.name}
                        >
                          <span className="text-2xl leading-none">{g.icon || '🎁'}</span>
                          <span className="text-[11px] font-black text-slate-700 mt-1 tabular-nums">
                            x{g.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM CTA BAR */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-5 py-3 flex items-center gap-2.5 z-20">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:brightness-105 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile &amp; @Username</span>
                  </button>
                  {onVisitVoiceRoom && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetRoom =
                          displayData.roomAddress || displayData.userId;
                        onClose();
                        onVisitVoiceRoom(targetRoom);
                      }}
                      className="px-3.5 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                      title="मेरा पर्सनल वॉइस रूम खोलें"
                    >
                      <Radio className="w-4 h-4" />
                      <span>My Room</span>
                    </button>
                  )}
                  {onOpenAvatarCustomizer && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAvatarCustomizer();
                      }}
                      className="px-4 py-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs flex items-center gap-1.5 cursor-pointer transition"
                      title="Quality Frames & VIP Store"
                    >
                      <Crown className="w-4 h-4" />
                      <span>VIP</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={friendBusy}
                    onClick={() => handleToggleFriend(displayData.userId)}
                    className={`flex-1 py-3 rounded-full font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition disabled:opacity-60 ${
                      isFriend
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:brightness-105 text-white'
                    }`}
                  >
                    {isFriend ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Friends Added ✓</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Add Friend</span>
                      </>
                    )}
                  </button>
                  {onVisitVoiceRoom && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetRoom =
                          displayData.roomAddress || displayData.userId;
                        onClose();
                        onVisitVoiceRoom(targetRoom);
                      }}
                      className="px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                      title="इनका वॉइस रूम देखें"
                    >
                      <Radio className="w-4 h-4" />
                      <span>Room</span>
                    </button>
                  )}
                  {onSendGift && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSendGift(displayData);
                      }}
                      className="px-5 py-3 rounded-full bg-[#fb641b] hover:bg-[#e5530d] text-white font-black text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Gift</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* ================= MODE 2: OWN PROFILE SETUP & EDIT (@USERNAME) ================= */}
        {mode === 'edit' && (
          <div className="flex flex-col max-h-[94vh]">
            <div className="px-4 py-3.5 bg-[#2874f0] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-black text-sm">प्रोफाइल सेट-अप व एडिट</h3>
                  <p className="text-[11px] text-blue-100">फोटो, कवर व यूनिक @Username चुनें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileSetup} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Cover & Avatar Upload Preview + Facebook Adjust/Crop */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-40">
                {editCoverPhoto ? (
                  <img src={editCoverPhoto} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-slate-800 to-indigo-900 flex items-center justify-center text-xs text-slate-300 font-semibold">
                    कोई कवर फोटो अपलोड करें (16:9 / ESP Cover)
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {editCoverPhoto && (
                    <button
                      type="button"
                      onClick={() => openCropFromExisting(editCoverPhoto, 'cover', false)}
                      className="px-2.5 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white text-[10px] font-bold flex items-center gap-1 border border-white/20 cursor-pointer"
                    >
                      <Crop className="w-3 h-3 text-sky-300" />
                      <span>Adjust</span>
                    </button>
                  )}
                  <label className="px-3 py-1.5 rounded-full bg-black/65 hover:bg-black/85 text-white text-[10px] font-bold flex items-center gap-1.5 border border-white/20 cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Cover Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) openCropFromFile(f, 'cover', false);
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>

                <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
                  <img
                    src={
                      editAvatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.userId)}`
                    }
                    alt="Avatar Preview"
                    className="w-14 h-14 rounded-full border-2 border-white object-cover bg-white shadow-md"
                  />
                  <label className="px-2.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-slate-900 text-[10px] font-black flex items-center gap-1 cursor-pointer shadow">
                    <Camera className="w-3.5 h-3.5 text-[#1877f2]" />
                    <span>Profile Pic</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) openCropFromFile(f, 'avatar', false);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => openCropFromExisting(editAvatar, 'avatar', false)}
                      className="px-2.5 py-1.5 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white text-[10px] font-black flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Crop className="w-3 h-3" />
                      <span>Crop</span>
                    </button>
                  )}
                </div>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  ⚠️ {editError}
                </div>
              )}

              {/* UNIQUE @USERNAME INPUT WITH LIVE CHECK */}
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-3.5 space-y-1.5">
                <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                  <span>यूनिक यूजरनेम (Unique @Username) *</span>
                  <span className="text-[10px] font-semibold text-sky-700">1 यूजर = 1 यूनिक @username</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-sm font-black text-sky-600">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 24))
                    }
                    placeholder="rahul01 (केवल a-z और 0-9, बिना symbol)"
                    className="w-full bg-white border border-sky-300 focus:border-[#2874f0] rounded-xl pl-7 pr-9 py-2 text-sm font-mono font-bold text-slate-900 outline-none"
                  />
                  {usernameStatus?.checking && (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-500 absolute right-3" />
                  )}
                </div>
                {usernameStatus && !usernameStatus.checking && (
                  <p
                    className={`text-[11px] font-bold ${
                      usernameStatus.valid && usernameStatus.available
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {usernameStatus.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-500">
                  बिना किसी Symbol (_ - . @) के 3-24 अक्षर चुनें। दो लोगों का @username एक जैसा नहीं हो सकता।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">प्रोफाइल नाम (Display Name) *</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">नाम एक जैसा हो सकता है।</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">शहर / देश (Location)</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="जैसे: Patna, India"
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">लिंग (Gender)</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="male">पुरुष (Male ♂)</option>
                    <option value="female">महिला (Female ♀)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">प्रोफाइल मोड</label>
                  <select
                    value={editAccountType}
                    onChange={(e) => setEditAccountType(e.target.value === 'business' ? 'business' : 'gamer')}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  >
                    <option value="gamer">🎮 Gaming &amp; Club</option>
                    <option value="business">💼 Business &amp; Earning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">बायो / परिचय (Bio)</label>
                <input
                  type="text"
                  maxLength={140}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="अपने बारे में लिखें..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Payout UPI ID</label>
                <input
                  type="text"
                  value={editUpi}
                  onChange={(e) => setEditUpi(e.target.value)}
                  placeholder="example@upi"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#2874f0] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={
                    savingProfile ||
                    (Boolean(editUsername.trim()) &&
                      usernameStatus !== null &&
                      (!usernameStatus.valid || !usernameStatus.available))
                  }
                  className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#22c1f1] to-[#0ea5e9] hover:brightness-105 text-white font-black text-sm shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? 'सेव हो रहा है...' : '💾 Save Profile Setup'}
                </button>
                {onOpenAvatarCustomizer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAvatarCustomizer();
                    }}
                    className="px-4 py-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs cursor-pointer"
                  >
                    🎨 Frames
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ================= MODE 3: SEARCH USERS BY @USERNAME & ADD FRIEND ================= */}
        {mode === 'search' && (
          <div className="flex flex-col h-[82vh] max-h-[680px]">
            <div className="px-4 py-3.5 bg-[#2874f0] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="font-black text-sm">दोस्त खोजें (@Username Search)</h3>
                  <p className="text-[11px] text-blue-100">यूनिक @username या नाम से सर्च कर Add Friend करें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border-b border-slate-200">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="@username, पूरा नाम या ESP ID दर्ज करें..."
                  className="w-full bg-white border border-slate-300 focus:border-[#2874f0] rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
              {searching ? (
                <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#2874f0]" />
                  <span>खिलाड़ी खोजे जा रहे हैं...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 px-6">
                  कोई मेल खाता हुआ खिलाड़ी नहीं मिला। दूसरा @username आज़माएं।
                </div>
              ) : (
                searchResults.map((u) => {
                  const isSelf = u.userId === currentUser.userId;
                  return (
                    <div
                      key={u.userId}
                      onClick={() => {
                        setViewedUserId(u.userId);
                        setMode('view');
                        loadRichProfile(u.userId, u);
                      }}
                      className="p-3.5 hover:bg-sky-50/60 transition flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarFrame
                          src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`}
                          alt={u.fullName}
                          size="sm"
                          frameType={(u.frameType as FrameVariant) || 'standard'}
                          vipTier={u.vipTier}
                          level={u.gameLevel || 1}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
                              {u.fullName}
                            </span>
                            {u.username && (
                              <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-full border border-sky-200">
                                @{u.username}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span>Lv.{u.gameLevel || 1}</span>
                            <span>•</span>
                            <span>✨ {u.charms || 0}</span>
                            <span>•</span>
                            <span>{u.location || 'India'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        {isSelf ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                            You
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={friendBusy}
                            onClick={() => handleToggleFriend(u.userId)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-black flex items-center gap-1 cursor-pointer transition ${
                              u.isFriend
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-[#22c1f1] hover:bg-[#0ea5e9] text-white shadow-xs'
                            }`}
                          >
                            {u.isFriend ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Moment Facebook-Style Lightbox Overlay */}
        {previewMoment && (
          <div
            onClick={() => {
              setConfirmDeleteMomentId(null);
              setPreviewMoment(null);
            }}
            className="absolute inset-0 z-40 bg-black/85 flex items-center justify-center p-4 animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-[#212121]"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={displayAvatar}
                    alt={displayData.fullName}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {displayData.fullName}
                      {previewMoment.postStyle?.feeling && (
                        <span className="font-semibold text-slate-500"> · {previewMoment.postStyle.feeling}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>{new Date(previewMoment.createdAt).toLocaleDateString()}</span>
                      {previewMoment.postStyle?.locationText && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold">
                            <MapPinIcon className="w-2.5 h-2.5" />
                            {previewMoment.postStyle.locationText}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDeleteMomentId(null);
                    setPreviewMoment(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 max-h-[60vh] overflow-y-auto">
                <MomentPostContent moment={previewMoment} compact />
              </div>

              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-600">
                  ❤️ {previewMoment.likes?.length || 0} • 💬 {previewMoment.comments?.length || 0}
                </span>

                {isOwnProfile && (
                  confirmDeleteMomentId === previewMoment.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-rose-700">पक्का डिलीट करें?</span>
                      <button
                        type="button"
                        disabled={deletingMomentId === previewMoment.id}
                        onClick={() => handleDeleteMoment(previewMoment.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-black cursor-pointer disabled:opacity-50"
                      >
                        {deletingMomentId === previewMoment.id ? '...' : 'हाँ, Delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteMomentId(null)}
                        className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold cursor-pointer"
                      >
                        नहीं
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteMomentId(previewMoment.id)}
                      className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Moment</span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
        <FacebookMomentComposerModal
          isOpen={showMomentComposer}
          currentUser={currentUser}
          onClose={() => setShowMomentComposer(false)}
          onPosted={(newMoment) => {
            setProfile((prev) => {
              if (!prev) {
                return {
                  userId: displayData.userId,
                  fullName: displayData.fullName,
                  moments: [newMoment],
                  momentsCount: 1,
                };
              }
              const updated = [newMoment, ...(prev.moments || [])];
              return {
                ...prev,
                moments: updated,
                momentsCount: updated.length,
              };
            });
            loadRichProfile(displayData.userId, displayData);
          }}
        />
        <FacebookPhotoCropModal
          isOpen={cropModalState.open}
          imageSrc={cropModalState.src}
          kind={cropModalState.kind}
          onCancel={() => setCropModalState(prev => ({ ...prev, open: false }))}
          onConfirm={handleConfirmCroppedPhoto}
          onChangeFile={(newFile) =>
            openCropFromFile(newFile, cropModalState.kind, cropModalState.autoSave)
          }
        />

        <GiftWallModal
          isOpen={showGiftWallModal}
          recipientUserId={displayData.userId}
          recipientName={displayData.fullName}
          recipientAvatar={displayAvatar}
          recipientRoomAddress={displayData.roomAddress || '10001'}
          isVipRoom={Boolean(displayData.isVipRoom || isVipFancyRoomNumber(displayData.roomAddress))}
          giftWall={giftWall}
          isOwnProfile={isOwnProfile}
          onClose={() => setShowGiftWallModal(false)}
          onSendCatalogGift={
            onSendGift
              ? (gift) => {
                  setShowGiftWallModal(false);
                  onClose();
                  onSendGift(displayData, gift.id);
                }
              : undefined
          }
        />
        <CharmTierChartModal
          isOpen={showCharmChartModal}
          charms={displayData.charms || 0}
          playerName={displayData.fullName}
          onClose={() => setShowCharmChartModal(false)}
        />
      </div>
    </div>
  );
};
