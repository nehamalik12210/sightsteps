const COPY = {
  en: {
    saving: { text: 'Saving on this device…', icon: 'sync', tone: 'saving' },
    saved: { text: 'Saved on this device', icon: 'check_circle', tone: 'saved' },
    error: { text: 'Could not save on this device. Changes may be lost if you refresh.', icon: 'warning', tone: 'error' },
  },
  hi: {
    saving: { text: 'इसी डिवाइस पर सहेजा जा रहा है…', icon: 'sync', tone: 'saving' },
    saved: { text: 'इसी डिवाइस पर सहेजा गया', icon: 'check_circle', tone: 'saved' },
    error: { text: 'इस डिवाइस पर सेव नहीं हो सका। रीफ़्रेश करने पर बदलाव खो सकते हैं।', icon: 'warning', tone: 'error' },
  },
};

export function getLocalSaveStatusCopy(status, language = 'en') {
  if (!['saving', 'saved', 'error'].includes(status)) return null;
  const locale = language === 'hi' ? 'hi' : 'en';
  return COPY[locale][status];
}
