// src/components/AuthRedirectGate.jsx
import { useEffect, useRef } from "react";
import { auth } from "@/firebase"; // OJO: ruta correcta
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";

const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

// Navegación por rol
function goByRole(user, pendingRole) {
  const email = user?.email || "";
  const isAdmin = ADMIN_EMAILS.includes(email) || pendingRole === "ADMIN";
  const isExpert = pendingRole === "EXPERTO";

  if (isAdmin) {
    window.location.replace("/admin-expertos");
    return;
  }
  if (isExpert) {
    // Si el experto no está aprobado, tu lógica en Dashboard lo manda a /registro
    window.location.replace("/expert-dashboard");
    return;
  }
  window.location.replace("/mis-consultas");
}

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
    if (ran.current) return; // evita dobles
    ran.current = true;

    (async () => {
      try {
        console.log("[AuthRedirectGate] mounted. URL:", window.location.href);

        // 1) Intento normal con getRedirectResult
        const res = await getRedirectResult(auth).catch((e) => {
          console.error("[AuthRedirectGate] getRedirectResult error:", e);
          return null;
        });

        if (res?.user) {
          console.log("[AuthRedirectGate] result.user:", res.user?.email);
          const pendingRole = localStorage.getItem("pendingRole") || "";
          if (pendingRole) localStorage.removeItem("pendingRole");

          await cacheUser(res.user);
          goByRole(res.user, pendingRole);
          return;
        }

        // 2) Fallback: a veces el user ya está firmado pero result == null
        //    Esperamos un pequeño tiempo y miramos currentUser / onAuthStateChanged.
        setTimeout(() => {
          const fallbackUser = auth.currentUser;
          if (fallbackUser) {
            console.log("[AuthRedirectGate] fallback currentUser:", fallbackUser.email);
            const pendingRole = localStorage.getItem("pendingRole") || "";
            if (pendingRole) localStorage.removeItem("pendingRole");

            cacheUser(fallbackUser).then(() => goByRole(fallbackUser, pendingRole));
          } else {
            // Último recurso: nos suscribimos brevemente
            const unsub = onAuthStateChanged(auth, async (u) => {
              if (!u) return;
              console.log("[AuthRedirectGate] onAuthStateChanged user:", u.email);
              unsub?.();
              const pendingRole = localStorage.getItem("pendingRole") || "";
              if (pendingRole) localStorage.removeItem("pendingRole");

              await cacheUser(u);
              goByRole(u, pendingRole);
            });
            // Se auto-limpia cuando naveguemos
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

  return null; // no renderiza
}
