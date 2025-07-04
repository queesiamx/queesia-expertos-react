import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
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
import QuesiaNavbar from "../components/QuesiaNavbar";

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

  // ✅ 1. Prellenar email si ya hay sesión activa
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
            navigate('/dashboard');
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
          navigate('/dashboard');
        } else if (data.aprobado === false) {
          toast('Completa tu formulario para continuar.');
        }
      } else {
        await setDoc(expertRef, {
          email: user.email,
          aprobado: false,
          creadoEn: serverTimestamp(),
          formularioCompleto: false
        });
        toast('Bienvenido. Completa tu formulario.');
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
      if (existing.exists() && existing.data().aprobado === true) {
        toast.error("Tu perfil ya fue aprobado. No puedes modificarlo.");
        setSubiendo(false);
        return;
      }

      let fotoPerfilURL = '';

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'expertos');
        formData.append('folder', 'expertos-queesia');

        const res = await fetch('https://api.cloudinary.com/v1_1/dzr9rj9cu/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) throw new Error('Error al subir imagen');
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
        fotoPerfilURL,
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

      toast.success('Perfil enviado para validación.');

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
      {typeof window !== "undefined" && <QuesiaNavbar />}

      <Toaster position="top-right" />
      <div className="container-base bg-primary-soft px-4 py-12 font-sans">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-lg space-y-5"
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-4 text-sm text-blue-600 hover:underline flex items-center"
          >
            ← Regresar
          </button>

          <p className="text-sm text-center text-gray-700 mb-2">
            Primero valida tu correo para continuar.{' '}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="text-blue-600 underline hover:text-blue-800 font-medium"
            >
              Inicia sesión
            </button>{' '}
            con tu cuenta de Google.
          </p>

          <h1 className="text-3xl font-bold mb-6 text-center text-default font-montserrat">
            Registro de Expertos
          </h1>

          {[
            { name: 'nombre', placeholder: 'Nombre completo', type: 'text' },
            { name: 'especialidad', placeholder: 'Especialidad', type: 'text' },
            { name: 'experiencia', placeholder: 'Resumen de tu experiencia', type: 'textarea' },
            { name: 'educacion', placeholder: 'Educación (separada por comas)', type: 'textarea' },
            { name: 'certificaciones', placeholder: 'Certificaciones (separadas por comas)', type: 'text' },
            { name: 'linkedin', placeholder: 'LinkedIn o portafolio', type: 'url' },
            { name: 'telefono', placeholder: 'Teléfono', type: 'tel' },
            { name: 'email', placeholder: 'Correo electrónico', type: 'email' },
            { name: 'redes', placeholder: 'Redes sociales (opcional)', type: 'text' }
          ].map(({ name, placeholder, type }) =>
            type === 'textarea' ? (
              <textarea
                key={name}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="border border-default-soft p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
            ) : (
              <input
                key={name}
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                disabled={name === 'email'}
                className={`border border-default-soft p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                  name === 'email' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            )
          )}

          <label className="block font-medium text-sm text-default mb-1">
            Foto de perfil (solo imágenes .jpg, .jpeg, .png)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-default-soft p-3 w-full rounded-lg shadow-sm bg-white"
          />

          <div className="flex items-start my-4">
            <input
              type="checkbox"
              id="aceptoTerminos"
              checked={aceptoTerminos}
              onChange={(e) => setAceptoTerminos(e.target.checked)}
              className="mt-1 mr-2"
              required
            />
            <label htmlFor="aceptoTerminos" className="text-sm">
              He leído y acepto los{' '}
              <a href="/terminos" target="_blank" className="text-blue-600 underline">términos y condiciones</a>{' '}
              y el{' '}
              <a href="/privacidad" target="_blank" className="text-blue-600 underline">aviso de privacidad</a>.
            </label>
          </div>

          <button
            type="submit"
            disabled={subiendo || !aceptoTerminos}
            className={`w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-strong transition ${
              subiendo || !aceptoTerminos ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {subiendo ? 'Enviando...' : 'Registrar experto'}
          </button>
        </form>
      </div>
    </>
  );
}
