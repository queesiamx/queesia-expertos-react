import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  doc
} from "firebase/firestore";
import { Star } from "lucide-react";

// Props: expertId (string), usuario (firebase user, puede ser null), handleLoginConGoogle (function)
export default function ExpertRatingSection({ expertId, usuario, handleLoginConGoogle }) {
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null); // { rating, comment, id }
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Solo inicializa el comentario si es primera carga o cambia de usuario/expertId.
  useEffect(() => {
    if (!expertId) return;
    const fetchRatings = async () => {
      setLoading(true);
      const q = query(collection(db, "expertRatings"), where("expertId", "==", expertId));
      const snap = await getDocs(q);
      const allRatings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(allRatings);

      if (usuario) {
        const found = allRatings.find(r => r.userId === usuario.uid);
        setMyRating(found ? { ...found } : null);
        setRating(found?.rating || 0);
        // Solo inicializa el comentario si es primera vez, NO cada vez que califiques.
        setComment(found?.comment || "");
      } else {
        setMyRating(null);
        setRating(0);
        setComment("");
      }
      setLoading(false);
    };
    fetchRatings();
  }, [expertId, usuario]);

  // Calcular promedio y cantidad
  const avgRating = ratings.length
    ? (ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length).toFixed(1)
    : "-";
  const count = ratings.length;

  // Guardar/actualizar calificación
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario) return;
    if (rating < 1 || rating > 5) return alert("Selecciona de 1 a 5 estrellas.");
    setSaving(true);

    try {
      let ratingId = myRating && myRating.id;
      if (ratingId) {
        // Actualizar
        await updateDoc(doc(db, "expertRatings", ratingId), {
          rating,
          comment,
          timestamp: serverTimestamp()
        });
      } else {
        // Crear nueva
        const docRef = await addDoc(collection(db, "expertRatings"), {
          expertId,
          userId: usuario.uid,
          rating,
          comment,
          timestamp: serverTimestamp(),
          user: {
            name: usuario.displayName || "",
            email: usuario.email || "",
            photoURL: usuario.photoURL || ""
          }
        });
        ratingId = docRef.id;
      }
      // Actualiza en local el nuevo comentario sin recargar la página
      const q = query(collection(db, "expertRatings"), where("expertId", "==", expertId));
      const snap = await getDocs(q);
      const allRatings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(allRatings);
      const found = allRatings.find(r => r.userId === usuario.uid);
      setMyRating(found ? { ...found } : null);
      setRating(found?.rating || 0);
      setComment(""); // ¡AQUÍ se limpia el textarea tras guardar!
    } catch (err) {
      alert("Error al guardar calificación");
    }
    setSaving(false);
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
        <Star className="w-6 h-6 text-yellow-400" /> Califica a este experto
      </h2>
      <div className="flex items-center mb-1">
        <span className="text-2xl font-semibold mr-2">{avgRating}</span>
        <div className="flex">
          {[1,2,3,4,5].map(i =>
            <Star key={i}
              className={`w-6 h-6 ${avgRating >= i ? "text-yellow-400" : "text-gray-300"}`} fill={avgRating >= i ? "#facc15" : "none"} />
          )}
        </div>
        <span className="ml-3 text-sm text-gray-500">({count} voto{count === 1 ? "" : "s"})</span>
      </div>

      {/* Login requerido */}
      {!usuario ? (
        <div className="flex flex-col items-center my-4">
          <p className="mb-2 text-default-soft text-sm">
            Inicia sesión para poder calificar a este experto.
          </p>
          <button
            onClick={handleLoginConGoogle}
            className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
            type="button"
          >
            Iniciar con Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(i =>
              <button
                type="button"
                key={i}
                className={`p-1 ${rating >= i ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setRating(i)}
                aria-label={`Calificar con ${i} estrella${i > 1 ? "s" : ""}`}
                disabled={saving}
              >
                <Star className="w-7 h-7" fill={rating >= i ? "#facc15" : "none"} />
              </button>
            )}
          </div>
          <textarea
            className="w-full border rounded p-2 mb-2"
            rows={2}
            placeholder="(Opcional) ¿Qué opinas de este experto?"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={saving}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded font-semibold"
            type="submit"
            disabled={saving}
          >
            {myRating ? "Actualizar calificación" : "Enviar calificación"}
          </button>
        </form>
      )}

      {loading && <div className="text-gray-500 mt-3">Cargando calificaciones...</div>}

      {/* Mostrar comentarios como en Quesia Apps */}
      {!loading && ratings.length > 0 && (
        <div className="mt-6 space-y-4">
          {ratings.map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 p-4 rounded-xl border flex flex-col gap-2 shadow-sm"
            >
              <div className="flex items-center gap-2">
                {r.user?.photoURL ? (
                  <img
                    src={r.user.photoURL}
                    alt={r.user.name}
                    className="w-8 h-8 rounded-full border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                    {r.user?.name ? r.user.name[0].toUpperCase() : "?"}
                  </div>
                )}
                <span className="font-semibold">{r.user?.name || "Usuario anónimo"}</span>
                <div className="flex ml-2">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${r.rating >= i ? "text-yellow-400" : "text-gray-300"}`} fill={r.rating >= i ? "#facc15" : "none"} />
                  ))}
                </div>
              </div>
              <div className="text-gray-700">{r.comment}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
