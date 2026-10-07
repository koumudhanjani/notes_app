import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
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

// Pre-configured public project parameters for notes-app-73658
// (These identifiers are non-sensitive and identify the Firebase app)
export const DEFAULT_PROJECT_CONFIG = {
  authDomain: 'notes-app-73658.firebaseapp.com',
  projectId: 'notes-app-73658',
  storageBucket: 'notes-app-73658.firebasestorage.app',
  messagingSenderId: '41155597653',
  appId: '1:41155597653:web:ab1a22c1657b8340598bdc',
  measurementId: 'G-GE41MV7M9W'
};

// Check if key is the old one that was invalidated by Google upon public exposure
export function isApiKeyExpired(key) {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed.endsWith('JMTrs');
}

// Robust parser that supports:
// 1. Raw API key string (e.g. AIzaSy...)
// 2. Full JS snippet from Firebase Console (including comments and const firebaseConfig = {...})
// 3. Raw JSON object
export function parseFirebaseConfigInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Please enter an API key or Firebase configuration.');
  }

  const trimmed = input.trim();

  // 1. Raw API key (e.g. AIzaSy...)
  if (/^AIza[0-9A-Za-z-_]{30,}$/.test(trimmed)) {
    return {
      ...DEFAULT_PROJECT_CONFIG,
      apiKey: trimmed
    };
  }

  // 2. Extract values via regex to handle JS code, comments, and unquoted keys
  const apiKeyMatch = trimmed.match(/apiKey\s*:\s*["'`]?([A-Za-z0-9_-]+)["'`]?/);
  if (apiKeyMatch && apiKeyMatch[1]) {
    const authDomainMatch = trimmed.match(/authDomain\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const projectIdMatch = trimmed.match(/projectId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const storageBucketMatch = trimmed.match(/storageBucket\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const messagingSenderIdMatch = trimmed.match(/messagingSenderId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const appIdMatch = trimmed.match(/appId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const measurementIdMatch = trimmed.match(/measurementId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);

    return {
      ...DEFAULT_PROJECT_CONFIG,
      apiKey: apiKeyMatch[1],
      authDomain: authDomainMatch?.[1] || DEFAULT_PROJECT_CONFIG.authDomain,
      projectId: projectIdMatch?.[1] || DEFAULT_PROJECT_CONFIG.projectId,
      storageBucket: storageBucketMatch?.[1] || DEFAULT_PROJECT_CONFIG.storageBucket,
      messagingSenderId: messagingSenderIdMatch?.[1] || DEFAULT_PROJECT_CONFIG.messagingSenderId,
      appId: appIdMatch?.[1] || DEFAULT_PROJECT_CONFIG.appId,
      measurementId: measurementIdMatch?.[1] || DEFAULT_PROJECT_CONFIG.measurementId
    };
  }

  // 3. JSON parse fallback (strip single-line and multi-line comments)
  let cleaned = trimmed
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .trim();

  if (cleaned.startsWith('const firebaseConfig =')) {
    cleaned = cleaned.replace(/^const\s+firebaseConfig\s*=\s*/, '');
  }
  cleaned = cleaned.replace(/;$/, '').trim();

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const jsonLike = cleaned
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
      .replace(/'/g, '"')
      .replace(/,\s*([}\]])/g, '$1');
    parsed = JSON.parse(jsonLike);
  }

  if (parsed && typeof parsed === 'object') {
    if (!parsed.apiKey) {
      throw new Error('Configuration must include an "apiKey".');
    }
    return {
      ...DEFAULT_PROJECT_CONFIG,
      ...parsed
    };
  }

  throw new Error('Could not parse configuration. Please paste your API key or Firebase config object.');
}

// Load config from local storage or Vite environment
export function getSavedFirebaseConfig() {
  // 1. Check local storage first (private to user browser, not in Git)
  try {
    const fromStorage = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (fromStorage) {
      const parsed = JSON.parse(fromStorage);
      if (parsed && parsed.apiKey) {
        return {
          ...DEFAULT_PROJECT_CONFIG,
          ...parsed
        };
      }
    }
  } catch (e) {
    console.error('Failed reading Firebase config from storage:', e);
  }

  // 2. Check Vite environment variables (.env.local or GitHub Actions secrets)
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envApiKey && envApiKey.trim()) {
    return {
      ...DEFAULT_PROJECT_CONFIG,
      apiKey: envApiKey.trim(),
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_PROJECT_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_PROJECT_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_PROJECT_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_PROJECT_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_PROJECT_CONFIG.measurementId
    };
  }

  return null;
}

export async function saveFirebaseConfig(config) {
  if (getApps().length) {
    try {
      await deleteApp(getApp());
    } catch (e) {
      console.warn('Error resetting previous Firebase app:', e);
    }
  }
  firebaseApp = null;
  authInstance = null;
  firestoreInstance = null;
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
}

export async function clearFirebaseConfig() {
  if (getApps().length) {
    try {
      await deleteApp(getApp());
    } catch (e) {
      console.warn('Error deleting Firebase app:', e);
    }
  }
  firebaseApp = null;
  authInstance = null;
  firestoreInstance = null;
  localStorage.removeItem(STORAGE_CONFIG_KEY);
}

let firebaseApp = null;
let authInstance = null;
let firestoreInstance = null;
const googleProvider = new GoogleAuthProvider();

export function getFirebaseServices(config = null) {
  const activeConfig = config || getSavedFirebaseConfig();
  const isExpired = isApiKeyExpired(activeConfig?.apiKey);

  if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId || isExpired) {
    return {
      app: null,
      auth: null,
      db: null,
      isConfigured: false,
      isExpired,
      config: activeConfig
    };
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
      isConfigured: true,
      isExpired: false,
      config: activeConfig
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return {
      app: null,
      auth: null,
      db: null,
      isConfigured: false,
      isExpired: false,
      error: err.message,
      config: activeConfig
    };
  }
}

// Authentication Helpers
export async function signInWithGoogle() {
  const { auth, isConfigured } = getFirebaseServices();
  if (!isConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Please enter your Firebase API key.');
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
