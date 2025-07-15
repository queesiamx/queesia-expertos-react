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

  const [modalidad, setModalidad] = useState('en línea');
  const [plataforma, setPlataforma] = useState('');
  const [duracionHoras, setDuracionHoras] = useState('');
  const [cupoMaximo, setCupoMaximo] = useState('');
  const [requierePago, setRequierePago] = useState(false);
  const [instruccionesAcceso, setInstruccionesAcceso] = useState('');
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [nuevaFecha, setNuevaFecha] = useState('');

  const db = getFirestore(app);
  const cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL;
  const cloudinaryPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    const tiposPermitidos = ["application/pdf", "image/png", "image/jpeg", "video/mp4"];
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

  const agregarFecha = () => {
    if (nuevaFecha) {
      setFechasDisponibles([...fechasDisponibles, nuevaFecha]);
      setNuevaFecha('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!tipoContenido) {
      toast.error('Selecciona el tipo de contenido.');
      return;
    }

    if (tipoContenido !== 'consulta' && (!file || !titulo.trim() || !descripcion.trim())) {
      toast.error('Completa todos los campos obligatorios.');
      return;
    }

    if (precio && parseFloat(precio) < 0) {
      toast.error('El precio no puede ser negativo.');
      return;
    }

    setSubiendo(true);

    let archivoUrl = '';
    let public_id = '';

    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryPreset);
      formData.append('folder', 'expertos-queesia');
      formData.append('resource_type', 'raw');

      try {
        const res = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Falla al subir archivo. Código: ${res.status}`);
        const data = await res.json();
        if (!data.secure_url) throw new Error(data.error?.message || 'No se obtuvo URL segura');

        archivoUrl = data.secure_url;
        public_id = data.public_id;
      } catch (err) {
        console.error('Error al subir archivo:', err);
        toast.error(err.message || 'Error al subir archivo');
        setSubiendo(false);
        return;
      }
    }

    const contenidoData = {
      contenidoId: uuidv4(),
      titulo: tipoContenido === 'consulta' ? 'Consulta al experto' : titulo.trim(),
      descripcion: tipoContenido === 'consulta'
        ? 'Las consultas formuladas se validan primero de lado de los administradores, ya que puede estar sujeto a costos.'
        : descripcion.trim(),
      tipoContenido,
      precio: precio ? parseFloat(precio) : null,
      archivoUrl: archivoUrl || '',
      public_id: public_id || '',
      expertoId,
      fechaSubida: Timestamp.now(),
      usuariosAutorizados: [],
    };

    if (tipoContenido === 'curso' || tipoContenido === 'manual') {
      contenidoData.modalidad = modalidad;
      contenidoData.plataforma = plataforma;
      contenidoData.duracionHoras = parseInt(duracionHoras);
      contenidoData.cupoMaximo = parseInt(cupoMaximo);
      contenidoData.requierePago = requierePago;
      contenidoData.instruccionesAcceso = instruccionesAcceso;
      contenidoData.fechasDisponibles = fechasDisponibles;
      contenidoData.usuariosRegistrados = [];
      contenidoData.estatus = 'activo';
    }

    try {
      await addDoc(collection(db, 'contenidosExpertos'), contenidoData);
      toast.success('Contenido subido correctamente');
      setFile(null);
      setTitulo('');
      setDescripcion('');
      setTipoContenido('');
      setPrecio('');
      if (onCloseModal) onCloseModal();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error('Error al guardar en Firestore:', err);
      toast.error(err.message || 'Error al guardar contenido');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="bg-white p-6 rounded shadow max-w-lg mx-auto mt-6 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Subir contenido</h2>

      {/* TIPO DE CONTENIDO PRIMERO */}
      <label className="block mb-2">Tipo de contenido</label>
      <select className="w-full border p-2 mb-4" value={tipoContenido} onChange={(e) => setTipoContenido(e.target.value)} required disabled={subiendo}>
        <option value="">Selecciona una opción</option>
        <option value="curso">Curso</option>
        <option value="manual">Manual</option>
        <option value="consulta">Consulta</option>
      </select>

      {/* CAMPOS DINÁMICOS SEGÚN TIPO */}
      {tipoContenido === 'consulta' ? (
        <>
          <label className="block mb-2">Título</label>
          <input type="text" className="w-full border p-2 mb-4 bg-gray-100" value="Consulta al experto" disabled />

          <label className="block mb-2">Descripción</label>
          <textarea className="w-full border p-2 mb-4 bg-gray-100" value="Las consultas formuladas se validan primero de lado de los administradores, ya que puede estar sujeto a costos." disabled />
        </>
      ) : tipoContenido !== '' ? (
        <>
          <label className="block mb-2">Título</label>
          <input type="text" className="w-full border p-2 mb-4" value={titulo} onChange={(e) => setTitulo(e.target.value)} required disabled={subiendo} />

          <label className="block mb-2">Descripción</label>
          <textarea className="w-full border p-2 mb-4" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required disabled={subiendo} />
        </>
      ) : null}

      {(tipoContenido === 'curso' || tipoContenido === 'manual') && (
        <>
          <label className="block mb-2">Modalidad</label>
          <select className="w-full border p-2 mb-4" value={modalidad} onChange={(e) => setModalidad(e.target.value)}>
            <option value="en línea">En línea</option>
            <option value="presencial">Presencial</option>
          </select>

          <label className="block mb-2">Plataforma</label>
          <input className="w-full border p-2 mb-4" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} />

          <label className="block mb-2">Duración (horas)</label>
          <input type="number" className="w-full border p-2 mb-4" value={duracionHoras} onChange={(e) => setDuracionHoras(e.target.value)} />

          <label className="block mb-2">Cupo máximo</label>
          <input type="number" className="w-full border p-2 mb-4" value={cupoMaximo} onChange={(e) => setCupoMaximo(e.target.value)} />

          <label className="block mb-2">Requiere pago</label>
          <input type="checkbox" className="mb-4" checked={requierePago} onChange={(e) => setRequierePago(e.target.checked)} />

          {requierePago && (
            <>
              <label className="block mb-2">Precio (MXN)</label>
              <input type="number" className="w-full border p-2 mb-4" value={precio} onChange={(e) => setPrecio(e.target.value)} />
            </>
          )}

          <label className="block mb-2">Instrucciones de acceso</label>
          <textarea className="w-full border p-2 mb-4" value={instruccionesAcceso} onChange={(e) => setInstruccionesAcceso(e.target.value)} />

          <label className="block mb-2">Fechas disponibles</label>
          <div className="flex mb-2 gap-2">
            <input type="datetime-local" className="border p-2 w-full" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
            <button type="button" className="bg-gray-300 px-3 rounded" onClick={agregarFecha}>Agregar</button>
          </div>
          <ul className="text-sm text-gray-600 mb-4">
            {fechasDisponibles.map((f, i) => (
              <li key={i}>✅ {f}</li>
            ))}
          </ul>
        </>
      )}

      {tipoContenido !== '' && (
        <>
          <label className="block mb-2">Archivo</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.mp4" className="mb-4" onChange={handleFileChange} disabled={subiendo} />
          <p className="text-xs text-gray-500 mb-4">Tamaño máximo: 20MB. Tipos permitidos: PDF, JPG, PNG, MP4.</p>
        </>
      )}

      {tipoContenido && (
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={subiendo}>
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
      )}
    </form>
  );
}
