// src/pages/VistaDetalleContenido.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import UnifiedNavbar from "../components/UnifiedNavbar";

export default function VistaDetalleContenido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, loading: loadingAuth } = useAuth();
  const [contenido, setContenido] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchContenido() {
      try {
        setLoadingDoc(true);
        const ref = doc(db, "contenidosExpertos", id); // colec. donde guardas contenidos
        const snap = await getDoc(ref);
        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data();

          // normaliza fecha
          let fechaPublicacion = data.fechaPublicacion;
          if (fechaPublicacion?.toDate) fechaPublicacion = fechaPublicacion.toDate();

          // normaliza temario (string -> array)
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

  if (loadingAuth || loadingDoc) return <p className="p-4">Cargando contenido…</p>;
  if (error) return (
    <div>
      <UnifiedNavbar />
      <div className="max-w-4xl mx-auto p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 inline-block bg-slate-100 hover:bg-white border rounded px-3 py-2"
        >
          Regresar
        </button>
      </div>
    </div>
  );
  if (!contenido) return null;

  return (
    <div>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">{contenido.titulo}</h1>
        {contenido.descripcion && (
          <p className="text-sm text-gray-700 mb-2">{contenido.descripcion}</p>
        )}

        {contenido.fechaPublicacion && (
          <p className="text-xs text-gray-500 mb-2">
            Publicado el:{" "}
            {contenido.fechaPublicacion instanceof Date
              ? contenido.fechaPublicacion.toLocaleDateString()
              : new Date(contenido.fechaPublicacion).toLocaleDateString()}
          </p>
        )}

        {contenido.autor && (
          <p className="text-sm mb-2">
            <strong>Autor:</strong> {contenido.autor}
          </p>
        )}

        {contenido.duracion && (
          <p className="text-sm mb-2">
            <strong>Duración estimada:</strong> {contenido.duracion}
          </p>
        )}

        {Array.isArray(contenido.temario) && contenido.temario.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Temario</h2>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {contenido.temario.map((tema, idx) => (
                <li key={idx}>{tema}</li>
              ))}
            </ul>
          </div>
        )}

        {contenido.archivoUrl && (
          <div className="mt-4">
            <a
              href={contenido.archivoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded inline-block"
            >
              Acceder al archivo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
