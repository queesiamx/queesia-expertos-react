import React, { useEffect, useState } from "react";
import { db, auth, storage, googleProvider } from '../../lib/firebaseConfig'; // ✅ correcta
import { signInWithPopup } from "firebase/auth";
import { menuControl } from "../hooks/useMenuControl";
// ❌ No uses Link en Astro: import { Link } from "react-router-dom";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Escucha si otro menú se abre (hamburguesa, etc.)
    const unsubscribe = menuControl.subscribe((menu) => {
      if (menu !== "avatar") setOpenMenu(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      localStorage.setItem("authToken", await user.getIdToken());
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        })
      );
      window.location.reload();
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const toggleMenu = () => {
    const newState = !openMenu;
    setOpenMenu(newState);
    if (newState) {
      menuControl.openMenu("avatar"); // 👈 Notifica que este menú se abre
    }
  };

  if (user) {
    return (
      <div className="relative">
        <img
          src={user.photo}
          alt={user.name}
          className="w-10 h-10 rounded-full border border-white shadow hover:ring-2 hover:ring-primary transition duration-300 cursor-pointer"
          title={user.name}
          onClick={toggleMenu}
        />
        {openMenu && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-gray-800">
              {user.name.split(" ")[0]}
            </div>

            {/* Enlace interno correcto para Astro */}
            <a
              href="/mis-consultas"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
            >
              Mis consultas
            </a>

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-black text-white text-sm font-medium px-3 py-1.5 rounded-xl shadow hover:bg-gray-800 transition duration-300 border border-transparent hover:border-white"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-4 h-4"
      />
      <span className="hidden md:inline">Iniciar sesión</span>
    </button>
  );
}
