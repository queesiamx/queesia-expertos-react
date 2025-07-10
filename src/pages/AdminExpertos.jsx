// src/pages/AdminExpertos.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ExpertDetailAdmin from '../components/ExpertDetailAdmin';
import AdminNavbar from '../components/AdminNavbar';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';

const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

export default function AdminExpertos() {
  const [expertos, setExpertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [autorizado, setAutorizado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [consultas, setConsultas] = useState([]);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminEmails.includes(user.email)) {
        setAutorizado(true);
      } else {
        navigate('/');
      }
      setVerificado(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const snapshotExpertos = await getDocs(collection(db, 'experts'));
        const listaExpertos = snapshotExpertos.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpertos(listaExpertos);

        const snapshotConsultas = await getDocs(collection(db, 'consultasModeradas'));
        const listaConsultas = snapshotConsultas.docs.map((doc) => doc.data());
        setConsultas(listaConsultas);
      } catch (e) {
        console.error('Error al cargar datos:', e);
      } finally {
        setCargando(false);
      }
    };

    if (autorizado) {
      cargarDatos();
    }
  }, [autorizado]);

  const handleActualizar = (expertoActualizado) => {
    setExpertos((prev) =>
      prev.map((exp) => (exp.id === expertoActualizado.id ? expertoActualizado : exp))
    );
    setSeleccionado(null);
  };

  const handleEliminar = (idEliminado) => {
    setExpertos((prev) => prev.filter((exp) => exp.id !== idEliminado));
    setSeleccionado(null);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (!verificado) {
    return <p className="p-8 font-sans text-default">Verificando acceso...</p>;
  }

  if (!autorizado) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        ⚠️ Acceso restringido. Esta vista es solo para administradores autorizados.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-soft px-6 py-10 font-sans mt-[72px]">
      <div className="fixed inset-0 bg-primary-soft -z-10"></div>

      <Toaster position="top-right" />
      <AdminNavbar onLogout={handleLogout} />

      <h1 className="text-3xl font-bold text-default mb-6 font-montserrat">
        Panel de Administración de Expertos
      </h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-1 rounded-full border ${
            filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-white text-default'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('aprobados')}
          className={`px-4 py-1 rounded-full border ${
            filtro === 'aprobados' ? 'bg-green-600 text-white' : 'bg-white text-default'
          }`}
        >
          Aprobados
        </button>
        <button
          onClick={() => setFiltro('pendientes')}
          className={`px-4 py-1 rounded-full border ${
            filtro === 'pendientes' ? 'bg-yellow-600 text-white' : 'bg-white text-default'
          }`}
        >
          Pendientes
        </button>
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-primary">{expertos.length}</p>
          <p className="text-sm text-default-soft">Expertos totales</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {expertos.filter(e => e.aprobado).length}
          </p>
          <p className="text-sm text-default-soft">Aprobados</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {expertos.filter(e => !e.aprobado).length}
          </p>
          <p className="text-sm text-default-soft">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{consultas.length}</p>
          <p className="text-sm text-default-soft">Consultas pendientes</p>
        </div>
      </div>

      {cargando ? (
        <p className="text-default-soft">Cargando expertos...</p>
      ) : seleccionado ? (
        <ExpertDetailAdmin
          expert={seleccionado}
          onClose={() => setSeleccionado(null)}
          onUpdate={handleActualizar}
          onDelete={handleEliminar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expertos
            .filter((exp) => {
              if (filtro === 'aprobados') return exp.aprobado === true;
              if (filtro === 'pendientes') return exp.aprobado !== true;
              return true;
            })
            .filter((exp) => {
              const texto = `${exp.nombre} ${exp.especialidad}`.toLowerCase();
              return texto.includes(busqueda.toLowerCase());
            })
            .map((exp) => (
              <div
                key={exp.id}
                className="p-4 bg-white rounded-2xl shadow hover:shadow-md cursor-pointer border"
                onClick={() => setSeleccionado(exp)}
              >
                <h3 className="text-lg font-semibold text-default">{exp.nombre}</h3>
                <p className="text-sm text-default-soft">{exp.especialidad}</p>
                <p className={`mt-2 text-xs ${exp.aprobado ? 'text-green-600' : 'text-yellow-600'}`}>
                  {exp.aprobado ? 'Aprobado' : 'Pendiente'}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
