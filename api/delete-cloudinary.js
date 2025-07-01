const cloudinary = require('cloudinary').v2;

// Mejor usa variables de entorno en Vercel para tus claves
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Vercel-style: función exportada como handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  // Si usas fetch desde el frontend React, recuerda enviar Content-Type: application/json
  const { public_id } = req.body;
  if (!public_id) return res.status(400).json({ error: 'Falta public_id' });
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
