import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./context/ThemeContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

// ── Service Worker Registration ────────────────────────

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Handle SW update
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New version available — auto-activate
            newWorker.postMessage("SKIP_WAITING");
          }
        });
      });

      // Reload when new SW takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

      // Register background sync (if supported)
      if ("sync" in registration) {
        window.addEventListener("online", () => {
          (registration as any).sync.register("offline-sync").catch(() => {
            // Fallback: trigger manual sync via message
            navigator.serviceWorker.controller?.postMessage("TRIGGER_SYNC");
          });
        });
      }

      console.log("[SW] Registered successfully");
    } catch (error) {
      console.warn("[SW] Registration failed:", error);
    }
  });
}
