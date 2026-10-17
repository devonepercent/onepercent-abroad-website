import { useEffect, useId, useRef, useState } from "react";
import { successStories } from "@/lib/erasmusData";

// Erasmus landing hero backdrop: a full-bleed square collage of admitted
// students whose tiles swap faces at random, plus the EU twelve-star ring
// that twinkles in star by star (ported from the hero.html prototype).

const PHOTOS = successStories.flatMap(s => (s.image ? [s.image] : []));
const EMPTY_RATIO = 0.4; // share of cells left as plain blue squares
const SWAP_EVERY = 1200; // ms between moves (one face leaves, another arrives)
const FADE = 700; // ms, must match the .erz-tile img transition
const INTRO_STAGGER = 120; // ms between tiles on the first reveal

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** img = index into PHOTOS, or -1 for an empty cell */
interface Tile { img: number; visible: boolean }

// Pick a photo that differs from the tile itself and its four neighbours.
const pickPhoto = (tiles: Tile[], i: number, cols: number) => {
  const near = new Set([i, i - 1, i + 1, i - cols, i + cols].filter(n => n >= 0 && n < tiles.length && (n === i || Math.abs((n % cols) - (i % cols)) <= 1)).map(n => tiles[n].img));
  const options = PHOTOS.map((_, k) => k).filter(k => !near.has(k));
  const pool = options.length ? options : PHOTOS.map((_, k) => k);
  return pool[Math.floor(Math.random() * pool.length)];
};

const buildGrid = (count: number, cols: number) => {
  const empties = new Set(Array.from({ length: count }, (_, k) => k).sort(() => Math.random() - 0.5).slice(0, Math.round(count * EMPTY_RATIO)));
  const tiles: Tile[] = [];
  for (let i = 0; i < count; i++) {
    tiles.push({ img: -1, visible: prefersReducedMotion() });
    if (!empties.has(i)) tiles[i].img = pickPhoto(tiles, i, cols);
  }
  return tiles;
};

const randomOf = (list: number[]) => list[Math.floor(Math.random() * list.length)];

export const PhotoCollage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(0);
  // Phones use fixed-size tiles that bleed off both edges; desktop stretches to fit.
  const [tilePx, setTilePx] = useState<number | null>(null);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;

  // Size the grid so square tiles cover the hero; phones get smaller tiles.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let size = "";
    let intro: number[] = [];
    const sync = () => {
      const phone = el.clientWidth < 768;
      const tile = phone ? 260 : 420;
      // Phones: an odd column count centred on screen, so the side columns are cut off evenly.
      const c = phone ? Math.ceil(el.clientWidth / tile) | 1 : Math.max(3, Math.round(el.clientWidth / tile));
      const r = Math.ceil(el.clientHeight / (phone ? tile : el.clientWidth / c));
      if (`${c}x${r}` === size) return;
      size = `${c}x${r}`;
      setCols(c);
      setTilePx(phone ? tile : null);
      setTiles(buildGrid(c * r, c));
      // Reveal the fresh grid tile by tile, in random order.
      if (prefersReducedMotion()) return;
      intro.forEach(window.clearTimeout);
      const order = Array.from({ length: c * r }, (_, k) => k).sort(() => Math.random() - 0.5);
      intro = order.map((k, n) => window.setTimeout(() => setTiles(cur => {
        if (!cur[k]) return cur;
        const next = cur.slice();
        next[k] = { ...next[k], visible: true };
        return next;
      }), 200 + n * INTRO_STAGGER));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => { ro.disconnect(); intro.forEach(window.clearTimeout); };
  }, []);

  // Each move: one face fades out to an empty cell while a new face fades
  // into a different empty cell, so photos wander around the grid. Paused off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el || !cols || PHOTOS.length < 2 || prefersReducedMotion()) return;
    let onScreen = true;
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    io.observe(el);
    const timers: number[] = [];
    const set = (i: number, fn: (tile: Tile, all: Tile[]) => Tile) => setTiles(cur => {
      if (!cur[i]) return cur;
      const next = cur.slice();
      next[i] = fn(cur[i], cur);
      return next;
    });
    const interval = window.setInterval(() => {
      if (!onScreen || document.hidden) return;
      const cur = tilesRef.current;
      const shown = cur.flatMap((t, k) => (t.img >= 0 && t.visible ? [k] : []));
      const empty = cur.flatMap((t, k) => (t.img < 0 ? [k] : []));
      if (!shown.length || !empty.length) return;
      const out = randomOf(shown);
      const into = randomOf(empty);
      set(out, t => ({ ...t, visible: false }));
      timers.push(window.setTimeout(() => set(out, () => ({ img: -1, visible: true })), FADE));
      set(into, (_, all) => ({ img: pickPhoto(all, into, cols), visible: false }));
      timers.push(window.setTimeout(() => set(into, t => ({ ...t, visible: true })), 60));
    }, SWAP_EVERY);
    return () => { window.clearInterval(interval); timers.forEach(window.clearTimeout); io.disconnect(); };
  }, [cols]);

  return <div ref={ref} className="erz-collage" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${cols || 1}, ${tilePx ? `${tilePx}px` : "1fr"})` }}>
    {tiles.map((t, i) => <span className={t.img < 0 ? "erz-tile is-empty" : "erz-tile"} key={i}>
      {t.img >= 0 && <img src={PHOTOS[t.img]} alt="" decoding="async" className={t.visible ? "is-in" : undefined} />}
    </span>)}
  </div>;
};

// ── EU star ring ──
const RING_R = 180;
const STAR_R = 30;
const STEP = 380; // ms between stars
const HOLD = 2200; // ms the full ring stays up
const RING_FADE = 600;

const starPoints = (r: number) => Array.from({ length: 10 }, (_, i) => {
  const rad = i % 2 === 0 ? r : r * 0.382;
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  return `${(rad * Math.cos(a)).toFixed(2)},${(rad * Math.sin(a)).toFixed(2)}`;
}).join(" ");

const STAR = starPoints(STAR_R);
const SPARKLE = (() => {
  const s = STAR_R * 1.4, d = STAR_R * 0.8;
  return `M0 ${-s} V${s} M${-s} 0 H${s} M${-d} ${-d} L${d} ${d} M${d} ${-d} L${-d} ${d}`;
})();
const POSITIONS = Array.from({ length: 12 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / 12;
  return [RING_R * Math.cos(a), RING_R * Math.sin(a)];
});

interface StarRingProps {
  /** ms between stars lighting up */
  step?: number;
  /** false = light the ring once and keep it lit (loading screen) */
  loop?: boolean;
  className?: string;
}

export const StarRing = ({ step = STEP, loop = true, className = "erz-ring" }: StarRingProps) => {
  // Number of stars lit this cycle; -1 = whole ring fading out.
  const [lit, setLit] = useState(() => (prefersReducedMotion() ? 12 : 0));
  const glowId = `erz-star-glow-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timers: number[] = [];
    const lead = loop ? 400 : 150;
    const cycle = () => {
      setLit(0);
      for (let i = 1; i <= 12; i++) timers.push(window.setTimeout(() => setLit(i), lead + (i - 1) * step));
      if (!loop) return;
      const appearEnd = lead + 12 * step + 1100;
      timers.push(window.setTimeout(() => setLit(-1), appearEnd + HOLD));
      timers.push(window.setTimeout(cycle, appearEnd + HOLD + RING_FADE));
    };
    cycle();
    return () => timers.forEach(window.clearTimeout);
  }, [step, loop]);

  return <svg className={className} viewBox="-240 -240 480 480" aria-hidden="true">
    <defs>
      <radialGradient id={glowId}>
        <stop offset="0%" stopColor="#fff3a8" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#ffcc00" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#ffcc00" stopOpacity="0" />
      </radialGradient>
    </defs>
    {POSITIONS.map(([x, y], i) => <g key={i} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)})`}>
      <g className={`erz-star${lit === -1 ? " hide" : i < lit ? " show" : ""}`}>
        <circle className="glow" r={STAR_R * 1.5} fill={`url(#${glowId})`} />
        <path className="sparkle" d={SPARKLE} />
        <polygon className="body" points={STAR} />
      </g>
    </g>)}
  </svg>;
};

// ── Loading screen ──
const LOADER_KEY = "erz_loader_seen";
const LOADER_MIN = 1700; // ms: the quick ring completes (~1.2s) and holds a beat
const LOADER_MAX = 3000; // ms: never hold the page longer than this
const LOADER_STEP = 85; // ms between stars on the loading screen

// EU-blue splash with the star ring filling in quickly. Waits for the hero
// photos (bounded by LOADER_MAX), then fades out. Shown once per browser session.
export const ErasmusLoader = () => {
  const [state, setState] = useState<"on" | "leaving" | "off">(() => {
    try { return sessionStorage.getItem(LOADER_KEY) ? "off" : "on"; } catch { return "on"; }
  });

  useEffect(() => {
    if (state !== "on") return;
    try { sessionStorage.setItem(LOADER_KEY, "1"); } catch { /* storage blocked: still show once */ }
    const started = Date.now();
    let done = false;
    const timers: number[] = [];
    const finish = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, LOADER_MIN - (Date.now() - started));
      timers.push(window.setTimeout(() => setState("leaving"), wait));
      timers.push(window.setTimeout(() => setState("off"), wait + 500));
    };
    Promise.all(PHOTOS.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = img.onerror = resolve;
      img.src = src;
    }))).then(finish);
    timers.push(window.setTimeout(finish, LOADER_MAX));
    return () => timers.forEach(window.clearTimeout);
  }, [state]);

  if (state === "off") return null;
  return <div className={state === "leaving" ? "erz-loader is-leaving" : "erz-loader"} role="status" aria-label="Loading">
    <StarRing step={LOADER_STEP} loop={false} className="erz-loader-ring" />
  </div>;
};
