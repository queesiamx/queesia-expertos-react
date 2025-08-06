import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import UnifiedNavbar from "../components/UnifiedNavbar";


export default function VistaDetalleContenido() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contenido, setContenido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesionYObtenerContenido = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          navigate('/login'); // Redirige si no está autenticado
          return;
        }

        try {
          const docRef = doc(db, 'contenidosExpertos', id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setContenido({ id: docSnap.id, ...docSnap.data() });
          } else {
            setContenido(null);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error al obtener contenido:', error);
          setLoading(false);
        }
      });
    };

    verificarSesionYObtenerContenido();
  }, [id, navigate]);

  if (loading) return <p className="p-4">Cargando contenido...</p>;
  if (!contenido) return <p className="p-4 text-red-500">Contenido no encontrado.</p>;

  return (
    <div>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-2">{contenido.titulo}</h1>
        <p className="text-sm text-gray-600 mb-2">{contenido.descripcion}</p>

        {contenido.fechaPublicacion && (
          <p className="text-xs text-gray-500 mb-2">
            Publicado el: {new Date(contenido.fechaPublicacion).toLocaleDateString()}
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

        {contenido.temario && (
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
