import React, { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../constants/roles"; // 👈 Asegúrate de tener esta línea arriba
import toast from "react-hot-toast";
import QuesiaNavbar from "../components/QuesiaNavbar";
import Footer from "../components/Footer";
import RedirectByRole from "../components/RedirectByRole";

const Login = () => {
  const [loginExitoso, setLoginExitoso] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const iniciarSesion = async () => {
      const provider = new GoogleAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userRef = doc(db, "users", user.uid);
        const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

        // 🔒 Si ya existe en /users, no hacemos nada más
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          toast.success("Bienvenido de nuevo 🎉");
          setLoginExitoso(true);
          return;
        }

        // ✅ Si es administrador
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

        // ✅ Si es experto ya aprobado (verifica en collection /experts)
        const expertRef = doc(db, "experts", user.uid);
        const expertSnap = await getDoc(expertRef);

        if (expertSnap.exists()) {
          const data = expertSnap.data();

          // Si está aprobado y tiene datos suficientes
          if (data.aprobado === true && data.nombre && data.especialidad) {
            await setDoc(userRef, {
              nombre: data.nombre || "",
              correo: user.email,
              rol: "experto",
                aprobado: true, // ✅ Añade este campo
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

        // ✅ Si no es admin ni experto → lo registramos como usuario común
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
      }
    };

    iniciarSesion();
  }, [navigate]);

  return (
    <>
      <QuesiaNavbar />
      <main className="min-h-screen bg-primary-soft flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Soy experto 🧐
          </h2>
          <p className="text-gray-600 mb-6">
            Conectando con tu cuenta de Google... ⏳
          </p>
        </div>
        {loginExitoso && <RedirectByRole />}
      </main>
      <Footer />
    </>
  );
};

export default Login;
