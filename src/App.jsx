import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Landing from './pages/Landing.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Intake from './pages/Intake.jsx';
import VisionActivity from './pages/VisionActivity.jsx';
import Report from './pages/Report.jsx';

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/vision" element={<VisionActivity />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

