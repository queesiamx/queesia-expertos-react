// src/components/UnifiedNavbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import LoginButton from "./LoginButton";
import MobileMenu from "./MobileMenu";
import UserMenu from "./UserMenu";
import toast from "react-hot-toast";

export default function UnifiedNavbar() {
  const [usuario, setUsuario] = useState(null);
  const { rol } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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

          <div className="relative group ">
          <a href="https://expertos.queesia.com" className="text-slate-700 hover:text-slate-900 transition-colors">
            Expertos
          </a>
          {/* Dropdown */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full hidden
                      group-hover:block group-focus-within:block z-50
                      bg-white border border-slate-200 shadow-lg rounded-xl p-2 w-56"
          >

            
          <a
            href="#filtros"
            className= "text-slate-700 hover:text-slate-900 transition-colors">
            Explorar Expertos
          </a>
          <a
            href="/registro"
            className="text-slate-700 hover:text-slate-900 transition-colors">
            Convertirme en un Experto
          </a>
        </div>
      </div>

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
          {usuario ? (
            <UserMenu usuario={usuario} handleLogout={handleLogout} />
          ) : (
            <>
              <LoginButton />
              <Link
                to="/registro"
                className="btn btn-emerald btn-lg">

                Ser Experto
              </Link>
            </>
          )}
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          <MobileMenu handleLogout={handleLogout} />
        </div>
      </div>
    </header>
  );
}
