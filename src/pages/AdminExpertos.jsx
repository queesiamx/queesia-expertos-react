import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ExpertDetailAdmin from '../components/ExpertDetailAdmin';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

export default function AdminExpertos() {
  const [expertos, setExpertos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [autorizado, setAutorizado] = useState(false);
  const [verificado, setVerificado] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && adminEmails.includes(user.email)) {
        setAutorizado(true);
      } else {
        navigate('/');
      }
      setVerificado(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const cargarExpertos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'experts'));
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpertos(lista);
      } catch (e) {
        console.error('Error al cargar expertos:', e);
      } finally {
        setCargando(false);
      }
    };

    if (autorizado) {
      cargarExpertos();
    }
  }, [autorizado]);

  const handleActualizar = (expertoActualizado) => {
    setExpertos((prev) =>
      prev.map((exp) => (exp.id === expertoActualizado.id ? expertoActualizado : exp))
    );
    setSeleccionado(null);
  };

  const handleEliminar = (idEliminado) => {
    setExpertos((prev) => prev.filter((exp) => exp.id !== idEliminado));
    setSeleccionado(null);
  };

  if (!verificado) {
    return <p className="p-8">Verificando acceso...</p>;
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-soft px-6 py-10">
      <Toaster position="top-right" />

      <button
        onClick={async () => {
          try {
            await auth.signOut();
            navigate('/');
          } catch (error) {
            console.error("Error al cerrar sesión:", error);
          }
        }}
        className="mb-6 bg-black text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        🔒 Cerrar sesión y volver al inicio
      </button>

      <h1 className="text-3xl font-bold text-default mb-6">
        Panel de Administración de Expertos
      </h1>

      {cargando ? (
        <p>Cargando expertos...</p>
      ) : seleccionado ? (
        <ExpertDetailAdmin
          expert={seleccionado}
          onClose={() => setSeleccionado(null)}
          onUpdate={handleActualizar}
          onDelete={handleEliminar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expertos.map((exp) => (

        <div
          key={exp.id}
          className="p-4 bg-white rounded shadow hover:shadow-md cursor-pointer border"
          onClick={() => setSeleccionado(exp)}
        >
          <h3 className="text-lg font-semibold">{exp.nombre}</h3>
          <p className="text-sm text-gray-600">{exp.especialidad}</p>
          <p className={`mt-2 text-xs ${exp.aprobado ? 'text-green-600' : 'text-yellow-600'}`}>
            {exp.aprobado ? 'Aprobado' : 'Pendiente'}
          </p>
        </div>

          ))}
        </div>
      )}
    </div>
  );
}
