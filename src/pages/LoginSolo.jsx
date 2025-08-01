// src/pages/LoginSolo.jsx
import { useEffect } from "react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginSolo() {
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

        if (data.rol !== "experto") {
          toast.error("Este login es exclusivo para expertos.");
          return;
        }

        if (data.aprobado) {
          toast.success("Bienvenido de nuevo, experto aprobado.");
          navigate("/expert-dashboard");
        } else {
          toast("Tu cuenta aún no ha sido aprobada por el equipo de Queesia.");
        }
      } else {
        toast("Primero completa tu registro como experto.");
        navigate("/registro");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Ocurrió un error al iniciar sesión.");
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <p className="text-lg font-medium mb-4">Redirigiéndote al login de Google...</p>
      <p className="text-sm text-gray-600">Si no se abre automáticamente, recarga la página.</p>
    </div>
  );
}
