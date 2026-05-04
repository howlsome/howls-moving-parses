import { ALL_SPECS } from "../src/data/specs.js";

interface SpecEntry {
	spec: string;
	role: "main" | "offspec" | "inactive";
}

export interface CharacterConfig {
	name: string;
	realm: string;
	region: string;
	class: string;
	default: boolean;
	specs: SpecEntry[];
}

export interface CharactersConfig {
	characters: CharacterConfig[];
}

/**
 * Validates characters.config.json against all rules specified in the PRD.
 * Throws a descriptive error on the first violation found.
 *
 * @param config - Parsed characters.config.json content
 */
export function validateConfig(config: CharactersConfig): void {
	if (!config.characters || !Array.isArray(config.characters)) {
		throw new Error('characters.config.json must have a "characters" array');
	}
	if (config.characters.length === 0) {
		throw new Error('characters.config.json "characters" array must not be empty');
	}

	const defaultCount = config.characters.filter((c) => c.default).length;
	if (defaultCount === 0) {
		throw new Error('Exactly one character must have "default": true — none found');
	}
	if (defaultCount > 1) {
		throw new Error('Exactly one character must have "default": true — multiple found');
	}

	const knownClasses = new Set(ALL_SPECS.map((s) => s.className));
	const validRoles = new Set(["main", "offspec", "inactive"]);

	for (const char of config.characters) {
		const id = `Character "${char.name ?? "(unnamed)"}"`;

		for (const field of ["name", "realm", "region", "class", "specs"] as const) {
			if (char[field] === undefined || char[field] === null) {
				throw new Error(`${id}: missing required field "${field}"`);
			}
		}

		if (char.region !== "eu") {
			throw new Error(`${id}: "region" must be "eu", got "${char.region}"`);
		}

		if (!knownClasses.has(char.class)) {
			throw new Error(
				`${id}: unknown class "${char.class}". Valid values: ${[...knownClasses].join(", ")}`,
			);
		}

		if (!Array.isArray(char.specs) || char.specs.length === 0) {
			throw new Error(`${id}: "specs" must be a non-empty array`);
		}

		const seenSpecs = new Set<string>();
		for (const specEntry of char.specs) {
			if (!specEntry.spec) {
				throw new Error(`${id}: a specs entry is missing the "spec" field`);
			}
			if (!specEntry.role) {
				throw new Error(`${id}: spec "${specEntry.spec}" is missing the "role" field`);
			}
			if (!validRoles.has(specEntry.role)) {
				throw new Error(
					`${id}: spec "${specEntry.spec}" has invalid role "${specEntry.role}". Must be "main", "offspec", or "inactive"`,
				);
			}

			if (seenSpecs.has(specEntry.spec)) {
				throw new Error(`${id}: duplicate spec "${specEntry.spec}" in specs array`);
			}
			seenSpecs.add(specEntry.spec);

			const validSpec = ALL_SPECS.find(
				(s) => s.specName === specEntry.spec && s.className === char.class,
			);
			if (!validSpec) {
				throw new Error(`${id}: "${specEntry.spec}" is not a valid spec for class "${char.class}"`);
			}
		}

		const mainEntries = char.specs.filter((s) => s.role === "main");
		if (mainEntries.length === 0) {
			throw new Error(`${id}: must have exactly one spec with role "main" — none found`);
		}
		if (mainEntries.length > 1) {
			throw new Error(`${id}: must have exactly one spec with role "main" — multiple found`);
		}

		const activeSpecs = char.specs.filter((s) => s.role !== "inactive");
		if (activeSpecs.length === 0) {
			throw new Error(`${id}: has only "inactive" specs. At least one "main" spec is required.`);
		}
	}
}
