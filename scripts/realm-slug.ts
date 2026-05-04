/**
 * Converts a display realm name (e.g. "Twisting Nether") into the lowercase
 * hyphenated slug WarcraftLogs expects (e.g. "twisting-nether").
 *
 * Rules applied in order:
 * 1. NFD Unicode normalisation + strip combining marks (handles accented chars)
 * 2. Lowercase
 * 3. Strip apostrophes
 * 4. Replace non-alphanumeric runs with hyphens
 * 5. Trim leading/trailing hyphens
 */
export function toRealmSlug(displayName: string): string {
	return (
		displayName
			.normalize("NFD")
			// Strip Unicode combining diacritical marks (U+0300–U+036F)
			// biome-ignore lint/suspicious/noMisleadingCharacterClass: intentional combining char range
			.replace(/[̀-ͯ]/g, "")
			.toLowerCase()
			.replace(/['']/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "")
	);
}
