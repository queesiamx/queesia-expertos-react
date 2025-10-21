import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import UnifiedNavbar from "../components/UnifiedNavbar";


function KpiCard({ title, value }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 shadow text-center">
      <p className="text-md font-medium">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

export default function AdminKPIs() {
  const [data, setData] = useState({
    totalConsultas: 0,
    aprobadasConsultas: 0,
    pendientesConsultas: 0,
    totalPreguntas: 0,
    preguntasRespondidas: 0,
    preguntasPendientes: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const consultasSnap = await getDocs(collection(db, "consultasModeradas"));
      const preguntasSnap = await getDocs(collection(db, "preguntas"));

      let totalConsultas = 0,
        aprobadas = 0,
        pendientes = 0;
      consultasSnap.forEach((doc) => {
        totalConsultas++;
        const estado = doc.data().estado;
        if (estado === "pendiente") pendientes++;
        if (estado === "respondida" || estado === "resuelta") aprobadas++;
      });

      let totalPreguntas = 0,
        respondidas = 0,
        sinResponder = 0;
      preguntasSnap.forEach((doc) => {
        totalPreguntas++;
        if (doc.data().respondida) respondidas++;
        else sinResponder++;
      });

      setData({
        totalConsultas,
        aprobadasConsultas: aprobadas,
        pendientesConsultas: pendientes,
        totalPreguntas,
        preguntasRespondidas: respondidas,
        preguntasPendientes: sinResponder,
      });
    };

    fetchData();
  }, []);

  return (
    <>
      <UnifiedNavbar />


      <div className="p-4 max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">📊 Panel de KPIs</h2>

        <div className="grid grid-cols-2 gap-4">
          <KpiCard title="Consultas recibidas" value={data.totalConsultas} />
          <KpiCard title="Consultas aprobadas" value={data.aprobadasConsultas} />
          <KpiCard title="Consultas pendientes" value={data.pendientesConsultas} />
          <KpiCard title="Preguntas totales" value={data.totalPreguntas} />
          <KpiCard title="Preguntas respondidas" value={data.preguntasRespondidas} />
          <KpiCard title="Preguntas sin responder" value={data.preguntasPendientes} />
        </div>
      </div>
    </>
  );
}
