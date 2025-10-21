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

function clearPendingRole() {
  try {
    localStorage.removeItem("pendingRole");
    localStorage.removeItem("loginIntent");
  } catch {}
  try {
    sessionStorage.removeItem("pendingRole");
    sessionStorage.removeItem("loginIntent");
  } catch {}
}

export default function AuthRedirectGate({ children }) {
  const { initializing, signedIn, rol } = useAuth();
  const [processing, setProcessing] = useState(true);
  const ran = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const res = await getRedirectResult(auth); // resultado del redirect
        const pendingRole = getPendingRole(rol || "usuario");

        if (res?.user) {
          await ensureUserDoc(res.user, pendingRole);
          clearPendingRole();
          navigate(pathByRole(pendingRole), { replace: true });
          return;
        }
      } catch (err) {
        console.error("AuthRedirectGate error:", err);
      } finally {
        setProcessing(false);
      }
    })();
  }, [navigate, rol]);

  useEffect(() => {
    if (!processing && !initializing && signedIn) {
      const pr = getPendingRole(rol || "usuario");
      clearPendingRole();
      navigate(pathByRole(pr), { replace: true });
    }
  }, [processing, initializing, signedIn, rol, navigate]);

  if (processing || initializing) {
    return (
      <div className="p-6 text-center font-medium text-gray-700">
        Entrando a su cuenta…
      </div>
    );
  }

  return children;
}
