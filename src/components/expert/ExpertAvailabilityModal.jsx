import React, { useEffect, useState } from "react";
import { X, CalendarDays, Clock, Zap } from "lucide-react";

export default function ExpertAvailabilityModal({
  isOpen,
  onClose,
  expert,
  onSave,
}) {
  const [formData, setFormData] = useState({
    disponibilidad: "",
    SLA: "",
    disponibleAhora: false,
    tiempoRespuestaHoras: "",
  });

  useEffect(() => {
    if (!expert || !isOpen) return;

    setFormData({
      disponibilidad: expert.disponibilidad || "",
      SLA: expert.SLA || "",
      disponibleAhora: !!expert.disponibleAhora,
      tiempoRespuestaHoras:
        expert.tiempoRespuestaHoras === 0 || expert.tiempoRespuestaHoras
          ? String(expert.tiempoRespuestaHoras)
          : "",
    });
  }, [expert, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const horas = String(formData.tiempoRespuestaHoras || "").replace(/[^\d]/g, "");

    await onSave({
      disponibilidad: formData.disponibilidad.trim(),
      SLA: formData.SLA.trim(),
      disponibleAhora: !!formData.disponibleAhora,
      tiempoRespuestaHoras: horas ? Number(horas) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-700">Disponibilidad</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Configura tu agenda visible
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Esta información se mostrará en tu card pública y en tu perfil.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={17} />
              Horario disponible
            </span>
            <input
              type="text"
              name="disponibilidad"
              value={formData.disponibilidad}
              onChange={handleChange}
              placeholder="Ej. Lunes a viernes — 10:00 a 18:00"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Clock size={17} />
              Tiempo de respuesta visible
            </span>
            <input
              type="text"
              name="SLA"
              value={formData.SLA}
              onChange={handleChange}
              placeholder="Ej. Responde en 24 h"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Zap size={17} />
              Respuesta rápida en card
            </span>
            <input
              type="number"
              name="tiempoRespuestaHoras"
              value={formData.tiempoRespuestaHoras}
              onChange={handleChange}
              placeholder="Ej. 2"
              min="0"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />
            <p className="mt-1 text-xs text-slate-400">
              Se usará para mostrar algo como “≈ 2 horas” en la card pública.
            </p>
          </label>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              name="disponibleAhora"
              checked={formData.disponibleAhora}
              onChange={handleChange}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Disponible ahora
              </span>
              <span className="block text-xs text-slate-500">
                Al activarlo, la card pública mostrará “Disponible ahora / En línea”.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Guardar disponibilidad
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}