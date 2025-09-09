// src/components/ExpertsBrowser.jsx
import { useState } from "react";
import ExpertList from "./ExpertList.jsx";

export default function ExpertsBrowser({
  variant = "light",
  anchorId,
  defaultSort = "relevancia",
  compactFilters = false,
}) {
  const shell =
    variant === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-900";

  // Estado de filtros
  const [q, setQ] = useState("");
  const [specialty, setSpecialty] = useState(null);
  const [service, setService] = useState(null);
  const [price, setPrice] = useState(null);
  const [sortBy, setSortBy] = useState(defaultSort);

  // Compactación barra
  const pad = "p-2.5 md:p-3";
  const controlH = "h-10";
  const chipPad = "px-2.5 py-1";

  return (
    <section id={anchorId} className={`relative z-10 scroll-mt-28 ${shell}`}>
      {/* ↓↓↓ quita el hueco arriba/abajo: pb-0 (o pb-2) */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pb-0">

        {/* TÍTULO ARRIBA (fuera de la tarjeta de filtros) */}
        <h2 className="mb-3 text-[22px] sm:text-2xl font-bold">
          Expertos disponibles
        </h2>

        {/* FILTROS */}
        <div
          className={`rounded-2xl border border-slate-200/60 shadow-sm ${pad} mb-4
                      bg-white text-slate-900 dark:bg-slate-900 dark:text-white`}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar expertos por nombre, especialidad o tecnología…"
                className={`w-full ${controlH} rounded-xl border border-slate-200/70 px-4 outline-none
                            bg-white/90 dark:bg-slate-800 dark:border-slate-700`}
              />
            </div>

            {!compactFilters && (
              <>
                <select
                  value={specialty ?? ""}
                  onChange={(e) => setSpecialty(e.target.value || null)}
                  className={`${controlH} rounded-xl border border-slate-200/70 px-3
                              bg-white/90 dark:bg-slate-800 dark:border-slate-700`}
                >
                  <option value="">Todas las especialidades</option>
                  <option>Auditoría</option>
                  <option>Gobierno</option>
                  <option>Petróleo y Gas</option>
                  <option>Marketing</option>
                  <option>Automatización</option>
                  <option>Capacitación</option>
                </select>

                <select
                  value={service ?? ""}
                  onChange={(e) => setService(e.target.value || null)}
                  className={`${controlH} rounded-xl border border-slate-200/70 px-3
                              bg-white/90 dark:bg-slate-800 dark:border-slate-700`}
                >
                  <option value="">Todos los servicios</option>
                  <option value="consulta">Consulta</option>
                  <option value="manual">Manual</option>
                  <option value="curso">Curso</option>
                </select>

                <select
                  value={price ?? ""}
                  onChange={(e) => setPrice(e.target.value || null)}
                  className={`${controlH} rounded-xl border border-slate-200/70 px-3
                              bg-white/90 dark:bg-slate-800 dark:border-slate-700`}
                >
                  <option value="">Cualquier precio</option>
                  <option value="economico">Precio económico</option>
                </select>
              </>
            )}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`${controlH} rounded-xl border border-slate-200/70 px-3
                          bg-white/90 dark:bg-slate-800 dark:border-slate-700`}
            >
              <option value="relevancia">Más relevantes</option>
              <option value="mejor_calificados">Mejor calificados</option>
            </select>
          </div>

          {!compactFilters && (
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => setSortBy("mejor_calificados")}
                className={`rounded-full ${chipPad} border border-slate-200/70
                            bg-white/70 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700`}
              >
                Mejor valorados
              </button>
              <button
                onClick={() => setPrice("economico")}
                className={`rounded-full ${chipPad} border border-slate-200/70
                            bg-white/70 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700`}
              >
                Precio económico
              </button>
              <button
                onClick={() => setService("consulta")}
                className={`rounded-full ${chipPad} border border-slate-200/70
                            bg-white/70 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700`}
              >
                Disponibles ahora
              </button>
            </div>
          )}
        </div>

        {/* ↓↓↓ elimina el <p/> vacío que metía margen */}
        {/* <p className="text-slate-500 dark:text-slate-400 mb-4" /> */}

        <ExpertList
          query={q}
          specialty={specialty ?? undefined}
          service={service ?? undefined}
          price={price ?? undefined}
          sortBy={sortBy}
        />
      </div>
    </section>
  );
}
