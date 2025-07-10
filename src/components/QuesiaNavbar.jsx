// src/components/QuesiaNavbar.jsx

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import MobileMenu from "../components/MobileMenu.jsx";

export default function QuesiaNavbar() {
  const [usuario, setUsuario] = useState(null);
  const correosAdmin = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];
  const esAdmin = usuario && correosAdmin.includes(usuario.email);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await signOut(auth);
    setUsuario(null);
    alert("Sesión cerrada correctamente");
    window.location.href = "/";
  };

  return (
    <header className="relative w-full flex items-center justify-between px-6 py-4 bg-primary-soft shadow-sm z-50">
      {/* Logo */}
      <a href="/" className="flex items-center gap-2 font-bold italic text-2xl">
        <img src="/logo-bg.png" alt="Quesia" className="w-8 h-8" />
        <span>
          <span className="text-black font-sans">quees</span>
          <span className="text-primary font-sans">ia</span>
        </span>
      </a>

      {/* Menú Desktop */}
      <div className="hidden md:flex items-center font-sans gap-4">
        <nav className="flex items-center gap-8 text-lg">
          <a href="https://queesia.com/#catalogo" className="text-black hover:text-blue-600 transition-colors duration-200">
            Catálogo
          </a>
          <a href="https://queesia.com/casos" className="text-black hover:text-blue-600 transition-colors duration-200">
            Quesos de éxito
          </a>
          <a href="https://expertos.queesia.com" className="text-black hover:text-blue-600 transition-colors duration-200">
            Expertos
          </a>
          <a href="https://queesia.com/acerca" className="text-black hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
            Acerca de 🧀
          </a>
          <a href="https://queesia.com/contacto" className="text-black hover:text-blue-600 transition-colors duration-200">
            Contacto
          </a>
        </nav>

        {/* Estado de sesión */}
        {!usuario ? (
          <a
            href="/login"
            className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-neutral-800 transition"
          >
            Iniciar sesión
          </a>
        ) : (
          <div className="flex items-center gap-3 ml-4">
            {esAdmin && (
              <a
                href="/admin-expertos"
                className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition"
              >
                Queesia Admin 🧀
              </a>
            )}
            <span className="text-sm text-gray-700 max-w-[140px] truncate">{usuario.email}</span>
            <button
              onClick={cerrarSesion}
              className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* Menú móvil */}
      <div className="md:hidden">
        {typeof window !== "undefined" && <MobileMenu />}
      </div>
    </header>
  );
}
