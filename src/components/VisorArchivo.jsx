// src/components/VisorArchivo.jsx
export default function VisorArchivo({ archivoUrl }) {
  if (!archivoUrl) {
    return <p className="text-red-600">Archivo no disponible</p>;
  }

  // Detecta tipo de archivo por extensión
  const tipo = archivoUrl.split('.').pop().toLowerCase();

  // 🔄 Corrige la URL para PDFs si es de Cloudinary
  let urlFinal = archivoUrl;
  if (tipo === 'pdf' && archivoUrl.includes('cloudinary.com') && archivoUrl.includes('/image/upload/')) {
    urlFinal = archivoUrl.replace('/image/upload/', '/raw/upload/');
  }

  if (tipo === 'pdf') {
    return (
      <div className="w-full h-[600px] mt-4">
        <iframe
          src={urlFinal}
          title="Visualizador de PDF"
          className="w-full h-full border rounded shadow"
        />
      </div>
    );
  }

  if (['jpg', 'jpeg', 'png'].includes(tipo)) {
    return (
      <div className="mt-4">
        <img src={archivoUrl} alt="Vista previa" className="max-w-full max-h-[600px] rounded shadow" />
      </div>
    );
  }

  if (tipo === 'mp4') {
    return (
      <div className="mt-4">
        <video controls className="max-w-full max-h-[600px] rounded shadow">
          <source src={archivoUrl} type="video/mp4" />
          Tu navegador no admite el video.
        </video>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <a href={archivoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        Ver archivo
      </a>
    </div>
  );
}
