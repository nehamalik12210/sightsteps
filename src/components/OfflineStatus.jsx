import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import './OfflineStatus.css';

function readOnlineState() {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export default function OfflineStatus() {
  const { language } = useApp();
  const [isOnline, setIsOnline] = useState(readOnlineState);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(readOnlineState());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  const message = language === 'hi'
    ? 'डिवाइस नेटवर्क से जुड़ा नहीं दिख रहा। कैश की गई ऐप और स्थानीय डेटा उपलब्ध होने पर आप जारी रख सकते हैं। आवाज़ पहचान के लिए कनेक्शन की ज़रूरत हो सकती है।'
    : 'Your device reports no network connection. You can continue with the cached app and local data when available. Voice recognition may require a connection.';

  return (
    <div className="offline-status" role="status" aria-live="polite" aria-atomic="true">
      <span className="material-symbols-outlined" aria-hidden="true">cloud_off</span>
      <p>{message}</p>
    </div>
  );
}
