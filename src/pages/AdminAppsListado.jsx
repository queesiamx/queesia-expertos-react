import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "https://queesia.com";

const DEFAULT_LOGO_URL = "https://queesia.com/logos/default-logo.png";

function getLogoUrl(logoFilename) {
  if (!logoFilename) return DEFAULT_LOGO_URL;

  const filename = String(logoFilename).split("/").pop().trim();

  if (!filename) return DEFAULT_LOGO_URL;

  const hasExtension = /\.(png|jpg|jpeg|webp|svg)$/i.test(filename);

  return `https://queesia.com/logos/${
    hasExtension ? filename : `${filename}.png`
  }`;
}

function handleLogoError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = DEFAULT_LOGO_URL;
}

export default function AdminAppsListado() {
  const [adminToken, setAdminToken] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(25);
  const [apps, setApps] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cargarApps = async () => {
    setError("");

    if (!adminToken.trim()) {
      const message = "Ingresa el token de administración.";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/listar_apps_admin.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_token: adminToken.trim(),
          query: query.trim(),
          limit: Number(limit),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudieron cargar las apps.");
      }

      setApps(Array.isArray(data.apps) ? data.apps : []);
      toast.success(`Apps cargadas: ${data.total || 0}`);
    } catch (err) {
      const message = err.message || "Error al cargar apps.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, label = "Texto") => {
    if (!text) {
      toast.error("No hay texto para copiar.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado.`);
    } catch {
      toast.error("No se pudo copiar al portapapeles.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-yellow-600">
            Panel administrativo
          </p>

          <h1 className="text-3xl font-extrabold text-slate-950">
            Listado de apps
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Revisa las apps más recientes, abre su ficha pública, edítalas o
            copia el nombre esperado del logo.
          </p>
        </div>

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-900">
            Buscar apps
          </h2>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr_160px_auto] md:items-end">
            <Field
              label="Token de administración"
              type="password"
              value={adminToken}
              onChange={setAdminToken}
              placeholder="Ingresa el token admin"
            />

            <Field
              label="Buscar por ID, nombre o categoría"
              value={query}
              onChange={setQuery}
              placeholder="Ej. 1496, Enhancor, Edición de imágenes"
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Límite
              </span>

              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>

            <button
              type="button"
              onClick={cargarApps}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Cargando..." : "Cargar"}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Resultados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {apps.length
                  ? `${apps.length} apps cargadas en la vista.`
                  : "Carga apps para ver resultados."}
              </p>
            </div>
          </div>

          {apps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
              Aún no hay apps para mostrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">App</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Logo esperado</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id} className="rounded-2xl bg-slate-50">
                      <td className="rounded-l-2xl px-3 py-4">
                        <div className="flex min-w-[280px] items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
                            <img
                              src={getLogoUrl(app.logo_filename)}
                              alt={`Logo de ${app.name}`}
                              className="h-10 w-10 object-contain"
                              onError={handleLogoError}
                            />
                          </div>

                          <div>
                            <p className="font-extrabold text-slate-900">
                              #{app.id} · {app.name}
                            </p>
                            <p className="mt-1 max-w-md line-clamp-2 text-sm text-slate-500">
                              {app.short_description || "Sin descripción corta"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4">
                        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                          {app.category || "Sin categoría"}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-600">
                        {app.created_at || "Sin fecha"}
                      </td>

                      <td className="px-3 py-4">
                        {app.expected_logo_file ? (
                          <button
                            type="button"
                            onClick={() =>
                              copyText(app.expected_logo_file, "Logo esperado")
                            }
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            title="Copiar logo esperado"
                          >
                            {app.expected_logo_file}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Sin logo_filename
                          </span>
                        )}
                      </td>

                      <td className="rounded-r-2xl px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <a
                            href={app.app_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            Ver
                          </a>

                          <a
                            href={`/admin/apps/editar?id=${app.id}`}
                            className="rounded-xl bg-yellow-400 px-3 py-2 text-xs font-extrabold text-slate-950 hover:bg-yellow-300"
                          >
                            Editar
                          </a>

                          {app.logo_upload_path && (
                            <button
                              type="button"
                              onClick={() =>
                                copyText(app.logo_upload_path, "Ruta de logo")
                              }
                              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700"
                            >
                              Copiar ruta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
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
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
      />
    </label>
  );
}