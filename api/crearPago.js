// /api/crearPago.js
import Stripe from 'stripe';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { consultaId } = req.body;

    // 1. Obtener datos de la consulta
    const docRef = doc(db, 'consultasModeradas', consultaId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return res.status(404).json({ error: 'Consulta no encontrada' });

    const consulta = snap.data();
    const precio = consulta?.respuesta?.precio || 0;

    if (!precio || precio <= 0) {
      return res.status(400).json({ error: 'La consulta no tiene precio asignado' });
    }

    // 2. Crear sesión de pago
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Respuesta profesional - ${consulta.nombre}`,
          },
          unit_amount: precio * 100, // convertir a centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/consulta-pagada?consultaId=${consultaId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/consulta-cancelada`,
      metadata: {
        consultaId,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error al crear sesión de pago:', error);
    return res.status(500).json({ error: 'Error interno al crear el pago' });
  }
}
