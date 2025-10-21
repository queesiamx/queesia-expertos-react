// src/components/RutaUsuarioPrivada.jsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { Navigate } from "react-router-dom";

export default function RutaUsuarioPrivada({ children }) {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuario) => {
      setUsuarioAutenticado(usuario);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  if (cargando) {
    return <div className="p-6">Verificando acceso...</div>;
  }

  return usuarioAutenticado ? children : <Navigate to="/login" replace />;
}
