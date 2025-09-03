import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";
import RedirectByRole from "../components/RedirectByRole";
import { useAuth } from "../hooks/useAuth"; // ✅ Asegúrate que el hook existe

const Login = () => {
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Hook para saber si ya hay sesión

  useEffect(() => {
    if (user) {
      navigate("/dashboard"); // ✅ Redirección automática si ya hay sesión
    }
  }, [user, navigate]);

  const iniciarSesion = async () => {
    setCargando(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, "users", user.uid);
      const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        toast.success("Bienvenido de nuevo 🎉");
        setLoginExitoso(true);
        return;
      }

      if (correosAdmin.includes(user.email)) {
        await setDoc(userRef, {
          nombre: user.displayName || "",
          correo: user.email,
          rol: "admin",
          createdAt: serverTimestamp(),
        });
        toast.success("Bienvenido administrador 🧀");
        setLoginExitoso(true);
        return;
      }

      const expertRef = doc(db, "experts", user.uid);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const data = expertSnap.data();
        if (data.aprobado === true && data.nombre && data.especialidad) {
          await setDoc(userRef, {
            nombre: data.nombre || "",
            correo: user.email,
            rol: "experto",
            aprobado: true,
            createdAt: serverTimestamp(),
          });
          toast.success("Bienvenido experto 😎");
          setLoginExitoso(true);
          return;
        } else {
          toast("Tu cuenta fue registrada. Completa tu perfil para continuar.");
          navigate("/registro");
          return;
        }
      }

      await setDoc(userRef, {
        nombre: user.displayName || "",
        correo: user.email,
        rol: "usuario",
        createdAt: serverTimestamp(),
      });

      toast.success("Registro exitoso como usuario 🎉");
      setLoginExitoso(true);

    } catch (error) {
      console.error("Error con Google Login", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("No se pudo iniciar sesión con Google.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <UnifiedNavbar />

      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Soy experto 🧐
          </h2>

          {/* ✅ Mostrar botón solo si no hay sesión */}
          {!user ? (
            <button
              onClick={iniciarSesion}
              disabled={cargando}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              {cargando ? "Conectando..." : "Conectar con Google"}
            </button>
          ) : (
            <p className="text-sm text-gray-600 mt-4">
              Ya has iniciado sesión. Redirigiéndote al panel...
            </p>
          )}
        </div>

        {loginExitoso && <RedirectByRole />}
      </main>
      <Footer />
    </>
  );
};

export default Login;
