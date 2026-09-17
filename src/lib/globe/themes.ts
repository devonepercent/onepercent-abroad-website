import type { GlobeTheme } from "./types";

/* Dark theme, tuned to the Index page: ground #040B2B, accent #61A2FE,
   primary #065DC7.

   The sphere is a shade lighter than the page so it reads as an object
   sitting on the background rather than a hole cut out of it, and the
   lighting switches from multiply to source-over — multiplying a warm shadow
   over navy just crushes it to black, so instead a cool shadow is painted
   over the far side and the near limb is left bright. */
export const globeDark: GlobeTheme = {
  ocean:      "#0A1547",
  land:       "#61A2FE",
  graticule:  "rgba(151,190,255,.16)",
  rim:        "rgba(97,162,254,.38)",

  shade:      ["rgba(150,190,255,.16)", "rgba(4,11,43,.20)", "rgba(2,5,22,.86)"],
  shadeMode:  "source-over",
  /* No contact shadow on a dark ground. A dark ellipse is invisible and a
     bright one detaches into a smudge under the sphere; the rim and the
     terminator already do the lifting. */
  groundShadow:     "rgba(0,0,0,0)",
  groundShadowFade: "rgba(0,0,0,0)",

  arc:        "rgba(97,162,254,.34)",
  arcHot:     "rgba(151,190,255,.85)",
  arcHead:    "rgba(151,190,255,.85)",
  arcHeadHot: "rgba(255,255,255,.95)",

  marker:     "#9BC4FF",
  markerHot:  "#FFFFFF",
  markerRing: "rgba(4,11,43,.85)",
  markerHalo: "rgba(155,196,255,.5)",
  origin:     "#E9B94A",
  originRing: "rgba(4,11,43,.9)",
  originHalo: "rgba(233,185,74,.75)",

  /* Light discs, not dark ones. A dark badge on a dark page reads as a hole
     punched in the globe, and a pale logo inside it never gets enough
     contrast at 45px. Inverting gives the marks a white ground to sit on —
     the same figure/ground relationship as the light theme. */
  badge:       "rgba(236,243,255,.96)",
  badgeRing:   "rgba(97,162,254,.45)",
  badgeRingOn: "#FFFFFF",
  badgeShadow: "rgba(0,0,0,.5)",
  leader:      "rgba(151,190,255,.6)",
  leaderDot:   "#9BC4FF",

  chip:           "rgba(4,11,43,.92)",
  chipInk:        "#CFE1FF",
  labelInk:       "#CFE1FF",
  labelInkOrigin: "#E9B94A",
  font:           "600 12px Outfit, system-ui, sans-serif",

  /* Deep navy marks on the light badge. The engine maps luminance to alpha,
     so the dark parts of each source logo become opaque in this colour. */
  logoInk: [7, 22, 74],
};
