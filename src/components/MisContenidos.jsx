// components/MisContenidos.jsx
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { getAuth } from 'firebase/auth';

export default function MisContenidos({ expertoId }) {
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const auth = getAuth();
      const usuario = auth.currentUser;

      if (!usuario) {
        setLoading(false);
        return;
      }

      const usuarioId = usuario.uid;

      try {
        const db = getFirestore(app);
        const storage = getStorage(app);

        // 1. Obtener accesos válidos del usuario desde comprasContenido
        const comprasSnap = await getDocs(
          query(
            collection(db, 'comprasContenido'),
            where('usuarioId', '==', usuarioId),
            where('accesoValido', '==', true)
          )
        );

        const idsPermitidos = comprasSnap.docs.map(doc => doc.data().contenidoId);

        // 2. Obtener contenidos del experto
        const q = query(
          collection(db, 'contenidosExpertos'),
          where('expertoId', '==', expertoId)
        );
        const snap = await getDocs(q);

        // 3. Filtrar por los contenidos a los que tiene acceso
        const datos = await Promise.all(
          snap.docs
            .map(doc => doc.data())
            .filter(c => idsPermitidos.includes(c.contenidoId))
            .map(async c => {
              const url = await getDownloadURL(ref(storage, c.archivoPath));
              return { ...c, url };
            })
        );

        setContenidos(datos);
      } catch (error) {
        console.error('Error al cargar contenidos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [expertoId]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Contenidos que has adquirido</h2>

      {loading ? (
        <p className="text-gray-500">Cargando contenidos...</p>
      ) : contenidos.length === 0 ? (
        <p className="text-gray-500">No tienes contenidos adquiridos de este experto.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contenidos.map((c) => (
            <div
              key={c.contenidoId}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-bold">{c.titulo}</h3>
              <p className="text-sm text-gray-600 mb-2">{c.descripcion || 'Sin descripción'}</p>
              <p className="text-xs text-gray-500 mb-2">
                Subido: {new Date(c.fechaSubida.seconds * 1000).toLocaleString()}
              </p>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Ver / Descargar archivo
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
