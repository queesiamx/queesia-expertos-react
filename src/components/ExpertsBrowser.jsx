// src/components/ExpertsBrowser.jsx
import { useState } from "react";
import ExpertList from "./ExpertList.jsx"; // ruta relativa, mismo folder

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

  // --- COMPACTACIÓN de la barra ---
  const pad = "p-3 md:p-4";           // antes p-4 md:p-6
  const controlH = "h-10";            // antes h-11
  const chipPad = "px-2.5 py-1";      // antes px-3 py-1

  return (
    <section id={anchorId} className={`relative z-10 scroll-mt-28 ${shell}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-4 pb-8">
        {/* FILTROS */}

        <div className={`rounded-2xl border border-slate-200/60 shadow-sm ${pad} mb-3
                 bg-white text-slate-900 dark:bg-slate-900 dark:text-white`}>


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
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
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

        <h2 className="mt-2 mb-2 text-[22px] sm:text-2xl font-bold">Expertos Disponibles</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4" />

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
