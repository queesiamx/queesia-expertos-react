// src/pages/Perfil.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import UnifiedNavbar from "../components/UnifiedNavbar";
import { db } from "@/firebase";
import { useAuth } from "@/auth/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Perfil() {
  const { user, loading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Cargar datos iniciales desde Auth + Firestore cuando haya sesión
  useEffect(() => {
    let cancel = false;

    const load = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      try {
        if (cancel) return;
        setDisplayName(user.displayName || "");
        setPhotoURL(user.photoURL || "");

        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : {};
        if (cancel) return;
        setPhone(data.phone || "");
      } catch (e) {
        console.error("Error leyendo perfil:", e);
      } finally {
        if (!cancel) setLoadingProfile(false);
      }
    };

    load();
    return () => {
      cancel = true;
    };
  }, [user?.uid]); // se dispara cuando ya conocemos el uid

  // Guardar cambios
  const onSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSavedMsg("");
    try {
      // Actualiza Auth
      await updateProfile(user, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // Actualiza/crea users/{uid} (incluye email para reglas)
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email || "",
          displayName: displayName || "",
          photoURL: photoURL || "",
          phone: phone || "",
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSavedMsg("Perfil actualizado correctamente.");
    } catch (e) {
      console.error("Error guardando perfil:", e);
      setSavedMsg("Ocurrió un error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  // Guardias
  if (loading) return <p className="p-4">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <UnifiedNavbar title="Mi Perfil" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Mi Perfil</h1>

        {loadingProfile ? (
          <p>Cargando…</p>
        ) : (
          <form onSubmit={onSave} className="space-y-4 bg-white p-4 border rounded-md">
            <div className="flex items-center gap-4">
              <img
                src={photoURL || "/avatar-placeholder.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nombre a mostrar</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Foto (URL)</label>
              <input
                className="w-full border rounded-md px-3 py-2"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-gray-500 mt-1">
                (Si usas Cloudinary, pega aquí la URL segura del recurso).
              </p>
            </div>

            <button
              disabled={saving}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {savedMsg && <p className="text-sm mt-2">{savedMsg}</p>}
          </form>
        )}
      </main>
    </>
  );
}
