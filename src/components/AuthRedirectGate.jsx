// src/components/AuthRedirectGate.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { getRedirectResult } from "firebase/auth";
import { pathByRole } from "@/auth/pathByRole";
import { normalizeRole } from "@/constants/roles";


export default function AuthRedirectGate() {
const navigate = useNavigate();


useEffect(() => {
let mounted = true;
(async () => {
try {
const res = await getRedirectResult(auth);
const pendingRole = normalizeRole(sessionStorage.getItem("pendingRole"));
sessionStorage.removeItem("pendingRole");
sessionStorage.removeItem("loginIntent");


if (!mounted) return;


if (res && res.user) {
const target = pathByRole(res.user, pendingRole);
navigate(target, { replace: true });
return;
}
// No hubo redirect para procesar: no hacemos nada disruptivo
} catch (_) {
// Silencioso: evita loops por errores del SDK
}
})();
return () => {
mounted = false;
};
}, [navigate]);


return null; // no UI
}