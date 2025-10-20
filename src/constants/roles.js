// src/constants/roles.js
export const ROLES = {
EXPERTO: "experto",
USUARIO: "usuario",
ADMIN: "admin",
};


export function normalizeRole(value) {
if (!value) return ROLES.USUARIO;
const v = String(value).trim().toLowerCase();
if ([ROLES.EXPERTO, ROLES.USUARIO, ROLES.ADMIN].includes(v)) return v;
return ROLES.USUARIO;
}