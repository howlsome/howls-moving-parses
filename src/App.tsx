import { useEffect, useState } from "react";
import { CharacterSelect } from "./components/chrome/CharacterSelect.js";
import { NewBuildBanner } from "./components/chrome/NewBuildBanner.js";
import { CharactersSummaryPanel } from "./components/panels/CharactersSummaryPanel.js";
import { LogPerformancePanel } from "./components/panels/LogPerformancePanel.js";
import { MythicPlusLeaderboardPanel } from "./components/panels/MythicPlusLeaderboardPanel.js";
import { MythicPlusMetaGearPanel } from "./components/panels/MythicPlusMetaGearPanel.js";
import { MythicScorePanel } from "./components/panels/MythicScorePanel.js";
import { RaidMetaGearPanel } from "./components/panels/RaidMetaGearPanel.js";
import { RecentRunsPanel } from "./components/panels/RecentRunsPanel.js";
import { AppStateProvider, useAppState } from "./contexts/AppStateContext.js";
import { ALL_SPECS } from "./data/specs.js";
import { formatDateUtc } from "./lib/format.js";
import type { CharacterData, Snapshot } from "./types/snapshot.js";

// Only App.tsx may import snapshot.json
import snapshotRaw from "./data/snapshot.json";

const snapshot = snapshotRaw as unknown as Snapshot;

function AppInner() {
	const { selectedCharacterName, setSelectedCharacter } = useAppState();

	const [newBuildVisible, setNewBuildVisible] = useState(false);

	useEffect(() => {
		if (!("serviceWorker" in navigator)) return;
		const handler = (event: MessageEvent) => {
			if ((event.data as { type: string })?.type === "NEW_BUILD_AVAILABLE") {
				setNewBuildVisible(true);
			}
		};
		navigator.serviceWorker.addEventListener("message", handler);
		return () => navigator.serviceWorker.removeEventListener("message", handler);
	}, []);

	const foundChar = snapshot.characters.find(
		(c: CharacterData) => c.name === selectedCharacterName,
	);
	const firstChar = snapshot.characters[0];
	if (!foundChar && !firstChar) throw new Error("No characters in snapshot");
	const character = (foundChar ?? firstChar) as CharacterData;

	// Always use main spec — no spec toggle/selector
	const specData = character.specs[character.mainSpecSlug];
	const specDef = ALL_SPECS.find((s) => s.specSlug === character.mainSpecSlug);
	const metaData = snapshot.specs[character.mainSpecSlug];

	function handleSelectCharacter(name: string) {
		const char = snapshot.characters.find((c: CharacterData) => c.name === name);
		if (char) setSelectedCharacter(char.name, char.mainSpecSlug);
	}

	return (
		<div className="page-wrap">
			<header className="site-header">
				<h1>Howl&apos;s Moving Parses</h1>
				<div className="header-right">
					<small className="updated-date">Updated: {formatDateUtc(snapshot.generatedAt)}</small>
					<CharacterSelect characters={snapshot.characters} />
				</div>
			</header>

			<NewBuildBanner
				visible={newBuildVisible}
				onRefresh={() => window.location.reload()}
				onDismiss={() => setNewBuildVisible(false)}
			/>

			<div className="character-bar">
				<div className="character-identity">
					<strong className="character-name">{character.name}</strong>
					<span className="character-meta">
						{specDef?.specName} {character.class}
					</span>
				</div>
				<CharactersSummaryPanel
					characters={snapshot.characters}
					generatedAt={snapshot.generatedAt}
					onSelectCharacter={handleSelectCharacter}
				/>
			</div>

			<main>
				<div className="grid">
					<section aria-label={`${character.name} — ${specData?.specName ?? ""}`}>
						<MythicScorePanel data={specData?.mythicPlus ?? null} />
						<RecentRunsPanel
							recentRuns={specData?.mythicPlus?.recentRuns ?? []}
							bestRuns={specData?.mythicPlus?.bestRuns ?? []}
						/>
						<LogPerformancePanel
							data={specData?.logs ?? null}
							metric={specDef?.role === "healer" ? "hps" : "dps"}
						/>
					</section>

					<section
						aria-label={`${specDef?.specName ?? ""} ${specDef?.classDisplayName ?? ""} meta`}
					>
						<MythicPlusLeaderboardPanel
							leaderboard={metaData?.mythicPlus.leaderboard ?? []}
							metric={specDef?.role === "healer" ? "hps" : "dps"}
						/>
						<MythicPlusMetaGearPanel trinkets={metaData?.mythicPlus.metaGear.trinkets ?? []} />
						<RaidMetaGearPanel trinkets={metaData?.raid.metaGear.trinkets ?? []} />
					</section>
				</div>
			</main>

			<footer className="site-footer">
				<small>Made with love by howlsome</small>
				<small className="footer-schedule">
					Auto-updates hourly 19:00–00:00 · every 6 hrs otherwise (BST)
				</small>
			</footer>
		</div>
	);
}

/** Root application component. Imports snapshot.json and provides context. */
export default function App() {
	const defaultChar =
		snapshot.characters.find((c: CharacterData) => c.isDefault) ??
		snapshot.characters[0] ??
		({ name: "", mainSpecSlug: "" } as CharacterData);

	return (
		<AppStateProvider
			defaultCharacterName={defaultChar.name}
			defaultCharacterMainSpecSlug={defaultChar.mainSpecSlug}
			defaultMetaSpecSlug={defaultChar.mainSpecSlug}
		>
			<AppInner />
		</AppStateProvider>
	);
}
