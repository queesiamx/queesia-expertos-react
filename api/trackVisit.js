// /api/trackVisit.js  (ESM)
import crypto from "crypto";
import admin from "firebase-admin";

/* ---------- CORS ---------- */
const ALLOWLIST = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://expertos.queesia.com,https://foro.queesia.com,https://queesia.com")
  .split(",").map(s => s.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin || "";
  res.setHeader("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.setHeader("Access-Control-Allow-Origin", ALLOWLIST.includes(origin) ? origin : (ALLOWLIST[0] || origin));
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");
}

/* ---------- Firebase Admin ---------- */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      project_id: process.env.FB_PROJECT_ID,
      client_email: process.env.FB_CLIENT_EMAIL,
      private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
const db = admin.firestore();

/* ---------- Utilidades ---------- */
const EXCLUDE_EMAILS = (process.env.EXCLUDE_EMAILS || "").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
const EXCLUDE_UIDS   = (process.env.EXCLUDE_UIDS   || "").split(",").map(s=>s.trim()).filter(Boolean);
const EXCLUDE_IP_HASHES = new Set((process.env.EXCLUDE_IP_HASHES || "").split(",").map(s=>s.trim()).filter(Boolean));

function ipFromReq(req) {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string") return xf.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
}
function hashIp(ip) {
  const pepper = process.env.IP_PEPPER || "change_me_long_random";
  return crypto.createHash("sha256").update(`${ip}|${pepper}`).digest("hex");
}

function parseCookie(cookieHeader = "") {
  const out = {};
  cookieHeader.split(";").forEach(part => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(v.join("=") || "");
  });
  return out;
}

async function readJsonBody(req) {
  let body = req.body || {};
  if (typeof body === "string") {
    try { body = body ? JSON.parse(body) : {}; } catch { body = {}; }
  }
  return body;
}

/* ---------- Handler ---------- */
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = String(req.query?.action || "").toLowerCase();

  try {
    /* =========================================================
       MODO SSO (sin crear nuevas funciones)
       ========================================================= */

    // 1) ME: lee cookie y devuelve user
    if (action === "me") {
      if (req.method !== "GET") return res.status(405).json({ ok:false, error:"Method not allowed" });

      const cookies = parseCookie(req.headers.cookie || "");
      const sessionCookie = cookies.__session;
      if (!sessionCookie) return res.status(200).json({ user: null });

      try {
        const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
        return res.status(200).json({ user: decoded });
      } catch {
        return res.status(200).json({ user: null });
      }
    }

    // 2) LOGIN: recibe idToken y setea cookie global .queesia.com
    if (action === "login") {
      if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

      const body = await readJsonBody(req);
      const { idToken } = body || {};
      if (!idToken) return res.status(400).json({ ok:false, error:"Missing idToken" });

      const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 días
      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
      const maxAge = Math.floor(expiresIn / 1000);

      res.setHeader(
        "Set-Cookie",
        `__session=${sessionCookie}; Max-Age=${maxAge}; Path=/; Domain=.queesia.com; HttpOnly; Secure; SameSite=None`
      );

      return res.status(200).json({ ok: true });
    }

    // 3) LOGOUT: borra cookie global
    if (action === "logout") {
      if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

      res.setHeader(
        "Set-Cookie",
        `__session=; Max-Age=0; Path=/; Domain=.queesia.com; HttpOnly; Secure; SameSite=None`
      );

      return res.status(200).json({ ok: true });
    }

    /* =========================================================
       MODO TRACKING (comportamiento original)
       ========================================================= */

    if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

    // Body robusto: soporta string o objeto
    const body = await readJsonBody(req);

    const page = body.page ?? "home";
    const pageKey = String(page).replace(/[^a-z0-9_-]/gi, "_");

    // Token opcional
    let user = null;
    const authz = req.headers.authorization;
    if (authz?.startsWith("Bearer ")) {
      try { user = await admin.auth().verifyIdToken(authz.slice(7)); } catch {}
    }

    const ipHash = hashIp(ipFromReq(req));

    // Exclusiones
    if (user?.uid && EXCLUDE_UIDS.includes(user.uid)) return res.json({ ok:true, excluded:"uid" });
    if (user?.email && EXCLUDE_EMAILS.includes((user.email || "").toLowerCase())) return res.json({ ok:true, excluded:"email" });
    if (EXCLUDE_IP_HASHES.has(ipHash)) return res.json({ ok:true, excluded:"ip" });

    // Idempotencia por día/página con create() + increment()
    const today = new Date().toISOString().slice(0,10);
    const visitDoc = db.collection("page_stats").doc(`${pageKey}__${today}__${ipHash}`);

    let createdNew = false;
    try {
      // crea el doc único; si ya existe, lanza "already-exists"
      await visitDoc.create({
        page: pageKey,
        rawPage: page || null,
        date: today,
        ipHash,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      createdNew = true;
    } catch (e) {
      // Firestore Admin a veces usa code numérico (6) o string "already-exists"
      if (e?.code === 6 || e?.code === "already-exists") {
        createdNew = false; // ya existía → no contamos doble
      } else {
        throw e; // otro error real
      }
    }

    if (createdNew) {
      // solo si se creó el doc, incrementa el agregado diario
      const aggRef = db.collection("page_stats_daily").doc(`${pageKey}__${today}`);
      await aggRef.set(
        {
          page: pageKey,
          date: today,
          visits: admin.firestore.FieldValue.increment(1),
        },
        { merge: true }
      );
    }

    return res.json({ ok:true });
  } catch (e) {
    console.error("trackVisit error:", e);
    return res.status(500).json({ ok:false, error:"Server error" });
  }
}
