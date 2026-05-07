// src/pages/MisContenidos.jsx
import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import ExpertShell from "@/components/expert/ExpertShell";

export default function MisContenidos() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !user) return;

    let cancel = false;

    const cargar = async () => {
      try {
        setCargando(true);

        const q = query(
          collection(db, "comprasContenido"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);
        const compras = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const enriquecidas = await Promise.all(
          compras.map(async (c) => {
            if (!c.contenidoId) return c;

            try {
              const ref = doc(db, "contenidosExpertos", c.contenidoId);
              const ds = await getDoc(ref);

              return ds.exists()
                ? { ...c, contenido: { id: ds.id, ...ds.data() } }
                : c;
            } catch {
              return c;
            }
          })
        );

        if (!cancel) setItems(enriquecidas);
      } finally {
        if (!cancel) setCargando(false);
      }
    };

    cargar();

    return () => {
      cancel = true;
    };
  }, [loading, user]);

  if (loading) {
    return (
      <ExpertShell
        title="Mis contenidos"
        subtitle="Consulta los contenidos y servicios adquiridos."
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando contenidos…
        </div>
      </ExpertShell>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpertShell
      title="Mis contenidos"
      subtitle="Consulta los contenidos que has adquirido o tienes disponibles."
    >
      {cargando && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando…
        </div>
      )}

      {!cargando && items.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Aún no has adquirido contenidos.
        </div>
      )}

      {!cargando && items.length > 0 && (
        <div className="grid gap-4">
          {items.map((it) => {
            const c = it.contenido || {};

            return (
              <article
                key={it.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {c.titulo || it.titulo || "Contenido adquirido"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      {c.descripcion || it.descripcion || "Sin descripción"}
                    </p>

                    {c.fechaPublicacion && (
                      <p className="mt-2 text-xs text-slate-400">
                        Publicado el:{" "}
                        {new Date(c.fechaPublicacion).toLocaleDateString(
                          "es-MX"
                        )}
                      </p>
                    )}

                    {it.estado && (
                      <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Estado: {it.estado}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {c.archivoUrl && (
                      <a
                        href={c.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Ver contenido
                      </a>
                    )}

                    {c.id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/contenido/${c.id}`)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Ver detalle
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </ExpertShell>
  );
}