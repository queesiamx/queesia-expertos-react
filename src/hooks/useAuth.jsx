// src/hooks/useAuth.jsx
import { useEffect, useState, useContext, createContext, useMemo } from "react";
import { normalizeRole } from "@/constants/roles";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Garantiza persistencia local para no “perder” sesión en recargas
    setPersistence(auth, browserLocalPersistence).catch(() => {});

    // 2) Suscripción al estado de Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setRol(null);
          setAprobado(false);
          return;
        }

        setUser(firebaseUser);

        // Carga de rol/perfil
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
          if (snap.exists()) {
          const data = snap.data() || {};
          setRol(normalizeRole(data.rol ?? null));
          setAprobado(Boolean(data.aprobado));
        } else {
          setRol(null);
          setAprobado(false);
        }
      } catch (e) {
        console.error("Auth load error:", e);
        // Estado seguro para no bloquear UI
        setRol(null);
        setAprobado(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Evita re-renders inútiles y también hace más feliz al HMR de Vite
  const value = useMemo(() => ({ user, rol, aprobado, loading }), [user, rol, aprobado, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
