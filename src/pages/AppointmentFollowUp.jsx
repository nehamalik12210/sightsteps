import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import VoiceNoteField from '../components/VoiceNoteField.jsx';
import './AppointmentFollowUp.css';

export default function AppointmentFollowUp() {
  const navigate = useNavigate();
  const { language, appointmentFollowUp, setAppointmentFollowUp, storageAvailable, kioskMode } = useApp();
  const lang = language || 'en';
  const values = appointmentFollowUp || {};
  const update = (key, value) => setAppointmentFollowUp({ [key]: value });

  return (
    <main className="afu" id="main-content" tabIndex="-1">
      <header className="afu__topbar">
        <button type="button" className="afu__back" onClick={() => navigate('/report')} aria-label={lang === 'hi' ? 'रिपोर्ट पर वापस जाएँ' : 'Back to report'}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <h1>{lang === 'hi' ? 'अपॉइंटमेंट के बाद' : 'After my appointment'}</h1>
        <span />
      </header>
      <section className="afu__body">
        <p className="afu__intro">{lang === 'hi'
          ? 'अपनी अपॉइंटमेंट में हुई बातचीत और बताए गए अगले कदम अपने शब्दों में दर्ज करें। यह रिकॉर्ड स्वयं बताई गई जानकारी है।'
          : 'Record what was discussed at your appointment and any next steps you were given. This is your own account, not a clinical record.'}</p>
        {storageAvailable === false && <p className="afu__warning" role="status">{lang === 'hi' ? 'स्थानीय स्टोरेज उपलब्ध नहीं है; ये नोट रीफ़्रेश करने पर खो सकते हैं।' : 'Local storage is unavailable. These notes may be lost if you refresh.'}</p>}

        <div className="afu__field">
          <label htmlFor="afu-date">{lang === 'hi' ? 'अपॉइंटमेंट की तारीख' : 'Appointment date'}</label>
          <input id="afu-date" type="date" value={values.appointmentDate || ''} onChange={(event) => update('appointmentDate', event.target.value)} />
        </div>
        <div className="afu__field">
          <VoiceNoteField
            id="afu-professional-notes"
            label={lang === 'hi' ? 'पेशेवर ने क्या समझाया?' : 'What did the professional explain?'}
            value={values.professionalNotes || ''}
            onChange={(value) => update('professionalNotes', value)}
            placeholder={lang === 'hi' ? 'अपने शब्दों में मुख्य बातें लिखें…' : 'Record the main points in your own words…'}
            rows={5}
            maxLength={2000}
            language={lang}
          />
        </div>
        <div className="afu__field">
          <VoiceNoteField
            id="afu-plan"
            label={lang === 'hi' ? 'आपको कौन-से अगले कदम बताए गए?' : 'What follow-up or next steps were suggested?'}
            value={values.followUpPlan || ''}
            onChange={(value) => update('followUpPlan', value)}
            placeholder={lang === 'hi' ? 'केवल वही लिखें जो आपको बताया गया…' : 'Record only the steps you were told about…'}
            rows={4}
            maxLength={1500}
            language={lang}
          />
        </div>
        <div className="afu__field">
          <label htmlFor="afu-next-date">{lang === 'hi' ? 'अगली अपॉइंटमेंट की तारीख (वैकल्पिक)' : 'Next appointment date (optional)'}</label>
          <input id="afu-next-date" type="date" value={values.nextAppointmentDate || ''} onChange={(event) => update('nextAppointmentDate', event.target.value)} />
        </div>
        <p className="afu__privacy">{lang === 'hi'
          ? 'यह जानकारी इसी डिवाइस पर स्थानीय रूप से सहेजी जाती है, जब ब्राउज़र स्टोरेज उपलब्ध हो। SightSteps पेशेवर सलाह या चिकित्सा रिकॉर्ड तैयार नहीं करता।'
          : 'This information is stored locally on this device when browser storage is available. SightSteps does not generate professional advice or a medical record.'}</p>
        <button type="button" className="btn btn--primary btn--full btn--lg" onClick={() => navigate('/report')}>
          {lang === 'hi' ? 'रिपोर्ट पर लौटें' : 'Return to conversation brief'}
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
        {kioskMode && <p className="afu__kiosk-note">{lang === 'hi' ? 'यह साझा-डिवाइस सेशन पाँच मिनट की निष्क्रियता के बाद साफ़ होगा।' : 'This shared-device session clears after five minutes of inactivity.'}</p>}
      </section>
    </main>
  );
}
