import React, { useEffect, useRef, useState } from "react";
import { IG, FB, Threads, TikTok, XLogo, YT } from "./Icons";

// Utilidad para persistir la posición entre visitas
const loadPos = () => {
  try { return JSON.parse(localStorage.getItem("qs_social_pos") || "null"); } catch { return null; }
};
const savePos = (pos) => {
  try { localStorage.setItem("qs_social_pos", JSON.stringify(pos)); } catch {}
};

const LINKS = [
  { href: "https://www.instagram.com/quees_ia", title: "Instagram", Svg: IG },
  { href: "https://www.facebook.com/share/16tCkmXBzp/", title: "Facebook", Svg: FB },
  { href: "https://www.threads.net/@quees_ia", title: "Threads", Svg: Threads },
  { href: "https://www.tiktok.com/@quees_ia", title: "TikTok", Svg: TikTok },
  { href: "https://x.com/quees_ia", title: "X", Svg: XLogo },
  { href: "https://www.youtube.com/@Quees_IA", title: "YouTube", Svg: YT },
];

// En el mismo archivo MobileSocialDock.jsx (arriba de export default)
const CheeseIcon = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <path d="M3 10.5c0-.8.5-1.5 1.2-1.8l8.6-3.4a4 4 0 013.8.5l3.4 2.3a1.5 1.5 0 01-.2 2.6l-11 5.7a3 3 0 01-1.3.3H5a2 2 0 01-2-2v-4.2z" fill="#FACC15"/>
    <circle cx="9" cy="11" r="1" fill="#EAB308"/>
    <circle cx="13.5" cy="9.5" r="1" fill="#EAB308"/>
    <circle cx="11.8" cy="13.2" r="1.2" fill="#EAB308"/>
  </svg>
);

const UfoIcon = (p) => (
  <svg viewBox="0 0 24 24" {...p}>
    <ellipse cx="12" cy="10" rx="7" ry="3.5" fill="#60A5FA"/>
    <ellipse cx="12" cy="9" rx="4.5" ry="2" fill="#93C5FD"/>
    <path d="M5 12c1.8 1.2 4.3 2 7 2s5.2-.8 7-2" fill="none" stroke="#3B82F6" strokeWidth="1.5"/>
    <path d="M9.5 14.5l.8 5.5m4.4-5.5l-.8 5.5" stroke="#A3A3A3" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// RatIconOutline
const RatIconOutline = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#1F2937" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M8.2 13.8c0 2.8 1.9 5.2 3.8 5.2s3.8-2.4 3.8-5.2c0-2.9-1.8-5.7-3.8-5.7s-3.8 2.8-3.8 5.7z"/>
    <path d="M6.1 9.7c0 1.2.9 2.1 2.1 2.1 1.8 0 2.6-2.3 1-4-1.4-1.5-3.1-.4-3.1 1.9z"/>
    <path d="M15.8 10.2c-.3 1.7.8 2.6 2 2.6 1.2 0 2.1-.9 2.1-2.1 0-2.3-1.7-3.4-3.1-1.9"/>
    <circle cx="10.2" cy="12.3" r=".7"/>
    <circle cx="13.8" cy="12.3" r=".7"/>
    <path d="M12 13.8c.5.4 1.1.4 1.6 0"/>
    <path d="M17.5 15.2c2.4.3 3.6 1.3 3.6 2.6 0 1.3-1.4 2.2-3.7 2.5"/>
  </svg>
);



export default function MobileSocialDock() {
  // posición del botón (en px relativos a la ventana)
  const start = loadPos() || { x: 16, y: window.innerHeight * 0.6 };
  const [pos, setPos] = useState(start);
  const [open, setOpen] = useState(false);
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => { savePos(pos); }, [pos]);

  // Drag básico (touch + mouse)
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const onDown = (e) => {
      dragging.current = true;
      const p = "touches" in e ? e.touches[0] : e;
      offset.current = { x: p.clientX - pos.x, y: p.clientY - pos.y };
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging.current) return;
      const p = "touches" in e ? e.touches[0] : e;
      const x = Math.max(8, Math.min(window.innerWidth - 64, p.clientX - offset.current.x));
      const y = Math.max(8, Math.min(window.innerHeight - 64, p.clientY - offset.current.y));
      setPos({ x, y });
    };
    const onUp = () => { dragging.current = false; };

    el.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [pos]);

  return (
    <>
      {/* FAB arrastrable */}
      <button type="button"
        ref={dragRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Redes sociales"
        className="fixed z-[95] md:hidden select-none touch-none"
        style={{ left: pos.x, top: pos.y }}
      >
 <span className="relative grid h-12 w-12 rounded-full bg-white/90 backdrop-blur-md ring-1 ring-white/60 shadow-lg place-items-center">
   {/* icono: cambia <CheeseIcon/> por <UfoIcon/> si prefieres */}
   
    <span
    role="img"
    aria-label="Redes sociales"
    className="text-[22px] leading-none select-none"
    style={{ fontFamily: `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif` }}
  >
    🔔
  </span>
   {/* pulso suave */}
   <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/10" />
 </span>
      </button>

      {/* Panel deslizante inferior */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[94] md:hidden transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-md rounded-t-2xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-slate-200 p-4">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="grid grid-cols-6 gap-3 place-items-center">
            {LINKS.map(({ href, title, Svg }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                className="p-3 rounded-full bg-white shadow ring-1 ring-slate-200 active:scale-95 transition text-blue-600"
                onClick={() => setOpen(false)}
              >
                <Svg className="w-5 h-5" />
              </a>
            ))}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-4 w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}
