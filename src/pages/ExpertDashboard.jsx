// src/pages/ExpertDashboard.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import {
  doc, getDoc, updateDoc,
  collection, query, where, getDocs
} from "firebase/firestore";
import toast from "react-hot-toast";
import ExpertShell from "@/components/expert/ExpertShell";
import ExpertServicesSection from "@/components/expert/ExpertServicesSection";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertProfileCard from "../components/ExpertProfileCard";
import ExpertProfileEditor from "../components/ExpertProfileEditor";
import ExpertAvailabilityModal from "@/components/expert/ExpertAvailabilityModal";
import UploadContenido from "../components/UploadContenido";
import Modal from "../components/Modal";

function ServicioEditForm({ contenido, onCancel, onSave }) {
  const [form, setForm] = useState({
    titulo: contenido?.titulo || "",
    descripcion: contenido?.descripcion || "",
    precio: contenido?.precio ?? "",
    tipoContenido: contenido?.tipoContenido || "curso",
    modalidad: contenido?.modalidad || "en línea",
    plataforma: contenido?.plataforma || "",
    duracionHoras: contenido?.duracionHoras ?? "",
    cupoMinimo: contenido?.cupoMinimo ?? "",
    cupoMaximo: contenido?.cupoMaximo ?? "",
    requierePago: !!contenido?.requierePago,
    urlAccesoPrivado: contenido?.urlAccesoPrivado || "",
    instruccionesAcceso: contenido?.instruccionesAcceso || "",
    fechasDisponibles: Array.isArray(contenido?.fechasDisponibles)
      ? contenido.fechasDisponibles.join("\n")
      : "",
    estatus: contenido?.estatus || "activo",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.titulo.trim() || !form.descripcion.trim()) {
      toast.error("Completa título y descripción.");
      return;
    }

    setSaving(true);
    await onSave({
      ...form,
      precio: form.precio === "" ? null : Number(form.precio),
      duracionHoras: form.duracionHoras === "" ? null : Number(form.duracionHoras),
      cupoMinimo: form.cupoMinimo === "" ? null : Number(form.cupoMinimo),
      cupoMaximo: form.cupoMaximo === "" ? null : Number(form.cupoMaximo),
      fechasDisponibles: form.fechasDisponibles
        .split("\n")
        .map((fecha) => fecha.trim())
        .filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Editar servicio</h2>
        <p className="mt-1 text-sm text-slate-500">Actualiza la información visible para los usuarios.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Título</span>
          <input name="titulo" value={form.titulo} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Descripción</span>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Tipo</span>
          <select name="tipoContenido" value={form.tipoContenido} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2">
            <option value="curso">Curso</option>
            <option value="manual">Manual</option>
            <option value="consulta">Consulta</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Precio</span>
          <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Modalidad</span>
          <input name="modalidad" value={form.modalidad} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Plataforma</span>
          <input name="plataforma" value={form.plataforma} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Duración (horas)</span>
          <input name="duracionHoras" type="number" min="0" value={form.duracionHoras} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Cupo máximo</span>
          <input name="cupoMaximo" type="number" min="0" value={form.cupoMaximo} onChange={handleChange} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Fechas disponibles</span>
          <textarea name="fechasDisponibles" value={form.fechasDisponibles} onChange={handleChange} placeholder="Una fecha por línea" className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="requierePago" checked={form.requierePago} onChange={handleChange} />
        Requiere pago para acceder
      </label>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-xl bg-white px-4 py-2 text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}


const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const serviciosRef = useRef(null);

  // ✅ Usa el estado global de autenticación
  const { user, loading } = useAuth();

  const [expert, setExpert] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [modalFechaVisible, setModalFechaVisible] = useState(false);
  const [contenidoEnEdicion, setContenidoEnEdicion] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");
  
  const handleSaveAvailability = async (data) => {
    try {
      if (!expert?.id) {
        toast.error("No se encontró el perfil del experto.");
        return;
      }

      const ref = doc(db, "experts", expert.id);

      await updateDoc(ref, data);

      setExpert((prev) => ({
        ...prev,
        ...data,
      }));

      toast.success("Disponibilidad actualizada correctamente.");
      setShowAvailabilityModal(false);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la disponibilidad.");
    }
  };

const cargarContenidos = useCallback(async () => {
    if (!expert?.id) return;
    const consultas = [
      query(collection(db, "contenidosExpertos"), where("expertoId", "==", expert.id)),
      query(collection(db, "contenidosExpertos"), where("expertoUID", "==", expert.id)),
    ];

    const snapshots = await Promise.all(consultas.map((q) => getDocs(q)));
    const contenidosPorId = new Map();

    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((d) => {
        contenidosPorId.set(d.id, { id: d.id, ...d.data() });
      });
    });

    setContenidos(Array.from(contenidosPorId.values()));
  }, [expert?.id]);

  const getAuthHeaders = async () => {
    const token = await user?.getIdToken?.();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const updateContenido = async (contenidoId, payload) => {
    const res = await fetch("/api/delete-cloudinary", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ id: contenidoId, ...payload }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo actualizar el contenido.");
    return data;
  };

  const deleteContenidoDoc = async (contenidoId) => {
    const res = await fetch("/api/delete-cloudinary", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(await getAuthHeaders()),
      },
      body: JSON.stringify({ id: contenidoId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo eliminar el contenido.");
    return data;
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
      await deleteContenidoDoc(contenidoId);
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
      const fechasActuales = Array.isArray(contenidoSeleccionado.fechasDisponibles)
        ? contenidoSeleccionado.fechasDisponibles
        : [];
      await updateContenido(contenidoSeleccionado.id, {
        fechasDisponibles: [...new Set([...fechasActuales, nuevaFecha])],
      });
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

  const handleEditarContenido = (contenido) => {
    setContenidoEnEdicion(contenido);
  };

  const handleGuardarContenido = async (payload) => {
    if (!contenidoEnEdicion?.id) return;

    try {
      await updateContenido(contenidoEnEdicion.id, payload);
      toast.success("Servicio actualizado.");
      setContenidoEnEdicion(null);
      cargarContenidos();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "No se pudo actualizar el servicio.");
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
  }, [expert, cargarContenidos]);

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
         sidebarProps={{
           onOpenAvailability: () => setShowAvailabilityModal(true),
         }}
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
                onEdit={handleEditarContenido}
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

      <Modal isOpen={!!contenidoEnEdicion} onClose={() => setContenidoEnEdicion(null)}>
        {contenidoEnEdicion && (
          <ServicioEditForm
            contenido={contenidoEnEdicion}
            onCancel={() => setContenidoEnEdicion(null)}
            onSave={handleGuardarContenido}
          />
        )}
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

     
      <ExpertAvailabilityModal
        isOpen={showAvailabilityModal}
        onClose={() => setShowAvailabilityModal(false)}
        expert={expert}
        onSave={handleSaveAvailability}
      />
    </ExpertShell>
  );
};

export default ExpertDashboard;
