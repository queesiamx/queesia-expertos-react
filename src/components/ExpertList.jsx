import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import ExpertCard from './ExpertCard';
import { useNavigate } from 'react-router-dom';

function ExpertList() {
  const [expertos, setExpertos] = useState([]);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // 🔄 Carga expertos y sus servicios desde Firestore
  useEffect(() => {
    const cargar = async () => {
      // Cargar expertos aprobados
      const expertosSnap = await getDocs(collection(db, 'experts'));
      const expertosAprobados = expertosSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(e => e.aprobado === true);

      // Cargar servicios desde contenidosExpertos
      const serviciosSnap = await getDocs(collection(db, 'contenidosExpertos'));
      const serviciosPorExperto = {};
      serviciosSnap.docs.forEach(doc => {
        const data = doc.data();
        const uid = data.expertoId;
        if (!serviciosPorExperto[uid]) serviciosPorExperto[uid] = [];
        serviciosPorExperto[uid].push(data);
      });

      // Combinar expertos con sus servicios
      const expertosConServicios = expertosAprobados.map(e => ({
        ...e,
        servicios: serviciosPorExperto[e.id] || [],
      }));

      setExpertos(expertosConServicios);
      setCargando(false);
    };
    cargar();
  }, []);

  const normalize = (val) =>
    typeof val === 'string' ? val.trim().toLowerCase() : '';

  // 🔍 Generar especialidades únicas
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

  // 🎯 Filtrado por especialidad y tipo de servicio
  const filtrados = expertos.filter((e) => {
    const coincideEspecialidad =
      !especialidadSeleccionada ||
      normalize(e.especialidad) === normalize(especialidadSeleccionada);

    const coincideServicio =
      !servicioSeleccionado ||
      (Array.isArray(e.servicios) &&
        e.servicios.some((s) =>
          normalize(s.tipoContenido) === normalize(servicioSeleccionado)
        ));

    return coincideEspecialidad && coincideServicio;
  });

  return (
    <div className="min-h-screen bg-primary-soft px-4 py-2 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-default font-montserrat">
          Expertos disponibles
        </h1>

        {/* 🎛 Filtros */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-4">
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

          <select
            value={servicioSeleccionado}
            onChange={(e) => setServicioSeleccionado(e.target.value)}
            className="border border-default-soft px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm w-full sm:w-1/2"
          >
            <option value="">Todos los servicios</option>
            <option value="curso">Curso</option>
            <option value="consulta">Consulta</option>
            <option value="manual">Manual / Capacitación</option>
          </select>

          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-strong transition"
          >
            ← Volver al inicio
          </button>
        </div>

        {/* 📦 Resultados */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {cargando ? (
            <p className="text-center text-default-soft col-span-full">
              Cargando expertos...
            </p>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-default-soft col-span-full">
              No se encontraron expertos con esos filtros.
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
