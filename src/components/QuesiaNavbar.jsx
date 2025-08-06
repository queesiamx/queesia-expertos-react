import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import MobileMenu from "./MobileMenu";
import LoginButton from "./LoginButton";
import UserMenu from "./UserMenu";
import { useAuth } from "../hooks/useAuth";

export default function QuesiaNavbar() {
  const [usuario, setUsuario] = useState(null);
  const { rol, aprobado } = useAuth();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUsuario({
        ...user,
        // no forzamos null, dejamos que useAuth lo complete después
        rol: rol || user.rol || undefined,
        aprobado: aprobado ?? user.aprobado
      });
    } else {
      setUsuario(null);
    }
  });
  return () => unsubscribe();
}, [rol, aprobado]);

  return (
    <header className="sticky top-0 z-[9999] w-full bg-primary-soft shadow-sm overflow-visible">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <a
          href="https://queesia.com"
          className="flex items-center gap-2 font-bold italic text-2xl"
        >
          <img src="/logo-bg.png" alt="Quesia" className="w-8 h-8" />
          <span>
            <span className="text-black font-sans">quees</span>
            <span className="text-primary font-sans">ia</span>
          </span>
        </a>

        {/* Menú Desktop */}
        <div className="hidden md:flex items-center font-sans gap-6">
          {/* Catálogo */}
          <div className="relative group">
            <a
              href="https://queesia.com/#catalogo"
              className="text-black hover:text-blue-600 transition-colors duration-200"
            >
              Catálogo
            </a>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 w-48">
              <a
                href="https://queesia.com/#catalogo"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Todas las apps
              </a>
              <a
                href="https://queesia.com/categorias"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Categorías
              </a>
            </div>
          </div>

          {/* Casos de éxito */}
          <div className="relative group">
            <a
              href="https://queesia.com/casos"
              className="text-black hover:text-blue-600 transition-colors duration-200"
            >
              Casos de éxito
            </a>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 w-56">
              <a
                href="https://queesia.com/casos"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Todos los casos
              </a>
              <a
                href="https://queesia.com/casos#categoria-publico"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Sector público
              </a>
              <a
                href="https://queesia.com/casos#categoria-privado"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Sector privado
              </a>
            </div>
          </div>

          {/* Expertos */}
          <div className="relative group">
            <a
              href="https://expertos.queesia.com"
              className="text-black hover:text-blue-600 transition-colors duration-200"
            >
              Expertos
            </a>
            <div className="absolute hidden group-hover:block bg-white shadow-lg rounded-md mt-2 w-48">
              <a
                href="https://expertos.queesia.com/expertos"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Ver expertos
              </a>
              <a
                href="https://expertos.queesia.com/registro"
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Registrarse como experto
              </a>
            </div>
          </div>

          {/* Acerca de */}
          <a
            href="https://queesia.com/nosotros/"
            className="text-black hover:text-blue-600 transition-colors duration-200 flex items-center gap-1"
          >
            Acerca de 🧀
          </a>

          {/* Contacto */}
          <a
            href="https://queesia.com/contacto"
            className="text-black hover:text-blue-600 transition-colors duration-200"
          >
            Contacto
          </a>

          {/* Estado de sesión */}
          <div className="ml-4">
            {usuario ? <UserMenu usuario={usuario} /> : <LoginButton />}
          </div>
        </div>

        {/* Menú móvil */}
        <div className="md:hidden">
          {typeof window !== "undefined" && <MobileMenu />}
        </div>
      </div>
    </header>
  );
}
