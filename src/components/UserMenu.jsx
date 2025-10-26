// src/components/UserMenu.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { pathByRole } from "@/auth/pathByRole";
import { Menu } from "lucide-react";
import { ROLES } from "../constants/roles";
import { useAuth } from "../hooks/useAuth";
//import { auth } from "@/firebase";
import { handleLogout } from "@/auth/logout";

export default function UserMenu({ usuario }) {

  const [isOpen, setIsOpen] = useState(false);
  const { rol, aprobado, loading } = useAuth();
  const [userData, setUserData] = useState(usuario);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const [errorFoto, setErrorFoto] = useState(false);
  const navigate = useNavigate();

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

  // Mostrar "Mis valoraciones" solo si es USUARIO o si aún no hay rol definido
  const showMisValoraciones =
    !userData?.rol || userData?.rol === ROLES.USUARIO;

  // Opciones por rol (sin duplicados)
  const opciones = [
    ...(userData?.rol === ROLES.ADMIN
      ? [{ label: "Panel Admin", href: "/admin-expertos" }]
      : []),

    ...(userData?.rol === ROLES.EXPERTO && userData?.aprobado
      ? [
          { label: "Mi Dashboard", href: "/expert-dashboard" },
          { label: "Mis Servicios", href: "/expert-dashboard#servicios" }, // << aquí
          { label: "Consultas Recibidas", href: "/consultas-recibidas" },
        ]
      : []),

    ...(userData?.rol === ROLES.USUARIO
      ? [
          { label: "Mis Consultas", href: "/mis-consultas" },
          { label: "Mis Compras", href: "/mis-compras" },
        ]
      : []),

    ...(showMisValoraciones
      ? [{ label: "Mis valoraciones", href: "/mis-valoraciones" }]
      : []),

    { label: "Mi Perfil", href: "/perfil" },
  ];

    // --- Avatar (Google) con fallback y reset de error ---
const rawFoto =
  userData?.fotoPerfilURL ||  // opcional si lo usas
  userData?.photoURL ||
  userData?.providerData?.[0]?.photoURL ||
  null;


// (Opcional) Forzar tamaño pequeño de Google si viene con params: ...=s96-c
const normalizeGooglePhoto = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    // Si la URL ya trae "=sXX-c", la dejamos; si no, no forzamos nada.
    return u.toString();
  } catch {
    return url;
  }
};

const normalizedFotoURL = rawFoto ? normalizeGooglePhoto(rawFoto) : null;

// Si cambia la URL de foto, limpia el estado de error para reintentar
useEffect(() => {
  setErrorFoto(false);
}, [normalizedFotoURL]);

const fotoURL = !errorFoto && normalizedFotoURL ? normalizedFotoURL : null;

const inicial = (
  userData?.displayName?.[0] ||
  userData?.email?.[0] ||
  "U"
).toUpperCase();



  return (
    <div className="relative">
      {/* Avatar / Botón */}
      <button
  ref={btnRef}
  onClick={() => setIsOpen((v) => !v)}
  className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-white"
  aria-haspopup="menu"
  aria-expanded={isOpen}
  title={userData.displayName || userData.email || "Usuario"}
>
  {fotoURL ? (
    <img
      src={fotoURL}
      alt={userData.displayName || "Usuario"}
      className="w-full h-full object-cover"
        width={40}
        height={40}
      onError={() => setErrorFoto(true)}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="w-full h-full grid place-items-center bg-gray-200">
      <span className="font-semibold text-gray-800 text-lg leading-none">
        {inicial}
      </span>
    </div>
  )}
</button>


      {/* Menú */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-[9999] overflow-hidden"
          role="menu"
        >
          {/* Header con nombre y correo */}
          <div className="px-4 py-3 border-b">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {userData.displayName || userData.email}
            </div>
            {userData.displayName && userData.email && (
              <div className="text-xs text-gray-600 truncate">{userData.email}</div>
            )}
          </div>

          <nav className="py-1">
           {/* ✅ Ir a mi panel (dinámico por rol real) */}
            {userData && (rol || userData.rol) && (
              <Link
                to={pathByRole(userData, rol || userData.rol)}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                role="menuitem"
              >
                📂 Ir a mi panel
              </Link>
            )}

            
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
               onClick={async () => {
                 await handleLogout();
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
