// src/components/UserMenu.jsx
import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { ROLES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

export default function UserMenu({ usuario, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { rol, aprobado, loading } = useAuth();
  const [userData, setUserData] = useState(usuario);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  // Sincroniza datos del usuario con rol/aprobado del hook
  useEffect(() => {
    if (usuario) {
      setUserData((prev) => ({
        ...usuario,
        rol: rol ?? prev?.rol,
        aprobado: aprobado ?? prev?.aprobado,
      }));
    }
  }, [usuario, rol, aprobado]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Estado de carga más claro
  if (loading && !userData) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Si no hay usuario logueado, muestra solo el botón
  if (!userData) {
    return (
      <button
        ref={btnRef}
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-white"
      >
        <Menu size={20} />
      </button>
    );
  }

  // Opciones por rol
  const opciones = [
    ...(userData?.rol === ROLES.ADMIN
      ? [{ label: "Panel Admin", href: "/admin-expertos" }]
      : []),

    ...(userData?.rol === ROLES.EXPERTO && userData?.aprobado
      ? [
          { label: "Mi Dashboard", href: "/expert-dashboard" },
          { label: "Mis Servicios", href: "/mis-servicios" },
          { label: "Consultas Recibidas", href: "/consultas-recibidas" },
        ]
      : []),

    ...(userData?.rol === ROLES.USUARIO
      ? [
          { label: "Mis Consultas", href: "/mis-consultas" },
          { label: "Mis Compras", href: "/mis-compras" },
          // 🔥 NUEVO: historial de calificaciones y comentarios
          { label: "Mis valoraciones", href: "/mis-valoraciones" },
        ]
      : []),

    // Muestra "Mis valoraciones" también si no está fijado el rol (por si acaso)
    ...(userData?.rol && userData?.rol !== ROLES.USUARIO ? [] : [{ label: "Mis valoraciones", href: "/mis-valoraciones" }]),

    { label: "Mi Perfil", href: "/perfil" },
  ];

  return (
    <div className="relative">
      {/* Avatar / Botón */}
      <button
        ref={btnRef}
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-white"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt={userData.displayName || "Usuario"}
            className="w-full h-full object-cover"
          />
        ) : (
          <Menu size={20} />
        )}
      </button>

      {/* Menú */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-[9999] overflow-hidden"
          role="menu"
        >
          <div className="px-4 py-2 border-b text-sm text-gray-700 truncate">
            {userData.displayName || userData.email}
          </div>

          <nav className="py-1">
            {opciones.map((op, idx) => (
              <a
                key={`${op.href}-${idx}`}
                href={op.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                role="menuitem"
              >
                {op.label}
              </a>
            ))}
          </nav>

          <div className="border-t">
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
