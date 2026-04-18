import logoWhite from "@/assets/logo-white.png";
import NewsletterForm from "@/components/NewsletterForm";
import { Link } from "react-router-dom";

const Newsletter = () => (
  <div style={{
    minHeight: "100vh",
    background: "#050e1a",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
  }}>
    <Link to="/" style={{ marginBottom: 48 }}>
      <img src={logoWhite} alt="OnePercent Abroad" style={{ height: 36, width: "auto" }} />
    </Link>

    <div style={{
      background: "#0a1628",
      border: "1px solid rgba(97,162,254,0.12)",
      borderRadius: 24,
      padding: "60px 48px",
      maxWidth: 520,
      width: "100%",
      textAlign: "center",
      boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
    }}>
      <div style={{ width: 48, height: 2, background: "linear-gradient(90deg,#3b82f6,#61A2FE)", borderRadius: 1, margin: "0 auto 28px" }} />

      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "#61A2FE",
        margin: "0 0 14px",
      }}>
        Newsletter
      </p>

      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(26px, 4vw, 36px)",
        fontWeight: 600,
        lineHeight: 1.15,
        margin: "0 0 16px",
      }}>
        Stay ahead of the curve
      </h1>

      <p style={{
        fontSize: 15,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.8,
        margin: "0 0 36px",
      }}>
        Get updates on scholarships, top university programs, mentorship
        opportunities, and expert insights on studying abroad — free, straight
        to your inbox.
      </p>

      <ul style={{
        listStyle: "none",
        padding: 0,
        margin: "0 0 36px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        textAlign: "left",
      }}>
        {[
          "Scholarship opportunities & deadlines",
          "Top university program highlights",
          "Mentorship & career guidance",
          "International education news & insights",
        ].map(item => (
          <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
            <span style={{ color: "#61A2FE", flexShrink: 0, marginTop: 1 }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      <NewsletterForm source="standalone" />

      <p style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  </div>
);

export default Newsletter;
