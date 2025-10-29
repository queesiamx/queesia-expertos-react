// src/guards/RoleGuard.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { pathByRole } from "@/auth/pathByRole";

export default function RoleGuard({ allow }) {
  const { loading, user, rol, aprobado } = useAuth();

   // 🔧 Modo pruebas activable por query param o ENV
  let guardTest = false;
  try {
    const u = new URL(location.href);
    guardTest = u.searchParams.get("guardTest") === "1";
  } catch {}
  if (import.meta?.env?.VITE_GUARD_TEST === "1") guardTest = true;

  // Aún cargando contexto
  if (loading) {
    return <div className="p-6 text-center">Cargando sesión…</div>;
  }

  // Sin sesión -> login
    if (!user) {
    if (guardTest) {
      return (
        <div className="p-6 text-center">
          <div className="font-medium mb-2">Sin sesión (modo pruebas).</div>
          Ve a <a className="underline" href="/login">/login</a> o{" "}
          <a className="underline" href="/auth-bridge">/auth-bridge</a> para iniciar.
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  // (3) aún sin rol => NO navegar
  if (rol == null) {
    return <div className="p-6 text-center">Cargando rol…</div>;
  }

  // Normaliza
  const current = String(rol || "").trim().toLowerCase();
  const isApproved = Boolean(aprobado);

  // Solo EXPERTO
  if (allow === "experto") {
    if (current === "experto" && isApproved) return <Outlet />;
    if (current === "experto" && !isApproved) {
      if (guardTest) {
        return (
          <div className="p-6 text-center">
            Eres <b>experto</b> pero aún <b>no aprobado</b> (modo pruebas). Ruta objetivo:
            <code className="ml-2">/espera-aprobacion</code>
          </div>
        );
      }
      return <Navigate to="/espera-aprobacion" replace />;
    }
    if (guardTest) {
      return (
        <div className="p-6 text-center">
          Rol actual: <b>{current || "(vacío)"}</b> (modo pruebas). Ruta objetivo:{" "}
          <code className="ml-2">{pathByRole(current, isApproved)}</code>
        </div>
      );
    }
    return <Navigate to={pathByRole(current, isApproved)} replace />;
  }

  // Solo ADMIN
  if (allow === "admin") {
    if (current === "admin") return <Outlet />;
    if (guardTest) {
      return (
        <div className="p-6 text-center">
          Necesita rol <b>admin</b> (modo pruebas). Rol actual: <b>{current}</b>. Ruta objetivo:{" "}
          <code className="ml-2">{pathByRole(current, isApproved)}</code>
        </div>
      );
    }
    return <Navigate to={pathByRole(current, isApproved)} replace />;
  }

  // Rutas sin restricción adicional
  return <Outlet />;
}
