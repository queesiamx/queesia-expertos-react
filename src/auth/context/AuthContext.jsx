// src/context/AuthContext.jsx
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
    let unsub = () => {};
    (async () => {
      // 0) Completa el flujo cuando el login fue por redirect (móvil/DevTools)
      try { await getRedirectResult(auth); } catch {}

      unsub = onAuthStateChanged(auth, async (u) => {
        setLoading(true);
        try {
          // Sin sesión
          if (!u) {
            setUser(null);
            setRol(null);
           setAprobado(false);
            setLoading(false);
            return;
          }

          // Con sesión: intenta leer perfil en Firestore
          let rolDb = null;
          let aprobadoDb = false;
          try {
            const snap = await getDoc(doc(db, "users", u.uid));
            if (snap.exists()) {
              const d = snap.data();
              rolDb = (d?.rol || "").toLowerCase() || null;
              aprobadoDb = Boolean(d?.aprobado);
            }
          } catch (e) {
            console.error("AuthContext: error leyendo users/{uid}", e);
          }

          // Fallback a intención guardada si Firestore aún no trae rol
          let pending = "";
          try { pending = (localStorage.getItem("pendingRole") || "").toLowerCase(); } catch {}
          const finalRol = (rolDb || pending || "usuario").toLowerCase();

          setUser(u);
         setRol(finalRol);
          setAprobado(Boolean(aprobadoDb));
          // Limpia intención
          try { localStorage.removeItem("pendingRole"); } catch {}
        } finally {
          setLoading(false);
        }
      });
    })();
    return () => unsub?.();
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
