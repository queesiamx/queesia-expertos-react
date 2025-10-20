// src/auth/startLogin.js
import { auth } from "@/firebase";
import {
GoogleAuthProvider,
signInWithPopup,
signInWithRedirect,
browserLocalPersistence,
setPersistence,
} from "firebase/auth";
import { normalizeRole } from "@/constants/roles";


const provider = new GoogleAuthProvider();


function isMobile() {
if (typeof navigator === "undefined") return false;
const ua = navigator.userAgent || "";
return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}


/**
* Inicia login con selección de rol. No navega; el ruteo lo hará AuthRedirectGate (redirect) o el caller (popup).
*/
export async function startLogin(selectedRole = "usuario", intent = "login") {
const role = normalizeRole(selectedRole);
// Limpia banderas anteriores
sessionStorage.removeItem("pendingRole");
sessionStorage.removeItem("loginIntent");
sessionStorage.setItem("pendingRole", role);
sessionStorage.setItem("loginIntent", intent);


await setPersistence(auth, browserLocalPersistence);


if (isMobile()) {
// En móvil usamos redirect; AuthRedirectGate procesará el resultado.
await signInWithRedirect(auth, provider);
return null;
}


// Desktop: popup.
const cred = await signInWithPopup(auth, provider);
return cred;
}