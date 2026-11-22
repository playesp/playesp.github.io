// Unified ESP PLAY Social, Relationship Tokens, Premium Room Tiers & Events Catalog
// Safe for both client components and server.ts (pure TS constants, zero asset imports)

export interface RelationshipTokenItem {
  id: 'rel_bestie' | 'rel_bro' | 'rel_sis' | 'rel_mentor' | 'rel_soulmate' | 'rel_cp';
  tagName: string;
  hindiName: string;
  badgeIcon: string;
  coinPrice: number;
  gradient: string;
  borderClass: string;
  textClass: string;
  perks: string;
  isCpTier?: boolean;
}

export const RELATIONSHIP_TOKENS: RelationshipTokenItem[] = [
  {
    id: 'rel_bestie',
    tagName: 'Bestie',
    hindiName: 'पक्का दोस्त (Bestie)',
    badgeIcon: '⚡',
    coinPrice: 199,
    gradient: 'from-emerald-500 to-teal-600',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-800',
    perks: 'प्रोफाइल व वॉइस सीट पर Bestie टैग + +10% फ्रेंड चार्म्स बूस्ट',
  },
  {
    id: 'rel_bro',
    tagName: 'Brotherhood',
    hindiName: 'भाईचारा (Bro Tag)',
    badgeIcon: '🛡️',
    coinPrice: 299,
    gradient: 'from-blue-600 to-indigo-700',
    borderClass: 'border-blue-300',
    textClass: 'text-blue-900',
    perks: 'रॉयल शील्ड बैज + गेमिंग लॉबी व फैमिली में साथ दिखने वाला ब्रदर टैग',
  },
  {
    id: 'rel_sis',
    tagName: 'Sister',
    hindiName: 'प्यारी बहन (Sis Tag)',
    badgeIcon: '🌸',
    coinPrice: 299,
    gradient: 'from-pink-500 to-rose-500',
    borderClass: 'border-pink-300',
    textClass: 'text-pink-900',
    perks: 'ब्लॉसम पिंक रिबन टैग + वॉइस रूम सीट हाइलाइट इफ़ेक्ट',
  },
  {
    id: 'rel_mentor',
    tagName: 'Mentor',
    hindiName: 'गुरु / उस्ताद (Mentor)',
    badgeIcon: '🎓',
    coinPrice: 499,
    gradient: 'from-indigo-600 to-violet-700',
    borderClass: 'border-indigo-300',
    textClass: 'text-indigo-900',
    perks: 'गोल्डन आउल क्रेस्ट + मेंटर-स्टूडेंट EXP बोनस टैग',
  },
  {
    id: 'rel_soulmate',
    tagName: 'Soulmate',
    hindiName: 'हमसफ़र (Soulmate)',
    badgeIcon: '💖',
    coinPrice: 799,
    gradient: 'from-rose-500 via-pink-600 to-amber-500',
    borderClass: 'border-rose-300',
    textClass: 'text-rose-900',
    perks: 'रोज़ गोल्ड ट्विन-हार्ट टैग + दोनों की प्रोफाइल पर स्पेशल कपल कार्ड',
  },
  {
    id: 'rel_cp',
    tagName: 'Royal CP',
    hindiName: 'रॉयल CP जोड़ी (Diamond CP)',
    badgeIcon: '💍',
    coinPrice: 1299,
    gradient: 'from-purple-600 via-fuchsia-600 to-amber-500',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-950',
    perks: 'डायमंड रिंग CP क्रेस्ट + वेडिंग स्टेज अनलॉक व एनिवर्सरी बैज',
    isCpTier: true,
  },
];

export type VoiceRoomTierId = 'normal' | 'silver_club' | 'gold_palace' | 'diamond_theater';

export interface VoiceRoomTierSpec {
  id: VoiceRoomTierId;
  name: string;
  hindiName: string;
  coinPrice: number;
  badgeIcon: string;
  badgeLabel: string;
  allowedLayouts: Array<'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party'>;
  allowCustomWallpaper: boolean;
  pkBoostMultiplier: number;
  gradient: string;
  perks: string[];
}

export const VOICE_ROOM_TIERS: VoiceRoomTierSpec[] = [
  {
    id: 'normal',
    name: 'Normal Voice Room',
    hindiName: 'नॉर्मल वॉइस रूम (Free Starter)',
    coinPrice: 0,
    badgeIcon: '🎙️',
    badgeLabel: 'STANDARD',
    allowedLayouts: ['classic_8'],
    allowCustomWallpaper: true,
    pkBoostMultiplier: 1,
    gradient: 'from-slate-700 to-slate-800',
    perks: [
      'सभी यूजर्स के लिए बिल्कुल फ्री (0 Coins)',
      '8-सीट क्लासिक स्टेज व पर्सनल काउंटिंग Room ID',
      'फ्री प्रीसेट वॉलपेपर और इनवाइट लिंक सिस्टम',
    ],
  },
  {
    id: 'silver_club',
    name: 'Silver Party Room',
    hindiName: 'सिल्वर एडवांस पार्टी रूम',
    coinPrice: 250,
    badgeIcon: '🥈',
    badgeLabel: 'SILVER ADVANCE',
    allowedLayouts: ['classic_8', 'heart_stage'],
    allowCustomWallpaper: true,
    pkBoostMultiplier: 1.25,
    gradient: 'from-slate-500 via-cyan-600 to-blue-700',
    perks: [
      'Heart Stage (हार्ट कपल स्टेज) अनलॉक',
      'कस्टम HD वॉलपेपर अपलोड और सिल्वर ग्लो बैज',
      'रूम डायरेक्टरी में सिल्वर हाइलाइट',
    ],
  },
  {
    id: 'gold_palace',
    name: 'Royal Gold Palace',
    hindiName: 'रॉयल गोल्ड एडवांस हॉल',
    coinPrice: 600,
    badgeIcon: '👑',
    badgeLabel: 'GOLD ADVANCE',
    allowedLayouts: ['classic_8', 'heart_stage', 'event_hall'],
    allowCustomWallpaper: true,
    pkBoostMultiplier: 1.5,
    gradient: 'from-amber-500 via-orange-500 to-yellow-600',
    perks: [
      'Wedding / Royal Event Hall स्टेज अनलॉक',
      'PK बैटल में 1.5x चार्म्स बूस्ट',
      'रूम डायरेक्टरी में टॉप स्पॉटलाइट प्राथमिकता',
    ],
  },
  {
    id: 'diamond_theater',
    name: 'Diamond VIP Theater',
    hindiName: 'डायमंड VIP प्रीमियम थिएटर',
    coinPrice: 1200,
    badgeIcon: '💎',
    badgeLabel: 'DIAMOND VIP',
    allowedLayouts: ['classic_8', 'heart_stage', 'event_hall', 'watch_party'],
    allowCustomWallpaper: true,
    pkBoostMultiplier: 2,
    gradient: 'from-purple-600 via-indigo-600 to-cyan-600',
    perks: [
      'YouTube Watch Party + सभी 4 प्रीमियम स्टेज अनलॉक',
      'PK बैटल व गिफ्टिंग में 2x चार्म्स मल्टीप्लायर',
      'प्रीमियम डायमंड क्रेस्ट और हाई-प्रायोरिटी लिस्टिंग',
    ],
  },
];

export interface EspEventSpec {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  metricKey: 'totalCoinsSpent' | 'totalGamesWon' | 'relationshipsCount' | 'familyCoinsContributed';
  targetValue: number;
  coinReward: number;
  xpReward: number;
  badgeIcon: string;
  accentGradient: string;
}

export const ESP_EVENTS_CATALOG: EspEventSpec[] = [
  {
    id: 'evt_gift_carnival',
    title: 'ESP PLAY Gift Carnival',
    hindiTitle: 'रॉयल गिफ्ट कार्निवल',
    description: 'वॉइस रूम या फैमिली चैट में गिफ्ट भेजकर 200+ Coins का योगदान पूरा करें।',
    metricKey: 'totalCoinsSpent',
    targetValue: 200,
    coinReward: 75,
    xpReward: 150,
    badgeIcon: '🎁',
    accentGradient: 'from-rose-500 to-orange-500',
  },
  {
    id: 'evt_arena_champion',
    title: 'Gaming Arena Champion',
    hindiTitle: 'गेमिंग एरिना चैंपियन',
    description: 'Ludo, Bingo, Oh My Card या Spy गेम्स में कुल 3 जीत दर्ज करें।',
    metricKey: 'totalGamesWon',
    targetValue: 3,
    coinReward: 60,
    xpReward: 120,
    badgeIcon: '🏆',
    accentGradient: 'from-blue-600 to-indigo-600',
  },
  {
    id: 'evt_cp_love_week',
    title: 'ESP PLAY Bond & CP Week',
    hindiTitle: 'रिलेशनशिप व CP स्पेशल वीक',
    description: 'किसी दोस्त के साथ कम से कम 1 प्रीमियम रिलेशनशिप या CP टैग जोड़ें।',
    metricKey: 'relationshipsCount',
    targetValue: 1,
    coinReward: 100,
    xpReward: 200,
    badgeIcon: '💍',
    accentGradient: 'from-purple-600 to-pink-600',
  },
  {
    id: 'evt_family_treasury',
    title: 'Family Treasury Patron',
    hindiTitle: 'फैमिली ट्रेजरी योगदान अभियान',
    description: 'अपनी ESP Family के खजाने (Family Coins) में कम से कम 100 Coins दान करें।',
    metricKey: 'familyCoinsContributed',
    targetValue: 100,
    coinReward: 50,
    xpReward: 100,
    badgeIcon: '🏰',
    accentGradient: 'from-emerald-600 to-teal-600',
  },
];

export const FAMILY_EMBLEMS = ['👑', '🛡️', '🐉', '🔥', '🦁', '⚡', '💎', '🦅', '🌸', '⚔️'];

export function getRelationshipTokenSpec(tokenId: string): RelationshipTokenItem {
  return RELATIONSHIP_TOKENS.find(t => t.id === tokenId) || RELATIONSHIP_TOKENS[0];
}

export function getVoiceRoomTierSpec(tierId?: string): VoiceRoomTierSpec {
  return VOICE_ROOM_TIERS.find(t => t.id === tierId) || VOICE_ROOM_TIERS[0];
}
