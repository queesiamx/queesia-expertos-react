import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
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
import ConsultaBox from "../components/ConsultaBox";

// Usa el endpoint absoluto en dev y relativo en producción
const API_BASE =
  import.meta.env.DEV
    ? (import.meta.env.VITE_PUBLIC_URL || "https://expertos.queesia.com")
    : "";

export default function ExpertDetailPublic() {
  const { id: expertoId } = useParams();
 const navigate = useNavigate();
  const { user: usuario } = useAuth();

  // Estados básicos
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [contenidos, setContenidos] = useState([]);
  const [verTemario, setVerTemario] = useState(null);

  const resolvedExpertId = expert?.id ?? expertoId; // usa el del doc si ya cargó
  

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

  // Carrusel (helpers)
const carruselRef = useRef(null);
const scrollStep = () =>
  Math.floor((carruselRef.current?.clientWidth || 600) * 0.9);
const scrollByX = (dx) =>
  carruselRef.current?.scrollBy({ left: dx, behavior: "smooth" });

// ---------- Normalizadores a array ----------
const toList = (v) =>
  Array.isArray(v)
    ? v
    : (typeof v === "string"
        ? v.split(",").map(s => s.trim()).filter(Boolean)
        : []);

// preferimos la primera lista no vacía entre skills, tags o tecnologias
const tagsList =
  (toList(expert?.skills).length ? toList(expert?.skills)
   : toList(expert?.tags).length ? toList(expert?.tags)
   : toList(expert?.tecnologias));

// idiomas (puede venir string o array)
const idiomasList = toList(expert?.idiomas);

// experiencia (nos aseguramos que sea array; si no, vacío)
const experienciaList = Array.isArray(expert?.experiencia) ? expert.experiencia : [];

  // 🔹 Obtener datos del experto
useEffect(() => {
  if (!expertoId) return; // evita correr sin id

  const obtener = async () => {
    const docRef = doc(db, "experts", expertoId);   // ✅ usa el id de la URL
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      setExpert({ id: snapshot.id, ...snapshot.data() });
    } else {
      setExpert(null);
    }
    setCargando(false);
  };

  obtener();
}, [expertoId]); // ✅ dependencia correcta


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

      <div className="min-h-screen bg-white px-4 py-10 font-sans">
        <div className="max-w-5xl mx-auto">
          {/* Botón volver */}
          <div>
            <button
              onClick={() => navigate("/expertos")}
              className="text-sm text-blue-500 hover:underline"
            >
              ← Volver al listado
            </button>
          </div>

          {/* Card: Encabezado del experto */}
          <div className="mt-5 rounded-3xl border border-black/5 bg-white shadow-xl shadow-gray-200 p-6 md:p-8">
            {/* Header de perfil */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
  <div className="flex items-start gap-5">
    {/* Foto o fallback */}
    { (expert?.fotoPerfilURL || expert?.foto || expert?.photoURL) ? (
      <img
        src={expert.fotoPerfilURL || expert.foto || expert.photoURL}
        alt={expert?.nombre || "Foto de perfil"}
        className="h-24 w-24 md:h-28 md:w-28 rounded-2xl object-cover ring-1 ring-black/5"
      />
    ) : (
      <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center text-slate-400">
        IMG
      </div>
    )}

    <div>
      <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{expert?.nombre}</h1>
      <p className="mt-1 text-emerald-700 font-medium">
        {expert?.titulo || expert?.especialidad}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {expert?.especialidad} • {expert?.ciudad} • {(expert?.aniosExp ?? expert?.experienciaAnios) || "—"}+ años exp.
      </p>

      {/* Tags/skills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {tagsList.map(tag => (
          <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs ring-1 ring-black/5">
            {tag}
          </span>
        ))}

      </div>
    </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
    <button className="rounded-xl bg-emerald-600 text-white px-4 py-2.5 font-medium shadow-sm hover:bg-emerald-700">
      Consultar
    </button>
    <button className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2.5 font-medium ring-1 ring-black/5 hover:bg-white">
      Reservar sesión
    </button>
    <div className="flex gap-2">
      <button className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white">
        Seguir
      </button>
      <button className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white">
        Compartir
      </button>
    </div>
  </div>
</div>

{/* Métricas */}
<div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
  <div className="rounded-xl bg-slate-50 ring-1 ring-black/5 p-3">
    <p className="text-xs text-slate-500">Calificación</p>
    <p className="mt-1 font-semibold">
      {expert?.rating ?? "—"} <span className="text-xs text-slate-500">({expert?.ratingCount || 0})</span>
    </p>
  </div>
  <div className="rounded-xl bg-slate-50 ring-1 ring-black/5 p-3">
    <p className="text-xs text-slate-500">Proyectos</p>
    <p className="mt-1 font-semibold">{expert?.proyectos || 0}</p>
  </div>
  <div className="rounded-xl bg-slate-50 ring-1 ring-black/5 p-3">
    <p className="text-xs text-slate-500">Alumnos</p>
    <p className="mt-1 font-semibold">{expert?.alumnos || 0}</p>
  </div>
  <div className="rounded-xl bg-slate-50 ring-1 ring-black/5 p-3">
    <p className="text-xs text-slate-500">Respuesta</p>
    <p className="mt-1 font-semibold">{expert?.tiempoRespuesta || "< 24h"}</p>
  </div>
</div>

        
        </div>

        {/* === GRID PRINCIPAL (3/5 + 2/5) === */}
<div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">

  {/* === Columna izquierda (3/5) === */}
  <section className="lg:col-span-3 space-y-6">

    {/* === Sobre mí === */}
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold">Sobre mí</h2>
      <p className="mt-2 text-sm text-slate-700 leading-relaxed">
        {expert?.sobreMi}
      </p>
    </div>

    {/* === Experiencia === */}
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h2 className="text-lg font-semibold">Experiencia</h2>
      <ul className="mt-3 space-y-3">
        {experienciaList.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-slate-100 ring-1 ring-black/5 grid place-items-center text-slate-400">🏢</div>
            <div>
              <p className="font-medium">{item?.titulo}</p>
              <p className="text-sm text-slate-600">{item?.periodo} • {item?.empresa}</p>
              <p className="text-sm text-slate-600 mt-1">{item?.descripcion}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>

    {/* === Contenidos disponibles — CARRUSEL === */}
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Contenidos disponibles</h2>
        <div className="flex gap-2">
          <button onClick={() => scrollByX(-scrollStep())} className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white">←</button>
          <button onClick={() => scrollByX( scrollStep())} className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white">→</button>
        </div>
      </div>

      <div className="mt-4 relative">
        <div
          ref={carruselRef}
          className="scrollbar-none overflow-x-auto overscroll-x-contain snap-x snap-mandatory flex gap-4 pb-2"
          role="region"
          aria-roledescription="Carrusel"
          aria-label="Contenidos del experto"
          tabIndex={0}
        >

          {/* Slide fijo: Consulta al experto */}
          <article className="min-w-[280px] sm:min-w-[360px] snap-start rounded-2xl ring-1 ring-black/5 bg-slate-50 p-5 md:p-6">
            <ConsultaBox
              expertoId={resolvedExpertId}   // resolvedExpertId = expert?.id ?? expertoId
              expertoNombre={expert?.nombre}
            />

          </article>


          {(contenidos ?? [])
            .filter((c) => {
              const isConsulta =
                c.tipo === "consulta" ||
                c.esConsulta === true ||
                c.slug === "consulta" ||
                /consulta/i.test(String(c.titulo || ""));
              return !isConsulta; // ⬅️ excluye consultas del carrusel
            })
            .map((c) => (

            <article key={c.id} className="min-w-[280px] sm:min-w-[360px] snap-start rounded-2xl ring-1 ring-black/5 bg-slate-50 p-5 md:p-6 flex flex-col justify-between">
              <div>
                <a className="font-medium hover:underline" href={c.href || '#'}>{c.titulo}</a>
                <p className="text-sm text-slate-600 mt-1">{c.descripcion}</p>
                {(c.temarioHref || setVerTemario) && (
                  <button
                    type="button"
                    onClick={() => (c.temarioHref ? window.open(c.temarioHref, "_blank") : setVerTemario?.(c.id))}
                    className="inline-block text-xs mt-2 px-3 py-1 ring-1 ring-black/5 rounded-lg bg-white hover:bg-slate-100"
                  >
                    Ver temario
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">

                {(() => {
                  // detectar tipos
                  const isConsulta =
                    c.tipo === "consulta" ||
                    c.esConsulta === true ||
                    c.slug === "consulta" ||
                    /consulta/i.test(String(c.titulo || ""));

                  // precio válido solo si es número > 0
                  const precioNum = Number(c.precio);
                  const hasPrice = Number.isFinite(precioNum) && precioNum > 0;

                  // consideramos “gratis” si el contenido lo marca
                  // o si es una consulta, o no hay precio válido
                  const isFree = Boolean(c.gratis) || isConsulta || !hasPrice;

                  const cta =
                    c.cta || (isConsulta ? "Enviar" : hasPrice ? "Comprar" : "Obtener");

                  return (
                    <>
                      {hasPrice && (
                        <p className="font-semibold">${precioNum}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => (isFree ? handleAbrirModal(c) : handleAbrirModalCompra(c))}
                        className="rounded-xl bg-emerald-600 text-white px-4 py-2 font-medium shadow-sm hover:bg-emerald-700"
                      >
                        {cta}
                      </button>
                    </>
                  );
                })()}



              </div>
            </article>
          ))}
        </div>
      </div>
    </div>

{/* === Califica a este experto === */}
<ExpertRatingSection
  expertId={expert.id}
  usuario={usuario}
  handleLoginConGoogle={handleLoginConGoogle}
/>


  </section>

  {/* === Columna derecha (2/5) === */}
  <aside className="lg:col-span-2 space-y-6">
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h3 className="text-base font-semibold">Disponibilidad</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>{expert?.disponibilidad || "Lunes a viernes — 10:00 a 18:00 (UTC-6)"}</li>
        <li>{expert?.SLA || "Responde en 24 h"}</li>
      </ul>
    </div>

    {/*<div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h3 className="text-base font-semibold">Idiomas</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {idiomasList.map((lang) => (
        <span key={lang} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs ring-1 ring-black/5">{lang}</span>
      ))}

      </div>
    </div>*/}


  </aside>

</div>


          {/* Card: Lista de contenidos //<ExpertContentList
          // // contenidos={contenidos}
           // usuario={usuario}
          //  verTemario={verTemario}
           // setVerTemario={setVerTemario}
          //  handleAbrirModal={handleAbrirModal}             // registro gratis
          //  handleAbrirModalCompra={handleAbrirModalCompra} // compra curso/manual
          //  handleBuy={handleBuy}
           // handleLoginConGoogle={handleLoginConGoogle}
          
          */}
          
           

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
