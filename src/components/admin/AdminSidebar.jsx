import React from "react";
import { useLocation } from "react-router-dom";
import AdminNavCard from "./AdminNavCard";

export default function AdminSidebar({
  expertosCount = 0,
  aprobadosCount = 0,
  pendientesExpertosCount = 0,
  consultasPendientesCount = 0,
  porValidarCount = 0,
  resueltasGratisCount = 0,
  conCobroCount = 0,
}) {
  const location = useLocation();
  const { pathname, search } = location;

    const isConsultasTab = (tab) =>
    pathname === "/admin/consultas" && search.includes(`tab=${tab}`);

  const externalLinkBase =
    "flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-default hover:bg-slate-50 transition";

  return (
    <aside className="w-full lg:w-[290px] shrink-0">
      <div className="lg:sticky lg:top-[96px] space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
            Expertos
          </p>
          <div className="space-y-2">
            <AdminNavCard
              to="/admin-expertos"
              label="Todos"
              count={expertosCount}
              active={pathname === "/admin-expertos"}
            />
            <AdminNavCard
              to="/admin-expertos?filtro=aprobados"
              label="Aprobados"
              count={aprobadosCount}
              active={pathname === "/admin-expertos" && search.includes("filtro=aprobados")}
            />
            <AdminNavCard
              to="/admin-expertos?filtro=pendientes"
              label="Pendientes"
              count={pendientesExpertosCount}
              active={pathname === "/admin-expertos" && search.includes("filtro=pendientes")}
            />
          </div>
        </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">
            Contenido
          </p>

          <div className="space-y-2">
            <a
              href="https://queesia.com/blog-admin/login.php"
              target="_blank"
              rel="noreferrer"
              className={externalLinkBase}
            >
              <span className="font-medium">Blog</span>
              <span className="text-xs text-slate-400">↗</span>
            </a>

            <a
              href="https://queesia.com/biblioteca-admin/"
              target="_blank"
              rel="noreferrer"
              className={externalLinkBase}
            >
              <span className="font-medium">Biblioteca</span>
              <span className="text-xs text-slate-400">↗</span>
            </a>

            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
              <span className="font-medium">Ofertas educativas</span>
              <span className="text-xs">Próximamente</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}