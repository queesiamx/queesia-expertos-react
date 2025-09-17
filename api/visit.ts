// api/visit.ts  (RTC-CO)
// TS sin @vercel/node. Funciona en Vercel sin tsconfig y sin tipos extra.

import * as admin from 'firebase-admin';
import { createHash } from 'crypto';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Escapa saltos de línea en Vercel: replace(/\\n/g, '\n')
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

const BOT_RE =
  /(bot|crawl|spider|slurp|facebook|whatsapp|telegram|preview|embed|fetch|monitor|pingdom|headless|puppeteer|cfnetwork|linkedin|discord)/i;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const ua = String(req.headers['user-agent'] || '');
  if (BOT_RE.test(ua)) return res.status(204).end(); // ignorar bots

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const slug = String(body.slug || (req.query && req.query.slug) || '/');
  const referrer = String(body.referrer || '');

  // IP desde proxy
  const ipHeader = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '';
  const ip = ipHeader.split(',')[0]?.trim();

  // (Opcional) verificar auth para excluir equipo o exigir login
  let uid: string | null = null;
  try {
    const auth = req.headers.authorization as string | undefined;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    }
  } catch {
    // sin auth válida = visitante anónimo
  }

  // ¿Quieres contar solo logueados? activa REQUIRE_AUTH=true
  if (process.env.REQUIRE_AUTH === 'true' && !uid) return res.status(204).end();

  const excludeUids = (process.env.EXCLUDE_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);
  const excludeIps  = (process.env.EXCLUDE_IPS  || '').split(',').map(s => s.trim()).filter(Boolean);
  if ((uid && excludeUids.includes(uid)) || (ip && excludeIps.includes(ip))) {
    return res.status(204).end(); // excluir equipo interno
  }

  // Hash diario privacy-friendly (no guardas IP en claro)
  const day = new Date().toISOString().slice(0, 10);           // YYYY-MM-DD
  const salt = process.env.SALT || 's';
  const base = [ip || 'noip', ua.slice(0, 80), day].join('|'); // robusto a NAT, sin PII directo
  const dailyHash = createHash('sha256').update(base + salt).digest('hex');

  const pageRef = db.collection('page_stats').doc(slug);
  const dayRef  = pageRef.collection('days').doc(day);
  const visitorRef = dayRef.collection('visitors').doc(dailyHash);

  await db.runTransaction(async tx => {
    const daySnap = await tx.get(dayRef);
    if (!daySnap.exists) {
      tx.set(dayRef, {
        day,
        unique: 0,
        views: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // siempre cuenta una vista (no-bot, no-equipo)
    tx.update(dayRef, {
      views: admin.firestore.FieldValue.increment(1),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // si no ha visto hoy, cuenta único
    const vSnap = await tx.get(visitorRef);
    if (!vSnap.exists) {
      tx.set(visitorRef, {
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        referrer,
        ua: ua.slice(0, 120),
      });
      tx.update(dayRef, { unique: admin.firestore.FieldValue.increment(1) });
      tx.set(
        pageRef,
        {
          totalUnique: admin.firestore.FieldValue.increment(1),
          totalViews: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    } else {
      tx.set(
        pageRef,
        { totalViews: admin.firestore.FieldValue.increment(1) },
        { merge: true }
      );
    }
  });

  return res.status(204).end();
}
