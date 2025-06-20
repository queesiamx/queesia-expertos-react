// src/pages/Login.jsx
import React from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const expertRef = doc(db, "experts", user.uid);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const data = expertSnap.data();

        // Si ya fue aprobado y tiene campos completos, ir al dashboard
        if (data.aprobado === true && data.nombre && data.especialidad) {
          toast.success("Bienvenido, acceso aprobado.");
          navigate("/dashboard");
        } else {
          toast("Tu cuenta fue registrada. Completa tu perfil para continuar.");
          navigate("/registro");
        }
      } else {
        // Crear perfil mínimo si no existía
        await setDoc(expertRef, {
          email: user.email,
          aprobado: false,
          creadoEn: serverTimestamp(),
        });

        toast("Sesión iniciada. Completa tu perfil para continuar.");
        navigate("/registro");
      }
    } catch (error) {
      console.error("Error con Google Login", error);
      toast.error("No se pudo iniciar sesión con Google.");
    }
  };

  return (
    <section className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión como experto</h2>
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-black text-white py-2 rounded hover:bg-black"
      >
        Iniciar sesión con Google
      </button>
    </section>
  );
};

export default Login;
