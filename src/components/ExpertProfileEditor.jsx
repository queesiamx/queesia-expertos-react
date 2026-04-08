import React, { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import {
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  collection,
} from "firebase/firestore";
// Si usas alias "@", deja la línea de abajo; si no, cámbiala por "../lib/env"
import { CLOUD_NAME, UPLOAD_PRESET, DELETE_URL, assertCloudinaryEnv } from "../lib/env";
import { toast } from "react-hot-toast";

// Sanitizador local: elimina undefined/null y clona seguro
const sanitizePayload = (obj) => {
  const cleaned = Object.fromEntries(
    Object.entries(obj ?? {}).filter(
      ([, v]) => !(v === undefined || v === null || (typeof v === "string" && v.trim() === ""))
    )
  );
  return JSON.parse(JSON.stringify(cleaned));
};
// Borrado "best-effort": nunca debe romper el guardado
async function safeDeleteOldImage(publicId) {
  try {
     if (!publicId || !DELETE_URL) return;
    // En desarrollo evita ruido de CORS si el server no permite localhost
    if (import.meta.env?.DEV) {
      console.info("skip delete-image in DEV (to avoid CORS noise)");
      return;
    }
    // No awaits en el llamador: que sea fire-and-forget
    const res = await fetch(DELETE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    });
    if (!res.ok) {
      // Log solo informativo; no romper flujo
      console.info("Delete image failed", res.status, await res.text());
    }
  } catch (err) {
    console.warn("Delete image error (ignorado):", err?.message || err);
  }
}
export default function ExpertProfileEditor({ expert, onClose, onSave }) {
     const [formData, setFormData] = useState({
     nombre: "",
     especialidad: "",
    aniosExp: "",
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
     if (!expert) return;
    const yearsExpRaw =
      expert.aniosExp ??
      expert.experienciaAnios ??
      expert.aniosExperiencia ??
      expert.yearsExperience ??
      "";

      setFormData((prev) => ({
       ...prev,
       ...expert,
      aniosExp:
        yearsExpRaw === null || yearsExpRaw === undefined || yearsExpRaw === ""
          ? ""
          : String(yearsExpRaw).replace(/[^\d]/g, ""),
       certificaciones: Array.isArray(expert.certificaciones) ? expert.certificaciones : [],
       fotoPerfilURL: expert.fotoPerfilURL || "",
       fotoPerfilPublicId: expert.fotoPerfilPublicId || "",
     }));
     setPreviewURL(expert.fotoPerfilURL || "");
     // Evita where(..., undefined)
     if (expert.uid) cargarServicios(expert.uid);
   }, [expert]);

   const cargarServicios = async (uid) => {
   if (!uid) return; // ← evita where(..., undefined)
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
    if (name === "aniosExp") {
      setFormData((prev) => ({
        ...prev,
        aniosExp: value.replace(/[^\d]/g, ""),
      }));
      return;
    }
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
      // --- 1) Subida a Cloudinary (opcional) ---
      const oldPublicId = formData.fotoPerfilPublicId || null;
      let stateForSave = { ...formData }; // ← objeto local para guardar
      if (nuevaImagen) {
        assertCloudinaryEnv(); // lanza error claro si faltan
        const data = new FormData();
        data.append("file", nuevaImagen);
        data.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
          method: "POST",
          body: data,
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Cloudinary upload failed: ${res.status} ${t}`);
        }
        const imgData = await res.json();
        // Actualiza estado visual y también el objeto que vamos a guardar
        const newURL = imgData?.secure_url || formData.fotoPerfilURL || "";
        const newId  = imgData?.public_id  || formData.fotoPerfilPublicId || "";
        setFormData((prev) => ({ ...prev, fotoPerfilURL: newURL, fotoPerfilPublicId: newId }));
        setPreviewURL((prev) => newURL || prev);
        stateForSave = { ...stateForSave, fotoPerfilURL: newURL, fotoPerfilPublicId: newId };
        // Dispara el borrado en segundo plano (NO bloquear flujo)
        if (oldPublicId) safeDeleteOldImage(oldPublicId);
      }

      // --- 2) Sanitiza y quita claves vacías/undefined ---
     
      const normalizedYears =
        stateForSave.aniosExp === null || stateForSave.aniosExp === undefined
          ? ""
          : String(stateForSave.aniosExp).replace(/[^\d]/g, "");

       const base = {
         ...stateForSave,
        aniosExp: normalizedYears ? Number(normalizedYears) : null,
        experienciaAnios: normalizedYears ? Number(normalizedYears) : null,
        titulo: stateForSave.titulo || stateForSave.especialidad || "",
         certificaciones: Array.isArray(formData.certificaciones)
           ? formData.certificaciones
           : String(formData.certificaciones || "")
               .split(",")
               .map((c) => c.trim())
               .filter(Boolean),
         formularioCompleto: true,
       };
      // Remueve undefined/strings vacíos para evitar "Unsupported field value"
      const cleaned = Object.fromEntries(
        Object.entries(base).filter(
          ([, v]) => !(v === undefined || v === null || (typeof v === "string" && v.trim() === ""))
        )
      );
      const payload = sanitizePayload(cleaned);
      await setDoc(doc(db, "experts", user.uid), payload, { merge: true });

      toast.success("Perfil actualizado");
      onSave(cleaned);
    } catch (err) {
      console.error("Submit error:", err);
      // Mensaje más claro si viene de Cloudinary
      const msg = (err?.message || "").includes("Cloudinary")
        ? "Error al subir imagen (revisa tus variables de Cloudinary)."
        : (err?.message || "Error al guardar perfil");
      toast.error(msg);
    }
  };

  const guardarServicioIndividual = async (index) => {
    const user = auth.currentUser;
    if (!user) return;

     const serv = servicios[index] || {};
    const raw = {
      ...serv,
      expertoUID: user.uid,
      actualizado: new Date().toISOString(),
    };
    const data = sanitizePayload(
      Object.fromEntries(
        Object.entries(raw).filter(
          ([, v]) => !(v === undefined || v === null)
        )
      )
    );

    try {
      if (serv.id) {
        await setDoc(doc(db, "contenidosExpertos", serv.id), data, { merge: true });
      } else {
        const docRef = await addDoc(collection(db, "contenidosExpertos"), data);
        // refleja el id en estado para siguientes guardados
        setServicios((prev) =>
          prev.map((s, i) => (i === index ? { ...s, id: docRef.id } : s))
        );
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
        <input
          type="number"
          name="aniosExp"
          placeholder="Años de experiencia"
          value={formData.aniosExp}
          onChange={handleChange}
          min="0"
          step="1"
          inputMode="numeric"
          className="w-full border px-4 py-2 rounded"
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
