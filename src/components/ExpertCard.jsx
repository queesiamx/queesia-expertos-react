// src/components/ExpertCard.jsx
import { useNavigate } from 'react-router-dom';

function ExpertCard({ expert, onSelect }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer transition"
      onClick={() => onSelect(expert)}
    >
      {expert.fotoPerfilURL && (
        <img
          src={expert.fotoPerfilURL}
          alt={`Foto de ${expert.nombre}`}
          className="w-24 h-24 object-cover rounded-full mx-auto mb-2"
        />
      )}

      <h3 className="text-lg font-semibold">{expert.nombre}</h3>
      <p className="text-sm text-gray-600">{expert.especialidad}</p>

      <button
        onClick={(e) => {
          e.stopPropagation(); // evitar que el onClick del contenedor se dispare
          navigate(`/expertos/${expert.id}`);
        }}
        className="text-blue-600 hover:underline mt-2 block"
      >
        Ver perfil
      </button>
    </div>
  );
}

export default ExpertCard;
