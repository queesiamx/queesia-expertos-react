// /api/delete-cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { public_id } = req.body;

  if (!public_id) {
    return res.status(400).json({ error: 'Falta public_id' });
  }

  try {
    const result = await cloudinary.uploader.destroy(public_id);
    
    // Si el recurso no existe (por ejemplo, ya fue eliminado antes), Cloudinary devuelve:
    // { result: "not found" }
    return res.status(200).json(result);
  } catch (err) {
    // Siempre devolvemos un JSON, aunque sea con error
    return res.status(500).json({ error: err.message || 'Error interno' });
  }
}
