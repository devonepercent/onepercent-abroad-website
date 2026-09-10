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

export const trackMetaEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  window.fbq("track", eventName, data);
};

