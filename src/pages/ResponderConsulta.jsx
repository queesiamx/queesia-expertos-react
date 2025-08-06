import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";


export default function ResponderConsulta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consulta, setConsulta] = useState(null);
  const [respuesta, setRespuesta] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState("gratis"); // 'gratis' o 'pago'
  const [precio, setPrecio] = useState("");
  const [justificacion, setJustificacion] = useState("");

  useEffect(() => {
    const cargarConsulta = async () => {
      try {
        const ref = doc(db, "consultasModeradas", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setConsulta({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Consulta no encontrada.");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar la consulta.");
      }
    };

    cargarConsulta();
  }, [id, navigate]);

  const manejarEnvio = async () => {
    if (!respuesta.trim()) {
      toast.error("Debes escribir una respuesta.");
      return;
    }

    if (tipoRespuesta === "pago") {
      if (!precio || isNaN(precio)) {
        toast.error("Ingresa un precio válido.");
        return;
      }
      if (!justificacion.trim()) {
        toast.error("Agrega una justificación para la respuesta de pago.");
        return;
      }
    }

    try {
      const ref = doc(db, "consultasModeradas", id);
      await updateDoc(ref, {
        respuesta: respuesta.trim(),
        tipoRespuesta,
        precio: tipoRespuesta === "pago" ? Number(precio) : 0,
        estado: "porValidar", // Estado temporal
        fechaRespuesta: new Date().toISOString(),
        ...(tipoRespuesta === "pago" && {
          solicitudCambio: {
            estado: "pendiente",
            justificacion: justificacion.trim(),
            nuevoTipo: "dePago",
            fecha: new Date().toISOString()
          }
        })
      });

      toast.success("Respuesta enviada para validación.");
      navigate("/consultas-recibidas");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la respuesta.");
    }
  };

  if (!consulta) {
    return (
      <>
        <UnifiedNavbar />

        <div className="p-6">Cargando consulta...</div>
      </>
    );
  }

  return (
    <>
      <UnifiedNavbar />

      <div className="p-6 max-w-3xl mx-auto font-sans">
        <h1 className="text-2xl font-bold mb-4">Responder Consulta</h1>
        <div className="bg-white shadow rounded p-4 space-y-4">
          <p><strong>De:</strong> {consulta.nombre} ({consulta.correo})</p>
          <p><strong>Consulta:</strong> {consulta.consulta}</p>

          <textarea
            className="w-full border px-4 py-2 rounded"
            rows="5"
            placeholder="Escribe tu respuesta aquí..."
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
          />

          <div className="space-y-2">
            <label className="font-medium block">¿La respuesta es gratuita o de pago?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="gratis"
                  checked={tipoRespuesta === "gratis"}
                  onChange={() => setTipoRespuesta("gratis")}
                />
                Gratuita
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  value="pago"
                  checked={tipoRespuesta === "pago"}
                  onChange={() => setTipoRespuesta("pago")}
                />
                De pago
              </label>
            </div>

            {tipoRespuesta === "pago" && (
              <>
                <input
                  type="number"
                  className="w-full border px-4 py-2 rounded"
                  placeholder="Precio en MXN"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
                <textarea
                  className="w-full border px-4 py-2 rounded mt-2"
                  rows="3"
                  placeholder="Justificación del cobro"
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                />
              </>
            )}
          </div>

          <button
            onClick={manejarEnvio}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enviar respuesta para validación
          </button>
        </div>
      </div>
    </>
  );
}
