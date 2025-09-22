// src/lib/currency.js
export function formatMXN(amount, opts = {}) {
  if (amount == null) return ""; // sin precio → vacío
  const { withCents = false } = opts;

  // Acepta number o string numérica
  const n = typeof amount === "string" ? Number(amount.replace(/[^\d.-]/g, "")) : amount;
  if (!Number.isFinite(n)) return "";

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(n); // ej: $1,820 o $1,820.00
}
