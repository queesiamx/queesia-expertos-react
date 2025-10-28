// src/components/UserInfo.jsx
import React from "react";
import { useAuth } from "@/auth/context/AuthContext";

// Alias por compatibilidad (si en algún lado importabas useUser)
export function useUser() {
  return useAuth();
}

export default function UserInfo() {
  const { user, loading, rol, aprobado } = useAuth();

  if (loading) return <div className="p-4">Cargando usuario…</div>;
  if (!user)   return <div className="p-4">No has iniciado sesión.</div>;

  return (
    <div className="p-4 text-sm">
      <div><strong>UID:</strong> {user.uid}</div>
      <div><strong>Email:</strong> {user.email}</div>
      <div><strong>Rol:</strong> {rol || "usuario"}</div>
      <div><strong>Aprobado:</strong> {aprobado ? "Sí" : "No"}</div>
    </div>
  );
}
