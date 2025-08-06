import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { menuControl } from "../hooks/useMenuControl";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../constants/roles";


export default function MobileMenu({ handleLogout }) {

  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const { rol, aprobado } = useAuth();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUsuario(user ? { ...user, rol, aprobado } : null);
    });

    if (isOpen) {
      document.body.style.overflow = "hidden";
      menuControl.openMenu("mobile");
    } else {
      document.body.style.overflow = "";
    }

    const unsubscribeMenu = menuControl.subscribe((menu) => {
      if (menu !== "mobile") setIsOpen(false);
    });

    return () => {
      document.body.style.overflow = "";
      unsubscribeAuth();
      unsubscribeMenu();
    };
  }, [isOpen, rol, aprobado]);

  const handleLinkClick = () => setIsOpen(false);

  // Opciones dinámicas por rol
  const opciones = [
    { label: "Catálogo", href: "/#catalogo" },
    { label: "Quesos de éxito", href: "/casos" },
    { label: "Expertos", href: "https://expertos.queesia.com", external: true },
    { label: "Acerca de 🧀", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
    ...(rol === ROLES.ADMIN
      ? [{ label: "Panel Admin", href: "/admin-expertos" }]
      : []),
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

  return (
    <div className="lg:hidden relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-black focus:outline-none flex items-center justify-center w-10 h-10"
        aria-label="Menú"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="absolute right-0 mt-2 w-60 bg-gray-100 rounded-lg shadow-lg z-50 flex flex-col text-left py-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {opciones.map((op, idx) => (
                <a
                  key={idx}
                  href={op.href}
                  target={op.external ? "_blank" : "_self"}
                  rel={op.external ? "noopener noreferrer" : undefined}
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition text-sm"
                >
                  {op.label}
                </a>
              ))}

              <hr className="my-2" />

              {!usuario ? (
                <a
                  href="/login"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-black hover:bg-gray-200 transition text-sm"
                >
                  Iniciar sesión
                </a>
              ) : (
                <div className="px-4 py-2">
                <span className="block text-xs text-gray-600 truncate mb-2">
                  {usuario.email}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="mt-2 w-full flex items-center gap-2 text-sm text-red-600 hover:bg-gray-200 transition px-2 py-1 rounded"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>


              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
