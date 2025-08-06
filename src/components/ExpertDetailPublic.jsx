import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";
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
} from "firebase/firestore";
import { loadStripe } from "@stripe/stripe-js";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertHeader from "../components/ExpertHeader";
import ExpertContentList from "../components/ExpertContentList";
import ExpertModal from "../components/ExpertModal";
import ExpertRatingSection from "../components/ExpertRatingSection";
import Footer from "../components/Footer";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function ExpertDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: usuario } = useAuth();

  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [contenidos, setContenidos] = useState([]);
  const [verTemario, setVerTemario] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [isBuying, setIsBuying] = useState(false);

  // 🔹 Obtener datos del experto
  useEffect(() => {
    const obtener = async () => {
      const docRef = doc(db, "experts", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setExpert({ id: snapshot.id, ...snapshot.data() });
      }
      setCargando(false);
    };
    obtener();
  }, [id]);

  // 🔹 Obtener contenidos
  useEffect(() => {
    const cargarContenidos = async () => {
      if (!expert?.id) return;
      const q = query(
        collection(db, "contenidosExpertos"),
        where("expertoId", "==", expert.id)
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContenidos(docs);
    };
    cargarContenidos();
  }, [expert]);

  // 🔹 Iniciar sesión con Google
  const handleLoginConGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // 🔹 Verificar si ya está registrado
  const yaRegistrado = (usuariosRegistrados) => {
    return usuariosRegistrados?.some((u) => u.correo === usuario?.email);
  };

  // 🔹 Abrir modal para curso gratuito
  const handleAbrirModal = (contenido) => {
    setContenidoSeleccionado(contenido);
    setIsBuying(false);
    setModalAbierto(true);
  };

  // 🔹 Abrir modal para curso de pago
  const handleAbrirModalCompra = (contenido) => {
    setContenidoSeleccionado(contenido);
    setIsBuying(true);
    setModalAbierto(true);
  };

  // 🔹 Registro gratuito
  const handleRegistroGratuito = async () => {
    if (!usuario || !contenidoSeleccionado) return;

    if (yaRegistrado(contenidoSeleccionado.usuariosRegistrados)) {
      toast("Ya estás registrado en este curso");
      return;
    }

    if (
      contenidoSeleccionado.usuariosRegistrados?.length >=
      contenidoSeleccionado.cupoMaximo
    ) {
      toast.error("Este curso ya está lleno");
      return;
    }

    try {
      const ref = doc(db, "contenidosExpertos", contenidoSeleccionado.id);
      await updateDoc(ref, {
        usuariosRegistrados: arrayUnion({
          nombre: usuario.displayName || "Anónimo",
          correo: usuario.email,
          pagado: false,
          estatus: "confirmado",
          fechaRegistro: new Date().toISOString(),
          fechaAgendada: fechaSeleccionada,
        }),
      });
      toast.success("Registro exitoso al curso");
      setModalAbierto(false);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo registrar al curso");
    }
  };

  // 🔹 Compra con Stripe
  const handleBuy = async (contenido) => {
    const stripe = await stripePromise;
    const response = await fetch("/api/crearPagoContenido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contenidoId: contenido.id,
        uid: usuario?.uid,
        email: usuario?.email,
        nombreContenido: contenido.titulo,
      }),
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("No se pudo iniciar el pago");
    }
  };

  if (cargando) return <p className="p-6">Cargando experto...</p>;
  if (!expert) return <p className="p-6">Experto no encontrado.</p>;

  return (
    <>
      <UnifiedNavbar />


      <div className="min-h-screen bg-primary-soft px-4 py-10 font-sans">
  <div className="max-w-3xl mx-auto space-y-6">

    {/* Botón volver */}
    <div>
      <button
        onClick={() => navigate("/expertos")}
        className="text-sm text-primary hover:underline"
      >
        ← Volver al listado
      </button>
    </div>

    {/* Card: Encabezado del experto */}
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <ExpertHeader expert={expert} />
    </div>

    {/* Card: Lista de contenidos */}
    
      <ExpertContentList
        contenidos={contenidos}
        usuario={usuario}
        verTemario={verTemario}
        setVerTemario={setVerTemario}
        handleAbrirModal={handleAbrirModal}
        handleAbrirModalCompra={handleAbrirModalCompra}
        handleBuy={handleBuy}
        handleLoginConGoogle={handleLoginConGoogle}
      />
    

    {/* Card: Calificaciones */}
    
      <ExpertRatingSection
        expertId={expert.id}
        usuario={usuario}
        handleLoginConGoogle={handleLoginConGoogle}
      />
    </div>

  </div>



      {/* Modal para registro o compra */}
      <ExpertModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        availableDates={contenidoSeleccionado?.fechasDisponibles || []}
        fechaSeleccionada={fechaSeleccionada}
        setFechaSeleccionada={setFechaSeleccionada}
        onConfirm={() =>
          isBuying
            ? handleBuy(contenidoSeleccionado)
            : handleRegistroGratuito()
        }
        isBuying={isBuying}
      />

      <Footer />
    </>
  );
}
