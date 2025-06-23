// src/pages/PagoCancelado.jsx
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function PagoCancelado() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-red-50 text-red-900 px-4 py-20 text-center">
      <XCircle className="w-16 h-16 mb-4 text-red-600" />
      <h1 className="text-3xl font-bold mb-2">Pago cancelado</h1>
      <p className="mb-6">Tu pago no fue completado. Puedes intentarlo de nuevo cuando lo desees.</p>
      <Link
        to="/expertos"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition"
      >
        Volver a expertos
      </Link>
    </div>
  );
}
