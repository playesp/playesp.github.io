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

export interface UserWorkspaceState {
  lastTab?: string;
  lastGamingSubTab?: string;
  lastDashboardTab?: string;
  lastRoomAddress?: string;
  updatedAt?: string;
}

export interface UserSession {
  sessionId: string;
  token: string;
  deviceId?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string; // e.g. "Android Mobile (Chrome)", "Windows PC (Chrome)", "iPhone (Safari)"
  browser: string;
  os: string;
  ipAddress?: string;
  loginTime: string;
  lastActive: string;
  lastTab?: string;
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

  // ESP PLAY Profile, Bonds, Family & Voice Room Extensions
  gamingId?: string; // Dedicated Gaming Time ID (e.g. GAME-887749)
  coins?: number; // Real In-game coins balance (New players always start at 0)
  charms?: number; // Charm points received from gifts (Starts at 0)
  gameLevel?: number; // Player level derived from EXP (Starts at 1)
  gameXp?: number; // Current EXP points earned from real completed tasks & games (Starts at 0)
  roomAddress?: string; // Unique Numeric Counting Room ID (e.g. 10001) or VIP Room ID (e.g. 1111, 2222, 1234)
  personalRoomId?: string; // Permanent Numeric Personal Room ID (same as roomAddress)
  isVipRoom?: boolean; // Assigned VIP fancy numeric Room ID status
  vipRoomLabel?: string; // Optional badge label (e.g. VIP Royal, VIP King)
  vipRoomAssignedAt?: string;
  vipRoomAssignedBy?: string;
  followedRooms?: string[]; // Room IDs followed by the user
  ownedRelationshipTokens?: string[];
  activeRelationships?: RelationshipBond[];
  familyId?: string;
  familyRole?: 'Founder' | 'Vice Leader' | 'Elder' | 'Member';
  familyCoinsContributed?: number;
  unlockedRoomTiers?: string[];
  claimedEventIds?: string[];
  houseName?: string;
  clanName?: string;
  clanRole?: 'Leader' | 'Elder' | 'Member';
  loginStreak?: number;
  lastLoginClaimDate?: string;
  claimedDays?: number[];
  lastDailySpin?: string; // ISO date timestamp of last paid 50-coin lucky spin
  friendsCount?: number;
  friendsList?: string[]; // Real added friend userIds
  receivedGifts?: Record<string, { id: string; name: string; icon: string; count: number; coinCost?: number; charmValue?: number; lastReceivedAt?: string; lastSenderName?: string }>;
  visitorCount?: number;
  crownPost?: boolean;
  frameType?: 'royal-dragon-crown' | 'cosmic-neon' | 'vip-gold' | 'wolf-night' | 'judge-justice' | 'standard' | 'pro-player' | 'rookie' | 'clan-leader' | string;
  unlockedFrames?: string[]; // Purchased/unlocked frame variants (always includes 'standard')
  vipTier?: 'none' | 'silver' | 'gold' | 'diamond';
  vipTitle?: string;
  vipPurchasedAt?: string;

  // Real Server-Verified Daily Task System (Daily, Activeness Chests, Growth & Family)
  taskProgress?: Record<string, number>; // Tracks verified counts by TaskEventType or date
  taskProgressDate?: string; // YYYY-MM-DD reset tracker for daily tasks
  claimedTaskIds?: string[]; // Task IDs claimed for current date
  tasksCompletedCount?: number; // Cumulative count of completed tasks
  claimedChestMilestones?: string[]; // Unlocked milestone chest IDs for current date
  todayActiveness?: number; // Daily activeness points (0 - 100+, resets 12:00 AM IST)
  claimedActivenessChests?: number[]; // Thresholds claimed today: [10, 40, 70, 100]
  claimedGrowthTaskIds?: string[]; // Permanent one-time Growth achievement task IDs claimed
  claimedFamilyTaskIds?: string[]; // Daily Family task IDs claimed for current date
  
  // Privacy Settings (Default masked on public views)
  privacySettings?: PrivacySettings;

  // Active Multi-Device Sessions (Max 4 devices per account)
  activeSessions?: UserSession[];
  terminatedTokens?: string[];
  maxDevices?: number;
  workspaceState?: UserWorkspaceState;

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
  username?: string; // Unique lowercase handle (e.g. rahul_01 -> @rahul_01)
  avatar?: string;
  coverPhoto?: string; // Custom profile cover photo
  bio?: string;
  gender?: string;
  birthday?: string;
  location?: string; // City / Region / Country displayed on profile
  showEspShowOnHome?: boolean;
  priceTag?: string;
  createdAt: string;
  lastLogin?: string;

  // Rock-solid Database Persistence
  totalDaysPlayed?: number;
  daysPlayed?: string[];
  totalGamesPlayed?: number;
  totalGamesWon?: number;
  totalGamesLost?: number;
  totalCoinsWon?: number;
  totalCoinsSpent?: number;
  totalOnlineMinutes?: number;
  isOnline?: boolean;
  lastActiveTime?: string;
  lastSessionStart?: string;
  
  // Task & Gaming state persisted in server database
  claimedTasksDate?: string;
  claimedTasksList?: string[];
  openedTimedBoxes?: string[];
  unlockedRooms?: string[];
  roomTheme?: string;
  voiceEffect?: string;
  accountType?: 'business' | 'gamer';

  // SWI Special 3.3% Recharge App Link (Shared by Admin after verification)
  swiAppLink?: string;
  swiAppSharedAt?: string;
  swiAppNote?: string;

  // Real NWI Level Team Claim Tracker
  nwiClaimedMemberIds?: string[];

  // Daily Gaming Retention, Fresh Intel Quiz, Free Skill Play & Coin Power Boosters
  lastDailyCheckInDate?: string; // YYYY-MM-DD
  dailyQuizDate?: string; // YYYY-MM-DD
  dailyQuizCorrectCount?: number;
  dailyFreeGameDate?: string; // YYYY-MM-DD
  dailyFreeGamesPlayed?: number;
  coinBoosterUntil?: string; // ISO timestamp for 2x Game Coin & EXP Surge Pass
  streakShields?: number; // Purchased with Coins to protect 7-day check-in streak

  // Referral Link Click Tracking
  referralClicks?: number;
  referralClickHistory?: Array<{ date: string; count: number }>;
  registeredFromHost?: string;
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
  denomination: number;
  valueInRupees?: number;
  coinsRequired: number;
  voucherCode?: string;
  voucherPin?: string;
  validityDays?: number;
  description: string;
  instructions?: string;
  redeemedBy?: string;
  redeemedAt?: string;
  status: 'available' | 'pending_fulfillment' | 'fulfilled' | 'claimed';
}

export interface GiftCardRedemption {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  catalogId: string;
  brand: string;
  title: string;
  denomination: number;
  coinsSpent: number;
  status: 'pending_fulfillment' | 'fulfilled' | 'rejected';
  voucherCode?: string;
  voucherPin?: string;
  rejectionReason?: string;
  requestedAt: string;
  fulfilledAt?: string;
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
  type:
    | 'referral_credit'
    | 'promo_bonus'
    | 'non_working_pool'
    | 'nwi_level_income'
    | 'level_income'
    | 'plan_upgrade'
    | 'withdrawal'
    | 'payout_refund'
    | 'recharge_order'
    | 'coin_convert';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
}

export interface PlanUpgradeRequest {
  id: string;
  userId: string;
  userName: string;
  fromAccountType?: 'business' | 'gamer';
  upgradeType?: 'plan_upgrade' | 'gamer_to_business';
  fromServiceCode: string;
  fromFee: number;
  targetServiceCode: string;
  targetServiceName: string;
  upgradeFee: number;
  paymentUtr: string;
  paymentScreenshot?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface PublicSponsorPreview {
  valid: boolean;
  sponsorId: string;
  sponsorUsername?: string;
  sponsorName: string;
  chosenServiceCode?: string;
  chosenServiceName?: string;
  vipTier?: string;
  avatar?: string;
  gameLevel?: number;
  isOwner?: boolean;
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

export interface MomentPostStyle {
  fontFamily?: 'sans' | 'serif' | 'display' | 'cursive' | 'mono' | 'elegant';
  bgTheme?:
    | 'classic'
    | 'royal_blue'
    | 'sunset_rose'
    | 'emerald_wave'
    | 'midnight_gold'
    | 'peach_pastel'
    | 'neon_cyber'
    | 'crimson_love';
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  textEffect?: 'none' | 'shadow' | 'glow' | 'outline';
  photoFrame?: 'clean' | 'polaroid' | 'rounded_glow' | 'cinema';
  feeling?: string;
  locationText?: string;
  privacy?: 'public' | 'friends';
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
  postStyle?: MomentPostStyle;
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

// ===================== ESP PLAY GAMING ROOM, BONDS & FAMILY TYPES =====================

export interface RelationshipBond {
  id: string;
  tokenId: string;
  tagName: string;
  badgeIcon: string;
  partnerUserId: string;
  partnerName: string;
  partnerUsername?: string;
  partnerAvatar?: string;
  intimacyPoints: number;
  status: 'pending' | 'pending_incoming' | 'pending_outgoing' | 'accepted';
  initiatorUserId?: string;
  createdAt: string;
}

export interface EspFamilyMember {
  userId: string;
  fullName: string;
  username?: string;
  avatar?: string;
  role: 'Founder' | 'Vice Leader' | 'Elder' | 'Member';
  gameLevel?: number;
  contributedCoins: number;
  joinedAt: string;
}

export interface FamilyChatMessage {
  id: string;
  familyId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: string;
  text: string;
  isGift?: boolean;
  giftId?: string;
  giftIcon?: string;
  giftName?: string;
  giftCount?: number;
  giftQuantity?: number;
  giftTargetName?: string;
  recipientName?: string;
  coinCost?: number;
  time?: string;
  createdAt: string;
}

export interface EspFamily {
  id: string;
  familyCode: string;
  name: string;
  emblem: string;
  motto: string;
  founderUserId: string;
  founderName: string;
  familyLevel: number;
  level?: number;
  familyCoins: number;
  familyCharms: number;
  maxMembers: number;
  isOpenJoin: boolean;
  members: EspFamilyMember[];
  chatMessages: FamilyChatMessage[];
  createdAt: string;
}

export interface GiftHistoryRecord {
  id: string;
  giftId: string;
  giftName: string;
  giftIcon: string;
  quantity: number;
  coinCost: number;
  charmValue: number;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId?: string;
  recipientName: string;
  recipientAvatar?: string;
  context: 'voice_room' | 'family_chat' | 'profile';
  roomId?: string;
  familyId?: string;
  createdAt: string;
}

export interface PkBattleState {
  id?: string;
  active: boolean;
  title: string;
  redTeamName?: string;
  blueTeamName?: string;
  redLabel?: string;
  blueLabel?: string;
  redScore: number;
  blueScore: number;
  startedByUserId?: string;
  startedBy?: string;
  startedAt: string;
  endsAt: string;
  winner?: 'red' | 'blue' | 'draw' | null;
  winnerSide?: 'red' | 'blue' | 'draw' | null;
}

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

export type VoiceRoomStageLayout = 'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party';

export type RoomAtmosphereEffect = 'none' | 'sparkles' | 'petals' | 'fireflies' | 'snow' | 'neon_lasers';

export interface RoomPacketDrop {
  id: string;
  roomId: string;
  packetType: 'red' | 'blue';
  senderUserId: string;
  senderName: string;
  senderAvatar?: string;
  totalCoins: number;
  remainingCoins: number;
  maxClaims: number;
  claimedBy: Array<{
    userId: string;
    fullName: string;
    coinsWon: number;
    xpWon?: number;
    claimedAt: string;
  }>;
  message?: string;
  createdAt: string;
  expiresAt: string;
}

export interface DirectMessageRecord {
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
}

export interface CustomVoiceRoom {
  id: string;
  title: string;
  topic: string;
  category: 'earning' | 'gaming' | 'chitchat' | 'clan' | 'help';
  roomAddress: string; // Unique Numeric Room ID e.g. 10001 or VIP 1111
  roomNumber?: string; // Numeric Room Number alias
  isPersonalFixed?: boolean;
  isVipRoom?: boolean;
  vipRoomLabel?: string;
  roomTier?: 'normal' | 'silver_club' | 'gold_palace' | 'diamond_theater';
  isPremiumRoom?: boolean;
  roomEffect?: RoomAtmosphereEffect;
  activePackets?: RoomPacketDrop[];
  pkBattle?: PkBattleState | null;
  hostUserId: string;
  hostName: string;
  hostUsername?: string;
  hostAvatar?: string;
  hostLevel?: number;
  hostCharms?: number;
  wallpaperId?: string;
  customWallpaperUrl?: string;
  stageLayout?: VoiceRoomStageLayout;
  youtubeVideoUrl?: string;
  youtubeVideoTitle?: string;
  lockedSeats?: number[]; // 0-indexed seat indices locked by owner
  followers?: string[];
  followersCount?: number;
  isFollowed?: boolean;
  roomCharms?: number;
  audience?: string[];
  topContributors?: Array<{
    userId: string;
    fullName: string;
    avatar?: string;
    coins: number;
  }>;
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
  isLocked?: boolean;
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
  category:
    | 'game_win'
    | 'game_bet'
    | 'daily_task'
    | 'task_chest'
    | 'fortune_spin'
    | 'gift_sent'
    | 'gift_received'
    | 'recharge'
    | 'vip_purchase'
    | 'frame_purchase'
    | 'room_purchase'
    | 'gift_card_redeem'
    | 'coin_convert'
    | 'daily_checkin'
    | 'daily_quiz'
    | 'skill_game_reward'
    | 'coin_booster'
    | 'coin_recharge'
    | 'packet_drop'
    | 'packet_claim'
    | 'admin_adjustment';
  categoryLabel: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export interface LiveTimeMeta {
  serverIso: string;
  istDate: string;
  istTimeLabel: string;
  secondsUntilMidnight: number;
  nextResetAtIso: string;
  syncSource?: string;
  clockSkewMs?: number;
  lastSyncedIso?: string;
}

export interface DailyGameHubData {
  today: string;
  timeMeta?: LiveTimeMeta;
  intel: {
    id: string;
    category: string;
    title: string;
    fact: string;
    proTip: string;
  };
  quiz: {
    id: string;
    topic: string;
    question: string;
    options: string[];
    coinReward: number;
    xpReward: number;
    alreadyAnswered: boolean;
  };
  spotlightGame: {
    key: string;
    title: string;
    hindiTitle: string;
    icon: string;
    bonusLabel: string;
    extraCoins: number;
  };
  checkIn: {
    canClaimToday: boolean;
    currentStreak: number;
    nextDayNumber: number;
    streakAtRisk: boolean;
    streakMissedReset?: boolean;
    streakShields: number;
    schedule: Array<{
      day: number;
      coins: number;
      xp: number;
      label: string;
      claimed: boolean;
      isToday: boolean;
    }>;
  };
  freePlay: {
    playedToday: number;
    dailyLimit: number;
    remaining: number;
    coinBoosterActive: boolean;
    coinBoosterUntil?: string | null;
  };
  topDailyPlayers: Array<{
    userId: string;
    fullName: string;
    username?: string;
    avatar?: string;
    gameLevel: number;
    gameXp: number;
    coins: number;
    totalGamesWon: number;
  }>;
}

export interface RealTaskStatus {
  id: string;
  eventType: string;
  title: string;
  hindiTitle: string;
  description: string;
  coinReward: number;
  activenessReward?: number;
  xpReward: number;
  targetCount: number;
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
  actionTab: string;
  actionLabel: string;
}

export interface ActivenessChestStatus {
  threshold: number;
  label: string;
  coinReward: number;
  xpReward: number;
  tierColor: 'green' | 'blue' | 'gold' | 'royal';
  isUnlocked: boolean;
  isClaimed: boolean;
}

export interface GrowthTaskStatus {
  id: string;
  title: string;
  description: string;
  coinReward: number;
  xpReward: number;
  currentProgress: number;
  targetCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionTab: string;
}

export interface FamilyTaskStatus {
  id: string;
  title: string;
  description: string;
  coinReward: number;
  activenessReward: number;
  xpReward: number;
  currentProgress: number;
  targetCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionTab: string;
}

export interface ProfileAuditRecord {
  id: string;
  userId: string;
  userName: string;
  changedBy: 'user' | 'admin';
  changedByName?: string;
  changeType: 'profile_update' | 'upi_change' | 'phone_change' | 'status_change' | 'avatar_change' | 'clan_change' | 'vip_upgrade' | 'frame_unlock';
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

export interface TopReferrerEntry {
  rank: number;
  userId: string;
  username?: string;
  fullName: string;
  avatar?: string;
  vipTier?: string;
  gameLevel: number;
  chosenServiceCode: string;
  totalReferrals: number;
  convertedReferrals: number;
  pendingReferrals: number;
  totalClicks: number;
  conversionRate: number;
  referralEarnings: number;
}

export interface AdminSession {
  sessionId: string;
  token?: string;
  deviceId?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string;
  browser: string;
  os: string;
  ipAddress?: string;
  loginTime: string;
  lastActive: string;
  isCurrent?: boolean;
}

