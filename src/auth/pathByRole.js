// src/auth/pathByRole.js
import { ROLES, normalizeRole } from "@/constants/roles";

export function pathByRole(_user, roleLike) {
  const role = normalizeRole(roleLike);
  switch (role) {
    case ROLES.ADMIN:
      return "/admin-expertos";
    case ROLES.EXPERTO:
      // 🔁 Unificado con tu RedirectByRole: aquí debe ser "/dashboard"
      return "/dashboard";
    case ROLES.USUARIO:
      return "/mis-consultas";
    default:
      // Si aún no hay rol válido, quédate en home hasta resolver
      return "/";
  }
}