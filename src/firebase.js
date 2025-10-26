// src/firebase.js
import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";


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
const auth = getAuth(app);
const db = getFirestore(app);

// Persistencia estable (móvil/desktop)
setPersistence(auth, browserLocalPersistence);

const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };