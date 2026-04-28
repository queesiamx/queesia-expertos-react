// src/pages/ConsultasRecibidas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { useNavigate, Navigate } from "react-router-dom";

export default function ConsultasRecibidas() {
  const [consultas, setConsultas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);
  const [consultaModalVisible, setConsultaModalVisible] = useState(false);

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
    { label: "Pendientes", valor: "pendiente" },
    { label: "Gratis", valor: "resueltaGratis" },
    { label: "Pagadas", valor: "respondida" }, // ajusta si usas otro estado
  ];

  const consultasFiltradas = consultas.filter((c) => {
    if (filtroEstado === "todas") return true;
    if (filtroEstado === "pendiente") {
      // “pendiente” o marcadas como gratis pero aún sin respuesta
      return (
        c.estado === "pendiente" ||
        c.estado === "porRevisar" ||
        c.estado === "aprobadoParaExperto" ||
        (c.estado === "resueltaGratis" && !c.respuesta)
      );
    }
    if (filtroEstado === "resueltaGratis") {
      return c.estado === "resueltaGratis" && !!c.respuesta;
    }
    if (filtroEstado === "respondida") {
      return c.estado === "respondida";
    }
    return false;
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

  return (
    <>
      <UnifiedNavbar />

      {consultaModalVisible && consultaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Detalles de la consulta</h2>
            <p>
              <strong>Consulta:</strong> {consultaSeleccionada.consulta || consultaSeleccionada.pregunta}
            </p>
            <p>
              <strong>De:</strong> {consultaSeleccionada.nombre || consultaSeleccionada.userNombre} ({consultaSeleccionada.correo || consultaSeleccionada.userEmail})
            </p>
            <p>
              <strong>Estado:</strong> {consultaSeleccionada.estado}
            </p>
            <button
              onClick={() => setConsultaModalVisible(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <div className="p-6 max-w-4xl mx-auto font-sans">
        <h1 className="text-3xl font-bold mb-6">Consultas Recibidas</h1>

        {/* Botones de filtro */}
        <div className="flex gap-2 flex-wrap mb-6">
          {estados.map(({ label, valor }) => (
            <button
              key={valor}
              onClick={() => setFiltroEstado(valor)}
              className={`px-4 py-2 rounded-full border transition-colors duration-200 ${
                filtroEstado === valor
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-blue-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className="text-gray-600">Cargando consultas...</p>
        ) : consultasFiltradas.length === 0 ? (
          <p className="text-gray-600">No hay consultas en esta categoría.</p>
        ) : (
          <div className="space-y-4">
            {consultasFiltradas.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-xl shadow border">
                {filtroEstado === "pendiente" && (
                  <div className="flex flex-col gap-2 mb-2">
                    <span className="text-sm text-gray-600">
                      Esta es una consulta enviada por un usuario. Si ya fue pagada o es gratuita depende del
                      acuerdo.
                    </span>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setConsultaSeleccionada(c);
                          setConsultaModalVisible(true);
                        }}
                        className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-800">
                  <strong>Consulta:</strong> {c.consulta || c.pregunta}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>De:</strong> {c.nombre || c.userNombre} ({c.correo || c.userEmail})
                </p>
                <p className="text-sm mt-1">
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      c.estado === "pendiente"
                        ? "text-yellow-600"
                        : c.estado === "resueltaGratis"
                        ? "text-blue-600"
                        : c.estado === "respondida"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {c.estado}
                  </span>
                </p>

                <button
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/responder-consulta/${c.id}`)}
                >
                  Responder
                </button>

                {filtroEstado === "pendiente" && (
                  <>
                    {c.estado === "resueltaGratis" && !c.respuesta && (
                      <button
                        className="mt-2 bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                        onClick={() => handleSolicitudCambioTipo(c.id, "respondida")}
                      >
                        Solicitar cambio a "Consulta de Pago"
                      </button>
                    )}
                    {c.estado === "respondida" && !c.respuesta && (
                      <button
                        className="mt-2 bg-green-400 text-black px-3 py-1 rounded hover:bg-green-500"
                        onClick={() => handleSolicitudCambioTipo(c.id, "resueltaGratis")}
                      >
                        Solicitar cambio a "Consulta Gratuita"
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
