// src/pages/ExpertHistorialR.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import UnifiedNavbar from "../components/UnifiedNavbar";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

export default function ExpertHistorialR() {
  const [respuestas, setRespuestas] = useState([]);
  const { user, loading } = useAuth();

  // Carga el historial cuando el usuario esté listo
  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        // Respuestas del experto: gratis o de pago (respondida)
        const q = query(
          collection(db, "consultasModeradas"),
          where("expertoId", "==", user.uid),
          where("estado", "in", ["resueltaGratis", "respondida"])
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRespuestas(data);
      } catch (e) {
        console.error(e);
        toast.error("No se pudo cargar tu historial.");
      }
    })();
  }, [loading, user]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    try {
      const d = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
      return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  if (loading) {
    return (
      <>
        <UnifiedNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">Cargando…</div>
      </>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Mi historial de respuestas</h1>

        {respuestas.length === 0 ? (
          <p className="text-center">Aún no has respondido ninguna consulta.</p>
        ) : (
          <div className="space-y-4">
            {respuestas.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-lg shadow border">
                <p className="text-sm">
                  <strong>Consulta:</strong> {c.consulta}
                </p>
                <p className="text-sm">
                  <strong>Usuario:</strong> {c.nombre || "Sin nombre"} ({c.correo || "Sin correo"})
                </p>
                <p className="text-sm">
                  <strong>Fecha de respuesta:</strong> {formatearFecha(c.fechaRespuesta)}
                </p>
                <p className="text-sm mb-2">
                  <strong>Estado:</strong>{" "}
                  <span className="italic text-blue-700">{c.estado}</span>
                </p>
                <div className="bg-green-50 border-l-4 border-green-400 p-3 mt-2 rounded">
                  <strong>Tu respuesta:</strong>
                  <p>{c.respuesta || "Sin respuesta registrada"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
