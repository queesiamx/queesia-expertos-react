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
    <div className="min-h-screen bg-primary-soft flex flex-col justify-between">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center text-center px-4 py-24 font-sans">
        <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-default mb-4 animate-fade-in">
          Bienvenido a la Sección de Expertos IA
        </h1>

        <p className="mb-10 text-lg text-default-soft max-w-2xl">
          Consulta el directorio de especialistas que puedes contactar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate('/expertos')}
            className="bg-primary hover:bg-primary-strong text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Ver Expertos
          </button>

          <button
            onClick={() => navigate('/registro')}
            className="bg-white text-default border border-default px-6 py-3 rounded-lg hover:bg-default-soft transition"
          >
            Soy Experto <span className="text-sm text-default-soft">(registrarse)</span>
          </button>
        </div>

        <div className="mt-2">
          <button
            onClick={handleLogin}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition text-sm"
          >
            Queesia Admin 🧀
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
