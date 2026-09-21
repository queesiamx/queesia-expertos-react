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
import { auth } from "@/firebase";

const AGENDA_ADMIN_API = "/api/admin/agenda";
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const emptyForm = {
  titulo: "",
  slug: "",
  descripcion_corta: "",
  descripcion_larga: "",
  categoria: "Inteligencia artificial",
  tipo_evento: "Otro",
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

const categoryOptions = ["Inteligencia artificial", "Tecnología", "Innovación", "Otro"];

const eventTypeOptions = [
  "Congreso",
  "Webinar",
  "Curso",
  "Taller",
  "Conferencia",
  "Convocatoria",
  "Hackathon",
  "Meetup",
  "Seminario",
  "Diplomado",
  "Otro",
];

const modalityOptions = ["En línea", "Presencial", "Híbrido"];

const publicationStateHelp = {
  borrador: "No visible públicamente.",
  publicado: "Visible en la agenda pública.",
  oculto: "No visible, pero conservado en el admin.",
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

const formFieldNames = Object.keys(emptyForm);

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

function normalizeDestacado(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;

  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  return ["1", "true", "si", "sí", "destacado"].includes(normalized);
}

function cleanTags(tags) {
  return String(tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");
}

function isValidUrl(value) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getValidationErrors(form) {
  const errors = {};
  const fechaInicio = form.fecha_inicio;
  const fechaFin = form.fecha_fin;
  const sameDayEvent = !fechaFin || fechaFin === fechaInicio;

  if (!form.titulo.trim()) {
    errors.titulo = "El título es obligatorio.";
  }

  if (!fechaInicio) {
    errors.fecha_inicio = "La fecha de inicio es obligatoria.";
  }

  if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
    errors.fecha_fin = "La fecha fin no puede ser anterior a la fecha inicio.";
  }

  if (
    fechaInicio &&
    sameDayEvent &&
    form.hora_inicio &&
    form.hora_fin &&
    form.hora_fin < form.hora_inicio
  ) {
    errors.hora_fin =
      "La hora fin no puede ser anterior a la hora inicio en eventos de un día.";
  }

  ["url_evento", "fuente_url", "imagen_url", "captura_url"].forEach((field) => {
    if (!isValidUrl(form[field])) {
      errors[field] = "Ingresa una URL válida que empiece con http:// o https://.";
    }
  });

  return errors;
}

function normalizeEventForForm(evento) {
  const normalized = { ...emptyForm };

  formFieldNames.forEach((field) => {
    if (evento[field] !== undefined && evento[field] !== null) {
      normalized[field] = evento[field];
    }
  });

  normalized.destacado = normalizeDestacado(evento.destacado);
  normalized.fecha_fin = evento.fecha_fin || "";
  normalized.hora_inicio = evento.hora_inicio || "";
  normalized.hora_fin = evento.hora_fin || "";

  return normalized;
}

function getOptionsWithLegacy(options, value) {
  if (!value || options.includes(value)) return options;
  return [...options, value];
}

async function getAdminAuthHeaders() {
  const token = await auth.currentUser?.getIdToken?.();

  if (!token) {
    throw new Error("No autenticado");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function readAgendaResponse(res) {
  const data = await res.json().catch(() => ({
    success: false,
    message: "Error interno del servidor",
  }));

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Error interno del servidor");
  }

  return data;
}

export default function AdminAgendaIA() {
  const [eventos, setEventos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errors, setErrors] = useState({});
  const [eventoAEliminar, setEventoAEliminar] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [subiendoCaptura, setSubiendoCaptura] = useState(false);

  async function cargarEventos() {
    const res = await fetch(AGENDA_ADMIN_API, {
      headers: {
        ...(await getAdminAuthHeaders()),
      },
    });
    const data = await readAgendaResponse(res);
    setEventos(data.eventos || []);
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

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
    setForm(normalizeEventForForm(evento));
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function limpiarForm() {
    setForm(emptyForm);
    setEditandoId(null);
    setMensaje("");
    setErrors({});
  }

  async function guardarEvento(e) {
    e.preventDefault();
    setMensaje("");

    const validationErrors = getValidationErrors(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Revisa los campos marcados antes de guardar.");
      return;
    }

    setLoading(true);

    try {
      const normalizedForm = {
        ...form,
        tags: cleanTags(form.tags),
        destacado: normalizeDestacado(form.destacado) ? 1 : 0,
      };

      const payload = editandoId
        ? { ...normalizedForm, id: editandoId }
        : normalizedForm;

      const res = await fetch(AGENDA_ADMIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAdminAuthHeaders()),
        },
        body: JSON.stringify({
          action: editandoId ? "update" : "create",
          evento: payload,
        }),
      });

      await readAgendaResponse(res);

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
      const res = await fetch(AGENDA_ADMIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getAdminAuthHeaders()),
        },
        body: JSON.stringify({
          action: "delete",
          id: eventoAEliminar.id,
        }),
      });

      await readAgendaResponse(res);

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

      setErrors((prev) => {
        if (!prev[campoDestino]) return prev;
        const next = { ...prev };
        delete next[campoDestino];
        return next;
      });

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
              type="button"
              onClick={limpiarForm}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
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
          noValidate
          className="mb-10 space-y-6 rounded-3xl border border-white/60 bg-white/65 p-6 shadow-xl backdrop-blur-xl"
        >
          <div className="flex flex-col gap-3 border-b border-white/70 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                {editandoId ? "Edición" : "Creación"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {editandoId ? `Editando evento #${editandoId}` : "Crear evento"}
              </h2>
            </div>

            {editandoId && (
              <button
                type="button"
                onClick={limpiarForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="h-4 w-4" />
                Cancelar edición
              </button>
            )}
          </div>

          <FormSection
            title="Información básica"
            description="Identifica el evento y evita variantes innecesarias en categoría, tipo y modalidad."
          >
            <Input
              label="Título"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              error={errors.titulo}
              required
            />
            <Input
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              help="En creación se genera desde el título; en edición se conserva salvo que lo modifiques."
            />
            <ComboInput
              label="Categoría"
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              options={getOptionsWithLegacy(categoryOptions, form.categoria)}
              help="Mantén 'Inteligencia artificial' salvo que el evento requiera otra clasificación."
            />
            <ComboInput
              label="Tipo de evento"
              name="tipo_evento"
              value={form.tipo_evento}
              onChange={handleChange}
              options={getOptionsWithLegacy(eventTypeOptions, form.tipo_evento)}
              help="Usa una opción estándar o conserva un valor legacy si ya existe."
            />
            <ComboInput
              label="Modalidad"
              name="modalidad"
              value={form.modalidad}
              onChange={handleChange}
              options={getOptionsWithLegacy(modalityOptions, form.modalidad)}
              help="Para eventos en línea, la ciudad puede quedar vacía."
            />
          </FormSection>

          <FormSection
            title="Fecha y ubicación"
            description="La fecha inicio es obligatoria. Si no hay fecha fin, se trata visualmente como evento de un día."
          >
            <Input label="País" name="pais" value={form.pais} onChange={handleChange} />
            <Input
              label="Estado / región"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              help="Campo geográfico; no confundir con estado de publicación."
            />
            <Input
              label="Ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              help="Opcional para modalidad en línea."
            />
            <Input
              label="Fecha inicio"
              name="fecha_inicio"
              type="date"
              value={form.fecha_inicio}
              onChange={handleChange}
              error={errors.fecha_inicio}
              required
            />
            <Input
              label="Fecha fin"
              name="fecha_fin"
              type="date"
              value={form.fecha_fin}
              onChange={handleChange}
              error={errors.fecha_fin}
              help="Déjalo vacío si termina el mismo día."
            />
            <Input
              label="Hora inicio"
              name="hora_inicio"
              type="time"
              value={form.hora_inicio}
              onChange={handleChange}
            />
            <Input
              label="Hora fin"
              name="hora_fin"
              type="time"
              value={form.hora_fin}
              onChange={handleChange}
              error={errors.hora_fin}
            />
          </FormSection>

          <FormSection
            title="Organizador y acceso"
            description="Costo sigue como texto para admitir precios, preventas y variantes como 'Gratuito con registro'."
          >
            <Input
              label="Organizador"
              name="organizador"
              value={form.organizador}
              onChange={handleChange}
            />
            <Input
              label="Costo"
              name="costo"
              value={form.costo}
              onChange={handleChange}
              placeholder="Gratuito, $2,500 MXN, Desde $1,200 MXN..."
            />
            <Input
              label="URL oficial"
              name="url_evento"
              type="url"
              value={form.url_evento}
              onChange={handleChange}
              error={errors.url_evento}
              placeholder="https://..."
            />
            <Input
              label="Fuente URL"
              name="fuente_url"
              type="url"
              value={form.fuente_url}
              onChange={handleChange}
              error={errors.fuente_url}
              placeholder="https://..."
              help="Referencia pública de donde se verificó el evento."
            />
          </FormSection>

          <FormSection
            title="Multimedia"
            description="La imagen principal se usa públicamente. La captura/evidencia sirve como respaldo visual de la fuente."
          >
            <Input
              label="Imagen principal URL"
              name="imagen_url"
              type="url"
              value={form.imagen_url}
              onChange={handleChange}
              error={errors.imagen_url}
              placeholder="https://..."
            />
            <FileUpload
              label="Subir imagen principal"
              loading={subiendoImagen}
              loadingText="Subiendo imagen..."
              help="Reemplaza el campo Imagen principal URL cuando termina la carga."
              onChange={(file) =>
                subirACloudinary(
                  file,
                  "imagen_url",
                  "queesia/agenda-ia/banners",
                  setSubiendoImagen
                )
              }
            />
            <Input
              label="Captura / evidencia URL"
              name="captura_url"
              type="url"
              value={form.captura_url}
              onChange={handleChange}
              error={errors.captura_url}
              placeholder="https://..."
            />
            <FileUpload
              label="Subir captura / evidencia"
              loading={subiendoCaptura}
              loadingText="Subiendo captura..."
              help="Útil para conservar una prueba visual o respaldo de la fuente."
              onChange={(file) =>
                subirACloudinary(
                  file,
                  "captura_url",
                  "queesia/agenda-ia/capturas",
                  setSubiendoCaptura
                )
              }
            />

            {form.imagen_url && (
              <ImagePreview
                title="Preview imagen principal"
                src={form.imagen_url}
                alt="Preview imagen del evento"
                className="h-64 w-full object-cover"
              />
            )}

            {form.captura_url && (
              <ImagePreview
                title="Preview captura / evidencia"
                src={form.captura_url}
                alt="Preview captura del evento"
                className="max-h-96 w-full object-contain"
              />
            )}
          </FormSection>

          <FormSection
            title="Clasificación"
            description="Campos editoriales para ordenar, destacar y controlar visibilidad."
          >
            <IconPicker value={form.icono} onChange={handleChange} />

            <Input
              label="Tags separados por coma"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="IA, machine learning, UNAM, investigación"
              help="Antes de guardar se limpian espacios duplicados entre tags."
            />

            <div>
              <label className="mb-1 block text-sm font-bold text-slate-700">
                Estado publicación
              </label>
              <select
                name="estado_publicacion"
                value={form.estado_publicacion}
                onChange={handleChange}
                className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-indigo-400/40"
              >
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
                <option value="oculto">Oculto</option>
              </select>
              <FieldHelp>{publicationStateHelp[form.estado_publicacion]}</FieldHelp>
            </div>

            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                name="destacado"
                checked={normalizeDestacado(form.destacado)}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Marcar como destacado
            </label>
          </FormSection>

          <FormSection
            title="Contenido"
            description="Resumen corto para tarjetas y descripción larga para el detalle."
          >
            <Textarea
              label="Descripción corta"
              name="descripcion_corta"
              value={form.descripcion_corta}
              onChange={handleChange}
              placeholder="Resumen breve para la tarjeta pública."
            />
            <Textarea
              label="Descripción larga"
              name="descripcion_larga"
              value={form.descripcion_larga}
              onChange={handleChange}
              placeholder="Detalles, agenda, requisitos o contexto adicional."
            />
          </FormSection>

          <div className="flex flex-col gap-3 border-t border-white/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              No se agregan campos nuevos: se conserva el payload actual.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80"
            >
              <Save className="h-4 w-4" />
              {loading
                ? "Guardando..."
                : editandoId
                  ? "Actualizar evento"
                  : "Guardar evento"}
            </button>
          </div>
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
                  <th>Visible</th>
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
                    <td>
                      <EstadoBadge estado={evento.estado_publicacion} />
                    </td>

                    <td>
                      <VisibleBadge estado={evento.estado_publicacion} />
                    </td>

                    <td>{normalizeDestacado(evento.destacado) ? "Sí" : "No"}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        onClick={() => editarEvento(evento)}
                        className="mr-2 inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-semibold text-slate-700 shadow transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => setEventoAEliminar(evento)}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 font-semibold text-red-600 shadow transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}

                {eventos.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-500">
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
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={eliminarEvento}
                disabled={loading}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:bg-red-600 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/60 bg-white/45 p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold italic text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Input({ label, help, error, className = "", children, ...props }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`min-h-12 w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-indigo-400/40 ${
          error ? "border-red-300" : "border-white/70"
        }`}
      />
      {children}
      <FieldHelp error={error}>{error || help}</FieldHelp>
    </div>
  );
}

function ComboInput({ label, help, error, options, name, ...props }) {
  const listId = `${name}-options`;

  return (
    <Input label={label} help={help} error={error} name={name} list={listId} {...props}>
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </Input>
  );
}

function Textarea({ label, help, error, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>
      <textarea
        {...props}
        rows={5}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-indigo-200 focus:ring-2 focus:ring-indigo-400/40 ${
          error ? "border-red-300" : "border-white/70"
        }`}
      />
      <FieldHelp error={error}>{error || help}</FieldHelp>
    </div>
  );
}

function FieldHelp({ children, error }) {
  if (!children) return null;

  return (
    <p
      className={`mt-1 text-xs font-semibold leading-relaxed ${
        error ? "text-red-600" : "text-slate-500"
      }`}
    >
      {children}
    </p>
  );
}

function FileUpload({ label, help, loading, loadingText, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0])}
        className="min-h-12 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm outline-none transition file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-indigo-700 focus:border-indigo-200 focus:ring-2 focus:ring-indigo-400/40"
      />

      <FieldHelp>{loading ? loadingText : help}</FieldHelp>
    </div>
  );
}

function ImagePreview({ title, src, alt, className }) {
  return (
    <div className="md:col-span-2">
      <p className="mb-2 text-sm font-bold text-slate-700">{title}</p>
      <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/60 shadow-md">
        <img
          src={src}
          alt={alt}
          className={className}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    </div>
  );
}

function EstadoBadge({ estado }) {
  const estilos = {
    publicado: "bg-emerald-50 text-emerald-700 border-emerald-200",
    borrador: "bg-amber-50 text-amber-700 border-amber-200",
    oculto: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const labels = {
    publicado: "Publicado",
    borrador: "Borrador",
    oculto: "Oculto",
  };

  const estadoNormalizado = estado || "borrador";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        estilos[estadoNormalizado] || estilos.borrador
      }`}
    >
      {labels[estadoNormalizado] || estadoNormalizado}
    </span>
  );
}

function VisibleBadge({ estado }) {
  const visible = estado === "publicado";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        visible
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {visible ? "Visible" : "No visible"}
    </span>
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
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
