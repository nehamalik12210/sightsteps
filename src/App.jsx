import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Landing from './pages/Landing.jsx';
import Onboarding from './pages/Onboarding.jsx';
import ActivityProfile from './pages/ActivityProfile.jsx';
import Intake from './pages/Intake.jsx';
import VisionActivity from './pages/VisionActivity.jsx';
import Report from './pages/Report.jsx';
import AppointmentFollowUp from './pages/AppointmentFollowUp.jsx';
import KioskSetup from './pages/KioskSetup.jsx';
import KioskGuard from './components/KioskGuard.jsx';
import { useApp } from './context/AppContext.jsx';
import { getNewSessionRedirect, getProtectedRouteRedirect } from './utils/sessionRouting.js';

function NewSessionGuard({ children }) {
  const session = useApp();
  const location = useLocation();

  if (!session.isHydrated) {
    return <main className="app-main" aria-live="polite"><p>Loading session…</p></main>;
  }

  // New-journey navigation is explicitly marked by Landing/KioskSetup after
  // reset has completed. This avoids confusing the newly-created session with
  // an old session that should not be overwritten by a direct /onboarding visit.
  const redirect = getNewSessionRedirect(session, location.state?.allowNewSession === true);
  return redirect ? <Navigate to={redirect} replace /> : children;
}

function RouteGuard({ children, requireProfile = false, requireIntake = false, requireVision = false }) {
  const session = useApp();
  if (!session.isHydrated) {
    return <main className="app-main" aria-live="polite"><p>Loading session…</p></main>;
  }
  const redirect = getProtectedRouteRedirect(session, { requireProfile, requireIntake, requireVision });
  return redirect ? <Navigate to={redirect} replace /> : children;
}

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <KioskGuard />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding" element={<NewSessionGuard><Onboarding /></NewSessionGuard>} />
          <Route path="/activities" element={<RouteGuard><ActivityProfile /></RouteGuard>} />
          <Route path="/intake" element={<RouteGuard requireProfile><Intake /></RouteGuard>} />
          <Route path="/vision" element={<RouteGuard requireProfile requireIntake><VisionActivity /></RouteGuard>} />
          <Route path="/report" element={<RouteGuard requireProfile requireIntake requireVision><Report /></RouteGuard>} />
          <Route path="/follow-up" element={<RouteGuard requireProfile requireIntake requireVision><AppointmentFollowUp /></RouteGuard>} />
          <Route path="/kiosk" element={<KioskSetup />} />
        </Routes>
      </div>
    </AppProvider>
  );
}
