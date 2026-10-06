import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

const STORAGE_CONFIG_KEY = 'quicknotes_firebase_config';

// Load config from environment or local storage
export function getSavedFirebaseConfig() {
  try {
    const fromStorage = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (fromStorage) {
      return JSON.parse(fromStorage);
    }
  } catch (e) {
    console.error('Failed reading Firebase config from storage:', e);
  }

  // Check Vite environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}

let firebaseApp = null;
let authInstance = null;
let firestoreInstance = null;
const googleProvider = new GoogleAuthProvider();

export function getFirebaseServices(config = null) {
  const activeConfig = config || getSavedFirebaseConfig();

  if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId) {
    return { app: null, auth: null, db: null, isConfigured: false };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(activeConfig);
    } else {
      firebaseApp = getApp();
    }
    authInstance = getAuth(firebaseApp);
    firestoreInstance = getFirestore(firebaseApp);

    return {
      app: firebaseApp,
      auth: authInstance,
      db: firestoreInstance,
      isConfigured: true
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { app: null, auth: null, db: null, isConfigured: false, error: err.message };
  }
}

// Authentication Helpers
export async function signInWithGoogle() {
  const { auth, isConfigured } = getFirebaseServices();
  if (!isConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please enter your Firebase settings.');
  }
  return await signInWithPopup(auth, googleProvider);
}

export async function logOut() {
  const { auth } = getFirebaseServices();
  if (auth) {
    await signOut(auth);
  }
}

export {
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
};
