// src/pages/LoginPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from "@/auth/login";
import { useAuth } from "@/auth/context/AuthContext";
import { pathByRole } from "@/auth/pathByRole";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, rol, aprobado, loading } = useAuth();

  useEffect(() => {
    if (loading) return;         // aún cargando Firestore
    if (!user) return;           // no hay sesión todavía
    if (!rol) return;            // no tenemos rol aún
    // aquí ya tenemos user/rol y, si es experto, también tendremos aprobado
    navigate(pathByRole(rol, aprobado), { replace: true });
  }, [user, rol, aprobado, loading, navigate]);

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
