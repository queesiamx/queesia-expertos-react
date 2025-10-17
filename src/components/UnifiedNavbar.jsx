// src/components/UnifiedNavbar.jsx
import React, { useEffect, useState } from "react";
// 👇 Estás ya en src/components, así que importa directo:
import LoginAccordion from "./LoginAccordion";
import { Link, useNavigate } from "react-router-dom";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import LoginButton from "./LoginButton";

import UserMenu from "./UserMenu";
import toast from "react-hot-toast";

export default function UnifiedNavbar() {
  // Usa el hook como única fuente de verdad
  const { user, rol, signOut: appSignOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
    // Evita choque de nombres: usa el alias de Firebase
      await firebaseSignOut(auth);
      // (Opcional) si tu contexto mantiene estado adicional:
      try { await appSignOut?.(); } catch {}
      toast.success("Sesión cerrada correctamente.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Error al cerrar sesión.");
    }
  };

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
                <a
              href="https://foro.queesia.com"
              className="text-slate-700 hover:text-slate-900 transition-colors"
            >
              Foro
            </a>

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
        </nav>

        {/* Lado derecho (login / CTA) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <UserMenu usuario={user} handleLogout={handleLogout} />
          ) : (
            <>
              <LoginButton />
              <Link
                to="/registro"
                className="btn btn-lg btn-expert">

                Ser Experto
              </Link>
            </>
          )}
        </div>

     {/* Móvil: botón hamburguesa (alto contraste) */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm text-slate-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Abrir menú"
          onClick={() => setMobileOpen(true)}
        >
          {/* ícono hamburguesa */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>
      
      {/* Drawer móvil */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[10000]">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel derecho */}
          <aside className="absolute right-0 top-0 h-full w-[85%] max-w-xs bg-white shadow-xl border-l border-slate-200
                             animate-[slideIn_.2s_ease-out]">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="font-semibold text-slate-900">Menú</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <a href="https://queesia.com/#catalogo" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Catálogo
              </a>
              <a href="https://queesia.com/casos" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Casos de éxito
              </a>
              <a href="https://expertos.queesia.com/#filtros" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Explorar expertos
              </a>
              <a href="https://foro.queesia.com" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Foro
              </a>
              <a href="https://queesia.com/nosotros/" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Acerca de 🧀
              </a>
              <a href="https://queesia.com/contacto" className="block rounded-lg px-3 py-2 hover:bg-slate-50 text-slate-800">
                Contacto
              </a>
            </nav>
            <div className="p-4 border-t border-slate-200 space-y-2">
              {user ? (
                <>
                  <div className="text-sm text-slate-600 mb-2">
                    Sesión iniciada como <span className="font-medium text-slate-900">{user.email}</span>
                  </div>
                  <button
                    onClick={async () => { await handleLogout(); setMobileOpen(false); }}
                    className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <LoginAccordion open onClose={() => setMobileOpen(false)} />
                  <Link
                    to="/registro"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 block text-center rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800"
                  >
                    Convertirme en Experto
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
