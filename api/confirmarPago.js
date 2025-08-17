// /api/confirmarPago.js  (ESM; package.json con "type":"module")
import Stripe from "stripe";
import { adb } from "./_admin.js"; // requiere /api/_admin.js con credenciales de servicio
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// Permitir dev local + tu dominio prod (ajústalo si necesitas)
const ALLOWED = (process.env.CORS_ORIGINS || "http://localhost:5173,https://expertos.queesia.com")
  .split(",")
  .map((s) => s.trim());

function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { session_id, compraId } = req.body || {};
    if (!session_id || !compraId) return res.status(400).json({ error: "Faltan parámetros" });

    // 1) Recuperar sesión de Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return res.status(404).json({ error: "Sesión no encontrada" });
    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      session.status === "paid";
    if (!paid) return res.status(400).json({ error: "Pago no confirmado" });

    // 2) Leer compra
    const compraRef = adb.collection("comprasContenido").doc(compraId);
    const compraSnap = await compraRef.get();
    if (!compraSnap.exists) return res.status(404).json({ error: "Compra no encontrada" });
    const compra = compraSnap.data();

    // 3) Validar monto vs precio del contenido (blindaje anti-manipulación de amount)
    if (!compra?.contenidoId) return res.status(400).json({ error: "Compra sin contenidoId" });
    const contRef = adb.collection("contenidosExpertos").doc(compra.contenidoId);
    const contSnap = await contRef.get();
    if (!contSnap.exists) return res.status(404).json({ error: "Contenido no encontrado" });
    const cont = contSnap.data();

    // Precio esperado (centavos)
    let expected = Number(cont.precioCentavos);
    if (!Number.isFinite(expected) || expected <= 0) {
      const p = Number(cont.precio);
      if (!Number.isFinite(p) || p <= 0) {
        return res.status(400).json({ error: "Precio del contenido inválido" });
      }
      expected = Math.round(p * 100);
    }

    const amountPaid = Number(session.amount_total ?? 0);
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      return res.status(400).json({ error: "Monto de Stripe inválido" });
    }

    if (amountPaid !== expected) {
      return res
        .status(400)
        .json({ error: `Monto pagado ${amountPaid} ≠ precio esperado ${expected}` });
    }

    // 4) Marcar compra como pagada
    await compraRef.set(
      {
        estado: "pagado",
        sessionId: session_id,
        updatedAt: Timestamp.now(),
        stripe: {
          session_id,
          payment_status: session.payment_status,
          amount_total: amountPaid,
          currency: session.currency || "mxn",
          customer_email: session.customer_details?.email || null,
          customer_name: session.customer_details?.name || null,
          updatedAt: Timestamp.now(),
        },
      },
      { merge: true }
    );

    // 5) Si es curso: registrar al usuario en el contenido
    if (compra.tipo === "curso" && compra.fechaSeleccionada) {
      const alumno = {
        nombre: session.customer_details?.name || "Alumno",
        correo: session.customer_details?.email || "",
        pagado: true,
        estatus: "confirmado",
        fechaRegistro: Timestamp.now(),
        fechaAgendada: compra.fechaSeleccionada,
        compraId,
      };
      await contRef.update({
        usuariosRegistrados: FieldValue.arrayUnion(alumno),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("confirmarPago error:", e?.message || e);
    return res.status(500).json({ error: "No se pudo confirmar el pago" });
  }
}
