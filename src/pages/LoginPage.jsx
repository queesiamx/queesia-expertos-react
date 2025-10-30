// src/pages/LoginPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from "@/auth/login";
import { useAuth } from "@/auth/context/AuthContext";
import { pathByRole } from "@/auth/pathByRole";
import { auth } from "@/firebase";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, rol, aprobado, loading, redirecting } = useAuth();

// DEBUG-BANNER-START (temporal, no altera el flujo de navegación)
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const debugInfo = {
  loading,
  hasUser: Boolean(user),
  uid: auth?.currentUser?.uid || null,
  rol: rol || null,
  aprobado: Boolean(aprobado),
  isMobile,
};


   useEffect(() => {
    // Cuando ya hay sesión+rol, primero ve al Home.
    // Desde ahí, tu RoleGuard/efectos globales redirigen al panel correspondiente.
    if (!loading && user && rol) {
      navigate("/", { replace: true });
    }
  }, [user, rol, aprobado, loading, navigate]);


    return (
    <>
      {/* Overlay global mientras hay redirect/rehidratación */}
      <LoadingOverlay show={redirecting || (loading && !user)} text="Iniciando sesión…" />


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
    </>
  );
 }

