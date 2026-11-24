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
  GiftCardRedemption,
  NwiTreeRecord,
  PlanUpgradeRequest,
  RealTaskStatus,
  DailyGameHubData,
  EspFamily,
  GiftHistoryRecord,
  RoomAtmosphereEffect,
  RoomPacketDrop,
  DirectMessageRecord,
  UserWorkspaceState,
  UserSession,
  AdminSession,
} from '../types/index.ts';
import type { VoiceRoomTierId } from '../config/espSocialCatalog.ts';
import type { TaskEventType, VipTierId } from '../config/economy.ts';
import { handleStaticApiRequest } from './staticFallback.ts';
import { pushRegistrationToCloudBridge } from './firebase.ts';

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
const USERS_BACKUP_KEY = 'esp_users_backup_v1';
const SESSION_ADMIN_KEY = 'esp_admin_logged';
const ADMIN_PASS_KEY = 'esp_admin_pass';
const ADMIN_SESSION_TOKEN_KEY = 'esp_admin_session_token';
const CLIENT_DEVICE_ID_KEY = 'esp_device_id';

export function getOrCreateClientDeviceId(): string {
  if (typeof window === 'undefined') return 'dev-ssr';
  try {
    let id = localStorage.getItem(CLIENT_DEVICE_ID_KEY) || '';
    if (!id) {
      id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CLIENT_DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return `dev_${Date.now().toString(36)}`;
  }
}

function normalizePhoneTail(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function matchesBackupIdentifier(u: any, rawIdentifier: string): boolean {
  if (!u) return false;
  const clean = String(rawIdentifier || '').trim().toLowerCase();
  if (!clean) return false;
  const cleanNoSpaces = clean.replace(/\s+/g, '');
  const inputDigits = normalizePhoneTail(clean);
  const uid = String(u.userId || '').trim().toLowerCase();
  const gid = String(u.gamingId || '').trim().toLowerCase();
  const email = String(u.email || '').trim().toLowerCase();
  const phone = String(u.phone || '').trim().toLowerCase();
  const phoneDigits = normalizePhoneTail(phone);

  return (
    uid === clean ||
    (cleanNoSpaces.length >= 3 && uid.replace(/\s+/g, '') === cleanNoSpaces) ||
    (gid !== '' && (gid === clean || (cleanNoSpaces.length >= 3 && gid.replace(/\s+/g, '') === cleanNoSpaces))) ||
    (email !== '' && email === clean) ||
    (phone !== '' && phone === clean) ||
    (inputDigits.length === 10 && phoneDigits.length === 10 && phoneDigits === inputDigits)
  );
}

function readAllLocalBackupUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  const results: UserProfile[] = [];
  const seen = new Set<string>();
  const addIfUnique = (u: any) => {
    if (!u || !u.userId) return;
    const key = String(u.userId).toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    results.push(u as UserProfile);
  };
  try {
    const rawBackup = localStorage.getItem(USERS_BACKUP_KEY);
    if (rawBackup) {
      const arr = JSON.parse(rawBackup);
      if (Array.isArray(arr)) arr.forEach(addIfUnique);
    }
  } catch {}
  try {
    for (const dbKey of ['esp_static_db_v2', 'esp_static_db']) {
      const rawDb = localStorage.getItem(dbKey);
      if (!rawDb) continue;
      const parsed = JSON.parse(rawDb);
      if (Array.isArray(parsed?.users)) parsed.users.forEach(addIfUnique);
    }
  } catch {}
  try {
    const cur = localStorage.getItem(SESSION_USER_KEY);
    if (cur) addIfUnique(JSON.parse(cur));
  } catch {}
  return results;
}

function saveUserToLocalBackup(user: UserProfile, overridePassword?: string) {
  if (typeof window === 'undefined' || !user?.userId) return;
  try {
    const raw = localStorage.getItem(USERS_BACKUP_KEY);
    const list: UserProfile[] = raw ? JSON.parse(raw) : [];
    const safeList = Array.isArray(list) ? list : [];
    const idx = safeList.findIndex(
      u => (u.userId || '').toLowerCase() === user.userId.toLowerCase()
    );
    const existingPass = idx >= 0 ? safeList[idx]?.password : undefined;
    const merged: UserProfile = {
      ...user,
      password: overridePassword || user.password || existingPass,
    };
    if (idx >= 0) {
      safeList[idx] = merged;
    } else {
      safeList.unshift(merged);
    }
    localStorage.setItem(USERS_BACKUP_KEY, JSON.stringify(safeList.slice(0, 20)));
  } catch {
    // ignore storage quota
  }
}

export function detectClientDevice(): {
  deviceId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  deviceName: string;
  browser: string;
  os: string;
} {
  const deviceId = getOrCreateClientDeviceId();
  if (typeof window === 'undefined' || !navigator) {
    return { deviceId, deviceType: 'desktop', deviceName: 'Web Device', browser: 'Browser', os: 'Web' };
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
  return { deviceId, deviceType, deviceName, browser, os };
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
      saveUserToLocalBackup(user);
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

  getStoredAdminToken(): string {
    return localStorage.getItem(ADMIN_SESSION_TOKEN_KEY) || '';
  },

  setStoredAdmin(isAdmin: boolean, password = '', adminToken?: string) {
    if (isAdmin) {
      localStorage.setItem(SESSION_ADMIN_KEY, 'true');
      if (password) localStorage.setItem(ADMIN_PASS_KEY, password);
      if (adminToken) localStorage.setItem(ADMIN_SESSION_TOKEN_KEY, adminToken);
    } else {
      localStorage.removeItem(SESSION_ADMIN_KEY);
      localStorage.removeItem(ADMIN_PASS_KEY);
      localStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
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
    const currentHost =
      typeof window !== 'undefined' ? window.location.hostname : 'web';
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        deviceInfo,
        registeredFromHost: formData?.registeredFromHost || currentHost,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Registration failed');
    if (data.user) {
      const mergedUser = {
        ...data.user,
        password: formData.password || data.user.password,
        registeredFromHost: data.user.registeredFromHost || currentHost,
      };
      saveUserToLocalBackup(mergedUser, formData.password);
      this.setStoredUser(mergedUser, data.sessionToken);
      // Immediately push to cross-origin Firestore bridge so Admin Panel sees playesp.github.io & live registrations instantly
      pushRegistrationToCloudBridge(mergedUser, currentHost).catch(() => {});
    }
    return data;
  },

  async login(
    identifier: string,
    password: string,
    opts?: { replaceSessionId?: string; replaceOldestDevice?: boolean }
  ): Promise<UserProfile> {
    const deviceInfo = detectClientDevice();
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier,
        password,
        deviceId: deviceInfo.deviceId,
        deviceInfo,
        replaceSessionId: opts?.replaceSessionId,
        replaceOldestDevice: opts?.replaceOldestDevice,
      }),
    });
    const data = await res.json();
    if (data.success && data.user) {
      saveUserToLocalBackup(data.user, password);
      this.setStoredUser(data.user, data.sessionToken);
      return data.user;
    }

    if (data.code === 'DEVICE_LIMIT_REACHED' || res.status === 409) {
      const err: any = new Error(data.message || 'अधिकतम 4 डिवाइस लॉगिन सीमा पूरी हो चुकी है।');
      err.code = 'DEVICE_LIMIT_REACHED';
      err.maxDevices = data.maxDevices || 4;
      err.activeSessions = data.activeSessions || [];
      throw err;
    }

    // Fallback recovery if backend DB restarted and account only exists in browser backup / static DB
    if (data.code === 'ACCOUNT_NOT_FOUND' || res.status === 404) {
      const backups = readAllLocalBackupUsers().filter(u => matchesBackupIdentifier(u, identifier));
      if (backups.length > 0) {
        const matchedBackup = backups.find(
          u => !u.password || u.password === password || u.password.trim() === password.trim()
        );
        if (!matchedBackup) {
          throw new Error(
            'पासवर्ड मेल नहीं खा रहा (Password details mismatch)। कृपया सही पासवर्ड दर्ज करें या नीचे "Forget Password?" का उपयोग करें।'
          );
        }
        try {
          const restoreRes = await apiFetch('/api/auth/restore-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: matchedBackup,
              password,
              deviceId: deviceInfo.deviceId,
              deviceInfo,
              replaceSessionId: opts?.replaceSessionId,
              replaceOldestDevice: opts?.replaceOldestDevice,
            }),
          });
          const restoreData = await restoreRes.json();
          if (restoreData.code === 'DEVICE_LIMIT_REACHED' || restoreRes.status === 409) {
            const err: any = new Error(restoreData.message || 'अधिकतम 4 डिवाइस लॉगिन सीमा पूरी हो चुकी है।');
            err.code = 'DEVICE_LIMIT_REACHED';
            err.maxDevices = restoreData.maxDevices || 4;
            err.activeSessions = restoreData.activeSessions || [];
            throw err;
          }
          if (restoreData.success && restoreData.user) {
            saveUserToLocalBackup(restoreData.user, password);
            this.setStoredUser(restoreData.user, restoreData.sessionToken);
            return restoreData.user;
          }
        } catch (err: any) {
          if (err?.code === 'DEVICE_LIMIT_REACHED') throw err;
          // fallback to local backup directly if network unavailable
          saveUserToLocalBackup(matchedBackup, password);
          this.setStoredUser(matchedBackup, `esp_local_${Date.now()}`);
          return matchedBackup;
        }
      }
    }

    throw new Error(data.message || 'Login failed');
  },

  async logout(userId?: string, workspaceState?: UserWorkspaceState): Promise<void> {
    const sessionToken = this.getStoredSessionToken();
    const deviceId = getOrCreateClientDeviceId();
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
        },
        body: JSON.stringify({ userId, sessionToken, deviceId, workspaceState }),
      });
    } catch {
      // ignore network failure during local logout
    }
    this.setStoredUser(null);
  },

  async saveWorkspaceState(userId: string, workspaceState: UserWorkspaceState): Promise<void> {
    const sessionToken = this.getStoredSessionToken();
    try {
      await apiFetch(`/api/user/${encodeURIComponent(userId)}/workspace-state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
        },
        body: JSON.stringify(workspaceState),
      });
    } catch {
      // ignore background sync failures
    }
  },

  async forgetId(phoneOrEmail: string): Promise<{
    success: boolean;
    userId: string;
    gamingId: string;
    fullName: string;
    accountType: string;
    chosenServiceCode: string;
    accounts?: Array<{
      userId: string;
      gamingId: string;
      fullName: string;
      accountType: string;
      chosenServiceCode: string;
    }>;
  }> {
    const res = await apiFetch('/api/auth/forget-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneOrEmail }),
    });
    const data = await res.json();
    if (data.success) return data;

    // Fallback check in local backup registry
    const backups = readAllLocalBackupUsers().filter(u => matchesBackupIdentifier(u, phoneOrEmail));
    if (backups.length > 0) {
      const primary = backups[0];
      return {
        success: true,
        userId: primary.userId,
        gamingId: primary.gamingId || `ESPGT${(primary.phone || '0001').slice(-4)}`,
        fullName: primary.fullName,
        accountType: primary.accountType || 'business',
        chosenServiceCode: primary.chosenServiceCode || 'EMO',
        accounts: backups.map(u => ({
          userId: u.userId,
          gamingId: u.gamingId || `ESPGT${(u.phone || '0001').slice(-4)}`,
          fullName: u.fullName,
          accountType: u.accountType || 'business',
          chosenServiceCode: u.chosenServiceCode || 'EMO',
        })),
      };
    }

    throw new Error(data.message || 'आईडी खोजने में त्रुटि');
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
    if (data.success) {
      const backups = readAllLocalBackupUsers().filter(u => u.userId.toLowerCase() === data.userId.toLowerCase());
      if (backups[0]) {
        saveUserToLocalBackup({ ...backups[0], password: newPassword.trim() }, newPassword.trim());
      }
      return data;
    }

    // Fallback reset if account only existed in local backup
    if (res.status === 404) {
      const cleanVerify = verifyPhone.trim().toLowerCase();
      const verifyDigits = normalizePhoneTail(cleanVerify);
      const backups = readAllLocalBackupUsers().filter(u => matchesBackupIdentifier(u, identifier));
      const matched = backups.find(u => {
        const uDigits = normalizePhoneTail(u.phone || '');
        return (
          (verifyDigits.length === 10 && uDigits === verifyDigits) ||
          (u.phone || '').trim().toLowerCase() === cleanVerify ||
          (u.email || '').trim().toLowerCase() === cleanVerify
        );
      });
      if (matched) {
        const updated = { ...matched, password: newPassword.trim() };
        saveUserToLocalBackup(updated, newPassword.trim());
        try {
          await apiFetch('/api/auth/restore-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: updated, password: newPassword.trim() }),
          });
        } catch {}
        return {
          success: true,
          userId: updated.userId,
          fullName: updated.fullName,
          message: 'पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।',
        };
      }
    }

    throw new Error(data.message || 'पासवर्ड रीसेट असफल');
  },

  async verifySession(userId?: string): Promise<{
    valid: boolean;
    user?: UserProfile;
    sessionTerminated?: boolean;
    accountMissing?: boolean;
    message?: string;
  }> {
    const sessionToken = this.getStoredSessionToken();
    const query = new URLSearchParams();
    if (sessionToken) query.set('token', sessionToken);
    if (userId) query.set('userId', userId);

    const res = await apiFetch(`/api/auth/verify-session?${query.toString()}`, {
      headers: { 'x-session-token': sessionToken },
    });
    const data = await res.json();
    if (data.valid && data.user) {
      this.setStoredUser(data.user, data.sessionToken || sessionToken);
      return data;
    }

    // If account was missing on a freshly restarted server, restore cleanly from stored user without logging user out
    if (data.accountMissing && !data.sessionTerminated) {
      const stored = this.getStoredUser();
      if (stored && (!userId || stored.userId.toLowerCase() === userId.toLowerCase())) {
        try {
          const restoreRes = await apiFetch('/api/auth/restore-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: stored,
              preferredToken: sessionToken || undefined,
              deviceInfo: detectClientDevice(),
            }),
          });
          const restoreData = await restoreRes.json();
          if (restoreData.success && restoreData.user) {
            this.setStoredUser(restoreData.user, restoreData.sessionToken || sessionToken);
            return { valid: true, user: restoreData.user };
          }
          if (restoreData.sessionTerminated) {
            return restoreData;
          }
        } catch {
          // keep local session active offline
        }
        return { valid: true, user: stored };
      }
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

  async rejectPayout(payoutId: string, reason: string, adminPassword: string) {
    const res = await apiFetch(`/api/admin/payouts/${payoutId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, adminPassword }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to reject payout');
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

  async deleteMoment(momentId: string, userId: string): Promise<{ success: boolean; deletedId?: string; message?: string }> {
    const res = await apiFetch(`/api/moments/${momentId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'मोमेंट डिलीट करने में त्रुटि आई');
    return data;
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

  async dailyLuckySpin(userId: string) {
    const res = await apiFetch('/api/game/daily-lucky-spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Daily lucky spin failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async getDailyGameHub(userId: string): Promise<DailyGameHubData> {
    const res = await apiFetch(`/api/game/daily-hub/${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load daily game hub');
    if (data.user) this.setStoredUser(data.user);
    return data.hub as DailyGameHubData;
  },

  async claimDailyCheckIn(userId: string, useShield = false) {
    const res = await apiFetch('/api/game/daily-checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, useShield }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Check-in failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async getLiveServerTime() {
    const res = await apiFetch('/api/time/live');
    return res.json();
  },

  async answerDailyQuiz(userId: string, selectedIndex: number) {
    const res = await apiFetch('/api/game/daily-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, selectedIndex }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Quiz submission failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async playFreeSkillMatch(userId: string, gameName: string, outcome: 'win' | 'loss', score?: number) {
    const res = await apiFetch('/api/game/skill-play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gameName, outcome, score }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Skill play reward failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async buyCoinBooster(userId: string, boosterId: 'booster_2x_24h' | 'streak_shield') {
    const res = await apiFetch('/api/game/buy-booster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, boosterId }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Booster purchase failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async rechargeCoins(
    userId: string,
    coins: number,
    amount: number,
    paymentUtr?: string,
    bonusCoins = 0,
    packId = 'pack',
    paymentScreenshot = ''
  ) {
    const res = await apiFetch('/api/game/recharge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, coins, amount, paymentUtr, bonusCoins, packId, paymentScreenshot }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || data.error || 'Recharge failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // Note: Coins cannot be converted into real INR cash; users buy/earn coins strictly for in-app items, VIP, frames & games.

  async sendRoomGift(
    senderId: string,
    targetName: string,
    giftId: string,
    giftName: string,
    coinCost: number,
    charmValue: number,
    giftIcon?: string,
    targetUserId?: string,
    quantity = 1,
    extra?: { context?: 'voice_room' | 'family_chat' | 'profile'; roomId?: string; familyId?: string; pkSide?: 'red' | 'blue' }
  ) {
    const res = await apiFetch('/api/game/send-gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId,
        targetName,
        targetUserId,
        giftId,
        giftName,
        giftIcon,
        coinCost,
        charmValue,
        quantity,
        ...(extra || {}),
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Gift send failed');
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async getGiftHistory(userId: string): Promise<{
    success: boolean;
    sent: GiftHistoryRecord[];
    received: GiftHistoryRecord[];
    all: GiftHistoryRecord[];
    totalSentCoins: number;
    totalReceivedCharms: number;
  }> {
    try {
      const res = await apiFetch(`/api/game/gift-history/${encodeURIComponent(userId)}`);
      return await res.json();
    } catch {
      return { success: false, sent: [], received: [], all: [], totalSentCoins: 0, totalReceivedCharms: 0 };
    }
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

  async getVoiceRooms(viewerId?: string, q?: string) {
    const params = new URLSearchParams();
    if (viewerId) params.set('viewerId', viewerId);
    if (q) params.set('q', q);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch(`/api/game/voice-rooms${qs}`);
    return await res.json();
  },

  async getMyPersonalVoiceRoom(userId: string, viewerId?: string) {
    const qs = viewerId ? `?viewerId=${encodeURIComponent(viewerId)}` : '';
    const res = await apiFetch(`/api/game/voice-rooms/my-room/${encodeURIComponent(userId)}${qs}`);
    return await res.json();
  },

  async lookupVoiceRoom(query: string, viewerId?: string) {
    const qs = viewerId ? `?viewerId=${encodeURIComponent(viewerId)}` : '';
    const res = await apiFetch(`/api/game/voice-rooms/lookup/${encodeURIComponent(query)}${qs}`);
    return await res.json();
  },

  async getVoiceRoomState(roomId?: string, viewerId?: string) {
    const qs = viewerId ? `?viewerId=${encodeURIComponent(viewerId)}` : '';
    const url = roomId
      ? `/api/game/voice-rooms/${encodeURIComponent(roomId)}${qs}`
      : `/api/game/voice-room${qs}`;
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
    wallpaperId?: string;
    customWallpaperUrl?: string;
    stageLayout?: 'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party';
    youtubeVideoUrl?: string;
    roomTier?: VoiceRoomTierId;
  }) {
    try {
      const res = await apiFetch('/api/game/voice-rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.user) this.setStoredUser(data.user);
      return data;
    } catch (e: any) {
      return { success: false, message: e?.message || 'नेटवर्क समस्या के कारण कमरा नहीं बन सका' };
    }
  },

  async upgradeVoiceRoomTier(roomId: string, userId: string, tierId: VoiceRoomTierId) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/upgrade-tier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tierId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async startVoiceRoomPk(roomId: string, userId: string, title?: string, durationSeconds = 180) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/pk/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, durationSeconds }),
    });
    return await res.json();
  },

  async voteVoiceRoomPk(roomId: string, userId: string, side: 'red' | 'blue', coinsToSpend = 0) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/pk/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, side, coinsToSpend }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async endVoiceRoomPk(roomId: string, userId: string) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/pk/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  },

  async joinVoiceRoom(roomId: string, userId: string, passcode?: string) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, passcode }),
    });
    return await res.json();
  },

  async leaveVoiceRoom(roomId: string, userId: string) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  },

  async toggleFollowVoiceRoom(roomId: string, userId: string) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await res.json();
  },

  async updateVoiceRoomDesign(
    roomId: string,
    payload: {
      userId: string;
      title?: string;
      topic?: string;
      category?: string;
      wallpaperId?: string;
      customWallpaperUrl?: string;
      stageLayout?: 'classic_8' | 'heart_stage' | 'event_hall' | 'watch_party';
      youtubeVideoUrl?: string;
      youtubeVideoTitle?: string;
      isPrivate?: boolean;
      passcode?: string;
    }
  ) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/update-design`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  async inviteToVoiceRoom(roomId: string, senderUserId: string, targetUserIds: string[]) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderUserId, targetUserIds }),
    });
    return await res.json();
  },

  async setVoiceRoomEffect(roomId: string, userId: string, effect: RoomAtmosphereEffect) {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/set-effect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, effect }),
    });
    return await res.json();
  },

  async dropVoiceRoomPacket(
    roomId: string,
    payload: {
      userId: string;
      packetType: 'red' | 'blue';
      totalCoins: number;
      maxClaims: number;
      message?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    packet?: RoomPacketDrop;
    user?: UserProfile;
    roomPayload?: any;
  }> {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/drop-packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimVoiceRoomPacket(
    roomId: string,
    userId: string,
    packetId: string
  ): Promise<{
    success: boolean;
    message?: string;
    coinsWon?: number;
    xpWon?: number;
    packetType?: 'red' | 'blue';
    user?: UserProfile;
    roomPayload?: any;
  }> {
    const res = await apiFetch(`/api/game/voice-rooms/${encodeURIComponent(roomId)}/claim-packet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, packetId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
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
    action: 'mute' | 'unmute' | 'kick' | 'update_topic' | 'lock_seat' | 'unlock_seat' | 'set_youtube';
    seatIndex?: number;
    newTopic?: string;
    youtubeVideoUrl?: string;
    youtubeVideoTitle?: string;
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

  async getPlayerProfile(userIdOrUsername: string, viewerId?: string) {
    const qs = viewerId ? `?viewerId=${encodeURIComponent(viewerId)}` : '';
    const res = await apiFetch(`/api/community/player-profile/${encodeURIComponent(userIdOrUsername)}${qs}`);
    return await res.json();
  },

  async checkUsernameAvailability(username: string, currentUserId?: string): Promise<{
    success: boolean;
    valid: boolean;
    available: boolean;
    normalized: string;
    message: string;
  }> {
    const qs = new URLSearchParams({
      username: username || '',
      ...(currentUserId ? { currentUserId } : {}),
    });
    const res = await apiFetch(`/api/users/check-username?${qs.toString()}`);
    return await res.json();
  },

  async searchUsersByUsername(q: string, currentUserId?: string) {
    const qs = new URLSearchParams({
      q: q || '',
      ...(currentUserId ? { currentUserId } : {}),
    });
    const res = await apiFetch(`/api/users/search?${qs.toString()}`);
    return await res.json();
  },

  async toggleFriend(userId: string, targetUserId: string) {
    const res = await apiFetch('/api/friends/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetUserId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
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

  // ---------------- Admin User Profile Editor ----------------
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
      return { success: true, realCount: 0, onlinePlayers: [] };
    }
  },

  // ---------------- Real Verified Task System (Daily, Activeness Chests, Growth & Family) ----------------
  async getTasksStatus(userId: string): Promise<{
    success: boolean;
    tasks: RealTaskStatus[];
    todayActiveness?: number;
    activenessChests?: import('../types/index.ts').ActivenessChestStatus[];
    growthTasks?: import('../types/index.ts').GrowthTaskStatus[];
    familyTasks?: import('../types/index.ts').FamilyTaskStatus[];
    tasksCompletedCount: number;
    claimedChestMilestones: string[];
    timeMeta?: import('../types/index.ts').LiveTimeMeta;
    user?: UserProfile;
  }> {
    const res = await apiFetch(`/api/tasks/${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async recordTaskAction(userId: string, eventType: TaskEventType, incrementBy = 1) {
    const res = await apiFetch('/api/tasks/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, eventType, incrementBy }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimVerifiedTask(userId: string, taskId: string): Promise<{
    success: boolean;
    message: string;
    coinsAwarded?: number;
    coinsEarned?: number;
    xpAwarded?: number;
    xpEarned?: number;
    activenessEarned?: number;
    todayActiveness?: number;
    user?: UserProfile;
    tasks?: RealTaskStatus[];
  }> {
    const res = await apiFetch('/api/tasks/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, taskId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimActivenessChest(userId: string, threshold: number): Promise<{
    success: boolean;
    message: string;
    coinsEarned?: number;
    xpEarned?: number;
    activenessChests?: import('../types/index.ts').ActivenessChestStatus[];
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/tasks/claim-activeness-chest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, threshold }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimGrowthTask(userId: string, taskId: string): Promise<{
    success: boolean;
    message: string;
    coinsEarned?: number;
    xpEarned?: number;
    growthTasks?: import('../types/index.ts').GrowthTaskStatus[];
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/tasks/claim-growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, taskId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimFamilyTask(userId: string, taskId: string): Promise<{
    success: boolean;
    message: string;
    coinsEarned?: number;
    xpEarned?: number;
    activenessEarned?: number;
    todayActiveness?: number;
    familyTasks?: import('../types/index.ts').FamilyTaskStatus[];
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/tasks/claim-family', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, taskId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async claimTaskMilestoneChest(userId: string, chestId: string): Promise<{
    success: boolean;
    message: string;
    coinsAwarded?: number;
    xpAwarded?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/tasks/claim-chest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, chestId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- Real Coins Store: Quality-Tiered Frames, VIP & Rooms ----------------
  async buyAvatarFrame(userId: string, frameVariant: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
    requiredCoins?: number;
    currentCoins?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/store/buy-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, frameVariant }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async equipAvatarFrame(userId: string, frameVariant: string): Promise<{
    success: boolean;
    message: string;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/store/equip-frame', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, frameVariant }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async buyVipTier(userId: string, vipTier: Exclude<VipTierId, 'none'>): Promise<{
    success: boolean;
    code?: string;
    message: string;
    requiredCoins?: number;
    currentCoins?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/store/buy-vip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, vipTier }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async buyRoomTheme(userId: string, themeId: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
    requiredCoins?: number;
    currentCoins?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/store/buy-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, themeId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- Real Community Leaderboard & Clans ----------------
  async getRealLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all' = 'daily'): Promise<{
    success: boolean;
    period?: 'daily' | 'weekly' | 'monthly' | 'all';
    topEarners: Array<{
      userId: string;
      username?: string;
      fullName: string;
      avatar?: string;
      frameType?: string;
      vipTier?: string;
      vipTitle?: string;
      gameLevel: number;
      gameXp?: number;
      charms: number;
      coins: number;
      roomAddress?: string;
      isVipRoom?: boolean;
      isOnline?: boolean;
      periodScore?: number;
      periodCoins?: number;
      periodGames?: number;
      periodCharms?: number;
      chosenServiceCode?: string;
    }>;
  }> {
    try {
      const res = await apiFetch(`/api/community/leaderboard?period=${encodeURIComponent(period)}`);
      return await res.json();
    } catch {
      return { success: false, topEarners: [] };
    }
  },

  async trackReferralClick(sponsorIdentifier: string) {
    try {
      const res = await apiFetch('/api/referrals/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sponsorIdentifier }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  async getTopReferrers(currentUserId?: string): Promise<{
    success: boolean;
    topReferrers: import('../types/index.ts').TopReferrerEntry[];
    currentUserRank: import('../types/index.ts').TopReferrerEntry | null;
    totalRankedUsers: number;
  }> {
    try {
      const qs = currentUserId ? `?userId=${encodeURIComponent(currentUserId)}` : '';
      const res = await apiFetch(`/api/community/top-referrers${qs}`);
      return await res.json();
    } catch {
      return { success: false, topReferrers: [], currentUserRank: null, totalRankedUsers: 0 };
    }
  },

  async getRealClans(): Promise<{
    success: boolean;
    clans: Array<{ name: string; membersCount: number; totalLevel: number; totalCharms: number; leaderName: string }>;
  }> {
    try {
      const res = await apiFetch('/api/community/clans');
      return await res.json();
    } catch {
      return { success: false, clans: [] };
    }
  },

  // ---------------- Gift Cards & Digital Vouchers (Real Admin Fulfillment) ----------------
  async getGiftCards(): Promise<GiftCardVoucher[]> {
    try {
      const res = await apiFetch('/api/gift-cards');
      const data = await res.json();
      return data.vouchers || [];
    } catch {
      return [];
    }
  },

  async getGiftCardRedemptions(userId?: string, adminPassword?: string): Promise<GiftCardRedemption[]> {
    try {
      const query = new URLSearchParams();
      if (userId) query.set('userId', userId);
      if (adminPassword) query.set('adminPassword', adminPassword);
      const res = await apiFetch(`/api/gift-cards/redemptions?${query.toString()}`);
      const data = await res.json();
      return data.redemptions || [];
    } catch {
      return [];
    }
  },

  async redeemGiftCard(userId: string, catalogId: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
    redemption?: GiftCardRedemption;
    newBalance?: number;
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/gift-cards/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, voucherId: catalogId, catalogId }),
    });
    const data = await res.json();
    if (data.user) {
      this.setStoredUser(data.user);
    }
    return data;
  },

  async fulfillGiftCardRedemption(
    redemptionId: string,
    voucherCode: string,
    adminPassword: string,
    voucherPin = ''
  ): Promise<{ success: boolean; message: string; redemption?: GiftCardRedemption }> {
    const res = await apiFetch(`/api/admin/gift-cards/${encodeURIComponent(redemptionId)}/fulfill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucherCode, voucherPin, adminPassword }),
    });
    return await res.json();
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

  // ---------------- Admin VIP Numeric Room ID Management ----------------
  async checkVipRoomAvailability(
    adminPassword: string,
    roomNumber: string,
    excludeUserId?: string
  ): Promise<{
    success: boolean;
    valid: boolean;
    available: boolean;
    normalized: string;
    isFancyVip: boolean;
    conflictOwner?: string | null;
    message: string;
  }> {
    const res = await apiFetch('/api/admin/vip-rooms/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, roomNumber, excludeUserId }),
    });
    return await res.json();
  },

  async assignVipRoomNumber(
    adminPassword: string,
    targetUserId: string,
    roomNumber: string,
    isVipRoom = true,
    vipRoomLabel = ''
  ): Promise<{
    success: boolean;
    message: string;
    user?: UserProfile;
    room?: any;
  }> {
    const res = await apiFetch('/api/admin/vip-rooms/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, targetUserId, roomNumber, isVipRoom, vipRoomLabel }),
    });
    return await res.json();
  },

  async resetVipRoomNumber(
    adminPassword: string,
    targetUserId: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: UserProfile;
    room?: any;
  }> {
    const res = await apiFetch('/api/admin/vip-rooms/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, targetUserId }),
    });
    return await res.json();
  },

  // ---------------- Relationship Tokens & Two-Player Bonds / CP ----------------
  async buyRelationshipToken(userId: string, tokenId: string) {
    const res = await apiFetch('/api/social/relationships/buy-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, tokenId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async requestRelationshipBond(userId: string, targetIdentifier: string, tokenId: string) {
    const res = await apiFetch('/api/social/relationships/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetIdentifier, tokenId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async respondRelationshipBond(userId: string, bondId: string, action: 'accept' | 'reject') {
    const res = await apiFetch('/api/social/relationships/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bondId, action }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async removeRelationshipBond(userId: string, bondId: string) {
    const res = await apiFetch('/api/social/relationships/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, bondId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- ESP PLAY Families (Create, Join, Donate Coins, Invite, Chat + Gifts) ----------------
  async getFamilies(): Promise<{ success: boolean; families: EspFamily[] }> {
    try {
      const res = await apiFetch('/api/families');
      return await res.json();
    } catch {
      return { success: false, families: [] };
    }
  },

  async getFamilyDetail(familyId: string): Promise<{ success: boolean; family?: EspFamily; message?: string }> {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}`);
    return await res.json();
  },

  async createFamily(userId: string, name: string, emblem: string, motto: string, isOpenJoin = true) {
    const res = await apiFetch('/api/families/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, emblem, motto, isOpenJoin }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async joinFamily(familyId: string, userId: string) {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async leaveFamily(familyId: string, userId: string) {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async donateFamilyCoins(familyId: string, userId: string, amount: number) {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}/donate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  async inviteToFamily(familyId: string, userId: string, targetIdentifier: string) {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, targetIdentifier }),
    });
    return await res.json();
  },

  async sendFamilyChat(familyId: string, userId: string, text: string) {
    const res = await apiFetch(`/api/families/${encodeURIComponent(familyId)}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, text }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- ESP PLAY Events Center ----------------
  async getEventsCenter(userId: string) {
    const res = await apiFetch(`/api/events/${encodeURIComponent(userId)}`);
    return await res.json();
  },

  async claimEventReward(userId: string, eventId: string) {
    const res = await apiFetch('/api/events/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, eventId }),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- Admin Panel User Coin Grant / Adjust by User ID ----------------
  async adminAdjustUserCoins(
    adminPassword: string,
    userIdentifier: string,
    amount: number,
    mode: 'credit' | 'debit',
    reason = ''
  ): Promise<{
    success: boolean;
    message: string;
    user?: UserProfile;
    balanceBefore?: number;
    balanceAfter?: number;
  }> {
    const res = await apiFetch('/api/admin/users/adjust-coins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, userIdentifier, amount, mode, reason }),
    });
    return await res.json();
  },

  async adminCreatePlayer(
    adminPassword: string,
    payload: {
      fullName: string;
      username?: string;
      phone: string;
      email?: string;
      password: string;
      coins?: number;
      charms?: number;
      gameLevel?: number;
      vipTier?: 'none' | 'silver' | 'gold' | 'diamond';
      frameType?: string;
      avatar?: string;
      bio?: string;
      clanName?: string;
      roomNumber?: string;
      vipRoomLabel?: string;
    }
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    const res = await apiFetch('/api/admin/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminPassword, ...payload }),
    });
    return await res.json();
  },

  // ---------------- Synced 1-on-1 Direct Messages, Game Invites & Locked Room Invites ----------------
  async getDirectMessages(userId: string, peerId?: string): Promise<{
    success: boolean;
    messages: DirectMessageRecord[];
  }> {
    try {
      const qs = new URLSearchParams({ userId });
      if (peerId) qs.set('peerId', peerId);
      const res = await apiFetch(`/api/dm/thread?${qs.toString()}`);
      return await res.json();
    } catch {
      return { success: false, messages: [] };
    }
  },

  async sendDirectMessage(payload: {
    fromUserId: string;
    toUserId: string;
    text?: string;
    inviteType?: 'game' | 'locked_room';
    gameKey?: string;
    gameName?: string;
    roomAddress?: string;
    roomTitle?: string;
    passcode?: string;
  }): Promise<{
    success: boolean;
    message?: DirectMessageRecord;
    thread?: DirectMessageRecord[];
    user?: UserProfile;
  }> {
    const res = await apiFetch('/api/dm/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.user) this.setStoredUser(data.user);
    return data;
  },

  // ---------------- Admin Live 12 AM IST Clock & Weekly Rewards Monitor ----------------
  async getAdminTimeWeeklyStats(adminPassword: string) {
    const res = await apiFetch('/api/admin/time-weekly-stats', {
      headers: { 'x-admin-password': adminPassword },
    });
    return await res.json();
  },

  async resyncAdminLiveTime(adminPassword: string) {
    const res = await apiFetch('/api/admin/resync-time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({ adminPassword }),
    });
    return await res.json();
  },

  async resetUserDailyClaim(adminPassword: string, userIdentifier: string, preserveStreak = true) {
    const res = await apiFetch('/api/admin/reset-user-daily-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
      body: JSON.stringify({ adminPassword, userIdentifier, preserveStreak }),
    });
    return await res.json();
  },

  // ---------------- Multi-Device Admin Panel Auth & Device Controls (Max 4 Admin Devices) ----------------
  async adminLogin(
    adminPassword: string,
    opts?: { replaceSessionId?: string; replaceOldestDevice?: boolean }
  ): Promise<{ success: boolean; adminToken: string; activeSessions: AdminSession[]; maxDevices: number }> {
    const deviceInfo = detectClientDevice();
    const res = await apiFetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminPassword,
        deviceId: deviceInfo.deviceId,
        deviceInfo,
        replaceSessionId: opts?.replaceSessionId,
        replaceOldestDevice: opts?.replaceOldestDevice,
      }),
    });
    const data = await res.json();
    if (data.code === 'DEVICE_LIMIT_REACHED' || res.status === 409) {
      const err: any = new Error(data.message || 'Admin Panel अधिकतम 4 डिवाइसेस पर लॉगिन है!');
      err.code = 'DEVICE_LIMIT_REACHED';
      err.maxDevices = data.maxDevices || 4;
      err.activeSessions = data.activeSessions || [];
      throw err;
    }
    if (!data.success) throw new Error(data.message || 'गलत Admin Password!');
    this.setStoredAdmin(true, adminPassword, data.adminToken);
    return data;
  },

  async adminLogout(): Promise<void> {
    const adminToken = this.getStoredAdminToken();
    const deviceId = getOrCreateClientDeviceId();
    try {
      await apiFetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({ adminToken, deviceId }),
      });
    } catch {
      // ignore network error on logout
    }
    this.setStoredAdmin(false);
  },

  async verifyAdminSession(): Promise<{
    valid: boolean;
    sessionTerminated?: boolean;
    activeSessions?: AdminSession[];
    maxDevices?: number;
    message?: string;
  }> {
    const adminToken = this.getStoredAdminToken();
    const adminPassword = this.getStoredAdminPass();
    const qs = new URLSearchParams();
    if (adminToken) qs.set('token', adminToken);
    const res = await apiFetch(`/api/admin/auth/verify?${qs.toString()}`, {
      headers: {
        'x-admin-token': adminToken,
        'x-admin-password': adminPassword,
      },
    });
    return await res.json();
  },

  async getAdminSessions(adminPassword: string): Promise<{
    success: boolean;
    maxDevices: number;
    adminSessions: AdminSession[];
    userSessions: Array<{
      userId: string;
      fullName: string;
      username?: string;
      personalRoomId?: string;
      sponsorId?: string;
      role: string;
      activeCount: number;
      maxDevices: number;
      sessions: UserSession[];
    }>;
    identityAudit: {
      totalUsers: number;
      uniqueUserIds: number;
      uniqueRoomIds: number;
      uniqueUsernames: number;
      duplicateUserIds: string[];
      duplicateRoomIds: string[];
      duplicateUsernames: string[];
      integrityHealthy: boolean;
    };
  }> {
    const adminToken = this.getStoredAdminToken();
    const res = await apiFetch(`/api/admin/sessions?adminToken=${encodeURIComponent(adminToken)}`, {
      headers: {
        'x-admin-password': adminPassword,
        'x-admin-token': adminToken,
      },
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to load sessions');
    return data;
  },

  async terminateAdminSession(
    adminPassword: string,
    sessionId?: string,
    terminateAllOthers = false
  ): Promise<{ success: boolean; message?: string; adminSessions?: AdminSession[] }> {
    const adminToken = this.getStoredAdminToken();
    const res = await apiFetch('/api/admin/sessions/terminate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
        'x-admin-token': adminToken,
      },
      body: JSON.stringify({
        adminPassword,
        sessionId,
        terminateAllOthers,
        currentAdminToken: adminToken,
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to terminate admin session');
    return data;
  },

  async adminTerminateUserSession(
    adminPassword: string,
    userId: string,
    sessionId?: string,
    terminateAll = false
  ): Promise<{ success: boolean; message?: string; activeSessions?: UserSession[] }> {
    const res = await apiFetch(`/api/admin/user/${encodeURIComponent(userId)}/terminate-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ adminPassword, sessionId, terminateAll }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Failed to terminate user session');
    return data;
  },

  getLocalBackupUsers(): UserProfile[] {
    return readAllLocalBackupUsers();
  },

  async syncLocalBackupsToCloudBridge(): Promise<number> {
    if (typeof window === 'undefined') return 0;
    const allLocal = readAllLocalBackupUsers();
    if (allLocal.length === 0) return 0;
    const PUSHED_KEY = 'esp_cloud_pushed_ids_v1';
    let pushedIds: string[] = [];
    try {
      const raw = localStorage.getItem(PUSHED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) pushedIds = arr;
      }
    } catch {}
    const pushedSet = new Set(pushedIds.map(s => String(s).toLowerCase()));
    let newlyPushed = 0;
    const host = window.location.hostname || 'web';
    for (const u of allLocal) {
      if (!u?.userId) continue;
      if (pushedSet.has(u.userId.toLowerCase())) continue;
      const ok = await pushRegistrationToCloudBridge(u, u.registeredFromHost || host);
      if (ok) {
        pushedSet.add(u.userId.toLowerCase());
        newlyPushed++;
      }
    }
    try {
      localStorage.setItem(PUSHED_KEY, JSON.stringify(Array.from(pushedSet).slice(0, 500)));
    } catch {}
    return newlyPushed;
  },

  async importCloudUsersToAdmin(
    adminPassword: string,
    cloudUsers: Partial<UserProfile>[]
  ): Promise<{
    success: boolean;
    importedCount: number;
    updatedCount?: number;
    totalUsers: number;
    users?: UserProfile[];
    message?: string;
  }> {
    const res = await apiFetch('/api/admin/import-cloud-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ adminPassword, users: cloudUsers }),
    });
    return await res.json();
  },
};




