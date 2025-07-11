// src/pages/ExpertDashboard.jsx
import { useNavigate } from "react-router-dom";
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
import React, { useEffect, useState } from "react";
import NavbarExperto from "../components/NavbarExperto";
import ExpertProfileCard from "../components/ExpertProfileCard";
import ExpertProfileEditor from "../components/ExpertProfileEditor";
import UploadContenido from "../components/UploadContenido";
import Modal from "../components/Modal";

const ExpertDashboard = () => {
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [contenidos, setContenidos] = useState([]);
  const [modalFechaVisible, setModalFechaVisible] = useState(false);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState("");

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
    if (!window.confirm("¿Seguro que quieres eliminar este contenido? Esta acción no se puede deshacer.")) {
      return;
    }
    try {
      if (publicId) {
        const res = await fetch('/api/delete-cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        });
        const data = await res.json();
        if (data.result !== "ok" && data.result !== "not found") {
          throw new Error(data.error || "No se pudo eliminar de Cloudinary");
        }
      }
      await deleteDoc(doc(db, "contenidosExpertos", contenidoId));
      toast.success("Contenido eliminado correctamente.");
      cargarContenidos();
    } catch (error) {
      console.error(error);
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

  return (
    <>
      <NavbarExperto />
      <div className="p-6 max-w-4xl mx-auto font-sans">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Panel de Experto</h1>
        </div>

        {!expert ? (
          <p className="text-gray-600">Cargando información...</p>
        ) : editMode ? (
          <ExpertProfileEditor
            expert={expert}
            onSave={handleSave}
            onCancel={() => setEditMode(false)}
          />
        ) : (
          <>
            <ExpertProfileCard expert={expert} />

            <button
              onClick={() => setEditMode(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ✏️ Editar perfil
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="mt-4 ml-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              📤 Cargar contenidos
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-4">📚 Servicios</h2>
            {contenidos.length === 0 ? (
              <p className="text-gray-600">No has subido contenidos aún.</p>
            ) : (
              <div className="space-y-4">
                {contenidos.map((contenido) => (
                  <div
                    key={contenido.id}
                    className="border border-gray-200 rounded-md p-4 shadow bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {contenido.tipoContenido === "curso" && "📘 Curso"}
                        {contenido.tipoContenido === "manual" && "📕 Manual"}
                        {contenido.tipoContenido === "consulta" && "📄 Consulta"}
                        {` "${contenido.titulo}"`}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAgregarFecha(contenido)}
                          className="text-green-600 hover:text-green-800"
                          title="Agregar fecha disponible"
                        >
                          📅
                        </button>
                        <button
                          onClick={() => handleDeleteContenido(contenido.id, contenido.public_id)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar contenido"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">
                      {contenido.descripcion}
                    </p>
                    {contenido.precio ? (
                      <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded">
                        ${contenido.precio.toFixed(2)}
                      </span>
                    ) : (
                      <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-200 text-blue-800 rounded">
                        Contenido gratuito
                      </span>
                    )}
                    <div className="mt-2">
                      <a
                        href={contenido.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        Ver archivo
                      </a>
                    </div>
                    {contenido.fechasDisponibles?.length > 0 && (
                      <div className="mt-2 text-sm text-gray-700">
                        <strong>Fechas disponibles:</strong> {contenido.fechasDisponibles.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
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
    </>
  );
};

export default ExpertDashboard;
