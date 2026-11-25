import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  getDocFromServer,
  collection,
  query,
  where,
  limit,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_GOOGLE_EMAIL = 'ashokraj7676767676@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  const serialized = JSON.stringify(errInfo);
  console.error('Firestore Error:', serialized);
  throw new Error(serialized);
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function onFirebaseAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function sanitizeFirestoreId(raw: string): string {
  const cleaned = String(raw || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return cleaned || 'esp_record';
}

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : fallback;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

function nonNegativeNumber(val: unknown, min = 0): number {
  const n = Number(val);
  return Number.isFinite(n) && n >= min ? n : min;
}

function normalizePhone10(raw: unknown): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10);
  if (digits.length > 10 && digits.startsWith('0')) return digits.slice(-10);
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function safeAvatarForFirestore(avatar: unknown): string {
  if (typeof avatar !== 'string') return '';
  const trimmed = avatar.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.length > 490) return '';
  return trimmed;
}

export async function compressDataUrlForFirestore(
  rawUrl: unknown,
  maxChars = 220000
): Promise<string> {
  if (typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (trimmed.length <= maxChars) return trimmed;
  if (!trimmed.startsWith('data:image/') || typeof document === 'undefined') {
    return trimmed.startsWith('http') ? trimmed.slice(0, maxChars) : '';
  }
  try {
    return await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 900;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const scale = Math.min(maxDim / width, maxDim / height);
            width = Math.max(1, Math.round(width * scale));
            height = Math.max(1, Math.round(height * scale));
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve('');
          ctx.drawImage(img, 0, 0, width, height);
          let out = canvas.toDataURL('image/jpeg', 0.65);
          if (out.length > maxChars) {
            out = canvas.toDataURL('image/jpeg', 0.42);
          }
          if (out.length > maxChars) {
            canvas.width = Math.round(width * 0.6);
            canvas.height = Math.round(height * 0.6);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            out = canvas.toDataURL('image/jpeg', 0.4);
          }
          resolve(out.length <= maxChars ? out : '');
        } catch {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = trimmed;
    });
  } catch {
    return '';
  }
}

export async function sha256Hex(input: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const enc = new TextEncoder().encode(input);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    // fallback below
  }
  // Pure JS deterministic SHA-256 for non-secure http preview contexts
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const utf8 = unescape(encodeURIComponent(input));
  const msgLen = utf8.length;
  const words: number[] = [];
  for (let i = 0; i < msgLen; i++) {
    words[i >> 2] |= (utf8.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  words[msgLen >> 2] |= 0x80 << (24 - (msgLen % 4) * 8);
  words[((msgLen + 8 >> 6) << 4) + 15] = msgLen * 8;
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let i = 0; i < words.length; i += 16) {
    const W = new Array(64).fill(0);
    for (let t = 0; t < 16; t++) W[t] = words[i + t] | 0;
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return H.map((x) => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

function sanitizeWorkspaceState(ws: any) {
  if (!ws || typeof ws !== 'object') {
    return {
      lastTab: 'dashboard',
      lastGamingSubTab: 'games',
      lastDashboardTab: 'overview',
      lastRoomAddress: '',
      updatedAt: new Date().toISOString(),
    };
  }
  return {
    lastTab: clampString(ws.lastTab, 48),
    lastGamingSubTab: clampString(ws.lastGamingSubTab, 48),
    lastDashboardTab: clampString(ws.lastDashboardTab, 48),
    lastRoomAddress: clampString(ws.lastRoomAddress, 24),
    updatedAt: clampString(ws.updatedAt, 64) || new Date().toISOString(),
  };
}

function buildValidatedUserDoc(userData: any, authUid: string, screenshotForCloud = '') {
  const safeUserId = sanitizeFirestoreId(userData.userId || userData.id);
  const nowIso = new Date().toISOString();
  const status =
    userData.status === 'active' || userData.status === 'rejected' ? userData.status : 'pending';
  const role = userData.role === 'admin' ? 'admin' : 'member';
  const accountType = userData.accountType === 'gamer' ? 'gamer' : 'business';
  const vipTier =
    userData.vipTier === 'silver' || userData.vipTier === 'gold' || userData.vipTier === 'diamond'
      ? userData.vipTier
      : 'none';
  const unlockedFrames =
    Array.isArray(userData.unlockedFrames) && userData.unlockedFrames.length > 0
      ? userData.unlockedFrames
          .filter((f: unknown): f is string => typeof f === 'string' && f.trim().length > 0)
          .slice(0, 20)
      : ['standard'];

  const phoneRaw = clampString(userData.phone, 24);
  const phone = phoneRaw.length >= 6 ? phoneRaw : '0000000000';
  const emailRaw = clampString(userData.email, 150);
  const email = emailRaw.includes('@') && emailRaw.length >= 3 ? emailRaw : `${safeUserId.toLowerCase()}@esp.local`;
  const createdAt = clampString(userData.createdAt, 64) || nowIso;
  const roomNum = clampString(userData.personalRoomId || userData.roomAddress, 24);
  const safeScreenshot = screenshotForCloud
    ? screenshotForCloud.slice(0, 249000)
    : typeof userData.paymentScreenshot === 'string' && userData.paymentScreenshot.length <= 249000
    ? userData.paymentScreenshot
    : '';

  return {
    userId: safeUserId,
    authUid: clampString(authUid, 128),
    fullName: clampString(userData.fullName, 120) || 'ESP Member',
    phone,
    email,
    fullAddress: clampString(userData.fullAddress, 300),
    paymentAddress: clampString(userData.paymentAddress, 120),
    payoutUpiId: clampString(userData.payoutUpiId || userData.paymentAddress, 120),
    sponsorId: clampString(userData.sponsorId, 64),
    sponsorName: clampString(userData.sponsorName, 120),
    chosenServiceCode: clampString(userData.chosenServiceCode, 24),
    chosenServiceName: clampString(userData.chosenServiceName, 120),
    joiningFee: nonNegativeNumber(userData.joiningFee, 0),
    joiningDate: clampString(userData.joiningDate, 32),
    paymentUtr: clampString(userData.paymentUtr, 64),
    ...(safeScreenshot ? { paymentScreenshot: safeScreenshot } : {}),
    status,
    accountType,
    balance: nonNegativeNumber(userData.balance, 0),
    totalEarnings: nonNegativeNumber(userData.totalEarnings, 0),
    referralEarnings: nonNegativeNumber(userData.referralEarnings, 0),
    totalWithdrawn: nonNegativeNumber(userData.totalWithdrawn, 0),
    coins: nonNegativeNumber(userData.coins, 0),
    charms: nonNegativeNumber(userData.charms, 0),
    gameLevel: nonNegativeNumber(userData.gameLevel, 1),
    gameXp: nonNegativeNumber(userData.gameXp, 0),
    vipTier,
    unlockedFrames,
    frameType: clampString(userData.frameType, 64) || 'standard',
    tasksCompletedCount: nonNegativeNumber(userData.tasksCompletedCount, 0),
    totalGamesPlayed: nonNegativeNumber(userData.totalGamesPlayed, 0),
    totalGamesWon: nonNegativeNumber(userData.totalGamesWon, 0),
    unlockedRooms: Array.isArray(userData.unlockedRooms)
      ? userData.unlockedRooms.filter((r: unknown): r is string => typeof r === 'string' && r.trim().length > 0).slice(0, 30)
      : ['default_dark'],
    roomTheme: clampString(userData.roomTheme, 64) || 'default_dark',
    clanName: clampString(userData.clanName, 100),
    username: clampString(String(userData.username || '').replace(/^@+/, '').toLowerCase(), 24),
    avatar: safeAvatarForFirestore(userData.avatar),
    coverPhoto: safeAvatarForFirestore(userData.coverPhoto),
    bio: clampString(userData.bio, 240),
    gender: clampString(userData.gender, 24),
    location: clampString(userData.location, 100),
    friendsList: Array.isArray(userData.friendsList)
      ? userData.friendsList.filter((f: unknown): f is string => typeof f === 'string' && f.trim().length > 0).slice(0, 500)
      : [],
    gamingId: clampString(userData.gamingId || `GM-${safeUserId}`, 64),
    personalRoomId: roomNum,
    roomAddress: roomNum,
    todayActiveness: nonNegativeNumber(userData.todayActiveness, 0),
    loginStreak: nonNegativeNumber(userData.loginStreak, 0),
    claimedDays: Array.isArray(userData.claimedDays)
      ? userData.claimedDays.map((d: unknown) => Number(d)).filter((n: number) => Number.isFinite(n)).slice(0, 7)
      : [],
    lastDailyCheckInDate: clampString(userData.lastDailyCheckInDate, 32),
    workspaceState: sanitizeWorkspaceState(userData.workspaceState),
    registeredFromHost: clampString(userData.registeredFromHost, 128),
    swiAppLink: clampString(userData.swiAppLink, 500),
    swiAppNote: clampString(userData.swiAppNote, 500),
    password: clampString(userData.password, 128),
    role,
    createdAt: createdAt.length >= 4 ? createdAt : nowIso,
    updatedAt: nowIso,
  };
}

function buildCloudRegistrationDoc(userData: any, hostOverride?: string, screenshotForCloud = '') {
  const safeUserId = sanitizeFirestoreId(userData.userId || userData.id);
  const nowIso = new Date().toISOString();
  const status =
    userData.status === 'active' || userData.status === 'rejected' ? userData.status : 'pending';
  const accountType = userData.accountType === 'gamer' ? 'gamer' : 'business';
  const vipTier =
    userData.vipTier === 'silver' || userData.vipTier === 'gold' || userData.vipTier === 'diamond'
      ? userData.vipTier
      : 'none';
  const phoneRaw = clampString(userData.phone, 24);
  const phone = phoneRaw.length >= 6 ? phoneRaw : '0000000000';
  const emailRaw = clampString(userData.email, 150);
  const email = emailRaw.includes('@') && emailRaw.length >= 3 ? emailRaw : `${safeUserId.toLowerCase()}@esp.local`;
  const createdAt = clampString(userData.createdAt, 64) || nowIso;
  const roomNum = clampString(userData.personalRoomId || userData.roomAddress, 24);
  const detectedHost =
    clampString(hostOverride || userData.registeredFromHost, 128) ||
    (typeof window !== 'undefined' ? clampString(window.location.hostname, 128) : 'web');
  const safeScreenshot = screenshotForCloud
    ? screenshotForCloud.slice(0, 249000)
    : typeof userData.paymentScreenshot === 'string' && userData.paymentScreenshot.length <= 249000
    ? userData.paymentScreenshot
    : '';

  return {
    id: clampString(userData.id, 128) || safeUserId,
    userId: safeUserId,
    gamingId: clampString(userData.gamingId || `GM-${safeUserId}`, 64),
    username: clampString(String(userData.username || '').replace(/^@+/, '').toLowerCase(), 24),
    fullName: clampString(userData.fullName, 120) || 'ESP Member',
    phone,
    email,
    fullAddress: clampString(userData.fullAddress, 300),
    paymentAddress: clampString(userData.paymentAddress, 120),
    payoutUpiId: clampString(userData.payoutUpiId || userData.paymentAddress, 120),
    password: clampString(userData.password, 128),
    sponsorId: clampString(userData.sponsorId, 64),
    sponsorName: clampString(userData.sponsorName, 120),
    chosenServiceCode: clampString(userData.chosenServiceCode, 24),
    chosenServiceName: clampString(userData.chosenServiceName, 120),
    joiningFee: nonNegativeNumber(userData.joiningFee, 0),
    joiningDate: clampString(userData.joiningDate, 32),
    paymentUtr: clampString(userData.paymentUtr, 64),
    ...(safeScreenshot ? { paymentScreenshot: safeScreenshot } : {}),
    status,
    accountType,
    balance: nonNegativeNumber(userData.balance, 0),
    coins: nonNegativeNumber(userData.coins, 0),
    charms: nonNegativeNumber(userData.charms, 0),
    gameLevel: nonNegativeNumber(userData.gameLevel, 1),
    vipTier,
    frameType: clampString(userData.frameType, 64) || 'standard',
    personalRoomId: roomNum,
    roomAddress: roomNum,
    registeredFromHost: detectedHost,
    swiAppLink: clampString(userData.swiAppLink, 500),
    swiAppNote: clampString(userData.swiAppNote, 500),
    role: 'member' as const,
    createdAt: createdAt.length >= 4 ? createdAt : nowIso,
    updatedAt: nowIso,
  };
}

// ======================== GLOBAL IDENTITY LOCKS (ZERO DUPLICATE ACROSS ORIGINS) ========================

async function makeLockKey(
  lockType: 'phone' | 'email' | 'username' | 'userId' | 'gamingId' | 'roomAddress',
  rawValue: string
): Promise<string> {
  const prefixMap: Record<string, string> = {
    phone: 'ph',
    email: 'em',
    username: 'un',
    userId: 'uid',
    gamingId: 'gid',
    roomAddress: 'rm',
  };
  const norm =
    lockType === 'phone'
      ? normalizePhone10(rawValue)
      : rawValue.trim().toLowerCase().replace(/^@+/, '');
  const hash = await sha256Hex(`esp_lock_v1|${lockType}|${norm}`);
  return `${prefixMap[lockType]}_${hash.slice(0, 48)}`;
}

export async function checkIdentityLocksInCloud(params: {
  phone?: string;
  email?: string;
  username?: string;
  userId?: string;
  gamingId?: string;
  roomAddress?: string;
  excludeUserId?: string;
}): Promise<{ ok: boolean; conflictField?: string; existingUserId?: string; message?: string }> {
  const checks: Array<{
    type: 'phone' | 'email' | 'username' | 'userId' | 'gamingId' | 'roomAddress';
    val: string;
    label: string;
  }> = [];

  const phone10 = normalizePhone10(params.phone || '');
  if (phone10.length >= 10) checks.push({ type: 'phone', val: phone10, label: 'मोबाइल नंबर' });

  const emailClean = String(params.email || '').trim().toLowerCase();
  if (emailClean.includes('@') && emailClean.includes('.')) {
    checks.push({ type: 'email', val: emailClean, label: 'ईमेल आईडी' });
  }

  const unameClean = String(params.username || '').trim().toLowerCase().replace(/^@+/, '');
  if (unameClean && /^[a-z0-9]{3,24}$/.test(unameClean)) {
    checks.push({ type: 'username', val: unameClean, label: 'यूनिक @username' });
  }

  if (params.userId && params.userId.trim()) {
    checks.push({ type: 'userId', val: params.userId.trim().toLowerCase(), label: 'User ID' });
  }
  if (params.gamingId && params.gamingId.trim()) {
    checks.push({ type: 'gamingId', val: params.gamingId.trim().toLowerCase(), label: 'Gaming ID' });
  }
  if (params.roomAddress && params.roomAddress.trim()) {
    checks.push({ type: 'roomAddress', val: params.roomAddress.trim(), label: 'Room ID' });
  }

  for (const c of checks) {
    try {
      const key = await makeLockKey(c.type, c.val);
      const snap = await getDoc(doc(db, 'identity_locks', key));
      if (snap.exists()) {
        const ownerId = String(snap.data()?.userId || '');
        if (!params.excludeUserId || ownerId.toLowerCase() !== params.excludeUserId.toLowerCase()) {
          return {
            ok: false,
            conflictField: c.type,
            existingUserId: ownerId,
            message: `यह ${c.label} पहले से दूसरे खाते (${ownerId}) में पंजीकृत है! कृपया नया ${c.label} दर्ज करें या लॉगिन / "Forget ID?" का उपयोग करें।`,
          };
        }
      }
    } catch {
      // network offline: fall back cleanly to local/server uniqueness check
    }
  }

  return { ok: true };
}

export async function registerIdentityLocksInCloud(userData: any): Promise<void> {
  if (!userData || !userData.userId) return;
  const safeUserId = sanitizeFirestoreId(userData.userId);
  const nowIso = clampString(userData.createdAt, 64) || new Date().toISOString();
  const baseMeta = {
    userId: safeUserId,
    gamingId: clampString(userData.gamingId || '', 64),
    accountType: (userData.accountType === 'gamer' ? 'gamer' : 'business') as 'gamer' | 'business',
    chosenServiceCode: clampString(userData.chosenServiceCode || '', 24),
    createdAt: nowIso,
  };

  const pairs: Array<['phone' | 'email' | 'username' | 'userId' | 'gamingId' | 'roomAddress', string]> = [];
  const p10 = normalizePhone10(userData.phone || '');
  if (p10.length >= 10) pairs.push(['phone', p10]);
  const em = String(userData.email || '').trim().toLowerCase();
  if (em.includes('@') && em.includes('.')) pairs.push(['email', em]);
  const un = String(userData.username || '').trim().toLowerCase().replace(/^@+/, '');
  if (un && /^[a-z0-9]{3,24}$/.test(un)) pairs.push(['username', un]);
  pairs.push(['userId', safeUserId.toLowerCase()]);
  if (userData.gamingId) pairs.push(['gamingId', String(userData.gamingId).trim().toLowerCase()]);
  const roomNum = String(userData.personalRoomId || userData.roomAddress || '').trim();
  if (roomNum) pairs.push(['roomAddress', roomNum]);

  const fbUser = auth.currentUser;
  const isOwnerAdmin =
    Boolean(fbUser && fbUser.emailVerified && fbUser.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL);

  await Promise.all(
    pairs.map(async ([lockType, val]) => {
      try {
        const lockKey = await makeLockKey(lockType, val);
        const ref = doc(db, 'identity_locks', lockKey);
        const existing = await getDoc(ref);
        if (!existing.exists() || isOwnerAdmin) {
          await setDoc(ref, {
            lockKey,
            lockType,
            ...baseMeta,
          });
        }
      } catch {
        // non-fatal
      }
    })
  );
}

export async function lookupUserIdByLockInCloud(phoneOrEmailOrHandle: string): Promise<{
  userId: string;
  gamingId: string;
  accountType: string;
  chosenServiceCode: string;
} | null> {
  const clean = String(phoneOrEmailOrHandle || '').trim();
  if (!clean) return null;
  const candidates: Array<['phone' | 'email' | 'username', string]> = [];
  const digits = normalizePhone10(clean);
  if (digits.length >= 10) candidates.push(['phone', digits]);
  if (clean.includes('@') && clean.includes('.')) candidates.push(['email', clean.toLowerCase()]);
  const uname = clean.replace(/^@+/, '').toLowerCase();
  if (/^[a-z0-9]{3,24}$/.test(uname)) candidates.push(['username', uname]);

  for (const [lockType, val] of candidates) {
    try {
      const lockKey = await makeLockKey(lockType, val);
      const snap = await getDoc(doc(db, 'identity_locks', lockKey));
      if (snap.exists()) {
        const d = snap.data();
        return {
          userId: String(d.userId || ''),
          gamingId: String(d.gamingId || ''),
          accountType: String(d.accountType || 'business'),
          chosenServiceCode: String(d.chosenServiceCode || 'EMO'),
        };
      }
    } catch {
      // continue trying other lock types
    }
  }
  return null;
}

// ======================== CREDENTIAL-KEYED CROSS-DEVICE VAULT ========================

async function makeVaultKey(identifier: string, password: string): Promise<string> {
  const normId = String(identifier || '').trim().toLowerCase();
  const pass = String(password || '').trim();
  const h = await sha256Hex(`esp_vault_v2|${normId}|${pass}`);
  return `v_${h}`;
}

export async function pushDeviceSyncVault(userData: any, passwordOverride?: string): Promise<boolean> {
  if (!userData || !userData.userId) return false;
  const pass = String(passwordOverride || userData.password || '').trim();
  if (!pass) return false;

  const safeUserId = sanitizeFirestoreId(userData.userId);
  const nowIso = new Date().toISOString();
  const primaryVaultKey = await makeVaultKey(safeUserId, pass);
  const roomNum = clampString(userData.personalRoomId || userData.roomAddress, 24);
  const phone10 = normalizePhone10(userData.phone || '') || clampString(userData.phone, 24);
  const emailClean = clampString(String(userData.email || '').toLowerCase(), 150);
  const cleanUsername = clampString(String(userData.username || '').replace(/^@+/, '').toLowerCase(), 24);

  const canonicalPayload = {
    vaultKey: primaryVaultKey,
    isPointer: false,
    pointerTargetKey: '',
    userId: safeUserId,
    gamingId: clampString(userData.gamingId || `GM-${safeUserId}`, 64),
    personalRoomId: roomNum,
    roomAddress: roomNum,
    sponsorId: clampString(userData.sponsorId, 64),
    sponsorName: clampString(userData.sponsorName, 120),
    username: cleanUsername,
    fullName: clampString(userData.fullName, 120) || 'ESP Member',
    phone: phone10 || '0000000000',
    email: emailClean || `${safeUserId.toLowerCase()}@esp.local`,
    fullAddress: clampString(userData.fullAddress, 300),
    paymentAddress: clampString(userData.paymentAddress, 120),
    payoutUpiId: clampString(userData.payoutUpiId || userData.paymentAddress, 120),
    chosenServiceCode: clampString(userData.chosenServiceCode, 24),
    chosenServiceName: clampString(userData.chosenServiceName, 120),
    joiningFee: nonNegativeNumber(userData.joiningFee, 0),
    joiningDate: clampString(userData.joiningDate, 32),
    paymentUtr: clampString(userData.paymentUtr, 64),
    status: userData.status === 'active' || userData.status === 'rejected' ? userData.status : 'pending',
    accountType: userData.accountType === 'gamer' ? 'gamer' : 'business',
    role: userData.role === 'admin' ? 'admin' : 'member',
    balance: nonNegativeNumber(userData.balance, 0),
    totalEarnings: nonNegativeNumber(userData.totalEarnings, 0),
    referralEarnings: nonNegativeNumber(userData.referralEarnings, 0),
    totalWithdrawn: nonNegativeNumber(userData.totalWithdrawn, 0),
    coins: nonNegativeNumber(userData.coins, 0),
    charms: nonNegativeNumber(userData.charms, 0),
    gameLevel: nonNegativeNumber(userData.gameLevel, 1),
    gameXp: nonNegativeNumber(userData.gameXp, 0),
    vipTier:
      userData.vipTier === 'silver' || userData.vipTier === 'gold' || userData.vipTier === 'diamond'
        ? userData.vipTier
        : 'none',
    frameType: clampString(userData.frameType, 64) || 'standard',
    unlockedFrames:
      Array.isArray(userData.unlockedFrames) && userData.unlockedFrames.length > 0
        ? userData.unlockedFrames.filter((f: unknown): f is string => typeof f === 'string' && f.length > 0).slice(0, 20)
        : ['standard'],
    tasksCompletedCount: nonNegativeNumber(userData.tasksCompletedCount, 0),
    totalGamesPlayed: nonNegativeNumber(userData.totalGamesPlayed, 0),
    totalGamesWon: nonNegativeNumber(userData.totalGamesWon, 0),
    unlockedRooms: Array.isArray(userData.unlockedRooms)
      ? userData.unlockedRooms.filter((r: unknown): r is string => typeof r === 'string' && r.length > 0).slice(0, 30)
      : ['default_dark'],
    roomTheme: clampString(userData.roomTheme, 64) || 'default_dark',
    clanName: clampString(userData.clanName, 100),
    avatar: safeAvatarForFirestore(userData.avatar),
    coverPhoto: safeAvatarForFirestore(userData.coverPhoto),
    bio: clampString(userData.bio, 240),
    gender: clampString(userData.gender, 24),
    location: clampString(userData.location, 100),
    friendsList: Array.isArray(userData.friendsList)
      ? userData.friendsList.filter((f: unknown): f is string => typeof f === 'string' && f.length > 0).slice(0, 500)
      : [],
    todayActiveness: nonNegativeNumber(userData.todayActiveness, 0),
    loginStreak: nonNegativeNumber(userData.loginStreak, 0),
    claimedDays: Array.isArray(userData.claimedDays)
      ? userData.claimedDays.map((d: unknown) => Number(d)).filter((n: number) => Number.isFinite(n)).slice(0, 7)
      : [],
    lastDailyCheckInDate: clampString(userData.lastDailyCheckInDate, 32),
    workspaceState: sanitizeWorkspaceState(userData.workspaceState),
    registeredFromHost: clampString(userData.registeredFromHost, 128),
    swiAppLink: clampString(userData.swiAppLink, 500),
    swiAppNote: clampString(userData.swiAppNote, 500),
    password: clampString(pass, 128),
    createdAt: clampString(userData.createdAt, 64) || nowIso,
    updatedAt: nowIso,
  };

  try {
    await setDoc(doc(db, 'device_sync_vault', primaryVaultKey), canonicalPayload);
    // Write alias pointers for phone, email, username, gamingId
    const aliases: string[] = [];
    if (phone10.length >= 10) aliases.push(phone10);
    if (emailClean.includes('@')) aliases.push(emailClean);
    if (cleanUsername && /^[a-z0-9]{3,24}$/.test(cleanUsername)) aliases.push(cleanUsername);
    if (userData.gamingId && String(userData.gamingId).toLowerCase() !== safeUserId.toLowerCase()) {
      aliases.push(String(userData.gamingId).trim().toLowerCase());
    }

    await Promise.all(
      aliases.map(async (alias) => {
        try {
          const aliasKey = await makeVaultKey(alias, pass);
          if (aliasKey === primaryVaultKey) return;
          await setDoc(doc(db, 'device_sync_vault', aliasKey), {
            vaultKey: aliasKey,
            isPointer: true,
            pointerTargetKey: primaryVaultKey,
            userId: safeUserId,
            updatedAt: nowIso,
          });
        } catch {
          // ignore alias failure
        }
      })
    );
    return true;
  } catch {
    return false;
  }
}

export async function pullUserFromDeviceVault(identifier: string, password: string): Promise<any | null> {
  const raw = String(identifier || '').trim();
  const pass = String(password || '').trim();
  if (!raw || !pass) return null;

  const candidateIds = new Set<string>([raw.toLowerCase()]);
  const digits = normalizePhone10(raw);
  if (digits.length >= 10) candidateIds.add(digits);
  if (raw.startsWith('@')) candidateIds.add(raw.slice(1).toLowerCase());

  for (const idCandidate of candidateIds) {
    try {
      const vaultKey = await makeVaultKey(idCandidate, pass);
      const snap = await getDoc(doc(db, 'device_sync_vault', vaultKey));
      if (!snap.exists()) continue;
      let data = snap.data();
      if (data.isPointer && data.pointerTargetKey) {
        const targetSnap = await getDoc(doc(db, 'device_sync_vault', String(data.pointerTargetKey)));
        if (targetSnap.exists()) {
          data = targetSnap.data();
        } else {
          continue;
        }
      }
      if (data && data.userId) {
        return data;
      }
    } catch {
      // ignore read failure and try next candidate
    }
  }
  return null;
}

// ======================== CROSS-ORIGIN CLOUD BRIDGE & ADMIN SYNC ========================

export async function pushRegistrationToCloudBridge(userData: any, hostOverride?: string): Promise<boolean> {
  if (!userData || (!userData.userId && !userData.id)) return false;
  const compressedShot = await compressDataUrlForFirestore(userData.paymentScreenshot, 220000);
  const payload = buildCloudRegistrationDoc(userData, hostOverride, compressedShot);

  // Also register zero-PII identity locks + multi-device vault in parallel
  void registerIdentityLocksInCloud(userData);
  if (userData.password) {
    void pushDeviceSyncVault(userData, userData.password);
  }

  try {
    const ref = doc(db, 'cloud_registrations', payload.userId);
    const fbUser = auth.currentUser;
    const isOwnerAdmin =
      Boolean(fbUser && fbUser.emailVerified && fbUser.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL);
    if (!isOwnerAdmin) {
      const existing = await getDoc(ref).catch(() => null);
      if (existing && existing.exists()) {
        // Already exists; vault handles state updates without violating admin-only cloud_registrations update
        return true;
      }
    }
    await setDoc(ref, payload);
    return true;
  } catch {
    return false;
  }
}

export async function pushPlanUpgradeToCloud(upgradeReq: any): Promise<boolean> {
  if (!upgradeReq || !upgradeReq.id || !upgradeReq.userId) return false;
  try {
    const compressedShot = await compressDataUrlForFirestore(upgradeReq.paymentScreenshot, 220000);
    const safeId = sanitizeFirestoreId(upgradeReq.id);
    const safeUserId = sanitizeFirestoreId(upgradeReq.userId);
    await setDoc(doc(db, 'cloud_plan_upgrades', safeId), {
      id: safeId,
      userId: safeUserId,
      userName: clampString(upgradeReq.userName, 120),
      fromAccountType: upgradeReq.fromAccountType === 'gamer' ? 'gamer' : 'business',
      upgradeType: upgradeReq.upgradeType === 'gamer_to_business' ? 'gamer_to_business' : 'plan_upgrade',
      fromServiceCode: clampString(upgradeReq.fromServiceCode, 24),
      fromFee: nonNegativeNumber(upgradeReq.fromFee, 0),
      targetServiceCode: clampString(upgradeReq.targetServiceCode, 24) || 'EMO',
      targetServiceName: clampString(upgradeReq.targetServiceName, 120),
      upgradeFee: nonNegativeNumber(upgradeReq.upgradeFee, 0),
      paymentUtr: clampString(upgradeReq.paymentUtr, 64),
      ...(compressedShot ? { paymentScreenshot: compressedShot } : {}),
      status: upgradeReq.status === 'approved' || upgradeReq.status === 'rejected' ? upgradeReq.status : 'pending',
      createdAt: clampString(upgradeReq.createdAt, 64) || new Date().toISOString(),
      ...(upgradeReq.processedAt ? { processedAt: clampString(upgradeReq.processedAt, 64) } : {}),
    });
    return true;
  } catch {
    return false;
  }
}

export async function fetchAllCloudUpgradesForAdmin(): Promise<any[]> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified || fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
    return [];
  }
  try {
    const snap = await getDocs(collection(db, 'cloud_plan_upgrades'));
    return snap.docs.map((d) => d.data());
  } catch {
    return [];
  }
}

export async function fetchAllCloudUsersForAdmin(): Promise<any[]> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified || fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
    return [];
  }
  const merged = new Map<string, any>();
  const addRecord = (raw: any) => {
    if (!raw || !raw.userId) return;
    const key = String(raw.userId).toLowerCase();
    const prev = merged.get(key);
    if (!prev) {
      merged.set(key, raw);
      return;
    }
    const prevTime = Date.parse(prev.updatedAt || prev.createdAt || '') || 0;
    const nextTime = Date.parse(raw.updatedAt || raw.createdAt || '') || 0;
    const newer = nextTime >= prevTime ? raw : prev;
    const older = nextTime >= prevTime ? prev : raw;
    // Preserve non-empty richer fields like paymentScreenshot, fullAddress, password across merge
    merged.set(key, {
      ...older,
      ...newer,
      paymentScreenshot: newer.paymentScreenshot || older.paymentScreenshot || '',
      fullAddress: newer.fullAddress || older.fullAddress || '',
      paymentAddress: newer.paymentAddress || older.paymentAddress || '',
      payoutUpiId: newer.payoutUpiId || older.payoutUpiId || '',
      password: newer.password || older.password || '',
      swiAppLink: newer.swiAppLink || older.swiAppLink || '',
      swiAppNote: newer.swiAppNote || older.swiAppNote || '',
    });
  };
  try {
    const cloudSnap = await getDocs(collection(db, 'cloud_registrations'));
    cloudSnap.docs.forEach((d) => addRecord(d.data()));
  } catch (err) {
    console.warn('Firestore cloud_registrations read note:', err);
  }
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.docs.forEach((d) => addRecord(d.data()));
  } catch (err) {
    console.warn('Firestore users read note:', err);
  }
  return Array.from(merged.values());
}

export async function updateUserStatusInFirestore(
  userId: string,
  newStatus: 'active' | 'pending' | 'rejected',
  fullUserSnapshot?: any
): Promise<boolean> {
  const fbUser = auth.currentUser;
  const isOwnerAdmin =
    Boolean(fbUser && fbUser.emailVerified && fbUser.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL);
  const merged = fullUserSnapshot
    ? { ...fullUserSnapshot, userId, status: newStatus, updatedAt: new Date().toISOString() }
    : { userId, status: newStatus, updatedAt: new Date().toISOString() };

  // Always update device vault if password is known so user sees approval immediately across all devices
  if (merged.password) {
    void pushDeviceSyncVault(merged, merged.password);
  }

  if (!isOwnerAdmin) return false;

  try {
    const safeUserId = sanitizeFirestoreId(userId);
    const compressedShot = await compressDataUrlForFirestore(merged.paymentScreenshot, 220000);
    await setDoc(doc(db, 'users', safeUserId), buildValidatedUserDoc(merged, fbUser!.uid, compressedShot));
    await setDoc(doc(db, 'cloud_registrations', safeUserId), buildCloudRegistrationDoc(merged, undefined, compressedShot));
    await setDoc(doc(db, 'public_profiles', safeUserId), buildPublicProfileDoc(merged, fbUser!.uid));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${userId}`);
  }
}

export async function pushPlatformConfigToFirestore(settings: any, services?: any[]): Promise<boolean> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified || fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
    return false;
  }
  try {
    const payload: Record<string, any> = {
      configId: 'global',
      updatedAt: new Date().toISOString(),
      updatedBy: clampString(fbUser.email || ADMIN_GOOGLE_EMAIL, 150),
    };
    if (settings && typeof settings === 'object') {
      // Avoid exceeding 1MB doc limit if adminQrCodeUrl is huge base64
      const qr =
        typeof settings.adminQrCodeUrl === 'string' && settings.adminQrCodeUrl.length <= 220000
          ? settings.adminQrCodeUrl
          : '';
      payload.settings = { ...settings, adminQrCodeUrl: qr };
    }
    if (Array.isArray(services)) {
      payload.services = services.slice(0, 40);
    }
    await setDoc(doc(db, 'platform_config', 'global'), payload, { merge: true });
    return true;
  } catch {
    return false;
  }
}

export async function fetchPlatformConfigFromFirestore(): Promise<{
  settings?: any;
  services?: any[];
  updatedAt?: string;
} | null> {
  try {
    const snap = await getDoc(doc(db, 'platform_config', 'global'));
    if (!snap.exists()) return null;
    return snap.data() as any;
  } catch {
    return null;
  }
}

function buildPublicProfileDoc(userData: any, authUid: string) {
  const safeUserId = sanitizeFirestoreId(userData.userId || userData.id);
  const nowIso = new Date().toISOString();
  const vipTier =
    userData.vipTier === 'silver' || userData.vipTier === 'gold' || userData.vipTier === 'diamond'
      ? userData.vipTier
      : 'none';
  const roomNum = clampString(userData.personalRoomId || userData.roomAddress, 24);

  return {
    userId: safeUserId,
    authUid: clampString(authUid, 128),
    username: clampString(String(userData.username || '').replace(/^@+/, '').toLowerCase(), 24),
    fullName: clampString(userData.fullName, 120) || 'ESP Member',
    avatar: safeAvatarForFirestore(userData.avatar),
    coverPhoto: safeAvatarForFirestore(userData.coverPhoto),
    bio: clampString(userData.bio, 240),
    gender: clampString(userData.gender, 24),
    location: clampString(userData.location, 100),
    frameType: clampString(userData.frameType, 64) || 'standard',
    vipTier,
    gameLevel: nonNegativeNumber(userData.gameLevel, 1),
    gameXp: nonNegativeNumber(userData.gameXp, 0),
    charms: nonNegativeNumber(userData.charms, 0),
    coins: nonNegativeNumber(userData.coins, 0),
    clanName: clampString(userData.clanName, 100),
    personalRoomId: roomNum,
    roomAddress: roomNum,
    friendsCount: Array.isArray(userData.friendsList) ? userData.friendsList.length : nonNegativeNumber(userData.friendsCount, 0),
    isPublic: true,
    updatedAt: nowIso,
  };
}

export async function syncUserToFirestore(userData: any, silentIfUnauthenticated = true): Promise<boolean> {
  if (!userData || (!userData.userId && !userData.id)) return false;

  // Always keep zero-PII identity locks, cross-origin bridge & multi-device vault updated
  void pushRegistrationToCloudBridge(userData);

  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    if (silentIfUnauthenticated) return false;
    throw new Error('Firebase Google verification is required for Cloud Sync.');
  }

  const safeUserId = sanitizeFirestoreId(userData.userId || userData.id);
  const isOwnerAdmin = fbUser.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL;

  // Claim / verify unique @username document in /usernames/{username} if present
  const cleanUsername = clampString(String(userData.username || '').replace(/^@+/, '').toLowerCase(), 24);
  if (cleanUsername && /^[a-z0-9]{3,24}$/.test(cleanUsername)) {
    const unamePath = `usernames/${cleanUsername}`;
    try {
      const unameRef = doc(db, 'usernames', cleanUsername);
      const unameSnap = await getDoc(unameRef);
      if (!unameSnap.exists()) {
        await setDoc(unameRef, {
          username: cleanUsername,
          userId: safeUserId,
          authUid: fbUser.uid,
          createdAt: new Date().toISOString(),
        });
      } else if (unameSnap.data()?.authUid !== fbUser.uid && unameSnap.data()?.userId !== safeUserId) {
        if (!silentIfUnauthenticated) {
          throw new Error(`Username @${cleanUsername} is already reserved by another account.`);
        }
      }
    } catch (err) {
      if (!silentIfUnauthenticated) handleFirestoreError(err, OperationType.WRITE, unamePath);
    }
  }

  const publicPath = `public_profiles/${safeUserId}`;
  const publicDoc = buildPublicProfileDoc(userData, fbUser.uid);

  try {
    const existingPublic = await getDoc(doc(db, 'public_profiles', safeUserId));
    if (!existingPublic.exists() || existingPublic.data()?.authUid === fbUser.uid || isOwnerAdmin) {
      await setDoc(doc(db, 'public_profiles', safeUserId), publicDoc, { merge: existingPublic.exists() });
    }
  } catch (err) {
    if (!silentIfUnauthenticated) handleFirestoreError(err, OperationType.WRITE, publicPath);
    return false;
  }

  const userPath = `users/${safeUserId}`;
  const compressedShot = await compressDataUrlForFirestore(userData.paymentScreenshot, 220000);
  try {
    const userRef = doc(db, 'users', safeUserId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existingData = snap.data();
      if (isOwnerAdmin) {
        const payload = buildValidatedUserDoc(userData, existingData?.authUid || fbUser.uid, compressedShot);
        await setDoc(userRef, payload, { merge: false });
        await setDoc(
          doc(db, 'cloud_registrations', safeUserId),
          buildCloudRegistrationDoc(userData, undefined, compressedShot)
        ).catch(() => {});
      } else if (existingData?.authUid === fbUser.uid) {
        const previousUsername = clampString(
          String(existingData.username || '').replace(/^@+/, '').toLowerCase(),
          24
        );
        await setDoc(
          userRef,
          {
            username: cleanUsername || existingData.username || '',
            fullName: clampString(userData.fullName, 120) || existingData.fullName,
            fullAddress: clampString(userData.fullAddress, 300),
            paymentAddress: clampString(userData.paymentAddress, 120),
            payoutUpiId: clampString(userData.payoutUpiId || userData.paymentAddress, 120),
            avatar: safeAvatarForFirestore(userData.avatar),
            coverPhoto: safeAvatarForFirestore(userData.coverPhoto),
            bio: clampString(userData.bio, 240),
            gender: clampString(userData.gender, 24),
            location: clampString(userData.location, 100),
            friendsList: Array.isArray(userData.friendsList)
              ? userData.friendsList.filter((f: unknown): f is string => typeof f === 'string' && f.trim().length > 0).slice(0, 500)
              : existingData.friendsList || [],
            clanName: clampString(userData.clanName, 100),
            accountType: userData.accountType === 'gamer' ? 'gamer' : 'business',
            workspaceState: sanitizeWorkspaceState(userData.workspaceState),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
        if (cleanUsername && previousUsername && previousUsername !== cleanUsername) {
          deleteDoc(doc(db, 'usernames', previousUsername)).catch(() => {});
        }
      }
    } else if (isOwnerAdmin) {
      const payload = buildValidatedUserDoc(userData, fbUser.uid, compressedShot);
      await setDoc(userRef, payload);
      await setDoc(
        doc(db, 'cloud_registrations', safeUserId),
        buildCloudRegistrationDoc(userData, undefined, compressedShot)
      ).catch(() => {});
    } else {
      const payload = buildValidatedUserDoc(
        {
          ...userData,
          status: 'pending',
          role: 'member',
          coins: 0,
          balance: 0,
        },
        fbUser.uid,
        compressedShot
      );
      await setDoc(userRef, payload);
    }
    return true;
  } catch (err) {
    if (!silentIfUnauthenticated) handleFirestoreError(err, OperationType.WRITE, userPath);
    return false;
  }
}

export async function fetchPublicProfilesFromFirestore() {
  if (!auth.currentUser) return [];
  const path = 'public_profiles';
  try {
    const q = query(collection(db, 'public_profiles'), where('isPublic', '==', true), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function syncAdminDatasetToFirestore(dataset: {
  users: any[];
  payouts?: any[];
  giftCards?: any[];
  planUpgrades?: any[];
  settings?: any;
  services?: any[];
}): Promise<{ syncedUsers: number; syncedPayouts: number; syncedGiftCards: number }> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified || fbUser.email?.toLowerCase() !== ADMIN_GOOGLE_EMAIL) {
    throw new Error(`Admin Google verification (${ADMIN_GOOGLE_EMAIL}) required for Firestore sync.`);
  }

  let syncedUsers = 0;
  let syncedPayouts = 0;
  let syncedGiftCards = 0;

  for (const u of dataset.users || []) {
    const safeUserId = sanitizeFirestoreId(u.userId || u.id);
    const userPath = `users/${safeUserId}`;
    try {
      const compressedShot = await compressDataUrlForFirestore(u.paymentScreenshot, 220000);
      const validated = buildValidatedUserDoc(u, fbUser.uid, compressedShot);
      await setDoc(doc(db, 'users', safeUserId), validated);
      await setDoc(doc(db, 'public_profiles', safeUserId), buildPublicProfileDoc(u, fbUser.uid));
      await setDoc(doc(db, 'cloud_registrations', safeUserId), buildCloudRegistrationDoc(u, undefined, compressedShot));
      await registerIdentityLocksInCloud(u);
      if (u.password) {
        await pushDeviceSyncVault(u, u.password);
      }
      syncedUsers++;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
  }

  for (const upg of dataset.planUpgrades || []) {
    await pushPlanUpgradeToCloud(upg).catch(() => {});
  }

  if (dataset.settings || dataset.services) {
    await pushPlatformConfigToFirestore(dataset.settings, dataset.services).catch(() => {});
  }

  for (const p of dataset.payouts || []) {
    const safeId = sanitizeFirestoreId(p.id);
    const safeUserId = sanitizeFirestoreId(p.userId);
    const payoutPath = `payouts/${safeId}`;
    const amount = Number(p.amount);
    if (!Number.isFinite(amount) || amount < 10) continue;
    const status = p.status === 'approved' || p.status === 'rejected' ? p.status : 'pending';
    try {
      await setDoc(doc(db, 'payouts', safeId), {
        id: safeId,
        userId: safeUserId,
        authUid: fbUser.uid,
        userName: clampString(p.userName, 120),
        amount,
        payoutAddress: clampString(p.payoutAddress, 120) || 'UPI',
        status,
        requestDate: clampString(p.requestDate, 64) || new Date().toISOString(),
        transactionRef: clampString(p.transactionRef, 128),
      });
      syncedPayouts++;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, payoutPath);
    }
  }

  for (const g of dataset.giftCards || []) {
    const safeId = sanitizeFirestoreId(g.id);
    const safeCatalogId = sanitizeFirestoreId(g.catalogId || 'gift');
    const safeUserId = sanitizeFirestoreId(g.userId);
    const gcPath = `gift_card_redemptions/${safeId}`;
    const coinsSpent = Number(g.coinsSpent);
    if (!Number.isFinite(coinsSpent) || coinsSpent < 10) continue;
    const status =
      g.status === 'fulfilled' || g.status === 'rejected' ? g.status : 'pending_fulfillment';
    try {
      await setDoc(doc(db, 'gift_card_redemptions', safeId), {
        id: safeId,
        catalogId: safeCatalogId,
        brand: clampString(g.brand, 64),
        title: clampString(g.title, 120),
        denomination: nonNegativeNumber(g.denomination, 0),
        coinsSpent,
        userId: safeUserId,
        authUid: fbUser.uid,
        userName: clampString(g.userName, 120),
        status,
        voucherCode: clampString(g.voucherCode, 128),
        voucherPin: clampString(g.voucherPin, 64),
        rejectionReason: clampString(g.rejectionReason, 200),
        requestedAt: clampString(g.requestedAt, 64) || new Date().toISOString(),
        fulfilledAt: clampString(g.fulfilledAt, 64),
      });
      syncedGiftCards++;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, gcPath);
    }
  }

  return { syncedUsers, syncedPayouts, syncedGiftCards };
}
