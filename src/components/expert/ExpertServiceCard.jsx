import React from "react";

function getTipoClass(tipo) {
  if (tipo === "consulta") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }

  if (tipo === "curso") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  return "bg-violet-100 text-violet-700 border-violet-200";
}

function getTipoLabel(tipo) {
  if (tipo === "consulta") return "consulta";
  if (tipo === "curso") return "curso";
  if (tipo === "manual") return "manual";
  return tipo || "servicio";
}

function formatPrice(precio) {
  if (!precio) return "gratuito";

  const n = Number(precio);
  if (Number.isNaN(n)) return "gratuito";

  return `$${n.toFixed(2)}`;
}

function getFechaPrincipal(contenido) {
  if (contenido?.tipoContenido === "consulta") return "Siempre disponible";

  if (Array.isArray(contenido?.fechasDisponibles) && contenido.fechasDisponibles.length > 0) {
    return contenido.fechasDisponibles[0];
  }

  return "Sin fecha";
}

export default function ExpertServiceCard({
  contenido,
  onDelete,
  onAddDate,
}) {
  const tipo = contenido?.tipoContenido || "servicio";
  const isCurso = tipo === "curso";
  const isConsulta = tipo === "consulta";
  const precio = formatPrice(contenido?.precio);
  const fechaPrincipal = getFechaPrincipal(contenido);

  return (
    <article
      className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${
        isConsulta ? "border-amber-200 bg-amber-50/20" : "border-slate-200"
      }`}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-center">
        {/* Meta lateral */}
        <div className="flex flex-wrap items-center gap-2 lg:block lg:space-y-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-semibold ${getTipoClass(
                tipo
              )}`}
            >
              {getTipoLabel(tipo)}
            </span>

            <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-2.5 text-xs font-semibold text-slate-700">
              {precio}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Activo</span>
          </div>

          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <span>📅</span>
            <span className="truncate">{fechaPrincipal}</span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="min-w-0 border-slate-100 lg:border-l lg:pl-5">
          <h3 className="truncate text-base font-bold text-slate-900">
            {contenido?.titulo || "Servicio sin título"}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {contenido?.descripcion || "Sin descripción."}
          </p>

          {Array.isArray(contenido?.fechasDisponibles) &&
            contenido.fechasDisponibles.length > 0 && (
              <p className="mt-2 line-clamp-1 text-sm text-slate-700">
                <span className="font-semibold">Fechas disponibles: </span>
                {contenido.fechasDisponibles.join(", ")}
              </p>
            )}

          {isConsulta && (
            <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              <span>ⓘ</span>
              <span>Sujeto a aplicación de costos</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
          {isCurso && (
            <button
              type="button"
              onClick={() => onAddDate?.(contenido)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
            >
              Agregar fecha
            </button>
          )}

          <button
            type="button"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Editar
          </button>

          {contenido?.archivoUrl && (
            <a
              href={contenido.archivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Ver archivo
            </a>
          )}

          <button
            type="button"
            onClick={() => onDelete?.(contenido.id, contenido.public_id)}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-3 text-sm font-medium text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}