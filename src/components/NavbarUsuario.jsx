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
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
