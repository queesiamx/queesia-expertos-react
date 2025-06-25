// src/components/AdminNavbar.jsx
import { NavLink } from 'react-router-dom';

export default function AdminNavbar({ onLogout }) {
  const linkStyle =
    'px-4 py-2 rounded hover:bg-primary/80 font-semibold transition text-default';
  const activeStyle = 'bg-white text-primary shadow';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center bg-primary-soft px-6 py-3">
      <div className="text-xl font-bold text-default">Quesia Admin</div>
      <div className="flex gap-4 items-center">
        <NavLink
          to="/admin/expertos"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : ''}`
          }
        >
          Expertos
        </NavLink>
        <NavLink
          to="/admin/consultas"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : ''}`
          }
        >
          Consultas
        </NavLink>
        <button
          onClick={onLogout}
          className="ml-4 px-4 py-2 bg-black text-white rounded hover:bg-default transition flex items-center gap-2"
        >
          Cerrar sesión <span role="img" aria-label="lock">🔒</span>
        </button>
      </div>
    </nav>
  );
}
