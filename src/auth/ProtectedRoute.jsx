// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, rol, aprobado, loading } = useAuth();

  // 🧪 Logs de depuración
  console.log("🔐 [ProtectedRoute]");
  console.log("Usuario:", user?.email || null);
  console.log("Rol actual:", rol);
  console.log("Rol requerido:", roleRequired);
  console.log("Aprobado:", aprobado);
  console.log("Loading:", loading);

  // ⏳ Esperamos hasta que se termine de cargar la sesión y los datos
  if (loading) {
    return <p className="text-center mt-10">Cargando...</p>;
  }

  // ❌ Si no hay sesión activa o el rol no coincide, redirigimos al home
  if (!user || rol !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // ⚠️ Si el rol requerido es EXPERTO pero aún no ha sido aprobado
  if (roleRequired === ROLES.EXPERTO && !aprobado) {
    return (
      <div className="text-center mt-10 text-red-600">
        Tu perfil aún no ha sido aprobado por el equipo de Queesia. Te notificaremos por correo en cuanto esté listo. 🧀
      </div>
    );
  }

  // ✅ Usuario autenticado y con rol correcto
  return children;
}
