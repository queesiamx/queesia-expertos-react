// src/auth/startLogin.js
import { auth, googleProvider } from "@/firebase";
import { signInWithRedirect, signInWithPopup } from "firebase/auth";

let logging = false;

const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export async function startLogin(role = "usuario") {
  if (logging) return;           // evita doble click
  logging = true;

  try {
    // guarda intención/rol antes de salir
    localStorage.setItem("pendingRole", role);
    sessionStorage.setItem("pendingRole", role);

    console.log("[login] start", { role, isMobile });

    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    // Desktop: intenta popup; si falla por bloqueo, cae a redirect
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      const code = e?.code || "";
      console.warn("[login] popup fail, fallback to redirect:", code);
      await signInWithRedirect(auth, googleProvider);
    }
  } catch (e) {
    console.error("[login] error", e);
  } finally {
    // pequeño delay para no “desbloquear” antes del redirect
    setTimeout(() => { logging = false; }, 1500);
  }
}
