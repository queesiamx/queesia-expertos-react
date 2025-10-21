import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from "@/firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";
import emailjs from '@emailjs/browser';
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

  const enviarEmailNotificacion = async (nombre, email, estado, mensaje) => {
    try {
      await emailjs.send(
        'service_r6eekqh', // ✅ Tu Service ID
        'template_val_respuesta', // ✅ Tu Template ID
        {
          nombre,
          estado,
          mensaje_personalizado: mensaje,
          to_email: email,
        },
        'oKchOXmL2N3kpBC5q' // ✅ Tu Public Key
      );
      toast.success('Notificación enviada al experto');
    } catch (error) {
      console.error('Error al enviar notificación:', error);
      toast.error('Error al enviar notificación');
    }
  };

  const actualizarEstado = async (id, nuevoEstado) => {
    const mensajeConfirmacion = {
      resueltaGratis: '¿Estás seguro de aprobar esta respuesta como gratuita?',
      requierePago: '¿Estás seguro de marcar esta respuesta como de pago?',
      rechazada: '¿Estás seguro de rechazar y devolver esta respuesta al experto?'
    };

    const mensajeEmail = {
      resueltaGratis: 'Gracias por tu respuesta a la consulta enviada. Ha sido aprobada como gratuita y será visible para el usuario en breve.',
      requierePago: 'Tu respuesta fue recibida correctamente. Hemos marcado esta consulta como servicio de pago. Te informaremos cuando el usuario realice la compra.',
      rechazada: 'Tu respuesta fue rechazada por el equipo de validación. Puedes editarla y enviarla nuevamente si lo consideras necesario.'
    };

    const confirmar = window.confirm(mensajeConfirmacion[nuevoEstado]);
    if (!confirmar) return;

    try {
      const consulta = consultas.find(c => c.id === id);

      const ref = doc(db, 'consultasModeradas', id);
      await updateDoc(ref, {
        estado: nuevoEstado,
        aprobada: nuevoEstado !== 'rechazada'
      });

      // Enviar notificación al experto
      await enviarEmailNotificacion(
        consulta.expertoNombre || 'Experto',
        consulta.expertoCorreo,
        nuevoEstado,
        mensajeEmail[nuevoEstado]
      );

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
      <UnifiedNavbar />


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
