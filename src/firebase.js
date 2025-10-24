// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBqOk-lc5Ar-qc6fmbkJ19gYwDNsnoMmOk",
  authDomain: "queesia-e0de5.firebaseapp.com",
  projectId: "queesia-e0de5",
  storageBucket: "queesia-e0de5.appspot.com",
  messagingSenderId: "81907629864",
  appId: "1:81907629864:web:5a6a078e4de031cf3e1a1d",
  measurementId: "G-MPCKFKN50L",
};

// App singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 🔐 Persistencia robusta: intenta IndexedDB y, si no, cae a LocalStorage
(async () => {
  try {
    await setPersistence(auth, indexedDBLocalPersistence);
    // console.info("[firebase] persistence: indexedDB");
  } catch (e1) {
    console.warn(
      "[firebase] indexedDB persistence failed, falling back to browserLocal:",
      e1?.message || e1
    );
    try {
      await setPersistence(auth, browserLocalPersistence);
      // console.info("[firebase] persistence: browserLocal");
    } catch (e2) {
      console.warn(
        "[firebase] browserLocal persistence also failed:",
        e2?.message || e2
      );
      // No más fallback; Auth igual funcionará, pero sin persistir sesión.
    }
  }
})();

if (import.meta.env.DEV) {
  // @ts-ignore
  window.__auth = auth;
  console.log("[firebase] loaded @", import.meta.env.VITE_SITE_URL);
}

// Nota: la resolución del redirect vive en src/auth/resolveRedirectOnce.js (si aplica).
