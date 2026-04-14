// src/pages/AdminExpertos.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import ExpertDetailAdmin from "../components/ExpertDetailAdmin";
import { exportExpertosAprobadosCSV } from "@/utils/exportExpertsCsv";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { Toaster } from "react-hot-toast";
import { useAuth } from "@/auth/context/AuthContext";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";

import AdminShell from "@/components/admin/AdminShell";
import AdminStatsRow from "@/components/admin/AdminStatsRow";
import AdminSectionHeader from "@/components/admin/AdminSectionHeader";

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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const filtroURL = searchParams.get("filtro");
    if (filtroURL) setFiltro(filtroURL);
  }, [searchParams]);


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
    const filtroURL = searchParams.get("filtro");
    if (filtroURL) {
      setFiltro(filtroURL);
      return;
    }
    setFiltro("todos");
  }, [searchParams]);

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
    <>
      <Toaster position="top-right" />

      <AdminShell
        title="Panel de Administración de Expertos"
        subtitle="Gestiona expertos, consultas y accesos del panel."
        sidebarProps={{
          expertosCount: expertos.length,
          aprobadosCount: expertos.filter((e) => e.aprobado).length,
          pendientesExpertosCount: expertos.filter((e) => !e.aprobado).length,
          consultasPendientesCount: consultasContadores.pendientes,
          porValidarCount: consultasContadores.porValidar,
          resueltasGratisCount: consultasContadores.resueltasGratis,
          conCobroCount: consultasContadores.conCobro,
        }}
      >
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o especialidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-md px-4 h-11 rounded-2xl bg-white text-default placeholder:text-slate-400 border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <AdminStatsRow
          stats={[
            { label: "Expertos activos", value: expertos.length },
            {
              label: "Pendientes por revisar",
              value: expertos.filter((e) => !e.aprobado).length,
            },
            {
              label: "Consultas por validar",
              value: consultasContadores.porValidar,
            },
            { label: "Ingresos (mes)", value: "—" },
          ]}
        />

        <AdminSectionHeader
          title="Expertos"
          subtitle="Busca, filtra y revisa perfiles."
          actions={
            <>
              <button
                onClick={exportExpertosAprobadosCSV}
                className="px-4 py-2 rounded-2xl font-semibold shadow bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Exportar expertos (CSV)
              </button>

            </>
          }
        />

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      </AdminShell>
      <Footer />
    </>
  );
}