import { describe, it, expect, vi, afterEach } from "vitest";
import {
  Addon,
  AddonCatalog,
  availableQuantity,
  recommendations,
  personalization,
  addonPrice,
  deliveryRequirements,
  searchAddons,
} from "./wink-addons";
import { ADDON_DEFAULTS } from "./wink-addon-defaults";
import {
  addAddonLine,
  bundleConflicts,
  cartAddonIds,
  validateAddonCart,
} from "./wink-addon-cart";
import { parseCart } from "./wink-shop";
import {
  publicAddon,
  requireCatalogRole,
  requireFinanceRole,
  validateAddon,
} from "../backend/addons/catalog";
import { addonPackingLines } from "../backend/addons/orders";
function toy(id: string, props: Partial<Addon> = {}): Addon {
  return {
    ...ADDON_DEFAULTS,
    id,
    sku: id.toUpperCase(),
    slug: id,
    name: id,
    short_name: id,
    status: "ACTIVE",
    price_minor: 149000,
    show_in_catalog: true,
    allow_standalone: true,
    allow_as_addon: true,
    allow_in_bundles: true,
    available_quantity: 3,
    stock_status: "IN_STOCK",
    ...props,
  };
}
function catalog(items: Addon[], manual?: string[]): AddonCatalog {
  return {
    version: 1,
    items,
    checkout_enabled: true,
    recommendations: manual ? { air16: manual } : {},
  };
}
const ctx = {
  product_id: "air16",
  category: "AIR",
  palette: "MILK",
  occasion: "birthday",
};
afterEach(() => vi.unstubAllGlobals());
describe("curated recommendations", () => {
  it("manual order wins over a bestseller, and stays directional", () => {
    const a = toy("aa"),
      b = toy("bb", { bestseller: true });
    const c = catalog([a, b], ["aa"]);
    expect(recommendations(c, ctx).map((a) => a.id)).toEqual(["aa"]);
    expect(c.recommendations.bb).toBeUndefined();
  });
  it("replaces sold-out assignments with the next compatible product", () => {
    const c = catalog(
      [
        toy("aa", { available_quantity: 0 }),
        toy("bb"),
        toy("cc", { compatible_palettes: ["BLACK_CHROME"] }),
      ],
      ["aa"],
    );
    expect(recommendations(c, ctx).map((a) => a.id)).toEqual(["bb"]);
  });
  it("never exceeds three on product or two in cart; excludes selected products", () => {
    const c = catalog(["aa", "bb", "cc", "dd"].map((id) => toy(id)));
    expect(recommendations(c, ctx)).toHaveLength(3);
    expect(recommendations(c, ctx, ["aa"], 2).map((a) => a.id)).toEqual([
      "bb",
      "cc",
    ]);
  });
  it("an explicitly cleared manual list remains empty after refresh", () =>
    expect(recommendations(catalog([toy("aa")], []), ctx)).toEqual([]));
  it("filters restricted audiences and price ranges rather than guessing context", () => {
    expect(
      recommendations(
        catalog([toy("aa", { compatible_audience: ["child"] })]),
        ctx,
      ),
    ).toEqual([]);
    expect(
      recommendations(
        catalog([toy("aa", { compatible_budget_from: 1000000 })]),
        { ...ctx, budget_minor: 450000 },
      ),
    ).toEqual([]);
  });
  it("finds Russian and English toy synonyms without new product-type code", () => {
    const bear = toy("bear", { search_keywords: ["мишка", "медведь", "bear"] });
    for (const q of ["мишка", "медведь", "BEAR"])
      expect(searchAddons([bear], q)).toEqual([bear]);
    expect(
      searchAddons(
        [toy("candle", { subtype: "CANDLE", search_keywords: ["свеча"] })],
        "свеча",
      ),
    ).toHaveLength(1);
  });
});
describe("bundle and cart integrity", () => {
  const bear = toy("bear"),
    card = toy("card", { available_quantity: 40, price_minor: 30000 });
  const bundle = toy("bundle", {
    product_type: "BUNDLE",
    price_minor: 170000,
    components: [
      { product_id: "bear", quantity: 1 },
      { product_id: "card", quantity: 1 },
    ],
  });
  it("derives bundle stock from actual components, including component quantities", () => {
    expect(availableQuantity(bundle, [bear, card, bundle])).toBe(3);
    expect(
      availableQuantity(
        { ...bundle, components: [{ product_id: "bear", quantity: 2 }] },
        [bear],
      ),
    ).toBe(1);
    expect(
      availableQuantity(bundle, [{ ...bear, available_quantity: 0 }, card]),
    ).toBe(0);
  });
  it("a cycle or hidden component can never create fictitious stock", () => {
    expect(
      availableQuantity(
        { ...bundle, components: [{ product_id: "bundle", quantity: 1 }] },
        [bundle],
      ),
    ).toBe(0);
    expect(
      availableQuantity(bundle, [{ ...bear, status: "HIDDEN" }, card]),
    ).toBe(0);
  });
  it("replaces an individual toy with a bundle only after confirmation", () => {
    const c = catalog([bear, card, bundle]);
    const lines = addAddonLine([], bear, c, {}, "ADDON", "air16");
    expect(bundleConflicts(bundle, lines)).toHaveLength(1);
    expect(() =>
      addAddonLine(lines, bundle, c, {}, "ADDON", "air16"),
    ).toThrow();
    const next = addAddonLine(lines, bundle, c, {}, "ADDON", "air16", true);
    expect(next).toHaveLength(1);
    expect(next[0].addon?.purchase_context).toBe("BUNDLE");
    expect(cartAddonIds(next)).toEqual(["bundle", "bear", "card"]);
    expect(parseCart(JSON.stringify(next))).toEqual(next);
  });
  it("adding to a cart does not change inventory or reserve units", () => {
    const c = catalog([bear]);
    addAddonLine([], bear, c, {}, "STANDALONE");
    expect(bear.available_quantity).toBe(3);
  });
  it("checks aggregate demand against stock instead of validating each line alone", () => {
    const c = catalog([bear]);
    const l = addAddonLine([], bear, c, {}, "STANDALONE")[0];
    expect(() => validateAddonCart([{ ...l, qty: 4 }], c)).toThrow("меньше");
  });
  it("blocks addons if the server has not enabled the checkout hooks", () =>
    expect(() =>
      addAddonLine([], bear, { ...catalog([bear]), checkout_enabled: false }),
    ).toThrow("недоступен"));
});
describe("personalization and immutable order content", () => {
  const handmade = toy("handmade", {
    personalization_enabled: true,
    personalization_price_minor: 60000,
    personalization_fields: [
      { key: "name", label: "Имя", required: true, max_length: 12 },
      {
        key: "embroidery",
        label: "Нить",
        required: false,
        max_length: 20,
        options: ["blush", "milk"],
      },
    ],
    stock_type: "MADE_TO_ORDER",
    production_days: 3,
  });
  it("requires a name, rejects long names and non-approved embroidery", () => {
    expect(() => personalization(handmade, {})).toThrow("Имя");
    expect(() => personalization(handmade, { name: "x".repeat(13) })).toThrow(
      "12",
    );
    expect(() =>
      personalization(handmade, { name: "Sofia", embroidery: "neon" }),
    ).toThrow("вариант");
    expect(addonPrice(handmade, { name: "Sofia", embroidery: "blush" })).toBe(
      209000,
    );
  });
  it("captures personalization, SKU and price without references to editable settings", () => {
    const input = { name: "Sofia", embroidery: "blush" };
    const l = addAddonLine(
      [],
      handmade,
      catalog([handmade]),
      input,
      "STANDALONE",
    )[0];
    input.name = "Changed";
    const updated = { ...handmade, name: "New name", price_minor: 999000 };
    expect(l.addon?.personalization.name).toBe("Sofia");
    expect(l.unitPriceMinor).toBe(209000);
    expect(l.name).not.toBe(updated.name);
  });
  it("propagates handmade dates and oversized shipping through a bundle", () => {
    const b = toy("bundle", {
      product_type: "BUNDLE",
      components: [{ product_id: "handmade", quantity: 1 }],
    });
    expect(
      deliveryRequirements(
        [{ product_id: "bundle" }],
        [b, { ...handmade, delivery_class: "OVERSIZED" }],
      ),
    ).toEqual({ days: 3, delivery_class: "OVERSIZED" });
  });
  it("preserves all items and fields in the operational list", () =>
    expect(
      addonPackingLines([
        {
          sku_snapshot: "SOFT-001",
          name_snapshot: "Mini Bear",
          quantity: 1,
          personalization_snapshot: { name: "Sofia" },
        },
      ]).join("\n"),
    ).toContain("name: Sofia"));
});
describe("admin and finance boundaries", () => {
  it("uses an explicit public projection that excludes finance and supplier metadata", () => {
    const p = publicAddon({
      id: "aa",
      sku: "AA",
      slug: "aa",
      name: "Bear",
      product_type: "ADDON",
      status: "ACTIVE",
      price_minor: 149000,
      stock_type: "TRACKED",
      available_quantity: 3,
      public_data: {
        short_name: "Bear",
        cost_price_minor: 52000,
        supplier: "Private",
        gross_margin: 65,
      },
      cost_price_minor: 52000,
    });
    expect(JSON.stringify(p)).not.toMatch(
      /52000|Private|gross_margin|cost_price_minor/,
    );
  });
  it("picker cannot read catalog and manager cannot read finance", () => {
    expect(() => requireCatalogRole({ id: "1", role: "PICKER" })).toThrow(
      "forbidden",
    );
    expect(() => requireFinanceRole({ id: "1", role: "MANAGER" })).toThrow(
      "forbidden",
    );
    expect(() => requireFinanceRole({ id: "1", role: "OWNER" })).not.toThrow();
  });
  it("cannot publish an unpriced toy or an unapproved photo-less toy", () => {
    expect(() => validateAddon(toy("aa", { price_minor: null }))).toThrow(
      "цену",
    );
    expect(() => validateAddon(toy("aa", { subtype: "SOFT_TOY" }))).toThrow(
      "фото",
    );
  });
});
