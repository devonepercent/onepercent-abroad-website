import { useEffect } from "react";
import { Link } from "react-router-dom";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";
import { useErasmusCart } from "@/lib/erasmusCart";

// Post-payment landing (PayU surl redirect). Fires the Purchase pixel once
// and clears the cart — the money is collected, the cart's job is done.
const ErasmusCheckoutSuccess = () => {
  const { clear } = useErasmusCart();

  useEffect(() => {
    if (typeof window === "undefined") return;
    clear();

    if (window.sessionStorage.getItem("erz_purchase_tracked")) return;
    let value = 0;
    let numItems = 0;
    let ids: string[] = [];
    try {
      const raw = window.sessionStorage.getItem("erz_purchase_pending");
      if (raw) {
        const parsed = JSON.parse(raw);
        value = Number(parsed.value) || 0;
        numItems = Number(parsed.num_items) || 0;
        ids = Array.isArray(parsed.ids) ? parsed.ids : [];
      }
    } catch {
      /* ignore */
    }

    initMetaPixel();
    trackMetaEvent("Purchase", {
      content_name: "Erasmus Application Filing",
      content_ids: ids,
      content_type: "product",
      value,
      currency: "INR",
      num_items: numItems,
    });
    window.sessionStorage.setItem("erz_purchase_tracked", "1");
    window.sessionStorage.removeItem("erz_purchase_pending");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
      <style>{`
        @keyframes tick-circle-draw { from { stroke-dashoffset: 166 } to { stroke-dashoffset: 0 } }
        @keyframes tick-check-draw { from { stroke-dashoffset: 42 } to { stroke-dashoffset: 0 } }
        @keyframes tick-fade-in { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
        .erz-tick-svg { width: 84px; height: 84px; display: block; margin: 0 auto 22px; animation: tick-fade-in 0.4s ease-out both }
        .erz-tick-circle-bg { fill: rgba(97,162,254,0.12) }
        .erz-tick-circle { stroke: #61A2FE; stroke-width: 2.5; fill: none; stroke-dasharray: 166; stroke-dashoffset: 166; animation: tick-circle-draw 0.55s cubic-bezier(0.65,0,0.35,1) 0.1s forwards }
        .erz-tick-check { stroke: #040B2B; stroke-width: 3.5; fill: none; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 42; stroke-dashoffset: 42; animation: tick-check-draw 0.35s cubic-bezier(0.65,0,0.35,1) 0.55s forwards }
      `}</style>

      <div
        style={{
          maxWidth: 480,
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
          <svg className="erz-tick-svg" viewBox="0 0 56 56">
            <circle className="erz-tick-circle-bg" cx="28" cy="28" r="26" />
            <circle className="erz-tick-circle" cx="28" cy="28" r="26" />
            <path className="erz-tick-check" d="M17 29.5 24.5 37 39 21" />
          </svg>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>Payment received!</h1>
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: "#40506B", margin: "0 0 18px" }}>
            Your Erasmus Mundus applications are officially in motion. A confirmation email with your order details is
            on its way.
          </p>
          <div
            style={{
              textAlign: "left",
              background: "#F5F8FF",
              borderRadius: 12,
              padding: "16px 18px",
              fontSize: 14,
              lineHeight: 1.7,
              color: "#40506B",
              marginBottom: 22,
            }}
          >
            <strong style={{ color: "#040B2B" }}>What happens next</strong>
            <br />
            1. Our team calls you within 24 hours
            <br />
            2. We collect your documents &amp; map requirements
            <br />
            3. SOPs &amp; LORs drafted, applications filed before every deadline
          </div>
          <Link
            to="/application/erasmus"
            style={{
              display: "inline-block",
              background: "#065DC7",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 28px",
              borderRadius: 999,
            }}
          >
            Back to Erasmus Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErasmusCheckoutSuccess;
