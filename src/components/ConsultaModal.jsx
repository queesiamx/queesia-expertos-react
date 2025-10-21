// components/ConsultaModal.jsx
import React, { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase"; // para tomar el experto actual
import toast from "react-hot-toast";

export default function ConsultaModal({ consulta, onClose }) {
  const [respuesta, setRespuesta] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState("gratis"); // "gratis" | "cobro"
  const [monto, setMonto] = useState("");
  const expertoUid = auth.currentUser?.uid || null;
  const expertoNombre =
    auth.currentUser?.displayName ||
    consulta?.expertoNombre ||
    "Experto";

  const marcarComoResuelta = async () => {
    try {
      await updateDoc(doc(db, "consultasModeradas", consulta.id), {
        estado: "resuelta",
        tipoRespuesta: "gratis",
        respuesta: (respuesta && respuesta.trim()) || "Marcada como resuelta.",
        respondidaPorUid: expertoUid,
        respondidaPorNombre: expertoNombre,
        respondidaEn: serverTimestamp(),
        montoSugerido: 0,
        requiereValidacionAdmin: false,
      });
      toast.success("Consulta marcada como resuelta");
      onClose?.();
    } catch (error) {
      console.error("Error al marcar como resuelta", error);
      toast.error("Error al actualizar el estado");
    }
  };

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return toast.error("Escribe una respuesta.");

    try {
      if (tipoRespuesta === "cobro") {
        const n = Number(monto);
        if (!Number.isFinite(n) || n <= 0) {
          return toast.error("Monto inválido.");
        }
        await updateDoc(doc(db, "consultasModeradas", consulta.id), {
          respuesta: respuesta.trim(),
          tipoRespuesta: "cobro",
          montoSugerido: n,               // mantengo tu nombre de campo
          requiereValidacionAdmin: true,  // para el panel Admin
          estado: "porValidar",           // clave para tu flujo
          respondidaPorUid: expertoUid,
          respondidaPorNombre: expertoNombre,
          respondidaEn: serverTimestamp(),
        });
        toast.success("Respuesta enviada. Pendiente de validación.");
      } else {
        await updateDoc(doc(db, "consultasModeradas", consulta.id), {
          respuesta: respuesta.trim(),
          tipoRespuesta: "gratis",
          montoSugerido: 0,
          requiereValidacionAdmin: false,
          estado: "resuelta",
          respondidaPorUid: expertoUid,
          respondidaPorNombre: expertoNombre,
          respondidaEn: serverTimestamp(),
        });
        toast.success("Respuesta enviada.");
      }
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error("Error al enviar respuesta");
    }
  };

  const textoPregunta = consulta?.consulta ?? "(sin texto)";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow">
        <h2 className="text-xl font-bold mb-3">Responder consulta</h2>
        <p className="text-sm mb-4 text-slate-700">{textoPregunta}</p>

        <textarea
          className="w-full p-2 border rounded mb-3"
          placeholder="Escribe tu respuesta..."
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={4}
        />

        <label className="block font-semibold mb-1">
          ¿La respuesta es gratuita o requiere cobro?
        </label>
        <select
          className="w-full mb-3 p-2 border rounded"
          value={tipoRespuesta}
          onChange={(e) => setTipoRespuesta(e.target.value)}
        >
          <option value="gratis">Gratuita</option>
          <option value="cobro">Con cobro</option>
        </select>

        {tipoRespuesta === "cobro" && (
          <input
            type="number"
            className="w-full p-2 border rounded mb-3"
            placeholder="Monto sugerido (MXN)"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            min="1"
            step="1"
          />
        )}

        {/* Dentro del return (...) */}
        {consulta.estado !== "resuelta" && (
          <div className="mt-4">
            <button
              onClick={marcarComoResuelta}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            >
              Marcar como resuelta (sin respuesta)
            </button>
          </div>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancelar
          </button>
          <button
            onClick={enviarRespuesta}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
