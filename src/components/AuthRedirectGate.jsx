// src/components/AuthRedirectGate.jsx
import { useEffect, useRef } from "react";
import { auth } from "@/firebase";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

/** 🧹 Limpia llaves de sesión usadas por Firebase Redirect */
function clearFirebaseRedirectKeys() {
  const keys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) keys.push(k);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}

/** Navegación por rol */
function goByRole(user, pendingRole) {
  const email = user?.email || "";
  const isAdmin = ADMIN_EMAILS.includes(email) || pendingRole === "ADMIN";
  const isExpert = pendingRole === "EXPERTO";

  if (isAdmin) {
    window.location.replace("/admin-expertos");
    return;
  }
  if (isExpert) {
    // Si el experto no está aprobado, tu lógica de dashboard lo llevará a /registro
    window.location.replace("/expert-dashboard");
    return;
  }
  window.location.replace("/mis-consultas");
}

/** Cachea datos mínimos para el resto de la app */
async function cacheUser(user) {
  const token = await user.getIdToken();
  localStorage.setItem("authToken", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
    })
  );
}

export default function AuthRedirectGate() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // evita ejecución doble por HMR/stric mode
    ran.current = true;

    (async () => {
      try {
        console.log("[AuthRedirectGate] mounted. URL:", window.location.href);

        // 1) Intento principal: procesar retorno de signInWithRedirect
        const res = await getRedirectResult(auth).catch((e) => {
          console.error("[AuthRedirectGate] getRedirectResult error:", e);
          return null;
        });

        if (res?.user) {
          console.log("[AuthRedirectGate] result.user:", res.user?.email);
          const pendingRole = localStorage.getItem("pendingRole") || "";
          if (pendingRole) localStorage.removeItem("pendingRole");

          await cacheUser(res.user);
          clearFirebaseRedirectKeys();
          goByRole(res.user, pendingRole);
          return;
        }

        // 2) Fallback: Safari/iOS a veces da result == null pero el user ya está
        setTimeout(() => {
          const fallbackUser = auth.currentUser;
          if (fallbackUser) {
            console.log("[AuthRedirectGate] fallback currentUser:", fallbackUser.email);
            const pendingRole = localStorage.getItem("pendingRole") || "";
            if (pendingRole) localStorage.removeItem("pendingRole");

            cacheUser(fallbackUser)
              .then(() => {
                clearFirebaseRedirectKeys();
                goByRole(fallbackUser, pendingRole);
              })
              .catch((e) => console.error("[AuthRedirectGate] cacheUser fallback error:", e));
          } else {
            // 3) Último recurso: suscribirse brevemente a onAuthStateChanged
            const unsub = onAuthStateChanged(auth, async (u) => {
              if (!u) return;
              console.log("[AuthRedirectGate] onAuthStateChanged user:", u.email);
              unsub?.();
              const pendingRole = localStorage.getItem("pendingRole") || "";
              if (pendingRole) localStorage.removeItem("pendingRole");

              try {
                await cacheUser(u);
              } catch (e) {
                console.error("[AuthRedirectGate] cacheUser onAuth error:", e);
              } finally {
                clearFirebaseRedirectKeys();
                goByRole(u, pendingRole);
              }
            });
            // Autolimpieza de seguridad
            setTimeout(() => unsub?.(), 5000);
          }
        }, 150);
      } catch (e) {
        console.error("[AuthRedirectGate] fatal error:", e);
      } finally {
        // Cierra overlays/menús si existieran (evita que parezca “no cargó”)
        try {
          const ev = new CustomEvent("close-all-overlays");
          window.dispatchEvent(ev);
        } catch {}
      }
    })();
  }, []);

  // No renderiza UI: solo actúa como “puerta” de retorno de redirect
  return null;
}
