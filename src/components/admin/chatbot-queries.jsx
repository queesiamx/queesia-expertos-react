import React, { useEffect, useMemo, useState } from "react";

const API_URL = "https://queesia.com/api/listar_consultas_chatbot.php";
const ADMIN_KEY_STORAGE_KEY = "queesia_chatbot_admin_key";

export default function ChatbotQueriesAdmin() {
  const [adminKey, setAdminKey] = useState("");
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [provider, setProvider] = useState("");
  const [queries, setQueries] = useState([]);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [expandedQueryIds, setExpandedQueryIds] = useState(() => new Set());

    const hasKey = adminKey.trim().length > 0;

    useEffect(() => {
        const savedKey = window.localStorage.getItem(ADMIN_KEY_STORAGE_KEY);

    if (savedKey) {
        setAdminKey(savedKey);
    }
    }, []);

  const areaOptions = useMemo(() => {
    const areas = queries
      .map((item) => item.area_uso)
      .filter(Boolean);

    return Array.from(new Set(areas)).sort();
  }, [queries]);

  const stats = useMemo(() => {
  const total = queries.length;

  const areaCounts = {};
  const resultCounts = {};
  const providerCounts = {};

  queries.forEach((item) => {
    const area = item.area_uso || "Sin área";
    const result = item.resultado_esperado || "Sin resultado";
    const provider = item.provider || "Sin provider";

    areaCounts[area] = (areaCounts[area] || 0) + 1;
    resultCounts[result] = (resultCounts[result] || 0) + 1;
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;
  });

  const getTopItem = (counts) => {
    const entries = Object.entries(counts);

    if (entries.length === 0) {
      return {
        label: "Sin datos",
        count: 0,
      };
    }

    const [label, count] = entries.sort((a, b) => b[1] - a[1])[0];

    return {
      label,
      count,
    };
  };

  return {
    total,
    topArea: getTopItem(areaCounts),
    topResult: getTopItem(resultCounts),
    catalogCount: providerCounts.queesia_catalog_api || 0,
    mockCount: providerCounts.mock || 0,
  };
}, [queries]);

  const fetchQueries = async (page = 1) => {
    if (!hasKey) {
      setErrorMessage("Ingresa la clave administrativa para consultar los registros.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const params = new URLSearchParams({
        key: adminKey.trim(),
        limit: "25",
        page: String(page),
      });

      if (search.trim()) params.set("search", search.trim());
      if (area.trim()) params.set("area", area.trim());
      if (provider.trim()) params.set("provider", provider.trim());

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "No se pudieron cargar las consultas.");
      }

      window.localStorage.setItem(ADMIN_KEY_STORAGE_KEY, adminKey.trim());

        setQueries(Array.isArray(data.queries) ? data.queries : []);
        setMeta({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalRecords: data.totalRecords || 0,
        });

    } catch (error) {
      console.error("Error cargando consultas del chatbot:", error);
      setErrorMessage(error.message || "Ocurrió un error al cargar los registros.");
      setQueries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchQueries(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setArea("");
    setProvider("");
  };

  const handleAdminLogout = () => {
  window.localStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
  setAdminKey("");
  setQueries([]);
  setMeta({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });
  setErrorMessage("");
};

const toggleQueryApps = (queryId) => {
  setExpandedQueryIds((prev) => {
    const next = new Set(prev);

    if (next.has(queryId)) {
      next.delete(queryId);
    } else {
      next.add(queryId);
    }

    return next;
  });
};

const handleExportCsv = async () => {
  try {
    const params = new URLSearchParams({
      key: adminKey.trim(),
      export: "1",
    });

    if (search.trim()) params.set("search", search.trim());
    if (area.trim()) params.set("area", area.trim());
    if (provider.trim()) params.set("provider", provider.trim());

    const response = await fetch(
      `${API_URL}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "No se pudo exportar.");
    }

    const exportQueries = Array.isArray(data.queries)
      ? data.queries
      : [];

    const headers = [
      "id",
      "consulta",
      "area_uso",
      "resultado_esperado",
      "nivel_usuario",
      "preferencia_precio",
      "restricciones",
      "provider",
      "mode",
      "apps_recomendadas",
      "created_at",
    ];

    const rows = exportQueries.map((item) => {
      const apps = Array.isArray(item.apps_recomendadas)
        ? item.apps_recomendadas
            .map((app) => {
              const name = app.nombre || "App sin nombre";
              const category = app.categoria || "Sin categoría";
              const affinity = app.afinidad || "N/D";
              const url = app.url || "";

              return `${name} (${category}, ${affinity}) ${url}`.trim();
            })
            .join(" | ")
        : "";

      return [
        item.id,
        item.consulta,
        item.area_uso,
        item.resultado_esperado,
        item.nivel_usuario,
        item.preferencia_precio,
        item.restricciones,
        item.provider,
        item.mode,
        apps,
        item.created_at,
      ];
    });

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) =>
        row.map(escapeCsvValue).join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [`\uFEFF${csvContent}`],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      `queesia_chatbot_queries_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);

  } catch (error) {
    console.error(error);
    setErrorMessage(
      "No se pudo exportar el CSV completo."
    );
  }
};

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-10 text-slate-900">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-lime-700">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Consultas de QueesiaBot
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Revisa las búsquedas realizadas en el chatbot recomendador, las áreas
          detectadas, el proveedor usado y las apps recomendadas.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]"
      >
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Clave admin
          </span>
          <input
            type="password"
            value={adminKey}
            onChange={(event) => setAdminKey(event.target.value)}
            placeholder="Pega tu clave"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
            />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Buscar
          </span>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Consulta o app recomendada"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Área
          </span>
          <select
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
          >
            <option value="">Todas</option>
            {areaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Provider
          </span>
          <select
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200"
          >
            <option value="">Todos</option>
            <option value="queesia_catalog_api">Catálogo Queesia</option>
            <option value="mock">Mock / respaldo</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-lime-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {isLoading ? "Cargando..." : "Consultar"}
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-lime-400 hover:text-lime-700"
          >
            Limpiar
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {queries.length > 0 && (
  <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard
      title="Consultas cargadas"
      value={stats.total}
      detail="Registros visibles en esta página"
    />

    <StatCard
      title="Área más buscada"
      value={stats.topArea.label}
      detail={`${stats.topArea.count} consulta(s)`}
    />

    <StatCard
      title="Resultado más frecuente"
      value={stats.topResult.label}
      detail={`${stats.topResult.count} consulta(s)`}
    />

    <StatCard
      title="Fuente de resultados"
      value={`${stats.catalogCount} catálogo`}
      detail={`${stats.mockCount} fallback/mock`}
    />
  </div>
)}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Total de registros:{" "}
          <span className="font-semibold text-slate-900">
            {meta.totalRecords}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-2">
        <button
            type="button"
            disabled={isLoading || !hasKey}
            onClick={() => fetchQueries(meta.currentPage)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-lime-400 hover:text-lime-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
            Recargar
        </button>

        <button
          type="button"
          disabled={isLoading || queries.length === 0}
          onClick={handleExportCsv}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-lime-400 hover:text-lime-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Exportar CSV
        </button>

        <button
            type="button"
            disabled={isLoading || meta.currentPage <= 1}
            onClick={() => fetchQueries(meta.currentPage - 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
            Anterior
        </button>

        <span className="text-sm text-slate-500">
            Página {meta.currentPage} de {meta.totalPages}
        </span>

        <button
            type="button"
            disabled={isLoading || meta.currentPage >= meta.totalPages}
            onClick={() => fetchQueries(meta.currentPage + 1)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
            Siguiente
        </button>

        <button
            type="button"
            onClick={handleAdminLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100"
        >
            Salir
        </button>
        </div>
      </div>

      <div className="grid gap-4">
        {queries.map((item) => (
            <QueryCard
                key={item.id}
                item={item}
                isExpanded={expandedQueryIds.has(item.id)}
                onToggleApps={() => toggleQueryApps(item.id)}
            />
            ))}

        {!isLoading && queries.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No hay registros para mostrar.
          </div>
        )}
      </div>
    </section>
  );
}

function QueryCard({ item, isExpanded, onToggleApps }) {
  const apps = Array.isArray(item.apps_recomendadas)
    ? item.apps_recomendadas
    : [];

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Consulta #{item.id}
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {item.consulta}
          </h2>

          <p className="mt-2 text-xs text-slate-500">
            {formatDate(item.created_at)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge label={item.area_uso || "Sin área"} />
          <Badge label={item.resultado_esperado || "Sin resultado"} />
          <Badge label={item.provider || "Sin provider"} />
          <Badge label={item.mode || "Sin mode"} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
        <p>
          <span className="font-semibold text-slate-800">Nivel:</span>{" "}
          {item.nivel_usuario || "No especificado"}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Precio:</span>{" "}
          {item.preferencia_precio || "No especificado"}
        </p>
        <p>
          <span className="font-semibold text-slate-800">Restricciones:</span>{" "}
          {item.restricciones || "Sin restricciones"}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-800">
            Apps recomendadas ({apps.length})
            </p>

            <button
            type="button"
            onClick={onToggleApps}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-lime-400 hover:text-lime-700"
            >
            {isExpanded ? "Ocultar apps" : "Ver apps"}
            </button>
        </div>

        {isExpanded && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {apps.map((app, index) => (
                <a
                key={`${item.id}-${app.appId || index}`}
                href={app.url || "#"}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-lime-400 hover:bg-lime-50"
                >
                <p className="font-bold text-slate-950">
                    {app.nombre || "App sin nombre"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                    {app.categoria || "Sin categoría"}
                </p>
                <p className="mt-2 inline-flex rounded-full bg-lime-100 px-2 py-1 text-xs font-semibold text-lime-700">
                    Afinidad {app.afinidad || "N/D"}
                </p>
                </a>
            ))}

            {apps.length === 0 && (
                <p className="text-sm text-slate-500">
                No se guardaron apps recomendadas.
                </p>
            )}
            </div>
        )}
        </div>
    </article>
  );
}

function StatCard({ title, value, detail }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function Badge({ label }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
      {label}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "Sin fecha";

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
}