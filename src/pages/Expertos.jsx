// src/pages/Expertos.jsx
import ExpertList from '../components/ExpertList';
import UnifiedNavbar from "../components/UnifiedNavbar";


export default function Expertos() {
return (
<>
<UnifiedNavbar />
{/* Contenedor principal con fondo y colores del mock */}
<div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
<ExpertList />
</div>
</>
);
}