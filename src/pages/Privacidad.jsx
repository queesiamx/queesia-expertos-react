import React from 'react';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto p-8 rounded-2xl shadow-md bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Aviso de privacidad
        </h1>

        <article className="space-y-10">
          <p><strong>Última actualización:</strong> 14 de mayo de 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Responsable del tratamiento de los datos</h2>
            <p>
              El responsable del tratamiento de tus datos personales es <strong>Queesia</strong>, plataforma digital operada desde México.  
              Puedes contactarnos en:{" "}
              <a href="mailto:contacto@queesia.com" className="text-blue-600 underline">contacto@queesia.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Datos que recopilamos</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Nombre y correo electrónico.</li>
              <li>Información profesional o académica (para expertos).</li>
              <li>Información de facturación.</li>
              <li>Preferencias de navegación y uso del sitio.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Finalidad del uso de datos</h2>
            <p>Utilizamos tus datos para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Gestionar tu cuenta y acceso a la plataforma.</li>
              <li>Facilitar la compra o prestación de servicios.</li>
              <li>Emitir comprobantes y facturación.</li>
              <li>Brindar soporte técnico.</li>
              <li>Enviar notificaciones sobre tu actividad en Queesia.</li>
            </ul>
            <p className="mt-2"><strong>No compartimos tus datos con terceros sin tu consentimiento.</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Seguridad</h2>
            <p>
              Adoptamos medidas técnicas y administrativas para proteger tus datos contra pérdida, mal uso o acceso no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Derechos ARCO</h2>
            <p>
              Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación u Oposición escribiendo a:{" "}
              <a href="mailto:contacto@queesia.com" className="text-blue-600 underline">contacto@queesia.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Cambios al aviso</h2>
            <p>
              Nos reservamos el derecho de modificar este aviso. Las versiones actualizadas estarán disponibles en esta misma sección del sitio.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
