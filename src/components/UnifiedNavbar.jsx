// src/components/UnifiedNavbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { pathByRole } from "@/auth/pathByRole";
import { useAuth } from "@/auth/context/AuthContext";
import { logout } from "@/auth/logout";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import toast from "react-hot-toast";

export default function UnifiedNavbar() {
  const { user, rol, aprobado } = useAuth();
  // Usa los TRES valores para calcular el destino del panel
  const dashHref = user && rol ? pathByRole(rol, aprobado) : null;


  const navigate = useNavigate();
  //const { user: usuario } = useAuth();


  return (
    <header className="sticky top-0 z-[9999] w-full
      bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70
      border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="https://queesia.com" className="flex items-center gap-2">
          <img src="/logo-bg.png" alt="Queesia" className="w-7 h-7" />
          <span className="text-xl font-extrabold italic leading-none">
            <span className="text-slate-900">quees</span>
            <span className="text-blue-600">ia</span>
            {rol === "experto" && (
              <span className="ml-1 text-slate-900 not-italic font-semibold">expertos</span>
            )}
          </span>
        </a>

        {/* Navegación desktop */}
        <nav className="hidden md:flex items-center gap-7 text-[15px]">
          <a
            href="https://queesia.com/#catalogo"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Catálogo
          </a>

              <div className="relative group">
                <a href="https://queesia.com/casos" className="text-slate-700 hover:text-slate-900 transition-colors">
                  Casos de éxito
                </a>
                {/* puente de hover, no altera layout */}
                <span className="absolute left-0 right-0 -bottom-3 h-3 block" aria-hidden="true"></span>

                {/* Dropdown */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full z-50 hidden
                            group-hover:block group-focus-within:block
                            bg-white border border-slate-200 shadow-lg rounded-xl p-2 w-56"
                >
              <a href="https://queesia.com/casos" className="block px-3 py-2 rounded-md hover:bg-slate-50">
                Todos los casos
              </a>
              <a href="https://queesia.com/casos#categoria-publico" className="block px-3 py-2 rounded-md hover:bg-slate-50">
                Sector público
              </a>
              <a href="https://queesia.com/casos#categoria-privado" className="block px-3 py-2 rounded-md hover:bg-slate-50">
                Sector privado
              </a>
            </div>
          </div>

          {/* EXPERTOS (dropdown) */}
<div className="relative group">
  <a
    href="https://expertos.queesia.com"
    className="text-slate-700 hover:text-slate-900 transition-colors"
  >
    Expertos
  </a>

  {/* puente de hover/focus */}
  <span
    className="absolute left-0 right-0 -bottom-3 h-3 block"
    aria-hidden="true"
  />

  {/* Dropdown */}
  <div
    className="absolute left-1/2 -translate-x-1/2 top-full z-50 hidden
               group-hover:block group-focus-within:block
               bg-white border border-slate-200 shadow-lg rounded-xl p-2 w-56"
    role="menu"
    aria-label="Submenú Expertos"
  >
    <a href="https://expertos.queesia.com/#filtros"
   className="block px-3 py-2 rounded-md text-indigo-500 hover:bg-gray-50">
  Explorar expertos
</a>
<a href="/registro"
   className="block px-3 py-2 rounded-md text-indigo-500  hover:bg-gray-50">
  Convertirme en un Experto
</a>

  </div>
</div>

       <NavLink
          to="/foro"
          className={({ isActive }) =>
            `px-3 py-2 rounded-xl transition ${
              isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Foro
        </NavLink>

          <a
            href="https://queesia.com/nosotros/"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Acerca de 🧀
          </a>

          <a
            href="https://queesia.com/contacto"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Contacto
          </a>
         <NavLink
          to="/blog"
          className={({ isActive }) =>
            `px-3 py-2 rounded-xl transition ${
              isActive ? "bg-gray-900 text-white" : "hover:bg-gray-100"
            }`
          }
        >
          Blog
        </NavLink>
        </nav>

        {/* Lado derecho (login / CTA) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <a href={dashHref} className="text-sm underline">Mi panel</a>
              <UserMenu usuario={user} />
            </>
          ) : (
            <>
               <a href="/login" className="inline-flex items-center px-3 py-2 rounded-lg border">
                Iniciar sesión
              </a>
              <Link
                to="/registro"
                className="btn btn-lg btn-expert">

                Ser Experto
              </Link>
            </>
          )}
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
