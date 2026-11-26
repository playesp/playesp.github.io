import type {
  PlatformSettings,
  ServiceItem,
  UserProfile,
  ReferralRecord,
  WalletTransaction,
  PayoutRequest,
  NotificationItem,
  Moment,
  ChatRoom,
  ClubChatMessage,
  UserContact,
  CoinRechargeRequest,
  UserComplaint,
  GamePlayRecord,
  CoinTransactionRecord,
  ProfileAuditRecord,
  OnlineActivitySession,
  HomeSliderPhoto,
  ContactMessage,
  GiftCardVoucher,
  GiftCardRedemption,
  PlanUpgradeRequest,
  VoiceRoomSeat,
  WePlayBot,
  NwiMemberNode,
  NwiTreeRecord,
  EspFamily,
  GiftHistoryRecord,
  DirectMessageRecord,
  AdminSession,
  UserSession,
} from '../types/index.ts';
import {
  VIP_TIERS,
  REAL_TASKS_CATALOG,
  CHEST_MILESTONES,
  ACTIVENESS_CHESTS_CATALOG,
  GROWTH_TASKS_CATALOG,
  FAMILY_TASKS_CATALOG,
  ADVANCE_ROOM_THEMES,
  COIN_RECHARGE_PACKS,
  GIFT_CARD_CATALOG,
  calculateLevelFromXp,
  getFrameByVariant,
  getVipConfig,
  type TaskEventType,
} from '../config/economy.ts';
import {
  FREE_SKILL_PLAY_DAILY_LIMIT,
  SEVEN_DAY_CHECKIN_REWARDS,
  COIN_UTILITY_BOOSTERS,
  getDailyIntelForDate,
  getDailyQuizForDate,
  getSpotlightGameForDate,
  getYesterdayDateString,
  getIstDateString,
  getLiveIstTimeMeta,
} from '../config/dailyGameIntel.ts';
import {
  RELATIONSHIP_TOKENS,
  ESP_EVENTS_CATALOG,
  FAMILY_EMBLEMS,
  getVoiceRoomTierSpec,
} from '../config/espSocialCatalog.ts';

const STORAGE_KEY = 'esp_static_db_v2';
const todayStr = (): string => getIstDateString();

const MAX_STATIC_DEVICES = 4;

interface StaticDb {
  settings: PlatformSettings;
  services: ServiceItem[];
  users: UserProfile[];
  referrals: ReferralRecord[];
  transactions: WalletTransaction[];
  payouts: PayoutRequest[];
  notifications: NotificationItem[];
  moments: Moment[];
  chatRooms: ChatRoom[];
  chatMessages: ClubChatMessage[];
  contacts: UserContact[];
  coinRecharges: CoinRechargeRequest[];
  complaints: UserComplaint[];
  gamePlayHistory: GamePlayRecord[];
  coinTransactions: CoinTransactionRecord[];
  profileHistory: ProfileAuditRecord[];
  activitySessions: OnlineActivitySession[];
  contactMessages: ContactMessage[];
  homeSliderPhotos: HomeSliderPhoto[];
  giftCardVouchers: GiftCardVoucher[];
  giftCardRedemptions: GiftCardRedemption[];
  activeGameWagers: Record<string, { gameName: string; bet: number; createdAt: string }>;
  planUpgrades: PlanUpgradeRequest[];
  families: EspFamily[];
  giftHistory: GiftHistoryRecord[];
  voiceRoomSeats: VoiceRoomSeat[];
  voiceRoomChat: Array<{ id: string; senderId: string; sender: string; senderRoll: string; text: string; isGift?: boolean; time: string; audioDataUrl?: string; audioDuration?: number; isVoiceNote?: boolean }>;
  customVoiceRooms: any[];
  directMessages?: DirectMessageRecord[];
  adminSessions?: AdminSession[];
  terminatedAdminTokens?: string[];
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    code: 'EMO',
    name: 'EARN MONEY ONLINE',
    hindiName: 'अर्न मनी ऑनलाइन (Normal & Fast)',
    description: 'Dual Income System: EMO Normal Earning (50% Direct, ₹10+) & EMO Fast Income (55% Direct or 60% 3-Level Matrix, ₹100+).',
    hindiDescription: 'नॉर्मल प्लान (₹10/₹50/₹100 पर 50% डायरेक्ट) और फास्ट 3-लेवल प्लान (₹100/₹500/₹1000 पर 55% डायरेक्ट या 60% 3-लेवल इनकम)।',
    category: 'task',
    joiningFeeTiers: [10, 50, 100, 500, 1000],
    defaultFee: 10,
    dailyEarningEst: '₹5 - ₹550 / invite',
    referralBonusPercent: 55,
    icon: 'Coins',
    features: ['EMO Normal (50% Direct, ₹10+)', 'EMO Fast (55% Direct / 60% 3-Level)', 'Real 3-Level Matrix (35%+15%+10%)', 'Daily UPI Payout'],
    active: true,
  },
  {
    id: 'srv-2',
    code: 'MMO',
    name: 'MAKE MONEY ONLINE',
    hindiName: 'मेक मनी ऑनलाइन (Business Promotion)',
    description: 'Promote any business, shop, YouTube channel, or service and earn flat 55% direct cash referral across every tier.',
    hindiDescription: 'व्यवसाय, दुकान व यूट्यूब का प्रचार करें और हर टियर (₹50 से ₹1000) पर एक समान 55% (₹28 से ₹550) सीधा नकद कमीशन पाएं।',
    category: 'direct',
    joiningFeeTiers: [50, 100, 500, 1000],
    defaultFee: 50,
    dailyEarningEst: '₹28 - ₹550 / invite',
    referralBonusPercent: 55,
    icon: 'TrendingUp',
    features: ['Flat 55% Direct Commission', 'Business & YouTube Promotion', '₹28 to ₹550 per Invitation', 'High-converting viral posters'],
    active: true,
  },
  {
    id: 'srv-3',
    code: 'MOM',
    name: 'MAKE ONLINE MONEY',
    hindiName: 'मेक ऑनलाइन मनी (डिजिटल स्टार्टर किट)',
    description: '100% Legal Digital Marketing Assets (₹1500+ value) + Social media growth courses and flat 70% affiliate payouts.',
    hindiDescription: 'पंजीकरण पर ₹1500+ मूल्य की डिजिटल किट (AI प्रॉम्प्ट्स, सोशल पोस्टर्स, वीडियो हुक्स) और हर सेल पर 70% (₹70 से ₹3,499) कमीशन।',
    category: 'task',
    joiningFeeTiers: [100, 499, 999, 4999],
    defaultFee: 499,
    dailyEarningEst: '₹70 - ₹3,499 / refer',
    referralBonusPercent: 70,
    icon: 'Smartphone',
    features: ['Instant ₹1500+ Digital Asset Pack', 'Flat 70% Affiliate Commission', '₹70 to ₹3,499 per Referral', '100% Legal Deliverables'],
    active: true,
  },
  {
    id: 'srv-4',
    code: 'OES',
    name: 'ONLINE EARNING SYSTEM',
    hindiName: 'ऑनलाइन अर्निंग सिस्टम (क्रिएटर टूल्स व 5-लेवल)',
    description: 'Enterprise Digital Creator Suite (Verified ID & Resume Tools) + 5-Level transparent affiliate matrix totaling 70% (40% L1 + 30% L2-L5).',
    hindiDescription: 'स्टूडेंट व क्रिएटर टूल्स और वास्तविक 5-स्तरीय मैट्रिक्स (L1: 40%, L2: 12%, L3: 8%, L4: 5%, L5: 5% = कुल 70% पारदर्शी कमीशन)।',
    category: 'team',
    joiningFeeTiers: [500, 1000, 5000, 10000],
    defaultFee: 500,
    dailyEarningEst: '₹200 - ₹4,000 / refer',
    referralBonusPercent: 40,
    icon: 'Network',
    features: ['Enterprise SaaS Tool Access', '40% Direct + 30% Levels 2-5', 'Real 5-Level Auto Distribution', 'Govt Compliant Invoicing'],
    active: true,
  },
  {
    id: 'srv-5',
    code: 'MMS',
    name: 'MONEY MAKING SYSTEM',
    hindiName: 'मनी मेकिंग सिस्टम (5 Services)',
    description: '5 Specialized Earning Branches with 50% Direct + 20% Generational Levels 2-5 (70% Total Payout Distribution).',
    hindiDescription: 'MMS की 5 विशिष्ट सेवाएं: 50% डायरेक्ट कमीशन (₹50–₹1,250) + 20% लेवल 2 से 5 तक ऑटो डिस्ट्रीब्यूशन (कुल 70% पेआउट)।',
    category: 'team',
    joiningFeeTiers: [100, 250, 500, 1000, 2500],
    defaultFee: 250,
    dailyEarningEst: '₹50 - ₹1,250 / invite',
    referralBonusPercent: 50,
    icon: 'Zap',
    features: ['50% Direct + 20% Levels 2-5', '5 Branches: Non-Level to Ultra Pro', 'VIP Crown Badge', 'Direct Admin Hotline'],
    active: true,
  },
  {
    id: 'srv-6',
    code: 'NWI',
    name: 'NON WORKING INCOME (NWI)',
    hindiName: 'नॉन वर्किंग इनकम (असली लेवल टीम पैसिव आय)',
    description: 'Real 3-Level Passive Income: Neither admin nor system creates fake teams. When real level teams grow beneath you (L1: 10%, L2: 15%, L3: 25%), you earn genuine non-working income from their real activity.',
    hindiDescription: 'असली 3-लेवल पैसिव इनकम: कंपनी या सिस्टम कोई नकली टीम नहीं बनाता। आपके नीचे जो असली लेवल टीम (Level 1, 2, 3) बनेगी, उनके द्वारा आपको 10%, 15% और 25% नॉन-वर्किंग इनकम मिलेगी।',
    category: 'passive',
    joiningFeeTiers: [200, 500, 1000, 2000],
    defaultFee: 200,
    dailyEarningEst: '10% L1 + 15% L2 + 25% L3 Real Passive',
    referralBonusPercent: 35,
    icon: 'Clock',
    features: ['Real Downline Level Team Income', 'Zero Fake / Sample Bots', 'L1: 10% | L2: 15% | L3: 25% Passive', '35% Direct Sponsor Bonus'],
    active: true,
  },
  {
    id: 'srv-7',
    code: 'SWI',
    name: 'SELF WORKING INCOME',
    hindiName: 'सेल्फ वर्किंग इनकम (3.3% स्पेशल रिचार्ज ऐप)',
    description: 'Special 3.3% Commission Recharge App at ₹300 with 50% (₹150) Referral Commission! Once verified by Admin, your personal App Link is shared right in your Dashboard.',
    hindiDescription: '3.3% कमीशन वाला स्पेशल रिचार्ज ऐप मात्र ₹300 में और 50% (₹150) सीधा रेफरल कमीशन! अकाउंट वेरीफाई होने के बाद Admin द्वारा आपके डैशबोर्ड में ऐप लिंक शेयर किया जाएगा।',
    category: 'task',
    joiningFeeTiers: [100, 150, 300, 350, 597, 599, 1197, 1500],
    defaultFee: 300,
    dailyEarningEst: '3.3% App + 50% (₹150) Refer',
    referralBonusPercent: 50,
    icon: 'UserCheck',
    features: ['3.3% Special App Plan: ₹300', '50% Direct Referral (₹150)', 'Verified App Link in Dashboard', 'Save Extra PhonePe/GPay Fees'],
    active: true,
  },
  {
    id: 'srv-8',
    code: 'TWI',
    name: 'TEAM WORKING INCOME',
    hindiName: 'टीम वर्किंग इनकम (ऑल-प्लान क्रॉस-रेफरल टीम)',
    description: 'Cross-Plan Team & Referral System: Choose any TWI plan and refer members into ANY plan across ESP to build an unlimited team with 40% direct cash + team recharge overrides.',
    hindiDescription: 'ऑल-प्लान टीम सिस्टम: किसी भी टियर का प्लान चुनकर आप ESP के किसी भी दूसरे प्लान में रेफर करके टीम बना सकते हैं! एक समान 40% डायरेक्ट + टीम रिचार्ज कमीशन।',
    category: 'team',
    joiningFeeTiers: [100, 150, 300, 350, 597, 599, 1197, 1500],
    defaultFee: 100,
    dailyEarningEst: '40% Cross-Plan + Team Overrides',
    referralBonusPercent: 40,
    icon: 'Users',
    features: ['Any Plan -> Any Plan Cross Refer', 'Flat 40% Direct Cash Benefit', '0.1% - 0.5% Team Recharge Comm', 'Real-time Downline CRM'],
    active: true,
  },
  {
    id: 'srv-9',
    code: 'PROMOTE',
    name: 'PROMOTE & EARN',
    hindiName: 'प्रमोट & अर्न (खुद का बिज़नेस, पोस्टर व शुभकामना)',
    description: 'Co-Branded Self-Promotion Suite: Promote your own Business, Shop, Product, or Service alongside ESP Platform details using custom Banners, Posters, and Shubhkamna Greeting Cards + 40% Referral.',
    hindiDescription: 'ग्राहक खुद के बिज़नेस, दुकान या सर्विस का प्रचार हमारे प्लेटफॉर्म डिटेल्स के साथ कर सकते हैं! प्रमोशन बैनर, पोस्टर और शुभकामना कार्ड स्टूडियो + 40% रेफरल।',
    category: 'direct',
    joiningFeeTiers: [50, 100, 250],
    defaultFee: 50,
    dailyEarningEst: 'Self Promo Studio + 40% Refer',
    referralBonusPercent: 40,
    icon: 'Share2',
    features: ['Self-Business + ESP Co-Branding', 'Banners, Posters & Shubhkamna Cards', '40% Direct Referral Bonus', 'WhatsApp 1-Click Share'],
    active: true,
  },
  {
    id: 'srv-10',
    code: 'REFER',
    name: 'REFER & EARN',
    hindiName: 'रेफर & अर्न (यूनिक स्पॉन्सर कोड व ₹100 अपग्रेड)',
    description: 'Unified Master Referral & Upgrade Engine: Share your permanent Roll Number / Sponsor Code to earn flat 50% across plans, plus self-upgrade anytime from ₹100 (crediting 50% upgrade commission to sponsor).',
    hindiDescription: 'सम्पूर्ण क्रॉस-प्लान रेफरल व अपग्रेड इंजन: एक यूनिक स्पॉन्सर कोड से सभी प्लान में फ्लैट 50% कमीशन और मात्र ₹100 में डैशबोर्ड से लाइव प्लान अपग्रेड।',
    category: 'direct',
    joiningFeeTiers: [10, 50, 100, 250, 500, 1000],
    defaultFee: 100,
    dailyEarningEst: '50% Flat + ₹50/Upgrade',
    referralBonusPercent: 50,
    icon: 'Gift',
    features: ['Permanent Roll Number (Sponsor Code)', '₹100 Self Plan Upgrade in Dashboard', 'Flat 50% Direct Referral Bonus', 'Unlimited Cross-Plan Downlines'],
    active: true,
  },
];

const DEFAULT_SETTINGS: PlatformSettings = {
  ownerName: 'SANTOSH KUMAR',
  ownerSponsorId: 'EMO-MOM-MMO',
  adminUpiId: '8877490845@SPICEPAY',
  adminPayeeName: 'VIKAS KUMAR',
  adminQrCodeUrl: '',
  contactAddress: 'ESP Corporate Office, Near City Center, Bihar, India (Operating Pan-India - PIN: 800001)',
  supportPhone: '+91 8877490845',
  supportEmail: 'ioisplatform@gmail.com',
  whatsappNumber: '8877490845',
  telegramUsername: '@espplatform_official',
  telegramLink: 'https://t.me/espplatform_official',
  minWithdrawal: 50,
  defaultReferralCommissionRate: 0.40,
  blogReferenceUrl: 'https://emofi100.blogspot.com/2024/03/earning-service-platform-esp.html?m=1',
  joiningFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScqqyR1CDev8HEmpKaSzvRd1hcIERIIOP1qYWL1NaPV_9L-rg/viewform?usp=sf_link',
  bannerNotice: '🎉 Welcome to Earning System Platform (ESP)! Join starting at ₹10 & receive your Verified Member Digital ID Card!',
  homeSliderPhotos: [],
  swiSpecialAppLink: '',
  swiSpecialAppName: 'ESP 3.3% Special Recharge App',
};

const DEFAULT_BOTS: WePlayBot[] = [
  {
    id: 'BOT-JUDGE',
    code: 'judge',
    name: 'Nyayadhish (न्यायाधीश)',
    hindiName: '⚖️ न्यायाधीश बॉट',
    roleTitle: 'Rules Arbiter & Fair-Play Judge',
    hindiRole: 'नियम व निष्पक्षता निर्णायक',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99',
    frameType: 'judge-justice',
    level: 1,
    charms: 0,
    coins: 0,
    badge: '⚖️ JUSTICE',
    voiceAccent: 'Hindi-Formal',
    status: 'online',
    description: 'Voice room & game arbiter. Explains rules and encourages fair play.',
    hindiDescription: 'गेम व वॉइस रूम का नियम गाइड। निष्पक्ष खेल और नियमों की जानकारी देता है।',
    superpowers: ['निष्पक्ष नियम मार्गदर्शन', 'पेनल्टी व नियम जानकारी', 'विवाद नियम समझाना'],
    sampleDialogues: ['⚖️ रूम में आपका स्वागत है! हर खिलाड़ी के साथ निष्पक्ष नियम लागू होंगे।'],
  },
  {
    id: 'BOT-WOLF',
    code: 'wolf',
    name: 'Werewolf Narrator (भेड़िया बॉट)',
    hindiName: '🐺 भेड़िया गेम मास्टर',
    roleTitle: 'Werewolf Host & Game Master',
    hindiRole: 'वेयरवुल्फ कथावाचक व गेम सूत्रधार',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf',
    frameType: 'wolf-night',
    level: 1,
    charms: 0,
    coins: 0,
    badge: '🐺 WEREWOLF',
    voiceAccent: 'Hindi-Dramatic',
    status: 'online',
    description: 'ESP PLAY Werewolf game master. Moderates night/day cycles.',
    hindiDescription: 'ESP PLAY का वेयरवुल्फ गेम संचालक।',
    superpowers: ['वेयरवुल्फ गेम लाइव होस्टिंग', 'गुप्त भूमिका वितरण'],
    sampleDialogues: ['🐺 रात हो चुकी है... सभी गांव वाले ध्यान से खेलें!'],
  },
  {
    id: 'BOT-BHAI',
    code: 'we_bhai',
    name: 'ESP Bhai (ईएसपी भाई)',
    hindiName: '🤝 ईएसपी भाई (कम्युनिटी गाइड)',
    roleTitle: 'ESP PLAY Guide Assistant',
    hindiRole: 'ESP PLAY गाइड व टास्क साथी',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EspBhaiBrother',
    frameType: 'vip-gold',
    level: 1,
    charms: 0,
    coins: 0,
    badge: '🤝 GUIDE',
    voiceAccent: 'Hindi-Friendly',
    status: 'online',
    description: 'Helpful ESP PLAY guide explaining real tasks, relationships, frames, VIP, and ESP services.',
    hindiDescription: 'टास्क (+5 कॉइन्स व EXP), रिलेशनशिप टैग, फ्रेम, VIP और फैमिली का सही मार्गदर्शन करता है।',
    superpowers: ['ESP PLAY गाइडेंस', 'असली टास्क गाइड (+5 Coins)', 'गेमिंग रणनीति'],
    sampleDialogues: ['🤝 नमस्ते! असली टास्क पूरे करें और हर टास्क पर +5 कॉइन्स व EXP पाएं।'],
  },
  {
    id: 'BOT-CHAT',
    code: 'we_chat',
    name: 'ESP Chat (ईएसपी चैट AI)',
    hindiName: '💬 ईएसपी चैट (मनोरंजन साथी)',
    roleTitle: 'ESP PLAY Voice Companion',
    hindiRole: 'शायरी व बातचीत साथी',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EspChatCompanionPoet',
    frameType: 'cosmic-neon',
    level: 1,
    charms: 0,
    coins: 0,
    badge: '💬 COMPANION',
    voiceAccent: 'Hindi-Sweet',
    status: 'online',
    description: 'Shares Hindi shayari and keeps the ESP PLAY stage welcoming.',
    hindiDescription: 'हिंदी शायरी और बातचीत से ESP PLAY रूम का माहौल खुशनुमा बनाता है।',
    superpowers: ['खूबसूरत हिंदी शायरी', 'स्वस्थ मनोरंजन बातचीत'],
    sampleDialogues: ['💬 महफ़िल में जब आप आए, तो ESP PLAY रूम में रौनक आ गई!'],
  },
];

function getTodayStr() {
  return getIstDateString();
}

function normalizeStaticUsername(raw: unknown): string {
  return String(raw || '').trim().replace(/^@+/, '').toLowerCase();
}

function isValidStaticUsername(normalized: string): boolean {
  return /^[a-z0-9]{3,24}$/.test(normalized);
}

function isStaticUsernameTaken(users: UserProfile[], normalized: string, excludeUserId?: string): boolean {
  if (!normalized) return false;
  return users.some(
    u =>
      u.userId !== excludeUserId &&
      (normalizeStaticUsername(u.username) === normalized ||
        String(u.userId || '').trim().toLowerCase() === normalized ||
        String(u.gamingId || '').trim().toLowerCase() === normalized)
  );
}

function findStaticSponsorUser(users: UserProfile[], rawRef: unknown): UserProfile | undefined {
  const clean = String(rawRef || '').trim().toLowerCase();
  const cleanHandle = normalizeStaticUsername(rawRef);
  if (!clean && !cleanHandle) return undefined;
  return users.find(
    u =>
      (u.userId || '').trim().toLowerCase() === clean ||
      (cleanHandle !== '' && normalizeStaticUsername(u.username) === cleanHandle) ||
      (u.gamingId || '').trim().toLowerCase() === clean
  );
}

function extractStaticInitials(fullName: string): string {
  const cleaned = String(fullName || '').replace(/[^a-zA-Z\s]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 1) {
    initials = (words[0][0] + 'X').toUpperCase();
  } else {
    initials = 'ES';
  }
  initials = initials.replace(/[^A-Z]/g, 'X');
  return initials.length === 2 ? initials : initials.padEnd(2, 'X').slice(0, 2);
}

function isStaticAnyIdTaken(users: UserProfile[], candidate: string): boolean {
  const lower = candidate.toLowerCase();
  return users.some(
    u =>
      (u.userId || '').toLowerCase() === lower ||
      (u.gamingId || '').toLowerCase() === lower ||
      normalizeStaticUsername(u.username) === lower
  );
}

function generateStaticGamerId(users: UserProfile[], fullName: string): string {
  const initials = extractStaticInitials(fullName);
  const basePrefix = `ESPGT${initials}`;
  const regex = new RegExp(`^${basePrefix}(\\d+)$`, 'i');
  let maxSeq = 0;
  for (const u of users) {
    for (const idVal of [u.userId, u.gamingId]) {
      const m = String(idVal || '').match(regex);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxSeq) maxSeq = n;
      }
    }
  }
  let counter = maxSeq + 1;
  let finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  while (isStaticAnyIdTaken(users, finalId)) {
    counter++;
    finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  }
  return finalId;
}

function generateStaticIncomeId(users: UserProfile[], fullName: string, chosenServiceCode: string): string {
  const initials = extractStaticInitials(fullName);
  const cleanService = String(chosenServiceCode || 'EMO').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'EMO';
  const basePrefix = `${cleanService}${initials}ESP`;
  const regex = new RegExp(`^${basePrefix}(\\d+)$`, 'i');
  let maxSeq = 0;
  for (const u of users) {
    for (const idVal of [u.userId, u.gamingId]) {
      const m = String(idVal || '').match(regex);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxSeq) maxSeq = n;
      }
    }
  }
  let counter = maxSeq + 1;
  let finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  while (isStaticAnyIdTaken(users, finalId)) {
    counter++;
    finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  }
  return finalId;
}

function generateStaticDefaultUsername(
  users: UserProfile[],
  fullName: string,
  newUserId: string,
  newGamingId: string = ''
): string {
  const cleanName = String(fullName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const base = (cleanName.length >= 3 ? cleanName : newUserId.toLowerCase()).slice(0, 16);
  const forbidden = new Set([newUserId.toLowerCase(), newGamingId.toLowerCase()].filter(Boolean));
  let seq = 1;
  let candidate = `${base}${String(seq).padStart(2, '0')}`.slice(0, 24);
  if (!isStaticAnyIdTaken(users, candidate) && !forbidden.has(candidate) && isValidStaticUsername(candidate)) {
    return candidate;
  }
  while (isStaticAnyIdTaken(users, candidate) || forbidden.has(candidate) || !isValidStaticUsername(candidate)) {
    seq++;
    candidate = `${base.slice(0, 20)}${String(seq).padStart(2, '0')}`;
  }
  return candidate;
}

function isStaticNumericRoomId(val?: string): boolean {
  if (!val) return false;
  return /^\d{3,10}$/.test(String(val).trim());
}

function isStaticVipFancyRoom(val?: string): boolean {
  const s = String(val || '').trim();
  if (!/^\d{3,10}$/.test(s)) return false;
  if (s.length <= 4) return true;
  if (/^(\d)\1+$/.test(s)) return true;
  if ('0123456789'.includes(s) || '9876543210'.includes(s)) return true;
  return false;
}

function findStaticRoomConflict(
  users: UserProfile[],
  rooms: any[],
  candidate: string,
  excludeUserId?: string
): { conflict: boolean; ownerName?: string; ownerId?: string } {
  const clean = String(candidate || '').trim();
  const low = clean.toLowerCase();
  const userHit = users.find(
    u =>
      u.userId !== excludeUserId &&
      (String(u.roomAddress || '').trim() === clean ||
        String(u.personalRoomId || '').trim() === clean ||
        (u.userId || '').toLowerCase() === low ||
        (u.gamingId || '').toLowerCase() === low ||
        normalizeStaticUsername(u.username) === low)
  );
  if (userHit) return { conflict: true, ownerName: userHit.fullName, ownerId: userHit.userId };
  const roomHit = rooms.find(
    r =>
      !(excludeUserId && r.isPersonalFixed && r.hostUserId === excludeUserId) &&
      (String(r.roomAddress || '').trim() === clean || String(r.roomNumber || '').trim() === clean)
  );
  if (roomHit) return { conflict: true, ownerName: roomHit.hostName || roomHit.title, ownerId: roomHit.hostUserId };
  return { conflict: false };
}

function generateStaticRoomId(
  users: UserProfile[],
  rooms: any[],
  _fullName: string = '',
  excludeUserId?: string
): string {
  let maxCount = 10000;
  for (const u of users) {
    for (const val of [u.roomAddress, u.personalRoomId]) {
      const s = String(val || '').trim();
      if (/^\d{5,10}$/.test(s)) {
        const n = parseInt(s, 10);
        if (n >= 10000 && n > maxCount) maxCount = n;
      }
    }
  }
  for (const r of rooms) {
    for (const val of [r.roomAddress, r.roomNumber]) {
      const s = String(val || '').trim();
      if (/^\d{5,10}$/.test(s)) {
        const n = parseInt(s, 10);
        if (n >= 10000 && n > maxCount) maxCount = n;
      }
    }
  }
  let counter = maxCount + 1;
  let candidate = String(counter);
  while (findStaticRoomConflict(users, rooms, candidate, excludeUserId).conflict) {
    counter++;
    candidate = String(counter);
  }
  return candidate;
}

function ensureStaticPersonalRoom(db: StaticDb, user: UserProfile) {
  if (!Array.isArray(db.customVoiceRooms)) db.customVoiceRooms = [];
  if (!isStaticNumericRoomId(user.roomAddress)) {
    const code =
      (user.userId === 'EMO-MOM-MMO' || user.role === 'admin') &&
      !findStaticRoomConflict(db.users, db.customVoiceRooms, '1111', user.userId).conflict
        ? '1111'
        : generateStaticRoomId(db.users, db.customVoiceRooms, user.fullName || user.userId, user.userId);
    user.roomAddress = code;
    user.personalRoomId = code;
    if (code === '1111') {
      user.isVipRoom = true;
      user.vipRoomLabel = user.vipRoomLabel || 'VIP Royal';
    }
  } else {
    user.roomAddress = String(user.roomAddress).trim();
    user.personalRoomId = user.roomAddress;
    if (user.isVipRoom === undefined && isStaticVipFancyRoom(user.roomAddress)) {
      user.isVipRoom = true;
    }
  }
  const isFounder = user.userId === 'EMO-MOM-MMO' || user.role === 'admin';
  const cleanTag = String(user.userId || 'USR').replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const targetId = isFounder ? 'room-founder' : `roompersonal${cleanTag}`;
  let existing = db.customVoiceRooms.find(
    r => r.id === targetId || (r.isPersonalFixed && r.hostUserId === user.userId)
  );
  if (!existing) {
    existing = {
      id: targetId,
      title: isFounder ? 'ESP Royal Voice Stage (Official)' : `${user.fullName}'s Voice Room`,
      topic: isFounder ? 'ESP 10 Services Discussion & Real Gaming Club' : `Welcome to ${user.fullName}'s Personal Fixed Voice Room`,
      category: user.accountType === 'gamer' ? 'gaming' : 'earning',
      roomAddress: user.roomAddress,
      roomNumber: user.roomAddress,
      isPersonalFixed: true,
      isVipRoom: Boolean(user.isVipRoom || isStaticVipFancyRoom(user.roomAddress)),
      vipRoomLabel: user.vipRoomLabel || (isFounder ? 'VIP Royal' : ''),
      hostUserId: user.userId,
      hostName: user.fullName,
      hostUsername: user.username || '',
      hostAvatar: user.avatar,
      hostLevel: user.gameLevel || 1,
      hostCharms: user.charms || 0,
      wallpaperId: 'castle_night',
      customWallpaperUrl: '',
      stageLayout: 'classic_8',
      youtubeVideoUrl: '',
      lockedSeats: [],
      followers: [],
      audience: [user.userId],
      seats: Array.from({ length: 8 }, (_, i) => ({
        seatNumber: i + 1,
        seatNumberLabel: String(i + 1),
        isMuted: false,
        isSpeaking: false,
        charms: 0,
      })),
      chatMessages: [
        {
          id: `msg-init-${cleanTag}`,
          senderId: 'SYSTEM',
          sender: 'System',
          senderRoll: 'STAGE',
          text: `🔔 System: ${user.fullName}'s personal fixed room (ID: ${user.roomAddress}) is live!`,
          time: 'Live',
        },
      ],
      listenersCount: 1,
      createdAt: user.createdAt || new Date().toISOString(),
    };
    if (isFounder) db.customVoiceRooms.unshift(existing);
    else db.customVoiceRooms.push(existing);
  } else {
    existing.roomAddress = user.roomAddress;
    existing.roomNumber = user.roomAddress;
    existing.isPersonalFixed = true;
    existing.isVipRoom = Boolean(user.isVipRoom || isStaticVipFancyRoom(user.roomAddress));
    existing.vipRoomLabel = user.vipRoomLabel || existing.vipRoomLabel || '';
    existing.hostName = user.fullName;
    existing.hostUsername = user.username || '';
    existing.hostAvatar = user.avatar;
    if (!existing.wallpaperId) existing.wallpaperId = 'castle_night';
    if (!existing.stageLayout) existing.stageLayout = 'classic_8';
    if (!Array.isArray(existing.lockedSeats)) existing.lockedSeats = [];
    if (!Array.isArray(existing.followers)) existing.followers = [];
    if (!Array.isArray(existing.audience)) existing.audience = [user.userId];
  }
  return existing;
}

function ensureAllStaticRooms(db: StaticDb) {
  for (const u of db.users) {
    ensureStaticPersonalRoom(db, u);
  }
  for (const r of db.customVoiceRooms || []) {
    if (!isStaticNumericRoomId(r.roomAddress)) {
      const addr = generateStaticRoomId(db.users, db.customVoiceRooms, r.title || 'ESP');
      r.roomAddress = addr;
      r.roomNumber = addr;
    }
  }
  return db.customVoiceRooms;
}

function buildStaticRoomDetail(db: StaticDb, room: any, viewerId?: string) {
  const lockedSet = new Set<number>(Array.isArray(room.lockedSeats) ? room.lockedSeats : []);
  const followers = Array.isArray(room.followers) ? room.followers : [];
  const audience = Array.isArray(room.audience) ? room.audience : [room.hostUserId];
  const hostUser = db.users.find(u => u.userId === room.hostUserId);
  const enrichedSeats = (room.seats || db.voiceRoomSeats).map((s: any, idx: number) => ({
    ...s,
    isLocked: lockedSet.has(idx),
  }));
  const topContributors = [...db.users]
    .sort((a, b) => (b.charms || 0) - (a.charms || 0))
    .slice(0, 3)
    .map(u => ({ userId: u.userId, fullName: u.fullName, avatar: u.avatar, coins: u.charms || 0 }));

  return {
    success: true,
    room: {
      ...room,
      roomEffect: room.roomEffect || 'none',
      activePackets: (Array.isArray(room.activePackets) ? room.activePackets : []).filter(
        (p: any) => p.remainingCoins > 0 && p.claimedBy.length < p.maxClaims
      ),
      passcode: viewerId && viewerId === room.hostUserId ? room.passcode || '' : undefined,
      followers,
      followersCount: followers.length,
      isFollowed: Boolean(viewerId && followers.includes(viewerId)),
      audience,
      listenersCount: Math.max(1, audience.length),
      occupiedSeatsCount: enrichedSeats.filter((s: any) => Boolean(s.userId)).length,
      seats: enrichedSeats,
      topContributors,
    },
    host: {
      userId: room.hostUserId,
      userName: hostUser?.fullName || room.hostName,
      username: hostUser?.username || room.hostUsername || '',
      gameLevel: hostUser?.gameLevel || room.hostLevel || 1,
      charms: hostUser?.charms || room.hostCharms || 0,
      userAvatar: hostUser?.avatar || room.hostAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
      isSpeaking: true,
      roleTitle: room.id === 'room-founder' ? 'ESP Founder & Room Host' : 'Room Owner & Host',
    },
    seats: enrichedSeats,
    audience: db.users,
    audienceCount: Math.max(1, audience.length),
    chatMessages: room.chatMessages || db.voiceRoomChat,
  };
}

function normalizeStaticUser(u: any): UserProfile {
  if (u.coins === undefined || u.coins === null || Number.isNaN(Number(u.coins))) u.coins = 0;
  if (u.charms === undefined || u.charms === null) u.charms = 0;
  if (u.gameXp === undefined || u.gameXp === null) u.gameXp = 0;
  u.gameLevel = calculateLevelFromXp(u.gameXp || 0);
  if (!u.vipTier) u.vipTier = 'none';
  if (u.vipTier === 'none') u.vipTitle = '';
  if (!Array.isArray(u.unlockedFrames) || u.unlockedFrames.length === 0) u.unlockedFrames = ['standard'];
  if (!u.unlockedFrames.includes('standard')) u.unlockedFrames.unshift('standard');
  if (!u.frameType || !u.unlockedFrames.includes(u.frameType)) u.frameType = 'standard';
  if (!Array.isArray(u.unlockedRooms) || u.unlockedRooms.length === 0) u.unlockedRooms = ['default_dark'];
  if (!u.unlockedRooms.includes('default_dark')) u.unlockedRooms.unshift('default_dark');
  if (!u.roomTheme || !u.unlockedRooms.includes(u.roomTheme)) u.roomTheme = 'default_dark';
  if (!Array.isArray(u.followedRooms)) u.followedRooms = [];
  if (u.roomAddress && /[^A-Za-z0-9]/.test(String(u.roomAddress))) {
    u.roomAddress = '';
  }
  if (!Array.isArray(u.friendsList)) u.friendsList = [];
  u.friendsCount = u.friendsList.length;
  if (!u.receivedGifts || typeof u.receivedGifts !== 'object') u.receivedGifts = {};
  if (u.username) u.username = normalizeStaticUsername(u.username);
  const today = getTodayStr();
  if (u.taskProgressDate !== today) {
    u.taskProgressDate = today;
    u.taskProgress = {};
    u.claimedTaskIds = [];
    u.claimedChestMilestones = [];
    u.todayActiveness = 0;
    u.claimedActivenessChests = [];
    u.claimedFamilyTaskIds = [];
  }
  if (!u.taskProgress) u.taskProgress = {};
  if (!Array.isArray(u.claimedTaskIds)) u.claimedTaskIds = [];
  if (!Array.isArray(u.claimedChestMilestones)) u.claimedChestMilestones = [];
  if (u.todayActiveness === undefined) u.todayActiveness = 0;
  if (!Array.isArray(u.claimedActivenessChests)) u.claimedActivenessChests = [];
  if (!Array.isArray(u.claimedGrowthTaskIds)) u.claimedGrowthTaskIds = [];
  if (!Array.isArray(u.claimedFamilyTaskIds)) u.claimedFamilyTaskIds = [];
  if (u.tasksCompletedCount === undefined) u.tasksCompletedCount = 0;
  if (!Array.isArray(u.ownedRelationshipTokens)) u.ownedRelationshipTokens = [];
  if (!Array.isArray(u.activeRelationships)) u.activeRelationships = [];
  if (u.familyId === undefined) u.familyId = '';
  if (!u.familyRole) u.familyRole = 'Member';
  if (u.familyCoinsContributed === undefined) u.familyCoinsContributed = 0;
  if (!Array.isArray(u.unlockedRoomTiers)) u.unlockedRoomTiers = ['normal'];
  if (!Array.isArray(u.claimedEventIds)) u.claimedEventIds = [];
  return u;
}

function getStaticActivenessChests(user: UserProfile) {
  const activeness = Number(user.todayActiveness || 0);
  return ACTIVENESS_CHESTS_CATALOG.map(ch => ({
    ...ch,
    isUnlocked: activeness >= ch.threshold,
    isClaimed: (user.claimedActivenessChests || []).includes(ch.threshold),
  }));
}

function getStaticGrowthTasks(db: StaticDb, user: UserProfile) {
  const friendsCount = Math.max(Number(user.friendsList?.length || 0), Number(user.friendsCount || 0));
  const hasSentGift =
    Number(user.taskProgress?.gift_sent || 0) >= 1 ||
    Number(user.totalCoinsSpent || 0) > 0 ||
    (db.giftHistory || []).some(g => g.senderId === user.userId);
  const hasReceivedGift =
    Number(user.charms || 0) > 0 ||
    Object.keys(user.receivedGifts || {}).length > 0 ||
    (db.giftHistory || []).some(g => g.recipientId === user.userId);
  const hasPostedMoment =
    Number(user.taskProgress?.moment_posted || 0) >= 1 ||
    (db.moments || []).some(m => m.userId === user.userId);

  return GROWTH_TASKS_CATALOG.map(task => {
    let raw = 0;
    if (task.id === 'growth-first-attempt') raw = Number(user.totalGamesPlayed || 0) >= 1 ? 1 : 0;
    else if (task.id === 'growth-new-challenger') raw = Number(user.totalGamesPlayed || 0);
    else if (task.id === 'growth-first-show') {
      raw = Number(user.taskProgress?.voice_joined || 0) >= 1 || Number(user.totalOnlineMinutes || 0) >= 1 ? 1 : 0;
    } else if (task.id === 'growth-make-friends') raw = friendsCount >= 1 ? 1 : 0;
    else if (task.id === 'growth-soulmate') raw = (user.activeRelationships || []).length >= 1 || friendsCount >= 2 ? 1 : 0;
    else if (task.id === 'growth-send-gift') raw = hasSentGift ? 1 : 0;
    else if (task.id === 'growth-charming') raw = hasReceivedGift ? 1 : 0;
    else if (task.id === 'growth-fun-times') raw = hasPostedMoment ? 1 : 0;
    return {
      ...task,
      currentProgress: Math.min(raw, task.targetCount),
      isCompleted: raw >= task.targetCount,
      isClaimed: (user.claimedGrowthTaskIds || []).includes(task.id),
    };
  });
}

function getStaticFamilyTasks(user: UserProfile) {
  const inFamily = Boolean(user.familyId || user.clanName);
  return FAMILY_TASKS_CATALOG.map(task => {
    let raw = 0;
    if (task.id === 'family-join') raw = inFamily ? 1 : 0;
    else if (task.id === 'family-chat') raw = Number(user.taskProgress?.chat_sent || 0);
    else if (task.id === 'family-game') raw = Number(user.taskProgress?.game_played || 0);
    else if (task.id === 'family-gift') raw = Number(user.taskProgress?.gift_sent || 0);
    else if (task.id === 'family-moment') raw = Number(user.taskProgress?.moment_posted || 0);
    return {
      ...task,
      currentProgress: Math.min(raw, task.targetCount),
      isCompleted: raw >= task.targetCount,
      isClaimed: (user.claimedFamilyTaskIds || []).includes(task.id),
    };
  });
}

function trackStaticTask(user: UserProfile, eventType: TaskEventType, inc = 1) {
  normalizeStaticUser(user);
  user.taskProgress![eventType] = Number(user.taskProgress?.[eventType] || 0) + Math.max(1, inc);
}

function pushStaticCoinTx(
  db: StaticDb,
  user: UserProfile,
  params: {
    type: 'credit' | 'debit';
    category: CoinTransactionRecord['category'];
    categoryLabel: string;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
  }
) {
  if (!Array.isArray(db.coinTransactions)) db.coinTransactions = [];
  db.coinTransactions.unshift({
    id: `CTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    ...params,
    timestamp: new Date().toISOString(),
  });
}

function createInitialStaticDb(): StaticDb {
  const adminUser: UserProfile = normalizeStaticUser({
    id: 'usr-admin',
    userId: 'EMO-MOM-MMO',
    gamingId: 'GAME-887749',
    fullName: 'SANTOSH KUMAR',
    phone: '8877490845',
    email: 'ioisplatform@gmail.com',
    fullAddress: 'ESP Headquarters, Bihar, India',
    paymentAddress: '8877490845@SPICEPAY',
    payoutUpiId: '8877490845@SPICEPAY',
    password: 'admin',
    sponsorId: 'FOUNDER',
    sponsorName: 'ESP SYSTEM FOUNDER',
    chosenServiceCode: 'OES',
    chosenServiceName: 'ONLINE EARNING SYSTEM',
    joiningFee: 1000,
    joiningDate: '2024-03-01',
    paymentUtr: 'ADMIN_GENESIS_ROOT',
    status: 'active',
    verifiedAt: '2024-03-01T00:00:00.000Z',
    balance: 0,
    totalEarnings: 0,
    referralEarnings: 0,
    promoEarnings: 0,
    totalWithdrawn: 0,
    coins: 0,
    charms: 0,
    gameLevel: 1,
    gameXp: 0,
    vipTier: 'none',
    vipTitle: '',
    unlockedFrames: ['standard'],
    frameType: 'standard',
    unlockedRooms: ['default_dark'],
    roomTheme: 'default_dark',
    roomAddress: '1111',
    personalRoomId: '1111',
    isVipRoom: true,
    vipRoomLabel: 'VIP Royal',
    followedRooms: [],
    houseName: 'Royal House of Santosh',
    clanName: 'Royal Warriors ESP',
    clanRole: 'Leader',
    loginStreak: 0,
    claimedDays: [],
    friendsCount: 0,
    visitorCount: 0,
    role: 'admin',
    createdAt: '2024-03-01T00:00:00.000Z',
  });

  return {
    settings: { ...DEFAULT_SETTINGS },
    services: [...DEFAULT_SERVICES],
    users: [adminUser],
    referrals: [],
    transactions: [],
    payouts: [],
    notifications: [],
    moments: [
      {
        id: 'moment-1',
        userId: 'usr-admin',
        userName: 'SANTOSH KUMAR (Founder)',
        userRollNumber: 'EMO-MOM-MMO',
        userAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshFounderESP',
        caption: '🎉 ESP Portal Official Notice: Complete daily tasks to earn +5 Coins & EXP, unlock Avatar Frames and VIP Passes!',
        imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&auto=format&fit=crop&q=80',
        serviceTag: 'OFFICIAL NOTICE',
        createdAt: new Date().toISOString(),
        likes: ['usr-admin'],
        comments: [],
        sharesCount: 0,
      },
    ],
    chatRooms: [
      { id: 'room-global', name: 'ESP National Community Club', hindiName: 'राष्ट्रीय कम्युनिटी क्लब (सभी सदस्य)', description: 'All ESP verified members official chatting hub.', category: 'community', membersCount: 1, lastMessage: 'Welcome to ESP Club!', lastMessageTime: 'Live' },
      { id: 'room-services', name: '10 Services Earning Discussion', hindiName: '10 सर्विसेज पर चर्चा व रणनीति', description: 'Master all 10 earning services.', category: 'service', membersCount: 1, lastMessage: 'NWI 3-Level real team passive income live!', lastMessageTime: 'Live' },
      { id: 'room-referrals', name: 'Referral & Team Builders Club', hindiName: 'रेफरल & डाउनलाइन टीम बिल्डर्स', description: 'Connect with other members and build real teams.', category: 'group', membersCount: 1, lastMessage: 'Joined with ₹10!', lastMessageTime: 'Live' },
      { id: 'room-support', name: 'Founder & Admin 24x7 Helpdesk', hindiName: 'फाउंडर मार्गदर्शन एवं हेल्पलाइन', description: 'Official WhatsApp +91 8877490845 support channel.', category: 'help', membersCount: 1, lastMessage: 'Digital ID cards ready.', lastMessageTime: 'Live' },
    ],
    chatMessages: [
      {
        id: 'msg-1',
        roomId: 'room-global',
        senderId: 'usr-admin',
        senderName: 'SANTOSH KUMAR (Founder)',
        senderRollNumber: 'EMO-MOM-MMO',
        senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshFounderESP',
        text: '🙏 Welcome all verified members to the Official ESP Community Club!',
        createdAt: new Date().toISOString(),
        likes: 1,
      },
    ],
    contacts: [],
    coinRecharges: [],
    complaints: [],
    gamePlayHistory: [],
    coinTransactions: [],
    profileHistory: [],
    activitySessions: [],
    contactMessages: [],
    homeSliderPhotos: [],
    giftCardVouchers: [],
    giftCardRedemptions: [],
    activeGameWagers: {},
    planUpgrades: [],
    voiceRoomSeats: Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    })),
    voiceRoomChat: [
      {
        id: 'msg-v-init',
        senderId: 'usr-admin',
        sender: 'SANTOSH KUMAR (Founder)',
        senderRoll: 'EMO-MOM-MMO',
        text: '🎮 नमस्ते! ESP GAMING ROOM वॉइस स्टेज लाइव है। कोई भी खाली सीट टैप करके स्टेज जॉइन कर सकते हैं।',
        time: 'Live',
      },
    ],
    customVoiceRooms: [],
    families: [],
    giftHistory: [],
    adminSessions: [],
    terminatedAdminTokens: [],
  };
}

function normalizeStaticPhone(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function matchesStaticIdentifier(u: UserProfile, rawIdentifier: string): boolean {
  const clean = String(rawIdentifier || '').trim().toLowerCase();
  if (!clean) return false;
  const cleanNoSpaces = clean.replace(/\s+/g, '');
  const inputDigits = normalizeStaticPhone(clean);
  const uid = (u.userId || '').trim().toLowerCase();
  const gid = (u.gamingId || '').trim().toLowerCase();
  const uname = normalizeStaticUsername(u.username);
  const cleanHandle = normalizeStaticUsername(clean);
  const email = (u.email || '').trim().toLowerCase();
  const phone = (u.phone || '').trim().toLowerCase();
  const phoneDigits = normalizeStaticPhone(u.phone || '');

  return (
    uid === clean ||
    (uname !== '' && cleanHandle !== '' && uname === cleanHandle) ||
    (cleanNoSpaces.length >= 3 && uid.replace(/\s+/g, '') === cleanNoSpaces) ||
    (gid !== '' && (gid === clean || (cleanNoSpaces.length >= 3 && gid.replace(/\s+/g, '') === cleanNoSpaces))) ||
    (email !== '' && email === clean) ||
    (phone !== '' && phone === clean) ||
    (inputDigits.length === 10 && phoneDigits.length === 10 && phoneDigits === inputDigits)
  );
}

function isStaticPasswordMatch(storedPassword: string | undefined, inputPassword: string): boolean {
  if (!storedPassword) return true;
  const rawInput = String(inputPassword ?? '');
  if (storedPassword === rawInput) return true;
  const trimmedInput = rawInput.trim();
  return trimmedInput.length > 0 && storedPassword.trim() === trimmedInput;
}

function mergeLegacyBackupUsers(db: StaticDb) {
  try {
    const knownIds = new Set(db.users.map(u => (u.userId || '').toLowerCase()));
    const legacyKeys = ['esp_users_backup_v1', 'esp_static_db'];
    for (const k of legacyKeys) {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const list: any[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.users)
        ? parsed.users
        : [];
      for (const u of list) {
        if (u && u.userId && !knownIds.has(String(u.userId).toLowerCase())) {
          knownIds.add(String(u.userId).toLowerCase());
          db.users.push(normalizeStaticUser({ ...u }));
        }
      }
    }
  } catch {
    // ignore storage parse error
  }
}

function getDb(): StaticDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StaticDb;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.services)) {
        parsed.users = parsed.users.map(u => normalizeStaticUser(u));
        mergeLegacyBackupUsers(parsed);
        if (!Array.isArray(parsed.giftCardRedemptions)) parsed.giftCardRedemptions = [];
        if (!parsed.activeGameWagers || typeof parsed.activeGameWagers !== 'object') parsed.activeGameWagers = {};
        if (!Array.isArray(parsed.adminSessions)) parsed.adminSessions = [];
        if (!Array.isArray(parsed.terminatedAdminTokens)) parsed.terminatedAdminTokens = [];
        return parsed;
      }
    }
  } catch {
    // ignore storage corruption and re-seed
  }
  const fresh = createInitialStaticDb();
  mergeLegacyBackupUsers(fresh);
  saveDb(fresh);
  return fresh;
}

function saveDb(db: StaticDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // ignore quota exceeded
  }
}

function findUser(db: StaticDb, idOrUserId: string): UserProfile | undefined {
  const key = (idOrUserId || '').trim().toLowerCase();
  if (!key) return undefined;
  return db.users.find(
    u =>
      (u.userId || '').toLowerCase() === key ||
      (u.id || '').toLowerCase() === key ||
      (u.gamingId || '').toLowerCase() === key
  );
}

function verifyAdminPass(pass?: string): boolean {
  return pass === 'admin123' || pass === 'ESP@Admin2026' || pass === 'ESP_Admin_9988#Secure' || pass === 'admin';
}

function createStaticUserSession(
  user: UserProfile,
  body: any,
  preferredToken?: string
): { limitReached?: boolean; activeSessions?: UserSession[]; sessionToken?: string } {
  if (!Array.isArray(user.activeSessions)) user.activeSessions = [];
  if (!Array.isArray(user.terminatedTokens)) user.terminatedTokens = [];
  const info = body?.deviceInfo || {};
  const deviceId = String(body?.deviceId || info?.deviceId || '').trim();
  const nowIso = new Date().toISOString();
  const tokPref = preferredToken ? String(preferredToken).trim() : '';

  const existingIdx = user.activeSessions.findIndex(
    s => (tokPref && s.token === tokPref) || (deviceId && s.deviceId === deviceId)
  );
  if (existingIdx !== -1) {
    const cur = user.activeSessions[existingIdx];
    const token = tokPref || cur.token || `esp_static_${Date.now()}`;
    const updated: UserSession = {
      ...cur,
      token,
      deviceId: deviceId || cur.deviceId,
      deviceType: info.deviceType || cur.deviceType || 'desktop',
      deviceName: info.deviceName || cur.deviceName || 'Web Browser',
      browser: info.browser || cur.browser || 'Browser',
      os: info.os || cur.os || 'OS',
      lastActive: nowIso,
      lastTab: user.workspaceState?.lastTab || cur.lastTab,
    };
    user.activeSessions.splice(existingIdx, 1);
    user.activeSessions.unshift(updated);
    user.maxDevices = MAX_STATIC_DEVICES;
    return { sessionToken: token };
  }

  if (user.activeSessions.length >= MAX_STATIC_DEVICES) {
    if (body?.replaceSessionId) {
      const idx = user.activeSessions.findIndex(s => s.sessionId === body.replaceSessionId);
      if (idx !== -1) {
        const [removed] = user.activeSessions.splice(idx, 1);
        if (removed?.token) user.terminatedTokens = Array.from(new Set([removed.token, ...user.terminatedTokens])).slice(0, 50);
      }
    } else if (body?.replaceOldestDevice) {
      const [removed] = user.activeSessions.splice(user.activeSessions.length - 1, 1);
      if (removed?.token) user.terminatedTokens = Array.from(new Set([removed.token, ...user.terminatedTokens])).slice(0, 50);
    } else {
      return { limitReached: true, activeSessions: user.activeSessions };
    }
  }

  const sessionToken = tokPref || `esp_static_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  user.activeSessions.unshift({
    sessionId: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    token: sessionToken,
    deviceId: deviceId || undefined,
    deviceType: info.deviceType || 'desktop',
    deviceName: info.deviceName || 'Web Browser',
    browser: info.browser || 'Browser',
    os: info.os || 'OS',
    loginTime: nowIso,
    lastActive: nowIso,
    lastTab: user.workspaceState?.lastTab,
  });
  user.maxDevices = MAX_STATIC_DEVICES;
  return { sessionToken };
}

function createStaticAdminSession(
  db: StaticDb,
  body: any,
  preferredToken?: string
): { limitReached?: boolean; activeSessions?: AdminSession[]; adminToken?: string } {
  if (!Array.isArray(db.adminSessions)) db.adminSessions = [];
  if (!Array.isArray(db.terminatedAdminTokens)) db.terminatedAdminTokens = [];
  const info = body?.deviceInfo || {};
  const deviceId = String(body?.deviceId || info?.deviceId || '').trim();
  const nowIso = new Date().toISOString();
  const tokPref = preferredToken ? String(preferredToken).trim() : '';

  const idx = db.adminSessions.findIndex(
    s => (tokPref && s.token === tokPref) || (deviceId && s.deviceId === deviceId)
  );
  if (idx !== -1) {
    const cur = db.adminSessions[idx];
    const adminToken = tokPref || cur.token || `esp_adm_static_${Date.now()}`;
    db.adminSessions.splice(idx, 1);
    db.adminSessions.unshift({
      ...cur,
      token: adminToken,
      deviceId: deviceId || cur.deviceId,
      deviceType: info.deviceType || cur.deviceType || 'desktop',
      deviceName: info.deviceName || cur.deviceName || 'Admin Browser',
      browser: info.browser || cur.browser || 'Browser',
      os: info.os || cur.os || 'OS',
      lastActive: nowIso,
    });
    return { adminToken };
  }

  if (db.adminSessions.length >= MAX_STATIC_DEVICES) {
    if (body?.replaceSessionId) {
      const tIdx = db.adminSessions.findIndex(s => s.sessionId === body.replaceSessionId);
      if (tIdx !== -1) {
        const [removed] = db.adminSessions.splice(tIdx, 1);
        if (removed?.token) db.terminatedAdminTokens = Array.from(new Set([removed.token, ...db.terminatedAdminTokens])).slice(0, 50);
      }
    } else if (body?.replaceOldestDevice) {
      const [removed] = db.adminSessions.splice(db.adminSessions.length - 1, 1);
      if (removed?.token) db.terminatedAdminTokens = Array.from(new Set([removed.token, ...db.terminatedAdminTokens])).slice(0, 50);
    } else {
      return { limitReached: true, activeSessions: db.adminSessions };
    }
  }

  const adminToken = tokPref || `esp_adm_static_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  db.adminSessions.unshift({
    sessionId: `admsess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    token: adminToken,
    deviceId: deviceId || undefined,
    deviceType: info.deviceType || 'desktop',
    deviceName: info.deviceName || 'Admin Browser',
    browser: info.browser || 'Browser',
    os: info.os || 'OS',
    loginTime: nowIso,
    lastActive: nowIso,
  });
  return { adminToken };
}

function buildNwiTree(db: StaticDb, user: UserProfile): NwiTreeRecord {
  const tierFee = Number(user.joiningFee) || 200;
  const targetUserId = (user.userId || '').toLowerCase();
  const claimedSet = new Set((user.nwiClaimedMemberIds || []).map(x => (x || '').toLowerCase()));
  const l1Users = db.users.filter(u => u.sponsorId && u.sponsorId.toLowerCase() === targetUserId && u.id !== user.id);
  const l1Ids = new Set(l1Users.map(u => (u.userId || '').toLowerCase()));
  const l2Users = db.users.filter(u => u.sponsorId && l1Ids.has(u.sponsorId.toLowerCase()));
  const l2Ids = new Set(l2Users.map(u => (u.userId || '').toLowerCase()));
  const l3Users = db.users.filter(u => u.sponsorId && l2Ids.has(u.sponsorId.toLowerCase()));

  const toNode = (u: UserProfile, level: 1 | 2 | 3, rate: number): NwiMemberNode => ({
    userId: u.userId,
    fullName: u.fullName,
    avatar: u.avatar,
    joiningDate: u.joiningDate || u.createdAt.slice(0, 10),
    planFee: Number(u.joiningFee) || 0,
    level,
    spilloverFrom: level === 1 ? 'Direct Level 1' : `Level ${level - 1} Team (${u.sponsorId})`,
    rewardEarned: Math.round(((Number(u.joiningFee) || 0) * rate)),
    status: u.status === 'active' ? 'active' : 'pending',
  });

  const level1Members = l1Users.map(u => toNode(u, 1, 0.10));
  const level2Members = l2Users.map(u => toNode(u, 2, 0.15));
  const level3Members = l3Users.map(u => toNode(u, 3, 0.25));

  const level1Income = level1Members.reduce((s, m) => s + m.rewardEarned, 0);
  const level2Income = level2Members.reduce((s, m) => s + m.rewardEarned, 0);
  const level3Income = level3Members.reduce((s, m) => s + m.rewardEarned, 0);
  const totalPassiveEarned = level1Income + level2Income + level3Income;
  const allNodes = [...level1Members, ...level2Members, ...level3Members];
  const totalPassiveClaimed = allNodes.filter(n => claimedSet.has((n.userId || '').toLowerCase())).reduce((s, n) => s + n.rewardEarned, 0);

  return {
    userId: user.userId,
    userName: user.fullName,
    isActive: user.status === 'active',
    activatedAt: user.joiningDate || new Date().toISOString().slice(0, 10),
    tierFee,
    level1Members,
    level2Members,
    level3Members,
    level1Income,
    level2Income,
    level3Income,
    totalPassiveEarned,
    totalPassiveClaimed,
    pendingToClaim: Math.max(0, totalPassiveEarned - totalPassiveClaimed),
    queuePosition: 1,
  };
}

export function applyStaticCloudConfig(
  settings?: Partial<PlatformSettings> | null,
  services?: ServiceItem[] | null,
  homeSliderPhotos?: HomeSliderPhoto[] | null
) {
  const db = getDb();
  let changed = false;
  if (settings && typeof settings === 'object') {
    db.settings = { ...db.settings, ...settings };
    if (Array.isArray(settings.homeSliderPhotos)) {
      db.homeSliderPhotos = settings.homeSliderPhotos.slice(0, 7);
    }
    changed = true;
  }
  if (Array.isArray(homeSliderPhotos)) {
    db.homeSliderPhotos = homeSliderPhotos.slice(0, 7);
    db.settings = { ...db.settings, homeSliderPhotos: db.homeSliderPhotos };
    changed = true;
  }
  if (Array.isArray(services) && services.length > 0) {
    db.services = services;
    changed = true;
  }
  if (changed) saveDb(db);
}

export function handleStaticApiRequest(urlStr: string, options: RequestInit = {}): any {
  const db = getDb();
  const method = (options.method || 'GET').toUpperCase();
  const parsedUrl = new URL(urlStr, 'https://playesp.github.io');
  const path = parsedUrl.pathname;
  const search = parsedUrl.searchParams;
  let body: any = {};
  if (typeof options.body === 'string' && options.body.trim()) {
    try {
      body = JSON.parse(options.body);
    } catch {
      body = {};
    }
  }
  const headersObj = (options.headers || {}) as Record<string, string>;
  const adminPassHeader = headersObj['x-admin-password'] || body.adminPassword || search.get('adminPassword') || '';

  // Settings & Services
  if (path === '/api/settings' && method === 'GET') {
    return { success: true, settings: db.settings };
  }
  if (path === '/api/settings' && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized Admin Key' };
    const { adminPassword: _ap, ...rest } = body;
    db.settings = { ...db.settings, ...rest };
    saveDb(db);
    return { success: true, settings: db.settings };
  }
  if (path === '/api/services' && method === 'GET') {
    return { success: true, services: db.services };
  }
  if (path === '/api/services' && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized Admin Key' };
    const srv: ServiceItem = {
      id: `srv-${Date.now()}`,
      code: (body.newService?.code || 'NEW').toUpperCase(),
      name: body.newService?.name || 'New Service',
      hindiName: body.newService?.hindiName || body.newService?.name || 'नई सेवा',
      description: body.newService?.description || '',
      hindiDescription: body.newService?.hindiDescription || '',
      category: body.newService?.category || 'direct',
      joiningFeeTiers: body.newService?.joiningFeeTiers || [10, 50, 100],
      defaultFee: Number(body.newService?.defaultFee) || 10,
      dailyEarningEst: body.newService?.dailyEarningEst || '₹20 - ₹200 / day',
      referralBonusPercent: Number(body.newService?.referralBonusPercent) || 40,
      icon: body.newService?.icon || 'Zap',
      features: body.newService?.features || ['Instant Credit'],
      active: true,
    };
    db.services.push(srv);
    saveDb(db);
    return { success: true, service: srv, services: db.services };
  }
  if (path.startsWith('/api/services/') && method === 'DELETE') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized Admin Key' };
    const id = path.split('/').pop();
    db.services = db.services.filter(s => s.id !== id);
    saveDb(db);
    return { success: true, services: db.services };
  }

  // Sponsor lookup (Supports User ID & Unique @Username)
  if (path === '/api/sponsor/check') {
    const id = (search.get('id') || '').trim();
    const sp = id ? findStaticSponsorUser(db.users, id) : undefined;
    if (!sp || id.toUpperCase() === db.settings.ownerSponsorId) {
      const owner = db.users.find(u => u.userId === db.settings.ownerSponsorId);
      return {
        valid: true,
        sponsorId: db.settings.ownerSponsorId,
        sponsorUsername: owner?.username || '',
        sponsorName: db.settings.ownerName,
        isOwner: true,
        maskedPhone: '******0845',
        maskedEmail: 'i***m@gmail.com',
      };
    }
    return {
      valid: true,
      sponsorId: sp.userId,
      sponsorUsername: sp.username || '',
      sponsorName: sp.fullName,
      isOwner: sp.userId === db.settings.ownerSponsorId,
      maskedPhone: `******${sp.phone.slice(-4)}`,
      maskedEmail: sp.email,
      planName: sp.chosenServiceName,
      joiningDate: sp.joiningDate,
      status: sp.status,
    };
  }

  if (path.startsWith('/api/public/sponsor/')) {
    const sponsorRef = decodeURIComponent(path.replace('/api/public/sponsor/', '')).trim();
    const owner = db.users.find(u => u.userId === db.settings.ownerSponsorId);
    const sp = sponsorRef && sponsorRef.toUpperCase() !== db.settings.ownerSponsorId.toUpperCase()
      ? findStaticSponsorUser(db.users, sponsorRef)
      : undefined;
    if (sp) {
      return {
        success: true,
        valid: true,
        sponsorId: sp.userId,
        sponsorUsername: sp.username || '',
        sponsorName: sp.fullName,
        chosenServiceCode: sp.chosenServiceCode || 'EMO',
        chosenServiceName: sp.chosenServiceName || 'EARN MONEY ONLINE (EMO)',
        vipTier: sp.vipTier || 'none',
        avatar: sp.avatar || '',
        gameLevel: sp.gameLevel || 1,
        isOwner: sp.userId === db.settings.ownerSponsorId,
      };
    }
    return {
      success: true,
      valid: !sponsorRef || sponsorRef.toUpperCase() === db.settings.ownerSponsorId.toUpperCase(),
      sponsorId: db.settings.ownerSponsorId,
      sponsorUsername: owner?.username || '',
      sponsorName: db.settings.ownerName,
      chosenServiceCode: owner?.chosenServiceCode || 'EMO',
      chosenServiceName: owner?.chosenServiceName || 'EARN MONEY ONLINE (EMO)',
      vipTier: owner?.vipTier || 'diamond',
      avatar: owner?.avatar || '',
      gameLevel: owner?.gameLevel || 1,
      isOwner: true,
    };
  }

  if (path === '/api/auth/check-identity' && method === 'POST') {
    const normalizedPhone = normalizeStaticPhone(body.phone || '');
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const cleanUname = body.username ? normalizeStaticUsername(body.username) : '';
    const excl = body.excludeUserId ? String(body.excludeUserId).toLowerCase() : '';

    if (normalizedPhone.length >= 10) {
      const phoneConflict = db.users.find(
        u => (!excl || u.userId.toLowerCase() !== excl) && normalizeStaticPhone(u.phone || '') === normalizedPhone
      );
      if (phoneConflict) {
        return {
          success: true,
          available: false,
          conflictField: 'phone',
          message: 'यह मोबाइल नंबर पहले से किसी ESP खाते में पंजीकृत है। कृपया लॉगिन करें या "Forget ID" का उपयोग करें।',
        };
      }
    }
    if (cleanEmail && cleanEmail.includes('@')) {
      const emailConflict = db.users.find(
        u => (!excl || u.userId.toLowerCase() !== excl) && (u.email || '').trim().toLowerCase() === cleanEmail
      );
      if (emailConflict) {
        return {
          success: true,
          available: false,
          conflictField: 'email',
          message: 'यह ईमेल पता पहले से किसी दूसरे ESP खाते में पंजीकृत है। कृपया कोई नया ईमेल दर्ज करें या लॉगिन करें।',
        };
      }
    }
    if (cleanUname) {
      if (!isValidStaticUsername(cleanUname)) {
        return {
          success: true,
          available: false,
          conflictField: 'username',
          message: 'यूनिक यूज़रनेम में कोई Symbol (_ - . @) उपयोग न करें — केवल 3 से 24 अक्षर (a-z और 0-9) लिखें।',
        };
      }
      if (isStaticUsernameTaken(db.users, cleanUname, body.excludeUserId)) {
        return {
          success: true,
          available: false,
          conflictField: 'username',
          message: `यूज़रनेम "@${cleanUname}" पहले से लिया जा चुका है! कृपया कोई दूसरा नाम चुनें।`,
        };
      }
    }
    return { success: true, available: true };
  }

  // Auth: Register, Login, Restore, Forget ID, Forget Password, Verify Session
  if (path === '/api/auth/register' && method === 'POST') {
    const isGamer = body.accountType === 'gamer';
    const fullName = String(body.fullName || '').trim().replace(/\s+/g, ' ');
    const rawPhone = String(body.phone || '').trim();
    const phone = normalizeStaticPhone(rawPhone) || rawPhone;
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    if (!fullName || !phone || normalizeStaticPhone(rawPhone).length < 10) {
      return { success: false, message: 'नाम और सही 10 अंकों का मोबाइल नंबर आवश्यक है' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, message: 'कृपया एक वैध ईमेल पता (Valid Email Address) दर्ज करें।' };
    }
    const inputUsername = body.username !== undefined ? normalizeStaticUsername(body.username) : '';
    if (inputUsername) {
      if (!isValidStaticUsername(inputUsername)) {
        return {
          success: false,
          code: 'INVALID_USERNAME',
          message: 'यूनिक यूज़रनेम में कोई Symbol (_ - . @) उपयोग न करें — केवल 3 से 24 अक्षर (a-z और 0-9) लिखें।',
        };
      }
      if (isStaticUsernameTaken(db.users, inputUsername)) {
        return {
          success: false,
          code: 'USERNAME_TAKEN',
          message: `यूज़रनेम "@${inputUsername}" पहले से लिया जा चुका है! कृपया कोई दूसरा यूनिक नाम चुनें।`,
        };
      }
    }
    const phoneConflict = db.users.find(u => normalizeStaticPhone(u.phone || '') === phone);
    if (phoneConflict) {
      return { success: false, code: 'DUPLICATE_PHONE', message: 'इस मोबाइल नंबर से पहले से खाता पंजीकृत है। कृपया लॉगिन करें या "Forget ID" का उपयोग करें।' };
    }
    const emailConflict = db.users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    if (emailConflict) {
      return { success: false, code: 'DUPLICATE_EMAIL', message: 'इस ईमेल पते से पहले से खाता पंजीकृत है। एक ईमेल से केवल 1 अकाउंट बन सकता है।' };
    }

    const fee = isGamer ? 0 : (Number(body.joiningFee) || 10);
    const srv = isGamer
      ? { code: 'GAME', name: 'ESP GAMING & VOICE CLUB' }
      : (db.services.find(s => s.code === body.chosenServiceCode) || db.services[0]);
    const prefUserId = String(body.preferredUserId || '').trim();
    const prefUserIdFree =
      prefUserId &&
      /^[a-zA-Z0-9_-]{3,48}$/.test(prefUserId) &&
      !db.users.some(u => (u.userId || '').toLowerCase() === prefUserId.toLowerCase());
    const userId = prefUserIdFree
      ? prefUserId
      : isGamer
      ? generateStaticGamerId(db.users, fullName)
      : generateStaticIncomeId(db.users, fullName, srv.code);

    const prefGamingId = String(body.preferredGamingId || '').trim();
    const prefGamingIdFree =
      prefGamingId &&
      /^[a-zA-Z0-9_-]{3,48}$/.test(prefGamingId) &&
      (isGamer || prefGamingId.toLowerCase() !== userId.toLowerCase()) &&
      !db.users.some(u => (u.gamingId || '').toLowerCase() === prefGamingId.toLowerCase());
    let gamingId = isGamer
      ? userId
      : prefGamingIdFree
      ? prefGamingId
      : generateStaticGamerId(db.users, fullName);
    if (!isGamer && gamingId.toLowerCase() === userId.toLowerCase()) {
      gamingId = `${gamingId}G`;
    }
    const username = inputUsername || generateStaticDefaultUsername(db.users, fullName, userId, gamingId);
    const sponsor = findStaticSponsorUser(db.users, body.sponsorId || db.settings.ownerSponsorId);
    const sessionToken = `esp_static_${Date.now()}`;

    const prefRoom = String(body.preferredRoomAddress || '').trim();
    const prefRoomFree =
      /^\d{3,10}$/.test(prefRoom) &&
      !findStaticRoomConflict(db.users, db.customVoiceRooms || [], prefRoom).conflict;
    const roomAddress = prefRoomFree
      ? prefRoom
      : generateStaticRoomId(db.users, db.customVoiceRooms || [], fullName);

    const newUser: UserProfile = normalizeStaticUser({
      id: `usr-${Date.now()}`,
      userId,
      gamingId,
      username,
      fullName,
      phone,
      email: cleanEmail,
      fullAddress: body.fullAddress || '',
      paymentAddress: body.paymentAddress || '',
      payoutUpiId: body.paymentAddress || '',
      password: String(body.password || '123456').trim(),
      sponsorId: sponsor ? sponsor.userId : db.settings.ownerSponsorId,
      sponsorName: sponsor ? sponsor.fullName : db.settings.ownerName,
      chosenServiceCode: srv.code,
      chosenServiceName: srv.name,
      joiningFee: fee,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      paymentUtr: body.paymentUtr || (isGamer ? 'FREE_GAMING_USER' : 'STATIC_UTR'),
      paymentScreenshot: body.paymentScreenshot || '',
      status: isGamer ? 'active' : 'pending',
      accountType: isGamer ? 'gamer' : 'business',
      balance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      promoEarnings: 0,
      totalWithdrawn: 0,
      coins: 0,
      charms: 0,
      gameLevel: 1,
      gameXp: 0,
      vipTier: 'none',
      vipTitle: '',
      unlockedFrames: ['standard'],
      frameType: 'standard',
      unlockedRooms: ['default_dark'],
      roomTheme: 'default_dark',
      roomAddress,
      personalRoomId: roomAddress,
      followedRooms: [],
      houseName: `${fullName} Gaming House`,
      clanName: 'Royal Warriors ESP',
      clanRole: 'Member',
      loginStreak: 0,
      claimedDays: [],
      friendsCount: 0,
      visitorCount: 0,
      role: 'member',
      registeredFromHost:
        String(body.registeredFromHost || (typeof window !== 'undefined' ? window.location.hostname : 'playesp.github.io')).slice(0, 128),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
      createdAt: new Date().toISOString(),
    });
    db.users.unshift(newUser);
    ensureStaticPersonalRoom(db, newUser);
    saveDb(db);
    return { success: true, user: newUser, sessionToken };
  }

  if (path === '/api/health' && method === 'GET') {
    return { success: true, ok: true, service: 'esp-static-fallback', usersCount: db.users.length };
  }

  if (path === '/api/auth/rollback-registration' && method === 'POST') {
    const uid = String(body.userId || '').trim().toLowerCase();
    const tok = String(body.sessionToken || '').trim();
    const idx = db.users.findIndex(
      u => u.userId.toLowerCase() === uid && Array.isArray(u.activeSessions) && u.activeSessions.some(s => s.token === tok)
    );
    if (idx !== -1) {
      const removed = db.users[idx];
      db.users.splice(idx, 1);
      db.referrals = (db.referrals || []).filter(r => r.downlineUserId.toLowerCase() !== removed.userId.toLowerCase());
      db.customVoiceRooms = (db.customVoiceRooms || []).filter(r => r.hostUserId.toLowerCase() !== removed.userId.toLowerCase());
      saveDb(db);
    }
    return { success: true };
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const identifier = String(body.identifier || '').trim();
    const pass = String(body.password || '');
    const candidates = db.users.filter(u => matchesStaticIdentifier(u, identifier));
    if (candidates.length === 0) {
      return {
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'इस ID, मोबाइल नंबर या ईमेल से कोई खाता नहीं मिला। कृपया "Forget ID?" से अपनी ID खोजें।',
      };
    }
    const user = candidates.find(u => isStaticPasswordMatch(u.password, pass));
    if (!user) {
      return {
        success: false,
        code: 'PASSWORD_MISMATCH',
        message: 'पासवर्ड मेल नहीं खा रहा (Password details mismatch)। कृपया सही पासवर्ड दर्ज करें या "Forget Password?" का उपयोग करें।',
      };
    }
    const sessionRes = createStaticUserSession(user, body);
    if (sessionRes.limitReached) {
      return {
        success: false,
        code: 'DEVICE_LIMIT_REACHED',
        maxDevices: MAX_STATIC_DEVICES,
        activeSessions: (sessionRes.activeSessions || []).map(s => ({ ...s, token: '' })),
        message: `यह खाता पहले से अधिकतम ${MAX_STATIC_DEVICES} डिवाइसेस में लॉगिन है! किसी 1 पुराने डिवाइस को लॉगआउट करें।`,
      };
    }
    const sessionToken = sessionRes.sessionToken!;
    user.lastLogin = new Date().toISOString();
    user.isOnline = true;
    saveDb(db);
    return {
      success: true,
      user: {
        ...user,
        maxDevices: MAX_STATIC_DEVICES,
        activeSessions: user.activeSessions?.map(s => ({ ...s, isCurrent: s.token === sessionToken })),
      },
      sessionToken,
    };
  }

  if (path === '/api/auth/logout' && method === 'POST') {
    const sessionToken = String(headersObj['x-session-token'] || body.sessionToken || '').trim();
    const deviceId = String(body.deviceId || '').trim();
    const user = body.userId ? findUser(db, body.userId) : db.users.find(u => u.activeSessions?.some(s => s.token === sessionToken));
    if (user) {
      if (!Array.isArray(user.activeSessions)) user.activeSessions = [];
      if (body.workspaceState && typeof body.workspaceState === 'object') {
        user.workspaceState = {
          ...(user.workspaceState || {}),
          ...body.workspaceState,
          updatedAt: new Date().toISOString(),
        };
      }
      user.activeSessions = user.activeSessions.filter(s => !(sessionToken && s.token === sessionToken) && !(deviceId && s.deviceId === deviceId));
      user.isOnline = user.activeSessions.length > 0;
      saveDb(db);
    }
    return { success: true, remainingDevices: user?.activeSessions?.length || 0 };
  }

  if (path === '/api/admin/auth/login' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) {
      return { success: false, message: 'गलत Admin Password!' };
    }
    const res = createStaticAdminSession(db, body);
    if (res.limitReached) {
      return {
        success: false,
        code: 'DEVICE_LIMIT_REACHED',
        maxDevices: MAX_STATIC_DEVICES,
        activeSessions: (res.activeSessions || []).map(s => ({ ...s, token: undefined })),
        message: `Admin Panel अधिकतम ${MAX_STATIC_DEVICES} डिवाइसेस पर लॉगिन है!`,
      };
    }
    saveDb(db);
    return {
      success: true,
      adminToken: res.adminToken,
      maxDevices: MAX_STATIC_DEVICES,
      activeSessions: (db.adminSessions || []).map(s => ({ ...s, token: undefined, isCurrent: s.token === res.adminToken })),
    };
  }
  if (path === '/api/admin/auth/logout' && method === 'POST') {
    const tok = String(headersObj['x-admin-token'] || body.adminToken || '').trim();
    const devId = String(body.deviceId || '').trim();
    db.adminSessions = (db.adminSessions || []).filter(s => !(tok && s.token === tok) && !(devId && s.deviceId === devId));
    saveDb(db);
    return { success: true };
  }
  if (path === '/api/admin/auth/verify' && method === 'GET') {
    const tok = String(headersObj['x-admin-token'] || search.get('token') || '').trim();
    if (tok && (db.terminatedAdminTokens || []).includes(tok)) {
      return { success: false, valid: false, sessionTerminated: true, message: 'यह Admin डिवाइस रिमोटली लॉगआउट किया गया है।' };
    }
    return {
      success: true,
      valid: true,
      maxDevices: MAX_STATIC_DEVICES,
      activeSessions: (db.adminSessions || []).map(s => ({ ...s, token: undefined, isCurrent: tok ? s.token === tok : false })),
    };
  }
  if (path === '/api/admin/sessions' && method === 'GET') {
    const tok = String(headersObj['x-admin-token'] || search.get('adminToken') || '').trim();
    return {
      success: true,
      maxDevices: MAX_STATIC_DEVICES,
      adminSessions: (db.adminSessions || []).map(s => ({ ...s, token: undefined, isCurrent: tok ? s.token === tok : false })),
      userSessions: db.users
        .filter(u => (u.activeSessions || []).length > 0)
        .map(u => ({
          userId: u.userId,
          fullName: u.fullName,
          username: u.username,
          personalRoomId: u.personalRoomId || u.roomAddress,
          sponsorId: u.sponsorId,
          role: u.role,
          activeCount: (u.activeSessions || []).length,
          maxDevices: MAX_STATIC_DEVICES,
          sessions: (u.activeSessions || []).map(s => ({ ...s, token: '' })),
        })),
      identityAudit: {
        totalUsers: db.users.length,
        uniqueUserIds: new Set(db.users.map(u => (u.userId || '').toLowerCase())).size,
        uniqueRoomIds: new Set(db.users.map(u => String(u.roomAddress || u.personalRoomId || ''))).size,
        uniqueUsernames: new Set(db.users.map(u => normalizeStaticUsername(u.username)).filter(Boolean)).size,
        duplicateUserIds: [],
        duplicateRoomIds: [],
        duplicateUsernames: [],
        integrityHealthy: true,
      },
    };
  }
  if (path === '/api/admin/sessions/terminate' && method === 'POST') {
    const tok = String(headersObj['x-admin-token'] || body.currentAdminToken || '').trim();
    if (!Array.isArray(db.adminSessions)) db.adminSessions = [];
    if (!Array.isArray(db.terminatedAdminTokens)) db.terminatedAdminTokens = [];
    if (body.terminateAllOthers && tok) {
      db.adminSessions.forEach(s => {
        if (s.token && s.token !== tok) db.terminatedAdminTokens!.unshift(s.token);
      });
      db.adminSessions = db.adminSessions.filter(s => s.token === tok);
    } else if (body.sessionId) {
      db.adminSessions.forEach(s => {
        if (s.sessionId === body.sessionId && s.token) db.terminatedAdminTokens!.unshift(s.token);
      });
      db.adminSessions = db.adminSessions.filter(s => s.sessionId !== body.sessionId);
    }
    saveDb(db);
    return {
      success: true,
      adminSessions: db.adminSessions.map(s => ({ ...s, token: undefined, isCurrent: tok ? s.token === tok : false })),
    };
  }
  if (path.match(/^\/api\/admin\/user\/[^/]+\/terminate-session$/) && method === 'POST') {
    const uid = decodeURIComponent(path.split('/')[4]);
    const u = findUser(db, uid);
    if (!u) return { success: false, message: 'User not found' };
    if (!Array.isArray(u.activeSessions)) u.activeSessions = [];
    if (!Array.isArray(u.terminatedTokens)) u.terminatedTokens = [];
    if (body.terminateAll) {
      u.activeSessions.forEach(s => s.token && u.terminatedTokens!.unshift(s.token));
      u.activeSessions = [];
      u.isOnline = false;
    } else if (body.sessionId) {
      u.activeSessions.forEach(s => s.sessionId === body.sessionId && s.token && u.terminatedTokens!.unshift(s.token));
      u.activeSessions = u.activeSessions.filter(s => s.sessionId !== body.sessionId);
      u.isOnline = u.activeSessions.length > 0;
    }
    saveDb(db);
    return { success: true, activeSessions: u.activeSessions };
  }

  if (path === '/api/auth/restore-account' && method === 'POST') {
    const backup = body.user;
    if (!backup || !backup.userId) return { success: false, message: 'Invalid backup user' };
    let existing = findUser(db, backup.userId);
    if (!existing) {
      existing = normalizeStaticUser({ ...backup });
      db.users.push(existing);
      ensureStaticPersonalRoom(db, existing);
      saveDb(db);
    } else {
      const isTrustedVaultPasswordUpdate = Boolean(
        body.forceCloudMerge &&
          body.updatePasswordFromVault &&
          backup.vaultKey &&
          backup.password &&
          String(backup.password).trim() === String(body.password || '').trim()
      );
      if (
        body.password !== undefined &&
        !isTrustedVaultPasswordUpdate &&
        String(existing.password || '').trim() !== String(body.password || '').trim()
      ) {
        return {
          success: false,
          code: 'PASSWORD_MISMATCH',
          message: 'पासवर्ड मेल नहीं खा रहा (Password mismatch)। कृपया सही पासवर्ड दर्ज करें।',
        };
      }
      if (body.forceCloudMerge) {
        const inTime = Date.parse(String(backup.updatedAt || backup.createdAt || '')) || 0;
        const curTime = Date.parse(String((existing as any).updatedAt || existing.lastLogin || existing.createdAt || '')) || 0;
        const statusPromoted = existing.status === 'pending' && (backup.status === 'active' || backup.status === 'rejected');
        if (inTime >= curTime || statusPromoted || isTrustedVaultPasswordUpdate) {
          if (backup.status === 'active' || backup.status === 'pending' || backup.status === 'rejected') {
            existing.status = backup.status;
          }
          if (typeof backup.balance === 'number' && Number.isFinite(backup.balance)) existing.balance = Math.max(0, backup.balance);
          if (typeof backup.coins === 'number' && Number.isFinite(backup.coins)) existing.coins = Math.max(0, backup.coins);
          if (typeof backup.totalEarnings === 'number' && Number.isFinite(backup.totalEarnings)) existing.totalEarnings = Math.max(0, backup.totalEarnings);
          if (typeof backup.referralEarnings === 'number' && Number.isFinite(backup.referralEarnings)) existing.referralEarnings = Math.max(0, backup.referralEarnings);
          if (typeof backup.promoEarnings === 'number' && Number.isFinite(backup.promoEarnings)) existing.promoEarnings = Math.max(0, backup.promoEarnings);
          if (typeof backup.totalWithdrawn === 'number' && Number.isFinite(backup.totalWithdrawn)) existing.totalWithdrawn = Math.max(0, backup.totalWithdrawn);
          if (typeof backup.charms === 'number' && Number.isFinite(backup.charms)) existing.charms = Math.max(0, backup.charms);
          if (typeof backup.gameLevel === 'number' && Number.isFinite(backup.gameLevel)) existing.gameLevel = Math.max(1, backup.gameLevel);
          if (typeof backup.gameXp === 'number' && Number.isFinite(backup.gameXp)) existing.gameXp = Math.max(0, backup.gameXp);
          if (backup.vipTier) existing.vipTier = backup.vipTier;
          if (backup.vipTitle !== undefined) existing.vipTitle = String(backup.vipTitle);
          if (backup.frameType) existing.frameType = String(backup.frameType);
          if (Array.isArray(backup.unlockedFrames) && backup.unlockedFrames.length > 0) existing.unlockedFrames = backup.unlockedFrames;
          if (backup.chosenServiceCode) existing.chosenServiceCode = String(backup.chosenServiceCode);
          if (backup.chosenServiceName) existing.chosenServiceName = String(backup.chosenServiceName);
          if (typeof backup.joiningFee === 'number') existing.joiningFee = Math.max(0, backup.joiningFee);
          if (backup.accountType === 'business' || backup.accountType === 'gamer') existing.accountType = backup.accountType;
          if (backup.swiAppLink !== undefined) existing.swiAppLink = String(backup.swiAppLink || '');
          if (backup.swiAppNote !== undefined) existing.swiAppNote = String(backup.swiAppNote || '');
          if (typeof backup.isVipRoom === 'boolean') existing.isVipRoom = backup.isVipRoom;
          if (backup.vipRoomLabel !== undefined) existing.vipRoomLabel = String(backup.vipRoomLabel || '');
          if (backup.roomAddress && /^\d{3,10}$/.test(String(backup.roomAddress))) {
            existing.roomAddress = String(backup.roomAddress);
            existing.personalRoomId = String(backup.roomAddress);
          }
          if (backup.fullName) existing.fullName = String(backup.fullName);
          if (backup.payoutUpiId !== undefined) existing.payoutUpiId = String(backup.payoutUpiId || '');
          if (backup.paymentAddress !== undefined) existing.paymentAddress = String(backup.paymentAddress || '');
          if (backup.clanName !== undefined) existing.clanName = String(backup.clanName || '');
          if (isTrustedVaultPasswordUpdate || (body.updatePasswordFromVault && backup.password)) {
            existing.password = String(backup.password).trim();
          }
          if (backup.workspaceState && typeof backup.workspaceState === 'object') {
            existing.workspaceState = backup.workspaceState;
          }
          (existing as any).updatedAt = backup.updatedAt || new Date().toISOString();
          normalizeStaticUser(existing);
          ensureStaticPersonalRoom(db, existing);
          saveDb(db);
        }
      }
    }
    const resSess = createStaticUserSession(existing, body, body.preferredToken);
    if (resSess.limitReached) {
      return {
        success: false,
        code: 'DEVICE_LIMIT_REACHED',
        maxDevices: MAX_STATIC_DEVICES,
        activeSessions: (resSess.activeSessions || []).map(s => ({ ...s, token: '' })),
      };
    }
    saveDb(db);
    return { success: true, user: existing, sessionToken: resSess.sessionToken };
  }

  if (path === '/api/auth/forget-id' && method === 'POST') {
    const q = String(body.phoneOrEmail || '').trim().toLowerCase();
    const qDigits = normalizeStaticPhone(q);
    const matched = db.users.filter(
      u =>
        (u.email || '').trim().toLowerCase() === q ||
        (u.phone || '').trim().toLowerCase() === q ||
        (qDigits.length === 10 && normalizeStaticPhone(u.phone || '') === qDigits)
    );
    if (matched.length === 0) return { success: false, message: 'इस मोबाइल नंबर या ईमेल से कोई खाता नहीं मिला' };
    const primary = matched[0];
    return {
      success: true,
      userId: primary.userId,
      gamingId: primary.gamingId || `GAME-${(primary.phone || '000000').slice(-6)}`,
      fullName: primary.fullName,
      accountType: primary.accountType || 'business',
      chosenServiceCode: primary.chosenServiceCode,
      accounts: matched.map(u => ({
        userId: u.userId,
        gamingId: u.gamingId || `GAME-${(u.phone || '000000').slice(-6)}`,
        fullName: u.fullName,
        accountType: u.accountType || 'business',
        chosenServiceCode: u.chosenServiceCode,
      })),
    };
  }

  if (path === '/api/auth/forget-password' && method === 'POST') {
    const identifier = String(body.identifier || '').trim();
    const cleanVerify = String(body.verifyPhone || '').trim().toLowerCase();
    const verifyDigits = normalizeStaticPhone(cleanVerify);
    const candidates = db.users.filter(u => matchesStaticIdentifier(u, identifier));
    if (candidates.length === 0) return { success: false, message: 'इस आईडी या नंबर से कोई खाता नहीं मिला।' };

    const user = candidates.find(u => {
      const uDigits = normalizeStaticPhone(u.phone || '');
      return (
        (verifyDigits.length === 10 && uDigits === verifyDigits) ||
        (u.phone || '').trim().toLowerCase() === cleanVerify ||
        (u.email || '').trim().toLowerCase() === cleanVerify
      );
    });
    if (!user) return { success: false, message: 'यूजर आईडी और मोबाइल नंबर / ईमेल मेल नहीं खा रहे हैं' };
    user.password = String(body.newPassword || '123456').trim();
    saveDb(db);
    return { success: true, userId: user.userId, fullName: user.fullName, message: 'पासवर्ड सफलतापूर्वक बदल दिया गया!' };
  }

  if (path === '/api/auth/verify-session') {
    const userId = search.get('userId') || '';
    const tok = String(headersObj['x-session-token'] || search.get('token') || '').trim();
    const user = findUser(db, userId);
    if (!user) return { valid: false, accountMissing: true, sessionTerminated: false };
    if (tok && (user.terminatedTokens || []).includes(tok)) {
      return { valid: false, sessionTerminated: true, message: 'आपका यह डिवाइस रिमोटली लॉगआउट कर दिया गया है।' };
    }
    return {
      valid: true,
      user: {
        ...user,
        maxDevices: MAX_STATIC_DEVICES,
        activeSessions: (user.activeSessions || []).map(s => ({ ...s, isCurrent: tok ? s.token === tok : false })),
      },
    };
  }

  // User Dashboard, Profile, Withdraw, Heartbeat, Avatar, Server State
  if (path === '/api/user/heartbeat' && method === 'POST') {
    const u = findUser(db, body.userId);
    if (u) {
      u.isOnline = true;
      u.totalOnlineMinutes = (u.totalOnlineMinutes || 0) + 1;
      saveDb(db);
    }
    return {
      success: true,
      sessionId: body.sessionId || `sess-${Date.now()}`,
      durationMinutes: 1,
      totalOnlineMinutes: u?.totalOnlineMinutes || 1,
      totalDaysPlayed: u?.totalDaysPlayed || 1,
    };
  }
  if (path === '/api/user/session-end' && method === 'POST') {
    return { success: true };
  }

  const userMatch = path.match(/^\/api\/user\/([^/]+)(?:\/(.+))?$/);
  if (userMatch) {
    const userId = decodeURIComponent(userMatch[1]);
    const sub = userMatch[2] || '';
    const user = findUser(db, userId);

    if (!sub && method === 'GET') {
      if (!user) return { success: false, message: 'User not found' };
      return {
        success: true,
        user,
        referrals: db.referrals.filter(r => r.sponsorUserId === user.userId),
        transactions: db.transactions.filter(t => t.userId === user.userId),
        notifications: db.notifications.filter(n => n.userId === user.userId),
        payouts: db.payouts.filter(p => p.userId === user.userId),
      };
    }
    if (!sub && method === 'PUT') {
      if (!user) return { success: false, message: 'User not found' };
      const immutableMut =
        (body.userId !== undefined && String(body.userId).trim() !== user.userId) ||
        (body.gamingId !== undefined && String(body.gamingId).trim() !== (user.gamingId || '')) ||
        (body.personalRoomId !== undefined && String(body.personalRoomId).trim() !== (user.personalRoomId || user.roomAddress || '')) ||
        (body.roomAddress !== undefined && String(body.roomAddress).trim() !== (user.roomAddress || '')) ||
        (body.sponsorId !== undefined && String(body.sponsorId).trim() !== user.sponsorId) ||
        (body.sponsorName !== undefined && String(body.sponsorName).trim() !== user.sponsorName);
      if (immutableMut) {
        return {
          success: false,
          code: 'IMMUTABLE_IDENTITY_LOCKED',
          message: 'Personal User ID, Personal Room ID और Sponsor ID लॉक हैं — इन्हें बदला या डुप्लिकेट नहीं किया जा सकता!',
        };
      }
      const { fullName, username, email, gender, location, fullAddress, paymentAddress, payoutUpiId, bio, houseName, clanName, avatar, coverPhoto, accountType } = body;
      if (username !== undefined) {
        const cleanUsername = normalizeStaticUsername(username);
        if (cleanUsername) {
          if (!isValidStaticUsername(cleanUsername)) {
            return { success: false, code: 'INVALID_USERNAME', message: 'कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें।' };
          }
          if (isStaticUsernameTaken(db.users, cleanUsername, user.userId)) {
            return { success: false, code: 'USERNAME_TAKEN', message: `यूजरनेम "@${cleanUsername}" पहले से किसी दूसरे यूजर के पास है! एक ही यूजरनेम से 2 लोग नहीं हो सकते।` };
          }
          user.username = cleanUsername;
        }
      }
      if (fullName !== undefined && String(fullName).trim()) {
        user.fullName = String(fullName).trim().replace(/\s+/g, ' ');
      }
      if (body.phone !== undefined && String(body.phone).trim()) {
        const cleanNewPhone = normalizeStaticPhone(String(body.phone)) || String(body.phone).trim();
        const phoneConflict = db.users.find(
          u => u.userId !== user.userId && normalizeStaticPhone(u.phone || '') === cleanNewPhone && cleanNewPhone.length >= 10
        );
        if (phoneConflict) {
          return { success: false, code: 'DUPLICATE_PHONE', message: 'यह मोबाइल नंबर पहले से किसी दूसरे यूजर के पास पंजीकृत है।' };
        }
        user.phone = cleanNewPhone;
      }
      if (email !== undefined && String(email).trim()) {
        const cleanNewEmail = String(email).trim().toLowerCase();
        const emailConflict = db.users.find(
          u => u.userId !== user.userId && (u.email || '').trim().toLowerCase() === cleanNewEmail
        );
        if (emailConflict) {
          return { success: false, code: 'DUPLICATE_EMAIL', message: 'यह ईमेल पता पहले से किसी दूसरे यूजर के खाते में जुड़ा है।' };
        }
        user.email = cleanNewEmail;
      }
      if (gender !== undefined) user.gender = String(gender);
      if (location !== undefined) user.location = String(location).trim().slice(0, 80);
      if (body.birthday !== undefined) user.birthday = String(body.birthday).trim().slice(0, 32);
      if (body.showEspShowOnHome !== undefined) user.showEspShowOnHome = Boolean(body.showEspShowOnHome);
      if (body.priceTag !== undefined) user.priceTag = String(body.priceTag).trim().slice(0, 40);
      if (body.vipTitle !== undefined) user.vipTitle = String(body.vipTitle).trim().slice(0, 40);
      if (fullAddress !== undefined) user.fullAddress = String(fullAddress);
      if (paymentAddress !== undefined) {
        user.paymentAddress = String(paymentAddress);
        user.payoutUpiId = String(payoutUpiId || paymentAddress);
      } else if (payoutUpiId !== undefined) {
        user.payoutUpiId = String(payoutUpiId);
      }
      if (bio !== undefined) user.bio = String(bio);
      if (houseName) user.houseName = String(houseName);
      if (clanName) user.clanName = String(clanName);
      if (avatar !== undefined) user.avatar = avatar;
      if (coverPhoto !== undefined) user.coverPhoto = coverPhoto;
      if (accountType === 'business' || accountType === 'gamer') {
        user.accountType = accountType;
      }
      trackStaticTask(user, 'profile_completed', 1);
      saveDb(db);
      return { success: true, user };
    }
    if (sub === 'avatar' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      user.avatar = body.avatar;
      trackStaticTask(user, 'profile_completed', 1);
      saveDb(db);
      return { success: true, message: 'Avatar updated', avatar: user.avatar, user };
    }
    if (sub === 'server-state' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      if (body.roomTheme && (body.roomTheme === 'default_dark' || (user.unlockedRooms || []).includes(body.roomTheme))) {
        user.roomTheme = body.roomTheme;
      }
      if (body.voiceEffect) user.voiceEffect = body.voiceEffect;
      saveDb(db);
      return { success: true, user };
    }
    if (sub === 'withdraw' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      const amt = Number(body.amount) || 0;
      if (amt < db.settings.minWithdrawal || amt > user.balance) {
        return { success: false, message: 'अमान्य विथड्रॉल राशि' };
      }
      user.balance -= amt;
      const payout: PayoutRequest = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        userId: user.userId,
        userName: user.fullName,
        userPhone: user.phone,
        amount: amt,
        payoutAddress: body.payoutAddress || user.payoutUpiId,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
      };
      db.payouts.unshift(payout);
      db.transactions.unshift({
        id: `TXN-WD-${Date.now().toString().slice(-6)}`,
        userId: user.userId,
        amount: amt,
        type: 'withdrawal',
        description: `Withdrawal Request ₹${amt} -> ${payout.payoutAddress} (Escrow Pending)`,
        date: new Date().toISOString(),
        status: 'pending',
        referenceId: payout.id,
      });
      saveDb(db);
      return { success: true, message: 'विथड्रॉल रिक्वेस्ट सबमिट हो गई!', payout, user };
    }
    if (sub === 'workspace-state' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      user.workspaceState = {
        ...(user.workspaceState || {}),
        ...(body.lastTab !== undefined ? { lastTab: String(body.lastTab) } : {}),
        ...(body.lastGamingSubTab !== undefined ? { lastGamingSubTab: String(body.lastGamingSubTab) } : {}),
        ...(body.lastDashboardTab !== undefined ? { lastDashboardTab: String(body.lastDashboardTab) } : {}),
        ...(body.lastRoomAddress !== undefined ? { lastRoomAddress: String(body.lastRoomAddress) } : {}),
        updatedAt: new Date().toISOString(),
      };
      saveDb(db);
      return { success: true, workspaceState: user.workspaceState };
    }
    if (sub === 'profile-history') return { success: true, history: db.profileHistory.filter(h => h.userId === userId) };
    if (sub === 'session-history') return { success: true, sessions: db.activitySessions.filter(s => s.userId === userId) };
    if (sub === 'terminate-session') {
      if (!user) return { success: false, message: 'User not found' };
      if (!Array.isArray(user.activeSessions)) user.activeSessions = [];
      if (!Array.isArray(user.terminatedTokens)) user.terminatedTokens = [];
      if (body.terminateAllOthers && body.currentSessionToken) {
        user.activeSessions.forEach(s => {
          if (s.token && s.token !== body.currentSessionToken) user.terminatedTokens!.unshift(s.token);
        });
        user.activeSessions = user.activeSessions.filter(s => s.token === body.currentSessionToken);
      } else if (body.sessionId) {
        user.activeSessions.forEach(s => {
          if (s.sessionId === body.sessionId && s.token) user.terminatedTokens!.unshift(s.token);
        });
        user.activeSessions = user.activeSessions.filter(s => s.sessionId !== body.sessionId);
      }
      saveDb(db);
      return {
        success: true,
        message: 'Session closed',
        activeSessions: user.activeSessions.map(s => ({ ...s, isCurrent: s.token === body.currentSessionToken })),
      };
    }
  }

  // Chatbot
  if (path === '/api/chat' && method === 'POST') {
    return {
      reply: `नमस्ते! ESP Platform (10 Services: EMO, MMO, MOM, OES, MMS, NWI, SWI ₹300, TWI, PROMOTE, REFER) में आपका स्वागत है। किसी भी सहायता के लिए WhatsApp ${db.settings.whatsappNumber} पर संपर्क करें।`,
      options: ['10 Services Details', 'NWI 3-Level Income', 'SWI 3.3% App', 'Gaming Coins'],
      time: new Date().toLocaleTimeString(),
    };
  }

  // NWI
  if (path.startsWith('/api/nwi/tree/')) {
    const uid = decodeURIComponent(path.replace('/api/nwi/tree/', ''));
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    return { success: true, tree: buildNwiTree(db, user) };
  }
  if (path === '/api/nwi/claim-level-reward' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const tree = buildNwiTree(db, user);
    if (tree.pendingToClaim <= 0) {
      return { success: false, message: 'अभी कोई नया NWI 3-लेवल क्लेम पेंडिंग नहीं है।', tree };
    }
    const allIds = [...tree.level1Members, ...tree.level2Members, ...tree.level3Members].map(m => m.userId);
    user.nwiClaimedMemberIds = Array.from(new Set([...(user.nwiClaimedMemberIds || []), ...allIds]));
    user.balance += tree.pendingToClaim;
    user.totalEarnings += tree.pendingToClaim;
    saveDb(db);
    return { success: true, message: `₹${tree.pendingToClaim} NWI इनकम वॉलेट में क्रेडिट हुई!`, claimedAmount: tree.pendingToClaim, newBalance: user.balance, user, tree: buildNwiTree(db, user) };
  }
  if (path === '/api/nwi/activate' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    user.chosenServiceCode = 'NWI';
    user.chosenServiceName = 'NON WORKING INCOME (NWI)';
    user.joiningFee = Number(body.tierFee) || 200;
    saveDb(db);
    return { success: true, message: `NWI ₹${user.joiningFee} सक्रिय हुआ!`, tree: buildNwiTree(db, user), user };
  }

  // Upgrade Plan & Same-ID Gamer -> Business Conversion
  if (path === '/api/users/upgrade-plan' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const isGamerConv = user.accountType === 'gamer' || body.upgradeType === 'gamer_to_business';
    const srv = db.services.find(s => s.code === String(body.targetServiceCode || 'EMO').toUpperCase()) || db.services[0];
    const reqObj: PlanUpgradeRequest = {
      id: `UPG-${Date.now().toString().slice(-6)}`,
      userId: user.userId,
      userName: user.fullName,
      fromAccountType: user.accountType || 'business',
      upgradeType: isGamerConv ? 'gamer_to_business' : 'plan_upgrade',
      fromServiceCode: user.chosenServiceCode || (user.accountType === 'gamer' ? 'GAME' : 'EMO'),
      fromFee: user.joiningFee || 0,
      targetServiceCode: srv.code,
      targetServiceName: srv.name,
      upgradeFee: Number(body.upgradeFee) || (isGamerConv ? 10 : 100),
      paymentUtr: String(body.paymentUtr || '').trim() || 'UTR',
      paymentScreenshot: body.paymentScreenshot || undefined,
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.planUpgrades.unshift(reqObj);
    saveDb(db);
    return {
      success: true,
      message: isGamerConv
        ? `🎉 आपकी वही ID (${user.userId}) पर ${srv.code} अपग्रेड अनुरोध एडमिन को भेजा गया!`
        : 'प्लान अपग्रेड अनुरोध Admin को भेजा गया!',
      request: reqObj,
    };
  }

  // Moments, Chat, Contacts
  if (path === '/api/moments' && method === 'GET') return { success: true, moments: db.moments };
  if (path === '/api/moments' && method === 'POST') {
    const m: Moment = {
      id: `moment-${Date.now()}`,
      userId: body.userId || 'usr-guest',
      userName: body.userName || 'ESP Member',
      userRollNumber: body.userRollNumber || 'ESP',
      userAvatar: body.userAvatar,
      caption: String(body.caption || '').trim(),
      imageUrl: body.imageUrl,
      serviceTag: body.serviceTag || 'LIFE MOMENT',
      ...(body.postStyle ? { postStyle: body.postStyle } : {}),
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      sharesCount: 0,
    };
    db.moments.unshift(m);
    const author = findUser(db, body.userId);
    if (author) trackStaticTask(author, 'moment_posted', 1);
    saveDb(db);
    return { success: true, moment: m };
  }
  if (path.match(/^\/api\/moments\/[^/]+$/) && method === 'DELETE') {
    const id = path.split('/')[3];
    const reqUid = String(body.userId || search.get('userId') || '').toLowerCase();
    const idx = db.moments.findIndex(x => x.id === id);
    if (idx === -1) return { success: false, message: 'Moment not found' };
    const target = db.moments[idx];
    const isOwner = Boolean(
      reqUid &&
        (target.userId?.toLowerCase() === reqUid || target.userRollNumber?.toLowerCase() === reqUid)
    );
    if (!isOwner && reqUid !== 'usr-admin') {
      return { success: false, message: 'आप केवल अपना पोस्ट किया गया मोमेंट ही डिलीट कर सकते हैं।' };
    }
    db.moments.splice(idx, 1);
    saveDb(db);
    return { success: true, deletedId: id, message: 'Moment deleted successfully!' };
  }
  if (path.match(/^\/api\/moments\/[^/]+\/like$/)) {
    const id = path.split('/')[3];
    const m = db.moments.find(x => x.id === id);
    if (m && body.userId) {
      if (m.likes.includes(body.userId)) m.likes = m.likes.filter(u => u !== body.userId);
      else m.likes.push(body.userId);
      saveDb(db);
    }
    return { success: true, likes: m?.likes || [] };
  }
  if (path.match(/^\/api\/moments\/[^/]+\/comment$/)) {
    const id = path.split('/')[3];
    const m = db.moments.find(x => x.id === id);
    if (m) {
      m.comments.push({ id: `cmt-${Date.now()}`, ...body, createdAt: new Date().toISOString() });
      saveDb(db);
    }
    return { success: true, comments: m?.comments || [] };
  }
  if (path.match(/^\/api\/moments\/[^/]+\/share$/)) {
    const id = path.split('/')[3];
    const m = db.moments.find(x => x.id === id);
    if (m) { m.sharesCount += 1; saveDb(db); }
    return { success: true };
  }

  if (path === '/api/chat/rooms' && method === 'GET') {
    const realCount = Math.max(1, db.users.length);
    return { success: true, rooms: db.chatRooms.map(r => ({ ...r, membersCount: realCount })) };
  }
  if (path === '/api/chat/rooms' && method === 'POST') {
    const room: ChatRoom = { id: `room-${Date.now()}`, name: body.name, hindiName: body.hindiName, description: body.description || '', category: body.category || 'group', membersCount: 1, lastMessage: 'Room Created', lastMessageTime: 'Just now' };
    db.chatRooms.push(room);
    saveDb(db);
    return { success: true, room };
  }
  if (path.startsWith('/api/chat/messages/') && method === 'GET') {
    const roomId = path.split('/').pop();
    return { success: true, messages: db.chatMessages.filter(m => m.roomId === roomId) };
  }
  if (path === '/api/chat/messages' && method === 'POST') {
    const msg: ClubChatMessage = { id: `msg-${Date.now()}`, ...body, createdAt: new Date().toISOString(), likes: 0 };
    db.chatMessages.push(msg);
    const sender = findUser(db, body.senderId);
    if (sender) trackStaticTask(sender, 'chat_sent', 1);
    saveDb(db);
    return { success: true, message: msg };
  }
  if (path.startsWith('/api/chat/contacts/') && method === 'GET') {
    const uid = path.split('/').pop();
    return { success: true, contacts: db.contacts.filter(c => c.userId === uid) };
  }
  if (path === '/api/chat/contacts' && method === 'POST') {
    const contact: UserContact = { id: `ct-${Date.now()}`, ...body, addedAt: new Date().toISOString() };
    db.contacts.push(contact);
    saveDb(db);
    return { success: true, contact };
  }

  // Real Daily Tasks (+5 Coins & EXP)
  if (path.startsWith('/api/tasks/') && method === 'GET') {
    const uid = decodeURIComponent(path.replace('/api/tasks/', ''));
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const tasks = REAL_TASKS_CATALOG.map(t => {
      const p = Number(user.taskProgress?.[t.eventType] || 0);
      return {
        ...t,
        currentProgress: Math.min(p, t.targetCount),
        isCompleted: p >= t.targetCount,
        isClaimed: (user.claimedTaskIds || []).includes(t.id),
      };
    });
    const claimedCount = (user.claimedTaskIds || []).length;
    const chests = CHEST_MILESTONES.map(ch => ({
      ...ch,
      isUnlocked: claimedCount >= ch.requiredTasksCompleted,
      isClaimed: (user.claimedChestMilestones || []).includes(ch.id),
    }));
    saveDb(db);
    return {
      success: true,
      tasks,
      chests,
      todayActiveness: Number(user.todayActiveness || 0),
      activenessChests: getStaticActivenessChests(user),
      growthTasks: getStaticGrowthTasks(db, user),
      familyTasks: getStaticFamilyTasks(user),
      claimedTodayCount: claimedCount,
      claimedChestMilestones: user.claimedChestMilestones || [],
      tasksCompletedCount: user.tasksCompletedCount || 0,
      timeMeta: getLiveIstTimeMeta(),
      user,
    };
  }
  if (path === '/api/tasks/track' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    trackStaticTask(user, body.eventType, Number(body.increment) || 1);
    saveDb(db);
    return { success: true, user };
  }
  if (path === '/api/tasks/claim' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const t = REAL_TASKS_CATALOG.find(x => x.id === body.taskId);
    if (!t) return { success: false, message: 'Task not found' };
    const p = Number(user.taskProgress?.[t.eventType] || 0);
    if (p < t.targetCount) {
      return { success: false, code: 'TASK_NOT_COMPLETED', message: `Complete "${t.title}" (${p}/${t.targetCount}) first.` };
    }
    if ((user.claimedTaskIds || []).includes(t.id)) {
      return { success: false, message: 'Already claimed today!' };
    }
    const before = user.coins || 0;
    const vipCfg = getVipConfig(user.vipTier);
    const xpEarned = Math.round(t.xpReward * (vipCfg?.bonusXpMultiplier || 1));
    const activenessEarned = Number(t.activenessReward || 15);
    user.coins = before + t.coinReward;
    user.gameXp = (user.gameXp || 0) + xpEarned;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.claimedTaskIds!.push(t.id);
    user.tasksCompletedCount = (user.tasksCompletedCount || 0) + 1;
    user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + activenessEarned);
    pushStaticCoinTx(db, user, {
      type: 'credit',
      category: 'daily_task',
      categoryLabel: 'Daily Task Reward',
      amount: t.coinReward,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${t.title}: +${t.coinReward} Coins & +${xpEarned} EXP`,
    });
    saveDb(db);
    return {
      success: true,
      message: `Claimed +${t.coinReward} Coins, +${activenessEarned} Activeness & +${xpEarned} EXP!`,
      coinsEarned: t.coinReward,
      coinsAwarded: t.coinReward,
      xpEarned,
      xpAwarded: xpEarned,
      activenessEarned,
      todayActiveness: user.todayActiveness,
      activenessChests: getStaticActivenessChests(user),
      newBalance: user.coins,
      user,
    };
  }
  if (path === '/api/tasks/claim-activeness-chest' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const chest = ACTIVENESS_CHESTS_CATALOG.find(c => c.threshold === Number(body.threshold));
    if (!chest) return { success: false, message: 'Activeness chest not found' };
    if (Number(user.todayActiveness || 0) < chest.threshold) {
      return { success: false, message: `Reach ${chest.threshold} Activeness first.` };
    }
    if ((user.claimedActivenessChests || []).includes(chest.threshold)) {
      return { success: false, message: 'Already claimed today!' };
    }
    const before = user.coins || 0;
    user.coins = before + chest.coinReward;
    user.gameXp = (user.gameXp || 0) + chest.xpReward;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.claimedActivenessChests!.push(chest.threshold);
    pushStaticCoinTx(db, user, {
      type: 'credit',
      category: 'task_chest',
      categoryLabel: 'Activeness Chest Reward',
      amount: chest.coinReward,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${chest.label}: +${chest.coinReward} Coins & +${chest.xpReward} EXP`,
    });
    saveDb(db);
    return {
      success: true,
      message: `${chest.label} Opened! +${chest.coinReward} Coins & +${chest.xpReward} EXP!`,
      coinsEarned: chest.coinReward,
      xpEarned: chest.xpReward,
      activenessChests: getStaticActivenessChests(user),
      user,
    };
  }
  if (path === '/api/tasks/claim-growth' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const growthTasks = getStaticGrowthTasks(db, user);
    const task = growthTasks.find(t => t.id === body.taskId);
    if (!task) return { success: false, message: 'Growth milestone not found' };
    if (!task.isCompleted) return { success: false, message: `Complete "${task.title}" first.` };
    if (task.isClaimed) return { success: false, message: 'Already claimed!' };
    const before = user.coins || 0;
    user.coins = before + task.coinReward;
    user.gameXp = (user.gameXp || 0) + task.xpReward;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.claimedGrowthTaskIds!.push(task.id);
    pushStaticCoinTx(db, user, {
      type: 'credit',
      category: 'daily_task',
      categoryLabel: 'Growth Milestone Reward',
      amount: task.coinReward,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `Growth "${task.title}": +${task.coinReward} Coins & +${task.xpReward} EXP`,
    });
    saveDb(db);
    return {
      success: true,
      message: `Growth Unlocked! +${task.coinReward} Coins & +${task.xpReward} EXP!`,
      coinsEarned: task.coinReward,
      xpEarned: task.xpReward,
      growthTasks: getStaticGrowthTasks(db, user),
      user,
    };
  }
  if (path === '/api/tasks/claim-family' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const familyTasks = getStaticFamilyTasks(user);
    const task = familyTasks.find(t => t.id === body.taskId);
    if (!task) return { success: false, message: 'Family task not found' };
    if (!task.isCompleted) return { success: false, message: `Complete "${task.title}" first.` };
    if (task.isClaimed) return { success: false, message: 'Already claimed today!' };
    const before = user.coins || 0;
    user.coins = before + task.coinReward;
    user.gameXp = (user.gameXp || 0) + task.xpReward;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.claimedFamilyTaskIds!.push(task.id);
    user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + task.activenessReward);
    pushStaticCoinTx(db, user, {
      type: 'credit',
      category: 'daily_task',
      categoryLabel: 'Family Task Reward',
      amount: task.coinReward,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `Family "${task.title}": +${task.coinReward} Coins & +${task.xpReward} EXP`,
    });
    saveDb(db);
    return {
      success: true,
      message: `Family Task Claimed! +${task.coinReward} Coins, +${task.activenessReward} Activeness!`,
      coinsEarned: task.coinReward,
      xpEarned: task.xpReward,
      activenessEarned: task.activenessReward,
      todayActiveness: user.todayActiveness,
      activenessChests: getStaticActivenessChests(user),
      familyTasks: getStaticFamilyTasks(user),
      user,
    };
  }
  if (path === '/api/tasks/claim-chest' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    normalizeStaticUser(user);
    const ch = CHEST_MILESTONES.find(c => c.id === body.chestId);
    if (!ch) return { success: false, message: 'Chest not found' };
    const claimedCount = (user.claimedTaskIds || []).length;
    if (claimedCount < ch.requiredTasksCompleted) {
      return { success: false, message: `पहले आज के ${ch.requiredTasksCompleted} टास्क पूरे करें।` };
    }
    if ((user.claimedChestMilestones || []).includes(ch.id)) {
      return { success: false, message: 'यह चेस्ट पहले ही खोला जा चुका है!' };
    }
    const before = user.coins || 0;
    user.coins = before + ch.coinReward;
    user.gameXp = (user.gameXp || 0) + ch.xpReward;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.claimedChestMilestones!.push(ch.id);
    pushStaticCoinTx(db, user, {
      type: 'credit',
      category: 'task_chest',
      categoryLabel: 'टास्क माइलस्टोन चेस्ट',
      amount: ch.coinReward,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${ch.hindiLabel}: +${ch.coinReward} कॉइन्स व +${ch.xpReward} EXP`,
    });
    saveDb(db);
    return { success: true, message: `🎁 +${ch.coinReward} कॉइन्स व +${ch.xpReward} EXP प्राप्त हुए!`, coinsEarned: ch.coinReward, xpEarned: ch.xpReward, newBalance: user.coins, user };
  }

  // Frame, VIP & Room Store
  if (path === '/api/store/buy-frame' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const frame = getFrameByVariant(body.frameId);
    if (!Array.isArray(user.unlockedFrames)) user.unlockedFrames = ['standard'];
    if (user.unlockedFrames.includes(frame.variant) || frame.coinPrice === 0) {
      if (!user.unlockedFrames.includes(frame.variant)) user.unlockedFrames.push(frame.variant);
      user.frameType = frame.variant;
      saveDb(db);
      return { success: true, message: `${frame.hindiName} सक्रिय हो गया!`, user };
    }
    const before = user.coins || 0;
    if (before < frame.coinPrice) {
      return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: frame.coinPrice, currentCoins: before, message: `${frame.hindiName} फ्रेम के लिए ${frame.coinPrice} कॉइन्स चाहिए। आपके पास ${before} हैं।` };
    }
    user.coins = before - frame.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + frame.coinPrice;
    user.unlockedFrames.push(frame.variant);
    user.frameType = frame.variant;
    pushStaticCoinTx(db, user, {
      type: 'debit',
      category: 'frame_purchase',
      categoryLabel: 'अवतार फ्रेम खरीद',
      amount: frame.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${frame.hindiName} [${frame.quality}] फ्रेम (-${frame.coinPrice} कॉइन्स)`,
    });
    saveDb(db);
    return { success: true, message: `🎉 ${frame.hindiName} फ्रेम खरीदा व लागू हो गया!`, newBalance: user.coins, user };
  }
  if (path === '/api/store/equip-frame' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const frame = getFrameByVariant(body.frameId);
    const owned = user.unlockedFrames || ['standard'];
    if (frame.coinPrice > 0 && !owned.includes(frame.variant) && !owned.includes(frame.id)) {
      return { success: false, code: 'FRAME_LOCKED', requiredCoins: frame.coinPrice, currentCoins: user.coins || 0, message: `यह फ्रेम लॉक है! पहले ${frame.coinPrice} कॉइन्स से खरीदें।` };
    }
    user.frameType = frame.variant;
    saveDb(db);
    return { success: true, message: `${frame.hindiName} फ्रेम सेट हुआ!`, user };
  }
  if (path === '/api/store/buy-vip' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const vip = VIP_TIERS.find(v => v.id === body.vipTier);
    if (!vip) return { success: false, message: 'अमान्य VIP प्लान' };
    const orderMap: Record<string, number> = { none: 0, silver: 1, gold: 2, diamond: 3 };
    if ((orderMap[user.vipTier || 'none'] || 0) >= (orderMap[vip.id] || 0)) {
      return { success: false, message: 'यह या उच्च VIP स्तर पहले से सक्रिय है!' };
    }
    const before = user.coins || 0;
    if (before < vip.coinPrice) {
      return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: vip.coinPrice, currentCoins: before, message: `${vip.hindiName} के लिए ${vip.coinPrice} कॉइन्स चाहिए। आपके पास ${before} हैं।` };
    }
    user.coins = before - vip.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + vip.coinPrice;
    user.vipTier = vip.id;
    user.vipTitle = vip.badgeText;
    user.vipPurchasedAt = new Date().toISOString();
    if (vip.id === 'diamond') user.crownPost = true;
    pushStaticCoinTx(db, user, {
      type: 'debit',
      category: 'vip_purchase',
      categoryLabel: 'VIP खरीद',
      amount: vip.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${vip.hindiName} सक्रिय (-${vip.coinPrice} कॉइन्स)`,
    });
    saveDb(db);
    return { success: true, message: `👑 ${vip.hindiName} सक्रिय हो गया!`, newBalance: user.coins, user };
  }
  if (path === '/api/store/buy-room' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const theme = ADVANCE_ROOM_THEMES.find(t => t.id === body.roomId);
    if (!theme) return { success: false, message: 'Room theme not found' };
    if (!Array.isArray(user.unlockedRooms)) user.unlockedRooms = ['default_dark'];
    if (user.unlockedRooms.includes(theme.id) || theme.coinPrice === 0) {
      if (!user.unlockedRooms.includes(theme.id)) user.unlockedRooms.push(theme.id);
      user.roomTheme = theme.id;
      saveDb(db);
      return { success: true, message: `${theme.name} थीम सक्रिय!`, user };
    }
    const before = user.coins || 0;
    if (before < theme.coinPrice) {
      return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: theme.coinPrice, currentCoins: before, message: `"${theme.name}" के लिए ${theme.coinPrice} कॉइन्स चाहिए। आपके पास ${before} हैं।` };
    }
    user.coins = before - theme.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + theme.coinPrice;
    user.unlockedRooms.push(theme.id);
    user.roomTheme = theme.id;
    pushStaticCoinTx(db, user, {
      type: 'debit',
      category: 'room_purchase',
      categoryLabel: 'रूम थीम खरीद',
      amount: theme.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${theme.name} थीम (-${theme.coinPrice} कॉइन्स)`,
    });
    saveDb(db);
    return { success: true, message: `🏛️ "${theme.name}" थीम अनलॉक!`, newBalance: user.coins, user };
  }

  // Gaming, Coins, Voice Rooms, Bots, Community
  if (path === '/api/game/bots') return { success: true, bots: DEFAULT_BOTS };
  if (path === '/api/community/real-players') return { success: true, players: db.users };
  if (path === '/api/community/leaderboard') {
    const rawPeriod = (search.get('period') || 'daily').toLowerCase();
    const period: 'daily' | 'weekly' | 'monthly' | 'all' =
      rawPeriod === 'weekly' || rawPeriod === 'monthly' || rawPeriod === 'all' ? rawPeriod : 'daily';
    const vipW = (t?: string) => (t === 'diamond' ? 200 : t === 'gold' ? 120 : t === 'silver' ? 60 : 0);
    const enriched = [...db.users].map(u => {
      const c = u.coins || 0;
      const ch = u.charms || 0;
      const xp = u.gameXp || (u.gameLevel || 1) * 150;
      const periodScore =
        period === 'daily'
          ? Math.round(c * 0.25 + ch * 0.5 + xp * 0.2) + vipW(u.vipTier)
          : period === 'weekly'
          ? Math.round(c * 0.55 + ch * 0.8 + xp * 0.45) + vipW(u.vipTier) * 2
          : Math.round(c * 0.85 + ch + xp * 0.75) + vipW(u.vipTier) * 3;
      return {
        userId: u.userId,
        username: u.username || '',
        fullName: u.fullName,
        avatar: u.avatar || '',
        gameLevel: u.gameLevel || 1,
        gameXp: u.gameXp || 0,
        charms: u.charms || 0,
        coins: u.coins || 0,
        vipTier: u.vipTier || 'none',
        vipTitle: u.vipTitle || '',
        frameType: u.frameType || 'standard',
        roomAddress: u.roomAddress || '',
        isVipRoom: Boolean(u.isVipRoom),
        isOnline: Boolean(u.isOnline),
        clanName: u.clanName || 'Royal Warriors ESP',
        chosenServiceCode: u.chosenServiceCode || 'GAME',
        tasksCompletedCount: u.tasksCompletedCount || 0,
        periodScore,
        periodCoins: c,
        periodGames: 0,
        periodCharms: ch,
      };
    });
    const leaderboard = enriched
      .sort((a, b) => b.periodScore - a.periodScore || b.gameXp - a.gameXp)
      .slice(0, 50)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));
    return { success: true, period, leaderboard, topEarners: leaderboard };
  }
  if (path === '/api/referrals/track-click' && method === 'POST') {
    const raw = String(body.sponsorIdentifier || '').trim().replace(/^@+/, '');
    if (!raw) return { success: false, message: 'Missing sponsor identifier' };
    const cleanHandle = normalizeStaticUsername(raw);
    const sponsor = db.users.find(
      u =>
        u.userId.toLowerCase() === raw.toLowerCase() ||
        (cleanHandle && normalizeStaticUsername(u.username) === cleanHandle)
    );
    if (!sponsor) return { success: false, message: 'Sponsor not found' };
    const today = todayStr();
    sponsor.referralClicks = Number(sponsor.referralClicks || 0) + 1;
    if (!Array.isArray(sponsor.referralClickHistory)) sponsor.referralClickHistory = [];
    const ex = sponsor.referralClickHistory.find(h => h.date === today);
    if (ex) ex.count = Number(ex.count || 0) + 1;
    else sponsor.referralClickHistory.push({ date: today, count: 1 });
    saveDb(db);
    return { success: true, sponsorUserId: sponsor.userId, referralClicks: sponsor.referralClicks };
  }
  if (path === '/api/community/top-referrers' && method === 'GET') {
    const currentUserId = (search.get('userId') || '').trim().toLowerCase();
    const statsMap = new Map<string, { total: number; converted: number; pending: number; creditedEarnings: number }>();
    for (const r of db.referrals || []) {
      const k = String(r.sponsorUserId || '').toLowerCase();
      if (!k) continue;
      const p = statsMap.get(k) || { total: 0, converted: 0, pending: 0, creditedEarnings: 0 };
      p.total += 1;
      if (r.status === 'credited') {
        p.converted += 1;
        p.creditedEarnings += Number(r.commissionAmount || 0);
      } else if (r.status === 'pending') {
        p.pending += 1;
      }
      statsMap.set(k, p);
    }
    const rankedAll = db.users
      .map(u => {
        const st = statsMap.get(u.userId.toLowerCase()) || { total: 0, converted: 0, pending: 0, creditedEarnings: 0 };
        const effectiveClicks = Math.max(Number(u.referralClicks || 0), st.total);
        const conversionRate =
          effectiveClicks > 0 ? Math.min(100, Number(((st.converted / effectiveClicks) * 100).toFixed(1))) : 0;
        return {
          userId: u.userId,
          username: u.username || '',
          fullName: u.fullName,
          avatar: u.avatar || '',
          vipTier: u.vipTier || 'none',
          gameLevel: u.gameLevel || 1,
          chosenServiceCode: u.chosenServiceCode || 'ESP',
          totalReferrals: st.total,
          convertedReferrals: st.converted,
          pendingReferrals: st.pending,
          totalClicks: effectiveClicks,
          conversionRate,
          referralEarnings: Math.max(Number(u.referralEarnings || 0), st.creditedEarnings),
        };
      })
      .sort(
        (a, b) =>
          b.convertedReferrals - a.convertedReferrals ||
          b.totalReferrals - a.totalReferrals ||
          b.referralEarnings - a.referralEarnings ||
          b.conversionRate - a.conversionRate ||
          b.gameLevel - a.gameLevel
      )
      .map((entry, idx) => ({ rank: idx + 1, ...entry }));

    const currentUserRank = currentUserId
      ? rankedAll.find(e => e.userId.toLowerCase() === currentUserId) || null
      : null;

    return {
      success: true,
      topReferrers: rankedAll.slice(0, 5),
      currentUserRank,
      totalRankedUsers: rankedAll.length,
    };
  }
  if (path === '/api/community/clans') {
    const clanMap = new Map<string, { clanName: string; membersCount: number; totalXp: number; totalCharms: number; leaderName: string; leaderId: string }>();
    db.users.forEach(u => {
      const cn = (u.clanName || 'Royal Warriors ESP').trim();
      const ex = clanMap.get(cn);
      if (!ex) clanMap.set(cn, { clanName: cn, membersCount: 1, totalXp: u.gameXp || 0, totalCharms: u.charms || 0, leaderName: u.fullName, leaderId: u.userId });
      else { ex.membersCount += 1; ex.totalXp += (u.gameXp || 0); ex.totalCharms += (u.charms || 0); }
    });
    return { success: true, clans: Array.from(clanMap.values()).sort((a, b) => b.totalXp - a.totalXp) };
  }
  if (path === '/api/users/check-username') {
    const raw = search.get('username') || '';
    const currentUserId = search.get('currentUserId') || '';
    const normalized = normalizeStaticUsername(raw);
    if (!normalized) {
      return { success: true, valid: false, available: false, normalized: '', message: 'कृपया यूजरनेम दर्ज करें (कम से कम 3 अक्षर)' };
    }
    if (!isValidStaticUsername(normalized)) {
      return { success: true, valid: false, available: false, normalized, message: 'कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें' };
    }
    const taken = isStaticUsernameTaken(db.users, normalized, currentUserId);
    return {
      success: true,
      valid: true,
      available: !taken,
      normalized,
      message: taken ? `@${normalized} पहले से किसी दूसरे यूजर ने लिया है!` : `✓ @${normalized} उपलब्ध है!`,
    };
  }
  if (path === '/api/users/search') {
    const rawQ = (search.get('q') || '').trim();
    const cleanHandle = normalizeStaticUsername(rawQ);
    const qLower = rawQ.toLowerCase();
    const currentUserId = search.get('currentUserId') || '';
    const viewer = currentUserId ? findUser(db, currentUserId) : undefined;
    const viewerFriends = new Set(viewer?.friendsList || []);
    const users = db.users
      .filter(u => {
        if (!qLower) return true;
        return (
          (cleanHandle && normalizeStaticUsername(u.username).includes(cleanHandle)) ||
          (u.fullName || '').toLowerCase().includes(qLower) ||
          (u.userId || '').toLowerCase().includes(qLower) ||
          (u.gamingId || '').toLowerCase().includes(qLower)
        );
      })
      .slice(0, 30)
      .map(u => ({
        userId: u.userId,
        gamingId: u.gamingId || `GAME-${u.userId}`,
        username: u.username || '',
        fullName: u.fullName,
        avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
        coverPhoto: u.coverPhoto || '',
        location: u.location || 'India',
        gender: u.gender || 'male',
        bio: u.bio || '',
        vipTier: u.vipTier || 'none',
        vipTitle: u.vipTitle || '',
        frameType: u.frameType || 'standard',
        gameLevel: u.gameLevel || 1,
        gameXp: u.gameXp || 0,
        coins: u.coins || 0,
        charms: u.charms || 0,
        clanName: u.clanName || 'Royal Warriors ESP',
        friendsCount: (u.friendsList || []).length,
        isFriend: viewerFriends.has(u.userId),
        isOnline: Boolean(u.isOnline),
      }));
    return { success: true, users };
  }
  if (path === '/api/friends/toggle' && method === 'POST') {
    const user = findUser(db, body.userId);
    const target = findUser(db, body.targetUserId) || db.users.find(u => normalizeStaticUsername(u.username) === normalizeStaticUsername(body.targetUserId));
    if (!user || !target) return { success: false, message: 'User or target player not found' };
    if (user.userId === target.userId) return { success: false, message: 'आप खुद को फ्रेंड लिस्ट में नहीं जोड़ सकते।' };
    if (!Array.isArray(user.friendsList)) user.friendsList = [];
    if (!Array.isArray(target.friendsList)) target.friendsList = [];
    const already = user.friendsList.includes(target.userId);
    if (already) {
      user.friendsList = user.friendsList.filter(id => id !== target.userId);
      target.friendsList = target.friendsList.filter(id => id !== user.userId);
    } else {
      user.friendsList.push(target.userId);
      if (!target.friendsList.includes(user.userId)) target.friendsList.push(user.userId);
    }
    user.friendsCount = user.friendsList.length;
    target.friendsCount = target.friendsList.length;
    saveDb(db);
    return {
      success: true,
      isFriend: !already,
      message: !already ? `✅ ${target.fullName} को फ्रेंड लिस्ट में जोड़ा गया!` : `${target.fullName} को फ्रेंड लिस्ट से हटाया गया।`,
      user,
      targetFriendsCount: target.friendsCount,
    };
  }
  if (path.startsWith('/api/community/player-profile/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    const cleanHandle = normalizeStaticUsername(uid);
    const viewerId = search.get('viewerId') || '';
    const u = findUser(db, uid) || db.users.find(x => cleanHandle && normalizeStaticUsername(x.username) === cleanHandle);
    if (!u) return { success: false, message: 'Player not found' };
    const viewer = viewerId ? findUser(db, viewerId) : undefined;
    const isFriend = Boolean(viewer && Array.isArray(viewer.friendsList) && viewer.friendsList.includes(u.userId));
    const userMoments = (db.moments || []).filter(m => {
      const mUid = (m.userId || '').toLowerCase();
      const mRoll = (m.userRollNumber || '').toLowerCase();
      const targetUid = u.userId.toLowerCase();
      const targetInternalId = (u.id || '').toLowerCase();
      return (
        (mUid && (mUid === targetUid || (targetInternalId && mUid === targetInternalId))) ||
        (mRoll && mRoll === targetUid)
      );
    });
    const giftEntries = Object.values(u.receivedGifts || {});
    const totalGiftsLit = giftEntries.reduce((sum, g) => sum + (Number(g.count) || 0), 0);
    return {
      success: true,
      profile: {
        ...u,
        friendsCount: (u.friendsList || []).length,
        isFriend,
        moments: userMoments,
        momentsCount: userMoments.length,
        giftWall: giftEntries,
        totalGiftsLit,
      },
    };
  }
  if (path === '/api/community/real-online-count') {
    const online = db.users.filter(u => u.isOnline);
    return {
      success: true,
      realCount: online.length,
      onlinePlayers: online.slice(0, 20).map(u => ({
        userId: u.userId,
        fullName: u.fullName,
        avatar: u.avatar,
        gameLevel: u.gameLevel || 1,
        clanName: u.clanName || 'Royal Warriors ESP',
      })),
    };
  }
  if (path === '/api/game/play' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const bet = Math.max(10, Math.round(Number(body.betAmount) || 10));
    const before = user.coins || 0;
    if (before < bet) {
      return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: bet, currentCoins: before, message: `खेलने के लिए ${bet} कॉइन्स चाहिए। आपके पास ${before} हैं।` };
    }
    user.coins = before - bet;
    user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
    trackStaticTask(user, 'game_played', 1);

    if (body.choice === 'direct') {
      db.activeGameWagers[user.userId] = { gameName: body.gameName || 'Arcade', bet, createdAt: new Date().toISOString() };
      user.gameXp = (user.gameXp || 0) + 10;
      user.gameLevel = calculateLevelFromXp(user.gameXp);
      saveDb(db);
      return { success: true, result: 'wager_placed', betAmount: bet, winAmount: 0, newBalance: user.coins, user };
    }
    const win = Math.random() > 0.5;
    const winAmount = win ? bet * 2 : 0;
    user.coins += winAmount;
    if (win) user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    else user.totalGamesLost = (user.totalGamesLost || 0) + 1;
    user.gameXp = (user.gameXp || 0) + (win ? 25 : 10);
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    saveDb(db);
    return { success: true, result: win ? 'win' : 'loss', betAmount: bet, winAmount, newBalance: user.coins, user };
  }
  if (path === '/api/game/claim-win' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const wager = db.activeGameWagers[user.userId];
    if (!wager) return { success: false, message: 'कोई सक्रिय कॉइन बेट नहीं मिला।' };
    const amt = Math.min(Math.max(0, Number(body.winAmount) || 0), Math.max(wager.bet * 10, 500));
    delete db.activeGameWagers[user.userId];
    user.coins = (user.coins || 0) + amt;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + amt;
    saveDb(db);
    return { success: true, currentCoins: user.coins, newBalance: user.coins, user };
  }
  if (path === '/api/game/daily-lucky-spin' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const SPIN_COST = 50;
    if ((user.coins || 0) < SPIN_COST) {
      return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: SPIN_COST, currentCoins: user.coins || 0, message: `स्पिन करने के लिए ${SPIN_COST} कॉइन्स आवश्यक हैं। आपके पास ${user.coins || 0} हैं।` };
    }
    user.coins = (user.coins || 0) - SPIN_COST;
    const prizes = [40, 25, 0, 120, 60, 0, 250, 75];
    const idx = typeof body.targetSectorIndex === 'number' ? body.targetSectorIndex % prizes.length : Math.floor(Math.random() * prizes.length);
    const coinsWon = prizes[idx];
    user.coins = (user.coins || 0) + coinsWon;
    user.gameXp = (user.gameXp || 0) + 25;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.lastDailySpin = new Date().toISOString();
    trackStaticTask(user, 'game_played', 1);
    saveDb(db);
    return { success: true, sectorIndex: idx, coinsWon, coins: user.coins, newBalance: user.coins, user };
  }
  if (path === '/api/game/recharge' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const utr = String(body.paymentUtr || '').replace(/\s+/g, '').toUpperCase();
    if (!/^\d{12}$/.test(utr)) {
      return { success: false, message: 'कृपया सही 12-अंकों का संख्यात्मक UPI UTR नंबर दर्ज करें।' };
    }
    const cleanScreenshot = typeof body.paymentScreenshot === 'string' ? body.paymentScreenshot.trim() : '';
    if (!cleanScreenshot || cleanScreenshot.length < 20) {
      return { success: false, message: 'कृपया UPI भुगतान के बाद पेमेंट स्क्रीनशॉट (Payment Screenshot) जरूर अपलोड करें।' };
    }
    if (db.coinRecharges.find(r => r.paymentUtr === utr && r.status !== 'rejected')) {
      return { success: false, message: 'यह UTR नंबर पहले से दर्ज है!' };
    }
    const pack = COIN_RECHARGE_PACKS.find(p => p.id === body.packId);
    const payAmount = pack ? pack.amount : (Number(body.amount) || 10);
    const baseCoins = pack ? pack.coins : (Number(body.coins) || 100);
    const bonusCoins = pack ? pack.bonus : 0;
    const reqItem: CoinRechargeRequest = {
      id: `CR-${Date.now().toString().slice(-6)}`,
      userId: user.userId,
      userName: user.fullName,
      userPhone: user.phone,
      packId: pack ? pack.id : (body.packId || 'pack'),
      coins: baseCoins,
      bonusCoins,
      amount: payAmount,
      paymentUtr: utr,
      paymentScreenshot: cleanScreenshot,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.coinRecharges.unshift(reqItem);
    db.notifications.unshift({
      id: `notif-admin-cr-${Date.now()}`,
      userId: 'EMO-MOM-MMO',
      title: `🪙 नया कॉइन खरीद अनुरोध: ₹${payAmount} (+${baseCoins + bonusCoins} Coins)`,
      message: `${user.fullName} (${user.userId}) ने ₹${payAmount} भुगतान कर ${baseCoins + bonusCoins} कॉइन्स का अनुरोध भेजा है। 12-अंक UTR: ${utr} (पेमेंट स्क्रीनशॉट संलग्न है)।`,
      date: new Date().toISOString(),
      read: false,
      type: 'payment',
    });
    db.contactMessages.unshift({
      id: `CNT-CR-${Date.now()}`,
      name: user.fullName,
      email: user.email || `${user.userId.toLowerCase()}@esp.local`,
      phone: user.phone,
      subject: `🪙 Coin Buy Request: ₹${payAmount} (+${baseCoins + bonusCoins} Coins) | UTR: ${utr}`,
      message: `यूजर ${user.fullName} (ID: ${user.userId}) ने ₹${payAmount} भुगतान कर ${baseCoins + bonusCoins} कॉइन्स के लिए अनुरोध भेजा है। 12-अंक UTR: ${utr} • पेमेंट स्क्रीनशॉट संलग्न है।`,
      createdAt: new Date().toISOString(),
      status: 'unread',
    });
    saveDb(db);
    return { success: true, message: 'कॉइन रिचार्ज रिक्वेस्ट व स्क्रीनशॉट सबमिट हो गई!', order: reqItem, recharge: reqItem, user };
  }
  if (path === '/api/game/convert' && method === 'POST') {
    return {
      success: false,
      code: 'CONVERSION_DISABLED',
      message: 'कॉइन्स को नकद में बदलने का सिस्टम बंद है। कॉइन्स केवल VIP, फ्रेम, वॉइस गिफ्ट्स व इन-ऐप गेम्स के लिए हैं।',
    };
  }
  if (path === '/api/game/send-gift' && method === 'POST') {
    const user = findUser(db, body.senderId);
    if (!user) return { success: false, message: 'User not found' };
    const cost = Number(body.coinCost) || 10;
    const qty = Math.max(1, Math.round(Number(body.quantity) || 1));
    if ((user.coins || 0) < cost) return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: cost, currentCoins: user.coins || 0, message: 'पर्याप्त कॉइन्स नहीं हैं!' };
    user.coins = (user.coins || 0) - cost;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + cost;
    const charmsVal = Number(body.charmValue) || 10;
    user.charms = (user.charms || 0) + Math.round(charmsVal * 0.2);
    const cleanTargetName = String(body.targetName || '').trim().replace(/^@+/, '').toLowerCase();
    const recipient = body.targetUserId
      ? findUser(db, body.targetUserId)
      : db.users.find(
          u =>
            u.userId.toLowerCase() === cleanTargetName ||
            normalizeStaticUsername(u.username) === cleanTargetName ||
            (u.fullName || '').trim().toLowerCase() === cleanTargetName
        );
    const legacyMap: Record<string, { id: string; name: string; icon: string }> = {
      g1: { id: 'pop_2', name: 'Red Rose', icon: '🌹' },
      g2: { id: 'pop_4', name: 'Choco Delight', icon: '🍫' },
      g3: { id: 'pop_5', name: 'Diamond Ring', icon: '💍' },
      g4: { id: 'lux_1', name: 'Super Ferrari', icon: '🏎️' },
      g5: { id: 'diwali_4', name: 'Sky Rocket Dhamaka', icon: '🚀' },
      g6: { id: 'lux_2', name: 'Emperor Crown', icon: '👑' },
      g7: { id: 'lux_3', name: 'Magic Castle', icon: '🏰' },
    };
    const rawKey = String(body.giftId || body.giftName || 'pop_2').trim();
    const mapped = legacyMap[rawKey];
    const gKey = mapped ? mapped.id : rawKey;
    const gName = mapped ? mapped.name : String(body.giftName || 'Gift').replace(/^\d+x\s+/i, '');
    const gIcon = mapped ? mapped.icon : String(body.giftIcon || '🎁');
    const nowIso = new Date().toISOString();
    if (recipient) {
      if (recipient.userId !== user.userId) {
        recipient.charms = (recipient.charms || 0) + charmsVal;
      }
      if (!recipient.receivedGifts) recipient.receivedGifts = {};
      const prev = recipient.receivedGifts[gKey];
      recipient.receivedGifts[gKey] = {
        id: gKey,
        name: gName,
        icon: gIcon,
        count: (prev?.count || 0) + qty,
        coinCost: Math.round(cost / qty),
        charmValue: Math.round(charmsVal / qty),
        lastReceivedAt: nowIso,
        lastSenderName: user.fullName,
      };
    }
    if (!Array.isArray(db.giftHistory)) db.giftHistory = [];
    const giftRecord: GiftHistoryRecord = {
      id: `GH-${Date.now()}`,
      senderId: user.userId,
      senderName: user.fullName,
      senderAvatar: user.avatar,
      recipientId: recipient?.userId || String(body.targetUserId || body.targetName || 'STAGE'),
      recipientName: recipient?.fullName || String(body.targetName || 'Voice Stage'),
      recipientAvatar: recipient?.avatar,
      giftId: gKey,
      giftName: gName,
      giftIcon: gIcon,
      quantity: qty,
      coinCost: cost,
      charmValue: charmsVal,
      context: body.context === 'family_chat' || body.familyId ? 'family_chat' : 'voice_room',
      roomId: body.roomId,
      familyId: body.familyId,
      createdAt: nowIso,
    };
    db.giftHistory.unshift(giftRecord);
    if (body.familyId && Array.isArray(db.families)) {
      const fam = db.families.find(f => f.id === body.familyId);
      if (fam) {
        fam.familyCharms = (fam.familyCharms || 0) + charmsVal;
        fam.chatMessages.push({
          id: `fgift-${Date.now()}`,
          familyId: fam.id,
          senderId: user.userId,
          senderName: user.fullName,
          senderAvatar: user.avatar,
          text: `${gIcon} ${user.fullName} ने ${recipient?.fullName || body.targetName || fam.name} को ${qty}x ${gName} भेजा!`,
          isGift: true,
          giftId: gKey,
          giftName: gName,
          giftIcon: gIcon,
          giftQuantity: qty,
          recipientName: recipient?.fullName || body.targetName || fam.name,
          coinCost: cost,
          createdAt: nowIso,
        });
      }
    }
    trackStaticTask(user, 'gift_sent', 1);
    saveDb(db);
    return { success: true, coins: user.coins, charms: user.charms, giftRecord, user };
  }
  if (path.startsWith('/api/game/gift-history/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '').toLowerCase();
    const list = db.giftHistory || [];
    const sent = list.filter(g => g.senderId.toLowerCase() === uid);
    const received = list.filter(g => (g.recipientId || '').toLowerCase() === uid);
    return {
      success: true,
      sent,
      received,
      all: list.filter(g => g.senderId.toLowerCase() === uid || (g.recipientId || '').toLowerCase() === uid),
      totalSentCoins: sent.reduce((s, x) => s + x.coinCost, 0),
      totalReceivedCharms: received.reduce((s, x) => s + x.charmValue, 0),
    };
  }
  if (path === '/api/game/record-play' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (user) {
      trackStaticTask(user, 'game_played', 1);
      user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
      db.gamePlayHistory.unshift({
        id: `GP-${Date.now()}`,
        userId: user.userId,
        userName: user.fullName,
        gameId: body.gameId || 'game',
        gameName: body.gameName || 'Game',
        betCoins: Number(body.betCoins) || 0,
        wonCoins: 0,
        netChange: 0,
        result: 'draw',
        durationSeconds: Number(body.durationSeconds) || 30,
        playedAt: new Date().toISOString(),
        details: body.details,
      });
      saveDb(db);
    }
    return { success: true, user };
  }
  if (path.startsWith('/api/game/history/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    return { success: true, history: db.gamePlayHistory.filter(g => g.userId === uid) };
  }
  if (path.startsWith('/api/game/coin-history/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    return { success: true, transactions: db.coinTransactions.filter(t => t.userId === uid) };
  }
  if (path.startsWith('/api/game/user-recharges/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    return { success: true, recharges: db.coinRecharges.filter(r => r.userId === uid) };
  }

  const buildStaticDailyHub = (u: UserProfile) => {
    const today = todayStr();
    const yesterday = getYesterdayDateString(today);
    const intel = getDailyIntelForDate(today);
    const fullQuiz = getDailyQuizForDate(today);
    const spotlightGame = getSpotlightGameForDate(today);

    const timeMeta = getLiveIstTimeMeta();
    const lastCheckIn = u.lastDailyCheckInDate || '';
    const claimedToday = lastCheckIn === today;
    const rawStreak = Number(u.loginStreak || 0);
    const isConsecutiveFromYesterday = Boolean(lastCheckIn && lastCheckIn === yesterday && rawStreak > 0);
    const streakMissedReset = Boolean(lastCheckIn && !claimedToday && !isConsecutiveFromYesterday && rawStreak > 0);
    const effectiveStreak = claimedToday
      ? rawStreak
      : isConsecutiveFromYesterday
      ? rawStreak
      : 0;
    const nextDayNumber = claimedToday
      ? Math.max(1, ((effectiveStreak - 1) % 7) + 1)
      : (effectiveStreak % 7) + 1;
    const schedule = SEVEN_DAY_CHECKIN_REWARDS.map(item => {
      const completedDaysInCycle = claimedToday
        ? ((effectiveStreak - 1) % 7) + 1
        : (effectiveStreak % 7);
      return {
        ...item,
        claimed: !streakMissedReset && item.day <= completedDaysInCycle,
        isToday: !claimedToday && item.day === nextDayNumber,
      };
    });
    const playedToday = u.dailyFreeGameDate === today ? Number(u.dailyFreeGamesPlayed || 0) : 0;
    const coinBoosterActive = Boolean(u.coinBoosterUntil && new Date(u.coinBoosterUntil).getTime() > Date.now());
    const topDailyPlayers = [...db.users]
      .sort((a, b) => (b.gameXp || 0) - (a.gameXp || 0) || (b.coins || 0) - (a.coins || 0))
      .slice(0, 5)
      .map(p => ({
        userId: p.userId,
        fullName: p.fullName,
        username: p.username,
        avatar: p.avatar,
        gameLevel: p.gameLevel || 1,
        gameXp: p.gameXp || 0,
        coins: p.coins || 0,
        totalGamesWon: p.totalGamesWon || 0,
      }));
    return {
      today,
      timeMeta,
      intel,
      quiz: {
        id: fullQuiz.id,
        topic: fullQuiz.topic,
        question: fullQuiz.question,
        options: fullQuiz.options,
        coinReward: coinBoosterActive ? fullQuiz.coinReward * 2 : fullQuiz.coinReward,
        xpReward: fullQuiz.xpReward,
        alreadyAnswered: u.dailyQuizDate === today,
      },
      spotlightGame,
      checkIn: {
        canClaimToday: !claimedToday,
        currentStreak: effectiveStreak,
        nextDayNumber,
        streakAtRisk: streakMissedReset,
        streakMissedReset,
        streakShields: Number(u.streakShields || 0),
        schedule,
      },
      freePlay: {
        playedToday,
        dailyLimit: FREE_SKILL_PLAY_DAILY_LIMIT,
        remaining: Math.max(0, FREE_SKILL_PLAY_DAILY_LIMIT - playedToday),
        coinBoosterActive,
        coinBoosterUntil: coinBoosterActive ? u.coinBoosterUntil : null,
      },
      topDailyPlayers,
    };
  };

  if (path === '/api/time/live' && method === 'GET') {
    return {
      success: true,
      timeMeta: {
        ...getLiveIstTimeMeta(),
        syncSource: 'Browser Edge Clock (IST UTC+05:30)',
        clockSkewMs: 0,
        lastSyncedIso: new Date().toISOString(),
      },
    };
  }
  if (path.startsWith('/api/game/daily-hub/') && method === 'GET') {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    const hub = buildStaticDailyHub(user);
    return { success: true, hub, timeMeta: hub.timeMeta, user };
  }
  if (path === '/api/game/daily-checkin' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const today = todayStr();
    const yesterday = getYesterdayDateString(today);
    if (user.lastDailyCheckInDate === today) {
      return { success: false, message: 'आज का डेली चेक-इन रिवॉर्ड पहले ही क्लेम किया जा चुका है!' };
    }
    let newStreak = 1;
    let shieldConsumed = false;
    const prevDate = user.lastDailyCheckInDate || '';
    const prevStreak = Number(user.loginStreak || 0);
    if (prevDate === yesterday) newStreak = prevStreak + 1;
    else if (prevDate && prevStreak > 0 && body.useShield && Number(user.streakShields || 0) > 0) {
      user.streakShields = Number(user.streakShields || 0) - 1;
      newStreak = prevStreak + 1;
      shieldConsumed = true;
    }
    const rewardDef = SEVEN_DAY_CHECKIN_REWARDS[(newStreak - 1) % 7];
    const boosterActive = Boolean(user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now());
    const vipCfg = getVipConfig(user.vipTier);
    const coinsEarned = rewardDef.coins + (boosterActive ? 5 : 0);
    const xpEarned = Math.round(rewardDef.xp * (vipCfg?.bonusXpMultiplier || 1) * (boosterActive ? 1.5 : 1));
    const before = user.coins || 0;
    user.coins = before + coinsEarned;
    user.gameXp = (user.gameXp || 0) + xpEarned;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.loginStreak = newStreak;
    user.lastDailyCheckInDate = today;
    normalizeStaticUser(user);
    user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + 5);
    db.coinTransactions.unshift({
      id: `CTX-${Date.now()}`,
      userId: user.userId,
      userName: user.fullName,
      type: 'credit',
      category: 'daily_checkin',
      categoryLabel: `Day ${rewardDef.day} Check-In Streak`,
      amount: coinsEarned,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${rewardDef.label} (Streak #${newStreak}): +${coinsEarned} कॉइन्स`,
      timestamp: new Date().toISOString(),
    });
    saveDb(db);
    return {
      success: true,
      message: `🎉 ${rewardDef.label} पूरा! +${coinsEarned} कॉइन्स व +${xpEarned} EXP मिले!`,
      coinsEarned,
      xpEarned,
      newStreak,
      shieldConsumed,
      hub: buildStaticDailyHub(user),
      user,
    };
  }
  if (path === '/api/game/daily-quiz' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const today = todayStr();
    if (user.dailyQuizDate === today) {
      return { success: false, message: 'आज का डेली नॉलेज क्विज़ पहले ही पूरा हो चुका है!' };
    }
    const quiz = getDailyQuizForDate(today);
    const idx = Number(body.selectedIndex);
    const isCorrect = idx === quiz.correctIndex;
    const boosterActive = Boolean(user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now());
    const coinsEarned = (isCorrect ? quiz.coinReward : 2) * (boosterActive ? 2 : 1);
    const xpEarned = Math.round((isCorrect ? quiz.xpReward : 10) * (boosterActive ? 1.5 : 1));
    const before = user.coins || 0;
    user.coins = before + coinsEarned;
    user.gameXp = (user.gameXp || 0) + xpEarned;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.dailyQuizDate = today;
    if (isCorrect) user.dailyQuizCorrectCount = (user.dailyQuizCorrectCount || 0) + 1;
    db.coinTransactions.unshift({
      id: `CTX-${Date.now()}`,
      userId: user.userId,
      userName: user.fullName,
      type: 'credit',
      category: 'daily_quiz',
      categoryLabel: 'डेली क्विज़',
      amount: coinsEarned,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${quiz.topic}: +${coinsEarned} कॉइन्स`,
      timestamp: new Date().toISOString(),
    });
    saveDb(db);
    return {
      success: true,
      isCorrect,
      correctIndex: quiz.correctIndex,
      explanation: quiz.explanation,
      coinsEarned,
      xpEarned,
      message: isCorrect ? `🧠 सही जवाब! +${coinsEarned} कॉइन्स व +${xpEarned} EXP मिले!` : `💡 ${quiz.explanation} (+${coinsEarned} कॉइन्स)`,
      hub: buildStaticDailyHub(user),
      user,
    };
  }
  if (path === '/api/game/skill-play' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const today = todayStr();
    if (user.dailyFreeGameDate !== today) {
      user.dailyFreeGameDate = today;
      user.dailyFreeGamesPlayed = 0;
    }
    const playedSoFar = Number(user.dailyFreeGamesPlayed || 0);
    const withinDailyRewardCap = playedSoFar < FREE_SKILL_PLAY_DAILY_LIMIT;
    const isWin = body.outcome === 'win';
    const spotlight = getSpotlightGameForDate(today);
    const isSpotlightMatch = spotlight.key === String(body.gameName || '').toLowerCase();
    const boosterActive = Boolean(user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now());
    const coinsEarned = withinDailyRewardCap
      ? ((isWin ? 10 : 3) + (isWin && isSpotlightMatch ? spotlight.extraCoins : 0)) * (boosterActive ? 2 : 1)
      : 0;
    const xpEarned = withinDailyRewardCap ? Math.round((isWin ? 25 : 10) * (isSpotlightMatch ? 1.5 : 1) * (boosterActive ? 1.5 : 1)) : 5;
    if (withinDailyRewardCap) user.dailyFreeGamesPlayed = playedSoFar + 1;
    const before = user.coins || 0;
    user.coins = before + coinsEarned;
    user.gameXp = (user.gameXp || 0) + xpEarned;
    user.gameLevel = calculateLevelFromXp(user.gameXp);
    user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
    if (isWin) {
      user.totalGamesWon = (user.totalGamesWon || 0) + 1;
      user.totalCoinsWon = (user.totalCoinsWon || 0) + coinsEarned;
    }
    trackStaticTask(user, 'game_played', 1);
    saveDb(db);
    return {
      success: true,
      isWin,
      withinDailyRewardCap,
      isSpotlightMatch,
      boosterActive,
      coinsEarned,
      xpEarned,
      currentCoins: user.coins,
      newBalance: user.coins,
      message: withinDailyRewardCap
        ? `${isWin ? '🎉 शानदार जीत!' : '👏 बढ़िया प्रयास!'} +${coinsEarned} कॉइन्स व +${xpEarned} EXP मिले!`
        : `प्रैक्टिस राउंड पूरा! (+${xpEarned} EXP)`,
      hub: buildStaticDailyHub(user),
      user,
    };
  }
  if (path === '/api/game/buy-booster' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const booster = COIN_UTILITY_BOOSTERS.find(b => b.id === body.boosterId);
    if (!booster) return { success: false, message: 'Booster not found' };
    const before = user.coins || 0;
    if (before < booster.coinPrice) {
      return { success: false, code: 'INSUFFICIENT_COINS', message: `${booster.hindiName} के लिए ${booster.coinPrice} कॉइन्स चाहिए।` };
    }
    user.coins = before - booster.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + booster.coinPrice;
    if (booster.id === 'booster_2x_24h') {
      const base = user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
        ? new Date(user.coinBoosterUntil).getTime()
        : Date.now();
      user.coinBoosterUntil = new Date(base + 24 * 60 * 60 * 1000).toISOString();
    } else if (booster.id === 'streak_shield') {
      user.streakShields = Number(user.streakShields || 0) + 1;
    }
    saveDb(db);
    return { success: true, message: `⚡ ${booster.hindiName} अनलॉक हो गया!`, booster, hub: buildStaticDailyHub(user), user };
  }

  // Voice rooms (Personal Fixed Rooms, Custom Wallpapers, Symbol-Free IDs, Join & Follow)
  if (path === '/api/game/voice-rooms' && method === 'GET') {
    const viewerId = search.get('viewerId') || '';
    const q = (search.get('q') || '').trim().replace(/^(id:|room:|#)/i, '').trim().toLowerCase();
    const rooms = ensureAllStaticRooms(db);
    saveDb(db);
    const filtered = q
      ? rooms
          .filter(
            r =>
              String(r.roomAddress || '').toLowerCase().includes(q) ||
              String(r.title || '').toLowerCase().includes(q) ||
              String(r.hostName || '').toLowerCase().includes(q) ||
              String(r.hostUserId || '').toLowerCase().includes(q)
          )
          .sort((a, b) => {
            const aExact = String(a.roomAddress || '').toLowerCase() === q ? 1 : 0;
            const bExact = String(b.roomAddress || '').toLowerCase() === q ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;
            return (b.isVipRoom ? 1 : 0) - (a.isVipRoom ? 1 : 0);
          })
      : [...rooms].sort((a, b) => (b.isVipRoom ? 1 : 0) - (a.isVipRoom ? 1 : 0));
    return {
      success: true,
      rooms: filtered.map(r => buildStaticRoomDetail(db, r, viewerId).room),
    };
  }
  if (path.startsWith('/api/game/voice-rooms/my-room/') && method === 'GET') {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    const viewerId = search.get('viewerId') || uid;
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    const room = ensureStaticPersonalRoom(db, user);
    saveDb(db);
    return buildStaticRoomDetail(db, room, viewerId);
  }
  if (path.startsWith('/api/game/voice-rooms/lookup/') && method === 'GET') {
    const qRaw = decodeURIComponent(path.split('/').pop() || '').trim().replace(/^(id:|room:|#)/i, '').trim();
    const viewerId = search.get('viewerId') || '';
    const rooms = ensureAllStaticRooms(db);
    const qLow = qRaw.toLowerCase();
    const match =
      rooms.find(r => String(r.roomAddress || '').toLowerCase() === qLow) ||
      rooms.find(r => r.id.toLowerCase() === qLow) ||
      rooms.find(r => String(r.hostUserId || '').toLowerCase() === qLow) ||
      rooms.find(r => String(r.hostUsername || '').toLowerCase() === normalizeStaticUsername(qRaw));
    if (!match) return { success: false, message: `रूम ID "${qRaw}" नहीं मिला।` };
    return buildStaticRoomDetail(db, match, viewerId);
  }
  if (path === '/api/game/voice-room' && method === 'GET') {
    const viewerId = search.get('viewerId') || '';
    const rooms = ensureAllStaticRooms(db);
    saveDb(db);
    return buildStaticRoomDetail(db, rooms[0], viewerId);
  }
  if (path.startsWith('/api/game/voice-rooms/') && method === 'GET') {
    const rid = decodeURIComponent(path.split('/').pop() || '');
    const viewerId = search.get('viewerId') || '';
    const rooms = ensureAllStaticRooms(db);
    const room =
      rooms.find(
        r => r.id.toLowerCase() === rid.toLowerCase() || String(r.roomAddress || '').toLowerCase() === rid.toLowerCase()
      ) || rooms[0];
    return buildStaticRoomDetail(db, room, viewerId);
  }
  if (path === '/api/game/voice-rooms/create' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'Login required' };
    ensureAllStaticRooms(db);
    trackStaticTask(user, 'voice_joined', 1);
    const roomAddress = generateStaticRoomId(db.users, db.customVoiceRooms, body.title || user.fullName);
    const room = {
      id: `vroom${Date.now()}`,
      title: body.title || `${user.fullName}'s Voice Room`,
      topic: body.topic || 'Earning & Gaming',
      category: body.category || 'earning',
      roomAddress,
      roomNumber: roomAddress,
      isPersonalFixed: false,
      hostUserId: user.userId,
      hostName: body.hostName || user.fullName,
      hostUsername: user.username || '',
      hostAvatar: user.avatar || body.hostAvatar,
      wallpaperId: body.wallpaperId || 'castle_night',
      customWallpaperUrl: body.customWallpaperUrl || '',
      stageLayout: body.stageLayout || 'classic_8',
      youtubeVideoUrl: body.youtubeVideoUrl || '',
      lockedSeats: [],
      followers: [user.userId],
      audience: [user.userId],
      seats: [
        {
          seatNumber: 1,
          seatNumberLabel: '1 (Host)',
          userId: user.userId,
          userName: user.fullName,
          userAvatar: user.avatar,
          gameLevel: user.gameLevel || 1,
          isMuted: false,
          isSpeaking: true,
          charms: user.charms || 0,
        },
        ...Array.from({ length: 7 }, (_, i) => ({
          seatNumber: i + 2,
          seatNumberLabel: String(i + 2),
          isMuted: false,
          isSpeaking: false,
          charms: 0,
        })),
      ],
      chatMessages: [
        {
          id: `vc-cr-${Date.now()}`,
          senderId: 'SYSTEM',
          sender: 'System',
          senderRoll: 'STAGE',
          text: `🔔 System: ${user.fullName} started room "${body.title || 'Live Room'}" (${roomAddress})`,
          time: 'Live',
        },
      ],
      listenersCount: 1,
      createdAt: new Date().toISOString(),
    };
    db.customVoiceRooms.unshift(room);
    saveDb(db);
    return { success: true, room, roomId: room.id };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/join$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id.toLowerCase() === rid.toLowerCase() || String(r.roomAddress || '').toLowerCase() === rid.toLowerCase());
    const user = findUser(db, body.userId);
    if (!room || !user) return { success: false, message: 'Room or user not found' };
    if (room.isPrivate && room.passcode && room.hostUserId !== user.userId && String(body.passcode || '') !== String(room.passcode)) {
      return { success: false, requiresPasscode: true, message: '🔒 गलत पासकोड!' };
    }
    if (!Array.isArray(room.audience)) room.audience = [];
    if (!room.audience.includes(user.userId)) {
      room.audience.push(user.userId);
      trackStaticTask(user, 'voice_joined', 1);
      if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
      room.chatMessages.push({
        id: `join-${Date.now()}`,
        senderId: 'SYSTEM',
        sender: 'System',
        senderRoll: 'STAGE',
        text: `🔔 System: ${user.fullName} joined the room`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    saveDb(db);
    return { ...buildStaticRoomDetail(db, room, user.userId), user };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/leave$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = db.customVoiceRooms.find(r => r.id === rid);
    if (room && Array.isArray(room.audience) && body.userId !== room.hostUserId) {
      room.audience = room.audience.filter((id: string) => id !== body.userId);
      saveDb(db);
    }
    return { success: true };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/follow$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id === rid || String(r.roomAddress || '').toLowerCase() === rid.toLowerCase());
    const user = findUser(db, body.userId);
    if (!room || !user) return { success: false, message: 'Room or user not found' };
    if (!Array.isArray(room.followers)) room.followers = [];
    if (!Array.isArray(user.followedRooms)) user.followedRooms = [];
    const wasFollowing = room.followers.includes(user.userId);
    if (wasFollowing) {
      room.followers = room.followers.filter((id: string) => id !== user.userId);
      user.followedRooms = user.followedRooms.filter(id => id !== room.id);
    } else {
      room.followers.push(user.userId);
      if (!user.followedRooms.includes(room.id)) user.followedRooms.push(room.id);
    }
    saveDb(db);
    return {
      success: true,
      isFollowed: !wasFollowing,
      followersCount: room.followers.length,
      room: buildStaticRoomDetail(db, room, user.userId).room,
      user,
    };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/update-design$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id === rid || String(r.roomAddress || '').toLowerCase() === rid.toLowerCase());
    const user = findUser(db, body.userId);
    if (!room || !user) return { success: false, message: 'Room not found' };
    if (body.title) room.title = String(body.title).trim();
    if (typeof body.topic === 'string') room.topic = body.topic.trim();
    if (body.category) room.category = body.category;
    if (body.wallpaperId) {
      room.wallpaperId = body.wallpaperId;
      if (body.wallpaperId !== 'custom_upload' && body.customWallpaperUrl === undefined) room.customWallpaperUrl = '';
    }
    if (typeof body.customWallpaperUrl === 'string') {
      room.customWallpaperUrl = body.customWallpaperUrl;
      if (body.customWallpaperUrl) room.wallpaperId = 'custom_upload';
    }
    if (body.stageLayout) room.stageLayout = body.stageLayout;
    if (typeof body.youtubeVideoUrl === 'string') room.youtubeVideoUrl = body.youtubeVideoUrl;
    if (typeof body.isPrivate === 'boolean') room.isPrivate = body.isPrivate;
    if (typeof body.passcode === 'string') room.passcode = body.passcode;
    if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
    room.chatMessages.push({
      id: `sys-${Date.now()}`,
      senderId: 'SYSTEM',
      sender: 'System',
      senderRoll: 'STAGE',
      text: '🔔 System: Owner changed the theme',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    saveDb(db);
    return buildStaticRoomDetail(db, room, user.userId);
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/invite$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = db.customVoiceRooms.find(r => r.id === rid);
    const targets = Array.isArray(body.targetUserIds) ? body.targetUserIds : [];
    const sender = findUser(db, body.senderUserId);
    if (room && sender) {
      for (const tid of targets) {
        db.notifications.unshift({
          id: `notif-inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          userId: tid,
          title: `🎙️ Voice Room Invite from ${sender.fullName}`,
          message: `Join "${room.title}" (ID: ${room.roomAddress})`,
          type: 'system',
          read: false,
          date: new Date().toISOString().split('T')[0],
        });
      }
      saveDb(db);
    }
    return { success: true, sentCount: targets.length, roomAddress: room?.roomAddress || '' };
  }
  if (path.includes('/take-seat') && method === 'POST') {
    const user = findUser(db, body.userId);
    const idx = Number(body.seatIndex) || 0;
    const rid = body.roomId || path.split('/')[4] || 'room-founder';
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id === rid) || rooms[0];
    const lockedSet = new Set<number>(Array.isArray(room?.lockedSeats) ? room.lockedSeats : []);
    if (lockedSet.has(idx) && room?.hostUserId !== user?.userId) {
      return { success: false, message: `🔒 सीट #${idx + 1} लॉक है।` };
    }
    if (user && room?.seats?.[idx]) {
      trackStaticTask(user, 'voice_joined', 1);
      room.seats = room.seats.map((s: any) =>
        s.userId === user.userId ? { seatNumber: s.seatNumber, seatNumberLabel: String(s.seatNumber), isMuted: false, isSpeaking: false, charms: 0 } : s
      );
      room.seats[idx] = { ...room.seats[idx], userId: user.userId, userName: user.fullName, userAvatar: user.avatar, userRollNumber: user.userId, gameLevel: user.gameLevel || 1, isSpeaking: true, isMuted: false };
      saveDb(db);
    }
    return {
      success: true,
      seats: (room?.seats || db.voiceRoomSeats).map((s: any, sIdx: number) => ({ ...s, isLocked: lockedSet.has(sIdx) })),
      chatMessages: room?.chatMessages || db.voiceRoomChat,
      user,
    };
  }
  if (path.includes('/leave-seat') && method === 'POST') {
    const rid = body.roomId || path.split('/')[4] || 'room-founder';
    const room = db.customVoiceRooms.find(r => r.id === rid) || db.customVoiceRooms[0];
    if (room) {
      room.seats = room.seats.map((s: any) => s.userId === body.userId ? { seatNumber: s.seatNumber, seatNumberLabel: String(s.seatNumber), isMuted: false, isSpeaking: false, charms: 0 } : s);
      saveDb(db);
    }
    return { success: true, seats: room?.seats || db.voiceRoomSeats };
  }
  if ((path.includes('/voice-room') || path.includes('/voice-rooms')) && (path.endsWith('/chat') || path.endsWith('/voice-audio')) && method === 'POST') {
    const user = findUser(db, body.userId);
    const rid = body.roomId || path.split('/')[4] || 'room-founder';
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id === rid) || rooms[0];
    if (user) trackStaticTask(user, 'chat_sent', 1);
    const msg = {
      id: `vc-${Date.now()}`,
      senderId: body.userId,
      sender: user?.fullName || 'Member',
      senderRoll: user?.userId || 'ESP',
      senderAvatar: user?.avatar,
      text: body.text || '🎙️ Voice Note',
      isGift: !!body.isGift,
      audioDataUrl: body.audioDataUrl,
      audioDuration: body.durationSec,
      isVoiceNote: !!body.audioDataUrl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (room) {
      if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
      room.chatMessages.push(msg);
    }
    saveDb(db);
    return { success: true, chat: room?.chatMessages || db.voiceRoomChat, chatMessages: room?.chatMessages || db.voiceRoomChat };
  }
  if (path.includes('/host-action') && method === 'POST') {
    const rid = body.roomId || path.split('/')[4] || 'room-founder';
    const rooms = ensureAllStaticRooms(db);
    const room = rooms.find(r => r.id === rid) || rooms[0];
    if (room) {
      if (!Array.isArray(room.lockedSeats)) room.lockedSeats = [];
      if (body.action === 'update_topic' && body.newTopic) room.topic = body.newTopic;
      if (body.action === 'set_youtube') {
        room.youtubeVideoUrl = body.youtubeVideoUrl || '';
        room.youtubeVideoTitle = body.youtubeVideoTitle || '';
        room.stageLayout = 'watch_party';
      }
      if (typeof body.seatIndex === 'number' && room.seats[body.seatIndex]) {
        if (body.action === 'mute') room.seats[body.seatIndex].isMuted = true;
        if (body.action === 'unmute') room.seats[body.seatIndex].isMuted = false;
        if (body.action === 'kick') room.seats[body.seatIndex] = { seatNumber: body.seatIndex + 1, seatNumberLabel: String(body.seatIndex + 1), isMuted: false, isSpeaking: false, charms: 0 };
        if (body.action === 'lock_seat' && !room.lockedSeats.includes(body.seatIndex)) {
          room.lockedSeats.push(body.seatIndex);
          room.seats[body.seatIndex] = { seatNumber: body.seatIndex + 1, seatNumberLabel: String(body.seatIndex + 1), isMuted: false, isSpeaking: false, charms: 0 };
        }
        if (body.action === 'unlock_seat') {
          room.lockedSeats = room.lockedSeats.filter((i: number) => i !== body.seatIndex);
        }
      }
      saveDb(db);
      const lockedSet = new Set<number>(room.lockedSeats);
      return {
        success: true,
        room: buildStaticRoomDetail(db, room).room,
        seats: room.seats.map((s: any, idx: number) => ({ ...s, isLocked: lockedSet.has(idx) })),
      };
    }
    return { success: true, seats: db.voiceRoomSeats };
  }
  if (path.includes('/invite-bot') || path.includes('/summon-all-bots') || path.includes('/bot-interact')) {
    return { success: true, seats: db.voiceRoomSeats, chat: db.voiceRoomChat, coinsAwarded: 0, reply: DEFAULT_BOTS[2].sampleDialogues[0] };
  }

  // Gift Cards (Admin Fulfillment Queue), Home Slider, Complaints, Contact
  if (path === '/api/gift-cards') {
    return { success: true, catalog: GIFT_CARD_CATALOG, vouchers: GIFT_CARD_CATALOG.map(c => ({ ...c, status: 'available' as const })) };
  }
  if (path === '/api/gift-cards/redeem' && method === 'POST') {
    const user = findUser(db, body.userId);
    const c = GIFT_CARD_CATALOG.find(x => x.id === (body.catalogId || body.voucherId));
    if (!user || !c) return { success: false, message: 'Invalid gift card or user' };
    if ((user.coins || 0) < c.coinsRequired) return { success: false, code: 'INSUFFICIENT_COINS', requiredCoins: c.coinsRequired, currentCoins: user.coins || 0, message: 'पर्याप्त कॉइन्स नहीं हैं!' };
    user.coins = (user.coins || 0) - c.coinsRequired;
    const redemption: GiftCardRedemption = {
      id: `GCR-${Date.now().toString().slice(-6)}`,
      catalogId: c.id,
      brand: c.brand,
      title: c.title,
      denomination: c.denomination,
      coinsSpent: c.coinsRequired,
      userId: user.userId,
      userName: user.fullName,
      userPhone: user.phone,
      status: 'pending_fulfillment',
      requestedAt: new Date().toISOString(),
    };
    db.giftCardRedemptions.unshift(redemption);
    saveDb(db);
    return { success: true, message: 'गिफ्ट कार्ड अनुरोध एडमिन को भेजा गया!', redemption, newBalance: user.coins, user };
  }
  if (path === '/api/gift-cards/redemptions') {
    const uid = search.get('userId') || '';
    if (adminPassHeader && verifyAdminPass(adminPassHeader)) {
      return { success: true, redemptions: db.giftCardRedemptions };
    }
    return { success: true, redemptions: db.giftCardRedemptions.filter(r => r.userId.toLowerCase() === uid.toLowerCase()) };
  }
  if (path.match(/^\/api\/admin\/gift-cards\/[^/]+\/fulfill$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const id = decodeURIComponent(path.split('/')[4]);
    const r = db.giftCardRedemptions.find(x => x.id === id);
    if (!r) return { success: false, message: 'Not found' };
    if (body.status === 'rejected') {
      r.status = 'rejected';
      r.rejectionReason = body.rejectionReason || 'Rejected';
      const u = findUser(db, r.userId);
      if (u) u.coins = (u.coins || 0) + r.coinsSpent;
    } else {
      r.status = 'fulfilled';
      r.voucherCode = body.voucherCode;
      r.voucherPin = body.voucherPin || '';
    }
    r.fulfilledAt = new Date().toISOString();
    saveDb(db);
    return { success: true, redemption: r };
  }
  if (path === '/api/home-slider-photos') return { success: true, photos: db.homeSliderPhotos };
  if (path === '/api/admin/home-slider-photos' && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    db.homeSliderPhotos = body.photos || [];
    saveDb(db);
    return { success: true, message: 'Slider saved', photos: db.homeSliderPhotos };
  }
  if (path === '/api/complaints' && method === 'POST') {
    const c: UserComplaint = {
      id: `CMP-${Date.now().toString().slice(-6)}`,
      userId: body.userId,
      userName: body.userName || 'Member',
      userPhone: body.userPhone || '',
      userRoll: body.userId,
      category: body.category || 'other',
      categoryLabel: body.category || 'General',
      subject: body.subject || 'Support Request',
      description: body.description || '',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.complaints.unshift(c);
    saveDb(db);
    return { success: true, message: 'शिकायत दर्ज हो गई!', complaint: c };
  }
  if (path.startsWith('/api/complaints/user/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    return { success: true, complaints: db.complaints.filter(c => c.userId === uid) };
  }
  if (path === '/api/contact/messages' && method === 'POST') {
    const msg: ContactMessage = { id: `MSG-${Date.now()}`, name: body.name, email: body.email, phone: body.phone, telegramUsername: body.telegramUsername, subject: body.subject || 'Inquiry', message: body.message, createdAt: new Date().toISOString(), status: 'unread' };
    db.contactMessages.unshift(msg);
    saveDb(db);
    return { success: true, message: 'संदेश सफलतापूर्वक भेजा गया!', contactMessage: msg };
  }

  // Admin Overview, Payouts Approve/Reject, Coin Recharges & Management
  if (path === '/api/admin/overview') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Invalid Admin Security Key' };
    ensureAllStaticRooms(db);
    saveDb(db);
    return {
      success: true,
      settings: db.settings,
      services: db.services,
      users: db.users,
      referrals: db.referrals,
      payouts: db.payouts,
      coinRecharges: db.coinRecharges,
      contactMessages: db.contactMessages,
      adminNotifications: db.notifications.filter(n => n.userId === 'EMO-MOM-MMO'),
      transactions: db.transactions,
      stats: {
        totalUsers: db.users.length,
        activeUsers: db.users.filter(u => u.status === 'active').length,
        pendingUsers: db.users.filter(u => u.status === 'pending').length,
        pendingPayouts: db.payouts.filter(p => p.status === 'pending').length,
        pendingCoinRechargesCount: db.coinRecharges.filter(r => r.status === 'pending').length,
        totalPlatformRevenue: db.users.reduce((s, u) => s + (Number(u.joiningFee) || 0), 0),
        totalWalletLiability: db.users.reduce((s, u) => s + (Number(u.balance) || 0), 0),
      },
    };
  }
  if (path === '/api/admin/import-cloud-users' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const incoming = Array.isArray(body.users) ? body.users : [];
    const incomingUpgrades = Array.isArray(body.upgrades) ? body.upgrades : [];
    let importedCount = 0;
    let updatedCount = 0;
    for (const raw of incoming) {
      if (!raw || (!raw.userId && !raw.phone && !raw.email)) continue;
      const rawUserId = String(raw.userId || '').trim();
      const rawPhone = normalizeStaticPhone(raw.phone || '') || String(raw.phone || '').trim();
      const rawEmail = String(raw.email || '').trim().toLowerCase();
      const existingUser = db.users.find(
        u =>
          (rawUserId && u.userId.toLowerCase() === rawUserId.toLowerCase()) ||
          (rawPhone && normalizeStaticPhone(u.phone || '') === rawPhone && rawPhone.length >= 10) ||
          (rawEmail && rawEmail.includes('@') && (u.email || '').trim().toLowerCase() === rawEmail)
      );
      if (existingUser) {
        let touched = false;
        const incomingTime = Date.parse(String(raw.updatedAt || raw.lastLogin || raw.createdAt || '')) || 0;
        const localTime = Date.parse(String((existingUser as any).updatedAt || existingUser.lastLogin || existingUser.createdAt || '')) || 0;
        const incomingIsNewer = incomingTime > localTime;
        const fill = (key: keyof UserProfile, maxLen = 300) => {
          const val = typeof raw[key] === 'string' ? String(raw[key]).trim() : '';
          const cur = typeof (existingUser as any)[key] === 'string' ? String((existingUser as any)[key]).trim() : '';
          if (val && (!cur || (incomingIsNewer && val !== cur))) {
            (existingUser as any)[key] = maxLen > 0 ? val.slice(0, maxLen) : val;
            touched = true;
          }
        };
        fill('registeredFromHost', 128);
        fill('fullAddress', 300);
        fill('paymentAddress', 120);
        fill('payoutUpiId', 120);
        fill('password', 128);
        fill('swiAppLink', 300);
        fill('swiAppNote', 300);
        if (raw.paymentScreenshot && (!existingUser.paymentScreenshot || (incomingIsNewer && String(raw.paymentScreenshot).startsWith('data:image/')))) {
          existingUser.paymentScreenshot = String(raw.paymentScreenshot);
          touched = true;
        }
        if (raw.paymentUtr && (!existingUser.paymentUtr || existingUser.paymentUtr === 'CLOUD_SYNC' || existingUser.paymentUtr === 'FREE_GAMING_USER')) {
          existingUser.paymentUtr = String(raw.paymentUtr).slice(0, 80);
          touched = true;
        }
        if ((!existingUser.email || existingUser.email.endsWith('@espgaming.club')) && rawEmail && rawEmail.includes('@') && !rawEmail.endsWith('@espgaming.club')) {
          existingUser.email = rawEmail;
          touched = true;
        }
        if ((!existingUser.phone || existingUser.phone === '0000000000') && rawPhone && rawPhone.length >= 10) {
          existingUser.phone = rawPhone;
          touched = true;
        }
        if (raw.chosenServiceCode && (!existingUser.chosenServiceCode || (existingUser.accountType === 'gamer' && raw.accountType === 'business'))) {
          existingUser.chosenServiceCode = String(raw.chosenServiceCode).slice(0, 24);
          if (raw.chosenServiceName) existingUser.chosenServiceName = String(raw.chosenServiceName).slice(0, 120);
          touched = true;
        }
        if (Number(raw.joiningFee) > (Number(existingUser.joiningFee) || 0)) {
          existingUser.joiningFee = Number(raw.joiningFee);
          touched = true;
        }
        if (raw.accountType === 'business' && existingUser.accountType === 'gamer') {
          existingUser.accountType = 'business';
          touched = true;
        }
        if (incomingIsNewer && (raw.status === 'active' || raw.status === 'pending' || raw.status === 'rejected') && existingUser.status !== raw.status) {
          existingUser.status = raw.status;
          touched = true;
        }
        if (incomingIsNewer) {
          const numFields: Array<keyof UserProfile> = [
            'coins', 'balance', 'totalEarnings', 'referralEarnings', 'promoEarnings', 'totalWithdrawn', 'charms', 'gameXp',
          ];
          for (const fk of numFields) {
            if (typeof raw[fk] === 'number' && Number.isFinite(raw[fk]) && Number(raw[fk]) !== Number((existingUser as any)[fk] || 0)) {
              (existingUser as any)[fk] = Math.max(0, Number(raw[fk]));
              touched = true;
            }
          }
          if (typeof raw.gameLevel === 'number' && Number.isFinite(raw.gameLevel) && Number(raw.gameLevel) >= 1 && Number(raw.gameLevel) !== Number(existingUser.gameLevel || 1)) {
            existingUser.gameLevel = Number(raw.gameLevel);
            touched = true;
          }
          if (raw.vipTier && raw.vipTier !== existingUser.vipTier) {
            existingUser.vipTier = raw.vipTier;
            touched = true;
          }
          if (raw.vipTitle !== undefined && raw.vipTitle !== existingUser.vipTitle) {
            existingUser.vipTitle = String(raw.vipTitle || '');
            touched = true;
          }
          if (raw.frameType && raw.frameType !== existingUser.frameType) {
            existingUser.frameType = String(raw.frameType);
            if (!Array.isArray(existingUser.unlockedFrames)) existingUser.unlockedFrames = ['standard'];
            if (!existingUser.unlockedFrames.includes(existingUser.frameType)) {
              existingUser.unlockedFrames.push(existingUser.frameType);
            }
            touched = true;
          }
          if (typeof raw.isVipRoom === 'boolean' && raw.isVipRoom !== existingUser.isVipRoom) {
            existingUser.isVipRoom = raw.isVipRoom;
            touched = true;
          }
          if (raw.vipRoomLabel !== undefined && raw.vipRoomLabel !== existingUser.vipRoomLabel) {
            existingUser.vipRoomLabel = String(raw.vipRoomLabel || '');
            touched = true;
          }
          if (raw.roomAddress && /^\d{3,10}$/.test(String(raw.roomAddress)) && String(raw.roomAddress) !== String(existingUser.roomAddress || '')) {
            existingUser.roomAddress = String(raw.roomAddress);
            existingUser.personalRoomId = String(raw.roomAddress);
            touched = true;
          }
          if (raw.chosenServiceCode && raw.chosenServiceCode !== existingUser.chosenServiceCode) {
            existingUser.chosenServiceCode = String(raw.chosenServiceCode).slice(0, 24);
            if (raw.chosenServiceName) existingUser.chosenServiceName = String(raw.chosenServiceName).slice(0, 120);
            touched = true;
          }
          if (raw.verifiedAt && raw.verifiedAt !== existingUser.verifiedAt) {
            existingUser.verifiedAt = String(raw.verifiedAt);
            touched = true;
          }
          (existingUser as any).updatedAt = String(raw.updatedAt || new Date().toISOString());
        }
        if (raw.workspaceState && typeof raw.workspaceState === 'object') {
          const wsIn = Date.parse(String(raw.workspaceState.updatedAt || '')) || 0;
          const wsCur = Date.parse(String(existingUser.workspaceState?.updatedAt || '')) || 0;
          if (wsIn > wsCur) {
            existingUser.workspaceState = raw.workspaceState;
            touched = true;
          }
        }
        if (touched) updatedCount++;
        continue;
      }
      const cleanName = String(raw.fullName || 'ESP Member').trim().replace(/\s+/g, ' ');
      const isGamer = raw.accountType === 'gamer';
      const srv = isGamer
        ? { code: raw.chosenServiceCode || 'GAME', name: raw.chosenServiceName || 'ESP GAMING & VOICE CLUB' }
        : db.services.find(s => s.code === raw.chosenServiceCode) || {
            code: raw.chosenServiceCode || 'EMO',
            name: raw.chosenServiceName || 'EARN MONEY ONLINE',
          };
      const finalUserId =
        rawUserId && !db.users.some(u => u.userId.toLowerCase() === rawUserId.toLowerCase())
          ? rawUserId
          : isGamer
          ? generateStaticGamerId(db.users, cleanName)
          : generateStaticIncomeId(db.users, cleanName, srv.code);
      const gamingId = String(raw.gamingId || '').trim() || (isGamer ? finalUserId : generateStaticGamerId(db.users, cleanName));
      const rawUname = normalizeStaticUsername(raw.username || '');
      const username =
        rawUname && isValidStaticUsername(rawUname) && !isStaticUsernameTaken(db.users, rawUname)
          ? rawUname
          : generateStaticDefaultUsername(db.users, cleanName, finalUserId, gamingId);
      const candRoom = String(raw.personalRoomId || raw.roomAddress || '').trim();
      const roomTaken = !candRoom || db.users.some(u => (u.personalRoomId || u.roomAddress) === candRoom);
      const roomAddress = roomTaken ? generateStaticRoomId(db.users, db.customVoiceRooms || [], cleanName) : candRoom;
      const sp = findStaticSponsorUser(db.users, raw.sponsorId || db.settings.ownerSponsorId);
      const newUser = normalizeStaticUser({
        id: String(raw.id || `usr-${Date.now()}`),
        userId: finalUserId,
        gamingId,
        username,
        fullName: cleanName,
        phone: rawPhone || '0000000000',
        email: rawEmail || `${finalUserId.toLowerCase()}@espgaming.club`,
        fullAddress: String(raw.fullAddress || ''),
        paymentAddress: String(raw.paymentAddress || ''),
        payoutUpiId: String(raw.payoutUpiId || raw.paymentAddress || ''),
        password: String(raw.password || '123456'),
        sponsorId: sp ? sp.userId : (String(raw.sponsorId || '').trim() || db.settings.ownerSponsorId),
        sponsorName: sp ? sp.fullName : (String(raw.sponsorName || '').trim() || db.settings.ownerName),
        chosenServiceCode: srv.code,
        chosenServiceName: srv.name,
        joiningFee: isGamer ? 0 : Math.max(0, Number(raw.joiningFee) || 10),
        joiningDate: String(raw.joiningDate || new Date().toISOString().split('T')[0]),
        paymentUtr: String(raw.paymentUtr || (isGamer ? 'FREE_GAMING_USER' : 'CLOUD_SYNC')),
        paymentScreenshot: String(raw.paymentScreenshot || ''),
        status: raw.status === 'active' || raw.status === 'rejected' ? raw.status : isGamer ? 'active' : 'pending',
        accountType: isGamer ? 'gamer' : 'business',
        balance: Math.max(0, Number(raw.balance) || 0),
        totalEarnings: Math.max(0, Number(raw.totalEarnings) || 0),
        referralEarnings: Math.max(0, Number(raw.referralEarnings) || 0),
        promoEarnings: Math.max(0, Number(raw.promoEarnings) || 0),
        totalWithdrawn: Math.max(0, Number(raw.totalWithdrawn) || 0),
        coins: Math.max(0, Number(raw.coins) || 0),
        charms: Math.max(0, Number(raw.charms) || 0),
        gameLevel: Math.max(1, Number(raw.gameLevel) || 1),
        vipTier: raw.vipTier || 'none',
        vipTitle: raw.vipTitle || '',
        frameType: raw.frameType || 'standard',
        isVipRoom: Boolean(raw.isVipRoom),
        vipRoomLabel: raw.vipRoomLabel ? String(raw.vipRoomLabel) : '',
        swiAppLink: raw.swiAppLink ? String(raw.swiAppLink) : undefined,
        swiAppNote: raw.swiAppNote ? String(raw.swiAppNote) : undefined,
        verifiedAt: raw.verifiedAt ? String(raw.verifiedAt) : undefined,
        roomAddress,
        personalRoomId: roomAddress,
        registeredFromHost: String(raw.registeredFromHost || 'playesp.github.io'),
        role: 'member',
        createdAt: String(raw.createdAt || new Date().toISOString()),
      });
      db.users.unshift(newUser);
      ensureStaticPersonalRoom(db, newUser);
      importedCount++;
    }
    const mergeQueueById = (targetArr: any[], incomingArr: any[], resolvedStatuses: string[]) => {
      for (const item of incomingArr) {
        if (!item || !item.id) continue;
        const idx = targetArr.findIndex(x => x.id === item.id);
        if (idx === -1) {
          targetArr.unshift(item);
          updatedCount++;
        } else {
          const cur = targetArr[idx];
          const curResolved = resolvedStatuses.includes(String(cur.status || ''));
          const inResolved = resolvedStatuses.includes(String(item.status || ''));
          const inTs = Date.parse(String(item.updatedAt || item.processedDate || item.processedAt || item.fulfilledAt || item.resolvedAt || '')) || 0;
          const curTs = Date.parse(String(cur.updatedAt || cur.processedDate || cur.processedAt || cur.fulfilledAt || cur.resolvedAt || '')) || 0;
          if ((!curResolved && inResolved) || (inTs > curTs)) {
            targetArr[idx] = { ...cur, ...item };
            updatedCount++;
          }
        }
      }
    };
    if (incomingUpgrades.length > 0) {
      if (!Array.isArray(db.planUpgrades)) db.planUpgrades = [];
      mergeQueueById(db.planUpgrades, incomingUpgrades, ['approved', 'rejected']);
    }
    if (Array.isArray(body.payouts) && body.payouts.length > 0) {
      if (!Array.isArray(db.payouts)) db.payouts = [];
      mergeQueueById(db.payouts, body.payouts, ['approved', 'rejected']);
    }
    if (Array.isArray(body.coinRecharges) && body.coinRecharges.length > 0) {
      if (!Array.isArray(db.coinRecharges)) db.coinRecharges = [];
      mergeQueueById(db.coinRecharges, body.coinRecharges, ['approved', 'rejected']);
    }
    if (Array.isArray(body.giftCardRedemptions) && body.giftCardRedemptions.length > 0) {
      if (!Array.isArray(db.giftCardRedemptions)) db.giftCardRedemptions = [];
      mergeQueueById(db.giftCardRedemptions, body.giftCardRedemptions, ['fulfilled', 'rejected']);
    }
    if (Array.isArray(body.complaints) && body.complaints.length > 0) {
      if (!Array.isArray(db.complaints)) db.complaints = [];
      mergeQueueById(db.complaints, body.complaints, ['resolved', 'rejected']);
    }
    if (Array.isArray(body.contactMessages) && body.contactMessages.length > 0) {
      if (!Array.isArray(db.contactMessages)) db.contactMessages = [];
      mergeQueueById(db.contactMessages, body.contactMessages, ['replied', 'read']);
    }
    if (Array.isArray(body.referrals) && body.referrals.length > 0) {
      if (!Array.isArray(db.referrals)) db.referrals = [];
      mergeQueueById(db.referrals, body.referrals, ['credited', 'rejected']);
    }
    if (body.settings && typeof body.settings === 'object') {
      db.settings = { ...db.settings, ...body.settings };
      updatedCount++;
    }
    if (Array.isArray(body.services) && body.services.length > 0) {
      db.services = body.services;
      updatedCount++;
    }
    if (Array.isArray(body.homeSliderPhotos)) {
      db.homeSliderPhotos = body.homeSliderPhotos.slice(0, 7);
      db.settings = { ...db.settings, homeSliderPhotos: db.homeSliderPhotos };
      updatedCount++;
    }
    if (importedCount > 0 || updatedCount > 0) saveDb(db);
    return { success: true, importedCount, updatedCount, totalUsers: db.users.length, users: db.users };
  }
  if (path === '/api/admin/vip-rooms/check' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const rooms = ensureAllStaticRooms(db);
    const raw = String(body.roomNumber || '').trim();
    if (!/^\d{3,10}$/.test(raw)) {
      return {
        success: true,
        valid: false,
        available: false,
        normalized: raw.replace(/\D/g, ''),
        isFancyVip: false,
        message: 'केवल 3 से 10 अंकों की संख्या दर्ज करें (जैसे 1111, 2222, 1234)',
      };
    }
    const conflict = findStaticRoomConflict(db.users, rooms, raw, body.excludeUserId);
    const isFancy = isStaticVipFancyRoom(raw);
    return {
      success: true,
      valid: true,
      available: !conflict.conflict,
      normalized: raw,
      isFancyVip: isFancy,
      conflictOwner: conflict.conflict ? `${conflict.ownerName || ''} (${conflict.ownerId || ''})` : null,
      message: conflict.conflict
        ? `❌ Room ID ${raw} पहले से ${conflict.ownerName || conflict.ownerId} को अलॉट है!`
        : `✓ Room ID ${raw} उपलब्ध है!`,
    };
  }
  if (path === '/api/admin/vip-rooms/assign' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const user = findUser(db, body.targetUserId);
    if (!user) return { success: false, message: 'User not found' };
    const cleanNum = String(body.roomNumber || '').trim();
    if (!/^\d{3,10}$/.test(cleanNum)) return { success: false, message: 'केवल 3 से 10 अंक दर्ज करें।' };
    const existingRoom = String(user.roomAddress || user.personalRoomId || '').trim();
    if (isStaticNumericRoomId(existingRoom) && cleanNum !== existingRoom) {
      return {
        success: false,
        code: 'IMMUTABLE_IDENTITY_LOCKED',
        message: `⚠️ ${user.fullName} की Personal Room ID (#${existingRoom}) स्थायी रूप से लॉक है। केवल इसी रूम पर VIP Badge बदला जा सकता है।`,
      };
    }
    const rooms = ensureAllStaticRooms(db);
    const conflict = findStaticRoomConflict(db.users, rooms, cleanNum, user.userId);
    if (conflict.conflict) return { success: false, message: `Room ID ${cleanNum} पहले से अलॉट है।` };
    const vipFlag = Boolean(body.isVipRoom || isStaticVipFancyRoom(cleanNum));
    user.roomAddress = cleanNum;
    user.personalRoomId = cleanNum;
    user.isVipRoom = vipFlag;
    user.vipRoomLabel = String(body.vipRoomLabel || (vipFlag ? 'VIP Room' : '')).trim();
    const room = ensureStaticPersonalRoom(db, user);
    room.roomAddress = cleanNum;
    room.roomNumber = cleanNum;
    room.isVipRoom = vipFlag;
    room.vipRoomLabel = user.vipRoomLabel;
    saveDb(db);
    return { success: true, message: `✅ ${user.fullName} के लॉक Room ID "#${cleanNum}" पर VIP Badge अपडेट हो गया!`, user, room };
  }
  if (path === '/api/admin/vip-rooms/reset' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    return {
      success: false,
      code: 'IMMUTABLE_IDENTITY_LOCKED',
      message: 'Personal Room ID स्थायी रूप से लॉक है! इसे बदला या रीसेट नहीं किया जा सकता।',
    };
  }
  if (path.match(/^\/api\/admin\/users\/[^/]+\/status$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const uid = decodeURIComponent(path.split('/')[4]);
    const user = findUser(db, uid);
    if (user) {
      user.status = body.status;
      if (body.status === 'active') user.verifiedAt = new Date().toISOString();
      saveDb(db);
    }
    return { success: true, user };
  }
  if (path.match(/^\/api\/admin\/payouts\/[^/]+\/approve$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const pid = decodeURIComponent(path.split('/')[4]);
    const p = db.payouts.find(x => x.id === pid);
    if (!p) return { success: false, message: 'Payout not found' };
    p.status = 'approved';
    p.transactionRef = body.transactionRef || 'UTR';
    p.processedDate = new Date().toISOString().split('T')[0];
    const u = findUser(db, p.userId);
    if (u) u.totalWithdrawn = (u.totalWithdrawn || 0) + p.amount;
    saveDb(db);
    return { success: true, payout: p };
  }
  if (path.match(/^\/api\/admin\/payouts\/[^/]+\/reject$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const pid = decodeURIComponent(path.split('/')[4]);
    const p = db.payouts.find(x => x.id === pid);
    if (!p) return { success: false, message: 'Payout not found' };
    if (p.status === 'pending') {
      p.status = 'rejected';
      p.processedDate = new Date().toISOString().split('T')[0];
      const u = findUser(db, p.userId);
      if (u) u.balance = (u.balance || 0) + p.amount;
      saveDb(db);
    }
    return { success: true, message: 'Payout rejected & refunded', payout: p };
  }
  if (path.match(/^\/api\/admin\/coin-recharges\/[^/]+\/approve$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const id = decodeURIComponent(path.split('/')[4]);
    const o = db.coinRecharges.find(x => x.id === id);
    if (o && o.status !== 'approved') {
      o.status = 'approved';
      const u = findUser(db, o.userId);
      if (u) u.coins = (u.coins || 0) + (o.coins || 0) + (o.bonusCoins || 0);
      saveDb(db);
    }
    return { success: true, order: o };
  }
  if (path.match(/^\/api\/admin\/coin-recharges\/[^/]+\/reject$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const id = decodeURIComponent(path.split('/')[4]);
    const o = db.coinRecharges.find(x => x.id === id);
    if (o) { o.status = 'rejected'; saveDb(db); }
    return { success: true, order: o };
  }
  if (path.match(/^\/api\/admin\/users\/[^/]+\/share-swi-app$/) && method === 'POST') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const uid = decodeURIComponent(path.split('/')[4]);
    const user = findUser(db, uid);
    if (user) {
      user.swiAppLink = body.swiAppLink;
      user.swiAppNote = body.swiAppNote;
      user.swiAppSharedAt = new Date().toISOString();
      saveDb(db);
    }
    return { success: true, message: 'SWI 3.3% App Link shared!', user };
  }
  if (path === '/api/admin/upgrades') return { success: true, upgrades: db.planUpgrades };
  if (path.match(/^\/api\/admin\/upgrades\/[^/]+\/status$/) && method === 'POST') {
    const id = decodeURIComponent(path.split('/')[4]);
    const upg = db.planUpgrades.find(u => u.id === id);
    if (upg) {
      upg.status = body.status;
      upg.processedAt = new Date().toISOString();
      if (body.status === 'approved') {
        const u = findUser(db, upg.userId);
        if (u) {
          u.accountType = 'business';
          u.status = 'active';
          u.verifiedAt = u.verifiedAt || new Date().toISOString();
          u.chosenServiceCode = upg.targetServiceCode;
          u.chosenServiceName = upg.targetServiceName;
          u.joiningFee = upg.upgradeFee;
          if (upg.targetServiceCode === 'SWI' && !u.swiAppLink && db.settings.swiSpecialAppLink) {
            u.swiAppLink = db.settings.swiSpecialAppLink;
            u.swiAppSharedAt = new Date().toISOString();
          }
        }
      }
      saveDb(db);
    }
    return { success: true, message: 'Upgrade updated' };
  }
  if (path === '/api/admin/coin-recharges') return { success: true, coinRecharges: db.coinRecharges };
  if (path === '/api/admin/complaints') return { success: true, complaints: db.complaints };
  if (path === '/api/admin/contact-messages') return { success: true, messages: db.contactMessages };
  if (path === '/api/admin/users/activity-overview') {
    return { success: true, totalUsers: db.users.length, onlineCount: db.users.filter(u => u.isOnline).length, onlineUsers: db.users.filter(u => u.isOnline), recentSessions: db.activitySessions };
  }
  if (path === '/api/admin/user-audits') return { success: true, userAudits: db.users };

  // Relationships, Families, PK Battles, Events & Admin Coin Grant static fallback
  if (path === '/api/social/relationships/buy-token' && method === 'POST') {
    const user = findUser(db, body.userId);
    const spec = RELATIONSHIP_TOKENS.find(t => t.id === body.tokenId);
    if (!user || !spec) return { success: false, message: 'Invalid user or token' };
    if ((user.coins || 0) < spec.coinPrice) return { success: false, code: 'INSUFFICIENT_COINS', message: `${spec.coinPrice} Coins चाहिए!` };
    user.coins = (user.coins || 0) - spec.coinPrice;
    if (!Array.isArray(user.ownedRelationshipTokens)) user.ownedRelationshipTokens = [];
    user.ownedRelationshipTokens.push(spec.id);
    saveDb(db);
    return { success: true, message: `${spec.badgeIcon} ${spec.tagName} टोकन खरीदा गया!`, user };
  }
  if (path === '/api/social/relationships/request' && method === 'POST') {
    const user = findUser(db, body.userId);
    const target = findUser(db, body.targetIdentifier);
    const spec = RELATIONSHIP_TOKENS.find(t => t.id === body.tokenId);
    if (!user || !target || !spec) return { success: false, message: 'User or target not found' };
    if (!Array.isArray(user.ownedRelationshipTokens)) user.ownedRelationshipTokens = [];
    const idx = user.ownedRelationshipTokens.indexOf(spec.id);
    if (idx >= 0) user.ownedRelationshipTokens.splice(idx, 1);
    else {
      if ((user.coins || 0) < spec.coinPrice) return { success: false, code: 'INSUFFICIENT_COINS', message: `${spec.coinPrice} Coins चाहिए!` };
      user.coins = (user.coins || 0) - spec.coinPrice;
    }
    const bondId = `BOND-${Date.now()}`;
    if (!Array.isArray(user.activeRelationships)) user.activeRelationships = [];
    if (!Array.isArray(target.activeRelationships)) target.activeRelationships = [];
    user.activeRelationships.unshift({ id: bondId, tokenId: spec.id, tagName: spec.tagName, badgeIcon: spec.badgeIcon, partnerUserId: target.userId, partnerName: target.fullName, partnerAvatar: target.avatar, intimacyPoints: spec.coinPrice, status: 'pending_outgoing', createdAt: new Date().toISOString() });
    target.activeRelationships.unshift({ id: bondId, tokenId: spec.id, tagName: spec.tagName, badgeIcon: spec.badgeIcon, partnerUserId: user.userId, partnerName: user.fullName, partnerAvatar: user.avatar, intimacyPoints: spec.coinPrice, status: 'pending_incoming', createdAt: new Date().toISOString() });
    saveDb(db);
    return { success: true, message: 'प्रस्ताव भेजा गया!', user };
  }
  if (path === '/api/social/relationships/respond' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const bond = (user.activeRelationships || []).find(b => b.id === body.bondId);
    if (bond && body.action === 'accept') {
      bond.status = 'accepted';
      const partner = findUser(db, bond.partnerUserId);
      const pBond = (partner?.activeRelationships || []).find(b => b.id === body.bondId);
      if (pBond) pBond.status = 'accepted';
    } else {
      user.activeRelationships = (user.activeRelationships || []).filter(b => b.id !== body.bondId);
    }
    saveDb(db);
    return { success: true, message: 'अपडेट हो गया!', user };
  }
  if (path === '/api/social/relationships/remove' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (user) {
      user.activeRelationships = (user.activeRelationships || []).filter(b => b.id !== body.bondId);
      saveDb(db);
    }
    return { success: true, message: 'हटा दिया गया।', user };
  }
  if (path === '/api/families' && method === 'GET') {
    return { success: true, families: db.families || [] };
  }
  if (path === '/api/families/create' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    if ((user.coins || 0) < 200) return { success: false, code: 'INSUFFICIENT_COINS', message: '200 Coins चाहिए!' };
    user.coins = (user.coins || 0) - 200;
    const fam: EspFamily = {
      id: `FAM-${Date.now()}`,
      familyCode: String(100000 + (db.families?.length || 0)).slice(0, 6),
      name: String(body.name || 'ESP Royal').trim(),
      emblem: FAMILY_EMBLEMS.includes(body.emblem) ? body.emblem : '👑',
      motto: String(body.motto || 'ESP PLAY Family'),
      founderUserId: user.userId,
      founderName: user.fullName,
      familyCoins: 200,
      familyCharms: user.charms || 0,
      familyLevel: 1,
      level: 1,
      maxMembers: 50,
      isOpenJoin: true,
      members: [{ userId: user.userId, fullName: user.fullName, avatar: user.avatar, role: 'Founder', contributedCoins: 200, joinedAt: new Date().toISOString() }],
      chatMessages: [],
      createdAt: new Date().toISOString(),
    };
    if (!Array.isArray(db.families)) db.families = [];
    db.families.unshift(fam);
    user.familyId = fam.id;
    user.familyRole = 'Founder';
    saveDb(db);
    return { success: true, message: 'ESP Family बन गई!', family: fam, user };
  }
  if (path.match(/^\/api\/families\/[^/]+\/join$/) && method === 'POST') {
    const fid = decodeURIComponent(path.split('/')[3]);
    const fam = (db.families || []).find(f => f.id === fid || f.familyCode === fid);
    const user = findUser(db, body.userId);
    if (!fam || !user) return { success: false, message: 'Not found' };
    if (!fam.members.some(m => m.userId === user.userId)) {
      fam.members.push({ userId: user.userId, fullName: user.fullName, avatar: user.avatar, role: 'Member', contributedCoins: 0, joinedAt: new Date().toISOString() });
    }
    user.familyId = fam.id;
    user.familyRole = 'Member';
    saveDb(db);
    return { success: true, family: fam, user };
  }
  if (path.match(/^\/api\/families\/[^/]+\/donate$/) && method === 'POST') {
    const fid = decodeURIComponent(path.split('/')[3]);
    const fam = (db.families || []).find(f => f.id === fid);
    const user = findUser(db, body.userId);
    const amt = Math.max(10, Number(body.amount) || 50);
    if (!fam || !user || (user.coins || 0) < amt) return { success: false, message: 'पर्याप्त कॉइन्स नहीं हैं' };
    user.coins = (user.coins || 0) - amt;
    fam.familyCoins += amt;
    fam.level = Math.max(1, Math.floor(fam.familyCoins / 500) + 1);
    saveDb(db);
    return { success: true, family: fam, user };
  }
  if (path.match(/^\/api\/families\/[^/]+\/chat$/) && method === 'POST') {
    const fid = decodeURIComponent(path.split('/')[3]);
    const fam = (db.families || []).find(f => f.id === fid);
    const user = findUser(db, body.userId);
    if (!fam || !user) return { success: false, message: 'Not found' };
    fam.chatMessages.push({ id: `fc-${Date.now()}`, familyId: fam.id, senderId: user.userId, senderName: user.fullName, senderAvatar: user.avatar, text: body.text, createdAt: new Date().toISOString() });
    saveDb(db);
    return { success: true, family: fam, user };
  }
  if (path.startsWith('/api/events/') && method === 'GET') {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    const claimed = new Set(user.claimedEventIds || []);
    return {
      success: true,
      events: ESP_EVENTS_CATALOG.map(ev => ({ ...ev, currentProgress: 0, isCompleted: false, isClaimed: claimed.has(ev.id) })),
      user,
    };
  }
  if (path === '/api/admin/users/adjust-coins' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const user = findUser(db, body.userIdentifier);
    if (!user) return { success: false, message: 'User not found' };
    const amt = Math.max(1, Number(body.amount) || 0);
    const before = user.coins || 0;
    user.coins = body.mode === 'debit' ? Math.max(0, before - amt) : before + amt;
    saveDb(db);
    return { success: true, message: 'Coins updated!', user, balanceBefore: before, balanceAfter: user.coins };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/upgrade-tier$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = (db.customVoiceRooms || []).find(r => r.id === rid || r.roomAddress === rid);
    const user = findUser(db, body.userId);
    const spec = getVoiceRoomTierSpec(body.tierId);
    if (!room || !user) return { success: false, message: 'Not found' };
    if (spec.coinPrice > 0 && !(user.unlockedRoomTiers || []).includes(spec.id)) {
      if ((user.coins || 0) < spec.coinPrice) return { success: false, code: 'INSUFFICIENT_COINS', message: `${spec.coinPrice} Coins चाहिए!` };
      user.coins = (user.coins || 0) - spec.coinPrice;
      user.unlockedRoomTiers = [...(user.unlockedRoomTiers || ['normal']), spec.id];
    }
    room.roomTier = spec.id;
    room.isPremiumRoom = spec.id !== 'normal';
    saveDb(db);
    return { success: true, roomPayload: buildStaticRoomDetail(db, room, user.userId), user };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/pk\//) && method === 'POST') {
    const parts = path.split('/');
    const rid = decodeURIComponent(parts[4]);
    const action = parts[6];
    const room = (db.customVoiceRooms || []).find(r => r.id === rid || r.roomAddress === rid);
    if (!room) return { success: false, message: 'Room not found' };
    if (action === 'start') {
      room.pkBattle = { active: true, title: body.title || 'Live PK', redLabel: `${room.hostName} Red`, blueLabel: 'Challenger Blue', redScore: 0, blueScore: 0 };
    } else if (action === 'vote' && room.pkBattle?.active) {
      const pts = (Number(body.coinsToSpend) || 5) * 2;
      if (body.side === 'blue') room.pkBattle.blueScore += pts;
      else room.pkBattle.redScore += pts;
    } else if (action === 'end' && room.pkBattle) {
      room.pkBattle.active = false;
    }
    saveDb(db);
    return { success: true, roomPayload: buildStaticRoomDetail(db, room) };
  }
  if (path === '/api/admin/users/create' && method === 'POST') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const cleanFullName = String(body.fullName || '').trim();
    const cleanPhone = String(body.phone || '').trim();
    const cleanPass = String(body.password || '').trim();
    if (!cleanFullName || !cleanPhone || cleanPass.length < 3) {
      return { success: false, message: 'नाम, मोबाइल और पासवर्ड आवश्यक है।' };
    }
    const uid = `GAME-${Math.floor(100000 + Math.random() * 900000)}`;
    const uname = normalizeStaticUsername(body.username || cleanFullName) || `player${Math.floor(100 + Math.random() * 900)}`;
    const lv = Math.max(1, Math.min(99, Number(body.gameLevel) || 1));
    const vTier = ['silver', 'gold', 'diamond'].includes(body.vipTier) ? body.vipTier : 'none';
    const roomAddr = body.roomNumber ? String(body.roomNumber).replace(/\D/g, '') : String(10001 + db.users.length + 10);
    const created: UserProfile = normalizeStaticUser({
      id: `usr-${Date.now()}`,
      userId: uid,
      gamingId: uid,
      username: uname,
      fullName: cleanFullName,
      phone: cleanPhone,
      email: body.email || `${cleanPhone}@espgaming.club`,
      fullAddress: 'ESP PLAY Arena',
      paymentAddress: '',
      payoutUpiId: '',
      password: cleanPass,
      sponsorId: db.settings.ownerSponsorId,
      sponsorName: db.settings.ownerName,
      chosenServiceCode: 'GAME',
      chosenServiceName: 'ESP GAMING & VOICE CLUB',
      joiningFee: 0,
      joiningDate: todayStr(),
      paymentUtr: 'ADMIN_CREATED_PLAYER',
      status: 'active',
      accountType: 'gamer',
      balance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      promoEarnings: 0,
      totalWithdrawn: 0,
      coins: Math.max(0, Number(body.coins) || 0),
      charms: Math.max(0, Number(body.charms) || 0),
      gameLevel: lv,
      gameXp: (lv - 1) * 150,
      vipTier: vTier as any,
      vipTitle: vTier === 'diamond' ? 'Diamond VIP' : vTier === 'gold' ? 'Gold VIP' : vTier === 'silver' ? 'Silver VIP' : '',
      frameType: (body.frameType || (vTier === 'diamond' ? 'royal-dragon-crown' : vTier === 'gold' ? 'vip-gold' : 'standard')) as any,
      unlockedFrames: ['standard', body.frameType || 'standard'],
      roomAddress: roomAddr,
      personalRoomId: roomAddr,
      clanName: body.clanName || 'Royal Warriors ESP',
      avatar: body.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uname}`,
      bio: body.bio || `Lv.${lv} ESP PLAY Challenger`,
      role: 'member',
      createdAt: new Date().toISOString(),
    });
    db.users.push(created);
    saveDb(db);
    return { success: true, user: created, message: `✅ नया खिलाड़ी "${created.fullName}" बन गया!` };
  }
  if (path.match(/^\/api\/admin\/user\/[^/]+\/edit-details$/) && method === 'PUT') {
    if (!verifyAdminPass(body.adminPassword || adminPassHeader)) return { success: false, message: 'Unauthorized' };
    const uid = decodeURIComponent(path.split('/')[4]);
    const user = findUser(db, uid);
    if (!user) return { success: false, message: 'User not found' };
    const immutableMut =
      (body.userId !== undefined && String(body.userId).trim() !== user.userId) ||
      (body.gamingId !== undefined && String(body.gamingId).trim() !== (user.gamingId || '')) ||
      (body.personalRoomId !== undefined && String(body.personalRoomId).trim() !== (user.personalRoomId || user.roomAddress || '')) ||
      (body.roomAddress !== undefined && String(body.roomAddress).trim() !== (user.roomAddress || '')) ||
      (body.sponsorId !== undefined && String(body.sponsorId).trim() !== user.sponsorId) ||
      (body.sponsorName !== undefined && String(body.sponsorName).trim() !== user.sponsorName);
    if (immutableMut) {
      return {
        success: false,
        code: 'IMMUTABLE_IDENTITY_LOCKED',
        message: 'Personal User ID, Personal Room ID और Sponsor ID लॉक हैं — इन्हें Admin द्वारा भी बदला या डुप्लिकेट नहीं किया जा सकता।',
      };
    }
    if (body.fullName) user.fullName = String(body.fullName).trim();
    if (body.username) user.username = normalizeStaticUsername(body.username);
    if (body.phone !== undefined && String(body.phone).trim()) {
      const cleanPhone = normalizeStaticPhone(String(body.phone)) || String(body.phone).trim();
      const phoneConflict = db.users.find(
        u => u.userId !== user.userId && normalizeStaticPhone(u.phone || '') === cleanPhone && cleanPhone.length >= 10
      );
      if (phoneConflict) {
        return { success: false, code: 'DUPLICATE_PHONE', message: 'यह मोबाइल नंबर पहले से किसी दूसरे यूजर के खाते में पंजीकृत है।' };
      }
      user.phone = cleanPhone;
    }
    if (body.email !== undefined && String(body.email).trim()) {
      const cleanEmail = String(body.email).trim().toLowerCase();
      const emailConflict = db.users.find(
        u => u.userId !== user.userId && (u.email || '').trim().toLowerCase() === cleanEmail
      );
      if (emailConflict) {
        return { success: false, code: 'DUPLICATE_EMAIL', message: 'यह ईमेल पता पहले से किसी दूसरे यूजर के खाते में जुड़ा है।' };
      }
      user.email = cleanEmail;
    }
    if (body.fullAddress !== undefined) user.fullAddress = String(body.fullAddress).trim();
    if (body.paymentAddress !== undefined) {
      user.paymentAddress = String(body.paymentAddress).trim();
      user.payoutUpiId = String(body.payoutUpiId !== undefined ? body.payoutUpiId : body.paymentAddress).trim();
    }
    if (body.password && String(body.password).length >= 3) user.password = String(body.password).trim();
    if (body.balance !== undefined && !isNaN(Number(body.balance))) user.balance = Math.max(0, Number(body.balance));
    if (body.coins !== undefined) user.coins = Math.max(0, Number(body.coins));
    if (body.charms !== undefined) user.charms = Math.max(0, Number(body.charms));
    if (body.gameLevel !== undefined) {
      user.gameLevel = Math.max(1, Number(body.gameLevel));
      user.gameXp = (user.gameLevel - 1) * 150;
    }
    if (body.vipTier) {
      user.vipTier = body.vipTier;
      user.vipTitle = body.vipTier === 'diamond' ? 'Diamond VIP' : body.vipTier === 'gold' ? 'Gold VIP' : body.vipTier === 'silver' ? 'Silver VIP' : '';
    }
    if (body.frameType) user.frameType = body.frameType;
    if (body.status && ['active', 'pending', 'rejected'].includes(body.status)) user.status = body.status;
    if (body.accountType && ['business', 'gamer'].includes(body.accountType)) user.accountType = body.accountType;
    if (body.chosenServiceCode) {
      user.chosenServiceCode = String(body.chosenServiceCode).trim();
      const matched = db.services.find(s => s.code === user.chosenServiceCode);
      if (body.chosenServiceName) user.chosenServiceName = String(body.chosenServiceName).trim();
      else if (matched) user.chosenServiceName = matched.name;
      else if (user.chosenServiceCode === 'GAME') user.chosenServiceName = 'ESP GAMING & VOICE CLUB';
    }
    if (body.joiningFee !== undefined && !isNaN(Number(body.joiningFee))) user.joiningFee = Math.max(0, Number(body.joiningFee));
    if (body.clanName) user.clanName = String(body.clanName).trim();
    saveDb(db);
    return { success: true, user, message: 'डिटेल्स व कंट्रोल सेटिंग्स अपडेट हो गईं!' };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/set-effect$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = (db.customVoiceRooms || []).find(r => r.id === rid || r.roomAddress === rid);
    if (!room) return { success: false, message: 'Room not found' };
    room.roomEffect = body.effect || 'none';
    saveDb(db);
    return { success: true, roomEffect: room.roomEffect, roomPayload: buildStaticRoomDetail(db, room, body.userId) };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/drop-packet$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = (db.customVoiceRooms || []).find(r => r.id === rid || r.roomAddress === rid);
    const user = findUser(db, body.userId);
    if (!room || !user) return { success: false, message: 'Not found' };
    const pool = Math.max(2, Number(body.totalCoins) || 50);
    if ((user.coins || 0) < pool) return { success: false, code: 'INSUFFICIENT_COINS', message: `${pool} Coins चाहिए!` };
    user.coins = (user.coins || 0) - pool;
    if (!Array.isArray(room.activePackets)) room.activePackets = [];
    const packet = {
      id: `pkt-${Date.now()}`,
      roomId: room.id,
      packetType: body.packetType === 'blue' ? 'blue' : 'red',
      senderUserId: user.userId,
      senderName: user.fullName,
      senderAvatar: user.avatar,
      totalCoins: pool,
      remainingCoins: pool,
      maxClaims: Math.max(2, Number(body.maxClaims) || 5),
      claimedBy: [],
      message: body.message || 'Packet Rain!',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
    };
    room.activePackets.unshift(packet);
    saveDb(db);
    return { success: true, packet, user, roomPayload: buildStaticRoomDetail(db, room, user.userId) };
  }
  if (path.match(/^\/api\/game\/voice-rooms\/[^/]+\/claim-packet$/) && method === 'POST') {
    const rid = decodeURIComponent(path.split('/')[4]);
    const room = (db.customVoiceRooms || []).find(r => r.id === rid || r.roomAddress === rid);
    const user = findUser(db, body.userId);
    if (!room || !user) return { success: false, message: 'Not found' };
    const packet = (room.activePackets || []).find((p: any) => p.id === body.packetId);
    if (!packet || packet.remainingCoins <= 0) return { success: false, message: 'Packet exhausted' };
    const won = Math.max(1, Math.min(packet.remainingCoins, Math.ceil(packet.remainingCoins / Math.max(1, packet.maxClaims - packet.claimedBy.length))));
    const xp = packet.packetType === 'blue' ? 12 : 4;
    packet.remainingCoins -= won;
    packet.claimedBy.push({ userId: user.userId, fullName: user.fullName, coinsWon: won, xpWon: xp, claimedAt: new Date().toISOString() });
    user.coins = (user.coins || 0) + won;
    user.gameXp = (user.gameXp || 0) + xp;
    saveDb(db);
    return { success: true, coinsWon: won, xpWon: xp, packetType: packet.packetType, user, roomPayload: buildStaticRoomDetail(db, room, user.userId) };
  }
  if (path === '/api/dm/thread' && method === 'GET') {
    const uid = search.get('userId') || '';
    const pid = search.get('peerId') || '';
    const all = Array.isArray(db.directMessages) ? db.directMessages : [];
    const filtered = pid
      ? all.filter(m => (m.fromUserId === uid && m.toUserId === pid) || (m.fromUserId === pid && m.toUserId === uid))
      : all.filter(m => m.fromUserId === uid || m.toUserId === uid);
    return { success: true, messages: filtered.slice(-120) };
  }
  if (path === '/api/dm/send' && method === 'POST') {
    const sender = findUser(db, body.fromUserId);
    const recipient = findUser(db, body.toUserId);
    if (!sender || !recipient) return { success: false, message: 'User not found' };
    if (!Array.isArray(db.directMessages)) db.directMessages = [];
    const msg: DirectMessageRecord = {
      id: `dm-${Date.now()}`,
      fromUserId: sender.userId,
      fromName: sender.fullName,
      fromAvatar: sender.avatar,
      toUserId: recipient.userId,
      text: body.text || (body.inviteType === 'game' ? `🎮 Play ${body.gameName} with me!` : `🔒 Join Locked Room #${body.roomAddress}`),
      inviteType: body.inviteType,
      gameKey: body.gameKey,
      gameName: body.gameName,
      roomAddress: body.roomAddress,
      roomTitle: body.roomTitle,
      passcode: body.passcode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString(),
    };
    db.directMessages.push(msg);
    saveDb(db);
    const thread = db.directMessages.filter(m => (m.fromUserId === sender.userId && m.toUserId === recipient.userId) || (m.fromUserId === recipient.userId && m.toUserId === sender.userId));
    return { success: true, message: msg, thread, user: sender };
  }
  if (path === '/api/admin/time-weekly-stats' && method === 'GET') {
    const today = todayStr();
    const claimedTodayUsers = db.users
      .filter(u => u.lastDailyCheckInDate === today)
      .map(u => ({
        userId: u.userId,
        fullName: u.fullName,
        username: u.username,
        loginStreak: Number(u.loginStreak || 0),
        lastDailyCheckInDate: u.lastDailyCheckInDate || '',
        coins: Number(u.coins || 0),
      }));
    return {
      success: true,
      today,
      timeMeta: {
        ...getLiveIstTimeMeta(),
        syncSource: 'Browser Edge Clock (IST UTC+05:30)',
        clockSkewMs: 0,
        lastSyncedIso: new Date().toISOString(),
      },
      schedule: SEVEN_DAY_CHECKIN_REWARDS,
      claimedTodayCount: claimedTodayUsers.length,
      activeStreaksCount: db.users.filter(u => Number(u.loginStreak || 0) > 0).length,
      claimedTodayUsers: claimedTodayUsers.slice(0, 30),
    };
  }
  if (path === '/api/admin/resync-time' && method === 'POST') {
    const timeMeta = {
      ...getLiveIstTimeMeta(),
      syncSource: 'Browser Edge Clock (IST UTC+05:30)',
      clockSkewMs: 0,
      lastSyncedIso: new Date().toISOString(),
    };
    return { success: true, message: `Clock Synced (${timeMeta.istTimeLabel})`, timeMeta };
  }
  if (path === '/api/admin/reset-user-daily-claim' && method === 'POST') {
    const target = findUser(db, body.userIdentifier || '');
    if (!target) return { success: false, message: `User "${body.userIdentifier}" नहीं मिला।` };
    const today = todayStr();
    if (body.preserveStreak && Number(target.loginStreak || 0) > 0) {
      target.lastDailyCheckInDate = getYesterdayDateString(today);
    } else {
      target.lastDailyCheckInDate = '';
      target.loginStreak = 0;
    }
    saveDb(db);
    return {
      success: true,
      message: `✅ ${target.fullName} (${target.userId}) का Weekly Claim लॉक रीसेट हो गया!`,
      user: target,
    };
  }

  return { success: true };
}
