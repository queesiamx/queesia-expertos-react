// src/auth/roleCache.js
const KEY = "cachedRole";

export function clearRoleCache() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export function setRoleCache(role) {
  try {
    if (role) sessionStorage.setItem(KEY, role);
    else sessionStorage.removeItem(KEY);
  } catch {}
}

export function getRoleCache() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}
