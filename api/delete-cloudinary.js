// /api/delete-cloudinary.js
import crypto from "node:crypto";

const ALLOWED = (process.env.CORS_ORIGINS || "http://localhost:5173,https://expertos.queesia.com")
  .split(",").map(s => s.trim());

function setCors(req, res) {
  const origin = req.headers.origin || "";
  if (ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")   return res.status(405).json({ error: "Método no permitido" });

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
    let data = null; try { data = JSON.parse(text); } catch {}
    if (!resp.ok) return res.status(resp.status).json({ error: data?.error || text });

    return res.status(200).json({ ok: true, data });
  } catch (e) {
    console.error("delete-cloudinary error:", e);
    return res.status(500).json({ error: "No se pudo eliminar en Cloudinary" });
  }
}
