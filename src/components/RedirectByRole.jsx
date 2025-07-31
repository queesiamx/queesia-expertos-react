import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RedirectByRole() {
  const { user, rol, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && rol) {
      if (rol === "admin") navigate("/admin-expertos");
      else if (rol === "experto") navigate("/dashboard-expertos");
      else if (rol === "usuario") navigate("/mis-consultas");
      else navigate("/");
    }
  }, [user, rol, loading, navigate]);

  if (loading) return <p className="text-center p-6">Redirigiendo...</p>;

  return null; // No renderiza nada, solo redirige
}
