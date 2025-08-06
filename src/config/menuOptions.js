// src/config/menuOptions.js
import { ROLES } from "../constants/roles";

export const getMenuOptions = (rol, aprobado, usuario) => {
  return [
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
};
