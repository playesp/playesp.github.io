import castleNightImg from '../assets/images/voice_castle_night_1795183550422.jpg';
import purpleHeartImg from '../assets/images/voice_purple_heart_1795183550789.jpg';
import royalEventImg from '../assets/images/voice_royal_event_1795183550495.jpg';
import oceanMoonImg from '../assets/images/voice_ocean_moon_1795183549932.jpg';
import type { VoiceRoomStageLayout } from '../types/index.ts';

export interface VoiceWallpaperPreset {
  id: string;
  name: string;
  hindiName: string;
  subtitle: string;
  imageUrl?: string;
  gradientClass: string;
  recommendedLayout: VoiceRoomStageLayout;
  isLightBackdrop?: boolean;
  badge: string;
}

export const VOICE_WALLPAPER_PRESETS: VoiceWallpaperPreset[] = [
  {
    id: 'castle_night',
    name: 'Moonlit Fairytale Castle',
    hindiName: '🌙 चाँदनी जादुई महल (Castle Night)',
    subtitle: 'Starry night castle backdrop with glowing moon',
    imageUrl: castleNightImg,
    gradientClass: 'from-[#081337] via-[#13295d] to-[#050b21]',
    recommendedLayout: 'classic_8',
    badge: 'CLASSIC',
  },
  {
    id: 'purple_heart',
    name: 'Purple Heart Concert',
    hindiName: '💜 पर्पल हार्ट स्टेज (Heart Stage)',
    subtitle: 'Glowing neon heart rings & violet concert stage',
    imageUrl: purpleHeartImg,
    gradientClass: 'from-[#2e026d] via-[#5b0ca6] to-[#1a043d]',
    recommendedLayout: 'heart_stage',
    badge: 'POPULAR',
  },
  {
    id: 'royal_event',
    name: 'Royal Celebration Hall',
    hindiName: '👑 रॉयल इवेंट पैलेस (Event Hall)',
    subtitle: 'Sky-blue & gold crystal chandelier celebration hall',
    imageUrl: royalEventImg,
    gradientClass: 'from-[#9ac5ff] via-[#cfe3ff] to-[#8cb7ff]',
    recommendedLayout: 'event_hall',
    isLightBackdrop: true,
    badge: 'EVENT',
  },
  {
    id: 'ocean_moon',
    name: 'Midnight Ocean Sailboat',
    hindiName: '⛵ समंदर व चाँद (Watch Party)',
    subtitle: 'Full moon over shimmering waves & lighthouse',
    imageUrl: oceanMoonImg,
    gradientClass: 'from-[#061838] via-[#0e3468] to-[#041028]',
    recommendedLayout: 'watch_party',
    badge: 'WATCH TV',
  },
];

export const STAGE_LAYOUT_OPTIONS: Array<{
  id: VoiceRoomStageLayout;
  title: string;
  hindiTitle: string;
  description: string;
  icon: string;
}> = [
  {
    id: 'classic_8',
    title: 'Classic 8-Seat Stage',
    hindiTitle: '🏰 क्लासिक 8 सीट स्टेज',
    description: 'Owner center spotlight + 2x4 mic seats & locks',
    icon: '👑',
  },
  {
    id: 'heart_stage',
    title: 'Heart Interaction Stage',
    hindiTitle: '💜 हार्ट इंटरैक्ट स्टेज',
    description: 'Interact/Select/Reveal/Confess tabs + circular ring',
    icon: '💜',
  },
  {
    id: 'event_hall',
    title: 'Royal Event / MC Hall',
    hindiTitle: '🎉 रॉयल इवेंट व MC हॉल',
    description: 'MC + Host podium, charms counter & dual columns',
    icon: '🎙️',
  },
  {
    id: 'watch_party',
    title: 'YouTube Watch Together',
    hindiTitle: '📺 यूट्यूब वॉच पार्टी + सीट्स',
    description: 'Watch YouTube videos together + 2 seat rows below',
    icon: '▶️',
  },
];

export function resolveWallpaperBackdrop(wallpaperId?: string, customWallpaperUrl?: string): {
  imageUrl?: string;
  gradientClass: string;
  isLight: boolean;
  preset?: VoiceWallpaperPreset;
} {
  if (customWallpaperUrl && customWallpaperUrl.trim()) {
    return {
      imageUrl: customWallpaperUrl.trim(),
      gradientClass: 'from-slate-900 via-indigo-950 to-slate-950',
      isLight: false,
    };
  }
  const found =
    VOICE_WALLPAPER_PRESETS.find((w) => w.id === wallpaperId) || VOICE_WALLPAPER_PRESETS[0];
  return {
    imageUrl: found.imageUrl,
    gradientClass: found.gradientClass,
    isLight: Boolean(found.isLightBackdrop),
    preset: found,
  };
}

export function extractYouTubeEmbedUrl(rawUrl?: string): string | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const trimmed = rawUrl.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const match = trimmed.match(re);
    if (match && match[1]) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`;
    }
  }
  return null;
}
