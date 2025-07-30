// src/auth/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

export default function ProtectedRoute({ children, roleRequired }) {
  const { user, rol, aprobado, loading } = useAuth();

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  // Si no hay usuario autenticado o el rol no coincide
  if (!user || rol !== roleRequired) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario es experto pero aún no ha sido aprobado
  if (roleRequired === ROLES.EXPERTO && !aprobado) {
    return (
      <div className="text-center mt-10 text-red-600">
        Tu perfil aún no ha sido aprobado por el equipo de Queesia. Te notificaremos por correo en cuanto esté listo. 🧀
      </div>
    );
  }

  return children;
}
