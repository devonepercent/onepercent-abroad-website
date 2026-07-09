import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { PRICE, suggestionsFor, Recommendation } from "@/lib/erasmusData";
import { useErasmusCart } from "@/lib/erasmusCart";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const C = {
  accent: "#065DC7",
  accentSoft: "#eef4fd",
  ink: "#0f172a",
  muted: "#64748b",
  line: "#e6e8ec",
  bg: "#ffffff",
  bgSoft: "#f7f8fa",
};
const FONT = "'Outfit', sans-serif";
const SERIF = "'Cormorant Garamond', serif";
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

const ErasmusCheckout = () => {
  const { items, remove, total, count, has, add } = useErasmusCart();
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    initMetaPixel();
  }, []);

  const handlePay = async () => {
    setPayError("");
    if (!buyerName.trim()) {
      setPayError("Please enter your name.");
      return;
    }
    if (!buyerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      setPayError("Please enter a valid email address.");
      return;
    }
    const cleanPhone = buyerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setPayError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsProcessing(true);
    trackMetaEvent("InitiateCheckout", {
      content_name: "Erasmus Application Filing",
      content_ids: items.map((i) => i.id),
      content_type: "product",
      value: total,
      currency: "INR",
      num_items: count,
    });

    try {
      const hashRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-erasmus-payu-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          name: buyerName.trim(),
          email: buyerEmail.trim(),
          phone: cleanPhone,
          items: items.map((i) => ({ id: i.id, code: i.code, name: i.name, category: i.category })),
        }),
      });
      const hashData = await hashRes.json();
      if (!hashData.success) throw new Error(hashData.error || "Payment initialisation failed");

      // Stash for the Purchase pixel event on the success page.
      try {
        window.sessionStorage.setItem(
          "erz_purchase_pending",
          JSON.stringify({ value: total, num_items: count, ids: items.map((i) => i.id) }),
        );
      } catch {
        /* ignore */
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.payu.in/_payment";
      const fields: Record<string, string> = {
        key: hashData.key,
        txnid: hashData.txnid,
        amount: hashData.amount,
        productinfo: hashData.productinfo,
        firstname: hashData.firstname,
        email: hashData.email,
        phone: hashData.phone,
        surl: hashData.surl,
        furl: hashData.furl,
        hash: hashData.hash,
      };
      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Failed to initialise payment. Please try again.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Contextual recommendations: only suggestions tied to the programmes the
  // student actually added. Deduped across blocks, never shown if already in cart.
  const shown = new Set<string>();
  const recBlocks = items
    .map((item) => {
      const recs = suggestionsFor(item, 6).filter((s) => !has(s.id) && !shown.has(s.id));
      recs.forEach((s) => shown.add(s.id));
      return { source: item, recs };
    })
    .filter((b) => b.recs.length > 0);

  return (
    <div style={{ background: C.bgSoft, color: C.ink, fontFamily: FONT, minHeight: "100vh" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 640px) {
          .erz-co { padding-left: 16px !important; padding-right: 16px !important; }
        }
        /* Continuously-tracing border around recommended-programme cards */
        @keyframes erz-card-trace { to { stroke-dashoffset: -100; } }
        .erz-rec-card { position: relative; }
        .erz-rec-card .erz-ct-track { fill: none; stroke: ${C.line}; stroke-width: 1.5; }
        .erz-rec-card .erz-ct-trace { fill: none; stroke: ${C.accent}; stroke-width: 2; stroke-dasharray: 24 76; stroke-dashoffset: 0; animation: erz-card-trace 3.2s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .erz-rec-card .erz-ct-trace { animation: none; } }
      `,
        }}
      />
      <header
        className="erz-co"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.line}`,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/application/erasmus/programs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: C.ink,
            textDecoration: "none",
            border: `1px solid ${C.line}`,
            background: C.bg,
            borderRadius: 999,
            padding: "9px 16px",
          }}
        >
          <ArrowLeft size={16} />
          Back to programmes
        </Link>
        <span />
      </header>

      <main className="erz-co" style={{ maxWidth: 920, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(30px,4.5vw,44px)", fontWeight: 600, margin: "0 0 24px", letterSpacing: "-0.3px" }}>Your cart</h1>

        {count === 0 ? (
          <div
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 16,
              padding: "48px 24px",
              textAlign: "center",
            }}
          >
            <p style={{ color: C.muted, fontSize: 16, margin: "0 0 20px" }}>Your cart is empty.</p>
            <Link
              to="/application/erasmus/programs"
              style={{
                display: "inline-block",
                background: C.accent,
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 15,
                padding: "12px 26px",
                borderRadius: 10,
              }}
            >
              Browse programmes
            </Link>
          </div>
        ) : (
          <div style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 20px",
                  borderTop: idx === 0 ? "none" : `1px solid ${C.line}`,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{item.code}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.category}</div>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  style={{
                    border: `1px solid ${C.line}`,
                    background: C.bg,
                    color: C.muted,
                    borderRadius: 10,
                    padding: "8px 14px",
                    cursor: "pointer",
                    fontFamily: FONT,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Summary */}
            <div style={{ borderTop: `1px solid ${C.line}`, padding: "20px", background: C.bgSoft }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: C.muted, marginBottom: 6 }}>
                <span>{count} {count === 1 ? "application" : "applications"} × {inr(PRICE)}</span>
                <span>{inr(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: FONT, fontSize: 30, fontWeight: 800, color: C.ink }}>{inr(total)}</span>
              </div>

              {/* Buyer details — needed for PayU + the follow-up call */}
              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 14px", fontFamily: FONT, fontSize: 15, color: C.ink, outline: "none", background: C.bg }}
                />
                <input
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 14px", fontFamily: FONT, fontSize: 15, color: C.ink, outline: "none", background: C.bg }}
                />
                <input
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+91 9XXXXXXXXX"
                  type="tel"
                  autoComplete="tel"
                  style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${C.line}`, borderRadius: 10, padding: "13px 14px", fontFamily: FONT, fontSize: 15, color: C.ink, outline: "none", background: C.bg }}
                />
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                style={{
                  width: "100%",
                  marginTop: 14,
                  background: C.accent,
                  color: "#fff",
                  border: 0,
                  borderRadius: 12,
                  padding: "15px",
                  fontSize: 16,
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: isProcessing ? "default" : "pointer",
                  opacity: isProcessing ? 0.65 : 1,
                }}
              >
                {isProcessing ? "Redirecting to PayU…" : `Proceed to pay ${inr(total)}`}
              </button>
              {payError && (
                <p style={{ textAlign: "center", color: "#dc2626", fontSize: 13, marginTop: 12 }}>{payError}</p>
              )}
              <p style={{ textAlign: "center", color: C.muted, fontSize: 12, marginTop: 10 }}>
                Secured by PayU · Safe &amp; Encrypted
              </p>
            </div>
          </div>
        )}

        {/* Browse more programmes */}
        {count > 0 && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <Link
              to="/application/erasmus/programs"
              style={{ color: C.accent, fontWeight: 600, fontSize: 14, textDecoration: "none" }}
            >
              + Browse more programmes
            </Link>
          </div>
        )}

        {/* Contextual recommendations — only for what's in the cart */}
        {recBlocks.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(24px,3.4vw,32px)", fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
              Recommended for you
            </h2>
            <p style={{ color: C.muted, fontSize: 14, margin: "0 0 8px" }}>
              Based on the programmes in your cart.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 28, marginTop: 20 }}>
              {recBlocks.map((block) => (
                <div key={block.source.id}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: "0 0 12px" }}>
                    Because you added {block.source.code}
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {block.recs.map((rec) => (
                      <RecCard key={rec.id} rec={rec} onAdd={() => add(rec)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

const RecCard = ({ rec, onAdd }: { rec: Recommendation; onAdd: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const radius = 12;
  return (
    <div
      ref={ref}
      className="erz-rec-card"
      style={{
        borderRadius: radius,
        padding: 16,
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {size.w > 0 && (
        <svg
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
        >
          <rect className="erz-ct-track" x="1" y="1" width={size.w - 2} height={size.h - 2} rx={radius} pathLength={100} />
          <rect className="erz-ct-trace" x="1" y="1" width={size.w - 2} height={size.h - 2} rx={radius} pathLength={100} />
        </svg>
      )}

      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{rec.code}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: C.accent,
              background: C.accentSoft,
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {rec.type === "popular" ? "Popular" : "Suggested"}
          </span>
        </div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{rec.name}</div>
      </div>

      <button
        onClick={onAdd}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          border: 0,
          background: C.accent,
          color: "#fff",
          borderRadius: 9,
          padding: "9px 14px",
          cursor: "pointer",
          fontFamily: FONT,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        + Add
      </button>
    </div>
  );
};

export default ErasmusCheckout;
