// src/pages/login.jsx  (RTC-CO)
import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  
} from "firebase/auth";

import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";
import RedirectByRole from "../components/RedirectByRole";
import { useAuth } from "../hooks/useAuth";

// Detecta navegador móvil (Android/iOS/iPadOS)
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const Login = () => {
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // sesión global

  // 🔁 Función única con TODA la lógica de post-login (reutilizada en popup y redirect)
  const postLoginFlow = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

    // Si ya existe en "users" → solo bienvenida
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      toast.success("Bienvenido de nuevo 🎉");
      setLoginExitoso(true);
      return;
    }

    // Admin por correo
    if (correosAdmin.includes(firebaseUser.email)) {
      await setDoc(userRef, {
        nombre: firebaseUser.displayName || "",
        correo: firebaseUser.email,
        rol: ROLES.ADMIN,
        createdAt: serverTimestamp(),
      });
      toast.success("Bienvenido administrador 🧀");
      setLoginExitoso(true);
      return;
    }

    // ¿Es experto?
    const expertRef = doc(db, "experts", firebaseUser.uid);
    const expertSnap = await getDoc(expertRef);

    if (expertSnap.exists()) {
      const data = expertSnap.data();
      if (data.aprobado === true && data.nombre && data.especialidad) {
        await setDoc(userRef, {
          nombre: data.nombre || "",
          correo: firebaseUser.email,
          rol: ROLES.EXPERTO,
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

    // Usuario normal
    await setDoc(userRef, {
      nombre: firebaseUser.displayName || "",
      correo: firebaseUser.email,
      rol: ROLES.USUARIO,
      createdAt: serverTimestamp(),
    });

    toast.success("Registro exitoso como usuario 🎉");
    setLoginExitoso(true);
  };

  // ⚠️ Evita redirigir antes de terminar postLoginFlow
  useEffect(() => {
    if (user && loginExitoso) {
      navigate("/dashboard"); // o deja que <RedirectByRole/> te lleve
    }
  }, [user, loginExitoso, navigate]);

  // Procesa el retorno del redirect (móvil)
  /*useEffect(() => {
    getRedirectResult(auth)
      .then(async (res) => {
        if (!res) return; // no venimos de redirect
        setCargando(true);
        try {
          const firebaseUser = res.user;
          await postLoginFlow(firebaseUser);
        } catch (err) {
          console.error("Error post-redirect", err);
          toast.error("No se pudo completar el inicio de sesión.");
        } finally {
          setCargando(false);
        }
      })
      .catch((e) => console.error("getRedirectResult error:", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);*/

  const iniciarSesion = async () => {
    setCargando(true);
    const provider = new GoogleAuthProvider();

    try {
      // En móvil usa redirect (estable)
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return; // volverá por getRedirectResult()
      }

      // En desktop usa popup
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      await postLoginFlow(firebaseUser);

    } catch (error) {
      console.error("Error con Google Login", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("No se pudo iniciar sesión con Google.");
      }
    } finally {
      // En redirect no se ejecuta (salimos de la página), y está bien.
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

          {/* Mostrar botón solo si no hay sesión */}
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
