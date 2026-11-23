import { getLocalSaveStatusCopy } from '../utils/saveStatus.js';
import './LocalSaveStatus.css';

export default function LocalSaveStatus({ status, language = 'en' }) {
  const copy = getLocalSaveStatusCopy(status, language);
  if (!copy) return null;

  return (
    <p
      className={`local-save-status local-save-status--${copy.tone}`}
      role="status"
      aria-live={status === 'saving' ? 'off' : 'polite'}
      aria-atomic="true"
    >
      <span className="material-symbols-outlined" aria-hidden="true">{copy.icon}</span>
      <span>{copy.text}</span>
    </p>
  );
}
