import { useNavigate } from "react-router-dom";
import { useState } from "react";

/* -------------------------------- Helpers -------------------------------- */

function clampStyle(lines = 2) {
  return {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };
}

function getInitials(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function getAvatar(expert) {
  return (
    expert?.fotoPerfilURL ||
    expert?.fotoPerfil ||
    expert?.photoURL ||
    expert?.imagen ||
    expert?.imageUrl ||
    expert?.avatar ||
    expert?.profileImage ||
    ""
  );
}

function getTiposOfrecidos(expert) {
  if (!Array.isArray(expert?.servicios)) return [];

  return [
    ...new Set(
      expert.servicios
        .map((s) => {
          if (typeof s === "string") return s;
          return s?.tipoContenido || s?.tipo || s?.categoria || s?.nombre || "";
        })
        .filter(Boolean)
    ),
  ].slice(0, 3);
}

function getTags(expert) {
  const skills = Array.isArray(expert?.habilidades)
    ? expert.habilidades.filter(Boolean).slice(0, 3)
    : [];

  const tipos = getTiposOfrecidos(expert);

  return (skills.length ? skills : tipos).slice(0, 3);
}

/* -------------------------------- Icons -------------------------------- */

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 8v5h4v-2h-2V8h-2Zm0-6a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4Z"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="currentColor" d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm13 8H6v10h14V10ZM6 8h14V6H6v2Zm11.3 5.3-1.4-1.4-4.4 4.4-2.1-2.1-1.4 1.4 3.5 3.5 5.8-5.8Z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2 5 5v6c0 4.55 2.91 8.77 7 10 4.09-1.23 7-5.45 7-10V5l-7-3Zm3.3 7.3-4.2 4.2-1.8-1.8-1.4 1.4 3.2 3.2 5.6-5.6-1.4-1.4Z"
      />
    </svg>
  );
}

/* ------------------------------- UI Pieces ------------------------------- */

function FavoriteButton() {
  const [fav, setFav] = useState(false);

  return (
    <button
      type="button"
      aria-label={fav ? "Quitar de favoritos" : "Guardar"}
      onClick={(e) => {
        e.stopPropagation();
        setFav((v) => !v);
      }}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-white transition ${
        fav
          ? "border-rose-200 bg-rose-50 text-rose-500"
          : "border-slate-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {fav ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function Rating({ rating = 0, reviews = 0 }) {
  const stars = Math.round(Number(rating || 0));

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm leading-none">
      <div className="flex shrink-0 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`h-4 w-4 ${
              i < stars ? "text-amber-400" : "text-slate-300"
            }`}
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        ))}
      </div>

      <span className="truncate text-[13px] text-slate-500">
        {Number(rating || 0).toFixed(1)} ({reviews || 0}{" "}
        {reviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

function Badge({ children, color = "slate", icon = null }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-indigo-50 text-indigo-700 border-indigo-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex h-7 max-w-full items-center gap-1 rounded-full border px-2.5 text-xs font-medium leading-none ${map[color]}`}
    >
      {icon}
      <span className="truncate">{children}</span>
    </span>
  );
}

function tagColor(tag = "", index = 0) {
  const value = tag.toLowerCase();

  if (value.includes("manual")) return "green";
  if (value.includes("consulta")) return "purple";
  if (value.includes("curso")) return "amber";

  return index % 3 === 0 ? "green" : index % 3 === 1 ? "purple" : "amber";
}

/* -------------------------------- Card -------------------------------------- */

export default function ExpertCard({
  expert,
  variant = "public",
  onView,
  showFavorite = true,
}) {
  const navigate = useNavigate();
  const isAdmin = variant === "admin";

  const nombre = expert?.nombre || "Experto/a";
  const titulo = expert?.especialidad || "Especialidad no especificada";
  const avatar = getAvatar(expert);
  const rating = expert?.calificacionPromedio || 0;
  const reviews = expert?.totalResenas || 0;
  const verificado = Boolean(expert?.verificado || expert?.aprobado);
  const tags = getTags(expert);
  const respuesta = expert?.tiempoRespuestaHoras;

  const handleView = (e) => {
    e?.stopPropagation?.();

    if (onView) {
      onView(expert);
      return;
    }

    if (expert?.id) {
      navigate(`/expertos/${expert.id}`);
    }
  };

  return (
    <article
      onClick={handleView}
      className="group relative flex min-h-[340px] cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-5 pb-3">
        {/* Header */}
<div className="min-h-[118px]">
  {/* Badge separado */}
  <div className="mb-3 flex h-7 items-center justify-end">
    {verificado ? (
      <Badge color="amber" icon={<ShieldIcon />}>
        VERIFICADO
      </Badge>
    ) : isAdmin ? (
      <Badge color="slate">PENDIENTE</Badge>
    ) : null}
  </div>

    {/* Identidad del experto */}
    <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-4">
      <div className="relative shrink-0">
        {avatar ? (
          <img
            src={avatar}
            alt={nombre}
            loading="lazy"
            className="h-16 w-16 rounded-full object-cover ring-4 ring-slate-50"
          />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-500 ring-4 ring-slate-50">
            {getInitials(nombre)}
          </div>
        )}

        <span className="absolute bottom-1 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
      </div>

      <div className="min-w-0 pt-0.5">
        <button
          type="button"
          onClick={handleView}
          className="block w-full text-left text-[16px] font-bold leading-tight text-slate-950 transition hover:text-blue-700"
          title={nombre}
        >
          <span style={clampStyle(2)}>{nombre}</span>
        </button>

        <p
          className="mt-1 text-[15px] font-medium leading-snug text-blue-700"
          style={clampStyle(2)}
          title={titulo}
        >
          {titulo}
        </p>
      </div>
    </div>
  </div>

        {/* Rating */}
        <div className="mt-3">
          <Rating rating={rating} reviews={reviews} />
        </div>

        {/* Chips: altura reservada para que todas las cards queden parejas */}
        <div className="mt-3 flex min-h-[30px] max-h-[30px] flex-wrap gap-2 overflow-hidden">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} color={tagColor(tag, index)}>
              {tag}
            </Badge>
          ))}
        </div>

        {/* Meta */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
                <BoltIcon />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  Responde rápido
                </p>
                <p className="truncate text-xs text-slate-500">
                  {typeof respuesta === "number"
                    ? `≈ ${respuesta} hora${respuesta === 1 ? "" : "s"}`
                    : "≈ 1–2 horas"}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CalendarIcon />
              </span>

              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-800">
                  {expert?.disponibleAhora ? "Disponible ahora" : "Disponibilidad"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {expert?.disponibleAhora
                    ? "En línea"
                    : expert?.disponibilidad || "Consultar agenda"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleView}
            className="h-11 flex-1 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Ver perfil
          </button>

          {showFavorite && <FavoriteButton />}
        </div>
      </div>
    </article>
  );
}