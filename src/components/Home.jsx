import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebase';
import Footer from '../components/Footer';

const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Escuchar sesión activa
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        if (adminEmails.includes(user.email)) {
          setIsAdmin(true);
          navigate('/admin-expertos'); // Redirigir si es admin
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Función de login
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Usuario autenticado:', result.user);
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-primary-soft">
      <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col items-center justify-center text-center px-4 font-sans">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-default mb-4 animate-fade-in">
          Bienvenido a la Sección de Expertos IA
        </h1>

        <p className="mb-6 text-default-soft text-lg max-w-3xl px-4">
          Consulta el directorio de especialistas que puedes contactar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => navigate('/expertos')}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-strong transition"
          >
            Ver Expertos
          </button>

          <button
            onClick={() => navigate('/registro')}
            className="bg-white text-default border border-default px-6 py-2 rounded hover:bg-default-soft transition"
          >
            Soy Experto <span className="text-sm text-default-soft">(registrarse)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLogin}
            className="bg-black text-white px-6 py-2 rounded hover:bg-neutral-800 transition"
          >
            Queesia Admin 🧀
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
}
