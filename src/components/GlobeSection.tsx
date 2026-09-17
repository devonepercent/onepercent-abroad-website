import { useEffect, useRef, useState } from "react";
import { mountGlobe } from "@/lib/globe/globeEngine";
import { globeDark } from "@/lib/globe/themes";
import type { GlobeHandle, GlobePlace } from "@/lib/globe/types";

/* ──────────────────────────────────────────────────────────────────────────
   Where they land — the globe act.

   The stage is position:sticky inside a taller track, so the globe pins to
   the viewport and holds while you keep scrolling, then the next section
   (Testimonials, opaque #050505) rises over the top of it. That is the whole
   transition: no fixed layer, no scroll hijack.

   It deliberately does NOT live in Index's fixed background layers. Those sit
   under the scroll container, which covers the viewport at z-index 50 and
   swallows every pointer event — putting the globe there would silently kill
   dragging, tapping and keyboard access.
   ────────────────────────────────────────────────────────────────────────── */

/** Walk up to whatever is actually doing the scrolling. Index scrolls a fixed
 *  overflow container rather than the document, so `window.scrollY` is useless
 *  here; this keeps the component portable to either. */
function scrollParentOf(el: HTMLElement | null): HTMLElement | Window {
  let n = el?.parentElement || null;
  while (n) {
    const oy = getComputedStyle(n).overflowY;
    if ((oy === "auto" || oy === "scroll") && n.scrollHeight > n.clientHeight) return n;
    n = n.parentElement;
  }
  return window;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const GlobeSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef   = useRef<HTMLDivElement>(null);
  const globeRef   = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const copyRef    = useRef<HTMLDivElement>(null);
  const handleRef  = useRef<GlobeHandle | null>(null);

  const [places, setPlaces] = useState<GlobePlace[]>([]);
  const [hinted, setHinted] = useState(false);

  /* ---- engine ----------------------------------------------------------- */
  useEffect(() => {
    if (!globeRef.current || !canvasRef.current) return;
    const handle = mountGlobe({
      host: globeRef.current,
      canvas: canvasRef.current,
      theme: globeDark,
      assetBase: "/uni-logos/",
      onFirstDrag: () => setHinted(true),
    });
    handleRef.current = handle;
    setPlaces(handle.places);
    return () => { handle.destroy(); handleRef.current = null; };
  }, []);

  /* ---- scroll-linked entrance ------------------------------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    const globe   = globeRef.current;
    const copy    = copyRef.current;
    if (!section || !globe || !copy) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { globe.style.opacity = "1"; copy.style.opacity = "1"; return; }

    const scroller = scrollParentOf(section);
    const viewH = () => (scroller === window
      ? window.innerHeight
      : (scroller as HTMLElement).clientHeight);

    let ticking = false;
    const apply = () => {
      ticking = false;
      const vh = viewH();
      const top = section.getBoundingClientRect().top;

      /* 0 as the section's top edge touches the bottom of the viewport,
         1 once it has travelled ~70% of a screen up — so the globe has
         finished arriving by the time the stage pins. */
      const p = clamp01((vh - top) / (vh * 0.7));
      const e = 1 - Math.pow(1 - p, 3);          /* ease-out cubic */

      globe.style.opacity   = String(e);
      globe.style.transform = `translate3d(0, ${((1 - e) * 16).toFixed(2)}vh, 0) scale(${(0.88 + e * 0.12).toFixed(4)})`;

      /* copy leads the globe in slightly, so the section reads top-down */
      const ce = 1 - Math.pow(1 - clamp01(p * 1.35), 3);
      copy.style.opacity   = String(ce);
      copy.style.transform = `translate3d(0, ${((1 - ce) * 7).toFixed(2)}vh, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    apply();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const hot  = (name: string, on: boolean) => handleRef.current?.setHot(name, on);
  const goTo = (name: string) => handleRef.current?.flyToName(name);

  return (
    <section
      ref={sectionRef}
      id="destinations"
      style={{
        position: "relative",
        /* taller than the stage: the surplus is how long the globe stays
           pinned before Testimonials climbs over it */
        height: "205vh",
        background: "#040B2B",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .globe-chip{
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 14px; min-height:36px;
          background:rgba(97,162,254,0.06);
          border:1px solid rgba(97,162,254,0.16);
          border-radius:50px; color:rgba(255,255,255,0.72);
          font-size:13px; font-weight:500; font-family:'Outfit',sans-serif;
          cursor:pointer; transition:background .25s, border-color .25s, color .25s, transform .25s;
        }
        .globe-chip:hover{ background:rgba(97,162,254,0.14); border-color:rgba(97,162,254,0.4); color:#fff; transform:translateY(-2px); }
        .globe-chip:focus-visible{ outline:2px solid #61A2FE; outline-offset:3px; color:#fff; }
        .globe-chip i{ width:6px; height:6px; border-radius:50%; background:#61A2FE; flex:none; }
        .globe-chip.origin i{ background:#E9B94A; }
        .globe-stage-grid{ display:grid; grid-template-rows:auto 1fr auto; gap:clamp(14px,2.5vh,28px); height:100%; }
        @media (prefers-reduced-motion:reduce){ .globe-chip{ transition:none; } }
      ` }} />

      <div
        ref={stageRef}
        style={{
          position: "sticky", top: 0,
          height: "100vh",
          display: "flex", flexDirection: "column",
          /* The site nav is fixed and ~88px tall; the stage pins to top:0, so
             without this the eyebrow renders underneath it. */
          padding: "clamp(112px,14vh,164px) clamp(20px,5vw,60px) clamp(28px,5vh,56px)",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <div className="globe-stage-grid">
          {/* ---- copy ---- */}
          <div ref={copyRef} style={{ textAlign: "center", opacity: 0, willChange: "transform,opacity" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#61A2FE", opacity: 0.85, marginBottom: 14 }}>
              Master&apos;s · PhD · Undergraduate
            </div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond',serif",
              fontSize: "clamp(30px,4.6vw,60px)", fontWeight: 600,
              lineHeight: 1.08, margin: 0, letterSpacing: "-0.5px",
            }}>
              They start here. They <em style={{ fontStyle: "italic", color: "#61A2FE" }}>end up</em> everywhere.
            </h2>
          </div>

          {/* ---- globe ---- */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
            <div
              ref={globeRef}
              tabIndex={0}
              role="group"
              aria-label="Interactive globe of student destinations. Use the arrow keys to rotate it."
              className="globe-host"
              style={{
                position: "relative",
                width: "min(100%, 58vh)", aspectRatio: "1 / 1",
                maxHeight: "100%",
                opacity: 0, willChange: "transform,opacity",
                touchAction: "pan-y",
                cursor: "grab",
                outline: "none",
              }}
            >
              <canvas ref={canvasRef} aria-hidden="true" style={{ display: "block", width: "100%", height: "100%" }} />
            </div>
          </div>

          {/* ---- destinations ---- */}
          <div style={{ textAlign: "center" }}>
            <p className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>
              Choosing a destination turns the globe to face it.
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {places.map(p => (
                <li key={p.name}>
                  <button
                    type="button"
                    className={"globe-chip" + (p.origin ? " origin" : "")}
                    onPointerEnter={() => hot(p.name, true)}
                    onPointerLeave={() => hot(p.name, false)}
                    onFocus={() => hot(p.name, true)}
                    onBlur={() => hot(p.name, false)}
                    onClick={() => goTo(p.name)}
                  >
                    <i aria-hidden="true" />
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
            <p style={{
              margin: "14px 0 0", fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase",
              color: "rgba(255,255,255,0.34)",
              opacity: hinted ? 0 : 1, transition: "opacity .5s",
            }}>
              Drag the globe to rotate
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobeSection;
