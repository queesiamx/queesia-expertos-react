import React from "react";

export default function AdminSectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        {subtitle ? (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}