import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { ROLES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

export default function UserMenu({ usuario, handleLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const { rol, aprobado } = useAuth();

  const [userData, setUserData] = useState(usuario);

  useEffect(() => {
  if (usuario) {
    setUserData((prev) => ({
      ...usuario,
      rol: rol || prev?.rol,
      aprobado: aprobado ?? prev?.aprobado
    }));
  }
}, [usuario, rol, aprobado]);


  // 🚀 Si todavía no tenemos rol o aprobado definidos, no mostramos nada
  if (!userData?.rol && userData?.rol !== ROLES.USUARIO) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
      </div>
    );
  }

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
        ]
      : []),
    { label: "Mi Perfil", href: "/perfil" },
  ];

  return (
    <div className="relative">
      {/* Avatar / Botón */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-white"
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

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-[9999]">
          <div className="px-4 py-2 border-b text-sm text-gray-700 truncate">
            {userData.displayName || userData.email}
          </div>

          {opciones.map((op, idx) => (
            <a
              key={idx}
              href={op.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
            >
              {op.label}
            </a>
          ))}

          <div className="border-t">
  <button
    onClick={() => {
      handleLogout();
      setIsOpen(false);
    }}
    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
  >
    Cerrar sesión
  </button>
</div>

        </div>
      )}
    </div>
  );
}
