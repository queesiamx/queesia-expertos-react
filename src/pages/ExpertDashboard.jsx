// src/pages/ExpertDashboard.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import {
  doc, getDoc, updateDoc,
  collection, query, where, getDocs, deleteDoc, arrayUnion
} from "firebase/firestore";
import toast from "react-hot-toast";
import ExpertShell from "@/components/expert/ExpertShell";
import ExpertServicesSection from "@/components/expert/ExpertServicesSection";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertProfileCard from "../components/ExpertProfileCard";
import ExpertProfileEditor from "../components/ExpertProfileEditor";
import UploadContenido from "../components/UploadContenido";
import Modal from "../components/Modal";
import ConsultaModal from "../components/ConsultaModal";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const serviciosRef = useRef(null);

  // ✅ Usa el estado global de autenticación
  const { user, loading } = useAuth();

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
    setContenidos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleDeleteContenido = async (contenidoId, publicId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este contenido?")) return;
    try {
      if (publicId && typeof publicId === "string") {
        const res = await fetch("/api/delete-cloudinary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ public_id: publicId }),
        });
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = {}; }
        if (data.error) { toast.error("Cloudinary: " + data.error); return; }
      }
      await deleteDoc(doc(db, "contenidosExpertos", contenidoId));
      toast.success("Contenido eliminado.");
      cargarContenidos();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo eliminar.");
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
      await updateDoc(ref, { fechasDisponibles: arrayUnion(nuevaFecha) });
      toast.success("Fecha agregada.");
      setNuevaFecha("");
      setModalFechaVisible(false);
      setContenidoSeleccionado(null);
      cargarContenidos();
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar la fecha");
    }
  };

  // ✅ Cargar perfil del experto cuando `user` esté listo
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("Debes iniciar sesión.");
      navigate("/");
      return;
    }

    let cancel = false;
    (async () => {
      try {
        const ref = doc(db, "experts", user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("Completa tu registro de experto.");
          navigate("/registro");
          return;
        }

        const data = snap.data();
        if (!data.aprobado || !data.formularioCompleto) {
          toast.error("Acceso denegado. Perfil no aprobado.");
          navigate("/registro");
          return;
        }

        if (!cancel) setExpert({ id: user.uid, ...data });
      } catch (e) {
        console.error(e);
        toast.error("No se pudo cargar tu perfil.");
      }
    })();

    return () => { cancel = true; };
  }, [loading, user, navigate]);

  // Cargar contenidos cuando ya hay experto
  useEffect(() => {
    if (expert?.id) cargarContenidos();
  }, [expert]);

  // Scroll suave a #servicios
  useEffect(() => {
    if (hash === "#servicios" && serviciosRef.current) {
      const OFFSET = 90;
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
  }, [expert, contenidos.length]);

  // Guard de carga inicial
  if (loading || (!expert && user)) {
    return (
      <>
        <UnifiedNavbar />
        <div className="min-h-screen grid place-items-center">Cargando información…</div>
      </>
    );
  }

  return (
    <ExpertShell
      title="Panel de Experto"
      subtitle="Administra tu perfil, servicios publicados y contenido disponible para los usuarios."
      actions={
        <div className="flex flex-wrap items-center gap-3">
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
      }
    >
          

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
                onSave={async (data) => {
                  try {
                    const ref = doc(db, "experts", expert.id);
                    await updateDoc(ref, data);
                    toast.success("Perfil actualizado correctamente.");
                    setExpert((prev) => ({ ...prev, ...data }));
                    setEditMode(false);
                  } catch (e) {
                    console.error(e);
                    toast.error("No se pudo guardar el perfil.");
                  }
                }}
              />
            </div>
          ) : (
            <>
              <div className="mb-6">
                <ExpertProfileCard
                  expert={expert}
                  onEdit={() => setEditMode(true)}
                  onUpload={() => setShowModal(true)}
                  publicHref={`/expertos/${expert.id}`}
                />
              </div>

              <ExpertServicesSection
                contenidos={contenidos}
                serviciosRef={serviciosRef}
                onAddService={() => setShowModal(true)}
                onDelete={handleDeleteContenido}
                onAddDate={handleAgregarFecha}
              />
                </>
                    )}                  
        

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
    </ExpertShell>
  );
};

export default ExpertDashboard;
