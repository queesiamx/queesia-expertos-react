// src/auth/logout.js
import { auth } from "@/firebase";

export async function logout() {
  try {
    await auth.signOut();
  } catch (err) {
    console.error("logout error", err);
  }
}
