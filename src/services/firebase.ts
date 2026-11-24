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

function safeAvatarForFirestore(avatar: unknown): string {
  if (typeof avatar !== 'string') return '';
  const trimmed = avatar.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.length > 490) return '';
  return trimmed;
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

function buildValidatedUserDoc(userData: any, authUid: string) {
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

function buildCloudRegistrationDoc(userData: any, hostOverride?: string) {
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
    role: 'member' as const,
    createdAt: createdAt.length >= 4 ? createdAt : nowIso,
    updatedAt: nowIso,
  };
}

export async function pushRegistrationToCloudBridge(userData: any, hostOverride?: string): Promise<boolean> {
  if (!userData || (!userData.userId && !userData.id)) return false;
  const payload = buildCloudRegistrationDoc(userData, hostOverride);
  try {
    await setDoc(doc(db, 'cloud_registrations', payload.userId), payload);
    return true;
  } catch {
    return false;
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
    merged.set(key, prev ? { ...prev, ...raw } : raw);
  };
  try {
    const cloudSnap = await getDocs(collection(db, 'cloud_registrations'));
    cloudSnap.docs.forEach(d => addRecord(d.data()));
  } catch (err) {
    console.warn('Firestore cloud_registrations read note:', err);
  }
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.docs.forEach(d => addRecord(d.data()));
  } catch (err) {
    console.warn('Firestore users read note:', err);
  }
  return Array.from(merged.values());
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

  // Enforce strict rule: client self-creates only start pending with 0 coins/balance unless admin
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
  try {
    const userRef = doc(db, 'users', safeUserId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const existingData = snap.data();
      if (isOwnerAdmin) {
        const payload = buildValidatedUserDoc(userData, existingData?.authUid || fbUser.uid);
        await setDoc(userRef, payload, { merge: false });
      } else if (existingData?.authUid === fbUser.uid) {
        const previousUsername = clampString(
          String(existingData.username || '').replace(/^@+/, '').toLowerCase(),
          24
        );
        // Member can update strictly allowed profile fields without altering balance/coins/status
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
      const payload = buildValidatedUserDoc(userData, fbUser.uid);
      await setDoc(userRef, payload);
    } else {
      // Pending initial self-registration record matches non-admin create rule
      const payload = buildValidatedUserDoc(
        {
          ...userData,
          status: 'pending',
          role: 'member',
          coins: 0,
          balance: 0,
        },
        fbUser.uid
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
      const validated = buildValidatedUserDoc(u, fbUser.uid);
      await setDoc(doc(db, 'users', safeUserId), validated);
      await setDoc(doc(db, 'public_profiles', safeUserId), buildPublicProfileDoc(u, fbUser.uid));
      await setDoc(doc(db, 'cloud_registrations', safeUserId), buildCloudRegistrationDoc(u));
      syncedUsers++;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
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
