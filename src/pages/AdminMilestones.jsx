import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // ajusta si tu path es distinto

const SITES = [
  { id: "quesiaHome", aliases: ["queesiaHome"], label: "queesia.com" },
  { id: "foroHome", label: "foro.queesia.com" },
  { id: "expertosHome", label: "expertos.queesia.com" },
  { id: "blogHome", label: "queesia.com/blog" }, // ✅ NUEVO
];

// Metas simples (puedes cambiarlas cuando quieras)
const MILESTONES = {
  quesiaHome: [1000, 5000, 10000, 25000, 50000, 100000],
  foroHome: [500, 1000, 5000, 10000, 25000],
  expertosHome: [500, 1000, 5000, 10000, 25000],
  blogHome: [250, 500, 1000, 5000, 10000, 25000], // ✅ NUEVO (ajústalo a gusto)
};


function nextMilestone(current, list) {
  for (const m of list) if (current < m) return m;
  return null; // ya rebasó todos
}

function fmt(n) {
  return new Intl.NumberFormat("es-MX").format(n ?? 0);
}

function countFromSnapshot(snap) {
  if (!snap.exists()) return 0;
  const data = snap.data() || {};
  return Number(data.count ?? data.visits ?? data.totalViews ?? 0);
}

export default function AdminMilestones() {
  const [counts, setCounts] = useState({
    quesiaHome: null,
    foroHome: null,
    expertosHome: null,
    blogHome: null,
  });

  useEffect(() => {
    const unsubs = SITES.map((s) => {
           const countRefs = [s.id, ...(s.aliases || [])].map((id) => ({
        key: `visitCounts/${id}`,
        ref: doc(db, "visitCounts", id),
      }));
      const statsRefs = (s.pageStatsKeys || []).map((key) => ({
        key: `page_stats/${key}`,
        ref: doc(db, "page_stats", key),
      }));

      const refs = [...countRefs, ...statsRefs];
      const values = new Map();

      const inner = refs.map(({ key, ref }) =>
        onSnapshot(ref, (snap) => {
          values.set(key, countFromSnapshot(snap));
          const merged = Math.max(...Array.from(values.values()), 0);
          setCounts((prev) => ({ ...prev, [s.id]: merged }));
        })
      );

      return () => inner.forEach((u) => u && u());
    });

    return () => unsubs.forEach((u) => u && u());
  }, []);

  const rows = useMemo(() => {
    return SITES.map((s) => {
      const current = counts[s.id];
      const goals = MILESTONES[s.id] ?? [1000, 5000, 10000];
      const next = current == null ? null : nextMilestone(current, goals);
      const prevGoal =
        current == null
          ? null
          : (goals.slice().reverse().find((g) => g <= current) ?? 0);

      const progress =
        current == null || next == null
          ? null
          : Math.min(1, (current - prevGoal) / (next - prevGoal));

      return { ...s, current, next, prevGoal, progress };
    });
  }, [counts]);

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
        Milestones de visitas
      </h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Progreso por sitio (basado en tus contadores actuales).
      </p>

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((r) => (
          <div
            key={r.id}
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.label}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  Fuente: max(visitCounts/{r.id}, page_stats/*)
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>
                  {r.current == null ? "..." : fmt(r.current)}
                </div>
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  visitas totales
                </div>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {r.current == null ? (
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  Cargando...
                </div>
              ) : r.next == null ? (
                <div style={{ fontSize: 13, opacity: 0.75 }}>
                  ✅ Ya superó todas las metas configuradas.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <div style={{ opacity: 0.75 }}>
                      Próxima meta: <b>{fmt(r.next)}</b>
                    </div>
                    <div style={{ opacity: 0.75 }}>
                      Falta: <b>{fmt(Math.max(0, r.next - r.current))}</b>
                    </div>
                  </div>

                  <div
                    style={{
                      height: 10,
                      background: "#e5e7eb",
                      borderRadius: 999,
                      overflow: "hidden",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.round((r.progress ?? 0) * 100)}%`,
                        background: "#2563eb",
                      }}
                    />
                  </div>

                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
                    Progreso: <b>{Math.round((r.progress ?? 0) * 100)}%</b>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
