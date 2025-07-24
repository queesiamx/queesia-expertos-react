// /api/webhook.js
import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import emailjs from '@emailjs/nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

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
    console.error('❌ Error verificando webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const consultaId = session.metadata?.consultaId;
    const email = session.customer_email;

    if (!consultaId || !email) {
      console.warn('⚠️ Faltan datos en metadata o correo del cliente');
      return res.status(400).send('Faltan datos');
    }

    try {
      const ref = doc(db, 'consultasModeradas', consultaId);

      // 🔁 Actualizar Firestore
      await updateDoc(ref, {
        estado: 'respondida',
        pagoConfirmado: true,
        pagado: true,
        emailCliente: email,
        fechaPago: new Date().toISOString(),
      });

      const consultaSnap = await getDoc(ref);
      const data = consultaSnap.exists() ? consultaSnap.data() : {};

      const nombreCliente = data.nombre || 'Usuario';
      const expertoNombre = data.expertoNombre || 'Experto/a';
      const tituloConsulta = data.consulta || 'Consulta';
      const respuesta = data.respuesta || 'La respuesta será enviada en breve.';

      // 📧 Correo al usuario con la respuesta liberada
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_GENERAL,
        {
          mensaje: `
            <h2>✅ ¡Gracias por tu pago, ${nombreCliente}!</h2>
            <p>Hemos recibido tu pago por la consulta:</p>
            <p><strong>"${tituloConsulta}"</strong></p>
            <p>Respuesta del experto:</p>
            <blockquote style="border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em;">
              ${respuesta}
            </blockquote>
          `,
          reply_to: email,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );

      // 📧 Correo al admin
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_GENERAL,
        {
          mensaje: `
            <h2>📬 Nuevo pago recibido</h2>
            <p>El usuario <strong>${nombreCliente}</strong> ha realizado el pago de la consulta <strong>"${tituloConsulta}"</strong>.</p>
            <p>El experto asignado es: <strong>${expertoNombre}</strong>.</p>
          `,
          reply_to: process.env.ADMIN_EMAIL,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );

      console.log(`✅ Consulta ${consultaId} actualizada y correos enviados`);
      return res.status(200).send('Todo correcto');
    } catch (error) {
      console.error('❌ Error al procesar webhook:', error);
      return res.status(500).send('Error interno');
    }
  }

  res.status(200).send('Evento recibido');
}
