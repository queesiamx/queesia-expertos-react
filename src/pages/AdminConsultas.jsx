// src/pages/AdminConsultas.jsx
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from "@/firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";

import toast, { Toaster } from 'react-hot-toast';
import { unparse } from 'papaparse';

import { useSearchParams } from 'react-router-dom';
import AdminShell from "@/components/admin/AdminShell";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";

export default function AdminConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [expertosAprobadosCount, setExpertosAprobadosCount] = useState(0);
  const [searchParams] = useSearchParams();


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
        const expertsOk = snapshotExpertos.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(e => e.aprobado === true);
        setExpertosAprobadosCount(expertsOk.length);
      } catch (error) {
        toast.error('Error al cargar los datos');
        console.error(error);
      }
    };

    cargarDatos();
  }, []);

  const pendientes = consultas.filter(
    (c) => c.estado === 'pendiente' || c.estado === 'porRevisar'
  );

  const gratis = consultas.filter(c => c.estado === 'resueltaGratis');
  const conPago = consultas.filter(c => c.estado === 'conCobro' || c.estado === 'requierePago');

  const conCobro = consultas.filter(
    c => c.estado === 'conCobro' || c.estado === 'requierePago'
  );
  const tab = searchParams.get('tab') || 'pendientes';

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

  const aprobarParaExperto = async (consultaId) => {
    const consulta = consultas.find((c) => c.id === consultaId);
    if (!consulta?.expertoId) {
      return toast.error('La consulta no tiene destinatario (experto) definido.');
    }

    try {
      const ref = doc(db, 'consultasModeradas', consultaId);
      const updateData = {
        estado: 'aprobadoParaExperto',
        aprobado: true,
        expertoId: consulta.expertoId,
        expertoNombre: consulta.expertoNombre || 'Sin nombre'
      };
      await updateDoc(ref, updateData);
      setConsultas(prev =>
        prev.map(c =>
          c.id === consultaId ? { ...c, ...updateData } : c
        )
      );
      toast.success('Consulta aprobada para el experto destinatario');
    } catch (error) {
      toast.error('Error al aprobar consulta');
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
      'Fecha de envío': formatearFecha(c.timestamp || c.createdAt),
      'Nombre del remitente': c.nombre || c.userNombre || 'Anónimo',
      'Correo del remitente': c.correo || c.userEmail || 'Sin correo',
      'Nombre del experto': c.expertoNombre || 'No especificado',
      'Mensaje': c.consulta || c.pregunta || '',
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
      <div className="grid gap-1 text-sm mb-2">
        <p><strong>Fecha y hora:</strong> {formatearFecha(c.timestamp || c.createdAt)}</p>
        <p><strong>Remitente:</strong> {c.nombre || c.userNombre || 'Anónimo'} ({c.correo || c.userEmail || 'sin correo'})</p>
        <p><strong>Destinatario:</strong> {c.expertoNombre || c.expertoId || 'Sin experto'}</p>
      </div>

      <p className="text-sm mb-1">
        <strong>Consulta:</strong> {c.consulta || c.pregunta || "Sin contenido"}
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

      {(c.estado === 'pendiente' || c.estado === 'porRevisar') && (
        <div className="mt-3">
          <button
            onClick={() => aprobarParaExperto(c.id)}
            className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Aprobar para experto
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
    <>
      <Toaster position="top-right" />

      <AdminShell
        title="Gestión de consultas"
        subtitle="Administra consultas pendientes, gratuitas y con cobro."
        sidebarProps={{
          expertosCount: expertosAprobadosCount,
          aprobadosCount: expertosAprobadosCount,
          pendientesExpertosCount: 0,
          consultasPendientesCount: pendientes.length,
          porValidarCount: 0,
          resueltasGratisCount: gratis.length,
          conCobroCount: conCobro.length,
        }}
      >
        <AdminSectionHeader
          title={
            tab === 'gratis'
              ? 'Consultas resueltas gratis'
              : tab === 'cobro'
              ? 'Consultas con cobro'
              : 'Consultas pendientes'
          }
          actions={
            <button
              onClick={exportarConsultasCSV}
              className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
            >
              Exportar consultas a CSV
            </button>
          }
        />

        <div className="grid gap-4">
          {consultas.length === 0 ? (
            <p className="text-default-soft">No hay consultas aún.</p>
          ) : (
            <>
              {tab === 'pendientes' && pendientes.map(renderConsultaCard)}
              {tab === 'gratis' && gratis.map(renderConsultaCard)}
              {tab === 'cobro' && conCobro.map(renderConsultaCard)}
            </>
          )}
        </div>
      </AdminShell>
    </>
  );
}
