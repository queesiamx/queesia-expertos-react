// src/components/ExpertConsultForm.jsx
import React, { useState } from "react";

const ExpertConsultForm = ({ onEnviarConsulta, expertoId, userId }) => {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return;

    setEnviando(true);
    await onEnviarConsulta({ mensaje, expertoId, userId });
    setMensaje("");
    setEnviando(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        Enviar Consulta
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-300"
          rows="4"
          placeholder="Escribe tu consulta..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          disabled={enviando}
        />
        <button
          type="submit"
          disabled={enviando}
          className={`w-full py-2 px-4 rounded-lg text-white ${
            enviando
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {enviando ? "Enviando..." : "Enviar Consulta"}
        </button>
      </form>
    </div>
  );
};

export default ExpertConsultForm;
