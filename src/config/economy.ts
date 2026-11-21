export type FrameQuality =
  | 'Standard'
  | 'Common'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic';

export interface FrameCatalogItem {
  id: string;
  variant: string;
  name: string;
  hindiName: string;
  titleBadge: string;
  quality: FrameQuality;
  coinPrice: number;
  description: string;
  glowColor: string;
  qualityBadgeColor: string;
  icon: string;
}

export const FRAME_CATALOG: FrameCatalogItem[] = [
  {
    id: 'frame-standard',
    variant: 'standard',
    name: 'Standard Classic',
    hindiName: 'क्लासिक स्टार्टर फ्रेम',
    titleBadge: '⭐ MEMBER',
    quality: 'Standard',
    coinPrice: 0,
    description: 'डिफ़ॉल्ट स्टार्टर बॉर्डर (सभी नए खिलाड़ियों के लिए मुफ्त)',
    glowColor: 'from-slate-500 to-slate-700',
    qualityBadgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: '💠',
  },
  {
    id: 'frame-rookie',
    variant: 'rookie',
    name: 'Rookie Emerald',
    hindiName: 'रूकी एमराल्ड फ्रेम',
    titleBadge: '🔰 ROOKIE',
    quality: 'Common',
    coinPrice: 25,
    description: 'एमराल्ड ग्रीन रिंग और रूकी स्टार बैज (Common Quality)',
    glowColor: 'from-emerald-500 to-teal-600',
    qualityBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    icon: '🔰',
  },
  {
    id: 'frame-pro-player',
    variant: 'pro-player',
    name: 'Pro Player Electric',
    hindiName: 'प्रो प्लेयर नियॉन फ्रेम',
    titleBadge: '⚡ PRO PLAYER',
    quality: 'Rare',
    coinPrice: 50,
    description: 'इलेक्ट्रिक ब्लू नियॉन रिंग और लाइटनिंग बैज (Rare Quality)',
    glowColor: 'from-cyan-500 to-blue-600',
    qualityBadgeColor: 'bg-blue-50 text-blue-700 border-blue-300',
    icon: '⚡',
  },
  {
    id: 'frame-wolf-night',
    variant: 'wolf-night',
    name: 'Night Wolf Alpha',
    hindiName: 'नाइट वोल्फ एमेथिस्ट फ्रेम',
    titleBadge: '🐺 NIGHT WOLF',
    quality: 'Epic',
    coinPrice: 100,
    description: 'डार्क एमेथिस्ट लूनर हॉर्न और पर्पल ऑरा (Epic Quality)',
    glowColor: 'from-purple-600 to-indigo-600',
    qualityBadgeColor: 'bg-purple-50 text-purple-700 border-purple-300',
    icon: '🐺',
  },
  {
    id: 'frame-judge',
    variant: 'judge-justice',
    name: 'Judge of Justice',
    hindiName: 'जज जस्टिस गोल्ड स्केल फ्रेम',
    titleBadge: '⚖️ JUDGE JUSTICE',
    quality: 'Epic',
    coinPrice: 120,
    description: 'गोल्डन स्केल एम्बलम और निष्पक्ष न्याय बॉर्डर (Epic Quality)',
    glowColor: 'from-yellow-500 to-amber-700',
    qualityBadgeColor: 'bg-purple-50 text-purple-700 border-purple-300',
    icon: '⚖️',
  },
  {
    id: 'frame-grand-champion',
    variant: 'cosmic-neon',
    name: 'Cosmic Prism Champion',
    hindiName: 'कॉस्मिक प्रिज़्म चैंपियन फ्रेम',
    titleBadge: '🏆 CHAMPION',
    quality: 'Legendary',
    coinPrice: 200,
    description: 'होलोग्राफिक रेनबो प्रिज़्म और कॉस्मिक पल्स (Legendary Quality)',
    glowColor: 'from-pink-500 via-cyan-400 to-violet-500',
    qualityBadgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: '🏆',
  },
  {
    id: 'frame-vip-gold',
    variant: 'vip-gold',
    name: 'VIP 24K Gold Bullion',
    hindiName: 'VIP 24K गोल्ड फ्रेम',
    titleBadge: '💎 VIP GOLD',
    quality: 'Legendary',
    coinPrice: 300,
    description: '24K सॉलिड गोल्ड बुलियन बॉर्डर और डायमंड ग्लो (Legendary Quality)',
    glowColor: 'from-amber-400 to-yellow-600',
    qualityBadgeColor: 'bg-amber-50 text-amber-800 border-amber-300',
    icon: '💎',
  },
  {
    id: 'frame-clan-leader',
    variant: 'clan-leader',
    name: 'Clan Leader Crown',
    hindiName: 'क्लैन लीडर क्राउन फ्रेम',
    titleBadge: '👑 CLAN LEADER',
    quality: 'Mythic',
    coinPrice: 500,
    description: 'शाही 3D गोल्ड क्राउन और रूबी रत्न एम्बलम (Mythic Quality)',
    glowColor: 'from-amber-400 to-yellow-500',
    qualityBadgeColor: 'bg-rose-50 text-rose-700 border-rose-300',
    icon: '👑',
  },
  {
    id: 'frame-royal-dragon',
    variant: 'royal-dragon-crown',
    name: 'Royal Dragon Emperor',
    hindiName: 'रॉयल ड्रैगन एम्परर फ्रेम',
    titleBadge: '🐉 ROYAL DRAGON',
    quality: 'Mythic',
    coinPrice: 500,
    description: 'सर्वोच्च ड्रैगन क्राउन व एनिमेटेड गोल्डन आभामंडल (Mythic Quality)',
    glowColor: 'from-yellow-400 via-amber-500 to-red-500',
    qualityBadgeColor: 'bg-rose-50 text-rose-700 border-rose-300',
    icon: '🐉',
  },
];

export type VipTierId = 'none' | 'silver' | 'gold' | 'diamond';

export interface VipTierConfig {
  id: Exclude<VipTierId, 'none'>;
  name: string;
  hindiName: string;
  badgeText: string;
  coinPrice: number;
  icon: string;
  colorClass: string;
  perks: string[];
  bonusXpMultiplier: number;
}

export const VIP_TIERS: VipTierConfig[] = [
  {
    id: 'silver',
    name: 'Silver VIP',
    hindiName: 'सिल्वर VIP मेंबरशिप',
    badgeText: '🥈 SILVER VIP',
    coinPrice: 50,
    icon: '🥈',
    colorClass: 'from-slate-600 to-slate-800',
    perks: [
      'प्रोफाइल और वॉइस रूम में Silver VIP बैज',
      'चैट रूम में विशेष सिल्वर नेम हाइलाइट',
      '10% अतिरिक्त टास्क EXP बोनस',
    ],
    bonusXpMultiplier: 1.1,
  },
  {
    id: 'gold',
    name: 'Gold VIP',
    hindiName: 'गोल्ड VIP मेंबरशिप',
    badgeText: '🥇 GOLD VIP',
    coinPrice: 150,
    icon: '🥇',
    colorClass: 'from-amber-500 to-yellow-600',
    perks: [
      'प्रीमियम Gold VIP बैज व प्रोफाइल क्राउन स्पार्क',
      'वॉइस रूम स्टेज पर प्राथमिकता एंट्री बैज',
      '25% अतिरिक्त टास्क EXP बोनस',
    ],
    bonusXpMultiplier: 1.25,
  },
  {
    id: 'diamond',
    name: 'Diamond Emperor VIP',
    hindiName: 'डायमंड एम्परर VIP',
    badgeText: '👑 DIAMOND VIP',
    coinPrice: 350,
    icon: '👑',
    colorClass: 'from-blue-600 via-indigo-600 to-purple-600',
    perks: [
      'सुप्रीम Diamond Emperor बैज व गोल्डन नेमटैग',
      'अतिरिक्त वॉइस रूम होस्ट सम्मान बैज',
      '50% अतिरिक्त टास्क EXP बोनस',
    ],
    bonusXpMultiplier: 1.5,
  },
];

export type TaskEventType =
  | 'profile_completed'
  | 'chat_sent'
  | 'moment_posted'
  | 'voice_joined'
  | 'game_played'
  | 'gift_sent';

export interface RealTaskCatalogItem {
  id: string;
  eventType: TaskEventType;
  title: string;
  hindiTitle: string;
  description: string;
  coinReward: number; // Strictly 5 coins per completed task
  xpReward: number;
  targetCount: number;
  icon: string;
  actionTab: string;
  actionLabel: string;
}

export const REAL_TASKS_CATALOG: RealTaskCatalogItem[] = [
  {
    id: 'task-profile',
    eventType: 'profile_completed',
    title: 'Complete Your Profile & Bio',
    hindiTitle: 'प्रोफाइल नाम, बायो या अवतार अपडेट करें',
    description: 'अपनी प्रोफाइल डिटेल या अवतार सेव करें। पूरा होने पर ही 5 कॉइन्स और +30 EXP मिलेंगे।',
    coinReward: 5,
    xpReward: 30,
    targetCount: 1,
    icon: '🪪',
    actionTab: 'profile',
    actionLabel: 'प्रोफाइल अपडेट करें',
  },
  {
    id: 'task-chat',
    eventType: 'chat_sent',
    title: 'Send 3 Messages in Chat Club / Voice Room',
    hindiTitle: 'चैट क्लब या वॉइस रूम में 3 असली मैसेज भेजें',
    description: 'जब आप चैट में कम से कम 3 मैसेज भेज देंगे तभी यह टास्क पूरा होगा।',
    coinReward: 5,
    xpReward: 25,
    targetCount: 3,
    icon: '💬',
    actionTab: 'voice_room',
    actionLabel: 'चैट / वॉइस रूम खोलें',
  },
  {
    id: 'task-moment',
    eventType: 'moment_posted',
    title: 'Share a Real Post in Daily Moments',
    hindiTitle: 'डेली मोमेंट्स फ़ीड में 1 पोस्ट शेयर करें',
    description: 'डेली मोमेंट्स में अपना स्टेटस या प्रमोशन पोस्ट पब्लिश करें।',
    coinReward: 5,
    xpReward: 35,
    targetCount: 1,
    icon: '📸',
    actionTab: 'moments',
    actionLabel: 'मोमेंट पोस्ट करें',
  },
  {
    id: 'task-voice',
    eventType: 'voice_joined',
    title: 'Join Any Live Voice Stage Seat',
    hindiTitle: 'लाइव वॉइस रूम में माइक सीट जॉइन करें',
    description: 'वॉइस रूम में किसी खाली माइक सीट पर बैठकर सक्रिय भाग लें।',
    coinReward: 5,
    xpReward: 30,
    targetCount: 1,
    icon: '🎙️',
    actionTab: 'voice_room',
    actionLabel: 'वॉइस सीट जॉइन करें',
  },
  {
    id: 'task-game',
    eventType: 'game_played',
    title: 'Complete 2 Real Game Rounds',
    hindiTitle: 'गेम एरीना में 2 गेम राउंड पूरे करें',
    description: 'स्पिन, डाइस, कॉइन फ्लिप, वेयरवुल्फ या स्पाई गेम के 2 राउंड पूरे करें।',
    coinReward: 5,
    xpReward: 40,
    targetCount: 2,
    icon: '🎮',
    actionTab: 'games_arena',
    actionLabel: 'गेम खेलें',
  },
  {
    id: 'task-gift',
    eventType: 'gift_sent',
    title: 'Send 1 Gift to Any Community Member',
    hindiTitle: 'किसी खिलाड़ी या होस्ट को 1 गिफ्ट भेजें',
    description: 'अपने कॉइन्स से कम से कम 1 गिफ्ट भेजकर सम्मान बढ़ाएं।',
    coinReward: 5,
    xpReward: 50,
    targetCount: 1,
    icon: '🎁',
    actionTab: 'voice_room',
    actionLabel: 'गिफ्ट भेजें',
  },
];

export interface TaskMilestoneChest {
  id: string;
  label: string;
  hindiLabel: string;
  requiredTasksCompleted: number;
  coinReward: number; // Strictly 5 coins
  xpReward: number;
  icon: string;
}

export const CHEST_MILESTONES: TaskMilestoneChest[] = [
  {
    id: 'chest_bronze',
    label: 'Bronze Task Box',
    hindiLabel: 'ब्रॉन्ज़ टास्क चेस्ट (1 टास्क पूरा)',
    requiredTasksCompleted: 1,
    coinReward: 5,
    xpReward: 20,
    icon: '📦',
  },
  {
    id: 'chest_silver',
    label: 'Silver Task Box',
    hindiLabel: 'सिल्वर टास्क चेस्ट (3 टास्क पूरे)',
    requiredTasksCompleted: 3,
    coinReward: 5,
    xpReward: 40,
    icon: '🪙',
  },
  {
    id: 'chest_gold',
    label: 'Gold Task Box',
    hindiLabel: 'गोल्ड टास्क चेस्ट (5 टास्क पूरे)',
    requiredTasksCompleted: 5,
    coinReward: 5,
    xpReward: 60,
    icon: '👑',
  },
  {
    id: 'chest_diamond',
    label: 'All-Tasks Master Box',
    hindiLabel: 'मास्टर टास्क चेस्ट (सभी 6 टास्क पूरे)',
    requiredTasksCompleted: 6,
    coinReward: 5,
    xpReward: 100,
    icon: '💎',
  },
];

export interface AdvanceRoomTheme {
  id: string;
  name: string;
  hindiName: string;
  coinPrice: number;
  bgImageUrl?: string;
  bgGradient: string;
  accentColor: string;
  description: string;
  badge: string;
  isDivine?: boolean;
}

export const ADVANCE_ROOM_THEMES: AdvanceRoomTheme[] = [
  {
    id: 'default_dark',
    name: 'Classic Light Marketplace Room',
    hindiName: 'क्लासिक लाइट रूम (Default)',
    coinPrice: 0,
    bgGradient: 'from-[#ffffff] via-[#f5f8ff] to-[#eef4ff]',
    accentColor: '#2874f0',
    description: 'क्लीन व्हाइट एवं रॉयल ब्लू वॉइस रूम डिफ़ॉल्ट लेआउट',
    badge: 'FREE DEFAULT',
  },
  {
    id: 'krishna_divine',
    name: 'Shri Krishna Celestial Pavilion',
    hindiName: '🦚 श्री कृष्ण दिव्य पैवेलियन',
    coinPrice: 50,
    bgGradient: 'from-[#031336] via-[#092257] to-[#040d21]',
    accentColor: '#38bdf8',
    description: 'मोरपंख आभा व दिव्य नीलिमा वाला विशेष वॉइस रूम',
    badge: '50 COINS',
    isDivine: true,
  },
  {
    id: 'weplay_royal_purple',
    name: 'ESP PLAY Royal Purple Hall',
    hindiName: '👑 रॉयल पर्पल पार्टी हॉल',
    coinPrice: 150,
    bgGradient: 'from-purple-950/90 via-indigo-950/90 to-fuchsia-950/90',
    accentColor: '#c084fc',
    description: 'पर्पल पार्टी स्टेज व कॉस्मेटिक रूम बैकग्राउंड',
    badge: '150 COINS',
  },
  {
    id: 'maharaja_palace',
    name: 'Maharaja Imperial Gold Palace',
    hindiName: '🏰 महाराजा गोल्ड पैलेस',
    coinPrice: 300,
    bgGradient: 'from-amber-950/90 via-yellow-950/80 to-stone-950',
    accentColor: '#fbbf24',
    description: 'स्वर्ण सिंहासन व वीआईपी गोल्ड थीम रूम',
    badge: '300 COINS',
  },
  {
    id: 'diamond_arena',
    name: 'Diamond Emperor Arena',
    hindiName: '💎 डायमंड एम्परर एरिना',
    coinPrice: 500,
    bgGradient: 'from-cyan-950/90 via-blue-950/90 to-slate-950',
    accentColor: '#22d3ee',
    description: 'प्रीमियम डायमंड हॉल व स्टेज बैकग्राउंड',
    badge: '500 COINS',
  },
];

export interface CoinRechargePack {
  id: string;
  coins: number;
  bonus: number;
  amount: number;
  tag: string;
}

export const COIN_RECHARGE_PACKS: CoinRechargePack[] = [
  { id: 'pack-10', coins: 100, bonus: 0, amount: 10, tag: 'Starter' },
  { id: 'pack-25', coins: 250, bonus: 0, amount: 25, tag: 'Value' },
  { id: 'pack-50', coins: 500, bonus: 0, amount: 50, tag: 'Popular' },
  { id: 'pack-100', coins: 1000, bonus: 0, amount: 100, tag: 'Pro Pack' },
  { id: 'pack-250', coins: 2500, bonus: 0, amount: 250, tag: 'VIP Pack' },
  { id: 'pack-500', coins: 5000, bonus: 0, amount: 500, tag: 'Mega Pack' },
];

export interface GiftCardCatalogItem {
  id: string;
  brand: 'Amazon' | 'Flipkart' | 'Google Play' | 'UPI Cash Voucher';
  title: string;
  hindiTitle: string;
  denomination: number;
  coinsRequired: number;
  description: string;
  instructions: string;
}

export const GIFT_CARD_CATALOG: GiftCardCatalogItem[] = [
  {
    id: 'gc-amz-50',
    brand: 'Amazon',
    title: 'Amazon Pay ₹50 Gift Card',
    hindiTitle: 'अमेज़न पे ₹50 गिफ्ट वाउचर',
    denomination: 50,
    coinsRequired: 500,
    description: 'एडमिन सत्यापन के बाद असली अमेज़न वाउचर कोड आपके खाते में जारी किया जाएगा।',
    instructions: 'रिडीम अनुरोध के बाद एडमिन 24 घंटे के भीतर असली Amazon Pay कोड जारी करेंगे।',
  },
  {
    id: 'gc-flp-100',
    brand: 'Flipkart',
    title: 'Flipkart ₹100 E-Gift Voucher',
    hindiTitle: 'फ्लिपकार्ट ₹100 ई-गिफ्ट वाउचर',
    denomination: 100,
    coinsRequired: 1000,
    description: 'असली Flipkart शॉपिंग वाउचर एडमिन द्वारा वेरीफाई कर भेजा जाएगा।',
    instructions: 'Flipkart App -> My Account -> Gift Cards में असली कोड रिडीम करें।',
  },
  {
    id: 'gc-gp-100',
    brand: 'Google Play',
    title: 'Google Play ₹100 Redeem Code',
    hindiTitle: 'गूगल प्ले ₹100 रिडीम कोड',
    denomination: 100,
    coinsRequired: 1000,
    description: 'Play Store ऐप्स और गेम्स के लिए असली रिडीम कोड।',
    instructions: 'Google Play Store -> Payments -> Redeem Code में दर्ज करें।',
  },
  {
    id: 'gc-upi-250',
    brand: 'UPI Cash Voucher',
    title: 'Direct UPI ₹250 Voucher',
    hindiTitle: 'डायरेक्ट UPI ₹250 कैश वाउचर',
    denomination: 250,
    coinsRequired: 2500,
    description: 'सीधे आपकी वेरीफाइड UPI ID पर एडमिन द्वारा ₹250 का भुगतान।',
    instructions: 'अपनी प्रोफाइल में सही UPI ID सेव रखें। एडमिन UTR नंबर के साथ ट्रांसफर करेंगे।',
  },
];

export function calculateLevelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0));
  return Math.floor(safeXp / 100) + 1;
}

export function getXpProgressInLevel(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXpRequired: number;
  percent: number;
} {
  const safeXp = Math.max(0, Math.floor(Number(xp) || 0));
  const level = calculateLevelFromXp(safeXp);
  const currentLevelXp = safeXp % 100;
  return {
    level,
    currentLevelXp,
    nextLevelXpRequired: 100,
    percent: currentLevelXp,
  };
}

export function getFrameByVariant(variant?: string): FrameCatalogItem {
  return (
    FRAME_CATALOG.find(f => f.variant === variant) ||
    FRAME_CATALOG[0]
  );
}

export function getVipConfig(tier?: VipTierId | string): VipTierConfig | null {
  if (!tier || tier === 'none') return null;
  return VIP_TIERS.find(v => v.id === tier) || null;
}
