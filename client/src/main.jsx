import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./i18n"; // Initialize i18n
import { CurrencyProvider } from "./context/CurrencyContext";
import { CompareProvider } from "./context/CompareContext";
import { QueryProvider } from "./context/QueryProvider";

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <BrowserRouter>
      <QueryProvider>
        <CurrencyProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </CurrencyProvider>
      </QueryProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
