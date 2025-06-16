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
    <div className="min-h-screen bg-primary-soft px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6">
        <button
          onClick={() => navigate('/expertos')}
          className="text-sm text-primary hover:underline"
        >
          ← Volver al listado
        </button>

        <h1 className="text-2xl font-bold text-default">{expert.nombre}</h1>
        <p className="text-default-soft">{expert.especialidad}</p>

        {expert.fotoPerfilURL && (
          <img
            src={expert.fotoPerfilURL}
            alt="Foto del experto"
            className="w-40 h-40 rounded-full object-cover mx-auto"
          />
        )}

        {expert.experiencia && (
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Experiencia</h2>
            <p className="whitespace-pre-line text-default-soft">{expert.experiencia}</p>
          </div>
        )}

        {expert.educacion && (
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Educación</h2>
            <ul className="list-disc list-inside text-default-soft">
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
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Certificaciones</h2>
            <ul className="list-disc list-inside text-default-soft">
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
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">LinkedIn / Portafolio</h2>
            <a
              href={expert.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-words"
            >
              {expert.linkedin}
            </a>
          </div>
        )}

        {expert.telefono && (
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Teléfono</h2>
            <p className="text-default-soft">{expert.telefono}</p>
          </div>
        )}

        {expert.email && (
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Correo</h2>
            <p className="text-default-soft">{expert.email}</p>
          </div>
        )}

        {expert.redes && (
          <div>
            <h2 className="text-xl font-semibold text-default mb-1">Redes Sociales</h2>
            <p className="text-default-soft break-words">{expert.redes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
