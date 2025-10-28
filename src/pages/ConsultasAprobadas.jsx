// src/pages/ConsultasAprobadas.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { Navigate } from "react-router-dom";

export default function ConsultasAprobadas() {
  const { user, loading, rol } = useAuth();        // <- loading de AuthContext
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);  // <- nombre distinto

  // Cargar consultas aprobadas / resueltas del experto logueado
  useEffect(() => {
    if (loading || !user) return; // espera auth
    let cancel = false;

    (async () => {
      try {
        setCargando(true);
        // Ajusta los estados según tu modelo. Ejemplos usados en tu proyecto:
        // "resueltaGratis", "conCobro", "requierePago", "aprobada"
        const estadosOK = ["resueltaGratis", "conCobro", "requierePago", "aprobada"];

        const q = query(
          collection(db, "consultasModeradas"),
          where("expertoId", "==", user.uid),
          where("estado", "in", estadosOK)
        );

        const snap = await getDocs(q);
        if (cancel) return;

        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setConsultas(rows);
      } catch (e) {
        console.error("Error cargando consultas aprobadas:", e);
      } finally {
        if (!cancel) setCargando(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [loading, user]);

  // Guards
  if (loading) return <div className="p-6">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Consultas Aprobadas</h1>

        {cargando ? (
          <p>Cargando consultas…</p>
        ) : consultas.length === 0 ? (
          <p>No tienes consultas aprobadas.</p>
        ) : (
          consultas.map((consulta) => (
            <div
              key={consulta.id}
              className="bg-white rounded-lg shadow p-4 mb-4 border"
            >
              <p className="font-semibold text-gray-700 mb-2">
                <strong>Consulta:</strong> {consulta.consulta}
              </p>
              <p className="text-gray-800 mb-2">
                <strong>Respuesta:</strong>{" "}
                {consulta.respuesta || "Sin respuesta"}
              </p>
              <p className="text-sm text-gray-500">
                Usuario: {consulta.nombre} | Email: {consulta.correo}
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
