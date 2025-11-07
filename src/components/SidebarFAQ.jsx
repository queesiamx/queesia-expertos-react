// src/components/SidebarFAQ.jsx
export default function SidebarFAQ() {
  const faqs = [
    {
      q: "¿Cómo funciona la consulta?",
      a: "Escribes tu duda. El equipo de Queesia la valida y, si requiere una respuesta profesional extensa, te avisamos el costo antes de continuar."
    },
    {
      q: "Tiempos de respuesta",
      a: "Usualmente en < 24 h hábiles. Si el experto necesita más información, te lo pediremos por email."
    },
    {
      q: "Términos claves",
      a: "Consulta = pregunta puntual. Curso/Manual = contenido estructurado. Las sesiones se agendan tras el pago."
    }
  ];

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xl">
      <h3 className="text-base font-semibold">Mini FAQ</h3>
      <ul className="mt-3 space-y-3">
        {faqs.map((f, i) => (
          <li key={i}>
            <p className="text-sm font-medium text-slate-800">{f.q}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{f.a}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
