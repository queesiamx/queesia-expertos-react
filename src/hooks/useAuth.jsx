//src/hooks/useAuth.js (NEW) ***
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthCtx = createContext({ user: null, rol: null, authReady: false });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const off = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          // Ajusta colección/campo según tu esquema
          const snap = await getDoc(doc(db, 'users', u.uid));
          setRol(snap.exists() ? (snap.data()?.rol ?? null) : null);
        } catch {
          setRol(null);
        }
      } else {
        setRol(null);
      }
      setAuthReady(true);
    });
    return () => off();
  }, []);

  const value = useMemo(() => ({ user, rol, authReady }), [user, rol, authReady]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
