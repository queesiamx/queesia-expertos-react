// src/auth/startLogin.js
import { auth } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
 import { auth, googleProvider } from "@/firebase";
 import { signInWithRedirect } from "firebase/auth";
import { normalizeRole } from "@/constants/roles";

//const isMobile =
  //typeof navigator !== "undefined" &&
  //Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
   // Temporal: siempre redirect (diagnóstico móvil)
// Si luego quieres restaurar popup en desktop, reactivamos el bloque anterior.


export async function startLogin(roleLike = "usuario") {
  const role = normalizeRole(roleLike);
  try {
    // Guarda intención de rol para el redirect y también para popup
    try {
      localStorage.setItem("pendingRole", role);
      localStorage.setItem("loginIntent", "login");
      sessionStorage.setItem("pendingRole", role);
      sessionStorage.setItem("loginIntent", "login");
    } catch {}

    const provider = new GoogleAuthProvider();
    // fuerza selector de cuenta (evita “reciclar” sesión anterior)
    provider.setCustomParameters({ prompt: "select_account" });

    if (isMobile) {
      // ✅ móvil: redirect
      await signInWithRedirect(auth, provider);
      return;
    }
    // ✅ desktop: popup
    await signInWithPopup(auth, provider);

     // Usamos el provider centralizado
     googleProvider.setCustomParameters({ prompt: "select_account" });
     console.log("[login] Forzando signInWithRedirect. role:", role);
     await signInWithRedirect(auth, googleProvider);
 
    } catch (e) {
    // Errores comunes de popup: user closed popup / cancelled
    console.warn("[login] signInWithRedirect error:", e?.code || e);
  }
}
