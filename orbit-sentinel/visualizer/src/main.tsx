import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

console.log("[Orbit Sentinel] main.tsx loaded, mounting React...");
const root = document.getElementById("root");
console.log("[Orbit Sentinel] root element:", root);

try {
  ReactDOM.createRoot(root!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log("[Orbit Sentinel] React mounted successfully");
} catch (e) {
  console.error("[Orbit Sentinel] React mount failed:", e);
}
