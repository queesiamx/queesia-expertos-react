// src/pages/AdminConsultas.jsx
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from "@/firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";
import toast, { Toaster } from 'react-hot-toast';
import { unparse } from 'papaparse';

export default function AdminConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [expertos, setExpertos] = useState([]);
  const [asignaciones, setAsignaciones] = useState({}); // consultaId -> expertoId

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const snapshotConsultas = await getDocs(collection(db, 'consultasModeradas'));
        const docsConsultas = snapshotConsultas.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConsultas(docsConsultas);

        const snapshotExpertos = await getDocs(collection(db, 'experts'));
        const expertosAprobados = snapshotExpertos.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(e => e.aprobado === true);
        setExpertos(expertosAprobados);
      } catch (error) {
        toast.error('Error al cargar los datos');
        console.error(error);
      }
    };

    cargarDatos();
  }, []);

  const pendientes = consultas.filter(c => c.estado === 'pendiente');
  const gratis = consultas.filter(c => c.estado === 'resueltaGratis');
  const conPago = consultas.filter(c => c.estado === 'conCobro' || c.estado === 'requierePago');

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const ref = doc(db, 'consultasModeradas', id);
      const updateData = { estado: nuevoEstado };
      if (nuevoEstado === 'requierePago' || nuevoEstado === 'resueltaGratis') {
        updateData.aprobada = true;
      }
      await updateDoc(ref, updateData);
      setConsultas(prev =>
        prev.map(c =>
          c.id === id ? { ...c, ...updateData } : c
        )
      );
      toast.success(`Estado actualizado a "${nuevoEstado}"`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error(error);
    }
  };

  const aprobarYAsignar = async (consultaId) => {
    const expertoId = asignaciones[consultaId];
    const experto = expertos.find(e => e.id === expertoId);
    if (!experto) return toast.error('Selecciona un experto válido');

    try {
      const ref = doc(db, 'consultasModeradas', consultaId);
      const updateData = {
        estado: 'aprobadoParaExperto',
        aprobado: true,
        expertoId: experto.id,
        expertoNombre: experto.nombre || 'Sin nombre',
      };
      await updateDoc(ref, updateData);
      setConsultas(prev =>
        prev.map(c =>
          c.id === consultaId ? { ...c, ...updateData } : c
        )
      );
      toast.success('Consulta aprobada y asignada al experto');
    } catch (error) {
      toast.error('Error al asignar experto');
      console.error(error);
    }
  };

  const eliminarConsulta = async (id) => {
    try {
      await deleteDoc(doc(db, 'consultasModeradas', id));
      setConsultas(prev => prev.filter(c => c.id !== id));
      toast.success('Consulta eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar la consulta');
      console.error(error);
    }
  };

  const formatearEstado = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'resueltaGratis':
        return 'Resuelta sin costo';
      case 'requierePago':
      case 'conCobro':
        return 'Requiere pago';
      case 'aprobadoParaExperto':
        return 'Asignada a experto';
      default:
        return 'Desconocido';
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

  const exportarConsultasCSV = () => {
    if (consultas.length === 0) {
      return toast.error('No hay consultas para exportar.');
    }

    const datosFormateados = consultas.map((c) => ({
      'Fecha de envío': formatearFecha(c.timestamp),
      'Nombre del remitente': c.nombre || 'Anónimo',
      'Correo del remitente': c.correo || 'Sin correo',
      'Nombre del experto': c.expertoNombre || 'No especificado',
      'Mensaje': c.consulta || '',
      'Estado de la consulta': formatearEstado(c.estado),
    }));

    const csv = unparse(datosFormateados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'consultas_queesia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderConsultaCard = (c) => (
    <div key={c.id} className="bg-white p-4 rounded-xl shadow border mt-3">
      <p className="text-sm mb-1">
        <strong>Consulta:</strong> {c.consulta}
      </p>
      <p className="text-sm">
        <strong>De:</strong> {c.nombre || 'Anónimo'} ({c.correo || 'sin correo'})
      </p>
      <p className="text-sm mb-2">
        <strong>Estado:</strong>{' '}
        <span className={`font-semibold ${
          c.estado === 'pendiente'
            ? 'text-yellow-600'
            : c.estado === 'resueltaGratis'
            ? 'text-green-600'
            : c.estado === 'aprobadoParaExperto'
            ? 'text-blue-600'
            : 'text-orange-600'
        }`}>
          {formatearEstado(c.estado)}
        </span>
      </p>

      {c.estado === 'pendiente' && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium">Asignar a experto:</label>
          <select
            value={asignaciones[c.id] || ''}
            onChange={(e) =>
              setAsignaciones(prev => ({ ...prev, [c.id]: e.target.value }))
            }
            className="w-full p-2 border rounded"
          >
            <option value="">Selecciona un experto</option>
            {expertos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={() => aprobarYAsignar(c.id)}
            className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Aprobar y asignar
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => actualizarEstado(c.id, 'requierePago')}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
        >
          Requiere pago
        </button>
        <button
          onClick={() => actualizarEstado(c.id, 'resueltaGratis')}
          className="bg-emerald-500 text-white px-3 py-1 rounded text-sm"
        >
          Resuelta gratis
        </button>
        <button
          onClick={() => eliminarConsulta(c.id)}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-soft px-6 py-10 mt-[72px] font-sans">
      <Toaster position="top-right" />
      <UnifiedNavbar />


      <h1 className="text-3xl font-bold text-default mb-6 font-montserrat">
        Consultas pendientes
      </h1>

      <div className="mb-6">
        <button
          onClick={exportarConsultasCSV}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          Exportar consultas a CSV
        </button>
      </div>

      <div className="grid gap-4">
        {consultas.length === 0 ? (
          <p className="text-default-soft">No hay consultas aún.</p>
        ) : (
          <>
            {pendientes.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-6 text-yellow-800">Consultas pendientes</h2>
                {pendientes.map(renderConsultaCard)}
              </>
            )}

            {gratis.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-6 text-green-700">Consultas resueltas gratis</h2>
                {gratis.map(renderConsultaCard)}
              </>
            )}

            {conPago.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mt-6 text-orange-700">Consultas con cobro</h2>
                {conPago.map(renderConsultaCard)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
