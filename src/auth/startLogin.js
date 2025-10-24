// src/auth/startLogin.js
 // Fuente única de verdad: auth inicializado y el provider vienen de tu módulo firebase
 import { auth, googleProvider } from "@/firebase";
 // Solo una vez este import de la SDK
 import { signInWithRedirect, signInWithPopup } from "firebase/auth";
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

    // --- Redirect primario
    let redirected = false;
    const t = setTimeout(() => {
      // Si a los ~900ms seguimos en la misma página, probamos popup como fallback.
      if (!redirected) {
        console.warn("[login] redirect no despegó → probando signInWithPopup fallback");
        signInWithPopup(auth, googleProvider)
         .then(() => {
            console.log("[login] popup fallback OK");
          })
          .catch((e) => {
            console.warn("[login] popup fallback error:", e?.code || e);
          });
      }
    }, 900);

    await signInWithRedirect(auth, googleProvider);
    redirected = true;
    clearTimeout(t);
    // La resolución se hará en el AuthRedirectGate (getRedirectResult)
  } catch (e) {
    console.warn("[login] signInWithRedirect error:", e?.code || e);
    throw e;
  }
}