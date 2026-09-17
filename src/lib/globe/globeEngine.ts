
import { LAND_PACKED, LAND_Q, LAND_RINGS } from "./landData";
import type { GlobeTheme, GlobeHandle, MountOpts } from "./types";

/* Ported verbatim from public/globe.html — the orthographic projection, the
   limb clipper and the badge spread layout are unchanged. Only the palette
   was lifted out into a theme object and the destination list handed to
   React. See that file for the full derivation comments. */
export function mountGlobe(opts: MountOpts): GlobeHandle {
  var host  = opts.host;
  var cv    = opts.canvas;
  var T     = opts.theme;
  var ctx   = cv.getContext("2d")!;
  var onFirstDrag = opts.onFirstDrag || function(){};
  var assetBase   = opts.assetBase || "/uni-logos/";

/* ==========================================================================
   GEOMETRY
   LAND is a delta-encoded ring list: rings split on ";", points split on
   " ", each point "dlon,dlat" in base-36 at 1/Q degree. The first LAND_N
   rings are land; anything after is a hole to punch back out (the Caspian).
   ========================================================================== */
var Q = LAND_Q, LAND_N = LAND_RINGS;
var LAND = LAND_PACKED;

var DEG = Math.PI/180;

/* Each ring is stored as unit-sphere vectors, precomputed once. Per frame we
   only rotate them, which is the whole reason this runs at 60fps. */
function buildRings(packed: string){
  var out: any[] = [], raw = packed.split(";");
  for (var r = 0; r < raw.length; r++){
    var pts = raw[r].split(" "), n = pts.length;
    var vx = new Float64Array(n), vy = new Float64Array(n), vz = new Float64Array(n);
    var ax = 0, ay = 0;
    for (var i = 0; i < n; i++){
      var c = pts[i].split(",");
      ax += parseInt(c[0], 36);
      ay += parseInt(c[1], 36);
      var lon = (ax/Q)*DEG, lat = (ay/Q)*DEG;
      var cl = Math.cos(lat);
      vx[i] = cl*Math.sin(lon);
      vy[i] = Math.sin(lat);
      vz[i] = cl*Math.cos(lon);
    }
    out.push({ x:vx, y:vy, z:vz, n:n });
  }
  return out;
}
var RINGS: any[] = buildRings(LAND);

function vec(lon: number, lat: number){
  var a = lon*DEG, b = lat*DEG, cb = Math.cos(b);
  return { x: cb*Math.sin(a), y: Math.sin(b), z: cb*Math.cos(a) };
}

/* ==========================================================================
   PLACES
   ========================================================================== */
var ORIGIN: any = { name:"India", city:"New Delhi", lon:77.21, lat:28.61, origin:true };
var DESTS: any[] = [
  { name:"United Kingdom", city:"London",    lon:  -0.13, lat: 51.51 },
  { name:"United States",  city:"Boston",    lon: -71.06, lat: 42.36 },
  { name:"Canada",         city:"Toronto",   lon: -79.38, lat: 43.65 },
  { name:"Ireland",        city:"Dublin",    lon:  -6.26, lat: 53.35 },
  { name:"Netherlands",    city:"Amsterdam", lon:   4.90, lat: 52.37 },
  { name:"Germany",        city:"Munich",    lon:  11.58, lat: 48.14 },
  { name:"Singapore",      city:"Singapore", lon: 103.82, lat:  1.35 },
  { name:"Australia",      city:"Melbourne", lon: 144.96, lat:-37.81 },
  { name:"New Zealand",    city:"Auckland",  lon: 174.76, lat:-36.85 }
];
var PLACES: any[] = [ORIGIN].concat(DESTS);
PLACES.forEach(function(p){ p.v = vec(p.lon, p.lat); });

/* ==========================================================================
   UNIVERSITIES
   Pinned to campus coordinates, not city centres — Harvard and MIT really are
   ~2km apart, which at globe scale is the same pixel. The spread layout below
   is what makes that survivable.

   Logo provenance (public/uni-logos/):
     harvard, mit, oxford, lse, nus, gt, erasmus  already in the repo
     stanford.svg   Wikimedia Commons, public domain (mark is trademarked)
     cambridge.svg  Wikimedia Commons, CC BY-SA 3.0 — carries an attribution
                    AND share-alike obligation. Replace with the university's
                    own asset if that is not acceptable for this page.
     melbourne.svg  PLACEHOLDER. Melbourne's arms are on Wikipedia under a
                    fair-use rationale only, which does not cover a commercial
                    site, so nothing was shipped. Overwrite the file to fix.
   ========================================================================== */
var UNIS: any[] = [
  { key:"harvard",   name:"Harvard",       lon: -71.117, lat: 42.377 },
  { key:"mit",       name:"MIT",           lon: -71.092, lat: 42.360 },
  { key:"stanford",  name:"Stanford",      lon:-122.170, lat: 37.428 },
  { key:"gt",        name:"Georgia Tech",  lon: -84.396, lat: 33.776 },
  { key:"oxford",    name:"Oxford",        lon:  -1.255, lat: 51.755 },
  { key:"cambridge", name:"Cambridge",     lon:   0.117, lat: 52.205 },
  { key:"lse",       name:"LSE",           lon:  -0.116, lat: 51.514 },
  /* Erasmus+ is an EU mobility programme, not a campus. Pinned to Brussels. */
  { key:"erasmus",   name:"Erasmus+",      lon:   4.352, lat: 50.847 },
  { key:"nus",       name:"NUS",           lon: 103.776, lat:  1.296 },
  { key:"melbourne", name:"Melbourne",     lon: 144.961, lat:-37.797 }
];
UNIS.forEach(function(u){
  u.v = vec(u.lon, u.lat);
  u.bx = null; u.by = null;          /* persistent badge position           */
  u.grow = 0;                        /* hover easing                        */
});

/* Rasterise each logo once into an offscreen canvas. drawImage() on an SVG
   re-rasterises it every single call, which is far too slow to do ten times
   a frame; blitting a pre-rendered bitmap is effectively free.

   Monochrome is done by mapping luminance to alpha rather than flattening
   every fill to one colour. Most of these logos are a coloured mark sitting
   on a near-white disc, so dark-becomes-opaque drops the disc out cleanly
   and keeps the mark's internal detail — a flat fill would fuse a seal's
   lettering into its shield. It also handles LSE, which is the other way
   round (white letters on a red disc): the disc goes solid blue and the
   letters knock through to the white badge underneath. */
var LOGO_PX = 192;
var MONO = T.logoInk;

function monochrome(g: CanvasRenderingContext2D){
  var d;
  try {
    d = g.getImageData(0, 0, LOGO_PX, LOGO_PX);
  } catch (err){
    /* Tainted canvas. Happens only when the page is opened straight off
       disk over file://, where every file is its own opaque origin. Served
       over http the read succeeds; falling back to full colour keeps the
       local-file case working rather than blanking the badges. */
    return false;
  }
  var px = d.data;
  for (var i = 0; i < px.length; i += 4){
    var a = px[i+3];
    if (!a) continue;
    var lum = (px[i]*0.2126 + px[i+1]*0.7152 + px[i+2]*0.0722)/255;
    var t = 1 - lum;
    t = t < 0.08 ? 0 : (t - 0.08)/0.92;   /* drop the near-white ground   */
    t = Math.min(1, Math.pow(t, 0.8)*1.12); /* keep thin strokes solid    */
    px[i] = MONO[0]; px[i+1] = MONO[1]; px[i+2] = MONO[2];
    px[i+3] = a*t;
  }
  g.putImageData(d, 0, 0);
  return true;
}

UNIS.forEach(function(u){
  var im = new Image();
  im.onload = function(){
    var c = document.createElement("canvas");
    c.width = c.height = LOGO_PX;
    var g = c.getContext("2d");
    /* contain-fit: coats of arms are tall, seals are square */
    var iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
    if (!iw || !ih) return;
    var s = Math.min(LOGO_PX/iw, LOGO_PX/ih);
    var w = iw*s, h = ih*s;
    g.drawImage(im, (LOGO_PX-w)/2, (LOGO_PX-h)/2, w, h);
    monochrome(g);
    u.logo = c;
  };
  im.src = assetBase + u.key + ".svg";
});

/* Great-circle arc from origin to each destination, sampled once and lifted
   off the surface. Height scales with angular distance so a hop to Europe
   does not balloon the same as one to New Zealand.                          */
var ARC_STEPS = 64;
var ARCS: any[] = DESTS.map(function(d, i){
  var a = ORIGIN.v, b = d.v;
  var dot = Math.max(-1, Math.min(1, a.x*b.x + a.y*b.y + a.z*b.z));
  var om = Math.acos(dot), so = Math.sin(om);
  /* Lift scales with angular distance so a hop to Europe does not balloon
     like one to New Zealand, but stays modest — arcs that stand too far off
     the surface stop reading as travel and start reading as loose wire. */
  var lift = 0.07 + 0.11*(om/Math.PI);
  var x = new Float64Array(ARC_STEPS+1), y = new Float64Array(ARC_STEPS+1), z = new Float64Array(ARC_STEPS+1);
  for (var s = 0; s <= ARC_STEPS; s++){
    var t = s/ARC_STEPS, px, py, pz;
    if (so < 1e-6){ px = a.x; py = a.y; pz = a.z; }
    else {
      var c1 = Math.sin((1-t)*om)/so, c2 = Math.sin(t*om)/so;
      px = a.x*c1 + b.x*c2; py = a.y*c1 + b.y*c2; pz = a.z*c1 + b.z*c2;
    }
    var r = 1 + lift*Math.sin(Math.PI*t);
    x[s] = px*r; y[s] = py*r; z[s] = pz*r;
  }
  return { x:x, y:y, z:z, dest:d, phase: i/DESTS.length };
});

/* ==========================================================================
   VIEW STATE
   ========================================================================== */
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var yaw = -95*DEG;        /* start with India / Europe facing the viewer */
var pitch = 18*DEG;
var spin = reduce ? 0 : 0.055;   /* radians per second */
var vYaw = 0, vPitch = 0;        /* drag inertia */
var dragging = false, dragged = false, lastX = 0, lastY = 0, lastT = 0;
var flying: any = null;               /* active flyTo tween, or null */
 var running = true, rafId = null; /* render-loop gate, see IntersectionObserver */

var W = 0, H = 0, CX = 0, CY = 0, R = 0, dpr = 1;

function resize(){
  /* clientWidth/Height, NOT getBoundingClientRect(): the section animates the
     host in with a CSS scale() on entry, and a bounding rect reports the
     transformed box. Sizing the backing store from that bakes the entrance
     scale into the canvas resolution and it never recovers. */
  var w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = w; H = h;
  cv.width  = Math.round(W*dpr);
  cv.height = Math.round(H*dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  CX = W/2; CY = H/2;
  R  = Math.min(W, H)/2 - Math.max(14, W*0.055);   /* room for arcs + labels */
}

/* Rotation is yaw about the polar axis then pitch toward the viewer.
   Returns screen coords via the module-level SX/SY/SZ scratch. */
var cosY = 1, sinY = 0, cosP = 1, sinP = 0;
function setRotation(){
  cosY = Math.cos(yaw);  sinY = Math.sin(yaw);
  cosP = Math.cos(pitch); sinP = Math.sin(pitch);
}
var _x = 0, _y = 0, _z = 0;
function rot(x: number, y: number, z: number){
  var X =  x*cosY + z*sinY;
  var Z = -x*sinY + z*cosY;
  _x = X;
  _y = y*cosP - Z*sinP;
  _z = y*sinP + Z*cosP;
}

/* ==========================================================================
   LAND CLIPPING
   A ring crossing the horizon has to be closed along the limb, or every
   continent on the edge bleeds into a straight chord. On each crossing we
   solve for the exact point where the great-circle edge hits z=0 — linear
   interpolation between two unit vectors stays in their common plane, so
   normalising the result lands precisely on the sphere — then walk the limb
   arc to the re-entry point. Rings were normalised to one winding at build
   time, so the arc always sweeps the same direction.
   ========================================================================== */
function crossing(ax: number, ay: number, az: number, bx: number, by: number, bz: number){
  var t = az/(az - bz);
  var x = ax + (bx-ax)*t, y = ay + (by-ay)*t, z = az + (bz-az)*t;
  var m = Math.sqrt(x*x + y*y + z*z) || 1;
  return { x:x/m, y:y/m, z:z/m };
}

var RX = new Float64Array(4096), RY = new Float64Array(4096), RZ = new Float64Array(4096);

/* Segment pool, reused across frames so the hot loop does not allocate. */
var SEGS: any[] = [], SEG_USED: boolean[] = [];
function seg(i: number){
  if (!SEGS[i]) SEGS[i] = { entry:0, exit:0, pts:[], n:0 };
  SEGS[i].n = 0;
  return SEGS[i];
}
function push(s: any, px: number, py: number){ s.pts[s.n++] = px; s.pts[s.n++] = py; }

var TWO_PI = Math.PI*2;

function pathRing(ring: any){
  var n = ring.n, x = ring.x, y = ring.y, z = ring.z, i;
  var anyVis = false, allVis = true;

  for (i = 0; i < n; i++){
    rot(x[i], y[i], z[i]);
    RX[i] = _x; RY[i] = _y; RZ[i] = _z;
    if (_z > 0) anyVis = true; else allVis = false;
  }
  if (!anyVis) return false;

  if (allVis){
    ctx.moveTo(CX + R*RX[0], CY - R*RY[0]);
    for (i = 1; i < n; i++) ctx.lineTo(CX + R*RX[i], CY - R*RY[i]);
    ctx.closePath();
    return true;
  }

  /* Start at a point that has just become visible, so the walk always opens
     on the limb rather than mid-continent. The point before `start` is by
     definition hidden, so every segment opened during the walk also closes
     during it — no wrap-around case to special-case. */
  var start = -1;
  for (i = 0; i < n; i++){
    if (RZ[i] > 0 && RZ[(i-1+n)%n] <= 0){ start = i; break; }
  }
  if (start === -1) return false;

  var m = 0, cur = null;
  for (var k = 0; k < n; k++){
    var idx  = (start + k) % n;
    var prev = (idx - 1 + n) % n;

    if (RZ[idx] > 0){
      if (cur === null){
        var e = crossing(RX[prev], RY[prev], RZ[prev], RX[idx], RY[idx], RZ[idx]);
        cur = seg(m);
        cur.entry = Math.atan2(-e.y, e.x);
        push(cur, CX + R*e.x, CY - R*e.y);
      }
      push(cur, CX + R*RX[idx], CY - R*RY[idx]);
    } else if (cur !== null){
      var xp = crossing(RX[prev], RY[prev], RZ[prev], RX[idx], RY[idx], RZ[idx]);
      push(cur, CX + R*xp.x, CY - R*xp.y);
      cur.exit = Math.atan2(-xp.y, xp.x);
      cur = null; m++;
    }
  }
  if (!m) return false;

  /* Stitch. Exteriors are counter-clockwise on screen (measured: every
     fully-visible ring has negative shoelace area), which in canvas angle
     terms is the decreasing-angle direction — hence anticlockwise below.

     The join must be to whichever entry comes next going that way around
     the limb, NOT the next segment in ring order. Antarctica and the
     Americas each split into two visible segments here, and walking them in
     ring order sweeps an arc right past the other segment and around the
     whole disc, which under nonzero fill inverts land and ocean.          */
  for (i = 0; i < m; i++) SEG_USED[i] = false;

  for (var s0 = 0; s0 < m; s0++){
    if (SEG_USED[s0]) continue;
    var s = s0;
    ctx.moveTo(SEGS[s0].pts[0], SEGS[s0].pts[1]);

    for (var guard = 0; guard <= m; guard++){
      var sg = SEGS[s];
      SEG_USED[s] = true;
      for (var q = 2; q < sg.n; q += 2) ctx.lineTo(sg.pts[q], sg.pts[q+1]);

      var best = -1, bestD = Infinity;
      for (var t = 0; t < m; t++){
        var d = sg.exit - SEGS[t].entry;
        d = ((d % TWO_PI) + TWO_PI) % TWO_PI;
        if (d < bestD){ bestD = d; best = t; }
      }
      ctx.arc(CX, CY, R, sg.exit, SEGS[best].entry, true);

      if (best === s0 || SEG_USED[best]) break;
      s = best;
    }
    ctx.closePath();
  }
  return true;
}

/* ==========================================================================
   GRATICULE — 30 degree mesh. Cheap, and it is what actually sells the
   rotation: without it a filled sphere reads as a flat disc with moving
   shapes on it.
   ========================================================================== */
function graticule(){
  ctx.beginPath();
  var lon, lat, first, i;
  for (lon = -180; lon < 180; lon += 30){
    first = true;
    for (lat = -90; lat <= 90; lat += 4){
      var v = vec(lon, lat); rot(v.x, v.y, v.z);
      if (_z <= 0){ first = true; continue; }
      var sx = CX + R*_x, sy = CY - R*_y;
      if (first){ ctx.moveTo(sx, sy); first = false; } else ctx.lineTo(sx, sy);
    }
  }
  for (lat = -60; lat <= 60; lat += 30){
    first = true;
    for (lon = -180; lon <= 180; lon += 4){
      var w = vec(lon, lat); rot(w.x, w.y, w.z);
      if (_z <= 0){ first = true; continue; }
      var gx = CX + R*_x, gy = CY - R*_y;
      if (first){ ctx.moveTo(gx, gy); first = false; } else ctx.lineTo(gx, gy);
    }
  }
  ctx.stroke();
}

/* ==========================================================================
   DRAW
   ========================================================================== */
var t0 = performance.now();

function draw(now: number){
  var dt = Math.min((now - t0)/1000, 0.05);
  t0 = now;

  if (flying && !dragging){
    /* An in-flight tween owns the rotation outright: no idle spin, no
       inertia, so clicking a destination lands on it instead of drifting
       past. A drag cancels it (see pointerdown).                          */
    flying.t = Math.min(1, flying.t + dt*1.6);
    var e = 1 - Math.pow(1 - flying.t, 3);
    yaw   = flying.fromYaw   + flying.dYaw*e;
    pitch = flying.fromPitch + flying.dPitch*e;
    if (flying.t >= 1) flying = null;
  } else if (!dragging){
    yaw   += (spin + vYaw)*dt;
    pitch += vPitch*dt;
    vYaw   *= Math.pow(0.0016, dt);      /* frame-rate independent decay */
    vPitch *= Math.pow(0.0016, dt);
  }
  pitch = Math.max(-72*DEG, Math.min(72*DEG, pitch));
  setRotation();

  ctx.clearRect(0, 0, W, H);

  /* --- Ground shadow. Sits under the sphere so it lifts off the paper. --- */
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(CX, CY + R*0.99, R*0.80, R*0.10, 0, 0, Math.PI*2);
  var sh = ctx.createRadialGradient(CX, CY + R*0.99, 0, CX, CY + R*0.99, R*0.80);
  sh.addColorStop(0, T.groundShadow);
  sh.addColorStop(1, T.groundShadowFade);
  ctx.fillStyle = sh;
  ctx.fill();
  ctx.restore();

  /* --- The sphere --------------------------------------------------------- */
  ctx.save();
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI*2);
  ctx.clip();

  ctx.fillStyle = T.ocean;
  ctx.fillRect(CX - R, CY - R, R*2, R*2);

  /* graticule under the land, so continents stay solid */
  ctx.strokeStyle = T.graticule;
  ctx.lineWidth = 1;
  graticule();

  /* land */
  ctx.beginPath();
  for (var r = 0; r < LAND_N; r++) pathRing(RINGS[r]);
  ctx.fillStyle = T.land;
  ctx.fill();

  /* holes punched back out to ocean */
  if (RINGS.length > LAND_N){
    ctx.beginPath();
    for (var h = LAND_N; h < RINGS.length; h++) pathRing(RINGS[h]);
    ctx.fillStyle = T.ocean;
    ctx.fill();
  }

  /* Lighting last, multiplied over land and ocean together so both curve
     with the same light. Shading each separately reads as two flat layers. */
  var lg = ctx.createRadialGradient(
    CX - R*0.42, CY - R*0.44, R*0.05,
    CX - R*0.10, CY - R*0.10, R*1.52
  );
  lg.addColorStop(0,   T.shade[0]);
  lg.addColorStop(.55, T.shade[1]);
  lg.addColorStop(1,   T.shade[2]);
  ctx.globalCompositeOperation = T.shadeMode;
  ctx.fillStyle = lg;
  ctx.fillRect(CX - R, CY - R, R*2, R*2);
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();

  /* rim */
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI*2);
  ctx.strokeStyle = T.rim;
  ctx.lineWidth = 1;
  ctx.stroke();

  drawArcs(now);
  drawPlaces();
  drawBadges(dt);

  rafId = running ? requestAnimationFrame(draw) : null;
}

/* ==========================================================================
   UNIVERSITY BADGES
   Badges are laid out by relaxation rather than drawn at the pin: a spring
   pulls each one toward its own location while badges repel each other, and
   a leader line keeps the true position honest. Four of these ten sit within
   a couple of degrees of each other (Oxford / Cambridge / LSE / Brussels,
   and Harvard on top of MIT), so pinning them directly would stack five
   discs on one pixel.

   State persists across frames and is only nudged a little each frame, so
   the arrangement slides smoothly as the globe turns instead of popping.
   ========================================================================== */
var VIS: any[] = [];

/* Badge radius is shared by the layout and the hover hit-test; they must not
   be allowed to drift apart. */
function badgeR(){ return Math.max(18, R*0.115); }

/* How many badges the sphere can carry before they stop being legible and
   start being a pile. On a 335px phone globe eight discs crowd off the limb
   into empty paper; showing the most face-on few and letting rotation reveal
   the rest is the honest trade. */
function badgeBudget(){ return R < 165 ? 4 : R < 235 ? 6 : 10; }

function drawBadges(dt: number){
  var br = badgeR();
  var minD = br*2 + 6;
  var i, a, b, u;

  VIS.length = 0;
  for (i = 0; i < UNIS.length; i++){
    u = UNIS[i];
    rot(u.v.x, u.v.y, u.v.z);
    if (_z <= 0.06){
      u.bx = null; u.hover = u.pinned = false; u.grow = 0;  /* re-enters at its pin */
      continue;
    }
    u.px = CX + R*_x; u.py = CY - R*_y; u.zz = _z;
    u.alpha = Math.min(1, (_z - 0.06)*6);
    if (u.bx === null){ u.bx = u.px; u.by = u.py - br*1.5; }
    VIS.push(u);
  }

  /* Keep the most face-on, plus anything the user is actively holding open.
     VIS is also what the hit-test reads, so dropped badges stop being
     clickable at the same moment they stop being drawn. */
  var budget = badgeBudget();
  if (VIS.length > budget){
    VIS.sort(function(x, y){
      if (x.on !== y.on) return x.on ? -1 : 1;
      return y.zz - x.zz;
    });
    VIS.length = budget;
  }

  for (a = 0; a < VIS.length; a++){
    u = VIS[a];
    u.bx += (u.px - u.bx)*0.12;
    u.by += (u.py - br*1.5 - u.by)*0.12;
  }
  for (var it = 0; it < 5; it++){
    for (a = 0; a < VIS.length; a++){
      var A = VIS[a];
      for (b = a+1; b < VIS.length; b++){
        var B = VIS[b];
        var dx = B.bx - A.bx, dy = B.by - A.by;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < 0.01){ dx = 0.6; dy = -1; d = 1.166; }
        if (d < minD){
          var k = ((minD - d)/2)/d;
          A.bx -= dx*k; A.by -= dy*k;
          B.bx += dx*k; B.by += dy*k;
        }
      }
    }
  }
  for (a = 0; a < VIS.length; a++){
    u = VIS[a];
    u.bx = Math.max(br+2, Math.min(W - br - 2, u.bx));
    u.by = Math.max(br+2, Math.min(H - br - 2, u.by));
    u.on = u.hover || u.pinned;
    u.grow += ((u.on ? 1 : 0) - u.grow)*Math.min(1, dt*12);
  }

  /* leaders first, so every disc sits on top of every line */
  for (a = 0; a < VIS.length; a++){
    u = VIS[a];
    ctx.globalAlpha = u.alpha*(u.on ? 0.9 : 0.5);
    ctx.beginPath();
    ctx.moveTo(u.px, u.py);
    ctx.lineTo(u.bx, u.by);
    ctx.strokeStyle = T.leader;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(u.px, u.py, 2.6, 0, Math.PI*2);
    ctx.fillStyle = T.leaderDot;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  for (a = 0; a < VIS.length; a++){
    u = VIS[a];
    var r = br*(1 + u.grow*0.16);
    ctx.globalAlpha = u.alpha;

    ctx.save();
    ctx.shadowColor = T.badgeShadow;
    ctx.shadowBlur = 10 + u.grow*6;
    ctx.shadowOffsetY = 2;
    ctx.beginPath();
    ctx.arc(u.bx, u.by, r, 0, Math.PI*2);
    ctx.fillStyle = T.badge;
    ctx.fill();
    ctx.restore();

    if (u.logo){
      /* Fit inside the circle's INSCRIBED square (side r*sqrt2), not a square
         the circle is inscribed in. The latter slices the corners off every
         seal and the top and bottom off every tall coat of arms. */
      var s = r*1.40;
      ctx.drawImage(u.logo, u.bx - s/2, u.by - s/2, s, s);
    }

    ctx.beginPath();
    ctx.arc(u.bx, u.by, r, 0, Math.PI*2);
    ctx.strokeStyle = u.on ? T.badgeRingOn : T.badgeRing;
    ctx.lineWidth = u.on ? 1.6 : 1;
    ctx.stroke();

    if (u.grow > 0.02){
      ctx.globalAlpha = u.alpha*u.grow;
      ctx.font = T.font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var tw = ctx.measureText(u.name).width;
      var ty = u.by + r + 12;
      ctx.fillStyle = T.chip;
      ctx.fillRect(u.bx - tw/2 - 5, ty - 9, tw + 10, 18);
      ctx.fillStyle = T.chipInk;
      ctx.fillText(u.name, u.bx, ty);
      ctx.textAlign = "left";
    }
    ctx.globalAlpha = 1;
  }
}

/* A lifted arc point is hidden only when it is behind the sphere AND inside
   the silhouette — the parts that rise clear of the limb stay visible. */
function occluded(x: number, y: number, z: number){ return z < 0 && (x*x + y*y) < 1; }

function drawArcs(now: number){
  var tt = reduce ? 0.5 : (now/2600);
  for (var a = 0; a < ARCS.length; a++){
    var arc = ARCS[a];
    var hot = arc.dest.hot ? 1 : 0;

    /* full path, faint */
    ctx.beginPath();
    var pen = false, i;
    for (i = 0; i <= ARC_STEPS; i++){
      rot(arc.x[i], arc.y[i], arc.z[i]);
      if (occluded(_x, _y, _z)){ pen = false; continue; }
      var sx = CX + R*_x, sy = CY - R*_y;
      if (!pen){ ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
    }
    ctx.strokeStyle = hot ? T.arcHot : T.arc;
    ctx.lineWidth = hot ? 1.8 : 1.2;
    ctx.stroke();

    /* travelling head */
    if (!reduce){
      var head = ((tt + arc.phase) % 1);
      var tail = Math.max(0, head - 0.22);
      var i0 = Math.floor(tail*ARC_STEPS), i1 = Math.ceil(head*ARC_STEPS);
      ctx.beginPath();
      pen = false;
      for (i = i0; i <= i1; i++){
        rot(arc.x[i], arc.y[i], arc.z[i]);
        if (occluded(_x, _y, _z)){ pen = false; continue; }
        var hx = CX + R*_x, hy = CY - R*_y;
        if (!pen){ ctx.moveTo(hx, hy); pen = true; } else ctx.lineTo(hx, hy);
      }
      ctx.strokeStyle = hot ? T.arcHeadHot : T.arcHead;
      ctx.lineWidth = hot ? 2.6 : 1.9;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }
}

var LBL: any[] = [], PLACED: number[] = [];

function drawPlaces(){
  LBL.length = 0;

  for (var i = 0; i < PLACES.length; i++){
    var p = PLACES[i];
    rot(p.v.x, p.v.y, p.v.z);
    if (_z <= 0.02) continue;

    var sx = CX + R*_x, sy = CY - R*_y;
    var fade = Math.min(1, _z*4.5);          /* soften into the limb */
    var isO  = p.origin;

    ctx.globalAlpha = fade;
    ctx.beginPath();
    ctx.arc(sx, sy, isO ? 5 : 3.6, 0, Math.PI*2);
    ctx.fillStyle = isO ? T.origin : (p.hot ? T.markerHot : T.marker);
    ctx.fill();
    /* Gold on the white ocean is only 1.83:1. A white ring made that
       worse; an ink ring carries the marker on both grounds. */
    ctx.strokeStyle = isO ? T.originRing : T.markerRing;
    ctx.lineWidth = 1.4;
    ctx.stroke();

    if (p.hot || isO){
      ctx.beginPath();
      ctx.arc(sx, sy, isO ? 10 : 9, 0, Math.PI*2);
      ctx.strokeStyle = isO ? T.originHalo : T.markerHalo;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    /* Country names now defer to the university badges, which identify the
       same regions and would otherwise be labelled twice over. India stays
       (it anchors every arc) and a hovered country labels on demand.      */
    if (_z > 0.42 && (isO || p.hot)) LBL.push({ p:p, sx:sx, sy:sy, z:_z, fade:fade });
  }

  /* Western Europe puts four markers within a few degrees of each other, so
     labels have to be culled or they render as a stack of overlapping
     boxes. Most face-on wins, and a hovered place always wins.            */
  LBL.sort(function(a, b){
    if (a.p.hot !== b.p.hot) return a.p.hot ? -1 : 1;
    return b.z - a.z;
  });

  PLACED.length = 0;
  ctx.font = T.font;
  ctx.textBaseline = "middle";

  for (var k = 0; k < LBL.length; k++){
    var L = LBL[k], w = ctx.measureText(L.p.name).width;
    var lx = L.sx + (L.sx > CX ? -(w + 12) : 12);
    var bx = lx - 4, by = L.sy - 9, bw = w + 8, bh = 18;

    var clash = false;
    for (var j = 0; j < PLACED.length; j += 4){
      if (bx < PLACED[j] + PLACED[j+2] && bx + bw > PLACED[j] &&
          by < PLACED[j+1] + PLACED[j+3] && by + bh > PLACED[j+1]){ clash = true; break; }
    }
    if (clash && !L.p.hot && !L.p.origin) continue;
    PLACED.push(bx, by, bw, bh);

    ctx.globalAlpha = L.fade*Math.min(1, (L.z - 0.42)*4);
    ctx.fillStyle = T.chip;
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = L.p.origin ? T.labelInkOrigin : T.labelInk;
    ctx.fillText(L.p.name, lx, L.sy);
    ctx.globalAlpha = 1;
  }
}

/* ==========================================================================
   INTERACTION
   ========================================================================== */
/* Hit-test the laid-out badge positions, not the pins — the spread layout
   moves badges well away from the coordinate they point at. */
function badgeAt(clientX: number, clientY: number){
  var rect = cv.getBoundingClientRect();
  var mx = clientX - rect.left, my = clientY - rect.top;
  var br = badgeR(), best = null, bd = br*br;
  for (var i = 0; i < VIS.length; i++){
    var u = VIS[i], dx = mx - u.bx, dy = my - u.by;
    var d = dx*dx + dy*dy;
    if (d < bd){ bd = d; best = u; }
  }
  return best;
}

var downX = 0, downY = 0;

host.addEventListener("pointerdown", function(e){
  dragging = true;
  host.classList.add("dragging");
  try { host.setPointerCapture(e.pointerId); } catch(_){}
  lastX = downX = e.clientX; lastY = downY = e.clientY; lastT = performance.now();
  vYaw = vPitch = 0;
  flying = null;                 /* grabbing the globe cancels any tween */
});

host.addEventListener("pointermove", function(e){
  if (!dragging){
    if (e.pointerType === "touch") return;   /* touch identifies by tapping */
    var best = badgeAt(e.clientX, e.clientY);
    for (var i = 0; i < UNIS.length; i++) UNIS[i].hover = (UNIS[i] === best);
    host.style.cursor = best ? "pointer" : "";
    return;
  }
  var now = performance.now();
  var dx = e.clientX - lastX, dy = e.clientY - lastY;
  var dt = Math.max(now - lastT, 1)/1000;

  /* Scale by radius so the drag tracks the pointer at any globe size. */
  var k = 1.8/Math.max(R, 1);
  yaw   += dx*k;
  pitch += dy*k;
  vYaw   = (dx*k)/dt*0.16;
  vPitch = (dy*k)/dt*0.16;

  lastX = e.clientX; lastY = e.clientY; lastT = now;
  if (!dragged){ dragged = true; onFirstDrag(); }
});

function endDrag(e: any){
  if (!dragging) return;
  dragging = false;
  host.classList.remove("dragging");
  try { host.releasePointerCapture(e.pointerId); } catch(_){}

  /* A press that never really moved is a tap, not a drag. Tapping a badge
     pins its name open — without this a touch user can never find out which
     university a logo belongs to, since there is no hover on touch. */
  var moved = Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY);
  if (moved < 6){
    var hit = badgeAt(e.clientX, e.clientY);
    for (var i = 0; i < UNIS.length; i++){
      UNIS[i].pinned = (UNIS[i] === hit) ? !UNIS[i].pinned : false;
    }
  }
}
host.addEventListener("pointerup", endDrag);
host.addEventListener("pointercancel", endDrag);
/* Keyboard rotation. Without this the globe is inert to anyone not using a
   pointer, and the destination list is the only way in. */
host.addEventListener("keydown", function(e){
  var step = 10*DEG, k = e.key;
  if      (k === "ArrowLeft")  yaw   -= step;
  else if (k === "ArrowRight") yaw   += step;
  else if (k === "ArrowUp")    pitch -= step;
  else if (k === "ArrowDown")  pitch += step;
  else return;
  e.preventDefault();                  /* do not scroll the page as well */
  flying = null; vYaw = vPitch = 0;
  onFirstDrag();
});

host.addEventListener("pointerleave", function(){
  for (var i = 0; i < UNIS.length; i++) UNIS[i].hover = false;
  host.style.cursor = "";
});

/* ---- Destination list: hover highlights, click spins it to the front ----- */
/* Ease the view round to a place, then hand control back to the idle spin. */
function flyTo(p: any){
  var targetYaw = -p.lon*DEG;
  var targetPitch = Math.max(-72*DEG, Math.min(72*DEG, p.lat*DEG*0.75));
  /* take the short way round */
  var d = targetYaw - yaw;
  while (d >  Math.PI) d -= Math.PI*2;
  while (d < -Math.PI) d += Math.PI*2;
  flying = { fromYaw:yaw, dYaw:d, fromPitch:pitch, dPitch:targetPitch - pitch, t:0 };
  vYaw = vPitch = 0;
}

var cleanups: Array<() => void> = [];
window.addEventListener("resize", resize);
cleanups.push(function(){ window.removeEventListener("resize", resize); });
/* window.resize alone misses the case that actually matters once this is a
   section inside the app rather than its own page: the container changing
   width while the window does not. */
if ("ResizeObserver" in window){
  var ro = new ResizeObserver(resize); ro.observe(host);
  cleanups.push(function(){ ro.disconnect(); });
}

resize();

/* Only render while the globe is actually on screen. This loop reprojects
   ~4,700 points and repaints the whole canvas every frame; leaving it
   running while the section is scrolled away is pure battery burn on a long
   marketing page. Browsers already park rAF for background tabs, but not
   for content scrolled out of view. */
if ("IntersectionObserver" in window){
  var io = new IntersectionObserver(function(entries){
    var onScreen = entries[0].isIntersecting;
    if (onScreen === running) return;
    running = onScreen;
    if (running){ t0 = performance.now(); rafId = requestAnimationFrame(draw); }
    else if (rafId){ cancelAnimationFrame(rafId); rafId = null; }
  }, { rootMargin: "150px" });
  io.observe(host);
  cleanups.push(function(){ io.disconnect(); });
}

rafId = requestAnimationFrame(function(n){ t0 = n; draw(n); });

/* ---- handle handed back to React ---------------------------------------- */
function byName(name: string){
  for (var i = 0; i < PLACES.length; i++) if (PLACES[i].name === name) return PLACES[i];
  return null;
}
return {
  setHot: function(name, on){ var p = byName(name); if (p) p.hot = on; },
  flyToName: function(name){ var p = byName(name); if (p) flyTo(p); },
  places: PLACES.map(function(p){ return { name: p.name, city: p.city, origin: !!p.origin }; }),
  destroy: function(){
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    cleanups.forEach(function(fn){ fn(); });
  }
};
}
