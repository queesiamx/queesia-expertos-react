// src/constants/roles.js
export const ROLES = {
  ADMIN: "admin",
  EXPERTO: "experto",
  USUARIO: "usuario",
};

export function normalizeRole(v) {
  if (!v) return ROLES.USUARIO;
  const s = String(v).trim().toLowerCase();
  if (["admin", "administrator"].includes(s)) return ROLES.ADMIN;
  if (["experto", "expert"].includes(s)) return ROLES.EXPERTO;
  return ROLES.USUARIO;
}
