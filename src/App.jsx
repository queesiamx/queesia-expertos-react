// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Registro from './pages/Registro';
import { ROLES } from './constants/roles';
import Expertos from './pages/Expertos';
import AdminExpertos from './pages/AdminExpertos';
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
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginSolo from "./pages/LoginSolo";
import LoginUsuarios from "./pages/LoginUsuarios";
import MisConsultas from "./pages/MisConsultas";
import MisContenidos from './pages/MisContenidos';
import VistaDetalleContenido from './pages/VistaDetalleContenido';
import { Toaster } from "react-hot-toast";

function App() {
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
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />
        <Route path="/consultas-recibidas" element={<ConsultasRecibidas />} />
        <Route path="/responder-consulta/:id" element={<ResponderConsulta />} />
        <Route path="/mis-contenidos" element={<MisContenidos />} />
        <Route path="/mis-contenidos/:id" element={<VistaDetalleContenido />} />
        <Route path="/login" element={<LoginSolo />} />
        <Route path="/login-usuario" element={<LoginUsuarios />} />

        {/* Rutas protegidas para expertos */}
        <Route
          path="/expert-dashboard"
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

        {/* Rutas protegidas para usuarios */}
        <Route
          path="/mis-consultas"
          element={
            <ProtectedRoute roleRequired={ROLES.USUARIO}>
              <MisConsultas />
            </ProtectedRoute>
          }
        />

        {/* Rutas protegidas para administradores */}
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
    </Router>
  );
}

export default App;
