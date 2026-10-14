import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import PageLoader from "./components/PageLoader";
import "./styles/globals.css";

// Static fallback tags (for crawlers without JS) are replaced by each page's <Seo>.
document.querySelectorAll("[data-seo]").forEach((node) => node.remove());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<PageLoader className="min-h-screen" />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
