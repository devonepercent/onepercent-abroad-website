import { useEffect, useState } from "react";
import NewsletterForm from "./NewsletterForm";

const SESSION_KEY = "newsletter_popup_seen";

const NewsletterPopup = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 20000);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) close(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5,14,26,0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        opacity: dismissed ? 0 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <div style={{
        background: "#0a1628",
        border: "1px solid rgba(97,162,254,0.15)",
        borderRadius: 20,
        padding: "48px 40px 40px",
        maxWidth: 480,
        width: "100%",
        position: "relative",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        textAlign: "center",
      }}>
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 22,
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
          onMouseOver={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseOut={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
        >
          ✕
        </button>

        {/* Accent line */}
        <div style={{ width: 48, height: 2, background: "linear-gradient(90deg,#3b82f6,#61A2FE)", borderRadius: 1, margin: "0 auto 24px" }} />

        <p style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#61A2FE",
          margin: "0 0 12px",
        }}>
          Newsletter
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 26,
          fontWeight: 600,
          lineHeight: 1.2,
          margin: "0 0 12px",
        }}>
          Stay ahead of the curve
        </h2>
        <p style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.75,
          margin: "0 0 28px",
        }}>
          Scholarships, top university programs, mentorship tips, and expert
          insights on studying abroad — free, straight to your inbox.
        </p>

        <NewsletterForm source="popup" onSuccess={close} compact />

        <p style={{ marginTop: 14, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default NewsletterPopup;
