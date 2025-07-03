// src/components/MobileMenu.jsx
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react"; // Iconos de hamburguesa y cerrar
import { motion, AnimatePresence } from "framer-motion";
import { menuControl } from "../hooks/useMenuControl";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      menuControl.openMenu("mobile"); // ✅ Notifica que este menú está abierto
    } else {
      document.body.style.overflow = "";
    }

    // ✅ Escucha si otro menú se abre
    const unsubscribe = menuControl.subscribe((menu) => {
      if (menu !== "mobile") setIsOpen(false);
    });

    return () => {
      document.body.style.overflow = "";
      unsubscribe(); // ✅ Limpia el listener
    };
  }, [isOpen]);

  const handleLinkClick = () => setIsOpen(false);

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
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Menú popup */}
            <motion.div
              className="absolute right-0 mt-2 w-48 bg-gray-100 rounded-lg shadow-lg z-50 flex flex-col text-left py-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <a
                href="/#catalogo"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition"
              >
                Catálogo
              </a>
              <a
                href="/casos"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition"
              >
                Quesos de éxito
              </a>    
              <a
                href="https://expertos.queesia.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition"
              >
                Expertos
              </a>
          
              <a
                href="/nosotros"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition"
              >
                Acerca de 🧀
              </a>
              <a
                href="/contacto"
                onClick={handleLinkClick}
                className="block px-4 py-2 text-black hover:bg-gray-200 hover:text-primary transition"
              >
                Contacto
              </a>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
