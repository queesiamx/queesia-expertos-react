// /api/crearPagoContenido.js  (ESM porque package.json tiene "type":"module")
import Stripe from "stripe";

// ⚠️ No importes "firebase" aquí. Si luego quieres validar/actualizar Firestore,
// usa firebase-admin en otro endpoint/webhook.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    // Responder SIEMPRE JSON para que el front no truene al parsear
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { compraId, name, amount, metadata } = req.body || {};
    if (!compraId || !name || !amount) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { name },
            unit_amount: Number(amount), // en centavos
          },
          quantity: 1,
        },
      ],
      metadata: { compraId, ...(metadata || {}) },
      success_url: `${process.env.PUBLIC_URL}/PagoExitoso?c=${compraId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/PagoCancelado?c=${compraId}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Stripe error:", e?.message || e);
    return res
      .status(500)
      .json({ error: e?.message || "Error al crear sesión de pago" });
  }
}
