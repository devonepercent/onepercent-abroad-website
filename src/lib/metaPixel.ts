declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const LEADS_PIXEL_ID = "1270136815184632";
const HIRING_PIXEL_ID = "703668536011397";

const ensureFbq = () => {
  if (typeof window === "undefined") return;
  if (!window.fbq) {
    const fbq: any = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.version = "2.0";
    window.fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
};

// Re-initialising a live pixel re-fires PageView, and several pages call the
// init helpers defensively after App has already booted. Track what is up so
// those calls are no-ops rather than duplicate page views.
const initialised = new Set<string>();

const initPixel = (pixelId: string) => {
  if (typeof window === "undefined") return;
  ensureFbq();
  if (initialised.has(pixelId)) return;
  initialised.add(pixelId);
  window.fbq!("init", pixelId);
  // trackSingle, not track: a plain track would also hit any pixel already
  // initialised, giving the leads pixel a second PageView on hiring pages.
  window.fbq!("trackSingle", pixelId, "PageView");
};

export const initMetaPixel = () => initPixel(LEADS_PIXEL_ID);

export const initHiringPixel = () => initPixel(HIRING_PIXEL_ID);

export const trackMetaEvent = (
  eventName: string,
  data?: Record<string, any>,
  options?: { eventID?: string }
) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  if (options?.eventID) {
    window.fbq("track", eventName, data ?? {}, { eventID: options.eventID });
  } else {
    window.fbq("track", eventName, data);
  }
};

// --- Conversions API matching ---------------------------------------------
// The CRM later sends server-side events to Meta for leads that turn out to be
// Interested; these identifiers let Meta tie those back to the ad click.

const FBC_STORAGE_KEY = "op_fbc";

const readCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// Save a landing ?fbclid= as an fbc value, for when the Pixel's own _fbc
// cookie isn't there (blocked, or not yet written) by the time the form submits.
export const captureFbclid = () => {
  if (typeof window === "undefined") return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) localStorage.setItem(FBC_STORAGE_KEY, `fb.1.${Date.now()}.${fbclid}`);
  } catch {
    // Storage unavailable (private mode etc.) — the _fbc cookie is still tried.
  }
};

export const getMetaMatchData = () => {
  let storedFbc: string | null = null;
  try {
    storedFbc = localStorage.getItem(FBC_STORAGE_KEY);
  } catch {
    // ignore
  }
  return {
    fbc: readCookie("_fbc") || storedFbc || null,
    fbp: readCookie("_fbp"),
    client_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
  };
};

