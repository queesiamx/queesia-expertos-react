import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import AgendaEventCard from "@/components/calendario/AgendaEventCard";
import AgendaMonthCalendar from "@/components/calendario/AgendaMonthCalendar";
import {
  addAgendaMonths,
  eventBelongsToMonth,
  formatAgendaMonth,
  getAgendaMonthDate,
  getAgendaMonthKey,
  getEventTemporalStatus,
  groupEventsByStartMonth,
  sortEventsChronologically,
  sortEventsReverseChronologically,
} from "@/lib/agendaDates";

const API_URL = "https://queesia.com/api/calendario/obtener_eventos.php";

export default function AgendaIA() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [modalidad, setModalidad] = useState("todas");
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(() =>
    getAgendaMonthDate()
  );
  const [viewMode, setViewMode] = useState("list");
  const [showPastEvents, setShowPastEvents] = useState(false);

  useEffect(() => {
    async function cargarEventos() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setEventos(Array.isArray(data.eventos) ? data.eventos : []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarEventos();
  }, []);

  const categorias = useMemo(() => {
    return [...new Set(eventos.map((e) => e.categoria).filter(Boolean))];
  }, [eventos]);

  const modalidades = useMemo(() => {
    return [...new Set(eventos.map((e) => e.modalidad).filter(Boolean))];
  }, [eventos]);

  const eventosOrdenados = useMemo(() => {
    return sortEventsChronologically(eventos);
  }, [eventos]);

  const selectedMonthKey = useMemo(() => {
    return getAgendaMonthKey(selectedCalendarMonth);
  }, [selectedCalendarMonth]);

  const selectedMonthLabel = useMemo(() => {
    return formatAgendaMonth(selectedCalendarMonth);
  }, [selectedCalendarMonth]);

  function irAlMesAnterior() {
    setSelectedCalendarMonth((currentMonth) => addAgendaMonths(currentMonth, -1));
  }

  function irAlMesActual() {
    setSelectedCalendarMonth(getAgendaMonthDate());
  }

  function irAlMesSiguiente() {
    setSelectedCalendarMonth((currentMonth) => addAgendaMonths(currentMonth, 1));
  }

  const eventosFiltradosPorControles = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return eventosOrdenados.filter((evento) => {
      const texto = `
        ${evento.titulo || ""}
        ${evento.descripcion_corta || ""}
        ${evento.categoria || ""}
        ${evento.tipo_evento || ""}
        ${evento.modalidad || ""}
        ${evento.ciudad || ""}
        ${evento.tags || ""}
      `.toLowerCase();

      const coincideBusqueda = !q || texto.includes(q);
      const coincideCategoria =
        categoria === "todas" || evento.categoria === categoria;
      const coincideModalidad =
        modalidad === "todas" || evento.modalidad === modalidad;

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideModalidad
      );
    });
  }, [
    eventosOrdenados,
    busqueda,
    categoria,
    modalidad,
  ]);

  const proximosEventos = useMemo(() => {
    return eventosFiltradosPorControles.filter(
      (evento) => getEventTemporalStatus(evento) === "upcoming"
    );
  }, [eventosFiltradosPorControles]);

  const eventosEnCurso = useMemo(() => {
    return eventosFiltradosPorControles.filter(
      (evento) => getEventTemporalStatus(evento) === "ongoing"
    );
  }, [eventosFiltradosPorControles]);

  const eventosPasados = useMemo(() => {
    return sortEventsReverseChronologically(
      eventosFiltradosPorControles.filter(
        (evento) => getEventTemporalStatus(evento) === "past"
      )
    );
  }, [eventosFiltradosPorControles]);

  const eventosDelMes = useMemo(() => {
    return eventosFiltradosPorControles.filter((evento) =>
      eventBelongsToMonth(evento, selectedMonthKey)
    );
  }, [eventosFiltradosPorControles, selectedMonthKey]);

  const gruposProximos = useMemo(() => {
    return groupEventsByStartMonth(proximosEventos);
  }, [proximosEventos]);

  const gruposPasados = useMemo(() => {
    return groupEventsByStartMonth(eventosPasados);
  }, [eventosPasados]);

  const hasCurrentOrUpcomingEvents =
    eventosEnCurso.length > 0 || proximosEventos.length > 0;

  return (
    <>
      <UnifiedNavbar />

      <main className="min-h-screen bg-transparent px-4 pb-20 pt-12 text-slate-900 sm:px-6">
        <section className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-white/55 shadow-xl backdrop-blur-xl">
            <CalendarDays className="h-10 w-10 text-indigo-500" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-500">
            Queesia
          </p>

          <h1 className="font-montserrat text-4xl font-extrabold italic tracking-tight text-slate-900 sm:text-5xl">
            Agenda <span className="text-sky-500">IA</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Eventos, webinars, congresos y actividades relevantes sobre
            inteligencia artificial, tecnología e innovación.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-3xl border border-white/70 bg-white/65 px-4 py-3 shadow-xl backdrop-blur-xl">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por evento, categoría, modalidad o ciudad..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mx-auto mt-4 grid max-w-3xl gap-3 sm:grid-cols-2">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl outline-none"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl outline-none"
            >
              <option value="todas">Todas las modalidades</option>
              {modalidades.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>

          </div>

          <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-4 rounded-3xl border border-white/70 bg-white/65 p-4 text-left shadow-xl backdrop-blur-xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-extrabold italic text-slate-900 sm:text-2xl">
                {selectedMonthLabel}
              </h2>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={irAlMesAnterior}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-md transition hover:bg-white"
                  aria-label="Ver mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>

                <button
                  type="button"
                  onClick={irAlMesActual}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-100"
                >
                  Hoy
                </button>

                <button
                  type="button"
                  onClick={irAlMesSiguiente}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm font-bold text-slate-700 shadow-md transition hover:bg-white"
                  aria-label="Ver mes siguiente"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div
              className="inline-flex w-full rounded-2xl border border-white/70 bg-white/70 p-1 shadow-inner sm:w-fit"
              aria-label="Seleccionar vista de agenda"
            >
              <button
                type="button"
                onClick={() => setViewMode("month")}
                aria-pressed={viewMode === "month"}
                className={`min-h-10 flex-1 rounded-xl px-4 py-2 text-sm font-bold transition sm:flex-none ${
                  viewMode === "month"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Mes
              </button>

              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={`min-h-10 flex-1 rounded-xl px-4 py-2 text-sm font-bold transition sm:flex-none ${
                  viewMode === "list"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
              Cargando eventos...
            </div>
          ) : viewMode === "month" ? (
            <AgendaMonthCalendar
              eventos={eventosDelMes}
              selectedMonth={selectedCalendarMonth}
            />
          ) : (
            <div className="space-y-10">
              {eventosEnCurso.length > 0 && (
                <section aria-labelledby="agenda-en-curso">
                  <h2
                    id="agenda-en-curso"
                    className="mb-5 text-2xl font-extrabold italic text-slate-900"
                  >
                    En curso
                  </h2>
                  <AgendaEventGrid eventos={eventosEnCurso} />
                </section>
              )}

              {gruposProximos.length > 0 && (
                <section aria-labelledby="agenda-proximos-eventos">
                  <h2
                    id="agenda-proximos-eventos"
                    className="mb-5 text-2xl font-extrabold italic text-slate-900"
                  >
                    Próximos eventos
                  </h2>

                  <div className="space-y-8">
                    {gruposProximos.map((grupo) => (
                      <AgendaMonthGroup
                        key={grupo.monthKey}
                        grupo={grupo}
                        idPrefix="proximos"
                      />
                    ))}
                  </div>
                </section>
              )}

              {!hasCurrentOrUpcomingEvents && (
                <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
                  No hay próximos eventos con los filtros seleccionados.
                </div>
              )}

              {eventosPasados.length > 0 && (
                <section>
                  <button
                    type="button"
                    onClick={() => setShowPastEvents((visible) => !visible)}
                    aria-expanded={showPastEvents}
                    aria-controls="agenda-eventos-pasados-panel"
                    className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/70 bg-white/75 px-5 py-3 text-sm font-bold text-slate-700 shadow-md transition hover:bg-white"
                  >
                    {showPastEvents
                      ? "Ocultar eventos pasados"
                      : "Ver eventos pasados"}
                  </button>

                  {showPastEvents && (
                    <div id="agenda-eventos-pasados-panel" className="mt-6">
                      <h2
                        id="agenda-eventos-pasados"
                        className="mb-5 text-2xl font-extrabold italic text-slate-900"
                      >
                        Eventos pasados
                      </h2>

                      <div className="space-y-8">
                        {gruposPasados.map((grupo) => (
                          <AgendaMonthGroup
                            key={grupo.monthKey}
                            grupo={grupo}
                            idPrefix="pasados"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function AgendaMonthGroup({ grupo, idPrefix }) {
  const headingId = `agenda-grupo-${idPrefix}-${grupo.monthKey}`;

  return (
    <section aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="mb-4 text-xl font-extrabold italic text-slate-900"
      >
        {grupo.monthLabel}
      </h3>
      <AgendaEventGrid eventos={grupo.eventos} />
    </section>
  );
}

function AgendaEventGrid({ eventos }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {eventos.map((evento) => (
        <AgendaEventCard key={evento.id} evento={evento} />
      ))}
    </div>
  );
}
