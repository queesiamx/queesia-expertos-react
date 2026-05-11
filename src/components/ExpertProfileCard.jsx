// src/components/ExpertProfileCard.jsx

import React from "react";

function getAvatar(expert) {
  return (
    expert?.fotoPerfilURL ||
    expert?.fotoPerfil ||
    expert?.foto ||
    expert?.photoURL ||
    expert?.avatar ||
    ""
  );
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

function getArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;\n]/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function pickText(...values) {
  return values.find((v) => typeof v === "string" && v.trim())?.trim() || "";
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ring-1 ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function InfoBox({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      <p className="text-xs font-semibold text-slate-400">{title}</p>
      <div className="mt-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

export default function ExpertProfileCard({
  expert,
  onEdit,
  onUpload,
  publicHref,
}) {
  const nombre = expert?.nombre || "Experto";
  const especialidad =
    expert?.especialidad || expert?.titulo || "Especialidad no especificada";

  const avatar = getAvatar(expert);

  const resumen = pickText(
    expert?.resumen,
    expert?.summary,
    expert?.sobreMi,
    expert?.acercaDe,
    expert?.bio,
    expert?.descripcion,
    expert?.experiencia
  );

  const experiencia = pickText(
    expert?.experienciaProfesional,
    expert?.experienciaDetalle,
    expert?.trayectoria
  );

  const educacion = getArray(expert?.educacion);
  const certificaciones = getArray(expert?.certificaciones);

  const email = expert?.email || expert?.correo || expert?.contactoEmail || "";
  const linkedin = expert?.linkedin || expert?.linkedIn || "";

  const cvUrl = expert?.cvUrl || expert?.cvURL || expert?.archivoCV || "";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      {/* Header principal */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={nombre}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-50 md:h-28 md:w-28"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full bg-slate-200 text-xl font-bold text-slate-500 ring-4 ring-slate-50 md:h-28 md:w-28">
                {getInitials(nombre)}
              </div>
            )}

            <span className="absolute bottom-2 right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-emerald-500 text-xs text-white">
              ✓
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-extrabold leading-tight text-slate-950 md:text-3xl">
              {nombre}
            </h2>

            <p className="mt-1 text-base font-semibold text-blue-700">
              {especialidad}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {expert?.aprobado && <Badge tone="green">VERIFICADO</Badge>}
              <Badge tone="blue">Responde rápido</Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="h-10 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Editar perfil
                </button>
              )}

              {onUpload && (
                <button
                  type="button"
                  onClick={onUpload}
                  className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Cargar contenidos
                </button>
              )}

              {publicHref && (
                <a
                  href={publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Ver perfil público ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de información */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <InfoBox title="Resumen">
            {resumen || (
              <span className="text-slate-400">
                Aún no has agregado un resumen.
              </span>
            )}
          </InfoBox>

          <InfoBox title="Experiencia">
            {experiencia || (
              <span className="text-slate-400">
                Aún no has agregado experiencia.
              </span>
            )}
          </InfoBox>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoBox title="Educación">
              {educacion.length > 0 ? (
                <ul className="list-inside list-disc space-y-1">
                  {educacion.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400">
                  Aún no has agregado educación.
                </span>
              )}
            </InfoBox>

            <InfoBox title="Certificaciones">
              {certificaciones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {certificaciones.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">
                  Aún no has agregado certificaciones.
                </span>
              )}
            </InfoBox>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <InfoBox title="Contacto">
            <div className="space-y-1">
              {email ? (
                <p className="break-all">{email}</p>
              ) : (
                <p className="text-slate-400">Sin correo visible.</p>
              )}

              {linkedin ? (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline"
                >
                  LinkedIn
                </a>
              ) : (
                <p className="text-slate-400">LinkedIn no registrado.</p>
              )}
            </div>
          </InfoBox>

          <InfoBox title="Atajos">
            <div className="flex flex-wrap gap-2">
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Descargar CV
                </a>
              )}

              <a
                href={publicHref || "#"}
                className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Ver reseñas
              </a>

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-9 items-center rounded-lg bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  Ajustes de cuenta
                </button>
              )}
            </div>
          </InfoBox>
        </div>
      </div>
    </section>
  );
}