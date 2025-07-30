import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import Footer from '../components/Footer';
import QuesiaNavbar from "../components/QuesiaNavbar";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [visitas, setVisitas] = useState(null);

  // 🔄 Contador de visitas + lectura
  useEffect(() => {
    const contarYLeerVisita = async () => {
      try {
        const docRef = doc(db, 'visitCounts', 'expertosHome');
        await updateDoc(docRef, {
          count: increment(1),
        });

        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setVisitas(snap.data().count);
        }
      } catch (error) {
        console.error('Error al contar visita:', error);
      }
    };

    contarYLeerVisita();
  }, []);

  // 👤 Detectar usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <QuesiaNavbar />
      <div className="min-h-screen bg-primary-soft flex flex-col justify-between">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center px-4 py-24 font-sans">
          
          {/* Título principal */}
          <h1 className="text-5xl md:text-6xl font-bold italic text-center mb-4 animate-fade-in">
            ¿Quiénes son <span className="text-blue-500 italic">los expertos</span>?
          </h1>

          <p className="mb-10 text-lg text-default-soft max-w-2xl text-center">
            Descubre a los especialistas que pueden ayudarte en tus proyectos de IA.
          </p>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button
              onClick={() => navigate('/expertos')}
              className="bg-primary hover:bg-primary-strong text-white font-medium px-6 py-3 rounded-lg transition"
            >
              Ver expertos
            </button>

            <button
              onClick={() => navigate('/registro')}
              className="bg-white text-default border border-default px-6 py-3 rounded-lg hover:bg-default-soft transition"
            >
              Quiero ser experto <span className="text-sm text-default-soft">(registrarse)</span>
            </button>

            <button
              onClick={() => navigate('/login')}
              className="bg-default text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 rounded-lg hover:opacity-90 transition"
            >
              Soy experto (ingresar)
            </button>
          </div>

          {/* Logo derretido */}
          <img
            src="/logo-bg.png"
            alt="Logo Quesia"
            className="mt-6 w-64 h-auto animate-fade-in"
          />
        </div>

        {/* 👁️ Contador visible */}
        <p className="text-center text-sm text-gray-500 mb-2">
          Visitas: {visitas ?? '...'}
        </p>

        <Footer />
      </div>
    </>
  );
}
