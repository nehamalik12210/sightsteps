/**
 * SightSteps — One-page Clinician-Facing Brief
 *
 * A compact, printable summary designed for a clinician's two-minute scan.
 * Contains: disclaimer, inferred patterns, observation groups, Amsler results,
 * discussion prompts — all with source links and non-diagnostic framing.
 */

import { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import { evaluatePatterns } from '../engine/patternEngine.js';
import { evaluateClusters } from '../data/patternClusters.js';
import { analyzeSpatial, describeSpatial } from '../engine/amslerSpatial.js';
import { buildVisionExperienceProfile } from '../engine/visionExperienceProfile.js';
import VisionExperienceProfile from './VisionExperienceProfile.jsx';
import './ClinicianBrief.css';

function localized(value, lang) {
  if (value && typeof value === 'object') return value[lang] || value.en || '';
  return value ?? '';
}

const DISCLAIMER = {
  en: 'SightSteps is not a diagnostic tool. The observations, patterns and activity records below are participant-reported and are intended only to support a conversation with an eye-care professional.',
  hi: 'SightSteps एक निदान उपकरण नहीं है। नीचे दिए गए अवलोकन, पैटर्न और गतिविधि रिकॉर्ड प्रतिभागी द्वारा बताए गए हैं और केवल नेत्र देखभाल पेशेवर के साथ बातचीत को सहायता देने के लिए हैं।',
};

export default function ClinicianBrief({ onClose }) {
  const {
    language,
    answers,
    activities,
    primaryActivity,
    participantNote,
    amslerResults,
    visionTimelineEntries,
    isDemo,
    demoPersona,
  } = useApp();

  const lang = language || 'en';

  const report = useMemo(() => evaluateAnswers(answers, {
    activities,
    primaryActivity,
    participantNote,
    countableQuestionIds: isDemo ? demoPersona?.demoQuestionIds : undefined,
  }), [answers, activities, primaryActivity, participantNote, isDemo, demoPersona]);

  const experienceProfile = useMemo(
    () => buildVisionExperienceProfile(answers, visionTimelineEntries || []),
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
    <div className="clinician-brief">
      <div className="clinician-brief__screen-header">
        <button type="button" className="clinician-brief__close" onClick={onClose} aria-label={lang === 'hi' ? 'बंद करें' : 'Close'}>
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
        <h2>{lang === 'hi' ? 'क्लिनिशियन सारांश' : 'Clinician Brief'}</h2>
        <button type="button" className="btn btn--primary btn--sm" onClick={handlePrint}>
          <span className="material-symbols-outlined" aria-hidden="true">print</span>
          {lang === 'hi' ? 'प्रिंट करें' : 'Print'}
        </button>
      </div>

      <div className="clinician-brief__page" id="clinician-brief-print">
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

        {(experienceProfile.hasReportedExperience || experienceProfile.hasActivityImpact || experienceProfile.hasTimelineEntries) && (
          <VisionExperienceProfile
            profile={experienceProfile}
            answers={answers}
            language={lang}
          />
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
            {lang === 'hi' ? 'बताए गए अनुभव और पृष्ठभूमि' : 'Reported Experiences & Background'}
          </h2>
          {report.groups.map((group) => (
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
                  <span>{amslerResults.data.right?.cellCount || 0} {lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}</span>
                </div>
                <div className="clinician-brief__amsler-eye">
                  <strong>{lang === 'hi' ? 'बाईं आँख' : 'Left Eye'}</strong>
                  <span>{amslerResults.data.left?.cellCount || 0} {lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}</span>
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

        <footer className="clinician-brief__footer">
          <p>{DISCLAIMER[lang]}</p>
        </footer>
      </div>
    </div>
  );
}
