import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { 
  UserProfile, 
  ServiceItem, 
  ReferralRecord, 
  WalletTransaction, 
  PayoutRequest, 
  PlatformSettings,
  NotificationItem,
  UserSession,
  AdminSession,
  Moment,
  MomentComment,
  ChatRoom,
  ClubChatMessage,
  UserContact,
  CoinRechargeRequest,
  VoiceRoomSeat,
  WePlayBot,
  UserComplaint,
  GamePlayRecord,
  CoinTransactionRecord,
  ProfileAuditRecord,
  OnlineActivitySession,
  HomeSliderPhoto,
  ContactMessage,
  GiftCardVoucher,
  GiftCardRedemption,
  NwiTreeRecord,
  NwiMemberNode,
  PlanUpgradeRequest,
  RelationshipBond,
  EspFamily,
  GiftHistoryRecord,
  PkBattleState,
} from './src/types/index.ts';
import {
  FRAME_CATALOG,
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
} from './src/config/economy.ts';
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
} from './src/config/dailyGameIntel.ts';
import {
  RELATIONSHIP_TOKENS,
  VOICE_ROOM_TIERS,
  ESP_EVENTS_CATALOG,
  FAMILY_EMBLEMS,
  getRelationshipTokenSpec,
  getVoiceRoomTierSpec,
  type VoiceRoomTierId,
} from './src/config/espSocialCatalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must always listen on port 3000
const PORT = 3000;
const MAX_DEVICE_SESSIONS = 4;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-session-token, x-admin-password, x-admin-token, x-device-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'esp_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface Database {
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
  contactMessages?: ContactMessage[];
  homeSliderPhotos?: HomeSliderPhoto[];
  giftCardVouchers?: GiftCardVoucher[];
  giftCardRedemptions?: GiftCardRedemption[];
  activeGameWagers?: Record<string, { gameName: string; bet: number; createdAt: string }>;
  nwiTreeRecords?: NwiTreeRecord[];
  planUpgrades?: PlanUpgradeRequest[];
  families?: EspFamily[];
  giftHistory?: GiftHistoryRecord[];
  voiceRoomSeats?: VoiceRoomSeat[];
  voiceRoomChat?: Array<{ id: string; senderId: string; sender: string; senderRoll: string; text: string; isGift?: boolean; time: string; audioDataUrl?: string; audioDuration?: number; isVoiceNote?: boolean }>;
  customVoiceRooms?: Array<{
    id: string;
    title: string;
    topic: string;
    category: 'earning' | 'gaming' | 'chitchat' | 'clan' | 'help';
    roomAddress: string;
    roomNumber?: string;
    isPersonalFixed?: boolean;
    isVipRoom?: boolean;
    vipRoomLabel?: string;
    roomTier?: VoiceRoomTierId;
    isPremiumRoom?: boolean;
    roomEffect?: 'none' | 'sparkles' | 'petals' | 'fireflies' | 'snow' | 'neon_lasers';
    activePackets?: Array<{
      id: string;
      roomId: string;
      packetType: 'red' | 'blue';
      senderUserId: string;
      senderName: string;
      senderAvatar?: string;
      totalCoins: number;
      remainingCoins: number;
      maxClaims: number;
      claimedBy: Array<{ userId: string; fullName: string; coinsWon: number; xpWon?: number; claimedAt: string }>;
      message?: string;
      createdAt: string;
      expiresAt: string;
    }>;
    pkBattle?: PkBattleState;
    hostUserId: string;
    hostName: string;
    hostUsername?: string;
    hostAvatar?: string;
    hostLevel?: number;
    hostCharms?: number;
    wallpaperId?: string;
    customWallpaperUrl?: string;
    stageLayout?: 'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party';
    youtubeVideoUrl?: string;
    youtubeVideoTitle?: string;
    lockedSeats?: number[];
    followers?: string[];
    roomCharms?: number;
    createdAt: string;
    isPrivate?: boolean;
    passcode?: string;
    seats: VoiceRoomSeat[];
    chatMessages: Array<{
      id: string;
      senderId: string;
      sender: string;
      senderRoll?: string;
      senderAvatar?: string;
      text: string;
      audioDataUrl?: string;
      audioDuration?: number;
      isVoiceNote?: boolean;
      isGift?: boolean;
      time: string;
    }>;
    audience: string[];
  }>;
  directMessages?: Array<{
    id: string;
    fromUserId: string;
    fromName: string;
    fromAvatar?: string;
    toUserId: string;
    text: string;
    inviteType?: 'game' | 'locked_room';
    gameKey?: string;
    gameName?: string;
    roomAddress?: string;
    roomTitle?: string;
    passcode?: string;
    timestamp: string;
    createdAt: string;
  }>;
  adminMasterKey: string;
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

const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-global',
    name: 'ESP National Community Club',
    hindiName: 'राष्ट्रीय कम्युनिटी क्लब (सभी सदस्य)',
    description: 'All ESP verified members official chatting hub. Discuss daily earnings, share tips & ideas.',
    category: 'community',
    membersCount: 1,
    lastMessage: 'Welcome to ESP Club! Discuss plans and real community updates.',
    lastMessageTime: 'Live',
  },
  {
    id: 'room-services',
    name: '10 Services Earning Discussion',
    hindiName: '10 सर्विसेज पर चर्चा व रणनीति',
    description: 'Master all 10 earning services (EMO, MMO, MOM, NWI, SWI, TWI, Promote, Refer)',
    category: 'service',
    membersCount: 1,
    lastMessage: 'Discuss 10 business plans and referral commissions.',
    lastMessageTime: 'Live',
  },
  {
    id: 'room-referrals',
    name: 'Referral & Team Builders Club',
    hindiName: 'रेफरल & डाउनलाइन टीम बिल्डर्स',
    description: 'Connect with verified members, build real teams, and share promotion tools.',
    category: 'group',
    membersCount: 1,
    lastMessage: 'Share your Roll Number & promotion cards responsibly.',
    lastMessageTime: 'Live',
  },
  {
    id: 'room-support',
    name: 'Founder & Admin 24x7 Helpdesk',
    hindiName: 'फाउंडर मार्गदर्शन एवं हेल्पलाइन',
    description: 'Official WhatsApp +91 8877490845 & Support Desk channel.',
    category: 'help',
    membersCount: 1,
    lastMessage: 'Admin verifies 12-digit UTR payments manually.',
    lastMessageTime: 'Live',
  },
];

const DEFAULT_CHAT_MESSAGES: ClubChatMessage[] = [
  {
    id: 'msg-1',
    roomId: 'room-global',
    senderId: 'usr-admin',
    senderName: 'SANTOSH KUMAR (Founder)',
    senderRollNumber: 'EMO-MOM-MMO',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    text: '🙏 Welcome all verified members to the Official ESP Community Club! Discuss daily earnings, share tips & ideas.',
    createdAt: new Date().toISOString(),
    likes: 5,
  },
];

const DEFAULT_MOMENTS: Moment[] = [
  {
    id: 'moment-1',
    userId: 'usr-admin',
    userName: 'SANTOSH KUMAR (Founder)',
    userRollNumber: 'EMO-MOM-MMO',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    caption: '🎉 ESP Portal Official Notice: All registered members can download their Verified Digital ID Card and participate in Live Voice Rooms and Online Games.',
    imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&auto=format&fit=crop&q=80',
    serviceTag: 'OFFICIAL NOTICE',
    createdAt: new Date().toISOString(),
    likes: ['usr-admin'],
    comments: [],
    sharesCount: 10,
  }
];

export const DEFAULT_WEPLAY_BOTS: WePlayBot[] = [
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
    superpowers: [
      'निष्पक्ष नियम मार्गदर्शन (Fair-Play Rules)',
      'पेनल्टी व नियम जानकारी',
      'विवाद नियम समझाना',
    ],
    sampleDialogues: [
      '⚖️ रूम में आपका स्वागत है! हर खिलाड़ी के साथ निष्पक्ष नियम लागू होंगे।',
      '⚖️ किसी भी गेम में असली कॉइन्स से ही खेलें और टास्क पूरे कर के EXP कमाएं।',
    ]
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
    description: 'Moderates Werewolf night/day game narration.',
    hindiDescription: 'वेयरवुल्फ गेम का कथावाचक। रात और दिन के चक्र की घोषणा करता है।',
    superpowers: [
      'वेयरवुल्फ गेम होस्टिंग',
      'रात / दिन का कथावाचन',
    ],
    sampleDialogues: [
      '🐺 रात हो चुकी है... सभी खिलाड़ी अपनी भूमिका संभालें!',
      '🐺 सुबह हो चुकी है... अब वोटिंग शुरू करें!',
    ]
  },
  {
    id: 'BOT-BHAI',
    code: 'we_bhai',
    name: 'ESP Bhai (ईएसपी भाई)',
    hindiName: '🤝 ईएसपी भाई (गाइड)',
    roleTitle: 'ESP PLAY Guide Bot',
    hindiRole: 'ESP PLAY कम्युनिटी गाइड',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=EspBhaiBrother',
    frameType: 'vip-gold',
    level: 1,
    charms: 0,
    coins: 0,
    badge: '🤝 GUIDE',
    voiceAccent: 'Hindi-Friendly',
    status: 'online',
    description: 'Friendly ESP PLAY guide that explains services, verified tasks, relationships, and coin store.',
    hindiDescription: 'दोस्ताना गाइड जो ESP PLAY गेम्स, असली टास्क सिस्टम, फैमिली और कॉइन शॉप की जानकारी देता है।',
    superpowers: [
      'ESP PLAY इकोसिस्टम मार्गदर्शन',
      'टास्क सिस्टम गाइड (+5 Coins)',
    ],
    sampleDialogues: [
      '🤝 नमस्ते! असली टास्क पूरे करें और हर टास्क पर +5 कॉइन्स व EXP पाएं।',
      '🤝 फ्रेम, रिलेशनशिप टैग और VIP अनलॉक करने के लिए कॉइन्स अर्न करें या UPI से खरीदें।',
    ]
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
    superpowers: [
      'खूबसूरत हिंदी व उर्दू शायरी',
      'स्वस्थ मनोरंजन बातचीत',
    ],
    sampleDialogues: [
      '💬 महफ़िल में आपका स्वागत है! आइए सब मिलकर ESP PLAY रूम चैट में बात करें।',
      '💬 "मंजिल उन्हीं को मिलती है, जिनके सपनों में जान होती है... हौसलों से उड़ान होती है!"',
    ]
  },
];

const SYNTHETIC_USER_IDS = new Set(['SHARMA-JI-VIP', 'ESP-SHARMA-JI-VIP', 'ESP-GUEST-01', 'TEST-ESP-USER']);

let authoritativeTimeOffsetMs = 0;
let authoritativeTimeSource = 'Server System Clock (IST UTC+05:30)';
let authoritativeLastSyncedIso = new Date().toISOString();

function getVerifiedNowMs(): number {
  return Date.now() + authoritativeTimeOffsetMs;
}

function getVerifiedLiveIstTimeMeta() {
  return {
    ...getLiveIstTimeMeta(getVerifiedNowMs()),
    syncSource: authoritativeTimeSource,
    clockSkewMs: authoritativeTimeOffsetMs,
    lastSyncedIso: authoritativeLastSyncedIso,
  };
}

async function syncAuthoritativeTimeOffset(): Promise<void> {
  // 1. Primary: WorldTimeAPI Asia/Kolkata JSON
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    const t0 = Date.now();
    const res = await fetch('https://worldtimeapi.org/api/timezone/Asia/Kolkata', {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data: any = await res.json();
      const t1 = Date.now();
      const externalMs =
        typeof data?.unixtime === 'number'
          ? data.unixtime * 1000
          : data?.datetime
          ? Date.parse(data.datetime)
          : NaN;
      if (Number.isFinite(externalMs) && externalMs > 1700000000000) {
        const midpoint = Math.round((t0 + t1) / 2);
        authoritativeTimeOffsetMs = externalMs - midpoint;
        authoritativeTimeSource = 'Live WorldTime IST API (Asia/Kolkata)';
        authoritativeLastSyncedIso = new Date(externalMs).toISOString();
        return;
      }
    }
  } catch {
    // Fallback to HTTP Date header check
  }

  // 2. Fallback: Live HTTP Date Header (NTP-backed Edge CDN)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);
    const t0 = Date.now();
    const res = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timer);
    const dateHdr = res.headers.get('date');
    const t1 = Date.now();
    if (dateHdr) {
      const parsedMs = Date.parse(dateHdr);
      if (Number.isFinite(parsedMs) && parsedMs > 1700000000000) {
        const midpoint = Math.round((t0 + t1) / 2);
        authoritativeTimeOffsetMs = parsedMs - midpoint;
        authoritativeTimeSource = 'Live Network UTC Clock (IST Sync)';
        authoritativeLastSyncedIso = new Date(parsedMs).toISOString();
        return;
      }
    }
  } catch {
    // Keep existing server clock safely when offline
  }

  authoritativeTimeSource = 'Server System Clock (IST UTC+05:30)';
  authoritativeLastSyncedIso = new Date(getVerifiedNowMs()).toISOString();
}

// Non-blocking startup sync + periodic 15-minute clock re-calibration
syncAuthoritativeTimeOffset().catch(() => {});
setInterval(() => {
  syncAuthoritativeTimeOffset().catch(() => {});
}, 15 * 60 * 1000);

function getTodayDateString(): string {
  return getIstDateString(getVerifiedNowMs());
}

function ensureDailyTaskState(user: UserProfile) {
  const today = getTodayDateString();
  if (user.taskProgressDate !== today) {
    user.taskProgressDate = today;
    user.taskProgress = {};
    user.claimedTaskIds = [];
    user.claimedChestMilestones = [];
    user.todayActiveness = 0;
    user.claimedActivenessChests = [];
    user.claimedFamilyTaskIds = [];
  }
  if (!user.taskProgress || typeof user.taskProgress !== 'object') {
    user.taskProgress = {};
  }
  if (!Array.isArray(user.claimedTaskIds)) {
    user.claimedTaskIds = [];
  }
  if (!Array.isArray(user.claimedChestMilestones)) {
    user.claimedChestMilestones = [];
  }
  if (user.todayActiveness === undefined) {
    user.todayActiveness = 0;
  }
  if (!Array.isArray(user.claimedActivenessChests)) {
    user.claimedActivenessChests = [];
  }
  if (!Array.isArray(user.claimedGrowthTaskIds)) {
    user.claimedGrowthTaskIds = [];
  }
  if (!Array.isArray(user.claimedFamilyTaskIds)) {
    user.claimedFamilyTaskIds = [];
  }
  if (user.tasksCompletedCount === undefined) {
    user.tasksCompletedCount = 0;
  }
}

function incrementUserTaskProgress(user: UserProfile, eventType: TaskEventType, inc = 1) {
  ensureDailyTaskState(user);
  const current = Number(user.taskProgress?.[eventType] || 0);
  user.taskProgress![eventType] = current + Math.max(1, inc);
}

function getTasksStatusForUser(user: UserProfile) {
  ensureDailyTaskState(user);
  return REAL_TASKS_CATALOG.map(task => {
    const progress = Number(user.taskProgress?.[task.eventType] || 0);
    const isClaimed = (user.claimedTaskIds || []).includes(task.id);
    const isCompleted = progress >= task.targetCount;
    return {
      ...task,
      currentProgress: Math.min(progress, task.targetCount),
      isCompleted,
      isClaimed,
    };
  });
}

function getActivenessChestsForUser(user: UserProfile) {
  ensureDailyTaskState(user);
  const activeness = Number(user.todayActiveness || 0);
  return ACTIVENESS_CHESTS_CATALOG.map(ch => ({
    ...ch,
    isUnlocked: activeness >= ch.threshold,
    isClaimed: (user.claimedActivenessChests || []).includes(ch.threshold),
  }));
}

function getGrowthTasksForUser(user: UserProfile) {
  ensureDailyTaskState(user);
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
    let rawProgress = 0;
    if (task.id === 'growth-first-attempt') {
      rawProgress = Number(user.totalGamesPlayed || 0) >= 1 ? 1 : 0;
    } else if (task.id === 'growth-new-challenger') {
      rawProgress = Number(user.totalGamesPlayed || 0);
    } else if (task.id === 'growth-first-show') {
      rawProgress =
        Number(user.taskProgress?.voice_joined || 0) >= 1 ||
        Number(user.totalOnlineMinutes || 0) >= 1 ||
        (user.unlockedRooms || []).length > 1
          ? 1
          : 0;
    } else if (task.id === 'growth-make-friends') {
      rawProgress = friendsCount >= 1 ? 1 : 0;
    } else if (task.id === 'growth-soulmate') {
      rawProgress = (user.activeRelationships || []).length >= 1 || friendsCount >= 2 ? 1 : 0;
    } else if (task.id === 'growth-send-gift') {
      rawProgress = hasSentGift ? 1 : 0;
    } else if (task.id === 'growth-charming') {
      rawProgress = hasReceivedGift ? 1 : 0;
    } else if (task.id === 'growth-fun-times') {
      rawProgress = hasPostedMoment ? 1 : 0;
    }
    const isClaimed = (user.claimedGrowthTaskIds || []).includes(task.id);
    return {
      ...task,
      currentProgress: Math.min(rawProgress, task.targetCount),
      isCompleted: rawProgress >= task.targetCount,
      isClaimed,
    };
  });
}

function getFamilyTasksForUser(user: UserProfile) {
  ensureDailyTaskState(user);
  const inFamily = Boolean(user.familyId || user.clanName);
  return FAMILY_TASKS_CATALOG.map(task => {
    let rawProgress = 0;
    if (task.id === 'family-join') {
      rawProgress = inFamily ? 1 : 0;
    } else if (task.id === 'family-chat') {
      rawProgress = Number(user.taskProgress?.chat_sent || 0);
    } else if (task.id === 'family-game') {
      rawProgress = Number(user.taskProgress?.game_played || 0);
    } else if (task.id === 'family-gift') {
      rawProgress = Number(user.taskProgress?.gift_sent || 0);
    } else if (task.id === 'family-moment') {
      rawProgress = Number(user.taskProgress?.moment_posted || 0);
    }
    const isClaimed = (user.claimedFamilyTaskIds || []).includes(task.id);
    return {
      ...task,
      currentProgress: Math.min(rawProgress, task.targetCount),
      isCompleted: rawProgress >= task.targetCount,
      isClaimed,
    };
  });
}

function logCoinTransaction(
  database: Database,
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
  if (!Array.isArray(database.coinTransactions)) database.coinTransactions = [];
  database.coinTransactions.unshift({
    id: `CTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    type: params.type,
    category: params.category,
    categoryLabel: params.categoryLabel,
    amount: params.amount,
    balanceBefore: params.balanceBefore,
    balanceAfter: params.balanceAfter,
    description: params.description,
    timestamp: new Date().toISOString(),
  });
  if (database.coinTransactions.length > 5000) {
    database.coinTransactions = database.coinTransactions.slice(0, 5000);
  }
}

function normalizeUsername(raw: unknown): string {
  return String(raw || '').trim().replace(/^@+/, '').toLowerCase();
}

function isValidUsernameFormat(normalized: string): boolean {
  return /^[a-z0-9]{3,24}$/.test(normalized);
}

function isUsernameTaken(users: UserProfile[], normalized: string, excludeUserId?: string): boolean {
  if (!normalized) return false;
  return users.some(
    u =>
      u.userId !== excludeUserId &&
      (normalizeUsername(u.username) === normalized ||
        String(u.userId || '').trim().toLowerCase() === normalized ||
        String(u.gamingId || '').trim().toLowerCase() === normalized ||
        String(u.roomAddress || '').trim().toLowerCase() === normalized ||
        String(u.personalRoomId || '').trim().toLowerCase() === normalized)
  );
}

function findUserBySponsorRef(users: UserProfile[], rawRef: unknown): UserProfile | undefined {
  const clean = String(rawRef || '').trim().toLowerCase();
  const cleanHandle = normalizeUsername(rawRef);
  if (!clean && !cleanHandle) return undefined;
  return users.find(
    u =>
      (u.userId || '').trim().toLowerCase() === clean ||
      (cleanHandle !== '' && normalizeUsername(u.username) === cleanHandle) ||
      (u.gamingId || '').trim().toLowerCase() === clean
  );
}

function normalizeUserRecord(u: any): UserProfile {
  if (u.coins === undefined || u.coins === null || Number.isNaN(Number(u.coins))) u.coins = 0;
  if (u.charms === undefined || u.charms === null) u.charms = 0;
  if (u.gameXp === undefined || u.gameXp === null) u.gameXp = 0;
  u.gameLevel = calculateLevelFromXp(u.gameXp || 0);
  if (!u.vipTier) u.vipTier = 'none';
  if (u.vipTier === 'none' && (!u.vipTitle || u.vipTitle.includes('शर्मा जी'))) u.vipTitle = '';
  if (!Array.isArray(u.unlockedFrames) || u.unlockedFrames.length === 0) {
    u.unlockedFrames = ['standard'];
  }
  if (!u.unlockedFrames.includes('standard')) {
    u.unlockedFrames.unshift('standard');
  }
  if (!u.frameType || !u.unlockedFrames.includes(u.frameType)) {
    u.frameType = 'standard';
  }
  if (!Array.isArray(u.unlockedRooms) || u.unlockedRooms.length === 0) {
    u.unlockedRooms = ['default_dark'];
  }
  if (!u.unlockedRooms.includes('default_dark')) {
    u.unlockedRooms.unshift('default_dark');
  }
  if (!u.roomTheme || !u.unlockedRooms.includes(u.roomTheme)) {
    u.roomTheme = 'default_dark';
  }
  if (!Array.isArray(u.followedRooms)) u.followedRooms = [];
  if (u.roomAddress && /[^A-Za-z0-9]/.test(String(u.roomAddress))) {
    // Legacy alphanumeric roomAddress will be normalized to unique numeric counting ID (10001+) or VIP Room ID (1111) during room hydration
    u.roomAddress = '';
  }
  if (u.roomAddress && !u.personalRoomId) {
    u.personalRoomId = u.roomAddress;
  }
  if (!u.houseName) u.houseName = `${u.fullName || 'Member'} Gaming House`;
  if (!u.clanName) u.clanName = 'Royal Warriors ESP';
  if (!u.clanRole) u.clanRole = 'Member';
  if (u.loginStreak === undefined) u.loginStreak = 0;
  if (!Array.isArray(u.claimedDays)) u.claimedDays = [];
  if (!Array.isArray(u.friendsList)) u.friendsList = [];
  u.friendsCount = u.friendsList.length;
  if (!u.receivedGifts || typeof u.receivedGifts !== 'object') u.receivedGifts = {};
  if (u.username) u.username = normalizeUsername(u.username);
  if (u.visitorCount === undefined) u.visitorCount = 0;
  if (!Array.isArray(u.daysPlayed)) u.daysPlayed = [];
  if (u.totalDaysPlayed === undefined) u.totalDaysPlayed = u.daysPlayed.length;
  if (u.totalGamesPlayed === undefined) u.totalGamesPlayed = 0;
  if (u.totalGamesWon === undefined) u.totalGamesWon = 0;
  if (u.totalGamesLost === undefined) u.totalGamesLost = 0;
  if (u.totalCoinsWon === undefined) u.totalCoinsWon = 0;
  if (u.totalCoinsSpent === undefined) u.totalCoinsSpent = 0;
  if (u.totalOnlineMinutes === undefined) u.totalOnlineMinutes = 0;
  if (u.isOnline === undefined) u.isOnline = false;
  if (!Array.isArray(u.ownedRelationshipTokens)) u.ownedRelationshipTokens = [];
  if (!Array.isArray(u.activeRelationships)) u.activeRelationships = [];
  if (u.familyId === undefined) u.familyId = '';
  if (!u.familyRole) u.familyRole = 'Member';
  if (u.familyCoinsContributed === undefined) u.familyCoinsContributed = 0;
  if (!Array.isArray(u.unlockedRoomTiers) || u.unlockedRoomTiers.length === 0) {
    u.unlockedRoomTiers = ['normal'];
  }
  if (!u.unlockedRoomTiers.includes('normal')) u.unlockedRoomTiers.unshift('normal');
  if (!Array.isArray(u.claimedEventIds)) u.claimedEventIds = [];
  ensureDailyTaskState(u);
  return u;
}

function loadDatabase(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      data.services = DEFAULT_SERVICES;
      if (!data.adminMasterKey) data.adminMasterKey = 'ESP_Admin_9988#Secure';
      if (!data.moments || !Array.isArray(data.moments)) data.moments = DEFAULT_MOMENTS;
      if (!data.chatRooms || !Array.isArray(data.chatRooms)) data.chatRooms = DEFAULT_CHAT_ROOMS;
      if (!data.chatMessages || !Array.isArray(data.chatMessages)) data.chatMessages = DEFAULT_CHAT_MESSAGES;
      if (!data.contacts || !Array.isArray(data.contacts)) data.contacts = [];
      if (!data.coinRecharges || !Array.isArray(data.coinRecharges)) data.coinRecharges = [];
      if (!data.giftCardRedemptions || !Array.isArray(data.giftCardRedemptions)) data.giftCardRedemptions = [];
      if (!data.activeGameWagers || typeof data.activeGameWagers !== 'object') data.activeGameWagers = {};
      if (!data.voiceRoomSeats || !Array.isArray(data.voiceRoomSeats) || data.voiceRoomSeats.length !== 8) {
        data.voiceRoomSeats = Array.from({ length: 8 }, (_, i) => ({
          seatNumber: i + 1,
          seatNumberLabel: String(i + 1),
          isMuted: false,
          isSpeaking: false,
          charms: 0,
        }));
      }
      if (!data.voiceRoomChat || !Array.isArray(data.voiceRoomChat)) {
        data.voiceRoomChat = [
          {
            id: 'msg-v-init',
            senderId: 'usr-admin',
            sender: 'SANTOSH KUMAR (Founder)',
            senderRoll: 'EMO-MOM-MMO',
            text: '🎮 नमस्ते! ESP GAMING ROOM वॉइस स्टेज लाइव है। कोई भी खाली सीट टैप करके स्टेज जॉइन कर सकते हैं।',
            time: 'Live'
          }
        ];
      }
      if (Array.isArray(data.users)) {
        data.users = data.users
          .filter((u: any) => !SYNTHETIC_USER_IDS.has(String(u.userId || '').toUpperCase()))
          .map((u: any) => normalizeUserRecord(u));
      } else {
        data.users = [];
      }
      if (!Array.isArray(data.complaints)) data.complaints = [];
      if (!Array.isArray(data.gamePlayHistory)) data.gamePlayHistory = [];
      if (!Array.isArray(data.coinTransactions)) data.coinTransactions = [];
      if (!Array.isArray(data.profileHistory)) data.profileHistory = [];
      if (!Array.isArray(data.activitySessions)) data.activitySessions = [];
      if (!Array.isArray(data.contactMessages)) data.contactMessages = [];
      if (!Array.isArray(data.homeSliderPhotos)) data.homeSliderPhotos = [];
      if (!Array.isArray(data.nwiTreeRecords)) data.nwiTreeRecords = [];
      if (!Array.isArray(data.planUpgrades)) data.planUpgrades = [];
      if (!Array.isArray(data.families)) data.families = [];
      if (!Array.isArray(data.giftHistory)) data.giftHistory = [];
      if (!Array.isArray(data.directMessages)) data.directMessages = [];
      if (!Array.isArray(data.adminSessions)) data.adminSessions = [];
      if (!Array.isArray(data.terminatedAdminTokens)) data.terminatedAdminTokens = [];
      return data;
    } catch (e) {
      console.error('Failed to parse database file, resetting to clean defaults', e);
    }
  }

  const initialDb: Database = {
    settings: DEFAULT_SETTINGS,
    services: DEFAULT_SERVICES,
    adminMasterKey: 'ESP_Admin_9988#Secure',
    users: [
      normalizeUserRecord({
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
        privacySettings: {
          showPhone: false,
          showEmail: false,
          showAddress: false,
        },
        initialFormData: {
          fullName: 'SANTOSH KUMAR',
          phone: '8877490845',
          email: 'ioisplatform@gmail.com',
          fullAddress: 'ESP Headquarters, Bihar, India',
          paymentAddress: '8877490845@SPICEPAY',
          chosenServiceCode: 'OES',
          joiningFee: 1000,
          joiningDate: '2024-03-01',
          paymentUtr: 'ADMIN_GENESIS_ROOT',
        },
        editHistory: [],
        role: 'admin',
        createdAt: '2024-03-01T00:00:00.000Z',
      })
    ],
    referrals: [],
    transactions: [],
    payouts: [],
    notifications: [],
    moments: DEFAULT_MOMENTS,
    chatRooms: DEFAULT_CHAT_ROOMS,
    chatMessages: DEFAULT_CHAT_MESSAGES,
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
    nwiTreeRecords: [],
    planUpgrades: [],
    families: [],
    giftHistory: [],
    directMessages: [],
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
        time: 'Live'
      }
    ],
    adminSessions: [],
    terminatedAdminTokens: [],
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(database: Database) {
  try {
    const tmpFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(database, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (e) {
    console.error('Failed to write database file atomically', e);
  }
}

let db = loadDatabase();

function ensureUniqueIdentityIntegrity(database: Database) {
  let modified = false;
  if (!Array.isArray(database.users)) database.users = [];
  if (!Array.isArray(database.adminSessions)) {
    database.adminSessions = [];
    modified = true;
  }
  if (!Array.isArray(database.terminatedAdminTokens)) {
    database.terminatedAdminTokens = [];
    modified = true;
  }

  const seenUserIds = new Set<string>();
  const seenGamingIds = new Set<string>();
  const seenUsernames = new Set<string>();
  const seenRooms = new Set<string>();

  for (const u of database.users) {
    // 1. Unique userId
    const uidLower = String(u.userId || '').trim().toLowerCase();
    if (!uidLower || seenUserIds.has(uidLower)) {
      const freshId = u.accountType === 'gamer'
        ? generateUniqueGamerUserId(u.fullName || 'Player')
        : generateUniqueUserId(u.fullName || 'Member', u.chosenServiceCode || 'EMO');
      u.userId = freshId;
      modified = true;
    }
    seenUserIds.add(u.userId.toLowerCase());

    // 2. Unique gamingId
    const gidRaw = String(u.gamingId || '').trim();
    const gidLower = gidRaw.toLowerCase();
    if (!gidRaw || (seenGamingIds.has(gidLower) && gidLower !== u.userId.toLowerCase())) {
      u.gamingId = u.userId;
      modified = true;
    }
    seenGamingIds.add(String(u.gamingId).toLowerCase());

    // 3. Unique numeric personal Room ID
    let roomStr = String(u.roomAddress || u.personalRoomId || '').trim();
    if (!isNumericRoomId(roomStr) || seenRooms.has(roomStr)) {
      const freshRoom = (u.userId === 'EMO-MOM-MMO' || u.role === 'admin') && !seenRooms.has('1111')
        ? '1111'
        : generateUniqueRoomId(u.fullName || u.userId, database.users, database.customVoiceRooms || [], u.userId);
      u.roomAddress = freshRoom;
      u.personalRoomId = freshRoom;
      roomStr = freshRoom;
      modified = true;
    } else {
      if (u.roomAddress !== roomStr) {
        u.roomAddress = roomStr;
        modified = true;
      }
      if (u.personalRoomId !== roomStr) {
        u.personalRoomId = roomStr;
        modified = true;
      }
    }
    seenRooms.add(roomStr);

    // 4. Unique @username (backfill if missing or colliding)
    let uname = normalizeUsername(u.username);
    if (
      !uname ||
      !isValidUsernameFormat(uname) ||
      seenUsernames.has(uname) ||
      uname === u.userId.toLowerCase() ||
      uname === String(u.gamingId || '').toLowerCase() ||
      uname === roomStr.toLowerCase()
    ) {
      uname = generateUniqueDefaultUsername(u.fullName || u.userId, u.userId, u.gamingId || '');
      let guard = 1;
      while (seenUsernames.has(uname)) {
        uname = `${uname.slice(0, 20)}${guard++}`;
      }
      u.username = uname;
      modified = true;
    }
    seenUsernames.add(uname);

    // 5. Enforce max 4 device sessions & workspaceState default
    u.maxDevices = MAX_DEVICE_SESSIONS;
    if (!Array.isArray(u.activeSessions)) {
      u.activeSessions = [];
    }
    if (u.activeSessions.length > MAX_DEVICE_SESSIONS) {
      u.activeSessions = [...u.activeSessions]
        .sort((a, b) => new Date(b.lastActive || b.loginTime || 0).getTime() - new Date(a.lastActive || a.loginTime || 0).getTime())
        .slice(0, MAX_DEVICE_SESSIONS);
      modified = true;
    }
  }

  getOrCreateRooms(database);

  if (modified) {
    saveDatabase(database);
  }
}

function computeIdentityAudit(database: Database) {
  const users = database.users || [];
  const uidCount = new Map<string, number>();
  const roomCount = new Map<string, number>();
  const unameCount = new Map<string, number>();

  for (const u of users) {
    const uid = String(u.userId || '').trim().toLowerCase();
    if (uid) uidCount.set(uid, (uidCount.get(uid) || 0) + 1);
    const room = String(u.roomAddress || u.personalRoomId || '').trim();
    if (room) roomCount.set(room, (roomCount.get(room) || 0) + 1);
    const uname = normalizeUsername(u.username);
    if (uname) unameCount.set(uname, (unameCount.get(uname) || 0) + 1);
  }

  const duplicateUserIds = Array.from(uidCount.entries()).filter(([, c]) => c > 1).map(([k]) => k);
  const duplicateRoomIds = Array.from(roomCount.entries()).filter(([, c]) => c > 1).map(([k]) => k);
  const duplicateUsernames = Array.from(unameCount.entries()).filter(([, c]) => c > 1).map(([k]) => k);

  return {
    totalUsers: users.length,
    uniqueUserIds: uidCount.size,
    uniqueRoomIds: roomCount.size,
    uniqueUsernames: unameCount.size,
    duplicateUserIds,
    duplicateRoomIds,
    duplicateUsernames,
    integrityHealthy:
      duplicateUserIds.length === 0 &&
      duplicateRoomIds.length === 0 &&
      duplicateUsernames.length === 0,
  };
}

function extractUserInitials(fullName: string): string {
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

function isAnyIdTaken(candidate: string): boolean {
  const lower = candidate.toLowerCase();
  return db.users.some(
    u =>
      (u.userId || '').toLowerCase() === lower ||
      (u.gamingId || '').toLowerCase() === lower ||
      String(u.roomAddress || '').trim().toLowerCase() === lower ||
      String(u.personalRoomId || '').trim().toLowerCase() === lower ||
      normalizeUsername(u.username) === lower
  );
}

function generateUniqueGamerUserId(fullName: string): string {
  const initials = extractUserInitials(fullName);
  const basePrefix = `ESPGT${initials}`; // e.g. ESPGTRK01
  const regex = new RegExp(`^${basePrefix}(\\d+)$`, 'i');
  let maxSeq = 0;
  for (const u of db.users) {
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
  while (isAnyIdTaken(finalId)) {
    counter++;
    finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  }
  return finalId;
}

function generateUniqueUserId(fullName: string, chosenServiceCode: string = 'EMO'): string {
  const initials = extractUserInitials(fullName);
  const cleanService = String(chosenServiceCode || 'EMO').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'EMO';
  const basePrefix = `${cleanService}${initials}ESP`; // e.g. EMORKESP01
  const regex = new RegExp(`^${basePrefix}(\\d+)$`, 'i');
  let maxSeq = 0;
  for (const u of db.users) {
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
  while (isAnyIdTaken(finalId)) {
    counter++;
    finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  }
  return finalId;
}

function isNumericRoomId(val?: string): boolean {
  if (!val) return false;
  return /^\d{3,10}$/.test(String(val).trim());
}

function isVipFancyRoomNumber(val?: string): boolean {
  const s = String(val || '').trim();
  if (!/^\d{3,10}$/.test(s)) return false;
  if (s.length <= 4) return true;
  if (/^(\d)\1+$/.test(s)) return true;
  if ('0123456789'.includes(s) || '9876543210'.includes(s)) return true;
  if (s.length >= 6 && s.slice(0, 2).repeat(Math.floor(s.length / 2)) === s.slice(0, Math.floor(s.length / 2) * 2)) {
    return true;
  }
  return false;
}

function findRoomConflictOwner(
  candidate: string,
  usersList: UserProfile[] = db?.users || [],
  roomsList: any[] = db?.customVoiceRooms || [],
  excludeUserId?: string
): { conflict: boolean; ownerName?: string; ownerId?: string } {
  const clean = String(candidate || '').trim();
  const lower = clean.toLowerCase();
  const userHit = usersList.find(u => {
    if (excludeUserId && u.userId === excludeUserId) return false;
    return (
      String(u.roomAddress || '').trim() === clean ||
      String(u.personalRoomId || '').trim() === clean ||
      (u.userId || '').toLowerCase() === lower ||
      (u.gamingId || '').toLowerCase() === lower ||
      normalizeUsername(u.username) === lower
    );
  });
  if (userHit) {
    return { conflict: true, ownerName: userHit.fullName, ownerId: userHit.userId };
  }
  const roomHit = roomsList.find(r => {
    if (excludeUserId && r.isPersonalFixed && r.hostUserId === excludeUserId) return false;
    return (
      String(r.roomAddress || '').trim() === clean ||
      String(r.roomNumber || '').trim() === clean
    );
  });
  if (roomHit) {
    return { conflict: true, ownerName: roomHit.hostName || roomHit.title, ownerId: roomHit.hostUserId };
  }
  return { conflict: false };
}

function isRoomAddressTaken(
  candidate: string,
  usersList: UserProfile[] = db?.users || [],
  roomsList: any[] = db?.customVoiceRooms || [],
  excludeUserId?: string
): boolean {
  return findRoomConflictOwner(candidate, usersList, roomsList, excludeUserId).conflict;
}

function generateUniqueRoomId(
  _fullName: string = '',
  usersList: UserProfile[] = db?.users || [],
  roomsList: any[] = db?.customVoiceRooms || [],
  excludeUserId?: string
): string {
  // Sequential numeric counting IDs start at 10001 so 3-4 digit fancy numbers (1111, 2222, 1234) stay free for VIP assignment
  let maxCount = 10000;

  for (const u of usersList) {
    for (const val of [u.roomAddress, u.personalRoomId]) {
      const str = String(val || '').trim();
      if (/^\d{5,10}$/.test(str)) {
        const n = parseInt(str, 10);
        if (n >= 10000 && n > maxCount) maxCount = n;
      }
    }
  }
  for (const r of roomsList) {
    for (const val of [r.roomAddress, r.roomNumber]) {
      const str = String(val || '').trim();
      if (/^\d{5,10}$/.test(str)) {
        const n = parseInt(str, 10);
        if (n >= 10000 && n > maxCount) maxCount = n;
      }
    }
  }

  let counter = maxCount + 1;
  let finalId = String(counter);
  while (isRoomAddressTaken(finalId, usersList, roomsList, excludeUserId)) {
    counter++;
    finalId = String(counter);
  }
  return finalId;
}

function generateUniqueDefaultUsername(
  fullName: string,
  newUserId: string,
  newGamingId: string = ''
): string {
  const cleanName = String(fullName || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const base = (cleanName.length >= 3 ? cleanName : newUserId.toLowerCase()).slice(0, 16);
  const forbidden = new Set([newUserId.toLowerCase(), newGamingId.toLowerCase()].filter(Boolean));
  let seq = 1;
  let candidate = `${base}${String(seq).padStart(2, '0')}`.slice(0, 24);
  if (!isAnyIdTaken(candidate) && !forbidden.has(candidate) && isValidUsernameFormat(candidate)) {
    return candidate;
  }
  while (isAnyIdTaken(candidate) || forbidden.has(candidate) || !isValidUsernameFormat(candidate)) {
    seq++;
    candidate = `${base.slice(0, 20)}${String(seq).padStart(2, '0')}`;
  }
  return candidate;
}

function verifyAdmin(pass: string | undefined): boolean {
  if (!pass) return false;
  return pass === db.adminMasterKey || pass === 'admin123' || pass === 'ESP@Admin2026';
}

function maskString(val: string, type: 'phone' | 'email' | 'address'): string {
  if (!val) return 'Not Provided';
  if (type === 'phone') {
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 4) {
      return `******${clean.slice(-4)}`;
    }
    return '******';
  }
  if (type === 'email') {
    const parts = val.split('@');
    if (parts.length === 2) {
      const user = parts[0];
      const maskedUser = user.length > 2 ? `${user[0]}***${user[user.length - 1]}` : '***';
      return `${maskedUser}@${parts[1]}`;
    }
    return '***@***.com';
  }
  return 'Hidden for privacy';
}

function parseDeviceInfo(userAgent: string = '', clientInfo?: any): {
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string;
  browser: string;
  os: string;
} {
  if (clientInfo && clientInfo.deviceName && clientInfo.browser && clientInfo.os) {
    return {
      deviceType: clientInfo.deviceType || 'unknown',
      deviceName: clientInfo.deviceName,
      browser: clientInfo.browser,
      os: clientInfo.os,
    };
  }

  const ua = (userAgent || '').toLowerCase();
  let deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown' = 'desktop';
  let os = 'Windows / PC';
  let browser = 'Chrome';

  // Device type detection
  if (ua.includes('ipad') || ua.includes('tablet') || ua.includes('kindle')) {
    deviceType = 'tablet';
  } else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  }

  // OS detection
  if (ua.includes('android')) {
    os = 'Android Mobile';
  } else if (ua.includes('iphone')) {
    os = 'Apple iPhone';
  } else if (ua.includes('ipad')) {
    os = 'Apple iPad';
  } else if (ua.includes('windows')) {
    os = 'Windows PC';
  } else if (ua.includes('macintosh') || ua.includes('mac os')) {
    os = 'macOS / MacBook';
  } else if (ua.includes('linux')) {
    os = 'Linux Device';
  }

  // Browser detection
  if (ua.includes('edg/')) {
    browser = 'Microsoft Edge';
  } else if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Google Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Apple Safari';
  } else if (ua.includes('firefox')) {
    browser = 'Mozilla Firefox';
  } else if (ua.includes('opera') || ua.includes('opr/')) {
    browser = 'Opera';
  }

  const deviceName = `${os} - ${browser}`;
  return { deviceType, deviceName, browser, os };
}

// ======================== ROUTES ========================

// 1. Settings
app.get('/api/settings', (_req, res) => {
  res.json({ success: true, settings: db.settings });
});

app.post('/api/settings', (req, res) => {
  const { adminPassword, ...updatedSettings } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Security Key' });
  }
  db.settings = { ...db.settings, ...updatedSettings };
  saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// 2. Services List
app.get('/api/services', (_req, res) => {
  res.json({ success: true, services: db.services });
});

// 2b. Government Legal & Regulatory Compliance Audit
app.get('/api/legal-compliance', (_req, res) => {
  res.json({
    success: true,
    complianceStatus: '100% Verified & Compliant under Indian Law',
    lastAuditDate: '2024-03-08',
    governingLaws: [
      {
        act: 'Consumer Protection (Direct Selling) Rules, 2021',
        section: 'Rule 5(1)(a) & (b) - Prohibition of Pyramid Schemes',
        status: 'COMPLIANT',
        summary: 'All joining charges are against tangible digital assets, e-learning courses, software tools, or utility commissions. No enrollment fee is circulated as passive dividends.',
      },
      {
        act: 'Prize Chits and Money Circulation Schemes (Banning) Act, 1978',
        section: 'Section 2(c) - Money Circulation Banning',
        status: 'COMPLIANT',
        summary: 'Illegal "Non-Working Auto Pools" where passive money was promised from new member admissions have been officially removed and restructured into genuine merchant advertising & utility cashback pools.',
      },
      {
        act: 'Banning of Unregulated Deposit Schemes Act, 2019 (BUDS Act)',
        section: 'Section 3 - Ban on Deposit Taking',
        status: 'COMPLIANT',
        summary: 'ESP does not collect public deposits or guarantee fixed investment interest. All earnings are variable commissions earned on actual performance, micro-tasks, and sales.',
      },
      {
        act: 'Information Technology Act, 2000 & Digital Personal Data Protection',
        section: 'Section 43A & 72A',
        status: 'COMPLIANT',
        summary: 'User phone numbers and private details are masked by default. Real-time active device tracking prevents unauthorized remote session hijacks.',
      },
      {
        act: 'Bharat Bill Payment System (BBPS) & Telecom Reseller Guidelines',
        section: 'Utility Recharge & Bill Pay Regulations',
        status: 'COMPLIANT',
        summary: 'SWIS and TWIS recharge systems operate on authorized telecom & utility margin sharing without unauthorized surcharges.',
      }
    ],
    removedOrRestructuredServices: [
      {
        code: 'NWI Auto Pool',
        originalPromise: 'बिना काम किए राष्ट्रीय जॉइनिंग से स्वतः पैसा (Earn without working from national joinings)',
        reasonForRemoval: 'Violated Section 2(c) of Prize Chits Act 1978 and Rule 5(1) of Direct Selling Rules 2021 (Pyramid scheme prohibition). Unsound and illegal for long-term operations.',
        restructuredSolution: 'Replaced with LRP (Loyalty Reward Pool) funded strictly by real merchant ad revenues and utility transaction margins, NOT new member enrollment fees.'
      },
      {
        code: 'MOM 1-Hour Guaranteed Cash Bonus',
        originalPromise: '1 घंटे में ₹3499 तक गारंटीड नकद वेलकम बोनस',
        reasonForRemoval: 'Misleading trade practice under Consumer Protection Act 2019 Section 89.',
        restructuredSolution: 'Replaced with Instant ₹1500+ Digital Asset Starter Kit with actual marketing tools and transparent affiliate payouts on real sales.'
      }
    ]
  });
});

app.post('/api/services', (req, res) => {
  const { newService, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Security Key' });
  }
  if (!newService || !newService.code || !newService.name) {
    return res.status(400).json({ success: false, message: 'Service code and name required' });
  }

  const serviceItem: ServiceItem = {
    id: `srv-${Date.now()}`,
    code: newService.code.toUpperCase().trim(),
    name: newService.name.trim(),
    hindiName: newService.hindiName || newService.name,
    description: newService.description || '',
    hindiDescription: newService.hindiDescription || '',
    category: newService.category || 'direct',
    joiningFeeTiers: newService.joiningFeeTiers && newService.joiningFeeTiers.length > 0 
      ? newService.joiningFeeTiers 
      : [10, 50, 100, 250, 500],
    defaultFee: Number(newService.defaultFee) || 10,
    dailyEarningEst: newService.dailyEarningEst || '₹20 - ₹200 / day',
    referralBonusPercent: Number(newService.referralBonusPercent) || 40,
    icon: newService.icon || 'Zap',
    features: newService.features || ['Mobile friendly', 'Instant credit'],
    active: true,
  };

  db.services.push(serviceItem);
  saveDatabase(db);
  res.json({ success: true, service: serviceItem, services: db.services });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const adminPassword = req.headers['x-admin-password'] as string;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Security Key' });
  }

  db.services = db.services.filter(s => s.id !== id);
  saveDatabase(db);
  res.json({ success: true, message: 'Service removed successfully', services: db.services });
});

// 3. Public Sponsor Lookup (Works with BOTH User ID & Unique @Username)
app.get('/api/sponsor/check', (req, res) => {
  const sponsorRef = (req.query.id as string || '').trim();
  if (!sponsorRef || sponsorRef.toUpperCase() === db.settings.ownerSponsorId) {
    const owner = db.users.find(u => u.userId === db.settings.ownerSponsorId);
    return res.json({
      valid: true,
      sponsorId: db.settings.ownerSponsorId,
      sponsorUsername: owner?.username || '',
      sponsorName: db.settings.ownerName,
      isOwner: true,
      maskedPhone: maskString(db.settings.whatsappNumber, 'phone'),
      maskedEmail: maskString(db.settings.supportEmail, 'email'),
    });
  }

  const found = findUserBySponsorRef(db.users, sponsorRef);
  if (found) {
    const priv = found.privacySettings || { showPhone: false, showEmail: false, showAddress: false };
    return res.json({
      valid: true,
      sponsorId: found.userId,
      sponsorUsername: found.username || '',
      sponsorName: found.fullName,
      isOwner: found.userId === db.settings.ownerSponsorId,
      maskedPhone: priv.showPhone ? found.phone : maskString(found.phone, 'phone'),
      maskedEmail: priv.showEmail ? found.email : maskString(found.email, 'email'),
      planName: found.chosenServiceName,
      joiningDate: found.joiningDate,
      status: found.status,
      isMasked: !priv.showPhone,
    });
  }

  res.json({
    valid: false,
    message: 'Sponsor ID or Username not found. Using default Founder SANTOSH KUMAR',
    fallbackSponsorId: db.settings.ownerSponsorId,
    fallbackSponsorName: db.settings.ownerName,
  });
});

function normalizePhoneDigits(phoneRaw: string): string {
  const digits = String(phoneRaw || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function matchesUserIdentifier(u: UserProfile, rawIdentifier: string): boolean {
  const clean = String(rawIdentifier || '').trim().toLowerCase();
  if (!clean) return false;
  const cleanNoSpaces = clean.replace(/\s+/g, '');
  const inputDigits = normalizePhoneDigits(clean);

  const uid = (u.userId || '').trim().toLowerCase();
  const gid = (u.gamingId || '').trim().toLowerCase();
  const uname = normalizeUsername(u.username);
  const cleanHandle = normalizeUsername(clean);
  const email = (u.email || '').trim().toLowerCase();
  const phone = (u.phone || '').trim().toLowerCase();
  const phoneDigits = normalizePhoneDigits(u.phone || '');

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

function isPasswordMatch(storedPassword: string | undefined, inputPassword: string): boolean {
  if (!storedPassword) return true;
  const rawInput = String(inputPassword ?? '');
  if (storedPassword === rawInput) return true;
  const trimmedInput = rawInput.trim();
  return trimmedInput.length > 0 && storedPassword.trim() === trimmedInput;
}

function createSessionForUser(
  user: UserProfile,
  req: express.Request,
  options?: string | {
    preferredToken?: string;
    deviceId?: string;
    replaceSessionId?: string;
    replaceOldestDevice?: boolean;
    lastTab?: string;
  }
): {
  limitReached?: boolean;
  activeSessions?: UserSession[];
  sessionToken?: string;
  session?: UserSession;
} {
  const opts = typeof options === 'string' ? { preferredToken: options } : (options || {});
  const clientInfo = req.body?.deviceInfo;
  const userAgent = (req.headers['user-agent'] as string) || '';
  const parsed = parseDeviceInfo(userAgent, clientInfo);
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
  const ipAddress = rawIp.replace('::ffff:', '');
  const deviceId = String(opts.deviceId || req.body?.deviceId || clientInfo?.deviceId || '').trim();

  if (!Array.isArray(user.activeSessions)) {
    user.activeSessions = [];
  }
  if (!Array.isArray(user.terminatedTokens)) {
    user.terminatedTokens = [];
  }

  const preferredToken = opts.preferredToken && opts.preferredToken.trim() ? opts.preferredToken.trim() : '';
  const nowIso = new Date().toISOString();

  // Check if same device (by deviceId or preferredToken) already holds a slot -> reuse that slot seamlessly
  const existingSlotIndex = user.activeSessions.findIndex(
    s =>
      (preferredToken !== '' && s.token === preferredToken) ||
      (deviceId !== '' && s.deviceId && s.deviceId === deviceId)
  );

  if (existingSlotIndex !== -1) {
    const existing = user.activeSessions[existingSlotIndex];
    const tokenToUse = preferredToken || existing.token || `esp_tok_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const refreshed: UserSession = {
      ...existing,
      token: tokenToUse,
      deviceId: deviceId || existing.deviceId,
      deviceType: parsed.deviceType,
      deviceName: parsed.deviceName,
      browser: parsed.browser,
      os: parsed.os,
      ipAddress,
      lastActive: nowIso,
      lastTab: opts.lastTab || existing.lastTab || user.workspaceState?.lastTab,
    };
    user.activeSessions.splice(existingSlotIndex, 1);
    user.activeSessions.unshift(refreshed);
    user.isOnline = true;
    user.maxDevices = MAX_DEVICE_SESSIONS;
    return { sessionToken: tokenToUse, session: refreshed };
  }

  // Enforce strict 4-device concurrent limit
  if (user.activeSessions.length >= MAX_DEVICE_SESSIONS) {
    if (opts.replaceSessionId) {
      const targetIdx = user.activeSessions.findIndex(s => s.sessionId === opts.replaceSessionId);
      if (targetIdx !== -1) {
        const [removed] = user.activeSessions.splice(targetIdx, 1);
        if (removed?.token) {
          user.terminatedTokens = Array.from(new Set([removed.token, ...user.terminatedTokens])).slice(0, 50);
        }
      }
    } else if (opts.replaceOldestDevice) {
      let oldestIdx = 0;
      let oldestTime = Infinity;
      user.activeSessions.forEach((s, idx) => {
        const t = new Date(s.lastActive || s.loginTime || 0).getTime();
        if (t < oldestTime) {
          oldestTime = t;
          oldestIdx = idx;
        }
      });
      const [removed] = user.activeSessions.splice(oldestIdx, 1);
      if (removed?.token) {
        user.terminatedTokens = Array.from(new Set([removed.token, ...user.terminatedTokens])).slice(0, 50);
      }
    } else {
      return {
        limitReached: true,
        activeSessions: user.activeSessions,
      };
    }
  }

  const sessionToken =
    preferredToken || `esp_tok_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newSession: UserSession = {
    sessionId,
    token: sessionToken,
    deviceId: deviceId || undefined,
    deviceType: parsed.deviceType,
    deviceName: parsed.deviceName,
    browser: parsed.browser,
    os: parsed.os,
    ipAddress,
    loginTime: nowIso,
    lastActive: nowIso,
    lastTab: opts.lastTab || user.workspaceState?.lastTab,
  };

  user.activeSessions.unshift(newSession);
  if (user.activeSessions.length > MAX_DEVICE_SESSIONS) {
    user.activeSessions = user.activeSessions.slice(0, MAX_DEVICE_SESSIONS);
  }
  user.isOnline = true;
  user.maxDevices = MAX_DEVICE_SESSIONS;

  return { sessionToken, session: newSession };
}

function createAdminSession(
  req: express.Request,
  options?: {
    preferredToken?: string;
    deviceId?: string;
    replaceSessionId?: string;
    replaceOldestDevice?: boolean;
  }
): {
  limitReached?: boolean;
  activeSessions?: AdminSession[];
  adminToken?: string;
  session?: AdminSession;
} {
  if (!Array.isArray(db.adminSessions)) db.adminSessions = [];
  if (!Array.isArray(db.terminatedAdminTokens)) db.terminatedAdminTokens = [];

  const opts = options || {};
  const clientInfo = req.body?.deviceInfo;
  const userAgent = (req.headers['user-agent'] as string) || '';
  const parsed = parseDeviceInfo(userAgent, clientInfo);
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
  const ipAddress = rawIp.replace('::ffff:', '');
  const deviceId = String(opts.deviceId || req.body?.deviceId || clientInfo?.deviceId || '').trim();
  const preferredToken = opts.preferredToken && opts.preferredToken.trim() ? opts.preferredToken.trim() : '';
  const nowIso = new Date().toISOString();

  const existingIdx = db.adminSessions.findIndex(
    s =>
      (preferredToken !== '' && s.token === preferredToken) ||
      (deviceId !== '' && s.deviceId && s.deviceId === deviceId)
  );

  if (existingIdx !== -1) {
    const existing = db.adminSessions[existingIdx];
    const tokenToUse = preferredToken || existing.token || `esp_adm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const refreshed: AdminSession = {
      ...existing,
      token: tokenToUse,
      deviceId: deviceId || existing.deviceId,
      deviceType: parsed.deviceType,
      deviceName: parsed.deviceName,
      browser: parsed.browser,
      os: parsed.os,
      ipAddress,
      lastActive: nowIso,
    };
    db.adminSessions.splice(existingIdx, 1);
    db.adminSessions.unshift(refreshed);
    return { adminToken: tokenToUse, session: refreshed };
  }

  if (db.adminSessions.length >= MAX_DEVICE_SESSIONS) {
    if (opts.replaceSessionId) {
      const targetIdx = db.adminSessions.findIndex(s => s.sessionId === opts.replaceSessionId);
      if (targetIdx !== -1) {
        const [removed] = db.adminSessions.splice(targetIdx, 1);
        if (removed?.token) {
          db.terminatedAdminTokens = Array.from(new Set([removed.token, ...db.terminatedAdminTokens])).slice(0, 50);
        }
      }
    } else if (opts.replaceOldestDevice) {
      let oldestIdx = 0;
      let oldestTime = Infinity;
      db.adminSessions.forEach((s, idx) => {
        const t = new Date(s.lastActive || s.loginTime || 0).getTime();
        if (t < oldestTime) {
          oldestTime = t;
          oldestIdx = idx;
        }
      });
      const [removed] = db.adminSessions.splice(oldestIdx, 1);
      if (removed?.token) {
        db.terminatedAdminTokens = Array.from(new Set([removed.token, ...db.terminatedAdminTokens])).slice(0, 50);
      }
    } else {
      return {
        limitReached: true,
        activeSessions: db.adminSessions,
      };
    }
  }

  const adminToken = preferredToken || `esp_adm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const newSess: AdminSession = {
    sessionId: `admsess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    token: adminToken,
    deviceId: deviceId || undefined,
    deviceType: parsed.deviceType,
    deviceName: parsed.deviceName,
    browser: parsed.browser,
    os: parsed.os,
    ipAddress,
    loginTime: nowIso,
    lastActive: nowIso,
  };
  db.adminSessions.unshift(newSess);
  if (db.adminSessions.length > MAX_DEVICE_SESSIONS) {
    db.adminSessions = db.adminSessions.slice(0, MAX_DEVICE_SESSIONS);
  }
  return { adminToken, session: newSess };
}

// 4. Registration - Sets status to 'pending' for Admin Verification!
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      fullName,
      username,
      phone,
      email,
      fullAddress,
      paymentAddress,
      password,
      sponsorId,
      sponsorName,
      chosenServiceCode,
      joiningFee,
      joiningDate,
      paymentUtr,
      paymentScreenshot,
      accountType,
    } = req.body;

    const isGamer = accountType === 'gamer';

    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'कृपया नाम और मोबाइल नंबर दर्ज करें (Name & Mobile required)' });
    }

    // Display name (fullName) CAN be the same across users; username & userId stay strictly unique
    const cleanFullName = String(fullName).trim().replace(/\s+/g, ' ');

    const normalizedInputUsername = username !== undefined ? normalizeUsername(username) : '';
    if (normalizedInputUsername) {
      if (!isValidUsernameFormat(normalizedInputUsername)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_USERNAME',
          message: 'यूनिक यूज़रनेम में कोई Symbol (_ - . @) उपयोग न करें — केवल 3 से 24 अक्षर (a-z और 0-9) लिखें।',
        });
      }
      if (isUsernameTaken(db.users, normalizedInputUsername)) {
        return res.status(409).json({
          success: false,
          code: 'USERNAME_TAKEN',
          message: `यूज़रनेम "@${normalizedInputUsername}" पहले से लिया जा चुका है! कृपया कोई दूसरा यूनिक नाम चुनें।`,
        });
      }
    }

    const normalizedPhone = normalizePhoneDigits(phone) || String(phone).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : `${normalizedPhone}@espgaming.club`;

    if (!isGamer) {
      if (!email || !paymentAddress) {
        return res.status(400).json({ success: false, message: 'बिजनेस प्लान हेतु ईमेल और UPI एड्रेस आवश्यक है' });
      }
      if (!paymentUtr) {
        return res.status(400).json({ success: false, message: 'Payment UTR / Transaction Reference is required' });
      }
    }

    const existing = db.users.find(
      u =>
        normalizePhoneDigits(u.phone) === normalizedPhone ||
        (email && (u.email || '').trim().toLowerCase() === cleanEmail)
    );
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'इस मोबाइल नंबर या ईमेल से पहले से खाता पंजीकृत है। कृपया लॉगिन करें या "Forget ID" का उपयोग करें।' 
      });
    }

    let resolvedSponsorId = (sponsorId || '').trim();
    let resolvedSponsorName = (sponsorName || '').trim();

    if (!resolvedSponsorId || resolvedSponsorId.toUpperCase() === db.settings.ownerSponsorId) {
      resolvedSponsorId = db.settings.ownerSponsorId;
      resolvedSponsorName = db.settings.ownerName;
    } else {
      const sp = findUserBySponsorRef(db.users, resolvedSponsorId);
      if (sp) {
        resolvedSponsorId = sp.userId;
        resolvedSponsorName = sp.fullName;
      } else {
        resolvedSponsorId = db.settings.ownerSponsorId;
        resolvedSponsorName = db.settings.ownerName;
      }
    }

    const fee = isGamer ? 0 : (Number(joiningFee) || 10);
    const serviceObj = isGamer 
      ? { code: 'GAME', name: 'ESP GAMING & VOICE CLUB' }
      : (db.services.find(s => s.code === chosenServiceCode) || db.services[0]);
    const newUserId = isGamer 
      ? generateUniqueGamerUserId(cleanFullName)
      : generateUniqueUserId(cleanFullName, serviceObj.code);
    let newGamingId = isGamer ? newUserId : generateUniqueGamerUserId(cleanFullName);
    if (!isGamer && newGamingId.toLowerCase() === newUserId.toLowerCase()) {
      newGamingId = `${newGamingId}G`;
    }
    const finalUsername =
      normalizedInputUsername || generateUniqueDefaultUsername(cleanFullName, newUserId, newGamingId);

    const initialFormData = {
      fullName: cleanFullName,
      phone: normalizedPhone,
      email: cleanEmail,
      fullAddress: fullAddress || '',
      paymentAddress: paymentAddress ? paymentAddress.trim() : '',
      chosenServiceCode: serviceObj.code,
      joiningFee: fee,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      paymentUtr: paymentUtr ? paymentUtr.trim() : 'FREE_GAMING_USER',
      paymentScreenshot: paymentScreenshot || '',
    };

    const newRoomAddress = generateUniqueRoomId(cleanFullName, db.users, db.customVoiceRooms || []);

    // Gamer accounts are instant active! Business accounts are pending until admin approval.
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: newUserId,
      gamingId: newGamingId,
      username: finalUsername,
      fullName: cleanFullName,
      phone: normalizedPhone,
      email: cleanEmail,
      fullAddress: fullAddress || '',
      paymentAddress: paymentAddress ? paymentAddress.trim() : '',
      payoutUpiId: paymentAddress ? paymentAddress.trim() : '',
      password: String(password || '123456').trim(),
      sponsorId: resolvedSponsorId,
      sponsorName: resolvedSponsorName,
      chosenServiceCode: serviceObj.code,
      chosenServiceName: serviceObj.name,
      joiningFee: fee,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      paymentUtr: paymentUtr ? paymentUtr.trim() : 'FREE_GAMING_USER',
      paymentScreenshot: paymentScreenshot || '',
      status: isGamer ? 'active' : 'pending',
      accountType: isGamer ? 'gamer' : 'business',
      balance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      promoEarnings: 0,
      totalWithdrawn: 0,
      coins: 0, // Every new player always starts strictly with 0 coins
      charms: 0,
      gameLevel: 1,
      gameXp: 0,
      vipTier: 'none',
      vipTitle: '',
      unlockedFrames: ['standard'],
      frameType: 'standard',
      unlockedRooms: ['default_dark'],
      roomTheme: 'default_dark',
      taskProgress: {},
      taskProgressDate: getTodayDateString(),
      claimedTaskIds: [],
      claimedChestMilestones: [],
      tasksCompletedCount: 0,
      roomAddress: newRoomAddress,
      personalRoomId: newRoomAddress,
      followedRooms: [],
      houseName: `House of ${fullName.trim().split(' ')[0]}`,
      clanName: 'Royal Warriors ESP',
      clanRole: 'Member',
      loginStreak: 0,
      claimedDays: [],
      friendsCount: 0,
      visitorCount: 0,
      privacySettings: {
        showPhone: false,
        showEmail: false,
        showAddress: false,
      },

      activeSessions: [],
      terminatedTokens: [],
      initialFormData,
      editHistory: [],
      role: 'member',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const { sessionToken } = createSessionForUser(newUser, req);

    db.users.push(newUser);
    ensurePersonalRoomForUser(db, newUser);

    // Track referral: paid plans get pending commission, free gamer referrals (when referred via link) track ₹0 team entry
    if (!isGamer && fee > 0) {
      let l1Percent = ('referralBonusPercent' in serviceObj ? (serviceObj as any).referralBonusPercent : 0) || (db.settings.defaultReferralCommissionRate * 100);
      if (serviceObj.code === 'EMO' && fee < 100) l1Percent = 50; // EMO Normal 50%
      if (serviceObj.code === 'SWI') l1Percent = fee === 300 ? 50 : 40; // SWI ₹300 Special 3.3% App = 50% (₹150)

      const commissionAmount = Math.max(1, Math.round((fee * l1Percent) / 100));

      const referralRecord: ReferralRecord = {
        id: `ref-${Date.now()}`,
        sponsorUserId: resolvedSponsorId,
        downlineUserId: newUserId,
        downlineName: newUser.fullName,
        downlinePhone: newUser.phone,
        serviceCode: serviceObj.code,
        joiningFee: fee,
        commissionAmount: commissionAmount,
        status: 'pending', // Credited upon admin approval
        date: new Date().toISOString().split('T')[0],
      };
      db.referrals.push(referralRecord);
    } else if (isGamer && sponsorId && String(sponsorId).trim()) {
      db.referrals.push({
        id: `ref-${Date.now()}`,
        sponsorUserId: resolvedSponsorId,
        downlineUserId: newUserId,
        downlineName: newUser.fullName,
        downlinePhone: newUser.phone,
        serviceCode: 'GAME',
        joiningFee: 0,
        commissionAmount: 0,
        status: 'credited',
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Initial notification
    db.notifications.push({
      id: `notif-${Date.now()}-reg`,
      userId: newUserId,
      title: '⏳ Account Under Review',
      message: `Welcome ${newUser.fullName}! Your Roll Number ${newUserId} has been registered. Your payment UTR (${newUser.paymentUtr}) is being verified by admin. Once approved, your Verified Digital ID Card download will be unlocked.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system',
    });

    saveDatabase(db);

    res.json({
      success: true,
      message: 'Registration submitted successfully! Your account is pending admin approval.',
      user: {
        ...newUser,
        activeSessions: newUser.activeSessions?.map(s => ({
          ...s,
          isCurrent: s.token === sessionToken,
        })),
      },
      sessionToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error?.message || 'Server error during registration' });
  }
});

// 5. Multi-Device Login (Roll Number / Gaming ID / Mobile / Email + Password)
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, deviceId, replaceSessionId, replaceOldestDevice } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'कृपया अपनी ESP ID / मोबाइल / ईमेल और पासवर्ड दर्ज करें।' });
  }

  const candidates = db.users.filter(u => matchesUserIdentifier(u, identifier));

  if (candidates.length === 0) {
    return res.status(404).json({
      success: false,
      code: 'ACCOUNT_NOT_FOUND',
      message: 'इस ESP ID, मोबाइल नंबर या ईमेल से सर्वर पर कोई खाता नहीं मिला। नीचे "Forget ID?" से अपनी ID खोजें।',
    });
  }

  const user = candidates.find(u => isPasswordMatch(u.password, password));
  if (!user) {
    return res.status(401).json({
      success: false,
      code: 'PASSWORD_MISMATCH',
      message: 'पासवर्ड मेल नहीं खा रहा (Password details mismatch)। कृपया सही पासवर्ड दर्ज करें या नीचे "Forget Password?" से नया पासवर्ड बनाएं।',
    });
  }

  // Create device session for this login (max 4 concurrent devices per account)
  const sessionRes = createSessionForUser(user, req, {
    deviceId: deviceId || req.body?.deviceInfo?.deviceId,
    replaceSessionId,
    replaceOldestDevice: Boolean(replaceOldestDevice),
  });

  if (sessionRes.limitReached) {
    return res.status(409).json({
      success: false,
      code: 'DEVICE_LIMIT_REACHED',
      maxDevices: MAX_DEVICE_SESSIONS,
      activeSessions: (sessionRes.activeSessions || []).map(s => ({
        ...s,
        token: '',
      })),
      message: `यह खाता पहले से अधिकतम ${MAX_DEVICE_SESSIONS} डिवाइसेस में लॉगिन है! इस डिवाइस पर लॉगिन करने के लिए पहले नीचे से किसी 1 पुराने डिवाइस को लॉगआउट करें।`,
    });
  }

  const sessionToken = sessionRes.sessionToken!;
  user.lastLogin = new Date().toISOString();
  user.isOnline = true;
  saveDatabase(db);

  res.json({
    success: true,
    user: {
      ...user,
      maxDevices: MAX_DEVICE_SESSIONS,
      activeSessions: user.activeSessions?.map(s => ({
        ...s,
        isCurrent: s.token === sessionToken,
      })),
    },
    sessionToken,
  });
});

// 5.0.0 Restore Persisted User Account / Session Across Container Restarts or Local Fallback Sync
app.post('/api/auth/restore-account', (req, res) => {
  try {
    const { user: backupUser, password, preferredToken, deviceId, replaceSessionId, replaceOldestDevice } = req.body || {};
    if (!backupUser || !backupUser.userId) {
      return res.status(400).json({ success: false, message: 'Valid backup user payload required' });
    }

    const existing = db.users.find(
      u => u.userId.toLowerCase() === String(backupUser.userId).trim().toLowerCase()
    );

    if (existing) {
      if (password !== undefined && !isPasswordMatch(existing.password, String(password))) {
        return res.status(401).json({
          success: false,
          code: 'PASSWORD_MISMATCH',
          message: 'पासवर्ड मेल नहीं खा रहा (Password mismatch)। कृपया सही पासवर्ड दर्ज करें।',
        });
      }
      if (preferredToken && Array.isArray(existing.terminatedTokens) && existing.terminatedTokens.includes(preferredToken)) {
        return res.json({
          success: false,
          valid: false,
          sessionTerminated: true,
          message: 'आपका यह डिवाइस किसी अन्य डिवाइस से रिमोटली लॉगआउट कर दिया गया है।',
        });
      }
      const sessionRes = createSessionForUser(existing, req, {
        preferredToken,
        deviceId: deviceId || req.body?.deviceInfo?.deviceId,
        replaceSessionId,
        replaceOldestDevice: Boolean(replaceOldestDevice),
      });
      if (sessionRes.limitReached) {
        return res.status(409).json({
          success: false,
          code: 'DEVICE_LIMIT_REACHED',
          maxDevices: MAX_DEVICE_SESSIONS,
          activeSessions: (sessionRes.activeSessions || []).map(s => ({ ...s, token: '' })),
          message: `अधिकतम ${MAX_DEVICE_SESSIONS} डिवाइस लॉगिन सीमा पूरी हो चुकी है।`,
        });
      }
      const sessionToken = sessionRes.sessionToken!;
      existing.lastLogin = new Date().toISOString();
      saveDatabase(db);
      return res.json({
        success: true,
        restored: false,
        user: {
          ...existing,
          maxDevices: MAX_DEVICE_SESSIONS,
          activeSessions: existing.activeSessions?.map(s => ({
            ...s,
            isCurrent: s.token === sessionToken,
          })),
        },
        sessionToken,
      });
    }

    // Re-hydrate account into running database only if ID does not collide
    const safeNewUserId = isAnyIdTaken(String(backupUser.userId).trim())
      ? generateUniqueUserId(String(backupUser.fullName || 'ESP Member').trim(), backupUser.chosenServiceCode || 'EMO')
      : String(backupUser.userId).trim();
    const restored = normalizeUserRecord({
      ...backupUser,
      id: backupUser.id || `usr-${Date.now()}-restored`,
      userId: safeNewUserId,
      fullName: String(backupUser.fullName || 'ESP Member').trim(),
      phone: normalizePhoneDigits(backupUser.phone || '') || String(backupUser.phone || '').trim(),
      email: String(backupUser.email || '').trim().toLowerCase(),
      password: String(backupUser.password || password || '123456').trim(),
      activeSessions: [],
      terminatedTokens: Array.isArray(backupUser.terminatedTokens) ? backupUser.terminatedTokens : [],
      lastLogin: new Date().toISOString(),
    });

    const sessionRes = createSessionForUser(restored, req, {
      preferredToken,
      deviceId: deviceId || req.body?.deviceInfo?.deviceId,
    });
    const sessionToken = sessionRes.sessionToken!;
    db.users.push(restored);
    ensureUniqueIdentityIntegrity(db);
    saveDatabase(db);

    res.json({
      success: true,
      restored: true,
      user: {
        ...restored,
        maxDevices: MAX_DEVICE_SESSIONS,
        activeSessions: restored.activeSessions?.map(s => ({
          ...s,
          isCurrent: s.token === sessionToken,
        })),
      },
      sessionToken,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Restore failed' });
  }
});

// 5.0.0b Real Multi-Device User Logout (Frees only this device slot, never deletes user data)
app.post('/api/auth/logout', (req, res) => {
  const sessionToken = String(req.headers['x-session-token'] || req.body?.sessionToken || '').trim();
  const userId = String(req.body?.userId || '').trim();
  const deviceId = String(req.body?.deviceId || '').trim();
  const workspaceState = req.body?.workspaceState;

  let user = userId ? db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase()) : undefined;
  if (!user && sessionToken) {
    user = db.users.find(u => u.activeSessions?.some(s => s.token === sessionToken));
  }
  if (!user) {
    return res.json({ success: true, message: 'Logged out locally' });
  }

  if (!Array.isArray(user.activeSessions)) user.activeSessions = [];
  if (workspaceState && typeof workspaceState === 'object') {
    user.workspaceState = {
      ...(user.workspaceState || {}),
      lastTab: workspaceState.lastTab || user.workspaceState?.lastTab,
      lastGamingSubTab: workspaceState.lastGamingSubTab || user.workspaceState?.lastGamingSubTab,
      lastDashboardTab: workspaceState.lastDashboardTab || user.workspaceState?.lastDashboardTab,
      lastRoomAddress: workspaceState.lastRoomAddress || user.workspaceState?.lastRoomAddress,
      updatedAt: new Date().toISOString(),
    };
  }

  user.activeSessions = user.activeSessions.filter(s => {
    if (sessionToken && s.token === sessionToken) return false;
    if (deviceId && s.deviceId && s.deviceId === deviceId) return false;
    return true;
  });
  user.isOnline = user.activeSessions.length > 0;
  saveDatabase(db);

  return res.json({
    success: true,
    message: 'इस डिवाइस से सुरक्षित लॉगआउट हो गया (आपका पूरा डेटा सुरक्षित है)।',
    remainingDevices: user.activeSessions.length,
  });
});

// 5.0.0c Save Cross-Device Workspace State (Auto-restore exact screen/tab across 4 devices)
app.post('/api/user/:userId/workspace-state', (req, res) => {
  const { userId } = req.params;
  const sessionToken = String(req.headers['x-session-token'] || req.body?.sessionToken || '').trim();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { lastTab, lastGamingSubTab, lastDashboardTab, lastRoomAddress } = req.body || {};
  user.workspaceState = {
    ...(user.workspaceState || {}),
    ...(lastTab !== undefined ? { lastTab: String(lastTab) } : {}),
    ...(lastGamingSubTab !== undefined ? { lastGamingSubTab: String(lastGamingSubTab) } : {}),
    ...(lastDashboardTab !== undefined ? { lastDashboardTab: String(lastDashboardTab) } : {}),
    ...(lastRoomAddress !== undefined ? { lastRoomAddress: String(lastRoomAddress) } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (sessionToken && Array.isArray(user.activeSessions)) {
    const sess = user.activeSessions.find(s => s.token === sessionToken);
    if (sess) {
      if (lastTab) sess.lastTab = String(lastTab);
      sess.lastActive = new Date().toISOString();
    }
  }

  saveDatabase(db);
  return res.json({ success: true, workspaceState: user.workspaceState });
});

// 5.0.0d Multi-Device Admin Panel Auth & Device Session Controls (Max 4 Admin Devices)
app.post('/api/admin/auth/login', (req, res) => {
  const { adminPassword, deviceId, replaceSessionId, replaceOldestDevice } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'गलत Admin Password! कृपया सही एडमिन पासवर्ड दर्ज करें।' });
  }

  const result = createAdminSession(req, {
    deviceId: deviceId || req.body?.deviceInfo?.deviceId,
    replaceSessionId,
    replaceOldestDevice: Boolean(replaceOldestDevice),
  });

  if (result.limitReached) {
    return res.status(409).json({
      success: false,
      code: 'DEVICE_LIMIT_REACHED',
      maxDevices: MAX_DEVICE_SESSIONS,
      activeSessions: (result.activeSessions || []).map(s => ({ ...s, token: undefined })),
      message: `Admin Panel पहले से अधिकतम ${MAX_DEVICE_SESSIONS} डिवाइसेस पर लॉगिन है! नए डिवाइस के लिए 1 पुराना एडमिन डिवाइस लॉगआउट करें।`,
    });
  }

  saveDatabase(db);
  return res.json({
    success: true,
    adminToken: result.adminToken,
    maxDevices: MAX_DEVICE_SESSIONS,
    activeSessions: (db.adminSessions || []).map(s => ({
      ...s,
      token: undefined,
      isCurrent: s.token === result.adminToken,
    })),
  });
});

app.post('/api/admin/auth/logout', (req, res) => {
  const adminToken = String(req.headers['x-admin-token'] || req.body?.adminToken || '').trim();
  const deviceId = String(req.body?.deviceId || '').trim();
  if (!Array.isArray(db.adminSessions)) db.adminSessions = [];

  db.adminSessions = db.adminSessions.filter(s => {
    if (adminToken && s.token === adminToken) return false;
    if (deviceId && s.deviceId && s.deviceId === deviceId) return false;
    return true;
  });
  saveDatabase(db);
  return res.json({ success: true, remainingAdminDevices: db.adminSessions.length });
});

app.get('/api/admin/auth/verify', (req, res) => {
  const adminToken = String(req.headers['x-admin-token'] || req.query.token || '').trim();
  const adminPassword = String(req.headers['x-admin-password'] || req.query.adminPassword || '').trim();
  if (!Array.isArray(db.adminSessions)) db.adminSessions = [];
  if (!Array.isArray(db.terminatedAdminTokens)) db.terminatedAdminTokens = [];

  if (adminToken && db.terminatedAdminTokens.includes(adminToken)) {
    return res.json({
      success: false,
      valid: false,
      sessionTerminated: true,
      message: 'यह Admin डिवाइस किसी अन्य Admin डिवाइस से रिमोटली लॉगआउट कर दिया गया है।',
    });
  }

  if (adminToken) {
    const sess = db.adminSessions.find(s => s.token === adminToken);
    if (sess) {
      sess.lastActive = new Date().toISOString();
      saveDatabase(db);
      return res.json({
        success: true,
        valid: true,
        maxDevices: MAX_DEVICE_SESSIONS,
        activeSessions: db.adminSessions.map(s => ({ ...s, token: undefined, isCurrent: s.token === adminToken })),
      });
    }
    if (verifyAdmin(adminPassword)) {
      const attached = createAdminSession(req, { preferredToken: adminToken, replaceOldestDevice: false });
      if (!attached.limitReached) {
        saveDatabase(db);
        return res.json({
          success: true,
          valid: true,
          maxDevices: MAX_DEVICE_SESSIONS,
          activeSessions: db.adminSessions.map(s => ({ ...s, token: undefined, isCurrent: s.token === adminToken })),
        });
      }
      return res.status(409).json({
        success: false,
        valid: false,
        code: 'DEVICE_LIMIT_REACHED',
        maxDevices: MAX_DEVICE_SESSIONS,
      });
    }
    return res.json({ success: false, valid: false, sessionTerminated: true });
  }

  if (verifyAdmin(adminPassword)) {
    return res.json({
      success: true,
      valid: true,
      maxDevices: MAX_DEVICE_SESSIONS,
      activeSessions: db.adminSessions.map(s => ({ ...s, token: undefined })),
    });
  }
  return res.status(401).json({ success: false, valid: false });
});

app.get('/api/admin/sessions', (req, res) => {
  const adminPassword = String(req.headers['x-admin-password'] || req.query.adminPassword || '').trim();
  const adminToken = String(req.headers['x-admin-token'] || req.query.adminToken || '').trim();
  const hasValidToken = Boolean(adminToken && (db.adminSessions || []).some(s => s.token === adminToken));
  if (!verifyAdmin(adminPassword) && !hasValidToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }

  const userSessions = db.users
    .filter(u => (u.activeSessions || []).length > 0)
    .map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      username: u.username,
      personalRoomId: u.personalRoomId || u.roomAddress,
      sponsorId: u.sponsorId,
      role: u.role,
      activeCount: (u.activeSessions || []).length,
      maxDevices: MAX_DEVICE_SESSIONS,
      sessions: (u.activeSessions || []).map(s => ({ ...s, token: '' })),
    }));

  return res.json({
    success: true,
    maxDevices: MAX_DEVICE_SESSIONS,
    adminSessions: (db.adminSessions || []).map(s => ({
      ...s,
      token: undefined,
      isCurrent: adminToken ? s.token === adminToken : false,
    })),
    userSessions,
    identityAudit: computeIdentityAudit(db),
  });
});

app.post('/api/admin/sessions/terminate', (req, res) => {
  const { adminPassword, sessionId, terminateAllOthers, currentAdminToken } = req.body || {};
  const headerToken = String(req.headers['x-admin-token'] || currentAdminToken || '').trim();
  const hasValidToken = Boolean(headerToken && (db.adminSessions || []).some(s => s.token === headerToken));
  if (!verifyAdmin(adminPassword) && !hasValidToken) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }

  if (!Array.isArray(db.adminSessions)) db.adminSessions = [];
  if (!Array.isArray(db.terminatedAdminTokens)) db.terminatedAdminTokens = [];

  const removed: string[] = [];
  if (terminateAllOthers && headerToken) {
    for (const s of db.adminSessions) {
      if (s.token && s.token !== headerToken) removed.push(s.token);
    }
    db.adminSessions = db.adminSessions.filter(s => s.token === headerToken);
  } else if (sessionId) {
    for (const s of db.adminSessions) {
      if (s.sessionId === sessionId && s.token) removed.push(s.token);
    }
    db.adminSessions = db.adminSessions.filter(s => s.sessionId !== sessionId);
  }

  if (removed.length > 0) {
    db.terminatedAdminTokens = Array.from(new Set([...removed, ...db.terminatedAdminTokens])).slice(0, 50);
  }
  saveDatabase(db);
  return res.json({
    success: true,
    message: terminateAllOthers ? 'अन्य सभी Admin डिवाइसेस से लॉगआउट कर दिया गया।' : 'चयनित Admin डिवाइस लॉगआउट हो गया।',
    adminSessions: db.adminSessions.map(s => ({
      ...s,
      token: undefined,
      isCurrent: headerToken ? s.token === headerToken : false,
    })),
  });
});

app.post('/api/admin/user/:userId/terminate-session', (req, res) => {
  const { userId } = req.params;
  const { adminPassword, sessionId, terminateAll } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  if (!Array.isArray(user.activeSessions)) user.activeSessions = [];
  if (!Array.isArray(user.terminatedTokens)) user.terminatedTokens = [];

  const removedTokens: string[] = [];
  if (terminateAll) {
    for (const s of user.activeSessions) {
      if (s.token) removedTokens.push(s.token);
    }
    user.activeSessions = [];
    user.isOnline = false;
  } else if (sessionId) {
    for (const s of user.activeSessions) {
      if (s.sessionId === sessionId && s.token) removedTokens.push(s.token);
    }
    user.activeSessions = user.activeSessions.filter(s => s.sessionId !== sessionId);
    user.isOnline = user.activeSessions.length > 0;
  }

  if (removedTokens.length > 0) {
    user.terminatedTokens = Array.from(new Set([...removedTokens, ...user.terminatedTokens])).slice(0, 50);
  }
  saveDatabase(db);
  return res.json({
    success: true,
    message: terminateAll
      ? `${user.fullName} को सभी डिवाइसेस से लॉगआउट किया गया (डेटा सुरक्षित है)।`
      : `${user.fullName} का चयनित डिवाइस लॉगआउट किया गया।`,
    activeSessions: user.activeSessions.map(s => ({ ...s, token: '' })),
  });
});

// 5.0.1 Forget ID Recovery (Lookup Roll No / ESP ID via registered Mobile or Email)
app.post('/api/auth/forget-id', (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail || !String(phoneOrEmail).trim()) {
    return res.status(400).json({ success: false, message: 'कृपया अपना रजिस्टर्ड मोबाइल नंबर या ईमेल दर्ज करें।' });
  }

  const raw = String(phoneOrEmail).trim().toLowerCase();
  const digitsOnly = normalizePhoneDigits(raw);

  const matchedUsers = db.users.filter(u => {
    const userPhoneDigits = normalizePhoneDigits(u.phone || '');
    return (
      (u.email && u.email.trim().toLowerCase() === raw) ||
      (u.phone && u.phone.trim().toLowerCase() === raw) ||
      (digitsOnly.length === 10 && userPhoneDigits === digitsOnly)
    );
  });

  if (matchedUsers.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'इस मोबाइल नंबर या ईमेल से कोई खाता नहीं मिला। कृपया सही नंबर दर्ज करें या नया रजिस्ट्रेशन करें।'
    });
  }

  const primary = matchedUsers[0];
  res.json({
    success: true,
    userId: primary.userId,
    gamingId: primary.gamingId || `GAME-${primary.userId}`,
    fullName: primary.fullName,
    accountType: primary.accountType || 'business',
    chosenServiceCode: primary.chosenServiceCode || 'EMO',
    accounts: matchedUsers.map(u => ({
      userId: u.userId,
      gamingId: u.gamingId || `GAME-${u.userId}`,
      fullName: u.fullName,
      accountType: u.accountType || 'business',
      chosenServiceCode: u.chosenServiceCode || 'EMO',
    })),
  });
});

// 5.0.2 Forget Password Reset (Verify Identity with Registered Phone/Email and set New Password)
app.post('/api/auth/forget-password', (req, res) => {
  const { identifier, verifyPhone, newPassword } = req.body;
  if (!identifier || !verifyPhone || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'कृपया अपनी आईडी, रजिस्टर्ड मोबाइल/ईमेल और नया पासवर्ड दर्ज करें।'
    });
  }

  if (String(newPassword).trim().length < 4) {
    return res.status(400).json({
      success: false,
      message: 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।'
    });
  }

  const cleanVerify = String(verifyPhone).trim().toLowerCase();
  const verifyDigits = normalizePhoneDigits(cleanVerify);

  const candidates = db.users.filter(u => matchesUserIdentifier(u, identifier));

  if (candidates.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'इस आईडी या नंबर से कोई खाता नहीं मिला।'
    });
  }

  const verifiedUser = candidates.find(u => {
    const userPhoneDigits = normalizePhoneDigits(u.phone || '');
    const isPhoneMatch = verifyDigits.length === 10 && userPhoneDigits === verifyDigits;
    const isExactPhoneMatch = (u.phone || '').trim().toLowerCase() === cleanVerify;
    const isEmailMatch = (u.email || '').trim().toLowerCase() === cleanVerify;
    return isPhoneMatch || isExactPhoneMatch || isEmailMatch;
  });

  if (!verifiedUser) {
    return res.status(403).json({
      success: false,
      message: 'वेरिफिकेशन असफल! दर्ज किया गया मोबाइल नंबर या ईमेल इस खाते से मेल नहीं खाता।'
    });
  }

  verifiedUser.password = String(newPassword).trim();
  if (!verifiedUser.editHistory) verifiedUser.editHistory = [];
  verifiedUser.editHistory.unshift({
    date: new Date().toISOString(),
    field: 'password',
    oldValue: '********',
    newValue: '******** (Reset via Forget Password)',
  });
  saveDatabase(db);

  res.json({
    success: true,
    userId: verifiedUser.userId,
    fullName: verifiedUser.fullName,
    message: 'पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।'
  });
});

// 5.1 Multi-Device Session Verification (Keep profile & updates synced across all devices, never false-logout on restart)
app.get('/api/auth/verify-session', (req, res) => {
  const sessionToken = ((req.headers['x-session-token'] as string) || (req.query.token as string) || '').trim();
  const userId = ((req.query.userId as string) || '').toLowerCase().trim();

  let user: UserProfile | undefined;
  if (userId) {
    user = db.users.find(u => u.userId.toLowerCase() === userId);
  }
  if (!user && sessionToken) {
    user = db.users.find(u => u.activeSessions?.some(s => s.token === sessionToken));
  }

  if (!user) {
    return res.status(404).json({ 
      success: false, 
      valid: false, 
      accountMissing: true,
      sessionTerminated: false, 
      message: 'Account not found on current server instance.' 
    });
  }

  if (!user.activeSessions) user.activeSessions = [];
  if (!Array.isArray(user.terminatedTokens)) user.terminatedTokens = [];

  if (sessionToken && user.terminatedTokens.includes(sessionToken)) {
    // Explicitly revoked from another device
    return res.json({
      success: false,
      valid: false,
      sessionTerminated: true,
      message: 'आपका यह डिवाइस किसी अन्य डिवाइस से रिमोटली लॉगआउट कर दिया गया है।',
    });
  }

  const currentSession = sessionToken ? user.activeSessions.find(s => s.token === sessionToken) : undefined;
  const deviceIdHeader = String(req.headers['x-device-id'] || req.query.deviceId || '').trim();
  if (sessionToken && !currentSession) {
    // Re-attach session only if within 4-device limit or same deviceId
    const attachRes = createSessionForUser(user, req, { preferredToken: sessionToken, deviceId: deviceIdHeader });
    if (attachRes.limitReached) {
      return res.status(409).json({
        success: false,
        valid: false,
        sessionTerminated: true,
        code: 'DEVICE_LIMIT_REACHED',
        message: `अधिकतम ${MAX_DEVICE_SESSIONS} डिवाइस लॉगिन सीमा पूरी हो चुकी है।`,
      });
    }
    saveDatabase(db);
  } else if (currentSession) {
    currentSession.lastActive = new Date().toISOString();
    saveDatabase(db);
  }

  res.json({
    success: true,
    valid: true,
    sessionToken: sessionToken || undefined,
    user: {
      ...user,
      maxDevices: MAX_DEVICE_SESSIONS,
      activeSessions: user.activeSessions.map(s => ({
        ...s,
        isCurrent: s.token === sessionToken,
      })),
    },
  });
});

// 6. User Dashboard Data with Multi-Device Session Tracking
app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sessionToken = req.headers['x-session-token'] as string;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.activeSessions) user.activeSessions = [];

  if (sessionToken) {
    const sess = user.activeSessions.find(s => s.token === sessionToken);
    if (sess) {
      sess.lastActive = new Date().toISOString();
      saveDatabase(db);
    }
  }

  const userToSend = {
    ...user,
    activeSessions: user.activeSessions.map(s => ({
      ...s,
      isCurrent: s.token === sessionToken,
    })),
  };

  const userReferrals = db.referrals.filter(r => r.sponsorUserId.toLowerCase() === userId.toLowerCase());
  const userTransactions = db.transactions
    .filter(t => t.userId.toLowerCase() === userId.toLowerCase())
    .slice(-30)
    .reverse();
  const userNotifications = db.notifications
    .filter(n => n.userId.toLowerCase() === userId.toLowerCase())
    .slice(-20)
    .reverse();
  const userPayouts = db.payouts
    .filter(p => p.userId.toLowerCase() === userId.toLowerCase())
    .slice(-10)
    .reverse();

  res.json({
    success: true,
    user: userToSend,
    referrals: userReferrals,
    transactions: userTransactions,
    notifications: userNotifications,
    payouts: userPayouts,
  });
});

// 6.1 Terminate / Remote Logout Device Session
app.post('/api/user/:userId/terminate-session', (req, res) => {
  const { userId } = req.params;
  const { sessionId, terminateAllOthers, currentSessionToken } = req.body;

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.activeSessions) user.activeSessions = [];
  if (!Array.isArray(user.terminatedTokens)) user.terminatedTokens = [];

  const removedTokens: string[] = [];
  if (terminateAllOthers && currentSessionToken) {
    for (const s of user.activeSessions) {
      if (s.token !== currentSessionToken && s.token) removedTokens.push(s.token);
    }
    user.activeSessions = user.activeSessions.filter(s => s.token === currentSessionToken);
  } else if (sessionId) {
    for (const s of user.activeSessions) {
      if (s.sessionId === sessionId && s.token) removedTokens.push(s.token);
    }
    user.activeSessions = user.activeSessions.filter(s => s.sessionId !== sessionId);
  }

  if (removedTokens.length > 0) {
    user.terminatedTokens = Array.from(new Set([...removedTokens, ...user.terminatedTokens])).slice(0, 50);
  }

  saveDatabase(db);

  res.json({
    success: true,
    message: terminateAllOthers 
      ? 'अन्य सभी डिवाइसेस से सफलतापूर्वक लॉगआउट कर दिया गया है।'
      : 'चयनित डिवाइस से सफलतापूर्वक लॉगआउट कर दिया गया है।',
    activeSessions: user.activeSessions.map(s => ({
      ...s,
      isCurrent: s.token === currentSessionToken,
    })),
  });
});



// 7. Update User Profile with Edit History (Telegram Style + Strict Immutable Identity Lock)
app.put('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Strictly reject any mutation to immutable personal identity fields
  const reqBody = req.body || {};
  const attemptingImmutableEdit =
    (reqBody.userId !== undefined && String(reqBody.userId).trim() !== user.userId) ||
    (reqBody.gamingId !== undefined && String(reqBody.gamingId).trim() !== (user.gamingId || '')) ||
    (reqBody.personalRoomId !== undefined && String(reqBody.personalRoomId).trim() !== (user.personalRoomId || user.roomAddress || '')) ||
    (reqBody.roomAddress !== undefined && String(reqBody.roomAddress).trim() !== (user.roomAddress || '')) ||
    (reqBody.sponsorId !== undefined && String(reqBody.sponsorId).trim() !== user.sponsorId) ||
    (reqBody.sponsorName !== undefined && String(reqBody.sponsorName).trim() !== user.sponsorName);

  if (attemptingImmutableEdit) {
    return res.status(403).json({
      success: false,
      code: 'IMMUTABLE_IDENTITY_LOCKED',
      message: 'Personal User ID, Personal Room ID और Sponsor ID स्थायी रूप से लॉक हैं — इन्हें एडिट या डुप्लिकेट नहीं किया जा सकता!',
    });
  }

  if (!user.editHistory) user.editHistory = [];
  const now = new Date().toISOString();

  const { 
    fullName, 
    username,
    phone, 
    email, 
    avatar, 
    coverPhoto,
    bio, 
    gender, 
    location,
    birthday,
    showEspShowOnHome,
    priceTag,
    vipTitle,
    fullAddress, 
    paymentAddress, 
    payoutUpiId, 
    password, 
    privacySettings,
    accountType
  } = req.body;

  if (username !== undefined) {
    const cleanUsername = normalizeUsername(username);
    if (cleanUsername) {
      if (!isValidUsernameFormat(cleanUsername)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_USERNAME',
          message: 'यूनिक ID/यूज़रनेम में कोई Symbol (_ - . @) उपयोग न करें — केवल 3 से 24 अक्षर (a-z और 0-9) इस्तेमाल करें।',
        });
      }
      if (isUsernameTaken(db.users, cleanUsername, user.userId)) {
        return res.status(409).json({
          success: false,
          code: 'USERNAME_TAKEN',
          message: `यूजरनेम "@${cleanUsername}" पहले से किसी दूसरे यूजर के पास है! एक ही यूजरनेम से 2 लोग नहीं हो सकते।`,
        });
      }
      if (cleanUsername !== (user.username || '')) {
        user.editHistory.push({
          date: now,
          field: 'username',
          oldValue: user.username || '',
          newValue: cleanUsername,
        });
        user.username = cleanUsername;
      }
    }
  }

  if (fullName !== undefined && fullName.trim()) {
    const cleanUpdatedName = fullName.trim().replace(/\s+/g, ' ');
    if (cleanUpdatedName !== user.fullName) {
      user.editHistory.push({
        date: now,
        field: 'fullName',
        oldValue: user.fullName || '',
        newValue: cleanUpdatedName,
      });
      user.fullName = cleanUpdatedName;
    }
  }

  if (phone !== undefined && phone.trim() && phone !== user.phone) {
    user.editHistory.push({
      date: now,
      field: 'phone',
      oldValue: user.phone || '',
      newValue: phone.trim(),
    });
    user.phone = phone.trim();
  }

  if (email !== undefined && email.trim() && email !== user.email) {
    user.editHistory.push({
      date: now,
      field: 'email',
      oldValue: user.email || '',
      newValue: email.trim(),
    });
    user.email = email.trim();
  }

  if (avatar !== undefined && avatar !== user.avatar) {
    user.editHistory.push({
      date: now,
      field: 'avatar',
      oldValue: user.avatar ? 'Custom Photo' : 'Default Avatar',
      newValue: avatar ? 'Updated Custom Photo' : 'Removed',
    });
    user.avatar = avatar;
  }

  if (coverPhoto !== undefined && coverPhoto !== user.coverPhoto) {
    user.editHistory.push({
      date: now,
      field: 'coverPhoto',
      oldValue: user.coverPhoto ? 'Custom Cover' : 'Default Cover',
      newValue: coverPhoto ? 'Updated Cover Photo' : 'Removed',
    });
    user.coverPhoto = coverPhoto;
  }

  if (bio !== undefined && bio !== user.bio) {
    user.editHistory.push({
      date: now,
      field: 'bio',
      oldValue: user.bio || '',
      newValue: bio,
    });
    user.bio = bio;
  }

  if (gender !== undefined && gender !== user.gender) {
    user.editHistory.push({
      date: now,
      field: 'gender',
      oldValue: user.gender || '',
      newValue: gender,
    });
    user.gender = gender;
  }

  if (location !== undefined && location !== user.location) {
    user.editHistory.push({
      date: now,
      field: 'location',
      oldValue: user.location || '',
      newValue: String(location).trim().slice(0, 80),
    });
    user.location = String(location).trim().slice(0, 80);
  }

  if (birthday !== undefined && birthday !== user.birthday) {
    user.birthday = String(birthday).trim().slice(0, 32);
  }

  if (showEspShowOnHome !== undefined) {
    user.showEspShowOnHome = Boolean(showEspShowOnHome);
  }

  if (priceTag !== undefined) {
    user.priceTag = String(priceTag).trim().slice(0, 40);
  }

  if (vipTitle !== undefined) {
    user.vipTitle = String(vipTitle).trim().slice(0, 40);
  }

  if (fullAddress !== undefined && fullAddress !== user.fullAddress) {
    user.editHistory.push({
      date: now,
      field: 'fullAddress',
      oldValue: user.fullAddress || '',
      newValue: fullAddress,
    });
    user.fullAddress = fullAddress;
  }

  if (paymentAddress !== undefined && paymentAddress !== user.paymentAddress) {
    user.editHistory.push({
      date: now,
      field: 'paymentAddress',
      oldValue: user.paymentAddress || '',
      newValue: paymentAddress,
    });
    user.paymentAddress = paymentAddress;
  }

  if (payoutUpiId !== undefined && payoutUpiId !== user.payoutUpiId) {
    user.editHistory.push({
      date: now,
      field: 'payoutUpiId',
      oldValue: user.payoutUpiId || '',
      newValue: payoutUpiId,
    });
    user.payoutUpiId = payoutUpiId;
  }

  if (password) {
    user.editHistory.push({
      date: now,
      field: 'password',
      oldValue: '******',
      newValue: '******',
    });
    user.password = password;
  }

  if (privacySettings) {
    user.privacySettings = {
      showPhone: Boolean(privacySettings.showPhone),
      showEmail: Boolean(privacySettings.showEmail),
      showAddress: Boolean(privacySettings.showAddress),
    };
  }

  if (accountType === 'business' || accountType === 'gamer') {
    if (user.accountType !== accountType) {
      user.editHistory.push({
        date: now,
        field: 'accountType',
        oldValue: user.accountType || 'business',
        newValue: accountType,
      });
    }
    user.accountType = accountType;
  }

  if (fullName !== undefined || bio !== undefined || avatar !== undefined || coverPhoto !== undefined || username !== undefined || accountType !== undefined) {
    incrementUserTaskProgress(user, 'profile_completed', 1);
  }

  const sessionToken = req.headers['x-session-token'] as string;
  saveDatabase(db);
  const userToSend = {
    ...user,
    activeSessions: user.activeSessions?.map(s => ({
      ...s,
      isCurrent: s.token === sessionToken,
    })),
  };
  res.json({ success: true, message: 'Profile details updated successfully', user: userToSend });
});

// 8. Withdrawal Request
app.post('/api/user/:userId/withdraw', (req, res) => {
  const { userId } = req.params;
  const { amount, payoutAddress } = req.body;

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ success: false, message: 'Withdrawals are locked until your account is approved by Admin.' });
  }

  const withdrawAmount = Number(amount);
  if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  const minAmt = db.settings.minWithdrawal || 50;
  if (withdrawAmount < minAmt) {
    return res.status(400).json({ success: false, message: `Minimum withdrawal amount is ₹${minAmt}` });
  }

  if (user.balance < withdrawAmount) {
    return res.status(400).json({ success: false, message: `Insufficient balance. Available: ₹${user.balance}` });
  }

  // Hold requested funds in escrow (balance deducted); totalWithdrawn increases ONLY when Admin approves payout
  user.balance -= withdrawAmount;

  const payoutReq: PayoutRequest = {
    id: `po-${Date.now()}`,
    userId: user.userId,
    userName: user.fullName,
    userPhone: user.phone,
    amount: withdrawAmount,
    payoutAddress: payoutAddress || user.payoutUpiId || user.paymentAddress,
    status: 'pending',
    requestDate: new Date().toISOString().split('T')[0],
  };

  db.payouts.push(payoutReq);

  db.transactions.push({
    id: `tx-${Date.now()}-wth`,
    userId: user.userId,
    amount: -withdrawAmount,
    type: 'withdrawal',
    description: `Withdrawal Request to UPI ${payoutReq.payoutAddress}`,
    date: new Date().toISOString(),
    status: 'pending',
    referenceId: payoutReq.id,
  });

  saveDatabase(db);

  res.json({
    success: true,
    message: 'Withdrawal request submitted successfully! UPI transfer will be credited shortly.',
    payout: payoutReq,
    user,
  });
});

// 9. AI Chatbot
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  const userMsg = (message || '').toLowerCase().trim();

  let reply = '';
  let options: string[] = [];

  if (userMsg.includes('esp') || userMsg.includes('iois') || userMsg.includes('kya hai') || userMsg.includes('what is')) {
    reply = `**EARNING SYSTEM PLATFORM (ESP)** एक आधुनिक सोशल मीडिया नेटवर्किंग एवं AI-असिस्टेड वर्क-फ्रॉम-होम अर्निंग प्लेटफॉर्म है। इसके माध्यम से लोग अपने मोबाइल फोन से EMO, MMO, MOM, NWI (ऑटो पूल) और Refer & Earn जैसी 10 सर्विसेज द्वारा प्रतिदिन ₹500 से ₹2,000 तक कमा सकते हैं।`;
    options = ['जॉइनिंग चार्ज कितना है?', '10 सर्विसेज कौन सी हैं?', 'पेमेंट कैसे मिलता है?'];
  } else if (userMsg.includes('₹10') || userMsg.includes('charge') || userMsg.includes('fee') || userMsg.includes('kitna') || userMsg.includes('plan')) {
    reply = `ESP में जॉइनिंग मात्र **₹10** से शुरू होती है! आप ₹10, ₹50, ₹100, ₹250, ₹500 या ₹1000 में से कोई भी सर्विस प्लान चुन सकते हैं। प्रत्येक प्लान के साथ आपका आधिकारिक Roll Number जारी होता है और एडमिन अप्रूवल के बाद वेरिफाइड डिजिटल आईडी कार्ड डाउनलोड के लिए उपलब्ध होता है।`;
    options = ['रजिस्ट्रेशन कैसे करें?', 'QR पेमेंट कैसे करें?', 'NWI ऑटो पूल क्या है?'];
  } else if (userMsg.includes('service') || userMsg.includes('सेवाएं') || userMsg.includes('10')) {
    reply = `ESP के अंतर्गत 10 मुख्य सेवाएं आती हैं:\n1️⃣ EARN MONEY ONLINE (EMO)\n2️⃣ MAKE MONEY ONLINE (MMO)\n3️⃣ MAKE ONLINE MONEY (MOM)\n4️⃣ ONLINE EARNING SYSTEM (OES)\n5️⃣ MONEY MAKING SYSTEM (MMS)\n6️⃣ NON WORKING INCOME (NWI - ऑटो पूल)\n7️⃣ SELF WORKING INCOME (SWI)\n8️⃣ TEAM WORKING INCOME (TWI)\n9️⃣ PROMOTE & EARN\n🔟 REFER & EARN (50% तक कमीशन)`;
    options = ['NWI नॉन-वर्किंग इनकम क्या है?', 'रेफरल कमीशन कितना है?'];
  } else if (userMsg.includes('approve') || userMsg.includes('reject') || userMsg.includes('approval') || userMsg.includes('active')) {
    reply = `फेक यूजर्स को रोकने के लिए ESP में सख्त अप्रूवल सिस्टम है। जब आप पेमेंट का 12 अंकों का UTR नंबर डालकर रजिस्टर करते हैं, तो एडमिन आपके पेमेंट प्रूफ का सत्यापन करके आपका अकाउंट अप्रूव करता है। अप्रूव होने के बाद ही आपका ओरिजिनल डिजिटल आईडी कार्ड डाउनलोड करने के लिए अनलॉक होता है।`;
    options = ['आईडी कार्ड कब डाउनलोड होगा?', 'पेमेंट UTR कैसे चेक करें?'];
  } else if (userMsg.includes('payment') || userMsg.includes('upi') || userMsg.includes('qr') || userMsg.includes('पेमेंट')) {
    reply = `ESP का आधिकारिक UPI ID **${db.settings.adminUpiId}** (Recipient: **${db.settings.adminPayeeName}**) है। आप Google Pay, PhonePe, Paytm या BHIM से QR कोड स्कैन करके पेमेंट कर सकते हैं। पेमेंट के बाद 12 अंकों का UTR नंबर फॉर्म में दर्ज करना आवश्यक है।`;
    options = ['निकासी (Withdrawal) का नियम?', 'आईडी कार्ड कब मिलेगा?'];
  } else if (userMsg.includes('withdraw') || userMsg.includes('nikasi') || userMsg.includes('पैसे कैसे निकाले') || userMsg.includes('payout')) {
    reply = `आप अपने डैशबोर्ड के 'Wallet' सेक्शन से न्यूनतम **₹${db.settings.minWithdrawal}** होते ही अपने UPI ID (Google Pay / PhonePe) में सीधे निकासी का अनुरोध कर सकते हैं। ट्रांसफर तुरंत प्रोसेस किया जाता है।`;
    options = ['रेफरल लिंक कहाँ मिलेगा?', 'आईडी कार्ड कैसे डाउनलोड करें?'];
  } else {
    reply = `नमस्ते! मैं IOIS & ESP का AI असिस्टेंट हूँ। मैं EARNING SYSTEM PLATFORM की योजनाओं, 10 सर्विसेज, ₹10 से जॉइनिंग, UPI पेमेंट (${db.settings.adminUpiId}), डिजिटल आईडी कार्ड और विथड्रॉल के बारे में आपकी पूरी सहायता कर सकता हूँ।`;
    options = ['ESP क्या है?', '₹10 से शुरुआत कैसे करें?', 'NWI ऑटो पूल क्या है?', 'पैसे कैसे निकाले?'];
  }

  res.json({
    success: true,
    reply,
    options,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
});

// 10. Admin Endpoints with Approval & Rejection System
app.get('/api/admin/overview', (req, res) => {
  const adminPassword = req.headers['x-admin-password'] as string;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Invalid Admin Security Key' });
  }

  getOrCreateRooms(db);
  saveDatabase(db);

  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const pendingUsers = db.users.filter(u => u.status === 'pending').length;
  const rejectedUsers = db.users.filter(u => u.status === 'rejected').length;
  const totalVolume = db.users.filter(u => u.status === 'active').reduce((acc, u) => acc + (u.joiningFee || 0), 0);
  const totalPaidOut = db.payouts.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.amount, 0);
  const pendingPayouts = db.payouts.filter(p => p.status === 'pending');

  const pendingCoinRechargesCount = (db.coinRecharges || []).filter(r => r.status === 'pending').length;

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      pendingUsers,
      rejectedUsers,
      totalVolume,
      totalPaidOut,
      pendingPayoutsCount: pendingPayouts.length,
      pendingCoinRechargesCount,
      totalReferrals: db.referrals.length,
      activeServicesCount: db.services.filter(s => s.active).length,
    },
    users: db.users.slice().reverse(),
    payouts: db.payouts.slice().reverse(),
    coinRecharges: (db.coinRecharges || []).slice(),
    contactMessages: (db.contactMessages || []).slice(),
    adminNotifications: (db.notifications || []).filter(n => n.userId === 'EMO-MOM-MMO').slice(0, 50),
    services: db.services,
    settings: db.settings,
  });
});

app.get('/api/admin/user/:userId/full-audit', (req, res) => {
  const adminPassword = req.headers['x-admin-password'] as string;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const downline = db.referrals.filter(r => r.sponsorUserId.toLowerCase() === userId.toLowerCase());
  const userTx = db.transactions.filter(t => t.userId.toLowerCase() === userId.toLowerCase());
  const userPo = db.payouts.filter(p => p.userId.toLowerCase() === userId.toLowerCase());

  res.json({
    success: true,
    user,
    initialFormData: user.initialFormData || null,
    editHistory: user.editHistory || [],
    downline,
    transactions: userTx,
    payouts: userPo,
  });
});

// Admin Approve or Reject User
app.post('/api/admin/users/:userId/status', (req, res) => {
  const { userId } = req.params;
  const { status, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const prevStatus = user.status;
  user.status = status;

  if (status === 'active') {
    user.verifiedAt = new Date().toISOString();

    // Auto-attach global SWI 3.3% app link if admin configured default link and user is on SWI
    if (user.chosenServiceCode === 'SWI' && !user.swiAppLink && db.settings.swiSpecialAppLink) {
      user.swiAppLink = db.settings.swiSpecialAppLink;
      user.swiAppSharedAt = new Date().toISOString();
      user.swiAppNote = 'वेरिफिकेशन पूरा होने पर आपका 3.3% स्पेशल रिचार्ज ऐप लिंक सक्रिय कर दिया गया है।';
    }

    // Credit Level-1 sponsor commission & Multi-Level upline distribution (EMO Fast, OES, MMS)
    const pendingRef = db.referrals.find(r => r.downlineUserId === user.userId && r.status === 'pending');
    if (pendingRef) {
      pendingRef.status = 'credited';
      const sponsor = db.users.find(u => u.userId === pendingRef.sponsorUserId);
      if (sponsor) {
        sponsor.balance += pendingRef.commissionAmount;
        sponsor.totalEarnings += pendingRef.commissionAmount;
        sponsor.referralEarnings += pendingRef.commissionAmount;

        db.transactions.push({
          id: `tx-${Date.now()}-ref-cred`,
          userId: sponsor.userId,
          amount: pendingRef.commissionAmount,
          type: 'referral_credit',
          description: `Direct Referral Reward (${user.fullName} • ${user.chosenServiceCode} ₹${user.joiningFee})`,
          date: new Date().toISOString(),
          status: 'completed',
          referenceId: pendingRef.id,
        });

        db.notifications.push({
          id: `notif-${Date.now()}-sp-appr`,
          userId: sponsor.userId,
          title: '💰 Referral Commission Credited!',
          message: `₹${pendingRef.commissionAmount} credited! Member ${user.fullName} (${user.userId}) verified (${user.chosenServiceCode} ₹${user.joiningFee}).`,
          date: new Date().toISOString(),
          read: false,
          type: 'referral',
        });

        // Multi-Level Upline Overrides (Levels 2 to 5)
        let extraLevelPercents: number[] = [];
        if (user.chosenServiceCode === 'OES') {
          extraLevelPercents = [12, 8, 5, 5]; // L2: 12%, L3: 8%, L4: 5%, L5: 5% (with 40% L1 = 70%)
        } else if (user.chosenServiceCode === 'MMS') {
          extraLevelPercents = [8, 5, 4, 3]; // L2: 8%, L3: 5%, L4: 4%, L5: 3% (with 50% L1 = 70%)
        } else if (user.chosenServiceCode === 'EMO' && (user.joiningFee || 0) >= 100) {
          extraLevelPercents = [15, 10]; // L2: 15%, L3: 10%
        }

        const visitedIds = new Set<string>([user.userId.toLowerCase(), sponsor.userId.toLowerCase()]);
        let currentDownlineSponsor = sponsor;
        for (let idx = 0; idx < extraLevelPercents.length; idx++) {
          const nextSponsorId = (currentDownlineSponsor.sponsorId || '').trim();
          if (!nextSponsorId || nextSponsorId === 'FOUNDER' || visitedIds.has(nextSponsorId.toLowerCase())) break;
          const upline = db.users.find(u => u.userId.toLowerCase() === nextSponsorId.toLowerCase() && u.status === 'active');
          if (!upline) break;
          visitedIds.add(upline.userId.toLowerCase());

          const lvlNum = idx + 2;
          const lvlAmt = Math.round(((user.joiningFee || 0) * extraLevelPercents[idx]) / 100);
          if (lvlAmt > 0) {
            upline.balance += lvlAmt;
            upline.totalEarnings += lvlAmt;
            upline.referralEarnings += lvlAmt;
            db.transactions.push({
              id: `tx-${Date.now()}-l${lvlNum}-${idx}`,
              userId: upline.userId,
              amount: lvlAmt,
              type: 'level_income',
              description: `Level-${lvlNum} Team Commission (${extraLevelPercents[idx]}%) from ${user.fullName} (${user.chosenServiceCode} ₹${user.joiningFee})`,
              date: new Date().toISOString(),
              status: 'completed',
              referenceId: pendingRef.id,
            });
            db.notifications.push({
              id: `notif-${Date.now()}-l${lvlNum}-${idx}`,
              userId: upline.userId,
              title: `🌐 Level-${lvlNum} टीम इनकम प्राप्त!`,
              message: `आपकी लेवल-${lvlNum} टीम में ${user.fullName} (${user.chosenServiceCode} ₹${user.joiningFee}) के जुड़ने पर ₹${lvlAmt} वॉलेट में जोड़े गए।`,
              date: new Date().toISOString(),
              read: false,
              type: 'referral',
            });
          }
          currentDownlineSponsor = upline;
        }
      }
    }

    // Notify User that they are verified and can download their ID Card!
    db.notifications.push({
      id: `notif-${Date.now()}-user-act`,
      userId: user.userId,
      title: '🎉 Account Approved & ID Card Unlocked!',
      message: `Congratulations ${user.fullName}! Your payment and account have been verified by Admin. Your Official Digital ID Card is now active and ready to download.${user.swiAppLink ? ' आपका Special 3.3% Recharge App Link भी डैशबोर्ड में जोड़ दिया गया है।' : ''}`,
      date: new Date().toISOString(),
      read: false,
      type: 'system',
    });
  } else if (status === 'rejected') {
    db.notifications.push({
      id: `notif-${Date.now()}-user-rej`,
      userId: user.userId,
      title: '❌ Registration Proof Rejected',
      message: `Your registration could not be verified. Please check your UTR number or contact WhatsApp support +91 ${db.settings.whatsappNumber}.`,
      date: new Date().toISOString(),
      read: false,
      type: 'system',
    });
  }

  saveDatabase(db);

  res.json({
    success: true,
    message: `User status changed from ${prevStatus} to ${status}.`,
    user,
  });
});

// Admin Share Special 3.3% Recharge App Link (SWI ₹300 Plan & Verified SWI Users)
app.post('/api/admin/users/:userId/share-swi-app', (req, res) => {
  const { userId } = req.params;
  const { swiAppLink, swiAppNote, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid Admin Security Key' });
  }
  if (!swiAppLink || !String(swiAppLink).trim()) {
    return res.status(400).json({ success: false, message: 'कृपया वैध ऐप लिंक (App URL / Download Link) दर्ज करें' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.swiAppLink = String(swiAppLink).trim();
  user.swiAppSharedAt = new Date().toISOString();
  user.swiAppNote = swiAppNote ? String(swiAppNote).trim() : '3.3% कमीशन स्पेशल रिचार्ज ऐप लिंक (Admin Verified)';

  db.notifications.unshift({
    id: `notif-swi-${Date.now()}`,
    userId: user.userId,
    title: '📲 आपका 3.3% स्पेशल रिचार्ज ऐप लिंक आ गया!',
    message: `Admin ने आपके लिए 3.3% कमीशन वाला स्पेशल रिचार्ज ऐप लिंक शेयर कर दिया है। डैशबोर्ड के "Special 3.3% Recharge App" सेक्शन से लिंक खोलें।`,
    date: new Date().toISOString(),
    read: false,
    type: 'system',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${user.fullName} (${user.userId}) के डैशबोर्ड में 3.3% ऐप लिंक सफलतापूर्वक शेयर किया गया!`,
    user,
  });
});

// Self Plan Upgrade Workflow (REFER & All Active Users - ₹100+)
app.post('/api/users/upgrade-plan', (req, res) => {
  const { userId, targetServiceCode, upgradeFee, paymentUtr } = req.body;
  if (!userId || !targetServiceCode || !upgradeFee || !paymentUtr) {
    return res.status(400).json({ success: false, message: 'कृपया प्लान, अपग्रेड राशि और 12 अंकों का UTR नंबर भरें' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const srv = db.services.find(s => s.code === targetServiceCode) || db.services[0];
  const reqItem: PlanUpgradeRequest = {
    id: `UPG-${Date.now().toString().slice(-6)}`,
    userId: user.userId,
    userName: user.fullName,
    fromServiceCode: user.chosenServiceCode,
    fromFee: user.joiningFee || 10,
    targetServiceCode: srv.code,
    targetServiceName: srv.name,
    upgradeFee: Number(upgradeFee) || 100,
    paymentUtr: String(paymentUtr).trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (!Array.isArray(db.planUpgrades)) db.planUpgrades = [];
  db.planUpgrades.unshift(reqItem);

  db.notifications.unshift({
    id: `notif-upg-${Date.now()}`,
    userId: user.userId,
    title: '⏳ प्लान अपग्रेड अनुरोध सबमिट हुआ',
    message: `आपका ${srv.code} (₹${reqItem.upgradeFee}) अपग्रेड अनुरोध (UTR: ${reqItem.paymentUtr}) एडमिन सत्यापन के लिए भेजा गया है।`,
    date: new Date().toISOString(),
    read: false,
    type: 'system',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: 'प्लान अपग्रेड अनुरोध सफलतापूर्वक सबमिट हो गया! एडमिन वेरिफाई होते ही नया प्लान सक्रिय होगा।',
    request: reqItem,
  });
});

app.get('/api/admin/upgrades', (req, res) => {
  const adminPassword = String(req.query.adminPassword || '');
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.json({ success: true, upgrades: db.planUpgrades || [] });
});

app.post('/api/admin/upgrades/:upgradeId/status', (req, res) => {
  const { upgradeId } = req.params;
  const { status, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(db.planUpgrades)) db.planUpgrades = [];
  const upg = db.planUpgrades.find(u => u.id === upgradeId);
  if (!upg) {
    return res.status(404).json({ success: false, message: 'Upgrade request not found' });
  }

  if (upg.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'यह अपग्रेड पहले ही प्रोसेस हो चुका है' });
  }

  upg.status = status === 'approved' ? 'approved' : 'rejected';
  upg.processedAt = new Date().toISOString();

  const user = db.users.find(u => u.userId === upg.userId);
  if (user && upg.status === 'approved') {
    user.chosenServiceCode = upg.targetServiceCode;
    user.chosenServiceName = upg.targetServiceName;
    user.joiningFee = upg.upgradeFee;

    if (upg.targetServiceCode === 'SWI' && !user.swiAppLink && db.settings.swiSpecialAppLink) {
      user.swiAppLink = db.settings.swiSpecialAppLink;
      user.swiAppSharedAt = new Date().toISOString();
      user.swiAppNote = '3.3% स्पेशल रिचार्ज ऐप लिंक अपग्रेड पर सक्रिय किया गया।';
    }

    // Credit 50% upgrade commission to direct sponsor
    if (user.sponsorId && user.sponsorId !== 'FOUNDER') {
      const sponsor = db.users.find(u => u.userId === user.sponsorId);
      if (sponsor) {
        const upgComm = Math.round(upg.upgradeFee * 0.50);
        sponsor.balance += upgComm;
        sponsor.totalEarnings += upgComm;
        sponsor.referralEarnings += upgComm;
        db.transactions.unshift({
          id: `tx-upg-${Date.now()}`,
          userId: sponsor.userId,
          amount: upgComm,
          type: 'plan_upgrade',
          description: `50% Plan Upgrade Commission from ${user.fullName} (${upg.targetServiceCode} ₹${upg.upgradeFee})`,
          date: new Date().toISOString(),
          status: 'completed',
          referenceId: upg.id,
        });
        db.notifications.unshift({
          id: `notif-upg-sp-${Date.now()}`,
          userId: sponsor.userId,
          title: '🚀 प्लान अपग्रेड कमीशन प्राप्त!',
          message: `आपके साथी ${user.fullName} ने ₹${upg.upgradeFee} में प्लान अपग्रेड किया — ₹${upgComm} (50%) आपके वॉलेट में जुड़े!`,
          date: new Date().toISOString(),
          read: false,
          type: 'referral',
        });
      }
    }

    db.notifications.unshift({
      id: `notif-upg-ok-${Date.now()}`,
      userId: user.userId,
      title: '🎉 आपका प्लान अपग्रेड हो गया!',
      message: `बधाई हो! आपका नया प्लान ${upg.targetServiceCode} (₹${upg.upgradeFee}) अब सक्रिय है।`,
      date: new Date().toISOString(),
      read: false,
      type: 'system',
    });
  }

  saveDatabase(db);
  res.json({ success: true, message: `Upgrade request ${upg.status}.`, upgrade: upg });
});

app.post('/api/admin/payouts/:payoutId/approve', (req, res) => {
  const { payoutId } = req.params;
  const { transactionRef, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const payout = db.payouts.find(p => p.id === payoutId);
  if (!payout) {
    return res.status(404).json({ success: false, message: 'Payout request not found' });
  }

  if (payout.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Payout already processed (${payout.status})` });
  }

  const cleanRef = String(transactionRef || '').trim();
  if (cleanRef.length < 4) {
    return res.status(400).json({ success: false, message: 'कृपया वैध Bank / UPI Transaction UTR Ref दर्ज करें' });
  }

  payout.status = 'approved';
  payout.processedDate = new Date().toISOString().split('T')[0];
  payout.transactionRef = cleanRef;

  const user = db.users.find(u => u.userId.toLowerCase() === payout.userId.toLowerCase());
  if (user) {
    user.totalWithdrawn = (user.totalWithdrawn || 0) + payout.amount;
  }

  const linkedTx = db.transactions.find(t => t.referenceId === payout.id);
  if (linkedTx) {
    linkedTx.status = 'completed';
    linkedTx.description = `UPI Payout Paid to ${payout.payoutAddress} (UTR: ${cleanRef})`;
  }

  db.notifications.push({
    id: `notif-${Date.now()}-po-appr`,
    userId: payout.userId,
    title: '💰 Payout Sent Successfully!',
    message: `₹${payout.amount} has been paid to your UPI ID ${payout.payoutAddress}. UTR: ${cleanRef}`,
    date: new Date().toISOString(),
    read: false,
    type: 'withdrawal',
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Payout approved and marked completed', payout });
});

app.post('/api/admin/payouts/:payoutId/reject', (req, res) => {
  const { payoutId } = req.params;
  const { reason, adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const payout = db.payouts.find(p => p.id === payoutId);
  if (!payout) {
    return res.status(404).json({ success: false, message: 'Payout request not found' });
  }

  if (payout.status !== 'pending') {
    return res.status(400).json({ success: false, message: `Payout already processed (${payout.status})` });
  }

  const rejectReason = String(reason || 'अमान्य UPI विवरण / भुगतान अस्वीकृत').trim();
  payout.status = 'rejected';
  payout.processedDate = new Date().toISOString().split('T')[0];
  payout.transactionRef = rejectReason;

  const user = db.users.find(u => u.userId.toLowerCase() === payout.userId.toLowerCase());
  if (user) {
    user.balance = (user.balance || 0) + payout.amount;
  }

  const linkedTx = db.transactions.find(t => t.referenceId === payout.id);
  if (linkedTx) {
    linkedTx.status = 'failed';
    linkedTx.description = `Withdrawal Rejected & Refunded (${rejectReason})`;
  }

  db.transactions.unshift({
    id: `tx-refund-${Date.now()}`,
    userId: payout.userId,
    amount: payout.amount,
    type: 'payout_refund',
    description: `Withdrawal Refund to Wallet (Payout #${payout.id}: ${rejectReason})`,
    date: new Date().toISOString(),
    status: 'completed',
    referenceId: payout.id,
  });

  db.notifications.push({
    id: `notif-${Date.now()}-po-rej`,
    userId: payout.userId,
    title: '↩️ Withdrawal Rejected & Refunded',
    message: `₹${payout.amount} का निकासी अनुरोध अस्वीकृत हुआ (${rejectReason})। पूरी राशि आपके वॉलेट बैलेंस में वापस जोड़ दी गई है।`,
    date: new Date().toISOString(),
    read: false,
    type: 'withdrawal',
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Payout rejected and balance refunded to user wallet', payout });
});

// ==========================================
// 9. DAILY MOMENTS / STATUS FEED API
// ==========================================
app.get('/api/moments', (_req, res) => {
  if (!db.moments) db.moments = DEFAULT_MOMENTS;
  const sorted = [...db.moments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, moments: sorted });
});

app.post('/api/moments', (req, res) => {
  try {
    const { userId, userName, userRollNumber, userAvatar, caption, imageUrl, serviceTag, postStyle } = req.body;
    if ((!caption || !String(caption).trim()) && !imageUrl) {
      return res.status(400).json({ success: false, message: 'कृपया टेक्स्ट लिखें या फोटो अपलोड करें' });
    }

    const sanitizedStyle = postStyle && typeof postStyle === 'object' ? {
      fontFamily: String(postStyle.fontFamily || 'sans'),
      bgTheme: String(postStyle.bgTheme || 'classic'),
      textColor: postStyle.textColor ? String(postStyle.textColor).slice(0, 24) : '',
      textAlign: ['left', 'center', 'right'].includes(postStyle.textAlign) ? postStyle.textAlign : 'left',
      fontSize: ['sm', 'md', 'lg', 'xl'].includes(postStyle.fontSize) ? postStyle.fontSize : 'sm',
      textEffect: ['none', 'shadow', 'glow', 'outline'].includes(postStyle.textEffect) ? postStyle.textEffect : 'none',
      photoFrame: ['clean', 'polaroid', 'rounded_glow', 'cinema'].includes(postStyle.photoFrame) ? postStyle.photoFrame : 'clean',
      feeling: postStyle.feeling ? String(postStyle.feeling).slice(0, 48) : '',
      locationText: postStyle.locationText ? String(postStyle.locationText).slice(0, 48) : '',
      privacy: postStyle.privacy === 'friends' ? 'friends' : 'public',
    } : undefined;

    const newMoment: Moment = {
      id: `moment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'anonymous',
      userName: userName || 'ESP Member',
      userRollNumber: userRollNumber || 'ESP10MEM',
      userAvatar: userAvatar || '',
      caption: String(caption || '').trim(),
      imageUrl: imageUrl || '',
      serviceTag: serviceTag || 'LIFE MOMENT',
      ...(sanitizedStyle ? { postStyle: sanitizedStyle as any } : {}),
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      sharesCount: 0,
    };

    if (!db.moments) db.moments = [];
    db.moments.unshift(newMoment);

    const momentAuthor = db.users.find(u => u.userId === userId || u.id === userId);
    if (momentAuthor) {
      incrementUserTaskProgress(momentAuthor, 'moment_posted', 1);
    }

    saveDatabase(db);

    res.json({ success: true, message: 'Moment posted successfully!', moment: newMoment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error posting moment' });
  }
});

app.delete('/api/moments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reqUserId = String(
      req.body?.userId || req.query?.userId || req.headers['x-user-id'] || ''
    ).trim();
    const adminPassword = req.headers['x-admin-password'] as string | undefined;

    if (!db.moments) db.moments = [];
    const idx = db.moments.findIndex(m => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Moment not found' });
    }

    const target = db.moments[idx];
    const reqUser = reqUserId
      ? db.users.find(
          u =>
            u.userId.toLowerCase() === reqUserId.toLowerCase() ||
            (u.id && u.id.toLowerCase() === reqUserId.toLowerCase())
        )
      : undefined;

    const isOwner = Boolean(
      reqUserId &&
        (target.userId?.toLowerCase() === reqUserId.toLowerCase() ||
          target.userRollNumber?.toLowerCase() === reqUserId.toLowerCase() ||
          (reqUser &&
            (target.userId?.toLowerCase() === reqUser.userId.toLowerCase() ||
              (reqUser.id && target.userId?.toLowerCase() === reqUser.id.toLowerCase()))))
    );
    const isAdminAuthorized =
      (adminPassword && verifyAdmin(adminPassword)) ||
      reqUser?.role === 'admin' ||
      reqUser?.userId === 'usr-admin';

    if (!isOwner && !isAdminAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'आप केवल अपने खुद के पोस्ट किए गए मोमेंट को ही डिलीट कर सकते हैं।',
      });
    }

    db.moments.splice(idx, 1);
    saveDatabase(db);
    res.json({ success: true, deletedId: id, message: 'Moment deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error deleting moment' });
  }
});

app.post('/api/moments/:id/like', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  const moment = db.moments.find(m => m.id === id);
  if (!moment) {
    return res.status(404).json({ success: false, message: 'Moment not found' });
  }

  if (!moment.likes) moment.likes = [];
  const idx = moment.likes.indexOf(userId);
  let isLiked = false;
  if (idx > -1) {
    moment.likes.splice(idx, 1);
    isLiked = false;
  } else {
    moment.likes.push(userId);
    isLiked = true;
  }

  saveDatabase(db);
  res.json({ success: true, isLiked, likesCount: moment.likes.length, likes: moment.likes });
});

app.post('/api/moments/:id/comment', (req, res) => {
  const { id } = req.params;
  const { userId, userName, userRollNumber, userAvatar, text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required' });
  }

  const moment = db.moments.find(m => m.id === id);
  if (!moment) {
    return res.status(404).json({ success: false, message: 'Moment not found' });
  }

  if (!moment.comments) moment.comments = [];
  const newComment: MomentComment = {
    id: `c-${Date.now()}`,
    userId: userId || 'anonymous',
    userName: userName || 'Member',
    userRollNumber: userRollNumber || '',
    userAvatar: userAvatar || '',
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  moment.comments.push(newComment);
  saveDatabase(db);
  res.json({ success: true, message: 'Comment added', comment: newComment });
});

app.post('/api/moments/:id/share', (req, res) => {
  const { id } = req.params;
  const moment = db.moments.find(m => m.id === id);
  if (!moment) {
    return res.status(404).json({ success: false, message: 'Moment not found' });
  }

  moment.sharesCount = (moment.sharesCount || 0) + 1;
  saveDatabase(db);
  res.json({ success: true, sharesCount: moment.sharesCount });
});

// ==========================================
// 10. WHATSAPP STYLE CHATTING CLUB API
// ==========================================
app.get('/api/chat/rooms', (_req, res) => {
  if (!db.chatRooms) db.chatRooms = DEFAULT_CHAT_ROOMS;
  const realMemberTotal = db.users.length;
  const roomsWithRealCount = db.chatRooms.map(r => ({
    ...r,
    membersCount: realMemberTotal,
  }));
  res.json({ success: true, rooms: roomsWithRealCount });
});

app.post('/api/chat/rooms', (req, res) => {
  const { name, hindiName, description, category, createdById } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Room name is required' });
  }

  const newRoom: ChatRoom = {
    id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    hindiName: hindiName || name.trim(),
    description: description || 'Custom ESP Friend Group',
    category: category || 'group',
    createdById,
    membersCount: 1,
    lastMessage: 'Group room created! Invite your friends to join.',
    lastMessageTime: 'Just now',
  };

  if (!db.chatRooms) db.chatRooms = [];
  db.chatRooms.push(newRoom);
  saveDatabase(db);
  res.json({ success: true, message: 'Friend group room created!', room: newRoom });
});

app.get('/api/chat/messages/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (!db.chatMessages) db.chatMessages = DEFAULT_CHAT_MESSAGES;
  const msgs = db.chatMessages.filter(m => m.roomId === roomId).slice(-100);
  res.json({ success: true, messages: msgs });
});

app.post('/api/chat/messages', (req, res) => {
  const { roomId, senderId, senderName, senderRollNumber, senderAvatar, text, imageUrl } = req.body;
  if (!roomId || (!text && !imageUrl)) {
    return res.status(400).json({ success: false, message: 'Message text or image is required' });
  }

  const newMsg: ClubChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    roomId,
    senderId: senderId || 'guest',
    senderName: senderName || 'ESP Member',
    senderRollNumber: senderRollNumber || '',
    senderAvatar: senderAvatar || '',
    text: text || '',
    imageUrl: imageUrl || '',
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  if (!db.chatMessages) db.chatMessages = [];
  db.chatMessages.push(newMsg);

  const senderUser = db.users.find(u => u.userId === senderId || u.id === senderId);
  if (senderUser) {
    incrementUserTaskProgress(senderUser, 'chat_sent', 1);
  }

  // Update room last message
  const room = db.chatRooms.find(r => r.id === roomId);
  if (room) {
    room.lastMessage = (text || 'Sent an attachment').substring(0, 60);
    room.lastMessageTime = 'Just now';
  }

  saveDatabase(db);
  res.json({ success: true, message: newMsg });
});

app.get('/api/chat/contacts/:userId', (req, res) => {
  const { userId } = req.params;
  if (!db.contacts) db.contacts = [];
  const contacts = db.contacts.filter(c => c.userId.toLowerCase() === userId.toLowerCase());
  res.json({ success: true, contacts });
});

app.post('/api/chat/contacts', (req, res) => {
  const { userId, contactRollNumber, contactName, contactPhone, notes } = req.body;
  if (!userId || !contactRollNumber) {
    return res.status(400).json({ success: false, message: 'User ID and contact Roll Number are required' });
  }

  if (!db.contacts) db.contacts = [];
  const newContact: UserContact = {
    id: `cnt-${Date.now()}`,
    userId,
    contactRollNumber: contactRollNumber.trim().toUpperCase(),
    contactName: contactName || 'Friend',
    contactPhone: contactPhone || '',
    notes: notes || '',
    addedAt: new Date().toISOString(),
  };

  db.contacts.push(newContact);
  saveDatabase(db);
  res.json({ success: true, message: 'Contact saved successfully', contact: newContact });
});

// ==========================================
// 11. ADMIN USER AUDIT HISTORY & FORM REVIEW
// ==========================================
app.post('/api/admin/user-audits', (req, res) => {
  const { adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const audits = db.users.map(u => ({
    userId: u.userId,
    fullName: u.fullName,
    phone: u.phone,
    email: u.email,
    paymentAddress: u.paymentAddress,
    fullAddress: u.fullAddress,
    status: u.status,
    joiningDate: u.joiningDate,
    chosenServiceName: u.chosenServiceName,
    paymentUtr: u.paymentUtr,
    initialFormData: u.initialFormData || {
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      fullAddress: u.fullAddress,
      paymentAddress: u.paymentAddress,
      chosenServiceCode: u.chosenServiceCode,
      joiningFee: u.joiningFee,
      joiningDate: u.joiningDate,
      paymentUtr: u.paymentUtr,
    },
    editHistory: u.editHistory || [],
    avatar: u.avatar,
    bio: u.bio,
    gender: u.gender,
  }));

  res.json({ success: true, userAudits: audits });
});

// ===================== ESP GAMING ROOM & REAL COIN ECONOMY APIS =====================

// 1. Play Coin Game (Spin & Win, Lucky Dice, Coin Flip, or Wager Reservation for Direct Arcade Games)
app.post('/api/game/play', (req, res) => {
  const { userId, gameName, betAmount, choice } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const bet = Math.max(10, Math.round(Number(betAmount) || 10));
  const balanceBefore = user.coins || 0;
  if (balanceBefore < bet) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: bet,
      currentCoins: balanceBefore,
      message: `सिक्के (Coins) कम हैं! खेलने के लिए ${bet} Coins चाहिए, आपके पास ${balanceBefore} हैं। कृपया कॉइन्स खरीदें या असली टास्क पूरे करें।`,
    });
  }

  user.coins = balanceBefore - bet;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + bet;

  const today = getTodayDateString();
  if (!Array.isArray(user.daysPlayed)) user.daysPlayed = [];
  if (!user.daysPlayed.includes(today)) user.daysPlayed.push(today);
  user.totalDaysPlayed = user.daysPlayed.length;
  user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;

  incrementUserTaskProgress(user, 'game_played', 1);

  if (choice === 'direct') {
    if (!db.activeGameWagers || typeof db.activeGameWagers !== 'object') {
      db.activeGameWagers = {};
    }
    db.activeGameWagers[user.userId] = {
      gameName: String(gameName || 'Arcade Game'),
      bet,
      createdAt: new Date().toISOString(),
    };

    user.gameXp = (user.gameXp || 0) + 10;
    user.gameLevel = calculateLevelFromXp(user.gameXp);

    logCoinTransaction(db, user, {
      type: 'debit',
      category: 'game_bet',
      categoryLabel: String(gameName || 'Arcade Game'),
      amount: bet,
      balanceBefore,
      balanceAfter: user.coins,
      description: `${gameName || 'Arcade Game'} एंट्री बेट: -${bet} कॉइन्स`,
    });

    saveDatabase(db);
    return res.json({
      success: true,
      result: 'wager_placed',
      betAmount: bet,
      winAmount: 0,
      netChange: -bet,
      newBalance: user.coins,
      gameXp: user.gameXp,
      gameLevel: user.gameLevel,
      message: `${bet} कॉइन्स का बेट कन्फर्म हुआ। अब गेम खेलें!`,
      user,
    });
  }

  let isWin = false;
  let multiplier = 0;
  let gameOutcomeMessage = '';
  let diceValues = [1, 1];
  let wheelSegment = 0;
  let coinResult: 'heads' | 'tails' = 'heads';

  if (gameName === 'Spin & Win') {
    const segments = [0, 2, 0, 5, 1.5, 0, 3, 10];
    wheelSegment = Math.floor(Math.random() * segments.length);
    multiplier = segments[wheelSegment];
    isWin = multiplier > 0;
  } else if (gameName === 'Lucky Dice') {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    diceValues = [d1, d2];
    const sum = d1 + d2;
    if (choice === 'seven' && sum === 7) {
      isWin = true;
      multiplier = 5;
    } else if (choice === 'low' && sum >= 2 && sum <= 6) {
      isWin = true;
      multiplier = 2;
    } else if (choice === 'high' && sum >= 8 && sum <= 12) {
      isWin = true;
      multiplier = 2;
    }
  } else if (gameName === 'Coin Flip') {
    coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    if (choice === coinResult) {
      isWin = true;
      multiplier = 2;
    }
  }

  const winCoins = Math.round(bet * multiplier);
  if (isWin && winCoins > 0) {
    user.coins = (user.coins || 0) + winCoins;
    user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + winCoins;
    gameOutcomeMessage = `बधाई हो! आप ${winCoins} सिक्के जीत गए! 🎉`;
  } else {
    user.totalGamesLost = (user.totalGamesLost || 0) + 1;
    gameOutcomeMessage = `अफसोस! इस बार चूक गए (-${bet} Coins)। अगली बार प्रयास करें!`;
  }

  const vipCfg = getVipConfig(user.vipTier);
  const xpGain = Math.round((isWin ? 25 : 10) * (vipCfg?.bonusXpMultiplier || 1));
  user.gameXp = (user.gameXp || 0) + xpGain;
  user.gameLevel = calculateLevelFromXp(user.gameXp);

  const netChange = winCoins - bet;
  if (netChange !== 0) {
    logCoinTransaction(db, user, {
      type: netChange >= 0 ? 'credit' : 'debit',
      category: netChange >= 0 ? 'game_win' : 'game_bet',
      categoryLabel: String(gameName || 'Coin Game'),
      amount: Math.abs(netChange),
      balanceBefore,
      balanceAfter: user.coins,
      description: `${gameName}: बेट ${bet}, जीत ${winCoins} (${netChange > 0 ? '+' : ''}${netChange} कॉइन्स)`,
    });
  }

  if (!Array.isArray(db.gamePlayHistory)) db.gamePlayHistory = [];
  db.gamePlayHistory.unshift({
    id: `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    gameId: String(gameName || 'coin-game').toLowerCase().replace(/\s+/g, '-'),
    gameName: String(gameName || 'Coin Game'),
    betCoins: bet,
    wonCoins: winCoins,
    netChange,
    result: isWin ? 'win' : 'loss',
    durationSeconds: 15,
    playedAt: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({
    success: true,
    result: isWin ? 'win' : 'loss',
    multiplier,
    betAmount: bet,
    winAmount: winCoins,
    netChange,
    newBalance: user.coins,
    gameXp: user.gameXp,
    gameLevel: user.gameLevel,
    message: gameOutcomeMessage,
    diceValues,
    wheelSegment,
    coinResult,
    user,
  });
});

// 2. Buy / Recharge Coins (Real 12-Digit Unique UPI UTR with Admin Approval)
app.post('/api/game/recharge', (req, res) => {
  const { userId, packId, coins, bonusCoins, amount, paymentUtr, paymentScreenshot } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const utr = String(paymentUtr || '').replace(/\s+/g, '').toUpperCase();
  if (!/^\d{12}$/.test(utr)) {
    return res.status(400).json({
      success: false,
      message: 'कृपया PhonePe, Google Pay या Paytm से भुगतान के बाद सही 12-अंकों का संख्यात्मक UPI UTR नंबर दर्ज करें।',
    });
  }

  const cleanScreenshot = typeof paymentScreenshot === 'string' ? paymentScreenshot.trim() : '';
  if (!cleanScreenshot || cleanScreenshot.length < 20) {
    return res.status(400).json({
      success: false,
      message: 'कृपया UPI भुगतान के बाद पेमेंट स्क्रीनशॉट (Payment Screenshot) जरूर अपलोड करें।',
    });
  }

  if (!db.coinRecharges) db.coinRecharges = [];
  const duplicate = db.coinRecharges.find(
    r => r.paymentUtr === utr && (r.status === 'pending' || r.status === 'approved')
  );
  if (duplicate) {
    return res.status(400).json({
      success: false,
      message: `यह UTR नंबर (${utr}) पहले से ही सिस्टम में दर्ज है। कृपया नया/असली भुगतान UTR दर्ज करें।`,
    });
  }

  const matchedPack = packId ? COIN_RECHARGE_PACKS.find(p => p.id === packId) : undefined;
  const payAmount = matchedPack ? matchedPack.amount : Math.max(10, Math.round(Number(amount) || 10));
  const baseCoins = matchedPack ? matchedPack.coins : payAmount * 10;
  const bonus = matchedPack ? matchedPack.bonus : 0;

  const newRechargeOrder: CoinRechargeRequest = {
    id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: user.userId,
    userName: user.fullName,
    userPhone: user.phone,
    packId: matchedPack ? matchedPack.id : (packId || 'pack-custom'),
    coins: baseCoins,
    bonusCoins: bonus,
    amount: payAmount,
    paymentUtr: utr,
    paymentScreenshot: cleanScreenshot,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  db.coinRecharges.unshift(newRechargeOrder);

  db.transactions.unshift({
    id: `tx-recharge-${Date.now()}`,
    userId: user.userId,
    amount: payAmount,
    type: 'recharge_order',
    description: `Coins Recharge Order: ${baseCoins + bonus} Coins (UTR: ${utr})`,
    date: new Date().toISOString(),
    status: 'pending',
    referenceId: newRechargeOrder.id,
  });

  db.notifications.unshift({
    id: `notif-cr-${Date.now()}`,
    userId: user.userId,
    title: '⏳ कॉइन रिचार्ज अनुरोध पेंडिंग',
    message: `₹${payAmount} का पेमेंट UTR (${utr}) व स्क्रीनशॉट सत्यापन के लिए प्राप्त हुआ। एडमिन पुष्टि के बाद आपके वॉलेट में +${baseCoins + bonus} सिक्के जुड़ेंगे।`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  db.notifications.unshift({
    id: `notif-admin-cr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: 'EMO-MOM-MMO',
    title: `🪙 नया कॉइन खरीद अनुरोध: ₹${payAmount} (+${baseCoins + bonus} Coins)`,
    message: `${user.fullName} (${user.userId}) ने ₹${payAmount} भुगतान कर ${baseCoins + bonus} कॉइन्स का अनुरोध भेजा है। 12-अंक UTR: ${utr} (पेमेंट स्क्रीनशॉट संलग्न है)।`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  if (!Array.isArray(db.contactMessages)) db.contactMessages = [];
  db.contactMessages.unshift({
    id: `CNT-CR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: user.fullName,
    email: user.email || `${user.userId.toLowerCase()}@esp.local`,
    phone: user.phone,
    subject: `🪙 Coin Buy Request: ₹${payAmount} (+${baseCoins + bonus} Coins) | UTR: ${utr}`,
    message: `यूजर ${user.fullName} (ID: ${user.userId}${user.username ? `, @${user.username}` : ''}) ने ₹${payAmount} भुगतान कर ${baseCoins + bonus} कॉइन्स के लिए अनुरोध भेजा है। 12-अंक UTR: ${utr} • पेमेंट स्क्रीनशॉट कॉइन रिचार्ज टैब में देखें।`,
    createdAt: new Date().toISOString(),
    status: 'unread',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `पेमेंट UTR (${utr}) व स्क्रीनशॉट सबमिट हुआ! एडमिन सत्यापन के बाद +${baseCoins + bonus} सिक्के जुड़ेंगे।`,
    order: newRechargeOrder,
    coins: user.coins,
    user,
  });
});

// User's own coin recharge history
app.get('/api/game/user-recharges/:userId', (req, res) => {
  const { userId } = req.params;
  const recharges = (db.coinRecharges || []).filter(r => r.userId.toLowerCase() === userId.toLowerCase());
  res.json({ success: true, recharges });
});

// Admin: Get all Coin Recharge Orders
app.post('/api/admin/coin-recharges', (req, res) => {
  const { adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized Admin' });
  }
  res.json({
    success: true,
    coinRecharges: (db.coinRecharges || []).slice(),
  });
});

// Admin: Approve Coin Recharge Order and Credit Coins to User
app.post('/api/admin/coin-recharges/:id/approve', (req, res) => {
  const { adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized Admin' });
  }

  const { id } = req.params;
  if (!db.coinRecharges) db.coinRecharges = [];
  const order = db.coinRecharges.find(r => r.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Recharge order not found' });
  }
  if (order.status === 'approved') {
    return res.status(400).json({ success: false, message: 'This recharge order is already approved' });
  }

  const user = db.users.find(u => u.userId === order.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const totalCoinsToAdd = (order.coins || 0) + (order.bonusCoins || 0);
  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + totalCoinsToAdd;

  order.status = 'approved';
  order.processedAt = new Date().toISOString();

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'recharge',
    categoryLabel: 'UPI कॉइन रिचार्ज',
    amount: totalCoinsToAdd,
    balanceBefore,
    balanceAfter: user.coins,
    description: `₹${order.amount} रिचार्ज स्वीकृत (UTR: ${order.paymentUtr}): +${totalCoinsToAdd} कॉइन्स`,
  });

  const tx = db.transactions.find(t => t.referenceId === order.id);
  if (tx) {
    tx.status = 'completed';
  }

  db.notifications.unshift({
    id: `notif-cr-ok-${Date.now()}`,
    userId: user.userId,
    title: '🎉 कॉइन रिचार्ज स्वीकृत!',
    message: `आपके ₹${order.amount} के रिचार्ज (UTR: ${order.paymentUtr}) को एडमिन द्वारा सत्यापित कर लिया गया है। आपके वॉलेट में +${totalCoinsToAdd} सिक्के जुड़ गए हैं!`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `सफलतापूर्वक ${user.fullName} (${user.userId}) के खाते में +${totalCoinsToAdd} सिक्के जोड़े गए!`,
    order,
    user,
  });
});

// Admin: Reject Coin Recharge Order
app.post('/api/admin/coin-recharges/:id/reject', (req, res) => {
  const { adminPassword, reason } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized Admin' });
  }

  const { id } = req.params;
  if (!db.coinRecharges) db.coinRecharges = [];
  const order = db.coinRecharges.find(r => r.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Recharge order not found' });
  }

  order.status = 'rejected';
  order.processedAt = new Date().toISOString();
  order.rejectionReason = reason || 'अमान्य UTR नंबर / पेमेंट प्राप्त नहीं हुआ';

  const tx = db.transactions.find(t => t.referenceId === order.id);
  if (tx) {
    tx.status = 'failed';
  }

  db.notifications.unshift({
    id: `notif-cr-no-${Date.now()}`,
    userId: order.userId,
    title: '❌ कॉइन रिचार्ज अस्वीकृत',
    message: `आपके ₹${order.amount} के कॉइन रिचार्ज (UTR: ${order.paymentUtr}) को अस्वीकार कर दिया गया। कारण: ${order.rejectionReason}।`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  saveDatabase(db);
  res.json({ success: true, message: 'रिचार्ज अनुरोध अस्वीकृत किया गया', order });
});

// 3. Coin-to-Cash Conversion Disabled (Coins are strictly for VIP, Frames, Gifts & Games)
app.post('/api/game/convert', (_req, res) => {
  return res.status(403).json({
    success: false,
    code: 'CONVERSION_DISABLED',
    message: 'कॉइन्स को नकद (Cash) में बदलने का सिस्टम बंद कर दिया गया है। कॉइन्स केवल VIP, फ्रेम, वॉइस गिफ्ट्स व इन-ऐप गेम्स के लिए उपयोग होते हैं।',
  });
});

// Claim Live Game Win (Verified against server-recorded activeGameWagers)
app.post('/api/game/claim-win', (req, res) => {
  const { userId, gameName, winAmount } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const wager = db.activeGameWagers?.[user.userId];
  if (!wager) {
    return res.status(400).json({
      success: false,
      message: 'इस जीत के लिए कोई सक्रिय कॉइन बेट (Wager) नहीं मिला। पहले कॉइन्स से मैच शुरू करें।',
    });
  }

  const maxAllowedWin = wager.bet * 5;
  const win = Math.min(Math.max(0, Math.round(Number(winAmount) || 0)), maxAllowedWin);
  delete db.activeGameWagers![user.userId];

  if (win > 0) {
    const balanceBefore = user.coins || 0;
    user.coins = balanceBefore + win;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + win;
    user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    user.gameXp = (user.gameXp || 0) + Math.min(100, Math.max(10, Math.floor(win / 5)));
    user.gameLevel = calculateLevelFromXp(user.gameXp);

    logCoinTransaction(db, user, {
      type: 'credit',
      category: 'game_win',
      categoryLabel: String(gameName || wager.gameName),
      amount: win,
      balanceBefore,
      balanceAfter: user.coins,
      description: `${gameName || wager.gameName} जीत (बेट ${wager.bet}): +${win} कॉइन्स`,
    });

    if (!Array.isArray(db.gamePlayHistory)) db.gamePlayHistory = [];
    db.gamePlayHistory.unshift({
      id: `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.userId,
      userName: user.fullName,
      gameId: String(gameName || wager.gameName).toLowerCase().replace(/\s+/g, '-'),
      gameName: String(gameName || wager.gameName),
      betCoins: wager.bet,
      wonCoins: win,
      netChange: win - wager.bet,
      result: 'win',
      durationSeconds: 30,
      playedAt: new Date().toISOString(),
    });
  }

  saveDatabase(db);
  res.json({
    success: true,
    currentCoins: user.coins,
    coins: user.coins,
    gameXp: user.gameXp,
    gameLevel: user.gameLevel,
    user,
  });
});

// Daily Lucky Spin (Once every 24 hours, strict 50 coins real fee, server-authoritative roll)
app.post('/api/game/daily-lucky-spin', (req, res) => {
  const { userId } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const now = Date.now();
  if (user.lastDailySpin) {
    const lastSpinTime = new Date(user.lastDailySpin).getTime();
    const elapsed = now - lastSpinTime;
    const cooldownMs = 24 * 60 * 60 * 1000;
    if (elapsed < cooldownMs) {
      const remainingMs = cooldownMs - elapsed;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      return res.status(400).json({
        success: false,
        cooldownActive: true,
        remainingMs,
        message: `अगला स्पिन ${hours} घंटे ${mins} मिनट बाद उपलब्ध होगा। (24 घंटे में सिर्फ 1 बार)`,
      });
    }
  }

  const SPIN_COST = 50;
  const balanceBefore = user.coins || 0;
  if (balanceBefore < SPIN_COST) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: SPIN_COST,
      currentCoins: balanceBefore,
      message: `स्पिन करने के लिए ${SPIN_COST} कॉइन्स आवश्यक हैं। आपके पास केवल ${balanceBefore} कॉइन्स हैं। कृपया कॉइन्स खरीदें या टास्क पूरे करें।`,
    });
  }

  user.coins = balanceBefore - SPIN_COST;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + SPIN_COST;

  const SECTORS = [
    { id: 0, title: '100 Coins', label: '🪙 +100 Coins', type: 'coins', value: 100, charms: 0, xp: 20, weight: 0.25 },
    { id: 1, title: '50 Charms', label: '✨ +50 Charms', type: 'charms', value: 0, charms: 50, xp: 30, weight: 0.20 },
    { id: 2, title: '150 XP', label: '⚡ +150 XP', type: 'xp', value: 0, charms: 10, xp: 150, weight: 0.18 },
    { id: 3, title: '300 Coins Jackpot', label: '👑 +300 Coins', type: 'coins', value: 300, charms: 50, xp: 100, weight: 0.04 },
    { id: 4, title: 'Lucky Combo', label: '💎 50c + 25 Charms', type: 'combo', value: 50, charms: 25, xp: 25, weight: 0.14 },
    { id: 5, title: '250 XP Surge', label: '⚡ +250 XP', type: 'xp', value: 0, charms: 15, xp: 250, weight: 0.11 },
    { id: 6, title: '500 Coins Super Jackpot', label: '🌟 +500 Coins', type: 'coins', value: 500, charms: 100, xp: 200, weight: 0.02 },
    { id: 7, title: 'Mystery Box', label: '🎁 80c + 30 Charms', type: 'combo', value: 80, charms: 30, xp: 50, weight: 0.06 },
  ];

  let r = Math.random();
  let sectorIndex = 0;
  for (let i = 0; i < SECTORS.length; i++) {
    r -= SECTORS[i].weight;
    if (r <= 0) {
      sectorIndex = i;
      break;
    }
  }
  const reward = SECTORS[sectorIndex];

  user.coins = (user.coins || 0) + (reward.value || 0);
  user.charms = (user.charms || 0) + (reward.charms || 0);
  user.gameXp = (user.gameXp || 0) + (reward.xp || 0);
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.lastDailySpin = new Date().toISOString();
  incrementUserTaskProgress(user, 'game_played', 1);

  const net = (reward.value || 0) - SPIN_COST;
  if (net !== 0) {
    logCoinTransaction(db, user, {
      type: net >= 0 ? 'credit' : 'debit',
      category: 'fortune_spin',
      categoryLabel: 'डेली फॉर्च्यून स्पिन',
      amount: Math.abs(net),
      balanceBefore,
      balanceAfter: user.coins,
      description: `डेली स्पिन (शुल्क ${SPIN_COST} Coins) -> जीता ${reward.label}`,
    });
  }

  saveDatabase(db);
  res.json({
    success: true,
    message: `स्पिन पूरा! आपको मिला: ${reward.label}! 🎉`,
    reward,
    sectorIndex,
    coins: user.coins,
    charms: user.charms,
    gameXp: user.gameXp,
    gameLevel: user.gameLevel,
    lastDailySpin: user.lastDailySpin,
    user,
  });
});

// Helper: Build Daily Game Hub Payload
function buildDailyHubPayload(user: UserProfile) {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString(today);
  const intel = getDailyIntelForDate(today);
  const fullQuiz = getDailyQuizForDate(today);
  const spotlightGame = getSpotlightGameForDate(today);

  const timeMeta = getVerifiedLiveIstTimeMeta();
  const lastCheckIn = user.lastDailyCheckInDate || '';
  const claimedToday = lastCheckIn === today;
  const rawStreak = Number(user.loginStreak || 0);
  const isConsecutiveFromYesterday = Boolean(lastCheckIn && lastCheckIn === yesterday && rawStreak > 0);
  const streakMissedReset = Boolean(lastCheckIn && !claimedToday && !isConsecutiveFromYesterday && rawStreak > 0);
  // Strict consecutive rule: miss even 1 day -> resets cleanly back to Day 1!
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
    const isClaimedInCycle = !streakMissedReset && item.day <= completedDaysInCycle;
    const isToday = !claimedToday && item.day === nextDayNumber;
    return {
      ...item,
      claimed: isClaimedInCycle,
      isToday,
    };
  });

  const playedToday = user.dailyFreeGameDate === today ? Number(user.dailyFreeGamesPlayed || 0) : 0;
  const coinBoosterActive = Boolean(
    user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
  );

  const topDailyPlayers = [...db.users]
    .sort((a, b) => (b.gameXp || 0) - (a.gameXp || 0) || (b.coins || 0) - (a.coins || 0))
    .slice(0, 5)
    .map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      username: u.username,
      avatar: u.avatar,
      gameLevel: u.gameLevel || 1,
      gameXp: u.gameXp || 0,
      coins: u.coins || 0,
      totalGamesWon: u.totalGamesWon || 0,
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
      alreadyAnswered: user.dailyQuizDate === today,
    },
    spotlightGame,
    checkIn: {
      canClaimToday: !claimedToday,
      currentStreak: effectiveStreak,
      nextDayNumber,
      streakAtRisk: streakMissedReset,
      streakMissedReset,
      streakShields: Number(user.streakShields || 0),
      schedule,
    },
    freePlay: {
      playedToday,
      dailyLimit: FREE_SKILL_PLAY_DAILY_LIMIT,
      remaining: Math.max(0, FREE_SKILL_PLAY_DAILY_LIMIT - playedToday),
      coinBoosterActive,
      coinBoosterUntil: coinBoosterActive ? user.coinBoosterUntil : null,
    },
    topDailyPlayers,
  };
}

// Live IST Midnight Clock API
app.get('/api/time/live', (_req, res) => {
  res.json({ success: true, timeMeta: getVerifiedLiveIstTimeMeta() });
});

// 3A. GET Daily Fresh Hub (Rotating Knowledge Intel, Daily Quiz, 7-Day Streak, Free Play Cap, Leaderboard)
app.get('/api/game/daily-hub/:userId', (req, res) => {
  const uid = decodeURIComponent(req.params.userId || '').trim();
  const user = db.users.find(u => u.userId.toLowerCase() === uid.toLowerCase() || u.id === uid);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  ensureDailyTaskState(user);
  const hub = buildDailyHubPayload(user);
  res.json({ success: true, hub, timeMeta: hub.timeMeta, user });
});

// 3B. Claim Daily 7-Day Check-In Streak (+5c -> +50c Mega Chest, supports Streak Shield)
app.post('/api/game/daily-checkin', (req, res) => {
  const { userId, useShield } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString(today);
  if (user.lastDailyCheckInDate === today) {
    return res.status(400).json({
      success: false,
      message: 'आज का डेली चेक-इन रिवॉर्ड पहले ही क्लेम किया जा चुका है! कल फिर आएं।',
    });
  }

  let newStreak = 1;
  let shieldConsumed = false;
  const prevDate = user.lastDailyCheckInDate || '';
  const prevStreak = Number(user.loginStreak || 0);

  if (prevDate === yesterday) {
    newStreak = prevStreak + 1;
  } else if (prevDate && prevStreak > 0) {
    // Missed at least one day
    if (useShield && Number(user.streakShields || 0) > 0) {
      user.streakShields = Number(user.streakShields || 0) - 1;
      newStreak = prevStreak + 1;
      shieldConsumed = true;
    } else {
      newStreak = 1;
    }
  }

  const dayIndex = (newStreak - 1) % 7;
  const rewardDef = SEVEN_DAY_CHECKIN_REWARDS[dayIndex];
  const boosterActive = Boolean(
    user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
  );
  const vipCfg = getVipConfig(user.vipTier);
  const coinsEarned = rewardDef.coins + (boosterActive ? 5 : 0);
  const xpEarned = Math.round(rewardDef.xp * (vipCfg?.bonusXpMultiplier || 1) * (boosterActive ? 1.5 : 1));

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + coinsEarned;
  user.gameXp = (user.gameXp || 0) + xpEarned;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.loginStreak = newStreak;
  user.lastDailyCheckInDate = today;
  ensureDailyTaskState(user);
  user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + 5);
  if (!Array.isArray(user.daysPlayed)) user.daysPlayed = [];
  if (!user.daysPlayed.includes(today)) user.daysPlayed.push(today);
  user.totalDaysPlayed = user.daysPlayed.length;

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_checkin',
    categoryLabel: `Day ${rewardDef.day} Check-In Streak`,
    amount: coinsEarned,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${rewardDef.label} (Streak #${newStreak}${shieldConsumed ? ' · 🛡️ Shield Used' : ''}): +${coinsEarned} कॉइन्स व +${xpEarned} EXP`,
  });

  saveDatabase(db);
  const hub = buildDailyHubPayload(user);
  res.json({
    success: true,
    message: `🎉 ${rewardDef.label} पूरा! +${coinsEarned} कॉइन्स और +${xpEarned} EXP मिले!${shieldConsumed ? ' (🛡️ स्ट्रीक शील्ड से स्ट्रीक सुरक्षित रही!)' : ''}`,
    coinsEarned,
    xpEarned,
    newStreak,
    shieldConsumed,
    hub,
    user,
  });
});

// 3C. Answer Today's Fresh Knowledge Trivia Quiz (+10 Coins + 25 EXP, 2x with Booster)
app.post('/api/game/daily-quiz', (req, res) => {
  const { userId, selectedIndex } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = getTodayDateString();
  if (user.dailyQuizDate === today) {
    return res.status(400).json({
      success: false,
      message: 'आज का डेली नॉलेज क्विज़ पहले ही पूरा हो चुका है! कल नया सवाल मिलेगा।',
    });
  }

  const quiz = getDailyQuizForDate(today);
  const idx = Number(selectedIndex);
  if (!Number.isInteger(idx) || idx < 0 || idx >= quiz.options.length) {
    return res.status(400).json({ success: false, message: 'कृपया एक मान्य विकल्प चुनें।' });
  }

  const isCorrect = idx === quiz.correctIndex;
  const boosterActive = Boolean(
    user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
  );
  const vipCfg = getVipConfig(user.vipTier);

  const baseCoins = isCorrect ? quiz.coinReward : 2; // Learning bonus even on attempt
  const coinsEarned = boosterActive ? baseCoins * 2 : baseCoins;
  const baseXp = isCorrect ? quiz.xpReward : 10;
  const xpEarned = Math.round(baseXp * (vipCfg?.bonusXpMultiplier || 1) * (boosterActive ? 1.5 : 1));

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + coinsEarned;
  user.gameXp = (user.gameXp || 0) + xpEarned;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.dailyQuizDate = today;
  if (isCorrect) {
    user.dailyQuizCorrectCount = (user.dailyQuizCorrectCount || 0) + 1;
  }

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_quiz',
    categoryLabel: isCorrect ? 'डेली क्विज़ सही जवाब' : 'डेली क्विज़ प्रयास बोनस',
    amount: coinsEarned,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${quiz.topic} — ${isCorrect ? 'सही जवाब!' : 'सीखने का बोनस'}: +${coinsEarned} कॉइन्स व +${xpEarned} EXP`,
  });

  saveDatabase(db);
  const hub = buildDailyHubPayload(user);
  res.json({
    success: true,
    isCorrect,
    correctIndex: quiz.correctIndex,
    explanation: quiz.explanation,
    coinsEarned,
    xpEarned,
    message: isCorrect
      ? `🧠 शानदार! सही जवाब — +${coinsEarned} कॉइन्स और +${xpEarned} EXP प्राप्त हुए!`
      : `💡 ${quiz.explanation} (प्रयास बोनस: +${coinsEarned} कॉइन्स व +${xpEarned} EXP)`,
    hub,
    user,
  });
});

// 3D. Free-to-Earn Skill Play (0-Coin players can play real matches & win Coins + EXP!)
app.post('/api/game/skill-play', (req, res) => {
  const { userId, gameName, outcome, score } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = getTodayDateString();
  if (user.dailyFreeGameDate !== today) {
    user.dailyFreeGameDate = today;
    user.dailyFreeGamesPlayed = 0;
  }

  const playedSoFar = Number(user.dailyFreeGamesPlayed || 0);
  const withinDailyRewardCap = playedSoFar < FREE_SKILL_PLAY_DAILY_LIMIT;

  const isWin = outcome === 'win';
  const spotlight = getSpotlightGameForDate(today);
  const cleanGameKey = String(gameName || 'skill').toLowerCase().trim();
  const isSpotlightMatch = spotlight.key === cleanGameKey;
  const boosterActive = Boolean(
    user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
  );
  const vipCfg = getVipConfig(user.vipTier);

  let coinsEarned = 0;
  let xpEarned = 8;

  if (withinDailyRewardCap) {
    const baseCoins = isWin ? 10 : 3;
    const spotlightBonus = isWin && isSpotlightMatch ? spotlight.extraCoins : 0;
    coinsEarned = (baseCoins + spotlightBonus) * (boosterActive ? 2 : 1);
    xpEarned = Math.round((isWin ? 25 : 10) * (isSpotlightMatch ? 1.5 : 1) * (vipCfg?.bonusXpMultiplier || 1) * (boosterActive ? 1.5 : 1));
    user.dailyFreeGamesPlayed = playedSoFar + 1;
  } else {
    xpEarned = 5;
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + coinsEarned;
  user.gameXp = (user.gameXp || 0) + xpEarned;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
  if (isWin) {
    user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + coinsEarned;
  }
  if (!Array.isArray(user.daysPlayed)) user.daysPlayed = [];
  if (!user.daysPlayed.includes(today)) user.daysPlayed.push(today);
  user.totalDaysPlayed = user.daysPlayed.length;
  incrementUserTaskProgress(user, 'game_played', 1);

  if (coinsEarned > 0) {
    logCoinTransaction(db, user, {
      type: 'credit',
      category: 'skill_game_reward',
      categoryLabel: `${String(gameName || 'Skill Match')} (Free Earn)`,
      amount: coinsEarned,
      balanceBefore,
      balanceAfter: user.coins,
      description: `${String(gameName || 'Skill Game')} ${isWin ? 'जीत' : 'भागीदारी'}${isSpotlightMatch ? ' · ⭐ 2x Spotlight' : ''}${boosterActive ? ' · ⚡ 2x Pass' : ''}: +${coinsEarned} कॉइन्स`,
    });
  }

  if (!Array.isArray(db.gamePlayHistory)) db.gamePlayHistory = [];
  db.gamePlayHistory.unshift({
    id: `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    gameId: cleanGameKey,
    gameName: `${String(gameName || 'Skill Game')} (Free)`,
    betCoins: 0,
    wonCoins: coinsEarned,
    netChange: coinsEarned,
    result: isWin ? 'win' : 'reward',
    durationSeconds: 20,
    playedAt: new Date().toISOString(),
    details: score !== undefined ? `Score: ${score}` : undefined,
  });
  if (db.gamePlayHistory.length > 3000) db.gamePlayHistory = db.gamePlayHistory.slice(0, 3000);

  saveDatabase(db);
  const hub = buildDailyHubPayload(user);
  res.json({
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
      ? `${isWin ? '🎉 शानदार जीत!' : '👏 बढ़िया प्रयास!'} +${coinsEarned} कॉइन्स और +${xpEarned} EXP मिले! (आज ${user.dailyFreeGamesPlayed}/${FREE_SKILL_PLAY_DAILY_LIMIT} फ्री रिवॉर्ड राउंड)`
      : `प्रैक्टिस राउंड पूरा! आज के ${FREE_SKILL_PLAY_DAILY_LIMIT} फ्री कॉइन राउंड पूरे हो चुके हैं — प्रो कॉइन टेबल खेलें या कल फिर आएं! (+${xpEarned} EXP)`,
    hub,
    user,
  });
});

// 3E. Buy Coin Power-Up / Utility Booster (2x Coin Surge Pass or Streak Shield)
app.post('/api/game/buy-booster', (req, res) => {
  const { userId, boosterId } = req.body;
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const booster = COIN_UTILITY_BOOSTERS.find(b => b.id === boosterId);
  if (!booster) {
    return res.status(404).json({ success: false, message: 'Booster not found' });
  }

  const balanceBefore = user.coins || 0;
  if (balanceBefore < booster.coinPrice) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: booster.coinPrice,
      currentCoins: balanceBefore,
      message: `${booster.hindiName} के लिए ${booster.coinPrice} कॉइन्स चाहिए (आपके पास: ${balanceBefore})। पहले फ्री स्किल गेम या डेली क्विज़ से कॉइन्स जीतें!`,
    });
  }

  user.coins = balanceBefore - booster.coinPrice;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + booster.coinPrice;

  if (booster.id === 'booster_2x_24h') {
    const currentExpiry = user.coinBoosterUntil && new Date(user.coinBoosterUntil).getTime() > Date.now()
      ? new Date(user.coinBoosterUntil).getTime()
      : Date.now();
    user.coinBoosterUntil = new Date(currentExpiry + 24 * 60 * 60 * 1000).toISOString();
  } else if (booster.id === 'streak_shield') {
    user.streakShields = Number(user.streakShields || 0) + 1;
  }

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'coin_booster',
    categoryLabel: booster.name,
    amount: booster.coinPrice,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${booster.hindiName} सक्रिय (-${booster.coinPrice} Coins)`,
  });

  saveDatabase(db);
  const hub = buildDailyHubPayload(user);
  res.json({
    success: true,
    message: `⚡ ${booster.hindiName} सफलतापूर्वक अनलॉक हो गया!`,
    booster,
    hub,
    user,
  });
});

// 4. Send Room / Family / Profile Gift (ESP PLAY Stage + Gift Wall + Gift History + PK Battle)
const SERVER_LEGACY_GIFT_MAP: Record<string, { id: string; name: string; icon: string }> = {
  g1: { id: 'pop_2', name: 'Red Rose', icon: '🌹' },
  g2: { id: 'pop_4', name: 'Choco Delight', icon: '🍫' },
  g3: { id: 'pop_5', name: 'Diamond Ring', icon: '💍' },
  g4: { id: 'lux_1', name: 'Super Ferrari', icon: '🏎️' },
  g5: { id: 'diwali_4', name: 'Sky Rocket Dhamaka', icon: '🚀' },
  g6: { id: 'lux_2', name: 'Emperor Crown', icon: '👑' },
  g7: { id: 'lux_3', name: 'Magic Castle', icon: '🏰' },
};

app.post('/api/game/send-gift', (req, res) => {
  const {
    senderId,
    targetName,
    targetUserId,
    giftId,
    giftName,
    giftIcon,
    coinCost,
    charmValue,
    quantity,
    context,
    roomId,
    familyId,
    pkSide,
  } = req.body;
  const sender = db.users.find(u => u.userId === senderId || u.id === senderId);
  if (!sender) {
    return res.status(404).json({ success: false, message: 'Sender not found' });
  }

  const cost = Math.max(1, Math.round(Number(coinCost) || 10));
  const qty = Math.max(1, Math.round(Number(quantity) || 1));
  const balanceBefore = sender.coins || 0;
  if (balanceBefore < cost) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: cost,
      currentCoins: balanceBefore,
      message: `गिफ्ट भेजने के लिए ${cost} सिक्के चाहिए! आपके पास केवल ${balanceBefore} सिक्के हैं।`,
    });
  }

  const charmsVal = Math.max(1, Math.round(Number(charmValue) || cost));
  sender.coins = balanceBefore - cost;
  sender.totalCoinsSpent = (sender.totalCoinsSpent || 0) + cost;
  sender.charms = (sender.charms || 0) + Math.round(charmsVal * 0.2);
  sender.gameXp = (sender.gameXp || 0) + Math.max(10, Math.round(cost * 0.5));
  sender.gameLevel = calculateLevelFromXp(sender.gameXp);
  incrementUserTaskProgress(sender, 'gift_sent', 1);

  const cleanTargetName = String(targetName || '').trim().replace(/^@+/, '').toLowerCase();
  const recipient = targetUserId
    ? db.users.find(u => u.userId === targetUserId || u.id === targetUserId)
    : cleanTargetName
      ? db.users.find(
          u =>
            u.userId.toLowerCase() === cleanTargetName ||
            (u.username || '').toLowerCase() === cleanTargetName ||
            (u.fullName || '').trim().toLowerCase() === cleanTargetName
        )
      : undefined;

  const rawKey = String(giftId || giftName || 'pop_2').trim();
  const mapped = SERVER_LEGACY_GIFT_MAP[rawKey];
  const gKey = mapped ? mapped.id : rawKey;
  const canonicalName = mapped ? mapped.name : String(giftName || 'Gift').replace(/^\d+x\s+/i, '');
  const canonicalIcon = mapped ? mapped.icon : String(giftIcon || '🎁');
  const nowIso = new Date().toISOString();

  if (recipient) {
    if (recipient.userId !== sender.userId) {
      recipient.charms = (recipient.charms || 0) + charmsVal;
    }
    if (!recipient.receivedGifts || typeof recipient.receivedGifts !== 'object') {
      recipient.receivedGifts = {};
    }
    const prevGift = recipient.receivedGifts[gKey];
    recipient.receivedGifts[gKey] = {
      id: gKey,
      name: canonicalName,
      icon: canonicalIcon,
      count: (prevGift?.count || 0) + qty,
      coinCost: Math.round(cost / qty),
      charmValue: Math.round(charmsVal / qty),
      lastReceivedAt: nowIso,
      lastSenderName: sender.fullName,
    };

    // Boost intimacy points for any active mutual Relationship Bond / CP tag
    if (Array.isArray(sender.activeRelationships)) {
      sender.activeRelationships.forEach(b => {
        if (b.partnerUserId === recipient.userId && b.status === 'accepted') {
          b.intimacyPoints = (b.intimacyPoints || 0) + cost;
        }
      });
    }
    if (Array.isArray(recipient.activeRelationships)) {
      recipient.activeRelationships.forEach(b => {
        if (b.partnerUserId === sender.userId && b.status === 'accepted') {
          b.intimacyPoints = (b.intimacyPoints || 0) + cost;
        }
      });
    }
  }

  // Record permanent Gift History entry
  if (!Array.isArray(db.giftHistory)) db.giftHistory = [];
  const giftCtx: GiftHistoryRecord['context'] =
    context === 'family_chat' || familyId ? 'family_chat' : context === 'profile' ? 'profile' : 'voice_room';
  const giftRecord: GiftHistoryRecord = {
    id: `GH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: sender.userId,
    senderName: sender.fullName,
    senderAvatar: sender.avatar,
    recipientId: recipient?.userId || String(targetUserId || targetName || 'STAGE'),
    recipientName: recipient?.fullName || String(targetName || 'Voice Stage'),
    recipientAvatar: recipient?.avatar,
    giftId: gKey,
    giftName: canonicalName,
    giftIcon: canonicalIcon,
    quantity: qty,
    coinCost: cost,
    charmValue: charmsVal,
    context: giftCtx,
    roomId: roomId || undefined,
    familyId: familyId || undefined,
    createdAt: nowIso,
  };
  db.giftHistory.unshift(giftRecord);
  if (db.giftHistory.length > 5000) db.giftHistory = db.giftHistory.slice(0, 5000);

  // If sent inside an active Voice Room, update room charms, PK score & stage chat
  let updatedRoomSummary: any = undefined;
  if (roomId) {
    const rooms = getOrCreateRooms(db);
    const room = rooms.find(r => r.id === roomId || String(r.roomAddress) === String(roomId));
    if (room) {
      const tierSpec = getVoiceRoomTierSpec(room.roomTier);
      const effectiveCharms = Math.round(charmsVal * (tierSpec.pkBoostMultiplier || 1));
      room.roomCharms = (room.roomCharms || 0) + effectiveCharms;
      if (room.pkBattle?.active) {
        if (pkSide === 'blue' || (recipient && recipient.userId !== room.hostUserId && pkSide !== 'red')) {
          room.pkBattle.blueScore = (room.pkBattle.blueScore || 0) + effectiveCharms;
        } else {
          room.pkBattle.redScore = (room.pkBattle.redScore || 0) + effectiveCharms;
        }
      }
      if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
      room.chatMessages.push({
        id: `rgift-${Date.now()}`,
        senderId: sender.userId,
        sender: sender.fullName,
        senderRoll: sender.userId,
        senderAvatar: sender.avatar,
        isGift: true,
        text: `${canonicalIcon} ${sender.fullName} ने ${recipient?.fullName || targetName || 'Stage'} को ${qty}x ${canonicalName} भेजा! (+${effectiveCharms} Charms ✨)`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      updatedRoomSummary = buildRoomDetailPayload(room, sender.userId);
    }
  }

  // If sent inside an ESP Family chat, credit Family Charms & Family Chat stream
  if (familyId && Array.isArray(db.families)) {
    const fam = db.families.find(f => f.id === familyId);
    if (fam) {
      fam.familyCharms = (fam.familyCharms || 0) + charmsVal;
      if (!Array.isArray(fam.chatMessages)) fam.chatMessages = [];
      fam.chatMessages.push({
        id: `fgift-${Date.now()}`,
        familyId: fam.id,
        senderId: sender.userId,
        senderName: sender.fullName,
        senderAvatar: sender.avatar,
        senderRole: (fam.members.find(m => m.userId === sender.userId)?.role) || 'Member',
        text: `${canonicalIcon} ${sender.fullName} ने ${recipient?.fullName || targetName || fam.name} को ${qty}x ${canonicalName} भेंट किया! (+${charmsVal} Family Charms)`,
        isGift: true,
        giftId: gKey,
        giftName: canonicalName,
        giftIcon: canonicalIcon,
        giftQuantity: qty,
        recipientName: recipient?.fullName || targetName || fam.name,
        coinCost: cost,
        createdAt: nowIso,
      });
      if (fam.chatMessages.length > 200) fam.chatMessages = fam.chatMessages.slice(-200);
    }
  }

  logCoinTransaction(db, sender, {
    type: 'debit',
    category: 'gift_sent',
    categoryLabel: giftCtx === 'family_chat' ? 'फैमिली गिफ्ट भेंट' : 'रूम गिफ्ट भेंट',
    amount: cost,
    balanceBefore,
    balanceAfter: sender.coins,
    description: `${recipient?.fullName || targetName || 'रूम स्टेज'} को ${qty}x ${canonicalName} भेंट किया (-${cost} कॉइन्स)`,
  });

  db.chatMessages.push({
    id: `gift-${Date.now()}`,
    roomId: 'room-global',
    senderId: sender.userId,
    senderName: sender.fullName,
    senderRollNumber: sender.userId,
    senderAvatar: sender.avatar,
    text: `🎁 [गिफ्ट भेजा] ${sender.fullName} ने ${recipient?.fullName || targetName || 'रूम स्टेज'} को ${qty}x ${canonicalName} भेंट किया! (+${charmsVal} Charms ✨)`,
    createdAt: nowIso,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${qty}x ${canonicalName} सफलतापूर्वक भेजा गया! ✨`,
    coins: sender.coins,
    charms: sender.charms,
    gameXp: sender.gameXp,
    gameLevel: sender.gameLevel,
    giftRecord,
    roomPayload: updatedRoomSummary,
    user: sender,
  });
});

app.get('/api/game/gift-history/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(
    u =>
      u.userId.toLowerCase() === userId.toLowerCase() ||
      u.id.toLowerCase() === userId.toLowerCase() ||
      (normalizeUsername(userId) && normalizeUsername(u.username) === normalizeUsername(userId))
  );
  const targetUid = user ? user.userId.toLowerCase() : userId.toLowerCase();
  const targetName = user ? user.fullName.trim().toLowerCase() : '';
  const all = (db.giftHistory || []).filter(
    g =>
      g.senderId.toLowerCase() === targetUid ||
      (g.recipientId || '').toLowerCase() === targetUid ||
      (targetName && g.recipientName.trim().toLowerCase() === targetName)
  );
  const sent = all.filter(g => g.senderId.toLowerCase() === targetUid);
  const received = all.filter(
    g => (g.recipientId || '').toLowerCase() === targetUid || (targetName && g.recipientName.trim().toLowerCase() === targetName)
  );
  res.json({
    success: true,
    sent,
    received,
    all,
    totalSentCoins: sent.reduce((s, x) => s + (x.coinCost || 0), 0),
    totalReceivedCharms: received.reduce((s, x) => s + (x.charmValue || 0), 0),
  });
});

// ==============================================================
// REAL DAILY TASKS (+5 COINS & EXP), QUALITY FRAME STORE & VIP BUY SYSTEM
// ==============================================================

app.get('/api/tasks/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const tasks = getTasksStatusForUser(user);
  const claimedCount = (user.claimedTaskIds || []).length;
  const chests = CHEST_MILESTONES.map(ch => ({
    ...ch,
    isUnlocked: claimedCount >= ch.requiredTasksCompleted,
    isClaimed: (user.claimedChestMilestones || []).includes(ch.id),
  }));
  const activenessChests = getActivenessChestsForUser(user);
  const growthTasks = getGrowthTasksForUser(user);
  const familyTasks = getFamilyTasksForUser(user);
  saveDatabase(db);

  res.json({
    success: true,
    tasks,
    chests,
    todayActiveness: Number(user.todayActiveness || 0),
    activenessChests,
    growthTasks,
    familyTasks,
    claimedTodayCount: claimedCount,
    claimedChestMilestones: user.claimedChestMilestones || [],
    tasksCompletedCount: user.tasksCompletedCount || 0,
    timeMeta: getLiveIstTimeMeta(),
    user,
  });
});

app.post('/api/tasks/track', (req, res) => {
  const { userId, eventType, increment } = req.body;
  const allowedEvents: TaskEventType[] = ['profile_completed', 'chat_sent', 'moment_posted', 'voice_joined', 'game_played', 'gift_sent'];
  if (!userId || !allowedEvents.includes(eventType)) {
    return res.status(400).json({ success: false, message: 'Valid userId and task eventType required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  incrementUserTaskProgress(user, eventType, Number(increment) || 1);
  const tasks = getTasksStatusForUser(user);
  saveDatabase(db);

  res.json({ success: true, tasks, user });
});

app.post('/api/tasks/claim', (req, res) => {
  const { userId, taskId } = req.body;
  if (!userId || !taskId) {
    return res.status(400).json({ success: false, message: 'userId and taskId are required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  ensureDailyTaskState(user);
  const taskDef = REAL_TASKS_CATALOG.find(t => t.id === taskId);
  if (!taskDef) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const currentProgress = Number(user.taskProgress?.[taskDef.eventType] || 0);
  if (currentProgress < taskDef.targetCount) {
    return res.status(400).json({
      success: false,
      code: 'TASK_NOT_COMPLETED',
      message: `Complete "${taskDef.title}" (${currentProgress}/${taskDef.targetCount}) first to claim +${taskDef.coinReward} Coins & EXP.`,
    });
  }

  if ((user.claimedTaskIds || []).includes(taskDef.id)) {
    return res.status(400).json({
      success: false,
      message: 'This daily task reward has already been claimed today.',
    });
  }

  const balanceBefore = user.coins || 0;
  const coinsEarned = taskDef.coinReward;
  const activenessEarned = Number(taskDef.activenessReward || 15);
  const vipCfg = getVipConfig(user.vipTier);
  const xpEarned = Math.round(taskDef.xpReward * (vipCfg?.bonusXpMultiplier || 1));

  const newCoins = balanceBefore + coinsEarned;
  user.coins = newCoins;
  user.gameXp = (user.gameXp || 0) + xpEarned;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedTaskIds!.push(taskDef.id);
  user.tasksCompletedCount = (user.tasksCompletedCount || 0) + 1;
  user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + activenessEarned);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_task',
    categoryLabel: 'Daily Task Reward',
    amount: coinsEarned,
    balanceBefore,
    balanceAfter: newCoins,
    description: `${taskDef.title}: +${coinsEarned} Coins, +${activenessEarned} Activeness & +${xpEarned} EXP`,
  });

  const tasks = getTasksStatusForUser(user);
  const claimedCount = (user.claimedTaskIds || []).length;
  const chests = CHEST_MILESTONES.map(ch => ({
    ...ch,
    isUnlocked: claimedCount >= ch.requiredTasksCompleted,
    isClaimed: (user.claimedChestMilestones || []).includes(ch.id),
  }));
  const activenessChests = getActivenessChestsForUser(user);

  saveDatabase(db);
  res.json({
    success: true,
    message: `Claimed "${taskDef.title}": +${coinsEarned} Coins, +${activenessEarned} Activeness & +${xpEarned} EXP!`,
    coinsAwarded: coinsEarned,
    coinsEarned,
    xpAwarded: xpEarned,
    xpEarned,
    activenessEarned,
    todayActiveness: user.todayActiveness,
    activenessChests,
    newBalance: user.coins,
    gameXp: user.gameXp,
    gameLevel: user.gameLevel,
    tasks,
    chests,
    user,
  });
});

app.post('/api/tasks/claim-activeness-chest', (req, res) => {
  const { userId, threshold } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  ensureDailyTaskState(user);
  const numThreshold = Number(threshold);
  const chest = ACTIVENESS_CHESTS_CATALOG.find(c => c.threshold === numThreshold);
  if (!chest) {
    return res.status(404).json({ success: false, message: 'Activeness chest not found' });
  }

  const currentActiveness = Number(user.todayActiveness || 0);
  if (currentActiveness < chest.threshold) {
    return res.status(400).json({
      success: false,
      message: `Reach ${chest.threshold} Today's Activeness to unlock ${chest.label} (Current: ${currentActiveness}).`,
    });
  }

  if ((user.claimedActivenessChests || []).includes(chest.threshold)) {
    return res.status(400).json({ success: false, message: 'This Activeness Chest has already been claimed today.' });
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + chest.coinReward;
  user.gameXp = (user.gameXp || 0) + chest.xpReward;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedActivenessChests!.push(chest.threshold);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'task_chest',
    categoryLabel: 'Activeness Chest Reward',
    amount: chest.coinReward,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${chest.label} Opened: +${chest.coinReward} Coins & +${chest.xpReward} EXP`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${chest.label} Opened! +${chest.coinReward} Coins & +${chest.xpReward} EXP!`,
    coinsEarned: chest.coinReward,
    xpEarned: chest.xpReward,
    activenessChests: getActivenessChestsForUser(user),
    user,
  });
});

app.post('/api/tasks/claim-growth', (req, res) => {
  const { userId, taskId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  ensureDailyTaskState(user);
  const growthTasks = getGrowthTasksForUser(user);
  const task = growthTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Growth milestone not found' });
  }
  if (!task.isCompleted) {
    return res.status(400).json({
      success: false,
      message: `Complete "${task.title}" (${task.currentProgress}/${task.targetCount}) first to claim +${task.coinReward} Coins.`,
    });
  }
  if (task.isClaimed) {
    return res.status(400).json({ success: false, message: 'Growth milestone already claimed!' });
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + task.coinReward;
  user.gameXp = (user.gameXp || 0) + task.xpReward;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedGrowthTaskIds!.push(task.id);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_task',
    categoryLabel: 'Growth Milestone Reward',
    amount: task.coinReward,
    balanceBefore,
    balanceAfter: user.coins,
    description: `Growth Achievement "${task.title}": +${task.coinReward} Coins & +${task.xpReward} EXP`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `Growth Unlocked "${task.title}": +${task.coinReward} Coins & +${task.xpReward} EXP!`,
    coinsEarned: task.coinReward,
    xpEarned: task.xpReward,
    growthTasks: getGrowthTasksForUser(user),
    user,
  });
});

app.post('/api/tasks/claim-family', (req, res) => {
  const { userId, taskId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  ensureDailyTaskState(user);
  const familyTasks = getFamilyTasksForUser(user);
  const task = familyTasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Family task not found' });
  }
  if (!task.isCompleted) {
    return res.status(400).json({
      success: false,
      message: `Complete "${task.title}" (${task.currentProgress}/${task.targetCount}) first to claim reward.`,
    });
  }
  if (task.isClaimed) {
    return res.status(400).json({ success: false, message: 'Family task already claimed today!' });
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + task.coinReward;
  user.gameXp = (user.gameXp || 0) + task.xpReward;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedFamilyTaskIds!.push(task.id);
  user.todayActiveness = Math.min(100, Number(user.todayActiveness || 0) + task.activenessReward);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_task',
    categoryLabel: 'Family Task Reward',
    amount: task.coinReward,
    balanceBefore,
    balanceAfter: user.coins,
    description: `Family Task "${task.title}": +${task.coinReward} Coins, +${task.activenessReward} Activeness & +${task.xpReward} EXP`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `Family Task Claimed: +${task.coinReward} Coins, +${task.activenessReward} Activeness & +${task.xpReward} EXP!`,
    coinsEarned: task.coinReward,
    xpEarned: task.xpReward,
    activenessEarned: task.activenessReward,
    todayActiveness: user.todayActiveness,
    activenessChests: getActivenessChestsForUser(user),
    familyTasks: getFamilyTasksForUser(user),
    user,
  });
});

app.post('/api/tasks/claim-chest', (req, res) => {
  const { userId, chestId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  ensureDailyTaskState(user);
  const chest = CHEST_MILESTONES.find(c => c.id === chestId);
  if (!chest) {
    return res.status(404).json({ success: false, message: 'Milestone chest not found' });
  }

  const claimedTasksToday = (user.claimedTaskIds || []).length;
  if (claimedTasksToday < chest.requiredTasksCompleted) {
    return res.status(400).json({
      success: false,
      message: `इस चेस्ट के लिए पहले आज के ${chest.requiredTasksCompleted} असली टास्क पूरे करें (अभी ${claimedTasksToday}/${chest.requiredTasksCompleted} पूर्ण)।`,
    });
  }

  if ((user.claimedChestMilestones || []).includes(chest.id)) {
    return res.status(400).json({ success: false, message: 'यह माइलस्टोन चेस्ट आज पहले ही खोला जा चुका है!' });
  }

  const balanceBefore = user.coins || 0;
  const newCoins = balanceBefore + chest.coinReward;
  user.coins = newCoins;
  user.gameXp = (user.gameXp || 0) + chest.xpReward;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedChestMilestones!.push(chest.id);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'task_chest',
    categoryLabel: 'टास्क माइलस्टोन चेस्ट',
    amount: chest.coinReward,
    balanceBefore,
    balanceAfter: newCoins,
    description: `${chest.hindiLabel} अनलॉक: +${chest.coinReward} कॉइन्स व +${chest.xpReward} EXP`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `🎁 ${chest.hindiLabel} खुला! +${chest.coinReward} कॉइन्स व +${chest.xpReward} EXP प्राप्त हुए!`,
    coinsEarned: chest.coinReward,
    xpEarned: chest.xpReward,
    newBalance: newCoins,
    user,
  });
});

// Buy Avatar Frame (Quality-Tiered Coins System)
app.post('/api/store/buy-frame', (req, res) => {
  const { userId, frameId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const frame = getFrameByVariant(frameId);
  if (!Array.isArray(user.unlockedFrames)) user.unlockedFrames = ['standard'];

  if (user.unlockedFrames.includes(frame.variant) || frame.coinPrice === 0) {
    if (!user.unlockedFrames.includes(frame.variant)) user.unlockedFrames.push(frame.variant);
    user.frameType = frame.variant;
    saveDatabase(db);
    return res.json({
      success: true,
      message: `${frame.hindiName} फ्रेम सफलतापूर्वक सक्रिय हो गया!`,
      user,
    });
  }

  const balanceBefore = user.coins || 0;
  if (balanceBefore < frame.coinPrice) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: frame.coinPrice,
      currentCoins: balanceBefore,
      message: `${frame.hindiName} (${frame.quality}) फ्रेम के लिए ${frame.coinPrice} कॉइन्स चाहिए। आपके पास केवल ${balanceBefore} कॉइन्स हैं! कृपया कॉइन्स खरीदें या टास्क पूरे करें।`,
    });
  }

  const newCoins = balanceBefore - frame.coinPrice;
  user.coins = newCoins;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + frame.coinPrice;
  user.unlockedFrames.push(frame.variant);
  user.frameType = frame.variant;

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'frame_purchase',
    categoryLabel: 'अवतार फ्रेम खरीद',
    amount: frame.coinPrice,
    balanceBefore,
    balanceAfter: newCoins,
    description: `${frame.hindiName} [${frame.quality}] फ्रेम खरीदा (-${frame.coinPrice} कॉइन्स)`,
  });

  db.notifications.unshift({
    id: `notif-frame-${Date.now()}`,
    userId: user.userId,
    title: `🖼️ ${frame.quality} फ्रेम अनलॉक!`,
    message: `आपने ${frame.coinPrice} कॉइन्स से "${frame.hindiName}" फ्रेम खरीदा और प्रोफाइल पर लगाया।`,
    date: new Date().toISOString(),
    read: false,
    type: 'system',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `🎉 ${frame.hindiName} (${frame.quality}) फ्रेम सफलतापूर्वक खरीदा और सेट हो गया!`,
    newBalance: newCoins,
    user,
  });
});

// Equip Already-Owned Frame
app.post('/api/store/equip-frame', (req, res) => {
  const { userId, frameId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const frame = getFrameByVariant(frameId);
  const owned = Array.isArray(user.unlockedFrames) ? user.unlockedFrames : ['standard'];
  if (frame.coinPrice > 0 && !owned.includes(frame.variant)) {
    return res.status(400).json({
      success: false,
      code: 'FRAME_LOCKED',
      requiredCoins: frame.coinPrice,
      currentCoins: user.coins || 0,
      message: `${frame.hindiName} फ्रेम लॉक है! इसे लगाने के लिए पहले ${frame.coinPrice} कॉइन्स से खरीदें।`,
    });
  }

  user.frameType = frame.variant;
  saveDatabase(db);
  res.json({
    success: true,
    message: `🖼️ ${frame.hindiName} फ्रेम आपकी प्रोफाइल पर लागू हो गया!`,
    user,
  });
});

// Buy VIP Pass with Real Coins
app.post('/api/store/buy-vip', (req, res) => {
  const { userId, vipTier } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const targetVip = VIP_TIERS.find(v => v.id === vipTier);
  if (!targetVip) {
    return res.status(400).json({ success: false, message: 'अमान्य VIP प्लान चयनित किया गया।' });
  }

  const tierOrder: Record<string, number> = { none: 0, silver: 1, gold: 2, diamond: 3 };
  const currentRank = tierOrder[user.vipTier || 'none'] || 0;
  const targetRank = tierOrder[targetVip.id] || 0;

  if (currentRank === targetRank) {
    return res.status(400).json({ success: false, message: `आपके पास पहले से ही ${targetVip.hindiName} सक्रिय है!` });
  }
  if (currentRank > targetRank) {
    return res.status(400).json({ success: false, message: 'आप इससे उच्च स्तर के VIP प्लान पर पहले से हैं।' });
  }

  const balanceBefore = user.coins || 0;
  if (balanceBefore < targetVip.coinPrice) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: targetVip.coinPrice,
      currentCoins: balanceBefore,
      message: `${targetVip.hindiName} खरीदने के लिए ${targetVip.coinPrice} कॉइन्स चाहिए। आपके पास ${balanceBefore} कॉइन्स हैं! कृपया कॉइन्स खरीदें या टास्क पूरे करें।`,
    });
  }

  const newCoins = balanceBefore - targetVip.coinPrice;
  user.coins = newCoins;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + targetVip.coinPrice;
  user.vipTier = targetVip.id;
  user.vipTitle = targetVip.badgeText;
  user.vipPurchasedAt = new Date().toISOString();
  if (targetVip.id === 'diamond') user.crownPost = true;

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'vip_purchase',
    categoryLabel: 'VIP मेंबरशिप खरीद',
    amount: targetVip.coinPrice,
    balanceBefore,
    balanceAfter: newCoins,
    description: `${targetVip.hindiName} खरीदा (-${targetVip.coinPrice} कॉइन्स)`,
  });

  db.notifications.unshift({
    id: `notif-vip-${Date.now()}`,
    userId: user.userId,
    title: `👑 ${targetVip.hindiName} सक्रिय हुआ!`,
    message: `बधाई! आपने ${targetVip.coinPrice} कॉइन्स से ${targetVip.hindiName} खरीदा। अब आपका एक्सक्लूसिव बैज व बोनस EXP पावर सक्रिय है!`,
    date: new Date().toISOString(),
    read: false,
    type: 'system',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `👑 बधाई हो! ${targetVip.hindiName} सफलतापूर्वक सक्रिय हो गया!`,
    newBalance: newCoins,
    user,
  });
});

// Buy Room Theme with Real Coins
app.post('/api/store/buy-room', (req, res) => {
  const { userId, roomId } = req.body;
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const theme = ADVANCE_ROOM_THEMES.find(t => t.id === roomId);
  if (!theme) {
    return res.status(404).json({ success: false, message: 'Room theme not found' });
  }

  if (!Array.isArray(user.unlockedRooms)) user.unlockedRooms = ['default_dark'];
  if (user.unlockedRooms.includes(theme.id) || theme.coinPrice === 0) {
    if (!user.unlockedRooms.includes(theme.id)) user.unlockedRooms.push(theme.id);
    user.roomTheme = theme.id;
    saveDatabase(db);
    return res.json({ success: true, message: `${theme.name} थीम सक्रिय हो गई!`, user });
  }

  const balanceBefore = user.coins || 0;
  if (balanceBefore < theme.coinPrice) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: theme.coinPrice,
      currentCoins: balanceBefore,
      message: `"${theme.name}" रूम थीम के लिए ${theme.coinPrice} कॉइन्स चाहिए। आपके पास केवल ${balanceBefore} कॉइन्स हैं!`,
    });
  }

  const newCoins = balanceBefore - theme.coinPrice;
  user.coins = newCoins;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + theme.coinPrice;
  user.unlockedRooms.push(theme.id);
  user.roomTheme = theme.id;

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'room_purchase',
    categoryLabel: 'रूम थीम खरीद',
    amount: theme.coinPrice,
    balanceBefore,
    balanceAfter: newCoins,
    description: `${theme.name} रूम थीम खरीदी (-${theme.coinPrice} कॉइन्स)`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `🏛️ "${theme.name}" रूम थीम अनलॉक होकर सक्रिय हो गई!`,
    newBalance: newCoins,
    user,
  });
});

// ==============================================================
// MULTI-ROOM VOICE STAGE & REAL AUDIO STREAMING SYSTEM
// ==============================================================

function ensureUserRoomAddress(database: Database, user: UserProfile): string {
  const roomsList = database.customVoiceRooms || [];
  if (!isNumericRoomId(user.roomAddress)) {
    let candidate = '';
    if (
      (user.userId === 'EMO-MOM-MMO' || user.role === 'admin') &&
      !isRoomAddressTaken('1111', database.users, roomsList, user.userId)
    ) {
      candidate = '1111';
      user.isVipRoom = true;
      user.vipRoomLabel = user.vipRoomLabel || 'VIP Royal';
    } else {
      candidate = generateUniqueRoomId(user.fullName || user.userId, database.users, roomsList, user.userId);
    }
    user.roomAddress = candidate;
    user.personalRoomId = candidate;
  } else {
    user.roomAddress = String(user.roomAddress).trim();
    user.personalRoomId = user.roomAddress;
    if (user.isVipRoom === undefined && isVipFancyRoomNumber(user.roomAddress)) {
      user.isVipRoom = true;
    }
  }
  return user.roomAddress!;
}

function ensurePersonalRoomForUser(database: Database, user: UserProfile): NonNullable<Database['customVoiceRooms']>[number] {
  if (!Array.isArray(database.customVoiceRooms)) {
    database.customVoiceRooms = [];
  }
  const fixedRoomIdCode = ensureUserRoomAddress(database, user);
  const isFounder = user.userId === 'EMO-MOM-MMO' || user.role === 'admin';
  const cleanTag = String(user.userId || 'USR').replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const targetId = isFounder ? 'room-founder' : `roompersonal${cleanTag}`;

  let existing = database.customVoiceRooms.find(
    r =>
      r.id === targetId ||
      (r.isPersonalFixed && r.hostUserId === user.userId) ||
      (isFounder && r.id === 'room-founder')
  );

  if (!existing) {
    existing = {
      id: targetId,
      title: isFounder ? 'ESP Royal Voice Stage (Official)' : `${user.fullName}'s Voice Room`,
      topic: isFounder
        ? 'ESP 10 Services Discussion & Real Gaming Club'
        : `Welcome to ${user.fullName}'s Personal Fixed Voice Room`,
      category: user.accountType === 'gamer' ? 'gaming' : 'earning',
      roomAddress: fixedRoomIdCode,
      roomNumber: fixedRoomIdCode,
      isPersonalFixed: true,
      isVipRoom: Boolean(user.isVipRoom || isVipFancyRoomNumber(fixedRoomIdCode)),
      vipRoomLabel: user.vipRoomLabel || (isFounder ? 'VIP Royal' : ''),
      hostUserId: user.userId,
      hostName: user.fullName,
      hostUsername: user.username || '',
      hostAvatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
      hostLevel: user.gameLevel || 1,
      hostCharms: user.charms || 0,
      wallpaperId: 'castle_night',
      customWallpaperUrl: '',
      stageLayout: 'classic_8',
      youtubeVideoUrl: '',
      youtubeVideoTitle: '',
      lockedSeats: [],
      followers: [],
      roomCharms: user.charms || 0,
      createdAt: user.createdAt || new Date().toISOString(),
      seats:
        isFounder && Array.isArray(database.voiceRoomSeats) && database.voiceRoomSeats.length === 8
          ? database.voiceRoomSeats
          : Array.from({ length: 8 }, (_, i) => ({
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
          text: isFounder
            ? '🔔 System: Welcome to ESP Official Voice Stage! Join, follow, or tap an empty mic seat.'
            : `🔔 System: ${user.fullName}'s personal fixed room (ID: ${fixedRoomIdCode}) is live! Invite friends to join & follow.`,
          time: 'Live',
        },
      ],
      audience: [user.userId],
    };
    if (isFounder) {
      database.customVoiceRooms.unshift(existing);
    } else {
      database.customVoiceRooms.push(existing);
    }
  } else {
    existing.roomAddress = fixedRoomIdCode;
    existing.roomNumber = fixedRoomIdCode;
    existing.isPersonalFixed = true;
    existing.isVipRoom = Boolean(user.isVipRoom || isVipFancyRoomNumber(fixedRoomIdCode));
    existing.vipRoomLabel = user.vipRoomLabel || existing.vipRoomLabel || '';
    existing.hostName = user.fullName;
    existing.hostUsername = user.username || existing.hostUsername || '';
    existing.hostAvatar = user.avatar || existing.hostAvatar;
    existing.hostLevel = user.gameLevel || existing.hostLevel || 1;
    existing.hostCharms = user.charms ?? existing.hostCharms ?? 0;
    if (!existing.wallpaperId) existing.wallpaperId = 'castle_night';
    if (!existing.stageLayout) existing.stageLayout = 'classic_8';
    if (!Array.isArray(existing.lockedSeats)) existing.lockedSeats = [];
    if (!Array.isArray(existing.followers)) existing.followers = [];
    if (!Array.isArray(existing.audience)) existing.audience = [user.userId];
  }

  return existing;
}

function getOrCreateRooms(database: Database): NonNullable<Database['customVoiceRooms']> {
  if (!Array.isArray(database.customVoiceRooms)) {
    database.customVoiceRooms = [];
  }
  const rooms = database.customVoiceRooms;

  if (Array.isArray(database.users) && database.users.length > 0) {
    for (const u of database.users) {
      ensurePersonalRoomForUser(database, u);
    }
  } else if (database.customVoiceRooms.length === 0) {
    database.customVoiceRooms = [
      {
        id: 'room-founder',
        title: 'ESP Royal Voice Stage (Official)',
        topic: 'ESP 10 Services Discussion & Real Gaming Club',
        category: 'earning',
        roomAddress: '1111',
        roomNumber: '1111',
        isPersonalFixed: true,
        isVipRoom: true,
        vipRoomLabel: 'VIP Royal',
        hostUserId: 'EMO-MOM-MMO',
        hostName: 'SANTOSH KUMAR',
        hostAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
        hostLevel: 1,
        hostCharms: 0,
        wallpaperId: 'castle_night',
        customWallpaperUrl: '',
        stageLayout: 'classic_8',
        lockedSeats: [],
        followers: [],
        roomCharms: 0,
        createdAt: new Date().toISOString(),
        seats: database.voiceRoomSeats || Array.from({ length: 8 }, (_, i) => ({
          seatNumber: i + 1,
          seatNumberLabel: String(i + 1),
          isMuted: false,
          isSpeaking: false,
          charms: 0,
        })),
        chatMessages: [
          {
            id: 'msg-init',
            senderId: 'SYSTEM',
            sender: 'System',
            senderRoll: 'STAGE',
            text: '🔔 System: Welcome to ESP Royal Voice Stage! Tap + to grab an empty seat.',
            time: 'Live',
          }
        ],
        audience: ['EMO-MOM-MMO'],
      }
    ];
  }

  // Migrate any extra custom rooms with non-numeric roomAddress to sequential counting Room IDs
  for (const r of rooms) {
    if (!isNumericRoomId(r.roomAddress)) {
      const cleanAddr = generateUniqueRoomId(r.hostName || r.title || 'ESP', database.users, rooms);
      r.roomAddress = cleanAddr;
      r.roomNumber = cleanAddr;
    }
    if (!r.roomNumber) r.roomNumber = r.roomAddress;
    if (r.isVipRoom === undefined) {
      const hostUser = database.users.find(u => u.userId === r.hostUserId);
      r.isVipRoom = Boolean(hostUser?.isVipRoom || isVipFancyRoomNumber(r.roomAddress));
      r.vipRoomLabel = hostUser?.vipRoomLabel || '';
    }
    if (!r.wallpaperId) r.wallpaperId = 'castle_night';
    if (!r.stageLayout) r.stageLayout = 'classic_8';
    if (!Array.isArray(r.lockedSeats)) r.lockedSeats = [];
    if (!Array.isArray(r.followers)) r.followers = [];
    if (!Array.isArray(r.audience)) r.audience = [r.hostUserId];
  }

  return rooms;
}

function buildRoomSummary(r: any, viewerId?: string) {
  const followers = Array.isArray(r.followers) ? r.followers : [];
  const audience = Array.isArray(r.audience) ? r.audience : [];
  const lockedSeats = Array.isArray(r.lockedSeats) ? r.lockedSeats : [];
  const seats = Array.isArray(r.seats) ? r.seats : [];
  const tierId: VoiceRoomTierId = r.roomTier || 'normal';
  const nowMs = Date.now();
  const activePackets = (Array.isArray(r.activePackets) ? r.activePackets : []).filter(
    (p: any) => p.remainingCoins > 0 && p.claimedBy.length < p.maxClaims && new Date(p.expiresAt).getTime() > nowMs
  );
  return {
    id: r.id,
    title: r.title,
    topic: r.topic,
    category: r.category,
    roomAddress: r.roomAddress,
    roomNumber: r.roomNumber || r.roomAddress,
    isPersonalFixed: Boolean(r.isPersonalFixed),
    isVipRoom: Boolean(r.isVipRoom || isVipFancyRoomNumber(r.roomAddress)),
    vipRoomLabel: r.vipRoomLabel || '',
    roomTier: tierId,
    isPremiumRoom: Boolean(r.isPremiumRoom || tierId !== 'normal'),
    roomEffect: r.roomEffect || 'none',
    activePackets,
    pkBattle: r.pkBattle || { active: false, redLabel: 'Team Red', blueLabel: 'Team Blue', redScore: 0, blueScore: 0 },
    hostUserId: r.hostUserId,
    hostName: r.hostName,
    hostUsername: r.hostUsername || '',
    hostAvatar: r.hostAvatar,
    hostLevel: r.hostLevel || 1,
    hostCharms: r.hostCharms || 0,
    wallpaperId: r.wallpaperId || 'castle_night',
    customWallpaperUrl: r.customWallpaperUrl || '',
    stageLayout: r.stageLayout || 'classic_8',
    youtubeVideoUrl: r.youtubeVideoUrl || '',
    youtubeVideoTitle: r.youtubeVideoTitle || '',
    lockedSeats,
    followers,
    followersCount: followers.length,
    isFollowed: Boolean(viewerId && followers.includes(viewerId)),
    roomCharms: r.roomCharms || r.hostCharms || 0,
    isPrivate: Boolean(r.isPrivate),
    passcode: viewerId && viewerId === r.hostUserId ? r.passcode || '' : undefined,
    occupiedSeatsCount: seats.filter((s: any) => Boolean(s.userId)).length,
    listenersCount: Math.max(1, audience.length),
    audience,
    seats,
    createdAt: r.createdAt,
  };
}

function buildRoomDetailPayload(room: any, viewerId?: string) {
  const hostUser = db.users.find(u => u.userId === room.hostUserId) || {
    userId: room.hostUserId,
    username: room.hostUsername || '',
    fullName: room.hostName,
    avatar: room.hostAvatar,
    gameLevel: room.hostLevel || 1,
    charms: room.hostCharms || 0,
    roomAddress: room.roomAddress,
  };

  const host = {
    userId: hostUser.userId,
    userName: hostUser.fullName,
    username: (hostUser as any).username || room.hostUsername || '',
    gameLevel: (hostUser as any).gameLevel || 1,
    charms: (hostUser as any).charms || 0,
    userAvatar: (hostUser as any).avatar || room.hostAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    isSpeaking: true,
    isMuted: false,
    roleTitle: room.id === 'room-founder' ? 'ESP Founder & Room Host' : 'Room Owner & Host',
  };

  const realAudience = db.users.map(u => ({
    userId: u.userId,
    username: u.username || '',
    fullName: u.fullName,
    chosenServiceName: u.chosenServiceName || u.chosenServiceCode,
    joiningDate: u.joiningDate,
    status: u.status,
    coins: u.coins || 0,
    charms: u.charms || 0,
    gameLevel: u.gameLevel || 1,
    vipTier: u.vipTier || 'none',
    frameType: u.frameType || 'standard',
    roomAddress: ensureUserRoomAddress(db, u),
    clanName: u.clanName || 'Royal Warriors ESP',
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
  }));

  const topContributors = [...db.users]
    .filter(u => (u.charms || 0) > 0 || (room.audience || []).includes(u.userId) || u.userId === room.hostUserId)
    .sort((a, b) => (b.charms || 0) - (a.charms || 0) || (b.gameXp || 0) - (a.gameXp || 0))
    .slice(0, 3)
    .map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
      coins: Math.max(0, u.charms || 0),
    }));

  const lockedSet = new Set<number>(Array.isArray(room.lockedSeats) ? room.lockedSeats : []);
  const enrichedSeats = (room.seats || []).map((s: any, idx: number) => ({
    ...s,
    isLocked: lockedSet.has(idx),
  }));

  return {
    success: true,
    room: {
      ...buildRoomSummary(room, viewerId),
      seats: enrichedSeats,
      topContributors,
    },
    host,
    seats: enrichedSeats,
    audience: realAudience,
    audienceCount: Math.max(1, (room.audience || []).length),
    chatMessages: room.chatMessages || [],
  };
}

// 6. Get List of All Active Voice Rooms (Includes every user's Fixed Personal Room)
app.get('/api/game/voice-rooms', (req, res) => {
  const viewerId = String(req.query.viewerId || '').trim();
  const rawQ = String(req.query.q || '').trim().replace(/^(id:|room:|#)/i, '').trim();
  const q = rawQ.toLowerCase();
  const rooms = getOrCreateRooms(db);
  saveDatabase(db);

  let filtered = rooms;
  if (q) {
    const cleanQ = q.replace(/[^a-z0-9]/g, '');
    filtered = rooms.filter(r => {
      const addr = String(r.roomAddress || '').toLowerCase();
      const title = String(r.title || '').toLowerCase();
      const host = String(r.hostName || '').toLowerCase();
      const hostId = String(r.hostUserId || '').toLowerCase();
      const hostUname = String(r.hostUsername || '').toLowerCase();
      return (
        addr.includes(q) ||
        (cleanQ && addr.includes(cleanQ)) ||
        title.includes(q) ||
        host.includes(q) ||
        hostId.includes(q) ||
        (cleanQ && hostUname.includes(cleanQ))
      );
    }).sort((a, b) => {
      const aExact = String(a.roomAddress || '').toLowerCase() === cleanQ ? 1 : 0;
      const bExact = String(b.roomAddress || '').toLowerCase() === cleanQ ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      const aVip = (a.isVipRoom || isVipFancyRoomNumber(a.roomAddress)) ? 1 : 0;
      const bVip = (b.isVipRoom || isVipFancyRoomNumber(b.roomAddress)) ? 1 : 0;
      return bVip - aVip;
    });
  } else {
    filtered = [...rooms].sort((a, b) => {
      const aVip = (a.isVipRoom || isVipFancyRoomNumber(a.roomAddress)) ? 1 : 0;
      const bVip = (b.isVipRoom || isVipFancyRoomNumber(b.roomAddress)) ? 1 : 0;
      return bVip - aVip;
    });
  }

  const roomsSummary = filtered.map(r => buildRoomSummary(r, viewerId));
  res.json({ success: true, rooms: roomsSummary });
});

// 6.0 Get or Auto-Provision a User's Fixed Personal Voice Room
app.get('/api/game/voice-rooms/my-room/:userId', (req, res) => {
  const { userId } = req.params;
  const viewerId = String(req.query.viewerId || userId || '').trim();
  const user = db.users.find(
    u =>
      u.userId.toLowerCase() === userId.toLowerCase() ||
      u.id.toLowerCase() === userId.toLowerCase() ||
      (normalizeUsername(userId) && normalizeUsername(u.username) === normalizeUsername(userId))
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const room = ensurePersonalRoomForUser(db, user);
  saveDatabase(db);
  return res.json(buildRoomDetailPayload(room, viewerId));
});

// 6.05 Lookup Voice Room by Numeric/VIP Room ID (e.g. 1111, 10001), roomId, hostUserId, or @username
app.get('/api/game/voice-rooms/lookup/:query', (req, res) => {
  const rawQuery = decodeURIComponent(String(req.params.query || '')).trim().replace(/^(id:|room:|#)/i, '').trim();
  const viewerId = String(req.query.viewerId || '').trim();
  const rooms = getOrCreateRooms(db);
  const qLower = rawQuery.toLowerCase();
  const qClean = rawQuery.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Prioritize exact Room ID match (critical for quick VIP numeric lookup like 1111, 2222, 1234)
  const match =
    rooms.find(r => String(r.roomAddress || '').toLowerCase() === qLower || String(r.roomAddress || '').toLowerCase() === qClean) ||
    rooms.find(r => r.id.toLowerCase() === qLower) ||
    rooms.find(r => String(r.hostUserId || '').toLowerCase() === qLower) ||
    rooms.find(r => qClean && String(r.hostUsername || '').toLowerCase() === qClean);

  if (!match) {
    return res.status(404).json({ success: false, message: `रूम ID "${rawQuery}" नहीं मिला।` });
  }
  return res.json(buildRoomDetailPayload(match, viewerId));
});

// 6.1 Create New Custom Voice Room (Normal Free 0c OR Advance/Premium Tiers with Coins)
app.post('/api/game/voice-rooms/create', (req, res) => {
  const {
    userId,
    title,
    topic,
    category,
    isPrivate,
    passcode,
    hostName,
    hostAvatar,
    wallpaperId,
    customWallpaperUrl,
    stageLayout,
    youtubeVideoUrl,
    roomTier,
  } = req.body;
  const user = db.users.find(u =>
    (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
    (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );

  if (!user) {
    return res.status(401).json({ success: false, message: 'वॉइस रूम बनाने के लिए कृपया पहले लॉगिन करें।' });
  }

  const chosenTier = getVoiceRoomTierSpec(roomTier || 'normal');
  if (!Array.isArray(user.unlockedRoomTiers)) user.unlockedRoomTiers = ['normal'];
  const alreadyUnlocked = chosenTier.coinPrice === 0 || user.unlockedRoomTiers.includes(chosenTier.id);
  if (!alreadyUnlocked) {
    const before = user.coins || 0;
    if (before < chosenTier.coinPrice) {
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_COINS',
        requiredCoins: chosenTier.coinPrice,
        currentCoins: before,
        message: `${chosenTier.hindiName} के लिए ${chosenTier.coinPrice} Coins चाहिए! आपके पास केवल ${before} Coins हैं (Normal Room बिल्कुल फ्री है)।`,
      });
    }
    user.coins = before - chosenTier.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + chosenTier.coinPrice;
    user.unlockedRoomTiers.push(chosenTier.id);
    logCoinTransaction(db, user, {
      type: 'debit',
      category: 'room_purchase',
      categoryLabel: 'प्रीमियम रूम टियर अनलॉक',
      amount: chosenTier.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${chosenTier.name} रूम क्रिएशन अनलॉक (-${chosenTier.coinPrice} कॉइन्स)`,
    });
  }

  const cleanTitle = (title || `${user.fullName}'s Voice Room`).trim();
  const cleanTopic = (topic || 'General Voice Discussion & Strategy').trim();
  const rooms = getOrCreateRooms(db);

  const cleanUserTag = user.userId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'usr';
  const roomId = `room${cleanUserTag}${Date.now().toString(36)}`;
  const roomAddress = generateUniqueRoomId(user.fullName || cleanTitle, db.users, rooms);

  const initialSeats = [
    {
      seatNumber: 1,
      seatNumberLabel: '1 (Host)',
      userId: user.userId,
      userName: user.fullName,
      gameLevel: user.gameLevel || 1,
      charms: user.charms || 0,
      isMuted: false,
      isSpeaking: true,
      userAvatar: user.avatar || hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
    },
    ...Array.from({ length: 7 }, (_, i) => ({
      seatNumber: i + 2,
      seatNumberLabel: String(i + 2),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }))
  ];

  const requestedLayout = (stageLayout || 'classic_8') as 'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party';
  const safeLayout = chosenTier.allowedLayouts.includes(requestedLayout) ? requestedLayout : chosenTier.allowedLayouts[0];

  const newRoom = {
    id: roomId,
    title: cleanTitle,
    topic: cleanTopic,
    category: (category as any) || 'earning',
    roomAddress,
    roomNumber: roomAddress,
    isPersonalFixed: false,
    roomTier: chosenTier.id,
    isPremiumRoom: chosenTier.id !== 'normal',
    pkBattle: null as any,
    hostUserId: user.userId,
    hostName: hostName || user.fullName,
    hostUsername: user.username || '',
    hostAvatar: user.avatar || hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
    hostLevel: user.gameLevel || 1,
    hostCharms: user.charms || 0,
    wallpaperId: wallpaperId || 'castle_night',
    customWallpaperUrl: typeof customWallpaperUrl === 'string' ? customWallpaperUrl : '',
    stageLayout: safeLayout,
    youtubeVideoUrl: typeof youtubeVideoUrl === 'string' ? youtubeVideoUrl.trim() : '',
    youtubeVideoTitle: '',
    lockedSeats: [],
    followers: [user.userId],
    roomCharms: user.charms || 0,
    createdAt: new Date().toISOString(),
    isPrivate: Boolean(isPrivate),
    passcode: passcode || '',
    seats: initialSeats,
    chatMessages: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'SYSTEM',
        sender: 'System',
        senderRoll: 'STAGE',
        text: `🔔 System: ${user.fullName} started ${chosenTier.badgeLabel} voice room "${cleanTitle}" (ID: ${roomAddress})!`,
        time: 'Live',
      }
    ],
    audience: [user.userId],
  };

  incrementUserTaskProgress(user, 'voice_joined', 1);
  rooms.unshift(newRoom);
  saveDatabase(db);

  res.json({
    success: true,
    message: `🎉 आपका ${chosenTier.name} "${cleanTitle}" (ID: ${roomAddress}) तैयार हो गया!`,
    room: buildRoomSummary(newRoom, user.userId),
    roomId: newRoom.id,
    user,
  });
});

// 6.2 Get Specific Room State (Matches by room.id OR symbol-free roomAddress)
app.get('/api/game/voice-rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const viewerId = String(req.query.viewerId || '').trim();
  const rooms = getOrCreateRooms(db);
  const qLower = roomId.toLowerCase();
  const room =
    rooms.find(
      r =>
        r.id.toLowerCase() === qLower ||
        String(r.roomAddress || '').toLowerCase() === qLower
    ) || rooms[0];

  res.json(buildRoomDetailPayload(room, viewerId));
});

// Backward-compatible default room endpoint
app.get('/api/game/voice-room', (req, res) => {
  const viewerId = String(req.query.viewerId || '').trim();
  const rooms = getOrCreateRooms(db);
  const room = rooms[0];
  res.json(buildRoomDetailPayload(room, viewerId));
});

// 6.3 Join Room (Explicit Join + Task tracking + Audience tracking)
app.post('/api/game/voice-rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { userId, passcode } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const qLower = roomId.toLowerCase();
  const room = rooms.find(
    r => r.id.toLowerCase() === qLower || String(r.roomAddress || '').toLowerCase() === qLower
  );
  if (!room) {
    return res.status(404).json({ success: false, message: 'Voice room not found' });
  }
  const user = db.users.find(
    u =>
      (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
      (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'कृपया पहले लॉगिन करें।' });
  }
  if (room.isPrivate && room.passcode && room.hostUserId !== user.userId && String(passcode || '') !== String(room.passcode)) {
    return res.status(403).json({
      success: false,
      requiresPasscode: true,
      message: '🔒 यह प्राइवेट रूम है! प्रवेश के लिए सही पासकोड दर्ज करें।',
    });
  }

  if (!Array.isArray(room.audience)) room.audience = [];
  const firstJoin = !room.audience.includes(user.userId);
  if (firstJoin) {
    room.audience.push(user.userId);
    incrementUserTaskProgress(user, 'voice_joined', 1);
    if (!room.chatMessages) room.chatMessages = [];
    room.chatMessages.push({
      id: `join-${Date.now()}`,
      senderId: 'SYSTEM',
      sender: 'System',
      senderRoll: 'STAGE',
      text: `🔔 System: ${user.fullName} joined the room`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);
  }

  saveDatabase(db);
  res.json({
    ...buildRoomDetailPayload(room, user.userId),
    user,
    message: `✅ आप "${room.title}" (${room.roomAddress}) में जुड़ गए!`,
  });
});

// 6.4 Leave Room Audience
app.post('/api/game/voice-rooms/:roomId/leave', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId);
  if (!room) return res.json({ success: true });
  if (Array.isArray(room.audience) && userId && userId !== room.hostUserId) {
    room.audience = room.audience.filter(id => id !== userId);
  }
  room.seats = (room.seats || []).map(s =>
    s.userId === userId
      ? ({ seatNumber: s.seatNumber, seatNumberLabel: String(s.seatNumber), isMuted: false, isSpeaking: false, charms: 0 } as any)
      : s
  );
  saveDatabase(db);
  res.json({ success: true });
});

// 6.5 Follow / Unfollow Room
app.post('/api/game/voice-rooms/:roomId/follow', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase());
  const user = db.users.find(
    u =>
      (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
      (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );
  if (!room || !user) {
    return res.status(404).json({ success: false, message: 'Room or user not found' });
  }
  if (!Array.isArray(room.followers)) room.followers = [];
  if (!Array.isArray(user.followedRooms)) user.followedRooms = [];

  const currentlyFollowing = room.followers.includes(user.userId);
  if (currentlyFollowing) {
    room.followers = room.followers.filter(id => id !== user.userId);
    user.followedRooms = user.followedRooms.filter(id => id !== room.id);
  } else {
    room.followers.push(user.userId);
    if (!user.followedRooms.includes(room.id)) {
      user.followedRooms.push(room.id);
    }
    if (!room.chatMessages) room.chatMessages = [];
    room.chatMessages.push({
      id: `follow-${Date.now()}`,
      senderId: 'SYSTEM',
      sender: 'System',
      senderRoll: 'STAGE',
      text: `🔔 System: ${user.fullName} followed this room!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);
  }

  saveDatabase(db);
  res.json({
    success: true,
    isFollowed: !currentlyFollowing,
    followersCount: room.followers.length,
    room: buildRoomSummary(room, user.userId),
    user,
    message: !currentlyFollowing ? `⭐ आपने "${room.title}" को फॉलो किया!` : `रूम अनफॉलो किया गया।`,
  });
});

// 6.6 Update Personal/Owned Room Design (Name, Topic, Wallpaper Preset or Custom Upload, Stage Layout, YouTube URL, Privacy)
app.post('/api/game/voice-rooms/:roomId/update-design', (req, res) => {
  const { roomId } = req.params;
  const {
    userId,
    title,
    topic,
    category,
    wallpaperId,
    customWallpaperUrl,
    stageLayout,
    youtubeVideoUrl,
    youtubeVideoTitle,
    isPrivate,
    passcode,
  } = req.body || {};

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase());
  if (!room) {
    return res.status(404).json({ success: false, message: 'Voice room not found' });
  }
  const requester = db.users.find(u => u.userId === userId || u.id === userId);
  if (!requester || (room.hostUserId !== requester.userId && requester.role !== 'admin')) {
    return res.status(403).json({ success: false, message: 'केवल रूम के मालिक (Owner) ही रूम डिजाइन बदल सकते हैं।' });
  }

  let themeChanged = false;
  if (typeof title === 'string' && title.trim()) {
    room.title = title.trim().slice(0, 80);
  }
  if (typeof topic === 'string') {
    room.topic = topic.trim().slice(0, 140) || 'Community Discussion';
  }
  if (typeof category === 'string' && ['earning', 'gaming', 'chitchat', 'clan', 'help'].includes(category)) {
    room.category = category as any;
  }
  if (typeof wallpaperId === 'string' && wallpaperId.trim()) {
    if (room.wallpaperId !== wallpaperId) themeChanged = true;
    room.wallpaperId = wallpaperId.trim();
    if (wallpaperId !== 'custom_upload' && customWallpaperUrl === undefined) {
      room.customWallpaperUrl = '';
    }
  }
  if (typeof customWallpaperUrl === 'string') {
    if (customWallpaperUrl && customWallpaperUrl !== room.customWallpaperUrl) themeChanged = true;
    room.customWallpaperUrl = customWallpaperUrl;
    if (customWallpaperUrl) {
      room.wallpaperId = 'custom_upload';
    }
  }
  if (typeof stageLayout === 'string' && ['classic_8', 'heart_stage', 'event_hall', 'watch_party'].includes(stageLayout)) {
    if (room.stageLayout !== stageLayout) themeChanged = true;
    room.stageLayout = stageLayout as any;
  }
  if (typeof youtubeVideoUrl === 'string') {
    room.youtubeVideoUrl = youtubeVideoUrl.trim();
  }
  if (typeof youtubeVideoTitle === 'string') {
    room.youtubeVideoTitle = youtubeVideoTitle.trim();
  }
  if (typeof isPrivate === 'boolean') {
    room.isPrivate = isPrivate;
  }
  if (typeof passcode === 'string') {
    room.passcode = passcode.trim().slice(0, 12);
  }

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `design-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'System',
    senderRoll: 'STAGE',
    text: themeChanged
      ? '🔔 System: Owner changed the theme'
      : `🔔 System: Owner updated room settings (${room.title})`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);

  saveDatabase(db);
  res.json({
    ...buildRoomDetailPayload(room, requester.userId),
    message: '🎨 आपका पर्सनल वॉइस रूम डिज़ाइन व वॉलपेपर सेव हो गया!',
  });
});

// 6.7 Send Room Invite Notification to Real Friends / Players
app.post('/api/game/voice-rooms/:roomId/invite', (req, res) => {
  const { roomId } = req.params;
  const { senderUserId, targetUserIds } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase());
  const sender = db.users.find(u => u.userId === senderUserId || u.id === senderUserId);
  if (!room || !sender) {
    return res.status(404).json({ success: false, message: 'Room or sender not found' });
  }

  const targets = Array.isArray(targetUserIds) ? targetUserIds : [];
  let sentCount = 0;
  for (const tid of targets) {
    const targetUser = db.users.find(
      u => u.userId === tid || u.id === tid || (normalizeUsername(tid) && normalizeUsername(u.username) === normalizeUsername(tid))
    );
    if (targetUser && targetUser.userId !== sender.userId) {
      db.notifications.unshift({
        id: `notif-rm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: targetUser.userId,
        title: `🎙️ Voice Room Invite from ${sender.fullName}`,
        message: `${sender.fullName} invited you to "${room.title}" (Room ID: ${room.roomAddress}). Open Gaming Room -> Enter ID ${room.roomAddress}!`,
        type: 'system',
        read: false,
        date: new Date().toISOString().split('T')[0],
      });
      sentCount++;
    }
  }

  if (!room.chatMessages) room.chatMessages = [];
  if (sentCount > 0) {
    room.chatMessages.push({
      id: `inv-${Date.now()}`,
      senderId: 'SYSTEM',
      sender: 'System',
      senderRoll: 'STAGE',
      text: `🔔 System: ${sender.fullName} sent room invites to ${sentCount} friend(s)!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  saveDatabase(db);
  res.json({
    success: true,
    sentCount,
    roomAddress: room.roomAddress,
    message: sentCount > 0
      ? `✅ ${sentCount} दोस्तों को रूम इनवाइट (${room.roomAddress}) भेज दिया गया!`
      : `📋 रूम ID ${room.roomAddress} शेयर करने के लिए तैयार है!`,
  });
});

// 7. Take Mic Seat in Room (Checks lockedSeats!)
app.post(['/api/game/voice-rooms/:roomId/take-seat', '/api/game/voice-room/take-seat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId, seatIndex } = req.body;
  const idx = Number(seatIndex);
  if (idx < 0 || idx >= 8) {
    return res.status(400).json({ success: false, message: 'Invalid seat index' });
  }

  const user = db.users.find(u =>
    (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
    (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'माइक सीट लेने के लिए पहले लॉगिन करें।' });
  }

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()) || rooms[0];

  const lockedSet = new Set<number>(Array.isArray(room.lockedSeats) ? room.lockedSeats : []);
  if (lockedSet.has(idx) && room.hostUserId !== user.userId) {
    return res.status(403).json({
      success: false,
      message: `🔒 सीट #${idx + 1} रूम के मालिक द्वारा लॉक है।`,
    });
  }

  if (!room.seats || room.seats.length !== 8) {
    room.seats = Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }));
  }

  room.seats = room.seats.map(s => {
    if (s.userId && user.userId && s.userId.toLowerCase() === user.userId.toLowerCase()) {
      return {
        seatNumber: s.seatNumber,
        seatNumberLabel: String(s.seatNumber),
        isMuted: false,
        isSpeaking: false,
        charms: 0,
      } as any;
    }
    return s;
  });

  room.seats[idx] = {
    seatNumber: idx + 1,
    userId: user.userId,
    userName: user.fullName,
    gameLevel: user.gameLevel || 1,
    charms: user.charms || 0,
    isMuted: false,
    isSpeaking: true,
    userAvatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
  };

  if (!Array.isArray(room.audience)) room.audience = [];
  if (!room.audience.includes(user.userId)) room.audience.push(user.userId);

  incrementUserTaskProgress(user, 'voice_joined', 1);

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `seat-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'System',
    senderRoll: 'STAGE',
    text: `🎙️ ${user.fullName} (${user.userId}) took mic seat #${idx + 1}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  saveDatabase(db);
  res.json({
    success: true,
    seats: room.seats.map((s: any, sIdx: number) => ({ ...s, isLocked: lockedSet.has(sIdx) })),
    chatMessages: room.chatMessages,
    user,
  });
});

// 8. Leave Mic Seat in Room
app.post(['/api/game/voice-rooms/:roomId/leave-seat', '/api/game/voice-room/leave-seat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId } = req.body;
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()) || rooms[0];

  if (!room.seats) {
    return res.json({ success: true, seats: [] });
  }

  room.seats = room.seats.map(s => {
    if (s.userId && userId && s.userId.toLowerCase() === String(userId).toLowerCase()) {
      return {
        seatNumber: s.seatNumber,
        seatNumberLabel: String(s.seatNumber),
        isMuted: false,
        isSpeaking: false,
        charms: 0,
      } as any;
    }
    return s;
  });

  const lockedSet = new Set<number>(Array.isArray(room.lockedSeats) ? room.lockedSeats : []);
  saveDatabase(db);
  res.json({
    success: true,
    seats: room.seats.map((s: any, idx: number) => ({ ...s, isLocked: lockedSet.has(idx) })),
  });
});

// 9. Send Real Voice Room Chat Message
app.post(['/api/game/voice-rooms/:roomId/chat', '/api/game/voice-room/chat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId, text, isGift } = req.body;
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  }

  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()) || rooms[0];

  if (!room.chatMessages) room.chatMessages = [];
  const newMsg = {
    id: `vchat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    senderId: user.userId,
    sender: user.fullName,
    senderRoll: user.userId,
    senderAvatar: user.avatar,
    text: cleanText,
    isGift: Boolean(isGift),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  room.chatMessages.push(newMsg);
  if (room.chatMessages.length > 80) {
    room.chatMessages = room.chatMessages.slice(-80);
  }

  incrementUserTaskProgress(user, 'chat_sent', 1);

  saveDatabase(db);
  res.json({ success: true, message: newMsg, chatMessages: room.chatMessages });
});

// 9.1 Send Real Voice Audio Clip (Walkie-Talkie / Voice Stream Note)
app.post(['/api/game/voice-rooms/:roomId/voice-audio', '/api/game/voice-room/voice-audio'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId, audioDataUrl, durationSec, voiceEffect } = req.body;

  if (!audioDataUrl) {
    return res.status(400).json({ success: false, message: 'Audio data is required' });
  }

  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()) || rooms[0];

  const effectLabel = voiceEffect && voiceEffect.name
    ? `${voiceEffect.icon || '🎭'} [${voiceEffect.name} Effect - Voice Note (${durationSec || 3}s)]`
    : `🎙️ [लाइव आवाज़ / Voice Note (${durationSec || 3}s)]`;

  if (!room.chatMessages) room.chatMessages = [];
  const audioMsg = {
    id: `vaudio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    senderId: user.userId,
    sender: user.fullName,
    senderRoll: user.userId,
    senderAvatar: user.avatar,
    text: effectLabel,
    audioDataUrl,
    audioDuration: durationSec || 3,
    isVoiceNote: true,
    voiceEffect: voiceEffect || undefined,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  room.chatMessages.push(audioMsg);
  if (room.chatMessages.length > 80) {
    room.chatMessages = room.chatMessages.slice(-80);
  }

  incrementUserTaskProgress(user, 'chat_sent', 1);
  incrementUserTaskProgress(user, 'voice_joined', 1);

  saveDatabase(db);
  res.json({
    success: true,
    message: audioMsg,
    chatMessages: room.chatMessages,
  });
});

// 9.2 Host Action (Mute/Unmute seat, Kick, Lock/Unlock Seat, Update Topic, Set YouTube Video)
app.post('/api/game/voice-rooms/:roomId/host-action', (req, res) => {
  const { roomId } = req.params;
  const { hostUserId, action, seatIndex, newTopic, youtubeVideoUrl, youtubeVideoTitle } = req.body;

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase());
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  if (room.hostUserId !== hostUserId && hostUserId !== 'EMO-MOM-MMO') {
    return res.status(403).json({ success: false, message: 'Only room owner can perform this action' });
  }

  if (!Array.isArray(room.lockedSeats)) room.lockedSeats = [];

  if (action === 'update_topic' && newTopic) {
    room.topic = newTopic.trim();
  } else if (action === 'set_youtube') {
    room.youtubeVideoUrl = String(youtubeVideoUrl || '').trim();
    room.youtubeVideoTitle = String(youtubeVideoTitle || '').trim();
    room.stageLayout = 'watch_party';
  } else if (typeof seatIndex === 'number' && room.seats[seatIndex]) {
    if (action === 'mute') {
      room.seats[seatIndex].isMuted = true;
      room.seats[seatIndex].isSpeaking = false;
    } else if (action === 'unmute') {
      room.seats[seatIndex].isMuted = false;
    } else if (action === 'kick') {
      room.seats[seatIndex] = {
        seatNumber: seatIndex + 1,
        seatNumberLabel: String(seatIndex + 1),
        isMuted: false,
        isSpeaking: false,
        charms: 0,
      } as any;
    } else if (action === 'lock_seat') {
      if (!room.lockedSeats.includes(seatIndex)) {
        room.lockedSeats.push(seatIndex);
      }
      room.seats[seatIndex] = {
        seatNumber: seatIndex + 1,
        seatNumberLabel: String(seatIndex + 1),
        isMuted: false,
        isSpeaking: false,
        charms: 0,
      } as any;
    } else if (action === 'unlock_seat') {
      room.lockedSeats = room.lockedSeats.filter(i => i !== seatIndex);
    }
  }

  const lockedSet = new Set<number>(room.lockedSeats);
  saveDatabase(db);
  res.json({
    success: true,
    room: buildRoomSummary(room, hostUserId),
    seats: room.seats.map((s: any, idx: number) => ({ ...s, isLocked: lockedSet.has(idx) })),
  });
});

// 9.3 Real Members Stage Policy (Bots removed - only real verified members take voice seats)
app.get('/api/game/bots', (_req, res) => {
  res.json({
    success: true,
    bots: [],
    realMembersOnly: true,
  });
});

// 9.4-9.5 Bot seating disabled (Voice stage supports real registered members only)
app.post(['/api/game/voice-rooms/:roomId/invite-bot', '/api/game/voice-room/invite-bot', '/api/game/voice-rooms/:roomId/summon-all-bots', '/api/game/voice-room/summon-all-bots'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  res.status(400).json({
    success: false,
    message: 'ESP PLAY वॉइस रूम में केवल रियल रजिस्टर्ड मेंबर्स ही सीट ले सकते हैं। कृपया अपने दोस्तों को रूम एड्रेस से आमंत्रित करें!',
    seats: room.seats || [],
    chatMessages: room.chatMessages || [],
  });
});

// 9.6 Bot Interaction Trigger (Banter, Shayari, Rules Only - Zero Free Coins)
app.post(['/api/game/voice-rooms/:roomId/bot-interact', '/api/game/voice-room/bot-interact'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { botCode } = req.body;
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  let replyText = '';
  let botName = 'AI Bot';
  let botId = 'BOT-AI';
  let botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=BotESP';
  let botRoll = '🤖 BOT';

  if (botCode === 'judge') {
    botName = '⚖️ न्यायाधीश (Judge Bot)';
    botId = 'BOT-JUDGE';
    botRoll = '⚖️ JUSTICE';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99';
    const rulings = [
      '⚖️ नियम सूचना: सभी खिलाड़ियों के साथ निष्पक्ष नियम लागू होंगे। कोई भी फ्री/फेक कॉइन नहीं बांटा जाएगा।',
      '⚖️ फैसला: केवल असली टास्क पूरे करने और रियल गेम्स खेलने पर ही कॉइन्स व EXP मिलेंगे!',
      '⚖️ सम्मान बनाए रखें और स्वस्थ प्रतियोगिता में भाग लें!',
    ];
    replyText = rulings[Math.floor(Math.random() * rulings.length)];
  } else if (botCode === 'we_bhai') {
    botName = '🤝 We Bhai (वी भाई)';
    botId = 'BOT-BHAI';
    botRoll = '🤝 WE BHAI';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother';
    const advices = [
      '🤝 अरे भाई! रोज़ का टास्क सेक्शन पूरा करो — हर टास्क पूरा होने पर +5 असली कॉइन्स और EXP मिलते हैं!',
      '🤝 सीक्रेट टिप: VIP और बढ़िया फ्रेम अनलॉक करने के लिए टास्क व गेम से कॉइन्स कमाएं या UPI रिचार्ज करें!',
    ];
    replyText = advices[Math.floor(Math.random() * advices.length)];
  } else if (botCode === 'we_chat') {
    botName = '💬 We Chat (वी चैट AI)';
    botId = 'BOT-CHAT';
    botRoll = '💬 COMPANION';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet';
    const shayaris = [
      '💬 "तारों में अकेला चांद जगमगाता है, मुश्किलों में अकेला इंसान डगमगाता है... कांटों में ही अकेला गुलाब मुस्कुराता है!" 🌹',
      '💬 "हौसलों के तरकश में कोशिश का वो तीर जिंदा रखो, हार जाओ चाहे जिंदगी में सब कुछ मगर जीतने की उम्मीद जिंदा रखो!" 🎯',
    ];
    replyText = shayaris[Math.floor(Math.random() * shayaris.length)];
  } else {
    botName = '🐺 Werewolf Host (भेड़िया बॉट)';
    botId = 'BOT-WOLF';
    botRoll = '🐺 WEREWOLF';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf';
    const wolfQuotes = [
      '🐺 ध्यान दें गांव वालो! रात ढल चुकी है... भेड़िया गेम में सोच-समझकर वोट करें!',
      '🐺 गांव की पंचायत बुलाई जाती है! सभी खिलाड़ी मिलकर तय करें कि असली भेड़िया कौन है!',
    ];
    replyText = wolfQuotes[Math.floor(Math.random() * wolfQuotes.length)];
  }

  if (!room.chatMessages) room.chatMessages = [];
  const msgObj = {
    id: `bot-msg-${Date.now()}`,
    senderId: botId,
    sender: botName,
    senderRoll: botRoll,
    senderAvatar: botAvatar,
    text: replyText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  room.chatMessages.push(msgObj);
  if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);

  saveDatabase(db);
  res.json({
    success: true,
    message: msgObj,
    coinsAwarded: 0,
    chatMessages: room.chatMessages,
  });
});

// 10. Real Community Players List, Leaderboard & Clans
app.get('/api/community/real-players', (_req, res) => {
  const realPlayers = db.users.map(u => ({
    userId: u.userId,
    gamingId: u.gamingId || `GAME-${u.userId}`,
    username: u.username || '',
    fullName: u.fullName,
    phone: maskString(u.phone, 'phone'),
    chosenServiceName: u.chosenServiceName || u.chosenServiceCode,
    chosenServiceCode: u.chosenServiceCode,
    joiningDate: u.joiningDate,
    status: u.status,
    coins: u.coins || 0,
    charms: u.charms || 0,
    gameLevel: u.gameLevel || 1,
    gameXp: u.gameXp || 0,
    vipTier: u.vipTier || 'none',
    vipTitle: u.vipTitle || '',
    frameType: u.frameType || 'standard',
    roomAddress: ensureUserRoomAddress(db, u),
    houseName: u.houseName || `${u.fullName} Gaming House`,
    clanName: u.clanName || 'Royal Warriors ESP',
    clanRole: u.clanRole || 'Member',
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
    coverPhoto: u.coverPhoto || '',
    bio: u.bio || '',
    gender: u.gender || 'male',
    location: u.location || 'India',
    friendsCount: (u.friendsList || []).length,
    isOnline: Boolean(u.isOnline),
    role: u.role,
  }));

  res.json({ success: true, players: realPlayers });
});

app.get('/api/community/leaderboard', (req, res) => {
  const rawPeriod = String(req.query.period || 'daily').toLowerCase();
  const period: 'daily' | 'weekly' | 'monthly' | 'all' =
    rawPeriod === 'weekly' || rawPeriod === 'monthly' || rawPeriod === 'all' ? rawPeriod : 'daily';

  const nowMs = Date.now();
  const todayIst = getLiveIstTimeMeta(nowMs).istDate;
  const windowDays = period === 'daily' ? 1 : period === 'weekly' ? 7 : period === 'monthly' ? 30 : 36500;
  const cutoffMs = nowMs - windowDays * 24 * 60 * 60 * 1000;

  // Build real recent activity maps per user from gamePlayHistory, giftHistory, and coinTransactions
  const activityCoinsMap = new Map<string, number>();
  const activityGamesMap = new Map<string, number>();
  const activityCharmsMap = new Map<string, number>();

  for (const g of db.gamePlayHistory || []) {
    const tMs = new Date(g.playedAt).getTime();
    const inPeriod =
      period === 'daily'
        ? (Number.isFinite(tMs) && getIstDateString(tMs) === todayIst)
        : period === 'all' || (Number.isFinite(tMs) && tMs >= cutoffMs);
    if (!inPeriod) continue;
    activityCoinsMap.set(g.userId, (activityCoinsMap.get(g.userId) || 0) + Math.max(0, Number(g.wonCoins) || 0));
    activityGamesMap.set(g.userId, (activityGamesMap.get(g.userId) || 0) + 1);
  }

  for (const gh of db.giftHistory || []) {
    const tMs = new Date(gh.createdAt).getTime();
    const inPeriod =
      period === 'daily'
        ? (Number.isFinite(tMs) && getIstDateString(tMs) === todayIst)
        : period === 'all' || (Number.isFinite(tMs) && tMs >= cutoffMs);
    if (!inPeriod) continue;
    if (gh.recipientId) {
      activityCharmsMap.set(
        gh.recipientId,
        (activityCharmsMap.get(gh.recipientId) || 0) + Math.max(0, Number(gh.charmValue) || 0)
      );
    }
    if (gh.senderId) {
      activityCoinsMap.set(
        gh.senderId,
        (activityCoinsMap.get(gh.senderId) || 0) + Math.round((Number(gh.coinCost) || 0) * 0.5)
      );
    }
  }

  const vipWeight = (tier?: string) =>
    tier === 'diamond' ? 200 : tier === 'gold' ? 120 : tier === 'silver' ? 60 : 0;

  const enriched = [...db.users].map(u => {
    const recentWon = activityCoinsMap.get(u.userId) || 0;
    const recentGames = activityGamesMap.get(u.userId) || 0;
    const recentCharms = activityCharmsMap.get(u.userId) || 0;
    const baseCoins = u.coins || 0;
    const baseCharms = u.charms || 0;
    const baseXp = u.gameXp || (u.gameLevel || 1) * 150;

    // Combine real period activity with verified profile stats so daily/weekly/monthly reflect genuine differences cleanly
    const periodScore =
      period === 'daily'
        ? recentWon * 4 + recentCharms * 3 + recentGames * 40 + Math.round(baseCoins * 0.25 + baseCharms * 0.5 + baseXp * 0.2) + vipWeight(u.vipTier)
        : period === 'weekly'
        ? recentWon * 2 + recentCharms * 2 + Math.round(baseCoins * 0.55 + baseCharms * 0.8 + baseXp * 0.45) + vipWeight(u.vipTier) * 2
        : period === 'monthly'
        ? recentWon + recentCharms + Math.round(baseCoins * 0.85 + baseCharms + baseXp * 0.75) + vipWeight(u.vipTier) * 3
        : baseCoins + baseCharms * 2 + baseXp;

    return {
      userId: u.userId,
      username: u.username || '',
      fullName: u.fullName,
      avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
      gameLevel: u.gameLevel || 1,
      gameXp: u.gameXp || 0,
      charms: u.charms || 0,
      coins: u.coins || 0,
      vipTier: u.vipTier || 'none',
      vipTitle: u.vipTitle || '',
      frameType: u.frameType || 'standard',
      roomAddress: ensureUserRoomAddress(db, u),
      isVipRoom: Boolean(u.isVipRoom || isVipFancyRoomNumber(u.roomAddress)),
      clanName: u.clanName || 'Royal Warriors ESP',
      chosenServiceCode: u.chosenServiceCode || 'GAME',
      isOnline: Boolean(u.isOnline),
      tasksCompletedCount: u.tasksCompletedCount || 0,
      periodScore,
      periodCoins: recentWon > 0 ? recentWon : baseCoins,
      periodGames: recentGames,
      periodCharms: recentCharms > 0 ? recentCharms : baseCharms,
    };
  });

  enriched.sort(
    (a, b) =>
      b.periodScore - a.periodScore ||
      b.coins - a.coins ||
      b.gameLevel - a.gameLevel ||
      b.charms - a.charms
  );

  const leaderboard = enriched.slice(0, 50).map((item, idx) => ({
    rank: idx + 1,
    ...item,
  }));

  res.json({ success: true, period, leaderboard, topEarners: leaderboard });
});

// Track genuine ?ref= referral link clicks for Conversion Rate Analytics
app.post('/api/referrals/track-click', (req, res) => {
  const { sponsorIdentifier } = req.body || {};
  const raw = String(sponsorIdentifier || '').trim().replace(/^@+/, '');
  if (!raw) {
    return res.status(400).json({ success: false, message: 'Missing sponsor identifier' });
  }
  const cleanHandle = normalizeUsername(raw);
  const sponsor = db.users.find(
    u =>
      u.userId.toLowerCase() === raw.toLowerCase() ||
      (cleanHandle && normalizeUsername(u.username) === cleanHandle)
  );
  if (!sponsor) {
    return res.status(404).json({ success: false, message: 'Sponsor not found' });
  }

  const today = getTodayDateString();
  sponsor.referralClicks = Number(sponsor.referralClicks || 0) + 1;
  if (!Array.isArray(sponsor.referralClickHistory)) {
    sponsor.referralClickHistory = [];
  }
  const existingDay = sponsor.referralClickHistory.find(h => h.date === today);
  if (existingDay) {
    existingDay.count = Number(existingDay.count || 0) + 1;
  } else {
    sponsor.referralClickHistory.push({ date: today, count: 1 });
    if (sponsor.referralClickHistory.length > 90) {
      sponsor.referralClickHistory = sponsor.referralClickHistory.slice(-90);
    }
  }
  saveDatabase(db);
  res.json({
    success: true,
    sponsorUserId: sponsor.userId,
    referralClicks: sponsor.referralClicks,
  });
});

// Top 5 Referrers Leaderboard based on real referral conversions & conversion rates
app.get('/api/community/top-referrers', (req, res) => {
  const currentUserId = String(req.query.userId || '').trim().toLowerCase();

  const statsMap = new Map<
    string,
    { total: number; converted: number; pending: number; creditedEarnings: number }
  >();

  for (const r of db.referrals || []) {
    const key = String(r.sponsorUserId || '').toLowerCase();
    if (!key) continue;
    const prev = statsMap.get(key) || {
      total: 0,
      converted: 0,
      pending: 0,
      creditedEarnings: 0,
    };
    prev.total += 1;
    if (r.status === 'credited') {
      prev.converted += 1;
      prev.creditedEarnings += Number(r.commissionAmount || 0);
    } else if (r.status === 'pending') {
      prev.pending += 1;
    }
    statsMap.set(key, prev);
  }

  const rankedAll = db.users
    .map(u => {
      const st = statsMap.get(u.userId.toLowerCase()) || {
        total: 0,
        converted: 0,
        pending: 0,
        creditedEarnings: 0,
      };
      const rawClicks = Number(u.referralClicks || 0);
      const effectiveClicks = Math.max(rawClicks, st.total);
      const conversionRate =
        effectiveClicks > 0
          ? Math.min(100, Number(((st.converted / effectiveClicks) * 100).toFixed(1)))
          : 0;
      const referralEarnings = Math.max(Number(u.referralEarnings || 0), st.creditedEarnings);
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
        referralEarnings,
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
    .map((entry, idx) => ({
      rank: idx + 1,
      ...entry,
    }));

  const topReferrers = rankedAll.slice(0, 5);
  const currentUserEntry = currentUserId
    ? rankedAll.find(e => e.userId.toLowerCase() === currentUserId) || null
    : null;

  res.json({
    success: true,
    topReferrers,
    currentUserRank: currentUserEntry,
    totalRankedUsers: rankedAll.length,
  });
});

app.get('/api/community/clans', (_req, res) => {
  const clanMap = new Map<string, {
    clanName: string;
    membersCount: number;
    totalXp: number;
    totalCharms: number;
    leaderName: string;
    leaderId: string;
  }>();

  for (const u of db.users) {
    const clanName = (u.clanName || 'Royal Warriors ESP').trim();
    const existing = clanMap.get(clanName);
    if (!existing) {
      clanMap.set(clanName, {
        clanName,
        membersCount: 1,
        totalXp: u.gameXp || 0,
        totalCharms: u.charms || 0,
        leaderName: u.fullName,
        leaderId: u.userId,
      });
    } else {
      existing.membersCount += 1;
      existing.totalXp += (u.gameXp || 0);
      existing.totalCharms += (u.charms || 0);
      if (u.clanRole === 'Leader') {
        existing.leaderName = u.fullName;
        existing.leaderId = u.userId;
      }
    }
  }

  const clans = Array.from(clanMap.values()).sort(
    (a, b) => b.totalXp - a.totalXp || b.membersCount - a.membersCount
  );

  res.json({ success: true, clans });
});

// 11. Unique Username Check, Real User Search, Friend Toggle & Rich WePlay Player Profile
app.get('/api/users/check-username', (req, res) => {
  const raw = String(req.query.username || '');
  const currentUserId = String(req.query.currentUserId || '').trim();
  const normalized = normalizeUsername(raw);
  if (!normalized) {
    return res.json({
      success: true,
      valid: false,
      available: false,
      normalized: '',
      message: 'कृपया यूजरनेम दर्ज करें (कम से कम 3 अक्षर)',
    });
  }
  if (!isValidUsernameFormat(normalized)) {
    return res.json({
      success: true,
      valid: false,
      available: false,
      normalized,
      message: 'कोई Symbol (_ - . @) उपयोग न करें — केवल 3-24 अक्षर (a-z और 0-9) लिखें',
    });
  }
  const taken = isUsernameTaken(db.users, normalized, currentUserId);
  return res.json({
    success: true,
    valid: true,
    available: !taken,
    normalized,
    message: taken
      ? `@${normalized} पहले से किसी दूसरे यूजर ने लिया है!`
      : `✓ @${normalized} उपलब्ध है!`,
  });
});

app.get('/api/users/search', (req, res) => {
  const rawQ = String(req.query.q || '').trim();
  const cleanHandle = normalizeUsername(rawQ);
  const qLower = rawQ.toLowerCase();
  const currentUserId = String(req.query.currentUserId || '').trim();
  const viewer = currentUserId ? db.users.find(u => u.userId === currentUserId || u.id === currentUserId) : undefined;
  const viewerFriends = new Set(viewer?.friendsList || []);

  const matches = db.users
    .filter(u => {
      if (!qLower) return true;
      const uname = normalizeUsername(u.username);
      const fname = (u.fullName || '').toLowerCase();
      const uid = (u.userId || '').toLowerCase();
      const gid = (u.gamingId || '').toLowerCase();
      return (
        (cleanHandle && uname.includes(cleanHandle)) ||
        fname.includes(qLower) ||
        uid.includes(qLower) ||
        gid.includes(qLower)
      );
    })
    .sort((a, b) => {
      const aU = normalizeUsername(a.username);
      const bU = normalizeUsername(b.username);
      const aExact = cleanHandle && aU === cleanHandle ? 1 : 0;
      const bExact = cleanHandle && bU === cleanHandle ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      return (b.gameXp || 0) - (a.gameXp || 0);
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
      roomAddress: ensureUserRoomAddress(db, u),
      isVipRoom: Boolean(u.isVipRoom || isVipFancyRoomNumber(u.roomAddress)),
      vipRoomLabel: u.vipRoomLabel || '',
      clanName: u.clanName || 'Royal Warriors ESP',
      friendsCount: (u.friendsList || []).length,
      isFriend: viewerFriends.has(u.userId),
      isOnline: Boolean(u.isOnline),
    }));

  res.json({ success: true, users: matches });
});

app.post('/api/friends/toggle', (req, res) => {
  const { userId, targetUserId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const target = db.users.find(
    u =>
      u.userId === targetUserId ||
      u.id === targetUserId ||
      (normalizeUsername(targetUserId) && normalizeUsername(u.username) === normalizeUsername(targetUserId))
  );
  if (!user || !target) {
    return res.status(404).json({ success: false, message: 'User or target player not found' });
  }
  if (user.userId === target.userId) {
    return res.status(400).json({ success: false, message: 'आप खुद को फ्रेंड लिस्ट में नहीं जोड़ सकते।' });
  }

  if (!Array.isArray(user.friendsList)) user.friendsList = [];
  if (!Array.isArray(target.friendsList)) target.friendsList = [];

  const alreadyFriend = user.friendsList.includes(target.userId);
  if (alreadyFriend) {
    user.friendsList = user.friendsList.filter(id => id !== target.userId);
    target.friendsList = target.friendsList.filter(id => id !== user.userId);
  } else {
    user.friendsList.push(target.userId);
    if (!target.friendsList.includes(user.userId)) {
      target.friendsList.push(user.userId);
    }
    incrementUserTaskProgress(user, 'profile_completed', 1);
  }

  user.friendsCount = user.friendsList.length;
  target.friendsCount = target.friendsList.length;
  saveDatabase(db);

  res.json({
    success: true,
    isFriend: !alreadyFriend,
    message: !alreadyFriend
      ? `✅ ${target.fullName} (${target.username ? `@${target.username}` : target.userId}) को फ्रेंड लिस्ट में जोड़ा गया!`
      : `${target.fullName} को फ्रेंड लिस्ट से हटाया गया।`,
    user,
    targetFriendsCount: target.friendsCount,
  });
});

app.get('/api/community/player-profile/:userId', (req, res) => {
  const { userId } = req.params;
  const cleanHandle = normalizeUsername(userId);
  const viewerId = String(req.query.viewerId || '').trim();
  const u = db.users.find(
    user =>
      user.userId === userId ||
      user.id === userId ||
      (cleanHandle && normalizeUsername(user.username) === cleanHandle)
  );
  if (!u) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }

  const viewer = viewerId ? db.users.find(v => v.userId === viewerId || v.id === viewerId) : undefined;
  const isFriend = Boolean(viewer && Array.isArray(viewer.friendsList) && viewer.friendsList.includes(u.userId));

  const userMoments = (db.moments || [])
    .filter(m => {
      const mUid = (m.userId || '').toLowerCase();
      const mRoll = (m.userRollNumber || '').toLowerCase();
      const targetUid = u.userId.toLowerCase();
      const targetInternalId = (u.id || '').toLowerCase();
      return (
        (mUid && (mUid === targetUid || (targetInternalId && mUid === targetInternalId))) ||
        (mRoll && mRoll === targetUid)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const giftEntries = Object.values(u.receivedGifts || {});
  const totalGiftsLit = giftEntries.reduce((sum, g) => sum + (Number(g.count) || 0), 0);

  const profile = {
    userId: u.userId,
    gamingId: u.gamingId || `GAME-${u.userId}`,
    username: u.username || '',
    fullName: u.fullName,
    phone: maskString(u.phone, 'phone'),
    email: maskString(u.email, 'email'),
    chosenServiceName: u.chosenServiceName || u.chosenServiceCode,
    chosenServiceCode: u.chosenServiceCode,
    joiningFee: u.joiningFee,
    joiningDate: u.joiningDate,
    status: u.status,
    coins: u.coins || 0,
    charms: u.charms || 0,
    gameLevel: u.gameLevel || 1,
    gameXp: u.gameXp || 0,
    vipTier: u.vipTier || 'none',
    vipTitle: u.vipTitle || '',
    frameType: u.frameType || 'standard',
    unlockedFrames: u.unlockedFrames || ['standard'],
    totalEarnings: u.totalEarnings || 0,
    balance: u.balance || 0,
    roomAddress: ensureUserRoomAddress(db, u),
    isVipRoom: Boolean(u.isVipRoom || isVipFancyRoomNumber(u.roomAddress)),
    vipRoomLabel: u.vipRoomLabel || '',
    houseName: u.houseName || `${u.fullName} Gaming House`,
    clanName: u.clanName || 'Royal Warriors ESP',
    clanRole: u.clanRole || 'Member',
    sponsorId: u.sponsorId,
    sponsorName: u.sponsorName,
    loginStreak: u.loginStreak || 0,
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
    coverPhoto: u.coverPhoto || '',
    bio: u.bio || '',
    gender: u.gender || 'male',
    location: u.location || 'India',
    accountType: u.accountType || 'business',
    payoutUpiId: u.payoutUpiId || u.paymentAddress || '',
    friendsCount: (u.friendsList || []).length,
    friendsList: u.friendsList || [],
    isFriend,
    moments: userMoments,
    momentsCount: userMoments.length,
    giftWall: giftEntries,
    totalGiftsLit,
    verifiedAt: u.verifiedAt,
    role: u.role,
    isOnline: Boolean(u.isOnline),
    activeRelationships: (u.activeRelationships || []).filter(b => b.status === 'accepted'),
    ownedRelationshipTokens: u.ownedRelationshipTokens || [],
    familyId: u.familyId || '',
    familyRole: u.familyRole || 'Member',
    familyCoinsContributed: u.familyCoinsContributed || 0,
    familySummary: u.familyId
      ? (() => {
          const f = (db.families || []).find(fm => fm.id === u.familyId);
          return f
            ? { id: f.id, name: f.name, emblem: f.emblem, familyCode: f.familyCode, level: f.level, familyCoins: f.familyCoins }
            : null;
        })()
      : null,
    unlockedRoomTiers: u.unlockedRoomTiers || ['normal'],
    giftHistoryCount: (db.giftHistory || []).filter(
      g => g.senderId === u.userId || g.recipientId === u.userId
    ).length,
  };

  res.json({ success: true, profile });
});

// ======================== ADMIN VIP NUMERIC ROOM ID SETUP SYSTEM ========================

app.post('/api/admin/vip-rooms/check', (req, res) => {
  const { adminPassword, roomNumber, excludeUserId } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const rooms = getOrCreateRooms(db);
  const raw = String(roomNumber || '').trim();
  if (!raw) {
    return res.json({
      success: true,
      valid: false,
      available: false,
      normalized: '',
      isFancyVip: false,
      message: 'कृपया 3 से 10 अंकों का Room नंबर दर्ज करें (जैसे 1111, 2222, 1234)',
    });
  }
  if (!/^\d{3,10}$/.test(raw)) {
    return res.json({
      success: true,
      valid: false,
      available: false,
      normalized: raw.replace(/\D/g, ''),
      isFancyVip: false,
      message: 'केवल संख्यात्मक अंक (0-9, न्यूनतम 3 व अधिकतम 10 अंक) दर्ज करें — कोई अक्षर या Symbol नहीं!',
    });
  }
  const conflict = findRoomConflictOwner(raw, db.users, rooms, excludeUserId);
  const isFancy = isVipFancyRoomNumber(raw);
  return res.json({
    success: true,
    valid: true,
    available: !conflict.conflict,
    normalized: raw,
    isFancyVip: isFancy,
    conflictOwner: conflict.conflict ? `${conflict.ownerName || 'User'} (${conflict.ownerId || ''})` : null,
    message: conflict.conflict
      ? `❌ Room ID ${raw} पहले से ${conflict.ownerName || conflict.ownerId} को अलॉट है!`
      : `✓ Room ID ${raw} खाली है${isFancy ? ' (👑 VIP Fancy Number)' : ''}!`,
  });
});

app.post('/api/admin/vip-rooms/assign', (req, res) => {
  const { adminPassword, targetUserId, roomNumber, isVipRoom = true, vipRoomLabel = '' } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const user = db.users.find(
    u =>
      u.userId.toLowerCase() === String(targetUserId || '').toLowerCase() ||
      u.id === targetUserId
  );
  if (!user) {
    return res.status(404).json({ success: false, message: 'चयनित यूजर नहीं मिला।' });
  }
  const cleanNumber = String(roomNumber || '').trim();
  if (!/^\d{3,10}$/.test(cleanNumber)) {
    return res.status(400).json({
      success: false,
      message: 'अमान्य Room नंबर! केवल 3 से 10 अंकों की संख्या दर्ज करें (जैसे 1111, 2222, 1234)।',
    });
  }

  // Personal Room ID is permanently immutable once assigned — reject altering the numeric Room ID
  const existingRoomId = String(user.roomAddress || user.personalRoomId || '').trim();
  if (isNumericRoomId(existingRoomId) && cleanNumber !== existingRoomId) {
    return res.status(403).json({
      success: false,
      code: 'IMMUTABLE_IDENTITY_LOCKED',
      message: `⚠️ ${user.fullName} की Personal Room ID (#${existingRoomId}) स्थायी रूप से लॉक है और इसे बदला या डुप्लिकेट नहीं किया जा सकता। आप केवल इसी रूम पर VIP Badge लेबल अपडेट कर सकते हैं।`,
    });
  }

  const rooms = getOrCreateRooms(db);
  const conflict = findRoomConflictOwner(cleanNumber, db.users, rooms, user.userId);
  if (conflict.conflict) {
    return res.status(409).json({
      success: false,
      message: `Room ID ${cleanNumber} पहले से ${conflict.ownerName || conflict.ownerId} के पास है। कोई अन्य नंबर चुनें!`,
    });
  }

  const prevRoomId = existingRoomId;
  const vipFlag = Boolean(isVipRoom || isVipFancyRoomNumber(cleanNumber));
  const cleanLabel = String(vipRoomLabel || (vipFlag ? 'VIP Room' : '')).trim();

  user.roomAddress = cleanNumber;
  user.personalRoomId = cleanNumber;
  user.isVipRoom = vipFlag;
  user.vipRoomLabel = cleanLabel;
  user.vipRoomAssignedAt = new Date().toISOString();
  user.vipRoomAssignedBy = 'Admin';

  const personalRoom = ensurePersonalRoomForUser(db, user);
  personalRoom.roomAddress = cleanNumber;
  personalRoom.roomNumber = cleanNumber;
  personalRoom.isVipRoom = vipFlag;
  personalRoom.vipRoomLabel = cleanLabel;

  if (!Array.isArray(user.editHistory)) user.editHistory = [];
  user.editHistory.unshift({
    date: new Date().toISOString(),
    field: 'VIP Room Badge',
    oldValue: prevRoomId || '-',
    newValue: `${cleanNumber}${cleanLabel ? ` (${cleanLabel})` : ''}`,
  });

  saveDatabase(db);
  return res.json({
    success: true,
    message: `✅ ${user.fullName} के लॉक Room ID "#${cleanNumber}" पर VIP Badge अपडेट हो गया!`,
    user,
    room: buildRoomSummary(personalRoom, user.userId),
  });
});

app.post('/api/admin/vip-rooms/reset', (req, res) => {
  const { adminPassword } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  return res.status(403).json({
    success: false,
    code: 'IMMUTABLE_IDENTITY_LOCKED',
    message: 'Personal Room ID स्थायी रूप से लॉक है! किसी भी यूजर की Room ID बदली या रीसेट नहीं की जा सकती।',
  });
});

// ======================== ROCK-SOLID COMPLAINTS & SUPPORT SYSTEM ========================

app.post('/api/complaints', (req, res) => {
  const { userId, category, subject, description, proofScreenshot } = req.body;
  if (!userId || !subject || !description) {
    return res.status(400).json({ success: false, message: 'UserId, subject, and description are required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  const complaintId = `CMP-${Date.now().toString().slice(-6)}`;

  const categoryLabels: Record<string, string> = {
    payment_upi: 'UPI / पेमेंट निकासी संबंधी',
    game_coins: 'गेम्स व कॉइन्स विवाद',
    account: 'अकाउंट व रोल नंबर समस्या',
    sponsor_team: 'स्पॉन्सर व टीम अर्निंग',
    technical: 'तकनीकी बग या एरर',
    other: 'अन्य सहायता',
  };

  const newComplaint: UserComplaint = {
    id: complaintId,
    userId: user ? user.userId : userId,
    userName: user ? user.fullName : (req.body.userName || 'Member'),
    userPhone: user ? user.phone : (req.body.userPhone || ''),
    userRoll: user ? user.userId : userId,
    category: category || 'other',
    categoryLabel: categoryLabels[category] || 'अन्य सहायता',
    subject: String(subject).slice(0, 150),
    description: String(description).slice(0, 2000),
    proofScreenshot: proofScreenshot || undefined,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!Array.isArray(db.complaints)) db.complaints = [];
  db.complaints.unshift(newComplaint);

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.push({
    id: `notif-${Date.now()}`,
    userId: newComplaint.userId,
    title: `शिकायत #${complaintId} दर्ज हुई`,
    message: `आपकी शिकायत '${newComplaint.subject}' दर्ज कर ली गई है। 24 घंटे में एडमिन समाधान प्रदान करेगा।`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({ success: true, message: 'शिकायत सफलतापूर्वक दर्ज कर ली गई है!', complaint: newComplaint });
});

app.get('/api/complaints/user/:userId', (req, res) => {
  const { userId } = req.params;
  const list = (db.complaints || []).filter(c =>
    c.userId.toLowerCase() === userId.toLowerCase() ||
    (c.userRoll && c.userRoll.toLowerCase() === userId.toLowerCase())
  );
  res.json({ success: true, complaints: list });
});

app.get('/api/admin/complaints', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const statusFilter = req.query.status as string;
  let list = db.complaints || [];
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter(c => c.status === statusFilter);
  }
  res.json({ success: true, complaints: list });
});

app.post('/api/admin/complaints/:id/respond', (req, res) => {
  const { id } = req.params;
  const { adminPassword, response, status, refundCoins } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const complaint = (db.complaints || []).find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.adminResponse = response || 'आपकी शिकायत का समाधान कर दिया गया है।';
  complaint.status = status || 'resolved';
  complaint.resolvedAt = new Date().toISOString();
  complaint.updatedAt = new Date().toISOString();
  complaint.adminResolvedBy = 'Santosh Kumar (Admin)';

  const refundAmt = Number(refundCoins);
  if (!isNaN(refundAmt) && refundAmt > 0) {
    const user = db.users.find(u => u.userId.toLowerCase() === complaint.userId.toLowerCase());
    if (user) {
      const balanceBefore = user.coins || 0;
      user.coins = balanceBefore + refundAmt;
      logCoinTransaction(db, user, {
        type: 'credit',
        category: 'admin_adjustment',
        categoryLabel: 'शिकायत समाधान रिफंड',
        amount: refundAmt,
        balanceBefore,
        balanceAfter: user.coins,
        description: `शिकायत #${complaint.id} समाधान: +${refundAmt} कॉइन्स रिफंड क्रेडिट`,
      });
    }
  }

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.push({
    id: `notif-${Date.now()}`,
    userId: complaint.userId,
    title: `शिकायत #${complaint.id} पर एडमिन समाधान`,
    message: complaint.adminResponse || 'आपकी शिकायत का समाधान कर दिया गया है।',
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({ success: true, message: 'शिकायत का समाधान सफलतापूर्वक अपडेट किया गया!', complaint });
});

// ======================== GAME PLAY HISTORY & COIN LEDGER ========================

// Record Game Play Stats (Never mints free coins; logs completed gameplay & tracks real game_played task)
app.post('/api/game/record-play', (req, res) => {
  const { userId, gameId, gameName, betCoins, durationSeconds, details } = req.body;
  if (!userId || !gameName) {
    return res.status(400).json({ success: false, message: 'UserId and gameName are required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = getTodayDateString();
  if (!Array.isArray(user.daysPlayed)) user.daysPlayed = [];
  if (!user.daysPlayed.includes(today)) {
    user.daysPlayed.push(today);
  }
  user.totalDaysPlayed = user.daysPlayed.length;
  user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
  incrementUserTaskProgress(user, 'game_played', 1);

  if (!Array.isArray(db.gamePlayHistory)) db.gamePlayHistory = [];
  const playRecord: GamePlayRecord = {
    id: `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    gameId: gameId || 'game',
    gameName,
    betCoins: Math.max(0, Number(betCoins) || 0),
    wonCoins: 0,
    netChange: 0,
    result: 'draw',
    durationSeconds: Number(durationSeconds) || 45,
    playedAt: new Date().toISOString(),
    details: details || undefined,
  };
  db.gamePlayHistory.unshift(playRecord);
  if (db.gamePlayHistory.length > 5000) db.gamePlayHistory = db.gamePlayHistory.slice(0, 5000);

  saveDatabase(db);
  res.json({ success: true, user, record: playRecord });
});

app.get('/api/game/history/:userId', (req, res) => {
  const { userId } = req.params;
  const list = (db.gamePlayHistory || [])
    .filter(g => g.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, history: list });
});

app.get('/api/game/coin-history/:userId', (req, res) => {
  const { userId } = req.params;
  const list = (db.coinTransactions || [])
    .filter(c => c.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, transactions: list });
});

// ======================== PROFILE HISTORY & AUDIT TRAIL ========================

app.get('/api/user/:userId/profile-history', (req, res) => {
  const { userId } = req.params;
  const history = (db.profileHistory || [])
    .filter(p => p.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, history });
});

// ======================== ONLINE PRESENCE & SESSION HEARTBEAT ========================

app.post('/api/user/heartbeat', (req, res) => {
  const { userId, sessionId, deviceType, deviceName, browser, os } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const now = new Date();
  const nowIso = now.toISOString();

  if (!Array.isArray(db.activitySessions)) db.activitySessions = [];

  let session = db.activitySessions.find(s =>
    s.userId.toLowerCase() === user.userId.toLowerCase() &&
    s.status === 'online' &&
    (sessionId ? s.id === sessionId : true)
  );

  if (session) {
    const lastHbTime = new Date(session.lastHeartbeat).getTime();
    if (now.getTime() - lastHbTime > 5 * 60 * 1000) {
      session.status = 'offline';
      session.sessionEnd = new Date(lastHbTime).toISOString();
      session.durationMinutes = Math.max(1, Math.round((lastHbTime - new Date(session.sessionStart).getTime()) / 60000));
      session = undefined;
    } else {
      session.lastHeartbeat = nowIso;
      session.durationMinutes = Math.max(1, Math.round((now.getTime() - new Date(session.sessionStart).getTime()) / 60000));
    }
  }

  if (!session) {
    const newSessionId = sessionId || `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    session = {
      id: newSessionId,
      userId: user.userId,
      userName: user.fullName,
      sessionStart: nowIso,
      lastHeartbeat: nowIso,
      durationMinutes: 1,
      deviceType: deviceType || 'mobile',
      deviceName: deviceName || 'Mobile Device',
      browser: browser || 'Browser',
      os: os || 'Device OS',
      status: 'online',
    };
    db.activitySessions.unshift(session);
    user.lastSessionStart = nowIso;
  }

  user.isOnline = true;
  user.lastActiveTime = nowIso;
  user.totalOnlineMinutes = (user.totalOnlineMinutes || 0) + 1;

  if (db.activitySessions.length > 5000) {
    db.activitySessions = db.activitySessions.slice(0, 5000);
  }

  saveDatabase(db);
  res.json({
    success: true,
    sessionId: session.id,
    durationMinutes: session.durationMinutes,
    totalOnlineMinutes: user.totalOnlineMinutes,
    totalDaysPlayed: user.totalDaysPlayed || (user.daysPlayed?.length || 0),
  });
});

app.post('/api/user/session-end', (req, res) => {
  const { userId, sessionId } = req.body;
  if (!userId) return res.json({ success: true });

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  const nowIso = new Date().toISOString();

  if (Array.isArray(db.activitySessions)) {
    const session = db.activitySessions.find(s =>
      s.userId.toLowerCase() === String(userId).toLowerCase() &&
      s.status === 'online' &&
      (sessionId ? s.id === sessionId : true)
    );
    if (session) {
      session.status = 'offline';
      session.sessionEnd = nowIso;
      session.durationMinutes = Math.max(1, Math.round((new Date(nowIso).getTime() - new Date(session.sessionStart).getTime()) / 60000));
    }
  }

  if (user) {
    user.isOnline = false;
    user.lastActiveTime = nowIso;
  }

  saveDatabase(db);
  res.json({ success: true, message: 'Session closed' });
});

app.get('/api/user/:userId/session-history', (req, res) => {
  const { userId } = req.params;
  const sessions = (db.activitySessions || [])
    .filter(s => s.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, sessions });
});

app.get('/api/admin/users/activity-overview', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const onlineUsers = (db.users || []).filter(u => u.isOnline);
  const recentSessions = (db.activitySessions || []).slice(0, 150);

  res.json({
    success: true,
    totalUsers: db.users.length,
    onlineCount: onlineUsers.length,
    onlineUsers: onlineUsers.map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      totalDaysPlayed: u.totalDaysPlayed || (u.daysPlayed?.length || 0),
      totalGamesPlayed: u.totalGamesPlayed || 0,
      totalOnlineMinutes: u.totalOnlineMinutes || 0,
      coins: u.coins || 0,
      lastActiveTime: u.lastActiveTime,
    })),
    recentSessions,
  });
});

// Restricted Server-Side UI State Persistence (Only Voice Effect & Already-Unlocked Room Theme)
app.post('/api/user/:userId/server-state', (req, res) => {
  const { userId } = req.params;
  const { roomTheme, voiceEffect } = req.body;

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (roomTheme) {
    const owned = Array.isArray(user.unlockedRooms) ? user.unlockedRooms : ['default_dark'];
    if (roomTheme === 'default_dark' || owned.includes(roomTheme)) {
      user.roomTheme = roomTheme;
    }
  }
  if (voiceEffect) user.voiceEffect = voiceEffect;

  saveDatabase(db);
  res.json({ success: true, user });
});

// ======================== HOME PAGE 7-PHOTO POPUP SLIDER SYSTEM ========================

app.get('/api/home-slider-photos', (_req, res) => {
  const photos = (db.homeSliderPhotos || []).filter(p => p.active);
  res.json({ success: true, photos });
});

app.post('/api/admin/home-slider-photos', (req, res) => {
  const { adminPassword, photos } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(photos)) {
    return res.status(400).json({ success: false, message: 'Photos array is required' });
  }

  const sanitizedPhotos: HomeSliderPhoto[] = photos.slice(0, 7).map((p, idx) => ({
    id: p.id || `SLIDE-${Date.now()}-${idx}`,
    imageUrl: p.imageUrl,
    title: p.title || '',
    subtitle: p.subtitle || '',
    linkUrl: p.linkUrl || '',
    active: p.active !== false,
    order: idx + 1,
    createdAt: p.createdAt || new Date().toISOString(),
  }));

  db.homeSliderPhotos = sanitizedPhotos;
  if (!db.settings) db.settings = DEFAULT_SETTINGS;
  db.settings.homeSliderPhotos = sanitizedPhotos;
  saveDatabase(db);

  res.json({ success: true, message: '7-फोटो स्लाइडर सफलतापूर्वक अपडेट हो गया!', photos: sanitizedPhotos });
});

// ======================== CONTACT US & TELEGRAM INQUIRIES SYSTEM ========================

app.post('/api/contact/messages', (req, res) => {
  const { name, email, phone, telegramUsername, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'नाम, ईमेल और संदेश आवश्यक हैं' });
  }

  if (!Array.isArray(db.contactMessages)) db.contactMessages = [];

  const newMsg: ContactMessage = {
    id: `CNT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: String(name).slice(0, 100).trim(),
    email: String(email).slice(0, 100).trim().toLowerCase(),
    phone: phone ? String(phone).slice(0, 20).trim() : undefined,
    telegramUsername: telegramUsername ? String(telegramUsername).slice(0, 50).trim() : undefined,
    subject: subject ? String(subject).slice(0, 150).trim() : 'सामान्य संपर्क / सहायता',
    message: String(message).slice(0, 2000).trim(),
    createdAt: new Date().toISOString(),
    status: 'unread',
  };

  db.contactMessages.unshift(newMsg);
  saveDatabase(db);

  res.json({ success: true, message: 'आपका संदेश सफलतापूर्वक प्राप्त हुआ! हम 24 घंटे में संपर्क करेंगे।', contactMessage: newMsg });
});

app.get('/api/admin/contact-messages', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  res.json({ success: true, messages: db.contactMessages || [] });
});

app.post('/api/admin/contact-messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const { adminPassword, adminReply, status } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const msg = (db.contactMessages || []).find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  if (adminReply) msg.adminReply = adminReply;
  msg.status = (status as any) || 'replied';
  saveDatabase(db);

  res.json({ success: true, message: 'संदेश का समाधान अपडेट हो गया', contactMessage: msg });
});

// ======================== ADMIN PROFILE EDIT & USER AVATAR UPLOAD ========================

app.put('/api/admin/user/:userId/edit-details', (req, res) => {
  const { userId } = req.params;
  const {
    adminPassword,
    fullName,
    username,
    password,
    avatar,
    phone,
    email,
    coins,
    charms,
    gameLevel,
    gameXp,
    vipTier,
    frameType,
    status,
    houseName,
    clanName,
    bio,
  } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Strictly block changing immutable User ID, Room ID, or Sponsor ID even by Admin
  const rawBody = req.body || {};
  const attemptingImmutableMutation =
    (rawBody.userId !== undefined && String(rawBody.userId).trim() !== user.userId) ||
    (rawBody.gamingId !== undefined && String(rawBody.gamingId).trim() !== (user.gamingId || '')) ||
    (rawBody.personalRoomId !== undefined && String(rawBody.personalRoomId).trim() !== (user.personalRoomId || user.roomAddress || '')) ||
    (rawBody.roomAddress !== undefined && String(rawBody.roomAddress).trim() !== (user.roomAddress || '')) ||
    (rawBody.sponsorId !== undefined && String(rawBody.sponsorId).trim() !== user.sponsorId) ||
    (rawBody.sponsorName !== undefined && String(rawBody.sponsorName).trim() !== user.sponsorName);

  if (attemptingImmutableMutation) {
    return res.status(403).json({
      success: false,
      code: 'IMMUTABLE_IDENTITY_LOCKED',
      message: 'Personal User ID, Personal Room ID और Sponsor ID लॉक हैं — इन्हें Admin द्वारा भी बदला या डुप्लिकेट नहीं किया जा सकता।',
    });
  }

  if (username !== undefined) {
    const normalizedUname = normalizeUsername(username);
    if (normalizedUname) {
      if (!isValidUsernameFormat(normalizedUname)) {
        return res.status(400).json({ success: false, message: 'Username में केवल a-z व 0-9 (3-24 अक्षर) लिखें।' });
      }
      if (isUsernameTaken(db.users, normalizedUname, user.userId)) {
        return res.status(409).json({ success: false, message: `@${normalizedUname} किसी दूसरे प्लेयर के पास है।` });
      }
      user.username = normalizedUname;
    }
  }

  const now = new Date().toISOString();
  if (!Array.isArray(db.profileHistory)) db.profileHistory = [];

  if (fullName && fullName.trim() && fullName !== user.fullName) {
    db.profileHistory.unshift({
      id: `PH-${Date.now()}`,
      userId: user.userId,
      userName: user.fullName,
      changedBy: 'admin',
      changedByName: 'Admin',
      changeType: 'profile_update',
      field: 'fullName',
      oldValue: user.fullName,
      newValue: fullName.trim(),
      timestamp: now,
    });
    user.fullName = fullName.trim();
  }

  if (avatar !== undefined && avatar !== user.avatar) {
    db.profileHistory.unshift({
      id: `PH-${Date.now()}`,
      userId: user.userId,
      userName: user.fullName,
      changedBy: 'admin',
      changedByName: 'Admin',
      changeType: 'avatar_change',
      field: 'avatar',
      oldValue: user.avatar ? 'Previous Avatar' : 'None',
      newValue: 'Admin Updated Avatar',
      timestamp: now,
    });
    user.avatar = avatar;
  }

  if (phone) user.phone = phone.trim();
  if (email) user.email = email.trim();
  if (password && String(password).trim().length >= 3) user.password = String(password).trim();
  if (coins !== undefined && !isNaN(Number(coins))) user.coins = Math.max(0, Number(coins));
  if (charms !== undefined && !isNaN(Number(charms))) user.charms = Math.max(0, Number(charms));
  if (gameLevel !== undefined && !isNaN(Number(gameLevel))) {
    user.gameLevel = Math.max(1, Number(gameLevel));
    if (gameXp === undefined) {
      user.gameXp = Math.max(user.gameXp || 0, (user.gameLevel - 1) * 150);
    }
  }
  if (gameXp !== undefined && !isNaN(Number(gameXp))) user.gameXp = Math.max(0, Number(gameXp));
  if (vipTier && ['none', 'silver', 'gold', 'diamond'].includes(vipTier)) {
    user.vipTier = vipTier;
    user.vipTitle = vipTier === 'diamond' ? 'Diamond VIP' : vipTier === 'gold' ? 'Gold VIP' : vipTier === 'silver' ? 'Silver VIP' : '';
  }
  if (frameType) {
    user.frameType = frameType;
    if (!Array.isArray(user.unlockedFrames)) user.unlockedFrames = ['standard'];
    if (!user.unlockedFrames.includes(frameType)) user.unlockedFrames.push(frameType);
  }
  if (status) user.status = status;
  if (houseName) user.houseName = houseName.trim();
  if (clanName) user.clanName = clanName.trim();
  if (bio) user.bio = bio.trim();

  saveDatabase(db);
  res.json({ success: true, message: 'यूजर प्रोफाइल विवरण सफलतापूर्वक अपडेट कर दिया गया!', user });
});

app.post('/api/user/:userId/avatar', (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ success: false, message: 'Avatar image data is required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const oldValue = user.avatar ? 'Old Photo' : 'Default';
  user.avatar = avatar;
  incrementUserTaskProgress(user, 'profile_completed', 1);

  if (!Array.isArray(db.profileHistory)) db.profileHistory = [];
  db.profileHistory.unshift({
    id: `PH-${Date.now()}`,
    userId: user.userId,
    userName: user.fullName,
    changedBy: 'user',
    changedByName: user.fullName,
    changeType: 'avatar_change',
    field: 'avatar',
    oldValue,
    newValue: 'Custom Uploaded Photo',
    timestamp: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({ success: true, message: 'प्रोफाइल फोटो सफलतापूर्वक अपडेट हो गई!', avatar: user.avatar, user });
});

// ======================== AUTHENTIC REAL PLAYER ONLINE COUNTER ========================
app.get('/api/community/real-online-count', (_req, res) => {
  const now = Date.now();
  const activeSessions = (db.activitySessions || []).filter(s => {
    if (s.status !== 'online') return false;
    const hbTime = new Date(s.lastHeartbeat).getTime();
    return (now - hbTime) < 3 * 60 * 1000;
  });

  const activeUserIds = new Set<string>();
  activeSessions.forEach(s => activeUserIds.add(s.userId.toLowerCase()));

  (db.users || []).forEach(u => {
    if (u.isOnline && u.lastActiveTime) {
      const diff = now - new Date(u.lastActiveTime).getTime();
      if (diff < 3 * 60 * 1000) {
        activeUserIds.add(u.userId.toLowerCase());
      }
    }
  });

  const onlineList = (db.users || []).filter(u => activeUserIds.has(u.userId.toLowerCase()));
  const realCount = onlineList.length;

  res.json({
    success: true,
    realCount,
    onlinePlayers: onlineList.slice(0, 30).map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      avatar: u.avatar || '',
      gameLevel: u.gameLevel || 1,
      clanName: u.clanName || 'Royal Warriors ESP',
      lastActive: u.lastActiveTime,
    })),
  });
});

// ======================== REAL GIFT CARDS (ADMIN FULFILLMENT QUEUE - ZERO FAKE CODES) ========================
app.get('/api/gift-cards', (_req, res) => {
  res.json({
    success: true,
    catalog: GIFT_CARD_CATALOG,
    vouchers: GIFT_CARD_CATALOG.map(c => ({ ...c, status: 'available' as const })),
  });
});

app.post('/api/gift-cards/redeem', (req, res) => {
  const { userId, voucherId, catalogId } = req.body;
  const targetId = catalogId || voucherId;
  if (!userId || !targetId) {
    return res.status(400).json({ success: false, message: 'UserId and voucherId are required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const catalogItem = GIFT_CARD_CATALOG.find(v => v.id === targetId);
  if (!catalogItem) {
    return res.status(404).json({ success: false, message: 'Gift card package not found' });
  }

  const balanceBefore = user.coins || 0;
  if (balanceBefore < catalogItem.coinsRequired) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: catalogItem.coinsRequired,
      currentCoins: balanceBefore,
      message: `अपर्याप्त कॉइन्स! इस वाउचर के लिए ${catalogItem.coinsRequired} कॉइन्स चाहिए, आपके पास ${balanceBefore} हैं।`,
    });
  }

  user.coins = balanceBefore - catalogItem.coinsRequired;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + catalogItem.coinsRequired;

  if (!Array.isArray(db.giftCardRedemptions)) db.giftCardRedemptions = [];
  const redemption: GiftCardRedemption = {
    id: `GCR-${Date.now().toString().slice(-6)}`,
    catalogId: catalogItem.id,
    brand: catalogItem.brand,
    title: catalogItem.title,
    denomination: catalogItem.denomination,
    coinsSpent: catalogItem.coinsRequired,
    userId: user.userId,
    userName: user.fullName,
    userPhone: user.phone,
    status: 'pending_fulfillment',
    requestedAt: new Date().toISOString(),
  };
  db.giftCardRedemptions.unshift(redemption);

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'gift_card_redeem',
    categoryLabel: 'गिफ्ट कार्ड अनुरोध',
    amount: catalogItem.coinsRequired,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${catalogItem.title} रिडीम अनुरोध (${redemption.id}): एडमिन द्वारा असली वाउचर कोड जारी होना शेष`,
  });

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: `notif-gc-${Date.now()}`,
    userId: user.userId,
    title: `🎁 ${catalogItem.title} अनुरोध प्राप्त!`,
    message: `आपका ${catalogItem.coinsRequired} कॉइन्स का रिडीम अनुरोध (${redemption.id}) एडमिन के पास भेजा गया है। सत्यापन के बाद असली वाउचर कोड यहीं दिखेगा।`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `अनुरोध (${redemption.id}) सबमिट हो गया! एडमिन द्वारा असली वाउचर कोड जारी होते ही आपको नोटिफिकेशन मिलेगा।`,
    redemption,
    newBalance: user.coins,
    user,
  });
});

app.get('/api/gift-cards/redemptions', (req, res) => {
  const userId = req.query.userId as string | undefined;
  const adminPassword = req.query.adminPassword as string | undefined;

  if (adminPassword && verifyAdmin(adminPassword)) {
    return res.json({ success: true, redemptions: db.giftCardRedemptions || [] });
  }
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId or adminPassword is required' });
  }

  const list = (db.giftCardRedemptions || []).filter(r => r.userId.toLowerCase() === userId.toLowerCase());
  res.json({ success: true, redemptions: list });
});

app.post('/api/admin/gift-cards/:id/fulfill', (req, res) => {
  const { id } = req.params;
  const { adminPassword, status, voucherCode, voucherPin, rejectionReason } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(db.giftCardRedemptions)) db.giftCardRedemptions = [];
  const redemption = db.giftCardRedemptions.find(r => r.id === id);
  if (!redemption) {
    return res.status(404).json({ success: false, message: 'Redemption request not found' });
  }
  if (redemption.status !== 'pending_fulfillment') {
    return res.status(400).json({ success: false, message: 'This redemption request is already processed' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === redemption.userId.toLowerCase());

  if (status === 'rejected') {
    redemption.status = 'rejected';
    redemption.rejectionReason = rejectionReason || 'एडमिन द्वारा अस्वीकृत — कॉइन्स वापस किए गए';
    redemption.fulfilledAt = new Date().toISOString();

    if (user) {
      const before = user.coins || 0;
      user.coins = before + redemption.coinsSpent;
      logCoinTransaction(db, user, {
        type: 'credit',
        category: 'admin_adjustment',
        categoryLabel: 'गिफ्ट कार्ड रिफंड',
        amount: redemption.coinsSpent,
        balanceBefore: before,
        balanceAfter: user.coins,
        description: `गिफ्ट कार्ड ${redemption.id} रद्द होने पर +${redemption.coinsSpent} कॉइन्स वापस`,
      });
      db.notifications.unshift({
        id: `notif-gc-rej-${Date.now()}`,
        userId: user.userId,
        title: `❌ गिफ्ट कार्ड अनुरोध रद्द (${redemption.id})`,
        message: `${redemption.title} रद्द किया गया (${redemption.rejectionReason})। आपके ${redemption.coinsSpent} कॉइन्स वापस क्रेडिट हो गए हैं।`,
        type: 'system',
        date: new Date().toLocaleDateString('hi-IN'),
        read: false,
      });
    }
    saveDatabase(db);
    return res.json({ success: true, message: 'अनुरोध रद्द कर कॉइन्स वापस किए गए', redemption });
  }

  if (!voucherCode || String(voucherCode).trim().length < 4) {
    return res.status(400).json({ success: false, message: 'कृपया जारी करने के लिए असली वाउचर कोड दर्ज करें।' });
  }

  redemption.status = 'fulfilled';
  redemption.voucherCode = String(voucherCode).trim();
  redemption.voucherPin = voucherPin ? String(voucherPin).trim() : '';
  redemption.fulfilledAt = new Date().toISOString();

  if (user) {
    db.notifications.unshift({
      id: `notif-gc-ok-${Date.now()}`,
      userId: user.userId,
      title: `🎁 ${redemption.title} वाउचर जारी!`,
      message: `आपका असली वाउचर कोड: ${redemption.voucherCode}${redemption.voucherPin ? ` | PIN: ${redemption.voucherPin}` : ''}`,
      type: 'system',
      date: new Date().toLocaleDateString('hi-IN'),
      read: false,
    });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'असली वाउचर कोड सफलतापूर्वक जारी कर दिया गया!', redemption });
});

// ======================== 21. NWI (NON-WORKING INCOME) REAL 3-LEVEL DOWNLINE TREE ========================

function buildRealNwiTree(database: Database, user: UserProfile): NwiTreeRecord {
  const tierFee = user.joiningFee && user.joiningFee >= 50 ? user.joiningFee : 200;
  const targetId = (user.userId || '').toLowerCase();
  const claimedSet = new Set((user.nwiClaimedMemberIds || []).map(id => (id || '').toLowerCase()));

  // Level 1: Real active users directly sponsored by this user
  const l1Users = database.users.filter(
    u =>
      u.status === 'active' &&
      (u.userId || '').toLowerCase() !== targetId &&
      (u.sponsorId || '').toLowerCase() === targetId
  );

  const l1Ids = new Set(l1Users.map(u => (u.userId || '').toLowerCase()));

  // Level 2: Real active users sponsored by Level 1 members
  const l2Users = database.users.filter(
    u =>
      u.status === 'active' &&
      (u.userId || '').toLowerCase() !== targetId &&
      !l1Ids.has((u.userId || '').toLowerCase()) &&
      l1Ids.has((u.sponsorId || '').toLowerCase())
  );

  const l2Ids = new Set(l2Users.map(u => (u.userId || '').toLowerCase()));

  // Level 3: Real active users sponsored by Level 2 members
  const l3Users = database.users.filter(
    u =>
      u.status === 'active' &&
      (u.userId || '').toLowerCase() !== targetId &&
      !l1Ids.has((u.userId || '').toLowerCase()) &&
      !l2Ids.has((u.userId || '').toLowerCase()) &&
      l2Ids.has((u.sponsorId || '').toLowerCase())
  );

  const mapNode = (m: UserProfile, level: 1 | 2 | 3, rate: number): NwiMemberNode => {
    const planFee = m.joiningFee && m.joiningFee > 0 ? m.joiningFee : tierFee;
    return {
      userId: m.userId,
      fullName: m.fullName,
      avatar: m.avatar || '',
      joiningDate: m.joiningDate || (m.createdAt ? m.createdAt.slice(0, 10) : ''),
      planFee,
      level,
      spilloverFrom:
        level === 1
          ? `डायरेक्ट टीम सदस्य (Sponsor: ${m.sponsorId})`
          : `लेवल ${level - 1} टीम सदस्य (${m.sponsorId}) द्वारा जुड़ा`,
      rewardEarned: Math.round(planFee * rate),
      status: 'active',
    };
  };

  const level1Members = l1Users.map(m => mapNode(m, 1, 0.10));
  const level2Members = l2Users.map(m => mapNode(m, 2, 0.15));
  const level3Members = l3Users.map(m => mapNode(m, 3, 0.25));

  const level1Income = level1Members.reduce((acc, m) => acc + m.rewardEarned, 0);
  const level2Income = level2Members.reduce((acc, m) => acc + m.rewardEarned, 0);
  const level3Income = level3Members.reduce((acc, m) => acc + m.rewardEarned, 0);
  const totalPassiveEarned = level1Income + level2Income + level3Income;

  const allNodes = [...level1Members, ...level2Members, ...level3Members];
  const totalPassiveClaimed = allNodes
    .filter(m => claimedSet.has(m.userId.toLowerCase()))
    .reduce((acc, m) => acc + m.rewardEarned, 0);
  const pendingToClaim = Math.max(0, totalPassiveEarned - totalPassiveClaimed);

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
    pendingToClaim,
    queuePosition: 1,
  };
}

// 1. Get NWI Real 3-Level Downline Tree for User
app.get('/api/nwi/tree/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const tree = buildRealNwiTree(db, user);
  res.json({ success: true, tree });
});

// 2. Claim NWI Real 3-Level Passive Income to Main Wallet
app.post('/api/nwi/claim-level-reward', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const tree = buildRealNwiTree(db, user);
  const claimedSet = new Set((user.nwiClaimedMemberIds || []).map(id => id.toLowerCase()));
  const unclaimedNodes = [
    ...tree.level1Members,
    ...tree.level2Members,
    ...tree.level3Members,
  ].filter(m => !claimedSet.has(m.userId.toLowerCase()));

  const pending = unclaimedNodes.reduce((acc, m) => acc + m.rewardEarned, 0);

  if (pending <= 0) {
    return res.status(400).json({
      success: false,
      message: 'अभी कोई नया NWI 3-लेवल क्लेम पेंडिंग नहीं है। जब आपके नीचे लेवल 1, 2 या 3 में असली सदस्य जुड़ेंगे, तब यहाँ पैसिव इनकम खुलेगी।',
      tree,
    });
  }

  user.nwiClaimedMemberIds = Array.from(
    new Set([
      ...(user.nwiClaimedMemberIds || []),
      ...unclaimedNodes.map(m => m.userId),
    ])
  );
  user.balance = (user.balance || 0) + pending;
  user.totalEarnings = (user.totalEarnings || 0) + pending;

  if (!Array.isArray(db.transactions)) db.transactions = [];
  db.transactions.unshift({
    id: `TXN-NWI-${Date.now().toString().slice(-6)}`,
    userId: user.userId,
    amount: pending,
    type: 'level_income',
    description: `👑 NWI 3-Level रियल टीम पैसिव इनकम (${unclaimedNodes.length} डाउनलाइन मेंबर्स)`,
    date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'completed',
    referenceId: `NWI-REAL-REF-${Date.now().toString().slice(-8)}`,
  });

  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.unshift({
    id: `notif-nwi-${Date.now()}`,
    userId: user.userId,
    title: `👑 NWI 3-Level टीम इनकम प्राप्त हुई!`,
    message: `आपके नीचे बने असली 3-लेवल नेटवर्क (${unclaimedNodes.length} नए मेंबर्स) से ₹${pending} सफलतापूर्वक आपके वॉलेट में क्रेडिट कर दिए गए हैं।`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  const updatedTree = buildRealNwiTree(db, user);
  saveDatabase(db);
  res.json({
    success: true,
    message: `बधाई हो! ₹${pending} की NWI 3-लेवल टीम पैसिव इनकम आपके वॉलेट में सफलतापूर्वक ट्रांसफर हो गई है!`,
    claimedAmount: pending,
    newBalance: user.balance,
    user,
    tree: updatedTree,
  });
});

// 3. Activate or Switch NWI Plan Tier
app.post('/api/nwi/activate', (req, res) => {
  const { userId, tierFee } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const chosenFee = Number(tierFee) || 200;
  user.chosenServiceName = 'NON WORKING INCOME (NWI)';
  user.chosenServiceCode = 'NWI';
  user.joiningFee = chosenFee;

  const tree = buildRealNwiTree(db, user);
  saveDatabase(db);

  res.json({
    success: true,
    message: `NWI ₹${chosenFee} 3-Level टीम प्लान सफलतापूर्वक सक्रिय हुआ!`,
    tree,
    user,
  });
});

// ==============================================================
// ESP PLAY SOCIAL ECOSYSTEM: RELATIONSHIPS/CP, FAMILIES, PK BATTLE,
// ADVANCE ROOM TIERS, EVENTS CENTER & ADMIN USER COIN GRANT
// ==============================================================

// A. Advance / Premium Voice Room Tier Upgrade & PK Battle Arena
app.post('/api/game/voice-rooms/:roomId/upgrade-tier', (req, res) => {
  const { roomId } = req.params;
  const { userId, tierId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress) === String(roomId));
  if (!user || !room) {
    return res.status(404).json({ success: false, message: 'User or Voice Room not found' });
  }
  if (room.hostUserId !== user.userId && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'केवल रूम होस्ट ही प्रीमियम टियर अपग्रेड कर सकते हैं।' });
  }
  const spec = getVoiceRoomTierSpec(tierId);
  if (!Array.isArray(user.unlockedRoomTiers)) user.unlockedRoomTiers = ['normal'];
  const alreadyUnlocked = spec.coinPrice === 0 || user.unlockedRoomTiers.includes(spec.id);
  if (!alreadyUnlocked) {
    const before = user.coins || 0;
    if (before < spec.coinPrice) {
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_COINS',
        requiredCoins: spec.coinPrice,
        currentCoins: before,
        message: `${spec.hindiName} के लिए ${spec.coinPrice} Coins चाहिए (आपके पास: ${before} Coins)।`,
      });
    }
    user.coins = before - spec.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + spec.coinPrice;
    user.unlockedRoomTiers.push(spec.id);
    logCoinTransaction(db, user, {
      type: 'debit',
      category: 'room_purchase',
      categoryLabel: 'रूम प्रीमियम अपग्रेड',
      amount: spec.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `Room #${room.roomAddress} को ${spec.name} में अपग्रेड किया (-${spec.coinPrice} कॉइन्स)`,
    });
  }
  room.roomTier = spec.id;
  room.isPremiumRoom = spec.id !== 'normal';
  if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
  room.chatMessages.push({
    id: `tier-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'System',
    senderRoll: 'STAGE',
    text: `${spec.badgeIcon} Room upgraded to ${spec.name} (${spec.pkBoostMultiplier}x Charms PK Boost)!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  saveDatabase(db);
  res.json({
    success: true,
    message: `${spec.badgeIcon} आपका रूम अब ${spec.name} बन गया है!`,
    roomPayload: buildRoomDetailPayload(room, user.userId),
    user,
  });
});

app.post('/api/game/voice-rooms/:roomId/pk/start', (req, res) => {
  const { roomId } = req.params;
  const { userId, title, durationSeconds, redLabel, blueLabel } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress) === String(roomId));
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
  const dur = Math.min(900, Math.max(60, Number(durationSeconds) || 180));
  const now = Date.now();
  const pkBattle = {
    active: true,
    title: String(title || 'ESP PLAY Live PK Battle').trim(),
    redLabel: String(redLabel || `${room.hostName} Red`).trim(),
    blueLabel: String(blueLabel || 'Challenger Blue').trim(),
    redScore: 0,
    blueScore: 0,
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(now + dur * 1000).toISOString(),
    startedBy: userId || room.hostUserId,
  };
  room.pkBattle = pkBattle;
  if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
  room.chatMessages.push({
    id: `pk-start-${now}`,
    senderId: 'SYSTEM',
    sender: 'PK Referee',
    senderRoll: 'PK',
    text: `⚔️ PK BATTLE LIVE! "${pkBattle.title}" — ${pkBattle.redLabel} VS ${pkBattle.blueLabel}! गिफ्ट या PK वोट से अपनी टीम जिताएं!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  saveDatabase(db);
  res.json({ success: true, message: '⚔️ PK बैटल शुरू हो गया!', roomPayload: buildRoomDetailPayload(room, userId) });
});

app.post('/api/game/voice-rooms/:roomId/pk/vote', (req, res) => {
  const { roomId } = req.params;
  const { userId, side, coinsToSpend } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress) === String(roomId));
  if (!user || !room) return res.status(404).json({ success: false, message: 'User or room not found' });
  if (!room.pkBattle?.active) return res.status(400).json({ success: false, message: 'कोई सक्रिय PK बैटल नहीं चल रहा।' });

  const spend = Math.max(0, Math.round(Number(coinsToSpend) || 0));
  if (spend > 0) {
    const before = user.coins || 0;
    if (before < spend) {
      return res.status(400).json({ success: false, code: 'INSUFFICIENT_COINS', message: `PK पावर बूस्ट के लिए ${spend} Coins चाहिए।` });
    }
    user.coins = before - spend;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + spend;
    logCoinTransaction(db, user, {
      type: 'debit',
      category: 'gift_sent',
      categoryLabel: 'PK बैटल पावर वोट',
      amount: spend,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `Room #${room.roomAddress} PK (${side === 'blue' ? 'Blue' : 'Red'}) में +${spend} कॉइन्स बूस्ट`,
    });
  }
  const tierSpec = getVoiceRoomTierSpec(room.roomTier);
  const pts = Math.round((spend > 0 ? spend * 2 : 10) * (tierSpec.pkBoostMultiplier || 1));
  if (side === 'blue') room.pkBattle.blueScore = (room.pkBattle.blueScore || 0) + pts;
  else room.pkBattle.redScore = (room.pkBattle.redScore || 0) + pts;
  saveDatabase(db);
  res.json({
    success: true,
    message: `⚡ ${side === 'blue' ? room.pkBattle.blueLabel : room.pkBattle.redLabel} को +${pts} PK पॉइंट्स मिले!`,
    roomPayload: buildRoomDetailPayload(room, user.userId),
    user,
  });
});

app.post('/api/game/voice-rooms/:roomId/pk/end', (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId || String(r.roomAddress) === String(roomId));
  if (!room || !room.pkBattle) return res.status(404).json({ success: false, message: 'Room or PK not found' });
  const red = room.pkBattle.redScore || 0;
  const blue = room.pkBattle.blueScore || 0;
  const winnerLabel = red === blue ? 'Draw (बराबरी)' : red > blue ? room.pkBattle.redLabel : room.pkBattle.blueLabel;
  room.pkBattle.active = false;
  room.pkBattle.winnerSide = red === blue ? 'draw' : red > blue ? 'red' : 'blue';
  if (!Array.isArray(room.chatMessages)) room.chatMessages = [];
  room.chatMessages.push({
    id: `pk-end-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'PK Referee',
    senderRoll: 'PK',
    text: `🏆 PK RESULT: ${winnerLabel} जीता! (Red ${red} - Blue ${blue})`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  saveDatabase(db);
  res.json({ success: true, message: `🏆 PK समाप्त! विजेता: ${winnerLabel}`, roomPayload: buildRoomDetailPayload(room, userId) });
});

// B. Relationship Tokens Store & Two-Player Bonds / CP System
app.post('/api/social/relationships/buy-token', (req, res) => {
  const { userId, tokenId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const spec = RELATIONSHIP_TOKENS.find(t => t.id === tokenId);
  if (!spec) return res.status(404).json({ success: false, message: 'Relationship token not found' });

  const before = user.coins || 0;
  if (before < spec.coinPrice) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: spec.coinPrice,
      currentCoins: before,
      message: `${spec.hindiName} टोकन खरीदने के लिए ${spec.coinPrice} Coins चाहिए (आपके पास: ${before} Coins)।`,
    });
  }
  user.coins = before - spec.coinPrice;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + spec.coinPrice;
  if (!Array.isArray(user.ownedRelationshipTokens)) user.ownedRelationshipTokens = [];
  user.ownedRelationshipTokens.push(spec.id);

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'room_purchase',
    categoryLabel: 'रिलेशनशिप टोकन खरीद',
    amount: spec.coinPrice,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `${spec.badgeIcon} ${spec.tagName} टोकन खरीदा (-${spec.coinPrice} कॉइन्स)`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${spec.badgeIcon} ${spec.hindiName} टोकन आपके बैग में आ गया! अब इसे किसी भी प्लेयर पर लगाएं।`,
    user,
  });
});

app.post('/api/social/relationships/request', (req, res) => {
  const { userId, targetIdentifier, tokenId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const cleanTarget = String(targetIdentifier || '').trim().replace(/^@+/, '').toLowerCase();
  const target = db.users.find(
    u =>
      u.userId.toLowerCase() === String(targetIdentifier || '').trim().toLowerCase() ||
      u.id === targetIdentifier ||
      (cleanTarget && normalizeUsername(u.username) === cleanTarget)
  );
  if (!user || !target) return res.status(404).json({ success: false, message: 'यूजर या टारगेट प्लेयर नहीं मिला (सही User ID या @username लिखें)।' });
  if (user.userId === target.userId) return res.status(400).json({ success: false, message: 'आप खुद के साथ रिलेशनशिप टैग नहीं जोड़ सकते।' });

  const spec = RELATIONSHIP_TOKENS.find(t => t.id === tokenId);
  if (!spec) return res.status(404).json({ success: false, message: 'Invalid relationship token' });

  if (!Array.isArray(user.ownedRelationshipTokens)) user.ownedRelationshipTokens = [];
  const tokenIdx = user.ownedRelationshipTokens.indexOf(spec.id);
  if (tokenIdx >= 0) {
    user.ownedRelationshipTokens.splice(tokenIdx, 1);
  } else {
    const before = user.coins || 0;
    if (before < spec.coinPrice) {
      return res.status(400).json({
        success: false,
        code: 'INSUFFICIENT_COINS',
        requiredCoins: spec.coinPrice,
        currentCoins: before,
        message: `${spec.hindiName} टैग लगाने के लिए ${spec.coinPrice} Coins चाहिए (आपके पास: ${before} Coins)।`,
      });
    }
    user.coins = before - spec.coinPrice;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + spec.coinPrice;
    logCoinTransaction(db, user, {
      type: 'debit',
      category: 'room_purchase',
      categoryLabel: 'रिलेशनशिप / CP टैग सक्रिय',
      amount: spec.coinPrice,
      balanceBefore: before,
      balanceAfter: user.coins,
      description: `${target.fullName} के साथ ${spec.tagName} टैग रिक्वेस्ट (-${spec.coinPrice} कॉइन्स)`,
    });
  }

  const bondId = `BOND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const nowIso = new Date().toISOString();
  if (!Array.isArray(user.activeRelationships)) user.activeRelationships = [];
  if (!Array.isArray(target.activeRelationships)) target.activeRelationships = [];

  // Remove any pending/existing bond of same token type with same partner
  user.activeRelationships = user.activeRelationships.filter(b => b.partnerUserId !== target.userId);
  target.activeRelationships = target.activeRelationships.filter(b => b.partnerUserId !== user.userId);

  const senderBond: RelationshipBond = {
    id: bondId,
    tokenId: spec.id,
    tagName: spec.tagName,
    badgeIcon: spec.badgeIcon,
    partnerUserId: target.userId,
    partnerName: target.fullName,
    partnerUsername: target.username || '',
    partnerAvatar: target.avatar,
    intimacyPoints: spec.coinPrice,
    status: 'pending_outgoing',
    createdAt: nowIso,
  };
  const receiverBond: RelationshipBond = {
    id: bondId,
    tokenId: spec.id,
    tagName: spec.tagName,
    badgeIcon: spec.badgeIcon,
    partnerUserId: user.userId,
    partnerName: user.fullName,
    partnerUsername: user.username || '',
    partnerAvatar: user.avatar,
    intimacyPoints: spec.coinPrice,
    status: 'pending_incoming',
    createdAt: nowIso,
  };

  user.activeRelationships.unshift(senderBond);
  target.activeRelationships.unshift(receiverBond);

  db.notifications.unshift({
    id: `notif-rel-${Date.now()}`,
    userId: target.userId,
    title: `${spec.badgeIcon} नया ${spec.tagName} रिलेशनशिप प्रस्ताव!`,
    message: `${user.fullName} (@${user.username || user.userId}) ने आपके साथ "${spec.hindiName}" टैग जोड़ने का प्रस्ताव भेजा है। Bonds & CP हब में जाकर Accept करें!`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${spec.badgeIcon} ${target.fullName} को ${spec.tagName} प्रस्ताव भेज दिया गया! उनके स्वीकार करते ही दोनों की प्रोफाइल पर टैग चमकने लगेगा।`,
    user,
  });
});

app.post('/api/social/relationships/respond', (req, res) => {
  const { userId, bondId, action } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const myBond = (user.activeRelationships || []).find(b => b.id === bondId);
  if (!myBond) return res.status(404).json({ success: false, message: 'Relationship proposal not found' });
  const partner = db.users.find(u => u.userId === myBond.partnerUserId);

  if (action === 'accept') {
    myBond.status = 'accepted';
    if (partner && Array.isArray(partner.activeRelationships)) {
      const pBond = partner.activeRelationships.find(b => b.id === bondId);
      if (pBond) pBond.status = 'accepted';
      db.notifications.unshift({
        id: `notif-rel-ok-${Date.now()}`,
        userId: partner.userId,
        title: `${myBond.badgeIcon} ${myBond.tagName} जोड़ी जुड़ गई!`,
        message: `${user.fullName} ने आपका ${myBond.tagName} प्रस्ताव स्वीकार कर लिया है!`,
        type: 'system',
        date: new Date().toLocaleDateString('hi-IN'),
        read: false,
      });
    }
    saveDatabase(db);
    return res.json({ success: true, message: `${myBond.badgeIcon} बधाई हो! ${myBond.partnerName} के साथ ${myBond.tagName} टैग सक्रिय हो गया!`, user });
  } else {
    user.activeRelationships = (user.activeRelationships || []).filter(b => b.id !== bondId);
    if (partner && Array.isArray(partner.activeRelationships)) {
      partner.activeRelationships = partner.activeRelationships.filter(b => b.id !== bondId);
      // Refund token to proposer bag when declined
      if (!Array.isArray(partner.ownedRelationshipTokens)) partner.ownedRelationshipTokens = [];
      partner.ownedRelationshipTokens.push(myBond.tokenId);
    }
    saveDatabase(db);
    return res.json({ success: true, message: 'प्रस्ताव अस्वीकार कर दिया गया (टोकन वापस कर दिया गया)।', user });
  }
});

app.post('/api/social/relationships/remove', (req, res) => {
  const { userId, bondId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const myBond = (user.activeRelationships || []).find(b => b.id === bondId);
  user.activeRelationships = (user.activeRelationships || []).filter(b => b.id !== bondId);
  if (myBond) {
    const partner = db.users.find(u => u.userId === myBond.partnerUserId);
    if (partner && Array.isArray(partner.activeRelationships)) {
      partner.activeRelationships = partner.activeRelationships.filter(b => b.id !== bondId);
    }
  }
  saveDatabase(db);
  res.json({ success: true, message: 'रिलेशनशिप टैग हटा दिया गया।', user });
});

// C. ESP Family System (Create, Join, Invite, Family Coins Donate, Live Family Chat + Gift Effects)
function getFamilyLevel(coins: number): number {
  return Math.max(1, Math.floor(coins / 500) + 1);
}

app.get('/api/families', (_req, res) => {
  if (!Array.isArray(db.families)) db.families = [];
  const sorted = [...db.families].sort((a, b) => (b.familyCoins + b.familyCharms) - (a.familyCoins + a.familyCharms));
  res.json({ success: true, families: sorted });
});

app.get('/api/families/:familyId', (req, res) => {
  const { familyId } = req.params;
  const fam = (db.families || []).find(
    f => f.id === familyId || f.familyCode.toLowerCase() === familyId.toLowerCase()
  );
  if (!fam) return res.status(404).json({ success: false, message: 'Family not found' });
  res.json({ success: true, family: fam });
});

app.post('/api/families/create', (req, res) => {
  const { userId, name, emblem, motto, isOpenJoin } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.familyId) return res.status(400).json({ success: false, message: 'नई फैमिली बनाने से पहले अपनी वर्तमान फैमिली छोड़ें।' });
  const cleanName = String(name || '').trim();
  if (cleanName.length < 3) return res.status(400).json({ success: false, message: 'फैमिली का नाम कम से कम 3 अक्षरों का रखें।' });

  if (!Array.isArray(db.families)) db.families = [];
  if (db.families.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'इस नाम की ESP Family पहले से मौजूद है!' });
  }

  const CREATE_FEE = 200;
  const before = user.coins || 0;
  if (before < CREATE_FEE) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      requiredCoins: CREATE_FEE,
      currentCoins: before,
      message: `नई ESP Family बनाने के लिए ${CREATE_FEE} Coins चार्टर शुल्क चाहिए (आपके पास: ${before} Coins)।`,
    });
  }

  user.coins = before - CREATE_FEE;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + CREATE_FEE;
  const famId = `FAM-${Date.now()}`;
  const famCode = String(100000 + db.families.length + Math.floor(Math.random() * 800)).slice(0, 6);
  const nowIso = new Date().toISOString();

  const newFam: EspFamily = {
    id: famId,
    familyCode: famCode,
    name: cleanName,
    emblem: FAMILY_EMBLEMS.includes(emblem) ? emblem : '👑',
    motto: String(motto || 'एक साथ खेलें, एक साथ जीतें — ESP PLAY Family!').trim(),
    founderUserId: user.userId,
    founderName: user.fullName,
    familyCoins: 200,
    familyCharms: user.charms || 0,
    familyLevel: 1,
    level: 1,
    maxMembers: 50,
    isOpenJoin: isOpenJoin !== false,
    members: [
      {
        userId: user.userId,
        fullName: user.fullName,
        username: user.username || '',
        avatar: user.avatar,
        role: 'Founder',
        contributedCoins: 200,
        joinedAt: nowIso,
      },
    ],
    chatMessages: [
      {
        id: `fmsg-init-${Date.now()}`,
        familyId: famId,
        senderId: 'SYSTEM',
        senderName: 'ESP PLAY Family',
        text: `🏰 बधाई हो! ${user.fullName} ने "${cleanName}" (Family ID: ${famCode}) की स्थापना की और 200 Family Coins जमा किए!`,
        createdAt: nowIso,
      },
    ],
    createdAt: nowIso,
  };

  db.families.unshift(newFam);
  user.familyId = famId;
  user.familyRole = 'Founder';
  user.clanName = cleanName;
  user.clanRole = 'Leader';
  user.familyCoinsContributed = (user.familyCoinsContributed || 0) + 200;

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'room_purchase',
    categoryLabel: 'ESP Family निर्माण',
    amount: CREATE_FEE,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `"${cleanName}" ESP Family बनाई (-${CREATE_FEE} कॉइन्स)`,
  });

  saveDatabase(db);
  res.json({ success: true, message: `🏰 "${cleanName}" फैमिली तैयार हो गई! (ID: ${famCode})`, family: newFam, user });
});

app.post('/api/families/:familyId/join', (req, res) => {
  const { familyId } = req.params;
  const { userId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const fam = (db.families || []).find(f => f.id === familyId || f.familyCode === familyId);
  if (!user || !fam) return res.status(404).json({ success: false, message: 'User or Family not found' });
  if (user.familyId && user.familyId !== fam.id) {
    return res.status(400).json({ success: false, message: 'नई फैमिली जॉइन करने के लिए पहले पुरानी फैमिली छोड़ें।' });
  }
  if (!fam.members.some(m => m.userId === user.userId)) {
    fam.members.push({
      userId: user.userId,
      fullName: user.fullName,
      username: user.username || '',
      avatar: user.avatar,
      role: 'Member',
      contributedCoins: 0,
      joinedAt: new Date().toISOString(),
    });
    fam.chatMessages.push({
      id: `fjoin-${Date.now()}`,
      familyId: fam.id,
      senderId: 'SYSTEM',
      senderName: 'System',
      text: `🎉 ${user.fullName} हमारी ${fam.emblem} ${fam.name} फैमिली में शामिल हुए! स्वागत करें!`,
      createdAt: new Date().toISOString(),
    });
  }
  user.familyId = fam.id;
  user.familyRole = fam.members.find(m => m.userId === user.userId)?.role || 'Member';
  user.clanName = fam.name;
  saveDatabase(db);
  res.json({ success: true, message: `${fam.emblem} आप "${fam.name}" फैमिली में शामिल हो गए!`, family: fam, user });
});

app.post('/api/families/:familyId/leave', (req, res) => {
  const { familyId } = req.params;
  const { userId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const fam = (db.families || []).find(f => f.id === familyId);
  if (!user || !fam) return res.status(404).json({ success: false, message: 'User or Family not found' });
  fam.members = fam.members.filter(m => m.userId !== user.userId);
  if (fam.members.length === 0) {
    db.families = (db.families || []).filter(f => f.id !== fam.id);
  } else if (fam.founderUserId === user.userId) {
    fam.founderUserId = fam.members[0].userId;
    fam.founderName = fam.members[0].fullName;
    fam.members[0].role = 'Founder';
  }
  user.familyId = '';
  user.familyRole = 'Member';
  user.clanName = 'Royal Warriors ESP';
  user.clanRole = 'Member';
  saveDatabase(db);
  res.json({ success: true, message: 'आपने फैमिली छोड़ दी है।', user });
});

app.post('/api/families/:familyId/donate', (req, res) => {
  const { familyId } = req.params;
  const { userId, amount } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const fam = (db.families || []).find(f => f.id === familyId);
  if (!user || !fam) return res.status(404).json({ success: false, message: 'User or Family not found' });
  const donateCoins = Math.max(10, Math.round(Number(amount) || 50));
  const before = user.coins || 0;
  if (before < donateCoins) {
    return res.status(400).json({ success: false, code: 'INSUFFICIENT_COINS', message: `दान करने के लिए ${donateCoins} Coins चाहिए!` });
  }
  user.coins = before - donateCoins;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + donateCoins;
  user.familyCoinsContributed = (user.familyCoinsContributed || 0) + donateCoins;
  user.gameXp = (user.gameXp || 0) + Math.round(donateCoins * 0.5);
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  fam.familyCoins = (fam.familyCoins || 0) + donateCoins;
  fam.level = getFamilyLevel(fam.familyCoins);

  const memberRow = fam.members.find(m => m.userId === user.userId);
  if (memberRow) memberRow.contributedCoins = (memberRow.contributedCoins || 0) + donateCoins;

  fam.chatMessages.push({
    id: `fdon-${Date.now()}`,
    familyId: fam.id,
    senderId: user.userId,
    senderName: user.fullName,
    senderAvatar: user.avatar,
    text: `🪙 ${user.fullName} ने Family Coins खजाने में +${donateCoins} Coins दान किए! (Total: ${fam.familyCoins} 🪙)`,
    createdAt: new Date().toISOString(),
  });

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'gift_sent',
    categoryLabel: 'Family Coins दान',
    amount: donateCoins,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `${fam.name} Family Coins खजाने में दान (-${donateCoins} कॉइन्स)`,
  });

  saveDatabase(db);
  res.json({ success: true, message: `🪙 +${donateCoins} Family Coins दान किए गए!`, family: fam, user });
});

app.post('/api/families/:familyId/invite', (req, res) => {
  const { familyId } = req.params;
  const { userId, targetIdentifier } = req.body || {};
  const sender = db.users.find(u => u.userId === userId || u.id === userId);
  const fam = (db.families || []).find(f => f.id === familyId);
  const cleanTarget = String(targetIdentifier || '').trim().replace(/^@+/, '').toLowerCase();
  const target = db.users.find(
    u =>
      u.userId.toLowerCase() === String(targetIdentifier || '').trim().toLowerCase() ||
      (cleanTarget && normalizeUsername(u.username) === cleanTarget)
  );
  if (!sender || !fam || !target) {
    return res.status(404).json({ success: false, message: 'प्लेयर नहीं मिला (सही User ID या @username डालें)।' });
  }
  db.notifications.unshift({
    id: `notif-faminv-${Date.now()}`,
    userId: target.userId,
    title: `${fam.emblem} "${fam.name}" Family निमंत्रण!`,
    message: `${sender.fullName} ने आपको ESP Family "${fam.name}" (Code: ${fam.familyCode}) जॉइन करने के लिए आमंत्रित किया है!`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });
  saveDatabase(db);
  res.json({ success: true, message: `📨 ${target.fullName} को Family जॉइन करने का निमंत्रण भेज दिया गया!` });
});

app.post('/api/families/:familyId/chat', (req, res) => {
  const { familyId } = req.params;
  const { userId, text } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const fam = (db.families || []).find(f => f.id === familyId);
  if (!user || !fam) return res.status(404).json({ success: false, message: 'User or Family not found' });
  const cleanText = String(text || '').trim();
  if (!cleanText) return res.status(400).json({ success: false, message: 'Message cannot be empty' });

  incrementUserTaskProgress(user, 'chat_sent', 1);
  const memberRole = fam.members.find(m => m.userId === user.userId)?.role || 'Member';
  fam.chatMessages.push({
    id: `fc-${Date.now()}`,
    familyId: fam.id,
    senderId: user.userId,
    senderName: user.fullName,
    senderAvatar: user.avatar,
    senderRole: memberRole,
    text: cleanText,
    createdAt: new Date().toISOString(),
  });
  if (fam.chatMessages.length > 200) fam.chatMessages = fam.chatMessages.slice(-200);
  saveDatabase(db);
  res.json({ success: true, family: fam, user });
});

// D. Events Center Endpoints
app.get('/api/events/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const claimed = new Set(user.claimedEventIds || []);
  const events = ESP_EVENTS_CATALOG.map(ev => {
    let progress = 0;
    if (ev.metricKey === 'totalCoinsSpent') progress = user.totalCoinsSpent || 0;
    else if (ev.metricKey === 'totalGamesWon') progress = user.totalGamesWon || 0;
    else if (ev.metricKey === 'relationshipsCount') {
      progress = (user.activeRelationships || []).filter(b => b.status === 'accepted').length;
    } else if (ev.metricKey === 'familyCoinsContributed') {
      progress = user.familyCoinsContributed || 0;
    }
    return {
      ...ev,
      currentProgress: Math.min(progress, ev.targetValue),
      isCompleted: progress >= ev.targetValue,
      isClaimed: claimed.has(ev.id),
    };
  });
  res.json({ success: true, events, user });
});

app.post('/api/events/claim', (req, res) => {
  const { userId, eventId } = req.body || {};
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  const ev = ESP_EVENTS_CATALOG.find(e => e.id === eventId);
  if (!user || !ev) return res.status(404).json({ success: false, message: 'User or event not found' });
  if (!Array.isArray(user.claimedEventIds)) user.claimedEventIds = [];
  if (user.claimedEventIds.includes(ev.id)) {
    return res.status(400).json({ success: false, message: 'यह इवेंट रिवॉर्ड पहले ही क्लेम किया जा चुका है!' });
  }
  let progress = 0;
  if (ev.metricKey === 'totalCoinsSpent') progress = user.totalCoinsSpent || 0;
  else if (ev.metricKey === 'totalGamesWon') progress = user.totalGamesWon || 0;
  else if (ev.metricKey === 'relationshipsCount') progress = (user.activeRelationships || []).filter(b => b.status === 'accepted').length;
  else if (ev.metricKey === 'familyCoinsContributed') progress = user.familyCoinsContributed || 0;

  if (progress < ev.targetValue) {
    return res.status(400).json({ success: false, message: `अभी टारगेट अधूरा है (${progress}/${ev.targetValue})।` });
  }

  const before = user.coins || 0;
  user.coins = before + ev.coinReward;
  user.gameXp = (user.gameXp || 0) + ev.xpReward;
  user.gameLevel = calculateLevelFromXp(user.gameXp);
  user.claimedEventIds.push(ev.id);

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'daily_task',
    categoryLabel: 'ESP Event इनाम',
    amount: ev.coinReward,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `${ev.badgeIcon} ${ev.title} पूरा करने पर +${ev.coinReward} कॉइन्स बोनस`,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `🎉 ${ev.title} का +${ev.coinReward} Coins & +${ev.xpReward} EXP इनाम मिल गया!`,
    user,
  });
});

// E. Admin Panel Direct User Coin Grant / Adjust by User ID or @username
app.post('/api/admin/users/adjust-coins', (req, res) => {
  const { adminPassword, userIdentifier, amount, mode, reason } = req.body || {};
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const rawId = String(userIdentifier || '').trim();
  const cleanHandle = normalizeUsername(rawId);
  const target = db.users.find(
    u =>
      u.userId.toLowerCase() === rawId.toLowerCase() ||
      u.id.toLowerCase() === rawId.toLowerCase() ||
      (cleanHandle && normalizeUsername(u.username) === cleanHandle)
  );
  if (!target) {
    return res.status(404).json({ success: false, message: `User "${rawId}" नहीं मिला। सही User ID या @username दर्ज करें।` });
  }
  const coinDelta = Math.max(1, Math.round(Number(amount) || 0));
  if (!coinDelta) {
    return res.status(400).json({ success: false, message: 'कृपया वैध Coin संख्या दर्ज करें (> 0)।' });
  }
  const actionMode: 'credit' | 'debit' = mode === 'debit' ? 'debit' : 'credit';
  const before = target.coins || 0;
  const after = actionMode === 'credit' ? before + coinDelta : Math.max(0, before - coinDelta);
  target.coins = after;

  const cleanReason = String(reason || (actionMode === 'credit' ? 'Admin Direct Coin Grant' : 'Admin Coin Adjustment')).trim();

  logCoinTransaction(db, target, {
    type: actionMode,
    category: 'coin_recharge',
    categoryLabel: actionMode === 'credit' ? 'Admin Coin Grant' : 'Admin Coin Debit',
    amount: coinDelta,
    balanceBefore: before,
    balanceAfter: after,
    description: `${cleanReason} (${actionMode === 'credit' ? '+' : '-'}${coinDelta} कॉइन्स)`,
  });

  db.notifications.unshift({
    id: `notif-adm-coin-${Date.now()}`,
    userId: target.userId,
    title: actionMode === 'credit' ? `🪙 Admin से +${coinDelta} Coins प्राप्त हुए!` : `🪙 Admin द्वारा ${coinDelta} Coins समायोजित`,
    message: `${cleanReason} — नया बैलेंस: ${after} Coins`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `✅ ${target.fullName} (${target.userId}) को ${actionMode === 'credit' ? '+' : '-'}${coinDelta} Coins अपडेट! नया बैलेंस: ${after} 🪙`,
    user: target,
    balanceBefore: before,
    balanceAfter: after,
  });
});

// E2. Admin Live 12 AM IST Clock & Weekly Rewards Monitor
app.get('/api/admin/time-weekly-stats', (req, res) => {
  const adminPassword = (req.headers['x-admin-password'] as string) || (req.query.adminPassword as string) || '';
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const today = getTodayDateString();
  const timeMeta = getVerifiedLiveIstTimeMeta();
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
  const activeStreaksCount = db.users.filter(u => Number(u.loginStreak || 0) > 0).length;
  res.json({
    success: true,
    today,
    timeMeta,
    schedule: SEVEN_DAY_CHECKIN_REWARDS,
    claimedTodayCount: claimedTodayUsers.length,
    activeStreaksCount,
    claimedTodayUsers: claimedTodayUsers.slice(0, 30),
  });
});

app.post('/api/admin/resync-time', async (req, res) => {
  const adminPassword =
    (req.body?.adminPassword as string) || (req.headers['x-admin-password'] as string) || '';
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  await syncAuthoritativeTimeOffset();
  const timeMeta = getVerifiedLiveIstTimeMeta();
  res.json({
    success: true,
    message: `Live API Clock Synced (${timeMeta.istTimeLabel} · ${timeMeta.syncSource})`,
    timeMeta,
  });
});

app.post('/api/admin/reset-user-daily-claim', (req, res) => {
  const { adminPassword, userIdentifier, preserveStreak } = req.body || {};
  const pwd = adminPassword || (req.headers['x-admin-password'] as string) || '';
  if (!verifyAdmin(pwd)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }
  const rawId = String(userIdentifier || '').trim();
  const cleanHandle = normalizeUsername(rawId);
  const target = db.users.find(
    u =>
      u.userId.toLowerCase() === rawId.toLowerCase() ||
      u.id.toLowerCase() === rawId.toLowerCase() ||
      (cleanHandle && normalizeUsername(u.username) === cleanHandle)
  );
  if (!target) {
    return res.status(404).json({ success: false, message: `User "${rawId}" नहीं मिला।` });
  }
  const today = getTodayDateString();
  if (preserveStreak && Number(target.loginStreak || 0) > 0) {
    target.lastDailyCheckInDate = getYesterdayDateString(today);
  } else {
    target.lastDailyCheckInDate = '';
    target.loginStreak = 0;
  }
  saveDatabase(db);
  res.json({
    success: true,
    message: `✅ ${target.fullName} (${target.userId}) का Weekly Claim लॉक रीसेट हो गया — अब नया Claim Pop-up अनलॉक होगा।`,
    user: target,
  });
});

// F. Admin Panel Create Real Player Account (Individual Password, Username, Level, VIP Effect, Coins, Room ID)
app.post('/api/admin/users/create', (req, res) => {
  const {
    adminPassword,
    fullName,
    username,
    phone,
    email,
    password,
    coins = 0,
    charms = 0,
    gameLevel = 1,
    vipTier = 'none',
    frameType = 'standard',
    avatar,
    bio,
    clanName,
    roomNumber,
    vipRoomLabel,
  } = req.body || {};

  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized admin request' });
  }

  const cleanFullName = String(fullName || '').trim().replace(/\s+/g, ' ');
  const cleanPhone = normalizePhoneDigits(phone || '') || String(phone || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanFullName || !cleanPhone || cleanPassword.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'प्लेयर का नाम, मोबाइल नंबर और कम से कम 3 अक्षर का पासवर्ड अनिवार्य है।',
    });
  }

  const normalizedInputUsername = username ? normalizeUsername(username) : '';
  if (normalizedInputUsername) {
    if (!isValidUsernameFormat(normalizedInputUsername)) {
      return res.status(400).json({
        success: false,
        message: 'Username में केवल a-z और 0-9 (3-24 अक्षर, बिना symbol) लिखें।',
      });
    }
    if (isUsernameTaken(db.users, normalizedInputUsername)) {
      return res.status(409).json({
        success: false,
        message: `@${normalizedInputUsername} पहले से किसी अन्य खिलाड़ी के पास है।`,
      });
    }
  }

  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanPhone}@espgaming.club`;
  const existingPhoneOrEmail = db.users.find(
    u =>
      normalizePhoneDigits(u.phone) === cleanPhone ||
      (cleanEmail && (u.email || '').trim().toLowerCase() === cleanEmail)
  );
  if (existingPhoneOrEmail) {
    return res.status(409).json({
      success: false,
      message: `मोबाइल (${cleanPhone}) या ईमेल पहले से पंजीकृत है (${existingPhoneOrEmail.userId})।`,
    });
  }

  const newUserId = generateUniqueGamerUserId(cleanFullName);
  const newGamingId = newUserId;
  const finalUsername =
    normalizedInputUsername || generateUniqueDefaultUsername(cleanFullName, newUserId, newGamingId);

  let assignedRoomAddress = generateUniqueRoomId(cleanFullName, db.users, db.customVoiceRooms || []);
  let assignedVipRoom = false;
  if (roomNumber) {
    const cleanDigits = String(roomNumber).replace(/\D/g, '');
    if (cleanDigits.length >= 3 && cleanDigits.length <= 10) {
      const conflict = db.users.find(u => String(u.roomAddress || '').replace(/\D/g, '') === cleanDigits);
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Room ID #${cleanDigits} पहले से ${conflict.fullName} के पास है।`,
        });
      }
      assignedRoomAddress = cleanDigits;
      assignedVipRoom = isVipFancyRoomNumber(cleanDigits);
    }
  }

  const levelNum = Math.max(1, Math.min(99, Math.round(Number(gameLevel) || 1)));
  const xpNum = Math.max(0, (levelNum - 1) * 150);
  const validVip: 'none' | 'silver' | 'gold' | 'diamond' = ['silver', 'gold', 'diamond'].includes(vipTier)
    ? vipTier
    : 'none';
  const resolvedFrame = String(frameType || (validVip === 'diamond' ? 'royal-dragon-crown' : validVip === 'gold' ? 'vip-gold' : 'standard'));
  const unlockedFrames = Array.from(new Set(['standard', resolvedFrame]));
  const initCoins = Math.max(0, Math.round(Number(coins) || 0));
  const initCharms = Math.max(0, Math.round(Number(charms) || 0));

  const newUser: UserProfile = normalizeUserRecord({
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: newUserId,
    gamingId: newGamingId,
    username: finalUsername,
    fullName: cleanFullName,
    phone: cleanPhone,
    email: cleanEmail,
    fullAddress: 'ESP PLAY Arena',
    paymentAddress: '',
    payoutUpiId: '',
    password: cleanPassword,
    sponsorId: db.settings.ownerSponsorId,
    sponsorName: db.settings.ownerName,
    chosenServiceCode: 'GAME',
    chosenServiceName: 'ESP GAMING & VOICE CLUB',
    joiningFee: 0,
    joiningDate: new Date().toISOString().split('T')[0],
    paymentUtr: 'ADMIN_CREATED_PLAYER',
    status: 'active',
    accountType: 'gamer',
    balance: 0,
    totalEarnings: 0,
    referralEarnings: 0,
    promoEarnings: 0,
    totalWithdrawn: 0,
    coins: initCoins,
    charms: initCharms,
    gameLevel: levelNum,
    gameXp: xpNum,
    vipTier: validVip,
    vipTitle: validVip === 'diamond' ? 'Diamond VIP' : validVip === 'gold' ? 'Gold VIP' : validVip === 'silver' ? 'Silver VIP' : '',
    unlockedFrames,
    frameType: resolvedFrame,
    unlockedRooms: ['default_dark'],
    roomTheme: 'default_dark',
    roomAddress: assignedRoomAddress,
    personalRoomId: assignedRoomAddress,
    isVipRoom: assignedVipRoom,
    vipRoomLabel: assignedVipRoom ? vipRoomLabel || 'VIP Royal' : '',
    followedRooms: [],
    houseName: `House of ${cleanFullName.split(' ')[0]}`,
    clanName: clanName ? String(clanName).trim() : 'Royal Warriors ESP',
    clanRole: 'Member',
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(finalUsername)}`,
    bio: bio ? String(bio).trim() : `Lv.${levelNum} ESP PLAY Challenger`,
    loginStreak: 1,
    claimedDays: [],
    friendsCount: 0,
    visitorCount: 0,
    role: 'member',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  });

  db.users.push(newUser);
  ensurePersonalRoomForUser(db, newUser);
  saveDatabase(db);

  res.json({
    success: true,
    user: newUser,
    message: `✅ नया खिलाड़ी "${newUser.fullName}" (@${newUser.username} | ID: ${newUser.userId} | Pass: ${cleanPassword} | Lv.${levelNum}) बन गया!`,
  });
});

// G. Voice Room Red Packet & Blue Packet Rain + Room Atmosphere Effect
app.post('/api/game/voice-rooms/:roomId/set-effect', (req, res) => {
  const { roomId } = req.params;
  const { userId, effect } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(
    r => r.id.toLowerCase() === roomId.toLowerCase() || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()
  );
  if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

  const allowedEffects = ['none', 'sparkles', 'petals', 'fireflies', 'snow', 'neon_lasers'];
  const chosen = allowedEffects.includes(effect) ? effect : 'none';
  room.roomEffect = chosen as any;
  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `fx-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'System',
    senderRoll: 'FX',
    text: `✨ Room atmosphere effect updated to: ${chosen.toUpperCase()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);

  saveDatabase(db);
  res.json({
    success: true,
    roomEffect: room.roomEffect,
    roomPayload: buildRoomDetailPayload(room, userId),
  });
});

app.post('/api/game/voice-rooms/:roomId/drop-packet', (req, res) => {
  const { roomId } = req.params;
  const { userId, packetType = 'red', totalCoins = 100, maxClaims = 5, message = '' } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(
    r => r.id.toLowerCase() === roomId.toLowerCase() || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()
  );
  const user = db.users.find(
    u =>
      (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
      (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );
  if (!room || !user) {
    return res.status(404).json({ success: false, message: 'Room or user not found' });
  }

  const pType: 'red' | 'blue' = packetType === 'blue' ? 'blue' : 'red';
  const claimsCap = Math.max(2, Math.min(30, Math.round(Number(maxClaims) || 5)));
  const poolCoins = Math.max(claimsCap, Math.round(Number(totalCoins) || 50));

  if ((user.coins || 0) < poolCoins) {
    return res.status(400).json({
      success: false,
      code: 'INSUFFICIENT_COINS',
      message: `${pType === 'red' ? 'Red Packet' : 'Blue Packet'} बारिश के लिए ${poolCoins} Coins चाहिए (आपके पास ${user.coins || 0} Coins हैं)।`,
    });
  }

  const before = user.coins || 0;
  user.coins = before - poolCoins;
  user.totalCoinsSpent = (user.totalCoinsSpent || 0) + poolCoins;

  logCoinTransaction(db, user, {
    type: 'debit',
    category: 'packet_drop',
    categoryLabel: pType === 'red' ? 'Red Packet Rain' : 'Blue Packet Rain',
    amount: poolCoins,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `${pType === 'red' ? '🧧 लाल पैकेट' : '💠 नीला पैकेट'} बारिश रूम #${room.roomAddress} (${claimsCap} लोगों के लिए)`,
  });

  if (!Array.isArray(room.activePackets)) room.activePackets = [];
  const now = Date.now();
  room.activePackets = room.activePackets.filter(
    p => p.remainingCoins > 0 && p.claimedBy.length < p.maxClaims && new Date(p.expiresAt).getTime() > now
  );

  const packet = {
    id: `pkt-${now}-${Math.random().toString(36).substring(2, 6)}`,
    roomId: room.id,
    packetType: pType,
    senderUserId: user.userId,
    senderName: user.fullName,
    senderAvatar: user.avatar,
    totalCoins: poolCoins,
    remainingCoins: poolCoins,
    maxClaims: claimsCap,
    claimedBy: [],
    message: String(message || (pType === 'red' ? '🧧 सबके लिए लकी लाल पैकेट बारिश!' : '💠 नीला VIP + EXP पैकेट बारिश!')).trim(),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 10 * 60 * 1000).toISOString(),
  };
  room.activePackets.unshift(packet);

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `pktmsg-${now}`,
    senderId: user.userId,
    sender: pType === 'red' ? '🧧 RED PACKET RAIN' : '💠 BLUE PACKET RAIN',
    senderRoll: user.userId,
    isGift: true,
    text: `${pType === 'red' ? '🧧' : '💠'} ${user.fullName} ने रूम में ${poolCoins} Coins (${claimsCap} पैकेट्स) की बारिश की! तुरंत टैप करके लूटें!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);

  incrementUserTaskProgress(user, 'gift_sent', 1);
  saveDatabase(db);

  res.json({
    success: true,
    packet,
    user,
    roomPayload: buildRoomDetailPayload(room, user.userId),
    message: `${pType === 'red' ? '🧧 लाल पैकेट' : '💠 नीला पैकेट'} बारिश शुरू हो गई!`,
  });
});

app.post('/api/game/voice-rooms/:roomId/claim-packet', (req, res) => {
  const { roomId } = req.params;
  const { userId, packetId } = req.body || {};
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(
    r => r.id.toLowerCase() === roomId.toLowerCase() || String(r.roomAddress || '').toLowerCase() === roomId.toLowerCase()
  );
  const user = db.users.find(
    u =>
      (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) ||
      (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase())
  );
  if (!room || !user) {
    return res.status(404).json({ success: false, message: 'Room or user not found' });
  }

  const packets = Array.isArray(room.activePackets) ? room.activePackets : [];
  const packet = packets.find(p => p.id === packetId);
  if (!packet) {
    return res.status(404).json({ success: false, message: 'पैकेट समाप्त हो गया है या उपलब्ध नहीं है।' });
  }
  if (packet.claimedBy.some(c => c.userId === user.userId)) {
    return res.status(400).json({ success: false, message: 'आप इस पैकेट से कॉइन्स पहले ही प्राप्त कर चुके हैं!' });
  }
  if (packet.remainingCoins <= 0 || packet.claimedBy.length >= packet.maxClaims) {
    return res.status(400).json({ success: false, message: 'यह पैकेट पूरी तरह लूटा जा चुका है!' });
  }

  const remainingSlots = Math.max(1, packet.maxClaims - packet.claimedBy.length);
  let coinsWon = 1;
  if (remainingSlots === 1) {
    coinsWon = packet.remainingCoins;
  } else {
    const maxAllowed = Math.max(1, packet.remainingCoins - (remainingSlots - 1));
    const avgShare = Math.max(1, Math.floor((packet.remainingCoins / remainingSlots) * 1.7));
    coinsWon = Math.min(maxAllowed, Math.max(1, Math.floor(Math.random() * avgShare) + 1));
  }
  const xpWon = packet.packetType === 'blue' ? 12 : 4;

  packet.remainingCoins = Math.max(0, packet.remainingCoins - coinsWon);
  packet.claimedBy.push({
    userId: user.userId,
    fullName: user.fullName,
    coinsWon,
    xpWon,
    claimedAt: new Date().toISOString(),
  });

  const before = user.coins || 0;
  user.coins = before + coinsWon;
  user.gameXp = (user.gameXp || 0) + xpWon;
  user.gameLevel = Math.max(user.gameLevel || 1, 1 + Math.floor(user.gameXp / 150));

  logCoinTransaction(db, user, {
    type: 'credit',
    category: 'packet_claim',
    categoryLabel: packet.packetType === 'red' ? 'Red Packet Won' : 'Blue Packet Won',
    amount: coinsWon,
    balanceBefore: before,
    balanceAfter: user.coins,
    description: `${packet.packetType === 'red' ? '🧧' : '💠'} ${packet.senderName} के पैकेट से +${coinsWon} Coins व +${xpWon} EXP मिले!`,
  });

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `pktclaim-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'System',
    senderRoll: 'PACKET',
    text: `${packet.packetType === 'red' ? '🧧' : '💠'} ${user.fullName} ने पैकेट से +${coinsWon} 🪙${xpWon > 5 ? ` (+${xpWon} EXP)` : ''} जीते!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
  if (room.chatMessages.length > 80) room.chatMessages = room.chatMessages.slice(-80);

  saveDatabase(db);
  res.json({
    success: true,
    coinsWon,
    xpWon,
    packetType: packet.packetType,
    packet,
    user,
    roomPayload: buildRoomDetailPayload(room, user.userId),
    message: `🎉 बधाई हो! +${coinsWon} Coins${packet.packetType === 'blue' ? ` व +${xpWon} EXP` : ''} मिले!`,
  });
});

// H. Server-Synced 1-on-1 DM Messages, Game Invites & Personal Locked Room Invites
app.get('/api/dm/thread', (req, res) => {
  const userId = String(req.query.userId || '').trim();
  const peerId = String(req.query.peerId || '').trim();
  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId required' });
  }
  const all = Array.isArray(db.directMessages) ? db.directMessages : [];
  if (!peerId) {
    const mine = all.filter(m => m.fromUserId === userId || m.toUserId === userId);
    return res.json({ success: true, messages: mine.slice(-150) });
  }
  const thread = all.filter(
    m =>
      (m.fromUserId === userId && m.toUserId === peerId) ||
      (m.fromUserId === peerId && m.toUserId === userId)
  );
  res.json({ success: true, messages: thread.slice(-120) });
});

app.post('/api/dm/send', (req, res) => {
  const {
    fromUserId,
    toUserId,
    text,
    inviteType,
    gameKey,
    gameName,
    roomAddress,
    roomTitle,
    passcode,
  } = req.body || {};

  const sender = db.users.find(u => u.userId === fromUserId || u.id === fromUserId);
  const recipient = db.users.find(u => u.userId === toUserId || u.id === toUserId);
  if (!sender || !recipient) {
    return res.status(404).json({ success: false, message: 'Sender or recipient not found' });
  }
  const cleanText = String(text || '').trim();
  if (!cleanText && !inviteType) {
    return res.status(400).json({ success: false, message: 'Message text required' });
  }

  if (!Array.isArray(db.directMessages)) db.directMessages = [];
  const msgRecord = {
    id: `dm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromUserId: sender.userId,
    fromName: sender.fullName,
    fromAvatar: sender.avatar,
    toUserId: recipient.userId,
    text:
      cleanText ||
      (inviteType === 'game'
        ? `🎮 ${sender.fullName} ने आपको "${gameName || gameKey}" खेलने के लिए आमंत्रित किया है!`
        : `🔒 ${sender.fullName} ने आपको पर्सनल लॉक रूम #${roomAddress} में आमंत्रित किया है!`),
    inviteType: inviteType === 'game' || inviteType === 'locked_room' ? inviteType : undefined,
    gameKey: gameKey ? String(gameKey) : undefined,
    gameName: gameName ? String(gameName) : undefined,
    roomAddress: roomAddress ? String(roomAddress) : undefined,
    roomTitle: roomTitle ? String(roomTitle) : undefined,
    passcode: passcode ? String(passcode) : undefined,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    createdAt: new Date().toISOString(),
  };
  db.directMessages.push(msgRecord);
  if (db.directMessages.length > 2000) {
    db.directMessages = db.directMessages.slice(-2000);
  }

  incrementUserTaskProgress(sender, 'chat_sent', 1);

  if (inviteType) {
    db.notifications.unshift({
      id: `notif-dm-${Date.now()}`,
      userId: recipient.userId,
      title:
        inviteType === 'game'
          ? `🎮 ${sender.fullName} ने गेम इनवाइट भेजा!`
          : `🔒 ${sender.fullName} ने लॉक रूम इनवाइट भेजा!`,
      message: msgRecord.text,
      type: 'system',
      date: new Date().toLocaleDateString('hi-IN'),
      read: false,
    });
  }

  saveDatabase(db);
  const thread = db.directMessages.filter(
    m =>
      (m.fromUserId === sender.userId && m.toUserId === recipient.userId) ||
      (m.fromUserId === recipient.userId && m.toUserId === sender.userId)
  );
  res.json({ success: true, message: msgRecord, thread: thread.slice(-120), user: sender });
});

async function startServer() {
  ensureUniqueIdentityIntegrity(db);
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ESP Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
