// src/components/BotonPagarContenido.jsx
import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function BotonPagarContenido({ contenidoId, nombreContenido }) {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [loading, setLoading] = useState(false);

  // En dev puedes apuntar a tu dominio si las serverless están en Vercel
  const API_BASE = import.meta.env.DEV
    ? (import.meta.env.VITE_PUBLIC_URL || '')
    : '';

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
      setUid(user.uid || '');
    }
  }, []);

  const handlePagar = async () => {
    if (!email || !uid) {
      toast.error('Debes iniciar sesión para pagar');
      return;
    }
    if (!contenidoId) {
      toast.error('Contenido no válido');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/crearPagoContenido`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, uid, contenidoId, nombreContenido }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Error al crear la sesión de pago');
      }

      const data = await res.json(); // { url, compraId? }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('No se pudo redirigir al pago');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error al iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePagar}
      disabled={loading}
      className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition ${
        loading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Enviando a Stripe…' : 'Pagar para acceder'}
    </button>
  );
}
