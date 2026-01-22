declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const getPixelId = () => import.meta.env.VITE_META_PIXEL_ID as string | undefined;

export const initMetaPixel = () => {
  if (typeof window === "undefined") return;
  const pixelId = getPixelId();
  if (!pixelId) return;

  if (window.fbq) {
    return;
  }

  // Meta Pixel base code
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  !(function (f: any, b, e, v, n?, t?, s?) {
    if (f.fbq) return;
    n = f.fbq = function () {
      // eslint-disable-next-line prefer-rest-params
      (n!.callMethod ? n!.callMethod : n!.queue.push).apply(n, arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    s = b.getElementsByTagName(e)[0];
    s.parentNode!.insertBefore(t, s);
  })(window, document, "script");

  window.fbq!("init", pixelId);
  window.fbq!("track", "PageView");
};

export const trackMetaEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  window.fbq("track", eventName, data);
};

