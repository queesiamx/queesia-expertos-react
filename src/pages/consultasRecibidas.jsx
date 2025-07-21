// src/pages/ConsultasRecibidas.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import NavbarExperto from '../components/NavbarExperto';
import { useNavigate } from 'react-router-dom';

export default function ConsultasRecibidas() {
  const [consultas, setConsultas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        try {
          const q = query(
            collection(db, 'consultasModeradas'),
            where('expertoId', '==', user.uid),
            where('aprobada', '==', true)
          );
          const snapshot = await getDocs(q);
          const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setConsultas(lista);
        } catch (error) {
          console.error('Error al cargar consultas:', error);
          toast.error('No se pudieron cargar las consultas.');
        }
        setCargando(false);
      } else {
        toast.error('Debes iniciar sesión.');
      }
    });
    return () => unsubscribe();
  }, []);

  const estados = [
    { label: 'Todas', valor: 'todas' },
    { label: 'Pendientes', valor: 'pendiente' },
    { label: 'Gratis', valor: 'resueltaGratis' },
    { label: 'Pagadas', valor: 'respondida' }
  ];

  const consultasFiltradas = consultas.filter((c) => {
    if (filtroEstado === 'todas') return true;
    if (filtroEstado === 'pendiente') {
      return (c.estado === 'pendiente') || (c.estado === 'resueltaGratis' && !c.respuesta);
    }
    if (filtroEstado === 'resueltaGratis') {
      return c.estado === 'resueltaGratis' && c.respuesta;
    }
    if (filtroEstado === 'respondida') {
      return c.estado === 'respondida';
    }
    return false;
  });

  return (
    <>
      <NavbarExperto />
      <div className="p-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-3xl font-bold mb-6">Consultas Recibidas</h1>

        {/* Botones de filtro */}
        <div className="flex gap-2 flex-wrap mb-6">
          {estados.map(({ label, valor }) => (
            <button
              key={valor}
              onClick={() => setFiltroEstado(valor)}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                filtroEstado === valor
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-gray-600">Cargando consultas...</p>
        ) : consultasFiltradas.length === 0 ? (
          <p className="text-gray-600">No hay consultas en esta categoría.</p>
        ) : (
          <div className="space-y-4">
            {consultasFiltradas.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow border">
                <p className="text-sm text-gray-800">
                  <strong>Consulta:</strong> {c.consulta}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>De:</strong> {c.nombre} ({c.correo})
                </p>
                <p className="text-sm mt-1">
                  <strong>Estado:</strong>{' '}
                  <span
                    className={`font-semibold ${
                      c.estado === 'pendiente'
                        ? 'text-yellow-600'
                        : c.estado === 'resueltaGratis'
                        ? 'text-blue-600'
                        : c.estado === 'respondida'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {c.estado}
                  </span>
                </p>
                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/responder-consulta/${c.id}`)}
                >
                  Responder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
