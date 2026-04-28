import React from "react";

const toneMap = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
};

export default function ExpertStatCard({
  icon: Icon,
  value,
  label,
  helper,
  tone = "blue",
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`grid h-12 w-12 place-items-center rounded-2xl border ${
            toneMap[tone] || toneMap.blue
          }`}
        >
          {Icon && <Icon size={24} />}
        </div>

        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm font-semibold text-slate-700">{label}</p>
          {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
        </div>
      </div>
    </article>
  );
}