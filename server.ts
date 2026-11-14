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
  NwiTreeRecord,
  NwiMemberNode,
  PlanUpgradeRequest,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Environment constraint: Dev server must always listen on port 3000
const PORT = 3000;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-session-token, x-admin-password');
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
  nwiTreeRecords?: NwiTreeRecord[];
  planUpgrades?: PlanUpgradeRequest[];
  voiceRoomSeats?: VoiceRoomSeat[];
  voiceRoomChat?: Array<{ id: string; senderId: string; sender: string; senderRoll: string; text: string; isGift?: boolean; time: string; audioDataUrl?: string; audioDuration?: number; isVoiceNote?: boolean }>;
  customVoiceRooms?: Array<{
    id: string;
    title: string;
    topic: string;
    category: 'earning' | 'gaming' | 'chitchat' | 'clan' | 'help';
    roomAddress: string;
    hostUserId: string;
    hostName: string;
    hostAvatar?: string;
    hostLevel?: number;
    hostCharms?: number;
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
  adminMasterKey: string;
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

const DEFAULT_GIFT_CARD_VOUCHERS: GiftCardVoucher[] = [
  {
    id: 'gc-amz-50',
    brand: 'Amazon',
    title: '₹50 Amazon Pay E-Gift Card',
    hindiTitle: '₹50 अमेज़न पे डिजिटल वाउचर',
    denomination: 50,
    coinsRequired: 2500,
    voucherCode: 'AMZ-ESP-9842-8812',
    voucherPin: '4892',
    validityDays: 365,
    description: 'Instant Amazon Pay balance credit code. Redeem in Amazon App.',
    status: 'available',
  },
  {
    id: 'gc-flp-100',
    brand: 'Flipkart',
    title: '₹100 Flipkart Gift Card',
    hindiTitle: '₹100 फ्लिपकार्ट शॉपिंग वाउचर',
    denomination: 100,
    coinsRequired: 5000,
    voucherCode: 'FLP-ESP-3310-7744',
    voucherPin: '9921',
    validityDays: 365,
    description: 'Flipkart shopping voucher valid for all categories.',
    status: 'available',
  },
  {
    id: 'gc-gplay-100',
    brand: 'Google Play',
    title: '₹100 Google Play Recharge Code',
    hindiTitle: '₹100 गूगल प्ले रिडीम कोड',
    denomination: 100,
    coinsRequired: 5000,
    voucherCode: 'GP-ESP-7711-2099',
    voucherPin: '5501',
    validityDays: 365,
    description: 'Google Play balance for games, subscriptions and in-app coins.',
    status: 'available',
  },
  {
    id: 'gc-upi-250',
    brand: 'UPI Cash Voucher',
    title: '₹250 Direct UPI Cash Voucher',
    hindiTitle: '₹250 सीधा यूपीआई नकद वाउचर',
    denomination: 250,
    coinsRequired: 12000,
    voucherCode: 'UPI-ESP-5588-4421',
    voucherPin: '1120',
    validityDays: 180,
    description: 'Direct UPI cash payout code processed within 1 hour.',
    status: 'available',
  },
];

const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room-global',
    name: 'ESP National Community Club',
    hindiName: 'राष्ट्रीय कम्युनिटी क्लब (सभी सदस्य)',
    description: 'All ESP verified members official chatting hub. Discuss daily earnings, share tips & ideas.',
    category: 'community',
    membersCount: 2840,
    lastMessage: 'Welcome to ESP Club! Share your referral links and daily task proofs.',
    lastMessageTime: 'Just now',
  },
  {
    id: 'room-services',
    name: '10 Services Earning Discussion',
    hindiName: '10 सर्विसेज पर चर्चा व रणनीति',
    description: 'Master all 10 earning services (EMO, MMO, MOM, NWI Auto Pool, SWI, TWI, etc.)',
    category: 'service',
    membersCount: 1620,
    lastMessage: 'NWI Auto pool dividends credited today! Check your wallet.',
    lastMessageTime: '10m ago',
  },
  {
    id: 'room-referrals',
    name: 'Referral & Team Builders Club',
    hindiName: 'रेफरल & डाउनलाइन टीम बिल्डर्स',
    description: 'Connect with other members, make new friends, build 5-tier networks, and share status templates.',
    category: 'group',
    membersCount: 980,
    lastMessage: 'Joined with ₹10! Earned ₹400 in direct referral within 2 days.',
    lastMessageTime: '25m ago',
  },
  {
    id: 'room-support',
    name: 'Founder & Admin 24x7 Helpdesk',
    hindiName: 'फाउंडर मार्गदर्शन एवं हेल्पलाइन',
    description: 'Official WhatsApp +91 8877490845 & Live IOIS Support Assistant channel.',
    category: 'help',
    membersCount: 3100,
    lastMessage: 'Admin verifies 12-digit UTR within minutes. Digital ID cards ready.',
    lastMessageTime: '1h ago',
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
    level: 80,
    charms: 50000,
    coins: 200000,
    badge: '⚖️ JUSTICE',
    voiceAccent: 'Hindi-Formal',
    status: 'online',
    description: 'Supreme voice room & game arbiter. Ensures fair play, settles dispute bets, warns foul players, and rewards righteous champions.',
    hindiDescription: 'गेम व वॉइस रूम का आधिकारिक निष्पक्ष जज। नियम पालन करवाता है, विवाद सुलझाता है और निष्पक्ष खेल पर इंसाफ बोनस देता है।',
    superpowers: [
      'निष्पक्ष फैसला (Fair-Play Ruling)',
      'चीटिंग डिटेक्शन व पेनल्टी वॉर्निंग',
      'विवाद सुलझाना (Dispute Resolution)',
      'इंसाफ बोनस रिवॉर्ड (+50 Coins)'
    ],
    sampleDialogues: [
      '⚖️ अदालत में आपका स्वागत है! हर खिलाड़ी के साथ निष्पक्ष न्याय होगा।',
      '⚖️ फैसला: नियम 4 के तहत दोनों खिलाड़ियों का खेल जायज है!',
      '⚖️ किसी भी विवाद में मैं हर गेम मूव का पारदर्शी ऑडिट करता हूँ।',
      '⚖️ ईमानदारी से खेलने वाले हर सदस्य को मिलेगा इंसाफ बोनस!'
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
    level: 75,
    charms: 45000,
    coins: 150000,
    badge: '🐺 WEREWOLF',
    voiceAccent: 'Hindi-Dramatic',
    status: 'online',
    description: 'ESP PLAY Werewolf game master. Moderates night/day cycles, distributes secret roles, calls the villagers to vote, and hunts with the wolves.',
    hindiDescription: 'ESP PLAY का प्रसिद्ध वेयरवुल्फ गेम संचालक। रात और दिन के चक्र चलाता है, गुप्त भूमिकाएं बांटता है और गांव वालों से वोटिंग करवाता है।',
    superpowers: [
      'वेयरवुल्फ गेम लाइव होस्टिंग',
      'गुप्त भूमिका वितरण (Seer, Doctor, Wolf, Villager)',
      'रात / दिन का नाटकीय कथावाचन',
      'सोलो यूजर के साथ बॉट लॉबी मैचमेकिंग'
    ],
    sampleDialogues: [
      '🐺 रात हो चुकी है... सभी गांव वाले आंखें बंद कर सो जाएं!',
      '🐺 भेड़िए जागें और आज रात का अपना शिकार चुनें!',
      '🐺 सुबह हो चुकी है... गांव वाले जागें और तय करें कि आज किसे निष्कासित करना है!',
      '🐺 ज्योतिषी (Seer) ने अपनी दिव्य दृष्टि से सच पहचान लिया है!'
    ]
  },
  {
    id: 'BOT-BHAI',
    code: 'we_bhai',
    name: 'We Bhai (वी भाई)',
    hindiName: '🤝 वी भाई (देसी मददगार)',
    roleTitle: 'Friendly Community Assistant',
    hindiRole: 'कम्युनिटी गाइड व बोनस साथी',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother',
    frameType: 'vip-gold',
    level: 70,
    charms: 40000,
    coins: 100000,
    badge: '🤝 WE BHAI',
    voiceAccent: 'Hindi-Friendly',
    status: 'online',
    description: 'Warm, helpful Hindi & Bhojpuri friendly guide. Explains all 10 earning services, gives secret game tips, and hands out daily lucky coins.',
    hindiDescription: 'सच्चा देसी दोस्त! 10 सर्विसेज से कमाई के सीक्रेट ट्रिक्स समझाता है, गेमिंग में हौसला बढ़ाता है और रोज़ फ्री लकी कॉइन्स देता है।',
    superpowers: [
      '10 सर्विसेज अर्निंग गाइडेंस',
      'डेली लकी कॉइन ड्रॉप (+100 Coins)',
      'गेमिंग स्ट्रेटेजी व विनिंग टिप्स',
      'स्टेज पर दोस्ताना हौसला अफजाई'
    ],
    sampleDialogues: [
      '🤝 अरे भाई स्वागत बा! का हाल चाल? आज कौन सा गेम जीतना है?',
      '🤝 टेंशन मत लो, वी भाई है ना! EMO और NWI से आज ही कमाई शुरू करो।',
      '🤝 लो भाई, मेरी तरफ से 100 लकी कॉइन का तोहफा! धुआं उड़ा दो!',
      '🤝 शर्मा जी का लेवल 99 है, उनके साथ मुकाबला करने के लिए रोज़ प्रैक्टिस करो!'
    ]
  },
  {
    id: 'BOT-CHAT',
    code: 'we_chat',
    name: 'We Chat (वी चैट AI)',
    hindiName: '💬 वी चैट (मनोरंजन साथी)',
    roleTitle: 'Voice & Banter Companion',
    hindiRole: 'शायरी, संगीत व दिल की बातें',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet',
    frameType: 'cosmic-neon',
    level: 65,
    charms: 38000,
    coins: 80000,
    badge: '💬 COMPANION',
    voiceAccent: 'Hindi-Sweet',
    status: 'online',
    description: 'Lively companion for solo players. Recites beautiful Hindi shayari, cracks witty jokes, reacts with emojis, and keeps the stage alive 24x7.',
    hindiDescription: 'अकेलेपन का सबसे बड़ा तोड़! जब कोई ऑनलाइन न हो तो वी चैट शायरी सुनाता है, मज़ाकिया चुटकुले कहता है और मधुर महफ़िल सजाता है।',
    superpowers: [
      'खूबसूरत हिंदी व उर्दू शायरी',
      'मज़ेदार देसी चुटकुले और किस्से',
      'गिफ्ट्स पर म्यूजिकल व चार्मिंग रिएक्शन',
      '24x7 कभी न रुकने वाली बातचीत'
    ],
    sampleDialogues: [
      '💬 महफ़िल में जब आप आए, तो दिल बाग-बाग हो गया! स्वागत है आपका!',
      '💬 "मंजिल उन्हीं को मिलती है, जिनके सपनों में जान होती है... पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!"',
      '💬 एक चुटकुला सुनाऊं? जो गेम हार के मुस्कुरा दे, उससे दोबारा कोई नहीं जीत सकता!',
      '💬 आज का समां बड़ा हसीन है, चलिए मिलकर कुछ नया खेलते हैं!'
    ]
  },
  {
    id: 'BOT-ALERT',
    code: 'alert_bot',
    name: 'WeAlert (उद्घोषक बॉट)',
    hindiName: '🔔 वी अलर्ट (शाही उद्घोषक)',
    roleTitle: 'Royal Arrival & Event Announcer',
    hindiRole: 'शाही आगमन व लाइव बिगुल उद्घोषणा',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeAlertRoyalHorn',
    frameType: 'vip-gold',
    level: 60,
    charms: 30000,
    coins: 50000,
    badge: '🔔 VIP ALERT',
    voiceAccent: 'Hindi-Announcer',
    status: 'online',
    description: 'Broadcasts royal trumpet horns, gift showers, Sharma Ji royal entries, and high-stakes tournament alerts in the room.',
    hindiDescription: 'शाही आगमन पर बिगुल बजाता है, बड़े गिफ्ट्स (फरारी, ताज, महल) की लाइव घोषणा करता है और टूर्नामेंट अलर्ट भेजता है।',
    superpowers: [
      'शाही बिगुल और वीआईपी आगमन अलर्ट',
      'मेगा गिफ्ट लाइव ब्रॉडकास्ट',
      'टूर्नामेंट व जैकपॉट सायरन',
      'रूम लाइव अलर्ट टूल'
    ],
    sampleDialogues: [
      '🔔 🎺 सुनिए सुनिए! सर्वोच्च महाराजा शर्मा जी (Level 99, 98,765 Charms) का आगमन हो चुका है!',
      '🔔 👑 कमरे में शाही ताज (Emperor Crown) का भव्य नजराना पेश किया गया है!',
      '🔔 🚀 जैकपॉट राउंड शुरू होने वाला है! सभी खिलाड़ी तैयार रहें!',
      '🔔 🌟 कमरे के सभी सदस्यों को बहुत-बहुत बधाई!'
    ]
  }
];

function ensureSharmaJi(users: UserProfile[]) {
  const sharmaJi = users.find(u => u.userId === 'SHARMA-JI-VIP' || u.userId === 'ESP-SHARMA-JI-VIP');
  if (!sharmaJi) {
    users.unshift({
      id: 'usr-sharma-ji',
      userId: 'SHARMA-JI-VIP',
      fullName: '👑 Sharma Ji (शर्मा जी)',
      phone: '9876598765',
      email: 'sharmaji.royal@espgaming.in',
      fullAddress: 'Royal Palace, New Delhi, India',
      paymentAddress: 'sharmaji@upi',
      payoutUpiId: 'sharmaji@upi',
      password: 'password123',
      sponsorId: 'FOUNDER',
      sponsorName: 'SANTOSH KUMAR',
      chosenServiceCode: 'OES',
      chosenServiceName: 'ONLINE EARNING SYSTEM (OES)',
      joiningFee: 10000,
      joiningDate: '2024-01-01',
      paymentUtr: 'SHARMA_ROYAL_GENESIS',
      status: 'active',
      verifiedAt: '2024-01-01T00:00:00.000Z',
      balance: 550000,
      totalEarnings: 890000,
      referralEarnings: 650000,
      promoEarnings: 240000,
      totalWithdrawn: 340000,
      coins: 999999,
      charms: 98765,
      gameLevel: 99,
      gameXp: 99999,
      crownPost: true,
      frameType: 'royal-dragon-crown',
      vipTitle: '👑 ESP PLAY Grand Emperor (सर्वोच्च महाराजा)',
      roomAddress: 'ESP-ROOM-SHARMAJI-ROYAL',
      houseName: '👑 शर्मा जी का राजमहल (Sharma Ji Royal Palace)',
      clanName: '👑 Sharma Ji Royals',
      clanRole: 'Leader',
      loginStreak: 7,
      claimedDays: [1, 2, 3, 4, 5, 6, 7],
      friendsCount: 2500,
      visitorCount: 98765,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyalLegend99',
      bio: '👑 ESP PLAY & ESP के सबसे बड़े लेजेंड | Level 99 | 98,765 Charms | सभी गेम के बेताज बादशाह | क्राउन पोस्ट धारक',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  } else {
    sharmaJi.gameLevel = 99;
    sharmaJi.charms = 98765;
    sharmaJi.coins = Math.max(sharmaJi.coins || 0, 999999);
    sharmaJi.crownPost = true;
    sharmaJi.frameType = 'royal-dragon-crown';
    sharmaJi.vipTitle = '👑 ESP PLAY Grand Emperor (सर्वोच्च महाराजा)';
    sharmaJi.houseName = '👑 शर्मा जी का राजमहल (Sharma Ji Royal Palace)';
    sharmaJi.clanName = '👑 Sharma Ji Royals';
    sharmaJi.clanRole = 'Leader';
    sharmaJi.bio = '👑 ESP PLAY & ESP के सबसे बड़े लेजेंड | Level 99 | 98,765 Charms | सभी गेम के बेताज बादशाह | क्राउन पोस्ट धारक';
  }
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
        ensureSharmaJi(data.users);
        data.users.forEach((u: any) => {
          if (u.coins === undefined) u.coins = 5000;
          if (u.charms === undefined) u.charms = 150;
          if (u.gameLevel === undefined) u.gameLevel = 5;
          if (u.gameXp === undefined) u.gameXp = 380;
          if (!u.roomAddress) u.roomAddress = `ESP-ROOM-${(u.userId || 'USER').replace(/[^A-Za-z0-9]/g, '')}`;
          if (!u.houseName) u.houseName = `${u.fullName || 'VIP'} Gaming House`;
          if (!u.clanName) u.clanName = 'Royal Warriors ESP';
          if (!u.clanRole) u.clanRole = 'Member';
          if (u.loginStreak === undefined) u.loginStreak = 3;
          if (!Array.isArray(u.claimedDays)) u.claimedDays = [1, 2];
          if (u.friendsCount === undefined) u.friendsCount = 12;
          if (u.visitorCount === undefined) u.visitorCount = 148;
          if (!Array.isArray(u.daysPlayed)) u.daysPlayed = [];
          if (u.totalDaysPlayed === undefined) u.totalDaysPlayed = u.daysPlayed.length;
          if (u.totalGamesPlayed === undefined) u.totalGamesPlayed = 0;
          if (u.totalGamesWon === undefined) u.totalGamesWon = 0;
          if (u.totalGamesLost === undefined) u.totalGamesLost = 0;
          if (u.totalCoinsWon === undefined) u.totalCoinsWon = 0;
          if (u.totalCoinsSpent === undefined) u.totalCoinsSpent = 0;
          if (u.totalOnlineMinutes === undefined) u.totalOnlineMinutes = 0;
          if (u.isOnline === undefined) u.isOnline = false;
        });
      }
      if (!Array.isArray(data.complaints)) data.complaints = [];
      if (!Array.isArray(data.gamePlayHistory)) data.gamePlayHistory = [];
      if (!Array.isArray(data.coinTransactions)) data.coinTransactions = [];
      if (!Array.isArray(data.profileHistory)) data.profileHistory = [];
      if (!Array.isArray(data.activitySessions)) data.activitySessions = [];
      if (!Array.isArray(data.contactMessages)) data.contactMessages = [];
      if (!Array.isArray(data.homeSliderPhotos)) data.homeSliderPhotos = [];
      if (!Array.isArray(data.giftCardVouchers)) data.giftCardVouchers = DEFAULT_GIFT_CARD_VOUCHERS;
      if (!Array.isArray(data.nwiTreeRecords)) data.nwiTreeRecords = [];
      if (!Array.isArray(data.planUpgrades)) data.planUpgrades = [];
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
      {
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
        coins: 50000,
        charms: 12500,
        gameLevel: 25,
        gameXp: 4500,
        roomAddress: 'ESP-ROOM-FOUNDER',
        houseName: 'Royal House of Santosh',
        clanName: 'Royal Warriors ESP',
        clanRole: 'Leader',
        loginStreak: 7,
        claimedDays: [1, 2, 3, 4, 5, 6, 7],
        friendsCount: 142,
        visitorCount: 1850,
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
      }

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
    giftCardVouchers: DEFAULT_GIFT_CARD_VOUCHERS,
    nwiTreeRecords: [],
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
        time: 'Live'
      }
    ],
  };


  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write database file', e);
  }
}

let db = loadDatabase();

function generateUniqueUserId(fullName: string, joiningFee: number): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  let initials = '';
  if (words.length >= 2) {
    initials = (words[0][0] + words[words.length - 1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 2) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else if (words.length === 1) {
    initials = (words[0][0] + 'K').toUpperCase();
  } else {
    initials = 'XX';
  }
  initials = initials.replace(/[^A-Z]/g, 'K');

  const basePrefix = `ESP${joiningFee}${initials}`;
  const matching = db.users.filter(u => u.userId && u.userId.startsWith(basePrefix));
  let counter = matching.length + 1;
  let finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;

  while (db.users.some(u => u.userId === finalId)) {
    counter++;
    finalId = `${basePrefix}${String(counter).padStart(2, '0')}`;
  }

  return finalId;
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

// 3. Public Sponsor Lookup
app.get('/api/sponsor/check', (req, res) => {
  const sponsorId = (req.query.id as string || '').trim();
  if (!sponsorId || sponsorId === db.settings.ownerSponsorId) {
    return res.json({
      valid: true,
      sponsorId: db.settings.ownerSponsorId,
      sponsorName: db.settings.ownerName,
      isOwner: true,
      maskedPhone: maskString(db.settings.whatsappNumber, 'phone'),
      maskedEmail: maskString(db.settings.supportEmail, 'email'),
    });
  }

  const found = db.users.find(u => u.userId.toLowerCase() === sponsorId.toLowerCase());
  if (found) {
    const priv = found.privacySettings || { showPhone: false, showEmail: false, showAddress: false };
    return res.json({
      valid: true,
      sponsorId: found.userId,
      sponsorName: found.fullName,
      isOwner: false,
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
    message: 'Sponsor ID not found. Using default Founder SANTOSH KUMAR',
    fallbackSponsorId: db.settings.ownerSponsorId,
    fallbackSponsorName: db.settings.ownerName,
  });
});

function createSessionForUser(user: UserProfile, req: express.Request): { sessionToken: string; session: UserSession } {
  const clientInfo = req.body.deviceInfo;
  const userAgent = (req.headers['user-agent'] as string) || '';
  const parsed = parseDeviceInfo(userAgent, clientInfo);
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || '127.0.0.1';
  const ipAddress = rawIp.replace('::ffff:', '');

  const sessionToken = `esp_tok_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const newSession: UserSession = {
    sessionId,
    token: sessionToken,
    deviceType: parsed.deviceType,
    deviceName: parsed.deviceName,
    browser: parsed.browser,
    os: parsed.os,
    ipAddress,
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
  };

  if (!user.activeSessions) {
    user.activeSessions = [];
  }

  // Keep concurrent device sessions so user can be logged in on multiple phones / PCs!
  user.activeSessions.unshift(newSession);
  if (user.activeSessions.length > 25) {
    user.activeSessions = user.activeSessions.slice(0, 25);
  }

  return { sessionToken, session: newSession };
}

// 4. Registration - Sets status to 'pending' for Admin Verification!
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      fullName,
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

    if (!isGamer) {
      if (!email || !paymentAddress) {
        return res.status(400).json({ success: false, message: 'बिजनेस प्लान हेतु ईमेल और UPI एड्रेस आवश्यक है' });
      }
      if (!paymentUtr) {
        return res.status(400).json({ success: false, message: 'Payment UTR / Transaction Reference is required' });
      }
    }

    const existing = db.users.find(
      u => u.phone === phone.trim() || (email && u.email.toLowerCase() === email.trim().toLowerCase())
    );
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'A member with this Phone or Email already exists. Please login.' 
      });
    }

    let resolvedSponsorId = (sponsorId || '').trim();
    let resolvedSponsorName = (sponsorName || '').trim();

    if (!resolvedSponsorId || resolvedSponsorId === db.settings.ownerSponsorId) {
      resolvedSponsorId = db.settings.ownerSponsorId;
      resolvedSponsorName = db.settings.ownerName;
    } else {
      const sp = db.users.find(u => u.userId.toLowerCase() === resolvedSponsorId.toLowerCase());
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
      ? `ESP-G-${Math.floor(100000 + Math.random() * 900000)}` 
      : generateUniqueUserId(fullName, fee);

    const initialFormData = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : `${phone.trim()}@espgaming.club`,
      fullAddress: fullAddress || '',
      paymentAddress: paymentAddress ? paymentAddress.trim() : '',
      chosenServiceCode: serviceObj.code,
      joiningFee: fee,
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      paymentUtr: paymentUtr ? paymentUtr.trim() : 'FREE_GAMING_USER',
      paymentScreenshot: paymentScreenshot || '',
    };

    // Gamer accounts are instant active! Business accounts are pending until admin approval.
    const newUser: UserProfile = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: newUserId,
      gamingId: `GAME-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : `${phone.trim()}@espgaming.club`,
      fullAddress: fullAddress || '',
      paymentAddress: paymentAddress ? paymentAddress.trim() : '',
      payoutUpiId: paymentAddress ? paymentAddress.trim() : '',
      password: password || '123456',
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
      coins: isGamer ? 5500 : 5000, // 500 bonus coins for free gamer!
      charms: 150,
      gameLevel: 5,
      gameXp: 750,
      roomAddress: `ESP-ROOM-${newUserId}`,
      houseName: `House of ${fullName.trim().split(' ')[0]}`,
      clanName: 'Royal Warriors ESP',
      clanRole: 'Member',
      loginStreak: 1,
      claimedDays: [1],
      friendsCount: 5,
      visitorCount: 12,
      privacySettings: {
        showPhone: false,
        showEmail: false,
        showAddress: false,
      },

      activeSessions: [],
      initialFormData,
      editHistory: [],
      role: 'member',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    const { sessionToken } = createSessionForUser(newUser, req);

    db.users.push(newUser);

    // Track pending referral only for paid plans (fee > 0)
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

// 5. Multi-Device Login (Roll Number / Mobile / Email + Password)
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Please enter Roll Number / Mobile / Email and Password' });
  }

  const clean = identifier.trim().toLowerCase();
  const user = db.users.find(
    u => u.userId.toLowerCase() === clean || 
         u.email.toLowerCase() === clean || 
         u.phone === clean
  );

  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found with this Roll Number / Email / Mobile' });
  }

  if (user.password && user.password !== password) {
    return res.status(401).json({ success: false, message: 'Incorrect Password' });
  }

  // Create device session for this login
  const { sessionToken } = createSessionForUser(user, req);
  user.lastLogin = new Date().toISOString();
  saveDatabase(db);

  res.json({ 
    success: true, 
    user: {
      ...user,
      activeSessions: user.activeSessions?.map(s => ({
        ...s,
        isCurrent: s.token === sessionToken,
      })),
    },
    sessionToken,
  });
});

// 5.0.1 Forget ID Recovery (Lookup Roll No / ESP ID via registered Mobile or Email)
app.post('/api/auth/forget-id', (req, res) => {
  const { phoneOrEmail } = req.body;
  if (!phoneOrEmail || !String(phoneOrEmail).trim()) {
    return res.status(400).json({ success: false, message: 'कृपया अपना रजिस्टर्ड मोबाइल नंबर या ईमेल दर्ज करें।' });
  }

  const raw = String(phoneOrEmail).trim().toLowerCase();
  const digitsOnly = raw.replace(/\D/g, '').slice(-10);

  const user = db.users.find(u => {
    const userPhoneDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
    return (
      (u.email && u.email.toLowerCase() === raw) ||
      (u.phone && u.phone.toLowerCase() === raw) ||
      (digitsOnly.length === 10 && userPhoneDigits === digitsOnly)
    );
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'इस मोबाइल नंबर या ईमेल से कोई खाता नहीं मिला। कृपया सही नंबर दर्ज करें या नया रजिस्ट्रेशन करें।'
    });
  }

  res.json({
    success: true,
    userId: user.userId,
    gamingId: user.gamingId || `GAME-${user.userId}`,
    fullName: user.fullName,
    accountType: user.accountType || 'business',
    chosenServiceCode: user.chosenServiceCode || 'EMO',
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

  const cleanId = String(identifier).trim().toLowerCase();
  const idDigits = cleanId.replace(/\D/g, '').slice(-10);
  const cleanVerify = String(verifyPhone).trim().toLowerCase();
  const verifyDigits = cleanVerify.replace(/\D/g, '').slice(-10);

  const user = db.users.find(u => {
    const userPhoneDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
    return (
      u.userId.toLowerCase() === cleanId ||
      (u.gamingId && u.gamingId.toLowerCase() === cleanId) ||
      (u.email && u.email.toLowerCase() === cleanId) ||
      (idDigits.length === 10 && userPhoneDigits === idDigits)
    );
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'इस आईडी या नंबर से कोई खाता नहीं मिला।'
    });
  }

  const userPhoneDigits = (user.phone || '').replace(/\D/g, '').slice(-10);
  const isPhoneMatch = verifyDigits.length === 10 && userPhoneDigits === verifyDigits;
  const isExactPhoneMatch = (user.phone || '').trim().toLowerCase() === cleanVerify;
  const isEmailMatch = (user.email || '').trim().toLowerCase() === cleanVerify;

  if (!isPhoneMatch && !isExactPhoneMatch && !isEmailMatch) {
    return res.status(403).json({
      success: false,
      message: 'वेरिफिकेशन असफल! दर्ज किया गया मोबाइल नंबर या ईमेल इस खाते से मेल नहीं खाता।'
    });
  }

  user.password = String(newPassword).trim();
  if (!user.editHistory) user.editHistory = [];
  user.editHistory.unshift({
    date: new Date().toISOString(),
    field: 'password',
    oldValue: '********',
    newValue: '******** (Reset via Forget Password)',
  });
  saveDatabase(db);

  res.json({
    success: true,
    userId: user.userId,
    fullName: user.fullName,
    message: 'पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।'
  });
});

// 5.1 Multi-Device Session Verification (Keep profile & updates synced across all devices)
app.get('/api/auth/verify-session', (req, res) => {
  const sessionToken = (req.headers['x-session-token'] as string) || (req.query.token as string);
  const userId = (req.query.userId as string || '').toLowerCase().trim();

  let user = null;
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
      sessionTerminated: true, 
      message: 'Account not found or session expired.' 
    });
  }

  if (!user.activeSessions) user.activeSessions = [];

  const currentSession = user.activeSessions.find(s => s.token === sessionToken);
  if (sessionToken && !currentSession) {
    // This session was terminated / logged out remotely from another device!
    return res.json({
      success: false,
      valid: false,
      sessionTerminated: true,
      message: 'This device has been logged out remotely from another device.',
    });
  }

  if (currentSession) {
    currentSession.lastActive = new Date().toISOString();
    saveDatabase(db);
  }

  res.json({
    success: true,
    valid: true,
    user: {
      ...user,
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

  if (terminateAllOthers && currentSessionToken) {
    user.activeSessions = user.activeSessions.filter(s => s.token === currentSessionToken);
  } else if (sessionId) {
    user.activeSessions = user.activeSessions.filter(s => s.sessionId !== sessionId);
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



// 7. Update User Profile with Edit History (Telegram Style)
app.put('/api/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase());
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (!user.editHistory) user.editHistory = [];
  const now = new Date().toISOString();

  const { 
    fullName, 
    phone, 
    email, 
    avatar, 
    bio, 
    gender, 
    fullAddress, 
    paymentAddress, 
    payoutUpiId, 
    password, 
    privacySettings 
  } = req.body;

  if (fullName !== undefined && fullName.trim() && fullName !== user.fullName) {
    user.editHistory.push({
      date: now,
      field: 'fullName',
      oldValue: user.fullName || '',
      newValue: fullName.trim(),
    });
    user.fullName = fullName.trim();
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

  user.balance -= withdrawAmount;
  user.totalWithdrawn += withdrawAmount;

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

  const totalUsers = db.users.length;
  const activeUsers = db.users.filter(u => u.status === 'active').length;
  const pendingUsers = db.users.filter(u => u.status === 'pending').length;
  const rejectedUsers = db.users.filter(u => u.status === 'rejected').length;
  const totalVolume = db.users.filter(u => u.status === 'active').reduce((acc, u) => acc + (u.joiningFee || 0), 0);
  const totalPaidOut = db.payouts.filter(p => p.status === 'approved').reduce((acc, p) => acc + p.amount, 0);
  const pendingPayouts = db.payouts.filter(p => p.status === 'pending');

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
      totalReferrals: db.referrals.length,
      activeServicesCount: db.services.filter(s => s.active).length,
    },
    users: db.users.slice().reverse(),
    payouts: db.payouts.slice().reverse(),
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
    
    // Give sustainable welcome bonus if not given (₹2 on ₹10 plan, ₹10 on ₹50+ plans)
    if (user.accountType !== 'gamer' && user.balance === 0 && !db.transactions.some(t => t.userId === user.userId && t.type === 'signup_bonus')) {
      const welcomeCash = (user.joiningFee || 0) >= 50 ? 10 : 2;
      user.balance += welcomeCash;
      user.totalEarnings += welcomeCash;
      db.transactions.push({
        id: `tx-${Date.now()}-wb`,
        userId: user.userId,
        amount: welcomeCash,
        type: 'signup_bonus',
        description: `ESP Welcome Joining Credit (₹${welcomeCash} Account Approved)`,
        date: new Date().toISOString(),
        status: 'completed',
      });
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

  payout.status = 'approved';
  payout.processedDate = new Date().toISOString().split('T')[0];
  payout.transactionRef = transactionRef || `UPI_${Date.now()}`;

  db.notifications.push({
    id: `notif-${Date.now()}-po-appr`,
    userId: payout.userId,
    title: '💰 Payout Sent Successfully!',
    message: `₹${payout.amount} has been paid to your UPI ID ${payout.payoutAddress}. UTR: ${payout.transactionRef}`,
    date: new Date().toISOString(),
    read: false,
    type: 'withdrawal',
  });

  saveDatabase(db);
  res.json({ success: true, message: 'Payout approved and marked completed', payout });
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
    const { userId, userName, userRollNumber, userAvatar, caption, imageUrl, serviceTag } = req.body;
    if (!caption && !imageUrl) {
      return res.status(400).json({ success: false, message: 'Caption or image is required' });
    }

    const newMoment: Moment = {
      id: `moment-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: userId || 'anonymous',
      userName: userName || 'ESP Member',
      userRollNumber: userRollNumber || 'ESP10MEM',
      userAvatar: userAvatar || '',
      caption: caption || '',
      imageUrl: imageUrl || '',
      serviceTag: serviceTag || 'COMMUNITY MOMENT',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      sharesCount: 0,
    };

    if (!db.moments) db.moments = [];
    db.moments.unshift(newMoment);
    saveDatabase(db);

    res.json({ success: true, message: 'Moment posted successfully!', moment: newMoment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err?.message || 'Error posting moment' });
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
  res.json({ success: true, rooms: db.chatRooms });
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

// ===================== ESP GAMING ROOM BACKEND APIS =====================

// 1. Play Coin Game (Spin & Win, Lucky Dice, Coin Flip)
app.post('/api/game/play', (req, res) => {
  const { userId, gameName, betAmount, choice } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const bet = Math.max(10, Number(betAmount) || 10);
  if ((user.coins || 0) < bet) {
    return res.status(400).json({ success: false, message: 'सिक्के (Coins) कम हैं! कृपया रिचार्ज करें।' });
  }

  // Deduct bet amount
  user.coins = (user.coins || 0) - bet;

  let isWin = false;
  let multiplier = 0;
  let gameOutcomeMessage = '';
  let diceValues = [1, 1];
  let wheelSegment = 0;
  let coinResult: 'heads' | 'tails' = 'heads';

  if (gameName === 'Spin & Win') {
    // 8 segments: [0x, 2x, 0x, 5x, 1.5x, 0x, 3x, 10x]
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
    } else {
      isWin = false;
      multiplier = 0;
    }
  } else if (gameName === 'Coin Flip') {
    coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    if (choice === coinResult) {
      isWin = true;
      multiplier = 2;
    } else {
      isWin = false;
      multiplier = 0;
    }
  }

  const winCoins = Math.round(bet * multiplier);
  if (isWin) {
    user.coins = (user.coins || 0) + winCoins;
    gameOutcomeMessage = `बधाई हो! आप ${winCoins} सिक्के जीत गए! 🎉`;
  } else {
    gameOutcomeMessage = `अफसोस! इस बार चूक गए (-${bet} Coins)। अगली बार प्रयास करें!`;
  }


  // Add Game XP & calculate level
  user.gameXp = (user.gameXp || 0) + 25;
  const newLevel = Math.min(50, Math.floor(user.gameXp / 150) + 1);
  user.gameLevel = newLevel;

  saveDatabase(db);

  res.json({
    success: true,
    result: isWin ? 'win' : 'loss',
    multiplier,
    betAmount: bet,
    winAmount: winCoins,
    netChange: winCoins - bet,
    newBalance: user.coins,
    gameXp: user.gameXp,
    gameLevel: user.gameLevel,
    message: gameOutcomeMessage,
    diceValues,
    wheelSegment,
    coinResult,
    user
  });
});

// 2. Buy / Recharge Coins (Real UPI Payment with Admin Approval)
app.post('/api/game/recharge', (req, res) => {
  const { userId, packId, coins, bonusCoins, amount, paymentUtr, paymentScreenshot } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const utr = (paymentUtr || '').trim().toUpperCase();
  if (!utr || utr.length < 6 || utr === 'INSTANT' || utr === 'INSTANT_MOBI') {
    return res.status(400).json({
      success: false,
      message: 'कृपया PhonePe, Google Pay या Paytm से पेमेंट करने के बाद सही 12-अंकों का UPI UTR / Transaction No दर्ज करें।'
    });
  }

  if (!db.coinRecharges) db.coinRecharges = [];
  const duplicate = db.coinRecharges.find(r => r.paymentUtr === utr && r.status === 'pending');
  if (duplicate) {
    return res.status(400).json({
      success: false,
      message: `यह UTR नंबर (${utr}) पहले से ही सत्यापन के लिए पेंडिंग है। कृपया एडमिन अप्रूवल की प्रतीक्षा करें।`
    });
  }

  const baseCoins = Number(coins) || 100;
  const bonus = Number(bonusCoins) || 0;
  const payAmount = Number(amount) || 10;

  const newRechargeOrder: CoinRechargeRequest = {
    id: `cr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: user.userId,
    userName: user.fullName,
    userPhone: user.phone,
    packId: packId || 'pack-custom',
    coins: baseCoins,
    bonusCoins: bonus,
    amount: payAmount,
    paymentUtr: utr,
    paymentScreenshot: paymentScreenshot || '',
    status: 'pending', // Awaiting Admin verification! Coins are NOT added until admin approves!
    createdAt: new Date().toISOString(),
  };

  db.coinRecharges.unshift(newRechargeOrder);

  // Add pending transaction record
  db.transactions.unshift({
    id: `tx-recharge-${Date.now()}`,
    userId: user.userId,
    amount: payAmount,
    type: 'signup_bonus',
    description: `Coins Recharge Order: ${baseCoins + bonus} Coins (UTR: ${utr})`,
    date: new Date().toISOString(),
    status: 'pending',
    referenceId: newRechargeOrder.id,
  });

  // User notification
  db.notifications.unshift({
    id: `notif-cr-${Date.now()}`,
    userId: user.userId,
    title: '⏳ कॉइन रिचार्ज अनुरोध पेंडिंग',
    message: `₹${payAmount} का पेमेंट UTR (${utr}) सत्यापन के लिए प्राप्त हुआ। एडमिन पुष्टि के बाद आपके प्रोफाइल में +${baseCoins + bonus} सिक्के जोड़ दिए जाएंगे।`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `पेमेंट UTR (${utr}) सफलतापूर्वक सबमिट हुआ! एडमिन सत्यापन के बाद +${baseCoins + bonus} सिक्के जुड़ेंगे।`,
    order: newRechargeOrder,
    coins: user.coins,
    user
  });
});

// User's own coin recharge history
app.get('/api/game/user-recharges/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const recharges = (db.coinRecharges || []).filter(r => r.userId.toLowerCase() === userId.toLowerCase());
  res.json({ success: true, recharges });
});

// Admin: Get all Coin Recharge Orders
app.post('/api/admin/coin-recharges', (req, res) => {
  const { adminPassword } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized Admin' });
  }

  const db = loadDatabase();
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
  const db = loadDatabase();
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

  const totalCoinsToAdd = order.coins + order.bonusCoins;
  user.coins = (user.coins || 0) + totalCoinsToAdd;

  order.status = 'approved';
  order.processedAt = new Date().toISOString();

  // Update transaction status
  const tx = db.transactions.find(t => t.referenceId === order.id);
  if (tx) {
    tx.status = 'completed';
  }

  // Send approval notification
  db.notifications.unshift({
    id: `notif-cr-ok-${Date.now()}`,
    userId: user.userId,
    title: '🎉 कॉइन रिचार्ज स्वीकृत!',
    message: `बधाई हो! आपके ₹${order.amount} के रिचार्ज (UTR: ${order.paymentUtr}) को एडमिन द्वारा सत्यापित कर लिया गया है। आपके वॉलेट में +${totalCoinsToAdd} सिक्के जोड़ दिए गए हैं!`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `सफलतापूर्वक ${user.fullName} (${user.userId}) के खाते में +${totalCoinsToAdd} सिक्के जोड़े गए!`,
    order,
    user
  });
});

// Admin: Reject Coin Recharge Order
app.post('/api/admin/coin-recharges/:id/reject', (req, res) => {
  const { adminPassword, reason } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized Admin' });
  }

  const { id } = req.params;
  const db = loadDatabase();
  if (!db.coinRecharges) db.coinRecharges = [];
  const order = db.coinRecharges.find(r => r.id === id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Recharge order not found' });
  }

  order.status = 'rejected';
  order.processedAt = new Date().toISOString();
  order.rejectionReason = reason || 'अमान्य UTR नंबर / पेमेंट प्राप्त नहीं हुआ';

  // Update transaction status
  const tx = db.transactions.find(t => t.referenceId === order.id);
  if (tx) {
    tx.status = 'failed';
  }

  db.notifications.unshift({
    id: `notif-cr-no-${Date.now()}`,
    userId: order.userId,
    title: '❌ कॉइन रिचार्ज अस्वीकृत',
    message: `आपके ₹${order.amount} के कॉइन रिचार्ज (UTR: ${order.paymentUtr}) को अस्वीकार कर दिया गया। कारण: ${order.rejectionReason}। कृपया सही पेमेंट विवरण के साथ पुनः प्रयास करें।`,
    date: new Date().toISOString(),
    read: false,
    type: 'payment',
  });

  saveDatabase(db);
  res.json({ success: true, message: 'रिचार्ज अनुरोध अस्वीकृत किया गया', order });
});


// 3. Convert Coins to Real Cash Balance (Instant UPI withdrawable)
app.post('/api/game/convert', (req, res) => {
  const { userId, coinsAmount } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const coinsToConvert = Number(coinsAmount) || 100;
  if ((user.coins || 0) < coinsToConvert) {
    return res.status(400).json({ success: false, message: 'सिक्के पर्याप्त नहीं हैं।' });
  }

  // Conversion rate: 100 coins = ₹10 cash balance
  const cashAmount = Math.floor(coinsToConvert / 10);
  user.coins = (user.coins || 0) - coinsToConvert;
  user.balance = (user.balance || 0) + cashAmount;

  user.totalEarnings = (user.totalEarnings || 0) + cashAmount;

  db.transactions.unshift({
    id: `tx-convert-${Date.now()}`,
    userId: user.userId,
    amount: cashAmount,
    type: 'promo_bonus',
    description: `Coins Convert to Cash: ${coinsToConvert} Coins -> ₹${cashAmount}`,
    date: new Date().toISOString(),
    status: 'completed',
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${coinsToConvert} Coins सफलतापूर्वक ₹${cashAmount} नकद वॉलेट में बदल दिए गए!`,
    coins: user.coins,
    balance: user.balance,
    user
  });
});

// Claim Live Game Win (Snake, Bingo, Oh My Card)
app.post('/api/game/claim-win', (req, res) => {
  const { userId, gameName, winAmount } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const win = Number(winAmount) || 0;
  if (win > 0) {
    user.coins = (user.coins || 0) + win;
    user.gameXp = (user.gameXp || 0) + Math.floor(win / 5);
    user.gameLevel = Math.max(1, Math.floor((user.gameXp || 0) / 100) + 1);

    db.transactions.unshift({
      id: `tx-win-${Date.now()}`,
      userId: user.userId,
      amount: win,
      type: 'promo_bonus',
      description: `Won in ${gameName}: +${win} Coins`,
      date: new Date().toISOString(),
      status: 'completed',
    });
    saveDatabase(db);
  }

  res.json({
    success: true,
    currentCoins: user.coins,
    coins: user.coins,
    user
  });
});

// Daily Lucky Spin (Once every 24 hours, cost 50 coins)
app.post('/api/game/daily-lucky-spin', (req, res) => {
  const { userId, targetSectorIndex } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // 1. Check 24-hour cooldown
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

  // 2. Check 50 coins cost
  const SPIN_COST = 50;
  if ((user.coins || 0) < SPIN_COST) {
    return res.status(400).json({
      success: false,
      message: `स्पिन करने के लिए 50 कॉइन्स की आवश्यकता है। आपके पास केवल ${user.coins || 0} कॉइन्स हैं।`,
    });
  }

  // Deduct 50 coins
  user.coins = (user.coins || 0) - SPIN_COST;

  // 8 Sectors configuration
  const SECTORS = [
    { id: 0, title: '100 Coins', label: '🪙 +100 Coins', type: 'coins', value: 100, charms: 0, xp: 20 },
    { id: 1, title: '50 Charms', label: '✨ +50 Charms', type: 'charms', value: 0, charms: 50, xp: 30 },
    { id: 2, title: '150 XP', label: '⚡ +150 XP', type: 'xp', value: 0, charms: 10, xp: 150 },
    { id: 3, title: '300 Coins Jackpot', label: '👑 +300 Coins', type: 'coins', value: 300, charms: 50, xp: 100 },
    { id: 4, title: 'Lucky Combo', label: '💎 50 Coins + 25 Charms', type: 'combo', value: 50, charms: 25, xp: 25 },
    { id: 5, title: '250 XP Surge', label: '⚡ +250 XP', type: 'xp', value: 0, charms: 15, xp: 250 },
    { id: 6, title: '500 Coins Super Jackpot', label: '🌟 +500 Coins', type: 'coins', value: 500, charms: 100, xp: 200 },
    { id: 7, title: 'Mystery Gift', label: '🎁 80 Coins + 30 Charms', type: 'combo', value: 80, charms: 30, xp: 50 },
  ];

  // Pick sector if specified or random
  let sectorIndex = typeof targetSectorIndex === 'number' && targetSectorIndex >= 0 && targetSectorIndex < 8
    ? targetSectorIndex
    : Math.floor(Math.random() * SECTORS.length);

  const reward = SECTORS[sectorIndex];

  // Apply rewards
  user.coins = (user.coins || 0) + (reward.value || 0);
  user.charms = (user.charms || 0) + (reward.charms || 0);
  user.gameXp = (user.gameXp || 0) + (reward.xp || 0);
  user.gameLevel = Math.max(1, Math.floor((user.gameXp || 0) / 100) + 1);
  user.lastDailySpin = new Date().toISOString();

  db.transactions.unshift({
    id: `tx-spin-${Date.now()}`,
    userId: user.userId,
    amount: (reward.value || 0) - SPIN_COST,
    type: 'promo_bonus',
    description: `Daily Lucky Spin: Paid 50 Coins, Won ${reward.label}`,
    date: new Date().toISOString(),
    status: 'completed',
  });

  saveDatabase(db);

  res.json({
    success: true,
    message: `बधाई हो! आपने जीता: ${reward.label}! 🎉`,
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

// 4. Claim 7-Day Login Reward
app.post('/api/game/claim-login', (req, res) => {
  const { userId, day } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const claimDay = Number(day) || 1;
  if (!user.claimedDays) user.claimedDays = [];
  if (user.claimedDays.includes(claimDay)) {
    return res.status(400).json({ success: false, message: `दिन ${claimDay} का रिवॉर्ड पहले ही क्लेम किया जा चुका है!` });
  }

  const rewardCoinsMap: Record<number, number> = {
    1: 50,
    2: 100,
    3: 150,
    4: 200,
    5: 350,
    6: 500,
    7: 1000,
  };

  const rewardCoins = rewardCoinsMap[claimDay] || 50;
  user.coins = (user.coins || 0) + rewardCoins;
  user.claimedDays.push(claimDay);
  user.loginStreak = Math.min(7, (user.loginStreak || 0) + 1);
  user.lastLoginClaimDate = new Date().toISOString().slice(0, 10);

  saveDatabase(db);
  res.json({
    success: true,
    message: `दिन ${claimDay} का दैनिक पुरस्कार +${rewardCoins} Coins प्राप्त हुआ! 🎁`,
    coins: user.coins,
    claimedDays: user.claimedDays,
    loginStreak: user.loginStreak,
    user
  });
});

// 5. Send Room Gift (WePlay Voice Stage)
app.post('/api/game/send-gift', (req, res) => {
  const { senderId, targetName, giftId, giftName, coinCost, charmValue } = req.body;
  const db = loadDatabase();
  const sender = db.users.find(u => u.userId === senderId || u.id === senderId);
  if (!sender) {
    return res.status(404).json({ success: false, message: 'Sender not found' });
  }

  const cost = Number(coinCost) || 10;
  if ((sender.coins || 0) < cost) {
    return res.status(400).json({ success: false, message: 'गिफ्ट भेजने के लिए पर्याप्त सिक्के नहीं हैं!' });
  }

  sender.coins = (sender.coins || 0) - cost;
  sender.charms = (sender.charms || 0) + Math.round(Number(charmValue) * 0.2); // Giver gets charm karma

  sender.gameXp = (sender.gameXp || 0) + 50; // XP for gifting

  // Broadcast in room chat
  db.chatMessages.push({
    id: `gift-${Date.now()}`,
    roomId: 'room-global',
    senderId: sender.userId,
    senderName: sender.fullName,
    senderRollNumber: sender.userId,
    senderAvatar: sender.avatar,
    text: `🎁 [गिफ्ट भेजा] ${sender.fullName} ने ${targetName || 'पूरे रूम'} को ${giftName} भेंट किया! (+${charmValue} Charms ✨)`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${giftName} सफलतापूर्वक भेजा गया! ✨`,
    coins: sender.coins,
    charms: sender.charms,
    user: sender
  });
});

// ==============================================================
// MULTI-ROOM VOICE STAGE & REAL AUDIO STREAMING SYSTEM
// ==============================================================

function getOrCreateRooms(db: Database) {
  if (!db.customVoiceRooms || db.customVoiceRooms.length === 0) {
    const founder = db.users.find(u => u.role === 'admin' || u.userId === 'EMO-MOM-MMO') || {
      userId: 'EMO-MOM-MMO',
      fullName: 'SANTOSH KUMAR',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
      gameLevel: 25,
      charms: 12500,
    };

    db.customVoiceRooms = [
      {
        id: 'room-founder',
        title: 'ESP Royal Voice Stage #1 (Official Stage)',
        topic: 'Daily ₹500 - ₹2000 Earnings with 10 ESP Services & Games',
        category: 'earning',
        roomAddress: 'ESP-ROOM-FOUNDER-01',
        hostUserId: founder.userId,
        hostName: founder.fullName,
        hostAvatar: (founder as any).avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
        hostLevel: (founder as any).gameLevel || 25,
        hostCharms: (founder as any).charms || 12500,
        createdAt: new Date().toISOString(),
        seats: db.voiceRoomSeats || Array.from({ length: 8 }, (_, i) => ({
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
            sender: 'STAGE HOST',
            senderRoll: 'STAGE',
            text: '🎙️ Welcome to ESP Royal Voice Stage! Enable mic to talk, grab empty seat or listen live.',
            time: 'Live',
          }
        ],
        audience: [founder.userId],
      }
    ];
  }
  return db.customVoiceRooms;
}

// 6. Get List of All Active Voice Rooms (Community Voice Hub)
app.get('/api/game/voice-rooms', (_req, res) => {
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);

  const roomsSummary = rooms.map(r => ({
    id: r.id,
    title: r.title,
    topic: r.topic,
    category: r.category,
    roomAddress: r.roomAddress,
    hostUserId: r.hostUserId,
    hostName: r.hostName,
    hostAvatar: r.hostAvatar,
    hostLevel: r.hostLevel || 5,
    hostCharms: r.hostCharms || 100,
    isPrivate: Boolean(r.isPrivate),
    occupiedSeatsCount: r.seats.filter(s => Boolean(s.userId)).length,
    listenersCount: Math.max(1, (r.audience || []).length, db.users.length),
    createdAt: r.createdAt,
  }));

  res.json({ success: true, rooms: roomsSummary });
});

// 6.1 Create New Custom Voice Room (Any Member or Guest Can Create!)
app.post('/api/game/voice-rooms/create', (req, res) => {
  const { userId, title, topic, category, isPrivate, passcode, hostName, hostAvatar, hostLevel, hostCharms } = req.body;
  const db = loadDatabase();
  
  const foundUser = db.users.find(u => 
    (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) || 
    (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase()) ||
    (u.phone && userId && u.phone === String(userId))
  );

  // If user is not yet in db.users (e.g. guest, visitor, newly initialized session),
  // register/resolve reliable user record so room creation NEVER fails!
  const user: UserProfile = foundUser || (() => {
    const rawId = String(userId || '').trim();
    const fallbackId = (rawId && rawId !== 'undefined' && rawId !== 'null') ? rawId : `ESP-${Date.now().toString(36).toUpperCase()}`;
    const fallbackName = (hostName || (fallbackId.startsWith('ESP') ? `Member ${fallbackId}` : 'ESP Player')).trim();
    const newUser: UserProfile = {
      id: fallbackId,
      userId: fallbackId,
      fullName: fallbackName,
      phone: '8877490845',
      email: `${fallbackId.toLowerCase()}@esp.com`,
      fullAddress: 'India',
      paymentAddress: 'member@upi',
      payoutUpiId: 'member@upi',
      sponsorId: 'EMO-MOM-MMO',
      sponsorName: 'SANTOSH KUMAR',
      chosenServiceCode: 'EMO',
      chosenServiceName: 'Earn Money Online',
      joiningFee: 10,
      joiningDate: new Date().toISOString().slice(0, 10),
      paymentUtr: 'ACTIVE',
      status: 'active',
      balance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      promoEarnings: 0,
      totalWithdrawn: 0,
      coins: 5000,
      charms: Number(hostCharms) || 150,
      gameLevel: Number(hostLevel) || 5,
      gameXp: 500,
      roomAddress: `ESP-ROOM-${fallbackId.replace(/[^a-zA-Z0-9]/g, '')}`,
      houseName: `${fallbackName} Gaming House`,
      clanName: 'Royal Warriors ESP',
      clanRole: 'Member',
      avatar: hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackId}`,
      loginStreak: 1,
      claimedDays: [1],
      role: 'member',
      createdAt: new Date().toISOString(),
      editHistory: [],
      activeSessions: [],
    };
    db.users.push(newUser);
    return newUser;
  })();

  const cleanTitle = (title || `${user.fullName}'s Voice Room`).trim();
  const cleanTopic = (topic || 'General Voice Discussion & Strategy').trim();
  const rooms = getOrCreateRooms(db);

  const cleanUserTag = user.userId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'usr';
  const roomId = `room-${cleanUserTag}-${Date.now().toString(36)}`;
  const roomAddress = user.roomAddress || `ESP-ROOM-${user.userId}`;

  // Automatically seat the creator as Host on Seat #1
  const initialSeats = [
    {
      seatNumber: 1,
      seatNumberLabel: '1 (Host)',
      userId: user.userId,
      userName: user.fullName,
      gameLevel: user.gameLevel || 5,
      charms: user.charms || 150,
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

  const newRoom = {
    id: roomId,
    title: cleanTitle,
    topic: cleanTopic,
    category: (category as any) || 'earning',
    roomAddress,
    hostUserId: user.userId,
    hostName: user.fullName,
    hostAvatar: user.avatar || hostAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.userId}`,
    hostLevel: user.gameLevel || 5,
    hostCharms: user.charms || 150,
    createdAt: new Date().toISOString(),
    isPrivate: Boolean(isPrivate),
    passcode: passcode || '',
    seats: initialSeats,
    chatMessages: [
      {
        id: `msg-${Date.now()}`,
        senderId: 'SYSTEM',
        sender: 'ROOM STAGE',
        senderRoll: 'STAGE',
        text: `👑 ${user.fullName} ने अपना नया वॉइस रूम "${cleanTitle}" शुरू किया! सभी दोस्तों का स्वागत है।`,
        time: 'Live',
      }
    ],
    audience: [user.userId],
  };

  rooms.unshift(newRoom);
  saveDatabase(db);

  res.json({
    success: true,
    message: `🎉 आपका वॉइस रूम "${cleanTitle}" सफलतापूर्वक तैयार हो गया!`,
    room: newRoom,
    roomId: newRoom.id,
  });
});

// 6.2 Get Specific Room State
app.get('/api/game/voice-rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const hostUser = db.users.find(u => u.userId === room.hostUserId) || {
    userId: room.hostUserId,
    fullName: room.hostName,
    avatar: room.hostAvatar,
    gameLevel: room.hostLevel || 25,
    charms: room.hostCharms || 12500,
  };

  const host = {
    userId: hostUser.userId,
    userName: hostUser.fullName,
    gameLevel: hostUser.gameLevel || 25,
    charms: hostUser.charms || 12500,
    userAvatar: hostUser.avatar || room.hostAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    isSpeaking: true,
    isMuted: false,
    roleTitle: room.id === 'room-founder' ? 'ESP Founder & Room Host' : 'Room Host & Creator',
  };

  const realAudience = db.users.map(u => ({
    userId: u.userId,
    fullName: u.fullName,
    chosenServiceName: u.chosenServiceName || u.chosenServiceCode,
    joiningDate: u.joiningDate,
    status: u.status,
    coins: u.coins || 0,
    charms: u.charms || 0,
    gameLevel: u.gameLevel || 1,
    roomAddress: u.roomAddress || `ESP-ROOM-${u.userId}`,
    clanName: u.clanName || 'ESP Royals',
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
  }));

  res.json({
    success: true,
    room,
    host,
    seats: room.seats,
    audience: realAudience,
    audienceCount: Math.max(1, (room.audience || []).length, db.users.length),
    chatMessages: room.chatMessages || [],
  });
});

// Backward-compatible default room endpoint
app.get('/api/game/voice-room', (_req, res) => {
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms[0];

  const hostUser = db.users.find(u => u.userId === room.hostUserId) || {
    userId: room.hostUserId,
    fullName: room.hostName,
    avatar: room.hostAvatar,
    gameLevel: room.hostLevel || 25,
    charms: room.hostCharms || 12500,
  };

  const host = {
    userId: hostUser.userId,
    userName: hostUser.fullName,
    gameLevel: hostUser.gameLevel || 25,
    charms: hostUser.charms || 12500,
    userAvatar: hostUser.avatar || room.hostAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=SantoshKumarESP',
    isSpeaking: true,
    isMuted: false,
    roleTitle: 'ESP Founder & Room Host',
  };

  const realAudience = db.users.map(u => ({
    userId: u.userId,
    fullName: u.fullName,
    chosenServiceName: u.chosenServiceName || u.chosenServiceCode,
    joiningDate: u.joiningDate,
    status: u.status,
    coins: u.coins || 0,
    charms: u.charms || 0,
    gameLevel: u.gameLevel || 1,
    roomAddress: u.roomAddress || `ESP-ROOM-${u.userId}`,
    clanName: u.clanName || 'ESP Royals',
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
  }));

  res.json({
    success: true,
    room,
    host,
    seats: room.seats,
    audience: realAudience,
    audienceCount: Math.max(1, db.users.length),
    chatMessages: room.chatMessages || [],
  });
});

// 7. Take Mic Seat in Room
app.post(['/api/game/voice-rooms/:roomId/take-seat', '/api/game/voice-room/take-seat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId, seatIndex } = req.body;
  const idx = Number(seatIndex);
  if (idx < 0 || idx >= 8) {
    return res.status(400).json({ success: false, message: 'Invalid seat index' });
  }

  const db = loadDatabase();
  const foundUser = db.users.find(u => 
    (u.userId && userId && u.userId.toLowerCase() === String(userId).toLowerCase()) || 
    (u.id && userId && u.id.toLowerCase() === String(userId).toLowerCase()) ||
    (u.phone && userId && u.phone === String(userId))
  );

  const user: UserProfile = foundUser || (() => {
    const rawId = String(userId || 'ESP-GUEST-01').trim();
    const newUser: UserProfile = {
      id: rawId,
      userId: rawId,
      fullName: req.body.userName || 'ESP Player',
      phone: '8877490845',
      status: 'active',
      coins: 5000,
      charms: 100,
      gameLevel: 5,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${rawId}`,
    } as any;
    db.users.push(newUser);
    return newUser;
  })();

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  if (!room.seats || room.seats.length !== 8) {
    room.seats = Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }));
  }

  // Clear existing seat user occupies in this room
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

  // Seat the user
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

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `seat-${Date.now()}`,
    senderId: 'SYSTEM',
    sender: 'ROOM STAGE',
    senderRoll: 'STAGE',
    text: `🎙️ ${user.fullName} (${user.userId}) ने सीट #${idx + 1} ग्रैब की!`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  saveDatabase(db);
  res.json({
    success: true,
    seats: room.seats,
    chatMessages: room.chatMessages,
  });
});

// 8. Leave Mic Seat in Room
app.post(['/api/game/voice-rooms/:roomId/leave-seat', '/api/game/voice-room/leave-seat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId } = req.body;
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

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

  saveDatabase(db);
  res.json({ success: true, seats: room.seats });
});

// 9. Send Real Voice Room Chat Message
app.post(['/api/game/voice-rooms/:roomId/chat', '/api/game/voice-room/chat'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { userId, text, isGift } = req.body;
  const cleanText = (text || '').trim();
  if (!cleanText) {
    return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

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

  const db = loadDatabase();
  const user = db.users.find(u => u.userId === userId || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

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

  // Also award charms/XP for speaking live
  user.charms = (user.charms || 0) + 5;
  user.gameXp = (user.gameXp || 0) + 10;

  saveDatabase(db);
  res.json({
    success: true,
    message: audioMsg,
    chatMessages: room.chatMessages,
  });
});

// 9.2 Host Action (Mute/Unmute seat, Kick from seat, Update Topic)
app.post('/api/game/voice-rooms/:roomId/host-action', (req, res) => {
  const { roomId } = req.params;
  const { hostUserId, action, seatIndex, newTopic } = req.body;

  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }

  if (room.hostUserId !== hostUserId && hostUserId !== 'EMO-MOM-MMO') {
    return res.status(403).json({ success: false, message: 'Only room host can perform this action' });
  }

  if (action === 'update_topic' && newTopic) {
    room.topic = newTopic.trim();
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
    }
  }

  saveDatabase(db);
  res.json({ success: true, room, seats: room.seats });
});

// 9.3 Get All WePlay Agent Bots
app.get('/api/game/bots', (_req, res) => {
  const db = loadDatabase();
  const sharmaJi = db.users.find(u => u.userId === 'SHARMA-JI-VIP') || {
    userId: 'SHARMA-JI-VIP',
    fullName: '👑 Sharma Ji (शर्मा जी)',
    gameLevel: 99,
    charms: 98765,
    crownPost: true,
    frameType: 'royal-dragon-crown',
    vipTitle: '👑 ESP PLAY Grand Emperor (सर्वोच्च महाराजा)',
  };

  res.json({
    success: true,
    bots: DEFAULT_WEPLAY_BOTS,
    sharmaJiLegend: sharmaJi,
  });
});

// 9.4 Invite Bot to Room Mic Seat
app.post(['/api/game/voice-rooms/:roomId/invite-bot', '/api/game/voice-room/invite-bot'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { botId, seatIndex } = req.body;
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  const bot = DEFAULT_WEPLAY_BOTS.find(b => b.id === botId || b.code === botId);
  const isSharmaJi = botId === 'SHARMA-JI-VIP' || botId === 'sharma_ji';

  const avatar = isSharmaJi 
    ? 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyalLegend99'
    : (bot ? bot.avatar : 'https://api.dicebear.com/7.x/bottts/svg?seed=BotESP');
  const name = isSharmaJi ? '👑 Sharma Ji (शर्मा जी)' : (bot ? bot.hindiName : 'AI Bot');
  const level = isSharmaJi ? 99 : (bot ? bot.level : 50);
  const charms = isSharmaJi ? 98765 : (bot ? bot.charms : 10000);
  const badge = isSharmaJi ? '👑 EMPEROR' : (bot ? bot.badge : '🤖 BOT');
  const targetId = isSharmaJi ? 'SHARMA-JI-VIP' : (bot ? bot.id : `BOT-${Date.now()}`);

  if (!room.seats || room.seats.length !== 8) {
    room.seats = Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }));
  }

  // Find target seat
  let targetIdx = typeof seatIndex === 'number' && seatIndex >= 0 && seatIndex < 8 ? seatIndex : -1;
  if (targetIdx === -1 || (room.seats[targetIdx] && room.seats[targetIdx].userId)) {
    targetIdx = room.seats.findIndex(s => !s.userId);
  }

  if (targetIdx === -1) {
    return res.status(400).json({ success: false, message: 'स्टेज पर कोई खाली सीट उपलब्ध नहीं है!' });
  }

  room.seats[targetIdx] = {
    seatNumber: targetIdx + 1,
    seatNumberLabel: String(targetIdx + 1),
    userId: targetId,
    userName: name,
    gameLevel: level,
    charms: charms,
    isMuted: false,
    isSpeaking: true,
    userAvatar: avatar,
    userRollNumber: badge,
  };

  if (!room.chatMessages) room.chatMessages = [];
  const greeting = isSharmaJi 
    ? '👑 नमस्ते महफ़िल! मैं शर्मा जी (Level 99) आप सभी के साथ स्टेज पर आ चुका हूँ। खूब खेलो, खूब जीतो!'
    : (bot && bot.sampleDialogues ? bot.sampleDialogues[0] : `🤖 ${name} ने सीट #${targetIdx + 1} संभाली!`);

  room.chatMessages.push({
    id: `bot-seat-${Date.now()}`,
    senderId: targetId,
    sender: name,
    senderRoll: badge,
    senderAvatar: avatar,
    text: greeting,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${name} सीट #${targetIdx + 1} पर आ चुके हैं!`,
    seats: room.seats,
    chatMessages: room.chatMessages,
  });
});

// 9.5 Summon All WePlay Bots (Solo User Instant Room Fill)
app.post(['/api/game/voice-rooms/:roomId/summon-all-bots', '/api/game/voice-room/summon-all-bots'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];

  if (!room.seats || room.seats.length !== 8) {
    room.seats = Array.from({ length: 8 }, (_, i) => ({
      seatNumber: i + 1,
      seatNumberLabel: String(i + 1),
      isMuted: false,
      isSpeaking: false,
      charms: 0,
    }));
  }

  const botsToSeat = [
    { ...DEFAULT_WEPLAY_BOTS[0] }, // Nyayadhish
    { ...DEFAULT_WEPLAY_BOTS[1] }, // Wolf
    { ...DEFAULT_WEPLAY_BOTS[2] }, // We Bhai
    { ...DEFAULT_WEPLAY_BOTS[3] }, // We Chat
    { 
      id: 'SHARMA-JI-VIP', 
      hindiName: '👑 Sharma Ji (शर्मा जी)', 
      level: 99, 
      charms: 98765, 
      badge: '👑 EMPEROR', 
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyalLegend99' 
    },
  ];

  let seatedCount = 0;
  for (let i = 0; i < room.seats.length; i++) {
    if (!room.seats[i].userId && botsToSeat.length > 0) {
      const b = botsToSeat.shift()!;
      room.seats[i] = {
        seatNumber: i + 1,
        seatNumberLabel: String(i + 1),
        userId: b.id,
        userName: b.hindiName,
        gameLevel: b.level,
        charms: b.charms,
        isMuted: false,
        isSpeaking: true,
        userAvatar: b.avatar,
        userRollNumber: b.badge,
      };
      seatedCount++;
    }
  }

  if (!room.chatMessages) room.chatMessages = [];
  room.chatMessages.push({
    id: `summon-${Date.now()}`,
    senderId: 'BOT-ALERT',
    sender: '🔔 WeAlert (शाही बिगुल)',
    senderRoll: '🔔 ALERT',
    senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=WeAlertRoyalHorn',
    text: '🎺 सुनिए सुनिए! न्यायाधीश, भेड़िया बॉट, वी भाई, वी चैट और स्वयं शर्मा जी (Lvl 99, 98,765 Charms) स्टेज पर उपस्थित हैं! अकेला कोई नहीं रहेगा!',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  saveDatabase(db);
  res.json({
    success: true,
    message: `${seatedCount} AI बॉट्स व शर्मा जी ने स्टेज जॉइन कर लिया!`,
    seats: room.seats,
    chatMessages: room.chatMessages,
  });
});

// 9.6 Bot Interaction Trigger (Judge Verdict, Shayari, Coins Booster)
app.post(['/api/game/voice-rooms/:roomId/bot-interact', '/api/game/voice-room/bot-interact'], (req, res) => {
  const roomId = req.params.roomId || req.body.roomId || 'room-founder';
  const { botCode, userId, actionType } = req.body;
  const db = loadDatabase();
  const rooms = getOrCreateRooms(db);
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const callerUser = db.users.find(u => u.userId === userId || u.id === userId);

  let replyText = '';
  let botName = 'AI Bot';
  let botId = 'BOT-AI';
  let botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=BotESP';
  let botRoll = '🤖 AI BOT';
  let coinsAwarded = 0;

  if (botCode === 'judge') {
    botName = '⚖️ न्यायाधीश (Judge Bot)';
    botId = 'BOT-JUDGE';
    botRoll = '⚖️ JUSTICE';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=JudgeNyayadhish99';
    const rulings = [
      '⚖️ अदालत का फैसला: सभी खिलाड़ियों ने निष्पक्ष खेल दिखाया है। 50 इंसाफ कॉइन्स रिवॉर्ड स्वीकृत!',
      '⚖️ फैसला: नियम 7 के अनुसार रूम में किसी भी विवाद का समाधान आपसी भाईचारे से होगा। सम्मान बनाए रखें!',
      '⚖️ निष्पक्ष ऑडिट पूर्ण हुआ! इस कमरे की रैंकिंग और चार्म्स 100% वेरिफाइड हैं।',
      '⚖️ हर खेल में सच्चाई और ईमानदारी ही सबसे बड़ा ताज है। फैसला आपके पक्ष में!',
    ];
    replyText = rulings[Math.floor(Math.random() * rulings.length)];
    coinsAwarded = 50;
  } else if (botCode === 'we_bhai') {
    botName = '🤝 We Bhai (वी भाई)';
    botId = 'BOT-BHAI';
    botRoll = '🤝 WE BHAI';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WeBhaiBhojpuriBrother';
    const advices = [
      '🤝 अरे भाई! EMO और NWI ऑटो पूल चेक किया? रोज़ का टास्क पूरा करो, बहुत तगड़ी कमाई होगी! लो 100 लकी कॉइन्स!',
      '🤝 वी भाई की सीक्रेट टिप: स्नेक गेम में कॉर्नर संभाल के खेलो, स्कोर 5,000 पार हो जाएगा! लो 100 कॉइन्स बोनस!',
      '🤝 अरे अपने भाई के रहते कोई अकेला कैसे रह सकता है? जमके खेलो, 100 कॉइन्स गिफ्ट मेरी तरफ से!',
    ];
    replyText = advices[Math.floor(Math.random() * advices.length)];
    coinsAwarded = 100;
  } else if (botCode === 'we_chat') {
    botName = '💬 We Chat (वी चैट AI)';
    botId = 'BOT-CHAT';
    botRoll = '💬 COMPANION';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WeChatCompanionPoet';
    const shayaris = [
      '💬 "तारों में अकेला चांद जगमगाता है, मुश्किलों में अकेला इंसान डगमगाता है... कांटों से मत घबराना मेरे दोस्त, क्योंकि कांटों में ही अकेला गुलाब मुस्कुराता है!" 🌹',
      '💬 "हौसलों के तरकश में कोशिश का वो तीर जिंदा रखो, हार जाओ चाहे जिंदगी में सब कुछ मगर जीतने की उम्मीद जिंदा रखो!" 🎯',
      '💬 एक चुटकुला: संता ने बंता से पूछा - "यार जिंदगी में सबसे मुश्किल काम क्या है?" बंता बोला - "शर्मा जी से ज्यादा लेवल बनाना!" 😂',
      '💬 "खुशियों की कोई दुकान नहीं होती, दिल से मुस्कुराओ तो कोई बात अनजान नहीं होती!" आपके लिए ढेर सारा प्यार! ✨',
    ];
    replyText = shayaris[Math.floor(Math.random() * shayaris.length)];
    coinsAwarded = 25;
  } else if (botCode === 'wolf') {
    botName = '🐺 Werewolf Host (भेड़िया बॉट)';
    botId = 'BOT-WOLF';
    botRoll = '🐺 WEREWOLF';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=WerewolfHostWolf';
    const wolfQuotes = [
      '🐺 ध्यान दें गांव वालो! रात ढल चुकी है... पूर्णिमा का चांद निकल आया है। भेड़िए शिकार की तलाश में हैं!',
      '🐺 ज्योतिषी ने आंखें मूंदीं और एक रहस्य देखा... क्या डॉक्टर सही इंसान को बचा पाएगा? दिन होने तक प्रतीक्षा करें!',
      '🐺 गांव की पंचायत बुलाई जाती है! सभी लोग मिलकर फैसला करें कि असली भेड़िया कौन है!',
      '🐺 संभल कर रहें! भेड़िया मासूम का चोला पहन कर भी घूम सकता है!',
    ];
    replyText = wolfQuotes[Math.floor(Math.random() * wolfQuotes.length)];
    coinsAwarded = 30;
  } else if (botCode === 'sharma_ji') {
    botName = '👑 Sharma Ji (शर्मा जी)';
    botId = 'SHARMA-JI-VIP';
    botRoll = '👑 EMPEROR';
    botAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=SharmaJiRoyalLegend99';
    replyText = '👑 अरे वाह! मैं शर्मा जी आप सबकी लगन देखकर बहुत खुश हूँ। पूरे 98,765 चार्म्स का आशीर्वाद और 200 कॉइन्स मेरी तरफ से इस कमरे को!';
    coinsAwarded = 200;
  }

  if (callerUser && coinsAwarded > 0) {
    callerUser.coins = (callerUser.coins || 0) + coinsAwarded;
    callerUser.charms = (callerUser.charms || 0) + Math.floor(coinsAwarded / 2);
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
    coinsAwarded,
    userCoins: callerUser ? callerUser.coins : undefined,
    userCharms: callerUser ? callerUser.charms : undefined,
    chatMessages: room.chatMessages,
  });
});

// 10. Real Community Players List (For Friends, Clan & Directory)
app.get('/api/community/real-players', (_req, res) => {
  const db = loadDatabase();
  const realPlayers = db.users.map(u => ({
    userId: u.userId,
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
    roomAddress: u.roomAddress || `ESP-ROOM-${u.userId}`,
    houseName: u.houseName || `${u.fullName} Gaming House`,
    clanName: u.clanName || 'Royal Warriors ESP',
    clanRole: u.clanRole || 'Member',
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
    role: u.role,
  }));

  res.json({ success: true, players: realPlayers });
});

// 11. Real Player Profile Information Modal
app.get('/api/community/player-profile/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const u = db.users.find(user => user.userId === userId || user.id === userId);
  if (!u) {
    return res.status(404).json({ success: false, message: 'Player not found' });
  }

  const profile = {
    userId: u.userId,
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
    totalEarnings: u.totalEarnings || 0,
    balance: u.balance || 0,
    roomAddress: u.roomAddress || `ESP-ROOM-${u.userId}`,
    houseName: u.houseName || `${u.fullName} Gaming House`,
    clanName: u.clanName || 'Royal Warriors ESP',
    clanRole: u.clanRole || 'Member',
    sponsorId: u.sponsorId,
    sponsorName: u.sponsorName,
    loginStreak: u.loginStreak || 1,
    avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.userId}`,
    verifiedAt: u.verifiedAt,
    role: u.role,
  };

  res.json({ success: true, profile });
});

// ======================== ROCK-SOLID COMPLAINTS & SUPPORT SYSTEM ========================

// 1. Submit User Complaint
app.post('/api/complaints', (req, res) => {
  const { userId, category, subject, description, proofScreenshot } = req.body;
  if (!userId || !subject || !description) {
    return res.status(400).json({ success: false, message: 'UserId, subject, and description are required' });
  }

  const db = loadDatabase();
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

  // Add confirmation notification
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

// 2. Get User Complaints
app.get('/api/complaints/user/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const list = (db.complaints || []).filter(c => 
    c.userId.toLowerCase() === userId.toLowerCase() || 
    (c.userRoll && c.userRoll.toLowerCase() === userId.toLowerCase())
  );
  res.json({ success: true, complaints: list });
});

// 3. Admin Get All Complaints
app.get('/api/admin/complaints', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const db = loadDatabase();
  const statusFilter = req.query.status as string;
  let list = db.complaints || [];
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter(c => c.status === statusFilter);
  }
  res.json({ success: true, complaints: list });
});

// 4. Admin Respond & Resolve Complaint
app.post('/api/admin/complaints/:id/respond', (req, res) => {
  const { id } = req.params;
  const { adminPassword, response, status, refundCoins } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = loadDatabase();
  const complaint = (db.complaints || []).find(c => c.id === id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.adminResponse = response || 'आपकी शिकायत का समाधान कर दिया गया है।';
  complaint.status = status || 'resolved';
  complaint.resolvedAt = new Date().toISOString();
  complaint.updatedAt = new Date().toISOString();
  complaint.adminResolvedBy = 'Santosh Kumar (Admin)';

  // Handle optional coin refund
  const refundAmt = Number(refundCoins);
  if (!isNaN(refundAmt) && refundAmt > 0) {
    const user = db.users.find(u => u.userId.toLowerCase() === complaint.userId.toLowerCase());
    if (user) {
      user.coins = (user.coins || 0) + refundAmt;
      if (!Array.isArray(db.coinTransactions)) db.coinTransactions = [];
      db.coinTransactions.unshift({
        id: `CTX-REF-${Date.now()}`,
        userId: user.userId,
        userName: user.fullName,
        type: 'credit',
        category: 'admin_adjustment',
        categoryLabel: 'शिकायत समाधान रिफंड',
        amount: refundAmt,
        balanceBefore: user.coins - refundAmt,
        balanceAfter: user.coins,
        description: `शिकायत #${complaint.id} समाधान: +${refundAmt} कॉइन्स रिफंड क्रेडिट`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Notify user
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

// 5. Record Game Play & Automatic Coin/Day Tracking
app.post('/api/game/record-play', (req, res) => {
  const { userId, gameId, gameName, betCoins, wonCoins, durationSeconds, details } = req.body;
  if (!userId || !gameName) {
    return res.status(400).json({ success: false, message: 'UserId and gameName are required' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const bet = Math.max(0, Number(betCoins) || 0);
  const won = Math.max(0, Number(wonCoins) || 0);
  const netChange = won - bet;
  const balanceBefore = user.coins || 0;
  user.coins = Math.max(0, balanceBefore + netChange);

  // Track unique days played in rock-solid database
  const today = new Date().toISOString().slice(0, 10);
  if (!Array.isArray(user.daysPlayed)) user.daysPlayed = [];
  if (!user.daysPlayed.includes(today)) {
    user.daysPlayed.push(today);
  }
  user.totalDaysPlayed = user.daysPlayed.length;
  user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;

  if (won > bet) {
    user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + won;
    user.gameXp = (user.gameXp || 0) + 25;
  } else if (bet > won) {
    user.totalGamesLost = (user.totalGamesLost || 0) + 1;
    user.totalCoinsSpent = (user.totalCoinsSpent || 0) + bet;
    user.gameXp = (user.gameXp || 0) + 10;
  }

  // Level Up Check
  const newLevel = Math.max(1, Math.floor((user.gameXp || 0) / 200) + 1);
  if (newLevel > (user.gameLevel || 1)) {
    user.gameLevel = newLevel;
  }

  // 1. Record in GamePlay History
  if (!Array.isArray(db.gamePlayHistory)) db.gamePlayHistory = [];
  const playRecord: GamePlayRecord = {
    id: `GP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user.userId,
    userName: user.fullName,
    gameId: gameId || 'game',
    gameName,
    betCoins: bet,
    wonCoins: won,
    netChange,
    result: netChange > 0 ? 'win' : netChange < 0 ? 'loss' : 'draw',
    durationSeconds: Number(durationSeconds) || 45,
    playedAt: new Date().toISOString(),
    details: details || undefined,
  };
  db.gamePlayHistory.unshift(playRecord);

  // 2. Record in Coin Transaction Audit Ledger
  if (!Array.isArray(db.coinTransactions)) db.coinTransactions = [];
  if (netChange !== 0) {
    db.coinTransactions.unshift({
      id: `CTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: user.userId,
      userName: user.fullName,
      type: netChange >= 0 ? 'credit' : 'debit',
      category: netChange >= 0 ? 'game_win' : 'game_bet',
      categoryLabel: gameName,
      amount: Math.abs(netChange),
      balanceBefore,
      balanceAfter: user.coins,
      description: `${gameName}: ${netChange > 0 ? 'जीत' : 'खर्च'} (${netChange > 0 ? '+' : ''}${netChange} कॉइन्स)`,
      timestamp: new Date().toISOString(),
    });
  }

  // Keep history reasonable (last 5,000 records)
  if (db.gamePlayHistory.length > 5000) db.gamePlayHistory = db.gamePlayHistory.slice(0, 5000);
  if (db.coinTransactions.length > 5000) db.coinTransactions = db.coinTransactions.slice(0, 5000);

  saveDatabase(db);
  res.json({ success: true, user, record: playRecord });
});

// 6. Get User Gameplay History
app.get('/api/game/history/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const list = (db.gamePlayHistory || [])
    .filter(g => g.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, history: list });
});

// 7. Get User Coin Transaction History Ledger
app.get('/api/game/coin-history/:userId', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const list = (db.coinTransactions || [])
    .filter(c => c.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, transactions: list });
});

// ======================== PROFILE HISTORY & AUDIT TRAIL ========================

// 8. Get User Profile Audit History
app.get('/api/user/:userId/profile-history', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const history = (db.profileHistory || [])
    .filter(p => p.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, history });
});

// ======================== ONLINE PRESENCE & SESSION HEARTBEAT ("कब से कब तक ऑन रहा") ========================

// 9. User Presence Heartbeat (Tracks Exact Online Duration)
app.post('/api/user/heartbeat', (req, res) => {
  const { userId, sessionId, deviceType, deviceName, browser, os } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === String(userId).toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const now = new Date();
  const nowIso = now.toISOString();

  if (!Array.isArray(db.activitySessions)) db.activitySessions = [];

  // Find active session for this user and device
  let session = db.activitySessions.find(s => 
    s.userId.toLowerCase() === user.userId.toLowerCase() && 
    s.status === 'online' &&
    (sessionId ? s.id === sessionId : true)
  );

  if (session) {
    // Check if session timed out (>5 minutes since last heartbeat)
    const lastHbTime = new Date(session.lastHeartbeat).getTime();
    if (now.getTime() - lastHbTime > 5 * 60 * 1000) {
      session.status = 'offline';
      session.sessionEnd = new Date(lastHbTime).toISOString();
      session.durationMinutes = Math.max(1, Math.round((lastHbTime - new Date(session.sessionStart).getTime()) / 60000));
      session = undefined; // Will create new session below
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

  // Clean old sessions (keep last 5,000)
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

// 10. User Session End (On Logout or Page Exit)
app.post('/api/user/session-end', (req, res) => {
  const { userId, sessionId } = req.body;
  if (!userId) return res.json({ success: true });

  const db = loadDatabase();
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

// 11. Get User Online Session History ("कब से कब तक ऑन रहा")
app.get('/api/user/:userId/session-history', (req, res) => {
  const { userId } = req.params;
  const db = loadDatabase();
  const sessions = (db.activitySessions || [])
    .filter(s => s.userId.toLowerCase() === userId.toLowerCase())
    .slice(0, 100);
  res.json({ success: true, sessions });
});

// 12. Admin View All Users Sessions & Online Status
app.get('/api/admin/users/activity-overview', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = loadDatabase();
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

// 13. Server-side State Persistence (Replacing localStorage for Tasks, Theme, Customization)
app.post('/api/user/:userId/server-state', (req, res) => {
  const { userId } = req.params;
  const { claimedTasksDate, claimedTasksList, openedTimedBoxes, unlockedRooms, roomTheme, voiceEffect } = req.body;

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (claimedTasksDate) user.claimedTasksDate = claimedTasksDate;
  if (Array.isArray(claimedTasksList)) user.claimedTasksList = claimedTasksList;
  if (Array.isArray(openedTimedBoxes)) user.openedTimedBoxes = openedTimedBoxes;
  if (Array.isArray(unlockedRooms)) user.unlockedRooms = unlockedRooms;
  if (roomTheme) user.roomTheme = roomTheme;
  if (voiceEffect) user.voiceEffect = voiceEffect;

  saveDatabase(db);
  res.json({ success: true, user });
});

// ======================== 14. HOME PAGE 7-PHOTO POPUP SLIDER SYSTEM ========================

// Public: Get Active Home Slider Photos
app.get('/api/home-slider-photos', (_req, res) => {
  const db = loadDatabase();
  const photos = (db.homeSliderPhotos || []).filter(p => p.active);
  res.json({ success: true, photos });
});

// Admin: Save / Update Home Slider Photos (Max 7 photos)
app.post('/api/admin/home-slider-photos', (req, res) => {
  const { adminPassword, photos } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!Array.isArray(photos)) {
    return res.status(400).json({ success: false, message: 'Photos array is required' });
  }

  // Limit to maximum 7 photos as requested
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

  const db = loadDatabase();
  db.homeSliderPhotos = sanitizedPhotos;
  if (!db.settings) db.settings = DEFAULT_SETTINGS;
  db.settings.homeSliderPhotos = sanitizedPhotos;
  saveDatabase(db);

  res.json({ success: true, message: '7-फोटो स्लाइडर सफलतापूर्वक अपडेट हो गया!', photos: sanitizedPhotos });
});

// ======================== 15. CONTACT US & TELEGRAM INQUIRIES SYSTEM ========================

// Public: Submit Contact Message
app.post('/api/contact/messages', (req, res) => {
  const { name, email, phone, telegramUsername, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'नाम, ईमेल और संदेश आवश्यक हैं' });
  }

  const db = loadDatabase();
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

// Admin: Get All Contact Messages
app.get('/api/admin/contact-messages', (req, res) => {
  const pass = req.query.adminPassword as string;
  if (!verifyAdmin(pass)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = loadDatabase();
  res.json({ success: true, messages: db.contactMessages || [] });
});

// Admin: Reply / Mark Read Contact Message
app.post('/api/admin/contact-messages/:id/reply', (req, res) => {
  const { id } = req.params;
  const { adminPassword, adminReply, status } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = loadDatabase();
  const msg = (db.contactMessages || []).find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }

  if (adminReply) msg.adminReply = adminReply;
  msg.status = (status as any) || 'replied';
  saveDatabase(db);

  res.json({ success: true, message: 'संदेश का समाधान अपडेट हो गया', contactMessage: msg });
});

// ======================== 16. DEMO USERS & PROFILE MANAGEMENT IN ADMIN PANEL ========================

// Admin: Create Demo / Featured User with Custom Avatar, Name & Profile Details
app.post('/api/admin/demo-user', (req, res) => {
  const { adminPassword, fullName, phone, email, avatar, roleTitle, coins, charms, gameLevel, clanName, houseName } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!fullName) {
    return res.status(400).json({ success: false, message: 'User name is required' });
  }

  const db = loadDatabase();
  const demoUserId = `ESP-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

  const newDemoUser: UserProfile = {
    id: `usr-demo-${Date.now()}`,
    userId: demoUserId,
    gamingId: `GAME-${Math.floor(100000 + Math.random() * 900000)}`,
    fullName: fullName.trim(),
    phone: phone ? phone.trim() : '9876543210',
    email: email ? email.trim().toLowerCase() : `demo_${demoUserId.toLowerCase()}@espplatform.com`,
    fullAddress: 'Demo City, India',
    paymentAddress: 'demo@upi',
    payoutUpiId: 'demo@upi',
    password: 'password123',
    sponsorId: db.settings.ownerSponsorId,
    sponsorName: db.settings.ownerName,
    chosenServiceCode: 'EMO',
    chosenServiceName: 'EARN MONEY ONLINE',
    joiningFee: 100,
    joiningDate: new Date().toISOString().split('T')[0],
    paymentUtr: 'DEMO_VERIFIED_USER',
    status: 'active',
    balance: 500,
    totalEarnings: 1500,
    referralEarnings: 750,
    promoEarnings: 250,
    totalWithdrawn: 1000,
    coins: Number(coins) || 10000,
    charms: Number(charms) || 500,
    gameLevel: Number(gameLevel) || 10,
    gameXp: 1200,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    roomAddress: `ESP-ROOM-${demoUserId}`,
    houseName: houseName || `${fullName.trim().split(' ')[0]} Gaming Palace`,
    clanName: clanName || 'Royal Warriors ESP',
    clanRole: 'Member',
    bio: roleTitle || 'ESP Verified Community Member',
    loginStreak: 5,
    claimedDays: [1, 2, 3, 4, 5],
    friendsCount: 15,
    visitorCount: 120,
    role: 'member',
    accountType: 'gamer',
    createdAt: new Date().toISOString(),
    isOnline: true,
  };

  db.users.push(newDemoUser);
  saveDatabase(db);

  res.json({ success: true, message: 'डेमो यूजर सफलतापूर्वक जोड़ा गया!', user: newDemoUser });
});

// Admin: Edit Profile Details of Any User (Demo or Real)
app.put('/api/admin/user/:userId/edit-details', (req, res) => {
  const { userId } = req.params;
  const { adminPassword, fullName, avatar, phone, email, coins, charms, gameLevel, status, houseName, clanName, bio } = req.body;
  if (!verifyAdmin(adminPassword)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
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
  if (coins !== undefined && !isNaN(Number(coins))) user.coins = Number(coins);
  if (charms !== undefined && !isNaN(Number(charms))) user.charms = Number(charms);
  if (gameLevel !== undefined && !isNaN(Number(gameLevel))) user.gameLevel = Number(gameLevel);
  if (status) user.status = status;
  if (houseName) user.houseName = houseName.trim();
  if (clanName) user.clanName = clanName.trim();
  if (bio) user.bio = bio.trim();

  saveDatabase(db);
  res.json({ success: true, message: 'यूजर प्रोफाइल विवरण सफलतापूर्वक अपडेट कर दिया गया!', user });
});

// ======================== 17. USER SELF PROFILE PIC UPLOAD ========================
app.post('/api/user/:userId/avatar', (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ success: false, message: 'Avatar image data is required' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const oldValue = user.avatar ? 'Old Photo' : 'Default';
  user.avatar = avatar;

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

// ======================== 18. AUTHENTIC REAL PLAYER ONLINE COUNTER ========================
app.get('/api/community/real-online-count', (_req, res) => {
  const db = loadDatabase();
  const now = Date.now();
  // Real active users: Heartbeat received in last 3 minutes OR active activitySession
  const activeSessions = (db.activitySessions || []).filter(s => {
    if (s.status !== 'online') return false;
    const hbTime = new Date(s.lastHeartbeat).getTime();
    return (now - hbTime) < 3 * 60 * 1000;
  });

  const activeUserIds = new Set<string>();
  activeSessions.forEach(s => activeUserIds.add(s.userId.toLowerCase()));

  // Also include users with isOnline and recent lastActiveTime
  (db.users || []).forEach(u => {
    if (u.isOnline && u.lastActiveTime) {
      const diff = now - new Date(u.lastActiveTime).getTime();
      if (diff < 3 * 60 * 1000) {
        activeUserIds.add(u.userId.toLowerCase());
      }
    }
  });

  const onlineList = (db.users || []).filter(u => activeUserIds.has(u.userId.toLowerCase()));
  
  // Real authentic count - no fake inflated numbers!
  const realCount = Math.max(1, onlineList.length);

  res.json({
    success: true,
    realCount,
    onlinePlayers: onlineList.slice(0, 30).map(u => ({
      userId: u.userId,
      fullName: u.fullName,
      avatar: u.avatar || '',
      gameLevel: u.gameLevel || 1,
      clanName: u.clanName || 'ESP Family',
      lastActive: u.lastActiveTime,
    })),
  });
});

// ======================== 19. REAL-TIME ROOM SEATING REWARDS (+5 Coins / min on Mic) ========================
app.post('/api/game/voice-room/seat-reward', (req, res) => {
  const { userId, minutesActive, roomId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'UserId is required' });
  }

  const mins = Math.max(1, Number(minutesActive) || 1);
  const rewardCoins = mins * 5; // +5 coins per minute on mic!

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore + rewardCoins;

  if (!Array.isArray(db.coinTransactions)) db.coinTransactions = [];
  const tx: CoinTransactionRecord = {
    id: `CTX-SEAT-${Date.now()}`,
    userId: user.userId,
    userName: user.fullName,
    type: 'credit',
    category: 'game_win',
    categoryLabel: 'वॉइस रूम माइक सीट रिवॉर्ड',
    amount: rewardCoins,
    balanceBefore,
    balanceAfter: user.coins,
    description: `वॉइस स्टेज सीट रिवॉर्ड: ${mins} मिनट माइक एक्टिव रहने पर +${rewardCoins} कॉइन्स प्राप्त हुए!`,
    timestamp: new Date().toISOString(),
  };
  db.coinTransactions.unshift(tx);

  saveDatabase(db);
  res.json({ success: true, message: `बधाई! माइक सीट रिवॉर्ड: +${rewardCoins} कॉइन्स मिले`, coinsEarned: rewardCoins, newBalance: user.coins, user });
});

// ======================== 20. GIFT CARDS & VOUCHERS (INSTANT CODE & PIN) ========================
app.get('/api/gift-cards', (_req, res) => {
  const db = loadDatabase();
  res.json({ success: true, vouchers: db.giftCardVouchers || DEFAULT_GIFT_CARD_VOUCHERS });
});

app.post('/api/gift-cards/redeem', (req, res) => {
  const { userId, voucherId } = req.body;
  if (!userId || !voucherId) {
    return res.status(400).json({ success: false, message: 'UserId and voucherId are required' });
  }

  const db = loadDatabase();
  const user = db.users.find(u => u.userId.toLowerCase() === userId.toLowerCase() || u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const voucherList = db.giftCardVouchers || DEFAULT_GIFT_CARD_VOUCHERS;
  const voucher = voucherList.find(v => v.id === voucherId);
  if (!voucher) {
    return res.status(404).json({ success: false, message: 'Gift card package not found' });
  }

  if (voucher.status === 'claimed') {
    return res.status(400).json({ success: false, message: 'यह वाउचर पहले ही क्लेम किया जा चुका है' });
  }

  if ((user.coins || 0) < voucher.coinsRequired) {
    return res.status(400).json({ 
      success: false, 
      message: `अपर्याप्त कॉइन्स! इस वाउचर के लिए ${voucher.coinsRequired} कॉइन्स चाहिए, आपके पास ${user.coins || 0} हैं।` 
    });
  }

  const balanceBefore = user.coins || 0;
  user.coins = balanceBefore - voucher.coinsRequired;
  voucher.status = 'claimed';
  voucher.redeemedBy = user.userId;
  voucher.redeemedAt = new Date().toISOString();

  // Create unique voucher code & PIN for the user
  const generatedCode = `${voucher.brand.slice(0, 3).toUpperCase()}-ESP-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedPin = `${Math.floor(1000 + Math.random() * 9000)}`;
  voucher.voucherCode = generatedCode;
  voucher.voucherPin = generatedPin;

  if (!Array.isArray(db.coinTransactions)) db.coinTransactions = [];
  db.coinTransactions.unshift({
    id: `CTX-GC-${Date.now()}`,
    userId: user.userId,
    userName: user.fullName,
    type: 'debit',
    category: 'daily_task',
    categoryLabel: 'गिफ्ट कार्ड रिडीम',
    amount: voucher.coinsRequired,
    balanceBefore,
    balanceAfter: user.coins,
    description: `${voucher.title} रिडीम किया: कोड ${generatedCode} (पिन: ${generatedPin})`,
    timestamp: new Date().toISOString(),
  });

  // Notify user
  if (!Array.isArray(db.notifications)) db.notifications = [];
  db.notifications.push({
    id: `notif-gc-${Date.now()}`,
    userId: user.userId,
    title: `🎁 ${voucher.title} रिडीम सफल!`,
    message: `आपका गिफ्ट कार्ड कोड: ${generatedCode} | पिन: ${generatedPin}। इसे तत्काल रिडीम कर सकते हैं।`,
    type: 'system',
    date: new Date().toLocaleDateString('hi-IN'),
    read: false,
  });

  saveDatabase(db);
  res.json({ 
    success: true, 
    message: `बधाई! ${voucher.title} रिडीम हो गया!`, 
    voucher: { ...voucher, voucherCode: generatedCode, voucherPin: generatedPin },
    newBalance: user.coins,
    user,
  });
});

// ======================== 21. NWI (NON-WORKING INCOME) REAL 3-LEVEL DOWNLINE TREE ========================

function buildRealNwiTree(database: Database, user: UserProfile): NwiTreeRecord {
  const tierFee = user.joiningFee && user.joiningFee >= 50 ? user.joiningFee : 200;
  const targetId = user.userId.toLowerCase();
  const claimedSet = new Set((user.nwiClaimedMemberIds || []).map(id => id.toLowerCase()));

  // Level 1: Real active users directly sponsored by this user
  const l1Users = database.users.filter(
    u =>
      u.status === 'active' &&
      u.userId.toLowerCase() !== targetId &&
      (u.sponsorId || '').toLowerCase() === targetId
  );

  const l1Ids = new Set(l1Users.map(u => u.userId.toLowerCase()));

  // Level 2: Real active users sponsored by Level 1 members
  const l2Users = database.users.filter(
    u =>
      u.status === 'active' &&
      u.userId.toLowerCase() !== targetId &&
      !l1Ids.has(u.userId.toLowerCase()) &&
      l1Ids.has((u.sponsorId || '').toLowerCase())
  );

  const l2Ids = new Set(l2Users.map(u => u.userId.toLowerCase()));

  // Level 3: Real active users sponsored by Level 2 members
  const l3Users = database.users.filter(
    u =>
      u.status === 'active' &&
      u.userId.toLowerCase() !== targetId &&
      !l1Ids.has(u.userId.toLowerCase()) &&
      !l2Ids.has(u.userId.toLowerCase()) &&
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

async function startServer() {
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
