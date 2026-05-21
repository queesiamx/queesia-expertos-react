import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  Building2,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";

const API_BASE = "https://queesia.com/api/calendario/obtener_evento.php";

function formatDate(dateString) {
  if (!dateString) return "Fecha por confirmar";

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function formatTime(timeString) {
  if (!timeString) return null;
  return timeString.slice(0, 5);
}

export default function AgendaEventoDetalle() {
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarEvento() {
      try {
        const res = await fetch(`${API_BASE}?id=${id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.message || "No se pudo cargar el evento");
        }

        setEvento(data.evento);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    cargarEvento();
  }, [id]);

  const imagenesEvento = evento
    ? [evento.imagen_url, evento.captura_url].filter(Boolean)
    : [];

  return (
    <>
      <UnifiedNavbar />

      <main className="min-h-screen bg-transparent px-4 pb-20 pt-16 text-slate-900 sm:px-6">
        <section className="mx-auto max-w-5xl">
          <Link
            to="/agenda-ia"
            className="mb-8 inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl hover:no-underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Agenda IA
          </Link>

          {loading ? (
            <div className="rounded-3xl border border-white/60 bg-white/65 p-8 text-center shadow-xl backdrop-blur-xl">
              Cargando evento...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-white/60 bg-white/65 p-8 text-center shadow-xl backdrop-blur-xl">
              {error}
            </div>
          ) : (
            <article className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/65 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <EventImageCarousel
                imagenes={imagenesEvento}
                titulo={evento.titulo}
                destacado={Number(evento.destacado) === 1}
              />

              <div className="p-6 sm:p-10">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-500">
                  {evento.categoria || "Evento"}
                </p>

                <h1 className="font-montserrat text-3xl font-extrabold italic tracking-tight text-slate-900 sm:text-5xl">
                  {evento.titulo}
                </h1>

                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  {evento.descripcion_corta}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <InfoItem
                    icon={<CalendarDays />}
                    label="Fecha"
                    value={`${formatDate(evento.fecha_inicio)}${
                      evento.fecha_fin && evento.fecha_fin !== evento.fecha_inicio
                        ? ` al ${formatDate(evento.fecha_fin)}`
                        : ""
                    }`}
                  />

                  <InfoItem
                    icon={<Clock />}
                    label="Hora"
                    value={
                      formatTime(evento.hora_inicio)
                        ? `${formatTime(evento.hora_inicio)} h`
                        : "Por confirmar"
                    }
                  />

                  <InfoItem
                    icon={
                      evento.modalidad?.toLowerCase().includes("línea") ||
                      evento.modalidad?.toLowerCase().includes("online") ? (
                        <Video />
                      ) : (
                        <MapPin />
                      )
                    }
                    label="Modalidad"
                    value={`${evento.modalidad || "Por confirmar"}${
                      evento.ciudad ? ` · ${evento.ciudad}` : ""
                    }`}
                  />

                  <InfoItem
                    icon={<Building2 />}
                    label="Organizador"
                    value={evento.organizador || "Por confirmar"}
                  />

                  <InfoItem
                    icon={<Tag />}
                    label="Costo"
                    value={evento.costo || "Por confirmar"}
                  />

                  <InfoItem
                    icon={<MapPin />}
                    label="Ubicación"
                    value={`${evento.pais || "México"}${
                      evento.estado ? ` · ${evento.estado}` : ""
                    }`}
                  />
                </div>

                {evento.descripcion_larga && (
                  <div className="mt-10 rounded-3xl border border-white/60 bg-white/50 p-6 leading-relaxed text-slate-700">
                    <h2 className="mb-3 text-xl font-bold text-slate-900">
                      Descripción
                    </h2>
                    <p className="whitespace-pre-line">
                      {evento.descripcion_larga}
                    </p>
                  </div>
                )}

                {evento.tags && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {evento.tags
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-indigo-100 bg-white/70 px-3 py-1 text-sm font-medium text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

                <div className="mt-10 flex flex-wrap gap-3">
                  {evento.url_evento && (
                    <a
                      href={evento.url_evento}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg hover:no-underline"
                    >
                      Ir al sitio oficial
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {evento.fuente_url && (
                    <a
                      href={evento.fuente_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 shadow-md hover:no-underline"
                    >
                      Ver fuente
                      <LinkIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

function EventImageCarousel({ imagenes, titulo, destacado }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (imagenes.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % imagenes.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [imagenes.length]);

  return (
    <div className="relative h-72 overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-sky-100">
      {imagenes.length > 0 ? (
        <img
          src={imagenes[index]}
          alt={`${titulo} - imagen ${index + 1}`}
          className="h-full w-full object-cover transition-all duration-700"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <CalendarDays className="h-20 w-20 text-indigo-500" />
        </div>
      )}

      {destacado && (
        <span className="absolute left-6 top-6 rounded-full bg-black/75 px-4 py-2 text-sm font-semibold text-white">
          Destacado
        </span>
      )}

      {imagenes.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {imagenes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-white" : "w-2.5 bg-white/55"
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-white/50 p-5 shadow-md backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-indigo-600">
        <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        {label}
      </div>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}