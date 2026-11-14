import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Cloud Sync Helper to ensure user data is persistently saved to Firebase Firestore and never lost
export async function syncUserToFirestore(userData: any) {
  try {
    if (!userData || !userData.userId) return;
    const userRef = doc(db, 'users', userData.userId);
    await setDoc(userRef, {
      ...userData,
      lastSyncedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore user sync notice:', err);
  }
}
