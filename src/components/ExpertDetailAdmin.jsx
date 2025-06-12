import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

function ExpertDetailAdmin({ expert, onClose, onUpdate, onDelete }) {
  const cambiarAprobacion = async (nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'experts', expert.id), {
        aprobado: nuevoEstado,
      });
      toast.success(`Experto ${nuevoEstado ? 'aprobado' : 'rechazado'} correctamente.`);
      onUpdate({ ...expert, aprobado: nuevoEstado });
    } catch (e) {
      toast.error('Error al actualizar aprobación.');
    }
  };

  const eliminar = async () => {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este experto?');
    if (!confirmar) return;

    try {
      await deleteDoc(doc(db, 'experts', expert.id));
      toast.success('Experto eliminado correctamente.');
      onDelete(expert.id);
    } catch (e) {
      toast.error('Error al eliminar.');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        ✖
      </button>

      <h2 className="text-xl font-bold">{expert.nombre}</h2>
      <p className="text-sm text-gray-600 mb-2">{expert.especialidad}</p>

      {expert.fotoPerfilURL && (
        <div className="mt-4">
          <img
            src={expert.fotoPerfilURL}
            alt={`Foto de perfil de ${expert.nombre}`}
            className="w-32 h-32 object-cover rounded-full border mx-auto"
          />
        </div>
      )}

      {expert.experiencia && (
        <>
          <h4 className="font-semibold mt-4">Experiencia</h4>
          <p>{expert.experiencia}</p>
        </>
      )}

      {expert.educacion && (
        <>
          <h4 className="font-semibold mt-4">Educación</h4>
          <p>{expert.educacion}</p>
        </>
      )}

      {expert.certificaciones?.length > 0 && (
        <>
          <h4 className="font-semibold mt-4">Certificaciones</h4>
          <ul className="list-disc list-inside">
            {expert.certificaciones.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </>
      )}

      <section className="mt-6">
        <h4 className="font-semibold">Datos de contacto</h4>
        <ul className="list-disc list-inside text-sm mt-2">
          {expert.email && (
            <li>
              Correo:{' '}
              <a href={`mailto:${expert.email}`} className="text-blue-600 underline">
                {expert.email}
              </a>
            </li>
          )}
          {expert.telefono && <li>Teléfono: {expert.telefono}</li>}
          {expert.redes && <li>Redes sociales: {expert.redes}</li>}
        </ul>
      </section>

      {expert.linkedin && (
        <a
          href={expert.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-blue-600 underline"
        >
          Ver perfil profesional
        </a>
      )}

      <div className="mt-6 space-x-2">
        <button
          onClick={() => cambiarAprobacion(!expert.aprobado)}
          className={`px-4 py-2 rounded text-white ${
            expert.aprobado
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {expert.aprobado ? 'Rechazar' : 'Aprobar'}
        </button>

        <button
          onClick={eliminar}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
        >
          Eliminar
        </button>

        <button
          onClick={onClose}
          className="text-sm text-blue-600 underline mt-4 block"
        >
          ← Volver al listado
        </button>
      </div>
    </div>
  );
}

export default ExpertDetailAdmin;
