// /api/crearPagoContenido.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { contenidoId, uid, email, nombreContenido } = req.body;

  if (!contenidoId || !userUid || !email) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: nombreContenido || 'Contenido exclusivo',
            },
            unit_amount: 12000, // 💰 Precio en centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        contenidoId,
        uid: userUid, // <- renombrado aquí
        email,        // <- agregado
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
