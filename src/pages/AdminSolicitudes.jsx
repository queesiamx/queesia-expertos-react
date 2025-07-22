// src/pages/AdminSolicitudes.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

export default function AdminSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarSolicitudes = async () => {
      try {
        const q = query(
          collection(db, 'consultasModeradas'),
          where('solicitudCambio.estado', '==', 'pendiente')
        );
        const snapshot = await getDocs(q);
        const lista = await Promise.all(snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          const expertoRef = doc(db, 'experts', data.expertoId);
          const expertoSnap = await getDoc(expertoRef);
          return {
            id: docSnap.id,
            ...data,
            experto: expertoSnap.exists() ? expertoSnap.data() : null
          };
        }));
        setSolicitudes(lista);
        setCargando(false);
      } catch (error) {
        console.error("Error al cargar solicitudes:", error);
        toast.error("No se pudieron cargar las solicitudes.");
      }
    };

    cargarSolicitudes();
  }, []);

  const procesarSolicitud = async (id, aprobar) => {
    try {
      const docRef = doc(db, 'consultasModeradas', id);
      const nuevoEstado = aprobar ? 'aprobada' : 'rechazada';
      const actualizaciones = {
        'solicitudCambio.estado': nuevoEstado,
      };
      const solicitud = solicitudes.find(s => s.id === id)?.solicitudCambio;
      if (aprobar && solicitud?.nuevoTipo) {
        actualizaciones.estado = solicitud.nuevoTipo;
      }
      await updateDoc(docRef, actualizaciones);
      toast.success(`Solicitud ${aprobar ? 'aprobada' : 'rechazada'} correctamente.`);
      setSolicitudes(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      toast.error("Error al procesar la solicitud.");
    }
  };

  const renderNuevoTipo = (nuevoTipo, respuesta) => {
    if (nuevoTipo === 'respondida') {
      if (respuesta?.tipo === 'pago') return 'respondida (de pago)';
      if (respuesta?.tipo === 'gratis') return 'respondida (gratis)';
    }
    return nuevoTipo;
  };

  return (
    <div className="min-h-screen bg-yellow-300 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
          Solicitudes de Cambio de Tipo
        </h1>

        {cargando ? (
          <p className="text-center text-gray-600">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="text-center text-gray-600">No hay solicitudes pendientes.</p>
        ) : (
          <div className="space-y-6">
            {solicitudes.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                {s.experto && (
                  <div className="flex items-center mb-4">
                    <img
                      src={s.experto.fotoPerfilURL}
                      alt={`Foto de ${s.experto.nombre}`}
                      className="w-14 h-14 rounded-full object-cover mr-4"
                    />
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{s.experto.nombre}</p>
                      <p className="text-gray-500 text-sm">{s.experto.especialidad}</p>
                    </div>
                  </div>
                )}

                <div className="text-gray-800 space-y-1">
                  <p><span className="font-semibold">De:</span> {s.nombre} ({s.correo})</p>
                  <p><span className="font-semibold">Consulta:</span> {s.consulta}</p>
                  <p><span className="font-semibold">Justificación:</span> {s.solicitudCambio.justificacion}</p>
                  <p><span className="font-semibold">Tipo actual:</span> {s.estado}</p>
                  <p>
                    <span className="font-semibold">Solicita cambiar a:</span>{' '}
                    {renderNuevoTipo(s.solicitudCambio.nuevoTipo, s.respuesta)}
                  </p>
                </div>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => procesarSolicitud(s.id, true)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Aprobar cambio
                  </button>
                  <button
                    onClick={() => procesarSolicitud(s.id, false)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Rechazar solicitud
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
