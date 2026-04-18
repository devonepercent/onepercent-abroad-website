import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logoWhite from "@/assets/logo-white.png";
import Testimonials from "@/components/Testimonials";
import Achievers from "@/components/Achievers";
import Services from "@/components/Services";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";
import NewsletterPopup from "@/components/NewsletterPopup";

const milestones = [
  { step: "Step 01", title: "Onboarding",          desc: "We understand your dreams, strengths, and aspirations. A deep-dive session maps your academic profile and sets the trajectory.",                side: 1  },
  { step: "Step 02", title: "School listing",       desc: "Our golden database of 1,000+ programs meets your profile. A strategic mix of ambitious, target, and safe universities.",                        side: -1 },
  { step: "Step 03", title: "Profile development",  desc: "Building a compelling narrative. We identify gaps, strengthen weak points, and position you as the unmissable candidate.",                        side: 1  },
  { step: "Step 04", title: "SOP writing strategy", desc: "Your Statement of Purpose becomes your strongest weapon — a narrative admissions committees remember.",                                           side: -1 },
  { step: "Step 05", title: "CV finalizing",        desc: "Every line refined to academic standards. Achievements, research, and experiences presented with maximum impact.",                               side: 1  },
  { step: "Step 06", title: "Application strategy", desc: "Deadline management, interview prep, and a submission strategy maximising your odds at every dream university.",                                  side: -1 },
];

const MILESTONE_T = [0.08, 0.23, 0.38, 0.54, 0.70, 0.88];

const uniNodes = [
  { src: "/uni-logos/harvard.svg",         name: "Harvard",      left: "6%",  top: "50%", size: 136, dur: "3.4s", delay: "0s",   flag: false },
  { src: "/uni-logos/mit.svg",             name: "MIT",           left: "24%", top: "30%", size: 96,  dur: "3.8s", delay: "0.3s", flag: false },
  { src: "/uni-logos/oxford.svg",          name: "Oxford",        left: "50%", top: "27%", size: 117, dur: "3.1s", delay: "0.7s", flag: false },
  { src: "/uni-logos/erasmus.svg",         name: "Erasmus+",      left: "74%", top: "31%", size: 96,  dur: "4.0s", delay: "0.2s", flag: false },
  { src: "/uni-logos/lse.svg",             name: "LSE",           left: "91%", top: "52%", size: 136, dur: "3.6s", delay: "0.9s", flag: false },
  { src: "/uni-logos/nus.svg",             name: "NUS",           left: "80%", top: "76%", size: 96,  dur: "2.9s", delay: "0.5s", flag: false },
  { src: "/uni-logos/gt.svg",              name: "Georgia Tech",  left: "34%", top: "90%", size: 96,  dur: "3.5s", delay: "1.1s", flag: false },
  { src: "https://flagcdn.com/w80/us.png", name: "USA",           left: "20%", top: "94%", size: 96,  dur: "3.3s", delay: "0.4s", flag: true  },
  { src: "https://flagcdn.com/w80/gb.png", name: "UK",            left: "7%",  top: "80%", size: 117, dur: "3.7s", delay: "1.0s", flag: true  },
  { src: "https://flagcdn.com/w80/au.png", name: "Australia",     left: "85%", top: "87%", size: 136, dur: "3.2s", delay: "0.6s", flag: true  },
  { src: "https://flagcdn.com/w80/de.png", name: "Germany",       left: "56%", top: "94%", size: 117, dur: "4.1s", delay: "0.8s", flag: true  },
];

const Index = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollRef    = useRef<HTMLDivElement>(null);
  const particleRef  = useRef<HTMLCanvasElement>(null);
  const pathRef      = useRef<HTMLCanvasElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const uniLogosRef  = useRef<HTMLDivElement>(null);
  const uniLabelRef  = useRef<HTMLDivElement>(null);
  const uniNodeRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const wave1Ref     = useRef<HTMLDivElement>(null);
  const wave2Ref     = useRef<HTMLDivElement>(null);
  const wave3Ref     = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef(0);

  // Lock body scroll
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => { html.style.overflow = prev; document.body.style.overflow = ""; };
  }, []);

  // Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Main animation engine
  useEffect(() => {
    const scrollEl  = scrollRef.current;
    const pCanvas   = particleRef.current;
    const jCanvas   = pathRef.current;
    const hero      = heroRef.current;
    const uniLogos  = uniLogosRef.current;
    const uniLabel  = uniLabelRef.current;
    if (!scrollEl || !pCanvas || !jCanvas || !hero || !uniLogos || !uniLabel) return;

    const px = pCanvas.getContext("2d")!;
    const jx = jCanvas.getContext("2d")!;

    const TOTAL_SCROLL = 6000;
    const HERO_END     = 750;
    const PATH_LENGTH  = 12000;
    const PATH_POINTS  = 1200;
    const FOV          = 600;
    const CAM_Y        = -320;

    function resize() {
      pCanvas!.width  = window.innerWidth;
      pCanvas!.height = window.innerHeight;
      jCanvas!.width  = window.innerWidth;
      jCanvas!.height = window.innerHeight;
    }
    resize();

    // Build 3-D path
    const pathPts: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i <= PATH_POINTS; i++) {
      const t = i / PATH_POINTS;
      pathPts.push({ x: Math.sin(t * Math.PI * 2.5) * 160, y: 0, z: t * PATH_LENGTH });
    }

    function project(px3d: number, py3d: number, pz3d: number, camZ: number, W: number, H: number) {
      const rz = pz3d - camZ;
      if (rz < 1) return null;
      const scale = FOV / rz;
      return { x: W / 2 + px3d * scale, y: H / 2 + (py3d - CAM_Y) * scale, scale, z: rz };
    }

    function drawPath3D(camZ: number, W: number, H: number) {
      jx.clearRect(0, 0, W, H);

      const projected = pathPts.map(p => {
        const pr = project(p.x, p.y, p.z, camZ, W, H);
        return (pr && pr.z < 5000) ? pr : null;
      });

      const left: { x: number; y: number }[]  = [];
      const right: { x: number; y: number }[] = [];
      const center: { x: number; y: number; scale: number; z: number }[] = [];

      for (let i = 0; i < projected.length; i++) {
        const pr = projected[i]; if (!pr) continue;
        const prev = i > 0 ? projected[i - 1] : null;
        const next = i < projected.length - 1 ? projected[i + 1] : null;
        let tdx = 0, tdy = 0;
        if (prev && next) { tdx = next.x - prev.x; tdy = next.y - prev.y; }
        else if (next)    { tdx = next.x - pr.x;   tdy = next.y - pr.y; }
        else if (prev)    { tdx = pr.x - prev.x;   tdy = pr.y - prev.y; }
        else continue;
        const tlen = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
        const nx = -tdy / tlen, ny = tdx / tlen;
        const hw = Math.min(100 * pr.scale, 150 * pr.scale * 2);
        left.push({ x: pr.x + nx * hw, y: pr.y + ny * hw });
        right.push({ x: pr.x - nx * hw, y: pr.y - ny * hw });
        center.push({ x: pr.x, y: pr.y, scale: pr.scale, z: pr.z });
      }
      if (left.length < 2) return;

      function smoothCurve(pts: { x: number; y: number }[], move: boolean) {
        if (move) jx.moveTo(pts[0].x, pts[0].y);
        else      jx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          jx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        jx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }

      const sg = jx.createLinearGradient(center[0].x, center[0].y, center[center.length - 1].x, center[center.length - 1].y);
      sg.addColorStop(0,    "rgba(97,162,254,0.55)");
      sg.addColorStop(0.98, "rgba(97,162,254,0.55)");
      sg.addColorStop(1,    "rgba(97,162,254,0)");

      jx.beginPath(); smoothCurve(left, true);
      jx.strokeStyle = sg; jx.lineWidth = 2; jx.lineJoin = "round"; jx.stroke();
      jx.beginPath(); smoothCurve(right, true);
      jx.strokeStyle = sg; jx.lineWidth = 2; jx.stroke();

      for (let i = 0; i < center.length; i += 8) {
        const c = center[i];
        if (Math.random() > 0.3) continue;
        const drift = (Math.random() - 0.5) * 20 / Math.max(1, c.z * 0.01);
        jx.beginPath();
        jx.arc(c.x + drift, c.y + drift * 0.5, 1.5 / Math.max(1, c.z * 0.003), 0, Math.PI * 2);
        jx.fillStyle = `rgba(97,162,254,${0.3 / Math.max(1, c.z * 0.002)})`; jx.fill();
      }

      MILESTONE_T.forEach(t => {
        const z = t * PATH_LENGTH, rz = z - camZ;
        if (rz < 5 || rz > 4000) return;
        const pi = Math.floor(t * PATH_POINTS);
        const pp = pathPts[Math.min(pi, pathPts.length - 1)];
        const pr = project(pp.x, pp.y, pp.z, camZ, W, H);
        if (!pr) return;
        const alpha = Math.max(0, Math.min(1, 1 - rz / 3000));
        jx.beginPath(); jx.arc(pr.x, pr.y, 20 * pr.scale, 0, Math.PI * 2);
        jx.fillStyle = `rgba(59,130,246,${0.15 * alpha})`; jx.fill();
        jx.beginPath(); jx.arc(pr.x, pr.y, 6 * pr.scale, 0, Math.PI * 2);
        jx.fillStyle = `rgba(97,162,254,${0.8 * alpha})`; jx.fill();
        jx.beginPath(); jx.arc(pr.x, pr.y, 3 * pr.scale, 0, Math.PI * 2);
        jx.fillStyle = `rgba(255,255,255,${0.9 * alpha})`; jx.fill();
      });

      const fadeH = H * 0.42;
      const erase = jx.createLinearGradient(0, 0, 0, fadeH);
      erase.addColorStop(0,    "rgba(0,0,0,1)");
      erase.addColorStop(0.65, "rgba(0,0,0,0.5)");
      erase.addColorStop(1,    "rgba(0,0,0,0)");
      jx.globalCompositeOperation = "destination-out";
      jx.fillStyle = erase; jx.fillRect(0, 0, W, fadeH);
      jx.globalCompositeOperation = "source-over";
    }

    function updateCards(camZ: number, W: number, H: number) {
      if (camZ <= 0) {
        milestones.forEach((_, i) => {
          const el = cardRefs.current[i];
          if (el) { el.style.opacity = "0"; el.style.pointerEvents = "none"; }
        });
        return;
      }
      milestones.forEach((m, idx) => {
        const el = cardRefs.current[idx]; if (!el) return;
        const t  = MILESTONE_T[idx];
        const z  = t * PATH_LENGTH, rz = z - camZ;
        const pi = Math.floor(t * PATH_POINTS);
        const pp = pathPts[Math.min(pi, pathPts.length - 1)];
        const pr = project(pp.x + m.side * 100, pp.y - 30, pp.z, camZ, W, H);

        if (!pr || rz < -300 || rz > 5000) { el.style.opacity = "0"; el.style.pointerEvents = "none"; return; }

        // Alpha: next card visible at ~45% when on current; fades out after passing
        let alpha: number;
        if (rz < 0)         alpha = Math.max(0, 1 + rz / 250);
        else if (rz < 400)  alpha = 1;
        else if (rz < 2500) alpha = 1 - (rz - 400) / 2100;
        else                alpha = 0;

        // Subtle depth scale: 0.70 far → 1.0 close
        const depthScale = rz <= 0 ? 1.0 : 0.7 + 0.3 * Math.max(0, 1 - rz / 2000);

        // Y: 40% projected + 60% screen-center keeps card readable while feeling 3D
        const cardY = pr.y * 0.4 + H * 0.5 * 0.6;

        el.style.opacity       = alpha.toFixed(3);
        el.style.left          = pr.x + "px";
        el.style.top           = cardY + "px";
        el.style.transform     = `translate(-50%,-50%) scale(${depthScale.toFixed(3)})`;
        el.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
      });
    }

    // Particles
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() * 3 + 0.1,
      sp: 0.002 + Math.random() * 0.006, sz: 0.5 + Math.random() * 1.5, br: 0.2 + Math.random() * 0.6,
    }));
    let sSpeed = 0;

    function drawParticles() {
      const W = pCanvas!.width, H = pCanvas!.height, cx = W / 2, cy = H / 2;
      px.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.z -= p.sp * (1 + sSpeed * 8);
        if (p.z <= 0.05) { p.z = 3; p.x = Math.random() * 2 - 1; p.y = Math.random() * 2 - 1; }
        const sc = 500 / p.z, sx = cx + p.x * sc, sy = cy + p.y * sc, r = p.sz * (1 / p.z) * 0.6;
        if (sx < -10 || sx > W + 10 || sy < -10 || sy > H + 10) return;
        const a = p.br * Math.min(1, (3 - p.z) / 2) * Math.min(1, p.z * 1.5);
        px.beginPath(); px.arc(sx, sy, Math.max(0.3, r), 0, Math.PI * 2);
        px.fillStyle = `rgba(200,220,248,${a})`; px.fill();
      });
      animFrameRef.current = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // Scroll handler
    let lastST = 0;
    function update() {
      const st      = scrollEl.scrollTop;
      const maxST   = TOTAL_SCROLL - window.innerHeight;
      const progress = Math.min(st / maxST, 1);
      const W = window.innerWidth, H = window.innerHeight;
      sSpeed = Math.min(Math.abs(st - lastST) / 30, 1);
      lastST = st;

      // Hero fade
      if (st < HERO_END) {
        hero!.style.opacity = (1 - st / HERO_END).toFixed(3);
        hero!.style.display = "";
      } else {
        hero!.style.opacity = "0";
        hero!.style.display = "none";
      }

      // Camera along path
      const pathMax  = maxST - HERO_END;
      const camZ     = Math.min(Math.max(0, st - HERO_END) / pathMax, 1) * PATH_LENGTH;
      drawPath3D(camZ, W, H);
      updateCards(camZ, W, H);

      // Progress dots
      const ai = Math.min(Math.round(progress * 9), 9);
      dotRefs.current.forEach((d, i) => {
        if (!d) return;
        if (i < ai)       { d.style.background = "#3b82f6"; d.style.borderColor = "#3b82f6"; d.style.boxShadow = ""; }
        else if (i === ai){ d.style.background = "#61A2FE"; d.style.borderColor = "#61A2FE"; d.style.boxShadow = "0 0 8px rgba(97,162,254,0.5)"; }
        else              { d.style.background = "rgba(97,162,254,0.1)"; d.style.borderColor = "rgba(97,162,254,0.12)"; d.style.boxShadow = ""; }
      });

      // Waves fade
      const wf = (1 - progress * 0.4) * 0.06;
      [wave1Ref, wave2Ref, wave3Ref].forEach(r => { if (r.current) r.current.style.opacity = wf.toFixed(4); });

      // Uni logos
      const logoRaw = st - (maxST - 500);
      uniLabel!.style.opacity = Math.max(0, Math.min(logoRaw / 200, 1)).toFixed(3);
      uniNodeRefs.current.forEach((node, i) => {
        if (!node) return;
        node.style.opacity = Math.max(0, Math.min((logoRaw - 80 - i * 60) / 240, 1)).toFixed(3);
      });
      const slideP = Math.max(0, Math.min((logoRaw - 700) / 400, 1));
      uniLogos!.style.transform = `translateY(${(-slideP * 100).toFixed(2)}vh)`;

      const sceneA = logoRaw < 500 ? 1 : Math.max(0, 1 - (logoRaw - 500) / 300);
      jCanvas!.style.opacity = sceneA.toFixed(3);
      pCanvas!.style.opacity = sceneA.toFixed(3);
    }

    scrollEl.addEventListener("scroll", update, { passive: true });
    const speedTick = setInterval(() => { sSpeed *= 0.85; }, 60);
    update();

    function onResize() { resize(); update(); }
    window.addEventListener("resize", onResize);

    return () => {
      scrollEl.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      clearInterval(speedTick);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const container = scrollRef.current;
    const el = document.getElementById(id);
    if (container && el) {
      const elRect        = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      container.scrollTo({ top: container.scrollTop + (elRect.top - containerRect.top), behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const navLinkStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.6)",
    background: "none", border: "none", cursor: "pointer",
    letterSpacing: "0.4px", fontFamily: "inherit", padding: 0,
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "#0a1628", fontFamily: "'DM Sans', sans-serif", color: "#fff", overflow: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bob  { 0%,100%{transform:translate(-50%,-50%) translateY(0)} 50%{transform:translate(-50%,-50%) translateY(-14px)} }
        @keyframes ms   { 0%{opacity:1;transform:translateX(-50%) translateY(0)} 100%{opacity:0;transform:translateX(-50%) translateY(10px)} }
        @keyframes wa   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes wb   { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        @keyframes wc   { 0%{transform:translateX(-25%)} 100%{transform:translateX(-75%)} }
        .nav-link-hover:hover { color:#fff !important; }
        .cta-btn-hover:hover  { transform:scale(1.05); box-shadow:0 4px 24px rgba(59,130,246,0.3); }
        .scroll-dot { animation:ms 1.8s infinite; }
      ` }} />

      {/* ── Canvases ── */}
      <canvas ref={particleRef} style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:2,pointerEvents:"none" }} />
      <canvas ref={pathRef}     style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",zIndex:4,pointerEvents:"none" }} />

      {/* ── Waves ── */}
      <div ref={wave1Ref} style={{ position:"fixed",bottom:0,left:0,width:"200%",zIndex:2,pointerEvents:"none",animation:"wa 18s linear infinite",opacity:0.06,height:200 }}>
        <svg viewBox="0 0 2400 200" preserveAspectRatio="none" style={{width:"100%",display:"block"}}><path d="M0,100 C200,50 400,150 600,100 C800,50 1000,150 1200,100 C1400,50 1600,150 1800,100 C2000,50 2200,150 2400,100 L2400,200 L0,200Z" fill="rgba(59,130,246,0.45)"/></svg>
      </div>
      <div ref={wave2Ref} style={{ position:"fixed",bottom:30,left:0,width:"200%",zIndex:2,pointerEvents:"none",animation:"wb 24s linear infinite",opacity:0.04,height:160 }}>
        <svg viewBox="0 0 2400 160" preserveAspectRatio="none" style={{width:"100%",display:"block"}}><path d="M0,80 C300,30 500,130 800,80 C1100,30 1300,130 1600,80 C1900,30 2100,130 2400,80 L2400,160 L0,160Z" fill="rgba(97,162,254,0.35)"/></svg>
      </div>
      <div ref={wave3Ref} style={{ position:"fixed",bottom:15,left:0,width:"200%",zIndex:2,pointerEvents:"none",animation:"wc 14s linear infinite",opacity:0.05,height:130 }}>
        <svg viewBox="0 0 2400 130" preserveAspectRatio="none" style={{width:"100%",display:"block"}}><path d="M0,65 C250,100 450,30 700,65 C950,100 1150,30 1400,65 C1650,100 1850,30 2100,65 L2400,65 L2400,130 L0,130Z" fill="rgba(59,130,246,0.3)"/></svg>
      </div>

      {/* ── Navbar ── */}
      <nav style={{ position:"fixed",top:0,left:0,width:"100%",zIndex:100,padding:"24px 48px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <Link to="/" style={{ display:"flex",alignItems:"center" }}>
          <img src={logoWhite} alt="OnePercent Abroad" style={{ height:36,width:"auto" }} />
        </Link>
        <div className="hidden md:flex" style={{ gap:32,alignItems:"center" }}>
          {[
            { label:"Services",     action: () => scrollToSection("services") },
            { label:"How it Works", action: () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }) },
            { label:"Testimonials", action: () => scrollToSection("testimonials") },
            { label:"FAQ",          action: () => scrollToSection("faq") },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="nav-link-hover" style={navLinkStyle}>{item.label}</button>
          ))}
          <Link to="/blog"   className="nav-link-hover" style={{ ...navLinkStyle, textDecoration:"none" }}>Updates</Link>
          <Link to="/hiring" className="nav-link-hover" style={{ ...navLinkStyle, textDecoration:"none" }}>Careers</Link>
          <Link to="/get-started" className="cta-btn-hover" style={{ background:"#fff",color:"#0a1628",padding:"10px 28px",borderRadius:50,fontSize:13,fontWeight:600,textDecoration:"none",transition:"transform 0.2s,box-shadow 0.3s",display:"inline-block" }}>
            Start Your Journey
          </Link>
        </div>
        <button className="flex md:hidden" onClick={() => setMobileOpen(o => !o)} style={{ background:"none",border:"none",cursor:"pointer",color:"#fff",padding:4 }} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(10,22,40,0.97)",zIndex:99,display:"flex",flexDirection:"column",padding:"100px 32px 32px",gap:28 }}>
          {[
            { label:"Services",     action: () => scrollToSection("services") },
            { label:"How it Works", action: () => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); setMobileOpen(false); } },
            { label:"Testimonials", action: () => scrollToSection("testimonials") },
            { label:"FAQ",          action: () => scrollToSection("faq") },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{ ...navLinkStyle, fontSize:18, color:"#fff", textAlign:"left" }}>{item.label}</button>
          ))}
          <Link to="/blog"   onClick={() => setMobileOpen(false)} style={{ fontSize:18,color:"#fff",textDecoration:"none" }}>Updates</Link>
          <Link to="/hiring" onClick={() => setMobileOpen(false)} style={{ fontSize:18,color:"#fff",textDecoration:"none" }}>Careers</Link>
          <Link to="/get-started" onClick={() => setMobileOpen(false)} style={{ background:"#fff",color:"#0a1628",padding:"14px 32px",borderRadius:50,fontSize:15,fontWeight:600,textDecoration:"none",display:"inline-block",textAlign:"center",marginTop:8 }}>
            Start Your Journey
          </Link>
        </div>
      )}

      {/* ── Progress dots ── */}
      <div className="hidden md:flex" style={{ position:"fixed",right:24,top:"50%",transform:"translateY(-50%)",zIndex:100,flexDirection:"column",gap:8 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} ref={el => { dotRefs.current[i] = el; }} style={{ width:7,height:7,borderRadius:"50%",background:"rgba(97,162,254,0.1)",border:"1px solid rgba(97,162,254,0.12)",transition:"all 0.4s" }} />
        ))}
      </div>

      {/* ── Hero ── */}
      <div ref={heroRef} style={{ position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:10,transition:"opacity 0.5s",pointerEvents:"none" }}>
        <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",width:"min(720px, calc(100vw - 48px))",padding:"0 24px" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(40px,7vw,80px)",fontWeight:600,lineHeight:1.08,margin:"0 0 20px" }}>
            Your path to top <em style={{ fontStyle:"italic",color:"#61A2FE" }}>1%</em> universities abroad
          </h1>
          <p style={{ fontSize:"clamp(14px,1.8vw,17px)",color:"rgba(255,255,255,0.6)",lineHeight:1.7,maxWidth:480,margin:"0 auto 48px" }}>
            Personalized mentorship guiding ambitious students from aspiration to acceptance at the world's most prestigious universities.
          </p>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:10 }}>
            <span style={{ fontSize:10,letterSpacing:3,textTransform:"uppercase",color:"rgba(255,255,255,0.3)" }}>Scroll to explore</span>
            <div style={{ width:22,height:34,border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:11,position:"relative" }}>
              <div className="scroll-dot" style={{ width:3,height:7,background:"#61A2FE",borderRadius:2,position:"absolute",top:7,left:"50%",transform:"translateX(-50%)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Milestone cards ── */}
      {milestones.map((m, i) => (
        <div key={i} ref={el => { cardRefs.current[i] = el; }} style={{ position:"fixed",zIndex:8,opacity:0,pointerEvents:"none",willChange:"transform,opacity",width:"min(480px, 90vw)" }}>
          <div style={{ background:"rgba(10,22,40,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(97,162,254,0.12)",borderRadius:20,padding:"clamp(24px, 5vw, 36px) clamp(20px, 5vw, 44px)",width:"100%",boxSizing:"border-box",boxShadow:"0 8px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ display:"inline-flex",padding:"8px 20px",background:"rgba(59,130,246,0.12)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:50,fontSize:14,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"#3b82f6",marginBottom:20 }}>{m.step}</div>
            <div style={{ width:68,height:2,background:"linear-gradient(90deg,#3b82f6,#61A2FE)",marginBottom:20,borderRadius:1 }} />
            <h3 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(24px, 5vw, 32px)",fontWeight:600,lineHeight:1.2,marginBottom:14 }}>{m.title}</h3>
            <p style={{ fontSize:"clamp(14px, 3vw, 16px)",color:"rgba(255,255,255,0.6)",lineHeight:1.7,margin:0 }}>{m.desc}</p>
          </div>
        </div>
      ))}

      {/* ── University logos overlay ── */}
      <div ref={uniLogosRef} style={{ position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:9,pointerEvents:"none" }}>
        <div ref={uniLabelRef} style={{ position:"absolute",top:"70%",left:"50%",transform:"translate(-50%,-180%)",textAlign:"center",opacity:0 }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,3.5vw,46px)",fontWeight:600,marginTop:0,lineHeight:1.2 }}>
            Get accepted into the world's finest <em style={{ fontStyle:"italic",color:"#61A2FE" }}>institutions</em>
          </h2>
        </div>
        {uniNodes.map((node, i) => (
          <div key={i} ref={el => { uniNodeRefs.current[i] = el; }}
            style={{ position:"absolute",display:"flex",flexDirection:"column",alignItems:"center",gap:10,left:node.left,top:node.top,transform:"translate(-50%,-50%)",opacity:0,animation:`bob ${node.dur} ease-in-out infinite ${node.delay}` }}>
            <div style={{ width:node.size,height:node.size,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:node.flag?"50%":undefined,overflow:node.flag?"hidden":undefined }}>
              <img src={node.src} alt={node.name} style={{ width:"100%",height:"100%",objectFit:node.flag?"cover":"contain",filter:"drop-shadow(0 0 10px rgba(97,162,254,0.55))" }} />
            </div>
            <div style={{ fontSize:10,fontWeight:500,letterSpacing:"1.5px",textTransform:"uppercase",color:"rgba(97,162,254,0.45)",whiteSpace:"nowrap" }}>{node.name}</div>
          </div>
        ))}
      </div>

      {/* ── Main scroll container ── */}
      <div
        ref={scrollRef}
        style={{ position:"fixed",top:0,left:0,width:"100vw",height:"100vh",overflowY:"scroll",overflowX:"hidden",zIndex:50,WebkitOverflowScrolling:"touch" as never }}
      >
        <div style={{ height: 6700 }} />
        <Testimonials />
        <Achievers />
        <Services />
        <FAQ />
        <NewsletterSection />
        <Footer />
      </div>
      <NewsletterPopup />
      <WhatsAppButton />
    </div>
  );
};

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 15000);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href="https://wa.me/919567200157"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 9998,
        width: 56,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.8s ease",
        filter: "drop-shadow(0 4px 12px rgba(37,211,102,0.45))",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 175.216 175.552" width="56" height="56">
        <defs>
          <linearGradient id="wa-b" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#57d163"/>
            <stop offset="1" stopColor="#23b33a"/>
          </linearGradient>
        </defs>
        <path fill="#b3b3b3" d="m54.532 138.45 2.235 1.324c9.387 5.571 20.15 8.518 31.126 8.523h.023c33.707 0 61.139-27.426 61.153-61.135.006-16.335-6.349-31.696-17.895-43.251A60.75 60.75 0 0 0 87.94 25.983c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.312-6.179 22.558zm-40.811 23.544L24.16 123.88c-6.438-11.154-9.825-23.808-9.821-36.772.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
        <path fill="#fff" d="m12.966 161.238 10.439-38.114a73.42 73.42 0 0 1-9.821-36.772c.017-40.556 33.021-73.55 73.578-73.55 19.681.01 38.154 7.669 52.047 21.572s21.537 32.383 21.53 52.037c-.018 40.553-33.027 73.553-73.578 73.553h-.032c-12.313-.005-24.412-3.094-35.159-8.954z"/>
        <path fill="url(#wa-b)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.387 5.571 20.15 8.517 31.126 8.523h.023c33.707 0 61.14-27.426 61.153-61.135a60.75 60.75 0 0 0-17.895-43.251 60.75 60.75 0 0 0-43.235-17.928z"/>
        <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
      </svg>
    </a>
  );
};

export default Index;
