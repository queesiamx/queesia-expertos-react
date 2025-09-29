import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

// Detecta navegador móvil
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function Login() {
  const [loginExitoso, setLoginExitoso] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth(); // sesión global

  // Lógica post-login (se usa tanto con popup como con redirect)
  const postLoginFlow = async (firebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

    // Ya existe en users → bienvenida
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

    // ¿Es experto ya registrado?
    const expertRef = doc(db, "experts", firebaseUser.uid);
    const expertSnap = await getDoc(expertRef);
    if (expertSnap.exists()) {
      const data = expertSnap.data() || {};
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

  // Redirección solo cuando YA hay user y se completó postLoginFlow
  useEffect(() => {
    if (user && loginExitoso) {
      navigate("/dashboard", { replace: true }); // o deja que tu layout redirija por rol
    }
  }, [user, loginExitoso, navigate]);

  // Procesa retorno de signInWithRedirect (móvil)
  useEffect(() => {
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (!res?.user) return;
        await postLoginFlow(res.user);
      } catch (e) {
        console.error(e);
        toast.error("No se pudo completar el inicio de sesión móvil.");
      }
    })();
  }, []);

  const iniciarSesion = async () => {
    setCargando(true);
    const provider = new GoogleAuthProvider();
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return; // volverá por getRedirectResult()
      }
      const result = await signInWithPopup(auth, provider);
      await postLoginFlow(result.user);
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
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Soy experto 🧐
        </h2>

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
    </main>
  );
}
