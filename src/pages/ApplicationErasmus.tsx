import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ChevronDown, FileCheck2, FilePenLine, Headphones, Pause, Play, Quote, Volume2, VolumeX } from "lucide-react";
import "./ApplicationErasmus.css";
import logoWhite from "@/assets/logo-white.png";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { inclusions, PRICE } from "@/lib/erasmusData";

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

// Desktop pairs the campus backdrop with the callback form; mobile keeps the
// full-bleed video hero and its playback controls.
const HeroSection = ({ isDesktop }: { isDesktop: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) video.pause();
      else void video.play().catch(() => setPlaying(false));
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, [isDesktop]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
  };

  return <section className="erz-video-hero" aria-labelledby="erasmus-title">
    <div className="erz-speaker-frame">
      {!isDesktop && <video ref={videoRef} className="erz-hero-video" muted={muted} loop playsInline preload="metadata" poster="/erasmus-hero.jpg" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onVolumeChange={event => setMuted(event.currentTarget.muted)} onError={() => setVideoFailed(true)} aria-label="Erasmus study abroad film">
        <source src="/erasmus-hero.mp4" type="video/mp4" onError={() => setVideoFailed(true)} />
      </video>}
    </div>
    <div className="erz-container erz-hero-layout">
    <div className="erz-hero-content">
      <span className="erz-eyebrow">YOUR NEXT CHAPTER</span>
      <h1 id="erasmus-title">Apply for an <em>Erasmus Mundus</em> master’s.</h1>
      <p>Get help with your shortlist, documents and application.</p>
    </div>
    <div className="erz-hero-actions">
      <a className="erz-button erz-primary" href="#erasmus-form">Talk to an expert — free <ArrowRight size={18} /></a>
      <Link className="erz-hero-link" to={programmesPath}>Browse programmes <ArrowRight size={16} /></Link>
    </div>
    {isDesktop && <FormSection variant="hero" />}
    </div>
    {!isDesktop && !videoFailed && <div className="erz-video-controls" aria-label="Video controls">
      <button type="button" onClick={togglePlayback} aria-label={playing ? "Pause video" : "Play video"}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
      <button type="button" onClick={toggleSound} aria-label={muted ? "Unmute video" : "Mute video"} aria-pressed={!muted}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
    </div>}
  </section>;
};

// Exact excerpts and full reviews from the site's existing student testimonials.
const reviews = [
  {
    name: "Sisa Maria Sunny",
    programme: "Journalism, Media and Globalization",
    image: "/images/testimonials/SISA MARIA SUNNY.png",
    excerpt: "They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
    full: "I never thought that I could achieve this. I have approached many agencies, and I finally came to 1%abroad. They helped me with my confidence and cleared my self-doubts in all stages, it has been very helpful.",
  },
  {
    name: "Amaresh",
    programme: "EMINENT",
    image: "/images/testimonials/AMARESH.png",
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

const OfferSection = () => <section id="support" className="erz-offer-section"><div className="erz-container erz-section">
  <div className="erz-offer-top"><div><span className="erz-label">APPLICATION SUPPORT</span><h2>Less paperwork.<br />More support.</h2></div><div className="erz-price"><strong>{inr(PRICE)}</strong><span>per programme application</span></div></div>
  <div className="erz-benefits">{[
    { Icon: FilePenLine, title: "Tell your story", copy: "SOP and recommendation-letter support" },
    { Icon: FileCheck2, title: "Get application-ready", copy: "Document checks and application filing" },
    { Icon: Headphones, title: "Stay on track", copy: "Deadline tracking and mentor support" },
  ].map(({ Icon, title, copy }) => <article key={title}><Icon size={25} aria-hidden="true" /><h3>{title}</h3><p>{copy}</p></article>)}</div>
  <details className="erz-inclusions"><summary>See everything included <ChevronDown size={18} /></summary><div>{inclusions.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.desc}</p></article>)}</div></details>
  <div className="erz-offer-actions"><Link to={programmesPath} className="erz-button erz-dark">Choose your programmes <ArrowRight size={18} /></Link><p>Need help choosing? <a href="#erasmus-form">Talk to us for free.</a></p></div>
</div></section>;

const faqs = [
  { q: "Am I eligible?", a: "Each programme has its own degree, subject and English-language requirements. Talk to us about your background so we can help you check your options." },
  { q: `What does ${inr(PRICE)} include?`, a: "Support for one application: your SOP, recommendation letters, document checklist, filing, deadline tracking and a dedicated mentor. Each additional programme is a separate application." },
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
    if (hero) observer.observe(hero);
    if (form) observer.observe(form);
    return () => { document.title = previousTitle; observer.disconnect(); };
  }, [isDesktop]);

  return <main className="erasmus-page">
    <header className="erz-header"><div className="erz-container">
      <Link to="/" aria-label="OnePercent Abroad home"><img src={logoWhite} alt="OnePercent Abroad" width="150" height="40" /></Link>
      <nav aria-label="Erasmus navigation"><a href="#stories">Student reviews</a><a href="#support">What’s included</a><a href="#FaqSection">FAQs</a></nav>
      <a className="erz-header-cta" href="#erasmus-form">Free consultation <ArrowRight size={16} /></a>
    </div></header>
    <HeroSection isDesktop={isDesktop} />
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
