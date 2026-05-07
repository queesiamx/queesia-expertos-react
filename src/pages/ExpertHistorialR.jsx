// src/pages/ExpertHistorialR.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import ExpertShell from "@/components/expert/ExpertShell";
import { CheckCircle2 } from "lucide-react";

export default function ExpertHistorialR() {
  const [respuestas, setRespuestas] = useState([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    (async () => {
      try {
        const q = query(
          collection(db, "consultasModeradas"),
          where("expertoId", "==", user.uid),
          where("estado", "in", ["resueltaGratis", "respondida"])
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
      const d = fecha?.seconds
        ? new Date(fecha.seconds * 1000)
        : fecha?.toDate
        ? fecha.toDate()
        : new Date(fecha);

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
    c.correo ||
    c.email ||
    c.usuarioEmail ||
    c.correoUsuario ||
    "Sin correo";

  if (loading) {
    return <div className="p-6">Cargando…</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <ExpertShell
      title="Consultas Respondidas"
      subtitle="Consulta el historial de respuestas que has enviado a los usuarios."
      sidebarProps={{
        consultasRespondidasCount: respuestas.length,
      }}
    >
      {respuestas.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Aún no has respondido ninguna consulta.
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {respuestas.map((c, index) => (
            <article
              key={c.id}
              className={`p-5 ${
                index !== respuestas.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {getTextoConsulta(c)}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    De: {getNombreUsuario(c)}{" "}
                    <span className="text-slate-500">
                      ({getCorreoUsuario(c)})
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  {c.estado}
                </div>
              </div>

              <p className="mb-3 text-xs text-slate-400">
                Fecha de respuesta: {formatearFecha(c.fechaRespuesta)}
              </p>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-sm font-semibold text-emerald-900">
                  Tu respuesta:
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {c.respuesta || "Sin respuesta registrada"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </ExpertShell>
  );
}