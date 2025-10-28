// src/auth/pathByRole.js
/** Devuelve la ruta inicial según rol y aprobación */
export function pathByRole(rolRaw, aprobadoRaw) {
  const rol = String(rolRaw ?? "").trim().toLowerCase();
  const aprobado = Boolean(aprobadoRaw);

  if (rol === "admin") return "/admin-expertos";
  if (rol === "experto") return aprobado ? "/expert-dashboard" : "/espera-aprobacion";
  return "/mis-consultas"; // usuario o desconocido -> usuario
}
