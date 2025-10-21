// src/auth/ensureUserDoc.js
import { db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function ensureUserDoc(user, rol = "usuario") {
  if (!user?.uid) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const base = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    rol: String(rol || "usuario").toLowerCase(),
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, { ...base, createdAt: serverTimestamp() }, { merge: true });
  } else {
    // no pisar rol si ya existe uno en la DB; sólo actualiza si venía vacío
    const current = snap.data() || {};
    const next = { ...base };
    if (current.rol) next.rol = current.rol;
    await setDoc(ref, next, { merge: true });
  }
}
