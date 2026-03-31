import { useState } from "react";

const MuhasinTask = () => {
  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === "pineapple") {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput("");
    }
  };

  if (unlocked) {
    return (
      <iframe
        src="/leadsquare_muhasina.html"
        style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
        title="LeadSquared Setup"
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f6f9",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "48px 40px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "380px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>🔒</div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f3460", marginBottom: "8px" }}>
          Protected Page
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "28px" }}>
          Enter the password to continue
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              border: error ? "2px solid #e94560" : "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "15px",
              outline: "none",
              marginBottom: "12px",
              boxSizing: "border-box"
            }}
          />
          {error && (
            <p style={{ fontSize: "13px", color: "#e94560", marginBottom: "12px" }}>
              Incorrect password. Try again.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "#0f3460",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
};

export default MuhasinTask;
