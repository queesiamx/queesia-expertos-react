 // src/auth/logout.js
 import { auth } from "@/firebase";
 import { signOut } from "firebase/auth";

 // Limpia sesión + intención/rol guardados
 export async function handleLogout() {
   try {
     await signOut(auth);
   } finally {
     try {
       localStorage.removeItem("pendingRole");
       localStorage.removeItem("loginIntent");
       sessionStorage.removeItem("pendingRole");
       sessionStorage.removeItem("loginIntent");
     } catch {}
   }
 }
