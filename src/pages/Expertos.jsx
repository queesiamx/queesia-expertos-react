// src/pages/Expertos.jsx
import ExpertList from '../components/ExpertList';
import QuesiaNavbar from "../components/QuesiaNavbar";

export default function Expertos() {
  return (
                <>
          <QuesiaNavbar />
    <div className="min-h-screen bg-primary-soft py-0 px-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-default"></h2>
      <ExpertList />
    </div>
        </>
  );
}
