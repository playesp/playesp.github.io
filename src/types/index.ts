export type ServiceType = 
  | 'EMO' // Earn Money Online
  | 'MMO' // Make Money Online
  | 'MOM' // Make Online Money
  | 'OES' // Online Earning System
  | 'MMS' // Money Making System
  | 'NWI' // Non Working Income
  | 'SWI' // Self Working Income
  | 'TWI' // Team Working Income
  | 'PROMOTE' // Promote & Earn
  | 'REFER'; // Refer & Earn

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  description: string;
  hindiDescription: string;
  category: 'direct' | 'passive' | 'team' | 'task';
  joiningFeeTiers: number[];
  defaultFee: number;
  dailyEarningEst: string;
  referralBonusPercent: number; // e.g. 40%
  icon: string;
  features: string[];
  active: boolean;
}

export interface PrivacySettings {
  showPhone: boolean; // default: false (masked)
  showEmail: boolean; // default: false (masked)
  showAddress: boolean; // default: false (hidden)
}

export interface EditAuditRecord {
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface UserSession {
  sessionId: string;
  token: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string; // e.g. "Android Mobile (Chrome)", "Windows PC (Chrome)", "iPhone (Safari)"
  browser: string;
  os: string;
  ipAddress?: string;
  loginTime: string;
  lastActive: string;
  isCurrent?: boolean;
}

export interface UserProfile {
  id: string; // Database ID
  userId: string; // E.g. ESP10RK01
  fullName: string;
  phone: string; // WhatsApp number
  email: string;
  fullAddress: string;
  paymentAddress: string; // UPI ID or Bank Details
  payoutUpiId: string;
  password?: string;
  
  // Sponsor info
  sponsorId: string; // EMO-MOM-MMO or referrer code
  sponsorName: string; // SANTOSH KUMAR or referrer name
  
  // Service chosen
  chosenServiceCode: string;
  chosenServiceName: string;
  joiningFee: number;
  joiningDate: string; // YYYY-MM-DD
  
  // Payment verification
  paymentUtr: string;
  paymentScreenshot?: string;
  status: 'active' | 'pending' | 'rejected';
  verifiedAt?: string;
  
  // Wallet
  balance: number;
  totalEarnings: number;
  referralEarnings: number;
  promoEarnings: number;
  totalWithdrawn: number;

  // WePlay-Style ESP Gaming Time Profile
  gamingId?: string; // Dedicated Gaming Time ID (e.g. GAME-887749 or WPG-90123)
  coins?: number; // In-game coins balance (e.g. 5,000)
  charms?: number; // Charm points received from gifts (e.g. 150)
  gameLevel?: number; // Player level 1-50 (e.g. 5: Bronze to King)
  gameXp?: number; // Current XP points
  roomAddress?: string; // Personal Gaming House / Voice Room ID (e.g. ESP-ROOM-8877)
  houseName?: string; // E.g. "Royal House of Santosh"
  clanName?: string; // Family / Clan (e.g. "Royal Warriors ESP")
  clanRole?: 'Leader' | 'Elder' | 'Member';
  loginStreak?: number; // 7-Day Login Streak (1-7)
  lastLoginClaimDate?: string; // Date of last claimed reward
  claimedDays?: number[]; // Array of claimed days e.g. [1, 2]
  lastDailySpin?: string; // ISO date timestamp of last 24h lucky spin
  friendsCount?: number;
  visitorCount?: number;
  crownPost?: boolean;
  frameType?: 'royal-dragon-crown' | 'cosmic-neon' | 'vip-gold' | 'wolf-night' | 'judge-justice' | 'standard' | 'pro-player' | 'rookie' | 'clan-leader' | string;
  vipTitle?: string;

  
  // Privacy Settings (Default masked on public views)
  privacySettings?: PrivacySettings;

  // Active Multi-Device Sessions
  activeSessions?: UserSession[];

  // Initial Form Data Backup (Admin audit)
  initialFormData?: {
    fullName: string;
    phone: string;
    email: string;
    fullAddress: string;
    paymentAddress: string;
    chosenServiceCode: string;
    joiningFee: number;
    joiningDate: string;
    paymentUtr: string;
    paymentScreenshot?: string;
  };

  // Edit History Tracking
  editHistory?: EditAuditRecord[];

  // Metadata
  role: 'member' | 'admin';
  avatar?: string;
  bio?: string;
  gender?: string;
  createdAt: string;
  lastLogin?: string;

  // Rock-solid Database Persistence (Replacing localStorage)
  totalDaysPlayed?: number;
  daysPlayed?: string[]; // Array of unique played dates e.g. ["2026-11-08", "2026-11-09"]
  totalGamesPlayed?: number;
  totalGamesWon?: number;
  totalGamesLost?: number;
  totalCoinsWon?: number;
  totalCoinsSpent?: number;
  totalOnlineMinutes?: number;
  isOnline?: boolean;
  lastActiveTime?: string;
  lastSessionStart?: string;
  
  // Daily Tasks & Gaming state persisted in server database
  claimedTasksDate?: string;
  claimedTasksList?: string[];
  openedTimedBoxes?: string[];
  unlockedRooms?: string[];
  roomTheme?: string;
  voiceEffect?: string;
  accountType?: 'business' | 'gamer'; // Dual registration type

  // SWI Special 3.3% Recharge App Link (Shared by Admin after verification)
  swiAppLink?: string;
  swiAppSharedAt?: string;
  swiAppNote?: string;

  // Real NWI Level Team Claim Tracker (Prevents duplicate claims on real downline members)
  nwiClaimedMemberIds?: string[];
}

export interface HomeSliderPhoto {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  telegramUsername?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
  adminReply?: string;
}

export interface GiftCardVoucher {
  id: string;
  brand: 'Amazon' | 'Flipkart' | 'Google Play' | 'ESP Digital Store' | 'UPI Cash Voucher' | string;
  title: string;
  hindiTitle: string;
  denomination: number; // e.g. ₹50, ₹100, ₹250, ₹500
  valueInRupees?: number;
  coinsRequired: number; // e.g. 5000 coins
  voucherCode: string;
  voucherPin?: string;
  validityDays: number;
  description: string;
  instructions?: string;
  redeemedBy?: string;
  redeemedAt?: string;
  status: 'available' | 'claimed';
}

export interface ReferralRecord {
  id: string;
  sponsorUserId: string;
  downlineUserId: string;
  downlineName: string;
  downlinePhone: string;
  serviceCode: string;
  joiningFee: number;
  commissionAmount: number;
  status: 'credited' | 'pending' | 'rejected';
  date: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'referral_credit' | 'promo_bonus' | 'non_working_pool' | 'nwi_level_income' | 'level_income' | 'plan_upgrade' | 'withdrawal' | 'signup_bonus';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
}

export interface PlanUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  fromServiceCode: string;
  fromFee: number;
  targetServiceCode: string;
  targetServiceName: string;
  upgradeFee: number;
  paymentUtr: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface NwiMemberNode {
  userId: string;
  fullName: string;
  avatar?: string;
  joiningDate: string;
  planFee: number;
  level: 1 | 2 | 3;
  spilloverFrom: string; // e.g. "Global Auto-Spillover" or "Community Placement"
  rewardEarned: number; // Income generated for user at this level
  status: 'active' | 'pending';
}

export interface NwiTreeRecord {
  userId: string;
  userName: string;
  isActive: boolean;
  activatedAt: string;
  tierFee: number;
  level1Members: NwiMemberNode[]; // Max 3 members
  level2Members: NwiMemberNode[]; // Max 9 members
  level3Members: NwiMemberNode[]; // Max 27 members
  level1Income: number; // Level 1 total passive income
  level2Income: number; // Level 2 total passive income
  level3Income: number; // Level 3 total passive income
  totalPassiveEarned: number;
  totalPassiveClaimed: number;
  pendingToClaim: number;
  queuePosition: number;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  payoutAddress: string; // UPI ID
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  transactionRef?: string;
}

export interface PlatformSettings {
  ownerName: string;
  ownerSponsorId: string;
  adminUpiId: string;
  adminPayeeName: string;
  adminQrCodeUrl: string;
  contactAddress: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
  telegramUsername?: string;
  telegramLink?: string;
  minWithdrawal: number;
  defaultReferralCommissionRate: number; // e.g. 0.40 (40%)
  blogReferenceUrl: string;
  joiningFormUrl: string;
  bannerNotice: string;
  homeSliderPhotos?: HomeSliderPhoto[];
  swiSpecialAppLink?: string;
  swiSpecialAppName?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'referral' | 'payment' | 'system' | 'withdrawal';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  options?: string[];
}

// Daily Moments / Status Feed Types
export interface MomentComment {
  id: string;
  userId: string;
  userName: string;
  userRollNumber: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Moment {
  id: string;
  userId: string;
  userName: string;
  userRollNumber: string;
  userAvatar?: string;
  caption: string;
  imageUrl?: string;
  serviceTag?: string;
  createdAt: string;
  likes: string[]; // User IDs who liked
  comments: MomentComment[];
  sharesCount: number;
}

// WhatsApp-style Chatting Club Types
export interface ChatRoom {
  id: string;
  name: string;
  hindiName?: string;
  description: string;
  category: 'community' | 'service' | 'group' | 'help';
  avatar?: string;
  createdById?: string;
  membersCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface ClubChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRollNumber: string;
  senderAvatar?: string;
  text: string;
  imageUrl?: string;
  createdAt: string;
  likes?: number;
}

export interface UserContact {
  id: string;
  userId: string;
  contactRollNumber: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
  addedAt: string;
}

// ===================== WEPLAY-STYLE ESP GAMING ROOM TYPES =====================

export interface VoiceChatMessage {
  id: string;
  senderId: string;
  sender: string;
  senderRoll?: string;
  senderAvatar?: string;
  text: string;
  audioDataUrl?: string; // Real WebM / Base64 recorded voice
  audioDuration?: number;
  isVoiceNote?: boolean;
  isGift?: boolean;
  time: string;
}

export interface CustomVoiceRoom {
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
  chatMessages: VoiceChatMessage[];
  listenersCount: number;
}

export interface VoiceRoomSeat {
  seatNumber: number;
  seatNumberLabel?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userRollNumber?: string;
  gameLevel?: number;
  isMuted: boolean;
  isSpeaking: boolean;
  charms: number;
}

export interface RoomGift {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  coinCost: number;
  charmValue: number;
  animationType: 'rose' | 'chocolate' | 'ring' | 'car' | 'rocket' | 'crown' | 'castle' | string;
  gradient: string;
}

export interface ClanInfo {
  id: string;
  name: string;
  hindiName: string;
  badge: string;
  level: number;
  power: number;
  membersCount: number;
  maxMembers: number;
  leaderName: string;
  description: string;
  perks: string[];
}

export interface CoinGameRecord {
  id: string;
  userId: string;
  gameName: 'Spin & Win' | 'Lucky Dice' | 'Coin Flip';
  betAmount: number;
  winAmount: number;
  result: 'win' | 'loss';
  multiplier: number;
  date: string;
}

export interface LoginRewardDay {
  day: number;
  rewardType: 'coins' | 'booster' | 'charms' | 'frame' | 'mega_chest';
  rewardLabel: string;
  coinsAmount: number;
  icon: string;
}

export interface CardShowcaseType {
  id: 'service_pattern' | 'sponsor' | 'promotion' | 'business_setup' | 'ads_visitor' | 'moment';
  title: string;
  hindiTitle: string;
  badge: string;
  description: string;
}

export interface CoinRechargeRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  packId: string;
  coins: number;
  bonusCoins: number;
  amount: number;
  paymentUtr: string;
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export type WePlayBotCode = 'judge' | 'wolf' | 'we_bhai' | 'we_chat' | 'alert_bot' | 'sharma_ji';

export interface WePlayBot {
  id: string;
  code: WePlayBotCode;
  name: string;
  hindiName: string;
  roleTitle: string;
  hindiRole: string;
  avatar: string;
  frameType: 'royal-dragon-crown' | 'cosmic-neon' | 'vip-gold' | 'wolf-night' | 'judge-justice';
  level: number;
  charms: number;
  coins: number;
  description: string;
  hindiDescription: string;
  superpowers: string[];
  status: 'online' | 'active_stage' | 'gaming';
  sampleDialogues: string[];
  voiceAccent?: string;
  badge: string;
}

export interface WerewolfPlayer {
  id: string;
  name: string;
  isBot: boolean;
  avatar: string;
  role: 'werewolf' | 'seer' | 'doctor' | 'villager';
  isAlive: boolean;
  votesReceived: number;
}

// ======================== ROCK-SOLID PERSISTENT DATABASE ENTITIES ========================

export interface UserComplaint {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userRoll: string;
  category: 'payment_upi' | 'game_coins' | 'account' | 'sponsor_team' | 'technical' | 'other';
  categoryLabel: string;
  subject: string;
  description: string;
  proofScreenshot?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'rejected';
  adminResponse?: string;
  adminResolvedBy?: string;
  refundCoins?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface GamePlayRecord {
  id: string;
  userId: string;
  userName: string;
  gameId: 'ludo' | 'dice' | 'cards' | 'lucky_spin' | 'fortune_wheel' | 'mystery_chest' | 'voice_room' | string;
  gameName: string;
  betCoins: number;
  wonCoins: number;
  netChange: number;
  result: 'win' | 'loss' | 'draw' | 'reward';
  durationSeconds: number;
  playedAt: string;
  details?: string;
}

export interface CoinTransactionRecord {
  id: string;
  userId: string;
  userName: string;
  type: 'credit' | 'debit';
  category: 'game_win' | 'game_bet' | 'daily_login' | 'daily_task' | 'fortune_spin' | 'mystery_chest' | 'gift_sent' | 'gift_received' | 'recharge' | 'level_up' | 'admin_adjustment';
  categoryLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export interface ProfileAuditRecord {
  id: string;
  userId: string;
  userName: string;
  changedBy: 'user' | 'admin';
  changedByName?: string;
  changeType: 'profile_update' | 'upi_change' | 'phone_change' | 'status_change' | 'avatar_change' | 'clan_change';
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface OnlineActivitySession {
  id: string;
  userId: string;
  userName: string;
  sessionStart: string; // ISO
  sessionEnd?: string; // ISO
  lastHeartbeat: string; // ISO
  durationMinutes: number;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string;
  browser: string;
  os: string;
  ipAddress?: string;
  status: 'online' | 'offline';
}



