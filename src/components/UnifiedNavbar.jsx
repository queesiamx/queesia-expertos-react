// src/components/UnifiedNavbar.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";  // 👈 FALTA ESTE IMPORT
import { startLogin } from "@/auth/startLogin";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import LoginButton from "./LoginButton";

import UserMenu from "./UserMenu";
import toast from "react-hot-toast";

export default function UnifiedNavbar() {
  // Usa el hook como única fuente de verdad
  const { user, rol, authReady, signOut: appSignOut } = useAuth();
  const pathByRole = { ADMIN: "/admin-expertos", EXPERTO: "/expert-dashboard", USUARIO: "/mis-consultas" };

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rolePickerOpen, setRolePickerOpen] = useState(false);      // móvil
  const [rolePickerDesktop, setRolePickerDesktop] = useState(false); // desktop

   // Tomar SIEMPRE el user desde el contexto
  const current   = user ?? null;
  const signed    = !!user && !!authReady;     // evita falsos negativos al cargar
  const userEmail = user?.email || "";


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

 
  // Cierra selectores cuando entra sesión (opcional cierra el drawer)
  useEffect(() => {
    if (signed) {
       setRolePickerOpen(false);
       setRolePickerDesktop(false);
       // opcional: cierra el drawer al loguear
       // setMobileOpen(false);
    }
  }, [signed]);

  return (
    <header className="sticky top-0 z-[9999] w-full
      bg-white/90 backdrop-white supports-[backdrop-filter]:bg-white/70
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
        <div className="hidden md:flex items-center gap-3 relative"> {/* 👈 relative para anclar el dropdown */}
           
          {!authReady ? (
            <span className="text-sm text-slate-500">Cargando…</span>
          ) : signed ? (
            <UserMenu usuario={current} handleLogout={handleLogout} />
          ) : (
            <>
          {/* Un botón: Iniciar sesión (abre selector de roles) */}
              <LoginButton
                onClick={() => setRolePickerDesktop(v => !v)}
                className="w-auto"
              />
              
              {rolePickerDesktop && (
                <div
                  id="rolepicker-desktop"
                  className="absolute right-0 top-[120%] z-50 w-56 rounded-xl border bg-white shadow-lg p-2"
                >
                  <button
                    onClick={async () => { setRolePickerDesktop(false); await startLogin("USUARIO","login"); }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50"
                  >
                    Soy Usuario
                  </button>
                  <button
                    onClick={async () => { setRolePickerDesktop(false); await startLogin("EXPERTO","login"); }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50"
                  >
                    Soy Experto
                  </button>
                  <button
                    onClick={async () => { setRolePickerDesktop(false); await startLogin("ADMIN","login"); }}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-slate-50"
                  >
                    Soy Admin
                  </button>
                  <div className="my-1 h-px bg-slate-200" />
                  <button
                    onClick={() => setRolePickerDesktop(false)}
                    className="block w-full text-left px-3 py-2 text-sm text-slate-500 rounded-md hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              )}
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
                             animate-[slideIn_.2s_ease-out] max-h-[100dvh] overflow-y-auto"> {/* 👈 scroll seguro */}
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
              {!authReady && <div className="text-sm opacity-70">Cargando sesión…</div>}

              {authReady && (
                signed ? (
                  <>
                    <div className="text-sm text-slate-600 mb-2">
                      Sesión iniciada como <span className="font-medium text-slate-900">{userEmail}</span>
                    </div>
                    {/* ✅ Acceso directo al panel según el rol */}
                    <button
                      onClick={() => {
                        const r = (rol ? rol.toUpperCase() : "USUARIO");
                        navigate(pathByRole[r] || "/mis-consultas");
                        setMobileOpen(false);
                      }}
                      className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800"
                    >
                      Mi panel
                    </button>
                    <button
                      onClick={async () => { await handleLogout(); setMobileOpen(false); }}
                      className="w-full rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    {/* ✅ Un solo botón: Iniciar sesión + Google */}
                    <button
                      onClick={() => setRolePickerOpen((v) => !v)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800"
                      aria-expanded={rolePickerOpen}
                      aria-controls="rolepicker"
                    >
                      {/* Google SVG */}
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
                        <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.9 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.0 0 5.7 1.1 7.8 3l5.7-5.7C34.4 5.1 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.5-7.6 21-18 0.1-1 0.1-2 0.1-3.0 0-1.1-0.1-2.1-0.3-3.5z"/>
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.9 16.6 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.4 5.1 29.5 3 24 3 15.5 3 8.2 7.8 6.3 14.7z"/>
                        <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 36.2 26.9 37 24 37c-5.3 0-9.8-3.3-11.6-8l-6.7 5.2C8.5 41.7 15.7 45 24 45z"/>
                        <path fill="#1976D2" d="M45 24c0-1.0-0.1-2.1-0.3-3.5H24v8h11.3c-1.1 3.1-3.5 5.5-6.6 6.5l6.3 5.2C38.8 37.9 45 31.8 45 24z"/>
                      </svg>
                      Iniciar sesión
                    </button>

                    {/* Selector de roles (se despliega/oculta) */}
                    {rolePickerOpen && (
                      <div id="rolepicker" className="mt-1 space-y-2">
                        <button
                          type="button"
                          onClick={async () => { setMobileOpen(false); setRolePickerOpen(false); await startLogin("USUARIO","login"); }}
                          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-slate-50"
                        >
                          Continuar como Usuario
                        </button>
                        <button
                          type="button"
                          onClick={async () => { setMobileOpen(false); setRolePickerOpen(false); await startLogin("EXPERTO","login"); }}
                          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-slate-50"
                        >
                          Continuar como Experto
                        </button>
                        <button
                          type="button"
                          onClick={async () => { setMobileOpen(false); setRolePickerOpen(false); await startLogin("ADMIN","login"); }}
                          className="w-full text-left px-4 py-2 text-sm rounded-lg hover:bg-slate-50"
                        >
                          Continuar como Admin
                        </button>
                        <div className="h-px bg-slate-200 my-1" />
                        <button
                          type="button"
                          onClick={() => setRolePickerOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </>
                )
              )}
             </div>
          </aside>
        </div>
      )}
    </header>
  );
}
