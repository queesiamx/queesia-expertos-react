// src/components/RutaExpertoPrivada.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function RutaExpertoPrivada({ children, usuario }) {
  const [verificando, setVerificando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    const verificar = async () => {
      if (usuario?.uid) {
        const docRef = doc(db, "experts", usuario.uid);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().aprobado === true) {
          setAutorizado(true);
        }
      }
      setVerificando(false);
    };

    verificar();
  }, [usuario]);

  if (!usuario) return <Navigate to="/login" replace />;
  if (verificando) return <p className="text-center py-10">Verificando acceso...</p>;
  if (!autorizado) return <Navigate to="/dashboard" replace />;

  return children;
}
