// api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const { name, description, amount } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name,
              description,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://expertos.queesia.com/pago-exitoso',
      cancel_url: 'https://expertos.queesia.com/pago-cancelado',
    });

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error.message);
    return res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
}
