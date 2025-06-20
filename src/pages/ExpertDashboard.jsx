// src/pages/ExpertDashboard.jsx
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // ← Agrega updateDoc aquí
import toast from "react-hot-toast";
import React, { useEffect, useState } from "react";
import NavbarExperto from "../components/NavbarExperto";
import ExpertProfileCard from "../components/ExpertProfileCard";
import ExpertProfileEditor from "../components/ExpertProfileEditor";


const ExpertDashboard = () => {
  const navigate = useNavigate();

  const [expert, setExpert] = useState(null);      // ← AÑADIR
  const [editMode, setEditMode] = useState(false); // ← AÑADIR

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'experts', user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("Debes completar tu registro.");
          navigate('/registro');
          return;
        }

        const data = snap.data();
        if (!data.aprobado || !data.formularioCompleto) {
          toast.error("Acceso denegado. Tu perfil aún no está aprobado.");
          navigate('/registro');
        }

        setExpert({ id: user.uid, ...data }); // ✅ Guardamos el perfil
      } else {
        toast.error("Debes iniciar sesión.");
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Sesión cerrada correctamente.");
      navigate("/");
    } catch (error) {
      toast.error("Error al cerrar sesión.");
      console.error(error);
    }
  };

  const handleSave = async (datosActualizados) => {
  try {
    const ref = doc(db, 'experts', expert.id);
    await updateDoc(ref, datosActualizados);
    toast.success("Perfil actualizado correctamente.");
    setExpert((prev) => ({ ...prev, ...datosActualizados }));
    setEditMode(false);
  } catch (error) {
    console.error("Error al guardar cambios:", error);
    toast.error("No se pudo guardar el perfil.");
  }
};

// ... (todo tu código anterior se mantiene igual)

  return (
    <>
<NavbarExperto />
<div className="p-6 max-w-4xl mx-auto font-sans">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-3xl font-bold">Panel de Experto</h1>
  </div>
  {!expert ? (
    <p className="text-gray-600">Cargando información...</p>
  ) : editMode ? (
    <ExpertProfileEditor
      expert={expert}
      onSave={handleSave}
      onCancel={() => setEditMode(false)}
    />
  ) : (
    <>
      <ExpertProfileCard expert={expert} />
      <button
        onClick={() => setEditMode(true)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        ✏️ Editar perfil
      </button>
    </>
  )}
</div>

    </>
  );
}; // 👈 Esta llave FALTABA

export default ExpertDashboard;
