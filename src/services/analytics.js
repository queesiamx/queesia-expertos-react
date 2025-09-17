// src/services/analytics.js
import { auth } from "../firebase";

function alreadyTrackedToday(pageKey) {
  const key = `qs_track_${pageKey}_${new Date().toISOString().slice(0, 10)}`;
  if (sessionStorage.getItem(key)) return true;
  sessionStorage.setItem(key, "1");
  return false;
}

export async function trackVisit(pageKey) {
  // evita múltiples hits por día/página en el mismo navegador
  if (alreadyTrackedToday(pageKey)) return;

  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken().catch(() => null) : null;

  await fetch("/api/trackVisit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ page: pageKey }),
  }).catch(() => {});
}
