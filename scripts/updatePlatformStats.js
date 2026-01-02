// scripts/updatePlatformStats.js
// Actualiza: platform_stats/expertos
// - expertsVerified: # de experts aprobados
// - avgRating: promedio global de ratings (expertRatings)
// - ratingsCount: # total de ratings
// - consultasResueltas: # de consultas atendidas (consultasModeradas aprobada + respondida)
// - updatedAt: serverTimestamp

import admin from "firebase-admin";

function initAdmin() {
  if (admin.apps.length) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT env var (JSON string).");

  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function countQuery(query, pageSize = 1000) {
  // Conteo por paginación (compatible sin aggregate count)
  let total = 0;
  let lastDoc = null;

  while (true) {
    let q = query.limit(pageSize);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    total += snap.size;

    if (snap.size < pageSize) break;
    lastDoc = snap.docs[snap.docs.length - 1];
  }

  return total;
}

async function computeRatingsGlobal(db) {
  // Estrategia robusta: toma TODOS los ratings de expertRatings y calcula promedio global.
  // Ajusta aquí si tu campo se llama distinto: rating / value / stars
  const col = db.collection("expertRatings");

  let sum = 0;
  let count = 0;

  let lastDoc = null;
  const pageSize = 1000;

  while (true) {
    let q = col.orderBy(admin.firestore.FieldPath.documentId()).limit(pageSize);
    if (lastDoc) q = q.startAfter(lastDoc);

    const snap = await q.get();
    if (snap.empty) break;

    for (const d of snap.docs) {
      const data = d.data() || {};
      const val =
        (typeof data.rating === "number" && data.rating) ||
        (typeof data.value === "number" && data.value) ||
        (typeof data.stars === "number" && data.stars) ||
        null;

      if (typeof val === "number" && Number.isFinite(val)) {
        sum += val;
        count += 1;
      }
    }

    if (snap.size < pageSize) break;
    lastDoc = snap.docs[snap.docs.length - 1];
  }

  const avg = count > 0 ? sum / count : null;
  return { avgRating: avg, ratingsCount: count };
}

async function main() {
  initAdmin();
  const db = admin.firestore();

  // 1) Experts verificados (aprobado == true)
  const expertsApprovedQuery = db.collection("experts").where("aprobado", "==", true);
  const expertsVerified = await countQuery(expertsApprovedQuery.select(admin.firestore.FieldPath.documentId()));

  // 2) Rating global desde expertRatings
  const { avgRating, ratingsCount } = await computeRatingsGlobal(db);

  // 3) Consultas atendidas:
  // tu doc muestra: aprobada: true y estado: "respondida"
  const consultasQuery = db
    .collection("consultasModeradas")
    .where("aprobada", "==", true)
    .where("estado", "==", "respondida");

  const consultasResueltas = await countQuery(consultasQuery.select(admin.firestore.FieldPath.documentId()));

  // 4) Update doc platform_stats/expertos
  const ref = db.collection("platform_stats").doc("expertos");

  await ref.set(
    {
      expertsVerified,
      avgRating: avgRating == null ? null : Number(avgRating.toFixed(1)), // 1 decimal
      ratingsCount,
      consultasResueltas,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log("✅ platform_stats/expertos actualizado:", {
    expertsVerified,
    avgRating: avgRating == null ? null : Number(avgRating.toFixed(1)),
    ratingsCount,
    consultasResueltas,
  });
}

main().catch((err) => {
  console.error("❌ Error updatePlatformStats:", err);
  process.exit(1);
});
