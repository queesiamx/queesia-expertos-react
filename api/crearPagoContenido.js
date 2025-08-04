// /api/crearPagoContenido.js
import Stripe from 'stripe';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { contenidoId, uid, email, nombreContenido } = req.body;

  if (!contenidoId || !uid || !email) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    // 🔍 1. Consultar el contenido en Firestore para obtener precio y nombre real
    const contenidoRef = doc(db, 'contenidosExpertos', contenidoId);
    const contenidoSnap = await getDoc(contenidoRef);

    if (!contenidoSnap.exists()) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }

    const contenidoData = contenidoSnap.data();
    const precio = contenidoData.precio; // Debe estar en pesos MXN
    const tituloContenido = contenidoData.nombre || nombreContenido || 'Contenido exclusivo';

    if (!precio || isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: 'Precio inválido en base de datos' });
    }

    // 🔄 Convertir a centavos para Stripe
    const precioEnCentavos = Math.round(precio * 100);

    // 💳 2. Crear la sesión de pago en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: tituloContenido,
            },
            unit_amount: precioEnCentavos,
          },
          quantity: 1,
        },
      ],
      metadata: {
        contenidoId,
        uid,
        email,
        nombreContenido: tituloContenido,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/PagoExitoso`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/PagoCancelado`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('❌ Error al crear sesión de pago:', error);
    return res.status(500).json({ error: 'Error al crear sesión de pago' });
  }
}
