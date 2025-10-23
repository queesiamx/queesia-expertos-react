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
  const role = normalizeRole(roleLike);
  try {
    
     // Usamos el provider centralizado
     googleProvider.setCustomParameters({ prompt: "select_account" });
     console.log("[login] Forzando signInWithRedirect. role:", role);
     await signInWithRedirect(auth, googleProvider);
 
    } catch (e) {
    // Errores comunes de popup: user closed popup / cancelled
    console.warn("[login] signInWithRedirect error:", e?.code || e);
  }
}
