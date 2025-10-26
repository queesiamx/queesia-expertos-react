// src/components/AuthRedirectGate.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";
import { ensureUserDoc } from "@/auth/ensureUserDoc";
import { normalizeRole, ROLES } from "@/constants/roles";
import { pathByRole } from "@/auth/pathByRole";

function getPendingRole(fallback) {
  let v = null;
  try { v = localStorage.getItem("pendingRole"); } catch {}
  if (!v) { try { v = sessionStorage.getItem("pendingRole"); } catch {} }
  return normalizeRole(v || fallback || ROLES.USUARIO);
}

function clearPendingRole() {
  try { localStorage.removeItem("pendingRole"); } catch {}
  try { sessionStorage.removeItem("pendingRole"); } catch {}
  try { localStorage.removeItem("loginIntent"); } catch {}
  try { sessionStorage.removeItem("loginIntent"); } catch {}
}

export default function AuthRedirectGate({ children }) {
  const { user, rol, initializing } = useAuth();
  const [processing, setProcessing] = useState(true); // Empieza en true
  const [redirectHandled, setRedirectHandled] = useState(false);
  const ran = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1) Procesa el retorno del redirect UNA sola vez AL MONTAR
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      console.log("[AuthRedirectGate] Verificando redirect result...");
      
      try {
        const res = await getRedirectResult(auth);
        const u = res?.user;
        
        if (u) {
          console.log("[AuthRedirectGate] ✅ Usuario desde redirect:", u.email);
          const pr = getPendingRole(ROLES.USUARIO);
          console.log("[AuthRedirectGate] Creando/actualizando documento con rol:", pr);
          
          await ensureUserDoc(u, pr);
          clearPendingRole();
          setRedirectHandled(true);
          
          console.log("[AuthRedirectGate] Documento creado/actualizado correctamente");
        } else {
          console.log("[AuthRedirectGate] No hay redirect pendiente");
        }
      } catch (err) {
        console.error("[AuthRedirectGate] ❌ Error en getRedirectResult:", err);
        clearPendingRole();
      } finally {
        setProcessing(false);
        console.log("[AuthRedirectGate] Procesamiento completado");
      }
    })();
  }, []);

  // 2) Navega SOLO en casos específicos
  useEffect(() => {
    // No hacer nada si todavía estamos procesando o inicializando
    if (processing || initializing) {
      console.log("[AuthRedirectGate] Esperando... processing:", processing, "initializing:", initializing);
      return;
    }

    // No hacer nada si no hay usuario
    if (!user) {
      console.log("[AuthRedirectGate] No hay usuario, no navegar");
      return;
    }

    // No hacer nada si no tenemos el rol aún
    if (!rol) {
      console.log("[AuthRedirectGate] Esperando rol...");
      return;
    }

    const currentPath = location.pathname;
    const onLoginPage = currentPath.startsWith("/login");
    
    console.log("[AuthRedirectGate] Estado:", {
      user: user.email,
      rol,
      currentPath,
      redirectHandled,
      onLoginPage
    });

    // SOLO navegar si:
    // 1. Acabamos de completar un redirect, O
    // 2. Estamos en una página de login con sesión activa
    if (redirectHandled || onLoginPage) {
      const target = pathByRole(user, rol);
      console.log("[AuthRedirectGate] 🚀 Navegando a:", target);
      navigate(target, { replace: true });
      setRedirectHandled(false);
    }
  }, [processing, initializing, user, rol, location.pathname, redirectHandled, navigate]);

  // Mostrar loader mientras procesa
  if (processing || initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">
            {processing ? "Verificando sesión..." : "Cargando..."}
          </p>
        </div>
      </div>
    );
  }

  return children ?? null;
}