import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logoWhite from "@/assets/logo-white.png";

const css = `
:root{--navy:#040B2B;--navy-mid:#021488;--orange:#065DC7;--orange-light:#61A2FE;--cream:#F5F8FF;--cream-warm:#EEF4FF;--white:#ffffff;--muted:#6B7A99;--border:rgba(6,93,199,0.15)}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
.fb-root{font-family:'Outfit',sans-serif;background:var(--cream);color:var(--navy);min-height:100vh;display:flex;flex-direction:column}
.fb-root h1,.fb-root h2{font-family:'Cormorant Garamond',serif;line-height:1.15;font-weight:600}
.fb-root a{text-decoration:none;color:inherit}

.fb-hero{background:linear-gradient(148deg,#040B2B 0%,#021488 55%,#030B58 100%);padding:40px 7% 56px;text-align:center;position:relative;overflow:hidden}
.fb-hero::before{content:'';position:absolute;top:-80px;right:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(97,162,254,0.12) 0%,transparent 65%);pointer-events:none}
.fb-hero-inner{position:relative;z-index:2;max-width:560px;margin:0 auto}
.fb-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(97,162,254,0.15);color:var(--orange-light);font-size:0.7rem;font-weight:700;padding:6px 14px;border-radius:50px;margin-bottom:18px;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(97,162,254,0.25)}
.fb-hero h1{font-size:clamp(1.6rem,3.4vw,2.3rem);color:#fff;margin-bottom:12px;letter-spacing:-0.02em;font-family:'Outfit',sans-serif;font-weight:600}
.fb-hero p{font-size:0.95rem;color:rgba(255,255,255,0.62);line-height:1.7}

.fb-card-wrap{flex:1;padding:0 5% 56px;margin-top:-28px;position:relative;z-index:3}
.fb-card{background:var(--white);max-width:560px;margin:0 auto;border-radius:20px;padding:34px 32px 30px;box-shadow:0 24px 72px rgba(4,11,43,0.16);border:1px solid rgba(4,11,43,0.06)}

.fb-field{margin-bottom:22px}
.fb-label{display:block;font-size:0.85rem;font-weight:600;color:var(--navy);margin-bottom:9px}
.fb-label .req{color:var(--orange)}
.fb-optional{font-weight:400;color:var(--muted);font-size:0.78rem}

.fb-stars{display:flex;gap:6px}
.fb-star{background:none;border:none;cursor:pointer;font-size:2rem;line-height:1;color:#D7E1F2;transition:transform 0.12s,color 0.12s;padding:2px}
.fb-star:hover{transform:scale(1.12)}
.fb-star.on{color:#F5B301}
.fb-star:focus-visible{outline:2px solid var(--orange);outline-offset:3px;border-radius:6px}
.fb-rating-text{font-size:0.78rem;color:var(--muted);margin-top:8px;min-height:1em}

.fb-input,.fb-textarea{width:100%;border:1.5px solid var(--border);font-family:'Outfit',sans-serif;font-size:0.92rem;color:var(--navy);outline:none;transition:border-color 0.2s;background:#fff}
.fb-input{padding:14px 16px;border-radius:12px}
.fb-textarea{padding:14px 16px;border-radius:12px;resize:vertical;min-height:96px;line-height:1.55}
.fb-input:focus,.fb-textarea:focus{border-color:var(--orange)}
.fb-row{display:flex;gap:12px}
.fb-row .fb-field{flex:1}

.fb-submit{width:100%;padding:16px 24px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;border:none;background:var(--orange);color:#fff;box-shadow:0 6px 24px rgba(6,93,199,0.32);transition:all 0.22s;letter-spacing:0.04em;text-transform:uppercase;margin-top:4px}
.fb-submit:hover:not(:disabled){background:var(--navy);transform:translateY(-2px)}
.fb-submit:disabled{opacity:0.6;cursor:not-allowed}
.fb-error{font-size:0.8rem;color:#dc2626;margin-top:12px;text-align:center}
.fb-note{font-size:0.74rem;color:var(--muted);text-align:center;margin-top:14px;line-height:1.5}

.fb-thanks{text-align:center;padding:18px 8px}
.fb-thanks-emoji{font-size:3rem;line-height:1;margin-bottom:16px}
.fb-thanks h2{font-size:1.7rem;color:var(--navy);margin-bottom:10px}
.fb-thanks p{font-size:0.92rem;color:var(--muted);line-height:1.7;margin-bottom:24px}
.fb-back{display:inline-block;background:var(--navy);color:#fff;padding:13px 28px;border-radius:50px;font-size:0.85rem;font-weight:700;letter-spacing:0.03em}
.fb-back:hover{background:var(--orange)}

.fb-foot{text-align:center;padding:22px 5%;font-size:0.75rem;color:var(--muted)}

@media(max-width:600px){
  .fb-hero{padding:32px 6% 52px}
  .fb-card{padding:26px 20px 24px;border-radius:16px}
  .fb-row{flex-direction:column;gap:0}
  .fb-star{font-size:1.85rem}
}
`;

const RATING_LABELS: Record<number, string> = {
  1: "Poor — it didn't work for me",
  2: "Below average",
  3: "It was okay",
  4: "Good — I'd recommend it",
  5: "Excellent — exactly what I needed",
};

const SopVaultFeedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#040B2B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (rating < 1) {
      setError("Please tap a star to rate your experience.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address (or leave it blank).");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase
      .from("sop_feedback" as never)
      .insert({
        rating,
        review: review.trim() || null,
        suggestions: suggestions.trim() || null,
        name: name.trim() || null,
        email: email.trim() || null,
        source: "sop-vault",
      } as never);

    if (insertError) {
      setSubmitting(false);
      setError("Something went wrong — please try again in a moment.");
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fb-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="fb-hero">
        <Link to="/product/sop-vault" style={{ display: "inline-block", marginBottom: 24, position: "relative", zIndex: 2 }}>
          <img src={logoWhite} alt="OnePercent Abroad" style={{ height: 34, width: "auto" }} />
        </Link>
        <div className="fb-hero-inner">
          <div className="fb-eyebrow">The SOP Vault · Feedback</div>
          <h1>{submitted ? "Thank you!" : "How was your experience?"}</h1>
          {!submitted && (
            <p>Your honest feedback helps us make The SOP Vault better for the next student. It takes under a minute.</p>
          )}
        </div>
      </section>

      <div className="fb-card-wrap">
        <div className="fb-card">
          {submitted ? (
            <div className="fb-thanks">
              <div className="fb-thanks-emoji">🙏</div>
              <h2>Feedback received</h2>
              <p>Thanks for taking the time to share your thoughts — it genuinely helps us improve.</p>
              <Link to="/product/sop-vault" className="fb-back">Back to The SOP Vault</Link>
            </div>
          ) : (
            <>
              <div className="fb-field">
                <label className="fb-label">Your rating <span className="req">*</span></label>
                <div className="fb-stars" role="radiogroup" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`fb-star${n <= activeRating ? " on" : ""}`}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      aria-checked={rating === n}
                      role="radio"
                    >
                      {n <= activeRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
                <div className="fb-rating-text">{activeRating ? RATING_LABELS[activeRating] : ""}</div>
              </div>

              <div className="fb-field">
                <label className="fb-label" htmlFor="fb-review">
                  Your review <span className="fb-optional">(optional)</span>
                </label>
                <textarea
                  id="fb-review"
                  className="fb-textarea"
                  placeholder="What did you think of the SOPs? Did they help you?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  maxLength={2000}
                />
              </div>

              <div className="fb-field">
                <label className="fb-label" htmlFor="fb-suggestions">
                  Feedback / suggestions <span className="fb-optional">(optional)</span>
                </label>
                <textarea
                  id="fb-suggestions"
                  className="fb-textarea"
                  placeholder="Anything we could improve, or SOPs you'd like us to add?"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  maxLength={2000}
                />
              </div>

              <div className="fb-row">
                <div className="fb-field">
                  <label className="fb-label" htmlFor="fb-name">
                    Name <span className="fb-optional">(optional)</span>
                  </label>
                  <input
                    id="fb-name"
                    className="fb-input"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="fb-field">
                  <label className="fb-label" htmlFor="fb-email">
                    Email <span className="fb-optional">(optional)</span>
                  </label>
                  <input
                    id="fb-email"
                    className="fb-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button className="fb-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit feedback"}
              </button>
              {error && <div className="fb-error">{error}</div>}
              <div className="fb-note">Your feedback goes straight to our team. We never share your details.</div>
            </>
          )}
        </div>
      </div>

      <footer className="fb-foot">© 2025 OnePercent Abroad</footer>
    </div>
  );
};

export default SopVaultFeedback;
