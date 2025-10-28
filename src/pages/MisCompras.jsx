// src/pages/MisCompras.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import UnifiedNavbar from "../components/UnifiedNavbar";

export default function MisCompras() {
  const [compras, setCompras] = useState([]);
  const { user, loading } = useAuth();

  // Cargar compras del usuario autenticado
  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        // Ajusta el nombre de colección si usas otro
        const q = query(
          collection(db, "comprasContenido"),
          where("userId", "==", user.uid),
          orderBy("fecha", "desc")
        );
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setCompras(rows);
      } catch (e) {
        console.error("Error cargando compras:", e);
      }
    })();
  }, [loading, user]);

  const fmtFecha = (f) => {
    if (!f) return "";
    const d = f?.toDate ? f.toDate() : (f?.seconds ? new Date(f.seconds * 1000) : new Date(f));
    return isNaN(d) ? "" : d.toLocaleString("es-MX");
  };

  const fmtMonto = (m) =>
    typeof m === "number"
      ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(m)
      : (m || "");

  if (loading) {
    return (
      <>
        <UnifiedNavbar title="Mis Compras" />
        <main className="max-w-3xl mx-auto px-4 py-8">Cargando…</main>
      </>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <UnifiedNavbar title="Mis Compras" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Mis Compras</h1>

        {compras.length === 0 ? (
          <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
            Aún no tienes compras registradas.
          </div>
        ) : (
          <ul className="space-y-3">
            {compras.map((c) => (
              <li
                key={c.id}
                className="border rounded-md p-4 bg-white flex items-start justify-between"
              >
                <div>
                  <div className="font-medium">{c.titulo || "Servicio/Curso"}</div>
                  <div className="text-sm text-gray-600">
                    {c.descripcion || "Sin descripción"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{fmtFecha(c.fecha)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{fmtMonto(c.monto)}</div>
                  <div className="text-xs text-gray-500">{c.estado || "pagado"}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
