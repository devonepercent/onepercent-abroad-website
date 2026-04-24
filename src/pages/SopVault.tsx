import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const themes = ["tp", "ts", "tg", "tl", "tr", "tgo"];
const reveals = ["✦ Read this SOP", "✦ Your edge is inside", "✦ Unlock this admit", "✦ Study this strategy", "✦ See what worked", "✦ This one got in"];
const scholMap: Record<string, string> = { crore: "schol-crore", full: "schol-full", partial: "schol-partial", waiver: "schol-waiver" };
const scholIcon: Record<string, string> = { crore: "🏆", full: "🎓", partial: "🎖️", waiver: "✳️" };

interface Sop {
  id: number; univ: string; prog: string; loc: string; cat: string; cc: string;
  w: string; sec: string; tone: string; fit: string;
  schol: string | null; scholText: string | null;
  note: string; excerpt: string; i1: string; i2: string; i3: string;
}

const sops: Sop[] = [
  { id: 2, univ: "Johns Hopkins University", prog: "MA Public Policy (SAIS)", loc: "Washington DC, USA", cat: "Public Policy", cc: "badge-pp", w: "~980", sec: "4", tone: "Confident", fit: "97%", schol: "crore", scholText: "₹1 Crore Scholarship Awarded 🏆", note: "This SOP excelled by showcasing deep interest in global public policy combined with quantitative and analytical skills. The specific mention of SAIS location and interdisciplinary approach helped achieve a clear career vision in international development.", excerpt: "Specific, confident narrative linking DC policy ecosystem to a clear career vision — earned a 1 Cr scholarship.", i1: "Quantitative and analytical skills tied directly to programme strengths", i2: "Washington DC location used strategically as part of career reasoning", i3: "Interdisciplinary framing helped it stand out in a highly competitive admissions pool" },
  { id: 1, univ: "Hertie School", prog: "MA Public Policy", loc: "Berlin, Germany", cat: "Public Policy", cc: "badge-pp", w: "~950", sec: "5", tone: "Analytical", fit: "98%", schol: "partial", scholText: "Partial Merit Scholarship Awarded", note: "The applicant clearly demonstrated a strong alignment between their academic background and Hertie's rigorous, practice-oriented programme. The SOP stood out by weaving personal motivation with specific policy challenges in governance and evidence-based decision-making.", excerpt: "Bridged theory and real-world policy impact — exactly what Hertie's admissions committee rewards.", i1: "Clear why Hertie, why this programme, and career vision in public sector reform", i2: "Personal motivation woven with specific policy challenges", i3: "Concrete internship examples demonstrated analytical skills and leadership potential" },
  { id: 3, univ: "Erasmus Mundus (EMJM)", prog: "Erasmus Mundus Joint Master", loc: "Multiple EU Countries", cat: "Intl. Relations", cc: "badge-ir", w: "~860", sec: "4", tone: "Intercultural", fit: "95%", schol: "full", scholText: "Full Erasmus Mundus Scholarship", note: "Erasmus Mundus programmes look for candidates with clear intercultural competence and mobility motivation. This SOP succeeded by explaining why a multi-country joint programme was the perfect fit — turning the format itself into the argument.", excerpt: "Turned the multi-country format into the argument — exactly what Erasmus selectors look for.", i1: "Explained why multi-country structure was essential — not just a bonus", i2: "Highlighted adaptability and cross-European perspective with lived examples", i3: "Long-term career goals tied directly to the interdisciplinary consortium" },
  { id: 4, univ: "NMBU — Norwegian Univ. of Life Sciences", prog: "MSc Agroecology", loc: "As, Norway", cat: "Agriculture", cc: "badge-ag", w: "~840", sec: "4", tone: "Systems", fit: "92%", schol: "waiver", scholText: "Tuition Fee Waiver Granted", note: "The SOP demonstrated genuine passion for sustainable agriculture and food systems transformation. The clear vision of contributing to real-world solutions resonated strongly with NMBU admissions committee.", excerpt: "Farm to fork vision grounded in genuine agroecology knowledge — fee waiver granted.", i1: "Personal experience in farming linked directly to NMBU agroecology focus", i2: "Showed understanding of science, policy, and practice intersection", i3: "Commitment to ethical resilient agriculture over generic environmentalism" },
  { id: 5, univ: "Europubhealth+", prog: "European Public Health Master (Erasmus Mundus)", loc: "Multiple EU Countries", cat: "Public Health", cc: "badge-ph", w: "~870", sec: "4", tone: "Reflective", fit: "95%", schol: "full", scholText: "Full Erasmus Mundus Scholarship", note: "This SOP stood out for its strong public health motivation and understanding of the programme multi-country structure. Highlighting specific partner universities and specialisations showed thoughtful deep research.", excerpt: "Named specific partner universities and specialisations — showed genuine research into the programme.", i1: "Specific specialisations highlighted within Europubhealth+ structure", i2: "Partner universities named with clear reasons for each", i3: "Global outlook and commitment to public health — not generic motivation" },
  { id: 6, univ: "University of Pisa", prog: "MSc AI Data Engineering", loc: "Pisa, Italy", cat: "Data Science / AI", cc: "badge-ai", w: "~900", sec: "4", tone: "Technical", fit: "96%", schol: null, scholText: null, note: "The applicant showcased a solid technical foundation and clear drive toward AI and large-scale data systems. Concrete project examples made the technical passion believable and the career vision in AI applications was compelling.", excerpt: "Technical depth shown through real projects. Career vision in AI applications was clear and credible.", i1: "Concrete project examples made technical passion believable", i2: "Focus on intelligent systems matched programme emphasis precisely", i3: "Forward-looking AI career vision demonstrated both capability and ambition" },
  { id: 7, univ: "Central European University", prog: "MA Public Policy", loc: "Vienna, Austria", cat: "Public Policy", cc: "badge-pp", w: "~920", sec: "5", tone: "Critical", fit: "94%", schol: "partial", scholText: "Partial Scholarship Awarded", note: "CEU MA Public Policy attracts analytically strong candidates with interest in governance and social impact. This SOP connected clearly to CEU values of open society, critical thinking, and evidence-based policy.", excerpt: "Concise mature tone that matched CEU high-impact intensive programme culture.", i1: "Connected directly to CEU values — open society, critical thinking", i2: "Specific examples of policy analysis skills and social impact commitment", i3: "Realistic career goals aligned with the intensive one-year programme format" },
  { id: 8, univ: "University of Glasgow", prog: "MSc Data Science", loc: "Glasgow, Scotland", cat: "Data Science", cc: "badge-ds", w: "~870", sec: "4", tone: "Analytical", fit: "93%", schol: "waiver", scholText: "Partial Tuition Fee Waiver", note: "The SOP demonstrated strong quantitative skills and genuine interest in data-driven problem solving. The clear explanation of why Glasgow balance of computing science and applied data techniques was ideal helped it stand out.", excerpt: "Balanced computing science and applied data — showed awareness of Glasgow specific programme structure.", i1: "Quantitative skills linked directly to Glasgow data science curriculum", i2: "Balance of computing and applied data techniques addressed explicitly", i3: "Technical readiness combined with real-world data science awareness" },
  { id: 9, univ: "Keele University", prog: "MSc Environmental & Green Technology", loc: "Staffordshire, UK", cat: "Green Technology", cc: "badge-gt", w: "~820", sec: "4", tone: "Applied", fit: "91%", schol: null, scholText: null, note: "This SOP effectively highlighted the applicant interest in green technologies and connected their science or engineering background to Keele interdisciplinary approach with practical emphasis on environmental solutions.", excerpt: "Theory and actionable sustainability projects balanced well — Keele approach reflected throughout.", i1: "Background in science or sustainability connected to Keele interdisciplinary method", i2: "Practical skills in green tech and environmental policy highlighted with examples", i3: "Motivation authentic — showed commitment to real solutions not just academic interest" },
  { id: 10, univ: "University of Freiburg", prog: "MSc Global Urban Health", loc: "Freiburg, Germany", cat: "Public Health", cc: "badge-ph", w: "~850", sec: "4", tone: "Scholarly", fit: "93%", schol: null, scholText: null, note: "The applicant showed a clear understanding of global and urban health challenges. The focus on urban health inequities and the programme analytical emphasis conveyed strong academic preparation.", excerpt: "Urban health inequities foregrounded with precision — Freiburg analytical emphasis matched.", i1: "Urban health inequities addressed with specificity — not generic global health interest", i2: "Academic preparation linked to the programme curriculum clearly", i3: "Desire to address real-world health issues in diverse settings came through" },
  { id: 11, univ: "University of Leeds", prog: "MSc Sustainable Cities", loc: "Leeds, UK", cat: "Urban Sustainability", cc: "badge-en", w: "~890", sec: "4", tone: "Systems", fit: "93%", schol: "partial", scholText: "Merit-Based Partial Scholarship", note: "This SOP stood out for its systems-thinking approach to urban sustainability. Clear examples of interest in practical solutions for climate-resilient cities aligned perfectly with the programme goals.", excerpt: "Systems-thinking approach to climate-resilient cities — matched Leeds goals precisely.", i1: "Systems-level thinking about urban sustainability through concrete examples", i2: "Background in environmental studies connected to Leeds curriculum", i3: "Forward-looking vision of contributing to sustainable urban development" },
  { id: 12, univ: "University of Glasgow", prog: "MSc International Journalism", loc: "Glasgow, Scotland", cat: "Journalism", cc: "badge-jn", w: "~860", sec: "4", tone: "Narrative", fit: "94%", schol: "waiver", scholText: "Application Fee Waiver Granted", note: "The applicant demonstrated strong writing and media interest combined with an international outlook. Emphasis on critical media analysis audience research and global journalism trends showed genuine depth.", excerpt: "Critical media analysis and global journalism trends — showed depth beyond 'I love writing'.", i1: "Previous journalism experience linked to Glasgow programme strengths", i2: "Critical media analysis and audience research highlighted with real examples", i3: "Clear career vision in international media helped it stand out" },
  { id: 13, univ: "University of Sussex", prog: "MA Development Studies", loc: "Brighton, UK", cat: "Development", cc: "badge-dv", w: "~910", sec: "4", tone: "Critical", fit: "95%", schol: null, scholText: null, note: "Sussex values critical interdisciplinary thinking on global development. This SOP succeeded by linking the applicant background to inequality sustainability and social justice showing genuine engagement.", excerpt: "Mature reflection on inequality and social justice — aligned with Sussex IDS critical framework.", i1: "Inequality sustainability and social justice addressed with genuine engagement", i2: "Sussex IDS approach explained as the specific reason for choosing it", i3: "Realistic post-study career plan significantly strengthened the application" },
  { id: 14, univ: "ACES-STAR", prog: "MSc Aquaculture, Environment and Society", loc: "UK, Greece, France", cat: "Marine / Env", cc: "badge-mr", w: "~830", sec: "4", tone: "Technical", fit: "91%", schol: "full", scholText: "Full Erasmus Mundus Scholarship", note: "The SOP clearly demonstrated passion for sustainable marine and aquaculture systems. The applicant addressed the multi-country structure directly and showed genuine readiness for mobility and interdisciplinary work.", excerpt: "Multi-country structure addressed directly — global perspective and readiness for mobility shown clearly.", i1: "Background in marine studies connected to ACES-STAR curriculum", i2: "Interdisciplinary skills and commitment to aquaculture challenges highlighted", i3: "Global perspective and readiness for mobility across UK Greece and France" },
  { id: 15, univ: "University of Sheffield", prog: "MPH Public Health (Management and Leadership)", loc: "Sheffield, UK", cat: "Public Health", cc: "badge-ph", w: "~910", sec: "5", tone: "Leadership", fit: "94%", schol: "waiver", scholText: "Tuition Fee Waiver Awarded", note: "This SOP stood out for connecting public health knowledge with genuine management and leadership ambition. The applicant demonstrated a clear vision for systemic change exactly what Sheffield MPH Management and Leadership track values.", excerpt: "Public health expertise framed through a leadership lens — exactly what Sheffield MPH management track rewards.", i1: "Leadership ambition backed by real health system experience", i2: "Sheffield MPH management and leadership track addressed directly with specific modules", i3: "Post-MPH career vision in health systems management was concrete and credible" },
];

const faqs = [
  { q: "Are these real SOPs from actual admitted students?", a: "Yes — 100%. Every SOP in the Vault belongs to a real student who was accepted to the programme listed. Not AI-generated, not fictional. Shared with the author's explicit consent. All identifying details kept strictly confidential." },
  { q: "Will I get access immediately after payment?", a: "Yes — instantly. The moment your PayU payment is confirmed, your download links are sent to your email. No waiting, no delays." },
  { q: "Is there a refund policy?", a: "Because these are digital documents delivered instantly, we don't offer refunds post-download. If you face any technical access issue, reach out and we'll resolve it immediately." },
  { q: "Will more SOPs be added?", a: "Yes. The Vault is updated every application cycle. Full Bundle purchasers get access to new SOPs added during the current cycle at no extra cost." },
  { q: "Can I share or copy these SOPs?", a: "No. Personal study only. Every download is digitally watermarked. Sharing, uploading, redistributing, or using commercially violates our terms and is pursued under IP law." },
];

const css = `
:root{--navy:#0D1B2A;--navy-mid:#1a2d42;--orange:#E8541A;--orange-light:#f07040;--peach:#FDECD8;--cream:#FAFAF7;--cream-warm:#F7F3EE;--white:#ffffff;--muted:#7a8694;--border:#e6ebf0;--shadow-sm:0 2px 16px rgba(13,27,42,0.07);--shadow-md:0 10px 40px rgba(13,27,42,0.11);--shadow-lg:0 24px 72px rgba(13,27,42,0.16);--radius:18px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
section[aria-live="polite"]{position:fixed!important;height:0!important;overflow:hidden!important;padding:0!important;margin:0!important}
.sv-root{font-family:'Outfit',sans-serif;background:var(--cream);color:var(--navy);overflow-x:hidden}
h1,h2,h3,h4{font-family:'Cormorant Garamond',serif;line-height:1.15;font-weight:600}
a{text-decoration:none;color:inherit}
.hero{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;padding:40px 7% 64px;background:linear-gradient(148deg,#0D1B2A 0%,#1a2d42 55%,#0f2235 100%);position:relative;overflow:hidden}
.hero::before{content:'';position:absolute;top:-80px;right:-80px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(232,84,26,0.1) 0%,transparent 65%);pointer-events:none}
.hero::after{content:'';position:absolute;bottom:-60px;left:-40px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(100,160,220,0.07) 0%,transparent 65%);pointer-events:none}
.hero-eyebrow{display:inline-flex;align-items:center;gap:7px;background:rgba(232,84,26,0.15);color:var(--orange-light);font-size:0.7rem;font-weight:700;padding:6px 14px;border-radius:50px;margin-bottom:20px;letter-spacing:0.08em;text-transform:uppercase;border:1px solid rgba(232,84,26,0.25)}
.hero h1{font-size:clamp(2.2rem,4vw,3.4rem);color:white;margin-bottom:18px;line-height:1.12;letter-spacing:-0.02em}
.hero h1 em{color:var(--orange);font-style:italic}
.hero-sub{font-family:'Outfit',sans-serif;font-size:0.95rem;color:rgba(255,255,255,0.55);line-height:1.75;margin-bottom:36px;max-width:420px}
.hero-cta-wrap{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
.btn-hero{background:var(--orange);color:white;padding:17px 38px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.95rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 6px 28px rgba(232,84,26,0.4);transition:all 0.25s;letter-spacing:0.03em;display:flex;align-items:center;gap:10px}
.btn-hero:hover{background:var(--orange-light);transform:translateY(-2px);box-shadow:0 10px 36px rgba(232,84,26,0.45)}
.hero-hint{font-family:'Outfit',sans-serif;font-size:0.75rem;color:rgba(255,255,255,0.35);letter-spacing:0.02em}
.hero-hint strong{color:rgba(255,255,255,0.6)}
.hero-visual{position:relative;display:flex;justify-content:center;align-items:center;padding:10px 0 20px}
.hero-video-frame{width:100%;max-width:480px;border-radius:20px;overflow:hidden;background:#080f18;border:1px solid rgba(255,255,255,0.1);box-shadow:0 24px 64px rgba(0,0,0,0.5);position:relative;aspect-ratio:16/9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;cursor:pointer}
.hero-video-frame::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 60% 40%,rgba(232,84,26,0.12) 0%,transparent 65%),radial-gradient(ellipse at 20% 70%,rgba(50,100,180,0.08) 0%,transparent 55%);pointer-events:none}
.hvf-topbar{position:absolute;top:0;left:0;right:0;height:36px;background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.05);display:flex;align-items:center;padding:0 14px;gap:8px}
.hvf-dot{width:8px;height:8px;border-radius:50%}
.hvf-dot:nth-child(1){background:#ff5f57}
.hvf-dot:nth-child(2){background:#febc2e}
.hvf-dot:nth-child(3){background:#28c840}
.hvf-label{position:absolute;top:14px;left:50%;transform:translateX(-50%);font-family:'Outfit',sans-serif;font-size:0.58rem;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap}
.hvf-play{width:64px;height:64px;border-radius:50%;background:rgba(232,84,26,0.9);display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:white;box-shadow:0 0 0 12px rgba(232,84,26,0.12),0 8px 28px rgba(232,84,26,0.4);transition:transform 0.2s,box-shadow 0.2s;position:relative;z-index:1;animation:play-pulse 2.5s ease-in-out infinite}
@keyframes play-pulse{0%,100%{box-shadow:0 0 0 10px rgba(232,84,26,0.12),0 8px 28px rgba(232,84,26,0.4)} 50%{box-shadow:0 0 0 18px rgba(232,84,26,0.07),0 12px 36px rgba(232,84,26,0.5)}}
.hero-video-frame:hover .hvf-play{transform:scale(1.08);box-shadow:0 0 0 18px rgba(232,84,26,0.1),0 12px 36px rgba(232,84,26,0.55)}
.hvf-title{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;color:white;position:relative;z-index:1;letter-spacing:-0.01em}
.hvf-note{font-family:'Outfit',sans-serif;font-size:0.68rem;color:rgba(255,255,255,0.35);position:relative;z-index:1;letter-spacing:0.02em}
.hvf-progress{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.06)}
.hvf-progress-fill{height:3px;width:0%;background:linear-gradient(90deg,var(--orange),var(--orange-light));border-radius:0 3px 3px 0}
.pricing-section{background:var(--cream-warm);padding:60px 6%;position:relative}
.pricing-section::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--orange),var(--orange-light),var(--orange))}
.pricing-header{text-align:center;margin-bottom:40px}
.pricing-eyebrow{display:inline-flex;align-items:center;gap:6px;color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.7rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;margin-bottom:10px}
.pricing-title{font-size:clamp(1.6rem,2.8vw,2.2rem);color:var(--navy);letter-spacing:-0.02em}
.pricing-sub{font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--muted);margin-top:8px}
.pricing-cards{display:flex;flex-direction:row;gap:22px;align-items:stretch;max-width:1160px;margin:0 auto}
.pricing-cards .pc{flex:1;min-width:0;display:flex;flex-direction:column}
.pricing-cards .pc.vault{flex:1.1}
.pricing-cards .pc .pc-features{flex:1}
.pc{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:28px 24px;position:relative;transition:transform 0.25s,box-shadow 0.25s}
.pc:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
.pc.vault{background:var(--navy);border-color:var(--orange);box-shadow:0 16px 56px rgba(13,27,42,0.25),0 0 0 1px rgba(232,84,26,0.3);padding:32px 26px 28px;position:relative;overflow:hidden}
.pc.vault::before{content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(232,84,26,0.2),transparent 70%);pointer-events:none}
.vault-ribbon{position:absolute;top:0;right:0;background:var(--orange);color:white;font-family:'Outfit',sans-serif;font-size:0.6rem;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:5px 14px 5px 10px;clip-path:polygon(8% 0%,100% 0%,100% 100%,0% 100%);border-radius:0 var(--radius) 0 0}
.pc-icon{font-size:1.6rem;margin-bottom:12px;display:block}
.pc-name{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;color:var(--navy);margin-bottom:4px}
.pc.vault .pc-name{color:white;font-size:1.35rem}
.pc-desc{font-family:'Outfit',sans-serif;font-size:0.75rem;color:var(--muted);margin-bottom:18px}
.pc.vault .pc-desc{color:rgba(255,255,255,0.5)}
.pc-price{font-family:'Cormorant Garamond',serif;font-size:2.6rem;font-weight:600;color:var(--navy);line-height:1;margin-bottom:6px;display:flex;align-items:baseline;gap:4px}
.pc.vault .pc-price{color:white;font-size:3rem}
.pc-price .curr{font-family:'Outfit',sans-serif;font-size:1.1rem;font-weight:500}
.pc-price-note{font-family:'Outfit',sans-serif;font-size:0.72rem;color:var(--muted);margin-bottom:22px}
.pc.vault .pc-price-note{color:rgba(255,255,255,0.4)}
.pc-features{display:flex;flex-direction:column;gap:9px;margin-bottom:22px}
.pc-feat{display:flex;align-items:center;gap:9px;font-family:'Outfit',sans-serif;font-size:0.8rem;color:var(--muted)}
.pc.vault .pc-feat{color:rgba(255,255,255,0.7)}
.feat-ck{color:#22c55e;font-size:0.85rem;flex-shrink:0}
.feat-x{color:#f87171;font-size:0.85rem;flex-shrink:0}
.btn-pc{width:100%;padding:14px 20px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;border:1.5px solid var(--navy);background:transparent;color:var(--navy);transition:all 0.22s;letter-spacing:0.03em;text-transform:uppercase;margin-bottom:12px}
.btn-pc:hover{background:var(--navy);color:white}
.btn-pc.vault-btn{background:var(--orange);color:white;border-color:var(--orange);box-shadow:0 6px 24px rgba(232,84,26,0.38);padding:16px 20px;font-size:0.88rem;animation:pulse-btn 2.5s ease-in-out infinite}
@keyframes pulse-btn{0%,100%{box-shadow:0 6px 24px rgba(232,84,26,0.38)} 50%{box-shadow:0 8px 36px rgba(232,84,26,0.6)}}
.btn-pc.vault-btn:hover{background:var(--orange-light);animation:none;transform:scale(1.02)}
.pc-guarantee{font-family:'Outfit',sans-serif;font-size:0.68rem;color:var(--muted);text-align:center;display:flex;align-items:center;justify-content:center;gap:5px}
.pc.vault .pc-guarantee{color:rgba(255,255,255,0.35)}
.checklist-panel{display:none;margin-top:16px;border-top:1px solid var(--border);padding-top:14px}
.checklist-panel.open{display:block}
.checklist-label{font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:700;color:var(--navy);margin-bottom:10px;letter-spacing:0.04em;text-transform:uppercase}
.checklist-counter{font-family:'Outfit',sans-serif;font-size:0.7rem;font-weight:700;color:var(--orange);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.counter-bar{height:3px;background:var(--border);border-radius:3px;flex:1}
.counter-fill{height:3px;background:var(--orange);border-radius:3px;transition:width 0.3s}
.sop-list{max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding-right:4px}
.sop-list::-webkit-scrollbar{width:4px}
.sop-list::-webkit-scrollbar-track{background:var(--border);border-radius:4px}
.sop-list::-webkit-scrollbar-thumb{background:var(--muted);border-radius:4px}
.sop-option{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:background 0.15s;border:1.5px solid transparent}
.sop-option:hover{background:var(--cream)}
.sop-option.selected{background:rgba(232,84,26,0.05);border-color:rgba(232,84,26,0.25)}
.sop-option input{accent-color:var(--orange);margin-top:2px;flex-shrink:0}
.sop-option-text{font-family:'Outfit',sans-serif;font-size:0.72rem;color:var(--navy);line-height:1.4}
.sop-option-prog{font-family:'Outfit',sans-serif;font-size:0.62rem;color:var(--muted);margin-top:1px}
.btn-confirm{width:100%;margin-top:12px;padding:12px 16px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.78rem;font-weight:700;background:var(--navy);color:white;border:none;cursor:pointer;transition:all 0.22s;letter-spacing:0.03em;text-transform:uppercase;opacity:0.4;pointer-events:none}
.btn-confirm.ready{opacity:1;pointer-events:all}
.btn-confirm.ready:hover{background:var(--orange)}
.ribbon-wrap{background:var(--navy);overflow:hidden}
.ribbon-track{display:flex;white-space:nowrap;animation:marquee 20s linear infinite}
.ribbon-track:hover{animation-play-state:paused}
@keyframes marquee{0%{transform:translateX(0)} 100%{transform:translateX(-50%)}}
.ribbon-inner{display:flex;align-items:center}
.ribbon-item{display:inline-flex;align-items:center;gap:10px;padding:16px 36px;font-family:'Outfit',sans-serif;font-size:0.82rem;font-weight:700;color:#fff;letter-spacing:0.03em}
.ribbon-item .hi{color:var(--orange-light)}
.ribbon-item .sep{color:rgba(255,255,255,0.2);margin:0 8px}
.sv-root section{padding:80px 7%}
.section-eyebrow{display:inline-flex;align-items:center;gap:6px;color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;margin-bottom:12px}
.section-title{font-size:clamp(1.8rem,3vw,2.5rem);color:var(--navy);margin-bottom:14px;letter-spacing:-0.02em}
.section-sub{font-family:'Outfit',sans-serif;font-size:0.93rem;color:var(--muted);max-width:500px;line-height:1.75;margin-bottom:40px}
.carousel-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.carousel-counter{font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;color:var(--muted);letter-spacing:0.06em}
.carousel-counter strong{color:var(--navy);font-size:1rem}
.carousel-nav{display:flex;gap:10px}
.nav-btn{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--border);background:var(--white);color:var(--navy);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;box-shadow:var(--shadow-sm)}
.nav-btn:hover{background:var(--navy);color:white;border-color:var(--navy)}
.nav-btn:disabled{opacity:0.3;cursor:not-allowed;transform:none}
.carousel-track-wrap{overflow:hidden;border-radius:var(--radius)}
.carousel-track{display:flex;transition:transform 0.42s cubic-bezier(0.4,0,0.2,1);will-change:transform}
.sop-card{min-width:100%;border-radius:var(--radius);border:1px solid var(--border);box-shadow:var(--shadow-sm);display:grid;grid-template-columns:240px 1fr 290px;overflow:hidden}
.sop-preview{display:flex;flex-direction:column;justify-content:flex-start;border-right:1px solid var(--border);position:relative;overflow:hidden;min-height:270px;padding:0}
.tp{background:linear-gradient(145deg,#FDF0E6,#FDECD8,#f8dfc8)}
.ts{background:linear-gradient(145deg,#E8F4FD,#D6EAF8,#c8e2f5)}
.tg{background:linear-gradient(145deg,#EBF5EB,#D8EDD8,#cce5cc)}
.tl{background:linear-gradient(145deg,#F0EBF9,#E8E0F5,#DDD3F0)}
.tr{background:linear-gradient(145deg,#FDE8EE,#FADADD,#F5C8CE)}
.tgo{background:linear-gradient(145deg,#FDF5E0,#FAEEC8,#F5E5B0)}
.sop-preview::before{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.4);pointer-events:none;z-index:0}
.sop-preview::after{content:'';position:absolute;bottom:-20px;left:-20px;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.3);pointer-events:none;z-index:0}
.sop-doc-page{background:rgba(255,255,255,0.88);backdrop-filter:blur(6px);border-radius:12px;margin:20px 16px;padding:18px 16px 22px;box-shadow:0 6px 24px rgba(0,0,0,0.09);position:relative;z-index:1;flex:1;display:flex;flex-direction:column}
.sop-page-label{display:flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;font-size:0.52rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.sop-page-label::before{content:'';width:12px;height:2px;background:var(--orange);border-radius:2px;flex-shrink:0}
.sop-page-univ{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:700;color:var(--navy);line-height:1.2;margin-bottom:5px;letter-spacing:-0.01em}
.sop-page-prog{font-family:'Outfit',sans-serif;font-size:0.65rem;font-weight:600;color:var(--muted);letter-spacing:0.02em;padding-bottom:12px;border-bottom:1px solid rgba(0,0,0,0.06);margin-bottom:12px}
.sop-page-body{height:8px;border-radius:5px;opacity:0.5;width:90%}
.tp .sop-page-body{background:linear-gradient(90deg,#e4b08a,#d49a6e)}
.ts .sop-page-body{background:linear-gradient(90deg,#88bad8,#6aa8cc)}
.tg .sop-page-body{background:linear-gradient(90deg,#80b880,#6aaa6a)}
.tl .sop-page-body{background:linear-gradient(90deg,#a890cc,#9278be)}
.tr .sop-page-body{background:linear-gradient(90deg,#d890a8,#cc7898)}
.tgo .sop-page-body{background:linear-gradient(90deg,#c8a040,#ba9030)}
.sop-reveal{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:18px;background:linear-gradient(180deg,transparent 45%,rgba(255,255,255,0.65) 100%);z-index:2}
.reveal-star{font-size:1rem;margin-bottom:5px;animation:sparkle 2.8s ease-in-out infinite}
@keyframes sparkle{0%,100%{transform:scale(1) rotate(0deg)} 50%{transform:scale(1.2) rotate(10deg)}}
.reveal-pill{font-family:'Outfit',sans-serif;font-size:0.63rem;font-weight:700;color:var(--navy);background:rgba(255,255,255,0.95);padding:5px 13px;border-radius:20px;border:1px solid rgba(13,27,42,0.1);letter-spacing:0.05em;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
.sop-card.th-tp .sop-info{background:linear-gradient(180deg,#fffaf6,#fff8f3)}
.sop-card.th-ts .sop-info{background:linear-gradient(180deg,#f5faff,#f0f7fe)}
.sop-card.th-tg .sop-info{background:linear-gradient(180deg,#f5fbf5,#f0f9f0)}
.sop-card.th-tl .sop-info{background:linear-gradient(180deg,#f8f5ff,#f3f0fd)}
.sop-card.th-tr .sop-info{background:linear-gradient(180deg,#fff5f7,#fef0f3)}
.sop-card.th-tgo .sop-info{background:linear-gradient(180deg,#fffdf0,#fffaeb)}
.sop-info{padding:32px 28px;display:flex;flex-direction:column;justify-content:center;gap:14px}
.sop-badges{display:flex;gap:8px;flex-wrap:wrap}
.badge{padding:5px 12px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.65rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase}
.badge-univ{background:rgba(13,27,42,0.07);color:var(--navy)}
.badge-pp{background:rgba(37,99,235,0.1);color:#2563eb}
.badge-ds{background:rgba(139,92,246,0.1);color:#7c3aed}
.badge-ph{background:rgba(16,185,129,0.1);color:#059669}
.badge-jn{background:rgba(245,158,11,0.1);color:#d97706}
.badge-en{background:rgba(20,184,166,0.1);color:#0d9488}
.badge-ag{background:rgba(101,163,13,0.1);color:#4d7c0f}
.badge-mr{background:rgba(6,182,212,0.1);color:#0e7490}
.badge-ir{background:rgba(239,68,68,0.1);color:#dc2626}
.badge-sp{background:rgba(236,72,153,0.1);color:#be185d}
.badge-dv{background:rgba(251,191,36,0.1);color:#b45309}
.badge-gt{background:rgba(20,184,166,0.1);color:#0d9488}
.badge-ai{background:rgba(139,92,246,0.1);color:#7c3aed}
.sop-title{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;color:var(--navy);line-height:1.25;letter-spacing:-0.01em}
.sop-program{font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--muted);font-weight:500}
.sop-meta{display:flex;gap:14px;font-family:'Outfit',sans-serif;font-size:0.72rem;color:var(--muted);font-weight:500;flex-wrap:wrap}
.sop-excerpt{font-family:'Outfit',sans-serif;font-size:0.82rem;color:var(--muted);line-height:1.68;border-left:2px solid var(--border);padding-left:14px;font-style:italic}
.sop-stat-strip{display:flex;gap:0;border-top:1px solid var(--border);margin-top:14px}
.sop-stat{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 6px;border-right:1px solid var(--border);gap:3px}
.sop-stat:last-child{border-right:none}
.stat-n{font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:var(--navy);line-height:1}
.stat-l{font-family:'Outfit',sans-serif;font-size:0.58rem;color:var(--muted);font-weight:600;letter-spacing:0.04em;text-align:center}
.admit-result{display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);color:#16a34a;font-family:'Outfit',sans-serif;font-size:0.62rem;font-weight:700;padding:4px 10px;border-radius:50px;letter-spacing:0.04em;text-transform:uppercase}
.admit-result::before{content:'';width:6px;height:6px;border-radius:50%;background:#22c55e;animation:blink 1.8s ease-in-out infinite;flex-shrink:0}
@keyframes blink{0%,100%{opacity:1} 50%{opacity:0.3}}
.sop-note-col{background:#FFFCF5;border-left:1px solid #F0E8D0;padding:28px 22px;display:flex;flex-direction:column;justify-content:space-between;gap:18px}
.note-box{background:linear-gradient(160deg,#FFFBF0,#FFF6E0);border-left:3px solid var(--orange);border-radius:0 12px 12px 0;padding:16px;flex:1;position:relative;overflow:hidden}
.note-label{font-family:'Outfit',sans-serif;font-size:1.05rem;font-weight:700;font-style:italic;color:var(--orange);margin-bottom:8px}
.note-text{font-family:'Outfit',sans-serif;font-size:0.88rem;font-style:italic;color:#5a4a2e;line-height:1.6}
.note-fade{position:absolute;bottom:0;left:0;right:0;height:46%;background:linear-gradient(180deg,transparent,rgba(255,248,228,0.97));display:flex;align-items:flex-end;justify-content:center;padding-bottom:10px}
.note-unlock{font-family:'Outfit',sans-serif;font-size:0.63rem;font-weight:700;color:var(--orange);background:rgba(255,255,255,0.95);padding:4px 12px;border-radius:20px;border:1px solid rgba(232,84,26,0.22);letter-spacing:0.04em}
.sop-price-row{display:flex;flex-direction:column;gap:10px}
.sop-price{font-family:'Cormorant Garamond',serif;font-size:1.8rem;font-weight:600;color:var(--navy);display:flex;align-items:baseline;gap:5px}
.sop-price .curr{font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:600}
.sop-price .old{font-family:'Outfit',sans-serif;font-size:0.78rem;color:var(--muted);text-decoration:line-through;font-weight:400}
.btn-get-sop{background:var(--navy);color:white;border:none;border-radius:50px;padding:13px 18px;font-family:'Outfit',sans-serif;font-size:0.78rem;font-weight:700;cursor:pointer;transition:all 0.22s;display:flex;align-items:center;justify-content:center;gap:6px;letter-spacing:0.04em;width:100%;text-transform:uppercase}
.btn-get-sop:hover{background:var(--orange);transform:scale(1.03);box-shadow:0 4px 16px rgba(232,84,26,0.28)}
.schol-banner{display:flex;align-items:center;gap:7px;padding:8px 16px;font-family:'Outfit',sans-serif;font-size:0.64rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;margin:0;position:relative;z-index:3;white-space:nowrap;width:100%;justify-content:center}
.schol-full{background:#065f46;color:#a7f3d0;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.15)}
.schol-crore{background:linear-gradient(90deg,#92400e,#b45309);color:#fde68a;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.2)}
.schol-partial{background:#1d4ed8;color:#bfdbfe;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.15)}
.schol-waiver{background:#6d28d9;color:#ddd6fe;box-shadow:inset 0 -2px 0 rgba(0,0,0,0.15)}
.schol-icon{font-size:0.9rem;flex-shrink:0}
.carousel-dots{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:22px;flex-wrap:wrap}
.cdot{width:7px;height:7px;border-radius:50%;background:var(--border);cursor:pointer;transition:all 0.25s;flex-shrink:0;border:none}
.cdot.active{width:22px;border-radius:8px;background:var(--navy)}
.cdot:hover:not(.active){background:var(--muted)}
.bundle-strip{margin:28px 0 0;background:var(--navy);border-radius:var(--radius);padding:22px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;position:relative;overflow:hidden}
.bundle-strip::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(232,84,26,0.18),transparent 70%);pointer-events:none}
.bs-left{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.bs-lbl{font-family:'Outfit',sans-serif;font-size:0.68rem;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px}
.bs-title{font-family:'Cormorant Garamond',serif;font-size:1.25rem;font-weight:600;color:white}
.bs-div{width:1px;height:40px;background:rgba(255,255,255,0.15);flex-shrink:0}
.bs-badge{background:rgba(232,84,26,0.2);border:1px solid rgba(232,84,26,0.5);color:var(--orange-light);font-family:'Outfit',sans-serif;font-size:0.65rem;font-weight:700;padding:4px 11px;border-radius:50px;letter-spacing:0.05em;text-transform:uppercase;animation:pulse 2.2s ease-in-out infinite;white-space:nowrap}
@keyframes pulse{0%,100%{opacity:1} 50%{opacity:0.55}}
.bs-right{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.bs-plan{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:12px 18px;cursor:pointer;transition:background 0.2s,transform 0.2s;white-space:nowrap}
.bs-plan:hover{background:rgba(255,255,255,0.13);transform:translateY(-2px)}
.bs-plan.best{border-color:var(--orange);background:rgba(232,84,26,0.1)}
.bs-plan.best:hover{background:rgba(232,84,26,0.18)}
.plan-name{font-family:'Outfit',sans-serif;font-size:0.72rem;font-weight:600;color:rgba(255,255,255,0.65);display:block}
.plan-price{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:white;line-height:1}
.plan-count{font-family:'Outfit',sans-serif;font-size:0.62rem;color:rgba(255,255,255,0.45);margin-top:2px;display:block}
.bs-arrow{color:rgba(255,255,255,0.5);font-size:0.9rem;transition:transform 0.2s}
.bs-plan:hover .bs-arrow{transform:translateX(3px);color:var(--orange-light)}
.terms-banner{margin:28px 0 0;background:linear-gradient(135deg,#FDF0E6,#FDECD8);border:1px solid #F5C9A0;border-radius:var(--radius);padding:22px 26px;display:flex;align-items:flex-start;gap:14px}
.terms-icon{font-size:1.4rem;flex-shrink:0;margin-top:2px}
.terms-title{font-family:'Cormorant Garamond',serif;font-size:1rem;font-weight:600;color:var(--navy);margin-bottom:5px}
.terms-text{font-family:'Outfit',sans-serif;font-size:0.77rem;color:var(--muted);line-height:1.65}
.terms-link{color:var(--orange);font-weight:600;cursor:pointer;text-decoration:underline;background:none;border:none;padding:0;font-family:inherit;font-size:inherit}
.tmd-backdrop{display:none;position:fixed;inset:0;z-index:300;background:rgba(13,27,42,0.75);backdrop-filter:blur(8px);align-items:center;justify-content:center}
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
.modal-bd{display:none;position:fixed;inset:0;z-index:200;background:rgba(13,27,42,0.72);backdrop-filter:blur(8px);align-items:flex-end;justify-content:center}
.modal-bd.open{display:flex;animation:fadeIn 0.22s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--white);width:100%;max-width:1000px;max-height:91vh;border-radius:26px 26px 0 0;overflow-y:auto;padding:40px;animation:slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);position:relative}
@keyframes slideUp{from{transform:translateY(80px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-close{position:absolute;top:20px;right:22px;background:var(--border);border:none;width:36px;height:36px;border-radius:50%;font-size:1rem;cursor:pointer;color:var(--navy);display:flex;align-items:center;justify-content:center;transition:background 0.2s}
.modal-close:hover{background:#ddd}
.modal-header{margin-bottom:28px}
.modal-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(232,84,26,0.09);color:var(--orange);font-family:'Outfit',sans-serif;font-size:0.7rem;font-weight:700;padding:5px 12px;border-radius:50px;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.06em}
.modal-title{font-family:'Cormorant Garamond',serif;font-size:1.7rem;font-weight:600;color:var(--navy);margin-bottom:4px;letter-spacing:-0.01em}
.modal-prog{font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--muted)}
.modal-body{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
.vid-wrap{border-radius:var(--radius);overflow:hidden;background:var(--navy);aspect-ratio:16/9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;position:relative}
.vid-lbl{position:absolute;top:14px;left:14px;background:var(--orange);color:white;font-family:'Outfit',sans-serif;font-size:0.62rem;font-weight:700;padding:4px 10px;border-radius:50px;text-transform:uppercase;letter-spacing:0.06em}
.play-btn{width:62px;height:62px;background:rgba(255,255,255,0.14);border:2px solid rgba(255,255,255,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.4rem;cursor:pointer;transition:background 0.2s}
.play-btn:hover{background:rgba(255,255,255,0.24)}
.vid-cap{font-family:'Outfit',sans-serif;color:rgba(255,255,255,0.55);font-size:0.78rem;text-align:center;padding:0 22px;line-height:1.55}
.analytics{background:var(--cream-warm);border-radius:var(--radius);padding:24px;border:1px solid var(--border)}
.a-head{font-family:'Outfit',sans-serif;font-weight:700;font-size:0.82rem;color:var(--navy);margin-bottom:18px}
.a-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.a-stat{background:white;border-radius:10px;padding:12px 14px;border:1px solid var(--border)}
.stat-val{font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:var(--navy)}
.stat-key{font-family:'Outfit',sans-serif;font-size:0.67rem;color:var(--muted);font-weight:500;margin-top:2px}
.insights{display:flex;flex-direction:column;gap:9px}
.ins-row{display:flex;align-items:flex-start;gap:8px;font-family:'Outfit',sans-serif;font-size:0.76rem;color:var(--muted);line-height:1.5}
.ins-dot{width:6px;height:6px;border-radius:50%;background:var(--orange);flex-shrink:0;margin-top:5px}
.modal-buy{background:linear-gradient(135deg,#f0f4ff,var(--cream));border:1px solid var(--border);border-radius:var(--radius);padding:28px;display:flex;flex-direction:column;gap:16px}
.buy-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.buy-info h3{font-family:'Cormorant Garamond',serif;font-size:1.45rem;color:var(--navy);margin-bottom:4px}
.buy-info p{font-family:'Outfit',sans-serif;font-size:0.79rem;color:var(--muted)}
.modal-price{font-family:'Cormorant Garamond',serif;font-size:2.2rem;font-weight:600;color:var(--navy)}
.modal-price .curr{font-family:'Outfit',sans-serif;font-size:1rem}
.email-pay-row{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-start}
.email-input{flex:1;min-width:200px;padding:13px 18px;border-radius:50px;border:1.5px solid var(--border);font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--navy);outline:none;transition:border-color 0.2s;background:white}
.email-input:focus{border-color:var(--orange)}
.btn-pay{background:var(--orange);color:white;border:none;border-radius:50px;padding:13px 28px;font-family:'Outfit',sans-serif;font-size:0.88rem;font-weight:700;cursor:pointer;box-shadow:0 4px 22px rgba(232,84,26,0.32);transition:all 0.22s;display:flex;align-items:center;gap:8px;white-space:nowrap;letter-spacing:0.03em;text-transform:uppercase}
.btn-pay:hover:not(:disabled){background:#d44a12;transform:translateY(-2px)}
.btn-pay:disabled{opacity:0.6;cursor:not-allowed}
.pay-error{font-family:'Outfit',sans-serif;font-size:0.78rem;color:#dc2626}
.rzp{font-family:'Outfit',sans-serif;display:flex;align-items:center;gap:6px;font-size:0.67rem;color:var(--muted);margin-top:4px}
.faq-wrap{max-width:700px;margin:0 auto}
.faq-item{border-bottom:1px solid var(--border);padding:20px 0;cursor:pointer}
.faq-q{display:flex;justify-content:space-between;align-items:center;font-family:'Outfit',sans-serif;font-weight:600;font-size:0.93rem;color:var(--navy);gap:16px}
.faq-icon{font-size:1rem;color:var(--orange);transition:transform 0.25s;flex-shrink:0}
.faq-item.open .faq-icon{transform:rotate(45deg)}
.faq-a{font-family:'Outfit',sans-serif;font-size:0.85rem;color:var(--muted);line-height:1.72;max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding-top 0.3s}
.faq-item.open .faq-a{max-height:220px;padding-top:14px}
.footer-cta{background:var(--navy);margin:0 4% 40px;border-radius:24px;padding:68px 8%;text-align:center;position:relative;overflow:hidden}
.footer-cta::after{content:'';position:absolute;bottom:-60px;left:50%;transform:translateX(-50%);width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(232,84,26,0.16),transparent 65%);pointer-events:none}
.footer-cta h2{font-size:clamp(1.7rem,3vw,2.6rem);color:white;margin-bottom:14px;letter-spacing:-0.02em}
.footer-cta p{font-family:'Outfit',sans-serif;color:rgba(255,255,255,0.5);font-size:0.95rem;margin-bottom:32px}
.btn-footer{background:var(--orange);color:white;padding:16px 36px;border-radius:50px;font-family:'Outfit',sans-serif;font-size:0.9rem;font-weight:700;border:none;cursor:pointer;box-shadow:0 4px 26px rgba(232,84,26,0.38);transition:all 0.25s;letter-spacing:0.03em}
.btn-footer:hover{background:var(--orange-light);transform:translateY(-2px)}
.sv-footer{text-align:center;padding:24px 5%;font-family:'Outfit',sans-serif;font-size:0.75rem;color:var(--muted);border-top:1px solid var(--border)}
.mob-sticky{display:none;position:fixed;bottom:0;left:0;right:0;z-index:150;background:var(--white);border-top:1px solid var(--border);padding:12px 20px;box-shadow:0 -4px 22px rgba(0,0,0,0.09);align-items:center;justify-content:space-between;gap:12px}
.sticky-lbl{font-family:'Outfit',sans-serif;font-size:0.68rem;color:var(--muted);font-weight:500}
.sticky-price{font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--navy);font-weight:600}
.btn-sticky-mob{background:var(--orange);color:white;border:none;border-radius:50px;padding:12px 24px;font-family:'Outfit',sans-serif;font-size:0.8rem;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0}
@media(max-width:960px){
  .hero{grid-template-columns:1fr;padding:48px 5% 40px;text-align:center}
  .hero-sub{margin:0 auto 24px}
  .hero-cta-wrap{align-items:center}
  .hero-visual{order:-1}
  .hero-video-frame{max-width:100%;border-radius:14px}
  .pricing-cards{flex-direction:column;gap:16px}
  .pricing-cards .pc,.pricing-cards .pc.vault{flex:none;width:100%}
  .sop-card{grid-template-columns:1fr}
  .sop-preview{border-right:none;border-bottom:1px solid var(--border);min-height:190px}
  .sop-note-col{border-left:none;border-top:1px solid #f0e8d0}
  .modal-body{grid-template-columns:1fr}
  .modal{padding:24px 18px;border-radius:20px 20px 0 0}
  .modal-buy{flex-direction:column}
  .btn-pay{width:100%;justify-content:center}
  .mob-sticky{display:flex}
  .sv-root{padding-bottom:72px}
  .terms-banner{flex-direction:column;gap:10px}
  .bundle-strip{flex-direction:column;align-items:flex-start;gap:14px}
  .bs-right{width:100%;flex-wrap:nowrap;gap:10px}
  .bs-plan{flex:1;justify-content:space-between;min-width:0;padding:10px 14px}
  .sop-info{padding:20px 16px;gap:10px}
  .sop-note-col{padding:18px 16px}
  .sop-stat-strip{display:none}
  .schol-banner{margin:0 12px 10px;font-size:0.6rem}
}
@media(max-width:600px){
  section{padding:44px 5%}
  .footer-cta{margin:0 3%;padding:48px 6%}
  .footer-cta h2{font-size:1.5rem}
  .carousel-topbar{flex-direction:column;align-items:flex-start;gap:10px}
  .pricing-section{padding:36px 5%}
  .pricing-cards{gap:14px}
  .pc{padding:20px 16px}
  .pc.vault{padding:24px 16px}
  .pc-price{font-size:2.2rem}
  .pc.vault .pc-price{font-size:2.6rem}
  .hero h1{font-size:clamp(1.8rem,7.5vw,2.6rem)}
  .hero-sub{font-size:0.875rem;max-width:100%}
  .btn-hero{padding:14px 26px;font-size:0.85rem;width:100%;justify-content:center}
  .hero-hint{font-size:0.7rem;text-align:center}
  .pricing-header{margin-bottom:28px}
  .pricing-title{font-size:1.5rem}
  .bs-right{flex-direction:column}
  .bs-plan{width:100%}
  .modal{padding:18px 14px}
  .modal-title{font-size:1.3rem}
  .a-grid{gap:8px}
  .a-stat{padding:10px}
  .sop-title{font-size:1.15rem}
  .note-text{font-size:0.82rem}
  .sop-price{font-size:1.5rem}
  .btn-get-sop{font-size:0.74rem;padding:11px 14px}
  .carousel-dots{gap:5px}
  .cdot{width:6px;height:6px}
  .cdot.active{width:14px}
  .bundle-strip{padding:18px 16px}
  .bs-title{font-size:1.05rem}
  .checklist-panel{margin-top:12px}
  .sop-list{max-height:160px}
  .admit-result{font-size:0.58rem}
  .schol-banner{font-size:0.58rem;padding:5px 10px}
  .email-pay-row{flex-direction:column}
  .email-input{width:100%}
}
`;

const SopVault = () => {
  // Carousel
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);

  // Pricing checklists
  const [showSinglePanel, setShowSinglePanel] = useState(false);
  const [showBundlePanel, setShowBundlePanel] = useState(false);
  const [singleSelectedId, setSingleSelectedId] = useState<number | null>(null);
  const [bundleSelected, setBundleSelected] = useState<Set<number>>(new Set());

  // FAQ
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"single" | "bundle" | "full">("full");
  const [modalSopId, setModalSopId] = useState<number | null>(null);

  // Payment
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  // Derived
  const modalSop = sops.find((s) => s.id === modalSopId) ?? null;
  const currentAmount = modalMode === "full" ? 799 : modalMode === "bundle" ? 499 : 299;

  // Lock body scroll when modals are open
  useEffect(() => {
    document.body.style.overflow = modalOpen || termsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalOpen, termsOpen]);

  // Keyboard nav for carousel
  const slide = useCallback((dir: number) => {
    setCarouselIdx((prev) => {
      const next = prev + dir;
      return next < 0 || next >= sops.length ? prev : next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!modalOpen && !termsOpen) {
        if (e.key === "ArrowLeft") slide(-1);
        if (e.key === "ArrowRight") slide(1);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [slide, modalOpen, termsOpen]);

  const scrollToPricing = () =>
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });

  // Modal openers
  const openSingleModal = (sopId: number) => {
    setModalMode("single"); setModalSopId(sopId); setPayError(""); setModalOpen(true);
  };
  const openBundleCheckoutModal = () => {
    setModalMode("bundle"); setModalSopId(null); setPayError(""); setModalOpen(true);
  };
  const openFullModal = () => {
    setModalMode("full"); setModalSopId(null); setPayError(""); setModalOpen(true);
  };

  const confirmSingle = () => { if (singleSelectedId) openSingleModal(singleSelectedId); };
  const confirmBundle = () => { if (bundleSelected.size === 5) openBundleCheckoutModal(); };

  const toggleSinglePanel = () => {
    setShowSinglePanel((p) => !p);
    setShowBundlePanel(false);
  };
  const toggleBundlePanel = () => {
    setShowBundlePanel((p) => !p);
    setShowSinglePanel(false);
  };

  const selectBundle = (id: number, checked: boolean) => {
    setBundleSelected((prev) => {
      const next = new Set(prev);
      if (checked) {
        if (next.size >= 5) return prev;
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  // Payment handler — PayU redirect flow
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

    const selectedIds =
      modalMode === "full" ? [] :
      modalMode === "bundle" ? Array.from(bundleSelected) :
      modalSopId ? [modalSopId] : [];

    try {
      const hashRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-payu-hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ email, phone: cleanPhone, plan: modalMode, selected_sop_ids: selectedIds, amount: currentAmount }),
      });
      const hashData = await hashRes.json();
      if (!hashData.success) throw new Error(hashData.error || "Payment initialisation failed");

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.payu.in/_payment";
      const fields: Record<string, string> = {
        key: hashData.key, txnid: hashData.txnid, amount: hashData.amount,
        productinfo: hashData.productinfo, firstname: hashData.firstname,
        email: hashData.email, phone: hashData.phone,
        surl: hashData.surl, furl: hashData.furl, hash: hashData.hash,
      };
      for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden"; input.name = name; input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      setPayError(error instanceof Error ? error.message : "Failed to initialise payment. Please try again.");
      setIsProcessing(false);
    }
  };

  // Modal content derived from mode
  const mTag    = modalMode === "full" ? "🏆 Full Vault" : modalMode === "bundle" ? "📦 Starter Bundle" : `📄 ${modalSop?.cat ?? "SOP"}`;
  const mTitle  = modalMode === "full" ? "Full Vault — All 15 SOPs" : modalMode === "bundle" ? "Starter Bundle — 5 SOPs" : (modalSop?.univ ?? "");
  const mProg   = modalMode === "full" ? "All fields · All universities · Instant access" : modalMode === "bundle" ? "Any 5 SOPs across Policy, Data & Health" : (modalSop ? `${modalSop.prog} · ${modalSop.loc}` : "");
  const mW      = modalMode === "full" ? "15" : modalMode === "bundle" ? "5" : (modalSop?.w ?? "");
  const mSec    = modalMode === "full" ? "15" : modalMode === "bundle" ? "5" : (modalSop?.sec ?? "");
  const mTone   = modalMode === "full" || modalMode === "bundle" ? "All" : (modalSop?.tone ?? "");
  const mFit    = modalMode === "full" || modalMode === "bundle" ? "Varied" : (modalSop?.fit ?? "");
  const mI1     = modalMode === "full" ? "All 15 complete SOPs from real admits" : modalMode === "bundle" ? "5 curated SOPs across top-ranking programmes" : (modalSop?.i1 ?? "");
  const mI2     = modalMode === "full" ? "All mentor notes + SOP Adaptation Worksheet" : modalMode === "bundle" ? "5 expert 'Why This Worked' mentor notes" : (modalSop?.i2 ?? "");
  const mI3     = modalMode === "full" ? "Private community access + 10% off mentorship" : modalMode === "bundle" ? "Instant download — all files delivered at once" : (modalSop?.i3 ?? "");
  const mBuyTitle = modalMode === "full" ? "Get the Full Vault — All 15 SOPs" : modalMode === "bundle" ? "Get Starter Bundle — 5 SOPs" : `Get ${modalSop?.prog ?? ""} SOP`;

  // Keep body background navy while this page is mounted so there's no white flash
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#0D1B2A";
    return () => { document.body.style.backgroundColor = prev; };
  }, []);

  return (
    <div className="sv-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-left">
          <div className="hero-eyebrow">⚡ Real Admits · Zero Templates</div>
          <h1>Winning SOPs from<br /><em>Top-Ranked</em> Universities</h1>
          <p className="hero-sub">Study the exact documents that secured real admits to Hertie, Johns Hopkins, Erasmus, Pisa & more. Expert notes explain why each one worked.</p>
          <div className="hero-cta-wrap">
            <button className="btn-hero" onClick={scrollToPricing}>
              Get the Full Vault — ₹799 →
            </button>
            <div className="hero-hint">15 SOPs · Instant download · <strong>Most students pick this</strong></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-video-frame">
            <div className="hvf-topbar">
              <div className="hvf-dot" /><div className="hvf-dot" /><div className="hvf-dot" />
            </div>
            <div className="hvf-play">▶</div>
            <div className="hvf-title">What's inside the Vault</div>
            <div className="hvf-note">Video uploading shortly</div>
            <div className="hvf-progress"><div className="hvf-progress-fill" /></div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <div className="pricing-section" id="pricing">
        <div className="pricing-header">
          <div className="pricing-eyebrow">💳 Choose Your Access</div>
          <h2 className="pricing-title">Pick What Works for You</h2>
          <p className="pricing-sub">Most students choose the Full Vault — it's the sharpest strategic move.</p>
        </div>
        <div className="pricing-cards">

          {/* Single SOP */}
          <div className="pc">
            <span className="pc-icon">📄</span>
            <div className="pc-name">Single SOP</div>
            <div className="pc-desc">Pick any one from the vault</div>
            <div className="pc-price"><span className="curr">₹</span>299</div>
            <div className="pc-price-note">Per SOP · Instant download</div>
            <div className="pc-features">
              <div className="pc-feat"><span className="feat-ck">✓</span> 1 real admit SOP</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> "Why This Worked" note</div>
              <div className="pc-feat"><span className="feat-x">✗</span> Mentor video walkthrough</div>
              <div className="pc-feat"><span className="feat-x">✗</span> SOP Adaptation Worksheet</div>
              <div className="pc-feat"><span className="feat-x">✗</span> Community access</div>
            </div>
            <button className="btn-pc" onClick={toggleSinglePanel}>Choose Your SOP →</button>
            <div className="pc-guarantee">🔒 Secure payment via PayU</div>
            <div className={`checklist-panel${showSinglePanel ? " open" : ""}`}>
              <div className="checklist-label">Select 1 SOP</div>
              <div className="sop-list">
                {sops.map((s) => (
                  <div key={s.id} className={`sop-option${singleSelectedId === s.id ? " selected" : ""}`} onClick={() => setSingleSelectedId(s.id)}>
                    <input type="radio" name="singleSop" value={s.id} checked={singleSelectedId === s.id} onChange={() => setSingleSelectedId(s.id)} />
                    <div><div className="sop-option-text">{s.univ}</div><div className="sop-option-prog">{s.prog}</div></div>
                  </div>
                ))}
              </div>
              <button className={`btn-confirm${singleSelectedId ? " ready" : ""}`} onClick={confirmSingle}>Confirm &amp; Pay ₹299</button>
            </div>
          </div>

          {/* Starter Bundle */}
          <div className="pc">
            <span className="pc-icon">📦</span>
            <div className="pc-name">Starter Bundle</div>
            <div className="pc-desc">Pick any 5 from the vault</div>
            <div className="pc-price"><span className="curr">₹</span>499</div>
            <div className="pc-price-note">5 SOPs · Save ₹996 vs single</div>
            <div className="pc-features">
              <div className="pc-feat"><span className="feat-ck">✓</span> 5 real admit SOPs</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> 5 "Why This Worked" notes</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> Mentor video walkthrough</div>
              <div className="pc-feat"><span className="feat-x">✗</span> SOP Adaptation Worksheet</div>
              <div className="pc-feat"><span className="feat-x">✗</span> Community access</div>
            </div>
            <button className="btn-pc" onClick={toggleBundlePanel}>Choose Your 5 SOPs →</button>
            <div className="pc-guarantee">🔒 Secure payment via PayU</div>
            <div className={`checklist-panel${showBundlePanel ? " open" : ""}`}>
              <div className="checklist-label">Select any 5 SOPs</div>
              <div className="checklist-counter">
                <span>{bundleSelected.size}</span>/5 selected
                <div className="counter-bar"><div className="counter-fill" style={{ width: `${(bundleSelected.size / 5) * 100}%` }} /></div>
              </div>
              <div className="sop-list">
                {sops.map((s) => (
                  <div key={s.id} className={`sop-option${bundleSelected.has(s.id) ? " selected" : ""}`}>
                    <input
                      type="checkbox"
                      value={s.id}
                      checked={bundleSelected.has(s.id)}
                      disabled={!bundleSelected.has(s.id) && bundleSelected.size >= 5}
                      onChange={(e) => selectBundle(s.id, e.target.checked)}
                    />
                    <div><div className="sop-option-text">{s.univ}</div><div className="sop-option-prog">{s.prog}</div></div>
                  </div>
                ))}
              </div>
              <button className={`btn-confirm${bundleSelected.size === 5 ? " ready" : ""}`} onClick={confirmBundle}>Confirm &amp; Pay ₹499</button>
            </div>
          </div>

          {/* Full Vault */}
          <div className="pc vault">
            <div className="vault-ribbon">✦ Best Value</div>
            <span className="pc-icon">🏆</span>
            <div className="pc-name">Full Vault</div>
            <div className="pc-desc">All 15 SOPs · Complete access</div>
            <div className="pc-price"><span className="curr">₹</span>799</div>
            <div className="pc-price-note">All 15 SOPs · Early Bird Price</div>
            <div className="pc-features">
              <div className="pc-feat"><span className="feat-ck">✓</span> All 15 real admit SOPs</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> All 15 "Why This Worked" notes</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> Mentor video walkthrough</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> SOP Adaptation Worksheet</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> Private community access</div>
              <div className="pc-feat"><span className="feat-ck">✓</span> 10% off full mentorship</div>
            </div>
            <button className="btn-pc vault-btn" onClick={openFullModal}>Get Full Vault Now →</button>
            <div className="pc-guarantee">🔒 PayU · Instant delivery · Personal use only</div>
          </div>
        </div>
      </div>

      {/* ── RIBBON ── */}
      <div className="ribbon-wrap">
        <div className="ribbon-track">
          <div className="ribbon-inner">
            <div className="ribbon-item">🔥 Full Vault — <span className="hi">All 15 SOPs for just ₹799</span> <span className="sep">·</span> Early Bird <span className="sep">·</span> Instant Download <span className="sep">·</span></div>
            <div className="ribbon-item">📥 <span className="hi">Save 75% vs buying individually</span> <span className="sep">·</span> Real Admits · No Templates · No Guesswork <span className="sep">·</span></div>
            <div className="ribbon-item">🔥 Full Vault — <span className="hi">All 15 SOPs for just ₹799</span> <span className="sep">·</span> Early Bird <span className="sep">·</span> Instant Download <span className="sep">·</span></div>
            <div className="ribbon-item">📥 <span className="hi">Save 75% vs buying individually</span> <span className="sep">·</span> Real Admits · No Templates · No Guesswork <span className="sep">·</span></div>
          </div>
        </div>
      </div>

      {/* ── SOP CAROUSEL ── */}
      <section id="sops">
        <div className="section-eyebrow">📂 The Vault</div>
        <h2 className="section-title">Browse All 15 SOPs</h2>
        <p className="section-sub">Every SOP includes a handwritten mentor note on exactly why it earned an admit. Instant access after purchase.</p>

        <div className="carousel-topbar">
          <div className="carousel-counter">Showing <strong>{carouselIdx + 1}</strong> of <strong>15</strong></div>
          <div className="carousel-nav">
            <button className="nav-btn" onClick={() => slide(-1)} disabled={carouselIdx === 0}>←</button>
            <button className="nav-btn" onClick={() => slide(1)} disabled={carouselIdx === sops.length - 1}>→</button>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div
            className="carousel-track-wrap"
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              const diff = touchStartX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) slide(diff > 0 ? 1 : -1);
            }}
          >
            <div className="carousel-track" style={{ transform: `translateX(-${carouselIdx * 100}%)` }}>
              {sops.map((s, i) => {
                const th = themes[i % themes.length];
                const rv = reveals[i % reveals.length];
                return (
                  <div key={s.id} className={`sop-card th-${th}`}>
                    <div className={`sop-preview ${th}`}>
                      {s.schol && (
                        <div className={`schol-banner ${scholMap[s.schol]}`}>
                          <span className="schol-icon">{scholIcon[s.schol]}</span>
                          {s.scholText}
                        </div>
                      )}
                      <div className="sop-doc-page">
                        <div className="sop-page-label">Statement of Purpose</div>
                        <div className="sop-page-univ">{s.univ}</div>
                        <div className="sop-page-prog">{s.prog}</div>
                        <div className="sop-page-body" />
                      </div>
                      <div className="sop-reveal">
                        <div className="reveal-star">✨</div>
                        <div className="reveal-pill">{rv}</div>
                      </div>
                    </div>

                    <div className="sop-info">
                      <div className="sop-badges">
                        <span className={`badge ${s.cc}`}>{s.cat}</span>
                        <span className="badge badge-univ">{s.univ.split(" ").slice(0, 2).join(" ")}</span>
                        <span className="admit-result">Admitted</span>
                      </div>
                      <div>
                        <div className="sop-title">{s.univ}</div>
                        <div className="sop-program">{s.prog}</div>
                      </div>
                      <div className="sop-meta">
                        <span>📍 {s.loc}</span>
                        <span>📄 Full SOP</span>
                        <span>🔑 Expert Note</span>
                      </div>
                      <div className="sop-excerpt">{s.excerpt}</div>
                      <div className="sop-stat-strip">
                        <div className="sop-stat"><div className="stat-n">{s.w}</div><div className="stat-l">Words</div></div>
                        <div className="sop-stat"><div className="stat-n">{s.sec}</div><div className="stat-l">Sections</div></div>
                        <div className="sop-stat"><div className="stat-n">{s.tone}</div><div className="stat-l">Tone</div></div>
                        <div className="sop-stat"><div className="stat-n">{s.fit}</div><div className="stat-l">Fit Score</div></div>
                      </div>
                    </div>

                    <div className="sop-note-col">
                      <div className="note-box">
                        <div className="note-label">✍️ Why this SOP worked</div>
                        <div className="note-text">{s.note.substring(0, 140)}...</div>
                        <div className="note-fade"><div className="note-unlock">→ Full note on purchase</div></div>
                      </div>
                      <div className="sop-price-row">
                        <div className="sop-price"><span className="curr">₹</span>299<span className="old">₹599</span></div>
                        <button className="btn-get-sop" onClick={() => openSingleModal(s.id)}>Read This SOP →</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="carousel-dots">
          {sops.map((_, i) => (
            <button key={i} className={`cdot${i === carouselIdx ? " active" : ""}`} onClick={() => setCarouselIdx(i)} />
          ))}
        </div>

        {/* Bundle strip */}
        <div className="bundle-strip">
          <div className="bs-left">
            <div>
              <div className="bs-lbl">💼 Bundle &amp; Save</div>
              <div className="bs-title">Get more SOPs, spend less</div>
            </div>
            <div className="bs-div" />
            <div className="bs-badge">🔥 Early Bird Pricing</div>
          </div>
          <div className="bs-right">
            <div className="bs-plan" onClick={() => { toggleBundlePanel(); scrollToPricing(); }}>
              <div><span className="plan-name">Starter Bundle</span><span className="plan-price">₹499</span><span className="plan-count">Any 5 SOPs</span></div>
              <span className="bs-arrow">→</span>
            </div>
            <div className="bs-plan best" onClick={openFullModal}>
              <div><span className="plan-name">Full Vault ✦ Best Value</span><span className="plan-price">₹799</span><span className="plan-count">All 15 SOPs</span></div>
              <span className="bs-arrow">→</span>
            </div>
          </div>
        </div>

        {/* Terms banner */}
        <div className="terms-banner">
          <div className="terms-icon">⚖️</div>
          <div>
            <div className="terms-title">Usage Terms — Please Read Before Purchasing</div>
            <div className="terms-text">
              All documents are protected intellectual property shared with explicit consent of original authors. By purchasing, you agree to our{" "}
              <button className="terms-link" onClick={() => setTermsOpen(true)}>full usage terms</button>.
              Personal study only — no commercial use, no social media sharing, no redistribution, no AI uploading. Violations are tracked and pursued under IP law.
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-eyebrow" style={{ justifyContent: "center" }}>❓ Questions</div>
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
        <h2>Your deadline isn't waiting.<br />Neither should you.</h2>
        <p>Get the Full Vault — all 15 real admit SOPs for ₹799.</p>
        <button className="btn-footer" onClick={openFullModal}>Get Full Vault — ₹799 →</button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="sv-footer">
        <p>© 2025 1% Admit Vault · All documents used with explicit consent of original authors · <button className="terms-link" style={{ fontSize: "0.75rem" }} onClick={() => setTermsOpen(true)}>Usage Terms</button></p>
        <p style={{ marginTop: 8 }}>🔒 Secured by <strong>PayU</strong> · SSL Encrypted · Instant Delivery</p>
      </footer>

      {/* ── MOBILE STICKY ── */}
      <div className="mob-sticky">
        <div><div className="sticky-lbl">Full Vault · Early Bird</div><div className="sticky-price">₹799 — All 15 SOPs</div></div>
        <button className="btn-sticky-mob" onClick={openFullModal}>Get Access →</button>
      </div>

      {/* ── PAYMENT MODAL ── */}
      <div className={`modal-bd${modalOpen ? " open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <div className="modal">
          <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          <div className="modal-header">
            <div className="modal-tag">{mTag}</div>
            <div className="modal-title">{mTitle}</div>
            <div className="modal-prog">{mProg}</div>
          </div>
          <div className="modal-body">
            <div className="vid-wrap">
              <div className="vid-lbl">🎥 Mentor Walkthrough</div>
              <div className="play-btn">▶</div>
              <div className="vid-cap">How to use this SOP effectively — what to adapt, what to keep, and how to make it authentically yours.</div>
            </div>
            <div className="analytics">
              <div className="a-head">📊 SOP Analytics</div>
              <div className="a-grid">
                <div className="a-stat"><div className="stat-val">{mW}</div><div className="stat-key">Word Count</div></div>
                <div className="a-stat"><div className="stat-val">{mSec}</div><div className="stat-key">Key Sections</div></div>
                <div className="a-stat"><div className="stat-val">{mTone}</div><div className="stat-key">Writing Tone</div></div>
                <div className="a-stat"><div className="stat-val">{mFit}</div><div className="stat-key">Programme Fit</div></div>
              </div>
              <div className="insights">
                <div className="ins-row"><div className="ins-dot" /><span>{mI1}</span></div>
                <div className="ins-row"><div className="ins-dot" /><span>{mI2}</span></div>
                <div className="ins-row"><div className="ins-dot" /><span>{mI3}</span></div>
              </div>
            </div>
          </div>
          <div className="modal-buy">
            <div className="buy-top">
              <div className="buy-info">
                <h3>{mBuyTitle}</h3>
                <p>Instant delivery · Real admit document · Personal study only</p>
              </div>
              <div className="modal-price"><span className="curr">₹</span>{currentAmount}</div>
            </div>
            <div className="email-pay-row">
              <input
                className="email-input"
                type="email"
                placeholder="your@email.com — we'll send download links here"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="email-input"
                type="tel"
                placeholder="Phone number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button className="btn-pay" onClick={handlePay} disabled={isProcessing}>
                {isProcessing ? "Redirecting to PayU…" : "⚡ Pay & Download Now"}
              </button>
            </div>
            {payError && <div className="pay-error">{payError}</div>}
            <div className="rzp">🔒 Secured by PayU · Safe &amp; Encrypted</div>
          </div>
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
