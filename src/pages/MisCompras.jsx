import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // ⚠️ ajusta la ruta si tu archivo es otro
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import UnifiedNavbar from "../components/UnifiedNavbar";

export default function MisCompras() {
  const [user, setUser] = useState(null);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setCompras([]);
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "compras"),
          where("userId", "==", u.uid),
          orderBy("fecha", "desc")
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setCompras(items);
      } catch (e) {
        console.error("Error cargando compras:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  return (
    <>
      <UnifiedNavbar title="Mis Compras" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Mis Compras</h1>

        {loading && <p>Cargando...</p>}

        {!loading && !user && (
          <p className="text-gray-600">Inicia sesión para ver tus compras.</p>
        )}

        {!loading && user && compras.length === 0 && (
          <div className="p-4 border rounded-md bg-yellow-50 text-yellow-800">
            Aún no tienes compras registradas.
          </div>
        )}

        {!loading && user && compras.length > 0 && (
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
                  <div className="text-xs text-gray-500 mt-1">
                    {c.fecha?.toDate
                      ? c.fecha.toDate().toLocaleString()
                      : c.fecha || ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {typeof c.monto === "number" ? `$${c.monto}` : (c.monto || "")}
                  </div>
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
