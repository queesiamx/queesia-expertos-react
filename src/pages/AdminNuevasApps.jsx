import { useEffect, useState } from "react";

const API_BASE = "https://queesia.com";

export default function AdminNuevasApps() {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [adminToken, setAdminToken] = useState("");

  const [apps, setApps] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/obtener_nuevas_apps.php?limit=100`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "No se pudo cargar la configuración.");
      }

      setFechaInicio(data.config?.fecha_inicio || "");
      setFechaFin(data.config?.fecha_fin || "");
      setApps(data.tools || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar las apps nuevas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarRango = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    if (!fechaInicio || !fechaFin) {
      setError("Selecciona fecha inicial y fecha final.");
      setSaving(false);
      return;
    }

    if (!adminToken.trim()) {
      setError("Ingresa el token de administración.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/guardar_rango_nuevas.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_token: adminToken.trim(),
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo guardar el rango.");
      }

      setMessage(data.message || "Rango actualizado correctamente.");
      await cargarDatos();
    } catch (err) {
      setError(err.message || "Error al guardar el rango.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-yellow-600">
            Panel administrativo
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Control de apps nuevas
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600">
            Define el rango de fechas que se usará para mostrar las aplicaciones
            recién agregadas en el home y en la sección de nuevas apps.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={guardarRango}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Configurar rango
            </h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha inicial
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Fecha final
                </label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Token de administración
                </label>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Ingresa el token admin"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {message && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar rango"}
              </button>

              <button
                type="button"
                onClick={cargarDatos}
                className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Recargar vista previa
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Vista previa
                </h2>
                <p className="text-sm text-slate-500">
                  Apps dentro del rango configurado actualmente.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Total: {total}
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                Cargando apps nuevas...
              </div>
            ) : apps.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                No hay apps dentro del rango seleccionado.
              </div>
            ) : (
              <div className="grid gap-4">
                {apps.map((app) => (
                  <article
                    key={app.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {app.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-600">
                          {app.short_description}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {app.category && (
                            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                              {app.category}
                            </span>
                          )}

                          {app.created_at && (
                            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                              {app.created_at}
                            </span>
                          )}
                        </div>
                      </div>

                      <a
                        href={`https://queesia.com/app/${app.id}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Ver ficha
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}