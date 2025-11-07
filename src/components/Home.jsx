// src/pages/Expertos.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
// arriba, junto con tus imports
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp  } from "firebase/firestore";
import SocialBubblesHybrid from "@/components/social/SocialBubblesHybrid";
import { db } from "@/firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertCard from "../components/ExpertCard";
import Footer from "../components/Footer"; // <-- ajusta la ruta si difiere
import ExpertsBrowser from "./ExpertsBrowser";
 //import { doc, getDoc } from "firebase/firestore";
 import { trackVisit } from "../services/analytics"; // ruta relativa desde /src/pages


// ————————————————— Hero (mock)
// ————————————————— Hero (light, estilo queesia.com)
// ————————————————— Hero (light, estilo queesia.com)
function HeroExpertos() {
  return (
   <section id="expertos-hero" className="relative isolate overflow-hidden bg-slate-50 text-slate-900">
      {/* Circulitos suaves opcionales */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-24 -left-24 h-72 w-72 md:h-80 md:w-80 rounded-full opacity-70"
          style={{background:"radial-gradient(closest-side, rgba(226,232,240,.35), rgba(226,232,240,.15) 60%, rgba(226,232,240,0) 70%)"}}
        />
        <div
          className="absolute -bottom-32 -right-28 h-80 w-80 md:h-[24rem] md:w-[24rem] rounded-full opacity-70"
          style={{background:"radial-gradient(closest-side, rgba(226,232,240,.35), rgba(226,232,240,.15) 60%, rgba(226,232,240,0) 70%)"}}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 text-center">
        {/* Mascota */}
        <div className="mx-auto mb-6 flex items-center justify-center">
          <img src="/logo-bg.png" alt="Queesia" className="h-36 w-36 md:h-36 md:w-36 object-contain" />
        </div>

        {/* Título según Font Picker (Montserrat, 36px, 700, 40px) */}
        <h1 className="font-montserrat text-[36px] leading-[40px] font-bold tracking-normal text-slate-900 not-italic">
          Conecta con <span className="text-yellow-300">Expertos</span> en IA
        </h1>



        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Encuentra especialistas que pueden ayudarte a implementar IA en tus proyectos — con experiencia verificada y respuesta rápida.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#filtros"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-700 px-5 font-semibold leading-none text-white shadow hover:bg-blue-800"
          >
            Explorar Expertos
          </a>
          <a
            href="/registro"
            className="btn btn-lg btn-expert">
          
            Convertirme en un Experto
          </a>
        </div>

        {/* Métricas (tarjetas claras) */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold">150+</div>
            <div className="mt-0.5 text-sm text-slate-600">Expertos verificados</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold">4.8 <span className="text-yellow-300">★</span></div>
            <div className="mt-0.5 text-sm text-slate-600">Rating promedio</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold">2,500+</div>
            <div className="mt-0.5 text-sm text-slate-600">Proyectos completados</div>
          </div>
        </div>
      </div>

            {/* slot para las burbujas (debajo de métricas) */}
      <div className="bubbles-slot h-16 md:h-20" />
      {/* sentinela para cambiar a modo dock al hacer scroll */}
      <div id="bubbles-sentinel" className="h-px" />
    </section>


    
  );
}


// ————————————————— Barra de filtros/búsqueda (mock)
function FiltrosBar({ query, setQuery, sort, setSort, chip, setChip }) {
  const chips = ["Mejor valorados", "Disponibles ahora", "Precio económico", "Respuesta rápida"];

  return (
<section
  id="filtros"
  className="page-shell relative z-10 scroll-mt-28 text-slate-900"
>
      <div className="filters-card px-4 sm:px-6 py-4">
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
  const [visitas, setVisitas] = useState(0);
  const PAGE_KEY = "expertos"; // sin slash; estable para esta vista
  
  useEffect(() => {
  // No cuentes en desarrollo
  // 1) Enviar visita a la API (excluye equipo)
   trackVisit(PAGE_KEY);

   // 2) Leer el agregado diario generado por la API
   (async () => {
     const today = new Date().toISOString().slice(0, 10);
     const aggRef = doc(db, "page_stats_daily", `${PAGE_KEY}__${today}`);
     const snap = await getDoc(aggRef).catch(() => null);
     setVisitas(snap?.exists() ? (snap.data().visits || 0) : 0);
   })();
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
        
            {/* monta el híbrido */}

            <SocialBubblesHybrid
              sectionId="expertos-hero"
              anchor="#expertos-hero .bubbles-slot"
              sentinel="#bubbles-sentinel"
              maxXvw={46}
              dockLeftPx={16}
            />


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
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
  <a href="/registro" className="btn btn-lg btn-expert">Registrarse como Experto</a>
  <a href="/terminos" className="inline-flex h-11 items-center justify-center rounded-xl bg-gray-400 px-5 font-semibold leading-none text-white shadow hover:bg-blue-800"
          >Saber más</a>
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
