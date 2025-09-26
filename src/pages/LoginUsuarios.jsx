// src/pages/LoginUsuarios.jsx  (RTC-CO)
import React, { useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithRedirect,
  
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase"; // ⬅️ usa la misma ruta que ya usas en pages
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";

// Detecta móvil (Android/iOS/iPadOS)
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function LoginUsuarios() {
  const [cargando, setCargando] = useState(false);

  // Lógica común post-login para usuarios
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
    // Como es login de USUARIO, manda a sus vistas:
    window.location.href = "/mis-consultas";
  };

  // Procesa retorno de redirect (móvil)
  // 🔸 Centralizado en <AuthRedirectGate />.
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
        return; // volverá por getRedirectResult()
      }
      const result = await signInWithPopup(auth, provider);
      await afterLogin(result.user);
    } catch (e) {
      console.error("LoginUsuarios error:", e);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <UnifiedNavbar />
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Iniciar sesión como usuario
          </h2>
          <button
            onClick={iniciarSesion}
            disabled={cargando}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            {cargando ? "Conectando..." : "Continuar con Google"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
