import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Registro from './pages/Registro';
import Expertos from './pages/Expertos';
import AdminExpertos from './pages/AdminExpertos';
import RutaAdminPrivada from './components/RutaAdminPrivada';
import RutaExpertoPrivada from "./components/RutaExpertoPrivada";
import RutaUsuarioPrivada from "./components/RutaUsuarioPrivada";
import ExpertDetailPublic from './components/ExpertDetailPublic';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import Login from "./pages/login";
import ExpertDashboard from "./pages/ExpertDashboard";
import PagoExitoso from './pages/PagoExitoso';
import PagoCancelado from './pages/PagoCancelado';
import AdminConsultas from './pages/AdminConsultas';
import ConsultasRecibidas from "./pages/consultasRecibidas";
import ResponderConsulta from './pages/ResponderConsulta';
import AdminSolicitudes from './pages/AdminSolicitudes';
import ConsultasAprobadas from "./pages/ConsultasAprobadas";
import AdminPorValidar from './pages/AdminPorValidar';
import ExpertHistorialR from './pages/ExpertHistorialR';
import MisConsultas from "./pages/MisConsultas";
import MisContenidos from './pages/MisContenidos';
import VistaDetalleContenido from './pages/VistaDetalleContenido';
import Dashboard from './pages/Dashboard';
import { Toaster } from "react-hot-toast";

import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  if (cargando) return <p className="text-center p-6">Cargando...</p>;

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/expertos" element={<Expertos />} />
        <Route path="/expertos/:id" element={<ExpertDetailPublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ExpertDashboard />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />
        <Route path="/consultas-recibidas" element={<ConsultasRecibidas />} />
        <Route path="/responder-consulta/:id" element={<ResponderConsulta />} />
        <Route path="/mis-contenidos" element={<MisContenidos />} />
        <Route path="/mis-contenidos/:id" element={<VistaDetalleContenido />} />

        {/* Rutas protegidas para administradores */}
        <Route
          path="/admin-expertos"
          element={
            <RutaAdminPrivada usuario={usuario}>
              <AdminExpertos />
            </RutaAdminPrivada>
          }
        />
        <Route
          path="/admin/expertos"
          element={
            <RutaAdminPrivada usuario={usuario}>
              <AdminExpertos />
            </RutaAdminPrivada>
          }
        />
        <Route
          path="/admin/consultas"
          element={
            <RutaAdminPrivada usuario={usuario}>
              <AdminConsultas />
            </RutaAdminPrivada>
          }
        />
        <Route
          path="/admin/solicitudes"
          element={
            <RutaAdminPrivada usuario={usuario}>
              <AdminSolicitudes />
            </RutaAdminPrivada>
          }
        />
        <Route
          path="/consultas-aprobadas"
          element={
            <RutaExpertoPrivada usuario={usuario}>
              <ConsultasAprobadas />
            </RutaExpertoPrivada>
          }
        />

        <Route
          path="/mis-consultas"
          element={
            <RutaUsuarioPrivada>
              <MisConsultas />
            </RutaUsuarioPrivada>
          }
        />
        <Route
          path="/admin/por-validar"
          element={
            <RutaAdminPrivada usuario={usuario}>
              <AdminPorValidar />
            </RutaAdminPrivada>
          }
        />
        <Route
          path="/historial-respuestas"
          element={
            <RutaExpertoPrivada usuario={usuario}>
              <ExpertHistorialR />
            </RutaExpertoPrivada>
          }
        />


      </Routes>
    </Router>
  );
}

export default App;
