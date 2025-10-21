// src/components/CompraContenidoModal.jsx
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { toast } from "react-hot-toast";

export default function CompraContenidoModal({ open, onClose, experto, content, tipo }) {
  // tipo: "curso" | "manual"
  const [fechaSel, setFechaSel] = useState("");
  const isCourse = tipo === "curso";
  const fechas = Array.isArray(content.fechasDisponibles) ? content.fechasDisponibles : [];
  const precio = Number(content.precio ?? content.price ?? 0);

  const crearCompra = async () => {
    const user = auth.currentUser;
    if (!user) { toast.error("Inicia sesión para comprar"); return; }
    if (isCourse && !fechaSel) { toast.error("Selecciona una fecha"); return; }

    try {
      const compra = {
        userId: user.uid,
        expertoId: experto.id,          // id del doc en "experts"
        contenidoId: content.id,        // id del doc en "contenidosExpertos"
        titulo: content.titulo || content.nombre || "Contenido",
        tipo,                           // "curso" o "manual"
        precio,
        fechaSeleccionada: isCourse ? fechaSel : null,
        estado: import.meta.env.VITE_STRIPE_PK ? "pagando" : "porPagar",
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "comprasContenido"), compra);

      if (import.meta.env.VITE_STRIPE_PK) {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            compraId: ref.id,
            name: compra.titulo,
            amount: Math.round(precio * 100), // MXN
            metadata: {
              compraId: ref.id,
              expertoId: experto.id,
              contenidoId: content.id,
              fechaSeleccionada: compra.fechaSeleccionada || ""
            }
          }),
        });
        const { url, error } = await res.json();
        if (error || !url) throw new Error(error || "Sin URL de pago");
        window.location.href = url;
        return;
      }

      toast.success("Reserva creada. Te contactaremos para completar el pago.");
      onClose();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo iniciar la compra");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
      <div className="bg-white w-full max-w-lg p-5 rounded-2xl">
        <div className="text-lg font-semibold mb-3">
          Comprar: {content.titulo || content.nombre}
        </div>

        {isCourse && (
          <>
            <div className="text-sm mb-2">Selecciona una fecha:</div>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={fechaSel}
              onChange={(e)=>setFechaSel(e.target.value)}
            >
              <option value="">-- Elegir --</option>
              {fechas.map(f => (
                <option key={f} value={f}>{new Date(f).toLocaleString()}</option>
              ))}
            </select>
          </>
        )}

        <div className="flex justify-end gap-2">
          <button className="border px-3 py-2 rounded" onClick={onClose}>Cancelar</button>
          <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={crearCompra}>
            {import.meta.env.VITE_STRIPE_PK ? "Ir a pagar" : "Reservar"}
          </button>
        </div>
      </div>
    </div>
  );
}
