import React from "react";
import { NavLink } from "react-router-dom";

export default function ExpertNavCard({ to, label, icon: Icon, count }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition ${
          isActive
            ? "bg-blue-50 font-semibold text-blue-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        {Icon && <Icon size={18} className="shrink-0" />}
        <span className="truncate">{label}</span>
      </span>

      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
          {count}
        </span>
      )}
    </NavLink>
  );
}