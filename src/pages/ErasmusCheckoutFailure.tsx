import { Link } from "react-router-dom";

// PayU furl redirect target — payment failed or was cancelled. The cart is
// intact, so the primary action is retrying the checkout.
const ErasmusCheckoutFailure = () => (
  <div
    style={{
      minHeight: "100vh",
      background: "#EEF4FF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      padding: "24px",
      color: "#040B2B",
    }}
  >
    <div
      style={{
        maxWidth: 460,
        width: "100%",
        background: "#ffffff",
        border: "1px solid rgba(4,11,43,0.06)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(4,11,43,0.08)",
        textAlign: "center",
      }}
    >
      <div style={{ background: "#040B2B", padding: "34px 36px 30px" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            background: "rgba(220,38,38,0.14)",
            border: "2.5px solid #ef4444",
            color: "#ef4444",
            fontSize: 40,
            lineHeight: "80px",
            margin: "0 auto 22px",
          }}
        >
          ×
        </div>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>Payment didn't go through</h1>
      </div>

      <div style={{ padding: "28px 32px 32px" }}>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "#40506B", margin: "0 0 22px" }}>
          No money was deducted on our side — if your bank shows a debit, it will auto-reverse. Your cart is saved, so
          you can try again in one tap.
        </p>
        <Link
          to="/application/erasmus/checkout"
          style={{
            display: "inline-block",
            background: "#065DC7",
            color: "#fff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            padding: "13px 28px",
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          Try again
        </Link>
        <p style={{ fontSize: 13, color: "#6B7A99", margin: 0 }}>
          Trouble paying?{" "}
          <Link to="/application/erasmus" style={{ color: "#065DC7", fontWeight: 600 }}>
            Talk to our team
          </Link>
        </p>
      </div>
    </div>
  </div>
);

export default ErasmusCheckoutFailure;
