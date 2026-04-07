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

export const initMetaPixel = () => {
  if (typeof window === "undefined") return;
  ensureFbq();
  window.fbq!("init", LEADS_PIXEL_ID);
  window.fbq!("track", "PageView");
};

export const initHiringPixel = () => {
  if (typeof window === "undefined") return;
  ensureFbq();
  window.fbq!("init", HIRING_PIXEL_ID);
  window.fbq!("track", "PageView");
};

export const trackMetaEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  window.fbq("track", eventName, data);
};

