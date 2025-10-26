//src\components\RedirectByRole.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { pathByRole } from "@/auth/pathByRole";

export default function RedirectByRole() {
  const { user, rol, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
   if (loading) return;
    if (!user) return;           // aún sin login
    if (!rol) return;            // aún sin rol válido; quédate donde estés
    navigate(pathByRole(user, rol), { replace: true });
  }, [user, rol, loading, navigate]);

  if (loading) return <p className="text-center p-6">Redirigiendo...</p>;

  return null; // No renderiza nada, solo redirige
}
