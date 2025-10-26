// src/auth/logout.js
import { auth } from "@/firebase";
import { signOut } from "firebase/auth";
import { clearRoleCache } from "@/auth/roleCache";

function clearPending() {
  try { localStorage.removeItem("pendingRole"); } catch {}
  try { sessionStorage.removeItem("pendingRole"); } catch {}
  try { localStorage.removeItem("loginIntent"); } catch {}
  try { sessionStorage.removeItem("loginIntent"); } catch {}
}

function clearFirebaseRedirectKeys() {
  try {
    const stale = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i) || "";
      if (k.toLowerCase().includes("firebase:redirect")) stale.push(k);
    }
    stale.forEach((k) => sessionStorage.removeItem(k));
  } catch {}
}

export async function handleLogout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("[logout] signOut error", e);
  } finally {
      // 🔹 clave para que en móvil/responsive no “se pegue” el rol anterior
    clearRoleCache();
    clearPending();
    clearFirebaseRedirectKeys();
    // Redirige a home o login
    window.location.assign("/");
  }
}
