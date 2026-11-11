
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import './Report.css';

function localized(value, lang) {
  if (value && typeof value === 'object') {
    return value[lang] || value.en || '';
  }

  return value || '';
}

export default function Report() {
  const navigate = useNavigate();

  const {
    language,
    answers,
    visionResults,
    isDemo,
    reset,
  } = useApp();

  const lang = language || 'en';

  const [expandedGroups, setExpandedGroups] = useState({});
  const [animateIn, setAnimateIn] = useState(false);

  // Build the report directly from the actual questionnaire answers.
  // No clinical scores, risk categories or urgency labels are generated.
  const report = useMemo(
    () => evaluateAnswers(answers),
    [answers]
  );

  useEffect(() => {
    if (Object.keys(answers).length === 0) {
      navigate('/', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setAnimateIn(true);
    }, 80);

    return () => clearTimeout(timer);
  }, [answers, navigate]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((previous) => ({
      ...previous,
      [groupId]: !previous[groupId],
    }));
  };

  const handleNewAssessment = () => {
    reset();
    navigate('/', { replace: true });
  };

  const hasVisionData =
    visionResults?.completed === true &&
    visionResults?.data?.left &&
    visionResults?.data?.right;

  const hasFollowUpNotes = report.followUpNotes.length > 0;
  const hasDiscussionPoints = report.discussionPoints.length > 0;

  const groupCountLabel = lang === 'hi'
    ? `${report.answeredCount} जवाब शामिल`
    : `${report.answeredCount} responses included`;

  if (Object.keys(answers).length === 0) {
    return null;
  }

  return (
    <div className="report">
      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner__icon material-symbols-outlined">
            target
          </span>
          <span>{t('demo.banner', lang)}</span>
        </div>
      )}

      <header className="app-header">
        <button
          type="button"
          className="app-header__back"
          onClick={() => navigate('/')}
          aria-label={
            lang === 'hi'
              ? 'मुख्य पृष्ठ पर वापस जाएँ'
              : 'Back to home'
          }
        >
          <span className="material-symbols-outlined">
            arrow_back
          </span>
        </button>

        <span className="app-header__title">
          {lang === 'hi' ? 'आपकी जानकारी' : 'Your Insights'}
        </span>

        <span
          className="app-header__action"
          aria-hidden="true"
        />
      </header>

      <main className="report__body">

        {/* ─── Hero ─── */}

        <section
          className={`report__hero ${
            animateIn ? 'report__hero--visible' : ''
          }`}
        >
          <div className="report__hero-icon">
            <span className="material-symbols-outlined">
              assignment_turned_in
            </span>
          </div>

          <p className="report__eyebrow">
            {lang === 'hi'
              ? 'आपका सत्र पूरा हुआ'
              : 'ASSESSMENT SUMMARY'}
          </p>

          <h1 className="report__main-title">
            {lang === 'hi'
              ? 'आपकी दृष्टि संबंधी जानकारी'
              : 'Your Vision Insights'}
          </h1>

          <p className="report__hero-description">
            {lang === 'hi'
              ? 'आपके द्वारा दिए गए जवाबों का एक सरल सारांश। इसे ऑप्टिशियन या नेत्र देखभाल पेशेवर के साथ चर्चा के लिए उपयोग करें।'
              : 'A clear summary of the answers you shared. Use it as a conversation guide with an optician or eye-care professional.'}
          </p>

          <div className="report__response-count">
            <span className="material-symbols-outlined">
              checklist
            </span>

            {groupCountLabel}
          </div>
        </section>

        {/* ─── Important Notice ─── */}

        <section
          className="report__notice"
          aria-label={
            lang === 'hi'
              ? 'महत्वपूर्ण जानकारी'
              : 'Important information'
          }
        >
          <span className="material-symbols-outlined report__notice-icon">
            info
          </span>

          <div>
            <h2 className="report__notice-title">
              {lang === 'hi'
                ? 'यह रिपोर्ट क्या बताती है'
                : 'What this report means'}
            </h2>

            <p>
              {lang === 'hi'
                ? 'यह रिपोर्ट केवल आपके स्वयं बताए गए जवाबों को व्यवस्थित करती है। यह आँखों की जाँच, चिकित्सा निदान, दृष्टि की तीक्ष्णता का मापन या प्रिस्क्रिप्शन नहीं है।'
                : 'This report organises only the responses you provided. It is not an eye examination, medical diagnosis, visual acuity measurement or prescription.'}
            </p>
          </div>
        </section>

        {/* ─── Answer-based Insights ─── */}

        <section
          className={`report__section ${
            animateIn ? 'report__section--visible' : ''
          }`}
          aria-labelledby="report-insights-title"
        >
          <div className="report__section-heading">
            <div>
              <p className="report__section-kicker">
                {lang === 'hi' ? 'आपके जवाब' : 'YOUR RESPONSES'}
              </p>

              <h2
                id="report-insights-title"
                className="report__section-title"
              >
                {lang === 'hi'
                  ? 'आपने क्या साझा किया'
                  : 'What you shared'}
              </h2>
            </div>

            <span className="material-symbols-outlined report__section-icon">
              subject
            </span>
          </div>

          <div className="report__groups">
            {report.groups.map((group, index) => {
              const isExpanded = expandedGroups[group.id] ?? true;
              const panelId = `report-group-${group.id}`;

              return (
                <article
                  key={group.id}
                  className="report__group-card"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="report__group-header">
                    <div className="report__group-icon">
                      <span className="material-symbols-outlined">
                        {group.icon}
                      </span>
                    </div>

                    <div className="report__group-heading">
                      <h3 className="report__group-title">
                        {localized(group.title, lang)}
                      </h3>

                      <p className="report__group-description">
                        {localized(group.description, lang)}
                      </p>
                    </div>

                    <span className="report__group-count">
                      {group.observations.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="report__expand-button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                  >
                    <span>
                      {isExpanded
                        ? (lang === 'hi'
                          ? 'जवाब छिपाएँ'
                          : 'Hide responses')
                        : (lang === 'hi'
                          ? 'जवाब देखें'
                          : 'View responses')}
                    </span>

                    <span className="material-symbols-outlined">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  <div
                    id={panelId}
                    className="report__observations"
                    hidden={!isExpanded}
                  >
                    {group.observations.map((observation) => (
                      <div
                        key={observation.id}
                        className="report__observation"
                      >
                        <div className="report__observation-top">
                          <h4 className="report__observation-question">
                            {localized(observation.question, lang)}
                          </h4>

                          <span className="report__answer-chip">
                            {localized(observation.answer, lang)}
                          </span>
                        </div>

                        <p className="report__observation-detail">
                          {localized(observation.detail, lang)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ─── Optician Discussion Topics ─── */}

        <section
          className={`report__section ${
            animateIn ? 'report__section--visible' : ''
          }`}
          aria-labelledby="report-discussion-title"
        >
          <div className="report__section-heading">
            <div>
              <p className="report__section-kicker">
                {lang === 'hi' ? 'अगला कदम' : 'NEXT CONVERSATION'}
              </p>

              <h2
                id="report-discussion-title"
                className="report__section-title"
              >
                {lang === 'hi'
                  ? 'ऑप्टिशियन से चर्चा के विषय'
                  : 'Topics to discuss with an optician'}
              </h2>
            </div>

            <span className="material-symbols-outlined report__section-icon">
              forum
            </span>
          </div>

          <p className="report__section-intro">
            {lang === 'hi'
              ? 'ये विषय आपकी बताई गई आदतों और उपयोग के आधार पर बातचीत शुरू करने में मदद कर सकते हैं। ये लेंस के प्रिस्क्रिप्शन या व्यक्तिगत चिकित्सा सलाह नहीं हैं।'
              : 'These topics can help start a conversation based on the habits and activities you reported. They are not lens prescriptions or individual medical advice.'}
          </p>

          {hasDiscussionPoints ? (
            <div className="report__discussion-list">
              {report.discussionPoints.map((point) => (
                <article
                  className="report__discussion-card"
                  key={point.id}
                >
                  <div className="report__discussion-icon">
                    <span className="material-symbols-outlined">
                      {point.icon}
                    </span>
                  </div>

                  <div className="report__discussion-content">
                    <h3 className="report__discussion-title">
                      {localized(point.title, lang)}
                    </h3>

                    <p className="report__discussion-context">
                      {localized(point.context, lang)}
                    </p>

                    <div className="report__discussion-prompt">
                      <span className="material-symbols-outlined">
                        chat
                      </span>

                      <p>
                        {localized(point.prompt, lang)}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="report__empty-state">
              <span className="material-symbols-outlined">
                lightbulb
              </span>

              <p>
                {lang === 'hi'
                  ? 'आपके जवाबों से कोई विशेष लेंस चर्चा विषय नहीं निकला। ऑप्टिशियन आपकी जरूरतों के आधार पर सामान्य विकल्प समझा सकते हैं।'
                  : 'Your responses did not identify a specific lens discussion topic. An optician can explain general options based on your needs.'}
              </p>
            </div>
          )}
        </section>

        {/* ─── Professional Follow-up Notes ─── */}

        {hasFollowUpNotes && (
          <section
            className="report__section"
            aria-labelledby="report-followup-title"
          >
            <div className="report__section-heading">
              <div>
                <p className="report__section-kicker">
                  {lang === 'hi'
                    ? 'ध्यान देने योग्य बातें'
                    : 'POINTS TO SHARE'}
                </p>

                <h2
                  id="report-followup-title"
                  className="report__section-title"
                >
                  {lang === 'hi'
                    ? 'नेत्र देखभाल पेशेवर से चर्चा करें'
                    : 'Discuss with an eye-care professional'}
                </h2>
              </div>

              <span className="material-symbols-outlined report__section-icon">
                medical_services
              </span>
            </div>

            <div className="report__followup-list">
              {report.followUpNotes.map((note) => (
                <article
                  className="report__followup-card"
                  key={note.id}
                >
                  <h3>{localized(note.title, lang)}</h3>
                  <p>{localized(note.detail, lang)}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ─── Awareness Activity Results ─── */}

        {hasVisionData && (
          <section
            className="report__section"
            aria-labelledby="report-activity-title"
          >
            <div className="report__section-heading">
              <div>
                <p className="report__section-kicker">
                  {lang === 'hi'
                    ? 'वैकल्पिक गतिविधि'
                    : 'OPTIONAL ACTIVITY'}
                </p>

                <h2
                  id="report-activity-title"
                  className="report__section-title"
                >
                  {lang === 'hi'
                    ? 'दिशा पहचान गतिविधि'
                    : 'Direction activity responses'}
                </h2>
              </div>

              <span className="material-symbols-outlined report__section-icon">
                explore
              </span>
            </div>

            <div className="report__activity-results">
              {['left', 'right'].map((eye) => {
                const result = visionResults.data[eye];

                const correct = Number.isFinite(result?.correct)
                  ? result.correct
                  : 0;

                const total = Number.isFinite(result?.total)
                  ? result.total
                  : 0;

                return (
                  <div
                    key={eye}
                    className="report__activity-eye"
                  >
                    <span className="report__activity-eye-label">
                      <span className="material-symbols-outlined">
                        visibility
                      </span>

                      {eye === 'left'
                        ? (lang === 'hi' ? 'बाईं ओर' : 'Left side')
                        : (lang === 'hi' ? 'दाईं ओर' : 'Right side')}
                    </span>

                    <strong className="report__activity-count">
                      {correct} / {total}
                    </strong>

                    <span className="report__activity-caption">
                      {lang === 'hi'
                        ? 'सही दिशा पहचान'
                        : 'Correct direction selections'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="report__activity-disclaimer">
              <span className="material-symbols-outlined">
                info
              </span>

              <p>
                {lang === 'hi'
                  ? 'ये केवल गतिविधि के दौरान दिए गए जवाब हैं। इन्हें दृष्टि की तीक्ष्णता, आँखों की क्षमता या किसी चिकित्सा परिणाम के रूप में न समझें।'
                  : 'These are only responses recorded during the activity. They must not be interpreted as visual acuity, eye capability or a medical result.'}
              </p>
            </div>
          </section>
        )}

        {visionResults?.skipped && (
          <div className="report__skipped">
            <span className="material-symbols-outlined">
              visibility_off
            </span>

            <p>
              {lang === 'hi'
                ? 'आपने वैकल्पिक दिशा पहचान गतिविधि छोड़ दी।'
                : 'You skipped the optional direction awareness activity.'}
            </p>
          </div>
        )}

        {/* ─── Final Disclaimer ─── */}

        <section className="report__disclaimer">
          <span className="material-symbols-outlined">
            verified_user
          </span>

          <div>
            <h3>
              {lang === 'hi'
                ? 'महत्वपूर्ण सूचना'
                : 'Important reminder'}
            </h3>

            <p>
              {lang === 'hi'
                ? 'SightSteps एक जागरूकता और बातचीत में सहायता करने वाला टूल है। यह चिकित्सा निदान, पेशेवर आँखों की जाँच या निर्धारित प्रिस्क्रिप्शन का विकल्प नहीं है।'
                : 'SightSteps is an awareness and conversation-support tool. It does not replace a medical diagnosis, professional eye examination or prescribed vision correction.'}
            </p>
          </div>
        </section>

        {/* ─── Actions ─── */}

        <div className="report__actions">
          <button
            type="button"
            className="btn btn--primary btn--full"
            onClick={handleNewAssessment}
          >
            <span className="material-symbols-outlined">
              refresh
            </span>

            {t('report.startNew', lang)}
          </button>

          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => navigate('/')}
          >
            {lang === 'hi'
              ? 'मुख्य पृष्ठ पर जाएँ'
              : 'Back to home'}
          </button>
        </div>
      </main>
    </div>
  );
}
