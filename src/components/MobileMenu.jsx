// src/components/MobileMenu.jsx

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { menuControl } from "../hooks/useMenuControl";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const correosAdmin = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];
  const esAdmin = usuario && correosAdmin.includes(usuario.email);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
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
  }, [isOpen]);

  const handleLinkClick = () => setIsOpen(false);

  const cerrarSesion = async () => {
    await signOut(auth);
    setUsuario(null);
    setIsOpen(false);
    toast.success("Sesión cerrada correctamente");
    navigate("/");
  };

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

              {esAdmin && (
                <a
                  href="/admin-expertos"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-blue-700 hover:bg-blue-100 font-semibold transition text-sm"
                >
                  Queesia Admin 🧀
                </a>
              )}

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
                <>
                  <span className="px-4 text-xs text-gray-600 truncate">
                    {usuario.email}
                  </span>
                  <button
                    onClick={cerrarSesion}
                    className="text-left px-4 py-2 text-red-600 hover:bg-gray-200 hover:text-red-700 text-sm transition"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
