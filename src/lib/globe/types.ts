/* Palette + shape contract for the globe engine. Every colour the renderer
   draws comes from here, so the same engine serves the light standalone page
   and the dark site section without a fork. */
export interface GlobeTheme {
  /* sphere */
  ocean: string;
  land: string;
  graticule: string;
  rim: string;
  /* Sphere lighting. On a white sphere this multiplies a warm shadow in; on a
     navy one multiply would crush it to black, so the mode is part of the
     theme rather than baked into the renderer. */
  shade: [string, string, string];
  shadeMode: GlobalCompositeOperation;
  groundShadow: string;
  groundShadowFade: string;
  /* arcs */
  arc: string;
  arcHot: string;
  arcHead: string;
  arcHeadHot: string;
  /* place markers */
  marker: string;
  markerHot: string;
  markerRing: string;
  markerHalo: string;
  origin: string;
  originRing: string;
  originHalo: string;
  /* university badges */
  badge: string;
  badgeRing: string;
  badgeRingOn: string;
  badgeShadow: string;
  leader: string;
  leaderDot: string;
  /* text */
  chip: string;
  chipInk: string;
  labelInk: string;
  labelInkOrigin: string;
  font: string;
  /* logos are recoloured to this RGB triple */
  logoInk: [number, number, number];
}

export interface MountOpts {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  theme: GlobeTheme;
  /** Fires once, the first time the user rotates it — used to retire the hint. */
  onFirstDrag?: () => void;
  /** Where the university SVGs live. Defaults to /uni-logos/. */
  assetBase?: string;
}

export interface GlobePlace {
  name: string;
  city: string;
  origin: boolean;
}

export interface GlobeHandle {
  /** Highlight a route + its marker, by place name. */
  setHot(name: string, on: boolean): void;
  /** Ease the globe round to face a place, by name. */
  flyToName(name: string): void;
  places: GlobePlace[];
  destroy(): void;
}
