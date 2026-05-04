import { formatNumber } from "../../lib/format.js";

/**
 * Shows the character's M+ score vs the EU Keystone Hero 1% title cutoff.
 * Displays both numbers and a clear above/below indicator.
 */
export function TitleCutoffIndicator({
	yourScore,
	cutoff,
}: {
	yourScore: number;
	cutoff: number;
}) {
	const isAbove = yourScore >= cutoff;
	const diff = Math.abs(yourScore - cutoff);
	const indicator = isAbove ? "▲ Above" : "▼ Below";

	return (
		<div className="title-cutoff">
			<span className="cutoff-label">Umbral Champion title cutoff — EU top 1%</span>
			<span className="cutoff-scores">
				{formatNumber(yourScore)} / {formatNumber(cutoff)}
			</span>
			<span
				className={`cutoff-indicator ${isAbove ? "above" : "below"}`}
				aria-label={`${indicator} cutoff by ${formatNumber(diff)}`}
			>
				{indicator} by {formatNumber(diff)}
			</span>
		</div>
	);
}
