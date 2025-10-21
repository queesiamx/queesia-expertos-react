import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/firebase";

// Detecta móvil
const isMobile =
  typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

// Evita relanzar redirect si ya venimos de uno
function isReturningFromFirebaseRedirect() {
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i) || "";
    if (k.toLowerCase().includes("firebase:redirect")) return true;
  }
  return false;
}

export default function LoginSolo() {
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const provider = new GoogleAuthProvider();

  // Si YA hay sesión real, salta al puente
  useEffect(() => {
    if (auth.currentUser) {
      window.location.replace("/post-auth");
    }
  }, []);

  const iniciarSesion = async () => {
    setCargando(true);

    // Guarda pendingRole si vino por query (default USUARIO)
    const roleParam = (params.get("role") || "USUARIO").toUpperCase();
    localStorage.setItem("pendingRole", roleParam);

    try {
      if (isMobile && !isReturningFromFirebaseRedirect()) {
        navigate("/post-auth", { replace: true });
        setTimeout(() => signInWithRedirect(auth, provider), 0);
        return;
      }
      const result = await signInWithPopup(auth, provider);
      // cache mínimo opcional
      const token = await result.user.getIdToken();
      localStorage.setItem("authToken", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        })
      );
      window.location.replace("/post-auth");
    } catch (e) {
      console.error("LoginSolo error:", e);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <button
        onClick={iniciarSesion}
        disabled={cargando}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        {cargando ? "Conectando..." : "Iniciar con Google"}
      </button>
    </div>
  );
}
