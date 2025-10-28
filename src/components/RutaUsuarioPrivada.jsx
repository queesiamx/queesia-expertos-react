// src/components/RutaUsuarioPrivada.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";

export default function RutaUsuarioPrivada({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="p-6 text-center">Verificando acceso…</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}
