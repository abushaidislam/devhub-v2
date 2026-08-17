/**
 * Ephemeral in-memory handoff of a detected sample from the smart input
 * detector to a tool workspace (ADR-013).
 *
 * The sample lives only in module memory for the current browser session,
 * survives only client-side navigation, is consumed exactly once by the
 * matching tool, and is never written to localStorage, IndexedDB, URLs,
 * logs, analytics, or network requests.
 */
export type DetectionHandoff = {
	slug: string;
	sample: string;
};

let pendingHandoff: DetectionHandoff | null = null;

/** Stage a sample for the given tool slug. Empty values are ignored. */
export function setDetectionHandoff(slug: string, sample: string) {
	if (!slug || !sample) return;
	pendingHandoff = { slug, sample };
}

/**
 * Consume the pending sample for the given tool slug.
 * Returns null when nothing is staged or the slug does not match.
 * A successful read clears the staged sample so it cannot be reused.
 */
export function consumeDetectionHandoff(slug: string): string | null {
	if (!pendingHandoff || pendingHandoff.slug !== slug) return null;
	const { sample } = pendingHandoff;
	pendingHandoff = null;
	return sample;
}

/** Drop any staged sample. */
export function clearDetectionHandoff() {
	pendingHandoff = null;
}
