export const WINK_FINDER_WEIGHTS = {
  recipientMatch: 25,
  occasionMatch: 30,
  vibeMatch: 20,
  budgetFit: 15,
  bestseller: 5,
  inStock: 10,
  slotRisk: -20,
} as const;

export type FinderSignals = {
  recipientMatch: number;
  occasionMatch: number;
  vibeMatch: number;
  budgetFit: number;
  bestseller: number | boolean;
  inStock: number | boolean;
  slotRisk: number;
};

export type FinderCandidate<T> = {
  item: T;
  signals: FinderSignals;
};

export type RankedFinderCandidate<T> = FinderCandidate<T> & {
  score: number;
};

function signal(value: number | boolean) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Canonical WINK Finder formula from the product engineering specification.
 * Match values are normalized signals in the 0..1 range.
 * Availability inputs must come from real backend state; callers should not
 * manufacture stock or delivery capacity just to influence ranking.
 */
export function scoreFinderSignals(signals: FinderSignals) {
  return (
    signal(signals.recipientMatch) * WINK_FINDER_WEIGHTS.recipientMatch +
    signal(signals.occasionMatch) * WINK_FINDER_WEIGHTS.occasionMatch +
    signal(signals.vibeMatch) * WINK_FINDER_WEIGHTS.vibeMatch +
    signal(signals.budgetFit) * WINK_FINDER_WEIGHTS.budgetFit +
    signal(signals.bestseller) * WINK_FINDER_WEIGHTS.bestseller +
    signal(signals.inStock) * WINK_FINDER_WEIGHTS.inStock +
    signal(signals.slotRisk) * WINK_FINDER_WEIGHTS.slotRisk
  );
}

/** Returns the curated top three. Stable input order is used as the tie-breaker. */
export function rankFinderCandidates<T>(candidates: readonly FinderCandidate<T>[], limit = 3): RankedFinderCandidate<T>[] {
  const safeLimit = Math.max(0, Math.min(3, Math.trunc(limit)));
  return candidates
    .map((candidate, index) => ({ ...candidate, score: scoreFinderSignals(candidate.signals), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, safeLimit)
    .map(({ index: _index, ...candidate }) => candidate);
}
