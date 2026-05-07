// src/pages/VistaDetalleContenido.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import ExpertShell from "@/components/expert/ExpertShell";

export default function VistaDetalleContenido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading: loadingAuth } = useAuth();
  const [contenido, setContenido] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchContenido() {
      try {
        setLoadingDoc(true);

        const ref = doc(db, "contenidosExpertos", id);
        const snap = await getDoc(ref);

        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data();

          let fechaPublicacion = data.fechaPublicacion;
          if (fechaPublicacion?.toDate) {
            fechaPublicacion = fechaPublicacion.toDate();
          }

          let temario = data.temario;
          if (typeof temario === "string") {
            temario = temario
              .split(/\r?\n|;/)
              .map((s) => s.trim())
              .filter(Boolean);
          }

          setContenido({ id: snap.id, ...data, fechaPublicacion, temario });
          setError("");
        } else {
          setContenido(null);
          setError("Contenido no encontrado.");
        }
      } catch (e) {
        console.error(e);
        setError("No se pudo cargar el contenido.");
      } finally {
        if (isMounted) setLoadingDoc(false);
      }
    }

    if (id) fetchContenido();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const d = fecha instanceof Date ? fecha : new Date(fecha);

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loadingAuth || loadingDoc) {
    return (
      <ExpertShell
        title="Detalle de contenido"
        subtitle="Cargando información del contenido seleccionado."
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando contenido…
        </div>
      </ExpertShell>
    );
  }

  if (error) {
    return (
      <ExpertShell
        title="Detalle de contenido"
        subtitle="No fue posible cargar este contenido."
      >
        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-red-600">{error}</p>

          <button
            onClick={() => navigate(-1)}
            className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Regresar
          </button>
        </div>
      </ExpertShell>
    );
  }

  if (!contenido) return null;

  return (
    <ExpertShell
      title={contenido.titulo || "Detalle de contenido"}
      subtitle="Revisa la información completa del contenido publicado."
    >
      <div className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {contenido.descripcion && (
          <p className="text-sm leading-6 text-slate-700">
            {contenido.descripcion}
          </p>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {contenido.fechaPublicacion && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Publicado el
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatearFecha(contenido.fechaPublicacion)}
              </p>
            </div>
          )}

          {contenido.autor && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Autor
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {contenido.autor}
              </p>
            </div>
          )}

          {contenido.duracion && (
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Duración estimada
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {contenido.duracion}
              </p>
            </div>
          )}
        </div>

        {Array.isArray(contenido.temario) && contenido.temario.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-slate-900">Temario</h2>

            <ul className="mt-3 space-y-2">
              {contenido.temario.map((tema, idx) => (
                <li
                  key={idx}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {tema}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          {contenido.archivoUrl && (
            <a
              href={contenido.archivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Acceder al archivo
            </a>
          )}

          <button
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Regresar
          </button>
        </div>
      </div>
    </ExpertShell>
  );
}