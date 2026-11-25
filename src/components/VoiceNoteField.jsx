import { useEffect, useRef, useState } from 'react';
import './VoiceNoteField.css';

/**
 * Optional browser speech input. Browser speech recognition may use a remote
 * provider; the app does not claim that microphone audio remains on-device.
 */
export default function VoiceNoteField({
  id,
  value = '',
  onChange,
  placeholder = '',
  rows = 4,
  maxLength = 1200,
  language = 'en',
  label,
  className = '',
}) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(String(value || ''));
  const privacyId = `${id}-privacy`;
  const countId = `${id}-count`;
  const statusId = `${id}-status`;
  const supported = typeof window !== 'undefined'
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    valueRef.current = String(value || '');
  }, [value]);

  useEffect(() => () => {
    try { recognitionRef.current?.stop(); } catch { /* best-effort cleanup */ }
  }, []);

  const startListening = () => {
    if (!supported || listening) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let receivedResult = false;
    let recognitionError = false;
    try {
      recognition = new Recognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        setListening(true);
        setStatus(language === 'hi' ? 'सुन रहा है…' : 'Listening…');
      };
      recognition.onresult = (event) => {
        if (recognitionRef.current !== recognition) return;
        const transcript = Array.from(event.results || [])
          .map((result) => result?.[0]?.transcript || '')
          .join(' ')
          .trim();
        if (transcript) {
          receivedResult = true;
          // Use the latest text, not the value captured when recognition began.
          const next = [valueRef.current.trim(), transcript].filter(Boolean).join(' ');
          const limited = next.slice(0, maxLength);
          valueRef.current = limited;
          onChange(limited);
          setStatus(language === 'hi' ? 'आवाज़ का पाठ जोड़ दिया गया। भेजने से पहले इसे जाँचें।' : 'Voice text added. Review it before saving.');
        }
      };
      recognition.onerror = (event) => {
        if (recognitionRef.current !== recognition) return;
        recognitionError = true;
        const message = event?.error === 'not-allowed'
          ? (language === 'hi' ? 'माइक्रोफ़ोन अनुमति नहीं मिली।' : 'Microphone permission was not granted.')
          : (language === 'hi' ? 'आवाज़ पहचान उपलब्ध नहीं है। आप टाइप कर सकते हैं।' : 'Voice recognition is unavailable. You can type instead.');
        setStatus(message);
        setListening(false);
      };
      recognition.onend = () => {
        if (recognitionRef.current !== recognition) return;
        setListening(false);
        recognitionRef.current = null;
        if (!receivedResult && !recognitionError) {
          setStatus(language === 'hi'
            ? 'कोई आवाज़ दर्ज नहीं हुई। फिर से प्रयास करें या टाइप करें।'
            : 'No speech was captured. Try again or type your note.');
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      if (recognitionRef.current === recognition) recognitionRef.current = null;
      setListening(false);
      setStatus(language === 'hi' ? 'आवाज़ पहचान शुरू नहीं हो सकी।' : 'Could not start voice recognition.');
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch { /* no-op */ }
    setListening(false);
  };

  return (
    <div className={`voice-field ${className}`.trim()}>
      {label && <label className="voice-field__label" htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className="voice-field__input"
        value={value}
        onChange={(event) => {
          const next = event.target.value.slice(0, maxLength);
          valueRef.current = next;
          onChange(next);
          setStatus('');
        }}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-describedby={[countId, privacyId, status ? statusId : null].filter(Boolean).join(' ')}
      />
      <div className="voice-field__toolbar">
        {supported && (
          <button type="button" className="voice-field__button" onClick={listening ? stopListening : startListening} aria-pressed={listening} aria-controls={id}>
            <span className="material-symbols-outlined" aria-hidden="true">{listening ? 'stop_circle' : 'mic'}</span>
            {listening
              ? (language === 'hi' ? 'रोकें' : 'Stop voice input')
              : (language === 'hi' ? 'बोलकर लिखें' : 'Add by voice')}
          </button>
        )}
        <span id={countId} className="voice-field__count">{String(value || '').length}/{maxLength} {language === 'hi' ? 'अक्षर' : 'characters'}</span>
      </div>
      <p id={privacyId} className="voice-field__privacy">
        {language === 'hi'
          ? 'आवाज़ पहचान आपके ब्राउज़र या उसके चुने हुए सेवा प्रदाता द्वारा संसाधित हो सकती है। आप चाहें तो टाइप कर सकते हैं।'
          : 'Your browser or its configured speech provider may process audio for recognition. You can type instead.'}
      </p>
      {status && <p id={statusId} className="voice-field__status" role="status" aria-live="polite" aria-atomic="true">{status}</p>}
    </div>
  );
}
