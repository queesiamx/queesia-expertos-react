// src/pages/Dashboard.jsx
import React from "react";
import QuesiaNavbar from "../components/QuesiaNavbar";
import UserInfo from "../components/UserInfo";
import LogoutButton from "../components/LogoutButton";

export default function Dashboard() {
  return (
    <>
      <QuesiaNavbar />

      <div className="min-h-screen bg-yellow-100 px-6 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-default mb-4">
            ¡Bienvenido al Dashboard! 🎉
          </h1>

          {/* Datos del usuario */}
          <UserInfo />

          {/* Sección de contenido adicional */}
          <div className="border-t pt-4 mt-4">
            <p className="text-default mb-2">Aquí podrías mostrar:</p>
            <ul className="list-disc list-inside text-default-soft text-sm space-y-1">
              <li>Aplicaciones favoritas o recientemente vistas</li>
              <li>Acceso rápido a herramientas del catálogo</li>
              <li>Configuración del perfil de usuario</li>
              <li>Historial de uso o últimas búsquedas</li>
              <li>Notas o apps guardadas para revisión</li>
            </ul>
          </div>

          {/* Cierre de sesión */}
          <div className="mt-6">
            <LogoutButton />
          </div>
        </div>
      </div>
    </>
  );
}
