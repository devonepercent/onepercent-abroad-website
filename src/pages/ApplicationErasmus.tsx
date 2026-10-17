import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, FileCheck2, FilePenLine, Headphones, Quote, UserRound } from "lucide-react";
import "./ApplicationErasmus.css";
import logoWhite from "@/assets/logo-white.png";
import Footer from "@/components/Footer";
import { ErasmusLoader, PhotoCollage, StarRing } from "@/components/ErasmusHeroBackdrop";
import { supabase } from "@/integrations/supabase/client";
import { inclusions, PRICE, successStories, SuccessStory } from "@/lib/erasmusData";
import { trackMetaEvent } from "@/lib/metaPixel";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const programmesPath = "/application/erasmus/programs";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 768px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return isDesktop;
};

// EU-blue hero: a shifting collage of admitted students behind a twinkling
// twelve-star ring. Desktop adds the callback form on the right.
const HeroSection = ({ isDesktop }: { isDesktop: boolean }) => <section className="erz-video-hero" aria-labelledby="erasmus-title">
  <div className="erz-speaker-frame"><PhotoCollage /></div>
  <div className="erz-container erz-hero-layout">
    <div className="erz-hero-copy">
    <StarRing />
    <div className="erz-hero-content">
      <span className="erz-eyebrow">YOUR NEXT CHAPTER</span>
      <h1 id="erasmus-title">Apply for an <em>Erasmus Mundus</em> master’s.</h1>
      <p>A dedicated <strong className="erz-hero-mentor">1:1 mentor</strong> guides your shortlist, documents and applications.</p>
    </div>
    <div className="erz-hero-actions">
      <a className="erz-button erz-primary" href="#erasmus-form">Talk to an expert — free <ArrowRight size={18} /></a>
      <Link className="erz-hero-link" to={programmesPath}>Browse programmes <ArrowRight size={16} /></Link>
    </div>
    </div>
    {isDesktop && <FormSection variant="hero" />}
  </div>
</section>;

// Exact excerpts and full reviews from the site's existing student testimonials.
const reviews = [
  {
    name: "Sisa Maria Sunny",
    programme: "Journalism, Media and Globalization",
    image: "/images/erasmus-stories/sisa-mariya.webp",
    excerpt: "They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    full: "I never thought that I could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
  },
  {
    name: "Amaresh",
    programme: "EMINENT",
    image: "/images/erasmus-stories/amaresh.webp",
    excerpt: "They also helped in practical ways and kept me clocked in with the deadlines.",
    full: "Mentorship helped me in shortlisting courses, to understand what is realistically possible for me to achieve. They also helped in practical ways and kept me clocked in with the deadlines.",
  },
];

const ReviewsSection = () => <section id="stories" className="erz-reviews erz-container erz-section">
  <div className="erz-section-heading"><span className="erz-label">ERASMUS STUDENT REVIEWS</span><h2>Hear it from our students.</h2></div>
  <div className="erz-review-grid">{reviews.map(review => <article className="erz-review" key={review.name}>
    <Quote className="erz-quote-icon" size={28} aria-hidden="true" />
    <blockquote>“{review.excerpt}”</blockquote>
    <div className="erz-review-person"><img src={review.image} alt={review.name} width="64" height="64" loading="lazy" /><div><h3>{review.name}</h3><p>{review.programme}</p><span>Erasmus Mundus</span></div></div>
    <details className="erz-full-review"><summary><span className="erz-read-more">Read full review</span><span className="erz-read-less">Close full review</span><ChevronDown size={16} /></summary><p>“{review.full}”</p></details>
  </article>)}</div>
</section>;

const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

// Headline numbers derived from the stories themselves, so they never drift.
const stats = [
  { value: successStories.length, label: "students selected" },
  { value: new Set(successStories.map(s => s.code ?? s.programme)).size, label: "Erasmus programmes" },
  { value: successStories.filter(s => /scholarship/i.test(s.achievement)).length, label: "with scholarships" },
];

const AUTO_SPEED = 32; // px per second the results row drifts
const AUTO_RESUME = 2500; // ms after the last interaction before drifting again
const DRAG_START = 6; // px of sideways movement before a touch becomes a drag

const StoryCard = ({ story, clone }: { story: SuccessStory; clone?: boolean }) => <article className="erz-story" role={clone ? undefined : "listitem"} aria-hidden={clone || undefined}>
  <div className="erz-story-photo">
    {story.image ? <img src={story.image} alt={clone ? "" : story.name} width="320" height="320" draggable={false} /> : <span className="erz-story-initials" aria-hidden="true">{initials(story.name)}</span>}
    {story.code && <span className="erz-story-code">{story.code}</span>}
  </div>
  <div className="erz-story-body">
    <span className="erz-story-chip">{story.achievement}</span>
    <h3>{story.name}</h3>
    <p>{story.programme}</p>
  </div>
</article>;

// Mobile-first: a photo row that drifts on its own and loops forever.
// The row is moved with a GPU transform (sub-pixel smooth) rather than by
// scrolling. The cards are rendered twice and the offset wraps by one set
// width, which is invisible because both sets look identical. Visitors can
// drag or swipe it (with momentum); touch, hover or focus pauses the drift.
const StoriesSection = () => {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const motion = useRef({ offset: 0, velocity: 0, target: null as number | null, pausedUntil: 0, hover: false, step: 0 });
  const pause = () => { motion.current.pausedUntil = Date.now() + AUTO_RESUME; };

  // Arrow buttons glide roughly one screen of cards, landing on a card edge.
  const page = (dir: number) => {
    const m = motion.current;
    const vp = viewport.current;
    if (!vp || !m.step) return;
    pause();
    m.velocity = 0;
    const cards = Math.max(1, Math.floor((vp.clientWidth * 0.8) / m.step));
    m.target = Math.round((m.target ?? m.offset) / m.step) * m.step + dir * cards * m.step;
  };

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const m = motion.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let setWidth = 0;
    const measure = () => {
      const first = tr.children[0] as HTMLElement | undefined;
      const clone = tr.children[successStories.length] as HTMLElement | undefined;
      setWidth = first && clone ? clone.offsetLeft - first.offsetLeft : 0;
      m.step = setWidth / successStories.length;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    let onScreen = false;
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    io.observe(vp);

    // Dragging and swiping. touch-action: pan-y leaves vertical page scrolling to the browser.
    let drag: { id: number; x: number; y: number; offset: number; lastX: number; lastT: number; active: boolean } | null = null;
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, offset: m.offset, lastX: e.clientX, lastT: performance.now(), active: false };
      m.velocity = 0;
      m.target = null;
      pause();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "mouse") m.hover = true;
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.active) {
        if (Math.abs(dx) < DRAG_START || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
        drag.active = true;
        vp.setPointerCapture(e.pointerId);
        vp.classList.add("is-dragging");
      }
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      m.velocity = 0.8 * (-(e.clientX - drag.lastX) / dt) * 1000 + 0.2 * m.velocity;
      drag.lastX = e.clientX;
      drag.lastT = now;
      m.offset = drag.offset - dx;
      pause();
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.active || performance.now() - drag.lastT > 80) m.velocity = 0;
      drag = null;
      vp.classList.remove("is-dragging");
      pause();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      m.hover = false;
      m.pausedUntil = Math.min(m.pausedUntil, Date.now() + 600);
    };
    // Trackpad sideways swipes move the row; plain vertical wheel still scrolls the page.
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      m.target = null;
      m.velocity = 0;
      m.offset += e.deltaX;
      pause();
    };
    vp.addEventListener("pointerdown", down);
    vp.addEventListener("pointermove", move);
    vp.addEventListener("pointerup", up);
    vp.addEventListener("pointercancel", up);
    vp.addEventListener("pointerleave", leave);
    vp.addEventListener("wheel", wheel, { passive: false });
    vp.addEventListener("focusin", pause);

    let raf = 0;
    let last = performance.now();
    let drawn = NaN;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (!drag?.active) {
        if (m.target !== null) {
          // Ease towards the arrow-button target.
          const d = m.target - m.offset;
          m.offset += d * Math.min(1, dt * 9);
          if (Math.abs(d) < 0.5) { m.offset = m.target; m.target = null; }
        } else if (Math.abs(m.velocity) > 8) {
          // Momentum after a swipe, decaying smoothly.
          m.offset += m.velocity * dt;
          m.velocity *= Math.pow(0.03, dt);
        } else if (!reduced && onScreen && !document.hidden && !m.hover && Date.now() > m.pausedUntil) {
          m.velocity = 0;
          m.offset += AUTO_SPEED * dt;
        }
      }
      // Keep the offset inside one set; shift drag and target references with it.
      if (setWidth && (m.offset >= setWidth || m.offset < 0)) {
        const shift = Math.floor(m.offset / setWidth) * setWidth;
        m.offset -= shift;
        if (m.target !== null) m.target -= shift;
        if (drag) drag.offset -= shift;
      }
      if (m.offset !== drawn) {
        tr.style.transform = `translate3d(${-m.offset}px, 0, 0)`;
        drawn = m.offset;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      vp.removeEventListener("pointerdown", down);
      vp.removeEventListener("pointermove", move);
      vp.removeEventListener("pointerup", up);
      vp.removeEventListener("pointercancel", up);
      vp.removeEventListener("pointerleave", leave);
      vp.removeEventListener("wheel", wheel);
      vp.removeEventListener("focusin", pause);
    };
  }, []);

  return <section id="results" className="erz-results erz-section">
    <div className="erz-container erz-results-head">
      <div><span className="erz-label">ERASMUS MUNDUS RESULTS</span><h2>Our students, selected.</h2></div>
      <div className="erz-carousel-nav">
        <button type="button" onClick={() => page(-1)} aria-label="Previous students"><ArrowLeft size={18} /></button>
        <button type="button" onClick={() => page(1)} aria-label="Next students"><ArrowRight size={18} /></button>
      </div>
    </div>
    <dl className="erz-container erz-stats">{stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
    <div className="erz-story-viewport" ref={viewport}>
      <div className="erz-story-track" ref={track} role="list" aria-label="Erasmus Mundus success stories">
        {successStories.map(story => <StoryCard story={story} key={story.name} />)}
        {successStories.map(story => <StoryCard story={story} clone key={`${story.name}-clone`} />)}
      </div>
    </div>
    <p className="erz-container erz-swipe-hint" aria-hidden="true">Swipe to see more <ArrowRight size={14} /></p>
  </section>;
};

const OfferSection = () => <section id="support" className="erz-offer-section"><div className="erz-container erz-section">
  <div className="erz-offer-top"><div><span className="erz-label">APPLICATION SUPPORT</span><h2>Less paperwork.<br />More support.</h2></div><div className="erz-price"><strong>{inr(PRICE)}</strong><span>mentorship + up to 3 programme applications</span></div></div>
  <article className="erz-mentor">
    <span className="erz-mentor-icon"><UserRound size={28} aria-hidden="true" /></span>
    <div>
      <span className="erz-mentor-tag">At the heart of the package</span>
      <h3>Your own 1:1 mentor</h3>
      <p>One mentor works with you personally from shortlisting programmes to submitting every application, so you always know what to do next.</p>
    </div>
  </article>
  <div className="erz-benefits">{[
    { Icon: FilePenLine, title: "Tell your story", copy: "SOP and recommendation-letter support" },
    { Icon: FileCheck2, title: "Get application-ready", copy: "Document checks and application filing" },
    { Icon: Headphones, title: "Stay on track", copy: "Every intake and deadline tracked for you" },
  ].map(({ Icon, title, copy }) => <article key={title}><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div>
  <details className="erz-inclusions"><summary>See everything included <ChevronDown size={18} /></summary><div>{inclusions.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div></details>
  <div className="erz-offer-actions"><Link to={programmesPath} className="erz-button erz-dark">Choose your programmes <ArrowRight size={18} /></Link><p>Need help choosing? <a href="#erasmus-form">Talk to us for free.</a></p></div>
</div></section>;

const faqs = [
  { q: "Am I eligible?", a: "Each programme has its own degree, subject and English-language requirements. Talk to us about your background so we can help you check your options." },
  { q: `What does ${inr(PRICE)} include?`, a: "One mentorship package covering up to 3 programme applications (the maximum the EU allows per intake): a dedicated mentor, SOPs, recommendation letters, document checklists, filing and deadline tracking for each programme." },
  { q: "When should I apply?", a: "Deadlines vary by programme and intake. Our team can help you check the dates and plan your documents for the programmes you choose." },
  { q: "Is a scholarship guaranteed?", a: "No. We help you prepare and submit your application. Each programme makes its own admission and scholarship decisions." },
];

const ApplicationErasmus = () => {
  const isDesktop = useIsDesktop();
  const [showMobileCta, setShowMobileCta] = useState(false);
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Erasmus Mundus Application Support | OnePercent Abroad";
    const hero = document.querySelector(".erz-video-hero");
    const form = document.getElementById("erasmus-form");
    let heroVisible = true;
    let formVisible = false;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        if (entry.target === form) formVisible = entry.isIntersecting;
      }
      setShowMobileCta(!heroVisible && !formVisible);
    });
    // Arriving from a programme page's "Talk to a counsellor" link.
    if (window.location.hash === "#erasmus-form") form?.scrollIntoView({ block: "center" });
    if (hero) observer.observe(hero);
    if (form) observer.observe(form);
    return () => { document.title = previousTitle; observer.disconnect(); };
  }, [isDesktop]);

  return <main className="erasmus-page">
    <ErasmusLoader />
    <header className="erz-header"><div className="erz-container">
      <Link to="/" aria-label="OnePercent Abroad home"><img src={logoWhite} alt="OnePercent Abroad" width="150" height="40" /></Link>
      <nav aria-label="Erasmus navigation"><a href="#results">Results</a><a href="#stories">Student reviews</a><a href="#support">What’s included</a><a href="#FaqSection">FAQs</a></nav>
      <a className="erz-header-cta" href="#erasmus-form">Free consultation <ArrowRight size={16} /></a>
    </div></header>
    <HeroSection isDesktop={isDesktop} />
    <StoriesSection />
    <ReviewsSection />
    <OfferSection />
    {!isDesktop && <section className="erz-container erz-section erz-contact-section"><div className="erz-contact-copy"><span className="erz-label">LET’S TALK</span><h2>Not sure where<br />to start?</h2><p>Tell us a little about yourself.<br />Our team will call to discuss your options.</p><span className="erz-free-note"><CheckCircle2 size={18} /> Free consultation. No payment needed.</span></div><FormSection /></section>}
    <section id="FaqSection" className="erz-faq-section"><div className="erz-container erz-section erz-faq-layout"><div><span className="erz-label">A FEW QUICK ANSWERS</span><h2>Before you apply.</h2></div><div>{faqs.map(faq => <details className="erz-faq" key={faq.q}><summary>{faq.q}<ChevronDown size={19} /></summary><p>{faq.a}</p></details>)}</div></div></section>
    <Footer />
    {showMobileCta && <div className="erz-mobile-actions"><a href="#erasmus-form">Talk to an expert — free <ArrowRight size={18} /></a></div>}
  </main>;
};

export default ApplicationErasmus;

const FormSection = ({ variant = "section" }: { variant?: "section" | "hero" }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^[+\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) {
      setError("Enter a valid phone number, including your country code."); return;
    }
    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("erasmus_call_requests" as never)
        .insert({ name: name.trim(), phone: phone.trim(), source: "erasmus" } as never);
      if (insertError) throw insertError;
      // Ads conversion. Parameterised so the Erasmus campaign can be optimised on
      // its own custom conversion — /get-started fires a bare Lead on the same pixel.
      trackMetaEvent("Lead", {
        content_name: "Erasmus Callback Request",
        content_category: "erasmus",
        form_location: variant === "hero" ? "hero" : "section",
      });
      setSubmitted(true);
    } catch {
      setError("We couldn't send your request. Please try again. Your details are still here.");
    } finally { setSubmitting(false); }
  };
  const heroVariant = variant === "hero";
  return <aside className={heroVariant ? "erz-enquiry erz-enquiry-hero" : "erz-enquiry"} id="erasmus-form" aria-labelledby="enquiry-title">
    {submitted ? <div className="erz-success" role="status">
      <CheckCircle2 size={48} aria-hidden="true" />
      <h2 id="enquiry-title">You're on our callback list.</h2>
      <p>Thanks, {name.trim().split(" ")[0]}. Our Erasmus team will contact you on <strong>{phone}</strong> to discuss your next steps.</p>
      <Link className="erz-form-submit" to="/application/erasmus/programs">Explore programmes <ArrowRight size={18} /></Link>
    </div> : <>
      <h2 id="enquiry-title">Request a free call</h2>
      {heroVariant && <p className="erz-hero-note"><CheckCircle2 size={16} aria-hidden="true" /> Free consultation. No payment needed.</p>}
      <form onSubmit={handleSubmit} aria-busy={submitting}>
        <label htmlFor="erasmus-name">Your name</label>
        <input id="erasmus-name" name="name" value={name} onChange={e => setName(e.target.value)} placeholder="Full name" autoComplete="name" required maxLength={120} disabled={submitting} />
        <label htmlFor="erasmus-phone">Phone number <span>with country code</span></label>
        <input id="erasmus-phone" name="phone" value={phone} onChange={e => { setPhone(e.target.value); setError(""); }} placeholder="+91 98765 43210" type="tel" inputMode="tel" autoComplete="tel" required maxLength={25} disabled={submitting} aria-describedby={error ? "erasmus-error" : undefined} />
        {error && <p id="erasmus-error" className="erz-error" role="alert">{error}</p>}
        <button className="erz-form-submit" type="submit" disabled={submitting}>{submitting ? "Sending your request..." : "Request a free call"}{!submitting && <ArrowRight size={18} aria-hidden="true" />}</button>
        <p className="erz-consent">By submitting, you agree to be contacted about your Erasmus enquiry. Read our <Link to="/privacy-policy">Privacy Policy</Link>.</p>
      </form>
    </>}
  </aside>;
};
