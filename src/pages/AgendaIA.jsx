import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import AgendaEventCard from "@/components/calendario/AgendaEventCard";

const API_URL = "https://queesia.com/api/calendario/obtener_eventos.php";

export default function AgendaIA() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [modalidad, setModalidad] = useState("todas");
  const [mes, setMes] = useState("todos");

  useEffect(() => {
    async function cargarEventos() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setEventos(Array.isArray(data.eventos) ? data.eventos : []);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarEventos();
  }, []);

  const categorias = useMemo(() => {
    return [...new Set(eventos.map((e) => e.categoria).filter(Boolean))];
  }, [eventos]);

  const modalidades = useMemo(() => {
    return [...new Set(eventos.map((e) => e.modalidad).filter(Boolean))];
  }, [eventos]);

  const meses = useMemo(() => {
    return [
      ...new Set(eventos.map((e) => e.fecha_inicio?.slice(0, 7)).filter(Boolean)),
    ].sort();
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();

    return eventos.filter((evento) => {
      const texto = `
        ${evento.titulo || ""}
        ${evento.descripcion_corta || ""}
        ${evento.categoria || ""}
        ${evento.tipo_evento || ""}
        ${evento.modalidad || ""}
        ${evento.ciudad || ""}
        ${evento.tags || ""}
      `.toLowerCase();

      const coincideBusqueda = !q || texto.includes(q);
      const coincideCategoria =
        categoria === "todas" || evento.categoria === categoria;
      const coincideModalidad =
        modalidad === "todas" || evento.modalidad === modalidad;
      const coincideMes =
        mes === "todos" || evento.fecha_inicio?.startsWith(mes);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincideModalidad &&
        coincideMes
      );
    });
  }, [eventos, busqueda, categoria, modalidad, mes]);

  return (
    <>
      <UnifiedNavbar />

      <main className="min-h-screen bg-transparent px-4 pb-20 pt-12 text-slate-900 sm:px-6">
        <section className="mx-auto max-w-6xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/60 bg-white/55 shadow-xl backdrop-blur-xl">
            <CalendarDays className="h-10 w-10 text-indigo-500" />
          </div>

          <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-indigo-500">
            Queesia
          </p>

          <h1 className="font-montserrat text-4xl font-extrabold italic tracking-tight text-slate-900 sm:text-5xl">
            Agenda <span className="text-sky-500">IA</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
            Eventos, webinars, congresos y actividades relevantes sobre
            inteligencia artificial, tecnología e innovación.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-3xl border border-white/70 bg-white/65 px-4 py-3 shadow-xl backdrop-blur-xl">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por evento, categoría, modalidad o ciudad..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="mx-auto mt-4 grid max-w-4xl gap-3 sm:grid-cols-3">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl outline-none"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl outline-none"
            >
              <option value="todas">Todas las modalidades</option>
              {modalidades.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>

            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700 shadow-md backdrop-blur-xl outline-none"
            >
              <option value="todos">Todos los meses</option>
              {meses.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl">
          {loading ? (
            <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
              Cargando eventos...
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-white/60 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
              No hay eventos publicados todavía.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {eventosFiltrados.map((evento) => (
                <AgendaEventCard key={evento.id} evento={evento} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}