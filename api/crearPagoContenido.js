// /api/crearPagoContenido.js
import Stripe from "stripe";
import { db } from "../../firebase";
import {
  doc, getDoc, addDoc, collection, serverTimestamp,
} from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { contenidoId, uid, email, nombreContenido, fechaSeleccionada } = req.body;
    if (!contenidoId || !uid || !email) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // 1) Traer contenido para obtener precio y datos
    const contenidoRef = doc(db, "contenidosExpertos", contenidoId);
    const snap = await getDoc(contenidoRef);
    if (!snap.exists()) return res.status(404).json({ error: "Contenido no encontrado" });

    const data = snap.data();
    const precio = Number(data.precio);
    if (!precio || isNaN(precio) || precio <= 0) {
      return res.status(400).json({ error: "Precio inválido en base de datos" });
    }

    const titulo = data.titulo || data.nombre || nombreContenido || "Contenido";
    const esCurso = Array.isArray(data.fechasDisponibles) && data.fechasDisponibles.length > 0;

    // Validar fecha si es curso
    if (esCurso && !fechaSeleccionada) {
      return res.status(400).json({ error: "Falta seleccionar una fecha" });
    }

    // 2) Crear intención de compra en Firestore
    const compra = await addDoc(collection(db, "comprasContenido"), {
      userId: uid,
      expertoId: data.expertoId || "",
      contenidoId,
      titulo,
      tipo: esCurso ? "curso" : "manual",
      precio,
      fechaSeleccionada: esCurso ? fechaSeleccionada : null,
      estado: "pagando",
      createdAt: serverTimestamp(),
    });

    // 3) Crear sesión de Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { name: titulo },
            unit_amount: Math.round(precio * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        compraId: compra.id,
        contenidoId,
        uid,
        fechaSeleccionada: esCurso ? fechaSeleccionada : "",
        tipo: esCurso ? "curso" : "manual",
      },
      // ⚠️ Asegúrate de definir PUBLIC_URL en Vercel (https://expertos.tu-dominio.com)
      success_url: `${process.env.PUBLIC_URL}/PagoExitoso?c=${compra.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_URL}/PagoCancelado?c=${compra.id}`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("❌ Error al crear sesión de pago:", error);
    return res.status(500).json({ error: "Error al crear sesión de pago" });
  }
}
