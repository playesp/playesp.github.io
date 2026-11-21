import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Camera, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  User, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink,
  Flame,
  Award,
  ShieldCheck,
  Plus
} from 'lucide-react';
import type { Moment, UserProfile, PlatformSettings } from '../types/index.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

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
  onSelectTab,
}) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'payout' | 'my'>('all');
  
  // Post modal / form state
  const [showPostModal, setShowPostModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [serviceTag, setServiceTag] = useState('PAYOUT PROOF');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLike = async (momentId: string) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    try {
      const res = await api.likeMoment(momentId, currentUser.userId);
      if (res.success) {
        setMoments(prev => prev.map(m => {
          if (m.id === momentId) {
            return {
              ...m,
              likes: res.likes || (res.isLiked ? [...m.likes, currentUser.userId] : m.likes.filter(id => id !== currentUser.userId))
            };
          }
          return m;
        }));
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
        setMoments(prev => prev.map(m => {
          if (m.id === momentId) {
            return {
              ...m,
              comments: [...(m.comments || []), res.comment]
            };
          }
          return m;
        }));
        setCommentText('');
      }
    } catch (e) {
      console.error('Error adding comment', e);
    }
  };

  const getWhatsAppShareUrl = (moment: Moment) => {
    const text = encodeURIComponent(
      `📸 *ESP MEMBER MOMENT & EARNING UPDATE*\n\n` +
      `👤 *Member:* ${moment.userName} (${moment.userRollNumber})\n` +
      `🏷️ *Category:* ${moment.serviceTag || 'ESP Community'}\n` +
      `💬 "${moment.caption}"\n\n` +
      `✨ Join ESP starting at just ₹10 & receive your Verified Member ID Card!\n` +
      `🔗 *View Official System:* ${window.location.origin}\n` +
      `👑 *Founder:* ${settings.ownerName} (${settings.ownerSponsorId})`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  const handleCopyLink = (moment: Moment) => {
    navigator.clipboard.writeText(`${window.location.origin}/?ref=${moment.userRollNumber}`);
    setCopiedId(moment.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('File size must be less than 8MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    if (!caption.trim() && !imageUrl) {
      showToast('कृपया फोटो या स्टेटस विवरण दर्ज करें', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.postMoment({
        userId: currentUser.userId,
        userName: currentUser.fullName,
        userRollNumber: currentUser.userId,
        userAvatar: currentUser.avatar,
        caption: caption.trim(),
        imageUrl: imageUrl,
        serviceTag: serviceTag,
      });

      api.recordTaskAction(currentUser.userId, 'moment_posted', 1).catch(() => {});
      showToast('मोमेंट पोस्ट हुआ! "Post 1 Moment" टास्क प्रोग्रेस अपडेट हो गया (+5 Coins & EXP क्लेम करें)!', 'success');

      setShowPostModal(false);
      setCaption('');
      setImageUrl('');
      await fetchMoments();
    } catch (err: any) {
      showToast(err?.message || 'Error posting moment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMoments = moments.filter(m => {
    if (filter === 'payout') return m.serviceTag?.toLowerCase().includes('payout');
    if (filter === 'my' && currentUser) return m.userId === currentUser.userId;
    return true;
  });

  return (
    <div className="space-y-5 py-4 pb-24 max-w-4xl mx-auto w-full">
      {/* Flipkart Top Header */}
      <div className="bg-[#2874f0] rounded-md p-4 sm:p-5 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-[#ffe500] text-[#212121] font-extrabold text-[10px] px-2.5 py-0.5 rounded">
              DAILY STATUS &amp; MOMENTS
            </span>
            <span className="text-xs font-semibold text-blue-100">
              ESP लाइव कम्युनिटी स्टेटस फीड
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            ESP Moments: पेआउट प्रूफ, स्टेटस एवं अर्निंग चर्चा
          </h1>
          <p className="text-xs text-blue-100">
            हर सदस्य अपना दैनिक स्टेटस, कमाई का स्क्रीनशॉट और पोस्टर यहां शेयर कर सकता है।
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenLogin();
            else setShowPostModal(true);
          }}
          className="px-4 py-2.5 rounded-sm font-bold text-xs sm:text-sm text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>+ अपना स्टेटस / फोटो डालें</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-md p-2.5 flex items-center justify-between gap-2 overflow-x-auto shadow-2xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#2874f0] border-[#2874f0] text-white'
                : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
            }`}
          >
            सभी मोमेंट्स ({moments.length})
          </button>
          <button
            onClick={() => setFilter('payout')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
              filter === 'payout'
                ? 'bg-[#2874f0] border-[#2874f0] text-white'
                : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
            }`}
          >
            💰 केवल पेआउट प्रूफ
          </button>
          {currentUser && (
            <button
              onClick={() => setFilter('my')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                filter === 'my'
                  ? 'bg-[#2874f0] border-[#2874f0] text-white'
                  : 'bg-[#f9fafb] border-slate-200 text-[#212121] hover:bg-slate-100'
              }`}
            >
              👤 मेरे स्टेटस
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
          <div className="p-12 text-center text-slate-500 font-bold text-xs bg-white rounded-md border border-slate-200">
            मोमेंट्स लोड हो रहे हैं...
          </div>
        ) : filteredMoments.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-white rounded-md border border-slate-200">
            <Sparkles className="w-8 h-8 text-[#2874f0] mx-auto" />
            <h3 className="text-base font-extrabold text-[#212121]">अभी कोई मोमेंट मौजूद नहीं है</h3>
            <p className="text-xs text-slate-600">
              पहले सदस्य बनें और अपना पहला अर्निंग स्टेटस शेयर करें!
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-5 py-2 rounded-sm bg-[#fb641b] text-white font-bold text-xs cursor-pointer"
            >
              + अभी स्टेटस पोस्ट करें
            </button>
          </div>
        ) : (
          filteredMoments.map((item) => {
            const isLiked = currentUser ? item.likes?.includes(currentUser.userId) : false;
            const commentsList = item.comments || [];
            const isCommentOpen = activeCommentMomentId === item.id;

            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 shadow-2xs space-y-3.5"
              >
                {/* Header: User Info & Tag */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {item.userAvatar ? (
                        <img 
                          src={item.userAvatar} 
                          alt={item.userName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-black text-[#2874f0] text-sm">
                          {item.userName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-sm text-[#212121]">{item.userName}</span>
                        <ShieldCheck className="w-4 h-4 text-[#388e3c]" />
                        <span className="text-[10px] bg-emerald-50 text-[#388e3c] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                          VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                        <span className="text-[#2874f0] font-mono font-bold">ID: {item.userRollNumber}</span>
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
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-[#2874f0] border border-blue-200">
                    {item.serviceTag || 'ESP UPDATE'}
                  </span>
                </div>

                {/* Caption */}
                {item.caption && (
                  <p className="text-xs sm:text-sm text-[#212121] font-medium leading-relaxed whitespace-pre-line">
                    {item.caption}
                  </p>
                )}

                {/* Image / Banner */}
                {item.imageUrl && (
                  <div className="rounded overflow-hidden border border-slate-200 bg-[#f9fafb] max-h-[420px] flex items-center justify-center">
                    <img 
                      src={item.imageUrl} 
                      alt="Moment attachment" 
                      className="w-full h-auto max-h-[420px] object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Action Bar: Like, Comment, Share */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded border transition cursor-pointer font-bold ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 border-rose-200' 
                          : 'bg-[#f9fafb] text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{item.likes?.length || 0} Likes</span>
                    </button>

                    <button
                      onClick={() => setActiveCommentMomentId(isCommentOpen ? null : item.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#f9fafb] border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer font-bold"
                    >
                      <MessageCircle className="w-4 h-4 text-[#2874f0]" />
                      <span>{commentsList.length} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyLink(item)}
                      title="Copy Refer Link"
                      className="p-1.5 rounded bg-[#f9fafb] border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer text-[11px] flex items-center space-x-1 font-semibold"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-[#388e3c]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline-block">{copiedId === item.id ? 'Copied' : 'Link'}</span>
                    </button>

                    <a
                      href={getWhatsAppShareUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => api.shareMoment(item.id)}
                      className="px-3 py-1.5 rounded-sm font-bold text-white bg-[#388e3c] hover:bg-emerald-700 transition flex items-center space-x-1.5 cursor-pointer text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share ({item.sharesCount || 0})</span>
                    </a>
                  </div>
                </div>

                {/* Comment Section */}
                {isCommentOpen && (
                  <div className="bg-[#f9fafb] rounded p-3 sm:p-4 border border-slate-200 space-y-3">
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {commentsList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic text-center py-2">
                          अभी कोई कमेंट नहीं है। पहला कमेंट लिखें!
                        </p>
                      ) : (
                        commentsList.map(c => (
                          <div key={c.id} className="bg-white p-2.5 rounded border border-slate-200 text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#2874f0]">{c.userName} ({c.userRollNumber})</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                      />
                      <button
                        onClick={() => handleAddComment(item.id)}
                        className="px-3.5 py-2 bg-[#2874f0] text-white font-bold rounded-sm text-xs hover:bg-blue-700 transition cursor-pointer flex items-center space-x-1"
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

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full shadow-xl p-5 sm:p-6 space-y-4 text-[#212121]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <span className="bg-[#2874f0] text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                  NEW MOMENT
                </span>
                <h3 className="text-base font-extrabold text-[#212121]">अपना दैनिक स्टेटस पोस्ट करें</h3>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-500 hover:text-[#212121] text-xs font-bold p-1 cursor-pointer"
              >
                ✕ बंद करें
              </button>
            </div>

            <form onSubmit={handleCreateMoment} className="space-y-3.5">
              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">
                  कैप्शन / स्टेटस विवरण:
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="अपनी कमाई का अनुभव, आज का कार्य या बधाई संदेश लिखें..."
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded p-3 text-xs text-[#212121] focus:outline-none focus:border-[#2874f0]"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">
                  कैटेगरी चुनें:
                </label>
                <select
                  value={serviceTag}
                  onChange={(e) => setServiceTag(e.target.value)}
                  className="w-full bg-[#f9fafb] border border-slate-300 rounded p-2.5 text-xs text-[#212121] font-bold focus:outline-none focus:border-[#2874f0]"
                >
                  <option value="PAYOUT PROOF">💰 UPI पेआउट प्रूफ (Payout Proof)</option>
                  <option value="TASK COMPLETED">✅ टास्क पूरा किया (Daily Task)</option>
                  <option value="NEW MEMBER JOINED">🤝 नई जॉइनिंग (New Refer)</option>
                  <option value="DIGITAL ID CARD">🪪 डिजिटल आईडी कार्ड मिला</option>
                  <option value="COMMUNITY MOTIVATION">🔥 कम्युनिटी मोटिवेशन</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#212121] font-bold block mb-1">
                  फोटो या स्क्रीनशॉट अपलोड करें:
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex-1 border-2 border-dashed border-slate-300 hover:border-[#2874f0] rounded p-3 text-center cursor-pointer bg-[#f9fafb] transition">
                    <ImageIcon className="w-5 h-5 text-[#2874f0] mx-auto mb-1" />
                    <span className="text-xs text-[#212121] font-bold block">गैलरी से फोटो चुनें</span>
                    <span className="text-[10px] text-slate-500">JPG, PNG (मैक्स 8MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {imageUrl && (
                <div className="p-2 bg-[#f9fafb] rounded border border-slate-200 relative">
                  <img src={imageUrl} alt="Preview" className="w-full max-h-36 object-contain rounded" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-3 right-3 bg-rose-600 text-white rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    हटाएं
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-sm text-xs font-bold text-[#212121] bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-sm text-xs font-bold text-white bg-[#fb641b] hover:bg-[#e5530d] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'पोस्ट हो रहा है...' : 'अभी स्टेटस पोस्ट करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
