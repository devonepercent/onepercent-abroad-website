import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import Testimonials from "@/components/Testimonials";
import Achievers from "@/components/Achievers";
import FAQ from "@/components/FAQ";
import NewsletterSection from "@/components/NewsletterSection";
import NewsletterPopup from "@/components/NewsletterPopup";
import "./Home.css";

// Mega cards: top student outcomes
const megaStudents = [
  { name: "Ahmed Shoeb Hashmi", badge: "Johns Hopkins · USA",  outcome: "$116,000 · ₹1 crore+ Sommer Scholarship", detail: "Master of Public Health · Johns Hopkins Bloomberg School of Public Health.", image: "/images/mega/ahmed-shoeb-hashmi.jpg" },
  { name: "Anjana Sunanda",     badge: "Erasmus Mundus",       outcome: "Erasmus Mundus Joint Master’s",          detail: "GLODEP · Global Development Policy · Palacký University Olomouc.",          image: "/images/mega/anjana-sunanda.jpg" },
  { name: "Muhammed Aaquib Husain Shad", badge: "Loughborough · UK",    outcome: "MSc offer",                               detail: "MSc Digital Finance and Artificial Intelligence · Loughborough University.", image: "/images/mega/muhammed-aaquib.jpg" },
  { name: "Jinsa Jobe",         badge: "Erasmus Mundus",       outcome: "50% scholarship",                         detail: "Joint Master in Sustainable Food Processing, Circular Food Systems and Future Foods.", image: "/images/mega/jinsa-jobe.jpg" },
  { name: "Tanab Mehraj",       badge: "Erasmus Mundus",       outcome: "Selected for the 2026 cohort",            detail: "IMBRSea · International Master in Marine Biological Resources.",            image: "/images/mega/tanab-mehraj.jpg" },
  { name: "Fidha Nourin",       badge: "3 UG offers",          outcome: "3 undergraduate offers",                  detail: "Industrial Engineering · American University of Sharjah (UAE), TU Eindhoven (Netherlands), Arizona State University (USA).", image: "/images/mega/fidha-nourin.jpg" },
];

const intents = [
  { title: "A top global university",     cta: "Explore strategy",     icon: <path d="M3 21h18M5 21V8l7-4 7 4v13M9 12h6M9 16h6" /> },
  { title: "A fully funded scholarship",  cta: "Explore scholarships", icon: <path d="M12 3v18M7 7.5A4 4 0 0 1 11 4h2a4 4 0 0 1 0 8h-2a4 4 0 0 0 0 8h2a4 4 0 0 0 4-3.5" /> },
  { title: "The right university abroad", cta: "Find my route",        icon: <><path d="M12 21s7-5.1 7-12A7 7 0 1 0 5 9c0 6.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2" /></> },
  { title: "A stronger profile",          cta: "Assess my profile",    icon: <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" /> },
];

const journeySteps = [
  { title: "Understand the profile",  note: "Start with evidence, not assumptions.",      threshold: 0.02, icon: <><circle cx="12" cy="7" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></> },
  { title: "Define ambition",         note: "Set the right level of target.",             threshold: 0.19, icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="m15 9 6-6" /></> },
  { title: "Identify gaps",           note: "Find what is missing before applications.",  threshold: 0.37, icon: <><circle cx="10" cy="10" r="6" /><path d="m15 15 6 6M10 7v6M7 10h6" /></> },
  { title: "Develop the profile",     note: "Build stronger evidence and exposure.",      threshold: 0.55, icon: <><path d="M12 21V9" /><path d="M12 14c-5 0-8-3-8-8 5 0 8 3 8 8Zm0-3c5 0 8-3 8-8-5 0-8 3-8 8Z" /></> },
  { title: "Shortlist strategically", note: "Balance ambition, fit and funding.",         threshold: 0.73, icon: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2" /></> },
  { title: "Build the application",   note: "Turn the profile into a coherent case.",     threshold: 0.90, icon: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></> },
];

const JOURNEY_PATH = "M120 58 C760 68 790 170 600 232 C340 315 170 270 190 385 C210 505 790 420 720 555 C660 680 265 615 205 745 C165 825 575 795 770 880";

const pathways = [
  { title: "Erasmus Mundus", desc: "Joint master’s programmes across Europe with competitive scholarship pathways.", to: "/application/erasmus", cta: "Assess my fit", logo: "/images/pathways/erasmus.jpg" },
  { title: "DAAD",           desc: "Postgraduate and research funding routes for Germany.",                         to: "/get-started",         cta: "Get started", logo: "/images/pathways/daad.png" },
  { title: "Chevening",      desc: "Competitive UK scholarship route for high-potential applicants.",               to: "/get-started",         cta: "Get started", logo: "/images/pathways/chevening.png" },
];

const founder = {
  name: "Irshad M U",
  title: "Founder, OnePercent Abroad",
  bio: "Irshad M U founded OnePercent Abroad to make personalised mentorship accessible to ambitious students. He helps them prepare strong applications for top universities and scholarships.",
  photo: "/images/founder/irshad-mu.jpg",
};

const vision = "We provide mentorship to get admission to the top 1% universities.";

const aboutStats = [
  { value: "2+",    label: "Years of service" },
  { value: "300+",  label: "Students mentored" },
];

const ScholarshipCoverflow = () => {
  const n = megaStudents.length;
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 620);
  const paused = useRef(false);
  const drag = useRef<{ start: number; last: number } | null>(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 620);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current && !drag.current) setActive(a => (a + 1) % n);
    }, 2600);
    return () => clearInterval(id);
  }, [n, tick]);

  const goTo = (i: number) => { setActive((i + n) % n); setTick(t => t + 1); };

  const cardStyle = (i: number): React.CSSProperties => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    const ad = Math.abs(d);
    const x = d * (isMobile ? 145 : 190);
    return {
      transform: `translateX(${x}px) translateZ(${-ad * 90}px) rotateY(${d * -6}deg) scale(${1 - ad * 0.12})`,
      zIndex: 50 - ad,
      opacity: ad > 2 ? 0 : 1,
      filter: ad === 0 ? "brightness(1.07)" : "brightness(.66)",
    };
  };

  return (
    <section className="scholarship-showcase" id="stories">
      <div className="op-shell sch-head">
        <div className="op-eyebrow">Student outcomes</div>
        <h2>Our top students secured scholarships that changed what was possible.</h2>
      </div>
      <div
        className="coverflow"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
        onPointerDown={e => { drag.current = { start: e.clientX, last: e.clientX }; }}
        onPointerMove={e => { if (drag.current) drag.current.last = e.clientX; }}
        onPointerUp={() => {
          const d = drag.current; drag.current = null;
          if (d && Math.abs(d.last - d.start) > 35) goTo(active + (d.last < d.start ? 1 : -1));
        }}
        onPointerCancel={() => { drag.current = null; }}
      >
        {megaStudents.map((s, i) => (
          <article key={s.name} className="sch-card" style={cardStyle(i)} onClick={() => goTo(i)}>
            <img className="bgimg" src={s.image} alt={s.name} loading={i < 3 ? "eager" : "lazy"} draggable={false} />
            <div className="sch-card-content">
              <span className="badge">{s.badge}</span>
              <h3>{s.name}</h3>
              <div className="outcome">{s.outcome}</div>
              <p>{s.detail}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="sch-controls">
        <button className="circle-btn" aria-label="Previous student" onClick={() => goTo(active - 1)}>←</button>
        <button className="circle-btn" aria-label="Next student" onClick={() => goTo(active + 1)}>→</button>
      </div>
    </section>
  );
};

const Journey = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const box = boxRef.current, path = pathRef.current;
    if (!box || !path) return;
    const rect = box.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.72;
    const end = vh * 0.35 - rect.height;
    const p = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len * (1 - p)}`;
    setProgress(p);
  }, []);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  return (
    <section className="section journey-sec" id="journey">
      <div className="op-shell">
        <div className="section-head">
          <div className="op-eyebrow">The 1% journey</div>
          <h2>We don’t start with applications. We start with your profile.</h2>
        </div>
        <div className="journey" ref={boxRef}>
          <svg className="pathsvg" viewBox="0 0 940 930" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id="opJourneyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#61A2FE" /><stop offset=".6" stopColor="#065DC7" /><stop offset="1" stopColor="#010F70" />
              </linearGradient>
            </defs>
            <path className="basepath" d={JOURNEY_PATH} />
            <path className="activepath" ref={pathRef} d={JOURNEY_PATH} />
          </svg>
          {journeySteps.map((s, i) => (
            <div key={s.title} className={`j-node j${i + 1} ${progress >= s.threshold ? "active" : ""}`}>
              <div className="j-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">{s.icon}</svg></div>
              <div><h3>{s.title}</h3><small>{s.note}</small></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { hash } = useLocation();

  // Scroll to in-page anchors (e.g. /#stories from another page)
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, [hash]);

  return (
    <div className="op-site op-home">
      <SiteNav />

      <header className="op-shell hero">
        <div className="hero-inner">
          <div className="op-eyebrow">Admissions mentorship for ambitious Indian students</div>
          <h1>Build a profile that can go further.</h1>
          <p>Personalised strategy for Bachelor’s, Master’s, MBA and PhD applicants targeting exceptional universities, scholarships and global opportunities.</p>
          <div className="hero-actions">
            <Link className="op-btn primary" to="/get-started">Book a free call ↗</Link>
            <Link className="op-btn light" to="/services">Explore services</Link>
          </div>
        </div>
      </header>

      <ScholarshipCoverflow />

      <div className="uni-ribbon-wrap" id="universities">
        <div className="uni-ribbon">
          <div className="uni-track">
            <img src="/sop-vault/dbe108eff1e5e378846f61a6b3539fa1.png" alt="Johns Hopkins, Hertie School, Glasgow, CEU, Sheffield, Leeds, Pisa, Keele, Freiburg, Sussex, Europubhealth+, MERGED and ACES STAR logos" />
            <img src="/sop-vault/dbe108eff1e5e378846f61a6b3539fa1.png" alt="" aria-hidden />
          </div>
        </div>
      </div>

      <section className="section op-shell">
        <div className="section-head">
          <div className="op-eyebrow">Choose your goal</div>
          <h2>What are you aiming for?</h2>
        </div>
        <div className="intent-grid">
          {intents.map(it => (
            <Link key={it.title} to="/get-started" className="intent">
              <div className="intent-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">{it.icon}</svg></div>
              <h3>{it.title}</h3>
              <span className="go">{it.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <Journey />

      <Testimonials />

      <Achievers />

      <section className="section op-shell" id="about">
        <div className="about">
          <figure className="about-founder">
            <div className="about-photo">
              {founder.photo
                ? <img src={founder.photo} alt={founder.name} />
                : <span>{founder.name.split(" ").map(w => w[0]).join("").slice(0, 2)}</span>}
            </div>
            <figcaption>
              <h3>{founder.name}</h3>
              <small>{founder.title}</small>
            </figcaption>
          </figure>
          <div className="about-copy">
            <h2>About us</h2>
            <p>{founder.bio}</p>
            <p>{vision}</p>
            <div className="about-stats">
              {aboutStats.map(s => (
                <div key={s.label}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section op-shell" id="scholarships">
        <div className="section-head">
          <div className="op-eyebrow">Scholarship pathways</div>
          <h2>Funding your ambition.</h2>
        </div>
        <div className="sch-grid">
          {pathways.map(p => (
            <Link key={p.title} to={p.to} className="simple-card">
              <img className={`pathway-logo pl-${p.title.split(" ")[0].toLowerCase()}`} src={p.logo} alt="" aria-hidden />
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="go">{p.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="call" id="call">
        <div className="op-shell call-in">
          <div>
            <div className="op-eyebrow">First call is free</div>
            <h2>Start with a conversation.</h2>
          </div>
          <div>
            <p>A senior counsellor understands where you are, where you want to go and what the right next step could be.</p>
            <Link className="op-btn primary" to="/get-started">Book a free call ↗</Link>
          </div>
        </div>
      </section>

      <FAQ />

      <NewsletterSection />

      <SiteFooter />

      <NewsletterPopup />
      <WhatsAppButton />
    </div>
  );
};

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href="https://wa.me/916282001157"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa"
      style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "auto" : "none" }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="56" height="56">
        <defs>
          <linearGradient id="wa-b" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163"/>
            <stop offset="1" stopColor="#23b33a"/>
          </linearGradient>
        </defs>
        <path fill="#b3b3b3" d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
        <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
        <path fill="url(#wa-b)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>
        <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
      </svg>
    </a>
  );
};

export default Index;
