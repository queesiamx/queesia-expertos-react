// scripts/checkMilestones_cron.js
import admin from "firebase-admin";

// ============================
// RTC_CO — CONFIG
// ============================

const DEFAULT_NOTIFY_EMAILS = [
  "misaeltup@gmail.com",
  "amhjmixqui@gmail.com",
  "queesiamx.employee@gmail.com",
];

const MILESTONES_BY_SITE = {
  quesiaHome: [1000, 5000, 10000, 25000, 50000, 100000],
  foroHome: [500, 1000, 5000, 10000, 25000],
  expertosHome: [500, 1000, 5000, 10000, 25000],
  blogHome: [250, 500, 1000, 5000, 10000, 25000],
};

// ============================
// RTC_CO — HELPERS
// ============================

function getNotifyEmails() {
  const raw = (process.env.NOTIFY_EMAILS || "").trim();
  if (!raw) return DEFAULT_NOTIFY_EMAILS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function safeJsonParse(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

function initAdmin() {
  if (admin.apps.length) return;

  const saJsonRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (saJsonRaw && saJsonRaw.trim()) {
    const sa = safeJsonParse(saJsonRaw) || safeJsonParse(saJsonRaw.replace(/\\n/g, "\n"));
    if (!sa || !sa.client_email || !sa.private_key || !sa.project_id) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON existe pero NO es válido (pega TODO el JSON del service account)."
      );
    }

    const privateKey = String(sa.private_key).replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey,
      }),
    });

    console.log("[checkMilestones] Firebase Admin init: OK (service account JSON)");
    return;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan envs Firebase Admin. Usa FIREBASE_SERVICE_ACCOUNT_JSON (recomendado) o define FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  console.log("[checkMilestones] Firebase Admin init: OK (split envs)");
}

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

  // lo que tu template YA usa (por tu correo):
  evento: subject,
  mensaje: message,

  // opcional, por si también usas estas en el template:
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

// ============================
// RTC_CO — MAIN (script)
// ============================

async function main() {
  console.log("[checkMilestones] Cron started", new Date().toISOString());

  const notifyEmails = getNotifyEmails();
  console.log("[checkMilestones] notify emails:", notifyEmails.join(", ") || "(none)");

  initAdmin();
  const db = admin.firestore();

  const results = [];
  let milestonesFound = 0;
  let emailsSent = 0;

  for (const [siteId, goals] of Object.entries(MILESTONES_BY_SITE)) {
    console.log("[checkMilestones] site:", siteId);

    const countSnap = await db.collection("visitCounts").doc(siteId).get();
    const count = countSnap.exists ? Number(countSnap.data()?.count ?? 0) : 0;
    console.log("[checkMilestones] count:", siteId, count);

    for (const m of goals) {
      if (count < m) continue;

      milestonesFound += 1;

      const milestoneId = `${siteId}_${m}`;
      const ref = db.collection("milestones").doc(milestoneId);

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

      if (!shouldSend) {
        console.log("[checkMilestones] SKIP already sent/sending:", milestoneId);
        continue;
      }

      try {
        const subject = `🎯 Milestone alcanzado: ${siteId} → ${m}`;
        const message = `El sitio "${siteId}" alcanzó el hito ${m}. Conteo actual: ${count}.`;

        console.log("[checkMilestones] SEND:", milestoneId, "to", notifyEmails.join(", "));

        for (const to_email of notifyEmails) {
          await sendEmailJS({ to_email, subject, message, siteId, milestone: m, countAtSend: count });
          emailsSent += 1;
        }

        await ref.set(
          { status: "sent", sentAt: admin.firestore.FieldValue.serverTimestamp() },
          { merge: true }
        );

        results.push({ siteId, milestone: m, status: "sent" });
      } catch (err) {
        console.log("[checkMilestones] ERROR:", milestoneId, String(err?.message || err));

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

  console.log("[checkMilestones] milestones found:", milestonesFound);
  console.log("[checkMilestones] emails sent:", emailsSent);
  console.log("[checkMilestones] done", new Date().toISOString());

  return { ok: true, meta: { milestonesFound, emailsSent }, results };
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log("[checkMilestones] FATAL:", String(e?.message || e));
    process.exit(1);
  });
