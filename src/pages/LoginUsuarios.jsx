import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";

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

export default function LoginUsuarios() {
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
    try {
      await setPersistence(auth, browserLocalPersistence);

      // Guarda rol solicitado (default USUARIO)
      const roleParam = (params.get("role") || "USUARIO").toUpperCase();
      localStorage.setItem("pendingRole", roleParam);

      // Móvil: redirect (pero evita relanzar si ya vienes de uno)
      if (isMobile && !isReturningFromFirebaseRedirect()) {
        navigate("/post-auth", { replace: true });
        setTimeout(() => signInWithRedirect(auth, provider), 0);
        return;
      }

      // Desktop: popup
      const res = await signInWithPopup(auth, provider);
      const u = res.user;
      const token = await u.getIdToken();
      localStorage.setItem("authToken", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: u.uid,
          name: u.displayName,
          email: u.email,
          photo: u.photoURL,
        })
      );
      window.location.replace("/post-auth");
    } catch (e) {
      console.error("[LoginUsuarios] error:", e);
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
