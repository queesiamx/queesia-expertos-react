// src/pages/ResponderConsulta.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";
import ExpertShell from "@/components/expert/ExpertShell";

export default function ResponderConsulta() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [consulta, setConsulta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [respuesta, setRespuesta] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState("gratis");
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
          navigate("/expert-dashboard");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar la consulta.");
      } finally {
        setCargando(false);
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
        estado: "porValidar",
        fechaRespuesta: new Date().toISOString(),
        ...(tipoRespuesta === "pago" && {
          solicitudCambio: {
            estado: "pendiente",
            justificacion: justificacion.trim(),
            nuevoTipo: "dePago",
            fecha: new Date().toISOString(),
          },
        }),
      });

      toast.success("Respuesta enviada para validación.");
      navigate("/consultas-recibidas");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la respuesta.");
    }
  };

  const getNombre = (c) =>
    c?.nombre || c?.userNombre || c?.usuarioNombre || "Usuario sin nombre";

  const getCorreo = (c) =>
    c?.correo || c?.userEmail || c?.email || c?.usuarioEmail || "Sin correo";

  const getConsulta = (c) =>
    c?.consulta || c?.pregunta || c?.mensaje || "Consulta sin texto registrado";

  if (cargando || !consulta) {
    return (
      <ExpertShell
        title="Responder Consulta"
        subtitle="Carga de información de la consulta seleccionada."
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando consulta...
        </div>
      </ExpertShell>
    );
  }

  return (
    <ExpertShell
      title="Responder Consulta"
      subtitle="Redacta tu respuesta y define si será gratuita o de pago."
    >
      <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <strong>De:</strong> {getNombre(consulta)} ({getCorreo(consulta)})
          </p>

          <p className="mt-2 text-sm text-slate-700">
            <strong>Consulta:</strong> {getConsulta(consulta)}
          </p>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Tu respuesta
        </label>

        <textarea
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
          rows="6"
          placeholder="Escribe tu respuesta aquí..."
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
        />

        <div className="mt-5 space-y-3">
          <label className="block text-sm font-semibold text-slate-800">
            ¿La respuesta es gratuita o de pago?
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="radio"
                value="gratis"
                checked={tipoRespuesta === "gratis"}
                onChange={() => setTipoRespuesta("gratis")}
              />
              Gratuita
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="radio"
                value="pago"
                checked={tipoRespuesta === "pago"}
                onChange={() => setTipoRespuesta("pago")}
              />
              De pago
            </label>
          </div>
        </div>

        {tipoRespuesta === "pago" && (
          <div className="mt-5 space-y-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Precio sugerido
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                placeholder="Ej. 250"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Justificación
              </label>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                rows="3"
                placeholder="Explica por qué esta respuesta requiere pago..."
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={manejarEnvio}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Enviar respuesta
          </button>

          <button
            type="button"
            onClick={() => navigate("/consultas-recibidas")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </ExpertShell>
  );
}