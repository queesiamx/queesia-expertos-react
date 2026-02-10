import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const ORIGINS = (process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

function setCors(req, res) {
  const origin = req.headers.origin || "";
  const allowOrigin = ORIGINS.length ? (ORIGINS.includes(origin) ? origin : ORIGINS[0]) : origin;

  res.setHeader("Vary", "Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function initAdmin() {
  if (getApps().length) return;
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
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
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") {
    try { return req.body ? JSON.parse(req.body) : {}; } catch { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = String(req.query?.action || "").toLowerCase();

  try {
    // me no requiere POST
    if (action === "me") {
      if (req.method !== "GET") return res.status(405).json({ ok:false, error:"Method not allowed" });

      initAdmin();
      const cookies = parseCookie(req.headers.cookie || "");
      const sessionCookie = cookies.__session;

      if (!sessionCookie) return res.status(200).json({ user: null });

      try {
        const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
        return res.status(200).json({ user: decoded });
      } catch {
        return res.status(200).json({ user: null });
      }
    }

    if (action === "login") {
      if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

      initAdmin();
      const body = await readJsonBody(req);
      const idToken = body.idToken;
      if (!idToken) return res.status(400).json({ ok:false, error:"Missing idToken" });

      const expiresIn = 14 * 24 * 60 * 60 * 1000;
      const sessionCookie = await getAuth().createSessionCookie(idToken, { expiresIn });
      const maxAge = Math.floor(expiresIn / 1000);

      res.setHeader(
        "Set-Cookie",
        `__session=${sessionCookie}; Max-Age=${maxAge}; Path=/; Domain=.queesia.com; HttpOnly; Secure; SameSite=None`
      );
      return res.status(200).json({ ok: true });
    }

    if (action === "logout") {
      if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Method not allowed" });

      res.setHeader(
        "Set-Cookie",
        `__session=; Max-Age=0; Path=/; Domain=.queesia.com; HttpOnly; Secure; SameSite=None`
      );
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ ok:false, error:"Invalid action. Use action=login|me|logout" });
  } catch (e) {
    console.error("SSO error:", e);
    return res.status(500).json({ ok:false, error: e?.message || "Server error" });
  }
}
