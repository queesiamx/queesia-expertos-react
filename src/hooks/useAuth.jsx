// src/hooks/useAuth.jsx
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { normalizeRole, isValidRole } from "@/constants/roles";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(null); // opcional, útil en tu flujo
  const [initializing, setInitializing] = useState(true);

  const mountedRef = useRef(true);

  // ⚡ rol cacheado para primer render (siempre en minúsculas)
  useEffect(() => {
    const cached = sessionStorage.getItem("cachedRole");
    if (cached && !rol) setRol(normalizeRole(cached));
  }, [rol]);

  useEffect(() => {
    mountedRef.current = true;

    const unsub = onAuthStateChanged(auth, async (u) => {
      // 1) Asienta user inmediatamente (aunque sea null)
      setUser(u || null);

      if (!u) {
        setRol(null);
        setAprobado(null);
        setInitializing(false);
        return;
      }

      // 2) Recupera rol (users → experts como respaldo)
      try {
        let snap = await getDoc(doc(db, "users", u.uid));

        if (!snap.exists()) {
          // respaldo: algunos flujos guardan el rol/estado en experts
          const alt = await getDoc(doc(db, "experts", u.uid));
          if (alt.exists()) snap = alt;
        }

        const data = snap.exists() ? snap.data() : {};
       const nextRol = normalizeRole(data?.rol);          // → "admin" | "experto" | "usuario" | null
        const safeRol = isValidRole(nextRol) ? nextRol : null;
        setRol(safeRol);
        if (safeRol) sessionStorage.setItem("cachedRole", safeRol);
        else sessionStorage.removeItem("cachedRole");

        // si tu doc tiene aprobado, úsalo; si no, queda en null
        setAprobado(
          typeof data?.aprobado === "boolean" ? data.aprobado : null
        );
      } catch (e) {
        console.warn("[useAuth] getDoc error:", e?.message || e);
        setRol(null);                          // no asumir rol
        sessionStorage.removeItem("cachedRole");
        setAprobado(null);
      } finally {
        if (mountedRef.current) setInitializing(false);
      }
    });

    return () => {
      mountedRef.current = false;
      unsub();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      rol,
      aprobado,
      initializing,
      loading: initializing,      // alias para compatibilidad con RedirectByRole
       
      signedIn: !!user,
    }),
    [user, rol, aprobado, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
