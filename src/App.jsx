import { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Landing from './pages/Landing.jsx';
import KioskGuard from './components/KioskGuard.jsx';
import AccessibilityControls from './components/AccessibilityControls.jsx';
import OfflineStatus from './components/OfflineStatus.jsx';
import { useApp } from './context/AppContext.jsx';
import { t } from './data/i18n.js';
import { getNewSessionRedirect, getProtectedRouteRedirect } from './utils/sessionRouting.js';

const Onboarding = lazy(() => import('./pages/Onboarding.jsx'));
const ActivityProfile = lazy(() => import('./pages/ActivityProfile.jsx'));
const Intake = lazy(() => import('./pages/Intake.jsx'));
const VisionActivity = lazy(() => import('./pages/VisionActivity.jsx'));
const AmslerGrid = lazy(() => import('./pages/AmslerGrid.jsx'));
const Report = lazy(() => import('./pages/Report.jsx'));
const AppointmentFollowUp = lazy(() => import('./pages/AppointmentFollowUp.jsx'));
const VisionTimeline = lazy(() => import('./pages/VisionTimeline.jsx'));
const KioskSetup = lazy(() => import('./pages/KioskSetup.jsx'));

function RouteFocusManager() {
  const location = useLocation();
  const previousLocationKey = useRef(location.key);

  useEffect(() => {
    if (previousLocationKey.current === location.key) return undefined;
    previousLocationKey.current = location.key;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.key]);

  return null;
}

function RouteLoadingFallback() {
  const session = useApp();
  const language = session.language || 'en';

  return (
    <main className="app-main" id="main-content" tabIndex="-1" aria-live="polite">
      <p>{t('common.loading', language)}</p>
    </main>
  );
}

// Lazy routes mount after their code has arrived. Move keyboard focus again
// after that mount so the route focus manager does not leave focus on the
// temporary loading fallback.
function LazyPage({ component: Component }) {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return <Component />;
}

function NewSessionGuard({ children }) {
  const session = useApp();
  const location = useLocation();

  if (!session.isHydrated) {
    return <main className="app-main" id="main-content" tabIndex="-1" aria-live="polite"><p>{t('common.loading', session.language || 'en')}</p></main>;
  }

  // A shared-device cleanup failure must be resolved before a new participant
  // can enter onboarding, including through a manually opened URL.
  if (session.kioskCleanupFailed) return <Navigate to="/kiosk?clearError=1" replace />;

  // New-journey navigation is explicitly marked by Landing/KioskSetup after
  // reset has completed. This avoids confusing the newly-created session with
  // an old session that should not be overwritten by a direct /onboarding visit.
  const redirect = getNewSessionRedirect(session, location.state?.allowNewSession === true);
  return redirect ? <Navigate to={redirect} replace /> : children;
}

function RouteGuard({ children, requireProfile = false, requireIntake = false, requireVision = false }) {
  const session = useApp();
  if (!session.isHydrated) {
    return <main className="app-main" id="main-content" tabIndex="-1" aria-live="polite"><p>{t('common.loading', session.language || 'en')}</p></main>;
  }
  const redirect = getProtectedRouteRedirect(session, { requireProfile, requireIntake, requireVision });
  return redirect ? <Navigate to={redirect} replace /> : children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<NewSessionGuard><LazyPage component={Onboarding} /></NewSessionGuard>} />
        <Route path="/activities" element={<RouteGuard><LazyPage component={ActivityProfile} /></RouteGuard>} />
        <Route path="/intake" element={<RouteGuard requireProfile><LazyPage component={Intake} /></RouteGuard>} />
        <Route path="/vision" element={<RouteGuard requireProfile requireIntake><LazyPage component={VisionActivity} /></RouteGuard>} />
        <Route path="/amsler" element={<RouteGuard requireProfile requireIntake><LazyPage component={AmslerGrid} /></RouteGuard>} />
        <Route path="/report" element={<RouteGuard requireProfile requireIntake requireVision><LazyPage component={Report} /></RouteGuard>} />
        <Route path="/follow-up" element={<RouteGuard requireProfile requireIntake requireVision><LazyPage component={AppointmentFollowUp} /></RouteGuard>} />
        <Route path="/timeline" element={<RouteGuard requireProfile requireIntake requireVision><LazyPage component={VisionTimeline} /></RouteGuard>} />
        <Route path="/kiosk" element={<LazyPage component={KioskSetup} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="app">
        <AccessibilityControls />
        <OfflineStatus />
        <RouteFocusManager />
        <KioskGuard />
        <AppRoutes />
      </div>
    </AppProvider>
  );
}
