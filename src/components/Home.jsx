// src/pages/Expertos.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
// arriba, junto con tus imports
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

import { db } from "../firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertCard from "../components/ExpertCard";
import Footer from "../components/Footer"; // <-- ajusta la ruta si difiere

// ————————————————— Hero (mock)
function HeroExpertos() {
  return (
  <section className="relative overflow-hidden bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
<img
  src="/logo-bg.png"
  alt="Queesia"
  className="mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain drop-shadow-md"
/>



        <h1 className="mt-4 text-3xl sm:text-4xl font-montserrat font-bold text-center">
          Conecta con <span className="text-yellow-300">Expertos</span> en IA
        </h1>
        <p className="mt-2 text-white/85 text-center max-w-2xl mx-auto">
          Encuentra especialistas que pueden ayudarte a implementar IA en tus proyectos
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/10 px-5 py-4 text-center">
            <div className="text-2xl font-semibold">150+</div>
            <div className="text-white/80 text-sm">Expertos certificados</div>
          </div>
          <div className="rounded-xl bg-white/10 px-5 py-4 text-center">
            <div className="text-2xl font-semibold">4.8★</div>
            <div className="text-white/80 text-sm">Rating promedio</div>
          </div>
          <div className="rounded-xl bg-white/10 px-5 py-4 text-center">
            <div className="text-2xl font-semibold">2,500+</div>
            <div className="text-white/80 text-sm">Proyectos completados</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="#filtros"
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-white text-[#1e3a8a] font-semibold leading-none hover:opacity-90">
          Explorar Expertos
        </a>
        <a href="/registro"
          className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-emerald-600 text-white leading-none hover:bg-emerald-700">
          Convertirme en un Experto
        </a>
      </div>


      </div>
    </section>
  );
}

// ————————————————— Barra de filtros/búsqueda (mock)
function FiltrosBar({ query, setQuery, sort, setSort, chip, setChip }) {
  const chips = ["Mejor valorados", "Disponibles ahora", "Precio económico", "Respuesta rápida"];

  return (
    <section
  id="filtros"
  className="mx-auto max-w-6xl px-4 sm:px-6 -mt-2 md:-mt-4 lg:-mt-6 relative z-10"
>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <label className="flex-1 relative block">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar expertos por nombre, especialidad o tecnología…"
              className="w-full h-11 rounded-xl bg-white text-slate-900 placeholder-slate-400 border border-slate-300 focus:border-slate-400 focus:ring-0 px-4 pr-10"
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

          <div className="flex gap-2">
            <select className="h-11 w-full sm:w-auto rounded-xl bg-white text-slate-900 border border-slate-300 px-3">
              <option>Todas las especialidades</option>
            </select>
            <select className="h-11 w-full sm:w-auto rounded-xl bg-white text-slate-900 border border-slate-300 px-3">
              <option>Todos los servicios</option>
            </select>
            <select className="h-11 w-full sm:w-auto rounded-xl bg-white text-slate-900 border border-slate-300 px-3">
              <option>Cualquier precio</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-sm">Filtros rápidos:</span>
            {chips.map((t) => (
              <button
                key={t}
                onClick={() => setChip(chip === t ? "" : t)}
                className={`px-3.5 h-9 rounded-full text-sm border transition ${
                  chip === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:border-blue-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-xl bg-white text-slate-900 border border-slate-300 px-3"
            >
              <option value="relevance">Más relevantes</option>
              <option value="top">Mejor calificados</option>
              <option value="priceAsc">Precio: menor a mayor</option>
              <option value="priceDesc">Precio: mayor a menor</option>
              <option value="reviews">Más reseñas</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Expertos() {
  // ——— Estado de datos
  const [expertos, setExpertos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ——— Estado de UI (búsqueda/orden/chip + paginación)
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState(""); // chips “rápidos”
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // 👁️ contador (si no tienes backend, lo dejamos en null)
  const [visitas, setVisitas] = useState(null);

  useEffect(() => {
  const ref = doc(db, "metrics", "expertos"); // colección/ID a tu gusto
  const key = "visit:expertos";

  const run = async () => {
    try {
      // crea el doc si no existe
      await setDoc(ref, { visitas: 0 }, { merge: true });

      // evita contar varias veces en la misma sesión
      const firstTime = !sessionStorage.getItem(key);
      if (firstTime) {
        await updateDoc(ref, { visitas: increment(1) });
        sessionStorage.setItem(key, "1");
      }

      // lee el total
      const snap = await getDoc(ref);
      setVisitas(snap.data()?.visitas ?? 0);
    } catch (e) {
      console.error("contador visitas", e);
      setVisitas(0);
    }
  };

  run();
}, []);


  // ——— Carga Firestore (experts + contenidosExpertos)
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
    };
    cargar();
  }, []);

  // ——— Filtrado/orden
  const filtrados = useMemo(() => {
    let rows = [...expertos];

    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((x) => {
        const nombre = (x.nombre || "").toLowerCase();
        const especialidad = (x.especialidad || "").toLowerCase();
        const habilidades = (Array.isArray(x.habilidades) ? x.habilidades : []).join(" ").toLowerCase();
        return nombre.includes(q) || especialidad.includes(q) || habilidades.includes(q);
      });
    }

    if (chip) {
      if (chip === "Mejor valorados") rows.sort((a, b) => (b.calificacionPromedio || 0) - (a.calificacionPromedio || 0));
      if (chip === "Precio económico") rows.sort((a, b) => (a.precioHora || 0) - (b.precioHora || 0));
      // "Disponibles ahora" y "Respuesta rápida": aplica tu lógica si tienes esos campos
    }

    switch (sort) {
      case "top":
        rows.sort((a, b) => (b.calificacionPromedio || 0) - (a.calificacionPromedio || 0));
        break;
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
      // relevance: deja orden base
    }

    return rows;
  }, [expertos, query, chip, sort]);

  const visibles = useMemo(() => filtrados.slice(0, page * pageSize), [filtrados, page, pageSize]);

  return (
    <>
      <UnifiedNavbar />
      <main className="bg-white text-slate-900">
        <HeroExpertos />

        <FiltrosBar
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={(v) => {
            setSort(v);
            setPage(1);
          }}
          chip={chip}
          setChip={(v) => {
            setChip(v);
            setPage(1);
          }}
        />

        {/* Listado */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Expertos Disponibles</h2>
              <p className="text-slate-500 text-sm">{filtrados.length} especialistas encontrados</p>
            </div>
            <div />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cargando ? (
              <p className="text-center text-slate-500 col-span-full">Cargando expertos…</p>
            ) : visibles.length === 0 ? (
              <p className="text-center text-slate-500 col-span-full">No se encontraron expertos con esos filtros.</p>
            ) : (
              visibles.map((exp) => <ExpertCard key={exp.id} expert={exp} />)
            )}
          </div>

          {/* Paginación simple */}
          {visibles.length < filtrados.length && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
              >
                Cargar más expertos
              </button>
            </div>
          )}
        </section>

        {/* CTA final */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">¿Eres un experto en IA?</h3>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Únete a nuestra comunidad de especialistas y ayuda a empresas a implementar IA
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <a
                  href="/registro"
                  className="h-11 px-5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
                >
                  Registrarse como Experto
                </a>
                <a
                  href="/acerca"
                  className="h-11 px-5 rounded-xl border border-slate-300 text-slate-700 hover:border-blue-300"
                >
                  Conocer más
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 👁️ Contador visible */}
        <div className="bg-white border-t border-slate-100">
          <p className="text-center text-xs text-slate-500 py-2">
            Visitas: {visitas ?? "…"}
          </p>
        </div>

        {/* Footer del sitio */}
        <Footer />
      </main>
    </>
  );
}
