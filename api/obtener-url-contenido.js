// /api/obtener-url-contenido.js
import { db, bucket } from '../../lib/firebaseAdmin';

export default async function handler(req, res) {
  const { usuarioId, contenidoId } = req.query;

  if (!usuarioId || !contenidoId) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const comprasSnap = await db.collection('comprasContenido')
      .where('usuarioId', '==', usuarioId)
      .where('contenidoId', '==', contenidoId)
      .where('accesoValido', '==', true)
      .limit(1)
      .get();

    if (comprasSnap.empty) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener la ruta del archivo desde la colección de contenidos
    const contenidoSnap = await db.collection('contenidosExpertos')
      .doc(contenidoId).get();

    if (!contenidoSnap.exists) {
      return res.status(404).json({ error: 'Contenido no encontrado' });
    }

    const archivoPath = contenidoSnap.data().archivoPath;

    // Crear URL firmada válida por 10 minutos
    const [url] = await bucket.file(archivoPath).getSignedUrl({
      action: 'read',
      expires: Date.now() + 10 * 60 * 1000, // 10 minutos
    });

    res.status(200).json({ url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
