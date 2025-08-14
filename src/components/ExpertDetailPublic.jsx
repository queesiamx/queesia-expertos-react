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
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertHeader from "../components/ExpertHeader";
import ExpertContentList from "../components/ExpertContentList";
import ExpertModal from "../components/ExpertModal";
import ExpertRatingSection from "../components/ExpertRatingSection";
import Footer from "../components/Footer";

// Usa el endpoint absoluto en dev y relativo en producción
const API_BASE =
  import.meta.env.DEV
    ? (import.meta.env.VITE_PUBLIC_URL || "https://expertos.queesia.com")
    : "";

export default function ExpertDetailPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: usuario } = useAuth();

  // Estados básicos
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [contenidos, setContenidos] = useState([]);
  const [verTemario, setVerTemario] = useState(null);

  // Modal compra/registro
  const [modalAbierto, setModalAbierto] = useState(false);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [isBuying, setIsBuying] = useState(false);

  // Guards para evitar popups/duplicados
  const [authBusy, setAuthBusy] = useState(false);
  const [buyingBusy, setBuyingBusy] = useState(false);

  // (no usados, pero los dejaste en tu archivo original)
  const [openCurso, setOpenCurso] = useState(false);
  const [cursoSel, setCursoSel] = useState(null);

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

  // 🔹 Obtener contenidos del experto
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

  // 🔹 Iniciar sesión con Google (para botón “Iniciar sesión”)
  const handleLoginConGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // 🔹 Asegurar sesión (lo usa handleBuy)
  const ensureSignedIn = async () => {
    if (auth.currentUser) return auth.currentUser;
    if (authBusy) return null;
    setAuthBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (e) {
      console.error("Login error:", e);
      if (
        e.code !== "auth/popup-closed-by-user" &&
        e.code !== "auth/cancelled-popup-request"
      ) {
        toast.error("No se pudo iniciar sesión");
      }
      return null;
    } finally {
      setAuthBusy(false);
    }
  };

  // 🔹 Verificar si ya está registrado (para cursos gratis)
  const yaRegistrado = (usuariosRegistrados) => {
    return usuariosRegistrados?.some((u) => u.correo === usuario?.email);
  };

  // 🔹 Abrir modal para curso gratuito
  const handleAbrirModal = (contenido) => {
    setContenidoSeleccionado(contenido);
    setIsBuying(false);
    setModalAbierto(true);
  };

  // 🔹 Abrir modal para compra (curso o manual)
  const handleAbrirModalCompra = (contenido) => {
    setContenidoSeleccionado(contenido);
    setIsBuying(true);
    setModalAbierto(true);
  };

  // 🔹 Registro gratuito (curso)
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

  // 🔹 Compra con Stripe (curso y manual)
  const handleBuy = async (contenido) => {
    if (buyingBusy) return; // evita doble clic
    setBuyingBusy(true);

    try {
      // Usa SIEMPRE auth.currentUser para que las reglas coincidan
      let current = auth.currentUser;
      if (!current) {
        current = await ensureSignedIn();
        if (!current) {
          setBuyingBusy(false);
          return;
        }
      }

      const isCourse =
        Array.isArray(contenido.fechasDisponibles) &&
        contenido.fechasDisponibles.length > 0;
      const precio = Number(contenido.precio ?? 0);

      if (isCourse && !fechaSeleccionada) {
        toast.error("Selecciona una fecha para el curso");
        setBuyingBusy(false);
        return;
      }

      // 1) Crear intención de compra en Firestore
      const compraData = {
        userId: current.uid, // 👈 clave para pasar reglas
        expertoId: expert.id,
        contenidoId: contenido.id,
        titulo: contenido.titulo || "Contenido",
        tipo: isCourse ? "curso" : "manual",
        precio,
        fechaSeleccionada: isCourse ? fechaSeleccionada : null,
        estado: import.meta.env.VITE_STRIPE_PUBLIC_KEY ? "pagando" : "porPagar",
        createdAt: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, "comprasContenido"), compraData);

      // 2) Si NO hay Stripe, cerramos y avisamos
      if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        toast.success("Reserva creada. Te contactaremos para completar el pago.");
        setModalAbierto(false);
        setBuyingBusy(false);
        return;
      }

      // 3) Stripe Checkout (usa API_BASE para dev)
      const resp = await fetch(`${API_BASE}/api/crearPagoContenido`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compraId: ref.id,
          name: compraData.titulo,
          amount: Math.round(precio * 100), // MXN → centavos
          metadata: {
            compraId: ref.id,
            expertoId: expert.id,
            contenidoId: contenido.id,
            tipo: compraData.tipo,
            fechaSeleccionada: compraData.fechaSeleccionada || "",
            userId: current.uid,
            userEmail: current.email || "",
          },
        }),
      });

      // tolera respuestas no-JSON si el server falla
      const raw = await resp.text();
      let data = null;
      try {
        data = JSON.parse(raw);
      } catch {}

      if (resp.ok && data?.url) {
        window.location.href = data.url;
      } else {
        console.error("crearPagoContenido FAIL:", {
          status: resp.status,
          raw,
          data,
        });
        throw new Error((data && data.error) || raw || "No se pudo iniciar el pago");
      }
    } catch (e) {
      console.error("handleBuy error:", e);
      if (String(e).includes("Missing or insufficient permissions")) {
        toast.error("Permisos insuficientes al crear la compra. Revisa login y reglas.");
      } else {
        toast.error("No se pudo iniciar la compra");
      }
    } finally {
      setBuyingBusy(false);
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
            handleAbrirModal={handleAbrirModal}             // registro gratis
            handleAbrirModalCompra={handleAbrirModalCompra} // compra curso/manual
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
          isBuying ? handleBuy(contenidoSeleccionado) : handleRegistroGratuito()
        }
        isBuying={isBuying}
      />

      <Footer />
    </>
  );
}
