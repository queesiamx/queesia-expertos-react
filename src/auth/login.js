// src/auth/login.js
import { auth, googleProvider } from "@/firebase";
 import {
   signInWithPopup,
   signInWithRedirect,
   setPersistence,
   browserLocalPersistence,
 } from "firebase/auth";

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

 /** Un solo entrypoint de login (popup desktop, redirect móvil) */
 export async function loginWithGoogle(role = "usuario") {
   // 1) Asegura persistencia para que la sesión sobreviva al redirect
   try { await setPersistence(auth, browserLocalPersistence); } catch {}

   // 2) Guarda intención de rol por si Firestore tarda (fallback)
   try { localStorage.setItem("pendingRole", String(role).toLowerCase()); } catch {}

   // 3) Ejecuta proveedor según contexto
   if (isMobile) {
     return signInWithRedirect(auth, googleProvider);
   }
   return signInWithPopup(auth, googleProvider);
 }
