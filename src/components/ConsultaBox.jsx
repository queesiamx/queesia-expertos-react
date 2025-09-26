import { useState, useMemo, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";   // ajusta si no usas alias
import { auth } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  
} from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

// Detecta móvil
const isMobile =
  typeof navigator !== "undefined" &&
  /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

export default function ConsultaBox({
  expertoId,
  expertoNombre,
  className = "",
  maxChars = 600,
}) {
  const { user } = useAuth();
  const [texto, setTexto] = useState("");
  const [sending, setSending] = useState(false);

  const remaining = useMemo(() => maxChars - texto.length, [texto, maxChars]);
  const disabled = sending || texto.trim().length < 10 || remaining < 0;

  // Procesa regreso del redirect (solo muestra toast y deja la página lista)
 // useEffect(() => {
  //  getRedirectResult(auth)
   //   .then((res) => {
    //    if (res?.user) toast.success("Sesión iniciada");
   //   })
    //  .catch(() => {});
 // }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      if (isMobile) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
      toast.success("Sesión iniciada");
    } catch (e) {
      if (
        e.code !== "auth/popup-closed-by-user" &&
        e.code !== "auth/cancelled-popup-request"
      ) {
        toast.error("No se pudo iniciar sesión");
      }
    }
  };

  const handleSend = async () => {
    if (!user) {
      toast.error("Inicia sesión para enviar una consulta.");
      return;
    }
    if (!expertoId) {
      toast.error("No se encontró el experto.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "consultasModeradas"), {
        tipo: "consulta",
        estado: "porRevisar",
        origen: "publico",
        pregunta: texto.trim(),
        userId: user.uid,
        userNombre: user.displayName || user.email || "Usuario",
        userEmail: user.email ?? null,
        expertoId,
        expertoNombre: expertoNombre ?? null,
        createdAt: serverTimestamp(),
        precioSugeridoAdmin: null,
        precioPropuestoExperto: null,
        precioAprobado: null,
        pagado: false,
      });
      setTexto("");
      toast.success("Consulta enviada. Sujeto a revisión de administración.");
    } catch (e) {
      console.error(e);
      toast.error("No se pudo enviar la consulta.");
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className={"rounded-2xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm " + className}>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Consulta al experto</h3>
        <p className="text-sm text-slate-600 mb-4">
          Para enviar una consulta debes <strong>iniciar sesión</strong>. Tu pregunta será revisada por Queesia
          y podría requerir una respuesta profesional con costo <span className="font-medium">(sujeto a costes)</span>.
        </p>

        <button
          onClick={handleLogin}
          className="inline-flex items-center gap-3 rounded-full bg-black text-white px-5 py-2.5 font-medium shadow-sm
                     hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          aria-label="Iniciar sesión con Google"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 11.8v2.4h6.8c-.3 1.8-2.1 5.2-6.8 5.2-4.1 0-7.5-3.4-7.5-7.5S7.9 4.4 12 4.4c2.3 0 3.9.9 4.8 1.7l2-2C17.4 2.8 14.9 1.8 12 1.8 6.5 1.8 2 6.3 2 11.8s4.5 10 10 10c5.8 0 9.7-4 9.7-9.6 0-.6-.1-1.1-.2-1.6H12z"/>
            <path fill="#4285F4" d="M21.7 10.6H12v3.6h5.6c-.5 2.1-2.4 3.6-5.6 3.6-3.4 0-6.1-2.7-6.1-6.1S8.6 5.6 12 5.6c1.7 0 3 .6 3.9 1.5l2.6-2.5C16.9 3.2 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c5.6 0 9.2-3.9 9.2-9.2 0-.3 0-.6-.1-1z"/>
          </svg>
          Iniciar sesión con Google
        </button>
      </div>
    );
  }

  // Con sesión: textarea + enviar
  return (
    <div className={"rounded-2xl border border-slate-200/70 bg-slate-50 p-5 shadow-sm " + className}>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Consulta al experto</h3>
      <p className="text-sm text-slate-600 mb-3">
        Antes de enviar tu consulta, el equipo de Quesia la revisará. Algunas preguntas podrían requerir una respuesta profesional con costo.
        <span className="ml-1 font-medium text-slate-700">(sujeto a costes)</span>
      </p>

      <label htmlFor="consulta" className="sr-only">Describe tu consulta</label>
      <textarea
        id="consulta"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Describe tu consulta…"
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-slate-200"
      />

      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs ${remaining < 0 ? "text-red-600" : "text-slate-500"}`}>{remaining} caracteres</span>
        <button
          onClick={handleSend}
          disabled={disabled}
          aria-disabled={disabled}
          className={
            "rounded-full px-5 py-2 text-white transition " +
            (disabled ? "bg-emerald-400/60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700")
          }
        >
          {sending ? "Enviando…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
