import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { initMetaPixel, trackMetaEvent } from "@/lib/metaPixel";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const PRICE = 199;
const OLD_PRICE = 799;

// Razorpay Checkout is loaded on demand so the page doesn't pay for it up front.
type RazorpayInstance = { open: () => void; on: (event: string, cb: (res: unknown) => void) => void };
declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance }
}

let razorpayScript: Promise<void> | null = null;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  razorpayScript ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => { razorpayScript = null; reject(new Error("Could not load the payment window. Check your connection and try again.")); };
    document.body.appendChild(s);
  });
  return razorpayScript;
};

const img = (id: string, ext = "jpg") => `/sop-vault/${id}.${ext}`;

const admits = [
  { uni: "Johns Hopkins",               prog: "Master of Public Health",                  img: img("f28f587061b63e07c09413b298e6123e") },
  { uni: "Hertie School",               prog: "MA Public Policy",                         img: img("1db64740d94ca33c61c268972c0ea32b") },
  { uni: "Erasmus Mundus",              prog: "Joint Master, Intl. Relations",            img: img("fb07960f79ccc4be83942b434bb02186") },
  { uni: "NMBU",                        prog: "MSc Agroecology",                          img: img("06ed137064a6703cab78a7ae0469e5d5") },
  { uni: "Europubhealth+",              prog: "Erasmus Mundus, Public Health",            img: img("fb07960f79ccc4be83942b434bb02186") },
  { uni: "Università di Pisa",          prog: "MSc AI and Data Engineering",              img: img("dd987e2badde0909d8dd663a29c7aef9") },
  { uni: "Central European University", prog: "MA Public Policy",                         img: img("274a5eddb70fceba64686ac7547db3b9") },
  { uni: "University of Glasgow",       prog: "MSc Data Science",                         img: img("2260c21aab3dfe6b1e270fa53cba02c8") },
  { uni: "Keele University",            prog: "MSc Environmental and Green Technology",   img: img("27156fc31cc83592488327e6206979ac") },
  { uni: "University of Freiburg",      prog: "MSc Global Urban Health",                  img: img("9b3c111ce6c3fd221346406a91a260ed") },
  { uni: "University of Leeds",         prog: "MSc Sustainable Cities",                   img: img("0e2a1d904c2ac1c5830751cef4383150") },
  { uni: "University of Glasgow",       prog: "MSc International Journalism",             img: img("2260c21aab3dfe6b1e270fa53cba02c8") },
  { uni: "University of Sussex",        prog: "MA Development Studies",                   img: img("cccc1092be1b56fce612ae55f286d8df") },
  { uni: "ACES STAR",                   prog: "MSc Aquaculture, Environment and Society", img: img("af5a9ef55454a19567a3556700a1a57d") },
  { uni: "University of Sheffield",     prog: "MPH Public Health",                        img: img("f74147812831bb06a32ea809d394b271") },
];

const faqs = [
  {
    q: "Are these real SOPs?",
    a: "Yes. All 15 were written by students who received the admit or scholarship shown, and are shared with their consent. Names and personal details are removed.",
  },
  {
    q: "Can I copy from them?",
    a: "No, and you should not. Universities run similarity checks. The vault shows you the strategy behind each statement so you can build your own.",
  },
  {
    q: "How do I receive the files?",
    a: "The PDFs are emailed to you as soon as your payment clears. No account, no login. Links stay live for 7 days, so save the PDFs to your device.",
  },
  {
    q: "Is there a refund policy?",
    a: "Because these are digital documents delivered instantly, refunds aren't possible after download. If you face a technical access issue, message us and we'll fix it.",
  },
];

const credits = [
  "Gilman Hall, Johns Hopkins University, by Daderot, public domain",
  "Friedrichstrasse office building, Berlin, by Jörg Zägel, CC BY-SA 3.0",
  "Espace Léopold, by Edison McCullen, CC BY-SA 4.0",
  "Ur-bygningen på NMBU, by Fisle, CC BY-SA 4.0",
  "Palazzo della Sapienza, Pisa, by Lombres, CC BY-SA 4.0",
  "University of Glasgow Gilbert Scott Building, by Diliff, CC BY 3.0",
  "Keele Hall Southern Aspect, by Stepped, CC BY-SA 3.0",
  "Kollegiengebäude I, Universität Freiburg, by Giftzwerg 88, CC BY-SA 3.0",
  "University of Leeds, by Mtaylor848, CC BY-SA 4.0",
  "Falmer House, University of Sussex, by Morten Watkins, CC BY-SA 3.0",
  "University of Crete, Rethymno Campus, by Tomisti, CC BY-SA 4.0",
  "Firth Court from Octagon, Sheffield, by Chanpeter, CC BY-SA 4.0",
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Caveat:wght@500;600&display=swap');
section[aria-live="polite"]{position:fixed!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important}
.svr{font-family:Poppins,'Helvetica Neue',Arial,sans-serif;color:#010f70;background:#fff;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.svr *,.svr *::before,.svr *::after{box-sizing:border-box}
.svr h1,.svr h2,.svr p{margin:0}
.svr a{color:#065dc7}.svr a:hover{color:#010f70}
.svr .muted{color:#4a5272}

.svr .hero{position:relative;overflow:hidden;background:#010f70;color:#fff;min-height:620px;display:flex;flex-direction:column}
.svr .hero-art{position:absolute;inset:-3%;background-image:url(/sop-vault/91ecff91dbab067a141414ef25d46552.jpg);background-size:cover;background-position:center 30%;opacity:.55;transform-origin:50% 35%;animation:svr-walk 24s ease-in-out infinite alternate}
@keyframes svr-walk{from{transform:scale(1) translateY(0)}to{transform:scale(1.06) translateY(1.6%)}}
.svr .hero-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(1,15,112,.55) 0%,rgba(1,15,112,.82) 55%,#010f70 100%)}
.svr .hero-in{position:relative;padding:24px 20px 36px;display:flex;flex-direction:column;flex:1 1 auto;gap:20px}
.svr .brand{font-size:22px;font-weight:700;letter-spacing:-.02em;line-height:1;color:#fff;text-decoration:none}
.svr .brand:hover{color:#fff}
.svr .hero h1{font-size:32px;line-height:1.22;font-weight:600;letter-spacing:-.01em;font-family:inherit}
.svr .lede{font-size:13px;line-height:1.5;color:#c5ccea;max-width:330px;font-weight:500}

@property --svr-beam{syntax:"<angle>";inherits:false;initial-value:0deg}
.svr .beam{position:relative}
.svr .beam::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--svr-beam),transparent 0 62%,#f5c451 78%,#fff6d1 85%,#f5c451 92%,transparent 100%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;animation:svr-beam 3.2s linear infinite;pointer-events:none}
@keyframes svr-beam{to{--svr-beam:360deg}}
.svr .shine{position:relative;overflow:hidden;transition:filter .25s ease,transform .25s ease}
.svr .shine::after{content:"";position:absolute;top:-60%;left:-80%;width:50%;height:220%;background:linear-gradient(105deg,rgba(255,255,255,0) 0%,rgba(255,255,255,.45) 50%,rgba(255,255,255,0) 100%);transform:skewX(-18deg);animation:svr-sheen 3.2s ease-in-out 1s infinite}
@keyframes svr-sheen{0%{left:-80%}35%{left:140%}100%{left:140%}}
.svr .shine:hover{filter:brightness(1.1);transform:translateY(-1px)}
.svr .shine:hover::after{animation:svr-sheen .8s ease-out forwards}
.svr .cta{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:56px;background:#065dc7;color:#fff;border:0;cursor:pointer;font-family:inherit;border-radius:999px;font-size:17px;font-weight:600;padding:14px 20px}
.svr .cta:disabled{opacity:.65;cursor:default;filter:none;transform:none}

.svr .mark{position:relative;display:inline-block;white-space:nowrap}
.svr .mark svg{position:absolute;left:-13%;top:-42%;width:126%;height:184%;overflow:visible;pointer-events:none}
.svr .mark path{fill:none;stroke:#f5c451;stroke-width:6.5;stroke-linecap:round;stroke-linejoin:round;opacity:.92;stroke-dasharray:1;stroke-dashoffset:1;animation:svr-draw 1.8s cubic-bezier(.45,0,.2,1) .6s forwards}
@keyframes svr-draw{to{stroke-dashoffset:0}}

.svr .ribbon{position:relative;background:#f8f9fc;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 50%,100% 100%,0 100%,14px 50%);overflow-x:auto;scrollbar-width:none;padding:12px 0}
.svr .ribbon::-webkit-scrollbar{display:none}
.svr .ribbon img{height:40px;width:auto;max-width:none;display:block;padding:0 20px}

.svr .sec{padding-left:20px;padding-right:20px}
.svr .sec-head{display:flex;flex-direction:column;gap:8px}
.svr h2{font-size:24px;line-height:1.25;font-weight:600;font-family:inherit}
.svr .eyebrow{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#065dc7}

.svr .preview{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.svr .preview figure{margin:0;display:flex;flex-direction:column;gap:8px}
.svr .preview figcaption{font-size:12px;color:#4a5272}
.svr .shot{border-radius:8px;box-shadow:0 10px 30px rgba(1,15,112,.14);display:block;width:100%;height:auto}

.svr .ticker{overflow:hidden;position:relative;margin:0 -20px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%)}
.svr .track{display:flex;gap:14px;width:max-content;animation:svr-ribbon 48s linear infinite}
.svr .ticker:hover .track{animation-play-state:paused}
@keyframes svr-ribbon{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.svr .tcard{flex:0 0 200px;display:flex;flex-direction:column;gap:8px}
.svr .tcard img{width:200px;height:130px;object-fit:cover;border-radius:12px;display:block;box-shadow:0 8px 22px rgba(1,15,112,.12)}
.svr .tcard b{font-size:13px;font-weight:600;line-height:1.3}
.svr .tcard span{font-size:12px;line-height:1.3;color:#4a5272;margin-top:-4px}

.svr .points{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:14px}
.svr .points li{display:flex;gap:12px;align-items:flex-start;font-size:15px;line-height:22px}
.svr .points i{font-style:normal;flex:0 0 24px;height:24px;border-radius:999px;background:#f8f9fc;color:#065dc7;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center}

.svr .quotes{display:flex;flex-direction:column;gap:22px;padding:10px 6px 6px}
.svr .note{position:relative;margin:0;background:#fff59d;border-radius:2px;padding:26px 18px 16px;display:flex;flex-direction:column;gap:8px;box-shadow:0 10px 24px rgba(1,15,112,.16),0 2px 4px rgba(0,0,0,.08);font-family:Caveat,'Comic Sans MS',cursive;color:#1a1a1a}
.svr .note::before{content:"";position:absolute;top:-10px;left:50%;width:74px;height:22px;transform:translateX(-50%) rotate(-3deg);background:rgba(255,255,255,.55);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.svr .note p{font-size:21px;line-height:1.3;font-weight:500}
.svr .note footer{font-size:16px;color:#4a4a4a}
.svr .n1{transform:rotate(-2deg)}.svr .n2{transform:rotate(1.6deg)}

.svr .price{background:#010f70;color:#fff;border-radius:16px;padding:28px 22px;display:flex;flex-direction:column;gap:18px;position:relative;overflow:hidden}
.svr .price > *{position:relative}
.svr .price .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 38%;opacity:.55;pointer-events:none}
.svr .price .veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(1,15,112,.35) 0%,rgba(1,15,112,.7) 60%,rgba(1,15,112,.88) 100%);pointer-events:none}
.svr .price ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:14px;line-height:21px}

.svr .faq details{border-top:1px solid rgba(1,15,112,.12)}
.svr .faq details:last-child{border-bottom:1px solid rgba(1,15,112,.12)}
.svr .faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 0;font-size:15px;font-weight:500;color:#010f70}
.svr .faq summary::-webkit-details-marker{display:none}
.svr .faq summary::after{content:"+";font-size:20px;color:#065dc7;flex:0 0 auto}
.svr .faq details[open] summary::after{content:"\\2013"}
.svr .faq details p{padding:0 0 16px;font-size:14px;line-height:22px;color:#4a5272}

.svr .foot{padding:24px 20px 110px;font-size:12px;line-height:20px;color:#4a5272;display:flex;flex-direction:column;gap:6px}
.svr .linkbtn{background:none;border:0;padding:0;font:inherit;color:#065dc7;cursor:pointer;text-decoration:none}
.svr .credits{font-size:11px;line-height:17px}
.svr .credits summary{cursor:pointer;color:#065dc7}
.svr .credits ul{margin:8px 0 0;padding-left:16px;list-style:disc}

.svr .bar{position:sticky;bottom:0;z-index:5;background:#fff;border-top:1px solid rgba(1,15,112,.12);padding:10px 16px;padding-bottom:calc(10px + env(safe-area-inset-bottom))}
.svr .bar-in{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 auto}
.svr .bar .cta{width:auto;min-height:44px;font-size:15px;padding:10px 22px}

/* CHECKOUT SHEET */
.svr .scrim{position:fixed;inset:0;z-index:200;background:rgba(1,15,112,.72);backdrop-filter:blur(6px);display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.svr .sheet{width:100%;max-width:440px;max-height:96vh;overflow-y:auto;background:#fff;border-radius:20px 20px 0 0;padding:20px 20px calc(28px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:14px;animation:svr-up .35s cubic-bezier(.2,.8,.2,1)}
@keyframes svr-up{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
.svr .grab{width:40px;height:4px;border-radius:999px;background:#c5ccea;align-self:center}
.svr .pill{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#065dc7;background:#f8f9fc;border-radius:999px;padding:6px 12px}
.svr .close{display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:999px;background:#f8f9fc;color:#010f70;border:0;cursor:pointer}
.svr .field{display:flex;flex-direction:column;gap:6px}
.svr .field label{font-size:13px;font-weight:600}
.svr .field input{font-family:inherit;font-size:16px;padding:14px 16px;border:1.5px solid rgba(1,15,112,.2);border-radius:12px;color:#010f70;min-height:52px;width:100%;outline:none;background:#fff}
.svr .field input:focus{border-color:#065dc7;box-shadow:0 0 0 3px rgba(6,93,199,.15)}
.svr .methods{display:flex;gap:6px;flex-wrap:wrap;font-size:11px;font-weight:600;color:#4a5272}
.svr .methods span{border:1px solid rgba(1,15,112,.15);border-radius:4px;padding:4px 8px}
.svr .pay-error{font-size:13px;color:#c0392b;text-align:center}

/* TERMS MODAL */
.svr .tmd-bd{position:fixed;inset:0;z-index:300;background:rgba(1,15,112,.75);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center}
.svr .tmd{background:#fff;width:90%;max-width:620px;max-height:80vh;overflow-y:auto;border-radius:20px;padding:36px 28px;position:relative}
.svr .tmd h2{margin-bottom:16px}
.svr .tmd h4{font-size:15px;margin:18px 0 8px;font-weight:600}
.svr .tmd p,.svr .tmd li{font-size:13px;line-height:1.7;color:#4a5272}
.svr .tmd p{margin-bottom:12px}
.svr .tmd ul{padding-left:18px;display:flex;flex-direction:column;gap:6px;list-style:disc}
.svr .tmd li strong{color:#010f70}
.svr .tmd .close{position:absolute;top:14px;right:14px}

@media (min-width:600px){
 .svr .scrim{justify-content:center;padding:24px}
 .svr .sheet{border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.35)}
 .svr .grab{display:none}
}
@media (min-width:900px){
 .svr .sec,.svr .foot{width:100%;max-width:1040px;margin-left:auto;margin-right:auto}
 .svr .hero{min-height:560px}
 .svr .hero-in{width:100%;max-width:1040px;margin:0 auto;padding:28px 40px 44px}
 .svr .hero h1{font-size:52px;max-width:720px}
 .svr .lede{font-size:16px;max-width:560px}
 .svr .hero-cta{max-width:420px}
 .svr .sec-head p{font-size:15px;line-height:23px}
 .svr .preview{max-width:760px}
 .svr .ticker{margin:0}
 .svr .quotes{flex-direction:row}
 .svr .quotes > *{flex:1 1 0}
 .svr .price{max-width:560px}
 .svr .bar{padding:12px 40px}
 .svr .bar-in{max-width:1040px}
}
@media (prefers-reduced-motion:reduce){.svr .mark path{animation:none;stroke-dashoffset:0}.svr .shine::after{animation:none;display:none}.svr .beam::before{animation:none}.svr .hero-art{animation:none}.svr .track{animation:none}.svr .ticker{overflow-x:auto}.svr .sheet{animation:none}}
`;

const LockIcon = ({ color = "#ffffff", size = 12 }: { color?: string; size?: number }) => (
  <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CloseIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const SopVault = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const [payError, setPayError] = useState("");

  useEffect(() => {
    document.body.style.overflow = modalOpen || termsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen, termsOpen]);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#ffffff";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  useEffect(() => {
    initMetaPixel();
    trackMetaEvent("ViewContent", {
      content_name: "The SOP Vault",
      content_ids: ["sop-vault"],
      content_type: "product",
      value: PRICE,
      currency: "INR",
    });
  }, []);

  const openBuyModal = () => {
    setPayError("");
    setModalOpen(true);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setPayError("Please enter a valid email address");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setPayError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsProcessing(true);
    setPayError("");

    trackMetaEvent("InitiateCheckout", {
      content_name: "The SOP Vault",
      content_ids: ["sop-vault"],
      content_type: "product",
      value: PRICE,
      currency: "INR",
      num_items: 15,
    });

    try {
      const orderRes = await fetch(`${SUPABASE_URL}/functions/v1/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ email: cleanEmail, phone: cleanPhone, plan: "full" }),
      });
      const order = await orderRes.json();
      if (!order.success) throw new Error(order.error || "Payment initialisation failed");

      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Could not load the payment window. Please try again.");

      const rzp = new window.Razorpay({
        key: order.key,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "OnePercent Abroad",
        description: order.description,
        prefill: { email: order.email, contact: order.phone },
        theme: { color: "#040B2B" },
        handler: async (res: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          // Even if this call fails, the money is captured and razorpay-webhook
          // delivers the PDFs, so the buyer always lands on "check your email".
          try {
            await fetch(`${SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
              body: JSON.stringify(res),
            });
          } finally {
            navigate("/product/sop-vault/success");
          }
        },
        modal: { ondismiss: () => setIsProcessing(false) },
      });
      rzp.on("payment.failed", () => {
        setPayError("Payment didn't go through. Please try again. If money was deducted, your bank refunds it automatically.");
      });
      rzp.open();
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Failed to initialise payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="svr">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link className="brand" to="/">
              <span>1</span><span style={{ color: "#61a2fe" }}>%</span><span style={{ fontWeight: 500 }}>abroad</span>
            </Link>
            <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#c5ccea" }}>SOP Vault</div>
          </div>
          <div style={{ flex: "1 1 auto" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <h1>
              15 real{" "}
              <span className="mark">
                SOPs
                <svg aria-hidden="true" viewBox="0 0 220 80" preserveAspectRatio="none">
                  <path pathLength={1} d="M 168 14 C 206 22, 218 50, 176 64 C 126 78, 30 72, 14 46 C 2 26, 52 8, 116 10 C 176 12, 212 26, 206 44 C 200 62, 140 72, 86 66" />
                </svg>
              </span>
              <br />that got in.
            </h1>
            <p className="lede">Johns Hopkins, Hertie, Glasgow, Erasmus Mundus and more. Every statement annotated by a mentor so you see why it worked.</p>
          </div>
          <div className="hero-cta" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="cta shine beam" onClick={openBuyModal}>
              <span>Get all 15</span>
              <span style={{ color: "#c5ccea", textDecoration: "line-through", fontWeight: 500 }}>₹{OLD_PRICE}</span>
              <span>₹{PRICE}</span>
            </button>
            <div style={{ fontSize: 12, lineHeight: "18px", color: "#c5ccea", textAlign: "center" }}>Instant email delivery · UPI and cards · No upsells</div>
          </div>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <div style={{ padding: "22px 0 6px" }}>
        <div className="ribbon">
          <img src={img("dbe108eff1e5e378846f61a6b3539fa1", "png")} alt="Johns Hopkins, Hertie School, Glasgow, CEU, Sheffield, Leeds, Pisa, Keele, Freiburg, Sussex, Europubhealth+, MERGED and ACES STAR logos" />
        </div>
      </div>

      {/* ── THE PRODUCT ── */}
      <section className="sec" style={{ paddingTop: 40, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="sec-head">
          <h2>This is what lands in your inbox</h2>
          <p className="muted" style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500 }}>Each PDF opens with a one page strategy card, then the original Statement of Purpose with its key moves marked.</p>
        </div>
        <div className="preview">
          <figure>
            <img className="shot" src={img("4ff3df9e31d33c3d07a88fcab4c20875")} alt="Strategy card for the Johns Hopkins MPH statement" loading="lazy" />
            <figcaption>Strategy card · Johns Hopkins MPH</figcaption>
          </figure>
          <figure>
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", boxShadow: "0 10px 30px rgba(1,15,112,.14)" }}>
              <img src={img("59b04111fec1342744b46e75fe3b5710")} alt="Annotated SOP page, blurred until purchase" loading="lazy" style={{ width: "100%", height: "auto", display: "block", filter: "blur(3px)" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, background: "#010f70", color: "#fff", fontSize: 11, fontWeight: 600, borderRadius: 999, padding: "6px 10px" }}>
                  <LockIcon />Unlocks after payment
                </span>
              </div>
            </div>
            <figcaption>The annotated SOP</figcaption>
          </figure>
        </div>
      </section>

      {/* ── ALL 15 ── */}
      <section className="sec" id="vault" style={{ paddingTop: 36, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="sec-head" style={{ gap: 6 }}>
          <span className="eyebrow">Inside the vault</span>
          <h2>All 15 admits, campus by campus.</h2>
        </div>
        <div className="ticker">
          <div className="track">
            {[...admits, ...admits].map((a, i) => (
              <div className="tcard" key={i} aria-hidden={i >= admits.length ? true : undefined}>
                <img src={a.img} alt={`${a.uni}, ${a.prog}`} loading="lazy" />
                <b>{a.uni}</b>
                <span>{a.prog}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT YOU GET ── */}
      <section className="sec" style={{ paddingTop: 28, paddingBottom: 8 }}>
        <ul className="points">
          <li><i>1</i><span>Includes 1CR+ scholarship awarded SOP</span></li>
          <li><i>2</i><span>100% human written. No AI used.</span></li>
          <li><i>3</i><span>Verified by 1% Senior Mentors</span></li>
        </ul>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="sec" style={{ paddingTop: 36, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 22 }}>From people who bought it</h2>
        <div className="quotes">
          <blockquote className="note n1">
            <p>Reading the Hopkins statement showed me my opening was a biography, not an argument, and I rewrote it in a weekend.</p>
            <footer>Suman · applying to Erasmus Mundus, 2027 intake</footer>
          </blockquote>
          <blockquote className="note n2">
            <p>The mentor notes on the Glasgow SOP told me exactly where my research fit paragraph belonged, which no free sample ever did.</p>
            <footer>Muhsina · MSc Data Science, UK, 2027 intake</footer>
          </blockquote>
        </div>
      </section>

      {/* ── PRICE ── */}
      <section className="sec" id="pricing" style={{ paddingTop: 36, paddingBottom: 8 }}>
        <div className="price">
          <img className="bg" src={img("66152d288326d18b54afd49c98a05e63")} alt="" aria-hidden="true" loading="lazy" />
          <div className="veil" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: ".08em", textTransform: "uppercase", color: "#61a2fe" }}>The SOP Vault</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 40, fontWeight: 600, lineHeight: 1 }}>₹{PRICE}</span>
              <span style={{ fontSize: 16, color: "#c5ccea", textDecoration: "line-through" }}>₹{OLD_PRICE}</span>
            </div>
            <div style={{ fontSize: 13, color: "#c5ccea" }}>One payment. Yours forever.</div>
          </div>
          <ul>
            <li>15 annotated PDFs</li>
            <li>Sent to your email the moment payment clears</li>
          </ul>
          <button className="cta shine beam" onClick={openBuyModal}>Pay ₹{PRICE} and download</button>
          <div style={{ fontSize: 12, color: "#c5ccea", textAlign: "center" }}>UPI · Cards · Net banking</div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sec faq" id="faq" style={{ paddingTop: 36, paddingBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>Questions</h2>
        <div>
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="foot">
        <div>© 2026 OnePercent Abroad</div>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="linkbtn" onClick={() => setTermsOpen(true)}>Usage terms</button>
          <Link to="/product/sop-vault/feedback" style={{ textDecoration: "none" }}>Share feedback</Link>
        </div>
        <div>Watermarked PDFs, personal study only.</div>
        <details className="credits">
          <summary>Photo credits</summary>
          <ul>{credits.map((c) => <li key={c}>{c}</li>)}</ul>
          <div style={{ marginTop: 6 }}>
            All via <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>. Licences:{" "}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a>,{" "}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>,{" "}
            <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>.
          </div>
        </details>
      </footer>

      {/* ── STICKY BUY BAR ── */}
      <div className="bar">
        <div className="bar-in">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              <span style={{ color: "#4a5272", textDecoration: "line-through", fontWeight: 400, marginRight: 6 }}>₹{OLD_PRICE}</span>₹{PRICE}
            </div>
            <div style={{ fontSize: 11, color: "#4a5272" }}>All 15 SOPs · instant email</div>
          </div>
          <button className="cta shine beam" onClick={openBuyModal}>Get all 15</button>
        </div>
      </div>

      {/* ── CHECKOUT SHEET ── */}
      {modalOpen && (
        <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) setModalOpen(false); }}>
          <form className="sheet" onSubmit={handlePay} noValidate role="dialog" aria-modal="true" aria-label="Checkout">
            <div className="grab" aria-hidden="true" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill">The SOP Vault</span>
              <button type="button" className="close" aria-label="Close" onClick={() => setModalOpen(false)}><CloseIcon /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 600, lineHeight: "28px" }}>All 15 real admit SOPs</span>
              <span className="muted" style={{ fontSize: 13 }}>PDFs sent instantly · No account needed</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid rgba(1,15,112,.12)", borderBottom: "1px solid rgba(1,15,112,.12)", padding: "12px 0" }}>
              <span className="muted" style={{ fontSize: 14 }}>One time payment</span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 16, color: "#c0392b", textDecoration: "line-through" }}>₹{OLD_PRICE}</span>
                <span style={{ fontSize: 26, fontWeight: 600 }}>₹{PRICE}</span>
              </span>
            </div>

            <div className="field">
              <label htmlFor="sv-email">Email</label>
              <input id="sv-email" type="email" autoComplete="email" inputMode="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <span className="muted" style={{ fontSize: 12, lineHeight: "18px", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#065dc7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 14px", marginTop: 2 }}>
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" />
                </svg>
                Your SOPs go to this inbox. Use one you can open right now.
              </span>
            </div>
            <div className="field">
              <label htmlFor="sv-phone">WhatsApp number <span className="muted" style={{ fontWeight: 400 }}>(backup delivery)</span></label>
              <input id="sv-phone" type="tel" autoComplete="tel-national" inputMode="numeric" placeholder="10 digit number" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
            </div>

            <div className="methods" aria-label="Payment methods"><span>UPI</span><span>Cards</span><span>Net banking</span></div>

            <button type="submit" className="cta beam" disabled={isProcessing}>
              {isProcessing ? "Opening secure checkout…" : `Pay ₹${PRICE} and get the PDFs`}
            </button>
            {payError && <div className="pay-error" role="alert">{payError}</div>}

            <div className="muted" style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center", textAlign: "center", fontSize: 12, lineHeight: "18px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><LockIcon color="#4a5272" size={14} />Secured by Razorpay · UPI, cards, netbanking</span>
              <span>By paying you agree to the <button type="button" className="linkbtn" style={{ fontSize: 12 }} onClick={() => setTermsOpen(true)}>usage terms</button>.</span>
            </div>
          </form>
        </div>
      )}

      {/* ── TERMS MODAL ── */}
      {termsOpen && (
        <div className="tmd-bd" onClick={(e) => { if (e.target === e.currentTarget) setTermsOpen(false); }}>
          <div className="tmd" role="dialog" aria-modal="true" aria-label="Usage terms">
            <button className="close" aria-label="Close" onClick={() => setTermsOpen(false)}><CloseIcon /></button>
            <h2>Usage Terms &amp; Conditions</h2>
            <p>By purchasing any document from the 1% Admit Vault, you agree to the following terms. These are legally binding under applicable intellectual property and digital goods law.</p>
            <h4>1. Permitted Use</h4>
            <ul>
              <li><strong>Personal study only.</strong> Read, annotate, and learn from these documents to improve your own original SOP writing.</li>
              <li>You may not share your download link or files with any third party.</li>
            </ul>
            <h4>2. Strictly Prohibited</h4>
            <ul>
              <li><strong>No commercial use</strong>: no selling, licensing, or monetising.</li>
              <li><strong>No social media sharing</strong>: no posting on Instagram, LinkedIn, WhatsApp, Telegram, Reddit, or any other platform.</li>
              <li><strong>No redistribution</strong>: no forwarding or sharing with any person or institution.</li>
              <li><strong>No AI uploading</strong>: not to be fed into any AI tool or LLM platform.</li>
              <li><strong>No plagiarism</strong>: copying or imitating these SOPs for your own application is academic fraud.</li>
            </ul>
            <h4>3. Enforcement</h4>
            <p>Every download is digitally watermarked and tracked. Violations will be pursued with legal action and significant damages sought per instance.</p>
            <h4>4. Consent &amp; Confidentiality</h4>
            <p>All documents are shared with explicit written consent of original authors. Author identities are kept strictly confidential.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SopVault;
