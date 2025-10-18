// src/components/AuthRedirectGate.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { getRedirectResult } from "firebase/auth";

export default function AuthRedirectGate() {
  const nav = useNavigate();
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    (async () => {
      try {
        // Sólo si marcamos que había redirect pendiente
        if (localStorage.getItem("authRedirectPending") === "1") {
          const res = await getRedirectResult(auth);
          // borra el flag pase lo que pase
          localStorage.removeItem("authRedirectPending");

          if (res?.user) {
            // Delega la navegación de destino a PostAuth
            nav("/post-auth", { replace: true });
          }
        }
      } catch (e) {
        console.warn("[AuthRedirectGate] getRedirectResult:", e);
        localStorage.removeItem("authRedirectPending");
      }
    })();
  }, [nav]);

  return null;
}
