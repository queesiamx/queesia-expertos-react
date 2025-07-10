import React, { useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import QuesiaNavbar from "../components/QuesiaNavbar";
import Footer from "../components/Footer";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const iniciarSesion = async () => {
      const provider = new GoogleAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Correos autorizados como administrador
        const correosAdmin = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];
        if (correosAdmin.includes(user.email)) {
          toast.success("Bienvenido administrador 🧀");
          navigate("/admin-expertos");
          return;
        }

        // Verifica si ya existe en la colección de expertos
        const expertRef = doc(db, "experts", user.uid);
        const expertSnap = await getDoc(expertRef);

        if (expertSnap.exists()) {
          const data = expertSnap.data();
          if (data.aprobado === true && data.nombre && data.especialidad) {
            toast.success("Bienvenido, acceso aprobado.");
            navigate("/dashboard");
          } else {
            toast("Tu cuenta fue registrada. Completa tu perfil para continuar.");
            navigate("/registro");
          }
        } else {
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
        if (error.code !== "auth/popup-closed-by-user") {
          toast.error("No se pudo iniciar sesión con Google.");
        }
        navigate("/");
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
      </main>
      <Footer />
    </>
  );
};

export default Login;
