import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase"; // ⚠️ ajusta la ruta si es necesario
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import UnifiedNavbar from "../components/UnifiedNavbar";

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setSavedMsg("");
      if (!u) {
        setLoadingUser(false);
        return;
      }
      // auth
      setDisplayName(u.displayName || "");
      setPhotoURL(u.photoURL || "");

      // firestore
      try {
        const snap = await getDoc(doc(db, "users", u.uid));
        const data = snap.exists() ? snap.data() : {};
        setPhone(data.phone || "");
      } catch (e) {
        console.error("Error leyendo perfil:", e);
      } finally {
        setLoadingUser(false);
      }
    });
    return () => unsub();
  }, []);

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

      // Actualiza Firestore
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

  return (
    <>
      <UnifiedNavbar title="Mi Perfil" />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Mi Perfil</h1>

        {loadingUser && <p>Cargando...</p>}
        {!loadingUser && !user && (
          <p className="text-gray-600">Inicia sesión para ver tu perfil.</p>
        )}

        {!loadingUser && user && (
          <form onSubmit={onSave} className="space-y-4 bg-white p-4 border rounded-md">
            <div className="flex items-center gap-4">
              <img
                src={photoURL || "/avatar-placeholder.png"}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
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
