// src/components/ExpertDetailPublic.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  FileText,
  CheckCircle
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import ExpertRatingSection from './ExpertRatingSection';
import QuesiaNavbar from "../components/QuesiaNavbar";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function ExpertDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [consulta, setConsulta] = useState('');
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');
  const [usuario, setUsuario] = useState(null);
  const [contenidos, setContenidos] = useState([]);

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarContenidos = async () => {
      if (!expert?.id) return;
      const q = query(
        collection(db, "contenidosExpertos"),
        where("expertoId", "==", expert.id)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContenidos(docs);
    };
    cargarContenidos();
  }, [expert]);

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

  const handleEnviarConsulta = async () => {
    if (!consulta.trim() || !usuario) return;
    try {
      await addDoc(collection(db, 'consultasModeradas'), {
        consulta,
        estado: 'pendiente',
        expertoId: expert.id,
        expertoNombre: expert.nombre,
        nombre: usuario.displayName || 'Anónimo',
        correo: usuario.email,
        timestamp: serverTimestamp()
      });
      setMensajeConfirmacion('Consulta enviada correctamente.');
      setConsulta('');
    } catch (error) {
      console.error('Error al enviar consulta:', error);
    }
  };

  const handleLoginConGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
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

        {/* 1. PERFIL DEL EXPERTO */}
        <button
          onClick={() => navigate('/expertos')}
          className="text-sm text-primary hover:underline"
        >
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
          <h1 className="text-2xl font-bold text-default font-montserrat">
            {expert.nombre}
          </h1>
          <p className="text-primary font-semibold">{expert.especialidad}</p>
        </div>

        {expert.experiencia && (
          <div>
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

        {/* 2. CONTENIDOS DISPONIBLES */}
        {contenidos.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Contenidos disponibles</h2>
            <div className="space-y-6">
              {contenidos.map((contenido) => (
                <div
                  key={contenido.id}
                  className="border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white shadow"
                >
                  <div>
                    <div className="font-bold text-lg mb-1">
                      {contenido.tipoContenido === "curso" && "📘 Curso"}
                      {contenido.tipoContenido === "manual" && "📕 Manual"}
                      {contenido.tipoContenido === "consulta" && "📄 Consulta"}
                      {` ‘${contenido.titulo}’`}
                    </div>
                    <div className="text-default-soft mb-2">{contenido.descripcion}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-2xl font-bold text-right mb-2">
                      {contenido.precio
                        ? `$${Number(contenido.precio).toFixed(2)}`
                        : "Gratis"}
                    </div>
                    {contenido.precio ? (
                      <button
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        onClick={() => handleBuy(contenido)}
                      >
                        Comprar
                      </button>
                    ) : (
                      <span className="bg-blue-200 text-blue-700 px-4 py-2 rounded text-sm">Contenido gratuito</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Servicios (Si existen, opcional) */}
        {Array.isArray(expert.servicios) && expert.servicios.length > 0 && (
          <div>
            <h2 className="flex items-center text-lg font-semibold text-default-soft mb-2">
              <BookOpen className="w-5 h-5 inline mr-2 text-orange-500" /> Servicios
            </h2>
            <div className="grid gap-4">
              {expert.servicios.map((serv, i) => (
                <div key={i} className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm">
                  <p className="flex items-center font-bold text-default mb-1">
                    {getIconByTipo(serv.tipo)}
                    <span className="font-bold text-default">
                      {serv.tipo ? `${serv.tipo} "` : 'Servicio '}
                      {serv.titulo || 'Sin título'}"
                    </span>
                  </p>
                  {serv.descripcion && (
                    <p className="italic text-default-soft ml-6 mt-1">{serv.descripcion}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-between mt-3">
                    <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                      {serv.precio
                        ? new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN'
                          }).format(parseFloat(serv.precio))
                        : 'Precio no especificado'}
                    </span>
                    {serv.precio && (
                      <button
                        onClick={() => handleBuy(serv)}
                        className="mt-2 sm:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium"
                      >
                        Comprar
                      </button>
                    )}
                  </div>
                  {serv.tipo?.toLowerCase().includes('consulta') && (
                    <div className="bg-white p-4 mt-6 rounded-2xl shadow">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">Enviar consulta al experto</h3>
                      {usuario ? (
                        <>
                          <p className="text-sm text-default-soft mb-2">
                            Esta consulta será moderada por Quesia para determinar su complejidad y si requiere pago o puede resolverse gratuitamente.
                          </p>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                            rows="4"
                            placeholder="Escribe tu consulta aquí..."
                            value={consulta}
                            onChange={(e) => setConsulta(e.target.value)}
                          />
                          <button
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
                            onClick={handleEnviarConsulta}
                          >
                            Enviar consulta
                          </button>
                          {mensajeConfirmacion && (
                            <p className="mt-2 text-sm text-green-600">{mensajeConfirmacion}</p>
                          )}
                        </>
                      ) : (
                        <div className="text-center text-default-soft text-sm">
                          <p className="mb-2">Inicia sesión para poder enviar una consulta</p>
                          <button
                            onClick={handleLoginConGoogle}
                            className="bg-black text-white px-4 py-2 rounded"
                          >
                            Iniciar con Google
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SECCIÓN DE RATING - ¡INTEGRADO AQUÍ! */}
        <ExpertRatingSection
          expertId={expert.id}
          usuario={usuario}
          handleLoginConGoogle={handleLoginConGoogle}
        />

      </div>
    </div>
      </>
  );
}
