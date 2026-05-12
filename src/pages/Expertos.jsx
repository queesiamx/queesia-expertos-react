// src/pages/Expertos.jsx
//import ExpertList from '../components/ExpertList';
import UnifiedNavbar from "../components/UnifiedNavbar";
import ExpertsBrowser from "../components/ExpertsBrowser.jsx";
import Footer from "../components/Footer";

export default function Expertos() {
return (
<>
<UnifiedNavbar />
{/* Contenedor principal con fondo y colores del mock */}
<main className="text-slate-900 bg-transparent">
    <ExpertsBrowser variant="light" />
<Footer />
</main>
</>
);
}