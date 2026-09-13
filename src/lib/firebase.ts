import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth
export const auth = getAuth(firebaseApp);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cloud Firestore Database with specific provisioned databaseId
export const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');

// Owner / Admin Emails list
export const OWNER_EMAILS = [
  'kajugupta1119@gmail.com',
  'ankitkgupta1123@gmail.com'
];

export const OWNER_DISPLAY_NAME = 'Ankit Gupta';

/**
 * Checks if an email belongs to the Owner / Admin
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.some((ownerEmail) => ownerEmail.toLowerCase() === email.trim().toLowerCase());
}

/**
 * Determines RBAC role and default display name based on email
 */
export function getRoleAndIdentity(email?: string | null, originalName?: string | null) {
  const isOwner = isOwnerEmail(email);
  return {
    isOwner,
    role: isOwner ? 'Owner / Admin' : 'Student / Learner',
    name: isOwner ? OWNER_DISPLAY_NAME : (originalName?.trim() || email?.split('@')[0] || 'Learner Creator')
  };
}
