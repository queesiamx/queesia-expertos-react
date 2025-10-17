// RTC_CO — src/components/LoginAccordion.jsx
import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function LoginAccordion({ open, onClose }) {
  if (!open) return null;

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose?.();
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      onClose?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="w-[92%] max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold mb-3">Inicia sesión</h2>
        <p className="text-sm text-slate-600 mb-4">
          Usa tu cuenta de Google para continuar.
        </p>
        <div className="flex gap-2">
          <button
            onClick={loginWithGoogle}
            className="flex-1 rounded-xl border px-4 py-2 hover:bg-slate-50"
          >
            Continuar con Google
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border px-4 py-2 text-slate-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
