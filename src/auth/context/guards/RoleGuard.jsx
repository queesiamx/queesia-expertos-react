// src/guards/RoleGuard.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/context/AuthContext';
import { pathByRole } from '@/auth/pathByRole';

export default function RoleGuard({ allow }) {
  const { loading, user, rol, aprobado } = useAuth();

  // 1) Cargando contexto (aún no sabemos rol/aprobado)
  if (loading) return null;

  // 2) Sin sesión -> login
  if (!user) return <Navigate to="/login" replace />;

  // 3) Normaliza
  const current = (rol || '').toString().trim().toLowerCase();
  const isApproved = Boolean(aprobado);

  // Rutas solo para EXPERTO (aprobado)
  if (allow === 'experto') {
    if (current !== 'experto') {
      return <Navigate to={pathByRole(current, isApproved)} replace />;
    }
    if (!isApproved) {
      return <Navigate to="/espera-aprobacion" replace />;
    }
    return <Outlet />;
  }

  // Rutas solo para ADMIN
  if (allow === 'admin') {
    if (current !== 'admin') {
      return <Navigate to={pathByRole(current, isApproved)} replace />;
    }
    return <Outlet />;
  }

  // Público o sin restricción
  return <Outlet />;
}
