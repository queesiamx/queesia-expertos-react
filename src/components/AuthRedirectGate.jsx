// src/components/AuthRedirectGate.jsx  (#RTC_CO)
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { pathByRole } from "@/auth/startLogin";

// Limpia llaves de redirect en sessionStorage (evita falsos positivos iOS/Safari)
function clearFirebaseRedirectKeys() {
  const keys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) keys.push(k);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}

function hasFirebaseRedirectKeys() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) return true;
  }
  return false;
}

// Cache mínimo (por compatibilidad con el resto de tu app)
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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // ✅ Solo procesa cuando REALMENTE venimos del redirect y estamos en rutas de login
      const onLoginRoute = location.pathname.startsWith("/login") || location.pathname.startsWith("/auth");
      if (!onLoginRoute && !hasFirebaseRedirectKeys()) return;


      try {
        // 1) Intento principal: retorno de signInWithRedirect
        const res = await getRedirectResult(auth).catch((e) => {
          console.error("[ARG] getRedirectResult error:", e);
          return null;
        });

        if (res?.user) {
          const pendingRole = localStorage.getItem("pendingRole") || "USUARIO";
          localStorage.removeItem("pendingRole");

          await cacheUser(res.user);
          clearFirebaseRedirectKeys();
          navigate(pathByRole(res.user, pendingRole), { replace: true });
          return;
        }

        // 2) Fallback rápido
        setTimeout(() => {
          const u = auth.currentUser;
          if (u) {
            const pendingRole = localStorage.getItem("pendingRole") || "USUARIO";
            localStorage.removeItem("pendingRole");

              cacheUser(u).then(() => {
              clearFirebaseRedirectKeys();
              navigate(pathByRole(u, pendingRole), { replace: true });
            });
          } else {
            // 3) Último recurso: breve suscripción
            const unsub = onAuthStateChanged(auth, async (user) => {
              if (!user) return;
              unsub?.();

              const pendingRole = localStorage.getItem("pendingRole") || "USUARIO";
              localStorage.removeItem("pendingRole");

              try {
                await cacheUser(user);
              } catch {}
              clearFirebaseRedirectKeys();
              navigate(pathByRole(user, pendingRole), { replace: true });
            });

            // Autolimpieza por si nada ocurre
            setTimeout(() => unsub?.(), 5000);
          }
        }, 150);
      } catch (e) {
        console.error("[ARG] fatal error:", e);
      }
    })();
  }, []);

  return null;
}
