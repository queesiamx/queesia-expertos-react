import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import ExpertCard from './ExpertCard';
import { useNavigate } from 'react-router-dom';

function ExpertList() {
  const [expertos, setExpertos] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

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

  // 🛡️ Evitar trim() sobre valores no string
  const normalize = (val) =>
    typeof val === 'string' ? val.trim().toLowerCase() : '';

  const especialidadMap = new Map();
  expertos.forEach((e) => {
    const key = normalize(e.especialidad);
    if (key && !especialidadMap.has(key)) {
      especialidadMap.set(key, e.especialidad?.trim() || '');
    }
  });

  const especialidadesUnicas = Array.from(especialidadMap.values()).sort((a, b) =>
    a.localeCompare(b)
  );

  const filtrados = expertos.filter((e) => {
    if (!especialidadSeleccionada) return true;
    return normalize(e.especialidad) === normalize(especialidadSeleccionada);
  });

  return (
    <div className="min-h-screen bg-primary-soft px-4 py-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-default font-montserrat">
          Expertos disponibles
        </h1>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <select
            value={especialidadSeleccionada}
            onChange={(e) => setEspecialidadSeleccionada(e.target.value)}
            className="border border-default-soft px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-1/2"
          >
            <option value="">Todas las especialidades</option>
            {especialidadesUnicas.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>

          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-strong transition"
          >
            ← Volver al inicio
          </button>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filtrados.length === 0 ? (
            <p className="text-center text-default-soft col-span-full">
              No se encontraron expertos con esa especialidad.
            </p>
          ) : (
            filtrados.map((exp) => (
              <ExpertCard key={exp.id} expert={exp} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpertList;
