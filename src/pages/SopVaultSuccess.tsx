import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";

const SOP_VAULT_PRICE = 199;

const SopVaultSuccess = () => {
  const [params] = useSearchParams();
  const failed = params.get("status") === "failed";

  useEffect(() => {
    if (failed) return;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("sop_purchase_tracked")) return;

    initMetaPixel();
    trackMetaEvent("Purchase", {
      content_name: "The SOP Vault",
      content_ids: ["sop-vault"],
      content_type: "product",
      value: SOP_VAULT_PRICE,
      currency: "INR",
      num_items: 15,
    });
    window.sessionStorage.setItem("sop_purchase_tracked", "1");
  }, [failed]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#EEF4FF",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      padding: "24px",
      color: "#040B2B",
    }}>
      <style>{`
        @keyframes tick-circle-draw { from { stroke-dashoffset: 166 } to { stroke-dashoffset: 0 } }
        @keyframes tick-check-draw { from { stroke-dashoffset: 42 } to { stroke-dashoffset: 0 } }
        @keyframes tick-fade-in { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
        .tick-svg { width: 84px; height: 84px; display: block; margin: 0 auto 22px; animation: tick-fade-in 0.4s ease-out both }
        .tick-circle-bg { fill: rgba(97,162,254,0.12) }
        .tick-circle { stroke: #61A2FE; stroke-width: 2.5; fill: none; stroke-dasharray: 166; stroke-dashoffset: 166; animation: tick-circle-draw 0.55s cubic-bezier(0.65,0,0.35,1) 0.1s forwards }
        .tick-check { stroke: #040B2B; stroke-width: 3.5; fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 42; stroke-dashoffset: 42; animation: tick-check-draw 0.35s cubic-bezier(0.65,0,0.35,1) 0.55s forwards }
      `}</style>
      <div style={{
        maxWidth: 460,
        width: "100%",
        background: "#ffffff",
        border: "1px solid rgba(4,11,43,0.06)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 10px 40px rgba(4,11,43,0.08)",
      }}>
        <div style={{
          background: "#040B2B",
          padding: "32px 36px 28px",
        }}>
          <div style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.01em",
          }}>
            OnePercent Abroad
          </div>
          <div style={{
            fontSize: 11,
            color: failed ? "#fca5a5" : "#61A2FE",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginTop: 22,
          }}>
            {failed ? "Payment Failed" : "Payment Confirmed"}
          </div>
        </div>

        <div style={{ padding: "32px 36px 36px" }}>
          {failed ? (
            <>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#040B2B",
                margin: "0 0 10px",
                letterSpacing: "-0.01em",
              }}>
                Something went wrong
              </h2>
              <p style={{ fontSize: 14, color: "#6B7A99", lineHeight: 1.75, margin: "0 0 28px" }}>
                Your payment was not completed and you have <strong style={{ color: "#040B2B" }}>not been charged</strong>. Please try again, or reply to your last email and we will help sort it.
              </p>
            </>
          ) : (
            <>
              <svg className="tick-svg" viewBox="0 0 60 60" aria-hidden="true">
                <circle className="tick-circle-bg" cx="30" cy="30" r="26" />
                <circle className="tick-circle" cx="30" cy="30" r="26" />
                <path className="tick-check" d="M18 30 L27 39 L43 22" />
              </svg>
              <h2 style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#040B2B",
                margin: "0 0 10px",
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}>
                Check your email
              </h2>
              <p style={{ fontSize: 14, color: "#6B7A99", lineHeight: 1.75, margin: "0 0 28px", textAlign: "center" }}>
                Your secure download link has been sent to your inbox. Links expire in <strong style={{ color: "#040B2B" }}>7 days</strong>, so save the file to your device now.
              </p>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {failed ? (
              <Link
                to="/product/sop-vault"
                style={{
                  display: "block",
                  padding: "14px 22px",
                  borderRadius: 10,
                  background: "#040B2B",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                  letterSpacing: "0.02em",
                }}
              >
                Try again
              </Link>
            ) : null}
            <Link
              to="/"
              style={{
                display: "block",
                padding: "14px 22px",
                borderRadius: 10,
                background: failed ? "#ffffff" : "#040B2B",
                border: failed ? "1px solid rgba(4,11,43,0.12)" : "none",
                color: failed ? "#040B2B" : "#ffffff",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                textAlign: "center",
                letterSpacing: "0.02em",
              }}
            >
              Back to OnePercent Abroad
            </Link>
          </div>

          <div style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(4,11,43,0.08)",
            fontSize: 12,
            color: "#6B7A99",
          }}>
            <div style={{ fontWeight: 600, color: "#040B2B", marginBottom: 4 }}>OnePercent Abroad</div>
            <a href="https://onepercentabroad.com" style={{ color: "#065DC7", textDecoration: "none" }}>onepercentabroad.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SopVaultSuccess;
