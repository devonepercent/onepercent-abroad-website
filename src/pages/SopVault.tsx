import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import uniHopkins from "@/assets/uni/johns-hopkins.png";
import uniHertie from "@/assets/uni/hertie.png";
import uniErasmus from "@/assets/uni/erasmus-mundus.svg";
import uniNmbu from "@/assets/uni/nmbu.png";
import uniPisa from "@/assets/uni/pisa.png";
import uniCeu from "@/assets/uni/ceu.png";
import uniGlasgow from "@/assets/uni/glasgow.png";
import uniKeele from "@/assets/uni/keele.png";
import uniFreiburg from "@/assets/uni/freiburg.svg";
import uniLeeds from "@/assets/uni/leeds.png";
import uniSussex from "@/assets/uni/sussex.png";
import uniAces from "@/assets/uni/aces-star.png";
import uniSheffield from "@/assets/uni/sheffield.png";

const uniLogos = [
  { logo: uniHopkins,  name: "Johns Hopkins University" },
  { logo: uniHertie,   name: "Hertie School" },
  { logo: uniErasmus,  name: "Erasmus Mundus" },
  { logo: uniCeu,      name: "Central European University" },
  { logo: uniGlasgow,  name: "University of Glasgow" },
  { logo: uniLeeds,    name: "University of Leeds" },
  { logo: uniSheffield,name: "University of Sheffield" },
  { logo: uniFreiburg, name: "University of Freiburg" },
  { logo: uniSussex,   name: "University of Sussex" },
  { logo: uniPisa,     name: "University of Pisa" },
  { logo: uniKeele,    name: "Keele University" },
  { logo: uniNmbu,     name: "NMBU" },
  { logo: uniAces,     name: "ACES-STAR Consortium" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const PRICE = 199;
const OLD_PRICE = 799;

const scholMap: Record<string, string> = {
  crore: "schol-crore",
  full: "schol-full",
  partial: "schol-partial",
  waiver: "schol-waiver",
};

interface Sop {
  id: number;
  univ: string;
  logo: string;
  prog: string;
  loc: string;
  cat: string;
  cc: string;
  schol: string | null;
  scholText: string | null;
}

const sops: Sop[] = [
  { id: 2,  univ: "Johns Hopkins University",          logo: uniHopkins,  prog: "MA Public Policy (SAIS)",                 loc: "Washington DC, USA",     cat: "Public Policy",       cc: "badge-pp", schol: "crore",   scholText: "₹1 Crore Scholarship" },
  { id: 1,  univ: "Hertie School",                     logo: uniHertie,   prog: "MA Public Policy",                        loc: "Berlin, Germany",        cat: "Public Policy",       cc: "badge-pp", schol: "partial", scholText: "Partial Merit Scholarship" },
  { id: 3,  univ: "Erasmus Mundus (EMJM)",             logo: uniErasmus,  prog: "Erasmus Mundus Joint Master",             loc: "Multiple EU Countries",  cat: "Intl. Relations",     cc: "badge-ir", schol: "full",    scholText: "Full Erasmus Mundus Scholarship" },
  { id: 4,  univ: "NMBU — Norwegian Univ. of Life Sciences", logo: uniNmbu, prog: "MSc Agroecology",                       loc: "Ås, Norway",             cat: "Agriculture",         cc: "badge-ag", schol: "waiver",  scholText: "Tuition Fee Waiver" },
  { id: 5,  univ: "Europubhealth+",                    logo: uniErasmus,  prog: "European Public Health Master (EMJM)",    loc: "Multiple EU Countries",  cat: "Public Health",       cc: "badge-ph", schol: "full",    scholText: "Full Erasmus Mundus Scholarship" },
  { id: 6,  univ: "University of Pisa",                logo: uniPisa,     prog: "MSc AI & Data Engineering",               loc: "Pisa, Italy",            cat: "Data Science / AI",   cc: "badge-ai", schol: null,      scholText: null },
  { id: 7,  univ: "Central European University",       logo: uniCeu,      prog: "MA Public Policy",                        loc: "Vienna, Austria",        cat: "Public Policy",       cc: "badge-pp", schol: "partial", scholText: "Partial Scholarship" },
  { id: 8,  univ: "University of Glasgow",             logo: uniGlasgow,  prog: "MSc Data Science",                        loc: "Glasgow, Scotland",      cat: "Data Science",        cc: "badge-ds", schol: "waiver",  scholText: "Partial Tuition Fee Waiver" },
  { id: 9,  univ: "Keele University",                  logo: uniKeele,    prog: "MSc Environmental & Green Technology",    loc: "Staffordshire, UK",      cat: "Green Technology",    cc: "badge-gt", schol: null,      scholText: null },
  { id: 10, univ: "University of Freiburg",            logo: uniFreiburg, prog: "MSc Global Urban Health",                 loc: "Freiburg, Germany",      cat: "Public Health",       cc: "badge-ph", schol: null,      scholText: null },
  { id: 11, univ: "University of Leeds",               logo: uniLeeds,    prog: "MSc Sustainable Cities",                  loc: "Leeds, UK",              cat: "Urban Sustainability",cc: "badge-en", schol: "partial", scholText: "Merit-Based Partial Scholarship" },
  { id: 12, univ: "University of Glasgow",             logo: uniGlasgow,  prog: "MSc International Journalism",            loc: "Glasgow, Scotland",      cat: "Journalism",          cc: "badge-jn", schol: "waiver",  scholText: "Application Fee Waiver" },
  { id: 13, univ: "University of Sussex",              logo: uniSussex,   prog: "MA Development Studies",                  loc: "Brighton, UK",           cat: "Development",         cc: "badge-dv", schol: null,      scholText: null },
  { id: 14, univ: "ACES-STAR",                         logo: uniAces,     prog: "MSc Aquaculture, Environment & Society",  loc: "UK · Greece · France",   cat: "Marine / Env",        cc: "badge-mr", schol: "full",    scholText: "Full Erasmus Mundus Scholarship" },
  { id: 15, univ: "University of Sheffield",           logo: uniSheffield,prog: "MPH Public Health (Mgmt & Leadership)",   loc: "Sheffield, UK",          cat: "Public Health",       cc: "badge-ph", schol: "waiver",  scholText: "Tuition Fee Waiver" },
];

const faqs = [
  {
    q: "What exactly do I get?",
    a: "15 PDF files — one Statement of Purpose per file. Sent to your email instantly after payment. Nothing else. No videos, no templates, no analysis — just the real documents that got real students admitted.",
  },
  {
    q: "Are these real SOPs from actual admitted students?",
    a: "Yes — 100%. Every SOP belongs to a real student who was accepted to the programme listed. Not AI-generated, not fictional. Shared with the author's explicit consent. All identifying details kept strictly confidential.",
  },
  {
    q: "Will I get access immediately after payment?",
    a: "Yes — instantly. The moment your PayU payment is confirmed, your download link is emailed to you. Links stay live for 72 hours — save the PDFs to your device.",
  },
  {
    q: "Is there a refund policy?",
    a: "Because these are digital documents delivered instantly, refunds aren't possible after download. If you face a technical access issue, message us and we'll fix it.",
  },
  {
    q: "Can I share or copy these SOPs?",
    a: "No. Personal study only. Every download is digitally watermarked with your email. Sharing, uploading, redistributing, or copying for your own application violates our terms and is pursued under IP law.",
  },
];

const css = `
:root{--navy:#040B2B;--navy-mid:#021488;--orange:#065DC7;--orange-light:#61A2FE;--peach:#EBF2FF;--cream:#F5F8FF;--cream-warm:#EEF4FF;--white:#ffffff;--muted:#6B7A99;--border:rgba(6,93,199,0.15);--shadow-sm:0 2px 16px rgba(4,11,43,0.07);--shadow-md:0 10px 40px rgba(4,11,43,0.11);--shadow-lg:0 24px 72px rgba(4,11,43,0.16);--radius:18px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
section[aria-live="polite"]{position:fixed!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important}
.sv-root{font-family:'Outfit',sans-serif;background:var(--cream);color:var(--navy);overflow-x:hidden}
h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;line-height:1.15;font-weight:600}
a{text-decoration:none;color:inherit}

/* HERO */
.hero{padding:64px 7% 64px;background:linear-gradient(148deg,#040B2B 0%,#021488 55%,#030B58 100%);position:relative;overflow:hidden;text-align:center}
.hero::before{content:'';position:absolute;top:-80px;right:-80px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(97,162,254,0.12) 0%,transparent 65%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-60px;left:-40px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(6,93,199,0.1) 0%,transparent 65%);pointer-events:none}
.hero-inner{position:relative;z-index:2;max-width:760px;margin:0 auto}
.hero-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(97,162,254,0.15);color:var(--orange-light);font-size:0.7rem;font-weight:700;padding:6px 14px;border-radius:50px;margin-bottom:20px;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(97,162,254,0.25)}
.hero h1{font-size:clamp(2.2rem,4.2vw,3.6rem);color:white;margin-bottom:18px;line-height:1.1;letter-spacing:-0.02em}
.hero h1{margin-bottom:22px;font-family:'Outfit',sans-serif;font-weight:700;letter-spacing:-0.025em}
.hero h1 em{color:var(--orange-light);font-style:normal;font-weight:700}
.hero-sub{font-family:'Outfit',sans-serif;font-size:1rem;color:rgba(255,255,255,0.62);line-height:1.7;margin-bottom:32px;max-width:560px;margin-left:auto;margin-right:auto}
.hero-video{position:relative;width:100%;max-width:640px;margin:0 auto 28px;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;box-shadow:0 24px 64px rgba(0,0,0,0.55),0 0 0 1px rgba(97,162,254,0.25),0 0 0 4px rgba(97,162,254,0.08)}
.hero-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block}
.hero-video-cap{font-family:'Outfit',sans-serif;font-size:0.72rem;color:rgba(255,255,255,0.5);text-align:center;margin:-18px auto 26px;letter-spacing:0.04em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px}
.hero-video-cap::before,.hero-video-cap::after{content:'';width:24px;height:1px;background:rgba(255,255,255,0.18)}
.hero-cta-wrap{display:flex;flex-direction:column;gap:12px;align-items:center}
.btn-hero{background:var(--orange);color:white;padding:17px 38px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.95rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 6px 28px rgba(6,93,199,0.4);transition:all 0.25s;letter-spacing:0.03em;display:inline-flex;align-items:center;gap:10px;animation:pulse-btn 2.6s ease-in-out infinite}
@keyframes pulse-btn{0%,100%{box-shadow:0 6px 28px rgba(6,93,199,0.4)} 50%{box-shadow:0 10px 40px rgba(6,93,199,0.7)}}
.btn-hero:hover{background:var(--orange-light);color:var(--navy);transform:translateY(-2px);animation:none}
.hero-hint{font-family:'Outfit',sans-serif;font-size:0.78rem;color:rgba(255,255,255,0.45);letter-spacing:0.02em}
.hero-hint strong{color:rgba(255,255,255,0.75)}
.hero-honest{margin-top:14px;display:inline-block;font-family:'Outfit',sans-serif;font-size:0.7rem;color:rgba(255,255,255,0.55);background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);padding:6px 12px;border-radius:50px;letter-spacing:0.04em}

/* HERO MINI UNIS */
.hero-mini-unis{margin-top:26px;display:flex;justify-content:center}
.hmu-row{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;max-width:520px}
.hmu-pill{font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.78);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);padding:6px 12px;border-radius:50px;letter-spacing:0.02em;white-space:nowrap}
.hmu-pill.hmu-gold{color:#fde68a;background:rgba(180,83,9,0.22);border-color:rgba(253,230,138,0.3)}
.hmu-pill.hmu-more{color:var(--orange-light);background:rgba(97,162,254,0.12);border-color:rgba(97,162,254,0.3)}

/* HOW IT WORKS */
.howit-section{background:var(--white);padding:42px 6%;border-bottom:1px solid var(--border)}
.howit-wrap{max-width:1080px;margin:0 auto;display:flex;align-items:center;gap:14px;justify-content:space-between}
.howit-step{flex:1;display:flex;align-items:flex-start;gap:14px;min-width:0}
.howit-num{flex-shrink:0;width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--orange),var(--navy-mid));color:white;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:1.15rem;font-weight:700;box-shadow:0 4px 14px rgba(6,93,199,0.3)}
.howit-body{flex:1;min-width:0}
.howit-title{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:var(--navy);margin-bottom:3px;letter-spacing:-0.01em}
.howit-text{font-family:'Outfit',sans-serif;font-size:0.78rem;color:var(--muted);line-height:1.5}
.howit-arrow{flex-shrink:0;color:var(--orange);font-size:1.2rem;font-weight:700;opacity:0.5}

/* LOGO MARQUEE */
.logo-wrap{background:var(--cream);overflow:hidden;border-top:1px solid rgba(4,11,43,0.06);border-bottom:1px solid rgba(4,11,43,0.06);padding:6px 0;position:relative}
.logo-wrap::before,.logo-wrap::after{content:'';position:absolute;top:0;bottom:0;width:90px;z-index:2;pointer-events:none}
.logo-wrap::before{left:0;background:linear-gradient(90deg,var(--cream),transparent)}
.logo-wrap::after{right:0;background:linear-gradient(-90deg,var(--cream),transparent)}
.logo-eyebrow{text-align:center;font-family:'Outfit',sans-serif;font-size:0.66rem;font-weight:700;color:var(--muted);letter-spacing:0.14em;text-transform:uppercase;padding:14px 0 4px}
.logo-track{display:flex;white-space:nowrap;animation:marquee 38s linear infinite;align-items:center}
.logo-track:hover{animation-play-state:paused}
@keyframes marquee{0%{transform:translateX(0)} 100%{transform:translateX(-50%)}}
.logo-inner{display:flex;align-items:center}
.logo-item{display:inline-flex;align-items:center;justify-content:center;padding:20px 38px;height:88px;flex-shrink:0}
.logo-item img{height:48px;width:auto;max-width:160px;object-fit:contain;filter:grayscale(100%) brightness(0.55);opacity:0.7;transition:filter 0.25s,opacity 0.25s}
.logo-item:hover img{filter:grayscale(0%) brightness(1);opacity:1}

/* SECTIONS */
.sv-root section{padding:72px 7%}
.section-eyebrow{display:inline-flex;align-items:center;gap:6px;color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;margin-bottom:12px}
.section-title{font-size:clamp(1.8rem,3vw,2.5rem);color:var(--navy);margin-bottom:14px;letter-spacing:-0.02em}
.section-sub{font-family:'Outfit',sans-serif;font-size:0.95rem;color:var(--muted);max-width:560px;line-height:1.75;margin-bottom:40px}
.section-head-center{text-align:center;max-width:640px;margin:0 auto 44px}
.section-head-center .section-sub{margin-left:auto;margin-right:auto;margin-bottom:0}

/* VAULT GRID */
.vault-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:1160px;margin:0 auto}
.vault-swipe-hint{display:none}
.vcard{background:var(--white);border:1px solid rgba(4,11,43,0.08);border-radius:10px;overflow:hidden;display:flex;flex-direction:column;transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s;position:relative}
.vcard:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(4,11,43,0.08);border-color:rgba(4,11,43,0.18)}
.vcard-num{position:absolute;top:12px;right:12px;font-family:'Outfit',sans-serif;font-size:0.65rem;color:var(--muted);background:transparent;border:none;width:auto;height:auto;border-radius:0;display:flex;align-items:center;justify-content:center;font-weight:600;letter-spacing:0.1em;opacity:0.55}
.vcard-body{padding:22px 20px 18px;display:flex;flex-direction:column;gap:10px;flex:1}
.vcard .badges{display:flex;gap:6px;flex-wrap:wrap;margin-right:36px}
.badge{padding:4px 10px;border-radius:6px;font-family:'Outfit',sans-serif;font-size:0.6rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;background:rgba(4,11,43,0.05);color:var(--navy);border:1px solid rgba(4,11,43,0.08)}
.badge-univ,.badge-pp,.badge-ds,.badge-ph,.badge-jn,.badge-en,.badge-ag,.badge-mr,.badge-ir,.badge-dv,.badge-gt,.badge-ai{background:rgba(4,11,43,0.05);color:var(--navy);border:1px solid rgba(4,11,43,0.08)}
.vcard-logo{display:flex;align-items:center;justify-content:center;min-height:64px;padding:8px 4px;margin:2px 0 4px}
.vcard-logo img{max-height:54px;max-width:100%;width:auto;object-fit:contain}
.vcard-prog{font-family:'Outfit',sans-serif;font-size:0.82rem;color:var(--muted);font-weight:500;line-height:1.4}
.vcard-loc{font-family:'Outfit',sans-serif;font-size:0.72rem;color:var(--muted);margin-top:auto;padding-top:6px;display:flex;align-items:center;gap:4px}
.schol-banner{display:flex;align-items:center;gap:7px;padding:10px 14px;font-family:'Outfit',sans-serif;font-size:0.62rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap;justify-content:center;background:#0a1638;color:rgba(255,255,255,0.78);border-top:1px solid rgba(255,255,255,0.06)}
.schol-crore{background:#0a1638;color:#f5d089;border-top:2px solid #b45309}
.schol-full{background:#0a1638;color:#a7d8c1;border-top:2px solid #047857}
.schol-partial{background:#0a1638;color:rgba(255,255,255,0.7);border-top:1px solid rgba(255,255,255,0.18)}
.schol-waiver{background:#0a1638;color:rgba(255,255,255,0.6);border-top:1px solid rgba(255,255,255,0.12)}
.schol-admit{background:#0a1638;color:rgba(255,255,255,0.5);border-top:1px solid rgba(255,255,255,0.08)}

/* PRICING — single block */
.pricing-section{background:var(--cream-warm);padding:70px 6%;position:relative}
.pricing-section::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--navy),var(--orange),var(--orange-light))}
.pricing-wrap{max-width:520px;margin:0 auto;text-align:center}
.pricing-eyebrow{display:inline-flex;align-items:center;gap:6px;color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;margin-bottom:10px}
.pricing-title{font-size:clamp(1.7rem,2.8vw,2.2rem);color:var(--navy);letter-spacing:-0.02em;margin-bottom:24px}
.pcard{background:var(--navy);border:1.5px solid var(--orange);border-radius:22px;padding:36px 32px 30px;text-align:left;position:relative;overflow:hidden;box-shadow:0 16px 56px rgba(4,11,43,0.25),0 0 0 1px rgba(6,93,199,0.3)}
.pcard::before{content:'';position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(97,162,254,0.22),transparent 70%);pointer-events:none}
.pcard-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(97,162,254,0.18);color:var(--orange-light);font-family:'Outfit',sans-serif;font-size:0.65rem;font-weight:700;padding:5px 12px;border-radius:50px;letter-spacing:0.07em;text-transform:uppercase;margin-bottom:14px;border:1px solid rgba(97,162,254,0.3)}
.pcard-name{font-family:'Outfit',sans-serif;font-size:1.4rem;font-weight:700;color:white;margin-bottom:4px;letter-spacing:-0.01em}
.pcard-desc{font-family:'Outfit',sans-serif;font-size:0.85rem;color:rgba(255,255,255,0.55);margin-bottom:20px}
.pcard-price{font-family:'Outfit',sans-serif;font-size:3rem;font-weight:700;color:white;line-height:1;margin-bottom:6px;display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;letter-spacing:-0.02em}
.price-old{color:#ef4444;text-decoration:line-through;text-decoration-color:#dc2626;text-decoration-thickness:2.5px;font-weight:700;letter-spacing:-0.01em}
.pcard-old{font-family:'Outfit',sans-serif;font-size:1.9rem;font-weight:600;color:#fca5a5;text-decoration:line-through;text-decoration-color:#ef4444;text-decoration-thickness:3px;margin-right:8px;line-height:1;letter-spacing:-0.01em}
.modal-old{font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:#dc2626;text-decoration-thickness:2.5px;margin-right:8px;letter-spacing:-0.01em}
.sticky-old{font-family:'Cormorant Garamond',serif;font-size:1rem;color:#dc2626;text-decoration-thickness:2px;margin-right:4px}
.btn-hero .price-old,.btn-footer .price-old,.btn-pcard .price-old{color:rgba(255,255,255,0.72);text-decoration-color:#fca5a5;text-decoration-thickness:2.5px;margin-right:5px;font-weight:700}
.hero h1 .price-old{color:#fca5a5;text-decoration-color:#ef4444;text-decoration-thickness:3px;margin-right:10px;font-style:italic}
.pricing-title .price-old{color:#dc2626;font-family:'Cormorant Garamond',serif;text-decoration-thickness:2.5px;margin-right:8px}
.footer-cta h2 .price-old{color:#fca5a5;text-decoration-color:#ef4444;text-decoration-thickness:3px;margin-right:10px}
.pcard-price .curr{font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:500;color:rgba(255,255,255,0.6)}
.pcard-price-note{font-family:'Outfit',sans-serif;font-size:0.78rem;color:rgba(255,255,255,0.5);margin-bottom:22px}
.pcard-features{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
.pcard-feat{display:flex;align-items:flex-start;gap:9px;font-family:'Outfit',sans-serif;font-size:0.86rem;color:rgba(255,255,255,0.85);line-height:1.5}
.feat-ck{color:var(--orange-light);font-size:0.9rem;flex-shrink:0;margin-top:1px;font-weight:700}
.btn-pcard{width:100%;padding:17px 20px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;border:none;background:var(--orange);color:white;box-shadow:0 6px 24px rgba(6,93,199,0.38);transition:all 0.22s;letter-spacing:0.04em;text-transform:uppercase;animation:pulse-btn 2.6s ease-in-out infinite}
.btn-pcard:hover{background:var(--orange-light);color:var(--navy);transform:scale(1.02);animation:none}
.terms-link{color:var(--orange);font-weight:600;cursor:pointer;text-decoration:underline;background:none;border:none;padding:0;font-family:inherit;font-size:inherit}

/* TERMS MODAL */
.tmd-backdrop{display:none;position:fixed;inset:0;z-index:300;background:rgba(4,11,43,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center}
.tmd-backdrop.open{display:flex;animation:fadeIn 0.2s ease}
.tmd{background:var(--white);width:90%;max-width:620px;max-height:80vh;overflow-y:auto;border-radius:22px;padding:40px;position:relative;animation:scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)}
@keyframes scaleIn{from{transform:scale(0.9);opacity:0}to{transform:scale(1);opacity:1}}
.tmd h2{font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:var(--navy);margin-bottom:18px}
.tmd p{font-family:'Outfit',sans-serif;font-size:0.83rem;color:var(--muted);line-height:1.7;margin-bottom:14px}
.tmd h4{font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--navy);margin:20px 0 8px}
.tmd ul{padding-left:18px;display:flex;flex-direction:column;gap:8px}
.tmd li{font-family:'Outfit',sans-serif;font-size:0.82rem;color:var(--muted);line-height:1.65}
.tmd li strong{color:var(--navy)}
.btn-xt{position:absolute;top:18px;right:20px;background:var(--border);border:none;width:34px;height:34px;border-radius:50%;font-size:0.95rem;cursor:pointer;color:var(--navy);display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.btn-xt:hover{background:#ddd}

/* PAY MODAL */
.modal-bd{display:none;position:fixed;inset:0;z-index:200;background:rgba(4,11,43,0.72);backdrop-filter:blur(8px);align-items:flex-end;justify-content:center}
.modal-bd.open{display:flex;animation:fadeIn 0.22s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--white);width:100%;max-width:560px;max-height:92vh;border-radius:26px 26px 0 0;overflow-y:auto;padding:40px;animation:slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);position:relative}
@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-close{position:absolute;top:18px;right:20px;background:var(--border);border:none;width:36px;height:36px;border-radius:50%;font-size:1rem;cursor:pointer;color:var(--navy);display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.modal-close:hover{background:#ddd}
.modal-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(6,93,199,0.09);color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.7rem;font-weight:700;padding:5px 12px;border-radius:50px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:600;color:var(--navy);margin-bottom:6px;letter-spacing:-0.01em}
.modal-prog{font-family:'Outfit',sans-serif;font-size:0.86rem;color:var(--muted);margin-bottom:22px}
.modal-price-row{display:flex;align-items:baseline;justify-content:space-between;padding:18px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:22px}
.modal-price-row .lbl{font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--muted)}
.modal-price{font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:600;color:var(--navy);line-height:1}
.modal-price .curr{font-family:'Outfit',sans-serif;font-size:1rem;color:var(--muted)}
.modal-fields{display:flex;flex-direction:column;gap:10px;margin-bottom:14px}
.modal-input{padding:14px 18px;border-radius:50px;border:1.5px solid var(--border);font-family:'Outfit',sans-serif;font-size:0.9rem;color:var(--navy);outline:none;transition:border-color 0.2s;background:white}
.modal-input:focus{border-color:var(--orange)}
.btn-pay{background:var(--orange);color:white;border:none;border-radius:50px;padding:16px 28px;font-family:'Outfit',sans-serif;font-size:0.92rem;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(6,93,199,0.32);transition:all 0.22s;display:flex;align-items:center;justify-content:center;gap:8px;letter-spacing:0.04em;text-transform:uppercase;width:100%}
.btn-pay:hover:not(:disabled){background:var(--navy);transform:translateY(-2px)}
.btn-pay:disabled{opacity:0.6;cursor:not-allowed}
.pay-error{font-family:'Outfit',sans-serif;font-size:0.78rem;color:#dc2626;margin-top:8px}
.rzp{font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;font-size:0.7rem;color:var(--muted);margin-top:14px}

/* FAQ */
.faq-wrap{max-width:720px;margin:0 auto}
.faq-item{border-bottom:1px solid var(--border);padding:20px 0;cursor:pointer}
.faq-q{display:flex;justify-content:space-between;align-items:center;font-family:'Outfit',sans-serif;font-weight:600;font-size:0.95rem;color:var(--navy);gap:16px}
.faq-icon{font-size:1rem;color:var(--orange);transition:transform 0.25s;flex-shrink:0}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-a{font-family:'Outfit',sans-serif;font-size:0.88rem;color:var(--muted);line-height:1.75;max-height:0;overflow:hidden;transition:max-height 0.4s ease,padding-top 0.3s}
.faq-item.open .faq-a{max-height:260px;padding-top:14px}

/* FOOTER CTA */
.footer-cta{background:var(--navy);margin:0 4% 40px;border-radius:24px;padding:68px 8%;text-align:center;position:relative;overflow:hidden}
.footer-cta::after{content:'';position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(97,162,254,0.16),transparent 65%);pointer-events:none}
.footer-cta h2{font-size:clamp(1.7rem,3vw,2.6rem);color:white;margin-bottom:14px;letter-spacing:-0.02em;position:relative;z-index:2}
.footer-cta p{font-family:'Outfit',sans-serif;color:rgba(255,255,255,0.55);font-size:0.95rem;margin-bottom:32px;position:relative;z-index:2}
.btn-footer{background:var(--orange);color:white;padding:16px 36px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 26px rgba(6,93,199,0.38);transition:all 0.25s;letter-spacing:0.03em;position:relative;z-index:2}
.btn-footer:hover{background:var(--orange-light);color:var(--navy);transform:translateY(-2px)}
.sv-footer{text-align:center;padding:24px 5%;font-family:'Outfit',sans-serif;font-size:0.75rem;color:var(--muted);border-top:1px solid var(--border)}

/* MOBILE STICKY */
.mob-sticky{display:none;position:fixed;bottom:0;left:0;right:0;z-index:150;background:var(--white);border-top:1px solid var(--border);padding:10px 16px max(10px,env(safe-area-inset-bottom));box-shadow:0 -4px 22px rgba(0,0,0,0.12);align-items:center;justify-content:space-between;gap:12px}
.sticky-info{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
.sticky-lbl{font-family:'Outfit',sans-serif;font-size:0.78rem;color:var(--muted);font-weight:500}
.sticky-price{font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:var(--navy);font-weight:700;line-height:1.05;display:flex;align-items:baseline;gap:4px}
.sticky-sub{font-family:'Outfit',sans-serif;font-size:0.65rem;color:var(--muted);letter-spacing:0.02em}
.btn-sticky-mob{background:var(--orange);color:white;border:none;border-radius:50px;padding:14px 22px;font-family:'Outfit',sans-serif;font-size:0.85rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;box-shadow:0 4px 16px rgba(6,93,199,0.36);min-height:48px}

/* RESPONSIVE */
@media(max-width:960px){
  .hero{padding:48px 5% 44px}
  .vault-grid{grid-template-columns:repeat(2,1fr);gap:14px}
  .pricing-section{padding:48px 5%}
  .pcard{padding:28px 22px 24px}
  .modal{padding:28px 22px 32px;border-radius:20px 20px 0 0}
  .mob-sticky{display:flex}
  .sv-root{padding-bottom:84px}
  .terms-banner{flex-direction:column;gap:10px}
  .sv-root section{padding:48px 5%}
  .howit-section{padding:34px 5%}
  .howit-wrap{gap:10px}
  .howit-arrow{font-size:1rem}
}
@media(max-width:600px){
  /* HERO — compress */
  .hero{padding:36px 5% 32px}
  .hero h1{font-size:clamp(1.95rem,8vw,2.4rem);margin-bottom:14px}
  .hero-sub{font-size:0.9rem;margin-bottom:24px;line-height:1.6}
  .hero-eyebrow{font-size:0.65rem;padding:5px 12px;margin-bottom:16px}
  .btn-hero{padding:16px 24px;font-size:0.92rem;width:100%;justify-content:center;min-height:52px}
  .hero-hint{font-size:0.72rem;text-align:center}
  .hero-honest{font-size:0.66rem;padding:5px 11px;margin-top:10px}
  .hero-cta-wrap{display:none}
  .hero-mini-unis{margin-top:18px}
  .hmu-pill{font-size:0.68rem;padding:5px 10px}
  .hero-video{border-radius:12px;margin-bottom:18px;box-shadow:0 16px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(97,162,254,0.2)}
  .hero-video-cap{font-size:0.65rem;margin:-10px auto 16px;gap:6px}
  .hero-video-cap::before,.hero-video-cap::after{width:18px}

  /* HOW IT WORKS — vertical stack on phone */
  .howit-section{padding:28px 5% 24px}
  .howit-wrap{flex-direction:column;gap:0;align-items:stretch}
  .howit-step{padding:14px 0;border-bottom:1px dashed var(--border);gap:14px;align-items:center}
  .howit-step:last-child{border-bottom:none;padding-bottom:0}
  .howit-step:first-child{padding-top:0}
  .howit-arrow{display:none}
  .howit-num{width:34px;height:34px;font-size:1rem}
  .howit-title{font-size:1rem;margin-bottom:1px}
  .howit-text{font-size:0.76rem}

  /* SECTION PADDING */
  .sv-root section{padding:36px 5%}
  .section-title{font-size:clamp(1.5rem,5.5vw,1.9rem)}
  .section-sub{font-size:0.88rem;margin-bottom:28px}
  .section-head-center{margin-bottom:28px}

  /* VAULT GRID — horizontal swipe carousel on mobile */
  .vault-grid{display:flex;grid-template-columns:none;overflow-x:auto;overflow-y:visible;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;gap:12px;padding:4px 5% 18px;margin:0 -5%;scrollbar-width:none}
  .vault-grid::-webkit-scrollbar{display:none}
  .vcard{flex:0 0 74%;min-width:74%;scroll-snap-align:start;border-radius:10px}
  .vcard-num{font-size:0.55rem;top:8px;right:10px;letter-spacing:0.08em}
  .vault-swipe-hint{display:block;text-align:center;font-family:'Outfit',sans-serif;font-size:0.66rem;color:var(--muted);letter-spacing:0.14em;text-transform:uppercase;margin-top:4px;opacity:0.6}
  .vcard-body{padding:14px 12px 14px;gap:7px}
  .vcard .badges{margin-right:28px}
  .badge{font-size:0.55rem;padding:3px 8px}
  .vcard-uni{font-size:0.92rem;line-height:1.2}
  .vcard-prog{font-size:0.7rem;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .vcard-loc{font-size:0.65rem;padding-top:4px}
  /* schol → top strip (uniform heights, no truncation) */
  .schol-banner{order:-1;padding:6px 8px;font-size:0.54rem;letter-spacing:0.04em;gap:5px;line-height:1.1;flex-wrap:wrap;text-align:center}
  .schol-banner .schol-icon{font-size:0.75rem}

  /* PRICING */
  .pricing-section{padding:36px 5%}
  .pricing-title{font-size:1.6rem;margin-bottom:18px}
  .pcard{padding:24px 18px 22px;border-radius:18px}
  .pcard-price{font-size:2.8rem}
  .pcard-name{font-size:1.3rem}
  .pcard-desc{font-size:0.8rem;margin-bottom:16px}
  .pcard-price-note{font-size:0.74rem;margin-bottom:18px}
  .pcard-features{gap:8px;margin-bottom:20px}
  .pcard-feat{font-size:0.82rem}
  .btn-pcard{padding:16px 18px;font-size:0.88rem;min-height:52px}
  .pm-pill{font-size:0.6rem;padding:4px 9px}

  /* MODAL — full-screen feel */
  .modal{padding:24px 18px 28px;max-height:96vh}
  .modal-title{font-size:1.35rem}
  .modal-prog{font-size:0.8rem;margin-bottom:16px}
  .modal-tag{font-size:0.65rem}
  .modal-price{font-size:2rem}
  .modal-price-row{padding:14px 0;margin-bottom:18px}
  .modal-input{padding:15px 18px;font-size:0.92rem;min-height:50px}
  .btn-pay{padding:17px 24px;font-size:0.95rem;min-height:54px}

  /* TERMS */
  .terms-banner{margin:24px 0 0;padding:18px 18px}
  .terms-title{font-size:0.95rem}
  .terms-text{font-size:0.76rem}

  /* FAQ */
  .faq-q{font-size:0.88rem}
  .faq-a{font-size:0.84rem}

  /* FOOTER CTA */
  .footer-cta{margin:0 3% 32px;padding:42px 5%;border-radius:18px}
  .footer-cta h2{font-size:1.55rem}
  .footer-cta p{font-size:0.88rem;margin-bottom:24px}
  .btn-footer{width:100%;padding:16px 24px;font-size:0.9rem;min-height:52px}

  /* LOGO MARQUEE — mobile */
  .logo-wrap::before,.logo-wrap::after{width:44px}
  .logo-eyebrow{font-size:0.6rem;padding:10px 0 2px;letter-spacing:0.12em}
  .logo-item{padding:14px 20px;height:64px}
  .logo-item img{height:34px;max-width:110px;filter:grayscale(100%) brightness(0.6);opacity:0.8}
  .logo-track{animation-duration:18s}

  /* VAULT CARD LOGO — mobile */
  .vcard-logo{min-height:48px;padding:6px 2px;margin:1px 0 3px}
  .vcard-logo img{max-height:38px}
}
`;

const SopVault = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    document.body.style.overflow = modalOpen || termsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen, termsOpen]);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#040B2B";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  const openBuyModal = () => {
    setPayError("");
    setModalOpen(true);
  };

  const handlePay = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

    try {
      const hashRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-payu-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({
          email,
          phone: cleanPhone,
          plan: "full",
          selected_sop_ids: [],
          amount: PRICE,
        }),
      });
      const hashData = await hashRes.json();
      if (!hashData.success) throw new Error(hashData.error || "Payment initialisation failed");

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

  return (
    <div className="sv-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── HERO ── */}
      <section className="hero">
        <Link to="/" style={{ display: "inline-block", marginBottom: 28, position: "relative", zIndex: 2 }}>
          <img src={logoWhite} alt="OnePercent Abroad" style={{ height: 36, width: "auto" }} />
        </Link>
        <div className="hero-inner">
          <div className="hero-eyebrow">Real Admits · Verified PDFs</div>
          <h1>15 Winning SOPs.<br /><em><span className="price-old">₹799</span>₹199.</em></h1>
          <div className="hero-video">
            <iframe
              src="https://www.youtube.com/embed/Lp4neH4_TKk?rel=0&modestbranding=1&playsinline=1"
              title="The SOP Vault — Why Real SOPs Matter"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="hero-cta-wrap">
            <button className="btn-hero" onClick={openBuyModal}>
              Get All 15 SOPs — <span className="price-old">₹799</span>₹199 →
            </button>
            <div className="hero-hint">Instant email delivery · <strong>No upsells</strong></div>
          </div>

          <div className="hero-mini-unis">
            <div className="hmu-row">
              <span className="hmu-pill hmu-gold">JHU · ₹1 Cr</span>
              <span className="hmu-pill">Erasmus Mundus ×4</span>
              <span className="hmu-pill">Hertie</span>
              <span className="hmu-pill">CEU</span>
              <span className="hmu-pill hmu-more">+11 more</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO MARQUEE ── */}
      <div className="logo-wrap">
        <div className="logo-track">
          <div className="logo-inner">
            {[...uniLogos, ...uniLogos].map((u, i) => (
              <div className="logo-item" key={i}>
                <img src={u.logo} alt={u.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="howit-section">
        <div className="howit-wrap">
          <div className="howit-step">
            <div className="howit-num">1</div>
            <div className="howit-body">
              <div className="howit-title">Pay ₹199</div>
              <div className="howit-text">UPI, cards, net banking — secured by PayU</div>
            </div>
          </div>
          <div className="howit-arrow">→</div>
          <div className="howit-step">
            <div className="howit-num">2</div>
            <div className="howit-body">
              <div className="howit-title">Check your email</div>
              <div className="howit-text">Download link sent within seconds</div>
            </div>
          </div>
          <div className="howit-arrow">→</div>
          <div className="howit-step">
            <div className="howit-num">3</div>
            <div className="howit-body">
              <div className="howit-title">Read all 15 SOPs</div>
              <div className="howit-text">72-hour download window — save to device</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VAULT GRID ── */}
      <section id="vault">
        <div className="section-head-center">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>Inside the Vault</div>
          <h2 className="section-title">15 Real Admits. 15 PDFs.</h2>
          <p className="section-sub">
            Every SOP belongs to a real student who got in — shared with their consent.
          </p>
        </div>

        <div className="vault-grid">
          {sops.map((s, i) => (
            <div key={s.id} className="vcard">
              <div className="vcard-num">{String(i + 1).padStart(2, "0")}</div>
              <div className="vcard-body">
                <div className="badges">
                  <span className={`badge ${s.cc}`}>{s.cat}</span>
                </div>
                <div className="vcard-logo">
                  <img src={s.logo} alt={s.univ} loading="lazy" />
                </div>
                <div className="vcard-prog">{s.prog}</div>
                <div className="vcard-loc">{s.loc}</div>
              </div>
              {s.schol ? (
                <div className={`schol-banner ${scholMap[s.schol]}`}>
                  {s.scholText}
                </div>
              ) : (
                <div className="schol-banner schol-admit">
                  Admitted
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="vault-swipe-hint">← Swipe to explore all 15 →</div>
      </section>

      {/* ── PRICING ── */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-wrap">
          <div className="pricing-eyebrow">One Price · No Tiers</div>
          <h2 className="pricing-title">Everything for <span className="price-old">₹799</span>₹199</h2>

          <div className="pcard">
            <div className="pcard-tag">Launch Price</div>
            <div className="pcard-name">The SOP Vault</div>
            <div className="pcard-desc">All 15 real admit SOPs · One payment · Yours forever</div>

            <div className="pcard-price">
              <span className="pcard-old">₹{OLD_PRICE}</span>
              <span className="curr">₹</span>{PRICE}
            </div>
            <div className="pcard-price-note">SOP consultants charge ₹15,000+ per draft. This is 15 real admit SOPs for ₹199.</div>

            <div className="pcard-features">
              <div className="pcard-feat"><span className="feat-ck">✓</span> 15 PDF SOPs from real admitted students</div>
              <div className="pcard-feat"><span className="feat-ck">✓</span> Includes JHU ₹1Cr scholar + 4 Erasmus Mundus full scholars</div>
              <div className="pcard-feat"><span className="feat-ck">✓</span> Sent to your email instantly after payment</div>
              <div className="pcard-feat"><span className="feat-ck">✓</span> Watermarked for your eyes only</div>
              <div className="pcard-feat"><span className="feat-ck">✓</span> No subscription · No upsells · One-time purchase</div>
            </div>

            <button className="btn-pcard" onClick={openBuyModal}>
              Pay <span className="price-old">₹{OLD_PRICE}</span>₹{PRICE} & Download Now →
            </button>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <section id="faq">
        <div className="section-head-center">
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>Questions</div>
          <h2 className="section-title">Frequently Asked</h2>
        </div>
        <div className="faq-wrap">
          {faqs.map((f, i) => (
            <div key={i} className={`faq-item${openFaqIdx === i ? " open" : ""}`} onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}>
              <div className="faq-q">{f.q}<span className="faq-icon">+</span></div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <div className="footer-cta">
        <h2><span className="price-old">₹799</span>₹199. 15 real SOPs.<br />Skip the guesswork.</h2>
        <p>One payment. Instant email delivery. No upsells.</p>
        <button className="btn-footer" onClick={openBuyModal}>Get All 15 — <span className="price-old">₹{OLD_PRICE}</span>₹{PRICE} →</button>
      </div>

      <footer className="sv-footer">
        <p>© 2025 OnePercent Abroad · <button className="terms-link" style={{ fontSize: "0.75rem" }} onClick={() => setTermsOpen(true)}>Usage Terms</button></p>
      </footer>

      {/* ── MOBILE STICKY ── */}
      <div className="mob-sticky">
        <div className="sticky-info">
          <div className="sticky-price"><span className="sticky-old price-old">₹{OLD_PRICE}</span>₹{PRICE} <span className="sticky-lbl">· All 15 SOPs</span></div>
          <div className="sticky-sub">UPI · Cards · Instant email</div>
        </div>
        <button className="btn-sticky-mob" onClick={openBuyModal}>Checkout →</button>
      </div>

      {/* ── PAY MODAL ── */}
      <div className={`modal-bd${modalOpen ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal">
          <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          <div className="modal-tag">The SOP Vault</div>
          <div className="modal-title">All 15 Real Admit SOPs</div>
          <div className="modal-prog">PDFs sent instantly · Personal study only</div>

          <div className="modal-price-row">
            <div className="lbl">One-time payment</div>
            <div className="modal-price"><span className="modal-old price-old">₹{OLD_PRICE}</span><span className="curr">₹</span>{PRICE}</div>
          </div>

          <div className="modal-fields">
            <input
              className="modal-input"
              type="email"
              placeholder="your@email.com — we'll send PDFs here"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className="modal-input"
              type="tel"
              placeholder="Phone number (10 digits)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <button className="btn-pay" onClick={handlePay} disabled={isProcessing}>
            {isProcessing ? "Redirecting to PayU…" : `Pay ₹${PRICE} & Download`}
          </button>
          {payError && <div className="pay-error">{payError}</div>}
          <div className="rzp">Secured by PayU · Safe &amp; Encrypted</div>
        </div>
      </div>

      {/* ── TERMS MODAL ── */}
      <div className={`tmd-backdrop${termsOpen ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setTermsOpen(false); }}>
        <div className="tmd">
          <button className="btn-xt" onClick={() => setTermsOpen(false)}>✕</button>
          <h2>Usage Terms &amp; Conditions</h2>
          <p>By purchasing any document from the 1% Admit Vault, you agree to the following terms. These are legally binding under applicable intellectual property and digital goods law.</p>
          <h4>1. Permitted Use</h4>
          <ul>
            <li><strong>Personal study only.</strong> Read, annotate, and learn from these documents to improve your own original SOP writing.</li>
            <li>You may not share your download link or files with any third party.</li>
          </ul>
          <h4>2. Strictly Prohibited</h4>
          <ul>
            <li><strong>No commercial use</strong> — no selling, licensing, or monetising.</li>
            <li><strong>No social media sharing</strong> — no posting on Instagram, LinkedIn, WhatsApp, Telegram, Reddit, or any other platform.</li>
            <li><strong>No redistribution</strong> — no forwarding or sharing with any person or institution.</li>
            <li><strong>No AI uploading</strong> — not to be fed into any AI tool or LLM platform.</li>
            <li><strong>No plagiarism</strong> — copying or imitating these SOPs for your own application is academic fraud.</li>
          </ul>
          <h4>3. Enforcement</h4>
          <p>Every download is digitally watermarked and tracked. Violations will be pursued with legal action and significant damages sought per instance.</p>
          <h4>4. Consent &amp; Confidentiality</h4>
          <p>All documents are shared with explicit written consent of original authors. Author identities are kept strictly confidential.</p>
        </div>
      </div>
    </div>
  );
};

export default SopVault;
