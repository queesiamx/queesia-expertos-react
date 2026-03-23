import React, { useMemo, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";

function splitTags(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function ExpertAdminEditor({ expert, onClose, onSaved }) {
  const initial = useMemo(
    () => ({
      nombre: expert?.nombre || "",
      especialidad: expert?.especialidad || "",
      experiencia: expert?.experiencia || "",
      educacion: Array.isArray(expert?.educacion)
        ? expert.educacion.join(", ")
        : (expert?.educacion || ""),
      certificaciones: Array.isArray(expert?.certificaciones)
        ? expert.certificaciones.join(", ")
        : (expert?.certificaciones || ""),
      linkedin: expert?.linkedin || "",
      telefono: expert?.telefono || "",
      redes: expert?.redes || "",
      email: expert?.email || "",
    }),
    [expert]
  );

  const [form, setForm] = useState(initial);
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const insertarPlantillaPerfil = () => {
    setForm((prev) => ({
      ...prev,
      experiencia:
        prev.experiencia?.trim() ||
        "Especialista en [área principal], con experiencia en [tipo de proyectos/actividades]. Puedo apoyar en [servicios concretos] y aportar valor en [sector o problema que resuelves]. Mi enfoque combina [metodologías, herramientas o fortalezas] para lograr resultados prácticos.",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expert?.id) {
      toast.error("No se encontró el ID del experto.");
      return;
    }

    if (!form.nombre.trim() || !form.especialidad.trim() || !form.experiencia.trim()) {
      toast.error("Nombre, especialidad y experiencia son obligatorios.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        especialidad: form.especialidad.trim(),
        experiencia: form.experiencia.trim(),
        educacion: splitTags(form.educacion),
        certificaciones: splitTags(form.certificaciones),
        linkedin: form.linkedin.trim(),
        telefono: form.telefono.trim(),
        redes: form.redes.trim(),
        email: form.email.trim(),
        editadoPorAdmin: auth?.currentUser?.email || null,
        editadoAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "experts", expert.id), payload);

      toast.success("Perfil actualizado correctamente.");
      onSaved?.({
        ...expert,
        ...payload,
      });
      onClose?.();
    } catch (error) {
      console.error("Error al editar experto:", error);
      toast.error("No se pudo actualizar el perfil.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Editar perfil de experto</h2>
            <p className="text-sm text-slate-500">Corrige nombre, especialidad, resumen y datos de contacto.</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 inline-flex items-center justify-center rounded-full hover:bg-slate-100"
            type="button"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Nombre</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Especialidad</label>
              <input
                name="especialidad"
                value={form.especialidad}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Resumen / experiencia</label>
              <button
                type="button"
                onClick={insertarPlantillaPerfil}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Insertar plantilla sugerida
              </button>
            </div>
            <textarea
              name="experiencia"
              value={form.experiencia}
              onChange={handleChange}
              rows={6}
              className="w-full rounded-xl border border-slate-300 px-4 py-3"
              placeholder="Describe qué hace, en qué se especializa, qué problemas resuelve y qué tipo de apoyo puede ofrecer."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Educación
              </label>
              <input
                name="educacion"
                value={form.educacion}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Ej. Ingeniería Petrolera, Maestría en IA"
              />
              <p className="mt-1 text-xs text-slate-500">Separar por comas.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Certificaciones
              </label>
              <input
                name="certificaciones"
                value={form.certificaciones}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Ej. Cisco, AWS, Scrum"
              />
              <p className="mt-1 text-xs text-slate-500">Separar por comas.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">LinkedIn o portafolio</label>
              <input
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Correo</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Redes</label>
              <input
                name="redes"
                value={form.redes}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
                placeholder="Instagram, X, sitio web, etc."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-11 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-5 h-11 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}