// src/hooks/useAuth.jsx
import { useEffect, useState, useContext, createContext, useMemo, useRef } from "react";
import { normalizeRole } from "@/constants/roles";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);


  // Suscripción al estado de Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[auth] onAuthStateChanged:", firebaseUser?.uid || null);
      try {
        if (!firebaseUser) {
          setUser(null);
          setRol(null);
          setAprobado(false);
          return; // loading baja en finally
        }

        // Opcional: hidratar token en algunos navegadores
        try { await firebaseUser.getIdToken(false); } catch {}
       if (!mountedRef.current) return;
        setUser(firebaseUser);

        // Carga de perfil (rol/aprobado)
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() || {};
          setRol(normalizeRole(data.rol ?? null));
          setAprobado(Boolean(data.aprobado));
        } else {
          // Fallback con el rol elegido antes de loguear
          const pendingRole = (sessionStorage.getItem("pendingRole") || "USUARIO").toUpperCase();
          setRol(normalizeRole(pendingRole));
          setAprobado(false);
        }
      } catch (e) {
        console.error("Auth load error:", e);
        setRol(null);
        setAprobado(false);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // Evita re-renders inútiles y también hace más feliz al HMR de Vite
  const value = useMemo(
    () => ({
      user,
      rol,
      aprobado,
      loading,
      signedIn: Boolean(user),
    }),
    [user, rol, aprobado, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
