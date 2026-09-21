/* global process */
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FB_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FB_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FB_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";
  const [, token] = authorization.match(/^Bearer\s+(.+)$/i) || [];
  return token || null;
}

export async function requireAdmin(req) {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("No autenticado");
    error.status = 401;
    throw error;
  }

  const app = getAdminApp();
  let decoded;

  try {
    decoded = await getAuth(app).verifyIdToken(token);
  } catch (error) {
    const authError = new Error("No autenticado");
    authError.status = 401;
    authError.cause = error;
    throw authError;
  }

  const db = getFirestore(app);
  const userSnap = await db.collection("users").doc(decoded.uid).get();
  const role = String(userSnap.exists ? userSnap.data()?.rol || "" : "").trim().toLowerCase();

  if (role !== "admin") {
    const error = new Error("No autorizado");
    error.status = 403;
    throw error;
  }

  return {
    uid: decoded.uid,
    email: decoded.email || null,
    role,
  };
}
