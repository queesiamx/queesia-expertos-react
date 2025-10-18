// src/auth/startLogin.js
import { auth } from "../firebase";
import {
GoogleAuthProvider,
signInWithPopup,
signInWithRedirect,
} from "firebase/auth";

export const ADMIN_EMAILS = [
  "queesiamx@gmail.com",
  "queesiamx.employee@gmail.com",
];

export function pathByRole(user, pendingRole = "USUARIO") {
const email = user?.email || "";
const pr = String(pendingRole || "USUARIO").toUpperCase();
const isAdmin = ADMIN_EMAILS.includes(email) || pr === "ADMIN";
const isExpert = pr === "EXPERTO";
if (isAdmin) return "/admin-expertos";
if (isExpert) return "/expert-dashboard";
return "/mis-consultas";
}

export async function startLogin(selectedRole = "USUARIO", intent = "login") {
// Flags para post-redirect
localStorage.setItem("pendingRole", String(selectedRole).toUpperCase());
localStorage.setItem("authIntent", intent);
localStorage.setItem("authRedirectPending", "1");

// Proveedor Google; forzamos selector de cuenta
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const isMobile =
typeof navigator !== "undefined" &&
/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

if (isMobile) {
try {
await signInWithRedirect(auth, provider);
} catch (e) {
console.error("[startLogin redirect]", e);
}
return;
}

try {
await signInWithPopup(auth, provider);
} catch (e) {
if (e?.code !== "auth/popup-closed-by-user") {
console.error("[startLogin popup]", e);
}
}
}