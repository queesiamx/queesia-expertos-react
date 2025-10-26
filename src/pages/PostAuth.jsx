// src/pages/PostAuth.jsx
import React from "react";

export default function PostAuth() {
  // Pantalla neutra: el AuthRedirectGate se encarga de navegar.
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="flex items-center gap-3 text-gray-600">
        <span className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full" />
        <span>Procesando inicio de sesión…</span>
      </div>
    </main>
  );
}
