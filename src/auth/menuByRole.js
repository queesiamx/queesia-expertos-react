// src/auth/menuByRole.js — RTC_CO (helper de opciones por rol)
import { ROLES } from "@/constants/roles";
import { pathByRole } from "@/auth/pathByRole";

/**
 * Genera las opciones del menú según rol/aprobado.
 * baseUrl permite apuntar a otro dominio (ej. blog -> expertos.queesia.com)
 */
export function getMenuOptionsByRole({ rol, aprobado, baseUrl = "" } = {}) {
  const prefix = (href) =>
    href.startsWith("http") ? href : `${baseUrl}${href}`;

  const opciones = [];

  // 1) Ir a mi panel (principal)
  if (rol) {
    const panelHref = pathByRole(rol, aprobado);
    if (panelHref) {
      opciones.push({
        key: "panel",
        label: "📂 Ir a mi panel",
        href: prefix(panelHref),
        type: "primary",
      });
    }
  }

  // 2) Opciones específicas por rol
  if (rol === ROLES.ADMIN) {
    opciones.push({
      key: "admin",
      label: "Panel Admin",
      href: prefix("/admin-expertos"),
    });
  }

  if (rol === ROLES.EXPERTO && aprobado) {
    opciones.push(
      {
        key: "dash",
        label: "Mi Dashboard",
        href: prefix("/expert-dashboard"),
      },
      {
        key: "servicios",
        label: "Mis Servicios",
        href: prefix("/expert-dashboard#servicios"),
      },
      {
        key: "consultas-recibidas",
        label: "Consultas Recibidas",
        href: prefix("/consultas-recibidas"),
      }
    );
  }

  if (rol === ROLES.USUARIO) {
    opciones.push(
      {
        key: "mis-consultas",
        label: "Mis Consultas",
        href: prefix("/mis-consultas"),
      },
      {
        key: "mis-compras",
        label: "Mis Compras",
        href: prefix("/mis-compras"),
      }
    );
  }

  // 3) Mis valoraciones para usuario o sin rol explícito
  if (!rol || rol === ROLES.USUARIO) {
    opciones.push({
      key: "mis-valoraciones",
      label: "Mis valoraciones",
      href: prefix("/mis-valoraciones"),
    });
  }

  // 4) Mi perfil (siempre)
  opciones.push({
    key: "perfil",
    label: "Mi Perfil",
    href: prefix("/perfil"),
  });

  return opciones;
}
