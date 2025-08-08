// src/pages/MisConsultas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import UnifiedNavbar from "../components/UnifiedNavbar";
import toast from "react-hot-toast";

// Helpers UI
const estadoBadge = (estado) => {
  const map = {
    resueltaGratis: "bg-green-100 text-green-800 border-green-200",
    pagado: "bg-green-100 text-green-800 border-green-200",
    respondida: "bg-green-100 text-green-800 border-green-200",
    requierePago: "bg-yellow-100 text-yellow-800 border-yellow-200",
    aprobadoParaExperto: "bg-blue-100 text-blue-800 border-blue-200",
    pendiente: "bg-gray-100 text-gray-700 border-gray-200",
    porValidar: "bg-gray-100 text-gray-700 border-gray-200",
    rechazada: "bg-red-100 text-red-800 border-red-200",
  };
  const cls = map[estado] || map.pendiente;
  const label =
    estado === "resueltaGratis" || estado === "pagado" || estado === "respondida"
      ? "respondida"
      : estado;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("") || "EX";

const Avatar = ({ url, name }) => (
  url ? (
    <img
      src={url}
      alt={name || "Experto"}
      className="w-7 h-7 rounded-full object-cover border border-gray-200"
    />
  ) : (
    <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 text-xs grid place-items-center border border-gray-300">
      {getInitials(name)}
    </div>
  )
);

// Limita la respuesta para el preview
const preview = (txt = "", n = 140) =>
  txt.length > n ? txt.slice(0, n).trim() + "…" : txt;

export default function MisConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [collapsed, setCollapsed] = useState({}); // { [id]: true|false }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUsuario(null);
        setConsultas([]);
        setCargando(false);
        return;
      }
      setUsuario(user);
      try {
        const col = collection(db, "consultasModeradas");

        let items = [];
        // Intento por usuarioId
        try {
          const qUid = query(col, where("usuarioId", "==", user.uid));
          const snapUid = await getDocs(qUid);
          items = snapUid.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {}

        // Fallback por correo
        if (!items.length) {
          const qMail = query(col, where("correo", "==", user.email));
          const snapMail = await getDocs(qMail);
          items = snapMail.docs.map((d) => ({ id: d.id, ...d.data() }));
        }

        const normalizados = items.map((x) => ({
          id: x.id,
          estado: x.estado || "pendiente",
          titulo: x.titulo || x.asunto || "Consulta",
          contenido: x.contenido || x.consulta || "",
          respuesta: x.respuesta || "",
          precio: x.precio,
          expertoNombre: x.expertoNombre,
          expertoAvatar: x.expertoAvatar || x.fotoPerfilURL, // por si lo guardas así
          fechaRespuesta: x.fechaRespuesta?.toMillis ? x.fechaRespuesta.toMillis() : x.fechaRespuesta,
        }));

        normalizados.sort((a, b) => (b.fechaRespuesta || 0) - (a.fechaRespuesta || 0));
        setConsultas(normalizados);

        // Por defecto: colapsadas
        const initial = {};
        normalizados.forEach((c) => (initial[c.id] = true));
        setCollapsed(initial);
      } catch (e) {
        console.error(e);
        toast.error("Error al cargar tus consultas");
      } finally {
        setCargando(false);
      }
    });
    return () => unsub();
  }, []);

  const manejarPago = async (consultaId) => {
    if (!usuario?.email) {
      toast.error("No se encontró tu correo electrónico.");
      return;
    }
    try {
      const res = await fetch("/api/crearPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultaId, email: usuario.email }),
      });
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else toast.error("No se pudo generar el enlace de pago.");
    } catch (err) {
      console.error("Error al generar el pago:", err);
      toast.error("Error al procesar el pago.");
    }
  };

  const toggle = (id) => setCollapsed((m) => ({ ...m, [id]: !m[id] }));

  return (
    <>
      <UnifiedNavbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-extrabold italic flex items-center gap-2 mb-6">
          <span>📬</span> Mis Consultas
        </h1>

        {cargando ? (
          <p className="text-gray-600">Cargando...</p>
        ) : consultas.length === 0 ? (
          <div className="bg-white/70 border border-yellow-200 rounded-2xl p-6 shadow-sm">
            <p className="text-gray-700">No has enviado ninguna consulta aún.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {consultas.map((c) => {
              const estado = c.estado || "pendiente";
              const respondida =
                ["resueltaGratis", "pagado", "respondida"].includes(estado) ||
                (!!c.respuesta && estado !== "requierePago");
              const requierePago = estado === "requierePago";
              const isCollapsed = collapsed[c.id];

              return (
                <article
                  key={c.id}
                  className="bg-white border border-yellow-200 shadow-md rounded-2xl overflow-hidden"
                >
                  <div className="p-5 md:p-6">
                    {/* Header: título + estado + botón expandir/contraer */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-rose-500 text-lg">📌</span>
                          <h2 className="font-semibold">Consulta:</h2>
                        </div>
                        <p className="text-gray-900 font-medium leading-relaxed">
                          {c.titulo}
                        </p>
                        {c.contenido && (
                          <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                            {isCollapsed ? preview(c.contenido, 160) : c.contenido}
                          </p>
                        )}

                        <p className="text-sm text-gray-700 mt-3">
                          <span className="font-semibold">Estado:</span>{" "}
                          {estadoBadge(estado)}
                        </p>
                      </div>

                      <button
                        onClick={() => toggle(c.id)}
                        className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
                        aria-expanded={!isCollapsed}
                        aria-controls={`consulta-${c.id}`}
                        title={isCollapsed ? "Ver respuesta" : "Contraer"}
                      >
                        {isCollapsed ? "Ver respuesta" : "Contraer"}
                      </button>
                    </div>

                    {/* Body colapsable */}
                    <div
                      id={`consulta-${c.id}`}
                      className={`transition-all duration-200 ease-in-out overflow-hidden ${
                        isCollapsed ? "max-h-0 mt-0" : "max-h-[3000px] mt-4"
                      }`}
                    >
                      {/* Respuesta completa (si hay y no requiere pago) */}
                      {respondida && c.respuesta && (
                        <div className="mt-2">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-green-600 text-lg">✅</span>
                            <h3 className="font-semibold">Respuesta:</h3>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800">
                            <pre className="whitespace-pre-wrap font-sans text-sm leading-6">
                              {c.respuesta}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Pago si aplica */}
                      {requierePago && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-sm text-yellow-900 mb-3">
                            Esta consulta requiere un pago de{" "}
                            <strong>${c.precio ?? "—"}</strong> para ver la respuesta.
                          </p>
                          <button
                            onClick={() => manejarPago(c.id)}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                          >
                            Pagar ahora
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer fijo visible en ambos estados */}
                    <div className="mt-4 flex items-center justify-between">
                      {/* “Respuesta: …” mini (solo cuando está colapsado) */}
                      <div className="text-sm text-gray-700">
                        <span className="font-semibold">Respuesta:</span>{" "}
                        {respondida && c.respuesta
                          ? preview(c.respuesta, 120)
                          : requierePago
                          ? "Requiere pago para ver."
                          : "Sin respuesta"}
                      </div>

                      {/* Experto (abajo derecha) */}
                      {(c.expertoNombre || c.expertoAvatar) && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="sr-only">Experto</span>
                          <Avatar url={c.expertoAvatar} name={c.expertoNombre} />
                          <span className="font-medium">{c.expertoNombre}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
