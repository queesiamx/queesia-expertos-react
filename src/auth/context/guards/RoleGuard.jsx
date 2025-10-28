// src/guards/RoleGuard.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { pathByRole } from "@/auth/pathByRole";

export default function RoleGuard({ allow }) {
  const { loading, user, rol, aprobado } = useAuth();

  // Aún cargando contexto
  if (loading) return null;

  // Sin sesión -> login
  if (!user) return <Navigate to="/login" replace />;
   if (rol == null) {
   return <div className="p-6 text-center">Cargando rol…</div>; // (3) aún sin rol => NO navegar
 }

  // Normaliza
  const current = String(rol || "").trim().toLowerCase();
  const isApproved = Boolean(aprobado);

  // Solo EXPERTO
  if (allow === "experto") {
    if (current === "experto" && isApproved) return <Outlet />;
    if (current === "experto" && !isApproved)
      return <Navigate to="/espera-aprobacion" replace />;
    return <Navigate to={pathByRole(current, isApproved)} replace />;
  }

  // Solo ADMIN
  if (allow === "admin") {
    if (current === "admin") return <Outlet />;
    return <Navigate to={pathByRole(current, isApproved)} replace />;
  }

  // Rutas sin restricción adicional
  return <Outlet />;
}
