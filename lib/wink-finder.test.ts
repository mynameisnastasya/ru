import { describe, expect, it } from "vitest";
import { rankFinderCandidates, scoreFinderSignals, WINK_FINDER_WEIGHTS } from "./wink-finder";

const neutral = {
  recipientMatch: 0,
  occasionMatch: 0,
  vibeMatch: 0,
  budgetFit: 0,
  bestseller: false,
  inStock: false,
  slotRisk: 0,
};

describe("WINK Finder scoring", () => {
  it("keeps the engineering-spec weights exactly", () => {
    expect(WINK_FINDER_WEIGHTS).toEqual({
      recipientMatch: 25,
      occasionMatch: 30,
      vibeMatch: 20,
      budgetFit: 15,
      bestseller: 5,
      inStock: 10,
      slotRisk: -20,
    });
  });

  it("applies positive signals and subtracts delivery slot risk", () => {
    expect(scoreFinderSignals({
      recipientMatch: 1,
      occasionMatch: 1,
      vibeMatch: 1,
      budgetFit: 1,
      bestseller: true,
      inStock: true,
      slotRisk: 0,
    })).toBe(105);

    expect(scoreFinderSignals({
      recipientMatch: 1,
      occasionMatch: 1,
      vibeMatch: 1,
      budgetFit: 1,
      bestseller: true,
      inStock: true,
      slotRisk: 1,
    })).toBe(85);
  });

  it("clamps bad signal values instead of letting them distort ranking", () => {
    expect(scoreFinderSignals({ ...neutral, occasionMatch: 8, slotRisk: -3 })).toBe(30);
    expect(scoreFinderSignals({ ...neutral, occasionMatch: Number.NaN })).toBe(0);
  });

  it("returns no more than three curated recommendations", () => {
    const ranked = rankFinderCandidates([
      { item: "A", signals: { ...neutral, occasionMatch: 1 } },
      { item: "B", signals: { ...neutral, recipientMatch: 1 } },
      { item: "C", signals: { ...neutral, vibeMatch: 1 } },
      { item: "D", signals: { ...neutral, budgetFit: 1 } },
      { item: "E", signals: { ...neutral, bestseller: true } },
    ]);
    expect(ranked.map((entry) => entry.item)).toEqual(["A", "B", "C"]);
    expect(ranked).toHaveLength(3);
  });

  it("uses input order as a stable tie-breaker", () => {
    const ranked = rankFinderCandidates([
      { item: "first", signals: neutral },
      { item: "second", signals: neutral },
      { item: "third", signals: neutral },
    ]);
    expect(ranked.map((entry) => entry.item)).toEqual(["first", "second", "third"]);
  });
});
