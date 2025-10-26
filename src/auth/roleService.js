// src/auth/roleService.js
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { normalizeRole, ROLES } from "@/constants/roles";

/** Lee o crea el perfil en users/{uid} y normaliza rol/aprobado */
export async function getOrCreateUserProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const payload = {
      uid: user.uid,
      correo: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      rol: ROLES.USUARIO,
      aprobado: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, payload, { merge: true });
    return { rol: ROLES.USUARIO, aprobado: false };
  }

  const data = snap.data() || {};
  return {
    rol: normalizeRole(data.rol),
    aprobado: Boolean(data.aprobado),
    ...data,
  };
}
