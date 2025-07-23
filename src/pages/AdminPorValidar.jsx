import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import AdminNavbar from '../components/AdminNavbar';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminPorValidar() {
  const [consultas, setConsultas] = useState([]);

  useEffect(() => {
    const cargarConsultas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'consultasModeradas'));
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        const porValidar = docs.filter(c => c.estado === 'porValidar');
        setConsultas(porValidar);
      } catch (error) {
        toast.error('Error al cargar consultas');
        console.error(error);
      }
    };

    cargarConsultas();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const ref = doc(db, 'consultasModeradas', id);
      await updateDoc(ref, {
        estado: nuevoEstado,
        aprobada: nuevoEstado !== 'rechazada'
      });
      setConsultas(prev => prev.filter(c => c.id !== id));
      toast.success(`Consulta marcada como: ${nuevoEstado}`);
    } catch (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      const date = fecha.seconds
        ? new Date(fecha.seconds * 1000)
        : new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="min-h-screen bg-primary-soft px-6 py-10 mt-[72px] font-sans">
      <Toaster position="top-right" />
      <AdminNavbar />

      <h1 className="text-3xl font-bold text-default mb-6 font-montserrat">
        Respuestas pendientes por validar
      </h1>

      {consultas.length === 0 ? (
        <p className="text-default-soft">No hay respuestas pendientes por validar.</p>
      ) : (
        <div className="grid gap-4">
          {consultas.map((c) => (
            <div key={c.id} className="bg-white p-4 rounded-xl shadow border">
              <p className="text-sm mb-1">
                <strong>Consulta:</strong> {c.consulta}
              </p>
              <p className="text-sm mb-1">
                <strong>Respuesta:</strong> {c.respuesta || 'Sin respuesta'}
              </p>
              <p className="text-sm">
                <strong>Usuario:</strong> {c.nombre} ({c.correo})
              </p>
              <p className="text-sm">
                <strong>Experto:</strong> {c.expertoNombre || 'No registrado'}
              </p>
              <p className="text-sm mb-2">
                <strong>Fecha:</strong> {formatearFecha(c.fechaRespuesta)}
              </p>

              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => actualizarEstado(c.id, 'resueltaGratis')}
                  className="bg-emerald-600 text-white px-3 py-1 rounded text-sm"
                >
                  Aprobar como gratuita
                </button>
                <button
                  onClick={() => actualizarEstado(c.id, 'requierePago')}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                >
                  Marcar como de pago
                </button>
                <button
                  onClick={() => actualizarEstado(c.id, 'rechazada')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Rechazar y devolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
