// src/auth/logout.js
import { auth } from "@/firebase";

export async function logout() {
  try {
  // ✅ borra cookie SSO global
    await fetch("/api/trackVisit?action=logout", {
     method: "POST",
      credentials: "include",
    });
    // ✅ cierra sesión local (Firebase)
    await auth.signOut();
  } catch (err) {
    console.error("logout error", err);
  }
}
