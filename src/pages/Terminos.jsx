import React from 'react';

export default function Terminos() {
  return (
    <div className="min-h-screen bg-primary-soft px-4 py-12 text-gray-800 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-default">
          Términos y Condiciones
        </h1>

        <article className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-2">Para Clientes</h2>
            <p className="text-sm text-default-soft">
              <strong>Última actualización:</strong> 17 de junio de 2025
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4 text-default">
              <li>
                <strong>Naturaleza del servicio:</strong> queesia.com es una plataforma que conecta expertos con usuarios. No garantizamos el resultado del servicio.
              </li>
              <li>
                <strong>Pagos:</strong> se realizan a través de pasarelas seguras. Queesia retiene una comisión del monto pagado.
              </li>
              <li>
                <strong>Cancelaciones y reembolsos:</strong> se podrá retener el segundo pago al experto en caso de insatisfacción justificada.
              </li>
              <li>
                <strong>Uso de la plataforma:</strong> no se permite revender contenidos ni usar lenguaje ofensivo.
              </li>
              <li>
                <strong>Protección de datos:</strong> se cumplen las disposiciones de la Ley Federal de Protección de Datos Personales.
              </li>
              <li>
                <strong>Facturación:</strong> si necesitas factura, deberás solicitarla enviando un correo a <a href="mailto:facturacion@queesia.com" className="text-blue-600 underline">facturacion@queesia.com</a> dentro de los primeros 5 días naturales posteriores al pago. Incluye tu RFC, razón social, uso de CFDI y comprobante de pago.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Para Expertos</h2>
            <p className="text-sm text-default-soft">
              <strong>Última actualización:</strong> 17 de junio de 2025
            </p>

            <ul className="list-disc pl-6 space-y-2 mt-4 text-default">
              <li>
                <strong>Publicación del perfil:</strong> autorizas la publicación de tu información profesional en la plataforma.
              </li>
              <li>
                <strong>Comisión y pagos:</strong> queesia retiene un 20% por cada venta. El pago puede dividirse en 50%-50% sujeto a validación del cliente.
              </li>
              <li>
                <strong>Propiedad intelectual:</strong> debes tener los derechos sobre los materiales ofrecidos.
              </li>
              <li>
                <strong>Responsabilidades:</strong> el incumplimiento puede llevar a suspensión de pagos o del perfil.
              </li>
              <li>
                <strong>Protección de datos:</strong> queesia resguarda tu información conforme a la ley mexicana.
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
