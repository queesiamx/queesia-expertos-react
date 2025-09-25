import React, { useState, useEffect, useRef } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const ROLES = {
  admin: "/admin-expertos",
  experto: "/dashboard",
  usuario: "/mis-consultas",
};
const roleLabels = {
  admin: "🛸 Soy admin",
  experto: "🧐 Soy experto",
  usuario: "🧑‍💻 Soy usuario",
};

// Detecta móvil
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function GoogleLoginWithRole() {
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lógica común tras login (popup o redirect)
  const processUser = async (user, role) => {
    if (!role || !ROLES[role]) {
      toast.error("Selecciona un rol válido.");
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data.rol !== role) {
        toast.error("Tu cuenta ya está registrada con otro rol.");
        return;
      }
    } else {
      await setDoc(userRef, {
        nombre: user.displayName || "",
        email: user.email,
        rol: role,
        aprobado: role === "experto" ? false : true,
        creado: serverTimestamp(),
      });
    }

    navigate(ROLES[role]);
  };

  // Procesa el regreso del redirect (móvil)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (res) => {
        if (!res) return;
        setLoading(true);
        try {
          const role = localStorage.getItem("pendingRole") || "usuario";
          localStorage.removeItem("pendingRole");
          await processUser(res.user, role);
        } catch (e) {
          console.error(e);
          toast.error("No se pudo completar el inicio de sesión.");
        } finally {
          setLoading(false);
        }
      })
      .catch((e) => console.error("getRedirectResult error:", e));
  }, []);

  const handleLogin = async (role) => {
    setOpenMenu(false);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      if (isMobile) {
        localStorage.setItem("pendingRole", role);
        await signInWithRedirect(auth, provider);
        return; // vuelve por getRedirectResult
      }
      const { user } = await signInWithPopup(auth, provider);
      await processUser(user, role);
    } catch (error) {
      console.error(error);
      toast.error("Error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setOpenMenu(!openMenu)}
        disabled={loading}
        className="bg-black p-2 rounded-full border hover:shadow-md transition disabled:opacity-60"
        aria-haspopup="true"
        aria-expanded={openMenu}
      >
        <FcGoogle size={24} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-44 bg-white shadow-md border rounded z-50 transform transition-all duration-200 ease-out origin-top ${
          openMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {Object.keys(ROLES).map((role) => (
          <button
            key={role}
            className="flex items-center justify-between w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-60"
            onClick={() => handleLogin(role)}
            disabled={loading}
          >
            <span>{roleLabels[role]}</span>
            <span className="text-lime-500 text-sm">➝</span>
          </button>
        ))}
      </div>
    </div>
  );
}
