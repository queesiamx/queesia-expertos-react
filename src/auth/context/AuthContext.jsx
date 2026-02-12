// src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, getRedirectResult, signInWithCustomToken, signOut } from "firebase/auth";
import { auth, db, app } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ensureUserDoc } from "@/auth/ensureUserDoc";

// 🔹 Debe ir después de los imports (import siempre primero)
const t0_global =
  typeof performance !== "undefined" ? performance.now() : Date.now();

const AuthContext = createContext(null);

// ✅ En expertos podemos usar ruta relativa. Si quieres, lo puedes volver env var.
const SSO_API = "/api/trackVisit";


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [rol, setRol] = useState(null);
  const [aprobado, setAprobado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

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
    let bridgeTried = false; // evita loops

      async function ssoMe() {
      try {
        const r = await fetch(`${SSO_API}?action=me`, { credentials: "include" });
        return await r.json();
      } catch {
        return { user: null };
      }
    }

    async function ssoLoginWithIdToken(idToken) {
      try {
        const r = await fetch(`${SSO_API}?action=login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ idToken }),
        });
        return r.ok;
      } catch {
        return false;
      }
    }

    async function ssoBridgeToFirebase() {
      const r = await fetch(`${SSO_API}?action=customtoken`, { credentials: "include" });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data?.customToken) {
        await signInWithCustomToken(auth, data.customToken);
        return true;
      }
      return false;
    }

    async function syncWithSSO() {
      const me = await ssoMe();
      const cookieHasUser = !!me?.user?.uid;
      const fbHasUser = !!auth.currentUser;

      if (!cookieHasUser && fbHasUser) {
        console.info("[SSO] cookie OFF -> signOut(firebase)");
        await signOut(auth);
        return;
      }

      if (cookieHasUser && !fbHasUser) {
        console.info("[SSO] cookie ON -> bridge to firebase");
        await ssoBridgeToFirebase();
      }
    }

    (async () => {
      log(
        "mount at",
        (performance.now() - t0_global).toFixed(1),
        "ms, location:",
        location.href
      );

       // 🔹 Marca si venimos de redirect (seteado en startLogin)
      const redirectFlag = sessionStorage.getItem("redirectInProgress") ? "1" : "0";
      setRedirecting(redirectFlag === "1");
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

        if (!res?.user) {
          console.info("[auth] no redirect result (null)");
        }


       // ✅ Si venimos de redirect y hay user, setea cookie SSO global
        if (res?.user) {
          try {
            const idToken = await res.user.getIdToken(true);
            await ssoLoginWithIdToken(idToken);
          } catch (e) {
            console.warn("[SSO] login(cookie) fail after redirect:", e?.message || e);
          }
        }

        // 🔹 Ventana de gracia (experimento timing)

        await new Promise((r) => setTimeout(r, 500));
        // 🔹 Limpiar el flag tras procesar
        try {
          sessionStorage.removeItem("redirectInProgress");
        } catch {}
        setRedirecting(false);
      } catch (e) {
        console.warn("[auth] getRedirectResult error:", e?.message || e);
        setRedirecting(false);
      }

     // ✅ Sync inicial (por si cookie ya existe de otro subdominio)
      await syncWithSSO();
      const syncTimer = setInterval(syncWithSSO, 8000);

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
         // 🔹 Intento 1 vez: puente SSO(cookie) -> Firebase client (custom token)
          // Esto resuelve tu caso: en queesia.com "me" ya da user, pero en expertos auth.currentUser = false.
          if (!bridgeTried) {
            bridgeTried = true;
            log("no firebase session; trying SSO bridge (customtoken)...");
            try {
              const r = await fetch("/api/trackVisit?action=customtoken", {
                method: "GET",
                credentials: "include",
              });
              const data = await r.json().catch(() => ({}));
              if (r.ok && data?.customToken) {
                log("SSO bridge: got customToken; signing in with custom token...");
                await signInWithCustomToken(auth, data.customToken);
                // IMPORTANTE: aquí NO seteamos "sin sesión"; esperamos a que onAuthStateChanged dispare de nuevo con user
                return;
              } else {
                log("SSO bridge: no customToken (ok? ", r.ok, ") data:", data);
              }
            } catch (e) {
              log("SSO bridge error:", e?.message || e);
            }
          }

          console.info("[auth] sin sesión");
          setUser(null);
          setRol(null);
          setAprobado(false);
          setLoading(false);
          // ✅ si cookie SSO existe, “revivimos” sesión firebase en este subdominio
          try { await syncWithSSO(); } catch {}
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
      for (; attempts < 12 && !auth.currentUser; attempts++) {
        await new Promise((r) => setTimeout(r, 100 * (attempts + 1)));
      }
      log(
        "poll end:",
        attempts,
        "attempts — auth.currentUser?",
        !!auth.currentUser
      );
    return () => clearInterval(syncTimer);
    })();

    return () => unsub && unsub();
  }, []);

  const value = useMemo(
    () => ({ user, rol, aprobado, loading, redirecting }),
    [user, rol, aprobado, loading, redirecting]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
