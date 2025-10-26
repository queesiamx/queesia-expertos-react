// src/services/analytics.js
import { auth } from "@/firebase";

const inflight = new Set(); // evita llamadas concurrentes por StrictMode

function trackedKey(pageKey) {
  return `tracked_${pageKey}_${new Date().toISOString().slice(0, 10)}`;
}
function isTracked(pageKey) {
  if (typeof sessionStorage === "undefined") return false;
  return !!sessionStorage.getItem(trackedKey(pageKey));
}
function markTracked(pageKey) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(trackedKey(pageKey), "1");
}

export async function trackVisit(pageKey) {
  // 🛡️ Silencia en desarrollo local (evita 404 en Vite)
  try {
    const host = typeof location !== "undefined" ? location.hostname : "";
    if (host === "localhost" || host === "127.0.0.1") return;
  } catch {
    // no-op (SSR/edge sin location)
  }

  const key = trackedKey(pageKey);

  // si ya está registrado o en vuelo, no dispares otra vez
  if (isTracked(pageKey) || inflight.has(key)) return;
  inflight.add(key);

  let idToken = null;
  try {
    const user = auth?.currentUser ?? null;
    idToken = user ? await user.getIdToken() : null;
  } catch {
    // no token → seguimos sin Authorization
  }

  try {
    const res = await fetch(`/api/trackVisit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ page: pageKey }),
    });

    if (res.ok) {
      markTracked(pageKey); // ✅ solo si fue exitoso
    } else {
      console.warn("[analytics] trackVisit not ok:", res.status);
    }
  } catch (e) {
    console.warn("[analytics] trackVisit error:", e);
  } finally {
    inflight.delete(key);
  }
}
