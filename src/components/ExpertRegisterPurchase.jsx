// src/components/ExpertRegisterPurchase.jsx
import React from "react";

const ExpertRegisterPurchase = ({
  onRegistroGratis,
  onCompra,
  precio,
  tieneRegistroGratis,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">
        Registro y Compra
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        {tieneRegistroGratis && (
          <button
            onClick={onRegistroGratis}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            Registro Gratuito
          </button>
        )}

        {precio !== undefined && (
          <button
            onClick={onCompra}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
          >
            Comprar {precio > 0 ? `- $${precio}` : ""}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpertRegisterPurchase;
