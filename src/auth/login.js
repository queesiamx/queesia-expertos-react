// src/auth/login.js
const DEBUG_AUTH = import.meta?.env?.DEV === true;

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
  console.log("[login] UA:", typeof navigator !== "undefined" ? navigator.userAgent : "no-navigator");
  console.log("[login] isMobile?", isMobile, "origin:", typeof window !== "undefined" ? window.location.origin : "no-window");
  try {
    // 1) Persistencia para que sobreviva al redirect
    await setPersistence(auth, browserLocalPersistence);
    // 2) Intención de rol (fallback si Firestore tarda)
    try { localStorage.setItem("pendingRole", String(role).toLowerCase()); } catch {}
    console.log("[login] persistence OK, pendingRole:", role);
    // 3) Ejecuta proveedor según contexto
    if (isMobile) {
      console.log("[login] usando signInWithRedirect (móvil)");
      return await signInWithRedirect(auth, googleProvider);
    } else {
      console.log("[login] usando signInWithPopup (desktop)");
      return await signInWithPopup(auth, googleProvider);
    }
  } catch (e) {
    console.error("[login] ERROR:", e?.code, e?.message, e);
    if (DEBUG_AUTH) {
      alert(`[login] Error: ${e?.code || ""} ${e?.message || ""}`.trim());
    }
    throw e; // NO cambia el flujo del resto de la app
  }
 }
