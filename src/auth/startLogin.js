// src/auth/startLogin.js
import { auth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from "firebase/auth";

function setPendingRole(role, intent) {
  const r = String(role || "usuario").toLowerCase();
  try { sessionStorage.setItem("pendingRole", r); sessionStorage.setItem("loginIntent", intent || "login"); } catch {}
  try { localStorage.setItem("pendingRole", r); localStorage.setItem("loginIntent", intent || "login"); } catch {}
}

function isMobileLike() {
  const ua = navigator.userAgent || "";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || window.innerWidth < 640;
}

export async function startLogin(selectedRole = "usuario", intent = "login") {
  const provider = new GoogleAuthProvider();
  setPendingRole(selectedRole, intent);

  // 👉 En móvil (o viewport pequeño): redirect directo y listo
  if (isMobileLike()) {
    await signInWithRedirect(auth, provider);
    return null;
  }

  // 👉 Desktop: intenta popup y si lo bloquean, redirect
  try {
    const res = await signInWithPopup(auth, provider);
    return res;
  } catch {
    await signInWithRedirect(auth, provider);
    return null;
  }
}
// al final del archivo, después del export
if (import.meta.env.DEV) window.__startLogin = startLogin;
