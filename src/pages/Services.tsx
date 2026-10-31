import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import "./Services.css";
import Arrow from "@/components/site/Arrow";

const services = [
  {
    tone: "blue", icon: "person_search", tag: "Every applicant",
    title: "Profile analysis & development",
    desc: "Understand the current profile before deciding what to apply for.",
    points: ["Strength and gap analysis", "Academic, research, internship and leadership planning", "Profile-development priorities", "Evidence-building before applications"],
  },
  {
    tone: "amber", icon: "account_balance", tag: "Shortlisting",
    title: "University & programme strategy",
    desc: "Build the shortlist around fit, ambition, funding and realistic competitiveness.",
    points: ["Programme and university research", "Ambitious / balanced / safer options", "Country and career considerations", "Final application portfolio"],
  },
  {
    tone: "lilac", icon: "payments", tag: "Funding",
    title: "Scholarship strategy",
    desc: "Identify relevant funding routes and align the profile with the opportunity.",
    points: ["Erasmus Mundus and European funding", "DAAD and country-specific routes", "Scholarship-fit analysis", "Application positioning and evidence"],
  },
  {
    tone: "mint", icon: "edit_document", tag: "Applications",
    title: "Application strategy",
    desc: "Turn the profile into a coherent, evidence-backed application.",
    points: ["SOP / essay strategy", "CV and profile positioning", "Recommendation strategy", "Application review and consistency"],
  },
];

const applicantTypes = [
  { chip: "UG",  title: "Bachelor’s mentorship", cta: "Assess my Bachelor’s profile", desc: "Build an academic and extracurricular profile, identify best-fit universities, plan essays and applications, and make funding decisions early." },
  { chip: "MS",  title: "Master’s mentorship",   cta: "Assess my Master’s profile",   desc: "Programme strategy, profile development, research or work positioning, scholarship planning, shortlist construction and application narrative." },
  { chip: "MBA", title: "MBA mentorship",        cta: "Assess my MBA profile",        desc: "School fit, career narrative, leadership positioning, profile gaps, application strategy and programme-specific storytelling." },
  { chip: "PhD", title: "PhD mentorship",        cta: "Assess my PhD profile",        desc: "Research positioning, supervisor and lab fit, funded routes, proposal narrative, academic profile development and application planning." },
];

const faqs = [
  { q: "Is there a fixed package price?", a: "No. Engagement scope varies according to the student’s requirements." },
  { q: "Who attends the first call?", a: "The first connecting call is free and is attended by a senior counsellor." },
  { q: "Can I get only scholarship or shortlisting support?", a: "The exact scope should be decided after understanding the student’s profile and need; the service architecture supports focused as well as broader mentorship requirements." },
];

const VERTEX_SHADER = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;

const FRAGMENT_SHADER = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_mouseAmt;
// Each blob roams the whole screen on two out-of-phase sine paths.
vec2 roam(float t, vec2 f, vec2 ph, vec2 span) {
  return vec2(sin(t * f.x + ph.x) + 0.35 * sin(t * f.y * 1.7 + ph.y),
              cos(t * f.y + ph.y) + 0.35 * cos(t * f.x * 1.3 + ph.x)) * span / 1.35;
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  p.x *= aspect;
  float t = u_time * 0.22;
  vec2 span = vec2(aspect * 0.95, 0.95);
  vec3 col = vec3(0.04, 0.043, 0.052);
  vec2 c1 = roam(t, vec2(0.70, 0.50), vec2(0.0, 1.0), span);
  vec2 c2 = roam(t, vec2(0.55, 0.80), vec2(2.1, 3.4), span);
  vec2 c3 = roam(t, vec2(0.45, 0.65), vec2(4.2, 0.6), span);
  vec2 c4 = roam(t, vec2(0.60, 0.40), vec2(1.3, 5.0), span);
  vec3 blue = vec3(0.18, 0.42, 0.98);
  vec3 purple = vec3(0.55, 0.22, 0.88);
  vec3 rose = vec3(0.92, 0.32, 0.48);
  vec3 cyan = vec3(0.15, 0.75, 0.95);
  vec3 aura = blue * smoothstep(1.5, 0.0, length(p - c1)) * 0.45
            + purple * smoothstep(1.4, 0.0, length(p - c2)) * 0.4
            + rose * smoothstep(1.5, 0.0, length(p - c3)) * 0.33
            + cyan * smoothstep(1.3, 0.0, length(p - c4)) * 0.3;
  vec2 m = (u_mouse * 2.0 - 1.0) * vec2(aspect, 1.0);
  aura += vec3(0.32, 0.5, 1.0) * smoothstep(0.95, 0.0, length(p - m)) * 0.3 * u_mouseAmt;
  gl_FragColor = vec4(col + aura, 1.0);
}`;

// Animated ambient glow background (WebGL), with a static CSS fallback.
const AmbientGlow = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl");
    if (!canvas || !gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uMouseAmt = gl.getUniformLocation(prog, "u_mouseAmt");

    // The mouse glow eases toward the cursor; it fades out when the pointer leaves.
    const target = { x: 0.5, y: 0.5, amt: 0 };
    const mouse = { x: 0.5, y: 0.5, amt: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX / window.innerWidth;
      target.y = 1 - e.clientY / window.innerHeight;
      target.amt = 1;
    };
    const onLeave = () => { target.amt = 0; };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const render = (t: number) => {
      const w = canvas.clientWidth || 1280, h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, w, h);
      mouse.x += (target.x - mouse.x) * 0.04;
      mouse.y += (target.y - mouse.y) * 0.04;
      mouse.amt += (target.amt - mouse.amt) * 0.03;
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uMouseAmt, mouse.amt);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!still) frame = requestAnimationFrame(render);
    };
    render(0);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div className="glow-fallback" aria-hidden />
      <canvas ref={canvasRef} className="glow" aria-hidden />
    </>
  );
};

// Tilt a card toward the cursor and move its sheen with it.
const tilt = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
  el.style.setProperty("--mx", `${x * 100}%`);
  el.style.setProperty("--my", `${y * 100}%`);
};
const untilt = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--rx", "0deg");
};

const Services = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => trackRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="op-site op-services">
      <AmbientGlow />
      <SiteNav variant="dark" />

      <main>
        <div className="wrap">
          <section className="s-hero">
            <div className="s-tag mono"><i />1%abroad services</div>
            <h1>Mentorship built around where you are and where you want to go.</h1>
            <p>There is no one standard package. Scope changes with the applicant, degree level, profile gaps, target universities, scholarship ambition and application stage.</p>
            <a className="pill" href="#services-grid">Find the right service <Arrow dir="up-right" /></a>
          </section>

          <div className="s-head" id="services-grid">
            <div>
              <span className="mono dim">Core services</span>
              <h2>What the mentorship can cover.</h2>
            </div>
            <div className="arrows">
              <button aria-label="Previous service" onClick={() => scroll(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
              <button aria-label="Next service" onClick={() => scroll(1)}><span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </div>

          <div className="track" ref={trackRef}>
            {services.map((s, i) => (
              <Link key={s.title} to="/get-started" className={`svc ${s.tone}`} onMouseMove={tilt} onMouseLeave={untilt}>
                <div className="top">
                  <div className="ico"><span className="material-symbols-outlined">{s.icon}</span></div>
                  <span className="mono">{s.tag}</span>
                </div>
                <div className="body">
                  <span className="mono kicker">Mentorship focus {String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <ul>{s.points.map(p => <li key={p}>{p}</li>)}</ul>
                  <div className="foot">
                    <svg width="36" height="12" viewBox="0 0 40 10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7L7 3L12 7L17 3L22 7L27 3L32 7L37 3" /></svg>
                    <span>Explore service <span className="material-symbols-outlined">arrow_outward</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="types">
            <div className="s-head">
              <div>
                <span className="mono">Choose your path</span>
                <h2>Mentorship by applicant type.</h2>
              </div>
            </div>
            <div className="type-grid">
              {applicantTypes.map(t => (
                <Link key={t.chip} to="/get-started" className="type">
                  <div>
                    <span className="chip mono">{t.chip}</span>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                  </div>
                  <span className="link">{t.cta} <Arrow /></span>
                </Link>
              ))}
            </div>
          </section>

          <section className="strip">
            <div>
              <span className="mono">Tailored mentorship</span>
              <h3>Not every student needs the same service.</h3>
              <p>Mentorship scope and pricing vary according to requirements. The first useful step is to understand the profile, target and stage.</p>
            </div>
            <Link className="pill" to="/get-started">Book a free call <Arrow dir="up-right" /></Link>
          </section>

          <section className="faqs">
            <div className="s-head">
              <div>
                <span className="mono">Common questions</span>
                <h2>Service FAQs.</h2>
              </div>
            </div>
            <div className="faq-list">
              {faqs.map(f => (
                <details key={f.q}>
                  <summary><span>{f.q}</span><span className="material-symbols-outlined">expand_more</span></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Services;
