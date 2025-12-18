// src/pages/Registro.jsx
import { useState, useEffect } from "react";
import { db, auth } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import {
  doc, getDoc, setDoc, serverTimestamp, onSnapshot
} from "firebase/firestore";
import { startLogin } from "@/auth/login";
import { Toaster, toast } from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import UnifiedNavbar from "../components/UnifiedNavbar";
import Footer from "../components/Footer";


// ============================
// Admin notifications (EmailJS Free)
// Reusa template_n0pj59s SIN modificar la plantilla.
// ============================
const ADMIN_EMAILS = ["misaeltup@gmail.com", "amhjmixqui@gmail.com"];

async function notifyAdminsNewExpert({ nombre, email, especialidad, experiencia, uid }) {
  const mensaje = [
    "🔔 NOTIFICACIÓN QUEESIA",
    "Tipo: Nuevo experto registrado",
    "",
    `Nombre: ${nombre}`,
    `Correo: ${email}`,
    `Especialidad: ${especialidad || "-"}`,
    `Experiencia: ${experiencia || "-"}`,
    `UID: ${uid}`,
    "",
   "Acción requerida:",
   "Revisar y aprobar desde el panel de expertos.",
   "⚠️ Requiere iniciar sesión con una cuenta ADMIN autorizada.",
  ].join("\n");


  // Nota: el template usa {{email}} como destinatario.
  // Por eso aquí "email" es el correo del admin.
  const sends = ADMIN_EMAILS.map((adminEmail) =>
    emailjs.send(
      "service_vdpzkm8",
      "template_n0pj59s",
      {
        email: adminEmail,
         nombre: "Equipo Queesia",
         evento: "Nuevo experto registrado",
        mensaje_personalizado: mensaje,
      },
      "9SxO0lF9IKHaknc4Q"
    )
  );

  await Promise.allSettled(sends);
}

// Etiqueta reutilizable con asterisco para campos obligatorios
const FieldLabel = ({ children, required = false, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium mb-1 text-slate-700"
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);


/* -------------------------------- Stepper -------------------------------- */
function useRegistrationStep(user, loading) {
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (loading) return;               // aún no sabemos si hay sesión
    if (!user) { setStep(1); return; } // sin sesión → Validación

    const ref = doc(db, "experts", user.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) { setStep(2); return; }       // Perfil
        const d = snap.data();
        setStep(d?.aprobado === true ? 4 : 3);            // Confirmación o Revisión
      },
      () => setStep(2)                                    // error/permiso → Perfil
    );
    return () => unsub && unsub();
  }, [user?.uid, loading]);
  return step;
}

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
                <div className={`h-full ${bar} bg-emerald-500`} />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------ Página ----------------------------------- */
export default function Registro() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    nombre: "", especialidad: "", educacion: "", experiencia: "",
    certificaciones: "", linkedin: "", telefono: "", email: "", redes: ""
  });
  const [file, setFile] = useState(null);       // ← faltaba
  const [subiendo, setSubiendo] = useState(false);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  const step = useRegistrationStep(user, loading);

 // Al hidratarse la sesión, autocompleta el email del formulario
 useEffect(() => {
   if (user?.email) {
     setForm(prev => ({ ...prev, email: user.email }));
   }
 }, [user?.email]);

  // Toast solo en paso 1
  useEffect(() => {
    if (step !== 1) return;
    const shown = sessionStorage.getItem("toast_validacion_shown");
    if (shown) return;
    toast((t) => (
      <div className="flex flex-col gap-1">
        <p className="font-medium">Primero valida tu correo para continuar.</p>
        <button
          onClick={() => { handleGoogleLogin(); toast.dismiss(t.id); }}
          className="text-emerald-700 underline font-semibold"
        >
          Inicia sesión con tu cuenta de Google
        </button>
      </div>
    ), { icon: "🔒" });
    sessionStorage.setItem("toast_validacion_shown", "1");
  }, [step]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleGoogleLogin = async () => {
     try {
     await startLogin("experto");   // móvil: redirect; desktop: popup
     // El avance de pasos ya lo controla useRegistrationStep() con onSnapshot
     // y el email se autocompleta en el useEffect anterior.
   } catch (e) {
     console.error("Error con Google Login", e);
     toast.error("No se pudo iniciar sesión con Google.");
   }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) { toast.error("Debes iniciar sesión con Google."); return; }

    const obligatorios = ["nombre", "especialidad", "experiencia", "email"];
    for (const campo of obligatorios) {
      if (!form[campo]) { toast.error(`Falta el campo: ${campo}`); return; }
    }
    if (!aceptoTerminos) { toast.error("Debes aceptar los términos y condiciones."); return; }

    setSubiendo(true);
    try {
      const uid = auth.currentUser.uid;
      const docRef = doc(db, "experts", uid);

      const existing = await getDoc(docRef);
      const aprobado = existing.exists() && existing.data().aprobado === true;
      const tieneFoto = existing.exists() && existing.data().fotoPerfilURL;
      if (aprobado && tieneFoto) {
        toast.error("Tu perfil ya fue aprobado. No puedes modificarlo.");
        setSubiendo(false);
        return;
      }

      let fotoPerfilURL = existing.data()?.fotoPerfilURL || "";
      if (file) {
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
          toast.error("Formato de imagen inválido. Usa .jpg, .jpeg o .png");
          setSubiendo(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "queesia_preset");
        const res = await fetch("https://api.cloudinary.com/v1_1/dzr9rj9cu/image/upload", {
          method: "POST", body: formData,
        });
        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || "Error al subir imagen");
        fotoPerfilURL = data.secure_url;
      }

      const nuevoExperto = {
        ...form,
        certificaciones: form.certificaciones.split(",").map((c) => c.trim()).filter(Boolean),
        educacion: form.educacion.split(",").map((x) => x.trim()).filter(Boolean),
        fotoPerfilURL,
        aprobado: false,
        formularioCompleto: true,
        creadoEn: serverTimestamp(),
      };

      await setDoc(docRef, nuevoExperto);

      await emailjs.send(
        "service_6xnal3g",
        "template_cbwns4s",
        { nombre: form.nombre, email: form.email },
        "9SxO0lF9IKHaknc4Q"
      );

      
      // Notificación interna a admins
      // (NO bloquea el flujo del usuario si falla EmailJS)
      try {
        await notifyAdminsNewExpert({
          nombre: form.nombre,
          email: form.email,
          especialidad: form.especialidad,
          experiencia: form.experiencia,
          uid: auth.currentUser?.uid,
        });
      } catch (e) {
        console.warn("No se pudo notificar a admins:", e);
      }
      
      toast((t) => (
        <div className="flex flex-col gap-1">
          <p className="font-semibold">¡Registro enviado!</p>
          <p className="text-sm">Tu perfil pasará por revisión antes de publicarse.</p>
        </div>
      ), { icon: "✅" });

      setTimeout(() => navigate("/"), 4500);

      setForm({
        nombre: "", especialidad: "", educacion: "", experiencia: "",
        certificaciones: "", linkedin: "", telefono: "", email: "", redes: ""
      });
      setFile(null);
      setAceptoTerminos(false);
    } catch (error) {
      console.error("Error al registrar:", error);
      toast.error("Error al registrar. Intenta más tarde.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
      <UnifiedNavbar />
      <Toaster position="top-center" toastOptions={{
        duration: 4500,
        style: {
          background: "#FFFBEB", color: "#78350F", fontSize: "16px",
          border: "1px solid #FCD34D", borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(245,158,11,0.15)",
        },
        iconTheme: { primary: "#F59E0B", secondary: "#FFFFFF" },
      }} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/40 text-slate-900">
        <main className="mx-auto max-w-6xl px-4">
          <div className="max-w-4xl mx-auto pt-8">
            <div className="flex items-center gap-3 text-sm">
              <button type="button" onClick={() => window.history.back()}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700">
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

            <p className="mt-2 text-slate-600">
              ⓘ Primero valida tu correo para continuar.{" "}
              <button type="button" onClick={handleGoogleLogin}
                      className="text-emerald-700 underline hover:no-underline font-medium">
                Inicia sesión
              </button>{" "}
              con tu cuenta de Google.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <section className="lg:col-span-3">
              <div className="rounded-3xl border border-black/5 bg-white shadow-xl shadow-amber-100/30">
                <div className="p-6 md:p-8">

                  <div className="mb-4 w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 
                flex items-center gap-3 text-amber-800">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">Importante:</span>{" "}
                    Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                  </p>
                </div>


                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Campos */}
                    <div className="md:col-span-2">
                    <FieldLabel htmlFor="nombre" required>
                      Nombre completo
                    </FieldLabel>
                    <input
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre y apellidos"
                      required
                      className="w-full rounded-xl border... focus:ring-emerald-500"
                    />
                  </div>


                    <div>
                      <FieldLabel htmlFor="especialidad" required>
                      Especialidad
                    </FieldLabel>
                      <input id="especialidad" name="especialidad" value={form.especialidad} onChange={handleChange}
                             placeholder="Ej. IA aplicada a auditoría"
                             required
                             className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <FieldLabel htmlFor="correo electrónico" required>
                        Correo electrónico
                      </FieldLabel>
                      <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                             disabled
                             placeholder="tucorreo@ejemplo.com"
                             required
                             className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed" />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="experiencia" required>
                      Resumen de tu experiencia
                    </FieldLabel>
                      <textarea id="experiencia" name="experiencia" rows={4} value={form.experiencia} onChange={handleChange}
                                placeholder="Cuéntanos tu experiencia y el valor que ofreces"
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel htmlFor="educación" required>
                        Educación (separadas por comas)
                      </FieldLabel>
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
                      <FieldLabel htmlFor="linkedin" required>
                        LinkedIn o portafolio
                      </FieldLabel>
                      <input id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange}
                             placeholder="https://linkedin.com/in/tu-perfil"
                             required
                             className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <FieldLabel htmlFor="teléfono" required>
                        Teléfono
                      </FieldLabel>
                      <input id="telefono" name="telefono" value={form.telefono} onChange={handleChange}
                             placeholder="+52 55…"
                             required
                             className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Foto de perfil</label>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center text-slate-400">IMG</div>
                        <div className="flex-1">
                          <input
                            type="file" accept="image/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600"
                          />
                          <p className="mt-1 text-xs text-slate-500">Máx. 2MB • .jpg/.jpeg/.png</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-start gap-3 mt-2">
                      <input type="checkbox" id="aceptoTerminos" checked={aceptoTerminos}
                             onChange={(e)=>setAceptoTerminos(e.target.checked)}
                             className="mt-1 h-5 w-5 rounded-md border-slate-300" required />
                      <p className="text-sm text-slate-600">
                        He leído y acepto los <a href="/terminos" target="_blank" className="underline text-emerald-700">términos</a> y el <a href="/privacidad" target="_blank" className="underline text-emerald-700">aviso de privacidad</a>.
                      </p>
                    </div>

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
            </section>

            <aside className="lg:col-span-2 space-y-6">
              {/* tarjetas informativas (igual que tenías) */}
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
                <h3 className="text-base font-semibold">Consejos para un perfil ganador</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-5">
                  <li>Título claro.</li><li>3–5 logros medibles.</li>
                  <li>Enlaces a trabajos públicos.</li><li>Foto nítida.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
                <h3 className="text-base font-semibold">Requisitos</h3>
                <ol className="mt-3 space-y-2 text-sm text-slate-600 list-decimal pl-5">
                  <li>Cuenta de Google válida.</li>
                  <li>Evidencia de experiencia.</li>
                  <li>Datos de facturación si habrá pagos.</li>
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
