/** Browser speech helper for the optional bilingual demo voice. */

let hindiVoice = null;
let englishVoice = null;
let voicesPromise = null;
let voicesListenerAttached = false;
let activeSpeakRequest = 0;

const PREFERRED_VENDORS = ['google', 'microsoft', 'apple'];

function getSpeechSynthesis() {
  if (typeof window === 'undefined') return null;
  return window.speechSynthesis || null;
}

function scoreVoice(voice) {
  const name = String(voice?.name || '').toLowerCase();
  let score = 0;

  PREFERRED_VENDORS.forEach((vendor, index) => {
    if (name.includes(vendor)) {
      score += (PREFERRED_VENDORS.length - index) * 10;
    }
  });

  if (
    name.includes('female') ||
    name.includes('lekha') ||
    name.includes('swara')
  ) {
    score += 5;
  }

  if (!name.includes('compact') && !name.includes('reduced')) {
    score += 2;
  }

  return score;
}

function chooseVoice(voices, prefix) {
  return voices
    .filter((voice) => String(voice.lang || '').toLowerCase().startsWith(prefix))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

function updateVoices() {
  const synthesis = getSpeechSynthesis();
  if (!synthesis) return;

  const voices = synthesis.getVoices();
  if (!voices.length) return;

  hindiVoice = chooseVoice(voices, 'hi');
  englishVoice = chooseVoice(voices, 'en');
}

/** Resolve even when the browser has no installed speech voices. */
export function initVoices() {
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const synthesis = getSpeechSynthesis();

    if (!synthesis) {
      resolve({ hindiVoice: null, englishVoice: null });
      return;
    }

    updateVoices();

    if (synthesis.getVoices().length) {
      resolve({ hindiVoice, englishVoice });
      return;
    }

    const onVoicesChanged = () => {
      updateVoices();

      if (synthesis.getVoices().length) {
        resolve({ hindiVoice, englishVoice });
      }
    };

    if (!voicesListenerAttached) {
      synthesis.addEventListener?.('voiceschanged', onVoicesChanged);
      voicesListenerAttached = true;
    }

    // Some browsers return an empty list indefinitely; do not block the app.
    window.setTimeout(() => {
      updateVoices();
      resolve({ hindiVoice, englishVoice });
    }, 1800);
  });

  return voicesPromise;
}

/** Call from a user gesture when a browser requires speech activation. */
export function unlockAudio() {
  const synthesis = getSpeechSynthesis();
  if (!synthesis) return false;

  try {
    synthesis.cancel();
    return true;
  } catch {
    return false;
  }
}

export async function speakWhenReady(text, lang = 'en', options = {}) {
  const synthesis = getSpeechSynthesis();

  if (!synthesis || !String(text || '').trim()) {
    options.onError?.();
    return false;
  }

  const requestId = ++activeSpeakRequest;

  await initVoices();

  if (requestId !== activeSpeakRequest) return false;

  try {
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(String(text));

    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-US';
      if (englishVoice) utterance.voice = englishVoice;
    }

    utterance.rate = options.rate ?? (lang === 'hi' ? 0.88 : 1);
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = Math.min(1, Math.max(0, options.volume ?? 1));

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = (event) => options.onError?.(event);

    synthesis.speak(utterance);
    return true;
  } catch (error) {
    options.onError?.(error);
    return false;
  }
}

export function speak(text, lang = 'en', options = {}) {
  return speakWhenReady(text, lang, options);
}

export function stopSpeaking() {
  activeSpeakRequest += 1;

  const synthesis = getSpeechSynthesis();
  if (!synthesis) return;

  try {
    synthesis.cancel();
  } catch {
    // Speech cancellation is best-effort only.
  }
}

export function isHindiTTSAvailable() {
  return Boolean(hindiVoice);
}

export function playAudio(source) {
  return new Promise((resolve) => {
    if (!source || typeof Audio === 'undefined') {
      resolve(false);
      return;
    }

    const audio = new Audio(source);

    audio.addEventListener('ended', () => resolve(true), { once: true });
    audio.addEventListener('error', () => resolve(false), { once: true });

    audio.play().catch(() => resolve(false));
  });
}