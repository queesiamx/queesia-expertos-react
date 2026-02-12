// src/auth/login.js
import { auth, googleProvider } from "@/firebase";
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

const SSO_API = "/api/trackVisit";

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

let locking = false;

/** Entry único de login (redirect en móvil, popup en desktop) */
export async function startLogin(role = "usuario") {
  if (locking) return;
  locking = true;

  try {
    // Persistimos intención de rol en ambos storages (redundancia para móvil)
    const roleStr = String(role).toLowerCase();
    try { localStorage.setItem("pendingRole", roleStr); } catch {}
    try { sessionStorage.setItem("pendingRole", roleStr); } catch {}
   // Permite forzar popup en móvil con ?forcePopup=1 (prueba A/B)
    const url = new URL(location.href);
    const forcePopup = url.searchParams.get("forcePopup") === "1";

    console.info(
      "[login] UA móvil?:",
      isMobile,
      "→", (isMobile && !forcePopup) ? "signInWithRedirect" : "signInWithPopup",
      "origin:",
      location.origin
    );

      if (isMobile && !forcePopup) {
      // Marcamos explícitamente que vamos a redirect (para diagnóstico en AuthContext)
      try { sessionStorage.setItem("redirectInProgress", "1"); } catch {}
      await signInWithRedirect(auth, googleProvider);
      // No hay más flujo aquí: el resultado se consume en AuthContext con getRedirectResult()
      return;
    }

    // Popup (desktop por defecto, o móvil con ?forcePopup=1)
    try {
      const res = await signInWithPopup(auth, googleProvider);
     
    // ✅ set cookie SSO global (.queesia.com)
      try {
        const idToken = await auth.currentUser.getIdToken(true);
        await fetch(`${SSO_API}?action=login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
      } catch (e) {
        console.warn("[SSO] login(cookie) fail after popup:", e?.message || e);
      }
    } catch (popupErr) {
      console.warn("[login] popup error:", popupErr?.message || popupErr);
      // Fallback: si el popup es bloqueado, intentamos redirect
      if (popupErr?.code === "auth/popup-blocked" || popupErr?.code === "auth/popup-closed-by-user") {
        try { sessionStorage.setItem("redirectInProgress", "1"); } catch {}
        console.info("[login] fallback → signInWithRedirect");
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw popupErr;
    }
  } catch (e) {
    console.warn("[login] error:", e?.message || e);
  } finally {
    locking = false;
  }
}

export default startLogin;
export { startLogin as loginWithGoogle };
