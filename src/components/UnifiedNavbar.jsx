// src/components/UnifiedNavbar.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, NavLink, useLocation } from "react-router-dom";
import { pathByRole } from "@/auth/pathByRole";
import { useAuth } from "@/auth/context/AuthContext";
import { logout } from "@/auth/logout";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import toast from "react-hot-toast";

export default function UnifiedNavbar() {
  const headerRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, rol, aprobado } = useAuth();
  // Usa los TRES valores para calcular el destino del panel
  const dashHref = user && rol ? pathByRole(rol, aprobado) : null;

  // Exponer altura real de la navbar para que los anchors / scrollIntoView no queden cubiertos
 useEffect(() => {
   const el = headerRef.current;
    if (!el) return;

    const setNavH = () => {
      const h = el.offsetHeight || 64;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };

    setNavH();
    window.addEventListener("resize", setNavH);
    return () => window.removeEventListener("resize", setNavH);
  }, []);

  
  // Scroll con offset cuando hay hash (#seccion) para que NO lo tape la navbar
  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    if (!id) return;

    let raf1 = 0;
    let raf2 = 0;

    const scrollWithOffset = () => {
      const target = document.getElementById(id);
      if (!target) return;

      const navH =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
          10
        ) || headerRef.current?.offsetHeight || 64;

      const extra = 12; // airecito debajo de la navbar
      const top =
        target.getBoundingClientRect().top + window.scrollY - navH - extra;

      window.scrollTo({ top, behavior: "smooth" });
    };

    // 2 rafs = esperamos layout/paint, mejora mucho en mobile
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollWithOffset);
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [location.pathname, location.hash]);

  //const { user: usuario } = useAuth();


    return (
    <header ref={headerRef} data-navbar className="sticky top-0 z-[9999] w-full
      bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70
      border-b border-slate-200 shadow-sm">
      <div className="w-full px-2 sm:px-4 h-16 flex items-center justify-between">


        {/* Logo */}
        <a href="https://queesia.com" className="flex items-center gap-2">
        <img src="/logo-bg.png" alt="Queesia" className="w-8 h-8" />
        <span className="font-raleway italic font-bold text-[30px] leading-[36px]">
          <span className="text-black">quees</span>
          <span className="text-blue-600">ia</span>
          {rol === "experto" && (
            <span className="ml-1 not-italic font-semibold text-black text-[18px] align-middle">
              expertos
            </span>
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
            href="https://queesia.com/blog"
          className="text-slate-700 hover:text-slate-900 transition-colors"
          >
          Blog
        </a>
        
        <a
            href="https://queesia.com/biblioteca/"
          className="text-slate-700 hover:text-slate-900 transition-colors"
          >
          Biblioteca
        </a>
        <a
            href="https://queesia.com/ofertas-educativas/"
          className="text-slate-700 hover:text-slate-900 transition-colors"
          >
          Ofertas educativas
        </a>

          <a
            href="https://queesia.com/nosotros/"
            className="text-slate-700 hover:text-slate-900 transition-colors"
          >
            Sobre Nosotros
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
