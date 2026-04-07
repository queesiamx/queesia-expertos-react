// src/pages/AdminExpertos.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import ExpertDetailAdmin from "../components/ExpertDetailAdmin";
import { exportExpertosAprobadosCSV } from "@/utils/exportExpertsCsv";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const adminEmails = ["queesiamx@gmail.com", "queesiamx.employee@gmail.com"];

export default function AdminExpertos() {
  const [expertos, setExpertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [autorizado, setAutorizado] = useState(false);
  const [verificado, setVerificado] = useState(false);

  const [consultasContadores, setConsultasContadores] = useState({
    porValidar: 0,
    pendientes: 0,
    resueltasGratis: 0,
    conCobro: 0,
  });

  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const { user, loading, rol } = useAuth();

  useEffect(() => {
    if (loading) return;

    setVerificado(true);

    const esAdmin = Boolean(
      user &&
        (rol?.toLowerCase() === "admin" ||
          adminEmails.includes(user.email?.toLowerCase?.() ?? ""))
    );

    setAutorizado(esAdmin);
  }, [loading, user, rol]);

  useEffect(() => {
    if (!autorizado) return;

    let cancel = false;

    const cargarDatos = async () => {
      try {
        setCargando(true);
        const snapshotExpertos = await getDocs(collection(db, "experts"));
        if (cancel) return;

        const listaExpertos = snapshotExpertos.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setExpertos(listaExpertos);
      } catch (e) {
        console.error("Error al cargar expertos:", e);
      } finally {
        if (!cancel) setCargando(false);
      }
    };

    cargarDatos();

    return () => {
      cancel = true;
    };
  }, [autorizado]);

  useEffect(() => {
    if (!autorizado) return;

    const ref = collection(db, "consultasModeradas");

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const todas = snapshot.docs.map((doc) => doc.data());

        const porValidar = todas.filter((c) => c.estado === "porValidar").length;
        const pendientes = todas.filter((c) => c.estado === "pendiente").length;
        const gratis = todas.filter((c) => c.estado === "resueltaGratis").length;
        const conPago = todas.filter(
          (c) => c.estado === "requierePago" || c.estado === "conCobro"
        ).length;

        setConsultasContadores({
          porValidar,
          pendientes,
          resueltasGratis: gratis,
          conCobro: conPago,
        });
      },
      (error) => {
        console.error("Error al escuchar consultas:", error);
      }
    );

    return () => unsubscribe();
  }, [autorizado]);

  function handleActualizar(expertoActualizado) {
    setExpertos((prev) =>
      prev.map((exp) =>
        exp.id === expertoActualizado.id ? expertoActualizado : exp
      )
    );
    setSeleccionado(null);
  }

  function handleEliminar(idEliminado) {
    setExpertos((prev) => prev.filter((exp) => exp.id !== idEliminado));
    setSeleccionado(null);
  }

  if (loading) return <p className="p-8">Verificando acceso…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!verificado) {
    return <p className="p-8 font-sans text-default">Verificando acceso…</p>;
  }

  if (!autorizado) {
    return (
      <div className="p-8 text-center text-red-600 font-bold">
        ⚠️ Acceso restringido. Esta vista es solo para administradores autorizados.
      </div>
    );
  }

  const totalServicios = expertos.reduce(
    (acc, exp) =>
      acc + (Array.isArray(exp.servicios) ? exp.servicios.length : 0),
    0
  );

  const totalCursos = expertos.reduce(
    (acc, exp) =>
      acc +
      (Array.isArray(exp.servicios)
        ? exp.servicios.filter((s) => s.tipo === "curso").length
        : 0),
    0
  );

  const expertosFiltrados = expertos
    .filter((exp) => {
      if (filtro === "aprobados") return exp.aprobado === true;
      if (filtro === "pendientes") return exp.aprobado !== true;
      if (filtro === "conServicios") {
        return Array.isArray(exp.servicios) && exp.servicios.length > 0;
      }
      if (filtro === "conCursos") {
        return (
          Array.isArray(exp.servicios) &&
          exp.servicios.some((s) => s.tipo === "curso")
        );
      }
      return true;
    })
    .filter((exp) => {
      const texto = `${exp.nombre || ""} ${exp.especialidad || ""}`.toLowerCase();
      return texto.includes(busqueda.toLowerCase());
    });

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-[#f7fafc]">
      <div className="absolute inset-x-0 top-0 h-24 bg-transparent pointer-events-none" />
      <Toaster position="top-right" />
      <UnifiedNavbar />

      <div className="sticky top-[64px] z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-3">
            <input
              type="text"
              placeholder="Buscar por nombre o especialidad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="min-w-[260px] md:min-w-[320px] px-4 h-10 rounded-full bg-white text-default placeholder:text-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            <div className="h-9 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expertos
              </span>

              <button
                onClick={() => setFiltro("todos")}
                className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                  filtro === "todos"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-default border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Todos
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    filtro === "todos"
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {expertos.length}
                </span>
              </button>

              <button
                onClick={() => setFiltro("aprobados")}
                className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                  filtro === "aprobados"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-default border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Aprobados
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    filtro === "aprobados"
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {expertos.filter((e) => e.aprobado).length}
                </span>
              </button>

              <button
                onClick={() => setFiltro("pendientes")}
                className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                  filtro === "pendientes"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-white text-default border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Pendientes
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    filtro === "pendientes"
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {expertos.filter((e) => !e.aprobado).length}
                </span>
              </button>
            </div>

            <div className="h-9 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Consultas
              </span>

              <button
                onClick={() => navigate("/admin/por-validar")}
                className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center hover:bg-slate-50"
              >
                Por validar
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-rose-100 text-rose-700">
                  {consultasContadores.porValidar}
                </span>
              </button>

              <button
                onClick={() => navigate("/admin/consultas")}
                className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center hover:bg-slate-50"
              >
                Resueltas gratis
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
                  {consultasContadores.resueltasGratis}
                </span>
              </button>

              <button
                onClick={() => navigate("/admin/consultas")}
                className="relative h-10 px-4 rounded-full bg-white text-default text-sm font-semibold border border-slate-200 whitespace-nowrap flex items-center hover:bg-slate-50"
              >
                Con cobro
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] bg-blue-100 text-blue-700">
                  {consultasContadores.conCobro}
                </span>
              </button>
            </div>

            <div className="h-9 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Catálogo
              </span>

              <button
                onClick={() => setFiltro("conServicios")}
                className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                  filtro === "conServicios"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white text-default border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Servicios
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    filtro === "conServicios"
                      ? "bg-white/20"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {totalServicios}
                </span>
              </button>

              <button
                onClick={() => setFiltro("conCursos")}
                className={`relative h-10 px-4 rounded-full whitespace-nowrap text-sm font-semibold transition ${
                  filtro === "conCursos"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "bg-white text-default border border-slate-200 hover:bg-slate-50"
                }`}
              >
                Cursos
                <span
                  className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] ${
                    filtro === "conCursos"
                      ? "bg-white/20"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {totalCursos}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 pt-10">
          <h1 className="text-[28px] md:text-3xl font-extrabold tracking-snugger text-default mb-5 font-montserrat">
            Panel de Administración de Expertos
          </h1>

          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setFiltro("todos")}
              className="text-left rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:border-blue-300 transition"
            >
              <div className="text-sm text-slate-500">Expertos activos</div>
              <div className="mt-1 text-2xl font-bold text-default">
                {expertos.length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => setFiltro("pendientes")}
              className="text-left rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:border-amber-300 transition"
            >
              <div className="text-sm text-slate-500">Pendientes por revisar</div>
              <div className="mt-1 text-2xl font-bold text-default">
                {expertos.filter((e) => !e.aprobado).length}
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/por-validar")}
              className="text-left rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:border-rose-300 transition"
            >
              <div className="text-sm text-slate-500">Consultas por validar</div>
              <div className="mt-1 text-2xl font-bold text-default">
                {consultasContadores.porValidar}
              </div>
            </button>

            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <div className="text-sm text-slate-500">Ingresos (mes)</div>
              <div className="mt-1 text-2xl font-bold text-default">—</div>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              onClick={exportExpertosAprobadosCSV}
              className="px-4 py-2 rounded-2xl font-semibold shadow bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Exportar expertos (CSV)
            </button>

            <a
              href="https://queesia.com/blog-admin/login.php"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-2xl font-semibold shadow bg-white text-default border border-slate-300 hover:bg-slate-50 transition"
            >
              Acceso admin Blog
            </a>
          </div>

          {cargando ? (
            <p className="text-default-soft">Cargando expertos...</p>
          ) : seleccionado ? (
            <ExpertDetailAdmin
              expert={seleccionado}
              onClose={() => setSeleccionado(null)}
              onUpdate={handleActualizar}
              onDelete={handleEliminar}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expertosFiltrados.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => setSeleccionado(exp)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-slate-200 ring-2 ring-white shadow-sm shrink-0" />
                      <div>
                        <h3 className="text-[15px] font-semibold text-default leading-tight">
                          {exp.nombre}
                        </h3>
                        <div className="text-sm text-blue-700">
                          {exp.especialidad || "—"}
                        </div>
                      </div>
                    </div>

                    {exp.aprobado && (
                      <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        VERIFICADO
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-[13px] text-slate-600">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-400">
                      <path
                        fill="currentColor"
                        d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                    <span>—</span>
                    <span className="text-slate-400">•</span>
                    <span>Responde rápido</span>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeleccionado(exp);
                      }}
                      className="flex-1 h-10 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
                    >
                      Ver perfil
                    </button>

                    <button
                      type="button"
                      className="h-10 w-10 grid place-items-center rounded-lg border border-slate-300 text-slate-600 hover:border-blue-300"
                      aria-label="Guardar"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M16.5,3c-1.74,0-3.41,0.81-4.5,2.09C10.91,3.81,9.24,3,7.5,3C4.42,3,2,5.42,2,8.5c0,3.78,3.4,6.86,8.55,11.54L12,21.35l1.45-1.32C18.6,15.36,22,12.28,22,8.5C22,5.42,19.58,3,16.5,3z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}