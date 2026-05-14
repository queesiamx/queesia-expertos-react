// /api/delete-cloudinary.js
/* global process */
import crypto from "node:crypto";

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ALLOWED = (process.env.CORS_ORIGINS || "http://localhost:5173,https://expertos.queesia.com")
  .split(",").map(s => s.trim());

function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FB_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FB_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FB_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

async function getUidFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const [, token] = authorization.match(/^Bearer\s+(.+)$/i) || [];
  if (!token) return null;

  const app = getAdminApp();
  const decoded = await getAuth(app).verifyIdToken(token);
  return decoded.uid;
}

function isOwner(data, uid) {
  return Boolean(uid && (data?.expertoId === uid || data?.expertoUID === uid));
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : value;
}

function buildUpdatePayload(body, uid) {
  const allowed = [
    "titulo",
    "descripcion",
    "tipoContenido",
    "precio",
    "modalidad",
    "plataforma",
    "duracionHoras",
    "cupoMinimo",
    "cupoMaximo",
    "requierePago",
    "urlAccesoPrivado",
    "instruccionesAcceso",
    "fechasDisponibles",
    "estatus",
  ];

  const payload = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = normalizeText(body[key]);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "precio")) {
    payload.precio = payload.precio === "" || payload.precio == null ? null : Number(payload.precio);
    if (!Number.isFinite(payload.precio) || payload.precio < 0) throw new Error("Precio inválido");
  }

  for (const field of ["duracionHoras", "cupoMinimo", "cupoMaximo"]) {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      payload[field] = payload[field] === "" || payload[field] == null ? null : Number(payload[field]);
      if (payload[field] !== null && !Number.isFinite(payload[field])) throw new Error(`${field} inválido`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, "fechasDisponibles")) {
    payload.fechasDisponibles = Array.isArray(payload.fechasDisponibles)
      ? payload.fechasDisponibles.map((f) => String(f).trim()).filter(Boolean)
      : [];
  }

  payload.expertoId = uid;
  payload.expertoUID = uid;
  payload.actualizado = new Date().toISOString();

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

async function handleExpertContent(req, res) {
  try {
    const uid = await getUidFromRequest(req);
    if (!uid) return res.status(401).json({ error: "Sesión no válida" });

    const { id, ...body } = req.body || {};
    if (!id || typeof id !== "string") return res.status(400).json({ error: "Falta id del contenido" });

    const app = getAdminApp();
    const db = getFirestore(app);
    const ref = db.collection("contenidosExpertos").doc(id);
    const snap = await ref.get();

    if (!snap.exists) return res.status(404).json({ error: "Contenido no encontrado" });
    if (!isOwner(snap.data(), uid)) return res.status(403).json({ error: "No puedes modificar este contenido" });

    if (req.method === "DELETE") {
      await ref.delete();
      return res.status(200).json({ ok: true });
    }

    const payload = buildUpdatePayload(body, uid);
    await ref.set(payload, { merge: true });
    return res.status(200).json({ ok: true, data: payload });
  } catch (error) {
    console.error("expert-content error:", error);
    const message = error?.message || "No se pudo procesar el contenido";
    const status = message.includes("inválido") ? 400 : 500;
    return res.status(status).json({ error: message });
  }
}

async function handleCloudinaryDelete(req, res) {

  try {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    const { public_id, tipo = "contenido" } = req.body || {};
    if (!public_id) return res.status(400).json({ error: "Falta public_id" });
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Faltan variables de Cloudinary" });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${public_id}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha1").update(toSign + CLOUDINARY_API_SECRET).digest("hex");

    // image para perfil, raw para pdf
    const resourceType = tipo === "perfil" ? "image" : "raw";

    const form = new URLSearchParams();
    form.append("public_id", public_id);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);

    const resp = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/upload`,
      { method: "DELETE", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString() }
    );

    const text = await resp.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
    if (!resp.ok) return res.status(resp.status).json({ error: data?.error || text });

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error("delete-cloudinary error:", e);
    return res.status(500).json({ error: "No se pudo eliminar en Cloudinary" });
  }
}
export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "PATCH" || req.method === "DELETE") {
    return handleExpertContent(req, res);
  }

  if (req.method === "POST") {
    return handleCloudinaryDelete(req, res);
  }

  return res.status(405).json({ error: "Método no permitido" });
}