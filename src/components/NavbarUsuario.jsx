import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function NavbarUsuario() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-yellow-300 p-4 shadow-md relative z-50">
      <Link to="/" className="text-2xl font-bold text-black">
        quees<span className="text-blue-600">ia</span>
      </Link>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300"
        >
          <img
            src="https://i.pravatar.cc/300" // Puedes reemplazar por foto de usuario en el futuro
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
            <div className="px-4 py-2 text-sm text-gray-700 font-semibold">Mi perfil</div>
            <Link
              to="/mis-consultas"
              className="block px-4 py-2 text-sm hover:bg-gray-100 text-gray-800"
              onClick={() => setShowMenu(false)}
            >
              Mis consultas
            </Link>
            <Link to="/MisContenidos" className="hover:text-blue-400">Mis contenidos</Link>

            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              title="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
            </button>

          </div>
        )}
      </div>
    </nav>
  );
}
