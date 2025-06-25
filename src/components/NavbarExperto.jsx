// src/components/NavbarExperto.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { toast } from "react-hot-toast";

export default function NavbarExperto() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Sesión cerrada correctamente.");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión.");
    }
  };

  return (
    <nav className="bg-yellow-300 px-6 py-4 font-sans flex justify-between items-center">
      {/* Logo */}
<a href="/" className="flex items-center gap-2 text-[30px] font-bold italic">
  <img src="/logo-bg.png" alt="Logo Queesia" className="h-8 w-8" />
  <span>
    <span className="text-black">quees</span>
    <span className="text-blue-600">ia</span>
    <span className="text-blue-600">exp</span>
    <span className="text-black">ertos</span>
  </span>
</a>

      {/* Menú */}
      <div className="space-x-6 flex items-center">
        <a
          href="/dashboard"
          className="text-[24px] font-normal text-[rgb(3,8,19)] hover:text-blue-600 hover:underline transition"
        >
          Inicio
        </a>

                <a
          href="/consultas-recibidas"
          className="text-[24px] font-normal text-[rgb(3,8,19)] hover:text-blue-600 hover:underline transition"
        >
          Consultas
        </a>

        {/* <a
          href="/perfil"
          className="text-[24px] font-normal text-[rgb(3,8,19)] hover:text-blue-600 hover:underline transition"
        >
          Perfil
        </a> */}

        {/* <a
          href="/servicios"
          className="text-[24px] font-normal text-[rgb(3,8,19)] hover:text-blue-600 hover:underline transition"
        >
          Servicios
        </a> */}

        <button
          onClick={handleLogout}
          className="bg-black text-white px-4 py-1.5 rounded hover:bg-gray-800 transition"
        >
          Cerrar sesión 🔒
        </button>
      </div>
    </nav>
  );
}
