import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
