// src/auth/ensureUserDoc.js
import { db } from "@/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function ensureUserDoc(user, rol = "usuario") {
  if (!user?.uid) {
    console.warn("[ensureUserDoc] No user provided");
    return;
  }

  const normalizedRole = String(rol || "usuario").toLowerCase();
  
  console.log("[ensureUserDoc] Procesando usuario:", {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    rol: normalizedRole
  });

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    const base = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      rol: normalizedRole,
      updatedAt: serverTimestamp(),
    };

    if (!snap.exists()) {
      // Crear documento nuevo
      console.log("[ensureUserDoc] Creando nuevo documento con rol:", normalizedRole);
      await setDoc(ref, { 
        ...base, 
        createdAt: serverTimestamp() 
      }, { merge: true });
      console.log("[ensureUserDoc] ✅ Documento creado exitosamente");
    } else {
      // Actualizar documento existente
      const current = snap.data() || {};
      const next = { ...base };
      
      // Respetar el rol existente si ya está en la DB
      if (current.rol) {
        console.log("[ensureUserDoc] Manteniendo rol existente:", current.rol);
        next.rol = current.rol;
      } else {
        console.log("[ensureUserDoc] Asignando nuevo rol:", normalizedRole);
      }
      
      // Preservar aprobado si existe
      if (typeof current.aprobado === "boolean") {
        next.aprobado = current.aprobado;
      }
      
      await setDoc(ref, next, { merge: true });
      console.log("[ensureUserDoc] ✅ Documento actualizado exitosamente");
    }
  } catch (error) {
    console.error("[ensureUserDoc] ❌ Error:", error);
    console.error("[ensureUserDoc] Error code:", error.code);
    console.error("[ensureUserDoc] Error message:", error.message);
    throw error; // Re-lanzar para que AuthRedirectGate lo maneje
  }
}