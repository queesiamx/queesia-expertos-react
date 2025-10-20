// src/auth/pathByRole.js
import { ROLES, normalizeRole } from "@/constants/roles";


export function pathByRole(user, roleLike) {
const role = normalizeRole(roleLike);
if (role === ROLES.ADMIN) return "/admin-expertos";
if (role === ROLES.EXPERTO) return "/expert-dashboard";
return "/mis-consultas";
}