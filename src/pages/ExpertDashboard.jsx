// src/pages/ExpertDashboard.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  arrayUnion
} from "firebase/firestore";
import toast from "react-hot-toast";
import React, { useEffect, useRef, useState } from "react";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertProfileCard from "../components/ExpertProfileCard";
import ExpertProfileEditor from "../components/ExpertProfileEditor";
import UploadContenido from "../components/UploadContenido";
import Modal from "../components/Modal";
import ConsultaModal from "../components/ConsultaModal";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();               // <-- para leer #servicios
  const serviciosRef = useRef(null);            // <-- referencia al bloque
  const [expert, setExpert] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [modalFechaVisible, setModalFechaVisible] = useState(false);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [consultaModalVisible, setConsultaModalVisible] = useState(false);
  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null);

  const cargarContenidos = async () => {
    if (!expert?.id) return;
    const q = query(
      collection(db, "contenidosExpertos"),
      where("expertoId", "==", expert.id)
    );
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setContenidos(docs);
  };

  const handleDeleteContenido = async (contenidoId, publicId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este contenido? Esta acción no se puede deshacer.")) return;

    try {
      console.log("🧾 Eliminando contenido:", contenidoId, "🔗 publicId:", publicId);

      if (publicId && typeof publicId === "string") {
        const res = await fetch("/api/delete-cloudinary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_id: publicId }),
        });

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("❌ Respuesta no válida de Cloudinary:", e, text);
          toast.error("Error inesperado del servidor al eliminar archivo.");
          return;
        }

        if (data.error) {
          console.warn("⚠️ Error desde Cloudinary:", data.error);
          toast.error("Error al eliminar archivo en Cloudinary: " + data.error);
          return;
        }
      } else {
        console.warn("⚠️ No hay public_id, se omite eliminación en Cloudinary.");
      }

      await deleteDoc(doc(db, "contenidosExpertos", contenidoId));
      toast.success("Contenido eliminado correctamente.");
      cargarContenidos();
    } catch (error) {
      console.error("❌ Error total en la eliminación:", error);
      toast.error("Ocurrió un error al eliminar el contenido.");
    }
  };

  const handleAgregarFecha = (contenido) => {
    setContenidoSeleccionado(contenido);
    setModalFechaVisible(true);
  };

  const guardarFecha = async () => {
    if (!nuevaFecha || !contenidoSeleccionado) return;
    try {
      const ref = doc(db, "contenidosExpertos", contenidoSeleccionado.id);
      await updateDoc(ref, {
        fechasDisponibles: arrayUnion(nuevaFecha)
      });
      toast.success("Fecha agregada exitosamente");
      setNuevaFecha("");
      setModalFechaVisible(false);
      setContenidoSeleccionado(null);
      cargarContenidos();
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la fecha");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, "experts", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("Debes completar tu registro.");
          navigate("/registro");
          return;
        }

        const data = snap.data();
        if (!data.aprobado || !data.formularioCompleto) {
          toast.error("Acceso denegado. Tu perfil aún no está aprobado.");
          navigate("/registro");
        }

        setExpert({ id: user.uid, ...data });
      } else {
        toast.error("Debes iniciar sesión.");
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (expert?.id) cargarContenidos();
  }, [expert]);

  const handleSave = async (datosActualizados) => {
    try {
      const ref = doc(db, "experts", expert.id);
      await updateDoc(ref, datosActualizados);
      toast.success("Perfil actualizado correctamente.");
      setExpert((prev) => ({ ...prev, ...datosActualizados }));
      setEditMode(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      toast.error("No se pudo guardar el perfil.");
    }
  };
    // Scroll suave cuando la URL trae #servicios
  useEffect(() => {
    if (hash === "#servicios" && serviciosRef.current) {
      const OFFSET = 90; // ajusta si tu navbar ocupa más/menos alto
      const y = serviciosRef.current.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [hash]);

  useEffect(() => {
  if (window.location.hash === "#servicios" && serviciosRef.current) {
    const OFFSET = 90;
    const y = serviciosRef.current.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  // disparar cuando ya hay experto y cambia la lista
}, [expert, contenidos.length]);


  return (
    <>
      <UnifiedNavbar />

       {/* fondo claro como el mock */}
      <div className="min-h-screen bg-[#f7fafc] font-sans">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Cabecera + acciones */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h1 className="text-[22px] md:text-3xl font-extrabold tracking-tight text-slate-900">
              Panel de Experto
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="h-10 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm"
              >
                Cargar contenidos
              </button>
              <button
                onClick={() => setEditMode(true)}
                className="h-10 px-4 rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Editar perfil
              </button>
            </div>
          </div>

          {/* Métricas superiores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500">Servicios publicados</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{contenidos.length}</div>
            </div>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500">Consultas en revisión</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">—</div>
            </div>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500">Ventas del mes</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">—</div>
            </div>
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4 shadow-sm">
              <div className="text-xs text-slate-500">Visitas a tu perfil</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">—</div>
            </div>
          </div>

          {!expert ? (
            <p className="text-gray-600">Cargando información...</p>
          ) : editMode ? (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 md:p-6 shadow-sm mb-6">
              <ExpertProfileEditor
                expert={expert}
                onCancel={() => setEditMode(false)}
                onSave={handleSave}
              />
            </div>
          ) : (
            <>
              {/* Tarjeta de perfil */}
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 md:p-6 shadow-sm mb-6">
                <ExpertProfileCard expert={expert} />
              </div>

            <h2
              id="servicios"
              ref={serviciosRef}
              className="text-xl font-semibold mt-2 mb-4 scroll-mt-24 text-slate-900"
             >
              📚 Servicios
            </h2>

            {contenidos.length === 0 ? (
              <p className="text-gray-600">No has subido contenidos aún.</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {contenidos.map((contenido) => (
                  <div
                    key={contenido.id}
                    className="bg-white ring-1 ring-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition"
                   >
                            {/* Header de la tarjeta: badge por tipo + título + acciones */}
                    <div className="flex items-start md:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={
                            contenido.tipoContenido === "consulta"
                              ? "px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-amber-100 text-amber-700"
                              : contenido.tipoContenido === "curso"
                              ? "px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                              : "px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-violet-100 text-violet-700"
                          }>
                            {contenido.tipoContenido ?? "servicio"}
                          </span>
                          {contenido.precio ? (
                            <span className="px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                              ${Number(contenido.precio).toFixed(2)}
                            </span>
                          ) : (
                            <span className="px-2.5 h-7 inline-flex items-center rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                              gratuito
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-base md:text-lg font-semibold text-slate-900 truncate">
                          {contenido.titulo}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {contenido.descripcion}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {contenido.tipoContenido === "curso" && (
                          <button
                            onClick={() => handleAgregarFecha(contenido)}
                            className="h-9 px-3 rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 text-sm"
                            title="Agregar fecha disponible"
                          >
                            Agregar fecha
                          </button>
                        )}
                        <a
                          href={contenido.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 px-3 items-center justify-center rounded-lg bg-white
                                     text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 text-sm"
                        >
                          Ver archivo
                        </a>
                        <button
                          onClick={() => handleDeleteContenido(contenido.id, contenido.public_id)}
                                    className="inline-flex h-9 px-3 items-center justify-center rounded-lg bg-white
                                     text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 text-sm"

                          title="Eliminar contenido"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Etiqueta especial para consulta */}
  {contenido.tipoContenido === "consulta" && (
    <div className="mt-3 text-[13px] text-amber-800 bg-amber-50/60 border border-amber-200 rounded-md px-3 py-2">
      Sujeto a aplicación de costos
    </div>
  )}

                    {/* Fechas disponibles para curso */}
                    {contenido.fechasDisponibles?.length > 0 && (
                      <div className="mt-3 text-sm text-slate-700">
                        <span className="font-medium">Fechas disponibles: </span>
                        {contenido.fechasDisponibles.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-2xl font-semibold mb-4">📁 Subir nuevo contenido</h2>
        <UploadContenido
          expertoId={expert?.id}
          onCloseModal={() => setShowModal(false)}
          onUploadSuccess={cargarContenidos}
        />
      </Modal>

      <Modal isOpen={modalFechaVisible} onClose={() => setModalFechaVisible(false)}>
        <h2 className="text-xl font-semibold mb-4">📅 Agregar nueva fecha</h2>
        <input
          type="date"
          className="border px-4 py-2 rounded w-full mb-4"
          value={nuevaFecha}
          onChange={(e) => setNuevaFecha(e.target.value)}
        />
        <button
          onClick={guardarFecha}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Guardar fecha
        </button>
      </Modal>

      {consultaModalVisible && consultaSeleccionada && (
        <ConsultaModal
          consulta={consultaSeleccionada}
          onClose={() => setConsultaModalVisible(false)}
        />
      )}
    </>
  );
};

export default ExpertDashboard;
