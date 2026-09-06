import { describe, expect, it } from "vitest";
import {
  bowsAddonFor,
  findComposition,
  validatePersonalization,
  WINK_ACTIVE_ADDONS,
  WINK_COMPOSITIONS,
  WINK_PALETTES,
  WINK_PLANNED_NOT_FOR_SALE,
} from "./wink-domain";

describe("WINK launch catalog", () => {
  it("keeps exactly 6 public families and 14 production compositions", () => {
    expect(WINK_COMPOSITIONS).toHaveLength(14);
    expect(new Set(WINK_COMPOSITIONS.map((item) => item.family))).toEqual(
      new Set(["AIR", "BIRTHDAY", "LOVE", "HEARTS", "MESSAGE", "BABY REVEAL"]),
    );
  });

  it("keeps the approved eight v4 palettes", () => {
    expect(WINK_PALETTES).toEqual([
      "MILK",
      "PINK_MILK",
      "PINK_CHROME",
      "BLACK_GOLD",
      "NUDE_GOLD",
      "BLACK_CHROME",
      "FROST",
      "CHERRY_MILK",
    ]);
  });

  it("keeps direct reference prices in integer minor units", () => {
    expect(findComposition("air16")?.directPriceMinor).toBe(349000);
    expect(findComposition("birthday30-2")?.directPriceMinor).toBe(729000);
    expect(findComposition("message16")?.directPriceMinor).toBe(509000);
    expect(findComposition("baby-reveal-solo")?.directPriceMinor).toBe(339000);
  });
});

describe("personalization validation", () => {
  it("requires exactly the production digit count for BIRTHDAY", () => {
    const one = findComposition("birthday16-1")!;
    const two = findComposition("birthday30-2")!;
    expect(validatePersonalization(one, { number: "5" })).toEqual([]);
    expect(validatePersonalization(one, { number: "25" })).toContain("number_must_have_1_digits");
    expect(validatePersonalization(two, { number: "25" })).toEqual([]);
    expect(validatePersonalization(two, { number: "5" })).toContain("number_must_have_2_digits");
  });

  it("requires MESSAGE text and caps it at 40 chars / three lines", () => {
    const message = findComposition("message16")!;
    expect(validatePersonalization(message, { inscription: "Ане\n25" })).toEqual([]);
    expect(validatePersonalization(message, { inscription: "" })).toContain("inscription_required");
    expect(validatePersonalization(message, { inscription: "x".repeat(41) })).toContain("inscription_too_long");
    expect(validatePersonalization(message, { inscription: "1\n2\n3\n4" })).toContain("inscription_too_many_lines");
  });

  it("requires the secret result for BABY REVEAL", () => {
    const reveal = findComposition("baby-reveal16")!;
    expect(validatePersonalization(reveal, { revealResult: "girl" })).toEqual([]);
    expect(validatePersonalization(reveal, {})).toContain("reveal_result_required");
  });
});

describe("launch addons", () => {
  it("allows only the tested BOWS options", () => {
    expect(WINK_ACTIVE_ADDONS).toEqual(["BOWS_16", "BOWS_30"]);
    expect(WINK_PLANNED_NOT_FOR_SALE).toEqual(["PHOTOS", "BUNNY"]);
  });

  it("prices bows by the 16/30 latex base and excludes LOVE", () => {
    expect(bowsAddonFor(findComposition("air16")!)).toEqual({ code: "BOWS_16", count: 8, priceDeltaMinor: 40000 });
    expect(bowsAddonFor(findComposition("message30")!)).toEqual({ code: "BOWS_30", count: 14, priceDeltaMinor: 60000 });
    expect(bowsAddonFor(findComposition("love16")!)).toBeNull();
  });
});
