// src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, db, app } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ensureUserDoc } from "@/auth/ensureUserDoc";

// 🔹 Debe ir después de los imports (import siempre primero)
const t0_global =
  typeof performance !== "undefined" ? performance.now() : Date.now();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   // --- Debug de proyecto/origin en Preview ---
   try {
     console.info(
       "[fb] projectId:", app?.options?.projectId,
       "origin:", location.origin
     );
   } catch (e) {
     console.info("[fb] debug fail:", e);
   }

   
    const log = (...a) => console.info("[AUTHCTX]", ...a);
    console.info("[AuthContext] usando src/auth/context/AuthContext.jsx");
    let unsub = () => {};

    (async () => {
      log(
        "mount at",
        (performance.now() - t0_global).toFixed(1),
        "ms, location:",
        location.href
      );

       // 🔹 Marca si venimos de redirect (seteado en startLogin)
      const redirectFlag = sessionStorage.getItem("redirectInProgress") ? "1" : "0";
      log("redirectInProgress?", redirectFlag);

    const t0 = performance.now();
      // 0) Consumir el resultado del redirect si existe (clave en móvil)
      try {
        const res = await getRedirectResult(auth);
        log(
          "getRedirectResult() done in",
          (performance.now() - t0).toFixed(1),
          "ms — user?",
          !!res?.user
        );
        console.log(
          "[auth] currentUser after getRedirectResult:",
          auth.currentUser?.uid,
          auth.currentUser?.email
        );

        if (res?.user) {
          console.info("[auth] redirect OK:", res.user.uid);
          // 🔹 Garantiza perfil mínimo en Firestore (rol base) tras redirect
          const pendingRole =
            (localStorage.getItem("pendingRole") || "usuario").toLowerCase();
          try {
            await ensureUserDoc(res.user, pendingRole);
          } catch (e) {
            console.warn(
              "[auth] ensureUserDoc after redirect error:",
              e?.message || e
            );
          }
        } else {
          console.info("[auth] no redirect result (null)");
        }
        // 🔹 Ventana de gracia (experimento timing)
        await new Promise((r) => setTimeout(r, 500));
        // 🔹 Limpiar el flag tras procesar
        try {
          sessionStorage.removeItem("redirectInProgress");
        } catch {}
      } catch (e) {
        console.warn("[auth] getRedirectResult error:", e?.message || e);
      }

      // 1) Listener principal (después de getRedirectResult)
         unsub = onAuthStateChanged(auth, async (u) => {
        log(
          "onAuthStateChanged fired at +",
          (performance.now() - t0).toFixed(1),
          "ms — currentUser?",
          !!u,
          "auth.currentUser?",
          !!auth.currentUser
        );
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
           let ref = doc(db, "users", u.uid);
          let snap = await getDoc(ref);

          // Si no existe, lo creamos con el rol pendiente/base y re-leemos
          if (!snap.exists()) {
            const pendingRole = (
              localStorage.getItem("pendingRole") || "usuario"
            ).toLowerCase();console.warn("[auth] users/uid no existe, creando con rol:", pendingRole);
            await ensureUserDoc(u, pendingRole);
            snap = await getDoc(ref);
          }

          const data = snap.exists() ? snap.data() : {};
          const r = (data.rol || "").toLowerCase() || null;
          setRol(r);

          setAprobado(Boolean(data.aprobado));
        } catch (e) {
          console.warn("[auth] perfil error:", e?.message || e);
          // Fallback mínimo
          setRol(
            (localStorage.getItem("pendingRole") || "usuario").toLowerCase()
          );setAprobado(false);
        } finally {
          // Limpia intención guardada (si existía)
          try { localStorage.removeItem("pendingRole"); } catch {}
          setLoading(false);
        }
      });
      
      // 🔹 Watchdog: detectar si nunca llega sesión (pista de bloqueo cookies/ITP)
      let attempts = 0;
      for (; attempts < 20 && !auth.currentUser; attempts++) {
        await new Promise((r) => setTimeout(r, 100 * (attempts + 1)));
      }
      log(
        "poll end:",
        attempts,
        "attempts — auth.currentUser?",
        !!auth.currentUser
      );
    })();

    return () => unsub && unsub();
  }, []);

  const value = useMemo(() => ({ user, rol, aprobado, loading }), [user, rol, aprobado, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
