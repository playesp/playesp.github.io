import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image as ImageIcon,
  Sparkles,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
  MapPin,
  Globe,
  Users,
  Palette,
  Smile,
  Plus,
} from 'lucide-react';
import type { Moment, UserProfile, PlatformSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';
import { FacebookMomentComposerModal } from '../components/FacebookMomentComposerModal.tsx';
import { MomentPostContent } from '../components/MomentPostContent.tsx';

interface MomentsViewProps {
  currentUser: UserProfile | null;
  settings: PlatformSettings;
  onOpenLogin: () => void;
  onSelectTab: (tab: string) => void;
}

export const MomentsView: React.FC<MomentsViewProps> = ({
  currentUser,
  settings,
  onOpenLogin,
}) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'styled' | 'photo' | 'my'>('all');

  const [showPostModal, setShowPostModal] = useState(false);

  // Inline Delete Confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Comments active toggle
  const [activeCommentMomentId, setActiveCommentMomentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMoments = async () => {
    try {
      setLoading(true);
      const list = await api.getMoments();
      setMoments(list);
    } catch (e) {
      console.error('Failed to load moments', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  const isMomentOwner = (m: Moment) => {
    if (!currentUser) return false;
    const uid = currentUser.userId.toLowerCase();
    return (
      m.userId?.toLowerCase() === uid ||
      m.userRollNumber?.toLowerCase() === uid ||
      currentUser.role === 'admin' ||
      currentUser.userId === 'usr-admin'
    );
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (!currentUser || deletingId) return;
    setDeletingId(momentId);
    try {
      await api.deleteMoment(momentId, currentUser.userId);
      setMoments((prev) => prev.filter((m) => m.id !== momentId));
      setConfirmDeleteId(null);
      showToast('🗑️ आपका मोमेंट डिलीट कर दिया गया!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'मोमेंट डिलीट करने में समस्या आई', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLike = async (momentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    try {
      const res = await api.likeMoment(momentId, currentUser.userId);
      if (res.success) {
        setMoments((prev) =>
          prev.map((m) => {
            if (m.id === momentId) {
              return {
                ...m,
                likes:
                  res.likes ||
                  (res.isLiked
                    ? [...m.likes, currentUser.userId]
                    : m.likes.filter((id) => id !== currentUser.userId)),
              };
            }
            return m;
          })
        );
      }
    } catch (e) {
      console.error('Error liking moment', e);
    }
  };

  const handleAddComment = async (momentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await api.commentMoment(momentId, {
        userId: currentUser.userId,
        userName: currentUser.fullName,
        userRollNumber: currentUser.userId,
        userAvatar: currentUser.avatar,
        text: commentText.trim(),
      });

      if (res.success && res.comment) {
        setMoments((prev) =>
          prev.map((m) => {
            if (m.id === momentId) {
              return {
                ...m,
                comments: [...(m.comments || []), res.comment],
              };
            }
            return m;
          })
        );
        setCommentText('');
      }
    } catch (e) {
      console.error('Error adding comment', e);
    }
  };

  const getWhatsAppShareUrl = (moment: Moment) => {
    const text = encodeURIComponent(
      `📸 *ESP PLAY MOMENT*\n\n` +
        `👤 *Member:* ${moment.userName} (${moment.userRollNumber})\n` +
        `✨ *Tag:* ${moment.serviceTag || 'LIFE MOMENT'}\n` +
        (moment.caption ? `💬 "${moment.caption}"\n\n` : '\n') +
        `🔗 *Join ESP PLAY Community:* ${window.location.origin}\n` +
        `👑 *Founder:* ${settings.ownerName} (${settings.ownerSponsorId})`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  const handleCopyLink = (moment: Moment) => {
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${moment.userRollNumber}`);
    setCopiedId(moment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const myMomentsCount = currentUser
    ? moments.filter(
        (m) =>
          m.userId?.toLowerCase() === currentUser.userId.toLowerCase() ||
          m.userRollNumber?.toLowerCase() === currentUser.userId.toLowerCase()
      ).length
    : 0;

  const filteredMoments = moments.filter((m) => {
    if (filter === 'styled') return Boolean(m.postStyle?.bgTheme && m.postStyle.bgTheme !== 'classic');
    if (filter === 'photo') return Boolean(m.imageUrl);
    if (filter === 'my' && currentUser) {
      return (
        m.userId?.toLowerCase() === currentUser.userId.toLowerCase() ||
        m.userRollNumber?.toLowerCase() === currentUser.userId.toLowerCase()
      );
    }
    return true;
  });

  const userAvatarSrc =
    currentUser?.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser?.userId || 'guest')}`;

  return (
    <div className="space-y-4 py-4 pb-28 max-w-3xl mx-auto w-full">
      {/* Facebook-Style Moments Header Banner */}
      <div className="bg-gradient-to-r from-[#1877f2] via-[#2563eb] to-indigo-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#ffe500] text-[#212121] font-black text-[10px] px-2.5 py-0.5 rounded-full">
              ESP PLAY MOMENTS
            </span>
            {currentUser && (
              <span className="text-[11px] font-black bg-white/20 px-2.5 py-0.5 rounded-full">
                मेरे मोमेंट्स: {myMomentsCount}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            ESP STYLE मोमेंट्स &amp; फोटो फीड
          </h1>
          <p className="text-xs text-blue-100">
            अपनी पसंद के फ़ॉन्ट, कलर कार्ड डिज़ाइन, फीलिंग व फोटो के साथ कुछ भी शेयर करें।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) onOpenLogin();
            else setShowPostModal(true);
          }}
          className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>नया मोमेंट बनाएं</span>
        </button>
      </div>

      {/* Facebook-Style Quick Create Post Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={userAvatarSrc}
            alt={currentUser?.fullName || 'Guest'}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <button
            type="button"
            onClick={() => {
              if (!currentUser) onOpenLogin();
              else setShowPostModal(true);
            }}
            className="flex-1 text-left bg-slate-100 hover:bg-slate-200/80 transition rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 cursor-pointer"
          >
            {currentUser
              ? `${currentUser.fullName.split(' ')[0]}, आज क्या पोस्ट करना चाहते हैं? (शायरी, फोटो, विचार...)`
              : 'अपना ESP STYLE मोमेंट पोस्ट करने के लिए लॉगिन करें...'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-slate-100 text-[10px] min-[380px]:text-[11px] font-bold">
          <button
            type="button"
            onClick={() => {
              if (!currentUser) onOpenLogin();
              else setShowPostModal(true);
            }}
            className="py-2 px-1 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition min-w-0 whitespace-nowrap"
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
            <span className="truncate">Photo / Frame</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!currentUser) onOpenLogin();
              else setShowPostModal(true);
            }}
            className="py-2 px-1 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition min-w-0 whitespace-nowrap"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1877f2] shrink-0" />
            <span className="truncate">Fonts &amp; BG</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (!currentUser) onOpenLogin();
              else setShowPostModal(true);
            }}
            className="py-2 px-1 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition min-w-0 whitespace-nowrap"
          >
            <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
            <span className="truncate">Feeling</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#1877f2] border-[#1877f2] text-white'
                : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
            }`}
          >
            🌐 सभी मोमेंट्स ({moments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('styled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              filter === 'styled'
                ? 'bg-[#1877f2] border-[#1877f2] text-white'
                : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
            }`}
          >
            🎨 टेक्स्ट डिज़ाइन कार्ड्स
          </button>
          <button
            type="button"
            onClick={() => setFilter('photo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              filter === 'photo'
                ? 'bg-[#1877f2] border-[#1877f2] text-white'
                : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
            }`}
          >
            📸 फोटो पोस्ट्स
          </button>
          {currentUser && (
            <button
              type="button"
              onClick={() => setFilter('my')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                filter === 'my'
                  ? 'bg-[#1877f2] border-[#1877f2] text-white'
                  : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
              }`}
            >
              👤 मेरे मोमेंट्स ({myMomentsCount})
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 font-semibold hidden sm:inline-block shrink-0">
          कुल {filteredMoments.length} पोस्ट्स
        </span>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold text-xs bg-white rounded-2xl border border-slate-200">
            मोमेंट्स लोड हो रहे हैं...
          </div>
        ) : filteredMoments.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
            <Sparkles className="w-8 h-8 text-[#1877f2] mx-auto" />
            <h3 className="text-base font-black text-[#212121]">अभी कोई मोमेंट मौजूद नहीं है</h3>
            <p className="text-xs text-slate-600">
              पहले सदस्य बनें और अपना मनपसंद ESP STYLE स्टेटस या फोटो शेयर करें!
            </p>
            <button
              type="button"
              onClick={() => {
                if (!currentUser) onOpenLogin();
                else setShowPostModal(true);
              }}
              className="px-5 py-2 rounded-xl bg-[#1877f2] text-white font-bold text-xs cursor-pointer"
            >
              + अभी मोमेंट पोस्ट करें
            </button>
          </div>
        ) : (
          filteredMoments.map((item) => {
            const isLiked = currentUser ? item.likes?.includes(currentUser.userId) : false;
            const commentsList = item.comments || [];
            const isCommentOpen = activeCommentMomentId === item.id;
            const canDelete = isMomentOwner(item);
            const isConfirmingDelete = confirmDeleteId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3.5"
              >
                {/* Header: Facebook Post Author + Feeling + Privacy + Delete */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.userAvatar ? (
                        <img
                          src={item.userAvatar}
                          alt={item.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-[#1877f2] text-sm">
                          {item.userName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="font-black text-sm text-[#212121]">{item.userName}</span>
                        <ShieldCheck className="w-4 h-4 text-[#1877f2] shrink-0" />
                        {item.postStyle?.feeling && (
                          <span className="text-xs font-semibold text-slate-600">
                            is {item.postStyle.feeling}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-[#1877f2] font-mono font-bold">ID: {item.userRollNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        {item.postStyle?.privacy === 'friends' ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-700 font-semibold">
                            <Users className="w-3 h-3" /> Friends
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-slate-500 font-semibold">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        )}
                        {item.postStyle?.locationText && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-0.5 text-rose-600 font-semibold">
                              <MapPin className="w-3 h-3" />
                              {item.postStyle.locationText}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1877f2] border border-blue-200 hidden sm:inline-block">
                      {item.serviceTag || 'LIFE MOMENT'}
                    </span>

                    {canDelete && !isConfirmingDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(item.id)}
                        title="मोमेंट डिलीट करें"
                        className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && isConfirmingDelete && (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDeleteMoment(item.id)}
                          className="text-[10px] font-black text-rose-700 hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === item.id ? 'Deleting...' : 'Delete? हाँ'}
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          नहीं
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Styled Facebook Post Body (Gradient Card, Font, Text Design & Photo Frame) */}
                <MomentPostContent moment={item} />

                {/* Action Bar: Like, Comment, Share */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer font-bold ${
                        isLiked
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-[#f9fafb] text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{item.likes?.length || 0} Likes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCommentMomentId(isCommentOpen ? null : item.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#f9fafb] border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer font-bold"
                    >
                      <MessageCircle className="w-4 h-4 text-[#1877f2]" />
                      <span>{commentsList.length} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(item)}
                      title="Copy Refer Link"
                      className="p-1.5 rounded-xl bg-[#f9fafb] border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer text-[11px] flex items-center space-x-1 font-semibold"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline-block">{copiedId === item.id ? 'Copied' : 'Link'}</span>
                    </button>

                    <a
                      href={getWhatsAppShareUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => api.shareMoment(item.id)}
                      className="px-3 py-1.5 rounded-xl font-bold text-white bg-[#388e3c] hover:bg-emerald-700 transition flex items-center space-x-1.5 cursor-pointer text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share ({item.sharesCount || 0})</span>
                    </a>
                  </div>
                </div>

                {/* Comment Section */}
                {isCommentOpen && (
                  <div className="bg-[#f9fafb] rounded-xl p-3 sm:p-4 border border-slate-200 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {commentsList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-2">
                          अभी कोई कमेंट नहीं है। पहला कमेंट लिखें!
                        </p>
                      ) : (
                        commentsList.map((c) => (
                          <div key={c.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#1877f2]">
                                {c.userName} ({c.userRollNumber})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[#212121]">{c.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="कमेंट लिखें..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(item.id);
                        }}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-[#212121] focus:outline-none focus:border-[#1877f2]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(item.id)}
                        className="px-3.5 py-2 bg-[#1877f2] text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition cursor-pointer flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>भेजें</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Facebook-Style Moment Composer Modal */}
      {currentUser && (
        <FacebookMomentComposerModal
          isOpen={showPostModal}
          currentUser={currentUser}
          onClose={() => setShowPostModal(false)}
          onPosted={(newMoment) => {
            setMoments((prev) => [newMoment, ...prev]);
          }}
        />
      )}
    </div>
  );
};
