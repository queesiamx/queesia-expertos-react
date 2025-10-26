// src/guards/RoleGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { pathByRole } from "@/auth/pathByRole";

export default function RoleGuard() {
  const { user, rol, aprobado, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <p className="p-6 text-center">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (!rol) return <p className="p-6 text-center">Verificando permisos…</p>;

  // Si entra a raíz o login teniendo sesión, lo llevamos a su panel
  if (loc.pathname === "/" || loc.pathname === "/login") {
    return <Navigate to={pathByRole(rol, aprobado)} replace />;
  }

  return <Outlet />;
}
