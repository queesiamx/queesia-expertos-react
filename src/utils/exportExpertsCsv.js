 import { collection, getDocs, query, where } from "firebase/firestore";
 import { db } from "@/firebase";

 // Convierte un arreglo de objetos a CSV simple (UTF-8 con encabezados)
 function toCSV(rows) {
   if (!rows?.length) return "";
   const headers = Object.keys(rows[0]);
   const esc = (v) => {
     const s = v === null || v === undefined ? "" : String(v);
     if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
     return s;
   };
   const lines = [
     headers.join(","),
     ...rows.map((r) => headers.map((h) => esc(r[h])).join(",")),
   ];
   return lines.join("\n");
 }

 function downloadCSV(filename, text) {
   // Prepend BOM para que Excel maneje UTF-8 (acentos correctos)
   const BOM = "\uFEFF";
   const blob = new Blob([BOM + text], { type: "text/csv;charset=utf-8;" });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = filename;
   a.style.display = "none";
   document.body.appendChild(a);
   a.click();
   a.remove();
   URL.revokeObjectURL(url);
 }

 // === PoC principal: solo expertos aprobados ===
 export async function exportExpertosAprobadosCSV() {
   const q = query(collection(db, "experts"), where("aprobado", "==", true));
   const snap = await getDocs(q);

   const rows = snap.docs.map((d) => {
     const x = d.data() || {};
     return {
       experto_id: d.id,
       nombre: x.nombre || x.displayName || "",
       especialidad: x.especialidad || x.campo || "",
       verificado: x.verificado ? "Sí" : "No",
       email: x.email || "",
       creado: x.createdAt?.toDate
         ? x.createdAt.toDate().toLocaleString()
         : "",
     };
   });

   const csv = toCSV(rows);
   const ts = new Date().toISOString().replace(/[:.]/g, "-");
   downloadCSV(`queesia_expertos_aprobados_${ts}.csv`, csv);
 }

// =============== PASO 2: Servicios ofrecidos (título, descripción, precios) ===============

// Helper: carga expertos aprobados (id + data)
async function fetchExpertDocsAprobados() {
  const q = query(collection(db, "experts"), where("aprobado", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, data: d.data() || {} }));
}

// Helper: intenta leer servicios desde colección global; si no existe, devuelve []
async function tryGetServiciosGlobal() {
  try {
    const sSnap = await getDocs(collection(db, "servicios"));
    return sSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch {
    return [];
  }
}

// Normaliza precio/IVA y campos comunes
function normPrecio(raw) {
  const n = Number(
    raw?.precio ?? raw?.price ?? raw?.precioMXN ?? raw?.mxn ?? 0
 );
  return isFinite(n) ? n : 0;
}
function normIVA(raw) {
  const iv = Number(raw?.iva ?? raw?.ivaPorc ?? 0);
  return isFinite(iv) ? iv : 0;
}
function safeStr(...candidatos) {
  for (const c of candidatos) if (c) return String(c);
  return "";
}

export async function exportServiciosCSV() {
  const expertos = await fetchExpertDocsAprobados();
  const global = await tryGetServiciosGlobal(); // puede venir vacío

  const rows = [];

  for (const ex of expertos) {
    const exId = ex.id;
    const exNombre = safeStr(ex.data.nombre, ex.data.displayName, "—");

    // 1) Servicios desde colección global
    const glob = global.filter(s => s.expertoId === exId);

    // 2) Servicios embebidos en el doc del experto (array)
    const emb = Array.isArray(ex.data.servicios) ? ex.data.servicios : [];

    // Unimos ambas fuentes
    const servicios = [
      ...glob.map(s => ({ source: "global", ...s })),
      ...emb.map((s, i) => ({ source: "embedded", id: `${exId}_${i}`, ...s })),
    ];

    for (const s of servicios) {
      const titulo = safeStr(s.titulo, s.nombre, s.title);
      const descripcion = safeStr(s.descripcion, s.description, s.desc);
      const moneda = safeStr(s.moneda, s.currency, "MXN");
      const precio = normPrecio(s);
      const iva = normIVA(s);
      const gratuito = (precio === 0 || s.gratis === true) ? "Sí" : "No";
      const precio_con_iva =
        iva > 0 && precio > 0 ? (precio * (1 + iva / 100)).toFixed(2) : "";

      rows.push({
        service_id: safeStr(s.id, s.servicioId, s.serviceId),
        experto_id: exId,
        experto_nombre: exNombre,
        titulo,
        descripcion,
        moneda,
        precio,
        iva_porcentaje: iva,
        precio_con_iva,
        gratis: gratuito,
        modalidad: safeStr(s.modalidad, s.tipo, s.category), // "curso", "asesoría", ...
        publicado: s.publicado === true ? "Sí" : (s.aprobado === true ? "Sí" : "No"),
        destacado: s.destacado === true ? "Sí" : "No",
        cupo: s.cupo ?? "",
        link_temario: safeStr(s.temarioUrl, s.syllabusUrl, s.linkTemario),
        link_detalle: safeStr(s.url, s.permalink),
        creado: s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : "",
        actualizado: s.updatedAt?.toDate ? s.updatedAt.toDate().toLocaleString() : "",
        // Campos útiles para analítica futura (llenaremos en el paso de compras)
        ventas: "",       // se llenará cuando conectemos colección "compras"
        ingresos: "",     // idem
      });
    }
  }

  if (rows.length === 0) {
    const ts0 = new Date().toISOString().replace(/[:.]/g, "-");
    // Exporta encabezados vacíos para que verifiques estructura
    const csv = toCSV([{
      service_id: "", experto_id: "", experto_nombre: "", titulo: "",
      descripcion: "", moneda: "", precio: "", iva_porcentaje: "", precio_con_iva: "",
      gratis: "", modalidad: "", publicado: "", destacado: "", cupo: "",
      link_temario: "", link_detalle: "", creado: "", actualizado: "",
      ventas: "", ingresos: ""
    }]);
    downloadCSV(`queesia_servicios_vacio_${ts0}.csv`, csv);
    return;
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const csv = toCSV(rows);
  downloadCSV(`queesia_servicios_${ts}.csv`, csv);
}
