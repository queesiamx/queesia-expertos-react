//src/lib/url.js

export function ensureAbsoluteUrl(raw = "") {
  if (!raw) return "";
  const url = raw.trim();
  // Si ya trae protocolo, lo devolvemos tal cual
  if (/^https?:\/\//i.test(url)) return url;
  // Si empieza con // (protocol-relative), anteponemos https:
  if (/^\/\//.test(url)) return `https:${url}`;
  // Cualquier otro caso: anteponer https://
  return `https://${url}`;
}
