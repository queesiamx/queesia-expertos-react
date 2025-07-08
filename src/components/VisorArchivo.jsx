import { useEffect, useState } from "react";

export default function VisorArchivo({ archivoUrl }) {
  const [valido, setValido] = useState(true);

  useEffect(() => {
    if (!archivoUrl) {
      setValido(false);
      return;
    }

    // Verificar si la URL responde correctamente con HEAD
    fetch(archivoUrl, { method: "HEAD" })
      .then((res) => setValido(res.ok))
      .catch(() => setValido(false));
  }, [archivoUrl]);

  // Mostrar error si no hay URL o si es inválida
  if (!archivoUrl || !valido) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-red-100 text-red-600 rounded">
        El archivo PDF no está disponible
      </div>
    );
  }

  // Verificación adicional de formato básico de URL
  const esUrlValida = archivoUrl.startsWith("http") && archivoUrl.includes(".");
  if (!esUrlValida) {
    return (
      <div className="w-full h-40 flex items-center justify-center bg-yellow-100 text-yellow-700 rounded">
        URL inválida o inaccesible
      </div>
    );
  }

  // Asegura que la extensión sea PDF (aunque opcional si viene desde Cloudinary sin extensión)
  const terminaEnPdf = archivoUrl.toLowerCase().includes(".pdf");

  // Corregir Cloudinary malformado (si usa /image/upload/ en lugar de /raw/upload/)
  let urlFinal = archivoUrl;
  if (
    archivoUrl.includes("cloudinary.com") &&
    archivoUrl.includes("/image/upload/")
  ) {
    urlFinal = archivoUrl.replace("/image/upload/", "/raw/upload/");
  }

  return (
    <div className="w-full h-64 mt-4 overflow-hidden border rounded shadow">
      <iframe
        src={urlFinal}
        title="Visualizador PDF"
        className="w-full h-full object-contain"
      />
    </div>
  );
}
