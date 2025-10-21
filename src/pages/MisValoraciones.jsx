// src/pages/MisValoraciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import toast from "react-hot-toast";

const AppHeader = ({ app }) => (
  <div className="flex items-center gap-3">
    {app?.logo ? (
      <img src={app.logo} alt={app.name} className="w-8 h-8 rounded-md border" />
    ) : (
      <div className="w-8 h-8 rounded-md bg-gray-200 grid place-items-center text-xs text-gray-600">APP</div>
    )}
    <div className="font-semibold">{app?.name || `App #${app?.id || "-"}`}</div>
  </div>
);

export default function MisValoraciones() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);   // {appId, rating, timestamp, userId}
  const [comments, setComments] = useState([]); // {appId, text, timestamp, user:{email,name,photo}}
  const [appsMeta, setAppsMeta] = useState({}); // appId -> {id,name,logo}

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setRatings([]);
        setComments([]);
        setLoading(false);
        return;
      }
      setUser(u);

      try {
        // 1) Ratings del usuario
        const qR = query(collection(db, "ratings"), where("userId", "==", u.uid));
        const snapR = await getDocs(qR);
        const r = snapR.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRatings(r);

        // 2) Comments del usuario (según tu estructura usa user.email)
        const qC = query(collection(db, "comments"), where("user.email", "==", u.email));
        const snapC = await getDocs(qC);
        const c = snapC.docs.map((d) => ({ id: d.id, ...d.data() }));
        setComments(c);

        // 3) (Opcional) Traer metadatos de apps (nombre/logo) para las appId involucradas
        const ids = Array.from(new Set([...r.map(x => x.appId), ...c.map(x => x.appId)]));
        const meta = {};
        // Ajusta esta función a tu API real
        const fetchMeta = async (appId) => {
  try {
    // Ejemplo de endpoint — cámbialo por el tuyo
    const res = await fetch(`https://queesia.com/api/obtener_app.php?id=${encodeURIComponent(appId)}`);
    const data = await res.json();

    // Ajusta los nombres de campos según tu API
    meta[appId] = {
      id: appId,
      name: data?.app?.name || `App #${appId}`,
      logo: data?.app?.logo_filename
        ? `https://queesia.com/logos/${data.app.logo_filename}.png` // <-- aquí añadimos la extensión
        : null,
    };
  } catch {
    meta[appId] = { id: appId, name: `App #${appId}`, logo: null };
  }
};

        await Promise.all(ids.map(fetchMeta));
        setAppsMeta(meta);
      } catch (e) {
        console.error(e);
        toast.error("No se pudo cargar tu historial.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

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
    // Orden por timestamp desc (toma el más reciente de cada grupo)
    return Object.values(byApp).sort((a, b) => {
      const ta = Math.max(
        0,
        ...a.ratings.map(x => x.timestamp?.toMillis ? x.timestamp.toMillis() : x.timestamp || 0),
        ...a.comments.map(x => x.timestamp?.toMillis ? x.timestamp.toMillis() : x.timestamp || 0),
      );
      const tb = Math.max(
        0,
        ...b.ratings.map(x => x.timestamp?.toMillis ? x.timestamp.toMillis() : x.timestamp || 0),
        ...b.comments.map(x => x.timestamp?.toMillis ? x.timestamp.toMillis() : x.timestamp || 0),
      );
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

        {loading ? (
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
                <article key={g.appId} className="bg-white border border-yellow-200 shadow-md rounded-2xl overflow-hidden">
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <AppHeader app={app} />
                      {/* Link a la app en tu sitio: ajusta la ruta si es distinta */}
                      <a
                        href={`https://queesia.com/app/${g.appId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver app →
                      </a>
                    </div>

                    {/* Ratings */}
                    {g.ratings.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Calificaciones</h3>
                        <ul className="space-y-2">
                          {g.ratings.map((r) => {
                            const ts = r.timestamp?.toMillis ? r.timestamp.toMillis() : r.timestamp;
                            return (
                              <li key={r.id} className="text-sm text-gray-800 flex items-center justify-between">
                                <div>
                                  <span className="font-medium">⭐ {r.rating}</span>
                                  {ts ? <span className="ml-2 text-gray-500">{new Date(ts).toLocaleString()}</span> : null}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {/* Comments */}
                    {g.comments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Comentarios</h3>
                        <ul className="space-y-3">
                          {g.comments.map((c) => {
                            const ts = c.timestamp?.toMillis ? c.timestamp.toMillis() : c.timestamp;
                            return (
                              <li key={c.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.text}</p>
                                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                  {ts ? <span>{new Date(ts).toLocaleString()}</span> : null}
                                  {typeof c.likes === "number" && <span>• 👍 {c.likes}</span>}
                                  {typeof c.dislikes === "number" && <span>• 👎 {c.dislikes}</span>}
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
