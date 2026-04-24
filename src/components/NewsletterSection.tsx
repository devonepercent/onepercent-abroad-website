import NewsletterForm from "./NewsletterForm";

const NewsletterSection = () => (
  <section style={{
    background: "#030810",
    borderTop: "1px solid rgba(77,135,255,0.07)",
    padding: "80px 32px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#fff",
    textAlign: "center",
  }}>
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: "#4d87ff",
        marginBottom: 16,
      }}>
        Newsletter
      </p>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: 600,
        lineHeight: 1.15,
        margin: "0 0 16px",
      }}>
        Stay ahead of the curve
      </h2>
      <p style={{
        fontSize: 15,
        color: "rgba(255,255,255,0.5)",
        lineHeight: 1.75,
        margin: "0 0 36px",
        maxWidth: 480,
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        Get updates on scholarships, top university programs, mentorship opportunities,
        and expert insights on studying abroad — straight to your inbox.
      </p>
      <NewsletterForm source="section" />
      <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  </section>
);

export default NewsletterSection;
