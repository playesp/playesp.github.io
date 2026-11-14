import type {
  PlatformSettings,
  ServiceItem,
  UserProfile,
  ReferralRecord,
  WalletTransaction,
  PayoutRequest,
  NotificationItem,
  Moment,
  MomentComment,
  ChatRoom,
  ClubChatMessage,
  UserContact,
  UserComplaint,
  GamePlayRecord,
  CoinTransactionRecord,
  ProfileAuditRecord,
  OnlineActivitySession,
  HomeSliderPhoto,
  ContactMessage,
  GiftCardVoucher,
  NwiTreeRecord,
  PlanUpgradeRequest,
} from '../types/index.ts';
import { handleStaticApiRequest } from './staticFallback.ts';

const API_BASE_URL =
  ((import.meta as any).env?.VITE_API_BASE_URL ||
    (typeof window !== 'undefined' ? localStorage.getItem('esp_api_base_url') : '') ||
    '')
    .toString()
    .replace(/\/+$/, '');

let staticModeDetected =
  typeof window !== 'undefined' &&
  !API_BASE_URL &&
  window.location.hostname.endsWith('.github.io');

function makeJsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  if (staticModeDetected) {
    return makeJsonResponse(handleStaticApiRequest(input, init));
  }
  const targetUrl = input.startsWith('/') && API_BASE_URL ? `${API_BASE_URL}${input}` : input;
  try {
    const res = await window.fetch(targetUrl, init);
    const ct = res.headers.get('content-type') || '';
    if ((res.status === 404 || res.status === 405) && !ct.includes('application/json')) {
      staticModeDetected = true;
      return makeJsonResponse(handleStaticApiRequest(input, init));
    }
    return res;
  } catch {
    if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
      staticModeDetected = true;
      return makeJsonResponse(handleStaticApiRequest(input, init));
    }
    throw new Error('Network error');
  }
}

const SESSION_USER_KEY = 'esp_session_user';
const SESSION_TOKEN_KEY = 'esp_session_token';
const SESSION_ADMIN_KEY = 'esp_admin_logged';
const ADMIN_PASS_KEY = 'esp_admin_pass';

export function detectClientDevice(): {
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string;
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined' || !navigator) {
    return { deviceType: 'desktop', deviceName: 'Web Device', browser: 'Browser', os: 'Web' };
  }

  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;
  
  let deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown' = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua) || (width >= 768 && width <= 1024 && 'ontouchstart' in window)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua) || width < 768) {
    deviceType = 'mobile';
  }

  let os = 'Unknown OS';
  if (/android/i.test(ua)) os = 'Android Mobile';
  else if (/iphone/i.test(ua)) os = 'Apple iPhone';
  else if (/ipad/i.test(ua)) os = 'Apple iPad';
  else if (/win/i.test(ua)) os = 'Windows PC';
  else if (/mac/i.test(ua)) os = 'macOS / Mac';
  else if (/linux/i.test(ua)) os = 'Linux PC';

  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Google Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  const deviceName = `${os} (${browser})`;
  return { deviceType, deviceName, browser, os };
}

export const api = {
  getStoredUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(SESSION_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  getStoredSessionToken(): string {
    return localStorage.getItem(SESSION_TOKEN_KEY) || '';
  },

  setStoredUser(user: UserProfile | null, sessionToken?: string) {
    if (user) {
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
      if (sessionToken) {
        localStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
      }
    } else {
      localStorage.removeItem(SESSION_USER_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
    }
  },

  getStoredAdmin(): boolean {
    return localStorage.getItem(SESSION_ADMIN_KEY) === 'true';
  },

  getStoredAdminPass(): string {
    return localStorage.getItem(ADMIN_PASS_KEY) || '';
  },

  setStoredAdmin(isAdmin: boolean, password = '') {
    if (isAdmin) {
      localStorage.setItem(SESSION_ADMIN_KEY, 'true');
      if (password) localStorage.setItem(ADMIN_PASS_KEY, password);
    } else {
      localStorage.removeItem(SESSION_ADMIN_KEY);
      localStorage.removeItem(ADMIN_PASS_KEY);
    }
  },

  async getSettings(): Promise<PlatformSettings> {
    try {
      const res = await apiFetch('/api/settings');
      const data = await res.json();
      if (data.success) return data.settings;
    } catch (e) {
      console.warn('API error fetching settings, fallback to defaults', e);
    }
    return {
      ownerName: 'SANTOSH KUMAR',
      ownerSponsorId: 'EMO-MOM-MMO',
      adminUpiId: '8877490845@SPICEPAY',
      adminPayeeName: 'VIKAS KUMAR',
      adminQrCodeUrl: '',
      contactAddress: 'ESP Headquarters, Bihar, India',
      supportPhone: '+91 8877490845',
      supportEmail: 'ioisplatform@gmail.com',
      whatsappNumber: '8877490845',
      minWithdrawal: 50,
      defaultReferralCommissionRate: 0.40,
      blogReferenceUrl: 'https://emofi100.blogspot.com/2024/03/earning-service-platform-esp.html?m=1',
      joiningFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScqqyR1CDev8HEmpKaSzvRd1hcIERIIOP1qYWL1NaPV_9L-rg/viewform?usp=sf_link',
      bannerNotice: '🎉 Welcome to Earning System Platform (ESP)! Join starting at ₹10 & receive your Verified Member Digital ID Card!',
    };
  },

  async updateSettings(settings: Partial<PlatformSettings>, adminPassword: string): Promise<PlatformSettings> {
    const res = await apiFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update settings');
    return data.settings;
  },

  async getServices(): Promise<ServiceItem[]> {
    try {
      const res = await apiFetch('/api/services');
      const data = await res.json();
      if (data.success && data.services) return data.services;
    } catch (e) {
      console.warn('API error fetching services', e);
    }
    return [];
  },

  async addService(newService: Partial<ServiceItem>, adminPassword: string) {
    const res = await apiFetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newService, adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to add service');
    return data;
  },

  async deleteService(id: string, adminPassword: string) {
    const res = await apiFetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': adminPassword },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to delete service');
    return data;
  },

  async checkSponsor(sponsorId: string) {
    const res = await apiFetch(`/api/sponsor/check?id=${encodeURIComponent(sponsorId)}`);
    return await res.json();
  },

  async register(formData: any) {
    const deviceInfo = detectClientDevice();
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, deviceInfo }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    if (data.user) {
      this.setStoredUser(data.user, data.sessionToken);
    }
    return data;
  },

  async login(identifier: string, password: string): Promise<UserProfile> {
    const deviceInfo = detectClientDevice();
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, deviceInfo }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    this.setStoredUser(data.user, data.sessionToken);
    return data.user;
  },

  async forgetId(phoneOrEmail: string): Promise<{
    success: boolean;
    userId: string;
    gamingId: string;
    fullName: string;
    accountType: string;
    chosenServiceCode: string;
  }> {
    const res = await apiFetch('/api/auth/forget-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'आईडी खोजने में त्रुटि');
    return data;
  },

  async forgetPassword(identifier: string, verifyPhone: string, newPassword: string): Promise<{
    success: boolean;
    userId: string;
    fullName: string;
    message: string;
  }> {
    const res = await apiFetch('/api/auth/forget-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, verifyPhone, newPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'पासवर्ड रीसेट असफल');
    return data;
  },

  async verifySession(userId?: string): Promise<{ valid: boolean; user?: UserProfile; sessionTerminated?: boolean; message?: string }> {
    const sessionToken = this.getStoredSessionToken();
    const query = new URLSearchParams();
    if (sessionToken) query.set('token', sessionToken);
    if (userId) query.set('userId', userId);

    const res = await apiFetch(`/api/auth/verify-session?${query.toString()}`, {
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (data.valid && data.user) {
      this.setStoredUser(data.user, sessionToken);
    }
    return data;
  },

  async getUserDashboard(userId: string): Promise<{
    user: UserProfile;
    referrals: ReferralRecord[];
    transactions: WalletTransaction[];
    notifications: NotificationItem[];
    payouts: PayoutRequest[];
  }> {
    const sessionToken = this.getStoredSessionToken();
    const res = await apiFetch(`/api/user/${userId}`, {
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load user dashboard');
    if (data.user) {
      this.setStoredUser(data.user, sessionToken);
    }
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const sessionToken = this.getStoredSessionToken();
    const res = await apiFetch(`/api/user/${userId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-session-token': sessionToken,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update profile');
    if (data.user) {
      this.setStoredUser(data.user, sessionToken);
    }
    return data.user;
  },

  async terminateSession(userId: string, sessionId?: string, terminateAllOthers = false) {
    const sessionToken = this.getStoredSessionToken();
    const res = await apiFetch(`/api/user/${userId}/terminate-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        terminateAllOthers,
        currentSessionToken: sessionToken,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to terminate session');
    return data;
  },

  async requestWithdrawal(userId: string, amount: number, payoutAddress: string) {
    const res = await apiFetch(`/api/user/${userId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, payoutAddress }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Withdrawal failed');
    return data;
  },

  async chatWithAi(message: string): Promise<{ reply: string; options: string[]; time: string }> {
    const res = await apiFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    return data;
  },

  async getAdminOverview(adminPassword: string) {
    const res = await apiFetch('/api/admin/overview', {
      headers: { 'x-admin-password': adminPassword },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Admin authentication failed');
    return data;
  },

  async getUserFullAudit(userId: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/user/${userId}/full-audit`, {
      headers: { 'x-admin-password': adminPassword },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch user audit');
    return data;
  },

  async updateUserStatus(userId: string, status: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to update user status');
    return data;
  },

  async approvePayout(payoutId: string, transactionRef: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/payouts/${payoutId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionRef, adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to approve payout');
    return data;
  },

  // Daily Moments
  async getMoments(): Promise<Moment[]> {
    try {
      const res = await apiFetch('/api/moments');
      const data = await res.json();
      return data.moments || [];
    } catch {
      return [];
    }
  },

  async postMoment(momentData: Partial<Moment>): Promise<Moment> {
    const res = await apiFetch('/api/moments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(momentData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to post moment');
    return data.moment;
  },

  async likeMoment(momentId: string, userId: string) {
    const res = await apiFetch(`/api/moments/${momentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async commentMoment(momentId: string, commentData: { userId: string; userName: string; userRollNumber: string; userAvatar?: string; text: string }) {
    const res = await apiFetch(`/api/moments/${momentId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });
    return res.json();
  },

  async shareMoment(momentId: string) {
    const res = await apiFetch(`/api/moments/${momentId}/share`, { method: 'POST' });
    return res.json();
  },

  // WhatsApp-style Chatting Club
  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const res = await apiFetch('/api/chat/rooms');
      const data = await res.json();
      return data.rooms || [];
    } catch {
      return [];
    }
  },

  async createChatRoom(roomData: { name: string; hindiName?: string; description?: string; category?: string; createdById?: string }): Promise<ChatRoom> {
    const res = await apiFetch('/api/chat/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to create room');
    return data.room;
  },

  async getChatMessages(roomId: string): Promise<ClubChatMessage[]> {
    try {
      const res = await apiFetch(`/api/chat/messages/${roomId}`);
      const data = await res.json();
      return data.messages || [];
    } catch {
      return [];
    }
  },

  async sendChatMessage(msgData: Partial<ClubChatMessage>): Promise<ClubChatMessage> {
    const res = await apiFetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to send message');
    return data.message;
  },

  async getUserContacts(userId: string): Promise<UserContact[]> {
    try {
      const res = await apiFetch(`/api/chat/contacts/${userId}`);
      const data = await res.json();
      return data.contacts || [];
    } catch {
      return [];
    }
  },

  async saveUserContact(contactData: { userId: string; contactRollNumber: string; contactName: string; contactPhone?: string; notes?: string }): Promise<UserContact> {
    const res = await apiFetch('/api/chat/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to save contact');
    return data.contact;
  },

  async getUserAudits(adminPassword: string) {
    const res = await apiFetch('/api/admin/user-audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch user audits');
    return data.userAudits;
  },

  // ESP Gaming Room APIs
  async playCoinGame(userId: string, gameName: string, betAmount: number, choice?: string) {
    const res = await apiFetch('/api/game/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gameName, betAmount, choice }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Game action failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async playCoinsGame(userId: string, gameName: string, betAmount: number) {
    const res = await apiFetch('/api/game/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gameName, betAmount, choice: 'direct' }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Game action failed');
    if (data.user) this.setStoredUser(data.user);
    return { ...data, currentCoins: data.newBalance || data.user?.coins || 0 };
  },

  async claimGameWin(userId: string, gameName: string, winAmount: number) {
    const res = await apiFetch('/api/game/claim-win', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gameName, winAmount }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Claim win failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async dailyLuckySpin(userId: string, targetSectorIndex?: number) {
    const res = await apiFetch('/api/game/daily-lucky-spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetSectorIndex }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Daily lucky spin failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async rechargeCoins(userId: string, coins: number, amount: number, paymentUtr?: string, bonusCoins = 0, packId = 'pack') {
    const res = await apiFetch('/api/game/recharge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coins, amount, paymentUtr, bonusCoins, packId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || data.error || 'Recharge failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async convertCoins(userId: string, coinsAmount: number) {
    const res = await apiFetch('/api/game/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coinsAmount }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Conversion failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimLoginReward(userId: string, day: number) {
    const res = await apiFetch('/api/game/claim-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, day }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Claim failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async sendRoomGift(senderId: string, targetName: string, giftId: string, giftName: string, coinCost: number, charmValue: number) {
    const res = await apiFetch('/api/game/send-gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, targetName, giftId, giftName, coinCost, charmValue }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gift send failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async getCoinRecharges(adminPassword: string) {
    const res = await apiFetch('/api/admin/coin-recharges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to fetch coin recharges');
    return data.coinRecharges || [];
  },

  async approveCoinRecharge(rechargeId: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/coin-recharges/${rechargeId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to approve coin recharge');
    return data;
  },

  async rejectCoinRecharge(rechargeId: string, reason: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/coin-recharges/${rechargeId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, reason }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to reject coin recharge');
    return data;
  },

  async getUserCoinRecharges(userId: string) {
    const res = await apiFetch(`/api/game/user-recharges/${userId}`);
    const data = await res.json();
    return data.recharges || [];
  },

  async getVoiceRooms() {
    const res = await apiFetch('/api/game/voice-rooms');
    return await res.json();
  },

  async getVoiceRoomState(roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}` : '/api/game/voice-room';
    const res = await apiFetch(url);
    return await res.json();
  },

  async createVoiceRoom(payload: {
    userId: string;
    title: string;
    topic: string;
    category: string;
    isPrivate?: boolean;
    passcode?: string;
    hostName?: string;
    hostAvatar?: string;
    hostLevel?: number;
    hostCharms?: number;
  }) {
    try {
      const res = await apiFetch('/api/game/voice-rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'नेटवर्क समस्या के कारण कमरा नहीं बन सका' };
    }
  },

  async takeVoiceSeat(userId: string, seatIndex: number, roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/take-seat` : '/api/game/voice-room/take-seat';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, seatIndex, roomId }),
    });
    return await res.json();
  },

  async leaveVoiceSeat(userId: string, roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/leave-seat` : '/api/game/voice-room/leave-seat';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, roomId }),
    });
    return await res.json();
  },

  async sendVoiceRoomChat(userId: string, text: string, isGift = false, roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/chat` : '/api/game/voice-room/chat';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text, isGift, roomId }),
    });
    return await res.json();
  },

  async sendVoiceAudioClip(
    userId: string, 
    audioDataUrl: string, 
    durationSec: number, 
    roomId?: string,
    voiceEffect?: { id: string; name: string; icon: string }
  ) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/voice-audio` : '/api/game/voice-room/voice-audio';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, audioDataUrl, durationSec, roomId, voiceEffect }),
    });
    return await res.json();
  },

  async manageVoiceSeatHostAction(payload: {
    roomId: string;
    hostUserId: string;
    action: 'mute' | 'unmute' | 'kick' | 'update_topic';
    seatIndex?: number;
    newTopic?: string;
  }) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(payload.roomId)}/host-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async getRealCommunityPlayers() {
    const res = await apiFetch('/api/community/real-players');
    const data = await res.json();
    return data.players || [];
  },

  async getPlayerProfile(userId: string) {
    const res = await apiFetch(`/api/community/player-profile/${userId}`);
    return await res.json();
  },

  async getBots() {
    const res = await apiFetch('/api/game/bots');
    return await res.json();
  },

  async inviteBotToSeat(botId: string, seatIndex?: number, roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/invite-bot` : '/api/game/voice-room/invite-bot';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botId, seatIndex, roomId }),
    });
    return await res.json();
  },

  async summonAllBots(roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/summon-all-bots` : '/api/game/voice-room/summon-all-bots';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    });
    return await res.json();
  },

  async interactWithBot(botCode: string, userId: string, actionType?: string, roomId?: string) {
    const url = roomId ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}/bot-interact` : '/api/game/voice-room/bot-interact';
    const res = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botCode, userId, actionType, roomId }),
    });
    return await res.json();
  },

  // ---------------- User Complaints & Grievance Database ----------------
  async submitComplaint(payload: {
    userId: string;
    userName?: string;
    userPhone?: string;
    category: string;
    subject: string;
    description: string;
    proofScreenshot?: string;
  }): Promise<{ success: boolean; message: string; complaint?: UserComplaint }> {
    const res = await apiFetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async getUserComplaints(userId: string): Promise<UserComplaint[]> {
    try {
      const res = await apiFetch(`/api/complaints/user/${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.complaints || [];
    } catch {
      return [];
    }
  },

  async getAdminComplaints(adminPassword: string, status?: string): Promise<UserComplaint[]> {
    const query = new URLSearchParams({ adminPassword });
    if (status) query.set('status', status);
    const res = await apiFetch(`/api/admin/complaints?${query.toString()}`);
    const data = await res.json();
    return data.complaints || [];
  },

  async respondToComplaint(
    complaintId: string,
    payload: {
      adminPassword: string;
      response: string;
      status?: 'in_progress' | 'resolved' | 'rejected';
      refundCoins?: number;
    }
  ): Promise<{ success: boolean; message: string; complaint?: UserComplaint }> {
    const res = await apiFetch(`/api/admin/complaints/${encodeURIComponent(complaintId)}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // ---------------- Game Play History & Coin Audit Ledger ----------------
  async recordGamePlay(payload: {
    userId: string;
    gameId?: string;
    gameName: string;
    betCoins: number;
    wonCoins: number;
    durationSeconds?: number;
    details?: string;
  }): Promise<{ success: boolean; user?: UserProfile; record?: GamePlayRecord }> {
    const res = await apiFetch('/api/game/record-play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  async getGamePlayHistory(userId: string): Promise<GamePlayRecord[]> {
    try {
      const res = await apiFetch(`/api/game/history/${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  },

  async getCoinHistory(userId: string): Promise<CoinTransactionRecord[]> {
    try {
      const res = await apiFetch(`/api/game/coin-history/${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.transactions || [];
    } catch {
      return [];
    }
  },

  async getProfileHistory(userId: string): Promise<ProfileAuditRecord[]> {
    try {
      const res = await apiFetch(`/api/user/${encodeURIComponent(userId)}/profile-history`);
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  },

  // ---------------- Online Presence & Session Heartbeat ("कब से कब तक ऑन रहा") ----------------
  async sendHeartbeat(payload: {
    userId: string;
    sessionId?: string;
    deviceType?: string;
    deviceName?: string;
    browser?: string;
    os?: string;
  }): Promise<{
    success: boolean;
    sessionId: string;
    durationMinutes: number;
    totalOnlineMinutes: number;
    totalDaysPlayed: number;
  }> {
    const res = await apiFetch('/api/user/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async endSession(userId: string, sessionId?: string): Promise<{ success: boolean }> {
    try {
      const res = await apiFetch('/api/user/session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async getUserSessionHistory(userId: string): Promise<OnlineActivitySession[]> {
    try {
      const res = await apiFetch(`/api/user/${encodeURIComponent(userId)}/session-history`);
      const data = await res.json();
      return data.sessions || [];
    } catch {
      return [];
    }
  },

  async getAdminActivityOverview(adminPassword: string): Promise<{
    success: boolean;
    totalUsers: number;
    onlineCount: number;
    onlineUsers: any[];
    recentSessions: OnlineActivitySession[];
  }> {
    const res = await apiFetch(`/api/admin/users/activity-overview?adminPassword=${encodeURIComponent(adminPassword)}`);
    return await res.json();
  },

  // ---------------- Server-side State Persistence (No localStorage dependency) ----------------
  async saveServerState(
    userId: string,
    state: {
      claimedTasksDate?: string;
      claimedTasksList?: string[];
      openedTimedBoxes?: string[];
      unlockedRooms?: string[];
      roomTheme?: string;
      voiceEffect?: string;
    }
  ): Promise<{ success: boolean; user?: UserProfile }> {
    const res = await apiFetch(`/api/user/${encodeURIComponent(userId)}/server-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  // ---------------- 7-Photo Home Popup Slider System ----------------
  async getHomeSliderPhotos(): Promise<HomeSliderPhoto[]> {
    try {
      const res = await apiFetch('/api/home-slider-photos');
      const data = await res.json();
      return data.photos || [];
    } catch {
      return [];
    }
  },

  async saveHomeSliderPhotos(adminPassword: string, photos: Partial<HomeSliderPhoto>[]): Promise<{ success: boolean; message: string; photos: HomeSliderPhoto[] }> {
    const res = await apiFetch('/api/admin/home-slider-photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, photos }),
    });
    return await res.json();
  },

  // ---------------- Contact & Telegram Inquiries ----------------
  async submitContactMessage(payload: {
    name: string;
    email: string;
    phone?: string;
    telegramUsername?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string; contactMessage?: ContactMessage }> {
    const res = await apiFetch('/api/contact/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async getAdminContactMessages(adminPassword: string): Promise<ContactMessage[]> {
    const res = await apiFetch(`/api/admin/contact-messages?adminPassword=${encodeURIComponent(adminPassword)}`);
    const data = await res.json();
    return data.messages || [];
  },

  async replyContactMessage(id: string, adminPassword: string, adminReply: string, status = 'replied') {
    const res = await apiFetch(`/api/admin/contact-messages/${encodeURIComponent(id)}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, adminReply, status }),
    });
    return await res.json();
  },

  // ---------------- Demo User & User Profile Editor in Admin Panel ----------------
  async createDemoUser(adminPassword: string, userData: any): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const res = await apiFetch('/api/admin/demo-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, ...userData }),
    });
    return await res.json();
  },

  async editUserDetails(userId: string, adminPassword: string, updates: any): Promise<{ success: boolean; message: string; user: UserProfile }> {
    const res = await apiFetch(`/api/admin/user/${encodeURIComponent(userId)}/edit-details`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, ...updates }),
    });
    return await res.json();
  },

  detectClientDevice(): { deviceType: 'mobile' | 'desktop' | 'tablet'; deviceName: string; browser: string; os: string } {
    if (typeof window === 'undefined') {
      return { deviceType: 'desktop', deviceName: 'Server Node', browser: 'Node', os: 'Linux' };
    }
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
    const deviceType: 'mobile' | 'desktop' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    let browser = 'Chrome';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Edge') || ua.includes('Edg/')) browser = 'Edge';

    let os = 'Android';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Macintosh')) os = 'MacOS';

    const deviceName = isMobile ? `${os} Smartphone` : `${os} Desktop (${browser})`;
    return { deviceType, deviceName, browser, os };
  },

  // ---------------- User Self Profile Pic Upload ----------------
  async uploadUserAvatar(userId: string, avatarDataUrl: string): Promise<{ success: boolean; message: string; avatar: string; user: UserProfile }> {
    const res = await apiFetch(`/api/user/${encodeURIComponent(userId)}/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: avatarDataUrl }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  // ---------------- Authentic Real Player Online Counter ----------------
  async getRealOnlineCount(): Promise<{
    success: boolean;
    realCount: number;
    onlinePlayers: Array<{ userId: string; fullName: string; avatar?: string; gameLevel: number; clanName: string; lastActive?: string }>;
  }> {
    try {
      const res = await apiFetch('/api/community/real-online-count');
      return await res.json();
    } catch {
      return { success: true, realCount: 1, onlinePlayers: [] };
    }
  },

  // ---------------- Real-Time Voice Stage Seating Rewards ----------------
  async claimSeatReward(userId: string, minutesActive: number, roomId?: string): Promise<{
    success: boolean;
    message: string;
    coinsEarned: number;
    newBalance: number;
    user: UserProfile;
  }> {
    const res = await apiFetch('/api/game/voice-room/seat-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, minutesActive, roomId }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  // ---------------- Gift Cards & Digital Vouchers ----------------
  async getGiftCards(): Promise<GiftCardVoucher[]> {
    try {
      const res = await apiFetch('/api/gift-cards');
      const data = await res.json();
      return data.vouchers || [];
    } catch {
      return [];
    }
  },

  async redeemGiftCard(userId: string, voucherId: string): Promise<{
    success: boolean;
    message: string;
    voucher?: GiftCardVoucher;
    newBalance?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/gift-cards/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, voucherId }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  // ---------------- NWI 3-Level Auto Tree & Non-Working Income ----------------
  async getNwiTree(userId: string): Promise<{ success: boolean; tree: NwiTreeRecord; message?: string }> {
    try {
      const res = await apiFetch(`/api/nwi/tree/${encodeURIComponent(userId)}`);
      return await res.json();
    } catch (err: any) {
      return { success: false, tree: null as any, message: err?.message || 'Network error' };
    }
  },

  async claimNwiReward(userId: string): Promise<{
    success: boolean;
    message: string;
    claimedAmount?: number;
    newBalance?: number;
    user?: UserProfile;
    tree?: NwiTreeRecord;
  }> {
    const res = await apiFetch('/api/nwi/claim-level-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  async activateNwi(userId: string, tierFee: number): Promise<{
    success: boolean;
    message: string;
    tree?: NwiTreeRecord;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/nwi/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tierFee }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  // ---------------- SWI 3.3% Special Recharge App Link (Admin -> Verified User) ----------------
  async shareSwiAppLink(userId: string, swiAppLink: string, swiAppNote: string, adminPassword: string): Promise<{
    success: boolean;
    message: string;
    user?: UserProfile;
  }> {
    const res = await apiFetch(`/api/admin/users/${encodeURIComponent(userId)}/share-swi-app`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swiAppLink, swiAppNote, adminPassword }),
    });
    return await res.json();
  },

  // ---------------- REFER Self Plan Upgrade (₹100+) ----------------
  async submitPlanUpgrade(
    userId: string,
    targetServiceCode: string,
    upgradeFee: number,
    paymentUtr: string
  ): Promise<{ success: boolean; message: string; request?: PlanUpgradeRequest }> {
    const res = await apiFetch('/api/users/upgrade-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetServiceCode, upgradeFee, paymentUtr }),
    });
    return await res.json();
  },

  async getPlanUpgrades(adminPassword: string): Promise<{ success: boolean; upgrades: PlanUpgradeRequest[] }> {
    try {
      const res = await apiFetch(`/api/admin/upgrades?adminPassword=${encodeURIComponent(adminPassword)}`);
      return await res.json();
    } catch {
      return { success: false, upgrades: [] };
    }
  },

  async approvePlanUpgrade(
    upgradeId: string,
    status: 'approved' | 'rejected',
    adminPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await apiFetch(`/api/admin/upgrades/${encodeURIComponent(upgradeId)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminPassword }),
    });
    return await res.json();
  },
};



