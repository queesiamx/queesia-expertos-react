// src/pages/ConsultasRecibidas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import toast from "react-hot-toast";
import ExpertShell from "@/components/expert/ExpertShell";
import ExpertStatCard from "@/components/expert/ExpertStatCard";
import {
  Inbox,
  Clock,
  CheckCircle2,
  WalletCards,
  Search,
  MoreVertical,
} from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";

export default function ConsultasRecibidas() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [consultaModalVisible, setConsultaModalVisible] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recientes");

  const navigate = useNavigate();
  const { user, loading, rol } = useAuth();

  // Cargar consultas del experto autenticado
  useEffect(() => {
    if (loading || !user) return; // espera auth
    let cancel = false;

    (async () => {
      try {
        setCargando(true);

        // Ajusta los estados a tu modelo real
        const q = query(
          collection(db, "consultasModeradas"),
          where("expertoId", "==", user.uid) // o "expertoUID" si así lo guardas
        );

        const snap = await getDocs(q);
        if (cancel) return;

        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // El experto solo debe ver lo que admin ya aprobó/asignó para su atención
        const visiblesParaExperto = rows.filter((c) =>
          ["aprobadoParaExperto", "resueltaGratis", "requierePago", "respondida", "porValidar"].includes(c.estado)
        );
        setConsultas(visiblesParaExperto);
      } catch (e) {
        console.error("Error al cargar consultas:", e);
        toast.error("No se pudieron cargar las consultas.");
      } finally {
        if (!cancel) setCargando(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [loading, user]);

  const estados = [
  { label: "Todas", valor: "todas" },
  { label: "Pendientes", valor: "aprobadoParaExperto" },
  { label: "Gratis", valor: "resueltaGratis" },
  { label: "Pagadas", valor: "requierePago" },
];

  const getTextoConsulta = (c) =>
  c.consulta ||
  c.pregunta ||
  c.mensaje ||
  c.texto ||
  c.descripcion ||
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
  "";

const getFechaConsulta = (c) => {
  const raw = c.fecha || c.createdAt || c.fechaEnvio || c.timestamp;

  if (!raw) return "";

  const date = raw?.toDate ? raw.toDate() : new Date(raw);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

  const consultasFiltradas = consultas
  .filter((c) => {
    if (filtroEstado === "todas") return true;

    if (filtroEstado === "aprobadoParaExperto") {
      return c.estado === "aprobadoParaExperto" || c.estado === "porValidar";
    }

    if (filtroEstado === "resueltaGratis") {
      return c.estado === "resueltaGratis";
    }

    if (filtroEstado === "requierePago") {
      return c.estado === "requierePago";
    }

    return c.estado === filtroEstado;
  })
  .filter((c) => {
    const texto = `${getTextoConsulta(c)} ${getNombreUsuario(c)} ${getCorreoUsuario(c)}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  })
  .sort((a, b) => {
    const fechaA = a.fecha?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
    const fechaB = b.fecha?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);

    if (orden === "antiguas") return fechaA - fechaB;
    return fechaB - fechaA;
  });

  const handleSolicitudCambioTipo = async (consultaId, nuevoTipo) => {
    const justificacion = prompt("¿Por qué consideras que debe cambiar el tipo de consulta?");
    if (!justificacion) return;

    try {
      const consultaRef = doc(db, "consultasModeradas", consultaId);
      await updateDoc(consultaRef, {
        solicitudCambio: {
          nuevoTipo,
          justificacion,
          estado: "pendiente",
          fecha: new Date(),
        },
      });
      toast.success("Solicitud enviada correctamente.");
    } catch (error) {
      console.error("Error al solicitar cambio de tipo:", error);
      toast.error("Ocurrió un error al enviar la solicitud.");
    }
  };

  // Guards
  if (loading) return <div className="p-6">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;

  const totalConsultas = consultas.length;

const totalPendientes = consultas.filter(
  (c) => c.estado === "aprobadoParaExperto" || c.estado === "porValidar"
).length;

const totalRespondidas = consultas.filter(
  (c) => c.estado === "respondida" || !!c.respuesta
).length;

const totalRequierenPago = consultas.filter(
  (c) => c.estado === "requierePago" || c.estado === "respondida"
).length;

const consultasRespondidasCount = consultas.filter(
  (c) => c.estado === "respondida" || c.estado === "resueltaGratis" || !!c.respuesta
).length;

const getEstadoBadge = (estado) => {
  if (estado === "pendiente") {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  if (estado === "requierePago") {
    return "bg-orange-50 text-orange-700 border-orange-100";
  }

  if (estado === "respondida") {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }

  if (estado === "resueltaGratis") {
    return "bg-blue-50 text-blue-700 border-blue-100";
  }

  return "bg-slate-50 text-slate-600 border-slate-100";
};

  return (
  <ExpertShell
    title="Consultas Recibidas"
    subtitle="Gestiona las consultas que te han enviado. Responde y da seguimiento desde tu panel."
    sidebarProps={{
      consultasRecibidasCount: totalConsultas,
      consultasRespondidasCount,
    }}
  >
    {consultaModalVisible && consultaSeleccionada && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Detalles de la consulta
          </h2>

          <p className="text-sm text-slate-700">
            <strong>Consulta:</strong> {getTextoConsulta(consultaSeleccionada)}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            <strong>De:</strong> {getNombreUsuario(consultaSeleccionada)} (
            {getCorreoUsuario(consultaSeleccionada)}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            <strong>Estado:</strong> {consultaSeleccionada.estado}
          </p>

          <button
            onClick={() => setConsultaModalVisible(false)}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    )}

    <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <ExpertStatCard
        icon={Inbox}
        value={totalConsultas}
        label="Total recibidas"
        helper="Todas las consultas"
        tone="blue"
      />

      <ExpertStatCard
        icon={Clock}
        value={totalPendientes}
        label="Pendientes"
        helper="Esperando respuesta"
        tone="amber"
      />

      <ExpertStatCard
        icon={CheckCircle2}
        value={totalRespondidas}
        label="Respondidas"
        helper="Con seguimiento"
        tone="green"
      />

      <ExpertStatCard
        icon={WalletCards}
        value={totalRequierenPago}
        label="Requieren pago"
        helper="Pendientes de pago"
        tone="purple"
      />
    </section>

    <section className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {estados.map(({ label, valor }) => (
          <button
            key={valor}
            onClick={() => setFiltroEstado(valor)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filtroEstado === valor
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative w-full lg:max-w-sm">
        <Search
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar consulta, nombre o email..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-500 shadow-sm outline-none"
        />
      </div>
    </section>

    {cargando ? (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Cargando consultas...
      </div>
    ) : consultasFiltradas.length === 0 ? (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        No hay consultas en esta categoría.
      </div>
    ) : (
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {consultasFiltradas.map((c, index) => (
          <article
            key={c.id}
            className={`grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_110px_130px_44px] lg:items-center ${
              index !== consultasFiltradas.length - 1
                ? "border-b border-slate-100"
                : ""
            }`}
          >
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">{getTextoConsulta(c)}</p>

              <p className="mt-1 text-sm text-slate-600">
                De: {getNombreUsuario(c)}{" "}
                {getCorreoUsuario(c) ? (
                  <span className="text-slate-500">({getCorreoUsuario(c)})</span>
                ) : null}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getEstadoBadge(
                    c.estado
                  )}`}
                >
                  {c.estado}
                </span>

                {filtroEstado === "pendiente" && (
                  <button
                    onClick={() => {
                      setConsultaSeleccionada(c);
                      setConsultaModalVisible(true);
                    }}
                    className="text-xs font-semibold text-blue-700 hover:underline"
                  >
                    Ver detalles
                  </button>
                )}
              </div>

              {filtroEstado === "pendiente" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.estado === "resueltaGratis" && !c.respuesta && (
                    <button
                      className="rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                      onClick={() =>
                        handleSolicitudCambioTipo(c.id, "respondida")
                      }
                    >
                      Solicitar cambio a consulta de pago
                    </button>
                  )}

                  {c.estado === "respondida" && !c.respuesta && (
                    <button
                      className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-200"
                      onClick={() =>
                        handleSolicitudCambioTipo(c.id, "resueltaGratis")
                      }
                    >
                      Solicitar cambio a consulta gratuita
                    </button>
                  )}
                </div>

                
              )}
            </div>

            {getFechaConsulta(c) && (
              <span className="text-xs text-slate-400">
                {getFechaConsulta(c)}
              </span>
            )}

            <button
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              onClick={() => navigate(`/responder-consulta/${c.id}`)}
            >
              {c.respuesta ? "Ver respuesta" : "Responder"}
            </button>

            <button
              type="button"
              onClick={() => {
                setConsultaSeleccionada(c);
                setConsultaModalVisible(true);
              }}
              className="grid h-10 w-10 shrink-0 place-items-center justify-self-end rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Ver detalles"
            >
              <MoreVertical size={18} />
            </button>
          </article>
        ))}
      </div>
    )}
  </ExpertShell>
);
}
