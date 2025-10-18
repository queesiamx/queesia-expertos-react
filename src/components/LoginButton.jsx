import React from "react";

/**
 * Botón “tonto” de login:
 * - NO abre selectores, NO hace redirect/popup.
 * - Solo ejecuta onClick (el contenedor decide qué hacer).
 */
export default function LoginButton({ onClick, className = "", children = "Iniciar sesión" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 hover:bg-slate-50 text-slate-800 ${className}`}
      aria-label="Iniciar sesión"
    >
      {/* Google icon */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3C33.9 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.4 5.1 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.5-7.6 21-18 .1-1 .1-2 .1-3 0-1.1-.1-2.1-.3-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.9 16.6 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C34.4 5.1 29.5 3 24 3 15.5 3 8.2 7.8 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.3l-6.3-5.2C29.3 36.2 26.9 37 24 37c-5.3 0-9.8-3.3-11.6-8l-6.7 5.2C8.5 41.7 15.7 45 24 45z"/>
        <path fill="#1976D2" d="M45 24c0-1-.1-2.1-.3-3.5H24v8h11.3c-1.1 3.1-3.5 5.5-6.6 6.5l6.3 5.2C38.8 37.9 45 31.8 45 24z"/>
      </svg>
     {children}
    </button>
  );
}