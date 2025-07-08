import React from 'react';

export default function Privacidad() {
  return (
    <div className="min-h-screen bg-primary-soft px-4 py-12 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-default">
          Aviso de Privacidad
        </h1>

        <article className="space-y-10 text-default">
          <p className="text-sm text-default-soft">
            <strong>Última actualización:</strong> 14 de mayo de 2025
          </p>

          <section>
            <h2 className="text-2xl font-semibold mb-2">1. Fundamento legal</h2>
            <p>
              Este Aviso de Privacidad se emite conforme a lo dispuesto por los artículos 15 y 16 de la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares</strong> y su Reglamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">2. Responsable del tratamiento de los datos</h2>
            <p>
              El responsable del tratamiento de tus datos personales es <strong>Queesia</strong>, plataforma digital operada desde México. Puedes contactarnos en:{" "}
              <a href="mailto:contacto@queesia.com" className="text-blue-600 underline">contacto@queesia.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">3. Definiciones</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Datos personales:</strong> Cualquier información que identifique o pueda identificar a una persona física.</li>
              <li><strong>Titular:</strong> Persona física a quien pertenecen los datos.</li>
              <li><strong>Responsable:</strong> Persona física o moral que decide sobre el tratamiento de los datos.</li>
              <li><strong>Encargado:</strong> Quien trata los datos por cuenta del responsable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">4. Datos que recopilamos</h2>
            <p>Los datos que podemos recabar incluyen, pero no se limitan a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Nombre completo, correo electrónico, teléfono (si aplica).</li>
              <li>Información profesional, experiencia, educación y certificaciones (para expertos).</li>
              <li>Datos fiscales para emisión de comprobantes.</li>
              <li>Información de navegación y preferencias en el sitio.</li>
              <li>Redes sociales y enlaces públicos proporcionados por el usuario.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">5. Finalidades del tratamiento</h2>
            <p><strong>Finalidades primarias:</strong></p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Registro y administración de usuarios y expertos en la plataforma.</li>
              <li>Procesamiento de pagos y emisión de comprobantes fiscales.</li>
              <li>Prestación de servicios contratados o solicitados.</li>
              <li>Atención a solicitudes de soporte técnico o contacto.</li>
              <li>Verificación de identidad o legitimidad de perfiles.</li>
            </ul>

            <p className="mt-4"><strong>Finalidades secundarias:</strong></p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Envío de boletines informativos, promociones o contenidos relacionados.</li>
              <li>Estadísticas y análisis de comportamiento de usuarios.</li>
            </ul>

            <p className="mt-2">
              Puedes oponerte al uso de tus datos para fines secundarios escribiéndonos a{" "}
              <a href="mailto:contacto@queesia.com" className="text-blue-600 underline">contacto@queesia.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">6. Transferencia de datos</h2>
            <p>
              Queesia no transfiere tus datos personales a terceros sin tu consentimiento, salvo que sea requerido por autoridad competente o necesario para la prestación de servicios. Cualquier transferencia se hará conforme a los principios establecidos en la ley.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">7. Conservación de los datos</h2>
            <p>
              Conservaremos tus datos personales por el tiempo necesario para cumplir con las finalidades descritas en este aviso, y conforme a disposiciones legales aplicables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">8. Medidas de seguridad</h2>
            <p>
              Queesia implementa medidas físicas, técnicas y administrativas apropiadas para proteger los datos personales contra daño, pérdida, alteración, destrucción, acceso o tratamiento no autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">9. Derechos ARCO y mecanismos</h2>
            <p>
              Puedes ejercer tus derechos de <strong>Acceso, Rectificación, Cancelación u Oposición</strong> (ARCO) enviando un correo a:{" "}
              <a href="mailto:contacto@queesia.com" className="text-blue-600 underline">contacto@queesia.com</a>.
            </p>
            <p className="mt-2">
              Deberás indicar tu nombre completo, el derecho que deseas ejercer y adjuntar copia de una identificación oficial vigente.
              La respuesta será emitida en un plazo no mayor a 20 días hábiles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">10. Revocación del consentimiento</h2>
            <p>
              Puedes revocar el consentimiento otorgado para el tratamiento de tus datos, siguiendo el mismo procedimiento señalado para ejercer tus derechos ARCO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">11. Limitación del uso o divulgación</h2>
            <p>
              Puedes limitar el uso o divulgación de tus datos personales para fines promocionales solicitándolo a nuestro correo electrónico.
              También puedes inscribirte al Registro Público para Evitar Publicidad de PROFECO.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">12. Uso de cookies y tecnologías similares</h2>
            <p>
              Este sitio utiliza cookies propias y de terceros para analizar la navegación y mejorar la experiencia del usuario.
              Puedes configurar tu navegador para rechazarlas, aunque algunas funcionalidades pueden verse afectadas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">13. Tratamiento de datos de menores de edad</h2>
            <p>
              Queesia no recopila intencionalmente datos personales de menores de edad. Si detectamos que hemos recopilado dicha información sin consentimiento de los padres o tutores, será eliminada de nuestros sistemas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">14. Cambios al aviso de privacidad</h2>
            <p>
              Este aviso puede ser modificado en cualquier momento para cumplir con actualizaciones legales o políticas internas.
              La versión vigente estará siempre disponible en esta sección. Te recomendamos revisarlo periódicamente.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
