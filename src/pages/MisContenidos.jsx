// src/pages/MisContenidos.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import NavbarUsuario from '../components/NavbarUsuario';
import { useNavigate } from 'react-router-dom'; // 👈 Importar navegación

export default function MisContenidos() {
  const [user, setUser] = useState(null);
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 👈 Inicializar navegación

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        setUser(userAuth);
        const q = await getDocs(collection(db, 'contenidosExpertos'));
        const misContenidos = [];

        q.forEach((doc) => {
          const data = doc.data();
          if (data.usuariosAutorizados?.includes(userAuth.uid)) {
            misContenidos.push({ id: doc.id, ...data });
          }
        });

        setContenidos(misContenidos);
        setLoading(false);
      } else {
        setUser(null);
        setContenidos([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p className="p-4">Cargando contenidos...</p>;

  return (
    <div>
      <NavbarUsuario />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mis contenidos adquiridos</h1>
        {contenidos.length === 0 ? (
          <p>No has adquirido ningún contenido aún.</p>
        ) : (
          <ul className="space-y-4">
            {contenidos.map((contenido) => (
              <li key={contenido.id} className="border p-4 rounded shadow">
                <h2 className="text-xl font-semibold">{contenido.titulo}</h2>
                <p className="text-sm text-gray-600 mb-1">{contenido.descripcion}</p>
                {contenido.fechaPublicacion && (
                  <p className="text-xs text-gray-500 mb-2">
                    Publicado el: {new Date(contenido.fechaPublicacion).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-4 space-x-4">
                  {contenido.archivoUrl && (
                    <a
                      href={contenido.archivoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver archivo
                    </a>
                  )}
                  <button
                    onClick={() => navigate(`/mis-contenidos/${contenido.id}`)}
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                  >
                    Ver detalles
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
