// src/components/RutaAdminPrivada.jsx
import { Navigate } from 'react-router-dom';

const adminEmails = ['queesiamx@gmail.com', 'queesiamx.employee@gmail.com'];

export default function RutaAdminPrivada({ children, usuario }) {
  const autorizado = usuario && adminEmails.includes(usuario.email);

  if (!autorizado) {
    console.warn("Acceso denegado. Usuario no autorizado:", usuario?.email);
  }

  return autorizado ? children : <Navigate to="/" replace />;
}
