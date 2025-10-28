// src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.info("[AuthContext] usando src/auth/context/AuthContext.jsx");
    let unsub = () => {};

    (async () => {
      // 0) Consumir el resultado del redirect si existe (clave en móvil)
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          console.info("[auth] redirect OK:", res.user.uid);
        } else {
          console.info("[auth] no redirect result (null)");
        }
      } catch (e) {
        console.warn("[auth] getRedirectResult error:", e?.message || e);
      }

      // 1) Listener principal (después de getRedirectResult)
      unsub = onAuthStateChanged(auth, async (u) => {
        setLoading(true);

        if (!u) {
          console.info("[auth] sin sesión");
          setUser(null);
          setRol(null);
          setAprobado(false);
          setLoading(false);
          return;
        }

        // 2) Cargar perfil (rol/aprobado) desde Firestore
        try {
          setUser(u);
          const snap = await getDoc(doc(db, "users", u.uid));
          const data = snap.exists() ? snap.data() : {};
          const r = (data.rol || "").toLowerCase() || null;
          setRol(r);

          setAprobado(Boolean(data.aprobado));
        } catch (e) {
          console.warn("[auth] perfil error:", e?.message || e);
          // Fallback mínimo
          setRol((localStorage.getItem("pendingRole") || "usuario").toLowerCase());
          setAprobado(false);
        } finally {
          // Limpia intención guardada (si existía)
          try { localStorage.removeItem("pendingRole"); } catch {}
          setLoading(false);
        }
      });
    })();

    return () => unsub && unsub();
  }, []);

  const value = useMemo(() => ({ user, rol, aprobado, loading }), [user, rol, aprobado, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
