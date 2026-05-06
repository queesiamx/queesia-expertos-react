import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "https://queesia.com";

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  admin_token: "",
  name: "",
  url: "",
  short_description: "",
  category: "",
  main_functionality: "",
  tags: "",
  what_is: "",
  purpose: "",
  use_cases: "",
  main_advantages: "",
  long_description: "",
  release_date: "",
  developer: "",
  main_model: "",
  pricing_plans: "",
  license: "",
  security_privacy: "",
  integration: "",
  logo_filename: "",
  created_at: today,
};

const initialNewsItem = {
  success_type: "",
  title: "",
  description: "",
  url: "",
};

export default function AdminCargarApp() {
  const [form, setForm] = useState(initialForm);
  const [sourcesText, setSourcesText] = useState("");
  const [news, setNews] = useState([{ ...initialNewsItem }]);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNewsItem = (index, field, value) => {
    setNews((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addNewsItem = () => {
    setNews((prev) => [...prev, { ...initialNewsItem }]);
  };

  const removeNewsItem = (index) => {
    setNews((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
  const cargarCategorias = async () => {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const res = await fetch(`${API_BASE}/api/obtener_categorias.php`);
      const data = await res.json();

      if (!res.ok || !data.success || !Array.isArray(data.categories)) {
        throw new Error("No se pudieron cargar las categorías.");
      }

      setCategories(data.categories);
    } catch (err) {
      const message = err.message || "Error al cargar categorías.";
      setCategoriesError(message);
      toast.error(message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  cargarCategorias();
}, []);


  const buildPayload = () => {
    const sources = sourcesText
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const cleanNews = news
      .map((item) => ({
        success_type: item.success_type.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
        url: item.url.trim(),
      }))
      .filter(
        (item) =>
          item.success_type || item.title || item.description || item.url
      );

    return {
      ...form,
      admin_token: form.admin_token.trim(),
      name: form.name.trim(),
      url: form.url.trim(),
      short_description: form.short_description.trim(),
      category: form.category.trim(),
      main_functionality: form.main_functionality.trim(),
      tags: form.tags,
      what_is: form.what_is.trim(),
      purpose: form.purpose.trim(),
      use_cases: form.use_cases.trim(),
      main_advantages: form.main_advantages.trim(),
      long_description: form.long_description.trim(),
      release_date: form.release_date.trim(),
      developer: form.developer.trim(),
      main_model: form.main_model.trim(),
      pricing_plans: form.pricing_plans.trim(),
      license: form.license.trim(),
      security_privacy: form.security_privacy.trim(),
      integration: form.integration.trim(),
      logo_filename: form.logo_filename.trim(),
      created_at: form.created_at,
      sources,
      news: cleanNews,
    };
  };

  const validateForm = () => {
    if (!form.admin_token.trim()) {
      return "Ingresa el token de administración.";
    }

    if (!form.name.trim()) {
      return "El nombre de la app es obligatorio.";
    }

    if (!form.url.trim()) {
      return "La URL oficial es obligatoria.";
    }

    if (!form.short_description.trim()) {
      return "La descripción corta es obligatoria.";
    }

    if (!form.category.trim()) {
      return "La categoría es obligatoria.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      const res = await fetch(`${API_BASE}/api/guardar_app.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar la app.");
      }

      setResult(data);
      toast.success(data.message || "App guardada correctamente.");
    } catch (err) {
      const message = err.message || "Error al guardar la app.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setSourcesText("");
    setNews([{ ...initialNewsItem }]);
    setResult(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-yellow-600">
            Panel administrativo
          </p>

          <h1 className="text-3xl font-extrabold text-slate-950">
            Cargar nueva app
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Registra una nueva aplicación en el catálogo dinámico de Queesia. La
            app se guardará en MySQL y podrá visualizarse sin regenerar la dist
            del sitio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Datos básicos
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Token de administración"
                type="password"
                value={form.admin_token}
                onChange={(value) => updateField("admin_token", value)}
                placeholder="Ingresa el token admin"
                required
              />

              <Field
                label="Nombre de la app"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Ej. Gamma"
                required
              />

              <Field
                label="URL oficial"
                value={form.url}
                onChange={(value) => updateField("url", value)}
                placeholder="https://..."
                required
              />

              <SelectField
                label="Categoría"
                value={form.category}
                onChange={(value) => updateField("category", value)}
                options={categories}
                placeholder={
                    categoriesLoading ? "Cargando categorías..." : "Selecciona una categoría"
                }
                required
                helper={
                    categoriesError
                    ? "No se pudieron cargar las categorías. Revisa la API."
                    : "Selecciona una categoría existente para evitar duplicados."
                }
                />

              <Field
                label="Logo filename"
                value={form.logo_filename}
                onChange={(value) => updateField("logo_filename", value)}
                placeholder="Opcional. Ej. id_1500_nombreapp"
                helper="Puedes dejarlo vacío. Al guardar, se generará automáticamente con el formato id_ID_nombreapp. Luego sube el archivo .png con ese nombre a /logos/."
              />

              <Field
                label="Fecha de ingreso"
                type="date"
                value={form.created_at}
                onChange={(value) => updateField("created_at", value)}
              />
            </div>

            <div className="mt-5">
              <TextArea
                label="Descripción corta"
                value={form.short_description}
                onChange={(value) => updateField("short_description", value)}
                placeholder="Descripción breve para tarjetas y listados."
                required
                rows={3}
              />
            </div>
          </section>

          {/* Contenido principal */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Contenido de la ficha
            </h2>

            <div className="grid gap-5">
              <TextArea
                label="Funcionalidad principal"
                value={form.main_functionality}
                onChange={(value) => updateField("main_functionality", value)}
                rows={3}
              />

              <TextArea
                label="Tags"
                value={form.tags}
                onChange={(value) => updateField("tags", value)}
                placeholder="Productividad, Presentaciones, IA Generativa"
                helper="Puedes separarlos por coma o salto de línea. La API les agrega # automáticamente."
                rows={2}
              />

              <TextArea
                label="¿Qué es?"
                value={form.what_is}
                onChange={(value) => updateField("what_is", value)}
                rows={4}
              />

              <TextArea
                label="¿Para qué sirve?"
                value={form.purpose}
                onChange={(value) => updateField("purpose", value)}
                rows={4}
              />

              <TextArea
                label="Casos de uso"
                value={form.use_cases}
                onChange={(value) => updateField("use_cases", value)}
                rows={4}
              />

              <TextArea
                label="Principales ventajas"
                value={form.main_advantages}
                onChange={(value) => updateField("main_advantages", value)}
                rows={4}
              />

              <TextArea
                label="Descripción larga"
                value={form.long_description}
                onChange={(value) => updateField("long_description", value)}
                rows={5}
              />
            </div>
          </section>

          {/* Datos técnicos/comerciales */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Datos técnicos y comerciales
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Fecha de lanzamiento"
                value={form.release_date}
                onChange={(value) => updateField("release_date", value)}
                placeholder="Ej. 2024 / No especificada"
              />

              <Field
                label="Desarrollador / compañía"
                value={form.developer}
                onChange={(value) => updateField("developer", value)}
                placeholder="Ej. OpenAI"
              />

              <Field
                label="Modelo o algoritmo principal"
                value={form.main_model}
                onChange={(value) => updateField("main_model", value)}
                placeholder="Ej. No especificado"
              />

              <Field
                label="Licencia"
                value={form.license}
                onChange={(value) => updateField("license", value)}
                placeholder="Ej. Propietaria / Open source"
              />
            </div>

            <div className="mt-5 grid gap-5">
              <TextArea
                label="Precio o planes de suscripción"
                value={form.pricing_plans}
                onChange={(value) => updateField("pricing_plans", value)}
                rows={3}
              />

              <TextArea
                label="Seguridad y privacidad"
                value={form.security_privacy}
                onChange={(value) => updateField("security_privacy", value)}
                rows={3}
              />

              <TextArea
                label="Integración con otras herramientas"
                value={form.integration}
                onChange={(value) => updateField("integration", value)}
                rows={3}
              />
            </div>
          </section>

          {/* Fuentes */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Fuentes
            </h2>

            <TextArea
              label="URLs de fuentes"
              value={sourcesText}
              onChange={setSourcesText}
              placeholder={`https://sitio-oficial.com/\nhttps://otra-fuente.com/`}
              helper="Una URL por línea. También acepta comas."
              rows={4}
            />
          </section>

          {/* News / casos */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Casos de éxito / noticias
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Puedes dejar esta sección vacía si no aplica.
                </p>
              </div>

              <button
                type="button"
                onClick={addNewsItem}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Agregar caso
              </button>
            </div>

            <div className="space-y-5">
              {news.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-bold text-slate-800">
                      Caso / noticia {index + 1}
                    </h3>

                    {news.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNewsItem(index)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label="Tipo"
                      value={item.success_type}
                      onChange={(value) =>
                        updateNewsItem(index, "success_type", value)
                      }
                      placeholder="Ej. Gobierno / Empresa / Prueba"
                    />

                    <Field
                      label="Título"
                      value={item.title}
                      onChange={(value) =>
                        updateNewsItem(index, "title", value)
                      }
                    />

                    <div className="md:col-span-2">
                      <TextArea
                        label="Descripción"
                        value={item.description}
                        onChange={(value) =>
                          updateNewsItem(index, "description", value)
                        }
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Field
                        label="URL"
                        value={item.url}
                        onChange={(value) =>
                          updateNewsItem(index, "url", value)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mensajes */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
              <p className="font-bold">{result.message}</p>
              <p className="mt-1 text-sm">
                ID generado: <strong>{result.app_id}</strong>
              </p>
              {result.expected_logo_file && (
                <p className="mt-1 text-sm">
                  Logo esperado: <strong>{result.expected_logo_file}</strong>
                </p>
              )}
              <a
                href={result.app_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Ver ficha pública
              </a>
            </div>
          )}

          {/* Acciones */}
          <section className="sticky bottom-0 z-10 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Revisa los datos antes de guardar. La app se publicará
                dinámicamente en el catálogo.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-extrabold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar app"}
                </button>
              </div>
            </div>
          </section>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  helper = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
      />

      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Selecciona una opción",
  required = false,
  helper = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {helper && (
        <span
          className={`mt-1 block text-xs ${
            helper.includes("No se pudieron") ? "text-red-500" : "text-slate-500"
          }`}
        >
          {helper}
        </span>
      )}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
  required = false,
  helper = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
      />

      {helper && <span className="mt-1 block text-xs text-slate-500">{helper}</span>}
    </label>
  );
}