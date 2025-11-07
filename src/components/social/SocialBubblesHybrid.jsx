import React, { useEffect, useMemo, useRef, useState } from "react";
import { IG, FB, Threads, TikTok, XLogo, YT } from "./Icons";

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

const ICONS = [
  { href: "https://www.instagram.com/quees_ia", title: "Instagram", Svg: IG },
  { href: "https://www.facebook.com/share/16tCkmXBzp/", title: "Facebook", Svg: FB },
  { href: "https://www.threads.net/@quees_ia", title: "Threads", Svg: Threads },
  { href: "https://www.tiktok.com/@quees_ia", title: "TikTok", Svg: TikTok },
  { href: "https://x.com/quees_ia", title: "X", Svg: XLogo },
  { href: "https://www.youtube.com/@Quees_IA", title: "YouTube", Svg: YT },
];

export default function SocialBubblesHybrid({
  sectionId,
  anchor,
  sentinel,
  maxXvw = 42,
  dockLeftPx = 16,
}) {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dock, setDock] = useState(false);

  // Cambia a modo dock cuando el sentinela deja de verse
  useEffect(() => {
    const s = document.querySelector(sentinel) || document.getElementById(String(sentinel).replace("#", ""));
    if (!s) return;
    const io = new IntersectionObserver((entries) => {
      const e = entries[0];
      setDock(!e.isIntersecting);
    }, { threshold: 0.01 });
    io.observe(s);
    return () => io.disconnect();
  }, [sentinel]);

  // Posición vertical: solo en modo “surfeo”
  useEffect(() => {
    if (dock) return;
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const sec = document.getElementById(sectionId);
      if (!sec) return;
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = clamp((vh / 2 - r.top) / Math.max(r.height || 1, 1));
      setProgress(p);

      const a = sec.querySelector(anchor) || document.querySelector(anchor);
      let targetTop = r.top + r.height * 0.35;
      if (a) {
        const ar = a.getBoundingClientRect();
        targetTop = ar.top + ar.height / 2 - 24; // centrado en el slot
      }
      const min = 72, max = vh - 140;
      el.style.top = `${Math.min(max, Math.max(min, targetTop))}px`;
      el.style.opacity = r.bottom > 0 && r.top < vh ? "1" : "0";
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sectionId, anchor, dock]);

  // Onda horizontal: solo en modo “surfeo”
  const eased = useMemo(() => progress, [progress]);
  const maxX = useMemo(
    () => (typeof window !== "undefined" ? Math.min(600, window.innerWidth * (maxXvw / 100)) : 320),
    [maxXvw]
  );

  if (dock) {
    // Barra lateral izquierda
    return (
      <div className="fixed z-[90] pointer-events-none" style={{ left: dockLeftPx, top: "50%", transform: "translateY(-50%)" }}>
        <ul className="flex flex-col gap-3">
          {ICONS.map(({ href, title, Svg }) => (
            <li key={title}>
              <a
                className="pointer-events-auto block p-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-blue-600"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
              >
                <Svg className="w-5 h-5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Fila centrada “surfeando” debajo de métricas
  return (
    <div ref={containerRef} className="fixed left-1/2 -translate-x-1/2 z-[90] pointer-events-none">
      <ul className="relative flex flex-row items-center justify-center gap-6">
        {ICONS.map(({ href, title, Svg }, i) => {
          const n = ICONS.length - 1 || 1;
          const base = lerp(-(maxX || 0) / 2, (maxX || 0) / 2, i / n);
          const t = eased + i * 0.12;
          const x = base + Math.sin(t * Math.PI * 2) * 12;
          return (
            <li key={title} style={{ transform: `translate(${x}px,0)` }} className="will-change-transform transition-transform duration-300">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="pointer-events-auto block p-3 rounded-full bg-white/70 backdrop-blur-md ring-1 ring-white/50 shadow-lg hover:shadow-xl hover:bg-white/90 transition text-blue-600"
              >
                <Svg className="w-5 h-5" />
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
