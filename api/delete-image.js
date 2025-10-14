// api/delete-image.js
const ALLOWED_ORIGINS = [
  "https://expertos.queesia.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function matchOrigin(origin) {
  if (!origin) return null;
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  // permitir cualquier *.vercel.app (opcional, comenta si no lo quieres)
  if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return origin;
  return null;
}

function cors(res, origin) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

module.exports = async (req, res) => {
  const origin = matchOrigin(req.headers.origin);
  cors(res, origin);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const { public_id } = req.body || {};
    if (!public_id) return res.status(400).json({ ok: false, error: "public_id required" });

    // TODO: borra en Cloudinary aquí (server-side), ejemplo:
    // await cloudinary.uploader.destroy(public_id);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
};
