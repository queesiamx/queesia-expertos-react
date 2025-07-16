// src/components/ExpertDetailPublic.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, Fragment } from 'react';
import { db, auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
} from 'firebase/firestore';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import ExpertRatingSection from './ExpertRatingSection';
import QuesiaNavbar from "../components/QuesiaNavbar";
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import Footer from "./Footer";


const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function ExpertDetailPublic() {

    // Función para asignar color al borde según tipo
  const getBorderColorByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes('curso')) return 'border-blue-400';
    if (lower.includes('asesor')) return 'border-green-400';
    if (lower.includes('manual')) return 'border-orange-400';
    return 'border-gray-300';
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [consulta, setConsulta] = useState('');
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const { user: usuario } = useAuth();
  const [contenidos, setContenidos] = useState([]);
  const [verTemario, setVerTemario] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

  useEffect(() => {
    const obtener = async () => {
      const docRef = doc(db, 'experts', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setExpert({ id: snapshot.id, ...snapshot.data() });
      }
      setCargando(false);
    };
    obtener();
  }, [id]);

  useEffect(() => {
    const cargarContenidos = async () => {
      if (!expert?.id) return;
      const q = query(collection(db, 'contenidosExpertos'), where('expertoId', '==', expert.id));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContenidos(docs);
    };
    cargarContenidos();
  }, [expert]);

  const handleLoginConGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const yaRegistrado = (usuariosRegistrados) => {
    return usuariosRegistrados?.some((u) => u.correo === usuario?.email);
  };

  const handleAbrirModal = (contenido) => {
    setContenidoSeleccionado(contenido);
    setModalAbierto(true);
  };

  const handleRegistroGratuito = async () => {
    if (!usuario || !contenidoSeleccionado) return;

    if (yaRegistrado(contenidoSeleccionado.usuariosRegistrados)) {
      toast("Ya estás registrado en este curso");
      return;
    }

    if (contenidoSeleccionado.usuariosRegistrados?.length >= contenidoSeleccionado.cupoMaximo) {
      toast.error("Este curso ya está lleno");
      return;
    }

    try {
      const ref = doc(db, 'contenidosExpertos', contenidoSeleccionado.id);
      await updateDoc(ref, {
        usuariosRegistrados: arrayUnion({
          nombre: usuario.displayName || "Anónimo",
          correo: usuario.email,
          pagado: false,
          estatus: "confirmado",
          fechaRegistro: new Date().toISOString(),
          fechaAgendada: fechaSeleccionada
        })
      });
      toast.success("Registro exitoso al curso");
      setModalAbierto(false);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar al curso");
    }
  };

  const handleBuy = async (contenido) => {
    const stripe = await stripePromise;
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: contenido.titulo || 'Contenido de experto',
        description: contenido.descripcion || '',
        amount: parseFloat(contenido.precio)
      })
    });
    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  const handleEnviarConsulta = async (contenido) => {
  if (!consulta.trim() || !usuario) return;
  try {
    await addDoc(collection(db, 'consultasModeradas'), {
      consulta,
      estado: 'pendiente',
      contenidoId: contenido.id,
      expertoId: expert.id,
      expertoNombre: expert.nombre,
      nombre: usuario.displayName || 'Anónimo',
      correo: usuario.email,
      timestamp: serverTimestamp()
    });
    setMensajeConfirmacion('Consulta enviada correctamente.');
    setConsulta('');
    toast.success("Consulta enviada correctamente.");
  } catch (error) {
    console.error('Error al enviar consulta:', error);
    toast.error("Ocurrió un error al enviar la consulta.");
  }
};


  const getIconByTipo = (tipo) => {
    const lower = tipo?.toLowerCase();
    if (lower.includes('curso')) return <GraduationCap className="w-5 h-5 inline mr-1 text-blue-500" />;
    if (lower.includes('asesor')) return <HelpCircle className="w-5 h-5 inline mr-1 text-green-500" />;
    if (lower.includes('manual')) return <BookOpen className="w-5 h-5 inline mr-1 text-orange-500" />;
    return <FileText className="w-5 h-5 inline mr-1 text-gray-500" />;
  };

  if (cargando) return <p className="p-6">Cargando experto...</p>;
  if (!expert) return <p className="p-6">Experto no encontrado.</p>;

  return (
  <>
    <QuesiaNavbar />

    <div className="min-h-screen bg-primary-soft px-4 py-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-md space-y-6">
        <button onClick={() => navigate('/expertos')} className="text-sm text-primary hover:underline">
          ← Volver al listado
        </button>

        <div className="text-center space-y-2">
          {expert.fotoPerfilURL && (
            <img
              src={expert.fotoPerfilURL}
              alt="Foto del experto"
              className="w-32 h-32 rounded-full object-cover mx-auto border"
            />
          )}
          <h1 className="text-2xl font-bold text-default font-montserrat">{expert.nombre}</h1>
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

  
      </div>
    </div>

    {contenidos.length > 0 && (
          <div className="max-w-3xl mx-auto mt-10 px-4 space-y-6">
            <h2 className="text-xl font-bold mb-4">Contenidos disponibles</h2>
            {contenidos.map((contenido) => (
  <div
    key={contenido.id}
    className={`rounded-xl p-6 bg-white shadow-md space-y-4 border-l-8 ${getBorderColorByTipo(contenido.tipoContenido)}`}
  >
    <div className="flex items-center gap-2 font-bold text-lg text-gray-800">
      {getIconByTipo(contenido.tipoContenido)}
      <span>{contenido.titulo}</span>
    </div>

    <p className="text-gray-700">{contenido.descripcion}</p>

    {contenido.tipoContenido === 'consulta' && (
      <div className="mt-2 space-y-2">
        <label htmlFor={`consulta-${contenido.id}`} className="block font-semibold text-sm">
          Escribe tu consulta:
        </label>
        <textarea
          id={`consulta-${contenido.id}`}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          placeholder="Ej. ¿Cómo podría aplicar esto en mi organización?"
          rows={3}
          value={consulta}
          onChange={(e) => setConsulta(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
          onClick={() => handleEnviarConsulta(contenido)}
        >
          Enviar
        </button>
        {mensajeConfirmacion && (
          <p className="text-green-600 text-sm">{mensajeConfirmacion}</p>
        )}
      </div>
    )}

    {contenido.archivoUrl && (
      <button
        onClick={() => setVerTemario(verTemario === contenido.id ? null : contenido.id)}
        className="text-sm text-blue-600 underline hover:text-blue-800"
      >
        {verTemario === contenido.id ? 'Ocultar temario' : 'Ver temario'}
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
        {contenido.tipoContenido === 'consulta' ? (
          <span className="text-yellow-700 text-sm font-medium">
            Sujeto a aplicación de costos
          </span>
        ) : contenido.precio ? (
          <span>${Number(contenido.precio).toFixed(2)}</span>
        ) : (
          <span className="text-gray-500 text-sm">Contenido gratuito</span>
        )}
      </div>

      {contenido.tipoContenido === 'curso' && !contenido.precio && (
        <button
          onClick={() => handleAbrirModal(contenido)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Registrarme
        </button>
      )}
      {contenido.tipoContenido === 'curso' && contenido.precio && (
        <button
          onClick={() => handleBuy(contenido)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          Comprar
        </button>
      )}
    </div>
  </div>
))}

          </div>
        )}

        <ExpertRatingSection
          expertId={expert.id}
          usuario={usuario}
          handleLoginConGoogle={handleLoginConGoogle}
        />

    <Transition appear show={modalAbierto} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setModalAbierto(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                Selecciona una fecha disponible
              </Dialog.Title>
              <div className="mt-2">
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-2"
                  value={fechaSeleccionada}
                  onChange={(e) => setFechaSeleccionada(e.target.value)}
                >
                  <option value="">-- Selecciona una fecha --</option>
                  {contenidoSeleccionado?.fechasDisponibles?.map((f, idx) => (
                    <option key={idx} value={f}>
                      {new Date(f).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handleRegistroGratuito}
                  disabled={!fechaSeleccionada}
                >
                  Confirmar registro
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
        <Footer />
  </>

);
}
