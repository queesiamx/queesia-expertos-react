// src/pages/Blog.jsx
import { Cog } from "lucide-react";
import logoBg from "@/assets/logo-bg.png";

export default function Blog() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 relative">
      {/* Contenedor hero de engranes + logo */}
      <div className="relative w-full max-w-3xl h-80 mb-10 flex items-center justify-center">
        {/* Logo de fondo (centrado) */}
        <img
          src={logoBg}
          alt="Quesia logo"
          className="pointer-events-none select-none absolute inset-0 m-auto w-64 h-64 object-contain opacity-50"
          style={{ zIndex: 0 }}
        />

        {/* Engrán grande (izquierda media) */}
        <div className="absolute -left-4 top-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
          <Cog className="w-28 h-28 animate-spin text-gray-400" aria-hidden />
        </div>

        {/* Engrán mediano (derecha media) */}
        <div className="absolute -right-4 top-1/2 -translate-y-1/2" style={{ zIndex: 1 }}>
          <Cog className="w-24 h-24 animate-spin-reverse text-gray-500" aria-hidden />
        </div>

        {/* Engrán pequeño (abajo centro) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6" style={{ zIndex: 1 }}>
          <Cog className="w-16 h-16 animate-spin-fast text-gray-500" aria-hidden />
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-2">¡Próximamente…</h1>
      <p className="text-gray-600 max-w-prose">
        Estamos afinando los últimos detalles del{" "}
        <span className="font-medium">Blog de Queesia</span>. Muy pronto
        encontrarás artículos, guías y casos reales de IA aplicada.
      </p>
    </div>
  );
}
