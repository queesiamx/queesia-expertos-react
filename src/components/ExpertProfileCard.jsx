// src/components/ExpertProfileCard.jsx
import React from "react";
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
} from "lucide-react";

export default function ExpertProfileCard({ expert }) {
  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes("curso")) return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes("asesoría") || lower.includes("asesoria")) return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes("manual")) return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center text-center gap-4">
      {expert.fotoPerfilURL && (
        <img
          src={expert.fotoPerfilURL}
          alt={`Foto de perfil de ${expert.nombre}`}
          className="w-32 h-32 rounded-full object-cover border"
        />
      )}

      <div className="w-full text-center">
        <h2 className="text-2xl font-bold text-default">{expert.nombre}</h2>
        <p className="text-primary font-semibold mb-4">{expert.especialidad}</p>
      </div>

      <div className="w-full text-left space-y-4">
        {expert.experiencia && (
          <div>
            <h4 className="flex items-center font-semibold text-default-soft mb-1">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Experiencia
            </h4>
            <p className="mb-2">{expert.experiencia}</p>
          </div>
        )}

        {Array.isArray(expert.educacion) && expert.educacion.length > 0 && (
          <div>
            <h4 className="flex items-center font-semibold text-default-soft mb-1">
              <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
              Educación
            </h4>
            <ul className="list-disc list-inside mb-2">
              {expert.educacion.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {expert.certificaciones?.length > 0 && (
          <div>
            <h4 className="flex items-center font-semibold text-default-soft mb-1">
              <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
              Certificaciones
            </h4>
            <ul className="list-disc list-inside mb-2">
              {expert.certificaciones.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {Array.isArray(expert.servicios) && expert.servicios.length > 0 && (
          <div>
            <h4 className="flex items-center font-semibold text-default-soft mb-2">
              <BookOpen className="w-4 h-4 mr-2 text-orange-500" />
              Servicios
            </h4>
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

                  <p className="italic text-gray-700 ml-6 mt-1">
                    {serv.descripcion}
                  </p>
                  <p className="flex items-center mt-2">
                    
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                      {serv.precio
                        ? new Intl.NumberFormat("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          }).format(parseFloat(serv.precio))
                        : "Precio no especificado"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-default-soft mt-4 space-y-1">
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
                className="text-blue-600 underline"
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
