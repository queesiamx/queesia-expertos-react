// src/components/LoginButton.jsx
import React, { useEffect, useState } from "react";
import { db, auth, googleProvider } from "@/firebase";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { handleLogout } from "@/auth/logout";
import { doc, getDoc } from "firebase/firestore";
import { menuControl } from "../hooks/useMenuControl";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";

 // Detección simple de móvil (con guarda)
 const isMobile =
   typeof navigator !== "undefined" &&
   /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function LoginButton() {
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false); // 🔹 evita taps dobles

  const { rol, aprobado } = useAuth();
  const adminEmails = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const unsubscribe = menuControl.subscribe((menu) => {
      if (menu !== "avatar") setOpenMenu(false);
    });
    return () => unsubscribe();
  }, []);

  // —— Lógica común de post-login (para popup y redirect)
  const afterLogin = async (firebaseUser, selectedRoleFromCaller) => {
    const token = await firebaseUser.getIdToken();
    localStorage.setItem("authToken", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
      })
    );

    // Rol elegido (o recuperado si venimos de redirect)
    const pending = sessionStorage.getItem("pendingRole");
    const selectedRole = selectedRoleFromCaller || pending || "";

    if (pending) sessionStorage.removeItem("pendingRole");

    // Redirecciones por rol
    if (selectedRole === ROLES.ADMIN || adminEmails.includes(firebaseUser.email)) {
      window.location.href = "/admin-expertos";
      return;
    }

    if (selectedRole === ROLES.EXPERTO) {
      const expertRef = doc(db, "experts", firebaseUser.uid);
      const expertSnap = await getDoc(expertRef);
      if (expertSnap.exists() && expertSnap.data().aprobado) {
        window.location.href = "/expert-dashboard";
      } else {
        window.location.href = "/registro";
      }
      return;
    }

    // Por defecto (usuario)
    window.location.href = "/mis-consultas";
  };

 // Procesa el retorno del redirect (móvil)
 useEffect(() => {
   (async () => {
     try {
       const res = await getRedirectResult(auth);
       if (!res?.user) return; // no venimos de redirect
      await afterLogin(res.user); // el rol se toma de pendingRole
     } catch (err) {
       console.error("getRedirectResult error:", err);
     }
   })();
 }, []);


  const handleLogin = async (selectedRole) => {
    if (loading) return;           // 🔹 evita multi-tap
    setLoading(true);
    setRoleMenuOpen(false);        // 🔹 cierra dropdown para que no tape toques
    try {
        if (isMobile) {
        // En móvil: redirect para evitar bloqueos de popup/cookies
        sessionStorage.setItem("pendingRole", selectedRole);
        // En móvil: redirect para evitar bloqueos de popup/cookies        sessionStorage.setItem("pendingRole", selectedRole);
        await signInWithRedirect(auth, googleProvider);
        return; // continúa al volver con getRedirectResult()
      }

      // En desktop: popup
      const result = await signInWithPopup(auth, googleProvider);
      await afterLogin(result.user, selectedRole);
    } catch (error) {
      if (
        error?.code !== "auth/cancelled-popup-request" &&
        error?.code !== "auth/popup-closed-by-user"
      ) {
        console.error("Error al iniciar sesión:", error);
        alert("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    } finally {
     setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const toggleMenu = () => {
    const newState = !openMenu;
    setOpenMenu(newState);
    if (newState) menuControl.openMenu("avatar");
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
          <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
            <div className="px-4 py-2 text-sm text-gray-800 truncate border-b">
              {user.name?.split(" ")[0]}
            </div>

            {rol === ROLES.ADMIN && (
              <a href="/admin-expertos" className="block px-4 py-2 text-sm hover:bg-gray-100">
                Panel de admin
              </a>
            )}
            {rol === ROLES.EXPERTO && aprobado && (
              <a href="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100">
                Mi dashboard
              </a>
            )}
            {rol === ROLES.USUARIO && (
              <a href="/mis-consultas" className="block px-4 py-2 text-sm hover:bg-gray-100">
                Mis consultas
              </a>
            )}

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setRoleMenuOpen(!roleMenuOpen)}
        className="flex items-center justify-center gap-2 bg-black text-white text-sm font-medium px-3 py-2 rounded-xl shadow hover:bg-gray-800 transition duration-300 border border-transparent hover:border-white"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5 md:w-4 md:h-4"
        />
        <span className="hidden md:inline">Iniciar sesión</span>
      </button>

      {roleMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
          <button
            onClick={() => handleLogin(ROLES.ADMIN)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            🛠 Soy admin
          </button>
          <button
            onClick={() => handleLogin(ROLES.EXPERTO)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            👨‍💼 Soy experto
          </button>
          <button
            onClick={() => handleLogin(ROLES.USUARIO)}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            🙋 Soy usuario
          </button>
        </div>
      )}
    </div>
  );
}
