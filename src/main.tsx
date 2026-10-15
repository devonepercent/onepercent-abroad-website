import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { captureFbclid } from "./lib/metaPixel";

// Before React mounts, so the landing URL's query string is still intact.
captureFbclid();

createRoot(document.getElementById("root")!).render(<App />);
