// src/components/LoginButton.jsx

import React, { useEffect, useState } from "react";
import { db, auth, googleProvider } from '../../lib/firebaseConfig';
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { menuControl } from "../hooks/useMenuControl";

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);

  const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const unsubscribe = menuControl.subscribe((menu) => {
      if (menu !== "avatar") setOpenMenu(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const token = await user.getIdToken();

      // Guarda sesión local
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify({
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      }));

      // Flujo 1: Admin
      if (adminEmails.includes(user.email)) {
        window.location.href = "/admin-expertos";
        return;
      }

      // Flujo 2: Verificar si es experto registrado
      const expertRef = doc(db, "experts", user.uid);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const data = expertSnap.data();
        if (data.aprobado === true && data.nombre && data.especialidad) {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/registro";
        }
      } else {
        // Flujo 3: Usuario nuevo
        window.location.href = "/registro";
      }

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
      menuControl.openMenu("avatar");
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
            <div className="px-4 py-2 text-sm text-gray-800 truncate">
              {user.name?.split(" ")[0]}
            </div>
            <a
              href="/mis-consultas"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
            >
              Mis consultas
            </a>
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
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center gap-2 bg-black text-white text-sm font-medium px-3 py-2 rounded-xl shadow hover:bg-gray-800 transition duration-300 border border-transparent hover:border-white"
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5 md:w-4 md:h-4"
        onError={(e) => (e.target.style.display = "none")}
      />
      <span className="hidden md:inline">Iniciar sesión</span>
    </button>
  );
}
