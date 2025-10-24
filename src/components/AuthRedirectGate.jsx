import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ensureUserDoc } from "@/auth/ensureUserDoc";
import { normalizeRole } from "@/constants/roles";
import { pathByRole } from "@/auth/pathByRole";

function getPendingRole(fallback) {
  let v = null;
  try { v = localStorage.getItem("pendingRole"); } catch {}
  if (!v) { try { v = sessionStorage.getItem("pendingRole"); } catch {} }
  return normalizeRole(v || fallback || "usuario");
}

/**
 * Componente que resuelve el retorno de signInWithRedirect y redirige según rol.
 * Seguro en SSR y en clientes que bloquean 3rd-party cookies.
 */
export default function AuthRedirectGate({ children }) {
  const nav = useNavigate();
  const ran = useRef(false);
  const [processing, setProcessing] = useState(true);
  const { user, rol, loading } = useAuth(); // loading = inicializando listener

  useEffect(() => {
   if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        // 1) Intenta resolver el redirect si lo hay
        console.log("[auth-gate] resolving redirect…");
        const res = await getRedirectResult(auth);
        const u = res?.user || auth.currentUser || null;

        if (u) {
          const pr = getPendingRole(rol);
          await ensureUserDoc(u, pr);
         // dejar una “miga” para PostAuth en caso de navegación manual
          try { localStorage.setItem("pendingRole", pr); } catch {}
          const dest = pathByRole(pr);
          console.log("[auth-gate] signed in →", u.email, "→", dest);
          nav(dest, { replace: true });
          return;
       }

        console.log("[auth-gate] no redirect result & no currentUser");
      } catch (e) {
       console.warn("[auth-gate] getRedirectResult error:", e?.code || e);
      } finally {
        setProcessing(false);
      }
    })();
  }, [nav, rol]);

  // Si ya hay sesión por el listener (p. ej., persistence restaurada), deriva.
  useEffect(() => {
    if (!processing && !loading && user) {
      const pr = getPendingRole(rol);
      const dest = pathByRole(pr);
      nav(dest, { replace: true });
    }
  }, [processing, loading, user, rol, nav]);

  if (processing || loading) {
    return (
      <div className="p-6 text-center font-medium text-gray-700">
        Entrando a su cuenta…
      </div>
    );
  }

  return children ?? null;
}