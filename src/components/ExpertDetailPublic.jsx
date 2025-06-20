// src/components/ExpertDetailPublic.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText,
  DollarSign,
  CheckCircle,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

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

  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes('curso')) return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes('asesor')) return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes('manual')) return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  if (cargando) return <p className="p-6">Cargando experto...</p>;
  if (!expert) return <p className="p-6">Experto no encontrado.</p>;

  return (
    <div className="min-h-screen bg-primary-soft px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6">
        <button
          onClick={() => navigate('/expertos')}
          className="text-sm text-primary hover:underline"
        >
          ← Volver al listado
        </button>

        <div className="text-center space-y-2">
          {expert.fotoPerfilURL && (
            <img
              src={expert.fotoPerfilURL}
              alt="Foto del experto"
              className="w-32 h-32 rounded-full object-cover mx-auto border"
            />
          )}
          <h1 className="text-2xl font-bold text-default font-montserrat">
            {expert.nombre}
          </h1>
          <p className="text-primary font-semibold">{expert.especialidad}</p>
        </div>

        {expert.experiencia && (
          <div>
            <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
              <FileText className="w-4 h-4 mr-2 text-gray-500" /> Experiencia
            </h2>
            <p className="text-default-soft whitespace-pre-line">{expert.experiencia}</p>
          </div>
        )}

        {Array.isArray(expert.educacion) && expert.educacion.length > 0 && (
          <div>
            <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
              <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" /> Educación
            </h2>
            <ul className="list-disc list-inside text-default-soft">
              {expert.educacion.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(expert.certificaciones) && expert.certificaciones.length > 0 && (
          <div>
            <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Certificaciones
            </h2>
            <ul className="list-disc list-inside text-default-soft">
              {expert.certificaciones.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(expert.servicios) && expert.servicios.length > 0 && (
          <div>
            <h2 className="flex items-center text-lg font-semibold text-default-soft mb-2">
              <BookOpen className="w-4 h-4 mr-2 text-orange-500" /> Servicios
            </h2>
            <div className="grid gap-4">
              {expert.servicios.map((serv, i) => (
                <div
                  key={i}
                  className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm"
                >
                  <p className="flex items-center font-bold text-default mb-1">
                    {getIconByTipo(serv.tipo)}
                    <span className="font-bold text-default">
                      {serv.tipo ? `${serv.tipo} '` : 'Servicio '}
                      {serv.titulo || 'Sin título'}
                      {"'"}
                    </span>
                  </p>
                  {serv.descripcion && (
                    <p className="italic text-default-soft ml-6 mt-1">
                      {serv.descripcion}
                    </p>
                  )}

                  <p className="flex items-center mt-2">
                    
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                      {serv.precio
                        ? new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(parseFloat(serv.precio))
                        : 'Precio no especificado'}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-default-soft space-y-1">
          {expert.email && (
            <p className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <strong>Correo:</strong> {expert.email}
            </p>
          )}
          {expert.telefono && (
            <p className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              <strong>Teléfono:</strong> {expert.telefono}
            </p>
          )}
          {expert.redes && (
            <p className="flex items-center">
              <Globe className="w-4 h-4 mr-2 text-gray-500" />
              <strong>Redes:</strong> {expert.redes}
            </p>
          )}

          {expert.linkedin && (
            <p className="text-sm mt-2">
              <a
                href={expert.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Ver perfil profesional
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
