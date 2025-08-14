// /api/obtener-url-contenido.js
import crypto from "node:crypto";

// autoriza localhost y prod (ajústalo si necesitas)
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
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: "Faltan variables de Cloudinary" });
    }

    // tipo: "perfil" | "contenido"
    const { tipo = "contenido", folder: folderIn } = (req.body || {});
    const folder = folderIn || (tipo === "perfil" ? "queesia/perfiles" : "queesia/contenidos");

    // Para imágenes de perfil usamos endpoint image/upload;
    // para pdfs podemos usar auto/upload (detecta pdf) y te regresa secure_url igual.
    const endpoint = tipo === "perfil" ? "image" : "auto";

    const timestamp = Math.floor(Date.now() / 1000);
    // construir string a firmar (parámetros en orden alfabético)
    const params = new URLSearchParams();
    if (folder) params.append("folder", folder);
    params.append("timestamp", String(timestamp));

    const toSign = params.toString(); // e.g. folder=queesia/contenidos&timestamp=...
    const signature = crypto.createHash("sha1").update(toSign + CLOUDINARY_API_SECRET).digest("hex");

    return res.status(200).json({
      uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpoint}/upload`,
      cloudName: CLOUDINARY_CLOUD_NAME,
      apiKey: CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      endpoint,        // "image" o "auto" (por si quieres depurar)
      paramsSigned: toSign
    });
  } catch (e) {
    console.error("obtener-url-contenido error:", e);
    return res.status(500).json({ error: "No se pudo generar la firma" });
  }
}
