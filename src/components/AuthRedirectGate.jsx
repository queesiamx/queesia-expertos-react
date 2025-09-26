// src/components/AuthRedirectGate.jsx
import { useEffect, useRef } from "react";
import { auth } from "../../lib/firebaseConfig";
import { getRedirectResult } from "firebase/auth";

const ADMIN_EMAILS = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

async function afterLogin(user) {
  const token = await user.getIdToken();
  localStorage.setItem("authToken", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
    })
  );

  const pendingRole = localStorage.getItem("pendingRole") || "";
  if (pendingRole) localStorage.removeItem("pendingRole");

  const email = user.email || "";
  const isAdmin = ADMIN_EMAILS.includes(email) || pendingRole === "ADMIN";
  const isExpert = pendingRole === "EXPERTO";

  if (isAdmin) {
    window.location.replace("/admin-expertos");
    return;
  }
  if (isExpert) {
    // Si es experto y aún no está aprobado, tu lógica interna lo manda a /registro
    window.location.replace("/dashboard"); // tu guard/consulta en Dashboard decide /registro si falta
    return;
  }
  // Usuario general
  window.location.replace("/mis-consultas");
}

export default function AuthRedirectGate() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) await afterLogin(res.user);
      } catch (e) {
        console.error("[AuthRedirectGate] getRedirectResult error:", e);
      }
    })();
  }, []);

  return null; // no renderiza nada
}
