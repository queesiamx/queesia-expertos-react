import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";

export default function ExpertProfileEditor({ expert, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    experiencia: "",
    educacion: "",
    certificaciones: [],
    linkedin: "",
    telefono: "",
    redes: "",
    fotoPerfilURL: "",
    fotoPerfilPublicId: "",
  });

  const [servicios, setServicios] = useState([
    { tipo: "", titulo: "", descripcion: "", precio: "", fechas: [] },
  ]);

  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [previewURL, setPreviewURL] = useState("");

  useEffect(() => {
    if (expert) {
      setFormData((prev) => ({
        ...prev,
        ...expert,
        certificaciones: Array.isArray(expert.certificaciones)
          ? expert.certificaciones
          : [],
      }));
      setPreviewURL(expert.fotoPerfilURL || "");
      cargarServicios(expert.uid);
    }
  }, [expert]);

  const cargarServicios = async (uid) => {
    const q = query(collection(db, "contenidosExpertos"), where("expertoUID", "==", uid));
    const querySnapshot = await getDocs(q);
    const serviciosCargados = [];
    querySnapshot.forEach((doc) => {
      serviciosCargados.push({ id: doc.id, ...doc.data() });
    });
    setServicios(serviciosCargados.length > 0 ? serviciosCargados : servicios);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (index, field, value) => {
    const nuevos = [...servicios];
    nuevos[index][field] = value;
    setServicios(nuevos);
  };

  const agregarFecha = (index) => {
    const nuevos = [...servicios];
    nuevos[index].fechas = [...(nuevos[index].fechas || []), ""];
    setServicios(nuevos);
  };

  const eliminarFecha = (index, fechaIdx) => {
    const nuevos = [...servicios];
    nuevos[index].fechas.splice(fechaIdx, 1);
    setServicios(nuevos);
  };

  const actualizarFecha = (index, fechaIdx, value) => {
    const nuevos = [...servicios];
    nuevos[index].fechas[fechaIdx] = value;
    setServicios(nuevos);
  };

  const agregarServicio = () => {
    setServicios([
      ...servicios,
      { tipo: "", titulo: "", descripcion: "", precio: "", fechas: [] },
    ]);
  };

  const eliminarServicio = (index) => {
    const nuevos = [...servicios];
    nuevos.splice(index, 1);
    setServicios(nuevos);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaImagen(file);
      setPreviewURL(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (nuevaImagen) {
        if (formData.fotoPerfilPublicId) {
          await fetch(import.meta.env.VITE_CLOUDINARY_DELETE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: formData.fotoPerfilPublicId }),
          });
        }

        const data = new FormData();
        data.append("file", nuevaImagen);
        data.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: data,
          }
        );

        const imgData = await res.json();
        formData.fotoPerfilURL = imgData.secure_url;
        formData.fotoPerfilPublicId = imgData.public_id;
      }

      await updateDoc(doc(db, "experts", user.uid), {
        ...formData,
        formularioCompleto: true,
      });

      toast.success("Perfil actualizado");
      onSave(formData);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar perfil");
    }
  };

  const guardarServicioIndividual = async (index) => {
    const user = auth.currentUser;
    if (!user) return;

    const serv = servicios[index];
    const data = {
      ...serv,
      expertoUID: user.uid,
      actualizado: new Date(),
    };

    try {
      if (serv.id) {
        await setDoc(doc(db, "contenidosExpertos", serv.id), data);
      } else {
        const docRef = await addDoc(collection(db, "contenidosExpertos"), data);
        servicios[index].id = docRef.id;
      }
      toast.success(`Servicio ${index + 1} guardado`);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar servicio");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar perfil</h2>

      <div className="flex justify-center mb-4">
        <img
          src={previewURL || "/default-avatar.png"}
          alt="Preview"
          className="w-32 h-32 object-cover rounded-full"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block"
        />

        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="text"
          name="especialidad"
          placeholder="Especialidad"
          value={formData.especialidad}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="experiencia"
          placeholder="Experiencia"
          value={formData.experiencia}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          name="educacion"
          placeholder="Educación"
          value={formData.educacion}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          name="certificaciones"
          placeholder="Certificaciones (separadas por comas)"
          value={formData.certificaciones?.join(", ") || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              certificaciones: e.target.value.split(",").map((c) => c.trim()),
            }))
          }
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="redes"
          placeholder="Redes sociales"
          value={formData.redes}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <div>
          <h3 className="text-lg font-semibold">Servicios ofrecidos</h3>
          {servicios.map((serv, index) => (
            <div key={index} className="border p-3 mb-4 rounded bg-gray-50">
              <select
  value={serv.tipo}
  onChange={(e) => handleServicioChange(index, "tipo", e.target.value)}
  className="border px-2 py-1 rounded w-full mb-2"
>
  <option value="">Selecciona el tipo</option>
  <option value="curso">Curso</option>
  <option value="consulta">Consulta</option>
  <option value="manual">Manual / Capacitación</option>
</select>

              <input
                type="text"
                value={serv.titulo}
                placeholder="Título"
                onChange={(e) =>
                  handleServicioChange(index, "titulo", e.target.value)
                }
                className="border px-2 py-1 rounded w-full mb-2"
              />
              <input
                type="text"
                value={serv.descripcion}
                placeholder="Descripción"
                onChange={(e) =>
                  handleServicioChange(index, "descripcion", e.target.value)
                }
                className="border px-2 py-1 rounded w-full mb-2"
              />
              <input
                type="text"
                value={serv.precio}
                placeholder="Precio"
                onChange={(e) =>
                  handleServicioChange(index, "precio", e.target.value)
                }
                className="border px-2 py-1 rounded w-full mb-2"
              />

              {serv.tipo?.toLowerCase() === "curso" && (
                <div className="mt-2">
                  <h4 className="font-medium text-sm mb-1">Fechas disponibles</h4>
                  {(serv.fechas || []).map((fecha, fechaIdx) => (
                    <div key={fechaIdx} className="flex items-center gap-2 mb-1">
                      <input
                        type="datetime-local"
                        value={fecha}
                        onChange={(e) =>
                          actualizarFecha(index, fechaIdx, e.target.value)
                        }
                        className="border px-2 py-1 rounded w-full"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarFecha(index, fechaIdx)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => agregarFecha(index)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    ➕ Agregar fecha
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={() => eliminarServicio(index)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Eliminar servicio
                </button>
                <button
                  type="button"
                  onClick={() => guardarServicioIndividual(index)}
                  className="text-green-700 border border-green-600 text-sm px-3 py-1 rounded hover:bg-green-100"
                >
                  Guardar servicio
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={agregarServicio}
            className="text-blue-700 hover:underline text-sm"
          >
            ➕ Agregar nuevo servicio
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 underline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
