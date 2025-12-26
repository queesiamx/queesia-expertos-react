// api/checkMilestones.js
import admin from "firebase-admin";

// ====== CONFIG ======
const NOTIFY_EMAILS = [
  "misaeltup@gmail.com",
  "amhjmixqui@gmail.com",
  "queesiamx.employee@gmail.com",
];

// Usa EXACTAMENTE los doc ids reales en visitCounts/
const MILESTONES_BY_SITE = {
  quesiaHome: [1000, 5000, 10000, 25000, 50000, 100000],
  foroHome: [500, 1000, 5000, 10000, 25000],
  expertosHome: [500, 1000, 5000, 10000, 25000],
  blogHome: [250, 500, 1000, 5000, 10000, 25000],
};

// ====== Firebase Admin init (reutiliza el patrón que ya usas en api/) ======
function initAdmin() {
  if (admin.apps.length) return;

  // Opción A: si ya usas GOOGLE_APPLICATION_CREDENTIALS en Vercel, con esto basta:
  // admin.initializeApp();

  // Opción B: si usas credenciales en env (lo más común en Vercel):
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Faltan envs Firebase Admin: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  }

  // Vercel guarda saltos de línea como \n
  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// ====== EmailJS ======
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

export default async function handler(req, res) {
  try {
    // (Opcional) Protege el endpoint con un token
    const token = req.headers["x-cron-token"];
    if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    initAdmin();
    const db = admin.firestore();

    const results = [];

    for (const [siteId, goals] of Object.entries(MILESTONES_BY_SITE)) {
      const countSnap = await db.collection("visitCounts").doc(siteId).get();
      const count = countSnap.exists ? Number(countSnap.data()?.count ?? 0) : 0;

      for (const m of goals) {
        if (count < m) continue;

        const milestoneId = `${siteId}_${m}`;
        const ref = db.collection("milestones").doc(milestoneId);

        // Candado idempotente con transacción
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
              milestone: m,
              countAtSend: count,
              status: "sending",
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          return true;
        });

        if (!shouldSend) continue;

        try {
          const subject = `🎯 Milestone alcanzado: ${siteId} → ${m}`;
          const message = `El sitio "${siteId}" alcanzó el hito ${m}. Conteo actual: ${count}.`;

          for (const to_email of NOTIFY_EMAILS) {
            await sendEmailJS({ to_email, subject, message, siteId, milestone: m, countAtSend: count });
          }

          await ref.set(
            {
              status: "sent",
              sentAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          results.push({ siteId, milestone: m, status: "sent" });
        } catch (err) {
          await ref.set(
            {
              status: "error",
              lastError: String(err?.message || err),
              lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
          results.push({ siteId, milestone: m, status: "error", error: String(err?.message || err) });
        }
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
