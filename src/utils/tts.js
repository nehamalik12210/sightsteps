/**
 * TTS Service
 */

let hindiVoice = null;
let englishVoice = null;
let voicesReady = false;
let voicesPromise = null;

const PREFERRED_VENDORS = ['google', 'microsoft', 'apple'];

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  for (let i = 0; i < PREFERRED_VENDORS.length; i++) {
    if (name.includes(PREFERRED_VENDORS[i])) score += (PREFERRED_VENDORS.length - i) * 10;
  }
  if (name.includes('female') || name.includes('lekha') || name.includes('swara')) score += 5;
  if (!name.includes('compact') && !name.includes('reduced')) score += 3;
  return score;
}

function pickBestVoice(voices, langPrefix) {
  const candidates = voices.filter((v) => v.lang.startsWith(langPrefix));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return candidates[0];
}

/**
 * Must be called from a click handler to unlock Chrome audio.
 */
export function unlockAudio() {
  if (!window.speechSynthesis) return;
  // Speak a tiny silent word to unlock the audio pipeline
  const u = new SpeechSynthesisUtterance('.');
  u.volume = 0.01;
  u.rate = 10;
  window.speechSynthesis.speak(u);
  // Cancel it immediately so user hears nothing
  setTimeout(() => window.speechSynthesis.cancel(), 50);
  console.log('[TTS] Audio unlocked');
}

export function initVoices() {
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    if (!window.speechSynthesis) {
      voicesReady = true;
      resolve({ hindiVoice: null, englishVoice: null });
      return;
    }

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      hindiVoice = pickBestVoice(voices, 'hi');
      englishVoice = pickBestVoice(voices, 'en');
      voicesReady = true;

      console.log('[TTS] Hindi voice:', hindiVoice?.name || 'NONE');
      console.log('[TTS] English voice:', englishVoice?.name || 'NONE');
      resolve({ hindiVoice, englishVoice });
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
      const poll = setInterval(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          clearInterval(poll);
          if (!voicesReady) loadVoices();
        }
      }, 250);
      setTimeout(() => {
        clearInterval(poll);
        if (!voicesReady) { loadVoices(); resolve({ hindiVoice, englishVoice }); }
      }, 5000);
    }
  });

  return voicesPromise;
}

export async function speakWhenReady(text, lang = 'en', options = {}) {
  await initVoices();

  if (!window.speechSynthesis || !text) {
    options.onError?.();
    return;
  }

  // Cancel anything playing, wait for Chrome to settle
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 150));
  }

  const utterance = new SpeechSynthesisUtterance(text);

  if (lang === 'hi' && hindiVoice) {
    utterance.voice = hindiVoice;
    utterance.lang = 'hi-IN';
  } else if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else if (englishVoice) {
    utterance.voice = englishVoice;
    utterance.lang = 'en-US';
  }

  utterance.rate = options.rate ?? (lang === 'hi' ? 0.85 : 1.0);
  utterance.pitch = options.pitch ?? (lang === 'hi' ? 0.95 : 1.0);
  utterance.volume = options.volume ?? 1.0;

  utterance.onend = () => { console.log('[TTS] Done'); options.onEnd?.(); };
  utterance.onerror = (e) => { console.error('[TTS] Error:', e.error); options.onError?.(); };

  console.log(`[TTS] Speaking (${lang}): "${text.substring(0, 50)}" voice=${utterance.voice?.name || 'default'}`);
  window.speechSynthesis.speak(utterance);
}

export function speak(text, lang = 'en', options = {}) {
  speakWhenReady(text, lang, options);
}

export function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

export function isHindiTTSAvailable() {
  return hindiVoice !== null;
}

export function playAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio(src);
    audio.addEventListener('ended', resolve);
    audio.addEventListener('error', () => resolve());
    audio.play().catch(() => resolve());
  });
}
