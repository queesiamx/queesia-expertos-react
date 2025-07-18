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
  const [consultasContadores, setConsultasContadores] = useState({
    pendientes: 0,
    resueltasGratis: 0,
    conCobro: 0,
  });
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
      } catch (e) {
        console.error('Error al cargar expertos:', e);
      } finally {
        setCargando(false);
      }
    };

    if (autorizado) {
      cargarDatos();
    }
  }, [autorizado]);

  // NUEVO: contar estados de consultas
  useEffect(() => {
    const contarConsultas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'consultasModeradas'));
        const todas = snapshot.docs.map(doc => doc.data());

        const pendientes = todas.filter(c => c.estado === 'pendiente').length;
        const gratis = todas.filter(c => c.estado === 'resueltaGratis').length;
        const conPago = todas.filter(c => c.estado === 'requierePago' || c.estado === 'conCobro').length;

        setConsultasContadores({
          pendientes,
          resueltasGratis: gratis,
          conCobro: conPago,
        });

        setConsultas(todas); // también se guarda por si se usa en otra parte
      } catch (error) {
        console.error('Error al contar consultas:', error);
      }
    };

    if (autorizado) {
      contarConsultas();
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

  const totalServicios = expertos.reduce((acc, exp) => acc + (Array.isArray(exp.servicios) ? exp.servicios.length : 0), 0);
  const totalCursos = expertos.reduce((acc, exp) => acc + (Array.isArray(exp.servicios) ? exp.servicios.filter(s => s.tipo === 'curso').length : 0), 0);

  return (
    <div className="min-h-screen bg-primary-soft px-6 py-10 font-sans mt-[72px]">
      <div className="fixed inset-0 bg-primary-soft -z-10"></div>
      <Toaster position="top-right" />
      <AdminNavbar onLogout={handleLogout} />

      <h1 className="text-3xl font-bold text-default mb-6 font-montserrat">
        Panel de Administración de Expertos
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-72 md:w-80 px-3 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />

        <button
          onClick={() => setFiltro('todos')}
          className={`relative px-4 py-2 rounded-full border text-sm font-medium ${
            filtro === 'todos' ? 'bg-blue-600 text-white' : 'bg-white text-default'
          }`}
        >
          Expertos
          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {expertos.length}
          </span>
        </button>

        <button
          onClick={() => setFiltro('aprobados')}
          className={`relative px-4 py-2 rounded-full border text-sm font-medium ${
            filtro === 'aprobados' ? 'bg-green-600 text-white' : 'bg-white text-default'
          }`}
        >
          Aprobados
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {expertos.filter(e => e.aprobado).length}
          </span>
        </button>

        <button
          onClick={() => setFiltro('pendientes')}
          className={`relative px-4 py-2 rounded-full border text-sm font-medium ${
            filtro === 'pendientes' ? 'bg-yellow-500 text-white' : 'bg-white text-default'
          }`}
        >
          Pendientes
          <span className="absolute -top-2 -right-2 bg-yellow-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {expertos.filter(e => !e.aprobado).length}
          </span>
        </button>

        <div className="relative px-4 py-2 rounded-full border bg-white text-default text-sm font-medium">
          Consultas pendientes
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {consultasContadores.pendientes}
          </span>
        </div>

        <div className="relative px-4 py-2 rounded-full border bg-white text-default text-sm font-medium">
          Resueltas gratis
          <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {consultasContadores.resueltasGratis}
          </span>
        </div>

        <div className="relative px-4 py-2 rounded-full border bg-white text-default text-sm font-medium">
          Con cobro
          <span className="absolute -top-2 -right-2 bg-blue-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {consultasContadores.conCobro}
          </span>
        </div>

        <div className="relative px-4 py-2 rounded-full border bg-white text-default text-sm font-medium">
          Servicios ofrecidos
          <span className="absolute -top-2 -right-2 bg-purple-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalServicios}
          </span>
        </div>

        <div className="relative px-4 py-2 rounded-full border bg-white text-default text-sm font-medium">
          Cursos ofrecidos
          <span className="absolute -top-2 -right-2 bg-orange-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalCursos}
          </span>
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
