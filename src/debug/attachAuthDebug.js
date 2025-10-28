// src/debug/attachAuthDebug.js
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export function attachAuthDebug() {
  if (typeof window === "undefined") return;
  if (window.__AUTH_DEBUG_ATTACHED__) return; // evita duplicado
  window.__AUTH_DEBUG_ATTACHED__ = true;

  const log = (...a) => console.log("[auth:debug]", ...a);
  const err = (...a) => console.error("[auth:debug]", ...a);

  // Contexto básico
  log("origin:", location.origin);
  log("UA:", navigator.userAgent);

  // Storage / cookies rápidos
  try { localStorage.setItem("__t","1"); localStorage.removeItem("__t"); log("localStorage: OK"); }
  catch { log("localStorage: BLOQUEADO"); }

  try {
    const idb = indexedDB.open("__probe__");
    idb.onerror = () => log("indexedDB: BLOQUEADO");
    idb.onsuccess = () => log("indexedDB: OK");
  } catch { log("indexedDB: EXC"); }

  try {
    document.cookie = "__probe__=1; SameSite=Lax";
    log("cookies (write intent) lanzado");
  } catch { log("cookies: BLOQUEADAS"); }

  // 1) Resultado del redirect (si lo hubo)
  (async () => {
    try {
      const res = await getRedirectResult(auth);
      if (res?.user) {
        log("getRedirectResult → user.uid:", res.user.uid);
      } else {
        log("getRedirectResult → sin user (null)");
      }
    } catch (e) {
      err("getRedirectResult ERROR:", e?.code, e?.message);
    }
  })();

  // 2) Listener de sesión
  onAuthStateChanged(auth, async (u) => {
    if (!u) {
      log("onAuthStateChanged → sin sesión");
      return;
    }
    log("onAuthStateChanged → sesión uid:", u.uid);
    try {
      const t = await u.getIdToken(/* forceRefresh */ false);
      log("idToken len:", t?.length || 0);
    } catch (e) {
      err("getIdToken ERROR:", e?.code, e?.message);
    }
  });

  // 3) Pulso suave para ver si se pierde currentUser
  let ticks = 0;
  const iv = setInterval(() => {
    ticks += 1;
    const u = auth.currentUser;
    log(`heartbeat#${ticks} → currentUser:`, u ? u.uid : null);
    if (ticks > 20) clearInterval(iv); // 20 latidos (~20s)
  }, 1000);

  log("attachAuthDebug listo ✅");
}
