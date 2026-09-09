import { describe, expect, it } from "vitest";
import { displayPrice, FALLBACK_CATALOG } from "./wink-shop";
import { recommendWinkMatch, type WinkMatchAnswers } from "./wink-match";

const answers: WinkMatchAnswers = {
  recipient: "friend",
  occasion: "any",
  space: "bedroom",
  mood: "choose",
  budget: "any",
};
const match = (patch: Partial<WinkMatchAnswers> = {}) =>
  recommendWinkMatch(FALLBACK_CATALOG.products, { ...answers, ...patch });

describe("WINK MATCH", () => {
  it("changes the actual recommended volume with the room", () => {
    expect(match()[0].product.slug).toBe("air16");
    expect(match({ space: "living" })[0].product.slug).toBe("air30");
    expect(match({ space: "venue" })[0].product.slug).toBe("air30");
    expect(match({ space: "unsure" })[0].product.slug).toBe("air16");
  });

  it("keeps the occasion ahead of a larger generic set", () => {
    expect(
      match({ occasion: "birthday", space: "venue", budget: 7500 }).map(
        (r) => r.product.slug,
      ),
    ).toEqual(["birthday16-1", "birthday16-2"]);
    expect(
      match({ occasion: "love", space: "bedroom" }).every((r) =>
        ["LOVE", "HEARTS"].includes(r.product.name),
      ),
    ).toBe(true);
  });

  it("never exceeds the composition budget, including at the exact boundary", () => {
    for (const occasion of ["any", "birthday", "love", "baby"] as const) {
      for (const space of ["bedroom", "living", "venue", "unsure"] as const) {
        for (const budget of [5000, 7500] as const) {
          const results = match({ occasion, space, budget });
          expect(results.length).toBeLessThanOrEqual(2);
          expect(
            results.every((r) => r.product.base_price_minor <= budget * 100),
          ).toBe(true);
        }
      }
    }
    expect(match({ space: "venue", budget: 7500 })[0].product.slug).toBe(
      "air30",
    );
    expect(match({ space: "venue", budget: 5000 })[0].product.slug).toBe(
      "air16",
    );
  });

  it("keeps BABY strict and uses SOLO when the budget or room is compact", () => {
    expect(
      match({ occasion: "baby", budget: 5000 }).map((r) => r.product.slug),
    ).toEqual(["baby-reveal-solo"]);
    expect(match({ occasion: "baby", space: "bedroom" })[0].product.slug).toBe(
      "baby-reveal-solo",
    );
    const results = match({
      occasion: "baby",
      space: "venue",
      mood: "BLACK_CHROME",
    });
    expect(results[0].product.slug).toBe("baby-reveal16");
    expect(
      results.every(
        (r) => r.product.name === "BABY REVEAL" && r.palette === "MILK",
      ),
    ).toBe(true);
    expect(match().some((r) => r.product.name === "BABY REVEAL")).toBe(false);
  });

  it("chooses a safe palette without using gender as a colour rule", () => {
    expect(match({ recipient: "him" })[0].palette).toBe("MILK");
    expect(match({ recipient: "her" })[0].palette).toBe("MILK");
    expect(
      match({ occasion: "love" }).find((r) => r.product.name === "LOVE")
        ?.palette,
    ).toBe("PINK_MILK");
    expect(match({ mood: "PINK_CHROME" })[0].palette).toBe("PINK_CHROME");
  });

  it("does not treat mono foil hearts as a mixed latex palette", () => {
    const hearts = match({
      occasion: "love",
      budget: 5000,
      mood: "PINK_CHROME",
    })[0];
    expect(hearts.product.slug).toBe("hearts7");
    expect(hearts.palette).toBe("MILK");
    expect(hearts.reason).toContain("одного цвета");
  });

  it("respects the supplied catalogue price and palette support", () => {
    const air = FALLBACK_CATALOG.products[0];
    expect(
      recommendWinkMatch([{ ...air, base_price_minor: 500001 }], {
        ...answers,
        budget: 5000,
      }),
    ).toEqual([]);
    const product = {
      ...air,
      variants: [
        {
          id: "v",
          sku: "v",
          palette_id: "MILK",
          price_delta_minor: 0,
          config: {},
        },
      ],
    };
    expect(
      recommendWinkMatch([product], { ...answers, mood: "PINK_CHROME" })[0]
        .palette,
    ).toBe("MILK");
  });

  it("returns no invented products or duplicate recommendations", () => {
    expect(recommendWinkMatch([], answers)).toEqual([]);
    const air = FALLBACK_CATALOG.products[0];
    expect(
      recommendWinkMatch([air, air, { ...air, slug: "unapproved" }], answers),
    ).toHaveLength(1);
    expect(
      recommendWinkMatch([{ ...air, base_price_minor: NaN }], answers),
    ).toEqual([]);
  });

  it("uses the displayed v6 price without adding obsolete palette surcharges", () => {
    const air = FALLBACK_CATALOG.products[0];
    const product = {
      ...air,
      variants: [
        {
          id: "milk",
          sku: "milk",
          palette_id: "MILK",
          price_delta_minor: 0,
          config: {},
        },
        {
          id: "pink",
          sku: "pink",
          palette_id: "PINK_CHROME",
          price_delta_minor: 50001,
          config: {},
        },
      ],
    };
    expect(displayPrice(product, "PINK_CHROME")).toBe(450000);
    expect(
      recommendWinkMatch([product], {
        ...answers,
        mood: "PINK_CHROME",
        budget: 5000,
      }),
    ).toHaveLength(1);
    expect(
      recommendWinkMatch([product], { ...answers, mood: "MILK", budget: 5000 }),
    ).toHaveLength(1);
    expect(
      recommendWinkMatch([product], {
        ...answers,
        mood: "PINK_CHROME",
        budget: 7500,
      }),
    ).toHaveLength(1);
    expect(
      recommendWinkMatch([{ ...product, base_price_minor: 500001 }], {
        ...answers,
        mood: "PINK_CHROME",
        budget: 5000,
      }),
    ).toEqual([]);
  });

  it("does not infer room dimensions when the space is unknown", () => {
    const result = match({ space: "unsure" })[0];
    expect(result.reason).toContain("компактный формат");
    expect(result.reason).not.toMatch(/небольшой комнаты|просторной комнаты/);
  });

  it("explains the actual volume and does not imply availability or delivery", () => {
    const small = match()[0];
    const large = match({ space: "venue" })[0];
    expect(small.reason).toContain("16 латексных шаров");
    expect(large.reason).toContain("30 латексных шаров");
    expect(large.reason).toContain("просторной комнаты");
    expect(`${small.reason} ${large.reason}`).not.toMatch(
      /в наличии|доставим|сегодня|бесплатн/i,
    );
  });
});
