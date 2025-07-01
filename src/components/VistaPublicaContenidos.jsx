// components/VistaPublicaContenidos.jsx
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Contenidos disponibles</h2>

      {loading ? (
        <p className="text-gray-500">Cargando contenidos...</p>
      ) : contenidos.length === 0 ? (
        <p className="text-gray-500">Este experto aún no ha subido contenidos.</p>
      ) : (
        <ul className="space-y-4">
          {contenidos.map((c) => (
            <li key={c.contenidoId} className="border rounded p-4 shadow-sm">
              <h3 className="text-lg font-bold">{c.titulo}</h3>
              <p className="text-sm text-gray-600">
                Fecha de subida: {new Date(c.fechaSubida.seconds * 1000).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2 italic">
                Adquiere este contenido para poder visualizarlo.
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
