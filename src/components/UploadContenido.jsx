// src/components/UploadContenido.jsx
import { useState } from 'react';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { app } from '../firebase';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export default function UploadContenido({ expertoId, onCloseModal, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipoContenido, setTipoContenido] = useState('');
  const [precio, setPrecio] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const db = getFirestore(app);
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL; // sin /image/upload
  const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const tiposPermitidos = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "video/mp4"
    ];
    if (!tiposPermitidos.includes(f.type)) {
      toast.error('Solo se permite PDF, JPG/PNG o video MP4.');
      setFile(null);
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande (máx. 20MB).');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !titulo.trim() || !descripcion.trim() || !tipoContenido) {
      toast.error('Completa todos los campos obligatorios.');
      return;
    }

    if (precio && parseFloat(precio) < 0) {
      toast.error('El precio no puede ser negativo.');
      return;
    }

    setSubiendo(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryPreset);
    formData.append('folder', 'expertos-queesia');
    formData.append('resource_type', 'raw'); // ✅ ESTA LÍNEA ES CRUCIAL

    try {
      const endpoint = cloudinaryUrl;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Falla al subir archivo. Código: ${res.status}`);
      }

      const data = await res.json();
      if (!data.secure_url) {
        throw new Error(data.error?.message || 'No se obtuvo URL segura');
      }

      await addDoc(collection(db, 'contenidosExpertos'), {
        contenidoId: uuidv4(),
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipoContenido,
        precio: precio ? parseFloat(precio) : null,
        archivoUrl: data.secure_url,
        public_id: data.public_id,
        expertoId,
        fechaSubida: Timestamp.now(),
        usuariosAutorizados: [],
      });

      toast.success('Contenido subido correctamente');
      setFile(null);
      setTitulo('');
      setDescripcion('');
      setTipoContenido('');
      setPrecio('');

      if (onCloseModal) onCloseModal();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Error al subir:', err);
      toast.error(err.message || 'Error al subir archivo');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow max-w-lg mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Subir contenido</h2>

      <label className="block mb-2">Título</label>
      <input
        type="text"
        className="w-full border p-2 mb-4"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
        disabled={subiendo}
      />

      <label className="block mb-2">Descripción</label>
      <textarea
        className="w-full border p-2 mb-4"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        required
        disabled={subiendo}
      />

      <label className="block mb-2">Tipo de contenido</label>
      <select
        className="w-full border p-2 mb-4"
        value={tipoContenido}
        onChange={(e) => setTipoContenido(e.target.value)}
        required
        disabled={subiendo}
      >
        <option value="">Selecciona una opción</option>
        <option value="curso">Curso</option>
        <option value="manual">Manual</option>
        <option value="consulta">Consulta</option>
      </select>

      <label className="block mb-2">Precio (opcional)</label>
      <input
        type="number"
        className="w-full border p-2 mb-4"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        placeholder="Dejar vacío si es gratuito"
        disabled={subiendo}
      />

      <label className="block mb-2">Archivo</label>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.mp4"
        className="mb-4"
        onChange={handleFileChange}
        required
        disabled={subiendo}
      />
      <p className="text-xs text-gray-500 mb-4">
        Tamaño máximo: 20MB. Tipos permitidos: PDF, JPG, PNG, MP4.
      </p>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={subiendo}
      >
        {subiendo ? (
          <span>
            <svg className="animate-spin h-5 w-5 inline mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z" />
            </svg>
            Subiendo...
          </span>
        ) : (
          "Subir contenido"
        )}
      </button>
    </form>
  );
}
