import React from "react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import ExpertSidebar from "./ExpertSidebar";

export default function ExpertShell({
  title,
  subtitle,
  actions,
  sidebarProps = {},
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f7fafc] font-sans">
      <UnifiedNavbar />

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <ExpertSidebar {...sidebarProps} />

          <main className="min-w-0 flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>

              {actions && <div className="shrink-0">{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}