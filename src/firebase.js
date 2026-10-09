import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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

// Pre-configured Firebase project settings for notes-app-73658
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA5qxDJY6FR68YXLsoVQBrq2UVcOeXKZF0',
  authDomain: 'notes-app-73658.firebaseapp.com',
  projectId: 'notes-app-73658',
  storageBucket: 'notes-app-73658.firebasestorage.app',
  messagingSenderId: '41155597653',
  appId: '1:41155597653:web:ab1a22c1657b8340598bdc',
  measurementId: 'G-GE41MV7M9W'
};

// Load config from localStorage, environment variables, or pre-configured defaults
export function getSavedFirebaseConfig() {
  // 1. Check local storage if user customized it
  try {
    const fromStorage = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (fromStorage) {
      const parsed = JSON.parse(fromStorage);
      // Purge old expired key if it was stored locally
      if (parsed && parsed.apiKey && parsed.apiKey !== 'AIzaSyAeiPI6DANPd6BiwclB2esUDw0EXeJMTrs') {
        return {
          ...DEFAULT_FIREBASE_CONFIG,
          ...parsed
        };
      } else {
        localStorage.removeItem(STORAGE_CONFIG_KEY);
      }
    }
  } catch (e) {
    console.error('Failed reading Firebase config from storage:', e);
  }

  // 2. Check Vite environment variables
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      ...DEFAULT_FIREBASE_CONFIG,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId
    };
  }

  // 3. Fallback to default pre-configured project
  return DEFAULT_FIREBASE_CONFIG;
}

export function parseFirebaseConfigInput(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Please enter an API key or configuration.');
  }
  const trimmed = input.trim();

  // Raw API key
  if (/^AIza[0-9A-Za-z-_]{30,}$/.test(trimmed)) {
    return {
      ...DEFAULT_FIREBASE_CONFIG,
      apiKey: trimmed
    };
  }

  // Regex extraction from code snippet
  const apiKeyMatch = trimmed.match(/apiKey\s*:\s*["'`]?([A-Za-z0-9_-]+)["'`]?/);
  if (apiKeyMatch && apiKeyMatch[1]) {
    const authDomainMatch = trimmed.match(/authDomain\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const projectIdMatch = trimmed.match(/projectId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const storageBucketMatch = trimmed.match(/storageBucket\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const messagingSenderIdMatch = trimmed.match(/messagingSenderId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const appIdMatch = trimmed.match(/appId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);
    const measurementIdMatch = trimmed.match(/measurementId\s*:\s*["'`]?([^"'`,\s]+)["'`]?/);

    return {
      ...DEFAULT_FIREBASE_CONFIG,
      apiKey: apiKeyMatch[1],
      authDomain: authDomainMatch?.[1] || DEFAULT_FIREBASE_CONFIG.authDomain,
      projectId: projectIdMatch?.[1] || DEFAULT_FIREBASE_CONFIG.projectId,
      storageBucket: storageBucketMatch?.[1] || DEFAULT_FIREBASE_CONFIG.storageBucket,
      messagingSenderId: messagingSenderIdMatch?.[1] || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
      appId: appIdMatch?.[1] || DEFAULT_FIREBASE_CONFIG.appId,
      measurementId: measurementIdMatch?.[1] || DEFAULT_FIREBASE_CONFIG.measurementId
    };
  }

  // JSON parse fallback
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
      ...DEFAULT_FIREBASE_CONFIG,
      ...parsed
    };
  }

  throw new Error('Could not parse configuration.');
}

export async function saveFirebaseConfig(config) {
  if (getApps().length) {
    try {
      await deleteApp(getApp());
    } catch (e) {
      console.warn(e);
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
      console.warn(e);
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
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export function getFirebaseServices(config = null) {
  const activeConfig = config || getSavedFirebaseConfig();

  if (!activeConfig || !activeConfig.apiKey || !activeConfig.projectId) {
    return { app: null, auth: null, db: null, isConfigured: false, config: activeConfig };
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
      config: activeConfig
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return { app: null, auth: null, db: null, isConfigured: false, error: err.message, config: activeConfig };
  }
}

export async function signInWithGoogle() {
  const { auth, isConfigured } = getFirebaseServices();
  if (!isConfigured || !auth) {
    throw new Error('Firebase is not configured yet.');
  }
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked') {
      console.warn('Popup was blocked by browser. Attempting redirect sign-in...');
      return await signInWithRedirect(auth, googleProvider);
    }
    throw err;
  }
}

export async function checkRedirectResult() {
  const { auth, isConfigured } = getFirebaseServices();
  if (isConfigured && auth) {
    try {
      return await getRedirectResult(auth);
    } catch (err) {
      console.warn('Redirect sign-in result error:', err);
    }
  }
  return null;
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
