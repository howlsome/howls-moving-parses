import type { TalentData } from "../../types/snapshot.js";
import { Card } from "../primitives/Card.js";
import { EmptyState } from "../primitives/EmptyState.js";
import { ExternalLink } from "../primitives/ExternalLink.js";

/**
 * Renders the Talent Snapshot section: list of active talents and optional Wowhead link.
 */
export function TalentSnapshotPanel({ data }: { data: TalentData | null }) {
	if (!data || data.talents.length === 0) {
		return (
			<Card>
				<Card.Header>Talent Snapshot</Card.Header>
				<Card.Body>
					<EmptyState message="No talent data available." />
				</Card.Body>
			</Card>
		);
	}

	return (
		<Card>
			<Card.Header>Talent Snapshot</Card.Header>
			<Card.Body>
				<ol className="talent-list">
					{data.talents.map((talent) => (
						<li key={talent}>{talent}</li>
					))}
				</ol>
				{data.wowheadUrl && <ExternalLink href={data.wowheadUrl} label="View on Wowhead" />}
			</Card.Body>
		</Card>
	);
}
