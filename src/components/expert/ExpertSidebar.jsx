import React from "react";
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  MessageSquare,
  UserRound,
  BookOpen,
  CalendarDays,
  Settings,
  CreditCard,
  HelpCircle,
  Headphones,
} from "lucide-react";
import ExpertNavCard from "./ExpertNavCard";

 export default function ExpertSidebar({
   consultasRecibidasCount = 0,
   consultasRespondidasCount = 0,
   onOpenAvailability,
 }) {
  return (
    <aside className="w-full shrink-0 lg:w-[290px]">
      <div className="space-y-6 lg:sticky lg:top-[96px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Panel del experto
          </p>

          <div className="space-y-1">
            <ExpertNavCard
              to="/expert-dashboard"
              label="Dashboard"
              icon={LayoutDashboard}
            />

            <ExpertNavCard
              to="/consultas-recibidas"
              label="Consultas recibidas"
              icon={Inbox}
              count={consultasRecibidasCount}
            />

            <ExpertNavCard
              to="/historial-respuestas"
              label="Consultas respondidas"
              icon={CheckCircle2}
              count={consultasRespondidasCount}
            />

            <ExpertNavCard
              to="/consultas-aprobadas"
              label="Mensajes"
              icon={MessageSquare}
            />

            <ExpertNavCard
              to="/perfil"
              label="Perfil público"
              icon={UserRound}
            />

            <ExpertNavCard
              to="/mis-contenidos"
              label="Mis contenidos"
              icon={BookOpen}
            />

             <button
               type="button"
               onClick={onOpenAvailability}
               className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
             >
               <CalendarDays size={18} />
               <span>Disponibilidad</span>
             </button>

            <ExpertNavCard
              to="/expert-dashboard"
              label="Configuración"
              icon={Settings}
            />

            <ExpertNavCard
              to="/mis-compras"
              label="Pagos y facturación"
              icon={CreditCard}
            />

            <ExpertNavCard
              to="/expert-dashboard"
              label="Ayuda"
              icon={HelpCircle}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <Headphones size={20} />
            </div>

            <div>
              <p className="font-semibold text-slate-900">¿Necesitas ayuda?</p>
              <p className="mt-1 text-sm text-slate-500">
                Nuestro equipo está para apoyarte.
              </p>
            </div>
          </div>

          <a
            href="mailto:contacto@queesia.com"
            className="mt-4 block rounded-xl border border-blue-200 px-4 py-2 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </aside>
  );
}