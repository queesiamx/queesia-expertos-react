// src/auth/startLogin.js
import { auth, googleProvider } from "@/firebase";
import { clearRoleCache } from "@/auth/roleCache";
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

let logging = false;

// (opcional) puedes borrar por completo isMobile si usas siempre redirect

export async function startLogin(role = "usuario") {
  if (logging) return;           // evita doble click
  logging = true;

  try {
    // 🔹 Limpia cualquier rol cacheado de una sesión previa (clave del bug en móvil)
    clearRoleCache();
    // guarda intención/rol antes de salir
    try { localStorage.setItem("pendingRole", role); } catch {}
    try { sessionStorage.setItem("pendingRole", role); } catch {}
    try { localStorage.setItem("loginIntent", "google"); } catch {}

    console.log("[login] start", { role, strategy: "redirect" });
    // ✅ Web: usa siempre redirect (evita bloqueos de popup/COOP en móvil y emulación)
    await signInWithRedirect(auth, googleProvider);
  } catch (e) {
    console.error("[login] error", e);
  } finally {
    // pequeño delay para no “desbloquear” antes del redirect
    setTimeout(() => { logging = false; }, 1500);
  }
}
