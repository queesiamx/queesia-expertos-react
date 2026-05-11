// src/pages/AdminExpertos.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import ExpertDetailAdmin from "../components/ExpertDetailAdmin";
import { exportExpertosAprobadosCSV } from "@/utils/exportExpertsCsv";
import ExpertCard from "../components/ExpertCard";
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
              <ExpertCard
                key={exp.id}
                expert={exp}
                variant="admin"
                showFavorite={false}
                onView={() => setSeleccionado(exp)}
              />
            ))}
          </div>
        )}
      </AdminShell>
      <Footer />
    </>
  );
}