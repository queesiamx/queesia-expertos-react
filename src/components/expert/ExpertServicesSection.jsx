import React, { useMemo, useState } from "react";
import ExpertServiceCard from "./ExpertServiceCard";

const filtros = [
  { id: "todos", label: "Todos" },
  { id: "curso", label: "Cursos" },
  { id: "manual", label: "Manuales" },
  { id: "consulta", label: "Consultas" },
];

export default function ExpertServicesSection({
  contenidos = [],
  serviciosRef,
  onAddService,
  onDelete,
  onEdit,
  onAddDate,
}) {
  const [filtro, setFiltro] = useState("todos");

  const contenidosFiltrados = useMemo(() => {
    if (filtro === "todos") return contenidos;
    return contenidos.filter((c) => c.tipoContenido === filtro);
  }, [contenidos, filtro]);

  return (
    <section id="servicios" ref={serviciosRef} className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">📚 Servicios</h2>

            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-bold text-slate-600">
              {contenidos.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {filtros.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFiltro(item.id)}
                className={`h-9 rounded-xl px-3 text-sm font-medium transition ${
                  filtro === item.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onAddService}
          className="inline-flex h-10 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
        >
          + Agregar servicio
        </button>
      </div>

      {contenidos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No has subido contenidos aún.
        </div>
      ) : contenidosFiltrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No hay servicios en esta categoría.
        </div>
      ) : (
        <div className="space-y-3">
          {contenidosFiltrados.map((contenido) => (
            <ExpertServiceCard
              key={contenido.id}
              contenido={contenido}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddDate={onAddDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}