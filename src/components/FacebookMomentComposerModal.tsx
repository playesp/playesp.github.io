import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Globe,
  Users,
  MapPin,
  Smile,
  Type,
  Palette,
  Send,
  Trash2,
} from 'lucide-react';
import type { Moment, MomentPostStyle, UserProfile } from '../types/index.ts';
import {
  MOMENT_BG_THEMES,
  MOMENT_CATEGORY_TAGS,
  MOMENT_FEELING_OPTIONS,
  MOMENT_FONT_OPTIONS,
  MOMENT_TEXT_COLORS,
  getMomentTextClasses,
} from '../config/momentStyles.ts';
import { api } from '../services/api.ts';
import { showToast } from '../services/toast.ts';

interface FacebookMomentComposerModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  onClose: () => void;
  onPosted: (newMoment: Moment) => void;
}

export const FacebookMomentComposerModal: React.FC<FacebookMomentComposerModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onPosted,
}) => {
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [serviceTag, setServiceTag] = useState<string>('LIFE MOMENT');

  const [fontFamily, setFontFamily] = useState<NonNullable<MomentPostStyle['fontFamily']>>('sans');
  const [bgTheme, setBgTheme] = useState<NonNullable<MomentPostStyle['bgTheme']>>('royal_blue');
  const [textColor, setTextColor] = useState<string>('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const [textEffect, setTextEffect] = useState<'none' | 'shadow' | 'glow' | 'outline'>('shadow');
  const [photoFrame, setPhotoFrame] = useState<'clean' | 'polaroid' | 'rounded_glow' | 'cinema'>('clean');
  const [feeling, setFeeling] = useState<string>('');
  const [locationText, setLocationText] = useState<string>('');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');

  const [activeToolTab, setActiveToolTab] = useState<'bg' | 'font' | 'photo' | 'mood'>('bg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentStyle: MomentPostStyle = {
    fontFamily,
    bgTheme,
    textColor,
    textAlign,
    fontSize,
    textEffect,
    photoFrame,
    feeling,
    locationText: locationText.trim(),
    privacy,
  };

  const { theme, textClassName, effectStyle } = getMomentTextClasses(currentStyle);
  const avatarSrc =
    currentUser.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.userId)}`;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      showToast('फोटो की साइज 8MB से कम होनी चाहिए।', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        // When user adds a photo, default to classic or keep user's choice cleanly
        if (bgTheme !== 'classic' && !caption.trim()) {
          setBgTheme('classic');
          setTextAlign('left');
          setFontSize('md');
          setTextEffect('none');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !imageUrl) {
      showToast('कृपया कुछ लिखें या गैलरी से फोटो चुनें।', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await api.postMoment({
        userId: currentUser.userId,
        userName: currentUser.fullName,
        userRollNumber: currentUser.userId,
        userAvatar: currentUser.avatar,
        caption: caption.trim(),
        imageUrl,
        serviceTag,
        postStyle: currentStyle,
      });

      api.recordTaskAction(currentUser.userId, 'moment_posted', 1).catch(() => {});
      showToast('🎉 आपका ESP STYLE मोमेंट पोस्ट हो गया!', 'success');

      setCaption('');
      setImageUrl('');
      setFeeling('');
      setLocationText('');
      onPosted(created);
      onClose();
    } catch (err: any) {
      showToast(err?.message || 'मोमेंट पोस्ट करने में समस्या आई', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col text-[#212121]">
        {/* Facebook-style Modal Header */}
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="w-8" />
          <div className="text-center">
            <h3 className="text-base font-black text-slate-900">Create Moment Post</h3>
            <p className="text-[10px] font-semibold text-slate-500">
              ESP STYLE — मनपसंद फ़ॉन्ट, डिज़ाइन, बैकग्राउंड व फोटो पोस्ट करें
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Author Row + Feeling + Privacy */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={avatarSrc}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {currentUser.fullName}
                  {feeling && (
                    <span className="font-semibold text-slate-600"> — {feeling}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPrivacy(p => (p === 'public' ? 'friends' : 'public'))}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 cursor-pointer"
                  >
                    {privacy === 'public' ? (
                      <>
                        <Globe className="w-3 h-3 text-[#1877f2]" />
                        <span>Public</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>Friends</span>
                      </>
                    )}
                  </button>
                  <select
                    value={serviceTag}
                    onChange={(e) => setServiceTag(e.target.value)}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1877f2] border border-blue-200 text-[10px] font-bold outline-none cursor-pointer"
                  >
                    {MOMENT_CATEGORY_TAGS.map((tag) => (
                      <option key={tag.value} value={tag.value}>
                        {tag.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* LIVE FACEBOOK-STYLE POST CANVAS / TEXTAREA */}
          <div
            className={`rounded-2xl overflow-hidden border transition-all ${
              theme.isColoredCard
                ? `${theme.cardClass} shadow-md border-transparent`
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={theme.isColoredCard ? 'p-5 min-h-[160px] flex items-center justify-center' : 'p-3.5'}>
              <textarea
                rows={theme.isColoredCard ? 4 : 3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  theme.isColoredCard
                    ? 'अपनी दिल की बात, शायरी, विचार या कोई भी स्टेटस लिखें...'
                    : `${currentUser.fullName.split(' ')[0]}, आज आप क्या पोस्ट करना चाहते हैं? कुछ भी लिखें या फोटो जोड़ें...`
                }
                style={{
                  ...effectStyle,
                  ...(theme.isColoredCard && !textColor
                    ? { color: theme.defaultTextColor }
                    : {}),
                }}
                className={`w-full bg-transparent outline-none resize-none placeholder:opacity-60 ${textClassName}`}
              />
            </div>

            {imageUrl && (
              <div
                className={`relative mx-3 mb-3 overflow-hidden ${
                  photoFrame === 'polaroid'
                    ? 'bg-white p-2.5 pb-6 shadow-lg rounded-md border border-slate-200'
                    : photoFrame === 'rounded_glow'
                      ? 'rounded-2xl ring-2 ring-[#1877f2] shadow-lg'
                      : photoFrame === 'cinema'
                        ? 'rounded-lg border-y-4 border-slate-900 bg-black'
                        : 'rounded-xl border border-slate-200 bg-black/5'
                }`}
              >
                <img
                  src={imageUrl}
                  alt="Moment Preview"
                  className="w-full max-h-60 object-contain mx-auto rounded"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2 right-2 px-2 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>हटाएं</span>
                </button>
              </div>
            )}
          </div>

          {/* FACEBOOK DESIGN TOOLKIT TABS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-3">
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setActiveToolTab('bg')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition ${
                  activeToolTab === 'bg'
                    ? 'bg-[#1877f2] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Card BG</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveToolTab('font')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition ${
                  activeToolTab === 'font'
                    ? 'bg-[#1877f2] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Fonts</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveToolTab('photo')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition ${
                  activeToolTab === 'photo'
                    ? 'bg-[#1877f2] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveToolTab('mood')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer transition ${
                  activeToolTab === 'mood'
                    ? 'bg-[#1877f2] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Mood</span>
              </button>
            </div>

            {/* TAB 1: FACEBOOK BACKGROUND CARD THEMES */}
            {activeToolTab === 'bg' && (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-slate-600">
                  पोस्ट बैकग्राउंड डिज़ाइन चुनें (ESP STYLE Aa Cards):
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {MOMENT_BG_THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setBgTheme(t.id);
                        if (t.isColoredCard) {
                          if (textAlign === 'left') setTextAlign('center');
                          if (fontSize === 'sm') setFontSize('lg');
                        } else {
                          setTextColor('');
                          setTextEffect('none');
                          setTextAlign('left');
                          setFontSize('md');
                        }
                      }}
                      className={`shrink-0 flex flex-col items-center gap-1 cursor-pointer group`}
                    >
                      <span
                        className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xs font-black transition ${
                          t.swatchClass
                        } ${bgTheme === t.id ? 'ring-2 ring-[#1877f2] ring-offset-1 scale-105' : 'opacity-90 hover:opacity-100'}`}
                      >
                        Aa
                      </span>
                      <span className="text-[9px] font-bold text-slate-600">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FONTS, COLOR, SIZE, ALIGNMENT, TEXT EFFECT */}
            {activeToolTab === 'font' && (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    फ़ॉन्ट स्टाइल (Font Style):
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MOMENT_FONT_OPTIONS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontFamily(f.id)}
                        className={`px-2.5 py-2 rounded-xl border text-xs cursor-pointer transition ${
                          fontFamily === f.id
                            ? 'bg-blue-50 border-[#1877f2] text-[#1877f2] ring-1 ring-[#1877f2]'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`text-sm leading-none mb-0.5 ${f.className}`}>{f.sample}</div>
                        <div className="text-[10px] font-bold">{f.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="text-[11px] font-bold text-slate-600 mb-1">Text Size:</div>
                    <div className="flex items-center gap-1">
                      {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setFontSize(sz)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase cursor-pointer border ${
                            fontSize === sz
                              ? 'bg-[#1877f2] border-[#1877f2] text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-slate-600 mb-1">Alignment:</div>
                    <div className="flex items-center gap-1">
                      {[
                        { id: 'left' as const, Icon: AlignLeft },
                        { id: 'center' as const, Icon: AlignCenter },
                        { id: 'right' as const, Icon: AlignRight },
                      ].map(({ id, Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTextAlign(id)}
                          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center cursor-pointer border ${
                            textAlign === id
                              ? 'bg-[#1877f2] border-[#1877f2] text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1">Text Effect:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'none' as const, label: 'Clean' },
                      { id: 'shadow' as const, label: '3D Shadow' },
                      { id: 'glow' as const, label: 'Neon Glow' },
                      { id: 'outline' as const, label: 'Bold Outline' },
                    ].map((eff) => (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => setTextEffect(eff.id)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold cursor-pointer border ${
                          textEffect === eff.id
                            ? 'bg-[#1877f2] border-[#1877f2] text-white'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {eff.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1">Text Color:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {MOMENT_TEXT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTextColor(c.hex)}
                        title={c.label}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border cursor-pointer flex items-center gap-1 ${
                          textColor === c.hex
                            ? 'border-[#1877f2] bg-blue-50 text-[#1877f2]'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {c.hex ? (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300 inline-block"
                            style={{ backgroundColor: c.hex }}
                          />
                        ) : (
                          <Sparkles className="w-3 h-3 text-amber-500" />
                        )}
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PHOTO UPLOAD & FRAME DESIGN */}
            {activeToolTab === 'photo' && (
              <div className="space-y-3">
                <label className="block border-2 border-dashed border-slate-300 hover:border-[#1877f2] rounded-xl p-4 text-center cursor-pointer bg-white transition">
                  <ImageIcon className="w-6 h-6 text-[#1877f2] mx-auto mb-1" />
                  <span className="text-xs font-black text-slate-800 block">
                    {imageUrl ? 'दूसरी फोटो बदलें (Gallery)' : 'गैलरी से फोटो अपलोड करें'}
                  </span>
                  <span className="text-[10px] text-slate-500">JPG, PNG, WEBP (मैक्स 8MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1">Photo Frame Design:</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'clean' as const, label: 'Clean' },
                      { id: 'polaroid' as const, label: 'Polaroid' },
                      { id: 'rounded_glow' as const, label: 'ESP Glow' },
                      { id: 'cinema' as const, label: 'Cinema' },
                    ].map((fr) => (
                      <button
                        key={fr.id}
                        type="button"
                        onClick={() => setPhotoFrame(fr.id)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer ${
                          photoFrame === fr.id
                            ? 'bg-[#1877f2] border-[#1877f2] text-white'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {fr.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FEELING / MOOD & LOCATION */}
            {activeToolTab === 'mood' && (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    फीलिंग / एक्टिविटी चुनें (Feeling / Mood):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MOMENT_FEELING_OPTIONS.map((f) => (
                      <button
                        key={f || 'none'}
                        type="button"
                        onClick={() => setFeeling(f)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border cursor-pointer transition ${
                          feeling === f
                            ? 'bg-[#1877f2] border-[#1877f2] text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {f || 'No Mood'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>लोकेशन जोड़ें (Optional):</span>
                  </div>
                  <input
                    type="text"
                    maxLength={48}
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="जैसे: Patna, Bihar या ESP Gaming Lounge"
                    className="w-full bg-white border border-slate-300 focus:border-[#1877f2] rounded-xl px-3 py-2 text-xs font-semibold outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!caption.trim() && !imageUrl)}
              className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#1877f2] to-[#2563eb] hover:brightness-105 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'पोस्ट हो रहा है...' : 'Post Moment Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
