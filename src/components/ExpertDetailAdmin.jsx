import { doc, updateDoc, deleteDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { ensureAbsoluteUrl } from "@/lib/url";
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
  const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];
  
  const cambiarAprobacion = async (nuevoEstado) => {
  await enviarCorreoEstadoExperto(
    expert.email,
    expert.nombre,
    nuevoEstado ? "aprobado" : "rechazado"
  );

  if (!expert.formularioCompleto) {
    toast.error("Este experto no ha completado su formulario.");
    return;
  }

  try {
    // 1) Persistir en la colección 'experts'
    const expertRef = doc(db, "experts", expert.id);
    await updateDoc(expertRef, {
      aprobado: nuevoEstado,
      aprobadoPor: auth?.currentUser?.email || null,
      aprobadoAt: new Date(),
    });

    // 2) Ajustar el rol del usuario en 'users' (si existe su doc)
    const userDocRef = doc(db, "users", expert.id);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      await updateDoc(userDocRef, {
        rol: nuevoEstado ? "experto" : "usuario", // o null si prefieres
      });
    }

    // 3) Actualizar UI local
    toast.success(`Experto ${nuevoEstado ? "aprobado" : "rechazado"} correctamente.`);
    onUpdate({ ...expert, aprobado: nuevoEstado });
  } catch (e) {
    console.error("Error al actualizar aprobación:", e);
    toast.error("Error al actualizar aprobación.");
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
    const LOGIN_URL    = "https://expertos.queesia.com/login?redirect=/dashboard";
    const REGISTRO_URL = "https://expertos.queesia.com/registro";
    const esAprobado   = estado === "aprobado";
    // Inyectamos la URL directo en el mensaje (texto plano seguro)
    const mensaje = esAprobado
      ? `¡Bienvenido! Ya puedes acceder y aparecer públicamente en el directorio de expertos.

Para entrar ahora, haz clic o copia esta liga en tu navegador: ${LOGIN_URL}`
      : `Lo sentimos, te invitamos a corregir tus datos y volver a enviar el formulario.

Puedes actualizar tu información aquí: ${REGISTRO_URL}
Si tienes dudas, escríbenos a contacto@queesia.com.`;
    const templateParams = {
      nombre,
      estado,
      mensaje_personalizado: mensaje, // ← ya incluye la URL
      email,
    };


    try {
      await emailjs.send(
        'service_vdpzkm8',        // SERVICE_ID (igual que ya usas)
        'template_n0pj59s',       // TEMPLATE_ID (actualízalo en EmailJS para aceptar las nuevas variables)
        templateParams,
        '9SxO0lF9IKHaknc4Q'       // PUBLIC_KEY
      );
      console.log('Correo enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
    }
  };

  // 🔁 Función para limpieza de expertos incompletos


const limpiarExpertosIncompletos = async () => {
  const snapshot = await getDocs(collection(db, 'experts'));
  snapshot.docs.forEach(async (docSnap) => {
    const data = docSnap.data();
    if (
      !data.formularioCompleto &&
      (!data.nombre || !data.especialidad || !data.experiencia)
    ) {
      await deleteDoc(doc(db, 'experts', docSnap.id));
      console.log(`Eliminado: ${docSnap.id}`);
    }
  });
};


  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes('curso')) return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes('asesor')) return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes('manual')) return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-0">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Columna principal */}
        <article className="md:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            {expert.fotoPerfilURL ? (
              <img
                src={expert.fotoPerfilURL}
                alt={`Foto de ${expert.nombre}`}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-white shadow"
              />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-200 ring-2 ring-white shadow" />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-snugger text-default">
                  {expert.nombre}
                </h1>
                {expert.aprobado && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    VERIFICADO
                  </span>
                )}
              </div>
              <p className="text-blue-700 font-medium">{expert.especialidad}</p>
            </div>
          </div>

          {/* Resumen / Experiencia */}
          {expert.experiencia && (
            <section className="mt-6">
              <h2 className="flex items-center text-sm font-semibold text-slate-600 mb-1">
                <FileText className="w-4 h-4 mr-2 text-slate-400" /> RESUMEN
              </h2>
              <p className="text-default-soft leading-relaxed whitespace-pre-line">
                {expert.experiencia}
              </p>
            </section>
          )}

          {/* Educación */}
          {Array.isArray(expert.educacion) && expert.educacion.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center text-sm font-semibold text-slate-600 mb-1">
                <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" /> EDUCACIÓN
              </h2>
              <ul className="list-disc list-inside text-default-soft space-y-1">
                {expert.educacion.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Certificaciones */}
          {Array.isArray(expert.certificaciones) && expert.certificaciones.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center text-sm font-semibold text-slate-600 mb-1">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> CERTIFICACIONES
              </h2>
              <ul className="flex flex-wrap gap-2">
                {expert.certificaciones.map((c, i) => (
                  <li
                    key={i}
                    className="px-2.5 h-7 inline-flex items-center rounded-full text-xs border border-slate-200 bg-slate-50 text-slate-700"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Servicios */}
          {Array.isArray(expert.servicios) && expert.servicios.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center text-sm font-semibold text-slate-600 mb-2">
                <BookOpen className="w-4 h-4 mr-2 text-orange-500" /> SERVICIOS OFRECIDOS
              </h2>
              <div className="grid gap-3">
                {expert.servicios.map((serv, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-2 font-semibold text-default">
                        {getIconByTipo(serv.tipo)}
                        <span>
                          {(serv.tipo || 'Servicio')}{' '}
                          <span className="font-bold">“{serv.titulo || 'Sin título'}”</span>
                        </span>
                      </p>
                      <span className="inline-flex items-center px-3 h-7 rounded-full text-sm bg-blue-600 text-white">
                        {serv.precio
                          ? new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'MXN',
                            }).format(parseFloat(serv.precio))
                          : 'Precio no especificado'}
                      </span>
                    </div>
                    {serv.descripcion && (
                      <p className="mt-2 text-sm text-slate-600">{serv.descripcion}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Volver al listado */}
          <button
            onClick={onClose}
            className="mt-8 text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ← Volver al listado
          </button>
        </article>

        {/* Sidebar: Moderación + Contacto */}
        <aside className="space-y-4">
          {/* Moderación */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Moderación</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => cambiarAprobacion(!expert.aprobado)}
                className={`px-4 h-10 rounded-lg text-white ${
                  expert.aprobado
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {expert.aprobado ? 'Rechazar' : 'Aprobar'}
              </button>
              <button
                onClick={eliminar}
                className="px-4 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
              >
                Eliminar
              </button>
              {adminEmails.includes(expert.email) && (
                <button
                  onClick={limpiarExpertosIncompletos}
                  className="px-4 h-10 rounded-lg bg-slate-700 hover:bg-slate-800 text-white"
                >
                  Limpiar incompletos
                </button>
              )}
            </div>
          </div>

          {/* Contacto */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Contacto</h3>
            <ul className="text-sm space-y-2 text-slate-700">
              {expert.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{expert.email}</span>
                </li>
              )}
              {expert.telefono && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{expert.telefono}</span>
                </li>
              )}
              {expert.redes && (
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{expert.redes}</span>
                </li>
              )}
            </ul>
  {/* Botón: Ver perfil profesional (externo) */}
  <a
    href={ensureAbsoluteUrl(expert?.linkedin)}
    target="_blank"
    rel="noopener noreferrer"
    className="btn btn-outline w-full mt-2"
    onClick={(e) => e.stopPropagation()} // por si la card tiene onClick de navegación
  >
    Ver perfil profesional
  </a>
            
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ExpertDetailAdmin;