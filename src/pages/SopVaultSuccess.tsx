import { Link, useSearchParams } from "react-router-dom";

const SopVaultSuccess = () => {
  const [params] = useSearchParams();
  const failed = params.get("status") === "failed";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAFAF7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: 480,
        width: "100%",
        background: "#fff",
        border: "1.5px solid #e6ebf0",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(13,27,42,0.1)",
      }}>
        <div style={{
          background: failed ? "#7a0000" : "#0D1B2A",
          padding: "36px 40px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{failed ? "✕" : "✓"}</div>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: "white",
            fontFamily: "'Cormorant Garamond', serif",
            letterSpacing: "-0.01em",
          }}>
            {failed ? "Payment Failed" : "Payment Confirmed"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 6 }}>
            1% Admit Vault
          </div>
        </div>

        <div style={{ padding: "36px 40px", textAlign: "center" }}>
          {failed ? (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(220,38,38,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 28, margin: "0 auto 20px",
              }}>⚠️</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0D1B2A", margin: "0 0 12px", fontFamily: "'Cormorant Garamond', serif" }}>
                Something went wrong
              </h2>
              <p style={{ fontSize: 14, color: "#7a8694", lineHeight: 1.75, margin: "0 0 28px" }}>
                Your payment was not completed. You have <strong style={{ color: "#0D1B2A" }}>not been charged</strong>.
                Please try again or contact us if the issue persists.
              </p>
            </>
          ) : (
            <>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(232,84,26,0.1)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 28, margin: "0 auto 20px",
              }}>📬</div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0D1B2A", margin: "0 0 12px", fontFamily: "'Cormorant Garamond', serif" }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: "#7a8694", lineHeight: 1.75, margin: "0 0 28px" }}>
                Your secure download links have been sent to your inbox.
                Links expire in <strong style={{ color: "#0D1B2A" }}>72 hours</strong> — save
                them to your device now.
              </p>
              <div style={{
                background: "#FDF0E6", border: "1px solid #F5C9A0", borderRadius: 12,
                padding: "14px 18px", textAlign: "left", marginBottom: 28,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0D1B2A", marginBottom: 4 }}>
                  ⚖️ Usage Reminder
                </div>
                <div style={{ fontSize: 12, color: "#7a8694", lineHeight: 1.65 }}>
                  Personal study only. No sharing, redistribution, or AI uploading.
                  Every document is watermarked and tracked.
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {failed ? (
              <Link
                to="/product/sop-vault"
                style={{
                  display: "block", padding: "12px 20px", borderRadius: 50,
                  background: "#0D1B2A", color: "white", fontSize: 13,
                  fontWeight: 600, textDecoration: "none", textAlign: "center",
                }}
              >
                Try Again →
              </Link>
            ) : (
              <a
                href="mailto:noreply@onepercentabroad.com"
                style={{
                  display: "block", padding: "12px 20px", borderRadius: 50,
                  border: "1.5px solid #e6ebf0", color: "#0D1B2A", fontSize: 13,
                  fontWeight: 600, textDecoration: "none", textAlign: "center",
                }}
              >
                Didn't receive it? Contact us
              </a>
            )}
            <Link
              to="/"
              style={{
                display: "block", padding: "12px 20px", borderRadius: 50,
                background: failed ? "transparent" : "#0D1B2A",
                border: failed ? "1.5px solid #e6ebf0" : "none",
                color: failed ? "#0D1B2A" : "white", fontSize: 13,
                fontWeight: 600, textDecoration: "none", textAlign: "center",
              }}
            >
              Back to OnePercent Abroad →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SopVaultSuccess;
