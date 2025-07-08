// src/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBqOk-lc5Ar-qc6fmbkJ19gYwDNsnoMmOk",
  authDomain: "queesia-e0de5.firebaseapp.com",
  projectId: "queesia-e0de5",
  storageBucket: "queesia-e0de5.appspot.com",
  messagingSenderId: "81907629864",
  appId: "1:81907629864:web:5a6a078e4de031cf3e1a1d",
  measurementId: "G-MPCKFKN50L"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ EXPORTACIONES CORRECTAS
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, storage, googleProvider };
