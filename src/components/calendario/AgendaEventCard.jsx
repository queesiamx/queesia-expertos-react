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
} from "lucide-react";
import { Link } from "react-router-dom";

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

export default function AgendaEventCard({ evento }) {
  const Icon = iconMap[evento.icono] || CalendarDays;

  return (
    <article className="group w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white/65 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/80">
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-sky-100">
        {evento.imagen_url ? (
          <img
            src={evento.imagen_url}
            alt={evento.titulo}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-3xl bg-white/60 p-6 shadow-lg backdrop-blur">
              <Icon className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
        )}

        {Number(evento.destacado) === 1 && (
          <span className="absolute left-4 top-4 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
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

        <Link
          to={`/agenda-ia/${evento.id}`}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 hover:no-underline"
        >
          Ver evento
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}