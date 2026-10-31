import { Link } from "react-router-dom";
import "./site.css";

const socials = [
  {
    href: "https://www.instagram.com/onepercentabroad",
    label: "Instagram",
    icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></>,
  },
  {
    href: "https://www.facebook.com/onepercentabroad",
    label: "Facebook",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  {
    href: "https://www.linkedin.com/company/onepercentabroad/",
    label: "LinkedIn",
    icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
  },
];

const SiteFooter = () => (
  <footer className="op-footer">
    <div className="op-shell op-footer-grid">
      <div>
        <img className="op-footer-logo" src="/logo-white.png" alt="1%abroad" />
        <h3>Make the next 1% feel possible.</h3>
        <p>Admissions mentorship for ambitious Indian students targeting global universities and scholarships.</p>
        <div className="op-socials">
          {socials.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{s.icon}</svg>
            </a>
          ))}
        </div>
      </div>
      <div className="op-fcol">
        <h4>Explore</h4>
        <Link to="/services">Services</Link>
        <Link to="/#scholarships">Scholarships</Link>
        <Link to="/#stories">Success Stories</Link>
        <Link to="/blog">Updates</Link>
      </div>
      <div className="op-fcol">
        <h4>Programmes</h4>
        <Link to="/application/erasmus">Erasmus Mundus</Link>
        <Link to="/chevening">Chevening</Link>
        <Link to="/webinar">Webinars</Link>
        <Link to="/newsletter">Newsletter</Link>
      </div>
      <div className="op-fcol">
        <h4>Start</h4>
        <Link to="/get-started">Book a free call</Link>
        <Link to="/hiring">Careers</Link>
        <Link to="/privacy-policy">Privacy Policy</Link>
      </div>
    </div>
    <div className="op-shell op-copy">
      <span>© 2026 OnePercent Abroad · Aspira Onepercent Pvt Ltd</span>
      <Link to="/privacy-policy">Privacy Policy</Link>
    </div>
  </footer>
);

export default SiteFooter;
