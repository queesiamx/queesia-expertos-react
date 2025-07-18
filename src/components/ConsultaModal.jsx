// components/ConsultaModal.jsx
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";

export default function ConsultaModal({ consulta, onClose }) {
  const [respuesta, setRespuesta] = useState("");
  const [tipoRespuesta, setTipoRespuesta] = useState("gratis");
  const [monto, setMonto] = useState("");

  const enviarRespuesta = async () => {
    if (!respuesta.trim()) return toast.error("Escribe una respuesta.");

    const updateData = {
      respuesta,
      tipoRespuesta,
      respondidaPor: consulta.expertoNombre || "Experto",
      respondidaEn: new Date(),
    };

    if (tipoRespuesta === "cobro") {
      if (!monto || isNaN(monto)) {
        return toast.error("Monto inválido.");
      }
      updateData.montoSugerido = parseFloat(monto);
      updateData.requiereValidacionAdmin = true;
    }

    try {
      await updateDoc(doc(db, "consultasModeradas", consulta.id), updateData);
      toast.success("Respuesta enviada");
      onClose(); // cerrar modal
    } catch (error) {
      toast.error("Error al enviar respuesta");
      console.error(error);
    }

    // 🔔 (opcional) aquí invocarías una función para enviar correo al admin
    // si tipoRespuesta === "cobro"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow">
        <h2 className="text-xl font-bold mb-3">Responder consulta</h2>
        <p className="text-sm mb-4">{consulta.consulta}</p>

        <textarea
          className="w-full p-2 border rounded mb-3"
          placeholder="Escribe tu respuesta..."
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
          rows={4}
        />

        <label className="block font-semibold mb-1">¿La respuesta es gratuita o requiere cobro?</label>
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
          />
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={enviarRespuesta} className="px-4 py-2 bg-blue-600 text-white rounded">Enviar</button>
        </div>
      </div>
    </div>
  );
}
