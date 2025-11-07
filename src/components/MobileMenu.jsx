// src/components/MobileMenu.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { menuControl } from "../hooks/useMenuControl";
 import { logout } from "@/auth/logout";
 import { useAuth } from "@/auth/context/AuthContext";
 import { pathByRole } from "@/auth/pathByRole";
 import { ROLES } from "../constants/roles";



export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // 👇 Trae todo desde el contexto global (un solo listener en la app)
  const { user: usuario, rol, aprobado } = useAuth();
 const dashHref = usuario && rol ? pathByRole(rol, aprobado) : null;


  const btnRef = useRef(null);
  const panelRef = useRef(null);

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  // ESC para cerrar
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") close(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  // ✅ Bloqueo de scroll + coordinación de menús (sin auth aquí)
  useEffect(() => {
    if (!isOpen) return;

    // Bloquear scroll del body cuando el menú está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";


    // Registrar este menú en el coordinador (si existe)
    const unsubscribeMenu =
      (menuControl && typeof menuControl.register === "function")
        ? menuControl.register("mobile", { close })
        : () => {};

    return () => {
      document.body.style.overflow = prevOverflow || "";
      unsubscribeMenu();
    };
  }, [isOpen, close]);

  const handleLinkClick = () => setIsOpen(false);
  const isInternal = (href) => typeof href === "string" && href.startsWith("/");

  // Opciones por rol
  const opciones = [
    { label: "Catálogo", href: "https://queesia.com/#catalogo" },
    { label: "Quesos de éxito", href: "https://queesia.com/casos" },
    { label: "Expertos", href: "https://expertos.queesia.com", external: true },
    { label: "Foro", href: "https://expertos.queesia.com/foro", external: true },
    { label: "Blog", href: "https://expertos.queesia.com/blog", external: true },
    { label: "Acerca de 🧀", href: "https://queesia.com/nosotros" },
    { label: "Contacto", href: "https://queesia.com/contacto" },
    ...(rol === ROLES.ADMIN ? [{ label: "Panel Admin", href: "/admin-expertos" }] : []),
    ...(rol === ROLES.EXPERTO && aprobado
      ? [
          { label: "Mi Dashboard", href: "/expert-dashboard" },
          { label: "Mis Servicios", href: "/mis-servicios" },
          { label: "Consultas Recibidas", href: "/consultas-recibidas" },
        ]
      : []),
    ...(rol === ROLES.USUARIO
      ? [
          { label: "Mis Consultas", href: "/mis-consultas" },
          { label: "Mis Compras", href: "/mis-compras" },
        ]
      : []),
    ...(usuario ? [{ label: "Mi Perfil", href: "/perfil" }] : []),
  ];

  // (sin helper de login: el CTA solo navega a /login)

  return (
    <div className={`lg:hidden relative ${isOpen ? "z-[10002]" : "z-[10000]"}`}>
      {/* Botón hamburguesa */}
      <button
        data-debug="mm-v5"
        ref={btnRef}
        onClick={() => (isOpen ? close() : open())}
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary-soft text-black shadow-md ring-1 ring-black/10 hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="relative block w-6 h-6" aria-hidden="true">
          <span className={`absolute inset-x-0 top-0 h-[2px] bg-black rounded transition-transform duration-200 ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black rounded transition-opacity duration-200 ${isOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute inset-x-0 bottom-0 h-[2px] bg-black rounded transition-transform duration-200 ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </span>
        {/* (Opcional) quité "X/≡" para evitar doble icono */}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-[10000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              role="menu"
              aria-label="Menú principal"
              tabIndex={-1}
              ref={panelRef}
              className="absolute right-0 mt-2 w-60 bg-white text-black rounded-xl shadow-xl ring-1 ring-black/10 z-[10001] flex flex-col text-left py-2 outline-none"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {/* Marca / Rol */}
              <div className="px-4 pb-2 pt-2 border-b border-gray-100 text-sm">
                <div className="font-semibold">
                  quees<span className="text-primary">ia</span>
                </div>
                {/* No mostrar “Rol actual” si no hay sesión */}
                {usuario && rol && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    Rol actual: {rol}
                  </div>
                )}
              </div>

              {/* Navegación */}
              <nav className="py-1 text-sm">

              {/* ✅ Mi panel (visible solo con sesión y rol) */}
                {dashHref && (
                  <Link
                    to={dashHref}
                    onClick={handleLinkClick}
                    className="block px-4 py-2 hover:bg-gray-100 hover:text-primary transition"
                  >
                    📁 Mi panel
                  </Link>
                )}

              {opciones.map((op, idx) => {
                  const internal = !op.external && isInternal(op.href);
                  return internal ? (
                    <Link
                      key={idx}
                      to={op.href}
                      onClick={handleLinkClick}
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-primary transition"
                    >
                      {op.label}
                    </Link>
                  ) : (
                    <a
                      key={idx}
                      href={op.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLinkClick}
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-primary transition"
                    >
                      {op.label}
                    </a>
                  );
                })}

                <hr className="my-2" />

                {/* CTA de sesión simple */}
                {!usuario ? (
                  <div className="px-4 py-2">
                    <a
                      href="/login"
                      onClick={handleLinkClick}
                      className="block w-full text-center px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
                    >
                      Iniciar sesión
                    </a>
                  </div>
               ) : (
                  <div className="px-4 py-2">
                    <span className="block text-xs text-gray-600 truncate mb-2">
                      {usuario.email}
                    </span>
                    <button
                      onClick={() => { logout(); close(); }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 transition"
                    >
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
