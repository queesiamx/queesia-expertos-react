import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays,
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  BrainCircuit,
  Video,
  GraduationCap,
  Rocket,
  Landmark,
  Zap,
} from "lucide-react";

const API_BASE = "https://queesia.com/api/calendario";
const ADMIN_TOKEN = "queesia_agenda_ia_2026_token_seguro_93xKp7";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const emptyForm = {
  titulo: "",
  slug: "",
  descripcion_corta: "",
  descripcion_larga: "",
  categoria: "Inteligencia artificial",
  tipo_evento: "Webinar",
  modalidad: "En línea",
  pais: "México",
  estado: "",
  ciudad: "",
  fecha_inicio: "",
  fecha_fin: "",
  hora_inicio: "",
  hora_fin: "",
  organizador: "",
  url_evento: "",
  fuente_url: "",
  imagen_url: "",
  captura_url: "",
  icono: "BrainCircuit",
  tags: "",
  costo: "Gratuito",
  destacado: false,
  estado_publicacion: "borrador",
};

const iconOptions = [
  { value: "BrainCircuit", label: "IA", icon: BrainCircuit },
  { value: "CalendarDays", label: "Calendario", icon: CalendarDays },
  { value: "Video", label: "Webinar / online", icon: Video },
  { value: "GraduationCap", label: "Educación", icon: GraduationCap },
  { value: "Rocket", label: "Startup / innovación", icon: Rocket },
  { value: "Landmark", label: "Gobierno", icon: Landmark },
  { value: "Zap", label: "Energía / tecnología", icon: Zap },
];

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminAgendaIA() {
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [eventoAEliminar, setEventoAEliminar] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [subiendoCaptura, setSubiendoCaptura] = useState(false);

  async function cargarEventos() {
    const res = await fetch(`${API_BASE}/obtener_eventos.php`);
    const data = await res.json();
    setEventos(data.eventos || []);
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const nuevoForm = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "titulo" && !editandoId) {
        nuevoForm.slug = generarSlug(value);
      }

      return nuevoForm;
    });
  }

  function editarEvento(evento) {
    setEditandoId(evento.id);
    setForm({
      ...emptyForm,
      ...evento,
      destacado: Number(evento.destacado) === 1,
      fecha_fin: evento.fecha_fin || "",
      hora_inicio: evento.hora_inicio || "",
      hora_fin: evento.hora_fin || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function limpiarForm() {
    setForm(emptyForm);
    setEditandoId(null);
    setMensaje("");
  }

  async function guardarEvento(e) {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const url = editandoId
        ? `${API_BASE}/actualizar_evento.php`
        : `${API_BASE}/guardar_evento.php`;

      const payload = editandoId
        ? { ...form, id: editandoId, admin_token: ADMIN_TOKEN }
        : { ...form, admin_token: ADMIN_TOKEN };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "No se pudo guardar");
      }

      toast.success(editandoId ? "Evento actualizado." : "Evento creado.");
      limpiarForm();
      await cargarEventos();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function eliminarEvento() {
    if (!eventoAEliminar) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/eliminar_evento.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: eventoAEliminar.id,
          admin_token: ADMIN_TOKEN,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "No se pudo eliminar");
      }

      toast.success("Evento eliminado.");
      setEventoAEliminar(null);
      await cargarEventos();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function subirACloudinary(file, campoDestino, folder, setSubiendo) {
    if (!file) return;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      toast.error("Faltan variables de Cloudinary en .env");
      return;
    }

    setSubiendo(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      formData.append("folder", folder);

      const res = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "No se pudo subir la imagen");
      }

      setForm((prev) => ({
        ...prev,
        [campoDestino]: data.secure_url,
      }));

      toast.success("Imagen subida correctamente.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-10 text-slate-900 sm:px-6">
      <Toaster position="top-right" />

      <section className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-white/60 bg-white/65 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-500">
                Panel admin
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold italic text-slate-900">
                <CalendarDays className="h-8 w-8 text-indigo-500" />
                Gestionar Agenda IA
              </h1>
            </div>

            <button
              onClick={limpiarForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Nuevo evento
            </button>
          </div>

          {mensaje && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
              {mensaje}
            </div>
          )}
        </div>

        <form
          onSubmit={guardarEvento}
          className="mb-10 rounded-3xl border border-white/60 bg-white/65 p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              {editandoId ? `Editando evento #${editandoId}` : "Crear evento"}
            </h2>

            {editandoId && (
              <button
                type="button"
                onClick={limpiarForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <X className="h-4 w-4" />
                Cancelar edición
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Título" name="titulo" value={form.titulo} onChange={handleChange} required />
            <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} />
            <Input label="Categoría" name="categoria" value={form.categoria} onChange={handleChange} />
            <Input label="Tipo de evento" name="tipo_evento" value={form.tipo_evento} onChange={handleChange} />
            <Input label="Modalidad" name="modalidad" value={form.modalidad} onChange={handleChange} />
            <Input label="País" name="pais" value={form.pais} onChange={handleChange} />
            <Input label="Estado" name="estado" value={form.estado} onChange={handleChange} />
            <Input label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} />

            <Input label="Fecha inicio" name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} required />
            <Input label="Fecha fin" name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} />
            <Input label="Hora inicio" name="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange} />
            <Input label="Hora fin" name="hora_fin" type="time" value={form.hora_fin} onChange={handleChange} />

            <Input label="Organizador" name="organizador" value={form.organizador} onChange={handleChange} />
            <Input label="Costo" name="costo" value={form.costo} onChange={handleChange} />
            <Input label="URL oficial" name="url_evento" value={form.url_evento} onChange={handleChange} />
            <Input label="Fuente URL" name="fuente_url" value={form.fuente_url} onChange={handleChange} />
            <Input label="Imagen URL" name="imagen_url" value={form.imagen_url} onChange={handleChange} />

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Subir imagen principal
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  subirACloudinary(
                    e.target.files?.[0],
                    "imagen_url",
                    "queesia/agenda-ia/banners",
                    setSubiendoImagen
                  )
                }
                className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
              />

              {subiendoImagen && (
                <p className="mt-2 text-sm font-semibold text-indigo-600">
                  Subiendo imagen...
                </p>
              )}
            </div>

            <Input label="Captura URL" name="captura_url" value={form.captura_url} onChange={handleChange} />

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Subir captura / evidencia
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  subirACloudinary(
                    e.target.files?.[0],
                    "captura_url",
                    "queesia/agenda-ia/capturas",
                    setSubiendoCaptura
                  )
                }
                className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
              />

              {subiendoCaptura && (
                <p className="mt-2 text-sm font-semibold text-indigo-600">
                  Subiendo captura...
                </p>
              )}
            </div>

            {form.imagen_url && (
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-bold text-slate-700">
                  Preview imagen principal
                </p>
                <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-md">
                  <img
                    src={form.imagen_url}
                    alt="Preview imagen del evento"
                    className="h-64 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {form.captura_url && (
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-bold text-slate-700">
                  Preview captura / evidencia
                </p>
                <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-md">
                  <img
                    src={form.captura_url}
                    alt="Preview captura del evento"
                    className="max-h-96 w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <IconPicker value={form.icono} onChange={handleChange} />

            <Input label="Tags separados por coma" name="tags" value={form.tags} onChange={handleChange} />

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Estado publicación
              </label>
              <select
                name="estado_publicacion"
                value={form.estado_publicacion}
                onChange={handleChange}
                className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
                <option value="oculto">Oculto</option>
              </select>
            </div>

            <label className="mt-7 flex items-center gap-2 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                name="destacado"
                checked={form.destacado}
                onChange={handleChange}
              />
              Marcar como destacado
            </label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Textarea label="Descripción corta" name="descripcion_corta" value={form.descripcion_corta} onChange={handleChange} />
            <Textarea label="Descripción larga" name="descripcion_larga" value={form.descripcion_larga} onChange={handleChange} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {loading ? "Guardando..." : editandoId ? "Actualizar evento" : "Guardar evento"}
          </button>
        </form>

        <section className="rounded-3xl border border-white/60 bg-white/65 p-6 shadow-xl backdrop-blur-xl">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Eventos registrados
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3">ID</th>
                  <th>Título</th>
                  <th>Fecha</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Destacado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {eventos.map((evento) => (
                  <tr key={evento.id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold">{evento.id}</td>
                    <td className="max-w-xs font-semibold text-slate-800">
                      {evento.titulo}
                    </td>
                    <td>{evento.fecha_inicio}</td>
                    <td>{evento.modalidad}</td>
                    <td>{evento.estado_publicacion || "publicado"}</td>
                    <td>{Number(evento.destacado) === 1 ? "Sí" : "No"}</td>
                    <td className="text-right">
                      <button
                        onClick={() => editarEvento(evento)}
                        className="mr-2 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-semibold text-slate-700 shadow"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        onClick={() => setEventoAEliminar(evento)}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-600 shadow"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {eventos.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No hay eventos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {eventoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/90 p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-slate-900">
              ¿Eliminar evento?
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Esta acción eliminará el evento{" "}
              <span className="font-bold text-slate-900">
                {eventoAEliminar.titulo}
              </span>
              . No se podrá recuperar desde el panel.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventoAEliminar(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={eliminarEvento}
                disabled={loading}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md disabled:opacity-60"
              >
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <textarea
        {...props}
        rows={5}
        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none"
      />
    </div>
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-700">
        Icono del evento
      </label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {iconOptions.map((item) => {
          const Icon = item.icon;
          const active = value === item.value;

          return (
            <label
              key={item.value}
              className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                active
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-white/70 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              <input
                type="radio"
                name="icono"
                value={item.value}
                checked={active}
                onChange={onChange}
                className="sr-only"
              />
              <Icon className="h-4 w-4" />
              {item.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}