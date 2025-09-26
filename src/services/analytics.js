// src/services/analytics.js
import { auth } from '@/firebase';

const inflight = new Set(); // evita llamadas concurrentes por StrictMode

function trackedKey(pageKey) {
  return `tracked_${pageKey}_${new Date().toISOString().slice(0,10)}`;
}
function isTracked(pageKey) {
  return !!sessionStorage.getItem(trackedKey(pageKey));
}
function markTracked(pageKey) {
  sessionStorage.setItem(trackedKey(pageKey), '1');
}

export async function trackVisit(pageKey) {
  const key = trackedKey(pageKey);

  // si ya está registrado o en vuelo, no dispares otra vez
  if (isTracked(pageKey) || inflight.has(key)) return;
  inflight.add(key);

  let idToken = null;
  try {
    const user = auth?.currentUser ?? null;
    idToken = user ? await user.getIdToken() : null;
  } catch {}

  try {
    const res = await fetch(`/api/trackVisit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ page: pageKey }),
    });

    if (res.ok) markTracked(pageKey); // ✅ solo si fue exitoso
    else console.warn('trackVisit not ok:', res.status);
  } catch (e) {
    console.warn('trackVisit error:', e);
  } finally {
    inflight.delete(key);
  }
}
