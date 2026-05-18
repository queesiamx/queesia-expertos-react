import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Video,
  BrainCircuit,
  GraduationCap,
  Rocket,
  Landmark,
  Zap,
  ExternalLink,
  Search,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";

const API_URL = "https://queesia.com/api/calendario/obtener_eventos.php";

const iconMap = {
  BrainCircuit,
  CalendarDays,
  Video,
  GraduationCap,
  Rocket,
  Landmark,
  Zap,
};

function formatDate(dateString) {
  if (!dateString) return "Fecha por confirmar";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function EventCard({ evento }) {
  const Icon = iconMap[evento.icono] || CalendarDays;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/60 bg-white/65 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/80">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-sky-100">
        {evento.imagen_url ? (
          <img
            src={evento.imagen_url}
            alt={evento.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-3xl bg-white/55 p-5 shadow-lg backdrop-blur">
              <Icon className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
        )}

        {Number(evento.destacado) === 1 && (
          <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            Destacado
          </span>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50">
            <Icon className="h-4 w-4" />
          </span>
          <span>{evento.tipo_evento || evento.categoria || "Evento"}</span>
        </div>

        <h2 className="line-clamp-2 text-xl font-bold italic text-slate-900">
          {evento.titulo}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {evento.descripcion_corta || "Consulta los detalles del evento."}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{formatDate(evento.fecha_inicio)}</span>
          </div>

          <div className="flex items-center gap-2">
            {evento.modalidad?.toLowerCase().includes("línea") ||
            evento.modalidad?.toLowerCase().includes("online") ? (
              <Video className="h-4 w-4 text-slate-500" />
            ) : (
              <MapPin className="h-4 w-4 text-slate-500" />
            )}
            <span>
              {evento.modalidad || "Modalidad por confirmar"}
              {evento.ciudad ? ` · ${evento.ciudad}` : ""}
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(evento.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
        </div>

        <a
          href={evento.url_evento || "#"}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 hover:no-underline"
        >
          Ver evento
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

export default function AgendaIA() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

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

  const eventosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    if (!q) return eventos;

    return eventos.filter((evento) => {
      const texto = `
        ${evento.titulo || ""}
        ${evento.descripcion_corta || ""}
        ${evento.categoria || ""}
        ${evento.tipo_evento || ""}
        ${evento.modalidad || ""}
        ${evento.ciudad || ""}
        ${evento.tags || ""}
      `.toLowerCase();

      return texto.includes(q);
    });
  }, [eventos, busqueda]);

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
        </section>

        <section className="mx-auto mt-12 max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
              Cargando eventos...
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
              No hay eventos publicados todavía.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <EventCard key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}