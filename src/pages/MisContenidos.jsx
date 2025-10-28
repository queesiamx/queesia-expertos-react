// src/pages/MisContenidos.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import UnifiedNavbar from "../components/UnifiedNavbar";

export default function MisContenidos() {
  const [items, setItems] = useState([]);          // compras enriquecidas con el contenido (si existe)
  const [cargando, setCargando] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // 1) Guard básico: primero esperamos al contexto
  if (loading) return <p className="p-4">Cargando contenidos…</p>;
  if (!user) return <Navigate to="/login" replace />;

  // 2) Cargar compras del usuario y (si hay) el detalle del contenido
  useEffect(() => {
    let cancel = false;

    const cargar = async () => {
      try {
        const q = query(
          collection(db, "comprasContenido"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const compras = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Enriquecer con datos del contenido (si viene contenidoId)
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
    return () => { cancel = true; };
  }, [user.uid]);

  return (
    <div>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mis contenidos adquiridos</h1>

        {cargando && <p>Cargando…</p>}

        {!cargando && items.length === 0 && (
          <p className="text-gray-700">Aún no has adquirido contenidos.</p>
        )}

        {!cargando && items.length > 0 && (
          <ul className="space-y-4">
            {items.map((it) => {
              const c = it.contenido || {};
              return (
                <li key={it.id} className="border p-4 rounded shadow bg-white">
                  <h2 className="text-lg font-semibold">
                    {c.titulo || it.titulo || "Contenido adquirido"}
                  </h2>

                  <p className="text-sm text-gray-600 mb-1">
                    {c.descripcion || it.descripcion || "Sin descripción"}
                  </p>

                  {c.fechaPublicacion && (
                    <p className="text-xs text-gray-500">
                      Publicado el: {new Date(c.fechaPublicacion).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-3 flex gap-4">
                    {(c.archivoUrl || it.archivoUrl) && (
                      <a
                        href={c.archivoUrl || it.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Ver archivo
                      </a>
                    )}

                    {(c.id || it.contenidoId) && (
                      <button
                        onClick={() => navigate(`/mis-contenidos/${c.id || it.contenidoId}`)}
                        className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                      >
                        Ver detalles
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
