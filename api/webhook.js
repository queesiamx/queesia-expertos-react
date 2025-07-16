// /api/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../../firebase'; // Ajusta la ruta según tu estructura
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Desactiva el body parser por defecto (necesario para Stripe)
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Aquí puedes incluir los datos extra que hayas enviado en `metadata`
    const contenidoId = session.metadata?.contenidoId;
    const correo = session.customer_email;

    if (!contenidoId || !correo) {
      console.warn('Faltan datos en metadata');
      return res.status(400).send('Faltan datos');
    }

    try {
      const ref = doc(db, 'contenidosExpertos', contenidoId);
      await updateDoc(ref, {
        usuariosRegistrados: arrayUnion({
          correo,
          nombre: 'Sin nombre', // puedes reemplazar si guardas nombre en metadata
          pagado: true,
          estatus: 'confirmado',
          fechaRegistro: new Date().toISOString()
        })
      });

      return res.status(200).send('Usuario registrado');
    } catch (error) {
      console.error('Error al registrar pago en Firestore:', error);
      return res.status(500).send('Error interno');
    }
  }

  res.status(200).send('Evento recibido');
}
