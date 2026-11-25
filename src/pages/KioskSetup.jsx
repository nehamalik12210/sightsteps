import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import './KioskSetup.css';

export default function KioskSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setKioskMode, language, isHydrated, sessionId, kioskMode, kioskCleanupFailed, reset, markKioskCleanupFailed } = useApp();
  const [startPending, setStartPending] = useState(false);
  const [clearError, setClearError] = useState(searchParams.get('clearError') === '1' || kioskCleanupFailed);
  const lang = language || 'en';
  const timedOut = searchParams.get('timeout') === '1';

  useEffect(() => {
    if (isHydrated && kioskCleanupFailed) setClearError(true);
  }, [isHydrated, kioskCleanupFailed]);

  useEffect(() => {
    if (startPending && isHydrated && !sessionId && kioskMode) {
      setStartPending(false);
      navigate('/onboarding', { replace: true, state: { allowNewSession: true } });
    }
  }, [startPending, isHydrated, sessionId, kioskMode, navigate]);

  const startKiosk = async () => {
    if (startPending) return;
    setClearError(false);
    setStartPending(true);
    const cleared = await reset();
    if (!cleared) {
      setStartPending(false);
      setClearError(true);
      markKioskCleanupFailed();
      return;
    }
    // Each kiosk participant chooses their own language; never inherit the
    // previous participant's preference on a shared device.
    setKioskMode(true);
  };

  return (
    <main className="kiosk-setup" id="main-content" tabIndex="-1">
      <div className="kiosk-setup__container animate-fade-in">
        <button className="btn btn--ghost kiosk-setup__back" type="button" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          {lang === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
        </button>
        <span className="kiosk-setup__icon material-symbols-outlined" aria-hidden="true">tablet_mac</span>
        <h1>{lang === 'hi' ? 'साझा टैबलेट मोड' : 'Shared tablet mode'}</h1>
        <p>{lang === 'hi'
          ? 'किसी ऑप्टिकल शॉप या साझा डिवाइस पर एक समय में एक व्यक्ति के लिए सेशन शुरू करें।'
          : 'Start a single participant session on a tablet or device shared in an optical shop.'}</p>
        {timedOut && !clearError && <p className="kiosk-setup__timeout" role="status">{lang === 'hi' ? 'निष्क्रियता के कारण पिछला सेशन साफ़ कर दिया गया।' : 'The previous kiosk session was cleared after inactivity.'}</p>}
        {clearError && <p className="kiosk-setup__warning" role="alert">{lang === 'hi' ? 'पिछला सेशन डेटा साफ़ नहीं हो सका। कोई नया प्रतिभागी शुरू करने से पहले फिर से प्रयास करें।' : 'The previous session data could not be cleared. Retry before starting another participant.'}</p>}
        <ul>
          <li>{lang === 'hi' ? '5 मिनट की निष्क्रियता के बाद सेशन डेटा साफ़ होगा।' : 'Session data is cleared after 5 minutes without interaction.'}</li>
          <li>{lang === 'hi' ? 'पेज रीफ़्रेश या दोबारा खोलने पर पिछला साझा-डिवाइस सेशन पुनर्स्थापित नहीं होगा।' : 'A shared-device session is not restored after a reload or reopening the app.'}</li>
          <li>{lang === 'hi' ? 'रिपोर्ट से “समाप्त करें और डेटा साफ़ करें” चुनकर पहले भी साफ़ कर सकते हैं।' : 'You can also clear it early using “Finish and clear kiosk session” on the report.'}</li>
        </ul>
        <p className="kiosk-setup__warning">{lang === 'hi' ? 'नया कियोस्क सेशन शुरू करने से इस ब्राउज़र में सहेजा गया मौजूदा SightSteps सेशन डेटा साफ़ हो जाएगा।' : 'Starting a new kiosk session clears any current saved SightSteps session data in this browser.'}</p>
        <p className="kiosk-setup__warning">{lang === 'hi'
          ? 'यह डिवाइस-सुरक्षा सुविधा है, पूर्ण सुरक्षा गारंटी नहीं। साझा डिवाइस पर ब्राउज़र बंद करें और डिवाइस की अपनी सुरक्षा प्रक्रिया अपनाएँ।'
          : 'This is a shared-device privacy aid, not a complete security guarantee. Follow the device owner’s normal device and browser security procedures.'}</p>
        <button type="button" className="btn btn--primary btn--full btn--lg" onClick={startKiosk} disabled={!isHydrated || startPending}>
          {lang === 'hi' ? 'कियोस्क सेशन शुरू करें' : 'Start kiosk session'}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}
