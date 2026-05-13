import React from "react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({
  title,
  subtitle,
  children,
  sidebarProps = {},
}) {
  return (
    <div className="min-h-screen bg-transparent font-sans">
      <UnifiedNavbar />

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-0">
        <div className="flex flex-col lg:flex-row gap-6">
          <AdminSidebar {...sidebarProps} />

          <main className="flex-1 min-w-0">
            {title ? (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                {subtitle ? (
                  <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                ) : null}
              </div>
            ) : null}

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}