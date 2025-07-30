// src/components/NavbarUsuario.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function NavbarUsuario() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
            src={user?.photoURL || "/avatar-default.png"}
            alt="avatar"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border z-50 text-sm">
            <div className="px-4 py-2 font-semibold text-gray-700 border-b">
              Mi perfil
            </div>
            <Link
              to="/mis-consultas"
              className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
              onClick={() => setShowMenu(false)}
            >
              Mis consultas
            </Link>
            <Link
              to="/MisContenidos"
              className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
              onClick={() => setShowMenu(false)}
            >
              Mis contenidos
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
