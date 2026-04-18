import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Source = "popup" | "section" | "standalone";

interface Props {
  source: Source;
  onSuccess?: () => void;
  compact?: boolean;
}

const NewsletterForm = ({ source, onSuccess, compact = false }: Props) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "duplicate">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setStatus("loading");

    const { error } = await (supabase as any)
      .from("newsletter_subscribers")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), source });

    if (!error) {
      setStatus("success");
      setName("");
      setEmail("");
      onSuccess?.();
    } else if (error.code === "23505") {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: compact ? "8px 0" : "16px 0" }}>
        <div style={{ fontSize: 22, marginBottom: 8 }}>✓</div>
        <p style={{ color: "#61A2FE", fontWeight: 600, margin: 0, fontSize: compact ? 14 : 16 }}>
          You're in! Welcome to the 1% circle.
        </p>
      </div>
    );
  }

  const inputStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: "100%",
    padding: compact ? "11px 18px" : "14px 20px",
    borderRadius: 50,
    border: "1px solid rgba(97,162,254,0.25)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: compact ? 13 : 15,
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    ...extra,
  });

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: compact ? 8 : 10 }}>
      <input
        type="text"
        required
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle()}
        onFocus={e => (e.target.style.borderColor = "rgba(97,162,254,0.6)")}
        onBlur={e => (e.target.style.borderColor = "rgba(97,162,254,0.25)")}
      />
      <div style={{
        display: "flex",
        gap: compact ? 8 : 10,
        flexWrap: "wrap",
      }}>
        <input
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle({ flex: "1 1 180px", minWidth: 0 })}
          onFocus={e => (e.target.style.borderColor = "rgba(97,162,254,0.6)")}
          onBlur={e => (e.target.style.borderColor = "rgba(97,162,254,0.25)")}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{
            padding: compact ? "11px 24px" : "14px 32px",
            borderRadius: 50,
            border: "none",
            background: status === "loading" ? "rgba(97,162,254,0.5)" : "#61A2FE",
            color: "#050e1a",
            fontWeight: 700,
            fontSize: compact ? 13 : 15,
            cursor: status === "loading" ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            fontFamily: "'DM Sans', sans-serif",
            transition: "background 0.2s",
          }}
          onMouseOver={e => { if (status !== "loading") (e.currentTarget.style.background = "#89BEFF"); }}
          onMouseOut={e => { if (status !== "loading") (e.currentTarget.style.background = "#61A2FE"); }}
        >
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {status === "duplicate" && (
        <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 13, color: "rgba(97,162,254,0.8)" }}>
          You're already subscribed!
        </p>
      )}
      {status === "error" && (
        <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 13, color: "#f87171" }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
};

export default NewsletterForm;
