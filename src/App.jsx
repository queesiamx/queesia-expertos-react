// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// 🔰 Guard
import RoleGuard from "@/auth/context/guards/RoleGuard";

// 🔓 Públicas
import LoginPage from "@/pages/LoginPage";
import EsperaAprobacion from "@/pages/EsperaAprobacion";

// 📄 Páginas
import Blog from "@/pages/Blog";
import Foro from "@/pages/Foro";
import Home from "@/components/Home";
import Registro from "@/pages/Registro";
import Expertos from "@/pages/Expertos";
import AdminExpertos from "@/pages/AdminExpertos";
import ExpertDetailPublic from "@/components/ExpertDetailPublic";
import Terminos from "@/pages/Terminos";
import Privacidad from "@/pages/Privacidad";
import ExpertDashboard from "@/pages/ExpertDashboard";
import PagoExitoso from "@/pages/PagoExitoso";
import PagoCancelado from "@/pages/PagoCancelado";
import AdminConsultas from "@/pages/AdminConsultas";
import ConsultasRecibidas from "@/pages/ConsultasRecibidas";
import ResponderConsulta from "@/pages/ResponderConsulta";
import AdminSolicitudes from "@/pages/AdminSolicitudes";
import ConsultasAprobadas from "@/pages/ConsultasAprobadas";
import AdminPorValidar from "@/pages/AdminPorValidar";
import AdminNuevasApps from "@/pages/AdminNuevasApps";
import AdminCargarApp from "@/pages/AdminCargarApp";
import ExpertHistorialR from "@/pages/ExpertHistorialR";
import MisConsultas from "@/pages/MisConsultas";
import MisValoraciones from "@/pages/MisValoraciones.jsx";
import MisCompras from "@/pages/MisCompras.jsx";
import Perfil from "@/pages/Perfil.jsx";
import MisContenidos from "@/pages/MisContenidos";
import VistaDetalleContenido from "@/pages/VistaDetalleContenido";

// ✅ Mejor consistente:
import AdminMilestones from "@/pages/AdminMilestones"; // o "./pages/AdminMilestones"

export default function App() {
  const ExpertsHomeWrapper = () => (
    <main className="experts-home">
      <Expertos />
    </main>
  );

  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* ======= Públicas ======= */}
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/foro" element={<Foro />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/expertos" element={<Navigate to="/#expertos" replace />} />
        <Route path="/expertos/:id" element={<ExpertDetailPublic />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/espera-aprobacion" element={<EsperaAprobacion />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />

        {/* Alias histórico */}
        <Route path="/dashboard" element={<Navigate to="/expert-dashboard" replace />} />
        <Route
          path="/mis-servicios"
          element={<Navigate to="/expert-dashboard#servicios" replace />}
        />

        {/* ======= Protegidas ======= */}
        <Route element={<RoleGuard />}>
          {/* Usuario (si tu RoleGuard sin allow = cualquier logueado) */}
          <Route path="/mis-consultas" element={<MisConsultas />} />
          <Route path="/mis-valoraciones" element={<MisValoraciones />} />
          <Route path="/mis-compras" element={<MisCompras />} />
          <Route path="/perfil" element={<Perfil />} />

          {/* Experto */}
          <Route element={<RoleGuard allow="experto" />}>
            <Route path="/expert-dashboard" element={<ExpertDashboard />} />
            <Route path="/consultas-aprobadas" element={<ConsultasAprobadas />} />
            <Route path="/historial-respuestas" element={<ExpertHistorialR />} />
            <Route path="/consultas-recibidas" element={<ConsultasRecibidas />} />
            <Route path="/responder-consulta/:id" element={<ResponderConsulta />} />
            <Route path="/mis-contenidos" element={<MisContenidos />} />
            <Route path="/mis-contenidos/:id" element={<VistaDetalleContenido />} />
          </Route>

          {/* Admin */}
          <Route element={<RoleGuard allow="admin" />}>
            <Route path="/admin-expertos" element={<AdminExpertos />} />
            <Route path="/admin/consultas" element={<AdminConsultas />} />
            <Route path="/admin-milestones" element={<AdminMilestones />} />
            <Route path="/admin/solicitudes" element={<AdminSolicitudes />} />
            <Route path="/admin/por-validar" element={<AdminPorValidar />} />
            <Route path="/admin/apps-nuevas" element={<AdminNuevasApps />} />
            <Route path="/admin/apps/cargar" element={<AdminCargarApp />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
