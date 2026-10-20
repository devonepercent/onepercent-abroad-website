// UTM tags from the landing URL, kept so a lead is still attributed after the
// visitor browses to other pages (in-app links drop the query string). The CRM
// reads these to label the lead's channel, e.g. utm_medium=collab +
// utm_campaign=<slug> becomes "Collab: <name>".

const UTM_STORAGE_KEY = "op_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_adset", "utm_ad"] as const;

type Utms = Record<(typeof UTM_KEYS)[number], string | null>;

const readUtms = (search: string): Utms => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(UTM_KEYS.map(k => [k, params.get(k)?.trim() || null])) as Utms;
};

// Last touch wins: a new tagged landing replaces the stored set as a whole, so
// tags from two different links are never mixed.
export const captureUtms = () => {
  if (typeof window === "undefined") return;
  try {
    const utms = readUtms(window.location.search);
    if (Object.values(utms).some(Boolean)) localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
  } catch {
    // Storage unavailable (private mode etc.) — getUtms still reads the URL.
  }
};

export const getUtms = (): Utms => {
  const fromUrl = readUtms(window.location.search);
  if (Object.values(fromUrl).some(Boolean)) return fromUrl;
  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) return { ...fromUrl, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return fromUrl;
};
