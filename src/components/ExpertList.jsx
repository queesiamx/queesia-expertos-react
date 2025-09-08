import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ExpertCard from "./ExpertCard";
import { useNavigate } from "react-router-dom";

export default function ExpertList() {
  const [expertos, setExpertos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Filtros/orden
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("Todos");
  const [sort, setSort] = useState("top"); // top | priceAsc | priceDesc | reviews

  const navigate = useNavigate();

  // 🔄 Cargar expertos + servicios desde Firestore (como en tu versión actual)
  useEffect(() => {
    const cargar = async () => {
      try {
        const expertosSnap = await getDocs(collection(db, "experts"));
        const expertosAprobados = expertosSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((e) => e.aprobado === true);

        const serviciosSnap = await getDocs(collection(db, "contenidosExpertos"));
        const serviciosPorExperto = {};
        serviciosSnap.docs.forEach((doc) => {
          const data = doc.data();
          const uid = data.expertoId;
          if (!serviciosPorExperto[uid]) serviciosPorExperto[uid] = [];
          serviciosPorExperto[uid].push(data);
        });

        const expertosConServicios = expertosAprobados.map((e) => ({
          ...e,
          servicios: serviciosPorExperto[e.id] || [],
        }));

        setExpertos(expertosConServicios);
      } catch (err) {
        console.error("Error cargando expertos:", err);
      } finally {
        setCargando(false);
      }

      // 🎨 Variables CSS (colores del mock)
      const root = document.documentElement;
      root.style.setProperty("--bg", "#0b0d12");
      root.style.setProperty("--card", "#0f131b");
      root.style.setProperty("--surface", "#121725");
      root.style.setProperty("--overlay", "#0b0f1a");
      root.style.setProperty("--text", "#f3f5f7");
      root.style.setProperty("--subtext", "#9aa3af");
      root.style.setProperty("--primary", "#ffd166");
      root.style.setProperty("--primaryText", "#111827");
      root.style.setProperty("--ring", "#1f2937");
    };

    cargar();
  }, []);

  // Chips (ajusta si usas categorías distintas)
  const chips = [
    "Todos",
    "Auditoría",
    "Gobierno",
    "Petróleo y Gas",
    "Marketing",
    "Automatización",
    "Capacitación",
  ];

  // 🔎 Filtrado + Orden
  const filtrados = useMemo(() => {
    let rows = [...expertos];

    if (chip !== "Todos") {
      rows = rows.filter((x) => Array.isArray(x.tags) && x.tags.includes(chip));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((x) => {
        const nombre = (x.nombre || "").toLowerCase();
        const especialidad = (x.especialidad || "").toLowerCase();
        const habilidades = (Array.isArray(x.habilidades) ? x.habilidades : [])
          .join(" ")
          .toLowerCase();
        return nombre.includes(q) || especialidad.includes(q) || habilidades.includes(q);
      });
    }

    switch (sort) {
      case "priceAsc":
        rows.sort((a, b) => (a.precioHora || 0) - (b.precioHora || 0));
        break;
      case "priceDesc":
        rows.sort((a, b) => (b.precioHora || 0) - (a.precioHora || 0));
        break;
      case "reviews":
        rows.sort((a, b) => (b.totalResenas || 0) - (a.totalResenas || 0));
        break;
      default:
        rows.sort((a, b) => (b.calificacionPromedio || 0) - (a.calificacionPromedio || 0));
    }

    return rows;
  }, [expertos, chip, query, sort]);

  return (
    <div className="w-full bg-transparent text-inherit">
      {/* Header sticky como en el mock */}
      <section className="hidden sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--overlay)/0.5] border-b border-[var(--ring)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-[var(--card)] ring-1 ring-[var(--ring)]">
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20Zm1 14H8v-2h5v2Zm3-4H8V8h8v4Z"
                />
              </svg>
            </span>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight">Expertos</h1>
            <span className="hidden sm:inline text-[13px] text-[var(--subtext)]">
              Conecta con especialistas verificados.
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <label className="w-full relative block">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, rol, habilidad…"
                className="w-full h-11 rounded-2xl bg-[var(--card)] text-[var(--text)] placeholder-[var(--subtext)] ring-1 ring-[var(--ring)] outline-none px-4 pr-10 focus:ring-2 focus:ring-[var(--primary)]/50 transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M10 4a6 6 0 104.472 10.03l3.749 3.75 1.414-1.415-3.75-3.748A6 6 0 0010 4Zm0 2a4 4 0 110 8 4 4 0 010-8Z"
                  />
                </svg>
              </span>
            </label>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 rounded-2xl bg-[var(--card)] text-[var(--text)] ring-1 ring-[var(--ring)] px-3 focus:outline-none"
            >
              <option value="top">Mejor calificados</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="reviews">Más reseñas</option>
            </select>
          </div>
        </div>

        {/* Chips */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-4 overflow-x-auto">
          <div className="flex gap-2">
            {chips.map((t) => (
              <button
                key={t}
                onClick={() => setChip(t)}
                className={`px-3.5 h-9 rounded-full text-sm whitespace-nowrap border transition ${
                  chip === t
                    ? "bg-[var(--primary)] text-[var(--primaryText)] border-transparent"
                    : "bg-[var(--card)]/60 text-[var(--text)] border-[var(--ring)] hover:border-[var(--primary)]/40"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de tarjetas */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cargando ? (
            <p className="text-center text-[var(--subtext)] col-span-full">Cargando expertos…</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-[var(--subtext)] col-span-full">
              No se encontraron expertos con esos filtros.
            </p>
          ) : (
            filtrados.map((exp) => <ExpertCard key={exp.id} expert={exp} />)
          )}
        </div>
      </section>

      {/* CTA inferior */}
      <footer className="hidden mx-auto max-w-6xl px-4 sm:px-6 pb-12">
        <div className="rounded-[2rem] bg-[var(--surface)] ring-1 ring-[var(--ring)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold">¿Eres experto/a? Únete a Queesia</h3>
            <p className="text-[var(--subtext)] text-sm mt-1">
              Crea tu perfil, ofrece cursos y servicios, y llega a nuevos clientes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/registro")}
              className="h-11 px-5 rounded-2xl bg-[var(--primary)] text-[var(--primaryText)] font-medium"
            >
              Crear perfil
            </button>
            <button
              onClick={() => navigate("/terminos")}
              className="h-11 px-5 rounded-2xl bg-[var(--card)] ring-1 ring-[var(--ring)]"
            >
              Saber más
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
