// src/auth/startLogin.js
 // Fuente única de verdad: auth inicializado y el provider vienen de tu módulo firebase
 import { auth, googleProvider } from "@/firebase";
 // Solo una vez este import de la SDK
 import { signInWithRedirect } from "firebase/auth";
 import { normalizeRole } from "@/constants/roles";

//const isMobile =
  //typeof navigator !== "undefined" &&
  //Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
   // Temporal: siempre redirect (diagnóstico móvil)
// Si luego quieres restaurar popup en desktop, reactivamos el bloque anterior.


export async function startLogin(roleLike = "usuario") {
 // Normaliza y persiste de forma defensiva el rol/intent antes del redirect.
  const role = normalizeRole(roleLike);
  try {
    try {
      sessionStorage.setItem("pendingRole", role);
      localStorage.setItem("pendingRole", role);
      sessionStorage.setItem("loginIntent", "signin");
      localStorage.setItem("loginIntent", "signin");
    } catch {}

    // Usamos el provider centralizado
    googleProvider.setCustomParameters({ prompt: "select_account" });
    console.log("[login] signInWithRedirect → role:", role);
    await signInWithRedirect(auth, googleProvider);
    // Nota: la navegación se hará fuera (Google → /auth → PostAuth).
  } catch (e) {
    console.warn("[login] signInWithRedirect error:", e?.code || e);
    throw e;
  }
}