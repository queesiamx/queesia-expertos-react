// src/pages/PagoExitoso.jsx
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PagoExitoso() {
  const [params] = useSearchParams();
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState("Procesando pago...");

  useEffect(() => {
    const session_id = params.get("session_id");
    const compraId = params.get("c");
    if (!session_id || !compraId) {
      setMsg("Faltan parámetros de confirmación.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/confirmarPago`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, compraId }),
        });
        if (!res.ok) throw new Error(await res.text());
        setOk(true);
        setMsg("¡Pago confirmado! Tu acceso fue habilitado.");
      } catch (err) {
        console.error(err);
        setOk(false);
        setMsg("Error confirmando el pago.");
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 text-green-900 px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 mb-4 text-green-600" />
      <h1 className="text-3xl font-bold mb-2">{ok ? "¡Listo!" : "Confirmando..."}</h1>
      <p className="mb-6">{msg}</p>
      <Link to="/#expertos" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
        Volver a expertos
      </Link>
    </div>
  );
}
