// src/pages/PostAuth.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];
const ROLES = { EXPERTO: "EXPERTO", USUARIO: "USUARIO", ADMIN: "ADMIN" };

function pickDest({ user, rol, aprobado, pendingRole, intent }) {
  const email = user?.email || "";
  const pr = (pendingRole || "").toUpperCase();
  const isAdmin = ADMIN_EMAILS.includes(email) || pr === "ADMIN";
  const isExpert = pr === "EXPERTO" || rol === ROLES.EXPERTO;

  if (isAdmin) return "/admin-expertos";
  if (isExpert) {
    if (intent === "register") return "/registro";
    return aprobado === false ? "/" : "/expert-dashboard";
  }
  return "/mis-consultas";
}

export default function PostAuth() {
  const { user, rol, aprobado, loading } = useAuth();
  const nav = useNavigate();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;

    const pendingRole = localStorage.getItem("pendingRole") || "";
    const intent = localStorage.getItem("authIntent") || "login";

    const finish = (u) => {
      if (once.current) return;
      once.current = true;
      localStorage.removeItem("pendingRole");
      localStorage.removeItem("authIntent");
      const dest = pickDest({ user: u, rol, aprobado, pendingRole, intent });
      nav(dest, { replace: true });
    };

    if (!loading && user) return finish(user);

    if (!loading && !user) {
      const cu = auth.currentUser;
      if (cu) return finish(cu);
      nav("/login", { replace: true });
      return;
    }

    const t1 = setTimeout(() => auth.currentUser && finish(auth.currentUser), 800);
    const t2 = setTimeout(() => {
      if (auth.currentUser) finish(auth.currentUser);
      else nav("/login", { replace: true });
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [loading, user, rol, aprobado, nav]);

  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="flex items-center gap-3 text-gray-600">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" />
        <span>Entrando a tu cuenta…</span>
      </div>
    </main>
  );
}
