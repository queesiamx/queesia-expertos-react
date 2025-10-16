// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";
import { useEffect, useMemo } from "react";

// Detecta si venimos de signInWithRedirect (flujo móvil)
function isReturningFromRedirect() {
  let hasKey = false;
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) hasKey = true;
  }
  if (!hasKey) return false;
  const ref = (document.referrer || "").toLowerCase();
  const fromGoogle = ref.includes("accounts.google.com");
  const onLogin = location.pathname.startsWith("/login");
  return hasKey && (fromGoogle || onLogin);
}

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, rol, aprobado, loading } = useAuth();

   // 🧹 Safety: si quedaron llaves de redirect “pegadas”, límpialas y continúa
  useEffect(() => {
    if (!isReturningFromRedirect()) return;
    const t = setTimeout(() => {
      try {
        const toDel = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i) || "";
          if (k.toLowerCase().includes("firebase:redirect")) toDel.push(k);
        }
        toDel.forEach((k) => sessionStorage.removeItem(k));
      } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Consolidamos banderas para evitar re-cálculos ruidosos
  const flags = useMemo(() => {
    return {
      fromRedirect: isReturningFromRedirect(),
      hasUser: Boolean(user),
      hasRole: rol != null,
      roleOk: !roleRequired || rol === roleRequired,
      approvedOk:
        roleRequired !== ROLES.EXPERTO ? true : Boolean(aprobado),
    };
  }, [user, rol, aprobado, roleRequired]);

  // 🔒 REGRA #1: Nunca navegues si todavía está cargando, venimos de redirect,
  // o aún no tenemos el rol (rol == null mientras Firestore resuelve).
  if (loading || flags.fromRedirect || (flags.hasUser && !flags.hasRole)) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  // 🔑 No autenticado → lleva a la home (o a /login-solo si lo prefieres).
  // Evitamos mandar a /login para no iniciar otro flujo automáticamente.
  if (!flags.hasUser) {
    return <Navigate to="/" replace />;
  }

  // 👮 Rol no cumple → manda al dashboard de su rol real (si ya lo tenemos)
  if (!flags.roleOk && flags.hasRole) {
    // Si todavía no sabemos el rol, ya lo manejó la regla #1 (loading view)
    const target =
      rol === ROLES.EXPERTO
        ? "/expert-dashboard"
        : rol === ROLES.ADMIN
        ? "/admin-expertos"
        : "/mis-consultas";
    return <Navigate to={target} replace />;
  }

  // 🧀 Experto no aprobado
  if (roleRequired === ROLES.EXPERTO && !flags.approvedOk) {
    return (
      <div className="text-center mt-10 text-red-600 px-4">
        Tu perfil aún no ha sido aprobado por el equipo de Queesia.
        Te notificaremos por correo en cuanto esté listo. 🧀
      </div>
    );
  }

  // ✅ Todo bien
  return children;
}