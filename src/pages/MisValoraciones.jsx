// src/pages/MisValoraciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

const AppHeader = ({ app }) => (
  <div className="flex items-center gap-3">
    {app?.logo ? (
      <img src={app.logo} alt={app.name} className="w-8 h-8 rounded-md border" />
    ) : (
      <div className="w-8 h-8 rounded-md bg-gray-200 grid place-items-center text-xs text-gray-600">
        APP
      </div>
    )}
    <div className="font-semibold">{app?.name || `App #${app?.id || "-"}`}</div>
  </div>
);

export default function MisValoraciones() {
  const { user, loading } = useAuth();

  // estado
  const [cargando, setCargando] = useState(true);
  const [ratings, setRatings] = useState([]);   // {id, appId, rating, timestamp, userId}
  const [comments, setComments] = useState([]); // {id, appId, text, timestamp, user:{...}}
  const [appsMeta, setAppsMeta] = useState({}); // appId -> {id, name, logo}

  // guardia: primero esperamos al contexto; si no hay sesión, al login
  if (loading) return <p className="p-4">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;

  // fetch de ratings y comments del usuario
  useEffect(() => {
    let cancel = false;

    const cargar = async () => {
      try {
        // 1) ratings del usuario
        const qr = query(
          collection(db, "ratings"),
          where("userId", "==", user.uid)
        );
        const sr = await getDocs(qr);
        const _ratings = sr.docs.map((d) => ({ id: d.id, ...d.data() }));

        // 2) comments del usuario
        const qc = query(
          collection(db, "comments"),
          where("userId", "==", user.uid)
        );
        const sc = await getDocs(qc);
        const _comments = sc.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (cancel) return;

        setRatings(_ratings);
        setComments(_comments);

        // 3) cargar metadata de apps únicas (si tienes colección apps)
        const ids = Array.from(
          new Set([
            ..._ratings.map((r) => r.appId).filter(Boolean),
            ..._comments.map((c) => c.appId).filter(Boolean),
          ])
        );

        const metas = {};
        await Promise.all(
          ids.map(async (id) => {
            try {
              const ref = doc(db, "apps", String(id));
              const ds = await getDoc(ref);
              if (ds.exists()) metas[id] = { id, ...ds.data() };
              else metas[id] = { id };
            } catch {
              metas[id] = { id };
            }
          })
        );

        if (!cancel) setAppsMeta(metas);
      } finally {
        if (!cancel) setCargando(false);
      }
    };

    cargar();
    return () => {
      cancel = true;
    };
  }, [user.uid]);

  // agrupar por app y ordenar por actividad más reciente
  const grouped = useMemo(() => {
    const byApp = {};
    ratings.forEach((r) => {
      byApp[r.appId] ??= { appId: r.appId, ratings: [], comments: [] };
      byApp[r.appId].ratings.push(r);
    });
    comments.forEach((c) => {
      byApp[c.appId] ??= { appId: c.appId, ratings: [], comments: [] };
      byApp[c.appId].comments.push(c);
    });

    const toMillis = (t) => (t?.toMillis ? t.toMillis() : t || 0);

    return Object.values(byApp).sort((a, b) => {
      const ta = Math.max(0, ...a.ratings.map((x) => toMillis(x.timestamp)), ...a.comments.map((x) => toMillis(x.timestamp)));
      const tb = Math.max(0, ...b.ratings.map((x) => toMillis(x.timestamp)), ...b.comments.map((x) => toMillis(x.timestamp)));
      return tb - ta;
    });
  }, [ratings, comments]);

  return (
    <>
      <UnifiedNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold italic flex items-center gap-2 mb-6">
          <span>🏅</span> Mis valoraciones <span>🏅</span>
        </h1>

        {cargando ? (
          <p className="text-gray-600">Cargando…</p>
        ) : grouped.length === 0 ? (
          <div className="bg-white/70 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <p className="text-gray-700">Aún no has calificado ni comentado apps.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((g) => {
              const app = appsMeta[g.appId] || { id: g.appId };
              return (
                <article
                  key={g.appId}
                  className="bg-white border border-yellow-200 shadow-md rounded-2xl overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <AppHeader app={app} />
                      <a
                        href={`https://queesia.com/app/${g.appId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver app →
                      </a>
                    </div>

                    {/* Calificaciones */}
                    {g.ratings.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Calificaciones</h3>
                        <ul className="space-y-2">
                          {g.ratings.map((r) => {
                            const t = r.timestamp?.toMillis
                              ? r.timestamp.toMillis()
                              : r.timestamp;
                            return (
                              <li
                                key={r.id}
                                className="text-sm text-gray-800 flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-medium">⭐ {r.rating}</span>
                                  {t ? (
                                    <span className="ml-2 text-gray-500">
                                      {new Date(t).toLocaleString()}
                                    </span>
                                  ) : null}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Comentarios */}
                    {g.comments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Comentarios</h3>
                        <ul className="space-y-3">
                          {g.comments.map((c) => {
                            const t = c.timestamp?.toMillis
                              ? c.timestamp.toMillis()
                              : c.timestamp;
                            return (
                              <li
                                key={c.id}
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3"
                              >
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                  {c.text}
                                </p>
                                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                  {t ? <span>{new Date(t).toLocaleString()}</span> : null}
                                  {typeof c.likes === "number" && (
                                    <span>• 👍 {c.likes}</span>
                                  )}
                                  {typeof c.dislikes === "number" && (
                                    <span>• 👎 {c.dislikes}</span>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
