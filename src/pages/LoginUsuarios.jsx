import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { startLogin } from "@/auth/startLogin";
import { normalizeRole } from "@/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";


export default function LoginUsuarios() {
  const [cargando, setCargando] = useState(false);
  const [params] = useSearchParams();
  const { user } = useAuth();

  // Rol por query (?role=admin|experto|usuario) → default USUARIO
  const roleFromQuery = useMemo(() => {
    const r = (params.get("role") || "USUARIO").toUpperCase();
    return normalizeRole(r);
  }, [params]);

  const iniciarSesion = async () => {
    try {
      setCargando(true);
      await startLogin(roleFromQuery);
      // La navegación posterior la gestiona AuthRedirectGate
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <UnifiedNavbar />
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Iniciar sesión como usuario
          </h2>
          {!user ? (
            <button
              onClick={iniciarSesion}
              disabled={cargando}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              {cargando ? "Conectando..." : "Continuar con Google"}
            </button>
          ) : (
            <p className="text-sm text-gray-600 mt-4">Ya has iniciado sesión. Redirigiendo…</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
