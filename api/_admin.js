// /api/_admin.js  (ESM; asegúrate de tener "type":"module" en package.json)
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      // Si pegaste la private key con \n escapados en el env de Vercel, esta línea es correcta:
      privateKey: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      // Si pegaste la key con saltos REALES (no \n), usa en su lugar:
      // privateKey: process.env.FB_PRIVATE_KEY,
    }),
  });
}

export const adb = getFirestore();
