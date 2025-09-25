// src/services/analytics.js
function alreadyTrackedToday(pageKey) {
  const key = `tracked_${pageKey}_${new Date().toISOString().slice(0,10)}`;
  if (sessionStorage.getItem(key)) return true;
  sessionStorage.setItem(key, "1");
  return false;
}

import { auth } from '/lib/firebaseConfig'; // <-- este import es clave

export async function trackVisit(pageKey) {
  const API_BASE = import.meta.env.VITE_API_BASE || '';

  if (import.meta.env.DEV && !API_BASE) {
    console.debug('trackVisit omitido en desarrollo (sin VITE_API_BASE)');
    return;
  }

  let idToken = null;
  try {
    const user = auth?.currentUser ?? null;
    idToken = user ? await user.getIdToken() : null;
  } catch {}

  await fetch(`${API_BASE}/api/trackVisit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ page: pageKey }),
  }).catch(() => {});
}
