// src/pages/LoginUsuarios.jsx
import React from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Correos autorizados como administradores
const adminEmails = ["admin@queesia.com", "soporte@queesia.com"];

export default function LoginUsuarios() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.aprobado) {
          toast.success("Bienvenido de nuevo.");
          if (data.rol === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          toast("Tu cuenta aún no ha sido aprobada.");
        }
      } else {
        // Detectar si es administrador por correo
        const rol = adminEmails.includes(user.email) ? "admin" : "usuario";

        // Crear nuevo usuario con aprobado en true
        await setDoc(docRef, {
          nombre: user.displayName,
          email: user.email,
          rol,
          aprobado: true,
          creadoEn: serverTimestamp(),
          fotoPerfil: user.photoURL // 👈 AGREGA ESTA LÍNEA
        });

        toast.success("Registro exitoso. Bienvenido.");
        if (rol === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Error de login:", error);
      toast.error("Error al iniciar sesión.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
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
