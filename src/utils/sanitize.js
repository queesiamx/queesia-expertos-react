export function sanitizePayload(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v === undefined) continue;               // quita undefined
    if (typeof v === "string") out[k] = v.trim();
    else out[k] = v;
  }
  return out;
}
