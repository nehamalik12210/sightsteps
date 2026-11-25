/**
 * SightSteps — One-page Clinician-Facing Brief
 *
 * A compact, printable summary designed for a clinician's two-minute scan.
 * Contains: disclaimer, inferred patterns, observation groups, Amsler results,
 * discussion prompts — all with source links and non-diagnostic framing.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import { evaluatePatterns } from '../engine/patternEngine.js';
import { evaluateClusters } from '../data/patternClusters.js';
import { analyzeSpatial, describeSpatial, getFlaggedCellCount } from '../engine/amslerSpatial.js';
import { normalizeDirectionAwarenessResult } from '../utils/visionActivity.js';
import { buildVisionExperienceProfile } from '../engine/visionExperienceProfile.js';
import { buildVisionEvidencePathways } from '../engine/visionEvidencePathways.js';
import VisionExperienceProfile from './VisionExperienceProfile.jsx';
import VisionEvidencePathways from './VisionEvidencePathways.jsx';
import { formatVisionTimelineDate } from '../utils/visionTimeline.js';
import './ClinicianBrief.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

const DISCLAIMER = {
  en: 'Participant-reported information — not a diagnostic instrument.',
  hi: 'प्रतिभागी द्वारा बताई गई जानकारी — यह निदान उपकरण नहीं है।',
};

export default function ClinicianBrief({ onClose }) {
  const {
    language,
    answers,
    activities,
    primaryActivity,
    participantNote,
    amslerResults,
    visionResults,
    visionTimelineEntries,
    conversationReview,
    isDemo,
    demoPersona,
  } = useApp();

  const lang = language || 'en';
  const dialogRef = useRef(null);
  const closeHandlerRef = useRef(onClose);
  closeHandlerRef.current = onClose;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    document.body.classList.add('has-clinician-brief');
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const container = dialog.parentElement;
    const background = container
      ? Array.from(container.children).filter((element) => element !== dialog)
      : [];
    const previousBackgroundState = background.map((element) => ({
      element,
      inert: element.inert,
      ariaHidden: element.getAttribute('aria-hidden'),
    }));

    previousBackgroundState.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });

    dialog.querySelector('.clinician-brief__close')?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeHandlerRef.current?.();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(dialog.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => {
      document.removeEventListener('keydown', handleDialogKeyDown);
      document.body.classList.remove('has-clinician-brief');
      previousBackgroundState.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  const report = useMemo(() => evaluateAnswers(answers, {
    activities,
    primaryActivity,
    participantNote,
    countableQuestionIds: isDemo ? demoPersona?.demoQuestionIds : undefined,
  }), [answers, activities, primaryActivity, participantNote, isDemo, demoPersona]);

  const safeVisionResults = normalizeDirectionAwarenessResult(visionResults);

  const experienceProfile = useMemo(
    () => buildVisionExperienceProfile(answers, visionTimelineEntries || []),
    [answers, visionTimelineEntries],
  );
  const evidencePathways = useMemo(
    () => buildVisionEvidencePathways(answers, visionTimelineEntries || []),
    [answers, visionTimelineEntries],
  );

  const matchedPatterns = useMemo(() => evaluatePatterns(answers), [answers]);
  const matchedClusters = useMemo(
    () => evaluateClusters(matchedPatterns.map((p) => p.id)),
    [matchedPatterns]
  );

  const sourcesText = (sources = []) => sources
    .map((s) => `${localized(s.label, lang)}: ${localized(s.answer, lang)}`)
    .join(' · ');

  const dateStr = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="clinician-brief"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="clinician-brief-screen-title"
      tabIndex="-1"
    >
      <div className="clinician-brief__screen-header">
        <button type="button" className="clinician-brief__close" onClick={onClose} aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}>
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
        <h2 id="clinician-brief-screen-title">{lang === 'hi' ? 'क्लिनिशियन सारांश' : 'Clinician Brief'}</h2>
        <button type="button" className="btn btn--primary btn--sm" onClick={handlePrint}>
          <span className="material-symbols-outlined" aria-hidden="true">print</span>
          {lang === 'hi' ? 'प्रिंट करें' : 'Print'}
        </button>
      </div>

      <main className="clinician-brief__page" id="clinician-brief-print">
        <header className="clinician-brief__header">
          <div>
            <h1>SightSteps — {lang === 'hi' ? 'क्लिनिशियन सारांश' : 'Clinician Brief'}</h1>
            <p className="clinician-brief__date">{dateStr}</p>
          </div>
        </header>

        <div className="clinician-brief__disclaimer">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <p>{DISCLAIMER[lang]}</p>
        </div>

        {(experienceProfile.hasReportedExperience || experienceProfile.hasActivityImpact) && (
          <VisionExperienceProfile
            profile={experienceProfile}
            verbosity="brief"
            language={lang}
          />
        )}

        <VisionEvidencePathways pathways={evidencePathways} language={lang} compact />

        {(conversationReview?.confirmed || conversationReview?.correction) && (
          <section className="clinician-brief__section clinician-brief__participant-review">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
              {lang === 'hi' ? 'प्रतिभागी की समीक्षा' : 'Participant review'}
            </h2>
            <p>
              {conversationReview.confirmed
                ? (lang === 'hi' ? 'प्रतिभागी ने पुष्टि की कि सारांश उनकी बताई बात को दर्शाता है।' : 'The participant confirmed that the summary reflects what they wanted to share.')
                : (lang === 'hi' ? 'प्रतिभागी ने सारांश की पुष्टि नहीं की।' : 'The participant has not confirmed the summary.')}
            </p>
            {conversationReview.correction && (
              <blockquote>{conversationReview.correction}</blockquote>
            )}
          </section>
        )}

        {experienceProfile.timeline.entries.length > 0 && (
          <section className="clinician-brief__section clinician-brief__timeline">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">timeline</span>
              {lang === 'hi' ? 'हाल के प्रतिभागी टाइमलाइन रिकॉर्ड' : 'Recent Participant-Entered Timeline'}
            </h2>
            <ol>
              {experienceProfile.timeline.entries.slice(0, 3).map((entry) => (
                <li key={entry.id}>
                  <time dateTime={entry.date}>{formatVisionTimelineDate(entry.date, lang)}{entry.time ? ' · ' + entry.time : ''}</time>
                  <strong>{localized(entry.experienceLabel, lang)}</strong>
                  {[entry.context, entry.impact].filter(Boolean).length > 0 && (
                    <span>{[entry.context, entry.impact].filter(Boolean).join(' · ')}</span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {matchedPatterns.length > 0 && (
          <section className="clinician-brief__section">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">psychology</span>
              {lang === 'hi' ? 'चर्चा के लिए अनुमानित पैटर्न' : 'Inferred Patterns Worth Discussing'}
            </h2>
            {matchedClusters.length > 0 && (
              <div className="clinician-brief__clusters">
                {matchedClusters.map((cluster) => (
                  <div key={cluster.id} className="clinician-brief__cluster-card">
                    <strong>{localized(cluster.title, lang)}</strong>
                    <p>{localized(cluster.summary, lang)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="clinician-brief__patterns">
              {matchedPatterns.map((pattern) => (
                <div key={pattern.id} className="clinician-brief__pattern-card">
                  <div className="clinician-brief__pattern-head">
                    <span className="material-symbols-outlined" aria-hidden="true">{pattern.icon}</span>
                    <strong>{localized(pattern.title, lang)}</strong>
                  </div>
                  <p>{localized(pattern.description, lang)}</p>
                  <div className="clinician-brief__prompt-box">
                    <span className="material-symbols-outlined" aria-hidden="true">chat</span>
                    <p>{localized(pattern.discussionPrompt, lang)}</p>
                  </div>
                  <p className="clinician-brief__sources">
                    <strong>{lang === 'hi' ? 'इस पैटर्न से जुड़े आपके जवाब:' : 'Your responses contributing to this pattern:'}</strong> {sourcesText(pattern.sources)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="clinician-brief__section">
          <h2>
            <span className="material-symbols-outlined" aria-hidden="true">visibility</span>
            {lang === 'hi' ? 'आँखों की देखभाल की पृष्ठभूमि' : 'Eye-care Background'}
          </h2>
          {report.groups.filter((group) => group.id === 'eyeCare').map((group) => (
            <div key={group.id} className="clinician-brief__group">
              <h3>{localized(group.title, lang)}</h3>
              <table className="clinician-brief__table">
                <tbody>
                  {group.observations.map((obs) => (
                    <tr key={obs.id}>
                      <td className="clinician-brief__obs-q">{localized(obs.question, lang)}</td>
                      <td className="clinician-brief__obs-a">{localized(obs.answer, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        {amslerResults?.completed && amslerResults.data && (() => {
          const amslerFlagged = {
            right: amslerResults.data.right?.flaggedCells || [],
            left: amslerResults.data.left?.flaggedCells || [],
          };
          const spatial = analyzeSpatial(amslerFlagged);
          const spatialDesc = describeSpatial(spatial, lang);
          return (
            <section className="clinician-brief__section">
              <h2>
                <span className="material-symbols-outlined" aria-hidden="true">grid_on</span>
                {lang === 'hi' ? 'एम्सलर ग्रिड स्व-निगरानी गतिविधि का रिकॉर्ड' : 'Amsler Grid Self-Monitoring Activity Record'}
              </h2>
              <div className="clinician-brief__amsler">
                <div className="clinician-brief__amsler-eye">
                  <strong>{lang === 'hi' ? 'दाईं आँख' : 'Right Eye'}</strong>
                  <span>{getFlaggedCellCount(amslerResults.data.right)} {lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}</span>
                </div>
                <div className="clinician-brief__amsler-eye">
                  <strong>{lang === 'hi' ? 'बाईं आँख' : 'Left Eye'}</strong>
                  <span>{getFlaggedCellCount(amslerResults.data.left)} {lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}</span>
                </div>
              </div>
              {(spatial.right.count > 0 || spatial.left.count > 0) && (
                <div className="clinician-brief__spatial">
                  {spatialDesc.right.map((line, i) => <p key={`r${i}`}>{line}</p>)}
                  {spatialDesc.left.map((line, i) => <p key={`l${i}`}>{line}</p>)}
                  {spatialDesc.comparison.map((line, i) => <p key={`c${i}`} className="clinician-brief__spatial-highlight">{line}</p>)}
                </div>
              )}
              <p className="clinician-brief__amsler-note">
                {spatialDesc.disclaimer}
              </p>
            </section>
          );
        })()}

        {safeVisionResults && (
          <section className="clinician-brief__section">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">explore</span>
              {lang === 'hi' ? 'दिशा पहचान गतिविधि के जवाब' : 'Direction Awareness Activity Responses'}
            </h2>
            {safeVisionResults.skipped ? (
              <p>{lang === 'hi' ? 'प्रतिभागी ने यह वैकल्पिक गतिविधि छोड़ दी।' : 'The participant skipped this optional activity.'}</p>
            ) : (
              <div className="clinician-brief__amsler">
                <div className="clinician-brief__amsler-eye">
                  <strong>{lang === 'hi' ? 'राउंड 1' : 'Round 1'}</strong>
                  <span>{safeVisionResults.data.left.correct}/{safeVisionResults.data.left.total}</span>
                </div>
                <div className="clinician-brief__amsler-eye">
                  <strong>{lang === 'hi' ? 'राउंड 2' : 'Round 2'}</strong>
                  <span>{safeVisionResults.data.right.correct}/{safeVisionResults.data.right.total}</span>
                </div>
              </div>
            )}
            <p className="clinician-brief__amsler-note">
              {lang === 'hi'
                ? 'ये केवल गतिविधि के जवाबों की गिनती हैं; यह दृष्टि की तीक्ष्णता या दोनों आँखों के बीच अंतर का आकलन नहीं है।'
                : 'These are counts of responses in the activity only; they do not assess visual acuity or differences between your eyes.'}
            </p>
          </section>
        )}

        {report.discussionPoints.length > 0 && (
          <section className="clinician-brief__section">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">forum</span>
              {lang === 'hi' ? 'चर्चा के सुझाए गए विषय' : 'Suggested Discussion Topics'}
            </h2>
            <div className="clinician-brief__discuss-list">
              {report.discussionPoints.slice(0, 5).map((point) => (
                <div key={point.id} className="clinician-brief__discuss-item">
                  <strong>{localized(point.title, lang)}</strong>
                  <p>{localized(point.context, lang)}</p>
                  {point.sources?.length > 0 && (
                    <p className="clinician-brief__sources">
                      <strong>{lang === 'hi' ? 'संबंधित प्रतिभागी जवाब:' : 'Related participant responses:'}</strong> {sourcesText(point.sources)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {participantNote && (
          <section className="clinician-brief__section">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
              {lang === 'hi' ? 'प्रतिभागी की अतिरिक्त टिप्पणी' : 'Participant\'s Additional Note'}
            </h2>
            <blockquote className="clinician-brief__note">{participantNote}</blockquote>
          </section>
        )}

      </main>
    </div>
  );
