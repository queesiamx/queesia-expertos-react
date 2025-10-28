// src/auth/login.js
import { auth, googleProvider } from "@/firebase";
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

let locking = false;

/** Entry único de login (redirect en móvil, popup en desktop) */
export async function startLogin(role = "usuario") {
  if (locking) return;
  locking = true;

  try {
    try { localStorage.setItem("pendingRole", String(role).toLowerCase()); } catch {}

    console.info(
      "[login] UA móvil?:",
      isMobile,
      "→",
      isMobile ? "signInWithRedirect" : "signInWithPopup",
      "origin:",
      location.origin
    );

    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      // No hay más flujo aquí: el resultado se consume en AuthContext con getRedirectResult()
      return;
    } else {
      const res = await signInWithPopup(auth, googleProvider);
      console.info("[login] popup OK user:", res?.user?.uid);
    }
  } catch (e) {
    console.warn("[login] error:", e?.message || e);
  } finally {
    locking = false;
  }
}

export default startLogin;
export { startLogin as loginWithGoogle };
