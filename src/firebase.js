// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
 import {
   initializeAuth,
   getAuth,
   indexedDBLocalPersistence,
   browserLocalPersistence,
   browserSessionPersistence,
   browserPopupRedirectResolver,   // 👈 agrega esto
   GoogleAuthProvider,              // 👈 AÑADIR
 } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, // p.ej. queesia-e0de5.firebaseapp.com
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Evita doble init en hot-reload
let auth;
try {
  auth = initializeAuth(app, {
    persistence: [
      indexedDBLocalPersistence,     // prioridad
      browserLocalPersistence,
      browserSessionPersistence,
    ],
   // Necesario para signInWithPopup / signInWithRedirect en web
   popupRedirectResolver: browserPopupRedirectResolver,    
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

// 👇 Proveedor de Google (con prompt para elegir cuenta)
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, storage, googleProvider };
