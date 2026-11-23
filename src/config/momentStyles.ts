import type { MomentPostStyle } from '../types/index.ts';

export interface MomentFontOption {
  id: NonNullable<MomentPostStyle['fontFamily']>;
  label: string;
  sample: string;
  className: string;
}

export const MOMENT_FONT_OPTIONS: MomentFontOption[] = [
  {
    id: 'sans',
    label: 'Classic',
    sample: 'Aa',
    className: 'font-sans font-semibold',
  },
  {
    id: 'serif',
    label: 'Royal Serif',
    sample: 'Aa',
    className: 'font-serif font-bold',
  },
  {
    id: 'display',
    label: 'Bold Poster',
    sample: 'AA',
    className: 'font-sans font-black tracking-wide',
  },
  {
    id: 'cursive',
    label: 'Stylish Italic',
    sample: 'Aa',
    className: 'font-serif italic font-bold tracking-wide',
  },
  {
    id: 'mono',
    label: 'Gamer Tech',
    sample: '</>',
    className: 'font-mono font-bold tracking-tight',
  },
  {
    id: 'elegant',
    label: 'Wide Clean',
    sample: 'Aa',
    className: 'font-sans font-medium tracking-[0.08em]',
  },
];

export interface MomentBgTheme {
  id: NonNullable<MomentPostStyle['bgTheme']>;
  label: string;
  cardClass: string;
  swatchClass: string;
  defaultTextColor: string;
  isColoredCard: boolean;
}

export const MOMENT_BG_THEMES: MomentBgTheme[] = [
  {
    id: 'classic',
    label: 'Classic',
    cardClass: 'bg-white text-[#212121]',
    swatchClass: 'bg-white border-slate-300 text-slate-700',
    defaultTextColor: '#212121',
    isColoredCard: false,
  },
  {
    id: 'royal_blue',
    label: 'Royal FB',
    cardClass: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white',
    swatchClass: 'bg-gradient-to-br from-blue-600 to-purple-700 border-blue-400 text-white',
    defaultTextColor: '#ffffff',
    isColoredCard: true,
  },
  {
    id: 'sunset_rose',
    label: 'Sunset',
    cardClass: 'bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 text-white',
    swatchClass: 'bg-gradient-to-br from-rose-500 to-amber-500 border-pink-300 text-white',
    defaultTextColor: '#ffffff',
    isColoredCard: true,
  },
  {
    id: 'emerald_wave',
    label: 'Emerald',
    cardClass: 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white',
    swatchClass: 'bg-gradient-to-br from-emerald-500 to-cyan-600 border-teal-300 text-white',
    defaultTextColor: '#ffffff',
    isColoredCard: true,
  },
  {
    id: 'midnight_gold',
    label: 'VIP Gold',
    cardClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-amber-300 border border-amber-400/50',
    swatchClass: 'bg-gradient-to-br from-slate-900 to-indigo-950 border-amber-400 text-amber-300',
    defaultTextColor: '#fde047',
    isColoredCard: true,
  },
  {
    id: 'peach_pastel',
    label: 'Pastel',
    cardClass: 'bg-gradient-to-br from-amber-100 via-rose-100 to-pink-100 text-rose-950 border border-rose-200',
    swatchClass: 'bg-gradient-to-br from-amber-100 to-pink-200 border-rose-300 text-rose-900',
    defaultTextColor: '#4c0519',
    isColoredCard: true,
  },
  {
    id: 'neon_cyber',
    label: 'Neon',
    cardClass: 'bg-gradient-to-br from-fuchsia-700 via-purple-800 to-cyan-700 text-white',
    swatchClass: 'bg-gradient-to-br from-fuchsia-600 to-cyan-600 border-fuchsia-300 text-white',
    defaultTextColor: '#ffffff',
    isColoredCard: true,
  },
  {
    id: 'crimson_love',
    label: 'Love',
    cardClass: 'bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 text-white',
    swatchClass: 'bg-gradient-to-br from-red-600 to-pink-600 border-rose-300 text-white',
    defaultTextColor: '#ffffff',
    isColoredCard: true,
  },
];

export const MOMENT_TEXT_COLORS = [
  { id: 'auto', label: 'Auto', hex: '' },
  { id: '#ffffff', label: 'White', hex: '#ffffff' },
  { id: '#111827', label: 'Ink Black', hex: '#111827' },
  { id: '#fde047', label: 'Gold', hex: '#fde047' },
  { id: '#7dd3fc', label: 'Sky Blue', hex: '#7dd3fc' },
  { id: '#fda4af', label: 'Soft Rose', hex: '#fda4af' },
  { id: '#6ee7b7', label: 'Mint', hex: '#6ee7b7' },
  { id: '#1d4ed8', label: 'FB Blue', hex: '#1d4ed8' },
  { id: '#be123c', label: 'Crimson', hex: '#be123c' },
];

export const MOMENT_FEELING_OPTIONS = [
  '',
  '😊 Feeling Happy',
  '🔥 Feeling Motivated',
  '🎮 Gaming Mode',
  '❤️ Feeling Blessed',
  '😎 Full Swag',
  '✍️ Shayari / Quote',
  '🎉 Celebrating',
  '🎵 Listening & Vibing',
  '✈️ Travelling',
  '📸 Selfie Time',
];

export const MOMENT_CATEGORY_TAGS = [
  { value: 'LIFE MOMENT', label: '✨ Life Moment' },
  { value: 'GAMING VIBES', label: '🎮 Gaming & Club' },
  { value: 'PHOTO STORY', label: '📸 Photo Story' },
  { value: 'SHAYARI & QUOTES', label: '✍️ Shayari / Quote' },
  { value: 'MUSIC & MOOD', label: '🎵 Music & Mood' },
  { value: 'FRIENDS & PARTY', label: '🎉 Friends & Party' },
  { value: 'ACHIEVEMENT', label: '🏆 Achievement' },
  { value: 'DAILY THOUGHTS', label: '💬 Daily Thoughts' },
];

export function getMomentThemeById(id?: string): MomentBgTheme {
  return MOMENT_BG_THEMES.find((t) => t.id === id) || MOMENT_BG_THEMES[0];
}

export function getMomentFontById(id?: string): MomentFontOption {
  return MOMENT_FONT_OPTIONS.find((f) => f.id === id) || MOMENT_FONT_OPTIONS[0];
}

export function getMomentTextClasses(style?: MomentPostStyle) {
  const font = getMomentFontById(style?.fontFamily);
  const theme = getMomentThemeById(style?.bgTheme);
  const alignClass =
    style?.textAlign === 'center'
      ? 'text-center'
      : style?.textAlign === 'right'
        ? 'text-right'
        : 'text-left';

  const sizeClass =
    style?.fontSize === 'xl'
      ? 'text-xl sm:text-2xl leading-snug'
      : style?.fontSize === 'lg'
        ? 'text-base sm:text-lg leading-snug'
        : style?.fontSize === 'md'
          ? 'text-sm sm:text-base leading-relaxed'
          : 'text-xs sm:text-sm leading-relaxed';

  const effectStyle: React.CSSProperties = {};
  if (style?.textColor) {
    effectStyle.color = style.textColor;
  } else if (theme.isColoredCard) {
    effectStyle.color = theme.defaultTextColor;
  }

  if (style?.textEffect === 'shadow') {
    effectStyle.textShadow = '0 2px 8px rgba(0, 0, 0, 0.45)';
  } else if (style?.textEffect === 'glow') {
    effectStyle.textShadow = '0 0 12px rgba(255, 255, 255, 0.78), 0 0 22px rgba(56, 189, 248, 0.55)';
  } else if (style?.textEffect === 'outline') {
    effectStyle.textShadow =
      '-1px -1px 0 rgba(15,23,42,0.75), 1px -1px 0 rgba(15,23,42,0.75), -1px 1px 0 rgba(15,23,42,0.75), 1px 1px 0 rgba(15,23,42,0.75)';
  }

  return {
    theme,
    font,
    textClassName: `${font.className} ${alignClass} ${sizeClass} whitespace-pre-line break-words`,
    effectStyle,
  };
}
