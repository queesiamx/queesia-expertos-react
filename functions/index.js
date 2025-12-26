/* eslint-disable */
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");

// ====== Config ======
const NOTIFY_EMAILS = [
  "misaeltup@gmail.com",
  "amhjmixqui@gmail.com",
  "queesiamx.employee@gmail.com",
];

// IMPORTANTE: usa EXACTAMENTE los mismos ids que tus docs en visitCounts
// y el mismo mapa de metas que tu panel.
const MILESTONES_BY_SITE = {
  queesiaHome: [1000, 5000, 10000, 25000, 50000, 100000],
  foroHome: [500, 1000, 5000, 10000, 25000],
  expertosHome: [500, 1000, 5000, 10000, 25000],
  blogHome: [250, 500, 1000, 5000, 10000, 25000],
};

function getCrossedMilestones(siteId, prevCount, newCount) {
  const goals = MILESTONES_BY_SITE[siteId] ?? [];
  // devuelve TODOS los hitos cruzados (por si sube en “saltos” grandes)
  return goals.filter((m) => prevCount < m && newCount >= m);
}

// --- EmailJS (server-side REST) ---
// ENV vars requeridas:
// EMAILJS_SERVICE_ID
// EMAILJS_TEMPLATE_ID
// EMAILJS_PUBLIC_KEY  (en EmailJS suele llamarse "Public Key")
// EMAILJS_PRIVATE_KEY (si tu setup lo usa; si no, lo puedes quitar)
async function sendEmailJS({ to_email, subject, message, siteId, milestone, countAtSend }) {
  const service_id = process.env.EMAILJS_SERVICE_ID;
  const template_id = process.env.EMAILJS_TEMPLATE_ID;
  const user_id = process.env.EMAILJS_PUBLIC_KEY;
  const accessToken = process.env.EMAILJS_PRIVATE_KEY;

  if (!service_id || !template_id || !user_id) {
    throw new Error("Faltan ENV de EmailJS: EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID / EMAILJS_PUBLIC_KEY");
  }

  const payload = {
    service_id,
    template_id,
    user_id,
    // Si tu EmailJS no requiere accessToken, puedes borrar la línea.
    ...(accessToken ? { accessToken } : {}),
    template_params: {
      to_email,
      subject,
      message,
      siteId,
      milestone,
      countAtSend,
    },
  };

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`EmailJS error ${res.status}: ${txt}`);
  }
}

exports.notifyVisitMilestones = onDocumentUpdated("visitCounts/{siteId}", async (event) => {
  const siteId = event.params.siteId;

  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};

  const prevCount = Number(before.count ?? 0);
  const newCount = Number(after.count ?? 0);

  if (!(newCount > prevCount)) return;

  const crossed = getCrossedMilestones(siteId, prevCount, newCount);
  if (!crossed.length) return;

  // procesar cada hito cruzado
  for (const milestone of crossed) {
    const milestoneDocId = `${siteId}_${milestone}`;
    const ref = db.collection("milestones").doc(milestoneDocId);

    // 1) Transacción = candado anti-duplicados
    const shouldSend = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists) {
        const st = snap.data()?.status;
        if (st === "sent" || st === "sending") return false;
      }

      tx.set(
        ref,
        {
          siteId,
          milestone,
          countAtSend: newCount,
          status: "sending",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return true;
    });

    if (!shouldSend) continue;

    // 2) Envío de email (1 por destinatario)
    try {
      const subject = `🎯 Milestone alcanzado: ${siteId} → ${milestone}`;
      const message = `El sitio "${siteId}" alcanzó el hito ${milestone}. Conteo actual: ${newCount}.`;

      for (const to_email of NOTIFY_EMAILS) {
        await sendEmailJS({
          to_email,
          subject,
          message,
          siteId,
          milestone,
          countAtSend: newCount,
        });
      }

      // 3) Marcar como sent
      await ref.set(
        {
          status: "sent",
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      logger.error("Milestone email failed", { siteId, milestone, err: String(err?.message || err) });

      await ref.set(
        {
          status: "error",
          lastError: String(err?.message || err),
          lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }
  }
});
