// src/components/ExpertProfileCard.jsx
import React from "react";
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText,
  DollarSign,
  CheckCircle,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

export default function ExpertProfileCard({ expert }) {
  // Se conserva tu helper (no se toca la “lógica”)
  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower?.includes("curso"))
      return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower?.includes("asesoría") || lower?.includes("asesoria"))
      return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower?.includes("manual"))
      return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  return (
    // Card principal como en el mock: borde sutil, sombra suave, padding amplio
    <section className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_25px_-10px_rgba(2,6,23,0.12)] p-6 md:p-8">
      {/* Header centrado: avatar, nombre, especialidad y chips */}
      <div className="flex flex-col items-center text-center">
        <img
          src={expert?.fotoPerfilURL || "/avatar-placeholder.png"}
          alt={expert?.nombre || "Experto"}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover ring-2 ring-white shadow-md"
        />
        <h2 className="mt-3 text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
          {expert?.nombre || "Tu nombre"}
        </h2>
        <p className="text-sm md:text-[15px] text-blue-700">
          {expert?.especialidad || "Especialidad"}
        </p>

        {/* Badges */}
        <div className="mt-2 flex items-center gap-2">
          {expert?.aprobado && (
            <span className="px-2.5 h-6 inline-flex items-center rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
              VERIFICADO
            </span>
          )}
          <span className="px-2.5 h-6 inline-flex items-center rounded-full text-[11px] font-semibold bg-sky-100 text-sky-700">
            Responde rápido
          </span>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm"
            data-testid="btn-editar-perfil"
          >
            Editar perfil
          </button>
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            data-testid="btn-cargar-contenidos"
          >
            Cargar contenidos
          </button>
          <a
            href={`/expertos/${expert?.id || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Ver perfil público
          </a>
        </div>
      </div>

      {/* Detalles en sub-tarjetas (como el mock): dos columnas + lateral */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-3">
          <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
            <div className="text-[12px] font-medium text-slate-500 mb-1">
              Resumen
            </div>
            <p className="rich-text whitespace-pre-line text-sm leading-relaxed text-slate-700">
+              {expert?.experiencia ||
+                "Agrega un breve resumen de tu experiencia e impacto."}
+           </p>
          </div>

          {/* Experiencia laboral */}
          <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
            <div className="text-[12px] font-medium text-slate-500 mb-1">
              Experiencia
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              {(expert?.experiencias || []).map((e, i) => (
                <li
                  key={i}
                  className="rounded-lg ring-1 ring-slate-100 p-3 bg-white"
                >
                  <div className="font-medium">{e?.titulo || "Puesto"}</div>
                  <div className="text-slate-500 text-xs">{e?.periodo || ""}</div>
                  {e?.detalle && (
                    <div className="rich-text whitespace-pre-line mt-1 text-[13px] leading-relaxed">
                      {e.detalle}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Educación + Certificaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
              <div className="text-[12px] font-medium text-slate-500 mb-1">
                Educación
              </div>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {(expert?.educacion || []).map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
              <div className="text-[12px] font-medium text-slate-500 mb-1">
                Certificaciones
              </div>
              <ul className="flex flex-wrap gap-2">
                {(expert?.certificaciones || []).map((c, i) => (
                  <span
                    key={i}
                    className="px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Lateral: contacto / atajos */}
        <aside className="space-y-3">
          <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
            <div className="text-[12px] font-medium text-slate-500 mb-1">
              Contacto
            </div>
            <div className="text-sm text-slate-700 space-y-1">
              {expert?.email && <div className="truncate">{expert.email}</div>}
              {expert?.linkedin && (
                <a
                  href={expert.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn
                </a>
              )}
              {expert?.ciudad && (
                <div className="text-slate-500 text-xs">{expert.ciudad}</div>
              )}
            </div>
          </div>

          <div className="rounded-xl ring-1 ring-slate-200 p-4 bg-white">
            <div className="text-[12px] font-medium text-slate-500 mb-2">
              Atajos
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="h-8 px-3 rounded-lg text-xs bg-white ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm">
                Descargar CV
              </button>
              <button className="h-8 px-3 rounded-lg text-xs bg-white ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm">
                Ver reseñas
              </button>
              <button className="h-8 px-3 rounded-lg text-xs bg-white ring-1 ring-slate-200 hover:bg-slate-50 shadow-sm">
                Ajustes de cuenta
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
