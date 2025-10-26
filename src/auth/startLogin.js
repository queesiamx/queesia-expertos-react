// src/auth/startLogin.js
import { auth, googleProvider } from "@/firebase";
import { clearRoleCache } from "@/auth/roleCache";
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

let logging = false;

// Detección “mobile-like” que también cubre emulación en DevTools
const isMobileLike = () => {
  const ua = (typeof navigator !== "undefined" && navigator.userAgent) || "";
  const byUA = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const byCH = !!navigator?.userAgentData?.mobile;
  const coarse = !!(window?.matchMedia && window.matchMedia("(pointer:coarse)").matches);
  const small = typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) <= 844;
  return byUA || byCH || coarse || small;
};

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

    const force = (typeof localStorage !== "undefined" && localStorage.getItem("AUTH_REDIRECT") === "1");
    const redirect = force || isMobileLike();
    console.log("[login] start", { role, strategy: redirect ? "redirect" : "popup" });

    if (redirect) {
      // ✅ móvil → redirect directo (sin popup)
      await signInWithRedirect(auth, googleProvider);
    } else {
      // desktop → intenta popup y cae a redirect si el navegador lo bloquea
     try {
        await signInWithPopup(auth, googleProvider);
      } catch (e) {
        const code = e?.code || "";
        console.warn("[login] popup fail, fallback to redirect:", code);
        await signInWithRedirect(auth, googleProvider);
      }
    }
  } catch (e) {
    console.error("[login] error", e);
  } finally {
    // pequeño delay para no “desbloquear” antes del redirect
    setTimeout(() => { logging = false; }, 1500);
  }
}
