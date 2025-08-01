import React, { useState, useEffect, useRef } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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



export default function GoogleLoginWithRole() {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = async (role) => {
    setSelectedRole(role);
    setLoading(true);
    setOpenMenu(false);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.rol !== role) {
          toast.error("Tu cuenta ya está registrada con otro rol.");
          setLoading(false);
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
        className="bg-black p-2 rounded-full border hover:shadow-md transition"
      >
        <FcGoogle size={24} />
      </button>

      <div
        className={`absolute right-0 mt-2 w-44 bg-white shadow-md border rounded z-50 transform transition-all duration-200 ease-out origin-top ${
          openMenu
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {Object.keys(ROLES).map((role) => (
        <button
            key={role}
            className="flex items-center justify-between w-full text-left px-4 py-2 hover:bg-gray-100"
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
