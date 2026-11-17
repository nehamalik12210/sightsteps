import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getReportedExperienceOptions } from '../data/questions.js';
import VoiceNoteField from '../components/VoiceNoteField.jsx';
import {
  createVisionTimelineEntryId,
  formatVisionTimelineDate,
  getLocalDateInputValue,
  MAX_VISION_TIMELINE_ENTRIES,
  sortVisionTimelineEntries,
  TIMELINE_CONTEXT_MAX_LENGTH,
  TIMELINE_IMPACT_MAX_LENGTH,
  validateVisionTimelineDraft,
} from '../utils/visionTimeline.js';
import './VisionTimeline.css';

function localized(value, language) {
  if (value && typeof value === 'object') return value[language] || value.en || value.hi || '';
  return value || '';
}

function createEmptyDraft(defaultExperience) {
  return {
    date: getLocalDateInputValue(),
    time: '',
    experienceId: defaultExperience || 'other',
    customExperience: '',
    context: '',
    impact: '',
  };
}

function getValidationMessage(error, language) {
  const messages = {
    date: ['Choose a valid date.', 'कृपया सही तारीख चुनें।'],
    futureDate: ['The date cannot be in the future.', 'तारीख भविष्य की नहीं हो सकती।'],
    time: ['Enter a valid approximate time.', 'कृपया अनुमानित समय सही दर्ज करें।'],
    experience: ['Choose an experience or describe another one.', 'अनुभव चुनें या किसी अन्य अनुभव का वर्णन करें।'],
    contextTooLong: ['The activity context is too long.', 'गतिविधि का विवरण बहुत लंबा है।'],
    impactTooLong: ['The note is too long.', 'टिप्पणी बहुत लंबी है।'],
  };
  const pair = messages[error];
  return pair ? pair[language === 'hi' ? 1 : 0] : '';
}

const ACTIVITY_SUGGESTIONS = [
  { en: 'Reading & study', hi: 'पढ़ाई और अध्ययन' },
  { en: 'Screen work', hi: 'स्क्रीन पर काम' },
  { en: 'Fine-detail work & crafts', hi: 'बारीक काम और दस्तकारी' },
  { en: 'Driving & travel', hi: 'ड्राइविंग और यात्रा' },
  { en: 'Outdoor activities', hi: 'बाहरी गतिविधियाँ' },
];

export default function VisionTimeline() {
  const navigate = useNavigate();
  const {
    language,
    answers,
    visionTimelineEntries,
    setVisionTimelineEntries,
    storageAvailable,
    kioskMode,
  } = useApp();
  const lang = language || 'en';
  const concerns = useMemo(() => getReportedExperienceOptions(answers || {}), [answers]);
  const entries = useMemo(
    () => sortVisionTimelineEntries(visionTimelineEntries || []),
    [visionTimelineEntries],
  );
  const today = getLocalDateInputValue();

  const [draft, setDraft] = useState(() => createEmptyDraft(concerns[0] && concerns[0].value));
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const updateDraft = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setError('');
    setStatus('');
  };

  const resetDraft = () => {
    setDraft(createEmptyDraft(concerns[0] && concerns[0].value));
    setEditingId(null);
    setError('');
  };

  const handleEdit = (entry) => {
    const knownConcern = concerns.find((concern) => concern.value === entry.experienceId);
    setDraft({
      date: entry.date,
      time: entry.time || '',
      experienceId: knownConcern ? entry.experienceId : 'other',
      customExperience: knownConcern ? '' : localized(entry.experienceLabel, lang),
      context: entry.context || '',
      impact: entry.impact || '',
    });
    setEditingId(entry.id);
    setDeleteConfirmId(null);
    setError('');
    setStatus('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const concern = concerns.find((item) => item.value === draft.experienceId);
    const experienceLabel = concern
      ? concern.label
      : (draft.experienceId === 'other' ? draft.customExperience.trim() : '');
    const candidate = {
      date: draft.date,
      time: draft.time,
      experienceId: concern ? concern.value : (draft.experienceId === 'other' ? 'other' : ''),
      experienceLabel,
      context: draft.context,
      impact: draft.impact,
    };
    const validation = validateVisionTimelineDraft(candidate, { today });
    if (validation) {
      setError(getValidationMessage(validation, lang));
      setStatus('');
      return;
    }

    const existingEntry = editingId ? entries.find((entry) => entry.id === editingId) : null;
    const now = new Date().toISOString();
    const nextEntry = {
      id: existingEntry ? existingEntry.id : createVisionTimelineEntryId(),
      ...candidate,
      context: candidate.context.trim(),
      impact: candidate.impact.trim(),
      createdAt: existingEntry ? existingEntry.createdAt : now,
      updatedAt: now,
    };
    const nextEntries = existingEntry
      ? entries.map((entry) => entry.id === existingEntry.id ? nextEntry : entry)
      : entries.concat(nextEntry);

    setVisionTimelineEntries(sortVisionTimelineEntries(nextEntries));
    setDraft(createEmptyDraft(concerns[0] && concerns[0].value));
    setEditingId(null);
    setDeleteConfirmId(null);
    setError('');
    setStatus(existingEntry
      ? (lang === 'hi' ? 'टाइमलाइन एंट्री अपडेट की गई।' : 'Timeline entry updated.')
      : (lang === 'hi' ? 'टाइमलाइन एंट्री सहेजी गई।' : 'Timeline entry saved.'));
  };

  const requestDelete = (entryId) => {
    setDeleteConfirmId((current) => current === entryId ? null : entryId);
    setStatus('');
  };

  const confirmDelete = (entryId) => {
    setVisionTimelineEntries(entries.filter((entry) => entry.id !== entryId));
    if (editingId === entryId) resetDraft();
    setDeleteConfirmId(null);
    setStatus(lang === 'hi' ? 'टाइमलाइन एंट्री हटाई गई।' : 'Timeline entry deleted.');
  };

  const startNewEntry = () => {
    resetDraft();
    setDraft(createEmptyDraft(concerns[0] && concerns[0].value));
    setDeleteConfirmId(null);
  };

  return (
    <main className="vti" id="main-content" tabIndex="-1">
      <header className="vti__topbar">
        <button type="button" className="vti__back" onClick={() => navigate('/report')} aria-label={lang === 'hi' ? 'रिपोर्ट पर वापस जाएँ' : 'Back to report'}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
        </button>
        <h1>{lang === 'hi' ? 'मेरी दृष्टि टाइमलाइन' : 'My Vision Timeline'}</h1>
        <span aria-hidden="true" />
      </header>

      <section className="vti__body">
        <div className="vti__intro">
          <p className="vti__kicker">{lang === 'hi' ? 'आपके अनुभव, आपके शब्दों में' : 'YOUR EXPERIENCES, IN YOUR WORDS'}</p>
          <h2>{lang === 'hi' ? 'समय के साथ आपने क्या देखा?' : 'What have you noticed over time?'}</h2>
          <p>{lang === 'hi'
            ? 'अलग-अलग दिनों में आपने जो अनुभव देखे, उन्हें दर्ज करें। यह आपकी अपनी जानकारी है, कोई जाँच या चिकित्सकीय मूल्यांकन नहीं।'
            : 'Record experiences you have noticed on different days. These are your own notes, not a test or clinical assessment.'}</p>
        </div>

        {kioskMode && <p className="vti__notice" role="status">{lang === 'hi' ? 'साझा टैबलेट मोड: निष्क्रियता के बाद यह सेशन साफ़ हो जाएगा।' : 'Shared tablet mode: this session will be cleared after inactivity.'}</p>}
        {storageAvailable === false && <p className="vti__notice" role="status">{lang === 'hi' ? 'स्थानीय स्टोरेज उपलब्ध नहीं है। रीफ़्रेश करने पर ये नोट खो सकते हैं।' : 'Local storage is unavailable. These notes may be lost if you refresh.'}</p>}

        <form className="vti__editor" onSubmit={handleSubmit} aria-labelledby="vti-editor-heading">
          <div className="vti__editor-head">
            <div>
              <p className="vti__kicker">{editingId ? (lang === 'hi' ? 'एंट्री संपादित करें' : 'EDIT ENTRY') : (lang === 'hi' ? 'नई एंट्री' : 'NEW ENTRY')}</p>
              <h3 id="vti-editor-heading">{editingId ? (lang === 'hi' ? 'अपना रिकॉर्ड अपडेट करें' : 'Update your record') : (lang === 'hi' ? 'एक अनुभव दर्ज करें' : 'Record an experience')}</h3>
            </div>
            <span className="material-symbols-outlined" aria-hidden="true">edit_calendar</span>
          </div>

          <div className="vti__field-grid">
            <div className="vti__field">
              <label htmlFor="vti-date">{lang === 'hi' ? 'तारीख' : 'Date'} <span aria-hidden="true">*</span></label>
              <input id="vti-date" type="date" value={draft.date} max={today} required onChange={(event) => updateDraft('date', event.target.value)} />
            </div>
            <div className="vti__field">
              <label htmlFor="vti-time">{lang === 'hi' ? 'अनुमानित समय (वैकल्पिक)' : 'Approximate time (optional)'}</label>
              <input id="vti-time" type="time" value={draft.time} onChange={(event) => updateDraft('time', event.target.value)} />
            </div>
          </div>

          <div className="vti__field">
            <label htmlFor="vti-experience">{lang === 'hi' ? 'आपने क्या अनुभव देखा?' : 'What did you notice?'} <span aria-hidden="true">*</span></label>
            <select id="vti-experience" value={draft.experienceId} required onChange={(event) => updateDraft('experienceId', event.target.value)}>
              {concerns.map((concern) => (
                <option key={concern.value} value={concern.value}>{localized(concern.label, lang)}</option>
              ))}
              <option value="other">{lang === 'hi' ? 'अन्य अनुभव' : 'Another experience'}</option>
            </select>
            {draft.experienceId === 'other' && (
              <input
                className="vti__custom-experience"
                type="text"
                value={draft.customExperience}
                maxLength={120}
                required
                aria-label={lang === 'hi' ? 'अन्य अनुभव का वर्णन करें' : 'Describe the other experience'}
                placeholder={lang === 'hi' ? 'अपने अनुभव का संक्षिप्त वर्णन करें…' : 'Briefly describe what you noticed…'}
                onChange={(event) => updateDraft('customExperience', event.target.value)}
              />
            )}
          </div>

          <div className="vti__field">
            <label htmlFor="vti-context">{lang === 'hi' ? 'उस समय आप क्या कर रहे थे? (वैकल्पिक)' : 'What were you doing at the time? (optional)'}</label>
            <input
              id="vti-context"
              type="text"
              list="vti-activity-suggestions"
              value={draft.context}
              maxLength={TIMELINE_CONTEXT_MAX_LENGTH}
              placeholder={lang === 'hi' ? 'जैसे पढ़ना, स्क्रीन पर काम, बाहर रहना…' : 'e.g. reading, screen work, being outdoors…'}
              onChange={(event) => updateDraft('context', event.target.value)}
            />
            <datalist id="vti-activity-suggestions">
              {ACTIVITY_SUGGESTIONS.map((item) => <option key={item.en} value={item[lang] || item.en} />)}
            </datalist>
          </div>

          <div className="vti__field">
            <VoiceNoteField
              id="vti-impact"
              label={lang === 'hi' ? 'इसका गतिविधि पर क्या असर पड़ा? (वैकल्पिक)' : 'How did it affect the activity? (optional)'}
              value={draft.impact}
              onChange={(value) => updateDraft('impact', value)}
              placeholder={lang === 'hi' ? 'केवल वही लिखें जो आपने स्वयं अनुभव किया…' : 'Record only what you personally experienced…'}
              rows={3}
              maxLength={TIMELINE_IMPACT_MAX_LENGTH}
              language={lang}
            />
          </div>

          {error && <p className="vti__error" role="alert">{error}</p>}
          <div className="vti__form-actions">
            <button type="submit" className="btn btn--primary btn--lg" disabled={entries.length >= MAX_VISION_TIMELINE_ENTRIES && !editingId}>
              <span className="material-symbols-outlined" aria-hidden="true">{editingId ? 'save' : 'add'}</span>
              {editingId ? (lang === 'hi' ? 'बदलाव सहेजें' : 'Save changes') : (lang === 'hi' ? 'टाइमलाइन में जोड़ें' : 'Add to timeline')}
            </button>
            {editingId && <button type="button" className="btn btn--ghost" onClick={resetDraft}>{lang === 'hi' ? 'रद्द करें' : 'Cancel edit'}</button>}
            {!editingId && entries.length > 0 && <button type="button" className="btn btn--ghost" onClick={startNewEntry}>{lang === 'hi' ? 'नई एंट्री' : 'New entry'}</button>}
          </div>
          {entries.length >= MAX_VISION_TIMELINE_ENTRIES && !editingId && <p className="vti__limit" role="status">{lang === 'hi' ? 'अधिकतम ' + MAX_VISION_TIMELINE_ENTRIES + ' एंट्री सहेजी जा सकती हैं। नई एंट्री जोड़ने से पहले एक हटाएँ।' : 'You can save up to ' + MAX_VISION_TIMELINE_ENTRIES + ' entries. Delete one before adding another.'}</p>}
        </form>

        <section className="vti__history" aria-labelledby="vti-history-heading">
          <div className="vti__history-head">
            <div>
              <p className="vti__kicker">{lang === 'hi' ? 'आपके दर्ज किए गए अनुभव' : 'YOUR RECORDED EXPERIENCES'}</p>
              <h3 id="vti-history-heading">{lang === 'hi' ? 'टाइमलाइन' : 'Timeline'}</h3>
            </div>
            <span className="vti__count">{entries.length}/{MAX_VISION_TIMELINE_ENTRIES}</span>
          </div>

          {entries.length === 0 ? (
            <div className="vti__empty">
              <span className="material-symbols-outlined" aria-hidden="true">history</span>
              <p>{lang === 'hi' ? 'अभी कोई एंट्री नहीं है। जब चाहें, अपना पहला अनुभव दर्ज करें।' : 'No entries yet. Add your first experience whenever you are ready.'}</p>
            </div>
          ) : (
            <ol className="vti__entries">
              {entries.map((entry) => (
                <li key={entry.id} className="vti__entry">
                  <div className="vti__entry-meta">
                    <time dateTime={entry.date}>{formatVisionTimelineDate(entry.date, lang) + (entry.time ? ' · ' + entry.time : '')}</time>
                    <span className="vti__source">{lang === 'hi' ? 'आपके द्वारा दर्ज' : 'Participant-reported'}</span>
                  </div>
                  <h4>{localized(entry.experienceLabel, lang)}</h4>
                  {entry.context && <p><strong>{lang === 'hi' ? 'उस समय: ' : 'At the time: '}</strong>{entry.context}</p>}
                  {entry.impact && <p><strong>{lang === 'hi' ? 'आपका अनुभव: ' : 'Your note: '}</strong>{entry.impact}</p>}
                  <div className="vti__entry-actions">
                    {deleteConfirmId === entry.id ? (
                      <>
                        <span>{lang === 'hi' ? 'इस एंट्री को हटाएँ?' : 'Delete this entry?'}</span>
                        <button type="button" className="vti__delete-confirm" onClick={() => confirmDelete(entry.id)}>{lang === 'hi' ? 'हाँ, हटाएँ' : 'Yes, delete'}</button>
                        <button type="button" className="vti__cancel-delete" onClick={() => setDeleteConfirmId(null)}>{lang === 'hi' ? 'रद्द करें' : 'Cancel'}</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => handleEdit(entry)} aria-label={lang === 'hi' ? 'एंट्री संपादित करें' : 'Edit entry'}>{lang === 'hi' ? 'संपादित करें' : 'Edit'}</button>
                        <button type="button" onClick={() => requestDelete(entry.id)} aria-label={lang === 'hi' ? 'एंट्री हटाएँ' : 'Delete entry'}>{lang === 'hi' ? 'हटाएँ' : 'Delete'}</button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <p className="vti__privacy">{lang === 'hi'
          ? 'टाइमलाइन इसी डिवाइस के ब्राउज़र में स्थानीय रूप से सहेजी जाती है। डेटा एन्क्रिप्टेड नहीं है। संवेदनशील चिकित्सकीय जानकारी दर्ज न करें।'
          : 'The timeline is saved locally in this device’s browser. Data is not encrypted. Do not enter sensitive clinical information.'}</p>

        <button type="button" className="btn btn--secondary btn--full" onClick={() => navigate('/report')}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          {lang === 'hi' ? 'रिपोर्ट पर लौटें' : 'Return to conversation brief'}
        </button>
        {status && <p className="vti__status" role="status" aria-live="polite">{status}</p>}
      </section>
    </main>
  );
}
