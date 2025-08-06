export default function ExpertHeader({ expert }) {
  return (
    <div className="text-center space-y-2">
      {expert.fotoPerfilURL && (
        <img
          src={expert.fotoPerfilURL}
          alt="Foto del experto"
          className="w-32 h-32 rounded-full object-cover mx-auto border"
        />
      )}
      <h1 className="text-2xl font-bold text-default font-montserrat">
        {expert.nombre}
      </h1>
      <p className="text-primary font-semibold">{expert.especialidad}</p>

      <div className="text-left space-y-4 mt-6 border-t pt-4">
        {expert.experiencia && (
          <div>
            <p className="font-bold">📁 Experiencia</p>
            <p className="text-default">{expert.experiencia}</p>
          </div>
        )}

        {expert.educacion?.length > 0 && (
          <div>
            <p className="font-bold">🎓 Educación</p>
            <ul className="list-disc list-inside text-default">
              {expert.educacion.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {expert.certificaciones?.length > 0 && (
          <div>
            <p className="font-bold">📜 Certificaciones</p>
            <ul className="list-disc list-inside text-default">
              {expert.certificaciones.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
