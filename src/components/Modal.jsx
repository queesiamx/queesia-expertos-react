// components/Modal.jsx
import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
  // Cierra con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
      onClick={onClose} // Cierre al hacer clic fuera
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()} // Previene cierre al hacer clic dentro
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-gray-800 text-2xl font-bold"
        >
          ×
        </button>

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}
