export interface GiftCatalogItem {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  coinCost: number;
  charmValue: number;
  category: 'diwali' | 'popular' | 'romance' | 'luxury' | 'mythic';
  animationType: string;
  gradient: string;
  isNew?: boolean;
  rarityLabel?: string;
}

export const GIFT_CATEGORY_META: Record<
  GiftCatalogItem['category'],
  { label: string; hindiLabel: string; icon: string; badgeClass: string }
> = {
  popular: {
    label: 'Popular',
    hindiLabel: 'लोकप्रिय',
    icon: '🔥',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  diwali: {
    label: 'Festival',
    hindiLabel: 'त्योहार स्पेशल',
    icon: '🪔',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  romance: {
    label: 'Romance',
    hindiLabel: 'रोमांस',
    icon: '💖',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  luxury: {
    label: 'Luxury',
    hindiLabel: 'लक्ज़री',
    icon: '🏎️',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  mythic: {
    label: 'Mythic VIP',
    hindiLabel: 'महा-शाही',
    icon: '🐉',
    badgeClass: 'bg-yellow-50 text-amber-900 border-amber-300',
  },
};

export const ALL_GIFTS_CATALOG: GiftCatalogItem[] = [
  {
    id: 'diwali_1',
    name: 'Shubh Diya',
    hindiName: '🪔 शुभ दीप (Diya)',
    icon: '🪔',
    coinCost: 100,
    charmValue: 20,
    category: 'diwali',
    animationType: 'diwali_diya',
    gradient: 'from-amber-500 to-orange-600',
    isNew: true,
    rarityLabel: 'Festival',
  },
  {
    id: 'diwali_2',
    name: 'Phuljhadi Sparkler',
    hindiName: '🎇 फुलझड़ी (Sparkler)',
    icon: '🎇',
    coinCost: 220,
    charmValue: 44,
    category: 'diwali',
    animationType: 'sparkler',
    gradient: 'from-yellow-400 to-red-500',
    isNew: true,
    rarityLabel: 'Festival',
  },
  {
    id: 'diwali_3',
    name: 'Rangoli Chakri',
    hindiName: '🎆 रंगोली चकरी (Spinner)',
    icon: '🎆',
    coinCost: 520,
    charmValue: 104,
    category: 'diwali',
    animationType: 'chakri',
    gradient: 'from-pink-500 to-purple-600',
    isNew: true,
    rarityLabel: 'Festival',
  },
  {
    id: 'diwali_4',
    name: 'Sky Rocket Dhamaka',
    hindiName: '🚀 स्काई रॉकेट धमाका',
    icon: '🚀',
    coinCost: 5200,
    charmValue: 1040,
    category: 'diwali',
    animationType: 'rocket_dhamaka',
    gradient: 'from-indigo-600 to-purple-800',
    isNew: true,
    rarityLabel: 'Epic',
  },
  {
    id: 'diwali_5',
    name: '10,000 Lad Ladi Firecrackers',
    hindiName: '💥 10,000 लड़ लड़ी पटाखा',
    icon: '💥',
    coinCost: 9999,
    charmValue: 1999,
    category: 'diwali',
    animationType: 'firecracker_symphony',
    gradient: 'from-red-600 via-yellow-500 to-amber-600',
    isNew: true,
    rarityLabel: 'Epic',
  },
  {
    id: 'pop_1',
    name: 'Sweet Candy',
    hindiName: '🍬 टॉफ़ी (Candy)',
    icon: '🍬',
    coinCost: 5,
    charmValue: 1,
    category: 'popular',
    animationType: 'candy',
    gradient: 'from-pink-400 to-rose-500',
    rarityLabel: 'Starter',
  },
  {
    id: 'pop_2',
    name: 'Red Rose',
    hindiName: '🌹 लाल गुलाब',
    icon: '🌹',
    coinCost: 10,
    charmValue: 2,
    category: 'popular',
    animationType: 'rose',
    gradient: 'from-rose-500 to-red-600',
    rarityLabel: 'Classic',
  },
  {
    id: 'pop_3',
    name: 'Masala Chai',
    hindiName: '☕ गरमा-गरम चाय',
    icon: '☕',
    coinCost: 25,
    charmValue: 5,
    category: 'popular',
    animationType: 'tea',
    gradient: 'from-amber-600 to-yellow-700',
    rarityLabel: 'Classic',
  },
  {
    id: 'pop_4',
    name: 'Choco Delight',
    hindiName: '🍫 स्वीट चॉकलेट',
    icon: '🍫',
    coinCost: 50,
    charmValue: 10,
    category: 'popular',
    animationType: 'chocolate',
    gradient: 'from-amber-800 to-amber-950',
    rarityLabel: 'Classic',
  },
  {
    id: 'pop_5',
    name: 'Diamond Ring',
    hindiName: '💍 डायमंड रिंग',
    icon: '💍',
    coinCost: 150,
    charmValue: 30,
    category: 'popular',
    animationType: 'ring',
    gradient: 'from-cyan-400 to-blue-600',
    rarityLabel: 'Rare',
  },
  {
    id: 'pop_6',
    name: 'Celebration Cake',
    hindiName: '🎂 पार्टी केक',
    icon: '🎂',
    coinCost: 300,
    charmValue: 60,
    category: 'popular',
    animationType: 'cake',
    gradient: 'from-purple-500 to-indigo-600',
    rarityLabel: 'Rare',
  },
  {
    id: 'rom_1',
    name: 'Love Letter',
    hindiName: '💌 प्रेम पत्र',
    icon: '💌',
    coinCost: 80,
    charmValue: 16,
    category: 'romance',
    animationType: 'letter',
    gradient: 'from-rose-400 to-pink-500',
    rarityLabel: 'Romance',
  },
  {
    id: 'rom_2',
    name: 'Teddy Bear',
    hindiName: '🧸 टेडी बियर',
    icon: '🧸',
    coinCost: 250,
    charmValue: 50,
    category: 'romance',
    animationType: 'teddy',
    gradient: 'from-amber-500 to-orange-500',
    rarityLabel: 'Romance',
  },
  {
    id: 'rom_3',
    name: 'Love Birds',
    hindiName: '🕊️ लव बर्ड्स',
    icon: '🕊️',
    coinCost: 600,
    charmValue: 120,
    category: 'romance',
    animationType: 'birds',
    gradient: 'from-sky-400 to-indigo-500',
    rarityLabel: 'Rare',
  },
  {
    id: 'rom_4',
    name: 'Romantic Tiara',
    hindiName: '👑 प्रिंसेस टियारा',
    icon: '👑',
    coinCost: 1200,
    charmValue: 240,
    category: 'romance',
    animationType: 'tiara',
    gradient: 'from-pink-500 to-rose-600',
    rarityLabel: 'Royal',
  },
  {
    id: 'lux_1',
    name: 'Super Ferrari',
    hindiName: '🏎️ रेड फरारी स्पोर्ट्स',
    icon: '🏎️',
    coinCost: 1000,
    charmValue: 200,
    category: 'luxury',
    animationType: 'ferrari',
    gradient: 'from-red-600 to-rose-700',
    rarityLabel: 'Luxury',
  },
  {
    id: 'lux_2',
    name: 'Emperor Crown',
    hindiName: '👑 शाही ताज (Crown)',
    icon: '👑',
    coinCost: 2500,
    charmValue: 500,
    category: 'luxury',
    animationType: 'crown',
    gradient: 'from-amber-400 to-yellow-600',
    rarityLabel: 'Luxury',
  },
  {
    id: 'lux_3',
    name: 'Magic Castle',
    hindiName: '🏰 जादुई महल',
    icon: '🏰',
    coinCost: 7500,
    charmValue: 1500,
    category: 'luxury',
    animationType: 'castle',
    gradient: 'from-purple-600 to-pink-700',
    rarityLabel: 'Epic',
  },
  {
    id: 'lux_4',
    name: 'Private Helicopter',
    hindiName: '🚁 वीआईपी हेलिकॉप्टर',
    icon: '🚁',
    coinCost: 25000,
    charmValue: 5000,
    category: 'luxury',
    animationType: 'helicopter',
    gradient: 'from-cyan-500 to-blue-700',
    rarityLabel: 'VIP',
  },
  {
    id: 'lux_5',
    name: 'Mega Luxury Yacht',
    hindiName: '🛳️ सुपर लक्ज़री क्रूज़ यॉट',
    icon: '🛳️',
    coinCost: 100000,
    charmValue: 20000,
    category: 'luxury',
    animationType: 'yacht',
    gradient: 'from-blue-600 to-indigo-900',
    rarityLabel: 'VIP',
  },
  {
    id: 'myth_1',
    name: 'Golden Mythic Dragon',
    hindiName: '🐉 स्वर्णिम आकाश ड्रैगन',
    icon: '🐉',
    coinCost: 500000,
    charmValue: 100000,
    category: 'mythic',
    animationType: 'golden_dragon',
    gradient: 'from-yellow-400 via-amber-500 to-red-600',
    isNew: true,
    rarityLabel: 'Mythic',
  },
  {
    id: 'myth_2',
    name: 'Cosmic Galaxy Kingdom',
    hindiName: '🪐 ब्रह्मांडीय गैलेक्सी साम्राज्य',
    icon: '🪐',
    coinCost: 1000000,
    charmValue: 200000,
    category: 'mythic',
    animationType: 'cosmic_galaxy',
    gradient: 'from-purple-700 via-indigo-600 to-pink-600',
    isNew: true,
    rarityLabel: 'Mythic',
  },
  {
    id: 'myth_3',
    name: 'Supreme Emperor Throne',
    hindiName: '👑 सुप्रीम सम्राट सिंहासन (50 Lakh)',
    icon: '👑',
    coinCost: 5000000,
    charmValue: 1000000,
    category: 'mythic',
    animationType: 'emperor_throne',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    isNew: true,
    rarityLabel: 'Supreme',
  },
];

// Map legacy inline LUXURY_GIFTS IDs (g1..g7) to canonical Gift Wall catalog IDs
const LEGACY_GIFT_ID_MAP: Record<string, string> = {
  g1: 'pop_2', // Red Rose
  g2: 'pop_4', // Chocolate Box -> Choco Delight
  g3: 'pop_5', // Diamond Ring
  g4: 'lux_1', // Luxury Ferrari -> Super Ferrari
  g5: 'diwali_4', // Golden Rocket -> Sky Rocket Dhamaka
  g6: 'lux_2', // Emperor Crown
  g7: 'lux_3', // Royal Castle -> Magic Castle
};

export function resolveCanonicalGiftId(rawId?: string, rawName?: string): string {
  const idClean = String(rawId || '').trim();
  if (idClean && ALL_GIFTS_CATALOG.some((g) => g.id === idClean)) {
    return idClean;
  }
  if (idClean && LEGACY_GIFT_ID_MAP[idClean]) {
    return LEGACY_GIFT_ID_MAP[idClean];
  }
  const lowerName = String(rawName || '').toLowerCase();
  if (lowerName) {
    const byName = ALL_GIFTS_CATALOG.find(
      (g) => lowerName.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(lowerName)
    );
    if (byName) return byName.id;
  }
  return idClean || 'pop_2';
}

export function isNumericRoomId(val?: string): boolean {
  if (!val) return false;
  return /^\d{3,10}$/.test(String(val).trim());
}

export function isVipFancyRoomNumber(val?: string): boolean {
  const s = String(val || '').trim();
  if (!/^\d{3,10}$/.test(s)) return false;
  // Standard counting starts at 10001+, so 3-4 digit numbers (e.g. 1111, 2222, 1234, 0007) are VIP
  if (s.length <= 4) return true;
  // All same digits (11111, 77777)
  if (/^(\d)\1+$/.test(s)) return true;
  // Ascending or descending sequences (12345, 54321)
  if ('0123456789'.includes(s) || '9876543210'.includes(s)) return true;
  // Repeating pairs (121212, 100100)
  if (s.length >= 6 && s.slice(0, 2).repeat(Math.floor(s.length / 2)) === s.slice(0, Math.floor(s.length / 2) * 2)) {
    return true;
  }
  return false;
}

export const CURATED_VIP_ROOM_NUMBERS = [
  '1111',
  '2222',
  '3333',
  '4444',
  '5555',
  '6666',
  '7777',
  '8888',
  '9999',
  '1234',
  '4321',
  '1001',
  '2002',
  '0007',
  '0786',
  '1010',
  '2525',
  '7878',
];
