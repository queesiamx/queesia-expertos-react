import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Registro from './pages/Registro';
import Expertos from './pages/Expertos';
import AdminExpertos from './pages/AdminExpertos';
import ExpertDetailPublic from './components/ExpertDetailPublic';
import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<Registro />} />
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
      </Routes>
    </Router>
  );
}

export default App;
