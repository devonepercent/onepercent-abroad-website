import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureFbclid } from "./lib/metaPixel";
import { captureUtms } from "./lib/utm";

// Before React mounts, so the landing URL's query string is still intact.
captureFbclid();
captureUtms();

createRoot(document.getElementById("root")!).render(<App />);
