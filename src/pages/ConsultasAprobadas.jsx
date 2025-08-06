// src/pages/ConsultasAprobadas.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import UnifiedNavbar from "../components/UnifiedNavbar";


export default function ConsultasAprobadas() {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const q = query(
          collection(db, "consultasModeradas"),
          where("aprobada", "==", true),
          where("expertoId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConsultas(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4">Cargando...</div>;

  return (
    <>
      <UnifiedNavbar />

      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Consultas Aprobadas</h1>

        {consultas.length === 0 ? (
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
                <strong>Respuesta:</strong> {consulta.respuesta || "Sin respuesta"}
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
