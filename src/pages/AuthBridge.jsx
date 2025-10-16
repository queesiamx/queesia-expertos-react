// src/pages/AuthBridge.jsx  (#RTC_CO)
import React from "react";
import AuthRedirectGate from "../components/AuthRedirectGate";

export default function AuthBridge() {
  // Sólo procesa el retorno y muestra un mensajito
  return (
    <>
      <AuthRedirectGate />
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Procesando inicio de sesión…</p>
      </div>
    </>
  );
}
