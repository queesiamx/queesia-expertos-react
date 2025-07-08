import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { app } from '../firebase';

export default function VistaPublicaContenidos({ expertoId }) {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const db = getFirestore(app);

      try {
        const q = query(
          collection(db, 'contenidosExpertos'),
          where('expertoId', '==', expertoId)
        );
        const snap = await getDocs(q);
        const datos = snap.docs.map(doc => doc.data());
        setContenidos(datos);
      } catch (err) {
        console.error('Error al cargar contenidos públicos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [expertoId]);

  const obtenerEtiquetaTipo = (url) => {
    if (url.endsWith('.pdf')) return 'PDF';
    if (url.match(/\.(jpg|jpeg|png)$/i)) return 'Imagen';
    if (url.endsWith('.mp4')) return 'Video';
    return 'Archivo';
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Contenidos disponibles</h2>

      {loading ? (
        <p className="text-gray-500">Cargando contenidos...</p>
      ) : contenidos.length === 0 ? (
        <p className="text-gray-500">Este experto aún no ha subido contenidos.</p>
      ) : (
        <ul className="space-y-6">
          {contenidos.map((c) => (
            <li key={c.contenidoId} className="border rounded p-4 shadow-sm bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold">{c.titulo}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {obtenerEtiquetaTipo(c.archivoUrl)}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-1">
                Fecha de subida:{' '}
                <span className="font-medium">
                  {new Date(c.fechaSubida.seconds * 1000).toLocaleDateString()}
                </span>
              </p>

              <p className="text-sm text-gray-700 mb-3">{c.descripcion}</p>

              {c.archivoUrl && (
                <div className="mt-2">
                  {c.archivoUrl.endsWith('.pdf') ? (
                    <iframe
                      src={c.archivoUrl}
                      width="100%"
                      height="400"
                      className="border rounded mb-2"
                      title={`visor-${c.titulo}`}
                    />
                  ) : c.archivoUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img
                      src={c.archivoUrl}
                      alt={`imagen-${c.titulo}`}
                      className="max-w-full h-auto rounded border mb-2"
                    />
                  ) : c.archivoUrl.endsWith('.mp4') ? (
                    <video controls className="w-full rounded mb-2">
                      <source src={c.archivoUrl} type="video/mp4" />
                      Tu navegador no soporta este video.
                    </video>
                  ) : (
                    <p className="text-sm text-red-500 mb-2">Formato no soportado.</p>
                  )}

                  <a
                    href={c.archivoUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-1 text-sm text-blue-600 hover:underline"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
