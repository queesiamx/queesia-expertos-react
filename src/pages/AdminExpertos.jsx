// src/pages/AdminExpertos.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ExpertDetailAdmin from '../components/ExpertDetailAdmin';
import UnifiedNavbar from "../components/UnifiedNavbar";
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import Footer from "../components/Footer";

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
  <div className="relative min-h-screen font-sans bg-[#f7fafc]">
    {/* Banda superior desactivada o transparente */}
    <div className="absolute inset-x-0 top-0 h-24 bg-transparent pointer-events-none" />

      <Toaster position="top-right" />
      <UnifiedNavbar onLogout={handleLogout} />

    {/* barra de chips fija bajo el navbar */}
    <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-3">
          {/* Buscador compacto */}
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="min-w-[260px] md:min-w-[320px] px-4 h-10 rounded-full bg-white text-default placeholder:text-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          {/* Chips con contador */}
          <button
            onClick={() => setFiltro('todos')}
            className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition
              ${filtro === 'todos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-default border border-slate-200 hover:bg-slate-50'}`}
          >
            Expertos
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                filtro === 'todos' ? 'bg-white/20' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {expertos.length}
            </span>

          </button>


                  <button
            onClick={() => setFiltro('aprobados')}
            className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition
              ${filtro === 'aprobados'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-default border border-slate-200 hover:bg-slate-50'}`}
          >
            Aprobados
            <span
              className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                filtro === 'aprobados' ? 'bg-white/20' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {expertos.filter(e => e.aprobado).length}
            </span>

          </button>

            <button
            onClick={() => setFiltro('pendientes')}
            className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition
              ${filtro === 'pendientes'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-default border border-slate-200 hover:bg-slate-50'}`}
          >
            Pendientes
          <span
            className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
              filtro === 'pendientes' ? 'bg-white/20' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {expertos.filter(e => !e.aprobado).length}
          </span>

          </button>

          <div className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center">
            Consultas pendientes
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-rose-100 text-rose-700">
              {consultasContadores.pendientes}
            </span>
          </div>

          <div className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center">
            Resueltas gratis
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
              {consultasContadores.resueltasGratis}
            </span>
          </div>
          <div className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center">
            Con cobro
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-blue-100 text-blue-700">
              {consultasContadores.conCobro}
            </span>
          </div>

          <div className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center">
            Servicios ofrecidos
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-violet-100 text-violet-700">
              {totalServicios}
           </span>
          </div>

          <div className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center">
            Cursos ofrecidos
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-amber-100 text-amber-700">
              {totalCursos}
            </span>
          </div>
        </div>
     </div>
    </div>


       {/* Contenido principal */}
    <div className="max-w-6xl mx-auto px-4 pt-10">
      <h1 className="text-[28px] md:text-3xl font-extrabold tracking-snugger text-default mb-5 font-montserrat">
        Panel de Administración de Expertos
      </h1>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-sm text-slate-500">Expertos activos</div>
          <div className="mt-1 text-2xl font-bold text-default">{expertos.length}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-sm text-slate-500">Pendientes por revisar</div>
          <div className="mt-1 text-2xl font-bold text-default">{expertos.filter(e => !e.aprobado).length}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-sm text-slate-500">Consultas abiertas</div>
          <div className="mt-1 text-2xl font-bold text-default">{consultasContadores.pendientes}</div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="text-sm text-slate-500">Ingresos (mes)</div>
          <div className="mt-1 text-2xl font-bold text-default">—</div>
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
                className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                 onClick={() => setSeleccionado(exp)}
               >
                {/* Header compacto */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200 ring-2 ring-white shadow-sm shrink-0" />
                    <div>
                      <h3 className="text-[15px] font-semibold text-default leading-tight">{exp.nombre}</h3>
                      <div className="text-sm text-blue-700">{exp.especialidad || '—'}</div>
                    </div>
                  </div>
                  {exp.aprobado && (
                    <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                      VERIFICADO
                    </span>
                  )}
                </div>

                {/* meta/rating (placeholder ligero) */}
                <div className="mt-2 flex items-center gap-1 text-[13px] text-slate-600">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400"><path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <span>—</span>
                  <span className="text-slate-400">•</span>
                  <span>Responde rápido</span>
                </div>

                {/* Footer: CTA + favorito */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setSeleccionado(exp)}
                    className="flex-1 h-10 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Ver Perfil
                  </button>
                  <button
                    type="button"
                    className="h-10 w-10 grid place-items-center rounded-lg border border-slate-300 text-slate-600 hover:border-blue-300"
                    aria-label="Guardar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                      <path fill="currentColor" d="M16.5,3c-1.74,0-3.41,0.81-4.5,2.09C10.91,3.81,9.24,3,7.5,3C4.42,3,2,5.42,2,8.5
                      c0,3.78,3.4,6.86,8.55,11.54L12,21.35l1.45-1.32C18.6,15.36,22,12.28,22,8.5C22,5.42,19.58,3,16.5,3z"/>
                    </svg>
                  </button>
                </div>
               </div>
             ))}
         </div>
       )}
     </div>
     <Footer />  {/* ← insértalo aquí */}
   </div>
)}