import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "https://queesia.com";

const initialForm = {
  admin_token: "",
  id: "",
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
  created_at: "",
};

const initialNewsItem = {
  success_type: "",
  title: "",
  description: "",
  url: "",
};

function dateToInput(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function tagsToText(tags) {
  if (!tags) return "";

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).replace(/^#/, "").trim())
      .filter(Boolean)
      .join(", ");
  }

  return String(tags)
    .split(",")
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
    .join(", ");
}

function sourcesToText(sources) {
  if (!sources) return "";

  if (Array.isArray(sources)) {
    return sources
      .map((item) => {
        if (typeof item === "string") return item;
        return item.source_url || item.url || "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return String(sources);
}

function normalizeNews(news) {
  if (!Array.isArray(news) || news.length === 0) {
    return [{ ...initialNewsItem }];
  }

  return news.map((item) => ({
    success_type: item.success_type || "",
    title: item.title || "",
    description: item.description || "",
    url: item.url || "",
  }));
}

export default function AdminEditarApp() {
  const [form, setForm] = useState(initialForm);
  const [searchId, setSearchId] = useState("");
  const [sourcesText, setSourcesText] = useState("");
  const [news, setNews] = useState([{ ...initialNewsItem }]);

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [loadingApp, setLoadingApp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get("id");

    if (idFromUrl) {
      setSearchId(idFromUrl);
      cargarAppPorId(idFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarAppPorId = async (idValue = searchId) => {
    const cleanId = String(idValue || "").trim();

    if (!cleanId) {
      toast.error("Ingresa el ID de la app.");
      return;
    }

    setLoadingApp(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/obtener_app.php?id=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo obtener la app.");
      }

      const app = data.app || data.tool || data.data || data;

      if (!app || !app.id) {
        throw new Error("La API no devolvió una app válida.");
      }

      const appSources = data.sources || app.sources || [];
      const appNews = data.news || app.news || [];

      setForm({
        admin_token: form.admin_token || "",
        id: String(app.id || cleanId),
        name: app.name || "",
        url: app.url || "",
        short_description: app.short_description || "",
        category: app.category || "",
        main_functionality: app.main_functionality || "",
        tags: tagsToText(app.tags),
        what_is: app.what_is || "",
        purpose: app.purpose || "",
        use_cases: app.use_cases || "",
        main_advantages: app.main_advantages || "",
        long_description: app.long_description || "",
        release_date: app.release_date || "",
        developer: app.developer || "",
        main_model: app.main_model || "",
        pricing_plans: app.pricing_plans || "",
        license: app.license || "",
        security_privacy: app.security_privacy || "",
        integration: app.integration || "",
        logo_filename: app.logo_filename || "",
        created_at: dateToInput(app.created_at),
      });

      setSourcesText(sourcesToText(appSources));
      setNews(normalizeNews(appNews));

      toast.success(`App ${app.id} cargada correctamente.`);
    } catch (err) {
      const message = err.message || "Error al cargar la app.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingApp(false);
    }
  };

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
      id: Number(form.id),
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

    if (!form.id || Number(form.id) <= 0) {
      return "Carga una app válida antes de guardar.";
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

      const res = await fetch(`${API_BASE}/api/actualizar_app.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo actualizar la app.");
      }

      setResult(data);
      toast.success(data.message || "App actualizada correctamente.");
    } catch (err) {
      const message = err.message || "Error al actualizar la app.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetEditor = () => {
    setForm(initialForm);
    setSearchId("");
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
            Editar app existente
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Busca una app por ID, edita sus campos y guarda los cambios en el
            catálogo dinámico de Queesia.
          </p>
        </div>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Buscar app
          </h2>

          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <Field
              label="ID de la app"
              value={searchId}
              onChange={setSearchId}
              placeholder="Ej. 1503"
            />

            <button
              type="button"
              onClick={() => cargarAppPorId()}
              disabled={loadingApp}
              className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingApp ? "Cargando..." : "Cargar app"}
            </button>

            <button
              type="button"
              onClick={resetEditor}
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Limpiar
            </button>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                label="ID"
                value={form.id}
                onChange={(value) => updateField("id", value)}
                placeholder="Se carga automáticamente"
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
                  categoriesLoading
                    ? "Cargando categorías..."
                    : "Selecciona una categoría"
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
                placeholder="Ej. id_1503_higgsfield"
                helper="Sin extensión. Si lo dejas vacío, se generará con el formato id_ID_nombreapp."
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

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700">
              <p className="font-bold">{result.message}</p>

              <p className="mt-1 text-sm">
                ID actualizado: <strong>{result.app_id}</strong>
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

          <section className="sticky bottom-0 z-10 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Revisa los cambios antes de guardar. Esta acción actualizará la
                ficha pública de la app.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-yellow-400 px-6 py-3 font-extrabold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
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

      {helper && (
        <span className="mt-1 block text-xs text-slate-500">{helper}</span>
      )}
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
            helper.includes("No se pudieron")
              ? "text-red-500"
              : "text-slate-500"
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

      {helper && (
        <span className="mt-1 block text-xs text-slate-500">{helper}</span>
      )}
    </label>
  );
}