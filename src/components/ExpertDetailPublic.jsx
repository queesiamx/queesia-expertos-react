import { GraduationCap, FileText } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
 import { db, auth } from "@/firebase";
 import { startLogin } from "@/auth/login";
import { useAuth } from "@/auth/context/AuthContext";
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

import toast from "react-hot-toast";
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertHeader from "../components/ExpertHeader";
import ExpertContentList from "../components/ExpertContentList";
import ExpertModal from "../components/ExpertModal";
import CtaBanner from "../components/CtaBanner";
import ExpertRatingSection from "../components/ExpertRatingSection";
import Footer from "../components/Footer";
import PriceTag from "@/components/PriceTag";
import ConsultaBox from "../components/ConsultaBox";
import SidebarFAQ from "../components/SidebarFAQ";


// Usa el endpoint absoluto en dev y relativo en producción
const API_BASE =
  import.meta.env.DEV
    ? (import.meta.env.VITE_PUBLIC_URL || "https://expertos.queesia.com")
    : "";

    // ==== IVA / Precios ====
// Si tu 'precio' en Firestore es SIN IVA, deja true. Si ya incluye IVA, pon false.
const PRECIO_BASE_SIN_IVA = true;
// Tasa de IVA (MX): 16%
const IVA_RATE = 0.16;
const toNumber = (v) => Number(v ?? 0);
const addIVA = (base, rate = IVA_RATE) => base * (1 + rate);
const toCents = (mxn) => Math.round(mxn * 100);


export default function ExpertDetailPublic() {
  const { id: expertoId } = useParams();
  const navigate = useNavigate();
  const { user: usuario, rol } = useAuth();

 // ===== Refs para scroll =====
  const consultaRef = useRef(null);
  const contenidosRef = useRef(null);

    const scrollToRef = (ref) => {
    const el = ref?.current;
    if (!el) return;

    // Navbar height (dinámico)
    const nav = document.querySelector("[data-navbar]");
    const navH = nav ? nav.getBoundingClientRect().height : 0;
    const gap = 12; // separacion visual extra

    const y = window.scrollY + el.getBoundingClientRect().top - navH - gap;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // ===== Seguir (MVP local) =====
  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    if (!expertoId) return;
    const key = `follow_expert_${expertoId}`;
    setIsFollowing(localStorage.getItem(key) === "1");
  }, [expertoId]);

  const toggleFollow = () => {
    if (!usuario) {
      toast.error("Inicia sesión para seguir a un experto.");
      return;
    }

    if (!expertoId) return;
    const key = `follow_expert_${expertoId}`;
    setIsFollowing((prev) => {
      const next = !prev;
      localStorage.setItem(key, next ? "1" : "0");
      toast.success(next ? "Siguiendo experto" : "Dejaste de seguir");
      return next;
    });
  };

  // ===== Compartir =====
  const handleShare = async () => {
    try {
      const url = window.location.href;
      const title = expert?.nombre ? `Perfil: ${expert.nombre}` : "Perfil de experto";
      const text = "Mira este perfil de experto en Queesia";

      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copiado al portapapeles");
   } catch (e) {
      toast.error("No se pudo compartir el enlace");
    }
  };


  // Estados básicos
  const [expert, setExpert] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [contenidos, setContenidos] = useState([]);
  const [verTemario, setVerTemario] = useState(null);

  const resolvedExpertId = expert?.id ?? expertoId; // usa el del doc si ya cargó
  
 // === Normaliza el RESUMEN: prioriza 'experiencia' de Firestore ===
  const resumen = useMemo(() => {
    const pick = [
      expert?.experiencia,   // ← tu campo en Firestore
      expert?.resumen,
      expert?.summary,
      expert?.sobreMi,
      expert?.acercaDe,
      expert?.bio,
    ].find(v => typeof v === "string" && v.trim());
    return (pick || "").trim();
  }, [expert]);

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

// Mostrar/ocultar flechas según overflow y posición
const [canLeft, setCanLeft] = useState(false);
const [canRight, setCanRight] = useState(false);

const updateArrows = () => {
  const el = carruselRef.current;
  if (!el) return;
  const { scrollLeft, clientWidth, scrollWidth } = el;
  setCanLeft(scrollLeft > 0);
  setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
};

// Recalcular al cargar/recargar slides, al hacer scroll y al redimensionar
useEffect(() => {
  updateArrows();
  const el = carruselRef.current;
  if (!el) return;

  el.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);

  return () => {
    el.removeEventListener("scroll", updateArrows);
    window.removeEventListener("resize", updateArrows);
  };
}, [contenidos.length]); // slides está definido más abajo con useMemo


 // Normaliza texto multilinea (de un textarea) a arreglo de strings
 const toLines = (v) =>
   typeof v === "string"
     ? v.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
     : Array.isArray(v) ? v : [];

 // Mapea líneas simples a objetos de experiencia genérica
 const linesToExperiencia = (lines) =>
   lines.map(txt => ({ titulo: txt, periodo: "", empresa: "", descripcion: "" }));


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
    : toList(expert?.tecnologias).length ? toList(expert?.tecnologias)
    : toLines(expert?.certificaciones)); // ← fallback a lista plana del dashboard
// idiomas (puede venir string o array)
const idiomasList = toList(expert?.idiomas);

// experiencia (nos aseguramos que sea array; si no, vacío)
 const experienciaList = Array.isArray(expert?.experiencia)
   ? expert.experiencia
   : linesToExperiencia(toLines(expert?.experiencias))
   || [];

  const yearsExpRaw =
  expert?.aniosExp ??
  expert?.experienciaAnios ??
  expert?.aniosExperiencia ??
  expert?.yearsExperience ??
  "";


 const yearsExp =
   yearsExpRaw === null || yearsExpRaw === undefined || yearsExpRaw === ""
     ? ""
     : String(yearsExpRaw).replace(/[^\d]/g, "");

const showYearsExp = Number(yearsExp) > 0;

   // Procesa el regreso del redirect (si el user inició sesión desde esta vista)
  /*useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          // Aquí no hacemos navigate; solo confirmamos sesión
         // y dejamos que el flujo normal continúe.
          // Si quieres, puedes dar feedback:
         // toast.success("Sesión iniciada");
        }
      })
      .catch(() => {});
  }, []);*/

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
      const base = collection(db, "contenidosExpertos");

      // 1) intenta por expertoId
      let q1 = query(base, where("expertoId", "==", expert.id));
     let snap = await getDocs(q1);

      // 2) si no hay resultados, intenta por expertoUID
      if (snap.empty) {
        const q2 = query(base, where("expertoUID", "==", expert.id));
       snap = await getDocs(q2);
     }

      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Normaliza: acepta 'fechas' o 'fechasDisponibles' del documento
      const normalized = docs.map((d) => ({
        ...d,
        fechasDisponibles: Array.isArray(d.fechasDisponibles) && d.fechasDisponibles.length
          ? d.fechasDisponibles
          : (Array.isArray(d.fechas) ? d.fechas : []),
      }));
      setContenidos(normalized);
    };
    cargarContenidos();
  }, [expert]);

  // 🔹 Iniciar sesión con Google (para botón “Iniciar sesión”)
  const handleLoginConGoogle = async () => {
  await startLogin("usuario"); // o "experto" si lo necesitas por contexto
  };

  // 🔹 Asegurar sesión (lo usa handleBuy)
  const ensureSignedIn = async () => {
   if (auth.currentUser) return auth.currentUser;
   if (authBusy) return null;
   setAuthBusy(true);
   try {
     await startLogin("usuario");
     // Desktop: después del popup, onAuthStateChanged hidrata; aquí intentamos leerlo.
     return auth.currentUser || null;
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

    // --- Cálculo de precio con IVA en CENTAVOS (Stripe exige enteros) ---
    const IVA = 0.16;
    const precioBase = Number(contenido?.precio) || 0;        // MXN
    const subtotalCents = Math.round(precioBase * 100);       // centavos
    const ivaCents = Math.round(subtotalCents * IVA);
    const totalCents = subtotalCents + ivaCents;              // total con IVA (centavos)

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

      const fechasOpts = Array.isArray(contenido.fechasDisponibles) && contenido.fechasDisponibles.length
        ? contenido.fechasDisponibles
        : (Array.isArray(contenido.fechas) ? contenido.fechas : []);
      const isCourse = Array.isArray(fechasOpts) && fechasOpts.length > 0;
      const precio = toNumber(contenido.precio ?? 0);

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
        precio,                        // base MXN (útil para auditoría)
        ivaRate: IVA,                  // 0.16
        subtotalMXN: precioBase,
        totalMXN: totalCents / 100,
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
           // Cobrar SIEMPRE el total con IVA en centavos (ya calculado)
          amount: totalCents,
          currency: "mxn",
          metadata: {
            compraId: ref.id,
            expertoId: expert.id,
            contenidoId: contenido.id,
            tipo: compraData.tipo,
            fechaSeleccionada: compraData.fechaSeleccionada || "",
            userId: current.uid,
            userEmail: current.email || "",
            price_base: String(precio),
            iva_rate: String(IVA),
            price_total_with_iva_cents: String(totalCents),
            subtotal_cents: String(subtotalCents),
            iva_cents: String(ivaCents),
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

 // Slides visibles en carrusel (excluye 'consulta')
 const slides = useMemo(() => {
   return (contenidos ?? []).filter((c) => {
     const isConsulta =
       c.tipo === "consulta" ||
       c.esConsulta === true ||
       c.slug === "consulta" ||
       /consulta/i.test(String(c.titulo || ""));
     return !isConsulta;
   });
 }, [contenidos]);

// === Helpers de tipo y badge ===============================
const inferTipo = (c) => {
  const fechas = Array.isArray(c.fechasDisponibles) && c.fechasDisponibles.length
    ? c.fechasDisponibles
    : (Array.isArray(c.fechas) ? c.fechas : []);

  const tipoRaw = String(c?.tipo || "").toLowerCase().trim();
  const text = `${tipoRaw} ${c?.slug||""} ${c?.titulo||""} ${c?.descripcion||""}`.toLowerCase();

  // ¿Hay archivo/temario?
  const temarioHref =
    c.temarioHref ?? c.archivoUrl ?? c.urlArchivo ?? c.fileUrl ?? null;
  const hasArchivo = Boolean(temarioHref);

  // Prioriza lo explícito en c.tipo
  if (/(manual|ebook|e-book|gu[ií]a|pdf|libro|documento|descargable)/.test(tipoRaw)) return "manual";
  if (/(curso|taller|clase|bootcamp|workshop)/.test(tipoRaw)) return "curso";

  // Heurísticas
  if (fechas.length > 0) return "curso"; // fechas => curso
  if (hasArchivo && fechas.length === 0) return "manual"; // archivo sin fechas => manual

  // Palabras en título/desc
  if (/(manual|ebook|e-book|gu[ií]a|pdf|libro|documento|descargable)/.test(text)) return "manual";
  if (/(curso|taller|clase|bootcamp|workshop)/.test(text)) return "curso";

  return "contenido";
};


const TipoBadge = ({ tipo }) => {
  const label = tipo === "curso" ? "Curso" : tipo === "manual" ? "Manual" : "Contenido";
  const cls =
    tipo === "curso"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : tipo === "manual"
      ? "bg-slate-50 text-slate-700 ring-slate-200"
      : "bg-slate-50 text-slate-600 ring-slate-200";
  const Icon = tipo === "curso" ? GraduationCap : tipo === "manual" ? FileText : null;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full ring-1 ${cls}`}>
      {Icon ? <Icon size={14} strokeWidth={2} /> : null}
      {label}
    </span>
  );
};


 if (cargando) return <p className="p-6">Cargando experto...</p>;
 if (!expert) return <p className="p-6">Experto no encontrado.</p>;


  return (
    <>
      <UnifiedNavbar />

      <div className="min-h-screen px-4 py-10 font-sans bg-transparent">
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
    {expert?.especialidad}
    {expert?.ciudad ? ` • ${expert.ciudad}` : ""}
    {showYearsExp ? ` • ${yearsExp}+ años exp.` : ""}
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
    <button
      onClick={() => scrollToRef(consultaRef)}
      className="rounded-xl bg-emerald-600 text-white px-4 py-2.5 font-medium shadow-sm hover:bg-emerald-700"
      type="button"
    >
      Consultar
    </button>
     <button
      onClick={() => scrollToRef(contenidosRef)}
      className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2.5 font-medium ring-1 ring-black/5 hover:bg-white"
      type="button"
    >
      Reservar sesión
    </button>
    <div className="flex gap-2">
      <button
        onClick={toggleFollow}
        className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white"
        type="button"
      >
        {isFollowing ? "Siguiendo" : "Seguir"}
      </button>
      <button
        onClick={handleShare}
        className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white"
        type="button"
      >
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

                  <CtaBanner
  title="Hablemos de tu proyecto"
  buttonText="Escríbenos aquí"
  href="https://queesia.com/contacto"
  className="mt-6"
/>

        {/* === GRID PRINCIPAL (3/5 + 2/5) === */}
<div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

  {/* === Columna izquierda (3/5) === */}
  <section className="lg:col-span-8 space-y-6">

     {/* === Resumen (único) === */}
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900" />
        <h2 className="text-lg font-semibold">Resumen</h2>
      </div>
    <p className="rich-text whitespace-pre-line text-slate-700 leading-relaxed">
    {resumen || "El experto aún no ha agregado su resumen."}
     </p>
    </div>

    {/* Consulta al experto (fuera del carrusel) */}
    <div
      ref={consultaRef}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl"
    >
      <ConsultaBox
        expertoId={resolvedExpertId}
        expertoNombre={expert?.nombre}
      />
    </div>

    {/* === Contenidos disponibles — CARRUSEL === */}
    <div
      ref={contenidosRef}
      className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl"
    >
      <div className="flex items-center justify-between gap-4">
  <h2 className="text-lg font-semibold">Contenidos disponibles</h2>
  <div className="hidden md:flex gap-2">
    {canLeft && (
      <button
        onClick={() => scrollByX(-scrollStep())}
        className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white"
        aria-label="Anterior"
      >
        ←
      </button>
    )}
    {canRight && (
      <button
        onClick={() => scrollByX(scrollStep())}
        className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 ring-1 ring-black/5 hover:bg-white"
        aria-label="Siguiente"
      >
        →
      </button>
    )}
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

                <div className="mb-2">
                  <TipoBadge tipo={inferTipo(c)} />
                </div>

               {(() => {
                  // Normaliza nombres de campo para el archivo/temario
                  const temarioHref =
                    c.temarioHref ??
                    c.archivoUrl ??
                    c.urlArchivo ??
                    c.fileUrl ??
                    null;
                  const linkHref = c.href ?? temarioHref ?? '#';

                  return (
                    <>
                      <a
                        className="font-medium hover:underline"
                        href={temarioHref ? temarioHref : linkHref}
                        target={temarioHref ? "_blank" : undefined}
                        rel={temarioHref ? "noopener noreferrer" : undefined}
                      >
                        {c.titulo}
                      </a>
                      <p className="text-sm text-slate-600 mt-1">{c.descripcion}</p>

                      {(temarioHref || typeof setVerTemario === 'function') && (
                        temarioHref ? (
                          <a
                            href={temarioHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs mt-2 px-3 py-1 ring-1 ring-black/5 rounded-lg bg-white hover:bg-slate-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver temario
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVerTemario?.(c.id)}
                            className="inline-block text-xs mt-2 px-3 py-1 ring-1 ring-black/5 rounded-lg bg-white hover:bg-slate-100"
                          >
                            Ver temario
                         </button>
                        )
                      )}
                    </>
                  );
                })()}
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
                  const precioNum = toNumber(c.precio);
                  // Solo consideramos "con precio" si es estrictamente > 0
                  const hasPrice = Number.isFinite(precioNum) && precioNum > 0;
                  const isFree =
                    Boolean(c.gratis) ||
                    precioNum === 0 ||
                    /gratis/i.test(String(c.descripcion || ""));

                  // consideramos “gratis” si el contenido lo marca
                  // o si es una consulta, o no hay precio válido               

                  const cta =
                    c.cta || (isConsulta ? "Enviar" : isFree ? "Obtener" : "Comprar");

                  return (
                    <>
                    {isFree ? (
                      <span className="font-semibold text-emerald-700">Gratis</span>
                    ) : hasPrice ? (
                      <div className="flex items-baseline gap-2">
                        {/* Mostrar SIEMPRE el precio base y aclarar que es + IVA */}
                        <PriceTag amount={precioNum} className="mt-1" />
                        <span className="text-[11px] text-slate-600" title="Se suma 16% al pagar">
                          + IVA
                        </span>
                      </div>
                    ) : null}
                    <button
                      type="button"
                       onClick={() =>
                      isFree ? handleAbrirModal(c) : handleAbrirModalCompra(c)
                      }
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
  {/* Dots de paginación (simple) */}
  {slides.length > 1 && (
    <div className="mt-3 flex items-center justify-center gap-2">
      {slides.map((_, i) => (
        <span key={i} className="h-2 w-2 rounded-full bg-slate-300 inline-block" />
      ))}
    </div>
  )}

      </div>
    </div>

{/* === Califica a este experto === */}
<ExpertRatingSection
  expertId={expert.id}
  usuario={usuario}
  rolUsuario={rol}
  isOwnProfile={!!usuario?.uid && usuario.uid === expert?.id}
  handleLoginConGoogle={handleLoginConGoogle}
/>


  </section>

  {/* === Columna derecha (2/5) === */}
  <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h3 className="text-base font-semibold">Disponibilidad</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>{expert?.disponibilidad || "Lunes a viernes — 10:00 a 18:00 (UTC-6)"}</li>
        <li>{expert?.SLA || "Responde en 24 h"}</li>
      </ul>
    </div>
    <SidebarFAQ />

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
        availableDates={contenidoSeleccionado?.fechasDisponibles || contenidoSeleccionado?.fechas || []}
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
