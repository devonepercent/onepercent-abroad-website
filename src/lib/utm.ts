// Ad tags from the landing URL, kept so a lead is still attributed after the
// visitor browses to other pages (in-app links drop the query string). The CRM
// reads these to label the lead's channel, e.g. utm_medium=collab +
// utm_campaign=<slug> becomes "Collab: <name>".
//
// Google Ads adds utm_term / utm_content / utm_matchtype / utm_device through the
// account's tracking template, and gclid (the click id) automatically.

const UTM_STORAGE_KEY = "op_utm";
const UTM_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const UTM_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_adset", "utm_ad",
  "utm_term", "utm_content", "utm_matchtype", "utm_device", "gclid",
] as const;

type Utms = Record<(typeof UTM_KEYS)[number], string | null>;

const readUtms = (search: string): Utms => {
  const params = new URLSearchParams(search);
  return Object.fromEntries(UTM_KEYS.map(k => [k, params.get(k)?.trim() || null])) as Utms;
};

const hasAny = (utms: Utms) => Object.values(utms).some(Boolean);

// Saved as { utms, savedAt }. Older visits saved the bare tag object with no
// date; those are still read, and expire the next time a tagged link is opened.
const readStored = (): Utms | null => {
  try {
    const raw = localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "savedAt" in parsed) {
      if (Date.now() - Number(parsed.savedAt) > UTM_TTL_MS) {
        localStorage.removeItem(UTM_STORAGE_KEY);
        return null;
      }
      return parsed.utms as Utms;
    }
    return parsed as Utms;
  } catch {
    return null;
  }
};

// Last touch wins: a new tagged landing replaces the stored set as a whole, so
// tags from two different ads (say a Meta campaign and a Google gclid) are never
// mixed. A page with no tags leaves the saved set untouched.
export const captureUtms = () => {
  if (typeof window === "undefined") return;
  try {
    const utms = readUtms(window.location.search);
    if (hasAny(utms)) localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ utms, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private mode etc.) — getUtms still reads the URL.
  }
};

export const getUtms = (): Utms => {
  const fromUrl = readUtms(window.location.search);
  if (hasAny(fromUrl)) return fromUrl;
  const stored = readStored();
  // Only the known keys go out: the result is inserted as table columns.
  return stored ? (Object.fromEntries(UTM_KEYS.map(k => [k, stored[k] ?? null])) as Utms) : fromUrl;
};
