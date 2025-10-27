// src/auth/pathByRole.js

/** Devuelve la ruta inicial según rol y aprobación */
// src/auth/pathByRole.js

/** Devuelve la ruta inicial según rol y aprobación */
export const pathByRole = (rolRaw, aprobadoRaw) => {
  const rol = (rolRaw || '').toString().trim().toLowerCase();
  const aprobado = Boolean(aprobadoRaw);

  if (rol === 'admin') return '/admin-expertos';
  if (rol === 'experto') return aprobado ? '/expert-dashboard' : '/espera-aprobacion';
  return '/mis-consultas'; // fallback usuario
};
