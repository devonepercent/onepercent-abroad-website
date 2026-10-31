import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./site.css";

const links = [
  { label: "Services",        to: "/services" },
  { label: "Scholarships",    to: "/#scholarships" },
  { label: "Success Stories", to: "/#stories" },
  { label: "Universities",    to: "/#universities" },
  { label: "Updates",         to: "/blog" },
  { label: "Careers",         to: "/hiring" },
];

const SiteNav = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const logo = variant === "dark" ? "/logo-white.png" : "/logo-blue.png";

  return (
    <>
      <nav className={`op-nav ${variant === "dark" ? "dark" : ""}`}>
        <div className="op-shell op-nav-in">
          <Link to="/" aria-label="1%abroad home" onClick={() => setOpen(false)}>
            <img className="op-brand-logo" src={logo} alt="1%abroad" />
          </Link>
          <div className="op-desktop-nav">
            {links.map(l => (
              <Link key={l.label} to={l.to} className={pathname === l.to ? "active" : undefined}>{l.label}</Link>
            ))}
            <Link className="op-btn primary" to="/get-started">Book a free call</Link>
          </div>
          <button className="op-hamb" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(o => !o)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </nav>
      {open && (
        <div className="op-mobile-menu">
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          {links.map(l => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <Link className="op-menu-cta" to="/get-started" onClick={() => setOpen(false)}>Book a free call</Link>
        </div>
      )}
    </>
  );
};

export default SiteNav;
