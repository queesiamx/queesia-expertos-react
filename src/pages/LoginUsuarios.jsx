// src/pages/LoginUsuarios.jsx
import React from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginUsuarios() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docSnap = await getDoc(doc(db, "users", user.uid));

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.aprobado) {
          toast.success("Bienvenido de nuevo.");
          navigate("/dashboard");
        } else {
          toast("Tu cuenta aún no ha sido aprobada.");
        }
      } else {
        toast("Completa tu registro primero.");
        navigate("/registro");
      }
    } catch (error) {
      console.error("Error de login:", error);
      toast.error("Error al iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-soft px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-sm w-full text-center">
        <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
        <p className="text-gray-600 mb-6">Accede con tu cuenta de Google</p>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-10 h-10 bg-black rounded-full shadow-md hover:shadow-lg border border-blue-300 transition"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
        </button>

        <span className="text-sm text-gray-700 mt-3 block">Continuar con Google</span>
      </div>
    </div>
  );
}
