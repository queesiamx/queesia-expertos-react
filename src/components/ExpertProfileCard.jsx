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

        {/* Servicios desde expert.servicios */}
        {expert.servicios?.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-2">📚 Servicios ofrecidos</h4>
            <ul className="space-y-2">
              {expert.servicios.map((servicio, i) => (
                <li
                  key={i}
                  className="p-3 bg-gray-50 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {getIconByTipo(servicio.tipo)} {servicio.tipo}: "{servicio.titulo || 'Sin título'}"
                    </p>
                    <p className="text-sm text-gray-700">{servicio.descripcion}</p>
                  </div>
                  <div className="mt-2 md:mt-0 md:ml-4 text-right">
                    <p className="inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded">
                      {servicio.precio ? `$${parseFloat(servicio.precio).toFixed(2)}` : "Precio no especificado"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
