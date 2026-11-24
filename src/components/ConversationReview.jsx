export default function ConversationReview({ value = {}, onChange, language = 'en' }) {
  const hi = language === 'hi';
  const correction = typeof value.correction === 'string' ? value.correction : '';
  const confirmed = Boolean(value.confirmed);

  const update = (changes) => onChange({ confirmed, correction, ...changes });

  return (
    <section className="conversation-review" aria-labelledby="conversation-review-title">
      <div className="conversation-review__heading">
        <span className="material-symbols-outlined" aria-hidden="true">fact_check</span>
        <div>
          <p className="conversation-review__kicker">{hi ? 'आपकी समीक्षा' : 'YOUR REVIEW'}</p>
          <h2 id="conversation-review-title">{hi ? 'क्या यह सारांश आपकी बात सही तरह बताता है?' : 'Does this summary reflect what you wanted to share?'}</h2>
          <p>{hi
            ? 'आप इसे सही मान सकते हैं या कोई सुधार/अतिरिक्त बात लिख सकते हैं। आपके मूल जवाब नहीं बदलेंगे।'
            : 'You can confirm it or add a correction. Your original answers remain unchanged.'}</p>
        </div>
      </div>
      <label className="conversation-review__confirm">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => update({ confirmed: event.target.checked })}
        />
        <span>{hi ? 'हाँ, यह सारांश मेरी बात को सही तरह दर्शाता है।' : 'Yes, this summary reflects what I wanted to share.'}</span>
      </label>
      <div className="conversation-review__correction">
        <label htmlFor="conversation-review-correction">{hi ? 'क्या कुछ सुधारना या जोड़ना चाहेंगे? (वैकल्पिक)' : 'Would you like to correct or add anything? (optional)'}</label>
        <textarea
          id="conversation-review-correction"
          value={correction}
          maxLength={500}
          rows={3}
          placeholder={hi ? 'अपने शब्दों में सुधार या अतिरिक्त संदर्भ लिखें…' : 'Write a correction or additional context in your own words…'}
          onChange={(event) => update({ correction: event.target.value.slice(0, 500) })}
        />
        <span className="conversation-review__count">{correction.length}/500</span>
      </div>
      <p className="conversation-review__note">
        {hi
          ? 'आपकी पुष्टि या टिप्पणी केवल आपकी बातचीत की तैयारी में जोड़ी जाएगी। इससे कोई चिकित्सकीय निष्कर्ष नहीं बदलेगा।'
          : 'Your confirmation or note is included only as conversation context. It does not change any clinical interpretation.'}
      </p>
    </section>
  );
}
