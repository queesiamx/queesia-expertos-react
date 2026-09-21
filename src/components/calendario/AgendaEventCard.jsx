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
import { formatAgendaDateRange } from "@/lib/agendaDates";

const iconMap = {
  BrainCircuit,
  CalendarDays,
  Video,
  GraduationCap,
  Rocket,
  Landmark,
  Zap,
};

export default function AgendaEventCard({ evento }) {
  const Icon = iconMap[evento.icono] || CalendarDays;
  const destacado = Number(evento.destacado) === 1;
  const tags = getEventTags(evento.tags);
  const isOnline = isOnlineEvent(evento);
  const locationLabel = getLocationLabel(evento, isOnline);

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border border-white/65 bg-white/70 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/85">
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-sky-100 sm:h-48">
        {evento.imagen_url ? (
          <img
            src={evento.imagen_url}
            alt={evento.titulo || "Imagen del evento"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="rounded-3xl bg-white/60 p-6 shadow-lg backdrop-blur">
              <Icon className="h-12 w-12 text-indigo-500" />
            </div>
          </div>
        )}

        {destacado && (
          <span className="absolute left-4 top-4 rounded-full border border-amber-200/80 bg-amber-50/95 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm backdrop-blur">
            Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
            <Icon className="h-4 w-4" />
          </span>
          <span className="line-clamp-1">
            {evento.tipo_evento || evento.categoria || "Evento"}
          </span>
        </div>

        <h2 className="line-clamp-2 text-xl font-bold italic text-slate-900">
          {evento.titulo}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {evento.descripcion_corta || "Consulta los detalles del evento."}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" />
            <span>{formatAgendaDateRange(evento)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isOnline ? (
              <Video className="h-4 w-4 shrink-0 text-slate-500" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-slate-500" />
            )}

            <span>{locationLabel}</span>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-xs font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-medium text-slate-500">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          to={`/agenda-ia/${evento.id}`}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
        >
          Ver evento
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function getEventTags(rawTags) {
  return (rawTags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isOnlineEvent(evento) {
  const modalidad = String(evento?.modalidad || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return modalidad.includes("online") || modalidad.includes("linea");
}

function getLocationLabel(evento, isOnline) {
  const modalidad = evento.modalidad || "Modalidad por confirmar";

  if (isOnline || !evento.ciudad) return modalidad;

  return `${modalidad} · ${evento.ciudad}`;
}
