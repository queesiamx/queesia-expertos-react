// src/components/QuesiaNavbar.jsx (o donde sea tu navbar)

import LoginButton from "../components/LoginButton.jsx";
import MobileMenu from "../components/MobileMenu.jsx";

export default function QuesiaNavbar() {
  return (
    <header className="relative w-full flex items-center justify-between px-6 py-4 bg-primary-soft shadow-sm z-50">
      {/* Logo a la izquierda */}
      <a href="/" className="flex items-center gap-2 font-bold italic text-2xl">
        <img src="/logo-bg.png" alt="Quesia" className="w-8 h-8" />
        <span>
          <span className="text-black font-sans ">quees</span>
          <span className="text-primary font-sans" >ia</span>
        </span>
      </a>
          {/* Navegación */}
                <div className="flex items-center font-sans gap-4">
          <nav className="flex items-center gap-8 text-lg">
            <a href="https://queesia.com/#catalogo" className="text-black hover:text-blue-600 transition-colors duration-200">Catálogo</a>
            <a href="https://queesia.com/casos" className="text-black hover:text-blue-600 transition-colors duration-200">Quesos de éxito</a>
            <a href="https://expertos.queesia.com" className="text-black hover:text-blue-600 transition-colors duration-200">Expertos</a>
            <a href="https://queesia.com/acerca" className="text-black hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
              Acerca de 🧀
            </a>
            <a href="https://queesia.com/contacto" className="text-black hover:text-blue-600 transition-colors duration-200">Contacto</a>
          </nav>
          {/* Descomenta si tienes MobileMenu o LoginButton */}
{typeof window !== "undefined" && <LoginButton />}
{typeof window !== "undefined" && <MobileMenu />}

      </div>
    </header>
  );
}