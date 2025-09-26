// src/pages/LoginSolo.jsx  (RTC-CO)
import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase"; // ⬅️ misma ruta que uses en pages

// Detecta móvil
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function LoginSolo() {
  const [cargando, setCargando] = useState(false);

  const afterLogin = async (firebaseUser) => {
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
    // En esta pantalla mandamos a la vista más común de usuario:
    window.location.href = "/mis-consultas";
  };

  /*useEffect(() => {
    getRedirectResult(auth)
      .then(async (res) => {
        if (!res) return;
        setCargando(true);
        try {
          await afterLogin(res.user);
        } finally {
          setCargando(false);
        }
      })
      .catch((e) => console.error("getRedirectResult error:", e));
  }, []);*/

  const iniciarSesion = async () => {
    setCargando(true);
    const provider = new GoogleAuthProvider();
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return;
      }
      const result = await signInWithPopup(auth, provider);
      await afterLogin(result.user);
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
