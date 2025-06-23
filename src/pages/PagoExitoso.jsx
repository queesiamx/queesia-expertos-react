// src/pages/PagoExitoso.jsx
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PagoExitoso() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 text-green-900 px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
      <h1 className="text-3xl font-bold mb-2">¡Pago realizado con éxito!</h1>
      <p className="mb-6">Gracias por tu compra. El experto recibirá la notificación correspondiente.</p>
      <Link
        to="/expertos"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Volver a expertos
      </Link>
    </div>
  );
}
