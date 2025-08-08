// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Registro from './pages/Registro';
import { ROLES } from './constants/roles';
import Expertos from './pages/Expertos';
import AdminExpertos from './pages/AdminExpertos';
import ExpertDetailPublic from './components/ExpertDetailPublic';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';
import Login from "./pages/login";            // <- deja solo una ruta /login
// import LoginSolo from "./pages/LoginSolo"; // <- quítalo o dale otra ruta si lo necesitas
import LoginUsuarios from "./pages/LoginUsuarios";

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

import ProtectedRoute from "./auth/ProtectedRoute";
import MisConsultas from "./pages/MisConsultas";
import MisValoraciones from "./pages/MisValoraciones.jsx";

import MisContenidos from './pages/MisContenidos';
import VistaDetalleContenido from './pages/VistaDetalleContenido';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/expertos" element={<Expertos />} />
        <Route path="/expertos/:id" element={<ExpertDetailPublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-usuario" element={<LoginUsuarios />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />

        {/* Usuario */}
        <Route
          path="/mis-consultas"
          element={
            <ProtectedRoute roleRequired={ROLES.USUARIO}>
              <MisConsultas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-valoraciones"
          element={
            <ProtectedRoute roleRequired={ROLES.USUARIO}>
              <MisValoraciones />
            </ProtectedRoute>
          }
        />

        {/* Experto */}
        <Route
          path="/expert-dashboard"   // <- alineado con el menú
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultas-aprobadas"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <ConsultasAprobadas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historial-respuestas"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <ExpertHistorialR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultas-recibidas"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <ConsultasRecibidas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/responder-consulta/:id"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <ResponderConsulta />
            </ProtectedRoute>
          }
        />
        {/* (Opcional) contenidos del experto */}
        <Route
          path="/mis-contenidos"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <MisContenidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-contenidos/:id"
          element={
            <ProtectedRoute roleRequired={ROLES.EXPERTO}>
              <VistaDetalleContenido />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin-expertos"
          element={
            <ProtectedRoute roleRequired={ROLES.ADMIN}>
              <AdminExpertos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/consultas"
          element={
            <ProtectedRoute roleRequired={ROLES.ADMIN}>
              <AdminConsultas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/solicitudes"
          element={
            <ProtectedRoute roleRequired={ROLES.ADMIN}>
              <AdminSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/por-validar"
          element={
            <ProtectedRoute roleRequired={ROLES.ADMIN}>
              <AdminPorValidar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
