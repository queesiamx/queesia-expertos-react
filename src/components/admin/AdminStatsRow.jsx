import React from "react";

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
    </div>
  );
}

export default function AdminStatsRow({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {stats.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}