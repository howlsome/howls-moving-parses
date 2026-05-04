import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./styles.css";
import App from "./App.js";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
	<StrictMode>
		<App />
	</StrictMode>,
);

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("/howls-moving-parses/sw.js", { scope: "/howls-moving-parses/" })
			.catch((err) => console.warn("SW registration failed:", err));
	});
}
