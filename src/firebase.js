// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
  import {
   initializeAuth,
   getAuth,
   indexedDBLocalPersistence,
   browserLocalPersistence,
   browserSessionPersistence,
   browserPopupRedirectResolver,
   GoogleAuthProvider,
 } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  //authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // p.ej. queesia-e0de5.firebaseapp.com
 // Mismo dominio para evitar third-party en móviles
  authDomain: "expertos.queesia.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Evita doble init en hot-reload (singleton con bandera global)
let auth;
if (!globalThis.__QUEESIA_AUTH__) {
  // ─────────────────────────────────────────────────────────────
  // Selección de persistencia para pruebas A/B
  // Prioridad: ?persist=  → VITE_AUTH_PERSISTENCE → por defecto (triple)
  // Valores soportados:
  //   "indexeddb" | "local" | "session" | "triple"
  // Uso en URL: https://expertos.queesia.com/login?persist=indexeddb
  // ENV: VITE_AUTH_PERSISTENCE=indexeddb|local|session|triple
  // ─────────────────────────────────────────────────────────────
  let persistPref = "triple";
  try {
    const u = new URL(location.href);
    const q = (u.searchParams.get("persist") || "").toLowerCase();
    if (q) persistPref = q;
  } catch {}
  if (import.meta?.env?.VITE_AUTH_PERSISTENCE) {
    persistPref = String(import.meta.env.VITE_AUTH_PERSISTENCE).toLowerCase();
  }

  let persistence;
  switch (persistPref) {
    case "indexeddb":
      persistence = indexedDBLocalPersistence;
      break;
    case "local":
      persistence = browserLocalPersistence;
      break;
    case "session":
      persistence = browserSessionPersistence;
      break;
    default:
      // "triple" (comportamiento original)
      persistence = [
       indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence,
      ];
  }

  console.info("[firebase] persistence:", persistPref);

  auth = initializeAuth(app, {
    persistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });

  globalThis.__QUEESIA_AUTH__ = auth;
} else {
  auth = globalThis.__QUEESIA_AUTH__;
  // (opcional) refuerza persistencia si vienes de getAuth en algún build anterior
  // Nota: cambiar persistencia después de inicializar no surte efecto;
  // para comparar variantes, recarga dura la app con el query param.
}

const db = getFirestore(app);
const storage = getStorage(app);

// 👇 Proveedor de Google (con prompt para elegir cuenta)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, storage, googleProvider };

// DEBUG ONLY (quitar después)
if (typeof window !== "undefined") {
  
}
