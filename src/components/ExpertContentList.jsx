import {
  GraduationCap,
  HelpCircle,
  BookOpen,
  FileText
} from "lucide-react";

export default function ExpertContentList({
  contenidos,
  usuario,
  verTemario,
  setVerTemario,
  handleAbrirModal,
  handleAbrirModalCompra,
  handleBuy,
  handleLoginConGoogle
}) {
  const getBorderColorByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes("curso")) return "border-blue-400";
    if (lower.includes("asesor")) return "border-green-400";
    if (lower.includes("manual")) return "border-orange-400";
    return "border-gray-300";
  };

  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes("curso"))
      return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes("asesor"))
      return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes("manual"))
      return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 space-y-6">
      <h2 className="text-xl font-bold mb-4">Contenidos disponibles</h2>
      {contenidos.map((contenido) => (
        <div
          key={contenido.id}
          className={`rounded-xl p-6 bg-white shadow-md space-y-4 border-l-8 ${getBorderColorByTipo(
            contenido.tipoContenido
          )}`}
        >
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
            {getIconByTipo(contenido.tipoContenido)}
            <span>{contenido.titulo}</span>
          </div>

          <p className="text-gray-700">{contenido.descripcion}</p>

          {contenido.archivoUrl && (
            <button
              onClick={() =>
                setVerTemario(verTemario === contenido.id ? null : contenido.id)
              }
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              {verTemario === contenido.id
                ? "Ocultar temario"
                : "Ver temario"}
            </button>
          )}

          {contenido.archivoUrl && verTemario === contenido.id && (
            <div className="mt-4">
              <iframe
                src={contenido.archivoUrl}
                title="Archivo PDF"
                width="100%"
                height="500px"
                className="rounded border"
              ></iframe>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="text-xl font-semibold text-gray-800">
              {contenido.tipoContenido === "consulta" ? (
                <span className="text-yellow-700 text-sm font-medium">
                  Sujeto a aplicación de costos
                </span>
              ) : contenido.precio ? (
                <span>${Number(contenido.precio).toFixed(2)}</span>
              ) : (
                <span className="text-gray-500 text-sm">Contenido gratuito</span>
              )}
            </div>

            {/* Cursos gratuitos */}
            {contenido.tipoContenido === "curso" && !contenido.precio && (
              <button
                onClick={() => handleAbrirModal(contenido)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Registrarme
              </button>
            )}

            {/* Manuales de pago */}
            {contenido.tipoContenido === "manual" && contenido.precio && (
              <button
                onClick={() => handleBuy(contenido)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Comprar
              </button>
            )}

            {/* Cursos de pago */}
            {contenido.tipoContenido === "curso" && contenido.precio && (
              <button
                onClick={() => handleAbrirModalCompra(contenido)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
              >
                Comprar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
