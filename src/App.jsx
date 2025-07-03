import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Registro from './pages/Registro';
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
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Dashboard from './pages/Dashboard';

const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

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
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/expertos" element={<Expertos />} />
        <Route path="/expertos/:id" element={<ExpertDetailPublic />} />
        <Route
          path="/admin-expertos"
          element={
            usuario && adminEmails.includes(usuario.email)
              ? <AdminExpertos />
              : <Navigate to="/" replace />
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ExpertDashboard />} />
        <Route path="/pago-exitoso" element={<PagoExitoso />} />
        <Route path="/pago-cancelado" element={<PagoCancelado />} />
        <Route path="/admin/expertos" element={<AdminExpertos />} />
        <Route path="/admin/consultas" element={<AdminConsultas />} />
        <Route path="/consultas-recibidas" element={<ConsultasRecibidas />} /> {/* ✅ NUEVA RUTA */}
        <Route path="/responder-consulta/:id" element={<ResponderConsulta />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
