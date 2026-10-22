import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, ChevronDown, FileCheck2, FilePenLine, Headphones, UserRound, XCircle } from "lucide-react";
import "./ApplicationErasmus.css";
import logoWhite from "@/assets/logo-white.png";
import Footer from "@/components/Footer";
import { ErasmusLoader, PhotoCollage, StarRing } from "@/components/ErasmusHeroBackdrop";
import { supabase } from "@/integrations/supabase/client";
import { inclusions, PRICE, successStories, SuccessStory } from "@/lib/erasmusData";
import { getMetaMatchData, trackMetaCustomEvent, trackMetaEvent } from "@/lib/metaPixel";
import { getUtms } from "@/lib/utm";

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
      <span className="erz-intake"><span aria-hidden="true" /> September 2027 intake · applications open</span>
      <h1 id="erasmus-title">Apply for an <em>Erasmus Mundus</em> master’s.</h1>
      <p>A dedicated <strong className="erz-hero-mentor">1:1 mentor</strong> guides your shortlist, SOPs, LORs and applications for up to 3 programmes.</p>
      <ul className="erz-hero-proof">
        <li><strong>30–40%</strong> of our students get in, vs 3–4% overall</li>
        <li><strong>{inr(PRICE)}</strong> full package · first call free</li>
      </ul>
    </div>
    <div className="erz-hero-actions">
      <a className="erz-button erz-primary" href="#erasmus-form">Book a free call <ArrowRight size={18} /></a>
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
    <blockquote>“{review.excerpt}”</blockquote>
    <div className="erz-review-person"><img src={review.image} alt={review.name} width="64" height="64" loading="lazy" /><div><h3>{review.name}</h3><p>{review.programme}</p><span>Erasmus Mundus</span></div></div>
    <details className="erz-full-review"><summary><span className="erz-read-more">Read full review</span><span className="erz-read-less">Close full review</span><ChevronDown size={16} /></summary><p>“{review.full}”</p></details>
  </article>)}</div>
</section>;

const initials = (name: string) => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();

// Bars share one 0–40% scale so their lengths keep the real 10x ratio.
const odds = [
  { label: "Usual acceptance rate", value: "3-4%", fill: 3.5 / 40 },
  { label: "Our acceptance rate", value: "30-40%", fill: 35 / 40, ours: true },
];

// The comparison plays once, the first time it scrolls into view: the bars
// fill like loading bars while the headline's multiplier counts up to 10x.
const OddsSection = () => {
  const wrap = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!shown) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setMultiplier(10); return; }
    // Timed to match the blue bar: .25s delay, 1.8s ease-out fill.
    const DELAY = 250, DURATION = 1800;
    const begin = performance.now() + DELAY;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(Math.max((now - begin) / DURATION, 0), 1);
      setMultiplier(Math.max(1, Math.round(10 * (1 - Math.pow(1 - t, 3)))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shown]);
  const done = multiplier === 10;
  return <div className={shown ? "erz-container erz-odds is-shown" : "erz-container erz-odds"} ref={wrap}>
    <div className="erz-odds-copy">
      <span className="erz-label">ERASMUS MUNDUS RESULTS</span>
      <h2>Improve your chances <span className={done ? "erz-tenx is-done" : "erz-tenx"}><span className="erz-sr">10x</span><span aria-hidden="true">{multiplier}x</span></span></h2>
      <p>Erasmus Mundus is one of the most competitive scholarship programmes in the world. A dedicated mentor changes the odds.</p>
    </div>
    <dl className="erz-odds-card">
      {odds.map(row => <div key={row.label} className={row.ours ? "erz-odds-row is-ours" : "erz-odds-row"}>
        <dt>{row.label}</dt>
        <dd>{row.value}</dd>
        <span className="erz-odds-bar" aria-hidden="true"><span style={{ width: `${row.fill * 100}%` }} /></span>
      </div>)}
    </dl>
  </div>;
};

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
    <OddsSection />
    <div className="erz-container erz-results-head">
      <h3>Students we have helped</h3>
      <div className="erz-carousel-nav">
        <button type="button" onClick={() => page(-1)} aria-label="Previous students"><ArrowLeft size={18} /></button>
        <button type="button" onClick={() => page(1)} aria-label="Next students"><ArrowRight size={18} /></button>
      </div>
    </div>
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

// Spells out who the paid package suits, so the people who still ask for a
// call already know the price and the bar.
const fit = {
  yes: [
    "You have a bachelor’s, or will finish one by mid-2027",
    "You’re aiming for the September 2027 or 2028 intake",
    "You want an expert beside you for SOPs, LORs and filing",
    `You’re ready to invest ${inr(PRICE)} in getting it right`,
  ],
  no: [
    "You’re more than a year away from finishing your bachelor’s",
    "You only want general information, not hands-on help",
    "You’re looking for someone to guarantee a scholarship. No one honestly can",
  ],
};

const FitSection = () => <section className="erz-container erz-section erz-fit" aria-labelledby="fit-title">
  <div className="erz-section-heading"><span className="erz-label">IS THIS FOR YOU?</span><h2 id="fit-title">Built for serious applicants.</h2></div>
  <div className="erz-fit-grid">
    <article className="erz-fit-card is-yes"><h3>A great fit if</h3><ul>{fit.yes.map(item => <li key={item}><CheckCircle2 size={20} aria-hidden="true" />{item}</li>)}</ul></article>
    <article className="erz-fit-card"><h3>Probably not for you if</h3><ul>{fit.no.map(item => <li key={item}><XCircle size={20} aria-hidden="true" />{item}</li>)}</ul></article>
  </div>
  <p className="erz-deadline-note"><CalendarClock size={20} aria-hidden="true" /><span>Most Erasmus Mundus programmes close applications between <strong>October and January</strong> for the following September. Strong SOPs and LORs take weeks, so start early.</span></p>
  <a className="erz-button erz-dark" href="#erasmus-form">Book a free call <ArrowRight size={18} /></a>
</section>;

const faqs = [
  { q: "What happens on the free call?", a: "An Erasmus expert reviews your degree, CGPA and goals, suggests programmes that fit, and maps the deadlines for your intake. If the mentorship package suits you, they'll walk you through it. There's no obligation to sign up." },
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
      <a className="erz-header-cta" href="#erasmus-form">Book a call <ArrowRight size={16} /></a>
    </div></header>
    <HeroSection isDesktop={isDesktop} />
    <StoriesSection />
    <ReviewsSection />
    <OfferSection />
    <FitSection />
    {!isDesktop && <section className="erz-container erz-section erz-contact-section"><div className="erz-contact-copy"><span className="erz-label">FREE 1:1 CALL</span><h2>Talk to an<br />Erasmus expert.</h2><p>Answer a few questions about your profile.<br />An Erasmus expert will call to walk you through your options.</p></div><FormSection /></section>}
    <section id="FaqSection" className="erz-faq-section"><div className="erz-container erz-section erz-faq-layout"><div><span className="erz-label">A FEW QUICK ANSWERS</span><h2>Before you apply.</h2></div><div>{faqs.map(faq => <details className="erz-faq" key={faq.q}><summary>{faq.q}<ChevronDown size={19} /></summary><p>{faq.a}</p></details>)}</div></div></section>
    <Footer />
    {showMobileCta && <div className="erz-mobile-actions"><a href="#erasmus-form">Book a free call <ArrowRight size={18} /></a></div>}
  </main>;
};

export default ApplicationErasmus;

// Same labels as /get-started, so the CRM groups both forms' budgets together.
const BUDGET_OPTIONS = ["5 to 15 Lakhs", "15 to 40 L", "40 to 70 L", "70+ L"];
const HELP_OPTIONS = ["Free guidance on my profile", "Choosing the right programmes", "SOP / document review only", "Scholarship & funding advice", "Something else"];
const EDUCATION_OPTIONS = ["Final-year bachelor's", "Bachelor's completed", "Master's completed", "1st–3rd year of bachelor's"];
const START_OPTIONS = ["September 2027", "September 2028", "Just exploring"];
const FORM_STEPS = ["Your profile", "Your plans", "Your details"];

// Sales calls Hot leads first. Hot = wants the paid package, is applying in the
// next two intakes, and has (or is about to have) the bachelor's EM requires.
const leadPriority = (education: string, start: string, wantsPackage: string) => {
  const eligible = education !== EDUCATION_OPTIONS[3];
  const soon = start !== "Just exploring";
  if (wantsPackage === "Yes" && eligible && soon) return "Hot";
  if (wantsPackage === "Yes" || (eligible && soon)) return "Warm";
  return "Cold";
};

const ChoiceGroup = ({ legend, name, options, value, onChange, disabled }: { legend: string; name: string; options: string[]; value: string; onChange: (v: string) => void; disabled: boolean }) =>
  <fieldset className="erz-choices">
    <legend>{legend}</legend>
    <div>{options.map(opt => <label key={opt} className={value === opt ? "is-selected" : undefined}>
      <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)} disabled={disabled} required />{opt}
    </label>)}</div>
  </fieldset>;

const FormSection = ({ variant = "section" }: { variant?: "section" | "hero" }) => {
  const [step, setStep] = useState(0);
  const [education, setEducation] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [start, setStart] = useState("");
  const [budget, setBudget] = useState("");
  const [wantsPackage, setWantsPackage] = useState("");
  const [helpNeeded, setHelpNeeded] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const stepHeading = useRef<HTMLParagraphElement>(null);
  const movedStep = useRef(false);
  useEffect(() => {
    // Move focus with the step (not on first render) so keyboard and screen-reader users follow along.
    if (movedStep.current) stepHeading.current?.focus({ preventScroll: true });
    movedStep.current = true;
  }, [step]);
  const pick = (set: (v: string) => void) => (v: string) => { set(v); setError(""); };

  // Each step's own check; returns the first problem, or "" when it can move on.
  const stepError = (s: number) => {
    if (s === 0) {
      if (!education) return "Tell us where you are in your studies.";
      if (!cgpa.trim()) return "Please enter your CGPA or percentage.";
    }
    if (s === 1) {
      if (!start) return "Pick when you'd like to start.";
      if (!budget) return "Please pick your budget range.";
      if (!wantsPackage) return "Let us know if you're looking for the mentorship package.";
      if (wantsPackage === "No" && !helpNeeded) return "Tell us what you'd like help with.";
    }
    if (s === 2) {
      const digits = phone.replace(/\D/g, "");
      if (!name.trim()) return "Please enter your name.";
      if (!/^[+\d\s().-]+$/.test(phone) || digits.length < 7 || digits.length > 15) return "Enter a valid phone number, including your country code.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
    }
    return "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const problem = stepError(step);
    setError(problem);
    if (problem) return;
    if (step < FORM_STEPS.length - 1) { setStep(step + 1); return; }
    const priority = leadPriority(education, start, wantsPackage);
    setSubmitting(true);
    try {
      // The row is forwarded to the CRM, so carry the ad attribution with it: the
      // utm_* tags from the ad or collab landing URL, plus the Meta ids the CRM later
      // uses to report Interested leads back (meta_event_id dedups against the Pixel Lead).
      const metaEventId = crypto.randomUUID();
      const { error: insertError } = await supabase.from("erasmus_call_requests" as never)
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim().toLowerCase(),
          source: "erasmus",
          form_location: variant === "hero" ? "hero" : "section",
          // academic_score / investment_budget / investment_readiness are the CRM's
          // own lead columns, so these land on the lead as-is.
          academic_score: cgpa.trim(),
          investment_budget: budget,
          investment_readiness: wantsPackage === "Yes" ? `Wants mentorship package (${inr(PRICE)})` : "Not looking for the package",
          help_needed: wantsPackage === "No" ? helpNeeded : null,
          // start_year is also a CRM lead column; education_status and
          // lead_priority reach the lead's raw_payload.
          education_status: education,
          start_year: start,
          lead_priority: priority,
          ...getUtms(),
          ...getMetaMatchData(),
          meta_event_id: metaEventId,
        } as never);
      if (insertError) throw insertError;
      // Ads conversion. Parameterised so the Erasmus campaign can be optimised on
      // its own custom conversion — /get-started fires a bare Lead on the same pixel.
      trackMetaEvent("Lead", {
        content_name: "Erasmus Callback Request",
        content_category: "erasmus",
        form_location: variant === "hero" ? "hero" : "section",
      }, { eventID: metaEventId });
      // A second, narrower signal so the ad sets can optimise for buyers rather
      // than every form fill: make a custom conversion on this event in Ads Manager.
      if (priority === "Hot") trackMetaCustomEvent("ErasmusHotLead", {
        content_name: "Erasmus Callback Request",
        content_category: "erasmus",
        value: PRICE,
        currency: "INR",
      });
      setSubmitted(true);
    } catch {
      setError("We couldn't send your request. Please try again. Your details are still here.");
    } finally { setSubmitting(false); }
  };
  const heroVariant = variant === "hero";
  const lastStep = step === FORM_STEPS.length - 1;
  const firstName = name.trim().split(" ")[0];
  return <aside className={heroVariant ? "erz-enquiry erz-enquiry-hero" : "erz-enquiry"} id="erasmus-form" aria-labelledby="enquiry-title">
    {submitted ? <div className="erz-success" role="status">
      <CheckCircle2 size={48} aria-hidden="true" />
      <h2 id="enquiry-title">You're on our callback list.</h2>
      <p>Thanks, {firstName}. An Erasmus expert will call you on <strong>{phone}</strong>. Keep your transcripts handy. On the call we'll:</p>
      <ol className="erz-next-steps">
        <li>Check your profile against Erasmus Mundus entry requirements</li>
        <li>Suggest programmes that fit your degree and CGPA</li>
        <li>Map the deadlines for your {start === "Just exploring" ? "target" : start} intake</li>
      </ol>
      <Link className="erz-form-submit" to="/application/erasmus/programs">Explore programmes while you wait <ArrowRight size={18} /></Link>
    </div> : <>
      <h2 id="enquiry-title">Book a free call with us</h2>
      <p className="erz-hero-note"><CheckCircle2 size={16} aria-hidden="true" /> 3 quick steps. Free call with an expert.</p>
      <div className="erz-steps" aria-hidden="true">{FORM_STEPS.map((label, i) => <span key={label} className={i <= step ? "is-done" : undefined} />)}</div>
      <p className="erz-step-label" ref={stepHeading} tabIndex={-1}>Step {step + 1} of {FORM_STEPS.length}: <strong>{FORM_STEPS[step]}</strong></p>
      <form onSubmit={handleSubmit} aria-busy={submitting} noValidate>
        {step === 0 && <>
          <ChoiceGroup legend="Where are you in your studies?" name={`education-${variant}`} options={EDUCATION_OPTIONS} value={education} onChange={pick(setEducation)} disabled={submitting} />
          <label htmlFor={`erasmus-cgpa-${variant}`}>Your CGPA <span>or percentage</span></label>
          <input id={`erasmus-cgpa-${variant}`} name="cgpa" value={cgpa} onChange={e => pick(setCgpa)(e.target.value)} placeholder="e.g. 8.2 / 10 or 78%" maxLength={40} />
        </>}
        {step === 1 && <>
          <ChoiceGroup legend="When do you want to start your master's?" name={`start-${variant}`} options={START_OPTIONS} value={start} onChange={pick(setStart)} disabled={submitting} />
          <ChoiceGroup legend="Your total study budget" name={`budget-${variant}`} options={BUDGET_OPTIONS} value={budget} onChange={pick(setBudget)} disabled={submitting} />
          <div className="erz-package-pitch">
            <p className="erz-package-pitch-title"><strong>10x</strong> your chances with Erasmus Mundus</p>
            <p>30–40% of our students get in, vs 3–4% overall.</p>
            <ul>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Your own 1:1 mentor</li>
              <li><CheckCircle2 size={15} aria-hidden="true" /> SOPs and LORs written with you</li>
              <li><CheckCircle2 size={15} aria-hidden="true" /> Filing for up to 3 programmes</li>
            </ul>
            <p className="erz-package-pitch-price"><strong>{inr(PRICE)}</strong> full package</p>
          </div>
          <ChoiceGroup legend="Are you interested in our Erasmus Mundus package?" name={`package-${variant}`} options={["Yes", "No"]} value={wantsPackage} onChange={pick(setWantsPackage)} disabled={submitting} />
          {wantsPackage === "Yes" && <p className="erz-package-note"><CheckCircle2 size={16} aria-hidden="true" /> Great. We’ll walk you through the package on your free call.</p>}
          {wantsPackage === "No" && <ChoiceGroup legend="What would you like help with?" name={`help-${variant}`} options={HELP_OPTIONS} value={helpNeeded} onChange={pick(setHelpNeeded)} disabled={submitting} />}
        </>}
        {lastStep && <>
          <label htmlFor={`erasmus-name-${variant}`}>Your name</label>
          <input id={`erasmus-name-${variant}`} name="name" value={name} onChange={e => pick(setName)(e.target.value)} placeholder="Full name" autoComplete="name" maxLength={120} disabled={submitting} />
          <label htmlFor={`erasmus-phone-${variant}`}>Phone number <span>with country code</span></label>
          <input id={`erasmus-phone-${variant}`} name="phone" value={phone} onChange={e => pick(setPhone)(e.target.value)} placeholder="+91 98765 43210" type="tel" inputMode="tel" autoComplete="tel" maxLength={25} disabled={submitting} aria-describedby={error ? "erasmus-error" : undefined} />
          <label htmlFor={`erasmus-email-${variant}`}>Email</label>
          <input id={`erasmus-email-${variant}`} name="email" value={email} onChange={e => pick(setEmail)(e.target.value)} placeholder="you@example.com" type="email" inputMode="email" autoComplete="email" maxLength={160} disabled={submitting} aria-describedby={error ? "erasmus-error" : undefined} />
        </>}
        {error && <p id="erasmus-error" className="erz-error" role="alert">{error}</p>}
        <div className="erz-form-nav">
          {step > 0 && <button type="button" className="erz-form-back" onClick={() => { setError(""); setStep(step - 1); }} disabled={submitting}><ArrowLeft size={18} aria-hidden="true" /><span className="erz-sr">Back</span></button>}
          <button className="erz-form-submit" type="submit" disabled={submitting}>{submitting ? "Sending your request..." : lastStep ? "Book my free call" : "Continue"}{!submitting && <ArrowRight size={18} aria-hidden="true" />}</button>
        </div>
        {lastStep && <p className="erz-consent">By submitting, you agree to be contacted about your Erasmus enquiry. Read our <Link to="/privacy-policy">Privacy Policy</Link>.</p>}
      </form>
    </>}
  </aside>;
};
