// src/components/LogoutButton.jsx
import { getAuth, signOut } from 'firebase/auth';

export default function LogoutButton() {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // ¡No navegues a ningún lado!
      // Si quisieras forzar un refresh, podrías hacer:
      // window.location.reload();
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-black text-white px-4 py-2 rounded-md hover:bg-default transition"
    >
      Cerrar sesión
    </button>
  );
}
