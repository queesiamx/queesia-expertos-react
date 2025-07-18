import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import NavbarExperto from '../components/NavbarExperto';

export default function ResponderConsulta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consulta, setConsulta] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [estado, setEstado] = useState('respondida');
  const [pagado, setPagado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarConsulta = async () => {
      try {
        const ref = doc(db, 'consultasModeradas', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setConsulta(data);
          setRespuesta(data.respuesta || '');
          setEstado(data.estado || 'respondida');
          setPagado(data.pagado || false); // ✅ Cargamos el campo pagado
        } else {
          toast.error('Consulta no encontrada.');
          navigate('/consultas-recibidas');
        }
      } catch (error) {
        console.error(error);
        toast.error('Error al cargar la consulta.');
      } finally {
        setCargando(false);
      }
    };

    cargarConsulta();
  }, [id, navigate]);

  const guardarRespuesta = async () => {
  if (!respuesta.trim()) {
    toast.error('La respuesta no puede estar vacía.');
    return;
  }

  if (estado === 'requierePago' && !pagado) {
    toast.error('Esta consulta requiere pago. No puedes enviar respuesta hasta que el usuario haya pagado.');
    return;
  }

  // 🟢 Establece automáticamente el estado correcto
  const estadoFinal = pagado ? 'conCobro' : 'resueltaGratis';

  try {
    const ref = doc(db, 'consultasModeradas', id);
    await updateDoc(ref, {
      respuesta,
      estado: estadoFinal
    });
    toast.success('Consulta actualizada correctamente.');
    navigate('/consultas-recibidas');
  } catch (error) {
    console.error(error);
    toast.error('Error al guardar la respuesta.');
  }
};


  return (
    <>
      <NavbarExperto />
      <div className="p-6 max-w-3xl mx-auto font-sans">
        <h1 className="text-2xl font-bold mb-4">Responder Consulta</h1>

        {cargando ? (
          <p>Cargando...</p>
        ) : consulta ? (
          <div className="space-y-4 bg-white p-6 rounded-xl shadow border">
            <p><strong>Consulta:</strong> {consulta.consulta}</p>
            <p><strong>Remitente:</strong> {consulta.nombre} ({consulta.correo})</p>

            {estado === 'requierePago' && !pagado && (
              <p className="text-red-600 font-semibold">
                Esta consulta requiere pago. No puedes enviar una respuesta hasta que el usuario haya pagado.
              </p>
            )}

            <label className="block mt-4">
              <span className="text-gray-700 font-semibold">Tu respuesta:</span>
              <textarea
                className="mt-1 block w-full border rounded-md p-2"
                rows={5}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
              />
            </label>

            <div className="mt-4">
              <span className="block text-gray-700 font-semibold mb-1">Estado de la consulta:</span>
                <select
                value={estado}
                disabled // 👈 Deshabilitado
                className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
              >
                <option value="respondida">Respondida</option>
                <option value="resueltaGratis">Resuelta gratis</option>
                <option value="requierePago">Requiere pago</option>
              </select>

            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => navigate('/consultas-recibidas')}
              >
                Cancelar
              </button>
              
                <button
                className={`px-4 py-2 rounded text-white ${
                    estado === 'requierePago' && !pagado
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={estado === 'requierePago' && !pagado}
                onClick={guardarRespuesta}
                >
                Enviar respuesta
                </button>

            </div>
          </div>
        ) : (
          <p>No se pudo cargar la consulta.</p>
        )}
      </div>
    </>
  );
}
