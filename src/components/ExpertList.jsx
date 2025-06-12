import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import ExpertCard from './ExpertCard';
import { useNavigate } from 'react-router-dom'; // 👈 Agregamos esto

function ExpertList() {
  const [expertos, setExpertos] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate(); // 👈 Hook para redireccionar

  useEffect(() => {
    const cargar = async () => {
      const snapshot = await getDocs(collection(db, 'experts'));
      const docs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((e) => e.aprobado === true);
      setExpertos(docs);
      setCargando(false);
    };
    cargar();
  }, []);

  const especialidadMap = new Map();
  expertos.forEach((e) => {
    const key = e.especialidad.trim().toLowerCase();
    if (!especialidadMap.has(key)) {
      especialidadMap.set(key, e.especialidad.trim());
    }
  });

  const especialidadesUnicas = Array.from(especialidadMap.values()).sort((a, b) =>
    a.localeCompare(b)
  );

  const filtrados = expertos
    .filter((e) =>
      especialidadSeleccionada
        ? e.especialidad.trim().toLowerCase() === especialidadSeleccionada.trim().toLowerCase()
        : true
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* ✅ Botón para volver al inicio */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/')}
          className="mb-4 bg-black text-white px-4 py-2 rounded hover:bg-neutral-800 transition"
        >
          ← Volver al inicio
        </button>
      </div>

      <div className="flex justify-start">
        <select
          value={especialidadSeleccionada}
          onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
          className="border px-3 py-2 w-full sm:w-1/2 rounded"
        >
          <option value="">Todas las especialidades</option>
          {especialidadesUnicas.map((esp) => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filtrados.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">
            No se encontraron expertos con esa especialidad.
          </p>
        ) : (
          filtrados.map((exp) => (
            <ExpertCard key={exp.id} expert={exp} />
          ))
        )}
      </div>
    </div>
  );
}

export default ExpertList;
