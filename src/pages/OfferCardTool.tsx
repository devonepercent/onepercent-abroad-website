import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import logoWhite from "@/assets/logo-white.png";

type Role = "admin" | "user" | "sales";
type CardType = "standard" | "closer";
type ProgramKey = "ug" | "masters" | "doctorate";
type TabType = "preview" | "history";

interface ProgramInfo {
  name: string;
  price: number;
  discount: number;
}

interface OfferRecord {
  id: string;
  type: CardType;
  prospect: string;
  bda: string;
  program: ProgramKey;
  programName: string;
  original: number;
  discountAmt: number;
  final: number;
  expiry: string;
  createdAt: string;
}

const PROGRAMS: Record<ProgramKey, ProgramInfo> = {
  ug: { name: "UG Program", price: 150000, discount: 0.20 },
  masters: { name: "Masters of Your Dreams", price: 100000, discount: 0.15 },
  doctorate: { name: "Doctorate of Your Dreams", price: 200000, discount: 0.10 },
};

const INR = (n: number) => "₹" + n.toLocaleString("en-IN");

const genRef = (prefix: string) => prefix + "-" + Date.now().toString(36).toUpperCase();

const calcExpiry = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 0, 0);
  return d;
};

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const isExpired = (iso: string) => new Date(iso) < new Date();

const hoursLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 36e5);

const OfferCardTool = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const [cardType, setCardType] = useState<CardType>("standard");
  const [program, setProgram] = useState<ProgramKey>("ug");
  const [prospectName, setProspectName] = useState("");
  const [bdaName, setBdaName] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("preview");
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [generatedRef, setGeneratedRef] = useState<string | null>(null);
  const [notif, setNotif] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load offers from Supabase
  const fetchOffers = useCallback(async () => {
    const { data, error } = await supabase
      .from("offer_cards" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      const mapped = (data as any[]).map((r: any) => ({
        id: r.id,
        type: r.type as CardType,
        prospect: r.prospect,
        bda: r.bda,
        program: r.program as ProgramKey,
        programName: r.program_name,
        original: r.original,
        discountAmt: r.discount_amt,
        final: r.final_price,
        expiry: r.expiry,
        createdAt: r.created_at,
      }));
      setOffers(mapped);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const showNotif = useCallback((msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  }, []);

  // Auth & noindex
  useEffect(() => {
    const metaName = "robots";
    let meta = document.querySelector(`meta[name="${metaName}"]`) as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = metaName;
      document.head.appendChild(meta);
    }
    const prev = meta.content;
    meta.content = "noindex,nofollow";
    return () => { meta.content = prev; };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      setUserEmail(session.user.email ?? null);
      const { data, error } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", session.user.id);
      if (error || !data || data.length === 0) { navigate("/admin/login"); return; }
      const rows = data as unknown as { role: Role }[];
      const userRoles = rows.map((r) => r.role);
      if (!userRoles.includes("sales") && !userRoles.includes("admin")) {
        navigate("/admin/login");
        return;
      }
      setRoles(userRoles);
      setIsLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Computed values
  const prog = PROGRAMS[program];
  const stdDiscount = prog.price * prog.discount;
  const stdFinal = prog.price - stdDiscount;
  const closerAmt = prog.price * 0.05;
  const closerFinal = prog.price - closerAmt;
  const stdExpiry = calcExpiry(3);
  const closerExpiry = calcExpiry(2);
  const isCloser = cardType === "closer";
  const prospect = prospectName || "Your Prospect";
  const bda = bdaName || "Your Advisor";

  const generateCard = () => {
    if (!prospectName.trim()) { showNotif("Enter the prospect name"); return; }
    if (!bdaName.trim()) { showNotif("Enter the BDA name"); return; }
    setGeneratedRef(genRef(isCloser ? "CPT" : "OFR"));
    showNotif("Card generated! Review then save →");
    setActiveTab("preview");
  };

  const saveOffer = async () => {
    if (!prospectName.trim() || !bdaName.trim()) { showNotif("Complete the form first"); return; }
    const expiry = calcExpiry(isCloser ? 2 : 3);
    const discountAmt = prog.price * (isCloser ? 0.05 : prog.discount);
    const finalPrice = prog.price - discountAmt;
    const ref = genRef(isCloser ? "CPT" : "OFR");
    const { error } = await supabase.from("offer_cards" as any).insert({
      id: ref,
      type: cardType,
      prospect: prospectName.trim(),
      bda: bdaName.trim(),
      program,
      program_name: prog.name,
      original: prog.price,
      discount_amt: discountAmt,
      final_price: finalPrice,
      expiry: expiry.toISOString(),
    });
    if (error) {
      showNotif("Save failed — check connection");
      return;
    }
    await fetchOffers();
    showNotif("Logged to All Offers");
    setTimeout(() => setActiveTab("history"), 700);
  };

  const copyOfferText = () => {
    const expiry = calcExpiry(isCloser ? 2 : 3);
    const discountAmt = prog.price * (isCloser ? 0.05 : prog.discount);
    const finalPrice = prog.price - discountAmt;
    const text = isCloser
      ? `Dear ${prospect},\n\nWe have a special Closer's Edge coupon reserved exclusively for you.\n\nProgram: ${prog.name}\nProgram Price: ${INR(prog.price)}\nCoupon Savings (5%): − ${INR(discountAmt)}\nYour Price with Coupon: ${INR(finalPrice)}\n\nThis coupon expires on ${fmt(expiry)} and cannot be combined with any other offer.\n\nWarm regards,\n${bda}`
      : `Dear ${prospect},\n\nWe're pleased to offer you an exclusive fee concession.\n\nProgram: ${prog.name}\nOriginal Fee: ${INR(prog.price)}\nDiscount (${prog.discount * 100}%): − ${INR(discountAmt)}\nYour Special Price: ${INR(finalPrice)}\n\nThis offer is valid only until ${fmt(expiry)}.\n\nWarm regards,\n${bda}`;
    navigator.clipboard.writeText(text).then(() => showNotif("Copied to clipboard!")).catch(() => showNotif("Copy failed"));
  };

  const loadOffer = (id: string) => {
    const o = offers.find((x) => x.id === id);
    if (!o) return;
    setProspectName(o.prospect);
    setBdaName(o.bda);
    setProgram(o.program);
    setCardType(o.type);
    setActiveTab("preview");
  };

  const downloadPng = async () => {
    if (!cardRef.current) { showNotif("Generate a card first"); return; }
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      const name = prospectName.trim().replace(/\s+/g, "-") || "prospect";
      const ref = generatedRef || (isCloser ? "CPT" : "OFR");
      link.download = `offer-${name}-${ref}.png`;
      link.href = dataUrl;
      link.click();
      showNotif("PNG downloaded!");
    } catch {
      showNotif("Download failed — try again");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Stats
  const totalOffers = offers.length;
  const activeOffers = offers.filter((o) => !isExpired(o.expiry)).length;
  const expiredOffers = totalOffers - activeOffers;

  const stdExpiryDaysLeft = Math.ceil((stdExpiry.getTime() - Date.now()) / 864e5);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {userEmail && (
        <div className="bg-slate-900 text-slate-50 text-xs md:text-sm">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-3">
            <span>Logged in as {userEmail}</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-3 text-xs bg-white text-slate-900 hover:bg-slate-100"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      )}

      <style>{offerCardStyles}</style>

      <div className="od-app">
        {/* LEFT PANEL - FORM */}
        <div className="od-form-panel">
          <div className="od-panel-title">New Offer Card</div>
          <div className="od-panel-sub">Choose card type, fill details, generate</div>

          <div className="od-card-type-switch">
            <button
              className={`od-type-btn ${cardType === "standard" ? "od-active-std" : ""}`}
              onClick={() => setCardType("standard")}
            >
              Standard Offer
            </button>
            <button
              className={`od-type-btn ${cardType === "closer" ? "od-active-closer" : ""}`}
              onClick={() => setCardType("closer")}
            >
              Closer's Edge
            </button>
          </div>

          <div className="od-form-group">
            <label className="od-label">Prospect Name</label>
            <input
              type="text"
              className="od-input"
              placeholder="e.g. Arjun Mehta"
              value={prospectName}
              onChange={(e) => setProspectName(e.target.value)}
            />
          </div>

          <div className="od-form-group">
            <label className="od-label">BDA Name</label>
            <input
              type="text"
              className="od-input"
              placeholder="e.g. Priya Sharma"
              value={bdaName}
              onChange={(e) => setBdaName(e.target.value)}
            />
          </div>

          <div className="od-form-group">
            <label className="od-label">Program</label>
            <div className="od-program-grid">
              {(["ug", "masters", "doctorate"] as ProgramKey[]).map((key) => {
                const p = PROGRAMS[key];
                const discAmt = p.price * p.discount;
                return (
                  <div
                    key={key}
                    className={`od-program-card ${program === key ? "od-selected" : ""}`}
                    onClick={() => setProgram(key)}
                  >
                    <div className="od-prog-name">{key === "ug" ? "UG" : key === "masters" ? "Masters" : "Doctorate"}</div>
                    <div className="od-prog-price">{INR(p.price / (key === "doctorate" ? 1 : 1)).replace(",000", key === "ug" ? ",000" : ",000")}</div>
                    <div className="od-prog-discount">{p.discount * 100}% OFF</div>
                    <div className="od-prog-final">→ {INR(p.price - discAmt)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard mode fields */}
          {cardType === "standard" && (
            <div>
              <div className="od-expiry-banner">
                <span className="od-expiry-icon">&#9200;</span>
                <div>
                  <div className="od-expiry-label">Offer Expires (3 days)</div>
                  <div className="od-expiry-val">{fmt(stdExpiry)}</div>
                </div>
              </div>
              <button className="od-btn-generate od-btn-std" onClick={generateCard}>
                Generate Standard Offer →
              </button>
            </div>
          )}

          {/* Closer mode fields */}
          {cardType === "closer" && (
            <div>
              <div className="od-closer-info-box">
                <div className="od-closer-info-title">
                  Closer's Edge Coupon <span className="od-closer-badge">QUOTA: 2/month</span>
                </div>
                <div className="od-closer-info-note">
                  A standalone 5% coupon issued independently of the standard offer. For hot leads stalling on price only. Requires TL e-mail approval before issuing. Cannot be combined with the standard offer.
                </div>
                <div className="od-closer-warn">
                  Confirm TL e-mail approval before generating this coupon.
                </div>
              </div>
              <div className="od-expiry-banner od-expiry-gold" style={{ marginTop: 14 }}>
                <span className="od-expiry-icon">&#9203;</span>
                <div>
                  <div className="od-expiry-label">Coupon Expires (2 days)</div>
                  <div className="od-expiry-val">{fmt(closerExpiry)}</div>
                </div>
              </div>
              <button className="od-btn-generate od-btn-closer" onClick={generateCard}>
                Generate Closer's Edge Coupon →
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="od-right-panel">
          <div className="od-tabs">
            <div
              className={`od-tab ${activeTab === "preview" ? "od-tab-active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              Card Preview
            </div>
            <div
              className={`od-tab ${activeTab === "history" ? "od-tab-active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              All Offers
            </div>
          </div>

          {/* PREVIEW PANE */}
          {activeTab === "preview" && (
            <div>
              <div className="od-card-preview-wrap">
                {/* Standard Card */}
                {cardType === "standard" && (
                  <div className="od-offer-card" ref={cardRef}>
                    <div className="od-card-header">
                      <span className="od-card-type-pill">Standard Offer</span>
                      <img src={logoWhite} alt="1%abroad" className="od-card-logo-img" />
                      <div className="od-card-greeting">Exclusive offer prepared for</div>
                      <div className="od-card-prospect-name">{prospect}</div>
                    </div>
                    <div className="od-card-body">
                      <div className="od-card-program-label">Program</div>
                      <div className="od-card-program-name">{prog.name}</div>
                      <div className="od-card-pricing">
                        <div className="od-pricing-row od-strike">
                          <span className="od-pricing-label">Original Price</span>
                          <span className="od-pricing-val">{INR(prog.price)}</span>
                        </div>
                        <div className="od-pricing-row od-discount-row">
                          <span className="od-pricing-label">Standard Discount ({prog.discount * 100}%)</span>
                          <span className="od-pricing-val">− {INR(stdDiscount)}</span>
                        </div>
                        <hr className="od-pricing-divider" />
                        <div className="od-pricing-row od-total">
                          <span className="od-pricing-label">You Pay</span>
                          <span className="od-pricing-val">{INR(stdFinal)}</span>
                        </div>
                      </div>
                      <div className={`od-card-expiry-row ${stdExpiryDaysLeft <= 1 ? "od-urgent" : "od-normal"}`}>
                        <span>&#9201;</span>
                        <span>Offer valid till {fmt(stdExpiry)}, 11:59 PM</span>
                      </div>
                      <div className="od-card-fine">
                        This is a personalised offer extended exclusively to you. Non-transferable and valid only until the date shown above.
                      </div>
                    </div>
                    <div className="od-card-footer">
                      <div className="od-card-bda">
                        Your Academic Advisor
                        <strong>{bda}</strong>
                      </div>
                      <div className="od-card-ref">{generatedRef || "REF-——"}</div>
                    </div>
                  </div>
                )}

                {/* Closer Coupon Card */}
                {cardType === "closer" && (
                  <div className="od-coupon-card" ref={cardRef}>
                    <div className="od-coupon-header">
                      <img src={logoWhite} alt="1%abroad" className="od-card-logo-img od-coupon-logo" />
                      <div className="od-coupon-tag">Closer's Edge · Exclusive Discount Coupon</div>
                      <div className="od-coupon-title">5% Extra Off</div>
                      <div className="od-coupon-subtitle">Exclusively issued for you — valid for 48 hours only</div>
                    </div>
                    <div className="od-coupon-holes">
                      <div className="od-hole"></div>
                      <div className="od-dashed-line"></div>
                      <div className="od-hole"></div>
                    </div>
                    <div className="od-coupon-body">
                      <div className="od-coupon-for-label">Issued For</div>
                      <div className="od-coupon-for-name">{prospect}</div>
                      <div className="od-coupon-details">
                        <div className="od-coupon-detail-row">
                          <span className="od-cd-label">Program</span>
                          <span className="od-cd-val">{prog.name}</span>
                        </div>
                        <div className="od-coupon-detail-row">
                          <span className="od-cd-label">Program Price</span>
                          <span className="od-cd-val">{INR(prog.price)}</span>
                        </div>
                        <div className="od-coupon-detail-row">
                          <span className="od-cd-label">Coupon Savings (5%)</span>
                          <span className="od-cd-val" style={{ color: "#1a7a4a" }}>− {INR(closerAmt)}</span>
                        </div>
                        <div style={{ borderTop: "1px dashed #e8c87a", margin: "8px 0" }}></div>
                        <div className="od-coupon-detail-row">
                          <span className="od-cd-label" style={{ fontWeight: 600, color: "#5a3d0a" }}>Price with Coupon</span>
                          <span className="od-cd-val od-cd-big">{INR(closerFinal)}</span>
                        </div>
                      </div>
                      <div className="od-coupon-expiry-badge">
                        Coupon expires {fmt(closerExpiry)}, 11:59 PM
                      </div>
                      <div className="od-coupon-fine">
                        This coupon is non-transferable and issued solely to the named aspirant. It cannot be clubbed with any other offer or discount. Use before the expiry shown above.
                      </div>
                    </div>
                    <div className="od-card-footer" style={{ borderTopColor: "#e8c87a" }}>
                      <div className="od-card-bda" style={{ color: "#8a6120" }}>
                        Issued By
                        <strong style={{ color: "#5a3d0a" }}>{bda}</strong>
                      </div>
                      <div className="od-card-ref">{generatedRef || "CPT-——"}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="od-card-actions">
                <button className="od-btn-action od-btn-outline" onClick={copyOfferText}>Copy Text</button>
                <button className="od-btn-action od-btn-outline" onClick={downloadPng}>Download PNG</button>
                <button className="od-btn-action od-btn-outline" onClick={() => window.print()}>Print</button>
                <button
                  className={`od-btn-action ${isCloser ? "od-btn-gold" : "od-btn-primary-sm"}`}
                  onClick={saveOffer}
                >
                  Save & Log →
                </button>
              </div>
              <hr className="od-section-divider" />
              <div style={{ textAlign: "center", fontSize: 12, color: "#b0a898" }}>
                Fill the form and generate a card to preview it here.
              </div>
            </div>
          )}

          {/* HISTORY PANE */}
          {activeTab === "history" && (
            <div>
              <div className="od-stats-bar">
                <div className="od-stat-card">
                  <div className="od-stat-label">Total</div>
                  <div className="od-stat-val">{totalOffers}</div>
                </div>
                <div className="od-stat-card">
                  <div className="od-stat-label">Active</div>
                  <div className="od-stat-val" style={{ color: "#1a7a4a" }}>{activeOffers}</div>
                </div>
                <div className="od-stat-card">
                  <div className="od-stat-label">Expired</div>
                  <div className="od-stat-val" style={{ color: "#c0392b" }}>{expiredOffers}</div>
                </div>
              </div>

              <div className="od-offers-grid">
                {offers.length === 0 ? (
                  <div className="od-empty-state">
                    <div className="od-empty-icon">&#128203;</div>
                    <div className="od-empty-text">No offers logged yet</div>
                    <div className="od-empty-sub">Generate and save a card to see it here</div>
                  </div>
                ) : (
                  offers.map((o) => {
                    const expired = isExpired(o.expiry);
                    const hl = hoursLeft(o.expiry);
                    let badgeClass = "od-badge-active";
                    let badgeText = "Active";
                    if (expired) { badgeClass = "od-badge-expired"; badgeText = "Expired"; }
                    else if (hl <= 24) { badgeClass = "od-badge-urgent"; badgeText = `${hl}h left`; }
                    const isC = o.type === "closer";
                    return (
                      <div
                        key={o.id}
                        className={`od-offer-row ${isC ? "od-is-closer" : ""}`}
                        onClick={() => loadOffer(o.id)}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                            <span className="od-offer-row-name">{o.prospect}</span>
                            <span className={`od-offer-type-tag ${isC ? "od-tag-closer" : "od-tag-std"}`}>
                              {isC ? "Closer's Edge" : "Standard"}
                            </span>
                          </div>
                          <div className="od-offer-row-meta">
                            <span>{o.programName}</span>
                            <span>{o.bda}</span>
                            <span>Exp: {fmtShort(new Date(o.expiry))}</span>
                          </div>
                        </div>
                        <div className="od-offer-row-right">
                          <span className={`od-status-badge ${badgeClass}`}>{badgeText}</span>
                          <span className="od-offer-row-price">{INR(o.final)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification toast */}
      <div className={`od-notif ${notif ? "od-notif-show" : ""}`}>
        {notif}
      </div>

      <Footer />
    </div>
  );
};

// All scoped styles prefixed with od- to avoid conflicts
const offerCardStyles = `
  .od-app {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 0;
    min-height: calc(100vh - 200px);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #0f1f3d;
  }
  .od-form-panel {
    background: #fff;
    border-right: 1px solid #e8e4dc;
    padding: 28px 28px 40px;
    overflow-y: auto;
  }
  .od-panel-title { font-size: 20px; font-weight: 700; color: #0f1f3d; margin-bottom: 4px; }
  .od-panel-sub { font-size: 12px; color: #7a7268; margin-bottom: 24px; }
  .od-card-type-switch {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border: 1.5px solid #e8e4dc;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 22px;
  }
  .od-type-btn {
    padding: 11px 8px;
    text-align: center;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    color: #7a7268;
    background: #fff;
    transition: all 0.15s;
    border: none;
    outline: none;
    font-family: inherit;
  }
  .od-type-btn:first-child { border-right: 1.5px solid #e8e4dc; }
  .od-type-btn.od-active-std { background: #0f1f3d; color: #fff; }
  .od-type-btn.od-active-closer { background: #7a5410; color: #fff; }
  .od-type-btn:not(.od-active-std):not(.od-active-closer):hover { background: #f4f2ee; }
  .od-form-group { margin-bottom: 18px; }
  .od-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #7a7268;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .od-input {
    width: 100%;
    height: 40px;
    border: 1.5px solid #e8e4dc;
    border-radius: 8px;
    padding: 0 12px;
    font-family: inherit;
    font-size: 14px;
    color: #0f1f3d;
    background: #fff;
    transition: border-color 0.15s;
    outline: none;
    box-sizing: border-box;
  }
  .od-input:focus { border-color: #2a4a8a; }
  .od-program-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .od-program-card {
    border: 1.5px solid #e8e4dc;
    border-radius: 8px;
    padding: 12px 10px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
  }
  .od-program-card:hover { border-color: #2a4a8a; background: #f4f2ee; }
  .od-program-card.od-selected { border-color: #0f1f3d; background: #f0f3f9; }
  .od-program-card.od-selected::after {
    content: '\\2713';
    position: absolute;
    top: 6px;
    right: 8px;
    font-size: 11px;
    color: #0f1f3d;
    font-weight: 600;
  }
  .od-prog-name { font-weight: 600; font-size: 12px; color: #0f1f3d; }
  .od-prog-price { font-size: 15px; font-weight: 300; color: #0f1f3d; margin: 3px 0 1px; }
  .od-prog-discount { font-size: 11px; color: #1a7a4a; font-weight: 500; }
  .od-prog-final { font-size: 11px; color: #7a7268; }
  .od-expiry-banner {
    background: #f4f2ee;
    border-radius: 8px;
    padding: 10px 14px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .od-expiry-banner.od-expiry-gold { background: #fdf4e7; border: 1px solid #e8c87a; }
  .od-expiry-icon { font-size: 18px; }
  .od-expiry-label { font-size: 11px; color: #7a7268; text-transform: uppercase; letter-spacing: 0.4px; }
  .od-expiry-val { font-size: 13px; font-weight: 600; color: #0f1f3d; }
  .od-btn-generate {
    width: 100%;
    height: 48px;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    margin-top: 16px;
  }
  .od-btn-std { background: #0f1f3d; color: #fff; }
  .od-btn-std:hover { background: #1a3260; }
  .od-btn-closer { background: #7a5410; color: #fff; }
  .od-btn-closer:hover { background: #5a3d0a; }
  .od-btn-generate:active { transform: scale(0.99); }
  .od-closer-info-box {
    background: #fdf4e7;
    border: 1.5px solid #e8c87a;
    border-radius: 8px;
    padding: 13px 14px;
    margin-top: 16px;
  }
  .od-closer-info-title {
    font-size: 12px;
    font-weight: 600;
    color: #7a5410;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 5px;
    flex-wrap: wrap;
  }
  .od-closer-badge {
    background: #e8c87a;
    color: #5a3d0a;
    font-size: 10px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
  }
  .od-closer-info-note { font-size: 11px; color: #8a6120; line-height: 1.6; }
  .od-closer-warn {
    margin-top: 8px;
    font-size: 11px;
    color: #a83200;
    background: #fff0eb;
    padding: 7px 10px;
    border-radius: 6px;
    border-left: 3px solid #f0a070;
  }
  .od-right-panel { padding: 28px 32px; overflow-y: auto; background: #faf8f4; }
  .od-tabs { display: flex; margin-bottom: 24px; border-bottom: 2px solid #e8e4dc; }
  .od-tab {
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 500;
    color: #7a7268;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.15s;
  }
  .od-tab.od-tab-active { color: #0f1f3d; border-bottom-color: #0f1f3d; }
  .od-card-preview-wrap { display: flex; justify-content: center; margin-bottom: 20px; }

  /* Standard offer card */
  .od-offer-card {
    width: 420px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(15,31,61,0.18);
    border: 1px solid #e8e4dc;
  }
  .od-card-header {
    background: #0f1f3d;
    padding: 22px 28px 18px;
    position: relative;
    overflow: hidden;
  }
  .od-card-header::before {
    content: '';
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: rgba(200,150,62,0.12);
    top: -60px;
    right: -40px;
  }
  .od-card-header::after {
    content: '';
    position: absolute;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(200,150,62,0.08);
    bottom: -30px;
    right: 60px;
  }
  .od-card-type-pill {
    position: absolute;
    top: 16px;
    right: 20px;
    z-index: 2;
    font-size: 10px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    background: rgba(200,150,62,0.25);
    color: #e6b86a;
  }
  .od-card-logo-img { height: 28px; width: auto; margin-bottom: 12px; position: relative; z-index: 1; display: block; }
  .od-coupon-logo { margin-bottom: 8px; }
  .od-card-greeting { font-size: 11px; color: rgba(255,255,255,0.55); position: relative; z-index: 1; margin-bottom: 2px; }
  .od-card-prospect-name { font-size: 24px; font-weight: 700; color: #fff; position: relative; z-index: 1; }
  .od-card-body { padding: 20px 28px; }
  .od-card-program-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7a7268; font-weight: 500; margin-bottom: 3px; }
  .od-card-program-name { font-size: 18px; font-weight: 700; color: #0f1f3d; margin-bottom: 14px; }
  .od-card-pricing { background: #f4f2ee; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
  .od-pricing-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; font-size: 13px; }
  .od-pricing-label { color: #7a7268; }
  .od-pricing-val { font-weight: 500; color: #0f1f3d; }
  .od-pricing-row.od-strike .od-pricing-val { text-decoration: line-through; color: #b0a898; }
  .od-pricing-row.od-discount-row .od-pricing-val { color: #1a7a4a; }
  .od-pricing-divider { border: none; border-top: 1px dashed #e8e4dc; margin: 8px 0; }
  .od-pricing-row.od-total .od-pricing-label { font-weight: 600; color: #0f1f3d; font-size: 14px; }
  .od-pricing-row.od-total .od-pricing-val { font-size: 22px; font-weight: 700; color: #0f1f3d; }
  .od-card-expiry-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 12px;
    margin-bottom: 12px;
  }
  .od-card-expiry-row.od-normal { background: #edf7f2; border: 1px solid #b8e6cc; }
  .od-card-expiry-row.od-urgent { background: #fff5f5; border: 1px solid #fcc; }
  .od-card-fine { font-size: 11px; color: #7a7268; line-height: 1.6; }
  .od-card-footer {
    border-top: 1px solid #e8e4dc;
    padding: 12px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .od-card-bda { font-size: 12px; color: #7a7268; }
  .od-card-bda strong { color: #0f1f3d; font-weight: 600; display: block; font-size: 13px; }
  .od-card-ref { font-size: 10px; color: #b0a898; font-family: monospace; }

  /* Closer coupon card */
  .od-coupon-card {
    width: 420px;
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(15,31,61,0.18);
    border: 2px solid #e8c87a;
  }
  .od-coupon-header {
    background: linear-gradient(135deg, #7a5410 0%, #c8963e 100%);
    padding: 22px 28px 18px;
    position: relative;
    overflow: hidden;
  }
  .od-coupon-header::before {
    content: '\\2605';
    position: absolute;
    font-size: 120px;
    color: rgba(255,255,255,0.06);
    top: -20px;
    right: -10px;
    line-height: 1;
  }
  .od-coupon-tag { font-size: 10px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.7); text-transform: uppercase; margin-bottom: 5px; }
  .od-coupon-title { font-size: 26px; font-weight: 700; color: #fff; line-height: 1.1; }
  .od-coupon-subtitle { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 4px; }
  .od-coupon-holes {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    position: relative;
    margin: -1px 0;
    background: #fff;
  }
  .od-hole {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #faf8f4;
    border: 1px solid #e8e4dc;
    flex-shrink: 0;
  }
  .od-dashed-line { flex: 1; border-top: 2px dashed #e8e4dc; margin: 0 8px; }
  .od-coupon-body { padding: 16px 28px 20px; }
  .od-coupon-for-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7a7268; font-weight: 500; }
  .od-coupon-for-name { font-size: 20px; font-weight: 700; color: #0f1f3d; margin-bottom: 12px; }
  .od-coupon-details { background: #fdf4e7; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; }
  .od-coupon-detail-row { display: flex; justify-content: space-between; align-items: center; padding: 3px 0; font-size: 13px; }
  .od-cd-label { color: #8a6120; }
  .od-cd-val { font-weight: 600; color: #5a3d0a; }
  .od-cd-val.od-cd-big { font-size: 22px; font-weight: 700; color: #0f1f3d; }
  .od-coupon-expiry-badge {
    background: #fff0d6;
    border: 1.5px solid #e8c87a;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    color: #7a5410;
    font-weight: 500;
    text-align: center;
    margin-bottom: 12px;
  }
  .od-coupon-fine { font-size: 11px; color: #7a7268; line-height: 1.6; }

  /* Actions */
  .od-card-actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
  .od-btn-action {
    padding: 10px 20px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .od-btn-outline { background: transparent; border: 1.5px solid #e8e4dc; color: #0f1f3d; }
  .od-btn-outline:hover { border-color: #0f1f3d; background: #f4f2ee; }
  .od-btn-primary-sm { background: #0f1f3d; border: 1.5px solid #0f1f3d; color: #fff; }
  .od-btn-primary-sm:hover { background: #1a3260; }
  .od-btn-gold { background: #7a5410; border: 1.5px solid #7a5410; color: #fff; }
  .od-btn-gold:hover { background: #5a3d0a; }

  /* History */
  .od-stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .od-stat-card { background: #fff; border: 1px solid #e8e4dc; border-radius: 8px; padding: 14px 16px; }
  .od-stat-label { font-size: 11px; color: #7a7268; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .od-stat-val { font-size: 26px; font-weight: 700; color: #0f1f3d; }
  .od-offers-grid { display: flex; flex-direction: column; gap: 10px; }
  .od-offer-row {
    background: #fff;
    border: 1px solid #e8e4dc;
    border-radius: 12px;
    padding: 13px 16px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
    align-items: center;
    cursor: pointer;
    transition: box-shadow 0.15s;
  }
  .od-offer-row:hover { box-shadow: 0 1px 3px rgba(15,31,61,0.08); border-color: #b0a898; }
  .od-offer-row.od-is-closer { border-left: 3px solid #c8963e; }
  .od-offer-row-name { font-weight: 600; font-size: 14px; color: #0f1f3d; }
  .od-offer-row-meta { font-size: 12px; color: #7a7268; margin-top: 2px; display: flex; gap: 10px; flex-wrap: wrap; }
  .od-offer-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .od-status-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .od-badge-active { background: #edf7f2; color: #1a7a4a; }
  .od-badge-expired { background: #fdf0ee; color: #c0392b; }
  .od-badge-urgent { background: #fff5e6; color: #c06b10; }
  .od-offer-type-tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
  .od-tag-std { background: #eef2fa; color: #2a4a8a; }
  .od-tag-closer { background: #fdf4e7; color: #7a5410; }
  .od-offer-row-price { font-size: 14px; font-weight: 700; color: #0f1f3d; }
  .od-empty-state { text-align: center; padding: 60px 20px; }
  .od-empty-icon { font-size: 44px; margin-bottom: 12px; }
  .od-empty-text { font-size: 15px; color: #7a7268; }
  .od-empty-sub { font-size: 13px; color: #b0a898; margin-top: 4px; }
  .od-section-divider { border: none; border-top: 1px solid #e8e4dc; margin: 16px 0; }

  /* Notification */
  .od-notif {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f1f3d;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 12px 40px rgba(15,31,61,0.18);
    transform: translateY(80px);
    opacity: 0;
    transition: all 0.3s;
    z-index: 999;
    pointer-events: none;
  }
  .od-notif.od-notif-show { transform: translateY(0); opacity: 1; }

  /* Print */
  @media print {
    .od-form-panel, .od-tabs, .od-card-actions, .od-stats-bar, .od-notif { display: none !important; }
    .od-app { display: block !important; }
    .od-right-panel { padding: 0; }
    .od-card-preview-wrap { justify-content: flex-start; }
  }

  /* Responsive */
  @media (max-width: 900px) {
    .od-app { grid-template-columns: 1fr !important; }
    .od-form-panel { border-right: none; border-bottom: 1px solid #e8e4dc; }
    .od-offer-card, .od-coupon-card { width: 100% !important; }
  }
`;

export default OfferCardTool;
