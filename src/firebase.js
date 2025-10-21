// src/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  getRedirectResult,
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

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔐 Persistencia entre recargas/redirect (clave para móvil)
setPersistence(auth, browserLocalPersistence).catch(console.error);

if (import.meta.env.DEV) {
  // @ts-ignore
  window.__auth = auth;
  console.log("[firebase] loaded");
}


// 🔁 Resolver el redirect una sola vez (opcional)
export async function resolveRedirectOnce() {
  try {
    const res = await getRedirectResult(auth);
    return res?.user ?? null;
  } catch (e) {
    console.warn('getRedirectResult error', e);
    return null;
  }
}
