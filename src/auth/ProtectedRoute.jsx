// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

/** Detecta si venimos de signInWithRedirect (flujo móvil) */
function isReturningFromRedirect() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) return true;
  }
  return false;
}

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, rol, aprobado, loading } = useAuth();

  // ⏳ Mientras carga auth o regresamos del redirect, no muevas la ruta
  if (loading || isReturningFromRedirect()) {
    return <div className="p-8 text-center">Cargando…</div>;
  }

  // 🔒 Sin sesión → a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🎭 Si se requiere un rol específico y no coincide, redirige a su dashboard por rol
  if (roleRequired && rol && rol !== roleRequired) {
    return <Navigate to={`/${rol}/dashboard`} replace />;
  }

  // ✅ Si exige EXPERTO y no está aprobado aún
  if (roleRequired === ROLES.EXPERTO && !aprobado) {
    return (
      <div className="text-center mt-10 text-red-600 px-4">
        Tu perfil aún no ha sido aprobado por el equipo de Queesia.
        Te notificaremos por correo en cuanto esté listo. 🧀
      </div>
    );
  }

  // ✅ Acceso concedido
  return children;
}
