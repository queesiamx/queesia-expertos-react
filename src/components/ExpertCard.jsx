import { useNavigate } from 'react-router-dom';

function ExpertCard({ expert, onSelect }) {
  const navigate = useNavigate();

  // Tipos únicos
  const tiposOfrecidos = Array.isArray(expert.servicios)
    ? [...new Set(
        expert.servicios
          .map((s) => s.tipoContenido?.toLowerCase())
          .filter(Boolean)
      )]
    : [];

  // 🎨 Clases e íconos por tipo
  const tipoConfig = {
    curso: {
      class: 'bg-blue-100 text-blue-700',
      icon: '🎓',
    },
    consulta: {
      class: 'bg-green-100 text-green-700',
      icon: '💬',
    },
    manual: {
      class: 'bg-purple-100 text-purple-700',
      icon: '📘',
    },
  };

  return (
    <div
      className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer transition"
      onClick={() => onSelect && onSelect(expert)}
    >
      {expert.fotoPerfilURL && (
        <img
          src={expert.fotoPerfilURL}
          alt={`Foto de ${expert.nombre}`}
          className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
        />
      )}

      <h3 className="text-lg font-semibold text-center">{expert.nombre}</h3>
      <p className="text-sm text-gray-600 text-center">{expert.especialidad}</p>

      {/* Badges de tipo con íconos */}
      {tiposOfrecidos.length > 0 && (
        <div className="flex justify-center flex-wrap gap-2 mt-2">
          {tiposOfrecidos.map((tipo, idx) => {
            const conf = tipoConfig[tipo] || {
              class: 'bg-gray-100 text-gray-700',
              icon: '📦',
            };
            return (
              <span
                key={idx}
                className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${conf.class}`}
              >
                <span>{conf.icon}</span>
                <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
              </span>
            );
          })}
        </div>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/expertos/${expert.id}`);
        }}
        className="text-blue-600 hover:underline mt-3 block text-center"
      >
        Ver perfil
      </button>
    </div>
  );
}

export default ExpertCard;
