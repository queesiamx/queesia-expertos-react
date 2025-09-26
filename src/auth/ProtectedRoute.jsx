// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

// Detecta si estamos regresando del redirect de Firebase (móvil)
function isReturningFromRedirect() {
  // Firebase guarda claves en sessionStorage mientras procesa el redirect.
  // Algunas implementaciones usan "firebase:redirectEventId" (o similares por API key).
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) return true;
  }
  return false;
}

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, rol, aprobado, loading } = useAuth();

  // 🧪 Logs de depuración (puedes comentar estas líneas en producción)
  console.log("🔐 [ProtectedRoute]", {
    user: user?.email || null,
    rolActual: rol,
    rolRequerido: roleRequired,
    aprobado,
    loading,
    returningFromRedirect: isReturningFromRedirect(),
  });

  // ⏳ No bloquear mientras carga auth O mientras volvemos del redirect
  if (loading || isReturningFromRedirect()) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  // ❌ Si no hay sesión activa
  if (!user) {
    // puedes cambiar a "/login" si así prefieres
    return <Navigate to="/" replace />;
  }

  // ❌ Si el rol no coincide con el requerido
  if (roleRequired && rol !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // ⚠️ Si el rol requerido es EXPERTO pero aún no ha sido aprobado
  if (roleRequired === ROLES.EXPERTO && !aprobado) {
    return (
      <div className="text-center mt-10 text-red-600 px-4">
        Tu perfil aún no ha sido aprobado por el equipo de Queesia.
        Te notificaremos por correo en cuanto esté listo. 🧀
      </div>
    );
  }

  // ✅ Autenticado y con rol correcto
  return children;
}
