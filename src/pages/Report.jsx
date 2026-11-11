import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { evaluateAnswers } from '../engine/ruleEngine.js';
import './Report.css';

export default function Report() {
  const navigate = useNavigate();
  const { language, answers, visionResults, isDemo, setReport, report, reset } = useApp();
  const lang = language || 'en';
  const [expandedSeeWhy, setExpandedSeeWhy] = useState({});
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (Object.keys(answers).length === 0) { navigate('/'); return; }
    if (!report) { setReport(evaluateAnswers(answers)); }
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, [answers, report, setReport, navigate]);

  if (!report) return null;

  const { categories, totalScore, totalMax, recommendations, urgency } = report;
  const overallPct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const toggleSeeWhy = (id) => setExpandedSeeWhy(p => ({ ...p, [id]: !p[id] }));
  const handleNewAssessment = () => { reset(); navigate('/'); };

  const getLevel = (pct) => pct >= 60 ? 'high' : pct >= 30 ? 'medium' : 'low';

  const levelConfig = {
    low: { color: '#059669', bg: '#ECFDF5', label: lang === 'hi' ? 'कम जोखिम' : 'Low Concern' },
    medium: { color: '#D97706', bg: '#FFFBEB', label: lang === 'hi' ? 'मध्यम' : 'Moderate' },
    high: { color: '#DC2626', bg: '#FEF2F2', label: lang === 'hi' ? 'उच्च जोखिम' : 'High Concern' },
  };

  const urgencyConfig = {
    high: { color: '#DC2626', bg: '#FEF2F2', icon: 'error', label: lang === 'hi' ? 'जल्द सलाह लें' : 'Recommended Soon' },
    medium: { color: '#D97706', bg: '#FFFBEB', icon: 'warning', label: lang === 'hi' ? '6 महीने में' : 'Within 6 Months' },
    low: { color: '#059669', bg: '#ECFDF5', icon: 'check_circle', label: lang === 'hi' ? 'नियमित जाँच' : 'Routine Check-up' },
  };

  const categoryMeta = {
    refractive: { icon: 'visibility', en: 'Refractive Signs', hi: 'अपवर्तक संकेत', descEn: 'Blur, headaches, squinting', descHi: 'धुंधलापन, सिरदर्द' },
    lifestyle: { icon: 'self_improvement', en: 'Lifestyle Factors', hi: 'जीवनशैली कारक', descEn: 'Screen, outdoor, close work', descHi: 'स्क्रीन, बाहर, पास का काम' },
    awareness: { icon: 'health_and_safety', en: 'Eye Care Awareness', hi: 'नेत्र देखभाल जागरूकता', descEn: 'Exam history, correction, age', descHi: 'जाँच इतिहास, चश्मा, उम्र' },
  };

  const olc = levelConfig[getLevel(overallPct)];
  const uc = urgencyConfig[urgency.level];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overallPct / 100) * circumference;

  // Vision activity data
  const hasVisionData = visionResults?.completed && visionResults?.data;

  return (
    <div className="report">
      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner__icon material-symbols-outlined">target</span>
          {t('demo.banner', lang)}
        </div>
      )}

      <header className="app-header">
        <span className="app-header__back" />
        <span className="app-header__title">{t('report.title', lang)}</span>
        <span className="app-header__action" />
      </header>

      <div className="report__body">

        {/* ─── Overall Score ─── */}
        <div className={`report__hero ${animateIn ? 'report__hero--visible' : ''}`}>
          <div className="report__gauge">
            <svg viewBox="0 0 128 128" className="report__gauge-svg">
              <circle cx="64" cy="64" r={radius} className="report__gauge-track" />
              <circle cx="64" cy="64" r={radius} className="report__gauge-fill"
                style={{ strokeDasharray: circumference, strokeDashoffset: animateIn ? dashOffset : circumference, stroke: olc.color }} />
            </svg>
            <div className="report__gauge-center">
              <span className="report__gauge-number">{overallPct}</span>
              <span className="report__gauge-pct">%</span>
            </div>
          </div>
          <div className="report__gauge-meta">
            <span className="report__gauge-badge" style={{ background: olc.bg, color: olc.color }}>{olc.label}</span>
            <span className="report__gauge-sublabel">{totalScore} / {totalMax} {lang === 'hi' ? 'अंक' : 'points'}</span>
          </div>
        </div>

        {/* ─── Category Breakdown ─── */}
        <section className={`report__section ${animateIn ? 'animate-slide-up' : ''}`} style={{ animationDelay: '200ms' }}>
          <h3 className="report__section-title"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span> {lang === 'hi' ? 'श्रेणी विश्लेषण' : 'Category Breakdown'}</h3>
          <div className="report__categories">
            {Object.entries(categories).map(([key, cat]) => {
              const pct = cat.max > 0 ? Math.round((cat.score / cat.max) * 100) : 0;
              const lc = levelConfig[getLevel(pct)];
              const meta = categoryMeta[key];
              return (
                <div key={key} className="report__cat-card">
                  <div className="report__cat-top">
                    <div className="report__cat-icon-wrap" style={{ background: lc.bg }}><span className="material-symbols-outlined">{meta.icon}</span></div>
                    <div className="report__cat-info">
                      <span className="report__cat-name">{meta[lang] || meta.en}</span>
                      <span className="report__cat-desc">{lang === 'hi' ? meta.descHi : meta.descEn}</span>
                    </div>
                    <div className="report__cat-score">
                      <span className="report__cat-pct" style={{ color: lc.color }}>{pct}%</span>
                      <span className="report__cat-raw">{cat.score}/{cat.max}</span>
                    </div>
                  </div>
                  <div className="report__cat-bar">
                    <div className="report__cat-bar-fill" style={{ width: animateIn ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${lc.color}cc, ${lc.color})` }} />
                  </div>
                  <button className="report__see-why" onClick={() => toggleSeeWhy(key)}>
                    {expandedSeeWhy[key] ? '▾' : '▸'} {t('report.seeWhy', lang)} — {meta[lang] || meta.en}
                  </button>
                  {expandedSeeWhy[key] && (
                    <div className="report__signals">
                      {cat.signals.map((sig) => (
                        <div key={sig.id} className="report__signal">
                          <span className="report__signal-dot" style={{ background: sig.score > 0 ? lc.color : '#cbd5e1' }}>
                            {sig.score > 0 ? <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>warning</span> : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>}
                          </span>
                          <span className="report__signal-text">{sig.reason[lang] || sig.reason.en}</span>
                          {sig.score > 0 && <span className="report__signal-pts" style={{ color: lc.color }}>+{sig.score}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Vision Activity Results ─── */}
        {hasVisionData && (
          <section className={`report__section ${animateIn ? 'animate-slide-up' : ''}`} style={{ animationDelay: '300ms' }}>
            <h3 className="report__section-title"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>visibility</span> {lang === 'hi' ? 'दृष्टि गतिविधि' : 'Vision Activity'}</h3>
            <div className="report__vision-cards">
              {['left', 'right'].map((eye) => {
                const d = visionResults.data[eye];
                const pct = Math.round((d.correct / d.total) * 100);
                const c = pct >= 70 ? '#059669' : pct >= 40 ? '#D97706' : '#DC2626';
                return (
                  <div key={eye} className="report__vision-eye">
                    <span className="report__vision-eye-label">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span> {eye === 'left' ? (lang === 'hi' ? 'बाईं' : 'Left') : (lang === 'hi' ? 'दाईं' : 'Right')}
                    </span>
                    <span className="report__vision-eye-score" style={{ color: c }}>{d.correct}/{d.total}</span>
                    <div className="report__cat-bar">
                      <div className="report__cat-bar-fill" style={{ width: `${pct}%`, background: c }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="report__vision-note">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>medical_services</span> {lang === 'hi' ? 'यह चिकित्सा परीक्षण नहीं है — केवल जागरूकता के लिए' : 'Not a medical test — for awareness only'}
            </p>
          </section>
        )}

        {/* ─── Vision Skipped ─── */}
        {visionResults?.skipped && (
          <div className={`report__skipped ${animateIn ? 'animate-slide-up' : ''}`} style={{ animationDelay: '300ms' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility_off</span> {t('report.visionSkipped', lang)}
          </div>
        )}

        {/* ─── Urgency ─── */}
        <section className={`report__section ${animateIn ? 'animate-slide-up' : ''}`} style={{ animationDelay: '350ms' }}>
          <h3 className="report__section-title"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>local_hospital</span> {lang === 'hi' ? 'पेशेवर आँखों की जाँच' : 'Professional Eye Exam'}</h3>
          <div className="report__urgency" style={{ borderLeftColor: uc.color }}>
            <div className="report__urgency-header">
              <span className="report__urgency-badge" style={{ background: uc.bg, color: uc.color }}>
                {uc.icon === 'error' || uc.icon === 'warning' || uc.icon === 'check_circle'
                  ? <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{uc.icon}</span> {uc.label}</>
                  : <>{uc.icon} {uc.label}</>
                }
              </span>
            </div>
            <p className="report__urgency-reason">{urgency.reason[lang] || urgency.reason.en}</p>
          </div>
        </section>

        {/* ─── Recommendations ─── */}
        <section className={`report__section ${animateIn ? 'animate-slide-up' : ''}`} style={{ animationDelay: '450ms' }}>
          <h3 className="report__section-title"><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>diamond</span> {lang === 'hi' ? 'लेंस सुझाव' : 'Lens Recommendations'}</h3>
          <div className="report__recs">
            {recommendations.map((rec) => {
              const pColor = rec.priority === 'high' ? '#DC2626' : rec.priority === 'medium' ? '#D97706' : '#0066CC';
              const pBg = rec.priority === 'high' ? '#FEF2F2' : rec.priority === 'medium' ? '#FFFBEB' : '#EFF4FF';
              const pLabel = rec.priority === 'high' ? (lang === 'hi' ? 'उच्च' : 'High')
                : rec.priority === 'medium' ? (lang === 'hi' ? 'सुझावित' : 'Suggested')
                : (lang === 'hi' ? 'वैकल्पिक' : 'Optional');
              return (
                <div key={rec.id} className="report__rec">
                  <div className="report__rec-emoji"><span className="material-symbols-outlined">{rec.icon}</span></div>
                  <div className="report__rec-body">
                    <div className="report__rec-top">
                      <span className="report__rec-title">{rec.title[lang] || rec.title.en}</span>
                      <span className="report__rec-priority" style={{ color: pColor, background: pBg }}>{pLabel}</span>
                    </div>
                    <p className="report__rec-reason">{rec.reason[lang] || rec.reason.en}</p>
                    {rec.why && <p className="report__rec-why">{rec.why[lang] || rec.why.en}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Disclaimer + Actions ─── */}
        <div className="report__disclaimer"><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>medical_services</span> {t('landing.notMedical', lang)}</div>
        <div className="report__actions">
          <button className="btn btn--primary btn--full" onClick={handleNewAssessment}>
            <span className="material-symbols-outlined">refresh</span> {t('report.startNew', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
