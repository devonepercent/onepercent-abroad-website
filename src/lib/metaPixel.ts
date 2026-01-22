declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const DEFAULT_PIXEL_ID = "703668536011397";

const getPixelId = () => import.meta.env.VITE_META_PIXEL_ID as string | undefined;

export const initMetaPixel = () => {
  if (typeof window === "undefined") return;
  const pixelId = getPixelId() || DEFAULT_PIXEL_ID;
  if (!pixelId) return;

  if (!window.fbq) {
    // Minimal, safe fbq implementation that matches Meta's API shape
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

  window.fbq!("init", pixelId);
  window.fbq!("track", "PageView");
};

export const trackMetaEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  window.fbq("track", eventName, data);
};

