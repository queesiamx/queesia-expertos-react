// api/get-visits.ts  (RTC-CO)
// Endpoint de lectura de cifras. TS sin @vercel/node.

import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

export default async function handler(req: any, res: any) {
  const slug = String((req.query && req.query.slug) || '/');
  const day  = new Date().toISOString().slice(0, 10);

  const pageSnap = await db.doc(`page_stats/${slug}`).get();
  const daySnap  = await db.doc(`page_stats/${slug}/days/${day}`).get();

  const totals = pageSnap.exists ? pageSnap.data()! : {};
  const today  = daySnap.exists  ? daySnap.data()!  : {};

  res.json({
    totalViews: totals.totalViews || 0,
    totalUnique: totals.totalUnique || 0,
    todayViews: today.views || 0,
    todayUnique: today.unique || 0,
  });
}
