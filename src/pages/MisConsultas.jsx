// src/pages/MisConsultas.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import NavbarUsuario from "../components/NavbarUsuario";
import toast from "react-hot-toast";

export default function MisConsultas() {
  const [consultas, setConsultas] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        try {
          const q = query(
            collection(db, "consultasModeradas"),
            where("usuarioId", "==", user.uid)
          );
          const snapshot = await getDocs(q);
          const datos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConsultas(datos);
        } catch (error) {
          toast.error("Error al cargar tus consultas");
          console.error(error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const manejarPago = async (consultaId) => {
    if (!usuario?.email) {
      toast.error("No se encontró tu correo electrónico.");
      return;
    }

    try {
      const response = await fetch("/api/crearPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultaId,
          email: usuario.email,
        }),
      });

      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("No se pudo generar el enlace de pago.");
      }
    } catch (error) {
      console.error("Error al generar el pago:", error);
      toast.error("Error al procesar el pago.");
    }
  };

  return (
    <>
      <NavbarUsuario />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Mis consultas</h1>
        {consultas.length === 0 ? (
          <p>No has enviado ninguna consulta aún.</p>
        ) : (
          <div className="space-y-4">
            {consultas.map((consulta) => {
              const estado = consulta.estado || "pendiente";
              const esTenue =
                estado === "pendiente" || estado === "porValidar";
              const yaPagado = estado === "pagado";
              const aprobadoGratis = estado === "resueltaGratis";
              const aprobadoPago = estado === "requierePago";

              return (
                <div
                  key={consulta.id}
                  className={`p-4 border rounded shadow ${
                    esTenue
                      ? "bg-gray-100 opacity-50"
                      : "bg-white opacity-100"
                  }`}
                >
                  <h2 className="font-semibold">{consulta.titulo}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    {consulta.contenido}
                  </p>

                  <p className="text-sm italic mb-2">
                    Estado:{" "}
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold
                        ${
                          estado === "resueltaGratis" || estado === "pagado"
                            ? "bg-green-200 text-green-800"
                            : estado === "requierePago"
                            ? "bg-yellow-200 text-yellow-800"
                            : estado === "rechazada"
                            ? "bg-red-200 text-red-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {estado}
                    </span>
                  </p>

                  {(aprobadoGratis || yaPagado) && consulta.respuesta && (
                    <div className="bg-green-100 p-3 rounded mt-2">
                      <strong>Respuesta:</strong>
                      <p>{consulta.respuesta}</p>
                    </div>
                  )}

                  {aprobadoPago && (
                    <div className="mt-3">
                      <p className="mb-2">
                        Esta consulta requiere un pago de{" "}
                        <strong>${consulta.precio}</strong> para ver la
                        respuesta.
                      </p>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={() => manejarPago(consulta.id)}
                      >
                        Pagar ahora
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
