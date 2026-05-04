import type { MythicPlusData } from "../../types/snapshot.js";
import { Card } from "../primitives/Card.js";
import { EmptyState } from "../primitives/EmptyState.js";

/**
 * Renders the Mythic+ Score panel.
 *
 * Layout:
 * - Header row: "Mythic+ Score" left, coloured score + tier right
 * - Cutoff row: distance from the 1% title cutoff with traffic-light colouring
 *   Green (≥ +300): comfortably ahead
 *   Orange (-300 to +299): near the cutoff
 *   Red (< -300): clearly behind
 */
export function MythicScorePanel({ data }: { data: MythicPlusData | null }) {
	if (!data) {
		return (
			<Card>
				<Card.Header>Mythic+ Score</Card.Header>
				<Card.Body>
					<EmptyState message="No Mythic+ data available." />
				</Card.Body>
			</Card>
		);
	}

	const scoreDisplay = (
		<span className="header-score" style={{ color: data.scoreColor || undefined }}>
			{data.score.toLocaleString("en-GB")}
			<small className="header-score-tier"> {data.scoreTierLabel}</small>
		</span>
	);

	const showCutoff = data.titleCutoff.score > 0;
	const diff = data.score - data.titleCutoff.score;
	const cutoffClass = diff >= 300 ? "cutoff-ahead" : diff >= -300 ? "cutoff-near" : "cutoff-behind";
	const arrow = diff >= 0 ? "▲" : "▼";

	return (
		<Card>
			<Card.Header right={scoreDisplay}>Mythic+ Score</Card.Header>
			<Card.Body>
				{showCutoff && (
					<div className={`cutoff-row ${cutoffClass}`}>
						<span className="cutoff-row-label">Umbral Champion — 1% cutoff</span>
						<span className="cutoff-row-diff">
							{arrow} {Math.abs(diff).toFixed(1)} pts
						</span>
					</div>
				)}
			</Card.Body>
		</Card>
	);
}
