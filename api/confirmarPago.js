// /api/confirmarPago.js
import Stripe from "stripe";
import { db } from "../../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { session_id, compraId } = req.body;
    if (!session_id || !compraId) return res.status(400).json({ error: "Faltan parámetros" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Pago no confirmado" });
    }

    // Marcar compra como pagada
    const compraRef = doc(db, "comprasContenido", compraId);
    const compraSnap = await getDoc(compraRef);
    if (!compraSnap.exists()) return res.status(404).json({ error: "Compra no encontrada" });

    const compra = compraSnap.data();
    await updateDoc(compraRef, { estado: "pagado", sessionId: session_id });

    // Si es curso: registrar al usuario en el contenido
    if (compra.tipo === "curso" && compra.fechaSeleccionada) {
      const contRef = doc(db, "contenidosExpertos", compra.contenidoId);
      await updateDoc(contRef, {
        usuariosRegistrados: arrayUnion({
          nombre: session.customer_details?.name || "Alumno",
          correo: session.customer_details?.email || "",
          pagado: true,
          estatus: "confirmado",
          fechaRegistro: new Date().toISOString(),
          fechaAgendada: compra.fechaSeleccionada,
        }),
      });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "No se pudo confirmar el pago" });
  }
}
