import { useNavigate } from "react-router-dom";

// ⭐ rating con estrellas ámbar
function Rating({ rating = 0, reviews = 0 }) {
  const stars = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5 text-sm leading-none">
  <div className="flex items-center">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        viewBox="0 0 24 24"
        className={`${i < stars ? "text-amber-400" : "text-slate-300"} w-4 h-4 block`}
        aria-hidden="true"
      >

            <path
              fill="currentColor"
              d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
            />
          </svg>
        ))}
      </div>
      <span className="text-slate-500 text-[13px] leading-none">
        {Number(rating || 0).toFixed(1)} ({reviews || 0} {reviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2.5 h-7 rounded-full text-xs inline-flex items-center justify-center leading-none border ${map[color]}`}>
      {children}
    </span>
  );
}

function formatMoney(n) {
  if (typeof n !== "number") return null;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}

export default function ExpertCard({ expert }) {
  const navigate = useNavigate();

  const nombre = expert?.nombre || "Experto/a";
  const titulo = expert?.especialidad || ""; // subtítulo bajo el nombre
  const avatar = expert?.fotoPerfilURL;
  const rating = expert?.calificacionPromedio || 0;
  const reviews = expert?.totalResenas || 0;
  const precio = expert?.precioHora; // número
  const descripcion = expert?.descripcionCorta || "";
  const verificado = Boolean(expert?.verificado || expert?.aprobado);
  const skills = Array.isArray(expert?.habilidades) ? expert.habilidades.slice(0, 3) : [];
  const tiposOfrecidos = Array.isArray(expert?.servicios)
    ? [...new Set(expert.servicios.map((s) => s.tipoContenido).filter(Boolean))].slice(0, 3)
    : [];
  const respuesta = expert?.tiempoRespuestaHoras; // ej. 2, 3, 24…

  return (
    <article className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* header compacto como el mock */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={nombre}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 ring-2 ring-white" />
            )}
            <div>
              <button
                onClick={() => navigate(`/expertos/${expert.id}`)}
                className="text-[15px] font-semibold text-slate-900 hover:text-blue-600"
              >
                {nombre}
              </button>
              {titulo && <div className="text-sm text-blue-700">{titulo}</div>}
            </div>
          </div>

        {verificado && (
          <Badge color="amber">VERIFICADO</Badge>
        )}
        </div>

        <div className="mt-2">
          <Rating rating={rating} reviews={reviews} />
        </div>

        {/* descripción */}
        {descripcion && (
          <p
            className="mt-2 text-sm text-slate-600"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {descripcion}
          </p>
        )}

        {/* chips: primero habilidades, si no hay, tipos de servicio */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(skills.length ? skills : tiposOfrecidos).map((t, i) => (
            <Badge key={t + i} color={i % 3 === 0 ? "green" : i % 3 === 1 ? "blue" : "amber"}>
              {t}
            </Badge>
          ))}
        </div>

        {/* fila: responde en Xh · precio */}
        <div className="mt-3 flex items-center justify-between">
  <div className="flex items-center gap-2 text-[13px] text-slate-600 leading-none">
    <svg viewBox="0 0 24 24" className="w-4 h-4 block" aria-hidden="true">

              <path
                fill="currentColor"
                d="M12 8v5h4v-2h-2V8h-2Zm0-6a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16A8 8 0 0 1 12 4Z"
              />
            </svg>
            {typeof respuesta === "number" ? (
              <>Responde en {respuesta}h</>
            ) : (
              <>Responde rápido</>
            )}
          </div>

          {typeof precio === "number" && (
            <div className="text-[15px] font-semibold text-emerald-600">
              Desde {formatMoney(precio)}
              <span className="text-[13px] text-slate-500">/h</span>
            </div>
          )}
        </div>

        {/* footer: botón azul + favorito */}
<div className="mt-4 flex items-center gap-3">
  <button
    onClick={() => navigate(`/expertos/${expert.id}`)}
    className="flex-1 h-10 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
  >
    Ver Perfil
  </button>

  <button
    type="button"
    aria-label="Guardar"
    className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:border-blue-300 leading-none"
  >
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 block text-slate-600 fill-current"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16.5,3c-1.74,0-3.41,0.81-4.5,2.09C10.91,3.81,9.24,3,7.5,3C4.42,3,2,5.42,2,8.5
           c0,3.78,3.4,6.86,8.55,11.54L12,21.35l1.45-1.32C18.6,15.36,22,12.28,22,8.5C22,5.42,19.58,3,16.5,3z"
      />
    </svg>
  </button>
</div>

      </div>
    </article>
  );
}
