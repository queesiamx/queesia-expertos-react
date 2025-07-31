// src/components/QuesiaNavbar.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";
import MobileMenu from "./MobileMenu";

export default function QuesiaNavbar() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const { rol, aprobado, loading } = useAuth();

  const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];
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

 const irADashboard = () => {
  const rolSeguro = rol || "";
  const aprobadoSeguro = aprobado ?? false;

  console.log("➡️ Ejecutando irADashboard");
  console.log("Rol detectado:", rolSeguro);
  console.log("Aprobado:", aprobadoSeguro);
  console.log("esAdmin:", esAdmin);

  if (esAdmin || rolSeguro === ROLES.ADMIN) {
    navigate("/admin-expertos");
  } else if (rolSeguro === ROLES.EXPERTO && aprobadoSeguro) {
    navigate("/expert-dashboard");
  } else if (rolSeguro === ROLES.USUARIO) {
    navigate("/mis-consultas");
  } else {
    alert("Tu cuenta aún no tiene un rol asignado o está pendiente de aprobación.");
  }
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
          <a href="https://queesia.com/nosotros/" className="text-black hover:text-blue-600 transition-colors duration-200 flex items-center gap-1">
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
            className="flex items-center justify-center w-10 h-10 bg-black rounded-full shadow-md hover:shadow-lg border border-blue-300 transition"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          </a>
        ) : (
          <div className="flex items-center gap-3 ml-4">
            <button
              onClick={loading ? undefined : irADashboard}
              disabled={loading}
              className={`text-xs px-3 py-1 rounded transition ${
                loading
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-yellow-500 hover:bg-yellow-600 text-black"
              }`}
            >
              {loading ? "Cargando..." : "Mi panel"}
            </button>
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
