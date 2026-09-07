import { describe, it, expect } from "vitest";
import { DEMO_ADDONS } from "./wink-demo";
import {
  availableQuantity,
  recommendations,
  personalization,
  deliveryRequirements,
} from "./wink-addons";
import { addAddonLine, validateAddonCart } from "./wink-addon-cart";
import { normalizePhone } from "./wink-shop";

describe("isolated demo fixtures", () => {
  it("labels every synthetic SKU and shows three curated recommendations", () => {
    expect(
      DEMO_ADDONS.items.every(
        (a) =>
          a.id.startsWith("demo-") &&
          a.sku.startsWith("DEMO-") &&
          !a.images.length,
      ),
    ).toBe(true);
    expect(
      recommendations(DEMO_ADDONS, { product_id: "air16" }).map((a) => a.id),
    ).toEqual(["demo-bear", "demo-card", "demo-bunny"]);
    expect(normalizePhone("+7 000 000-00-00")).toBeTruthy();
  });
  it("requires the card text and supports an independently validated bundle", () => {
    const bundle = DEMO_ADDONS.items.find((a) => a.id === "demo-soft-touch")!;
    expect(() => personalization(bundle, {})).toThrow();
    const lines = addAddonLine(
      [],
      bundle,
      DEMO_ADDONS,
      { text: "Тест" },
      "STANDALONE",
    );
    expect(() => validateAddonCart(lines, DEMO_ADDONS)).not.toThrow();
    expect(lines[0].unitPriceMinor).toBe(169000);
    expect(availableQuantity(bundle, DEMO_ADDONS.items)).toBe(10);
  });
  it("retains production-time and oversized-delivery checks", () => {
    expect(
      deliveryRequirements(
        [{ product_id: "demo-handmade" }, { product_id: "demo-big-hug" }],
        DEMO_ADDONS.items,
      ),
    ).toMatchObject({ days: 3 });
    const a = DEMO_ADDONS.items.find((a) => a.id === "demo-big-hug")!;
    const lines = addAddonLine([], a, DEMO_ADDONS, {}, "STANDALONE");
    lines[0].qty = 2;
    expect(() => validateAddonCart(lines, DEMO_ADDONS)).toThrow();
  });
});
