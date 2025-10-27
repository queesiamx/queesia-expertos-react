import { useState, useEffect } from 'react';
import { db, auth } from "@/firebase";
// + NUEVOS
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, collection, query, where, limit } from "firebase/firestore";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getAuth } from "firebase/auth";
import { Toaster, toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer"; // <-- ajusta la ruta si difiere

// --- Hook: calcula fase del registro (1..4) ---
/**
 * 1 = Validación (no autenticado)
 * 2 = Perfil (autenticado, sin doc en 'experts')
 * 3 = Revisión (doc existe y !aprobado)
 * 4 = Confirmación (aprobado === true)
 */
// --- Hook: calcula fase del registro (1..4) ---
// --- Hook: calcula fase del registro (1..4) ---
// 1=Validación (no logueado)  2=Perfil (logueado sin doc)  3=Revisión (!aprobado)  4=Confirmación (aprobado)
// --- Hook: calcula fase del registro (1..4) ---
// 1..4 = Validación, Perfil, Revisión, Confirmación
function useRegistrationStep() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    let unsubscribeProfile = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setStep(1);
        if (unsubscribeProfile) { unsubscribeProfile(); unsubscribeProfile = null; }
        return;
      }

      // Doc directo: experts/{uid}
      const ref = doc(db, "experts", user.uid);

      // Suscripción con callback de error → cae a paso 2 si no hay permisos/lectura
      unsubscribeProfile = onSnapshot(
        ref,
        (snap) => {
          if (!snap.exists()) { setStep(2); return; }
          const d = snap.data();
          setStep(d && d.aprobado === true ? 4 : 3);
        },
        (err) => {
          console.warn("Stepper: lectura denegada o error", err?.code || err);
          setStep(2);
        }
      );
    });

    return () => {
      unsubAuth && unsubAuth();
      unsubscribeProfile && unsubscribeProfile();
    };
  }, []);

  return step;
}


// --- Stepper (UI) ---
function Stepper({ current }) {
  const steps = [
    { id: 1, label: "Validación" },
    { id: 2, label: "Perfil" },
    { id: 3, label: "Revisión" },
    { id: 4, label: "Confirmación" },
  ];
  return (
    <ol className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
      {steps.map((s) => {
        const status = s.id < current ? "done" : s.id === current ? "active" : "todo";
        const circle =
          status === "done" || status === "active" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-600";
        const bar = status === "done" ? "w-full" : status === "active" ? "w-1/2" : "w-0";
        return (
          <li key={s.id} className="relative flex items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
            <div className={`h-7 w-7 shrink-0 rounded-xl grid place-items-center text-sm font-bold ${circle}`}>
              {status === "done" ? "✓" : s.id}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{s.label}</p>
              <div className="mt-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full ${bar} bg-emerald-500`}></div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}


export default function Registro() {
  const [form, setForm] = useState({
    nombre: '',
    especialidad: '',
    educacion: '',
    experiencia: '',
    certificaciones: '',
    linkedin: '',
    telefono: '',
    email: '',
    redes: ''
  });

  const [file, setFile] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      setForm(prev => ({ ...prev, email: auth.currentUser.email || '' }));

      const cargarDatosPrevios = async () => {
        const ref = doc(db, 'experts', auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.aprobado === true && data.formularioCompleto === true) {
            toast.success('Ya has sido aprobado.');
            navigate('/expert-dashboard');
          } else {
            setForm(prev => ({
              ...prev,
              ...data,
              certificaciones: Array.isArray(data.certificaciones) ? data.certificaciones.join(', ') : '',
              educacion: Array.isArray(data.educacion) ? data.educacion.join(', ') : '',
            }));
          }
        }
      };

      cargarDatosPrevios();
    }
  }, []);


    const step = useRegistrationStep(); // ← dinámico con Auth+Firestore


  // ─────────────────────────────────────────────────────────────
  // Toast centrado para pedir validación/login (solo en paso 1).
  // Se muestra una única vez por sesión.
  useEffect(() => {
    if (step !== 1) return;
    const shown = sessionStorage.getItem("toast_validacion_shown");
    if (shown) return;
    toast(
      (t) => (
        <div className="flex flex-col gap-1">
          <p className="font-medium">Primero valida tu correo para continuar.</p>
          <button
            onClick={() => { handleGoogleLogin(); toast.dismiss(t.id); }}
            className="text-emerald-700 underline font-semibold"
          >
            Inicia sesión con tu cuenta de Google
          </button>
        </div>
      ),
      { icon: "🔒" }
    );
    sessionStorage.setItem("toast_validacion_shown", "1");
  }, [step]);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const expertRef = doc(db, 'experts', user.uid);
      const expertSnap = await getDoc(expertRef);

      if (expertSnap.exists()) {
        const data = expertSnap.data();
        if (data.aprobado === true && data.formularioCompleto === true) {
          toast.success('Bienvenido, acceso aprobado.');
          navigate('/expert-dashboard');
        } else if (data.aprobado === false) {
          toast('Completa tu formulario para continuar.');
        }
      } else {
        toast('Bienvenido. Completa tu formulario para continuar.');
      }


      setForm(prev => ({
        ...prev,
        email: user.email || '',
      }));
    } catch (error) {
      console.error('Error con Google Login', error);
      toast.error('No se pudo iniciar sesión con Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('Debes iniciar sesión con Google.');
      return;
    }

    const obligatorios = ['nombre', 'especialidad', 'experiencia', 'email'];
    for (let campo of obligatorios) {
      if (!form[campo]) {
        toast.error(`Falta el campo: ${campo}`);
        return;
      }
    }

    if (!aceptoTerminos) {
      toast.error('Debes aceptar los términos y condiciones.');
      return;
    }

    setSubiendo(true);
    try {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, 'experts', uid);

      const existing = await getDoc(docRef);
      const aprobado = existing.exists() && existing.data().aprobado === true;
      const tieneFoto = existing.exists() && existing.data().fotoPerfilURL;

      if (aprobado && tieneFoto) {
        toast.error("Tu perfil ya fue aprobado. No puedes modificarlo.");
        setSubiendo(false);
        return;
      }

      let fotoPerfilURL = '';

      if (file) {
        if (
          !file ||
          file.size === 0 ||
          !['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
        ) {
          toast.error("Formato de imagen inválido. Usa .jpg, .jpeg o .png");
          setSubiendo(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'queesia_preset');

        const res = await fetch('https://api.cloudinary.com/v1_1/dzr9rj9cu/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || 'Error al subir imagen');
        fotoPerfilURL = data.secure_url;
      }

      const nuevoExperto = {
        ...form,
        certificaciones: form.certificaciones
          .split(',')
          .map(c => c.trim())
          .filter(Boolean),
        educacion: form.educacion
          .split(',')
          .map(e => e.trim())
          .filter(Boolean),
        fotoPerfilURL: fotoPerfilURL || existing.data()?.fotoPerfilURL || '',
        aprobado: false,
        formularioCompleto: true,
        creadoEn: serverTimestamp(),
      };

      await setDoc(docRef, nuevoExperto);

      await emailjs.send(
        'service_6xnal3g',
        'template_cbwns4s',
        {
          nombre: form.nombre,
          email: form.email
        },
        '9SxO0lF9IKHaknc4Q'
      );

            // Toast emergente + redirección al home tras ~4.5 s
      toast(
        (t) => (
          <div className="flex flex-col gap-1">
            <p className="font-semibold">¡Registro enviado!</p>
            <p className="text-sm">
              Tu perfil pasará por una revisión rápida para verificar identidad y calidad del contenido antes de publicarse.
            </p>
          </div>
        ),
        { icon: "✅" }
      );
      setTimeout(() => {
        navigate("/"); // home de expertos
      }, 4500);

      setForm({
        nombre: '',
        especialidad: '',
        educacion: '',
        experiencia: '',
        certificaciones: '',
        linkedin: '',
        telefono: '',
        email: '',
        redes: ''
      });
      setFile(null);
      setAceptoTerminos(false);
    } catch (error) {
      console.error('Error al registrar:', error);
      toast.error('Error al registrar. Intenta más tarde.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      {typeof window !== "undefined" && <UnifiedNavbar />
}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4500,
          style: {
            background: "#FFFBEB",       // amber-50
            color: "#78350F",            // amber-900
            fontSize: "16px",
            border: "1px solid #FCD34D", // amber-300
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(245,158,11,0.15)",
          },
          iconTheme: { primary: "#F59E0B", secondary: "#FFFFFF" }, // amber-500
        }}
      />


      {/* NUEVO LAYOUT (sustituye el container-base completo por esto) */}
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/40 text-slate-900">
  <main className="mx-auto max-w-6xl px-4">
    {/* Breadcrumb + título */}
    <div className="max-w-4xl mx-auto pt-8">
      <div className="flex items-center gap-3 text-sm">
        <button type="button" onClick={() => window.history.back()} className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700">
          <span aria-hidden>←</span> Regresar
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500">Expertos</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-800">Registro</span>
      </div>

      <h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight">
        Registro de Expertos
      </h1>

      <Stepper current={step} />

      {/* Conserva tu login con Google */}
      <p className="mt-2 text-slate-600 leading-relaxed">
         ⓘ Primero valida tu correo para continuar.{" "}
        <button type="button" onClick={handleGoogleLogin} className="text-emerald-700 underline hover:no-underline font-medium">
          Inicia sesión
        </button>{" "}
        con tu cuenta de Google.
      </p>
    </div>

    {/* Grid principal: formulario + aside */}
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* --- Formulario (3/5) --- */}
      <section className="lg:col-span-3">
        <div className="rounded-3xl border border-black/5 bg-white shadow-xl shadow-amber-100/30">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AQUÍ sustituirás el mapeo de inputs por los campos del punto 3 (abajo) */}
              {/* Pega dentro del <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}

<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-1" htmlFor="nombre">Nombre completo</label>
  <input id="nombre" name="nombre" value={form.nombre} onChange={handleChange}
         placeholder="Tu nombre y apellidos"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div>
  <label className="block text-sm font-medium mb-1" htmlFor="especialidad">Especialidad</label>
  <input id="especialidad" name="especialidad" value={form.especialidad} onChange={handleChange}
         placeholder="Ej. IA aplicada a auditoría"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div>
  <label className="block text-sm font-medium mb-1" htmlFor="email">Correo electrónico</label>
  <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
         disabled
         placeholder="tucorreo@ejemplo.com"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed" />
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-1" htmlFor="experiencia">Resumen de tu experiencia</label>
  <textarea id="experiencia" name="experiencia" rows={4} value={form.experiencia} onChange={handleChange}
            placeholder="Cuéntanos tu experiencia y el valor que ofreces a clientes/estudiantes"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-1" htmlFor="educacion">Educación (separada por comas)</label>
  <input id="educacion" name="educacion" value={form.educacion} onChange={handleChange}
         placeholder="Maestría…, Licenciatura…, Diplomado…"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-1" htmlFor="certificaciones">Certificaciones (separadas por comas)</label>
  <input id="certificaciones" name="certificaciones" value={form.certificaciones} onChange={handleChange}
         placeholder="AWS AI Practitioner, NVIDIA DLI, …"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div>
  <label className="block text-sm font-medium mb-1" htmlFor="linkedin">LinkedIn o portafolio</label>
  <input id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange}
         placeholder="https://linkedin.com/in/tu-perfil"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div>
  <label className="block text-sm font-medium mb-1" htmlFor="telefono">Teléfono</label>
  <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange}
         placeholder="+52 55…"
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-1" htmlFor="redes">Redes sociales (opcional)</label>
  <input id="redes" name="redes" value={form.redes} onChange={handleChange}
         placeholder="@usuario en X, IG; YouTube; etc."
         className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
</div>

{/* Upload con tu lógica vigente */}
<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-2">Foto de perfil</label>
  <div className="flex items-center gap-4">
    <div className="h-16 w-16 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center text-slate-400">IMG</div>
    <div className="flex-1">
      {/* mantenemos tu input REAL para Cloudinary */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600"
      />
      <p className="mt-1 text-xs text-slate-500">Máx. 2MB • Se recortará a 1:1 automáticamente</p>
    </div>
  </div>
</div>

{/* Términos */}
<div className="md:col-span-2 flex items-start gap-3 mt-2">
  <input type="checkbox" id="aceptoTerminos" checked={aceptoTerminos}
         onChange={(e)=>setAceptoTerminos(e.target.checked)}
         className="mt-1 h-5 w-5 rounded-md border-slate-300" required />
  <p className="text-sm text-slate-600">
    He leído y acepto los <a href="/terminos" target="_blank" className="underline hover:no-underline text-emerald-700">términos y condiciones</a> y el <a href="/privacidad" target="_blank" className="underline hover:no-underline text-emerald-700">aviso de privacidad</a>.
  </p>
</div>

{/* Acciones (respetan tu estado `subiendo`) */}
<div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
  <button type="submit" disabled={subiendo || !aceptoTerminos}
          className={`inline-flex justify-center rounded-xl text-white px-4 py-2.5 font-medium shadow-sm ${subiendo || !aceptoTerminos ? "bg-emerald-600/60 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}>
    {subiendo ? "Enviando..." : "Registrar experto"}
  </button>
  <button type="button" className="inline-flex justify-center rounded-xl bg-slate-100 text-slate-700 px-4 py-2.5 font-medium ring-1 ring-black/5 hover:bg-white">
    Guardar borrador
  </button>
</div>

            </form>
          </div>
        </div>

{/* Aviso movido a toast emergente en handleSubmit */}
      </section>

      {/* --- Aside (2/5) --- */}
      <aside className="lg:col-span-2 space-y-6">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
          <h3 className="text-base font-semibold">Consejos para un perfil ganador</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
            <li>Usa un título claro (ej. “Auditor IA en compras públicas”).</li>
            <li>Incluye 3–5 logros medibles y recientes.</li>
            <li>Agrega 1–2 enlaces de trabajos públicos o repositorios.</li>
            <li>Selecciona una foto nítida con fondo neutro.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
          <h3 className="text-base font-semibold">Vista previa (mock)</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center text-slate-400">IMG</div>
            <div>
              <p className="font-medium">Tu Nombre</p>
              <p className="text-sm text-slate-600">Especialidad • Ciudad • 5+ años exp.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>“Breve resumen de impacto y propuesta de valor. Qué sabes hacer y para quién. Tecnologías y sectores.”</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['Auditoría','IA/ML','Python','NLP','PyTorch'].map(tag => (
                <span key={tag} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs ring-1 ring-black/5">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
          <h3 className="text-base font-semibold">Requisitos</h3>
          <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal pl-5">
            <li>Cuenta de Google válida (para verificación).</li>
            <li>Evidencia de experiencia (LinkedIn/portafolio/certificaciones).</li>
            <li>Datos de facturación si ofrecerás servicios de pago.</li>
          </ol>
        </div>
      </aside>
      
    </div>
      
  </main>
  <Footer />
</div>

    </>
  );
}
