// src/pages/PostAuth.jsx  (#RTC_CO)
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

function pickDest({ user, rol, aprobado, pendingRole }) {
  const email = user?.email || "";
  const pr = (pendingRole || "").toUpperCase();

  const isAdmin = ADMIN_EMAILS.includes(email) || pr === "ADMIN";
  const isExpert = pr === "EXPERTO" || rol === ROLES.EXPERTO;

  if (isAdmin) return "/admin-expertos";
  if (isExpert) return aprobado === false ? "/registro" : "/expert-dashboard";
  return "/mis-consultas";
}

export default function PostAuth() {
  const { user, rol, aprobado, loading } = useAuth();
  const nav = useNavigate();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;

    const pendingRole = localStorage.getItem("pendingRole") || "";
    if (pendingRole) localStorage.removeItem("pendingRole");

    const go = (u, r = rol, a = aprobado) => {
      once.current = true;
      const dest = pickDest({ user: u, rol: r, aprobado: a, pendingRole });
      nav(dest, { replace: true });
    };

    // 1) Si el contexto ya está listo → decide y navega
    if (!loading && user) {
      go(user);
      return;
    }

    // 2) Si el contexto dice que no hay usuario, intenta fallback a currentUser
    if (!loading && !user) {
      const cu = auth.currentUser;
      if (cu) {
        go(cu);
        return;
      }
      // No hay sesión real → a login
      nav("/login", { replace: true });
      return;
    }

    // 3) Aún cargando: espera un poco y aplica fallbacks para no quedar en loop
    const t1 = setTimeout(() => {
      const cu = auth.currentUser;
      if (cu) {
        go(cu);
      }
    }, 600);

    // 4) Timeout duro: si a los 4s no baja loading ni hay currentUser → envía a login
    const t2 = setTimeout(() => {
      const cu = auth.currentUser;
      if (cu) go(cu);
      else nav("/login", { replace: true });
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, user, rol, aprobado, nav]);

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="flex items-center gap-3 text-gray-600" role="status" aria-live="polite">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" />
        <span>Entrando a tu cuenta…</span>
      </div>
    </main>
  );
}
