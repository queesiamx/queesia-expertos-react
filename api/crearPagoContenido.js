// /api/crearPagoContenido.js  (ESM; tu package.json tiene "type":"module")
import Stripe from "stripe";

// Permitir dev local + tu dominio prod (ajústalo si necesitas)
const ALLOWED = (process.env.CORS_ORIGINS || "http://localhost:5173,https://expertos.queesia.com")
  .split(",")
  .map(s => s.trim());

function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    // ✅ Valida envs ANTES y crea Stripe DENTRO del try
    const { STRIPE_SECRET_KEY, PUBLIC_URL } = process.env;
    if (!STRIPE_SECRET_KEY) return res.status(500).json({ error: "Falta STRIPE_SECRET_KEY" });
    if (!PUBLIC_URL)       return res.status(500).json({ error: "Falta PUBLIC_URL" });

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    const { compraId, name, amount, metadata } = req.body || {};
    if (!compraId || !name || !amount) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: { currency: "mxn", product_data: { name }, unit_amount: Number(amount) },
        quantity: 1,
      }],
      metadata: { compraId, ...(metadata || {}) },
      success_url: `${PUBLIC_URL}/PagoExitoso?c=${compraId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${PUBLIC_URL}/PagoCancelado?c=${compraId}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("Stripe error:", e?.message || e);
    return res.status(500).json({ error: e?.message || "Error al crear sesión de pago" });
  }
}
