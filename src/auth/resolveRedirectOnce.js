// src/auth/resolveRedirectOnce.js
import { auth } from "@/firebase";
import { getRedirectResult } from "firebase/auth";

/**
 * Resuelve el resultado del redirect en cada carga.
 * Seguro: si no hay redirect pendiente, devuelve null.
 */
export async function resolveRedirectOnce() {
  try {
    console.log("[redirect] resolving…");
    const res = await getRedirectResult(auth);

    if (res?.user) {
      console.log("[redirect] OK → uid:", res.user.uid, "email:", res.user.email);
      // opcional: limpiar intención/rol temporal
      try {
        sessionStorage.removeItem("loginIntent");
        // sessionStorage.removeItem("pendingRole"); // si no lo necesitas después
      } catch {}
      return res; // ← importante: devolver el resultado
    }

    console.log("[redirect] vacío (no había pending redirect)");
    return null;
  } catch (e) {
    console.error("[redirect] error:", e);
    return null;
  }
}
