// src/pages/AuthBridge.jsx  (#RTC_CO)
import React, { useEffect } from "react";
import { useAuth } from "@/auth/context/AuthContext";
import { startLogin } from "@/auth/login";
// (Opcional) si quieres mantener el gate que tenías:
import AuthRedirectGate from "../components/AuthRedirectGate";

export default function AuthBridge() {
  const { user } = useAuth?.() || {};

  useEffect(() => {
    // Evita relanzar el redirect cuando regresamos del proveedor
    const flag = sessionStorage.getItem("redirectInProgress");
    if (!user && !flag) {
      try { sessionStorage.setItem("redirectInProgress", "1"); } catch {}
      startLogin(); // decide popup/redirect según UA y ?forcePopup=1
    }
 }, [user]);

  return (
    <>
      {/* Mantén tu gate si procesa el retorno; no interfiere con el start automático */}
     <AuthRedirectGate />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Redirigiendo / procesando inicio de sesión…</p>
      </div>
    </>
  );
}
