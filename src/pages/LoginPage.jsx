// src/pages/LoginPage.jsx
import { loginWithGoogle } from "@/auth/login";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate } from "react-router-dom";
import { pathByRole } from "@/auth/pathByRole";

export default function LoginPage() {
  const { user, rol, aprobado } = useAuth();

  if (user && rol) {
    return <Navigate to={pathByRole(rol, aprobado)} replace />;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm p-6 rounded-2xl shadow border bg-white">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Iniciar sesión
        </h1>
        <button
          onClick={loginWithGoogle}
          className="w-full rounded-xl py-3 border hover:bg-gray-50 active:scale-[.99] transition"
        >
          Continuar con Google
        </button>
        <p className="text-xs text-center mt-3 opacity-70">
          Al continuar aceptas los Términos y la Política de privacidad.
        </p>
      </div>
    </div>
  );
}
