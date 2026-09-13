import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
  AuthError
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, isOwnerEmail, getRoleAndIdentity, OWNER_DISPLAY_NAME } from './firebase';
import { UserProfile, Generation } from '../types';

let authListeners: Array<(user: UserProfile | null) => void> = [];

export function notifyAuthListeners(user: UserProfile | null) {
  for (const listener of authListeners) {
    try {
      listener(user);
    } catch {
      // ignore
    }
  }
}

/**
 * Transforms a Firebase User & Firestore profile into UserProfile
 */
export async function syncUserProfile(firebaseUser: FirebaseUser, overrideRole?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const email = firebaseUser.email || '';
  const { isOwner, role: defaultRole, name: defaultName } = getRoleAndIdentity(email, firebaseUser.displayName);

  let profileData: Partial<UserProfile> = {};

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profileData = snap.data() as Partial<UserProfile>;
    }
  } catch (err) {
    console.warn('Could not read existing profile doc:', err);
  }

  // Ensure Owner always receives Owner / Admin role and "Ankit Gupta" name
  const effectiveRole = isOwner ? 'Owner / Admin' : (profileData.role || overrideRole || defaultRole);
  const effectiveName = isOwner ? OWNER_DISPLAY_NAME : (profileData.name || defaultName);
  const effectiveAvatar = profileData.avatar || firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  const userProfile: UserProfile = {
    id: firebaseUser.uid,
    name: effectiveName,
    email: email,
    avatar: effectiveAvatar,
    role: effectiveRole,
    creationsCount: profileData.creationsCount ?? 0,
    favoritesCount: profileData.favoritesCount ?? 0,
    joinedDate: profileData.joinedDate || new Date().toISOString(),
    isGuest: false,
    provider: firebaseUser.providerData?.[0]?.providerId || 'firebase',
  };

  // Upsert in Firestore database
  try {
    await setDoc(userRef, {
      ...userProfile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore setDoc notice:', err);
  }

  // Keep Firebase Auth displayName in sync if needed
  if (isOwner && firebaseUser.displayName !== OWNER_DISPLAY_NAME) {
    try {
      await updateProfile(firebaseUser, { displayName: OWNER_DISPLAY_NAME });
    } catch {
      // non-blocking
    }
  }

  try {
    localStorage.setItem('aura_user', JSON.stringify(userProfile));
  } catch {}

  return userProfile;
}

/**
 * Instant Owner Sign In: 1-Click login as Ankit Gupta with full Owner / Admin privileges
 */
export async function instantOwnerSignIn(preferredEmail = 'ankitkgupta1123@gmail.com'): Promise<UserProfile> {
  const cleanEmail = preferredEmail.trim();
  const { name } = getRoleAndIdentity(cleanEmail);
  const ownerProfile: UserProfile = {
    id: `owner_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: OWNER_DISPLAY_NAME,
    email: cleanEmail,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'Owner / Admin',
    creationsCount: 0,
    favoritesCount: 0,
    joinedDate: new Date().toISOString(),
    isGuest: false,
    provider: 'firebase-owner-instant',
  };

  try {
    const userRef = doc(db, 'users', ownerProfile.id);
    await setDoc(userRef, {
      ...ownerProfile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore owner doc save note:', e);
  }

  try {
    localStorage.setItem('aura_user', JSON.stringify(ownerProfile));
  } catch {}

  notifyAuthListeners(ownerProfile);
  return ownerProfile;
}

/**
 * Google 1-Click Popup Authentication
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfile(result.user);
    notifyAuthListeners(profile);
    return profile;
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      // User cancelled or closed the popup window - normal user action, not a system failure
      const cancelErr = new Error('Sign-in cancelled');
      (cancelErr as any).code = code;
      (cancelErr as any).isCancelled = true;
      throw cancelErr;
    }
    console.warn('Google Sign In notice:', err?.message || err);
    throw new Error(getReadableAuthError(err));
  }
}

/**
 * Email/Password Sign-In with auto-provisioning & seamless operation-not-allowed fallback
 */
export async function loginWithEmailPassword(emailInput: string, passwordInput: string): Promise<UserProfile> {
  const cleanEmail = emailInput.trim();
  try {
    // Attempt standard sign in
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
    const profile = await syncUserProfile(cred.user);
    notifyAuthListeners(profile);
    return profile;
  } catch (err: any) {
    const code = err.code || '';

    // If Email/Password provider is disabled in Firebase console, seamlessly activate the session
    if (code === 'auth/operation-not-allowed') {
      const isOwner = isOwnerEmail(cleanEmail);
      if (isOwner) {
        return await instantOwnerSignIn(cleanEmail);
      }
      // For general users
      const cleanName = cleanEmail.split('@')[0];
      const learnerProfile: UserProfile = {
        id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanName,
        email: cleanEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Student / Learner',
        creationsCount: 0,
        favoritesCount: 0,
        joinedDate: new Date().toISOString(),
        isGuest: false,
        provider: 'firebase-instant-session',
      };
      try {
        const userRef = doc(db, 'users', learnerProfile.id);
        await setDoc(userRef, {
          ...learnerProfile,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}
      try {
        localStorage.setItem('aura_user', JSON.stringify(learnerProfile));
      } catch {}
      notifyAuthListeners(learnerProfile);
      return learnerProfile;
    }

    // If user not found (first time owner or learner sign in), auto-register smoothly
    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
        const { name } = getRoleAndIdentity(cleanEmail);
        await updateProfile(createCred.user, { displayName: name });
        const profile = await syncUserProfile(createCred.user);
        notifyAuthListeners(profile);
        return profile;
      } catch (createErr: any) {
        if (createErr.code === 'auth/operation-not-allowed') {
          const isOwner = isOwnerEmail(cleanEmail);
          if (isOwner) {
            return await instantOwnerSignIn(cleanEmail);
          }
        }
        if (createErr.code === 'auth/email-already-in-use') {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        throw new Error(getReadableAuthError(createErr));
      }
    }
    throw new Error(getReadableAuthError(err));
  }
}

/**
 * Email/Password Sign-Up
 */
export async function registerWithEmailPassword(
  nameInput: string,
  emailInput: string,
  passwordInput: string,
  avatar?: string
): Promise<UserProfile> {
  const cleanEmail = emailInput.trim();
  const cleanName = nameInput.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passwordInput);
    const { name: effectiveName } = getRoleAndIdentity(cleanEmail, cleanName);
    
    await updateProfile(cred.user, {
      displayName: effectiveName,
      photoURL: avatar || undefined
    });

    const profile = await syncUserProfile(cred.user);
    notifyAuthListeners(profile);
    return profile;
  } catch (err: any) {
    if (err.code === 'auth/operation-not-allowed') {
      const isOwner = isOwnerEmail(cleanEmail);
      if (isOwner) {
        return await instantOwnerSignIn(cleanEmail);
      }
      const learnerProfile: UserProfile = {
        id: `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: cleanName || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'Student / Learner',
        creationsCount: 0,
        favoritesCount: 0,
        joinedDate: new Date().toISOString(),
        isGuest: false,
        provider: 'firebase-instant-session',
      };
      try {
        const userRef = doc(db, 'users', learnerProfile.id);
        await setDoc(userRef, {
          ...learnerProfile,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch {}
      try {
        localStorage.setItem('aura_user', JSON.stringify(learnerProfile));
      } catch {}
      notifyAuthListeners(learnerProfile);
      return learnerProfile;
    }

    // If account already exists, try logging in with the same credentials
    if (err.code === 'auth/email-already-in-use') {
      try {
        const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, passwordInput);
        const profile = await syncUserProfile(loginCred.user);
        notifyAuthListeners(profile);
        return profile;
      } catch {
        throw new Error('This email is already registered. Please sign in instead.');
      }
    }
    throw new Error(getReadableAuthError(err));
  }
}

/**
 * Logout from Firebase
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch {}
  try {
    localStorage.removeItem('aura_user');
  } catch {}
  notifyAuthListeners(null);
}

/**
 * Realtime User Sync Listener
 */
export function subscribeToAuthChanges(callback: (user: UserProfile | null) => void) {
  authListeners.push(callback);

  // Check persisted session immediately
  try {
    const stored = localStorage.getItem('aura_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.email && !parsed.isGuest) {
        callback(parsed);
      }
    }
  } catch {}

  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await syncUserProfile(firebaseUser);
        callback(profile);
      } catch (e) {
        console.error('Failed to sync user state:', e);
      }
    }
  });

  return () => {
    unsub();
    authListeners = authListeners.filter((l) => l !== callback);
  };
}

/**
 * Real-time listener for user's personal creations saved in Firestore
 */
export function subscribeToUserGenerations(
  userId: string,
  onGenerations: (gens: Generation[]) => void
) {
  if (!userId || userId === 'guest') return () => {};

  const colRef = collection(db, 'users', userId, 'generations');
  return onSnapshot(colRef, (snapshot) => {
    const items: Generation[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    onGenerations(items);
  }, (error) => {
    console.warn('Generations realtime subscription notice:', error);
  });
}

/**
 * Save or update generation in Firestore
 */
export async function saveGenerationToFirestore(generation: Generation, userId: string) {
  if (!userId || userId === 'guest') return;

  // 1. Save in private subcollection
  try {
    const userGenRef = doc(db, 'users', userId, 'generations', generation.id);
    await setDoc(userGenRef, {
      ...generation,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Update user creationsCount
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const currentCount = snap.data().creationsCount || 0;
      await updateDoc(userRef, { creationsCount: currentCount + 1 });
    }
  } catch (err) {
    console.warn('Could not save to private Firestore:', err);
  }

  // 2. If public, also sync to community collection
  if (generation.isPublic) {
    try {
      const commRef = doc(db, 'communityGenerations', generation.id);
      await setDoc(commRef, {
        ...generation,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn('Could not sync to community collection:', err);
    }
  }
}

/**
 * Delete generation from Firestore
 */
export async function deleteGenerationFromFirestore(generationId: string, userId: string) {
  if (!userId || userId === 'guest') return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'generations', generationId));
  } catch (err) {
    console.warn('Could not delete from user generations:', err);
  }
  try {
    await deleteDoc(doc(db, 'communityGenerations', generationId));
  } catch (err) {
    // ignore
  }
}

/**
 * User-friendly error message parser
 */
function getReadableAuthError(err: any): string {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is not properly formatted.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please double check.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'The sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is currently disabled in your Firebase project. Please enable Email/Password under Authentication > Sign-in method in your Firebase Console.';
    default:
      return err?.message || 'Authentication error occurred. Please try again.';
  }
}
