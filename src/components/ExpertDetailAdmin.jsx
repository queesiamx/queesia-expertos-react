import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText,
  DollarSign,
  CheckCircle,
  Mail,
  Phone,
  Globe,
} from 'lucide-react';

function ExpertDetailAdmin({ expert, onClose, onUpdate, onDelete }) {
 const cambiarAprobacion = async (nuevoEstado) => {
  await enviarCorreoEstadoExperto(
    expert.email,
    expert.nombre,
    nuevoEstado ? 'aprobado' : 'rechazado'
  );

  if (!expert.formularioCompleto) {
    toast.error("Este experto no ha completado su formulario.");
    return;
  }

  try {
    await updateDoc(doc(db, 'experts', expert.id), {
      aprobado: nuevoEstado,
    });

    toast.success(`Experto ${nuevoEstado ? 'aprobado' : 'rechazado'} correctamente.`);
    onUpdate({ ...expert, aprobado: nuevoEstado });
  } catch (e) {
    console.error("Error al actualizar aprobación:", e);
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


    const enviarCorreoEstadoExperto = async (email, nombre, estado) => {
    const mensaje =
      estado === 'aprobado'
        ? '¡Bienvenido! Ya puedes aparecer públicamente en el directorio de expertos. Gracias por formar parte de Quesia.'
        : 'Te invitamos a corregir tus datos y volver a enviar el formulario en otro momento.';
  
    const templateParams = {
      nombre,
      estado,
      mensaje_personalizado: mensaje,
      to_email: email,
    };
  
    try {
      await emailjs.send(
        'service_vdpzkm8',       // tu SERVICE_ID
        'template_n0pj59s',       // tu TEMPLATE_ID
        templateParams,
        '9SxO0lF9IKHaknc4Q'          // tu PUBLIC_KEY
      );
      console.log('Correo enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  };


  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes('curso')) return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes('asesor')) return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes('manual')) return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow max-w-3xl mx-auto font-sans">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-black"
      >
        ✖
      </button>

      <div className="text-center space-y-2">
        {expert.fotoPerfilURL && (
          <img
            src={expert.fotoPerfilURL}
            alt={`Foto de perfil de ${expert.nombre}`}
            className="w-32 h-32 object-cover rounded-full border mx-auto"
          />
        )}
        <h1 className="text-2xl font-bold text-default font-montserrat">{expert.nombre}</h1>
        <p className="text-primary font-semibold">{expert.especialidad}</p>
      </div>

      {expert.experiencia && (
        <div className="mt-4">
          <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
            <FileText className="w-4 h-4 mr-2 text-gray-500" /> Experiencia
          </h2>
          <p className="text-default-soft whitespace-pre-line">{expert.experiencia}</p>
        </div>
      )}

      {Array.isArray(expert.educacion) && expert.educacion.length > 0 && (
        <div>
          <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
            <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" /> Educación
          </h2>
          <ul className="list-disc list-inside text-default-soft">
            {expert.educacion.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(expert.certificaciones) && expert.certificaciones.length > 0 && (
        <div>
          <h2 className="flex items-center text-lg font-semibold text-default-soft mb-1">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Certificaciones
          </h2>
          <ul className="list-disc list-inside text-default-soft">
            {expert.certificaciones.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(expert.servicios) && expert.servicios.length > 0 && (
        <div>
          <h2 className="flex items-center text-lg font-semibold text-default-soft mb-2">
            <BookOpen className="w-4 h-4 mr-2 text-orange-500" /> Servicios
          </h2>
          <div className="grid gap-4">
            {expert.servicios.map((serv, i) => (
              <div key={i} className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm">
                <p className="flex items-center font-bold text-default mb-1">
                  {getIconByTipo(serv.tipo)}
                  <span className="font-bold text-default">
                    {serv.tipo ? `${serv.tipo} '` : 'Servicio '}
                    {serv.titulo || 'Sin título'}
                    {"'"}
                  </span>
                </p>
                {serv.descripcion && (
                  <p className="italic text-gray-700 ml-6 mt-1">{serv.descripcion}</p>
                )}
                <p className="flex items-center mt-2">
                  
                  <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                    {serv.precio
                      ? new Intl.NumberFormat('es-MX', {
                          style: 'currency',
                          currency: 'MXN',
                        }).format(parseFloat(serv.precio))
                      : 'Precio no especificado'}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="mt-6 text-sm text-default-soft space-y-1">
        {expert.email && (
          <p className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <strong>Correo:</strong> {expert.email}
          </p>
        )}
        {expert.telefono && (
          <p className="flex items-center">
            <Phone className="w-4 h-4 mr-2 text-gray-500" />
            <strong>Teléfono:</strong> {expert.telefono}
          </p>
        )}
        {expert.redes && (
          <p className="flex items-center">
            <Globe className="w-4 h-4 mr-2 text-gray-500" />
            <strong>Redes:</strong> {expert.redes}
          </p>
        )}
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
