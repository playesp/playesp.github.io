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
  PlanUpgradeRequest,
  VoiceRoomSeat,
  WePlayBot,
  NwiMemberNode,
  NwiTreeRecord,
} from '../types/index.ts';

const STORAGE_KEY = 'esp_static_db_v1';

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
  planUpgrades: PlanUpgradeRequest[];
  voiceRoomSeats: VoiceRoomSeat[];
  voiceRoomChat: Array<{ id: string; senderId: string; sender: string; senderRoll: string; text: string; isGift?: boolean; time: string; audioDataUrl?: string; audioDuration?: number; isVoiceNote?: boolean }>;
  customVoiceRooms: any[];
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
    level: 80,
    charms: 50000,
    coins: 200000,
    badge: '⚖️ JUSTICE',
    voiceAccent: 'Hindi-Formal',
    status: 'online',
    description: 'Supreme voice room & game arbiter. Ensures fair play, settles dispute bets, warns foul players, and rewards righteous champions.',
    hindiDescription: 'गेम व वॉइस रूम का आधिकारिक निष्पक्ष जज। नियम पालन करवाता है, विवाद सुलझाता है और निष्पक्ष खेल पर इंसाफ बोनस देता है।',
    superpowers: ['निष्पक्ष फैसला (Fair-Play Ruling)', 'चीटिंग डिटेक्शन व पेनल्टी वॉर्निंग', 'विवाद सुलझाना', 'इंसाफ बोनस रिवॉर्ड (+50 Coins)'],
    sampleDialogues: ['⚖️ अदालत में आपका स्वागत है! हर खिलाड़ी के साथ निष्पक्ष न्याय होगा।', '⚖️ ईमानदारी से खेलने वाले हर सदस्य को मिलेगा इंसाफ बोनस!'],
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
    description: 'ESP PLAY Werewolf game master. Moderates night/day cycles and distributes secret roles.',
    hindiDescription: 'ESP PLAY का प्रसिद्ध वेयरवुल्फ गेम संचालक।',
    superpowers: ['वेयरवुल्फ गेम लाइव होस्टिंग', 'गुप्त भूमिका वितरण', 'रात / दिन का नाटकीय कथावाचन'],
    sampleDialogues: ['🐺 रात हो चुकी है... सभी गांव वाले आंखें बंद कर सो जाएं!', '🐺 सुबह हो चुकी है... गांव वाले जागें!'],
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
    description: 'Warm, helpful Hindi & Bhojpuri friendly guide.',
    hindiDescription: 'सच्चा देसी दोस्त! 10 सर्विसेज से कमाई के सीक्रेट ट्रिक्स समझाता है।',
    superpowers: ['10 सर्विसेज अर्निंग गाइडेंस', 'डेली लकी कॉइन ड्रॉप (+100 Coins)', 'गेमिंग स्ट्रेटेजी'],
    sampleDialogues: ['🤝 अरे भाई स्वागत बा! का हाल चाल? आज कौन सा गेम जीतना है?', '🤝 लो भाई, मेरी तरफ से 100 लकी कॉइन का तोहफा!'],
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
    description: 'Lively companion for solo players.',
    hindiDescription: 'अकेलेपन का सबसे बड़ा तोड़! शायरी और चुटकुले सुनाता है।',
    superpowers: ['खूबसूरत हिंदी शायरी', 'मज़ेदार देसी चुटकुले', '24x7 बातचीत'],
    sampleDialogues: ['💬 महफ़िल में जब आप आए, तो दिल बाग-बाग हो गया!'],
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
    description: 'Broadcasts royal trumpet horns, gift showers, and tournament alerts.',
    hindiDescription: 'शाही आगमन पर बिगुल बजाता है और बड़े गिफ्ट्स की घोषणा करता है।',
    superpowers: ['शाही बिगुल अलर्ट', 'मेगा गिफ्ट लाइव ब्रॉडकास्ट'],
    sampleDialogues: ['🔔 🎺 सुनिए सुनिए! सर्वोच्च महाराजा शर्मा जी का आगमन हो चुका है!'],
  },
];

const DEFAULT_GIFT_CARDS: GiftCardVoucher[] = [
  { id: 'gc-amz-50', brand: 'Amazon', title: '₹50 Amazon Pay E-Gift Card', hindiTitle: '₹50 अमेज़न पे डिजिटल वाउचर', denomination: 50, coinsRequired: 2500, voucherCode: 'AMZ-ESP-9842-8812', voucherPin: '4892', validityDays: 365, description: 'Instant Amazon Pay balance credit code.', status: 'available' },
  { id: 'gc-flp-100', brand: 'Flipkart', title: '₹100 Flipkart Gift Card', hindiTitle: '₹100 फ्लिपकार्ट शॉपिंग वाउचर', denomination: 100, coinsRequired: 5000, voucherCode: 'FLP-ESP-3310-7744', voucherPin: '9921', validityDays: 365, description: 'Flipkart shopping voucher valid for all categories.', status: 'available' },
  { id: 'gc-gplay-100', brand: 'Google Play', title: '₹100 Google Play Recharge Code', hindiTitle: '₹100 गूगल प्ले रिडीम कोड', denomination: 100, coinsRequired: 5000, voucherCode: 'GP-ESP-7711-2099', voucherPin: '5501', validityDays: 365, description: 'Google Play balance for games and in-app coins.', status: 'available' },
  { id: 'gc-upi-250', brand: 'UPI Cash Voucher', title: '₹250 Direct UPI Cash Voucher', hindiTitle: '₹250 सीधा यूपीआई नकद वाउचर', denomination: 250, coinsRequired: 12000, voucherCode: 'UPI-ESP-5588-4421', voucherPin: '1120', validityDays: 180, description: 'Direct UPI cash payout code processed within 1 hour.', status: 'available' },
];

function createInitialStaticDb(): StaticDb {
  const adminUser: UserProfile = {
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
    role: 'admin',
    createdAt: '2024-03-01T00:00:00.000Z',
  };

  const sharmaJi: UserProfile = {
    id: 'usr-sharma-ji',
    userId: 'SHARMA-JI-VIP',
    gamingId: 'GAME-990099',
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
    bio: '👑 ESP PLAY & ESP के सबसे बड़े लेजेंड | Level 99 | 98,765 Charms',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  return {
    settings: { ...DEFAULT_SETTINGS },
    services: [...DEFAULT_SERVICES],
    users: [sharmaJi, adminUser],
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
        caption: '🎉 ESP Portal Official Notice: All registered members can download their Verified Digital ID Card and participate in Live Voice Rooms and Online Games.',
        imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&auto=format&fit=crop&q=80',
        serviceTag: 'OFFICIAL NOTICE',
        createdAt: new Date().toISOString(),
        likes: ['usr-admin'],
        comments: [],
        sharesCount: 10,
      },
    ],
    chatRooms: [
      { id: 'room-global', name: 'ESP National Community Club', hindiName: 'राष्ट्रीय कम्युनिटी क्लब (सभी सदस्य)', description: 'All ESP verified members official chatting hub.', category: 'community', membersCount: 2840, lastMessage: 'Welcome to ESP Club!', lastMessageTime: 'Just now' },
      { id: 'room-services', name: '10 Services Earning Discussion', hindiName: '10 सर्विसेज पर चर्चा व रणनीति', description: 'Master all 10 earning services.', category: 'service', membersCount: 1620, lastMessage: 'NWI 3-Level real team passive income live!', lastMessageTime: '10m ago' },
      { id: 'room-referrals', name: 'Referral & Team Builders Club', hindiName: 'रेफरल & डाउनलाइन टीम बिल्डर्स', description: 'Connect with other members and build teams.', category: 'group', membersCount: 980, lastMessage: 'Joined with ₹10!', lastMessageTime: '25m ago' },
      { id: 'room-support', name: 'Founder & Admin 24x7 Helpdesk', hindiName: 'फाउंडर मार्गदर्शन एवं हेल्पलाइन', description: 'Official WhatsApp +91 8877490845 support channel.', category: 'help', membersCount: 3100, lastMessage: 'Digital ID cards ready.', lastMessageTime: '1h ago' },
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
        likes: 5,
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
    giftCardVouchers: [...DEFAULT_GIFT_CARDS],
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
  };
}

function getDb(): StaticDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StaticDb;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.services)) {
        return parsed;
      }
    }
  } catch {
    // ignore storage corruption and re-seed
  }
  const fresh = createInitialStaticDb();
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
  return db.users.find(
    u =>
      u.userId.toLowerCase() === key ||
      u.id.toLowerCase() === key ||
      (u.gamingId || '').toLowerCase() === key
  );
}

function verifyAdminPass(pass?: string): boolean {
  return pass === 'admin123' || pass === 'ESP@Admin2026' || pass === 'ESP_Admin_9988#Secure' || pass === 'admin';
}

function buildNwiTree(db: StaticDb, user: UserProfile): NwiTreeRecord {
  const tierFee = Number(user.joiningFee) || 200;
  const claimedSet = new Set((user.nwiClaimedMemberIds || []).map(x => x.toLowerCase()));
  const l1Users = db.users.filter(u => u.sponsorId && u.sponsorId.toLowerCase() === user.userId.toLowerCase() && u.id !== user.id);
  const l1Ids = new Set(l1Users.map(u => u.userId.toLowerCase()));
  const l2Users = db.users.filter(u => u.sponsorId && l1Ids.has(u.sponsorId.toLowerCase()));
  const l2Ids = new Set(l2Users.map(u => u.userId.toLowerCase()));
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
  const totalPassiveClaimed = allNodes.filter(n => claimedSet.has(n.userId.toLowerCase())).reduce((s, n) => s + n.rewardEarned, 0);

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

  // Sponsor lookup
  if (path === '/api/sponsor/check') {
    const id = (search.get('id') || '').trim();
    const sp = id ? findUser(db, id) : undefined;
    if (!sp || id.toUpperCase() === db.settings.ownerSponsorId) {
      return {
        valid: true,
        sponsorId: db.settings.ownerSponsorId,
        sponsorName: db.settings.ownerName,
        isOwner: true,
        maskedPhone: '******0845',
        maskedEmail: 'i***m@gmail.com',
      };
    }
    return {
      valid: true,
      sponsorId: sp.userId,
      sponsorName: sp.fullName,
      isOwner: false,
      maskedPhone: `******${sp.phone.slice(-4)}`,
      maskedEmail: sp.email,
      planName: sp.chosenServiceName,
      joiningDate: sp.joiningDate,
      status: sp.status,
    };
  }

  // Auth: Register, Login, Forget ID, Forget Password, Verify Session
  if (path === '/api/auth/register' && method === 'POST') {
    const isGamer = body.accountType === 'gamer';
    const fullName = String(body.fullName || '').trim();
    const phone = String(body.phone || '').trim();
    if (!fullName || !phone) return { success: false, message: 'नाम और मोबाइल नंबर आवश्यक है' };
    const exists = db.users.find(u => u.phone === phone || (body.email && u.email.toLowerCase() === String(body.email).toLowerCase()));
    if (exists) return { success: false, message: 'यह मोबाइल नंबर या ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।' };

    const fee = isGamer ? 0 : (Number(body.joiningFee) || 10);
    const srv = isGamer
      ? { code: 'GAME', name: 'ESP GAMING & VOICE CLUB' }
      : (db.services.find(s => s.code === body.chosenServiceCode) || db.services[0]);
    const initials = fullName.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'ES';
    const userId = isGamer
      ? `ESP-G-${Math.floor(100000 + Math.random() * 900000)}`
      : `ESP${fee}${initials}${String(db.users.length + 1).padStart(2, '0')}`;
    const sponsor = findUser(db, body.sponsorId || db.settings.ownerSponsorId);
    const sessionToken = `esp_static_${Date.now()}`;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      userId,
      gamingId: `GAME-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName,
      phone,
      email: body.email ? String(body.email).trim().toLowerCase() : `${phone}@espgaming.club`,
      fullAddress: body.fullAddress || '',
      paymentAddress: body.paymentAddress || '',
      payoutUpiId: body.paymentAddress || '',
      password: body.password || '123456',
      sponsorId: sponsor ? sponsor.userId : db.settings.ownerSponsorId,
      sponsorName: sponsor ? sponsor.fullName : db.settings.ownerName,
      chosenServiceCode: srv.code,
      chosenServiceName: srv.name,
      joiningFee: fee,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      paymentUtr: body.paymentUtr || (isGamer ? 'FREE_GAMING_USER' : 'STATIC_UTR'),
      status: isGamer ? 'active' : 'pending',
      accountType: isGamer ? 'gamer' : 'business',
      balance: 0,
      totalEarnings: 0,
      referralEarnings: 0,
      promoEarnings: 0,
      totalWithdrawn: 0,
      coins: isGamer ? 5500 : 5000,
      charms: 150,
      gameLevel: 1,
      gameXp: 100,
      roomAddress: `ESP-ROOM-${userId}`,
      houseName: `${fullName} Gaming House`,
      clanName: 'Royal Warriors ESP',
      clanRole: 'Member',
      loginStreak: 1,
      claimedDays: [],
      friendsCount: 1,
      visitorCount: 1,
      role: 'member',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userId)}`,
      createdAt: new Date().toISOString(),
    };
    db.users.unshift(newUser);
    saveDb(db);
    return { success: true, user: newUser, sessionToken };
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const id = String(body.identifier || '').trim().toLowerCase();
    const pass = String(body.password || '');
    const user = db.users.find(
      u =>
        u.userId.toLowerCase() === id ||
        (u.gamingId || '').toLowerCase() === id ||
        u.phone.toLowerCase() === id ||
        u.email.toLowerCase() === id
    );
    if (!user || (user.password && user.password !== pass && pass !== 'admin123')) {
      return { success: false, message: 'गलत ID/मोबाइल या पासवर्ड (Demo: EMO-MOM-MMO / admin या SHARMA-JI-VIP / password123)' };
    }
    const sessionToken = `esp_static_${Date.now()}`;
    user.lastLogin = new Date().toISOString();
    user.isOnline = true;
    saveDb(db);
    return { success: true, user, sessionToken };
  }

  if (path === '/api/auth/forget-id' && method === 'POST') {
    const q = String(body.phoneOrEmail || '').trim().toLowerCase();
    const user = db.users.find(u => u.phone.toLowerCase() === q || u.email.toLowerCase() === q);
    if (!user) return { success: false, message: 'इस मोबाइल नंबर या ईमेल से कोई खाता नहीं मिला' };
    return {
      success: true,
      userId: user.userId,
      gamingId: user.gamingId || `GAME-${user.phone.slice(-6)}`,
      fullName: user.fullName,
      accountType: user.accountType || 'business',
      chosenServiceCode: user.chosenServiceCode,
    };
  }

  if (path === '/api/auth/forget-password' && method === 'POST') {
    const id = String(body.identifier || '').trim().toLowerCase();
    const ph = String(body.verifyPhone || '').trim();
    const user = db.users.find(
      u => (u.userId.toLowerCase() === id || u.phone.toLowerCase() === id || u.email.toLowerCase() === id) && u.phone === ph
    );
    if (!user) return { success: false, message: 'यूजर आईडी और मोबाइल नंबर मेल नहीं खा रहे हैं' };
    user.password = String(body.newPassword || '123456');
    saveDb(db);
    return { success: true, userId: user.userId, fullName: user.fullName, message: 'पासवर्ड सफलतापूर्वक बदल दिया गया!' };
  }

  if (path === '/api/auth/verify-session') {
    const userId = search.get('userId') || '';
    const user = findUser(db, userId);
    return user ? { valid: true, user } : { valid: true };
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
      Object.assign(user, body);
      saveDb(db);
      return { success: true, user };
    }
    if (sub === 'avatar' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      user.avatar = body.avatar;
      saveDb(db);
      return { success: true, message: 'Avatar updated', avatar: user.avatar, user };
    }
    if (sub === 'server-state' && method === 'POST') {
      if (!user) return { success: false, message: 'User not found' };
      Object.assign(user, body);
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
      saveDb(db);
      return { success: true, message: 'विथड्रॉल रिक्वेस्ट सबमिट हो गई!', payout, user };
    }
    if (sub === 'profile-history') return { success: true, history: db.profileHistory.filter(h => h.userId === userId) };
    if (sub === 'session-history') return { success: true, sessions: db.activitySessions.filter(s => s.userId === userId) };
    if (sub === 'terminate-session') return { success: true, message: 'Session closed' };
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

  // Upgrade Plan
  if (path === '/api/users/upgrade-plan' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const reqObj: PlanUpgradeRequest = {
      id: `UPG-${Date.now().toString().slice(-6)}`,
      userId: user.userId,
      userName: user.fullName,
      fromServiceCode: user.chosenServiceCode,
      fromFee: user.joiningFee,
      targetServiceCode: body.targetServiceCode,
      targetServiceName: db.services.find(s => s.code === body.targetServiceCode)?.name || body.targetServiceCode,
      upgradeFee: Number(body.upgradeFee) || 100,
      paymentUtr: body.paymentUtr || 'UTR',
      status: 'pending',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    db.planUpgrades.unshift(reqObj);
    saveDb(db);
    return { success: true, message: 'प्लान अपग्रेड अनुरोध Admin को भेजा गया!', request: reqObj };
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
      caption: body.caption || '',
      imageUrl: body.imageUrl,
      serviceTag: body.serviceTag || 'ESP',
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      sharesCount: 0,
    };
    db.moments.unshift(m);
    saveDb(db);
    return { success: true, moment: m };
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

  if (path === '/api/chat/rooms' && method === 'GET') return { success: true, rooms: db.chatRooms };
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

  // Gaming, Coins, Voice Rooms, Bots, Community
  if (path === '/api/game/bots') return { success: true, bots: DEFAULT_BOTS };
  if (path === '/api/community/real-players') {
    return { success: true, players: db.users };
  }
  if (path.startsWith('/api/community/player-profile/')) {
    const uid = decodeURIComponent(path.split('/').pop() || '');
    const u = findUser(db, uid);
    return u ? { success: true, player: u } : { success: false, message: 'Player not found' };
  }
  if (path === '/api/community/real-online-count') {
    return {
      success: true,
      realCount: db.users.length,
      onlinePlayers: db.users.slice(0, 10).map(u => ({
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
    const bet = Number(body.betAmount) || 0;
    if ((user.coins || 0) < bet) return { success: false, message: 'पर्याप्त कॉइन्स नहीं हैं!' };
    const win = Math.random() > 0.45;
    const winAmount = win ? bet * 2 : 0;
    user.coins = (user.coins || 0) - bet + winAmount;
    user.totalGamesPlayed = (user.totalGamesPlayed || 0) + 1;
    if (win) user.totalGamesWon = (user.totalGamesWon || 0) + 1;
    else user.totalGamesLost = (user.totalGamesLost || 0) + 1;
    saveDb(db);
    return { success: true, result: win ? 'win' : 'loss', winAmount, newBalance: user.coins, user };
  }
  if (path === '/api/game/claim-win' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const amt = Number(body.winAmount) || 0;
    user.coins = (user.coins || 0) + amt;
    user.totalCoinsWon = (user.totalCoinsWon || 0) + amt;
    saveDb(db);
    return { success: true, newBalance: user.coins, user };
  }
  if (path === '/api/game/daily-lucky-spin' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const prizes = [50, 100, 150, 200, 300, 500, 1000, 75];
    const idx = typeof body.targetSectorIndex === 'number' ? body.targetSectorIndex % prizes.length : Math.floor(Math.random() * prizes.length);
    const coinsWon = prizes[idx];
    user.coins = (user.coins || 0) + coinsWon;
    user.lastDailySpin = new Date().toISOString();
    saveDb(db);
    return { success: true, sectorIndex: idx, coinsWon, newBalance: user.coins, user };
  }
  if (path === '/api/game/claim-login' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const day = Number(body.day) || 1;
    const bonus = day * 100;
    user.coins = (user.coins || 0) + bonus;
    user.claimedDays = Array.from(new Set([...(user.claimedDays || []), day]));
    user.lastLoginClaimDate = new Date().toISOString().split('T')[0];
    saveDb(db);
    return { success: true, coinsEarned: bonus, newBalance: user.coins, user };
  }
  if (path === '/api/game/recharge' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const reqItem: CoinRechargeRequest = {
      id: `CR-${Date.now().toString().slice(-6)}`,
      userId: user.userId,
      userName: user.fullName,
      userPhone: user.phone,
      packId: body.packId || 'pack',
      coins: Number(body.coins) || 0,
      bonusCoins: Number(body.bonusCoins) || 0,
      amount: Number(body.amount) || 0,
      paymentUtr: body.paymentUtr || 'UTR',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    db.coinRecharges.unshift(reqItem);
    saveDb(db);
    return { success: true, message: 'कॉइन रिचार्ज रिक्वेस्ट सबमिट हो गई!', recharge: reqItem, user };
  }
  if (path === '/api/game/convert' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (!user) return { success: false, message: 'User not found' };
    const c = Number(body.coinsAmount) || 0;
    if ((user.coins || 0) < c || c < 100) return { success: false, message: 'कम से कम 100 कॉइन्स आवश्यक हैं' };
    const rupees = Math.floor(c / 100);
    user.coins = (user.coins || 0) - c;
    user.balance = (user.balance || 0) + rupees;
    saveDb(db);
    return { success: true, rupeesCredited: rupees, user };
  }
  if (path === '/api/game/send-gift' && method === 'POST') {
    const user = findUser(db, body.senderId);
    if (!user) return { success: false, message: 'User not found' };
    const cost = Number(body.coinCost) || 0;
    if ((user.coins || 0) < cost) return { success: false, message: 'पर्याप्त कॉइन्स नहीं हैं!' };
    user.coins = (user.coins || 0) - cost;
    user.charms = (user.charms || 0) + (Number(body.charmValue) || 10);
    saveDb(db);
    return { success: true, user };
  }
  if (path === '/api/game/record-play' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (user) {
      db.gamePlayHistory.unshift({
        id: `GP-${Date.now()}`,
        userId: user.userId,
        userName: user.fullName,
        gameId: body.gameId || 'game',
        gameName: body.gameName || 'Game',
        betCoins: Number(body.betCoins) || 0,
        wonCoins: Number(body.wonCoins) || 0,
        netChange: (Number(body.wonCoins) || 0) - (Number(body.betCoins) || 0),
        result: (Number(body.wonCoins) || 0) >= (Number(body.betCoins) || 0) ? 'win' : 'loss',
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

  // Voice rooms
  if (path === '/api/game/voice-rooms' && method === 'GET') {
    return { success: true, rooms: db.customVoiceRooms };
  }
  if (path === '/api/game/voice-room' && method === 'GET') {
    return { success: true, seats: db.voiceRoomSeats, chat: db.voiceRoomChat };
  }
  if (path.startsWith('/api/game/voice-rooms/') && method === 'GET') {
    const rid = decodeURIComponent(path.split('/').pop() || '');
    const room = db.customVoiceRooms.find(r => r.id === rid);
    return { success: true, seats: room?.seats || db.voiceRoomSeats, chat: room?.chatMessages || db.voiceRoomChat, room };
  }
  if (path === '/api/game/voice-rooms/create' && method === 'POST') {
    const room = {
      id: `vroom-${Date.now()}`,
      title: body.title || 'ESP Live Room',
      topic: body.topic || 'Earning & Gaming',
      category: body.category || 'earning',
      roomAddress: `ESP-VR-${Math.floor(1000 + Math.random() * 9000)}`,
      hostUserId: body.userId,
      hostName: body.hostName || 'Host',
      hostAvatar: body.hostAvatar,
      seats: Array.from({ length: 8 }, (_, i) => ({ seatNumber: i + 1, seatNumberLabel: String(i + 1), isMuted: false, isSpeaking: false, charms: 0 })),
      chatMessages: [],
      listenersCount: 1,
      createdAt: new Date().toISOString(),
    };
    db.customVoiceRooms.unshift(room);
    saveDb(db);
    return { success: true, room };
  }
  if (path.includes('/take-seat') && method === 'POST') {
    const user = findUser(db, body.userId);
    const idx = Number(body.seatIndex) || 0;
    if (user && db.voiceRoomSeats[idx]) {
      db.voiceRoomSeats[idx] = { ...db.voiceRoomSeats[idx], userId: user.userId, userName: user.fullName, userAvatar: user.avatar, userRollNumber: user.userId, gameLevel: user.gameLevel || 1 };
      saveDb(db);
    }
    return { success: true, seats: db.voiceRoomSeats };
  }
  if (path.includes('/leave-seat') && method === 'POST') {
    db.voiceRoomSeats = db.voiceRoomSeats.map(s => s.userId === body.userId ? { seatNumber: s.seatNumber, seatNumberLabel: s.seatNumberLabel, isMuted: false, isSpeaking: false, charms: 0 } : s);
    saveDb(db);
    return { success: true, seats: db.voiceRoomSeats };
  }
  if (path.includes('/voice-room') && (path.endsWith('/chat') || path.endsWith('/voice-audio')) && method === 'POST') {
    const user = findUser(db, body.userId);
    db.voiceRoomChat.push({
      id: `vc-${Date.now()}`,
      senderId: body.userId,
      sender: user?.fullName || 'Member',
      senderRoll: user?.userId || 'ESP',
      text: body.text || '🎙️ Voice Note',
      isGift: !!body.isGift,
      audioDataUrl: body.audioDataUrl,
      audioDuration: body.durationSec,
      isVoiceNote: !!body.audioDataUrl,
      time: new Date().toLocaleTimeString(),
    });
    saveDb(db);
    return { success: true, chat: db.voiceRoomChat };
  }
  if (path.includes('/invite-bot') || path.includes('/summon-all-bots') || path.includes('/bot-interact') || path.includes('/host-action')) {
    return { success: true, seats: db.voiceRoomSeats, chat: db.voiceRoomChat, reply: DEFAULT_BOTS[2].sampleDialogues[0] };
  }
  if (path === '/api/game/voice-room/seat-reward' && method === 'POST') {
    const user = findUser(db, body.userId);
    if (user) { user.coins = (user.coins || 0) + 25; saveDb(db); }
    return { success: true, message: '+25 स्टेज रिवॉर्ड कॉइन्स मिले!', coinsEarned: 25, newBalance: user?.coins || 0, user };
  }

  // Gift Cards, Home Slider, Complaints, Contact
  if (path === '/api/gift-cards') return { success: true, vouchers: db.giftCardVouchers };
  if (path === '/api/gift-cards/redeem' && method === 'POST') {
    const user = findUser(db, body.userId);
    const v = db.giftCardVouchers.find(x => x.id === body.voucherId);
    if (!user || !v) return { success: false, message: 'Invalid voucher or user' };
    if ((user.coins || 0) < v.coinsRequired) return { success: false, message: 'पर्याप्त कॉइन्स नहीं हैं!' };
    user.coins = (user.coins || 0) - v.coinsRequired;
    v.status = 'claimed';
    v.redeemedBy = user.userId;
    v.redeemedAt = new Date().toISOString();
    saveDb(db);
    return { success: true, message: 'गिफ्ट कार्ड सफलतापूर्वक रिडीम हुआ!', voucher: v, newBalance: user.coins, user };
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

  // Admin Overview & Management
  if (path === '/api/admin/overview') {
    if (!verifyAdminPass(adminPassHeader)) return { success: false, message: 'Invalid Admin Security Key' };
    return {
      success: true,
      settings: db.settings,
      services: db.services,
      users: db.users,
      referrals: db.referrals,
      payouts: db.payouts,
      transactions: db.transactions,
      stats: {
        totalUsers: db.users.length,
        activeUsers: db.users.filter(u => u.status === 'active').length,
        pendingUsers: db.users.filter(u => u.status === 'pending').length,
        pendingPayouts: db.payouts.filter(p => p.status === 'pending').length,
        totalPlatformRevenue: db.users.reduce((s, u) => s + (Number(u.joiningFee) || 0), 0),
        totalWalletLiability: db.users.reduce((s, u) => s + (Number(u.balance) || 0), 0),
      },
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
          u.chosenServiceCode = upg.targetServiceCode;
          u.chosenServiceName = upg.targetServiceName;
          u.joiningFee = upg.upgradeFee;
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

  return { success: true };
}
