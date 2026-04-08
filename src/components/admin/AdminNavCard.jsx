import React from "react";
import { Link } from "react-router-dom";

export default function AdminNavCard({
  to = "#",
  label,
  count,
  active = false,
  onClick,
}) {
  const base =
    "w-full flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition border";
  const activeCls =
    "bg-blue-600 text-white border-blue-600 shadow-sm";
  const idleCls =
    "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  const content = (
    <div className={`${base} ${active ? activeCls : idleCls}`}>
      <span>{label}</span>
      {typeof count === "number" && (
        <span
          className={`inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {count}
        </span>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  return <Link to={to}>{content}</Link>;
}