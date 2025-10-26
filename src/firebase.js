// src/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqOk-lc5Ar-qc6fmbkJ19gYwDNsnoMmOk",
  authDomain: "queesia-e0de5.firebaseapp.com",
  projectId: "queesia-e0de5",
  storageBucket: "queesia-e0de5.appspot.com",
  messagingSenderId: "81907629864",
  appId: "1:81907629864:web:5a6a078e4de031cf3e1a1d",
  measurementId: "G-MPCKFKN50L"
};

// App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Google provider (con prompt para elegir cuenta)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// ✅ Persistencia LOCAL antes de cualquier login (crítico para móvil/redirect)
// (IIFE porque no usamos top-level await)
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    if (import.meta.env.DEV) console.log('[firebase] persistence: local');
  } catch (e) {
    console.warn('[firebase] setPersistence error', e);
  }
})();

if (import.meta.env.DEV) {
  // @ts-ignore
  window.__auth = auth;
  console.log('[firebase] loaded');
}

// ⛔️ Importante: NO exponemos aquí ninguna resolución de redirect.
// getRedirectResult se manejará únicamente dentro de AuthRedirectGate.
