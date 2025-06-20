// src/components/ExpertProfileEditor.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { toast } from "react-hot-toast";

export default function ExpertProfileEditor({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: "",
    especialidad: "",
    experiencia: "",
    educacion: "",
    certificaciones: [],
    linkedin: "",
    telefono: "",
    redes: "",
    servicios: [],
    precios: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const ref = doc(db, "experts", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            ...formData,
            ...data,
            servicios: Array.isArray(data.servicios) ? data.servicios : [],
          });
        }
      } catch (e) {
        toast.error("Error al cargar datos del perfil");
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServicioChange = (index, field, value) => {
    const nuevosServicios = [...formData.servicios];
    nuevosServicios[index][field] = value;
    setFormData((prev) => ({ ...prev, servicios: nuevosServicios }));
  };

  const agregarServicio = () => {
    setFormData((prev) => ({
      ...prev,
      servicios: [...prev.servicios, { tipo: "", descripcion: "", precio: "" }],
    }));
  };

  const eliminarServicio = (index) => {
    const nuevos = [...formData.servicios];
    nuevos.splice(index, 1);
    setFormData((prev) => ({ ...prev, servicios: nuevos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      const ref = doc(db, "experts", user.uid);
      await updateDoc(ref, {
        ...formData,
        formularioCompleto: true,
      });
      toast.success("Perfil actualizado correctamente");
      onSave(formData);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el perfil");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Editar perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full border px-4 py-2 rounded" required />
        <input type="text" name="especialidad" placeholder="Especialidad" value={formData.especialidad} onChange={handleChange} className="w-full border px-4 py-2 rounded" required />
        <textarea name="experiencia" placeholder="Experiencia" value={formData.experiencia} onChange={handleChange} className="w-full border px-4 py-2 rounded" rows={3} />
        <textarea name="educacion" placeholder="Educación" value={formData.educacion} onChange={handleChange} className="w-full border px-4 py-2 rounded" rows={2} />
        <textarea name="certificaciones" placeholder="Certificaciones (separadas por comas)" value={formData.certificaciones?.join(", ") || ""} onChange={(e) => setFormData((prev) => ({ ...prev, certificaciones: e.target.value.split(",").map((c) => c.trim()) }))} className="w-full border px-4 py-2 rounded" rows={2} />
        <input type="text" name="linkedin" placeholder="Enlace de LinkedIn" value={formData.linkedin} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <input type="text" name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={handleChange} className="w-full border px-4 py-2 rounded" />
        <input type="text" name="redes" placeholder="Redes sociales" value={formData.redes} onChange={handleChange} className="w-full border px-4 py-2 rounded" />

        <div>
          <h3 className="text-lg font-semibold">Servicios ofrecidos</h3>
          {formData.servicios.map((serv, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-2 items-center mb-2">
              <input
                type="text"
                value={serv.tipo}
                placeholder="Tipo (ej. Manual, Curso, Asesoría)"
                onChange={(e) => handleServicioChange(index, "tipo", e.target.value)}
                className="border px-2 py-1 rounded w-full md:w-1/3"
              />
              <input
                type="text"
                placeholder="Título del servicio"
                className="border px-2 py-1 rounded w-full md:w-1/2"
                value={serv.titulo || ""}
                onChange={(e) => handleServicioChange(index, "titulo", e.target.value)}
              />


              <input
                type="text"
                value={serv.descripcion}
                placeholder="Descripción"
                onChange={(e) => handleServicioChange(index, "descripcion", e.target.value)}
                className="border px-2 py-1 rounded w-full md:w-1/2"
              />
              <input
                type="text"
                value={serv.precio}
                placeholder="Precio"
                onChange={(e) => handleServicioChange(index, "precio", e.target.value)}
                className="border px-2 py-1 rounded w-full md:w-1/4"
              />
              <button type="button" onClick={() => eliminarServicio(index)} className="text-red-600 hover:underline text-sm">
                Eliminar
              </button>
            </div>
          ))}
          <button type="button" onClick={agregarServicio} className="text-blue-600 hover:underline text-sm mt-2">
            ➕ Agregar otro servicio
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={onClose} className="text-gray-700 underline">
            Cancelar
          </button>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
