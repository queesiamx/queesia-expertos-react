import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function BotonPagarContenido({ contenidoId, nombreContenido }) {
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
      setUid(user.uid);
    }
  }, []);

  const handlePagar = async () => {
    if (!email || !uid) {
      toast.error('Debes iniciar sesión para pagar');
      return;
    }

    try {
      const res = await fetch('/api/crear-sesion-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          uid,
          contenidoId,
          nombreContenido,
        }),
      });

      if (!res.ok) {
        throw new Error('Error al crear la sesión de pago');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('No se pudo redirigir al pago');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al iniciar el pago');
    }
  };

  return (
    <button
      onClick={handlePagar}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
    >
      Pagar para acceder
    </button>
  );
}
