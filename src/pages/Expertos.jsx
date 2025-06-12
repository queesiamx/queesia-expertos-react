// src/pages/Expertos.jsx
import ExpertList from '../components/ExpertList';

export default function Expertos() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-default">Expertos disponibles</h2>
      <ExpertList />
    </div>
  );
}
