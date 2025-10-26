// src/constants/roles.js
export const ROLES = {
  ADMIN: "admin",
  EXPERTO: "experto",
  USUARIO: "usuario",
};

// Acepta variantes y mayúsculas; devuelve siempre uno de ROLES o null
export function normalizeRole(input) {
  if (!input && input !== 0) return null;
  const s = String(input).trim().toLowerCase();
  if (["admin", "administrador", "adm"].includes(s)) return ROLES.ADMIN;
  if (["experto", "expert", "exp"].includes(s)) return ROLES.EXPERTO;
  if (["usuario", "user", "cliente"].includes(s)) return ROLES.USUARIO;
  return null; // <— importante: no forzamos "usuario" por defecto
}

export function isValidRole(r) {
  return [ROLES.ADMIN, ROLES.EXPERTO, ROLES.USUARIO].includes(r);
}
