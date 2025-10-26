// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { getOrCreateUserProfile } from "@/auth/roleService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          setUser(null);
          setRol(null);
          setAprobado(false);
          setLoading(false);
          return;
        }
        const profile = await getOrCreateUserProfile(u);
        setUser(u);
        setRol(profile.rol);
        setAprobado(Boolean(profile.aprobado));
      } catch (e) {
        console.error("Auth profile error", e);
        setUser(u);
        setRol(null);
        setAprobado(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({ user, rol, aprobado, loading }),
    [user, rol, aprobado, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
