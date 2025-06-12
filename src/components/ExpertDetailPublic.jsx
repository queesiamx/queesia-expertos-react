import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ExpertDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtener = async () => {
      const docRef = doc(db, 'experts', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setExpert({ id: snapshot.id, ...snapshot.data() });
      }
      setCargando(false);
    };
    obtener();
  }, [id]);

  if (cargando) return <p className="p-6">Cargando experto...</p>;
  if (!expert) return <p className="p-6">Experto no encontrado.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/expertos')}
        className="mb-4 text-blue-600 underline text-sm"
      >
        ← Volver al listado
      </button>

      <h1 className="text-3xl font-bold mb-2">{expert.nombre}</h1>
      <p className="text-gray-600 mb-4">{expert.especialidad}</p>

      {expert.fotoPerfilURL && (
        <img
          src={expert.fotoPerfilURL}
          alt="Foto del experto"
          className="w-32 h-32 rounded-full object-cover mb-4"
        />
      )}

      {expert.experiencia && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Experiencia</h2>
          <p className="whitespace-pre-line text-gray-800">{expert.experiencia}</p>
        </div>
      )}

      {expert.educacion && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Educación</h2>
          <ul className="list-disc list-inside text-gray-800">
            {(Array.isArray(expert.educacion)
              ? expert.educacion
              : expert.educacion.split(',')
            ).map((e, i) => (
              <li key={i}>{e.trim()}</li>
            ))}
          </ul>
        </div>
      )}

      {expert.certificaciones && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Certificaciones</h2>
          <ul className="list-disc list-inside text-gray-800">
            {(Array.isArray(expert.certificaciones)
              ? expert.certificaciones
              : expert.certificaciones.split(',')
            ).map((c, i) => (
              <li key={i}>{c.trim()}</li>
            ))}
          </ul>
        </div>
      )}

      {expert.linkedin && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">LinkedIn / Portafolio</h2>
          <a
            href={expert.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {expert.linkedin}
          </a>
        </div>
      )}

      {expert.telefono && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Teléfono</h2>
          <p className="text-gray-800">{expert.telefono}</p>
        </div>
      )}

      {expert.email && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Correo</h2>
          <p className="text-gray-800">{expert.email}</p>
        </div>
      )}

      {expert.redes && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Redes Sociales</h2>
          <p className="text-gray-800 break-words">{expert.redes}</p>
        </div>
      )}
    </div>
  );
}
