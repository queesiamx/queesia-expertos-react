import { auth } from "@/firebase";
import { getRedirectResult } from "firebase/auth";

/**
 * Resuelve el resultado del redirect SOLO una vez por carga.
 * Deja trazas para confirmar que el handler se ejecutó.
 */
export async function resolveRedirectOnce() {
  if (sessionStorage.getItem("redirectResolved") === "1") return null;
  sessionStorage.setItem("redirectResolved", "1");

  try {
    console.log("[redirect] resolving…");
    const res = await getRedirectResult(auth);
    if (res?.user) {
      console.log("[redirect] OK → uid:", res.user.uid, "email:", res.user.email);
    } else {
      console.log("[redirect] vacío (no había pending redirect)");
    }
    return res;
  } catch (e) {
    console.error("[redirect] error:", e);
    return null;
  }
}
