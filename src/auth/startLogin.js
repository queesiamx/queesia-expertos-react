// src/auth/startLogin.js  (#RTC_CO)
import { auth } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

const provider = new GoogleAuthProvider();
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

// Admins por correo (ajústalo si quieres moverlo a Firestore)
export const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

export async function startLogin(role /* 'ADMIN' | 'EXPERTO' | 'USUARIO' */) {
  const pendingRole = (role || "USUARIO").toUpperCase();
  localStorage.setItem("pendingRole", pendingRole);

  if (isMobile) {
    // Móvil → redirect directo (sin vistas intermedias)
    // Regresará a la misma URL y el Gate procesará getRedirectResult
    await signInWithRedirect(auth, provider);
    return;
  }

  // Desktop → popup
  try {
    const res = await signInWithPopup(auth, provider);
    // Cache mínimo por compatibilidad con el resto de la app
    const token = await res.user.getIdToken();
    localStorage.setItem("authToken", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        uid: res.user.uid,
        name: res.user.displayName,
        email: res.user.email,
        photo: res.user.photoURL,
      })
    );

    // En desktop, al terminar popup, navegamos directo por rol.
    goByRole(res.user, pendingRole);
  } catch (e) {
    // Silenciar cierre voluntario; log para otros errores
    if (e?.code !== "auth/popup-closed-by-user") {
      console.error("[startLogin] popup error:", e);
    }
  }
}

// Devuelve la ruta destino según el rol; NO hace redirect fuerte.
export function pathByRole(user, pendingRole) {
  const email = user?.email || "";
  const isAdmin = ADMIN_EMAILS.includes(email) || pendingRole === "ADMIN";
  const isExpert = pendingRole === "EXPERTO";
  if (isAdmin) return "/admin-expertos";
  if (isExpert) return "/expert-dashboard";
  return "/mis-consultas";
}
