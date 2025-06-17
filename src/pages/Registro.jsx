import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Toaster, toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';


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

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const obligatorios = ['nombre', 'especialidad', 'experiencia', 'email'];
    for (let campo of obligatorios) {
      if (!form[campo]) {
        toast.error(`Falta el campo: ${campo}`);
        return;
      }
    }

    if (!aceptoTerminos) {
      toast.error('Debes aceptar los términos y el aviso de privacidad.');
      return;
    }

    setSubiendo(true);
    try {
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
        creadoEn: serverTimestamp(),
      };

      await addDoc(collection(db, 'experts'), nuevoExperto);

      await emailjs.send(
        'service_6xnal3g',         // 👉 TU SERVICE ID (de EmailJS)
        'template_cbwns4s',        // 👉 TU TEMPLATE ID (plantilla auto-reply)
        {
          nombre: form.nombre,
          email: form.email
        },
        '9SxO0lF9IKHaknc4Q'       // 👉 TU PUBLIC KEY (de EmailJS)
      );

      toast.success('Tu solicitud ha sido enviada. Quesia validará tu perfil y nos pondremos en contacto contigo a la brevedad.');

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
      console.error('Error al registrar experto:', error);
      toast.error('Error al registrar. Intenta más tarde.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <>
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

          <h1 className="text-3xl font-bold mb-6 text-center text-default font-montserrat">Registro de Expertos</h1>

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
                className="border border-default-soft p-3 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
