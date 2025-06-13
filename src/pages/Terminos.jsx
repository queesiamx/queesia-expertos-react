import React from 'react';

export default function Terminos() {
  return (
    <div className="min-h-screen bg-white px-4 py-10 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto p-8 rounded-2xl shadow-md bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Términos y Condiciones
        </h1>

        <article className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Para Clientes</h2>
            <p><strong>Última actualización:</strong> 14 de mayo de 2025</p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Naturaleza del servicio:</strong> Queesia.com es una plataforma que conecta expertos con usuarios. No garantizamos el resultado del servicio.
              </li>
              <li>
                <strong>Pagos:</strong> Se realizan a través de pasarelas seguras. Queesia retiene una comisión del monto pagado.
              </li>
              <li>
                <strong>Cancelaciones y reembolsos:</strong> Se podrá retener el segundo pago al experto en caso de insatisfacción justificada.
              </li>
              <li>
                <strong>Uso de la plataforma:</strong> No se permite revender contenidos ni usar lenguaje ofensivo.
              </li>
              <li>
                <strong>Protección de datos:</strong> Se cumplen las disposiciones de la Ley Federal de Protección de Datos Personales.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Para Expertos</h2>
            <p><strong>Última actualización:</strong> 14 de mayo de 2025</p>

            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                <strong>Publicación del perfil:</strong> Autorizas la publicación de tu información profesional en la plataforma.
              </li>
              <li>
                <strong>Comisión y pagos:</strong> Queesia retiene un 20% por cada venta. El pago puede dividirse en 50%-50% sujeto a validación del cliente.
              </li>
              <li>
                <strong>Propiedad intelectual:</strong> Debes tener los derechos sobre los materiales ofrecidos.
              </li>
              <li>
                <strong>Responsabilidades:</strong> El incumplimiento puede llevar a suspensión de pagos o del perfil.
              </li>
              <li>
                <strong>Protección de datos:</strong> Queesia resguarda tu información conforme a la ley mexicana.
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
