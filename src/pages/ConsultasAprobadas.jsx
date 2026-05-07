// src/pages/ConsultasAprobadas.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate } from "react-router-dom";
import ExpertShell from "@/components/expert/ExpertShell";

export default function ConsultasAprobadas() {
  const { user, loading } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    let cancel = false;

    (async () => {
      try {
        setCargando(true);

        const estadosOK = [
          "resueltaGratis",
          "conCobro",
          "requierePago",
          "aprobada",
        ];

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

  const getTextoConsulta = (c) =>
    c.consulta ||
    c.pregunta ||
    c.mensaje ||
    c.texto ||
    "Consulta sin texto registrado";

  const getNombreUsuario = (c) =>
    c.nombre ||
    c.usuarioNombre ||
    c.nombreUsuario ||
    c.remitente ||
    "Usuario sin nombre";

  const getCorreoUsuario = (c) =>
    c.correo || c.email || c.usuarioEmail || c.correoUsuario || "Sin correo";

  if (loading) {
    return (
      <ExpertShell title="Mensajes" subtitle="Cargando información del experto.">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando…
        </div>
      </ExpertShell>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpertShell
      title="Mensajes"
      subtitle="Consulta las respuestas aprobadas y mensajes asociados a tus consultas."
    >
      {cargando ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Cargando consultas…
        </div>
      ) : consultas.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No tienes consultas aprobadas.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {consultas.map((consulta, index) => (
            <article
              key={consulta.id}
              className={`p-5 ${
                index !== consultas.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {getTextoConsulta(consulta)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Usuario: {getNombreUsuario(consulta)}{" "}
                    <span className="text-slate-500">
                      ({getCorreoUsuario(consulta)})
                    </span>
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {consulta.estado || "Sin estado"}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Respuesta:
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {consulta.respuesta || "Sin respuesta"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ExpertShell>
  );
}