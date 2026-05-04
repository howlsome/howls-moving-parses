/**
 * Service worker for Howl's Moving Parses.
 *
 * Polls /howls-moving-parses/build-hash.json every 5 minutes. If the hash changes
 * since the last known value, posts a NEW_BUILD_AVAILABLE message to all open
 * clients. App.tsx listens for this and shows the dismissible banner.
 *
 * On activate, the current hash is read and stored as the baseline.
 * The module-level variable resets when the SW is killed (after ~30 seconds of
 * inactivity), so on next wake-up activate re-reads the hash as the new baseline.
 */

declare const self: ServiceWorkerGlobalScope;

const BUILD_HASH_URL = "/howls-moving-parses/build-hash.json";
const POLL_INTERVAL_MS = 300_000; // 5 minutes

let knownHash: string | null = null;

async function fetchCurrentHash(): Promise<string | null> {
	try {
		const res = await fetch(BUILD_HASH_URL, { cache: "no-store" });
		if (!res.ok) return null;
		const data = (await res.json()) as { hash: string };
		return data.hash ?? null;
	} catch {
		return null;
	}
}

async function checkForNewBuild() {
	const currentHash = await fetchCurrentHash();
	if (!currentHash) return;

	if (knownHash === null) {
		knownHash = currentHash;
		return;
	}

	if (currentHash !== knownHash) {
		knownHash = currentHash;
		const clients = await self.clients.matchAll({ type: "window" });
		for (const client of clients) {
			client.postMessage({ type: "NEW_BUILD_AVAILABLE" });
		}
	}
}

self.addEventListener("activate", (event) => {
	event.waitUntil(
		fetchCurrentHash().then((hash) => {
			knownHash = hash;
			setInterval(checkForNewBuild, POLL_INTERVAL_MS);
		}),
	);
});

self.addEventListener("install", () => {
	self.skipWaiting();
});
