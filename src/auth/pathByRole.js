// src/auth/pathByRole.js
import { ROLES } from "@/constants/roles";

/** Devuelve la ruta inicial según rol y aprobación */
export function pathByRole(role, aprobado) {
  switch (role) {
    case ROLES.ADMIN:
      return "/admin-expertos";
    case ROLES.EXPERTO:
      // 👇 Usa /expert-dashboard según tu captura
      return aprobado ? "/dashboard" : "/espera-aprobacion";
    default:
      return "/mis-consultas";
  }
}
