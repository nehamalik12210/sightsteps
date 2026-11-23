import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { t } from '../data/i18n.js';
import { analyzeSpatial, describeSpatial } from '../engine/amslerSpatial.js';
import './AmslerGrid.css';

const GRID_SIZE = 20;
const GRID_PHYSICAL_CM = 10;

function AmslerGrid() {
  const navigate = useNavigate();
  const { language, setAmslerResults, amslerResults } = useApp();
  const lang = language || 'en';

  const [phase, setPhase] = useState('intro');
  const [calibrationPxPerMm, setCalibrationPxPerMm] = useState(null);
  const [currentEye, setCurrentEye] = useState('right');
  const [flaggedCells, setFlaggedCells] = useState({ right: [], left: [] });
  const [reportPending, setReportPending] = useState(false);
  const [kbRow, setKbRow] = useState('');
  const [kbCol, setKbCol] = useState('');
  const sliderRef = useRef(null);

  // Credit card width = 85.6mm
  const CARD_WIDTH_MM = 85.6;
  const [sliderWidthPx, setSliderWidthPx] = useState(300);

  // Spatial analysis — must be before any conditional returns to satisfy Rules of Hooks
  const spatial = useMemo(() => analyzeSpatial(flaggedCells), [flaggedCells]);
  const spatialText = useMemo(() => describeSpatial(spatial, lang), [spatial, lang]);

  useEffect(() => {
    if (reportPending && amslerResults) {
      navigate('/vision', { replace: true });
    }
  }, [reportPending, amslerResults, navigate]);

  const handleCalibrate = () => {
    const pxPerMm = sliderWidthPx / CARD_WIDTH_MM;
    setCalibrationPxPerMm(pxPerMm);
    setPhase('instructions');
  };

  const startTest = () => {
    setCurrentEye('right');
    setFlaggedCells({ right: [], left: [] });
    setPhase('testing');
  };

  const gridSizePx = calibrationPxPerMm ? calibrationPxPerMm * GRID_PHYSICAL_CM * 10 : 300;
  const cellSizePx = gridSizePx / GRID_SIZE;

  const handleCellClick = useCallback((row, col) => {
    setFlaggedCells((prev) => {
      const eyeCells = prev[currentEye];
      const existing = eyeCells.findIndex((c) => c.row === row && c.col === col);
      if (existing >= 0) {
        return { ...prev, [currentEye]: eyeCells.filter((_, i) => i !== existing) };
      }
      return { ...prev, [currentEye]: [...eyeCells, { row, col }] };
    });
  }, [currentEye]);

  const handleNextEye = () => {
    if (currentEye === 'right') {
      setCurrentEye('left');
    } else {
      setPhase('results');
    }
  };

  const handleSkip = () => {
    setAmslerResults({ completed: false, skipped: true, data: null });
    setReportPending(true);
  };

  const handleFinish = () => {
    if (reportPending) return;
    const results = {
      completed: true,
      skipped: false,
      calibrated: calibrationPxPerMm !== null,
      timestamp: new Date().toISOString(),
      data: {
        right: {
          eye: 'right',
          flaggedCells: flaggedCells.right,
          cellCount: flaggedCells.right.length,
          calibrated: calibrationPxPerMm !== null,
          timestamp: new Date().toISOString(),
        },
        left: {
          eye: 'left',
          flaggedCells: flaggedCells.left,
          cellCount: flaggedCells.left.length,
          calibrated: calibrationPxPerMm !== null,
          timestamp: new Date().toISOString(),
        },
      },
    };
    setAmslerResults(results);
    setReportPending(true);
  };

  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const isFlagged = flaggedCells[currentEye].some((cell) => cell.row === r && cell.col === c);
        const isCenter = r === Math.floor(GRID_SIZE / 2) && c === Math.floor(GRID_SIZE / 2);
        cells.push(
          <button
            key={`${r}-${c}`}
            type="button"
            className={`amsler__cell${isFlagged ? ' amsler__cell--flagged' : ''}${isCenter ? ' amsler__cell--center' : ''}`}
            style={{
              width: `${cellSizePx}px`,
              height: `${cellSizePx}px`,
              left: `${c * cellSizePx}px`,
              top: `${r * cellSizePx}px`,
            }}
            onClick={() => handleCellClick(r, c)}
            aria-label={`${lang === 'hi' ? 'ग्रिड सेल' : 'Grid cell'} ${r + 1},${c + 1}${isFlagged ? (lang === 'hi' ? ' — चिह्नित' : ' — flagged') : ''}`}
            aria-pressed={isFlagged}
          >
            {isCenter && <span className="amsler__dot-center" aria-hidden="true">●</span>}
          </button>
        );
      }
    }
    return cells;
  };

  const renderMiniGrid = (eye) => {
    const cells = flaggedCells[eye];
    return (
      <div className="amsler__mini-grid" role="img" aria-label={`${eye === 'right' ? (lang === 'hi' ? 'दाईं आँख' : 'Right eye') : (lang === 'hi' ? 'बाईं आँख' : 'Left eye')} — ${cells.length} ${lang === 'hi' ? 'क्षेत्र चिह्नित' : 'regions flagged'}`}>
        {Array.from({ length: GRID_SIZE }, (_, r) =>
          Array.from({ length: GRID_SIZE }, (_, c) => {
            const isFlagged = cells.some((cell) => cell.row === r && cell.col === c);
            return (
              <div
                key={`${r}-${c}`}
                className={`amsler__mini-cell${isFlagged ? ' amsler__mini-cell--flagged' : ''}`}
              />
            );
          })
        )}
      </div>
    );
  };

  if (phase === 'intro') {
    return (
      <main className="amsler" id="main-content" tabIndex="-1">
        <header className="amsler__topbar">
          <button className="amsler__back-btn" type="button" onClick={() => navigate('/vision', { replace: true })} aria-label={t('common.back', lang)}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <span className="amsler__topbar-title">{lang === 'hi' ? 'एम्सलर ग्रिड स्क्रीनिंग' : 'Amsler Grid Screening'}</span>
          <span className="amsler__topbar-spacer" />
        </header>
        <div className="amsler__content animate-fade-in">
          <div className="amsler__notice" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">info</span>
            <p>{lang === 'hi' ? 'यह एक होम स्क्रीनिंग गतिविधि है, निदान नहीं। एम्सलर ग्रिड का उपयोग नेत्र चिकित्सक पहले से मरीजों को मैक्युलर परिवर्तनों की स्व-निगरानी के लिए सुझाते हैं। परिणाम अपने अगले नेत्र देखभाल अपॉइंटमेंट में दिखाएँ।' : 'This is a home screening activity, not a diagnosis. The Amsler grid is already recommended by optometrists for self-monitoring of macular changes. Show results to your eye-care professional at your next visit.'}</p>
          </div>

          <h1 className="amsler__title">{lang === 'hi' ? 'एम्सलर ग्रिड होम स्क्रीनिंग' : 'Amsler Grid Home Screening'}</h1>
          <p className="amsler__desc">{lang === 'hi' ? 'यह एक सरल स्क्रीनिंग है जो मैक्युलर (केंद्रीय दृष्टि) परिवर्तनों का पता लगाने में मदद कर सकती है। कृपया पहले अपने स्क्रीन को कैलिब्रेट करें।' : 'A simple screening that can help detect macular (central vision) changes. Please calibrate your screen first.'}</p>

          <div className="amsler__calibration">
            <h2>{lang === 'hi' ? 'स्क्रीन कैलिब्रेशन' : 'Screen Calibration'}</h2>
            <p>{lang === 'hi' ? 'एक क्रेडिट कार्ड या आईडी कार्ड (85.6 mm चौड़ा) स्क्रीन पर रखें और नीचे की पट्टी को कार्ड की चौड़ाई से मिलाएँ।' : 'Place a credit card or ID card (85.6 mm wide) against the screen and drag the slider to match the card width.'}</p>
            <div className="amsler__calibration-ruler">
              <div
                ref={sliderRef}
                className="amsler__ruler-bar"
                style={{ width: `${sliderWidthPx}px` }}
              >
                <span className="amsler__ruler-label">← {Math.round(sliderWidthPx)}px →</span>
              </div>
              <input
                type="range"
                className="amsler__ruler-slider"
                min="150"
                max="500"
                value={sliderWidthPx}
                onChange={(e) => setSliderWidthPx(Number(e.target.value))}
                aria-label={lang === 'hi' ? 'कैलिब्रेशन स्लाइडर' : 'Calibration slider'}
              />
            </div>
          </div>

          <div className="amsler__intro-actions">
            <button className="btn btn--primary btn--full btn--lg" type="button" onClick={handleCalibrate}>
              <span className="material-symbols-outlined" aria-hidden="true">straighten</span>
              {lang === 'hi' ? 'कैलिब्रेट करें और आगे बढ़ें' : 'Calibrate and continue'}
            </button>
            <button className="btn btn--ghost btn--full" type="button" onClick={handleSkip}>
              <span className="material-symbols-outlined" aria-hidden="true">skip_next</span>
              {lang === 'hi' ? 'यह गतिविधि छोड़ें' : 'Skip this activity'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'instructions') {
    return (
      <main className="amsler" id="main-content" tabIndex="-1">
        <header className="amsler__topbar">
          <button className="amsler__back-btn" type="button" onClick={() => setPhase('intro')} aria-label={t('common.back', lang)}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
          </button>
          <span className="amsler__topbar-title">{lang === 'hi' ? 'निर्देश' : 'Instructions'}</span>
          <span className="amsler__topbar-spacer" />
        </header>
        <div className="amsler__content animate-fade-in">
          <h1 className="amsler__title">{lang === 'hi' ? 'एम्सलर ग्रिड का उपयोग कैसे करें' : 'How to use the Amsler Grid'}</h1>
          <ol className="amsler__steps">
            <li><span className="amsler__step-num">1</span><span>{lang === 'hi' ? 'अपना चश्मा पहनें (यदि आप सामान्य रूप से पढ़ने के लिए पहनते हैं)।' : 'Wear your reading glasses (if you normally use them for near work).'}</span></li>
            <li><span className="amsler__step-num">2</span><span>{lang === 'hi' ? 'फ़ोन या टैबलेट को लगभग 30-40 cm (एक हाथ की दूरी) पर रखें।' : 'Hold the phone or tablet about 30-40 cm (arm\'s length) away.'}</span></li>
            <li><span className="amsler__step-num">3</span><span>{lang === 'hi' ? 'अपनी बाईं आँख ढकें और दाईं आँख से केंद्र के बिंदु पर ध्यान केंद्रित करें।' : 'Cover your left eye and focus on the central dot with your right eye.'}</span></li>
            <li><span className="amsler__step-num">4</span><span>{lang === 'hi' ? 'केंद्र पर ध्यान केंद्रित रखते हुए, किसी भी क्षेत्र पर टैप करें जहाँ रेखाएँ लहरदार, धुंधली या गायब दिखें।' : 'While keeping your focus on the center, tap any areas where lines appear wavy, blurred or missing.'}</span></li>
            <li><span className="amsler__step-num">5</span><span>{lang === 'hi' ? 'फिर दाईं आँख ढकें और बाईं आँख से दोहराएँ।' : 'Then cover your right eye and repeat with your left eye.'}</span></li>
          </ol>
          <div className="amsler__notice" role="note">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            <p>{lang === 'hi' ? 'SightSteps निदान उपकरण नहीं है। एम्सलर ग्रिड के परिणाम होम स्क्रीनिंग हैं और पेशेवर जाँच का विकल्प नहीं हैं। ये परिणाम अपने अगले नेत्र देखभाल अपॉइंटमेंट में दिखाएँ।' : 'SightSteps is not a diagnostic tool. Amsler grid results are a home screening and do not replace a professional examination. Show these results to your eye-care professional at your next visit.'}</p>
          </div>
          <button className="btn btn--primary btn--full btn--lg" type="button" onClick={startTest}>
            <span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>
            {lang === 'hi' ? 'दाईं आँख से शुरू करें' : 'Start with right eye'}
          </button>
        </div>
      </main>
    );
  }

  const handleKbAdd = () => {
    const r = parseInt(kbRow, 10) - 1;
    const c = parseInt(kbCol, 10) - 1;
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      handleCellClick(r, c);
      setKbRow('');
      setKbCol('');
    }
  };

  if (phase === 'testing') {
    const eyeLabel = currentEye === 'right'
      ? (lang === 'hi' ? 'दाईं आँख' : 'Right Eye')
      : (lang === 'hi' ? 'बाईं आँख' : 'Left Eye');
    const coverLabel = currentEye === 'right'
      ? (lang === 'hi' ? 'अपनी बाईं आँख ढकें' : 'Cover your left eye')
      : (lang === 'hi' ? 'अपनी दाईं आँख ढकें' : 'Cover your right eye');

    return (
      <main className="amsler amsler--testing" id="main-content" tabIndex="-1">
        <header className="amsler__topbar">
          <span className="amsler__topbar-spacer" />
          <span className="amsler__topbar-title">{eyeLabel}</span>
          <span className="amsler__topbar-counter">{currentEye === 'right' ? '1/2' : '2/2'}</span>
        </header>
        <div className="amsler__test-content">
          <p className="amsler__cover-hint">
            <span className="material-symbols-outlined" aria-hidden="true">visibility_off</span>
            {coverLabel}
          </p>
          <p className="amsler__test-prompt">
            {lang === 'hi' ? 'केंद्र के बिंदु पर ध्यान केंद्रित करें। लहरदार, धुंधली या गायब रेखाओं वाले क्षेत्रों पर टैप करें।' : 'Focus on the center dot. Tap any areas where lines appear wavy, blurred or missing.'}
          </p>
          <div className="amsler__grid-container" style={{ width: `${gridSizePx}px`, height: `${gridSizePx}px` }}>
            <div className="amsler__grid-lines" style={{ width: `${gridSizePx}px`, height: `${gridSizePx}px` }}>
              {/* Horizontal lines */}
              {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
                <div key={`h-${i}`} className="amsler__line amsler__line--h" style={{ top: `${i * cellSizePx}px`, width: `${gridSizePx}px` }} />
              ))}
              {/* Vertical lines */}
              {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
                <div key={`v-${i}`} className="amsler__line amsler__line--v" style={{ left: `${i * cellSizePx}px`, height: `${gridSizePx}px` }} />
              ))}
            </div>
            {renderGrid()}
          </div>
          <p className="amsler__flagged-count" aria-live="polite">
            {lang === 'hi'
              ? `${flaggedCells[currentEye].length} क्षेत्र चिह्नित`
              : `${flaggedCells[currentEye].length} regions flagged`}
          </p>
          <div className="amsler__kb-fallback" role="group" aria-label={lang === 'hi' ? 'कीबोर्ड से क्षेत्र जोड़ें' : 'Flag region by keyboard'}>
            <label className="amsler__kb-label">{lang === 'hi' ? 'कीबोर्ड: पंक्ति और स्तंभ दर्ज करें' : 'Keyboard: enter row and column'}</label>
            <div className="amsler__kb-inputs">
              <input type="number" min="1" max={GRID_SIZE} value={kbRow} onChange={(e) => setKbRow(e.target.value)} placeholder={lang === 'hi' ? 'पंक्ति' : 'Row'} className="amsler__kb-input" aria-label={lang === 'hi' ? 'पंक्ति (1-20)' : 'Row (1-20)'} />
              <input type="number" min="1" max={GRID_SIZE} value={kbCol} onChange={(e) => setKbCol(e.target.value)} placeholder={lang === 'hi' ? 'स्तंभ' : 'Col'} className="amsler__kb-input" aria-label={lang === 'hi' ? 'स्तंभ (1-20)' : 'Column (1-20)'} />
              <button type="button" className="btn btn--outline btn--sm" onClick={handleKbAdd} disabled={!kbRow || !kbCol}>
                {lang === 'hi' ? 'जोड़ें / हटाएँ' : 'Add / Remove'}
              </button>
            </div>
          </div>
          <div className="amsler__test-actions">
            <button className="btn btn--primary btn--full" type="button" onClick={handleNextEye}>
              {currentEye === 'right'
                ? (lang === 'hi' ? 'बाईं आँख पर जाएँ' : 'Continue to left eye')
                : (lang === 'hi' ? 'परिणाम देखें' : 'View results')}
              <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>
            <button className="btn btn--ghost" type="button" onClick={handleSkip}>
              {lang === 'hi' ? 'छोड़ें' : 'Skip'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Results phase
  return (
    <main className="amsler" id="main-content" tabIndex="-1">
      <header className="amsler__topbar">
        <span className="amsler__topbar-spacer" />
        <span className="amsler__topbar-title">{lang === 'hi' ? 'एम्सलर ग्रिड परिणाम' : 'Amsler Grid Results'}</span>
        <span className="amsler__topbar-spacer" />
      </header>
      <div className="amsler__content animate-fade-in">
        <div className="amsler__results-header">
          <span className="material-symbols-outlined amsler__results-check" aria-hidden="true">check_circle</span>
          <h1>{lang === 'hi' ? 'स्क्रीनिंग पूरी हुई' : 'Screening Complete'}</h1>
        </div>

        <div className="amsler__results-grid">
          <div className="amsler__result-card">
            <h3>{lang === 'hi' ? 'दाईं आँख' : 'Right Eye'}</h3>
            {renderMiniGrid('right')}
            <p className="amsler__result-count">
              {lang === 'hi'
                ? `${flaggedCells.right.length} क्षेत्रों में परिवर्तन चिह्नित`
                : `${flaggedCells.right.length} regions flagged`}
            </p>
          </div>
          <div className="amsler__result-card">
            <h3>{lang === 'hi' ? 'बाईं आँख' : 'Left Eye'}</h3>
            {renderMiniGrid('left')}
            <p className="amsler__result-count">
              {lang === 'hi'
                ? `${flaggedCells.left.length} क्षेत्रों में परिवर्तन चिह्नित`
                : `${flaggedCells.left.length} regions flagged`}
            </p>
          </div>
        </div>

        {(spatial.right.count > 0 || spatial.left.count > 0) && (
          <section className="amsler__spatial" aria-label={t('amsler.spatial.title', lang)}>
            <h2 className="amsler__spatial-title">
              <span className="material-symbols-outlined" aria-hidden="true">analytics</span>
              {t('amsler.spatial.title', lang)}
            </h2>
            <div className="amsler__spatial-body" role="region" aria-label={t('amsler.spatial.subtitle', lang)}>
              {spatialText.right.map((line, i) => (
                <p key={`r-${i}`} className="amsler__spatial-line">{line}</p>
              ))}
              {spatialText.left.map((line, i) => (
                <p key={`l-${i}`} className="amsler__spatial-line">{line}</p>
              ))}
              {spatialText.comparison.map((line, i) => (
                <p key={`c-${i}`} className="amsler__spatial-line amsler__spatial-line--compare">{line}</p>
              ))}
              <p className="amsler__spatial-disclaimer">{spatialText.disclaimer}</p>
            </div>
          </section>
        )}

        <div className="amsler__notice" role="note">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <p>{lang === 'hi' ? 'यह एक होम स्क्रीनिंग परिणाम है, निदान नहीं। ये परिणाम अपने ऑप्टोमेट्रिस्ट को अपनी अगली मुलाक़ात में दिखाएँ।' : 'This is a home screening result, not a diagnosis. Show these results to your optometrist at your next visit.'}</p>
        </div>

        <button className="btn btn--primary btn--full btn--lg" type="button" onClick={handleFinish} disabled={reportPending}>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
          {lang === 'hi' ? 'आगे बढ़ें' : 'Continue'}
        </button>
      </div>
    </main>
  );
}

export default AmslerGrid;
