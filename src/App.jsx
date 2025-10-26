// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Blog from "@/pages/Blog";
import Foro from "@/pages/Foro";
import AuthRedirectGate from "@/components/AuthRedirectGate";
import PostAuth from "@/pages/PostAuth";
import AuthBridge from "./pages/AuthBridge";
import Home from "./components/Home";
import Registro from "./pages/Registro";
import { ROLES } from "./constants/roles";
import Expertos from "./pages/Expertos";
import AdminExpertos from "./pages/AdminExpertos";
import ExpertDetailPublic from "./components/ExpertDetailPublic";
import Terminos from "./pages/Terminos";
import Privacidad from "./pages/Privacidad";
import Login from "./pages/Login";
import LoginSolo from "./pages/LoginSolo";
import LoginUsuarios from "./pages/LoginUsuarios";

import ExpertDashboard from "./pages/ExpertDashboard";
import PagoExitoso from "./pages/PagoExitoso";
import PagoCancelado from "./pages/PagoCancelado";

import AdminConsultas from "./pages/AdminConsultas";
import ConsultasRecibidas from "./pages/ConsultasRecibidas";
import ResponderConsulta from "./pages/ResponderConsulta";
import AdminSolicitudes from "./pages/AdminSolicitudes";
import ConsultasAprobadas from "./pages/ConsultasAprobadas";
import AdminPorValidar from "./pages/AdminPorValidar";
import ExpertHistorialR from "./pages/ExpertHistorialR";

import ProtectedRoute from "./auth/ProtectedRoute";
import MisConsultas from "./pages/MisConsultas";
import MisValoraciones from "./pages/MisValoraciones.jsx";
import MisCompras from "./pages/MisCompras.jsx";
import Perfil from "./pages/Perfil.jsx";
import MisContenidos from "./pages/MisContenidos";
import VistaDetalleContenido from "./pages/VistaDetalleContenido";

export default function App() {
  const ExpertsHomeWrapper = () => (
    <main className="experts-home">
      <Expertos />
    </main>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* AuthRedirectGate solo procesa el redirect, NO navega desde home */}
      <AuthRedirectGate>
        <Routes>
          {/* ============================================ */}
          {/* RUTAS PÚBLICAS (sin protección) */}
          {/* ============================================ */}
          
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/foro" element={<Foro />} />
          <Route path="/auth" element={<AuthBridge />} />
          <Route path="/post-auth" element={<PostAuth />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/expertos" element={<ExpertsHomeWrapper />} />
          <Route path="/expertos/:id" element={<ExpertDetailPublic />} />
          
          {/* Páginas de login */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-usuario" element={<LoginUsuarios />} />
          <Route path="/login-solo" element={<LoginSolo />} />
          
          {/* Páginas de pago */}
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/pago-cancelado" element={<PagoCancelado />} />

          {/* Alias para dashboard */}
          <Route path="/dashboard" element={<Navigate to="/expert-dashboard" replace />} />
          <Route path="/mis-servicios" element={<Navigate to="/expert-dashboard#servicios" replace />} />

          {/* ============================================ */}
          {/* RUTAS PROTEGIDAS - USUARIO */}
          {/* ============================================ */}
          
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
          <Route
            path="/mis-compras"
            element={
              <ProtectedRoute roleRequired={ROLES.USUARIO}>
                <MisCompras />
              </ProtectedRoute>
            }
          />

          {/* Perfil puede ser accesible para todos los roles */}
          <Route 
            path="/perfil" 
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } 
          />

          {/* ============================================ */}
          {/* RUTAS PROTEGIDAS - EXPERTO */}
          {/* ============================================ */}
          
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

          {/* ============================================ */}
          {/* RUTAS PROTEGIDAS - ADMIN */}
          {/* ============================================ */}
          
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

          {/* Catch-all: ruta no encontrada */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthRedirectGate>
    </div>
  );
}