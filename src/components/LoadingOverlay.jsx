export default function LoadingOverlay({ show, text = "Cargando..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 min-w-[220px] flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-600" />
        <p className="text-gray-800 font-medium">{text}</p>
      </div>
    </div>
  );
}
